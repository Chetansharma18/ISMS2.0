import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FormFieldConfig,
  FormSectionConfig,
  FormActionConfig,
  FormOption
} from './form-sdc.types';

@Component({
  selector: 'app-form-sdc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 font-sans text-slate-800" style="font-family: 'Inter', sans-serif;">
      
      <!-- Optional Form Header -->
      @if (title || subtitle) {
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            @if (title) {
              <h1 class="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight leading-snug m-0">
                {{ title }}
              </h1>
            }
            @if (subtitle) {
              <p class="text-xs text-slate-500 mt-1 m-0">
                {{ subtitle }}
              </p>
            }
          </div>
          <div class="flex items-center gap-2">
            <ng-content select="[form-header-actions]"></ng-content>
          </div>
        </div>
      }

      <!-- Top Notification / Alert Banner -->
      @if (alertMessage) {
        <div
          class="p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in"
          [ngClass]="{
            'border-rose-200 bg-rose-50 text-rose-800': alertType === 'error',
            'border-emerald-200 bg-emerald-50 text-emerald-800': alertType === 'success',
            'border-blue-200 bg-blue-50 text-blue-800': alertType === 'info'
          }"
        >
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">{{ alertMessage }}</span>
          </div>
          <button
            type="button"
            (click)="alertMessage = ''"
            class="hover:opacity-75 cursor-pointer font-bold px-1"
          >
            ✕
          </button>
        </div>
      }

      <form (ngSubmit)="onSubmit()" class="space-y-6">

        <!-- ===================================================================
             MODE 1: STRUCTURED SECTIONS (e.g., SDC Step Cards)
             =================================================================== -->
        @if (sections && sections.length > 0) {
          @for (section of sections; track section.id || section.title; let secIdx = $index) {
            @if (isSectionVisible(section)) {
              <div class="border border-slate-200/90 rounded-xl p-5 sm:p-7 bg-white shadow-2xs space-y-6">
                
                <!-- Section Header -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-3">
                    @if (section.icon) {
                      <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <ng-container [ngSwitch]="section.icon">
                          <!-- Building / Organization -->
                          <svg *ngSwitchCase="'building'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <!-- Home -->
                          <svg *ngSwitchCase="'home'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <!-- Location / Map Pin -->
                          <svg *ngSwitchCase="'location'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <!-- Document / File -->
                          <svg *ngSwitchCase="'document'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <!-- User / Users -->
                          <svg *ngSwitchCase="'user'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <!-- Academic / Course -->
                          <svg *ngSwitchCase="'academic'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                          <!-- Shield / Verification -->
                          <svg *ngSwitchCase="'shield'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <!-- Default Fallback -->
                          <svg *ngSwitchDefault class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                        </ng-container>
                      </div>
                    }
                    <div>
                      <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight m-0">
                        {{ section.title }}
                      </h2>
                      @if (section.subtitle) {
                        <p class="text-xs text-slate-500 mt-0.5 m-0">
                          {{ section.subtitle }}
                        </p>
                      }
                    </div>
                  </div>

                  @if (section.badge) {
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {{ section.badge }}
                    </span>
                  }
                </div>

                <!-- Section Fields Grid -->
                <div [class]="getGridClass(section.gridCols || gridCols)">
                  @for (field of section.fields; track field.key) {
                    @if (isFieldVisible(field)) {
                      <div [class]="getFieldColClass(field, section.gridCols || gridCols)">
                        <ng-container *ngTemplateOutlet="fieldControlTemplate; context: { $implicit: field }"></ng-container>
                      </div>
                    }
                  }
                </div>

              </div>
            }
          }
        }

        <!-- ===================================================================
             MODE 2: FLAT FIELDS LIST (Simple form without sections)
             =================================================================== -->
        @if (!sections || sections.length === 0) {
          <div class="border border-slate-200/90 rounded-xl p-5 sm:p-7 bg-white shadow-2xs space-y-6">
            <div [class]="getGridClass(gridCols)">
              @for (field of fields; track field.key) {
                @if (isFieldVisible(field)) {
                  <div [class]="getFieldColClass(field, gridCols)">
                    <ng-container *ngTemplateOutlet="fieldControlTemplate; context: { $implicit: field }"></ng-container>
                  </div>
                }
              }
            </div>
          </div>
        }

        <!-- Transclusion slot for extra content -->
        <ng-content></ng-content>

        <!-- ===================================================================
             FORM ACTION BUTTONS
             =================================================================== -->
        <div class="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          
          <div class="flex items-center gap-2.5 w-full sm:w-auto">
            @if (showCancel) {
              <button
                type="button"
                (click)="onCancel()"
                class="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                {{ cancelLabel }}
              </button>
            }

            @if (showReset) {
              <button
                type="button"
                (click)="onReset()"
                class="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Reset
              </button>
            }

            @if (showDraft) {
              <button
                type="button"
                (click)="onSaveDraft()"
                class="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                {{ draftLabel }}
              </button>
            }
          </div>

          <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <!-- Custom action buttons -->
            @for (action of customActions; track action.id) {
              @if (isActionVisible(action)) {
                <button
                  type="button"
                  (click)="action.action(model)"
                  [disabled]="isActionDisabled(action)"
                  class="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  [ngClass]="{
                    'bg-[#0F172A] hover:bg-slate-800 text-white': action.variant === 'primary',
                    'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50': action.variant === 'secondary' || !action.variant,
                    'border border-slate-300 text-slate-700 hover:bg-slate-50': action.variant === 'outline',
                    'bg-rose-600 hover:bg-rose-700 text-white': action.variant === 'danger',
                    'text-slate-600 hover:bg-slate-100': action.variant === 'ghost'
                  }"
                >
                  @if (action.loading) {
                    <svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  }
                  <span>{{ action.label }}</span>
                </button>
              }
            }

            <!-- Transcluded form action slot -->
            <ng-content select="[form-actions]"></ng-content>

            <!-- Primary Submit Button -->
            @if (showSubmit) {
              <button
                type="submit"
                [disabled]="submitDisabled || submitLoading"
                class="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                @if (submitLoading) {
                  <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                }
                <span>{{ submitLabel }}</span>
              </button>
            }
          </div>

        </div>

      </form>

      <!-- ===================================================================
           REUSABLE TEMPLATE FOR RENDERING A SINGLE FORM FIELD
           =================================================================== -->
      <ng-template #fieldControlTemplate let-field>
        <div [id]="'field-' + field.key" class="space-y-1.5" [class]="field.className || ''">
          
          <!-- Divider / Heading Type -->
          @if (field.type === 'heading') {
            <div class="pt-3 pb-1 border-b border-slate-100">
              <h3 class="text-xs font-bold text-slate-900 tracking-tight uppercase">
                {{ field.label }}
              </h3>
              @if (field.hint) {
                <p class="text-[11px] text-slate-500 mt-0.5">{{ field.hint }}</p>
              }
            </div>
          } @else if (field.type === 'divider') {
            <hr class="border-t border-slate-200 my-2" />
          } @else if (field.type === 'checkbox') {
            <!-- Checkbox Single / Toggle -->
            <div class="pt-2">
              <label class="inline-flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  [checked]="!!getValue(field.key)"
                  (change)="onCheckboxChange(field, $event)"
                  [disabled]="isFieldDisabled(field)"
                  class="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                />
                <div>
                  <span class="text-xs font-medium text-slate-800">
                    {{ field.label }}
                    @if (field.required) {
                      <span class="text-rose-500 font-bold ml-0.5">*</span>
                    }
                  </span>
                  @if (field.hint) {
                    <p class="text-[11px] text-slate-500 mt-0.5 leading-tight">{{ field.hint }}</p>
                  }
                </div>
              </label>
              @if (getFieldError(field.key)) {
                <p class="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <span>{{ getFieldError(field.key) }}</span>
                </p>
              }
            </div>
          } @else if (field.type === 'switch') {
            <!-- Switch Toggle -->
            <div class="flex items-center justify-between py-1">
              <div>
                <span class="text-xs font-medium text-slate-800">
                  {{ field.label }}
                  @if (field.required) {
                    <span class="text-rose-500 font-bold ml-0.5">*</span>
                  }
                </span>
                @if (field.hint) {
                  <p class="text-[11px] text-slate-500 mt-0.5">{{ field.hint }}</p>
                }
              </div>
              <button
                type="button"
                (click)="toggleSwitch(field)"
                [disabled]="isFieldDisabled(field)"
                class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                [class.bg-[#0F172A]="!!getValue(field.key)"
                [class.bg-slate-200]="!getValue(field.key)"
              >
                <span
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  [class.translate-x-4]="!!getValue(field.key)"
                  [class.translate-x-0]="!getValue(field.key)"
                ></span>
              </button>
            </div>
          } @else if (field.type === 'custom' && field.template) {
            <!-- Custom Template -->
            <ng-container *ngTemplateOutlet="field.template; context: { $implicit: field, model: model, value: getValue(field.key) }"></ng-container>
          } @else {

            <!-- STANDARD INPUT LABEL ROW -->
            <div class="flex items-center justify-between gap-2">
              <label [for]="'input-' + field.key" class="block text-xs font-semibold text-slate-700 mb-0.5 select-none">
                {{ field.label }}
                @if (field.required) {
                  <span class="text-rose-500 font-bold ml-0.5">*</span>
                }
              </label>

              @if (field.showCharCount && field.maxLength) {
                <span class="text-[10px] font-mono text-slate-400">
                  {{ (getValue(field.key) || '').length }}/{{ field.maxLength }}
                </span>
              }
            </div>

            <!-- SELECT DROPDOWN -->
            @if (field.type === 'select') {
              <div class="relative">
                <select
                  [id]="'input-' + field.key"
                  [ngModel]="getValue(field.key)"
                  (ngModelChange)="onValueChange(field, $event)"
                  [disabled]="isFieldDisabled(field)"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border rounded-lg text-slate-800 transition-colors focus:outline-none appearance-none cursor-pointer pr-9"
                  [ngClass]="{
                    'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500': !!getFieldError(field.key),
                    'border-slate-200 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]': !getFieldError(field.key),
                    'bg-slate-50 cursor-not-allowed text-slate-500': isFieldDisabled(field)
                  }"
                >
                  <option value="" disabled [selected]="!getValue(field.key)">
                    {{ field.placeholder || 'Select ' + field.label }}
                  </option>
                  @for (opt of field.options; track opt.value) {
                    <option [value]="opt.value" [disabled]="opt.disabled">
                      {{ opt.label }}
                    </option>
                  }
                </select>
                <!-- Select Chevron Icon -->
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            }

            <!-- TEXTAREA -->
            @else if (field.type === 'textarea') {
              <textarea
                [id]="'input-' + field.key"
                [ngModel]="getValue(field.key)"
                (ngModelChange)="onValueChange(field, $event)"
                [placeholder]="field.placeholder || ''"
                [rows]="field.rows || 3"
                [disabled]="isFieldDisabled(field)"
                [readonly]="field.readonly"
                [attr.maxlength]="field.maxLength || null"
                class="w-full px-3.5 py-2.5 text-xs bg-white border rounded-lg text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none resize-y"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500': !!getFieldError(field.key),
                  'border-slate-200 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]': !getFieldError(field.key),
                  'bg-slate-50 cursor-not-allowed text-slate-500': isFieldDisabled(field)
                }"
              ></textarea>
            }

            <!-- RADIO GROUP -->
            @else if (field.type === 'radio') {
              <div class="flex flex-wrap items-center gap-4 py-1.5">
                @for (opt of field.options; track opt.value) {
                  <label class="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="radio"
                      [name]="field.key"
                      [value]="opt.value"
                      [checked]="getValue(field.key) === opt.value"
                      (change)="onValueChange(field, opt.value)"
                      [disabled]="isFieldDisabled(field) || opt.disabled"
                      class="h-3.5 w-3.5 border-slate-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                    />
                    <span>{{ opt.label }}</span>
                  </label>
                }
              </div>
            }

            <!-- FILE UPLOAD -->
            @else if (field.type === 'file') {
              <div class="space-y-2">
                @let currentFile = getValue(field.key);
                @if (isNonEmptyFile(currentFile)) {
                  <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div class="flex items-center gap-2 truncate">
                      <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="font-medium text-slate-800 truncate">
                        {{ getFileName(currentFile) }}
                      </span>
                    </div>
                    @if (!isFieldDisabled(field)) {
                      <button
                        type="button"
                        (click)="removeFile(field)"
                        class="text-rose-500 hover:text-rose-700 text-xs font-semibold ml-2 cursor-pointer"
                      >
                        Remove
                      </button>
                    }
                  </div>
                } @else {
                  <label
                    class="flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                    [ngClass]="{
                      'border-rose-300 bg-rose-50/50 hover:bg-rose-50': !!getFieldError(field.key),
                      'border-slate-200 hover:bg-slate-50': !getFieldError(field.key),
                      'opacity-50 cursor-not-allowed': isFieldDisabled(field)
                    }"
                  >
                    <div class="flex items-center gap-2 text-slate-600">
                      <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span class="text-xs font-medium">Click to upload file</span>
                    </div>
                    <span class="text-[10px] text-slate-400 mt-0.5">
                      {{ field.accept || 'PDF, JPG, PNG up to 5MB' }}
                    </span>
                    <input
                      type="file"
                      [id]="'input-' + field.key"
                      [accept]="field.accept || '*/*'"
                      [disabled]="isFieldDisabled(field)"
                      (change)="onFileChange(field, $event)"
                      class="hidden"
                    />
                  </label>
                }
              </div>
            }

            <!-- STANDARD NATIVE INPUT (text, number, date, email, tel, password, etc.) -->
            @else {
              <div
                class="flex items-center border rounded-lg bg-white transition-colors overflow-hidden"
                [ngClass]="{
                  'border-rose-400 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500': !!getFieldError(field.key),
                  'border-slate-200 focus-within:border-[#0F172A] focus-within:ring-1 focus-within:ring-[#0F172A]': !getFieldError(field.key),
                  'bg-slate-50 cursor-not-allowed': isFieldDisabled(field)
                }"
              >
                <!-- Prefix Tag -->
                @if (field.prefixText) {
                  <span class="inline-flex items-center px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-xs font-medium text-slate-500 select-none">
                    {{ field.prefixText }}
                  </span>
                }

                <!-- Native Input -->
                <input
                  [id]="'input-' + field.key"
                  [type]="field.type || 'text'"
                  [value]="getValue(field.key)"
                  (input)="onNativeInput(field, $event)"
                  [placeholder]="field.placeholder || ''"
                  [disabled]="isFieldDisabled(field)"
                  [readonly]="field.readonly"
                  [attr.min]="field.min != null ? field.min : null"
                  [attr.max]="field.max != null ? field.max : null"
                  [attr.step]="field.step != null ? field.step : null"
                  [attr.maxlength]="field.maxLength || null"
                  class="w-full px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  [class.uppercase]="field.uppercase"
                  [class.cursor-not-allowed]="isFieldDisabled(field)"
                />

                <!-- Suffix Tag -->
                @if (field.suffixText) {
                  <span class="inline-flex items-center px-3 py-2.5 bg-slate-50 border-l border-slate-200 text-xs font-medium text-slate-500 select-none">
                    {{ field.suffixText }}
                  </span>
                }
              </div>
            }

            <!-- Validation Error Alert -->
            @if (getFieldError(field.key)) {
              <p class="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                <svg class="w-3.5 h-3.5 shrink-0 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ getFieldError(field.key) }}</span>
              </p>
            } @else if (field.hint) {
              <!-- Field Help Hint -->
              <p class="text-[11px] text-slate-500 mt-1 leading-tight">
                {{ field.hint }}
              </p>
            }

          }

        </div>
      </ng-template>

    </div>
  `
})
export class FormSdcComponent {
  /** Form title shown at top */
  @Input() title?: string;

  /** Form subtitle shown below title */
  @Input() subtitle?: string;

  /** Flat list of fields (used when sections are not specified) */
  @Input() fields: FormFieldConfig[] = [];

  /** Structured list of sections (used for multi-step / grouped forms) */
  @Input() sections: FormSectionConfig[] = [];

  /** Two-way bindable data model */
  @Input() model: Record<string, any> = {};

  /** Default grid columns (1, 2, 3, or 4). Default is 2 */
  @Input() gridCols: 1 | 2 | 3 | 4 = 2;

  /** Submit button text */
  @Input() submitLabel: string = 'Submit';

  /** Cancel button text */
  @Input() cancelLabel: string = 'Cancel';

  /** Save Draft button text */
  @Input() draftLabel: string = 'Save Draft';

  /** Visibility toggles for form actions */
  @Input() showSubmit: boolean = true;
  @Input() showCancel: boolean = true;
  @Input() showDraft: boolean = false;
  @Input() showReset: boolean = false;

  /** Button state flags */
  @Input() submitLoading: boolean = false;
  @Input() submitDisabled: boolean = false;
  @Input() readOnly: boolean = false;

  /** Custom extra action buttons */
  @Input() customActions: FormActionConfig[] = [];

  /** Top notification alert banner */
  @Input() alertMessage: string = '';
  @Input() alertType: 'error' | 'success' | 'info' = 'error';

  /** External error map: { [fieldKey]: 'Error message' } */
  @Input() errors: Record<string, string> = {};

  /** Outputs */
  @Output() modelChange = new EventEmitter<Record<string, any>>();
  @Output() formSubmit = new EventEmitter<Record<string, any>>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() formDraft = new EventEmitter<Record<string, any>>();
  @Output() formReset = new EventEmitter<void>();
  @Output() fieldChange = new EventEmitter<{ key: string; value: any; model: Record<string, any> }>();
  @Output() fileSelect = new EventEmitter<{ key: string; file: File; base64?: string; name: string; size: string }>();

  /** Internal local validation errors map */
  internalErrors: Record<string, string> = {};

  /** Helper to read a value from the model, supporting dot-notation ('step1.sdcName') */
  getValue(key: string): any {
    if (!this.model || !key) return '';
    if (key.includes('.')) {
      const parts = key.split('.');
      return parts.reduce((acc, part) => (acc ? acc[part] : undefined), this.model) ?? '';
    }
    return this.model[key] ?? '';
  }

  /** Helper to set a value in the model, supporting dot-notation ('step1.sdcName') */
  setValue(key: string, value: any, field?: FormFieldConfig): void {
    if (!this.model) this.model = {};

    if (key.includes('.')) {
      const parts = key.split('.');
      let curr = this.model;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) curr[parts[i]] = {};
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = value;
    } else {
      this.model[key] = value;
    }

    // Clear error for this field
    delete this.internalErrors[key];
    if (this.errors && this.errors[key]) {
      delete this.errors[key];
    }

    // Trigger field callbacks and output events
    if (field?.onChange) {
      field.onChange(value, field, this.model);
    }
    this.modelChange.emit(this.model);
    this.fieldChange.emit({ key, value, model: this.model });
  }

  /** Returns error message from internal validation or external errors */
  getFieldError(key: string): string {
    return this.internalErrors[key] || this.errors[key] || '';
  }

  /** Evaluates visibility of a field */
  isFieldVisible(field: FormFieldConfig): boolean {
    if (field.visible === undefined) return true;
    if (typeof field.visible === 'boolean') return field.visible;
    if (typeof field.visible === 'function') return field.visible(this.model);
    return true;
  }

  /** Evaluates disabled state of a field */
  isFieldDisabled(field: FormFieldConfig): boolean {
    if (this.readOnly) return true;
    if (field.disabled === undefined) return false;
    if (typeof field.disabled === 'boolean') return field.disabled;
    if (typeof field.disabled === 'function') return field.disabled(this.model);
    return false;
  }

  /** Evaluates visibility of a section */
  isSectionVisible(section: FormSectionConfig): boolean {
    if (section.visible === undefined) return true;
    if (typeof section.visible === 'boolean') return section.visible;
    if (typeof section.visible === 'function') return section.visible(this.model);
    return true;
  }

  /** Evaluates visibility of an action */
  isActionVisible(action: FormActionConfig): boolean {
    return true;
  }

  /** Evaluates disabled state of an action */
  isActionDisabled(action: FormActionConfig): boolean {
    if (action.disabled === undefined) return false;
    if (typeof action.disabled === 'boolean') return action.disabled;
    if (typeof action.disabled === 'function') return action.disabled(this.model);
    return false;
  }

  /** Handles text/number native input events */
  onNativeInput(field: FormFieldConfig, event: Event): void {
    const target = event.target as HTMLInputElement;
    let val: any = target.value;
    if (field.type === 'number') {
      val = val === '' ? null : Number(val);
    } else if (field.uppercase && typeof val === 'string') {
      val = val.toUpperCase();
      target.value = val;
    }
    this.setValue(field.key, val, field);
  }

  /** Handles select / generic value changes */
  onValueChange(field: FormFieldConfig, value: any): void {
    this.setValue(field.key, value, field);
  }

  /** Handles checkbox change */
  onCheckboxChange(field: FormFieldConfig, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.setValue(field.key, checked, field);
  }

  /** Toggles a switch field */
  toggleSwitch(field: FormFieldConfig): void {
    if (this.isFieldDisabled(field)) return;
    const current = !!this.getValue(field.key);
    this.setValue(field.key, !current, field);
  }

  /** Handles file upload change */
  onFileChange(field: FormFieldConfig, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileSizeMb = file.size / (1024 * 1024);

      if (field.maxFileSizeMb && fileSizeMb > field.maxFileSizeMb) {
        this.internalErrors[field.key] = `File size exceeds ${field.maxFileSizeMb} MB`;
        input.value = '';
        return;
      }

      const fileData = {
        fileName: file.name,
        fileSize: `${fileSizeMb.toFixed(2)} MB`,
        uploadedAt: new Date().toISOString()
      };

      this.setValue(field.key, fileData, field);
      this.fileSelect.emit({
        key: field.key,
        file,
        name: file.name,
        size: `${fileSizeMb.toFixed(2)} MB`
      });
    }
  }

  /** Removes a chosen file */
  removeFile(field: FormFieldConfig): void {
    if (this.isFieldDisabled(field)) return;
    this.setValue(field.key, null, field);
  }

  /** Determines the grid CSS layout for a container */
  getGridClass(cols: 1 | 2 | 3 | 4 = 2): string {
    switch (cols) {
      case 1:
        return 'grid grid-cols-1 gap-4 sm:gap-5 text-xs';
      case 2:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs';
      case 3:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 text-xs';
      case 4:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 text-xs';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs';
    }
  }

  /** Determines the col-span CSS class for an individual field */
  getFieldColClass(field: FormFieldConfig, containerCols: 1 | 2 | 3 | 4 = 2): string {
    if (field.type === 'heading' || field.type === 'divider') {
      return 'col-span-full';
    }

    if (field.colSpan === 'full') {
      return 'col-span-full';
    }

    if (containerCols === 1) {
      return 'col-span-1';
    }

    if (containerCols === 2) {
      if (field.colSpan === 2) return 'col-span-1 sm:col-span-2';
      return 'col-span-1';
    }

    if (containerCols === 3) {
      if (field.colSpan === 3) return 'col-span-1 sm:col-span-3';
      if (field.colSpan === 2) return 'col-span-1 sm:col-span-2';
      return 'col-span-1';
    }

    if (containerCols === 4) {
      if (field.colSpan === 4) return 'col-span-1 sm:col-span-2 lg:col-span-4';
      if (field.colSpan === 3) return 'col-span-1 sm:col-span-3';
      if (field.colSpan === 2) return 'col-span-1 sm:col-span-2';
      return 'col-span-1';
    }

    return 'col-span-1';
  }

  /** Helper to determine if a file value is non-empty */
  isNonEmptyFile(val: any): boolean {
    if (!val) return false;
    if (typeof val === 'string' && val.trim().length > 0) return true;
    if (typeof val === 'object' && (val.fileName || val.name)) return true;
    return false;
  }

  /** Helper to retrieve the file display name */
  getFileName(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val.fileName || val.name || '';
  }

  /** Validates all active visible fields */
  validate(): boolean {
    this.internalErrors = {};
    const allFields: FormFieldConfig[] = [];

    if (this.sections && this.sections.length > 0) {
      for (const sec of this.sections) {
        if (this.isSectionVisible(sec)) {
          for (const f of sec.fields) {
            if (this.isFieldVisible(f)) {
              allFields.push(f);
            }
          }
        }
      }
    } else if (this.fields) {
      for (const f of this.fields) {
        if (this.isFieldVisible(f)) {
          allFields.push(f);
        }
      }
    }

    let firstErrorFieldKey: string | null = null;

    for (const field of allFields) {
      const val = this.getValue(field.key);

      // 1. Required check
      if (field.required) {
        const isEmpty =
          val == null ||
          val === '' ||
          (field.type === 'checkbox' && !val) ||
          (field.type === 'file' && !this.isNonEmptyFile(val)) ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0);

        if (isEmpty) {
          this.internalErrors[field.key] = field.requiredMessage || `${field.label} is required`;
          if (!firstErrorFieldKey) firstErrorFieldKey = field.key;
          continue;
        }
      }

      // If value is empty and not required, skip format checks
      if (val == null || val === '') continue;

      // 2. Email format check
      if (field.type === 'email' && typeof val === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          this.internalErrors[field.key] = 'Please enter a valid email address';
          if (!firstErrorFieldKey) firstErrorFieldKey = field.key;
          continue;
        }
      }

      // 3. Min / Max length checks
      if (typeof val === 'string') {
        if (field.minLength && val.length < field.minLength) {
          this.internalErrors[field.key] = `Minimum ${field.minLength} characters required`;
          if (!firstErrorFieldKey) firstErrorFieldKey = field.key;
          continue;
        }
        if (field.maxLength && val.length > field.maxLength) {
          this.internalErrors[field.key] = `Maximum ${field.maxLength} characters allowed`;
          if (!firstErrorFieldKey) firstErrorFieldKey = field.key;
          continue;
        }
      }

      // 4. Min / Max numeric checks
      if (field.type === 'number' && typeof val === 'number') {
        if (field.min != null && val < Number(field.min)) {
          this.internalErrors[field.key] = `Value cannot be less than ${field.min}`;
          if (!firstErrorFieldKey) firstErrorFieldKey = field.key;
          continue;
        }
        if (field.max != null && val > Number(field.max)) {
          this.internalErrors[field.key] = `Value cannot be greater than ${field.max}`;
          if (!firstErrorFieldKey) firstErrorFieldKey = field.key;
          continue;
        }
      }

      // 5. Regex pattern check
      if (field.pattern && typeof val === 'string') {
        const regex = typeof field.pattern === 'string' ? new RegExp(field.pattern) : field.pattern;
        if (!regex.test(val)) {
          this.internalErrors[field.key] = field.patternMessage || `Invalid format for ${field.label}`;
          if (!firstErrorFieldKey) firstErrorFieldKey = field.key;
          continue;
        }
      }

      // 6. Custom validator function
      if (field.validator) {
        const customErr = field.validator(val, this.model);
        if (customErr) {
          this.internalErrors[field.key] = customErr;
          if (!firstErrorFieldKey) firstErrorFieldKey = field.key;
          continue;
        }
      }
    }

    // If errors exist, smoothly scroll to first error
    if (firstErrorFieldKey) {
      const el = document.getElementById('field-' + firstErrorFieldKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  }

  /** Triggered on form submit */
  onSubmit(): void {
    if (this.validate()) {
      this.formSubmit.emit(this.model);
    }
  }

  /** Triggered on cancel */
  onCancel(): void {
    this.formCancel.emit();
  }

  /** Triggered on reset */
  onReset(): void {
    this.internalErrors = {};
    this.formReset.emit();
  }

  /** Triggered on save draft */
  onSaveDraft(): void {
    this.formDraft.emit(this.model);
  }
}
