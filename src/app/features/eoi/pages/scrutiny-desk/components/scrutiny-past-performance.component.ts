import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { TableColumn, TableComponent } from '../../../../../shared';
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
  imports: [NgClass, TableComponent],
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

        <app-table
          [columns]="columns"
          [data]="engagements()"
          [customTemplates]="{ scheme: schemeTemplate, year: yearTemplate, achievement: achievementTemplate }"
        >
        </app-table>

        <ng-template #schemeTemplate let-row>
          <span class="block font-medium text-slate-900 text-[12.5px]">{{ row.schemeName }}</span>
          <span class="block text-[11px] text-slate-500 tabular-nums">{{ row.eoiRefNo }}</span>
        </ng-template>

        <ng-template #yearTemplate let-row>
          {{ row.financialYear }}
          @if (row.status === 'Ongoing') {
            <span class="ml-1 px-1.5 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-semibold">Ongoing</span>
          }
        </ng-template>

        <ng-template #achievementTemplate let-row>
          <span class="font-semibold" [ngClass]="tone(achievement(row))">{{ achievement(row) }}%</span>
        </ng-template>

        <p class="m-0 text-[11px] text-slate-500">
          Achievement is the share of the target that was trained. Placement is measured against the number trained.
        </p>
      }
    </section>
  `
})
export class ScrutinyPastPerformanceComponent {
  readonly engagements = input<PastEngagement[]>([]);

  protected readonly columns: TableColumn<PastEngagement>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-10' },
    { key: 'scheme', label: 'Scheme', type: 'custom' },
    { key: 'year', label: 'Year', type: 'custom', cellClass: 'whitespace-nowrap' },
    { key: 'target', label: 'Target', align: 'right' },
    { key: 'trained', label: 'Trained', align: 'right' },
    { key: 'certified', label: 'Certified', align: 'right' },
    { key: 'placed', label: 'Placed', align: 'right' },
    { key: 'achievement', label: 'Achievement', type: 'custom', align: 'right', cellClass: 'whitespace-nowrap' }
  ];

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
