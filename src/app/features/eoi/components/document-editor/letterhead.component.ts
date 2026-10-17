import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../shared';
import { EditableLogoComponent } from './editable-logo.component';

/**
 * Official letterhead: left emblem, editable title / subtitle / address and right logo.
 * Title, subtitle and address are two-way bound; logos are owned by the parent.
 */
@Component({
  selector: 'app-letterhead',
  standalone: true,
  imports: [FormsModule, EditableLogoComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
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
  `
})
export class LetterheadComponent {
  readonly headerTitle = model<string>('');
  readonly headerSubtitle = model<string>('');
  readonly headerAddress = model<string>('');

  readonly leftLogoUrl = input<string>('');
  readonly rightLogoUrl = input<string>('');

  readonly leftLogoUpload = output<string>();
  readonly rightLogoUpload = output<string>();
  readonly leftLogoError = output<void>();
}
