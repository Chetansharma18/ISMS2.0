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
    <div class="font-sans max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      
      <!-- Page Header -->
      <admin-page-header 
        title="Super Admin Overview & EOI Control Center"
        subtitle="Real-time monitoring of State Expression of Interest tenders, master configurations, and scrutiny milestones"
        icon="dashboard">
        <div header-actions class="flex items-center gap-3">
          <a 
            routerLink="/admin/masters/schemes/create" 
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#002244] font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">account_balance</span>
            Add Scheme
          </a>
          <a 
            routerLink="/admin/eoi/create" 
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            Create New EOI
          </a>
        </div>
      </admin-page-header>

      <!-- 12 SUMMARY CARDS GRID (Enhanced with subtle gradients and crisp typography) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        
        <!-- Total Schemes -->
        <div class="bg-gradient-to-br from-white to-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#002244]/30 transition-all group">
          <div class="flex items-start justify-between text-slate-500 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Schemes</span>
            <div class="p-1.5 rounded-md bg-slate-100 text-[#002244] group-hover:bg-[#002244] group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
          </div>
          <div class="text-3xl font-black text-[#002244] tracking-tight">{{ summary().totalSchemes }}</div>
          <div class="text-[11px] text-emerald-700 font-bold mt-2 flex items-center gap-1 bg-emerald-50 w-fit px-2 py-0.5 rounded-sm border border-emerald-100">
            <span class="material-symbols-outlined text-[14px]">check_circle</span>
            {{ summary().activeSchemes }} Active
          </div>
        </div>

        <!-- Total EOIs -->
        <div class="bg-gradient-to-br from-white to-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#002244]/30 transition-all group">
          <div class="flex items-start justify-between text-slate-500 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Total EOIs</span>
            <div class="p-1.5 rounded-md bg-slate-100 text-[#002244] group-hover:bg-[#002244] group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">assignment</span>
            </div>
          </div>
          <div class="text-3xl font-black text-[#002244] tracking-tight">{{ summary().totalEOIs }}</div>
          <div class="text-[11px] text-slate-500 font-semibold mt-2 tracking-wide">Across 7 Schemes</div>
        </div>

        <!-- Open EOIs -->
        <div class="bg-gradient-to-br from-emerald-50 to-white p-4 sm:p-5 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all group">
          <div class="flex items-start justify-between text-emerald-800 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-emerald-700">Open EOIs</span>
            <div class="p-1.5 rounded-md bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">door_open</span>
            </div>
          </div>
          <div class="text-3xl font-black text-emerald-900 tracking-tight">{{ summary().openEOIs }}</div>
          <div class="text-[11px] text-emerald-700 font-bold mt-2 tracking-wide">Accepting Apps</div>
        </div>

        <!-- Published EOIs -->
        <div class="bg-gradient-to-br from-blue-50 to-white p-4 sm:p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group">
          <div class="flex items-start justify-between text-blue-800 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-blue-700">Published</span>
            <div class="p-1.5 rounded-md bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">public</span>
            </div>
          </div>
          <div class="text-3xl font-black text-blue-900 tracking-tight">{{ summary().publishedEOIs }}</div>
          <div class="text-[11px] text-blue-700 font-semibold mt-2 tracking-wide">Ready for Window</div>
        </div>

        <!-- Closed EOIs -->
        <div class="bg-gradient-to-br from-slate-100 to-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all group">
          <div class="flex items-start justify-between text-slate-600 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Closed EOIs</span>
            <div class="p-1.5 rounded-md bg-slate-200 text-slate-600 group-hover:bg-slate-600 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">lock</span>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-800 tracking-tight">{{ summary().closedEOIs }}</div>
          <div class="text-[11px] text-slate-600 font-semibold mt-2 tracking-wide">Under Scrutiny</div>
        </div>

        <!-- Rescheduled EOIs -->
        <div class="bg-gradient-to-br from-amber-50 to-white p-4 sm:p-5 rounded-xl border border-amber-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all group">
          <div class="flex items-start justify-between text-amber-800 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-amber-700">Rescheduled</span>
            <div class="p-1.5 rounded-md bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">update</span>
            </div>
          </div>
          <div class="text-3xl font-black text-amber-900 tracking-tight">{{ summary().rescheduledEOIs }}</div>
          <div class="text-[11px] text-amber-800 font-bold mt-2 tracking-wide">Corrigendum Issued</div>
        </div>

        <!-- Total Applications -->
        <div class="bg-gradient-to-br from-white to-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#002244]/30 transition-all group">
          <div class="flex items-start justify-between text-slate-500 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Apps</span>
            <div class="p-1.5 rounded-md bg-slate-100 text-[#002244] group-hover:bg-[#002244] group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">description</span>
            </div>
          </div>
          <div class="text-3xl font-black text-[#002244] tracking-tight">{{ summary().totalApplications }}</div>
          <div class="text-[11px] text-slate-500 font-semibold mt-2 tracking-wide">Aggregated Submissions</div>
        </div>

        <!-- Under Review -->
        <div class="bg-gradient-to-br from-indigo-50 to-white p-4 sm:p-5 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all group">
          <div class="flex items-start justify-between text-indigo-800 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-indigo-700">Under Review</span>
            <div class="p-1.5 rounded-md bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">rate_review</span>
            </div>
          </div>
          <div class="text-3xl font-black text-indigo-900 tracking-tight">{{ summary().underReview }}</div>
          <div class="text-[11px] text-indigo-700 font-semibold mt-2 tracking-wide">Committee Scoring</div>
        </div>

        <!-- Accepted -->
        <div class="bg-gradient-to-br from-emerald-50 to-white p-4 sm:p-5 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all group">
          <div class="flex items-start justify-between text-emerald-800 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-emerald-700">Accepted</span>
            <div class="p-1.5 rounded-md bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
          </div>
          <div class="text-3xl font-black text-emerald-900 tracking-tight">{{ summary().accepted }}</div>
          <div class="text-[11px] text-emerald-700 font-bold mt-2 tracking-wide">Empanelled PIAs</div>
        </div>

        <!-- Rejected -->
        <div class="bg-gradient-to-br from-rose-50 to-white p-4 sm:p-5 rounded-xl border border-rose-200 shadow-sm hover:shadow-md hover:border-rose-400 transition-all group">
          <div class="flex items-start justify-between text-rose-800 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-rose-700">Rejected</span>
            <div class="p-1.5 rounded-md bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">cancel</span>
            </div>
          </div>
          <div class="text-3xl font-black text-rose-900 tracking-tight">{{ summary().rejected }}</div>
          <div class="text-[11px] text-rose-700 font-semibold mt-2 tracking-wide">Criteria Ineligible</div>
        </div>

        <!-- Draft EOIs -->
        <div class="bg-gradient-to-br from-slate-100 to-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all group">
          <div class="flex items-start justify-between text-slate-500 mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Draft EOIs</span>
            <div class="p-1.5 rounded-md bg-slate-200 text-slate-600 group-hover:bg-slate-600 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">edit_note</span>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-700 tracking-tight">{{ summary().draftEOIs }}</div>
          <div class="text-[11px] text-slate-500 font-semibold mt-2 tracking-wide">In Configuration</div>
        </div>

        <!-- Fee Volume -->
        <div class="bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5 rounded-xl border border-sky-200 shadow-sm hover:shadow-md hover:border-sky-400 transition-all group relative overflow-hidden">
          <div class="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <span class="material-symbols-outlined text-[80px]">payments</span>
          </div>
          <div class="flex items-start justify-between text-sky-800 mb-2 relative z-10">
            <span class="text-[10px] font-black uppercase tracking-widest text-sky-700">Fee Volume</span>
            <div class="p-1.5 rounded-md bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div class="text-3xl font-black text-sky-900 tracking-tight relative z-10">₹1.25 L</div>
          <div class="text-[11px] text-sky-700 font-bold mt-2 tracking-wide relative z-10">e-Treasury Inflows</div>
        </div>
      </div>

      <!-- ===== 3-SLIDE TAB PANEL (Premium Design) ===== -->
      <div class="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200/80 overflow-hidden">

        <!-- Tab Headers -->
        <div class="flex border-b border-slate-200/60 bg-slate-50/50 p-2 gap-2">
          <button
            *ngFor="let tab of dashTabs; let i = index"
            (click)="activeTab.set(i)"
            class="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-bold transition-all rounded-lg cursor-pointer"
            [ngClass]="activeTab() === i
              ? 'bg-white text-[#002244] shadow-sm border border-slate-200/80'
              : 'text-slate-500 border border-transparent hover:text-slate-800 hover:bg-slate-100/80'">
            <span class="material-symbols-outlined text-[18px]" [ngClass]="activeTab() === i ? 'text-[#002244]' : 'text-slate-400'">{{ tab.icon }}</span>
            <span class="uppercase tracking-wider">{{ tab.label }}</span>
            <span *ngIf="tab.badge"
              class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              [ngClass]="activeTab() === i ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-200 text-slate-600'">
              {{ tab.badge }}
            </span>
          </button>
        </div>

        <!-- SLIDE 1: Recent EOIs -->
        <div *ngIf="activeTab() === 0" class="animate-fade-in">
          <div class="px-5 pt-5 pb-3 flex items-center justify-between">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Showing the most recent {{ eois().length }} EOIs published</p>
            <a routerLink="/admin/eoi" class="text-xs font-bold text-[#002244] hover:text-[#003366] hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 transition-colors">
              View All {{ eois().length }} EOIs &rarr;
            </a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600 border-collapse min-w-[900px]">
              <thead class="bg-slate-50 border-y border-slate-200/80 text-[#002244] font-black uppercase tracking-widest text-[10px]">
                <tr>
                  <th class="px-5 py-4 w-40">EOI Ref No.</th>
                  <th class="px-5 py-4 w-64">EOI Title / Dept</th>
                  <th class="px-5 py-4">Scheme</th>
                  <th class="px-5 py-4 text-center">Dates</th>
                  <th class="px-5 py-4 text-center">Apps</th>
                  <th class="px-5 py-4 text-center">Status</th>
                  <th class="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let e of eois()" class="hover:bg-blue-50/30 transition-colors group">
                  <td class="px-5 py-3.5 whitespace-nowrap">
                    <a [routerLink]="['/admin/eoi', e.id, 'details']" class="font-bold text-[#002244] text-[13px] hover:underline">{{ e.referenceNo }}</a>
                    <span class="text-[10px] text-slate-400 block font-bold tracking-wider mt-0.5">VERSION {{ e.version }}</span>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="font-bold text-slate-800 text-[13px] line-clamp-1" [title]="e.title">{{ e.title }}</div>
                    <div class="text-[11px] text-slate-500 truncate font-medium mt-0.5">{{ e.department }}</div>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="font-bold text-slate-700 text-xs">{{ e.schemeName }}</div>
                    <div class="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{{ e.eoiCategory }}</div>
                  </td>
                  <td class="px-5 py-3.5 text-center whitespace-nowrap">
                    <div class="text-[11px] font-medium text-slate-500">Pub: {{ e.publishedDate }}</div>
                    <div class="text-[11px] font-bold mt-0.5" [ngClass]="{'text-amber-700': e.status === 'OPEN', 'text-slate-700': e.status !== 'OPEN'}">Close: {{ e.closingDate }}</div>
                  </td>
                  <td class="px-5 py-3.5 text-center">
                    <span class="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-black bg-[#002244]/10 text-[#002244] border border-[#002244]/20">
                      {{ e.applicationCount }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-center whitespace-nowrap">
                    <admin-status-badge [status]="e.status"></admin-status-badge>
                  </td>
                  <td class="px-5 py-3.5 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <a [routerLink]="['/admin/eoi', e.id, 'details']" class="p-1.5 text-slate-500 hover:text-[#002244] hover:bg-slate-100 rounded-md transition-colors" title="View Details">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                      </a>
                      <a [routerLink]="['/admin/eoi', e.id, 'form-builder']" class="p-1.5 text-slate-500 hover:text-[#002244] hover:bg-slate-100 rounded-md transition-colors" title="Form Builder">
                        <span class="material-symbols-outlined text-[18px]">format_shapes</span>
                      </a>
                      <a [routerLink]="['/admin/eoi', e.id, 'responses']" class="p-1.5 text-slate-500 hover:text-[#002244] hover:bg-slate-100 rounded-md transition-colors" title="Responses">
                        <span class="material-symbols-outlined text-[18px]">fact_check</span>
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-5 py-3.5 border-t border-slate-200/80 text-right bg-slate-50">
            <a routerLink="/admin/eoi" class="text-xs font-bold text-[#002244] hover:underline uppercase tracking-wider">Manage All EOIs &rarr;</a>
          </div>
        </div>

        <!-- SLIDE 2: Analytics -->
        <div *ngIf="activeTab() === 1" class="p-6 animate-fade-in">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            <!-- Applications by Scheme -->
            <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
              <h3 class="text-[11px] font-black text-[#002244] uppercase tracking-widest flex items-center gap-2 mb-6">
                <span class="p-1.5 rounded-md bg-blue-50 text-blue-700">
                  <span class="material-symbols-outlined text-[18px] block">pie_chart</span>
                </span>
                Apps by Scheme
                <span class="ml-auto text-[11px] font-black text-[#002244] bg-slate-100 px-2 py-0.5 rounded-sm">97 Total</span>
              </h3>
              <div class="space-y-4">
                <div *ngFor="let s of schemeStats">
                  <div class="flex justify-between text-xs font-bold mb-1.5 text-slate-700">
                    <span class="truncate pr-2">{{ s.name }}</span>
                    <span class="font-black text-slate-900 shrink-0">{{ s.count }} ({{ s.pct }}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                    <div class="h-full rounded-full transition-all duration-1000 ease-out" [style.width]="s.pct + '%'" [ngClass]="s.color"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Evaluation Pipeline -->
            <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 opacity-50"></div>
              <h3 class="text-[11px] font-black text-[#002244] uppercase tracking-widest flex items-center gap-2 mb-6">
                <span class="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
                  <span class="material-symbols-outlined text-[18px] block">bar_chart</span>
                </span>
                Evaluation Pipeline
                <span class="ml-auto text-[11px] font-bold text-slate-500">Ratio</span>
              </h3>
              <div class="space-y-4">
                <div *ngFor="let p of pipelineStats">
                  <div class="flex justify-between text-xs font-bold mb-1.5 text-slate-700">
                    <span class="truncate pr-2">{{ p.name }}</span>
                    <span class="font-black shrink-0" [ngClass]="p.labelColor">{{ p.count }} ({{ p.pct }}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                    <div class="h-full rounded-full transition-all duration-1000 ease-out" [style.width]="p.pct + '%'" [ngClass]="p.color"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- EOIs Closing Soon -->
            <div class="bg-white p-5 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 opacity-50"></div>
              <h3 class="text-[11px] font-black text-[#002244] uppercase tracking-widest flex items-center gap-2 mb-5">
                <span class="p-1.5 rounded-md bg-amber-100 text-amber-700">
                  <span class="material-symbols-outlined text-[18px] block">alarm</span>
                </span>
                EOIs Closing Soon
                <span class="ml-auto text-[10px] font-black text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-sm border border-amber-300">ACTION</span>
              </h3>
              <div class="space-y-4 divide-y divide-slate-100">
                <div class="pt-2 first:pt-0">
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <a routerLink="/admin/eoi/EOI-2025-003/details" class="text-[13px] font-black text-[#002244] hover:text-[#003366] hover:underline line-clamp-1">
                        SAKSHAM Rural Women Entrepreneurship
                      </a>
                      <p class="text-[11px] text-slate-500 font-medium mt-0.5">Ref: RSLDC/EOI/2025-26/003</p>
                    </div>
                    <admin-status-badge status="OPEN"></admin-status-badge>
                  </div>
                  <div class="flex items-center justify-between text-[11.5px] mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span class="text-amber-700 font-bold flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px]">event</span>
                      15-04-2025
                    </span>
                    <span class="font-bold text-slate-700">29 Apps</span>
                    <a routerLink="/admin/eoi/EOI-2025-003/reschedule" class="text-[#002244] font-black hover:underline uppercase tracking-wider text-[10px]">Extend</a>
                  </div>
                </div>
                <div class="pt-4">
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <a routerLink="/admin/eoi/EOI-2025-004/details" class="text-[13px] font-black text-[#002244] hover:text-[#003366] hover:underline line-clamp-1">
                        SAMARTH Divyangjan Skilling
                      </a>
                      <p class="text-[11px] text-slate-500 font-medium mt-0.5">Ref: RSLDC/EOI/2025-26/004</p>
                    </div>
                    <admin-status-badge status="PUBLISHED"></admin-status-badge>
                  </div>
                  <div class="flex items-center justify-between text-[11.5px] mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span class="text-slate-600 font-bold flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px]">event</span>
                      30-05-2025
                    </span>
                    <span class="font-bold text-slate-700">8 Apps</span>
                    <a routerLink="/admin/eoi/EOI-2025-004/reschedule" class="text-[#002244] font-black hover:underline uppercase tracking-wider text-[10px]">Extend</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SLIDE 3: Audit Trail -->
        <div *ngIf="activeTab() === 2" class="animate-fade-in">
          <div class="px-5 pt-5 pb-3 flex items-center justify-between">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last {{ recentLogs().length }} admin actions in real-time</p>
            <a routerLink="/admin/audit-logs" class="text-xs font-bold text-[#002244] hover:text-[#003366] hover:underline flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-md transition-colors">
              Full Audit Log &rarr;
            </a>
          </div>
          <div class="divide-y divide-slate-100">
            <div *ngFor="let log of recentLogs()" class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
              <div class="flex items-start gap-3.5">
                <div class="w-10 h-10 rounded-full bg-[#002244]/5 border border-[#002244]/15 flex items-center justify-center text-[#002244] shrink-0 mt-0.5 shadow-sm">
                  <span class="material-symbols-outlined text-[20px]">security</span>
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span class="text-[13px] font-black text-[#002244]">{{ log.action }}</span>
                    <span class="px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">{{ log.module }}</span>
                    <span *ngIf="log.eoiId" class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100">Ref: {{ log.eoiId }}</span>
                  </div>
                  <p class="text-[12px] font-medium text-slate-600 leading-relaxed">{{ log.newValue || log.reason }}</p>
                  <div class="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">person</span> {{ log.user }} ({{ log.role }})</span>
                    <span>&bull;</span>
                    <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">router</span> {{ log.ipAddress }}</span>
                  </div>
                </div>
              </div>
              <div class="text-right shrink-0 sm:self-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <span class="text-[12px] font-black text-[#002244] block">{{ log.timestamp | date:'dd MMM yyyy' }}</span>
                <span class="text-[11px] text-slate-500 font-bold mt-0.5 block">{{ log.timestamp | date:'HH:mm:ss' }}</span>
              </div>
            </div>
          </div>
          <div class="px-5 py-3.5 border-t border-slate-200/80 text-right bg-slate-50">
            <a routerLink="/admin/audit-logs" class="text-xs font-bold text-[#002244] hover:underline uppercase tracking-wider">View Full Audit Archive &rarr;</a>
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
