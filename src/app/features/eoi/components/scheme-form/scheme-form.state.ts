import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { OtrFormService } from '../../../registration/services/otr-form.service';
import { formatDateMedium, formatDateTime, formatInr } from '../../../../shared/utils';
import { StepperStep } from '../../../../shared/components/stepper/stepper.component';
import {
  Step1OrgDetails,
  OfficerInCharge,
  Step3AuthorizedPerson,
  Step4BankDetails,
  FileDoc
} from '../../../registration/models/otr-form.model';
import { SubmittedTender, createSampleDocs } from '../../../../core/models/tender.model';
import { DataEngineService } from '../../../../core/services/data-engine.service';
import { EoiDraftService } from '../../../../core/services/eoi-draft.service';
import { EoiDocumentItem, createInitialEoiDocuments } from './scheme-form.model';
import { SchemeFormReceiptsService, SchemeReceiptData } from './scheme-form-receipts.service';
import { DocumentViewerService } from '../../../../core/services/document-viewer.service';
import {
  countUploaded,
  emdPaymentModeLabel,
  filterDocsByCategory,
  formatFileSize,
  formatOfficeAddress,
  formatRegisteredAddress,
  formatResidenceAddress,
  numberToIndianWords,
  parseFeeAmount,
  procPaymentModeLabel
} from './scheme-form.util';

/** How long the processing-fee success screen stays up before Step 2 opens by itself. */
const PROC_FEE_SUCCESS_REDIRECT_MS = 2500;

/** How long the payment + submission success screen stays up before the receipts page opens. */
const SUBMISSION_SUCCESS_REDIRECT_MS = 3000;

/**
 * Component-scoped state and actions shared by the EOI application wizard
 * (provided by SchemeFormComponent and injected by the step components).
 */
@Injectable()
export class SchemeFormState {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private otrFormService = inject(OtrFormService);
  private receipts = inject(SchemeFormReceiptsService);
  private docViewer = inject(DocumentViewerService);

  private draftStore = inject(EoiDraftService);
  private draftRestored = false;
  private schemeQueryParams: Record<string, string> = {};
  /** True once the application has been submitted; a submitted application is no longer a draft. */
  private readonly submitted = signal<boolean>(false);

  readonly otrData = this.otrFormService.formData;

  currentStep = signal<number>(1);

  schemeTitle = signal<string>('Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)');
  schemeRefNo = signal<string>('RSLDC/EOI/MMKVY Cat I II III/2026-27/01');
  schemeName = signal<string>('MMKVY');
  schemeCode = signal<string>('MMKVY');
  schemeCategory = signal<string>('ALL');
  schemeEoiCategory = signal<string>('General');
  schemeDatePublished = signal<string>('15/09/2026');
  schemeClosingDate = signal<string>('30/11/2026');
  schemeEmdFee = signal<string>('₹50,000');
  schemeProcessFee = signal<string>('₹2,000');
  schemeDescription = signal<string>(
    'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
  );

  readonly wizardSteps: StepperStep[] = [
    { label: 'Processing Fee' },
    { label: 'Registration Profile' },
    { label: 'Upload Documents' },
    { label: 'Complete Preview' },
    { label: 'EMD Payment' },
    { label: 'Submission Receipt' }
  ];

  /** Step 1 is done once the fee is paid; the final step is done once reached. */
  readonly completedWizardSteps = computed(() => {
    const done: number[] = [];
    if (this.procFeePaid()) done.push(1);
    if (this.currentStep() === this.wizardSteps.length) done.push(this.wizardSteps.length);
    return done;
  });

  // Step 1: Processing Fee State & Payment Methods
  procFeePaid = signal<boolean>(false);
  isProcPaying = signal<boolean>(false);
  showProcFeeSuccessModal = signal<boolean>(false);
  procFeeDate = signal<string>('04 Oct 2026, 08:35 PM');
  procPaymentMethod = signal<'upi' | 'card' | 'netbanking' | 'e-gras'>('upi');
  upiOption = signal<'id' | 'qr'>('id');
  upiId = signal<string>('skills.enterprise@okaxis');
  upiVerified = signal<boolean>(true);
  cardData = { number: '4532 8901 2345 6789', name: 'AUTHORIZED SIGNATORY', expiry: '08/29', cvv: '782' };
  selectedBank = signal<string>('sbi');

  // Step 5: EMD Payment Mode & Inputs
  paymentMethod = signal<'upi' | 'card' | 'netbanking' | 'e-gras' | 'exemption'>('upi');
  emdUpiId = signal<string>('treasury.corp@okhdfcbank');
  emdCardData = { number: '5241 6800 1192 4001', name: 'AUTHORIZED SIGNATORY', expiry: '11/28', cvv: '439' };
  emdSelectedBank = signal<string>('sbi');
  isPaymentProcessing = signal<boolean>(false);
  showEmdSuccessModal = signal<boolean>(false);
  /** EOI Submission Reference Number issued when the application is submitted. */
  readonly eoiApplicationId = signal<string>('ISMS-EOI-2026-9842');
  /** Payment reference numbers returned by the payment gateway. */
  readonly procPaymentRef = 'CIN-SBI-9912081';
  readonly emdPaymentRef = computed(() => (this.paymentMethod() === 'exemption' ? 'Exempted' : 'CIN-SBI-9912082'));
  readonly copiedRef = signal<boolean>(false);
  submissionTimestamp = signal<string>('04 Oct 2026, 08:35 PM');

  // Number & Currency Dynamic Computations
  readonly numericProcessFee = computed(() => parseFeeAmount(this.schemeProcessFee(), 2000));

  readonly numericEmdFee = computed(() => parseFeeAmount(this.schemeEmdFee(), 50000));

  readonly totalPayableAmount = computed(() => {
    return this.numericProcessFee() + this.numericEmdFee();
  });

  readonly formattedProcessFee = computed(() => formatInr(this.numericProcessFee(), { fractionDigits: 2 }));

  readonly formattedEmdFee = computed(() => formatInr(this.numericEmdFee(), { fractionDigits: 2 }));

  readonly formattedTotalFee = computed(() => formatInr(this.totalPayableAmount(), { fractionDigits: 2 }));

  readonly processFeeInWords = computed(() => {
    return this.numberToIndianWords(this.numericProcessFee());
  });

  readonly emdFeeInWords = computed(() => {
    return this.numberToIndianWords(this.numericEmdFee());
  });

  readonly totalFeeInWords = computed(() => {
    return this.numberToIndianWords(this.totalPayableAmount());
  });

  get selectedProcPaymentModeLabel(): string {
    return procPaymentModeLabel(this.procPaymentMethod());
  }

  get emdPaymentModeLabel(): string {
    return emdPaymentModeLabel(this.paymentMethod());
  }

  // Step 2: OTR Data Models
  editableStep1: Step1OrgDetails = JSON.parse(JSON.stringify(this.otrFormService.formData().step1));
  editableStep2: OfficerInCharge[] = JSON.parse(JSON.stringify(this.otrFormService.formData().step2));
  editableStep3: Step3AuthorizedPerson = JSON.parse(JSON.stringify(this.otrFormService.formData().step3));
  editableStep4: Step4BankDetails = JSON.parse(JSON.stringify(this.otrFormService.formData().step4));

  // Step 2: Registration Profile View / Edit Mode (Disabled by default, unlock via Edit button)
  isEditingStep2 = signal<boolean>(false);

  // Step 4: Inline Registration Profile Editing in Complete Preview
  isEditingOtrInPreview = signal<boolean>(false);

  // Step 3: Documents Tab Filter
  selectedDocTab = signal<'all' | 'mandatory' | 'annexure' | 'remaining'>('all');

  /** 16 Proposal Documents strictly matching Screenshot */
  eoiDocuments = signal<EoiDocumentItem[]>(createInitialEoiDocuments());

  readonly mandatoryDocs = computed(() => filterDocsByCategory(this.eoiDocuments(), 'mandatory'));
  readonly annexureDocs = computed(() => filterDocsByCategory(this.eoiDocuments(), 'annexure'));
  readonly remainingDocs = computed(() => filterDocsByCategory(this.eoiDocuments(), 'remaining'));

  readonly mandatoryAttachedCount = computed(() => countUploaded(this.mandatoryDocs()));
  readonly annexureAttachedCount = computed(() => countUploaded(this.annexureDocs()));
  readonly remainingAttachedCount = computed(() => countUploaded(this.remainingDocs()));

  readonly filteredDocuments = computed(() => filterDocsByCategory(this.eoiDocuments(), this.selectedDocTab()));

  readonly attachedDocsCount = computed(() => countUploaded(this.eoiDocuments()));

  /** Statutory declaration on the preview step: the applicant must tick it themselves. */
  declarationAgreed = signal<boolean>(false);

  // Document Viewer Modal State
  isViewerOpen = signal<boolean>(false);
  activeViewerDoc = signal<FileDoc | null>(null);
  activeViewerTitle = signal<string>('');

  get registeredAddressText(): string {
    return formatRegisteredAddress(this.editableStep1);
  }

  get officeAddressText(): string {
    return formatOfficeAddress(this.editableStep1);
  }

  get residenceAddressText(): string {
    return formatResidenceAddress(this.editableStep3);
  }

  numberToIndianWords(num: number): string {
    return numberToIndianWords(num);
  }

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
      if (params['refNo']) this.schemeRefNo.set(params['refNo']);
      this.schemeQueryParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => typeof v === 'string')
      ) as Record<string, string>;
      if (params['title']) this.schemeTitle.set(params['title']);
      if (params['schemeName']) this.schemeName.set(params['schemeName']);
      if (params['code']) this.schemeCode.set(params['code']);
      if (params['category']) this.schemeCategory.set(params['category']);
      if (params['schemeCategory']) this.schemeCategory.set(params['schemeCategory']);
      if (params['eoiCategory']) this.schemeEoiCategory.set(params['eoiCategory']);
      if (params['datePublished']) this.schemeDatePublished.set(params['datePublished']);
      if (params['closingDate']) this.schemeClosingDate.set(params['closingDate']);
      if (params['emdFee']) this.schemeEmdFee.set(params['emdFee']);
      if (params['processFee']) this.schemeProcessFee.set(params['processFee']);
      if (params['eoiDescription']) this.schemeDescription.set(params['eoiDescription']);
      if (params['refNo'] && !this.draftRestored) {
        this.draftRestored = true;
        this.restoreDraft(params['refNo']);
      }
    });

    // Keep a draft up to date once the applicant has started (paid the processing fee) and until they submit,
    // so the Active Schemes page can flag this application as pending.
    effect(() => {
      const paid = this.procFeePaid();
      const step = this.currentStep();
      const docs = this.eoiDocuments();
      const refNo = this.schemeRefNo();
      const procFeeDate = this.procFeeDate();
      if (!paid || this.submitted() || step >= this.wizardSteps.length) return;
      this.draftStore.save({
        refNo,
        schemeName: this.schemeName(),
        queryParams: this.schemeQueryParams,
        step: Math.max(step, 2),
        procFeePaid: true,
        procFeeDate,
        documents: docs
          .filter(d => d.status === 'uploaded')
          .map(d => ({ id: d.id, fileName: d.fileName, fileSize: d.fileSize, uploadedDate: d.uploadedDate })),
        updatedAt: new Date().toISOString()
      });
    });
  }

  /** Reopens an application that was left unfinished: fee status, uploaded documents and the step. */
  private restoreDraft(refNo: string): void {
    const draft = this.draftStore.get(refNo);
    if (!draft) return;
    this.procFeePaid.set(draft.procFeePaid);
    this.procFeeDate.set(draft.procFeeDate);
    this.eoiDocuments.update(docs =>
      docs.map(doc => {
        const saved = draft.documents.find(d => d.id === doc.id);
        return saved ? { ...doc, ...saved, status: 'uploaded' as const } : doc;
      })
    );
    this.currentStep.set(Math.min(Math.max(draft.step, 2), this.wizardSteps.length - 1));
  }

  goToStep(step: number): void {
    // Once the processing fee is paid the applicant moves forward only: Step 1 cannot be reopened.
    if (step < 2 && this.procFeePaid()) return;
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setUpiHandle(handle: string): void {
    const currentBase = (this.upiId() || 'skills').split('@')[0];
    this.upiId.set(`${currentBase}${handle}`);
    this.upiVerified.set(true);
  }

  verifyUpi(): void {
    this.upiVerified.set(true);
  }

  payProcessingFeeAndProceed(): void {
    this.isProcPaying.set(true);
    setTimeout(() => {
      this.isProcPaying.set(false);
      this.procFeePaid.set(true);
      this.procFeeDate.set(formatDateTime(new Date()));
      this.showProcFeeSuccessModal.set(true);
      // The success screen cannot be dismissed: it carries the applicant on to Step 2 by itself.
      setTimeout(() => {
        this.showProcFeeSuccessModal.set(false);
        this.goToStep(2);
      }, PROC_FEE_SUCCESS_REDIRECT_MS);
    }, 600);
  }

  saveStep2Changes(): void {
    this.otrFormService.updateStep1(this.editableStep1);
    this.otrFormService.updateStep2(this.editableStep2);
    this.otrFormService.updateStep3(this.editableStep3);
    this.otrFormService.updateStep4(this.editableStep4);
  }

  toggleStep2Edit(): void {
    if (this.isEditingStep2()) {
      this.saveStep2Changes();
      this.isEditingStep2.set(false);
    } else {
      this.isEditingStep2.set(true);
    }
  }

  saveAndProceedToStep3(): void {
    this.saveStep2Changes();
    this.isEditingStep2.set(false);
    this.goToStep(3);
  }

  togglePreviewOtrEdit(): void {
    if (this.isEditingOtrInPreview()) {
      // Save changes back to OTR form service state
      this.otrFormService.updateStep1(this.editableStep1);
      this.otrFormService.updateStep2(this.editableStep2);
      this.otrFormService.updateStep3(this.editableStep3);
      this.otrFormService.updateStep4(this.editableStep4);
      this.isEditingOtrInPreview.set(false);
    } else {
      this.isEditingOtrInPreview.set(true);
    }
  }

  onFileSelected(event: Event, doc: EoiDocumentItem): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileSize = formatFileSize(file.size);
      const uploadedDate = formatDateMedium(new Date(), '-');
      this.eoiDocuments.update(docs => docs.map(d => d.id === doc.id ? {
        ...d,
        fileName: file.name,
        fileSize,
        uploadedDate,
        status: 'uploaded'
      } : d));
      input.value = '';
    }
  }

  attachAllSampleDocs(): void {
    this.eoiDocuments.update(docs => docs.map((doc, idx) => ({
      ...doc,
      status: 'uploaded',
      fileName: `Scan_Annexure_${doc.id}_Signed.pdf`,
      fileSize: `${(1.2 + (idx % 3) * 0.8).toFixed(1)} MB`,
      uploadedDate: '04-Oct-2026'
    })));
  }

  replaceOtrDoc(event: Event, type: 'regCert' | 'panCard' | 'gstCert' | 'msmeCert' | 'authLetter' | 'authIdProof' | 'bankDoc'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileSize = formatFileSize(file.size);
      const docObj: FileDoc = {
        fileName: file.name,
        fileSize,
        uploadDate: '04/10/2026',
        status: 'uploaded'
      };

      if (type === 'regCert') this.editableStep1.registrationCertDoc = docObj;
      if (type === 'panCard') this.editableStep1.panCardDoc = docObj;
      if (type === 'gstCert') this.editableStep1.gstCertDoc = docObj;
      if (type === 'msmeCert') this.editableStep1.msmeCertDoc = docObj;
      if (type === 'authLetter') this.editableStep3.authorizationLetterDoc = docObj;
      if (type === 'authIdProof') this.editableStep3.idProofDoc = docObj;
      if (type === 'bankDoc') this.editableStep4.cancelledChequeDoc = docObj;

      input.value = '';
    }
  }

  removeOtrDoc(type: 'regCert' | 'panCard' | 'gstCert' | 'msmeCert' | 'authLetter' | 'authIdProof' | 'bankDoc'): void {
    if (type === 'regCert') this.editableStep1.registrationCertDoc = null;
    if (type === 'panCard') this.editableStep1.panCardDoc = null;
    if (type === 'gstCert') this.editableStep1.gstCertDoc = null;
    if (type === 'msmeCert') this.editableStep1.msmeCertDoc = null;
    if (type === 'authLetter') this.editableStep3.authorizationLetterDoc = null;
    if (type === 'authIdProof') this.editableStep3.idProofDoc = null;
    if (type === 'bankDoc') this.editableStep4.cancelledChequeDoc = null;
  }

  removeSchemeDoc(doc: EoiDocumentItem): void {
    this.eoiDocuments.update(docs =>
      docs.map(d => (d.id === doc.id ? { ...d, status: 'pending' as const, fileName: '', fileSize: '', uploadedDate: '' } : d))
    );
  }

  replaceOicDoc(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.editableStep2[index]) {
      const file = input.files[0];
      const fileSize = formatFileSize(file.size);
      this.editableStep2[index].appointmentLetterDoc = {
        fileName: file.name,
        fileSize,
        uploadDate: '04/10/2026',
        status: 'uploaded'
      };
      input.value = '';
    }
  }

  viewDoc(fileName: string, title: string, fileSize: string = '1.2 MB'): void {
    this.docViewer.openDocument({
      fileName,
      fileSize,
      uploadDate: '04/10/2026',
      status: 'uploaded'
    }, title);
  }

  closeViewer(): void {
    this.isViewerOpen.set(false);
    this.activeViewerDoc.set(null);
  }

  triggerEmdPayment(): void {
    this.isPaymentProcessing.set(true);
    setTimeout(() => {
      this.isPaymentProcessing.set(false);
      const now = new Date();
      this.submissionTimestamp.set(formatDateTime(now));
      this.recordSubmittedTender(now);
      this.submitted.set(true);
      this.draftStore.clear(this.schemeRefNo());
      this.showEmdSuccessModal.set(true);
      // The combined payment + submission screen cannot be dismissed: it opens the receipts page by itself.
      setTimeout(() => this.closeSuccessModalAndGoToStep6(), SUBMISSION_SUCCESS_REDIRECT_MS);
    }, 800);
  }

  closeSuccessModalAndGoToStep6(): void {
    this.showEmdSuccessModal.set(false);
    this.goToStep(6);
  }

  downloadAllReceipts(): void {
    this.downloadAcknowledgmentReceipt();
    setTimeout(() => this.downloadEmdReceipt(), 300);
    setTimeout(() => this.downloadProcessingFeeReceipt(), 600);
  }

  copyRef(): void {
    const id = this.eoiApplicationId();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(id).catch(() => {
        this.fallbackCopyText(id);
      });
    } else {
      this.fallbackCopyText(id);
    }
    this.copiedRef.set(true);
    setTimeout(() => this.copiedRef.set(false), 3000);
  }

  private fallbackCopyText(text: string): void {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      // ignore
    }
  }

  private readonly tenderRepo = inject(DataEngineService).for<SubmittedTender>('SUBMITTED_TENDERS');

  private recordSubmittedTender(now: Date): void {
    const appRef = this.eoiApplicationId();
    const appliedDateStr = formatDateMedium(now, '-');
    const newSubmission: SubmittedTender = {
      id: `t-${Date.now()}`,
      appRef: this.eoiApplicationId(),
      appliedDate: appliedDateStr,
      closingDate: this.schemeClosingDate() || '30-Nov-2026',
      schemeTitle: this.schemeTitle(),
      schemeName: this.schemeName(),
      schemeCategory: this.schemeCategory() || 'ALL',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdAmount: this.paymentMethod() === 'exemption' ? '₹ 0 (Exempted)' : this.formattedEmdFee(),
      processingFee: this.formattedProcessFee(),
      transactionRef: this.procPaymentRef,
      emdTransactionRef: this.emdPaymentRef(),
      submittedStatus: 'Submitted',
      eoiStatus: 'Under Review',
      editCount: 0,
      maxEdits: 3,
      orgDetails: this.editableStep1,
      signatoryDetails: this.editableStep3,
      officers: this.editableStep2,
      bankDetails: this.editableStep4,
      documents: createSampleDocs()
    };
    // Idempotent: only create the submission once per application reference.
    this.tenderRepo
      .getAll()
      .pipe(switchMap(list => (list.some(t => t.appRef === appRef) ? of(null) : this.tenderRepo.create(newSubmission))))
      .subscribe();
  }

  goToTenderStatus(): void {
    this.showEmdSuccessModal.set(false);
    this.router.navigate(['/tender-status']);
  }

  printReceipt(): void {
    window.print();
  }
  /** Snapshot of the values printed on the generated receipts. */
  private receiptData(): SchemeReceiptData {
    return {
      schemeTitle: this.schemeTitle(),
      schemeName: this.schemeName(),
      schemeRefNo: this.schemeRefNo(),
      submissionTimestamp: this.submissionTimestamp(),
      procFeeDate: this.procFeeDate(),
      procPaymentModeLabel: this.selectedProcPaymentModeLabel,
      numericProcessFee: this.numericProcessFee(),
      formattedProcessFee: this.formattedProcessFee(),
      processFeeInWords: this.processFeeInWords(),
      emdExempted: this.paymentMethod() === 'exemption',
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
}
