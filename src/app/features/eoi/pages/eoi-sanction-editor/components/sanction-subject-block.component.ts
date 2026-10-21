import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../../shared';

/** Document title, subject / reference lines and the preamble paragraph, laid out like the printed sanction order. */
@Component({
  selector: 'app-sanction-subject-block',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block font-serif text-[13px] sm:text-sm' },
  template: `
    <div class="text-center my-4">
      <input
        appInput
        variant="plain"
        type="text"
        aria-label="Document title"
        [ngModel]="documentTitle()" (ngModelChange)="documentTitle.set($event)"
        class="w-full text-center font-bold underline text-base sm:text-lg"
      />
    </div>

    <!-- Subject & Reference Section (Editable) -->
    <div class="space-y-3 mb-4">
      <div class="flex items-start gap-1.5">
        <span class="font-bold text-slate-900 shrink-0">Subject:</span>
        <textarea
          appInput
          variant="plain"
          rows="1"
          aria-label="Subject"
          [ngModel]="subjectText()" (ngModelChange)="subjectText.set($event)"
          class="w-full font-bold resize-none field-sizing-content text-justify"
        ></textarea>
      </div>

      <div class="flex items-start gap-1.5">
        <span class="font-bold italic text-slate-900 shrink-0">Ref:</span>
        <textarea
          appInput
          variant="plain"
          rows="1"
          aria-label="Reference"
          [ngModel]="referenceText()" (ngModelChange)="referenceText.set($event)"
          class="w-full font-bold italic resize-none field-sizing-content"
        ></textarea>
      </div>
    </div>

    <!-- Preamble Paragraph (Editable) -->
    <div class="mb-4">
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
export class SanctionSubjectBlockComponent {
  readonly documentTitle = model<string>('');
  readonly subjectText = model<string>('');
  readonly referenceText = model<string>('');
  readonly preambleText = model<string>('');
}
