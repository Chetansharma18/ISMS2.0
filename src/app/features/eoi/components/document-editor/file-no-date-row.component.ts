import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../shared';

/** "File No" and "Date" row shown under the letterhead of the official letters. */
@Component({
  selector: 'app-file-no-date-row',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-sans text-xs font-semibold border-b border-slate-200 pb-2"
      [class]="marginClass()"
    >
      <div class="flex items-center gap-1.5 w-full sm:w-auto">
        <span class="text-slate-600 shrink-0">File No:</span>
        <input
          appInput
          variant="plain"
          type="text"
          [ngModel]="fileNo()"
          (ngModelChange)="fileNo.set($event)"
          class="w-full sm:w-96 font-mono"
        />
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <span class="text-slate-600">Date:</span>
        <input
          appInput
          variant="plain"
          type="text"
          [ngModel]="date()"
          (ngModelChange)="date.set($event)"
          class="w-32 text-right font-mono"
        />
      </div>
    </div>
  `
})
export class FileNoDateRowComponent {
  readonly fileNo = model<string>('');
  readonly date = model<string>('');
  /** Bottom margin utility (the IPA letter uses mb-3, the sanction order mb-4). */
  readonly marginClass = input<string>('mb-4');
}
