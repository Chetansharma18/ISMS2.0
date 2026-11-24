import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-form-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="w-full flex flex-col font-sans">
      <!-- Label Row with Required Star, optional infoTooltip, and Character Count -->
      @if (label) {
        <div class="flex items-center justify-between gap-2 mb-1">
          <label [attr.for]="type === 'date' ? null : id" class="text-xs sm:text-[12.5px] font-medium leading-[18px] text-[#25212A] select-none inline-flex items-center gap-1">
            <span>{{ label }}</span>
            @if (required) {
              <span class="text-rose-600 font-bold">*</span>
            }
            @if (infoTooltip) {
              <span
                class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-500 text-[10px] font-bold cursor-help hover:text-slate-800 hover:border-slate-600 transition-colors ml-0.5"
                [title]="infoTooltip"
              >
                i
              </span>
            }
          </label>

          @if (showCharCount && maxLength) {
            <span class="text-[10.5px] tabular-nums text-[#7A8792]">
              {{ (value || '').length }}/{{ maxLength }}
            </span>
          }
        </div>
      }

      <!-- Input Box Wrapper with Prefix & Suffix -->
      <div
        class="relative flex items-center h-[35px] rounded-[4px] border transition-colors duration-150 bg-white"
        [class.border-theme]="!error"
        [class.border-rose-600]="!!error"
        [class.ring-1]="!!error"
        [class.ring-rose-600]="!!error"
        [class.bg-surface-muted]="disabled"
        [class.cursor-not-allowed]="disabled"
        [class.focus-within:border-primary]="!error && !disabled"
        [class.focus-within:ring-2]="!error && !disabled"
        [class.focus-within:ring-primary-light]="!error && !disabled"
        [class.focus-within:border-rose-600]="!!error && !disabled"
        [class.focus-within:ring-rose-200]="!!error && !disabled"
      >
        <!-- Optional Prefix Tag -->
        @if (prefixText) {
          <span class="inline-flex items-center h-full px-2.5 border-theme bg-surface-muted text-[12px] font-medium text-secondary select-none rounded-l-[4px]">
            {{ prefixText }}
          </span>
        }

        <!-- Native Input Element -->
        <input
          [id]="id"
          [type]="type"
          [value]="value || ''"
          (input)="onInput($event)"
          (keydown)="onKeyDown($event)"
          (paste)="onPaste($event)"
          (blur)="onBlur($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readOnly]="readonly"
          [attr.maxlength]="maxLength || null"
          [attr.max]="max || null"
          [attr.min]="min || null"
          [attr.aria-invalid]="!!error"
          [style.color-scheme]="type === 'date' ? 'light' : null"
          class="flex-1 min-w-0 w-full h-full px-2.5 text-xs sm:text-[13px] leading-[20px] text-primary placeholder:text-muted focus:outline-none focus-visible:outline-none bg-transparent placeholder:normal-case"
          [class.uppercase]="uppercase"
          [class.cursor-not-allowed]="disabled"
          [class.text-muted]="disabled"
        />

        <!-- Optional Suffix Tag -->
        @if (suffixText) {
          <span class="inline-flex items-center h-full px-3 border-l border-theme bg-surface-muted text-[12px] font-medium text-secondary select-none rounded-r-[4px]">
            {{ suffixText }}
          </span>
        }
      </div>

      <!-- Error message alert -->
      @if (error) {
        <div class="form-error-text text-rose-600 font-medium mt-0.5 flex items-center gap-1 leading-tight animate-fade-in" style="font-size: 11px !important; line-height: 14px !important;">
          <app-icon name="error" size="xs" [stroke]="2.5" />
          <span style="font-size: 11px !important; line-height: 14px !important;">{{ error }}</span>
        </div>
      }

      <!-- Helper Hint -->
      @if (!error && hint) {
        <div class="form-hint-text text-[#7A8792] mt-0.5 leading-tight" style="font-size: 11px !important; line-height: 14px !important;">
          {{ hint }}
        </div>
      }
    </div>
  `,
  styles: [`
    input::placeholder {
      text-transform: none !important;
    }
    input:focus-visible {
      outline: none !important;
    }
    .form-error-text {
      font-size: 11px !important;
      line-height: 14px !important;
    }
    .form-hint-text {
      font-size: 11px !important;
      line-height: 14px !important;
    }
  `]
})
export class FormInputComponent {
  private static nextId = 0;
  readonly id = `form-input-${++FormInputComponent.nextId}`;

  @Input() label: string = '';
  @Input() value: string = '';
  @Input() type: 'text' | 'email' | 'date' | 'time' | 'number' | 'tel' | 'password' = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() uppercase: boolean = false;
  @Input() numericOnly: boolean = false;
  @Input() maxLength?: number;
  @Input() max?: string;
  @Input() min?: string;
  @Input() prefixText?: string;
  @Input() suffixText?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() infoTooltip?: string;
  @Input() showCharCount: boolean = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<FocusEvent>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    if (this.numericOnly) {
      val = val.replace(/\D/g, '');
      input.value = val;
    }
    if (this.uppercase) {
      val = val.toUpperCase();
      input.value = val;
    }
    this.value = val;
    this.valueChange.emit(val);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.numericOnly) return;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent): void {
    if (!this.numericOnly) return;
    event.preventDefault();
    const text = event.clipboardData?.getData('text') || '';
    const digits = text.replace(/\D/g, '');
    if (!digits) return;
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const current = input.value;
    let nextVal = current.slice(0, start) + digits + current.slice(end);
    if (this.maxLength) {
      nextVal = nextVal.slice(0, this.maxLength);
    }
    input.value = nextVal;
    this.value = nextVal;
    this.valueChange.emit(nextVal);
  }

  onBlur(event: FocusEvent): void {
    this.blur.emit(event);
  }
}
