import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import { EoiStateService, ApplicantResponse } from '../../services/eoi-state.service';
import { formatDate } from '../../../../shared/utils';
import {
  ButtonComponent,
  FilterTab,
  FilterTabsComponent,
  IconComponent,
  ListPageComponent,
  TableColumn
} from '../../../../shared';

@Component({
  selector: 'app-applicant-submissions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ListPageComponent, ButtonComponent, FilterTabsComponent, IconComponent],
  template: `
    <app-list-page
      title="Applicant Submissions"
      [breadcrumbs]="[
        { label: 'Home', url: '/' },
        { label: 'EOI Responses', url: '/admin/eoi-view' },
        { label: 'Applicant Submissions' }
      ]"
      searchPlaceholder="Search Applicant, Reg No., Org..."
      [(searchQuery)]="searchQuery"
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
        <!-- Simple Neutral Filter Toolbar & Review Progress -->
        <div beforeTable class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3">
          <!-- Left: Back Button & Filter Tabs -->
          <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <!-- Back Button matching existing screens -->
            <button appButton variant="outline" size="sm" class="shrink-0" (click)="goBack()" title="Back to EOI Responses">
              <app-icon name="chevron-left" size="sm" />
              <span>Back</span>
            </button>

            <!-- Simple Filter Tabs (the selected one is filled) -->
            <app-filter-tabs [options]="filterTabs()" [value]="selectedFilter()" (valueChange)="setFilter($event)" />
        </div>

          <!-- Review status, and the sanction order once every application is decided -->
          <div class="flex items-center gap-4 flex-wrap">
            <div class="text-right">
              <div class="text-xs font-semibold text-slate-800 flex items-center gap-1.5 justify-end">
                <span class="text-slate-500 font-normal">Review Status:</span>
                @if (allReviewed()) {
                  <span class="font-bold text-slate-800">Reviewed</span>
                } @else {
                  <span class="font-bold text-slate-800">{{ countReviewed() }} / {{ totalSubmissionsCount() }} Processed</span>
                }
              </div>
              <div class="text-[11px] text-slate-500 font-normal">
                @if (allReviewed()) {
                  All {{ totalSubmissionsCount() }} applications
                } @else {
                  {{ reviewPercentage() }}% Completed
                }
              </div>
            </div>

            @if (allReviewed()) {
              <button appButton class="shrink-0" (click)="openSanctionOrder()" title="Prepare the sanction order for this scheme">
                <span>Release Sanction Order</span>
              </button>
            } @else {
              <div class="w-20 sm:w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  class="h-full bg-slate-700 rounded-full transition-all duration-300"
                  [style.width.%]="reviewPercentage()"
                ></div>
              </div>
            }
          </div>
        </div>

        <ng-template #applicantTemplate let-item>
          <div class="font-normal text-slate-800 text-[13px]">
            {{ item.anonymousLabel }}
          </div>
          <div class="text-[11px] tabular-nums text-text-muted mt-0.5">
            {{ item.regNumber }}
          </div>
        </ng-template>

        <!-- Clean, Proper, Non-Colorful Status -->
        <ng-template #statusTemplate let-item>
          <span class="inline-block px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200">
            {{ item.status === 'UNDER_SCRUTINY' ? 'Under Review' : item.status === 'APPROVED' ? 'Approved' : item.status === 'REVERTED' ? 'Reverted' : 'Rejected' }}
          </span>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <a appButton size="sm" [routerLink]="['/admin/review', item.id]">
            <span>Review</span>
          </a>
        </ng-template>

    </app-list-page>
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

  readonly filterTabs = computed<FilterTab<'ALL' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED' | 'REVERTED'>[]>(() => [
    { id: 'ALL', label: 'All Applications', count: this.totalSubmissionsCount() },
    { id: 'UNDER_SCRUTINY', label: 'Under Review', count: this.countPending() },
    { id: 'APPROVED', label: 'Approved', count: this.countApproved() },
    { id: 'REJECTED', label: 'Rejected', count: this.countRejected() },
    { id: 'REVERTED', label: 'Reverted', count: this.countReverted() }
  ]);

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

  /** Opens the draft sanction order for this scheme. */
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
      pdf.text('APPROVED & ISSUED', 75, y + 13);
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
        `We regret to inform you that your application could not be approved for empanelment under ${currentSchemeTitle} for FY 2026-27 due to non-fulfillment of mandatory eligibility criteria or technical dossier discrepancies.\n\n` +
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
      const filterTag = currentFilter === 'APPROVED' ? 'Approved_IPA' : currentFilter === 'REJECTED' ? 'Rejected_Outcome' : currentFilter === 'UNDER_SCRUTINY' ? 'Under_Scrutiny' : 'All_Applications';
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

      const filterTag = currentFilter === 'APPROVED' ? 'Approved_IPA' : currentFilter === 'REJECTED' ? 'Rejected' : currentFilter === 'UNDER_SCRUTINY' ? 'Under_Scrutiny' : 'All';
      const fileName = `RSLDC_${filterTag}_Applications_${this.schemeId() || 'EOI'}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      this.isDownloadingAll.set(false);
    }
  }
}
