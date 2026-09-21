import { Component, Input, ContentChild, TemplateRef, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  isCheckbox?: boolean;
}

@Component({
  selector: 'app-ui-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      <!-- Table Header & Search (Optional) -->
      <div *ngIf="title || showSearch" class="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
        <h3 class="font-bold text-[#131A4D] text-lg">{{ title }}</h3>
        <div *ngIf="showSearch" class="relative">
          <svg class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search..." 
            (input)="onSearch($event)"
            class="pl-9 pr-4 py-1.5 border border-slate-300 rounded-full text-sm focus:outline-none focus:border-[#131A4D] focus:ring-1 focus:ring-[#131A4D]"
          >
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th 
                *ngFor="let col of columns" 
                class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                [ngClass]="{
                  'text-center': col.align === 'center',
                  'text-right': col.align === 'right',
                  'text-left': !col.align || col.align === 'left'
                }"
                [style.width]="col.width || 'auto'"
              >
                <ng-container *ngIf="col.isCheckbox">
                  <input type="checkbox" [checked]="allSelected" (change)="onSelectAll($event)" class="rounded text-rsldc-navy focus:ring-rsldc-navy cursor-pointer">
                </ng-container>
                <ng-container *ngIf="!col.isCheckbox">
                  {{ col.label }}
                </ng-container>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <!-- Empty State -->
            <tr *ngIf="data.length === 0">
              <td [attr.colspan]="columns.length" class="p-8 text-center text-slate-500">
                {{ emptyMessage }}
              </td>
            </tr>
            
            <!-- Data Rows -->
            <tr *ngFor="let row of data; let i = index" class="hover:bg-slate-50/50 transition-colors">
              <td 
                *ngFor="let col of columns" 
                class="p-4 align-middle"
                [ngClass]="{
                  'text-center': col.align === 'center',
                  'text-right': col.align === 'right',
                  'text-left': !col.align || col.align === 'left'
                }"
              >
                <!-- Render custom template if provided, else raw data -->
                <ng-container *ngIf="rowTemplate">
                  <ng-container *ngTemplateOutlet="rowTemplate; context: { $implicit: row, column: col, index: i }"></ng-container>
                </ng-container>
                <ng-container *ngIf="!rowTemplate">
                  <div class="text-sm text-slate-700 font-medium">{{ row[col.key] }}</div>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Footer slot for pagination -->
      <div *ngIf="showPagination" class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
        <span class="text-xs text-slate-500">Showing {{ data.length }} records</span>
        <div class="flex gap-1">
          <button class="px-2 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50">Prev</button>
          <button class="px-2 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  `
})
export class UiTableComponent {
  @Input() title = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() emptyMessage = 'No records found.';
  @Input() showSearch = false;
  @Input() showPagination = false;
  @Input() allSelected = false;
  
  @Output() search = new EventEmitter<string>();
  @Output() selectAll = new EventEmitter<boolean>();

  @ContentChild('rowTemplate') rowTemplate?: TemplateRef<any>;

  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.search.emit(val);
  }

  onSelectAll(event: any) {
    this.selectAll.emit(event.target.checked);
  }
}
