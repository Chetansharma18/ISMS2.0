import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { PsdPaymentOptionsComponent } from './psd-payment-options.component';
import { PsdPaymentReceiptComponent } from './psd-payment-receipt.component';

@Component({
  selector: 'app-psd-payment-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PsdPaymentOptionsComponent, PsdPaymentReceiptComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-6 animate-in fade-in duration-200">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight m-0">
            Fee Payment
          </h2>
          <p class="text-xs text-slate-500 mt-0.5 m-0">
            Mandatory Batch PSD Verification Fee &amp; Secure Payment Gateway
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (isPaymentCompleted()) {
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand text-xs font-bold border border-blue-200">
              <svg class="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Fee Verified: ₹500.00 Paid</span>
            </div>
            <button
              type="button"
              (click)="viewPaymentOptions.emit()"
              class="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              View Payment Options
            </button>
          }
        </div>
      </div>

    <!-- =================================================================
         CASE A: PAYMENT NOT YET COMPLETED -> SHOW PAYMENT OPTIONS & MAKE PAYMENT BUTTON
         ================================================================= -->
    @if (!isPaymentCompleted()) {
      <app-psd-payment-options
        [(selectedPaymentMethod)]="selectedPaymentMethod"
        [scheme]="scheme()"
        [isPaymentProcessing]="isPaymentProcessing()"
        (makePayment)="makePayment.emit()"
      ></app-psd-payment-options>
    }

    <!-- =================================================================
         CASE B: PAYMENT COMPLETED -> SHOW PAYMENT RECEIPT & DOWNLOAD OPTION
         ================================================================= -->
    @if (isPaymentCompleted()) {
      <app-psd-payment-receipt
        [receiptNumber]="receiptNumber()"
        [transactionId]="transactionId()"
        [paymentTimestamp]="paymentTimestamp()"
        [selectedPaymentMethod]="selectedPaymentMethod()"
        [sdcName]="sdcName()"
        [sdcCode]="sdcCode()"
        [scheme]="scheme()"
        [sector]="sector()"
        (downloadReceipt)="downloadReceipt.emit()"
        (proceed)="proceed.emit()"
      ></app-psd-payment-receipt>
    }

  </div>
  `
})
export class PsdPaymentPanelComponent {
  readonly isPaymentCompleted = input.required<boolean>();
  readonly isPaymentProcessing = input<boolean>(false);
  readonly selectedPaymentMethod = model.required<string>();
  readonly scheme = input.required<string>();
  readonly sdcName = input.required<string>();
  readonly sdcCode = input.required<string>();
  readonly sector = input.required<string>();
  readonly receiptNumber = input.required<string>();
  readonly transactionId = input.required<string>();
  readonly paymentTimestamp = input.required<string>();

  readonly makePayment = output<void>();
  readonly viewPaymentOptions = output<void>();
  readonly downloadReceipt = output<void>();
  readonly proceed = output<void>();
}
