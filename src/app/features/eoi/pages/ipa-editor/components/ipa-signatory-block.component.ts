import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** CC distribution list and signatory block. Edits the parent-owned CC list in place (default change detection). */
@Component({
  selector: 'app-ipa-signatory-block',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <div class="mt-8 pt-4 flex items-end justify-between font-sans text-xs border-t border-slate-300">
      <div class="space-y-1">
        <p class="font-bold text-slate-800">CC:</p>
        <ol class="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
          @for (item of copyToList(); track i; let i = $index) {
            <li class="group flex items-center gap-2">
              <span class="font-semibold shrink-0">{{ i + 1 }}-</span>
              <input
                type="text"
                [ngModel]="copyToList()[i]" (ngModelChange)="setCopyTo(i, $event)"
                class="w-full bg-transparent border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none px-1 text-[11px]"
              />
            </li>
          }
        </ol>
      </div>

      <div class="text-right space-y-1">
        <div class="flex flex-col items-end">
          <input
            type="text"
            [ngModel]="signatoryTitle()" (ngModelChange)="signatoryTitle.set($event)"
            class="text-right font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48 text-xs"
          />
          <input
            type="text"
            [ngModel]="signatorySub()" (ngModelChange)="signatorySub.set($event)"
            class="text-right font-medium text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48 text-xs"
          />
        </div>
      </div>
    </div>
  `
})
export class IpaSignatoryBlockComponent {
  readonly copyToList = input.required<string[]>();
  readonly signatoryTitle = model<string>('');
  readonly signatorySub = model<string>('');

  setCopyTo(index: number, value: string): void {
    this.copyToList()[index] = value;
  }
}
