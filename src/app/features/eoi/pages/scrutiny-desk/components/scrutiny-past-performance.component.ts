import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import type { PastEngagement } from '../../../services/eoi-state.models';

/** Share of `part` in `whole`, rounded to a whole percent (0 when there is no whole). */
function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/**
 * Track record of the organisation under earlier EOIs: for each scheme it was empanelled under,
 * how many trainees were targeted and how many were trained, certified and placed.
 */
@Component({
  selector: 'app-scrutiny-past-performance',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="past-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
        <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">5</span>
        <h2 id="past-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Past Performance</h2>
      </div>

      @if (engagements().length === 0) {
        <p class="m-0 text-xs text-slate-500">
          This organisation has not been empanelled under any earlier scheme.
        </p>
      } @else {
        <!-- Overall result across all earlier schemes -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-3 text-xs">
          <div>
            <span class="text-[11.5px] text-slate-500 block">Schemes</span>
            <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ engagements().length }}</span>
          </div>
          <div>
            <span class="text-[11.5px] text-slate-500 block">Total Target</span>
            <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ totals().target }}</span>
          </div>
          <div>
            <span class="text-[11.5px] text-slate-500 block">Trained</span>
            <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ totals().trained }} ({{ totals().trainedPercent }}% of target)</span>
          </div>
          <div>
            <span class="text-[11.5px] text-slate-500 block">Placed</span>
            <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ totals().placed }} ({{ totals().placedPercent }}% of trained)</span>
          </div>
          <div>
            <span class="text-[11.5px] text-slate-500 block">Overall Achievement</span>
            <span class="text-[12.5px] font-semibold block mt-1" [ngClass]="tone(totals().trainedPercent)">{{ totals().trainedPercent }}%</span>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/90 text-slate-600 text-[11.5px] font-semibold border-b border-slate-200">
              <tr>
                <th class="px-4 py-2.5 w-10 text-center">#</th>
                <th class="px-4 py-2.5">Scheme</th>
                <th class="px-4 py-2.5 whitespace-nowrap">Year</th>
                <th class="px-4 py-2.5 text-right">Target</th>
                <th class="px-4 py-2.5 text-right">Trained</th>
                <th class="px-4 py-2.5 text-right">Certified</th>
                <th class="px-4 py-2.5 text-right">Placed</th>
                <th class="px-4 py-2.5 text-right whitespace-nowrap">Achievement</th>
              </tr>
            </thead>
            <tbody class="text-slate-700">
              @for (row of engagements(); track row.eoiRefNo; let i = $index) {
                <tr class="border-t border-slate-100 hover:bg-slate-50/50">
                  <td class="px-4 py-2.5 text-center font-semibold text-slate-400">{{ i + 1 }}</td>
                  <td class="px-4 py-2.5">
                    <span class="block font-medium text-slate-900 text-[12.5px]">{{ row.schemeName }}</span>
                    <span class="block text-[11px] text-slate-500 font-mono">{{ row.eoiRefNo }}</span>
                  </td>
                  <td class="px-4 py-2.5 whitespace-nowrap">
                    {{ row.financialYear }}
                    @if (row.status === 'Ongoing') {
                      <span class="ml-1 px-1.5 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-semibold">Ongoing</span>
                    }
                  </td>
                  <td class="px-4 py-2.5 text-right">{{ row.target }}</td>
                  <td class="px-4 py-2.5 text-right">{{ row.trained }}</td>
                  <td class="px-4 py-2.5 text-right">{{ row.certified }}</td>
                  <td class="px-4 py-2.5 text-right">{{ row.placed }}</td>
                  <td class="px-4 py-2.5 text-right font-semibold whitespace-nowrap" [ngClass]="tone(achievement(row))">
                    {{ achievement(row) }}%
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p class="m-0 text-[11px] text-slate-500">
          Achievement is the share of the target that was trained. Placement is measured against the number trained.
        </p>
      }
    </section>
  `
})
export class ScrutinyPastPerformanceComponent {
  readonly engagements = input<PastEngagement[]>([]);

  protected readonly totals = computed(() => {
    const rows = this.engagements();
    const target = rows.reduce((sum, r) => sum + r.target, 0);
    const trained = rows.reduce((sum, r) => sum + r.trained, 0);
    const placed = rows.reduce((sum, r) => sum + r.placed, 0);
    return {
      target,
      trained,
      placed,
      trainedPercent: percent(trained, target),
      placedPercent: percent(placed, trained)
    };
  });

  protected achievement(row: PastEngagement): number {
    return percent(row.trained, row.target);
  }

  /** Text colour for an achievement percentage: low results stand out. */
  protected tone(value: number): string {
    if (value >= 80) return 'text-navy';
    if (value >= 50) return 'text-amber-700';
    return 'text-rose-700';
  }
}
