import { Component, input, output } from '@angular/core';
import { AspirantFormData, AspirantDocumentItem } from '../../config/aspirant-form.config';
import { AspirantDocumentUploadRowComponent } from './aspirant-document-upload-row.component';

/** Event payload emitted when a file is chosen for one of the listed documents. */
export interface AspirantDocumentSelection {
  doc: AspirantDocumentItem;
  event: Event;
}

/**
 * Step 4 of the aspirant wizard: candidate photograph + attachment list.
 * Content passed in the element body (the batch confirmation bar) is rendered below the cards.
 * `formData` is mutated in place by the parent, so this stays on default change detection.
 */
@Component({
  selector: 'app-aspirant-photo-documents-step',
  standalone: true,
  host: { class: 'block' },
  imports: [AspirantDocumentUploadRowComponent],
  template: `
    <div class="space-y-5 animate-in fade-in duration-150">

      <!-- Candidate Photograph Upload (Double-Click Component) -->
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-4 bg-primary rounded-full"></span>
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-1.5">
              <span>Candidate Photograph</span>
              <span class="text-rose-500">*</span>
            </h3>
          </div>
          <span class="text-[10px] text-slate-500">JPG/PNG • Max 2 MB • Passport Format</span>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl">
          <!-- Avatar Preview with Double Click Trigger -->
          <div
            (dblclick)="photoInput.click()"
            class="w-24 h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0 group relative shadow-2xs"
            [class.border-red-500]="!!photoError() && !formData().candidatePhotoUrl"
            [class.bg-red-50/20]="!!photoError() && !formData().candidatePhotoUrl"
            [class.border-slate-300]="!photoError() || !!formData().candidatePhotoUrl"
            [class.bg-slate-50]="!photoError() || !!formData().candidatePhotoUrl"
            [class.hover:border-blue-500]="!photoError() || !!formData().candidatePhotoUrl"
            title="Double click to Upload Image"
          >
            @if (formData().candidatePhotoUrl) {
              <img [src]="formData().candidatePhotoUrl" alt="Candidate Photo" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                Double Click
              </div>
            } @else {
              <svg class="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-[9px] text-slate-400 text-center font-semibold mt-1 px-1">
                Double click to upload
              </span>
            }
          </div>

          <div class="flex-1 space-y-2 text-center sm:text-left">
            <div class="space-y-0.5">
              <span class="text-xs font-bold text-slate-800 block">
                {{ formData().candidatePhotoName || 'Upload Candidate Photograph' }}
              </span>
              <p class="text-[11px] text-slate-500 m-0">
                Standard passport size photograph with plain background. Double-click the photo frame or click the button below.
              </p>
              @if (formData().candidatePhotoUrl) {
                <div class="text-[11px] font-semibold text-emerald-700 pt-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
                  <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Uploaded • {{ formData().candidatePhotoName || 'Candidate_Photo.jpg' }}</span>
                </div>
              } @else if (photoError()) {
                <div class="form-error-text text-rose-600 font-medium flex items-center gap-1 pt-1 justify-center sm:justify-start leading-tight" style="font-size: 11px !important;">
                  <svg class="shrink-0 text-rose-600" style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ photoError() }}</span>
                </div>
              }
            </div>

            <div class="flex items-center gap-2 justify-center sm:justify-start">
              @if (formData().candidatePhotoUrl) {
                <!-- View Option (only when photo is uploaded) -->
                <button
                  type="button"
                  (click)="viewPhoto.emit()"
                  class="px-3.5 py-2 bg-white hover:bg-slate-50 text-brand border border-slate-300 rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                  title="View candidate photograph"
                >
                  <svg class="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View</span>
                </button>
              }

              <button
                type="button"
                (click)="photoInput.click()"
                class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-800 rounded-lg font-semibold text-xs transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{{ formData().candidatePhotoUrl ? 'Change Image' : 'Choose Image' }}</span>
              </button>
              <input
                #photoInput
                type="file"
                accept="image/jpeg,image/png"
                (change)="photoSelected.emit($event)"
                class="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Section 10: Attachment / Documents (Matching screenshot card style) -->
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-4 bg-primary rounded-full"></span>
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
              Attachment / Documents
            </h3>
            <span class="text-[11px] text-slate-500 font-medium">({{ formData().documents.length }} Documents Configured)</span>
          </div>
        </div>

        <!-- Documents Card List (Items 3 through 15) -->
        <div class="space-y-2.5">
          @for (doc of formData().documents; track doc.id; let idx = $index) {
            <app-aspirant-document-upload-row
              [doc]="doc"
              [index]="idx"
              (viewDocument)="viewDocument.emit(doc)"
              (fileSelected)="documentSelected.emit({ doc, event: $event })"
              (removeDocument)="documentRemoved.emit(doc)"
            ></app-aspirant-document-upload-row>
          }
        </div>

      </div>

      <ng-content></ng-content>

    </div>
  `
})
export class AspirantPhotoDocumentsStepComponent {
  readonly formData = input.required<AspirantFormData>();
  readonly photoError = input<string>('');

  readonly viewPhoto = output<void>();
  readonly photoSelected = output<Event>();
  readonly viewDocument = output<AspirantDocumentItem>();
  readonly documentSelected = output<AspirantDocumentSelection>();
  readonly documentRemoved = output<AspirantDocumentItem>();
}
