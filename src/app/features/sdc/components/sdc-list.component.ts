import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SdcService } from '../services/sdc.service';
import { SdcRecord } from '../models/sdc.model';
import { AuthService } from '../../../core/auth/auth.service';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../../shared';

@Component({
  selector: 'app-sdc-list',
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
          title="Skill Development Centers (SDC)"
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
            Showing {{ filteredSdcs().length }} {{ filteredSdcs().length === 1 ? 'center' : 'centers' }}
          </div>

        </div>

        <!-- Admin Advanced Filter Bar (TP filter, Scheme filter, District filter, and Search) -->
        @if (isAdmin()) {
          <div class="bg-[#F8FAFC] border border-[#D9E1E7] rounded-lg p-2.5 flex flex-wrap items-center gap-2.5 text-xs shadow-2xs">
            
            <!-- Filter: TP Name -->
            <div class="flex items-center gap-1.5">
              <label class="font-semibold text-slate-700 whitespace-nowrap text-[11px] uppercase tracking-wider">TP Name:</label>
              <select
                [ngModel]="selectedTp()"
                (ngModelChange)="selectedTp.set($event)"
                class="bg-white border border-[#D9E1E7] rounded-[4px] px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#174A6E] max-w-[200px]"
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
                placeholder="Search TP name, SDC, code, sector, district..."
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
            tpName: tpNameTemplate,
            centerName: centerNameTemplate,
            sector: sectorTemplate,
            scheme: schemeTemplate,
            schemeCategory: schemeCategoryTemplate,
            capacity: capacityTemplate,
            status: statusTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: TP Name (First Column for Admin) -->
        <ng-template #tpNameTemplate let-sdc>
          <div class="py-1">
            <div class="font-semibold text-slate-900 text-xs tracking-tight">
              {{ sdc.tpName }}
            </div>
            <div class="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#174A6E]"></span>
              <span>{{ sdc.mouRefNo || 'TP Verified' }}</span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Center Name + District + Code -->
        <ng-template #centerNameTemplate let-sdc>
          <div class="py-0.5">
            <div class="font-semibold text-slate-900 leading-snug text-xs flex items-center gap-1.5 flex-wrap">
              <span>{{ sdc.sdcName }}</span>
              @if (isAdmin()) {
                <span class="font-mono text-[10.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                  {{ sdc.sdcCode }}
                </span>
              }
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5 font-normal flex items-center gap-1">
              <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ sdc.district }}</span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Capacity (For Admin Table) -->
        <ng-template #capacityTemplate let-sdc>
          <div class="text-center font-medium text-slate-800 text-[12.5px]">
            {{ sdc.approval?.approvedTargetCapacity || sdc.sdcCapacity }} <span class="text-[10.5px] text-slate-500">Trainees</span>
          </div>
        </ng-template>

        <!-- Template: Sector -->
        <ng-template #sectorTemplate let-sdc>
          <span class="font-normal text-slate-800 text-[13px]">
            {{ sdc.sector || '—' }}
          </span>
        </ng-template>

        <!-- Template: Scheme -->
        <ng-template #schemeTemplate let-sdc>
          <span class="font-normal text-slate-800 text-[13px]">
            {{ sdc.scheme || '—' }}
          </span>
        </ng-template>

        <!-- Template: Scheme Category -->
        <ng-template #schemeCategoryTemplate let-sdc>
          <span class="font-normal text-slate-800 text-[13px]">
            {{ sdc.schemeCategory || '—' }}
          </span>
        </ng-template>

        <!-- Template: Status (Strictly bold black uppercase text, no box) -->
        <ng-template #statusTemplate let-sdc>
          <div class="flex items-center justify-center">
            <span class="whitespace-nowrap font-bold text-xs tracking-wider uppercase text-black" style="color: #000000 !important; font-weight: bold;">
              {{ formatStatus(sdc.status).toUpperCase() }}
            </span>
          </div>
        </ng-template>

        <!-- Template: Actions (View Details in the exact same vertical column line) -->
        <ng-template #actionsTemplate let-sdc>
          <div class="flex items-center justify-end gap-2 whitespace-nowrap py-0.5">
            
            <!-- Slot 1 (116px fixed container): Either '+ Create Batch' (TP) or 'Approve SDC' (Admin), or empty placeholder -->
            <div class="w-[116px] flex justify-end shrink-0">
              <!-- 1. For TP (SDC Management): If center is APPROVED, show "+ Create Batch" (NOT for Admin) -->
              @if (!isAdmin() && (sdc.status === 'APPROVED' || sdc.status === 'Approved')) {
                <button
                  type="button"
                  (click)="createBatch(sdc)"
                  class="w-full justify-center whitespace-nowrap inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#174A6E] hover:bg-[#123B59] active:bg-[#0E2D44] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
                  title="Create Batch"
                >
                  <span class="text-sm font-bold leading-none">+</span>
                  <span>Create Batch</span>
                </button>
              }

              <!-- 2. For Admin and unapproved centers: Show "Approve SDC" button -->
              @if (isAdmin() && sdc.status !== 'APPROVED' && sdc.status !== 'Approved') {
                <button
                  type="button"
                  (click)="openApproveModal(sdc)"
                  class="w-full justify-center whitespace-nowrap inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#174A6E] hover:bg-[#123B59] active:bg-[#0E2D44] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
                  title="Approve SDC"
                >
                  <svg class="w-3.5 h-3.5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Approve SDC</span>
                </button>
              }
            </div>

            <!-- Slot 2: View Details button (116px fixed width, always in the same vertical line) -->
            <button
              type="button"
              (click)="viewDetails(sdc)"
              class="w-[116px] justify-center whitespace-nowrap inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
              title="View Center Details"
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
    <!-- ADMIN SDC APPROVAL MODAL (Themed in official ISMS blue)                  -->
    <!-- ========================================================================= -->
    @if (approvingSdc(); as targetCenter) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <!-- Modal Header -->
          <div class="bg-[#174A6E] text-white px-5 py-3.5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="font-bold text-sm">Approve Skill Development Center</h3>
            </div>
            <button
              type="button"
              (click)="closeApproveModal()"
              class="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
            >✕</button>
          </div>

          <!-- Modal Body -->
          <div class="p-5 space-y-4 text-xs">
            
            <!-- Center Summary Box -->
            <div class="bg-[#EAF2F6] border border-[#D9E1E7] rounded-lg p-3 space-y-1.5">
              <div class="flex justify-between items-start">
                <span class="text-[11px] font-semibold text-slate-500 uppercase">Training Partner</span>
                <span class="font-mono text-[11px] font-bold text-[#174A6E]">{{ targetCenter.sdcCode }}</span>
              </div>
              <div class="font-bold text-slate-900 text-sm">{{ targetCenter.tpName }}</div>
              <div class="text-slate-700 font-medium pt-1 border-t border-[#D9E1E7]/70 flex items-center justify-between">
                <span>{{ targetCenter.sdcName }}</span>
                <span class="text-slate-500">{{ targetCenter.district }}</span>
              </div>
              <div class="text-[11px] text-slate-500">
                Scheme: <strong class="text-slate-800">{{ targetCenter.scheme }}</strong> • Sector: <strong class="text-slate-800">{{ targetCenter.sector }}</strong>
              </div>
            </div>

            <!-- Approved Target Capacity -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1">
                Approved Target Capacity (Aspirants) <span class="text-rose-500">*</span>
              </label>
              <input
                type="number"
                [(ngModel)]="approvalTargetCapacity"
                min="1"
                max="5000"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A6E]"
                placeholder="Enter approved capacity"
              />
              <span class="text-[10.5px] text-slate-500 mt-0.5 block">Original requested capacity: {{ targetCenter.sdcCapacity }} trainees</span>
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
              <span>Approving this SDC will permit {{ targetCenter.tpName }} to create active batches and mobilize trainees.</span>
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
              <span>Confirm & Approve SDC</span>
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class SdcListComponent {
  readonly sdcService = inject(SdcService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  /** Detect Admin vs TP mode */
  readonly isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'dept_admin' || role === 'super_admin' || (this.router.url.startsWith('/sdc') && !this.router.url.startsWith('/sdcs'));
  });

  activeFilter = signal<string>('All');
  selectedTp = signal<string>('ALL');
  selectedScheme = signal<string>('ALL');
  selectedDistrict = signal<string>('ALL');
  searchQuery = signal<string>('');
  successMessage = signal<string>('');

  /** State for Approval Modal */
  approvingSdc = signal<SdcRecord | null>(null);
  approvalTargetCapacity = 100;
  approvalRemarks = 'Approved in accordance with RSLDC guidelines and verified physical infrastructure.';

  readonly pageSize = 10;

  /** Dynamic Columns based on User Role */
  readonly currentColumns = computed<TableColumn<SdcRecord>[]>(() => {
    if (this.isAdmin()) {
      return [
        { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
        { key: 'tpName', label: 'TP Name', type: 'custom', width: 'min-w-[190px]' },
        { key: 'centerName', label: 'SDC Center', type: 'custom', width: 'min-w-[210px]' },
        { key: 'scheme', label: 'Scheme', type: 'custom' },
        { key: 'schemeCategory', label: 'Scheme Category', align: 'center', type: 'custom', width: 'w-36' },
        { key: 'sector', label: 'Sector', type: 'custom' },
        { key: 'capacity', label: 'Capacity', align: 'center', type: 'custom', width: 'w-28' },
        { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'min-w-[170px]' },
        { key: 'actions', label: 'Actions', align: 'right', type: 'custom', width: 'min-w-[270px]' }
      ];
    } else {
      return [
        { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
        { key: 'sdcCode', label: 'SDC Code', width: 'w-28', cellClass: 'whitespace-nowrap font-mono font-medium text-slate-800' },
        { key: 'centerName', label: 'Center Name', type: 'custom' },
        { key: 'scheme', label: 'Scheme', type: 'custom' },
        { key: 'schemeCategory', label: 'Scheme Category', align: 'center', type: 'custom', width: 'w-36' },
        { key: 'sector', label: 'Sector', type: 'custom' },
        { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'min-w-[170px]' },
        { key: 'actions', label: 'Actions', align: 'right', type: 'custom', width: 'min-w-[270px]' }
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

  openApproveModal(sdc: SdcRecord): void {
    this.approvingSdc.set(sdc);
    this.approvalTargetCapacity = sdc.sdcCapacity || 100;
    this.approvalRemarks = 'Approved in accordance with RSLDC guidelines and verified physical infrastructure.';
  }

  closeApproveModal(): void {
    this.approvingSdc.set(null);
  }

  confirmApproval(): void {
    const center = this.approvingSdc();
    if (!center) return;

    this.sdcService.approveSdc(center.id, this.approvalTargetCapacity, this.approvalRemarks);
    this.successMessage.set(`SDC "${center.sdcName}" (${center.sdcCode}) for ${center.tpName} has been approved successfully!`);
    this.closeApproveModal();

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

  viewDetails(sdc: SdcRecord): void {
    if (this.isAdmin()) {
      this.router.navigate(['/sdc', sdc.id]);
    } else {
      this.router.navigate(['/sdcs', sdc.id]);
    }
  }
}
