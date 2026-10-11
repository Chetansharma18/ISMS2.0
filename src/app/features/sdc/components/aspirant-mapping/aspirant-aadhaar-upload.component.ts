import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Compact Aadhaar proof upload control rendered inside the Step 1 identity form
 * (empty state with "Browse", uploaded state with View / Change).
 */
@Component({
  selector: 'app-aspirant-aadhaar-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-1">
      <div class="flex items-center justify-between gap-1">
        <label class="block text-xs font-medium text-slate-700 leading-tight select-none truncate">
          Aadhaar Card Document Proof <span class="text-rose-500 font-bold">*</span>
        </label>
        <span class="text-[10px] text-slate-400 font-mono shrink-0">PDF/JPG • Max 5MB</span>
      </div>

      @if (fileName()) {
        <div class="h-9.5 flex items-center justify-between px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs gap-2 shadow-2xs hover:border-slate-400 transition-colors">
          <div class="flex items-center gap-1.5 min-w-0 flex-1 truncate">
            <!-- PDF Badge or Image icon based on file type -->
            @if (fileName().toLowerCase().endsWith('.pdf')) {
              <span class="w-5 h-5 rounded bg-rose-600 text-white text-[7.5px] font-extrabold flex items-center justify-center tracking-tight shrink-0">PDF</span>
            } @else {
              <svg class="w-4 h-4 shrink-0 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            <span class="font-semibold text-slate-800 truncate text-xs" [title]="fileName()">
              {{ fileName() }}
            </span>
            <span class="text-[10px] text-slate-400 shrink-0">({{ fileSize() || '1.4 MB' }})</span>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <!-- View Option -->
            <button
              type="button"
              (click)="viewDocument.emit()"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand hover:text-navy bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
              title="View Aadhaar Card"
            >
              <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View</span>
            </button>

            <!-- Change Option -->
            <label class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer shadow-2xs">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Change</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="fileSelected.emit($event)" class="hidden" />
            </label>
          </div>
        </div>
      } @else {
        <label class="h-9.5 flex items-center justify-between px-3 border border-dashed border-slate-300 rounded-lg cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-100/70 hover:border-rose-400 shadow-2xs group">
          <div class="flex items-center gap-2 text-slate-600 truncate">
            <!-- Red PDF icon in empty state -->
            <span class="w-5 h-5 rounded bg-rose-600 text-white text-[7.5px] font-extrabold flex items-center justify-center tracking-tight shrink-0 group-hover:bg-rose-700 transition-colors">PDF</span>
            <span class="text-xs truncate text-slate-500">Upload Aadhaar Card (PDF / JPG)</span>
          </div>
          <span class="px-2.5 py-1 bg-white text-slate-700 text-[11px] font-semibold rounded border border-slate-200 shadow-2xs shrink-0">
            Browse
          </span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="fileSelected.emit($event)" class="hidden" />
        </label>
      }
    </div>

  `
})
export class AspirantAadhaarUploadComponent {
  /** Name of the uploaded file; empty when nothing has been uploaded. */
  readonly fileName = input<string>('');
  readonly fileSize = input<string>('');

  readonly viewDocument = output<void>();
  readonly fileSelected = output<Event>();
}
