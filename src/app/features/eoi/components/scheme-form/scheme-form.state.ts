import { DestroyRef, Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, forkJoin, of, switchMap } from 'rxjs';
import { OtrFormService } from '../../../registration/services/otr-form.service';
import { OtrRegistrationService } from '../../../registration/services/otr-registration.service';
import { OtrDocument, OtrFormDef, OtrRecords, OtrStepValues } from '../../../registration/models/otr-api.model';
import { documentsFrom, formSteps, initialStepValues, stepFields } from '../../../registration/otr-form.util';
import { Step1OrgDetails, OfficerInCharge, Step3AuthorizedPerson, Step4BankDetails } from '../../../registration/models/otr-form.model';
import { StorageService } from '../../../../core/services/storage.service';
import { formatDateTime, formatInr } from '../../../../shared/utils';
import { StepperStep } from '../../../../shared/components/stepper/stepper.component';
import { EoiApplyService } from './eoi-apply.service';
import { EoiAnswerValue, EoiApplication, EoiApplyDocument, EoiCustomField, EoiPaymentFee } from './eoi-apply.model';
import {
  NoticeHeader,
  PaymentReturn,
  answerErrors,
  errorText,
  initialAnswers,
  noticeHeader,
  paymentModeText,
  paymentReturnFrom,
  pendingBeforeFees,
  postToGateway,
  splitApplyDocuments,
  toWizardDocuments
} from './eoi-apply.util';
import { EoiDocumentItem } from './scheme-form.model';
import { SchemeFormReceiptsService, SchemeReceiptData } from './scheme-form-receipts.service';
import { numberToIndianWords } from './scheme-form.util';

/** How long the processing-fee success screen stays up before the EMD step opens by itself. */
const PROC_FEE_SUCCESS_REDIRECT_MS = 2500;

/** How long the submission success screen stays up before the receipts page opens. */
const SUBMISSION_SUCCESS_REDIRECT_MS = 3000;

/** A payment RPP has not settled yet is checked again every 30 seconds, for up to 10 minutes. */
const PENDING_RECHECK_MS = 30_000;
const PENDING_RECHECKS = 20;

/** The backend's message for a payment the bank has not confirmed yet. */
const isAwaitingBank = (message: string) => /awaiting confirmation/i.test(message);

/** The declaration is ticked before the applicant leaves for the payment gateway; it is sent with Submit. */
const DECLARATION_KEY = (applicationId: number) => `eoi-apply-declaration-${applicationId}`;

/**
 * Component-scoped state and actions of the Apply for EOI wizard (provided by SchemeFormComponent and injected by
 * the step components). Everything comes from the applicant's application on the backend (`/api/eoi/apply`):
 * profile (copied from the OTR), answers, documents, the RPP fee payments and the submission.
 */
@Injectable()
export class SchemeFormState {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly otrFormService = inject(OtrFormService);
  private readonly receipts = inject(SchemeFormReceiptsService);
  private readonly storage = inject(StorageService);
  private readonly api = inject(EoiApplyService);
  private readonly otrApi = inject(OtrRegistrationService);
  private readonly destroyRef = inject(DestroyRef);

  currentStep = signal<number>(1);

  // ---- Backend application -------------------------------------------------------------------

  /** The applicant's application for this EOI, as the backend last returned it. */
  readonly application = signal<EoiApplication | null>(null);
  readonly loading = signal<boolean>(false);
  /** Why the application could not be opened (no EOI id, OTR not submitted, EOI closed ...). */
  readonly loadError = signal<string>('');
  /** OTR form definition, used to show the profile copied from the OTR. Null when it could not be read. */
  readonly otrForm = signal<OtrFormDef | null>(null);

  /** True once the backend has the application as submitted. */
  readonly submitted = computed(() => !!this.application() && this.application()!.status !== 'Draft');

  /** Scheme strip values from the EOI the application belongs to. */
  readonly header = computed<NoticeHeader | null>(() => {
    const app = this.application();
    return app ? noticeHeader(app.notice) : null;
  });

  readonly schemeTitle = computed(() => this.header()?.title ?? '');
  readonly schemeRefNo = signal<string>('');
  readonly schemeName = computed(() => this.header()?.schemeName ?? '');
  readonly schemeCategory = computed(() => this.header()?.schemeCategory ?? '');
  readonly schemeEoiCategory = computed(() => this.header()?.eoiCategory ?? '');
  readonly schemeDatePublished = computed(() => this.header()?.publishedDate ?? '');
  readonly schemeClosingDate = computed(() => this.header()?.closingDate ?? '');
  readonly schemeEmdFee = computed(() => this.header()?.emdFee ?? '');
  readonly schemeProcessFee = computed(() => this.header()?.processFee ?? '');
  readonly schemeDescription = computed(() => this.header()?.description ?? '');

  // ---- Questions (Configure EOI custom fields) --------------------------------------------------

  readonly schemeCustomFields = computed<EoiCustomField[]>(() => this.application()?.customFields ?? []);
  readonly hasCustomFields = computed(() => this.schemeCustomFields().length > 0);
  readonly customFieldAnswers = signal<Record<string, EoiAnswerValue>>({});
  /** The backend's messages for the questions, by field key (`_form` for a general message). */
  readonly customFieldErrors = signal<Record<string, string>>({});
  readonly savingAnswers = signal<boolean>(false);

  // ---- Profile (OTR copy) ---------------------------------------------------------------------

  readonly profileRecords = computed<OtrRecords>(() => (this.application()?.profile ?? {}) as OtrRecords);

  readonly profileValues = computed<Record<string, OtrStepValues>>(() => {
    const form = this.otrForm();
    const records = this.profileRecords();
    if (!form) return {};
    return Object.fromEntries(formSteps(form).map(step => [step.key, initialStepValues(step, records[step.key])]));
  });

  readonly profileDocuments = computed<Record<string, OtrDocument>>(() => {
    const form = this.otrForm();
    return form ? documentsFrom(form, this.profileRecords()) : {};
  });

  /** The OTR in the shape the printed receipts use. */
  editableStep1: Step1OrgDetails = structuredClone(this.otrFormService.formData().step1);
  editableStep2: OfficerInCharge[] = structuredClone(this.otrFormService.formData().step2);
  editableStep3: Step3AuthorizedPerson = structuredClone(this.otrFormService.formData().step3);
  editableStep4: Step4BankDetails = structuredClone(this.otrFormService.formData().step4);
  /** Kept for the read-only profile section components. */
  readonly isEditingStep2 = signal<boolean>(false);

  // ---- Documents ------------------------------------------------------------------------------

  readonly applyDocuments = computed(() => splitApplyDocuments(this.application()?.documents ?? []));
  /** The application's documents in the shape the receipts use. */
  readonly eoiDocuments = computed<EoiDocumentItem[]>(() => toWizardDocuments(this.application()?.documents ?? []));
  readonly busyDocIds = signal<ReadonlySet<number>>(new Set());
  readonly docErrors = signal<Record<number, string>>({});

  /** What the backend still needs before the fee steps (profile, questions, mandatory documents). */
  readonly pendingBeforeFees = computed(() => pendingBeforeFees(this.application()));

  /** Statutory declaration on the preview step: the applicant ticks it; it is sent with Submit Application. */
  readonly declarationAgreed = signal<boolean>(false);

  // ---- Wizard steps ---------------------------------------------------------------------------

  readonly stepIndexProfile = 1;
  readonly stepIndexCustomFields = computed(() => (this.hasCustomFields() ? 2 : -1));
  readonly stepIndexDocuments = computed(() => (this.hasCustomFields() ? 3 : 2));
  readonly stepIndexPreview = computed(() => (this.hasCustomFields() ? 4 : 3));
  readonly stepIndexProcFee = computed(() => (this.hasCustomFields() ? 5 : 4));
  readonly stepIndexEmd = computed(() => (this.hasCustomFields() ? 6 : 5));
  readonly stepIndexReceipts = computed(() => (this.hasCustomFields() ? 7 : 6));

  readonly wizardSteps = computed<StepperStep[]>(() => [
    { label: 'Registration Profile' },
    ...(this.hasCustomFields() ? [{ label: 'Scheme Proposal Details' }] : []),
    { label: 'Upload Documents' },
    { label: 'Complete Preview' },
    { label: 'Processing Fee' },
    { label: 'EMD Payment' },
    { label: 'Submission Receipt' }
  ]);

  readonly completedWizardSteps = computed(() => {
    const done: number[] = [];
    if (this.procFeePaid()) done.push(this.stepIndexProcFee());
    if (this.submitted()) done.push(this.stepIndexEmd(), this.stepIndexReceipts());
    return done;
  });

  // ---- Fees (RPP) -----------------------------------------------------------------------------

  readonly processFee = computed<EoiPaymentFee | null>(() => this.application()?.processFee ?? null);
  readonly emd = computed(() => this.application()?.emd ?? null);

  /** Paid, or not payable for this EOI. */
  readonly procFeePaid = computed(() => !!this.processFee()?.done);
  readonly procFeeRequired = computed(() => !!this.processFee()?.required);
  readonly emdRequired = computed(() => !!this.emd()?.required);
  readonly emdExempted = computed(() => this.emd()?.mode === 'Exempted');
  readonly emdPaid = computed(() => this.emd()?.mode === 'Paid');
  readonly emdExemptionEligible = computed(() => !!this.emd()?.exemptionEligible);

  /** Redirecting to the gateway, confirming a payment or submitting. */
  readonly isProcPaying = signal<boolean>(false);
  readonly isPaymentProcessing = signal<boolean>(false);
  /** The backend's message for the fee step being shown. */
  readonly procFeeError = signal<string>('');
  readonly emdError = signal<string>('');
  readonly showProcFeeSuccessModal = signal<boolean>(false);
  readonly showEmdSuccessModal = signal<boolean>(false);
  readonly copiedRef = signal<boolean>(false);

  readonly numericProcessFee = computed(() => this.processFee()?.amount ?? this.header()?.processFeeAmount ?? 0);
  readonly numericEmdFee = computed(() => this.emd()?.amount ?? this.header()?.emdAmount ?? 0);
  readonly totalPayableAmount = computed(() => this.numericProcessFee() + (this.emdExempted() ? 0 : this.numericEmdFee()));
  readonly formattedProcessFee = computed(() => formatInr(this.numericProcessFee(), { fractionDigits: 2 }));
  readonly formattedEmdFee = computed(() => formatInr(this.numericEmdFee(), { fractionDigits: 2 }));
  readonly formattedTotalFee = computed(() => formatInr(this.totalPayableAmount(), { fractionDigits: 2 }));
  readonly processFeeInWords = computed(() => numberToIndianWords(this.numericProcessFee()));
  readonly emdFeeInWords = computed(() => numberToIndianWords(this.numericEmdFee()));

  /** Receipt values, all from the backend. */
  readonly eoiApplicationId = computed(() => this.application()?.applicationNo ?? '');
  readonly procPaymentRef = computed(() => this.processFee()?.prn ?? '-');
  readonly procFeeDate = computed(() => formatDateTime(this.processFee()?.paidAt) || '-');
  readonly emdPaymentRef = computed(() => (this.emdExempted() ? 'Exempted' : this.emd()?.prn ?? '-'));
  readonly emdPaidDate = computed(() => (this.emdExempted() ? '-' : formatDateTime(this.emd()?.paidAt) || '-'));
  readonly submissionTimestamp = computed(() => formatDateTime(this.application()?.submittedAt) || '-');

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.recheckTimer) clearTimeout(this.recheckTimer);
    });
    // Opened from the EOI detail page with ?eoiId=<id>. RPP's return adds payment / prn / result.
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
      if (params['refNo']) this.schemeRefNo.set(params['refNo']);
      const eoiId = Number(params['eoiId']);
      const returned = paymentReturnFrom(params);
      if (Number.isInteger(eoiId) && eoiId > 0) {
        if (this.application()?.notice.id !== eoiId) this.openApplication(eoiId, returned);
        else if (returned) this.handlePaymentReturn(returned);
      } else if (returned) {
        this.loadError.set(returned.message || 'The payment response could not be matched to an application. Open your application again from Apply for EOI.');
      } else {
        this.loadError.set('Open the EOI from Apply for EOI and choose "Apply for EOI" to start your application.');
      }
    });
  }

  /** Starts or resumes the application, and reads the OTR form definition the profile is shown with. */
  openApplication(eoiId: number, returned: PaymentReturn | null = null): void {
    this.loading.set(true);
    this.loadError.set('');
    const otrForm$: Observable<OtrFormDef | null> = this.otrApi.load().pipe(
      switchMap(({ form }) => of(form)),
      catchError(() => of(null))
    );
    forkJoin({ app: this.api.start(eoiId), form: otrForm$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ app, form }) => {
          this.otrForm.set(form);
          this.applyServerApplication(app);
          this.customFieldAnswers.set(initialAnswers(app.customFields ?? [], app.dynamicAnswers));
          this.declarationAgreed.set(app.declarationAccepted || this.storage.getSessionItem<boolean>(DECLARATION_KEY(app.id)) === true);
          this.syncProfileModels();
          this.loading.set(false);
          this.currentStep.set(this.resumeStep(app));
          if (returned) this.handlePaymentReturn(returned);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.loadError.set(errorText(error, 'Your application could not be opened. Please try again.'));
        }
      });
  }

  /** Where a reopened application continues: receipts once submitted, the EMD step once the fee is paid. */
  private resumeStep(app: EoiApplication): number {
    if (app.status !== 'Draft') return this.stepIndexReceipts();
    if (app.processFee.done && app.processFee.required && pendingBeforeFees(app).length === 0) return this.stepIndexEmd();
    return 1;
  }

  /** Keeps the backend's latest copy of the application (every apply call answers with it). */
  private applyServerApplication(app: EoiApplication): void {
    this.application.set(app);
    this.schemeRefNo.set(app.notice.refNo);
  }

  /** The printed receipts read the profile from the OTR models filled by the OTR service. */
  private syncProfileModels(): void {
    const data = this.otrFormService.formData();
    this.editableStep1 = structuredClone(data.step1);
    this.editableStep2 = structuredClone(data.step2);
    this.editableStep3 = structuredClone(data.step3);
    this.editableStep4 = structuredClone(data.step4);
  }

  goToStep(step: number): void {
    if (step < 1 || step > this.wizardSteps().length) return;
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** The profile is locked to the OTR, so leaving the step saves nothing. */
  saveAndProceedToDocuments(): void {
    this.goToStep(this.hasCustomFields() ? this.stepIndexCustomFields() : this.stepIndexDocuments());
  }

  // ---- Step: Scheme Proposal Details ---------------------------------------------------------

  updateCustomAnswer(fieldKey: string, value: EoiAnswerValue): void {
    this.customFieldAnswers.update(curr => ({ ...curr, [fieldKey]: value }));
    if (this.customFieldErrors()[fieldKey]) {
      this.customFieldErrors.update(curr => {
        const next = { ...curr };
        delete next[fieldKey];
        return next;
      });
    }
  }

  /** Saves the answers; the backend checks them and every mandatory question, then the wizard moves on. */
  saveAnswersAndProceed(): void {
    const app = this.application();
    if (!app || this.savingAnswers()) return;
    this.savingAnswers.set(true);
    this.customFieldErrors.set({});
    this.api
      .saveAnswers(app.id, this.customFieldAnswers(), true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: saved => {
          this.savingAnswers.set(false);
          this.applyServerApplication(saved);
          this.goToStep(this.stepIndexDocuments());
        },
        error: (error: unknown) => {
          this.savingAnswers.set(false);
          const byField = answerErrors(error);
          this.customFieldErrors.set(
            Object.keys(byField).length ? byField : { _form: errorText(error, 'Your answers could not be saved. Please try again.') }
          );
        }
      });
  }

  // ---- Step: Upload Documents ----------------------------------------------------------------

  uploadApplyDocument(doc: EoiApplyDocument, file: File): void {
    this.runDocumentCall(doc, app => this.api.uploadDocument(app.id, doc.requiredDocumentId as number, file));
  }

  removeApplyDocument(doc: EoiApplyDocument): void {
    this.runDocumentCall(doc, app => this.api.deleteDocument(app.id, doc.requiredDocumentId as number));
  }

  /** Saves the comment when the applicant leaves the field (only when it changed). */
  saveApplyComment(doc: EoiApplyDocument, comment: string): void {
    const next = comment.trim();
    if (next === (doc.comment ?? '').trim()) return;
    this.runDocumentCall(doc, app => this.api.setComment(app.id, doc.requiredDocumentId as number, next));
  }

  viewApplyDocument(doc: EoiApplyDocument): void {
    const app = this.application();
    if (!app || doc.documentId === null) return;
    this.api
      .documentBlob(app.id, doc.documentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => this.openBlob(blob),
        error: (error: unknown) => this.setDocError(doc, errorText(error, 'The document could not be opened.'))
      });
  }

  /** A document uploaded in the OTR, shown on the profile step. */
  viewProfileDocument(fieldKey: string): void {
    const form = this.otrForm();
    const field = form ? formSteps(form).flatMap(stepFields).find(f => f.key === fieldKey) : undefined;
    if (!field?.documentType) return;
    this.otrApi
      .documentBlob(field.documentType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: blob => this.openBlob(blob), error: () => undefined });
  }

  isDocBusy(doc: EoiApplyDocument): boolean {
    return doc.requiredDocumentId !== null && this.busyDocIds().has(doc.requiredDocumentId);
  }

  private runDocumentCall(doc: EoiApplyDocument, call: (app: EoiApplication) => Observable<EoiApplication>): void {
    const app = this.application();
    const id = doc.requiredDocumentId;
    if (!app || id === null || this.busyDocIds().has(id)) return;
    this.busyDocIds.update(s => new Set(s).add(id));
    this.setDocError(doc, '');
    const done = () =>
      this.busyDocIds.update(s => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    call(app)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: saved => {
          done();
          this.applyServerApplication(saved);
        },
        error: (error: unknown) => {
          done();
          this.setDocError(doc, errorText(error, 'The document could not be saved. Please try again.'));
        }
      });
  }

  private setDocError(doc: EoiApplyDocument, message: string): void {
    const id = doc.requiredDocumentId;
    if (id === null) return;
    this.docErrors.update(curr => {
      const next = { ...curr };
      if (message) next[id] = message;
      else delete next[id];
      return next;
    });
  }

  // ---- Step: Processing Fee (RPP) ------------------------------------------------------------

  /** Pays the processing fee on RPP (the browser leaves for the gateway), or moves on when none is payable. */
  payProcessingFeeAndProceed(): void {
    const app = this.application();
    if (!app || this.isProcPaying()) return;
    if (this.procFeePaid()) {
      this.goToStep(this.stepIndexEmd());
      return;
    }
    this.procFeeError.set('');
    this.redirectToGateway(app, 'process-fee', this.isProcPaying, this.procFeeError);
  }

  /**
   * Records a processing fee payment made on RPP. Without a PRN the backend finds the payment made for this
   * application (and asks RPP for its status when the gateway's return was not processed).
   */
  confirmProcessFee(prn: string | null = null): void {
    const app = this.application();
    if (!app || this.isProcPaying()) return;
    this.isProcPaying.set(true);
    this.procFeeError.set('');
    this.api
      .confirmProcessFee(app.id, prn)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: saved => {
          this.isProcPaying.set(false);
          this.applyServerApplication(saved);
          this.showProcFeeSuccessModal.set(true);
          setTimeout(() => {
            this.showProcFeeSuccessModal.set(false);
            this.goToStep(this.stepIndexEmd());
          }, PROC_FEE_SUCCESS_REDIRECT_MS);
        },
        error: (error: unknown) => {
          this.isProcPaying.set(false);
          const message = errorText(error, 'The processing fee payment could not be confirmed.');
          this.procFeeError.set(message);
          if (isAwaitingBank(message)) this.scheduleRecheck(() => this.confirmProcessFee(prn));
        }
      });
  }

  /** How many times a payment the bank has not confirmed yet is checked again automatically. */
  private recheckCount = 0;
  private recheckTimer: ReturnType<typeof setTimeout> | null = null;

  /** RPP takes up to 10 minutes to settle a payment: check again every 30 s, for up to 10 minutes. */
  private scheduleRecheck(check: () => void): void {
    if (this.recheckTimer || this.recheckCount >= PENDING_RECHECKS) return;
    this.recheckCount++;
    this.recheckTimer = setTimeout(() => {
      this.recheckTimer = null;
      check();
    }, PENDING_RECHECK_MS);
  }

  // ---- Step: EMD (RPP / MSME exemption) and Submit -------------------------------------------

  /** Pays the EMD on RPP (the browser leaves for the gateway). */
  payEmd(): void {
    const app = this.application();
    if (!app || this.isPaymentProcessing()) return;
    if (this.emdPaid() || !this.emdRequired()) {
      this.submitApplication();
      return;
    }
    this.emdError.set('');
    const go = () => this.redirectToGateway(app, 'emd', this.isPaymentProcessing, this.emdError);
    // A claimed exemption is withdrawn first, so the backend accepts the payment.
    if (this.emdExempted()) {
      this.isPaymentProcessing.set(true);
      this.api.setEmd(app.id, 'none').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: saved => {
          this.applyServerApplication(saved);
          this.isPaymentProcessing.set(false);
          go();
        },
        error: (error: unknown) => {
          this.isPaymentProcessing.set(false);
          this.emdError.set(errorText(error, 'The EMD could not be updated.'));
        }
      });
    } else {
      go();
    }
  }

  /** Records the EMD payment made on RPP, then submits the application. */
  confirmEmd(prn: string | null = null): void {
    this.runEmdThenSubmit(app => this.api.setEmd(app.id, 'payment', prn), 'The EMD payment could not be confirmed.', () => this.confirmEmd(prn));
  }

  /** Claims the MSME / Udyam exemption (the backend checks the Udyam number in the profile), then submits. */
  claimExemptionAndSubmit(): void {
    this.runEmdThenSubmit(app => this.api.setEmd(app.id, 'exemption'), 'The EMD exemption could not be applied.');
  }

  /** POST .../submit with the declaration; the backend checks that the application is complete. */
  submitApplication(): void {
    const app = this.application();
    if (!app || this.isPaymentProcessing()) return;
    this.emdError.set('');
    this.isPaymentProcessing.set(true);
    this.submit(app);
  }

  private runEmdThenSubmit(call: (app: EoiApplication) => Observable<EoiApplication>, fallback: string, recheck?: () => void): void {
    const app = this.application();
    if (!app || this.isPaymentProcessing()) return;
    this.isPaymentProcessing.set(true);
    this.emdError.set('');
    call(app)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: saved => {
          this.applyServerApplication(saved);
          this.submit(saved);
        },
        error: (error: unknown) => {
          this.isPaymentProcessing.set(false);
          const message = errorText(error, fallback);
          this.emdError.set(message);
          if (recheck && isAwaitingBank(message)) this.scheduleRecheck(recheck);
        }
      });
  }

  private submit(app: EoiApplication): void {
    if (!this.declarationAgreed()) {
      this.isPaymentProcessing.set(false);
      this.emdError.set('Accept the declaration on the Complete Preview step, then submit your application.');
      return;
    }
    this.api
      .submit(app.id, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: saved => {
          this.isPaymentProcessing.set(false);
          this.applyServerApplication(saved);
          this.storage.removeSessionItem(DECLARATION_KEY(app.id));
          this.showEmdSuccessModal.set(true);
          setTimeout(() => this.closeSuccessModalAndGoToStep6(), SUBMISSION_SUCCESS_REDIRECT_MS);
        },
        error: (error: unknown) => {
          this.isPaymentProcessing.set(false);
          this.emdError.set(errorText(error, 'Your application could not be submitted. Please try again.'));
        }
      });
  }

  closeSuccessModalAndGoToStep6(): void {
    this.showEmdSuccessModal.set(false);
    this.goToStep(this.stepIndexReceipts());
  }

  // ---- RPP --------------------------------------------------------------------------------------

  /** POST .../payments/{fee}/initiate, then posts the returned form to RPP. RPP returns to the wizard. */
  private redirectToGateway(app: EoiApplication, fee: 'process-fee' | 'emd', busy: WritableSignal<boolean>, error: WritableSignal<string>): void {
    busy.set(true);
    // The declaration must survive the round trip through the gateway.
    if (this.declarationAgreed()) this.storage.setSessionItem(DECLARATION_KEY(app.id), true);
    this.api
      .initiatePayment(app.id, fee)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: payment => postToGateway(payment.targetUrl, payment.formFields),
        error: (e: unknown) => {
          busy.set(false);
          error.set(errorText(e, 'The payment could not be started. Please try again.'));
        }
      });
  }

  /** The wizard was reopened by RPP's return: record the fee (or show why it failed) and clean the URL. */
  private handlePaymentReturn(returned: PaymentReturn): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { payment: null, prn: null, result: null, message: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    const ok = returned.result === 'success' || returned.result === 'pending' || returned.result === 'unknown';
    if (returned.fee === 'process-fee') {
      this.goToStep(this.stepIndexProcFee());
      if (this.procFeePaid()) return;
      if (ok) this.confirmProcessFee(returned.prn);
      else this.procFeeError.set(returned.message || `The payment was ${returned.result}. You can try again.`);
    } else if (returned.fee === 'emd') {
      this.goToStep(this.stepIndexEmd());
      if (this.submitted()) {
        this.goToStep(this.stepIndexReceipts());
        return;
      }
      if (this.emdPaid()) this.submitApplication();
      else if (ok) this.confirmEmd(returned.prn);
      else this.emdError.set(returned.message || `The payment was ${returned.result}. You can try again.`);
    }
  }

  // ---- Receipts ---------------------------------------------------------------------------------

  private receiptData(): SchemeReceiptData {
    const pf = this.processFee();
    const emd = this.emd();
    return {
      applicationNo: this.eoiApplicationId(),
      schemeTitle: this.schemeTitle(),
      schemeName: this.schemeName(),
      schemeRefNo: this.schemeRefNo(),
      submissionTimestamp: this.submissionTimestamp(),
      processFeeRequired: this.procFeeRequired(),
      procFeeDate: this.procFeeDate(),
      procFeePrn: pf?.prn ?? '-',
      procFeeTxnId: pf?.rppTxnId ?? '-',
      procPaymentModeLabel: paymentModeText(pf),
      numericProcessFee: this.numericProcessFee(),
      formattedProcessFee: this.formattedProcessFee(),
      processFeeInWords: this.processFeeInWords(),
      emdRequired: this.emdRequired(),
      emdExempted: this.emdExempted(),
      udyamNumber: emd?.udyamNumber ?? '',
      emdPrn: emd?.prn ?? '-',
      emdTxnId: emd?.rppTxnId ?? '-',
      emdPaidDate: this.emdPaidDate(),
      emdPaymentModeLabel: paymentModeText(emd),
      numericEmdFee: this.numericEmdFee(),
      formattedEmdFee: this.formattedEmdFee(),
      emdFeeInWords: this.emdFeeInWords(),
      formattedTotalFee: this.formattedTotalFee(),
      org: this.editableStep1,
      signatory: this.editableStep3,
      documents: this.eoiDocuments()
    };
  }

  downloadProcessingFeeReceipt(): void {
    this.receipts.downloadProcessingFeeReceipt(this.receiptData());
  }

  downloadAcknowledgmentReceipt(): void {
    this.receipts.downloadAcknowledgmentReceipt(this.receiptData());
  }

  downloadEmdReceipt(): void {
    this.receipts.downloadEmdReceipt(this.receiptData());
  }

  downloadProposalApplication(): void {
    this.receipts.downloadProposalApplication(this.receiptData());
  }

  downloadAllReceipts(): void {
    this.downloadAcknowledgmentReceipt();
    if (this.emdRequired()) setTimeout(() => this.downloadEmdReceipt(), 300);
    if (this.procFeeRequired()) setTimeout(() => this.downloadProcessingFeeReceipt(), 600);
  }

  copyRef(): void {
    const id = this.eoiApplicationId();
    void navigator?.clipboard?.writeText(id).catch(() => undefined);
    this.copiedRef.set(true);
    setTimeout(() => this.copiedRef.set(false), 3000);
  }

  goToTenderStatus(): void {
    this.showEmdSuccessModal.set(false);
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) void this.router.navigateByUrl(returnUrl);
    else {
      const id = this.application()?.id;
      void this.router.navigate(['/tender-status'], id ? { queryParams: { applicationId: id } } : {});
    }
  }

  printReceipt(): void {
    window.print();
  }

  private openBlob(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
