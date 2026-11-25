import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../../shared';

/** Dispatch reference line of the printed sanction order. The signer's name and signature are added by the e-sign. */
@Component({
  selector: 'app-sanction-signatory-block',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block font-serif text-[13px] sm:text-sm' },
  template: `
    <div class="mt-10 pt-2 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div class="flex items-center gap-1.5 w-full sm:w-auto">
        <span class="shrink-0">File No:</span>
        <input
          appInput
          variant="plain"
          type="text"
          aria-label="Dispatch file number"
          [ngModel]="dispatchRef()" (ngModelChange)="dispatchRef.set($event)"
          class="tabular-nums w-full sm:w-[30rem]"
        />
      </div>
      <span class="shrink-0 tabular-nums">Date: {{ date() }}</span>
    </div>
  `
})
export class SanctionSignatoryBlockComponent {
  readonly dispatchRef = model<string>('');
  /** Date of the order, shown after the dispatch reference. */
  readonly date = input<string>('');
}
