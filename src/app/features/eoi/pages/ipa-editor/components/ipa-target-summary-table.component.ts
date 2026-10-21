import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocTableDirective, InputDirective } from '../../../../../shared';
import type { TargetSummaryRow } from '../ipa-editor.model';

/** Target allocation summary table, as on the printed IPA. Edits the parent-owned rows in place (default change detection). */
@Component({
  selector: 'app-ipa-target-summary-table',
  standalone: true,
  imports: [FormsModule, DocTableDirective, InputDirective],
  host: { class: 'block' },
  template: `
    <div class="my-5 font-serif">
      <table appDocTable class="w-full text-left border-collapse text-[13px] sm:text-sm border border-slate-900">
        <thead>
          <tr class="text-slate-900 font-bold">
            <th class="p-1 border border-slate-900 w-16 text-left">S.no.</th>
            <th class="p-1 border border-slate-900 text-left">Particular</th>
            <th class="p-1 border border-slate-900 w-48 text-right"><span class="sr-only">Value</span></th>
          </tr>
        </thead>
        <tbody>
          @for (sumRow of rows(); track sumRow.sNo; let i = $index) {
            <tr>
              <td class="p-1 border border-slate-900">{{ i + 1 }}</td>
              <td class="p-1 border border-slate-900">
                <input
                  appInput
                  variant="plain"
                  type="text"
                  aria-label="Particular"
                  [(ngModel)]="sumRow.particular"
                  class="w-full"
                />
              </td>
              <td class="p-1 border border-slate-900">
                <input
                  appInput
                  variant="plain"
                  type="text"
                  aria-label="Value"
                  [(ngModel)]="sumRow.value"
                  class="w-full text-right"
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
