import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AspirantRecord } from '../../models/aspirant.model';
import { AspirantDocumentItem } from '../../config/aspirant-form.config';
import { getDocExtension } from './aspirant-document.util';

/** View-mode card: attached documents table with upload / replace / edit / delete actions. */
@Component({
  selector: 'app-aspirant-documents-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let cand = aspirant();
    <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-primary rounded-full"></span>
            <span>4. Attached Documents ({{ cand.documents ? cand.documents.length : 0 }})</span>
          </h2>
          <p class="text-[11px] text-slate-500 mt-0.5">Manage, preview, edit, replace or upload new documents for this candidate</p>
        </div>

        <!-- Add Document Trigger Button -->
        <button
          type="button"
          (click)="addDocument.emit()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          style="color: #ffffff !important;"
        >
          <span class="text-base font-bold leading-none" style="color: #ffffff !important;">+</span>
          <span style="color: #ffffff !important;">Upload New Document</span>
        </button>
      </div>

      <!-- Hidden Master Document Replacement File Input -->
      <input
        #docReplaceFileInput
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        (change)="onReplaceFileSelected($event)"
        class="hidden"
      />

      <div class="overflow-x-auto border border-slate-200 rounded-lg">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
            <tr>
              <th class="py-2.5 px-3 w-10 text-center">#</th>
              <th class="py-2.5 px-4">Document Type</th>
              <th class="py-2.5 px-4">Document Title</th>
              <th class="py-2.5 px-4">Attached File &amp; Size</th>
              <th class="py-2.5 px-3 text-center">Status</th>
              <th class="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (doc of cand.documents; track doc.id; let idx = $index) {
              <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="py-3 px-3 text-center text-slate-400 font-mono">{{ idx + 1 }}</td>
                <td class="py-3 px-4">
                  <span class="font-semibold text-slate-900 block">{{ doc.docType }}</span>
                  <span class="text-[10px] text-slate-400">{{ doc.badgeLabel || 'Statutory' }}</span>
                </td>
                <td class="py-3 px-4 font-medium text-slate-700">
                  {{ doc.docName }}
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                      {{ getDocExtension(doc.fileName) }}
                    </span>
                    <div class="min-w-0">
                      <span class="font-mono text-xs text-slate-800 block truncate max-w-[200px]" [title]="doc.fileName">
                        {{ doc.fileName || 'No file attached' }}
                      </span>
                      <span class="text-[10.5px] text-slate-400 block font-sans">
                        {{ doc.fileSize || 'Standard' }} • {{ doc.uploadedAt || 'Verified' }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 text-center">
                  @if (doc.status === 'UPLOADED') {
                    <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Uploaded ✓
                    </span>
                  } @else {
                    <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Pending
                    </span>
                  }
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <!-- 1. View / Preview -->
                    <button
                      type="button"
                      (click)="preview.emit(doc)"
                      class="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="View / Preview Document"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <!-- 2. Replace File -->
                    <button
                      type="button"
                      (click)="triggerReplaceDoc(doc, docReplaceFileInput)"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary-light hover:bg-[#d8e8f2] text-brand font-semibold text-[11px] transition-colors cursor-pointer border border-[#c1d9e7]"
                      title="Upload replacement file"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Replace</span>
                    </button>

                    <!-- 3. Edit Document Details -->
                    <button
                      type="button"
                      (click)="editDoc.emit(doc)"
                      class="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Edit Document Details"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <!-- 4. Delete Document -->
                    <button
                      type="button"
                      (click)="deleteDoc.emit(doc)"
                      class="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove Document"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="py-8 text-center text-slate-500">
                  No documents attached yet. Click "+ Upload New Document" to attach candidate verification files.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AspirantDocumentsTableComponent {
  readonly aspirant = input.required<AspirantRecord>();
  readonly addDocument = output<void>();
  readonly preview = output<AspirantDocumentItem>();
  readonly replaceFile = output<{ doc: AspirantDocumentItem; file: File }>();
  readonly editDoc = output<AspirantDocumentItem>();
  readonly deleteDoc = output<AspirantDocumentItem>();

  private targetDocForReplace: AspirantDocumentItem | null = null;

  readonly getDocExtension = getDocExtension;

  triggerReplaceDoc(doc: AspirantDocumentItem, fileInput: HTMLInputElement): void {
    this.targetDocForReplace = doc;
    fileInput.click();
  }

  onReplaceFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.targetDocForReplace) {
      this.replaceFile.emit({ doc: this.targetDocForReplace, file: input.files[0] });
      input.value = '';
    }
  }
}