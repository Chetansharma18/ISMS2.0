import { ChangeDetectionStrategy, Component, DestroyRef, signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataEngineService } from '../../core/services/data-engine.service';
import {
  PageHeaderComponent,
  TableComponent,
  ButtonComponent,
  IconComponent,
  PageShellComponent,
  TableColumn,
  MasterFilterBarComponent,
  MasterFilterConfig,
  StatusFilterOption
} from '../../shared';
import { DistrictBlockMasterItem, UserRoleMasterItem, SchemeMasterItem, DesignationMasterItem } from '../../core/models/admin-masters.model';
import { toDistrictBlockItem } from '../../core/models/district-block.normalizer';
import { UserManagementItem } from '../../core/models/user-management.model';
import {
  BLACKLIST_DURATION_OPTIONS,
  ConfirmModalData,
  ROLE_FILTER_OPTIONS,
  UserFormData,
  buildBlacklistConfirm,
  buildDeleteConfirm,
  buildEditConfirm,
  buildNewUser,
  buildStatusConfirm,
  buildUserChanges,
  createEmptyUserForm,
  filterUsers,
  isTrainingPartner,
  isUserFormValid,
  roleTypeLabel,
  userFormFromItem,
  userRowClass
} from './user-management.util';
import { RoleFilterBarComponent } from './parts/role-filter-bar.component';
import { BlacklistSearchPanelComponent } from './parts/blacklist-search-panel.component';
import { SchemeStatusBadgeComponent } from './parts/scheme-status-badge.component';
import { UserActionsCellComponent } from './parts/user-actions-cell.component';
import { UserDetailsModalComponent } from './parts/user-details-modal.component';
import { UserFormModalComponent } from './parts/user-form-modal.component';
import { UserConfirmModalComponent } from './parts/user-confirm-modal.component';
import { UserBlacklistModalComponent, BlacklistConfigSubmission } from './parts/user-blacklist-modal.component';

export type { UserManagementItem };

@Component({
  selector: 'app-user-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent,
    IconComponent,
    PageShellComponent,
    BlacklistSearchPanelComponent,
    SchemeStatusBadgeComponent,
    UserActionsCellComponent,
    UserDetailsModalComponent,
    UserFormModalComponent,
    UserConfirmModalComponent,
    UserBlacklistModalComponent,
    MasterFilterBarComponent
  ],
  template: `
    <app-page-shell>
      
      <!-- Page Header -->
      <app-page-header
        [title]="isBlacklistedView() ? 'Blacklisted Users' : 'Users'"
        [subtitle]="isBlacklistedView()
          ? 'Search SSO ID to debar users, monitor blacklisted training partners, and filter scheme-wise'
          : 'Manage system administrators, department officers, scrutiny officers, and training partners'"
        [breadcrumbs]="isBlacklistedView()
          ? [{ label: 'Home', url: '/' }, { label: 'User Management', url: '/admin/user-management?filter=all' }, { label: 'Blacklisted Users' }]
          : [{ label: 'Home', url: '/' }, { label: 'User Management' }, { label: 'Users' }]"
      >
        <!-- Add User Button (only for regular users view) -->
        @if (!isBlacklistedView()) {
          <button
            appButton
            size="sm"
            type="button"
            (click)="openAddModal()"
            class="shrink-0"
          >
            <app-icon name="plus" size="sm" />
            <span>Add User</span>
          </button>
        }
      </app-page-header>

      <!-- Users View: Master Filter & Search -->
      @if (!isBlacklistedView()) {
        <app-master-filter-bar
          [(searchQuery)]="searchQuery"
          searchPlaceholder="Search Username, SSO ID, Role, District..."
          [(status)]="userStatusFilter"
          [showStatusFilter]="true"
          [statusOptions]="userStatusOptions()"
          [filters]="userFilters()"
          [(filterValues)]="userFilterValues"
          [totalCount]="users().length"
          [filteredCount]="filteredUsers().length"
          itemUnit="users"
          (resetFilters)="resetUserFilters()"
        />
      }

      <!-- Blacklisted Users View: SSO Blacklist Action Panel + Scheme/SSO Filter Bar -->
      @if (isBlacklistedView()) {
        <app-blacklist-search-panel
          [value]="blacklistInput()"
          [error]="blacklistError()"
          [success]="blacklistSuccess()"
          (valueChange)="blacklistInput.set($event)"
          (blacklist)="blacklistUserBySearch()"
        />

        <app-master-filter-bar
          [(searchQuery)]="blacklistSearchQuery"
          searchPlaceholder="Search blacklisted SSO ID, Name, Order Ref, District..."
          [showStatusFilter]="false"
          [filters]="blacklistFilters()"
          [(filterValues)]="blacklistFilterValues"
          [totalCount]="blacklistedTotalCount()"
          [filteredCount]="filteredUsers().length"
          itemUnit="blacklisted users"
          (resetFilters)="resetBlacklistFilters()"
        />
      }

      <!-- Users Table -->
      <app-table
        [rowClass]="getRowClass"
        [columns]="isBlacklistedView() ? blacklistedColumns : columns"
        [data]="filteredUsers()"
        [pagination]="true"
        [pageSize]="10"
        [itemUnit]="isBlacklistedView() ? 'blacklisted users' : 'users'"
        [customTemplates]="{
          roleType: roleTypeTemplate,
          schemeStatus: schemeStatusTemplate,
          blacklistScheme: blacklistSchemeTemplate,
          blacklistDuration: blacklistDurationTemplate,
          action: isBlacklistedView() ? blacklistedActionTemplate : actionTemplate
        }"
      >
      </app-table>

      <!-- Custom Template for Role Type -->
      <ng-template #roleTypeTemplate let-item>
        <span class="text-[13px] font-normal text-slate-700">{{ roleTypeLabel(item.roleType) }}</span>
      </ng-template>

      <!-- Custom Template for Scheme Status -->
      <ng-template #schemeStatusTemplate let-item>
        <app-scheme-status-badge [status]="item.schemeStatus" />
      </ng-template>

      <!-- Custom Template for Action Column (Regular Users: View, Edit, Active/Inactive switch, Blacklist) -->
      <ng-template #actionTemplate let-item>
        <app-user-actions-cell
          [user]="item"
          (view)="openViewModal($event)"
          (edit)="requestEditUser($event)"
          (toggleStatus)="toggleUserStatus($event)"
          (toggleBlacklist)="requestBlacklistToggle($event)"
        />
      </ng-template>

      <!-- Custom Template for Debarred Scheme -->
      <ng-template #blacklistSchemeTemplate let-item>
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          {{ item.blacklistScheme || 'All Schemes' }}
        </span>
      </ng-template>

      <!-- Custom Template for Debarment Duration -->
      <ng-template #blacklistDurationTemplate let-item>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <app-icon name="clock" size="xs" />
          <span>{{ item.blacklistDuration || '3 Years' }}</span>
        </span>
      </ng-template>

      <!-- Custom Template for Blacklisted Action Column (View Details, Restore/Un-blacklist) -->
      <ng-template #blacklistedActionTemplate let-item>
        <div class="flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap">
          <!-- View Details -->
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

          <!-- Restore / Remove from Blacklist -->
          <button
            appButton
            variant="ghost"
            size="sm"
            type="button"
            (click)="$event.stopPropagation(); requestBlacklistToggle(item)"
            title="Remove from Blacklist"
            aria-label="Remove Blacklist"
            class="shrink-0"
          >
            <app-icon name="check-circle" size="sm" class="text-emerald-600" />
            <span>Restore</span>
          </button>
        </div>
      </ng-template>

      <!-- Modal: View User Details -->
      <app-user-details-modal
        [isOpen]="showViewModal()"
        [user]="selectedViewUser()"
        (closed)="closeViewModal()"
      />

      <!-- Modal: Add / Edit User -->
      <app-user-form-modal
        [isOpen]="showModal()"
        [editing]="!!editingId()"
        [formData]="formData()"
        [submitted]="submitted()"
        [roleTypeOptions]="roleTypeOptions()"
        [districtOptions]="districtOptions()"
        [districtMasterItems]="districtMasterItems()"
        [schemeOptions]="schemeOptions()"
        [designationOptions]="designationOptions()"
        (save)="submitUser()"
        (cancelled)="closeModal()"
      />

      <!-- Step 1 Modal: Select Scheme and Years for Blacklisting -->
      <app-user-blacklist-modal
        [isOpen]="showBlacklistConfigModal()"
        [user]="targetBlacklistUser()"
        [schemeOptions]="schemeOptions()"
        (proceed)="onBlacklistConfigProceed($event)"
        (cancelled)="closeBlacklistConfigModal()"
      />

      <!-- Step 2 Centered Confirmation Modal (Edit / Status Change / Blacklist / Delete) -->
      <app-user-confirm-modal
        [isOpen]="showConfirmModal()"
        [data]="confirmModalData()"
        (confirmed)="onConfirmAction()"
        (dismissed)="closeConfirmModal()"
      />

    </app-page-shell>
  `
})
export class UserManagementComponent {
  searchQuery = signal<string>('');
  selectedRoleFilter = signal<string>('all');
  showModal = signal<boolean>(false);
  showViewModal = signal<boolean>(false);
  showBlacklistConfigModal = signal<boolean>(false);
  targetBlacklistUser = signal<UserManagementItem | null>(null);
  showConfirmModal = signal<boolean>(false);
  confirmModalData = signal<ConfirmModalData | null>(null);

  editingId = signal<string | null>(null);
  selectedViewUser = signal<UserManagementItem | null>(null);
  submitted = signal<boolean>(false);

  roleTypeLabel = roleTypeLabel;
  isTrainingPartner = isTrainingPartner;

  formData = signal<UserFormData>(createEmptyUserForm());

  private dataEngine = inject(DataEngineService);
  private userRepo = this.dataEngine.for<UserManagementItem>('USERS');
  private roleRepo = this.dataEngine.for<UserRoleMasterItem>('USER_ROLES');
  // Maps the backend block shape ({ name, code, district: { name } }) to the screen's district/block fields.
  private districtRepo = this.dataEngine.for<DistrictBlockMasterItem>('DISTRICTS', { normalizer: item => toDistrictBlockItem(item) });
  private schemeRepo = this.dataEngine.for<SchemeMasterItem>('SCHEME_MASTERS');
  private designationRepo = this.dataEngine.for<DesignationMasterItem>('DESIGNATIONS');
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  users = signal<UserManagementItem[]>([]);
  userRoles = signal<UserRoleMasterItem[]>([]);
  districtMasterItems = signal<DistrictBlockMasterItem[]>([]);
  schemeMasterItems = signal<SchemeMasterItem[]>([]);
  designationMasterItems = signal<DesignationMasterItem[]>([]);

  constructor() {
    this.userRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => this.users.set(list));
    this.roleRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => {
      const active = list.filter(r => r.status !== 'Inactive');
      this.userRoles.set(active.length > 0 ? active : list);
    });
    this.districtRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => {
      const active = list.filter(d => d.status !== 'Inactive');
      this.districtMasterItems.set(active.length > 0 ? active : list);
    });
    this.schemeRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => {
      const active = list.filter(s => s.status !== 'Inactive');
      this.schemeMasterItems.set(active.length > 0 ? active : list);
    });
    this.designationRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => {
      const active = list.filter(d => d.status !== 'Inactive');
      this.designationMasterItems.set(active.length > 0 ? active : list);
    });

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['filter'] === 'blacklisted') {
        this.selectedRoleFilter.set('blacklisted');
      } else {
        this.selectedRoleFilter.set('all');
      }
    });
  }

  readonly designationOptions = computed(() => {
    const names = this.designationMasterItems().map(d => d.designationName).filter(Boolean);
    return Array.from(new Set(names));
  });

  readonly schemeOptions = computed(() => {
    const schemes = this.schemeMasterItems().map(s => s.schemeName).filter(Boolean);
    const unique = Array.from(new Set(schemes));
    return unique.length > 0
      ? unique
      : [
          'Vishwakarma Yuva Udyami Protsahan Yojana',
          'Mukhyamantri Yuva Swarojgar Yojana (2026)',
          'Mukhyamantri Yuva Sambal Yojana',
          'Mukhya Mantri Yuva Kaushal Yojana'
        ];
  });

  readonly roleTypeOptions = computed(() => {
    const roles = this.userRoles().map(r => r.roleTypeName).filter(Boolean);
    const unique = Array.from(new Set(roles));
    return unique.length > 0
      ? unique
      : ['Super Admin', 'Department Officer', 'Scrutiny Officer', 'Training Partner'];
  });

  readonly districtOptions = computed(() => {
    const districts = this.districtMasterItems().map(d => d.districtName).filter(Boolean);
    const unique = Array.from(new Set(districts));
    return unique.length > 0
      ? unique
      : ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Kota'];
  });

  readonly roleFilterOptions = computed(() => {
    const options: Array<{ value: string; label: string }> = [{ value: 'all', label: 'All' }];
    this.roleTypeOptions().forEach(role => {
      options.push({ value: role.toLowerCase(), label: role });
    });
    return options;
  });

  readonly isBlacklistedView = computed(() => this.selectedRoleFilter() === 'blacklisted');

  readonly blacklistedTotalCount = computed(() =>
    this.users().filter(u => u.schemeStatus === 'Blacklisted').length
  );

  readonly userStatusFilter = signal<'ALL' | 'Active' | 'Inactive'>('ALL');
  readonly userFilterValues = signal<Record<string, string>>({});
  readonly blacklistFilterValues = signal<Record<string, string>>({});
  readonly blacklistSearchQuery = signal<string>('');
  readonly blacklistDurationOptions = BLACKLIST_DURATION_OPTIONS;

  readonly userStatusOptions = computed<StatusFilterOption[]>(() => [
    { value: 'ALL', label: 'All' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ]);

  readonly userFilters = computed<MasterFilterConfig[]>(() => [
    {
      key: 'role',
      label: 'Role',
      options: () => this.roleTypeOptions(),
      placeholder: 'All Roles'
    },
    {
      key: 'district',
      label: 'District',
      options: () => this.districtOptions(),
      placeholder: 'All Districts'
    }
  ]);

  readonly blacklistFilters = computed<MasterFilterConfig[]>(() => [
    {
      key: 'scheme',
      label: 'Scheme',
      options: () => this.schemeOptions(),
      placeholder: 'All Schemes'
    },
    {
      key: 'duration',
      label: 'Duration',
      options: BLACKLIST_DURATION_OPTIONS,
      placeholder: 'All Durations'
    }
  ]);

  readonly filteredUsers = computed(() => {
    if (this.isBlacklistedView()) {
      return filterUsers(
        this.users(),
        'blacklisted',
        this.blacklistSearchQuery(),
        {
          scheme: this.blacklistFilterValues()['scheme'],
          duration: this.blacklistFilterValues()['duration']
        }
      );
    }

    const role = this.userFilterValues()['role'] || (this.selectedRoleFilter() !== 'blacklisted' ? this.selectedRoleFilter() : 'all');
    let list = filterUsers(this.users(), role.toLowerCase(), this.searchQuery());
    const status = this.userStatusFilter();
    if (status !== 'ALL') {
      list = list.filter(u => u.schemeStatus === status);
    }
    const district = this.userFilterValues()['district'];
    if (district) {
      list = list.filter(u => u.districtName === district);
    }
    return list;
  });

  resetUserFilters(): void {
    this.searchQuery.set('');
    this.userStatusFilter.set('ALL');
    this.userFilterValues.set({});
  }

  resetBlacklistFilters(): void {
    this.blacklistSearchQuery.set('');
    this.blacklistFilterValues.set({});
  }

  blacklistInput = signal('');
  blacklistError = signal('');
  blacklistSuccess = signal('');

  blacklistUserBySearch() {
    this.blacklistError.set('');
    this.blacklistSuccess.set('');
    const q = this.blacklistInput().trim().toLowerCase();
    if (!q) {
      this.blacklistError.set('Please enter a valid SSO ID or Username');
      return;
    }

    const usersList = this.users();
    const userToBlacklist = usersList.find(u =>
      (u.ssoId && u.ssoId.toLowerCase() === q) ||
      (u.username && u.username.toLowerCase() === q) ||
      (u.userId && u.userId.toLowerCase() === q)
    );

    if (!userToBlacklist) {
      this.blacklistError.set('User not found in system.');
      return;
    }

    if (userToBlacklist.schemeStatus === 'Blacklisted') {
      this.blacklistError.set('User is already blacklisted.');
      return;
    }

    this.blacklistInput.set('');
    this.targetBlacklistUser.set(userToBlacklist);
    this.showBlacklistConfigModal.set(true);
  }

  readonly columns: TableColumn<UserManagementItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    {
      key: 'username',
      label: 'Username',
      cellClass: 'whitespace-nowrap font-normal text-slate-800'
    },
    {
      key: 'ssoId',
      label: 'SSO ID',
      cellClass: 'whitespace-nowrap tabular-nums text-xs text-slate-700'
    },
    {
      key: 'roleType',
      label: 'Role Type',
      type: 'custom',
      cellClass: 'whitespace-nowrap'
    },
    {
      key: 'districtName',
      label: 'District Name',
      cellClass: 'whitespace-nowrap text-slate-700'
    },
    {
      key: 'action',
      label: 'Actions',
      align: 'center',
      type: 'custom',
      width: 'min-w-[430px]'
    }
  ];

  readonly blacklistedColumns: TableColumn<UserManagementItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    {
      key: 'username',
      label: 'Training Partner / Name',
      cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[180px]'
    },
    {
      key: 'ssoId',
      label: 'SSO ID',
      cellClass: 'whitespace-nowrap tabular-nums text-xs text-slate-700 min-w-[130px]'
    },
    {
      key: 'districtName',
      label: 'District',
      cellClass: 'whitespace-nowrap text-slate-700 min-w-[110px]'
    },
    {
      key: 'blacklistScheme',
      label: 'Debarred Scheme',
      type: 'custom',
      cellClass: 'min-w-[200px]'
    },
    {
      key: 'blacklistDuration',
      label: 'Duration',
      type: 'custom',
      cellClass: 'whitespace-nowrap min-w-[120px]'
    },
    {
      key: 'blacklistedAt',
      label: 'Debarred Date',
      cellClass: 'whitespace-nowrap text-xs text-slate-600 min-w-[110px]'
    },
    {
      key: 'schemeStatus',
      label: 'Status',
      align: 'center',
      type: 'custom',
      width: 'w-32'
    },
    {
      key: 'action',
      label: 'Actions',
      align: 'center',
      type: 'custom',
      width: 'w-40 min-w-[140px]'
    }
  ];

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.submitted.set(false);
    const nextIdNum = 1000 + this.users().length + 1;
    this.formData.set(createEmptyUserForm(`USR-${nextIdNum}`));
    this.showModal.set(true);
  }

  openEditModal(item: UserManagementItem): void {
    this.editingId.set(item.id);
    this.submitted.set(false);
    this.formData.set(userFormFromItem(item));
    this.showModal.set(true);
  }

  openViewModal(item: UserManagementItem): void {
    this.selectedViewUser.set(item);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  toggleUserStatus(item: UserManagementItem): void {
    const newStatus = item.schemeStatus === 'Active' ? 'Inactive' : 'Active';
    this.userRepo.update(item.id, { schemeStatus: newStatus }).subscribe(updated => {
      this.users.update(current =>
        current.map(u => u.id === item.id ? { ...u, schemeStatus: updated?.schemeStatus || newStatus } : u)
      );
    });
  }

  submitUser(): void {
    this.submitted.set(true);
    const form = this.formData();
    if (!isUserFormValid(form)) {
      return; // Required validation
    }

    const editId = this.editingId();
    if (editId) {
      // Edit existing user
      this.userRepo.update(editId, buildUserChanges(form)).subscribe(res => {
        this.users.update(current =>
          current.map(u => u.id === editId ? { ...u, ...res } : u)
        );
      });
    } else {
      // Add new user
      const newItem = buildNewUser(form, 'usr-' + Date.now());

      this.userRepo.create(newItem).subscribe(created => {
        this.users.update(current => {
          const updated = [created, ...current];
          return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
        });
      });
    }

    this.showModal.set(false);
  }

  private openConfirm(data: ConfirmModalData): void {
    this.confirmModalData.set(data);
    this.showConfirmModal.set(true);
  }

  requestEditUser(item: UserManagementItem): void {
    this.openConfirm(buildEditConfirm(item));
  }

  requestToggleUserStatus(item: UserManagementItem): void {
    this.openConfirm(buildStatusConfirm(item));
  }

  requestBlacklistToggle(item: UserManagementItem): void {
    if (item.schemeStatus === 'Blacklisted') {
      this.openConfirm(buildBlacklistConfirm(item));
    } else {
      this.targetBlacklistUser.set(item);
      this.showBlacklistConfigModal.set(true);
    }
  }

  onBlacklistConfigProceed(config: BlacklistConfigSubmission): void {
    const user = this.targetBlacklistUser();
    if (!user) return;
    this.showBlacklistConfigModal.set(false);
    this.openConfirm(buildBlacklistConfirm(user, config));
  }

  closeBlacklistConfigModal(): void {
    this.showBlacklistConfigModal.set(false);
    this.targetBlacklistUser.set(null);
  }

  toggleBlacklistStatus(item: UserManagementItem, details?: { scheme?: string; years?: string; remarks?: string }): void {
    const isNowBlacklisted = item.schemeStatus !== 'Blacklisted';
    const newStatus: UserManagementItem['schemeStatus'] = isNowBlacklisted ? 'Blacklisted' : 'Active';

    const updates: Partial<UserManagementItem> = {
      schemeStatus: newStatus,
      blacklistScheme: isNowBlacklisted ? (details?.scheme || 'All Schemes') : undefined,
      blacklistDuration: isNowBlacklisted ? (details?.years || '3 Years') : undefined,
      blacklistRemarks: isNowBlacklisted ? details?.remarks : undefined,
      blacklistedAt: isNowBlacklisted ? new Date().toISOString() : undefined
    };

    this.userRepo.update(item.id, updates).subscribe(updated => {
      this.users.update(current =>
        current.map(u => u.id === item.id ? { ...u, ...updates, ...updated } : u)
      );
    });
  }

  requestDeleteUser(item: UserManagementItem): void {
    this.openConfirm(buildDeleteConfirm(item));
  }

  onConfirmAction(): void {
    const data = this.confirmModalData();
    if (!data) return;

    this.showConfirmModal.set(false);
    this.confirmModalData.set(null);

    if (data.type === 'edit') {
      this.openEditModal(data.user);
    } else if (data.type === 'status') {
      this.toggleUserStatus(data.user);
    } else if (data.type === 'blacklist') {
      this.toggleBlacklistStatus(data.user, data.metadata);
    } else if (data.type === 'delete') {
      this.deleteUser(data.user);
    }
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
    this.confirmModalData.set(null);
    this.targetBlacklistUser.set(null);
  }

  deleteUser(item: UserManagementItem): void {
    this.userRepo.delete(item.id).subscribe(() => {
      this.users.update(current => {
        const updated = current.filter(u => u.id !== item.id);
        return updated.map((u, index) => ({ ...u, sNo: index + 1 }));
      });
    });
  }

  getRowClass = userRowClass;

}
