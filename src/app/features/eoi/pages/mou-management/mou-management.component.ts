import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActionModalComponent,
  ButtonComponent,
  FormFileUploadComponent,
  IconComponent,
  InputDirective,
  ListPageComponent,
  SectionCardComponent,
  TableColumn
} from '../../../../shared';
import { MouDocument } from './mou.model';
import { MouService } from './mou.service';
import { FileDoc } from '../../../registration/models/otr-form.model';
import { DocumentViewerService } from '../../../../core/services/document-viewer.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-mou-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ListPageComponent,
    SectionCardComponent,
    FormFileUploadComponent,
    ButtonComponent,
    IconComponent,
    InputDirective,
    ActionModalComponent
  ],
  template: `
    <app-list-page
      title="MoU Management"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'MoU Management' }]"
      searchPlaceholder="Search uploaded MoUs by title, file name..."
      [(searchQuery)]="searchQuery"
      [columns]="mouColumns"
      [data]="filteredDocuments()"
      itemUnit="documents"
      emptyMessage="No MoU documents uploaded yet."
      [customTemplates]="{
        fileInfo: fileInfoTemplate,
        action: actionTemplate
      }"
    >
      <!-- Upload Section inside standard SectionCard -->
      <app-section-card beforeTable title="Upload MoU Document">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-end">
          <div class="md:col-span-5">
            <label class="block text-xs font-semibold text-slate-700 mb-1.5" for="mou-doc-title">
              MoU Title / Description <span class="text-rose-500">*</span>
            </label>
            <input
              id="mou-doc-title"
              appInput
              class="w-full"
              [(ngModel)]="docTitle"
              placeholder="e.g. MMKVY Scheme - Signed Bipartite Agreement"
            />
          </div>

          <div class="md:col-span-5">
            <app-form-file-upload
              label="Select MoU Document"
              [required]="true"
              accept=".pdf,.doc,.docx"
              [fileDoc]="selectedDoc()"
              (fileDocChange)="onFileDocChange($event)"
            />
          </div>

          <div class="md:col-span-2">
            <button
              appButton
              [block]="true"
              [disabled]="!canUpload()"
              (click)="uploadDocument()"
            >
              <app-icon name="upload" size="sm" />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </app-section-card>
    </app-list-page>

    <!-- Column Templates -->

    <!-- File Info Template -->
    <ng-template #fileInfoTemplate let-row>
      <div class="flex items-center gap-2">
        <app-icon name="document" size="xs" class="text-rose-600 shrink-0" />
        <span class="truncate font-normal text-slate-800 text-[13px]">{{ row.fileName }}</span>
        <span class="text-[11px] text-slate-500 shrink-0">({{ row.fileSize }})</span>
      </div>
    </ng-template>

    <!-- Action Template: View & Delete -->
    <ng-template #actionTemplate let-row>
      <div class="flex items-center justify-center gap-2">
        <button
          appButton
          variant="outline"
          size="sm"
          type="button"
          (click)="viewDocument(row)"
          [title]="'View ' + row.fileName"
        >
          <app-icon name="eye" size="sm" />
          <span>View</span>
        </button>

        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="promptDelete(row)"
          title="Delete MoU"
          aria-label="Delete MoU"
        >
          <app-icon name="close" size="xs" />
        </button>
      </div>
    </ng-template>

    <!-- Confirmation Modal for deleting an MoU -->
    <app-action-modal
      [isOpen]="!!documentToDelete()"
      [showCloseButton]="true"
      [closeOnBackdrop]="true"
      [showAccentBar]="true"
      accentBarClass="bg-rose-600"
      title="Delete MoU"
      primaryLabel="Delete MoU"
      primaryVariant="danger"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-[460px]"
      (primaryAction)="confirmDelete()"
      (secondaryAction)="cancelDelete()"
      (close)="cancelDelete()"
    >
      @if (documentToDelete(); as doc) {
        <div class="space-y-3 mt-2">
          <p class="text-sm text-slate-700 m-0 leading-relaxed font-sans">
            Are you sure you want to delete the MoU <strong class="text-slate-900 font-semibold">"{{ doc.title }}"</strong>?
          </p>
          <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
            <app-icon name="document" size="xs" class="text-rose-600 shrink-0" />
            <span class="truncate font-medium">{{ doc.fileName }}</span>
            <span class="text-slate-500 text-[11px] shrink-0">({{ doc.fileSize }})</span>
          </div>
        </div>
      }
    </app-action-modal>
  `
})
export class MouManagementComponent {
  private mouService = inject(MouService);
  private docViewer = inject(DocumentViewerService);
  private notify = inject(NotificationService);

  readonly searchQuery = signal('');
  readonly docTitle = signal('');
  readonly selectedDoc = signal<FileDoc | null>(null);
  readonly documentToDelete = signal<MouDocument | null>(null);

  readonly documents = toSignal(this.mouService.documents$, { initialValue: [] });

  readonly canUpload = computed(() => !!this.docTitle().trim() && !!this.selectedDoc());

  readonly filteredDocuments = computed<MouDocument[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.documents();
    if (!query) return list;

    return list.filter(d =>
      d.title.toLowerCase().includes(query) ||
      d.fileName.toLowerCase().includes(query) ||
      d.uploadedBy.toLowerCase().includes(query) ||
      d.uploadedOn.toLowerCase().includes(query)
    );
  });

  readonly mouColumns: TableColumn<MouDocument>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
    { key: 'title', label: 'Document Title', width: 'min-w-[280px]', cellClass: 'font-medium text-slate-900' },
    { key: 'fileInfo', label: 'File Name & Size', width: 'min-w-[220px]', type: 'custom' },
    { key: 'uploadedOn', label: 'Uploaded On', align: 'center', cellClass: 'whitespace-nowrap tabular-nums text-slate-700' },
    { key: 'uploadedBy', label: 'Uploaded By', align: 'center', cellClass: 'whitespace-nowrap text-slate-700' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-28', type: 'custom' }
  ];

  onFileDocChange(doc: FileDoc | null): void {
    this.selectedDoc.set(doc);
    if (doc && !this.docTitle().trim()) {
      this.docTitle.set(doc.fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  }

  uploadDocument(): void {
    const doc = this.selectedDoc();
    const title = this.docTitle().trim();
    if (!doc || !title) return;

    this.mouService.uploadDocument(title, null, doc.fileName, doc.fileSize).subscribe(created => {
      this.notify.success(`Document "${created.title}" uploaded successfully.`);
      this.docTitle.set('');
      this.selectedDoc.set(null);
    });
  }

  viewDocument(doc: MouDocument): void {
    this.docViewer.openDocument({
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      uploadDate: doc.uploadedOn,
      status: 'uploaded'
    }, `MoU Document: ${doc.title}`);
  }

  promptDelete(doc: MouDocument): void {
    this.documentToDelete.set(doc);
  }

  cancelDelete(): void {
    this.documentToDelete.set(null);
  }

  confirmDelete(): void {
    const doc = this.documentToDelete();
    if (!doc) return;

    this.mouService.deleteDocument(doc.id).subscribe(() => {
      this.notify.warning(`MoU "${doc.title}" deleted.`);
      this.documentToDelete.set(null);
    });
  }
}
