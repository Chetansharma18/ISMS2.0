import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
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
    <div class="w-full min-h-full bg-white text-text-primary font-sans">
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
              <span class="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-1 rounded border border-amber-200 font-normal">
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
              class="px-3.5 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-2 border shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
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

        <!-- Filter Buttons Bar & Download All Action (Below Generated IPA) -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              (click)="setFilter('ALL')"
              class="px-2.5 py-1 rounded-sm text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
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
              class="px-2.5 py-1 rounded-sm text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
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
              class="px-2.5 py-1 rounded-sm text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
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
              class="px-2.5 py-1 rounded-sm text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
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

          <!-- Download Actions: ZIP and PDF options -->
          <div class="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              (click)="downloadAllZip()"
              [disabled]="filteredResponses().length === 0 || isDownloadingAll()"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[#0B3558] bg-[#0B3558] hover:bg-[#07243c] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              [title]="'Download all generated documents as a ZIP archive for ' + (selectedFilter() === 'APPROVED' ? 'Accepted' : selectedFilter() === 'REJECTED' ? 'Rejected' : selectedFilter() === 'UNDER_SCRUTINY' ? 'Under Scrutiny' : 'All') + ' applicants'"
            >
              @if (isDownloadingAll() && downloadType() === 'zip') {
                <svg class="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating ZIP...</span>
              } @else {
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Download All (ZIP)</span>
              }
            </button>

            <button
              type="button"
              (click)="downloadAllPdf()"
              [disabled]="filteredResponses().length === 0 || isDownloadingAll()"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-[#0B3558] hover:text-[#07243c] text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              [title]="'Download all generated documents in a single PDF for ' + (selectedFilter() === 'APPROVED' ? 'Accepted' : selectedFilter() === 'REJECTED' ? 'Rejected' : selectedFilter() === 'UNDER_SCRUTINY' ? 'Under Scrutiny' : 'All') + ' applicants'"
            >
              @if (isDownloadingAll() && downloadType() === 'pdf') {
                <svg class="w-3.5 h-3.5 animate-spin text-[#0B3558]" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating PDF...</span>
              } @else {
                <svg class="w-3.5 h-3.5 text-[#0B3558]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download All (PDF)</span>
              }
            </button>
          </div>
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
          <div class="font-medium text-text-primary text-[13px]">
            {{ item.anonymousLabel }}
          </div>
          <div class="text-[11px] font-mono text-text-muted mt-0.5">
            {{ item.regNumber }}
          </div>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <a
            [routerLink]="['/admin/review', item.id]"
            class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#07243c] text-white! shadow-2xs transition-colors font-semibold text-xs whitespace-nowrap cursor-pointer"
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
  isDownloadingAll = signal<boolean>(false);
  downloadType = signal<'zip' | 'pdf'>('zip');

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

  /**
   * Renders a single official applicant IPA or review outcome document on a given PDF instance page
   */
  private renderApplicantPdfPage(
    pdf: jsPDF,
    app: ApplicantResponse,
    currentSchemeTitle: string,
    today: string,
    currentPage: number,
    totalPages: number
  ): void {
    const isApproved = app.status === 'APPROVED';
    const isRejected = app.status === 'REJECTED';

    // Outer Border framing
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.35);
    pdf.rect(10, 10, 190, 277);

    // Header banner (Navy)
    pdf.setFillColor(11, 53, 88);
    pdf.rect(10, 10, 190, 26, 'F');
    pdf.setFillColor(234, 179, 8);
    pdf.rect(10, 36, 190, 1.8, 'F');

    // Header Text
    pdf.setTextColor(254, 240, 138);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text('GOVERNMENT OF RAJASTHAN', 105, 17, { align: 'center' });

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9.5);
    pdf.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)', 105, 23, { align: 'center' });

    pdf.setTextColor(186, 230, 253);
    pdf.setFontSize(7.5);
    pdf.text('INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)', 105, 29, { align: 'center' });

    // Document Title Box
    let y = 46;
    const docTitle = isApproved
      ? 'IN-PRINCIPLE APPROVAL (IPA) LETTER'
      : isRejected
      ? 'APPLICATION REVIEW & SCRUTINY OUTCOME'
      : 'APPLICATION SUBMISSION DOSSIER SUMMARY';

    pdf.setTextColor(11, 53, 88);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(docTitle, 15, y);

    y += 5.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Scheme: ${currentSchemeTitle} | EOI Ref: ${app.eoiRefNo || this.schemeId()}`, 15, y);

    // Metadata grid
    y += 6;
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(15, y, 180, 22, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text('APPLICATION ID', 20, y + 6);
    pdf.text('APPLICANT / LEGAL FIRM', 75, y + 6);
    pdf.text('ISSUE DATE', 145, y + 6);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(app.id, 20, y + 13);
    pdf.text(app.anonymousLabel || 'Registered Agency', 75, y + 13);
    pdf.text(today, 145, y + 13);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Reg No: ${app.regNumber}`, 75, y + 18);

    // Subject & Recipient
    y += 30;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('To,', 15, y);
    y += 5;
    pdf.text(app.anonymousLabel || 'Authorized Signatory / Partner', 15, y);
    y += 4.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Registration Number: ${app.regNumber}`, 15, y);
    y += 4.5;
    pdf.text('Rajasthan, India', 15, y);

    y += 8;
    pdf.setFillColor(241, 245, 249);
    pdf.rect(15, y, 180, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(11, 53, 88);
    pdf.text(
      isApproved
        ? 'Subject: In-Principle Approval (IPA) for Allocation of Physical Training Targets FY 2026-27'
        : isRejected
        ? 'Subject: Intimation of Application Scrutiny & Evaluation Outcome'
        : 'Subject: Acknowledgment & Dossier Summary for EOI Application',
      18,
      y + 5.5
    );

    // Body Content
    y += 14;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(30, 41, 59);

    if (isApproved) {
      const bodyText = `With reference to your proposal submitted under EOI Ref No. ${app.eoiRefNo || this.schemeId()}, the State Level Scrutiny & Empanelment Committee has reviewed and scrutinized the technical documentation, past training track record, and financial turnover submitted by your organization.\n\n` +
        `The Competent Authority is pleased to convey In-Principle Approval (IPA) to ${app.anonymousLabel} for imparting skill training under ${currentSchemeTitle} for Financial Year 2026-27.`;
      const splitBody = pdf.splitTextToSize(bodyText, 180);
      pdf.text(splitBody, 15, y);
      y += splitBody.length * 4.5 + 4;

      // Details Table
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(187, 247, 208);
      pdf.roundedRect(15, y, 180, 30, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(22, 101, 52);
      pdf.text('APPROVED SANCTION & TARGET PARAMETERS:', 20, y + 6);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);
      pdf.text('Application Status:', 20, y + 13);
      pdf.text('Empanelment Grade:', 20, y + 19);
      pdf.text('Allocated Physical Target:', 20, y + 25);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(22, 101, 52);
      pdf.text('ACCEPTED & ISSUED', 75, y + 13);
      pdf.text('Grade A (Verified)', 75, y + 19);
      pdf.text('300 Trainees (FY 2026-27)', 75, y + 25);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      pdf.text('Submission Date:', 125, y + 13);
      pdf.text('Biometric AEBAS:', 125, y + 19);
      pdf.text('IP Camera Norms:', 125, y + 25);

      pdf.setFont('helvetica', 'bold');
      pdf.text(app.submissionDate || today, 160, y + 13);
      pdf.text('Mandatory', 160, y + 19);
      pdf.text('Mandatory', 160, y + 25);

      y += 36;
    } else if (isRejected) {
      const bodyText = `With reference to your proposal submitted under EOI Ref No. ${app.eoiRefNo || this.schemeId()}, the State Level Scrutiny Committee has completed the document verification and technical scrutiny.\n\n` +
        `We regret to inform you that your application could not be accepted for empanelment under ${currentSchemeTitle} for FY 2026-27 due to non-fulfillment of mandatory eligibility criteria or technical dossier discrepancies.\n\n` +
        `Review Status: REJECTED (Disqualified at Stage 1 Technical Scrutiny).`;
      const splitBody = pdf.splitTextToSize(bodyText, 180);
      pdf.text(splitBody, 15, y);
      y += splitBody.length * 4.5 + 4;

      // Details Table
      pdf.setFillColor(255, 241, 242);
      pdf.setDrawColor(254, 205, 211);
      pdf.roundedRect(15, y, 180, 24, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(159, 18, 57);
      pdf.text('SCRUTINY REVIEW DETAILS:', 20, y + 6);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);
      pdf.text('Application Status:', 20, y + 13);
      pdf.text('Submission Date:', 20, y + 19);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(159, 18, 57);
      pdf.text('REJECTED', 70, y + 13);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      pdf.text(app.submissionDate || today, 70, y + 19);

      y += 30;
    } else {
      const bodyText = `Application proposal submitted under EOI Ref No. ${app.eoiRefNo || this.schemeId()} is currently Under Technical Scrutiny by the Department Empanelment Committee.`;
      const splitBody = pdf.splitTextToSize(bodyText, 180);
      pdf.text(splitBody, 15, y);
      y += splitBody.length * 4.5 + 10;
    }

    // Mandatory Terms Note
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    const footerNote = 'Note: This is an official digitally generated document issued by the Rajasthan Skill and Livelihoods Development Corporation (RSLDC) via ISMS 2.0 portal.';
    pdf.text(footerNote, 15, y);

    // Signatory Footer
    const signY = 250;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(15, signY, 195, signY);

    pdf.setFillColor(240, 253, 244);
    pdf.setDrawColor(187, 247, 208);
    pdf.roundedRect(15, signY + 3, 52, 12, 1, 1, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(22, 101, 52);
    pdf.text('✓ DIGITALLY VERIFIED', 18, signY + 10);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Managing Director', 195, signY + 8, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('RSLDC, Jaipur (Govt. of Rajasthan)', 195, signY + 13, { align: 'right' });

    // Page Number Footer
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Page ${currentPage} of ${totalPages} | Applicant: ${app.anonymousLabel} (${app.id})`, 105, 282, { align: 'center' });
  }

  /**
   * Generates and downloads individual official IPA / Review Outcome PDFs
   * packaged into a ZIP archive for all filtered applicants.
   */
  async downloadAllZip(): Promise<void> {
    const list = this.filteredResponses();
    if (!list || list.length === 0) return;

    this.downloadType.set('zip');
    this.isDownloadingAll.set(true);

    try {
      const zip = new JSZip();
      const currentSchemeTitle = list[0]?.schemeName || 'RSLDC Skill Development Scheme';
      const currentFilter = this.selectedFilter();
      const filterTag = currentFilter === 'APPROVED' ? 'Accepted_IPA' : currentFilter === 'REJECTED' ? 'Rejected_Outcome' : currentFilter === 'UNDER_SCRUTINY' ? 'Under_Scrutiny' : 'All_Applications';
      const folderName = `RSLDC_${filterTag}_${this.schemeId() || 'EOI'}`;
      const folder = zip.folder(folderName) || zip;
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

      for (let i = 0; i < list.length; i++) {
        const app = list[i];
        const singlePdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        this.renderApplicantPdfPage(singlePdf, app, currentSchemeTitle, today, 1, 1);
        const arrayBuffer = singlePdf.output('arraybuffer');
        const docPrefix = app.status === 'APPROVED' ? 'IPA_Letter' : app.status === 'REJECTED' ? 'Review_Outcome' : 'Dossier';
        const cleanName = `${i + 1}_${docPrefix}_${(app.anonymousLabel || 'Applicant').replace(/[^a-zA-Z0-9]/g, '_')}_${app.id}.pdf`;
        folder.file(cleanName, arrayBuffer);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${folderName}.zip`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error generating ZIP:', err);
    } finally {
      this.isDownloadingAll.set(false);
    }
  }

  /**
   * Generates and downloads compiled official In-Principle Approval (IPA)
   * or Application Review Outcome PDFs in a single multi-page PDF.
   */
  downloadAllPdf(): void {
    const list = this.filteredResponses();
    if (!list || list.length === 0) return;

    this.downloadType.set('pdf');
    this.isDownloadingAll.set(true);

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const currentSchemeTitle = list[0]?.schemeName || 'RSLDC Skill Development Scheme';
      const currentFilter = this.selectedFilter();
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

      list.forEach((app, idx) => {
        if (idx > 0) {
          pdf.addPage();
        }
        this.renderApplicantPdfPage(pdf, app, currentSchemeTitle, today, idx + 1, list.length);
      });

      const filterTag = currentFilter === 'APPROVED' ? 'Accepted_IPA' : currentFilter === 'REJECTED' ? 'Rejected' : currentFilter === 'UNDER_SCRUTINY' ? 'Under_Scrutiny' : 'All';
      const fileName = `RSLDC_${filterTag}_Applications_${this.schemeId() || 'EOI'}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      this.isDownloadingAll.set(false);
    }
  }
}
