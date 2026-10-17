import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../../shared';

/** Document title, subject / reference lines and the preamble paragraph. */
@Component({
  selector: 'app-sanction-subject-block',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="text-center my-3">
      <input
        appInput
        variant="plain"
        type="text"
        [ngModel]="documentTitle()" (ngModelChange)="documentTitle.set($event)"
        class="w-full text-center font-bold tracking-wide uppercase underline"
      />
    </div>

    <!-- Subject & Reference Section (Editable) -->
    <div class="space-y-2 mb-4 font-sans text-xs">
      <div class="flex items-start gap-2">
        <span class="font-bold text-slate-900 shrink-0">Subject:</span>
        <textarea
          appInput
          variant="plain"
          [ngModel]="subjectText()" (ngModelChange)="subjectText.set($event)"
          rows="2"
          class="w-full font-medium resize-y"
        ></textarea>
      </div>

      <div class="flex items-start gap-2">
        <span class="font-bold text-slate-900 shrink-0">Ref:</span>
        <textarea
          appInput
          variant="plain"
          [ngModel]="referenceText()" (ngModelChange)="referenceText.set($event)"
          rows="1"
          class="w-full"
        ></textarea>
      </div>
    </div>

    <!-- Preamble Paragraph (Editable) -->
    <div class="mb-4 text-justify">
      <textarea
        appInput
        variant="plain"
        [ngModel]="preambleText()" (ngModelChange)="preambleText.set($event)"
        rows="3"
        class="w-full leading-relaxed resize-y font-serif"
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
