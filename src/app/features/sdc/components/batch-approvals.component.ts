import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { BatchRecord } from '../models/batch.model';
import { SdcService } from '../services/sdc.service';
import { categoryLabel } from '../../eoi/pages/sanction-order-list/sanction-order-list.component';
import {
  batchStatusLabel,
  isBatchApproved,
  isBatchInApproval,
  isBatchRejected,
  isBatchReturned
} from '../utils/batch-approval.util';
import {
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
          title="Batches"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'SDC Management', url: '/admin/sdc' }, { label: 'Batches' }]"
          [searchable]="true"
          searchPlaceholder="Search batch code, course, center, scheme..."
          [(searchQuery)]="searchQuery"
        ></app-page-header>

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
            course: courseTemplate,
            scheme: schemeTemplate,
            centerName: centerNameTemplate,
            size: sizeTemplate,
            schedule: scheduleTemplate,
            status: statusTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Batch Code -->
        <ng-template #batchCodeTemplate let-batch>
          <div class="text-center tabular-nums font-normal text-slate-800 text-[13px]">
            {{ batch.batchCode }}
          </div>
        </ng-template>

        <!-- Template: Course, with its sector below -->
        <ng-template #courseTemplate let-batch>
          <div class="text-center py-0.5">
            <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ batch.courseName }}</div>
            <div class="text-[11px] text-secondary leading-tight mt-px">{{ batch.sector || '—' }}</div>
          </div>
        </ng-template>

        <!-- Template: Scheme, with its category below -->
        <ng-template #schemeTemplate let-batch>
          <div class="text-center py-0.5">
            <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ batch.scheme || '—' }}</div>
            <div class="text-[11px] text-secondary leading-tight mt-px">{{ schemeCategory(batch) }}</div>
          </div>
        </ng-template>

        <!-- Template: SDC center, with its district below -->
        <ng-template #centerNameTemplate let-batch>
          <div class="text-center py-0.5">
            <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ batch.sdcName }}</div>
            <div class="text-[11px] text-secondary leading-tight mt-px">{{ batch.sdcDistrict || '—' }}</div>
          </div>
        </ng-template>

        <!-- Template: Batch size the partner entered. Aspirants are registered after approval, so none are counted here. -->
        <ng-template #sizeTemplate let-batch>
          <div class="text-center tabular-nums font-normal text-slate-800 text-[13px]">{{ batchSize(batch) }}</div>
        </ng-template>

        <!-- Template: Start date, with the end date below -->
        <ng-template #scheduleTemplate let-batch>
          <div class="text-center py-0.5 tabular-nums">
            <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ batch.startDate }}</div>
            <div class="text-[11px] text-secondary leading-tight mt-px">to {{ batch.endDate }}</div>
          </div>
        </ng-template>

        <!-- Template: Status (Approved in green, Rejected in red, everything else in amber), like the SDC table -->
        <ng-template #statusTemplate let-batch>
          <div class="flex items-center justify-center">
            @if (isApproved(batch)) {
              <span class="whitespace-nowrap font-normal text-[13px] text-emerald-700">{{ statusLabel(batch) }}</span>
            } @else if (isRejected(batch)) {
              <span class="whitespace-nowrap font-normal text-[13px] text-red-600">{{ statusLabel(batch) }}</span>
            } @else {
              <span class="whitespace-nowrap font-normal text-[13px] text-amber-700">{{ statusLabel(batch) }}</span>
            }
          </div>
        </ng-template>

        <!-- Template: Actions (Approve Batch + View Details) -->
        <ng-template #actionsTemplate let-batch>
          <!-- The department only views a batch here; it decides on the details screen. -->
          <div class="flex items-center justify-center whitespace-nowrap py-0.5">
            <button
              appButton
              variant="outline"
              size="sm"
              class="w-24 shrink-0"
              type="button"
              (click)="viewDetails(batch)"
              title="View Batch Details"
            >
              <app-icon name="eye" size="sm" />
              <span>View</span>
            </button>
          </div>
        </ng-template>

    </app-page-shell>
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

  private readonly sdcService = inject(SdcService);

  readonly pageSize = 10;

  readonly batchColumns: TableColumn<BatchRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
    { key: 'batchCode', label: 'Batch Code', align: 'center', type: 'custom', width: 'w-32' },
    { key: 'course', label: 'Course & Sector', align: 'center', type: 'custom', width: 'min-w-[200px]' },
    { key: 'scheme', label: 'Scheme & Category', align: 'center', type: 'custom', width: 'min-w-[140px]' },
    { key: 'centerName', label: 'SDC Center', align: 'center', type: 'custom', width: 'min-w-[180px]' },
    { key: 'size', label: 'Batch Size', align: 'center', type: 'custom', width: 'w-24' },
    { key: 'schedule', label: 'Start & End Date', align: 'center', type: 'custom', width: 'w-36' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'min-w-[140px]' },
    { key: 'actions', label: 'Actions', align: 'center', type: 'custom', width: 'w-32' }
  ];

  /** The batch size the partner entered (the capacity once the department has approved). */
  batchSize(b: BatchRecord): number {
    return b.approvedBatchStrength || b.maxStrength || 0;
  }

  /** Scheme category of the center the batch belongs to, in normal case ("Rajvik", "Samarth"). */
  schemeCategory(b: BatchRecord): string {
    return categoryLabel(this.sdcService.getSdcById(b.sdcId)?.schemeCategory);
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
    return isBatchApproved(b);
  }

  isRejected(b: BatchRecord): boolean {
    return isBatchRejected(b);
  }

  isReturned(b: BatchRecord): boolean {
    return isBatchReturned(b);
  }

  /** Every batch reaches the department as soon as it is created. */
  private readonly submittedBatches = computed(() => this.batchService.batches());

  readonly filterOptions = computed(() => {
    const all = this.submittedBatches();
    const pending = all.filter(b => isBatchInApproval(b));
    const approved = all.filter(b => this.isApproved(b));
    const rejected = all.filter(b => this.isRejected(b));
    return [
      { id: 'All', label: 'All', count: all.length },
      { id: 'Pending', label: 'Pending', count: pending.length },
      { id: 'Approved', label: 'Approved', count: approved.length },
      { id: 'Returned', label: 'Returned to TP', count: all.filter(b => this.isReturned(b)).length },
      { id: 'Rejected', label: 'Rejected', count: rejected.length }
    ];
  });

  readonly filteredBatches = computed(() => {
    let list = this.submittedBatches();
    const filter = this.activeFilter();

    if (filter === 'Pending') {
      list = list.filter(b => isBatchInApproval(b));
    } else if (filter === 'Approved') {
      list = list.filter(b => this.isApproved(b));
    } else if (filter === 'Returned') {
      list = list.filter(b => this.isReturned(b));
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

  /** Status in words: "Pending approval", "Approved", "Rejected", "Returned to TP". */
  statusLabel(b: BatchRecord): string {
    return batchStatusLabel(b);
  }

  viewDetails(batch: BatchRecord): void {
    this.router.navigate(['/batches', batch.id]);
  }
}
