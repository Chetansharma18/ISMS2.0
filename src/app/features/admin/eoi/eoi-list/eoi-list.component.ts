import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EoiService } from '../../core/services/eoi.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TableColumn } from '../../../../shared/components/ui/ui-table/ui-table.component';
import { EoiItem, EoiStatus } from '../../core/models/admin.models';

@Component({
  selector: 'admin-eoi-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    PageHeaderComponent, 
    StatusBadgeComponent
  ],
  template: `
    <div>
      <admin-page-header 
        title="Expression of Interest (EOI) Management"
        subtitle="Manage end-to-end EOI lifecycle from configuration and committee assignment to publishing, rescheduling, and response scrutiny"
        [breadcrumbs]="[{ label: 'EOI Management', url: '/admin/eoi' }, { label: 'All EOIs' }]">
        <div header-actions class="flex items-center gap-2">
          <a 
            routerLink="/admin/eoi/create" 
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            Create New EOI
          </a>
        </div>
      </admin-page-header>

      <!-- Search & Advanced Filters Panel -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <!-- Text Search -->
          <div class="lg:col-span-2 relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input 
              type="text" 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Search EOI Reference, Title, or Scheme..."
              class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
          </div>

          <!-- Scheme Filter -->
          <div>
            <select 
              [ngModel]="schemeFilter()"
              (ngModelChange)="schemeFilter.set($event)"
              class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
              <option value="ALL">All Schemes</option>
              <option value="Mukhya Mantri Kaushal Vikas Yojana">MMKVY</option>
              <option value="Pradhan Mantri Kaushal Vikas Yojana">PMKVY</option>
              <option value="Rajkvik Recognition of Prior Learning">RAJKVIK RPL</option>
              <option value="Samarth Scheme for Special Vulnerable Groups">SAMARTH</option>
              <option value="Saksham Scheme for Women Empowerment">SAKSHM</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div>
            <select 
              [ngModel]="categoryFilter()"
              (ngModelChange)="categoryFilter.set($event)"
              class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
              <option value="ALL">All Categories</option>
              <option value="General">General</option>
              <option value="Government Institution / PSU">Govt Institution / PSU</option>
              <option value="NGO / Non-Profit Trust">NGO / Trust</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select 
              [ngModel]="statusFilter()"
              (ngModelChange)="statusFilter.set($event)"
              class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN (Accepting)</option>
              <option value="CLOSED">CLOSED (Evaluation)</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="RESCHEDULED">RESCHEDULED</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span class="font-semibold text-slate-700">
            Showing {{ filteredEois().length }} of {{ eois().length }} Total EOIs
          </span>
          <button 
            *ngIf="searchQuery() || schemeFilter() !== 'ALL' || categoryFilter() !== 'ALL' || statusFilter() !== 'ALL'"
            (click)="resetFilters()"
            class="text-blue-700 hover:text-blue-900 font-semibold cursor-pointer">
            Clear All Filters
          </button>
        </div>
      </div>

      <!-- EOI Master Table -->
      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600 border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th class="px-4 py-3.5">EOI Ref No.</th>
                <th class="px-4 py-3.5">EOI Title</th>
                <th class="px-4 py-3.5">Scheme & Category</th>
                <th class="px-4 py-3.5">Published</th>
                <th class="px-4 py-3.5">Closing</th>
                <th class="px-4 py-3.5">Committee</th>
                <th class="px-4 py-3.5">Status</th>
                <th class="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="filteredEois().length === 0">
                <td colspan="8" class="p-8 text-center text-slate-500">
                  No Expressions of Interest matching criteria.
                </td>
              </tr>
              <tr *ngFor="let row of filteredEois()" class="hover:bg-slate-50/80 transition-colors">
                
                <!-- Ref No -->
                <td class="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                  <a [routerLink]="['/admin/eoi', row.id, 'details']" class="hover:underline">
                    {{ row.referenceNo }}
                  </a>
                </td>

                <!-- Title -->
                <td class="px-4 py-3 max-w-xs">
                  <div class="font-bold text-slate-900 line-clamp-1" [title]="row.title">{{ row.title }}</div>
                  <div class="text-[11px] text-slate-500 truncate mt-0.5">{{ row.department }}</div>
                </td>

                <!-- Scheme & Category -->
                <td class="px-4 py-3 min-w-[150px] max-w-[250px] leading-snug">
                  <div class="font-semibold text-slate-800">{{ row.schemeName }}</div>
                  <div class="text-[11px] text-slate-500">{{ row.eoiCategory }}</div>
                </td>

                <!-- Published Date -->
                <td class="px-4 py-3 whitespace-nowrap text-slate-600">
                  {{ row.publishedDate }}
                </td>

                <!-- Closing Date -->
                <td class="px-4 py-3 font-semibold whitespace-nowrap" [ngClass]="row.status === 'OPEN' ? 'text-amber-700 font-bold' : 'text-slate-700'">
                  {{ row.closingDate }}
                </td>

                <!-- Committee -->
                <td class="px-4 py-3 max-w-[130px] truncate text-slate-600" [title]="row.committeeName || 'Not Assigned'">
                  <a [routerLink]="['/admin/eoi', row.id, 'committee']" class="hover:text-blue-700 hover:underline">
                    {{ row.committeeName || 'Assign Committee' }}
                  </a>
                </td>

                <!-- Status -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <admin-status-badge [status]="row.status"></admin-status-badge>
                </td>

                <!-- Actions -->
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <a 
                      [routerLink]="['/admin/eoi/edit', row.id]" 
                      class="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-md transition-colors" 
                      title="Edit EOI">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </a>
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
export class EoiListComponent implements OnInit {
  private eoiService = inject(EoiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  eois = signal<EoiItem[]>([]);
  searchQuery = signal('');
  schemeFilter = signal('ALL');
  categoryFilter = signal('ALL');
  statusFilter = signal('ALL');

  tableColumns: TableColumn[] = [
    { key: 'referenceNo', label: 'EOI Ref No.', width: '160px' },
    { key: 'title', label: 'EOI Title', width: 'auto' },
    { key: 'scheme', label: 'Scheme & Category', width: 'auto' },
    { key: 'publishedDate', label: 'Published', width: '100px' },
    { key: 'closingDate', label: 'Closing', width: '100px' },
    { key: 'committee', label: 'Committee', width: '140px' },
    { key: 'status', label: 'Status', width: '100px' },
    { key: 'actions', label: 'Actions', align: 'right', width: '80px' }
  ];

  filteredEois = computed(() => {
    const search = this.searchQuery().toLowerCase();
    const scheme = this.schemeFilter();
    const category = this.categoryFilter();
    const status = this.statusFilter();

    return this.eois().filter(e => {
      const matchSearch = !search || 
        e.referenceNo.toLowerCase().includes(search) ||
        e.title.toLowerCase().includes(search) ||
        e.schemeName.toLowerCase().includes(search);

      const matchScheme = scheme === 'ALL' || e.schemeName.toLowerCase().includes(scheme.toLowerCase());
      const matchCategory = category === 'ALL' || e.eoiCategory === category;
      const matchStatus = status === 'ALL' || e.status === status;

      return matchSearch && matchScheme && matchCategory && matchStatus;
    });
  });

  ngOnInit(): void {
    this.loadEois();
  }

  loadEois(): void {
    this.eoiService.getEois().subscribe(data => this.eois.set(data));
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.schemeFilter.set('ALL');
    this.categoryFilter.set('ALL');
    this.statusFilter.set('ALL');
  }

  publishEoi(e: EoiItem): void {
    this.eoiService.publishEoi(e.id).subscribe(res => {
      if (res) {
        this.toastService.success('EOI Published', `${e.referenceNo} is now officially OPEN for public submissions.`);
        this.loadEois();
      }
    });
  }

  closeEoi(e: EoiItem): void {
    this.eoiService.closeEoi(e.id).subscribe(res => {
      if (res) {
        this.toastService.info('EOI Closed', `${e.referenceNo} is now CLOSED. Applicant responses unlocked for committee scrutiny.`);
        this.loadEois();
      }
    });
  }

  duplicateEoi(e: EoiItem): void {
    const copy: Partial<EoiItem> = {
      ...e,
      id: undefined,
      referenceNo: `${e.referenceNo}-COPY`,
      title: `${e.title} (Copy)`,
      status: 'DRAFT',
      version: '1.0',
      applicationCount: 0
    };
    this.eoiService.saveEoi(copy).subscribe(res => {
      this.toastService.success('EOI Duplicated', `Created draft clone ${res.referenceNo}`);
      this.loadEois();
    });
  }
}

