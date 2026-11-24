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
import { DropdownComponent, DropdownOption } from '../dropdown/dropdown.component';
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
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent, InputDirective, DropdownComponent],
  template: `
    <div
      class="mb-4 bg-white p-3 sm:p-4 rounded-[10px] border border-[#EADCE2] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs font-sans relative z-20"
    >
      <div class="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
        <!-- Search Input with Search Icon & Clear Button -->
        @if (showSearch()) {
          <div class="relative w-full sm:w-72 md:w-80 min-w-[220px]">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <app-icon name="search" size="sm" />
            </span>
            <input
              appInput
              [size]="inputSize()"
              type="text"
              [placeholder]="searchPlaceholder()"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              class="w-full pl-9 pr-8 text-[13px] font-medium"
            />
            @if (searchQuery()) {
              <button
                appButton
                variant="ghost"
                size="xs"
                iconOnly
                type="button"
                (click)="searchQuery.set('')"
                class="absolute inset-y-0 right-0 pr-2 flex items-center shrink-0"
                title="Clear search"
                aria-label="Clear search"
              >
                <app-icon name="close" size="xs" />
              </button>
            }
          </div>
        }

        <!-- Status Filter Dropdown (Unified Design) -->
        @if (showStatusFilter()) {
          <div class="inline-flex items-center gap-1.5 shrink-0 min-w-[150px] max-w-[240px]">
            <app-dropdown
              class="w-full"
              [size]="inputSize()"
              [options]="statusDropdownOptions()"
              [value]="status()"
              (valueChange)="status.set($event)"
              placeholder="All Status"
            />
          </div>
        }

        <!-- Dynamic Master Filters (e.g. Sector, Scheme, Category, Role dropdowns) -->
        @for (filter of filters(); track filter.key) {
          <div class="inline-flex items-center gap-1.5 shrink-0 min-w-[170px] max-w-[300px]">
            <app-dropdown
              class="w-full"
              [size]="inputSize()"
              [options]="resolveDropdownFilterOptions(filter)"
              [value]="filterValues()[filter.key] || ''"
              (valueChange)="setFilterValue(filter.key, $event)"
              [placeholder]="filter.placeholder || 'All ' + filter.label"
            />
          </div>
        }

        <!-- Extra projected filters slot (e.g. custom inputs) -->
        <ng-content></ng-content>

        <!-- One-click Reset Filters Button -->
        @if (isFilterActive()) {
          <button
            appButton
            variant="ghost"
            [size]="inputSize()"
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
        <div class="text-[12.5px] font-medium text-slate-500 whitespace-nowrap lg:ml-auto shrink-0 self-center">
          Showing <strong class="text-slate-800 font-bold tabular-nums">{{ filteredCount() }}</strong>
          @if (totalCount() > 0) {
            of <span class="tabular-nums font-semibold text-slate-600">{{ totalCount() }}</span>
          }
          {{ itemUnit() }}
        </div>
      }
    </div>
  `
})
export class MasterFilterBarComponent {
  readonly inputSize = input<'sm' | 'md'>('md');
  readonly showSearch = input<boolean>(true);
  readonly searchQuery = model<string>('');
  readonly searchPlaceholder = input<string>('Search records...');

  readonly status = model<string>('ALL');
  readonly showStatusFilter = input<boolean>(true);
  readonly statusOptions = input<StatusFilterOption[]>([]);

  readonly resolvedStatusOptions = computed<StatusFilterOption[]>(() => {
    const opts = this.statusOptions();
    if (opts && opts.length > 0) {
      return opts;
    }
    return [
      { value: 'ALL', label: 'All Status' },
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' }
    ];
  });

  readonly statusDropdownOptions = computed<DropdownOption[]>(() => {
    return this.resolvedStatusOptions().map(opt => ({
      value: opt.value,
      label: opt.count !== undefined ? `${opt.label === 'All' ? 'All Status' : opt.label} (${opt.count})` : (opt.label === 'All' ? 'All Status' : opt.label)
    }));
  });

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

  resolveDropdownFilterOptions(filter: MasterFilterConfig): DropdownOption[] {
    const raw = this.resolveFilterOptions(filter);
    const options: DropdownOption[] = [{ value: '', label: filter.placeholder || 'All ' + filter.label }];
    for (const opt of raw) {
      options.push({ value: opt, label: opt });
    }
    return options;
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
