import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EoiService } from '../../core/services/eoi.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EoiItem, EoiStatus } from '../../core/models/admin.models';

@Component({
  selector: 'admin-eoi-list',
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
        title="Expression of Interest (EOI) Management"
        subtitle="Manage end-to-end EOI lifecycle from configuration and committee assignment to publishing, rescheduling, and response scrutiny"
        icon="assignment"
        [breadcrumbs]="[{ label: 'EOI Management', url: '/admin/eoi' }, { label: 'All EOIs' }]">
        <div header-actions class="flex items-center gap-2">
          <a 
            routerLink="/admin/eoi/create" 
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            + Create New EOI
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
              [(ngModel)]="searchQuery" 
              placeholder="Search EOI Reference, Title, or Scheme..."
              class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
          </div>

          <!-- Scheme Filter -->
          <div>
            <select 
              [(ngModel)]="schemeFilter" 
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
              [(ngModel)]="categoryFilter" 
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
              [(ngModel)]="statusFilter" 
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
            *ngIf="searchQuery || schemeFilter !== 'ALL' || categoryFilter !== 'ALL' || statusFilter !== 'ALL'"
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
                <th class="px-4 py-3.5">Published Date</th>
                <th class="px-4 py-3.5">Closing Date</th>
                <th class="px-4 py-3.5 text-center">Applications</th>
                <th class="px-4 py-3.5">Committee</th>
                <th class="px-4 py-3.5">Version</th>
                <th class="px-4 py-3.5">Status</th>
                <th class="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let e of filteredEois()" class="hover:bg-slate-50/80 transition-colors group">
                <!-- Ref No -->
                <td class="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                  <a [routerLink]="['/admin/eoi', e.id, 'details']" class="hover:underline">
                    {{ e.referenceNo }}
                  </a>
                </td>

                <!-- Title -->
                <td class="px-4 py-3 max-w-xs">
                  <div class="font-bold text-slate-900 line-clamp-1" [title]="e.title">{{ e.title }}</div>
                  <div class="text-[11px] text-slate-500 truncate mt-0.5">{{ e.department }}</div>
                </td>

                <!-- Scheme & Category -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="font-semibold text-slate-800">{{ e.schemeName }}</div>
                  <div class="text-[11px] text-slate-500">{{ e.eoiCategory }}</div>
                </td>

                <!-- Published Date -->
                <td class="px-4 py-3 whitespace-nowrap text-slate-600">
                  {{ e.publishedDate }}
                </td>

                <!-- Closing Date -->
                <td class="px-4 py-3 font-semibold whitespace-nowrap" [ngClass]="e.status === 'OPEN' ? 'text-amber-700 font-bold' : 'text-slate-700'">
                  {{ e.closingDate }}
                </td>

                <!-- Applications Count -->
                <td class="px-4 py-3 text-center whitespace-nowrap">
                  <a 
                    [routerLink]="['/admin/eoi', e.id, 'responses']"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#131A4D] border border-blue-200 hover:bg-blue-100 transition-colors"
                    title="View Submissions">
                    {{ e.applicationCount }} Apps
                  </a>
                </td>

                <!-- Committee -->
                <td class="px-4 py-3 max-w-[130px] truncate text-slate-600" [title]="e.committeeName || 'Not Assigned'">
                  <a [routerLink]="['/admin/eoi', e.id, 'committee']" class="hover:text-blue-700 hover:underline">
                    {{ e.committeeName || 'Assign Committee' }}
                  </a>
                </td>

                <!-- Version -->
                <td class="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                  <a [routerLink]="['/admin/eoi', e.id, 'history']" class="hover:text-blue-700 hover:underline">
                    v{{ e.version }}
                  </a>
                </td>

                <!-- Status -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <admin-status-badge [status]="e.status"></admin-status-badge>
                </td>

                <!-- Comprehensive Actions Dropdown/Row (Rule 20 & 38) -->
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <!-- View / Details -->
                    <a 
                      [routerLink]="['/admin/eoi', e.id, 'details']" 
                      class="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded" 
                      title="View Details">
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </a>

                    <!-- Edit / Configure -->
                    <a 
                      [routerLink]="['/admin/eoi/edit', e.id]" 
                      class="p-1 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded" 
                      title="Edit EOI">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </a>

                    <!-- Form Builder -->
                    <a 
                      [routerLink]="['/admin/eoi', e.id, 'form-builder']" 
                      class="p-1 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 rounded" 
                      title="Dynamic Form Builder">
                      <span class="material-symbols-outlined text-[18px]">format_shapes</span>
                    </a>

                    <!-- Preview as Applicant -->
                    <a 
                      [routerLink]="['/admin/eoi', e.id, 'preview']" 
                      class="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded" 
                      title="Preview as Applicant">
                      <span class="material-symbols-outlined text-[18px]">preview</span>
                    </a>

                    <!-- Reschedule (Mandatory Corrigendum) -->
                    <a 
                      [routerLink]="['/admin/eoi', e.id, 'reschedule']" 
                      class="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded" 
                      title="Reschedule Dates (Corrigendum)">
                      <span class="material-symbols-outlined text-[18px]">update</span>
                    </a>

                    <!-- Assign / Change Committee -->
                    <a 
                      [routerLink]="['/admin/eoi', e.id, 'committee']" 
                      class="p-1 rounded transition-colors"
                      [class]="e.committeeName 
                        ? 'text-teal-600 hover:text-teal-800 hover:bg-teal-50' 
                        : 'text-orange-500 hover:text-orange-700 hover:bg-orange-50'"
                      [title]="e.committeeName ? ('Change Committee · ' + e.committeeName) : 'Assign Committee (Not Assigned)'">
                      <span class="material-symbols-outlined text-[18px]">group_add</span>
                    </a>

                    <!-- Publish Button if DRAFT/PUBLISHED -->
                    <button 
                      *ngIf="e.status === 'DRAFT' || e.status === 'PUBLISHED'"
                      (click)="publishEoi(e)"
                      class="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer" 
                      title="Publish & Open Submissions">
                      <span class="material-symbols-outlined text-[18px]">rocket_launch</span>
                    </button>

                    <!-- Close EOI if OPEN -->
                    <button 
                      *ngIf="e.status === 'OPEN'"
                      (click)="closeEoi(e)"
                      class="p-1 text-zinc-600 hover:bg-zinc-100 rounded cursor-pointer" 
                      title="Close EOI Submissions">
                      <span class="material-symbols-outlined text-[18px]">lock</span>
                    </button>

                    <!-- Duplicate EOI -->
                    <button 
                      (click)="duplicateEoi(e)"
                      class="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded cursor-pointer" 
                      title="Duplicate EOI">
                      <span class="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredEois().length === 0">
                <td colspan="10" class="py-12 text-center text-slate-400">
                  <span class="material-symbols-outlined text-[36px] text-slate-300 block mb-1">search_off</span>
                  No Expressions of Interest matching criteria.
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
  searchQuery = '';
  schemeFilter = 'ALL';
  categoryFilter = 'ALL';
  statusFilter = 'ALL';

  ngOnInit(): void {
    this.loadEois();
  }

  loadEois(): void {
    this.eoiService.getEois().subscribe(data => this.eois.set(data));
  }

  filteredEois(): EoiItem[] {
    return this.eois().filter(e => {
      const matchSearch = !this.searchQuery || 
        e.referenceNo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        e.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        e.schemeName.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchScheme = this.schemeFilter === 'ALL' || e.schemeName.toLowerCase().includes(this.schemeFilter.toLowerCase());
      const matchCategory = this.categoryFilter === 'ALL' || e.eoiCategory === this.categoryFilter;
      const matchStatus = this.statusFilter === 'ALL' || e.status === this.statusFilter;

      return matchSearch && matchScheme && matchCategory && matchStatus;
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.schemeFilter = 'ALL';
    this.categoryFilter = 'ALL';
    this.statusFilter = 'ALL';
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
