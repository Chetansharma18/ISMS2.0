import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CenterPhotoItem } from '../../models/sdc.model';
import { ModalComponent } from '../../../../shared';

/** Full-screen preview of a single centre photo. */
@Component({
  selector: 'app-sdc-photo-preview-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent],
  template: `
    @let p = photo();
    <app-modal
      [title]="p.tag || p.name"
      [subtitle]="p.name + ' ' + (p.size ? '• ' + p.size : '')"
      widthOverride="max-w-3xl"
      (close)="closed.emit()"
    >
      <!-- Image View -->
      <div class="p-4 bg-slate-100 flex items-center justify-center overflow-auto max-h-[72vh] rounded-lg">
        <img
          [src]="p.url"
          [alt]="p.name"
          class="max-w-full max-h-[68vh] object-contain rounded-lg shadow-sm"
        />
      </div>
    </app-modal>
  `
})
export class SdcPhotoPreviewModalComponent {
  readonly photo = input.required<CenterPhotoItem>();
  readonly closed = output<void>();
}