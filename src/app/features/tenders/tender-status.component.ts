import { Component, DestroyRef, computed, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentViewerService } from '../../core/services/document-viewer.service';
import { formatDateMedium } from '../../shared/utils';
import { ButtonComponent, IconComponent, IconName } from '../../shared';
import { FileDoc } from '../registration/models/otr-form.model';
import {
  ShortfallRequest,
  SubmittedTender,
  SubmittedTenderDoc,
  TenderAppeal
} from '../../core/models/tender.model';
import { ShortfallBridgeService } from '../eoi/services/shortfall-bridge.service';
import { ShortfallResponseModalComponent, ShortfallSubmission } from './tender-status/shortfall-response-modal.component';
import { openShortfalls, withShortfallResponse } from './tender-status/tender-shortfall.util';
import { TenderAppealSectionComponent } from './tender-status/tender-appeal-section.component';
import { AppealModalComponent } from './tender-status/appeal-modal.component';
import { canAppeal, remainingDaysText } from './tender-status/tender-appeal.util';
import { DataEngineService } from '../../core/services/data-engine.service';
import { NotificationService } from '../../core/services/notification.service';
import { TenderListComponent } from './tender-status/tender-list.component';
import { TenderDetailHeaderComponent } from './tender-status/tender-detail-header.component';
import { TenderEditStatusComponent } from './tender-status/tender-edit-status.component';
import { TenderOrgSectionComponent } from './tender-status/tender-org-section.component';
import { TenderSignatorySectionComponent } from './tender-status/tender-signatory-section.component';
import { TenderBankSectionComponent } from './tender-status/tender-bank-section.component';
import { TenderDocumentsTableComponent } from './tender-status/tender-documents-table.component';
import { TenderStep5EmdComponent } from './tender-status/tender-step5-emd.component';
import {
  TenderDocReplaceRequest,
  TenderDocViewRequest,
  TenderProposalDocReplaceRequest
} from './tender-status/tender-doc-card.component';
import {
  applyOtrDocument,
  canEditTender,
  formatUploadedFileSize,
  remainingEdits,
  TenderDetailTab,
  TenderOpenEvent
} from './tender-status/tender-status.util';

export type { SubmittedTender, SubmittedTenderDoc, TenderDetailTab, TenderOpenEvent };

interface TenderDetailTabItem {
  id: TenderDetailTab;
  label: string;
  icon: IconName;
  badge?: number | string;
  badgeColor?: 'amber' | 'rose';
}

@Component({
  selector: 'app-tender-status',
  standalone: true,
  imports: [
    ButtonComponent,
    IconComponent,
    TenderListComponent,
    TenderDetailHeaderComponent,
    TenderEditStatusComponent,
    TenderOrgSectionComponent,
    TenderSignatorySectionComponent,
    TenderBankSectionComponent,
    TenderDocumentsTableComponent,
    TenderStep5EmdComponent,
    TenderAppealSectionComponent,
    ShortfallResponseModalComponent,
    AppealModalComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans">

      <!-- VIEW 1: TENDER STATUS MAIN TABLE -->
      @if (!selectedTender()) {
        <app-tender-list
          [tenders]="tenders()"
          [(searchQuery)]="searchQuery"
          [(statusFilter)]="statusFilter"
          [(filterValues)]="filterValues"
          (open)="openApplicationPage($event.tender, $event.tab)"
          (respond)="openShortfallFromList($event)"
          (appeal)="openAppealFromList($event)"
        />
      }

      <!-- VIEW 2: SUBMISSION DETAIL / EDIT -->
      @if (selectedTender()) {
        <div class="px-4 sm:px-5 lg:px-6 py-4 sm:py-5 space-y-4 font-sans animate-in fade-in duration-150">

          <app-tender-detail-header
            [tender]="selectedTender()!"
            [isEditing]="isEditing()"
            (back)="backToTenderList()"
            (edit)="startEditing()"
            (save)="saveEdits()"
            (cancel)="cancelEditing()"
          />

          @if (hasAlerts()) {
            <div class="space-y-1.5">
              @if (canAppealSelected()) {
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-900 text-xs" role="alert">
                  <p class="m-0 text-xs leading-snug">
                    <strong class="font-semibold">Rejected:</strong>
                    {{ selectedTender()!.rejectionReason || 'Technical qualification criteria not met.' }}
                    <span class="text-rose-700 font-medium ml-1">(Action required: 7 days to appeal and respond with documents)</span>
                  </p>
                  <button appButton size="xs" type="button" (click)="openAppealFlow()" class="shrink-0">
                    Appeal Request
                  </button>
                </div>
              } @else if (selectedTender()?.submittedStatus === 'Rejected' && selectedTender()?.appeal?.status === 'Rejected') {
                <div class="flex items-start gap-2 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-900 text-xs" role="alert">
                  <app-icon name="close" size="sm" class="text-rose-600 shrink-0 mt-0.5" />
                  <div class="space-y-0.5">
                    <p class="m-0 text-xs leading-snug">
                      <strong class="font-semibold">Application Rejected:</strong>
                      {{ selectedTender()!.appeal?.rejectionReason || selectedTender()!.rejectionReason || 'Appeal rejected after review.' }}
                    </p>
                    <p class="m-0 text-[11px] text-rose-700">
                      Your appeal has been reviewed and rejected by the scrutiny committee. Only one appeal is permitted per application.
                    </p>
                  </div>
                </div>
              } @else if (selectedTender()?.appeal && selectedTender()?.appeal?.status !== 'Rejected' && selectedTender()?.submittedStatus !== 'Approved') {
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs" role="alert">
                  <app-icon name="alert-triangle" size="sm" class="text-amber-600 shrink-0" />
                  <p class="m-0 text-xs leading-snug">
                    <strong class="font-semibold">Appeal Under Review:</strong>
                    Your appeal request and supporting documents submitted on {{ selectedTender()!.appeal!.submittedOn }} are currently under review by the department scrutiny committee.
                  </p>
                </div>
              }

              @if (isEditing()) {
                <app-tender-edit-status [tender]="selectedTender()!" [isEditing]="isEditing()" />
              }
            </div>
          }

          <!-- HORIZONTAL NAVIGATION TABS -->
          <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 py-2 -mx-4 sm:-mx-5 lg:-mx-6 px-4 sm:px-5 lg:px-6 shadow-2xs">
            <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar w-full">
              @for (tab of tabs(); track tab.id) {
                <button
                  appButton
                  [variant]="activeTab() === tab.id ? 'primary' : 'ghost'"
                  size="sm"
                  type="button"
                  (click)="setActiveTab(tab.id)"
                  class="flex-1 min-w-fit justify-center text-xs font-semibold whitespace-nowrap"
                >
                  <app-icon [name]="tab.icon" size="sm" />
                  <span>{{ tab.label }}</span>
                  @if (tab.badge !== undefined && tab.badge !== null) {
                    <span
                      class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10.5px] font-bold"
                      [class.bg-white/20]="activeTab() === tab.id"
                      [class.text-white]="activeTab() === tab.id"
                      [class.bg-slate-100]="activeTab() !== tab.id && !tab.badgeColor"
                      [class.text-slate-700]="activeTab() !== tab.id && !tab.badgeColor"
                      [class.bg-amber-100]="activeTab() !== tab.id && tab.badgeColor === 'amber'"
                      [class.text-amber-800]="activeTab() !== tab.id && tab.badgeColor === 'amber'"
                      [class.bg-rose-100]="activeTab() !== tab.id && tab.badgeColor === 'rose'"
                      [class.text-rose-800]="activeTab() !== tab.id && tab.badgeColor === 'rose'"
                    >
                      {{ tab.badge }}
                    </span>
                  }
                </button>
              }
            </div>
          </div>

          <!-- TAB CONTENT PANELS -->
          <div class="space-y-5 text-xs">

            <!-- TAB: ORGANISATION DETAILS -->
            @if (activeTab() === 'organisation') {
              <app-tender-org-section
                [app]="currentApplication()"
                [editable]="editableTender"
                [isEditing]="isEditing()"
                (viewDoc)="onViewDoc($event)"
                (replaceOtrDoc)="onReplaceOtrDoc($event)"
              />
            }

            <!-- TAB: AUTHORIZED SIGNATORY -->
            @if (activeTab() === 'signatory') {
              <app-tender-signatory-section
                [app]="currentApplication()"
                [editable]="editableTender"
                [isEditing]="isEditing()"
                (viewDoc)="onViewDoc($event)"
                (replaceOtrDoc)="onReplaceOtrDoc($event)"
              />
            }

            <!-- TAB: BANK DETAILS -->
            @if (activeTab() === 'bank') {
              <app-tender-bank-section
                [app]="currentApplication()"
                [editable]="editableTender"
                [isEditing]="isEditing()"
                (viewDoc)="onViewDoc($event)"
                (replaceOtrDoc)="onReplaceOtrDoc($event)"
              />
            }

            <!-- TAB: MANDATED PROPOSAL DOCUMENTS -->
            @if (activeTab() === 'documents') {
              <app-tender-documents-table
                [documents]="currentApplication().documents"
                [isEditing]="isEditing()"
                (viewDoc)="onViewDoc($event)"
                (replaceDoc)="onReplaceDoc($event)"
              />
            }

            <!-- TAB: STATUTORY PAYMENTS & RECEIPTS -->
            @if (activeTab() === 'fees') {
              <app-tender-step5-emd [app]="currentApplication()" />
            }

            <!-- TAB: APPEAL REQUEST & DEPARTMENT RESPONSE -->
            @if (activeTab() === 'shortfall') {
              <app-tender-appeal-section
                [app]="selectedTender()!"
                (requestAppeal)="startAppeal(selectedTender()!)"
                (viewDoc)="onViewDoc($event)"
              />
            }

          </div>

        </div>
      }

      <app-appeal-modal
        [isOpen]="!!appealingTender()"
        [tender]="appealingTender()"
        (submitted)="submitAppeal($event)"
        (close)="appealingTender.set(null)"
      />

      <app-shortfall-response-modal
        [isOpen]="!!respondingRequest()"
        [request]="respondingRequest()"
        [isAppeal]="!!selectedTender()?.appeal"
        (submitted)="submitShortfallResponse($event)"
        (close)="closeShortfallModal()"
      />

    </div>
  `
})
export class TenderStatusComponent {
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchQuery = signal('');
  readonly statusFilter = signal('ALL');
  readonly filterValues = signal<Record<string, string>>({});

  // Selected tender state for full page view
  selectedTender = signal<SubmittedTender | null>(null);
  editableTender: SubmittedTender | null = null;
  isEditing = signal<boolean>(false);

  // Active navigation tab
  readonly activeTab = signal<TenderDetailTab>('organisation');

  private readonly docViewer = inject(DocumentViewerService);

  private readonly tenderRepo = inject(DataEngineService).for<SubmittedTender>('SUBMITTED_TENDERS');
  private readonly shortfallBridge = inject(ShortfallBridgeService);

  tenders = signal<SubmittedTender[]>([]);

  // Revert (shortfall) response flow
  private respondingTender: SubmittedTender | null = null;
  readonly respondingRequest = signal<ShortfallRequest | null>(null);

  /** Revert requests of the open application that still wait for a reply. */
  readonly pendingNoticeCount = computed(() => {
    const tender = this.selectedTender();
    return tender ? openShortfalls(tender).length : 0;
  });

  readonly latestOpenNotice = computed(() => {
    const tender = this.selectedTender();
    return tender ? openShortfalls(tender)[0] ?? null : null;
  });

  remainingDays(dueDate: string): string {
    return remainingDaysText(dueDate);
  }

  /** The rejected application whose appeal form is open. */
  readonly appealingTender = signal<SubmittedTender | null>(null);

  /** The open application is rejected and has not been appealed yet. */
  readonly canAppealSelected = computed(() => {
    const tender = this.selectedTender();
    return !!tender && canAppeal(tender);
  });

  /** Whether any notification, status or edit mode banner is active. */
  readonly hasAlerts = computed(() => {
    const t = this.selectedTender();
    if (!t) return false;
    return (
      this.canAppealSelected() ||
      (t.submittedStatus === 'Rejected' && t.appeal?.status === 'Rejected') ||
      (!!t.appeal && t.appeal.status !== 'Rejected' && t.submittedStatus !== 'Approved') ||
      this.isEditing()
    );
  });

  /** Dynamic tabs for the application detail view */
  readonly tabs = computed<TenderDetailTabItem[]>(() => {
    const tender = this.selectedTender();
    const shortfalls = this.pendingNoticeCount();
    const hasAppeal = tender ? !!tender.appeal || tender.submittedStatus === 'Rejected' : false;

    const tabs: TenderDetailTabItem[] = [
      { id: 'organisation', label: 'Organisation', icon: 'building' },
      { id: 'signatory', label: 'Authorized Person', icon: 'identification' },
      { id: 'bank', label: 'Bank Details', icon: 'bank' },
      { id: 'documents', label: 'Documents', icon: 'document', badge: tender?.documents?.length ?? 26 },
      { id: 'fees', label: 'Payments & Receipts', icon: 'document-download', badge: 3 }
    ];

    if (hasAppeal) {
      tabs.push({
        id: 'shortfall',
        label: 'Appeal',
        icon: 'alert-triangle',
        badgeColor: shortfalls > 0 ? 'amber' : (tender?.appeal?.status === 'Pending' ? 'amber' : 'rose')
      });
    }

    return tabs;
  });

  constructor() {
    this.refreshTenders();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === 'isms_mock_db_SUBMITTED_TENDERS') {
          this.refreshTenders();
        }
      });
    }
  }

  refreshTenders(): void {
    this.tenderRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => {
      this.tenders.set(list);
      const curr = this.selectedTender();
      if (curr) {
        const found = list.find(t => t.id === curr.id);
        if (found) this.selectedTender.set(found);
      }
    });
  }

  currentApplication(): SubmittedTender {
    return this.editableTender || this.selectedTender()!;
  }

  setActiveTab(tab: TenderDetailTab): void {
    this.activeTab.set(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openAppealFlow(): void {
    this.setActiveTab('shortfall');
    const tender = this.selectedTender();
    if (tender) this.startAppeal(tender);
  }

  openShortfallFlow(): void {
    this.setActiveTab('shortfall');
    const tender = this.selectedTender();
    if (tender) this.startShortfallResponse(tender);
  }

  openApplicationPage(tender: SubmittedTender, initialTab: TenderDetailTab = 'organisation'): void {
    this.selectedTender.set(tender);
    this.editableTender = null;
    this.isEditing.set(false);
    this.activeTab.set(initialTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openAppealFromList(tender: SubmittedTender): void {
    this.openApplicationPage(tender, 'shortfall');
    this.startAppeal(tender);
  }

  openShortfallFromList(tender: SubmittedTender): void {
    this.openApplicationPage(tender, 'shortfall');
    this.startShortfallResponse(tender);
  }

  backToTenderList(): void {
    this.selectedTender.set(null);
    this.editableTender = null;
    this.isEditing.set(false);
    this.activeTab.set('organisation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startEditing(): void {
    const tender = this.selectedTender();
    if (!tender) return;

    if (!canEditTender(tender)) {
      if (tender.submittedStatus !== 'Submitted') {
        this.notify.warning(`Application is ${tender.submittedStatus}. Only 'Submitted' applications can be edited.`);
      } else if (tender.editCount >= (tender.maxEdits || 3)) {
        this.notify.warning('Maximum 3 edits limit reached for this application.');
      } else {
        this.notify.error(`Submission window closed on ${tender.closingDate}. Editing is locked.`);
      }
      return;
    }

    // Deep clone active tender for editing
    this.editableTender = JSON.parse(JSON.stringify(tender));
    this.isEditing.set(true);
    this.notify.warning(`Document replacement enabled. You have ${remainingEdits(tender)} edit(s) remaining.`);
  }

  saveEdits(): void {
    if (!this.editableTender || !this.selectedTender()) return;

    // Increment edit count by 1
    const newEditCount = (this.editableTender.editCount || 0) + 1;
    this.editableTender.editCount = newEditCount;

    // Keep the latest revert requests and replies: the edit copy was taken before any reply was sent.
    const updated = { ...this.editableTender, shortfalls: this.selectedTender()!.shortfalls, appeal: this.selectedTender()!.appeal };

    // Update in reactive signal list, then persist through the data layer
    this.tenders.update(list => list.map(t => t.id === updated.id ? updated : t));
    this.tenderRepo.update(updated.id, updated).subscribe();
    this.selectedTender.set(updated);
    this.editableTender = null;
    this.isEditing.set(false);

    const remaining = Math.max(0, 3 - newEditCount);
    this.notify.success(
      `✓ Application updated successfully! Used edit ${newEditCount} of 3 (${remaining} remaining).`
    );
  }

  cancelEditing(): void {
    this.editableTender = null;
    this.isEditing.set(false);
    this.notify.warning('Edit discarded. No changes made.');
  }

  // ---- Appeal against a rejection ------------------------------------------

  startAppeal(tender: SubmittedTender): void {
    if (canAppeal(tender)) {
      this.appealingTender.set(tender);
    } else {
      this.notify.warning('An appeal has already been submitted for this application. Only one appeal is allowed.');
    }
  }

  submitAppeal(appeal: TenderAppeal): void {
    const tender = this.appealingTender();
    if (!tender || !canAppeal(tender)) return;

    const updated: SubmittedTender = { ...tender, appeal };
    this.tenders.update(list => list.map(t => (t.id === updated.id ? updated : t)));
    if (this.selectedTender()?.id === updated.id) this.selectedTender.set(updated);
    this.tenderRepo.update(updated.id, { appeal }).subscribe();
    this.shortfallBridge.notifyAppealSubmitted(updated, appeal).subscribe();

    this.appealingTender.set(null);
    this.notify.success('Your appeal has been submitted.');
  }

  // ---- Revert (shortfall) requests -----------------------------------------

  /** Opens the reply form for the oldest request that still waits for a response. */
  startShortfallResponse(tender: SubmittedTender): void {
    const next = openShortfalls(tender)[0];
    if (next) this.openShortfallModal(tender, next);
  }

  openShortfallModal(tender: SubmittedTender, request: ShortfallRequest): void {
    if (request.status !== 'Open') return;
    this.respondingTender = tender;
    this.respondingRequest.set(request);
  }

  closeShortfallModal(): void {
    this.respondingTender = null;
    this.respondingRequest.set(null);
  }

  submitShortfallResponse(submission: ShortfallSubmission): void {
    const tender = this.respondingTender;
    const notice = this.respondingRequest();
    if (!tender || !notice) return;

    const shortfalls = withShortfallResponse(tender, submission.shortfallId, submission.response);
    const updatedAppeal = tender.appeal ? {
      ...tender.appeal,
      status: 'Accepted' as const,
      response: {
        respondedOn: submission.response.respondedOn,
        remarks: submission.response.remarks,
        uploads: submission.response.uploads
      }
    } : undefined;

    const updated: SubmittedTender = { ...tender, shortfalls, appeal: updatedAppeal };

    this.tenders.update(list => list.map(t => (t.id === updated.id ? updated : t)));
    if (this.selectedTender()?.id === updated.id) this.selectedTender.set(updated);

    this.tenderRepo.update(updated.id, { shortfalls, appeal: updatedAppeal }).subscribe();
    this.shortfallBridge
      .notifyDepartment(updated, notice, submission.response)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.closeShortfallModal();
    this.notify.success(
      tender.appeal
        ? 'Your response to the appeal document request has been submitted.'
        : 'Your response to the department appeal request has been submitted.'
    );
  }

  // Document Viewer Helpers
  onViewDoc(request: TenderDocViewRequest): void {
    this.viewDoc(request.fileName, request.title, request.fileSize);
  }

  viewDoc(fileName: string, title?: string, fileSize?: string): void {
    this.docViewer.openDocument({
      fileName,
      fileSize: fileSize || '1.2 MB',
      uploadDate: 'Verified & Attached',
      status: 'uploaded'
    }, title || fileName);
  }

  onReplaceOtrDoc(request: TenderDocReplaceRequest): void {
    const input = request.event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.editableTender) return;
    const file = input.files[0];
    const fileDoc: FileDoc = {
      fileName: file.name,
      fileSize: formatUploadedFileSize(file.size),
      uploadDate: formatDateMedium(new Date()),
      status: 'uploaded'
    };

    applyOtrDocument(this.editableTender, request.docType, fileDoc);
    input.value = '';
    this.notify.success(`Updated document: ${file.name}`);
  }

  onReplaceDoc(request: TenderProposalDocReplaceRequest): void {
    const input = request.event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.editableTender) return;
    const file = input.files[0];

    const docItem = this.editableTender.documents.find(d => d.id === request.doc.id);
    if (docItem) {
      docItem.fileName = file.name;
      docItem.fileSize = formatUploadedFileSize(file.size);
      docItem.status = 'uploaded';
      this.notify.success(`Replaced ${request.doc.name} with ${file.name}`);
    }
    input.value = '';
  }
}
