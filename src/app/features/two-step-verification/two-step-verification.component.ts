import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
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
import {
  ButtonComponent,
  DropdownComponent,
  IconComponent,
  InputDirective,
  PageShellComponent,
  SwitchComponent,
  MasterFilterBarComponent,
  StatusFilterOption
} from '../../shared';
import { DataEngineService, ResourceRepository } from '../../core/services/data-engine.service';
import { AuthMethodType, TwoStepVerificationItem, UserRoleMasterItem } from '../../core/models/admin-masters.model';

export type { TwoStepVerificationItem, AuthMethodType };

const ALL_AUTH_TYPES: AuthMethodType[] = ['OTP', 'PIN'];

interface TwoStepFormData {
  roleType: string;
  authTypes: AuthMethodType[];
}

@Component({
  selector: 'app-two-step-verification',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ActionModalComponent,
    ButtonComponent,
    DropdownComponent,
    IconComponent,
    InputDirective,
    PageShellComponent,
    SwitchComponent,
    MasterFilterBarComponent
  ],
  template: `
    <app-page-shell>

      <!-- Page Header -->
      <app-page-header
        title="Two Step Verification"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Two Step Verification' }]"
      >
        <!-- Add New Button -->
        <button
          appButton
          size="sm"
          type="button"
          (click)="openAddModal()"
          class="shrink-0"
        >
          <app-icon name="plus" size="sm" />
          <span>Add new</span>
        </button>
      </app-page-header>

      <!-- Unified Master Filter & Search Bar -->
      <app-master-filter-bar
        [(searchQuery)]="searchQuery"
        searchPlaceholder="Search by role type or auth type..."
        [(status)]="statusFilter"
        [showStatusFilter]="true"
        [statusOptions]="statusFilterOptions()"
        [totalCount]="items().length"
        [filteredCount]="filteredItems().length"
        itemUnit="configurations"
        (resetFilters)="resetFilters()"
      />

      <!-- Table -->
      <app-table
        [rowClass]="getRowClass"
        [columns]="tableColumns"
        [data]="filteredItems()"
        [loading]="loading()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="configurations"
        [customTemplates]="{
          authTypes: authTypeTemplate,
          action: actionTemplate
        }"
      >
      </app-table>

      <!-- Custom Template: Authentication Type (2 Checkboxes: OTP, PIN) -->
      <ng-template #authTypeTemplate let-item>
        <div class="flex items-center gap-5 whitespace-nowrap select-none" (click)="$event.stopPropagation()">
          <!-- OTP Tickbox -->
          <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 hover:text-primary transition-colors">
            <input
              type="checkbox"
              [checked]="hasAuthType(item, 'OTP')"
              (change)="toggleItemAuthType(item, 'OTP')"
              class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
            />
            <span [ngClass]="hasAuthType(item, 'OTP') ? 'font-semibold text-primary' : 'text-slate-600'">OTP</span>
          </label>

          <!-- PIN Tickbox -->
          <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 hover:text-primary transition-colors">
            <input
              type="checkbox"
              [checked]="hasAuthType(item, 'PIN')"
              (change)="toggleItemAuthType(item, 'PIN')"
              class="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary accent-primary cursor-pointer"
            />
            <span [ngClass]="hasAuthType(item, 'PIN') ? 'font-semibold text-primary' : 'text-slate-600'">PIN</span>
          </label>
        </div>
      </ng-template>

      <!-- Custom Template: Action Column -->
      <ng-template #actionTemplate let-item>
        <div class="flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap" (click)="$event.stopPropagation()">
          <!-- Edit Button -->
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            (click)="openEditModal(item)"
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

      <!-- ====================================================================
           ADD / EDIT MODAL
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        accentBarClass="bg-primary"
        primaryLabel="Save"
        secondaryLabel=""
        maxWidthClass="max-w-[480px]"
        (primaryAction)="submitForm()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-brand-dark" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          {{ editingId() ? 'Edit' : 'Add new' }} Two Step Verification
        </h2>

        <div class="mt-4 font-sans text-xs space-y-4">
          <!-- 1. Role (Dropdown from Role Management) -->
          <div>
            <label class="block text-slate-700 font-semibold text-xs mb-1.5">
              Role *
            </label>
            <select
              appInput
              size="sm"
              [(ngModel)]="formData.roleType"
              class="w-full"
              [invalid]="submitted() && !formData.roleType"
            >
              <option value="" disabled selected>Select Role</option>
              @for (role of availableRoles(); track role) {
                <option [value]="role">{{ role }}</option>
              }
            </select>
            @if (submitted() && !formData.roleType) {
              <p class="text-[11px] text-red-500 mt-1 font-medium">Role is required</p>
            }
          </div>

          <!-- 2. Auth Type (Dropdown with multiple select) -->
          <div class="relative auth-dropdown-container">
            <label class="block text-slate-700 font-semibold text-xs mb-1.5">
              Auth type *
            </label>

            <!-- Multi-select dropdown -->
            <app-dropdown
              multiple
              placeholder="Select Auth Type..."
              [options]="allAuthTypes"
              [values]="formData.authTypes"
              [maxLabels]="allAuthTypes.length"
              [invalid]="submitted() && formData.authTypes.length === 0"
              (optionToggled)="toggleFormAuth($any($event))"
            />

            @if (submitted() && formData.authTypes.length === 0) {
              <p class="text-[11px] text-red-500 mt-1 font-medium">Please select at least one authentication type</p>
            }

            <!-- Selected Auth Type Pills -->
            @if (formData.authTypes.length > 0) {
              <div class="mt-2.5 flex flex-wrap gap-1.5">
                @for (type of formData.authTypes; track type) {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8EDF1] text-[#7C0E44] border border-[#EADCE2] shadow-2xs">
                    <span>{{ type }}</span>
                    <button
                      appButton
                      variant="ghost"
                      size="sm"
                      iconOnly
                      type="button"
                      (click)="removeFormAuth(type)"
                      title="Remove method"
                      aria-label="Remove method"
                    >
                      <app-icon name="close" size="xs" />
                    </button>
                  </span>
                }
              </div>
            }
          </div>
        </div>
      </app-action-modal>

    </app-page-shell>
  `
})
export class TwoStepVerificationComponent implements OnInit {
  private dataEngine = inject(DataEngineService);
  private destroyRef = inject(DestroyRef);

  private twoStepRepo!: ResourceRepository<TwoStepVerificationItem>;
  private roleRepo!: ResourceRepository<UserRoleMasterItem>;

  readonly allAuthTypes = ALL_AUTH_TYPES;

  items = signal<TwoStepVerificationItem[]>([]);
  userRoles = signal<UserRoleMasterItem[]>([]);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');

  showModal = signal<boolean>(false);
  editingId = signal<string | null>(null);
  submitted = signal<boolean>(false);
  isAuthDropdownOpen = signal<boolean>(false);

  readonly statusFilter = signal<string>('ALL');

  readonly statusFilterOptions = computed<StatusFilterOption[]>(() => {
    const all = this.items();
    const activeCount = all.filter(it => it.status !== 'Inactive').length;
    const inactiveCount = all.filter(it => it.status === 'Inactive').length;
    return [
      { value: 'ALL', label: 'All', count: all.length },
      { value: 'Active', label: 'Active', count: activeCount },
      { value: 'Inactive', label: 'Inactive', count: inactiveCount }
    ];
  });

  formData: TwoStepFormData = {
    roleType: '',
    authTypes: ['OTP']
  };

  readonly tableColumns: TableColumn<TwoStepVerificationItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    { key: 'roleType', label: 'Role type', cellClass: 'whitespace-nowrap font-semibold text-slate-800', width: 'w-56 min-w-[180px]' },
    { key: 'authTypes', label: 'Authentication type', type: 'custom', cellClass: 'min-w-[280px]' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'w-40 min-w-[140px]' }
  ];

  readonly availableRoles = computed(() => {
    const list = this.userRoles()
      .filter(r => r.status !== 'Inactive')
      .map(r => r.roleTypeName)
      .filter(Boolean);
    const unique = Array.from(new Set(list));
    return unique.length > 0
      ? unique
      : ['Super Admin', 'Department Officer', 'Scrutiny Officer', 'Training Partner'];
  });

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.statusFilter();
    let list = this.items();

    if (st !== 'ALL') {
      list = list.filter(it => (it.status || 'Active') === st);
    }

    if (!q) return list;

    return list.filter(it =>
      it.roleType.toLowerCase().includes(q) ||
      it.authTypes.some(a => a.toLowerCase().includes(q))
    );
  });

  resetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('ALL');
  }

  ngOnInit(): void {
    this.twoStepRepo = this.dataEngine.for<TwoStepVerificationItem>('TWO_STEP_VERIFICATION', { idKey: 'id' });
    this.roleRepo = this.dataEngine.for<UserRoleMasterItem>('USER_ROLES', { idKey: 'id' });

    this.loadData();
    this.loadRoles();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('.auth-dropdown-container')) {
      this.isAuthDropdownOpen.set(false);
    }
  }

  loadData(): void {
    this.loading.set(true);
    this.twoStepRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadRoles(): void {
    this.roleRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (roles) => this.userRoles.set(roles)
    });
  }

  hasAuthType(item: TwoStepVerificationItem, type: AuthMethodType): boolean {
    return Array.isArray(item.authTypes) && item.authTypes.includes(type);
  }

  toggleItemAuthType(item: TwoStepVerificationItem, type: AuthMethodType): void {
    const current = Array.isArray(item.authTypes) ? [...item.authTypes] : [];
    const index = current.indexOf(type);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(type);
    }

    this.twoStepRepo.update(item.id, { authTypes: current }).subscribe((updated) => {
      this.items.update(items =>
        items.map(it => (it.id === item.id ? { ...it, authTypes: current } : it))
      );
    });
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.submitted.set(false);
    this.isAuthDropdownOpen.set(false);

    // Pick first available role not already configured, or default
    const existingRoles = this.items().map(i => i.roleType);
    const unconfigured = this.availableRoles().find(r => !existingRoles.includes(r));

    this.formData = {
      roleType: unconfigured || this.availableRoles()[0] || '',
      authTypes: ['OTP']
    };
    this.showModal.set(true);
  }

  openEditModal(item: TwoStepVerificationItem): void {
    this.editingId.set(item.id);
    this.submitted.set(false);
    this.isAuthDropdownOpen.set(false);

    this.formData = {
      roleType: item.roleType,
      authTypes: Array.isArray(item.authTypes) ? [...item.authTypes] : []
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.isAuthDropdownOpen.set(false);
  }

  toggleAuthDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isAuthDropdownOpen.update(v => !v);
  }

  isFormAuthSelected(type: AuthMethodType): boolean {
    return this.formData.authTypes.includes(type);
  }

  toggleFormAuth(type: AuthMethodType): void {
    const idx = this.formData.authTypes.indexOf(type);
    if (idx >= 0) {
      this.formData.authTypes = this.formData.authTypes.filter(t => t !== type);
    } else {
      this.formData.authTypes = [...this.formData.authTypes, type];
    }
  }

  removeFormAuth(type: AuthMethodType): void {
    this.formData.authTypes = this.formData.authTypes.filter(t => t !== type);
  }

  submitForm(): void {
    this.submitted.set(true);
    if (!this.formData.roleType || this.formData.authTypes.length === 0) {
      return;
    }

    const editId = this.editingId();
    if (editId) {
      this.twoStepRepo.update(editId, {
        roleType: this.formData.roleType,
        authTypes: [...this.formData.authTypes]
      }).subscribe((updated) => {
        this.items.update(list => list.map(it => (it.id === editId ? updated : it)));
        this.showModal.set(false);
      });
    } else {
      this.twoStepRepo.create({
        roleType: this.formData.roleType,
        authTypes: [...this.formData.authTypes],
        status: 'Active'
      }).subscribe((created) => {
        this.items.update(list => [created, ...list]);
        this.showModal.set(false);
      });
    }
  }

  toggleStatus(item: TwoStepVerificationItem): void {
    const currentStatus = item.status === 'Inactive' ? 'Inactive' : 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    this.twoStepRepo.update(item.id, { status: newStatus }).subscribe(() => {
      this.items.update(list =>
        list.map(it => (it.id === item.id ? { ...it, status: newStatus } : it))
      );
    });
  }

  getRowClass = (item: { status?: string }): string => {
    const isInactive = item.status === 'Inactive';
    return isInactive ? 'opacity-50 !bg-slate-100/70 transition-colors' : 'bg-white transition-colors';
  };

  deleteItem(item: TwoStepVerificationItem): void {
    if (!confirm(`Are you sure you want to delete two step verification for "${item.roleType}"?`)) {
      return;
    }

    this.twoStepRepo.delete(item.id).subscribe((success) => {
      if (success) {
        this.items.update(list => list.filter(it => it.id !== item.id));
      }
    });
  }
}
