import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { BadgeVariant, TableColumn } from '../table/table.types';

export interface DetailViewItem {
  label: string;
  value?: any;
  type?: 'text' | 'badge' | 'status' | 'tags' | 'link' | 'currency' | 'date';
  colSpan?: 1 | 2;
  badgeVariant?: string;
  linkUrl?: string;
}

/**
 * Standard enterprise detail-view card / screen component.
 * Displays key-value data in a consistent, responsive 2-column grid
 * (1 column on mobile, 2 columns on tablet/desktop) with standard typography,
 * muted uppercase labels, semibold dark values, and em-dash fallbacks for missing data.
 */
@Component({
  selector: 'app-detail-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div
      class="w-full bg-white font-sans"
      [class.rounded-xl]="bordered()"
      [class.border]="bordered()"
      [class.border-slate-200/90]="bordered()"
      [class.shadow-2xs]="bordered()"
      [class.p-5]="bordered()"
      [class.sm:p-6]="bordered()"
    >
      <!-- Optional Title & Subtitle Header -->
      @if (title()) {
        <div class="border-b border-slate-200/80 pb-4 mb-5">
          <h2 class="m-0 text-lg sm:text-xl font-bold text-[#7C0E44] tracking-tight">
            {{ title() }}
          </h2>
          @if (subtitle()) {
            <p class="m-0 mt-1 text-xs text-slate-500 font-normal leading-relaxed">
              {{ subtitle() }}
            </p>
          }
        </div>
      }

      <!-- Responsive Key-Value Grid -->
      <div
        class="grid gap-x-6 gap-y-4"
        [class.grid-cols-1]="columnsCount() === 1"
        [class.sm:grid-cols-2]="columnsCount() === 2"
      >
        @for (item of computedItems(); track item.label) {
          <div
            class="flex flex-col min-w-0"
            [class.sm:col-span-2]="item.colSpan === 2"
          >
            <!-- Label -->
            <span class="text-[12px] font-medium uppercase tracking-wider text-slate-500 select-none mb-1">
              {{ item.label }}
            </span>

            <!-- Value Presentation -->
            <div class="min-w-0">
              @if (isEmpty(item.value)) {
                <span class="text-[14px] text-slate-400 font-normal select-none">—</span>
              } @else if (item.type === 'status' || item.type === 'badge') {
                <app-status-badge [variant]="resolveBadgeVariant(item.value, item.badgeVariant)">
                  {{ item.value }}
                </app-status-badge>
              } @else if (item.type === 'tags' && isArray(item.value)) {
                <div class="flex flex-wrap gap-1.5 mt-0.5">
                  @for (tag of item.value; track tag) {
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {{ tag }}
                    </span>
                  }
                </div>
              } @else if (item.type === 'link' && item.linkUrl) {
                <a
                  [href]="item.linkUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[14px] font-semibold text-[#7C0E44] hover:underline break-words"
                >
                  {{ item.value }}
                </a>
              } @else {
                <span class="text-[14px] font-semibold text-slate-800 break-words leading-relaxed">
                  {{ item.value }}
                </span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Optional Projected Slot for Extra Actions/Content -->
      <div class="empty:hidden mt-5 pt-4 border-t border-slate-100">
        <ng-content />
      </div>
    </div>
  `
})
export class DetailViewComponent {
  readonly title = input('');
  readonly subtitle = input('');
  readonly bordered = input(true);
  readonly columnsCount = input<1 | 2>(2);

  /** Direct list of detail items */
  readonly items = input<DetailViewItem[]>([]);

  /** Alternatively, pass data object and column definitions */
  readonly data = input<Record<string, any> | null>(null);
  readonly columns = input<TableColumn<any>[]>([]);

  /** Resolves items either from items input or from data + columns */
  protected readonly computedItems = computed<DetailViewItem[]>(() => {
    const directItems = this.items();
    if (directItems && directItems.length > 0) {
      return directItems;
    }

    const dataObj = this.data();
    const cols = this.columns();
    if (dataObj && cols && cols.length > 0) {
      return cols.map((col, idx) => {
        const rawVal = col.key ? dataObj[col.key] : undefined;
        const formatted = col.format ? (col.format as any)(rawVal, dataObj, idx) : rawVal;
        return {
          label: col.label,
          value: formatted,
          type: col.type === 'badge' ? 'status' : 'text'
        };
      });
    }

    return [];
  });

  protected isEmpty(val: any): boolean {
    return val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0);
  }

  protected isArray(val: any): boolean {
    return Array.isArray(val);
  }

  protected resolveBadgeVariant(val: any, override?: string): BadgeVariant {
    if (override) return override as BadgeVariant;
    const str = String(val || '').toLowerCase();
    if (str.includes('active') || str.includes('approve') || str.includes('eligible') || str.includes('pass')) {
      return 'success';
    }
    if (str.includes('reject') || str.includes('inactive') || str.includes('debar') || str.includes('fail') || str.includes('blacklist')) {
      return 'danger';
    }
    if (str.includes('pend') || str.includes('warn')) {
      return 'warning';
    }
    if (str.includes('submit')) {
      return 'submitted';
    }
    return 'neutral';
  }
}
