import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AspirantDocumentItem } from '../../config/aspirant-form.config';
import { AspirantModalShellComponent } from './aspirant-modal-shell.component';
import { formatFileSize, stripFileExtension, todayIsoDate } from './aspirant-document.util';

/** Modal: upload and attach a new document. Emits the filled form on save. */
@Component({
  selector: 'app-aspirant-add-document-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AspirantModalShellComponent],
  template: `
    <app-aspirant-modal-shell heading="Upload &amp; Attach Document" (close)="close.emit()">
  <div class="p-5 space-y-4 text-xs">
    <div>
      <label class="block text-slate-700 font-semibold mb-1">Document Category / Type *</label>
      <select
        [(ngModel)]="newDocForm.docType"
        class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-primary"
      >
        <option value="Educational Qualification Certificate">Educational Qualification Certificate</option>
        <option value="Bank Passbook / Cancelled Cheque">Bank Passbook / Cancelled Cheque</option>
        <option value="Aadhaar Card">Aadhaar Card Copy</option>
        <option value="Domicile Certificate">Domicile / Bonafide Certificate</option>
        <option value="Caste Certificate">Caste / Category Certificate (SC/ST/OBC)</option>
        <option value="Income Certificate">Income Certificate</option>
        <option value="BPL Ration Card">BPL Ration Card</option>
        <option value="Disability Certificate">Disability / PwD Certificate</option>
        <option value="Experience Certificate">Experience Certificate</option>
        <option value="Other Supporting Document">Other Supporting Document</option>
      </select>
    </div>

    <div>
      <label class="block text-slate-700 font-semibold mb-1">Document Title / Description *</label>
      <input
        type="text"
        [(ngModel)]="newDocForm.docName"
        placeholder="e.g. 12th Senior Secondary Marksheet"
        class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-primary"
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
          <svg class="w-8 h-8 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
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

  <div class="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2.5">
    <button
      type="button"
      (click)="close.emit()"
      class="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
    >
      Cancel
    </button>
    <button
      type="button"
      (click)="save.emit(newDocForm)"
      class="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold cursor-pointer"
      style="color: #ffffff !important;"
    >
      Upload &amp; Attach
    </button>
  </div>
    </app-aspirant-modal-shell>
  `
})
export class AspirantAddDocumentModalComponent {
  readonly save = output<Partial<AspirantDocumentItem>>();
  readonly close = output<void>();

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