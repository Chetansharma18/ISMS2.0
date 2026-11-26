// ui-guard-allow: page-frame - the registration wizard has its own stepper layout
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiError } from '../../core/http/api-error';
import { NotificationService } from '../../core/services/notification.service';
import {
  ActionModalComponent,
  ButtonComponent,
  EmptyStateComponent,
  IconComponent,
  InputDirective,
  LoaderComponent,
  StepperComponent,
  StepperStep
} from '../../shared';
import {
  OTR_GENERAL_ERRORS,
  OtrErrorMap,
  OtrFieldDef,
  OtrFormDef,
  OtrRecords,
  OtrSectionDef,
  OtrStepDef,
  OtrStepValues,
  OtrUpdateLogDto,
  OtrValue
} from './models/otr-api.model';
import {
  currentStepNumber,
  documentsFrom,
  dynamicFieldErrors,
  firstStepWithErrors,
  formSteps,
  initialStepValues,
  isFieldVisible,
  hasSavedStep,
  isSubmitted,
  mapFieldErrors,
  mergeStepValues,
  referenceNumber,
  savedStepNumbers,
  setStepValue,
  stepFields,
  stepPayloadChanged,
  toStepPayload
} from './otr-form.util';
import { OtrFieldComponent } from './parts/otr-field.component';
import { OtrUpdateHistoryComponent } from './parts/otr-update-history.component';
import { OtrReviewComponent } from './parts/otr-review.component';
import { OtrFormService } from './services/otr-form.service';
import { OtrPdfService } from './services/otr-pdf.service';
import { OtrRegistrationService } from './services/otr-registration.service';

interface SectionView {
  section: OtrSectionDef;
  /** Group heading, shown above the first section of a group. */
  groupTitle?: string;
  fields: OtrFieldDef[];
}

type SavingState = 'next' | 'draft' | 'submit' | null;

/**
 * Organization Registration (One Time Registration). The steps, fields, labels, required markers and sections
 * come from the backend (GET /otr/form), each step is saved to its own endpoint and every check is the backend's:
 * its messages are shown under the fields they belong to. Dropdown lists and show / hide rules are display
 * settings (otr-step-layout.ts).
 */
@Component({
  selector: 'app-registration-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActionModalComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    InputDirective,
    LoaderComponent,
    StepperComponent,
    OtrFieldComponent,
    OtrReviewComponent,
    OtrUpdateHistoryComponent
  ],
  template: `
    <div class="min-h-screen bg-white flex flex-col justify-between selection:bg-[#7C0E44] selection:text-white">
      <main class="flex-1 w-full px-4 sm:px-5 lg:px-6 py-4 sm:py-5">

        <div class="mb-5 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <button appButton variant="outline" size="sm" type="button" (click)="goBack()">
              <app-icon name="back" />
              <span>Back</span>
            </button>
            @if (!loading() && !loadError() && hasSavedSteps()) {
              <button appButton variant="outline" size="sm" type="button" (click)="openHistory()">
                <app-icon name="clock" />
                <span>Change History</span>
              </button>
            }
          </div>
          <h1 class="text-2xl sm:text-[28px] font-bold text-[#7C0E44] tracking-tight m-0">
            {{ form()?.title ?? 'Organization Registration' }}
          </h1>
          @if (form(); as f) {
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
              @if (readOnly()) {
                Your registration has been submitted.
                @if (referenceNo(); as ref) {
                  Reference number: <span class="font-semibold text-navy tabular-nums">{{ ref }}</span>
                }
              } @else if (activeStepDef()?.kind === 'review') {
                Review all the details before submitting your registration.
              } @else {
                {{ f.description }}
              }
            </p>
          }
        </div>

        @if (loading()) {
          <app-loader text="Loading registration form..." />
        } @else if (loadError(); as message) {
          <app-empty-state title="Registration form could not be loaded" [description]="message" icon="error" />
          <div class="flex justify-center mt-4">
            <button appButton type="button" (click)="load()">
              <app-icon name="refresh" />
              <span>Try again</span>
            </button>
          </div>
        } @else if (form(); as f) {
          <div class="sticky top-0 z-30 bg-white/95 backdrop-blur-xs -mx-4 sm:-mx-5 lg:-mx-6 px-4 sm:px-5 lg:px-6 py-2.5 mb-5 border-b border-slate-200/80">
            <app-stepper
              variant="wizard"
              ariaLabel="Registration steps"
              [steps]="stepperSteps()"
              [currentStep]="activeStep()"
              [completedSteps]="completedSteps()"
              (stepClick)="goToStep($event)"
            />
          </div>

          @if (activeStepDef(); as step) {
            <div class="bg-white rounded-xl border border-[#D6E3F0] shadow-xs p-5 sm:p-7 space-y-6">
              <div class="pb-3.5 border-b border-[#E8EEF5] flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <h2 class="text-lg sm:text-[19px] font-bold text-[#7C0E44] m-0 leading-tight">{{ step.title }}</h2>
                  <p class="text-xs text-slate-500 m-0 mt-0.5">{{ step.subtitle }}</p>
                </div>
                @if (step.kind === 'form' && !readOnly()) {
                  <span class="text-xs text-slate-500 font-medium shrink-0">
                    Required fields marked <span class="text-[#DC2626] font-bold">*</span>
                  </span>
                }
              </div>

              @if (step.kind === 'form') {
                @for (view of sectionViews(); track view.section.key) {
                  <section class="space-y-4">
                    @if (view.groupTitle) {
                      <div class="pb-2 border-b border-[#E8EEF5]">
                        <h3 class="text-[19px] font-semibold text-[#1E3A5F] tracking-tight m-0">{{ view.groupTitle }}</h3>
                      </div>
                      <h4 class="text-[15px] font-semibold text-[#1E3A5F] m-0">{{ view.section.title }}</h4>
                    } @else if (view.section.group) {
                      <h4 class="text-[15px] font-semibold text-[#1E3A5F] m-0">{{ view.section.title }}</h4>
                    } @else {
                      <div class="pb-2 border-b border-[#E8EEF5]">
                        <h3 class="text-[19px] font-semibold text-[#1E3A5F] tracking-tight m-0">{{ view.section.title }}</h3>
                      </div>
                    }
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
                      @for (field of view.fields; track field.key) {
                        <div [class.md:col-span-2]="(field.colSpan ?? 1) > 1">
                          <app-otr-field
                            [field]="field"
                            [values]="activeValues()"
                            [error]="activeErrors()[field.key]"
                            [document]="documents()[field.key]"
                            [disabled]="readOnly() || saving() !== null"
                            [uploading]="uploadingField() === field.key"
                            (valueChange)="onValueChange(step, field.key, $event)"
                            (fileSelected)="uploadDocument(field, $event)"
                            (fileRemoved)="removeDocument(field)"
                            (fileViewed)="viewDocument(field)"
                          />
                        </div>
                      }
                    </div>
                  </section>
                }
              } @else {
                <app-otr-review
                  [form]="f"
                  [values]="values()"
                  [documents]="documents()"
                  [errors]="errors()"
                  [declaration]="step.declaration"
                  [accepted]="declarationAccepted()"
                  [declarationError]="generalErrors()['declarationAccepted']"
                  [readOnly]="readOnly()"
                  (editStep)="goToStep($event)"
                  (viewDocument)="viewDocumentByKey($event)"
                  (acceptedChange)="onDeclarationChange($event)"
                />
              }

              <div class="pt-4 border-t border-[#E8EEF5] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  @if (activeStep() === 1) {
                    <button appButton variant="outline" size="lg" type="button" (click)="leave()">
                      <app-icon name="chevron-left" />
                      <span>Back to Profile</span>
                    </button>
                  } @else {
                    <button appButton variant="outline" size="lg" type="button" [disabled]="saving() !== null" (click)="previousStep()">
                      <app-icon name="chevron-left" />
                      <span>Previous</span>
                    </button>
                  }
                </div>

                <div class="flex items-center gap-2.5 sm:gap-3 ml-auto justify-end">
                  @if (step.kind === 'form') {
                    @if (!readOnly()) {
                      <button appButton variant="outline" size="lg" type="button" [disabled]="saving() !== null" (click)="saveDraft()">
                        <span>{{ saving() === 'draft' ? 'Saving...' : 'Save' }}</span>
                      </button>
                    }
                    <button appButton size="lg" type="button" [disabled]="saving() !== null" (click)="nextStep()">
                      <span>{{ saving() === 'next' ? 'Saving...' : 'Next Step' }}</span>
                      <app-icon name="chevron-right" />
                    </button>
                  } @else {
                    <button appButton variant="outline" size="lg" type="button" (click)="downloadPdf()" title="Download complete details in PDF">
                      <app-icon name="document-download" [stroke]="2" />
                      <span>Download PDF</span>
                    </button>
                    @if (readOnly()) {
                      <button appButton size="lg" type="button" (click)="leave()">
                        <span>Back to Profile</span>
                      </button>
                    } @else {
                      <button appButton size="lg" type="button" [disabled]="saving() !== null" (click)="submit()">
                        <span>{{ saving() === 'submit' ? 'Submitting...' : 'Register' }}</span>
                      </button>
                    }
                  }
                </div>
              </div>
            </div>
          }
        }
      </main>

      <!-- A change to a saved step needs its reason (PATCH, kept in the change history) -->
      <app-action-modal
        [isOpen]="reasonOpen()"
        title="Reason for change"
        description="This step is already saved. Tell us why you are changing it; the reason is kept in the change history."
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        maxWidthClass="max-w-md"
        primaryLabel="Save changes"
        secondaryLabel="Cancel"
        [disablePrimary]="saving() !== null"
        (primaryAction)="confirmReason()"
        (secondaryAction)="cancelReason()"
        (close)="cancelReason()"
      >
        <div class="mt-3">
          <label class="block mb-1 text-[13px] font-medium text-slate-700" for="otr-change-reason">
            Reason <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <textarea
            appInput
            id="otr-change-reason"
            class="w-full"
            rows="3"
            maxlength="500"
            placeholder="e.g. Office address changed"
            [invalid]="reasonSubmitted() && !changeReason().trim()"
            [value]="changeReason()"
            (input)="changeReason.set($any($event.target).value)"
          ></textarea>
          @if (reasonSubmitted() && !changeReason().trim()) {
            <p class="m-0 mt-1 text-xs font-medium text-rose-700">Enter the reason for this change.</p>
          }
        </div>
      </app-action-modal>

      <app-action-modal
        [isOpen]="historyOpen()"
        title="Change History"
        description="Every save of your registration steps, newest first."
        [showCloseButton]="true"
        maxWidthClass="max-w-4xl"
        [scrollable]="true"
        primaryLabel="Close"
        [showPrimaryArrow]="false"
        secondaryLabel=""
        (primaryAction)="historyOpen.set(false)"
        (close)="historyOpen.set(false)"
      >
        @if (historyOpen()) {
          <app-otr-update-history
            [form]="form()"
            [logs]="historyLogs()"
            [loading]="historyLoading()"
            [error]="historyError()"
          />
        }
      </app-action-modal>

      <app-action-modal
        [isOpen]="submittedOpen()"
        title="Registration submitted successfully."
        [showCloseButton]="true"
        maxWidthClass="max-w-md"
        primaryLabel="Download PDF"
        secondaryLabel="OK"
        (primaryAction)="downloadPdf()"
        (secondaryAction)="finish()"
        (close)="finish()"
      >
        @if (referenceNo(); as ref) {
          <p class="text-xs sm:text-sm text-slate-600 mt-2 mb-0 tabular-nums">
            Reference number: <span class="font-bold text-navy">{{ ref }}</span>
          </p>
        }
      </app-action-modal>
    </div>
  `
})
export class RegistrationShellComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(OtrRegistrationService);
  private readonly legacy = inject(OtrFormService);
  private readonly pdf = inject(OtrPdfService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.api.form;
  readonly records = this.api.records;

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly activeStep = signal(1);
  /** The user's answers per step key, as edited on screen (saved to the backend step by step). */
  readonly values = signal<Record<string, OtrStepValues>>({});
  /** The backend's validation messages per step and field. */
  readonly errors = signal<OtrErrorMap>({});
  readonly saving = signal<SavingState>(null);
  readonly uploadingField = signal<string | null>(null);
  readonly declarationAccepted = signal(false);
  readonly submittedOpen = signal(false);

  /** Reason dialog for a change to a saved step (PATCH). */
  readonly reasonOpen = signal(false);
  readonly changeReason = signal('');
  readonly reasonSubmitted = signal(false);
  private pendingChange: { step: OtrStepDef; state: 'next' | 'draft'; done: () => void } | null = null;

  /** Change history (GET /otr/me/update-logs). */
  readonly historyOpen = signal(false);
  readonly historyLoading = signal(false);
  readonly historyError = signal<string | null>(null);
  readonly historyLogs = signal<OtrUpdateLogDto[]>([]);
  /** The history button shows once any step is saved. */
  readonly hasSavedSteps = computed(() => this.completedSteps().length > 0);

  readonly readOnly = computed(() => isSubmitted(this.records()));
  readonly referenceNo = computed(() => referenceNumber(this.records()));
  readonly documents = computed(() => {
    const form = this.form();
    return form ? documentsFrom(form, this.records()) : {};
  });
  readonly stepperSteps = computed<StepperStep[]>(() => (this.form()?.steps ?? []).map(s => ({ label: s.title })));
  readonly completedSteps = computed(() => {
    const form = this.form();
    if (!form) return [];
    const saved = savedStepNumbers(form, this.records());
    return this.readOnly() ? [...saved, form.steps[form.steps.length - 1].number] : saved;
  });
  readonly activeStepDef = computed(() => this.form()?.steps.find(s => s.number === this.activeStep()));
  readonly activeValues = computed(() => {
    const step = this.activeStepDef();
    return step ? this.values()[step.key] ?? {} : {};
  });
  readonly activeErrors = computed(() => {
    const step = this.activeStepDef();
    return step ? this.errors()[step.key] ?? {} : {};
  });
  readonly generalErrors = computed(() => this.errors()[OTR_GENERAL_ERRORS] ?? {});

  /** The sections of the active step with their visible fields. */
  readonly sectionViews = computed<SectionView[]>(() => {
    const step = this.activeStepDef();
    if (!step || step.kind !== 'form') return [];
    const values = this.activeValues();
    let lastGroup: string | undefined;
    return step.sections.flatMap(section => {
      const fields = section.fields.filter(f => isFieldVisible(f, values));
      const groupTitle = section.group && section.group !== lastGroup ? section.group : undefined;
      lastGroup = section.group;
      return fields.length ? [{ section, groupTitle, fields }] : [];
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api
      .load()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ form, records }) => {
          this.values.set(this.valuesFrom(form, records));
          this.declarationAccepted.set(isSubmitted(records));
          this.errors.set({});
          this.activeStep.set(this.startStep(form, records));
          this.loading.set(false);
          this.refreshActiveStep();
        },
        error: (error: unknown) => {
          this.loadError.set(this.loadErrorMessage(error));
          this.loading.set(false);
        }
      });
  }

  onValueChange(step: OtrStepDef, key: string, value: OtrValue): void {
    this.values.update(all => ({ ...all, [step.key]: setStepValue(step, all[step.key] ?? {}, key, value) }));
    this.clearError(step.key, key);
  }

  onDeclarationChange(accepted: boolean): void {
    this.declarationAccepted.set(accepted);
    this.clearError(OTR_GENERAL_ERRORS, 'declarationAccepted');
  }

  /** Stepper click: back at any time; forward saves the current step and stops at the first unsaved step. */
  goToStep(target: number): void {
    const current = this.activeStep();
    if (target === current || this.saving() !== null) return;
    if (target < current || this.readOnly()) {
      this.show(target);
      return;
    }
    this.saveAndAdvance(target);
  }

  nextStep(): void {
    this.goToStep(this.activeStep() + 1);
  }

  previousStep(): void {
    if (this.activeStep() > 1) this.show(this.activeStep() - 1);
  }

  /** Saves the step and stays on it. */
  saveDraft(): void {
    const step = this.activeStepDef();
    if (!step || step.kind !== 'form') return;
    this.saveStep(step, 'draft', () => this.notifications.success(`${step.title} saved.`));
  }

  submit(): void {
    if (this.saving() !== null) return;
    this.saving.set('submit');
    this.api
      .submit(this.declarationAccepted())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(null);
          this.errors.set({});
          this.submittedOpen.set(true);
        },
        error: (error: unknown) => {
          this.saving.set(null);
          const form = this.form();
          if (form && error instanceof ApiError && error.fieldErrors.length > 0) {
            const errors = mapFieldErrors(error.fieldErrors, form);
            this.errors.set(errors);
            const step = firstStepWithErrors(form, errors);
            this.notifications.error(
              step
                ? `Some details need correcting before you can register. Start with "${step.title}".`
                : Object.values(errors[OTR_GENERAL_ERRORS] ?? {})[0] ?? error.message
            );
            return;
          }
          this.notifyFailure(error);
        }
      });
  }

  uploadDocument(field: OtrFieldDef, file: File): void {
    const step = this.activeStepDef();
    if (!step || !field.documentType) return;
    this.uploadingField.set(field.key);
    this.api
      .uploadDocument(field.key, field.documentType, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.uploadingField.set(null);
          this.clearError(step.key, field.key);
        },
        error: (error: unknown) => {
          this.uploadingField.set(null);
          this.setFieldError(step.key, field.key, this.fieldMessage(error, field.key));
        }
      });
  }

  removeDocument(field: OtrFieldDef): void {
    const step = this.activeStepDef();
    if (!step || !field.documentType) return;
    this.uploadingField.set(field.key);
    this.api
      .deleteDocument(field.key, field.documentType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.uploadingField.set(null),
        error: (error: unknown) => {
          this.uploadingField.set(null);
          this.setFieldError(step.key, field.key, this.fieldMessage(error, field.key));
        }
      });
  }

  viewDocument(field: OtrFieldDef): void {
    if (!field.documentType) return;
    this.api
      .documentBlob(field.documentType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank', 'noopener');
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: (error: unknown) => this.notifyFailure(error)
      });
  }

  /** "View" on the review step, which only knows the field key. */
  viewDocumentByKey(fieldKey: string): void {
    const form = this.form();
    const field = form ? formSteps(form).flatMap(stepFields).find(f => f.key === fieldKey) : undefined;
    if (field) this.viewDocument(field);
  }

  downloadPdf(): void {
    this.pdf.generateOtrPdf(this.legacy.formData(), this.referenceNo());
  }

  goBack(): void {
    if (this.activeStep() > 1 && !this.loading() && !this.loadError()) {
      this.previousStep();
    } else {
      this.leave();
    }
  }

  leave(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    void (returnUrl ? this.router.navigateByUrl(returnUrl) : this.router.navigate(['/profile']));
  }

  finish(): void {
    this.submittedOpen.set(false);
    void this.router.navigate(['/profile']);
  }

  // ------------------------------------------------------------------ internals

  private saveAndAdvance(target: number): void {
    const step = this.activeStepDef();
    if (!step || step.kind !== 'form') {
      this.show(target);
      return;
    }
    this.saveStep(step, 'next', () => {
      // Never move past a step the backend holds no saved record for.
      const form = this.form();
      this.show(form ? Math.min(target, currentStepNumber(form, this.records())) : target);
    });
  }

  private saveStep(step: OtrStepDef, state: 'next' | 'draft', done: () => void): void {
    if (this.saving() !== null) return;
    const stepValues = this.values()[step.key] ?? {};
    // The backend stores FormManager answers unchecked: a draft may be incomplete, moving on may not.
    const dynamicErrors = state === 'next' ? dynamicFieldErrors(step, stepValues) : {};
    if (Object.keys(dynamicErrors).length > 0) {
      this.errors.update(all => ({ ...all, [step.key]: { ...(all[step.key] ?? {}), ...dynamicErrors } }));
      this.notifications.error(`Please correct the highlighted fields in ${step.title}.`);
      this.scrollToTop();
      return;
    }
    const record = this.records()[step.key];
    if (hasSavedStep(step.key, record)) {
      // A saved step: nothing to send when nothing changed; a change goes by PATCH with its reason.
      if (!stepPayloadChanged(step, stepValues, record, this.api.lookups())) {
        if (state === 'draft') this.notifications.info('No changes to save.');
        else done();
        return;
      }
      this.pendingChange = { step, state, done };
      this.changeReason.set('');
      this.reasonSubmitted.set(false);
      this.reasonOpen.set(true);
      return;
    }
    this.persist(step, state, undefined, done);
  }

  /** "Save changes" in the reason dialog. */
  confirmReason(): void {
    const pending = this.pendingChange;
    this.reasonSubmitted.set(true);
    const reason = this.changeReason().trim();
    if (!pending || !reason) return;
    this.reasonOpen.set(false);
    this.pendingChange = null;
    this.persist(pending.step, pending.state, reason, pending.done);
  }

  cancelReason(): void {
    this.reasonOpen.set(false);
    this.pendingChange = null;
  }

  openHistory(): void {
    this.historyOpen.set(true);
    this.historyLoading.set(true);
    this.historyError.set(null);
    this.api
      .updateLogs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: logs => {
          this.historyLogs.set(logs);
          this.historyLoading.set(false);
        },
        error: (error: unknown) => {
          this.historyError.set(error instanceof ApiError ? error.message : 'Please try again.');
          this.historyLoading.set(false);
        }
      });
  }

  /** PUT for a new step, PATCH with the reason for a change to a saved one. */
  private persist(step: OtrStepDef, state: 'next' | 'draft', reason: string | undefined, done: () => void): void {
    this.saving.set(state);
    const payload = toStepPayload(step, this.values()[step.key] ?? {}, this.api.lookups());
    this.api
      .saveStep(step.key, payload, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: record => {
          this.saving.set(null);
          // Show what the backend stored (trimmed, upper-cased PAN / IFSC, copied office address).
          this.values.update(all => ({ ...all, [step.key]: initialStepValues(step, record) }));
          this.errors.update(all => {
            const next = { ...all };
            delete next[step.key];
            return next;
          });
          done();
        },
        error: (error: unknown) => {
          this.saving.set(null);
          const form = this.form();
          if (form && error instanceof ApiError && error.fieldErrors.length > 0) {
            const mapped = mapFieldErrors(error.fieldErrors, form, step.key);
            this.errors.update(all => ({ ...all, [step.key]: mapped[step.key] ?? {} }));
            const general = Object.values(mapped[OTR_GENERAL_ERRORS] ?? {});
            const count = Object.keys(mapped[step.key] ?? {}).length;
            this.notifications.error(
              count > 0 ? `Please correct the highlighted fields in ${step.title}.` : general[0] ?? error.message
            );
            this.scrollToTop();
            return;
          }
          this.notifyFailure(error);
        }
      });
  }

  private show(stepNumber: number): void {
    this.activeStep.set(stepNumber);
    this.scrollToTop();
    this.refreshActiveStep();
  }

  /**
   * Re-reads the open step's definition (GET /otr/form/steps/{stepKey}): when the admin changed its FormManager
   * schema since the form was loaded, the step is redrawn with the new fields; typed values are kept.
   */
  private refreshActiveStep(): void {
    const step = this.activeStepDef();
    if (!step || step.kind !== 'form' || this.readOnly()) return;
    this.api
      .refreshStep(step.key)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(next => {
        if (!next) return;
        this.values.update(all => ({ ...all, [next.key]: mergeStepValues(next, all[next.key] ?? {}, this.records()[next.key]) }));
      });
  }

  private scrollToTop(): void {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        /* not available (tests) */
      }
    }
  }

  private valuesFrom(form: OtrFormDef, records: OtrRecords): Record<string, OtrStepValues> {
    const values: Record<string, OtrStepValues> = {};
    for (const step of formSteps(form)) values[step.key] = initialStepValues(step, records[step.key]);
    return values;
  }

  /** Submitted: the review. Otherwise the step asked for in ?step= when reachable, else the first unsaved step. */
  private startStep(form: OtrFormDef, records: OtrRecords): number {
    const last = form.steps[form.steps.length - 1]?.number ?? 1;
    if (isSubmitted(records)) return last;
    const current = currentStepNumber(form, records);
    const asked = Number.parseInt(this.route.snapshot.queryParamMap.get('step') ?? '', 10);
    return Number.isInteger(asked) && asked >= 1 && asked <= current ? asked : current;
  }

  private clearError(stepKey: string, fieldKey: string): void {
    if (!this.errors()[stepKey]?.[fieldKey]) return;
    this.errors.update(all => {
      const step = { ...(all[stepKey] ?? {}) };
      delete step[fieldKey];
      return { ...all, [stepKey]: step };
    });
  }

  private setFieldError(stepKey: string, fieldKey: string, message: string): void {
    this.errors.update(all => ({ ...all, [stepKey]: { ...(all[stepKey] ?? {}), [fieldKey]: message } }));
  }

  /** The backend's message for one field (document errors are plain messages). */
  private fieldMessage(error: unknown, fieldKey: string): string {
    if (error instanceof ApiError) {
      return error.fieldErrors.find(e => e.field.toLowerCase() === fieldKey.toLowerCase())?.message ?? error.message;
    }
    return 'The document could not be saved. Please try again.';
  }

  private notifyFailure(error: unknown): void {
    const message = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
    this.notifications.error(message);
  }

  private loadErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.isForbidden) return 'Your role does not have access to Organization Registration.';
      return error.message;
    }
    return 'Please try again.';
  }
}
