import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-4 flex items-center gap-4">
      <label class="w-1/3 text-xs font-semibold text-slate-700 text-left">
        {{ label }} <span *ngIf="required" class="text-rose-600">*</span>
      </label>
      <div class="w-2/3 relative">
        <!-- Text / Email / Tel / Number / Date / Url Input -->
        <ng-container *ngIf="type !== 'textarea' && type !== 'select' && type !== 'file'">
          <input
            [type]="type"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
            [ngClass]="{'border-rose-400 bg-rose-50 ring-1 ring-rose-400': errorMessage}"
            [maxlength]="maxlength || 250"
            [placeholder]="placeholder || ''"
            [style.text-transform]="uppercase ? 'uppercase' : 'none'"
            [ngModel]="value"
            (ngModelChange)="onValueChange($event)"
          />
        </ng-container>

        <!-- Textarea -->
        <ng-container *ngIf="type === 'textarea'">
          <textarea
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
            [ngClass]="{'border-rose-400 bg-rose-50 ring-1 ring-rose-400': errorMessage}"
            [rows]="rows || 2"
            [placeholder]="placeholder || ''"
            [maxlength]="maxlength || 250"
            [ngModel]="value"
            (ngModelChange)="onValueChange($event)"
          ></textarea>
        </ng-container>

        <!-- Select Dropdown -->
        <ng-container *ngIf="type === 'select'">
          <select
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
            [ngClass]="{'border-rose-400 bg-rose-50 ring-1 ring-rose-400': errorMessage}"
            [ngModel]="value"
            (ngModelChange)="onValueChange($event)"
          >
            <option *ngFor="let opt of options" [value]="opt.value || opt.label || opt">{{ opt.label || opt }}</option>
          </select>
        </ng-container>

        <!-- File Upload -->
        <ng-container *ngIf="type === 'file'">
          <input
            type="file"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
            [ngClass]="{'border-rose-400 bg-rose-50 ring-1 ring-rose-400': errorMessage}"
            (change)="onFileChange($event)"
          />
          <div *ngIf="value" class="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
            Selected: {{ value.name || value }}
          </div>
        </ng-container>

        <!-- Hint / Help Text -->
        <span *ngIf="hint && !errorMessage" class="block text-[11px] text-slate-500 font-medium mt-1">{{ hint }}</span>

        <!-- Error message -->
        <div *ngIf="errorMessage" class="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">error</span>
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() value: any = '';
  @Input() type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'url' | 'textarea' | 'select' | 'file' = 'text';
  @Input() required: boolean = false;
  @Input() maxlength?: number;
  @Input() rows?: number = 2;
  @Input() options: any[] = [];
  @Input() hint?: string;
  @Input() placeholder?: string;
  @Input() uppercase: boolean = false;
  @Input() errorMessage?: string;

  @Output() valueChange = new EventEmitter<any>();

  onValueChange(newVal: any): void {
    const formatted = this.uppercase && typeof newVal === 'string' ? newVal.toUpperCase() : newVal;
    this.valueChange.emit(formatted);
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.valueChange.emit(target.files[0]);
    } else {
      this.valueChange.emit(null);
    }
  }
}
