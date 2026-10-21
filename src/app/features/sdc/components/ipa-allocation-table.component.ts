import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DocTableDirective } from '../../../shared';
import type { IpaCourseRow } from '../../eoi/services/eoi-state.models';

/**
 * The courses an IPA sets for a district, laid out like the course table of the IPA letter. It is read-only:
 * the IPA decides the courses, batches and trainees, not the training partner.
 */
@Component({
  selector: 'app-ipa-allocation-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocTableDirective],
  template: `
    <div class="w-full overflow-x-auto">
      <table appDocTable class="w-full min-w-[900px] text-center border-collapse font-sans text-[11px] border border-slate-900 leading-tight">
        <thead>
          <tr class="bg-slate-100 text-slate-900 font-bold">
            <th rowspan="2" class="p-1 border border-slate-900 w-10">S. No</th>
            <th rowspan="2" class="p-1 border border-slate-900">Sector</th>
            <th rowspan="2" class="p-1 border border-slate-900">Course Name</th>
            <th rowspan="2" class="p-1 border border-slate-900">Course Code</th>
            <th colspan="2" class="p-1 border border-slate-900">Duration</th>
            <th rowspan="2" class="p-1 border border-slate-900">Min Qual.</th>
            <th rowspan="2" class="p-1 border border-slate-900 w-12">R/NR</th>
            <th rowspan="2" class="p-1 border border-slate-900 w-12">R. Cat</th>
            <th rowspan="2" class="p-1 border border-slate-900 w-28">Cost Per Trainee</th>
            <th rowspan="2" class="p-1 border border-slate-900">Approved Trainees/ batch</th>
            <th rowspan="2" class="p-1 border border-slate-900">Cost Per Batch</th>
            <th rowspan="2" class="p-1 border border-slate-900">Possible Cycles for FY 26-27</th>
            <th rowspan="2" class="p-1 border border-slate-900">Total Budget</th>
          </tr>
          <tr class="bg-slate-100 text-slate-900 font-bold">
            <th class="p-1 border border-slate-900">Day's</th>
            <th class="p-1 border border-slate-900">Hrs</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.id; let i = $index) {
            <tr>
              <td class="p-1 border border-slate-900 font-bold">{{ i + 1 }}</td>
              <td class="p-1 border border-slate-900 font-bold">{{ row.sector }}</td>
              <td class="p-1 border border-slate-900 font-bold">{{ row.courseName }}</td>
              <td class="p-1 border border-slate-900 tabular-nums">{{ row.courseCode }}</td>
              <td class="p-1 border border-slate-900 tabular-nums">{{ row.durationDays }}</td>
              <td class="p-1 border border-slate-900 tabular-nums">{{ row.durationHours }}</td>
              <td class="p-1 border border-slate-900">{{ row.minEdu }}</td>
              <td class="p-1 border border-slate-900 font-bold">{{ row.rnr }}</td>
              <td class="p-1 border border-slate-900 font-bold">{{ row.rCat }}</td>
              <td class="p-0 border border-slate-900 align-top">
                <div class="flex border-b border-slate-300">
                  <span class="w-7 py-0.5 border-r border-slate-300 font-semibold">C</span>
                  <span class="flex-1 py-0.5 pr-1 text-right tabular-nums">{{ row.costC }}</span>
                </div>
                <div class="flex border-b border-slate-300">
                  <span class="w-7 py-0.5 border-r border-slate-300 font-semibold">H</span>
                  <span class="flex-1 py-0.5 pr-1 text-right tabular-nums">{{ row.costH || 'NA' }}</span>
                </div>
                <div class="flex bg-slate-50 font-bold">
                  <span class="w-7 py-0.5 border-r border-slate-300">T</span>
                  <span class="flex-1 py-0.5 pr-1 text-right tabular-nums">{{ row.totalCostPerTrainee }}</span>
                </div>
              </td>
              <td class="p-1 border border-slate-900 font-bold tabular-nums">{{ row.approvedTrainees }}</td>
              <td class="p-1 border border-slate-900 font-bold tabular-nums">{{ row.costPerBatch }}</td>
              <td class="p-1 border border-slate-900 font-bold tabular-nums">{{ row.cycles }}</td>
              <td class="p-1 border border-slate-900 font-bold tabular-nums">{{ row.totalBudget }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="14" class="p-4 border border-slate-900 text-slate-500">This IPA has no course for the selected district.</td>
            </tr>
          }
          <tr class="bg-slate-100 font-bold">
            <td colspan="10" class="p-1 border border-slate-900 text-left">Total</td>
            <td class="p-1 border border-slate-900 tabular-nums">{{ totals().trainees }}</td>
            <td class="p-1 border border-slate-900 tabular-nums">{{ totals().costPerBatch }}</td>
            <td class="p-1 border border-slate-900 tabular-nums">{{ totals().cycles }}</td>
            <td class="p-1 border border-slate-900 tabular-nums">{{ totals().budget }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-2 text-xs text-slate-600 m-0">
      Training target of this SDC: <strong class="tabular-nums text-slate-900">{{ target() }}</strong> trainees
    </p>
  `
})
export class IpaAllocationTableComponent {
  /** Course rows the IPA sets for the district. */
  readonly rows = input.required<IpaCourseRow[]>();

  readonly totals = computed(() => {
    const list = this.rows();
    const sum = (pick: (row: IpaCourseRow) => number): number => list.reduce((total, row) => total + (Number(pick(row)) || 0), 0);
    return {
      trainees: sum(r => r.approvedTrainees),
      costPerBatch: sum(r => r.costPerBatch),
      cycles: sum(r => r.cycles),
      budget: sum(r => r.totalBudget)
    };
  });

  /** Trainees this SDC trains: batches x trainees per batch, over all rows. */
  readonly target = computed(() =>
    this.rows().reduce((sum, r) => sum + (Number(r.cycles) || 0) * (Number(r.approvedTrainees) || 0), 0)
  );
}
