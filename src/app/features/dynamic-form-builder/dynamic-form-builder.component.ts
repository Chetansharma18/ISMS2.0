import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
      <app-table
        [columns]="tableColumns"
        [data]="filteredForms()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="forms"
        emptyMessage="No dynamic forms found. Click '+ Add new Form' to create one."
        [customTemplates]="{
          formType: formTypeTemplate,
          status: statusTemplate,
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

      <!-- Template: Status Column -->
      <ng-template #statusTemplate let-item>
        <button
          type="button"
          (click)="toggleStatus(item)"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none"
          [ngClass]="item.status === 'Inactive' ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'"
          title="Click to toggle status"
        >
          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="item.status === 'Inactive' ? 'bg-slate-400' : 'bg-emerald-500'"></span>
          <span>{{ item.status === 'Inactive' ? 'Inactive' : 'Active' }}</span>
        </button>
      </ng-template>



      <!-- Template: Form Actions (Preview, Edit, Delete) -->
      <ng-template #actionsTemplate let-item>
        <div class="flex items-center justify-center gap-2 whitespace-nowrap">
          <!-- Preview Form -->
          <button
            type="button"
            (click)="openPreviewModal(item)"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-brand hover:text-navy hover:bg-primary-light transition-colors cursor-pointer"
            title="Preview Form"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Preview</span>
          </button>

          <!-- Edit Form -->
          <button
            type="button"
            (click)="openEditModal(item)"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
            title="Edit Form"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>

          <!-- Delete Form -->
          <button
            type="button"
            (click)="openDeleteConfirmModal(item)"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete Form"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
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

      <!-- Modal: Interactive Form Preview (with Step Wizard support!) -->
      <app-action-modal
        [isOpen]="showPreviewModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="true"
        [showAccentBar]="false"
        primaryLabel=""
        secondaryLabel="Close Preview"
        maxWidthClass="max-w-[700px]"
        (secondaryAction)="closePreviewModal()"
        (close)="closePreviewModal()"
      >
        @if (selectedPreviewForm(); as form) {
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Interactive Preview
              </span>
              <span class="text-xs text-slate-400">
                {{ form.isStepForm ? 'Multi-Step Form Wizard' : 'Direct Single Form' }}
              </span>
            </div>

            <h2 class="m-0 text-navy" style="font-size: 19px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
              {{ form.formType }}
            </h2>

            <!-- MULTI-STEP PREVIEW WIZARD -->
            @if (form.isStepForm && form.steps && form.steps.length > 0) {
              <div class="mt-4 space-y-4 font-sans">
                <!-- Stepper Progress Header -->
                <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                  @for (step of form.steps; track step.id; let sIdx = $index) {
                    <div class="flex items-center gap-2">
                      <div
                        class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        [ngClass]="previewStepIndex() === sIdx
                          ? 'bg-primary text-white shadow-xs'
                          : previewStepIndex() > sIdx
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-600'"
                      >
                        {{ previewStepIndex() > sIdx ? '✓' : (sIdx + 1) }}
                      </div>
                      <span class="text-xs font-semibold hidden sm:inline" [class.text-primary]="previewStepIndex() === sIdx">
                        {{ step.title }}
                      </span>
                    </div>

                    @if (sIdx < form.steps.length - 1) {
                      <div class="flex-1 h-0.5 mx-2 bg-slate-200"></div>
                    }
                  }
                </div>

                <!-- Step Body -->
                @if (form.steps[previewStepIndex()]; as currentStep) {
                  <div class="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                    <h3 class="font-bold text-slate-800 text-sm m-0 border-b border-slate-200/80 pb-2">
                      Step {{ previewStepIndex() + 1 }}: {{ currentStep.title }}
                    </h3>

                    <!-- Current Step Fields -->
                    @for (field of currentStep.fields; track field.id) {
                      <div class="space-y-1.5">
                        <label class="block text-slate-700 font-semibold text-xs">
                          {{ field.label }}
                          @if (field.mandatory) { <span class="text-rose-500 font-bold ml-0.5">*</span> }
                        </label>

                        @if (field.type === 'text') {
                          <input type="text" placeholder="Enter {{ field.label }}..." class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary" />
                        }
                        @if (field.type === 'number') {
                          <input type="number" placeholder="Enter numeric value..." class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary" />
                        }
                        @if (field.type === 'datepicker') {
                          <input type="date" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary" />
                        }
                        @if (field.type === 'dropdown') {
                          <select class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary cursor-pointer">
                            <option value="" disabled selected>Select an option</option>
                            @for (opt of getOptionsArray(field); track opt) {
                              <option [value]="opt">{{ opt }}</option>
                            }
                          </select>
                        }
                        @if (field.type === 'photo') {
                          <div class="p-3.5 border-2 border-dashed border-slate-300 rounded-xl bg-white text-center cursor-pointer">
                            <div class="text-xs font-semibold text-purple-700">Click or Drag photos to upload</div>
                            <div class="text-[11px] text-slate-400 mt-1">
                              Min: {{ field.minPhotos || 1 }} • Max: {{ field.maxPhotos || 5 }} photos (Max {{ field.maxSizeMb || 5 }}MB)
                            </div>
                          </div>
                        }
                      </div>
                    }

                    <!-- Stepper Navigation Buttons -->
                    <div class="flex items-center justify-between pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        (click)="previewPrevStep()"
                        [disabled]="previewStepIndex() === 0"
                        class="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                      >
                        Previous Step
                      </button>

                      @if (previewStepIndex() < form.steps.length - 1) {
                        <button
                          type="button"
                          (click)="previewNextStep(form)"
                          class="px-4 py-1.5 rounded-lg bg-primary hover:bg-navy text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Next Step →
                        </button>
                      } @else {
                        <button
                          type="button"
                          (click)="closePreviewModal()"
                          class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Submit (Preview Demo)
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }

            <!-- DIRECT SINGLE-STEP PREVIEW -->
            @if (!form.isStepForm) {
              <div class="mt-4 space-y-4 font-sans bg-white p-4 rounded-xl border border-slate-200">
                @for (field of form.fields; track field.id) {
                  <div class="space-y-1.5">
                    <label class="block text-slate-700 font-semibold text-xs">
                      {{ field.label }}
                      @if (field.mandatory) { <span class="text-rose-500 font-bold ml-0.5">*</span> }
                    </label>

                    @if (field.type === 'text') {
                      <input type="text" placeholder="Enter {{ field.label }}..." class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary" />
                    }
                    @if (field.type === 'number') {
                      <input type="number" placeholder="Enter numeric value..." class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary" />
                    }
                    @if (field.type === 'datepicker') {
                      <input type="date" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary" />
                    }
                    @if (field.type === 'dropdown') {
                      <select class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary cursor-pointer">
                        <option value="" disabled selected>Select an option</option>
                        @for (opt of getOptionsArray(field); track opt) {
                          <option [value]="opt">{{ opt }}</option>
                        }
                      </select>
                    }
                    @if (field.type === 'photo') {
                      <div class="p-3.5 border-2 border-dashed border-slate-300 rounded-xl bg-white text-center cursor-pointer">
                        <div class="text-xs font-semibold text-purple-700">Click or Drag photos to upload</div>
                        <div class="text-[11px] text-slate-400 mt-1">
                          Min: {{ field.minPhotos || 1 }} • Max: {{ field.maxPhotos || 5 }} photos (Max {{ field.maxSizeMb || 5 }}MB)
                        </div>
                      </div>
                    }
                  </div>
                }

                <div class="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    (click)="closePreviewModal()"
                    class="w-full py-2 rounded-lg bg-primary hover:bg-navy text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Submit (Preview Demo)
                  </button>
                </div>
              </div>
            }
          </div>
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
  private formRepo = this.dataEngine.for<DynamicFormBuilderItem>('DYNAMIC_FORM_BUILDER');

  readonly forms = signal<DynamicFormBuilderItem[]>([]);
  readonly searchQuery = signal<string>('');

  readonly showBuilderModal = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);

  readonly showPreviewModal = signal<boolean>(false);
  readonly selectedPreviewForm = signal<DynamicFormBuilderItem | null>(null);
  readonly previewStepIndex = signal<number>(0);

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
    { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'w-28 min-w-[110px]' },
    { key: 'actions', label: 'Form actions', align: 'center', type: 'custom', width: 'min-w-[240px]' }
  ];

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
    this.showPreviewModal.set(true);
  }

  closePreviewModal(): void {
    this.showPreviewModal.set(false);
    this.selectedPreviewForm.set(null);
    this.previewStepIndex.set(0);
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
