import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, InputDirective } from '../../../../shared';
import { ClauseLabelFormat, clauseLabel } from './document-editor.util';

/**
 * Editable "terms and conditions" clause list with add / remove actions.
 * Edits the parent-owned string array in place (ngModel), so it stays on default change detection.
 */
@Component({
  selector: 'app-clause-list',
  standalone: true,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective],
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
              appInput
              variant="plain"
              [ngModel]="clauses()[i]"
              (ngModelChange)="setClause(i, $event)"
              rows="2"
              class="w-full leading-relaxed resize-y font-serif"
            ></textarea>
            <button
              appButton
              variant="ghost"
              size="sm"
              iconOnly
              class="opacity-0 group-hover:opacity-100 print:hidden shrink-0 mt-1"
              (click)="remove.emit(i)"
              title="Remove Clause"
              aria-label="Remove Clause"
            >
              <app-icon name="close" size="sm" />
            </button>
          </li>
        }
      </ol>

      <div class="mt-3 print:hidden">
        <button appButton variant="outline" size="sm" (click)="add.emit()">
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
