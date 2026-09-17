import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="mb-4">
      <label *ngIf="label" [for]="id" class="block font-bold text-slate-700 text-sm mb-1">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>
      <input
        [id]="id"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="w-full px-4 py-2 border rounded-lg text-sm transition-colors outline-none focus:ring-2 focus:ring-[#131A4D]/20 disabled:bg-slate-50 disabled:text-slate-500"
        [ngClass]="{
          'border-red-400 focus:border-red-500': showError,
          'border-slate-300 focus:border-[#131A4D]': !showError,
          'bg-slate-100 cursor-not-allowed': disabled
        }"
      />
      <p *ngIf="showError && errorMessage" class="text-xs text-red-500 mt-1 font-semibold">
        {{ errorMessage }}
      </p>
      <p *ngIf="hint && !showError" class="text-xs text-slate-500 mt-1">
        {{ hint }}
      </p>
    </div>
  `
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() id = `ui-input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() required = false;
  @Input() showError = false;
  @Input() errorMessage = '';
  @Input() hint = '';
  @Input() disabled = false;

  value: any = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  writeValue(val: any): void {
    this.value = val !== undefined && val !== null ? val : '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
