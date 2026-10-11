import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CenterPhotoItem } from '../../models/sdc.model';

/** Full-screen preview of a single centre photo. */
@Component({
  selector: 'app-sdc-photo-preview-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = photo();
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sdc-photo-preview-title"
      (click)="closed.emit()"
    >
      <div
        class="bg-white rounded-xl border border-slate-300 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="px-5 py-3 border-b border-slate-200 bg-primary text-white flex items-center justify-between gap-3 shrink-0">
          <div class="truncate">
            <h3 id="sdc-photo-preview-title" class="text-sm font-semibold text-white tracking-tight m-0 truncate" style="color: #ffffff !important;">
              {{ p.tag || p.name }}
            </h3>
            <span class="text-[11px] text-white/80 font-normal" style="color: rgba(255,255,255,0.85) !important;">
              {{ p.name }} {{ p.size ? '• ' + p.size : '' }}
            </span>
          </div>
          <button
            type="button"
            (click)="closed.emit()"
            class="w-7 h-7 rounded-full text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        <!-- Image View -->
        <div class="p-4 bg-slate-100 flex items-center justify-center overflow-auto max-h-[72vh]">
          <img
            [src]="p.url"
            [alt]="p.name"
            class="max-w-full max-h-[68vh] object-contain rounded-lg shadow-sm"
          />
        </div>
      </div>
    </div>
  `
})
export class SdcPhotoPreviewModalComponent {
  readonly photo = input.required<CenterPhotoItem>();
  readonly closed = output<void>();
}