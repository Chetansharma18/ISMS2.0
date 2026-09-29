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
        ></app-page-header>

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
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Search Batch Code, Course, Center, Scheme..."
              class="w-full pl-8 pr-7 py-1.5 text-[13px] bg-white border border-border rounded-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-normal"
            />
            @if (searchQuery()) {
              <button
                type="button"
                (click)="searchQuery.set('')"
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
          <div>
            <div class="font-medium text-primary text-[13px] font-mono leading-snug">
              {{ b.batchCode }}
            </div>
            <div class="text-[11px] text-secondary mt-0.5 font-normal">
              {{ b.batchName || 'General Batch' }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Course & Scheme -->
        <ng-template #courseSchemeTemplate let-b>
          <div>
            <div class="font-medium text-primary text-[13px] leading-snug">
              {{ b.courseName }}
            </div>
            <div class="mt-0.5">
              <span class="font-normal text-[11.5px] text-secondary inline-block">
                {{ b.scheme }}
              </span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Center (SDC) -->
        <ng-template #centerTemplate let-b>
          <div>
            <div class="font-medium text-primary text-[13px] leading-snug">
              {{ b.sdcName }}
            </div>
            <div class="text-[11px] text-secondary mt-0.5 font-mono">
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

        <!-- Template: Status -->
        <ng-template #statusTemplate let-b>
          @if (isApproved(b)) {
            <span class="whitespace-nowrap font-bold text-xs tracking-wider uppercase text-emerald-700">
              APPROVED
            </span>
          } @else if (isRejected(b)) {
            <span class="whitespace-nowrap font-bold text-xs tracking-wider uppercase text-red-600">
              REJECTED
            </span>
          } @else {
            <span class="whitespace-nowrap font-bold text-xs tracking-wider uppercase text-amber-700">
              PENDING
            </span>
          }
        </ng-template>

        <!-- Template: Actions -->
        <ng-template #actionsTemplate let-b>
          <div class="flex items-center justify-center gap-2">
            <!-- View Details Button -->
            <button
              type="button"
              (click)="viewDetails(b)"
              class="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
              title="View Batch Details"
            >
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View Details</span>
            </button>

            <!-- Register Button shown for all batches -->
            <app-button
              variant="primary"
              size="sm"
              (btnClick)="selectAndMap(b)"
              title="Register Aspirant"
            >
              <span class="text-sm font-bold leading-none">+</span>
              <span>Register</span>
            </app-button>
          </div>
        </ng-template>

      </div>
    </div>
  `
})
export class BatchListComponent {
  readonly batchService = inject(BatchService);
  readonly router = inject(Router);

  searchQuery = signal<string>('');
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
    { key: 'actions', label: 'Actions', align: 'center', type: 'custom', width: 'w-56' }
  ];

  isApproved(b: BatchRecord): boolean {
    if (!b) return false;
    if (b.status === 'REJECTED' || b.approvalStatus === 'REJECTED') return false;
    const count = b.mappedAspirantsCount ?? b.trainees?.length ?? 0;
    const max = b.approvedBatchStrength || b.maxStrength || 30;
    return count >= 25 && count <= max;
  }

  isRejected(b: BatchRecord): boolean {
    if (!b) return false;
    return b.status === 'REJECTED' || b.approvalStatus === 'REJECTED';
  }

  readonly filterOptions = computed(() => {
    const all = this.batchService.batches();
    return [
      { id: 'All', label: 'All Batches', count: all.length },
      { id: 'APPROVED', label: 'Approved', count: all.filter(b => this.isApproved(b)).length },
      { id: 'PENDING', label: 'Pending Approval', count: all.filter(b => !this.isApproved(b) && !this.isRejected(b)).length },
      { id: 'REJECTED', label: 'Rejected', count: all.filter(b => this.isRejected(b)).length }
    ];
  });

  readonly filteredBatches = computed(() => {
    let list = this.batchService.batches();
    const filter = this.activeFilter();

    if (filter === 'APPROVED') {
      list = list.filter(b => this.isApproved(b));
    } else if (filter === 'PENDING') {
      list = list.filter(b => !this.isApproved(b) && !this.isRejected(b));
    } else if (filter === 'REJECTED') {
      list = list.filter(b => this.isRejected(b));
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(
        b =>
          b.batchCode.toLowerCase().includes(query) ||
          (b.batchName && b.batchName.toLowerCase().includes(query)) ||
          b.courseName.toLowerCase().includes(query) ||
          b.sdcName.toLowerCase().includes(query) ||
          b.scheme.toLowerCase().includes(query) ||
          (b.sector && b.sector.toLowerCase().includes(query)) ||
          (b.sdcDistrict && b.sdcDistrict.toLowerCase().includes(query))
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
    // Navigate to aspirant registration and batch mapping form
    this.router.navigate(['/batches', b.id, 'map-aspirant']);
  }

  viewDetails(b: BatchRecord): void {
    this.router.navigate(['/batches', b.id]);
  }
}
