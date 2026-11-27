import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, InputDirective, SwitchComponent } from '../../../shared';
import { DynamicFormField } from '../../../core/models/admin-masters.model';
import { publishValueError } from './publish-fields.util';

@Component({
  selector: 'app-custom-form-fields',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent, InputDirective, SwitchComponent],
  template: `
    <div class="space-y-4">
      <!-- Section Header Strip: Title + Count Badge + Add Field Button -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-slate-800 text-sm m-0">{{ title() }}</h3>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F8EDF1] text-[#7C0E44]">
            {{ fields().length }} {{ fields().length === 1 ? 'field' : 'fields' }}
          </span>
        </div>

        <button appButton variant="primary" size="sm" type="button" (click)="addField()">
          <app-icon name="plus" size="xs" />
          <span>{{ addLabel() }}</span>
        </button>
      </div>

      @if (hint()) {
        <p class="m-0 -mt-2 text-xs text-slate-500">{{ hint() }}</p>
      }

      <!-- Fields List -->
      @if (fields().length === 0) {
        <div class="p-6 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50/50 space-y-1">
          <div class="text-xs text-slate-500">
            No custom fields added yet. Click <span class="font-semibold text-[#7C0E44]">"+ {{ addLabel() }}"</span> above to add custom form fields.
          </div>
        </div>
      } @else {
        <div class="space-y-3">
          @for (field of fields(); track field.id; let idx = $index) {
            <div class="p-4 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-3">
              <!-- Field Top Bar -->
              <div class="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div class="p-1 text-slate-400 select-none" title="Drag / Reorder">
                    <app-icon name="grip-dots" [stroke]="2" />
                  </div>
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200/80 text-[11px] font-bold text-slate-700">
                    #{{ idx + 1 }}
                  </span>
                  <span class="text-xs font-semibold text-slate-600">
                    {{ field.label ? field.label : 'Untitled Field' }}
                  </span>
                </div>

                <div class="flex items-center gap-1.5">
                  <button
                    appButton
                    variant="ghost"
                    size="sm"
                    iconOnly
                    type="button"
                    (click)="moveUp(idx)"
                    [disabled]="idx === 0"
                    title="Move field up"
                    aria-label="Move field up"
                  >
                    <app-icon name="chevron-up" size="xs" [stroke]="2.5" />
                  </button>
                  <button
                    appButton
                    variant="ghost"
                    size="sm"
                    iconOnly
                    type="button"
                    (click)="moveDown(idx)"
                    [disabled]="idx === fields().length - 1"
                    title="Move field down"
                    aria-label="Move field down"
                  >
                    <app-icon name="chevron-down" size="xs" />
                  </button>
                  <div class="h-4 w-px bg-slate-200 mx-0.5"></div>
                  <button
                    appButton
                    variant="danger"
                    size="sm"
                    iconOnly
                    type="button"
                    (click)="deleteField(idx)"
                    title="Delete this field"
                    aria-label="Delete this field"
                  >
                    <app-icon name="trash" size="xs" />
                  </button>
                </div>
              </div>

              <!-- Field Inputs Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                <div class="sm:col-span-6">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Label Name*</label>
                  <input
                    appInput
                    size="sm"
                    type="text"
                    [(ngModel)]="field.label"
                    (ngModelChange)="emitChange()"
                    placeholder="e.g. Candidate Name, Center Photo"
                    class="w-full"
                  />
                </div>

                <div class="sm:col-span-4">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Field Type*</label>
                  <select
                    appInput
                    size="sm"
                    [(ngModel)]="field.type"
                    (ngModelChange)="onTypeChange(field)"
                    class="w-full"
                  >
                    <option value="text">Single-Line Text</option>
                    <option value="textarea">Multi-Line Textarea</option>
                    <option value="number">Number Input</option>
                    <option value="currency">Currency (INR ₹)</option>
                    <option value="email">Email Address</option>
                    <option value="phone">Mobile / Phone No.</option>
                    <option value="datepicker">Date Picker</option>
                    <option value="dropdown">Dropdown List</option>
                    <option value="radio">Radio Options</option>
                    <option value="checkbox">Checkbox (Yes / No)</option>
                    <!-- Uploads are not collected per field yet: offered only to keep an existing field's type -->
                    @if (field.type === 'file') {
                      <option value="file">Document Upload (not collected yet)</option>
                    }
                    @if (field.type === 'photo') {
                      <option value="photo">Photo Upload (not collected yet)</option>
                    }
                  </select>
                </div>

                <div class="sm:col-span-2 sm:pt-6">
                  <div class="inline-flex items-center gap-2 select-none text-xs font-semibold text-slate-700">
                    <app-switch
                      color="navy"
                      [label]="isInfo() ? 'Value required' : 'Mandatory'"
                      [checked]="field.mandatory"
                      (toggled)="field.mandatory = $event; emitChange()"
                    />
                    <span>{{ isInfo() ? 'Value required' : 'Mandatory' }}</span>
                  </div>
                </div>
              </div>

              <!-- Sub-options for Dropdown / Radio -->
              @if (field.type === 'dropdown' || field.type === 'radio') {
                <div class="p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                  <label class="block text-xs font-semibold text-slate-700">Options (comma-separated)*</label>
                  <input
                    appInput
                    size="sm"
                    type="text"
                    [(ngModel)]="field.optionsText"
                    (ngModelChange)="updateOptions(field)"
                    placeholder="e.g. Option 1, Option 2, Option 3"
                    class="w-full"
                  />
                </div>
              }

              <!-- Publish Details: the value applicants are shown -->
              @if (isInfo()) {
                <div class="p-2.5 rounded-md bg-[#F8EDF1]/50 border border-[#EADCE2] space-y-1">
                  <label class="block text-xs font-semibold text-slate-700">
                    Value shown to applicants{{ field.mandatory ? '*' : '' }}
                  </label>
                  @switch (field.type) {
                    @case ('textarea') {
                      <textarea appInput size="sm" rows="2" maxlength="2000" class="w-full"
                        [ngModel]="valueText(field)" (ngModelChange)="setValue(field, $event)"
                        placeholder="Enter the information"></textarea>
                    }
                    @case ('datepicker') {
                      <input appInput size="sm" type="date" class="w-full"
                        [ngModel]="valueText(field)" (ngModelChange)="setValue(field, $event)" />
                    }
                    @case ('checkbox') {
                      <select appInput size="sm" class="w-full" [ngModel]="flagText(field)" (ngModelChange)="setFlag(field, $event)">
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    }
                    @case ('dropdown') {
                      <select appInput size="sm" class="w-full" [ngModel]="valueText(field)" (ngModelChange)="setValue(field, $event)">
                        <option value="">Select</option>
                        @for (opt of field.options ?? []; track opt) {
                          <option [value]="opt">{{ opt }}</option>
                        }
                      </select>
                    }
                    @case ('radio') {
                      <select appInput size="sm" class="w-full" [ngModel]="valueText(field)" (ngModelChange)="setValue(field, $event)">
                        <option value="">Select</option>
                        @for (opt of field.options ?? []; track opt) {
                          <option [value]="opt">{{ opt }}</option>
                        }
                      </select>
                    }
                    @case ('file') {
                      <p class="m-0 text-xs text-slate-500">Upload documents for applicants with "Attach Document" above.</p>
                    }
                    @case ('photo') {
                      <p class="m-0 text-xs text-slate-500">Upload documents for applicants with "Attach Document" above.</p>
                    }
                    @default {
                      <input appInput size="sm" class="w-full" maxlength="2000"
                        [type]="field.type === 'number' || field.type === 'currency' ? 'number' : field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'"
                        [ngModel]="valueText(field)" (ngModelChange)="setValue(field, $event)"
                        placeholder="Enter the information" />
                    }
                  }
                  @if (valueError(field); as message) {
                    <p class="m-0 text-xs font-medium text-red-500">{{ message }}</p>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class CustomFormFieldsComponent {
  readonly fields = input<DynamicFormField[]>([]);
  readonly title = input<string>('Form Fields');
  readonly addLabel = input<string>('Add Field');
  /**
   * 'info' (Publish Details): information for applicants, the department enters each field's value.
   * 'question' (Uploading Details): what the applicant fills in when applying.
   */
  readonly mode = input<'info' | 'question'>('question');
  /** One line under the title saying what the fields are for. */
  readonly hint = input('');
  /** Show the value errors (after a save / next attempt). */
  readonly showErrors = input(false);

  readonly fieldsChange = output<DynamicFormField[]>();

  protected isInfo(): boolean {
    return this.mode() === 'info';
  }

  protected valueText(field: DynamicFormField): string {
    return typeof field.value === 'string' ? field.value : '';
  }

  protected flagText(field: DynamicFormField): string {
    return field.value === true ? 'Yes' : field.value === false ? 'No' : '';
  }

  /** Stored as text (a number input gives a number). */
  protected setValue(field: DynamicFormField, value: unknown): void {
    field.value = value === null || value === undefined ? '' : String(value);
    this.emitChange();
  }

  protected setFlag(field: DynamicFormField, value: string): void {
    field.value = value === 'Yes' ? true : value === 'No' ? false : '';
    this.emitChange();
  }

  /** A new type needs a new value (a date is not a valid Yes / No). */
  protected onTypeChange(field: DynamicFormField): void {
    if (this.isInfo()) field.value = '';
    this.emitChange();
  }

  protected valueError(field: DynamicFormField): string | null {
    return this.showErrors() ? publishValueError(field) : null;
  }

  addField(): void {
    const list = [...this.fields()];
    const newField: DynamicFormField = {
      id: 'f_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      label: '',
      type: 'text',
      mandatory: false,
      placeholder: '',
      optionsText: ''
    };
    list.push(newField);
    this.fieldsChange.emit(list);
  }

  deleteField(idx: number): void {
    const list = this.fields().filter((_, i) => i !== idx);
    this.fieldsChange.emit(list);
  }

  moveUp(idx: number): void {
    if (idx === 0) return;
    const list = [...this.fields()];
    const temp = list[idx];
    list[idx] = list[idx - 1];
    list[idx - 1] = temp;
    this.fieldsChange.emit(list);
  }

  moveDown(idx: number): void {
    const list = [...this.fields()];
    if (idx >= list.length - 1) return;
    const temp = list[idx];
    list[idx] = list[idx + 1];
    list[idx + 1] = temp;
    this.fieldsChange.emit(list);
  }

  updateOptions(field: DynamicFormField): void {
    if (field.optionsText) {
      field.options = field.optionsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    } else {
      field.options = [];
    }
    this.emitChange();
  }

  emitChange(): void {
    this.fieldsChange.emit([...this.fields()]);
  }
}
