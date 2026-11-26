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
      class="mb-4 bg-white px-4 py-3.5 rounded-[10px] border border-[#EADCE2] shadow-2xs text-xs font-sans relative z-20"
    >
      <div class="flex flex-wrap items-end gap-3 w-full">
        <!-- Search Input with Search Icon & Clear Button -->
        @if (showSearch()) {
          <div
            class="flex flex-col gap-1 w-full min-w-0"
            [ngClass]="hasOtherFilters() ? 'sm:flex-1 sm:min-w-[220px]' : 'flex-1'"
          >
            <label class="text-[11px] font-semibold text-slate-500 tracking-wide select-none">Search</label>
            <div class="relative w-full">
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
                class="w-full pl-9 pr-8 text-[13px] font-normal"
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
          </div>
        }

        <!-- Status Filter Dropdown (Unified Design) -->
        @if (showStatusFilter()) {
          <div class="flex flex-col gap-1 shrink-0 min-w-[140px] sm:w-[155px]">
            <label class="text-[11px] font-semibold text-slate-500 tracking-wide select-none">Status</label>
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

        <!-- Dynamic Master Filters (e.g. Sector, Scheme, Category, Role dropdowns & Date filters) -->
        @for (filter of filters(); track filter.key) {
          @if (filter.type === 'date') {
            <div class="flex flex-col gap-1 shrink-0 w-[148px]">
              <label class="text-[11px] font-semibold text-slate-500 tracking-wide select-none">{{ filter.label }}</label>
              <input
                appInput
                [size]="inputSize()"
                type="date"
                [attr.aria-label]="filter.label"
                [title]="filter.placeholder || filter.label"
                [ngModel]="filterValues()[filter.key] || ''"
                (ngModelChange)="setFilterValue(filter.key, $event)"
                class="w-full text-[12.5px]"
              />
            </div>
          } @else {
            <div class="flex flex-col gap-1 shrink-0 min-w-[165px] max-w-[240px]">
              <label class="text-[11px] font-semibold text-slate-500 tracking-wide select-none">{{ filter.label }}</label>
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
            class="shrink-0 self-end"
          >
            <app-icon name="close" size="xs" />
            <span>Reset</span>
          </button>
        }
      </div>
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

  readonly hasOtherFilters = computed<boolean>(() => {
    return this.showStatusFilter() || (this.filters() && this.filters().length > 0);
  });

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
      label: opt.label === 'All' ? 'All Status' : opt.label
    }));
  });

  readonly filters = input<MasterFilterConfig[]>([]);
  readonly filterValues = model<Record<string, string>>({});

  readonly totalCount = input<number>(0);
  readonly filteredCount = input<number>(0);
  readonly itemUnit = input<string>('entries');
  readonly showCount = input<boolean>(false);

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
