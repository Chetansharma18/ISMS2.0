import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SdcService } from '../services/sdc.service';
import { SdcRecord } from '../models/sdc.model';
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

        <!-- Filter Controls Toolbar -->
        <div class="flex items-center justify-between gap-3 pt-1">
          
          <!-- Status Filter Badges / Pills -->
          <div class="flex items-center gap-1.5 flex-wrap">
            @for (f of filterOptions(); track f.id) {
              <button
                type="button"
                (click)="setFilter(f.id)"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border shadow-2xs active:scale-95"
                [class.bg-[#0F172A]]="activeFilter() === f.id"
                [class.text-white]="activeFilter() === f.id"
                [class.border-[#0F172A]]="activeFilter() === f.id"
                [class.bg-white]="activeFilter() !== f.id"
                [class.text-slate-600]="activeFilter() !== f.id"
                [class.border-slate-300]="activeFilter() !== f.id"
                [class.hover:bg-slate-50]="activeFilter() !== f.id"
                [class.hover:text-slate-900]="activeFilter() !== f.id"
              >
                <span>{{ f.label }}</span>
                <span
                  class="px-1.5 py-0.2 rounded-full text-[10.5px] font-bold"
                  [class.bg-white/20]="activeFilter() === f.id"
                  [class.text-white]="activeFilter() === f.id"
                  [class.bg-slate-100]="activeFilter() !== f.id"
                  [class.text-slate-600]="activeFilter() !== f.id"
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

        <!-- SDC Table via Reusable TableComponent -->
        <app-table
          [columns]="sdcColumns"
          [data]="filteredSdcs()"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="centers"
          emptyMessage="No Skill Development Centers available."
          [customTemplates]="{
            centerName: centerNameTemplate,
            sector: sectorTemplate,
            scheme: schemeTemplate,
            schemeCategory: schemeCategoryTemplate,
            status: statusTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Center Name + District -->
        <ng-template #centerNameTemplate let-sdc>
          <div class="py-0.5">
            <div class="font-semibold text-slate-900 leading-snug text-xs">
              {{ sdc.sdcName }}
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

        <!-- Template: Sector (Simple normal text, NOT in a box, NOT colored) -->
        <ng-template #sectorTemplate let-sdc>
          <span class="font-normal text-slate-800 text-[13px]">
            {{ sdc.sector || '—' }}
          </span>
        </ng-template>

        <!-- Template: Scheme (Simple normal text, NOT in a box, NOT colored) -->
        <ng-template #schemeTemplate let-sdc>
          <span class="font-normal text-slate-800 text-[13px]">
            {{ sdc.scheme || '—' }}
          </span>
        </ng-template>

        <!-- Template: Scheme Category (Simple normal text, NOT in a box, NOT colored) -->
        <ng-template #schemeCategoryTemplate let-sdc>
          <span class="font-normal text-slate-800 text-[13px]">
            {{ sdc.schemeCategory || '—' }}
          </span>
        </ng-template>

        <!-- Template: Status Badge (Matching Batch Management status styling) -->
        <ng-template #statusTemplate let-sdc>
          <div class="flex items-center justify-center">
            @if (sdc.status === 'APPROVED') {
              <span class="whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-300 tracking-wider uppercase">
                APPROVED
              </span>
            } @else if (sdc.status === 'PENDING_INSPECTION') {
              <span class="whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 tracking-wider uppercase">
                PENDING INSPECTION
              </span>
            } @else if (sdc.status === 'PENDING_APPROVAL') {
              <span class="whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-300 tracking-wider uppercase">
                PENDING APPROVAL
              </span>
            } @else if (sdc.status === 'REJECTED') {
              <span class="whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300 tracking-wider uppercase">
                REJECTED
              </span>
            } @else if (sdc.status === 'RETURNED_TO_TP') {
              <span class="whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-300 tracking-wider uppercase">
                RETURNED TO TP
              </span>
            } @else {
              <span class="whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 tracking-wider uppercase">
                {{ sdc.status || 'DRAFT' }}
              </span>
            }
          </div>
        </ng-template>

        <!-- Template: Actions (Create Batch + View Details with generous space and centered alignment) -->
        <ng-template #actionsTemplate let-sdc>
          <div class="flex items-center justify-center gap-2.5 whitespace-nowrap py-0.5">
            @if (sdc.status === 'APPROVED') {
              <button
                type="button"
                (click)="createBatch(sdc)"
                class="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
                title="Create Batch"
              >
                <span class="text-sm font-bold leading-none">+</span>
                <span>Create Batch</span>
              </button>
            }

            <button
              type="button"
              (click)="viewDetails(sdc)"
              class="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
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
  `
})
export class SdcListComponent {
  readonly sdcService = inject(SdcService);
  readonly router = inject(Router);

  activeFilter = signal<string>('All');
  readonly pageSize = 10;

  readonly sdcColumns: TableColumn<SdcRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
    { key: 'sdcCode', label: 'SDC Code', width: 'w-28', cellClass: 'whitespace-nowrap font-mono font-medium text-slate-800' },
    { key: 'centerName', label: 'Center Name', type: 'custom' },
    { key: 'scheme', label: 'Scheme', type: 'custom' },
    { key: 'schemeCategory', label: 'Scheme Category', align: 'center', type: 'custom', width: 'w-36' },
    { key: 'sector', label: 'Sector', type: 'custom' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'min-w-[170px]' },
    { key: 'actions', label: 'Actions', align: 'center', type: 'custom', width: 'min-w-[270px]' }
  ];

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
    return [
      { id: 'All', label: 'All Centers', count: all.length },
      { id: 'APPROVED', label: 'Approved', count: all.filter(s => s.status === 'APPROVED').length },
      { id: 'PENDING', label: 'Pending Inspection', count: all.filter(s => s.status !== 'APPROVED').length }
    ];
  });

  readonly filteredSdcs = computed(() => {
    let list = this.sdcService.sdcs();
    const filter = this.activeFilter();

    if (filter === 'APPROVED') {
      list = list.filter(s => s.status === 'APPROVED');
    } else if (filter === 'PENDING') {
      list = list.filter(s => s.status !== 'APPROVED');
    }

    return list;
  });

  setFilter(filterId: string): void {
    this.activeFilter.set(filterId);
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
    this.router.navigate(['/sdc', sdc.id]);
  }
}
