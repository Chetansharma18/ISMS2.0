import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SchemeFormState } from '../scheme-form.state';

/** Step 6: submission acknowledgement and payment receipts. */
@Component({
  selector: 'app-step6-receipts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-4 font-sans">

      <!-- Submission summary -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Submission Details</h2>
        </div>

        <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">EOI Submission Reference No.</span>
            <span class="font-medium text-navy text-[12.5px] block mt-1 font-mono">{{ state.eoiApplicationId() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Scheme</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.schemeName() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">EOI Reference No.</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono break-all">{{ state.schemeRefNo() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Submitted On</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.submissionTimestamp() }}</span>
          </div>
        </div>
      </section>

      <!-- Receipts table -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Receipts</h2>
          </div>
          <button
            type="button"
            (click)="state.downloadAllReceipts()"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <svg class="w-3.5 h-3.5 text-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            <span>Download All</span>
          </button>
        </div>

        <div class="overflow-x-auto">
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

              <!-- Acknowledgment -->
              <tr class="border-t border-slate-100 hover:bg-slate-50/50">
                <td class="px-4 py-3 text-center font-semibold text-slate-400">1</td>
                <td class="px-4 py-3 font-medium text-slate-900 text-[12.5px]">Submission Acknowledgment</td>
                <td class="px-4 py-3 font-mono text-[12.5px] text-slate-900">{{ state.eoiApplicationId() }}</td>
                <td class="px-4 py-3 text-right text-[12.5px] text-slate-500">-</td>
                <td class="px-4 py-3 text-[12.5px] whitespace-nowrap">{{ state.submissionTimestamp() }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    type="button"
                    (click)="state.downloadAcknowledgmentReceipt()"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    <span>Download</span>
                  </button>
                </td>
              </tr>

              <!-- EMD -->
              <tr class="border-t border-slate-100 hover:bg-slate-50/50">
                <td class="px-4 py-3 text-center font-semibold text-slate-400">2</td>
                <td class="px-4 py-3 font-medium text-slate-900 text-[12.5px]">EMD Receipt</td>
                <td class="px-4 py-3 font-mono text-[12.5px] text-slate-900">{{ state.emdPaymentRef() }}</td>
                <td class="px-4 py-3 text-right text-[12.5px] font-medium text-slate-900 whitespace-nowrap">
                  {{ state.paymentMethod() === 'exemption' ? 'Exempted' : state.formattedEmdFee() }}
                </td>
                <td class="px-4 py-3 text-[12.5px] whitespace-nowrap">{{ state.submissionTimestamp() }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    type="button"
                    (click)="state.downloadEmdReceipt()"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    <span>Download</span>
                  </button>
                </td>
              </tr>

              <!-- Processing fee -->
              <tr class="border-t border-slate-100 hover:bg-slate-50/50">
                <td class="px-4 py-3 text-center font-semibold text-slate-400">3</td>
                <td class="px-4 py-3 font-medium text-slate-900 text-[12.5px]">Processing Fee Receipt</td>
                <td class="px-4 py-3 font-mono text-[12.5px] text-slate-900">{{ state.procPaymentRef }}</td>
                <td class="px-4 py-3 text-right text-[12.5px] font-medium text-slate-900 whitespace-nowrap">{{ state.formattedProcessFee() }}</td>
                <td class="px-4 py-3 text-[12.5px] whitespace-nowrap">{{ state.procFeeDate() }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    type="button"
                    (click)="state.downloadProcessingFeeReceipt()"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
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

      <!-- Footer Navigation Bar -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          type="button"
          (click)="state.goToTenderStatus()"
          class="px-6 sm:px-7 py-2.5 rounded-lg bg-navy hover:bg-[#07243c] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Track Tender Status</span>
        </button>
      </div>

    </div>
  `
})
export class Step6ReceiptsComponent {
  protected readonly state = inject(SchemeFormState);
}
