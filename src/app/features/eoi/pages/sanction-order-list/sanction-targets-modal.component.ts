import { ChangeDetectionStrategy, Component, HostListener, computed, input, output } from '@angular/core';
import type { SanctionTableRow } from '../eoi-sanction-editor/eoi-sanction-editor.model';

/** The approved companies of a released sanction order, with the targets sanctioned to each. */
@Component({
  selector: 'app-sanction-targets-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans"
      style="background: rgba(10,20,40,0.5); backdrop-filter: blur(4px);"
      (click)="close.emit()"
    >
      <div
        class="w-full max-w-5xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        aria-labelledby="targets-title"
      >
        <div class="h-1.5 w-full bg-navy shrink-0"></div>

        <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <h2 id="targets-title" class="text-base sm:text-lg font-bold text-slate-900 m-0">Approved Companies</h2>
            <p class="text-xs text-slate-500 m-0 mt-0.5">{{ schemeTitle() }}</p>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close"
            aria-label="Close"
          >
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-5 sm:px-6 py-5 overflow-auto flex-1">
          <div class="overflow-x-auto border border-slate-300 rounded-lg">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-50 text-slate-700 text-[11.5px] font-semibold">
                <tr>
                  <th class="px-3 py-2.5 border-b border-r border-slate-300 w-14">Sr. No</th>
                  <th class="px-3 py-2.5 border-b border-r border-slate-300">Application ID</th>
                  <th class="px-3 py-2.5 border-b border-r border-slate-300">Name of the Agency / PIA</th>
                  <th class="px-3 py-2.5 border-b border-r border-slate-300">Sanction District</th>
                  <th class="px-3 py-2.5 border-b border-r border-slate-300">Sanction Sector(s)</th>
                  <th class="px-3 py-2.5 border-b border-r border-slate-300 text-center">Grade</th>
                  <th class="px-3 py-2.5 border-b border-slate-300 text-right whitespace-nowrap">Sanction Target</th>
                </tr>
              </thead>
              <tbody class="text-slate-800">
                @for (row of rows(); track row.id; let i = $index) {
                  <tr class="hover:bg-slate-50/60">
                    <td class="px-3 py-2.5 border-b border-r border-slate-200">{{ i + 1 }}</td>
                    <td class="px-3 py-2.5 border-b border-r border-slate-200 font-mono text-[11.5px]">{{ row.appId }}</td>
                    <td class="px-3 py-2.5 border-b border-r border-slate-200 font-medium">{{ row.agencyName }}</td>
                    <td class="px-3 py-2.5 border-b border-r border-slate-200">{{ row.district }}</td>
                    <td class="px-3 py-2.5 border-b border-r border-slate-200">{{ row.sector }}</td>
                    <td class="px-3 py-2.5 border-b border-r border-slate-200 text-center">{{ row.grade }}</td>
                    <td class="px-3 py-2.5 border-b border-slate-200 text-right">{{ row.target }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-3 py-6 text-center text-slate-500">No approved companies in this sanction order.</td>
                  </tr>
                }
              </tbody>
              @if (rows().length > 0) {
                <tfoot class="bg-slate-50 font-semibold text-slate-900">
                  <tr>
                    <td colspan="6" class="px-3 py-2.5 border-r border-slate-300 text-right">Total</td>
                    <td class="px-3 py-2.5 text-right">{{ total() }}</td>
                  </tr>
                </tfoot>
              }
            </table>
          </div>
        </div>

        <div class="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            (click)="close.emit()"
            class="px-5 py-2 rounded-lg bg-navy hover:bg-[#07243c] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            style="color: #ffffff !important;"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `
})
export class SanctionTargetsModalComponent {
  readonly schemeTitle = input('');
  readonly rows = input<SanctionTableRow[]>([]);
  readonly close = output<void>();

  protected readonly total = computed(() => this.rows().reduce((sum, row) => sum + (Number(row.target) || 0), 0));

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close.emit();
  }
}
