import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommitteeService } from '../../core/services/committee.service';
import { MasterService } from '../../core/services/master.service';
import { AdminUserService } from '../../core/services/admin-user.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Committee, CommitteeMember, DepartmentMaster, AdminUser } from '../../core/models/admin.models';

@Component({
  selector: 'admin-committee-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ReactiveFormsModule, 
    PageHeaderComponent, 
    StatusBadgeComponent, 
    ModalComponent
  ],
  template: `
    <div>
      <admin-page-header 
        title="Committee Management"
        subtitle="Empanel and configure Technical Scrutiny & Approval Committees responsible for proposal evaluation across government schemes"
        icon="groups"
        [breadcrumbs]="[{ label: 'Committee Management', url: '/admin/committees' }, { label: 'Committee List' }]">
        <div header-actions>
          <button 
            (click)="openCreateModal()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            + Create New Committee
          </button>
        </div>
      </admin-page-header>

      <!-- Committees Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div *ngFor="let c of committees()" class="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 hover:border-blue-300 transition-all">
          <div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span class="text-[10px] font-mono font-bold text-blue-900 uppercase block">{{ c.committeeCode }}</span>
              <h3 class="text-sm font-bold text-slate-900 mt-0.5">{{ c.committeeName }}</h3>
              <p class="text-[11px] text-slate-500 mt-0.5">{{ c.department }}</p>
            </div>
            <admin-status-badge [status]="c.status"></admin-status-badge>
          </div>

          <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">{{ c.description }}</p>

          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Chairperson</span>
              <span class="font-bold text-slate-800 truncate block">{{ c.chairpersonName }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Validity Period</span>
              <span class="font-semibold text-slate-700">{{ c.startDate }} to {{ c.endDate }}</span>
            </div>
          </div>

          <!-- Members Snapshot Table (Section 32) -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Committee Members ({{ c.members.length }})
              </span>
              <button 
                (click)="manageMembers(c)"
                class="text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer">
                + Manage / Add Member
              </button>
            </div>

            <div class="space-y-1.5 max-h-36 overflow-y-auto">
              <div *ngFor="let m of c.members" class="p-2 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span class="font-semibold text-slate-800">{{ m.name }}</span>
                  <span class="text-[10px] text-slate-500 block">{{ m.designation }}</span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                  [ngClass]="m.role === 'Chairperson' ? 'bg-amber-100 text-amber-900' : 'bg-blue-50 text-blue-800'">
                  {{ m.role }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">Assigned to {{ c.assignedEoiCount }} EOIs</span>
            <div class="flex items-center gap-2">
              <button (click)="editCommittee(c)" class="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50">
                Edit
              </button>
              <button (click)="toggleStatus(c)" class="px-3 py-1 rounded text-xs font-semibold"
                [ngClass]="c.status === 'Active' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
                {{ c.status === 'Active' ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 3-STEP WIZARD MODAL ===== -->
      <admin-modal
        [isOpen]="isModalOpen()"
        [title]="editingId ? 'Edit Committee' : 'Create Evaluation Committee'"
        icon="groups"
        maxWidth="2xl"
        (close)="closeCreateModal()">

        <div modal-body>

          <!-- Step Progress Bar -->
          <div class="flex items-center gap-0 mb-6 select-none">
            <div *ngFor="let step of wizardSteps; let i = index" class="flex items-center flex-1">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                  [ngClass]="wizardStep() > i + 1 ? 'bg-emerald-500 text-white' :
                             wizardStep() === i + 1 ? 'bg-blue-700 text-white shadow-md shadow-blue-200' :
                             'bg-slate-200 text-slate-500'">
                  <span *ngIf="wizardStep() > i + 1" class="material-symbols-outlined text-[14px]">check</span>
                  <span *ngIf="wizardStep() <= i + 1">{{ i + 1 }}</span>
                </div>
                <span class="text-[11px] font-semibold hidden sm:block"
                  [ngClass]="wizardStep() === i + 1 ? 'text-blue-700' : wizardStep() > i + 1 ? 'text-emerald-600' : 'text-slate-400'">
                  {{ step }}
                </span>
              </div>
              <div *ngIf="i < wizardSteps.length - 1"
                class="flex-1 h-0.5 mx-3 rounded-full transition-all"
                [ngClass]="wizardStep() > i + 1 ? 'bg-emerald-400' : 'bg-slate-200'"></div>
            </div>
          </div>

          <!-- SLIDE 1: Committee Details -->
          <div *ngIf="wizardStep() === 1" class="space-y-3 text-xs animate-in fade-in slide-in-from-right-4 duration-200">
            <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-700 flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-[16px]">info</span>
              Enter the basic identification details and validity period for this evaluation committee.
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Committee Name *</label>
              <input type="text" [formControl]="$any(commForm.controls['committeeName'])" placeholder="e.g. State Skill Evaluation Committee (SSEC-01)"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
              <p *ngIf="commForm.controls['committeeName'].invalid && commForm.controls['committeeName'].touched"
                class="text-rose-500 text-[10px] mt-0.5">Committee name is required</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Committee Code *</label>
                <input type="text" [formControl]="$any(commForm.controls['committeeCode'])" placeholder="e.g. SSEC_MMKVY_2025"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Department *</label>
                <select [formControl]="$any(commForm.controls['department'])" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white">
                  <option *ngFor="let d of departments()" [value]="d.departmentName">{{ d.departmentName }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Chairperson *</label>
              <select [formControl]="$any(commForm.controls['chairpersonName'])" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                <option value="">-- Select Chairperson --</option>
                <option *ngFor="let u of eligibleUsers()" [value]="u.fullName">
                  {{ u.fullName }} — {{ u.designation }} · {{ u.department }}
                </option>
              </select>
              <p class="text-[10px] text-slate-500 mt-0.5">Select from registered department / committee users</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Description / Mandate</label>
              <textarea rows="2" [formControl]="$any(commForm.controls['description'])" placeholder="Mandate and scope of technical scrutiny..."
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Validity Start Date *</label>
                <input type="date" [formControl]="$any(commForm.controls['startDate'])" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Validity End Date *</label>
                <input type="date" [formControl]="$any(commForm.controls['endDate'])" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
              </div>
            </div>
          </div>

          <!-- SLIDE 2: Add Members -->
          <div *ngIf="wizardStep() === 2" class="space-y-4 text-xs animate-in fade-in slide-in-from-right-4 duration-200">
            <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-700 flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">group_add</span>
              Add technical experts and department officials to the evaluation panel.
            </div>

            <!-- User Picker -->
            <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <span class="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">+ Add Member to Panel</span>
              <div>
                <label class="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select Department / Committee User *</label>
                <select [(ngModel)]="selectedUserId" (ngModelChange)="onUserSelect()"
                  class="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                  <option value="">-- Search & Select a User --</option>
                  <optgroup label="Department Users">
                    <option *ngFor="let u of usersByType('Department User')" [value]="u.id">
                      {{ u.fullName }} · {{ u.designation }} ({{ u.department }})
                    </option>
                  </optgroup>
                  <optgroup label="Approval Committee Members">
                    <option *ngFor="let u of usersByType('Approval Committee')" [value]="u.id">
                      {{ u.fullName }} · {{ u.designation }}
                    </option>
                  </optgroup>
                  <optgroup label="Third Party / Expert Users">
                    <option *ngFor="let u of usersByType('Third Party User')" [value]="u.id">
                      {{ u.fullName }} · {{ u.designation }} ({{ u.department }})
                    </option>
                  </optgroup>
                </select>
              </div>
              <div *ngIf="selectedUserId" class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="sm:col-span-2 p-2.5 bg-white rounded-lg border border-blue-200 text-xs flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-500 text-[18px]">person</span>
                  <div class="min-w-0">
                    <span class="font-bold text-slate-800 block">{{ newMemName }}</span>
                    <span class="text-slate-500 text-[11px] block truncate">{{ newMemDesignation }} · {{ newMemDept }}</span>
                  </div>
                </div>
                <select [(ngModel)]="newMemRole" class="px-2 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold">
                  <option value="Chairperson">Chairperson</option>
                  <option value="Member">Member</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Secretary">Secretary</option>
                </select>
              </div>
              <button (click)="addMemberToWizard()" [disabled]="!selectedUserId"
                class="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
                <span class="material-symbols-outlined text-[16px]">person_add</span>
                Add to Committee Panel
              </button>
            </div>

            <!-- Members added in wizard -->
            <div *ngIf="wizardMembers.length > 0">
              <h4 class="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Added Members ({{ wizardMembers.length }})</h4>
              <div class="space-y-1.5 max-h-52 overflow-y-auto">
                <div *ngFor="let m of wizardMembers; let mi = index"
                  class="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span class="font-bold text-slate-800 block">{{ m.name }}</span>
                    <span class="text-[11px] text-slate-500">{{ m.designation }} · {{ m.department }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                      [ngClass]="{
                        'bg-amber-100 text-amber-900': m.role === 'Chairperson',
                        'bg-blue-50 text-blue-800': m.role === 'Member',
                        'bg-sky-50 text-sky-800': m.role === 'Reviewer',
                        'bg-teal-50 text-teal-800': m.role === 'Secretary'
                      }">{{ m.role }}</span>
                    <button (click)="wizardMembers.splice(mi, 1)" class="text-rose-500 hover:text-rose-700 p-0.5">
                      <span class="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="wizardMembers.length === 0"
              class="text-center py-6 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              <span class="material-symbols-outlined text-[28px] text-slate-300 block mb-1">group_off</span>
              No members added yet. You can also add members after creation.
            </div>
          </div>

          <!-- SLIDE 3: Review & Confirm -->
          <div *ngIf="wizardStep() === 3" class="space-y-4 text-xs animate-in fade-in slide-in-from-right-4 duration-200">
            <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] text-emerald-700 flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">task_alt</span>
              Review the committee details before saving. You can go back to make changes.
            </div>

            <!-- Details Summary -->
            <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 class="text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-2">Committee Details</h4>
              <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Committee Name</span>
                  <span class="font-semibold text-slate-800">{{ commForm.value.committeeName || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Code</span>
                  <span class="font-mono font-bold text-blue-800">{{ commForm.value.committeeCode || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                  <span class="font-semibold text-slate-700">{{ commForm.value.department || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Chairperson</span>
                  <span class="font-semibold text-slate-700">{{ commForm.value.chairpersonName || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Valid From</span>
                  <span class="font-semibold text-slate-700">{{ commForm.value.startDate }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Valid Until</span>
                  <span class="font-semibold text-slate-700">{{ commForm.value.endDate }}</span>
                </div>
                <div class="col-span-2">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Description</span>
                  <span class="text-slate-600">{{ commForm.value.description || 'No description provided' }}</span>
                </div>
              </div>
            </div>

            <!-- Members Summary -->
            <div class="bg-white border border-slate-200 rounded-xl p-4">
              <h4 class="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">Committee Members ({{ wizardMembers.length }})</h4>
              <div *ngIf="wizardMembers.length > 0" class="space-y-1.5">
                <div *ngFor="let m of wizardMembers"
                  class="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <span class="font-semibold text-slate-800">{{ m.name }}</span>
                    <span class="text-[11px] text-slate-500 block">{{ m.designation }}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                    [ngClass]="{
                      'bg-amber-100 text-amber-900': m.role === 'Chairperson',
                      'bg-blue-50 text-blue-800': m.role === 'Member',
                      'bg-sky-50 text-sky-800': m.role === 'Reviewer',
                      'bg-teal-50 text-teal-800': m.role === 'Secretary'
                    }">{{ m.role }}</span>
                </div>
              </div>
              <div *ngIf="wizardMembers.length === 0" class="text-slate-400 text-center py-3">
                No members — can be added after creation.
              </div>
            </div>
          </div>

        </div>

        <!-- Footer Navigation -->
        <div modal-footer class="flex items-center justify-between gap-3">
          <button (click)="closeCreateModal()" class="px-3.5 py-1.5 border border-slate-300 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <div class="flex items-center gap-2">
            <button *ngIf="wizardStep() > 1" (click)="wizardPrev()"
              class="px-4 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-[15px]">arrow_back</span> Back
            </button>
            <button *ngIf="wizardStep() < 3" (click)="wizardNext()"
              class="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer">
              Next <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
            <button *ngIf="wizardStep() === 3" (click)="saveCommitteeModal()"
              class="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">save</span>
              {{ editingId ? 'Save Changes' : 'Create Committee' }}
            </button>
          </div>
        </div>
      </admin-modal>

      <!-- Manage Members Modal (for existing committees — post-creation) -->
      <admin-modal
        [isOpen]="isMembersModalOpen()"
        [title]="'Manage Members: ' + (activeComm()?.committeeName || '')"
        icon="person_add"
        maxWidth="2xl"
        (close)="isMembersModalOpen.set(false)">
        <div modal-body class="space-y-4 text-xs">
          <!-- Add Member Sub-Form -->
          <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <span class="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">+ Add Member to Panel</span>
            <div>
              <label class="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select Admin / Department User *</label>
              <select [(ngModel)]="selectedUserId" (ngModelChange)="onUserSelect()"
                class="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                <option value="">-- Search & Select a User --</option>
                <optgroup label="Department Users">
                  <option *ngFor="let u of usersByType('Department User')" [value]="u.id">
                    {{ u.fullName }} · {{ u.designation }} ({{ u.department }})
                  </option>
                </optgroup>
                <optgroup label="Approval Committee Members">
                  <option *ngFor="let u of usersByType('Approval Committee')" [value]="u.id">
                    {{ u.fullName }} · {{ u.designation }}
                  </option>
                </optgroup>
                <optgroup label="Third Party / Expert Users">
                  <option *ngFor="let u of usersByType('Third Party User')" [value]="u.id">
                    {{ u.fullName }} · {{ u.designation }} ({{ u.department }})
                  </option>
                </optgroup>
              </select>
            </div>
            <div *ngIf="selectedUserId" class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div class="sm:col-span-2 p-2.5 bg-white rounded-lg border border-blue-200 text-xs flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-500 text-[18px]">person</span>
                <div class="min-w-0">
                  <span class="font-bold text-slate-800 block">{{ newMemName }}</span>
                  <span class="text-slate-500 text-[11px] block truncate">{{ newMemDesignation }} · {{ newMemDept }}</span>
                </div>
              </div>
              <select [(ngModel)]="newMemRole" class="px-2 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold">
                <option value="Chairperson">Chairperson</option>
                <option value="Member">Member</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Secretary">Secretary</option>
              </select>
            </div>
            <button (click)="addMemberToActiveComm()" [disabled]="!selectedUserId"
              class="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">person_add</span>
              Add to Committee Panel
            </button>
          </div>
          <!-- Existing Members Table -->
          <table class="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead class="bg-slate-50 text-[10px] uppercase font-bold text-slate-700">
              <tr>
                <th class="p-2.5 text-left">Member Name</th>
                <th class="p-2.5 text-left">Designation</th>
                <th class="p-2.5 text-left">Role</th>
                <th class="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let m of activeComm()?.members; let memIdx = index">
                <td class="p-2.5 font-bold text-slate-800">{{ m.name }}</td>
                <td class="p-2.5 text-slate-600">{{ m.designation }}</td>
                <td class="p-2.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                    [ngClass]="m.role === 'Chairperson' ? 'bg-amber-100 text-amber-900' : 'bg-blue-50 text-blue-800'">
                    {{ m.role }}
                  </span>
                </td>
                <td class="p-2.5 text-right">
                  <button (click)="removeMember(memIdx)" class="text-rose-600 hover:text-rose-800 p-1">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div modal-footer>
          <button (click)="isMembersModalOpen.set(false)" class="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900">
            Done
          </button>
        </div>
      </admin-modal>
    </div>
  `
})
export class CommitteeListComponent implements OnInit {
  private committeeService = inject(CommitteeService);
  private masterService = inject(MasterService);
  private adminUserService = inject(AdminUserService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  committees = signal<Committee[]>([]);
  departments = signal<DepartmentMaster[]>([]);
  adminUsers = signal<AdminUser[]>([]);

  isModalOpen = signal<boolean>(false);
  isMembersModalOpen = signal<boolean>(false);
  editingId: string | null = null;
  activeComm = signal<Committee | null>(null);

  commForm!: FormGroup;

  // Wizard state
  wizardStep = signal<number>(1);
  readonly wizardSteps = ['Committee Details', 'Add Members', 'Review & Confirm'];
  wizardMembers: CommitteeMember[] = [];

  // New member inputs — now populated from user dropdown
  selectedUserId = '';
  newMemName = '';
  newMemDesignation = '';
  newMemDept = '';
  newMemRole: 'Chairperson' | 'Member' | 'Reviewer' | 'Secretary' = 'Member';

  /** All eligible users — excludes Super Admin */
  eligibleUsers(): AdminUser[] {
    return this.adminUsers().filter(u => u.userType !== 'Super Admin' && u.active);
  }

  /** Filter eligible users by type for optgroup display — excludes Super Admin */
  usersByType(type: string): AdminUser[] {
    return this.adminUsers().filter(u => u.userType === type && u.userType !== 'Super Admin' && u.active);
  }

  ngOnInit(): void {
    this.committeeService.getCommittees().subscribe(list => this.committees.set(list));
    this.masterService.getDepartments().subscribe(d => this.departments.set(d));
    this.adminUserService.getUsers().subscribe(users => this.adminUsers.set(users));

    // Auto-open create modal when navigated to /committees/create
    const url = this.router.url;
    if (url.endsWith('/create')) {
      setTimeout(() => this.openCreateModal(), 0);
    }

    this.commForm = this.fb.group({
      committeeName: ['', Validators.required],
      committeeCode: ['', Validators.required],
      department: ['Skill, Employment & Entrepreneurship', Validators.required],
      chairpersonName: ['', Validators.required],
      description: [''],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      endDate: [new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0], Validators.required]
    });
  }

  openCreateModal(): void {
    this.editingId = null;
    this.wizardStep.set(1);
    this.wizardMembers = [];
    this.selectedUserId = '';
    this.newMemName = '';
    this.newMemDesignation = '';
    this.newMemDept = '';
    this.newMemRole = 'Member';
    this.commForm.reset({
      committeeName: '',
      committeeCode: 'COMM_' + Date.now(),
      department: 'Skill, Employment & Entrepreneurship',
      chairpersonName: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0]
    });
    this.isModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isModalOpen.set(false);
    this.wizardStep.set(1);
    this.wizardMembers = [];
    // If we opened from /create URL, navigate back to the list
    if (this.router.url.endsWith('/create')) {
      this.router.navigate(['/admin/committees']);
    }
  }

  wizardNext(): void {
    if (this.wizardStep() === 1) {
      // Validate required fields before moving to step 2
      const f = this.commForm;
      f.controls['committeeName'].markAsTouched();
      f.controls['committeeCode'].markAsTouched();
      f.controls['chairpersonName'].markAsTouched();
      if (!f.value.committeeName || !f.value.committeeCode) {
        this.toastService.error('Validation', 'Please fill Committee Name and Code before continuing.');
        return;
      }
    }
    if (this.wizardStep() < 3) this.wizardStep.update(s => s + 1);
  }

  wizardPrev(): void {
    if (this.wizardStep() > 1) this.wizardStep.update(s => s - 1);
  }

  addMemberToWizard(): void {
    if (!this.selectedUserId || !this.newMemName) {
      this.toastService.error('Input Error', 'Please select a user from the dropdown.');
      return;
    }
    if (this.wizardMembers.some(m => m.userId === this.selectedUserId)) {
      this.toastService.warning('Already Added', `${this.newMemName} is already in the list.`);
      return;
    }
    this.wizardMembers.push({
      id: `MEM-${Date.now()}`,
      name: this.newMemName,
      userId: this.selectedUserId,
      designation: this.newMemDesignation,
      department: this.newMemDept || this.commForm.value.department,
      role: this.newMemRole,
      startDate: this.commForm.value.startDate,
      endDate: this.commForm.value.endDate,
      status: 'Active'
    });
    this.toastService.success('Member Added', `${this.newMemName} added as ${this.newMemRole}`);
    this.selectedUserId = '';
    this.newMemName = '';
    this.newMemDesignation = '';
    this.newMemDept = '';
    this.newMemRole = 'Member';
  }

  editCommittee(c: Committee): void {
    this.editingId = c.id;
    this.commForm.patchValue({
      committeeName: c.committeeName,
      committeeCode: c.committeeCode,
      department: c.department,
      chairpersonName: c.chairpersonName,
      description: c.description,
      startDate: c.startDate,
      endDate: c.endDate
    });
    this.isModalOpen.set(true);
  }

  saveCommitteeModal(): void {
    if (this.commForm.invalid) {
      this.toastService.error('Validation Error', 'Please complete required committee details.');
      return;
    }

    const val = this.commForm.value;
    const payload = {
      ...(this.editingId ? { id: this.editingId } : {}),
      ...val,
      // Include members added during wizard (step 2) for new committees
      ...(!this.editingId && this.wizardMembers.length > 0 ? { members: this.wizardMembers } : {})
    };

    this.committeeService.saveCommittee(payload).subscribe(saved => {
      this.toastService.success('Committee Saved', `${saved.committeeName} saved successfully.`);
      this.committeeService.getCommittees().subscribe(list => this.committees.set(list));
      this.closeCreateModal();
    });
  }

  toggleStatus(c: Committee): void {
    this.committeeService.toggleCommitteeStatus(c.id).subscribe(res => {
      if (res) {
        this.toastService.info('Status Updated', `${c.committeeName} status changed to ${res.status}`);
        this.committeeService.getCommittees().subscribe(list => this.committees.set(list));
      }
    });
  }

  manageMembers(c: Committee): void {
    this.activeComm.set(c);
    this.selectedUserId = '';
    this.newMemName = '';
    this.newMemDesignation = '';
    this.newMemDept = '';
    this.newMemRole = 'Member';
    this.isMembersModalOpen.set(true);
  }

  /** Called when a user is picked from the dropdown — auto-fills name, designation, dept */
  onUserSelect(): void {
    const user = this.adminUsers().find(u => u.id === this.selectedUserId);
    if (user) {
      this.newMemName = user.fullName;
      this.newMemDesignation = user.designation;
      this.newMemDept = user.department;
    } else {
      this.newMemName = '';
      this.newMemDesignation = '';
      this.newMemDept = '';
    }
  }

  addMemberToActiveComm(): void {
    if (!this.selectedUserId || !this.newMemName) {
      this.toastService.error('Input Error', 'Please select a user from the dropdown.');
      return;
    }
    const c = this.activeComm();
    if (c) {
      // Prevent duplicate
      if (c.members.some(m => m.userId === this.selectedUserId)) {
        this.toastService.warning('Already Added', `${this.newMemName} is already a member of this committee.`);
        return;
      }
      const newM: CommitteeMember = {
        id: `MEM-${Date.now()}`,
        name: this.newMemName,
        userId: this.selectedUserId,
        designation: this.newMemDesignation,
        department: this.newMemDept || c.department,
        role: this.newMemRole,
        startDate: c.startDate,
        endDate: c.endDate,
        status: 'Active'
      };
      c.members.push(newM);
      this.committeeService.saveCommittee(c).subscribe(() => {
        this.toastService.success('Member Added', `${newM.name} added as ${newM.role}`);
        // Reset picker
        this.selectedUserId = '';
        this.newMemName = '';
        this.newMemDesignation = '';
        this.newMemDept = '';
        this.newMemRole = 'Member';
      });
    }
  }

  removeMember(index: number): void {
    const c = this.activeComm();
    if (c) {
      c.members.splice(index, 1);
      this.committeeService.saveCommittee(c).subscribe(() => {
        this.toastService.info('Member Removed', 'Committee member removed from panel.');
      });
    }
  }
}
