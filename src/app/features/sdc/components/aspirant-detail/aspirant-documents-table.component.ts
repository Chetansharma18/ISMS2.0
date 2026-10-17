import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AspirantRecord } from '../../models/aspirant.model';
import { AspirantDocumentItem } from '../../config/aspirant-form.config';
import { getDocExtension } from './aspirant-document.util';
import { ButtonComponent, IconComponent, TableColumn, TableComponent } from '../../../../shared';

/** View-mode card: attached documents table with upload / replace / edit / delete actions. */
@Component({
  selector: 'app-aspirant-documents-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent, IconComponent, TableComponent],
  template: `
    @let cand = aspirant();
    <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-primary rounded-full"></span>
            <span>4. Attached Documents ({{ cand.documents ? cand.documents.length : 0 }})</span>
          </h2>
          <p class="text-[11px] text-slate-500 mt-0.5">Manage, preview, edit, replace or upload new documents for this candidate</p>
        </div>

        <!-- Add Document Trigger Button -->
        <button
          appButton
          size="sm"
          type="button"
          (click)="addDocument.emit()"
        >
          <app-icon name="plus" size="sm" />
          <span>Upload New Document</span>
        </button>
      </div>

      <!-- Hidden Master Document Replacement File Input -->
      <input
        #docReplaceFileInput
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        (change)="onReplaceFileSelected($event)"
        class="hidden"
      />

      <app-table
        [columns]="columns"
        [data]="cand.documents"
        emptyMessage='No documents attached yet. Click "+ Upload New Document" to attach candidate verification files.'
        [customTemplates]="{
          docType: docTypeTemplate,
          fileName: fileTemplate,
          status: statusTemplate,
          actions: actionsTemplate
        }"
      ></app-table>

      <!-- Template: Document Type + badge -->
      <ng-template #docTypeTemplate let-doc>
        <span class="font-semibold text-slate-900 block">{{ doc.docType }}</span>
        <span class="text-[10px] text-slate-400">{{ doc.badgeLabel || 'Statutory' }}</span>
      </ng-template>

      <!-- Template: Attached file & size -->
      <ng-template #fileTemplate let-doc>
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[9px] flex items-center justify-center shrink-0">
            {{ getDocExtension(doc.fileName) }}
          </span>
          <div class="min-w-0">
            <span class="font-mono text-xs text-slate-800 block truncate max-w-[200px]" [title]="doc.fileName">
              {{ doc.fileName || 'No file attached' }}
            </span>
            <span class="text-[10.5px] text-slate-400 block font-sans">
              {{ doc.fileSize || 'Standard' }} • {{ doc.uploadedAt || 'Verified' }}
            </span>
          </div>
        </div>
      </ng-template>

      <!-- Template: Status -->
      <ng-template #statusTemplate let-doc>
        @if (doc.status === 'UPLOADED') {
          <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Uploaded ✓
          </span>
        } @else {
          <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        }
      </ng-template>

      <!-- Template: Actions -->
      <ng-template #actionsTemplate let-doc>
        <div class="inline-flex items-center gap-1.5">
          <!-- 1. View / Preview -->
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            (click)="preview.emit(doc)"
            title="View / Preview Document"
            aria-label="View / Preview Document"
          >
            <app-icon name="eye" size="sm" />
          </button>

          <!-- 2. Replace File -->
          <button
            appButton
            variant="secondary"
            size="sm"
            type="button"
            (click)="triggerReplaceDoc(doc, docReplaceFileInput)"
            title="Upload replacement file"
          >
            <app-icon name="upload" size="xs" />
            <span>Replace</span>
          </button>

          <!-- 3. Edit Document Details -->
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            (click)="editDoc.emit(doc)"
            title="Edit Document Details"
            aria-label="Edit Document Details"
          >
            <app-icon name="edit" size="sm" />
          </button>

          <!-- 4. Delete Document -->
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            (click)="deleteDoc.emit(doc)"
            title="Remove Document"
            aria-label="Remove Document"
          >
            <app-icon name="trash" size="sm" />
          </button>
        </div>
      </ng-template>
    </div>
  `
})
export class AspirantDocumentsTableComponent {
  readonly aspirant = input.required<AspirantRecord>();
  readonly addDocument = output<void>();
  readonly preview = output<AspirantDocumentItem>();
  readonly replaceFile = output<{ doc: AspirantDocumentItem; file: File }>();
  readonly editDoc = output<AspirantDocumentItem>();
  readonly deleteDoc = output<AspirantDocumentItem>();

  readonly columns: TableColumn<AspirantDocumentItem>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-10' },
    { key: 'docType', label: 'Document Type', type: 'custom' },
    { key: 'docName', label: 'Document Title' },
    { key: 'fileName', label: 'Attached File & Size', type: 'custom' },
    { key: 'status', label: 'Status', type: 'custom', align: 'center' },
    { key: 'actions', label: 'Actions', type: 'custom', align: 'right' }
  ];

  private targetDocForReplace: AspirantDocumentItem | null = null;

  readonly getDocExtension = getDocExtension;

  triggerReplaceDoc(doc: AspirantDocumentItem, fileInput: HTMLInputElement): void {
    this.targetDocForReplace = doc;
    fileInput.click();
  }

  onReplaceFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.targetDocForReplace) {
      this.replaceFile.emit({ doc: this.targetDocForReplace, file: input.files[0] });
      input.value = '';
    }
  }
}
