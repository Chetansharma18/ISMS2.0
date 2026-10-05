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
  FormOption,
  FormDensity,
  FormLayoutMode
} from './form-sdc.types';
import { DocumentViewerModalComponent } from '../document-viewer-modal/document-viewer-modal.component';

@Component({
  selector: 'app-form-sdc, app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentViewerModalComponent],
  template: `
    <div class="space-y-4 font-sans text-slate-800" style="font-family: 'Inter', sans-serif;">
      
      <!-- Optional Form Header -->
      @if (title || subtitle) {
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            @if (title) {
              <h2 class="text-base sm:text-lg font-bold text-[#174A6E] tracking-tight leading-snug m-0">
                {{ title }}
              </h2>
            }
            @if (subtitle) {
              <p class="text-[11px] text-slate-500 mt-0.5 m-0">
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
          class="p-3 rounded-lg border flex items-center justify-between text-xs animate-in fade-in"
          [ngClass]="{
            'border-rose-200 bg-rose-50 text-rose-800': alertType === 'error',
            'border-emerald-200 bg-emerald-50 text-emerald-800': alertType === 'success',
            'border-blue-200 bg-blue-50 text-blue-800': alertType === 'info'
          }"
        >
          <div class="flex items-center gap-2">
            <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium text-xs">{{ alertMessage }}</span>
          </div>
          <button
            type="button"
            (click)="alertMessage = ''"
            class="hover:opacity-75 cursor-pointer font-bold px-1 text-xs"
          >
            ✕
          </button>
        </div>
      }

      <form (ngSubmit)="onSubmit()" class="space-y-4">

        <!-- ===================================================================
             UNIFIED MASTER CARD LAYOUT (MINIMUM SCROLL, HIGH DENSITY)
             =================================================================== -->
        @if ((layout === 'unified' || layout === 'plain') && sections && sections.length > 0) {
          <div [ngClass]="layout === 'plain' || !card ? 'space-y-6' : 'border border-slate-200/90 rounded-xl p-4 sm:p-6 bg-white shadow-2xs space-y-6'">
            @for (section of sections; track section.id || section.title; let secIdx = $index; let isLast = $last) {
              @if (isSectionVisible(section)) {
                <div [id]="'section-' + (section.id || secIdx)" class="space-y-3.5" [class.border-b]="!isLast && !!section.title" [class.border-slate-100]="!isLast && !!section.title" [class.pb-6]="!isLast && !!section.title">
                  
                  <!-- Section Header (Only rendered when title is provided) -->
                  @if (section.title) {
                    <div class="flex items-center justify-between gap-3 pb-2 border-b border-slate-100/80">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <span class="w-1.5 h-4 bg-[#174A6E] rounded-full shrink-0"></span>
                        @if (section.icon) {
                          <div class="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <ng-container [ngSwitch]="section.icon">
                              <svg *ngSwitchCase="'building'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <svg *ngSwitchCase="'location'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <svg *ngSwitchCase="'document'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <svg *ngSwitchCase="'academic'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                              </svg>
                              <svg *ngSwitchCase="'shield'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <svg *ngSwitchDefault class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                            </ng-container>
                          </div>
                        }
                        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider truncate m-0">
                          {{ section.title }}
                        </h3>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        @if (section.badge) {
                          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                            {{ section.badge }}
                          </span>
                        }
                        @if (section.collapsible) {
                          <button
                            type="button"
                            (click)="section.collapsed = !section.collapsed"
                            class="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
                          >
                            {{ section.collapsed ? '▼' : '▲' }}
                          </button>
                        }
                      </div>
                    </div>
                  }

                  <!-- Fields Grid in Section -->
                  @if (!section.collapsed) {
                    <div [class]="getGridClass(section.gridCols || gridCols)">
                      @for (field of section.fields; track field.key) {
                        @if (isFieldVisible(field)) {
                          <div [class]="getFieldColClass(field, section.gridCols || gridCols)">
                            <ng-container *ngTemplateOutlet="fieldControlTemplate; context: { $implicit: field }"></ng-container>
                          </div>
                        }
                      }
                    </div>
                  }

                </div>
              }
            }
          </div>
        }

        <!-- ===================================================================
             SEPARATE CARDS LAYOUT (Optional Mode)
             =================================================================== -->
        @if (layout === 'cards' && sections && sections.length > 0) {
          @for (section of sections; track section.id || section.title; let secIdx = $index) {
            @if (isSectionVisible(section)) {
              <div class="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-white shadow-2xs space-y-4">
                
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div class="flex items-center gap-2.5">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                      {{ section.title }}
                    </h3>
                  </div>
                  @if (section.badge) {
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {{ section.badge }}
                    </span>
                  }
                </div>

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
             FLAT FIELDS MODE (No sections specified)
             =================================================================== -->
        @if (!sections || sections.length === 0) {
          <div [ngClass]="layout === 'plain' || !card ? 'space-y-4' : 'border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-white shadow-2xs space-y-4'">
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
             COMPACT BOTTOM ACTION BUTTONS
             =================================================================== -->
        <div class="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-1">
          
          <div class="flex items-center gap-2 w-full sm:w-auto">
            @if (showCancel) {
              <button
                type="button"
                (click)="onCancel()"
                class="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                {{ cancelLabel }}
              </button>
            }

            @if (showReset) {
              <button
                type="button"
                (click)="onReset()"
                class="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Reset
              </button>
            }

            @if (showDraft) {
              <button
                type="button"
                (click)="onSaveDraft()"
                class="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                {{ draftLabel }}
              </button>
            }
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto justify-end sm:ml-auto">
            <!-- Custom action buttons -->
            @for (action of customActions; track action.id) {
              @if (isActionVisible(action)) {
                <button
                  type="button"
                  (click)="action.action(model)"
                  [disabled]="isActionDisabled(action)"
                  class="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  [ngClass]="{
                    'bg-[#174A6E] hover:bg-[#123B59] text-white': action.variant === 'primary',
                    'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50': action.variant === 'secondary' || !action.variant,
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
                class="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-[#174A6E] hover:bg-[#123B59] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
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
            <div class="pt-2 pb-0.5 border-b border-slate-100 col-span-full">
              <h4 class="text-[11px] font-bold text-slate-800 tracking-wider uppercase m-0">
                {{ getFieldLabel(field) }}
              </h4>
              @if (field.hint) {
                <p class="text-[10px] text-slate-500 mt-0.5 m-0">{{ field.hint }}</p>
              }
            </div>
          } @else if (field.type === 'divider') {
            <hr class="border-t border-slate-200 my-1.5 col-span-full" />
          } @else if (field.type === 'checkbox') {
            <!-- Checkbox Single / Toggle -->
            <div class="pt-1">
              <label class="inline-flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  [checked]="!!getValue(field.key)"
                  (change)="onCheckboxChange(field, $event)"
                  [disabled]="isFieldDisabled(field)"
                  class="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#174A6E] focus:ring-[#174A6E] cursor-pointer"
                />
                <div>
                  <span class="text-xs font-semibold text-slate-800 leading-tight block">
                    {{ getFieldLabel(field) }}
                    @if (field.required) {
                      <span class="text-rose-500 font-bold ml-0.5">*</span>
                    }
                  </span>
                  @if (field.hint) {
                    <p class="text-[11px] text-slate-500 mt-0.5 leading-tight m-0">{{ field.hint }}</p>
                  }
                </div>
              </label>
              @if (getFieldError(field.key)) {
                <p class="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-0.5 m-0">
                  <span>{{ getFieldError(field.key) }}</span>
                </p>
              }
            </div>
          } @else if (field.type === 'switch') {
            <!-- Switch Toggle -->
            <div class="flex items-center justify-between py-1">
              <div>
                <span class="text-xs font-semibold text-slate-800">
                  {{ getFieldLabel(field) }}
                  @if (field.required) {
                    <span class="text-rose-500 font-bold ml-0.5">*</span>
                  }
                </span>
                @if (field.hint) {
                  <p class="text-[11px] text-slate-500 mt-0.5 m-0">{{ field.hint }}</p>
                }
              </div>
              <button
                type="button"
                (click)="toggleSwitch(field)"
                [disabled]="isFieldDisabled(field)"
                class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                [class.bg-[#174A6E]="!!getValue(field.key)"
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

            <!-- STANDARD FORM INPUT LABEL ROW -->
            <div class="flex items-center justify-between gap-1">
              <label [for]="'input-' + field.key" class="block text-xs font-medium text-slate-700 leading-tight select-none truncate">
                {{ getFieldLabel(field) }}
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
                  class="w-full h-[38px] px-3 text-xs bg-white border rounded-lg text-slate-800 transition-all focus:outline-none appearance-none cursor-pointer pr-8 hover:border-slate-400"
                  [ngClass]="{
                    'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-100': !!getFieldError(field.key),
                    'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100': !getFieldError(field.key),
                    'bg-slate-50 cursor-not-allowed text-slate-500 border-slate-200': isFieldDisabled(field)
                  }"
                >
                  <option value="" disabled [selected]="!getValue(field.key)">
                    {{ getFieldPlaceholder(field) || 'Please select' }}
                  </option>
                  @for (opt of field.options; track opt.value) {
                    <option [value]="opt.value" [disabled]="opt.disabled">
                      {{ opt.label }}
                    </option>
                  }
                </select>
              </div>
            }

            <!-- TEXTAREA -->
            @else if (field.type === 'textarea') {
              <textarea
                [id]="'input-' + field.key"
                [ngModel]="getValue(field.key)"
                (ngModelChange)="onValueChange(field, $event)"
                [placeholder]="getFieldPlaceholder(field) || ''"
                [rows]="field.rows || 2"
                [disabled]="isFieldDisabled(field)"
                [readonly]="field.readonly"
                [attr.maxlength]="field.maxLength || null"
                class="w-full px-3 py-2 text-xs bg-white border rounded-lg text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none resize-none hover:border-slate-400 leading-relaxed"
                [ngClass]="{
                  'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-100': !!getFieldError(field.key),
                  'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100': !getFieldError(field.key),
                  'bg-slate-50 cursor-not-allowed text-slate-500 border-slate-200': isFieldDisabled(field)
                }"
              ></textarea>
            }

            <!-- RADIO GROUP -->
            @else if (field.type === 'radio') {
              <div class="flex flex-wrap items-center gap-3 py-1">
                @for (opt of field.options; track opt.value) {
                  <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="radio"
                      [name]="field.key"
                      [value]="opt.value"
                      [checked]="getValue(field.key) === opt.value"
                      (change)="onValueChange(field, opt.value)"
                      [disabled]="isFieldDisabled(field) || opt.disabled"
                      class="h-3.5 w-3.5 border-slate-300 text-[#174A6E] focus:ring-[#174A6E] cursor-pointer"
                    />
                    <span>{{ opt.label }}</span>
                  </label>
                }
              </div>
            }

            <!-- FILE UPLOAD CONTROL (38px HEIGHT WITH VIEW & DELETE ACTIONS) -->
            @else if (field.type === 'file') {
              <div class="relative">
                @let currentFile = getValue(field.key);
                @if (isNonEmptyFile(currentFile)) {
                  <div class="h-[38px] flex items-center justify-between px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs gap-2 shadow-2xs">
                    <!-- File info: Document/Image icon, Name & Size (no PDF icon) -->
                    <div class="flex items-center gap-2 min-w-0 flex-1 truncate">
                      <svg class="w-4 h-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="font-medium text-slate-800 truncate text-xs" [title]="getFileName(currentFile)">
                        {{ getFileName(currentFile) }}
                      </span>
                    </div>

                    <!-- Actions Toolbar: View & Delete -->
                    <div class="flex items-center gap-1.5 shrink-0">
                      <!-- View Button -->
                      <button
                        type="button"
                        (click)="viewFile(field, currentFile)"
                        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                        title="View Document"
                      >
                        <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View</span>
                      </button>

                      <!-- Delete Button -->
                      @if (!isFieldDisabled(field)) {
                        <button
                          type="button"
                          (click)="removeFile(field)"
                          class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      }
                    </div>
                  </div>
                } @else {
                  <label
                    class="h-[38px] flex items-center justify-between px-3 border border-dashed rounded-lg cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-400"
                    [ngClass]="{
                      'border-rose-300 bg-rose-50/50 hover:bg-rose-50': !!getFieldError(field.key),
                      'border-slate-300': !getFieldError(field.key),
                      'opacity-50 cursor-not-allowed': isFieldDisabled(field)
                    }"
                  >
                    <div class="flex items-center gap-2 text-slate-600 truncate">
                      <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span class="text-xs truncate text-slate-500">{{ field.placeholder || 'Choose File...' }}</span>
                    </div>
                    <span class="px-2.5 py-1 bg-white text-slate-700 text-[11px] font-semibold rounded border border-slate-200 shadow-2xs shrink-0">
                      Browse
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

            <!-- PHOTOS UPLOAD CONTROL (MIN 3 REQUIREMENT + THUMBNAILS + ADD MORE BUTTON) -->
            @else if (field.type === 'photos') {
              <div class="space-y-1.5">
                @let photosList = getPhotosList(field.key);

                <!-- Thumbnail gallery with Add Photo (+) Card -->
                <div class="p-2.5 bg-slate-50/70 border rounded-lg transition-all"
                  [ngClass]="{
                    'border-rose-400 bg-rose-50/30': !!getFieldError(field.key),
                    'border-slate-300': !getFieldError(field.key)
                  }"
                >
                  <div class="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200 text-xs">
                    <span class="text-slate-600 font-medium">
                      Upload Center Photos (JPG)
                    </span>
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors"
                      [ngClass]="photosList.length >= (field.minPhotos || 3) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                    >
                      @if (photosList.length >= (field.minPhotos || 3)) {
                        <svg class="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                      }
                      {{ photosList.length }} / {{ field.minPhotos || 3 }} min photos
                    </span>
                  </div>

                  <div class="flex items-center gap-3 flex-wrap pt-1">
                    @for (photo of photosList; track photo.id || photo.name; let pIdx = $index) {
                      <div class="relative group w-24 h-24 rounded-lg border border-slate-300 bg-white overflow-hidden shadow-2xs hover:shadow-xs transition-all shrink-0">
                        <img
                          [src]="photo.url"
                          [alt]="photo.name"
                          class="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                          (click)="previewPhoto(photo)"
                          [title]="photo.name + ' - Click to view'"
                        />
                        <div
                          class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
                        >
                          <span class="text-[10px] text-white font-medium px-2 py-0.5 bg-black/60 rounded">View</span>
                        </div>
                        @if (!isFieldDisabled(field)) {
                          <button
                            type="button"
                            (click)="removePhoto(field, pIdx)"
                            class="absolute top-1 right-1 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                            title="Remove Photo"
                          >
                            <span class="text-xs font-bold leading-none">&times;</span>
                          </button>
                        }
                        <span class="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[9px] font-medium text-center truncate px-1 py-0.5 select-none">
                          {{ 'Photo ' + (pIdx + 1) }}
                        </span>
                      </div>
                    }

                    <!-- Plus (+) Add More Photos Button / Card (Fixed dimensions & spacing to eliminate overlap) -->
                    @if (!isFieldDisabled(field)) {
                      <label
                        class="w-24 h-24 rounded-lg border-2 border-dashed border-sky-300 hover:border-[#0284c7] bg-sky-50/60 hover:bg-sky-50 text-[#0284c7] flex flex-col items-center justify-center p-2 cursor-pointer transition-all shadow-2xs shrink-0 active:scale-95 group select-none"
                        title="Upload JPG photo"
                      >
                        <div class="w-7 h-7 rounded-full bg-[#0284c7]/10 group-hover:bg-[#0284c7]/20 flex items-center justify-center transition-colors mb-1 shrink-0">
                          <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span class="text-[11px] font-bold tracking-tight text-center leading-tight block">
                          Add JPG Photo
                        </span>
                        <input
                          type="file"
                          [accept]="field.accept || '.jpg,.jpeg,image/jpeg'"
                          multiple
                          (change)="onPhotosUploaded(field, $event)"
                          class="hidden"
                        />
                      </label>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- STANDARD NATIVE INPUT (38px HEIGHT) -->
            @else {
              <div
                class="h-[38px] flex items-center border rounded-lg bg-white transition-all overflow-hidden hover:border-slate-400"
                [ngClass]="{
                  'border-red-500 bg-red-50/20 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100': !!getFieldError(field.key),
                  'border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100': !getFieldError(field.key),
                  'bg-slate-50 cursor-not-allowed border-slate-200': isFieldDisabled(field)
                }"
              >
                <!-- Prefix Tag -->
                @if (field.prefixText) {
                  <span class="inline-flex items-center h-full px-2.5 bg-slate-50 border-r border-slate-200 text-xs font-medium text-slate-500 select-none shrink-0">
                    {{ field.prefixText }}
                  </span>
                }

                <!-- Native Input -->
                <input
                  [id]="'input-' + field.key"
                  [type]="field.type || 'text'"
                  [value]="getValue(field.key)"
                  (input)="onNativeInput(field, $event)"
                  [placeholder]="getFieldPlaceholder(field) || ''"
                  [disabled]="isFieldDisabled(field)"
                  [readonly]="field.readonly"
                  [attr.min]="field.min != null ? field.min : null"
                  [attr.max]="field.max != null ? field.max : null"
                  [attr.step]="field.step != null ? field.step : null"
                  [attr.maxlength]="field.maxLength || null"
                  class="flex-1 w-full h-full px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent placeholder:normal-case"
                  [class.uppercase]="field.uppercase"
                  [class.cursor-not-allowed]="isFieldDisabled(field)"
                />

                <!-- Suffix Tag -->
                @if (field.suffixText) {
                  <span class="inline-flex items-center h-full px-2.5 bg-slate-50 border-l border-slate-200 text-xs font-medium text-slate-500 select-none shrink-0">
                    {{ field.suffixText }}
                  </span>
                }
              </div>
            }

            <!-- Validation Error Alert -->
            @if (getFieldError(field.key)) {
              <p class="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-0.5 m-0 leading-tight">
                <svg class="w-3 h-3 shrink-0 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ getFieldError(field.key) }}</span>
              </p>
            } @else if (field.hint) {
              <!-- Field Help Hint -->
              <p class="text-[11px] text-slate-400 mt-0.5 leading-tight m-0">
                {{ field.hint }}
              </p>
            }

          }
        </div>
      </ng-template>

      <!-- Reusable Document Preview Modal for Inspection -->
      <app-document-viewer-modal
        [isOpen]="isPreviewOpen"
        [doc]="activePreviewDoc"
        [title]="previewTitle"
        (close)="isPreviewOpen = false"
      ></app-document-viewer-modal>

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

  /** Default grid columns (1, 2, 3, or 4). Default is 4 for maximum information density */
  @Input() gridCols: 1 | 2 | 3 | 4 = 4;

  /** Form density: 'compact' (34px inputs) or 'normal' (42px inputs). Default is 'compact' */
  @Input() density: FormDensity = 'compact';

  /** Layout mode: 'unified' (single sleek master card), 'cards' (separate cards), or 'plain' (directly on page). Default is 'unified' */
  @Input() layout: FormLayoutMode = 'unified';

  /** Whether to enclose the form inside an elevated card container (default: true). Set to false for direct-on-page */
  @Input() card: boolean = true;

  /** Submit button text */
  @Input() submitLabel: string = 'Submit';

  /** Cancel button text */
  @Input() cancelLabel: string = 'Cancel';

  /** Save Draft button text */
  @Input() draftLabel: string = 'Save Draft';

  /** Visibility toggles for form actions */
  @Input() showSubmit: boolean = true;
  @Input() showCancel: boolean = false;
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
  @Output() fileView = new EventEmitter<{ field: FormFieldConfig; file: any }>();
  @Output() fileRemove = new EventEmitter<{ key: string }>();

  /** Document Preview Modal State */
  isPreviewOpen = false;
  previewTitle = 'Document Preview';
  activePreviewDoc: any = null;

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
    if (field.maxLength && typeof val === 'string' && val.length > field.maxLength) {
      val = val.slice(0, field.maxLength);
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

      let objectUrl: string | undefined;
      try {
        objectUrl = URL.createObjectURL(file);
      } catch {
        // fallback
      }

      const fileData = {
        fileName: file.name,
        fileSize: `${fileSizeMb.toFixed(2)} MB`,
        uploadDate: new Date().toLocaleDateString('en-GB'),
        uploadedAt: new Date().toISOString(),
        fileUrl: objectUrl
      };

      this.setValue(field.key, fileData, field);
      this.fileSelect.emit({
        key: field.key,
        file,
        name: file.name,
        size: `${fileSizeMb.toFixed(2)} MB`
      });
      input.value = '';
    }
  }

  /** Opens the document preview modal */
  viewFile(field: FormFieldConfig, fileVal: any): void {
    const fileName = this.getFileName(fileVal) || 'Document.jpg';
    const fileSize = typeof fileVal === 'object' && fileVal.fileSize ? fileVal.fileSize : '2.40 MB';
    const fileUrl = typeof fileVal === 'object' && fileVal.fileUrl ? fileVal.fileUrl : undefined;

    this.previewTitle = this.getFieldLabel(field) || 'Document Preview';
    this.activePreviewDoc = {
      fileName,
      fileSize,
      uploadDate: new Date().toLocaleDateString('en-GB'),
      status: 'uploaded',
      fileUrl
    };
    this.isPreviewOpen = true;
    this.fileView.emit({ field, file: fileVal });
  }

  /** Removes a chosen file */
  removeFile(field: FormFieldConfig): void {
    if (this.isFieldDisabled(field)) return;
    this.setValue(field.key, null, field);
    this.fileRemove.emit({ key: field.key });
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

  /** Helper to get photos list */
  getPhotosList(key: string): any[] {
    const val = this.getValue(key);
    return Array.isArray(val) ? val : [];
  }

  /** Upload multiple center photos */
  onPhotosUploaded(field: FormFieldConfig, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const currentList: any[] = [...this.getPhotosList(field.key)];
      const filesArray = Array.from(input.files);

      filesArray.forEach((file, index) => {
        const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
        let objectUrl: string;
        try {
          objectUrl = URL.createObjectURL(file);
        } catch {
          objectUrl = '';
        }

        const newPhoto = {
          id: 'photo-' + Date.now() + '-' + index,
          name: file.name,
          url: objectUrl,
          size: `${fileSizeMb} MB`,
          tag: `Photo ${currentList.length + 1}`
        };
        currentList.push(newPhoto);
      });

      this.setValue(field.key, currentList, field);
      input.value = '';
    }
  }

  /** Removes a photo from list */
  removePhoto(field: FormFieldConfig, index: number): void {
    if (this.isFieldDisabled(field)) return;
    const currentList: any[] = [...this.getPhotosList(field.key)];
    if (index >= 0 && index < currentList.length) {
      currentList.splice(index, 1);
      this.setValue(field.key, currentList, field);
    }
  }

  /** Preview photo in modal */
  previewPhoto(photo: any): void {
    this.previewTitle = photo.tag ? `${photo.tag} - ${photo.name}` : photo.name;
    this.activePreviewDoc = {
      fileName: photo.name,
      fileSize: photo.size || 'Image',
      fileUrl: photo.url,
      uploadDate: new Date().toLocaleDateString('en-GB')
    };
    this.isPreviewOpen = true;
  }

  /** Retrieves label as string, evaluating dynamic function if provided */
  getFieldLabel(field: FormFieldConfig): string {
    if (!field) return '';
    if (typeof field.label === 'function') {
      return (field.label as any)(this.model);
    }
    return field.label || '';
  }

  /** Retrieves placeholder as string, evaluating dynamic function if provided */
  getFieldPlaceholder(field: FormFieldConfig): string {
    if (!field) return '';
    if (typeof field.placeholder === 'function') {
      return (field.placeholder as any)(this.model);
    }
    return field.placeholder || '';
  }

  /** Determines the grid CSS layout for a container */
  getGridClass(cols: 1 | 2 | 3 | 4 = 4): string {
    switch (cols) {
      case 1:
        return 'grid grid-cols-1 gap-x-4 gap-y-3.5 text-xs';
      case 2:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 text-xs';
      case 3:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3.5 text-xs';
      case 4:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5 text-xs';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5 text-xs';
    }
  }

  /** Determines the col-span CSS class for an individual field */
  getFieldColClass(field: FormFieldConfig, containerCols: 1 | 2 | 3 | 4 = 4): string {
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
      if (field.colSpan === 3) return 'col-span-1 sm:col-span-2 lg:col-span-3';
      if (field.colSpan === 2) return 'col-span-1 sm:col-span-2 lg:col-span-2';
      return 'col-span-1';
    }

    return 'col-span-1';
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
        const isPhotosEmpty = field.type === 'photos' && (!Array.isArray(val) || val.length < (field.minPhotos || 3));
        const isEmpty =
          val == null ||
          val === '' ||
          (field.type === 'checkbox' && !val) ||
          (field.type === 'file' && !this.isNonEmptyFile(val)) ||
          isPhotosEmpty ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0);

        if (isEmpty) {
          if (field.type === 'photos' && Array.isArray(val) && val.length < (field.minPhotos || 3)) {
            this.internalErrors[field.key] = `Please upload at least ${field.minPhotos || 3} photos of the center`;
          } else {
            this.internalErrors[field.key] = field.requiredMessage || `${this.getFieldLabel(field)} is required`;
          }
          if (!firstErrorFieldKey) firstErrorFieldKey = field.key;
          continue;
        }
      }

      // Check minPhotos even if not strictly required, if some photos uploaded
      if (field.type === 'photos' && Array.isArray(val) && val.length > 0 && val.length < (field.minPhotos || 3)) {
        this.internalErrors[field.key] = `Please upload at least ${field.minPhotos || 3} photos of the center`;
        if (!firstErrorFieldKey) firstErrorFieldKey = field.key;
        continue;
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
          this.internalErrors[field.key] = field.patternMessage || `Invalid format for ${this.getFieldLabel(field)}`;
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

/** Universal Alias for generic usage across the app */
export { FormSdcComponent as DynamicFormComponent };
