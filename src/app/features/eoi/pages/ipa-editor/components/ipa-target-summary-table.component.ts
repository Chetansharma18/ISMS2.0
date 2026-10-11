import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { TargetSummaryRow } from '../ipa-editor.model';

/** Target allocation summary table. Edits the parent-owned rows in place (default change detection). */
@Component({
  selector: 'app-ipa-target-summary-table',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <div class="my-5">
      <h4 class="font-bold text-slate-900 text-xs uppercase tracking-tight mb-1.5 font-sans">
        Target Allocation Summary Table:
      </h4>
      <table class="w-full sm:w-8/12 text-left border-collapse font-sans text-xs border border-slate-900">
        <thead>
          <tr class="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold">
            <th class="p-1.5 border-r border-slate-900 w-14 text-center">S.No.</th>
            <th class="p-1.5 border-r border-slate-900">Particular</th>
            <th class="p-1.5 text-center w-48">Value</th>
          </tr>
        </thead>
        <tbody>
          @for (sumRow of rows(); track sumRow.sNo; let i = $index) {
            <tr class="border-b border-slate-900">
              <td class="p-1.5 border-r border-slate-900 text-center font-bold">{{ i + 1 }}</td>
              <td class="p-1.5 border-r border-slate-900 font-medium text-slate-800">
                <input
                  type="text"
                  [(ngModel)]="sumRow.particular"
                  class="w-full bg-transparent border-none focus:outline-none text-xs"
                />
              </td>
              <td class="p-1.5 text-center font-bold">
                <input
                  type="text"
                  [(ngModel)]="sumRow.value"
                  class="w-full text-center bg-transparent border-none focus:outline-none font-bold text-xs"
                />
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class IpaTargetSummaryTableComponent {
  readonly rows = input.required<TargetSummaryRow[]>();
}
