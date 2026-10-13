import { Component, DestroyRef, computed, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentViewerService } from '../../core/services/document-viewer.service';
import { formatDateMedium } from '../../shared/utils';
import { FileDoc } from '../registration/models/otr-form.model';
import {
  ShortfallRequest,
  SubmittedTender,
  SubmittedTenderDoc
} from '../../core/models/tender.model';
import { ShortfallBridgeService } from '../eoi/services/shortfall-bridge.service';
import { TenderShortfallSectionComponent } from './tender-status/tender-shortfall-section.component';
import { ShortfallResponseModalComponent, ShortfallSubmission } from './tender-status/shortfall-response-modal.component';
import { openShortfalls, withShortfallResponse } from './tender-status/tender-shortfall.util';
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
  remainingEdits
} from './tender-status/tender-status.util';

export type { SubmittedTender, SubmittedTenderDoc };

@Component({
  selector: 'app-tender-status',
  standalone: true,
  imports: [
    TenderListComponent,
    TenderDetailHeaderComponent,
    TenderEditStatusComponent,
    TenderOrgSectionComponent,
    TenderSignatorySectionComponent,
    TenderBankSectionComponent,
    TenderDocumentsTableComponent,
    TenderStep5EmdComponent,
    TenderShortfallSectionComponent,
    ShortfallResponseModalComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans">

      <!-- VIEW 1: TENDER STATUS MAIN TABLE -->
      @if (!selectedTender()) {
        <app-tender-list
          [tenders]="tenders()"
          [(searchQuery)]="searchQuery"
          (open)="openApplicationPage($event)"
          (respond)="startShortfallResponse($event)"
        />
      }

      <!-- VIEW 2: SUBMISSION DETAIL / EDIT -->
      @if (selectedTender()) {
        <div class="px-4 sm:px-5 lg:px-6 py-4 sm:py-5 space-y-5 font-sans animate-in fade-in duration-150">

          <app-tender-detail-header
            [tender]="selectedTender()!"
            [isEditing]="isEditing()"
            (back)="backToTenderList()"
            (edit)="startEditing()"
            (save)="saveEdits()"
            (cancel)="cancelEditing()"
            (print)="printApplication()"
          />

          @if (pendingNoticeCount() > 0) {
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900" role="alert">
              <p class="m-0 text-[13px] leading-snug">
                <strong class="font-semibold">Shortfall request:</strong>
                the department has asked for more documents on this application ({{ pendingNoticeCount() }} pending).
              </p>
              <button
                type="button"
                (click)="startShortfallResponse(selectedTender()!)"
                class="shrink-0 px-3 py-1.5 rounded-md bg-navy hover:bg-navy-dark text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Respond
              </button>
            </div>
          }

          <app-tender-edit-status [tender]="selectedTender()!" [isEditing]="isEditing()" />

          <!-- APPLICATION SECTIONS PROPERLY NUMBERED -->
          <div class="space-y-5 text-xs">
            <!-- Step 1: OTR Profile Details (Org, Signatory, Bank) -->
            <app-tender-org-section
              [app]="currentApplication()"
              [editable]="editableTender"
              [isEditing]="isEditing()"
              (viewDoc)="onViewDoc($event)"
              (replaceOtrDoc)="onReplaceOtrDoc($event)"
            />

            <app-tender-signatory-section
              [app]="currentApplication()"
              [editable]="editableTender"
              [isEditing]="isEditing()"
              (viewDoc)="onViewDoc($event)"
              (replaceOtrDoc)="onReplaceOtrDoc($event)"
            />

            <app-tender-bank-section
              [app]="currentApplication()"
              [editable]="editableTender"
              [isEditing]="isEditing()"
              (viewDoc)="onViewDoc($event)"
              (replaceOtrDoc)="onReplaceOtrDoc($event)"
            />

            <!-- Step 2: Mandated Proposal Documents & Annexures (16 files) -->
            <app-tender-documents-table
              [documents]="currentApplication().documents"
              [isEditing]="isEditing()"
              (viewDoc)="onViewDoc($event)"
              (replaceDoc)="onReplaceDoc($event)"
            />

            <!-- Step 3: Statutory Fees Payment Details (Processing Fee & EMD Table) -->
            <app-tender-step5-emd [app]="currentApplication()" />

            <!-- Shortfall requests from the department and the response history -->
            <app-tender-shortfall-section
              [app]="selectedTender()!"
              (respond)="openShortfallModal(selectedTender()!, $event)"
              (viewDoc)="onViewDoc($event)"
            />
          </div>

        </div>
      }

      <app-shortfall-response-modal
        [isOpen]="!!respondingRequest()"
        [request]="respondingRequest()"
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

  // Selected tender state for full page view
  selectedTender = signal<SubmittedTender | null>(null);
  editableTender: SubmittedTender | null = null;
  isEditing = signal<boolean>(false);

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

  constructor() {
    this.tenderRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => this.tenders.set(list));
  }

  currentApplication(): SubmittedTender {
    return this.editableTender || this.selectedTender()!;
  }

  openApplicationPage(tender: SubmittedTender): void {
    this.selectedTender.set(tender);
    this.editableTender = null;
    this.isEditing.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToTenderList(): void {
    this.selectedTender.set(null);
    this.editableTender = null;
    this.isEditing.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startEditing(): void {
    const tender = this.selectedTender();
    if (!tender) return;

    if (!canEditTender(tender)) {
      if (tender.editCount >= 3) {
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
    const updated = { ...this.editableTender, shortfalls: this.selectedTender()!.shortfalls };

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

  printApplication(): void {
    window.print();
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
    const updated: SubmittedTender = { ...tender, shortfalls };

    this.tenders.update(list => list.map(t => (t.id === updated.id ? updated : t)));
    if (this.selectedTender()?.id === updated.id) this.selectedTender.set(updated);

    this.tenderRepo.update(updated.id, { shortfalls }).subscribe();
    this.shortfallBridge
      .notifyDepartment(updated, notice, submission.response)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.closeShortfallModal();
    this.notify.success('Your response to the shortfall request has been submitted.');
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
