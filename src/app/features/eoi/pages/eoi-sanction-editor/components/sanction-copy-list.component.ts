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
          </li>
        }
      </ol>
    </div>
  `
})
export class SanctionCopyListComponent {
  readonly copyToList = input.required<string[]>();

  setCopyTo(index: number, value: string): void {
    this.copyToList()[index] = value;
  }
}
