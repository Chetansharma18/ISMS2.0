import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-1.5 font-sans">
      @if (label) {
        <label [for]="forId" class="block text-[13px] font-medium leading-5 text-text-primary">
          {{ label }}
          @if (required) {
            <span class="text-rose-600 font-bold ml-0.5">*</span>
          }
        </label>
      }

      <!-- Transcluded control slot -->
      <div class="relative">
        <ng-content></ng-content>
      </div>

      <!-- Error message -->
      @if (errorMessage) {
        <p class="text-[12px] text-rose-600 font-medium flex items-center gap-1 mt-1">
          <svg class="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </p>
      } @else if (hint) {
        <p class="text-[12px] text-text-muted mt-1">{{ hint }}</p>
      }
    </div>
  `
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() forId?: string;
  @Input() required: boolean = false;
  @Input() errorMessage?: string;
  @Input() hint?: string;
}
