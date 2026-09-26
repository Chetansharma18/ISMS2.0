import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SdcService } from '../services/sdc.service';
import { SdcRecord } from '../models/sdc.model';
import {
  PageHeaderComponent,
  TableComponent,
  ButtonComponent,
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
    TableComponent,
    ButtonComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Skill Development Centers (SDC)"
        >
          <button
            type="button"
            (click)="router.navigate(['/sdc/create'])"
            class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-white text-[#174A6E] hover:bg-slate-100 active:scale-95 text-xs font-semibold shadow-xs transition-all cursor-pointer select-none"
          >
            <span class="text-sm font-bold leading-none">+</span>
            <span>Register New SDC</span>
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

          <!-- Search Input with Search Icon & Clear Button -->
          <div class="relative w-full sm:w-72">
            <svg class="w-3.5 h-3.5 text-[#7A8792] absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search SDC Code, Center, TP, District..."
              class="w-full pl-8 pr-7 py-1.5 text-[13px] bg-white border border-[#D9E1E7] rounded-[4px] text-[#1F2933] placeholder:text-[#7A8792] focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E] transition-colors font-normal"
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

        <!-- SDC Table via Reusable TableComponent -->
        <app-table
          [columns]="sdcColumns"
          [data]="filteredSdcs()"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="centers"
          emptyMessage="No Skill Development Centers match your search criteria."
          [customTemplates]="{
            centerName: centerNameTemplate,
            scheme: schemeTemplate,
            status: statusTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Center Name + District -->
        <ng-template #centerNameTemplate let-sdc>
          <div>
            <div class="font-semibold text-slate-900 leading-snug">
              {{ sdc.sdcName }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-normal">
              {{ sdc.district }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Scheme Tag -->
        <ng-template #schemeTemplate let-sdc>
          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {{ sdc.scheme }}
          </span>
        </ng-template>

        <!-- Template: Status Badge -->
        <ng-template #statusTemplate let-sdc>
          @if (sdc.status === 'APPROVED') {
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-[#E6F9F0] text-[#15803D] border border-[#86EFAC] tracking-wider uppercase">
              APPROVED
            </span>
          } @else {
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] tracking-wider uppercase">
              PENDING INSPECTION
            </span>
          }
        </ng-template>

        <!-- Template: Actions (Create Batch + View Details) -->
        <ng-template #actionsTemplate let-sdc>
          <div class="inline-flex items-center gap-2 justify-end">
            @if (sdc.status === 'APPROVED') {
              <app-button
                variant="primary"
                size="sm"
                (btnClick)="createBatch(sdc)"
                title="Create Batch"
              >
                <span class="text-sm font-bold leading-none">+</span>
                <span>Create Batch</span>
              </app-button>
            }

            <app-button
              variant="pdf-view"
              size="sm"
              (btnClick)="viewDetails(sdc)"
              title="View Center Details"
            >
              View Details
            </app-button>
          </div>
        </ng-template>

      </div>
    </div>
  `
})
export class SdcListComponent {
  readonly sdcService = inject(SdcService);
  readonly router = inject(Router);

  searchQuery = '';
  activeFilter = signal<string>('All');
  readonly pageSize = 10;

  readonly sdcColumns: TableColumn<SdcRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'sdcCode', label: 'SDC Code', width: 'w-32', cellClass: 'whitespace-nowrap font-mono font-medium text-slate-700' },
    { key: 'centerName', label: 'Center Name', type: 'custom' },
    { key: 'tpName', label: 'TP / PIA', cellClass: 'font-normal text-slate-700 text-xs' },
    { key: 'scheme', label: 'Scheme', align: 'center', type: 'custom', width: 'w-28' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'w-36' },
    { key: 'actions', label: 'Actions', align: 'right', type: 'custom', width: 'w-56' }
  ];

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

    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(
        s =>
          s.sdcName.toLowerCase().includes(query) ||
          s.sdcCode.toLowerCase().includes(query) ||
          s.district.toLowerCase().includes(query) ||
          s.scheme.toLowerCase().includes(query) ||
          s.tpName.toLowerCase().includes(query)
      );
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
        scheme: sdc.scheme
      }
    });
  }

  viewDetails(sdc: SdcRecord): void {
    this.router.navigate(['/sdc', sdc.id]);
  }
}
