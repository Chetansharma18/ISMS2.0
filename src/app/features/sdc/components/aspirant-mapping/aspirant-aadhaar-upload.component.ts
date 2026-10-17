import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../../shared';

/**
 * Aadhaar proof upload control rendered inside Step 1 identity form,
 * matching the exact ISMS 2.0 / OTR document upload pattern:
 * - Empty state: [⭡ Upload Document] (PDF, JPG, PNG • Max 5MB)
 * - Uploaded state: Adobe PDF icon + File name + Size badge + [View] [Change] [Remove] toolbar.
 */
@Component({
  selector: 'app-aspirant-aadhaar-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent, IconComponent],
  template: `
    <div class="space-y-1.5 font-sans">
      <!-- Label -->
      <div class="flex items-center justify-between">
        <label class="block text-xs font-medium text-slate-700 leading-tight select-none truncate">
          Aadhaar Card Document Proof <span class="text-rose-500 font-bold ml-0.5">*</span>
        </label>
      </div>

      <!-- 1. EMPTY STATE: Compact & Professional Upload Button -->
      @if (!fileName()) {
        <div class="flex items-center gap-2.5 flex-wrap">
          <label
            class="px-3 py-1.5 rounded border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5 active:scale-95"
            [class.border-red-500]="!!errorMessage()"
            [class.bg-red-50/20]="!!errorMessage()"
            [class.border-slate-300]="!errorMessage()"
          >
            <app-icon name="upload" size="sm" [stroke]="2" class="text-slate-600" />
            <span>Upload Document</span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="fileSelected.emit($event)" class="hidden" />
          </label>
          <span class="text-[11px] text-slate-500 truncate">
            (PDF, JPG, PNG &bull; Max 5MB)
          </span>
        </div>

        <!-- Error message below the input box -->
        @if (errorMessage()) {
          <div class="form-error-text text-rose-600 font-medium flex items-center gap-1 mt-0.5 m-0 leading-tight" style="font-size: 11px !important; line-height: 14px !important;">
            <app-icon name="error-circle" size="xs" solid class="text-rose-600" />
            <span style="font-size: 11px !important; line-height: 14px !important;">{{ errorMessage() }}</span>
          </div>
        }
      }

      <!-- 2. UPLOADED STATE: Adobe PDF Icon, Name, Size Badge, View, Change, Remove -->
      @if (fileName()) {
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs shadow-2xs">
          <!-- File info: Adobe Icon, Name, and Size Badge -->
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <!-- Authentic Adobe PDF Icon -->
            <app-icon name="pdf-badge" size="auto" solid class="w-4.5 h-4.5 text-[#E5252A] select-none shadow-xs" />

            <div class="flex flex-col min-w-0">
              <span class="font-medium text-slate-800 truncate max-w-[180px] sm:max-w-xs text-xs" [title]="fileName()">
                {{ fileName() }}
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs shrink-0 w-fit mt-0.5">
                {{ fileSize() || '0.04 MB' }}
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
              title="Preview Aadhaar Card"
            >
              <app-icon name="eye" size="sm" />
              <span>View</span>
            </button>

            <!-- Change Option -->
            <label
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer shadow-2xs"
              title="Change/Replace Document"
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
  `
})
export class AspirantAadhaarUploadComponent {
  /** Name of the uploaded file; empty when nothing has been uploaded. */
  readonly fileName = input<string>('');
  readonly fileSize = input<string>('');
  readonly errorMessage = input<string>('');

  readonly viewDocument = output<void>();
  readonly fileSelected = output<Event>();
  readonly removeDocument = output<void>();
}
