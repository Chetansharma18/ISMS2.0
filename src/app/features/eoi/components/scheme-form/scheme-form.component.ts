import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location, NgClass } from '@angular/common';
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
  imports: [NgClass, DocumentViewerModalComponent, ActionModalComponent, StepperComponent, SchemeHeaderCardComponent, Step1ProcessingFeeComponent, Step2OtrProfileComponent, Step3UploadDocumentsComponent, Step4CompletePreviewComponent, Step5EmdPaymentComponent, Step6ReceiptsComponent],
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
           DOCUMENT VIEWER MODAL
           ==================================================================== -->
      <app-document-viewer-modal
        [isOpen]="state.isViewerOpen()"
        [doc]="state.activeViewerDoc()"
        [title]="state.activeViewerTitle()"
        (close)="state.closeViewer()"
      />

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
      @if (showEmdSuccessModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans"
             style="background: rgba(10, 20, 40, 0.45); backdrop-filter: blur(3px);"
             role="dialog"
             aria-modal="true"
             (click)="closeSuccessModalAndGoToStep6()">
          <div class="w-full max-w-md bg-white rounded-xl border border-slate-200 relative font-sans shadow-2xl p-5 sm:p-6 text-left my-auto animate-in zoom-in-95 duration-150"
               (click)="$event.stopPropagation()">
            
            <!-- Close Button (Crisp SVG matching application font/UI style) -->
            <button
              type="button"
              (click)="closeSuccessModalAndGoToStep6()"
              class="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none"
              title="Close"
              aria-label="Close"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Title & Message -->
            <div class="pr-7 space-y-1">
              <h3 class="text-base sm:text-lg font-bold text-[#0B3558] m-0 tracking-tight leading-snug">
                EOI Successfully Submitted
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 m-0 leading-relaxed">
                Your Expression of Interest application has been successfully submitted.
              </p>
            </div>

            <!-- Details: Scheme Name & Application Number -->
            <div class="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5 text-xs sm:text-sm">
              <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span class="text-slate-500 font-medium text-[11px] uppercase tracking-wider shrink-0">Scheme Name</span>
                <span class="font-semibold text-slate-800 text-xs sm:text-sm sm:text-right">{{ schemeTitle() }}</span>
              </div>
              <div class="border-t border-slate-200"></div>
              <div class="flex items-center justify-between gap-2">
                <span class="text-slate-500 font-medium text-[11px] uppercase tracking-wider shrink-0">Application Number</span>
                <span class="font-mono font-bold text-[#0B3558] text-xs sm:text-sm">{{ eoiApplicationId() }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-5 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                (click)="goToTenderStatus()"
                class="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer text-center"
              >
                Track in Tender Status
              </button>
              <button
                type="button"
                (click)="closeSuccessModalAndGoToStep6()"
                class="w-full sm:w-auto px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center shadow-xs"
              >
                Proceed to Download Receipts
              </button>
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
  private readonly router = inject(Router);

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
