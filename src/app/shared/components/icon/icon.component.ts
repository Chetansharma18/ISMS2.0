import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { ICONS, IconName } from './icons';
import { SOLID_ICONS, SolidIconDef, SolidIconName } from './icons.solid';

/** `auto` fills the box given to the element by classes, for example `class="w-16 h-16"`. */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'auto';

const SIZE_CLASS: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
  '2xl': 'w-8 h-8',
  '3xl': 'w-10 h-10',
  auto: 'w-full h-full'
};

/**
 * An icon from the shared set. It takes the text colour of its parent
 * (`text-brand`, `text-slate-500`, ...), so colour it with a class on the element.
 *
 *   <app-icon name="eye" size="sm" />                    outline icon (icons.ts)
 *   <app-icon name="play" solid />                       filled icon or brand mark (icons.solid.ts)
 *   <app-icon name="camera" size="auto" class="w-16 h-16 sm:w-20 sm:h-20" />   any size
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
  template: `
    @if (solid()) {
      <svg [class]="sizeClass()" [attr.viewBox]="solidDef().viewBox" fill="currentColor" aria-hidden="true">
        @for (d of solidDef().d; track $index) {
          <path [attr.d]="d" [attr.fill-rule]="solidDef().evenOdd ? 'evenodd' : null" [attr.clip-rule]="solidDef().evenOdd ? 'evenodd' : null" />
        }
      </svg>
    } @else {
      <svg
        [class]="sizeClass()"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        [attr.stroke-width]="stroke()"
        aria-hidden="true"
      >
        @for (d of paths(); track $index) {
          <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="d" />
        }
      </svg>
    }
  `
})
export class IconComponent {
  readonly name = input.required<IconName | SolidIconName>();
  readonly size = input<IconSize>('md');
  readonly stroke = input(1.75);
  /** Draw a filled icon from icons.solid.ts instead of an outline icon. */
  readonly solid = input(false, { transform: booleanAttribute });

  protected readonly paths = computed<readonly string[]>(() => ICONS[this.name() as IconName] ?? []);
  protected readonly solidDef = computed<SolidIconDef>(
    () => (SOLID_ICONS as Record<string, SolidIconDef>)[this.name()] ?? { viewBox: '0 0 24 24', d: [] }
  );
  protected readonly sizeClass = computed(() => SIZE_CLASS[this.size()]);
}
