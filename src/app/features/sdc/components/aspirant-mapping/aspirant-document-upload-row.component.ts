import { Component, input, output } from '@angular/core';
import { AspirantDocumentItem } from '../../config/aspirant-form.config';

/**
 * One attachment card in the Step 4 documents list: item number, title / badges,
 * upload status and the View / Change / Upload PDF actions.
 * The `doc` object is mutated in place by the parent, so this stays on default change detection.
 */
@Component({
  selector: 'app-aspirant-document-upload-row',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div class="border border-slate-200 rounded-xl bg-white p-3 sm:p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      
      <!-- Left: Circle Number + Title, Badges, Subtitle & Status -->
      <div class="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <!-- Circle Number Badge (Red / Rose outlined circle) -->
        <div class="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold flex items-center justify-center shrink-0 text-xs sm:text-sm shadow-2xs">
          {{ doc().itemNumber || (index() + 1) }}
        </div>

        <!-- Document Information -->
        <div class="min-w-0 flex-1 space-y-0.5">
          <!-- Line 1: Title & Mandatory Asterisk / Condition Note -->
          <div class="flex flex-wrap items-center gap-1.5">
            <h4 class="font-bold text-xs sm:text-sm text-slate-900 tracking-tight leading-snug m-0">
              {{ doc().docName }}
            </h4>
            @if (doc().badgeType === 'mandatory') {
              <span class="text-rose-500 font-bold text-base leading-none" title="Mandatory">*</span>
            } @else if (doc().conditionNote) {
              <span class="text-xs text-slate-500 font-normal">
                ({{ doc().conditionNote }})
              </span>
            }
          </div>

          <!-- Line 2: Subtitle Description -->
          <p class="text-[11.5px] text-slate-500 m-0 leading-normal">
            {{ doc().description || 'Statutory proof document for applicant eligibility verification' }}
          </p>

          @if (doc().status === 'UPLOADED') {
            <div class="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Uploaded • {{ doc().fileName }} ({{ doc().fileSize }})</span>
            </div>
          }
        </div>
      </div>

      <!-- Right: Action Button(s) -->
      <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
        @if (doc().status === 'UPLOADED') {
          <!-- View Option -->
          <button
            type="button"
            (click)="viewDocument.emit()"
            class="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-brand border border-slate-300 rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
            title="View uploaded document"
          >
            <svg class="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </button>

          <!-- Change Option -->
          <label class="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95">
            <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Change</span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="fileSelected.emit($event)" class="hidden" />
          </label>
        } @else {
          <!-- Upload PDF Button (Matching Screenshot) -->
          <label class="px-4 py-2 bg-primary hover:bg-primary-dark active:scale-95 text-white rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-2">
            <span class="w-4 h-4 rounded bg-rose-500 text-white text-[8px] font-extrabold flex items-center justify-center tracking-tighter">PDF</span>
            <span>Upload PDF</span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="fileSelected.emit($event)" class="hidden" />
          </label>
        }
      </div>

    </div>

  `
})
export class AspirantDocumentUploadRowComponent {
  readonly doc = input.required<AspirantDocumentItem>();
  /** Zero-based position in the list; used as the fallback item number. */
  readonly index = input.required<number>();

  readonly viewDocument = output<void>();
  readonly fileSelected = output<Event>();
}
