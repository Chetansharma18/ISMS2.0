import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TpPiaRegistrationService } from '../../services/tp-pia-registration.service';
import { FormValidationService } from '../../services/form-validation.service';
import { UploadedDocument } from '../../models/tp-pia-registration.model';

@Component({
  selector: 'app-tab-documents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="space-y-5 sm:space-y-6">
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div 
          class="px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >

          <div class="flex items-center flex-wrap gap-2 text-xs font-medium">
            <span class="text-slate-500 hidden sm:inline">Supported: PDF, JPG, PNG (Max 5 MB)</span>
            <span 
              class="inline-flex items-center gap-1.5 px-2.5 py-1 font-bold border rounded text-xs whitespace-nowrap"
              [ngClass]="uploadedRequiredCount === totalRequiredCount 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-blue-50 text-blue-900 border-blue-200'"
            >
              Uploaded: {{ uploadedRequiredCount }} / {{ totalRequiredCount }} Mandatory
            </span>
          </div>
        </div>

        <div class="p-4 sm:p-6">
          @if (isTab4Invalid) {
            <div class="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs sm:text-sm text-rose-700 flex items-center gap-2 font-medium">
              <svg class="w-4 h-4 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>Please upload all {{ totalRequiredCount }} mandatory documents marked with an asterisk before proceeding to submission.</span>
            </div>
          }

          @if (errorMessage()) {
            <div class="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs sm:text-sm text-rose-700 flex items-center justify-between">
              <span>{{ errorMessage() }}</span>
              <button type="button" (click)="errorMessage.set('')" class="text-rose-500 hover:text-rose-700 font-bold text-lg cursor-pointer leading-none">&times;</button>
            </div>
          }

          <!-- Mobile Card View (block md:hidden) -->
          <div class="block md:hidden space-y-3">
            @for (doc of documents; track doc.id; let idx = $index) {
              <div 
                class="bg-white border rounded-xl p-3.5 shadow-2xs space-y-2.5 transition"
                [ngClass]="doc.required && doc.status !== 'uploaded' && isTab4Submitted 
                  ? 'border-rose-300 bg-rose-50/20' 
                  : 'border-slate-200 hover:border-slate-300'"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-mono text-xs font-bold text-slate-400">#{{ idx + 1 }}</span>
                      <h4 class="font-bold text-slate-900 text-sm">
                        {{ doc.label }}
                        @if (doc.required) {
                          <span class="text-rose-500 font-bold">*</span>
                        }
                      </h4>
                    </div>
                    <div class="text-[11px] text-slate-400 mt-0.5">{{ doc.docType }}</div>
                  </div>
                  <span class="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded shrink-0"
                    [ngClass]="doc.required ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'">
                    {{ doc.required ? 'Mandatory' : 'Optional' }}
                  </span>
                </div>

                <!-- File status -->
                <div class="pt-1.5 border-t border-slate-100 text-xs">
                  @if (doc.status === 'uploaded' && doc.fileName) {
                    <div class="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span class="truncate font-semibold" [title]="doc.fileName">{{ doc.fileName }}</span>
                      <span class="text-[11px] text-slate-400 font-mono shrink-0">({{ doc.fileSize }})</span>
                    </div>
                  } @else {
                    <span class="text-slate-400 italic text-xs">Not uploaded yet</span>
                  }
                </div>

                <!-- Action button -->
                <div class="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span class="text-[11px] text-slate-500">
                    {{ doc.uploadDate ? 'Uploaded on: ' + doc.uploadDate : 'Allowed: PDF, JPG, PNG' }}
                  </span>
                  @if (doc.status === 'uploaded') {
                    <div class="flex items-center gap-2">
                      <button 
                        type="button" 
                        (click)="previewingDoc.set(doc)" 
                        class="inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:text-blue-700 underline cursor-pointer"
                        title="Preview Document"
                      >
                        <svg class="w-3.5 h-3.5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </button>
                      <span class="text-slate-300">|</span>
                      <label class="cursor-pointer text-xs text-slate-600 font-semibold hover:underline">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onFileSelected($event, doc.id)" class="sr-only" />
                        Replace
                      </label>
                      <span class="text-slate-300">|</span>
                      <button type="button" (click)="removeDocument(doc.id)" class="text-xs text-rose-600 font-semibold hover:underline cursor-pointer">
                        Remove
                      </button>
                    </div>
                  } @else {
                    <div class="flex items-center gap-2">
                      <button 
                        type="button" 
                        (click)="previewingDoc.set(doc)" 
                        class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-900 hover:underline cursor-pointer"
                        title="Preview Requirements"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </button>
                      <span class="text-slate-300">|</span>
                      <label class="inline-flex items-center gap-1 cursor-pointer px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-lg text-xs font-semibold transition">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onFileSelected($event, doc.id)" class="sr-only" />
                        <svg class="w-3.5 h-3.5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                        </svg>
                        Browse
                      </label>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Desktop Document Table (hidden md:block) -->
          <div class="hidden md:block overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50/90 border-b border-slate-200 text-slate-800 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-3.5 px-4 w-12 text-center">#</th>
                  <th class="py-3.5 px-4">Document Description</th>
                  <th class="py-3.5 px-4 w-36">Requirement</th>
                  <th class="py-3.5 px-4">Uploaded File Details</th>
                  <th class="py-3.5 px-4 w-44 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (doc of documents; track doc.id; let idx = $index) {
                  <tr 
                    class="transition"
                    [ngClass]="doc.required && doc.status !== 'uploaded' && isTab4Submitted 
                      ? 'bg-rose-50/40 hover:bg-rose-50/60' 
                      : 'hover:bg-slate-50/70'"
                  >
                    <td class="py-3.5 px-4 font-mono text-slate-400 text-xs text-center">{{ idx + 1 }}</td>
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {{ doc.label }}
                        @if (doc.required) {
                          <span class="text-rose-500 font-bold text-sm">*</span>
                        }
                      </div>
                      <div class="text-xs text-slate-400 mt-0.5">{{ doc.docType }}</div>
                      @if (doc.required && doc.status !== 'uploaded' && isTab4Submitted) {
                        <span class="text-xs text-rose-600 font-medium mt-0.5 block">Upload required</span>
                      }
                    </td>
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md"
                        [ngClass]="doc.required ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'">
                        {{ doc.required ? 'Mandatory' : 'Optional' }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4">
                      @if (doc.status === 'uploaded' && doc.fileName) {
                        <div class="space-y-0.5">
                          <div class="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span class="truncate max-w-xs font-semibold" [title]="doc.fileName">{{ doc.fileName }}</span>
                            <span class="text-xs text-slate-400 font-mono">({{ doc.fileSize }})</span>
                          </div>
                          <div class="text-[11px] text-slate-400">Uploaded on: {{ doc.uploadDate }}</div>
                        </div>
                      } @else {
                        <span class="text-slate-400 italic text-xs">Not uploaded yet</span>
                      }
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      @if (doc.status === 'uploaded') {
                        <div class="inline-flex items-center gap-2 justify-end">
                          <button 
                            type="button" 
                            (click)="previewingDoc.set(doc)" 
                            class="inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:text-blue-700 underline cursor-pointer"
                            title="Preview Document"
                          >
                            <svg class="w-3.5 h-3.5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                          </button>
                          <span class="text-slate-300">|</span>
                          <label class="cursor-pointer text-xs text-blue-900 font-semibold hover:underline">
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onFileSelected($event, doc.id)" class="sr-only" />
                            Replace
                          </label>
                          <span class="text-slate-300">|</span>
                          <button type="button" (click)="removeDocument(doc.id)" class="text-xs text-rose-600 font-semibold hover:underline cursor-pointer">
                            Remove
                          </button>
                        </div>
                      } @else {
                        <div class="inline-flex items-center gap-2 justify-end">
                          <button 
                            type="button" 
                            (click)="previewingDoc.set(doc)" 
                            class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-900 hover:underline cursor-pointer"
                            title="Preview Requirements"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                          </button>
                          <span class="text-slate-300">|</span>
                          <label class="inline-flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-lg text-xs font-semibold transition">
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onFileSelected($event, doc.id)" class="sr-only" />
                            <svg class="w-3.5 h-3.5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                            </svg>
                            Browse
                          </label>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Document Preview Modal -->
      @if (previewingDoc()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <!-- Modal Header -->
            <div class="bg-[#0f1738] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between">
              <div class="flex items-center gap-2 min-w-0">
                <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 class="text-sm sm:text-base font-bold truncate">{{ previewingDoc()?.label }}</h4>
              </div>
              <button type="button" (click)="previewingDoc.set(null)" class="text-slate-300 hover:text-white text-2xl font-bold cursor-pointer leading-none">&times;</button>
            </div>

            <!-- Modal Content -->
            <div class="p-4 sm:p-6 space-y-4">
              <!-- Meta Card -->
              <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div><span class="text-slate-500">Document Type:</span> <b class="text-slate-800 block truncate">{{ previewingDoc()?.docType }}</b></div>
                <div><span class="text-slate-500">Requirement:</span> <b [class.text-rose-600]="previewingDoc()?.required" class="block">{{ previewingDoc()?.required ? 'Mandatory *' : 'Optional' }}</b></div>
                <div><span class="text-slate-500">File Name:</span> <b class="font-mono text-slate-800 truncate block">{{ previewingDoc()?.fileName || 'specimen_template.pdf' }}</b></div>
                <div><span class="text-slate-500">Status:</span> <b class="text-emerald-700 font-semibold block">{{ previewingDoc()?.status === 'uploaded' ? 'Uploaded & Verified' : 'Sample Specification' }}</b></div>
              </div>

              <!-- Document Visual Preview Frame -->
              <div class="border-2 border-slate-200 rounded-xl bg-slate-100/80 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-48">
                <div class="absolute inset-0 opacity-5 flex items-center justify-center select-none pointer-events-none text-3xl font-black uppercase tracking-widest text-slate-900">
                  ISMS 2.0 RAJASTHAN
                </div>
                <div class="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-rose-600 mb-3 border border-slate-200">
                  <svg class="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                  </svg>
                </div>
                <h5 class="text-sm font-bold text-slate-800 truncate max-w-sm">{{ previewingDoc()?.fileName || previewingDoc()?.label + '.pdf' }}</h5>
                <p class="text-xs text-slate-500 mt-1">Official Statutory Document • Department of Skills & Livelihoods</p>
                <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Format Verified (PDF / PNG / JPG)</span>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button 
                type="button" 
                (click)="previewingDoc.set(null)" 
                class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition cursor-pointer text-xs sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TabDocumentsComponent {
  private service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);

  readonly errorMessage = signal<string>('');
  readonly previewingDoc = signal<UploadedDocument | null>(null);

  get documents(): UploadedDocument[] {
    return this.service.formData().documents;
  }

  get totalRequiredCount(): number {
    return this.documents.filter(d => d.required).length;
  }

  get uploadedRequiredCount(): number {
    return this.documents.filter(d => d.required && d.status === 'uploaded').length;
  }

  get isTab4Submitted(): boolean {
    return this.valService.isTabSubmitted(4);
  }

  get isTab4Invalid(): boolean {
    return this.isTab4Submitted && (this.uploadedRequiredCount < this.totalRequiredCount);
  }

  onFileSelected(event: Event, docId: string) {
    this.errorMessage.set('');
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxBytes = 5 * 1024 * 1024; // 5 MB

    if (file.size > maxBytes) {
      this.errorMessage.set(`"${file.name}" exceeds the 5 MB maximum limit.`);
      input.value = '';
      return;
    }

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      this.errorMessage.set(`Invalid file format for "${file.name}". Please upload PDF, JPG, or PNG.`);
      input.value = '';
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const dateFormatted = new Date().toLocaleDateString('en-GB');

    this.service.updateFormData(curr => ({
      ...curr,
      documents: curr.documents.map(d => d.id === docId ? {
        ...d,
        fileName: file.name,
        fileSize: sizeFormatted,
        uploadDate: dateFormatted,
        status: 'uploaded'
      } : d)
    }));

    input.value = '';
  }

  removeDocument(docId: string) {
    this.service.updateFormData(curr => ({
      ...curr,
      documents: curr.documents.map(d => d.id === docId ? {
        ...d,
        fileName: undefined,
        fileSize: undefined,
        uploadDate: undefined,
        status: 'pending'
      } : d)
    }));
  }
}
