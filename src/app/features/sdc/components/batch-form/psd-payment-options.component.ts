import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-psd-payment-options',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      <!-- Left 2 Cols: Applicable Fee & Payment Method Selection -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- 1. Applicable Batch PSD Verification Fees -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div class="pb-2 border-b border-slate-100">
            <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0">
              1. Applicable Batch PSD Verification Fee (Compulsory)
            </h3>
            <p class="text-xs text-slate-500 mt-0.5 m-0">
              Fixed verification fee of ₹500 is compulsory per batch under Rajasthan Skill &amp; Livelihoods Development Corporation guidelines before proceeding to batch scheduling.
            </p>
          </div>

          <div class="space-y-3">
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  &check;
                </div>
                <div>
                  <h4 class="text-xs sm:text-sm font-bold text-slate-900 m-0">
                    Batch PSD Verification Fee <span class="text-rose-600">*</span>
                  </h4>
                  <p class="text-[11px] text-slate-500 mt-0.5 m-0">
                    Non-refundable administrative scrutiny &amp; batch allocation verification fee.
                  </p>
                </div>
              </div>
              <span class="text-base sm:text-lg font-bold text-slate-900 font-mono">₹500.00</span>
            </div>
          </div>
        </div>

        <!-- 2. Select Payment Mode (3 Modes without e-Gras) -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0">
              2. Select Payment Mode
            </h3>
            <span class="text-[11px] text-slate-500">Government Encrypted Gateway</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <!-- UPI -->
            <label
              class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
              [class.border-primary]="selectedPaymentMethod() === 'UPI'"
              [class.bg-slate-50]="selectedPaymentMethod() === 'UPI'"
              [class.border-slate-200]="selectedPaymentMethod() !== 'UPI'"
            >
              <div class="flex items-center justify-between mb-3">
                <input
                  type="radio"
                  name="payMode"
                  value="UPI"
                  [(ngModel)]="selectedPaymentMethod"
                  class="w-4 h-4 text-brand focus:ring-primary"
                />
                <span class="text-[10px] font-bold px-2 py-0.5 bg-primary-light text-brand rounded">Instant</span>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900">UPI / QR Code</div>
                <div class="text-[11px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</div>
              </div>
            </label>

            <!-- Net Banking -->
            <label
              class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
              [class.border-primary]="selectedPaymentMethod() === 'NetBanking'"
              [class.bg-slate-50]="selectedPaymentMethod() === 'NetBanking'"
              [class.border-slate-200]="selectedPaymentMethod() !== 'NetBanking'"
            >
              <div class="flex items-center justify-between mb-3">
                <input
                  type="radio"
                  name="payMode"
                  value="NetBanking"
                  [(ngModel)]="selectedPaymentMethod"
                  class="w-4 h-4 text-brand focus:ring-primary"
                />
                <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Bank</span>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900">Net Banking</div>
                <div class="text-[11px] text-slate-500 mt-0.5">SBI, HDFC, ICICI, PNB, BoB &amp; 50+ Banks</div>
              </div>
            </label>

            <!-- Debit / Credit Card -->
            <label
              class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
              [class.border-primary]="selectedPaymentMethod() === 'Card'"
              [class.bg-slate-50]="selectedPaymentMethod() === 'Card'"
              [class.border-slate-200]="selectedPaymentMethod() !== 'Card'"
            >
              <div class="flex items-center justify-between mb-3">
                <input
                  type="radio"
                  name="payMode"
                  value="Card"
                  [(ngModel)]="selectedPaymentMethod"
                  class="w-4 h-4 text-brand focus:ring-primary"
                />
                <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Cards</span>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900">Debit / Credit Card</div>
                <div class="text-[11px] text-slate-500 mt-0.5">RuPay, Visa, MasterCard</div>
              </div>
            </label>

          </div>
        </div>

      </div>

      <!-- Right 1 Col: Payment Summary Card (Sticky) -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden sticky top-20">
        <div class="bg-primary p-4 flex items-center justify-between" style="background-color: #174A6E !important;">
          <h4 class="text-xs font-bold uppercase tracking-wider m-0 !text-white" style="color: #ffffff !important;">Payment Summary</h4>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style="color: #ffffff !important; background-color: rgba(255, 255, 255, 0.18) !important;">{{ scheme() }}</span>
        </div>

        <div class="p-5 space-y-4 text-xs">
          <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
            <span>Batch PSD Fee</span>
            <span class="font-bold text-slate-900 font-mono">₹500.00</span>
          </div>
          <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
            <span>Convenience / Processing</span>
            <span class="font-bold text-emerald-600">₹0.00 (Free)</span>
          </div>

          <div class="flex justify-between items-baseline pt-1">
            <span class="text-sm font-bold text-slate-900">Total Payable</span>
            <span class="text-xl font-bold text-brand font-mono">₹500.00</span>
          </div>

          <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            Selected Mode: <strong class="text-slate-900 font-semibold">{{ selectedPaymentMethod() }}</strong>
          </div>

          <!-- Primary Action: MAKE PAYMENT BUTTON -->
          <button
            type="button"
            [disabled]="isPaymentProcessing()"
            (click)="makePayment.emit()"
            class="w-full py-3 px-4 bg-primary hover:bg-primary-dark active:scale-95 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            @if (isPaymentProcessing()) {
              <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Processing Payment...</span>
            } @else {
              <span>Make Payment (₹500.00) &rarr;</span>
            }
          </button>

          <div class="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>256-Bit SSL Secured Payment via RSLDC</span>
          </div>

        </div>
      </div>

    </div>
  `
})
export class PsdPaymentOptionsComponent {
  readonly selectedPaymentMethod = model.required<string>();
  readonly scheme = input.required<string>();
  readonly isPaymentProcessing = input<boolean>(false);
  readonly makePayment = output<void>();
}
