import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import { EoiStateService, ApplicantResponse } from '../../services/eoi-state.service';
import { formatDate } from '../../../../shared/utils';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../../../shared';

@Component({
  selector: 'app-applicant-submissions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="w-full min-h-full bg-white text-text-primary font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Header via Reusable PageHeaderComponent: Title, Breadcrumbs, and Search only -->
        <app-page-header
          title="Applicant Submissions"
          [breadcrumbs]="[
            { label: 'Home', url: '/' },
            { label: 'EOI Responses', url: '/admin/eoi-view' },
            { label: 'Applicant Submissions' }
          ]"
          [searchable]="true"
          searchPlaceholder="Search Applicant, Reg No., Org..."
          [(searchQuery)]="searchQuery"
        >
        </app-page-header>

        <!-- Simple Neutral Filter Toolbar & Review Progress -->
        <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3">
          <!-- Left: Back Button & Filter Tabs -->
          <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <!-- Back Button matching existing screens -->
            <button
              type="button"
              (click)="goBack()"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-[13px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
              title="Back to EOI Responses"
            >
              <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>

            <!-- Simple Filter Tabs (Neutral, No Multiple Colors) -->
            <div class="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 gap-1 flex-wrap">
            <!-- All -->
            <button
              type="button"
              (click)="setFilter('ALL')"
              class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              [class.bg-white]="selectedFilter() === 'ALL'"
              [class.text-slate-900]="selectedFilter() === 'ALL'"
              [class.shadow-2xs]="selectedFilter() === 'ALL'"
              [class.text-slate-600]="selectedFilter() !== 'ALL'"
              [class.hover:text-slate-900]="selectedFilter() !== 'ALL'"
            >
              <span>All Applications</span>
              <span
                class="px-1.5 py-0.2 rounded text-[10px] font-bold"
                [class.bg-slate-800]="selectedFilter() === 'ALL'"
                [class.text-white]="selectedFilter() === 'ALL'"
                [class.bg-slate-200]="selectedFilter() !== 'ALL'"
                [class.text-slate-700]="selectedFilter() !== 'ALL'"
              >
                {{ totalSubmissionsCount() }}
              </span>
            </button>

            <!-- Under Review -->
            <button
              type="button"
              (click)="setFilter('UNDER_SCRUTINY')"
              class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              [class.bg-white]="selectedFilter() === 'UNDER_SCRUTINY'"
              [class.text-slate-900]="selectedFilter() === 'UNDER_SCRUTINY'"
              [class.shadow-2xs]="selectedFilter() === 'UNDER_SCRUTINY'"
              [class.text-slate-600]="selectedFilter() !== 'UNDER_SCRUTINY'"
              [class.hover:text-slate-900]="selectedFilter() !== 'UNDER_SCRUTINY'"
            >
              <span>Under Review</span>
              <span
                class="px-1.5 py-0.2 rounded text-[10px] font-bold"
                [class.bg-slate-800]="selectedFilter() === 'UNDER_SCRUTINY'"
                [class.text-white]="selectedFilter() === 'UNDER_SCRUTINY'"
                [class.bg-slate-200]="selectedFilter() !== 'UNDER_SCRUTINY'"
                [class.text-slate-700]="selectedFilter() !== 'UNDER_SCRUTINY'"
              >
                {{ countPending() }}
              </span>
            </button>

            <!-- Accepted -->
            <button
              type="button"
              (click)="setFilter('APPROVED')"
              class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              [class.bg-white]="selectedFilter() === 'APPROVED'"
              [class.text-slate-900]="selectedFilter() === 'APPROVED'"
              [class.shadow-2xs]="selectedFilter() === 'APPROVED'"
              [class.text-slate-600]="selectedFilter() !== 'APPROVED'"
              [class.hover:text-slate-900]="selectedFilter() !== 'APPROVED'"
            >
              <span>Accepted</span>
              <span
                class="px-1.5 py-0.2 rounded text-[10px] font-bold"
                [class.bg-slate-800]="selectedFilter() === 'APPROVED'"
                [class.text-white]="selectedFilter() === 'APPROVED'"
                [class.bg-slate-200]="selectedFilter() !== 'APPROVED'"
                [class.text-slate-700]="selectedFilter() !== 'APPROVED'"
              >
                {{ countApproved() }}
              </span>
            </button>

            <!-- Rejected -->
            <button
              type="button"
              (click)="setFilter('REJECTED')"
              class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              [class.bg-white]="selectedFilter() === 'REJECTED'"
              [class.text-slate-900]="selectedFilter() === 'REJECTED'"
              [class.shadow-2xs]="selectedFilter() === 'REJECTED'"
              [class.text-slate-600]="selectedFilter() !== 'REJECTED'"
              [class.hover:text-slate-900]="selectedFilter() !== 'REJECTED'"
            >
              <span>Rejected</span>
              <span
                class="px-1.5 py-0.2 rounded text-[10px] font-bold"
                [class.bg-slate-800]="selectedFilter() === 'REJECTED'"
                [class.text-white]="selectedFilter() === 'REJECTED'"
                [class.bg-slate-200]="selectedFilter() !== 'REJECTED'"
                [class.text-slate-700]="selectedFilter() !== 'REJECTED'"
              >
                {{ countRejected() }}
              </span>
            </button>

            <!-- Reverted -->
            <button
              type="button"
              (click)="setFilter('REVERTED')"
              class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              [class.bg-white]="selectedFilter() === 'REVERTED'"
              [class.text-slate-900]="selectedFilter() === 'REVERTED'"
              [class.shadow-2xs]="selectedFilter() === 'REVERTED'"
              [class.text-slate-600]="selectedFilter() !== 'REVERTED'"
              [class.hover:text-slate-900]="selectedFilter() !== 'REVERTED'"
            >
              <span>Reverted</span>
              <span
                class="px-1.5 py-0.2 rounded text-[10px] font-bold"
                [class.bg-slate-800]="selectedFilter() === 'REVERTED'"
                [class.text-white]="selectedFilter() === 'REVERTED'"
                [class.bg-slate-200]="selectedFilter() !== 'REVERTED'"
                [class.text-slate-700]="selectedFilter() !== 'REVERTED'"
              >
                {{ countReverted() }}
              </span>
            </button>
          </div>
        </div>

          <!-- Review Status & Upload Sanction Order Option -->
          <div class="flex items-center gap-3">
            <!-- Upload Sanction Order Button shown ONLY when all applications are accepted or rejected -->
            @if (allReviewed()) {
              <button
                type="button"
                (click)="openSanctionOrder()"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-2xs cursor-pointer shrink-0"
                title="Upload Sanction Order"
              >
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Sanction Order</span>
              </button>
            }

            <div class="text-right">
              <div class="text-xs font-semibold text-slate-800 flex items-center gap-1.5 justify-end">
                <span class="text-slate-500 font-normal">Review Status:</span>
                <span class="font-bold text-slate-800">{{ countReviewed() }} / {{ totalSubmissionsCount() }} Processed</span>
              </div>
              <div class="text-[11px] text-slate-500 font-normal">
                {{ reviewPercentage() }}% Completed
              </div>
            </div>

            <div class="w-20 sm:w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                class="h-full bg-slate-700 rounded-full transition-all duration-300"
                [style.width.%]="reviewPercentage()"
              ></div>
            </div>
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
            status: statusTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #applicantTemplate let-item>
          <div class="font-normal text-slate-800 text-[13px]">
            {{ item.anonymousLabel }}
          </div>
          <div class="text-[11px] font-mono text-text-muted mt-0.5">
            {{ item.regNumber }}
          </div>
        </ng-template>

        <!-- Clean, Proper, Non-Colorful Status -->
        <ng-template #statusTemplate let-item>
          <span class="inline-block px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200">
            {{ item.status === 'UNDER_SCRUTINY' ? 'Under Review' : item.status === 'APPROVED' ? 'Accepted' : item.status === 'REVERTED' ? 'Reverted' : 'Rejected' }}
          </span>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <a
            [routerLink]="['/admin/review', item.id]"
            class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white! shadow-2xs transition-colors font-semibold text-xs whitespace-nowrap cursor-pointer"
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
  private destroyRef = inject(DestroyRef);

  responses = signal<ApplicantResponse[]>([]);
  selectedFilter = signal<'ALL' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED' | 'REVERTED'>('ALL');
  searchQuery = signal<string>('');
  schemeId = signal<string>('');
  isDownloadingAll = signal<boolean>(false);
  downloadType = signal<'zip' | 'pdf'>('zip');

  readonly submissionColumns: TableColumn<ApplicantResponse>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'anonymousLabel', label: 'Applicant / Legal Firm Name', width: 'min-w-[260px]', type: 'custom' },
    { key: 'submissionDate', label: 'Submitted Date', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-32', type: 'custom' }
  ];

  constructor() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const sId = params['schemeId'] || 'ALL';
      this.schemeId.set(sId);
      this.loadResponses(sId);
    });
  }

  loadResponses(sId: string): void {
    this.eoiStateService.getResponses(sId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.responses.set(data);
    });
  }

  setFilter(filter: 'ALL' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED' | 'REVERTED'): void {
    this.selectedFilter.set(filter);
  }

  goBack(): void {
    this.router.navigate(['/admin/eoi-view']);
  }

  totalSubmissionsCount = computed(() => this.responses().length);

  countPending = computed(() => this.responses().filter(r => r.status === 'UNDER_SCRUTINY').length);
  countApproved = computed(() => this.responses().filter(r => r.status === 'APPROVED').length);
  countRejected = computed(() => this.responses().filter(r => r.status === 'REJECTED').length);
  countReverted = computed(() => this.responses().filter(r => r.status === 'REVERTED').length);
  countReviewed = computed(() => this.responses().filter(r => r.status === 'APPROVED' || r.status === 'REJECTED' || r.status === 'REVERTED').length);

  reviewPercentage = computed(() => {
    const total = this.totalSubmissionsCount();
    if (!total) return 0;
    return Math.round((this.countReviewed() / total) * 100);
  });

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
    this.router.navigate(['/admin/eoi-sanction-editor', this.schemeId()]);
  }

  filteredResponses = computed(() => {
    const filter = this.selectedFilter();
    const query = this.searchQuery().trim().toLowerCase();
    let list = this.responses();
    if (filter !== 'ALL') {
      list = list.filter(r => r.status === filter);
    }
    if (!query) return list;
    return list.filter(r =>
      (r.anonymousLabel && r.anonymousLabel.toLowerCase().includes(query)) ||
      (r.regNumber && r.regNumber.toLowerCase().includes(query)) ||
      (r.actualLegalName && r.actualLegalName.toLowerCase().includes(query))
    );
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
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const currentSchemeTitle = list[0]?.schemeName || 'RSLDC Skill Development Scheme';
      const currentFilter = this.selectedFilter();
      const filterTag = currentFilter === 'APPROVED' ? 'Accepted_IPA' : currentFilter === 'REJECTED' ? 'Rejected_Outcome' : currentFilter === 'UNDER_SCRUTINY' ? 'Under_Scrutiny' : 'All_Applications';
      const folderName = `RSLDC_${filterTag}_${this.schemeId() || 'EOI'}`;
      const folder = zip.folder(folderName) || zip;
      const today = formatDate(new Date());

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
      const today = formatDate(new Date());

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
