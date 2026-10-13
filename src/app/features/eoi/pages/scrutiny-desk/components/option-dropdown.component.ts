import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

/** Value emitted when the user picks the "Other" row. */
export const OTHER_OPTION = '__other__';

/**
 * Dropdown for long, wrapping options. The list opens in the page flow, at the width of the
 * field, so it never spills out of a dialog the way the browser's own select list can.
 */
@Component({
  selector: 'app-option-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <button
      type="button"
      [id]="inputId()"
      (click)="open.update(o => !o)"
      [attr.aria-expanded]="open()"
      aria-haspopup="listbox"
      class="w-full min-h-[38px] px-3 py-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between gap-2 shadow-2xs hover:border-slate-400 text-left"
      [class]="open() ? 'border-navy' : 'border-slate-300'"
    >
      <span class="text-xs leading-snug" [class]="value() ? 'text-slate-800' : 'text-slate-400'">{{ label() }}</span>
      <svg class="w-4 h-4 text-slate-400 shrink-0 transition-transform" [class.rotate-180]="open()" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    @if (open()) {
      <ul class="mt-1 m-0 p-1 list-none border border-slate-300 rounded-lg bg-white shadow-xs max-h-48 overflow-y-auto" role="listbox">
        @for (option of options(); track option) {
          <li>
            <button
              type="button"
              role="option"
              [attr.aria-selected]="option === value()"
              (click)="pick(option)"
              class="w-full text-left px-2.5 py-2 rounded text-xs leading-snug text-slate-800 hover:bg-slate-50 cursor-pointer"
              [class.bg-slate-100]="option === value()"
            >
              {{ option }}
            </button>
          </li>
        }
        <li>
          <button
            type="button"
            role="option"
            [attr.aria-selected]="value() === other"
            (click)="pick(other)"
            class="w-full text-left px-2.5 py-2 rounded text-xs leading-snug text-navy font-semibold hover:bg-slate-50 cursor-pointer border-t border-slate-100"
          >
            {{ otherLabel() }}
          </button>
        </li>
      </ul>
    }
  `
})
export class OptionDropdownComponent {
  readonly options = input<string[]>([]);
  /** Selected option, or `OTHER_OPTION`. Empty when nothing is selected. */
  readonly value = input('');
  readonly placeholder = input('Select');
  readonly otherLabel = input('Other (type your own)');
  readonly inputId = input('');

  readonly valueChange = output<string>();

  protected readonly open = signal(false);
  protected readonly other = OTHER_OPTION;

  protected label(): string {
    const value = this.value();
    if (!value) return this.placeholder();
    return value === OTHER_OPTION ? this.otherLabel() : value;
  }

  protected pick(option: string): void {
    this.valueChange.emit(option);
    this.open.set(false);
  }
}
