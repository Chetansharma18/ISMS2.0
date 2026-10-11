import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-payment-success-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  host: { class: 'block' },
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="payment-success-modal-title">
      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden text-center font-sans animate-in zoom-in-95 duration-200">
        <!-- Close Cross Button (X) on Top Right -->
        <button
          type="button"
          (click)="closed.emit()"
          class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer z-30 shadow-xs"
          title="Close and View Receipt"
          aria-label="Close"
        >
          <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="bg-green-700 text-white py-6 px-6 space-y-2">
          <div class="w-12 h-12 mx-auto rounded-full bg-white text-green-700 flex items-center justify-center shadow-md mb-2 font-bold text-xl">
            &check;
          </div>
          <h3 id="payment-success-modal-title" class="text-lg font-bold tracking-tight m-0 text-white" style="color: #ffffff !important;">Payment Successful</h3>
          <p class="text-xs text-emerald-100 font-normal m-0" style="color: #d1fae5 !important;">
            Batch PSD Fee of ₹500.00 completed successfully via {{ selectedPaymentMethod() }}
          </p>
        </div>

        <div class="p-5 space-y-4 text-xs text-left font-sans">
          <div class="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Receipt No:</span>
              <span class="font-mono font-bold text-slate-800 text-xs">{{ receiptNumber() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Transaction Ref:</span>
              <span class="font-mono font-bold text-slate-800 text-xs">{{ transactionId() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Amount Paid:</span>
              <span class="text-sm font-bold text-slate-900 font-mono">₹500.00</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Center (SDC):</span>
              <span class="text-slate-800 font-semibold">{{ sdcName() }} ({{ sdcCode() }})</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Allocated Sector:</span>
              <span class="text-slate-800 font-semibold">{{ sector() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Verification Status:</span>
              <span class="text-emerald-700 font-bold">RSLDC AUTHORIZED</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Date &amp; Time:</span>
              <span class="text-slate-600">{{ paymentTimestamp() }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button
              type="button"
              (click)="downloadReceipt.emit()"
              class="whitespace-nowrap py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1.5"
              title="Download Official PDF Receipt"
            >
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Receipt (PDF)</span>
            </button>

            <button
              type="button"
              (click)="continued.emit()"
              class="flex-[2] py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Batch Details &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentSuccessModalComponent {
  readonly selectedPaymentMethod = input.required<string>();
  readonly receiptNumber = input.required<string>();
  readonly transactionId = input.required<string>();
  readonly paymentTimestamp = input.required<string>();
  readonly sdcName = input.required<string>();
  readonly sdcCode = input.required<string>();
  readonly sector = input.required<string>();

  readonly closed = output<void>();
  readonly downloadReceipt = output<void>();
  readonly continued = output<void>();
}
