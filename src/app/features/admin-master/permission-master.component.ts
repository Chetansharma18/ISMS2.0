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
  PermissionMasterItem,
  MOCK_PERMISSION_MASTER_ITEMS
} from '../../core/mock/data/admin-masters.mock';

export type { PermissionMasterItem };

@Component({
  selector: 'app-permission-master',
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
      <app-page-header title="Permission Master">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                placeholder="Search by permission name, code, or module..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E] transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add Permission Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-[#174A6E] hover:bg-[#0B3558] text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Permission</span>
          </button>
        </div>
      </app-page-header>

      <!-- Master Table -->
      <app-table
        [columns]="columns"
        [data]="filteredPermissions()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="permissions"
        [customTemplates]="{
          status: statusTemplate,
          action: actionTemplate
        }"
      >
      </app-table>

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
            (click)="$event.stopPropagation(); deletePermission(item)"
            class="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Delete Permission"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </ng-template>

      <!-- Modal: Add New Permission -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[540px]"
        (primaryAction)="submitPermission()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Add New Permission
        </h2>
        <div class="mt-4 font-sans text-[13px] space-y-4">
          <div>
            <label class="block text-slate-700 font-medium mb-1">Permission Name*</label>
            <input
              type="text"
              maxlength="100"
              placeholder="Enter permission name (e.g. View EOI Configuration)"
              [(ngModel)]="formData.permissionName"
              [ngClass]="{'border-red-500': submitted() && !formData.permissionName, 'border-[#8FA3B6]': !(submitted() && !formData.permissionName)}"
              class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
            />
            @if (submitted() && !formData.permissionName) {
              <div class="text-xs text-red-500 mt-1 font-medium">Permission Name is required</div>
            }
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Permission Code*</label>
              <input
                type="text"
                maxlength="50"
                placeholder="e.g. PERM_EOI_VIEW"
                [(ngModel)]="formData.permissionCode"
                [ngClass]="{'border-red-500': submitted() && !formData.permissionCode, 'border-[#8FA3B6]': !(submitted() && !formData.permissionCode)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 font-mono text-xs"
              />
              @if (submitted() && !formData.permissionCode) {
                <div class="text-xs text-red-500 mt-1 font-medium">Permission Code is required</div>
              }
            </div>

            <div>
              <label class="block text-slate-700 font-medium mb-1">Module / Feature*</label>
              <select
                [(ngModel)]="formData.moduleName"
                [ngClass]="{'border-red-500': submitted() && !formData.moduleName, 'border-[#8FA3B6]': !(submitted() && !formData.moduleName)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
              >
                <option value="" disabled selected>Select Module</option>
                <option value="EOI Management">EOI Management</option>
                <option value="Batch Approval">Batch Approval</option>
                <option value="User Management">User Management</option>
                <option value="Master Data">Master Data</option>
                <option value="Grievance Redressal">Grievance Redressal</option>
                <option value="Camera Monitoring">Camera Monitoring</option>
              </select>
              @if (submitted() && !formData.moduleName) {
                <div class="text-xs text-red-500 mt-1 font-medium">Module / Feature is required</div>
              }
            </div>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Description</label>
            <textarea
              rows="3"
              maxlength="250"
              placeholder="Enter permission description"
              [(ngModel)]="formData.description"
              class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
            ></textarea>
          </div>
        </div>
      </app-action-modal>

    </div>
  `
})
export class PermissionMasterComponent {
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  editingId = signal<string | null>(null);
  submitted = signal<boolean>(false);

  formData = {
    permissionName: '',
    permissionCode: '',
    moduleName: '',
    description: ''
  };

  permissions = signal<PermissionMasterItem[]>(MOCK_PERMISSION_MASTER_ITEMS);

  readonly filteredPermissions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.permissions();
    if (!q) return all;
    return all.filter(p =>
      p.permissionName.toLowerCase().includes(q) ||
      p.permissionCode.toLowerCase().includes(q) ||
      p.moduleName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  readonly columns: TableColumn<PermissionMasterItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    {
      key: 'permissionName',
      label: 'Permission Name',
      cellClass: 'whitespace-nowrap font-semibold text-slate-800'
    },
    {
      key: 'permissionCode',
      label: 'Permission Code',
      cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700'
    },
    {
      key: 'moduleName',
      label: 'Module / Feature',
      cellClass: 'whitespace-nowrap font-medium text-slate-700'
    },
    {
      key: 'description',
      label: 'Description',
      cellClass: 'text-slate-600 text-xs'
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
    this.formData = { permissionName: '', permissionCode: '', moduleName: '', description: '' };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitPermission(): void {
    this.submitted.set(true);
    if (!this.formData.permissionName.trim() || !this.formData.permissionCode.trim() || !this.formData.moduleName.trim()) {
      return; // Required validation
    }

    const editId = this.editingId();
    if (editId) {
      this.permissions.update(current => {
      const updated = current.map((item: any) => item.id === editId ? { ...item, ...this.formData } : item);
      return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
    });
    } else {
      const newItem: PermissionMasterItem = {
      sNo: 1,
      id: 'perm-' + Date.now(),
      permissionName: this.formData.permissionName.trim(),
      permissionCode: this.formData.permissionCode.trim().toUpperCase(),
      moduleName: this.formData.moduleName.trim(),
      description: this.formData.description.trim() || 'No description provided.',
      status: 'Active'
    };

    this.permissions.update(current => {
      const updated = [newItem, ...current];
      return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
    });
    }

    this.showModal.set(false);
  }

  deletePermission(item: PermissionMasterItem): void {
    if (confirm(`Are you sure you want to delete permission "${item.permissionName}"?`)) {
      this.permissions.update(current => {
        const updated = current.filter(p => p.id !== item.id);
        return updated.map((p, index) => ({ ...p, sNo: index + 1 }));
      });
    }
  }
}
