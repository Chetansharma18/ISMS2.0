import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, DropdownComponent, InputDirective, SwitchComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';
import { EoiAnswerValue, EoiCustomField } from '../eoi-apply.model';

/**
 * Scheme Proposal Details: the questions configured on the EOI. Answers are saved with
 * PUT /eoi/apply/applications/{id}/dynamic-answers?complete=true; the backend checks every answer.
 */
@Component({
  selector: 'app-step-scheme-custom-fields',
  standalone: true,
  imports: [FormsModule, ButtonComponent, DropdownComponent, InputDirective, SwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-5 font-sans">
      <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-[#7C0E44] m-0">EOI Form</h3>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8EDF1] text-[#7C0E44] border border-[#EADCE2]">
              {{ state.schemeCustomFields().length }}
            </span>
          </div>
          <p class="text-xs text-slate-500 m-0 mt-0.5">
            Fill in the details below for <span class="font-semibold text-slate-700">{{ state.schemeTitle() }}</span>. Fields marked <span class="text-rose-600 font-bold">*</span> are mandatory.
          </p>
        </div>
      </div>

      @if (state.customFieldErrors()['_form']; as message) {
        <p class="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium m-0" role="alert">{{ message }}</p>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5">
        @for (field of state.schemeCustomFields(); track field.key) {
          <div class="space-y-1.5" [class.md:col-span-2]="field.type === 'textarea'">
            <label class="block text-xs font-semibold text-slate-700" [attr.for]="'q-' + field.key">
              {{ field.label }}
              @if (field.mandatory) { <span class="text-rose-600 font-bold">*</span> }
            </label>

            @switch (field.type) {
              @case ('textarea') {
                <textarea
                  appInput
                  rows="3"
                  [id]="'q-' + field.key"
                  [invalid]="!!error(field)"
                  [placeholder]="field.placeholder || ''"
                  [ngModel]="text(field)"
                  (ngModelChange)="state.updateCustomAnswer(field.key, $event)"
                  class="w-full"
                ></textarea>
              }
              @case ('dropdown') {
                <app-dropdown
                  size="sm"
                  [options]="field.options"
                  [value]="text(field)"
                  (valueChange)="state.updateCustomAnswer(field.key, $event)"
                  [placeholder]="field.placeholder || 'Select'"
                  [invalid]="!!error(field)"
                  [inputId]="'q-' + field.key"
                />
              }
              @case ('radio') {
                <app-dropdown
                  size="sm"
                  [options]="field.options"
                  [value]="text(field)"
                  (valueChange)="state.updateCustomAnswer(field.key, $event)"
                  [placeholder]="field.placeholder || 'Select'"
                  [invalid]="!!error(field)"
                  [inputId]="'q-' + field.key"
                />
              }
              @case ('multiselect') {
                <app-dropdown
                  size="sm"
                  multiple
                  [options]="field.options"
                  [values]="list(field)"
                  (valuesChange)="state.updateCustomAnswer(field.key, $event)"
                  [placeholder]="field.placeholder || 'Select'"
                  [invalid]="!!error(field)"
                  [inputId]="'q-' + field.key"
                />
              }
              @case ('checkbox') {
                <div class="pt-1 flex items-center gap-3">
                  <app-switch
                    color="navy"
                    [label]="field.label"
                    [checked]="state.customFieldAnswers()[field.key] === true"
                    (toggled)="state.updateCustomAnswer(field.key, $event)"
                  />
                  <span class="text-xs font-medium text-slate-700">{{ state.customFieldAnswers()[field.key] === true ? 'Yes' : 'No' }}</span>
                </div>
              }
              @default {
                <input
                  appInput
                  size="sm"
                  [id]="'q-' + field.key"
                  [type]="inputType(field)"
                  [invalid]="!!error(field)"
                  [placeholder]="field.placeholder || ''"
                  [ngModel]="text(field)"
                  (ngModelChange)="state.updateCustomAnswer(field.key, toValue(field, $event))"
                  class="w-full"
                />
              }
            }

            @if (error(field); as message) {
              <p class="text-[11.5px] text-red-600 font-medium m-0">{{ message }}</p>
            } @else if (field.helpText) {
              <p class="text-[11.5px] text-slate-500 m-0">{{ field.helpText }}</p>
            }
          </div>
        }
      </div>

      <div class="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button appButton variant="outline" size="lg" (click)="state.goToStep(state.stepIndexProfile)">
          &larr; Back
        </button>
        <button appButton size="lg" [loading]="state.savingAnswers()" [disabled]="state.savingAnswers()" (click)="state.saveAnswersAndProceed()">
          Next &rarr;
        </button>
      </div>
    </div>
  `
})
export class StepSchemeCustomFieldsComponent {
  protected readonly state = inject(SchemeFormState);

  protected error(field: EoiCustomField): string {
    return this.state.customFieldErrors()[field.key] ?? '';
  }

  protected text(field: EoiCustomField): string {
    const v = this.state.customFieldAnswers()[field.key];
    return v === null || v === undefined || Array.isArray(v) || typeof v === 'boolean' ? '' : String(v);
  }

  protected list(field: EoiCustomField): string[] {
    const v = this.state.customFieldAnswers()[field.key];
    return Array.isArray(v) ? v : [];
  }

  protected inputType(field: EoiCustomField): string {
    switch (field.type) {
      case 'number':
      case 'currency':
        return 'number';
      case 'email':
        return 'email';
      case 'phone':
        return 'tel';
      case 'datepicker':
        return 'date';
      default:
        return 'text';
    }
  }

  /** Number fields are sent as numbers (empty stays empty); everything else as typed. */
  protected toValue(field: EoiCustomField, raw: unknown): EoiAnswerValue {
    if ((field.type === 'number' || field.type === 'currency') && raw !== '' && raw !== null && raw !== undefined) {
      const n = Number(raw);
      return Number.isFinite(n) ? n : String(raw);
    }
    return raw === null || raw === undefined ? '' : String(raw);
  }
}
