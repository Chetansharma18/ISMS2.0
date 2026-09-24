import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDoc } from '../../../../features/registration/models/otr-form.model';
import { DocumentViewerModalComponent } from '../../document-viewer-modal/document-viewer-modal.component';

@Component({
  selector: 'app-form-file-upload',
  standalone: true,
  imports: [CommonModule, DocumentViewerModalComponent],
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
            <svg class="w-3.5 h-3.5 text-slate-600 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
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
            <svg class="w-4.5 h-4.5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
              <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
              <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
            </svg>

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
            <!-- View Option -->
            <button
              type="button"
              (click)="openPreview()"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
              title="Preview {{ fileDoc.fileName }}"
            >
              <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
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
              <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
              <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Remove</span>
            </button>
          </div>
        </div>
      }

      <!-- Error message -->
      @if (error) {
        <p class="text-[11px] text-rose-600 font-medium mt-1">
          {{ error }}
        </p>
      }

      <!-- Reusable Document Preview Modal -->
      <app-document-viewer-modal
        [isOpen]="isPreviewOpen"
        [doc]="fileDoc"
        [title]="label"
        (close)="isPreviewOpen = false"
      ></app-document-viewer-modal>
    </div>
  `
})
export class FormFileUploadComponent {
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

  isPreviewOpen = false;

  triggerFileSelect(input: HTMLInputElement): void {
    if (!this.disabled) {
      input.click();
    }
  }

  openPreview(): void {
    if (this.fileDoc) {
      this.isPreviewOpen = true;
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
    let objectUrl: string | undefined;
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      // Fallback
    }

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
