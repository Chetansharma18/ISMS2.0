import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, InputDirective, TableColumn, TableComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';
import { EoiDocumentItem } from '../scheme-form.model';
import { DOC_ACCEPT, DOC_FORMAT_LABEL, DOC_MAX_SIZE_MB, validateDocFile } from './step3-document-rules';

/** Step 2: upload the supporting documents and optional per-document comments. */
@Component({
  selector: 'app-step3-upload-documents',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputDirective, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-5 font-sans">

      <!-- Documents section block -->
      <section class="border border-[#EADCE2] rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-[#F8E9EE] px-4 py-3 border-b border-[#EADCE2] flex items-center justify-between gap-2.5">
          <h2 class="text-sm sm:text-base font-bold text-[#7C0E44] m-0">Supporting Documents</h2>
          <span class="text-[11.5px] font-medium text-[#625663] shrink-0">
            {{ state.attachedDocsCount() }} / {{ state.eoiDocuments().length }} uploaded
          </span>
        </div>

        <div class="p-3 sm:p-4">
          <app-table
            [columns]="documentColumns"
            [data]="state.eoiDocuments()"
            [customTemplates]="{ name: nameTemplate, comment: commentTemplate, action: actionTemplate }"
          >
          </app-table>
        </div>

        <ng-template #nameTemplate let-doc>
          <div class="py-1 min-w-0">
            <div class="text-[12.5px] font-medium text-slate-900 leading-tight">
              {{ doc.name }}@if (doc.isMandatory) { <span class="text-red-600 font-bold"> *</span> }
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5">
              Supported: {{ formatLabel }} &nbsp;|&nbsp; Max size: {{ maxSizeMb }} MB
            </div>
            @if (doc.status === 'uploaded' && doc.fileName) {
              <span class="text-[11.5px] tabular-nums text-emerald-700 font-medium block mt-1 truncate max-w-[320px]" title="{{ doc.fileName }} ({{ doc.fileSize }})">
                {{ doc.fileName }} ({{ doc.fileSize }})
              </span>
            }
            @if (errors()[doc.id]) {
              <p class="text-[11.5px] text-red-600 m-0 mt-1" role="alert">{{ errors()[doc.id] }}</p>
            }
          </div>
        </ng-template>

        <ng-template #commentTemplate let-doc>
          <input
            appInput
            size="sm"
            type="text"
            maxlength="500"
            placeholder="Add comment..."
            [attr.aria-label]="'Comment for ' + doc.name"
            [ngModel]="doc.comment ?? ''"
            (ngModelChange)="state.updateDocComment(doc.id, $event)"
            (blur)="state.updateDocComment(doc.id, doc.comment ?? '', true)"
            class="w-full"
          />
        </ng-template>

        <ng-template #actionTemplate let-doc>
          <div class="flex items-center justify-center gap-1.5 flex-nowrap whitespace-nowrap">
            @if (doc.status === 'pending') {
              <button appButton size="sm" (click)="uploadInput.click()">Upload</button>
              <input #uploadInput type="file" (change)="onFileChange($event, doc)" class="hidden" [accept]="accept" />
            } @else {
              <button appButton variant="outline" size="sm" (click)="state.viewDoc(doc.fileName, doc.name, doc.fileSize)">View</button>
              <button appButton variant="secondary" size="sm" (click)="replaceInput.click()">Replace</button>
              <input #replaceInput type="file" (change)="onFileChange($event, doc)" class="hidden" [accept]="accept" />
              <button appButton variant="danger" size="sm" (click)="onRemove(doc)">Remove</button>
            }
          </div>
        </ng-template>
      </section>

      <!-- Footer Action Bar -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button appButton variant="outline" size="lg" (click)="state.goToStep(1)">
          &larr; Back to Registration Profile
        </button>

        <button appButton size="lg" (click)="state.goToStep(3)">
          Proceed to Complete Preview &rarr;
        </button>
      </div>

    </div>
  `
})
export class Step3UploadDocumentsComponent {
  protected readonly state = inject(SchemeFormState);

  protected readonly accept = DOC_ACCEPT;
  protected readonly formatLabel = DOC_FORMAT_LABEL;
  protected readonly maxSizeMb = DOC_MAX_SIZE_MB;

  protected readonly documentColumns: TableColumn<EoiDocumentItem>[] = [
    { key: 'id', label: 'S. No.', align: 'center', width: 'w-14' },
    { key: 'name', label: 'Supporting Document', type: 'custom', width: 'min-w-[240px]' },
    { key: 'comment', label: 'Comment', type: 'custom', width: 'min-w-[200px] w-[250px]' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'w-[270px] whitespace-nowrap' }
  ];

  /** Inline validation messages keyed by document id. */
  protected readonly errors = signal<Record<number, string>>({});

  /** Validates the picked file (type and size), then delegates to the shared upload handler. */
  protected onFileChange(event: Event, doc: EoiDocumentItem): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const error = validateDocFile(file);
    if (error) {
      this.setError(doc.id, error);
      input.value = '';
      return;
    }

    this.setError(doc.id, null);
    this.state.onFileSelected(event, doc);
  }

  /** Clears the attached file; the list is re-emitted because the state handler mutates in place. */
  protected onRemove(doc: EoiDocumentItem): void {
    this.state.removeSchemeDoc(doc);
    this.state.eoiDocuments.update(docs => [...docs]);
    this.setError(doc.id, null);
  }

  private setError(id: number, message: string | null): void {
    this.errors.update(current => {
      const next = { ...current };
      if (message) {
        next[id] = message;
      } else {
        delete next[id];
      }
      return next;
    });
  }
}
