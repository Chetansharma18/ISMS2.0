import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EoiStateService, ApplicantResponse } from '../../services/eoi-state.service';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../../../shared';

@Component({
  selector: 'app-applicant-submissions',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="w-full min-h-full bg-[#F5F7F9] text-[#1F2933] font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Applicant Submissions"
          [breadcrumbs]="[
            { label: 'Home', url: '/' },
            { label: 'EOI Responses', url: '/admin/eoi-view' },
            { label: 'Applicant Submissions' }
          ]"
          backUrl="/admin/eoi-view"
          backTitle="Back to EOI Responses"
        >
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white/15 text-white border border-white/20 text-xs font-normal">
            <span>Total Submissions:</span>
            <span class="font-semibold">{{ totalSubmissionsCount() }}</span>
          </div>
        </app-page-header>

        <!-- Filter Buttons Bar (Pills matching user side) -->
        <div class="flex items-center gap-1.5 flex-wrap pt-1">
          <button
            type="button"
            (click)="setFilter('ALL')"
            class="px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
            [class.bg-[#174A6E]]="selectedFilter() === 'ALL'"
            [class.text-white]="selectedFilter() === 'ALL'"
            [class.border-[#174A6E]]="selectedFilter() === 'ALL'"
            [class.bg-white]="selectedFilter() !== 'ALL'"
            [class.text-[#5F6B76]]="selectedFilter() !== 'ALL'"
            [class.border-[#D9E1E7]]="selectedFilter() !== 'ALL'"
            [class.hover:bg-[#EAF2F6]]="selectedFilter() !== 'ALL'"
            [class.hover:text-[#174A6E]]="selectedFilter() !== 'ALL'"
          >
            <span>All</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="selectedFilter() === 'ALL'"
              [class.text-white]="selectedFilter() === 'ALL'"
              [class.bg-[#F5F7F9]]="selectedFilter() !== 'ALL'"
              [class.text-[#5F6B76]]="selectedFilter() !== 'ALL'"
            >
              {{ totalSubmissionsCount() }}
            </span>
          </button>

          <button
            type="button"
            (click)="setFilter('UNDER_SCRUTINY')"
            class="px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
            [class.bg-[#174A6E]]="selectedFilter() === 'UNDER_SCRUTINY'"
            [class.text-white]="selectedFilter() === 'UNDER_SCRUTINY'"
            [class.border-[#174A6E]]="selectedFilter() === 'UNDER_SCRUTINY'"
            [class.bg-white]="selectedFilter() !== 'UNDER_SCRUTINY'"
            [class.text-[#5F6B76]]="selectedFilter() !== 'UNDER_SCRUTINY'"
            [class.border-[#D9E1E7]]="selectedFilter() !== 'UNDER_SCRUTINY'"
            [class.hover:bg-[#EAF2F6]]="selectedFilter() !== 'UNDER_SCRUTINY'"
            [class.hover:text-[#174A6E]]="selectedFilter() !== 'UNDER_SCRUTINY'"
          >
            <span>Under Scrutiny</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="selectedFilter() === 'UNDER_SCRUTINY'"
              [class.text-white]="selectedFilter() === 'UNDER_SCRUTINY'"
              [class.bg-[#F5F7F9]]="selectedFilter() !== 'UNDER_SCRUTINY'"
              [class.text-[#5F6B76]]="selectedFilter() !== 'UNDER_SCRUTINY'"
            >
              {{ countPending() }}
            </span>
          </button>

          <button
            type="button"
            (click)="setFilter('APPROVED')"
            class="px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
            [class.bg-[#174A6E]]="selectedFilter() === 'APPROVED'"
            [class.text-white]="selectedFilter() === 'APPROVED'"
            [class.border-[#174A6E]]="selectedFilter() === 'APPROVED'"
            [class.bg-white]="selectedFilter() !== 'APPROVED'"
            [class.text-[#5F6B76]]="selectedFilter() !== 'APPROVED'"
            [class.border-[#D9E1E7]]="selectedFilter() !== 'APPROVED'"
            [class.hover:bg-[#EAF2F6]]="selectedFilter() !== 'APPROVED'"
            [class.hover:text-[#174A6E]]="selectedFilter() !== 'APPROVED'"
          >
            <span>Accepted</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="selectedFilter() === 'APPROVED'"
              [class.text-white]="selectedFilter() === 'APPROVED'"
              [class.bg-[#F5F7F9]]="selectedFilter() !== 'APPROVED'"
              [class.text-[#5F6B76]]="selectedFilter() !== 'APPROVED'"
            >
              {{ countApproved() }}
            </span>
          </button>

          <button
            type="button"
            (click)="setFilter('REJECTED')"
            class="px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
            [class.bg-[#174A6E]]="selectedFilter() === 'REJECTED'"
            [class.text-white]="selectedFilter() === 'REJECTED'"
            [class.border-[#174A6E]]="selectedFilter() === 'REJECTED'"
            [class.bg-white]="selectedFilter() !== 'REJECTED'"
            [class.text-[#5F6B76]]="selectedFilter() !== 'REJECTED'"
            [class.border-[#D9E1E7]]="selectedFilter() !== 'REJECTED'"
            [class.hover:bg-[#EAF2F6]]="selectedFilter() !== 'REJECTED'"
            [class.hover:text-[#174A6E]]="selectedFilter() !== 'REJECTED'"
          >
            <span>Rejected</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="selectedFilter() === 'REJECTED'"
              [class.text-white]="selectedFilter() === 'REJECTED'"
              [class.bg-[#F5F7F9]]="selectedFilter() !== 'REJECTED'"
              [class.text-[#5F6B76]]="selectedFilter() !== 'REJECTED'"
            >
              {{ countRejected() }}
            </span>
          </button>
        </div>

        <!-- Main Submissions Table via Reusable TableComponent -->
        <app-table
          [columns]="submissionColumns"
          [data]="filteredResponses()"
          [pagination]="true"
          [pageSize]="10"
          emptyMessage="No submissions found matching the selected filter."
          [customTemplates]="{
            anonymousLabel: applicantTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #applicantTemplate let-item>
          <div class="font-medium text-[#1F2933] text-[13px]">
            {{ item.anonymousLabel }}
          </div>
          <div class="text-[11px] font-mono text-[#7A8792] mt-0.5">
            {{ item.regNumber }}
          </div>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <a
            [routerLink]="['/admin/review', item.id]"
            class="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-[4px] bg-[#EAF2F6] hover:bg-[#d5e6f0] text-[#174A6E] border border-[#D9E1E7] transition-colors font-medium text-[13px] cursor-pointer"
          >
            <span>Review &rarr;</span>
          </a>
        </ng-template>

      </div>
    </div>
  `
})
export class ApplicantSubmissionsComponent {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);

  responses = signal<ApplicantResponse[]>([]);
  selectedFilter = signal<'ALL' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED'>('ALL');
  schemeId = signal<string>('');

  readonly submissionColumns: TableColumn<ApplicantResponse>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'anonymousLabel', label: 'Applicant / Legal Firm Name', width: 'min-w-[260px]', type: 'custom' },
    { key: 'submissionDate', label: 'Submitted Date', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      type: 'status',
      format: (val) => val === 'UNDER_SCRUTINY' ? 'Pending Review' : val === 'APPROVED' ? 'Accepted' : 'Rejected'
    },
    { key: 'action', label: 'Action', align: 'center', width: 'w-24', type: 'custom' }
  ];

  constructor() {
    this.route.params.subscribe(params => {
      const sId = params['schemeId'] || 'ALL';
      this.schemeId.set(sId);
      this.loadResponses(sId);
    });
  }

  loadResponses(sId: string): void {
    this.eoiStateService.getResponses(sId).subscribe(data => {
      this.responses.set(data);
    });
  }

  setFilter(filter: 'ALL' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED'): void {
    this.selectedFilter.set(filter);
  }

  totalSubmissionsCount = computed(() => this.responses().length);

  countPending = computed(() => this.responses().filter(r => r.status === 'UNDER_SCRUTINY').length);
  countApproved = computed(() => this.responses().filter(r => r.status === 'APPROVED').length);
  countRejected = computed(() => this.responses().filter(r => r.status === 'REJECTED').length);

  filteredResponses = computed(() => {
    const filter = this.selectedFilter();
    const list = this.responses();
    if (filter === 'ALL') return list;
    return list.filter(r => r.status === filter);
  });
}
