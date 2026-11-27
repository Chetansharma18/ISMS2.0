import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The frame every normal page sits in: page background, padding and the vertical spacing between
 * its blocks (header, filters, table, cards). Use it instead of writing the wrapper divs by hand.
 *
 *   <app-page-shell>
 *     <app-page-header title="..." />
 *     <app-table ... />
 *   </app-page-shell>
 */
@Component({
  selector: 'app-page-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full min-h-full bg-background text-primary font-sans relative' },
  template: `
    <div class="relative z-10 p-4 sm:p-6 space-y-4 font-sans pb-10">
      <ng-content />
    </div>
    <div
      class="pointer-events-none fixed bottom-0 left-0 right-0 h-16 z-0"
      style="background: linear-gradient(to top, rgba(248, 237, 241, 0.55) 0%, rgba(252, 248, 250, 0.25) 55%, transparent 100%);"
      aria-hidden="true"
    ></div>
  `
})
export class PageShellComponent {}
