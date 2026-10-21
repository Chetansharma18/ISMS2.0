import { Component, input } from '@angular/core';
import { CenterPhotoItem } from '../../models/sdc.model';
import { buildCenterPhotoItem } from './sdc-detail.util';
import { ButtonComponent, IconComponent } from '../../../../shared';

/** Photo manager for the edit form. Mutates the supplied array in place (it belongs to the parent edit model). */
// Default change detection: photos are pushed into the parent-owned array from a FileReader callback (no markForCheck/signal).
@Component({
  selector: 'app-sdc-photo-editor',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  host: { class: 'block' },
  template: `
    <div class="flex items-center justify-between mb-2">
      <label class="block font-semibold text-slate-700">
        Center Photos (JPG) <span class="text-rose-500">*</span>
      </label>
      <label class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-primary hover:bg-primary-dark text-white text-[11px] font-semibold cursor-pointer shadow-2xs">
        <span>+ Upload Photos</span>
        <input
          type="file"
          accept=".jpg,.jpeg,image/jpeg"
          multiple
          class="hidden"
          (change)="onAddPhotos($event)"
        />
      </label>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
      @for (photo of photos(); track photo.id || photo.name; let idx = $index) {
        <div class="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group flex flex-col">
          <div class="w-full h-32 bg-slate-100 overflow-hidden flex items-center justify-center">
            <img [src]="photo.url" [alt]="photo.name" class="w-full h-full object-cover" />
          </div>
          <div class="p-2 bg-white border-t border-slate-100 flex items-center justify-between">
            <span class="text-[11px] font-semibold text-slate-700 truncate">{{ photo.tag || ('Photo ' + (idx + 1)) }}</span>
            <button
              appButton
              variant="ghost"
              size="sm"
              iconOnly
              type="button"
              (click)="removePhoto(idx)"
              aria-label="Remove photo"
            ><app-icon name="close" size="xs" /></button>
          </div>
        </div>
      }
    </div>
  `
})
export class SdcPhotoEditorComponent {
  readonly photos = input.required<CenterPhotoItem[]>();

  onAddPhotos(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) return;

    Array.from(fileInput.files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const url = e.target?.result as string;
        const photos = this.photos();
        photos.push(buildCenterPhotoItem(file, url, photos.length, index));
      };
      reader.readAsDataURL(file);
    });

    fileInput.value = '';
  }

  removePhoto(index: number): void {
    this.photos().splice(index, 1);
  }
}