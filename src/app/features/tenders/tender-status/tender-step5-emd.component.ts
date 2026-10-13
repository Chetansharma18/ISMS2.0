import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SubmittedTender } from '../../../core/models/tender.model';
import { TenderReceiptsService } from './tender-receipts.service';

/** Payments and receipts of a submitted application, with a download for each receipt. */
@Component({
  selector: 'app-tender-step5-emd',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="receipts-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">5</span>
          <h2 id="receipts-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Payments &amp; Receipts</h2>
        </div>
        <button
          type="button"
          (click)="downloadAll()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
        >
          <svg class="w-3.5 h-3.5 text-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          <span>Download All</span>
        </button>
      </div>

      <div class="overflow-x-auto border border-slate-200 rounded-lg">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/90 text-slate-600 text-[11.5px] font-semibold border-b border-slate-200">
            <tr>
              <th class="px-4 py-2.5 w-10 text-center">#</th>
              <th class="px-4 py-2.5">Receipt</th>
              <th class="px-4 py-2.5">Reference No.</th>
              <th class="px-4 py-2.5 text-right">Amount</th>
              <th class="px-4 py-2.5">Date</th>
              <th class="px-4 py-2.5 text-center w-32">Action</th>
            </tr>
          </thead>
          <tbody class="text-slate-700">
            <tr class="border-t border-slate-100 hover:bg-slate-50/50">
              <td class="px-4 py-3 text-center font-semibold text-slate-400">1</td>
              <td class="px-4 py-3 font-medium text-slate-900 text-[12.5px]">Submission Acknowledgment</td>
              <td class="px-4 py-3 font-mono text-[12.5px] text-slate-900">{{ app().appRef }}</td>
              <td class="px-4 py-3 text-right text-[12.5px] text-slate-500">-</td>
              <td class="px-4 py-3 text-[12.5px] whitespace-nowrap">{{ app().appliedDate }}</td>
              <td class="px-4 py-3 text-center">
                <button type="button" (click)="receipts.downloadAcknowledgment(app())" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  <span>Download</span>
                </button>
              </td>
            </tr>

            <tr class="border-t border-slate-100 hover:bg-slate-50/50">
              <td class="px-4 py-3 text-center font-semibold text-slate-400">2</td>
              <td class="px-4 py-3 font-medium text-slate-900 text-[12.5px]">EMD Receipt</td>
              <td class="px-4 py-3 font-mono text-[12.5px] text-slate-900">{{ app().emdTransactionRef || '-' }}</td>
              <td class="px-4 py-3 text-right text-[12.5px] font-medium text-slate-900 whitespace-nowrap">{{ app().emdAmount }}</td>
              <td class="px-4 py-3 text-[12.5px] whitespace-nowrap">{{ app().appliedDate }}</td>
              <td class="px-4 py-3 text-center">
                <button type="button" (click)="receipts.downloadEmdReceipt(app())" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  <span>Download</span>
                </button>
              </td>
            </tr>

            <tr class="border-t border-slate-100 hover:bg-slate-50/50">
              <td class="px-4 py-3 text-center font-semibold text-slate-400">3</td>
              <td class="px-4 py-3 font-medium text-slate-900 text-[12.5px]">Processing Fee Receipt</td>
              <td class="px-4 py-3 font-mono text-[12.5px] text-slate-900">{{ app().transactionRef || '-' }}</td>
              <td class="px-4 py-3 text-right text-[12.5px] font-medium text-slate-900 whitespace-nowrap">{{ app().processingFee }}</td>
              <td class="px-4 py-3 text-[12.5px] whitespace-nowrap">{{ app().appliedDate }}</td>
              <td class="px-4 py-3 text-center">
                <button type="button" (click)="receipts.downloadProcessingFeeReceipt(app())" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  <span>Download</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class TenderStep5EmdComponent {
  protected readonly receipts = inject(TenderReceiptsService);

  readonly app = input.required<SubmittedTender>();

  protected downloadAll(): void {
    this.receipts.downloadAcknowledgment(this.app());
    setTimeout(() => this.receipts.downloadEmdReceipt(this.app()), 300);
    setTimeout(() => this.receipts.downloadProcessingFeeReceipt(this.app()), 600);
  }
}
