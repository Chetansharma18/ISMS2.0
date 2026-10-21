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
import {
  ActionModalComponent,
  ButtonComponent,
  DropdownComponent,
  IconComponent,
  InputDirective,
  PageHeaderComponent,
  PageShellComponent,
  SwitchComponent,
  TableColumn,
  TableComponent
} from '../../shared';
import { DataEngineService } from '../../core/services/data-engine.service';
import { PermissionMasterItem, UserRoleMasterItem } from '../../core/models/admin-masters.model';

export type { PermissionMasterItem };

export const SYSTEM_MODULE_PAGES: string[] = [
  'EOI Configuration',
  'Two step verification',
  'EOI Category Master',
  'Scheme Master',
  'Scheme Category Master',
  'Sector Master',
  'Course Master',
  'District & Block Master',
  'Designation Master',
  'Doc Master',
  'Remark Master',
  'Grading Master',
  'User Management',
  'Blacklisted Users',
  'Role Management',
  'Batch Approval & Scrutiny',
  'Camera CCTV Live Monitoring',
  'Grievance Redressal',
  'Payment & Financial Reports',
  'Candidate / Aspirant Database'
];

interface AddPermissionForm {
  roleType: string;
  models: string[];
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface EditPermissionForm {
  id: string;
  sNo: number;
  roleType: string;
  moduleName: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-permission-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, PageHeaderComponent, TableComponent, ActionModalComponent, ButtonComponent, DropdownComponent, IconComponent, InputDirective, PageShellComponent, SwitchComponent],
  template: `
    <app-page-shell>
      
      <!-- Page Header -->
      <app-page-header
        title="Permission Management"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Permission Management' }]"
        [searchable]="true"
        searchPlaceholder="Search by role type or model..."
        [(searchQuery)]="searchQuery"
      >
        <!-- Role Filter Dropdown -->
        <select
          appInput
          size="sm"
          aria-label="Filter by role"
          [ngModel]="selectedRoleFilter()"
          (ngModelChange)="selectedRoleFilter.set($event)"
          class="w-auto whitespace-nowrap shrink-0"
        >
          <option value="all">All Roles</option>
          @for (role of activeRoleOptions(); track role) {
            <option [value]="role">{{ role }}</option>
          }
        </select>

        <!-- Add Permission Button -->
        <button
          appButton
          size="sm"
          type="button"
          (click)="openAddModal()"
          class="shrink-0"
        >
          <app-icon name="plus" size="sm" />
          <span>Add Permission</span>
        </button>
      </app-page-header>

      <!-- Permissions Table -->
      <app-table
        [columns]="columns"
        [data]="filteredItems()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="permissions"
        emptyMessage="No permissions found. Click '+ Add Permission' to assign permissions."
        [customTemplates]="{
          permissions: permissionsTemplate,
          action: actionTemplate
        }"
      >
      </app-table>

      <!-- Permissions Column Template: Interactive View, Edit, Delete Checkboxes -->
      <ng-template #permissionsTemplate let-item>
        <div class="flex items-center gap-5 select-none py-1">
          <!-- View Checkbox -->
          <label
            class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold transition-colors"
            [class.text-emerald-700]="item.canView"
            [class.text-slate-600]="!item.canView"
            title="Toggle View Permission"
          >
            <input
              type="checkbox"
              [checked]="item.canView"
              (change)="togglePermission(item, 'canView', $event)"
              class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
            />
            <span>View</span>
          </label>

          <!-- Edit Checkbox -->
          <label
            class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold transition-colors"
            [class.text-amber-700]="item.canEdit"
            [class.text-slate-600]="!item.canEdit"
            title="Toggle Edit Permission"
          >
            <input
              type="checkbox"
              [checked]="item.canEdit"
              (change)="togglePermission(item, 'canEdit', $event)"
              class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
            />
            <span>Edit</span>
          </label>

          <!-- Delete Checkbox -->
          <label
            class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold transition-colors"
            [class.text-rose-700]="item.canDelete"
            [class.text-slate-600]="!item.canDelete"
            title="Toggle Delete Permission"
          >
            <input
              type="checkbox"
              [checked]="item.canDelete"
              (change)="togglePermission(item, 'canDelete', $event)"
              class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
            />
            <span>Delete</span>
          </label>
        </div>
      </ng-template>

      <!-- Action Column Template: View, Edit, Status Toggle -->
      <ng-template #actionTemplate let-item>
        <div class="flex items-center justify-center whitespace-nowrap">
          <!-- View Button -->
          <button
            appButton
            variant="ghost"
            size="sm"
            type="button"
            (click)="$event.stopPropagation(); openViewModal(item)"
            title="View Details"
          >
            <app-icon name="eye" size="sm" />
            <span>View</span>
          </button>

          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>

          <!-- Edit Button -->
          <button
            appButton
            variant="ghost"
            size="sm"
            type="button"
            (click)="$event.stopPropagation(); openEditModal(item)"
            title="Edit"
          >
            <app-icon name="edit" size="sm" />
            <span>Edit</span>
          </button>

          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>

          <!-- Active / Inactive Toggle -->
          <div class="inline-flex items-center gap-1.5" title="Toggle Status" (click)="$event.stopPropagation()">
            <app-switch
              [checked]="item.status !== 'Inactive'"
              label="Toggle Active Status"
              (toggled)="toggleStatus(item)"
            />
            <span
              class="text-[12px] font-semibold select-none cursor-pointer"
              [ngClass]="item.status === 'Inactive' ? 'text-slate-500' : 'text-emerald-700'"
              (click)="toggleStatus(item)"
            >
              {{ item.status === 'Inactive' ? 'Inactive' : 'Active' }}
            </span>
          </div>
        </div>
      </ng-template>

      <!-- Modal: Add Permission -->
      <app-action-modal
        [isOpen]="showAddModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Save Permissions"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[580px]"
        (primaryAction)="submitAdd()"
        (secondaryAction)="closeAddModal()"
        (close)="closeAddModal()"
      >
        <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Add Permission
        </h2>

        <div class="mt-4 font-sans text-[13px] space-y-4 transition-all duration-200">
          <!-- 1. Role Type -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">Role Type*</label>
            <select
              appInput
              [(ngModel)]="addForm.roleType"
              class="w-full"
              [invalid]="submitted() && !addForm.roleType"
            >
              <option value="" disabled selected>Select Role Type</option>
              @for (role of activeRoleOptions(); track role) {
                <option [value]="role">{{ role }}</option>
              }
            </select>
            @if (submitted() && !addForm.roleType) {
              <div class="text-xs text-red-500 mt-1 font-medium">Role Type is required</div>
            }
          </div>

          <!-- 2. Model Dropdown (Multiple Selection with Search) -->
          <div class="relative model-dropdown-container">
            <div class="flex items-center justify-between mb-1">
              <label class="block text-slate-700 font-medium">Model (Pages)*</label>
              <span class="text-xs text-slate-500">
                {{ addForm.models.length }} selected
              </span>
            </div>

            <!-- Multi-select with search; the list opens in the page flow so the modal card stretches -->
            <app-dropdown
              multiple
              [searchable]="true"
              searchPlaceholder="Search pages / models..."
              emptyText="No pages / models match search"
              placeholder="Select Model / Pages"
              selectAllLabel="Select All Pages / Models"
              [options]="availableModels"
              [values]="addForm.models"
              [summary]="getSelectedModelsLabel()"
              [invalid]="submitted() && addForm.models.length === 0"
              (optionToggled)="toggleModelOption($event)"
              (selectAllToggled)="toggleAllModels()"
            />

            @if (submitted() && addForm.models.length === 0) {
              <div class="text-xs text-red-500 mt-1 font-medium">Please select at least one page / model</div>
            }
          </div>

          <!-- 3. Permissions (Tick boxes for Edit, View, Delete) -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-slate-700 font-medium">Permissions*</label>
              <button
                appButton
                variant="ghost"
                size="sm"
                type="button"
                (click)="toggleAllAddPermissions()"
              >
                {{ (addForm.canView && addForm.canEdit && addForm.canDelete) ? 'Deselect All' : 'Select All' }}
              </button>
            </div>

            <div class="p-3 border rounded-lg bg-slate-50/70 flex flex-wrap items-center gap-6"
                 [class.border-red-500]="submitted() && !addForm.canView && !addForm.canEdit && !addForm.canDelete"
                 [class.border-slate-200]="!(submitted() && !addForm.canView && !addForm.canEdit && !addForm.canDelete)">
              <!-- View Checkbox -->
              <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 hover:text-brand">
                <input
                  type="checkbox"
                  [(ngModel)]="addForm.canView"
                  class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
                />
                <span>View</span>
              </label>

              <!-- Edit Checkbox -->
              <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 hover:text-brand">
                <input
                  type="checkbox"
                  [(ngModel)]="addForm.canEdit"
                  class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
                />
                <span>Edit</span>
              </label>

              <!-- Delete Checkbox -->
              <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 hover:text-brand">
                <input
                  type="checkbox"
                  [(ngModel)]="addForm.canDelete"
                  class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
                />
                <span>Delete</span>
              </label>
            </div>

            @if (submitted() && !addForm.canView && !addForm.canEdit && !addForm.canDelete) {
              <div class="text-xs text-red-500 mt-1 font-medium">Please select at least one permission</div>
            }
          </div>
        </div>
      </app-action-modal>

      <!-- Modal: Edit Permission -->
      <app-action-modal
        [isOpen]="showEditModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Save Changes"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[500px]"
        (primaryAction)="submitEdit()"
        (secondaryAction)="closeEditModal()"
        (close)="closeEditModal()"
      >
        <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Edit Permission
        </h2>

        @if (editForm; as ef) {
          <div class="mt-4 font-sans text-[13px] space-y-4">
            <!-- Role Type -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Role Type</label>
              <select
                appInput
                [(ngModel)]="ef.roleType"
                class="w-full"
              >
                @for (role of activeRoleOptions(); track role) {
                  <option [value]="role">{{ role }}</option>
                }
              </select>
            </div>

            <!-- Model (Page) -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Model (Page)</label>
              <select
                appInput
                [(ngModel)]="ef.moduleName"
                class="w-full"
              >
                @for (m of availableModels; track m) {
                  <option [value]="m">{{ m }}</option>
                }
              </select>
            </div>

            <!-- Permissions Checkboxes -->
            <div>
              <label class="block text-slate-700 font-medium mb-1.5">Permissions</label>
              <div class="p-3 border border-slate-200 rounded-lg bg-slate-50/70 flex flex-wrap items-center gap-6">
                <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 hover:text-brand">
                  <input
                    type="checkbox"
                    [(ngModel)]="ef.canView"
                    class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
                  />
                  <span>View</span>
                </label>

                <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 hover:text-brand">
                  <input
                    type="checkbox"
                    [(ngModel)]="ef.canEdit"
                    class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
                  />
                  <span>Edit</span>
                </label>

                <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 hover:text-brand">
                  <input
                    type="checkbox"
                    [(ngModel)]="ef.canDelete"
                    class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
                  />
                  <span>Delete</span>
                </label>
              </div>
            </div>

            <!-- Status Toggle -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Status</label>
              <select
                appInput
                [(ngModel)]="ef.status"
                class="w-full"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        }
      </app-action-modal>

      <!-- Modal: View Permission Details -->
      <app-action-modal
        [isOpen]="showViewModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="true"
        [showAccentBar]="false"
        primaryLabel=""
        secondaryLabel="Close"
        maxWidthClass="max-w-[480px]"
        (secondaryAction)="closeViewModal()"
        (close)="closeViewModal()"
      >
        <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Permission Details
        </h2>

        @if (selectedViewItem(); as viewItem) {
          <div class="mt-4 font-sans text-[13px] space-y-3.5 divide-y divide-slate-100">
            <div class="pt-2.5 flex flex-col gap-1 first:pt-0">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Type</span>
              <span class="text-sm font-semibold text-slate-800">{{ viewItem.roleType }}</span>
            </div>

            <div class="pt-2.5 flex flex-col gap-1">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model (Page)</span>
              <span class="text-sm font-medium text-slate-800">{{ viewItem.moduleName }}</span>
            </div>

            <div class="pt-2.5 flex flex-col gap-1.5">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Permissions</span>
              <div class="flex items-center gap-2.5 pt-0.5">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold select-none border"
                  [ngClass]="viewItem.canView ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'"
                >
                  View
                </span>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold select-none border"
                  [ngClass]="viewItem.canEdit ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'"
                >
                  Edit
                </span>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold select-none border"
                  [ngClass]="viewItem.canDelete ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'"
                >
                  Delete
                </span>
              </div>
            </div>

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

    </app-page-shell>
  `
})
export class PermissionMasterComponent {
  private dataEngine = inject(DataEngineService);
  private destroyRef = inject(DestroyRef);

  private permRepo = this.dataEngine.for<PermissionMasterItem>('PERMISSIONS');
  private roleRepo = this.dataEngine.for<UserRoleMasterItem>('USER_ROLES');

  items = signal<PermissionMasterItem[]>([]);
  userRoles = signal<UserRoleMasterItem[]>([]);

  searchQuery = signal<string>('');
  selectedRoleFilter = signal<string>('all');

  showAddModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showViewModal = signal<boolean>(false);

  selectedViewItem = signal<PermissionMasterItem | null>(null);
  submitted = signal<boolean>(false);

  isModelDropdownOpen = signal<boolean>(false);
  modelSearchText = signal<string>('');

  readonly availableModels = SYSTEM_MODULE_PAGES;

  addForm: AddPermissionForm = {
    roleType: '',
    models: [],
    canView: true,
    canEdit: false,
    canDelete: false
  };

  editForm: EditPermissionForm | null = null;

  readonly columns: TableColumn<PermissionMasterItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    { key: 'roleType', label: 'Role Type', cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[160px]' },
    { key: 'moduleName', label: 'Model', cellClass: 'whitespace-nowrap font-medium text-slate-700 min-w-[220px]' },
    { key: 'permissions', label: 'Permissions', type: 'custom', cellClass: 'min-w-[260px]' },
    { key: 'action', label: 'Action', align: 'center', type: 'custom', width: 'min-w-[210px]' }
  ];

  constructor() {
    this.permRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => {
      const hasOldData = list.some(
        i => i.id === 'perm-1' || i.id === 'perm-2' || i.id === 'perm-3' || i.roleType === 'Role1'
      );
      if (hasOldData) {
        list.forEach(i => this.permRepo.delete(i.id).subscribe());
        this.items.set([]);
      } else {
        this.items.set(list);
      }
    });

    this.roleRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(roles => {
      this.userRoles.set(roles);
    });
  }

  readonly activeRoleOptions = computed(() => {
    const roles = this.userRoles()
      .filter(r => r.status !== 'Inactive')
      .map(r => r.roleTypeName)
      .filter(Boolean);
    const unique = Array.from(new Set(roles));
    return unique.length > 0
      ? unique
      : ['Super Admin', 'Department Officer', 'Scrutiny Officer', 'Training Partner'];
  });

  readonly filteredAvailableModels = computed(() => {
    const q = this.modelSearchText().toLowerCase().trim();
    if (!q) return this.availableModels;
    return this.availableModels.filter(m => m.toLowerCase().includes(q));
  });

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const roleFilter = this.selectedRoleFilter();
    let result = this.items();

    if (roleFilter !== 'all') {
      result = result.filter(item => item.roleType === roleFilter);
    }

    if (q) {
      result = result.filter(item =>
        (item.roleType && item.roleType.toLowerCase().includes(q)) ||
        (item.moduleName && item.moduleName.toLowerCase().includes(q))
      );
    }

    return result;
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('.model-dropdown-container')) {
      this.isModelDropdownOpen.set(false);
    }
  }

  toggleModelDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isModelDropdownOpen.update(v => !v);
  }

  isModelSelected(model: string): boolean {
    return this.addForm.models.includes(model);
  }

  toggleModelOption(model: string): void {
    if (this.isModelSelected(model)) {
      this.addForm.models = this.addForm.models.filter(m => m !== model);
    } else {
      this.addForm.models = [...this.addForm.models, model];
    }
  }

  isAllModelsSelected(): boolean {
    return this.availableModels.length > 0 && this.availableModels.every(m => this.addForm.models.includes(m));
  }

  toggleAllModels(): void {
    if (this.isAllModelsSelected()) {
      this.addForm.models = [];
    } else {
      this.addForm.models = [...this.availableModels];
    }
  }

  getSelectedModelsLabel(): string {
    if (this.addForm.models.length === 0) {
      return 'Select Model / Pages';
    }
    if (this.isAllModelsSelected()) {
      return `All Pages / Models (${this.availableModels.length} selected)`;
    }
    if (this.addForm.models.length <= 2) {
      return this.addForm.models.join(', ');
    }
    return `${this.addForm.models.length} models selected`;
  }

  toggleAllAddPermissions(): void {
    const allChecked = this.addForm.canView && this.addForm.canEdit && this.addForm.canDelete;
    if (allChecked) {
      this.addForm.canView = false;
      this.addForm.canEdit = false;
      this.addForm.canDelete = false;
    } else {
      this.addForm.canView = true;
      this.addForm.canEdit = true;
      this.addForm.canDelete = true;
    }
  }

  togglePermission(item: PermissionMasterItem, type: 'canView' | 'canEdit' | 'canDelete', event: Event): void {
    const input = event.target as HTMLInputElement;
    const updated: PermissionMasterItem = {
      ...item,
      [type]: input.checked
    };
    this.items.update(list => list.map(i => (i.id === item.id ? updated : i)));
    this.permRepo.update(item.id, updated).subscribe();
  }

  toggleStatus(item: PermissionMasterItem): void {
    const newStatus = item.status === 'Inactive' ? 'Active' : 'Inactive';
    const updated: PermissionMasterItem = { ...item, status: newStatus };
    this.items.update(list => list.map(i => (i.id === item.id ? updated : i)));
    this.permRepo.update(item.id, updated).subscribe();
  }

  openAddModal(): void {
    this.addForm = {
      roleType: this.activeRoleOptions()[0] || 'Super Admin',
      models: [],
      canView: true,
      canEdit: false,
      canDelete: false
    };
    this.modelSearchText.set('');
    this.isModelDropdownOpen.set(false);
    this.submitted.set(false);
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.submitted.set(false);
    this.isModelDropdownOpen.set(false);
  }

  submitAdd(): void {
    this.submitted.set(true);
    if (!this.addForm.roleType || this.addForm.models.length === 0) {
      return;
    }

    const role = this.addForm.roleType;
    const canView = this.addForm.canView;
    const canEdit = this.addForm.canEdit;
    const canDelete = this.addForm.canDelete;

    let list = [...this.items()];

    for (const model of this.addForm.models) {
      const existingIdx = list.findIndex(
        i => (i.roleType || '').toLowerCase() === role.toLowerCase() && (i.moduleName || '').toLowerCase() === model.toLowerCase()
      );

      if (existingIdx >= 0) {
        const updated: PermissionMasterItem = {
          ...list[existingIdx],
          canView,
          canEdit,
          canDelete,
          status: 'Active'
        };
        list[existingIdx] = updated;
        this.permRepo.update(updated.id, updated).subscribe();
      } else {
        const newItem: PermissionMasterItem = {
          id: 'perm-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
          sNo: 1,
          roleType: role,
          moduleName: model,
          canView,
          canEdit,
          canDelete,
          status: 'Active'
        };
        // Prepend new item to the top so it is immediately visible on Page 1!
        list = [newItem, ...list];
        this.permRepo.create(newItem).subscribe();
      }
    }

    // Re-index all sNo numbers cleanly from 1 to N
    list.forEach((item, index) => {
      item.sNo = index + 1;
    });

    // Update signal immediately so table renders the new permissions right away
    this.items.set(list);

    // If role filter is active and different from added role, switch filter so new items are visible
    if (this.selectedRoleFilter() !== 'all' && this.selectedRoleFilter() !== role) {
      this.selectedRoleFilter.set(role);
    }
    // Clear search box so it doesn't accidentally hide the newly added items
    this.searchQuery.set('');

    this.closeAddModal();
  }

  openEditModal(item: PermissionMasterItem): void {
    this.editForm = {
      id: item.id,
      sNo: item.sNo,
      roleType: item.roleType,
      moduleName: item.moduleName,
      canView: !!item.canView,
      canEdit: !!item.canEdit,
      canDelete: !!item.canDelete,
      status: item.status || 'Active'
    };
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editForm = null;
  }

  submitEdit(): void {
    if (!this.editForm) return;

    const updated: PermissionMasterItem = {
      id: this.editForm.id,
      sNo: this.editForm.sNo,
      roleType: this.editForm.roleType,
      moduleName: this.editForm.moduleName,
      canView: this.editForm.canView,
      canEdit: this.editForm.canEdit,
      canDelete: this.editForm.canDelete,
      status: this.editForm.status
    };

    this.permRepo.update(this.editForm.id, updated).subscribe(saved => {
      this.items.update(list => list.map(i => (i.id === saved.id ? saved : i)));
      this.closeEditModal();
    });
  }

  openViewModal(item: PermissionMasterItem): void {
    this.selectedViewItem.set(item);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedViewItem.set(null);
  }
}
