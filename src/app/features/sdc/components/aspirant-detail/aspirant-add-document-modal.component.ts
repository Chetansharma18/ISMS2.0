import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AspirantDocumentItem } from '../../config/aspirant-form.config';
import { ButtonComponent, DropdownComponent, IconComponent, InputDirective, ModalComponent } from '../../../../shared';
import { formatFileSize, stripFileExtension, todayIsoDate } from './aspirant-document.util';

/** Modal: upload and attach a new document. Emits the filled form on save. */
@Component({
  selector: 'app-aspirant-add-document-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective, ModalComponent, DropdownComponent],
  template: `
    <app-modal title="Upload &amp; Attach Document" size="sm" (close)="close.emit()">
  <div class="space-y-4 text-xs">
    <div>
      <label class="block text-slate-700 font-semibold mb-1">Document Category / Type *</label>
      <app-dropdown
        [options]="docTypeOptions"
        [value]="newDocForm.docType || ''"
        (valueChange)="newDocForm.docType = $event"
        placeholder="Select Document Type"
        class="w-full"
      />
    </div>

    <div>
      <label class="block text-slate-700 font-semibold mb-1">Document Title / Description *</label>
      <input
        appInput
        type="text"
        [(ngModel)]="newDocForm.docName"
        placeholder="e.g. 12th Senior Secondary Marksheet"
        class="w-full"
      />
    </div>

    <div>
      <label class="block text-slate-700 font-semibold mb-1">Select File (PDF, JPG, PNG) *</label>
      <div class="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer" (click)="newDocFileInput.click()">
        <input
          #newDocFileInput
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          (change)="onNewDocFileSelected($event)"
          class="hidden"
        />
        <div class="space-y-1">
          <div class="flex justify-center">
            <app-icon name="upload-cloud" size="2xl" [stroke]="1.5" class="text-slate-400" />
          </div>
          <span class="text-xs font-semibold text-brand block">
            {{ newDocForm.fileName ? newDocForm.fileName : 'Click to browse file' }}
          </span>
          <span class="text-[11px] text-slate-400 block">
            {{ newDocForm.fileSize ? newDocForm.fileSize : 'PDF, JPG, PNG up to 10MB' }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <ng-container modalFooter>
    <button
      appButton
      type="button"
      (click)="save.emit(newDocForm)"
    >
      Upload &amp; Attach
    </button>
  </ng-container>
    </app-modal>
  `
})
export class AspirantAddDocumentModalComponent {
  readonly save = output<Partial<AspirantDocumentItem>>();
  readonly close = output<void>();

  readonly docTypeOptions = [
    'Educational Qualification Certificate',
    'Bank Passbook / Cancelled Cheque',
    'Aadhaar Card Copy',
    'Domicile / Bonafide Certificate',
    'Caste / Category Certificate (SC/ST/OBC)',
    'Income Certificate',
    'BPL Ration Card',
    'Disability / PwD Certificate',
    'Experience Certificate',
    'Other Supporting Document'
  ];

  newDocForm: Partial<AspirantDocumentItem> = {
    id: 'doc-' + Date.now(),
    docType: 'Educational Qualification Certificate',
    docName: '',
    fileName: '',
    fileSize: '',
    status: 'UPLOADED',
    uploadedAt: todayIsoDate()
  };

  onNewDocFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newDocForm.fileName = file.name;
      this.newDocForm.fileSize = formatFileSize(file.size);
      if (!this.newDocForm.docName) {
        this.newDocForm.docName = stripFileExtension(file.name);
      }
    }
  }
}