import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { SubmittedTender } from '../../../core/models/tender.model';
import { TenderReceiptsService } from './tender-receipts.service';

@Component({
  selector: 'app-tender-receipts-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
          <h3 class="font-semibold text-slate-900 text-sm">
            Step 4: Official Proposal Submission Acknowledgment (Form RSLDC-EOI-ACK)
          </h3>
        </div>
      </div>

      <!-- Proposal Submission Acknowledgment Slip Card -->
      <div class="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
          <div>
            <div class="text-[10.5px] font-medium text-slate-500">Government of Rajasthan &bull; RSLDC</div>
            <h4 class="text-xs sm:text-[13px] font-semibold text-slate-800">Proposal Submission Acknowledgment Slip (Form RSLDC-EOI-ACK)</h4>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
              {{ app().appRef }}
            </span>
            <button
              type="button"
              (click)="onViewAcknowledgment()"
              class="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-medium text-xs cursor-pointer flex items-center gap-1 transition-colors"
            >
              <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span>View</span>
            </button>
            <button
              type="button"
              (click)="downloadAcknowledgmentReceipt()"
              class="px-3 py-1 bg-navy hover:bg-navy-dark text-white rounded font-medium text-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
          <div><span class="text-slate-500 block text-[11px]">Applied Date</span><span class="font-medium text-slate-900">{{ app().appliedDate }}</span></div>
          <div><span class="text-slate-500 block text-[11px]">Remitter Name</span><span class="font-medium text-slate-900">{{ app().orgDetails.fullName }}</span></div>
          <div><span class="text-slate-500 block text-[11px]">CIN / PAN</span><span class="font-mono font-medium text-slate-900">{{ app().orgDetails.registrationNumber }} / {{ app().orgDetails.companyPan }}</span></div>
          <div><span class="text-slate-500 block text-[11px]">Submission Status</span><span class="font-semibold text-emerald-700">Submitted</span></div>
        </div>
      </div>
    </div>
  `
})
export class TenderReceiptsSectionComponent {
  private readonly receipts = inject(TenderReceiptsService);

  readonly app = input.required<SubmittedTender>();
  readonly viewDoc = output<void>();

  onViewAcknowledgment(): void {
    this.viewDoc.emit();
  }

  downloadAcknowledgmentReceipt(): void {
    this.receipts.downloadAcknowledgment(this.app());
  }

  downloadProcessingFeeReceipt(): void {
    this.receipts.downloadProcessingFeeReceipt(this.app());
  }

  downloadChallanReceipt(): void {
    this.downloadProcessingFeeReceipt();
  }
}