import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full flex flex-col font-sans">
      <!-- Label Row with Required Star and Character Count -->
      @if (label) {
        <div class="flex items-center justify-between gap-2 mb-1.5">
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

      <!-- Input Box Wrapper with Prefix & Suffix -->
      <div
        class="relative flex items-center h-[38px] rounded-[4px] border transition-all duration-150 bg-white"
        [class.border-[#D9E1E7]]="!error && !disabled"
        [class.border-rose-600]="!!error"
        [class.ring-1]="!!error"
        [class.ring-rose-600]="!!error"
        [class.bg-[#F5F7F9]]="disabled"
        [class.cursor-not-allowed]="disabled"
        [class.focus-within:border-[#174A6E]]="!error && !disabled"
        [class.focus-within:ring-2]="!error && !disabled"
        [class.focus-within:ring-[#EAF2F6]]="!error && !disabled"
      >
        <!-- Optional Prefix Tag -->
        @if (prefixText) {
          <span class="inline-flex items-center h-full px-3 border-r border-[#D9E1E7] bg-[#F5F7F9] text-[12px] font-medium text-[#5F6B76] select-none rounded-l-[4px]">
            {{ prefixText }}
          </span>
        }

        <!-- Native Input Element -->
        <input
          [id]="id"
          [type]="type"
          [value]="value || ''"
          (input)="onInput($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readOnly]="readonly"
          [attr.maxlength]="maxLength || null"
          class="flex-1 min-w-0 w-full h-full px-3 text-[14px] leading-[22px] text-[#1F2933] placeholder:text-[#7A8792] focus:outline-none bg-transparent"
          [class.uppercase]="uppercase"
          [class.cursor-not-allowed]="disabled"
          [class.text-[#7A8792]]="disabled"
        />

        <!-- Optional Suffix Tag -->
        @if (suffixText) {
          <span class="inline-flex items-center h-full px-3 border-l border-[#D9E1E7] bg-[#F5F7F9] text-[12px] font-medium text-[#5F6B76] select-none rounded-r-[4px]">
            {{ suffixText }}
          </span>
        }
      </div>

      <!-- Error message alert -->
      @if (error) {
        <p class="text-[12px] text-rose-600 font-medium mt-1 flex items-center gap-1">
          <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ error }}</span>
        </p>
      }

      <!-- Helper Hint -->
      @if (!error && hint) {
        <p class="text-[12px] text-[#7A8792] mt-1 leading-tight">
          {{ hint }}
        </p>
      }
    </div>
  `
})
export class FormInputComponent {
  private static nextId = 0;
  readonly id = `form-input-${++FormInputComponent.nextId}`;

  @Input() label: string = '';
  @Input() value: string = '';
  @Input() type: 'text' | 'email' | 'date' | 'number' | 'tel' | 'password' = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() uppercase: boolean = false;
  @Input() maxLength?: number;
  @Input() prefixText?: string;
  @Input() suffixText?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() showCharCount: boolean = false;

  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    if (this.uppercase) {
      val = val.toUpperCase();
      input.value = val;
    }
    this.value = val;
    this.valueChange.emit(val);
  }
}
