import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

/**
 * An on/off switch, for example Active / Inactive in a table row. The parent owns the state:
 *
 *   <app-switch [checked]="item.status === 'Active'" label="Active status" (toggled)="toggleStatus(item)" />
 *
 * Clicking emits `toggled` with the value the switch should take; it does not change `checked` by
 * itself, so the screen decides what happens (for example it may ask for confirmation first).
 * Use it instead of a hand-made `role="switch"` button.
 */
@Component({
  selector: 'app-switch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
  template: `
    <button
      type="button"
      role="switch"
      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
      [class]="checked() ? 'bg-navy hover:bg-navy-dark' : 'bg-slate-300 hover:bg-slate-400'"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="label()"
      [disabled]="disabled()"
      (click)="toggled.emit(!checked())"
    >
      <span class="sr-only">{{ label() }}</span>
      <span
        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        [class]="checked() ? 'translate-x-4' : 'translate-x-0'"
      ></span>
    </button>
  `
})
export class SwitchComponent {
  readonly checked = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Read out by screen readers, for example "Active status". */
  readonly label = input('Toggle');

  readonly toggled = output<boolean>();
}
