import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

@Component({
  selector: 'app-ui-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="mb-4">
      <label *ngIf="label" [for]="id" class="block font-semibold text-slate-700 text-xs tracking-wide mb-1.5">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>
      <div class="relative">
        <select
          [id]="id"
          [disabled]="isDisabled"
          [value]="value"
          (change)="onChangeEvent($event)"
          (blur)="onTouched()"
          class="w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-200 outline-none appearance-none hover:border-slate-300 focus:ring-4 focus:ring-rsldc-navy/10 disabled:bg-slate-50 disabled:text-slate-400 font-semibold shadow-sm hover:shadow"
          [ngClass]="{
            'border-red-400 focus:border-red-500 bg-red-50/30': showError,
            'border-slate-200 focus:border-rsldc-navy bg-white focus:bg-slate-50/50': !showError,
            'bg-slate-100 cursor-not-allowed opacity-75': isDisabled,
            'text-slate-400 font-normal': value === ''
          }"
        >
          <option value="" disabled selected *ngIf="placeholder">{{ placeholder }}</option>
          <option *ngFor="let opt of options" [value]="opt.value" [disabled]="opt.disabled">
            {{ opt.label }}
          </option>
          <ng-content></ng-content>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      <p *ngIf="showError && errorMessage" class="text-xs text-red-500 mt-1 font-semibold">
        {{ errorMessage }}
      </p>
      <p *ngIf="hint && !showError" class="text-xs text-slate-500 mt-1">
        {{ hint }}
      </p>
    </div>
  `
})
export class UiSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: SelectOption[] = [];
  @Input() id = `ui-select-${Math.random().toString(36).substr(2, 9)}`;
  @Input() required = false;
  @Input() showError = false;
  @Input() errorMessage = '';
  @Input() hint = '';
  @Input() isDisabled = false;

  value: any = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  onChangeEvent(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
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
    this.isDisabled = isDisabled;
  }
}
