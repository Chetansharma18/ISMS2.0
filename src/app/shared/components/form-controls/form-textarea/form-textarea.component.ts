import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full flex flex-col">
      <!-- Label Row with Count -->
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <label [for]="id" class="text-xs sm:text-[13px] font-semibold text-slate-700 select-none">
          {{ label }}
          @if (required) {
            <span class="text-rose-500 font-bold ml-0.5">*</span>
          }
        </label>

        @if (showCharCount && maxLength) {
          <span class="text-[11px] font-mono text-slate-400">
            {{ (value || '').length }}/{{ maxLength }}
          </span>
        }
      </div>

      <!-- Textarea Box -->
      <textarea
        [id]="id"
        [rows]="rows"
        [value]="value || ''"
        (input)="onInput($event)"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [attr.maxlength]="maxLength || null"
        class="w-full px-3 py-2 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 rounded-md border transition-all duration-150 focus:outline-none bg-white shadow-2xs resize-y"
        [class.border-slate-300]="!error && !disabled"
        [class.border-rose-500]="!!error"
        [class.ring-1]="!!error"
        [class.ring-rose-500]="!!error"
        [class.bg-slate-50]="disabled"
        [class.cursor-not-allowed]="disabled"
        [class.text-slate-500]="disabled"
        [class.focus:border-[#0B3558]]="!error && !disabled"
        [class.focus:ring-1]="!error && !disabled"
        [class.focus:ring-[#0B3558]]="!error && !disabled"
      ></textarea>

      <!-- Error Message -->
      @if (error) {
        <p class="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1 animate-fade-in">
          <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ error }}</span>
        </p>
      }

      <!-- Helper Hint -->
      @if (!error && hint) {
        <p class="text-[11px] text-slate-400 mt-1 leading-tight">
          {{ hint }}
        </p>
      }
    </div>
  `
})
export class FormTextareaComponent {
  private static nextId = 0;
  readonly id = `form-textarea-${++FormTextareaComponent.nextId}`;

  @Input() label: string = '';
  @Input() value: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 3;
  @Input() maxLength?: number = 500;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() showCharCount: boolean = true;

  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.valueChange.emit(textarea.value);
  }
}
