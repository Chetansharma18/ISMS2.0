import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';

/**
 * Processing Fee: paid on the Rajasthan Payment Platform (RPP). "Pay with RPP" starts the payment on the backend
 * and opens the gateway; RPP returns to the wizard, which records the fee. The payment mode is chosen on RPP.
 */
@Component({
  selector: 'app-step1-processing-fee',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-4">

      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full bg-[#7C0E44] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Fee Details</h2>
          </div>
          @if (state.procFeeRequired() && state.procFeePaid()) {
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">Paid</span>
              <button appButton variant="outline" size="sm" (click)="state.downloadProcessingFeeReceipt()">
                <app-icon name="download" size="sm" />
                <span>Download Receipt</span>
              </button>
            </div>
          } @else if (!state.procFeeRequired()) {
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">Not payable</span>
          }
        </div>

        @if (!state.procFeeRequired()) {
          <p class="p-4 sm:p-5 text-xs text-slate-600 m-0">No processing fee is payable for this EOI.</p>
        } @else if (state.procFeePaid()) {
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
            <div>
              <span class="text-slate-500 block text-[11.5px] leading-tight">Amount Paid</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.formattedProcessFee() }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] leading-tight">Paid On</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.procFeeDate() }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] leading-tight">Payment Reference No. (PRN)</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums break-all">{{ state.procPaymentRef() }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] leading-tight">RPP Transaction ID</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums break-all">{{ state.processFee()?.rppTxnId || '-' }}</span>
            </div>
          </div>
        } @else {
          <div class="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-slate-500 block text-[11.5px] leading-tight">Payable To</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</span>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-slate-500 block text-[11.5px] leading-tight">Refundability</span>
              <span class="font-semibold text-rose-600 text-[12.5px] block mt-1">Non-Refundable</span>
            </div>
            <div class="p-4 rounded-xl bg-[#FCF8FA] border border-[#EADCE2]">
              <span class="text-slate-500 block text-[11.5px] leading-tight">Amount Payable</span>
              <span class="text-xl font-extrabold text-navy block mt-1">{{ state.formattedProcessFee() }}</span>
              <span class="text-[11.5px] text-slate-500 block mt-0.5">{{ state.processFeeInWords() }}</span>
            </div>
          </div>
          <p class="px-4 sm:px-5 pb-4 m-0 text-[11.5px] text-slate-500 flex items-center gap-1.5">
            <app-icon name="info" size="xs" class="shrink-0" />
            You will be taken to the Rajasthan Payment Platform (RPP) to pay, and brought back here afterwards.
          </p>
        }
      </section>

      @if (state.procFeeError(); as message) {
        <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-2" role="alert">
          <p class="m-0 font-medium">{{ message }}</p>
          @if (!state.procFeePaid()) {
            <button appButton variant="outline" size="sm" [disabled]="state.isProcPaying()" (click)="state.confirmProcessFee()">
              Check payment status
            </button>
          }
        </div>
      }

      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button appButton variant="outline" size="lg" [disabled]="state.isProcPaying()" (click)="state.goToStep(state.stepIndexPreview())">
          &larr; Back to Preview
        </button>
        @if (state.procFeePaid()) {
          <button appButton size="lg" (click)="state.goToStep(state.stepIndexEmd())">Proceed to EMD Payment &rarr;</button>
        } @else {
          <button appButton size="lg" [loading]="state.isProcPaying()" [disabled]="state.isProcPaying()" (click)="state.payProcessingFeeAndProceed()">
            {{ state.isProcPaying() ? 'Please wait...' : 'Pay ' + state.formattedProcessFee() + ' with RPP' }}
          </button>
        }
      </div>
    </div>
  `
})
export class Step1ProcessingFeeComponent {
  protected readonly state = inject(SchemeFormState);
}
