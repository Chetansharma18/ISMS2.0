import { Component, DestroyRef, TemplateRef, ViewChild, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormFieldConfig, FormSdcComponent } from '../../../shared/components/form-sdc';
import { AspirantService } from '../services/aspirant.service';
import { AspirantRecord, AspirantTrainingStatus } from '../models/aspirant.model';
import {
  AspirantDocumentItem,
  calculateAgeFromDob,
  getStep1PersonalFields,
  getStep2CommAddressFields,
  getStep2ContactFields,
  getStep2PermanentAddressFields,
  getStep3EconomicWorkerFields
} from '../config/aspirant-form.config';
import { ButtonComponent, FormSectionComponent, FormSelectComponent, IconComponent, PageShellComponent } from '../../../shared';
import { AspirantViewComponent } from './aspirant-detail/aspirant-view.component';
import { AspirantDocumentsTableComponent } from './aspirant-detail/aspirant-documents-table.component';
import { AspirantAddDocumentModalComponent } from './aspirant-detail/aspirant-add-document-modal.component';
import { AspirantEditDocumentModalComponent } from './aspirant-detail/aspirant-edit-document-modal.component';
import { AspirantAadhaarUploadComponent } from './aspirant-mapping/aspirant-aadhaar-upload.component';
import { validateAddressStep, validateIdentityStep } from './aspirant-mapping/aspirant-mapping.validation';
import { ASPIRANT_STATUS_LABEL, aspirantStatusClass } from './aspirant-list.component';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';
import {
  buildFallbackDocuments,
  buildFallbackEditDocuments,
  formatFileSize,
  todayIsoDate
} from './aspirant-detail/aspirant-document.util';

/**
 * Aspirant details in the same design as the SDC and batch details: Back, the name with the ID and status, then the
 * registered details laid out like the registration form (read-only). "Edit Details" opens the same form fields the
 * registration used, and the attached documents are managed below.
 */
@Component({
  selector: 'app-aspirant-detail',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    FormSdcComponent,
    ButtonComponent,
    FormSectionComponent,
    FormSelectComponent,
    IconComponent,
    PageShellComponent,
    AspirantViewComponent,
    AspirantDocumentsTableComponent,
    AspirantAddDocumentModalComponent,
    AspirantEditDocumentModalComponent,
    AspirantAadhaarUploadComponent
  ],
  template: `
    <app-page-shell>
      <!-- Aadhaar proof control of the identity fields in edit mode -->
      <ng-template #aadhaarUploadTemplate>
        <app-aspirant-aadhaar-upload
          [fileName]="editForm.aadhaarDocName ?? ''"
          [fileSize]="editForm.aadhaarDocSize ?? ''"
          (viewDocument)="previewAadhaarProof(aspirant()!)"
          (fileSelected)="onAadhaarDocReplaced($event)"
        ></app-aspirant-aadhaar-upload>
      </ng-template>

      @if (aspirant(); as cand) {
        <!-- Back button, title row and subtitle (same as the SDC and batch details) -->
        <div class="space-y-3">
          <div>
            <a appButton variant="outline" size="sm" routerLink="/aspirants" title="Back to Aspirants">
              <app-icon name="back" />
              <span>Back</span>
            </a>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 flex-wrap min-w-0">
              <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">{{ cand.aspirantName }}</h1>
              <span class="tabular-nums text-xs font-semibold text-slate-500">{{ cand.id }}</span>
              <span class="whitespace-nowrap font-medium text-xs" [class]="statusClass(cand.trainingStatus)">{{ statusText(cand.trainingStatus) }}</span>
            </div>

            @if (!isEditMode()) {
              <button appButton variant="outline" size="sm" type="button" (click)="startEditing(cand)" title="Edit the details of this aspirant">
                <app-icon name="edit" size="sm" />
                <span>Edit Details</span>
              </button>
            }
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
            Details of the aspirant as registered in batch {{ cand.batchCode }} at {{ cand.sdcName }} ({{ cand.sdcCode }}).
          </p>
        </div>

        @if (successMessage()) {
          <div class="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <app-icon name="check" [stroke]="2" class="text-emerald-600 shrink-0" />
              <span class="font-medium">{{ successMessage() }}</span>
            </div>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="successMessage.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }

        @if (errorMessage()) {
          <div role="alert" class="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs">
            <span class="font-medium">{{ errorMessage() }}</span>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="errorMessage.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }

        @if (!isEditMode()) {
          <app-aspirant-view [aspirant]="cand" (previewAadhaar)="previewAadhaarProof(cand)" />
        } @else {
          <!-- Edit: the registration form fields, in the same card -->
          <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 font-sans">
            <app-form-section class="block" title="Training">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
                <div class="lg:col-span-4 sm:col-span-1">
                  <app-form-select
                    label="Training Status"
                    [items]="statusItems"
                    [value]="cand.trainingStatus"
                    (valueChange)="updateStatus($event)"
                  ></app-form-select>
                </div>
              </div>
            </app-form-section>

            <app-form-sdc [fields]="step1Fields" [(model)]="editForm" density="compact" layout="plain" [card]="false" [gridCols]="4" [showSubmit]="false" [showCancel]="false"></app-form-sdc>
            <app-form-sdc [fields]="step2PermanentFields" [(model)]="editForm" density="compact" layout="plain" [card]="false" [gridCols]="4" [showSubmit]="false" [showCancel]="false"></app-form-sdc>

            <div class="pt-2 pb-1.5 border-b border-slate-200/80 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-3.5 bg-navy rounded-xs inline-block"></span>
                <h4 class="font-bold m-0" style="font-size: 13.5px !important; color: #0B3558 !important;">Communication Address</h4>
              </div>
              <label class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  [(ngModel)]="editForm.isAddressSame"
                  (change)="toggleSameAddress()"
                  class="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer"
                />
                <span>Same as Permanent Address</span>
              </label>
            </div>
            <app-form-sdc [fields]="step2CommFields" [(model)]="editForm" density="compact" layout="plain" [card]="false" [gridCols]="4" [showSubmit]="false" [showCancel]="false"></app-form-sdc>
            <app-form-sdc [fields]="step2ContactFields" [(model)]="editForm" density="compact" layout="plain" [card]="false" [gridCols]="4" [showSubmit]="false" [showCancel]="false"></app-form-sdc>
            <app-form-sdc [fields]="step3Fields" [(model)]="editForm" density="compact" layout="plain" [card]="false" [gridCols]="4" [showSubmit]="false" [showCancel]="false"></app-form-sdc>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button appButton variant="outline" size="lg" type="button" (click)="cancelEditing()">
                <app-icon name="close" />
                <span>Cancel</span>
              </button>
              <button appButton size="lg" type="button" (click)="saveChanges()">
                <app-icon name="check" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        }

        <app-aspirant-documents-table
          [aspirant]="cand"
          (addDocument)="showAddDocModal.set(true)"
          (preview)="openPreviewDoc($event)"
          (replaceFile)="onDocFileReplaced($event.doc, $event.file)"
          (editDoc)="editingDoc.set({ ...$event })"
          (deleteDoc)="deleteDocument($event)"
        ></app-aspirant-documents-table>
      } @else {
        <div class="p-8 max-w-xl mx-auto text-center space-y-4 py-16">
          <h2 class="text-base font-bold text-slate-800">Aspirant Record Not Found</h2>
          <p class="text-xs text-slate-500">The requested aspirant does not exist or has been removed.</p>
          <a appButton routerLink="/aspirants">Back to Aspirants</a>
        </div>
      }

      @if (showAddDocModal()) {
        <app-aspirant-add-document-modal (save)="saveNewDocument($event)" (close)="showAddDocModal.set(false)"></app-aspirant-add-document-modal>
      }

      @if (editingDoc(); as doc) {
        <app-aspirant-edit-document-modal [doc]="doc" (save)="saveDocEdit($event)" (close)="editingDoc.set(null)"></app-aspirant-edit-document-modal>
      }
    </app-page-shell>
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
  errorMessage = signal<string>('');
  showAddDocModal = signal<boolean>(false);
  editingDoc = signal<AspirantDocumentItem | null>(null);

  editForm: Partial<AspirantRecord> = {};

  @ViewChild('aadhaarUploadTemplate', { static: true }) aadhaarUploadTemplate!: TemplateRef<unknown>;

  step1Fields: FormFieldConfig[] = [];
  step2PermanentFields: FormFieldConfig[] = [];
  step2CommFields: FormFieldConfig[] = [];
  step2ContactFields: FormFieldConfig[] = [];
  step3Fields: FormFieldConfig[] = [];

  protected readonly statusItems = (Object.keys(ASPIRANT_STATUS_LABEL) as AspirantTrainingStatus[]).map(status => ({
    value: status,
    label: ASPIRANT_STATUS_LABEL[status]
  }));

  protected readonly statusText = (status: AspirantTrainingStatus): string => ASPIRANT_STATUS_LABEL[status] ?? status;
  protected readonly statusClass = aspirantStatusClass;

  ngOnInit(): void {
    this.step1Fields = getStep1PersonalFields((dob, model) => {
      model.age = calculateAgeFromDob(dob);
    }, this.aadhaarUploadTemplate);
    this.step2PermanentFields = getStep2PermanentAddressFields();
    this.step2CommFields = getStep2CommAddressFields();
    this.step2ContactFields = getStep2ContactFields();
    this.step3Fields = getStep3EconomicWorkerFields();

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params.get('id');
      if (id) this.loadAspirant(id);
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queryParams => {
      if (queryParams.get('edit') === 'true' && this.aspirant()) this.startEditing(this.aspirant()!);
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
    this.errorMessage.set('');
    this.isEditMode.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEditing(): void {
    const current = this.aspirant();
    if (current) this.editForm = JSON.parse(JSON.stringify(current));
    this.errorMessage.set('');
    this.isEditMode.set(false);
  }

  /** Same as on the registration form: the communication address follows the permanent one when the box is ticked. */
  toggleSameAddress(): void {
    const form = this.editForm;
    if (!form.isAddressSame) return;
    form.commHouseNo = form.permHouseNo;
    form.commStreet = form.permStreet;
    form.commWard = form.permWard;
    form.commCity = form.permCity;
    form.commDistrict = form.permDistrict;
    form.commBlock = form.permBlock;
    form.commTehsil = form.permTehsil;
    form.commMunicipality = form.permMunicipality;
    form.commPincode = form.permPincode;
  }

  saveChanges(): void {
    const current = this.aspirant();
    if (!current) return;

    // Records registered before the Aadhaar number was kept are saved without checking it.
    const problem =
      (this.editForm.aadhaarNo ? validateIdentityStep(this.editForm as Parameters<typeof validateIdentityStep>[0]) : null) ??
      validateAddressStep(this.editForm as Parameters<typeof validateAddressStep>[0]);
    if (problem) {
      this.errorMessage.set(problem);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const updated = this.aspirantService.updateAspirant(current.id, this.editForm);
    if (updated) {
      this.aspirant.set(updated);
      this.errorMessage.set('');
      this.isEditMode.set(false);
      this.showSuccess('Aspirant details updated successfully.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateStatus(value: string): void {
    const current = this.aspirant();
    if (!current) return;
    const newStatus = value as AspirantTrainingStatus;

    this.aspirantService.updateTrainingStatus(current.id, newStatus);
    this.aspirant.update(c => (c ? { ...c, trainingStatus: newStatus } : null));
    this.editForm.trainingStatus = newStatus;
    this.showSuccess(`Training status changed to ${this.statusText(newStatus)}.`);
  }

  // =========================================================================
  // DOCUMENTS
  // =========================================================================

  onDocFileReplaced(doc: AspirantDocumentItem, file: File): void {
    this.replaceDocumentFile(doc.id, file.name, formatFileSize(file.size));
  }

  replaceDocumentFile(docId: string, newFileName: string, newFileSize: string): void {
    const current = this.aspirant();
    if (!current) return;

    const updatedDocs = (current.documents || []).map(d =>
      d.id === docId ? { ...d, fileName: newFileName, fileSize: newFileSize, status: 'UPLOADED' as const, uploadedAt: todayIsoDate() } : d
    );

    const isAadhaarDoc = docId === 'doc-1' || docId === 'd1';
    const updated = this.aspirantService.updateAspirant(current.id, {
      documents: updatedDocs,
      ...(isAadhaarDoc ? { aadhaarDocName: newFileName, aadhaarDocSize: newFileSize } : {})
    });

    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.showSuccess(`Document file replaced with "${newFileName}".`);
    }
  }

  previewAadhaarProof(cand: AspirantRecord): void {
    this.openPreviewDoc({
      id: 'doc-aadhaar',
      docType: 'Aadhaar Card',
      docName: 'Aadhaar Card Document Proof',
      fileName: cand.aadhaarDocName || 'Aadhaar_Document.pdf',
      fileSize: cand.aadhaarDocSize || '1.4 MB',
      status: 'UPLOADED',
      uploadedAt: cand.enrollmentDate
    });
  }

  onAadhaarDocReplaced(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileSize = formatFileSize(file.size);
      const current = this.aspirant();
      if (!current) return;

      const updatedDocs = (current.documents || []).map(d =>
        d.docType.toLowerCase().includes('aadhaar') ? { ...d, fileName: file.name, fileSize, status: 'UPLOADED' as const } : d
      );

      const updated = this.aspirantService.updateAspirant(current.id, {
        aadhaarDocName: file.name,
        aadhaarDocSize: fileSize,
        documents: updatedDocs
      });

      if (updated) {
        this.aspirant.set(updated);
        this.editForm = { ...this.editForm, aadhaarDocName: file.name, aadhaarDocSize: fileSize };
        this.showSuccess(`Aadhaar proof replaced with "${file.name}".`);
      }
      input.value = '';
    }
  }

  openPreviewDoc(doc: AspirantDocumentItem): void {
    this.docViewer.openDocument(
      { fileName: doc.fileName, fileSize: doc.fileSize, uploadDate: doc.uploadedAt || 'Verified', status: 'uploaded' },
      doc.docName
    );
  }

  saveDocEdit(doc: AspirantDocumentItem): void {
    const current = this.aspirant();
    if (!current) return;

    const updated = this.aspirantService.updateAspirant(current.id, {
      documents: (current.documents || []).map(d => (d.id === doc.id ? doc : d))
    });
    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.editingDoc.set(null);
      this.showSuccess('Document details updated.');
    }
  }

  deleteDocument(doc: AspirantDocumentItem): void {
    if (!confirm(`Remove the document "${doc.docName}"?`)) return;

    const current = this.aspirant();
    if (!current) return;

    const updated = this.aspirantService.updateAspirant(current.id, {
      documents: (current.documents || []).filter(d => d.id !== doc.id)
    });
    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.showSuccess(`Document "${doc.docName}" removed.`);
    }
  }

  saveNewDocument(form: Partial<AspirantDocumentItem>): void {
    if (!form.docType || !form.docName) {
      this.errorMessage.set('Enter the document type and title.');
      return;
    }

    const current = this.aspirant();
    if (!current) return;

    const newDoc: AspirantDocumentItem = {
      id: 'doc-' + Date.now(),
      docType: form.docType,
      docName: form.docName,
      fileName: form.fileName || `${form.docName.replace(/\s+/g, '_')}.pdf`,
      fileSize: form.fileSize || '1.2 MB',
      status: 'UPLOADED',
      uploadedAt: todayIsoDate()
    };

    const updated = this.aspirantService.updateAspirant(current.id, { documents: [...(current.documents || []), newDoc] });
    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.showAddDocModal.set(false);
      this.showSuccess(`Document "${newDoc.docName}" attached.`);
    }
  }

  showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => {
      if (this.successMessage() === msg) this.successMessage.set('');
    }, 4500);
  }
}
