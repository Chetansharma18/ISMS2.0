import { Component, DestroyRef, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentViewerService } from '../../core/services/document-viewer.service';
import { formatDateMedium } from '../../shared/utils';
import { FileDoc } from '../registration/models/otr-form.model';
import {
  SubmittedTender,
  SubmittedTenderDoc
} from '../../core/models/tender.model';
import { DataEngineService } from '../../core/services/data-engine.service';
import { NotificationService } from '../../core/services/notification.service';
import { TenderListComponent } from './tender-status/tender-list.component';
import { TenderDetailHeaderComponent } from './tender-status/tender-detail-header.component';
import { TenderEditStatusComponent } from './tender-status/tender-edit-status.component';
import { TenderFeeSummaryComponent } from './tender-status/tender-fee-summary.component';
import { TenderOrgSectionComponent } from './tender-status/tender-org-section.component';
import { TenderSignatorySectionComponent } from './tender-status/tender-signatory-section.component';
import { TenderBankSectionComponent } from './tender-status/tender-bank-section.component';
import { TenderDocumentsTableComponent } from './tender-status/tender-documents-table.component';
import { TenderReceiptsSectionComponent } from './tender-status/tender-receipts-section.component';
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
    TenderFeeSummaryComponent,
    TenderOrgSectionComponent,
    TenderSignatorySectionComponent,
    TenderBankSectionComponent,
    TenderDocumentsTableComponent,
    TenderReceiptsSectionComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans">

      <!-- VIEW 1: TENDER STATUS MAIN TABLE -->
      @if (!selectedTender()) {
        <app-tender-list
          [tenders]="tenders()"
          [(searchQuery)]="searchQuery"
          (open)="openApplicationPage($event)"
        />
      }

      <!-- VIEW 2: SUBMISSION DETAIL / EDIT -->
      @if (selectedTender()) {
        <div class="p-4 sm:p-6 lg:p-8 space-y-5 font-sans animate-in fade-in duration-150">

          <app-tender-detail-header
            [tender]="selectedTender()!"
            [isEditing]="isEditing()"
            (back)="backToTenderList()"
            (edit)="startEditing()"
            (save)="saveEdits()"
            (cancel)="cancelEditing()"
            (print)="printApplication()"
          />

          <app-tender-edit-status [tender]="selectedTender()!" [isEditing]="isEditing()" />

          <app-tender-fee-summary [app]="currentApplication()" />

          <!-- ALL APPLICATION SECTIONS IN ONE CONTINUOUS PAGE -->
          <div class="space-y-5 text-xs">
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

            <app-tender-documents-table
              [documents]="currentApplication().documents"
              [isEditing]="isEditing()"
              (viewDoc)="onViewDoc($event)"
              (replaceDoc)="onReplaceDoc($event)"
            />

            <app-tender-receipts-section [app]="currentApplication()" />
          </div>

        </div>
      }

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

  tenders = signal<SubmittedTender[]>([]);

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
    this.notify.warning(`Editing active. You have ${remainingEdits(tender)} edit(s) remaining.`);
  }

  saveEdits(): void {
    if (!this.editableTender || !this.selectedTender()) return;

    // Increment edit count by 1
    const newEditCount = (this.editableTender.editCount || 0) + 1;
    this.editableTender.editCount = newEditCount;

    const updated = { ...this.editableTender };

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
