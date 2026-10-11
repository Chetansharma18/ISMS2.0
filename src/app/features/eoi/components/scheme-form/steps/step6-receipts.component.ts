import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SchemeFormState } from '../scheme-form.state';

/** Step 6: submission acknowledgement and receipts. */
@Component({
  selector: 'app-step6-receipts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-6 font-sans">
      
      <!-- Top Success Status Banner -->
      <div class="bg-navy text-white p-6 sm:p-7 rounded-2xl shadow-md space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3.5 text-center sm:text-left">
            <div class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              &check;
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-bold tracking-tight text-white" style="color: #ffffff !important;">
                EOI Proposal Successfully Submitted!
              </h3>
              <p class="text-xs text-sky-100 mt-0.5">
                Your proposal for <strong>{{ state.schemeName() }}</strong> ({{ state.schemeRefNo() }}) has been officially registered.
              </p>
            </div>
          </div>

          <!-- Reference Pill & Quick Action -->
          <div class="flex items-center gap-2 flex-wrap justify-center">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-bold">
              <span>Ref: <strong>{{ state.eoiApplicationId() }}</strong></span>
              <button
                type="button"
                (click)="state.copyRef()"
                class="text-[10.5px] px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-white cursor-pointer transition-colors"
              >
                {{ state.copiedRef() ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Download Center Section (Acknowledgement, EMD Fee Receipt, Processing Fee Receipt) -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-navy tracking-tight">
              Download Official Documents &amp; Receipts
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Download the official submission acknowledgment and payment e-Challan receipts for your records.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="state.downloadAllReceipts()"
              class="px-4 py-2 bg-navy hover:bg-navy-dark text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span>Download All (3 Receipts)</span>
            </button>
          </div>
        </div>

        <!-- 3 Download Cards -->
        <div class="space-y-4">
          
          <!-- 1. EOI Proposal Submission Acknowledgment -->
          <div class="p-5 sm:p-6 rounded-xl border border-slate-200 hover:border-navy/50 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm sm:text-base font-bold text-slate-900">
                    Proposal Submission Acknowledgment Receipt
                  </h4>
                  <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-navy">
                    FORM RSLDC-EOI-ACK
                  </span>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Official registration certificate containing implementing agency particulars, 16 verified document annexures list, and digital SHA-256 signature digest.
                </p>
                <div class="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 font-medium flex-wrap">
                  <span>Ref: <strong class="font-mono text-slate-800">{{ state.eoiApplicationId() }}</strong></span>
                  <span>&bull;</span>
                  <span>Status: <strong class="text-emerald-700">✓ Submitted &amp; Verified</strong></span>
                  <span>&bull;</span>
                  <span>Date: {{ state.submissionTimestamp() }}</span>
                </div>
              </div>
            </div>

            <div class="shrink-0 w-full md:w-auto flex items-center justify-end">
              <button
                type="button"
                (click)="state.downloadAcknowledgmentReceipt()"
                class="w-full md:w-auto px-5 py-2.5 bg-navy hover:bg-navy-dark text-white rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span>Download Acknowledgment</span>
              </button>
            </div>
          </div>

          <!-- 2. Earnest Money Deposit (EMD) Fee Receipt -->
          <div class="p-5 sm:p-6 rounded-xl border border-slate-200 hover:border-navy/50 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm sm:text-base font-bold text-slate-900">
                    Earnest Money Deposit (EMD) Fee Receipt
                  </h4>
                  <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-navy">
                    e-GRAS &bull; FORM GA-57
                  </span>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Cyber Treasury Rajasthan official e-Challan receipt for {{ state.formattedEmdFee() }} refundable security deposit remitted under Account Head 8443-00-103.
                </p>
                <div class="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 font-medium flex-wrap">
                  <span>GRN: <strong class="font-mono text-slate-800">{{ state.paymentMethod() === 'exemption' ? 'EXEMPT-UDYAM-RJ14' : 'GRN-RAJ-2026-981241' }}</strong></span>
                  <span>&bull;</span>
                  <span>Amount: <strong class="text-emerald-700 font-bold">{{ state.paymentMethod() === 'exemption' ? '₹ 0.00 (MSME Exempted)' : state.formattedEmdFee() }}</strong></span>
                  <span>&bull;</span>
                  <span>Head: <strong class="font-mono text-slate-700">8443-00-103-00-00</strong></span>
                </div>
              </div>
            </div>

            <div class="shrink-0 w-full md:w-auto flex items-center justify-end">
              <button
                type="button"
                (click)="state.downloadEmdReceipt()"
                class="w-full md:w-auto px-5 py-2.5 bg-navy hover:bg-navy-dark text-white rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span>Download EMD Receipt</span>
              </button>
            </div>
          </div>

          <!-- 3. Tender Processing Fee Receipt -->
          <div class="p-5 sm:p-6 rounded-xl border border-slate-200 hover:border-navy/50 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm sm:text-base font-bold text-slate-900">
                    Tender Processing Fee Receipt
                  </h4>
                  <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-navy">
                    e-GRAS &bull; FORM GA-57
                  </span>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Cyber Treasury Rajasthan official e-Challan receipt for {{ state.formattedProcessFee() }} non-refundable EOI processing fee remitted under Account Head 0070-60-800-01-00.
                </p>
                <div class="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 font-medium flex-wrap">
                  <span>GRN: <strong class="font-mono text-slate-800">GRN-RAJ-2026-981240</strong></span>
                  <span>&bull;</span>
                  <span>Amount: <strong class="text-emerald-700 font-bold">{{ state.formattedProcessFee() }}</strong></span>
                  <span>&bull;</span>
                  <span>Head: <strong class="font-mono text-slate-700">0070-60-800-01-00</strong></span>
                </div>
              </div>
            </div>

            <div class="shrink-0 w-full md:w-auto flex items-center justify-end">
              <button
                type="button"
                (click)="state.downloadProcessingFeeReceipt()"
                class="w-full md:w-auto px-5 py-2.5 bg-navy hover:bg-navy-dark text-white rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span>Download Processing Fee Receipt</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Footer Navigation Bar -->
        <div class="flex items-center justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            (click)="state.goToTenderStatus()"
            class="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <span>Track in Tender Status</span>
          </button>
        </div>

      </div>

    </div>
  `
})
export class Step6ReceiptsComponent {
  protected readonly state = inject(SchemeFormState);
}
