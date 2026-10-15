import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  TemplateRef,
  inject,
  HostListener
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
import { DocumentViewerService } from '../../../core/services/document-viewer.service';
import {
  appendPhotos,
  buildFileData,
  buildFilePreviewDoc,
  buildPhotoPreviewDoc,
  collectVisibleFields,
  fieldColClassFor,
  fileDisplayName,
  gridClassFor,
  isActionDisabledFor,
  isNonEmptyFile,
  readModelValue,
  resolveFlag,
  resolveText,
  validateFields,
  writeModelValue
} from './form-sdc.util';

@Component({
  selector: 'app-form-sdc, app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 font-sans text-slate-800" style="font-family: 'Inter', sans-serif;">
      
      <!-- Optional Form Header -->
      @if (title || subtitle) {
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            @if (title) {
              <h2 class="text-base sm:text-lg font-bold text-brand tracking-tight leading-snug m-0">
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
                        <span class="w-1.5 h-4 bg-primary rounded-full shrink-0"></span>
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
                    <span class="w-1.5 h-4 bg-primary rounded-full"></span>
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
                    'bg-primary hover:bg-primary-dark text-white': action.variant === 'primary',
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
                class="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
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
                  class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-primary cursor-pointer"
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
                <div class="form-error-text text-rose-600 font-medium flex items-center gap-1 mt-0.5 m-0 leading-tight" style="font-size: 11px !important; line-height: 14px !important;">
                  <svg class="shrink-0 text-rose-600" style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span style="font-size: 11px !important; line-height: 14px !important;">{{ getFieldError(field.key) }}</span>
                </div>
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
                [class.bg-primary]="!!getValue(field.key)"
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

            <!-- SELECT DROPDOWN (CUSTOM DOM-ANCHORED TO PREVENT DETACHMENT ON SCROLL) -->
            @if (field.type === 'select') {
              <div class="relative w-full" (click)="$event.stopPropagation()">
                <!-- Trigger Button -->
                <button
                  type="button"
                  [id]="'input-' + field.key"
                  (click)="toggleSelect(field.key, $event)"
                  [disabled]="isFieldDisabled(field)"
                  class="w-full h-[38px] px-3 text-xs bg-white border rounded-lg text-slate-800 transition-all focus:outline-none flex items-center justify-between cursor-pointer hover:border-slate-400 text-left"
                  [ngClass]="{
                    'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-100': !!getFieldError(field.key),
                    'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100': !getFieldError(field.key),
                    'bg-slate-50 cursor-not-allowed text-slate-400 border-slate-200': isFieldDisabled(field)
                  }"
                  [attr.aria-expanded]="openSelectKey() === field.key"
                >
                  <span class="truncate flex-1" [class.text-slate-400]="!getValue(field.key)">
                    {{ getSelectedOptionLabel(field) || getFieldPlaceholder(field) || 'Select an option' }}
                  </span>
                  <svg
                    class="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2"
                    [class.rotate-180]="openSelectKey() === field.key"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Custom Floating Menu (Anchored to trigger, scrolls with page, never jumps to screen 0,0) -->
                @if (openSelectKey() === field.key && !isFieldDisabled(field)) {
                  <div
                    class="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden min-w-full"
                    style="box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1);"
                  >
                    <!-- Search bar if > 6 options (e.g. 50 districts or educational qualifications) -->
                    @if ((field.options || []).length > 6) {
                      <div class="p-2 border-b border-slate-100 bg-slate-50/80">
                        <input
                          type="text"
                          [value]="searchSelectQuery()"
                          (input)="onSearchSelectInput($event)"
                          placeholder="Search..."
                          class="w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 placeholder:text-slate-400"
                          (click)="$event.stopPropagation()"
                          autofocus
                        />
                      </div>
                    }

                    <!-- Options List -->
                    <ul class="max-h-56 overflow-y-auto py-1 divide-y divide-slate-100/60 text-xs m-0 p-0 list-none">
                      @for (opt of getFilteredSelectOptions(field); track opt.value) {
                        <li
                          (click)="selectDropdownOption(field, opt, $event)"
                          class="px-3 py-2 cursor-pointer transition-colors flex items-center justify-between"
                          [class.bg-sky-50]="opt.value === getValue(field.key)"
                          [class.text-brand]="opt.value === getValue(field.key)"
                          [class.font-semibold]="opt.value === getValue(field.key)"
                          [class.hover:bg-slate-50]="opt.value !== getValue(field.key)"
                          [class.text-slate-700]="opt.value !== getValue(field.key)"
                          [class.opacity-50]="opt.disabled"
                          [class.pointer-events-none]="opt.disabled"
                        >
                          <span class="truncate">{{ opt.label }}</span>
                          @if (opt.value === getValue(field.key)) {
                            <svg class="w-4 h-4 text-brand shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          }
                        </li>
                      } @empty {
                        <li class="px-3 py-3 text-center text-xs text-slate-400">
                          No matching options found
                        </li>
                      }
                    </ul>
                  </div>
                }
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
                      class="h-3.5 w-3.5 border-slate-300 text-brand focus:ring-primary cursor-pointer"
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
                        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean hover:text-ocean-dark bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
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

            <!-- SINGLE PHOTO UPLOAD CONTROL (PASSPORT SIZE CARD PREVIEW WITH [X] REMOVE BUTTON) -->
            @else if (field.type === 'photo') {
              <div class="flex flex-col sm:flex-row sm:items-center gap-4 py-1">
                @let currentFile = getValue(field.key);
                <div
                  class="relative group w-36 h-44 rounded-xl border-2 transition-all overflow-hidden bg-white shadow-2xs shrink-0 flex items-center justify-center"
                  [ngClass]="{
                    'border-red-500 bg-red-50/20': !!getFieldError(field.key),
                    'border-dashed border-slate-300 hover:border-brand hover:bg-slate-50/60': !getFieldError(field.key) && !isNonEmptyFile(currentFile),
                    'border-solid border-slate-200': isNonEmptyFile(currentFile)
                  }"
                >
                  @if (isNonEmptyFile(currentFile)) {
                    <!-- Uploaded Image Preview -->
                    <img
                      [src]="getFileUrl(currentFile)"
                      [alt]="getFileName(currentFile) || 'Candidate Photo'"
                      class="w-full h-full object-cover cursor-pointer"
                      (click)="viewFile(field, currentFile)"
                      title="Click to view full image"
                    />

                    <!-- Top Right [X] Delete Button (Matching Screenshot 4) -->
                    @if (!isFieldDisabled(field)) {
                      <button
                        type="button"
                        (click)="removePhotoFile(field, $event)"
                        class="absolute top-1.5 right-1.5 w-6 h-6 bg-white/95 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300 hover:border-rose-300 rounded shadow-xs flex items-center justify-center transition-colors cursor-pointer z-10"
                        title="Remove Photo"
                        aria-label="Remove Photo"
                      >
                        <span class="text-sm font-bold leading-none select-none">&times;</span>
                      </button>
                    }

                    <!-- Hover Change Overlay -->
                    @if (!isFieldDisabled(field)) {
                      <label
                        class="absolute inset-x-0 bottom-0 bg-slate-900/80 py-1.5 text-center text-white text-[10.5px] font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                      >
                        Change Photo
                        <input
                          type="file"
                          [id]="'input-' + field.key"
                          [accept]="field.accept || 'image/*,.jpg,.jpeg,.png'"
                          [disabled]="isFieldDisabled(field)"
                          (change)="onFileChange(field, $event)"
                          class="hidden"
                        />
                      </label>
                    }
                  } @else {
                    <!-- Empty State: Avatar Silhouette & "Double click / click to Upload Image" (Matching Screenshot 4) -->
                    <label
                      class="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors"
                      [class.opacity-50]="isFieldDisabled(field)"
                      [class.cursor-not-allowed]="isFieldDisabled(field)"
                    >
                      <div class="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-sky-50 text-slate-400 group-hover:text-brand flex items-center justify-center mb-2 transition-colors">
                        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span class="text-[11px] text-slate-400 font-medium leading-tight select-none">
                        Double click to
                      </span>
                      <span class="text-xs font-bold text-slate-700 leading-tight select-none mt-0.5">
                        Upload Image
                      </span>
                      <span class="text-[10px] text-slate-400 leading-tight select-none mt-1">
                        JPG, PNG (Max {{ field.maxFileSizeMb || 5 }}MB)
                      </span>
                      <input
                        type="file"
                        [id]="'input-' + field.key"
                        [accept]="field.accept || 'image/*,.jpg,.jpeg,.png'"
                        [disabled]="isFieldDisabled(field)"
                        (change)="onFileChange(field, $event)"
                        class="hidden"
                      />
                    </label>
                  }
                </div>

                <!-- Info description alongside the passport box -->
                <div class="text-xs space-y-1 text-slate-500 max-w-sm">
                  <p class="font-semibold text-slate-800 m-0">Official Candidate Photograph</p>
                  <p class="text-[11.5px] leading-relaxed text-slate-500 m-0">
                    Upload a clear, recent passport-size photograph with white or light background.
                  </p>
                  <div class="flex items-center gap-2 pt-0.5 text-[11px] text-slate-500 font-medium">
                    <span class="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      JPG / PNG / JPEG
                    </span>
                    <span class="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      Max {{ field.maxFileSizeMb || 5 }} MB
                    </span>
                  </div>
                </div>
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
                      <div
                        class="relative group w-24 h-24 rounded-lg border border-slate-300 bg-white overflow-hidden shadow-2xs hover:shadow-xs transition-all shrink-0 cursor-pointer"
                        (click)="previewPhoto(photo)"
                        [title]="(photo.tag ? photo.tag + ' - ' : '') + photo.name + ' - Click to view full image'"
                      >
                        <img
                          [src]="photo.url"
                          [alt]="photo.name"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div
                          class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
                        >
                          <span class="text-[10px] text-white font-medium px-2 py-0.5 bg-black/60 rounded">View</span>
                        </div>
                        @if (!isFieldDisabled(field)) {
                          <button
                            type="button"
                            (click)="removePhoto(field, pIdx); $event.stopPropagation()"
                            class="absolute top-1 right-1 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer z-10"
                            title="Remove Photo"
                          >
                            <span class="text-xs font-bold leading-none">&times;</span>
                          </button>
                        }
                        <span class="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[9px] font-medium text-center truncate px-1 py-0.5 select-none pointer-events-none">
                          {{ photo.tag || ('Photo ' + (pIdx + 1)) }}
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
                  (change)="onNativeInput(field, $event)"
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
              <div class="form-error-text text-rose-600 font-medium flex items-center gap-1 mt-0.5 m-0 leading-tight" style="font-size: 11px !important; line-height: 14px !important;">
                <svg class="shrink-0 text-rose-600" style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span style="font-size: 11px !important; line-height: 14px !important;">{{ getFieldError(field.key) }}</span>
              </div>
            } @else if (field.hint) {
              <!-- Field Help Hint -->
              <p class="text-[11px] text-slate-400 mt-0.5 leading-tight m-0">
                {{ field.hint }}
              </p>
            }

          }
        </div>
      </ng-template>

      <!-- Full View Center Photo Lightbox Modal -->
      @if (activePhotoPreview(); as previewPhotoItem) {
        <div
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sdc-photo-fullview-title"
          (click)="closePhotoPreview()"
        >
          <div
            class="bg-white rounded-xl border border-slate-300 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
            <div class="px-5 py-3 border-b border-[#0d2843] bg-[#12365A] text-white flex items-center justify-between gap-3 shrink-0">
              <div class="truncate">
                <h3 id="sdc-photo-fullview-title" class="text-sm font-semibold text-white tracking-tight m-0 truncate" style="color: #ffffff !important;">
                  {{ previewPhotoItem.tag || previewPhotoItem.name || 'Center Photo Preview' }}
                </h3>
                <span class="text-[11px] text-white/80 font-normal" style="color: rgba(255,255,255,0.85) !important;">
                  {{ previewPhotoItem.name }} {{ previewPhotoItem.size ? '• ' + previewPhotoItem.size : '' }}
                </span>
              </div>
              <button
                type="button"
                (click)="closePhotoPreview()"
                class="w-8 h-8 rounded-full text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-lg leading-none select-none"
                title="Close"
              >
                &times;
              </button>
            </div>

            <!-- Image View Body -->
            <div class="p-4 bg-slate-950 flex items-center justify-center overflow-auto max-h-[80vh]">
              <img
                [src]="previewPhotoItem.url"
                [alt]="previewPhotoItem.name"
                class="max-w-full max-h-[74vh] object-contain rounded-md shadow-2xl transition-all"
              />
            </div>
          </div>
        </div>
      }

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

  private docViewer = inject(DocumentViewerService);

  /** Internal local validation errors map */
  internalErrors: Record<string, string> = {};

  /** Helper to read a value from the model, supporting dot-notation ('step1.sdcName') */
  getValue(key: string): any {
    return readModelValue(this.model, key);
  }

  /** Helper to set a value in the model, supporting dot-notation ('step1.sdcName') */
  setValue(key: string, value: any, field?: FormFieldConfig): void {
    if (!this.model) this.model = {};

    writeModelValue(this.model, key, value);

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
    return resolveFlag(field.visible, this.model, true);
  }

  /** Evaluates disabled state of a field */
  isFieldDisabled(field: FormFieldConfig): boolean {
    if (this.readOnly) return true;
    return resolveFlag(field.disabled, this.model, false);
  }

  /** Evaluates visibility of a section */
  isSectionVisible(section: FormSectionConfig): boolean {
    return resolveFlag(section.visible, this.model, true);
  }

  /** Evaluates visibility of an action */
  isActionVisible(action: FormActionConfig): boolean {
    return true;
  }

  /** Evaluates disabled state of an action */
  isActionDisabled(action: FormActionConfig): boolean {
    return isActionDisabledFor(action, this.model);
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

  /** Currently active open select dropdown field key */
  openSelectKey = signal<string | null>(null);

  /** Search query for filtering select options */
  searchSelectQuery = signal<string>('');

  /** Toggles select dropdown open/close */
  toggleSelect(key: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openSelectKey() === key) {
      this.openSelectKey.set(null);
    } else {
      this.openSelectKey.set(key);
      this.searchSelectQuery.set('');
    }
  }

  /** Selects an option from custom dropdown */
  selectDropdownOption(field: FormFieldConfig, opt: FormOption, event: MouseEvent): void {
    event.stopPropagation();
    if (opt.disabled) return;
    this.setValue(field.key, opt.value, field);
    this.openSelectKey.set(null);
  }

  /** Returns filtered options based on search query */
  getFilteredSelectOptions(field: FormFieldConfig): FormOption[] {
    const opts = field.options || [];
    const q = this.searchSelectQuery().trim().toLowerCase();
    if (!q) return opts;
    return opts.filter(o => (o.label || '').toLowerCase().includes(q));
  }

  /** Returns display label for selected value */
  getSelectedOptionLabel(field: FormFieldConfig): string {
    const val = this.getValue(field.key);
    if (val === undefined || val === null || val === '') return '';
    const match = (field.options || []).find(o => o.value === val);
    return match ? match.label : String(val);
  }

  /** Search input handler */
  onSearchSelectInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSelectQuery.set(target.value);
  }

  /** Closes select dropdown on document click */
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.openSelectKey()) {
      this.openSelectKey.set(null);
    }
  }

  /** Closes select dropdown on Escape key */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.openSelectKey()) {
      this.openSelectKey.set(null);
    }
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

      this.setValue(field.key, buildFileData(file), field);
      this.fileSelect.emit({
        key: field.key,
        file,
        name: file.name,
        size: `${fileSizeMb.toFixed(2)} MB`
      });
      input.value = '';
    }
  }

  /** Opens the document in another tab in Chrome */
  viewFile(field: FormFieldConfig, fileVal: any): void {
    const fileName = this.getFileName(fileVal) || 'Document.jpg';
    const label = this.getFieldLabel(field) || 'Document Preview';
    const previewDoc = buildFilePreviewDoc(fileName, fileVal);
    this.docViewer.openDocument(previewDoc, label);
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
    return isNonEmptyFile(val);
  }

  /** Helper to retrieve the file display name */
  getFileName(val: any): string {
    return fileDisplayName(val);
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
      const currentList = appendPhotos(this.getPhotosList(field.key), Array.from(input.files));
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

  /** Active photo being viewed in full-view modal */
  readonly activePhotoPreview = signal<any | null>(null);

  /** Preview photo in a full-view modal */
  previewPhoto(photo: any): void {
    if (!photo) return;
    this.activePhotoPreview.set(photo);
  }

  /** Closes the full-view photo modal */
  closePhotoPreview(): void {
    this.activePhotoPreview.set(null);
  }

  /** Close modal on Escape key press */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.activePhotoPreview()) {
      this.closePhotoPreview();
    }
  }

  /** Helper to get file URL (for image preview) */
  getFileUrl(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val.fileUrl || val.url || '';
  }

  /** Removes a photo file */
  removePhotoFile(field: FormFieldConfig, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.setValue(field.key, null, field);
    this.fileRemove.emit({ key: field.key });
  }

  /** Retrieves label as string, evaluating dynamic function if provided */
  getFieldLabel(field: FormFieldConfig): string {
    if (!field) return '';
    return resolveText(field.label, this.model);
  }

  /** Retrieves placeholder as string, evaluating dynamic function if provided */
  getFieldPlaceholder(field: FormFieldConfig): string {
    if (!field) return '';
    return resolveText(field.placeholder, this.model);
  }

  /** Determines the grid CSS layout for a container */
  getGridClass(cols: 1 | 2 | 3 | 4 = 4): string {
    return gridClassFor(cols);
  }

  /** Determines the col-span CSS class for an individual field */
  getFieldColClass(field: FormFieldConfig, containerCols: 1 | 2 | 3 | 4 = 4): string {
    return fieldColClassFor(field, containerCols);
  }

  /** Validates all active visible fields */
  validate(): boolean {
    const allFields = collectVisibleFields(this.sections, this.fields, this.model);
    const { errors, firstErrorKey } = validateFields(allFields, this.model);
    this.internalErrors = errors;

    // If errors exist, smoothly scroll to first error
    if (firstErrorKey) {
      const el = document.getElementById('field-' + firstErrorKey);
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
