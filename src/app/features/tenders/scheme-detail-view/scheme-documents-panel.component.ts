import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SchemeTender } from '../tenders.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

/** 2-column table for Scheme Documents (PDF) with View action button. */
@Component({
  selector: 'app-scheme-documents-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: { class: 'block h-full' },
  template: `
    <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs h-full">
      <div class="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900">Scheme Documents</h3>
        <span class="text-xs text-slate-500 font-normal">2 Documents</span>
      </div>

      <table class="w-full text-left border-collapse text-xs sm:text-[13px]">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50/40 text-[11.5px] uppercase tracking-wider text-slate-500 font-semibold">
            <th class="px-4 py-2.5">PDF Document</th>
            <th class="px-4 py-2.5 text-right w-28">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <!-- Row 1: RFP -->
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 rounded bg-[#D92D20] flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-2xs">
                  PDF
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-slate-900 leading-snug">
                    Request for Proposal (RFP)
                  </div>
                  <div class="text-[11px] text-slate-500 leading-tight">
                    PDF ({{ scheme().rfpDocSize || '2.4 MB' }})
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <button
                type="button"
                (click)="downloadRfp.emit()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-navy bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer select-none"
                title="View Request for Proposal (RFP)"
              >
                <app-icon name="eye" size="sm" />
                <span>View</span>
              </button>
            </td>
          </tr>

          <!-- Row 2: SOP -->
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 rounded bg-[#D92D20] flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-2xs">
                  PDF
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-slate-900 leading-snug">
                    Standard Operating Procedure (SOP)
                  </div>
                  <div class="text-[11px] text-slate-500 leading-tight">
                    PDF ({{ scheme().sopDocSize || '1.8 MB' }}) • Training Partners
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <button
                type="button"
                (click)="downloadSop.emit()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-navy bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer select-none"
                title="View Standard Operating Procedure (SOP)"
              >
                <app-icon name="eye" size="sm" />
                <span>View</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class SchemeDocumentsPanelComponent {
  readonly scheme = input.required<SchemeTender>();

  readonly downloadRfp = output<void>();
  readonly downloadSop = output<void>();
}
