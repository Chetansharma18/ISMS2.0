import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClauseLabelFormat, clauseLabel } from './document-editor.util';

/**
 * Editable "terms and conditions" clause list with add / remove actions.
 * Edits the parent-owned string array in place (ngModel), so it stays on default change detection.
 */
@Component({
  selector: 'app-clause-list',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <div class="mt-6 mb-4 font-sans text-xs">
      <p class="font-bold text-slate-900 mb-2">
        {{ intro() }}
      </p>
      <ol [class]="listClass()">
        @for (clause of clauses(); track i; let i = $index) {
          <li class="group flex items-start gap-2">
            <span [class]="labelClass()">{{ label(i) }}</span>
            <textarea
              [ngModel]="clauses()[i]"
              (ngModelChange)="setClause(i, $event)"
              rows="2"
              class="w-full bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs rounded leading-relaxed resize-y font-serif"
            ></textarea>
            <button
              type="button"
              (click)="remove.emit(i)"
              class="opacity-0 group-hover:opacity-100 text-rose-600 hover:text-rose-800 text-xs font-bold px-1 print:hidden shrink-0 mt-1"
              title="Remove Clause"
            >
              &times;
            </button>
          </li>
        }
      </ol>

      <div class="mt-3 print:hidden">
        <button
          type="button"
          (click)="add.emit()"
          class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-sans cursor-pointer flex items-center gap-1"
        >
          <span>+ Add Terms &amp; Conditions Clause</span>
        </button>
      </div>
    </div>
  `
})
export class ClauseListComponent {
  readonly clauses = input.required<string[]>();
  readonly intro = input<string>('');
  /** Classes of the wrapping &lt;ol&gt; (list style, padding, spacing, text size). */
  readonly listClass = input<string>('');
  /** Classes of the clause label span. */
  readonly labelClass = input<string>('');
  readonly labelFormat = input<ClauseLabelFormat>('decimal');

  readonly add = output<void>();
  readonly remove = output<number>();

  label(index: number): string {
    return clauseLabel(index, this.labelFormat());
  }

  setClause(index: number, value: string): void {
    this.clauses()[index] = value;
  }
}
