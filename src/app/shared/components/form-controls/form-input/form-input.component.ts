import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef } from '@angular/core';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full flex flex-col">
      <!-- Label Row with Required Star and Character Count -->
      <div class="flex items-center justify-between gap-2 mb-1">
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

      <!-- Input Box Wrapper with Prefix & Suffix -->
      <div
        class="relative flex items-center rounded-md border transition-all duration-150 bg-white"
        [class.border-slate-300]="!error && !disabled"
        [class.border-rose-500]="!!error"
        [class.ring-1]="!!error"
        [class.ring-rose-500]="!!error"
        [class.bg-slate-50]="disabled"
        [class.cursor-not-allowed]="disabled"
        [class.focus-within:border-[#0B3558]]="!error && !disabled"
        [class.focus-within:ring-1]="!error && !disabled"
        [class.focus-within:ring-[#0B3558]]="!error && !disabled"
        [class.shadow-2xs]="!disabled"
      >
        <!-- Optional Prefix Tag -->
        @if (prefixText) {
          <span class="inline-flex items-center px-3 py-2 border-r border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 select-none rounded-l-md">
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
          (blur)="handleBlur()"
          class="flex-1 min-w-0 w-full px-3 py-2 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          [class.uppercase]="uppercase"
          [class.cursor-not-allowed]="disabled"
          [class.text-slate-500]="disabled"
        />

        <!-- Optional Suffix Tag -->
        @if (suffixText) {
          <span class="inline-flex items-center px-3 py-2 border-l border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 select-none rounded-r-md">
            {{ suffixText }}
          </span>
        }
      </div>

      <!-- Error message alert -->
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
export class FormInputComponent implements ControlValueAccessor {
  private static nextId = 0;
  readonly id = `form-input-${++FormInputComponent.nextId}`;

  @Input() label: string = '';
  @Input() value: string = '';
  @Input() type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'date' | 'time' = 'text';
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

  // ControlValueAccessor callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    if (this.uppercase) {
      val = val.toUpperCase();
      input.value = val;
    }
    this.value = val;
    this.valueChange.emit(val);
    this.onChange(val);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
