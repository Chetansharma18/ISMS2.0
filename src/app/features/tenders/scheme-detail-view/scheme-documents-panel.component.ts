import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EoiDocumentItem } from '../tenders.models';
import { ButtonComponent, IconComponent } from '../../../shared';

/** The files published with the EOI (attached on the Configure EOI form, plus corrigenda), each with a View action. */
@Component({
  selector: 'app-scheme-documents-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent],
  host: { class: 'block h-full' },
  template: `
    <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs h-full">
      <div class="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900">Scheme Documents</h3>
      </div>

      @if (docs().length === 0) {
        <p class="px-4 py-6 text-xs text-slate-500 italic m-0">No documents attached to this EOI.</p>
      } @else {
        <table class="w-full text-left border-collapse text-xs sm:text-[13px]">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/40 text-[11.5px] uppercase tracking-wider text-slate-500 font-semibold">
              <th class="px-4 py-2.5">Document</th>
              <th class="px-4 py-2.5 text-right w-28">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            @for (doc of docs(); track doc.sNo) {
              <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <app-icon name="pdf-badge" solid size="auto" class="w-6 h-6 text-[#E5252A] select-none shrink-0" />
                    <div class="min-w-0">
                      <div class="font-semibold text-slate-900 leading-snug">{{ doc.name }}</div>
                      @if (doc.size) {
                        <div class="text-[11px] text-slate-500 leading-tight tabular-nums">{{ doc.size }}</div>
                      }
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    appButton
                    variant="ghost"
                    size="sm"
                    iconOnly
                    type="button"
                    (click)="view.emit(doc.name)"
                    [title]="'View ' + doc.name"
                    [attr.aria-label]="'View ' + doc.name"
                  >
                    <app-icon name="eye" size="sm" />
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `
})
export class SchemeDocumentsPanelComponent {
  readonly docs = input<EoiDocumentItem[]>([]);
  /** Emits the document title to open. */
  readonly view = output<string>();
}
