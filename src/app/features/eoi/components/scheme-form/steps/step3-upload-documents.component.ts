import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';
import { EoiDocumentItem } from '../scheme-form.model';
import { DOC_ACCEPT, DOC_FORMAT_LABEL, DOC_MAX_SIZE_MB, validateDocFile } from './step3-document-rules';

/** Step 3: upload the 16 proposal documents. */
@Component({
  selector: 'app-step3-upload-documents',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-5 font-sans">

      <!-- Documents section block -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Proposal Documents</h2>
          </div>
          <span class="text-[11.5px] font-medium text-slate-500 shrink-0">
            {{ state.attachedDocsCount() }} / {{ state.eoiDocuments().length }} uploaded
          </span>
        </div>

        <div class="divide-y divide-slate-100">
          @for (doc of state.eoiDocuments(); track doc.id) {
            <div class="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              <!-- Left: number, name, requirement hint, file info -->
              <div class="flex items-start gap-3 min-w-0">
                <span class="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  {{ doc.id }}
                </span>

                <div class="min-w-0">
                  <div class="text-[12.5px] font-medium text-slate-900 leading-tight">
                    {{ doc.name }}@if (doc.isMandatory) { <span class="text-red-600 font-bold"> *</span> }
                  </div>

                  <div class="text-[11.5px] text-slate-500 mt-0.5">
                    Supported: {{ formatLabel }} &nbsp;|&nbsp; Max size: {{ maxSizeMb }} MB
                  </div>

                  @if (doc.status === 'uploaded' && doc.fileName) {
                    <span class="text-[11.5px] tabular-nums text-slate-600 block mt-1 truncate" title="{{ doc.fileName }} ({{ doc.fileSize }})">
                      {{ doc.fileName }} ({{ doc.fileSize }})
                    </span>
                  }

                  @if (errors()[doc.id]) {
                    <p class="text-[11.5px] text-red-600 m-0 mt-1" role="alert">{{ errors()[doc.id] }}</p>
                  }
                </div>
              </div>

              <!-- Right: actions -->
              <div class="flex items-center gap-1.5 shrink-0 sm:ml-0 ml-9">
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

            </div>
          }
        </div>
      </section>

      <!-- Footer Action Bar -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button appButton variant="outline" size="lg" (click)="state.goToStep(2)">
          &larr; Back to Registration Profile
        </button>

        <button appButton size="lg" (click)="state.goToStep(4)">
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
