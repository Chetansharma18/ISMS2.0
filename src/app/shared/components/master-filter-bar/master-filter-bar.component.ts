import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { InputDirective } from '../form-controls/input/input.directive';
import { MasterFilterConfig } from '../master-crud/master-crud.types';

export interface StatusFilterOption {
  value: string;
  label: string;
  count?: number;
}

@Component({
  selector: 'app-master-filter-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent, InputDirective],
  template: `
    <div
      class="mb-3.5 bg-white p-2.5 sm:p-3 rounded-[10px] border border-[#EADCE2] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs font-sans"
    >
      <div class="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
        <!-- Search Input with Search Icon & Clear Button -->
        @if (showSearch()) {
          <div class="relative w-full sm:w-64 min-w-[200px]">
            <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <app-icon name="search" size="xs" />
            </span>
            <input
              appInput
              size="sm"
              type="text"
              [placeholder]="searchPlaceholder()"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              class="w-full pl-8 pr-7 text-xs font-medium"
            />
            @if (searchQuery()) {
              <button
                appButton
                variant="ghost"
                size="xs"
                iconOnly
                type="button"
                (click)="searchQuery.set('')"
                class="absolute inset-y-0 right-0 pr-1.5 flex items-center shrink-0"
                title="Clear search"
                aria-label="Clear search"
              >
                <app-icon name="close" size="xs" />
              </button>
            }
          </div>
        }

        <!-- Status Filter Tabs / Pills -->
        @if (showStatusFilter() && statusOptions().length > 0) {
          <div class="inline-flex items-center gap-1 shrink-0">
            @for (opt of statusOptions(); track opt.value) {
              <button
                appButton
                [variant]="status() === opt.value ? 'primary' : 'outline'"
                size="sm"
                type="button"
                (click)="status.set(opt.value)"
              >
                <span>{{ opt.label }}</span>
                @if (opt.count !== undefined) {
                  <span
                    class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] tabular-nums"
                    [class.bg-white/20]="status() === opt.value"
                    [class.text-white]="status() === opt.value"
                    [class.bg-slate-100]="status() !== opt.value"
                    [class.text-slate-600]="status() !== opt.value"
                  >{{ opt.count }}</span>
                }
              </button>
            }
          </div>
        }

        <!-- Dynamic Master Filters (e.g. Sector, Scheme, Category, Role dropdowns) -->
        @for (filter of filters(); track filter.key) {
          <div class="inline-flex items-center gap-1.5 shrink-0">
            <select
              appInput
              size="sm"
              [ngModel]="filterValues()[filter.key] || ''"
              (ngModelChange)="setFilterValue(filter.key, $event)"
              class="text-xs font-medium min-w-[160px] max-w-[280px]"
            >
              <option value="">{{ filter.placeholder || 'All ' + filter.label }}</option>
              @for (opt of resolveFilterOptions(filter); track opt) {
                <option [value]="opt">{{ opt }}</option>
              }
            </select>
          </div>
        }

        <!-- Extra projected filters slot (e.g. custom inputs) -->
        <ng-content></ng-content>

        <!-- One-click Reset Filters Button -->
        @if (isFilterActive()) {
          <button
            appButton
            variant="ghost"
            size="sm"
            type="button"
            (click)="onReset()"
            title="Reset all filters"
            class="shrink-0"
          >
            <app-icon name="close" size="xs" />
            <span>Reset</span>
          </button>
        }
      </div>

      <!-- Count Summary Badge -->
      @if (showCount()) {
        <div class="text-[12px] font-medium text-slate-500 whitespace-nowrap md:ml-auto shrink-0 self-center">
          Showing <strong class="text-slate-700 font-bold tabular-nums">{{ filteredCount() }}</strong>
          @if (totalCount() > 0) {
            of <span class="tabular-nums font-semibold">{{ totalCount() }}</span>
          }
          {{ itemUnit() }}
        </div>
      }
    </div>
  `
})
export class MasterFilterBarComponent {
  readonly showSearch = input<boolean>(true);
  readonly searchQuery = model<string>('');
  readonly searchPlaceholder = input<string>('Search records...');

  readonly status = model<string>('ALL');
  readonly showStatusFilter = input<boolean>(true);
  readonly statusOptions = input<StatusFilterOption[]>([]);

  readonly filters = input<MasterFilterConfig[]>([]);
  readonly filterValues = model<Record<string, string>>({});

  readonly totalCount = input<number>(0);
  readonly filteredCount = input<number>(0);
  readonly itemUnit = input<string>('entries');
  readonly showCount = input<boolean>(true);

  readonly resetFilters = output<void>();

  readonly isFilterActive = computed(() => {
    if (this.searchQuery().trim()) return true;
    if (this.showStatusFilter() && this.status() !== 'ALL') return true;
    const fv = this.filterValues();
    return Object.values(fv).some(v => !!v);
  });

  resolveFilterOptions(filter: MasterFilterConfig): string[] {
    if (!filter.options) return [];
    return typeof filter.options === 'function' ? filter.options() : filter.options;
  }

  setFilterValue(key: string, val: string): void {
    this.filterValues.update(prev => ({ ...prev, [key]: val }));
  }

  onReset(): void {
    this.searchQuery.set('');
    this.status.set('ALL');
    this.filterValues.set({});
    this.resetFilters.emit();
  }
}
