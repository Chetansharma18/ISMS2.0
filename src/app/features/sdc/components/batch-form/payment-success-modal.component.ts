import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent, ModalComponent } from '../../../../shared';

@Component({
  selector: 'app-payment-success-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, ModalComponent],
  host: { class: 'block' },
  template: `
    <app-modal
      title="Payment Successful"
      [subtitle]="'Batch PSD Fee of ₹500.00 completed successfully via ' + selectedPaymentMethod()"
      size="sm"
      [closeOnBackdrop]="false"
      (close)="closed.emit()"
    >
        <div class="space-y-4 text-xs text-left font-sans">
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

        </div>

        <ng-container modalFooter>
          <button
            appButton
            variant="outline"
            type="button"
            (click)="downloadReceipt.emit()"
            title="Download Official PDF Receipt"
          >
            <app-icon name="download" size="sm" />
            <span>Download Receipt (PDF)</span>
          </button>

          <button
            appButton
            type="button"
            (click)="continued.emit()"
          >
            <span>Continue to Batch Details &rarr;</span>
          </button>
        </ng-container>
    </app-modal>
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
