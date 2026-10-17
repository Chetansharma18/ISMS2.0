import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AspirantDocumentItem } from '../../config/aspirant-form.config';
import { ButtonComponent, InputDirective, ModalComponent } from '../../../../shared';

/** Modal: edit a document's type and title (edits the supplied copy in place). */
@Component({
  selector: 'app-aspirant-edit-document-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, InputDirective, ModalComponent],
  template: `
    <app-modal title="Edit Document Details" size="sm" (close)="close.emit()">
  <div class="space-y-4 text-xs">
    <div>
      <label class="block text-slate-700 font-semibold mb-1">Document Type</label>
      <select
        appInput
        [(ngModel)]="doc().docType"
        class="w-full"
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
        appInput
        type="text"
        [(ngModel)]="doc().docName"
        class="w-full"
      />
    </div>

    <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <span class="text-[11px] text-slate-500 block">Current Attached File:</span>
      <span class="font-mono font-medium text-slate-800 text-xs block mt-0.5 truncate">{{ doc().fileName }}</span>
      <span class="text-[10.5px] text-slate-400 block">{{ doc().fileSize }} • {{ doc().uploadedAt || 'Verified' }}</span>
    </div>
  </div>

  <ng-container modalFooter>
    <button
      appButton
      variant="outline"
      type="button"
      (click)="close.emit()"
    >
      Cancel
    </button>
    <button
      appButton
      type="button"
      (click)="save.emit(doc())"
    >
      Save Details
    </button>
  </ng-container>
    </app-modal>
  `
})
export class AspirantEditDocumentModalComponent {
  readonly doc = input.required<AspirantDocumentItem>();
  readonly save = output<AspirantDocumentItem>();
  readonly close = output<void>();
}