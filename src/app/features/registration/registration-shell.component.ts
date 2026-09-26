import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
    <div class="min-h-screen bg-white flex flex-col justify-between selection:bg-slate-900 selection:text-white font-sans" style="font-family: 'Inter', sans-serif;">

      <!-- ====================================================================
           Sticky Registration Header (Heading & Stepper combined so heading never hides on scroll)
           ==================================================================== -->
      <header class="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <!-- 1. Form Heading (Reduced Size, Professional & Clean in Theme Blue) -->
        <div class="w-full border-b border-slate-100 py-2 px-4 sm:px-6 lg:px-8 bg-white">
          <div class="max-w-6xl mx-auto flex items-center justify-between">
            <h1 class="font-bold tracking-tight m-0" style="font-size: 16px !important; line-height: 22px !important; color: #0B3558 !important;">
              One Time Registration Form
            </h1>
          </div>
        </div>

        <!-- 2. Horizontal Tabs Stepper (Clean & Purely Responsive) -->
        <nav class="w-full bg-white" aria-label="Registration Steps">
          <div class="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-1 sm:gap-2">
              @for (step of steps; track step.number) {
                <button
                  type="button"
                  (click)="goToStep(step.number)"
                  class="flex-1 min-w-[90px] sm:min-w-0 py-1 px-1.5 sm:px-2 flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer relative group bg-transparent"
                  [class.text-[#0B3558]]="activeStep() === step.number"
                  [class.font-bold]="activeStep() === step.number"
                  [class.text-slate-500]="activeStep() !== step.number"
                  [class.hover:text-[#0B3558]]="activeStep() !== step.number"
                >
                  <!-- Number Badge / Status Icon -->
                  <span
                    class="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center text-[10.5px] sm:text-xs font-semibold shrink-0 transition-colors"
                    [class.bg-[#0B3558]]="activeStep() === step.number"
                    [class.text-white]="activeStep() === step.number"
                    [class.bg-emerald-600]="isStepCompleted(step.number) && activeStep() !== step.number"
                    [class.text-white]="isStepCompleted(step.number) && activeStep() !== step.number"
                    [class.bg-rose-500]="isStepError(step.number) && activeStep() !== step.number"
                    [class.text-white]="isStepError(step.number) && activeStep() !== step.number"
                    [class.bg-slate-100]="!isStepCompleted(step.number) && !isStepError(step.number) && activeStep() !== step.number"
                    [class.text-slate-600]="!isStepCompleted(step.number) && !isStepError(step.number) && activeStep() !== step.number"
                    [class.border]="!isStepCompleted(step.number) && !isStepError(step.number) && activeStep() !== step.number"
                    [class.border-slate-300]="!isStepCompleted(step.number) && !isStepError(step.number) && activeStep() !== step.number"
                  >
                    @if (isStepCompleted(step.number) && activeStep() !== step.number) {
                      <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    } @else if (isStepError(step.number) && activeStep() !== step.number) {
                      <span class="text-white font-bold">!</span>
                    } @else {
                      <span [class.text-white]="activeStep() === step.number" [class.text-slate-600]="activeStep() !== step.number">
                        {{ step.number }}
                      </span>
                    }
                  </span>

                  <!-- Step Label -->
                  <span class="truncate tracking-tight font-medium text-[11px] sm:text-xs">
                    {{ step.label }}
                  </span>
                </button>
              }
            </div>

            <!-- Horizontal Progress Bar Line -->
            <div class="w-full bg-slate-100 h-1 relative overflow-hidden rounded-full mb-1" title="Overall Form Completion Progress">
              <div
                class="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
                [style.width.%]="otrFormService.completionPercentage()"
                role="progressbar"
                [attr.aria-valuenow]="otrFormService.completionPercentage()"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        </nav>
      </header>

      <!-- ====================================================================
           Floating Feedback Toast (Themed in Signature #0B3558 Blue)
           ==================================================================== -->
      @if (validationService.toast(); as toast) {
        <div class="fixed top-24 right-4 sm:right-8 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto">
          <div
            class="p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md"
            [class.bg-emerald-900/95]="toast.type === 'success'"
            [class.border-emerald-500/50]="toast.type === 'success'"
            [class.text-emerald-50]="toast.type === 'success'"
            [class.bg-rose-600]="toast.type === 'error'"
            [class.border-rose-700]="toast.type === 'error'"
            [class.text-white]="toast.type === 'error'"
            [class.bg-[#0B3558]]="toast.type === 'info'"
            [class.border-[#1b4b73]]="toast.type === 'info'"
            [class.text-white]="toast.type === 'info'"
            [class.bg-amber-900/95]="toast.type === 'warning'"
            [class.border-amber-500/50]="toast.type === 'warning'"
            [class.text-amber-50]="toast.type === 'warning'"
          >
            <div class="shrink-0 mt-0.5">
              @if (toast.type === 'success') {
                <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              } @else if (toast.type === 'error') {
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              } @else if (toast.type === 'info') {
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } @else {
                <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            </div>

            <div class="flex-1 text-xs sm:text-sm font-medium leading-snug text-white">
              {{ toast.message }}
            </div>

            <button
              type="button"
              (click)="validationService.clearToast()"
              class="text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      }

      <!-- ====================================================================
           3. Main Form Container (Single Unified White Background, Optimized Height)
           ==================================================================== -->
      <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white">
        
        <!-- Step 1 Container -->
        <div [class.hidden]="activeStep() !== 1">
          <app-step1-org-details></app-step1-org-details>
        </div>

        <!-- Step 2 Container (NOW: Authorized Person) -->
        <div [class.hidden]="activeStep() !== 2">
          <app-step3-auth-person></app-step3-auth-person>
        </div>

        <!-- Step 3 Container (NOW: Officer In-Charge) -->
        <div [class.hidden]="activeStep() !== 3">
          <app-step2-oic-details></app-step2-oic-details>
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
      <footer class="w-full bg-white border-t border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 sticky bottom-0 z-30 shadow-md">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <!-- Step indicator / Auto-saved status -->
         

          <!-- Inline Error Message near Submit Button -->
          @if (submitErrorMessage()) {
            <div class="text-xs text-rose-700 bg-rose-50 border border-rose-300 px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-medium shadow-2xs animate-in fade-in duration-200 max-w-xl">
              <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ submitErrorMessage() }}</span>
            </div>
          }

          <!-- Previous and Next buttons neatly set together (aligned to bottom-right) -->
          <div class="flex items-center gap-2.5 sm:gap-3 ml-auto justify-end">
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
                class="px-5 sm:px-7 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer focus:ring-2 focus:ring-slate-900/30"
              >
                <span>Next Step</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            } @else {
              <button
                type="button"
                (click)="downloadOtrPdf()"
                class="px-4 sm:px-5 py-2 rounded-lg border border-[#0483AC] text-[#0483AC] hover:bg-sky-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Download complete details in tabular PDF"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                (click)="submitApplication()"
                class="px-6 sm:px-8 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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
                <span class="text-lg sm:text-xl font-mono font-extrabold text-slate-900 tracking-wider">
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
                (click)="downloadOtrPdf()"
                class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0483AC] hover:bg-[#036c8f] text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
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

              <button
                type="button"
                (click)="navigateToHome()"
                class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Return to Home
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
  private route = inject(ActivatedRoute);
  otrFormService = inject(OtrFormService);
  validationService = inject(OtrValidationService);

  readonly activeStep = signal<number>(1);
  readonly submittedRegId = signal<string | null>(null);
  readonly submitErrorMessage = signal<string | null>(null);

  constructor() {
    this.route.queryParams.subscribe(params => {
      const step = parseInt(params['step'], 10);
      if (step >= 1 && step <= 5) {
        this.activeStep.set(step);
      }
    });
  }

  readonly steps: StepMeta[] = [
    { number: 1, label: 'Organization Details' },
    { number: 2, label: 'Authorized Person' },
    { number: 3, label: 'Officer In-Charge' },
    { number: 4, label: 'Bank Details' },
    { number: 5, label: 'Preview & Submit' }
  ];

  isStepCompleted(stepNumber: number): boolean {
    if (stepNumber === 5) {
      return this.submittedRegId() !== null;
    }
    const data = this.otrFormService.formData();
    return this.validationService.isStepValid(stepNumber, data);
  }

  isStepError(stepNumber: number): boolean {
    if (stepNumber === 5) {
      return false;
    }
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
    this.submitErrorMessage.set(null);
    this.activeStep.set(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep(): void {
    this.submitErrorMessage.set(null);
    const current = this.activeStep();
    this.validationService.markStepSubmitted(current);

    const data = this.otrFormService.formData();
    const errors = this.validationService.getStepErrors(current, data);

    if (errors.length > 0) {
      this.submitErrorMessage.set(`Please fill all required mandatory fields highlighted in red (${errors[0]}).`);
      this.validationService.showToast(errors[0], 'error', current);
      return;
    }

    if (current < 5) {
      this.activeStep.set(current + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    this.submitErrorMessage.set(null);
    const current = this.activeStep();
    if (current > 1) {
      this.activeStep.set(current - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  submitApplication(): void {
    this.submitErrorMessage.set(null);
    const data = this.otrFormService.formData();

    for (let s = 1; s <= 4; s++) {
      this.validationService.markStepSubmitted(s);
      const errors = this.validationService.getStepErrors(s, data);
      if (errors.length > 0) {
        const stepLabels: Record<number, string> = {
          1: 'Step 1 (Organization Details)',
          2: 'Step 2 (Authorized Person Details)',
          3: 'Step 3 (Details of Officer In-Charge)',
          4: 'Step 4 (Bank Details)'
        };
        this.submitErrorMessage.set(`Form is not filled, some entries are missing in ${stepLabels[s]}. Please fill all mandatory fields (${errors[0]}).`);
        return;
      }
    }

    if (!data.step5DeclarationAgreed) {
      this.submitErrorMessage.set('Form is not filled, some entries are missing: Please check the declaration checkbox to agree before submitting.');
      return;
    }

    this.submitErrorMessage.set(null);
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

  downloadOtrPdf(): void {
    const regId = this.submittedRegId() || 'OTR-RSLDC-2026';
    const s1 = this.otrFormService.step1();
    const s2 = this.otrFormService.step2(); // OIC list
    const s3 = this.otrFormService.step3(); // Auth person
    const s4 = this.otrFormService.step4(); // Bank Details

    const printWindow = window.open('', '_blank', 'width=950,height=850');
    if (!printWindow) {
      window.print();
      return;
    }

    const regAddress = `${s1.registeredAddress || ''}${s1.registeredDistrict ? ', ' + s1.registeredDistrict : ''}${s1.registeredState ? ', ' + s1.registeredState : ''}${s1.registeredPincode ? ' - ' + s1.registeredPincode : ''}`.trim() || '-';
    const officeAddress = s1.sameAsRegistered
      ? 'Same as Registered Office Address'
      : (`${s1.officeAddress || ''}${s1.officeDistrict ? ', ' + s1.officeDistrict : ''}${s1.officeState ? ', ' + s1.officeState : ''}${s1.officePincode ? ' - ' + s1.officePincode : ''}`.trim() || '-');

    const oicRows = (s2 && s2.length > 0)
      ? s2.map((o, idx) => `
        <tr>
          <td style="text-align:center;font-weight:600;">${idx + 1}</td>
          <td style="font-weight:700;">${o.name || '-'}</td>
          <td>${o.designation || '-'}</td>
          <td>${o.mobileNo || '-'}</td>
          <td>${o.emailId || '-'}</td>
          <td style="font-family:monospace;">${o.pan || '-'}</td>
          <td style="font-family:monospace;">${o.aadhaarNo || '-'}</td>
          <td>${idx === 0 ? 'Primary Nodal Officer' : 'Additional Officer'}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="8" style="text-align:center;color:#64748b;padding:8px;">No Officer Details Provided</td></tr>';

    const docs = [
      { name: 'Certificate of Registration', doc: s1.registrationCertDoc },
      { name: 'Company PAN Card', doc: s1.panCardDoc },
      ...(s1.gstRegistered === 'Yes' ? [{ name: 'GST Registration Certificate', doc: s1.gstCertDoc }] : []),
      ...(s1.msmeRegistered === 'Yes' ? [{ name: 'MSME Udyam Certificate', doc: s1.msmeCertDoc }] : []),
      { name: 'Authorization Letter / Board Resolution', doc: s3.authorizationLetterDoc },
      { name: 'Authorized Signatory Identity Proof', doc: s3.idProofDoc },
      ...s2.map((o, i) => ({ name: `Officer #${i + 1} Appointment Letter (${o.name || 'OIC'})`, doc: o.appointmentLetterDoc })),
      ...s2.map((o, i) => ({ name: `Officer #${i + 1} ID Proof (${o.name || 'OIC'})`, doc: o.idProofDoc })),
      { name: 'Bank Cancelled Cheque / Passbook Copy', doc: s4.cancelledChequeDoc }
    ];

    const docRows = docs.map((d, idx) => {
      const isUp = d.doc && d.doc.status === 'uploaded';
      return `
        <tr>
          <td style="text-align:center;font-weight:600;">${idx + 1}</td>
          <td style="font-weight:600;">${d.name}</td>
          <td>${isUp ? d.doc!.fileName : '<span style="color:#94a3b8;">-</span>'}</td>
          <td style="text-align:center;">${isUp ? d.doc!.fileSize : '<span style="color:#94a3b8;">-</span>'}</td>
          <td style="text-align:center;font-weight:600;color:${isUp ? '#15803d' : '#94a3b8'};">
            ${isUp ? 'Attached' : 'Not Attached'}
          </td>
        </tr>
      `;
    }).join('');

    const printDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>ISMS 2.0 - OTR Registration Details - ${regId}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              font-family: Arial, Helvetica, sans-serif;
            }
            body {
              margin: 0;
              padding: 16px;
              background: #ffffff;
              color: #0f172a;
              font-size: 11px;
              line-height: 1.4;
            }
            .pdf-header {
              border-bottom: 2px solid #0B3558;
              padding-bottom: 8px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .gov-subhead {
              font-size: 9.5px;
              font-weight: 700;
              color: #0483AC;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .gov-mainhead {
              font-size: 15px;
              font-weight: 800;
              color: #0B3558;
              margin-top: 2px;
            }
            .gov-docname {
              font-size: 11.5px;
              font-weight: 700;
              color: #334155;
              margin-top: 3px;
            }
            .meta-block {
              text-align: right;
              font-size: 9.5px;
              color: #64748b;
            }
            .sec-header {
              background: #0B3558;
              color: #ffffff;
              font-size: 10.5px;
              font-weight: 700;
              padding: 5px 8px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              margin-top: 12px;
              border-radius: 3px 3px 0 0;
            }
            table.tbl {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              border: 1px solid #cbd5e1;
              margin-bottom: 4px;
            }
            table.tbl th {
              background: #f1f5f9;
              color: #0B3558;
              font-weight: 700;
              padding: 5px 6px;
              text-align: left;
              border: 1px solid #cbd5e1;
            }
            table.tbl td {
              padding: 4.5px 6px;
              border: 1px solid #cbd5e1;
              vertical-align: top;
            }
            table.tbl td.lbl {
              background: #f8fafc;
              color: #475569;
              font-weight: 600;
              width: 22%;
            }
            table.tbl td.val {
              color: #0f172a;
              font-weight: 500;
              width: 28%;
            }
            .declaration-card {
              margin-top: 14px;
              padding: 8px 10px;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              page-break-inside: avoid;
            }
            .declaration-title {
              font-weight: 700;
              color: #0B3558;
              font-size: 10px;
              margin-bottom: 4px;
              text-transform: uppercase;
            }
            .declaration-text {
              font-size: 9.5px;
              color: #334155;
              line-height: 1.45;
            }
            .sign-row {
              display: flex;
              justify-content: space-between;
              margin-top: 24px;
              padding-top: 8px;
              page-break-inside: avoid;
            }
            .sign-col {
              text-align: center;
              font-size: 9.5px;
              color: #475569;
              min-width: 180px;
            }
            .sign-line {
              border-top: 1px solid #94a3b8;
              margin-bottom: 4px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-header">
            <div>
              <div class="gov-subhead">GOVERNMENT OF RAJASTHAN • RSLDC</div>
              <div class="gov-mainhead">INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)</div>
              <div class="gov-docname">ONE TIME REGISTRATION (OTR) - APPLICATION DETAILS</div>
            </div>
            <div class="meta-block">
              <div><strong>Registration Ref:</strong> ${regId}</div>
              <div><strong>Generated Date:</strong> ${printDate}</div>
            </div>
          </div>

          <!-- 1. Organization & Legal Particulars Table -->
          <div class="sec-header">1. Organization &amp; Legal Particulars</div>
          <table class="tbl">
            <tr>
              <td class="lbl">TP/PIA Full Name:</td>
              <td class="val" colspan="3" style="font-weight:700;">${s1.fullName || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">TP/PIA Short Name:</td>
              <td class="val">${s1.shortName || '-'}</td>
              <td class="lbl">Nature of Entity:</td>
              <td class="val">${s1.natureOfEntity || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Registration Number:</td>
              <td class="val" style="font-family:monospace;">${s1.registrationNumber || '-'}</td>
              <td class="lbl">Date of Registration:</td>
              <td class="val">${s1.dateOfRegistration || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">State of Legal Reg.:</td>
              <td class="val">${s1.stateOfLegalReg || '-'}</td>
              <td class="lbl">Company PAN:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s1.companyPan || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">GST Registered:</td>
              <td class="val">${s1.gstRegistered} ${s1.gstRegistered === 'Yes' ? '(' + (s1.gstin || '-') + ')' : ''}</td>
              <td class="lbl">MSME Registered:</td>
              <td class="val">${s1.msmeRegistered} ${s1.msmeRegistered === 'Yes' ? '(' + (s1.udyamNumber || '-') + ')' : ''}</td>
            </tr>
            <tr>
              <td class="lbl">NSDC Partner Status:</td>
              <td class="val">${s1.nsdcPartner || 'Not Applicable'}</td>
              <td class="lbl">Blacklisted by Govt/PSU:</td>
              <td class="val">${s1.blackListed}</td>
            </tr>
            <tr>
              <td class="lbl">Official Contact No.:</td>
              <td class="val">${s1.contactNo || '-'}</td>
              <td class="lbl">Official Email ID:</td>
              <td class="val">${s1.emailId || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Official Website:</td>
              <td class="val" colspan="3">${s1.website || '-'}</td>
            </tr>
          </table>

          <!-- 2. Address Particulars Table -->
          <div class="sec-header">2. Official Address Details</div>
          <table class="tbl">
            <tr>
              <td class="lbl" style="width:25%;">Registered Office Address:</td>
              <td class="val" style="width:75%;">${regAddress}</td>
            </tr>
            <tr>
              <td class="lbl" style="width:25%;">Corporate / Branch Address:</td>
              <td class="val" style="width:75%;">${officeAddress}</td>
            </tr>
          </table>

          <!-- 3. Authorized Person Details Table -->
          <div class="sec-header">3. Authorized Signatory Particulars</div>
          <table class="tbl">
            <tr>
              <td class="lbl">Full Name:</td>
              <td class="val" style="font-weight:700;">${s3.name || '-'}</td>
              <td class="lbl">Designation:</td>
              <td class="val">${s3.designation || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Date of Birth:</td>
              <td class="val">${s3.dob || '-'}</td>
              <td class="lbl">Age:</td>
              <td class="val">${s3.age || '-'} Years</td>
            </tr>
            <tr>
              <td class="lbl">Mobile Number:</td>
              <td class="val">${s3.mobileNo || '-'}</td>
              <td class="lbl">Email Address:</td>
              <td class="val">${s3.emailId || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">PAN:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s3.pan || '-'}</td>
              <td class="lbl">Aadhaar Number:</td>
              <td class="val" style="font-family:monospace;">${s3.aadhaarNo || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Bhamashah Number:</td>
              <td class="val">${s3.bhamashahNo || '-'}</td>
              <td class="lbl">Voter ID Number:</td>
              <td class="val">${s3.voterIdNo || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Passport Number:</td>
              <td class="val">${s3.passportNo || '-'}</td>
              <td class="lbl">Domicile / State:</td>
              <td class="val">${s3.state || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Residence Address:</td>
              <td class="val" colspan="3">${s3.residenceAddress || '-'}</td>
            </tr>
          </table>

          <!-- 4. Officer(s) In-Charge Table -->
          <div class="sec-header">4. Officer(s) In-Charge Details</div>
          <table class="tbl">
            <thead>
              <tr>
                <th style="width:25px;text-align:center;">#</th>
                <th>Officer Name</th>
                <th>Designation</th>
                <th>Mobile No.</th>
                <th>Email ID</th>
                <th>PAN</th>
                <th>Aadhaar No.</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              ${oicRows}
            </tbody>
          </table>

          <!-- 5. Bank Account Details Table -->
          <div class="sec-header">5. Bank Account &amp; Settlement Details</div>
          <table class="tbl">
            <tr>
              <td class="lbl">Name of the Bank:</td>
              <td class="val" style="font-weight:700;">${s4.bankName || '-'}</td>
              <td class="lbl">Branch Name:</td>
              <td class="val">${s4.branchName || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Account Holder Name:</td>
              <td class="val" style="font-weight:600;">${s4.accountHolderName || '-'}</td>
              <td class="lbl">Account Number:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s4.accountNo || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Account Type:</td>
              <td class="val">${s4.accountType || '-'}</td>
              <td class="lbl">Transfer Mode:</td>
              <td class="val">${s4.transferMode || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">IFSC Code:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s4.ifscCode || '-'}</td>
              <td class="lbl">MICR Code:</td>
              <td class="val" style="font-family:monospace;">${s4.micrCode || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Branch Address:</td>
              <td class="val" colspan="3">${s4.branchAddress || '-'}</td>
            </tr>
          </table>

          <!-- 6. Uploaded Documents Verification Checklist Table -->
          <div class="sec-header">6. Attached Verification Documents Checklist</div>
          <table class="tbl">
            <thead>
              <tr>
                <th style="width:25px;text-align:center;">#</th>
                <th>Document Description</th>
                <th>Uploaded File Name</th>
                <th style="width:75px;text-align:center;">File Size</th>
                <th style="width:90px;text-align:center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${docRows}
            </tbody>
          </table>

          <!-- Statutory Declaration -->
          <div class="declaration-card">
            <div class="declaration-title">Solemn Declaration &amp; Affirmation</div>
            <div class="declaration-text">
              I hereby solemnly declare and affirm that all the particulars and documents provided above are true, complete, and correct to the best of my knowledge and belief. I acknowledge that any false or misleading statement will render my application liable for rejection.
            </div>
          </div>

          <!-- Signature Block -->
          <div class="sign-row">
            <div class="sign-col" style="text-align:left;">
              <div>Date: ${printDate}</div>
              <div>Place: _____________________</div>
            </div>
            <div class="sign-col">
              <div style="height:35px;"></div>
              <div class="sign-line"></div>
              <div><strong>Signature of Authorized Signatory</strong></div>
              <div>(Name: ${s3.name || 'Authorized Signatory'})</div>
            </div>
            <div class="sign-col">
              <div style="height:35px;"></div>
              <div class="sign-line"></div>
              <div><strong>Seal of the Organization</strong></div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  navigateToHome(): void {
    this.submittedRegId.set(null);
    this.router.navigate(['/']);
  }
}
