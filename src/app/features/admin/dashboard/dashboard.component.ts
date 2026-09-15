import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EoiService } from '../core/services/eoi.service';
import { AuditService } from '../core/services/audit.service';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { DashboardSummary, EoiItem, AuditLog } from '../core/models/admin.models';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    PageHeaderComponent, 
    StatusBadgeComponent
  ],
  template: `
    <div class="font-sans">
      <!-- Page Header -->
      <admin-page-header 
        title="Super Admin Overview & EOI Control Center"
        subtitle="Real-time monitoring of State Expression of Interest tenders, master configurations, and scrutiny milestones"
        icon="dashboard">
        <div header-actions class="flex items-center gap-2">
          <a 
            routerLink="/admin/eoi/create" 
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs rounded-xs shadow-xs transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            Create New EOI
          </a>
          <a 
            routerLink="/admin/masters/schemes/create" 
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-[#002244] font-bold text-xs rounded-xs shadow-2xs transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">account_balance</span>
            Add Scheme
          </a>
        </div>
      </admin-page-header>

      <!-- 12 SUMMARY CARDS GRID -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <!-- Schemes -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-slate-200 shadow-2xs hover:border-[#002244]/40 transition-all">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Total Schemes</span>
            <span class="material-symbols-outlined text-[#002244] text-[18px]">account_balance</span>
          </div>
          <div class="text-2xl font-black text-[#002244]">{{ summary().totalSchemes }}</div>
          <div class="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">check_circle</span>
            {{ summary().activeSchemes }} Active in State
          </div>
        </div>

        <!-- Total EOIs -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-slate-200 shadow-2xs hover:border-[#002244]/40 transition-all">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Total EOIs</span>
            <span class="material-symbols-outlined text-[#002244] text-[18px]">assignment</span>
          </div>
          <div class="text-2xl font-black text-[#002244]">{{ summary().totalEOIs }}</div>
          <div class="text-[10px] text-slate-500 font-medium mt-1">Across 7 Schemes</div>
        </div>

        <!-- Open EOIs -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-emerald-200 bg-emerald-50/20 shadow-2xs hover:border-emerald-400 transition-all">
          <div class="flex items-center justify-between text-emerald-800 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Open EOIs</span>
            <span class="material-symbols-outlined text-emerald-600 text-[18px]">door_open</span>
          </div>
          <div class="text-2xl font-black text-emerald-900">{{ summary().openEOIs }}</div>
          <div class="text-[10px] text-emerald-700 font-bold mt-1">Accepting Applications</div>
        </div>

        <!-- Published EOIs -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-slate-200 shadow-2xs hover:border-[#002244]/40 transition-all">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Published</span>
            <span class="material-symbols-outlined text-[#002244] text-[18px]">public</span>
          </div>
          <div class="text-2xl font-black text-[#002244]">{{ summary().publishedEOIs }}</div>
          <div class="text-[10px] text-[#002244] font-medium mt-1">Ready for Window</div>
        </div>

        <!-- Closed EOIs -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-slate-200 shadow-2xs hover:border-slate-400 transition-all">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Closed EOIs</span>
            <span class="material-symbols-outlined text-zinc-600 text-[18px]">lock</span>
          </div>
          <div class="text-2xl font-black text-slate-800">{{ summary().closedEOIs }}</div>
          <div class="text-[10px] text-zinc-600 font-medium mt-1">Under Scrutiny</div>
        </div>

        <!-- Rescheduled EOIs -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-amber-200 bg-amber-50/20 shadow-2xs hover:border-amber-400 transition-all">
          <div class="flex items-center justify-between text-amber-800 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Rescheduled</span>
            <span class="material-symbols-outlined text-amber-600 text-[18px]">update</span>
          </div>
          <div class="text-2xl font-black text-amber-900">{{ summary().rescheduledEOIs }}</div>
          <div class="text-[10px] text-amber-800 font-bold mt-1">Corrigendum Issued</div>
        </div>

        <!-- Total Applications -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-slate-200 shadow-2xs hover:border-[#002244]/40 transition-all">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Total Apps</span>
            <span class="material-symbols-outlined text-[#002244] text-[18px]">description</span>
          </div>
          <div class="text-2xl font-black text-[#002244]">{{ summary().totalApplications }}</div>
          <div class="text-[10px] text-slate-600 font-medium mt-1">Aggregated Submissions</div>
        </div>

        <!-- Under Review -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-slate-200 shadow-2xs hover:border-[#002244]/40 transition-all">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Under Review</span>
            <span class="material-symbols-outlined text-[#002244] text-[18px]">rate_review</span>
          </div>
          <div class="text-2xl font-black text-[#002244]">{{ summary().underReview }}</div>
          <div class="text-[10px] text-blue-700 font-medium mt-1">Committee Scoring</div>
        </div>

        <!-- Accepted -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-emerald-200 bg-emerald-50/10 shadow-2xs hover:border-emerald-400 transition-all">
          <div class="flex items-center justify-between text-emerald-800 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Accepted</span>
            <span class="material-symbols-outlined text-emerald-600 text-[18px]">task_alt</span>
          </div>
          <div class="text-2xl font-black text-emerald-800">{{ summary().accepted }}</div>
          <div class="text-[10px] text-emerald-700 font-bold mt-1">Empanelled PIAs</div>
        </div>

        <!-- Rejected -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-rose-200 bg-rose-50/10 shadow-2xs hover:border-rose-400 transition-all">
          <div class="flex items-center justify-between text-rose-800 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Rejected</span>
            <span class="material-symbols-outlined text-rose-600 text-[18px]">cancel</span>
          </div>
          <div class="text-2xl font-black text-rose-800">{{ summary().rejected }}</div>
          <div class="text-[10px] text-rose-700 font-medium mt-1">Criteria Ineligible</div>
        </div>

        <!-- Draft EOIs -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-slate-200 shadow-2xs hover:border-slate-400 transition-all">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Draft EOIs</span>
            <span class="material-symbols-outlined text-slate-400 text-[18px]">edit_note</span>
          </div>
          <div class="text-2xl font-black text-slate-700">{{ summary().draftEOIs }}</div>
          <div class="text-[10px] text-slate-500 font-medium mt-1">In Configuration</div>
        </div>

        <!-- Fee Volume -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xs border border-blue-200 bg-blue-50/20 shadow-2xs hover:border-blue-400 transition-all">
          <div class="flex items-center justify-between text-[#002244] mb-1">
            <span class="text-[10.5px] font-bold uppercase tracking-wider">Fee Volume</span>
            <span class="material-symbols-outlined text-[#002244] text-[18px]">payments</span>
          </div>
          <div class="text-2xl font-black text-[#002244]">₹1.25 L</div>
          <div class="text-[10px] text-[#002244] font-medium mt-1">e-Treasury Inflows</div>
        </div>
      </div>

      <!-- ===== 3-SLIDE TAB PANEL ===== -->
      <div class="bg-white rounded-xs shadow-2xs border border-slate-200 overflow-hidden">

        <!-- Tab Headers -->
        <div class="flex border-b border-slate-200 bg-slate-50/70">
          <button
            *ngFor="let tab of dashTabs; let i = index"
            (click)="activeTab.set(i)"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer"
            [ngClass]="activeTab() === i
              ? 'text-[#002244] border-[#002244] bg-white'
              : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'">
            <span class="material-symbols-outlined text-[17px]">{{ tab.icon }}</span>
            {{ tab.label }}
            <span *ngIf="tab.badge"
              class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              [ngClass]="activeTab() === i ? 'bg-[#002244]/10 text-[#002244]' : 'bg-slate-200 text-slate-600'">
              {{ tab.badge }}
            </span>
          </button>
        </div>

        <!-- SLIDE 1: Recent EOIs -->
        <div *ngIf="activeTab() === 0">
          <div class="px-4 pt-4 pb-2 flex items-center justify-between">
            <p class="text-[11px] text-slate-500">Showing the most recent {{ eois().length }} EOIs published on the portal</p>
            <a routerLink="/admin/eoi" class="text-xs font-bold text-[#002244] hover:underline flex items-center gap-1">
              View All {{ eois().length }} EOIs &rarr;
            </a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600 border-collapse min-w-[800px]">
              <thead class="bg-slate-50 border-y border-slate-200 text-[#002244] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th class="px-4 py-3">EOI Ref No.</th>
                  <th class="px-4 py-3">EOI Title</th>
                  <th class="px-4 py-3">Scheme</th>
                  <th class="px-4 py-3">Category</th>
                  <th class="px-4 py-3">Published Date</th>
                  <th class="px-4 py-3">Closing Date</th>
                  <th class="px-4 py-3 text-center">Applications</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Committee</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let e of eois()" class="hover:bg-slate-50/80 transition-colors">
                  <td class="px-4 py-3 font-bold text-[#002244] whitespace-nowrap">
                    <a [routerLink]="['/admin/eoi', e.id, 'details']" class="hover:underline">{{ e.referenceNo }}</a>
                    <span class="text-[10px] text-slate-400 block font-normal">v{{ e.version }}</span>
                  </td>
                  <td class="px-4 py-3 max-w-xs">
                    <div class="font-bold text-slate-900 line-clamp-1" [title]="e.title">{{ e.title }}</div>
                    <div class="text-[11px] text-slate-500 truncate">{{ e.department }}</div>
                  </td>
                  <td class="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{{ e.schemeName }}</td>
                  <td class="px-4 py-3 text-slate-600 whitespace-nowrap">{{ e.eoiCategory }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-slate-600">{{ e.publishedDate }}</td>
                  <td class="px-4 py-3 font-medium whitespace-nowrap" [ngClass]="{'text-amber-800 font-bold': e.status === 'OPEN'}">{{ e.closingDate }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#002244]/10 text-[#002244] border border-[#002244]/20">{{ e.applicationCount }}</span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap"><admin-status-badge [status]="e.status"></admin-status-badge></td>
                  <td class="px-4 py-3 max-w-[140px] truncate text-slate-600" [title]="e.committeeName || 'Unassigned'">{{ e.committeeName || 'Unassigned' }}</td>
                  <td class="px-4 py-3 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                      <a [routerLink]="['/admin/eoi', e.id, 'details']" class="p-1 text-slate-500 hover:text-[#002244] hover:bg-slate-100 rounded-xs" title="View Details">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                      </a>
                      <a [routerLink]="['/admin/eoi', e.id, 'form-builder']" class="p-1 text-slate-500 hover:text-[#002244] hover:bg-slate-100 rounded-xs" title="Form Builder">
                        <span class="material-symbols-outlined text-[18px]">format_shapes</span>
                      </a>
                      <a [routerLink]="['/admin/eoi', e.id, 'responses']" class="p-1 text-slate-500 hover:text-[#002244] hover:bg-slate-100 rounded-xs" title="Responses">
                        <span class="material-symbols-outlined text-[18px]">fact_check</span>
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-4 py-3 border-t border-slate-100 text-right bg-slate-50/50">
            <a routerLink="/admin/eoi" class="text-xs font-bold text-[#002244] hover:underline">Manage All EOIs &rarr;</a>
          </div>
        </div>

        <!-- SLIDE 2: Analytics -->
        <div *ngIf="activeTab() === 1" class="p-5">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Applications by Scheme -->
            <div class="bg-slate-50/60 p-4 rounded-xs border border-slate-200">
              <h3 class="text-xs font-bold text-[#002244] uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <span class="material-symbols-outlined text-[#002244] text-[18px]">pie_chart</span>
                Applications by Scheme
                <span class="ml-auto text-[11px] font-bold text-[#002244]">97 Total</span>
              </h3>
              <div class="space-y-3">
                <div *ngFor="let s of schemeStats">
                  <div class="flex justify-between text-xs font-medium mb-1 text-slate-700">
                    <span>{{ s.name }}</span>
                    <span class="font-bold text-slate-900">{{ s.count }} ({{ s.pct }}%)</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all" [style.width]="s.pct + '%'" [ngClass]="s.color"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Evaluation Pipeline -->
            <div class="bg-slate-50/60 p-4 rounded-xs border border-slate-200">
              <h3 class="text-xs font-bold text-[#002244] uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <span class="material-symbols-outlined text-[#002244] text-[18px]">bar_chart</span>
                Evaluation Pipeline
                <span class="ml-auto text-[11px] text-slate-500">Pipeline Ratio</span>
              </h3>
              <div class="space-y-3">
                <div *ngFor="let p of pipelineStats">
                  <div class="flex justify-between text-xs font-medium mb-1 text-slate-700">
                    <span>{{ p.name }}</span>
                    <span class="font-bold" [ngClass]="p.labelColor">{{ p.count }} ({{ p.pct }}%)</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="h-2 rounded-full" [style.width]="p.pct + '%'" [ngClass]="p.color"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- EOIs Closing Soon -->
            <div class="bg-slate-50/60 p-4 rounded-xs border border-slate-200">
              <h3 class="text-xs font-bold text-[#002244] uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <span class="material-symbols-outlined text-amber-600 text-[18px]">alarm</span>
                EOIs Closing Soon
                <span class="ml-auto text-[10.5px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-2xs border border-amber-300">Action Needed</span>
              </h3>
              <div class="space-y-3 divide-y divide-slate-200">
                <div class="pt-2 first:pt-0">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <a routerLink="/admin/eoi/EOI-2025-003/details" class="text-xs font-bold text-[#002244] hover:underline line-clamp-1">
                        SAKSHAM Rural Women Entrepreneurship EOI
                      </a>
                      <p class="text-[11px] text-slate-500 mt-0.5">Ref: RSLDC/EOI/2025-26/003</p>
                    </div>
                    <admin-status-badge status="OPEN"></admin-status-badge>
                  </div>
                  <div class="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                    <span class="text-amber-800 font-bold flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">event</span>
                      Closes: 15-04-2025
                    </span>
                    <span>29 Applications</span>
                    <a routerLink="/admin/eoi/EOI-2025-003/reschedule" class="text-[#002244] font-bold hover:underline">Reschedule</a>
                  </div>
                </div>
                <div class="pt-3">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <a routerLink="/admin/eoi/EOI-2025-004/details" class="text-xs font-bold text-[#002244] hover:underline line-clamp-1">
                        SAMARTH Divyangjan Vocational Skilling
                      </a>
                      <p class="text-[11px] text-slate-500 mt-0.5">Ref: RSLDC/EOI/2025-26/004</p>
                    </div>
                    <admin-status-badge status="PUBLISHED"></admin-status-badge>
                  </div>
                  <div class="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                    <span class="text-slate-700 font-semibold flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">event</span>
                      Closes: 30-05-2025
                    </span>
                    <span>8 Applications</span>
                    <a routerLink="/admin/eoi/EOI-2025-004/reschedule" class="text-[#002244] font-bold hover:underline">Reschedule</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SLIDE 3: Audit Trail -->
        <div *ngIf="activeTab() === 2">
          <div class="px-4 pt-4 pb-2 flex items-center justify-between">
            <p class="text-[11px] text-slate-500">Showing the last {{ recentLogs().length }} admin actions in real-time</p>
            <a routerLink="/admin/audit-logs" class="text-xs font-bold text-[#002244] hover:underline">View Complete Audit Log &rarr;</a>
          </div>
          <div class="divide-y divide-slate-100">
            <div *ngFor="let log of recentLogs()" class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-xs bg-[#002244]/5 border border-[#002244]/15 flex items-center justify-center text-[#002244] shrink-0 mt-0.5">
                  <span class="material-symbols-outlined text-[18px]">security</span>
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-bold text-slate-900">{{ log.action }}</span>
                    <span class="px-2 py-0.5 rounded-2xs text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{{ log.module }}</span>
                    <span *ngIf="log.eoiId" class="text-[11px] font-bold text-[#002244]">Ref: {{ log.eoiId }}</span>
                  </div>
                  <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">{{ log.newValue || log.reason }}</p>
                  <p class="text-[10px] text-slate-400 mt-0.5">User: {{ log.user }} ({{ log.role }}) &bull; IP: {{ log.ipAddress }}</p>
                </div>
              </div>
              <div class="text-right shrink-0 sm:self-center">
                <span class="text-[11px] font-medium text-slate-500 block">{{ log.timestamp | date:'dd-MM-yyyy' }}</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ log.timestamp | date:'HH:mm:ss' }}</span>
              </div>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-slate-100 text-right bg-slate-50/50">
            <a routerLink="/admin/audit-logs" class="text-xs font-bold text-[#002244] hover:underline">View Full Audit Log &rarr;</a>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private eoiService = inject(EoiService);
  private auditService = inject(AuditService);

  activeTab = signal<number>(0);

  readonly dashTabs = [
    { label: 'EOI Activity', icon: 'assignment', badge: '' },
    { label: 'Analytics', icon: 'bar_chart', badge: '' },
    { label: 'Audit Trail', icon: 'manage_history', badge: '' }
  ];

  readonly schemeStats = [
    { name: 'MMKVY (Mukhya Mantri Kaushal)', count: 42, pct: 43, color: 'bg-[#002244]' },
    { name: 'SAKSHAM (Women Empowerment)', count: 29, pct: 30, color: 'bg-[#003366]' },
    { name: 'RAJKVIK RPL (Artisans)', count: 18, pct: 19, color: 'bg-emerald-600' },
    { name: 'SAMARTH (Divyangjan)', count: 8, pct: 8, color: 'bg-amber-600' },
  ];

  readonly pipelineStats = [
    { name: 'Accepted / Empanelled', count: 46, pct: 47, color: 'bg-emerald-500', labelColor: 'text-emerald-700' },
    { name: 'Technical Committee Review', count: 28, pct: 29, color: 'bg-[#002244]', labelColor: 'text-[#002244]' },
    { name: 'Rejected / Non-Compliant', count: 14, pct: 14, color: 'bg-rose-500', labelColor: 'text-rose-700' },
    { name: 'Draft / Payment Pending', count: 9, pct: 10, color: 'bg-amber-500', labelColor: 'text-amber-700' },
  ];

  summary = signal<DashboardSummary>({
    totalSchemes: 7,
    activeSchemes: 7,
    totalEOIs: 5,
    draftEOIs: 1,
    publishedEOIs: 1,
    openEOIs: 2,
    closedEOIs: 1,
    rescheduledEOIs: 1,
    totalApplications: 97,
    underReview: 28,
    accepted: 46,
    rejected: 14
  });

  eois = signal<EoiItem[]>([]);
  recentLogs = signal<AuditLog[]>([]);

  ngOnInit(): void {
    this.eoiService.getDashboardSummary().subscribe(s => this.summary.set(s));
    this.eoiService.getEois().subscribe(list => this.eois.set(list));
    this.auditService.getAuditLogs().subscribe(logs => this.recentLogs.set(logs.slice(0, 5)));
  }
}
