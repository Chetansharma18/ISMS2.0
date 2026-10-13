import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Copy-to distribution list. Edits the parent-owned list in place (default change detection). */
@Component({
  selector: 'app-sanction-copy-list',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <div class="mt-6 pt-4 border-t border-slate-300 font-sans text-xs">
      <p class="font-bold text-slate-800 mb-1.5">Copy to:</p>
      <ol class="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
        @for (item of copyToList(); track i; let i = $index) {
          <li class="group flex items-center gap-2">
            <input
              type="text"
              [ngModel]="copyToList()[i]" (ngModelChange)="setCopyTo(i, $event)"
              class="w-full bg-transparent border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none px-1 text-[11px]"
            />
            <button
              type="button"
              (click)="removeCopyTo(i)"
              class="shrink-0 w-5 h-5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center cursor-pointer print:hidden"
              title="Remove row"
              aria-label="Remove row"
            >
              &times;
            </button>
          </li>
        }
      </ol>
      <button
        type="button"
        (click)="addCopyTo()"
        class="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-semibold text-navy cursor-pointer print:hidden"
      >
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
