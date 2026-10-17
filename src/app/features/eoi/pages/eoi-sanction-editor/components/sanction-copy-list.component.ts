import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, InputDirective } from '../../../../../shared';

/** Copy-to distribution list. Edits the parent-owned list in place (default change detection). */
@Component({
  selector: 'app-sanction-copy-list',
  standalone: true,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective],
  host: { class: 'block' },
  template: `
    <div class="mt-6 pt-4 border-t border-slate-300 font-sans text-xs">
      <p class="font-bold text-slate-800 mb-1.5">Copy to:</p>
      <ol class="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
        @for (item of copyToList(); track i; let i = $index) {
          <li class="group flex items-center gap-2">
            <input
              appInput
              variant="plain"
              type="text"
              [ngModel]="copyToList()[i]" (ngModelChange)="setCopyTo(i, $event)"
              class="w-full"
            />
            <button
              appButton
              variant="ghost"
              size="sm"
              iconOnly
              class="shrink-0 -my-1.5 print:hidden"
              (click)="removeCopyTo(i)"
              title="Remove row"
              aria-label="Remove row"
            >
              <app-icon name="close" size="sm" />
            </button>
          </li>
        }
      </ol>
      <button appButton variant="outline" size="sm" class="mt-2 print:hidden" (click)="addCopyTo()">
        + Add Row
      </button>
    </div>
  `
})
export class SanctionCopyListComponent {
  readonly copyToList = input.required<string[]>();

  setCopyTo(index: number, value: string): void {
    this.copyToList()[index] = value;
  }

  addCopyTo(): void {
    this.copyToList().push('');
  }

  removeCopyTo(index: number): void {
    this.copyToList().splice(index, 1);
  }
}
