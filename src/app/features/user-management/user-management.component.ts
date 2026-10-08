import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataEngineService } from '../../core/services/data-engine.service';
import {
  PageHeaderComponent,
  TableComponent,
  ActionModalComponent,
  TableColumn
} from '../../shared';

export interface UserManagementItem {
  sNo: number;
  id: string;
  userId: string;
  username: string;
  ssoId: string;
  userType: 'Admin' | 'Super Admin' | 'TP';
  roleType: string;
  designation?: string;
  schemeDepartment?: string;
  districtName: string;
  blockName?: string;
  email?: string;
  mobileNo?: string;
  schemeStatus: 'Active' | 'Inactive';
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
                placeholder="Search by User ID, Username, SSO ID, Role, or District..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#174A6E] transition-all"
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
          schemeStatus: schemeStatusTemplate,
          action: actionTemplate
        }"
      >
      </app-table>

      <!-- Custom Template for Role Type -->
      <ng-template #roleTypeTemplate let-item>
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border"
          [ngClass]="{
            'bg-purple-50 text-purple-700 border-purple-200': item.roleType === 'tp' || item.userType === 'TP',
            'bg-sky-50 text-[#174A6E] border-sky-200': item.roleType !== 'tp' && item.userType !== 'TP'
          }"
        >
          {{ item.roleType }}
        </span>
      </ng-template>

      <!-- Custom Template for Scheme Status -->
      <ng-template #schemeStatusTemplate let-item>
        @if (item.schemeStatus === 'Active') {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none">
            Active
          </span>
        } @else if (item.userType === 'TP' || item.roleType === 'tp') {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
            Blacklisted
          </span>
        } @else {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
            Inactive
          </span>
        }
      </ng-template>

      <!-- Custom Template for Action Column (View, Edit, Mark Inactive/Blacklisted, Delete) -->
      <ng-template #actionTemplate let-item>
        <div class="flex items-center justify-center gap-2 whitespace-nowrap">
          <!-- View -->
          <button
            type="button"
            (click)="$event.stopPropagation(); openViewModal(item)"
            class="inline-flex items-center gap-1 text-[#174A6E] hover:text-[#0B3558] font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="View Details"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </button>

          <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

          <!-- Edit -->
          <button
            type="button"
            (click)="$event.stopPropagation(); requestEditUser(item)"
            class="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Edit User"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>

          <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

          <!-- Mark Inactive / Mark Blacklisted / Mark Active -->
          <button
            type="button"
            (click)="$event.stopPropagation(); requestToggleUserStatus(item)"
            class="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            [title]="(item.userType === 'TP' || item.roleType === 'tp') ? (item.schemeStatus === 'Active' ? 'Mark Blacklisted' : 'Mark Active') : (item.schemeStatus === 'Active' ? 'Mark Inactive' : 'Mark Active')"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span>{{ (item.userType === 'TP' || item.roleType === 'tp') ? (item.schemeStatus === 'Active' ? 'Mark Blacklisted' : 'Mark Active') : (item.schemeStatus === 'Active' ? 'Mark Inactive' : 'Mark Active') }}</span>
          </button>

          <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

          <!-- Delete -->
          <button
            type="button"
            (click)="$event.stopPropagation(); requestDeleteUser(item)"
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

      <!-- Modal: View User Details -->
      <app-action-modal
        [isOpen]="showViewModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="true"
        [showAccentBar]="false"
        secondaryLabel="Close"
        maxWidthClass="max-w-[580px]"
        (secondaryAction)="closeViewModal()"
        (close)="closeViewModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          User Details - {{ selectedViewUser()?.username }}
        </h2>
        @if (selectedViewUser(); as u) {
          <div class="mt-4 font-sans text-[13px] grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span class="text-slate-500 font-medium block text-xs">User ID</span>
              <span class="font-mono font-semibold text-slate-800">{{ u.userId }}</span>
            </div>
            <div>
              <span class="text-slate-500 font-medium block text-xs">Username</span>
              <span class="font-semibold text-slate-800">{{ u.username }}</span>
            </div>
            <div>
              <span class="text-slate-500 font-medium block text-xs">SSO ID</span>
              <span class="font-mono text-slate-800">{{ u.ssoId }}</span>
            </div>
            <div>
              <span class="text-slate-500 font-medium block text-xs">User Type</span>
              <span class="font-medium text-slate-800">{{ u.userType }}</span>
            </div>
            <div>
              <span class="text-slate-500 font-medium block text-xs">Role Type</span>
              <span class="font-semibold text-[#174A6E]">{{ u.roleType }}</span>
            </div>
            <div>
              <span class="text-slate-500 font-medium block text-xs">Designation</span>
              <span class="text-slate-800">{{ u.designation || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-slate-500 font-medium block text-xs">Scheme Department</span>
              <span class="text-slate-800">{{ u.schemeDepartment || 'RSLDC' }}</span>
            </div>
            <div>
              <span class="text-slate-500 font-medium block text-xs">District</span>
              <span class="text-slate-800">{{ u.districtName }}</span>
            </div>
            <div>
              <span class="text-slate-500 font-medium block text-xs">Block Name</span>
              <span class="text-slate-800">{{ u.blockName || 'All Blocks' }}</span>
            </div>
            <div>
              <span class="text-slate-500 font-medium block text-xs">Status</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                [ngClass]="u.schemeStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                {{ u.schemeStatus }}
              </span>
            </div>
          </div>
        }
      </app-action-modal>

      <!-- Modal: Add / Edit User -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        [primaryLabel]="editingId() ? 'Save Changes' : 'Submit'"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[780px]"
        (primaryAction)="submitUser()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          {{ editingId() ? 'Edit User' : 'Add New User' }}
        </h2>
        
        <div class="mt-4 font-sans text-[13px] space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            
            <!-- LEFT COLUMN -->
            <div class="space-y-3">
              <!-- User ID -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">User ID*</label>
                <input
                  type="text"
                  placeholder="e.g. USR-1008"
                  [(ngModel)]="formData.userId"
                  [ngClass]="{'border-red-500': submitted() && !formData.userId, 'border-[#8FA3B6]': !(submitted() && !formData.userId)}"
                  class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 font-mono text-xs"
                />
                @if (submitted() && !formData.userId) {
                  <div class="text-xs text-red-500 mt-0.5 font-medium">User ID is required</div>
                }
              </div>

              <!-- User Name -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">User Name*</label>
                <input
                  type="text"
                  placeholder="e.g. admin 3 or super admin 3"
                  [(ngModel)]="formData.username"
                  [ngClass]="{'border-red-500': submitted() && !formData.username, 'border-[#8FA3B6]': !(submitted() && !formData.username)}"
                  class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
                />
                @if (submitted() && !formData.username) {
                  <div class="text-xs text-red-500 mt-0.5 font-medium">User Name is required</div>
                }
              </div>

              <!-- Password -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Password*</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  [(ngModel)]="formData.password"
                  [ngClass]="{'border-red-500': submitted() && !formData.password, 'border-[#8FA3B6]': !(submitted() && !formData.password)}"
                  class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
                />
                @if (submitted() && !formData.password) {
                  <div class="text-xs text-red-500 mt-0.5 font-medium">Password is required</div>
                }
              </div>

              <!-- Date Of Birth -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Date Of Birth</label>
                <input
                  type="date"
                  [(ngModel)]="formData.dateOfBirth"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
                />
              </div>

              <!-- E-Mail -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">E-Mail*</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  [(ngModel)]="formData.email"
                  [ngClass]="{'border-red-500': submitted() && !formData.email, 'border-[#8FA3B6]': !(submitted() && !formData.email)}"
                  class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
                />
                @if (submitted() && !formData.email) {
                  <div class="text-xs text-red-500 mt-0.5 font-medium">E-Mail is required</div>
                }
              </div>

              <!-- Mobile No. -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Mobile No.*</label>
                <input
                  type="text"
                  maxlength="10"
                  placeholder="10-digit mobile number"
                  [(ngModel)]="formData.mobileNo"
                  [ngClass]="{'border-red-500': submitted() && !formData.mobileNo, 'border-[#8FA3B6]': !(submitted() && !formData.mobileNo)}"
                  class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
                />
                @if (submitted() && !formData.mobileNo) {
                  <div class="text-xs text-red-500 mt-0.5 font-medium">Mobile No. is required</div>
                }
              </div>

              <!-- Alternate Mobile No. -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Alternate Mobile No.</label>
                <input
                  type="text"
                  maxlength="10"
                  placeholder="Optional alternate mobile"
                  [(ngModel)]="formData.alternateMobileNo"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
                />
              </div>

              <!-- Alternate E-Mail -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Alternate E-Mail</label>
                <input
                  type="email"
                  placeholder="Optional alternate email"
                  [(ngModel)]="formData.alternateEmail"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
                />
              </div>
            </div>

            <!-- RIGHT COLUMN -->
            <div class="space-y-3">
              <!-- User Type -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">User Type*</label>
                <select
                  [(ngModel)]="formData.userType"
                  [ngClass]="{'border-red-500': submitted() && !formData.userType, 'border-[#8FA3B6]': !(submitted() && !formData.userType)}"
                  class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="TP">Training Partner (TP)</option>
                </select>
                <div class="text-[11px] text-slate-500 mt-0.5">Select user classification (Admin, Super Admin, or TP).</div>
              </div>

              <!-- Role Type -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Role Type*</label>
                <select
                  [(ngModel)]="formData.roleType"
                  [ngClass]="{'border-red-500': submitted() && !formData.roleType, 'border-[#8FA3B6]': !(submitted() && !formData.roleType)}"
                  class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
                >
                  <option value="" disabled selected>Select Role Type</option>
                  <option value="tp">tp</option>
                  <option value="scheme oc">scheme oc</option>
                  <option value="mis manager">mis manager</option>
                  <option value="programmer">programmer</option>
                  <option value="gm">gm</option>
                  <option value="zc">zc</option>
                  <option value="md">md</option>
                  <option value="super admin">super admin</option>
                </select>
                @if (submitted() && !formData.roleType) {
                  <div class="text-xs text-red-500 mt-0.5 font-medium">Role Type is required</div>
                }
              </div>

              <!-- Designation -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Designation</label>
                <select
                  [(ngModel)]="formData.designation"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800 bg-white"
                >
                  <option value="Managing Director">Managing Director</option>
                  <option value="Joint Director">Joint Director</option>
                  <option value="General Manager">General Manager</option>
                  <option value="Zone Coordinator">Zone Coordinator</option>
                  <option value="Programmer">Programmer</option>
                  <option value="MIS Manager">MIS Manager</option>
                  <option value="Scheme Nodal Officer">Scheme Nodal Officer</option>
                </select>
              </div>

              <!-- Scheme Department -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Scheme Department</label>
                <select
                  [(ngModel)]="formData.schemeDepartment"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800 bg-white"
                >
                  <option value="RSLDC">RSLDC</option>
                  <option value="Skill & Entrepreneurship">Skill & Entrepreneurship</option>
                  <option value="Planning Department">Planning Department</option>
                </select>
              </div>

              <!-- District -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">District</label>
                <select
                  [(ngModel)]="formData.district"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800 bg-white"
                >
                  <option value="All Districts">All Districts</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Jodhpur">Jodhpur</option>
                  <option value="Udaipur">Udaipur</option>
                  <option value="Ajmer">Ajmer</option>
                  <option value="Kota">Kota</option>
                </select>
              </div>

              <!-- Block Name -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Block Name</label>
                <select
                  [(ngModel)]="formData.blockName"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800 bg-white"
                >
                  <option value="All Blocks">All Blocks</option>
                  <option value="Amber">Amber</option>
                  <option value="Sanganer">Sanganer</option>
                  <option value="Mandore">Mandore</option>
                  <option value="Girwa">Girwa</option>
                </select>
              </div>

              <!-- Aadhaar Id -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Aadhaar Id</label>
                <input
                  type="text"
                  maxlength="12"
                  placeholder="12-digit Aadhaar number"
                  [(ngModel)]="formData.aadhaarId"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800 font-mono text-xs"
                />
              </div>

            </div>

          </div>
        </div>
      </app-action-modal>

      <!-- Centered Confirmation Modal (Edit / Status Change / Delete) -->
      <app-action-modal
        [isOpen]="showConfirmModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="true"
        [showAccentBar]="true"
        [accentBarClass]="confirmModalData()?.accentBarClass || 'bg-[#174A6E]'"
        [title]="confirmModalData()?.title || 'Confirmation'"
        [primaryLabel]="confirmModalData()?.confirmLabel || 'Confirm'"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[460px]"
        (primaryAction)="onConfirmAction()"
        (secondaryAction)="closeConfirmModal()"
        (close)="closeConfirmModal()"
      >
        <p class="text-sm text-slate-600 mt-2 mb-0 leading-relaxed font-sans">
          {{ confirmModalData()?.message }}
        </p>
      </app-action-modal>

    </div>
  `
})
export class UserManagementComponent {
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  showViewModal = signal<boolean>(false);
  showConfirmModal = signal<boolean>(false);
  confirmModalData = signal<{
    type: 'edit' | 'status' | 'delete';
    user: UserManagementItem;
    title: string;
    message: string;
    confirmLabel: string;
    accentBarClass?: string;
  } | null>(null);

  editingId = signal<string | null>(null);
  selectedViewUser = signal<UserManagementItem | null>(null);
  submitted = signal<boolean>(false);

  formData = {
    userId: '',
    username: '',
    password: '',
    dateOfBirth: '',
    email: '',
    mobileNo: '',
    alternateMobileNo: '',
    alternateEmail: '',
    userType: 'Admin' as 'Admin' | 'Super Admin' | 'TP',
    roleType: '',
    designation: 'Joint Director',
    schemeDepartment: 'RSLDC',
    district: 'Jaipur',
    blockName: 'All Blocks',
    aadhaarId: ''
  };

  private dataEngine = inject(DataEngineService);
  private userRepo = this.dataEngine.for<UserManagementItem>('USERS');

  users = signal<UserManagementItem[]>([]);

  constructor() {
    this.userRepo.getAll().subscribe(list => this.users.set(list));
  }

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.users();
    if (!q) return all;
    return all.filter(u =>
      u.userId.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.ssoId.toLowerCase().includes(q) ||
      u.roleType.toLowerCase().includes(q) ||
      u.districtName.toLowerCase().includes(q)
    );
  });

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
      cellClass: 'whitespace-nowrap font-semibold text-slate-800'
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
      width: 'min-w-[310px]'
    }
  ];

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.submitted.set(false);
    const nextIdNum = 1000 + this.users().length + 1;
    this.formData = {
      userId: `USR-${nextIdNum}`,
      username: '',
      password: '',
      dateOfBirth: '',
      email: '',
      mobileNo: '',
      alternateMobileNo: '',
      alternateEmail: '',
      userType: 'Admin',
      roleType: '',
      designation: 'Joint Director',
      schemeDepartment: 'RSLDC',
      district: 'Jaipur',
      blockName: 'All Blocks',
      aadhaarId: ''
    };
    this.showModal.set(true);
  }

  openEditModal(item: UserManagementItem): void {
    this.editingId.set(item.id);
    this.submitted.set(false);
    this.formData = {
      userId: item.userId,
      username: item.username,
      password: 'password123',
      dateOfBirth: '1990-01-01',
      email: item.email || `${item.username.replace(/\s+/g, '')}@isms.gov.in`,
      mobileNo: item.mobileNo || '9829012345',
      alternateMobileNo: '',
      alternateEmail: '',
      userType: item.userType,
      roleType: item.roleType,
      designation: item.designation || 'Joint Director',
      schemeDepartment: item.schemeDepartment || 'RSLDC',
      district: item.districtName,
      blockName: item.blockName || 'All Blocks',
      aadhaarId: ''
    };
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
    if (!this.formData.userId.trim() || !this.formData.username.trim() || !this.formData.password || !this.formData.email.trim() || !this.formData.mobileNo.trim() || !this.formData.roleType) {
      return; // Required validation
    }

    const editId = this.editingId();
    if (editId) {
      // Edit existing user
      const changes: Partial<UserManagementItem> = {
        userId: this.formData.userId.trim(),
        username: this.formData.username.trim(),
        ssoId: `SSO_${this.formData.username.trim().toUpperCase().replace(/\s+/g, '_')}`,
        userType: this.formData.userType,
        roleType: this.formData.roleType,
        designation: this.formData.designation,
        schemeDepartment: this.formData.schemeDepartment,
        districtName: this.formData.district,
        blockName: this.formData.blockName,
        email: this.formData.email.trim(),
        mobileNo: this.formData.mobileNo.trim()
      };
      this.userRepo.update(editId, changes).subscribe(res => {
        this.users.update(current =>
          current.map(u => u.id === editId ? { ...u, ...res } : u)
        );
      });
    } else {
      // Add new user
      const newItem: Partial<UserManagementItem> = {
        sNo: 1,
        id: 'usr-' + Date.now(),
        userId: this.formData.userId.trim(),
        username: this.formData.username.trim(),
        ssoId: `SSO_${this.formData.username.trim().toUpperCase().replace(/\s+/g, '_')}`,
        userType: this.formData.userType,
        roleType: this.formData.roleType,
        designation: this.formData.designation,
        schemeDepartment: this.formData.schemeDepartment,
        districtName: this.formData.district,
        blockName: this.formData.blockName,
        email: this.formData.email.trim(),
        mobileNo: this.formData.mobileNo.trim(),
        schemeStatus: 'Active'
      };

      this.userRepo.create(newItem).subscribe(created => {
        this.users.update(current => {
          const updated = [created, ...current];
          return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
        });
      });
    }

    this.showModal.set(false);
  }

  requestEditUser(item: UserManagementItem): void {
    this.confirmModalData.set({
      type: 'edit',
      user: item,
      title: 'Confirm Edit User',
      message: `Are you sure you want to edit details for user "${item.username}" (${item.userId})?`,
      confirmLabel: 'Proceed to Edit',
      accentBarClass: 'bg-[#174A6E]'
    });
    this.showConfirmModal.set(true);
  }

  requestToggleUserStatus(item: UserManagementItem): void {
    const isTp = item.userType === 'TP' || item.roleType === 'tp';
    const isCurrentlyActive = item.schemeStatus === 'Active';

    let actionLabel = '';
    let targetStatusLabel = '';

    if (isTp) {
      actionLabel = isCurrentlyActive ? 'Mark Blacklisted' : 'Mark Active';
      targetStatusLabel = isCurrentlyActive ? 'Blacklisted' : 'Active';
    } else {
      actionLabel = isCurrentlyActive ? 'Mark Inactive' : 'Mark Active';
      targetStatusLabel = isCurrentlyActive ? 'Inactive' : 'Active';
    }

    this.confirmModalData.set({
      type: 'status',
      user: item,
      title: `Confirm Action: ${actionLabel}`,
      message: `Are you sure you want to change the status of user "${item.username}" (${item.userId}) to ${targetStatusLabel}?`,
      confirmLabel: actionLabel,
      accentBarClass: isCurrentlyActive ? 'bg-amber-500' : 'bg-emerald-600'
    });
    this.showConfirmModal.set(true);
  }

  requestDeleteUser(item: UserManagementItem): void {
    this.confirmModalData.set({
      type: 'delete',
      user: item,
      title: 'Confirm Delete User',
      message: `Are you sure you want to permanently delete user "${item.username}" (${item.userId})? This action cannot be undone.`,
      confirmLabel: 'Delete User',
      accentBarClass: 'bg-rose-600'
    });
    this.showConfirmModal.set(true);
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
}
