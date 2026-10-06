import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
    <div class="w-full min-h-full bg-white text-[#1F2933] font-sans">
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
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-[#0c2d4e] border border-slate-300 text-xs font-medium shadow-xs">
            <span class="text-slate-600">Total Submissions:</span>
            <span class="font-bold text-[#0c2d4e]">{{ totalSubmissionsCount() }}</span>
          </div>
        </app-page-header>

        <!-- Top Toolbar: Status summary & Sanction Order Action Button -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2 text-xs text-slate-700">
            <span class="flex h-2.5 w-2.5 relative">
              <span [class.animate-ping]="allReviewed()" class="absolute inline-flex h-full w-full rounded-full opacity-75" [class.bg-emerald-400]="allReviewed()" [class.bg-amber-400]="!allReviewed()"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5" [class.bg-emerald-600]="allReviewed()" [class.bg-amber-500]="!allReviewed()"></span>
            </span>
            <span class="font-medium text-slate-600">Review Status:</span>
            <span class="font-semibold text-slate-900">
              {{ countReviewed() }} of {{ totalSubmissionsCount() }} Applications Processed
            </span>
          </div>

          <div class="flex items-center gap-2.5">
            @if (!allReviewed()) {
              <span class="text-[11px] text-slate-500 bg-amber-50 text-amber-800 px-2.5 py-1 rounded border border-amber-200 font-normal">
                Requires all applications to be Reviewed (Accepted or Rejected) to activate Sanction Order
              </span>
            } @else {
              <label
                class="px-3.5 py-1.5 rounded text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Upload signed Sanction Order Document (PDF)"
              >
                <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{{ uploadedSanctionFileName() ? uploadedSanctionFileName() : 'Upload Sanction Order' }}</span>
                <input type="file" (change)="onUploadSanctionOrder($event)" class="hidden" accept=".pdf" />
              </label>
            }

            <button
              type="button"
              (click)="openSanctionOrder()"
              [disabled]="!allReviewed()"
              class="px-3.5 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-2 border shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              [class.bg-emerald-700]="allReviewed()"
              [class.text-white]="allReviewed()"
              [class.border-emerald-800]="allReviewed()"
              [class.hover:bg-emerald-800]="allReviewed()"
              [class.bg-slate-100]="!allReviewed()"
              [class.text-slate-400]="!allReviewed()"
              [class.border-slate-200]="!allReviewed()"
            >
              @if (!isSubmitted()) {
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Sanction Order</span>
              } @else {
                <span>Generated IPA</span>
              }
            </button>
          </div>
        </div>

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
            class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#07243c] !text-white shadow-2xs transition-colors font-semibold text-xs whitespace-nowrap cursor-pointer"
            style="color: #ffffff !important;"
          >
            <span style="color: #ffffff !important;">Review</span>
            <span style="color: #ffffff !important;">&rarr;</span>
          </a>
        </ng-template>

      </div>
    </div>
  `
})
export class ApplicantSubmissionsComponent {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
    { key: 'action', label: 'Action', align: 'center', width: 'w-32', type: 'custom' }
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
  countReviewed = computed(() => this.responses().filter(r => r.status === 'APPROVED' || r.status === 'REJECTED').length);

  allReviewed = computed(() => this.responses().length > 0 && this.responses().every(r => r.status === 'APPROVED' || r.status === 'REJECTED'));
  isSubmitted = computed(() => this.eoiStateService.isSanctionSubmitted(this.schemeId()));
  uploadedSanctionFileName = signal<string>('');

  onUploadSanctionOrder(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadedSanctionFileName.set(file.name);
      this.eoiStateService.markSanctionSubmitted(this.schemeId());
      input.value = '';
    }
  }

  openSanctionOrder(): void {
    if (this.allReviewed()) {
      this.router.navigate(['/admin/eoi-sanction-editor', this.schemeId()]);
    }
  }

  filteredResponses = computed(() => {
    const filter = this.selectedFilter();
    const list = this.responses();
    if (filter === 'ALL') return list;
    return list.filter(r => r.status === filter);
  });
}
