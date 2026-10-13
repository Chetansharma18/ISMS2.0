import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableColumn } from '../../shared/components/table/table.types';
import { ActionModalComponent } from '../../shared/components/action-modal/action-modal.component';
import { DataEngineService } from '../../core/services/data-engine.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  DynamicFormBuilderItem,
  DynamicFormField,
  DynamicFormFieldType,
  FormStep
} from '../../core/models/admin-masters.model';

export type { DynamicFormBuilderItem, DynamicFormField, DynamicFormFieldType, FormStep };

interface FormBuilderFormData {
  id?: string;
  formType: string;
  isStepForm: boolean;
  status: 'Active' | 'Inactive';
  steps: FormStep[];
  fields: DynamicFormField[]; // For direct (non-step) form
}

@Component({
  selector: 'app-dynamic-form-builder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ActionModalComponent
  ],
  template: `
    <div class="w-full min-h-screen bg-white text-slate-800 font-sans p-4 sm:p-6 lg:p-8 space-y-6">

      <!-- Page Header -->
      <app-page-header title="Dynamic Form Builder">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                placeholder="Search by form name, step title, or field label..."
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add New Form Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-primary hover:bg-navy text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add new Form</span>
          </button>
        </div>
      </app-page-header>

      <!-- Forms Table -->
      <!-- Forms Table -->
      <app-table
        [rowClass]="getRowClass"
        [columns]="tableColumns"
        [data]="filteredForms()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="forms"
        emptyMessage="No dynamic forms found. Click '+ Add new Form' to create one."
        [customTemplates]="{
          formType: formTypeTemplate,
          actions: actionsTemplate
        }"
      >
      </app-table>

      <!-- Template: Form Type Column (Title + Step Form / Direct Form without background) -->
      <ng-template #formTypeTemplate let-item>
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-slate-800 text-[13.5px]">{{ item.formType }}</span>
          <div class="flex items-center gap-2">
            @if (item.isStepForm) {
              <span class="inline-flex items-center gap-1 text-[11.5px] font-semibold text-indigo-700">
                <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <span>Step Form ({{ item.steps?.length || 0 }} Steps)</span>
              </span>
            } @else {
              <span class="inline-flex items-center text-[11.5px] font-medium text-slate-500">
                Direct Form (Single Step)
              </span>
            }
          </div>
        </div>
      </ng-template>

      <!-- Template: Form Actions (View, Edit, Active/Inactive Toggle - matching other masters) -->
      <ng-template #actionsTemplate let-item>
        <div class="flex items-center justify-center whitespace-nowrap">
          <!-- View Button -->
          <button
            type="button"
            (click)="$event.stopPropagation(); openPreviewModal(item)"
            class="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="View Details"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </button>

          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>

          <!-- Edit Button -->
          <button
            type="button"
            (click)="$event.stopPropagation(); openEditModal(item)"
            class="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Edit"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>

          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>

          <!-- Active / Inactive Toggle -->
          <div class="inline-flex items-center gap-1.5" title="Toggle Status" (click)="$event.stopPropagation()">
            <button
              type="button"
              (click)="toggleStatus(item)"
              class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              [ngClass]="item.status === 'Inactive' ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-500 hover:bg-emerald-600'"
              role="switch"
              [attr.aria-checked]="item.status !== 'Inactive'"
            >
              <span class="sr-only">Toggle Active Status</span>
              <span
                class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                [ngClass]="item.status === 'Inactive' ? 'translate-x-0' : 'translate-x-3'"
              ></span>
            </button>
            <span
              class="font-medium text-[12px] select-none transition-colors cursor-pointer"
              (click)="toggleStatus(item)"
              [ngClass]="item.status === 'Inactive' ? 'text-slate-700 font-semibold hover:text-slate-900' : 'text-emerald-600 hover:text-emerald-700'"
            >
              {{ item.status === 'Inactive' ? 'Inactive' : 'Active' }}
            </span>
          </div>
        </div>
      </ng-template>

      <!-- Modal: Add / Edit Dynamic Form Builder -->
      <app-action-modal
        [isOpen]="showBuilderModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        [primaryLabel]="isEditing() ? 'Update Form' : 'Save Form'"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[840px]"
        (primaryAction)="submitForm()"
        (secondaryAction)="closeBuilderModal()"
        (close)="closeBuilderModal()"
      >
        <h2 class="m-0 text-navy" style="font-size: 19px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          {{ isEditing() ? 'Edit Dynamic Form' : 'Add new Form' }}
        </h2>
        <p class="mt-1 mb-4 text-xs text-slate-500">
          Configure form name, choose whether it's a step-form wizard, and design fields. Drag fields to reorder.
        </p>

        <div class="space-y-4 font-sans text-[13px]">
          <!-- 1. Form Name -->
          <div>
            <label class="block text-slate-700 font-semibold mb-1">
              Form Name*
            </label>
            <input
              type="text"
              [(ngModel)]="formData.formType"
              placeholder="e.g. Center Inspection Form, Candidate Verification Form"
              class="w-full px-3 py-2 border rounded-lg text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
              [class.border-red-500]="submitted() && !formData.formType.trim()"
            />
            @if (submitted() && !formData.formType.trim()) {
              <div class="text-xs text-red-500 mt-1 font-medium">Form Name is required</div>
            }
          </div>

          <!-- 2. Step Form (Yes / No) Tick Box & Toggle -->
          <div class="p-3.5 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="block text-xs font-bold text-slate-800">
                Step Form (Yes / No)?
              </span>
              <span class="text-[11px] text-slate-500">
                If Yes, you can add multiple steps with individual titles and step-wise form fields. If No, direct form fields will open.
              </span>
            </div>

            <!-- Modern Toggle Switch -->
            <label class="inline-flex items-center gap-2.5 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                [(ngModel)]="formData.isStepForm"
                (ngModelChange)="onStepFormToggle()"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span class="text-xs font-bold" [class.text-primary]="formData.isStepForm" [class.text-slate-500]="!formData.isStepForm">
                {{ formData.isStepForm ? 'Yes (Step Form)' : 'No (Direct Form)' }}
              </span>
            </label>
          </div>

          <!-- CASE A: STEP FORM ENABLED -->
          @if (formData.isStepForm) {
            <div class="space-y-4 pt-1">
              <!-- Steps Bar Header -->
              <div class="flex items-center justify-between pb-1 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-800 text-sm m-0">Form Steps</h3>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {{ formData.steps.length }} {{ formData.steps.length === 1 ? 'step' : 'steps' }}
                  </span>
                </div>

                <!-- Add Step Button -->
                <button
                  type="button"
                  (click)="addStep()"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Step</span>
                </button>
              </div>

              <!-- Steps Tabs Navigation -->
              <div class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
                @for (step of formData.steps; track step.id; let sIdx = $index) {
                  <div
                    (click)="activeStepIndex.set(sIdx)"
                    class="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all shrink-0 select-none"
                    [ngClass]="activeStepIndex() === sIdx
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'"
                  >
                    <span>Step {{ sIdx + 1 }}: {{ step.title || 'Untitled Step' }}</span>
                    <span class="text-[10.5px] opacity-80">({{ step.fields.length }} fields)</span>

                    <!-- Delete Step Button (if > 1 step) -->
                    @if (formData.steps.length > 1) {
                      <button
                        type="button"
                        (click)="deleteStep(sIdx, $event)"
                        class="p-0.5 rounded hover:bg-white/20 text-current transition-colors cursor-pointer"
                        title="Delete this step"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Active Step Content Area -->
              @if (getActiveStep(); as activeStep) {
                <div class="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
                  <!-- Active Step Title Input -->
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                      Step {{ activeStepIndex() + 1 }} Title*
                    </label>
                    <input
                      type="text"
                      [(ngModel)]="activeStep.title"
                      placeholder="e.g. Basic Information, Center Infrastructure, Documents"
                      class="w-full px-3 py-2 border rounded-md text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      [class.border-red-500]="submitted() && !activeStep.title.trim()"
                    />
                    @if (submitted() && !activeStep.title.trim()) {
                      <div class="text-[11px] text-red-500 mt-0.5 font-medium">Step title is required</div>
                    }
                  </div>

                  <!-- Step Fields Header -->
                  <div class="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span class="text-xs font-bold text-slate-800">
                      Fields for Step {{ activeStepIndex() + 1 }} ({{ activeStep.fields.length }})
                    </span>

                    <button
                      type="button"
                      (click)="addFieldToActiveStep()"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary hover:bg-navy text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Field to this Step</span>
                    </button>
                  </div>

                  <!-- Fields List for Active Step -->
                  @if (activeStep.fields.length === 0) {
                    <div class="p-6 border-2 border-dashed border-slate-200 rounded-lg text-center bg-white space-y-1">
                      <div class="text-xs font-semibold text-slate-600">No fields in this step yet</div>
                      <div class="text-[11px] text-slate-400">Click "+ Add Field to this Step" above to add fields.</div>
                    </div>
                  } @else {
                    <div class="space-y-3">
                      @for (field of activeStep.fields; track field.id; let fIdx = $index) {
                        <!-- Field Card Component (Reusable Markup) -->
                        <div
                          draggable="true"
                          (dragstart)="onStepDragStart(fIdx, $event)"
                          (dragover)="onStepDragOver(fIdx, $event)"
                          (dragleave)="onStepDragLeave(fIdx, $event)"
                          (drop)="onStepDrop(fIdx, $event)"
                          (dragend)="onStepDragEnd()"
                          class="p-3.5 rounded-lg border transition-all duration-150 relative bg-white"
                          [ngClass]="{
                            'border-primary bg-primary-light/30 shadow-md ring-2 ring-primary/20': dragOverIndex === fIdx,
                            'border-slate-200 shadow-2xs': dragOverIndex !== fIdx,
                            'opacity-50 border-dashed': draggedIndex === fIdx
                          }"
                        >
                          <!-- Field Card Top Bar -->
                          <div class="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100">
                            <div class="flex items-center gap-2">
                              <!-- Grip Handle -->
                              <div
                                class="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                title="Drag to reorder field"
                              >
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="8.5" cy="6" r="1.5" /><circle cx="15.5" cy="6" r="1.5" />
                                  <circle cx="8.5" cy="12" r="1.5" /><circle cx="15.5" cy="12" r="1.5" />
                                  <circle cx="8.5" cy="18" r="1.5" /><circle cx="15.5" cy="18" r="1.5" />
                                </svg>
                              </div>
                              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                                #{{ fIdx + 1 }}
                              </span>
                              <span class="text-xs font-semibold text-slate-700">
                                {{ field.label ? field.label : 'Untitled Field' }}
                              </span>
                            </div>

                            <!-- Move Up/Down + Delete Field -->
                            <div class="flex items-center gap-1">
                              <button
                                type="button"
                                (click)="moveStepFieldUp(fIdx)"
                                [disabled]="fIdx === 0"
                                class="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                title="Move up"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                (click)="moveStepFieldDown(fIdx)"
                                [disabled]="fIdx === activeStep.fields.length - 1"
                                class="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                title="Move down"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <div class="h-4 w-px bg-slate-200 mx-0.5"></div>
                              <button
                                type="button"
                                (click)="deleteStepField(fIdx)"
                                class="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete field"
                              >
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <!-- Field Inputs Grid -->
                          <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                            <div class="sm:col-span-6">
                              <label class="block text-xs font-semibold text-slate-700 mb-1">Label Name*</label>
                              <input
                                type="text"
                                [(ngModel)]="field.label"
                                placeholder="e.g. Center Address, Photo of Lab"
                                class="w-full px-2.5 py-1.5 border rounded-md text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                [class.border-red-500]="submitted() && !field.label.trim()"
                              />
                            </div>

                            <div class="sm:col-span-4">
                              <label class="block text-xs font-semibold text-slate-700 mb-1">Field Type*</label>
                              <select
                                [(ngModel)]="field.type"
                                (ngModelChange)="onFieldTypeChange(field)"
                                class="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-800 focus:outline-none focus:border-primary cursor-pointer"
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="datepicker">Date Picker</option>
                                <option value="dropdown">Dropdown List</option>
                                <option value="photo">Photo Upload</option>
                              </select>
                            </div>

                            <div class="sm:col-span-2 sm:pt-6">
                              <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                                <input
                                  type="checkbox"
                                  [(ngModel)]="field.mandatory"
                                  class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
                                />
                                <span>Mandatory</span>
                              </label>
                            </div>
                          </div>

                          <!-- Sub-options: Dropdown List -->
                          @if (field.type === 'dropdown') {
                            <div class="mt-3 p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
                              <label class="block text-xs font-semibold text-slate-700">Dropdown Options (comma-separated)*</label>
                              <input
                                type="text"
                                [(ngModel)]="field.optionsText"
                                (blur)="updateFieldOptions(field)"
                                placeholder="e.g. Option 1, Option 2, Option 3"
                                class="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-primary"
                              />
                            </div>
                          }

                          <!-- Sub-options: Photo Upload -->
                          @if (field.type === 'photo') {
                            <div class="mt-3 p-3 rounded-md bg-purple-50/50 border border-purple-200/70 space-y-2">
                              <div class="text-xs font-semibold text-purple-900">Photo Upload Constraints</div>
                              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label class="block text-[11px] font-semibold text-slate-700 mb-1">Min Photos*</label>
                                  <input type="number" min="1" [(ngModel)]="field.minPhotos" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-semibold text-slate-700 mb-1">Max Photos*</label>
                                  <input type="number" min="1" [(ngModel)]="field.maxPhotos" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-semibold text-slate-700 mb-1">Max Size (MB)*</label>
                                  <input type="number" min="1" [(ngModel)]="field.maxSizeMb" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-primary" />
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- CASE B: DIRECT FORM (SINGLE STEP) -->
          @if (!formData.isStepForm) {
            <div class="space-y-3 pt-1">
              <div class="flex items-center justify-between pb-1 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-800 text-sm m-0">Form Fields</h3>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-light text-brand">
                    {{ formData.fields.length }} {{ formData.fields.length === 1 ? 'field' : 'fields' }}
                  </span>
                </div>

                <button
                  type="button"
                  (click)="addField()"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-navy text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Field</span>
                </button>
              </div>

              <!-- Empty state for direct fields -->
              @if (formData.fields.length === 0) {
                <div class="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center bg-white space-y-2">
                  <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div class="text-sm font-semibold text-slate-700">No fields added yet</div>
                  <div class="text-xs text-slate-500 max-w-sm mx-auto">
                    Click the "+ Add Field" button above to add text, number, date picker, dropdown list, or photo upload fields.
                  </div>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (field of formData.fields; track field.id; let idx = $index) {
                    <div
                      draggable="true"
                      (dragstart)="onDragStart(idx, $event)"
                      (dragover)="onDragOver(idx, $event)"
                      (dragleave)="onDragLeave(idx, $event)"
                      (drop)="onDrop(idx, $event)"
                      (dragend)="onDragEnd()"
                      class="p-3.5 rounded-lg border transition-all duration-150 relative bg-white"
                      [ngClass]="{
                        'border-primary bg-primary-light/30 shadow-md ring-2 ring-primary/20': dragOverIndex === idx,
                        'border-slate-200 shadow-2xs': dragOverIndex !== idx,
                        'opacity-50 border-dashed': draggedIndex === idx
                      }"
                    >
                      <!-- Field Top Bar -->
                      <div class="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-200/80">
                        <div class="flex items-center gap-2">
                          <div
                            class="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Drag to reorder field"
                          >
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="8.5" cy="6" r="1.5" /><circle cx="15.5" cy="6" r="1.5" />
                              <circle cx="8.5" cy="12" r="1.5" /><circle cx="15.5" cy="12" r="1.5" />
                              <circle cx="8.5" cy="18" r="1.5" /><circle cx="15.5" cy="18" r="1.5" />
                            </svg>
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
                            type="button"
                            (click)="moveFieldUp(idx)"
                            [disabled]="idx === 0"
                            class="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Move field up"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            (click)="moveFieldDown(idx)"
                            [disabled]="idx === formData.fields.length - 1"
                            class="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Move field down"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div class="h-4 w-px bg-slate-200 mx-0.5"></div>
                          <button
                            type="button"
                            (click)="deleteField(idx)"
                            class="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete this field"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <!-- Field Inputs Grid -->
                      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                        <div class="sm:col-span-6">
                          <label class="block text-xs font-semibold text-slate-700 mb-1">Label Name*</label>
                          <input
                            type="text"
                            [(ngModel)]="field.label"
                            placeholder="e.g. Candidate Name, Center Photo"
                            class="w-full px-2.5 py-1.5 border rounded-md text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            [class.border-red-500]="submitted() && !field.label.trim()"
                          />
                        </div>

                        <div class="sm:col-span-4">
                          <label class="block text-xs font-semibold text-slate-700 mb-1">Field Type*</label>
                          <select
                            [(ngModel)]="field.type"
                            (ngModelChange)="onFieldTypeChange(field)"
                            class="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-800 focus:outline-none focus:border-primary cursor-pointer"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="datepicker">Date Picker</option>
                            <option value="dropdown">Dropdown List</option>
                            <option value="photo">Photo Upload</option>
                          </select>
                        </div>

                        <div class="sm:col-span-2 sm:pt-6">
                          <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              [(ngModel)]="field.mandatory"
                              class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary cursor-pointer accent-primary"
                            />
                            <span>Mandatory</span>
                          </label>
                        </div>
                      </div>

                      <!-- Conditional: Dropdown -->
                      @if (field.type === 'dropdown') {
                        <div class="mt-3 p-2.5 rounded-md bg-white border border-slate-200 space-y-1.5">
                          <label class="block text-xs font-semibold text-slate-700">Dropdown Options (comma-separated)*</label>
                          <input
                            type="text"
                            [(ngModel)]="field.optionsText"
                            (blur)="updateFieldOptions(field)"
                            placeholder="e.g. Option 1, Option 2, Option 3"
                            class="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                          />
                        </div>
                      }

                      <!-- Conditional: Photo -->
                      @if (field.type === 'photo') {
                        <div class="mt-3 p-3 rounded-md bg-purple-50/50 border border-purple-200/70 space-y-2">
                          <div class="text-xs font-semibold text-purple-900">Photo Upload Constraints</div>
                          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Min Photos*</label>
                              <input type="number" min="1" [(ngModel)]="field.minPhotos" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Max Photos*</label>
                              <input type="number" min="1" [(ngModel)]="field.maxPhotos" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Max Size (MB)*</label>
                              <input type="number" min="1" [(ngModel)]="field.maxSizeMb" class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-primary" />
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Form Global Warnings -->
          @if (submitted() && !hasAtLeastOneField()) {
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
              Please add at least one form field before saving.
            </div>
          }
        </div>
      </app-action-modal>

      <!-- Modal: Interactive Form Preview (matching Company Registration Form & Dynamic Forms) -->
      <app-action-modal
        [isOpen]="showPreviewModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="true"
        [showAccentBar]="false"
        primaryLabel=""
        secondaryLabel=""
        [maxWidthClass]="getPreviewModalMaxWidth()"
        (close)="closePreviewModal()"
      >
        @if (selectedPreviewForm(); as form) {
          <!-- CASE 0: APPLY FOR EOI 2-STEP FORM (MATCHING IMAGES 1, 2, 3) -->
          @if (isApplyEoiForm(form)) {
            <div class="font-sans text-slate-800 space-y-4">
              <!-- Stepper Header Matching Screenshots (Image 1, 2, 3) -->
              <div class="bg-white border border-slate-200 rounded-xl px-4 py-3 sm:px-6 shadow-2xs">
                <div class="flex items-center justify-between overflow-x-auto no-scrollbar py-1 gap-2 text-xs">
                  
                  <!-- Step 1: Processing Fee (Completed) -->
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span class="font-bold text-slate-700 text-xs">1. Processing Fee</span>
                    <div class="w-6 sm:w-12 h-0.5 bg-emerald-500 ml-1"></div>
                  </div>

                  <!-- Step 2: OTR Profile -->
                  <div class="flex items-center gap-2 shrink-0 cursor-pointer" (click)="applyEoiStep.set(1)">
                    @if (applyEoiStep() === 1) {
                      <span class="w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-[11px] font-bold shadow-xs">2</span>
                      <span class="font-bold text-navy text-xs">2. OTR Profile</span>
                    } @else {
                      <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span class="font-medium text-slate-700 text-xs">2. OTR Profile</span>
                    }
                    <div class="w-6 sm:w-12 h-0.5 ml-1" [ngClass]="applyEoiStep() === 2 ? 'bg-emerald-500' : 'bg-slate-200'"></div>
                  </div>

                  <!-- Step 3: Upload Documents -->
                  <div class="flex items-center gap-2 shrink-0 cursor-pointer" (click)="applyEoiStep.set(2)">
                    @if (applyEoiStep() === 2) {
                      <span class="w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-[11px] font-bold shadow-xs">3</span>
                      <span class="font-bold text-navy text-xs">3. Upload Documents</span>
                    } @else {
                      <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center text-[11px] font-bold">3</span>
                      <span class="font-medium text-slate-500 text-xs">3. Upload Documents</span>
                    }
                    <div class="w-6 sm:w-12 h-0.5 bg-slate-200 ml-1"></div>
                  </div>

                  <!-- Step 4: Complete Preview -->
                  <div class="flex items-center gap-2 shrink-0 opacity-60">
                    <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-[11px] font-bold">4</span>
                    <span class="font-medium text-slate-400 text-xs">4. Complete Preview</span>
                    <div class="w-6 sm:w-12 h-0.5 bg-slate-200 ml-1"></div>
                  </div>

                  <!-- Step 5: EMD Payment -->
                  <div class="flex items-center gap-2 shrink-0 opacity-60">
                    <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-[11px] font-bold">5</span>
                    <span class="font-medium text-slate-400 text-xs">5. EMD Payment</span>
                    <div class="w-6 sm:w-12 h-0.5 bg-slate-200 ml-1"></div>
                  </div>

                  <!-- Step 6: Submission Receipt -->
                  <div class="flex items-center gap-2 shrink-0 opacity-60">
                    <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-[11px] font-bold">6</span>
                    <span class="font-medium text-slate-400 text-xs">6. Submission Receipt</span>
                  </div>

                </div>
              </div>

              <!-- Top Back Button -->
              <div class="flex items-center justify-between">
                <button
                  type="button"
                  (click)="applyEoiStep() === 2 ? applyEoiStep.set(1) : closePreviewModal()"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>

                <div class="text-xs text-slate-500 font-medium">
                  Step {{ applyEoiStep() }} of 2: <strong class="text-slate-800">{{ applyEoiStep() === 1 ? 'OTR Profile' : 'Upload Documents' }}</strong>
                </div>
              </div>

              <!-- Scrollable Container for Step Contents -->
              <div class="max-h-[66vh] overflow-y-auto pr-1 sm:pr-2">
                @if (applyEoiStep() === 1) {
                  <!-- STEP 1: OTR PROFILE (Matching Image 1 & 2) -->
                  <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs space-y-8">
                    
                    <!-- SECTION 1: Company Particulars & Registration Details -->
                    <div class="space-y-4">
                      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                        <h4 class="text-xs sm:text-sm font-bold text-navy uppercase tracking-wide m-0">
                          1. COMPANY PARTICULARS &amp; REGISTRATION DETAILS
                        </h4>
                        <span class="text-xs text-slate-500 font-mono font-semibold">
                          CIN: {{ previewFormValues['eoi-otr-4'] || 'U80302RJ2022NPL079811' }}
                        </span>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">NAME (SHORT NAME)</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-1']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div class="sm:col-span-2">
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">FULL NAME OF ORGANIZATION</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-2']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">NATURE OF ENTITY</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-3']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">REGISTRATION NUMBER (CIN)</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-4']" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">DATE OF REGISTRATION</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-5']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">STATE / UT OF REGISTRATION</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-6']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">COMPANY PAN</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-7']" class="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">GST REGISTERED</label>
                          <select [(ngModel)]="previewFormValues['eoi-otr-8']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy">
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">GSTIN</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-9']" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">MSME / UDYAM REGISTERED</label>
                          <select [(ngModel)]="previewFormValues['eoi-otr-10']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy">
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">UDYAM REGISTRATION NO.</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-11']" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">NSDC PARTNER STATUS</label>
                          <select [(ngModel)]="previewFormValues['eoi-otr-12']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy">
                            <option value="Approved">Approved</option>
                            <option value="Applied">Applied</option>
                            <option value="Not Applicable">Not Applicable</option>
                          </select>
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">COMPANY CONTACT NO.</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-13']" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">COMPANY EMAIL-ID</label>
                          <input type="email" [(ngModel)]="previewFormValues['eoi-otr-14']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">WEBSITE</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-15']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div class="sm:col-span-2 lg:col-span-3">
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">REGISTERED ADDRESS</label>
                          <textarea [(ngModel)]="previewFormValues['eoi-otr-16']" rows="2" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy"></textarea>
                        </div>

                        <div class="sm:col-span-2 lg:col-span-3">
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">OFFICE ADDRESS</label>
                          <textarea [(ngModel)]="previewFormValues['eoi-otr-17']" rows="2" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy"></textarea>
                        </div>
                      </div>

                      <!-- Attached Registration Documents -->
                      <div class="pt-3 border-t border-slate-100">
                        <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
                          ATTACHED REGISTRATION DOCUMENTS
                        </span>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          @for (doc of otrRegDocs; track doc.key) {
                            <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                                <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                                  <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                                  <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                                </svg>
                                <div class="flex flex-col min-w-0">
                                  <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">{{ doc.label }}</span>
                                  <span class="font-medium text-slate-800 truncate text-xs">{{ doc.fileName }}</span>
                                  <div class="mt-0.5">
                                    <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                      {{ doc.fileSize }}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div class="flex items-center gap-1.5 shrink-0">
                                <button type="button" (click)="viewApplyDoc(doc.fileName)" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded cursor-pointer">
                                  <span>View</span>
                                </button>
                                <button type="button" (click)="changeOtrDoc(doc)" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer">
                                  <span>Change</span>
                                </button>
                                <button type="button" (click)="removeOtrDoc(doc)" class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded cursor-pointer">
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- SECTION 2: Authorized Signatory / Person Details -->
                    <div class="space-y-4 pt-6 border-t border-slate-200">
                      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                        <h4 class="text-xs sm:text-sm font-bold text-navy uppercase tracking-wide m-0">
                          2. AUTHORIZED SIGNATORY / PERSON DETAILS
                        </h4>
                        <span class="text-xs text-slate-500 font-semibold">Designated Signatory</span>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">FULL NAME</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-19']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">DESIGNATION</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-20']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">DATE OF BIRTH / AGE</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-21']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">OFFICIAL MOBILE NO.</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-22']" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">OFFICIAL EMAIL-ID</label>
                          <input type="email" [(ngModel)]="previewFormValues['eoi-otr-23']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">PAN</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-24']" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">AADHAAR NUMBER</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-25']" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">STATE</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-26']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div class="sm:col-span-2 lg:col-span-4">
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">RESIDENCE ADDRESS</label>
                          <textarea [(ngModel)]="previewFormValues['eoi-otr-27']" rows="2" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy"></textarea>
                        </div>
                      </div>

                      <!-- Attached Signatory Documents -->
                      <div class="pt-3 border-t border-slate-100">
                        <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
                          ATTACHED SIGNATORY DOCUMENTS
                        </span>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          @for (doc of otrSigDocs; track doc.key) {
                            <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                                <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                                  <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                                  <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                                </svg>
                                <div class="flex flex-col min-w-0">
                                  <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">{{ doc.label }}</span>
                                  <span class="font-medium text-slate-800 truncate text-xs">{{ doc.fileName }}</span>
                                  <div class="mt-0.5">
                                    <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                      {{ doc.fileSize }}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div class="flex items-center gap-1.5 shrink-0">
                                <button type="button" (click)="viewApplyDoc(doc.fileName)" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded cursor-pointer">
                                  <span>View</span>
                                </button>
                                <button type="button" (click)="changeOtrDoc(doc)" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer">
                                  <span>Change</span>
                                </button>
                                <button type="button" (click)="removeOtrDoc(doc)" class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded cursor-pointer">
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- SECTION 3: Bank Account Details -->
                    <div class="space-y-4 pt-6 border-t border-slate-200">
                      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                        <h4 class="text-xs sm:text-sm font-bold text-navy uppercase tracking-wide m-0">
                          3. BANK ACCOUNT DETAILS
                        </h4>
                        <span class="text-xs text-slate-500 font-mono font-semibold">
                          IFSC: {{ previewFormValues['eoi-otr-34'] || 'SBIN0001234' }}
                        </span>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">BANK NAME</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-29']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">BRANCH NAME</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-30']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">ACCOUNT TYPE</label>
                          <select [(ngModel)]="previewFormValues['eoi-otr-31']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy">
                            <option value="Current Account">Current</option>
                            <option value="Savings Account">Savings</option>
                          </select>
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">ACCOUNT HOLDER NAME</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-32']" class="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">ACCOUNT NUMBER</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-33']" class="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">IFSC CODE</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-34']" class="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>

                        <div>
                          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">TRANSFER MODE</label>
                          <input type="text" [(ngModel)]="previewFormValues['eoi-otr-35']" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy" />
                        </div>
                      </div>

                      <!-- Cancelled Cheque / Passbook -->
                      <div class="pt-3 border-t border-slate-100">
                        <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
                          ATTACHED DOCUMENTS
                        </span>
                        <div class="max-w-md p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs text-xs">
                          <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                              <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                              <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                            </svg>
                            <div class="flex flex-col min-w-0">
                              <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">CANCELLED CHEQUE / PASSBOOK</span>
                              <span class="font-medium text-slate-800 truncate text-xs">{{ otrBankDoc.fileName }}</span>
                              <div class="mt-0.5">
                                <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                  {{ otrBankDoc.fileSize }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" (click)="viewApplyDoc(otrBankDoc.fileName)" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded cursor-pointer">
                              <span>View</span>
                            </button>
                            <button type="button" (click)="changeOtrDoc(otrBankDoc)" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer">
                              <span>Change</span>
                            </button>
                            <button type="button" (click)="removeOtrDoc(otrBankDoc)" class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded cursor-pointer">
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <!-- Action Footer for Step 1 -->
                  <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <button
                      type="button"
                      (click)="closePreviewModal()"
                      class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      &larr; Back to Processing Fee
                    </button>

                    <button
                      type="button"
                      (click)="applyEoiStep.set(2)"
                      class="px-5 py-2.5 bg-navy hover:bg-[#163355] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <span>Proceed to Upload Documents</span>
                      <span>&rarr;</span>
                    </button>
                  </div>

                } @else {
                  <!-- STEP 2: UPLOAD DOCUMENTS (Matching Image 3) -->
                  <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs space-y-6">
                    
                    <!-- Header Strip with "Attach All Mandated Annexures" -->
                    <div class="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <h3 class="text-sm sm:text-base font-bold text-navy tracking-tight m-0">
                          Mandatory EOI Proposal Documents Checklist (16 Documents)
                        </h3>
                        <p class="text-xs text-slate-500 mt-1 mb-0">
                          Separated into Mandatory Statutory Documents, Official Scheme Annexures, and Supporting Documents.
                        </p>
                      </div>

                      <button
                        type="button"
                        (click)="attachAllApplyMandatedAnnexures()"
                        class="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <span>Attach All Mandated Annexures</span>
                      </button>
                    </div>

                    <!-- Filter Tabs matching Image 3 -->
                    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
                      <button
                        type="button"
                        (click)="selectedApplyDocTab.set('all')"
                        class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0"
                        [ngClass]="selectedApplyDocTab() === 'all' ? 'bg-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                      >
                        All Documents (16)
                      </button>

                      <button
                        type="button"
                        (click)="selectedApplyDocTab.set('mandatory')"
                        class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                        [ngClass]="selectedApplyDocTab() === 'mandatory' ? 'bg-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                      >
                        <span>1. Mandatory Statutory Documents</span>
                        <span class="text-[10px] px-1.5 py-0.2 rounded" [ngClass]="selectedApplyDocTab() === 'mandatory' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 font-bold'">
                          {{ getApplyMandatoryUploadedCount() }}/6
                        </span>
                      </button>

                      <button
                        type="button"
                        (click)="selectedApplyDocTab.set('annexure')"
                        class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                        [ngClass]="selectedApplyDocTab() === 'annexure' ? 'bg-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                      >
                        <span>2. Scheme Annexures</span>
                        <span class="text-[10px] px-1.5 py-0.2 rounded" [ngClass]="selectedApplyDocTab() === 'annexure' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700 font-bold'">
                          {{ getApplyAnnexureUploadedCount() }}/8
                        </span>
                      </button>

                      <button
                        type="button"
                        (click)="selectedApplyDocTab.set('remaining')"
                        class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                        [ngClass]="selectedApplyDocTab() === 'remaining' ? 'bg-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                      >
                        <span>3. Remaining Documents</span>
                        <span class="text-[10px] px-1.5 py-0.2 rounded" [ngClass]="selectedApplyDocTab() === 'remaining' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 font-bold'">
                          {{ getApplyRemainingUploadedCount() }}/2
                        </span>
                      </button>
                    </div>

                    <!-- 16 Document Cards Grid (Image 3) -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
                      @for (doc of getFilteredApplyDocs(); track doc.id) {
                        <div class="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs shadow-2xs">
                          <div class="flex items-start gap-2.5 min-w-0">
                            <span
                              class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                              [ngClass]="{
                                'bg-rose-100 text-rose-700 border border-rose-200': doc.category === 'mandatory',
                                'bg-sky-100 text-sky-700 border border-sky-200': doc.category === 'annexure',
                                'bg-slate-100 text-slate-700 border border-slate-200': doc.category === 'remaining'
                              }"
                            >
                              {{ doc.id }}
                            </span>

                            <div class="min-w-0">
                              <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="font-bold text-slate-800 text-xs leading-tight">
                                  {{ doc.name }}
                                </span>
                                @if (doc.category === 'mandatory') {
                                  <span class="text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                                    Mandatory
                                  </span>
                                } @else if (doc.category === 'annexure') {
                                  <span class="text-[9.5px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                                    Annexure
                                  </span>
                                } @else {
                                  <span class="text-[9.5px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                    Supporting
                                  </span>
                                }
                              </div>

                              @if (doc.uploadedFile) {
                                <div class="flex items-center gap-2 mt-1 text-[11px] text-emerald-700 font-medium">
                                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span class="truncate max-w-[220px]">{{ doc.uploadedFile }}</span>
                                  <span class="text-slate-400">({{ doc.uploadedSize || '1.8 MB' }})</span>
                                </div>
                              }
                            </div>
                          </div>

                          <div class="shrink-0 flex items-center gap-1.5">
                            @if (!doc.uploadedFile) {
                              <button
                                type="button"
                                (click)="uploadApplyDoc(doc.id)"
                                class="px-3 py-1.5 bg-navy hover:bg-[#163355] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                              >
                                Upload PDF
                              </button>
                            } @else {
                              <button
                                type="button"
                                (click)="uploadApplyDoc(doc.id)"
                                class="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                (click)="removeApplyDoc(doc.id)"
                                class="px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded cursor-pointer"
                              >
                                Remove
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>

                  </div>

                  <!-- Action Footer for Step 2 -->
                  <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <button
                      type="button"
                      (click)="applyEoiStep.set(1)"
                      class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      &larr; Back to OTR Profile
                    </button>

                    <button
                      type="button"
                      (click)="submitApplyEoi()"
                      class="px-5 py-2.5 bg-navy hover:bg-[#163355] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <span>Proceed to Complete Preview</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                }
              </div>
            </div>
          } @else if (isEoiForm(form)) {
            <div class="font-sans text-slate-800">
              <!-- Header -->
              <h2 class="m-0 text-navy font-bold text-lg sm:text-[19px] tracking-tight">
                Configure New EOI
              </h2>

              <!-- Form Body (scrollable as shown in Image 1 and 2) -->
              <div class="mt-4 font-sans text-[13px] max-h-[64vh] overflow-y-auto overflow-x-hidden pr-1 sm:pr-3 space-y-3.5">
                <div class="grid grid-cols-1 sm:grid-cols-[180px_1fr] md:grid-cols-[200px_1fr] items-start sm:items-center gap-y-3.5 gap-x-4">
                  <!-- 1. EOI Reference No.* -->
                  <label class="text-slate-700 font-medium text-xs sm:text-[13px]">EOI Reference No.*</label>
                  <input
                    type="text"
                    maxlength="100"
                    [(ngModel)]="previewFormValues['eoi-1']"
                    class="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-slate-800 text-xs shadow-2xs"
                  />

                  <!-- 2. Scheme* -->
                  <label class="text-slate-700 font-medium text-xs sm:text-[13px]">Scheme*</label>
                  <div class="relative w-full">
                    <select
                      [(ngModel)]="previewFormValues['eoi-2']"
                      (ngModelChange)="onEoiSchemeChange($event)"
                      class="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-slate-800 bg-white text-xs cursor-pointer shadow-2xs appearance-none pr-8"
                    >
                      <option value="" disabled>-- Select Scheme --</option>
                      <option value="Vishwakarma Yuva Udyami Protsahan Yojana">Vishwakarma Yuva Udyami Protsahan Yojana</option>
                      <option value="Mukhyamantri Yuva Swarojgar Yojana (2026)">Mukhyamantri Yuva Swarojgar Yojana (2026)</option>
                      <option value="Mukhyamantri Yuva Sambal Yojana">Mukhyamantri Yuva Sambal Yojana</option>
                      <option value="Mukhya Mantri Yuva Kaushal Yojana">Mukhya Mantri Yuva Kaushal Yojana</option>
                    </select>
                    <svg class="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <!-- 3. Scheme Category -->
                  <label class="text-slate-700 font-medium text-xs sm:text-[13px]">Scheme Category</label>
                  <div class="relative w-full">
                    <select
                      [(ngModel)]="previewFormValues['eoi-3']"
                      class="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-slate-800 bg-white text-xs cursor-pointer shadow-2xs appearance-none pr-8"
                    >
                      <option value="">-- Select Scheme Category --</option>
                      <option value="Rajvik">Rajvik</option>
                      <option value="samarth">samarth</option>
                      <option value="saksham">saksham</option>
                      <option value="na">na</option>
                      <option value="ALL">ALL</option>
                    </select>
                    <svg class="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <!-- 4. Date of EoI Published* -->
                  <label class="text-slate-700 font-medium text-xs sm:text-[13px]">Date of EoI Published*</label>
                  <input
                    type="text"
                    [(ngModel)]="previewFormValues['eoi-4']"
                    placeholder="10 / 13 / 2026"
                    class="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-slate-800 text-xs shadow-2xs"
                  />

                  <!-- 5. Last Date of EoI Submission* -->
                  <label class="text-slate-700 font-medium text-xs sm:text-[13px]">Last Date of EoI Submission*</label>
                  <input
                    type="text"
                    [(ngModel)]="previewFormValues['eoi-5']"
                    placeholder="10 / 13 / 2026"
                    class="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-slate-800 text-xs shadow-2xs"
                  />

                  <!-- 6. EOI Category* -->
                  <label class="text-slate-700 font-medium text-xs sm:text-[13px]">EOI Category*</label>
                  <div class="relative w-full">
                    <select
                      [(ngModel)]="previewFormValues['eoi-6']"
                      class="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-slate-800 bg-white text-xs cursor-pointer shadow-2xs appearance-none pr-8"
                    >
                      <option value="" disabled>-- Select EOI Category --</option>
                      <option value="General">General</option>
                      <option value="Special">Special</option>
                    </select>
                    <svg class="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <!-- 7. EOI Description -->
                  <label class="text-slate-700 font-medium text-xs sm:text-[13px]">EOI Description</label>
                  <input
                    type="text"
                    maxlength="100"
                    [(ngModel)]="previewFormValues['eoi-7']"
                    class="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-slate-800 text-xs shadow-2xs"
                  />

                  <!-- 8. EMD Fee* -->
                  <label class="text-slate-700 font-medium text-xs sm:text-[13px]">EMD Fee*</label>
                  <input
                    type="text"
                    maxlength="100"
                    [(ngModel)]="previewFormValues['eoi-8']"
                    class="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-slate-800 text-xs shadow-2xs"
                  />

                  <!-- 9. Process Fee* -->
                  <label class="text-slate-700 font-medium text-xs sm:text-[13px]">Process Fee*</label>
                  <input
                    type="text"
                    maxlength="100"
                    [(ngModel)]="previewFormValues['eoi-9']"
                    class="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-slate-800 text-xs shadow-2xs"
                  />

                  <!-- 10. Attach File* -->
                  <label class="text-slate-700 font-medium text-xs sm:text-[13px] self-start pt-1">Attach File*</label>
                  <div class="space-y-2 overflow-hidden w-full">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="simulateFileUpload({ id: 'eoi-10', label: 'EOI Proposal File', type: 'photo', mandatory: true })"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#0e2138] text-[#0e2138] hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                      >
                        <svg class="w-4 h-4 transform -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span>+ Attach Document</span>
                      </button>
                      <span class="text-[11px] text-slate-500 font-medium whitespace-nowrap">(Max file size: 25 MB)</span>
                      @if (uploadedFiles['eoi-10']) {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{{ uploadedFiles['eoi-10'] }}</span>
                          <button
                            type="button"
                            (click)="removeUploadedFile('eoi-10', $event)"
                            class="text-emerald-700 hover:text-emerald-900 ml-1 cursor-pointer"
                          >✕</button>
                        </span>
                      }
                    </div>
                  </div>
                </div>

                <!-- 11. EOI DOCUMENTS SECTION (From Image 1 & Image 2) -->
                <div class="mt-4 pt-3 border-t border-slate-200">
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <h3 class="text-[#0e2138] font-bold text-xs uppercase tracking-wide m-0">EOI DOCUMENTS</h3>
                      <p class="text-[11px] text-slate-500 mt-0.5 mb-0">Required documents for proposal upload (Upload PDF, image, or TXT - max 25 MB)</p>
                    </div>
                    <button
                      type="button"
                      (click)="addEoiDocumentRow()"
                      class="w-6 h-6 rounded-full bg-[#0e2138] text-white flex items-center justify-center hover:bg-[#163355] transition-colors shadow-2xs cursor-pointer"
                      title="Add Document"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  @if (eoiDocumentRows.length === 0) {
                    <div class="p-4 border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500 italic bg-white">
                      Select a scheme above to automatically load required documents from Doc Master, or click + to add manually.
                    </div>
                  } @else {
                    <div class="space-y-2 mt-2">
                      @for (row of eoiDocumentRows; track $index; let idx = $index) {
                        <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                          <span class="text-xs font-semibold text-slate-500 w-5 text-center shrink-0">{{ idx + 1 }}.</span>
                          <select
                            [(ngModel)]="row.docName"
                            class="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 bg-white focus:outline-none focus:border-primary shadow-2xs"
                          >
                            <option value="">-- Select Document Required --</option>
                            @for (docOpt of availableEoiDocs; track docOpt) {
                              <option [value]="docOpt">{{ docOpt }}</option>
                            }
                          </select>

                          @if (!row.uploadedFile) {
                            <button
                              type="button"
                              (click)="simulateRowDocUpload(idx)"
                              class="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#0e2138] hover:bg-[#163355] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
                            >
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span>Upload</span>
                            </button>
                          } @else {
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                              <span>{{ row.uploadedFile }}</span>
                              <button type="button" (click)="row.uploadedFile = ''" class="ml-1 text-emerald-800 hover:text-red-600 cursor-pointer">✕</button>
                            </span>
                          }

                          <button
                            type="button"
                            (click)="removeEoiDocumentRow(idx)"
                            class="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete document"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Footer Buttons Matching Screenshots -->
              <div class="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  (click)="closePreviewModal()"
                  class="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  (click)="publishEoi()"
                  class="px-6 py-2.5 bg-[#0e2138] hover:bg-[#163355] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Publish EOI
                </button>
              </div>
            </div>
          } @else if (isDeptUserForm(form)) {
            <div class="font-sans text-slate-800">
              <!-- Modal Title matching screenshot -->
              <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
                Add New User
              </h2>

              <!-- Modal Form Body -->
              <div class="mt-4 font-sans text-[13px] max-h-[75vh] overflow-y-auto pr-1">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  <!-- Col 1: SSO ID* -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">SSO ID*</label>
                    <input
                      type="text"
                      placeholder="e.g. SSO_1008"
                      [(ngModel)]="previewFormValues['du-1']"
                      [ngClass]="{'border-red-500': deptUserSubmitted() && !previewFormValues['du-1']?.trim(), 'border-field-border': !(deptUserSubmitted() && !previewFormValues['du-1']?.trim())}"
                      class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800 font-mono text-xs"
                    />
                    @if (deptUserSubmitted() && !previewFormValues['du-1']?.trim()) {
                      <div class="text-xs text-red-500 mt-0.5 font-medium">SSO ID is required</div>
                    }
                  </div>

                  <!-- Col 2: Role Type* -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">Role Type*</label>
                    <select
                      [(ngModel)]="previewFormValues['du-2']"
                      [ngClass]="{'border-red-500': deptUserSubmitted() && !previewFormValues['du-2']?.trim(), 'border-field-border': !(deptUserSubmitted() && !previewFormValues['du-2']?.trim())}"
                      class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800 bg-white"
                    >
                      <option value="" disabled selected>Select Role Type</option>
                      @for (role of deptUserRoleOptions; track role) {
                        <option [value]="role">{{ role }}</option>
                      }
                    </select>
                    @if (deptUserSubmitted() && !previewFormValues['du-2']?.trim()) {
                      <div class="text-xs text-red-500 mt-0.5 font-medium">Role Type is required</div>
                    }
                  </div>

                  <!-- Col 1: First Name* -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">First Name*</label>
                    <input
                      type="text"
                      placeholder="e.g. John"
                      [(ngModel)]="previewFormValues['du-3']"
                      [ngClass]="{'border-red-500': deptUserSubmitted() && !previewFormValues['du-3']?.trim(), 'border-field-border': !(deptUserSubmitted() && !previewFormValues['du-3']?.trim())}"
                      class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800"
                    />
                    @if (deptUserSubmitted() && !previewFormValues['du-3']?.trim()) {
                      <div class="text-xs text-red-500 mt-0.5 font-medium">First Name is required</div>
                    }
                  </div>

                  <!-- Col 2: Last Name* -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">Last Name*</label>
                    <input
                      type="text"
                      placeholder="e.g. Doe"
                      [(ngModel)]="previewFormValues['du-4']"
                      [ngClass]="{'border-red-500': deptUserSubmitted() && !previewFormValues['du-4']?.trim(), 'border-field-border': !(deptUserSubmitted() && !previewFormValues['du-4']?.trim())}"
                      class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800"
                    />
                    @if (deptUserSubmitted() && !previewFormValues['du-4']?.trim()) {
                      <div class="text-xs text-red-500 mt-0.5 font-medium">Last Name is required</div>
                    }
                  </div>

                  <!-- Col 1: E-Mail* -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">E-Mail*</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      [(ngModel)]="previewFormValues['du-5']"
                      [ngClass]="{'border-red-500': deptUserSubmitted() && !previewFormValues['du-5']?.trim(), 'border-field-border': !(deptUserSubmitted() && !previewFormValues['du-5']?.trim())}"
                      class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800"
                    />
                    @if (deptUserSubmitted() && !previewFormValues['du-5']?.trim()) {
                      <div class="text-xs text-red-500 mt-0.5 font-medium">E-Mail is required</div>
                    }
                  </div>

                  <!-- Col 2: Mobile No.* -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">Mobile No.*</label>
                    <input
                      type="text"
                      maxlength="10"
                      placeholder="10-digit mobile number"
                      [(ngModel)]="previewFormValues['du-6']"
                      [ngClass]="{'border-red-500': deptUserSubmitted() && !previewFormValues['du-6']?.trim(), 'border-field-border': !(deptUserSubmitted() && !previewFormValues['du-6']?.trim())}"
                      class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800"
                    />
                    @if (deptUserSubmitted() && !previewFormValues['du-6']?.trim()) {
                      <div class="text-xs text-red-500 mt-0.5 font-medium">Mobile No. is required</div>
                    }
                  </div>

                  <!-- Col 1: Date Of Birth -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">Date Of Birth</label>
                    <input
                      type="text"
                      placeholder="10 / 13 / 2026"
                      [(ngModel)]="previewFormValues['du-7']"
                      class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800"
                    />
                  </div>

                  <!-- Col 2: Aadhaar Id -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">Aadhaar Id</label>
                    <input
                      type="text"
                      maxlength="12"
                      placeholder="12-digit Aadhaar number"
                      [(ngModel)]="previewFormValues['du-8']"
                      class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:border-primary text-slate-800 font-mono text-xs"
                    />
                  </div>

                  <!-- Col 1: Designation -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">Designation</label>
                    <select
                      [(ngModel)]="previewFormValues['du-9']"
                      class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 bg-white"
                    >
                      <option value="" disabled selected>Select Designation</option>
                      @for (desig of deptUserDesignationOptions; track desig) {
                        <option [value]="desig">{{ desig }}</option>
                      }
                    </select>
                  </div>

                  <!-- Col 2: Scheme Name -->
                  <div class="relative scheme-dropdown-container">
                    <label class="block text-slate-700 font-medium mb-1">Scheme Name</label>
                    <button
                      type="button"
                      (click)="toggleDeptUserSchemeDropdown($event)"
                      class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:border-primary text-slate-800 bg-white flex items-center justify-between text-left cursor-pointer transition-colors"
                    >
                      <span class="truncate text-xs sm:text-[13px]">
                        {{ getDeptUserSchemeDisplayLabel() }}
                      </span>
                      <svg
                        class="w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200"
                        [class.rotate-180]="deptUserSchemeDropdownOpen()"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    @if (deptUserSchemeDropdownOpen()) {
                      <div
                        class="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden font-sans max-h-56 overflow-y-auto"
                        role="listbox"
                        (click)="$event.stopPropagation()"
                      >
                        <div class="py-1 divide-y divide-slate-100 text-xs sm:text-[13px]">
                          <label
                            class="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-800 font-semibold select-none transition-colors bg-slate-50/70"
                          >
                            <input
                              type="checkbox"
                              [checked]="isDeptUserAllSchemesSelected()"
                              (change)="toggleDeptUserAllSchemes()"
                              class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary cursor-pointer accent-primary"
                            />
                            <span>All Schemes</span>
                          </label>

                          @for (scheme of deptUserSchemeOptions; track scheme) {
                            <label
                              class="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700 select-none transition-colors"
                            >
                              <input
                                type="checkbox"
                                [checked]="isDeptUserSchemeSelected(scheme)"
                                (change)="toggleDeptUserSchemeOption(scheme)"
                                class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary cursor-pointer accent-primary"
                              />
                              <span class="truncate">{{ scheme }}</span>
                            </label>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Col 1: District -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">District</label>
                    <select
                      [(ngModel)]="previewFormValues['du-11']"
                      class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 bg-white"
                    >
                      @for (district of deptUserDistrictOptions; track district) {
                        <option [value]="district">{{ district }}</option>
                      }
                    </select>
                  </div>

                  <!-- Col 2: Block Name -->
                  <div>
                    <label class="block text-slate-700 font-medium mb-1">Block Name</label>
                    <select
                      [(ngModel)]="previewFormValues['du-12']"
                      class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 bg-white"
                    >
                      @for (block of deptUserBlockOptions; track block) {
                        <option [value]="block">{{ block }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>

              <!-- Footer Buttons (Cancel left, Submit right) matching screenshot -->
              <div class="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  (click)="closePreviewModal()"
                  class="px-8 py-2.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  (click)="submitDeptUser()"
                  class="px-8 py-2.5 bg-[#0e2138] hover:bg-[#163355] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Submit
                </button>
              </div>
            </div>
          } @else {
            <div class="font-sans text-slate-800">
              <!-- Back Button -->
              <button
                type="button"
                (click)="closePreviewModal()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer mb-3"
              >
                <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>

            <!-- Title & Mandatory Notice -->
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                {{ form.formType }}
              </h1>
              <span class="text-xs text-slate-500 font-normal whitespace-nowrap">
                Fields marked with <span class="text-rose-500 font-bold">*</span> are mandatory
              </span>
            </div>

            <!-- Subtitle -->
            <p class="text-xs text-slate-500 mt-1 mb-6">
              {{ getStepSubtitle(form, previewStepIndex()) }}
            </p>

            <!-- MULTI-STEP PREVIEW WIZARD -->
            @if (form.isStepForm && form.steps && form.steps.length > 0) {
              <div>
                <!-- Stepper Progress Header -->
                <div class="flex items-center justify-between max-w-4xl mx-auto mb-8 px-2">
                  @for (step of form.steps; track step.id; let sIdx = $index) {
                    <button
                      type="button"
                      (click)="goToPreviewStep(sIdx)"
                      class="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
                    >
                      <div
                        class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0"
                        [ngClass]="previewStepIndex() === sIdx
                          ? 'bg-[#0e2138] text-white shadow-xs ring-2 ring-[#0e2138]/20'
                          : 'border border-slate-300 text-slate-600 bg-white group-hover:border-slate-400 group-hover:text-slate-800'"
                      >
                        {{ sIdx + 1 }}
                      </div>
                      <span
                        class="text-xs transition-colors hidden sm:inline whitespace-nowrap"
                        [ngClass]="previewStepIndex() === sIdx
                          ? 'font-bold text-[#0e2138]'
                          : 'font-medium text-slate-600 group-hover:text-slate-900'"
                      >
                        {{ step.title }}
                      </span>
                    </button>

                    @if (sIdx < form.steps.length - 1) {
                      <div class="flex-1 h-px mx-3 bg-slate-200"></div>
                    }
                  }
                </div>

                <!-- STEP BODY CONTAINER -->
                <!-- CASE A: STEPS 1 to 3 (Or any non-review step) -->
                @if (!isReviewStep(form, previewStepIndex())) {
                  @if (form.steps[previewStepIndex()]; as currentStep) {
                    <div class="bg-white p-5 sm:p-7 rounded-xl border border-slate-200 space-y-6">
                      <!-- Step Header Inside Card -->
                      <div>
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full bg-[#0e2138] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {{ previewStepIndex() + 1 }}
                          </div>
                          <h2 class="text-base font-bold text-slate-900 m-0">
                            {{ getStepCardTitle(form, previewStepIndex()) }}
                          </h2>
                        </div>
                        @if (getStepInnerDescription(form, previewStepIndex())) {
                          <p class="text-xs text-slate-500 mt-1 mb-0 ml-8">
                            {{ getStepInnerDescription(form, previewStepIndex()) }}
                          </p>
                        }
                      </div>

                      <!-- Step Fields Grid -->
                      <div class="grid grid-cols-1 sm:grid-cols-12 gap-x-4 gap-y-4">
                        @for (field of currentStep.fields; track field.id) {
                          <div [class]="getFieldColSpan(field)">
                            <!-- Document / Photo Upload Field -->
                            @if (field.type === 'photo') {
                              <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                                  {{ field.label }}
                                  @if (field.mandatory) { <span class="text-rose-500 font-bold ml-0.5">*</span> }
                                </label>
                                <div class="flex flex-wrap items-center gap-2.5">
                                  <button
                                    type="button"
                                    (click)="simulateFileUpload(field)"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                                  >
                                    <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span>Upload Document</span>
                                  </button>
                                  <span class="text-[11px] text-slate-400">
                                    (PDF, JPG, PNG • Max {{ field.maxSizeMb || 5 }}MB)
                                  </span>
                                  @if (uploadedFiles[field.id]) {
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span>{{ uploadedFiles[field.id] }}</span>
                                      <button
                                        type="button"
                                        (click)="removeUploadedFile(field.id, $event)"
                                        class="text-emerald-700 hover:text-emerald-900 ml-1 cursor-pointer"
                                        title="Remove file"
                                      >
                                        ✕
                                      </button>
                                    </span>
                                  }
                                </div>
                              </div>
                            }

                            <!-- Text Input -->
                            @if (field.type === 'text') {
                              <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">
                                  {{ field.label }}
                                  @if (field.mandatory) { <span class="text-rose-500 font-bold ml-0.5">*</span> }
                                  @if (field.id === 'crf-307') {
                                    <span class="inline-block ml-1 text-slate-400 hover:text-slate-600 cursor-help" title="11 characters code found on cheque book">ⓘ</span>
                                  }
                                </label>
                                <input
                                  type="text"
                                  [(ngModel)]="previewFormValues[field.id]"
                                  [placeholder]="getFieldPlaceholder(field)"
                                  class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                              </div>
                            }

                            <!-- Number Input -->
                            @if (field.type === 'number') {
                              <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">
                                  {{ field.label }}
                                  @if (field.mandatory) { <span class="text-rose-500 font-bold ml-0.5">*</span> }
                                </label>
                                <input
                                  type="text"
                                  [(ngModel)]="previewFormValues[field.id]"
                                  [placeholder]="getFieldPlaceholder(field)"
                                  class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                              </div>
                            }

                            <!-- Datepicker Input -->
                            @if (field.type === 'datepicker') {
                              <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">
                                  {{ field.label }}
                                  @if (field.mandatory) { <span class="text-rose-500 font-bold ml-0.5">*</span> }
                                </label>
                                <input
                                  type="text"
                                  [(ngModel)]="previewFormValues[field.id]"
                                  (ngModelChange)="onDateChange(field.id)"
                                  placeholder="10 / 13 / 2026"
                                  class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                              </div>
                            }

                            <!-- Dropdown Select -->
                            @if (field.type === 'dropdown') {
                              <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">
                                  {{ field.label }}
                                  @if (field.mandatory) { <span class="text-rose-500 font-bold ml-0.5">*</span> }
                                </label>
                                <div class="relative">
                                  <select
                                    [(ngModel)]="previewFormValues[field.id]"
                                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer appearance-none pr-8"
                                  >
                                    <option value="" disabled>{{ getDropdownPlaceholder(field) }}</option>
                                    @for (opt of getOptionsArray(field); track opt) {
                                      <option [value]="opt">{{ opt }}</option>
                                    }
                                  </select>
                                  <svg class="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            }

                            <!-- Same Address Checkbox (Rendered right below Registered PIN Code in Step 1) -->
                            @if (field.id === 'crf-18') {
                              <div class="col-span-12 pt-3 pb-1">
                                <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                                  <input
                                    type="checkbox"
                                    [(ngModel)]="isOfficeSameAsRegistered"
                                    (ngModelChange)="onSameAddressToggle()"
                                    class="w-4 h-4 rounded text-[#0e2138] border-slate-300 focus:ring-[#0e2138] cursor-pointer accent-[#0e2138]"
                                  />
                                  <span>Office Address is same as Registered Address</span>
                                </label>
                              </div>
                            }
                          </div>
                        }
                      </div>

                      <!-- Stepper Bottom Navigation Bar -->
                      <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          @if (previewStepIndex() > 0) {
                            <button
                              type="button"
                              (click)="previewPrevStep()"
                              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                            >
                              <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                              </svg>
                              <span>Previous</span>
                            </button>
                          }
                        </div>

                        <div class="flex items-center gap-2.5">
                          @if (previewStepIndex() === 2) {
                            <button
                              type="button"
                              (click)="saveAsDraft()"
                              class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                            >
                              Save as Draft
                            </button>
                          }

                          <button
                            type="button"
                            (click)="previewNextStep(form)"
                            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0e2138] hover:bg-[#163355] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                          >
                            <span>Next Step</span>
                            <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                }

                <!-- CASE B: STEP 4 (REVIEW & SUBMIT) - MATCHING IMAGE 4! -->
                @if (isReviewStep(form, previewStepIndex())) {
                  <div class="space-y-6">
                    <!-- Step Header -->
                    <div class="bg-white p-5 rounded-xl border border-slate-200">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-[#0e2138] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          4
                        </div>
                        <h2 class="text-base font-bold text-slate-900 m-0">
                          Review & Submit
                        </h2>
                      </div>
                      <p class="text-xs text-slate-500 mt-1 mb-0 ml-8">
                        Please verify the information provided below. You can edit any section if required.
                      </p>
                    </div>

                    <!-- Review Card 1: Organisation Details -->
                    <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <div class="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-5 h-5 rounded-full border border-sky-500 text-sky-600 flex items-center justify-center text-[11px] font-bold">
                            1
                          </div>
                          <span class="text-sm font-bold text-slate-900">Organisation Details</span>
                        </div>
                        <button
                          type="button"
                          (click)="goToPreviewStep(0)"
                          class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span>Edit Details</span>
                          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <div class="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 text-xs">
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Organisation Name</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-1') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Nature of Entity</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-2') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Registration No. (CIN / Reg. No.)</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-3') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Date of Registration</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-4') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">State / UT of Registration</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-5') || 'Rajasthan' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Organisation PAN</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-7') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">GST Registered</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-9') || 'No' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">MSME / Udyam Registered</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-10') || 'No' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">NSDC Partner</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-11') || 'Not Applicable' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Contact No.</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-12') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Email ID</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-13') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Website</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-14') || '-' }}</span>
                        </div>
                        <div class="sm:col-span-2">
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Registered Address</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-15') || 'Rajasthan' }}</span>
                        </div>
                        <div class="sm:col-span-2">
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Office Address</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-19') || 'Rajasthan' }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Review Card 2: Authorized Person Details -->
                    <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <div class="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-5 h-5 rounded-full border border-sky-500 text-sky-600 flex items-center justify-center text-[11px] font-bold">
                            2
                          </div>
                          <span class="text-sm font-bold text-slate-900">Authorized Person Details</span>
                        </div>
                        <button
                          type="button"
                          (click)="goToPreviewStep(1)"
                          class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span>Edit Details</span>
                          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <div class="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 text-xs">
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Full Name</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-201') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Designation</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-202') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Date of Birth</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-203') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Age</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-204') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">PAN</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-205') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Aadhaar No.</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-208') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Mobile No.</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-206') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Email Address</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-207') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Bhamashah No.</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-209') || 'Not Provided' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Voter ID No.</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-210') || 'Not Provided' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Passport No.</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-211') || 'Not Provided' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">State</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-212') || 'Rajasthan' }}</span>
                        </div>
                        <div class="sm:col-span-4">
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Residential Address</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-213') || '-' }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Review Card 3: Bank Details -->
                    <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <div class="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-5 h-5 rounded-full border border-sky-500 text-sky-600 flex items-center justify-center text-[11px] font-bold">
                            3
                          </div>
                          <span class="text-sm font-bold text-slate-900">Bank Details</span>
                        </div>
                        <button
                          type="button"
                          (click)="goToPreviewStep(2)"
                          class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span>Edit Details</span>
                          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <div class="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 text-xs">
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Bank Name</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-301') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Branch Name</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-302') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Account Holder Name</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-305') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Account Number</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-306') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Account Type</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-304') || 'Current' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">IFSC Code</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-307') || '-' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">MICR Code</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-308') ? getVal('crf-308') : 'Optional / -' }}</span>
                        </div>
                        <div>
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Transfer Mode</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-303') || 'NEFT' }}</span>
                        </div>
                        <div class="sm:col-span-4">
                          <span class="block text-[11px] text-slate-400 font-medium mb-1">Branch Address</span>
                          <span class="block text-xs font-medium text-slate-700">{{ getVal('crf-309') || '-' }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Step 4 Bottom Action Buttons -->
                    <div class="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        (click)="previewPrevStep()"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Previous</span>
                      </button>

                      <div class="flex items-center gap-3">
                        <button
                          type="button"
                          (click)="downloadPdf()"
                          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                        >
                          <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>Download PDF</span>
                        </button>

                        <button
                          type="button"
                          (click)="registerSubmit()"
                          class="px-6 py-2 rounded-lg bg-[#0e2138] hover:bg-[#163355] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- DIRECT SINGLE-STEP PREVIEW -->
            @if (!form.isStepForm) {
              <div class="mt-4 space-y-4 font-sans bg-white p-5 rounded-xl border border-slate-200">
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  @for (field of form.fields; track field.id) {
                    <div [class]="getFieldColSpan(field)">
                      <label class="block text-slate-700 font-semibold text-xs mb-1">
                        {{ field.label }}
                        @if (field.mandatory) { <span class="text-rose-500 font-bold ml-0.5">*</span> }
                      </label>

                      @if (field.type === 'text') {
                        <input type="text" [(ngModel)]="previewFormValues[field.id]" [placeholder]="getFieldPlaceholder(field)" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary" />
                      }
                      @if (field.type === 'number') {
                        <input type="text" [(ngModel)]="previewFormValues[field.id]" [placeholder]="getFieldPlaceholder(field)" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary" />
                      }
                      @if (field.type === 'datepicker') {
                        <input type="text" [(ngModel)]="previewFormValues[field.id]" placeholder="10 / 13 / 2026" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary" />
                      }
                      @if (field.type === 'dropdown') {
                        <select [(ngModel)]="previewFormValues[field.id]" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary cursor-pointer">
                          <option value="" disabled>{{ getDropdownPlaceholder(field) }}</option>
                          @for (opt of getOptionsArray(field); track opt) {
                            <option [value]="opt">{{ opt }}</option>
                          }
                        </select>
                      }
                      @if (field.type === 'photo') {
                        <div class="p-3.5 border-2 border-dashed border-slate-300 rounded-xl bg-white text-center cursor-pointer" (click)="simulateFileUpload(field)">
                          <div class="text-xs font-semibold text-slate-800">Click to upload document / photo</div>
                          <div class="text-[11px] text-slate-400 mt-1">
                            Min: {{ field.minPhotos || 1 }} • Max: {{ field.maxPhotos || 5 }} photos (Max {{ field.maxSizeMb || 5 }}MB)
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <div class="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    (click)="registerSubmit()"
                    class="px-5 py-2 rounded-lg bg-[#0e2138] hover:bg-[#163355] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Submit Form
                  </button>
                </div>
              </div>
            }
          </div>
        }
      }
    </app-action-modal>

      <!-- Modal: Delete Form Confirmation -->
      <app-action-modal
        [isOpen]="showDeleteModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Delete Form"
        secondaryLabel="Cancel"
        primaryVariantClass="bg-rose-600 hover:bg-rose-700 shadow-sm"
        maxWidthClass="max-w-[440px]"
        (primaryAction)="confirmDeleteForm()"
        (secondaryAction)="closeDeleteModal()"
        (close)="closeDeleteModal()"
      >
        <div class="text-center py-2">
          <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <h2 class="m-0 text-navy text-base font-bold">
            Delete Dynamic Form?
          </h2>

          <p class="mt-2 mb-0 text-xs text-slate-500 leading-relaxed">
            Are you sure you want to delete <strong class="text-slate-700">"{{ formToDelete()?.formType }}"</strong>?
            This action cannot be undone.
          </p>
        </div>
      </app-action-modal>

    </div>
  `
})
export class DynamicFormBuilderComponent {
  private dataEngine = inject(DataEngineService);
  private destroyRef = inject(DestroyRef);
  private notification = inject(NotificationService);
  private formRepo = this.dataEngine.for<DynamicFormBuilderItem>('DYNAMIC_FORM_BUILDER');

  readonly forms = signal<DynamicFormBuilderItem[]>([]);
  readonly searchQuery = signal<string>('');

  readonly showBuilderModal = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);

  readonly showPreviewModal = signal<boolean>(false);
  readonly selectedPreviewForm = signal<DynamicFormBuilderItem | null>(null);
  readonly previewStepIndex = signal<number>(0);

  // Interactive preview state matching screenshots
  isOfficeSameAsRegistered = false;
  uploadedFiles: Record<string, string> = {};
  previewFormValues: Record<string, any> = {};

  // EOI Documents table state matching screenshots
  eoiDocumentRows: Array<{ docName: string; uploadedFile?: string }> = [];
  readonly availableEoiDocs = [
    'Registration Certificate / Incorporation',
    'Audited Balance Sheet & Financial Statements',
    'PAN Card & GST Registration Certificate',
    'Past Experience & Work Order Copies',
    'Power of Attorney / Board Resolution',
    'Affidavit / Non-Blacklisting Declaration'
  ];

  // Apply for EOI Form State (Matching Images 1, 2 & 3)
  readonly applyEoiStep = signal<number>(1);
  readonly selectedApplyDocTab = signal<'all' | 'mandatory' | 'annexure' | 'remaining'>('all');

  otrRegDocs = [
    { key: 'reg-1', label: 'Certificate of Incorporation', fileName: 'CIN_Incorporation_Cert_2022.pdf', fileSize: '1.8 MB' },
    { key: 'reg-2', label: 'Organization PAN Card', fileName: 'Company_PAN_Verified.pdf', fileSize: '850 KB' },
    { key: 'reg-3', label: 'GST Certificate', fileName: 'GST_Registration_Certificate.pdf', fileSize: '1.2 MB' },
    { key: 'reg-4', label: 'Udyam Certificate', fileName: 'Udyam_Certificate.pdf', fileSize: '950 KB' }
  ];

  otrSigDocs = [
    { key: 'sig-1', label: 'Authorization Letter / Board Resolution', fileName: 'Board_Resolution_Authorization.pdf', fileSize: '2.1 MB' },
    { key: 'sig-2', label: 'Signatory Identity Proof', fileName: 'Auth_Signatory_ID_Proof.pdf', fileSize: '1.2 MB' }
  ];

  otrBankDoc = { key: 'bnk-1', label: 'Cancelled Cheque / Passbook', fileName: 'Cancelled_Cheque_Verified.pdf', fileSize: '850 KB' };

  applyEoiDocuments: Array<{
    id: number;
    name: string;
    category: 'mandatory' | 'annexure' | 'remaining';
    uploadedFile?: string;
    uploadedSize?: string;
  }> = [];

  // Department User Registration Form State (Matching Image)
  readonly deptUserSubmitted = signal<boolean>(false);
  readonly deptUserSchemeDropdownOpen = signal<boolean>(false);
  readonly deptUserRoleOptions = [
    'Super Admin',
    'Admin',
    'Department User',
    'Training Partner',
    'Inspection Agency',
    'Finance Officer'
  ];
  readonly deptUserDesignationOptions = [
    'Joint Director',
    'Deputy Director',
    'Assistant Director',
    'Section Officer',
    'Project Officer',
    'Clerk'
  ];
  readonly deptUserSchemeOptions = [
    'Vishwakarma Yuva Udyami Protsahan Yojana',
    'Mukhyamantri Yuva Swarojgar Yojana (2026)',
    'Mukhyamantri Yuva Sambal Yojana',
    'Mukhya Mantri Yuva Kaushal Yojana'
  ];
  readonly deptUserDistrictOptions = [
    'Jaipur',
    'Jodhpur',
    'Udaipur',
    'Kota',
    'Bikaner',
    'Ajmer',
    'Alwar',
    'Bharatpur',
    'Bhilwara'
  ];
  readonly deptUserBlockOptions = [
    'All Blocks',
    'Amber',
    'Bassi',
    'Chaksu',
    'Govindgarh',
    'Jamwa Ramgarh',
    'Jhotwara',
    'Kotputli',
    'Sanganer',
    'Shahpura',
    'Viratnagar'
  ];
  deptUserSelectedSchemes: string[] = [
    'All Schemes',
    'Vishwakarma Yuva Udyami Protsahan Yojana',
    'Mukhyamantri Yuva Swarojgar Yojana (2026)',
    'Mukhyamantri Yuva Sambal Yojana',
    'Mukhya Mantri Yuva Kaushal Yojana'
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('.scheme-dropdown-container')) {
      this.deptUserSchemeDropdownOpen.set(false);
    }
  }

  readonly showDeleteModal = signal<boolean>(false);
  readonly formToDelete = signal<DynamicFormBuilderItem | null>(null);

  // Active step index inside the builder when isStepForm is true
  readonly activeStepIndex = signal<number>(0);

  // Drag and drop state
  draggedIndex: number | null = null;
  dragOverIndex: number | null = null;

  // Active form data being edited or created
  formData: FormBuilderFormData = {
    formType: '',
    isStepForm: false,
    status: 'Active',
    steps: [],
    fields: []
  };

  readonly tableColumns: TableColumn<DynamicFormBuilderItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    { key: 'formType', label: 'Form Type', type: 'custom', cellClass: 'min-w-[280px]' },
    { key: 'actions', label: 'Form actions', align: 'center', type: 'custom', width: 'min-w-[240px]' }
  ];

  getRowClass = (item: any): string => {
    const isInactive = item.status === 'Inactive';
    return isInactive ? 'opacity-50 !bg-slate-100/70 transition-colors' : 'bg-white transition-colors';
  };

  constructor() {
    this.formRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => {
      this.forms.set(list || []);
    });
  }

  readonly filteredForms = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.forms();
    if (!q) return list;

    return list.filter(form => {
      const matchName = form.formType && form.formType.toLowerCase().includes(q);
      const matchDirect = form.fields?.some(f => f.label && f.label.toLowerCase().includes(q));
      const matchStep = form.steps?.some(s =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        s.fields?.some(f => f.label && f.label.toLowerCase().includes(q))
      );
      return matchName || matchDirect || matchStep;
    });
  });

  // --- Step Management ---

  onStepFormToggle(): void {
    if (this.formData.isStepForm && this.formData.steps.length === 0) {
      // Migrate existing direct fields into Step 1 or create Step 1
      this.formData.steps = [
        {
          id: 'stp-' + Date.now() + '-1',
          stepNumber: 1,
          title: 'Step 1: General Details',
          fields: this.formData.fields.length > 0 ? [...this.formData.fields] : [
            { id: 'fld-' + Date.now() + '-1', label: '', type: 'text', mandatory: true }
          ]
        }
      ];
      this.activeStepIndex.set(0);
    }
  }

  getActiveStep(): FormStep | null {
    if (!this.formData.isStepForm || this.formData.steps.length === 0) return null;
    const idx = this.activeStepIndex();
    return this.formData.steps[idx] || this.formData.steps[0] || null;
  }

  addStep(): void {
    const nextNum = this.formData.steps.length + 1;
    const newStep: FormStep = {
      id: 'stp-' + Date.now() + '-' + nextNum,
      stepNumber: nextNum,
      title: `Step ${nextNum}: New Step`,
      fields: [
        {
          id: 'fld-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          label: '',
          type: 'text',
          mandatory: true
        }
      ]
    };
    this.formData.steps = [...this.formData.steps, newStep];
    this.activeStepIndex.set(this.formData.steps.length - 1);
  }

  deleteStep(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.formData.steps.length <= 1) return;

    this.formData.steps = this.formData.steps.filter((_, idx) => idx !== index);
    if (this.activeStepIndex() >= this.formData.steps.length) {
      this.activeStepIndex.set(this.formData.steps.length - 1);
    }
  }

  addFieldToActiveStep(): void {
    const step = this.getActiveStep();
    if (!step) return;

    const newField: DynamicFormField = {
      id: 'fld-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      label: '',
      type: 'text',
      mandatory: false
    };
    step.fields = [...step.fields, newField];
  }

  deleteStepField(fIndex: number): void {
    const step = this.getActiveStep();
    if (!step) return;
    step.fields = step.fields.filter((_, idx) => idx !== fIndex);
  }

  moveStepFieldUp(fIndex: number): void {
    const step = this.getActiveStep();
    if (!step || fIndex <= 0) return;
    const item = step.fields.splice(fIndex, 1)[0];
    step.fields.splice(fIndex - 1, 0, item);
  }

  moveStepFieldDown(fIndex: number): void {
    const step = this.getActiveStep();
    if (!step || fIndex >= step.fields.length - 1) return;
    const item = step.fields.splice(fIndex, 1)[0];
    step.fields.splice(fIndex + 1, 0, item);
  }

  // --- Step Fields Drag and Drop ---

  onStepDragStart(index: number, event: DragEvent): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onStepDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex = index;
  }

  onStepDragLeave(index: number, event: DragEvent): void {
    if (this.dragOverIndex === index) {
      this.dragOverIndex = null;
    }
  }

  onStepDrop(dropIndex: number, event: DragEvent): void {
    event.preventDefault();
    const step = this.getActiveStep();
    if (!step || this.draggedIndex === null || this.draggedIndex === dropIndex) {
      this.draggedIndex = null;
      this.dragOverIndex = null;
      return;
    }

    const item = step.fields.splice(this.draggedIndex, 1)[0];
    step.fields.splice(dropIndex, 0, item);

    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  onStepDragEnd(): void {
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  // --- Direct Fields Drag and Drop ---

  onDragStart(index: number, event: DragEvent): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex = index;
  }

  onDragLeave(index: number, event: DragEvent): void {
    if (this.dragOverIndex === index) {
      this.dragOverIndex = null;
    }
  }

  onDrop(dropIndex: number, event: DragEvent): void {
    event.preventDefault();
    if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
      this.draggedIndex = null;
      this.dragOverIndex = null;
      return;
    }

    const item = this.formData.fields.splice(this.draggedIndex, 1)[0];
    this.formData.fields.splice(dropIndex, 0, item);

    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  onDragEnd(): void {
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  moveFieldUp(index: number): void {
    if (index <= 0) return;
    const item = this.formData.fields.splice(index, 1)[0];
    this.formData.fields.splice(index - 1, 0, item);
  }

  moveFieldDown(index: number): void {
    if (index >= this.formData.fields.length - 1) return;
    const item = this.formData.fields.splice(index, 1)[0];
    this.formData.fields.splice(index + 1, 0, item);
  }

  addField(): void {
    const newField: DynamicFormField = {
      id: 'fld-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      label: '',
      type: 'text',
      mandatory: false
    };
    this.formData.fields = [...this.formData.fields, newField];
  }

  deleteField(index: number): void {
    this.formData.fields = this.formData.fields.filter((_, idx) => idx !== index);
  }

  // --- Helper Methods ---

  getTotalFieldsCount(item: DynamicFormBuilderItem): number {
    if (item.isStepForm && item.steps && item.steps.length > 0) {
      return item.steps.reduce((acc, s) => acc + (s.fields?.length || 0), 0);
    }
    return item.fields?.length || 0;
  }

  getMandatoryCount(item: DynamicFormBuilderItem): number {
    if (item.isStepForm && item.steps && item.steps.length > 0) {
      return item.steps.reduce((acc, s) => acc + (s.fields?.filter(f => f.mandatory)?.length || 0), 0);
    }
    return (item.fields || []).filter(f => f.mandatory).length;
  }

  getUniqueFieldTypes(item: DynamicFormBuilderItem): DynamicFormFieldType[] {
    let allFields: DynamicFormField[] = [];
    if (item.isStepForm && item.steps && item.steps.length > 0) {
      allFields = item.steps.flatMap(s => s.fields || []);
    } else {
      allFields = item.fields || [];
    }
    return Array.from(new Set(allFields.map(f => f.type)));
  }

  formatFieldTypeLabel(type: DynamicFormFieldType): string {
    switch (type) {
      case 'text': return 'Text';
      case 'number': return 'Number';
      case 'datepicker': return 'Date';
      case 'dropdown': return 'Dropdown';
      case 'photo': return 'Photo Upload';
      default: return type;
    }
  }

  getFieldTypeBadgeClass(type: DynamicFormFieldType): string {
    switch (type) {
      case 'text': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'number': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'datepicker': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'dropdown': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'photo': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getOptionsArray(field: DynamicFormField): string[] {
    if (field.options && field.options.length > 0) return field.options;
    if (field.optionsText) {
      return field.optionsText.split(',').map(o => o.trim()).filter(Boolean);
    }
    return ['Option 1', 'Option 2', 'Option 3'];
  }

  updateFieldOptions(field: DynamicFormField): void {
    if (field.optionsText) {
      field.options = field.optionsText.split(',').map(o => o.trim()).filter(Boolean);
    } else {
      field.options = [];
    }
  }

  onFieldTypeChange(field: DynamicFormField): void {
    if (field.type === 'photo') {
      field.minPhotos = field.minPhotos || 1;
      field.maxPhotos = field.maxPhotos || 5;
      field.maxSizeMb = field.maxSizeMb || 5;
    }
    if (field.type === 'dropdown') {
      field.optionsText = field.optionsText || 'Option 1, Option 2, Option 3';
      this.updateFieldOptions(field);
    }
  }

  hasAtLeastOneField(): boolean {
    if (this.formData.isStepForm) {
      return this.formData.steps.some(s => s.fields && s.fields.length > 0);
    }
    return this.formData.fields.length > 0;
  }

  // --- CRUD Modals ---

  openAddModal(): void {
    this.isEditing.set(false);
    this.submitted.set(false);
    this.activeStepIndex.set(0);
    this.formData = {
      formType: '',
      isStepForm: false,
      status: 'Active',
      steps: [
        {
          id: 'stp-' + Date.now() + '-1',
          stepNumber: 1,
          title: 'Step 1: General Details',
          fields: [
            { id: 'fld-' + Date.now() + '-1', label: '', type: 'text', mandatory: true }
          ]
        }
      ],
      fields: [
        {
          id: 'fld-' + Date.now() + '-1',
          label: '',
          type: 'text',
          mandatory: true
        }
      ]
    };
    this.showBuilderModal.set(true);
  }

  openEditModal(item: DynamicFormBuilderItem): void {
    this.isEditing.set(true);
    this.submitted.set(false);
    this.activeStepIndex.set(0);

    const isStep = !!item.isStepForm;
    const clonedSteps: FormStep[] = (item.steps || []).map((s, idx) => ({
      id: s.id || 'stp-' + Date.now() + '-' + idx,
      stepNumber: s.stepNumber || idx + 1,
      title: s.title || `Step ${idx + 1}`,
      fields: (s.fields || []).map(f => ({
        ...f,
        optionsText: f.options ? f.options.join(', ') : f.optionsText || ''
      }))
    }));

    const clonedFields: DynamicFormField[] = (item.fields || []).map(f => ({
      ...f,
      optionsText: f.options ? f.options.join(', ') : f.optionsText || ''
    }));

    this.formData = {
      id: item.id,
      formType: item.formType,
      isStepForm: isStep,
      status: item.status || 'Active',
      steps: clonedSteps.length > 0 ? clonedSteps : [
        {
          id: 'stp-1',
          stepNumber: 1,
          title: 'Step 1: General Info',
          fields: clonedFields.length > 0 ? [...clonedFields] : [{ id: 'fld-1', label: '', type: 'text', mandatory: true }]
        }
      ],
      fields: clonedFields
    };

    this.showBuilderModal.set(true);
  }

  closeBuilderModal(): void {
    this.showBuilderModal.set(false);
    this.submitted.set(false);
  }

  submitForm(): void {
    this.submitted.set(true);

    if (!this.formData.formType.trim()) return;

    const sanitizeFieldList = (fields: DynamicFormField[]): DynamicFormField[] => {
      return fields.map(f => {
        const copy: DynamicFormField = {
          id: f.id,
          label: (f.label || '').trim(),
          type: f.type,
          mandatory: !!f.mandatory
        };
        if (f.type === 'dropdown') {
          copy.options = this.getOptionsArray(f);
          copy.optionsText = copy.options.join(', ');
        } else if (f.type === 'photo') {
          copy.minPhotos = Number(f.minPhotos) || 1;
          copy.maxPhotos = Number(f.maxPhotos) || 5;
          copy.maxSizeMb = Number(f.maxSizeMb) || 5;
        }
        return copy;
      });
    };

    let finalSteps: FormStep[] | undefined = undefined;
    let finalFields: DynamicFormField[] = [];

    if (this.formData.isStepForm) {
      if (this.formData.steps.length === 0) return;
      // Check that each step has a title and each field has a label
      const hasEmptyStepTitle = this.formData.steps.some(s => !s.title || !s.title.trim());
      if (hasEmptyStepTitle) return;

      const hasEmptyFieldLabels = this.formData.steps.some(s =>
        s.fields.some(f => !f.label || !f.label.trim())
      );
      if (hasEmptyFieldLabels) return;

      finalSteps = this.formData.steps.map((s, idx) => ({
        id: s.id,
        stepNumber: idx + 1,
        title: s.title.trim(),
        fields: sanitizeFieldList(s.fields)
      }));

      // Flatten fields for table summary
      finalFields = finalSteps.flatMap(s => s.fields);
    } else {
      if (this.formData.fields.length === 0) return;
      const hasEmptyLabels = this.formData.fields.some(f => !f.label || !f.label.trim());
      if (hasEmptyLabels) return;

      finalFields = sanitizeFieldList(this.formData.fields);
    }

    if (finalFields.length === 0) return;

    if (this.isEditing() && this.formData.id) {
      const updated: DynamicFormBuilderItem = {
        id: this.formData.id,
        formType: this.formData.formType.trim(),
        isStepForm: this.formData.isStepForm,
        status: this.formData.status,
        steps: finalSteps,
        fields: finalFields,
        updatedAt: new Date().toISOString()
      };

      this.formRepo.update(this.formData.id, updated).subscribe(saved => {
        this.forms.update(list => list.map(f => (f.id === saved.id ? saved : f)));
        this.closeBuilderModal();
      });
    } else {
      const newItem: DynamicFormBuilderItem = {
        id: 'form-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
        sNo: 1,
        formType: this.formData.formType.trim(),
        isStepForm: this.formData.isStepForm,
        status: 'Active',
        steps: finalSteps,
        fields: finalFields,
        createdAt: new Date().toISOString().split('T')[0]
      };

      let list = [newItem, ...this.forms()];
      list.forEach((item, idx) => {
        item.sNo = idx + 1;
      });

      this.forms.set(list);
      this.formRepo.create(newItem).subscribe();
      this.closeBuilderModal();
    }
  }

  toggleStatus(item: DynamicFormBuilderItem): void {
    const newStatus = item.status === 'Inactive' ? 'Active' : 'Inactive';
    const updated: DynamicFormBuilderItem = { ...item, status: newStatus };
    this.forms.update(list => list.map(f => (f.id === item.id ? updated : f)));
    this.formRepo.update(item.id, updated).subscribe();
  }

  // --- Preview Modal ---

  openPreviewModal(item: DynamicFormBuilderItem): void {
    this.selectedPreviewForm.set(item);
    this.previewStepIndex.set(0);
    this.isOfficeSameAsRegistered = false;
    this.uploadedFiles = {};
    if (this.isApplyEoiForm(item)) {
      this.applyEoiStep.set(1);
      this.selectedApplyDocTab.set('all');
      this.resetApplyEoiDocuments();
      this.previewFormValues = {
        'eoi-otr-1': 'Company 1',
        'eoi-otr-2': 'Company 1',
        'eoi-otr-3': 'Private Limited',
        'eoi-otr-4': 'U80302RJ2022NPL079811',
        'eoi-otr-5': '2022-04-15',
        'eoi-otr-6': 'Rajasthan',
        'eoi-otr-7': 'AAACR1234F',
        'eoi-otr-8': 'Yes',
        'eoi-otr-9': '08AAACR1234F1Z5',
        'eoi-otr-10': 'Yes',
        'eoi-otr-11': 'UDYAM-RJ-14-0019284',
        'eoi-otr-12': 'Approved',
        'eoi-otr-13': '0141-2700891',
        'eoi-otr-14': 'contact@skilltech.org',
        'eoi-otr-15': 'https://www.skilltech.org',
        'eoi-otr-16': 'Plot No. 42, Institutional Area, Jhalana Doongri',
        'eoi-otr-17': 'Plot No. 42, Institutional Area, Jhalana Doongri',
        'eoi-otr-19': 'Vikram Singh Mehta',
        'eoi-otr-20': 'Authorized Representative',
        'eoi-otr-21': '1982-08-14',
        'eoi-otr-22': '9829154321',
        'eoi-otr-23': 'vikram.mehta@skilltech.org',
        'eoi-otr-24': 'BNYPM9876Q',
        'eoi-otr-25': '765432109876',
        'eoi-otr-26': 'Rajasthan',
        'eoi-otr-27': 'B-14, Malviya Nagar, Jaipur, Rajasthan - 302017',
        'eoi-otr-29': 'State Bank of India',
        'eoi-otr-30': 'Secretariat Branch, Jaipur',
        'eoi-otr-31': 'Current Account',
        'eoi-otr-32': 'Company 1',
        'eoi-otr-33': '3948201948201',
        'eoi-otr-34': 'SBIN0001234',
        'eoi-otr-35': 'NEFT'
      };
    } else if (this.isDeptUserForm(item)) {
      this.deptUserSubmitted.set(false);
      this.deptUserSchemeDropdownOpen.set(false);
      this.deptUserSelectedSchemes = ['All Schemes', ...this.deptUserSchemeOptions];
      this.previewFormValues = {
        'du-1': '',
        'du-2': '',
        'du-3': '',
        'du-4': '',
        'du-5': '',
        'du-6': '',
        'du-7': '10 / 13 / 2026',
        'du-8': '',
        'du-9': '',
        'du-10': 'All Schemes (4 selected)',
        'du-11': 'Jaipur',
        'du-12': 'All Blocks'
      };
    } else if (this.isEoiForm(item)) {
      this.eoiDocumentRows = [];
      this.previewFormValues = {
        'eoi-1': 'EOI/RAJ/SKILL/2026/04',
        'eoi-2': '',
        'eoi-3': '',
        'eoi-4': '10 / 13 / 2026',
        'eoi-5': '10 / 13 / 2026',
        'eoi-6': 'General',
        'eoi-7': 'Expression of Interest for Empanelment of Training Partners under Skill Development Mission.',
        'eoi-8': '50000',
        'eoi-9': '5000'
      };
    } else {
      this.previewFormValues = {
        'crf-4': '10/13/2026',
        'crf-5': 'Rajasthan',
        'crf-9': 'No',
        'crf-10': 'No',
        'crf-11': 'Not Applicable',
        'crf-16': 'Rajasthan',
        'crf-20': 'Rajasthan',
        'crf-203': '10/13/2026',
        'crf-212': 'Rajasthan',
        'crf-303': 'NEFT',
        'crf-304': 'Current'
      };
    }
    this.showPreviewModal.set(true);
  }

  closePreviewModal(): void {
    this.showPreviewModal.set(false);
    this.selectedPreviewForm.set(null);
    this.previewStepIndex.set(0);
    this.applyEoiStep.set(1);
    this.eoiDocumentRows = [];
    this.deptUserSubmitted.set(false);
    this.deptUserSchemeDropdownOpen.set(false);
  }

  goToPreviewStep(idx: number): void {
    this.previewStepIndex.set(idx);
  }

  previewNextStep(form: DynamicFormBuilderItem): void {
    if (form.steps && this.previewStepIndex() < form.steps.length - 1) {
      this.previewStepIndex.update(idx => idx + 1);
    }
  }

  previewPrevStep(): void {
    if (this.previewStepIndex() > 0) {
      this.previewStepIndex.update(idx => idx - 1);
    }
  }

  getStepSubtitle(form: DynamicFormBuilderItem, stepIdx: number): string {
    if (form.formType === 'Company Registration Form' || form.formType === 'Organisation Registration Form' || form.steps?.length === 4) {
      switch (stepIdx) {
        case 0: return 'Please provide your organisation details to complete the registration process.';
        case 1: return 'Provide details of the person authorized to sign and represent the organization.';
        case 2: return 'Provide bank account details for receiving payments under the scheme.';
        case 3: return 'Please verify the information provided below. You can edit any section if required.';
        default: return 'Please complete the registration process.';
      }
    }
    return form.steps?.[stepIdx]?.title ? `Please fill in details for ${form.steps[stepIdx].title}` : 'Please provide details to complete the form.';
  }

  getStepCardTitle(form: DynamicFormBuilderItem, stepIdx: number): string {
    const title = form.steps?.[stepIdx]?.title || '';
    if (title.toLowerCase().includes('details')) return title;
    return `${title} Details`;
  }

  getStepInnerDescription(form: DynamicFormBuilderItem, stepIdx: number): string {
    switch (stepIdx) {
      case 1: return 'Provide details of the person authorized to sign and represent the organization.';
      case 2: return 'Provide bank account details for receiving payments under the scheme.';
      case 3: return 'Please verify the information provided below. You can edit any section if required.';
      default: return '';
    }
  }

  isReviewStep(form: DynamicFormBuilderItem, stepIdx: number): boolean {
    if (!form.steps || form.steps.length === 0) return false;
    return stepIdx === form.steps.length - 1;
  }

  onDateChange(fieldId: string): void {
    if (fieldId === 'crf-203') {
      this.calculateAge();
    }
  }

  calculateAge(): void {
    const dobVal = this.previewFormValues['crf-203'];
    if (!dobVal) return;
    const parts = dobVal.includes('/') ? dobVal.split('/') : dobVal.split('-');
    let birthDate: Date;
    if (parts.length === 3 && dobVal.includes('/')) {
      birthDate = new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
    } else {
      birthDate = new Date(dobVal);
    }
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      this.previewFormValues['crf-204'] = age > 0 ? String(age) : 'Auto-calculated';
    }
  }

  onSameAddressToggle(): void {
    if (this.isOfficeSameAsRegistered) {
      this.previewFormValues['crf-19'] = this.previewFormValues['crf-15'] || '';
      this.previewFormValues['crf-20'] = this.previewFormValues['crf-16'] || 'Rajasthan';
      this.previewFormValues['crf-21'] = this.previewFormValues['crf-17'] || '';
      this.previewFormValues['crf-22'] = this.previewFormValues['crf-18'] || '';
    }
  }

  simulateFileUpload(field: DynamicFormField): void {
    const sampleMap: Record<string, string> = {
      'crf-6': 'Incorporation_Certificate.pdf (2.4 MB)',
      'crf-8': 'Organisation_PAN_Card.pdf (1.2 MB)',
      'crf-214': 'Board_Resolution_Auth.pdf (1.8 MB)',
      'crf-215': 'Authorized_Person_ID.pdf (1.5 MB)',
      'crf-310': 'Cancelled_Cheque_Passbook.jpg (820 KB)'
    };
    const fileName = sampleMap[field.id] || `${field.label.replace(/[^a-zA-Z0-9]/g, '_')}_document.pdf (1.5 MB)`;
    this.uploadedFiles[field.id] = fileName;
    this.notification.success(`${field.label} uploaded successfully.`);
  }

  removeUploadedFile(fieldId: string, event: Event): void {
    event.stopPropagation();
    delete this.uploadedFiles[fieldId];
  }

  saveAsDraft(): void {
    this.notification.info('Registration details saved as draft.');
  }

  downloadPdf(): void {
    this.notification.success('Organisation Registration summary PDF downloaded successfully.');
  }

  registerSubmit(): void {
    const refNo = 'REG-2026-' + Math.floor(10000 + Math.random() * 90000);
    this.notification.success(`Organisation Registration submitted successfully! Reference No: ${refNo}`);
    this.closePreviewModal();
  }

  isApplyEoiForm(form: DynamicFormBuilderItem): boolean {
    const name = (form.formType || '').toLowerCase();
    return name.includes('apply') && name.includes('eoi');
  }

  isEoiForm(form: DynamicFormBuilderItem): boolean {
    const name = (form.formType || '').toLowerCase();
    return name.includes('configure') || (name.includes('eoi') && !name.includes('apply'));
  }

  isDeptUserForm(form: DynamicFormBuilderItem): boolean {
    const name = (form.formType || '').toLowerCase();
    return name.includes('department') || name.includes('dept user') || name.includes('user registration');
  }

  getPreviewModalMaxWidth(): string {
    const form = this.selectedPreviewForm();
    if (!form) return 'max-w-[1100px]';
    if (this.isApplyEoiForm(form)) return 'max-w-[1240px]';
    if (this.isDeptUserForm(form)) return 'max-w-[780px]';
    if (this.isEoiForm(form)) return 'max-w-[760px]';
    return 'max-w-[1100px]';
  }

  toggleDeptUserSchemeDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.deptUserSchemeDropdownOpen.update(v => !v);
  }

  isDeptUserAllSchemesSelected(): boolean {
    return this.deptUserSelectedSchemes.includes('All Schemes') ||
      (this.deptUserSchemeOptions.length > 0 && this.deptUserSchemeOptions.every(s => this.deptUserSelectedSchemes.includes(s)));
  }

  isDeptUserSchemeSelected(scheme: string): boolean {
    if (this.isDeptUserAllSchemesSelected()) return true;
    return this.deptUserSelectedSchemes.includes(scheme);
  }

  toggleDeptUserAllSchemes(): void {
    if (this.isDeptUserAllSchemesSelected()) {
      this.deptUserSelectedSchemes = [];
    } else {
      this.deptUserSelectedSchemes = ['All Schemes', ...this.deptUserSchemeOptions];
    }
  }

  toggleDeptUserSchemeOption(scheme: string): void {
    const all = this.deptUserSchemeOptions;
    let current: string[];
    if (this.isDeptUserAllSchemesSelected()) {
      current = all.filter(s => s !== scheme);
    } else {
      const filtered = this.deptUserSelectedSchemes.filter(s => s !== 'All Schemes');
      if (filtered.includes(scheme)) {
        current = filtered.filter(s => s !== scheme);
      } else {
        current = [...filtered, scheme];
      }
    }
    if (all.length > 0 && all.every(s => current.includes(s))) {
      this.deptUserSelectedSchemes = ['All Schemes', ...all];
    } else {
      this.deptUserSelectedSchemes = current;
    }
  }

  getDeptUserSchemeDisplayLabel(): string {
    if (this.isDeptUserAllSchemesSelected()) {
      return `All Schemes (${this.deptUserSchemeOptions.length} selected)`;
    }
    const filtered = this.deptUserSelectedSchemes.filter(s => s !== 'All Schemes');
    if (filtered.length === 0) return 'Select Scheme Name';
    if (filtered.length <= 2) return filtered.join(', ');
    return `${filtered.length} schemes selected`;
  }

  submitDeptUser(): void {
    this.deptUserSubmitted.set(true);
    const sso = this.previewFormValues['du-1']?.trim();
    const role = this.previewFormValues['du-2']?.trim();
    const firstName = this.previewFormValues['du-3']?.trim();
    const lastName = this.previewFormValues['du-4']?.trim();
    const email = this.previewFormValues['du-5']?.trim();
    const mobile = this.previewFormValues['du-6']?.trim();

    if (!sso || !role || !firstName || !lastName || !email || !mobile) {
      this.notification.error('Please fill in all mandatory fields.');
      return;
    }

    this.notification.success(`User "${firstName} ${lastName} (${sso})" registered successfully!`);
    this.closePreviewModal();
  }

  resetApplyEoiDocuments(): void {
    this.applyEoiDocuments = [
      { id: 1, name: 'Covering Letter (Annexure 1)', category: 'mandatory' },
      { id: 2, name: 'Audited Financial Statements (Annexure 3)', category: 'mandatory' },
      { id: 3, name: 'Anti-Blacklisting Notarized Affidavit (Annexure 6)', category: 'mandatory' },
      { id: 4, name: 'Statutory Compliance Self-Declaration (Annexure 7)', category: 'mandatory' },
      { id: 5, name: 'Signed & Sealed EOI Document', category: 'mandatory' },
      { id: 6, name: 'Debarment Undertaking Document', category: 'mandatory' },
      { id: 7, name: 'Training & Placement Track Record (Annexure 5)', category: 'annexure' },
      { id: 8, name: 'Active Skill Development Centres (Annexure 4)', category: 'annexure' },
      { id: 9, name: 'Board of Directors Details (Annexure 8)', category: 'annexure' },
      { id: 10, name: 'Industry Placement Tie-ups & MOUs (Annexure 9)', category: 'annexure' },
      { id: 11, name: 'Relevant Sector Experience Proof (Annexure 10)', category: 'annexure' },
      { id: 12, name: 'District Cluster Mobilization Plan (Annexure 11)', category: 'annexure' },
      { id: 13, name: 'Technical Evaluation Matrix (Annexure 12)', category: 'annexure' },
      { id: 14, name: 'Supporting Credentials & Accreditations (Annexure 13)', category: 'annexure' },
      { id: 15, name: 'NSDC Stake Partner Certificate', category: 'remaining' },
      { id: 16, name: 'CA Turnover Certificate with UDIN (Annexure 14)', category: 'remaining' }
    ];
  }

  attachAllApplyMandatedAnnexures(): void {
    const sampleSizes = ['1.8 MB', '2.4 MB', '850 KB', '1.2 MB', '3.1 MB', '920 KB'];
    this.applyEoiDocuments.forEach((doc, idx) => {
      const sanitized = doc.name.replace(/[^a-zA-Z0-9]/g, '_');
      doc.uploadedFile = `${sanitized}.pdf`;
      doc.uploadedSize = sampleSizes[idx % sampleSizes.length];
    });
    this.notification.success('All 16 Mandated Annexures and Proposals attached successfully.');
  }

  uploadApplyDoc(docId: number): void {
    const doc = this.applyEoiDocuments.find(d => d.id === docId);
    if (!doc) return;
    const sanitized = doc.name.replace(/[^a-zA-Z0-9]/g, '_');
    doc.uploadedFile = `${sanitized}_Signed.pdf`;
    doc.uploadedSize = '1.8 MB';
    this.notification.success(`${doc.name} uploaded successfully.`);
  }

  removeApplyDoc(docId: number): void {
    const doc = this.applyEoiDocuments.find(d => d.id === docId);
    if (!doc) return;
    doc.uploadedFile = undefined;
    doc.uploadedSize = undefined;
    this.notification.info(`${doc.name} removed.`);
  }

  viewApplyDoc(fileName: string): void {
    this.notification.info(`Previewing ${fileName}`);
  }

  changeOtrDoc(doc: any): void {
    doc.fileName = `${doc.label.replace(/[^a-zA-Z0-9]/g, '_')}_Updated_2026.pdf`;
    doc.fileSize = '2.1 MB';
    this.notification.success(`${doc.label} updated successfully.`);
  }

  removeOtrDoc(doc: any): void {
    doc.fileName = 'Not_Uploaded.pdf';
    doc.fileSize = '0 KB';
    this.notification.info(`${doc.label} removed.`);
  }

  submitApplyEoi(): void {
    const org = this.previewFormValues['eoi-otr-1'] || 'Company';
    this.notification.success(`EOI Application for ${org} submitted to Complete Preview!`);
    this.closePreviewModal();
  }

  getApplyMandatoryUploadedCount(): number {
    return this.applyEoiDocuments.filter(d => d.category === 'mandatory' && !!d.uploadedFile).length;
  }

  getApplyAnnexureUploadedCount(): number {
    return this.applyEoiDocuments.filter(d => d.category === 'annexure' && !!d.uploadedFile).length;
  }

  getApplyRemainingUploadedCount(): number {
    return this.applyEoiDocuments.filter(d => d.category === 'remaining' && !!d.uploadedFile).length;
  }

  getFilteredApplyDocs(): Array<any> {
    const tab = this.selectedApplyDocTab();
    if (tab === 'all') return this.applyEoiDocuments;
    return this.applyEoiDocuments.filter(d => d.category === tab);
  }

  onEoiSchemeChange(scheme: string): void {
    if (!scheme) return;
    if (scheme.includes('Vishwakarma')) {
      this.previewFormValues['eoi-3'] = 'Rajvik';
    } else if (scheme.includes('Swarojgar')) {
      this.previewFormValues['eoi-3'] = 'samarth';
    } else if (scheme.includes('Sambal')) {
      this.previewFormValues['eoi-3'] = 'saksham';
    } else {
      this.previewFormValues['eoi-3'] = 'ALL';
    }

    if (this.eoiDocumentRows.length === 0) {
      this.eoiDocumentRows = [
        { docName: 'Registration Certificate / Incorporation' },
        { docName: 'Audited Balance Sheet & Financial Statements' },
        { docName: 'Past Experience & Work Order Copies' }
      ];
    }
  }

  addEoiDocumentRow(): void {
    this.eoiDocumentRows.push({ docName: '' });
  }

  removeEoiDocumentRow(index: number): void {
    if (index >= 0 && index < this.eoiDocumentRows.length) {
      this.eoiDocumentRows.splice(index, 1);
    }
  }

  simulateRowDocUpload(index: number): void {
    const row = this.eoiDocumentRows[index];
    if (!row) return;
    const name = row.docName ? row.docName.replace(/[^a-zA-Z0-9]/g, '_') : 'Document';
    row.uploadedFile = `${name}_signed.pdf (1.8 MB)`;
    this.notification.success('Document uploaded successfully.');
  }

  publishEoi(): void {
    const refNo = this.previewFormValues['eoi-1'] || 'EOI/2026/001';
    this.notification.success(`EOI "${refNo}" published successfully!`);
    this.closePreviewModal();
  }

  getVal(fieldId: string): string {
    return this.previewFormValues[fieldId] || '';
  }

  getFieldColSpan(field: DynamicFormField): string {
    switch (field.id) {
      case 'crf-1': return 'col-span-12 lg:col-span-9';
      case 'crf-2': return 'col-span-12 lg:col-span-3';
      case 'crf-3':
      case 'crf-4':
      case 'crf-5': return 'col-span-12 sm:col-span-4';
      case 'crf-6': return 'col-span-12';
      case 'crf-7':
      case 'crf-8':
      case 'crf-9':
      case 'crf-10':
      case 'crf-11':
      case 'crf-12':
      case 'crf-13':
      case 'crf-14': return 'col-span-12 sm:col-span-6 lg:col-span-3';
      case 'crf-15': return 'col-span-12 lg:col-span-6';
      case 'crf-16':
      case 'crf-17':
      case 'crf-18': return 'col-span-12 sm:col-span-4 lg:col-span-2';
      case 'crf-19': return 'col-span-12 lg:col-span-6';
      case 'crf-20':
      case 'crf-21':
      case 'crf-22': return 'col-span-12 sm:col-span-4 lg:col-span-2';
      case 'crf-201': return 'col-span-12 sm:col-span-5';
      case 'crf-202': return 'col-span-12 sm:col-span-3';
      case 'crf-203': return 'col-span-12 sm:col-span-2';
      case 'crf-204': return 'col-span-12 sm:col-span-2';
      case 'crf-205':
      case 'crf-206':
      case 'crf-207':
      case 'crf-208': return 'col-span-12 sm:col-span-6 lg:col-span-3';
      case 'crf-209':
      case 'crf-210':
      case 'crf-211': return 'col-span-12 sm:col-span-4';
      case 'crf-212': return 'col-span-12 sm:col-span-3';
      case 'crf-213': return 'col-span-12 sm:col-span-9';
      case 'crf-214':
      case 'crf-215': return 'col-span-12 sm:col-span-6';
      case 'crf-301':
      case 'crf-302': return 'col-span-12 sm:col-span-4';
      case 'crf-303':
      case 'crf-304': return 'col-span-12 sm:col-span-2';
      case 'crf-305': return 'col-span-12 sm:col-span-5';
      case 'crf-306': return 'col-span-12 sm:col-span-3';
      case 'crf-307':
      case 'crf-308': return 'col-span-12 sm:col-span-2';
      case 'crf-309':
      case 'crf-310': return 'col-span-12';
      default:
        if (field.type === 'photo') return 'col-span-12';
        return 'col-span-12 sm:col-span-6';
    }
  }

  getFieldPlaceholder(field: DynamicFormField): string {
    const placeholders: Record<string, string> = {
      'crf-1': 'Enter organisation name',
      'crf-3': 'Enter registration number',
      'crf-7': 'Enter organisation PAN',
      'crf-12': 'Enter mobile number',
      'crf-13': 'Enter email address',
      'crf-14': 'Enter website (https://www.example.com)',
      'crf-15': 'Enter address, locality, building name and number',
      'crf-18': 'Enter PIN code',
      'crf-19': 'Enter office address, locality, building name and number',
      'crf-22': 'Enter PIN code',
      'crf-201': 'Enter full name',
      'crf-204': 'Auto-calculated',
      'crf-205': 'Enter PAN number',
      'crf-206': 'Enter mobile number',
      'crf-207': 'Enter email address',
      'crf-208': 'Enter Aadhaar number',
      'crf-209': 'Enter Bhamashah number',
      'crf-210': 'Enter voter ID number',
      'crf-211': 'Enter passport number',
      'crf-213': 'Enter house/flat no., street, locality, city, PIN code',
      'crf-302': 'Enter branch name',
      'crf-305': 'Enter account holder name',
      'crf-306': 'Enter account number',
      'crf-307': 'Enter IFSC code',
      'crf-308': 'Enter MICR code (9 digits)',
      'crf-309': 'Enter branch address, street, locality, city, PIN code'
    };
    return placeholders[field.id] || (field.label ? `Enter ${field.label.toLowerCase()}` : 'Enter value');
  }

  getDropdownPlaceholder(field: DynamicFormField): string {
    switch (field.id) {
      case 'crf-2': return 'Select nature of entity';
      case 'crf-17':
      case 'crf-21': return 'Select district';
      case 'crf-202': return 'Select designation';
      case 'crf-301': return 'Select bank';
      default: return `Select ${field.label.toLowerCase()}`;
    }
  }

  // --- Delete Modal ---

  openDeleteConfirmModal(item: DynamicFormBuilderItem): void {
    this.formToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.formToDelete.set(null);
  }

  confirmDeleteForm(): void {
    const target = this.formToDelete();
    if (!target) return;

    this.formRepo.delete(target.id).subscribe(() => {
      const updated = this.forms().filter(f => f.id !== target.id);
      updated.forEach((item, idx) => {
        item.sNo = idx + 1;
      });
      this.forms.set(updated);
      this.closeDeleteModal();
    });
  }
}
