import { Component, input, output } from '@angular/core';
import { AspirantFormData, AspirantDocumentItem } from '../../config/aspirant-form.config';
import { AspirantDocumentUploadRowComponent } from './aspirant-document-upload-row.component';
import { ButtonComponent, IconComponent } from '../../../../shared';

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
  imports: [AspirantDocumentUploadRowComponent, ButtonComponent, IconComponent],
  template: `
    <div class="space-y-5 animate-in fade-in duration-150">

      <!-- Candidate Photograph Upload (Double-Click Component) -->
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-3.5 bg-navy rounded-xs inline-block"></span>
            <h3 class="font-bold m-0 flex items-center gap-1.5" style="font-size: 13.5px !important; color: #0B3558 !important;">
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
              <app-icon name="user" size="2xl" [stroke]="1.5" class="text-slate-400 group-hover:text-blue-600 transition-colors" />
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
                  <app-icon name="check" size="sm" [stroke]="2.5" class="text-emerald-600 shrink-0" />
                  <span>Uploaded • {{ formData().candidatePhotoName || 'Candidate_Photo.jpg' }}</span>
                </div>
              } @else if (photoError()) {
                <div class="form-error-text text-rose-600 font-medium flex items-center gap-1 pt-1 justify-center sm:justify-start leading-tight" style="font-size: 11px !important;">
                  <app-icon name="error-circle" size="xs" solid class="text-rose-600" />
                  <span>{{ photoError() }}</span>
                </div>
              }
            </div>

            <div class="flex items-center gap-2 justify-center sm:justify-start">
              @if (formData().candidatePhotoUrl) {
                <!-- View Option (only when photo is uploaded) -->
                <button
                  appButton
                  variant="outline"
                  type="button"
                  (click)="viewPhoto.emit()"
                  title="View candidate photograph"
                >
                  <app-icon name="eye" size="sm" />
                  <span>View</span>
                </button>
              }

              <button
                appButton
                variant="outline"
                type="button"
                (click)="photoInput.click()"
              >
                <app-icon name="upload" size="sm" />
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
            <span class="w-1.5 h-3.5 bg-navy rounded-xs inline-block"></span>
            <h3 class="font-bold m-0" style="font-size: 13.5px !important; color: #0B3558 !important;">
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
