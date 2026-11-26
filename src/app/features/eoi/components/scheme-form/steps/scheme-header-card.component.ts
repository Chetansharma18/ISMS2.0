import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SchemeFormState } from '../scheme-form.state';

/** Scheme parameters strip shown at the top of all Apply for EOI steps. */
@Component({
  selector: 'app-scheme-header-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="bg-white border border-[#EADCE2] rounded-xl shadow-2xs overflow-hidden">
      <div class="px-4 py-3 space-y-2.5">
        <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <h2 class="text-[14px] sm:text-[15px] font-bold text-[#7C0E44] m-0 leading-snug">
            {{ state.schemeTitle() }}
          </h2>
          @if (state.schemeDescription()) {
            <p class="text-xs text-slate-500 m-0 truncate max-w-xl" [title]="state.schemeDescription()">
              {{ state.schemeDescription() }}
            </p>
          }
        </div>

        <!-- Parameters Strip (no duplicate Scheme Name; clean single-line values) -->
        <div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-2.5 pt-2.5 border-t border-[#EADCE2]/70 text-xs">
          <div>
            <span class="text-slate-400 block text-[10.5px] font-semibold uppercase tracking-wider leading-tight">EOI Reference No.</span>
            <span class="font-semibold text-slate-900 text-xs block mt-0.5 whitespace-nowrap tabular-nums">{{ state.schemeRefNo() }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10.5px] font-semibold uppercase tracking-wider leading-tight">Scheme Category</span>
            <span class="font-semibold text-slate-900 text-xs block mt-0.5 whitespace-nowrap">{{ state.schemeCategory() }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10.5px] font-semibold uppercase tracking-wider leading-tight">EOI Category</span>
            <span class="font-semibold text-slate-900 text-xs block mt-0.5 whitespace-nowrap">{{ state.schemeEoiCategory() }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10.5px] font-semibold uppercase tracking-wider leading-tight">Date Published</span>
            <span class="font-semibold text-slate-900 text-xs block mt-0.5 whitespace-nowrap tabular-nums">{{ state.schemeDatePublished() }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10.5px] font-semibold uppercase tracking-wider leading-tight">Date of Closing</span>
            <span class="font-semibold text-rose-600 text-xs block mt-0.5 whitespace-nowrap tabular-nums">{{ state.schemeClosingDate() }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10.5px] font-semibold uppercase tracking-wider leading-tight">EMD Fee</span>
            <span class="font-semibold text-slate-900 text-xs block mt-0.5 whitespace-nowrap tabular-nums">
              {{ state.schemeEmdFee() }} <span class="text-[10.5px] text-slate-500 font-normal">(Refundable)</span>
            </span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10.5px] font-semibold uppercase tracking-wider leading-tight">Processing Fee</span>
            <span class="font-semibold text-slate-900 text-xs block mt-0.5 whitespace-nowrap tabular-nums">
              {{ state.schemeProcessFee() }} <span class="text-[10.5px] text-slate-500 font-normal">(Non-Refundable)</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class SchemeHeaderCardComponent {
  protected readonly state = inject(SchemeFormState);
}
