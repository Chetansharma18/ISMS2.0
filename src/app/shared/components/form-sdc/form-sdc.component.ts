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
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import type { DropdownItem } from '../dropdown/dropdown.component';
import { InputDirective } from '../form-controls/input/input.directive';
import { FormInputComponent } from '../form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../form-controls/form-select/form-select.component';
import { ModalComponent } from '../modal/modal.component';
import { SwitchComponent } from '../switch/switch.component';
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
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent, InputDirective, ModalComponent, SwitchComponent, FormInputComponent, FormSelectComponent],
  template: `
    <div class="space-y-4 font-sans text-slate-800" >
      
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
            <app-icon name="info-filled" solid size="auto" class="w-3.5 h-3.5 shrink-0" />
            <span class="font-medium text-xs">{{ alertMessage }}</span>
          </div>
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            (click)="alertMessage = ''"
            aria-label="Dismiss"
          >
            <app-icon name="close" size="sm" />
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
                              <app-icon *ngSwitchCase="'building'" name="building" size="sm" [stroke]="2" />
                              <app-icon *ngSwitchCase="'location'" name="location-marker" size="sm" [stroke]="2" />
                              <app-icon *ngSwitchCase="'document'" name="document" size="sm" [stroke]="2" />
                              <app-icon *ngSwitchCase="'academic'" name="graduation-cap" size="sm" [stroke]="2" />
                              <app-icon *ngSwitchCase="'shield'" name="shield-check" size="sm" [stroke]="2" />
                              <app-icon *ngSwitchDefault name="list" size="sm" [stroke]="2" />
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
                            appButton
                            variant="ghost"
                            size="sm"
                            iconOnly
                            type="button"
                            (click)="section.collapsed = !section.collapsed"
                            aria-label="Toggle section"
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
                appButton
                variant="outline"
                type="button"
                (click)="onCancel()"
                class="w-full sm:w-auto"
              >
                {{ cancelLabel }}
              </button>
            }

            @if (showReset) {
              <button
                appButton
                variant="outline"
                type="button"
                (click)="onReset()"
                class="w-full sm:w-auto"
              >
                Reset
              </button>
            }

            @if (showDraft) {
              <button
                appButton
                variant="outline"
                type="button"
                (click)="onSaveDraft()"
                class="w-full sm:w-auto"
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
                  appButton
                  [variant]="action.variant && action.variant !== 'secondary' ? action.variant : 'outline'"
                  [loading]="!!action.loading"
                  type="button"
                  (click)="action.action(model)"
                  [disabled]="isActionDisabled(action)"
                  class="w-full sm:w-auto"
                >
                  <span>{{ action.label }}</span>
                </button>
              }
            }

            <!-- Transcluded form action slot -->
            <ng-content select="[form-actions]"></ng-content>

            <!-- Primary Submit Button -->
            @if (showSubmit) {
              <button
                appButton
                [loading]="submitLoading"
                type="submit"
                [disabled]="submitDisabled || submitLoading"
                class="w-full sm:w-auto"
              >
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
            <div class="pt-2 pb-1.5 border-b border-slate-200/80 col-span-full">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-3.5 bg-navy rounded-xs inline-block"></span>
                <h4 class="font-bold m-0" style="font-size: 13.5px !important; color: #0B3558 !important;">
                  {{ headingText(field) }}
                </h4>
              </div>
              @if (field.hint) {
                <p class="text-[11px] text-slate-500 mt-0.5 m-0">{{ field.hint }}</p>
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
                  <app-icon name="error-circle" solid size="auto" class="w-3 h-3 text-rose-600" />
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
              <app-switch
                [checked]="!!getValue(field.key)"
                [disabled]="isFieldDisabled(field)"
                [label]="getFieldLabel(field)"
                (toggled)="toggleSwitch(field)"
              />
            </div>
          } @else if (field.type === 'custom' && field.template) {
            <!-- Custom Template -->
            <ng-container *ngTemplateOutlet="field.template; context: { $implicit: field, model: model, value: getValue(field.key) }"></ng-container>
          } @else {

            <!-- Text-like fields and selects are the shared form controls (label, box, error and hint come with them),
                 so every form of the portal looks the same. -->
            @if (field.type === 'select') {
              <app-form-select
                [label]="getFieldLabel(field)"
                [required]="!!field.required"
                [items]="getDropdownOptions(field)"
                [value]="getSelectValue(field)"
                [placeholder]="getFieldPlaceholder(field) || 'Select an option'"
                [disabled]="isFieldDisabled(field)"
                [hint]="field.hint"
                [error]="getFieldError(field.key)"
                (valueChange)="onSelectChange(field, $event)"
              ></app-form-select>
            } @else if (usesFormInput(field)) {
              <app-form-input
                [label]="getFieldLabel(field)"
                [required]="!!field.required"
                [type]="inputType(field)"
                [value]="textValue(field)"
                [placeholder]="getFieldPlaceholder(field) || ''"
                [disabled]="isFieldDisabled(field)"
                [readonly]="!!field.readonly"
                [uppercase]="!!field.uppercase"
                [maxLength]="field.maxLength"
                [prefixText]="field.prefixText"
                [suffixText]="field.suffixText"
                [showCharCount]="!!field.showCharCount"
                [hint]="field.hint"
                [error]="getFieldError(field.key)"
                (valueChange)="onTextInput(field, $event)"
              ></app-form-input>
            } @else {
              <!-- Label row of the remaining kinds of field (they have no shared control) -->
              <div class="flex items-center justify-between gap-1">
                <label [for]="'input-' + field.key" class="block text-xs sm:text-[12.5px] font-medium leading-[18px] text-[#1F2933] select-none">
                  {{ getFieldLabel(field) }}
                  @if (field.required) {
                    <span class="text-rose-600 font-bold ml-0.5">*</span>
                  }
                </label>
              </div>
            }

            <!-- TEXTAREA -->
            @if (field.type === 'textarea') {
              <textarea
                appInput
                [id]="'input-' + field.key"
                [ngModel]="getValue(field.key)"
                (ngModelChange)="onValueChange(field, $event)"
                [placeholder]="getFieldPlaceholder(field) || ''"
                [rows]="field.rows || 2"
                [disabled]="isFieldDisabled(field)"
                [readonly]="field.readonly"
                [attr.maxlength]="field.maxLength || null"
                [invalid]="!!getFieldError(field.key)"
                class="w-full resize-none"
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
                      <app-icon name="document" [stroke]="2" class="shrink-0 text-slate-500" />
                      <span class="font-medium text-slate-800 truncate text-xs" [title]="getFileName(currentFile)">
                        {{ getFileName(currentFile) }}
                      </span>
                    </div>

                    <!-- Actions Toolbar: View & Delete -->
                    <div class="flex items-center gap-1.5 shrink-0">
                      <!-- View Button -->
                      <button
                        appButton
                        variant="secondary"
                        size="sm"
                        type="button"
                        (click)="viewFile(field, currentFile)"
                        title="View Document"
                      >
                        <app-icon name="eye" size="sm" />
                        <span>View</span>
                      </button>

                      <!-- Delete Button -->
                      @if (!isFieldDisabled(field)) {
                        <button
                          appButton
                          variant="danger"
                          size="sm"
                          type="button"
                          (click)="removeFile(field)"
                          title="Delete Document"
                        >
                          <app-icon name="trash" size="sm" />
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
                      <app-icon name="upload" [stroke]="2" class="text-slate-400 shrink-0" />
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
                        appButton
                        variant="danger"
                        size="xs"
                        iconOnly
                        type="button"
                        (click)="removePhotoFile(field, $event)"
                        class="absolute top-1.5 right-1.5 z-10"
                        title="Remove Photo"
                        aria-label="Remove Photo"
                      >
                        <app-icon name="close" size="xs" />
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
                        <app-icon name="user" size="auto" [stroke]="1.8" class="w-7 h-7" />
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
                        <app-icon name="check-filled" solid size="auto" class="w-3 h-3 text-emerald-600" />
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
                            appButton
                            variant="danger"
                            size="xs"
                            iconOnly
                            type="button"
                            (click)="removePhoto(field, pIdx); $event.stopPropagation()"
                            class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 z-10"
                            title="Remove Photo"
                            aria-label="Remove Photo"
                          >
                            <app-icon name="close" size="xs" />
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
                          <app-icon name="plus" [stroke]="2.5" />
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

            <!-- Validation error and hint of the fields that have no shared control (the shared controls show their own) -->
            @if (!usesFormControl(field)) {
              @if (getFieldError(field.key)) {
                <div class="form-error-text text-rose-600 font-medium flex items-center gap-1 mt-0.5 m-0 leading-tight" style="font-size: 11px !important; line-height: 14px !important;">
                  <app-icon name="error-circle" solid size="auto" class="w-3 h-3 text-rose-600" />
                  <span style="font-size: 11px !important; line-height: 14px !important;">{{ getFieldError(field.key) }}</span>
                </div>
              } @else if (field.hint) {
                <!-- Field Help Hint -->
                <p class="text-[11px] text-slate-400 mt-0.5 leading-tight m-0">
                  {{ field.hint }}
                </p>
              }
            }

          }
        </div>
      </ng-template>

      <!-- Full View Center Photo Lightbox Modal -->
      @if (activePhotoPreview(); as previewPhotoItem) {
        <app-modal
          [title]="previewPhotoItem.tag || previewPhotoItem.name || 'Center Photo Preview'"
          [subtitle]="(previewPhotoItem.name || '') + ' ' + (previewPhotoItem.size ? '• ' + previewPhotoItem.size : '')"
          size="xl"
          (close)="closePhotoPreview()"
        >
          <!-- Image View Body -->
          <div class="p-4 bg-slate-950 rounded-lg flex items-center justify-center overflow-auto max-h-[70vh]">
            <img
              [src]="previewPhotoItem.url"
              [alt]="previewPhotoItem.name"
              class="max-w-full max-h-[64vh] object-contain rounded-md shadow-2xl transition-all"
            />
          </div>
        </app-modal>
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

  /** A section heading in normal case ("Identity Details") even when the config wrote it in capitals. */
  headingText(field: FormFieldConfig): string {
    return this.getFieldLabel(field)
      .toLowerCase()
      .replace(/(^|[\s(/-])([a-z])/g, (_match, lead: string, letter: string) => lead + letter.toUpperCase());
  }

  /** Text-like fields (text, number, e-mail, date, time ...) are drawn with the shared form input. */
  usesFormInput(field: FormFieldConfig): boolean {
    return !field.type || ['text', 'number', 'email', 'password', 'tel', 'date', 'time', 'datetime-local'].includes(field.type);
  }

  /** Fields drawn with a shared control, which brings its own label, error and hint. */
  usesFormControl(field: FormFieldConfig): boolean {
    return field.type === 'select' || this.usesFormInput(field);
  }

  /** Type of the shared form input for a field. */
  inputType(field: FormFieldConfig): 'text' | 'email' | 'date' | 'time' | 'number' | 'tel' | 'password' {
    const type = field.type === 'datetime-local' ? 'text' : field.type;
    return (type ?? 'text') as 'text' | 'email' | 'date' | 'time' | 'number' | 'tel' | 'password';
  }

  /** Current value of a text-like field as the text the input shows. */
  textValue(field: FormFieldConfig): string {
    const value = this.getValue(field.key);
    return value === undefined || value === null ? '' : String(value);
  }

  /** Stores what was typed in a shared form input (numbers are stored as numbers). */
  onTextInput(field: FormFieldConfig, text: string): void {
    let value: any = text;
    if (field.type === 'number') {
      value = text === '' ? null : Number(text);
    } else if (field.maxLength && text.length > field.maxLength) {
      value = text.slice(0, field.maxLength);
    }
    this.setValue(field.key, value, field);
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

  /** Dropdown items per `field.options` array. Cached so the dropdown gets the same array on every change detection. */
  private readonly dropdownOptionCache = new WeakMap<FormOption[], DropdownItem[]>();
  private readonly noDropdownOptions: DropdownItem[] = [];

  /** Options of a select field in the shape <app-dropdown> takes (values are compared as strings). */
  getDropdownOptions(field: FormFieldConfig): DropdownItem[] {
    const opts = field.options;
    if (!opts) return this.noDropdownOptions;
    let items = this.dropdownOptionCache.get(opts);
    const unchanged =
      !!items &&
      items.length === opts.length &&
      items.every((it, i) => it.value === String(opts[i].value) && it.label === opts[i].label && !!it.disabled === !!opts[i].disabled);
    if (!items || !unchanged) {
      items = opts.map(o => ({ value: String(o.value), label: o.label, disabled: !!o.disabled }));
      this.dropdownOptionCache.set(opts, items);
    }
    return items;
  }

  /** Current value of a select field as the string the dropdown works with. */
  getSelectValue(field: FormFieldConfig): string {
    const val = this.getValue(field.key);
    return val === undefined || val === null ? '' : String(val);
  }

  /** Stores the option picked in the dropdown, keeping the option's original value type. */
  onSelectChange(field: FormFieldConfig, picked: string): void {
    const match = (field.options || []).find(o => String(o.value) === picked);
    if (!match || match.disabled) return;
    this.setValue(field.key, match.value, field);
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
