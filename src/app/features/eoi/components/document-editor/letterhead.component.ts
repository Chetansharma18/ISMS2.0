import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../shared';
import { EditableLogoComponent } from './editable-logo.component';

/**
 * Official letterhead: left emblem, editable title / subtitle / address and right logo.
 * Title, subtitle and address are two-way bound; logos are owned by the parent.
 *
 * With `official` the letterhead looks like the printed RSLDC letters: serif title in normal case, the address under the
 * logos and a heavy rule below. The IPA letter keeps the default look.
 */
@Component({
  selector: 'app-letterhead',
  standalone: true,
  imports: [FormsModule, EditableLogoComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (official()) {
      <div class="mb-4 text-center font-serif">
        <div class="flex items-center justify-between gap-4">
          <app-editable-logo
            [src]="leftLogoUrl()"
            alt="RSLDC Logo"
            (logoUpload)="leftLogoUpload.emit($event)"
            (logoError)="leftLogoError.emit()"
          />

          <div class="flex-1 min-w-0 space-y-0.5">
            <input
              appInput
              variant="plain"
              type="text"
              aria-label="Organisation name"
              [ngModel]="headerTitle()"
              (ngModelChange)="headerTitle.set($event)"
              class="w-full text-center font-bold text-base sm:text-xl lg:text-2xl leading-tight"
            />
            <input
              appInput
              variant="plain"
              type="text"
              aria-label="Organisation type"
              [ngModel]="headerSubtitle()"
              (ngModelChange)="headerSubtitle.set($event)"
              class="w-full text-center font-bold text-xs sm:text-sm lg:text-base"
            />
          </div>

          <app-editable-logo
            [src]="rightLogoUrl()"
            alt="Rajasthan Sarkar"
            [showFallbackText]="false"
            (logoUpload)="rightLogoUpload.emit($event)"
          />
        </div>

        <input
          appInput
          variant="plain"
          type="text"
          aria-label="Address"
          [ngModel]="headerAddress()"
          (ngModelChange)="headerAddress.set($event)"
          class="w-full text-center mt-3 text-xs sm:text-sm lg:text-base"
        />
        <div class="mt-2 border-b-[3px] border-slate-900"></div>
      </div>
    } @else {
      <div class="border-b-2 border-slate-800 pb-3 mb-4 text-center font-sans">
        <div class="flex items-center justify-between gap-4 mb-2">
          <!-- Left Emblem Logo (RSLDC) -->
          <app-editable-logo
            [src]="leftLogoUrl()"
            alt="RSLDC Logo"
            (logoUpload)="leftLogoUpload.emit($event)"
            (logoError)="leftLogoError.emit()"
          />

          <!-- Header Titles (Editable) -->
          <div class="flex-1 space-y-1">
            <input
              appInput
              variant="plain"
              type="text"
              [ngModel]="headerTitle()"
              (ngModelChange)="headerTitle.set($event)"
              class="w-full text-center font-bold uppercase"
            />
            <input
              appInput
              variant="plain"
              type="text"
              [ngModel]="headerSubtitle()"
              (ngModelChange)="headerSubtitle.set($event)"
              class="w-full text-center font-medium"
            />
            <input
              appInput
              variant="plain"
              type="text"
              [ngModel]="headerAddress()"
              (ngModelChange)="headerAddress.set($event)"
              class="w-full text-center"
            />
          </div>

          <!-- Right Organization Logo (Rajasthan Sarkar) -->
          <app-editable-logo
            [src]="rightLogoUrl()"
            alt="Rajasthan Sarkar"
            [showFallbackText]="false"
            (logoUpload)="rightLogoUpload.emit($event)"
          />
        </div>
      </div>
    }
  `
})
export class LetterheadComponent {
  readonly headerTitle = model<string>('');
  readonly headerSubtitle = model<string>('');
  readonly headerAddress = model<string>('');

  readonly leftLogoUrl = input<string>('');
  readonly rightLogoUrl = input<string>('');
  /** The look of the printed RSLDC letters (used by the sanction order). */
  readonly official = input<boolean>(false);

  readonly leftLogoUpload = output<string>();
  readonly rightLogoUpload = output<string>();
  readonly leftLogoError = output<void>();
}
