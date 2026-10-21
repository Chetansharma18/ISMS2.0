import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  EoiStateService,
  ApplicantResponse,
  DossierDocument,
  ApplicationActivityLog
} from '../../services/eoi-state.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { formatDateMedium } from '../../../../shared/utils';
import { AuthService } from '../../../../core/auth/auth.service';
import { ShortfallBridgeService } from '../../services/shortfall-bridge.service';
import { ScrutinyToolbarComponent } from './components/scrutiny-toolbar.component';
import { ScrutinyDocViewerComponent } from './components/scrutiny-doc-viewer.component';
import { ScrutinyDecisionRecordComponent } from './components/scrutiny-decision-record.component';
import { ScrutinyReviewSectionsComponent } from './components/scrutiny-review-sections.component';
import { ScrutinyPastPerformanceComponent } from './components/scrutiny-past-performance.component';
import { RevertSubmission, ScrutinyRevertModalComponent } from './components/scrutiny-revert-modal.component';
import { ScrutinyRemarksComponent } from './components/scrutiny-remarks.component';
import { ScrutinyPdfService } from './scrutiny-pdf.service';
import {
  DecisionSubmission,
  GradeOption,
  ScrutinyDecisionModalComponent
} from './components/scrutiny-decision-modal.component';
import { ActivePreviewDocument } from './scrutiny-desk.util';
import { DataEngineService } from '../../../../core/services/data-engine.service';
import { GradingMasterItem } from '../../../../core/models/admin-masters.model';

@Component({
  selector: 'app-scrutiny-desk',
  standalone: true,
  imports: [
    ScrutinyToolbarComponent,
    ScrutinyDecisionRecordComponent,
    ScrutinyReviewSectionsComponent,
    ScrutinyPastPerformanceComponent,
    ScrutinyRemarksComponent,
    ScrutinyRevertModalComponent,
    ScrutinyDecisionModalComponent,
    ScrutinyDocViewerComponent
  ],
  template: `
    <div class="w-full min-h-screen bg-[#FEFEFD] text-slate-800 font-sans px-4 sm:px-5 lg:px-6 py-4 sm:py-5 space-y-5" >

      <app-scrutiny-toolbar
        [applicant]="applicant()"
        (revert)="openRevertModal()"
        (remarks)="openRemarksModal()"
        (reject)="openRejectModal()"
        (approve)="openApproveModal()"
      />

      @if (applicant(); as app) {
        @if (app.status !== 'UNDER_SCRUTINY') {
          <app-scrutiny-decision-record [applicant]="app" />
        }

        <app-scrutiny-review-sections
          [applicant]="app"
          [isDownloadingZip]="isDownloadingZip()"
          (viewDoc)="openOfficialDoc($event)"
          (downloadZip)="downloadAllZip()"
        />

        <app-scrutiny-past-performance [engagements]="app.pastEngagements ?? []" />

        <app-scrutiny-remarks [log]="getActivityLog()" />
      }

    </div>

    <!-- Document / PDF viewer modal -->
    <app-scrutiny-doc-viewer
      [doc]="activeDoc()"
      [applicant]="applicant()"
      (close)="closeDocViewer()"
      (downloadPdf)="downloadDocPdf()"
    />

    @if (showRevertModal()) {
      <app-scrutiny-revert-modal
        [applicantLabel]="applicant()?.anonymousLabel ?? ''"
        [documentOptions]="shortfallDocTitles()"
        (confirmed)="confirmRevert($event)"
        (close)="closeModals()"
      />
    }

    @if (showRemarksModal()) {
      <app-scrutiny-decision-modal
        mode="remark"
        [applicantLabel]="applicant()?.anonymousLabel ?? ''"
        (confirmed)="confirmAddRemark($event)"
        (close)="closeModals()"
      />
    }

    @if (showRejectModal()) {
      <app-scrutiny-decision-modal
        mode="reject"
        [applicantLabel]="applicant()?.anonymousLabel ?? ''"
        (confirmed)="confirmReject($event)"
        (close)="closeModals()"
      />
    }

    @if (showApproveModal()) {
      <app-scrutiny-decision-modal
        mode="approve"
        [applicantLabel]="applicant()?.anonymousLabel ?? ''"
        [grades]="grades()"
        (confirmed)="confirmApprove($event)"
        (close)="closeModals()"
      />
    }
  `
})
export class ScrutinyDeskComponent {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private notifications = inject(NotificationService);
  private pdfService = inject(ScrutinyPdfService);
  private shortfallBridge = inject(ShortfallBridgeService);
  private auth = inject(AuthService);
  private gradingRepo = inject(DataEngineService).for<GradingMasterItem>('GRADING_MASTERS', { idKey: 'id' });

  /** Name recorded against every action and remark, so it is clear who said what. */
  private reviewerName(): string {
    // Committee members are shown by a number only (no name or designation). The number is
    // derived from the signed-in user, so the same user is always the same member.
    const ssoId = this.auth.currentUser()?.ssoId ?? '';
    let sum = 0;
    for (const ch of ssoId) sum += ch.charCodeAt(0);
    return `Committee Member ${(sum % 5) + 1}`;
  }
  private destroyRef = inject(DestroyRef);

  Math = Math;

  applicant = signal<ApplicantResponse | undefined>(undefined);

  // Modal Dialog States
  showApproveModal = signal<boolean>(false);
  showRejectModal = signal<boolean>(false);
  showRevertModal = signal<boolean>(false);
  showRemarksModal = signal<boolean>(false);

  /** Active grades from the Grading Master, highest first. */
  readonly grades = signal<GradeOption[]>([]);

  // Document Viewer State
  activeDoc = signal<ActivePreviewDocument | null>(null);
  isDownloadingZip = signal<boolean>(false);

  // Available TP / OTR documents for the shortfall dropdown
  readonly availableShortfallDocs = computed(() => {
    const app = this.applicant();
    const defaultDocs = [
      { id: 'DOC_REG', title: 'Organisation Registration Certificate', category: 'OTR' },
      { id: 'DOC_PAN', title: 'Organisation PAN Card', category: 'OTR' },
      { id: 'DOC_GST', title: 'GST Registration Certificate', category: 'OTR' },
      { id: 'DOC_BALANCE', title: 'Audited Balance Sheet / Turnover Certificate', category: 'Proposal' },
      { id: 'DOC_BOARD', title: 'Board Resolution / Power of Attorney', category: 'Proposal' },
      { id: 'DOC_NSDC', title: 'NSDC Partner Certificate', category: 'Proposal' },
      { id: 'DOC_ADDITIONAL', title: 'Additional Supporting Document', category: 'Proposal' },
      { id: 'DOC_SIGNATORY', title: 'Authorized Signatory Identity Proof (Aadhaar / Voter ID)', category: 'OTR' },
      { id: 'DOC_BANK', title: 'Bank Account Mandate / Cancelled Cheque', category: 'OTR' },
      { id: 'DOC_CENTRE', title: 'Training Centre Infrastructure & Equipment Proof', category: 'Proposal' },
      { id: 'DOC_AFFIDAVIT', title: 'Non-Blacklisting Declaration & Affidavit (Rs. 100 Stamp)', category: 'Statutory' },
      { id: 'DOC_EMD', title: 'EMD Statutory Deposit Receipt / Challan', category: 'Statutory' }
    ];

    if (!app?.uploadedDocuments?.length) {
      return defaultDocs;
    }

    const uploaded = app.uploadedDocuments.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category || 'Uploaded'
    }));

    const seen = new Set<string>();
    const list: { id: string; title: string; category: string }[] = [];
    for (const doc of [...uploaded, ...defaultDocs]) {
      const key = doc.title.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(doc);
      }
    }
    return list;
  });

  /** Document names offered in the shortfall dropdown. */
  readonly shortfallDocTitles = computed(() => this.availableShortfallDocs().map(d => d.title));

  constructor() {
    // Grades offered when approving come from the Grading Master (active grades only).
    this.gradingRepo
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe(items =>
        this.grades.set(
          items
            .filter(item => item.status !== 'Inactive')
            .sort((a, b) => b.maximum - a.maximum)
            .map(({ grade, minimum, maximum, range }) => ({ grade, minimum, maximum, range }))
        )
      );

    this.route.params.pipe(takeUntilDestroyed()).subscribe(params => {
      const appId = params['applicationId'];
      if (appId) {
        this.loadApplicant(appId);
      }
    });
  }

  loadApplicant(appId: string): void {
    this.eoiStateService.getResponseById(appId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.applicant.set(data);
    });
  }

  // --- Activity History Timeline Stream ---
  getActivityLog(): ApplicationActivityLog[] {
    const app = this.applicant();
    if (app?.activityLog && app.activityLog.length > 0) {
      return app.activityLog;
    }

    const subDate = app?.submissionDate || '08/09/2026 14:30 PM';
    const initial: ApplicationActivityLog[] = [
      {
        id: 'ACT-1',
        timestamp: subDate,
        action: 'SUBMITTED',
        title: 'EOI Proposal Submitted & Statutory Fee Paid',
        actor: `${app?.authorizedSignatory?.name || 'Applicant'} (${app?.authorizedSignatory?.designation || 'Authorized Signatory'})`,
        actorRole: 'Applicant / TP',
        description: `Complete proposal submitted under ${app?.schemeName || 'MMKVY'}. EMD Fee (₹${app?.emdFee?.toLocaleString() || '50,000'}) and Processing Fee (₹${app?.processingFee?.toLocaleString() || '2,000'}) successfully deposited via e-Challan. 7 Proposal documents uploaded.`,
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200'
      },
      {
        id: 'ACT-2',
        timestamp: '09/09/2026 10:15 AM',
        action: 'UNDER_REVIEW',
        title: 'Application Assigned to Scrutiny Desk',
        actor: 'Scrutiny Desk',
        actorRole: 'Department Scrutiny Officer',
        description: 'Proposal dossier marked for Stage-1 technical eligibility scrutiny, statutory OTR document validation, and training infrastructure review.',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
      }
    ];

    if (app?.status === 'REVERTED' && app.scrutinyDetails?.shortfall) {
      initial.push({
        id: 'ACT-3',
        timestamp: app.scrutinyDetails.decisionTimestamp || '10/09/2026 11:30 AM',
        action: 'REVERTED',
        title: 'Shortfall Notice Issued (Reverted to Applicant)',
        actor: app.scrutinyDetails.scrutinyOfficer || 'Committee Member 1',
        actorRole: 'Department Scrutiny Officer',
        description: `Shortfall notice issued for ${app.scrutinyDetails.shortfall.documents.length} document(s).${app.scrutinyDetails.shortfall.officeOrderRef ? ` Office Order Ref: ${app.scrutinyDetails.shortfall.officeOrderRef}.` : ''} Rectification window: ${app.scrutinyDetails.shortfall.deadlineDays} Days. Remarks: "${app.scrutinyDetails.remarks}"`,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        meta: {
          documents: app.scrutinyDetails.shortfall.documents,
          officeOrderRef: app.scrutinyDetails.shortfall.officeOrderRef,
          remarks: app.scrutinyDetails.remarks
        }
      });
    } else if (app?.status === 'APPROVED' && app.scrutinyDetails) {
      initial.push({
        id: 'ACT-3',
        timestamp: app.scrutinyDetails.decisionTimestamp || '11/09/2026 16:45 PM',
        action: 'APPROVED',
        title: 'Application Approved & Empanelled',
        actor: app.scrutinyDetails.scrutinyOfficer || 'Committee Member 1',
        actorRole: 'Empanelment Committee',
        description: `Technical Evaluation Score awarded: ${app.scrutinyDetails.technicalScore}/100 (${app.scrutinyDetails.grade}). Empanelment recommendation: "${app.scrutinyDetails.remarks}"`,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        meta: {
          score: app.scrutinyDetails.technicalScore,
          grade: app.scrutinyDetails.grade,
          remarks: app.scrutinyDetails.remarks
        }
      });
    } else if (app?.status === 'REJECTED' && app.scrutinyDetails) {
      initial.push({
        id: 'ACT-3',
        timestamp: app.scrutinyDetails.decisionTimestamp || '11/09/2026 15:20 PM',
        action: 'REJECTED',
        title: 'Application Disqualified & Rejected',
        actor: app.scrutinyDetails.scrutinyOfficer || 'Committee Member 1',
        actorRole: 'Department Scrutiny Officer',
        description: `Application disqualified. Reason: "${app.scrutinyDetails.remarks}". Statutory EMD refund initiated.`,
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        meta: {
          remarks: app.scrutinyDetails.remarks
        }
      });
    }

    return initial;
  }

  // --- Modal Openers ---
  openApproveModal(): void {
    this.showApproveModal.set(true);
  }

  openRejectModal(): void {
    this.showRejectModal.set(true);
  }

  openRevertModal(): void {
    this.showRevertModal.set(true);
  }

  openRemarksModal(): void {
    this.showRemarksModal.set(true);
  }

  closeModals(): void {
    this.showApproveModal.set(false);
    this.showRejectModal.set(false);
    this.showRevertModal.set(false);
    this.showRemarksModal.set(false);
  }

  // --- Actions ---
  /** Approves the application with the score and grade chosen by the committee member. */
  confirmApprove(submission: DecisionSubmission): void {
    const app = this.applicant();
    if (!app) return;

    const grade = submission.grade ?? '';
    const now = new Date();
    const nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity: ApplicationActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: nowStr,
      action: 'APPROVED',
      title: 'Application Approved',
      actor: this.reviewerName(),
      actorRole: 'Empanelment Committee',
      description: `Approved with grade ${grade}.`,
      badgeClass: 'bg-sky-50 text-navy border-sky-200',
      meta: {
        grade,
        remarks: submission.remark || undefined
      }
    };

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'APPROVED',
      scrutinyOfficer: this.reviewerName(),
      grade,
      remarks: submission.remark,
      activityLog: [...this.getActivityLog(), newActivity]
    });

    this.closeModals();
    this.notifications.success(`${app.anonymousLabel} has been approved (grade ${grade}).`, 'Application Approved');
    this.loadApplicant(app.id);
  }

  /** Rejects the application. The remark is mandatory. */
  confirmReject(submission: DecisionSubmission): void {
    const app = this.applicant();
    if (!app || !submission.remark) return;

    const now = new Date();
    const nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity: ApplicationActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: nowStr,
      action: 'REJECTED',
      title: 'Application Rejected',
      actor: this.reviewerName(),
      actorRole: 'Department Scrutiny Officer',
      description: 'Application rejected.',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      meta: {
        remarks: submission.remark
      }
    };

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'REJECTED',
      scrutinyOfficer: this.reviewerName(),
      technicalScore: 0,
      remarks: submission.remark,
      disqualificationReason: submission.remark,
      activityLog: [...this.getActivityLog(), newActivity]
    });

    this.closeModals();
    this.notifications.success(`${app.anonymousLabel} has been rejected.`, 'Application Rejected');
    this.loadApplicant(app.id);
  }


  /** Raises the shortfall: returns the application to the applicant with the documents asked for. */
  confirmRevert(submission: RevertSubmission): void {
    const app = this.applicant();
    if (!app) return;

    const now = new Date();
    const nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const due = new Date(now);
    due.setDate(due.getDate() + submission.dueDays);

    const newActivity: ApplicationActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: nowStr,
      action: 'REVERTED',
      title: 'Shortfall Raised',
      actor: this.reviewerName(),
      actorRole: 'Department Scrutiny Officer',
      description: `Shortfall raised for ${submission.documents.length} document(s). Response time: ${submission.dueDays} days.`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      meta: {
        documents: submission.documents,
        remarks: submission.comment
      }
    };

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'REVERTED',
      scrutinyOfficer: this.reviewerName(),
      technicalScore: 0,
      grade: 'Grade E',
      remarks: submission.comment,
      shortfall: {
        documents: submission.documents,
        deadlineDays: submission.dueDays,
        revertedAt: now.toLocaleDateString('en-GB')
      },
      activityLog: [...this.getActivityLog(), newActivity]
    });

    // Show the shortfall, with the files shared by the department, on the applicant's Tender Status page.
    this.shortfallBridge
      .raiseNotice(app.id, {
        raisedOn: formatDateMedium(now, '-'),
        raisedBy: 'Department',
        dueDate: formatDateMedium(due, '-'),
        remarks: submission.comment,
        requiredDocs: submission.documents,
        sharedDocs: submission.sharedFiles
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.closeModals();
    this.notifications.success('Shortfall sent to the applicant.', 'Shortfall Raised');
    this.loadApplicant(app.id);
  }

  /** Records a remark against the signed-in committee member. It reaches the Scheme OIC automatically. */
  confirmAddRemark(submission: DecisionSubmission): void {
    const app = this.applicant();
    const remark = submission.remark.trim();
    if (!app || !remark) return;

    const now = new Date();
    const nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity: ApplicationActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: nowStr,
      action: 'REMARK_ADDED',
      title: 'Remark added',
      actor: this.reviewerName(),
      actorRole: 'Department Scrutiny Officer',
      description: remark,
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      meta: {
        remarks: remark
      }
    };

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: app.status,
      technicalScore: app.scrutinyDetails?.technicalScore || 0,
      grade: app.scrutinyDetails?.grade,
      remarks: app.scrutinyDetails?.remarks ?? remark,
      shortfall: app.scrutinyDetails?.shortfall,
      activityLog: [...this.getActivityLog(), newActivity],
      scrutinyOfficer: app.scrutinyDetails?.scrutinyOfficer ?? this.reviewerName()
    });

    this.closeModals();
    this.notifications.success('Your remark has been recorded.', 'Remark Added');
    this.loadApplicant(app.id);
  }


  /** Opens the Document / PDF Viewer for a dossier document directly in another tab in Chrome. */
  openOfficialDoc(doc: DossierDocument): void {
    window.open(encodeURI('/document/ISMS RFP.pdf'), '_blank');
  }

  closeDocViewer(): void {
    this.activeDoc.set(null);
  }

  /** Generates and downloads the official PDF for the document in the viewer. */
  downloadDocPdf(): void {
    const doc = this.activeDoc();
    if (!doc) return;
    this.pdfService.downloadDocPdf(doc, this.applicant());
  }

  /** Generates and downloads all verified proposal documents in a ZIP file. */
  async downloadAllZip(): Promise<void> {
    const app = this.applicant();
    const docs = app?.uploadedDocuments;
    if (!app || !docs || docs.length === 0) return;

    this.isDownloadingZip.set(true);
    try {
      await this.pdfService.downloadAllZip(app, docs);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      this.isDownloadingZip.set(false);
    }
  }
}
