import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared';

/** "Active Schemes" page header with the search box and (for super admins) the Configure New EOI button. */
@Component({
  selector: 'app-schemes-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeaderComponent],
  host: { class: 'block' },
  template: `
    <!-- Themed Header Bar via Reusable PageHeaderComponent with Rajasthan Banner -->
    <app-page-header
      title="Active Schemes"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Active Schemes' }]"
      [searchable]="true"
      [searchQuery]="searchQuery()"
      (searchQueryChange)="searchChange.emit($event)"
      searchPlaceholder="Search schemes by name, reference no. or keyword..."
    >
      @if (isSuperAdmin()) {
        <button
          type="button"
          (click)="configureEoi.emit()"
          class="px-3.5 py-2 bg-navy hover:bg-navy-dark text-white text-xs font-semibold rounded-md shadow-2xs transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Configure New EOI</span>
        </button>
      }
    </app-page-header>
  `
})
export class SchemesHeaderComponent {
  readonly searchQuery = input('');
  readonly isSuperAdmin = input(false);

  readonly searchChange = output<string>();
  readonly configureEoi = output<void>();
}
