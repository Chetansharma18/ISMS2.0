import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Dispatch reference of the sanction order. */
@Component({
  selector: 'app-sanction-signatory-block',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mt-8 pt-4 flex items-end justify-between font-sans text-xs border-t border-slate-300">
      <div>
        <p class="font-bold text-slate-800">Dispatch Reference:</p>
        <input
          type="text"
          [ngModel]="dispatchRef()" (ngModelChange)="dispatchRef.set($event)"
          class="font-mono text-[11px] text-slate-700 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-800 focus:outline-none w-64 block"
        />
      </div>
    </div>
  `
})
export class SanctionSignatoryBlockComponent {
  readonly dispatchRef = model<string>('');
}
