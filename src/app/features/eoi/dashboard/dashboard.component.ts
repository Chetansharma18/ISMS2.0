import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';
import { EoiStateService, EoiApplication, UserProfile } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { GradeBadgeComponent } from '../../../shared/components/grade-badge/grade-badge.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, AsyncPipe, DecimalPipe, HeaderComponent, SidebarComponent, StatusBadgeComponent, GradeBadgeComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-paper-50 font-sans">
      <app-header></app-header>

      <div class="flex flex-grow">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block"></app-sidebar>

        <main class="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-y-auto">
        
        <!-- Header & Top TP Profile Banner -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-line-200 mb-8" *ngIf="userProfile$ | async as profile">
          <div>
            <div class="text-xs font-semibold text-seal-600 uppercase tracking-wider">Official Technical Partner Portal</div>
            <h1 class="text-2xl sm:text-3xl font-serif font-bold text-ink-900 leading-tight">Technical Partner (TP) Dashboard</h1>
            <p class="text-xs text-muted-500 mt-1">Manage active empanelment sanctions, inspection targets, center accreditations, and submit new tenders.</p>
          </div>

          <div class="flex items-center gap-3">
            <a routerLink="/schemes" class="px-5 py-2.5 bg-seal-600 text-surface-0 font-semibold text-xs hover:bg-[#9B4523] transition-colors inline-flex items-center gap-2">
              <span>+ Apply for New Scheme</span>
            </a>
          </div>
        </div>

        <!-- TP Master Identity Card (Official Seal Tone) -->
        <div class="bg-surface-0 border border-line-200 p-6 mb-8" *ngIf="userProfile$ | async as profile">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div class="flex items-center gap-5">
              <!-- Large Grade Badge -->
              <app-grade-badge [grade]="profile.tpGrade || 'A'" size="lg"></app-grade-badge>

              <div>
                <div class="text-xs font-mono text-muted-500 uppercase tracking-wider">TP Empanelment ID: TP-IND-2026-042</div>
                <h2 class="text-xl font-serif font-bold text-ink-900">{{ profile.organization.name }}</h2>
                <div class="text-xs text-ink-700 mt-0.5">
                  PAN: {{ profile.organization.pan }} • GSTIN: {{ profile.organization.gstin }} • Signatory: {{ profile.personal.fullName }}
                </div>
              </div>
            </div>

            <!-- Accreditation Validity -->
            <div class="bg-paper-50 border border-line-200 p-3 text-xs text-right min-w-[200px]">
              <div class="text-[11px] text-muted-500 uppercase">Empanelment Validity</div>
              <div class="font-bold text-ink-900 mt-0.5">Through 31 Mar 2029</div>
              <div class="text-[11px] text-approve-700 font-medium mt-0.5">● Grade A Standing Active</div>
            </div>
          </div>
        </div>

        <!-- Summary KPI Metrics Tiles -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <!-- Tile 1: Active Empanelments -->
          <div class="bg-surface-0 border border-line-200 p-5">
            <div class="text-xs text-muted-500 font-medium uppercase tracking-wider">Active Empanelments</div>
            <div class="text-2xl font-serif font-bold text-ink-900 mt-1 tabular-nums">2 Schemes</div>
            <div class="text-[11px] text-approve-700 mt-1">● Sanctions in good standing</div>
          </div>

          <!-- Tile 2: Allocated Targets -->
          <div class="bg-surface-0 border border-line-200 p-5">
            <div class="text-xs text-muted-500 font-medium uppercase tracking-wider">Sanctioned Units / Targets</div>
            <div class="text-2xl font-serif font-bold text-ink-900 mt-1 tabular-nums">750 Units</div>
            <div class="text-[11px] text-ink-700 mt-1">450 Infrastructure + 300 Skill</div>
          </div>

          <!-- Tile 3: Accredited Centers -->
          <div class="bg-surface-0 border border-line-200 p-5">
            <div class="text-xs text-muted-500 font-medium uppercase tracking-wider">Sanctioned Centers</div>
            <div class="text-2xl font-serif font-bold text-ink-900 mt-1 tabular-nums">5 Centers</div>
            <div class="text-[11px] text-muted-500 mt-1">Across 6 regional clusters</div>
          </div>

          <!-- Tile 4: Total EMD Security -->
          <div class="bg-surface-0 border border-line-200 p-5">
            <div class="text-xs text-muted-500 font-medium uppercase tracking-wider">Active EMD On Deposit</div>
            <div class="text-2xl font-serif font-bold text-ink-900 mt-1 tabular-nums">₹85,000</div>
            <div class="text-[11px] text-muted-500 mt-1">Held with Govt Treasury</div>
          </div>

        </div>

        <!-- Application History & Empanelment Record Table -->
        <div class="bg-surface-0 border border-line-200 p-6 sm:p-8">
          <div class="flex justify-between items-center pb-4 border-b border-line-200 mb-6">
            <div>
              <h3 class="font-serif font-bold text-base text-ink-900">Empanelment Portfolio & Application History</h3>
              <p class="text-xs text-muted-500 mt-0.5">Comprehensive audit trail of all Expression of Interest applications filed under this organization.</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-line-200 text-left text-xs">
              <thead class="bg-paper-50 font-semibold text-ink-900">
                <tr>
                  <th scope="col" class="px-4 py-3">Application Ref</th>
                  <th scope="col" class="px-4 py-3">Scheme Name</th>
                  <th scope="col" class="px-4 py-3 text-center">Applied Date</th>
                  <th scope="col" class="px-4 py-3 text-right">EMD Security (₹)</th>
                  <th scope="col" class="px-4 py-3 text-center">Status</th>
                  <th scope="col" class="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line-200 bg-surface-0">
                <tr *ngFor="let app of history$ | async" class="hover:bg-paper-50/70 transition-colors">
                  <td class="px-4 py-3.5 font-mono font-semibold text-seal-600 whitespace-nowrap">
                    {{ app.id }}
                  </td>
                  <td class="px-4 py-3.5 text-ink-900 font-medium max-w-sm truncate" [title]="app.schemeName">
                    {{ app.schemeName }}
                  </td>
                  <td class="px-4 py-3.5 text-center text-ink-700 tabular-nums whitespace-nowrap">
                    {{ app.appliedDate }}
                  </td>
                  <td class="px-4 py-3.5 text-right font-medium text-ink-900 tabular-nums">
                    ₹{{ app.emdPayment.totalPaid | number:'1.0-0' }}
                  </td>
                  <td class="px-4 py-3.5 text-center whitespace-nowrap">
                    <app-status-badge [status]="app.status"></app-status-badge>
                  </td>
                  <td class="px-4 py-3.5 text-right whitespace-nowrap">
                    <a [routerLink]="['/eoi/tracker', app.id]" class="text-seal-600 hover:underline font-semibold text-xs">
                      View Details →
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        </main>
      </div>

    </div>
  `







































































})
export class DashboardComponent implements OnInit {
  userProfile$!: Observable<UserProfile>;
  history$!: Observable<EoiApplication[]>;

  constructor(private eoiService: EoiStateService) {}

  ngOnInit(): void {
    this.userProfile$ = this.eoiService.userProfile$;
    this.history$ = this.eoiService.history$;
  }
}
