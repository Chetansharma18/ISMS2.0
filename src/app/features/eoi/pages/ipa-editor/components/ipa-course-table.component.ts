import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, DocTableDirective, IconComponent, InputDirective } from '../../../../../shared';
import type { IpaCourseRow } from '../ipa-editor.model';
import { recalculateRowTotal } from '../ipa-editor.util';

/** Approved course & cycles table. Edits the parent-owned rows in place (default change detection). */
@Component({
  selector: 'app-ipa-course-table',
  standalone: true,
  imports: [FormsModule, ButtonComponent, DocTableDirective, IconComponent, InputDirective],
  host: { class: 'block' },
  template: `
    <div class="my-5">
      <div class="flex items-center justify-between mb-2 font-sans">
        <h4 class="font-bold text-slate-900 text-xs uppercase tracking-tight">
          APPROVED COURSE &amp; CYCLES DETAILS:
        </h4>
        <button appButton variant="outline" size="sm" class="print:hidden" (click)="addRow.emit()">
          <span>+ Add Course Row</span>
        </button>
      </div>

      <div class="w-full overflow-hidden">
        <table appDocTable class="w-full table-fixed text-center border-collapse font-sans text-[8.5px] border border-slate-900 leading-tight">
          <thead>
            <tr class="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold">
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[2.5%]">S. No.</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[11.5%]">Sector</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[8.5%]">Course Name</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[7.5%]">Course Code</th>
              <th colspan="2" class="p-0.5 border-r border-b border-slate-900">Duration</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6%]">Mandatory Provision of OJT in Job Role (Yes/No)</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[7%]">Minimum Edu. Qualification of trainee</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6%]">Minimum Job Entry Age of Trainee</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[3%]">R/NR</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[3%]">R. Cat.</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[9.5%]">Cost Per Trainee</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[5.5%]">Approved Trainees/ batch</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6.5%]">Cost Per Batch</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[4%]">Possible Cycles for FY 26-27</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6.5%]">Total Budget</th>
              <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[4%]">Per Day Training Hours</th>
              <th rowspan="2" class="p-0.5 border-b border-slate-900 w-[2%] print:hidden">Del</th>
            </tr>
            <tr class="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold">
              <th class="p-0.5 border-r border-b border-slate-900 w-[3.5%]">Days</th>
              <th class="p-0.5 border-r border-b border-slate-900 w-[3.5%]">Hrs</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.id; let i = $index) {
              <tr class="border-b border-slate-900 hover:bg-slate-50 transition-colors">
                <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                  {{ i + 1 }}
                </td>
                <td class="p-0.5 border-r border-slate-900 text-left">
                  <textarea
                    appInput
                    variant="plain"
                    [(ngModel)]="row.sector"
                    rows="2"
                    class="w-full leading-tight resize-none"
                  ></textarea>
                </td>
                <td class="p-0.5 border-r border-slate-900 text-left font-bold">
                  <textarea
                    appInput
                    variant="plain"
                    [(ngModel)]="row.courseName"
                    rows="2"
                    class="w-full font-bold leading-tight resize-none"
                  ></textarea>
                </td>
                <td class="p-0.5 border-r border-slate-900 font-mono text-center">
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    [(ngModel)]="row.courseCode"
                    class="w-full text-center"
                  />
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    [(ngModel)]="row.durationDays"
                    class="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    [(ngModel)]="row.durationHours"
                    class="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    [(ngModel)]="row.mandatoryOjt"
                    class="w-full text-center"
                  />
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center">
                  <textarea
                    appInput
                    variant="plain"
                    [(ngModel)]="row.minEdu"
                    rows="2"
                    class="w-full text-center leading-tight resize-none"
                  ></textarea>
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center">
                  <textarea
                    appInput
                    variant="plain"
                    [(ngModel)]="row.minAge"
                    rows="2"
                    class="w-full text-center leading-tight resize-none"
                  ></textarea>
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    [(ngModel)]="row.rnr"
                    class="w-full text-center font-bold"
                  />
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    [(ngModel)]="row.rCat"
                    class="w-full text-center font-bold"
                  />
                </td>
                <!-- Cost Per Trainee Stacked Cell -->
                <td class="p-0 border-r border-slate-900 align-top">
                  <table appDocTable class="w-full text-[8px] border-collapse">
                    <tr class="border-b border-slate-300">
                      <td class="p-0.2 border-r border-slate-300 font-semibold w-5 text-center">C</td>
                      <td class="p-0.2 text-right font-medium pr-0.5">
                        <input
                          appInput
                          variant="plain"
                          type="number"
                          [(ngModel)]="row.costC"
                          (ngModelChange)="recalculateRowTotal(row)"
                          class="w-full text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                    </tr>
                    <tr class="border-b border-slate-300">
                      <td class="p-0.2 border-r border-slate-300 font-semibold text-center">H</td>
                      <td class="p-0.2 text-right font-medium pr-0.5">
                        <input
                          appInput
                          variant="plain"
                          type="number"
                          [(ngModel)]="row.costH"
                          (ngModelChange)="recalculateRowTotal(row)"
                          class="w-full text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                    </tr>
                    <tr class="border-b border-slate-300">
                      <td class="p-0.2 border-r border-slate-300 font-semibold text-center">Toolkit</td>
                      <td class="p-0.2 text-right font-medium pr-0.5">
                        <input
                          appInput
                          variant="plain"
                          type="text"
                          [(ngModel)]="row.costToolkit"
                          class="w-full text-right"
                        />
                      </td>
                    </tr>
                    <tr class="bg-slate-50 font-bold">
                      <td class="p-0.2 border-r border-slate-300 text-center">Total</td>
                      <td class="p-0.2 text-right font-bold pr-0.5">{{ row.totalCostPerTrainee }}</td>
                    </tr>
                  </table>
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    [(ngModel)]="row.approvedTrainees"
                    (ngModelChange)="recalculateRowTotal(row)"
                    class="w-full text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center font-bold text-slate-900">
                  {{ row.costPerBatch }}
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    [(ngModel)]="row.cycles"
                    (ngModelChange)="recalculateRowTotal(row)"
                    class="w-full text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center font-bold text-slate-900">
                  {{ row.totalBudget }}
                </td>
                <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    [(ngModel)]="row.perDayHours"
                    class="w-full text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td class="p-0.5 text-center print:hidden">
                  <button
                    appButton
                    variant="ghost"
                    size="xs"
                    iconOnly
                    type="button"
                    (click)="removeRow.emit(i)"
                    class="print:hidden"
                    aria-label="Delete row"
                    title="Delete Row"
                  >
                    <app-icon name="close" size="xs" />
                  </button>
                </td>
              </tr>
            }
            <!-- TOTAL SUMMARY FOOTER ROW -->
            <tr class="bg-slate-100 font-bold border-b border-slate-900 text-center">
              <td colspan="12" class="p-1 border-r border-slate-900 text-right pr-2 font-bold uppercase tracking-wider text-[8.5px]">
                TOTAL
              </td>
              <td class="p-1 border-r border-slate-900 text-center font-bold text-slate-950 text-[8.5px]">
                {{ totalTrainees() }}
              </td>
              <td class="p-1 border-r border-slate-900 text-center font-bold text-slate-950 text-[8.5px]">
                {{ totalCostPerBatch() }}
              </td>
              <td class="p-1 border-r border-slate-900 text-center font-bold text-slate-950 text-[8.5px]">
                {{ totalCycles() }}
              </td>
              <td class="p-1 border-r border-slate-900 text-center font-bold text-slate-950 text-[8.5px]">
                {{ totalBudget() }}
              </td>
              <td class="p-1 border-r border-slate-900"></td>
              <td class="p-1 print:hidden"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class IpaCourseTableComponent {
  readonly rows = input.required<IpaCourseRow[]>();
  readonly totalTrainees = input<number>(0);
  readonly totalCostPerBatch = input<number>(0);
  readonly totalCycles = input<number>(0);
  readonly totalBudget = input<number>(0);

  readonly addRow = output<void>();
  readonly removeRow = output<number>();

  recalculateRowTotal(row: IpaCourseRow): void {
    recalculateRowTotal(row);
  }
}
