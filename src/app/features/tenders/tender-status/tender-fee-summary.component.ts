import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SubmittedTender } from '../../../core/models/tender.model';

@Component({
  selector: 'app-tender-fee-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
      <div class="p-4 sm:p-5 rounded-lg bg-white border border-slate-200 text-xs space-y-3">
        <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 flex-wrap gap-2">
          <span class="font-semibold text-brand text-xs">
            Fee Payments &amp; Treasury Verification Status (Settled)
          </span>
          <span class="font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 text-[11px]">
            Total Fees Settled: ₹ 52,000.00
          </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Processing Fee Block -->
          <div class="p-3 bg-surface-muted border border-slate-200 rounded-lg space-y-2">
            <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span class="font-medium text-slate-800 text-xs">1. EOI RFP Processing Fee</span>
              <span class="font-medium text-emerald-700 text-[11px]">Paid</span>
            </div>
            <div class="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-slate-600">
              <div><span class="text-slate-500 text-[11px] block">Amount</span><span class="font-medium text-slate-900">{{ app().processingFee }}</span></div>
              <div><span class="text-slate-500 text-[11px] block">Payment Mode</span><span class="font-medium text-slate-900">Cyber Treasury e-GRAS</span></div>
              <div><span class="text-slate-500 text-[11px] block">Challan GRN</span><span class="font-mono text-slate-900">{{ app().transactionRef }}</span></div>
              <div><span class="text-slate-500 text-[11px] block">Settled On</span><span class="font-medium text-slate-900">{{ app().appliedDate }}</span></div>
            </div>
          </div>

          <!-- EMD Fee Block -->
          <div class="p-3 bg-surface-muted border border-slate-200 rounded-lg space-y-2">
            <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span class="font-medium text-slate-800 text-xs">2. Earnest Money Deposit (EMD)</span>
              <span class="font-medium text-emerald-700 text-[11px]">Deposited</span>
            </div>
            <div class="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-slate-600">
              <div><span class="text-slate-500 text-[11px] block">Amount</span><span class="font-medium text-slate-900">{{ app().emdAmount }}</span></div>
              <div><span class="text-slate-500 text-[11px] block">Payment Mode</span><span class="font-medium text-slate-900">Cyber Treasury e-GRAS</span></div>
              <div><span class="text-slate-500 text-[11px] block">Challan GRN</span><span class="font-mono text-slate-900">{{ app().emdTransactionRef }}</span></div>
              <div><span class="text-slate-500 text-[11px] block">Settled On</span><span class="font-medium text-slate-900">{{ app().appliedDate }}</span></div>
            </div>
          </div>
        </div>
      </div>
  `
})
export class TenderFeeSummaryComponent {
  readonly app = input.required<SubmittedTender>();
}
