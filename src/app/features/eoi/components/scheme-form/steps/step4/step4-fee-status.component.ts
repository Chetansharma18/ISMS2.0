import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 4: processing fee status strip. */
@Component({
  selector: 'app-step4-fee-status',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs space-y-2">
      <div class="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-blue-200">
        <span class="font-bold text-navy uppercase tracking-wider text-[11px]">1. Processing Fee Verification</span>
        <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ Paid ({{ state.formattedProcessFee() }})</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] text-slate-700">
        <div>Amount: <strong class="font-bold text-slate-900">{{ state.formattedProcessFee() }}</strong></div>
        <div>Mode: <strong>{{ state.selectedProcPaymentModeLabel }}</strong></div>
        <div>Challan GRN: <strong class="font-mono text-slate-900">GRN-RAJ-2026-981240</strong></div>
        <div>Settled On: <strong>{{ state.procFeeDate() }}</strong></div>
      </div>
    </div>
  `
})
export class Step4FeeStatusComponent {
  protected readonly state = inject(SchemeFormState);
}
