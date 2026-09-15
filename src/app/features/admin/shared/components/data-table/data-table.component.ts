import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

export interface ColumnDef {
  key: string;
  header: string;
  type?: 'text' | 'date' | 'currency' | 'badge' | 'custom';
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'admin-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      <!-- Table Search & Action Bar -->
      <div *ngIf="showSearch || showExport" class="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div class="relative w-full sm:w-80" *ngIf="showSearch">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchChange()"
            [placeholder]="searchPlaceholder"
            class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all" />
          <button 
            *ngIf="searchQuery" 
            (click)="clearSearch()"
            class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ng-content select="[table-filters]"></ng-content>
          <button 
            *ngIf="showExport" 
            (click)="exportClick.emit()"
            class="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[16px] text-slate-500">download</span>
            Export
          </button>
        </div>
      </div>

      <!-- Table Scrollable Area -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th *ngFor="let col of columns" class="px-4 py-3.5" [style.width]="col.width">
                <div class="flex items-center gap-1.5" [class.cursor-pointer]="col.sortable" (click)="sort(col.key)">
                  <span>{{ col.header }}</span>
                  <span *ngIf="col.sortable" class="material-symbols-outlined text-[14px] text-slate-400" [class.text-blue-600]="sortKey === col.key">
                    {{ sortKey === col.key ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>
              <th *ngIf="hasActions" class="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let item of paginatedData(); let i = index" class="hover:bg-slate-50/80 transition-colors group">
              <td *ngFor="let col of columns" class="px-4 py-3 align-middle">
                <!-- Badge -->
                <ng-container *ngIf="col.type === 'badge'">
                  <admin-status-badge [status]="item[col.key]"></admin-status-badge>
                </ng-container>

                <!-- Currency -->
                <ng-container *ngIf="col.type === 'currency'">
                  <span class="font-semibold text-slate-900">₹{{ item[col.key] | number:'1.0-0' }}</span>
                </ng-container>

                <!-- Date -->
                <ng-container *ngIf="col.type === 'date'">
                  <span class="text-slate-700 font-medium">{{ item[col.key] }}</span>
                </ng-container>

                <!-- Text / Default -->
                <ng-container *ngIf="!col.type || col.type === 'text'">
                  <span class="text-slate-800">{{ item[col.key] }}</span>
                </ng-container>
              </td>

              <!-- Actions Slot -->
              <td *ngIf="hasActions" class="px-4 py-3 text-right align-middle whitespace-nowrap">
                <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: item, index: i }"></ng-container>
              </td>
            </tr>

            <!-- Empty Row -->
            <tr *ngIf="filteredData.length === 0">
              <td [attr.colspan]="columns.length + (hasActions ? 1 : 0)" class="py-12 text-center text-slate-400">
                <span class="material-symbols-outlined text-[36px] block mb-1 text-slate-300">search_off</span>
                <p class="font-medium text-xs text-slate-500">No records found matching current criteria.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div *ngIf="filteredData.length > 0" class="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing 
          <span class="font-bold text-slate-800">{{ (currentPage - 1) * pageSize + 1 }}</span>
          to 
          <span class="font-bold text-slate-800">{{ Math.min(currentPage * pageSize, filteredData.length) }}</span>
          of 
          <span class="font-bold text-slate-800">{{ filteredData.length }}</span> records
        </div>

        <div class="flex items-center gap-1.5">
          <button 
            [disabled]="currentPage === 1"
            (click)="currentPage = currentPage - 1"
            class="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer">
            Previous
          </button>
          <span class="px-2 font-semibold text-slate-700">Page {{ currentPage }} of {{ totalPages() }}</span>
          <button 
            [disabled]="currentPage >= totalPages()"
            (click)="currentPage = currentPage + 1"
            class="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer">
            Next
          </button>
        </div>
      </div>
    </div>
  `
})
export class DataTableComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() data: any[] = [];
  @Input() hasActions: boolean = true;
  @Input() actionsTemplate: any;
  @Input() showSearch: boolean = true;
  @Input() showExport: boolean = true;
  @Input() searchPlaceholder: string = 'Search records...';
  @Input() pageSize: number = 10;
  @Output() exportClick = new EventEmitter<void>();

  Math = Math;
  searchQuery: string = '';
  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;

  get filteredData(): any[] {
    let result = [...(this.data || [])];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(val => 
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    if (this.sortKey) {
      result.sort((a, b) => {
        const valA = a[this.sortKey];
        const valB = b[this.sortKey];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        return this.sortDirection === 'asc' ? comp : -comp;
      });
    }

    return result;
  }

  paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize) || 1;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
  }

  sort(key: string): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }
}
