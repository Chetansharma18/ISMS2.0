import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../../core/services/admin-user.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AdminUser } from '../../core/models/admin.models';

@Component({
  selector: 'admin-user-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    PageHeaderComponent, 
    StatusBadgeComponent, 
    ModalComponent
  ],
  template: `
    <div>
      <admin-page-header 
        title="Administrative User Management"
        subtitle="Manage government system operators, department scrutiny desks, SSO identity mapping, and role assignments"
        icon="manage_accounts"
        [breadcrumbs]="[{ label: 'User Management', url: '/admin/users' }, { label: 'User List' }]">
        <div header-actions class="flex items-center gap-2">
          <a 
            routerLink="/admin/users/create" 
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">person_add</span>
            + Create New User
          </a>
        </div>
      </admin-page-header>

      <!-- Search & Filters (Section 43) -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <!-- Search -->
          <div class="lg:col-span-2 relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search User ID, Username, or SSO ID..."
              class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
          </div>

          <!-- Role Filter -->
          <div>
            <select 
              [(ngModel)]="roleFilter" 
              class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="DEPARTMENT_USER">Department User</option>
              <option value="APPROVAL_COMMITTEE">Approval Committee</option>
            </select>
          </div>

          <!-- District Filter -->
          <div>
            <select 
              [(ngModel)]="districtFilter" 
              class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
              <option value="ALL">All Districts</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Jodhpur">Jodhpur</option>
              <option value="Udaipur">Udaipur</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select 
              [(ngModel)]="statusFilter" 
              class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
              <option value="ALL">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span class="font-semibold text-slate-700">Total: {{ filteredUsers().length }} Administrative Users</span>
          <button *ngIf="searchQuery || roleFilter !== 'ALL' || districtFilter !== 'ALL' || statusFilter !== 'ALL'" (click)="resetFilters()" class="text-blue-700 font-semibold hover:underline">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Users Table (Legacy Screenshot Mapping) -->
      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600 border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th class="px-3 py-3.5 text-center w-12">Sr. No.</th>
                <th class="px-4 py-3.5">User ID</th>
                <th class="px-4 py-3.5">Username & Full Name</th>
                <th class="px-4 py-3.5">SSO ID</th>
                <th class="px-4 py-3.5">Role Type</th>
                <th class="px-4 py-3.5">District</th>
                <th class="px-4 py-3.5">Assigned Schemes</th>
                <th class="px-4 py-3.5">Status</th>
                <th class="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let u of filteredUsers(); let i = index" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-3 py-3 text-center text-slate-400 font-medium">{{ i + 1 }}</td>
                
                <td class="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                  {{ u.userId }}
                </td>

                <td class="px-4 py-3 max-w-xs">
                  <div class="font-bold text-slate-900">{{ u.fullName }}</div>
                  <div class="text-[11px] text-slate-500">{{ u.username }} • {{ u.designation }}</div>
                </td>

                <!-- SSO ID (Rule 48) -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <div *ngIf="u.ssoId" class="inline-flex items-center gap-1 text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span class="material-symbols-outlined text-[14px] text-emerald-600">badge</span>
                    {{ u.ssoId }}
                  </div>
                  <span *ngIf="!u.ssoId" class="text-amber-600 italic text-[11px] font-medium">Unmapped</span>
                </td>

                <td class="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                  {{ u.userType }}
                </td>

                <td class="px-4 py-3 whitespace-nowrap text-slate-700">
                  {{ u.district || 'All State' }}
                </td>

                <td class="px-4 py-3 max-w-[150px] truncate text-slate-600">
                  <span *ngIf="u.schemes.length === 0" class="text-slate-400 italic">None</span>
                  <span *ngFor="let s of u.schemes; let sLast = last" class="inline-block mr-1">
                    {{ s.schemeName }}<span *ngIf="!sLast">,</span>
                  </span>
                </td>

                <td class="px-4 py-3 whitespace-nowrap">
                  <admin-status-badge [status]="u.active ? 'Active' : 'Inactive'"></admin-status-badge>
                </td>

                <!-- Actions: View, Edit, Map SSO, Unmap SSO, Toggle Status (Section 43) -->
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <!-- Edit User Setup -->
                    <a 
                      [routerLink]="['/admin/users/create']" 
                      [queryParams]="{ editId: u.id }"
                      class="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-md transition-colors" 
                      title="Edit User Configuration">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </a>

                    <!-- Toggle Status -->
                    <button 
                      (click)="toggleStatus(u)"
                      class="p-1.5 rounded-md transition-colors"
                      [ngClass]="u.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'"
                      [title]="u.active ? 'Deactivate User' : 'Activate User'">
                      <span class="material-symbols-outlined text-[18px]">
                        {{ u.active ? 'toggle_on' : 'toggle_off' }}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class UserListComponent implements OnInit {
  private userService = inject(AdminUserService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  users = signal<AdminUser[]>([]);
  searchQuery = '';
  roleFilter = 'ALL';
  districtFilter = 'ALL';
  statusFilter = 'ALL';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(list => this.users.set(list));
  }

  filteredUsers(): AdminUser[] {
    return this.users().filter(u => {
      const matchSearch = !this.searchQuery ||
        u.userId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (u.ssoId && u.ssoId.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        u.fullName.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchRole = this.roleFilter === 'ALL' || u.roles.some(r => r.role === this.roleFilter);
      const matchDistrict = this.districtFilter === 'ALL' || u.district === this.districtFilter;
      const matchStatus = this.statusFilter === 'ALL' || (this.statusFilter === 'active' ? u.active : !u.active);

      return matchSearch && matchRole && matchDistrict && matchStatus;
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.roleFilter = 'ALL';
    this.districtFilter = 'ALL';
    this.statusFilter = 'ALL';
  }

  toggleStatus(u: AdminUser): void {
    this.userService.toggleUserStatus(u.id).subscribe(res => {
      if (res) {
        this.toastService.info('User Status', `${u.fullName} is now ${res.active ? 'Active' : 'Inactive'}`);
        this.loadUsers();
      }
    });
  }
}
