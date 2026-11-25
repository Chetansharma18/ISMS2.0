import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DropdownComponent } from '../../../../../shared';

/** Value emitted when the user picks the "Other" row. */
export const OTHER_OPTION = '__other__';

/**
 * Dropdown for long, wrapping options with a closing "Other" row. It keeps the `OTHER_OPTION`
 * value contract of the scrutiny dialogs on top of the shared <app-dropdown>.
 */
@Component({
  selector: 'app-option-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <app-dropdown
      [inputId]="inputId()"
      [options]="options()"
      [placeholder]="placeholder()"
      [value]="value() === other ? '' : value()"
      [otherLabel]="otherLabel()"
      [otherSelected]="value() === other"
      (valueChange)="valueChange.emit($event)"
      (other)="valueChange.emit(other)"
    />
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

  protected readonly other = OTHER_OPTION;
}
