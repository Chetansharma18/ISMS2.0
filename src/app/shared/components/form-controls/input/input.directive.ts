import { Directive, booleanAttribute, computed, input } from '@angular/core';

export type InputSize = 'md' | 'sm';

/**
 * - boxed: the standard bordered field (default)
 * - plain: no border or background, for a value typed straight into a printed letter or a table cell
 * - underline: only a bottom line, for sign-in style forms
 */
export type InputVariant = 'boxed' | 'plain' | 'underline';

/**
 * The look of every text field, dropdown and text area of the portal. Put it on the native element,
 * so `ngModel`, `formControl`, `placeholder`, `disabled` and `type` keep working as usual:
 *
 *   <input appInput [(ngModel)]="name" placeholder="Name" />
 *   <input appInput size="sm" type="number" [(ngModel)]="count" />
 *   <select appInput [(ngModel)]="district"> ... </select>
 *   <textarea appInput rows="3" [(ngModel)]="remark"></textarea>
 *   <input appInput variant="plain" [(ngModel)]="cell" />      (inside a printed table)
 *   <input appInput [invalid]="submitted && !name" ... />
 *
 * Border, height, radius, colours and focus ring come from the `.form-control` rules in styles.css.
 * Do not add colour, border, padding, rounded or font classes to a field; keep layout classes only
 * (width, margin, flex). Checkbox, radio and file inputs stay native.
 * For a labelled field with an error message, use <app-form-input> / <app-form-select> instead.
 */
@Directive({
  selector: 'input[appInput], select[appInput], textarea[appInput]',
  standalone: true,
  host: { '[class]': 'classes()', '[attr.aria-invalid]': 'invalid() ? "true" : null' }
})
export class InputDirective {
  readonly size = input<InputSize>('md');
  readonly variant = input<InputVariant>('boxed');
  /** Shows the error border. */
  readonly invalid = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const parts = ['form-control'];
    if (this.variant() === 'plain') parts.push('form-control-plain');
    if (this.variant() === 'underline') parts.push('form-control-underline');
    if (this.size() === 'sm') parts.push('form-control-sm');
    if (this.invalid()) parts.push('is-invalid');
    return parts.join(' ');
  });
}
