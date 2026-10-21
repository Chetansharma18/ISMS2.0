import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { SdcService } from '../services/sdc.service';
import { categoryLabel } from '../../eoi/pages/sanction-order-list/sanction-order-list.component';
import { BatchRecord } from '../models/batch.model';
import { canUploadStudyMaterial } from '../utils/study-material.util';
import type { SsoProfile } from '../../../core/mock/data/sso-users.mock';
import { CenterHeadAssignModalComponent } from './center-head-assign-modal.component';
import { BatchStudyMaterialModalComponent } from './batch-study-material-modal.component';
import {
  BatchDisplayStatus,
  batchDisplayStatus,
  canRegisterAspirants,
  isBatchApproved,
  registrationBlockedReason,
  registrationLine
} from '../utils/batch-approval.util';
import {
  ListPageComponent,
  ButtonComponent,
  IconComponent,
  TableColumn
} from '../../../shared';
import { FilterTabsComponent } from '../../../shared';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FilterTabsComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    BatchStudyMaterialModalComponent,
    CenterHeadAssignModalComponent,
    ListPageComponent,
    ButtonComponent,
    IconComponent
  ],
  template: `
    <!-- Page Header + Search + Batches Table via the shared ListPageComponent -->
    <app-list-page
      title="Batch Management"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Batch Management' }]"
      [searchable]="true"
      [(searchQuery)]="searchQuery"
      searchPlaceholder="Search Batch Code, Course, Sector, Center, Scheme..."
      [columns]="batchColumns"
      [data]="filteredBatches()"
      [pagination]="true"
      [pageSize]="pageSize"
      itemUnit="batches"
      emptyMessage="No batches match your search criteria."
      [customTemplates]="{
        batchInfo: batchInfoTemplate,
        course: courseTemplate,
        schemeSector: schemeSectorTemplate,
        center: centerTemplate,
        capacity: capacityTemplate,
        startDate: startDateTemplate,
        endDate: endDateTemplate,
        time: timeTemplate,
        status: statusTemplate,
        attender: attenderTemplate,
        actions: actionsTemplate
      }"
    >
        <!-- Filter Controls Toolbar -->
        <div beforeTable class="flex items-center justify-between gap-3 pt-1">
          
          <!-- Status Filter Badges / Pills -->
          <app-filter-tabs [options]="filterOptions()" [value]="activeFilter()" (valueChange)="setFilter($event)" />

        </div>

        @if (message()) {
          <div beforeTable class="p-3 rounded-lg border text-xs flex items-center justify-between gap-2" [class]="messageIsError() ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'">
            <span class="font-medium">{{ message() }}</span>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="message.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }

        <!-- Template: Batch code -->
        <ng-template #batchInfoTemplate let-b>
          <span class="font-normal text-slate-800 text-[13px] tabular-nums whitespace-nowrap">{{ b.batchCode }}</span>
        </ng-template>

        <!-- Template: Course with its sector below -->
        <ng-template #courseTemplate let-b>
          <div>
            <div class="font-normal text-slate-800 text-[13px] leading-tight">
              {{ b.courseName }}
            </div>
            <div class="text-[11px] text-secondary leading-tight mt-px font-normal">
              {{ b.sector || '—' }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Scheme with its category below -->
        <ng-template #schemeSectorTemplate let-b>
          <div>
            <div class="font-normal text-slate-800 text-[13px] leading-tight">
              {{ b.scheme }}
            </div>
            <div class="text-[11px] text-secondary leading-tight mt-px font-normal">
              {{ schemeCategory(b) }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Center (SDC) -->
        <ng-template #centerTemplate let-b>
          <div>
            <div class="font-normal text-slate-800 text-[13px] leading-tight">
              {{ b.sdcName }}
            </div>
            <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">
              {{ b.sdcCode }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Trainees registered out of the batch size, as numbers only -->
        <ng-template #capacityTemplate let-b>
          <span class="font-normal text-slate-800 text-[13px] tabular-nums whitespace-nowrap">
            {{ b.mappedAspirantsCount || 0 }} / {{ batchSize(b) }}
          </span>
        </ng-template>

        <!-- Templates: start date, end date and daily timing, one column each -->
        <ng-template #startDateTemplate let-b>
          <span class="font-normal text-slate-800 text-[13px] tabular-nums whitespace-nowrap">{{ b.startDate }}</span>
        </ng-template>

        <ng-template #endDateTemplate let-b>
          <span class="font-normal text-slate-800 text-[13px] tabular-nums whitespace-nowrap">{{ b.endDate }}</span>
        </ng-template>

        <ng-template #timeTemplate let-b>
          <span class="font-normal text-slate-800 text-[13px] tabular-nums whitespace-nowrap">{{ b.startTime }} – {{ b.endTime }}</span>
        </ng-template>

        <!-- Template: Attender User (the name once assigned; "Assign Attender User" while an approved batch has none) -->
        <ng-template #attenderTemplate let-b>
          @if (b.attender; as person) {
            <div>
              <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ person.name }}</div>
              <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ person.ssoId }}</div>
            </div>
          } @else if (isApproved(b)) {
            <button appButton variant="outline" size="sm" type="button" (click)="assigningBatch.set(b)" title="Assign the Attender User of this batch">
              <app-icon name="plus" size="sm" />
              <span>Assign Attender User</span>
            </button>
          } @else {
            <span class="text-muted">—</span>
          }
        </ng-template>

        <!-- Template: Status, in the same font as the batch code -->
        <ng-template #statusTemplate let-b>
          @switch (displayStatus(b)) {
            @case ('APPROVED') {
              <div class="whitespace-nowrap font-normal text-[13px] text-emerald-700 leading-tight">Approved</div>
              @if (registrationNote(b); as note) {
                <div class="whitespace-nowrap text-[11px] text-secondary leading-tight tabular-nums">{{ note }}</div>
              }
            }
            @case ('REJECTED') {
              <span class="whitespace-nowrap font-normal text-[13px] text-red-600">Rejected</span>
            }
            @case ('RETURNED') {
              <span class="whitespace-nowrap font-normal text-[13px] text-amber-700" [title]="b.returnRemarks || ''">Returned to TP</span>
            }
            @default {
              <span class="whitespace-nowrap font-normal text-[13px] text-amber-700">Pending approval</span>
            }
          }
        </ng-template>



        <!-- Template: Actions -->
        <ng-template #actionsTemplate let-b>
          <div class="flex items-center justify-center gap-3 py-2 px-1 whitespace-nowrap">
            <!-- View Button -->
            <button
              appButton
              variant="outline"
              size="sm"
              class="w-24 shrink-0"
              type="button"
              (click)="viewDetails(b)"
              title="View Batch Details"
            >
              <app-icon name="eye" size="sm" />
              <span>View</span>
            </button>

            <!-- Register Button: once the batch is approved, until registration closes before the start date or it is full -->
            <button
              appButton
              variant="primary"
              size="sm"
              class="w-28 shrink-0"
              type="button"
              [disabled]="!canRegister(b)"
              (click)="selectAndMap(b)"
              [title]="canRegister(b) ? 'Register Aspirant' : registerBlockedReason(b)"
            >
              <app-icon name="plus" size="sm" />
              <span>Register</span>
            </button>

            <!-- Upload Study Material once the batch is approved. One fixed slot so the buttons stay in line. -->
            <div class="w-52 shrink-0">
              @if (canUpload(b)) {
                <button
                  appButton
                  variant="outline"
                  size="sm"
                  block
                  type="button"
                  (click)="materialBatchId.set(b.id)"
                  title="Upload E-Campus study material for this batch"
                >
                  <app-icon name="upload" size="sm" />
                  <span>Upload Study Material</span>
                </button>
              }
            </div>
          </div>
        </ng-template>

    </app-list-page>

    <!-- Assign Attender User (approved batches) -->
    @if (assigningBatch(); as target) {
      <app-center-head-assign-modal
        [sdcName]="'batch ' + target.batchCode"
        role="Attender User"
        targetKind="batch"
        placeholder="e.g. ATTENDER1"
        (confirmed)="confirmAttender($event)"
        (closed)="assigningBatch.set(null)"
      />
    }

    <!-- Upload Study Material (approved batches) -->
    @if (materialBatchId(); as batchId) {
      <app-batch-study-material-modal [batchId]="batchId" (closed)="materialBatchId.set(null)" />
    }

  `
})
export class BatchListComponent {
  readonly batchService = inject(BatchService);
  private readonly sdcService = inject(SdcService);
  readonly router = inject(Router);

  searchQuery = signal<string>('');
  activeFilter = signal<string>('All');
  readonly pageSize = 10;

  readonly batchColumns: TableColumn<BatchRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'batchInfo', label: 'Batch Code', type: 'custom', width: 'w-32' },
    { key: 'course', label: 'Course & Sector', type: 'custom', width: 'min-w-[210px]' },
    { key: 'schemeSector', label: 'Scheme & Category', type: 'custom', width: 'min-w-[150px]' },
    { key: 'center', label: 'Center (SDC)', type: 'custom', width: 'min-w-[180px]' },
    { key: 'capacity', label: 'Batch Size', align: 'center', type: 'custom', width: 'w-28' },
    { key: 'startDate', label: 'Start Date', type: 'custom', width: 'w-28' },
    { key: 'endDate', label: 'End Date', type: 'custom', width: 'w-28' },
    { key: 'time', label: 'Time', type: 'custom', width: 'min-w-[160px]' },
    { key: 'status', label: 'Status', type: 'custom', width: 'min-w-[150px]' },
    { key: 'attender', label: 'Attender User', type: 'custom', width: 'min-w-[190px]' },
    { key: 'actions', label: 'Actions', align: 'center', type: 'custom', width: 'min-w-[480px]' }
  ];

  /** The approved batch whose Attender User is being assigned. */
  readonly assigningBatch = signal<BatchRecord | null>(null);

  /** The user confirmed the details fetched from SSO: that person becomes the Attender User (only one is allowed). */
  confirmAttender(person: SsoProfile): void {
    const batch = this.assigningBatch();
    if (!batch) return;
    const assigned = this.batchService.assignAttender(batch.id, {
      ssoId: person.ssoId,
      name: person.name,
      mobile: person.mobile,
      email: person.email,
      designation: person.designation
    });
    this.messageIsError.set(!assigned);
    this.message.set(
      assigned
        ? `${person.name} is now the Attender User of batch ${batch.batchCode}.`
        : `Batch ${batch.batchCode} already has an Attender User.`
    );
    this.assigningBatch.set(null);
  }

  /** The approved batch whose study material is open in the upload dialog. */
  readonly materialBatchId = signal<string | null>(null);

  /** Study material can be uploaded once the batch is approved. */
  canUpload(b: BatchRecord): boolean {
    return canUploadStudyMaterial(b);
  }

  readonly message = signal<string>('');
  readonly messageIsError = signal<boolean>(false);

  /** Approved by the department: an Attender User can be assigned and study material uploaded. */
  isApproved(b: BatchRecord): boolean {
    return isBatchApproved(b);
  }

  /** Under the status of an approved batch: until when aspirants can be registered, or that registration has closed. */
  registrationNote(b: BatchRecord): string {
    return registrationLine(b);
  }

  displayStatus(b: BatchRecord): BatchDisplayStatus {
    return batchDisplayStatus(b);
  }

  canRegister(b: BatchRecord): boolean {
    return canRegisterAspirants(b);
  }

  registerBlockedReason(b: BatchRecord): string {
    return registrationBlockedReason(b);
  }

  readonly filterOptions = computed(() => {
    const all = this.batchService.batches();
    const count = (status: BatchDisplayStatus) => all.filter(b => batchDisplayStatus(b) === status).length;
    return [
      { id: 'All', label: 'All Batches', count: all.length },
      { id: 'PENDING', label: 'Pending Approval', count: count('PENDING') },
      { id: 'RETURNED', label: 'Returned to TP', count: count('RETURNED') },
      { id: 'APPROVED', label: 'Approved', count: count('APPROVED') },
      { id: 'REJECTED', label: 'Rejected', count: count('REJECTED') }
    ];
  });

  readonly filteredBatches = computed(() => {
    let list = this.batchService.batches();
    const filter = this.activeFilter();

    if (filter !== 'All') {
      list = list.filter(b => batchDisplayStatus(b) === filter);
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
          (b.sdcDistrict && b.sdcDistrict.toLowerCase().includes(query)) ||
          (b.nipaNo && b.nipaNo.toLowerCase().includes(query)) ||
          (b.qpCode && b.qpCode.toLowerCase().includes(query))
      );
    }

    return list;
  });

  setFilter(filterId: string): void {
    this.activeFilter.set(filterId);
  }

  /** Scheme category of the center the batch belongs to, in normal case ("Rajvik", "Samarth"). */
  schemeCategory(b: BatchRecord): string {
    return categoryLabel(this.sdcService.getSdcById(b.sdcId)?.schemeCategory);
  }

  /** The batch size the partner entered for the batch. */
  batchSize(b: BatchRecord): number {
    return b.approvedBatchStrength || b.maxStrength || 0;
  }

  selectAndMap(b: BatchRecord): void {
    // Navigate to aspirant registration and batch mapping form
    this.router.navigate(['/batches', b.id, 'map-aspirant']);
  }

  viewDetails(b: BatchRecord): void {
    this.router.navigate(['/batches', b.id]);
  }
}
