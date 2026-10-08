import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PageHeaderComponent,
  TableComponent,
  ActionModalComponent,
  TableColumn
} from '../../shared';

import {
  UserRoleMasterItem,
  MOCK_USER_ROLE_MASTER_ITEMS
} from '../../core/mock/data/admin-masters.mock';

export type { UserRoleMasterItem };

@Component({
  selector: 'app-user-role-master',
  standalone: true,
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
      <app-page-header title="User Role Type Master">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                placeholder="Search by role type name or permission..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E] transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add User Role Type Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-[#174A6E] hover:bg-[#0B3558] text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Role Type</span>
          </button>
        </div>
      </app-page-header>

      <!-- Master Table -->
      <app-table
        [columns]="columns"
        [data]="filteredRoles()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="roles"
        [customTemplates]="{
          permissions: permissionsTemplate,
          status: statusTemplate,
          action: actionTemplate
        }"
      >
      </app-table>

      <!-- Custom Template for Permissions -->
      <ng-template #permissionsTemplate let-item>
        <div class="flex flex-wrap gap-1.5 py-1">
          @for (perm of item.permissions; track perm) {
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-[#174A6E] border border-sky-200">
              {{ perm }}
            </span>
          }
        </div>
      </ng-template>

      <!-- Custom Template for Status -->
      <ng-template #statusTemplate let-item>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none">
          {{ item.status }}
        </span>
      </ng-template>

      <!-- Custom Template for Action Column -->
      <ng-template #actionTemplate let-item>
        <div class="flex items-center justify-center whitespace-nowrap">
          <!-- Edit -->
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
          <button
            type="button"
            (click)="$event.stopPropagation(); deleteRole(item)"
            class="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Delete Role Type"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </ng-template>

      <!-- Modal: Add New Role Type -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[560px]"
        (primaryAction)="submitRole()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Add New User Role Type
        </h2>
        <div class="mt-4 font-sans text-[13px] space-y-4">
          <!-- Role Type Name Field -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">Role Type Name*</label>
            <input
              type="text"
              maxlength="100"
              placeholder="Enter role type name (e.g. Scrutiny Officer)"
              [(ngModel)]="formData.roleTypeName"
              [ngClass]="{'border-red-500': submitted() && !formData.roleTypeName, 'border-[#8FA3B6]': !(submitted() && !formData.roleTypeName)}"
              class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
            />
            @if (submitted() && !formData.roleTypeName) {
              <div class="text-xs text-red-500 mt-1 font-medium">Role Type Name is required</div>
            }
          </div>

          <!-- Add Permissions with Dropdown & Plus Button -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">Add Permission for Role Type*</label>
            <div class="flex items-center gap-2">
              <select
                [(ngModel)]="selectedPermissionToAdd"
                class="flex-1 px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
              >
                <option value="" disabled selected>Select permission to add...</option>
                @for (perm of unselectedPermissions(); track perm) {
                  <option [value]="perm">{{ perm }}</option>
                }
              </select>

              <button
                type="button"
                (click)="addSelectedPermission()"
                [disabled]="!selectedPermissionToAdd"
                class="p-2 bg-[#174A6E] hover:bg-[#0B3558] disabled:bg-slate-300 text-white rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
                title="Add Permission"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <!-- List of Added Permissions -->
            @if (formData.selectedPermissions.length > 0) {
              <div class="mt-3 flex flex-wrap gap-2 border border-slate-200 rounded-lg p-3 bg-slate-50 min-h-[50px] items-center">
                @for (perm of formData.selectedPermissions; track perm) {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-[#8FA3B6] text-[#174A6E] shadow-2xs select-none">
                    <span>{{ perm }}</span>
                    <button
                      type="button"
                      (click)="removePermission(perm)"
                      class="text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                      title="Remove"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                }
              </div>
            }

            @if (submitted() && formData.selectedPermissions.length === 0) {
              <div class="text-xs text-red-500 mt-1 font-medium">At least one permission must be added</div>
            }
          </div>
        </div>
      </app-action-modal>

    </div>
  `
})
export class UserRoleMasterComponent {
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  editingId = signal<string | null>(null);
  submitted = signal<boolean>(false);
  selectedPermissionToAdd: string = '';

  availablePermissions: string[] = [
    'View EOI Configuration',
    'Create & Edit EOI',
    'Delete EOI Proposal',
    'Batch Approval & Scrutiny',
    'Manage Master Records',
    'Camera CCTV Live Monitoring',
    'Grievance Redressal Access',
    'View Financial Reports'
  ];

  formData = {
    roleTypeName: '',
    selectedPermissions: [] as string[]
  };

  roles = signal<UserRoleMasterItem[]>(MOCK_USER_ROLE_MASTER_ITEMS);

  readonly filteredRoles = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.roles();
    if (!q) return all;
    return all.filter(r =>
      r.roleTypeName.toLowerCase().includes(q) ||
      r.permissions.some(p => p.toLowerCase().includes(q))
    );
  });

  readonly unselectedPermissions = computed(() => {
    return this.availablePermissions.filter(
      p => !this.formData.selectedPermissions.includes(p)
    );
  });

  readonly columns: TableColumn<UserRoleMasterItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    {
      key: 'roleTypeName',
      label: 'Role Type Name',
      cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[150px]'
    },
    {
      key: 'permissions',
      label: 'Assigned Permissions',
      type: 'custom',
      cellClass: 'min-w-[280px]'
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      type: 'custom',
      width: 'w-28'
    },
    {
      key: 'action',
      label: 'Action',
      align: 'center',
      type: 'custom',
      width: 'min-w-[100px]'
    }
  ];

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  
  openEditModal(item: any): void {
    this.editingId.set(item.id);
    this.submitted.set(false);
    this.formData = { ...this.formData, ...item };
    this.showModal.set(true);
  }
openAddModal(): void {
    this.editingId.set(null);
    this.submitted.set(false);
    this.selectedPermissionToAdd = '';
    this.formData = {
      roleTypeName: '',
      selectedPermissions: []
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  addSelectedPermission(): void {
    if (this.selectedPermissionToAdd && !this.formData.selectedPermissions.includes(this.selectedPermissionToAdd)) {
      this.formData.selectedPermissions.push(this.selectedPermissionToAdd);
      this.selectedPermissionToAdd = '';
    }
  }

  removePermission(perm: string): void {
    const idx = this.formData.selectedPermissions.indexOf(perm);
    if (idx > -1) {
      this.formData.selectedPermissions.splice(idx, 1);
    }
  }

  submitRole(): void {
    this.submitted.set(true);
    if (!this.formData.roleTypeName.trim() || this.formData.selectedPermissions.length === 0) {
      return; // Required validation
    }

    const editId = this.editingId();
    if (editId) {
      this.roles.update(current => {
      const updated = current.map((item: any) => item.id === editId ? { ...item, ...this.formData } : item);
      return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
    });
    } else {
      const newItem: UserRoleMasterItem = {
      sNo: 1,
      id: 'role-' + Date.now(),
      roleTypeName: this.formData.roleTypeName.trim(),
      permissions: [...this.formData.selectedPermissions],
      status: 'Active'
    };

    this.roles.update(current => {
      const updated = [newItem, ...current];
      return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
    });
    }

    this.showModal.set(false);
  }

  deleteRole(item: UserRoleMasterItem): void {
    if (confirm(`Are you sure you want to delete role type "${item.roleTypeName}"?`)) {
      this.roles.update(current => {
        const updated = current.filter(r => r.id !== item.id);
        return updated.map((r, index) => ({ ...r, sNo: index + 1 }));
      });
    }
  }
}
