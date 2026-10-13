import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SchemeFormState } from '../scheme-form.state';

/**
 * Step 5: EMD payment, laid out like Step 1. The payment method is chosen on the payment
 * gateway page; MSME / Udyam registered organisations may instead claim the EMD exemption.
 */
@Component({
  selector: 'app-step5-emd-payment',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-4 font-sans">

      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Fee Details</h2>
        </div>

        <div class="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Payable To</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Refundability</span>
            <span class="font-semibold text-emerald-700 text-[12.5px] block mt-1">Refundable</span>
          </div>

          <div class="p-4 rounded-xl bg-sky-50/60 border border-sky-200">
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Amount Payable</span>
            @if (claimExemption()) {
              <span class="text-xl font-extrabold text-navy block mt-1">&#8377;0</span>
              <span class="text-[11.5px] text-emerald-700 block mt-0.5">MSME / Udyam exemption applied</span>
            } @else {
              <span class="text-xl font-extrabold text-navy block mt-1">{{ state.formattedEmdFee() }}</span>
              <span class="text-[11.5px] text-slate-500 block mt-0.5">{{ state.emdFeeInWords() }}</span>
            }
          </div>
        </div>
      </section>

      @if (exemptionEligible) {
        <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div class="p-4 sm:p-5">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                [checked]="claimExemption()"
                (change)="toggleExemption($any($event.target).checked)"
                class="mt-0.5 w-4 h-4 border-slate-300 rounded accent-navy"
              />
              <span class="text-xs sm:text-[12.5px] text-slate-700 leading-relaxed">
                <span class="font-medium text-slate-900 block">Claim MSME / Udyam EMD exemption</span>
                Udyam No. {{ udyamNumber }}
              </span>
            </label>
          </div>
        </section>
      }

      <!-- Footer Action Bar -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          (click)="state.goToStep(4)"
          class="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          &larr; Back
        </button>

        <button
          type="button"
          (click)="state.triggerEmdPayment()"
          [disabled]="state.isPaymentProcessing()"
          class="px-6 sm:px-7 py-2.5 rounded-lg bg-navy hover:bg-[#07243c] disabled:opacity-70 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          @if (state.isPaymentProcessing()) {
            <span class="animate-spin text-sm">&#9696;</span>
            <span>Processing...</span>
          } @else if (claimExemption()) {
            <span>Submit Application</span>
          } @else {
            <span>Proceed to Pay</span>
          }
        </button>
      </div>

    </div>
  `
})
export class Step5EmdPaymentComponent {
  protected readonly state = inject(SchemeFormState);

  /** Only organisations that are MSME / Udyam registered can claim the exemption. */
  protected readonly exemptionEligible = this.state.editableStep1.msmeRegistered === 'Yes';
  protected readonly udyamNumber = this.state.editableStep1.udyamNumber || '-';

  /** Unticked by default; the exemption is never applied unless the applicant asks for it. */
  protected readonly claimExemption = signal(false);

  constructor() {
    this.state.paymentMethod.set('upi');
  }

  protected toggleExemption(checked: boolean): void {
    this.claimExemption.set(checked);
    this.state.paymentMethod.set(checked ? 'exemption' : 'upi');
  }
}
