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
  host: { class: 'block w-full min-h-full bg-background text-primary font-sans' },
  template: `
    <div class="p-4 sm:p-5 space-y-3 font-sans">
      <ng-content />
    </div>
  `
})
export class PageShellComponent {}
