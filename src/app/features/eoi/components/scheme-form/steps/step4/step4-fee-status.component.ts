import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 4: processing fee status summary. */
@Component({
  selector: 'app-step4-fee-status',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Processing Fee</h2>
        </div>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">Paid</span>
      </div>
      <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-xs">
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Amount Paid</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.formattedProcessFee() }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Paid On</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.procFeeDate() }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Transaction ID</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">CIN-SBI-9912081</span>
        </div>
      </div>
    </section>
  `
})
export class Step4FeeStatusComponent {
  protected readonly state = inject(SchemeFormState);
}
