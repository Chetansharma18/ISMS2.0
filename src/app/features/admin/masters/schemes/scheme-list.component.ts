import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../core/services/master.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { SchemeMaster } from '../../core/models/admin.models';

@Component({
  selector: 'admin-scheme-list',
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
        title="Scheme Master Management"
        subtitle="Foundational scheme catalog. Active schemes in this master populate dropdowns across the EOI lifecycle."
        icon="account_balance"
        [breadcrumbs]="[{ label: 'Masters', url: '/admin/masters/schemes' }, { label: 'Scheme Master' }]">
        <div header-actions class="flex items-center gap-2">
          <a 
            routerLink="/admin/masters/schemes/create" 
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            + Add Scheme
          </a>
        </div>
      </admin-page-header>

      <!-- Search & Filters -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="relative w-full sm:w-80">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search Scheme Code, Name or Dept..."
            class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select 
            [(ngModel)]="statusFilter" 
            class="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          <span class="text-xs text-slate-500 font-semibold px-2">
            Total: {{ filteredSchemes().length }} Schemes
          </span>
        </div>
      </div>

      <!-- Schemes Table -->
      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600 border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th class="px-3 py-3.5 text-center w-12">Sr. No.</th>
                <th class="px-4 py-3.5">Scheme Code</th>
                <th class="px-4 py-3.5">Scheme Name</th>
                <th class="px-4 py-3.5">Short Name</th>
                <th class="px-4 py-3.5">Department</th>
                <th class="px-4 py-3.5">Scheme Category</th>
                <th class="px-4 py-3.5">Validity Period</th>
                <th class="px-4 py-3.5 text-center">EOI Count</th>
                <th class="px-4 py-3.5">Status</th>
                <th class="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let s of filteredSchemes(); let i = index" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-3 py-3 text-center text-slate-400 font-medium">
                  {{ i + 1 }}
                </td>
                <td class="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                  {{ s.schemeCode }}
                </td>
                <td class="px-4 py-3 max-w-xs">
                  <div class="font-bold text-slate-900 line-clamp-1" [title]="s.schemeName">{{ s.schemeName }}</div>
                  <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{{ s.description }}</div>
                </td>
                <td class="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                  {{ s.shortName || s.schemeCode }}
                </td>
                <td class="px-4 py-3 text-slate-600 max-w-[150px] truncate" [title]="s.department">
                  {{ s.department }}
                </td>
                <td class="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {{ s.schemeCategory }}
                </td>
                <td class="px-4 py-3 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                  {{ s.startDate }} to {{ s.endDate }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {{ s.eoiCount }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <admin-status-badge [status]="s.status"></admin-status-badge>
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <!-- View -->
                    <button 
                      (click)="viewScheme(s)"
                      class="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="View Details">
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <!-- Edit -->
                    <a 
                      [routerLink]="['/admin/masters/schemes/edit', s.id]"
                      class="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="Edit Scheme">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </a>
                    <!-- Activate / Deactivate Toggle (Rule 11) -->
                    <button 
                      (click)="toggleStatus(s)"
                      class="p-1.5 rounded-md transition-colors cursor-pointer"
                      [ngClass]="s.status === 'Active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'"
                      [title]="s.status === 'Active' ? 'Click to Deactivate' : 'Click to Activate'">
                      <span class="material-symbols-outlined text-[18px]">
                        {{ s.status === 'Active' ? 'toggle_on' : 'toggle_off' }}
                      </span>
                    </button>
                    <!-- Create EOI for this Scheme -->
                    <a 
                      [routerLink]="['/admin/eoi/create']"
                      [queryParams]="{ schemeId: s.id }"
                      class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      title="Create EOI under this Scheme">
                      <span class="material-symbols-outlined text-[18px]">add_box</span>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Scheme View Modal -->
      <admin-modal 
        [isOpen]="isModalOpen()" 
        [title]="selectedScheme()?.schemeName || 'Scheme Details'" 
        icon="account_balance"
        maxWidth="2xl"
        (close)="isModalOpen.set(false)">
        <div modal-body *ngIf="selectedScheme() as sc" class="space-y-4 text-xs text-slate-700">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Scheme Code</span>
              <span class="font-mono font-bold text-blue-900 text-sm">{{ sc.schemeCode }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Short Name</span>
              <span class="font-semibold text-slate-900">{{ sc.shortName }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
              <admin-status-badge [status]="sc.status"></admin-status-badge>
            </div>
            <div class="col-span-2">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
              <span class="font-semibold text-slate-800">{{ sc.department }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
              <span class="font-semibold text-slate-800">{{ sc.schemeCategory }}</span>
            </div>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 mb-1">Description</h4>
            <p class="text-slate-600 leading-relaxed">{{ sc.description }}</p>
          </div>

          <div *ngIf="sc.objective">
            <h4 class="font-bold text-slate-900 mb-1">Scheme Objective & Targets</h4>
            <p class="text-slate-600 leading-relaxed">{{ sc.objective }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Start Date</span>
              <span class="font-semibold text-slate-800">{{ sc.startDate }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500 block">End Date</span>
              <span class="font-semibold text-slate-800">{{ sc.endDate }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Contact Email</span>
              <span class="font-semibold text-blue-700">{{ sc.contactEmail || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Contact Phone</span>
              <span class="font-semibold text-slate-800">{{ sc.contactPhone || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div modal-footer class="flex items-center gap-2">
          <button (click)="isModalOpen.set(false)" class="px-3.5 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100">
            Close
          </button>
          <a 
            *ngIf="selectedScheme()"
            [routerLink]="['/admin/masters/schemes/edit', selectedScheme()!.id]"
            (click)="isModalOpen.set(false)"
            class="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs">
            Edit Scheme
          </a>
        </div>
      </admin-modal>
    </div>
  `
})
export class SchemeListComponent implements OnInit {
  private masterService = inject(MasterService);
  private toastService = inject(ToastService);

  schemes = signal<SchemeMaster[]>([]);
  searchQuery = '';
  statusFilter = 'ALL';

  selectedScheme = signal<SchemeMaster | null>(null);
  isModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.masterService.getSchemes().subscribe(list => this.schemes.set(list));
  }

  filteredSchemes(): SchemeMaster[] {
    return this.schemes().filter(s => {
      const matchSearch = !this.searchQuery || 
        s.schemeCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.schemeName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchStatus = this.statusFilter === 'ALL' || s.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  viewScheme(s: SchemeMaster): void {
    this.selectedScheme.set(s);
    this.isModalOpen.set(true);
  }

  toggleStatus(s: SchemeMaster): void {
    this.masterService.toggleSchemeStatus(s.id).subscribe(res => {
      if (res) {
        this.toastService.success(
          `Scheme ${res.status === 'Active' ? 'Activated' : 'Deactivated'}`,
          `${res.schemeName} status changed to ${res.status}`
        );
        this.loadSchemes();
      }
    });
  }
}
