import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { BatchRecord } from '../models/batch.model';
import {
  PageHeaderComponent,
  TableComponent,
  ButtonComponent,
  TableColumn
} from '../../../shared';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Batch Management"
        >
          <button
            type="button"
            (click)="router.navigate(['/batches/create'])"
            class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-white text-primary hover:bg-slate-100 active:scale-95 text-xs font-semibold shadow-xs transition-all cursor-pointer select-none"
          >
            <span class="text-sm font-bold leading-none">+</span>
            <span>Create New Batch</span>
          </button>
        </app-page-header>

        <!-- Filter Controls & Search Toolbar (Matching Active EOI & Tender Status) -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          
          <!-- Status Filter Badges / Pills -->
          <div class="flex items-center gap-1.5 flex-wrap">
            @for (f of filterOptions(); track f.id) {
              <button
                type="button"
                (click)="setFilter(f.id)"
                class="px-2.5 py-1 rounded-sm text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
                [class.bg-primary]="activeFilter() === f.id"
                [class.text-white]="activeFilter() === f.id"
                [class.border-primary]="activeFilter() === f.id"
                [class.bg-white]="activeFilter() !== f.id"
                [class.text-text-secondary]="activeFilter() !== f.id"
                [class.border-border]="activeFilter() !== f.id"
                [class.hover:bg-primary-light]="activeFilter() !== f.id"
                [class.hover:text-primary]="activeFilter() !== f.id"
              >
                <span>{{ f.label }}</span>
                <span
                  class="px-1.5 py-0.2 rounded-full text-[10px]"
                  [class.bg-white/20]="activeFilter() === f.id"
                  [class.text-white]="activeFilter() === f.id"
                  [class.bg-[#F5F7F9]]="activeFilter() !== f.id"
                  [class.text-text-secondary]="activeFilter() !== f.id"
                >
                  {{ f.count }}
                </span>
              </button>
            }
          </div>

          <!-- Search Input with Search Icon & Clear Button -->
          <div class="relative w-full sm:w-72">
            <svg class="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search Batch Code, Course, Center, Scheme..."
              class="w-full pl-8 pr-7 py-1.5 text-[13px] bg-white border border-border rounded-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-normal"
            />
            @if (searchQuery) {
              <button
                type="button"
                (click)="searchQuery = ''"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                &times;
              </button>
            }
          </div>

        </div>

        <!-- Batches Table via Reusable TableComponent -->
        <app-table
          [columns]="batchColumns"
          [data]="filteredBatches()"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="batches"
          emptyMessage="No batches match your search criteria."
          [customTemplates]="{
            batchInfo: batchInfoTemplate,
            courseScheme: courseSchemeTemplate,
            center: centerTemplate,
            capacity: capacityTemplate,
            duration: durationTemplate,
            status: statusTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Batch Info -->
        <ng-template #batchInfoTemplate let-b>
          <div class="font-mono">
            <div class="font-bold text-slate-900 leading-snug">
              {{ b.batchCode }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-normal">
              {{ b.batchName || 'General Batch' }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Course & Scheme -->
        <ng-template #courseSchemeTemplate let-b>
          <div>
            <div class="font-semibold text-slate-900 leading-snug">
              {{ b.courseName }}
            </div>
            <div class="mt-1">
              <span class="inline-block px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {{ b.scheme }}
              </span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Center (SDC) -->
        <ng-template #centerTemplate let-b>
          <div>
            <div class="font-semibold text-slate-900 leading-snug">
              {{ b.sdcName }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-mono">
              {{ b.sdcCode }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Capacity & Mapped Progress -->
        <ng-template #capacityTemplate let-b>
          <div class="min-w-35">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>{{ b.mappedAspirantsCount }}/{{ b.maxStrength }} Aspirants</span>
              <span class="text-slate-400 font-normal text-[11px]">{{ getMappedPercent(b) }}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-emerald-500 rounded-full transition-all duration-300"
                [style.width]="getMappedPercent(b) + '%'"
              ></div>
            </div>
          </div>
        </ng-template>

        <!-- Template: Duration -->
        <ng-template #durationTemplate let-b>
          <div class="text-xs text-slate-600 space-y-0.5 whitespace-nowrap">
            <div><span class="text-slate-400">From:</span> {{ b.startDate }}</div>
            <div><span class="text-slate-400">To:</span> {{ b.endDate }}</div>
          </div>
        </ng-template>

        <!-- Template: Status Badge -->
        <ng-template #statusTemplate let-b>
          @if (b.status === 'ONGOING') {
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#E6F9F0] text-[#15803D] border border-[#86EFAC] tracking-wider uppercase">
              ONGOING
            </span>
          } @else {
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-300 tracking-wider uppercase">
              APPROVED
            </span>
          }
        </ng-template>

        <!-- Template: Actions -->
        <ng-template #actionsTemplate let-b>
          <app-button
            variant="primary"
            size="sm"
            (btnClick)="selectAndMap(b)"
            title="Select & Map Aspirants"
          >
            <span class="text-sm font-bold leading-none">+</span>
            <span>Select &amp; Map Aspirants</span>
          </app-button>
        </ng-template>

      </div>
    </div>
  `
})
export class BatchListComponent {
  readonly batchService = inject(BatchService);
  readonly router = inject(Router);

  searchQuery = '';
  activeFilter = signal<string>('All');
  readonly pageSize = 10;

  readonly batchColumns: TableColumn<BatchRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'batchInfo', label: 'Batch Info', type: 'custom', width: 'min-w-[160px]' },
    { key: 'courseScheme', label: 'Course & Scheme', type: 'custom' },
    { key: 'center', label: 'Center (SDC)', type: 'custom' },
    { key: 'capacity', label: 'Capacity & Mapped', type: 'custom', width: 'min-w-[160px]' },
    { key: 'duration', label: 'Batch Duration', type: 'custom', width: 'w-36' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'w-28' },
    { key: 'actions', label: 'Actions', align: 'right', type: 'custom', width: 'w-52' }
  ];

  readonly filterOptions = computed(() => {
    const all = this.batchService.batches();
    return [
      { id: 'All', label: 'All Batches', count: all.length },
      { id: 'ONGOING', label: 'Ongoing', count: all.filter(b => b.status === 'ONGOING').length },
      { id: 'APPROVED', label: 'Approved', count: all.filter(b => b.status === 'APPROVED').length }
    ];
  });

  readonly filteredBatches = computed(() => {
    let list = this.batchService.batches();
    const filter = this.activeFilter();

    if (filter === 'ONGOING') {
      list = list.filter(b => b.status === 'ONGOING');
    } else if (filter === 'APPROVED') {
      list = list.filter(b => b.status === 'APPROVED');
    }

    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(
        b =>
          b.batchCode.toLowerCase().includes(query) ||
          (b.batchName && b.batchName.toLowerCase().includes(query)) ||
          b.courseName.toLowerCase().includes(query) ||
          b.sdcName.toLowerCase().includes(query) ||
          b.scheme.toLowerCase().includes(query)
      );
    }

    return list;
  });

  setFilter(filterId: string): void {
    this.activeFilter.set(filterId);
  }

  getMappedPercent(b: BatchRecord): number {
    if (!b.maxStrength) return 0;
    return Math.round((b.mappedAspirantsCount / b.maxStrength) * 100);
  }

  selectAndMap(b: BatchRecord): void {
    // Navigate to batch details or aspirant allocation
    this.router.navigate(['/batches']);
  }
}
