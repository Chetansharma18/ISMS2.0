import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SdcService } from '../services/sdc.service';
import { BatchService } from '../services/batch.service';
import { maxBatchesFor, sdcTarget } from '../utils/batch-limit.util';
import { SdcRecord } from '../models/sdc.model';
import { categoryLabel } from '../../eoi/pages/sanction-order-list/sanction-order-list.component';
import type { SsoProfile } from '../../../core/mock/data/sso-users.mock';
import { CenterHeadAssignModalComponent } from './center-head-assign-modal.component';
import { AuthService } from '../../../core/auth/auth.service';
import { PermissionService } from '../../../core/permissions/permission.service';
import {
  PageHeaderComponent,
  TableComponent,
  ButtonComponent,
  IconComponent,
  InputDirective,
  PageShellComponent,
  TableColumn
} from '../../../shared';
import { FilterTabsComponent } from '../../../shared';

@Component({
  selector: 'app-sdc-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FilterTabsComponent,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent,
    IconComponent,
    InputDirective,
    PageShellComponent,
    CenterHeadAssignModalComponent
  ],
  template: `
    <app-page-shell>
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Skill Development Centers (SDC)"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'SDC Management' }]"
          [searchable]="true"
          [(searchQuery)]="searchQuery"
          searchPlaceholder="Search TP name, SDC, code, sector, district..."
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
            Showing {{ filteredSdcs().length }} {{ filteredSdcs().length === 1 ? 'center' : 'centers' }}
          </div>

        </div>

        <!-- Admin Advanced Filter Bar (TP filter, Scheme filter, District filter, and Search) -->
        @if (isAdmin()) {
          <div class="bg-slate-50 border border-border rounded-lg p-2.5 flex flex-wrap items-center gap-2.5 text-xs shadow-2xs">
            
            <!-- Filter: TP Name -->
            <div class="flex items-center gap-1.5">
              <label class="font-semibold text-slate-700 whitespace-nowrap text-[11px] uppercase tracking-wider">TP Name:</label>
              <select
                appInput
                size="sm"
                [ngModel]="selectedTp()"
                (ngModelChange)="selectedTp.set($event)"
                class="max-w-50"
              >
                <option value="ALL">All Training Partners ({{ tpList().length }})</option>
                @for (tp of tpList(); track tp) {
                  <option [value]="tp">{{ tp }}</option>
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
        }

        <!-- SDC Table via Reusable TableComponent -->
        <app-table
          [columns]="currentColumns()"
          [data]="filteredSdcs()"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="centers"
          emptyMessage="No Skill Development Centers available matching the selected criteria."
          [customTemplates]="{
            ipa: ipaTemplate,
            centerName: centerNameTemplate,
            sector: sectorTemplate,
            capacity: capacityTemplate,
            batches: batchesTemplate,
            status: statusTemplate,
            centerHead: centerHeadTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: the IPA the center was registered under: IPA number, with the scheme and its category below -->
        <ng-template #ipaTemplate let-sdc>
          <div class="py-0.5 text-center">
            <div class="font-normal text-slate-800 text-[13px] leading-tight tabular-nums">{{ sdc.mouRefNo || '—' }}</div>
            <div class="text-[11px] text-secondary leading-tight mt-px">{{ sdc.scheme || '—' }} · {{ categoryText(sdc.schemeCategory) }}</div>
          </div>
        </ng-template>

        <!-- Template: Center name, with its code below. The address is in the details. -->
        <ng-template #centerNameTemplate let-sdc>
          <div class="py-0.5 text-center">
            <div class="font-normal text-slate-800 leading-tight text-[13px]">{{ sdc.sdcName }}</div>
            <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ sdc.sdcCode }}</div>
          </div>
        </ng-template>

        <!-- Template: Capacity (For Admin Table) -->
        <ng-template #capacityTemplate let-sdc>
          <div class="text-center font-normal text-slate-800 text-[13px]">
            {{ sdc.approval?.approvedTargetCapacity || sdc.sdcCapacity }} <span class="text-[11px] text-secondary font-normal">Trainees</span>
          </div>
        </ng-template>

        <!-- Template: Batches registered out of the batches the target allows (30 trainees per batch) -->
        <ng-template #batchesTemplate let-sdc>
          <div class="text-center tabular-nums font-normal text-slate-800 text-[13px]">
            {{ batchesRegistered(sdc) }} / {{ batchLimit(sdc) }}
          </div>
        </ng-template>

        <!-- Template: Sector -->
        <ng-template #sectorTemplate let-sdc>
          <div class="text-center font-normal text-slate-800 text-[13px]">
            {{ sdc.sector || '—' }}
          </div>
        </ng-template>

        <!-- Template: Status (APPROVED in green, inspection all types in red) -->
        <ng-template #statusTemplate let-sdc>
          <div class="flex items-center justify-center">
            @if (sdc.status === 'APPROVED' || sdc.status === 'Approved') {
              <span class="whitespace-nowrap font-normal text-[13px] text-emerald-700">Approved</span>
            } @else if (sdc.status === 'PENDING_INSPECTION' || sdc.status?.includes('INSPECTION')) {
              <span class="whitespace-nowrap font-normal text-[13px] text-red-600">{{ formatStatus(sdc.status) }}</span>
            } @else if (sdc.status === 'REJECTED' || sdc.status === 'Rejected') {
              <span class="whitespace-nowrap font-normal text-[13px] text-red-600">Rejected</span>
            } @else {
              <span class="whitespace-nowrap font-normal text-[13px] text-amber-700">{{ formatStatus(sdc.status) }}</span>
            }
          </div>
        </ng-template>

        <!-- Template: Center Head (the name once assigned; "Assign Center Head" for the training partner while an approved center has none) -->
        <ng-template #centerHeadTemplate let-sdc>
          @if (sdc.centerHead; as head) {
            <div class="py-0.5 text-center">
              <div class="font-normal text-slate-800 text-[13px] leading-snug">{{ head.name }}</div>
              <div class="text-[11px] text-secondary tabular-nums mt-0.5">{{ head.ssoId }}</div>
            </div>
          } @else if (sdc.status === 'APPROVED') {
            @if (isAdmin()) {
              <span class="text-[11px] text-muted">Not assigned</span>
            } @else {
              <button appButton variant="outline" size="sm" type="button" (click)="openAssignCenterHead(sdc)" title="Assign the Center Head of this center">
                <app-icon name="plus" size="sm" />
                <span>Assign Center Head</span>
              </button>
            }
          } @else {
            <span class="text-muted">—</span>
          }
        </ng-template>

        <!-- Template: Actions (View Details in the exact same vertical column line) -->
        <ng-template #actionsTemplate let-sdc>
          <div class="flex items-center justify-center gap-3 whitespace-nowrap py-2 px-1">
            
            <!-- Slot 1 (fixed width, training partner only): '+ Create Batch', or 'Edit' when the department returned the SDC.
                 The department only views an SDC here; it decides on the details screen. -->
            @if (!isAdmin()) {
            <div class="w-36 flex justify-center shrink-0">
              <!-- If the center is APPROVED, show "+ Create Batch" -->
              @if (sdc.status === 'APPROVED' || sdc.status === 'Approved') {
                <button
                  appButton
                  size="sm"
                  block
                  type="button"
                  [disabled]="batchLimitReached(sdc)"
                  (click)="createBatch(sdc)"
                  [title]="batchLimitReached(sdc) ? 'All batches of this center are registered' : 'Create Batch'"
                >
                  <app-icon name="plus" size="sm" />
                  <span>Create Batch</span>
                </button>
              }

              <!-- Edit: only when the department returned the SDC for corrections -->
              @if (sdc.status === 'RETURNED_TO_TP') {
                <button
                  appButton
                  size="sm"
                  block
                  type="button"
                  (click)="editSdc(sdc)"
                  title="Edit the SDC details the department asked to correct"
                >
                  <app-icon name="edit" size="sm" />
                  <span>Edit</span>
                </button>
              }

            </div>
            }

            <!-- View Details button (same fixed width, always in the same vertical line) -->
            <button
              appButton
              variant="outline"
              size="sm"
              class="w-24 shrink-0"
              type="button"
              (click)="viewDetails(sdc)"
              title="View Center Details"
            >
              <app-icon name="eye" size="sm" />
              <span>View</span>
            </button>

          </div>
        </ng-template>

    </app-page-shell>

    @if (assigningSdc(); as target) {
      <app-center-head-assign-modal
        [sdcName]="target.sdcName"
        (confirmed)="confirmCenterHead($event)"
        (closed)="assigningSdc.set(null)"
      />
    }
  `
})
export class SdcListComponent {
  readonly sdcService = inject(SdcService);
  private readonly batchService = inject(BatchService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  private readonly permissions = inject(PermissionService);

  /** Detect Admin vs TP mode */
  readonly isAdmin = computed(() => {
    return this.permissions.hasRole('dept_admin') || (this.router.url.startsWith('/sdc') && !this.router.url.startsWith('/sdcs'));
  });

  activeFilter = signal<string>('All');
  selectedTp = signal<string>('ALL');
  selectedScheme = signal<string>('ALL');
  selectedDistrict = signal<string>('ALL');
  searchQuery = signal<string>('');
  successMessage = signal<string>('');

  /** The approved center whose Center Head is being assigned. */
  assigningSdc = signal<SdcRecord | null>(null);

  readonly pageSize = 10;

  /** Dynamic Columns based on User Role */
  readonly currentColumns = computed<TableColumn<SdcRecord>[]>(() => {
    if (this.isAdmin()) {
      return [
        { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
        { key: 'ipa', label: 'IPA & Scheme', align: 'center', type: 'custom', width: 'min-w-[200px]' },
        { key: 'tpName', label: 'Training Partner', align: 'center', width: 'min-w-[170px]', cellClass: 'font-normal text-slate-800 text-[13px] text-center' },
        { key: 'centerName', label: 'SDC Center', align: 'center', type: 'custom', width: 'min-w-[200px]' },
        { key: 'district', label: 'District', align: 'center', width: 'min-w-[110px]', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
        { key: 'sector', label: 'Sector', align: 'center', type: 'custom', width: 'min-w-[150px]' },
        { key: 'proposedStartDate', label: 'Proposed Start Date', align: 'center', width: 'w-32', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px] text-center' },
        { key: 'capacity', label: 'Training Target', align: 'center', type: 'custom', width: 'w-32' },
        { key: 'batches', label: 'Batches Registered', align: 'center', type: 'custom', width: 'w-32' },
        { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'min-w-[140px]' },
        { key: 'centerHead', label: 'Center Head', align: 'center', type: 'custom', width: 'min-w-[160px]' },
        { key: 'actions', label: 'Actions', align: 'center', type: 'custom', width: 'w-32' }
      ];
    } else {
      return [
        { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
        { key: 'ipa', label: 'IPA & Scheme', align: 'center', type: 'custom', width: 'min-w-[200px]' },
        { key: 'centerName', label: 'SDC Center', align: 'center', type: 'custom', width: 'min-w-[200px]' },
        { key: 'district', label: 'District', align: 'center', width: 'min-w-[110px]', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
        { key: 'sector', label: 'Sector', align: 'center', type: 'custom', width: 'min-w-[150px]' },
        { key: 'proposedStartDate', label: 'Proposed Start Date', align: 'center', width: 'w-32', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px] text-center' },
        { key: 'capacity', label: 'Training Target', align: 'center', type: 'custom', width: 'w-32' },
        { key: 'batches', label: 'Batches Registered', align: 'center', type: 'custom', width: 'w-32' },
        { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'min-w-[140px]' },
        { key: 'centerHead', label: 'Center Head', align: 'center', type: 'custom', width: 'min-w-[190px]' },
        { key: 'actions', label: 'Actions', align: 'center', type: 'custom', width: 'min-w-[300px]' }
      ];
    }
  });

  /** Unique dropdown lists */
  readonly tpList = computed(() => {
    const list = this.sdcService.sdcs();
    return Array.from(new Set(list.map(s => s.tpName).filter(Boolean)));
  });

  readonly schemeList = computed(() => {
    const list = this.sdcService.sdcs();
    return Array.from(new Set(list.map(s => s.scheme).filter(Boolean)));
  });

  readonly districtList = computed(() => {
    const list = this.sdcService.sdcs();
    return Array.from(new Set(list.map(s => s.district).filter(Boolean)));
  });

  readonly hasActiveFilters = computed(() => {
    return (
      this.selectedTp() !== 'ALL' ||
      this.selectedScheme() !== 'ALL' ||
      this.selectedDistrict() !== 'ALL' ||
      this.searchQuery().trim() !== '' ||
      this.activeFilter() !== 'All'
    );
  });

  /** Scheme category in normal case ("Rajvik", "Samarth"), the same way the other tables show it. */
  categoryText(value?: string): string {
    return categoryLabel(value);
  }

  formatStatus(status?: string): string {
    switch (status) {
      case 'APPROVED': return 'Approved';
      case 'PENDING_INSPECTION': return 'Pending Inspection';
      case 'INSPECTION_COMPLETED': return 'Inspection Completed';
      case 'PENDING_APPROVAL': return 'Pending Approval';
      case 'REJECTED': return 'Rejected';
      case 'RETURNED_TO_TP': return 'Returned to TP';
      case 'DRAFT': return 'Draft';
      case 'SUBMITTED': return 'Submitted';
      default: return status || '—';
    }
  }

  readonly filterOptions = computed(() => {
    const all = this.sdcService.sdcs();
    if (this.isAdmin()) {
      return [
        { id: 'All', label: 'All Centers', count: all.length },
        { id: 'APPROVED', label: 'Approved', count: all.filter(s => s.status === 'APPROVED').length },
        { id: 'PENDING_APPROVAL', label: 'Pending Approval', count: all.filter(s => s.status === 'PENDING_APPROVAL').length },
        { id: 'PENDING_INSPECTION', label: 'Pending Inspection', count: all.filter(s => s.status === 'PENDING_INSPECTION').length },
        { id: 'REJECTED', label: 'Rejected', count: all.filter(s => s.status === 'REJECTED' || s.status === 'RETURNED_TO_TP').length }
      ];
    } else {
      return [
        { id: 'All', label: 'All Centers', count: all.length },
        { id: 'APPROVED', label: 'Approved', count: all.filter(s => s.status === 'APPROVED').length },
        { id: 'PENDING', label: 'Pending Inspection', count: all.filter(s => s.status !== 'APPROVED').length }
      ];
    }
  });

  readonly filteredSdcs = computed(() => {
    let list = this.sdcService.sdcs();
    const filter = this.activeFilter();
    const tp = this.selectedTp();
    const scheme = this.selectedScheme();
    const district = this.selectedDistrict();
    const q = this.searchQuery().trim().toLowerCase();

    // 1. Status Pill filter
    if (filter === 'APPROVED') {
      list = list.filter(s => s.status === 'APPROVED');
    } else if (filter === 'PENDING') {
      list = list.filter(s => s.status !== 'APPROVED');
    } else if (filter === 'PENDING_APPROVAL') {
      list = list.filter(s => s.status === 'PENDING_APPROVAL');
    } else if (filter === 'PENDING_INSPECTION') {
      list = list.filter(s => s.status === 'PENDING_INSPECTION');
    } else if (filter === 'REJECTED') {
      list = list.filter(s => s.status === 'REJECTED' || s.status === 'RETURNED_TO_TP');
    }

    // 2. TP Name Filter
    if (tp !== 'ALL') {
      list = list.filter(s => s.tpName === tp);
    }

    // 3. Scheme Filter
    if (scheme !== 'ALL') {
      list = list.filter(s => s.scheme === scheme);
    }

    // 4. District Filter
    if (district !== 'ALL') {
      list = list.filter(s => s.district === district);
    }

    // 5. Search Query
    if (q) {
      list = list.filter(s =>
        (s.tpName && s.tpName.toLowerCase().includes(q)) ||
        (s.sdcName && s.sdcName.toLowerCase().includes(q)) ||
        (s.sdcCode && s.sdcCode.toLowerCase().includes(q)) ||
        (s.district && s.district.toLowerCase().includes(q)) ||
        (s.sector && s.sector.toLowerCase().includes(q)) ||
        (s.scheme && s.scheme.toLowerCase().includes(q))
      );
    }

    return list;
  });

  setFilter(filterId: string): void {
    this.activeFilter.set(filterId);
  }

  resetFilters(): void {
    this.activeFilter.set('All');
    this.selectedTp.set('ALL');
    this.selectedScheme.set('ALL');
    this.selectedDistrict.set('ALL');
    this.searchQuery.set('');
  }

  /** Batches of the center that count against its limit (rejected and cancelled batches do not). */
  batchesRegistered(sdc: SdcRecord): number {
    return this.batchService
      .batches()
      .filter(b => b.sdcId === sdc.id && b.status !== 'REJECTED' && b.status !== 'CANCELLED').length;
  }

  /** Batches the center can run: its target in batches of at most 30 trainees. */
  batchLimit(sdc: SdcRecord): number {
    return maxBatchesFor(sdcTarget(sdc));
  }

  batchLimitReached(sdc: SdcRecord): boolean {
    return this.batchesRegistered(sdc) >= this.batchLimit(sdc);
  }

  openAssignCenterHead(sdc: SdcRecord): void {
    this.assigningSdc.set(sdc);
  }

  /** The user confirmed the details fetched from SSO: that person becomes the Center Head (only one is allowed). */
  confirmCenterHead(person: SsoProfile): void {
    const center = this.assigningSdc();
    if (!center) return;
    const assigned = this.sdcService.assignCenterHead(center.id, {
      ssoId: person.ssoId,
      name: person.name,
      mobile: person.mobile,
      email: person.email,
      designation: person.designation
    });
    this.successMessage.set(
      assigned
        ? `${person.name} is now the Center Head of "${center.sdcName}".`
        : `"${center.sdcName}" already has a Center Head.`
    );
    this.assigningSdc.set(null);
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  createBatch(sdc: SdcRecord): void {
    this.router.navigate(['/batches/create'], {
      queryParams: {
        sdcId: sdc.id,
        sdcCode: sdc.sdcCode,
        sdcName: sdc.sdcName,
        scheme: sdc.scheme,
        sector: sdc.sector
      }
    });
  }

  /** Opens the SDC details already in edit mode. */
  editSdc(sdc: SdcRecord): void {
    this.router.navigate(['/sdcs', sdc.id], { queryParams: { edit: 1 } });
  }

  viewDetails(sdc: SdcRecord): void {
    if (this.isAdmin()) {
      this.router.navigate(['/sdc', sdc.id]);
    } else {
      this.router.navigate(['/sdcs', sdc.id]);
    }
  }
}
