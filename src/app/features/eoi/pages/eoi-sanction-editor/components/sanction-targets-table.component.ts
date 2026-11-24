import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, DocTableDirective, DropdownComponent, IconComponent, InputDirective } from '../../../../../shared';
import type { SanctionTableRow } from '../eoi-sanction-editor.model';

/**
 * Allocated physical targets table, in the layout of the printed sanction order (black grid, bold centred heading row).
 * Edits the parent-owned rows in place (default change detection). The Action column is for the screen only.
 */
@Component({
  selector: 'app-sanction-targets-table',
  standalone: true,
  imports: [FormsModule, ButtonComponent, DocTableDirective, IconComponent, InputDirective, DropdownComponent],
  host: { class: 'block' },
  template: `
    <div class="my-5 font-serif">
      <div class="w-full">
        <table appDocTable class="w-full text-left border-collapse text-[12px] sm:text-[13px] table-fixed leading-snug">
          <thead>
            <tr class="text-slate-900 font-bold text-center align-middle">
              <th class="p-1.5 border border-slate-900 w-[7%]">Sr. No</th>
              <th class="p-1.5 border border-slate-900 w-[14%]">Application ID</th>
              <th class="p-1.5 border border-slate-900 w-[28%]">Name Of the Agency/PIA</th>
              <th class="p-1.5 border border-slate-900 w-[15%]">Sanction District</th>
              <th class="p-1.5 border border-slate-900 w-[18%]">Sanction Sector (s)</th>
              <th class="p-1.5 border border-slate-900 w-[7%]">Grade</th>
              <th class="p-1.5 border border-slate-900 w-[8%]">Sanction Target</th>
              <th class="p-1.5 border border-slate-900 w-[4%] print:hidden"><span class="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.id; let i = $index) {
              <tr class="align-middle">
                <td class="border border-slate-900 p-1.5 text-center">
                  {{ i + 1 }}
                </td>
                <td class="border border-slate-900 p-1.5">
                  <textarea
                    appInput
                    variant="plain"
                    rows="1"
                    aria-label="Application ID"
                    [(ngModel)]="row.appId"
                    class="w-full resize-none field-sizing-content break-all"
                  ></textarea>
                </td>
                <td class="border border-slate-900 p-1.5">
                  <textarea
                    appInput
                    variant="plain"
                    rows="1"
                    aria-label="Name of the agency"
                    [(ngModel)]="row.agencyName"
                    class="w-full resize-none field-sizing-content"
                  ></textarea>
                </td>
                <td class="border border-slate-900 p-1.5">
                  <app-dropdown
                    size="sm"
                    ariaLabel="Sanction district"
                    [options]="districtOptions(row)"
                    [(value)]="row.district"
                    placeholder="Select District"
                    class="w-full font-sans"
                  />
                </td>
                <td class="border border-slate-900 p-1.5">
                  <app-dropdown
                    size="sm"
                    ariaLabel="Sanction sector"
                    [options]="sectorOptions(row)"
                    [(value)]="row.sector"
                    placeholder="Select Sector"
                    class="w-full font-sans"
                  />
                </td>
                <td class="border border-slate-900 p-1.5 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="text"
                    aria-label="Grade"
                    [(ngModel)]="row.grade"
                    class="w-full text-center"
                  />
                </td>
                <td class="border border-slate-900 p-1.5 text-center">
                  <input
                    appInput
                    variant="plain"
                    type="number"
                    aria-label="Sanction target"
                    [(ngModel)]="row.target"
                    class="w-full text-center"
                  />
                </td>
                <td class="border border-slate-900 p-0.5 text-center print:hidden">
                  <button
                    appButton
                    variant="ghost"
                    size="sm"
                    iconOnly
                    (click)="removeRow.emit(i)"
                    title="Delete Row"
                    aria-label="Delete Row"
                  >
                    <app-icon name="close" size="sm" />
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mt-2 flex justify-end font-sans print:hidden">
        <button appButton variant="outline" size="sm" type="button" (click)="addRow.emit()">
          <app-icon name="plus" size="sm" />
          <span>Add Row</span>
        </button>
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

  districtOptions(row: SanctionTableRow): string[] {
    const list = this.districts() as string[];
    if (row.district && !list.includes(row.district)) {
      return [row.district, ...list];
    }
    return list;
  }

  sectorOptions(row: SanctionTableRow): string[] {
    const list = this.sectors() as string[];
    if (row.sector && !list.includes(row.sector)) {
      return [row.sector, ...list];
    }
    return list;
  }
}
