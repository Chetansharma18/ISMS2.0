import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActionModalComponent, InputDirective } from '../../../shared';
import { validateUploadFile } from './tenders-page.util';

/** Payload emitted when the optional corrigendum form is submitted. */
export interface CorrigendumSubmission {
  title: string;
  file: File | null;
}

/**
 * Optional "Upload Corrigendum" modal shown after editing an EOI.
 * Owns its form state (reset every time the modal opens).
 */
@Component({
  selector: 'app-corrigendum-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ActionModalComponent, InputDirective],
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      [reverseButtons]="true"
      [showAccentBar]="false"
      primaryLabel="Submit"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-[540px]"
      (primaryAction)="submitCorrigendum()"
      (secondaryAction)="close.emit()"
      (close)="close.emit()"
    >
      <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
        Upload Corrigendum (Optional)
      </h2>
      <div class="mt-4 space-y-4 font-sans text-[13px]">
        <div>
          <label class="block text-slate-700 font-medium mb-1">Corrigendum Title</label>
          <input
            appInput
            type="text"
            maxlength="100"
            placeholder="e.g. Corrigendum-1: Extension of Submission Date"
            [(ngModel)]="corrigendumFormData.title"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-slate-700 font-medium mb-1">Upload Corrigendum Document</label>
          <input
            type="file"
            accept=".pdf,.txt,.jpeg,.jpg,.png,.doc,.docx,.xls,.xlsx"
            (change)="onCorrigendumFileSelected($event)"
            class="w-full file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-navy cursor-pointer"
          />
        </div>
        @if (corrigendumFileError()) {
          <div class="text-xs text-red-500 font-medium">{{ corrigendumFileError() }}</div>
        }
      </div>
    </app-action-modal>
  `
})
export class CorrigendumModalComponent {
  readonly isOpen = input(false);

  readonly submitted = output<CorrigendumSubmission>();
  readonly close = output<void>();

  corrigendumFormData = {
    title: '',
    file: null as File | null,
    fileName: ''
  };
  readonly corrigendumFileError = signal<string>('');

  constructor() {
    // Start from a blank form every time the modal is opened.
    effect(() => {
      if (this.isOpen()) {
        this.corrigendumFormData = { title: '', file: null, fileName: '' };
        this.corrigendumFileError.set('');
      }
    });
  }

  onCorrigendumFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const error = validateUploadFile(file);

      if (error) {
        this.corrigendumFileError.set(error);
        this.corrigendumFormData.file = null;
        this.corrigendumFormData.fileName = '';
        return;
      }

      this.corrigendumFileError.set('');
      this.corrigendumFormData.file = file;
      this.corrigendumFormData.fileName = file.name;
    } else {
      this.corrigendumFormData.file = null;
      this.corrigendumFormData.fileName = '';
    }
  }

  submitCorrigendum(): void {
    this.submitted.emit({ title: this.corrigendumFormData.title, file: this.corrigendumFormData.file });
  }
}
