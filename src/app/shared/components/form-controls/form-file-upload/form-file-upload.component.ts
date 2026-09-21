import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDoc } from '../../../../features/registration/models/otr-form.model';

@Component({
  selector: 'app-form-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full flex flex-col">
      <!-- Label -->
      <div class="flex items-center justify-between mb-1">
        <label class="text-xs sm:text-[13px] font-semibold text-slate-700 select-none">
          {{ label }}
          @if (required) {
            <span class="text-rose-500 font-bold ml-0.5">*</span>
          }
        </label>
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

      <!-- 1. EMPTY STATE: Compact Upload Button -->
      @if (!fileDoc || fileDoc.status !== 'uploaded') {
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            (click)="triggerFileSelect(fileInput)"
            [disabled]="disabled"
            class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs shrink-0"
          >
            Upload Document
          </button>
          <span class="text-[11px] text-slate-400 truncate">
            (PDF, JPG, PNG &bull; Max {{ maxSizeMb }}MB)
          </span>
        </div>
      }

      <!-- 2. UPLOADED STATE: Clean File Line -->
      @if (fileDoc && fileDoc.status === 'uploaded') {
        <div class="flex items-center justify-between gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-emerald-700 font-semibold text-[11px] shrink-0">Uploaded:</span>
            <span class="font-medium text-slate-800 truncate" [title]="fileDoc.fileName">{{ fileDoc.fileName }}</span>
            <span class="text-slate-400 text-[11px] shrink-0">({{ fileDoc.fileSize }})</span>
          </div>
          <button
            type="button"
            (click)="removeFile(fileInput)"
            class="text-xs text-rose-600 hover:text-rose-800 font-medium shrink-0 cursor-pointer"
          >
            Remove
          </button>
        </div>
      }

      <!-- Error message -->
      @if (error) {
        <p class="text-[11px] text-rose-600 font-medium mt-1">
          {{ error }}
        </p>
      }
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

  triggerFileSelect(input: HTMLInputElement): void {
    if (!this.disabled) {
      input.click();
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
    const doc: FileDoc = {
      fileName: file.name,
      fileSize: `${sizeInMb.toFixed(2)} MB`,
      uploadDate: new Date().toLocaleDateString('en-GB'),
      status: 'uploaded'
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
