import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../button/button.component';
import { IconComponent } from '../../icon/icon.component';
import { appendPhotos } from '../../form-sdc/form-sdc.util';

/** One uploaded photo (same shape as the SDC centre photos). */
export interface FormPhotoItem {
  id?: string;
  name: string;
  url: string;
  size?: string;
  tag?: string;
}

/**
 * A labelled multi-photo upload for the form pages (same look as app-form-input / app-form-select):
 * thumbnails with a remove button, an "Add photo" tile and a counter for the minimum and maximum number of photos.
 * Only JPG / JPEG files up to `maxSizeMb` (5 MB) are added, up to `maxPhotos` (10); the rules are written under the box
 * and any file turned down is named with the reason.
 *
 *   <app-form-photos label="Upload Center Photos" [photos]="photos" (photosChange)="photos = $event"
 *                    [required]="true" [minPhotos]="3" [error]="photoError" />
 *
 * The list is never changed in place: every add or remove emits a new array through `photosChange`.
 */
@Component({
  selector: 'app-form-photos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonComponent, IconComponent],
  template: `
    <div class="w-full flex flex-col font-sans">
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <label class="text-xs sm:text-[12.5px] font-medium leading-[18px] text-[#1F2933] select-none">
          {{ label }}
          @if (required) {
            <span class="text-rose-500 font-bold ml-0.5">*</span>
          }
        </label>
        @if (!disabled) {
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border select-none"
            [ngClass]="photos.length >= minPhotos ? 'bg-slate-50 text-navy border-slate-300' : 'bg-amber-50 text-amber-700 border-amber-200'"
          >
            {{ photos.length }} added · min {{ minPhotos }}, max {{ maxPhotos }}
          </span>
        }
      </div>

      <div
        class="p-3 bg-white border rounded-[4px] transition-colors"
        [class.border-theme]="!error"
        [class.border-rose-600]="!!error"
      >
        <div class="flex items-center gap-3 flex-wrap">
          @for (photo of photos; track photo.id || photo.name; let i = $index) {
            <div
              class="relative group w-24 h-24 rounded-[4px] border border-theme bg-white overflow-hidden shrink-0 cursor-pointer"
              (click)="preview(photo)"
              [title]="(photo.tag ? photo.tag + ' - ' : '') + photo.name + ' - click to view'"
            >
              <img [src]="photo.url" [alt]="photo.name" class="w-full h-full object-cover" />
              @if (!disabled) {
                <button
                  appButton
                  variant="danger"
                  size="xs"
                  iconOnly
                  type="button"
                  (click)="remove(i); $event.stopPropagation()"
                  class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Remove photo"
                  aria-label="Remove photo"
                >
                  <app-icon name="close" size="xs" />
                </button>
              }
              <span class="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[10px] font-medium text-center truncate px-1 py-0.5 select-none pointer-events-none">
                {{ photo.tag || ('Photo ' + (i + 1)) }}
              </span>
            </div>
          }

          @if (!disabled && photos.length < maxPhotos) {
            <label
              class="w-24 h-24 rounded-[4px] border-2 border-dashed border-slate-300 hover:border-navy bg-slate-50/60 hover:bg-slate-50 text-navy flex flex-col items-center justify-center p-2 cursor-pointer transition-colors shrink-0 select-none"
              title="Add photo"
            >
              <app-icon name="plus" size="lg" [stroke]="2" />
              <span class="text-[11px] font-semibold text-center leading-tight mt-1">Add Photo</span>
              <input type="file" [accept]="accept" multiple class="hidden" (change)="onFiles($event)" />
            </label>
          }
        </div>
      </div>

      @if (error) {
        <div class="text-rose-600 font-medium mt-0.5 flex items-center gap-1 text-[11px] leading-[14px]">
          <app-icon name="error" size="xs" [stroke]="2.5" />
          <span>{{ error }}</span>
        </div>
      }
      @if (uploadMessage()) {
        <div class="text-rose-600 font-medium mt-0.5 flex items-center gap-1 text-[11px] leading-[14px]" role="alert">
          <app-icon name="error" size="xs" [stroke]="2.5" />
          <span>{{ uploadMessage() }}</span>
        </div>
      }
      @if (!disabled) {
        <div class="text-[#7A8792] mt-1 text-[11px] leading-[14px]">{{ hintText }}</div>
      }
    </div>
  `
})
export class FormPhotosComponent {
  @Input() label = '';
  @Input() photos: readonly FormPhotoItem[] = [];
  @Input() required = false;
  @Input() disabled = false;
  @Input() minPhotos = 3;
  @Input() accept = '.jpg,.jpeg,image/jpeg';
  /** Largest size of one photo, in MB. */
  @Input() maxSizeMb = 5;
  /** Most photos that can be added. */
  @Input() maxPhotos = 10;
  /** Replaces the default line that lists the format, size and number of photos. */
  @Input() hint?: string;
  @Input() error?: string;

  @Output() photosChange = new EventEmitter<FormPhotoItem[]>();

  /** Why files were turned down on the last upload (empty when all were added). */
  readonly uploadMessage = signal('');

  /** The rules, written out under the upload box. */
  get hintText(): string {
    return (
      this.hint ??
      `Supported format: JPG / JPEG only. Maximum size: ${this.maxSizeMb} MB per photo. Minimum ${this.minPhotos} and maximum ${this.maxPhotos} photos.`
    );
  }

  /** Adds the photos that follow the rules and tells the user why the others were turned down. */
  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const accepted: File[] = [];
    const problems: string[] = [];
    let room = this.maxPhotos - this.photos.length;

    for (const file of files) {
      const isJpg = /\.jpe?g$/i.test(file.name) && (!file.type || file.type === 'image/jpeg');
      if (!isJpg) {
        problems.push(`"${file.name}" is not a JPG photo.`);
      } else if (file.size > this.maxSizeMb * 1024 * 1024) {
        problems.push(`"${file.name}" is larger than ${this.maxSizeMb} MB.`);
      } else if (room <= 0) {
        problems.push(`"${file.name}" was not added: only ${this.maxPhotos} photos are allowed.`);
      } else {
        accepted.push(file);
        room--;
      }
    }

    this.uploadMessage.set(problems.join(' '));
    if (accepted.length > 0) {
      this.photosChange.emit(appendPhotos([...this.photos], accepted) as FormPhotoItem[]);
    }
    input.value = '';
  }

  remove(index: number): void {
    this.photosChange.emit(this.photos.filter((_, i) => i !== index));
  }

  /** Opens the full image in a new tab. */
  preview(photo: FormPhotoItem): void {
    if (photo.url) {
      window.open(photo.url, '_blank', 'noopener');
    }
  }
}
