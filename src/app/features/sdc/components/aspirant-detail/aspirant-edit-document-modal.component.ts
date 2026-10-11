import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AspirantDocumentItem } from '../../config/aspirant-form.config';
import { AspirantModalShellComponent } from './aspirant-modal-shell.component';

/** Modal: edit a document's type and title (edits the supplied copy in place). */
@Component({
  selector: 'app-aspirant-edit-document-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AspirantModalShellComponent],
  template: `
    <app-aspirant-modal-shell heading="Edit Document Details" (close)="close.emit()">
  <div class="p-5 space-y-4 text-xs">
    <div>
      <label class="block text-slate-700 font-semibold mb-1">Document Type</label>
      <select
        [(ngModel)]="doc().docType"
        class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-primary"
      >
        <option value="Educational Qualification Certificate">Educational Qualification Certificate</option>
        <option value="Bank Passbook / Cancelled Cheque">Bank Passbook / Cancelled Cheque</option>
        <option value="Aadhaar Card">Aadhaar Card Copy</option>
        <option value="Domicile Certificate">Domicile / Bonafide Certificate</option>
        <option value="Caste Certificate">Caste / Category Certificate</option>
        <option value="Income Certificate">Income Certificate</option>
        <option value="BPL Ration Card">BPL Ration Card</option>
        <option value="Disability Certificate">Disability / PwD Certificate</option>
        <option value="Other Document">Other Document</option>
      </select>
    </div>

    <div>
      <label class="block text-slate-700 font-semibold mb-1">Document Title</label>
      <input
        type="text"
        [(ngModel)]="doc().docName"
        class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-primary"
      />
    </div>

    <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <span class="text-[11px] text-slate-500 block">Current Attached File:</span>
      <span class="font-mono font-medium text-slate-800 text-xs block mt-0.5 truncate">{{ doc().fileName }}</span>
      <span class="text-[10.5px] text-slate-400 block">{{ doc().fileSize }} • {{ doc().uploadedAt || 'Verified' }}</span>
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
      (click)="save.emit(doc())"
      class="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold cursor-pointer"
      style="color: #ffffff !important;"
    >
      Save Details
    </button>
  </div>
    </app-aspirant-modal-shell>
  `
})
export class AspirantEditDocumentModalComponent {
  readonly doc = input.required<AspirantDocumentItem>();
  readonly save = output<AspirantDocumentItem>();
  readonly close = output<void>();
}