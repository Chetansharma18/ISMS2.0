import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AspirantRecord } from '../../models/aspirant.model';
import { PARENT_FORM_VIEW_PROVIDER } from './aspirant-parent-form.provider';
import { formatFileSize, todayIsoDate } from './aspirant-document.util';
import { ButtonComponent, IconComponent, InputDirective } from '../../../../shared';

/** Edit-mode card: attached document slots (edits the parent-owned form object). */
@Component({
  selector: 'app-aspirant-documents-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective],
  viewProviders: [PARENT_FORM_VIEW_PROVIDER],
  template: `
    <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
      <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-primary rounded-full"></span>
          <span>4. Edit Attached Documents</span>
        </h3>
        <button
          appButton
          size="sm"
          type="button"
          (click)="addDocumentSlotInEdit()"
        >
          <span>+ Add Document</span>
        </button>
      </div>

      <div class="space-y-3">
        @for (doc of form().documents; track doc.id; let idx = $index) {
          <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            
            <div class="flex items-center gap-2.5 w-full md:w-auto">
              <span class="font-mono text-slate-400 font-bold w-6">{{ idx + 1 }}.</span>
              <div class="space-y-1 flex-1 md:w-56">
                <label class="block text-[10.5px] font-bold text-slate-600">Document Type</label>
                <select
                  appInput
                  size="sm"
                  [(ngModel)]="doc.docType"
                  [name]="'docType_' + idx"
                  class="w-full"
                >
                  <option value="Educational Qualification Certificate">Educational Qualification</option>
                  <option value="Bank Passbook / Cancelled Cheque">Bank Passbook / Cheque</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Domicile Certificate">Domicile / Bonafide</option>
                  <option value="Caste Certificate">Caste Certificate</option>
                  <option value="Income Certificate">Income Certificate</option>
                  <option value="BPL Ration Card">BPL Ration Card</option>
                  <option value="Disability Certificate">Disability Certificate</option>
                  <option value="Other Document">Other Document</option>
                </select>
              </div>
            </div>

            <div class="space-y-1 w-full md:w-64">
              <label class="block text-[10.5px] font-bold text-slate-600">Document Title</label>
              <input
                appInput
                size="sm"
                type="text"
                [(ngModel)]="doc.docName"
                [name]="'docName_' + idx"
                class="w-full"
                placeholder="e.g. 10th Passing Certificate"
              />
            </div>

            <div class="space-y-1 w-full md:w-56">
              <label class="block text-[10.5px] font-bold text-slate-600">Attached File</label>
              <div class="flex items-center gap-2">
                <span class="font-mono text-[11px] text-slate-700 truncate block flex-1" [title]="doc.fileName">
                  {{ doc.fileName || 'Pending upload' }}
                </span>
                <button
                  appButton
                  variant="outline"
                  size="sm"
                  class="shrink-0"
                  type="button"
                  (click)="triggerDocFileInput(idx)"
                >
                  Browse
                </button>
                <input
                  [id]="'docFileInput_' + idx"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  (change)="onEditDocFileSelected(idx, $event)"
                  class="hidden"
                />
              </div>
            </div>

            <div class="flex items-center gap-2 self-end md:self-center">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {{ doc.status }}
              </span>
              <button
                appButton
                variant="ghost"
                size="sm"
                iconOnly
                type="button"
                (click)="removeDocumentFromEdit(idx)"
                title="Remove document slot"
                aria-label="Remove document slot"
              >
                <app-icon name="close" size="xs" />
              </button>
            </div>

          </div>
        }
      </div>
    </div>
  `
})
export class AspirantDocumentsEditComponent {
  readonly form = input.required<Partial<AspirantRecord>>();
  readonly notify = output<string>();

  addDocumentSlotInEdit(): void {
    const form = this.form();
    if (!form.documents) {
      form.documents = [];
    }
    form.documents.push({
      id: 'doc-' + Date.now(),
      docType: 'Other Document',
      docName: 'Supporting Document',
      fileName: 'document.pdf',
      fileSize: '1.0 MB',
      status: 'UPLOADED',
      uploadedAt: todayIsoDate()
    });
  }

  removeDocumentFromEdit(idx: number): void {
    const form = this.form();
    if (form.documents) {
      form.documents.splice(idx, 1);
    }
  }

  triggerDocFileInput(idx: number): void {
    const el = document.getElementById('docFileInput_' + idx) as HTMLInputElement;
    if (el) el.click();
  }

  onEditDocFileSelected(idx: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const docs = this.form().documents;
    if (input.files && input.files[0] && docs && docs[idx]) {
      const file = input.files[0];
      docs[idx].fileName = file.name;
      docs[idx].fileSize = formatFileSize(file.size);
      docs[idx].status = 'UPLOADED';
      this.notify.emit(`Selected file "${file.name}" for document item ${idx + 1}`);
    }
  }
}