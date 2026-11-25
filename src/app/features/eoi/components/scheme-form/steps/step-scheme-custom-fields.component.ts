import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, InputDirective, SwitchComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';
import { SchemeCustomField } from '../../../../../core/models/scheme-requirements.model';

@Component({
  selector: 'app-step-scheme-custom-fields',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent, InputDirective, SwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-6 font-sans">
      <!-- Section Info Banner -->
      <div class="p-3.5 sm:p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-xs sm:text-[13px] leading-relaxed flex items-start gap-2.5">
        <app-icon name="info" size="sm" class="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong class="font-semibold text-amber-950">Scheme Specific Proposal Parameters:</strong>
          Please answer the questions below required specifically for
          <span class="font-bold text-[#7C0E44]">{{ state.schemeTitle() }}</span>.
          All mandatory questions marked with an asterisk (<span class="text-red-600 font-bold">*</span>) must be completed.
        </div>
      </div>

      <!-- Dynamic Fields Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        @for (field of state.schemeCustomFields(); track field.id) {
          <div
            class="space-y-1.5"
            [class.md:col-span-2]="field.type === 'textarea' || (field.options && field.options.length > 4)"
          >
            <!-- Field Label -->
            <label class="block text-xs sm:text-[13px] font-semibold text-slate-800">
              {{ field.label }}
              @if (field.mandatory) {
                <span class="text-red-600 font-bold">*</span>
              }
            </label>

            <!-- Text / Email / Phone Input -->
            @if (field.type === 'text' || field.type === 'email' || field.type === 'phone') {
              <input
                appInput
                size="sm"
                [type]="field.type"
                [placeholder]="field.placeholder || 'Enter value'"
                [ngModel]="state.customFieldAnswers()[field.fieldKey] ?? ''"
                (ngModelChange)="state.updateCustomAnswer(field.fieldKey, $event)"
                class="w-full"
              />
            }

            <!-- Number Input -->
            @if (field.type === 'number' || field.type === 'currency') {
              <input
                appInput
                size="sm"
                type="number"
                [placeholder]="field.placeholder || 'Enter number'"
                [ngModel]="state.customFieldAnswers()[field.fieldKey] ?? ''"
                (ngModelChange)="state.updateCustomAnswer(field.fieldKey, $event)"
                class="w-full"
              />
            }

            <!-- Dropdown Select -->
            @if (field.type === 'dropdown') {
              <select
                appInput
                size="sm"
                [ngModel]="state.customFieldAnswers()[field.fieldKey] ?? ''"
                (ngModelChange)="state.updateCustomAnswer(field.fieldKey, $event)"
                class="w-full"
              >
                <option value="">{{ field.placeholder || 'Select an option' }}</option>
                @for (opt of field.options; track opt) {
                  <option [value]="opt">{{ opt }}</option>
                }
              </select>
            }

            <!-- Switch / Boolean Toggle -->
            @if (field.type === 'switch') {
              <div class="pt-1 flex items-center gap-3">
                <app-switch
                  [checked]="state.customFieldAnswers()[field.fieldKey] === true"
                  (checkedChange)="state.updateCustomAnswer(field.fieldKey, $event)"
                />
                <span class="text-xs font-medium text-slate-700">
                  {{ state.customFieldAnswers()[field.fieldKey] ? 'Yes, Available / Linkage Attached' : 'No / Not Available' }}
                </span>
              </div>
            }

            <!-- Textarea -->
            @if (field.type === 'textarea') {
              <textarea
                appInput
                rows="3"
                [placeholder]="field.placeholder || 'Enter detailed response'"
                [ngModel]="state.customFieldAnswers()[field.fieldKey] ?? ''"
                (ngModelChange)="state.updateCustomAnswer(field.fieldKey, $event)"
                class="w-full"
              ></textarea>
            }

            <!-- Hint or Error text -->
            @if (errors()[field.fieldKey]) {
              <p class="text-[11.5px] text-red-600 font-medium m-0">{{ errors()[field.fieldKey] }}</p>
            } @else if (field.hint) {
              <p class="text-[11.5px] text-slate-500 m-0">{{ field.hint }}</p>
            }
          </div>
        }
      </div>

      <!-- Footer Action Buttons -->
      <div class="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button appButton variant="outline" size="lg" (click)="state.goToStep(state.stepIndexProfile)">
          &larr; Back to Registration Profile
        </button>

        <button appButton size="lg" (click)="validateAndProceed()">
          Proceed to Upload Documents &rarr;
        </button>
      </div>
    </div>
  `
})
export class StepSchemeCustomFieldsComponent {
  protected readonly state = inject(SchemeFormState);
  readonly errors = signal<Record<string, string>>({});

  validateAndProceed(): void {
    const fields = this.state.schemeCustomFields();
    const answers = this.state.customFieldAnswers();
    const newErrors: Record<string, string> = {};

    for (const f of fields) {
      if (f.mandatory) {
        const val = answers[f.fieldKey];
        if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
          newErrors[f.fieldKey] = `${f.label} is required.`;
        }
      }
    }

    this.errors.set(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Proceed to Step (Upload Documents)
      this.state.goToStep(this.state.stepIndexDocuments());
    }
  }
}
