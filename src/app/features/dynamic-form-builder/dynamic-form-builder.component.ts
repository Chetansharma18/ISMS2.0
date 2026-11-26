import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  ButtonComponent,
  IconComponent,
  InputDirective,
  MasterFilterBarComponent,
  MasterFilterConfig,
  ModalComponent,
  PageShellComponent,
  StatusFilterOption,
  SwitchComponent
} from '../../shared';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableColumn } from '../../shared/components/table/table.types';
import { ApiError } from '../../core/http/api-error';
import { NotificationService } from '../../core/services/notification.service';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { DynamicFormBuilderItem } from '../../core/models/admin-masters.model';
import { DynamicFormRendererComponent } from './parts/dynamic-form-renderer.component';
import { FormManagerApiService } from './form-manager-api.service';
import { FormManagerForm } from './form-manager.model';
import {
  EditorField,
  EditorForm,
  FIELD_TYPE_CHOICES,
  fieldCount,
  hasLengthRules,
  hasOptions,
  isFileType,
  isNumberType,
  isStepSchema,
  moduleOptions,
  newEditorField,
  newEditorForm,
  newEditorStep,
  schemaSteps,
  setStepMode,
  suggestFormKey,
  syncFieldKey,
  toEditorForm,
  toRendererItem,
  toSchema
} from './form-manager.util';

/** Backend table that guards /api/form-manager. */
const TABLE = 'FormManager';

interface FormRow extends FormManagerForm {
  sNo: number;
  status: 'Active' | 'Inactive';
  isStepForm: boolean;
  stepCount: number;
  fields: number;
}

/**
 * Dynamic Form Builder over the backend's Form Manager (`/api/form-manager`): list the forms, create a form
 * (version 1), edit it (a changed schema is published as a new version), switch it on or off, and preview any
 * version with the shared form renderer. The backend decides what is valid; its messages are shown as they come.
 */
@Component({
  selector: 'app-dynamic-form-builder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent,
    IconComponent,
    InputDirective,
    ModalComponent,
    PageShellComponent,
    SwitchComponent,
    MasterFilterBarComponent,
    DynamicFormRendererComponent
  ],
  template: `
    <app-page-shell>
      @if (editor(); as form) {
        <!-- ================= BUILDER SCREEN ================= -->
        <div class="space-y-5">
          <div>
            <button appButton variant="outline" size="sm" type="button" (click)="closeEditor()">
              <app-icon name="back" size="sm" />
              <span>Back</span>
            </button>
          </div>

          <div class="flex items-baseline justify-between gap-3 flex-wrap">
            <h1 class="text-2xl sm:text-[28px] font-bold text-[#7C0E44] tracking-tight m-0">
              {{ form.id ? 'Edit Dynamic Form' : 'Create Dynamic Form' }}
            </h1>
            @if (form.id) {
              <span class="text-xs text-slate-500">
                Current version <span class="font-semibold text-slate-800 tabular-nums">v{{ form.currentVersion }}</span>.
                Saving a changed form publishes v{{ form.currentVersion + 1 }}.
              </span>
            }
          </div>

          <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 text-[13px]">
            @if (saveError()) {
              <div class="p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-700 font-medium">{{ saveError() }}</div>
            }

            <!-- Form details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="fm-title" class="block text-slate-700 font-semibold mb-1">Form Name <span class="text-rose-600">*</span></label>
                <input id="fm-title" appInput type="text" class="w-full" [(ngModel)]="form.title" (ngModelChange)="onTitleChange(form)"
                  placeholder="e.g. Center Inspection Form" [invalid]="!!fieldError('title')" />
                @if (fieldError('title'); as msg) { <div class="text-xs text-red-600 mt-1">{{ msg }}</div> }
              </div>
              <div>
                <label for="fm-key" class="block text-slate-700 font-semibold mb-1">Form Key <span class="text-rose-600">*</span></label>
                <input id="fm-key" appInput type="text" class="w-full tabular-nums" [(ngModel)]="form.formKey" (ngModelChange)="form.keyEdited = true"
                  [readOnly]="!!form.id" placeholder="e.g. center-inspection" [invalid]="!!fieldError('formKey')" />
                @if (fieldError('formKey'); as msg) {
                  <div class="text-xs text-red-600 mt-1">{{ msg }}</div>
                } @else {
                  <div class="text-[11px] text-slate-500 mt-1">
                    {{ form.id ? 'The key cannot be changed.' : 'Used by the system to find the form (e.g. otr-organisation adds fields to that OTR step).' }}
                  </div>
                }
              </div>
              <div>
                <label for="fm-module" class="block text-slate-700 font-semibold mb-1">Module</label>
                <select id="fm-module" appInput class="w-full" [(ngModel)]="form.moduleName">
                  @for (m of modules(); track m) { <option [value]="m">{{ m }}</option> }
                </select>
              </div>
              <div>
                <label for="fm-desc" class="block text-slate-700 font-semibold mb-1">Description</label>
                <input id="fm-desc" appInput type="text" class="w-full" [(ngModel)]="form.description" placeholder="Short description (optional)" />
              </div>
            </div>

            <!-- Step form switch -->
            <div class="p-4 rounded-lg border border-slate-200 bg-[#FCF8FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span class="block text-xs font-bold text-slate-800">Step Form</span>
                <span class="text-[11px] text-slate-500">Group the fields into steps. Each step's title is saved as the fields' section.</span>
              </div>
              <div class="inline-flex items-center gap-2.5 shrink-0">
                <app-switch color="navy" [checked]="form.isStepForm" label="Step form" (toggled)="toggleStepMode(form)" />
                <span class="text-xs font-bold text-slate-700">{{ form.isStepForm ? 'Yes (Step Form)' : 'No (Direct Form)' }}</span>
              </div>
            </div>

            @if (form.isStepForm) {
              <div class="space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 class="font-bold text-slate-800 text-sm m-0">Form Steps ({{ form.steps.length }})</h3>
                  <button appButton size="sm" type="button" (click)="addStep(form)">
                    <app-icon name="plus" size="xs" />
                    <span>Add Step</span>
                  </button>
                </div>
                <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  @for (step of form.steps; track step.uid; let i = $index) {
                    <span class="inline-flex items-center gap-1 shrink-0">
                      <button appButton size="sm" type="button" [variant]="activeStep() === i ? 'primary' : 'outline'" (click)="activeStep.set(i)">
                        Step {{ i + 1 }}: {{ step.title || 'Untitled' }} ({{ step.fields.length }})
                      </button>
                      @if (form.steps.length > 1) {
                        <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="removeStep(form, i)" title="Remove step" aria-label="Remove step">
                          <app-icon name="close" size="xs" />
                        </button>
                      }
                    </span>
                  }
                </div>
                @if (form.steps[activeStep()]; as step) {
                  <div>
                    <label for="fm-step-title" class="block text-xs font-bold text-slate-700 mb-1">Step {{ activeStep() + 1 }} Title</label>
                    <input id="fm-step-title" appInput size="sm" type="text" class="w-full" [(ngModel)]="step.title" placeholder="e.g. Basic Information" />
                  </div>
                }
              </div>
            }

            <!-- Fields -->
            @if (form.steps[form.isStepForm ? activeStep() : 0]; as step) {
              <div class="space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 class="font-bold text-slate-800 text-sm m-0">
                    {{ form.isStepForm ? 'Fields for Step ' + (activeStep() + 1) : 'Form Fields' }} ({{ step.fields.length }})
                  </h3>
                  <button appButton size="sm" type="button" (click)="addField(step.fields)">
                    <app-icon name="plus" size="xs" />
                    <span>Add Field</span>
                  </button>
                </div>

                @if (step.fields.length === 0) {
                  <div class="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500">
                    No fields yet. Use "Add Field" to add one.
                  </div>
                }

                @for (field of step.fields; track field.uid; let i = $index) {
                  <div class="p-4 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-3">
                    <div class="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <span class="text-xs font-semibold text-slate-700">#{{ i + 1 }} {{ field.label || 'Untitled Field' }}</span>
                      <div class="flex items-center gap-1">
                        <button appButton variant="ghost" size="sm" iconOnly type="button" [disabled]="i === 0" (click)="moveField(step.fields, i, -1)" title="Move up" aria-label="Move up">
                          <app-icon name="chevron-up" size="sm" />
                        </button>
                        <button appButton variant="ghost" size="sm" iconOnly type="button" [disabled]="i === step.fields.length - 1" (click)="moveField(step.fields, i, 1)" title="Move down" aria-label="Move down">
                          <app-icon name="chevron-down" size="sm" />
                        </button>
                        <button appButton variant="danger" size="sm" iconOnly type="button" (click)="removeField(step.fields, i)" title="Delete field" aria-label="Delete field">
                          <app-icon name="trash" size="xs" />
                        </button>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      <div class="sm:col-span-4">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Label</label>
                        <input appInput size="sm" type="text" class="w-full" [(ngModel)]="field.label" (ngModelChange)="onLabelChange(form, field)" placeholder="e.g. Center Address" />
                      </div>
                      <div class="sm:col-span-3">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Field Key</label>
                        <input appInput size="sm" type="text" class="w-full" [(ngModel)]="field.fieldKey" (ngModelChange)="field.keyEdited = true" placeholder="center_address" />
                      </div>
                      <div class="sm:col-span-3">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Field Type</label>
                        <select appInput size="sm" class="w-full" [(ngModel)]="field.fieldType">
                          @for (t of fieldTypes; track t.value) { <option [value]="t.value">{{ t.label }}</option> }
                        </select>
                      </div>
                      <div class="sm:col-span-2 sm:pt-6">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                          <input type="checkbox" class="w-4 h-4 accent-[#7C0E44] cursor-pointer" [(ngModel)]="field.isRequired" />
                          <span>Required</span>
                        </label>
                      </div>

                      <div class="sm:col-span-4">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Placeholder</label>
                        <input appInput size="sm" type="text" class="w-full" [(ngModel)]="field.placeholder" />
                      </div>
                      <div class="sm:col-span-4">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Help Text</label>
                        <input appInput size="sm" type="text" class="w-full" [(ngModel)]="field.tooltip" />
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Default Value</label>
                        <input appInput size="sm" type="text" class="w-full" [(ngModel)]="field.defaultValue" />
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Width</label>
                        <select appInput size="sm" class="w-full" [(ngModel)]="field.colSpan">
                          <option [ngValue]="6">Half</option>
                          <option [ngValue]="12">Full</option>
                        </select>
                      </div>

                      @if (hasOptions(field.fieldType)) {
                        <div class="sm:col-span-12">
                          <label class="block text-xs font-semibold text-slate-700 mb-1">Options (comma-separated)</label>
                          <input appInput size="sm" type="text" class="w-full" [(ngModel)]="field.optionsText" placeholder="e.g. Yes, No" />
                        </div>
                      }
                      @if (hasLengthRules(field.fieldType)) {
                        <div class="sm:col-span-2">
                          <label class="block text-xs font-semibold text-slate-700 mb-1">Min Length</label>
                          <input appInput size="sm" type="number" class="w-full" [(ngModel)]="field.minLength" />
                        </div>
                        <div class="sm:col-span-2">
                          <label class="block text-xs font-semibold text-slate-700 mb-1">Max Length</label>
                          <input appInput size="sm" type="number" class="w-full" [(ngModel)]="field.maxLength" />
                        </div>
                        <div class="sm:col-span-8">
                          <label class="block text-xs font-semibold text-slate-700 mb-1">Pattern (regular expression)</label>
                          <input appInput size="sm" type="text" class="w-full" [(ngModel)]="field.regexPattern" placeholder="e.g. ^[A-Z]{5}[0-9]{4}[A-Z]$" />
                        </div>
                      }
                      @if (isNumberType(field.fieldType)) {
                        <div class="sm:col-span-3">
                          <label class="block text-xs font-semibold text-slate-700 mb-1">Min Value</label>
                          <input appInput size="sm" type="number" class="w-full" [(ngModel)]="field.minValue" />
                        </div>
                        <div class="sm:col-span-3">
                          <label class="block text-xs font-semibold text-slate-700 mb-1">Max Value</label>
                          <input appInput size="sm" type="number" class="w-full" [(ngModel)]="field.maxValue" />
                        </div>
                      }
                      @if (isFileType(field.fieldType)) {
                        <div class="sm:col-span-6">
                          <label class="block text-xs font-semibold text-slate-700 mb-1">Allowed File Types</label>
                          <input appInput size="sm" type="text" class="w-full" [(ngModel)]="field.allowedExtensions" placeholder=".pdf,.jpg,.png" />
                        </div>
                        <div class="sm:col-span-3">
                          <label class="block text-xs font-semibold text-slate-700 mb-1">Max Size (MB)</label>
                          <input appInput size="sm" type="number" class="w-full" [(ngModel)]="field.maxFileSizeMb" />
                        </div>
                      }
                      <div class="sm:col-span-6">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Error Message</label>
                        <input appInput size="sm" type="text" class="w-full" [(ngModel)]="field.customErrorMessage" placeholder="Shown when the value is not accepted" />
                      </div>
                      <div class="sm:col-span-6">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Show Only When</label>
                        <input appInput size="sm" type="text" class="w-full" [(ngModel)]="field.visibilityCondition" placeholder="e.g. gst_registered == 'Yes'" />
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            @if (form.id) {
              <div>
                <label for="fm-changelog" class="block text-slate-700 font-semibold mb-1">What changed (version note)</label>
                <input id="fm-changelog" appInput type="text" class="w-full" [(ngModel)]="form.changelog" placeholder="e.g. Added GST fields" />
              </div>
            }

            <div class="flex items-center justify-between gap-3 pt-5 border-t border-slate-200">
              <button appButton variant="outline" type="button" (click)="closeEditor()">Cancel</button>
              <div class="flex items-center gap-2">
                <button appButton variant="outline" type="button" (click)="previewEditor(form)">
                  <app-icon name="eye" size="sm" />
                  <span>Preview</span>
                </button>
                <button appButton type="button" [disabled]="saving()" (click)="save(form)">
                  {{ saving() ? 'Saving...' : form.id ? 'Update Form' : 'Save Form' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- ================= LIST ================= -->
        <app-page-header
          title="Dynamic Form Builder"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Dynamic Form Builder' }]"
          [searchable]="false"
        >
          @if (canAdd()) {
            <button appButton size="sm" type="button" (click)="openCreate()">
              <app-icon name="plus" size="sm" />
              <span>Add new Form</span>
            </button>
          }
        </app-page-header>

        <app-master-filter-bar
          [(searchQuery)]="searchQuery"
          searchPlaceholder="Search by form name, key or field label..."
          [(status)]="statusFilter"
          [showStatusFilter]="true"
          [statusOptions]="statusOptions"
          [filters]="filters()"
          [(filterValues)]="filterValues"
          [totalCount]="rows().length"
          [filteredCount]="filteredRows().length"
          itemUnit="forms"
          (resetFilters)="resetFilters()"
        />

        <ng-template #formTemplate let-item>
          <div class="flex flex-col gap-0.5 py-1">
            <span class="font-bold text-slate-800 text-[13.5px]">{{ item.title }}</span>
            <span class="text-[11.5px] text-slate-500 tabular-nums">{{ item.formKey }}</span>
            <span class="text-[11.5px] text-slate-600">
              {{ item.isStepForm ? 'Step Form (' + item.stepCount + ' steps)' : 'Direct Form' }} &middot; {{ item.fields }} fields
            </span>
          </div>
        </ng-template>

        <ng-template #versionTemplate let-item>
          <span class="tabular-nums">v{{ item.currentVersion }}</span>
        </ng-template>

        <ng-template #actionsTemplate let-item>
          <div class="flex items-center justify-center gap-1.5 whitespace-nowrap">
            <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="$event.stopPropagation(); openPreview(item)" title="View" aria-label="View">
              <app-icon name="eye" size="sm" />
            </button>
            @if (canEdit()) {
              <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="$event.stopPropagation(); openEdit(item)" title="Edit" aria-label="Edit">
                <app-icon name="edit" size="sm" />
              </button>
              <span class="inline-flex items-center" (click)="$event.stopPropagation()">
                <app-switch [checked]="item.isActive" [disabled]="busyId() === item.id" [label]="item.isActive ? 'Active' : 'Inactive'" (toggled)="toggleActive(item)" />
              </span>
            }
          </div>
        </ng-template>

        <app-table
          [rowClass]="rowClass"
          [columns]="columns"
          [data]="filteredRows()"
          [loading]="loading()"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="forms"
          [emptyMessage]="loadError() || 'No dynamic forms found.'"
          [customTemplates]="{ title: formTemplate, currentVersion: versionTemplate, actions: actionsTemplate }"
        />
      }

      <!-- ================= PREVIEW ================= -->
      @if (preview(); as item) {
        <app-modal [title]="'Preview: ' + item.formType" size="xl" [showClose]="false" (close)="closePreview()">
          @if (previewVersions().length > 1) {
            <div class="flex items-center gap-2 mb-4 text-xs">
              <label for="fm-version" class="font-semibold text-slate-700">Version</label>
              <select id="fm-version" appInput size="sm" [ngModel]="previewVersion()" (ngModelChange)="loadPreviewVersion($event)">
                @for (v of previewVersions(); track v) { <option [ngValue]="v">v{{ v }}</option> }
              </select>
            </div>
          }
          @if (previewLoading()) {
            <p class="text-xs text-slate-500">Loading...</p>
          } @else {
            @if (item.fields.length === 0) {
              <p class="text-xs text-slate-500">This version has no fields.</p>
            } @else {
              <app-dynamic-form-renderer [form]="item" [isPreview]="true" (cancelled)="closePreview()" (submitted)="previewSubmitted()" />
            }
          }
        </app-modal>
      }
    </app-page-shell>
  `
})
export class DynamicFormBuilderComponent {
  private readonly api = inject(FormManagerApiService);
  private readonly notifications = inject(NotificationService);
  private readonly tableAccess = inject(TableAccessService);
  private readonly destroyRef = inject(DestroyRef);

  readonly fieldTypes = FIELD_TYPE_CHOICES;
  readonly hasOptions = hasOptions;
  readonly hasLengthRules = hasLengthRules;
  readonly isNumberType = isNumberType;
  readonly isFileType = isFileType;

  readonly forms = signal<FormManagerForm[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);

  readonly editor = signal<EditorForm | null>(null);
  readonly activeStep = signal(0);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  private readonly fieldErrors = signal<Record<string, string>>({});

  readonly preview = signal<DynamicFormBuilderItem | null>(null);
  readonly previewForm = signal<FormManagerForm | null>(null);
  readonly previewVersion = signal(0);
  readonly previewLoading = signal(false);

  readonly searchQuery = signal('');
  readonly statusFilter = signal('ALL');
  readonly filterValues = signal<Record<string, string>>({});
  readonly statusOptions: StatusFilterOption[] = [
    { value: 'ALL', label: 'All' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  readonly columns: TableColumn<FormRow>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    { key: 'title', label: 'Form', type: 'custom', cellClass: 'min-w-[280px]' },
    { key: 'moduleName', label: 'Module', width: 'w-28' },
    { key: 'currentVersion', label: 'Version', type: 'custom', align: 'center', width: 'w-24' },
    { key: 'actions', label: 'Actions', type: 'custom', align: 'center', width: 'w-40 min-w-[140px]' }
  ];

  readonly rowClass = (item: FormRow): string => (item.isActive ? 'bg-white' : 'opacity-50 !bg-slate-100/70');

  readonly modules = computed(() => {
    const list = moduleOptions(this.forms());
    const current = this.editor()?.moduleName;
    return current && !list.includes(current) ? [...list, current] : list;
  });

  readonly rows = computed<FormRow[]>(() =>
    this.forms().map((f, i) => ({
      ...f,
      sNo: i + 1,
      status: f.isActive ? 'Active' : 'Inactive',
      isStepForm: isStepSchema(f.activeSchema),
      stepCount: schemaSteps(f.activeSchema).length,
      fields: fieldCount(f.activeSchema)
    }))
  );

  readonly filters = computed<MasterFilterConfig[]>(() => [
    { key: 'type', label: 'Form Type', placeholder: 'All Form Types', options: ['Step Form', 'Direct Form'] },
    { key: 'module', label: 'Module', placeholder: 'All Modules', options: moduleOptions(this.forms()) }
  ]);

  readonly filteredRows = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const { type, module } = this.filterValues();
    return this.rows()
      .filter(r => status === 'ALL' || r.status === status)
      .filter(r => !type || (type === 'Step Form') === r.isStepForm)
      .filter(r => !module || r.moduleName === module)
      .filter(r =>
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.formKey.toLowerCase().includes(q) ||
        (r.activeSchema?.fields ?? []).some(f => f.label?.toLowerCase().includes(q))
      )
      .map((r, i) => ({ ...r, sNo: i + 1 }));
  });

  readonly previewVersions = computed(() => {
    const n = this.previewForm()?.currentVersion ?? 0;
    return Array.from({ length: n }, (_, i) => n - i);
  });

  constructor() {
    this.load();
  }

  canAdd(): boolean {
    return this.tableAccess.can(TABLE, 'POST');
  }

  canEdit(): boolean {
    return this.tableAccess.can(TABLE, 'PUT');
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api
      .listWithSchemas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: list => {
          this.forms.set(list);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loadError.set(error instanceof ApiError ? error.message : 'Forms could not be loaded.');
          this.loading.set(false);
        }
      });
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('ALL');
    this.filterValues.set({});
  }

  // ---------------------------------------------------------------- builder

  openCreate(): void {
    this.openEditor(newEditorForm());
  }

  openEdit(row: FormManagerForm): void {
    this.busyId.set(row.id);
    this.api
      .get(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: form => {
          this.busyId.set(null);
          this.openEditor(toEditorForm(form));
        },
        error: () => this.busyId.set(null)
      });
  }

  closeEditor(): void {
    this.editor.set(null);
    this.saveError.set(null);
    this.fieldErrors.set({});
  }

  fieldError(key: string): string | undefined {
    return this.fieldErrors()[key];
  }

  onTitleChange(form: EditorForm): void {
    if (!form.id && !form.keyEdited) form.formKey = suggestFormKey(form.title);
  }

  onLabelChange(form: EditorForm, field: EditorField): void {
    syncFieldKey(form, field);
  }

  toggleStepMode(form: EditorForm): void {
    setStepMode(form, !form.isStepForm);
    this.activeStep.set(0);
  }

  addStep(form: EditorForm): void {
    form.steps = [...form.steps, newEditorStep(form.steps.length + 1)];
    this.activeStep.set(form.steps.length - 1);
  }

  removeStep(form: EditorForm, index: number): void {
    form.steps = form.steps.filter((_, i) => i !== index);
    this.activeStep.set(Math.min(this.activeStep(), form.steps.length - 1));
  }

  addField(fields: EditorField[]): void {
    fields.push(newEditorField());
  }

  removeField(fields: EditorField[], index: number): void {
    fields.splice(index, 1);
  }

  moveField(fields: EditorField[], index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= fields.length) return;
    const [item] = fields.splice(index, 1);
    fields.splice(target, 0, item);
  }

  /** Create (version 1) or update; an update always publishes the edited schema as the next version. */
  save(form: EditorForm): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.saveError.set(null);
    this.fieldErrors.set({});
    const schema = toSchema(form);
    const request = form.id
      ? this.api.update(form.id, {
          title: form.title.trim(),
          moduleName: form.moduleName,
          description: form.description.trim(),
          newSchema: schema,
          changelog: form.changelog.trim() || null
        })
      : this.api.create({
          formKey: form.formKey.trim(),
          title: form.title.trim(),
          moduleName: form.moduleName,
          description: form.description.trim() || null,
          schema
        });

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: saved => {
        this.saving.set(false);
        this.notifications.success(form.id ? `Form updated to version ${saved.currentVersion}.` : 'Form created.');
        this.closeEditor();
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.showSaveError(error);
      }
    });
  }

  toggleActive(row: FormManagerForm): void {
    if (this.busyId() !== null) return;
    const next = !row.isActive;
    this.busyId.set(row.id);
    this.api
      .update(row.id, { isActive: next })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.forms.update(list => list.map(f => (f.id === row.id ? { ...f, isActive: next } : f)));
        },
        error: (error: unknown) => {
          this.busyId.set(null);
          this.notifications.error(error instanceof ApiError ? error.message : 'The status could not be changed.');
        }
      });
  }

  // ---------------------------------------------------------------- preview

  openPreview(row: FormManagerForm): void {
    this.previewForm.set(row);
    this.loadPreviewVersion(row.currentVersion);
  }

  loadPreviewVersion(version: number): void {
    const form = this.previewForm();
    if (!form) return;
    this.previewVersion.set(Number(version));
    this.previewLoading.set(true);
    this.preview.set(toRendererItem({ id: form.id, title: form.title, description: form.description, version }, { title: form.title, fields: [] }));
    this.api
      .get(form.id, Number(version))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: full => {
          this.previewLoading.set(false);
          this.preview.set(this.rendererItem(full, Number(version)));
        },
        error: () => {
          this.previewLoading.set(false);
          this.closePreview();
        }
      });
  }

  /** Preview of the form being edited, before it is saved. */
  previewEditor(form: EditorForm): void {
    this.previewForm.set(null);
    this.previewLoading.set(false);
    this.preview.set(toRendererItem({ id: form.id, title: form.title, description: form.description }, toSchema(form)));
  }

  previewSubmitted(): void {
    this.notifications.info('Preview only: nothing was saved.');
    this.closePreview();
  }

  closePreview(): void {
    this.preview.set(null);
    this.previewForm.set(null);
  }

  // ---------------------------------------------------------------- internals

  private openEditor(form: EditorForm): void {
    this.activeStep.set(0);
    this.saveError.set(null);
    this.fieldErrors.set({});
    this.editor.set(form);
  }

  private rendererItem(form: FormManagerForm, version: number): DynamicFormBuilderItem {
    return toRendererItem(
      { id: form.id, title: form.title, description: form.description, version },
      form.activeSchema ?? { title: form.title, fields: [] }
    );
  }

  /** Backend messages: "FormKey is required." / "Title is required." (400), duplicate key (409), field errors. */
  private showSaveError(error: unknown): void {
    if (!(error instanceof ApiError)) {
      this.saveError.set('The form could not be saved. Please try again.');
      return;
    }
    const errors: Record<string, string> = {};
    for (const e of error.fieldErrors) {
      const key = e.field.replace(/^\$\./, '').toLowerCase();
      if (key.includes('formkey')) errors['formKey'] ??= e.message;
      else if (key.includes('title')) errors['title'] ??= e.message;
    }
    const message = error.message.toLowerCase();
    if (!errors['formKey'] && (message.includes('formkey') || message.includes('key'))) errors['formKey'] = error.message;
    else if (!errors['title'] && message.includes('title')) errors['title'] = error.message;
    this.fieldErrors.set(errors);
    this.saveError.set(Object.keys(errors).length > 0 ? null : error.message);
  }
}
