import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BackdropBlur = 'none' | 'sm' | 'lg';

/**
 * A full-screen dark layer behind a drawer or a loader. Dialogs do not need it: `app-modal` has
 * its own. Click it with `(click)`; give the host layout classes (flex, items-center) when it holds
 * content.
 *
 *   <app-backdrop z="z-40" class="md:hidden" (click)="closeDrawer()" />
 *   <app-backdrop z="z-100" blur="lg" tone="deep" class="flex items-center justify-center"> ... </app-backdrop>
 */
@Component({
  selector: 'app-backdrop',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()', '[attr.aria-hidden]': 'hasContent() ? null : "true"' },
  template: `<ng-content />`
})
export class BackdropComponent {
  /** Tailwind z-index class. */
  readonly z = input('z-40');
  readonly blur = input<BackdropBlur>('sm');
  /** `deep` is the darker navy used by full-screen loaders. */
  readonly tone = input<'dark' | 'deep'>('dark');
  /** Set when the backdrop holds content that screen readers should read. */
  readonly hasContent = input(false);

  protected readonly classes = computed(() => {
    const parts = ['fixed', 'inset-0', this.z(), 'transition-opacity'];
    parts.push(this.tone() === 'deep' ? 'bg-[rgba(11,23,42,0.55)]' : 'bg-slate-900/50');
    if (this.blur() === 'sm') parts.push('backdrop-blur-xs');
    if (this.blur() === 'lg') parts.push('backdrop-blur-md');
    return parts.join(' ');
  });
}
