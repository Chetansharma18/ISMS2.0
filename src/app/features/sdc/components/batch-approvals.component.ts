import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { BatchRecord } from '../models/batch.model';
import {
  ActionModalComponent,
  ButtonComponent,
  IconComponent,
  InputDirective,
  PageHeaderComponent,
  PageShellComponent,
  TableComponent,
  TableColumn
} from '../../../shared';
import { FilterTabsComponent } from '../../../shared';

@Component({
  selector: 'app-batch-approvals',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FilterTabsComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    ActionModalComponent,
    ButtonComponent,
    IconComponent,
    InputDirective,
    PageHeaderComponent,
    PageShellComponent,
    TableComponent
  ],
  template: `
    <app-page-shell>

        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Batch Approvals"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'SDC Management', url: '/admin/sdc' }, { label: 'Batch Approvals' }]"
          [searchable]="true"
          searchPlaceholder="Search batch code, course, center, scheme..."
          [(searchQuery)]="searchQuery"
        ></app-page-header>

        <!-- Success Alert Notification -->
        @if (successMessage()) {
          <div class="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <app-icon name="check" [stroke]="2" class="text-emerald-600 shrink-0" />
              <span class="font-medium">{{ successMessage() }}</span>
            </div>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="successMessage.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }

        <!-- Status Filter Badges / Pills Toolbar -->
        <div class="flex items-center justify-between gap-3 pt-1">
          <app-filter-tabs [options]="filterOptions()" [value]="activeFilter()" (valueChange)="setFilter($event)" />

          <div class="text-xs text-slate-500 font-medium hidden sm:block">
            Showing {{ filteredBatches().length }} {{ filteredBatches().length === 1 ? 'batch' : 'batches' }}
          </div>
        </div>

        <!-- Admin Advanced Filter Bar (Center, Scheme, District) -->
        <div class="bg-slate-50 border border-border rounded-lg p-2.5 flex flex-wrap items-center gap-2.5 text-xs shadow-2xs">
          
          <!-- Filter: Center Name -->
          <div class="flex items-center gap-1.5">
            <label class="font-semibold text-slate-700 whitespace-nowrap text-[11px] uppercase tracking-wider">Center:</label>
            <select
              appInput
              size="sm"
              [ngModel]="selectedCenter()"
              (ngModelChange)="selectedCenter.set($event)"
              class="max-w-[200px]"
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
              appInput
              size="sm"
              [ngModel]="selectedScheme()"
              (ngModelChange)="selectedScheme.set($event)"
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
              appInput
              size="sm"
              [ngModel]="selectedDistrict()"
              (ngModelChange)="selectedDistrict.set($event)"
            >
              <option value="ALL">All Districts</option>
              @for (dst of districtList(); track dst) {
                <option [value]="dst">{{ dst }}</option>
              }
            </select>
          </div>

          <!-- Reset filters -->
          @if (hasActiveFilters()) {
            <button
              appButton
              variant="danger"
              size="sm"
              type="button"
              (click)="resetFilters()"
              class="ml-auto"
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
          <div class="text-center font-mono font-normal text-slate-800 text-[13px]">
            {{ batch.batchCode }}
          </div>
        </ng-template>

        <!-- Template: Batch & Course Name -->
        <ng-template #batchNameTemplate let-batch>
          <div class="text-center py-0.5">
            <div class="font-normal text-slate-800 text-[13px] leading-snug">{{ batch.batchName || batch.courseName }}</div>
            <div class="text-[11px] text-secondary font-normal mt-0.5">{{ batch.courseName }}</div>
          </div>
        </ng-template>

        <!-- Template: SDC Center + District -->
        <ng-template #centerNameTemplate let-batch>
          <div class="text-center py-0.5">
            <div class="font-normal text-slate-800 text-[13px] leading-snug">{{ batch.sdcName }}</div>
            <div class="text-[11px] text-secondary font-normal flex items-center justify-center gap-1 mt-0.5">
              <app-icon name="map-pin" size="xs" [stroke]="2" class="text-muted shrink-0" />
              <span>{{ batch.sdcDistrict || 'Rajasthan' }}</span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Scheme -->
        <ng-template #schemeTemplate let-batch>
          <div class="text-center font-normal text-slate-800 text-[13px]">
            {{ batch.scheme || '—' }}
          </div>
        </ng-template>

        <!-- Template: Sector -->
        <ng-template #sectorTemplate let-batch>
          <div class="text-center font-normal text-slate-800 text-[13px]">
            {{ batch.sector || '—' }}
          </div>
        </ng-template>

        <!-- Template: Capacity & Mapped Aspirants -->
        <ng-template #capacityTemplate let-batch>
          <div class="min-w-35 text-left px-1">
            <div class="flex items-center justify-between text-[13px] font-normal text-slate-700 mb-1">
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
                  <app-icon name="check" size="sm" [stroke]="2.5" class="text-emerald-600" />
                  <span>Approved</span>
                </span>
              } @else if (isRejected(batch)) {
                <span class="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs py-1">
                  <app-icon name="close" size="sm" [stroke]="2.5" class="text-rose-600" />
                  <span>Rejected</span>
                </span>
              } @else {
                <button
                  appButton
                  size="sm"
                  block
                  type="button"
                  (click)="openApproveModal(batch)"
                  title="Approve Batch"
                >
                  <app-icon name="check" size="sm" />
                  <span>Approve Batch</span>
                </button>
              }
            </div>

            <!-- Slot 2: View Details button (116px fixed width) -->
            <button
              appButton
              variant="outline"
              size="sm"
              class="w-[116px] shrink-0"
              type="button"
              (click)="viewDetails(batch)"
              title="View Batch Details"
            >
              <app-icon name="eye" size="sm" />
              <span>View Details</span>
            </button>

          </div>
        </ng-template>

    </app-page-shell>

    <!-- ========================================================================= -->
    <!-- ADMIN BATCH APPROVAL MODAL (Themed identically to SDC Approval modal)    -->
    <!-- ========================================================================= -->
    <app-action-modal
      [isOpen]="!!approvingBatch()"
      title="Approve Training Batch"
      accentBarClass="bg-primary"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      maxWidthClass="max-w-lg"
      primaryLabel="Confirm &amp; Approve Batch"
      secondaryLabel="Cancel"
      (primaryAction)="confirmApproval()"
      (secondaryAction)="closeApproveModal()"
      (close)="closeApproveModal()"
    >
      @if (approvingBatch(); as targetBatch) {
          <div class="mt-4 space-y-4 text-xs">
            
            <!-- Batch Summary Box -->
            <div class="bg-primary-light border border-border rounded-lg p-3 space-y-1.5">
              <div class="flex justify-between items-start">
                <span class="text-[11px] font-semibold text-slate-500 uppercase">Batch Information</span>
                <span class="font-mono text-[11px] font-bold text-brand">{{ targetBatch.batchCode }}</span>
              </div>
              <div class="font-bold text-slate-900 text-sm">{{ targetBatch.batchName || targetBatch.courseName }}</div>
              <div class="text-slate-900 font-bold pt-1 border-t border-border/70 flex items-center justify-between">
                <span>{{ targetBatch.sdcName }}</span>
                <span class="text-slate-500 font-medium">{{ targetBatch.sdcDistrict }}</span>
              </div>
              <div class="text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
                <span>Scheme: <strong class="text-slate-800">{{ targetBatch.scheme }}</strong> • Sector: <strong class="text-slate-800">{{ targetBatch.sector }}</strong></span>
                <span class="font-semibold text-slate-700">Mapped: <strong class="text-brand">{{ targetBatch.mappedAspirantsCount || 0 }}/{{ targetBatch.maxStrength || 30 }} Aspirants</strong></span>
              </div>
            </div>

            <!-- Approved Target Capacity -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1">
                Approved Trainee Capacity <span class="text-rose-500">*</span>
              </label>
              <input
                appInput
                type="number"
                [(ngModel)]="approvalTargetCapacity"
                min="1"
                max="500"
                class="w-full"
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
                appInput
                [(ngModel)]="approvalRemarks"
                rows="3"
                class="w-full"
                placeholder="Enter official approval remarks..."
              ></textarea>
            </div>

            <!-- Confirmation notice -->
            <div class="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <app-icon name="info-circle" [stroke]="2" class="text-amber-600 shrink-0" />
              <span>Approving this batch will permit commencement of training and biometric attendance capture.</span>
            </div>

          </div>
      }
    </app-action-modal>
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
