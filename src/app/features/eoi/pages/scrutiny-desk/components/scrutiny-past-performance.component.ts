import { ChangeDetectionStrategy, Component, OnInit, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { IconComponent, TableColumn, TableComponent } from '../../../../../shared';
import type { PastEngagement } from '../../../services/eoi-state.models';

/** Share of `part` in `whole`, rounded to a whole percent (0 when there is no whole). */
function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/**
 * Track record of the organisation under earlier government skill schemes.
 */
@Component({
  selector: 'app-scrutiny-past-performance',
  standalone: true,
  imports: [NgClass, DecimalPipe, TableComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-5' },
  template: `
    @if (engagements().length === 0) {
      <div class="py-10 text-center text-slate-500 text-xs">
        <app-icon name="info" size="md" class="mx-auto mb-2 text-slate-400" />
        <p class="m-0 font-medium">This organisation has not been empaneled under any prior state or central skilling schemes.</p>
      </div>
    } @else {
      <!-- Overall result across all earlier schemes: Clean Grid (No heavy box borders) -->
      <div class="space-y-4">
        <div class="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 flex items-center gap-2">
            <app-icon name="document" size="xs" class="text-primary" />
            <span>Cumulative Skilling Track Record Summary</span>
          </h3>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Overall Placement: {{ totals().placedPercent }}%
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-y-4 gap-x-6 text-xs pb-4 border-b border-slate-100">
          <div>
            <span class="text-xs font-medium text-slate-500 block mb-0.5">Prior Schemes</span>
            <span class="text-sm font-bold text-slate-900 block tabular-nums">{{ engagements().length }} Schemes</span>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-500 block mb-0.5">Total Target Allocated</span>
            <span class="text-sm font-bold text-slate-900 block tabular-nums">{{ totals().target | number }}</span>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-500 block mb-0.5">Candidates Trained</span>
            <span class="text-sm font-bold text-slate-900 block tabular-nums">
              {{ totals().trained | number }}
              <span class="text-xs font-medium text-slate-500">({{ totals().trainedPercent }}%)</span>
            </span>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-500 block mb-0.5">Candidates Placed</span>
            <span class="text-sm font-bold text-slate-900 block tabular-nums">
              {{ totals().placed | number }}
              <span class="text-xs font-medium text-slate-500">({{ totals().placedPercent }}%)</span>
            </span>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-500 block mb-0.5">Training Achievement</span>
            <span class="text-sm font-bold block" [ngClass]="tone(totals().trainedPercent)">
              {{ totals().trainedPercent }}% Verified
            </span>
          </div>
        </div>

        <!-- Schemes Track Record Table -->
        <div class="space-y-2 pt-2">
          <span class="text-xs font-bold text-slate-700 block">Scheme-Wise Performance History:</span>
          <app-table
            [columns]="columns"
            [data]="engagements()"
            [customTemplates]="{ achievement: achievementTemplate, status: statusTemplate }"
          />

          <ng-template #achievementTemplate let-row>
            <div class="flex items-center gap-2">
              <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                <div class="bg-primary h-1.5 rounded-full" [style.width.%]="percent(row.trained, row.target)"></div>
              </div>
              <span class="text-xs font-bold tabular-nums text-slate-800">{{ percent(row.trained, row.target) }}%</span>
            </div>
          </ng-template>

          <ng-template #statusTemplate let-row>
            <span
              class="inline-block px-2 py-0.5 rounded text-[11px] font-bold border"
              [class.bg-emerald-50]="row.status === 'Completed'"
              [class.text-emerald-800]="row.status === 'Completed'"
              [class.border-emerald-200]="row.status === 'Completed'"
              [class.bg-blue-50]="row.status === 'Ongoing'"
              [class.text-blue-800]="row.status === 'Ongoing'"
              [class.border-blue-200]="row.status === 'Ongoing'"
            >
              {{ row.status }}
            </span>
          </ng-template>
        </div>
      </div>
    }
  `
})
export class ScrutinyPastPerformanceComponent implements OnInit {
  readonly engagements = input<PastEngagement[]>([]);
  readonly initiallyOpen = input<boolean>(true);

  ngOnInit(): void {}

  protected percent = percent;

  readonly totals = computed(() => {
    const list = this.engagements();
    const target = list.reduce((sum, e) => sum + e.target, 0);
    const trained = list.reduce((sum, e) => sum + e.trained, 0);
    const placed = list.reduce((sum, e) => sum + e.placed, 0);
    return {
      target,
      trained,
      placed,
      trainedPercent: percent(trained, target),
      placedPercent: percent(placed, trained)
    };
  });

  tone(pct: number): string {
    if (pct >= 80) return 'text-emerald-600';
    if (pct >= 50) return 'text-amber-600';
    return 'text-rose-600';
  }

  protected readonly columns: TableColumn<PastEngagement>[] = [
    { key: '$index', label: 'Sr. No', type: 'number', align: 'center', width: 'w-16' },
    { key: 'schemeName', label: 'Scheme Name' },
    { key: 'target', label: 'Target', type: 'number', align: 'center' },
    { key: 'trained', label: 'Trained', type: 'number', align: 'center' },
    { key: 'placed', label: 'Placed', type: 'number', align: 'center' },
    { key: 'achievement', label: 'Achievement %', type: 'custom', align: 'center' },
    { key: 'status', label: 'Status', type: 'custom', align: 'center', width: 'w-28' }
  ];
}
