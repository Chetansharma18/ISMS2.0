import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EoiService } from '../core/services/eoi.service';
import { ToastService } from '../core/services/toast.service';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { ApplicationItem } from '../core/models/admin.models';

@Component({
  selector: 'admin-applications',
  standalone: true,
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
        title="Application Scrutiny & Governance"
        subtitle="Global applicant submission ledger across all state schemes, fee statuses, and technical evaluation stages"
        icon="inventory"
        [breadcrumbs]="[{ label: 'Applications', url: '/admin/applications' }]">
        <div header-actions class="flex items-center gap-2">
          <button (click)="exportApplications()" class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>
      </admin-page-header>

      <!-- Advanced Filter Panel (Section 49) -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Text Search -->
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search App No, Applicant, or Org..."
              class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
          </div>

          <!-- Scheme Filter -->
          <div>
            <select [(ngModel)]="schemeFilter" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
              <option value="ALL">All Schemes</option>
              <option value="Mukhya Mantri Kaushal Vikas Yojana">MMKVY</option>
              <option value="Rajkvik Recognition of Prior Learning">RAJKVIK RPL</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select [(ngModel)]="statusFilter" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
              <option value="ALL">All Application Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div>
            <select [(ngModel)]="categoryFilter" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
              <option value="ALL">All Categories</option>
              <option value="General">General</option>
              <option value="Private Organization / Corporate">Corporate</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span class="font-semibold text-slate-700">Showing {{ filteredApps().length }} of {{ apps().length }} Proposals</span>
          <button *ngIf="searchQuery || schemeFilter !== 'ALL' || statusFilter !== 'ALL' || categoryFilter !== 'ALL'" (click)="resetFilters()" class="text-blue-700 font-semibold hover:underline">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Applications Table -->
      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600 border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th class="px-4 py-3.5">Application No.</th>
                <th class="px-4 py-3.5">Reg. No.</th>
                <th class="px-4 py-3.5">Applicant & Entity</th>
                <th class="px-4 py-3.5">EOI Reference</th>
                <th class="px-4 py-3.5">Scheme & Category</th>
                <th class="px-4 py-3.5">Submission Date</th>
                <th class="px-4 py-3.5">Amount</th>
                <th class="px-4 py-3.5">Status</th>
                <th class="px-4 py-3.5">Assigned Committee</th>
                <th class="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let a of filteredApps()" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                  <a [routerLink]="['/admin/eoi', a.eoiId, 'responses', a.id]" class="hover:underline">
                    {{ a.applicationNumber }}
                  </a>
                </td>

                <td class="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                  {{ a.registrationNumber }}
                </td>

                <td class="px-4 py-3 max-w-xs">
                  <div class="font-bold text-slate-900 line-clamp-1">{{ a.organizationName }}</div>
                  <div class="text-[11px] text-slate-500 truncate">{{ a.applicantName }} • {{ a.applicantPhone }}</div>
                </td>

                <td class="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                  {{ a.eoiReferenceNo }}
                </td>

                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="font-semibold text-slate-800">{{ a.schemeName }}</div>
                  <div class="text-[11px] text-slate-500">{{ a.category }}</div>
                </td>

                <td class="px-4 py-3 whitespace-nowrap text-slate-600">
                  {{ a.submissionDate | date:'dd-MM-yyyy HH:mm' }}
                </td>

                <td class="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                  ₹{{ a.amount | number:'1.0-0' }}
                </td>

                <td class="px-4 py-3 whitespace-nowrap">
                  <admin-status-badge [status]="a.status"></admin-status-badge>
                </td>

                <td class="px-4 py-3 max-w-[130px] truncate text-slate-600" [title]="a.assignedCommitteeName || 'Under Screening'">
                  {{ a.assignedCommitteeName || 'Under Screening' }}
                </td>

                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <a 
                      [routerLink]="['/admin/eoi', a.eoiId, 'responses', a.id]" 
                      class="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors" 
                      title="View & Review Proposal">
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </a>
                    <button 
                      (click)="forwardProposal(a)"
                      class="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" 
                      title="Forward to Committee">
                      <span class="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                    </button>
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
export class ApplicationsComponent implements OnInit {
  private eoiService = inject(EoiService);
  private toastService = inject(ToastService);

  apps = signal<ApplicationItem[]>([]);
  searchQuery = '';
  schemeFilter = 'ALL';
  statusFilter = 'ALL';
  categoryFilter = 'ALL';

  ngOnInit(): void {
    this.eoiService.getAllApplications().subscribe(list => this.apps.set(list));
  }

  filteredApps(): ApplicationItem[] {
    return this.apps().filter(a => {
      const matchSearch = !this.searchQuery || 
        a.applicationNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.applicantName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.organizationName.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchScheme = this.schemeFilter === 'ALL' || a.schemeName.toLowerCase().includes(this.schemeFilter.toLowerCase());
      const matchStatus = this.statusFilter === 'ALL' || a.status === this.statusFilter;
      const matchCategory = this.categoryFilter === 'ALL' || a.category === this.categoryFilter;

      return matchSearch && matchScheme && matchStatus && matchCategory;
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.schemeFilter = 'ALL';
    this.statusFilter = 'ALL';
    this.categoryFilter = 'ALL';
  }

  exportApplications(): void {
    this.toastService.success('Export Initiated', 'Exporting applications ledger to CSV...');
  }

  forwardProposal(a: ApplicationItem): void {
    this.toastService.info('Forwarded', `Proposal ${a.applicationNumber} routed to evaluation panel.`);
  }
}
