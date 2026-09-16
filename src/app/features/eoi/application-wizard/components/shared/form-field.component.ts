import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gov-form-row">
      <label class="gov-label">
        {{ label }} <span *ngIf="required" class="req-star">*</span>
      </label>
      <div class="gov-control-wrapper">
        <!-- Text / Email / Tel / Number / Date / Url Input -->
        <ng-container *ngIf="type !== 'textarea' && type !== 'select'">
          <input
            [type]="type"
            class="gov-input"
            [class.has-error]="errorMessage"
            [maxlength]="maxlength || 250"
            [style.text-transform]="uppercase ? 'uppercase' : 'none'"
            [ngModel]="value"
            (ngModelChange)="onValueChange($event)"
          />
        </ng-container>

        <!-- Textarea -->
        <ng-container *ngIf="type === 'textarea'">
          <textarea
            class="gov-input gov-textarea"
            [class.has-error]="errorMessage"
            [rows]="rows || 2"
            [maxlength]="maxlength || 250"
            [ngModel]="value"
            (ngModelChange)="onValueChange($event)"
          ></textarea>
        </ng-container>

        <!-- Select Dropdown -->
        <ng-container *ngIf="type === 'select'">
          <select
            class="gov-input gov-select"
            [class.has-error]="errorMessage"
            [ngModel]="value"
            (ngModelChange)="onValueChange($event)"
          >
            <option *ngFor="let opt of options" [value]="opt">{{ opt }}</option>
          </select>
        </ng-container>

        <!-- Hint -->
        <span *ngIf="hint && !errorMessage" class="field-hint">{{ hint }}</span>

        <!-- Error message -->
        <div *ngIf="errorMessage" class="gov-input-error-msg">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() value: any = '';
  @Input() type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'url' | 'textarea' | 'select' = 'text';
  @Input() required: boolean = false;
  @Input() maxlength?: number;
  @Input() rows?: number = 2;
  @Input() options: string[] = [];
  @Input() hint?: string;
  @Input() uppercase: boolean = false;
  @Input() errorMessage?: string;

  @Output() valueChange = new EventEmitter<any>();

  onValueChange(newVal: any): void {
    const formatted = this.uppercase && typeof newVal === 'string' ? newVal.toUpperCase() : newVal;
    this.valueChange.emit(formatted);
  }
}
