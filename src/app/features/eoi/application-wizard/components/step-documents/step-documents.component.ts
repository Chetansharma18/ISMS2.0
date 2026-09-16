import { Component, Input, Output, EventEmitter, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EoiService } from '../../services/eoi.service';
import { Scheme } from '../../../../../core/services/eoi-state.service';
import { SchemeBannerComponent } from '../scheme-banner/scheme-banner.component';

@Component({
  selector: 'app-step-documents',
  standalone: true,
  imports: [CommonModule, DecimalPipe, SchemeBannerComponent],
  styleUrls: ['../../application-wizard.component.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="gov-step-content" aria-labelledby="step1-heading">
      
      <!-- Page Header & Subtitle -->
      <div class="page-title-section">
        <div class="title-header-row">
          <div class="title-meta-left">
            <h1 id="step1-heading" class="section-title">EOI Application</h1>
            <p class="section-subtitle">Training Provider / PIA Application • Mandatory Document Uploads</p>
          </div>
          <div class="title-meta-right">
            <span class="gov-step-pill">STEP 01 OF 04</span>
            <span class="doc-summary-badge">
              <strong>{{ eoiService.uploadedSlotsCount() }} of {{ eoiService.uploadSlots().length }}</strong> Documents Uploaded
            </span>
          </div>
        </div>
        <div class="title-separator"></div>
      </div>

      <!-- Selected Scheme & EOI Tender Summary Card -->
      <app-scheme-banner 
        [scheme]="scheme" 
        (onChangeScheme)="onChangeScheme.emit()">
      </app-scheme-banner>

      <!-- Upload Guidelines Banner -->
      <div class="gov-info-callout">
        <div class="callout-icon">ℹ️</div>
        <div class="callout-text">
          <strong>Document Upload Specifications:</strong>
          Only <strong>PDF</strong> documents are accepted. Maximum allowed file size is <strong>5 MB</strong> per document. Documents marked with <strong>*</strong> are mandatory.
        </div>
      </div>

      <!-- Document Upload Slots List -->
      <div class="gov-card-section">
        <div class="gov-card-header">
          <div class="card-title-group">
            <h3 class="card-title">EOI Document Upload Checklist</h3>
          </div>
          <span class="card-hint-badge">PDF Only • Max 5 MB per file</span>
        </div>

        <div class="gov-card-body">
          <div class="doc-slots-container">
            <div
              *ngFor="let slot of eoiService.uploadSlots(); let i = index; trackBy: trackBySlotId"
              class="doc-slot-row"
              [class.is-uploaded]="slot.fileName"
              [class.has-slot-error]="slot.error || validationErrors['doc_' + slot.id]"
            >
              <!-- Slot Left: Number Badge & Titles -->
              <div class="slot-info-box">
                <div class="slot-number-badge">
                  {{ i + 1 }}
                </div>
                <div class="slot-titles">
                  <div class="slot-title-line">
                    <span class="slot-main-title">{{ slot.title }}</span>
                  </div>
                  <span class="slot-sub-title">{{ slot.subtitle }}</span>
                  
                  <!-- File Uploaded Info Banner -->
                  <div *ngIf="slot.fileName" class="uploaded-file-banner">
                    <span class="uploaded-filename" [title]="slot.fileName">{{ slot.fileName }}</span>
                    <span class="uploaded-filesize">({{ slot.fileSize }})</span>
                    <span class="uploaded-status-check">• Uploaded on {{ slot.uploadDate }}</span>
                  </div>

                  <!-- Inline Error Messages -->
                  <div *ngIf="slot.error || validationErrors['doc_' + slot.id]" class="slot-inline-error">
                    {{ slot.error || validationErrors['doc_' + slot.id] }}
                  </div>
                </div>
              </div>

              <!-- Slot Right: Actions (Choose PDF, View, Change, Remove) -->
              <div class="slot-actions-box">
                <!-- Hidden Native File Input -->
                <input
                  type="file"
                  [id]="'file_input_' + slot.id"
                  class="hidden-file-input"
                  accept=".pdf,application/pdf"
                  (change)="onFileSelected(slot.id, $event)"
                />

                <!-- If NOT Uploaded: Choose PDF Button -->
                <div *ngIf="!slot.fileName" class="upload-btn-wrap">
                  <label [attr.for]="'file_input_' + slot.id" class="gov-btn gov-btn-choose-file">
                    <span>Choose PDF</span>
                  </label>
                  <span class="no-file-text">No file selected</span>
                </div>

                <!-- If Uploaded: View, Change, Remove Controls -->
                <div *ngIf="slot.fileName" class="uploaded-actions-group">
                  <button
                    type="button"
                    class="doc-action-btn btn-view"
                    (click)="viewDocument(slot.title || slot.categoryName, slot.fileName || '', slot.fileSize || slot.fileSizeFormatted || '')"
                    title="Preview Document"
                  >
                    View
                  </button>
                  <label [attr.for]="'file_input_' + slot.id" class="doc-action-btn btn-change" title="Change PDF File">
                    Change
                  </label>
                  <button
                    type="button"
                    class="doc-action-btn btn-remove"
                    (click)="removeUploadedFile(slot.id)"
                    title="Remove Document"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Form Actions -->
      <div class="gov-form-footer">
        <div class="footer-left"></div>
        <div class="footer-right">
          <button
            type="button"
            id="btn-doc-next"
            class="gov-btn gov-btn-primary gov-btn-next-step"
            (click)="onNext.emit()"
          >
            <span>Next (Proceed to Fees)</span>
            <span class="arrow-icon">→</span>
          </button>
        </div>
      </div>

    </div>
  `
})
export class StepDocumentsComponent {
  readonly eoiService = inject(EoiService);

  @Input() scheme: Scheme | null = null;
  @Input() validationErrors: Record<string, string> = {};

  @Output() onChangeScheme = new EventEmitter<void>();
  @Output() onNext = new EventEmitter<void>();
  @Output() onViewDoc = new EventEmitter<{ title: string; fileName: string; fileSize: string }>();
  @Output() onClearError = new EventEmitter<string>();

  trackBySlotId(index: number, item: any): string {
    return item.id || String(index);
  }

  onFileSelected(slotId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const success = this.eoiService.uploadDocument(slotId, file);
      if (success) {
        this.onClearError.emit(`doc_${slotId}`);
      }
      input.value = '';
    }
  }

  removeUploadedFile(slotId: string): void {
    this.eoiService.removeDocument(slotId);
  }

  viewDocument(title: string, fileName: string, fileSize: string): void {
    this.onViewDoc.emit({ title, fileName, fileSize });
  }
}
