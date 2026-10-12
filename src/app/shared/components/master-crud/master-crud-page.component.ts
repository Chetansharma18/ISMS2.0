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
  ChangeDetectionStrategy,
  HostListener
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PageHeaderComponent } from '../page-header/page-header.component';
import { TableComponent } from '../table/table.component';
import { TableColumn } from '../table/table.types';
import { ActionModalComponent } from '../action-modal/action-modal.component';
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
    ActionModalComponent
  ],
  template: `
    <div class="w-full min-h-screen bg-white text-slate-800 font-sans p-4 sm:p-6 lg:p-8 space-y-6">

      <!-- Page Header -->
      <app-page-header [title]="config.title">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                [placeholder]="config.searchPlaceholder"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add {{ config.entityLabel }}</span>
          </button>
        </div>
      </app-page-header>

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
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-brand border border-sky-200">
              {{ tag }}
            </span>
          }
        </div>
      </ng-template>

      <!-- Status badge cell template -->
      <ng-template #statusTemplate let-item>
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border select-none"
          [ngClass]="item.status === 'Inactive'
            ? 'bg-slate-50 text-slate-600 border-slate-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
        >
          {{ item.status }}
        </span>
      </ng-template>

      <!-- Action cell template: View + Edit + Active/Inactive toggle -->
      <ng-template #actionTemplate let-item>
        <div class="flex items-center justify-center whitespace-nowrap">
          <!-- View Button -->
          <button
            type="button"
            (click)="$event.stopPropagation(); openViewModal(item)"
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

      <!-- Add / Edit Modal -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        [maxWidthClass]="config.modalWidthClass || 'max-w-[520px]'"
        (primaryAction)="submit()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-brand-dark" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          {{ editingId() ? 'Edit' : 'Add New' }} {{ config.entityLabel }}
        </h2>

        <div
          class="mt-4 font-sans text-[13px] space-y-4 max-h-[65vh] overflow-y-auto pr-1"
          (pointerdown)="closeMultiselectIfOutside($any($event.target))"
          (click)="closeMultiselectIfOutside($any($event.target))"
          (focusin)="closeMultiselectIfOutside($any($event.target))"
        >
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            @for (field of config.fields; track field.key) {
              <div [ngClass]="colSpanClass(field)">
                <label class="block text-slate-700 font-medium mb-1">
                  {{ field.label }}{{ field.required ? '*' : '' }}
                </label>

                @switch (field.type) {
                  @case ('textarea') {
                    <textarea
                      [rows]="field.rows || 3"
                      [attr.maxlength]="field.maxLength || null"
                      [placeholder]="field.placeholder || ''"
                      [(ngModel)]="formData[field.key]"
                      (focus)="openMultiselectField.set(null)"
                      class="w-full px-2.5 py-2 border border-field-border rounded focus:outline-none focus:border-primary text-slate-800"
                    ></textarea>
                  }
                  @case ('select') {
                    <select
                      [(ngModel)]="formData[field.key]"
                      (focus)="openMultiselectField.set(null)"
                      [ngClass]="fieldInvalid(field) ? 'border-red-500' : 'border-field-border'"
                      class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-primary text-slate-800 bg-white"
                    >
                      <option value="" disabled selected>Select {{ field.label }}</option>
                      @for (opt of resolveOptions(field); track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                  }
                  @case ('multiselect') {
                    <div class="relative multiselect-container">
                      <button
                        type="button"
                        (click)="toggleMultiselect(field.key, $event)"
                        class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-primary text-slate-800 bg-white flex items-center justify-between text-left cursor-pointer"
                        [ngClass]="fieldInvalid(field) ? 'border-red-500' : 'border-field-border'"
                      >
                        <span class="truncate text-xs sm:text-[13px]" [class.text-slate-400]="!formData[field.key] || formData[field.key].length === 0">
                          {{ getMultiselectLabel(field) }}
                        </span>
                        <svg
                          class="w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200"
                          [class.rotate-180]="openMultiselectField() === field.key"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      @if (openMultiselectField() === field.key) {
                        <div
                          class="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden font-sans max-h-52 overflow-y-auto"
                          role="listbox"
                        >
                          <div class="py-1 divide-y divide-slate-100 text-xs sm:text-[13px]">
                            @for (opt of resolveOptions(field); track opt) {
                              <label
                                class="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700 select-none transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  [checked]="isMultiselectOptionChecked(field, opt)"
                                  (change)="toggleMultiselectOption(field, opt)"
                                  class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary cursor-pointer accent-primary"
                                />
                                <span [class.font-semibold]="opt === 'ALL'">{{ opt }}</span>
                              </label>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                  @case ('number') {
                    <input
                      type="number"
                      [min]="field.min ?? 0"
                      [placeholder]="field.placeholder || ''"
                      [(ngModel)]="formData[field.key]"
                      (focus)="openMultiselectField.set(null)"
                      [ngClass]="fieldInvalid(field) ? 'border-red-500' : 'border-field-border'"
                      class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-primary text-slate-800"
                    />
                  }
                  @case ('permissions') {
                    <div class="flex items-center gap-2">
                      <select
                        [(ngModel)]="pendingPermission"
                        (focus)="openMultiselectField.set(null)"
                        class="flex-1 px-2.5 py-2 border border-field-border rounded focus:outline-none focus:border-primary text-slate-800 bg-white"
                      >
                        <option value="" disabled selected>Select permission to add...</option>
                        @for (opt of unselectedPermissions(field); track opt) {
                          <option [value]="opt">{{ opt }}</option>
                        }
                      </select>
                      <button
                        type="button"
                        (click)="addPermission(field)"
                        [disabled]="!pendingPermission"
                        class="p-2 bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
                        title="Add Permission"
                      >
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    @if ((formData[field.key] || []).length > 0) {
                      <div class="mt-3 flex flex-wrap gap-2 border border-slate-200 rounded-lg p-3 bg-slate-50 min-h-[50px] items-center">
                        @for (perm of formData[field.key]; track perm) {
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-field-border text-brand shadow-2xs select-none">
                            <span>{{ perm }}</span>
                            <button type="button" (click)="removePermission(field, perm)" class="text-slate-400 hover:text-rose-600 cursor-pointer transition-colors" title="Remove">
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        }
                      </div>
                    }
                  }
                  @default {
                    <input
                      type="text"
                      [attr.maxlength]="field.maxLength || null"
                      [placeholder]="field.placeholder || ''"
                      [(ngModel)]="formData[field.key]"
                      (focus)="openMultiselectField.set(null)"
                      [ngClass]="[fieldInvalid(field) ? 'border-red-500' : 'border-field-border', field.uppercase ? 'font-mono text-xs' : '']"
                      class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-primary text-slate-800"
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
        secondaryLabel="Close"
        [maxWidthClass]="config.modalWidthClass || 'max-w-[500px]'"
        (secondaryAction)="closeViewModal()"
        (close)="closeViewModal()"
      >
        <h2 class="m-0 text-brand-dark" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          {{ config.entityLabel }} Details
        </h2>

        @if (selectedViewItem(); as viewItem) {
          <div class="mt-4 font-sans text-[13px] space-y-3.5 divide-y divide-slate-100 max-h-[65vh] overflow-y-auto pr-1">
            @for (col of viewableColumns(); track col.key) {
              <div class="pt-2.5 flex flex-col gap-1 first:pt-0">
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ col.label }}</span>
                @if (isTagArray(col.key, viewItem)) {
                  <div class="flex flex-wrap gap-1.5 pt-0.5">
                    @for (tag of viewItem[col.key]; track tag) {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-brand border border-sky-200">
                        {{ tag }}
                      </span>
                    }
                  </div>
                } @else {
                  <span class="text-sm font-medium text-slate-800 break-words">{{ formatViewValue(col, viewItem) }}</span>
                }
              </div>
            }

            <div class="pt-3 flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
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

    </div>
  `
})
export class MasterCrudPageComponent<T extends { id: string; status?: string } = any> implements OnInit, AfterViewInit {
  @Input({ required: true }) config!: MasterCrudConfig<T>;

  @ViewChild('tagsTemplate', { static: true }) tagsTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
  @ViewChild('actionTemplate', { static: true }) actionTemplate!: TemplateRef<any>;

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

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.items();
    if (!q) return all;
    return all.filter((item: any) =>
      this.config.searchFields.some(f => String(item[f] ?? '').toLowerCase().includes(q))
    );
  });

  tableColumns = signal<TableColumn<T>[]>([]);
  customTemplates = signal<Record<string, any>>({});

  ngOnInit(): void {
    this.repo = this.dataEngine.for<T>(this.config.dataKey, { idKey: 'id' });
    this.buildColumns();
    this.load();
  }

  ngAfterViewInit(): void {
    const templates: Record<string, TemplateRef<any>> = {
      status: this.statusTemplate,
      action: this.actionTemplate
    };
    for (const key of this.config.tagsColumns || []) {
      templates[key] = this.tagsTemplate;
    }
    this.customTemplates.set(templates);
    this.cdr.markForCheck();
  }

  private buildColumns(): void {
    const cols = [...this.config.columns];
    cols.push({ key: 'action', label: 'Action', align: 'center', type: 'custom', width: 'min-w-[210px]' });
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

  openMultiselectField = signal<string | null>(null);

  closeMultiselectIfOutside(target: HTMLElement | null): void {
    if (!target || !target.closest('.multiselect-container')) {
      this.openMultiselectField.set(null);
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    this.closeMultiselectIfOutside(event.target as HTMLElement);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.closeMultiselectIfOutside(event.target as HTMLElement);
  }

  @HostListener('document:focusin', ['$event'])
  onDocumentFocusIn(event: FocusEvent): void {
    this.closeMultiselectIfOutside(event.target as HTMLElement);
  }

  toggleMultiselect(fieldKey: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.openMultiselectField.update((current) => (current === fieldKey ? null : fieldKey));
  }

  isMultiselectOptionChecked(field: MasterFieldConfig, opt: string): boolean {
    const selected: string[] = this.formData[field.key] || [];
    if (opt === 'ALL') {
      const allApplicable = this.resolveOptions(field).filter(
        (o) => o !== 'ALL' && o.toLowerCase() !== 'na'
      );
      return allApplicable.length > 0 && allApplicable.every((o) => selected.includes(o));
    }
    return selected.includes(opt);
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
    this.openMultiselectField.set(null);
    this.formData = this.config.createDefaults();
    for (const f of this.config.fields) {
      if (f.type === 'multiselect' && !Array.isArray(this.formData[f.key])) {
        this.formData[f.key] = [];
      }
    }
    this.showModal.set(true);
  }

  openEditModal(item: T): void {
    this.editingId.set((item as any).id);
    this.submitted.set(false);
    this.pendingPermission = '';
    this.openMultiselectField.set(null);
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
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.openMultiselectField.set(null);
  }

  submit(): void {
    this.submitted.set(true);
    const hasInvalid = this.config.fields.some(f => this.fieldInvalid(f));
    if (hasInvalid) return;

    const payload = this.config.buildPayload(this.formData);
    const editId = this.editingId();

    if (editId) {
      this.repo.update(editId, payload).subscribe((updated: T) => {
        this.items.update(current => current.map((it: any) => (it.id === editId ? updated : it)));
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

    this.repo.delete((item as any).id).subscribe((success: boolean) => {
      if (success) {
        this.items.update(current => current.filter((it: any) => it.id !== (item as any).id));
      }
    });
  }

  showViewModal = signal<boolean>(false);
  selectedViewItem = signal<any | null>(null);

  readonly viewableColumns = computed(() => {
    return this.config.columns.filter(c => c.key !== 'sNo' && c.key !== 'action' && c.key !== 'status');
  });

  isTagsColumn(key: string): boolean {
    return !!this.config.tagsColumns?.includes(key);
  }

  isTagArray(key: string, item: any): boolean {
    return this.isTagsColumn(key) && Array.isArray(item[key]);
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

  openViewModal(item: any): void {
    this.selectedViewItem.set(item);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedViewItem.set(null);
  }

  toggleStatus(item: any): void {
    const currentStatus = item.status === 'Inactive' ? 'Inactive' : 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    this.repo.update(item.id, { status: newStatus } as any).subscribe((updated: T) => {
      this.items.update(current => current.map((it: any) => (it.id === item.id ? { ...it, status: newStatus } : it)));
    });
  }

  getRowClass = (item: any): string => {
    const isInactive = item.status === 'Inactive';
    return isInactive ? 'opacity-50 !bg-slate-100/70 transition-colors' : 'bg-white transition-colors';
  };
}
