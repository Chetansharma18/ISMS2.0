import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Document title, subject / reference lines and the preamble paragraph. */
@Component({
  selector: 'app-sanction-subject-block',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="text-center my-3">
      <input
        type="text"
        [ngModel]="documentTitle()" (ngModelChange)="documentTitle.set($event)"
        class="w-full text-center font-bold text-slate-900 text-base tracking-wide uppercase bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none underline"
      />
    </div>

    <!-- Subject & Reference Section (Editable) -->
    <div class="space-y-2 mb-4 font-sans text-xs">
      <div class="flex items-start gap-2">
        <span class="font-bold text-slate-900 shrink-0">Subject:</span>
        <textarea
          [ngModel]="subjectText()" (ngModelChange)="subjectText.set($event)"
          rows="2"
          class="w-full font-medium text-slate-800 bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs rounded resize-y"
        ></textarea>
      </div>

      <div class="flex items-start gap-2">
        <span class="font-bold text-slate-900 shrink-0">Ref:</span>
        <textarea
          [ngModel]="referenceText()" (ngModelChange)="referenceText.set($event)"
          rows="1"
          class="w-full text-slate-700 bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs rounded"
        ></textarea>
      </div>
    </div>

    <!-- Preamble Paragraph (Editable) -->
    <div class="mb-4 text-justify">
      <textarea
        [ngModel]="preambleText()" (ngModelChange)="preambleText.set($event)"
        rows="3"
        class="w-full text-slate-800 bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs sm:text-sm leading-relaxed rounded resize-y font-serif"
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
