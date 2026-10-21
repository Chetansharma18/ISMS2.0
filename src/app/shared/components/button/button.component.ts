import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * What the button is for:
 * - primary:   the main action of a screen or dialog (navy, filled)
 * - outline:   a secondary action next to it: Back, View, Cancel, Close (white, bordered)
 * - secondary: a soft tinted action
 * - danger:    a destructive action: Delete, Reject
 * - ghost:     a quiet text action, for example inside a toolbar or a table row
 * - inverse:   a quiet text action on a dark background (footer links)
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'inverse';
/** `xs` is the 22px size for a remove (x) inside a chip, a thumbnail or a dense row. */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * The only button of the portal. It styles the native element it sits on, so click, disabled,
 * type, title, aria-label and routerLink keep working exactly as on a plain button:
 *
 *   <button appButton variant="outline" size="sm" (click)="back()">Back</button>
 *   <button appButton [loading]="saving()" type="submit">Save</button>
 *   <button appButton variant="ghost" iconOnly aria-label="Close"><app-icon name="close" /></button>
 *   <a appButton variant="outline" routerLink="/home">Home</a>
 *
 * Colours, heights and radii come from the `.btn` rules in styles.css, so changing them there
 * changes every button in the app. Do not add colour, border, padding or font classes to a button.
 */
@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'nativeType()',
    '[attr.disabled]': 'isButton && (disabled() || loading()) ? "" : null',
    '[attr.aria-disabled]': '!isButton && (disabled() || loading()) ? "true" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null'
  },
  template: `
    @if (loading()) {
      <app-icon name="spinner" [stroke]="2.5" class="animate-spin" />
    }
    <ng-content />
  `
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  /** `submit` for the button of a form; the default stays `button` so nothing submits by accident. */
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Shows a spinner and blocks clicks while a request is running. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Stretches the button to the full width of its container. */
  readonly block = input(false, { transform: booleanAttribute });
  /** A square button that holds only an icon. Give it an `aria-label`. */
  readonly iconOnly = input(false, { transform: booleanAttribute });

  /** True on a <button>, false on an <a>: only a real button gets `type` and `disabled`. */
  protected readonly isButton = inject(ElementRef<HTMLElement>).nativeElement.tagName === 'BUTTON';

  protected readonly nativeType = computed(() => (this.isButton ? this.type() : null));

  protected readonly classes = computed(() => {
    const parts = ['btn', `btn-${this.variant()}`];
    if (this.size() === 'xs') parts.push('btn-xs');
    if (this.size() === 'sm') parts.push('btn-sm');
    if (this.size() === 'lg') parts.push('btn-lg');
    if (this.block()) parts.push('btn-block');
    if (this.iconOnly()) parts.push('btn-icon');
    return parts.join(' ');
  });
}
