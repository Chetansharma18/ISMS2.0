import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { EoiStateService, UserAccount } from '../../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass, AsyncPipe, HeaderComponent, SidebarComponent],
  template: `
    <div class="h-screen flex flex-col bg-[#F4F7F9] font-sans text-slate-800 antialiased overflow-hidden">
      <app-header class="shrink-0"></app-header>

      <div class="flex flex-1 min-h-0 overflow-hidden w-full">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block shrink-0 h-full"></app-sidebar>

        <!-- Main Super Admin Content Area -->
        <main class="flex-1 min-w-0 min-h-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto overflow-x-hidden">
          
          <!-- Top Breadcrumb & Title Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 mb-6">
            <div>
              <div class="text-[11px] font-mono text-[#131A4D] uppercase tracking-wider font-semibold">
                Super Admin Security & Access Control
              </div>
              <h1 class="text-2xl font-bold text-[#131A4D] tracking-tight">
                Manage Portal Users & Training Partner Accounts
              </h1>
              <p class="text-xs text-slate-500 mt-0.5">
                Central user directory, department scrutiny officer assignments & empaneled training partner records.
              </p>
            </div>

            <!-- Two Tab Switcher -->
            <div class="flex items-center bg-white border border-slate-300 p-1 shadow-2xs text-xs font-semibold">
              <button 
                (click)="activeTab = 'DEPT_USERS'"
                [class.bg-[#131A4D]]="activeTab === 'DEPT_USERS'"
                [class.text-white]="activeTab === 'DEPT_USERS'"
                class="px-4 py-1.5 transition-colors">
                Department Admins
              </button>
              <button 
                (click)="activeTab = 'TP_USERS'"
                [class.bg-[#131A4D]]="activeTab === 'TP_USERS'"
                [class.text-white]="activeTab === 'TP_USERS'"
                class="px-4 py-1.5 transition-colors">
                Training Partners Directory
              </button>
            </div>
          </div>

          <!-- TAB 1: DEPARTMENT USERS -->
          <div *ngIf="activeTab === 'DEPT_USERS'" class="bg-white border border-slate-300 shadow-sm overflow-hidden">
            <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>👥</span>
                <h2 class="text-xs font-bold uppercase tracking-wider">
                  Department Scrutiny Officers & System Admins
                </h2>
              </div>
              <button (click)="showAddUserModal = true" class="px-3 py-1 bg-[#131A4D] hover:bg-[#004d73] text-white text-xs font-bold rounded shadow-2xs">
                + Add Dept. Officer Account
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase tracking-wider text-[11px]">
                    <th class="p-3 border-r border-slate-200">Officer Name</th>
                    <th class="p-3 border-r border-slate-200">Rajasthan SSO ID</th>
                    <th class="p-3 border-r border-slate-200">Assigned Department</th>
                    <th class="p-3 border-r border-slate-200">Official Email</th>
                    <th class="p-3 border-r border-slate-200 text-center">Role</th>
                    <th class="p-3 border-r border-slate-200 text-center">Status</th>
                    <th class="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr *ngFor="let u of (userAccounts$ | async)" class="hover:bg-slate-50" [ngClass]="{'hidden': u.role === 'applicant'}">
                    <td class="p-3 font-bold text-slate-900 border-r border-slate-200">{{ u.fullName }}</td>
                    <td class="p-3 font-mono font-bold text-[#131A4D] border-r border-slate-200">{{ u.ssoId }}</td>
                    <td class="p-3 border-r border-slate-200 max-w-xs text-slate-700">{{ u.department || 'ISMS Headquarters' }}</td>
                    <td class="p-3 font-mono border-r border-slate-200 text-slate-600">{{ u.email }}</td>
                    <td class="p-3 text-center border-r border-slate-200">
                      <span class="px-2 py-0.5 bg-blue-50 text-[#131A4D] border border-blue-200 text-[10px] font-bold rounded uppercase">
                        {{ u.role }}
                      </span>
                    </td>
                    <td class="p-3 text-center border-r border-slate-200">
                      <span class="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded">
                        {{ u.status }}
                      </span>
                    </td>
                    <td class="p-3 text-center">
                      <button class="text-[#131A4D] hover:underline font-semibold text-xs">Manage</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 2: TRAINING PARTNERS / APPLICANTS DIRECTORY -->
          <div *ngIf="activeTab === 'TP_USERS'" class="bg-white border border-slate-300 shadow-sm overflow-hidden">
            <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>🏢</span>
                <h2 class="text-xs font-bold uppercase tracking-wider">
                  Registered Training Partners & Applicants
                </h2>
              </div>
              <span class="text-xs text-blue-200 font-mono">
                Real-time Applicant Master Index
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase tracking-wider text-[11px]">
                    <th class="p-3 border-r border-slate-200">Legal Entity / Firm Name</th>
                    <th class="p-3 border-r border-slate-200">Authorized Signatory</th>
                    <th class="p-3 border-r border-slate-200">Mapped SSO ID</th>
                    <th class="p-3 border-r border-slate-200">Official Email</th>
                    <th class="p-3 border-r border-slate-200 text-center">Empaneled Grade</th>
                    <th class="p-3 border-r border-slate-200 text-center">Status</th>
                    <th class="p-3 text-center">View Profile</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr *ngFor="let u of (userAccounts$ | async)" class="hover:bg-slate-50" [ngClass]="{'hidden': u.role !== 'applicant'}">
                    <td class="p-3 font-bold text-slate-900 border-r border-slate-200">{{ u.organizationName }}</td>
                    <td class="p-3 font-semibold text-slate-700 border-r border-slate-200">{{ u.fullName }}</td>
                    <td class="p-3 font-mono font-bold text-[#131A4D] border-r border-slate-200">{{ u.ssoId }}</td>
                    <td class="p-3 font-mono border-r border-slate-200 text-slate-600">{{ u.email }}</td>
                    <td class="p-3 text-center border-r border-slate-200">
                      <span *ngIf="u.tpGrade" class="px-2 py-0.5 bg-blue-100 text-[#131A4D] font-bold font-mono text-[10px] rounded border border-blue-300">
                        Grade {{ u.tpGrade }}
                      </span>
                      <span *ngIf="!u.tpGrade" class="text-slate-400 text-[10px]">
                        Applicant
                      </span>
                    </td>
                    <td class="p-3 text-center border-r border-slate-200">
                      <span class="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded">
                        Active
                      </span>
                    </td>
                    <td class="p-3 text-center">
                      <button (click)="openProfileModal(u)" class="px-2.5 py-1 bg-[#131A4D] text-white text-[11px] font-bold rounded hover:bg-[#004d73] transition-colors">
                        Profile ID 🪪
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Add User Modal -->
          <div *ngIf="showAddUserModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-slate-300 max-w-md w-full p-6 space-y-4 shadow-xl">
              <h3 class="text-sm font-bold text-[#131A4D]">Add Department Scrutiny Officer</h3>
              <form [formGroup]="userForm" (ngSubmit)="onAddUser()" class="space-y-3 text-xs">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Officer Full Name</label>
                  <input formControlName="fullName" placeholder="e.g. Dr. Rajesh Meena" class="w-full px-3 py-1.5 border border-slate-300" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Rajasthan SSO ID</label>
                  <input formControlName="ssoId" placeholder="e.g. rmeena_rsldc" class="w-full px-3 py-1.5 border border-slate-300 font-mono" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Official Government Email</label>
                  <input formControlName="email" type="email" placeholder="rmeena@rsldc.rajasthan.gov.in" class="w-full px-3 py-1.5 border border-slate-300 font-mono" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Department</label>
                  <select formControlName="department" class="w-full px-3 py-1.5 border border-slate-300 bg-white">
                    <option value="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)">RSLDC Scrutiny Cell</option>
                    <option value="Department of Skills, Employment & Entrepreneurship">DSEE Directorate</option>
                    <option value="DoIT&C / ISMS State Headquarters">DoIT&C IT Wing</option>
                  </select>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <button type="button" (click)="showAddUserModal = false" class="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold">Cancel</button>
                  <button type="submit" class="px-4 py-1.5 bg-[#131A4D] hover:bg-[#004d73] text-white text-xs font-bold">Create Account</button>
                </div>
              </form>
            </div>
          </div>

          <!-- View Profile ID Modal -->
          <div *ngIf="selectedProfileUser" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border-2 border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden">
              <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span>🪪</span>
                  <span class="text-xs font-bold uppercase tracking-wider">Official Training Partner Master Record</span>
                </div>
                <button (click)="selectedProfileUser = null" class="text-white text-base hover:text-amber-400">✕</button>
              </div>

              <div class="p-6 space-y-4 text-xs">
                <div class="border-b border-slate-200 pb-3">
                  <div class="text-[10px] text-slate-400 uppercase font-mono">Organization Legal Name</div>
                  <div class="text-base font-bold text-[#131A4D]">{{ selectedProfileUser.organizationName }}</div>
                  <div class="text-xs text-slate-600 mt-0.5">Authorized Signatory: <strong>{{ selectedProfileUser.fullName }}</strong></div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <span class="text-slate-400 block text-[11px]">Mapped SSO ID:</span>
                    <span class="font-mono font-bold text-slate-800">{{ selectedProfileUser.ssoId }} 🔒</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Empanelment Grade:</span>
                    <span class="font-bold text-[#131A4D]">{{ selectedProfileUser.tpGrade ? 'Grade ' + selectedProfileUser.tpGrade : 'Standard Applicant' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Official Email:</span>
                    <span class="font-mono text-slate-800">{{ selectedProfileUser.email }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Account Status:</span>
                    <span class="text-emerald-700 font-bold">✓ Verified Active</span>
                  </div>
                </div>
              </div>

              <div class="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
                <button (click)="selectedProfileUser = null" class="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold">Close</button>
              </div>
            </div>
          </div>

        </main>
      </div>

    </div>
  `
})
export class ManageUsersComponent implements OnInit {
  activeTab: 'DEPT_USERS' | 'TP_USERS' = 'DEPT_USERS';
  userAccounts$!: Observable<UserAccount[]>;
  showAddUserModal = false;
  selectedProfileUser: UserAccount | null = null;
  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eoiService: EoiStateService
  ) {}

  ngOnInit(): void {
    this.userAccounts$ = this.eoiService.userAccounts$;
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      ssoId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['Rajasthan Skill and Livelihoods Development Corporation (RSLDC)', Validators.required]
    });
  }

  onAddUser(): void {
    if (this.userForm.invalid) return;
    const val = this.userForm.value;
    this.eoiService.addUserAccount({
      fullName: val.fullName,
      ssoId: val.ssoId,
      email: val.email,
      role: 'dept_admin',
      department: val.department,
      status: 'Active',
      createdDate: '08 Sep 2026'
    });
    this.userForm.reset();
    this.showAddUserModal = false;
  }

  openProfileModal(user: UserAccount): void {
    this.selectedProfileUser = user;
  }
}
