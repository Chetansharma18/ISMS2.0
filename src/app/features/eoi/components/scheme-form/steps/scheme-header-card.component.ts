import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SchemeFormState } from '../scheme-form.state';

/** Scheme parameters strip shown on Step 1. */
@Component({
  selector: 'app-scheme-header-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
      <div class="p-4 sm:p-5 space-y-3.5">
        <div class="space-y-1">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
            {{ state.schemeTitle() }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 leading-relaxed m-0">
            {{ state.schemeDescription() }}
          </p>
        </div>

        <!-- Parameters Strip -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-6 gap-y-4 pt-3.5 border-t border-slate-100 text-xs">
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">EOI Reference No.</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 break-all font-mono">{{ state.schemeRefNo() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Scheme Name</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.schemeName() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Scheme Category</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.schemeCategory() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">EOI Category</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.schemeEoiCategory() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Date Published</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.schemeDatePublished() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Date of Closing</span>
            <span class="font-semibold text-rose-600 text-[12.5px] block mt-1">{{ state.schemeClosingDate() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">EMD Fee</span>
            <span class="font-semibold text-slate-900 text-[12.5px] block mt-1">{{ state.schemeEmdFee() }} <span class="text-[11px] text-slate-500 font-normal">(Refundable)</span></span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Processing Fee</span>
            <span class="font-semibold text-slate-900 text-[12.5px] block mt-1">{{ state.schemeProcessFee() }} <span class="text-[11px] text-slate-500 font-normal">(Non-Refundable)</span></span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class SchemeHeaderCardComponent {
  protected readonly state = inject(SchemeFormState);
}
