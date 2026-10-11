import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EoiStateService, ApplicantResponse, DossierDocument } from '../../services/eoi-state.service';
import { ActionModalComponent } from '../../../../shared/components/action-modal/action-modal.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { ScrutinyToolbarComponent } from './components/scrutiny-toolbar.component';
import { ScrutinyApplicantSummaryComponent } from './components/scrutiny-applicant-summary.component';
import { ScrutinyDecisionRecordComponent } from './components/scrutiny-decision-record.component';
import { ScrutinyProfileDetailsComponent } from './components/scrutiny-profile-details.component';
import { ScrutinyDossierDocsComponent } from './components/scrutiny-dossier-docs.component';
import { ScrutinyDocViewerComponent } from './components/scrutiny-doc-viewer.component';
import { ScrutinyPdfService } from './scrutiny-pdf.service';
import {
  ActivePreviewDocument,
  GRADE_OPTIONS,
  GradeLabel,
  clampScore,
  gradeFromScore,
  isAcceptFormValid,
  isRejectFormValid,
  toActivePreviewDocument
} from './scrutiny-desk.util';

@Component({
  selector: 'app-scrutiny-desk',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    ActionModalComponent,
    ScrutinyToolbarComponent,
    ScrutinyApplicantSummaryComponent,
    ScrutinyDecisionRecordComponent,
    ScrutinyProfileDetailsComponent,
    ScrutinyDossierDocsComponent,
    ScrutinyDocViewerComponent
  ],
  template: `
    <div class="w-full min-h-screen bg-white text-slate-800 font-sans p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200" style="font-family: 'Inter', sans-serif;">

      <app-scrutiny-toolbar
        [applicant]="applicant()"
        (reject)="openRejectModal()"
        (accept)="openAcceptModal()"
      />

      <app-scrutiny-applicant-summary [applicant]="applicant()" />

      <app-scrutiny-decision-record [applicant]="applicant()" />

      <app-scrutiny-profile-details [applicant]="applicant()" />

      <app-scrutiny-dossier-docs
        [applicant]="applicant()"
        [isDownloadingZip]="isDownloadingZip()"
        (viewDocument)="openOfficialDoc($event)"
        (downloadZip)="downloadAllZip()"
      />

      <!-- Bottom Return Button -->
      <div class="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
        <a
          [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']"
          class="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-md text-xs font-medium text-slate-700 transition-colors cursor-pointer shadow-2xs"
        >
          &larr; Return to Submissions List
        </a>
      </div>

    </div>

    <!-- Document / PDF viewer modal -->
    <app-scrutiny-doc-viewer
      [doc]="activeDoc()"
      [applicant]="applicant()"
      (close)="closeDocViewer()"
      (downloadPdf)="downloadDocPdf()"
    />

    <!-- ====================================================================
         ACCEPT APPLICATION MODAL (shared ActionModalComponent)
         ==================================================================== -->
    <app-action-modal
      [isOpen]="showAcceptModal()"
      title="Accept &amp; Empanel Application"
      [description]="decisionSubtitle()"
      accentBarClass="bg-emerald-600"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      maxWidthClass="max-w-lg"
      primaryLabel="Confirm &amp; Issue Empanelment Order"
      primaryVariant="success"
      [disablePrimary]="!isAcceptFormValid()"
      secondaryLabel="Cancel"
      (primaryAction)="confirmAcceptApplication()"
      (secondaryAction)="closeModals()"
      (close)="closeModals()"
    >
      <div class="mt-4 space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label for="modalScoreInput" class="block text-xs font-medium text-slate-700 mb-1">
              Technical Evaluation Score (0 - 100) *
            </label>
            <div class="relative">
              <input
                id="modalScoreInput"
                type="number"
                min="0"
                max="100"
                [(ngModel)]="technicalScore"
                (ngModelChange)="onScoreChange($event)"
                placeholder="e.g. 88"
                class="w-full px-3 py-2 border border-slate-300 rounded text-xs font-normal text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
              />
              <span class="absolute right-3 top-2 text-slate-400 font-normal text-xs">/ 100</span>
            </div>
          </div>

          <div>
            <label for="modalGradeSelect" class="block text-xs font-medium text-slate-700 mb-1">
              Assigned Technical Grade *
            </label>
            <select
              id="modalGradeSelect"
              [(ngModel)]="selectedGrade"
              class="w-full px-2.5 py-2 border border-slate-300 rounded text-xs font-normal text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs"
            >
              <option value="" disabled>-- Select Grade --</option>
              @for (g of gradeOptions; track g.value) {
                <option [value]="g.value">{{ g.label }}</option>
              }
            </select>
          </div>
        </div>

        <div>
          <label for="modalApprovalRemarks" class="block text-xs font-medium text-slate-700 mb-1">
            Empanelment Recommendation Remarks
          </label>
          <textarea
            id="modalApprovalRemarks"
            rows="4"
            [(ngModel)]="decisionRemarks"
            placeholder="Specify official empanelment recommendation, batch allocation, or special conditions..."
            class="w-full p-2.5 border border-slate-300 rounded text-xs font-normal text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white shadow-2xs"
          ></textarea>
        </div>
      </div>
    </app-action-modal>

    <!-- ====================================================================
         REJECT APPLICATION MODAL (shared ActionModalComponent)
         ==================================================================== -->
    <app-action-modal
      [isOpen]="showRejectModal()"
      title="Reject Application"
      [description]="decisionSubtitle()"
      accentBarClass="bg-rose-600"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      maxWidthClass="max-w-lg"
      primaryLabel="Confirm Rejection"
      primaryVariant="danger"
      [disablePrimary]="!isRejectFormValid()"
      secondaryLabel="Cancel"
      (primaryAction)="confirmRejectApplication()"
      (secondaryAction)="closeModals()"
      (close)="closeModals()"
    >
      <div class="mt-4 text-xs">
        <label for="modalRejectionRemarks" class="block text-xs font-medium text-slate-700 mb-1">
          Rejection Remarks / Reason for Disqualification *
        </label>
        <textarea
          id="modalRejectionRemarks"
          rows="4"
          [(ngModel)]="decisionRemarks"
          placeholder="Specify the exact reasons, clause citations, or deficiencies observed during scrutiny..."
          class="w-full p-2.5 border border-slate-300 rounded text-xs font-normal text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-600 bg-white shadow-2xs"
        ></textarea>
        <span class="text-[11px] text-slate-400 mt-1 block">
          Please provide clear remarks for the rejection order.
        </span>
      </div>
    </app-action-modal>
  `
})
export class ScrutinyDeskComponent {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private notifications = inject(NotificationService);
  private pdfService = inject(ScrutinyPdfService);
  private destroyRef = inject(DestroyRef);

  applicant = signal<ApplicantResponse | undefined>(undefined);

  /** Subtitle shown under the accept / reject modal title. */
  readonly decisionSubtitle = computed(() => {
    const app = this.applicant();
    return app ? `${app.anonymousLabel} \u2022 ${app.id}` : '';
  });

  readonly gradeOptions = GRADE_OPTIONS;

  // Popup Modal States
  showAcceptModal = signal<boolean>(false);
  showRejectModal = signal<boolean>(false);

  // Form inputs
  technicalScore: number | null = 88;
  selectedGrade = 'Grade A';
  decisionRemarks = '';

  // Proper Document Viewer State
  activeDoc = signal<ActivePreviewDocument | null>(null);

  isDownloadingZip = signal<boolean>(false);

  private notifyDecisionCommitted(): void {
    this.notifications.success(
      `The decision for ${this.applicant()?.anonymousLabel ?? 'this applicant'} has been recorded.`,
      'Scrutiny Decision Successfully Committed'
    );
  }

  constructor() {
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
      if (data?.scrutinyDetails?.technicalScore) {
        this.technicalScore = data.scrutinyDetails.technicalScore;
        this.selectedGrade = data.scrutinyDetails.grade || 'Grade A';
        this.decisionRemarks = data.scrutinyDetails.remarks || '';
      }
    });
  }

  onScoreChange(val: number): void {
    if (val !== null && val !== undefined) {
      const clamped = clampScore(val);
      this.technicalScore = clamped;
      this.selectedGrade = gradeFromScore(clamped);
    }
  }

  openAcceptModal(): void {
    this.decisionRemarks = this.applicant()?.scrutinyDetails?.remarks ||
      'Bidder satisfies all technical thresholds, infrastructure capacity, and statutory documentation requirements for Category I empanelment.';
    this.showAcceptModal.set(true);
  }

  openRejectModal(): void {
    this.decisionRemarks = this.applicant()?.scrutinyDetails?.remarks || '';
    this.showRejectModal.set(true);
  }

  closeModals(): void {
    this.showAcceptModal.set(false);
    this.showRejectModal.set(false);
  }

  isAcceptFormValid(): boolean {
    return isAcceptFormValid(this.technicalScore, this.selectedGrade);
  }

  isRejectFormValid(): boolean {
    return isRejectFormValid(this.decisionRemarks);
  }

  confirmAcceptApplication(): void {
    const app = this.applicant();
    if (!app || this.technicalScore === null) return;

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'APPROVED',
      technicalScore: this.technicalScore,
      grade: this.selectedGrade as GradeLabel,
      remarks: this.decisionRemarks
    });

    this.closeModals();
    this.notifyDecisionCommitted();
    this.loadApplicant(app.id);
  }

  confirmRejectApplication(): void {
    const app = this.applicant();
    if (!app || !this.isRejectFormValid()) return;

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'REJECTED',
      technicalScore: this.technicalScore || 0,
      grade: (this.selectedGrade || 'Grade E') as GradeLabel,
      remarks: this.decisionRemarks,
      disqualificationReason: this.decisionRemarks
    });

    this.closeModals();
    this.notifyDecisionCommitted();
    this.loadApplicant(app.id);
  }

  /** Opens the Document / PDF Viewer for a dossier document. */
  openOfficialDoc(doc: DossierDocument): void {
    this.activeDoc.set(toActivePreviewDocument(doc, this.applicant()?.id));
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
