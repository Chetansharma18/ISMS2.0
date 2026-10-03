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
              (click)="openSanctionModal()"
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

    <!-- Sanction Order Modal -->
    @if (showSanctionModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
        role="dialog"
        aria-modal="true"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-300 overflow-hidden animate-in zoom-in-95 duration-150">
          <div class="h-1 bg-emerald-600"></div>

          <div class="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-medium text-xs">
                &check;
              </div>
              <h3 class="text-sm font-semibold text-slate-800">
                Official Sanction Order Generation
              </h3>
            </div>

            <button
              type="button"
              (click)="closeSanctionModal()"
              class="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer p-1"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          <div class="p-5 space-y-3.5 text-xs">
            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 leading-relaxed font-normal">
              All <strong>{{ totalSubmissionsCount() }} applications</strong> under this scheme have completed scrutiny:
              <strong>{{ countApproved() }} Accepted</strong> and <strong>{{ countRejected() }} Rejected</strong>.
            </div>

            <div class="space-y-1.5 text-slate-700">
              <p><span class="font-semibold text-slate-800">Sanction Order Ref:</span> <span class="font-mono">RSLDC/SANCTION/2026/MMKVY-01</span></p>
              <p><span class="font-semibold text-slate-800">Sanctioned Training Partners (Accepted):</span> {{ countApproved() }} Entities</p>
              <p><span class="font-semibold text-slate-800">Date of Issuance:</span> {{ currentDate }}</p>
            </div>

            <div class="p-3 rounded bg-slate-50 border border-slate-200 text-slate-600 font-normal">
              Clicking below will issue the official Sanction Order document for accepted entities and notify training partners.
            </div>
          </div>

          <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              type="button"
              (click)="closeSanctionModal()"
              class="px-3 py-1.5 border border-slate-200 rounded text-slate-700 hover:bg-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="downloadSanctionOrder()"
              class="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Issue &amp; Download Sanction Order</span>
              <span>&darr;</span>
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class ApplicantSubmissionsComponent {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);

  responses = signal<ApplicantResponse[]>([]);
  schemeId = signal<string>('');
  showSanctionModal = signal<boolean>(false);
  currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

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

  openSanctionModal(): void {
    if (this.allReviewed()) {
      this.showSanctionModal.set(true);
    }
  }

  closeSanctionModal(): void {
    this.showSanctionModal.set(false);
  }

  downloadSanctionOrder(): void {
    alert(`Sanction Order RSLDC/SANCTION/2026/MMKVY-01 generated and downloaded successfully!`);
    this.closeSanctionModal();
  }
}


