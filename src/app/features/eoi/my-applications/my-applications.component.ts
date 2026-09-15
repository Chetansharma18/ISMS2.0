import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgClass, AsyncPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EoiStateService, EoiApplication } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Observable } from 'rxjs';

type AppFilter = 'ALL' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED' | 'DRAFT';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    NgClass,
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-800 antialiased">
      <app-header></app-header>

      <div class="flex flex-grow">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block"></app-sidebar>

        <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto space-y-6">

          <!-- Page Heading: Simple & Professional -->
          <div class="border-b border-slate-200 pb-4">
            <h1 class="text-2xl sm:text-3xl font-bold text-[#002244] tracking-tight">
              My EOI Applications
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Official Expression of Interest (EOI) submissions, scrutiny progress, and treasury receipts filed under your registered profile.
            </p>
          </div>

          <!-- Top KPI Statistics Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" *ngIf="(history$ | async) as allApps">
            
            <!-- 1. Total Submissions -->
            <div class="bg-white p-4 rounded-xs border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-sm bg-[#002244]/10 text-[#002244] flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Filed</div>
                <div class="text-xl sm:text-2xl font-black text-[#002244]">{{ allApps.length }}</div>
              </div>
            </div>

            <!-- 2. Under Review -->
            <div class="bg-white p-4 rounded-xs border border-amber-200/80 shadow-2xs flex items-center gap-3.5 bg-gradient-to-br from-white to-amber-50/30">
              <div class="w-11 h-11 rounded-sm bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Under Scrutiny</div>
                <div class="text-xl sm:text-2xl font-black text-amber-700">{{ getCount('UNDER_SCRUTINY') }}</div>
              </div>
            </div>

            <!-- 3. Empanelled / Approved -->
            <div class="bg-white p-4 rounded-xs border border-emerald-200/80 shadow-2xs flex items-center gap-3.5 bg-gradient-to-br from-white to-emerald-50/30">
              <div class="w-11 h-11 rounded-sm bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Approved / TP</div>
                <div class="text-xl sm:text-2xl font-black text-emerald-700">{{ getCount('APPROVED') }}</div>
              </div>
            </div>

            <!-- 4. Total EMD Paid -->
            <div class="bg-white p-4 rounded-xs border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-sm bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold text-sm">
                ₹
              </div>
              <div class="min-w-0">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total EMD Paid</div>
                <div class="text-xl sm:text-2xl font-black text-slate-800">
                  ₹{{ getTotalEmd(allApps) | number:'1.0-0' }}
                </div>
              </div>
            </div>

          </div>

          <!-- Main Content Card -->
          <div class="bg-white border border-slate-200 shadow-2xs rounded-xs overflow-hidden">
            
            <!-- Filters Toolbar -->
            <div class="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
              
              <!-- Tabs -->
              <nav class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" aria-label="Application Status Tabs">
                <button 
                  *ngFor="let tab of filterTabs"
                  type="button"
                  (click)="setFilter(tab.key)"
                  [ngClass]="activeFilter === tab.key ? 'bg-[#002244] text-white font-bold shadow-2xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'"
                  class="px-3.5 py-1.5 rounded-xs text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap">
                  <span>{{ tab.label }}</span>
                  <span 
                    [ngClass]="activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'"
                    class="px-1.5 py-0.2 rounded-full text-[10.5px] font-mono">
                    {{ getCount(tab.key) }}
                  </span>
                </button>
              </nav>

              <!-- Search Input -->
              <div class="relative w-full md:w-72 shrink-0">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input 
                  type="text" 
                  [(ngModel)]="searchKeyword" 
                  placeholder="Search by ID, Scheme, Dept..." 
                  class="w-full pl-8.5 pr-8 py-1.5 text-xs border border-slate-300 rounded-xs bg-white focus:border-[#002244] focus:outline-none text-slate-800 transition"
                />
                <button 
                  *ngIf="searchKeyword" 
                  (click)="searchKeyword = ''" 
                  class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 text-xs">
                  ✕
                </button>
              </div>

            </div>

            <!-- Mobile Swipe Hint -->
            <div class="md:hidden text-[11px] text-slate-400 bg-slate-50 px-4 py-1.5 text-right border-b border-slate-100 flex items-center justify-end gap-1">
              <span>↔</span>
              <span>Scroll horizontally to view table columns</span>
            </div>

            <!-- Applications Data Table -->
            <div class="overflow-x-auto" *ngIf="(history$ | async) as allApps">
              <table class="min-w-[760px] lg:min-w-full divide-y divide-slate-200 text-left text-xs">
                
                <thead class="bg-[#002244] text-white uppercase font-bold tracking-wider text-[11px]">
                  <tr>
                    <th scope="col" class="px-5 py-3.5 whitespace-nowrap">Application Ref &amp; Date</th>
                    <th scope="col" class="px-5 py-3.5">Scheme &amp; Department</th>
                    <th scope="col" class="px-5 py-3.5 whitespace-nowrap">Proposal Scope</th>
                    <th scope="col" class="px-5 py-3.5 whitespace-nowrap text-right">Treasury EMD Paid</th>
                    <th scope="col" class="px-5 py-3.5 text-center whitespace-nowrap">Status</th>
                    <th scope="col" class="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-slate-200 bg-white" *ngIf="getFiltered(allApps) as apps">
                  
                  <tr *ngFor="let app of apps" class="hover:bg-slate-50/80 transition-colors">
                    
                    <!-- Application Ref -->
                    <td class="px-5 py-4 whitespace-nowrap align-top">
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono font-bold text-[#002244] text-[12.5px]">
                          {{ app.id }}
                        </span>
                        <button 
                          (click)="copyRef(app.id)" 
                          [title]="copiedId === app.id ? 'Copied!' : 'Copy Reference ID'"
                          class="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition">
                          <svg *ngIf="copiedId !== app.id" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          <span *ngIf="copiedId === app.id" class="text-[10px] text-emerald-600 font-bold">✓</span>
                        </button>
                      </div>
                      <div class="text-[11px] text-slate-500 mt-1 font-mono flex items-center gap-1">
                        <svg class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>Applied: {{ app.appliedDate }}</span>
                      </div>
                    </td>

                    <!-- Scheme & Dept -->
                    <td class="px-5 py-4 max-w-sm align-top">
                      <div class="font-bold text-slate-900 leading-snug" [title]="app.schemeName">
                        {{ app.schemeName }}
                      </div>
                      <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span class="px-1.5 py-0.2 rounded-2xs bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[10px]">
                          {{ app.schemeId }}
                        </span>
                        <span>{{ app.department }}</span>
                      </div>
                    </td>

                    <!-- Proposal Scope -->
                    <td class="px-5 py-4 whitespace-nowrap text-slate-700 align-top">
                      <div class="font-medium text-xs">
                        {{ app.proposalDetails.targetCapacity }} Trainees Capacity
                      </div>
                      <div class="text-[11px] text-slate-500 mt-0.5">
                        {{ app.proposalDetails.proposedCentersCount }} Centers • {{ app.proposalDetails.proposedDistricts.length }} Districts
                      </div>
                    </td>

                    <!-- EMD Paid -->
                    <td class="px-5 py-4 whitespace-nowrap text-right align-top">
                      <div class="font-bold text-slate-900 text-sm">
                        ₹{{ app.emdPayment.totalPaid | number:'1.0-0' }}
                      </div>
                      <div class="mt-1 flex items-center justify-end gap-1.5 text-[10.5px]">
                        <span class="px-1.5 py-0.2 rounded-2xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase">
                          {{ app.emdPayment.paymentMethod }}
                        </span>
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]" [title]="app.emdPayment.txnReference">
                        {{ app.emdPayment.txnReference }}
                      </div>
                    </td>

                    <!-- Status -->
                    <td class="px-5 py-4 whitespace-nowrap text-center align-top">
                      <app-status-badge [status]="app.status"></app-status-badge>
                      <div *ngIf="app.status === 'UNDER_SCRUTINY'" class="text-[10.5px] text-amber-700 font-semibold mt-1">
                        {{ app.scrutinyDetails?.scrutinyStage || 'Scrutiny Stage 2' }}
                      </div>
                      <div *ngIf="app.status === 'APPROVED'" class="text-[10.5px] text-emerald-700 font-extrabold mt-1">
                        {{ app.scrutinyDetails?.assignedGrade || 'Grade A+ Awarded' }}
                      </div>
                      <div *ngIf="app.status === 'REJECTED'" class="text-[10px] text-rose-700 font-bold mt-1 max-w-[130px] truncate mx-auto" [title]="app.scrutinyDetails?.rejectionReason || 'Disqualified under RFP criteria'">
                        {{ app.scrutinyDetails?.rejectionReason || 'Criteria Ineligible' }}
                      </div>
                    </td>

                    <!-- Actions -->
                    <td class="px-5 py-4 whitespace-nowrap text-right align-top">
                      <div class="flex items-center justify-end gap-2 flex-wrap">
                        
                        <!-- Track Status (Always navigates to official tracker) -->
                        <a 
                          [routerLink]="['/eoi/tracker', app.id]"
                          class="px-3 py-1.5 bg-[#002244] hover:bg-[#003366] text-white rounded-xs text-xs font-bold shadow-2xs transition inline-flex items-center gap-1 cursor-pointer">
                          <span>Track Status</span>
                          <span>→</span>
                        </a>

                        <!-- Download Committee Resolution if Approved -->
                        <a 
                          *ngIf="app.status === 'APPROVED'"
                          [routerLink]="['/eoi/tracker', app.id]"
                          class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xs text-xs font-bold border border-emerald-300 transition inline-flex items-center gap-1 cursor-pointer"
                          title="View Signed Committee Empanelment Resolution">
                          <span>📜 Resolution</span>
                        </a>

                        <!-- Acknowledgement Receipt -->
                        <a 
                          [routerLink]="['/eoi/acknowledgement', app.id]"
                          class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs text-xs font-semibold border border-slate-200 transition inline-flex items-center gap-1 cursor-pointer"
                          title="View Treasury Acknowledgement Receipt">
                          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          <span class="hidden sm:inline">Receipt</span>
                        </a>

                      </div>
                    </td>

                  </tr>

                  <!-- Empty State (When no rows match filter/search) -->
                  <tr *ngIf="apps.length === 0">
                    <td colspan="6" class="px-5 py-14 text-center">
                      <div class="inline-flex flex-col items-center gap-3 text-slate-400">
                        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        </div>
                        <div>
                          <p class="font-bold text-slate-700 text-sm">No applications found</p>
                          <p class="text-xs text-slate-500 mt-1">
                            No submitted applications matched your selected filter or search keyword.
                          </p>
                        </div>
                        <button 
                          type="button" 
                          (click)="clearFilters()"
                          class="px-4 py-1.5 bg-[#002244] text-white rounded-xs text-xs font-bold hover:bg-[#003366] transition cursor-pointer">
                          Reset Filter
                        </button>
                      </div>
                    </td>
                  </tr>

                </tbody>

              </table>
            </div>

            <!-- Table Summary Footer -->
            <div class="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2" *ngIf="(history$ | async) as allApps">
              <div class="text-xs text-slate-600 font-mono">
                Showing {{ getFiltered(allApps).length }} of {{ allApps.length }} total submitted applications
              </div>
              <div class="text-xs text-slate-500">
                Department of Skill, Employment and Entrepreneurship • Government of Rajasthan
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  `
})
export class MyApplicationsComponent implements OnInit {
  history$!: Observable<EoiApplication[]>;
  activeFilter: AppFilter = 'ALL';
  searchKeyword: string = '';
  copiedId: string | null = null;

  filterTabs: { key: AppFilter; label: string }[] = [
    { key: 'ALL',            label: 'All' },
    { key: 'UNDER_SCRUTINY', label: 'Under Review' },
    { key: 'APPROVED',       label: 'Approved' },
    { key: 'REJECTED',       label: 'Rejected' },
    { key: 'DRAFT',          label: 'Drafts' },
  ];

  constructor(private eoiService: EoiStateService) {}

  ngOnInit(): void {
    this.history$ = this.eoiService.history$;
  }

  getFiltered(apps: EoiApplication[]): EoiApplication[] {
    let filtered = apps;

    if (this.activeFilter !== 'ALL') {
      filtered = filtered.filter(a => a.status === (this.activeFilter as EoiApplication['status']));
    }

    if (this.searchKeyword && this.searchKeyword.trim()) {
      const q = this.searchKeyword.trim().toLowerCase();
      filtered = filtered.filter(a => 
        a.id.toLowerCase().includes(q) ||
        a.schemeName.toLowerCase().includes(q) ||
        a.schemeId.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        (a.emdPayment?.txnReference && a.emdPayment.txnReference.toLowerCase().includes(q))
      );
    }

    return filtered;
  }

  getCount(filter: AppFilter): number {
    const snapshot = this.eoiService.getHistory();
    if (filter === 'ALL') return snapshot.length;
    return snapshot.filter(a => a.status === (filter as EoiApplication['status'])).length;
  }

  getTotalEmd(apps: EoiApplication[]): number {
    return apps.reduce((sum, a) => sum + (a.emdPayment?.totalPaid || 0), 0);
  }

  setFilter(f: AppFilter): void {
    this.activeFilter = f;
  }

  clearFilters(): void {
    this.activeFilter = 'ALL';
    this.searchKeyword = '';
  }

  copyRef(id: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        this.copiedId = id;
        setTimeout(() => {
          if (this.copiedId === id) this.copiedId = null;
        }, 2000);
      });
    }
  }
}
