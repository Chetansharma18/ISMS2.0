import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../../shared';

/** Dispatch reference of the sanction order. */
@Component({
  selector: 'app-sanction-signatory-block',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mt-8 pt-4 flex items-end justify-between font-sans text-xs border-t border-slate-300">
      <div>
        <p class="font-bold text-slate-800">Dispatch Reference:</p>
        <input
          appInput
          variant="plain"
          type="text"
          [ngModel]="dispatchRef()" (ngModelChange)="dispatchRef.set($event)"
          class="font-mono w-64 block"
        />
      </div>
    </div>
  `
})
export class SanctionSignatoryBlockComponent {
  readonly dispatchRef = model<string>('');
}
