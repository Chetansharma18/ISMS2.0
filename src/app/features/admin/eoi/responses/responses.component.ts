import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EoiService } from '../../core/services/eoi.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EoiItem, ApplicationItem } from '../../core/models/admin.models';

@Component({
  selector: 'admin-eoi-responses',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    PageHeaderComponent, 
    StatusBadgeComponent
  ],
  template: `
    <div class="font-sans text-slate-800">
      <admin-page-header 
        [title]="'EOI Submissions & Detailed Profile Registry: ' + (eoi()?.referenceNo || eoiId)"
        subtitle="Departmental scrutiny portal: View responses, evaluate detailed profiles, award technical grading, and record committee decisions"
        icon="fact_check"
        [breadcrumbs]="[
          { label: 'EOI Management', url: '/admin/eoi' },
          { label: 'Responses' }
        ]">
        <div header-actions class="flex items-center gap-2 flex-wrap">
          <!-- Force Close Button if OPEN -->
          <button 
            *ngIf="eoi()?.status === 'OPEN'"
            type="button"
            (click)="closeEoiNow()"
            class="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs rounded-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">lock</span>
            Close EOI &amp; Unlock Submissions
          </button>
          <a 
            routerLink="/admin/eoi" 
            class="px-3.5 py-2 border border-slate-300 rounded-xs text-xs font-bold text-[#002244] hover:bg-slate-50 transition-colors shadow-2xs">
            ← Back to All EOIs
          </a>
        </div>
      </admin-page-header>

      <!-- EOI Header Information Summary Card -->
      <div *ngIf="eoi() as item" class="bg-white p-5 rounded-xs border border-slate-200 shadow-2xs mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span class="text-xs font-bold text-[#002244] font-mono">{{ item.referenceNo }}</span>
            <h3 class="text-sm font-extrabold text-slate-900 mt-0.5">{{ item.title }}</h3>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-medium">Tender Status:</span>
            <admin-status-badge [status]="item.status"></admin-status-badge>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-3">
          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Closing Date</span>
            <span class="font-bold text-slate-800">{{ item.closingDate }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Assigned Committee</span>
            <span class="font-bold text-[#002244] truncate block">{{ item.committeeName || 'State Skill Evaluation Committee' }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Scheme</span>
            <span class="font-medium text-slate-700 truncate block">{{ item.schemeName }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Total Fee Volume</span>
            <span class="font-bold text-slate-900">₹{{ item.fees.totalFee | number:'1.0-0' }}</span>
          </div>
        </div>
      </div>

      <!-- 4 KPI AGGREGATE SUMMARY CARDS (Whiteboard Step 1: No. of Responses) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div class="bg-white p-4 rounded-xs border border-slate-200 shadow-2xs">
          <span class="text-[10px] font-bold uppercase text-slate-500 block">Total Received</span>
          <div class="text-2xl font-black text-[#002244] mt-1">{{ applications().length }}</div>
          <span class="text-[10px] text-slate-400">Total Responses Filed</span>
        </div>
        
        <div class="bg-white p-4 rounded-xs border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span class="text-[10px] font-bold uppercase text-[#002244] block">Under Scrutiny</span>
          <div class="text-2xl font-black text-[#002244] mt-1">{{ getCount('Under Review') }}</div>
          <span class="text-[10px] text-blue-700 font-medium">Pending Committee Grading</span>
        </div>

        <div class="bg-white p-4 rounded-xs border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span class="text-[10px] font-bold uppercase text-emerald-800 block">Accepted &amp; Empanelled</span>
          <div class="text-2xl font-black text-emerald-900 mt-1">{{ getCount('Accepted') }}</div>
          <span class="text-[10px] text-emerald-700 font-medium">E-Signed Order Issued</span>
        </div>

        <div class="bg-white p-4 rounded-xs border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span class="text-[10px] font-bold uppercase text-rose-800 block">Disqualified / Rejected</span>
          <div class="text-2xl font-black text-rose-900 mt-1">{{ getCount('Rejected') }}</div>
          <span class="text-[10px] text-rose-700 font-medium">Reasoned Remarks Notified</span>
        </div>
      </div>

      <!-- RTPP ACT SEAL NOTICE (If Open and override not clicked) -->
      <div *ngIf="eoi()?.status === 'OPEN' && !superAdminOverride()" class="bg-amber-50/70 border-2 border-amber-300 rounded-xs p-6 mb-6 text-center shadow-2xs">
        <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 mx-auto mb-3">
          <span class="material-symbols-outlined text-[28px]">lock</span>
        </div>
        <h3 class="text-base font-bold text-amber-900">Submission Window Active (Sealed Vault)</h3>
        <p class="text-xs text-amber-800 max-w-lg mx-auto mt-1 leading-relaxed">
          "Applicant detailed profiles and bid dossiers are sealed until the official closing date ({{ eoi()?.closingDate }}) in compliance with RTPP Act 2012 secrecy regulations."
        </p>

        <!-- Super Admin Emergency Override Toggle -->
        <div class="mt-4 pt-4 border-t border-amber-200/80 max-w-md mx-auto flex items-center justify-center gap-3">
          <span class="text-xs text-amber-950 font-semibold">Department Scrutiny Cell Access:</span>
          <button 
            type="button"
            (click)="superAdminOverride.set(true)"
            class="px-3.5 py-1.5 bg-[#002244] hover:bg-[#003366] text-white rounded-xs text-xs font-bold shadow-xs cursor-pointer">
            Authorize Official Scrutiny View
          </button>
        </div>
      </div>

      <!-- DETAILED PROFILES & APPLICANT RESPONSES TABLE (Whiteboard: Detailed Profile Table with View Action) -->
      <div *ngIf="eoi()?.status === 'CLOSED' || superAdminOverride()" class="bg-white rounded-xs shadow-2xs border border-slate-200 overflow-hidden">
        <div class="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#002244] text-[20px]">assignment</span>
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#002244]">
              Applicant Dossiers &amp; Technical Scrutiny Queue
            </h3>
          </div>
          <span class="text-xs text-slate-500 font-semibold">
            {{ applications().length }} Verified Proposals
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600 border-collapse">
            <thead class="bg-slate-50 text-[#002244] uppercase font-bold text-[10.5px] border-b border-slate-200">
              <tr>
                <th class="px-2 py-3.5">App Number</th>
                <th class="px-2 py-3.5">Registration No.</th>
                <th class="px-2 py-3.5">Applicant Entity Name</th>
                <th class="px-2 py-3.5">Category</th>
                <th class="px-2 py-3.5">Submission Date</th>
                <th class="px-2 py-3.5">Payment</th>
                <th class="px-2 py-3.5">Scrutiny Status</th>
                <th class="px-2 py-3.5">Awarded Grade</th>
                <th class="px-2 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let a of applications()" class="hover:bg-slate-50/80 transition-colors">
                
                <!-- App Number -->
                <td class="px-2 py-3 font-mono font-bold text-[#002244] whitespace-nowrap">
                  <a [routerLink]="['/admin/eoi', eoiId, 'responses', a.id]" class="hover:underline">
                    {{ a.applicationNumber }}
                  </a>
                </td>

                <!-- Registration No -->
                <td class="px-2 py-3 font-mono text-slate-600">
                  {{ a.registrationNumber }}
                </td>

                <!-- Applicant Entity -->
                <td class="px-2 py-3 max-w-[200px]">
                  <div class="font-bold text-slate-900 line-clamp-1" [title]="a.organizationName">{{ a.organizationName }}</div>
                  <div class="text-[11px] text-slate-500 truncate" [title]="a.applicantName + ' • ' + a.applicantPhone">{{ a.applicantName }} • {{ a.applicantPhone }}</div>
                </td>

                <!-- Category -->
                <td class="px-2 py-3 min-w-[130px] max-w-[200px] leading-snug text-slate-700">
                  {{ a.assignedCategory || a.category }}
                </td>

                <!-- Submission Date -->
                <td class="px-2 py-3 text-slate-600">
                  {{ a.submissionDate | date:'dd-MM-yyyy HH:mm' }}
                </td>

                <!-- Payment Status -->
                <td class="px-2 py-3">
                  <span class="inline-flex flex-wrap items-center gap-1 font-semibold text-emerald-700">
                    <span class="material-symbols-outlined text-[14px]">verified</span>
                    ₹{{ a.amount | number:'1.0-0' }} ({{ a.paymentStatus }})
                  </span>
                </td>

                <!-- Scrutiny Status -->
                <td class="px-2 py-3 whitespace-nowrap">
                  <admin-status-badge [status]="a.status"></admin-status-badge>
                </td>

                <!-- Awarded Grade -->
                <td class="px-2 py-3 font-bold">
                  <span *ngIf="a.grading" class="inline-flex items-center px-2 py-0.5 rounded-2xs text-[10.5px] font-extrabold bg-[#002244]/10 text-[#002244] border border-[#002244]/20">
                    {{ a.grading.split(' ')[0] + ' ' + (a.grading.split(' ')[1] || '') }}
                  </span>
                  <span *ngIf="!a.grading" class="text-slate-400 font-normal italic text-[11px]">
                    Pending Grading
                  </span>
                </td>

                <!-- Actions: View Detailed Profile & Scrutiny -->
                <td class="px-2 py-3 text-right whitespace-nowrap">
                  <a 
                    [routerLink]="['/admin/eoi', eoiId, 'responses', a.id]" 
                    class="px-3 py-1.5 bg-[#002244] hover:bg-[#003366] text-white rounded-xs text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="View Detailed Profile & Committee Evaluation">
                    <span class="material-symbols-outlined text-[16px]">visibility</span>
                    <span>View</span>
                  </a>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class ResponsesComponent implements OnInit {
  private eoiService = inject(EoiService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  eoiId = 'EOI-2025-001';
  eoi = signal<EoiItem | null>(null);
  applications = signal<ApplicationItem[]>([]);
  superAdminOverride = signal<boolean>(true); // Default true for demo convenience

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eoiId = id;
    }
    this.eoiService.getEoiById(this.eoiId).subscribe(e => this.eoi.set(e || null));
    this.loadApplications();
  }

  loadApplications(): void {
    this.eoiService.getApplicationsForEoi(this.eoiId).subscribe(apps => {
      this.applications.set(apps);
    });
  }

  getCount(status: string): number {
    return this.applications().filter(a => a.status === status).length;
  }

  closeEoiNow(): void {
    this.eoiService.closeEoi(this.eoiId).subscribe(res => {
      if (res) {
        this.eoi.set(res);
        this.toastService.info('EOI Closed', 'Tender closed. Response vault unlocked for technical evaluation.');
      }
    });
  }
}
