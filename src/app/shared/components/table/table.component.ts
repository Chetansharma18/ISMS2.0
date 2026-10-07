import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableColumn, TableAction, BadgeVariant } from './table.types';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="bg-white border border-slate-200 rounded-lg overflow-hidden font-sans" style="box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
      
      <!-- Optional Search & Toolbar -->
      @if (searchable) {
        <div class="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="relative w-full sm:max-w-xs">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              [placeholder]="searchPlaceholder"
              class="form-control pl-9 text-[13px] bg-white w-full"
            />
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <ng-content select="[table-actions]"></ng-content>
          </div>
        </div>
      }

      <!-- Main Responsive Table Container -->
      <div class="overflow-x-auto bg-white">
        <table class="table w-full text-left border-collapse text-[13px] bg-white">
          <!-- Themed Table Header -->
          <thead>
            <tr class="bg-gray-50 text-slate-700 text-[13px] font-semibold select-none border-b border-slate-200">
              @for (col of columns; track col.key; let last = $last) {
                <th
                  class="h-11 px-3.5 select-none whitespace-nowrap"
                  [ngClass]="[
                    col.width || '',
                    (col.headerAlign || col.align) === 'center' ? 'text-center' : (col.headerAlign || col.align) === 'right' ? 'text-right' : 'text-left',
                    !last ? 'border-r border-slate-200' : '',
                    col.headerClass || ''
                  ]"
                >
                  <div
                    class="flex items-center gap-1.5 w-full"
                    [class.justify-center]="(col.headerAlign || col.align) === 'center'"
                    [class.text-center]="(col.headerAlign || col.align) === 'center'"
                    [class.justify-end]="(col.headerAlign || col.align) === 'right'"
                    [class.text-right]="(col.headerAlign || col.align) === 'right'"
                    [class.cursor-pointer]="col.sortable"
                    (click)="col.sortable && toggleSort(col.key)"
                  >
                    <span [class.text-center]="(col.headerAlign || col.align) === 'center'" class="inline-block">{{ col.label }}</span>
                    @if (col.sortable && sortKey() === col.key) {
                      <span class="text-[11px] text-brand shrink-0">
                        {{ sortAsc() ? '▲' : '▼' }}
                      </span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>

          <!-- Table Body (Pure White background, gray hover) -->
          <tbody class="divide-y divide-gray-100 bg-white font-normal text-slate-800">
            @if (loading) {
              <tr class="bg-white">
                <td [attr.colspan]="columns.length" class="py-12 text-center text-secondary bg-white">
                  <div class="inline-flex items-center gap-2 text-[13px] font-normal">
                    <svg class="animate-spin h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Loading records...</span>
                  </div>
                </td>
              </tr>
            } @else {
              @for (item of paginatedData(); track getTrackBy(item, $index); let idx = $index) {
                <tr
                  class="h-11 bg-white transition-colors duration-100 hover:bg-gray-50"
                  [ngClass]="rowClass ? rowClass(item, idx) : ''"
                  (click)="rowClick.emit(item)"
                >
                  @for (col of columns; track col.key; let last = $last) {
                    <td
                      class="px-3.5 text-[13px]"
                      [ngClass]="[
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                        !last ? 'border-r border-slate-200' : '',
                        getCellClass(col, item)
                      ]"
                    >
                      <!-- 1. Custom Template override (via customTemplates input or col.template) -->
                      @if (col.template || customTemplates[col.key]) {
                        <ng-container
                          *ngTemplateOutlet="col.template || customTemplates[col.key]; context: { $implicit: item, column: col, index: (currentPage() - 1) * pageSize + idx }"
                        ></ng-container>
                      } @else if (col.type === 'status' || col.type === 'badge') {
                        <!-- 2. Status Badge -->
                        <app-status-badge [variant]="getBadgeVariant(getRawValue(item, col.key), col)">
                          {{ getFormattedValue(item, col, idx) }}
                        </app-status-badge>
                      } @else if (col.key === '$index' || (col.type === 'number' && (col.key === '$index' || col.key === 'sNo' || col.key === 'sno'))) {
                        <!-- 3. Auto Sequential S. No. -->
                        <span class="font-medium text-slate-700 whitespace-nowrap">{{ (currentPage() - 1) * pageSize + idx + 1 }}</span>
                      } @else if (col.type === 'link') {
                        <!-- 4. Direct Reusable Link -->
                        @if (col.link) {
                          <a
                            [routerLink]="getColLink(col, item)"
                            class="text-[#174A6E] hover:text-[#0B3558] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{{ getFormattedValue(item, col, idx) }}</span>
                            <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        } @else {
                          <button
                            type="button"
                            (click)="onLinkClick(col, item, $event)"
                            class="text-[#174A6E] hover:text-[#0B3558] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer transition-colors text-left"
                          >
                            <span>{{ getFormattedValue(item, col, idx) }}</span>
                            <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        }
                      } @else if (col.type === 'action' && col.actions && col.actions.length > 0) {
                        <!-- 5. Direct Action Buttons -->
                        <div
                          class="flex items-center gap-1.5 flex-wrap"
                          [class.justify-center]="(col.headerAlign || col.align) === 'center'"
                          [class.justify-end]="(col.headerAlign || col.align) === 'right'"
                        >
                          @for (act of col.actions; track act.id) {
                            @if (!act.visible || act.visible(item)) {
                              <button
                                type="button"
                                (click)="handleAction(act, item, $event)"
                                [title]="act.title || act.label"
                                [ngClass]="getActionBtnClass(act)"
                              >
                                @switch (act.icon) {
                                  @case ('view') {
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  }
                                  @case ('pdf') {
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  }
                                  @case ('edit') {
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  }
                                  @case ('delete') {
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  }
                                }
                                <span>{{ act.label }}</span>
                              </button>
                            }
                          }
                        </div>
                      } @else {
                        <!-- 6. Default Text Output -->
                        <span>{{ getFormattedValue(item, col, idx) }}</span>
                      }
                    </td>
                  }
                </tr>
              } @empty {
                <tr class="bg-white">
                  <td [attr.colspan]="columns.length" class="py-12 text-center text-text-secondary bg-white">
                    <div class="max-w-sm mx-auto text-center space-y-2">
                      <svg class="w-9 h-9 text-text-muted/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p class="text-[14px] font-medium text-text-primary">{{ emptyMessage }}</p>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Table Pagination Bar -->
      @if (pagination && filteredData().length > 0) {
        <div class="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-slate-600 select-none font-sans">
          <span>
            Showing <strong class="text-slate-800 font-semibold">{{ (currentPage() - 1) * pageSize + 1 }}</strong> to <strong class="text-slate-800 font-semibold">{{ Math.min(currentPage() * pageSize, filteredData().length) }}</strong> of <strong class="text-slate-800 font-semibold">{{ filteredData().length }}</strong> {{ itemUnit }}
          </span>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              (click)="setPage(currentPage() - 1)"
              [disabled]="currentPage() === 1"
              class="h-7.5 px-2.5 rounded-sm border border-slate-300 bg-white text-[12px] font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100 cursor-pointer"
            >
              Previous
            </button>

            @for (p of visiblePages(); track $index) {
              @if (p === '...') {
                <span class="min-w-7.5 h-7.5 px-1.5 flex items-center justify-center text-[12px] text-slate-400 select-none">...</span>
              } @else {
                <button
                  type="button"
                  (click)="setPage(+p)"
                  class="min-w-7.5 h-7.5 px-1.5 rounded-sm flex items-center justify-center text-[12px] font-medium transition-colors cursor-pointer border"
                  [class.bg-[#174A6E]]="currentPage() === p"
                  [class.text-white]="currentPage() === p"
                  [class.border-[#174A6E]]="currentPage() === p"
                  [class.bg-white]="currentPage() !== p"
                  [class.text-slate-700]="currentPage() !== p"
                  [class.border-slate-300]="currentPage() !== p"
                  [class.hover:bg-slate-100]="currentPage() !== p"
                >
                  {{ p }}
                </button>
              }
            }

            <button
              type="button"
              (click)="setPage(currentPage() + 1)"
              [disabled]="currentPage() === totalPages()"
              class="h-7.5 px-2.5 rounded-sm border border-slate-300 bg-white text-[12px] font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      }

    </div>
  `
})
export class TableComponent {
  readonly Math = Math;

  @Input({ required: true }) columns: TableColumn[] = [];

  // Use a setter to update an internal signal so computed properties re-evaluate when data changes
  private _dataSignal = signal<any[]>([]);
  @Input() set data(value: any[]) {
    this._dataSignal.set(value || []);
  }
  get data(): any[] {
    return this._dataSignal();
  }

  @Input() loading = false;
  @Input() searchable = false;
  @Input() searchPlaceholder = 'Search records...';
  @Input() searchFields: string[] = [];
  @Input() pagination = false;
  @Input() pageSize = 10;
  @Input() itemUnit = 'entries';
  @Input() emptyMessage = 'No records found';
  @Input() customTemplates: Record<string, TemplateRef<any>> = {};
  @Input() rowClass?: (row: any, index: number) => string;

  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() linkClick = new EventEmitter<{ column: TableColumn; row: any; event: MouseEvent }>();

  searchQuery = '';
  sortKey = signal<string | null>(null);
  sortAsc = signal<boolean>(true);
  currentPage = signal<number>(1);

  filteredData = computed(() => {
    let result = [...this._dataSignal()];

    // 1. Text Search Filter
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(item => {
        if (this.searchFields.length > 0) {
          return this.searchFields.some(field =>
            String(item[field] ?? '').toLowerCase().includes(query)
          );
        }
        return this.columns.some(col => {
          const val = this.getRawValue(item, col.key);
          return String(val ?? '').toLowerCase().includes(query);
        });
      });
    }

    // 2. Sorting
    const key = this.sortKey();
    if (key) {
      const asc = this.sortAsc();
      result.sort((a, b) => {
        const valA = this.getRawValue(a, key);
        const valB = this.getRawValue(b, key);

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return asc ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return asc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredData().length / this.pageSize));
  });

  totalPagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
      pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  paginatedData = computed(() => {
    if (!this.pagination) return this.filteredData();
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredData().slice(start, start + this.pageSize);
  });

  toggleSort(key: string): void {
    if (this.sortKey() === key) {
      if (this.sortAsc()) {
        this.sortAsc.set(false);
      } else {
        this.sortKey.set(null);
        this.sortAsc.set(true);
      }
    } else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getRawValue(item: any, key: string): any {
    if (!item || !key) return '';
    if (key.includes('.')) {
      return key.split('.').reduce((acc, part) => acc?.[part], item);
    }
    return item[key];
  }

  getFormattedValue(item: any, col: TableColumn, index: number): string {
    const raw = this.getRawValue(item, col.key);
    if (col.format) {
      return col.format(raw, item, index);
    }
    if (raw == null || raw === '') {
      return '-';
    }
    return String(raw);
  }

  getBadgeVariant(value: any, col: TableColumn): BadgeVariant {
    if (col.badgeVariantMap && value != null) {
      const mapped = col.badgeVariantMap[String(value)];
      if (mapped) return mapped;
    }

    const val = String(value || '').toLowerCase();
    if (val.includes('open') || val.includes('active') || val.includes('approved') || val.includes('accepted')) {
      return 'success';
    }
    if (val.includes('pending') || val.includes('review') || val.includes('evaluation')) {
      return 'warning';
    }
    if (val.includes('reject') || val.includes('cancel') || val.includes('inactive')) {
      return 'danger';
    }
    if (val.includes('close') || val.includes('archive')) {
      return 'neutral';
    }
    return 'info';
  }

  getCellClass(col: TableColumn, item: any): string {
    if (typeof col.cellClass === 'function') {
      return col.cellClass(this.getRawValue(item, col.key), item);
    }
    return col.cellClass || '';
  }

  getTrackBy(item: any, index: number): any {
    return item?.id ?? item?.referenceNo ?? item?.eoiRefNo ?? index;
  }

  onLinkClick(col: TableColumn, item: any, event: MouseEvent): void {
    event.stopPropagation();
    this.linkClick.emit({ column: col, row: item, event });
  }

  getColLink(col: TableColumn, item: any): string | any[] {
    if (typeof col.link === 'function') {
      return col.link(item);
    }
    return [];
  }

  handleAction(act: TableAction, item: any, event: MouseEvent): void {
    event.stopPropagation();
    if (act.action) {
      act.action(item);
    }
    this.actionClick.emit({ action: act.id, row: item });
  }

  getActionBtnClass(act: TableAction): string {
    const base = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors shadow-2xs ';
    switch (act.variant) {
      case 'primary':
      case 'pdf-view':
        return base + 'bg-[#0B3558] hover:bg-[#07233B] text-white';
      case 'secondary':
        return base + 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300';
      case 'outline':
        return base + 'border border-[#174A6E] text-[#174A6E] hover:bg-[#EAF2F6]';
      case 'danger':
        return base + 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200';
      case 'ghost':
        return 'p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors';
      default:
        return base + 'bg-[#0B3558] hover:bg-[#07233B] text-white';
    }
  }
}
