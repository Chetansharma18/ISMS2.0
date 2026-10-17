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
  TableColumn
} from '../../shared';
import { DistrictBlockMasterItem, UserRoleMasterItem, SchemeMasterItem, DesignationMasterItem } from '../../core/models/admin-masters.model';
import { UserManagementItem } from '../../core/models/user-management.model';
import {
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
    RoleFilterBarComponent,
    BlacklistSearchPanelComponent,
    SchemeStatusBadgeComponent,
    UserActionsCellComponent,
    UserDetailsModalComponent,
    UserFormModalComponent,
    UserConfirmModalComponent
  ],
  template: `
    <app-page-shell>
      
      <!-- Page Header -->
      <app-page-header
        title="User Management"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'User Management' }]"
        [searchable]="true"
        searchPlaceholder="Search User ID, Username, SSO, Role, District..."
        [(searchQuery)]="searchQuery"
      >
        <!-- Add User Button -->
        @if (selectedRoleFilter() !== 'blacklisted') {
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

      <!-- Role Filters -->
      @if (selectedRoleFilter() !== 'blacklisted') {
        <app-role-filter-bar
          [options]="roleFilterOptions()"
          [selected]="selectedRoleFilter()"
          (selectedChange)="selectedRoleFilter.set($event)"
        />
      }

      @if (selectedRoleFilter() === 'blacklisted') {
        <app-blacklist-search-panel
          [value]="blacklistInput()"
          [error]="blacklistError()"
          [success]="blacklistSuccess()"
          (valueChange)="blacklistInput.set($event)"
          (blacklist)="blacklistUserBySearch()"
        />
      }

      <!-- Users Table -->
      <app-table
        [rowClass]="getRowClass"
        [columns]="columns"
        [data]="filteredUsers()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="users"
        [customTemplates]="{
          roleType: roleTypeTemplate,
          schemeStatus: schemeStatusTemplate,
          action: actionTemplate
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

      <!-- Custom Template for Action Column (View, Edit, Mark Inactive/Blacklisted) -->
      <ng-template #actionTemplate let-item>
        <app-user-actions-cell
          [user]="item"
          (view)="openViewModal($event)"
          (edit)="requestEditUser($event)"
          (toggleStatus)="toggleUserStatus($event)"
          (toggleBlacklist)="requestBlacklistToggle($event)"
        />
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

      <!-- Centered Confirmation Modal (Edit / Status Change / Delete) -->
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
  private districtRepo = this.dataEngine.for<DistrictBlockMasterItem>('DISTRICTS');
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

  readonly filteredUsers = computed(() =>
    filterUsers(this.users(), this.selectedRoleFilter(), this.searchQuery())
  );

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

    userToBlacklist.schemeStatus = 'Blacklisted';
    this.users.set([...usersList]);
    this.blacklistSuccess.set(`Successfully blacklisted user: ${userToBlacklist.username} (${userToBlacklist.ssoId || userToBlacklist.userId})`);
    this.blacklistInput.set('');

    setTimeout(() => this.blacklistSuccess.set(''), 3000);
  }

  readonly columns: TableColumn<UserManagementItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    {
      key: 'userId',
      label: 'User ID',
      cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700'
    },
    {
      key: 'username',
      label: 'Username',
      cellClass: 'whitespace-nowrap font-normal text-slate-800'
    },
    {
      key: 'ssoId',
      label: 'SSO ID',
      cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700'
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
      key: 'schemeStatus',
      label: 'Scheme Status',
      align: 'center',
      type: 'custom',
      width: 'w-32'
    },
    {
      key: 'action',
      label: 'Actions',
      align: 'center',
      type: 'custom',
      width: 'min-w-[430px]'
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
    this.openConfirm(buildBlacklistConfirm(item));
  }

  toggleBlacklistStatus(item: UserManagementItem): void {
    const newStatus: UserManagementItem['schemeStatus'] =
      item.schemeStatus === 'Blacklisted' ? 'Active' : 'Blacklisted';

    this.userRepo.update(item.id, { schemeStatus: newStatus }).subscribe(updated => {
      this.users.update(current =>
        current.map(u => u.id === item.id ? { ...u, schemeStatus: updated?.schemeStatus || newStatus } : u)
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
      this.toggleBlacklistStatus(data.user);
    } else if (data.type === 'delete') {
      this.deleteUser(data.user);
    }
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
    this.confirmModalData.set(null);
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
