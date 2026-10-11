import { Component, inject, input } from '@angular/core';
import { SubmittedTender } from '../../../core/models/tender.model';
import { TenderReceiptsService } from './tender-receipts.service';

@Component({
  selector: 'app-tender-receipts-section',
  standalone: true,
  host: { class: 'block' },
  template: `
        <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 class="font-semibold text-slate-900 text-sm">
              5. Official Payment Receipts &amp; e-Challan Acknowledgement
            </h3>
          </div>

          <!-- Receipt 1: EOI Proposal Submission Acknowledgment -->
          <div class="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
              <div>
                <div class="text-[10.5px] font-medium text-slate-500">Government of Rajasthan &bull; RSLDC</div>
                <h4 class="text-xs sm:text-[13px] font-semibold text-slate-800">Proposal Submission Acknowledgment Slip (Form RSLDC-EOI-ACK)</h4>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                  {{ app().appRef }}
                </span>
                <button
                  type="button"
                  (click)="downloadAcknowledgmentReceipt()"
                  class="px-3 py-1 bg-navy hover:bg-navy-dark text-white rounded font-medium text-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
              <div><span class="text-slate-500 block text-[11px]">Applied Date</span><span class="font-medium text-slate-900">{{ app().appliedDate }}</span></div>
              <div><span class="text-slate-500 block text-[11px]">Remitter Name</span><span class="font-medium text-slate-900">{{ app().orgDetails.fullName }}</span></div>
              <div><span class="text-slate-500 block text-[11px]">CIN / PAN</span><span class="font-mono font-medium text-slate-900">{{ app().orgDetails.registrationNumber }} / {{ app().orgDetails.companyPan }}</span></div>
              <div><span class="text-slate-500 block text-[11px]">Submission Status</span><span class="font-semibold text-emerald-700">Submitted</span></div>
            </div>
          </div>

          <!-- Receipt 2: Cyber Treasury e-GRAS Challan -->
          <div class="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
              <div>
                <div class="text-[10.5px] font-medium text-slate-500">Finance Department &bull; Cyber Treasury (e-GRAS)</div>
                <h4 class="text-xs sm:text-[13px] font-semibold text-slate-800">e-Challan / Treasury Receipt (Form GA-57)</h4>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                  {{ app().emdTransactionRef }}
                </span>
                <button
                  type="button"
                  (click)="downloadChallanReceipt()"
                  class="px-3 py-1 bg-navy hover:bg-navy-dark text-white rounded font-medium text-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            <table class="w-full text-xs border border-slate-200 border-collapse">
              <thead class="bg-surface-muted font-semibold text-[11px] text-slate-600">
                <tr>
                  <th class="p-2 text-left border-r border-slate-200">Fee Particulars</th>
                  <th class="p-2 text-left border-r border-slate-200">Treasury Head</th>
                  <th class="p-2 text-left border-r border-slate-200">Challan GRN</th>
                  <th class="p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td class="p-2 font-medium">EOI RFP Tender Processing Fee</td>
                  <td class="p-2 font-mono text-[11px]">0070-60-800-01-00</td>
                  <td class="p-2 font-mono text-[11px]">{{ app().transactionRef }}</td>
                  <td class="p-2 text-right font-mono font-medium">{{ app().processingFee }}</td>
                </tr>
                <tr>
                  <td class="p-2 font-medium">Earnest Money Deposit (EMD)</td>
                  <td class="p-2 font-mono text-[11px]">8443-00-103-00-00</td>
                  <td class="p-2 font-mono text-[11px]">{{ app().emdTransactionRef }}</td>
                  <td class="p-2 text-right font-mono font-medium">{{ app().emdAmount }}</td>
                </tr>
                <tr class="bg-slate-50 font-semibold text-slate-800">
                  <td colspan="3" class="p-2 text-right">Total Amount Deposited:</td>
                  <td class="p-2 text-right font-mono text-sm text-navy">₹ 52,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
  `
})
export class TenderReceiptsSectionComponent {
  private readonly receipts = inject(TenderReceiptsService);

  readonly app = input.required<SubmittedTender>();

  downloadAcknowledgmentReceipt(): void {
    this.receipts.downloadAcknowledgment(this.app());
  }

  downloadChallanReceipt(): void {
    this.receipts.downloadChallan(this.app());
  }
}