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
  DistrictBlockMasterItem,
  MOCK_DISTRICT_BLOCK_MASTER_ITEMS
} from '../../core/mock/data/admin-masters.mock';

export type { DistrictBlockMasterItem };

@Component({
  selector: 'app-district-block-master',
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
      <app-page-header title="District & Block Master">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                placeholder="Search by district name, block name, or code..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E] transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add District & Block Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-[#174A6E] hover:bg-[#0B3558] text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add District & Block</span>
          </button>
        </div>
      </app-page-header>

      <!-- Master Table -->
      <app-table
        [columns]="columns"
        [data]="filteredDistrictBlocks()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="entries"
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
          
          <!-- Active / Inactive Toggle -->
          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>
          <div
            class="inline-flex items-center gap-1.5"
            title="Toggle Status"
            (click)="$event.stopPropagation();"
          >
            <button
              type="button"
              (click)="item.status = item.status === 'Active' ? 'Inactive' : 'Active'"
              class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              [ngClass]="item.status === 'Inactive' ? 'bg-slate-400 hover:bg-slate-500' : 'bg-emerald-500 hover:bg-emerald-600'"
              role="switch"
              [attr.aria-checked]="item.status === 'Active'"
            >
              <span class="sr-only">Toggle Active Status</span>
              <span
                class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                [ngClass]="item.status === 'Inactive' ? 'translate-x-0' : 'translate-x-3'"
              ></span>
            </button>
            <span 
              class="font-medium text-[12px] select-none transition-colors cursor-pointer"
              (click)="item.status = item.status === 'Active' ? 'Inactive' : 'Active'"
              [ngClass]="item.status === 'Inactive' ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-700'"
            >
              {{ item.status === 'Inactive' ? 'Inactive' : 'Active' }}
            </span>
          </div>
        </div>
      </ng-template>

      <!-- Modal: Add New District & Block -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[540px]"
        (primaryAction)="submitDistrictBlock()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Add New District & Block
        </h2>
        <div class="mt-4 font-sans text-[13px] space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- District Name -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">District Name*</label>
              <input
                type="text"
                maxlength="80"
                placeholder="Enter district name (e.g. Jaipur)"
                [(ngModel)]="formData.districtName"
                [ngClass]="{'border-red-500': submitted() && !formData.districtName, 'border-[#8FA3B6]': !(submitted() && !formData.districtName)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
              />
              @if (submitted() && !formData.districtName) {
                <div class="text-xs text-red-500 mt-1 font-medium">District Name is required</div>
              }
            </div>

            <!-- District Code -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">District Code*</label>
              <input
                type="text"
                maxlength="20"
                placeholder="e.g. JPR"
                [(ngModel)]="formData.districtCode"
                [ngClass]="{'border-red-500': submitted() && !formData.districtCode, 'border-[#8FA3B6]': !(submitted() && !formData.districtCode)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 font-mono text-xs"
              />
              @if (submitted() && !formData.districtCode) {
                <div class="text-xs text-red-500 mt-1 font-medium">District Code is required</div>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Block Name -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Block Name*</label>
              <input
                type="text"
                maxlength="80"
                placeholder="Enter block name (e.g. Amber)"
                [(ngModel)]="formData.blockName"
                [ngClass]="{'border-red-500': submitted() && !formData.blockName, 'border-[#8FA3B6]': !(submitted() && !formData.blockName)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
              />
              @if (submitted() && !formData.blockName) {
                <div class="text-xs text-red-500 mt-1 font-medium">Block Name is required</div>
              }
            </div>

            <!-- Block Code -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Block Code</label>
              <input
                type="text"
                maxlength="30"
                placeholder="e.g. JPR-AMB"
                [(ngModel)]="formData.blockCode"
                class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </app-action-modal>

    </div>
  `
})
export class DistrictBlockMasterComponent {
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  editingId = signal<string | null>(null);
  submitted = signal<boolean>(false);

  formData = {
    districtName: '',
    districtCode: '',
    blockName: '',
    blockCode: ''
  };

  districtBlocks = signal<DistrictBlockMasterItem[]>(MOCK_DISTRICT_BLOCK_MASTER_ITEMS);

  readonly filteredDistrictBlocks = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.districtBlocks();
    if (!q) return all;
    return all.filter(db =>
      db.districtName.toLowerCase().includes(q) ||
      db.districtCode.toLowerCase().includes(q) ||
      db.blockName.toLowerCase().includes(q) ||
      db.blockCode.toLowerCase().includes(q)
    );
  });

  readonly columns: TableColumn<DistrictBlockMasterItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    {
      key: 'districtName',
      label: 'District Name',
      cellClass: 'whitespace-nowrap font-semibold text-slate-800'
    },
    {
      key: 'districtCode',
      label: 'District Code',
      cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700'
    },
    {
      key: 'blockName',
      label: 'Block Name',
      cellClass: 'whitespace-nowrap font-medium text-slate-700'
    },
    {
      key: 'blockCode',
      label: 'Block Code',
      cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700'
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
    this.formData = {
      districtName: '',
      districtCode: '',
      blockName: '',
      blockCode: ''
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitDistrictBlock(): void {
    this.submitted.set(true);
    if (!this.formData.districtName.trim() || !this.formData.districtCode.trim() || !this.formData.blockName.trim()) {
      return; // Required validation
    }

    const bCode = this.formData.blockCode.trim() || `${this.formData.districtCode.trim()}-${this.formData.blockName.trim().slice(0, 3).toUpperCase()}`;

    const newItem: DistrictBlockMasterItem = {
      sNo: 1,
      id: 'db-' + Date.now(),
      districtName: this.formData.districtName.trim(),
      districtCode: this.formData.districtCode.trim().toUpperCase(),
      blockName: this.formData.blockName.trim(),
      blockCode: bCode,
      status: 'Active'
    };

    this.districtBlocks.update(current => {
      const updated = [newItem, ...current];
      return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
    });

    this.showModal.set(false);
  }

  deleteEntry(item: DistrictBlockMasterItem): void {
    if (confirm(`Are you sure you want to delete "${item.blockName}" block in "${item.districtName}"?`)) {
      this.districtBlocks.update(current => {
        const updated = current.filter(db => db.id !== item.id);
        return updated.map((db, index) => ({ ...db, sNo: index + 1 }));
      });
    }
  }
}
