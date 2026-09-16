import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminUserService } from '../../core/services/admin-user.service';
import { MasterService } from '../../core/services/master.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { 
  DepartmentMaster, DesignationMaster, StateMaster, DistrictMaster, 
  BlockMaster, UserTypeMaster, RoleMaster, SchemeMaster, UserRoleAssignment, UserSchemeAssignment 
} from '../../core/models/admin.models';

@Component({
  selector: 'admin-user-create',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    PageHeaderComponent, 
    StatusBadgeComponent
  ],
  template: `
    <div>
      <admin-page-header 
        [title]="isEditMode ? 'User Setup: ' + userId : 'New User Setup'"
        subtitle="Configure administrative officer credentials, state SSO mapping, multi-role privileges, and scheme authorizations"
        icon="person_add"
        [breadcrumbs]="[
          { label: 'User Management', url: '/admin/users' },
          { label: isEditMode ? 'Edit User' : 'Create User' }
        ]">
        <div header-actions>
          <a 
            routerLink="/admin/users" 
            class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            ← Back to Users
          </a>
        </div>
      </admin-page-header>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <!-- SECTION 1: USER INFORMATION (Section 44) -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-900">1. User Personal & Login Credentials</h3>
            <p class="text-xs text-slate-500">Official officer identity and contact communication channels</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">User ID *</label>
              <input type="text" formControlName="userId" placeholder="e.g. mahendra_soni_ras" class="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Username *</label>
              <input type="text" formControlName="username" placeholder="e.g. mahendra_soni" class="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input type="text" formControlName="fullName" placeholder="e.g. Shri Mahendra Soni, RAS" class="w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Password</label>
              <input type="password" formControlName="password" placeholder="••••••••••••" class="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Official Email *</label>
              <input type="email" formControlName="email" placeholder="officer@rajasthan.gov.in" class="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input type="tel" formControlName="mobile" placeholder="9876543210" class="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Date of Birth</label>
              <input type="date" formControlName="dob" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Aadhaar / Gov Identifier</label>
              <input type="text" formControlName="aadhaarMasked" placeholder="XXXXXXXX4512" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">SSO ID</label>
              <div class="flex gap-2">
                <input type="text" formControlName="ssoId" placeholder="e.g. sso_user_id" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
                <button type="button" (click)="fetchSsoDetails()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-2xs whitespace-nowrap">
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: ADMINISTRATIVE INFORMATION (Section 44) -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-900">2. Administrative Designation & Jurisdiction</h3>
            <p class="text-xs text-slate-500">Government posting department and territorial jurisdictional delegation</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">User Type *</label>
              <select formControlName="userType" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                <option *ngFor="let ut of userTypes()" [value]="ut.userTypeName">{{ ut.userTypeName }}</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Designation *</label>
              <select formControlName="designation" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                <option *ngFor="let des of designations()" [value]="des.designationName">{{ des.designationName }}</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Scheme Department *</label>
              <select formControlName="department" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                <option *ngFor="let d of departments()" [value]="d.departmentName">{{ d.departmentName }}</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">District Jurisdiction</label>
              <select formControlName="district" (change)="onDistrictChange()" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white">
                <option value="">All Districts (State Level)</option>
                <option *ngFor="let dist of districts()" [value]="dist.districtName">{{ dist.districtName }}</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Block / Sub-Division</label>
              <select formControlName="block" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white">
                <option value="">All Blocks</option>
                <option *ngFor="let blk of blocks()" [value]="blk.blockName">{{ blk.blockName }}</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Account Active</label>
              <div class="pt-2">
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" formControlName="active" class="rounded text-blue-600" />
                  <span class="font-bold text-slate-800">Active User Access</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: TABS FOR ROLES, ACCESS LEVEL & SCHEMES (Sections 45, 46, 47) -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div class="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
            <button 
              type="button"
              (click)="subTab.set('roles')"
              class="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              [ngClass]="subTab() === 'roles' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'">
              Roles Assignment (Section 45)
            </button>
            <button 
              type="button"
              (click)="subTab.set('access')"
              class="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              [ngClass]="subTab() === 'access' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'">
              Access Level Permissions (Section 46)
            </button>
            <button 
              type="button"
              (click)="subTab.set('schemes')"
              class="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              [ngClass]="subTab() === 'schemes' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'">
              User Scheme Assignment (Section 47)
            </button>
          </div>

          <div class="p-6">
            
            <!-- SUBTAB: ROLES (Section 45) -->
            <div *ngIf="subTab() === 'roles'" class="space-y-4 text-xs">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <span class="font-bold text-slate-800 uppercase tracking-wider">Assigned Security Roles</span>
                <button type="button" (click)="addRoleRow()" class="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold">
                  + Add Role
                </button>
              </div>

              <table class="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead class="bg-slate-50 text-[10px] uppercase font-bold text-slate-700">
                  <tr>
                    <th class="p-2.5 text-left">Role</th>
                    <th class="p-2.5 text-left">Start Date</th>
                    <th class="p-2.5 text-left">End Date</th>
                    <th class="p-2.5 text-center">Status</th>
                    <th class="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let r of rolesList(); let rIdx = index">
                    <td class="p-2.5 font-bold text-slate-900">{{ r.role }}</td>
                    <td class="p-2.5 text-slate-600">{{ r.startDate }}</td>
                    <td class="p-2.5 text-slate-600">{{ r.endDate }}</td>
                    <td class="p-2.5 text-center">
                      <admin-status-badge [status]="r.status"></admin-status-badge>
                    </td>
                    <td class="p-2.5 text-right">
                      <button type="button" (click)="removeRoleRow(rIdx)" class="text-rose-600 hover:text-rose-800 p-1">
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- SUBTAB: ACCESS LEVEL MATRIX (Section 46) -->
            <div *ngIf="subTab() === 'access'" class="space-y-4 text-xs">
              <div class="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-blue-900">
                Granular privilege override matrix for this user. Inherited from assigned Role Master Profile.
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-700">
                    <tr>
                      <th class="p-2.5">Module</th>
                      <th class="p-2.5 text-center">View</th>
                      <th class="p-2.5 text-center">Create</th>
                      <th class="p-2.5 text-center">Edit</th>
                      <th class="p-2.5 text-center">Update</th>
                      <th class="p-2.5 text-center">Delete</th>
                      <th class="p-2.5 text-center">Publish</th>
                      <th class="p-2.5 text-center">Approve</th>
                      <th class="p-2.5 text-center">Export</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr *ngFor="let m of modulesList" class="hover:bg-slate-50">
                      <td class="p-2.5 font-bold text-slate-900">{{ m }}</td>
                      <td class="p-2.5 text-center"><input type="checkbox" checked class="rounded text-blue-600" /></td>
                      <td class="p-2.5 text-center"><input type="checkbox" checked class="rounded text-blue-600" /></td>
                      <td class="p-2.5 text-center"><input type="checkbox" checked class="rounded text-blue-600" /></td>
                      <td class="p-2.5 text-center"><input type="checkbox" checked class="rounded text-blue-600" /></td>
                      <td class="p-2.5 text-center"><input type="checkbox" class="rounded text-blue-600" /></td>
                      <td class="p-2.5 text-center"><input type="checkbox" checked class="rounded text-blue-600" /></td>
                      <td class="p-2.5 text-center"><input type="checkbox" checked class="rounded text-blue-600" /></td>
                      <td class="p-2.5 text-center"><input type="checkbox" checked class="rounded text-blue-600" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- SUBTAB: SCHEMES ASSIGNMENT (Section 47) -->
            <div *ngIf="subTab() === 'schemes'" class="space-y-4 text-xs">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <span class="font-bold text-slate-800 uppercase tracking-wider">Authorized Scheme Portfolio</span>
                <button type="button" (click)="addSchemeRow()" class="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold">
                  + Add Scheme
                </button>
              </div>

              <table class="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead class="bg-slate-50 text-[10px] uppercase font-bold text-slate-700">
                  <tr>
                    <th class="p-2.5 text-left">Scheme</th>
                    <th class="p-2.5 text-left">Start Date</th>
                    <th class="p-2.5 text-left">End Date</th>
                    <th class="p-2.5 text-center">Status</th>
                    <th class="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let s of schemesList(); let sIdx = index">
                    <td class="p-2.5 font-bold text-slate-900">{{ s.schemeName }}</td>
                    <td class="p-2.5 text-slate-600">{{ s.startDate }}</td>
                    <td class="p-2.5 text-slate-600">{{ s.endDate }}</td>
                    <td class="p-2.5 text-center">
                      <admin-status-badge [status]="s.status"></admin-status-badge>
                    </td>
                    <td class="p-2.5 text-right">
                      <button type="button" (click)="removeSchemeRow(sIdx)" class="text-rose-600 hover:text-rose-800 p-1">
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

        <!-- FORM ACTION BUTTONS -->
        <div class="flex items-center justify-end gap-3 pt-4">
          <a 
            routerLink="/admin/users" 
            class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </a>
          <button 
            type="submit" 
            class="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer">
            Save User Account
          </button>
        </div>

      </form>
    </div>
  `
})
export class UserCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(AdminUserService);
  private masterService = inject(MasterService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  userId = '';

  userForm!: FormGroup;
  subTab = signal<'roles' | 'access' | 'schemes'>('roles');

  userTypes = signal<UserTypeMaster[]>([]);
  designations = signal<DesignationMaster[]>([]);
  departments = signal<DepartmentMaster[]>([]);
  districts = signal<DistrictMaster[]>([]);
  blocks = signal<BlockMaster[]>([]);
  schemes = signal<SchemeMaster[]>([]);

  rolesList = signal<UserRoleAssignment[]>([
    { id: 'UR-1', role: 'DEPARTMENT_USER', startDate: '2024-01-01', endDate: '2026-12-31', status: 'Active' }
  ]);

  schemesList = signal<UserSchemeAssignment[]>([
    { id: 'US-1', schemeId: 'SCH-001', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', startDate: '2024-01-01', endDate: '2026-12-31', status: 'Active' }
  ]);

  modulesList = [
    'Dashboard', 'Masters', 'Schemes', 'EOI', 'EOI Form Builder', 
    'Documents', 'Transactions', 'Fees', 'Committees', 'Users', 
    'Applications', 'Reports', 'Audit Logs', 'Settings'
  ];

  ngOnInit(): void {
    this.masterService.getUserTypes().subscribe(ut => this.userTypes.set(ut));
    this.masterService.getDesignations().subscribe(d => this.designations.set(d));
    this.masterService.getDepartments().subscribe(dept => this.departments.set(dept));
    this.masterService.getDistricts('08').subscribe(dist => this.districts.set(dist));
    this.masterService.getSchemes().subscribe(sc => this.schemes.set(sc));

    this.initForm();

    const editId = this.route.snapshot.queryParamMap.get('editId');
    if (editId) {
      this.isEditMode = true;
      this.loadUser(editId);
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      userId: ['usr_' + Math.floor(1000 + Math.random() * 9000), Validators.required],
      username: ['', Validators.required],
      ssoId: [''],
      fullName: ['', Validators.required],
      password: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      dob: [''],
      aadhaarMasked: [''],
      userType: ['Department User', Validators.required],
      designation: ['Joint Director (Technical Evaluations)', Validators.required],
      department: ['Skill, Employment & Entrepreneurship Department', Validators.required],
      district: ['Jaipur'],
      block: ['Sanganer'],
      active: [true]
    });
  }

  loadUser(id: string): void {
    this.userService.getUserById(id).subscribe(u => {
      if (u) {
        this.userId = u.userId;
        this.userForm.patchValue({
          userId: u.userId,
          username: u.username,
          ssoId: u.ssoId || '',
          fullName: u.fullName,
          email: u.email,
          mobile: u.mobile,
          userType: u.userType,
          designation: u.designation,
          department: u.department,
          district: u.district,
          block: u.block,
          active: u.active
        });
        if (u.roles?.length) this.rolesList.set(u.roles);
        if (u.schemes?.length) this.schemesList.set(u.schemes);
      }
    });
  }

  fetchSsoDetails(): void {
    const sso = this.userForm.get('ssoId')?.value;
    if (!sso) {
      this.toastService.error('SSO ID Required', 'Please enter an SSO ID to fetch details.');
      return;
    }
    
    this.toastService.info('Fetching SSO Data', 'Retrieving user details from State SSO API...');
    
    setTimeout(() => {
      // Mock formatting of name from SSO ID (e.g. john_doe -> John Doe)
      const mockName = sso.split(/[\._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      this.userForm.patchValue({
        fullName: mockName || 'User SSO Fetch',
        email: `${sso}@rajasthan.gov.in`,
        mobile: '9' + Math.floor(100000000 + Math.random() * 900000000).toString(),
        username: sso
      });
      this.toastService.success('SSO Details Fetched', 'User details successfully auto-filled.');
    }, 600);
  }

  onDistrictChange(): void {
    const dist = this.userForm.get('district')?.value;
    const found = this.districts().find(d => d.districtName === dist);
    if (found) {
      this.masterService.getBlocks(found.districtCode).subscribe(b => this.blocks.set(b));
    }
  }

  addRoleRow(): void {
    this.rolesList.update(list => [
      ...list,
      { id: `UR-${Date.now()}`, role: 'APPROVAL_COMMITTEE', startDate: '2024-01-01', endDate: '2026-12-31', status: 'Active' }
    ]);
  }

  removeRoleRow(idx: number): void {
    this.rolesList.update(list => list.filter((_, i) => i !== idx));
  }

  addSchemeRow(): void {
    this.schemesList.update(list => [
      ...list,
      { id: `US-${Date.now()}`, schemeId: 'SCH-002', schemeName: 'PMKVY (State Component)', startDate: '2024-01-01', endDate: '2026-12-31', status: 'Active' }
    ]);
  }

  removeSchemeRow(idx: number): void {
    this.schemesList.update(list => list.filter((_, i) => i !== idx));
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.toastService.error('Validation Error', 'Please complete required user information.');
      return;
    }

    const formVal = this.userForm.value;
    // Map SSO ID from form input, or fallback to email prefix
    const derivedSsoId = formVal.ssoId || (formVal.email ? formVal.email.split('@')[0] : '');

    const payload = {
      ...formVal,
      ssoId: derivedSsoId,
      roles: this.rolesList(),
      schemes: this.schemesList()
    };

    this.userService.saveUser(payload).subscribe(res => {
      this.toastService.success('User Setup Saved', `${res.fullName} account configured successfully.`);
      this.router.navigate(['/admin/users']);
    });
  }
}
