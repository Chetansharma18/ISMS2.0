import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, InputDirective } from '../../../../../shared';

/** "Copy to" distribution list, closed with the row of stars as on the printed sanction order. Edits the parent-owned list in place. */
@Component({
  selector: 'app-sanction-copy-list',
  standalone: true,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective],
  host: { class: 'block' },
  template: `
    <div class="mt-5 font-serif text-[13px] sm:text-sm">
      <p class="m-0 mb-1.5">Copy to:</p>
      <ol class="list-none m-0 p-0 space-y-1">
        @for (item of copyToList(); track i; let i = $index) {
          <li class="group flex items-center gap-1.5">
            <span class="shrink-0 w-7 text-right pr-1">{{ i + 1 }}.</span>
            <input
              appInput
              variant="plain"
              type="text"
              [attr.aria-label]="'Copy to ' + (i + 1)"
              [ngModel]="copyToList()[i]" (ngModelChange)="setCopyTo(i, $event)"
              class="w-full"
            />
            <button
              appButton
              variant="ghost"
              size="sm"
              iconOnly
              class="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 print:hidden"
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
        <app-icon name="plus" size="sm" />
        <span>Add Row</span>
      </button>
      <p class="mt-6 mb-0 text-center tracking-[0.3em]" aria-hidden="true">*****</p>
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
