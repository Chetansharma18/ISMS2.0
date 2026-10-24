// ui-guard-allow: page-frame - the registration wizard has its own stepper layout
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OtrFormService } from './services/otr-form.service';
import { OtrValidationService } from './services/otr-validation.service';
import { OtrPdfService } from './services/otr-pdf.service';

import { Step1OrgDetailsComponent } from './steps/step1-org-details/step1-org-details.component';
import { Step3AuthPersonComponent } from './steps/step3-auth-person/step3-auth-person.component';
import { Step4BankDetailsComponent } from './steps/step4-bank-details/step4-bank-details.component';
import { Step5PreviewComponent } from './steps/step5-preview/step5-preview.component';
import { ActionModalComponent } from '../../shared/components/action-modal/action-modal.component';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent, IconComponent } from '../../shared';

export interface StepMeta {
  number: number;
  label: string;
}

@Component({
  selector: 'app-registration-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    Step1OrgDetailsComponent,
    Step3AuthPersonComponent,
    Step4BankDetailsComponent,
    Step5PreviewComponent,
    ActionModalComponent,
    ButtonComponent,
    IconComponent
  ],
  template: `
    <div class="min-h-screen bg-[#FEFEFD] flex flex-col justify-between selection:bg-navy selection:text-white font-sans" >

      <!-- ====================================================================
           Main Content Area
           ==================================================================== -->
      <main class="flex-1 w-full px-4 sm:px-5 lg:px-6 py-4 sm:py-5">

        <!-- 1. Top Header Row (Back Button, Page Title, Mandatory Indicator, Subtitle) -->
        <div class="mb-5 space-y-3">
          <!-- Back button -->
          <div>
            <button appButton variant="outline" size="sm" type="button" (click)="goBack()">
              <app-icon name="back" />
              <span>Back</span>
            </button>
          </div>

          <!-- Title and Subtitle Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">
              Organization Registration Form
            </h1>
            <span class="text-xs text-slate-500 font-medium select-none">
              Fields marked with <span class="text-rose-500 font-bold">*</span> are mandatory
            </span>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
            @if (activeStep() === 1) {
              Please provide your organisation details to complete the registration process.
            } @else if (activeStep() === 2) {
              Please provide the required details to complete the registration process.
            } @else if (activeStep() === 3) {
              Please provide the required details to complete the registration process.
            } @else {
              Review all the details before submitting your registration.
            }
          </p>
        </div>

        <!-- 2. Step Progress Indicator (Card with 4 Evenly Distributed Steps) -->
        <nav aria-label="Registration Steps" class="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-4 sm:px-8 py-3.5 sm:py-4.5 mb-5 overflow-x-auto no-scrollbar">
          <div class="flex items-center justify-between w-full min-w-135 sm:min-w-0">
            @for (step of steps; track step.number; let last = $last) {
              <!-- Step Item Button -->
              <button
                appButton
                variant="ghost"
                type="button"
                (click)="goToStep(step.number)"
                class="gap-2 sm:gap-2.5 shrink-0 text-left"
              >
                <!-- Number Badge / Checkmark -->
                <span
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors shadow-2xs"
                  [style.background-color]="(activeStep() === step.number || isStepCompleted(step.number)) ? '#0B3558' : '#ffffff'"
                  [style.color]="(activeStep() === step.number || isStepCompleted(step.number)) ? '#ffffff' : '#64748b'"
                  [style.border]="(activeStep() === step.number || isStepCompleted(step.number)) ? '2px solid #0B3558' : '2px solid #cbd5e1'"
                >
                  @if (isStepCompleted(step.number) && activeStep() !== step.number) {
                    <app-icon name="check" [stroke]="3" class="text-white" />
                  } @else {
                    <span [style.color]="(activeStep() === step.number || isStepCompleted(step.number)) ? '#ffffff' : '#64748b'" style="font-weight: 700; font-size: 13px;">
                      {{ step.number }}
                    </span>
                  }
                </span>

                <!-- Step Label -->
                <span
                  class="text-xs sm:text-[13.5px] tracking-tight whitespace-nowrap"
                  [class.font-extrabold]="activeStep() === step.number"
                  [class.text-navy]="activeStep() === step.number"
                  [class.text-slate-800]="isStepCompleted(step.number) && activeStep() !== step.number"
                  [class.font-semibold]="activeStep() !== step.number"
                  [class.text-slate-600]="!isStepCompleted(step.number) && activeStep() !== step.number"
                >
                  {{ step.label }}
                </span>
              </button>

              <!-- Connector Line -->
              @if (!last) {
                <div
                  class="flex-1 h-0.5 mx-2.5 sm:mx-6 transition-colors duration-200"
                  [class.bg-navy]="isStepCompleted(step.number)"
                  [class.bg-slate-200]="!isStepCompleted(step.number)"
                ></div>
              }
            }
          </div>
        </nav>

        <!-- 3. Main Form Card Container -->
        <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6">

          <!-- Step 1 Container: Organization Details -->
          <!-- Step 1 Container: Organization Details -->
          <div [class.hidden]="activeStep() !== 1" class="space-y-6">
            <!-- Step 1 Card Header -->
            <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0 leading-tight">
                  Organisation Details
                </h2>
                <p class="text-xs text-slate-500 m-0 mt-0.5">
                  Step 1 of the application
                </p>
              </div>
              <span class="text-xs text-slate-500 font-medium shrink-0">
                Required fields marked <span class="text-rose-500 font-bold">*</span>
              </span>
            </div>
            <app-step1-org-details></app-step1-org-details>
          </div>

          <!-- Step 2 Container: Authorized Person Details -->
          <div [class.hidden]="activeStep() !== 2" class="space-y-6">
            <!-- Step 2 Card Header -->
            <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0 leading-tight">
                  Authorized Person Details
                </h2>
                <p class="text-xs text-slate-500 m-0 mt-0.5">
                  Step 2 of the application
                </p>
              </div>
              <span class="text-xs text-slate-500 font-medium shrink-0">
                Required fields marked <span class="text-rose-500 font-bold">*</span>
              </span>
            </div>
            <app-step3-auth-person></app-step3-auth-person>
          </div>

          <!-- Step 3 Container: Organisation Bank Details -->
          <div [class.hidden]="activeStep() !== 3" class="space-y-4">
            <!-- Step 3 Card Header -->
            <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0 leading-tight">
                  Organisation Bank Details
                </h2>
                <p class="text-xs text-slate-500 m-0 mt-0.5">
                  Step 3 of the application
                </p>
              </div>
              <span class="text-xs text-slate-500 font-medium shrink-0">
                Required fields marked <span class="text-rose-500 font-bold">*</span>
              </span>
            </div>
            <app-step4-bank-details></app-step4-bank-details>
          </div>

          <!-- Step 4 Container: Preview & Submit -->
          <div [class.hidden]="activeStep() !== 4" class="space-y-4">
            <!-- Step 4 Card Header -->
            <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0 leading-tight">
                  Review &amp; Submit
                </h2>
                <p class="text-xs text-slate-500 m-0 mt-0.5">
                  Step 4 of the application
                </p>
              </div>
            </div>
            <app-step5-preview (editStep)="goToStep($event)"></app-step5-preview>
          </div>

          <!-- 4. Form Action Buttons (Per Step Navigation) -->
          <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <!-- Left Side: Previous Button (Steps 2, 3, 4) / Back to Profile (Step 1) -->
            <div>
              @if (activeStep() === 1) {
                <button appButton variant="outline" size="lg" type="button" (click)="goBack()">
                  <app-icon name="chevron-left" />
                  <span>Back to Profile</span>
                </button>
              } @else if (activeStep() > 1) {
                <button appButton variant="outline" size="lg" type="button" (click)="previousStep()">
                  <app-icon name="chevron-left" />
                  <span>Previous</span>
                </button>
              }
            </div>

            <!-- Right Side: Action Buttons -->
            <div class="flex items-center gap-2.5 sm:gap-3 ml-auto justify-end">
              <!-- STEP 1 NAVIGATION: [Next Step ->] -->
              @if (activeStep() === 1) {
                <button appButton size="lg" type="button" (click)="nextStep()">
                  <span>Next Step</span>
                  <app-icon name="chevron-right" />
                </button>
              }

              <!-- STEP 2 NAVIGATION: [Previous (left)] [Save as Draft] [Next Step ->] -->
              @if (activeStep() === 2) {
              

                <button appButton size="lg" type="button" (click)="nextStep()">
                  <span>Next Step</span>
                  <app-icon name="chevron-right" />
                </button>
              }

              <!-- STEP 3 NAVIGATION: [Previous (left)] [Next Step ->] -->
              @if (activeStep() === 3) {
                <button appButton size="lg" type="button" (click)="nextStep()">
                  <span>Next Step</span>
                  <app-icon name="chevron-right" />
                </button>
              }

              <!-- STEP 4 NAVIGATION: [Previous (left)] [Download PDF] [Save as Draft] [Submit Application] -->
              @if (activeStep() === 4) {
                <button appButton variant="outline" size="lg" type="button" (click)="downloadOtrPdf()" title="Download complete details in PDF">
                  <app-icon name="document-download" [stroke]="2" />
                  <span>Download PDF</span>
                </button>

                @if (isAlreadySubmitted()) {
                  <button appButton size="lg" type="button" (click)="backToProfile()">
                    <span>Back to Profile</span>
                  </button>
                } @else {
                  <button appButton size="lg" type="button" (click)="submitApplication()">
                    <span>Register</span>
                  </button>
                }
              }
            </div>
          </div>

        </div>

      </main>

      <!-- ====================================================================
           Floating Feedback Toast
           ==================================================================== -->
      @if (validationService.toast(); as toast) {
        <div class="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto">
          <div
            class="p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md"
            [class.bg-emerald-900/95]="toast.type === 'success'"
            [class.border-emerald-500/50]="toast.type === 'success'"
            [class.text-emerald-50]="toast.type === 'success'"
            [class.bg-rose-600]="toast.type === 'error' || toast.type === 'warning'"
            [class.border-rose-700]="toast.type === 'error' || toast.type === 'warning'"
            [class.text-white]="toast.type === 'error' || toast.type === 'warning'"
            [class.bg-navy]="toast.type === 'info'"
            [class.border-[#1b4b73]]="toast.type === 'info'"
            [class.text-white]="toast.type === 'info'"
          >
            <div class="shrink-0 mt-0.5">
              @if (toast.type === 'success') {
                <app-icon name="check" size="lg" [stroke]="2.5" class="text-emerald-400" />
              } @else if (toast.type === 'error' || toast.type === 'warning') {
                <div class="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                  <app-icon name="close" size="sm" [stroke]="3" class="text-rose-600" />
                </div>
              } @else {
                <app-icon name="info-circle" size="lg" [stroke]="2.5" class="text-white" />
              }
            </div>

            <div class="flex-1 text-xs sm:text-sm font-medium leading-snug text-white">
              {{ toast.message }}
            </div>

            <button
              appButton
              variant="inverse"
              size="xs"
              iconOnly
              type="button"
              (click)="validationService.clearToast()"
              aria-label="Dismiss notification"
            >
              <app-icon name="close" [stroke]="2" />
            </button>
          </div>
        </div>
      }

      <!-- ====================================================================
           5. Submission Success Popup (Clean, Minimal, Professional)
           ==================================================================== -->
      <app-action-modal
        [isOpen]="!!submittedRegId()"
        title="Profile created successfully."
        [showCloseButton]="true"
        maxWidthClass="max-w-md"
        primaryLabel="Download PDF"
        secondaryLabel="OK"
        (primaryAction)="downloadOtrPdf()"
        (secondaryAction)="navigateToExistingUserProfile()"
        (close)="navigateToExistingUserProfile()"
      >
        <p class="text-xs sm:text-sm text-slate-600 mt-2 mb-0 tabular-nums">
          USER ID: <span class="font-bold text-navy">{{ submittedRegId() }}</span>
        </p>
      </app-action-modal>

    </div>
  `
})
export class RegistrationShellComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  otrFormService = inject(OtrFormService);
  validationService = inject(OtrValidationService);
  private pdfService = inject(OtrPdfService);
  private destroyRef = inject(DestroyRef);

  readonly activeStep = signal<number>(1);
  readonly submittedRegId = signal<string | null>(null);
  readonly step1CompRef = viewChild<Step1OrgDetailsComponent>('step1Comp');

  readonly isAlreadySubmitted = computed(() => {
    const data = this.otrFormService.formData();
    return data.status === 'Submitted' || this.submittedRegId() !== null;
  });

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const step = parseInt(params['step'], 10);
      if (step >= 1 && step <= 4) {
        this.activeStep.set(step);
      }
    });
  }

  readonly steps: StepMeta[] = [
    { number: 1, label: 'Organisation Details' },
    { number: 2, label: 'Authorized Person' },
    { number: 3, label: 'Organisation Bank Details' },
    { number: 4, label: 'Preview & Submit' }
  ];

  isStepCompleted(stepNumber: number): boolean {
    const data = this.otrFormService.formData();
    const isSubmitted = data.status === 'Submitted' || this.submittedRegId() !== null;
    if (isSubmitted) {
      return true;
    }
    if (stepNumber === 4) {
      return false;
    }
    return this.validationService.isStepValid(stepNumber, data);
  }

  isStepError(stepNumber: number): boolean {
    if (stepNumber === 4) {
      return false;
    }
    const isSubmitted = this.validationService.submittedSteps().has(stepNumber);
    if (!isSubmitted) return false;
    return !this.isStepCompleted(stepNumber);
  }

  canSubmit(): boolean {
    const data = this.otrFormService.formData();
    return [1, 2, 3].every(s => this.validationService.isStepValid(s, data));
  }

  goToStep(stepNumber: number): void {
    if (stepNumber < 1 || stepNumber > 4) return;
    this.activeStep.set(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep(): void {
    const current = this.activeStep();

    if (current === 1) {
      this.validationService.markStepSubmitted(1);
      const errors = this.validationService.validateStep1(this.otrFormService.step1());
      if (errors.length > 0) {
        this.validationService.showToast('Please fill all mandatory fields marked with * in Organisation Details', 'error', 1);
        return;
      }
    }

    if (current < 4) {
      this.activeStep.set(current + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    const current = this.activeStep();
    if (current > 1) {
      this.activeStep.set(current - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  saveDraft(): void {
    this.otrFormService.saveDraft();
    this.validationService.showToast('Registration progress saved as draft successfully!', 'info');
  }

  submitApplication(): void {
    const data = this.otrFormService.formData();

    for (let s = 1; s <= 3; s++) {
      this.validationService.markStepSubmitted(s);
      const errors = this.validationService.getStepErrors(s, data);
      if (errors.length > 0) {
        this.validationService.showToast('Please fill all mandatory fields marked with *', 'error', s);
        this.goToStep(s);
        return;
      }
    }

    const regId = this.otrFormService.submitForm();
    this.submittedRegId.set(regId);
    this.validationService.showToast(`Application successfully submitted! Ref: ${regId}`, 'success');

    // Automatically download filled profile PDF
    try {
      this.downloadOtrPdf();
    } catch (e) {
      console.warn('Auto download error:', e);
    }
  }

  copyRegId(): void {
    const regId = this.submittedRegId();
    if (regId && navigator.clipboard) {
      navigator.clipboard.writeText(regId).then(() => {
        this.validationService.showToast('Registration ID copied to clipboard!', 'info');
      });
    }
  }

  printAcknowledgement(): void {
    this.pdfService.printOtrProfile(this.otrFormService.formData(), this.submittedRegId());
  }

  downloadOtrPdf(): void {
    this.pdfService.generateOtrPdf(this.otrFormService.formData(), this.submittedRegId());
  }

  goBack(): void {
    if (this.activeStep() > 1) {
      this.previousStep();
    } else {
      this.router.navigate(['/profile']);
    }
  }

  backToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToExistingUserProfile(): void {
    const data = this.otrFormService.formData();
    const orgName = data.step1.fullName?.trim() || data.step1.shortName?.trim() || 'Approved Citizen (TP)';

    this.otrFormService.setExistingUserData(data);

    // Transition session to existing_user persona with complete profile status
    this.authService.login({
      id: orgName,
      ssoId: 'new_user',
      label: orgName,
      subLabel: 'Registered TP/PIA',
      role: 'existing_user',
      isProfileComplete: true
    }, null);

    this.submittedRegId.set(null);
    this.router.navigate(['/tenders']);
  }

  navigateToHome(): void {
    this.submittedRegId.set(null);
    this.router.navigate(['/']);
  }
}
