import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PageHeaderComponent,
  TableComponent,
  ActionModalComponent,
  TableColumn
} from '../../shared';

export interface UserManagementItem {
  sNo: number;
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  roleType: string;
  designation: string;
  district: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-user-management',
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
      <app-page-header title="User Management">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                placeholder="Search by name, email, role, or district..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E] transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add User Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-[#174A6E] hover:bg-[#0B3558] text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add User</span>
          </button>
        </div>
      </app-page-header>

      <!-- Users Table -->
      <app-table
        [columns]="columns"
        [data]="filteredUsers()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="users"
        [customTemplates]="{
          roleType: roleTypeTemplate,
          status: statusTemplate,
          action: actionTemplate
        }"
      >
      </app-table>

      <!-- Custom Template for Role Type -->
      <ng-template #roleTypeTemplate let-item>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-50 text-[#174A6E] border border-sky-200">
          {{ item.roleType }}
        </span>
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
          <button
            type="button"
            (click)="$event.stopPropagation(); deleteUser(item)"
            class="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Delete User"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </ng-template>

      <!-- Modal: Add New User -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[560px]"
        (primaryAction)="submitUser()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Add New User
        </h2>
        <div class="mt-4 font-sans text-[13px] space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Full Name -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Full Name*</label>
              <input
                type="text"
                maxlength="100"
                placeholder="Enter full name"
                [(ngModel)]="formData.fullName"
                [ngClass]="{'border-red-500': submitted() && !formData.fullName, 'border-[#8FA3B6]': !(submitted() && !formData.fullName)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
              />
              @if (submitted() && !formData.fullName) {
                <div class="text-xs text-red-500 mt-1 font-medium">Full Name is required</div>
              }
            </div>

            <!-- Email -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Email Address*</label>
              <input
                type="email"
                maxlength="100"
                placeholder="name@example.com"
                [(ngModel)]="formData.email"
                [ngClass]="{'border-red-500': submitted() && !formData.email, 'border-[#8FA3B6]': !(submitted() && !formData.email)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
              />
              @if (submitted() && !formData.email) {
                <div class="text-xs text-red-500 mt-1 font-medium">Valid email is required</div>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Mobile Number -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Mobile Number*</label>
              <input
                type="text"
                maxlength="10"
                placeholder="10-digit mobile number"
                [(ngModel)]="formData.mobileNumber"
                [ngClass]="{'border-red-500': submitted() && !formData.mobileNumber, 'border-[#8FA3B6]': !(submitted() && !formData.mobileNumber)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
              />
              @if (submitted() && !formData.mobileNumber) {
                <div class="text-xs text-red-500 mt-1 font-medium">Mobile Number is required</div>
              }
            </div>

            <!-- Role Type -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Role Type*</label>
              <select
                [(ngModel)]="formData.roleType"
                [ngClass]="{'border-red-500': submitted() && !formData.roleType, 'border-[#8FA3B6]': !(submitted() && !formData.roleType)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
              >
                <option value="" disabled selected>Select Role Type</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Department Officer">Department Officer</option>
                <option value="Scrutiny Officer">Scrutiny Officer</option>
                <option value="Training Partner">Training Partner</option>
              </select>
              @if (submitted() && !formData.roleType) {
                <div class="text-xs text-red-500 mt-1 font-medium">Role Type is required</div>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Designation -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Designation</label>
              <select
                [(ngModel)]="formData.designation"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
              >
                <option value="Managing Director">Managing Director</option>
                <option value="Joint Director">Joint Director</option>
                <option value="Deputy Director">Deputy Director</option>
                <option value="District Nodal Officer">District Nodal Officer</option>
                <option value="System Administrator">System Administrator</option>
              </select>
            </div>

            <!-- District -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">District</label>
              <select
                [(ngModel)]="formData.district"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
              >
                <option value="All Districts">All Districts (State Level)</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Jodhpur">Jodhpur</option>
                <option value="Udaipur">Udaipur</option>
                <option value="Ajmer">Ajmer</option>
                <option value="Kota">Kota</option>
              </select>
            </div>
          </div>
        </div>
      </app-action-modal>

    </div>
  `
})
export class UserManagementComponent {
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  submitted = signal<boolean>(false);

  formData = {
    fullName: '',
    email: '',
    mobileNumber: '',
    roleType: '',
    designation: 'Joint Director',
    district: 'Jaipur'
  };

  users = signal<UserManagementItem[]>([
    {
      sNo: 1,
      id: 'usr-1',
      fullName: 'Rajesh Sharma',
      email: 'rajesh.sharma@isms.gov.in',
      mobileNumber: '9829012345',
      roleType: 'Super Admin',
      designation: 'Managing Director',
      district: 'All Districts',
      status: 'Active'
    },
    {
      sNo: 2,
      id: 'usr-2',
      fullName: 'Priya Verma',
      email: 'priya.verma@isms.gov.in',
      mobileNumber: '9414098765',
      roleType: 'Department Officer',
      designation: 'Joint Director',
      district: 'Jaipur',
      status: 'Active'
    },
    {
      sNo: 3,
      id: 'usr-3',
      fullName: 'Amitabh Sen',
      email: 'amitabh.sen@isms.gov.in',
      mobileNumber: '9783011223',
      roleType: 'Scrutiny Officer',
      designation: 'Deputy Director',
      district: 'Jodhpur',
      status: 'Active'
    },
    {
      sNo: 4,
      id: 'usr-4',
      fullName: 'Sunil Kumar',
      email: 'sunil.kumar@tp.org',
      mobileNumber: '9828055443',
      roleType: 'Training Partner',
      designation: 'Project Nodal Officer',
      district: 'Udaipur',
      status: 'Active'
    }
  ]);

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.users();
    if (!q) return all;
    return all.filter(u =>
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roleType.toLowerCase().includes(q) ||
      u.district.toLowerCase().includes(q)
    );
  });

  readonly columns: TableColumn<UserManagementItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    {
      key: 'fullName',
      label: 'Full Name',
      cellClass: 'whitespace-nowrap font-semibold text-slate-800'
    },
    {
      key: 'email',
      label: 'Email Address',
      cellClass: 'whitespace-nowrap text-slate-700'
    },
    {
      key: 'mobileNumber',
      label: 'Mobile No.',
      cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700'
    },
    {
      key: 'roleType',
      label: 'Role Type',
      type: 'custom',
      cellClass: 'whitespace-nowrap'
    },
    {
      key: 'designation',
      label: 'Designation',
      cellClass: 'whitespace-nowrap text-slate-700'
    },
    {
      key: 'district',
      label: 'District',
      cellClass: 'whitespace-nowrap text-slate-700'
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

  openAddModal(): void {
    this.submitted.set(false);
    this.formData = {
      fullName: '',
      email: '',
      mobileNumber: '',
      roleType: '',
      designation: 'Joint Director',
      district: 'Jaipur'
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitUser(): void {
    this.submitted.set(true);
    if (!this.formData.fullName.trim() || !this.formData.email.trim() || !this.formData.mobileNumber.trim() || !this.formData.roleType.trim()) {
      return; // Required validation
    }

    const newItem: UserManagementItem = {
      sNo: 1,
      id: 'usr-' + Date.now(),
      fullName: this.formData.fullName.trim(),
      email: this.formData.email.trim(),
      mobileNumber: this.formData.mobileNumber.trim(),
      roleType: this.formData.roleType.trim(),
      designation: this.formData.designation,
      district: this.formData.district,
      status: 'Active'
    };

    this.users.update(current => {
      const updated = [newItem, ...current];
      return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
    });

    this.showModal.set(false);
  }

  deleteUser(item: UserManagementItem): void {
    if (confirm(`Are you sure you want to delete user "${item.fullName}"?`)) {
      this.users.update(current => {
        const updated = current.filter(u => u.id !== item.id);
        return updated.map((u, index) => ({ ...u, sNo: index + 1 }));
      });
    }
  }
}
