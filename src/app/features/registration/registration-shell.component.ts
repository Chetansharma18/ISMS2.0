import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OtrFormService } from './services/otr-form.service';
import { OtrValidationService } from './services/otr-validation.service';

import { Step1OrgDetailsComponent } from './steps/step1-org-details/step1-org-details.component';
import { Step2OicDetailsComponent } from './steps/step2-oic-details/step2-oic-details.component';
import { Step3AuthPersonComponent } from './steps/step3-auth-person/step3-auth-person.component';
import { Step4BankDetailsComponent } from './steps/step4-bank-details/step4-bank-details.component';
import { Step5PreviewComponent } from './steps/step5-preview/step5-preview.component';

export interface StepMeta {
  number: number;
  label: string;
}

@Component({
  selector: 'app-registration-shell',
  standalone: true,
  imports: [
    CommonModule,
    Step1OrgDetailsComponent,
    Step2OicDetailsComponent,
    Step3AuthPersonComponent,
    Step4BankDetailsComponent,
    Step5PreviewComponent
  ],
  template: `
    <div class="min-h-screen bg-white flex flex-col justify-between selection:bg-[#131862] selection:text-white">

      <!-- ====================================================================
           1. Top Navy Banner (Matching Reference Image)
           ==================================================================== -->
      <header class="w-full bg-[#131862] text-white py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div class="max-w-6xl mx-auto flex items-center justify-between">
          <h1 class="text-base sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
            TP (Training Partners) / PIA (Project Implementing Agency) One Time Registration Form
          </h1>
        </div>
      </header>

      <!-- ====================================================================
           2. Floating Feedback Toast
           ==================================================================== -->
      @if (validationService.toast(); as toast) {
        <div class="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto">
          <div
            class="p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md"
            [class.bg-emerald-900/95]="toast.type === 'success'"
            [class.border-emerald-500/50]="toast.type === 'success'"
            [class.text-emerald-50]="toast.type === 'success'"
            [class.bg-rose-900/95]="toast.type === 'error'"
            [class.border-rose-500/50]="toast.type === 'error'"
            [class.text-rose-50]="toast.type === 'error'"
            [class.bg-amber-900/95]="toast.type === 'warning'"
            [class.border-amber-500/50]="toast.type === 'warning'"
            [class.text-amber-50]="toast.type === 'warning'"
            [class.bg-slate-900/95]="toast.type === 'info'"
            [class.border-slate-500/50]="toast.type === 'info'"
            [class.text-slate-50]="toast.type === 'info'"
          >
            <div class="shrink-0 mt-0.5">
              @if (toast.type === 'success') {
                <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              } @else if (toast.type === 'error') {
                <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              } @else {
                <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            </div>

            <div class="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {{ toast.message }}
            </div>

            <button
              type="button"
              (click)="validationService.clearToast()"
              class="text-white/60 hover:text-white transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      }

      <!-- ====================================================================
           2. Horizontal Tabs Stepper (Single Heading, Clearly Visible Numbers)
           ==================================================================== -->
      <nav class="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div class="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between overflow-x-auto no-scrollbar py-0.5">
            @for (step of steps; track step.number) {
              <button
                type="button"
                (click)="goToStep(step.number)"
                class="flex-1 min-w-[130px] sm:min-w-0 py-4 px-2 sm:px-3 flex items-center justify-center gap-2.5 transition-all text-xs sm:text-[13px] border-b-2 cursor-pointer relative group"
                [class.border-[#131862]]="activeStep() === step.number"
                [class.text-[#131862]]="activeStep() === step.number"
                [class.font-bold]="activeStep() === step.number"
                [class.border-transparent]="activeStep() !== step.number"
                [class.text-slate-600]="activeStep() !== step.number"
                [class.hover:text-slate-900]="activeStep() !== step.number"
                [class.hover:border-slate-300]="activeStep() !== step.number"
              >
                <!-- Number Badge / Status Icon with High Contrast Visible Text -->
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                  [class.bg-[#131862]]="activeStep() === step.number"
                  [class.text-white]="activeStep() === step.number"
                  [class.bg-emerald-600]="isStepCompleted(step.number) && activeStep() !== step.number"
                  [class.text-white]="isStepCompleted(step.number) && activeStep() !== step.number"
                  [class.bg-rose-500]="isStepError(step.number) && activeStep() !== step.number"
                  [class.text-white]="isStepError(step.number) && activeStep() !== step.number"
                  [class.bg-slate-100]="!isStepCompleted(step.number) && !isStepError(step.number) && activeStep() !== step.number"
                  [class.text-slate-700]="!isStepCompleted(step.number) && !isStepError(step.number) && activeStep() !== step.number"
                  [class.border]="!isStepCompleted(step.number) && !isStepError(step.number) && activeStep() !== step.number"
                  [class.border-slate-300]="!isStepCompleted(step.number) && !isStepError(step.number) && activeStep() !== step.number"
                >
                  @if (isStepCompleted(step.number) && activeStep() !== step.number) {
                    <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else if (isStepError(step.number) && activeStep() !== step.number) {
                    <span class="text-white">!</span>
                  } @else {
                    <span [class.text-white]="activeStep() === step.number" [class.text-slate-700]="activeStep() !== step.number">
                      {{ step.number }}
                    </span>
                  }
                </span>

                <!-- Single Heading -->
                <span class="truncate tracking-tight">
                  {{ step.label }}
                </span>
              </button>
            }
          </div>
        </div>
      </nav>

      <!-- ====================================================================
           3. Main Form Container (Single Unified White Background)
           ==================================================================== -->
      <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white">
        
        <!-- Step 1 Container -->
        <div [class.hidden]="activeStep() !== 1">
          <app-step1-org-details></app-step1-org-details>
        </div>

        <!-- Step 2 Container -->
        <div [class.hidden]="activeStep() !== 2">
          <app-step2-oic-details></app-step2-oic-details>
        </div>

        <!-- Step 3 Container -->
        <div [class.hidden]="activeStep() !== 3">
          <app-step3-auth-person></app-step3-auth-person>
        </div>

        <!-- Step 4 Container -->
        <div [class.hidden]="activeStep() !== 4">
          <app-step4-bank-details></app-step4-bank-details>
        </div>

        <!-- Step 5 Container -->
        <div [class.hidden]="activeStep() !== 5">
          <app-step5-preview (editStep)="goToStep($event)"></app-step5-preview>
        </div>

      </main>

      <!-- ====================================================================
           4. Sticky Bottom Action Bar (Neat Side-by-Side Previous & Next Buttons)
           ==================================================================== -->
      <footer class="w-full bg-white border-t border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 sticky bottom-0 z-30 shadow-md">
        <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <!-- Step indicator / Auto-saved status -->
          <div class="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="hidden sm:inline">All changes auto-saved &bull;</span>
            <span>Step {{ activeStep() }} of 5</span>
          </div>

          <!-- Previous and Next buttons neatly set together -->
          <div class="flex items-center gap-2.5 sm:gap-3">
            @if (activeStep() > 1) {
              <button
                type="button"
                (click)="previousStep()"
                class="px-4 sm:px-5 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            }

            @if (activeStep() < 5) {
              <button
                type="button"
                (click)="nextStep()"
                class="px-5 sm:px-7 py-2 rounded-lg bg-[#131862] hover:bg-[#0c1046] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer focus:ring-2 focus:ring-[#131862]/30"
              >
                Next Step
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            } @else {
              <button
                type="button"
                (click)="submitApplication()"
                [disabled]="!canSubmit()"
                class="px-6 sm:px-8 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Submit Application
              </button>
            }
          </div>
        </div>
      </footer>

      <!-- ====================================================================
           5. Submission Success Modal
           ==================================================================== -->
      @if (submittedRegId()) {
        <div class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div class="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-200">
            
            <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div class="space-y-2">
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">
                OTR Registration Submitted!
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your One Time Registration application has been securely recorded and queued for Department verification under ISMS 2.0.
              </p>
            </div>

            <div class="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl space-y-2">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Permanent Registration Reference Number
              </span>
              <div class="flex items-center justify-center gap-2">
                <span class="text-lg sm:text-xl font-mono font-extrabold text-[#131862] tracking-wider">
                  {{ submittedRegId() }}
                </span>
                <button
                  type="button"
                  (click)="copyRegId()"
                  title="Copy Registration ID"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                (click)="navigateToHome()"
                class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#131862] hover:bg-[#0c1046] text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Return to Home
              </button>

              <button
                type="button"
                (click)="printAcknowledgement()"
                class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Acknowledgement
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class RegistrationShellComponent {
  private router = inject(Router);
  otrFormService = inject(OtrFormService);
  validationService = inject(OtrValidationService);

  readonly activeStep = signal<number>(1);
  readonly submittedRegId = signal<string | null>(null);

  readonly steps: StepMeta[] = [
    { number: 1, label: 'Organization Details' },
    { number: 2, label: 'Officer In-Charge' },
    { number: 3, label: 'Authorized Person' },
    { number: 4, label: 'Bank Details' },
    { number: 5, label: 'Preview & Submit' }
  ];

  isStepCompleted(stepNumber: number): boolean {
    const data = this.otrFormService.formData();
    return this.validationService.isStepValid(stepNumber, data);
  }

  isStepError(stepNumber: number): boolean {
    const isSubmitted = this.validationService.submittedSteps().has(stepNumber);
    if (!isSubmitted) return false;
    return !this.isStepCompleted(stepNumber);
  }

  canSubmit(): boolean {
    const data = this.otrFormService.formData();
    const allValid = [1, 2, 3, 4].every(s => this.validationService.isStepValid(s, data));
    return allValid && data.step5DeclarationAgreed;
  }

  goToStep(stepNumber: number): void {
    if (stepNumber < 1 || stepNumber > 5) return;
    this.activeStep.set(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep(): void {
    const current = this.activeStep();
    this.validationService.markStepSubmitted(current);

    const data = this.otrFormService.formData();
    const errors = this.validationService.getStepErrors(current, data);

    if (errors.length > 0) {
      this.validationService.showToast(errors[0], 'error', current);
      return;
    }

    if (current < 5) {
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

  submitApplication(): void {
    const data = this.otrFormService.formData();

    for (let s = 1; s <= 4; s++) {
      this.validationService.markStepSubmitted(s);
      const errors = this.validationService.getStepErrors(s, data);
      if (errors.length > 0) {
        this.goToStep(s);
        this.validationService.showToast(errors[0], 'error', s);
        return;
      }
    }

    if (!data.step5DeclarationAgreed) {
      this.validationService.showToast('Please check the Statutory Legal Undertaking & Declaration checkbox before submitting.', 'warning', 5);
      return;
    }

    const regId = this.otrFormService.submitForm();
    this.submittedRegId.set(regId);
    this.validationService.showToast(`Application successfully submitted! Ref: ${regId}`, 'success');
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
    window.print();
  }

  navigateToHome(): void {
    this.submittedRegId.set(null);
    this.router.navigate(['/']);
  }
}
