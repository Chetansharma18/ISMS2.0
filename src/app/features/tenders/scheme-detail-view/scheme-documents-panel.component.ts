import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SchemeTender } from '../tenders.models';
import { formatFeeDisplay } from './scheme-detail-view.util';

/** Left column of the detail screen: RFP / SOP downloads and the financial details card. */
@Component({
  selector: 'app-scheme-documents-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <h2 class="text-base font-bold text-slate-900 mb-4">Scheme Documents</h2>
    
    <div class="space-y-4">
      <!-- RFP Document -->
      <div
        (click)="downloadRfp.emit()"
        class="flex items-start gap-3 cursor-pointer group select-none"
        title="View Request for Proposal (RFP)"
      >
        <div class="w-7 h-7 rounded bg-[#D92D20] flex items-center justify-center text-white text-[9.5px] font-bold tracking-tight shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
          PDF
        </div>
        <div>
          <div class="text-[13px] font-bold text-slate-900 group-hover:text-navy group-hover:underline leading-snug">
            Request for Proposal (RFP)
          </div>
          <div class="text-[11.5px] text-slate-500 mt-0.5">
            PDF ({{ scheme().rfpDocSize || '2.4 MB' }})
          </div>
        </div>
      </div>

      <!-- SOP Document -->
      <div
        (click)="downloadSop.emit()"
        class="flex items-start gap-3 cursor-pointer group select-none"
        title="View Standard Operating Procedure (SOP)"
      >
        <div class="w-7 h-7 rounded bg-[#D92D20] flex items-center justify-center text-white text-[9.5px] font-bold tracking-tight shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
          PDF
        </div>
        <div>
          <div class="text-[13px] font-bold text-slate-900 group-hover:text-navy group-hover:underline leading-snug">
            Standard Operating Procedure (SOP) for Training Partners
          </div>
          <div class="text-[11.5px] text-slate-500 mt-0.5">
            PDF ({{ scheme().sopDocSize || '1.8 MB' }})
          </div>
        </div>
      </div>
    </div>

    <!-- Financial Details Section (Matching Screenshot) -->
    <div class="mt-6 pt-5 border-t border-slate-100">
      <h2 class="text-base font-bold text-slate-900 mb-3">Financial Details</h2>
      
      <div class="rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
        <div class="grid grid-cols-2 divide-x divide-slate-200">
          <!-- EMD Fee -->
          <div class="pr-3">
            <span class="text-xs font-semibold text-slate-800 leading-tight block">EMD Fee</span>
            <div class="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
              <span class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                {{ formattedEmdFee() }}
              </span>
              <span class="text-[11px] text-slate-500 font-normal leading-none">(Refundable)</span>
            </div>
          </div>

          <!-- Processing Fee -->
          <div class="pl-4">
            <span class="text-xs font-semibold text-slate-800 leading-tight block">Processing Fee</span>
            <div class="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
              <span class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                {{ formattedProcessFee() }}
              </span>
              <span class="text-[11px] text-slate-500 font-normal leading-none">(Non-Refundable)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SchemeDocumentsPanelComponent {
  readonly scheme = input.required<SchemeTender>();

  readonly downloadRfp = output<void>();
  readonly downloadSop = output<void>();

  readonly formattedEmdFee = computed(() => formatFeeDisplay(this.scheme().emdFee, '₹ 50,000'));
  readonly formattedProcessFee = computed(() => formatFeeDisplay(this.scheme().processFee, '₹ 2,000'));
}
