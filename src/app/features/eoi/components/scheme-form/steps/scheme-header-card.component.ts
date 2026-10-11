import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SchemeFormState } from '../scheme-form.state';

/** Scheme parameters strip shown on Step 1. */
@Component({
  selector: 'app-scheme-header-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div class="p-4 sm:p-5 lg:p-6 space-y-3.5">
        <div class="space-y-1">
          <h2 class="text-lg sm:text-xl font-bold text-navy tracking-tight">
            {{ state.schemeTitle() }}
          </h2>
          <p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
            {{ state.schemeDescription() }}
          </p>
        </div>

        <!-- Parameters Strip -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-3.5 border-t border-slate-100 text-xs">
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI REFERENCE NO.</span>
            <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5 break-all">{{ state.schemeRefNo() }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME NAME</span>
            <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ state.schemeName() }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME CATEGORY</span>
            <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ state.schemeCategory() }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI CATEGORY</span>
            <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ state.schemeEoiCategory() }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE PUBLISHED</span>
            <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ state.schemeDatePublished() }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF CLOSING</span>
            <span class="font-bold text-rose-600 text-[11.5px] block mt-0.5">{{ state.schemeClosingDate() }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EMD FEE</span>
            <span class="font-bold text-slate-800 text-[11.5px] block mt-0.5">{{ state.schemeEmdFee() }} <span class="text-[10px] text-slate-400 font-normal">(Refundable)</span></span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">PROCESSING FEE</span>
            <span class="font-bold text-slate-800 text-[11.5px] block mt-0.5">{{ state.schemeProcessFee() }} <span class="text-[10px] text-slate-400 font-normal">(Non-Refundable)</span></span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SchemeHeaderCardComponent {
  protected readonly state = inject(SchemeFormState);
}
