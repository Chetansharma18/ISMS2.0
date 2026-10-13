import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

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
            <svg class="w-3.5 h-3.5 text-slate-600 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
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
            <svg class="shrink-0 text-rose-600" style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
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
            <svg class="w-4.5 h-4.5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
              <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
              <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
            </svg>

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
              type="button"
              (click)="viewDocument.emit()"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean hover:text-ocean-dark bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer shadow-2xs"
              title="Preview Aadhaar Card"
            >
              <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View</span>
            </button>

            <!-- Change Option -->
            <label
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer shadow-2xs"
              title="Change/Replace Document"
            >
              <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Change</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="fileSelected.emit($event)" class="hidden" />
            </label>

            <!-- Remove Option -->
            <button
              type="button"
              (click)="removeDocument.emit()"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
              title="Remove Document"
            >
              <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
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
