import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AspirantService } from '../services/aspirant.service';
import { AspirantRecord, AspirantTrainingStatus } from '../models/aspirant.model';
import { AspirantDocumentItem } from '../config/aspirant-form.config';
import { PageHeaderComponent } from '../../../shared/components';
import { AspirantSummaryComponent } from './aspirant-detail/aspirant-summary.component';
import { AspirantIdentityViewComponent } from './aspirant-detail/aspirant-identity-view.component';
import { AspirantAddressViewComponent } from './aspirant-detail/aspirant-address-view.component';
import { AspirantBankViewComponent } from './aspirant-detail/aspirant-bank-view.component';
import { AspirantDocumentsTableComponent } from './aspirant-detail/aspirant-documents-table.component';
import { AspirantPersonalEditComponent } from './aspirant-detail/aspirant-personal-edit.component';
import { AspirantAddressEditComponent } from './aspirant-detail/aspirant-address-edit.component';
import { AspirantBankEditComponent } from './aspirant-detail/aspirant-bank-edit.component';
import { AspirantDocumentsEditComponent } from './aspirant-detail/aspirant-documents-edit.component';
import { AspirantAddDocumentModalComponent } from './aspirant-detail/aspirant-add-document-modal.component';
import { AspirantEditDocumentModalComponent } from './aspirant-detail/aspirant-edit-document-modal.component';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';
import {
  buildFallbackDocuments,
  buildFallbackEditDocuments,
  formatFileSize,
  todayIsoDate
} from './aspirant-detail/aspirant-document.util';

@Component({
  selector: 'app-aspirant-detail',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    AspirantSummaryComponent,
    AspirantIdentityViewComponent,
    AspirantAddressViewComponent,
    AspirantBankViewComponent,
    AspirantDocumentsTableComponent,
    AspirantPersonalEditComponent,
    AspirantAddressEditComponent,
    AspirantBankEditComponent,
    AspirantDocumentsEditComponent,
    AspirantAddDocumentModalComponent,
    AspirantEditDocumentModalComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans pb-16" style="font-family: 'Inter', sans-serif;">
      
      @if (aspirant(); as cand) {
        <div class="p-4 sm:p-6 space-y-5 w-full">
          
          <!-- Top Page Header -->
          <app-page-header
            [title]="cand.aspirantName + ' (' + cand.id + ')'"
            bgColor="var(--color-primary, #174A6E)"
            [showBack]="true"
            backUrl="/aspirants"
            backTitle="Back to Aspirants Roster"
          ></app-page-header>

          <!-- Notification / Success Alert Banner -->
          @if (successMessage()) {
            <div class="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in shadow-xs">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="font-medium">{{ successMessage() }}</span>
              </div>
              <button (click)="successMessage.set('')" class="text-emerald-600 hover:text-emerald-900 cursor-pointer font-bold px-1">✕</button>
            </div>
          }

          <!-- Candidate Hero Card + Training Center & Batch Context Strip -->
          <app-aspirant-summary
            [aspirant]="cand"
            [displayName]="isEditMode() ? (editForm.aspirantName || cand.aspirantName) : cand.aspirantName"
            [displayStatus]="isEditMode() ? (editForm.trainingStatus || cand.trainingStatus) : cand.trainingStatus"
            (statusChange)="updateStatus($event)"
          ></app-aspirant-summary>

          <!-- VIEW MODE: All candidate particulars displayed in clean structured cards -->
          @if (!isEditMode()) {

            <div class="space-y-5">
              <app-aspirant-identity-view
                [aspirant]="cand"
                (edit)="startEditing(cand)"
                (previewAadhaar)="previewAadhaarProof(cand)"
              ></app-aspirant-identity-view>

              <app-aspirant-address-view [aspirant]="cand" (edit)="startEditing(cand)"></app-aspirant-address-view>

              <app-aspirant-bank-view [aspirant]="cand" (edit)="startEditing(cand)"></app-aspirant-bank-view>

              <app-aspirant-documents-table
                [aspirant]="cand"
                (addDocument)="openAddDocModal()"
                (preview)="openPreviewDoc($event)"
                (replaceFile)="onDocFileReplaced($event.doc, $event.file)"
                (editDoc)="openEditDocModal($event)"
                (deleteDoc)="deleteDocument($event)"
              ></app-aspirant-documents-table>
            </div>

          } @else {

            <!-- EDIT MODE: Interactive Form Inputs for Candidate Particulars & Documents -->
            <form (ngSubmit)="saveChanges()" class="space-y-6">

              <app-aspirant-personal-edit [form]="editForm" (notify)="showSuccess($event)"></app-aspirant-personal-edit>

              <app-aspirant-address-edit [form]="editForm"></app-aspirant-address-edit>

              <app-aspirant-bank-edit [form]="editForm"></app-aspirant-bank-edit>

              <app-aspirant-documents-edit [form]="editForm" (notify)="showSuccess($event)"></app-aspirant-documents-edit>

              <!-- Form Submit Actions Bar -->
              <div class="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  (click)="cancelEditing()"
                  class="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2.5 bg-primary hover:bg-primary-dark active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
                  style="color: #ffffff !important; background-color: #174A6E !important;"
                >
                  <svg class="w-4 h-4" style="color: #ffffff !important; stroke: #ffffff !important;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style="color: #ffffff !important;">Save All Changes</span>
                </button>
              </div>

            </form>

          }

        </div>
      } @else {
        <!-- Candidate Not Found Empty State -->
        <div class="p-8 max-w-lg mx-auto text-center space-y-4 pt-16">
          <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            👤
          </div>
          <h2 class="text-base font-bold text-slate-800">Aspirant Record Not Found</h2>
          <p class="text-xs text-slate-500">The requested aspirant identifier does not exist or has been removed from the roster.</p>
          <a
            routerLink="/aspirants"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs hover:bg-primary-dark"
            style="color: #ffffff !important;"
          >
            &larr; Return to Aspirants Roster
          </a>
        </div>
      }

      <!-- MODAL: ADD NEW DOCUMENT DIALOG -->
      @if (showAddDocModal()) {
        <app-aspirant-add-document-modal
          (save)="saveNewDocument($event)"
          (close)="showAddDocModal.set(false)"
        ></app-aspirant-add-document-modal>
      }

      <!-- MODAL: EDIT DOCUMENT TITLE & TYPE DIALOG -->
      @if (editingDoc(); as doc) {
        <app-aspirant-edit-document-modal
          [doc]="doc"
          (save)="saveDocEdit($event)"
          (close)="editingDoc.set(null)"
        ></app-aspirant-edit-document-modal>
      }

    </div>
  `
})
export class AspirantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private aspirantService = inject(AspirantService);
  private docViewer = inject(DocumentViewerService);

  aspirant = signal<AspirantRecord | null>(null);
  isEditMode = signal<boolean>(false);
  successMessage = signal<string>('');

  // Document management signals
  previewDoc = signal<AspirantDocumentItem | null>(null);
  editingDoc = signal<AspirantDocumentItem | null>(null);
  showAddDocModal = signal<boolean>(false);

  editForm: Partial<AspirantRecord> = {};

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAspirant(id);
      }
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queryParams => {
      if (queryParams.get('edit') === 'true') {
        this.isEditMode.set(true);
      }
    });
  }

  loadAspirant(id: string): void {
    let cand = this.aspirantService.getAspirantById(id);
    if (cand) {
      // Ensure documents array is safely initialized with fallback documents if empty
      if (!cand.documents || cand.documents.length === 0) {
        cand = { ...cand, documents: buildFallbackDocuments(cand) };
      }
      this.aspirant.set(cand);
      this.editForm = JSON.parse(JSON.stringify(cand));
    } else {
      this.aspirant.set(null);
    }
  }

  startEditing(cand: AspirantRecord): void {
    this.editForm = JSON.parse(JSON.stringify(cand));
    if (!this.editForm.documents || this.editForm.documents.length === 0) {
      this.editForm.documents = buildFallbackEditDocuments(cand);
    }
    this.isEditMode.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEditing(): void {
    const current = this.aspirant();
    if (current) {
      this.editForm = JSON.parse(JSON.stringify(current));
    }
    this.isEditMode.set(false);
  }

  saveChanges(): void {
    const current = this.aspirant();
    if (!current) return;

    const updated = this.aspirantService.updateAspirant(current.id, this.editForm);
    if (updated) {
      this.aspirant.set(updated);
      this.isEditMode.set(false);
      this.showSuccess(`Aspirant particulars and documents updated successfully!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateStatus(newStatus: AspirantTrainingStatus): void {
    const current = this.aspirant();
    if (!current) return;

    this.aspirantService.updateTrainingStatus(current.id, newStatus);
    this.aspirant.update(c => c ? { ...c, trainingStatus: newStatus } : null);
    this.editForm.trainingStatus = newStatus;
    this.showSuccess(`Training status changed to "${newStatus}"!`);
  }

  toggleBiometric(): void {
    const current = this.aspirant();
    if (!current) return;

    this.aspirantService.toggleBiometric(current.id);
    this.aspirant.update(c => c ? { ...c, biometricVerified: !c.biometricVerified } : null);
    this.showSuccess(`Biometric verification status updated!`);
  }

  // =========================================================================
  // DOCUMENT MANAGEMENT & REPLACEMENT METHODS
  // =========================================================================

  onDocFileReplaced(doc: AspirantDocumentItem, file: File): void {
    this.replaceDocumentFile(doc.id, file.name, formatFileSize(file.size));
  }

  replaceDocumentFile(docId: string, newFileName: string, newFileSize: string): void {
    const current = this.aspirant();
    if (!current) return;

    const updatedDocs = (current.documents || []).map(d => {
      if (d.id === docId) {
        return {
          ...d,
          fileName: newFileName,
          fileSize: newFileSize,
          status: 'UPLOADED' as const,
          uploadedAt: todayIsoDate()
        };
      }
      return d;
    });

    const isAadhaarDoc = docId === 'doc-1' || docId === 'd1';
    const updated = this.aspirantService.updateAspirant(current.id, {
      documents: updatedDocs,
      ...(isAadhaarDoc ? { aadhaarDocName: newFileName, aadhaarDocSize: newFileSize } : {})
    });

    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.showSuccess(`Document file replaced with "${newFileName}" successfully!`);
    }
  }

  // Aadhaar Specific Replace
  previewAadhaarProof(cand: AspirantRecord): void {
    const aadhaarDoc: AspirantDocumentItem = {
      id: 'doc-aadhaar',
      docType: 'Aadhaar Card',
      docName: 'Aadhaar Card Document Proof',
      fileName: cand.aadhaarDocName || 'Aadhaar_Document.pdf',
      fileSize: cand.aadhaarDocSize || '1.4 MB',
      status: 'UPLOADED',
      uploadedAt: cand.enrollmentDate
    };
    this.openPreviewDoc(aadhaarDoc);
  }

  onAadhaarDocReplaced(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileSize = formatFileSize(file.size);
      const current = this.aspirant();
      if (!current) return;

      const updatedDocs = (current.documents || []).map(d => {
        if (d.docType.toLowerCase().includes('aadhaar')) {
          return { ...d, fileName: file.name, fileSize, status: 'UPLOADED' as const };
        }
        return d;
      });

      const updated = this.aspirantService.updateAspirant(current.id, {
        aadhaarDocName: file.name,
        aadhaarDocSize: fileSize,
        documents: updatedDocs
      });

      if (updated) {
        this.aspirant.set(updated);
        this.editForm = JSON.parse(JSON.stringify(updated));
        this.showSuccess(`Aadhaar proof document replaced with "${file.name}"!`);
      }
      input.value = '';
    }
  }

  openPreviewDoc(doc: AspirantDocumentItem): void {
    this.docViewer.openDocument({
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      uploadDate: doc.uploadedAt || 'Verified',
      status: 'uploaded'
    }, doc.docName);
  }

  closePreview(): void {
    this.previewDoc.set(null);
  }

  onModalReplaceFile(doc: AspirantDocumentItem, file: File): void {
    const fileSize = formatFileSize(file.size);
    this.replaceDocumentFile(doc.id, file.name, fileSize);
    this.previewDoc.update(cur => cur ? { ...cur, fileName: file.name, fileSize } : null);
  }

  downloadSampleDoc(doc: AspirantDocumentItem): void {
    this.showSuccess(`Downloading document: ${doc.fileName}...`);
  }

  openEditDocModal(doc: AspirantDocumentItem): void {
    this.editingDoc.set({ ...doc });
  }

  saveDocEdit(doc: AspirantDocumentItem): void {
    const current = this.aspirant();
    if (!current) return;

    const updatedDocs = (current.documents || []).map(d => d.id === doc.id ? doc : d);
    const updated = this.aspirantService.updateAspirant(current.id, { documents: updatedDocs });
    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.editingDoc.set(null);
      this.showSuccess(`Document details updated successfully!`);
    }
  }

  deleteDocument(doc: AspirantDocumentItem): void {
    if (!confirm(`Are you sure you want to remove the document "${doc.docName}"?`)) return;

    const current = this.aspirant();
    if (!current) return;

    const updatedDocs = (current.documents || []).filter(d => d.id !== doc.id);
    const updated = this.aspirantService.updateAspirant(current.id, { documents: updatedDocs });
    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.showSuccess(`Document "${doc.docName}" removed from records.`);
    }
  }

  openAddDocModal(): void {
    this.showAddDocModal.set(true);
  }

  saveNewDocument(form: Partial<AspirantDocumentItem>): void {
    if (!form.docType || !form.docName) {
      alert('Please fill in the document type and title.');
      return;
    }

    const current = this.aspirant();
    if (!current) return;

    const newDoc: AspirantDocumentItem = {
      id: 'doc-' + Date.now(),
      docType: form.docType || 'Supporting Document',
      docName: form.docName || 'Document Attachment',
      fileName: form.fileName || `${form.docName?.replace(/\s+/g, '_')}.pdf`,
      fileSize: form.fileSize || '1.2 MB',
      status: 'UPLOADED',
      uploadedAt: todayIsoDate()
    };

    const updatedDocs = [...(current.documents || []), newDoc];
    const updated = this.aspirantService.updateAspirant(current.id, { documents: updatedDocs });
    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.showAddDocModal.set(false);
      this.showSuccess(`New document "${newDoc.docName}" attached successfully!`);
    }
  }

  showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => {
      if (this.successMessage() === msg) {
        this.successMessage.set('');
      }
    }, 4500);
  }

  printDossier(cand: AspirantRecord): void {
    window.print();
  }
}
8