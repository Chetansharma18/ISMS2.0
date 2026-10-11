import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SanctionTableRow } from '../eoi-sanction-editor.model';

/** Allocated physical targets table. Edits the parent-owned rows in place (default change detection). */
@Component({
  selector: 'app-sanction-targets-table',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <div class="my-6">
      <div class="flex items-center justify-between mb-2 font-sans">
        <h4 class="font-bold text-slate-900 text-xs uppercase tracking-tight">
          Allocated Physical Targets Table (Approved PIAs &amp; Agencies):
        </h4>
        <button
          type="button"
          (click)="addRow.emit()"
          class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-sans font-medium cursor-pointer flex items-center gap-1 print:hidden"
        >
          <span>+ Add Row</span>
        </button>
      </div>

      <div class="w-full">
        <table class="w-full text-left border-collapse font-sans text-[10.5px] sm:text-[11px] table-fixed">
          <thead>
            <tr class="bg-slate-100 text-slate-900 border border-slate-800 font-bold text-center">
              <th class="p-1 border border-slate-800 w-[5%]">Sr. No</th>
              <th class="p-1 border border-slate-800 w-[13%]">Application ID</th>
              <th class="p-1 border border-slate-800 w-[21%]">Name Of the Agency/PIA</th>
              <th class="p-1 border border-slate-800 w-[12%]">Sanction District</th>
              <th class="p-1 border border-slate-800 w-[16%]">Sanction Sector(s)</th>
              <th class="p-1 border border-slate-800 w-[13%]">Application Category</th>
              <th class="p-1 border border-slate-800 w-[5%]">Grade</th>
              <th class="p-1 border border-slate-800 w-[9%]">Sanction Target</th>
              <th class="p-1 border border-slate-800 w-[6%] print:hidden">Action</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.id; let i = $index) {
              <tr class="border border-slate-800 hover:bg-slate-50 transition-colors">
                <td class="border border-slate-800 p-0.5 text-center font-bold">
                  {{ i + 1 }}
                </td>
                <td class="border border-slate-800 p-0.5">
                  <input
                    type="text"
                    [(ngModel)]="row.appId"
                    class="w-full font-mono text-center bg-transparent border-none focus:outline-none text-[10px] leading-tight"
                  />
                </td>
                <td class="border border-slate-800 p-0.5">
                  <input
                    type="text"
                    [(ngModel)]="row.agencyName"
                    class="w-full font-medium bg-transparent border-none focus:outline-none px-0.5 text-[11px] truncate"
                  />
                </td>
                <td class="border border-slate-800 p-0.5">
                  <select
                    [(ngModel)]="row.district"
                    class="w-full bg-transparent border-none focus:outline-none cursor-pointer text-[10.5px] p-0 font-sans truncate"
                  >
                    @for (dist of districts(); track dist) {
                      <option [value]="dist">{{ dist }}</option>
                    }
                  </select>
                </td>
                <td class="border border-slate-800 p-0.5">
                  <select
                    [(ngModel)]="row.sector"
                    class="w-full bg-transparent border-none focus:outline-none cursor-pointer text-[10.5px] p-0 font-sans truncate"
                  >
                    @for (sec of sectors(); track sec) {
                      <option [value]="sec">{{ sec }}</option>
                    }
                  </select>
                </td>
                <td class="border border-slate-800 p-0.5 text-center">
                  <input
                    type="text"
                    [(ngModel)]="row.category"
                    class="w-full text-center bg-transparent border-none focus:outline-none text-[10.5px]"
                  />
                </td>
                <td class="border border-slate-800 p-0.5 text-center font-bold">
                  <input
                    type="text"
                    [(ngModel)]="row.grade"
                    class="w-full text-center font-bold bg-transparent border-none focus:outline-none text-[11px]"
                  />
                </td>
                <td class="border border-slate-800 p-0.5 text-center">
                  <input
                    type="number"
                    [(ngModel)]="row.target"
                    class="w-full text-center font-bold bg-transparent border-none focus:outline-none text-[11px]"
                  />
                </td>
                <td class="border border-slate-800 p-0.5 text-center print:hidden">
                  <button
                    type="button"
                    (click)="removeRow.emit(i)"
                    class="text-rose-600 hover:text-rose-800 text-xs font-bold px-0.5"
                    title="Delete Row"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SanctionTargetsTableComponent {
  readonly rows = input.required<SanctionTableRow[]>();
  readonly districts = input<readonly string[]>([]);
  readonly sectors = input<readonly string[]>([]);
  readonly addRow = output<void>();
  readonly removeRow = output<number>();
}
