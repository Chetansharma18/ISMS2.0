import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PageHeaderComponent,
  TableComponent,
  ActionModalComponent,
  TableColumn
} from '../../shared';

export interface SchemeMasterItem {
  sNo: number;
  id: string;
  schemeName: string;
  schemeCategory: string;
  categoryName: string;
  amount: number;
  processFees: number;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-scheme-master',
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
      <app-page-header title="Scheme Master">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                placeholder="Search by scheme name, category, or category name..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E] transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add Scheme Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-[#174A6E] hover:bg-[#0B3558] text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Scheme</span>
          </button>
        </div>
      </app-page-header>

      <!-- Master Table -->
      <app-table
        [columns]="columns"
        [data]="filteredSchemes()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="schemes"
        [customTemplates]="{
          schemeCategory: schemeCategoryTemplate,
          categoryName: categoryNameTemplate,
          amount: amountTemplate,
          processFees: processFeesTemplate,
          status: statusTemplate,
          action: actionTemplate
        }"
      >
      </app-table>

      <!-- Custom Template for Scheme Category -->
      <ng-template #schemeCategoryTemplate let-item>
        <span class="font-medium text-slate-700">
          {{ item.schemeCategory }}
        </span>
      </ng-template>

      <!-- Custom Template for Category Name -->
      <ng-template #categoryNameTemplate let-item>
        <span class="font-medium text-slate-700">
          {{ item.categoryName }}
        </span>
      </ng-template>

      <!-- Custom Template for Amount -->
      <ng-template #amountTemplate let-item>
        <span class="font-medium text-slate-800">
          ₹{{ item.amount | number:'1.0-2' }}
        </span>
      </ng-template>

      <!-- Custom Template for Process Fees -->
      <ng-template #processFeesTemplate let-item>
        <span class="font-medium text-slate-800">
          ₹{{ item.processFees | number:'1.0-2' }}
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
            (click)="$event.stopPropagation(); deleteScheme(item)"
            class="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Delete Scheme"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </ng-template>

      <!-- Modal: Add New Scheme -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[560px]"
        (primaryAction)="submitScheme()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Add New Scheme
        </h2>
        <div class="mt-4 font-sans text-[13px] space-y-4">
          <!-- Scheme Name -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">Scheme Name*</label>
            <input
              type="text"
              maxlength="120"
              placeholder="Enter scheme name"
              [(ngModel)]="formData.schemeName"
              [ngClass]="{'border-red-500': submitted() && !formData.schemeName, 'border-[#8FA3B6]': !(submitted() && !formData.schemeName)}"
              class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
            />
            @if (submitted() && !formData.schemeName) {
              <div class="text-xs text-red-500 mt-1 font-medium">Scheme Name is required</div>
            }
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Scheme Category -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Scheme Category*</label>
              <select
                [(ngModel)]="formData.schemeCategory"
                [ngClass]="{'border-red-500': submitted() && !formData.schemeCategory, 'border-[#8FA3B6]': !(submitted() && !formData.schemeCategory)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
              >
                <option value="" disabled selected>Select Scheme Category</option>
                <option value="SAMARTH">SAMARTH</option>
                <option value="SAKSHM">SAKSHM</option>
                <option value="RAJVIK">RAJVIK</option>
                <option value="ESTP">ESTP</option>
                <option value="DDU-GKY">DDU-GKY</option>
              </select>
              @if (submitted() && !formData.schemeCategory) {
                <div class="text-xs text-red-500 mt-1 font-medium">Scheme Category is required</div>
              }
            </div>

            <!-- Category Name -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Category Name*</label>
              <select
                [(ngModel)]="formData.categoryName"
                [ngClass]="{'border-red-500': submitted() && !formData.categoryName, 'border-[#8FA3B6]': !(submitted() && !formData.categoryName)}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white"
              >
                <option value="" disabled selected>Select Category Name</option>
                <option value="GENERAL">GENERAL</option>
                <option value="GOVERNMENT INSTITUTION/PSU">GOVERNMENT INSTITUTION/PSU</option>
                <option value="GOVERNMENT INSTITUTION/INSTITUTION">GOVERNMENT INSTITUTION/INSTITUTION</option>
                <option value="SPECIAL TARGET GROUP">SPECIAL TARGET GROUP</option>
              </select>
              @if (submitted() && !formData.categoryName) {
                <div class="text-xs text-red-500 mt-1 font-medium">Category Name is required</div>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Amount -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Amount (₹)*</label>
              <input
                type="number"
                min="0"
                placeholder="Enter amount"
                [(ngModel)]="formData.amount"
                [ngClass]="{'border-red-500': submitted() && (formData.amount === null || formData.amount === undefined || formData.amount < 0), 'border-[#8FA3B6]': !(submitted() && (formData.amount === null || formData.amount === undefined || formData.amount < 0))}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
              />
              @if (submitted() && (formData.amount === null || formData.amount === undefined || formData.amount < 0)) {
                <div class="text-xs text-red-500 mt-1 font-medium">Valid Amount is required</div>
              }
            </div>

            <!-- Process Fees -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Process Fees (₹)*</label>
              <input
                type="number"
                min="0"
                placeholder="Enter process fees"
                [(ngModel)]="formData.processFees"
                [ngClass]="{'border-red-500': submitted() && (formData.processFees === null || formData.processFees === undefined || formData.processFees < 0), 'border-[#8FA3B6]': !(submitted() && (formData.processFees === null || formData.processFees === undefined || formData.processFees < 0))}"
                class="w-full px-2.5 py-2 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
              />
              @if (submitted() && (formData.processFees === null || formData.processFees === undefined || formData.processFees < 0)) {
                <div class="text-xs text-red-500 mt-1 font-medium">Valid Process Fees is required</div>
              }
            </div>
          </div>
        </div>
      </app-action-modal>

    </div>
  `
})
export class SchemeMasterComponent {
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  submitted = signal<boolean>(false);

  formData: {
    schemeName: string;
    schemeCategory: string;
    categoryName: string;
    amount: number | null;
    processFees: number | null;
  } = {
    schemeName: '',
    schemeCategory: '',
    categoryName: '',
    amount: null,
    processFees: null
  };

  schemes = signal<SchemeMasterItem[]>([
    {
      sNo: 1,
      id: 'sch-1',
      schemeName: 'Chief Minister Skill Development Scheme',
      schemeCategory: 'SAMARTH',
      categoryName: 'GENERAL',
      amount: 5000000,
      processFees: 10000,
      status: 'Active'
    },
    {
      sNo: 2,
      id: 'sch-2',
      schemeName: 'Mukhyamantri Yuva Swavalamban Yojana',
      schemeCategory: 'SAKSHM',
      categoryName: 'GOVERNMENT INSTITUTION/PSU',
      amount: 7500000,
      processFees: 15000,
      status: 'Active'
    },
    {
      sNo: 3,
      id: 'sch-3',
      schemeName: 'Empanelment of Assessment Agencies EOI',
      schemeCategory: 'RAJVIK',
      categoryName: 'GOVERNMENT INSTITUTION/INSTITUTION',
      amount: 2500000,
      processFees: 5000,
      status: 'Active'
    },
    {
      sNo: 4,
      id: 'sch-4',
      schemeName: 'Recruit-Train-Deploy (RTD) Category III',
      schemeCategory: 'SAMARTH',
      categoryName: 'SPECIAL TARGET GROUP',
      amount: 10000000,
      processFees: 25000,
      status: 'Active'
    }
  ]);

  readonly filteredSchemes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.schemes();
    if (!q) return all;
    return all.filter(s =>
      s.schemeName.toLowerCase().includes(q) ||
      s.schemeCategory.toLowerCase().includes(q) ||
      s.categoryName.toLowerCase().includes(q)
    );
  });

  readonly columns: TableColumn<SchemeMasterItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    {
      key: 'schemeName',
      label: 'Scheme Name',
      cellClass: 'whitespace-nowrap font-semibold text-slate-800'
    },
    {
      key: 'schemeCategory',
      label: 'Scheme Category',
      type: 'custom',
      cellClass: 'whitespace-nowrap'
    },
    {
      key: 'categoryName',
      label: 'Category Name',
      type: 'custom',
      cellClass: 'whitespace-nowrap'
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'custom',
      align: 'right',
      cellClass: 'whitespace-nowrap'
    },
    {
      key: 'processFees',
      label: 'Process Fees',
      type: 'custom',
      align: 'right',
      cellClass: 'whitespace-nowrap'
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
    this.formData = { schemeName: '', schemeCategory: '', categoryName: '', amount: null, processFees: null };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitScheme(): void {
    this.submitted.set(true);
    if (
      !this.formData.schemeName.trim() ||
      !this.formData.schemeCategory.trim() ||
      !this.formData.categoryName.trim() ||
      this.formData.amount === null ||
      this.formData.amount === undefined ||
      this.formData.amount < 0 ||
      this.formData.processFees === null ||
      this.formData.processFees === undefined ||
      this.formData.processFees < 0
    ) {
      return; // Required validation
    }

    const newItem: SchemeMasterItem = {
      sNo: 1,
      id: 'sch-' + Date.now(),
      schemeName: this.formData.schemeName.trim(),
      schemeCategory: this.formData.schemeCategory.trim(),
      categoryName: this.formData.categoryName.trim(),
      amount: Number(this.formData.amount),
      processFees: Number(this.formData.processFees),
      status: 'Active'
    };

    this.schemes.update(current => {
      const updated = [newItem, ...current];
      return updated.map((item, index) => ({ ...item, sNo: index + 1 }));
    });

    this.showModal.set(false);
  }

  deleteScheme(item: SchemeMasterItem): void {
    if (confirm(`Are you sure you want to delete scheme "${item.schemeName}"?`)) {
      this.schemes.update(current => {
        const updated = current.filter(s => s.id !== item.id);
        return updated.map((s, index) => ({ ...s, sNo: index + 1 }));
      });
    }
  }
}
