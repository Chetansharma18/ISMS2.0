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
      @if (label) {
        <div class="flex items-center justify-between gap-2 mb-1.5 font-sans">
          <label [for]="id" class="text-[13px] font-medium leading-[20px] text-[#1F2933] select-none">
            {{ label }}
            @if (required) {
              <span class="text-rose-600 font-bold ml-0.5">*</span>
            }
          </label>

          @if (showCharCount && maxLength) {
            <span class="text-[11px] font-mono text-[#7A8792]">
              {{ (value || '').length }}/{{ maxLength }}
            </span>
          }
        </div>
      }

      <!-- Textarea Box -->
      <textarea
        [id]="id"
        [rows]="rows"
        [value]="value || ''"
        (input)="onInput($event)"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [attr.maxlength]="maxLength || null"
        class="w-full px-3 py-2 text-[14px] leading-[22px] text-[#1F2933] placeholder:text-[#7A8792] rounded-[4px] border transition-all duration-150 focus:outline-none bg-white resize-y font-sans"
        [class.border-[#D9E1E7]]="!error && !disabled"
        [class.border-rose-600]="!!error"
        [class.ring-1]="!!error"
        [class.ring-rose-600]="!!error"
        [class.bg-[#F5F7F9]]="disabled"
        [class.cursor-not-allowed]="disabled"
        [class.text-[#7A8792]]="disabled"
        [class.focus:border-[#174A6E]]="!error && !disabled"
        [class.focus:ring-2]="!error && !disabled"
        [class.focus:ring-[#EAF2F6]]="!error && !disabled"
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
