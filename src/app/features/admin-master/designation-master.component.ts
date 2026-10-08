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
  DesignationMasterItem,
  MOCK_DESIGNATION_MASTER_ITEMS
} from '../../core/mock/data/admin-masters.mock';

export type { DesignationMasterItem };

@Component({
  selector: 'app-designation-master',
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
      <app-page-header title="Designation Master">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                placeholder="Search by designation name, code, or department..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E] transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add Designation Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-[#174A6E] hover:bg-[#0B3558] text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Designation</span>
          </button>
        </div>
      </app-page-header>

      <!-- Master Table -->
      <app-table
        [columns]="columns"
        [data]="filteredDesignations()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="designations"
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
          <button
            type="button"
            (click)="$event.stopPropagation(); deleteDesignation(item)"
            class="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Delete Designation"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </ng-template>

      <!-- Modal: Add New Designation -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[520px]"
        (primaryAction)="submitDesignation()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Add New Designation
        </h2>
        <div class="mt-4 font-sans text-[13px] space-y-4">
          <div>
            <label class="block text-slate-700 font-medium mb-1">Designation Name*</label>
            <input
              type="text"
              maxlength="100"
              placeholder="Enter designation name (e.g. Joint Director)"
              [(ngModel)]="formData.designationName"
              [ngClass]="{'border-red-500': submitted() && !formData.designationName, 'border-[#8FA3B6]': !(submitted() && !formData.designationName)}"
              class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
            />
            @if (submitted() && !formData.designationName) {
              <div class="text-xs text-red-500 mt-1 font-medium">Designation Name is required</div>
            }
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Designation Code*</label>
            <input
              type="text"
              maxlength="30"
              placeholder="e.g. JD"
              [(ngModel)]="formData.designationCode"
              [ngClass]="{'border-red-500': submitted() && !formData.designationCode, 'border-[#8FA3B6]': !(submitted() && !formData.designationCode)}"
              class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 font-mono text-xs"
            />
            @if (submitted() && !formData.designationCode) {
              <div class="text-xs text-red-500 mt-1 font-medium">Designation Code is required</div>
            }
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Department / Wing</label>
            <select
              [(ngModel)]="formData.departmentWing"
              class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
            >
              <option value="Administration">Administration</option>
              <option value="Operations & Skill Training">Operations & Skill Training</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
              <option value="IT & CCTV Monitoring">IT & CCTV Monitoring</option>
              <option value="Scrutiny & Approvals">Scrutiny & Approvals</option>
            </select>
          </div>
        </div>
      </app-action-modal>

    </div>
  `
})
export class DesignationMasterComponent {
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  submitted = signal<boolean>(false);

  formData = {
    designationName: '',
    designationCode: '',
    departmentWing: 'Administration'
  };

  designations = signal<DesignationMasterItem[]>(MOCK_DESIGNATION_MASTER_ITEMS);

  readonly filteredDesignations = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.designations();
    if (!q) return all;
    return all.filter(d =>
      d.designationName.toLowerCase().includes(q) ||
      d.designationCode.toLowerCase().includes(q) ||
      d.departmentWing.toLowerCase().includes(q)
    );
  });

  readonly columns: TableColumn<DesignationMasterItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    {
      key: 'designationName',
      label: 'Designation Name',
      cellClass: 'whitespace-nowrap font-semibold text-slate-800'
    },
    {
      key: 'designationCode',
      label: 'Designation Code',
      cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700'
    },
    {
      key: 'departmentWing',
      label: 'Department / Wing',
      cellClass: 'whitespace-nowrap font-medium text-slate-700'
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
      designationName: '',
      designationCode: '',
      departmentWing: 'Administration'
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitDesignation(): void {
    this.submitted.set(true);
    if (!this.formData.designationName.trim() || !this.formData.designationCode.trim()) {
      return; // Required validation
    }

    const newItem: DesignationMasterItem = {
      sNo: 1,
      id: 'desig-' + Date.now(),
      designationName: this.formData.designationName.trim(),
      designationCode: this.formData.designationCode.trim().toUpperCase(),
      departmentWing: this.formData.departmentWing,
      status: 'Active'
    };

    this.designations.update(current => {
      const updated = [newItem, ...current];
      return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
    });

    this.showModal.set(false);
  }

  deleteDesignation(item: DesignationMasterItem): void {
    if (confirm(`Are you sure you want to delete designation "${item.designationName}"?`)) {
      this.designations.update(current => {
        const updated = current.filter(d => d.id !== item.id);
        return updated.map((d, index) => ({ ...d, sNo: index + 1 }));
      });
    }
  }
}
