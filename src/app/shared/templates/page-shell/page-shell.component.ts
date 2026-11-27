import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The frame every normal page sits in: transparent over `.main-workspace` (so workspace waves show through),
 * with consistent padding and vertical spacing between its blocks (header, filters, table, cards).
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
  host: { class: 'block w-full min-h-full bg-transparent text-primary font-sans relative' },
  template: `
    <div class="relative z-10 p-4 sm:p-6 space-y-5 font-sans pb-12">
      <ng-content />
    </div>
  `
})
export class PageShellComponent {}
