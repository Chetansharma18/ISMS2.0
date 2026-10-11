import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { SchemeFormState } from '../scheme-form.state';

/** Step 5: EMD payment. */
@Component({
  selector: 'app-step5-emd-payment',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  host: { class: 'block' },
  template: `
    <div class="space-y-6 font-sans">
      
      <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-xs font-sans space-y-6">
        
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-navy tracking-tight">
              Step 5: Earnest Money Deposit (EMD) Fee Payment
            </h3>
            <p class="text-xs text-slate-500 mt-1">
              Deposit the refundable EMD amount of {{ state.formattedEmdFee() }} as security for scheme proposal evaluation.
            </p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-navy border border-blue-200">
            Refundable / BG Adjustable
          </span>
        </div>

        <!-- EMD Fee Breakdown Box -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Security Type</span>
            <span class="text-sm font-bold text-slate-800 block">Earnest Money Deposit (EMD)</span>
            <span class="text-[11px] text-slate-500">Major Head: 8443-00-103 (Security Deposits)</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Refundability</span>
            <span class="text-sm font-bold text-emerald-700 block">100% Refundable</span>
            <span class="text-[11px] text-slate-500">Refunded upon completion of evaluation / BG</span>
          </div>

          <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
            <span class="text-[11px] font-medium text-navy uppercase tracking-wider block">EMD Amount</span>
            <span class="text-xl font-black text-navy block">{{ state.formattedEmdFee() }}</span>
            <span class="text-[11px] text-slate-500">{{ state.emdFeeInWords() }}</span>
          </div>

        </div>

        <!-- Payment Method Selection -->
        <div class="space-y-4 pt-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Payment Method for EMD Deposit:
          </label>
          
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            
            <!-- UPI -->
            <button
              type="button"
              (click)="state.paymentMethod.set('upi')"
              class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
              [ngClass]="state.paymentMethod() === 'upi' ? 'border-navy bg-blue-50/60 ring-2 ring-navy/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900">UPI / QR</span>
                <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                  [ngClass]="state.paymentMethod() === 'upi' ? 'border-navy bg-navy text-white font-bold' : 'border-slate-300 bg-white'">
                  @if (state.paymentMethod() === 'upi') { &check; }
                </span>
              </div>
              <span class="text-[10px] text-slate-500 block leading-tight">Instant App Transfer</span>
            </button>

            <!-- Debit / Credit Card -->
            <button
              type="button"
              (click)="state.paymentMethod.set('card')"
              class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
              [ngClass]="state.paymentMethod() === 'card' ? 'border-navy bg-blue-50/60 ring-2 ring-navy/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900">Card</span>
                <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                  [ngClass]="state.paymentMethod() === 'card' ? 'border-navy bg-navy text-white font-bold' : 'border-slate-300 bg-white'">
                  @if (state.paymentMethod() === 'card') { &check; }
                </span>
              </div>
              <span class="text-[10px] text-slate-500 block leading-tight">Visa, RuPay, Master</span>
            </button>

            <!-- Net Banking -->
            <button
              type="button"
              (click)="state.paymentMethod.set('netbanking')"
              class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
              [ngClass]="state.paymentMethod() === 'netbanking' ? 'border-navy bg-blue-50/60 ring-2 ring-navy/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900">Net Banking</span>
                <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                  [ngClass]="state.paymentMethod() === 'netbanking' ? 'border-navy bg-navy text-white font-bold' : 'border-slate-300 bg-white'">
                  @if (state.paymentMethod() === 'netbanking') { &check; }
                </span>
              </div>
              <span class="text-[10px] text-slate-500 block leading-tight">Corporate &amp; Retail</span>
            </button>

            <!-- Cyber Treasury e-GRAS -->
            <button
              type="button"
              (click)="state.paymentMethod.set('e-gras')"
              class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
              [ngClass]="state.paymentMethod() === 'e-gras' ? 'border-navy bg-blue-50/60 ring-2 ring-navy/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900">Cyber Treasury</span>
                <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                  [ngClass]="state.paymentMethod() === 'e-gras' ? 'border-navy bg-navy text-white font-bold' : 'border-slate-300 bg-white'">
                  @if (state.paymentMethod() === 'e-gras') { &check; }
                </span>
              </div>
              <span class="text-[10px] text-slate-500 block leading-tight">e-GRAS Portal</span>
            </button>

            <!-- MSME Exemption -->
            <button
              type="button"
              (click)="state.paymentMethod.set('exemption')"
              class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
              [ngClass]="state.paymentMethod() === 'exemption' ? 'border-navy bg-blue-50/60 ring-2 ring-navy/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900">MSME Exemption</span>
                <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                  [ngClass]="state.paymentMethod() === 'exemption' ? 'border-navy bg-navy text-white font-bold' : 'border-slate-300 bg-white'">
                  @if (state.paymentMethod() === 'exemption') { &check; }
                </span>
              </div>
              <span class="text-[10px] text-slate-500 block leading-tight">Udyam Verified (₹ 0)</span>
            </button>

          </div>

          @if (state.paymentMethod() === 'exemption') {
            <div class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
              <strong class="block font-bold text-emerald-800">✓ Eligible for MSME / Udyam EMD Exemption</strong>
              <span>Your verified Udyam certificate ({{ state.editableStep1.udyamNumber || 'UDYAM-RJ-14-0028192' }}) entitles this application to 100% EMD waiver under Rajasthan Procurement Rules. Amount payable is <strong>₹ 0.00</strong>.</span>
            </div>
          }
        </div>

        <!-- Footer Action Bar -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-200 flex-wrap gap-3">
          <button
            type="button"
            (click)="state.goToStep(4)"
            class="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            &larr; Back to Complete Preview
          </button>

          <button
            type="button"
            (click)="state.triggerEmdPayment()"
            [disabled]="state.isPaymentProcessing()"
            class="px-8 py-3 bg-navy hover:bg-navy-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            @if (state.isPaymentProcessing()) {
              <span class="animate-spin text-sm">&#9696;</span>
              <span>Processing Payment &amp; Submitting Proposal...</span>
            } @else {
              @if (state.paymentMethod() === 'exemption') {
                <span>Claim MSME Exemption &amp; Submit EOI Application &rarr;</span>
              } @else {
                <span>Pay {{ state.formattedEmdFee() }} EMD &amp; Submit EOI Application &rarr;</span>
              }
            }
          </button>
        </div>

      </div>

    </div>
  `
})
export class Step5EmdPaymentComponent {
  protected readonly state = inject(SchemeFormState);
}
