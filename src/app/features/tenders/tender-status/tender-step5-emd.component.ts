import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { SubmittedTender } from '../../../core/models/tender.model';
import { TenderReceiptsService } from './tender-receipts.service';
import { calculateTotalFee } from './tender-status.util';

@Component({
  selector: 'app-tender-step5-emd',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
      <!-- Step 3 Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
          <h3 class="font-semibold text-slate-900 text-sm">
            Step 3: Statutory Fees Payment Details (Processing Fee &amp; EMD)
          </h3>
        </div>
      </div>

      <!-- Simple, Clean & Easy-to-Understand Fees Table -->
      <div class="overflow-x-auto border border-slate-200 rounded-lg">
        <table class="w-full text-xs text-left border-collapse">
          <thead class="bg-surface-muted text-[11px] font-semibold text-slate-600 border-b border-slate-200">
            <tr>
              <th class="py-2.5 px-3 w-12 text-center border-r border-slate-200">#</th>
              <th class="py-2.5 px-3 border-r border-slate-200">Fee Particulars</th>
              <th class="py-2.5 px-3 border-r border-slate-200">Treasury Head</th>
              <th class="py-2.5 px-3 border-r border-slate-200">Treasury GRN / Ref No.</th>
              <th class="py-2.5 px-3 text-right border-r border-slate-200">Amount (₹)</th>
              <th class="py-2.5 px-3 text-center border-r border-slate-200">Status</th>
              <th class="py-2.5 px-3 text-center w-40">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-slate-700 bg-white">
            <!-- Row 1: EOI RFP Processing Fee -->
            <tr class="hover:bg-slate-50/80 transition-colors">
              <td class="py-2.5 px-3 text-center font-bold text-slate-400 border-r border-slate-200">1</td>
              <td class="py-2.5 px-3 border-r border-slate-200">
                <div class="font-semibold text-slate-900">EOI RFP Tender Processing Fee</div>
                <div class="text-[10.5px] text-slate-500">Non-Refundable Statutory Administrative Fee</div>
              </td>
              <td class="py-2.5 px-3 font-mono text-[11px] text-slate-700 border-r border-slate-200">0070-60-800-01-00</td>
              <td class="py-2.5 px-3 font-mono font-bold text-navy text-[11px] border-r border-slate-200">
                {{ app().transactionRef || 'GRN-RAJ-2026-981240' }}
              </td>
              <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                {{ app().processingFee }}
              </td>
              <td class="py-2.5 px-3 text-center border-r border-slate-200">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Paid
                </span>
              </td>
              <td class="py-2.5 px-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    (click)="onViewProcessingFee()"
                    title="View Processing Fee Receipt"
                    class="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-medium cursor-pointer inline-flex items-center gap-1 transition-colors"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    (click)="onDownloadProcessingFee()"
                    title="Download Processing Fee Receipt"
                    class="px-2 py-1 bg-navy hover:bg-navy-dark text-white rounded text-[11px] font-medium cursor-pointer inline-flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    <span>Download</span>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Row 2: Earnest Money Deposit (EMD) -->
            <tr class="hover:bg-slate-50/80 transition-colors">
              <td class="py-2.5 px-3 text-center font-bold text-slate-400 border-r border-slate-200">2</td>
              <td class="py-2.5 px-3 border-r border-slate-200">
                <div class="font-semibold text-slate-900">Earnest Money Deposit (EMD)</div>
                <div class="text-[10.5px] text-slate-500">Refundable Bid Security Deposit / BG Adjustable</div>
              </td>
              <td class="py-2.5 px-3 font-mono text-[11px] text-slate-700 border-r border-slate-200">8443-00-103-00-00</td>
              <td class="py-2.5 px-3 font-mono font-bold text-navy text-[11px] border-r border-slate-200">
                {{ app().emdTransactionRef || 'GRN-RAJ-2026-981241' }}
              </td>
              <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                {{ app().emdAmount }}
              </td>
              <td class="py-2.5 px-3 text-center border-r border-slate-200">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Paid
                </span>
              </td>
              <td class="py-2.5 px-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    (click)="onViewEmdFee()"
                    title="View EMD Receipt"
                    class="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-medium cursor-pointer inline-flex items-center gap-1 transition-colors"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    (click)="onDownloadEmdFee()"
                    title="Download EMD Receipt"
                    class="px-2 py-1 bg-navy hover:bg-navy-dark text-white rounded text-[11px] font-medium cursor-pointer inline-flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    <span>Download</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-50 font-semibold text-slate-800 border-t border-slate-200">
            <tr>
              <td colspan="4" class="py-2.5 px-3 text-right text-xs border-r border-slate-200">Total Statutory Fees Settled:</td>
              <td class="py-2.5 px-3 text-right font-mono text-sm text-navy font-bold border-r border-slate-200">
                {{ totalAmountDeposited() }}
              </td>
              <td colspan="2" class="py-2.5 px-3 text-slate-500 text-[11px] text-center font-normal">
                Both fees settled &amp; verified
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `
})
export class TenderStep5EmdComponent {
  private readonly receipts = inject(TenderReceiptsService);

  readonly app = input.required<SubmittedTender>();
  readonly viewFeeReceipt = output<'processing' | 'emd'>();

  readonly totalAmountDeposited = computed(() =>
    calculateTotalFee(this.app().processingFee, this.app().emdAmount)
  );

  onViewProcessingFee(): void {
    this.viewFeeReceipt.emit('processing');
  }

  onDownloadProcessingFee(): void {
    this.receipts.downloadProcessingFeeReceipt(this.app());
  }

  onViewEmdFee(): void {
    this.viewFeeReceipt.emit('emd');
  }

  onDownloadEmdFee(): void {
    this.receipts.downloadEmdReceipt(this.app());
  }
}
