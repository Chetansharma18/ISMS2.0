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
      <div class="p-4 sm:p-5 space-y-4 font-sans">
        
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
              <span class="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-medium">
                &check; All Applications Scrutinized ({{ countApproved() }} Accepted, {{ countRejected() }} Rejected) &bull; Sanction Ready
              </span>
            }

            <button
              type="button"
              (click)="openSanctionOrder()"
              [disabled]="!allReviewed()"
              class="px-3.5 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-2 border shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              [class.bg-emerald-700]="allReviewed()"
              [class.text-white]="allReviewed()"
              [class.border-emerald-800]="allReviewed()"
              [class.hover:bg-emerald-800]="allReviewed()"
              [class.bg-slate-100]="!allReviewed()"
              [class.text-slate-400]="!allReviewed()"
              [class.border-slate-200]="!allReviewed()"
            >
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Sanction Order</span>
            </button>
          </div>
        </div>

        <!-- Main Submissions Table via Reusable TableComponent -->
        <app-table
          [columns]="submissionColumns"
          [data]="responses()"
          [pagination]="true"
          [pageSize]="10"
          emptyMessage="No applicant submissions found."
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
  private router = inject(Router);

  responses = signal<ApplicantResponse[]>([]);
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

  totalSubmissionsCount = computed(() => this.responses().length);
  countApproved = computed(() => this.responses().filter(r => r.status === 'APPROVED').length);
  countRejected = computed(() => this.responses().filter(r => r.status === 'REJECTED').length);
  countPending = computed(() => this.responses().filter(r => r.status === 'UNDER_SCRUTINY').length);
  countReviewed = computed(() => this.responses().filter(r => r.status === 'APPROVED' || r.status === 'REJECTED').length);

  allReviewed = computed(() => this.responses().length > 0 && this.responses().every(r => r.status === 'APPROVED' || r.status === 'REJECTED'));

  openSanctionOrder(): void {
    if (this.allReviewed()) {
      this.router.navigate(['/admin/sanction-order', this.schemeId()]);
    }
  }
}


