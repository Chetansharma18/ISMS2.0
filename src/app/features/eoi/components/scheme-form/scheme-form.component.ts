import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location, NgClass } from '@angular/common';
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
  imports: [NgClass, ActionModalComponent, StepperComponent, SchemeHeaderCardComponent, Step1ProcessingFeeComponent, Step2OtrProfileComponent, Step3UploadDocumentsComponent, Step4CompletePreviewComponent, Step5EmdPaymentComponent, Step6ReceiptsComponent],
  providers: [SchemeFormState],
  template: `
    <div class="w-full min-h-screen bg-slate-50/60 pb-16 font-sans text-slate-800">
      
      <!-- ====================================================================
           1. TOP NAVIGATION BAR: 6-STEP PROGRESS STEPPER (shared StepperComponent)
           ==================================================================== -->
      <header class="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs font-sans">
        <div class="w-full px-3 sm:px-5 lg:px-6 py-3">
          <app-stepper
            [bare]="true"
            [hideLabelsOnMobile]="true"
            ariaLabel="EOI Application Steps"
            [steps]="state.wizardSteps"
            [currentStep]="state.currentStep()"
            [completedSteps]="state.completedWizardSteps()"
            (stepClick)="state.goToStep($event)"
          ></app-stepper>
        </div>
      </header>

      <!-- Main Container -->
      <main class="w-full px-3 sm:px-5 lg:px-6 pt-5 space-y-6 font-sans">
        
        <!-- Back Button -->
        <div class="flex items-center -mt-1 mb-2">
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 rounded-md border border-sky-300 bg-sky-50 hover:bg-sky-100 text-ocean active:scale-95 transition-all cursor-pointer font-semibold shadow-2xs"
            title="Back"
          >
            <svg class="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="font-semibold text-sm">Back</span>
          </button>
        </div>

        <!-- ====================================================================
             SCHEME HEADER CARD (8 Parameters Strip) - SHOWN IN STEP 1 ONLY
             ==================================================================== -->
        @if (state.currentStep() === 1) {
          <app-scheme-header-card />
        }

        <!-- ====================================================================
             STEP 1: PROCESSING FEE PAYMENT & OFFICIAL E-CHALLAN RECEIPT
             ==================================================================== -->
        @if (state.currentStep() === 1) {
          <app-step1-processing-fee />
        }

        <!-- ====================================================================
             STEP 2: OTR COMPLETE PROFILE (Editable Form from the start, no banner)
             ==================================================================== -->
        @if (state.currentStep() === 2) {
          <app-step2-otr-profile />
        }

        <!-- ====================================================================
             STEP 3: UPLOAD DOCUMENTS (16 Documents with Category Tabs)
             ==================================================================== -->
        @if (state.currentStep() === 3) {
          <app-step3-upload-documents />
        }

        <!-- ====================================================================
             STEP 4: COMPLETE PREVIEW (Full OTR Form + Uploaded Docs + Fee Status)
             ==================================================================== -->
        @if (state.currentStep() === 4) {
          <app-step4-complete-preview />
        }

        <!-- ====================================================================
             STEP 5: EMD FEE PAYMENT (Refundable)
             ==================================================================== -->
        @if (state.currentStep() === 5) {
          <app-step5-emd-payment />
        }

        <!-- ====================================================================
             STEP 6: DOWNLOAD RECEIPTS & ACKNOWLEDGEMENT
             ==================================================================== -->
        @if (state.currentStep() === 6) {
          <app-step6-receipts />
        }

      </main>

      <!-- ====================================================================
           PROCESSING FEE PAYMENT SUCCESS MODAL
           ==================================================================== -->
      <app-action-modal
        [isOpen]="state.showProcFeeSuccessModal()"
        accentBarClass="bg-emerald-600"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        maxWidthClass="max-w-lg"
        primaryLabel="Proceed to Step 2: OTR Profile &rarr;"
        secondaryLabel="Close &amp; View Step 1"
        (primaryAction)="state.showProcFeeSuccessModal.set(false); state.goToStep(2)"
        (secondaryAction)="state.showProcFeeSuccessModal.set(false)"
        (close)="state.showProcFeeSuccessModal.set(false)"
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
              Successfully Paid!
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
              Application Processing Fee of <strong class="text-slate-900">{{ state.formattedProcessFee() }}</strong> has been successfully paid and official e-Challan generated.
            </p>
          </div>

          <!-- Challan Summary Box -->
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2.5">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span class="text-slate-500 text-[11px] font-medium">Challan GRN No.</span>
              <span class="font-mono font-bold text-navy text-xs">GRN-RAJ-2026-981240</span>
            </div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span class="text-slate-500 text-[11px] font-medium">CIN / Transaction Ref</span>
              <span class="font-mono font-semibold text-slate-800 text-xs">CIN-SBI-9912081</span>
            </div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span class="text-slate-500 text-[11px] font-medium">Payment Mode</span>
              <span class="font-semibold text-slate-800 text-xs">{{ state.selectedProcPaymentModeLabel }}</span>
            </div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span class="text-slate-500 text-[11px] font-medium">Accounting Head</span>
              <span class="font-mono text-slate-700 text-xs">0070-60-800-01-00</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="font-bold text-slate-700 text-xs">Amount Settled</span>
              <span class="font-black text-emerald-700 text-sm">{{ state.formattedProcessFee() }}</span>
            </div>
          </div>

          <button
            type="button"
            (click)="state.downloadProcessingFeeReceipt()"
            class="mx-auto px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <svg class="w-3.5 h-3.5 text-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            <span>Download Challan</span>
          </button>
        </div>
      </app-action-modal>

      <!-- ====================================================================
           EOI APPLICATION SUCCESSFULLY SUBMITTED POPUP MODAL
           ==================================================================== -->
      <app-action-modal
        [isOpen]="state.showEmdSuccessModal()"
        accentBarClass="bg-emerald-600"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        maxWidthClass="max-w-lg"
        primaryLabel="Proceed to Step 6: Download Receipts &rarr;"
        secondaryLabel="Track in Tender Status"
        (primaryAction)="state.closeSuccessModalAndGoToStep6()"
        (secondaryAction)="state.goToTenderStatus()"
        (close)="state.closeSuccessModalAndGoToStep6()"
      >
        <div class="text-center space-y-4">
        <!-- Success Icon Badge -->
        <div class="relative w-16 h-16 mx-auto">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner ring-8 ring-emerald-50">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="absolute -bottom-1 -right-1 bg-navy text-white p-1 rounded-full shadow-xs">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>

        <!-- Title & Subtitle -->
        <div class="space-y-1">
          <h3 class="text-xl sm:text-2xl font-black text-navy m-0 tracking-tight">
            EOI Successfully Submitted!
          </h3>
          <p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed m-0">
            Your Expression of Interest (EOI) proposal for <strong class="text-slate-900">{{ state.schemeTitle() }}</strong> has been officially registered with RSLDC.
          </p>
        </div>

        <!-- Prominent EOI Application ID Card -->
        <div class="p-3.5 sm:p-4 bg-gradient-to-br from-sky-50/80 via-blue-50/50 to-indigo-50/40 border-2 border-navy/20 rounded-xl space-y-2 text-center relative overflow-hidden shadow-2xs">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10.5px] uppercase font-bold tracking-wider text-navy flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Official EOI Application ID
            </span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Registered &amp; Active
            </span>
          </div>

          <div class="flex items-center justify-between bg-white px-3.5 py-3 rounded-xl border border-slate-200 shadow-xs gap-3">
            <div class="text-left min-w-0">
              <span class="text-[11px] font-bold text-navy block uppercase tracking-wider flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                THIS IS YOUR OFFICIAL EOI ID:
              </span>
              <span class="font-mono text-lg sm:text-xl font-black text-navy tracking-wider select-all break-all block mt-0.5">
                {{ state.eoiApplicationId() }}
              </span>
            </div>
            <button
              type="button"
              (click)="state.copyRef()"
              class="px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
              [ngClass]="state.copiedRef() ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-navy hover:bg-navy-dark text-white'"
              title="Copy EOI Application ID"
            >
              @if (state.copiedRef()) {
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                <span>✓ Copied!</span>
              } @else {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <span>Copy ID</span>
              }
            </button>
          </div>

          <p class="text-[11px] text-slate-500 m-0 leading-tight text-left flex items-start gap-1.5 pt-0.5">
            <svg class="w-3.5 h-3.5 text-ocean shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Please preserve this EOI ID for application tracking, departmental scrutiny updates, and official correspondence.</span>
          </p>
        </div>

        <!-- Key Details Summary Breakdown -->
        <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span class="text-slate-500 text-[11px] font-medium">Scheme Name</span>
            <span class="font-semibold text-slate-800 text-xs">{{ state.schemeName() }}</span>
          </div>
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span class="text-slate-500 text-[11px] font-medium">EOI Reference No.</span>
            <span class="font-mono text-slate-700 text-xs truncate max-w-[60%]" [title]="state.schemeRefNo()">{{ state.schemeRefNo() }}</span>
          </div>
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span class="text-slate-500 text-[11px] font-medium">EMD / Payment Status</span>
            <span class="font-mono font-semibold text-slate-800 text-xs">{{ state.paymentMethod() === 'exemption' ? 'MSME Exempted (₹0.00)' : state.formattedEmdFee() + ' (Settled)' }}</span>
          </div>
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span class="text-slate-500 text-[11px] font-medium">Submission Timestamp</span>
            <span class="font-semibold text-slate-800 text-xs">{{ state.submissionTimestamp() }}</span>
          </div>
          <div class="flex items-center justify-between pt-0.5">
            <span class="font-bold text-slate-700 text-xs">Application Stage</span>
            <span class="inline-flex items-center gap-1 font-bold text-sky-800 text-xs bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse"></span>
              Submitted &bull; Under Review
            </span>
          </div>
        </div>

        </div>
      </app-action-modal>

    </div>
  `
})
export class SchemeFormComponent {
  protected readonly state = inject(SchemeFormState);
  private readonly location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
