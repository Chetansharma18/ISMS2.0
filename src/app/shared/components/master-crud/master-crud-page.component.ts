import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
  DestroyRef,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PageHeaderComponent } from '../page-header/page-header.component';
import { TableComponent } from '../table/table.component';
import { TableColumn } from '../table/table.types';
import { ActionModalComponent } from '../action-modal/action-modal.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { InputDirective } from '../form-controls/input/input.directive';
import { SwitchComponent } from '../switch/switch.component';
import { PageShellComponent } from '../../templates/page-shell/page-shell.component';
import { MasterFilterBarComponent, StatusFilterOption } from '../master-filter-bar/master-filter-bar.component';
import { DataEngineService, ResourceRepository } from '../../../core/services/data-engine.service';
import { MasterCrudConfig, MasterFieldConfig } from './master-crud.types';

/**
 * Generic master data CRUD page.
 *
 * Every "<Something> Master" admin screen (sector, designation, permission,
 * scheme, course, district/block, EOI category, user role...) is 90% identical:
 * a searchable table backed by DataEngineService, an Active/Inactive toggle,
 * and an add/edit modal with a handful of fields.
 *
 * Instead of duplicating that scaffolding per screen, each screen now supplies
 * a `MasterCrudConfig<T>` describing its columns/fields/validation, and this
 * component renders the whole page from that config.
 */
@Component({
  selector: 'app-master-crud-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ActionModalComponent,
    ButtonComponent,
    IconComponent,
    DropdownComponent,
    InputDirective,
    PageShellComponent,
    SwitchComponent,
    MasterFilterBarComponent
  ],
  template: `
    <app-page-shell>

      <!-- Page Header -->
      <app-page-header
        [title]="config.title"
        [subtitle]="config.subtitle"
        [breadcrumbs]="config.breadcrumbs || [{ label: 'Home', url: '/' }, { label: config.title }]"
      >
        <!-- Add Button -->
        <button
          appButton
          size="sm"
          type="button"
          (click)="openAddModal()"
          class="shrink-0"
        >
          <app-icon name="plus" size="sm" />
          <span>Add {{ config.entityLabel }}</span>
        </button>
      </app-page-header>

      <!-- Unified Master Filter & Search Bar -->
      <app-master-filter-bar
        [(searchQuery)]="searchQuery"
        [searchPlaceholder]="config.searchPlaceholder || 'Search ' + config.entityLabel.toLowerCase() + '...'"
        [(status)]="statusFilter"
        [showStatusFilter]="!!(config.hasStatus && !config.hideStatusFilter)"
        [statusOptions]="statusFilterOptions()"
        [filters]="config.filters || []"
        [(filterValues)]="filterValues"
        [totalCount]="items().length"
        [filteredCount]="filteredItems().length"
        [itemUnit]="config.itemUnit"
        (resetFilters)="resetFilters()"
      />

      <!-- Master Table -->
      <app-table
        [rowClass]="getRowClass"
        [columns]="tableColumns()"
        [data]="filteredItems()"
        [loading]="loading()"
        [pagination]="true"
        [pageSize]="10"
        [itemUnit]="config.itemUnit"
        [customTemplates]="customTemplates()"
      >
      </app-table>

      <!-- Tag-list cell template (reused for any array-valued column, e.g. permissions) -->
      <ng-template #tagsTemplate let-item let-column="column">
        <div class="flex flex-wrap gap-1.5 py-1">
          @for (tag of item[column.key]; track tag) {
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal bg-sky-50 text-brand border border-sky-200">
              {{ tag }}
            </span>
          }
        </div>
      </ng-template>

      <!-- Status badge cell template -->
      <ng-template #statusTemplate let-item>
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border select-none"
          [ngClass]="item.status === 'Inactive'
            ? 'bg-slate-100 text-slate-600 border-slate-300'
            : 'bg-emerald-50 text-emerald-700 border-emerald-300'"
        >
          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="item.status === 'Inactive' ? 'bg-slate-400' : 'bg-emerald-500'"></span>
          {{ item.status || 'Active' }}
        </span>
      </ng-template>

      <!-- Action cell template: View + Edit + Active/Inactive toggle -->
      <ng-template #actionTemplate let-item>
        <div class="flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap">
          @if (!config.hideViewAction) {
            <!-- View Button -->
            <button
              appButton
              variant="ghost"
              size="sm"
              iconOnly
              type="button"
              (click)="$event.stopPropagation(); openViewModal(item)"
              title="View Details"
              aria-label="View Details"
            >
              <app-icon name="eye" size="sm" />
            </button>

            <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>
          }

          <!-- Edit Button -->
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            (click)="$event.stopPropagation(); openEditModal(item)"
            title="Edit"
            aria-label="Edit"
          >
            <app-icon name="edit" size="sm" />
          </button>

          <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>

          <!-- Active / Inactive Toggle -->
          <div
            class="inline-flex items-center"
            [title]="item.status === 'Inactive' ? 'Status: Inactive (Click to activate)' : 'Status: Active (Click to deactivate)'"
            (click)="$event.stopPropagation()"
          >
            <app-switch
              [checked]="item.status !== 'Inactive'"
              [label]="item.status === 'Inactive' ? 'Inactive' : 'Active'"
              (toggled)="toggleStatus(item)"
            />
          </div>
        </div>
      </ng-template>

      <!-- Add / Edit Modal -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        [primaryLabel]="config.primaryActionLabel || 'Save'"
        secondaryLabel=""
        [maxWidthClass]="config.modalWidthClass || 'max-w-[520px]'"
        (primaryAction)="submit()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-brand-dark" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          {{ editingId() ? 'Edit' : 'Add New' }} {{ config.entityLabel }}
        </h2>

        <div class="mt-4 font-sans text-[13px] space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            @for (field of config.fields; track field.key) {
              <div [ngClass]="colSpanClass(field)">
                <label class="block text-slate-700 font-medium mb-1">
                  {{ field.label }}{{ field.required ? '*' : '' }}
                </label>

                @switch (field.type) {
                  @case ('textarea') {
                    <textarea
                      appInput
                      [rows]="field.rows || 3"
                      [attr.maxlength]="field.maxLength || null"
                      [placeholder]="field.placeholder || ''"
                      [(ngModel)]="formData[field.key]"
                      class="w-full"
                    ></textarea>
                  }
                  @case ('select') {
                    <select
                      appInput
                      [(ngModel)]="formData[field.key]"
                      [invalid]="fieldInvalid(field)"
                      class="w-full"
                    >
                      <option value="" disabled selected>Select {{ field.label }}</option>
                      @for (opt of resolveOptions(field); track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                  }
                  @case ('multiselect') {
                    <app-dropdown
                      multiple
                      overlay
                      [options]="resolveOptions(field)"
                      [values]="valuesOf(field)"
                      [placeholder]="'Select ' + field.label"
                      [summary]="getMultiselectLabel(field)"
                      [invalid]="fieldInvalid(field)"
                      (optionToggled)="toggleMultiselectOption(field, $event)"
                    />
                  }
                  @case ('number') {
                    <input
                      appInput
                      type="number"
                      [min]="field.min ?? 0"
                      [placeholder]="field.placeholder || ''"
                      [(ngModel)]="formData[field.key]"
                      [invalid]="fieldInvalid(field)"
                      class="w-full"
                    />
                  }
                  @case ('permissions') {
                    <div class="flex items-center gap-2">
                      <select
                        appInput
                        [(ngModel)]="pendingPermission"
                        class="flex-1"
                      >
                        <option value="" disabled selected>Select permission to add...</option>
                        @for (opt of unselectedPermissions(field); track opt) {
                          <option [value]="opt">{{ opt }}</option>
                        }
                      </select>
                      <button
                        appButton
                        iconOnly
                        type="button"
                        (click)="addPermission(field)"
                        [disabled]="!pendingPermission"
                        class="shrink-0"
                        title="Add Permission"
                        aria-label="Add Permission"
                      >
                        <app-icon name="plus" />
                      </button>
                    </div>

                    @if ((formData[field.key] || []).length > 0) {
                      <div class="mt-3 flex flex-wrap gap-2 border border-slate-200 rounded-lg p-3 bg-slate-50 min-h-[50px] items-center">
                        @for (perm of formData[field.key]; track perm) {
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-field-border text-brand shadow-2xs select-none">
                            <span>{{ perm }}</span>
                            <button appButton variant="ghost" size="xs" iconOnly type="button" (click)="removePermission(field, perm)" aria-label="Remove" title="Remove">
                              <app-icon name="close" size="xs" />
                            </button>
                          </span>
                        }
                      </div>
                    }
                  }
                  @default {
                    <input
                      appInput
                      type="text"
                      [attr.maxlength]="field.maxLength || null"
                      [placeholder]="field.placeholder || ''"
                      [(ngModel)]="formData[field.key]"
                      [invalid]="fieldInvalid(field)"
                      [ngClass]="field.uppercase ? 'tabular-nums text-xs' : ''"
                      class="w-full"
                    />
                  }
                }

                @if (fieldInvalid(field)) {
                  <div class="text-xs text-red-500 mt-1 font-medium">{{ field.label }} is required</div>
                }
              </div>
            }
          </div>
        </div>
      </app-action-modal>

      <!-- View Details Modal -->
      <app-action-modal
        [isOpen]="showViewModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="true"
        [showAccentBar]="false"
        primaryLabel=""
        secondaryLabel=""
        [maxWidthClass]="config.viewModalWidthClass || (config.modalWidthClass ? 'max-w-[620px]' : 'max-w-[540px]')"
        (secondaryAction)="closeViewModal()"
        (close)="closeViewModal()"
      >
        <h2 class="m-0 text-brand-dark pb-2.5 border-b border-slate-100" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          {{ config.entityLabel }} Details
        </h2>

        @if (selectedViewItem(); as viewItem) {
          <div class="mt-2.5 font-sans text-xs divide-y divide-slate-100">
            @for (col of viewableColumns(); track col.key) {
              @if (isLongText(col, viewItem)) {
                <div class="py-1.5 flex flex-col gap-0.5 text-xs first:pt-0">
                  <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {{ col.label }}
                  </span>
                  <span class="text-xs font-semibold text-slate-800 break-words leading-relaxed">
                    {{ formatViewValue(col, viewItem) }}
                  </span>
                </div>
              } @else {
                <div class="py-1.5 flex items-center justify-between gap-4 text-xs first:pt-0">
                  <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 max-w-[55%]">
                    {{ col.label }}
                  </span>
                  @if (isTagArray(col.key, viewItem)) {
                    <div class="flex flex-wrap justify-end gap-1.5 max-w-[45%]">
                      @for (tag of viewItem[col.key]; track tag) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-brand border border-sky-200">
                          {{ tag }}
                        </span>
                      }
                    </div>
                  } @else {
                    <span class="text-xs sm:text-[13px] font-semibold text-slate-800 text-right break-words max-w-[45%]">
                      {{ formatViewValue(col, viewItem) }}
                    </span>
                  }
                </div>
              }
            }

            <div class="py-1.5 flex items-center justify-between gap-4 text-xs last:pb-0">
              <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border select-none"
                [ngClass]="viewItem.status === 'Inactive' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
              >
                {{ viewItem.status === 'Inactive' ? 'Inactive' : 'Active' }}
              </span>
            </div>
          </div>
        }
      </app-action-modal>

    </app-page-shell>
  `
})
export class MasterCrudPageComponent<T extends { id: string; status?: string } = any> implements OnInit, AfterViewInit {
  @Input({ required: true }) config!: MasterCrudConfig<T>;

  private _extraTemplates?: Record<string, TemplateRef<unknown>>;

  @Input() set extraTemplates(val: Record<string, TemplateRef<unknown>> | undefined) {
    this._extraTemplates = val;
    this.rebuildTemplates();
  }
  get extraTemplates(): Record<string, TemplateRef<unknown>> | undefined {
    return this._extraTemplates;
  }

  @ViewChild('tagsTemplate', { static: true }) tagsTemplate!: TemplateRef<unknown>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<unknown>;
  @ViewChild('actionTemplate', { static: true }) actionTemplate!: TemplateRef<unknown>;

  private dataEngine = inject(DataEngineService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private repo!: ResourceRepository<T>;

  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  editingId = signal<string | null>(null);
  submitted = signal<boolean>(false);
  loading = signal<boolean>(false);

  items = signal<T[]>([]);
  formData: Record<string, any> = {};
  pendingPermission = '';

  readonly statusFilter = signal<'ALL' | 'Active' | 'Inactive'>('ALL');
  readonly filterValues = signal<Record<string, string>>({});

  readonly activeCount = computed(() => {
    return this.items().filter((it: any) => it.status !== 'Inactive').length;
  });

  readonly inactiveCount = computed(() => {
    return this.items().filter((it: any) => it.status === 'Inactive').length;
  });

  readonly statusFilterOptions = computed<StatusFilterOption[]>(() => [
    { value: 'ALL', label: 'All', count: this.items().length },
    { value: 'Active', label: 'Active', count: this.activeCount() },
    { value: 'Inactive', label: 'Inactive', count: this.inactiveCount() }
  ]);

  readonly isFilterActive = computed(() => {
    if (this.statusFilter() !== 'ALL') return true;
    const fv = this.filterValues();
    return Object.values(fv).some(v => !!v);
  });

  setStatusFilter(status: 'ALL' | 'Active' | 'Inactive'): void {
    this.statusFilter.set(status);
  }

  setFilterValue(key: string, value: string): void {
    this.filterValues.update(prev => ({ ...prev, [key]: value }));
  }

  resetFilters(): void {
    this.statusFilter.set('ALL');
    this.filterValues.set({});
    this.searchQuery.set('');
  }

  resolveFilterOptions(filter: { options: string[] | (() => string[]) }): string[] {
    if (!filter.options) return [];
    return typeof filter.options === 'function' ? filter.options() : filter.options;
  }

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const fv = this.filterValues();
    let list = this.items();

    // 1. Status Filter
    if (status !== 'ALL') {
      list = list.filter((item: any) => {
        if (status === 'Inactive') return item.status === 'Inactive';
        return item.status !== 'Inactive';
      });
    }

    // 2. Custom Dropdown Filters
    const activeFilters = Object.entries(fv).filter(([_, val]) => !!val);
    if (activeFilters.length > 0) {
      list = list.filter((item: any) => {
        return activeFilters.every(([key, val]) => String(item[key] ?? '') === val);
      });
    }

    // 3. Search query
    if (q) {
      list = list.filter((item: any) =>
        this.config.searchFields.some(f => String(item[f] ?? '').toLowerCase().includes(q))
      );
    }

    return list;
  });

  tableColumns = signal<TableColumn<T>[]>([]);
  customTemplates = signal<Record<string, TemplateRef<unknown>>>({});

  ngOnInit(): void {
    this.repo = this.dataEngine.for<T>(this.config.dataKey, { idKey: 'id' });
    this.buildColumns();
    this.load();
  }

  ngAfterViewInit(): void {
    this.rebuildTemplates();
  }

  private rebuildTemplates(): void {
    const templates: Record<string, TemplateRef<unknown>> = {
      ...(this.statusTemplate ? { status: this.statusTemplate } : {}),
      ...(this.actionTemplate ? { action: this.actionTemplate } : {}),
      ...(this._extraTemplates || {}),
      ...(this.config?.customTemplates || {})
    };
    for (const key of this.config?.tagsColumns || []) {
      if (this.tagsTemplate) {
        templates[key] = this.tagsTemplate;
      }
    }
    this.customTemplates.set(templates);
    this.cdr.markForCheck();
  }

  private buildColumns(): void {
    const cols = [...this.config.columns];
    const actionWidth = this.config.hideViewAction ? 'w-28 min-w-[105px]' : 'w-36 min-w-[130px]';
    cols.push({ key: 'action', label: 'Action', align: 'center', type: 'custom', width: actionWidth });
    this.tableColumns.set(cols);
  }

  load(): void {
    this.loading.set(true);
    this.repo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (list: T[]) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  colSpanClass(field: MasterFieldConfig): string {
    switch (field.colSpan) {
      case 1: return 'sm:col-span-1';
      case 2: return 'sm:col-span-2';
      default: return 'sm:col-span-3';
    }
  }

  resolveOptions(field: MasterFieldConfig): string[] {
    if (!field.options) return [];
    return typeof field.options === 'function' ? field.options() : field.options;
  }

  unselectedPermissions(field: MasterFieldConfig): string[] {
    const all = this.resolveOptions(field);
    const selected: string[] = this.formData[field.key] || [];
    return all.filter(p => !selected.includes(p));
  }

  addPermission(field: MasterFieldConfig): void {
    if (!this.pendingPermission) return;
    const current: string[] = this.formData[field.key] || [];
    if (!current.includes(this.pendingPermission)) {
      this.formData[field.key] = [...current, this.pendingPermission];
    }
    this.pendingPermission = '';
  }

  removePermission(field: MasterFieldConfig, perm: string): void {
    const current: string[] = this.formData[field.key] || [];
    this.formData[field.key] = current.filter(p => p !== perm);
  }

  fieldInvalid(field: MasterFieldConfig): boolean {
    if (!this.submitted() || !field.required) return false;
    const val = this.formData[field.key];
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === 'number') return val === null || val === undefined || val < 0;
    return !val || !String(val).trim();
  }

  /**
   * Ticked values handed to each multiselect dropdown. It is the stored selection plus 'ALL' while every
   * applicable option is ticked, and is rebuilt (new array) only when the selection changes.
   */
  multiselectValues: Record<string, string[]> = {};

  private readonly noValues: string[] = [];

  /** Ticked values of one multiselect; the form is empty until the modal is opened, so fall back to a stable empty list. */
  valuesOf(field: MasterFieldConfig): string[] {
    return this.multiselectValues[field.key] ?? this.noValues;
  }

  private syncMultiselectValues(field: MasterFieldConfig): void {
    const selected: string[] = this.formData[field.key] || [];
    const allApplicable = this.resolveOptions(field).filter(
      (o) => o !== 'ALL' && o.toLowerCase() !== 'na'
    );
    const allTicked = allApplicable.length > 0 && allApplicable.every((o) => selected.includes(o));
    this.multiselectValues[field.key] = allTicked ? [...selected, 'ALL'] : [...selected];
  }

  private syncAllMultiselectValues(): void {
    this.multiselectValues = {};
    for (const f of this.config.fields) {
      if (f.type === 'multiselect') this.syncMultiselectValues(f);
    }
  }

  toggleMultiselectOption(field: MasterFieldConfig, opt: string): void {
    const current: string[] = Array.isArray(this.formData[field.key])
      ? [...this.formData[field.key]]
      : [];
    const allApplicable = this.resolveOptions(field).filter(
      (o) => o !== 'ALL' && o.toLowerCase() !== 'na'
    );

    if (opt === 'ALL') {
      const allSelected = allApplicable.every((o) => current.includes(o));
      if (allSelected) {
        // Deselect all applicable options, preserve 'na' if it was selected
        this.formData[field.key] = current.filter((o) => !allApplicable.includes(o));
      } else {
        // Select all applicable options (does NOT select 'na')
        const naSelected = current.filter((o) => o.toLowerCase() === 'na');
        this.formData[field.key] = [...allApplicable, ...naSelected];
      }
    } else {
      const index = current.indexOf(opt);
      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(opt);
      }
      this.formData[field.key] = current;
    }
    this.syncMultiselectValues(field);
  }

  getMultiselectLabel(field: MasterFieldConfig): string {
    const selected: string[] = this.formData[field.key] || [];
    if (!selected || selected.length === 0) {
      return `Select ${field.label}`;
    }
    const allApplicable = this.resolveOptions(field).filter(
      (o) => o !== 'ALL' && o.toLowerCase() !== 'na'
    );
    const hasAllApplicable =
      allApplicable.length > 0 && allApplicable.every((o) => selected.includes(o));

    if (hasAllApplicable) {
      const hasNa = selected.some((o) => o.toLowerCase() === 'na');
      return hasNa ? 'ALL, na' : 'ALL';
    }
    return selected.join(', ');
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.submitted.set(false);
    this.pendingPermission = '';
    this.formData = this.config.createDefaults();
    for (const f of this.config.fields) {
      if (f.type === 'multiselect' && !Array.isArray(this.formData[f.key])) {
        this.formData[f.key] = [];
      }
    }
    this.syncAllMultiselectValues();
    this.showModal.set(true);
  }

  openEditModal(item: T): void {
    this.editingId.set(item.id);
    this.submitted.set(false);
    this.pendingPermission = '';
    this.formData = { ...this.config.createDefaults(), ...item };
    for (const f of this.config.fields) {
      if (f.type === 'multiselect') {
        const val = this.formData[f.key];
        if (typeof val === 'string') {
          this.formData[f.key] = val.split(',').map((s: string) => s.trim()).filter(Boolean);
        } else if (!Array.isArray(val)) {
          this.formData[f.key] = [];
        }
      }
    }
    this.syncAllMultiselectValues();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submit(): void {
    this.submitted.set(true);
    const hasInvalid = this.config.fields.some(f => this.fieldInvalid(f));
    if (hasInvalid) return;

    const payload = this.config.buildPayload(this.formData);
    const editId = this.editingId();

    if (editId) {
      this.repo.update(editId, payload).subscribe((updated: T) => {
        this.items.update(current => current.map(it => (it.id === editId ? updated : it)));
        this.showModal.set(false);
      });
    } else {
      this.repo.create(payload).subscribe((created: T) => {
        this.items.update(current => [created, ...current]);
        this.showModal.set(false);
      });
    }
  }

  deleteItem(item: T): void {
    const confirmText = this.config.deleteConfirmText
      ? this.config.deleteConfirmText(item)
      : `Are you sure you want to delete this ${this.config.entityLabel.toLowerCase()}?`;
    if (!confirm(confirmText)) return;

    this.repo.delete(item.id).subscribe((success: boolean) => {
      if (success) {
        this.items.update(current => current.filter(it => it.id !== item.id));
      }
    });
  }

  showViewModal = signal<boolean>(false);
  selectedViewItem = signal<any | null>(null);

  readonly viewableColumns = computed(() => {
    const cols = this.config.viewColumns || this.config.columns;
    return cols.filter(c => c.key !== 'sNo' && c.key !== 'action' && c.key !== 'status');
  });

  isTagsColumn(key: string): boolean {
    return !!this.config.tagsColumns?.includes(key);
  }

  isTagArray(key: string, item: Record<string, unknown>): boolean {
    return this.isTagsColumn(key) && Array.isArray(item[key]);
  }

  isLongText(col: TableColumn<T>, item: any): boolean {
    const val = item[col.key];
    return typeof val === 'string' && val.length > 70;
  }

  formatViewValue(col: TableColumn<T>, item: any): string {
    const val = item[col.key];
    if (col.format) {
      return col.format(val, item, 0);
    }
    if (val === null || val === undefined || val === '') {
      return '-';
    }
    if (Array.isArray(val)) {
      return val.join(', ');
    }
    return String(val);
  }

  openViewModal(item: T): void {
    this.selectedViewItem.set(item);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedViewItem.set(null);
  }

  toggleStatus(item: T): void {
    const currentStatus = item.status === 'Inactive' ? 'Inactive' : 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    this.repo.update(item.id, { status: newStatus } as any).subscribe((updated: T) => {
      this.items.update(current => current.map(it => (it.id === item.id ? { ...it, status: newStatus } : it)));
    });
  }

  getRowClass = (item: { status?: string }): string => {
    const isInactive = item.status === 'Inactive';
    return isInactive ? 'opacity-50 !bg-slate-100/70 transition-colors' : 'bg-white transition-colors';
  };
}
