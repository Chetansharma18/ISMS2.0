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
import { TableColumn, TableAction, BadgeVariant } from './table.types';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="card overflow-hidden font-sans">
      
      <!-- Optional Search & Toolbar -->
      @if (searchable) {
        <div class="p-3 bg-surface border-b border-theme flex items-center justify-between gap-3">
          <div class="relative w-full max-w-xs">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              [placeholder]="searchPlaceholder"
              class="form-control pl-9 text-[13px]"
            />
          </div>
          <div class="flex items-center gap-2">
            <ng-content select="[table-actions]"></ng-content>
          </div>
        </div>
      }

      <!-- Main Responsive Table Container -->
      <div class="overflow-x-auto">
        <table class="table w-full text-left border-collapse text-[13px]">
          <!-- Themed Table Header -->
          <thead>
            <tr class="bg-primary-light text-primary text-[13px] font-semibold select-none border-b border-theme">
              @for (col of columns; track col.key; let last = $last) {
                <th
                  class="h-11 px-3.5 select-none"
                  [ngClass]="[
                    col.width || '',
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                    !last ? 'border-r border-theme/70' : '',
                    col.headerClass || ''
                  ]"
                >
                  <div
                    class="inline-flex items-center gap-1.5"
                    [class.cursor-pointer]="col.sortable"
                    (click)="col.sortable && toggleSort(col.key)"
                  >
                    <span>{{ col.label }}</span>
                    @if (col.sortable && sortKey() === col.key) {
                      <span class="text-[11px] text-brand">
                        {{ sortAsc() ? '▲' : '▼' }}
                      </span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-border bg-surface font-normal text-primary">
            @if (loading) {
              <tr>
                <td [attr.colspan]="columns.length" class="py-12 text-center text-secondary">
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
                  class="h-11.5 hover:bg-primary-light transition-colors"
                  [ngClass]="rowClass ? rowClass(item, idx) : ''"
                  (click)="rowClick.emit(item)"
                >
                  @for (col of columns; track col.key; let last = $last) {
                    <td
                      class="px-3.5 text-[13px]"
                      [ngClass]="[
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                        !last ? 'border-r border-theme/50' : '',
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
                      } @else if (col.type === 'number' && col.key === '$index') {
                        <!-- 3. Auto Sequential S. No. -->
                        <span class="font-medium text-text-secondary">{{ (currentPage() - 1) * pageSize + idx + 1 }}</span>
                      } @else {
                        <!-- 4. Default Text Output -->
                        <span>{{ getFormattedValue(item, col, idx) }}</span>
                      }
                    </td>
                  }
                </tr>
              } @empty {
                <tr>
                  <td [attr.colspan]="columns.length" class="py-12 text-center text-text-secondary">
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
        <div class="px-4 py-2.5 bg-background border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-secondary select-none font-sans">
          <span>
            Showing <strong class="text-primary font-semibold">{{ (currentPage() - 1) * pageSize + 1 }}</strong> to <strong class="text-primary font-semibold">{{ Math.min(currentPage() * pageSize, filteredData().length) }}</strong> of <strong class="text-primary font-semibold">{{ filteredData().length }}</strong> {{ itemUnit }}
          </span>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              (click)="setPage(currentPage() - 1)"
              [disabled]="currentPage() === 1"
              class="h-7.5 px-2.5 rounded-sm border border-theme bg-surface text-[12px] font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none hover:bg-primary-light cursor-pointer"
            >
              Previous
            </button>

            @for (p of totalPagesArray(); track p) {
              <button
                type="button"
                (click)="setPage(p)"
                class="min-w-7.5 h-7.5 px-1.5 rounded-sm flex items-center justify-center text-[12px] font-medium transition-colors cursor-pointer border"
                [class.bg-primary]="currentPage() === p"
                [class.text-white]="currentPage() === p"
                [class.border-primary]="currentPage() === p"
                [class.bg-surface]="currentPage() !== p"
                [class.text-primary]="currentPage() !== p"
                [class.border-theme]="currentPage() !== p"
                [class.hover:bg-primary-light]="currentPage() !== p"
              >
                {{ p }}
              </button>
            }

            <button
              type="button"
              (click)="setPage(currentPage() + 1)"
              [disabled]="currentPage() === totalPages()"
              class="h-7.5 px-2.5 rounded-sm border border-theme bg-surface text-[12px] font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none hover:bg-primary-light cursor-pointer"
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
}
