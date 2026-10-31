import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SchemeTender } from '../tenders.models';
import { formatFeeDisplay } from './scheme-detail-view.util';

/** 2-column table displaying Scheme Details and parameters. */
@Component({
  selector: 'app-scheme-detail-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  template: `
    <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs h-full flex flex-col">
      <div class="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900">Scheme Details</h3>
      </div>
      <table class="w-full text-left border-collapse text-xs sm:text-[13px] flex-1">
        <tbody class="divide-y divide-slate-200">
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-slate-500 w-5/12 bg-slate-50/30">EOI Reference No.</td>
            <td class="px-4 py-2.5 font-semibold text-slate-900 break-all select-all">{{ scheme().refNo }}</td>
          </tr>
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/30">Scheme Name</td>
            <td class="px-4 py-2.5 font-semibold text-slate-900">{{ scheme().schemeName }}</td>
          </tr>
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/30">Scheme Category</td>
            <td class="px-4 py-2.5 font-semibold text-slate-900">{{ scheme().schemeCategory || scheme().category || 'ALL' }}</td>
          </tr>
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/30">EOI Category</td>
            <td class="px-4 py-2.5 font-semibold text-slate-900">{{ scheme().eoiCategory || 'General' }}</td>
          </tr>
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/30">EOI Publication Date</td>
            <td class="px-4 py-2.5 font-semibold text-slate-900">{{ scheme().datePublished }}</td>
          </tr>
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/30">Last Date of EOI Submission</td>
            <td class="px-4 py-2.5 font-bold text-red-600">{{ scheme().closingDate }}</td>
          </tr>
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/30">EMD Fee</td>
            <td class="px-4 py-2.5 font-semibold text-slate-900">
              <span>{{ formattedEmdFee() }}</span>
              <span class="text-slate-500 font-normal text-xs ml-1.5">(Refundable)</span>
            </td>
          </tr>
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/30">Processing Fee</td>
            <td class="px-4 py-2.5 font-semibold text-slate-900">
              <span>{{ formattedProcessFee() }}</span>
              <span class="text-slate-500 font-normal text-xs ml-1.5">(Non-Refundable)</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class SchemeDetailSummaryComponent {
  readonly scheme = input.required<SchemeTender>();

  readonly formattedEmdFee = computed(() => formatFeeDisplay(this.scheme().emdFee, '₹ 50,000'));
  readonly formattedProcessFee = computed(() => formatFeeDisplay(this.scheme().processFee, '₹ 2,000'));
}
