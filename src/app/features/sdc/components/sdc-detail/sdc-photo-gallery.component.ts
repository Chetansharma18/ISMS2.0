import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CenterPhotoItem } from '../../models/sdc.model';

/** Read-only grid of centre photos; clicking a photo asks the parent to open the preview. */
@Component({
  selector: 'app-sdc-photo-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">Center Photos (JPG)</span>
    @if (photos().length > 0) {
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        @for (photo of photos(); track photo.name || photo.id; let idx = $index) {
          <div
            (click)="photoOpen.emit(photo)"
            class="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-md transition-all cursor-pointer flex flex-col"
          >
            <div class="w-full h-36 bg-slate-100 overflow-hidden flex items-center justify-center relative">
              <img
                [src]="photo.url"
                [alt]="photo.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span class="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded bg-white/90 text-slate-800 text-[11px] font-semibold shadow-xs">
                  View
                </span>
              </div>
            </div>
            <div class="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-800 text-[11.5px] truncate">{{ photo.tag || ('Photo ' + (idx + 1)) }}</span>
              <span class="text-[10px] text-slate-400 tabular-nums">{{ photo.size || '' }}</span>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="p-4 text-center text-slate-400 text-xs rounded-lg border border-dashed border-slate-200">
        No center photographs uploaded.
      </div>
    }
  `
})
export class SdcPhotoGalleryComponent {
  readonly photos = input.required<CenterPhotoItem[]>();
  readonly photoOpen = output<CenterPhotoItem>();
}