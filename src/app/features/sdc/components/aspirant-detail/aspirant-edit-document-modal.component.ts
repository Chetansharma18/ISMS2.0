import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AspirantDocumentItem } from '../../config/aspirant-form.config';
import { ButtonComponent, DropdownComponent, InputDirective, ModalComponent } from '../../../../shared';

/** Modal: edit a document's type and title (edits the supplied copy in place). */
@Component({
  selector: 'app-aspirant-edit-document-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, InputDirective, ModalComponent, DropdownComponent],
  template: `
    <app-modal title="Edit Document Details" size="sm" (close)="close.emit()">
  <div class="space-y-4 text-xs">
    <div>
      <label class="block text-slate-700 font-semibold mb-1">Document Type</label>
      <app-dropdown
        [options]="docTypeOptions"
        [(value)]="doc().docType"
        placeholder="Select Document Type"
        class="w-full"
      />
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
      <span class="tabular-nums font-medium text-slate-800 text-xs block mt-0.5 truncate">{{ doc().fileName }}</span>
      <span class="text-[10.5px] text-slate-400 block">{{ doc().fileSize }} • {{ doc().uploadedAt || 'Verified' }}</span>
    </div>
  </div>

  <ng-container modalFooter>
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

  readonly docTypeOptions = [
    'Educational Qualification Certificate',
    'Bank Passbook / Cancelled Cheque',
    'Aadhaar Card Copy',
    'Domicile / Bonafide Certificate',
    'Caste / Category Certificate',
    'Income Certificate',
    'BPL Ration Card',
    'Disability / PwD Certificate',
    'Other Document'
  ];
}