import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-psd-fee-breakdown-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  host: { class: 'block' },
  template: `
    <div class="border border-slate-200 rounded-xl overflow-hidden">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
          <tr>
            <th class="py-2.5 px-4">Fee Description</th>
            <th class="py-2.5 px-4 text-center">Payment Mode</th>
            <th class="py-2.5 px-4 text-right">Amount (INR)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-800">
          <tr>
            <td class="py-3 px-4">
              <div class="font-semibold text-slate-900">Batch PSD Verification Fee</div>
              <div class="text-[11px] text-slate-500">Non-refundable statutory verification fee for batch scheduling</div>
            </td>
            <td class="py-3 px-4 text-center">
              <span class="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                {{ selectedPaymentMethod() }}
              </span>
            </td>
            <td class="py-3 px-4 text-right font-mono font-bold">₹500.00</td>
          </tr>
          <tr class="bg-slate-50/50">
            <td class="py-2.5 px-4 text-slate-500">Cyber Treasury / Gateway Convenience Fee</td>
            <td class="py-2.5 px-4 text-center text-slate-500">Exempt</td>
            <td class="py-2.5 px-4 text-right font-mono font-semibold text-slate-600">₹0.00</td>
          </tr>
        </tbody>
        <tfoot class="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
          <tr>
            <td class="py-3 px-4 text-sm" colspan="2">TOTAL AMOUNT PAID</td>
            <td class="py-3 px-4 text-right text-base font-mono text-emerald-700">₹500.00</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `
})
export class PsdFeeBreakdownTableComponent {
  readonly selectedPaymentMethod = input.required<string>();
}
