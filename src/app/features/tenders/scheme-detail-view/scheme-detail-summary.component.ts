import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SchemeTender } from '../tenders.models';

/** Scheme title, description and the metadata stats bar. */
@Component({
  selector: 'app-scheme-detail-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <!-- SCHEME TITLE & DESCRIPTION -->
    <div class="mt-4">
      <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
        {{ scheme().schemeTitle || scheme().schemeName }}
      </h1>
      <p class="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
        {{ scheme().eoiDescription }}
      </p>
    </div>

    <!-- METADATA STATS BAR WITH VERTICAL DIVIDERS -->
    <div class="mt-4 pt-3 pb-3 border-t border-b border-slate-200">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        
        <div class="pr-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">EOI Reference No.</span>
          <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1 break-all">{{ scheme().refNo }}</span>
        </div>

        <div class="px-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">Scheme Name</span>
          <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ scheme().schemeName }}</span>
        </div>

        <div class="px-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">Scheme Category</span>
          <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ scheme().schemeCategory || scheme().category || 'ALL' }}</span>
        </div>

        <div class="px-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">EOI Category</span>
          <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ scheme().eoiCategory || 'General' }}</span>
        </div>

        <div class="px-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">Date of EOI Published</span>
          <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ scheme().datePublished }}</span>
        </div>

        <div class="pl-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">Last Date of EOI Submission</span>
          <span class="text-xs sm:text-[12.5px] font-bold text-red-600 block mt-1">{{ scheme().closingDate }}</span>
        </div>

      </div>
    </div>
  `
})
export class SchemeDetailSummaryComponent {
  readonly scheme = input.required<SchemeTender>();
}
