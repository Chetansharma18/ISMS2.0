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
  CourseMasterItem,
  MOCK_COURSE_MASTER_ITEMS
} from '../../core/mock/data/admin-masters.mock';

export type { CourseMasterItem };

@Component({
  selector: 'app-course-master',
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
      <app-page-header title="Course Master">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                placeholder="Search by sector, job role name, or QP code..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#174A6E] transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add Course Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-[#174A6E] hover:bg-[#0B3558] text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Course</span>
          </button>
        </div>
      </app-page-header>

      <!-- Master Table -->
      <div class="overflow-x-auto rounded-lg border border-slate-200">
        <app-table
          [columns]="columns"
          [data]="filteredCourses()"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="courses"
          [customTemplates]="{
            remark: remarkTemplate,
            action: actionTemplate
          }"
        >
        </app-table>
      </div>

      <!-- Custom Template for Remark -->
      <ng-template #remarkTemplate let-item>
        @if (item.remark === 'Expired') {
          <span class="text-rose-600 font-medium text-xs whitespace-nowrap">
            Expired
          </span>
        } @else if (item.remark === 'New Version') {
          <span class="text-emerald-600 font-medium text-xs whitespace-nowrap">
            New Version
          </span>
        } @else if (item.remark === 'Not Valid') {
          <span class="text-slate-600 font-medium text-xs whitespace-nowrap">
            Not Valid
          </span>
        } @else {
          <span class="text-amber-800 font-medium text-xs leading-tight">
            {{ item.remark }}
          </span>
        }
      </ng-template>

      <!-- Custom Template for Action Column -->
      <ng-template #actionTemplate let-item>
        <div class="flex items-center justify-center whitespace-nowrap">
          <button
            type="button"
            (click)="$event.stopPropagation(); deleteCourse(item)"
            class="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Delete Course"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </ng-template>

      <!-- Modal: Add New Course -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[720px]"
        (primaryAction)="submitCourse()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Add New Course
        </h2>
        <div class="mt-4 font-sans text-[13px] space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Sector -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Sector*</label>
              <select
                [(ngModel)]="formData.sector"
                [ngClass]="{'border-red-500': submitted() && !formData.sector, 'border-[#8FA3B6]': !(submitted() && !formData.sector)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
              >
                <option value="" disabled selected>Select Sector</option>
                <option value="Aerospace and Aviation">Aerospace and Aviation</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Apparel">Apparel</option>
                <option value="Automotive">Automotive</option>
                <option value="Beauty & Wellness">Beauty & Wellness</option>
                <option value="Healthcare">Healthcare</option>
                <option value="IT-ITeS">IT-ITeS</option>
                <option value="Logistics">Logistics</option>
              </select>
              @if (submitted() && !formData.sector) {
                <div class="text-xs text-red-500 mt-1 font-medium">Sector is required</div>
              }
            </div>

            <!-- Job Role Name -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">QP/Job Role Name*</label>
              <input
                type="text"
                maxlength="120"
                placeholder="Enter job role name"
                [(ngModel)]="formData.jobRoleName"
                [ngClass]="{'border-red-500': submitted() && !formData.jobRoleName, 'border-[#8FA3B6]': !(submitted() && !formData.jobRoleName)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
              />
              @if (submitted() && !formData.jobRoleName) {
                <div class="text-xs text-red-500 mt-1 font-medium">QP/Job Role Name is required</div>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Job Role Code -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">QP/Job Role Code*</label>
              <input
                type="text"
                placeholder="e.g. AAS/Q6301"
                [(ngModel)]="formData.jobRoleCode"
                [ngClass]="{'border-red-500': submitted() && !formData.jobRoleCode, 'border-[#8FA3B6]': !(submitted() && !formData.jobRoleCode)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
              />
              @if (submitted() && !formData.jobRoleCode) {
                <div class="text-xs text-red-500 mt-1 font-medium">QP/Job Role Code is required</div>
              }
            </div>

            <!-- Version -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Version*</label>
              <input
                type="text"
                placeholder="e.g. 1.0, 2.0"
                [(ngModel)]="formData.version"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
              />
            </div>

            <!-- NSQF Level -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">NSQF Level*</label>
              <input
                type="text"
                placeholder="e.g. 4, 2.5"
                [(ngModel)]="formData.nsqfLevel"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Common Norms Category -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Common Norms Category</label>
              <select
                [(ngModel)]="formData.commonNormsCategory"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800 bg-white"
              >
                <option value="I">Category I</option>
                <option value="II">Category II</option>
                <option value="III">Category III</option>
              </select>
            </div>

            <!-- Theory Duration -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Theory Duration (Hours)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 150"
                [(ngModel)]="formData.theoryDurationHours"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
              />
            </div>

            <!-- Practical + OJT Duration -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Practical + OJT Duration</label>
              <input
                type="text"
                placeholder="e.g. 180+60"
                [(ngModel)]="formData.practicalOjtDurationHours"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- IT & Soft Skill Training -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">IT & Soft Skill Training (Hours)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 100"
                [(ngModel)]="formData.itSoftSkillTrainingHours"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
              />
            </div>

            <!-- Total QP Hours -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Total QP Hours</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 490"
                [(ngModel)]="formData.totalQpHours"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
              />
            </div>

            <!-- Course Valid Up to Date -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Course Valid Up to Date</label>
              <input
                type="text"
                placeholder="e.g. 28-Apr-25"
                [(ngModel)]="formData.courseValidUpToDate"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
              />
            </div>
          </div>

          <!-- Remark -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">Remark</label>
            <input
              type="text"
              placeholder="e.g. Expired, New Version, Not Valid..."
              [(ngModel)]="formData.remark"
              class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
            />
          </div>
        </div>
      </app-action-modal>

    </div>
  `
})
export class CourseMasterComponent {
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  submitted = signal<boolean>(false);

  formData = {
    sector: '',
    jobRoleName: '',
    jobRoleCode: '',
    version: '1.0',
    nsqfLevel: '4',
    commonNormsCategory: 'I',
    theoryDurationHours: 120,
    practicalOjtDurationHours: '150+60',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 430,
    courseValidUpToDate: '',
    remark: ''
  };

  courses = signal<CourseMasterItem[]>(MOCK_COURSE_MASTER_ITEMS);


  readonly filteredCourses = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.courses();
    if (!q) return all;
    return all.filter(c =>
      c.sector.toLowerCase().includes(q) ||
      c.jobRoleName.toLowerCase().includes(q) ||
      c.jobRoleCode.toLowerCase().includes(q)
    );
  });

  readonly columns: TableColumn<CourseMasterItem>[] = [
    { key: 'sNo', label: 'Sr.No.', type: 'number', align: 'center', width: 'w-14 min-w-[55px]' },
    { key: 'sector', label: 'Sector', cellClass: 'whitespace-nowrap font-medium text-slate-800 min-w-[140px]' },
    { key: 'jobRoleName', label: 'QP/Job Role Name', cellClass: 'font-semibold text-slate-800 min-w-[180px]' },
    { key: 'jobRoleCode', label: 'QP/Job Role Code', cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700 min-w-[120px]' },
    { key: 'version', label: 'Version', align: 'center', cellClass: 'whitespace-nowrap text-slate-700 min-w-[70px]' },
    { key: 'nsqfLevel', label: 'NSQF Level', align: 'center', cellClass: 'whitespace-nowrap text-slate-700 min-w-[85px]' },
    { key: 'commonNormsCategory', label: 'Common Norms Category', align: 'center', cellClass: 'whitespace-nowrap text-slate-700 min-w-[120px]' },
    { key: 'theoryDurationHours', label: 'Theory Duration (In hours)', align: 'center', type: 'number', cellClass: 'whitespace-nowrap min-w-[110px]' },
    { key: 'practicalOjtDurationHours', label: 'Practical + Mandatory OJT Duration (In hours)', align: 'center', cellClass: 'whitespace-nowrap text-slate-700 min-w-[160px]' },
    { key: 'itSoftSkillTrainingHours', label: 'IT & Soft Skill Training', align: 'center', type: 'number', cellClass: 'whitespace-nowrap min-w-[110px]' },
    { key: 'totalQpHours', label: 'Total QP Hours', align: 'center', type: 'number', cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[100px]' },
    { key: 'courseValidUpToDate', label: 'Course Valid Up to Date', align: 'center', cellClass: 'whitespace-nowrap text-slate-700 min-w-[130px]' },
    { key: 'remark', label: 'Remark', type: 'custom', cellClass: 'min-w-[140px]' },
    { key: 'action', label: 'Action', align: 'center', type: 'custom', width: 'min-w-[90px]' }
  ];

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  openAddModal(): void {
    this.submitted.set(false);
    this.formData = {
      sector: '',
      jobRoleName: '',
      jobRoleCode: '',
      version: '1.0',
      nsqfLevel: '4',
      commonNormsCategory: 'I',
      theoryDurationHours: 120,
      practicalOjtDurationHours: '150+60',
      itSoftSkillTrainingHours: 100,
      totalQpHours: 430,
      courseValidUpToDate: '',
      remark: ''
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitCourse(): void {
    this.submitted.set(true);
    if (!this.formData.sector.trim() || !this.formData.jobRoleName.trim() || !this.formData.jobRoleCode.trim()) {
      return;
    }

    const newItem: CourseMasterItem = {
      sNo: 1,
      id: 'c-' + Date.now(),
      sector: this.formData.sector.trim(),
      jobRoleName: this.formData.jobRoleName.trim(),
      jobRoleCode: this.formData.jobRoleCode.trim(),
      version: this.formData.version.trim() || '1.0',
      nsqfLevel: this.formData.nsqfLevel.trim() || '4',
      commonNormsCategory: this.formData.commonNormsCategory || 'I',
      theoryDurationHours: Number(this.formData.theoryDurationHours) || 0,
      practicalOjtDurationHours: this.formData.practicalOjtDurationHours.trim() || '0',
      itSoftSkillTrainingHours: Number(this.formData.itSoftSkillTrainingHours) || 0,
      totalQpHours: Number(this.formData.totalQpHours) || 0,
      courseValidUpToDate: this.formData.courseValidUpToDate.trim() || '-',
      remark: this.formData.remark.trim() || 'New Version'
    };

    this.courses.update(current => {
      const updated = [newItem, ...current];
      return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
    });

    this.showModal.set(false);
  }

  deleteCourse(item: CourseMasterItem): void {
    if (confirm(`Are you sure you want to delete course "${item.jobRoleName}" (${item.jobRoleCode})?`)) {
      this.courses.update(current => {
        const updated = current.filter(c => c.id !== item.id);
        return updated.map((c, index) => ({ ...c, sNo: index + 1 }));
      });
    }
  }
}
