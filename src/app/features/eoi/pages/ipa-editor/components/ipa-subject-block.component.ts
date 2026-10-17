import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../../shared';

/** Reference / subject lines, preamble paragraph and the PIA name and SDC address block. */
@Component({
  selector: 'app-ipa-subject-block',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-2 mb-4 font-sans text-xs bg-slate-50/60 p-2.5 border border-slate-200 rounded">
      <div class="flex items-start gap-2">
        <span class="font-bold text-slate-900 shrink-0">Ref:</span>
        <textarea
          appInput
          variant="plain"
          [ngModel]="referenceNo()" (ngModelChange)="referenceNo.set($event)"
          rows="1"
          class="w-full"
        ></textarea>
      </div>

      <div class="flex items-start gap-2">
        <span class="font-bold text-slate-900 shrink-0">Sub:</span>
        <textarea
          appInput
          variant="plain"
          [ngModel]="subjectText()" (ngModelChange)="subjectText.set($event)"
          rows="2"
          class="w-full font-bold resize-y"
        ></textarea>
      </div>
    </div>

    <!-- Preamble Paragraph (Editable) -->
    <div class="mb-4 text-justify font-serif text-xs sm:text-sm leading-relaxed">
      <textarea
        appInput
        variant="plain"
        [ngModel]="preambleText()" (ngModelChange)="preambleText.set($event)"
        rows="3"
        class="w-full leading-relaxed resize-y font-serif"
      ></textarea>
    </div>

    <!-- Name of PIA & SDC Address Block -->
    <div class="mb-4 font-sans text-xs bg-slate-100 p-2.5 border border-slate-300 rounded space-y-1.5">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <span class="font-bold text-slate-900 shrink-0 w-36">Name of PIA -</span>
        <input
          appInput
          size="sm"
          type="text"
          [ngModel]="piaName()" (ngModelChange)="piaName.set($event)"
          class="w-full font-bold"
        />
      </div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <span class="font-bold text-slate-900 shrink-0 w-36">SDC Address -</span>
        <input
          appInput
          size="sm"
          type="text"
          [ngModel]="sdcAddress()" (ngModelChange)="sdcAddress.set($event)"
          class="w-full"
        />
      </div>
    </div>
  `
})
export class IpaSubjectBlockComponent {
  readonly referenceNo = model<string>('');
  readonly subjectText = model<string>('');
  readonly preambleText = model<string>('');
  readonly piaName = model<string>('');
  readonly sdcAddress = model<string>('');
}
