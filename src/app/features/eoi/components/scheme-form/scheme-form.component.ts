import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { DocumentViewerModalComponent } from '../../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import { ActionModalComponent } from '../../../../shared/components/action-modal/action-modal.component';
import { StepperComponent } from '../../../../shared/components/stepper/stepper.component';
import { SchemeFormState } from './scheme-form.state';
import { SchemeHeaderCardComponent } from './steps/scheme-header-card.component';
import { Step1ProcessingFeeComponent } from './steps/step1-processing-fee.component';
import { Step2OtrProfileComponent } from './steps/step2-otr-profile.component';
import { Step3UploadDocumentsComponent } from './steps/step3-upload-documents.component';
import { Step4CompletePreviewComponent } from './steps/step4-complete-preview.component';
import { Step5EmdPaymentComponent } from './steps/step5-emd-payment.component';
import { Step6ReceiptsComponent } from './steps/step6-receipts.component';

export type { EoiDocumentItem } from './scheme-form.model';

@Component({
  selector: 'app-scheme-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionModalComponent, StepperComponent, SchemeHeaderCardComponent, Step1ProcessingFeeComponent, Step2OtrProfileComponent, Step3UploadDocumentsComponent, Step4CompletePreviewComponent, Step5EmdPaymentComponent, Step6ReceiptsComponent],
  providers: [SchemeFormState],
  template: `
    <div class="min-h-screen bg-[#FEFEFD] flex flex-col selection:bg-navy selection:text-white font-sans text-slate-800" style="font-family: 'Inter', sans-serif;">

      <main class="flex-1 w-full px-4 sm:px-5 lg:px-6 py-4 sm:py-5">

        <!-- 1. Header row: Back button, page title, mandatory indicator, subtitle (same as Organization Registration Form) -->
        <div class="mb-5 space-y-3">
          <!-- No Back from Step 2: the paid processing fee step cannot be reopened -->
          @if (state.currentStep() !== 2) {
            <div>
              <button
                type="button"
                (click)="goBack()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
            </div>
          }

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">
              Apply for EOI
            </h1>
            <span class="text-xs text-slate-500 font-medium select-none">
              Fields marked with <span class="text-rose-500 font-bold">*</span> are mandatory
            </span>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
            Complete the six steps below to submit your Expression of Interest application.
          </p>
        </div>

        <!-- 2. Step progress card -->
        <div class="mb-5">
          <app-stepper
            variant="wizard"
            ariaLabel="EOI Application Steps"
            [steps]="state.wizardSteps"
            [currentStep]="state.currentStep()"
            [completedSteps]="state.completedWizardSteps()"
            (stepClick)="state.goToStep($event)"
          ></app-stepper>
        </div>

        <!-- Scheme summary strip (step 1 only) -->
        @if (state.currentStep() === 1) {
          <div class="mb-5">
            <app-scheme-header-card />
          </div>
        }

        <!-- 3. Main form card: numbered step title + the active step -->
        <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6">

          <div class="pb-3.5 border-b border-slate-100 space-y-1">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                {{ state.currentStep() }}
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                {{ stepTitle() }}
              </h2>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 pl-10 m-0">
              {{ stepSubtitle() }}
            </p>
          </div>

          @switch (state.currentStep()) {
            @case (1) { <app-step1-processing-fee /> }
            @case (2) { <app-step2-otr-profile /> }
            @case (3) { <app-step3-upload-documents /> }
            @case (4) { <app-step4-complete-preview /> }
            @case (5) { <app-step5-emd-payment /> }
            @case (6) { <app-step6-receipts /> }
          }
        </div>

      </main>
      <!-- ====================================================================
           PROCESSING FEE PAYMENT SUCCESS MODAL
           ==================================================================== -->
      <app-action-modal
        [isOpen]="state.showProcFeeSuccessModal()"
        accentBarClass="bg-emerald-600"
        [showCloseButton]="false"
        [closeOnBackdrop]="false"
        maxWidthClass="max-w-md"
        primaryLabel=""
        secondaryLabel=""
        (close)="keepOpen()"
      >
        <div class="text-center space-y-5">
          <!-- Success Icon -->
          <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner ring-4 ring-emerald-50">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <!-- Title & Subtitle -->
          <div class="space-y-1.5">
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 m-0">
              Payment Successful
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
              Processing fee of <strong class="text-slate-900">{{ state.formattedProcessFee() }}</strong> has been paid.
            </p>
          </div>

          <!-- Payment summary -->
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2.5">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span class="text-slate-500 text-[11px] font-medium">Transaction ID</span>
              <span class="font-mono font-semibold text-slate-800 text-xs">CIN-SBI-9912081</span>
            </div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span class="text-slate-500 text-[11px] font-medium">Paid On</span>
              <span class="font-semibold text-slate-800 text-xs">{{ state.procFeeDate() }}</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="font-bold text-slate-700 text-xs">Amount Paid</span>
              <span class="font-black text-emerald-700 text-sm">{{ state.formattedProcessFee() }}</span>
            </div>
          </div>

          <p class="flex items-center justify-center gap-2 text-xs text-slate-500 m-0" role="status">
            <span class="inline-block w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-navy animate-spin" aria-hidden="true"></span>
            Taking you to Step 2...
          </p>
        </div>
      </app-action-modal>

      <!-- ====================================================================
           EOI APPLICATION SUCCESSFULLY SUBMITTED POPUP MODAL
           ==================================================================== -->
      <app-action-modal
        [isOpen]="state.showEmdSuccessModal()"
        accentBarClass="bg-emerald-600"
        [showCloseButton]="false"
        [closeOnBackdrop]="false"
        maxWidthClass="max-w-md"
        primaryLabel=""
        secondaryLabel=""
        (close)="keepOpen()"
      >
        <div class="text-center space-y-5">
          <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner ring-4 ring-emerald-50">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="space-y-1.5">
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 m-0">Payment Successful</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
              Your EOI application has been submitted.
            </p>
          </div>

          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2.5">
            <div class="flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <span class="text-slate-500 text-[11px] font-medium">Payment Reference No.</span>
              <span class="font-mono font-semibold text-slate-800 text-xs">{{ state.emdPaymentRef() }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 pt-1">
              <span class="text-slate-500 text-[11px] font-medium">EOI Submission Reference No.</span>
              <span class="font-mono font-semibold text-navy text-xs select-all">{{ state.eoiApplicationId() }}</span>
            </div>
          </div>

          <p class="flex items-center justify-center gap-2 text-xs text-slate-500 m-0" role="status">
            <span class="inline-block w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-navy animate-spin" aria-hidden="true"></span>
            Taking you to your receipts...
          </p>
        </div>
      </app-action-modal>

    </div>
  `
})
export class SchemeFormComponent {
  protected readonly state = inject(SchemeFormState);
  private readonly router = inject(Router);

  /** Title of the active step, taken from the stepper definition. */
  protected stepTitle(): string {
    return this.state.wizardSteps[this.state.currentStep() - 1]?.label ?? '';
  }

  /** One-line description shown under the step title. */
  protected stepSubtitle(): string {
    switch (this.state.currentStep()) {
      case 1:
        return `As per RSLDC EOI guidelines, all applicants must pay the non-refundable processing fee of ${this.state.formattedProcessFee()} before submitting their proposal application.`;
      case 2:
        return 'Verify the organisation, authorized signatory and bank details that will accompany your EOI application.';
      case 3:
        return 'Upload the required proposal documents in the supported format and size shown against each one.';
      case 4:
        return 'Please verify the information provided below before proceeding to the EMD payment.';
      case 5:
        return 'Pay the refundable Earnest Money Deposit (EMD) to complete your application.';
      default:
        return 'Download your receipts and acknowledgement for the submitted application.';
    }
  }

  /** The payment success screen cannot be dismissed (Escape included); it moves on to Step 2 by itself. */
  protected keepOpen(): void {
    // intentionally empty
  }

  goBack(): void {
    if (this.state.currentStep() > 1) {
      this.state.goToStep(this.state.currentStep() - 1);
    } else {
      this.router.navigate(['/tenders'], {
        queryParams: { viewRefNo: this.state.schemeRefNo() }
      });
    }
  }
}
