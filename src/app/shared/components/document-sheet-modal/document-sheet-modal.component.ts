import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

let nextSheetId = 0;

/**
 * Full-screen overlay hosting a large printable document sheet.
 *
 * Content projection:
 *  - default slot: the document body (rendered inside the scrollable sheet area)
 *  - `ngProjectAs="[sheetFooter]"`: optional footer actions (rendered when `showFooter` is true)
 *
 * Bind the title as `[title]="'...'"` (not a static `title="..."`) so the browser does not also
 * render it as a native tooltip attribute on the host element.
 *
 * The overlay, toolbar and footer carry `print:` variants so window.print() outputs only the sheet.
 */
@Component({
  selector: 'app-document-sheet-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()'
  },
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-sans overflow-y-auto print:p-0 print:static print:bg-white print:z-auto"
      >
        <div
          class="bg-white shadow-2xl border border-slate-300 w-full overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none {{ maxWidthClass() }} {{ panelClass() }}"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
        >
          <!-- Toolbar (hidden during print) -->
          <div class="px-5 bg-navy text-white flex items-center justify-between shrink-0 print:hidden font-sans {{ toolbarClass() }}">
            <div class="flex items-center gap-2.5">
              <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h3 [id]="titleId" class="font-bold text-sm leading-tight">{{ title() }}</h3>
                @if (subtitle()) {
                  <p class="text-[11px] text-slate-300">{{ subtitle() }}</p>
                }
              </div>
            </div>

            <div class="flex items-center gap-2">
              @if (printLabel()) {
                <button
                  type="button"
                  (click)="print.emit()"
                  class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>{{ printLabel() }}</span>
                </button>
              }
              <button
                type="button"
                (click)="close.emit()"
                class="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Scrollable document sheet -->
          <div
            [attr.id]="contentId()"
            class="p-6 sm:p-10 overflow-y-auto space-y-4 text-[#111827] font-serif leading-relaxed text-xs sm:text-sm bg-white print:p-0 print:overflow-visible"
          >
            <ng-content></ng-content>
          </div>

          @if (showFooter()) {
            <!-- Footer actions (hidden during print) -->
            <div class="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 print:hidden font-sans">
              <ng-content select="[sheetFooter]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class DocumentSheetModalComponent {
  readonly isOpen = input(false);
  readonly title = input.required<string>();
  readonly subtitle = input('');
  /** Label of the toolbar print button; empty hides the button. */
  readonly printLabel = input('');
  readonly maxWidthClass = input('max-w-6xl');
  /** Extra classes for the panel (e.g. corner radius). */
  readonly panelClass = input('rounded-lg');
  /** Vertical padding classes for the toolbar. */
  readonly toolbarClass = input('py-3');
  /** Renders the footer bar and projects `[sheetFooter]` content into it. */
  readonly showFooter = input(false);
  /** Optional id for the scrollable sheet element. */
  readonly contentId = input<string | null>(null);

  readonly print = output<void>();
  readonly close = output<void>();

  protected readonly titleId = `document-sheet-title-${nextSheetId++}`;

  protected onEscape(): void {
    if (this.isOpen()) {
      this.close.emit();
    }
  }
}
