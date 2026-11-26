import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EoiDocumentItem } from '../tenders.models';
import { ButtonComponent, IconComponent } from '../../../shared';

/** Clean card grid for published EOI documents, each with an icon-only View action. */
@Component({
  selector: 'app-scheme-documents-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent],
  host: { class: 'block' },
  template: `
    <section class="bg-white rounded-xl border border-[#EADCE2] shadow-2xs p-5 sm:p-6 space-y-4">
      <div class="flex items-center justify-between gap-3 pb-3.5 border-b border-[#EADCE2]">
        <div class="flex items-center gap-2">
          <h2 class="text-sm sm:text-base font-bold text-[#7C0E44] m-0">Scheme Documents</h2>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8EDF1] text-[#7C0E44] border border-[#EADCE2]">
            {{ docs().length }}
          </span>
        </div>
      </div>

      @if (docs().length === 0) {
        <p class="py-4 text-xs text-slate-500 italic m-0 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/40">
          No documents attached to this EOI.
        </p>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (doc of docs(); track doc.sNo) {
            <div class="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
              <div class="flex items-center gap-2.5 min-w-0">
                <app-icon name="pdf-badge" solid size="auto" class="w-6 h-6 text-[#E5252A] select-none shrink-0" />
                <div class="min-w-0">
                  <div class="font-semibold text-slate-900 text-[13px] leading-snug truncate" [title]="doc.name">{{ doc.name }}</div>
                  @if (doc.size) {
                    <div class="text-[11px] text-slate-500 leading-tight tabular-nums">{{ doc.size }}</div>
                  }
                </div>
              </div>
              <button
                appButton
                variant="ghost"
                size="sm"
                iconOnly
                type="button"
                (click)="view.emit(doc.name)"
                [title]="'View ' + doc.name"
                [attr.aria-label]="'View ' + doc.name"
                class="shrink-0"
              >
                <app-icon name="eye" size="sm" />
              </button>
            </div>
          }
        </div>
      }
    </section>
  `
})
export class SchemeDocumentsPanelComponent {
  readonly docs = input<EoiDocumentItem[]>([]);
  /** Emits the document title to open. */
  readonly view = output<string>();
}
