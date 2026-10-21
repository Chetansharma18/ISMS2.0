import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDoc } from '../../../../features/registration/models/otr-form.model';
import { DocumentViewerService } from '../../../../core/services/document-viewer.service';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-form-file-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="w-full flex flex-col font-sans">
      <!-- Label -->
      <div class="flex items-center justify-between mb-1.5">
        <label class="text-xs sm:text-[13px] font-semibold text-slate-700 select-none">
          {{ label }}
          @if (required) {
            <span class="text-rose-500 font-bold ml-0.5">*</span>
          }
        </label>
        @if (hint) {
          <span class="text-[11px] text-slate-400 font-normal">{{ hint }}</span>
        }
      </div>

      <!-- Hidden native file input -->
      <input
        #fileInput
        type="file"
        [accept]="accept"
        [disabled]="disabled"
        (change)="onFileSelected($event)"
        class="hidden"
      />

      <!-- 1. EMPTY STATE: Compact & Professional Upload Button -->
      @if (!fileDoc || fileDoc.status !== 'uploaded') {
        <div class="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            (click)="triggerFileSelect(fileInput)"
            [disabled]="disabled"
            class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs shrink-0 flex items-center gap-1.5"
          >
            <app-icon name="upload" size="sm" [stroke]="2" class="text-slate-600" />
            <span>Upload Document</span>
          </button>
          <span class="text-[11px] text-slate-500 truncate">
            (PDF, JPG, PNG &bull; Max {{ maxSizeMb }}MB)
          </span>
        </div>
      }

      <!-- 2. UPLOADED STATE: Document Name, Size, View & Change Actions -->
      @if (fileDoc && fileDoc.status === 'uploaded') {
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs shadow-2xs">
          <!-- File info: Icon, Name and Size Badge -->
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <!-- Authentic Adobe PDF Icon -->
            <app-icon name="pdf-badge" solid size="auto" class="w-4.5 h-4.5 text-[#E5252A] select-none" />

            <div class="flex items-center gap-2 min-w-0 flex-wrap">
              <span class="font-medium text-slate-800 truncate max-w-[180px] sm:max-w-xs" [title]="fileDoc.fileName">
                {{ fileDoc.fileName }}
              </span>
              <!-- Prominent Size Badge -->
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs shrink-0">
                {{ fileDoc.fileSize }}
              </span>
            </div>
          </div>

          <!-- Actions Toolbar: View, Change, Remove -->
          <div class="flex items-center gap-1.5 shrink-0 sm:ml-auto">
            <!-- View Option -> Opens in Chrome Tab -->
            <button
              type="button"
              (click)="openPreview()"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean hover:text-ocean-dark bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
              title="Open {{ fileDoc.fileName }} in new tab"
            >
              <app-icon name="external-link" size="sm" [stroke]="2" />
              <span>View</span>
            </button>

            <!-- Change Option -->
            <button
              type="button"
              (click)="triggerFileSelect(fileInput)"
              [disabled]="disabled"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer disabled:opacity-50"
              title="Change/Replace Document"
            >
              <app-icon name="refresh" size="sm" [stroke]="2" />
              <span>Change</span>
            </button>

            <!-- Remove Option -->
            <button
              type="button"
              (click)="removeFile(fileInput)"
              [disabled]="disabled"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer disabled:opacity-50"
              title="Remove File"
            >
              <app-icon name="trash" size="sm" [stroke]="2" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      }

      <!-- Error message -->
      @if (error) {
        <div class="form-error-text text-rose-600 font-medium mt-0.5 flex items-center gap-1 leading-tight animate-fade-in" style="font-size: 11px !important; line-height: 14px !important;">
          <app-icon name="error" size="xs" [stroke]="2.5" />
          <span style="font-size: 11px !important; line-height: 14px !important;">{{ error }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .form-error-text {
      font-size: 11px !important;
      line-height: 14px !important;
    }
  `]
})
export class FormFileUploadComponent {
  private docViewer = inject(DocumentViewerService);

  @Input() label: string = '';
  @Input() fileDoc: FileDoc | null = null;
  @Input() accept: string = '.pdf,.png,.jpg,.jpeg';
  @Input() maxSizeMb: number = 5;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() hint?: string;
  @Input() error?: string;

  @Output() fileChange = new EventEmitter<FileDoc | null>();
  @Output() fileDocChange = new EventEmitter<FileDoc | null>();

  triggerFileSelect(input: HTMLInputElement): void {
    if (!this.disabled) {
      input.click();
    }
  }

  openPreview(): void {
    if (this.fileDoc) {
      this.docViewer.openDocument(this.fileDoc, this.label);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const sizeInMb = file.size / (1024 * 1024);

    if (sizeInMb > this.maxSizeMb) {
      this.error = `File size (${sizeInMb.toFixed(1)}MB) exceeds the maximum limit of ${this.maxSizeMb}MB.`;
      input.value = '';
      return;
    }

    this.error = undefined;
    const objectUrl = this.docViewer.registerFile(file.name, file);

    const doc: FileDoc = {
      fileName: file.name,
      fileSize: `${sizeInMb.toFixed(2)} MB`,
      uploadDate: new Date().toLocaleDateString('en-GB'),
      status: 'uploaded',
      fileUrl: objectUrl
    };

    this.fileDoc = doc;
    this.fileChange.emit(doc);
    this.fileDocChange.emit(doc);
    input.value = '';
  }

  removeFile(input: HTMLInputElement): void {
    this.fileDoc = null;
    this.fileChange.emit(null);
    this.fileDocChange.emit(null);
    input.value = '';
  }
}
