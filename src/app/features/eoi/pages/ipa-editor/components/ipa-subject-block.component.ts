import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../../shared';

/** Reference and subject lines and the opening paragraph, laid out like the printed IPA. */
@Component({
  selector: 'app-ipa-subject-block',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block font-serif text-[13px] sm:text-sm' },
  template: `
    <div class="space-y-1 mb-3">
      <div class="flex items-start gap-1.5">
        <span class="font-bold text-slate-900 shrink-0">Ref:</span>
        <textarea
          appInput
          variant="plain"
          rows="1"
          aria-label="Reference"
          [ngModel]="referenceNo()" (ngModelChange)="referenceNo.set($event)"
          class="w-full font-bold resize-none field-sizing-content"
        ></textarea>
      </div>

      <div class="flex items-start gap-1.5">
        <span class="font-bold text-slate-900 shrink-0">Sub:</span>
        <textarea
          appInput
          variant="plain"
          rows="1"
          aria-label="Subject"
          [ngModel]="subjectText()" (ngModelChange)="subjectText.set($event)"
          class="w-full font-bold resize-none field-sizing-content"
        ></textarea>
      </div>
    </div>

    <!-- Opening paragraph (Editable) -->
    <div class="mb-3">
      <textarea
        appInput
        variant="plain"
        rows="1"
        aria-label="Opening paragraph"
        [ngModel]="preambleText()" (ngModelChange)="preambleText.set($event)"
        class="w-full leading-relaxed resize-none field-sizing-content text-justify"
      ></textarea>
    </div>
  `
})
export class IpaSubjectBlockComponent {
  readonly referenceNo = model<string>('');
  readonly subjectText = model<string>('');
  readonly preambleText = model<string>('');
}
