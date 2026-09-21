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
      <label *ngIf="label" [for]="id" class="block font-semibold text-slate-700 text-xs tracking-wide mb-1.5">
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
        class="w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-200 outline-none hover:border-slate-300 focus:ring-4 focus:ring-rsldc-navy/10 disabled:bg-slate-50 disabled:text-slate-400 shadow-sm hover:shadow"
        [ngClass]="{
          'border-red-400 focus:border-red-500 bg-red-50/30': showError,
          'border-slate-200 focus:border-rsldc-navy bg-white focus:bg-slate-50/50': !showError,
          'bg-slate-100 cursor-not-allowed opacity-75': disabled
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
