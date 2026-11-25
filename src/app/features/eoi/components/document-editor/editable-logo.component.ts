import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../../../../shared';

/**
 * Letterhead logo with a hover "Change Logo" upload overlay.
 * Emits the chosen image as a data URL; the parent owns the logo state.
 */
@Component({
  selector: 'app-editable-logo',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block shrink-0' },
  template: `
    <div class="relative group w-20 h-20 shrink-0 flex items-center justify-center p-1 bg-transparent">
      @if (src() || !showFallbackText()) {
        <img [src]="src()" [alt]="alt()" class="max-w-full max-h-full object-contain" (error)="logoError.emit()" />
      } @else {
        <div class="text-center font-bold text-navy leading-tight text-[11px] font-sans px-1">
          RSLDC<br>JAIPUR
        </div>
      }
      <label class="absolute inset-0 bg-slate-900/75 text-white text-[10px] font-sans font-semibold flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded print:hidden">
        <app-icon name="camera" [stroke]="2" />
        <span>Change Logo</span>
        <input type="file" accept="image/*" class="hidden" (change)="onFileChange($event)" />
      </label>
    </div>
  `
})
export class EditableLogoComponent {
  /** Current logo image URL (remote URL or data URL). */
  readonly src = input<string>('');
  readonly alt = input<string>('Logo');
  /** When true and no image is set, the "RSLDC JAIPUR" text mark is shown instead. */
  readonly showFallbackText = input<boolean>(false);

  /** Emits the uploaded image as a data URL. */
  readonly logoUpload = output<string>();
  /** Emits when the image fails to load. */
  readonly logoError = output<void>();

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.logoUpload.emit(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
