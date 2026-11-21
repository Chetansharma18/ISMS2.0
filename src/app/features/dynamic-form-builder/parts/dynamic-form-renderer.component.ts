import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, InputDirective } from '../../../shared';
import {
  DynamicFormBuilderItem,
  DynamicFormField,
  DynamicFormSubmission,
  FormStep
} from '../../../core/models/admin-masters.model';
import {
  isFieldRequired,
  isFieldVisible,
  validateFieldsList,
  validateFieldValue
} from '../dynamic-form-builder.util';

@Component({
  selector: 'app-dynamic-form-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent, InputDirective],
  template: `
    <div class="space-y-5 font-sans text-slate-800">

      <!-- PREVIEW MODE BADGE / BANNER -->
      @if (isPreview()) {
        <div class="px-4 py-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <app-icon name="warning-triangle" size="xs" class="text-amber-600 shrink-0" />
            <span>
              <strong>PREVIEW MODE:</strong> You are testing the interactive form. Sample uploads and entries will not affect live production data.
            </span>
          </div>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200/80 text-amber-900">
            Simulated
          </span>
        </div>
      }

      <!-- FORM HEADER -->
      <div class="pb-3 border-b border-slate-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-[#7C0E44] m-0">
              {{ form().formType }}
            </h1>
            @if (form().description) {
              <p class="text-xs text-slate-500 m-0 mt-0.5">
                {{ form().description }}
              </p>
            }
          </div>
          <div class="text-xs text-slate-500">
            Fields marked with <span class="text-rose-500 font-bold">*</span> are mandatory
          </div>
        </div>
      </div>

      <!-- MULTI-STEP PROGRESS STEPPER (When isStepForm is true) -->
      @if (form().isStepForm && steps().length > 1) {
        <div class="bg-white border border-slate-200 rounded-xl px-4 py-3 sm:px-6 shadow-2xs">
          <div class="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 text-xs">
            @for (step of steps(); track step.id; let sIdx = $index) {
              <div
                (click)="goToStep(sIdx)"
                class="flex items-center gap-2 shrink-0 cursor-pointer select-none group"
                [title]="'Jump to Step ' + (sIdx + 1) + ': ' + step.title"
              >
                <!-- Number Circle -->
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shrink-0"
                  [ngClass]="{
                    'bg-[#7C0E44] text-white shadow-xs': activeStepIndex() === sIdx,
                    'bg-emerald-600 text-white': activeStepIndex() > sIdx,
                    'bg-slate-100 text-slate-500 border border-slate-300 group-hover:border-slate-400': activeStepIndex() < sIdx
                  }"
                >
                  @if (activeStepIndex() > sIdx) {
                    <app-icon name="check" size="xs" [stroke]="3" />
                  } @else {
                    {{ sIdx + 1 }}
                  }
                </div>

                <!-- Step Label -->
                <span
                  class="text-xs transition-colors hidden sm:inline"
                  [ngClass]="activeStepIndex() === sIdx ? 'font-bold text-[#7C0E44]' : 'text-slate-600 group-hover:text-slate-900'"
                >
                  {{ step.title }}
                </span>

                <!-- Connector Line -->
                @if (sIdx < steps().length - 1) {
                  <div
                    class="w-6 sm:w-12 h-0.5 ml-1 transition-colors"
                    [ngClass]="activeStepIndex() > sIdx ? 'bg-emerald-500' : 'bg-slate-200'"
                  ></div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- FORM CONTENT CARD -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 sm:p-7 shadow-2xs space-y-6">
        
        <!-- Active Step Title (if multi-step) -->
        @if (form().isStepForm && currentStep(); as curStep) {
          <div class="pb-3 border-b border-slate-100">
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">
              {{ curStep.title }}
            </h2>
            @if (curStep.description) {
              <p class="text-xs text-slate-500 m-0 mt-0.5">{{ curStep.description }}</p>
            }
          </div>
        }

        <!-- FIELDS GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-x-5 gap-y-4 items-start">
          @for (field of visibleCurrentFields(); track field.id) {
            
            <!-- SECTION HEADING -->
            @if (field.type === 'heading') {
              <div class="col-span-12 pt-3 pb-1 border-b border-slate-200">
                <h3 class="text-sm font-bold text-[#1E3A5F] m-0">{{ field.label }}</h3>
                @if (field.hint) {
                  <p class="text-xs text-slate-500 m-0 mt-0.5">{{ field.hint }}</p>
                }
              </div>
            }

            <!-- DIVIDER -->
            @else if (field.type === 'divider') {
              <div class="col-span-12 py-1">
                <hr class="border-t border-slate-200 m-0" />
              </div>
            }

            <!-- STANDARD INPUT FIELDS -->
            @else {
              <div [class]="getFieldColSpan(field)">
                
                <!-- Label & Required Star -->
                <label [for]="field.id" class="block text-slate-700 font-semibold text-xs mb-1.5">
                  {{ field.label }}
                  @if (isFieldMandatory(field)) {
                    <span class="text-rose-500 font-bold ml-0.5">*</span>
                  }
                </label>

                <!-- 1. Text Field -->
                @if (field.type === 'text') {
                  <input
                    [id]="field.id"
                    appInput
                    size="sm"
                    type="text"
                    [placeholder]="field.placeholder || 'Enter ' + field.label"
                    [(ngModel)]="values[field.id]"
                    (ngModelChange)="onFieldInput(field)"
                    [invalid]="hasError(field.id)"
                    class="w-full"
                  />
                }

                <!-- 2. Textarea -->
                @else if (field.type === 'textarea') {
                  <textarea
                    [id]="field.id"
                    appInput
                    size="sm"
                    rows="3"
                    [placeholder]="field.placeholder || 'Enter details'"
                    [(ngModel)]="values[field.id]"
                    (ngModelChange)="onFieldInput(field)"
                    [invalid]="hasError(field.id)"
                    class="w-full resize-none"
                  ></textarea>
                }

                <!-- 3. Number Field -->
                @else if (field.type === 'number') {
                  <input
                    [id]="field.id"
                    appInput
                    size="sm"
                    type="number"
                    [placeholder]="field.placeholder || '0'"
                    [(ngModel)]="values[field.id]"
                    (ngModelChange)="onFieldInput(field)"
                    [invalid]="hasError(field.id)"
                    class="w-full"
                  />
                }

                <!-- 4. Currency Field (INR) -->
                @else if (field.type === 'currency') {
                  <div class="relative w-full">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">₹</span>
                    <input
                      [id]="field.id"
                      appInput
                      size="sm"
                      type="text"
                      [placeholder]="field.placeholder || '0.00'"
                      [(ngModel)]="values[field.id]"
                      (ngModelChange)="onFieldInput(field)"
                      [invalid]="hasError(field.id)"
                      class="w-full pl-7"
                    />
                  </div>
                }

                <!-- 5. Email -->
                @else if (field.type === 'email') {
                  <input
                    [id]="field.id"
                    appInput
                    size="sm"
                    type="email"
                    [placeholder]="field.placeholder || 'user@domain.gov.in'"
                    [(ngModel)]="values[field.id]"
                    (ngModelChange)="onFieldInput(field)"
                    [invalid]="hasError(field.id)"
                    class="w-full"
                  />
                }

                <!-- 6. Phone -->
                @else if (field.type === 'phone') {
                  <input
                    [id]="field.id"
                    appInput
                    size="sm"
                    type="tel"
                    maxlength="10"
                    [placeholder]="field.placeholder || '9876543210'"
                    [(ngModel)]="values[field.id]"
                    (ngModelChange)="onFieldInput(field)"
                    [invalid]="hasError(field.id)"
                    class="w-full tabular-nums"
                  />
                }

                <!-- 7. Datepicker -->
                @else if (field.type === 'datepicker') {
                  <input
                    [id]="field.id"
                    appInput
                    size="sm"
                    type="date"
                    [(ngModel)]="values[field.id]"
                    (ngModelChange)="onFieldInput(field)"
                    [invalid]="hasError(field.id)"
                    class="w-full"
                  />
                }

                <!-- 8. Dropdown -->
                @else if (field.type === 'dropdown') {
                  <div class="relative w-full">
                    <select
                      [id]="field.id"
                      appInput
                      size="sm"
                      [(ngModel)]="values[field.id]"
                      (ngModelChange)="onFieldInput(field)"
                      [invalid]="hasError(field.id)"
                      class="w-full pr-8"
                    >
                      <option value="" disabled selected>-- Select {{ field.label }} --</option>
                      @for (opt of getFieldOptions(field); track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                    <app-icon name="chevron-down" size="xs" class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                }

                <!-- 9. Radio Options -->
                @else if (field.type === 'radio') {
                  <div class="flex flex-wrap items-center gap-4 pt-1">
                    @for (opt of getFieldOptions(field); track opt) {
                      <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="radio"
                          [name]="field.id"
                          [value]="opt"
                          [(ngModel)]="values[field.id]"
                          (ngModelChange)="onFieldInput(field)"
                          class="w-4 h-4 text-[#7C0E44] border-slate-300 focus:ring-[#7C0E44] accent-[#7C0E44] cursor-pointer"
                        />
                        <span>{{ opt }}</span>
                      </label>
                    }
                  </div>
                }

                <!-- 10. Checkbox -->
                @else if (field.type === 'checkbox') {
                  <div class="pt-1">
                    <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                      <input
                        [id]="field.id"
                        type="checkbox"
                        [(ngModel)]="values[field.id]"
                        (ngModelChange)="onFieldInput(field)"
                        class="w-4 h-4 rounded text-[#7C0E44] border-slate-300 focus:ring-[#7C0E44] accent-[#7C0E44] cursor-pointer"
                      />
                      <span>{{ field.placeholder || 'I confirm and verify the above information' }}</span>
                    </label>
                  </div>
                }

                <!-- 11. Photo / Document Upload -->
                @else if (field.type === 'photo' || field.type === 'file') {
                  <div class="space-y-2 pt-0.5">
                    <div class="flex flex-wrap items-center gap-2.5">
                      <button
                        appButton
                        variant="outline"
                        size="sm"
                        type="button"
                        (click)="simulateFileUpload(field)"
                      >
                        <app-icon name="upload" size="xs" />
                        <span>{{ field.type === 'photo' ? 'Upload Photo' : 'Attach Document' }}</span>
                      </button>
                      <span class="text-[11px] text-slate-400">
                        Max {{ field.maxSizeMb || 5 }} MB • Max {{ field.maxPhotos || 3 }} files
                      </span>
                    </div>

                    <!-- Uploaded file badges -->
                    @if (values[field.id]; as fileList) {
                      @if (fileList.length > 0) {
                        <div class="flex flex-wrap gap-2 pt-1">
                          @for (f of fileList; track f; let fIdx = $index) {
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <app-icon name="check" size="xs" class="text-emerald-600" />
                              <span>{{ f }}</span>
                              <button
                                appButton
                                variant="ghost"
                                size="sm"
                                iconOnly
                                type="button"
                                (click)="removeFile(field.id, fIdx)"
                                title="Remove file"
                                class="ml-0.5 shrink-0"
                              >
                                <app-icon name="close" size="xs" />
                              </button>
                            </span>
                          }
                        </div>
                      }
                    }
                  </div>
                }

                <!-- Inline Helper Hint -->
                @if (field.hint && !hasError(field.id)) {
                  <p class="text-[11px] text-slate-400 m-0 mt-1 leading-snug">{{ field.hint }}</p>
                }

                <!-- Inline Error Message -->
                @if (hasError(field.id)) {
                  <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ errors()[field.id] }}</p>
                }
              </div>
            }
          }
        </div>

        <!-- BOTTOM CARD NAVIGATION & SUBMISSION BAR -->
        <div class="flex items-center justify-between pt-5 border-t border-slate-200 gap-3 flex-wrap">
          <div>
            @if (form().isStepForm && activeStepIndex() > 0) {
              <button
                appButton
                variant="outline"
                size="md"
                type="button"
                (click)="prevStep()"
              >
                <app-icon name="chevron-left" size="xs" />
                <span>Previous Step</span>
              </button>
            } @else {
              <button
                appButton
                variant="outline"
                size="md"
                type="button"
                (click)="cancelled.emit()"
              >
                <span>Close</span>
              </button>
            }
          </div>

          <div class="flex items-center gap-2.5">
            @if (form().isStepForm && activeStepIndex() < steps().length - 1) {
              <button
                appButton
                variant="primary"
                size="md"
                type="button"
                (click)="nextStep()"
              >
                <span>Next Step</span>
                <app-icon name="chevron-right" size="xs" />
              </button>
            } @else {
              <button
                appButton
                variant="primary"
                size="md"
                type="button"
                (click)="submit()"
              >
                <app-icon name="check" size="xs" />
                <span>{{ isPreview() ? 'Submit in Preview' : 'Submit Form' }}</span>
              </button>
            }
          </div>
        </div>

      </div>
    </div>
  `
})
export class DynamicFormRendererComponent {
  readonly form = input.required<DynamicFormBuilderItem>();
  readonly isPreview = input<boolean>(false);
  readonly initialValues = input<Record<string, any>>({});

  readonly submitted = output<DynamicFormSubmission>();
  readonly cancelled = output<void>();
  readonly draftSaved = output<Record<string, any>>();

  readonly activeStepIndex = signal<number>(0);
  readonly errors = signal<Record<string, string>>({});
  readonly touched = signal<Record<string, boolean>>({});

  values: Record<string, any> = {};

  readonly steps = computed<FormStep[]>(() => {
    const f = this.form();
    if (f.isStepForm && f.steps && f.steps.length > 0) {
      return f.steps;
    }
    return [
      {
        id: 'direct-step',
        stepNumber: 1,
        title: f.formType,
        fields: f.fields || []
      }
    ];
  });

  readonly currentStep = computed<FormStep | null>(() => {
    const s = this.steps();
    return s[this.activeStepIndex()] || s[0] || null;
  });

  readonly visibleCurrentFields = computed<DynamicFormField[]>(() => {
    const step = this.currentStep();
    if (!step) return [];
    return step.fields.filter(f => isFieldVisible(f, this.values));
  });

  constructor() {
    this.initValues();
  }

  private initValues(): void {
    this.values = { ...(this.initialValues() || {}) };
  }

  getFieldColSpan(field: DynamicFormField): string {
    if (field.type === 'textarea') return 'col-span-12';
    if (field.type === 'heading' || field.type === 'divider') return 'col-span-12';
    return 'col-span-12 sm:col-span-6';
  }

  isFieldMandatory(field: DynamicFormField): boolean {
    return isFieldRequired(field, this.values);
  }

  getFieldOptions(field: DynamicFormField): string[] {
    if (field.options && field.options.length > 0) return field.options;
    if (field.optionsText) {
      return field.optionsText.split(',').map(o => o.trim()).filter(Boolean);
    }
    return ['Option 1', 'Option 2', 'Option 3'];
  }

  onFieldInput(field: DynamicFormField): void {
    this.touched.update(t => ({ ...t, [field.id]: true }));
    const err = validateFieldValue(field, this.values[field.id], this.values);
    this.errors.update(e => {
      const copy = { ...e };
      if (err) {
        copy[field.id] = err;
      } else {
        delete copy[field.id];
      }
      return copy;
    });
  }

  hasError(fieldId: string): boolean {
    return !!this.errors()[fieldId];
  }

  simulateFileUpload(field: DynamicFormField): void {
    const existing: string[] = this.values[field.id] || [];
    const max = field.maxPhotos || 3;
    if (existing.length >= max) return;
    const ext = field.type === 'photo' ? '.jpg' : '.pdf';
    const sample = `${field.label.replace(/[^a-zA-Z0-9]/g, '_')}_${existing.length + 1}${ext}`;
    this.values[field.id] = [...existing, sample];
    this.onFieldInput(field);
  }

  removeFile(fieldId: string, idx: number): void {
    const existing: string[] = this.values[fieldId] || [];
    this.values[fieldId] = existing.filter((_, i) => i !== idx);
    const field = this.visibleCurrentFields().find(f => f.id === fieldId);
    if (field) {
      this.onFieldInput(field);
    }
  }

  validateActiveStep(): boolean {
    const step = this.currentStep();
    if (!step) return true;
    const stepErrors = validateFieldsList(step.fields, this.values);
    this.errors.set(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  nextStep(): void {
    if (!this.validateActiveStep()) return;
    if (this.activeStepIndex() < this.steps().length - 1) {
      this.activeStepIndex.update(i => i + 1);
    }
  }

  prevStep(): void {
    if (this.activeStepIndex() > 0) {
      this.activeStepIndex.update(i => i - 1);
    }
  }

  goToStep(index: number): void {
    if (index === this.activeStepIndex()) return;
    // If moving forward, validate current step first
    if (index > this.activeStepIndex()) {
      if (!this.validateActiveStep()) return;
    }
    this.activeStepIndex.set(index);
  }

  submit(): void {
    if (!this.validateActiveStep()) return;

    const refNo = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
    const submission: DynamicFormSubmission = {
      id: 'sub-' + Date.now(),
      formId: this.form().id,
      formVersion: this.form().version || 1,
      formType: this.form().formType,
      values: { ...this.values },
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      referenceNo: refNo
    };

    this.submitted.emit(submission);
  }
}
