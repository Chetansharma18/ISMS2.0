import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AspirantDocumentItem } from '../../config/aspirant-form.config';
import { ButtonComponent, IconComponent } from '../../../../shared';

/**
 * One attachment card in the Step 4 documents list, matching the exact ISMS 2.0 / OTR PDF upload pattern:
 * - Empty state: [⭡ Upload Document] (PDF, JPG, PNG • Max 5MB)
 * - Uploaded state: Adobe PDF icon + File name + Size badge + [View] [Change] [Remove] toolbar.
 */
@Component({
  selector: 'app-aspirant-document-upload-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent, IconComponent],
  template: `
    <div class="border border-slate-200 rounded-xl bg-white p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans">
      
      <!-- Left: Circle Number + Title, Badges & Subtitle -->
      <div class="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <!-- Circle Number Badge (Red / Rose outlined circle) -->
        <div class="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold flex items-center justify-center shrink-0 text-xs sm:text-sm shadow-2xs">
          {{ doc().itemNumber || (index() + 1) }}
        </div>

        <!-- Document Information -->
        <div class="min-w-0 flex-1 space-y-0.5">
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

          <p class="text-[11.5px] text-slate-500 m-0 leading-normal">
            {{ doc().description || 'Statutory proof document for applicant eligibility verification' }}
          </p>
        </div>
      </div>

      <!-- Right: Exact Uploaded Card or Empty State matching ISMS 2.0 / OTR pattern -->
      <div class="shrink-0 self-start md:self-center">
        <!-- 1. EMPTY STATE: [⭡ Upload Document] (PDF, JPG, PNG • Max 5MB) -->
        @if (doc().status !== 'UPLOADED') {
          <div class="flex items-center gap-2.5 flex-wrap">
            <label
              class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              <app-icon name="upload" size="sm" [stroke]="2" class="text-slate-600" />
              <span>Upload Document</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="fileSelected.emit($event)" class="hidden" />
            </label>
            <span class="text-[11px] text-slate-500 truncate">
              (PDF, JPG, PNG &bull; Max 5MB)
            </span>
          </div>
        }

        <!-- 2. UPLOADED STATE: Adobe PDF Icon, Name, Size Badge, View, Change, Remove -->
        @if (doc().status === 'UPLOADED') {
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs shadow-2xs min-w-[280px]">
            <!-- File info: Adobe Icon, Name and Size Badge -->
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <!-- Authentic Adobe PDF Icon -->
              <app-icon name="pdf-badge" size="auto" solid class="w-4.5 h-4.5 text-[#E5252A] select-none shadow-xs" />

              <div class="flex flex-col min-w-0">
                <span class="font-medium text-slate-800 truncate max-w-[160px] sm:max-w-xs text-xs" [title]="doc().fileName || ''">
                  {{ doc().fileName }}
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs shrink-0 w-fit mt-0.5">
                  {{ doc().fileSize || '0.04 MB' }}
                </span>
              </div>
            </div>

            <!-- Actions Toolbar: View, Change, Remove -->
            <div class="flex items-center gap-1.5 shrink-0 sm:ml-auto">
              <!-- View Option -->
              <button
                appButton
                variant="secondary"
                size="sm"
                type="button"
                (click)="viewDocument.emit()"
                title="Preview document"
              >
                <app-icon name="eye" size="sm" />
                <span>View</span>
              </button>

              <!-- Change Option -->
              <label
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer shadow-2xs"
                title="Change Document"
              >
                <app-icon name="refresh" size="sm" [stroke]="2" />
                <span>Change</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="fileSelected.emit($event)" class="hidden" />
              </label>

              <!-- Remove Option -->
              <button
                appButton
                variant="ghost"
                size="sm"
                type="button"
                (click)="removeDocument.emit()"
                title="Remove Document"
              >
                <app-icon name="trash" size="sm" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class AspirantDocumentUploadRowComponent {
  readonly doc = input.required<AspirantDocumentItem>();
  readonly index = input.required<number>();

  readonly viewDocument = output<void>();
  readonly fileSelected = output<Event>();
  readonly removeDocument = output<void>();
}
