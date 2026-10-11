import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditableLogoComponent } from './editable-logo.component';

/**
 * Official letterhead: left emblem, editable title / subtitle / address and right logo.
 * Title, subtitle and address are two-way bound; logos are owned by the parent.
 */
@Component({
  selector: 'app-letterhead',
  standalone: true,
  imports: [FormsModule, EditableLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="border-b-2 border-slate-800 pb-3 mb-4 text-center font-sans">
      <div class="flex items-center justify-between gap-4 mb-2">
        <!-- Left Emblem Logo (Editable & Uploadable) -->
        <app-editable-logo
          [src]="leftLogoUrl()"
          alt="Emblem Logo"
          (logoUpload)="leftLogoUpload.emit($event)"
          (logoError)="leftLogoError.emit()"
        />

        <!-- Header Titles (Editable) -->
        <div class="flex-1 space-y-1">
          <input
            type="text"
            [ngModel]="headerTitle()"
            (ngModelChange)="headerTitle.set($event)"
            class="w-full text-center font-bold text-slate-900 text-base sm:text-lg uppercase bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none px-1"
          />
          <input
            type="text"
            [ngModel]="headerSubtitle()"
            (ngModelChange)="headerSubtitle.set($event)"
            class="w-full text-center font-medium text-slate-700 text-xs bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none px-1"
          />
          <input
            type="text"
            [ngModel]="headerAddress()"
            (ngModelChange)="headerAddress.set($event)"
            class="w-full text-center text-[11px] text-slate-600 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none px-1"
          />
        </div>

        <!-- Right Organization Logo (Editable & Uploadable) -->
        <app-editable-logo
          [src]="rightLogoUrl()"
          alt="Right Logo"
          [showFallbackText]="true"
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
