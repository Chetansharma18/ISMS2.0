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
  SectorMasterItem,
  MOCK_SECTOR_MASTER_ITEMS
} from '../../core/mock/data/admin-masters.mock';

export type { SectorMasterItem };

@Component({
  selector: 'app-sector-master',
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
      <app-page-header title="Sector Master">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                placeholder="Search by sector name or code..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#174A6E] transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add Sector Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-[#174A6E] hover:bg-[#0B3558] text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Sector</span>
          </button>
        </div>
      </app-page-header>

      <!-- Master Table -->
      <app-table
        [columns]="columns"
        [data]="filteredSectors()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="sectors"
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
            (click)="$event.stopPropagation(); deleteSector(item)"
            class="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Delete Sector"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </ng-template>

      <!-- Modal: Add New Sector -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[500px]"
        (primaryAction)="submitSector()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Add New Sector
        </h2>
        <div class="mt-4 font-sans text-[13px] space-y-4">
          <div>
            <label class="block text-slate-700 font-medium mb-1">Sector Name*</label>
            <input
              type="text"
              maxlength="100"
              placeholder="Enter sector name (e.g. Aerospace and Aviation)"
              [(ngModel)]="formData.sectorName"
              [ngClass]="{'border-red-500': submitted() && !formData.sectorName, 'border-[#8FA3B6]': !(submitted() && !formData.sectorName)}"
              class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
            />
            @if (submitted() && !formData.sectorName) {
              <div class="text-xs text-red-500 mt-1 font-medium">Sector Name is required</div>
            }
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Sector Code</label>
            <input
              type="text"
              maxlength="30"
              placeholder="Enter sector code (e.g. SEC-001)"
              [(ngModel)]="formData.sectorCode"
              class="w-full px-2.5 py-2 border border-[#8FA3B6] rounded focus:outline-none focus:ring-1 focus:ring-[#174A6E] text-slate-800"
            />
          </div>
        </div>
      </app-action-modal>

    </div>
  `
})
export class SectorMasterComponent {
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  submitted = signal<boolean>(false);

  formData = {
    sectorName: '',
    sectorCode: ''
  };

  sectors = signal<SectorMasterItem[]>(MOCK_SECTOR_MASTER_ITEMS);

  readonly filteredSectors = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.sectors();
    if (!q) return all;
    return all.filter(s =>
      s.sectorName.toLowerCase().includes(q) ||
      s.sectorCode.toLowerCase().includes(q)
    );
  });

  readonly columns: TableColumn<SectorMasterItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    {
      key: 'sectorName',
      label: 'Sector Name',
      cellClass: 'whitespace-nowrap font-semibold text-slate-800'
    },
    {
      key: 'sectorCode',
      label: 'Sector Code',
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
    this.formData = { sectorName: '', sectorCode: '' };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitSector(): void {
    this.submitted.set(true);
    if (!this.formData.sectorName.trim()) {
      return; // Required validation
    }

    const code = this.formData.sectorCode.trim() || `SEC-${Date.now().toString().slice(-4)}`;

    const newItem: SectorMasterItem = {
      sNo: 1,
      id: 'sec-' + Date.now(),
      sectorName: this.formData.sectorName.trim(),
      sectorCode: code,
      status: 'Active'
    };

    this.sectors.update(current => {
      const updated = [newItem, ...current];
      return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
    });

    this.showModal.set(false);
  }

  deleteSector(item: SectorMasterItem): void {
    if (confirm(`Are you sure you want to delete sector "${item.sectorName}"?`)) {
      this.sectors.update(current => {
        const updated = current.filter(s => s.id !== item.id);
        return updated.map((s, index) => ({ ...s, sNo: index + 1 }));
      });
    }
  }
}
