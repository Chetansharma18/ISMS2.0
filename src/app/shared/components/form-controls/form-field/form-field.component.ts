import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Standardized form-field shell for the ISMS 2.0 design system.
 * Wraps any form input control, single-select, multi-select or textarea with
 * a uniform 13px font-medium label, required indicator (*), optional info tooltip,
 * projected control slot, and 12px inline error message or helper text.
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="w-full flex flex-col font-sans mb-3 sm:mb-4">
      <!-- Label Row -->
      @if (label()) {
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <label
            [attr.for]="id() || null"
            class="text-[13px] font-medium leading-[18px] text-[#25212A] select-none inline-flex items-center gap-1"
          >
            <span>{{ label() }}</span>
            @if (required()) {
              <span class="text-rose-600 font-bold leading-none">*</span>
            }
            @if (infoTooltip()) {
              <span
                class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-slate-300 text-slate-500 text-[10px] font-bold cursor-help hover:text-slate-800 hover:border-slate-500 transition-colors ml-0.5"
                [title]="infoTooltip()"
              >
                i
              </span>
            }
          </label>
        </div>
      }

      <!-- Control Slot -->
      <div class="relative w-full">
        <ng-content />
      </div>

      <!-- Helper / Validation Messages -->
      @if (error()) {
        <p class="form-error-text text-rose-600 font-medium text-[12px] mt-1 flex items-center gap-1 leading-tight animate-in fade-in duration-100">
          <span>{{ error() }}</span>
        </p>
      } @else if (hint()) {
        <p class="text-slate-500 text-[12px] mt-1 leading-tight">
          {{ hint() }}
        </p>
      }
    </div>
  `
})
export class FormFieldComponent {
  readonly label = input('');
  readonly id = input('');
  readonly required = input(false);
  readonly hint = input('');
  readonly error = input('');
  readonly infoTooltip = input('');
}
