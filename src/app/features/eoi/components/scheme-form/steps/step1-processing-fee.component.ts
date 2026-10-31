import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';

/**
 * Step 4: Processing Fee Payment.
 * Paid before moving on to EMD payment.
 */
@Component({
  selector: 'app-step1-processing-fee',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-4 font-sans">

      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Fee Details</h2>
          </div>
          @if (state.procFeePaid()) {
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              Paid
            </span>
          }
        </div>

        @if (state.procFeePaid()) {
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
        } @else {
          <div class="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Payable To</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</span>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Refundability</span>
              <span class="font-semibold text-rose-600 text-[12.5px] block mt-1">Non-Refundable</span>
            </div>

            <div class="p-4 rounded-xl bg-sky-50/60 border border-sky-200">
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Amount Payable</span>
              <span class="text-xl font-extrabold text-navy block mt-1">{{ state.formattedProcessFee() }}</span>
              <span class="text-[11.5px] text-slate-500 block mt-0.5">{{ state.processFeeInWords() }}</span>
            </div>
          </div>
        }
      </section>

      <!-- Action bar -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button appButton variant="outline" size="lg" (click)="state.goToStep(3)">
          &larr; Back to Complete Preview
        </button>

        @if (state.procFeePaid()) {
          <button appButton size="lg" (click)="state.goToStep(5)">
            Proceed to EMD Payment &rarr;
          </button>
        } @else {
          <button
            appButton
            size="lg"
            [loading]="state.isProcPaying()"
            (click)="state.payProcessingFeeAndProceed()"
            [disabled]="state.isProcPaying()"
          >
            @if (state.isProcPaying()) {
              <span>Processing...</span>
            } @else {
              <span>Proceed to Pay</span>
            }
          </button>
        }
      </div>

    </div>
  `
})
export class Step1ProcessingFeeComponent {
  protected readonly state = inject(SchemeFormState);
}
