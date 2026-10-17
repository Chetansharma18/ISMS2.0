import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, PageHeaderComponent } from '../../../shared';

/** "Active Schemes" page header with the search box and (for super admins) the Configure New EOI button. */
@Component({
  selector: 'app-schemes-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeaderComponent, ButtonComponent, IconComponent],
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
        <button appButton size="sm" type="button" (click)="configureEoi.emit()" class="shrink-0">
          <app-icon name="plus" size="sm" />
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
