import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../shared';

/**
 * "File No" and "Date" row shown under the letterhead of the official letters.
 * With `official` it is plain serif text on one line, as on the printed sanction order.
 */
@Component({
  selector: 'app-file-no-date-row',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" [class]="rowClass()">
      <div class="flex items-center gap-1.5 w-full sm:w-auto">
        @if (showFileLabel()) {
          <span class="shrink-0" [class]="labelClass()">File No:</span>
        }
        <input
          appInput
          variant="plain"
          type="text"
          aria-label="File number"
          [ngModel]="fileNo()"
          (ngModelChange)="fileNo.set($event)"
          class="w-full tabular-nums"
          [class]="official() ? 'sm:w-[30rem]' : 'sm:w-96'"
        />
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <span [class]="labelClass()">Date:</span>
        <input
          appInput
          variant="plain"
          type="text"
          aria-label="Date"
          [ngModel]="date()"
          (ngModelChange)="date.set($event)"
          class="w-32 text-right tabular-nums"
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
  /** The look of the printed RSLDC letters: serif, regular weight, no line under the row. */
  readonly official = input<boolean>(false);
  /** The printed IPA shows the number without the "File No:" label. */
  readonly showFileLabel = input<boolean>(true);

  protected readonly rowClass = computed(() =>
    this.official()
      ? `font-serif text-[13px] sm:text-sm ${this.marginClass()}`
      : `font-sans text-xs font-semibold border-b border-slate-200 pb-2 ${this.marginClass()}`
  );

  protected readonly labelClass = computed(() => (this.official() ? '' : 'text-slate-600'));
}
