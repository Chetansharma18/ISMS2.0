import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PsdFeeBreakdownTableComponent } from './psd-fee-breakdown-table.component';

@Component({
  selector: 'app-psd-payment-receipt',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PsdFeeBreakdownTableComponent],
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
                type="button"
                (click)="downloadReceipt.emit()"
                class="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-800 rounded-lg font-semibold text-xs transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center gap-1.5"
                title="Download Official PDF Receipt"
              >
                <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Receipt (PDF)</span>
              </button>

              <button
                type="button"
                (click)="printReceipt()"
                class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                title="Print Receipt"
              >
                <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>
            </div>

            <!-- Proceed to Batch Details Action Button -->
            <button
              type="button"
              (click)="proceed.emit()"
              class="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-dark active:scale-95 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Proceed to Batch Details</span>
              <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
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
