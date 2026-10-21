import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../../shared';

/** The line about the minimum qualification of the trainees and the box that lists it, as on the printed IPA. */
@Component({
  selector: 'app-ipa-qualification-block',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block font-serif text-[13px] sm:text-sm' },
  template: `
    <div class="my-4">
      <textarea
        appInput
        variant="plain"
        rows="1"
        aria-label="Minimum qualification note"
        [ngModel]="note()" (ngModelChange)="note.set($event)"
        class="w-full font-bold leading-relaxed resize-none field-sizing-content text-justify"
      ></textarea>

      <div class="mt-3 border border-slate-900">
        <div class="px-1.5 py-1 border-b border-slate-900">
          <textarea
            appInput
            variant="plain"
            rows="1"
            aria-label="Qualification heading"
            [ngModel]="title()" (ngModelChange)="title.set($event)"
            class="w-full font-bold resize-none field-sizing-content"
          ></textarea>
        </div>
        <div class="px-1.5 py-1">
          <textarea
            appInput
            variant="plain"
            rows="1"
            aria-label="Qualification lines"
            [ngModel]="text()" (ngModelChange)="text.set($event)"
            class="w-full leading-relaxed resize-none field-sizing-content"
          ></textarea>
        </div>
      </div>
    </div>
  `
})
export class IpaQualificationBlockComponent {
  readonly note = model<string>('');
  readonly title = model<string>('');
  readonly text = model<string>('');
}
