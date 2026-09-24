import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../../../shared';

@Component({
  selector: 'app-department-eoi-view',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="w-full min-h-full bg-[#F5F7F9] text-[#1F2933] font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="EOI Responses"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'EOI Responses' }]"
        >
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white/15 text-white border border-white/20 text-xs font-normal">
            <span>Published Schemes:</span>
            <span class="font-semibold">{{ schemes().length }}</span>
          </div>
        </app-page-header>

        <!-- Main Schemes Table via Reusable TableComponent -->
        <app-table
          [columns]="schemeColumns"
          [data]="schemes()"
          [pagination]="true"
          [pageSize]="10"
          [customTemplates]="{
            schemeTitle: schemeTitleTemplate,
            responseCount: responseCountTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #schemeTitleTemplate let-scheme>
          <div class="font-medium text-[#1F2933] text-[13px] leading-snug">
            {{ scheme.schemeTitle }}
          </div>
          <div class="text-[11px] font-mono text-[#7A8792] mt-0.5">
            Ref: {{ scheme.refNo }}
          </div>
        </ng-template>

        <ng-template #responseCountTemplate let-scheme>
          <span class="font-medium text-[#1F2933] text-[13px]">{{ scheme.responseCount }}</span>
          <span class="text-[#5F6B76] text-[11px] ml-1">EOIs</span>
        </ng-template>

        <ng-template #actionTemplate let-scheme>
          @if (scheme.status === 'Closed') {
            <a
              [routerLink]="['/admin/responses', scheme.id]"
              class="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-[4px] bg-[#EAF2F6] hover:bg-[#d5e6f0] text-[#174A6E] border border-[#D9E1E7] transition-colors font-medium text-[13px] cursor-pointer"
            >
              <span>View List</span>
            </a>
          } @else {
            <div class="relative group inline-block">
              <button
                type="button"
                disabled
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-[#F5F7F9] text-[#7A8792] border border-[#D9E1E7] text-[13px] font-normal cursor-not-allowed opacity-60"
              >
                <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>View List</span>
              </button>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-800 text-white text-[10.5px] rounded px-2 py-0.5 whitespace-nowrap z-30 shadow-md font-normal">
                Submissions unlock upon Date of closing
              </div>
            </div>
          }
        </ng-template>

      </div>
    </div>
  `
})
export class DepartmentEoiViewComponent {
  private eoiStateService = inject(EoiStateService);
  schemes = signal<Scheme[]>([]);

  readonly schemeColumns: TableColumn<Scheme>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'schemeTitle', label: 'EOI Ref No. & Scheme Name', width: 'min-w-[280px]', type: 'custom' },
    { key: 'category', label: 'Category', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'dateOfOpening', label: 'Date of Opening', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'dateOfClosing', label: 'Date of Closing', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'status', label: 'Status', align: 'center', type: 'status' },
    { key: 'responseCount', label: 'No. of Responses', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-24', type: 'custom' }
  ];

  constructor() {
    this.eoiStateService.getSchemes().subscribe(data => {
      this.schemes.set(data);
    });
  }
}
