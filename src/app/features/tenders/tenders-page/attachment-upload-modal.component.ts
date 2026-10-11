import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionModalComponent } from '../../../shared';
import { EoiAttachment } from '../tenders.models';
import { createAttachment, validateUploadFile } from './tenders-page.util';

/**
 * "Upload Attachment" modal used by the Configure EOI form.
 * Owns its form state (reset every time the modal opens) and emits the new attachment.
 */
@Component({
  selector: 'app-attachment-upload-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, FormsModule, ActionModalComponent],
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      [reverseButtons]="true"
      [showAccentBar]="false"
      primaryLabel="Submit"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-[500px]"
      (primaryAction)="submitAttachment()"
      (secondaryAction)="close.emit()"
      (close)="close.emit()"
    >
      <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
        Upload Attachment
      </h2>
      <div class="mt-4 font-sans text-[13px] space-y-4">
        <div>
          <label class="block text-slate-700 font-medium mb-1">File Title*</label>
          <input type="text" maxlength="100" [(ngModel)]="attachmentFormData.title" [ngClass]="{'border-red-500': attachmentSubmitted() && !attachmentFormData.title, 'border-field-border': !(attachmentSubmitted() && !attachmentFormData.title)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800" />
        </div>
        <div>
          <label class="block text-slate-700 font-medium mb-1">Upload Document*</label>
          <input type="file" accept=".pdf,.txt,.jpeg,.jpg,.png,.doc,.docx,.xls,.xlsx" (change)="onAttachmentFileSelected($event)" class="w-full file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-navy cursor-pointer" />
          @if (attachmentSubmitted() && !attachmentFormData.file) {
            <div class="text-xs text-red-500 mt-1">Required</div>
          }
        </div>
        @if (attachmentFileError()) {
          <div class="text-xs text-red-500 font-medium">{{ attachmentFileError() }}</div>
        }
      </div>
    </app-action-modal>
  `
})
export class AttachmentUploadModalComponent {
  readonly isOpen = input(false);

  /** Emits the validated attachment when the form is submitted. */
  readonly attachmentAdded = output<EoiAttachment>();
  readonly close = output<void>();

  attachmentFormData = {
    title: '',
    file: null as File | null,
    fileName: ''
  };
  readonly attachmentSubmitted = signal<boolean>(false);
  readonly attachmentFileError = signal<string>('');

  constructor() {
    // Start from a blank form every time the modal is opened.
    effect(() => {
      if (this.isOpen()) {
        this.attachmentSubmitted.set(false);
        this.attachmentFileError.set('');
        this.attachmentFormData = { title: '', file: null, fileName: '' };
      }
    });
  }

  onAttachmentFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const error = validateUploadFile(file);

      if (error) {
        this.attachmentFileError.set(error);
        this.attachmentFormData.file = null;
        this.attachmentFormData.fileName = '';
        return;
      }

      this.attachmentFileError.set('');
      this.attachmentFormData.file = file;
      this.attachmentFormData.fileName = file.name;
    } else {
      this.attachmentFormData.file = null;
      this.attachmentFormData.fileName = '';
    }
  }

  submitAttachment(): void {
    this.attachmentSubmitted.set(true);
    if (!this.attachmentFormData.title || !this.attachmentFormData.file) {
      return; // Invalid
    }

    this.attachmentAdded.emit(createAttachment(this.attachmentFormData.title, this.attachmentFormData.file));
  }
}
