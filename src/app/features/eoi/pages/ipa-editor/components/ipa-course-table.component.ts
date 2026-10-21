import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, DocTableDirective, IconComponent, InputDirective } from '../../../../../shared';
import type { IpaCourseRow } from '../ipa-editor.model';
import { recalculateRowTotal } from '../ipa-editor.util';

/**
 * Approved course & cycles table, in the layout of the printed IPA: a black grid with the name and address of the
 * agency across the top, then the heading rows and one row per course. The Del column is for the screen only.
 * Edits the parent-owned rows in place (default change detection).
 */
@Component({
  selector: 'app-ipa-course-table',
  standalone: true,
  imports: [FormsModule, ButtonComponent, DocTableDirective, IconComponent, InputDirective],
  host: { class: 'block' },
  template: `
    <div class="my-4 font-serif">
      <div class="w-full overflow-hidden">
        <table appDocTable class="w-full table-fixed text-center border-collapse text-[8.5px] leading-tight">
          <thead>
            <!-- Name of the agency and the address of its SDC -->
            <tr>
              <th colspan="19" class="p-1 border border-slate-900 font-bold">
                <input
                  appInput
                  variant="plain"
                  type="text"
                  aria-label="Name of the agency"
                  [ngModel]="piaName()" (ngModelChange)="piaName.set($event)"
                  class="w-full text-center font-bold text-[10px]"
                />
                <div class="flex items-center justify-center gap-1 text-[9px]">
                  <span class="shrink-0">Add.-</span>
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    aria-label="Address of the SDC"
                    [ngModel]="sdcAddress()" (ngModelChange)="sdcAddress.set($event)"
                    class="min-w-0 flex-1 text-center font-bold"
                  />
                </div>
              </th>
            </tr>
            <tr class="text-slate-900 font-bold">
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[2.5%]">S. No.</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[6%]">District</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[8.5%]">Sector</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[7%]">Course Name</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[7.5%]">Course Code</th>
              <th colspan="2" class="p-0.5 border border-slate-900">Duration</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[6%]">Mandatory Provision of OJT in Job Role (Yes/No)</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[6%]">Minimum Edu. Qualification of trainee</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[5.5%]">Minimum Job Entry Age of Trainee</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[3%]">R/NR</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[3%]">R. Cat.</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[9.5%]">Cost Per Trainee</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[5.5%]">Approved Trainees/ batch</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[6.5%]">Cost Per Batch</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[4%]">Possible Cycles for FY 26-27</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[6.5%]">Total Budget</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[4%]">Per Day Training Hours</th>
              <th rowspan="2" class="p-0.5 border border-slate-900 w-[2%] print:hidden"><span class="sr-only">Delete</span></th>
            </tr>
            <tr class="text-slate-900 font-bold">
              <th class="p-0.5 border border-slate-900 w-[3.5%]">Days</th>
              <th class="p-0.5 border border-slate-900 w-[3.5%]">Hrs</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.id; let i = $index) {
              <tr class="align-middle">
                <td class="p-0.5 border border-slate-900 text-center">
                  {{ i + 1 }}
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    aria-label="District"
                    [(ngModel)]="row.district"
                    class="w-full text-center"
                  />
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  <textarea
                    appInput
                    variant="plain"
                    rows="1"
                    aria-label="Sector"
                    [(ngModel)]="row.sector"
                    class="w-full text-center leading-tight resize-none field-sizing-content"
                  ></textarea>
                </td>
                <td class="p-0.5 border border-slate-900 text-center font-bold">
                  <textarea
                    appInput
                    variant="plain"
                    rows="1"
                    aria-label="Course name"
                    [(ngModel)]="row.courseName"
                    class="w-full text-center font-bold leading-tight resize-none field-sizing-content"
                  ></textarea>
                </td>
                <td class="p-0.5 border border-slate-900 tabular-nums text-center">
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    aria-label="Course code"
                    [(ngModel)]="row.courseCode"
                    class="w-full text-center"
                  />
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    aria-label="Duration in days"
                    [(ngModel)]="row.durationDays"
                    class="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    aria-label="Duration in hours"
                    [(ngModel)]="row.durationHours"
                    class="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    aria-label="Mandatory OJT"
                    [(ngModel)]="row.mandatoryOjt"
                    class="w-full text-center"
                  />
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  <textarea
                    appInput
                    variant="plain"
                    rows="1"
                    aria-label="Minimum educational qualification"
                    [(ngModel)]="row.minEdu"
                    class="w-full text-center leading-tight resize-none field-sizing-content"
                  ></textarea>
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  <textarea
                    appInput
                    variant="plain"
                    rows="1"
                    aria-label="Minimum job entry age"
                    [(ngModel)]="row.minAge"
                    class="w-full text-center leading-tight resize-none field-sizing-content"
                  ></textarea>
                </td>
                <td class="p-0.5 border border-slate-900 text-center font-bold">
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    aria-label="Residential or non-residential"
                    [(ngModel)]="row.rnr"
                    class="w-full text-center font-bold"
                  />
                </td>
                <td class="p-0.5 border border-slate-900 text-center font-bold">
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    aria-label="Residential category"
                    [(ngModel)]="row.rCat"
                    class="w-full text-center font-bold"
                  />
                </td>
                <!-- Cost Per Trainee Stacked Cell -->
                <td class="p-0 border border-slate-900 align-middle">
                  <table appDocTable class="w-full text-[8px] border-collapse">
                    <tr class="border-b border-slate-900">
                      <td class="p-0.5 border-r border-slate-900 font-semibold w-5 text-center">C</td>
                      <td class="p-0.5 text-center">
                        <input
                          appInput
                          variant="plain"
                          type="number"
                          aria-label="Cost of the course"
                          [(ngModel)]="row.costC"
                          (ngModelChange)="recalculateRowTotal(row)"
                          class="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                    </tr>
                    <tr class="border-b border-slate-900">
                      <td class="p-0.5 border-r border-slate-900 font-semibold text-center">H</td>
                      <td class="p-0.5 text-center">
                        <input
                          appInput
                          variant="plain"
                          type="number"
                          aria-label="Cost of the hostel"
                          [(ngModel)]="row.costH"
                          (ngModelChange)="recalculateRowTotal(row)"
                          class="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                    </tr>
                    <tr class="border-b border-slate-900">
                      <td class="p-0.5 border-r border-slate-900 font-semibold text-center">Toolkit</td>
                      <td class="p-0.5 text-center">
                        <input
                          appInput
                          variant="plain"
                          type="text"
                          aria-label="Cost of the toolkit"
                          [(ngModel)]="row.costToolkit"
                          class="w-full text-center"
                        />
                      </td>
                    </tr>
                    <tr class="font-bold">
                      <td class="p-0.5 border-r border-slate-900 text-center">T</td>
                      <td class="p-0.5 text-center font-bold">{{ row.totalCostPerTrainee }}</td>
                    </tr>
                  </table>
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    aria-label="Approved trainees per batch"
                    [(ngModel)]="row.approvedTrainees"
                    (ngModelChange)="recalculateRowTotal(row)"
                    class="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  {{ row.costPerBatch }}
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    aria-label="Possible cycles"
                    [(ngModel)]="row.cycles"
                    (ngModelChange)="recalculateRowTotal(row)"
                    class="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  {{ row.totalBudget }}
                </td>
                <td class="p-0.5 border border-slate-900 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    aria-label="Per day training hours"
                    [(ngModel)]="row.perDayHours"
                    class="w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td class="p-0.5 border border-slate-900 text-center print:hidden">
                  <button
                    appButton
                    variant="ghost"
                    size="sm"
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
            <!-- Total row -->
            <tr class="font-bold text-center">
              <td colspan="13" class="p-1 border border-slate-900 text-left pl-2 font-bold">Total</td>
              <td class="p-1 border border-slate-900 text-center font-bold">{{ totalTrainees() }}</td>
              <td class="p-1 border border-slate-900 text-center font-bold">{{ totalCostPerBatch() }}</td>
              <td class="p-1 border border-slate-900 text-center font-bold">{{ totalCycles() }}</td>
              <td class="p-1 border border-slate-900 text-center font-bold">{{ totalBudget() }}</td>
              <td class="p-1 border border-slate-900"></td>
              <td class="p-1 border border-slate-900 print:hidden"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-2 flex justify-end font-sans print:hidden">
        <button appButton variant="outline" size="sm" type="button" (click)="addRow.emit()">
          <app-icon name="plus" size="sm" />
          <span>Add Course Row</span>
        </button>
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
  /** Name of the agency and the address of its SDC, printed across the top of the table. */
  readonly piaName = model<string>('');
  readonly sdcAddress = model<string>('');

  readonly addRow = output<void>();
  readonly removeRow = output<number>();

  recalculateRowTotal(row: IpaCourseRow): void {
    recalculateRowTotal(row);
  }
}
