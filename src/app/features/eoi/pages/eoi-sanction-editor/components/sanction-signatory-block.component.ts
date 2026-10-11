import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Dispatch reference and signatory block. */
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

      <div class="text-right space-y-1">
        <div class="flex flex-col items-end">
          <input
            type="text"
            [ngModel]="signatoryName()" (ngModelChange)="signatoryName.set($event)"
            class="text-right font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48 text-xs"
          />
          <input
            type="text"
            [ngModel]="signatoryTitle()" (ngModelChange)="signatoryTitle.set($event)"
            class="text-right font-medium text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48 text-xs"
          />
          <input
            type="text"
            [ngModel]="signatoryOrg()" (ngModelChange)="signatoryOrg.set($event)"
            class="text-right text-slate-500 text-[10px] bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48"
          />
        </div>
      </div>
    </div>
  `
})
export class SanctionSignatoryBlockComponent {
  readonly dispatchRef = model<string>('');
  readonly signatoryName = model<string>('');
  readonly signatoryTitle = model<string>('');
  readonly signatoryOrg = model<string>('');
}
