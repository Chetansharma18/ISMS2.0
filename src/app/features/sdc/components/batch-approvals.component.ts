import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { BatchRecord } from '../models/batch.model';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../../shared';

@Component({
  selector: 'app-batch-approvals',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">

        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Batch Approvals"
        ></app-page-header>

        <!-- Success Alert Notification -->
        @if (successMessage()) {
          <div class="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="font-medium">{{ successMessage() }}</span>
            </div>
            <button (click)="successMessage.set('')" class="text-emerald-600 hover:text-emerald-900 cursor-pointer font-bold">✕</button>
          </div>
        }

        <!-- Status Filter Badges / Pills Toolbar -->
        <div class="flex items-center justify-between gap-3 pt-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            @for (f of filterOptions(); track f.id) {
              <button
                type="button"
                (click)="setFilter(f.id)"
                class="px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
                [class.bg-[#174A6E]]="activeFilter() === f.id"
                [class.text-white]="activeFilter() === f.id"
                [class.border-[#174A6E]]="activeFilter() === f.id"
                [class.bg-white]="activeFilter() !== f.id"
                [class.text-[#5F6B76]]="activeFilter() !== f.id"
                [class.border-[#D9E1E7]]="activeFilter() !== f.id"
                [class.hover:bg-[#EAF2F6]]="activeFilter() !== f.id"
                [class.hover:text-[#174A6E]]="activeFilter() !== f.id"
              >
                <span>{{ f.label }}</span>
                <span
                  class="px-1.5 py-0.2 rounded-full text-[10px]"
                  [class.bg-white/20]="activeFilter() === f.id"
                  [class.text-white]="activeFilter() === f.id"
                  [class.bg-[#F5F7F9]]="activeFilter() !== f.id"
                  [class.text-[#5F6B76]]="activeFilter() !== f.id"
                >
                  {{ f.count }}
                </span>
              </button>
            }
          </div>

          <div class="text-xs text-slate-500 font-medium hidden sm:block">
            Showing {{ filteredBatches().length }} {{ filteredBatches().length === 1 ? 'batch' : 'batches' }}
          </div>
        </div>

        <!-- Admin Advanced Filter Bar (Center, Scheme, District, Search) -->
        <div class="bg-[#F8FAFC] border border-[#D9E1E7] rounded-lg p-2.5 flex flex-wrap items-center gap-2.5 text-xs shadow-2xs">
          
          <!-- Filter: Center Name -->
          <div class="flex items-center gap-1.5">
            <label class="font-semibold text-slate-700 whitespace-nowrap text-[11px] uppercase tracking-wider">Center:</label>
            <select
              [ngModel]="selectedCenter()"
              (ngModelChange)="selectedCenter.set($event)"
              class="bg-white border border-[#D9E1E7] rounded-[4px] px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#174A6E] max-w-[200px]"
            >
              <option value="ALL">All Centers ({{ centerList().length }})</option>
              @for (c of centerList(); track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <!-- Filter: Scheme -->
          <div class="flex items-center gap-1.5">
            <label class="font-semibold text-slate-700 whitespace-nowrap text-[11px] uppercase tracking-wider">Scheme:</label>
            <select
              [ngModel]="selectedScheme()"
              (ngModelChange)="selectedScheme.set($event)"
              class="bg-white border border-[#D9E1E7] rounded-[4px] px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#174A6E]"
            >
              <option value="ALL">All Schemes</option>
              @for (sch of schemeList(); track sch) {
                <option [value]="sch">{{ sch }}</option>
              }
            </select>
          </div>

          <!-- Filter: District -->
          <div class="flex items-center gap-1.5">
            <label class="font-semibold text-slate-700 whitespace-nowrap text-[11px] uppercase tracking-wider">District:</label>
            <select
              [ngModel]="selectedDistrict()"
              (ngModelChange)="selectedDistrict.set($event)"
              class="bg-white border border-[#D9E1E7] rounded-[4px] px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#174A6E]"
            >
              <option value="ALL">All Districts</option>
              @for (dst of districtList(); track dst) {
                <option [value]="dst">{{ dst }}</option>
              }
            </select>
          </div>

          <!-- Search input -->
          <div class="flex-1 min-w-[200px] relative">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Search batch code, course, center, scheme..."
              class="w-full bg-white border border-[#D9E1E7] rounded-[4px] pl-7 pr-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#174A6E]"
            />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Reset filters -->
          @if (hasActiveFilters()) {
            <button
              type="button"
              (click)="resetFilters()"
              class="px-2 py-1 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded border border-rose-200 transition-colors cursor-pointer font-medium"
            >
              Reset Filters
            </button>
          }

        </div>

        <!-- Batches Table via Reusable TableComponent -->
        <app-table
          [columns]="batchColumns"
          [data]="filteredBatches()"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="batches"
          emptyMessage="No batches available matching the selected criteria."
          [customTemplates]="{
            batchCode: batchCodeTemplate,
            batchName: batchNameTemplate,
            centerName: centerNameTemplate,
            scheme: schemeTemplate,
            sector: sectorTemplate,
            capacity: capacityTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Batch Code -->
        <ng-template #batchCodeTemplate let-batch>
          <div class="text-center font-mono font-medium text-primary text-[12.5px]">
            {{ batch.batchCode }}
          </div>
        </ng-template>

        <!-- Template: Batch & Course Name -->
        <ng-template #batchNameTemplate let-batch>
          <div class="text-center py-0.5">
            <div class="font-medium text-primary text-[13px] leading-snug">{{ batch.batchName || batch.courseName }}</div>
            <div class="text-[11px] text-secondary font-normal mt-0.5">{{ batch.courseName }}</div>
          </div>
        </ng-template>

        <!-- Template: SDC Center + District -->
        <ng-template #centerNameTemplate let-batch>
          <div class="text-center py-0.5">
            <div class="font-medium text-primary text-[13px] leading-snug">{{ batch.sdcName }}</div>
            <div class="text-[11px] text-secondary font-normal flex items-center justify-center gap-1 mt-0.5">
              <svg class="w-3 h-3 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ batch.sdcDistrict || 'Rajasthan' }}</span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Scheme -->
        <ng-template #schemeTemplate let-batch>
          <div class="text-center font-normal text-primary text-[13px]">
            {{ batch.scheme || '—' }}
          </div>
        </ng-template>

        <!-- Template: Sector -->
        <ng-template #sectorTemplate let-batch>
          <div class="text-center font-normal text-primary text-[13px]">
            {{ batch.sector || '—' }}
          </div>
        </ng-template>

        <!-- Template: Capacity & Mapped Aspirants -->
        <ng-template #capacityTemplate let-batch>
          <div class="min-w-35 text-left px-1">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>{{ batch.mappedAspirantsCount || 0 }}/{{ batch.maxStrength || 30 }} Aspirants</span>
              <span class="text-slate-400 font-normal text-[11px]">{{ getMappedPercent(batch) }}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                [class.bg-emerald-500]="isApproved(batch)"
                [class.bg-amber-500]="!isApproved(batch) && !isRejected(batch)"
                [class.bg-rose-500]="isRejected(batch)"
                [style.width]="getMappedPercent(batch) + '%'"
              ></div>
            </div>
          </div>
        </ng-template>

        <!-- Template: Actions (Approve Batch + View Details) -->
        <ng-template #actionsTemplate let-batch>
          <div class="flex items-center justify-center gap-2 whitespace-nowrap py-0.5">
            
            <!-- Slot 1: Action button or status badge -->
            <div class="w-[120px] flex justify-center shrink-0">
              @if (isApproved(batch)) {
                <span class="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs py-1">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Approved</span>
                </span>
              } @else if (isRejected(batch)) {
                <span class="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs py-1">
                  <svg class="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Rejected</span>
                </span>
              } @else {
                <button
                  type="button"
                  (click)="openApproveModal(batch)"
                  class="w-full justify-center whitespace-nowrap inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#174A6E] hover:bg-[#123B59] active:bg-[#0E2D44] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
                  title="Approve Batch"
                >
                  <svg class="w-3.5 h-3.5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Approve Batch</span>
                </button>
              }
            </div>

            <!-- Slot 2: View Details button (116px fixed width) -->
            <button
              type="button"
              (click)="viewDetails(batch)"
              class="w-[116px] justify-center whitespace-nowrap inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
              title="View Batch Details"
            >
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View Details</span>
            </button>

          </div>
        </ng-template>

      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- ADMIN BATCH APPROVAL MODAL (Themed identically to SDC Approval modal)    -->
    <!-- ========================================================================= -->
    @if (approvingBatch(); as targetBatch) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <!-- Modal Header -->
          <div class="bg-[#174A6E] text-white px-5 py-3.5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="font-bold text-sm">Approve Training Batch</h3>
            </div>
            <button
              type="button"
              (click)="closeApproveModal()"
              class="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
            >✕</button>
          </div>

          <!-- Modal Body -->
          <div class="p-5 space-y-4 text-xs">
            
            <!-- Batch Summary Box -->
            <div class="bg-[#EAF2F6] border border-[#D9E1E7] rounded-lg p-3 space-y-1.5">
              <div class="flex justify-between items-start">
                <span class="text-[11px] font-semibold text-slate-500 uppercase">Batch Information</span>
                <span class="font-mono text-[11px] font-bold text-[#174A6E]">{{ targetBatch.batchCode }}</span>
              </div>
              <div class="font-bold text-slate-900 text-sm">{{ targetBatch.batchName || targetBatch.courseName }}</div>
              <div class="text-slate-900 font-bold pt-1 border-t border-[#D9E1E7]/70 flex items-center justify-between">
                <span>{{ targetBatch.sdcName }}</span>
                <span class="text-slate-500 font-medium">{{ targetBatch.sdcDistrict }}</span>
              </div>
              <div class="text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
                <span>Scheme: <strong class="text-slate-800">{{ targetBatch.scheme }}</strong> • Sector: <strong class="text-slate-800">{{ targetBatch.sector }}</strong></span>
                <span class="font-semibold text-slate-700">Mapped: <strong class="text-[#174A6E]">{{ targetBatch.mappedAspirantsCount || 0 }}/{{ targetBatch.maxStrength || 30 }} Aspirants</strong></span>
              </div>
            </div>

            <!-- Approved Target Capacity -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1">
                Approved Trainee Capacity <span class="text-rose-500">*</span>
              </label>
              <input
                type="number"
                [(ngModel)]="approvalTargetCapacity"
                min="1"
                max="500"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A6E]"
                placeholder="Enter approved capacity"
              />
              <span class="text-[10.5px] text-slate-500 mt-0.5 block">Requested capacity: {{ targetBatch.maxStrength || 30 }} trainees</span>
            </div>

            <!-- Approval Remarks -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1">
                Approval Remarks / Sanction Notes <span class="text-rose-500">*</span>
              </label>
              <textarea
                [(ngModel)]="approvalRemarks"
                rows="3"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#174A6E]"
                placeholder="Enter official approval remarks..."
              ></textarea>
            </div>

            <!-- Confirmation notice -->
            <div class="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Approving this batch will permit commencement of training and biometric attendance capture.</span>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              (click)="closeApproveModal()"
              class="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmApproval()"
              class="px-4 py-1.5 rounded-lg bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Confirm & Approve Batch</span>
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class BatchApprovalsComponent {
  readonly batchService = inject(BatchService);
  readonly router = inject(Router);

  activeFilter = signal<string>('All');
  selectedCenter = signal<string>('ALL');
  selectedScheme = signal<string>('ALL');
  selectedDistrict = signal<string>('ALL');
  searchQuery = signal<string>('');
  successMessage = signal<string>('');

  /** State for Approval Modal */
  approvingBatch = signal<BatchRecord | null>(null);
  approvalTargetCapacity = 30;
  approvalRemarks = 'Approved in accordance with RSLDC guidelines and verified physical infrastructure.';

  readonly pageSize = 10;

  readonly batchColumns: TableColumn<BatchRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
    { key: 'batchCode', label: 'Batch Code', align: 'center', type: 'custom', width: 'w-32' },
    { key: 'batchName', label: 'Batch & Course', align: 'center', type: 'custom', width: 'min-w-[190px]' },
    { key: 'centerName', label: 'SDC Center', align: 'center', type: 'custom', width: 'min-w-[180px]' },
    { key: 'scheme', label: 'Scheme', align: 'center', type: 'custom' },
    { key: 'sector', label: 'Sector', align: 'center', type: 'custom' },
    { key: 'capacity', label: 'Capacity & Mapped', align: 'center', type: 'custom', width: 'min-w-[170px]' },
    { key: 'actions', label: 'Actions', align: 'center', type: 'custom', width: 'min-w-[240px]' }
  ];

  getMappedPercent(b: BatchRecord): number {
    const max = b.approvedBatchStrength || b.maxStrength || 30;
    if (!max) return 0;
    const count = b.mappedAspirantsCount ?? b.trainees?.length ?? 0;
    return Math.min(100, Math.round((count / max) * 100));
  }

  readonly centerList = computed(() => {
    const list = this.batchService.batches();
    return Array.from(new Set(list.map(b => b.sdcName).filter(Boolean)));
  });

  readonly schemeList = computed(() => {
    const list = this.batchService.batches();
    return Array.from(new Set(list.map(b => b.scheme).filter(Boolean)));
  });

  readonly districtList = computed(() => {
    const list = this.batchService.batches();
    return Array.from(new Set(list.map(b => b.sdcDistrict).filter(Boolean)));
  });

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
    const pending = all.filter(b => !this.isApproved(b) && !this.isRejected(b));
    const approved = all.filter(b => this.isApproved(b));
    const rejected = all.filter(b => this.isRejected(b));
    return [
      { id: 'All', label: 'All', count: all.length },
      { id: 'Pending', label: 'Pending', count: pending.length },
      { id: 'Approved', label: 'Approved', count: approved.length },
      { id: 'Rejected', label: 'Rejected', count: rejected.length }
    ];
  });

  readonly filteredBatches = computed(() => {
    let list = this.batchService.batches();
    const filter = this.activeFilter();

    if (filter === 'Pending') {
      list = list.filter(b => !this.isApproved(b) && !this.isRejected(b));
    } else if (filter === 'Approved') {
      list = list.filter(b => this.isApproved(b));
    } else if (filter === 'Rejected') {
      list = list.filter(b => this.isRejected(b));
    }

    if (this.selectedCenter() !== 'ALL') {
      list = list.filter(b => b.sdcName === this.selectedCenter());
    }

    if (this.selectedScheme() !== 'ALL') {
      list = list.filter(b => b.scheme === this.selectedScheme());
    }

    if (this.selectedDistrict() !== 'ALL') {
      list = list.filter(b => b.sdcDistrict === this.selectedDistrict());
    }

    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(
        b =>
          b.batchCode.toLowerCase().includes(q) ||
          (b.batchName && b.batchName.toLowerCase().includes(q)) ||
          b.courseName.toLowerCase().includes(q) ||
          b.sdcName.toLowerCase().includes(q) ||
          b.scheme.toLowerCase().includes(q) ||
          (b.sector && b.sector.toLowerCase().includes(q))
      );
    }

    return list;
  });

  hasActiveFilters(): boolean {
    return (
      this.selectedCenter() !== 'ALL' ||
      this.selectedScheme() !== 'ALL' ||
      this.selectedDistrict() !== 'ALL' ||
      this.searchQuery().trim().length > 0
    );
  }

  resetFilters(): void {
    this.selectedCenter.set('ALL');
    this.selectedScheme.set('ALL');
    this.selectedDistrict.set('ALL');
    this.searchQuery.set('');
  }

  setFilter(id: string): void {
    this.activeFilter.set(id);
  }

  formatStatus(status: string): string {
    if (!status) return 'PENDING';
    if (status === 'ONGOING') return 'ONGOING';
    if (status === 'PENDING_APPROVAL' || status === 'INSPECTION_PENDING') return 'PENDING';
    return status;
  }

  openApproveModal(batch: BatchRecord): void {
    this.approvingBatch.set(batch);
    this.approvalTargetCapacity = batch.maxStrength || 30;
    this.approvalRemarks = 'Approved in accordance with RSLDC guidelines and verified physical infrastructure.';
  }

  closeApproveModal(): void {
    this.approvingBatch.set(null);
  }

  confirmApproval(): void {
    const batch = this.approvingBatch();
    if (!batch) return;

    this.batchService.approveBatch(batch.id, this.approvalRemarks, 'Department Scrutiny Officer');
    this.successMessage.set(`Batch "${batch.batchCode} - ${batch.batchName || batch.courseName}" has been successfully approved.`);
    this.closeApproveModal();
  }

  viewDetails(batch: BatchRecord): void {
    this.router.navigate(['/batches', batch.id]);
  }
}
