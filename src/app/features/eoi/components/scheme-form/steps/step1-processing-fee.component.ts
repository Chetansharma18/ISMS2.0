import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { SchemeFormState } from '../scheme-form.state';

/** Step 1: processing fee payment and official e-challan receipt. */
@Component({
  selector: 'app-step1-processing-fee',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  host: { class: 'block' },
  template: `
    <div class="space-y-6 font-sans">
      
      <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-xs space-y-6">
        
        <div class="pb-4 border-b border-slate-100">
          <h3 class="text-base sm:text-lg font-bold text-navy tracking-tight">
            Step 1: Non-Refundable EOI Application Processing Fee
          </h3>
          <p class="text-xs text-slate-500 mt-1">
            As per RSLDC EOI guidelines, all applicants must pay the non-refundable processing fee of {{ state.formattedProcessFee() }} before submitting their proposal application.
          </p>
        </div>

        <!-- Fee Breakdown Box -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Fee Classification</span>
            <span class="text-sm font-bold text-slate-800 block">EOI Tender Processing Fee</span>
            <span class="text-[11px] text-slate-500">Major Head: 0070-60-800 (RSLDC Admin)</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Refundability</span>
            <span class="text-sm font-bold text-rose-600 block">Non-Refundable</span>
            <span class="text-[11px] text-slate-500">Government statutory scrutiny fee</span>
          </div>

          <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
            <span class="text-[11px] font-medium text-navy uppercase tracking-wider block">Amount Payable</span>
            <span class="text-xl font-black text-navy block">{{ state.formattedProcessFee() }}</span>
            <span class="text-[11px] text-slate-500">{{ state.processFeeInWords() }}</span>
          </div>

        </div>

        <!-- ================================================================
             PAYMENT OPTIONS (UPI, CARDS, NET BANKING, CYBER TREASURY)
             ================================================================ -->
        @if (!state.procFeePaid()) {
          <div class="space-y-4 pt-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Payment Method for Processing Fee:
            </label>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <!-- UPI -->
              <button
                type="button"
                (click)="state.procPaymentMethod.set('upi')"
                class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                [ngClass]="state.procPaymentMethod() === 'upi' ? 'border-navy bg-blue-50/60 ring-2 ring-navy/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900">UPI / QR Code</span>
                  <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                    [ngClass]="state.procPaymentMethod() === 'upi' ? 'border-navy bg-navy text-white font-bold' : 'border-slate-300 bg-white'">
                    @if (state.procPaymentMethod() === 'upi') { &check; }
                  </span>
                </div>
                <span class="text-[10.5px] text-slate-500 block leading-tight">GPay, PhonePe, Paytm, BHIM</span>
              </button>

              <!-- Debit / Credit Cards -->
              <button
                type="button"
                (click)="state.procPaymentMethod.set('card')"
                class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                [ngClass]="state.procPaymentMethod() === 'card' ? 'border-navy bg-blue-50/60 ring-2 ring-navy/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900">Debit / Credit Card</span>
                  <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                    [ngClass]="state.procPaymentMethod() === 'card' ? 'border-navy bg-navy text-white font-bold' : 'border-slate-300 bg-white'">
                    @if (state.procPaymentMethod() === 'card') { &check; }
                  </span>
                </div>
                <span class="text-[10.5px] text-slate-500 block leading-tight">Visa, RuPay, MasterCard</span>
              </button>

              <!-- Net Banking -->
              <button
                type="button"
                (click)="state.procPaymentMethod.set('netbanking')"
                class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                [ngClass]="state.procPaymentMethod() === 'netbanking' ? 'border-navy bg-blue-50/60 ring-2 ring-navy/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900">Net Banking</span>
                  <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                    [ngClass]="state.procPaymentMethod() === 'netbanking' ? 'border-navy bg-navy text-white font-bold' : 'border-slate-300 bg-white'">
                    @if (state.procPaymentMethod() === 'netbanking') { &check; }
                  </span>
                </div>
                <span class="text-[10.5px] text-slate-500 block leading-tight">SBI, HDFC, ICICI, 50+ Banks</span>
              </button>

              <!-- Cyber Treasury e-GRAS -->
              <button
                type="button"
                (click)="state.procPaymentMethod.set('e-gras')"
                class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                [ngClass]="state.procPaymentMethod() === 'e-gras' ? 'border-navy bg-blue-50/60 ring-2 ring-navy/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900">Cyber Treasury</span>
                  <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                    [ngClass]="state.procPaymentMethod() === 'e-gras' ? 'border-navy bg-navy text-white font-bold' : 'border-slate-300 bg-white'">
                    @if (state.procPaymentMethod() === 'e-gras') { &check; }
                  </span>
                </div>
                <span class="text-[10.5px] text-slate-500 block leading-tight">e-GRAS Rajasthan Portal</span>
              </button>

            </div>

            <!-- Pay Button -->
            <div class="pt-2 flex items-center justify-end">
              <button
                type="button"
                (click)="state.payProcessingFeeAndProceed()"
                [disabled]="state.isProcPaying()"
                class="px-6 py-2.5 bg-navy hover:bg-navy-dark text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                @if (state.isProcPaying()) {
                  <span class="animate-spin text-sm">&#9696;</span>
                  <span>Authorizing Settlement...</span>
                } @else {
                  <span>Pay {{ state.formattedProcessFee() }} Processing Fee &amp; Generate Challan &rarr;</span>
                }
              </button>
            </div>
          </div>
        }

        <!-- ================================================================
             OFFICIAL E-CHALLAN RECEIPT (When Paid)
             ================================================================ -->
        @if (state.procFeePaid()) {
          <div class="space-y-4 pt-2">
            <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
              
              <div class="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    &check;
                  </div>
                  <div>
                    <span class="text-xs font-bold text-navy uppercase tracking-wider block">Official e-Challan Receipt</span>
                    <span class="text-[11px] text-slate-500">Cyber Treasury Rajasthan &bull; e-GRAS Ref: GRN-RAJ-2026-981240</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="state.downloadProcessingFeeReceipt()"
                    class="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5 text-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    <span>Download Challan</span>
                  </button>
                  <button
                    type="button"
                    (click)="state.printReceipt()"
                    class="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print</span>
                  </button>
                </div>
              </div>

              <!-- Receipt Parameter Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span class="text-slate-400 block text-[10.5px]">CHALLAN GRN NO.</span>
                  <span class="font-mono font-bold text-slate-900 text-xs">GRN-RAJ-2026-981240</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">CIN / TRANSACTION REF</span>
                  <span class="font-mono font-semibold text-slate-800 text-xs">CIN-SBI-9912081</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">PAYMENT MODE</span>
                  <span class="font-semibold text-slate-800 text-xs">{{ state.selectedProcPaymentModeLabel }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">SETTLEMENT DATE</span>
                  <span class="font-semibold text-slate-800 text-xs">{{ state.procFeeDate() }} 20:25:10 IST</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">REMITTER / APPLICANT</span>
                  <span class="font-bold text-slate-900 text-xs truncate block" title="{{ state.editableStep1.fullName }}">{{ state.editableStep1.fullName }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">ORGANIZATION CIN / PAN</span>
                  <span class="font-mono font-semibold text-slate-800 text-xs">{{ state.editableStep1.registrationNumber }} / {{ state.editableStep1.companyPan }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">ACCOUNT HEAD</span>
                  <span class="font-mono text-slate-800 text-xs">0070-60-800-01-00</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">AMOUNT SETTLED</span>
                  <span class="font-black text-emerald-700 text-sm">{{ state.formattedProcessFee() }}</span>
                </div>
              </div>

            </div>

            <!-- Proceed to Step 2 Button -->
            <div class="flex items-center justify-end pt-2">
              <button
                type="button"
                (click)="state.goToStep(2)"
                class="px-6 py-2.5 bg-navy hover:bg-navy-dark text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Proceed to Step 2: OTR Profile &rarr;</span>
              </button>
            </div>
          </div>
        }

      </div>

    </div>
  `
})
export class Step1ProcessingFeeComponent {
  protected readonly state = inject(SchemeFormState);
}
