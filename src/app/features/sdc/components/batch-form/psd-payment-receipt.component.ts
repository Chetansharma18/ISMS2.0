import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PsdFeeBreakdownTableComponent } from './psd-fee-breakdown-table.component';
import { ButtonComponent, IconComponent } from '../../../../shared';

@Component({
  selector: 'app-psd-payment-receipt',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PsdFeeBreakdownTableComponent, ButtonComponent, IconComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-6">
      
      <!-- Official Digital Payment Receipt Card -->
      <div class="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
        
        <!-- Top Decorative State Bar (Official ISMS Blue) -->
        <div class="bg-primary text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3" style="background-color: #174A6E !important;">
          <div class="flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-full bg-white text-brand flex items-center justify-center font-bold text-xs" style="color: #174A6E !important;">
              &check;
            </div>
            <div>
              <div class="font-bold text-xs sm:text-sm tracking-wide text-white" style="color: #ffffff !important;">GOVERNMENT OF RAJASTHAN &bull; RSLDC ISMS 2.0</div>
              <div class="text-[10.5px] text-sky-100 font-normal" style="color: #e0f2fe !important;">Official Batch PSD Verification Fee Payment Receipt</div>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white tracking-wider uppercase border border-white/30" style="color: #ffffff !important;">
            PAID &amp; VERIFIED
          </span>
        </div>

        <!-- Receipt Core Details Grid -->
        <div class="p-5 sm:p-6 space-y-5">
          
          <!-- Metadata Row 1 -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span class="text-slate-400 block text-[10.5px] font-medium">Receipt Number</span>
              <span class="font-mono font-bold text-slate-900 text-xs sm:text-sm">{{ receiptNumber() }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10.5px] font-medium">Transaction Reference ID</span>
              <span class="font-mono font-bold text-emerald-700 text-xs sm:text-sm">{{ transactionId() }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10.5px] font-medium">Payment Timestamp</span>
              <span class="font-semibold text-slate-800 text-xs">{{ paymentTimestamp() }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10.5px] font-medium">Payment Status</span>
              <span class="font-bold text-emerald-600 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>SUCCESSFUL</span>
              </span>
            </div>
          </div>

          <!-- Metadata Row 2: Training Centre & Scheme Details -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <span class="text-slate-400 block text-[10.5px]">Center (SDC) Name &amp; Code</span>
              <span class="font-semibold text-slate-800 text-xs">{{ sdcName() }} ({{ sdcCode() }})</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10.5px]">Scheme</span>
              <span class="font-semibold text-slate-800 text-xs">{{ scheme() }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10.5px]">Allocated Sector</span>
              <span class="font-semibold text-slate-800 text-xs">{{ sector() }}</span>
            </div>
          </div>

    <!-- Fee Breakdown Table -->
    <app-psd-fee-breakdown-table [selectedPaymentMethod]="selectedPaymentMethod()"></app-psd-fee-breakdown-table>

          <!-- Receipt Download & Proceed Actions Bar -->
          <div class="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <!-- Download & Print Actions -->
            <div class="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                appButton
                variant="outline"
                class="flex-1 sm:flex-none"
                type="button"
                (click)="downloadReceipt.emit()"
                title="Download Official PDF Receipt"
              >
                <app-icon name="download" size="sm" />
                <span>Download Receipt (PDF)</span>
              </button>

              <button
                appButton
                variant="secondary"
                type="button"
                (click)="printReceipt()"
                title="Print Receipt"
              >
                <app-icon name="print" size="sm" />
                <span>Print</span>
              </button>
            </div>

            <!-- Proceed to Batch Details Action Button -->
            <button
              appButton
              size="lg"
              class="w-full sm:w-auto"
              type="button"
              (click)="proceed.emit()"
            >
              <span>Proceed to Batch Details</span>
              <app-icon name="chevron-right" size="sm" />
            </button>

          </div>

        </div>

      </div>

    </div>
  `
})
export class PsdPaymentReceiptComponent {
  readonly receiptNumber = input.required<string>();
  readonly transactionId = input.required<string>();
  readonly paymentTimestamp = input.required<string>();
  readonly selectedPaymentMethod = input.required<string>();
  readonly sdcName = input.required<string>();
  readonly sdcCode = input.required<string>();
  readonly scheme = input.required<string>();
  readonly sector = input.required<string>();

  readonly downloadReceipt = output<void>();
  readonly proceed = output<void>();

  printReceipt(): void {
    window.print();
  }
}
