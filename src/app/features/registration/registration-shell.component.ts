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
      <header class="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <!-- 1. Form Heading -->
        <div class="w-full border-b border-slate-100 py-3 px-4 sm:px-6 lg:px-8">
          <div class="max-w-6xl mx-auto flex items-center justify-between">
            <h1 class="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug m-0">
              TP (Training Partners) / PIA (Project Implementing Agency) One Time Registration Form
            </h1>
          </div>
        </div>

        <!-- 2. Horizontal Tabs Stepper (Clean Neutral Theme) -->
        <nav class="w-full" aria-label="Registration Steps">
          <div class="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between overflow-x-auto no-scrollbar pt-2.5 pb-2">
              @for (step of steps; track step.number) {
                <button
                  type="button"
                  (click)="goToStep(step.number)"
                  class="flex-1 min-w-[120px] sm:min-w-0 py-1.5 px-2 sm:px-3 flex items-center justify-center gap-2 transition-all text-xs sm:text-[12.5px] cursor-pointer relative group bg-transparent"
                  [class.text-slate-900]="activeStep() === step.number"
                  [class.font-semibold]="activeStep() === step.number"
                  [class.text-slate-500]="activeStep() !== step.number"
                  [class.hover:text-slate-900]="activeStep() !== step.number"
                >
                  <!-- Number Badge / Status Icon -->
                  <span
                    class="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors"
                    [class.bg-slate-900]="activeStep() === step.number"
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

                  <!-- Step Label -->
                  <span class="truncate tracking-tight font-medium">
                    {{ step.label }}
                  </span>
                </button>
              }
            </div>

            <!-- Horizontal Progress Bar Line -->
            <div class="w-full bg-slate-100 h-1 relative overflow-hidden rounded-full mb-1.5" title="Overall Form Completion Progress">
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
            [class.bg-[#0B3558]]="toast.type === 'error' || toast.type === 'info'"
            [class.border-[#1b4b73]]="toast.type === 'error' || toast.type === 'info'"
            [class.text-white]="toast.type === 'error' || toast.type === 'info'"
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
           3. Main Form Container (Single Unified White Background)
           ==================================================================== -->
      <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white">
        
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
      <footer class="w-full bg-white border-t border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 sticky bottom-0 z-30 shadow-md">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <!-- Step indicator / Auto-saved status -->
         

          <!-- Inline Error Message near Submit Button -->
          @if (submitErrorMessage()) {
            <div class="text-xs text-[#0B3558] bg-blue-50/90 border border-blue-200/90 px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-medium shadow-2xs animate-in fade-in duration-200 max-w-xl">
              <svg class="w-4 h-4 text-[#0B3558] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    const s2 = this.otrFormService.step2(); // OIC
    const s3 = this.otrFormService.step3(); // Auth person
    const s4 = this.otrFormService.step4(); // Bank

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    const fyRows = (s1.financialYears || [])
      .map(
        (fy) =>
          `<tr><td style="padding:6px 10px;border:1px solid #cbd5e1;">${fy.year}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;">${fy.totalTurnover || '-'}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;">${fy.skillTurnover || '-'}</td></tr>`
      )
      .join('');

    const oicRows = (s2 || [])
      .map(
        (oic, idx) =>
          `<div style="margin-bottom:8px;padding:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;">
            <strong>Officer #${idx + 1}: ${oic.name}</strong> (${oic.designation || 'OIC'})<br/>
            <span style="color:#64748b;font-size:11px;">Mobile: ${oic.mobileNo} | Email: ${oic.emailId} | PAN: ${oic.pan} | Aadhaar: ${oic.aadhaarNo}</span>
          </div>`
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OTR Registration Acknowledgement - ${regId}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; }
            body { margin: 0; padding: 24px; background: #ffffff; color: #1e293b; font-size: 12px; line-height: 1.5; }
            .receipt-container { max-width: 820px; margin: 0 auto; border: 1px solid #cbd5e1; }
            .header { background: #0483AC; color: #ffffff; padding: 18px 24px; }
            .state-title { color: #fef08a; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
            .system-title { color: #ffffff; font-size: 16px; font-weight: 700; margin-top: 4px; }
            .sub-title { color: #e0f2fe; font-size: 11px; margin-top: 2px; }
            .content { padding: 18px 24px; }
            .ref-card { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
            .ref-label { font-size: 11px; color: #166534; font-weight: 500; }
            .ref-value { font-size: 16px; color: #166534; font-weight: 700; font-family: monospace; }
            .section { margin-bottom: 14px; }
            .section-header { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; font-size: 11px; font-weight: 700; color: #0f172a; text-transform: uppercase; }
            .section-body { border: 1px solid #cbd5e1; border-top: none; padding: 12px; font-size: 11.5px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
            .lbl { color: #64748b; font-size: 10.5px; }
            .val { font-weight: 600; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
            .footer-notes { font-size: 10px; color: #64748b; margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 10px; text-align: center; }
            @media print {
              body { padding: 0; }
              .receipt-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="state-title">GOVERNMENT OF RAJASTHAN • RSLDC</div>
              <div class="system-title">INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)</div>
              <div class="sub-title">One Time Registration (OTR) Permanent Acknowledgement</div>
            </div>
            <div class="content">
              <div class="ref-card">
                <div>
                  <div class="ref-label">PERMANENT REGISTRATION REFERENCE NO.</div>
                  <div class="ref-value">${regId}</div>
                </div>
                <div style="text-align:right;">
                  <div class="ref-label">STATUS</div>
                  <div style="color:#166534;font-weight:700;">SUBMITTED &amp; VERIFIED</div>
                </div>
              </div>

              <!-- Step 1 -->
              <div class="section">
                <div class="section-header">Step 1 – Organization Details</div>
                <div class="section-body">
                  <div class="grid-3" style="margin-bottom:8px;">
                    <div><span class="lbl">Entity Full Name:</span><br/><span class="val">${s1.fullName || '-'}</span></div>
                    <div><span class="lbl">Entity Short Name:</span><br/><span class="val">${s1.shortName || '-'}</span></div>
                    <div><span class="lbl">Nature of Entity:</span><br/><span class="val">${s1.natureOfEntity || '-'}</span></div>
                  </div>
                  <div class="grid-3" style="margin-bottom:8px;">
                    <div><span class="lbl">Registration No.:</span><br/><span class="val">${s1.registrationNumber || '-'}</span></div>
                    <div><span class="lbl">Date of Reg.:</span><br/><span class="val">${s1.dateOfRegistration || '-'}</span></div>
                    <div><span class="lbl">State of Reg.:</span><br/><span class="val">${s1.stateOfLegalReg || '-'}</span></div>
                  </div>
                  <div class="grid-3" style="margin-bottom:8px;">
                    <div><span class="lbl">Company PAN:</span><br/><span class="val">${s1.companyPan || '-'}</span></div>
                    <div><span class="lbl">GSTIN:</span><br/><span class="val">${s1.gstRegistered === 'Yes' ? s1.gstin : 'Not Applicable'}</span></div>
                    <div><span class="lbl">MSME / Udyam:</span><br/><span class="val">${s1.msmeRegistered === 'Yes' ? s1.udyamNumber : 'Not Applicable'}</span></div>
                  </div>
                  ${
                    fyRows
                      ? `
                    <div style="margin-top:6px;">
                      <span class="lbl" style="font-weight:600;">Financial Turnover Summary (₹ in Lacs):</span>
                      <table>
                        <thead><tr style="background:#f1f5f9;"><th style="padding:6px;border:1px solid #cbd5e1;text-align:left;">Financial Year</th><th style="padding:6px;border:1px solid #cbd5e1;text-align:left;">Total Turnover</th><th style="padding:6px;border:1px solid #cbd5e1;text-align:left;">Skill Turnover</th></tr></thead>
                        <tbody>${fyRows}</tbody>
                      </table>
                    </div>
                  `
                      : ''
                  }
                  <div style="margin-top:8px;">
                    <span class="lbl">Registered Office Address:</span><br/>
                    <span class="val">${s1.registeredAddress || '-'}, ${s1.registeredDistrict || ''}, ${s1.registeredState || ''} - ${s1.registeredPincode || ''}</span>
                  </div>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="section">
                <div class="section-header">Step 2 – Authorized Person Details</div>
                <div class="section-body">
                  <div class="grid-3">
                    <div><span class="lbl">Authorized Person Name:</span><br/><span class="val">${s3.name || '-'}</span></div>
                    <div><span class="lbl">Designation:</span><br/><span class="val">${s3.designation || '-'}</span></div>
                    <div><span class="lbl">Mobile No.:</span><br/><span class="val">${s3.mobileNo || '-'}</span></div>
                    <div><span class="lbl">Email ID:</span><br/><span class="val">${s3.emailId || '-'}</span></div>
                    <div><span class="lbl">PAN:</span><br/><span class="val">${s3.pan || '-'}</span></div>
                    <div><span class="lbl">Aadhaar No.:</span><br/><span class="val">${s3.aadhaarNo || '-'}</span></div>
                  </div>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="section">
                <div class="section-header">Step 3 – Officer(s) In-Charge (${s2.length})</div>
                <div class="section-body">
                  ${oicRows}
                </div>
              </div>

              <!-- Step 4 -->
              <div class="section">
                <div class="section-header">Step 4 – Bank Account Particulars</div>
                <div class="section-body">
                  <div class="grid-3">
                    <div><span class="lbl">Bank Name:</span><br/><span class="val">${s4.bankName || '-'}</span></div>
                    <div><span class="lbl">Branch Name:</span><br/><span class="val">${s4.branchName || '-'}</span></div>
                    <div><span class="lbl">Account Type:</span><br/><span class="val">${s4.accountType || '-'}</span></div>
                    <div><span class="lbl">Account Holder:</span><br/><span class="val">${s4.accountHolderName || '-'}</span></div>
                    <div><span class="lbl">Account Number:</span><br/><span class="val">${s4.accountNo || '-'}</span></div>
                    <div><span class="lbl">IFSC Code:</span><br/><span class="val">${s4.ifscCode || '-'}</span></div>
                  </div>
                </div>
              </div>

              <div class="footer-notes">
                This is a computer-generated permanent registration acknowledgment under ISMS 2.0 (RSLDC, Government of Rajasthan).<br/>
                For verification, reference ID: <strong>${regId}</strong> | Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  navigateToHome(): void {
    this.submittedRegId.set(null);
    this.router.navigate(['/']);
  }
}
