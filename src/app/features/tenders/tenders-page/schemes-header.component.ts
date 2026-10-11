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
    >
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
        <!-- Integrated Search Bar (Matching User Screenshot) -->
        <div class="w-full sm:w-auto min-w-0 sm:min-w-75 md:min-w-100">
          <div class="relative flex items-center bg-white rounded-lg border border-slate-300 shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchChange.emit($event)"
              placeholder="Search schemes by name, reference no. or keyword..."
              class="w-full px-3.5 py-2 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            <button
              type="button"
              class="px-3.5 py-2.5 bg-navy hover:bg-navy-dark text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Search"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        @if (isSuperAdmin()) {
          <button
            type="button"
            (click)="configureEoi.emit()"
            class="px-4 py-2.5 bg-primary hover:bg-navy text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Configure New EOI</span>
          </button>
        }
      </div>
    </app-page-header>
  `
})
export class SchemesHeaderComponent {
  readonly searchQuery = input('');
  readonly isSuperAdmin = input(false);

  readonly searchChange = output<string>();
  readonly configureEoi = output<void>();
}
