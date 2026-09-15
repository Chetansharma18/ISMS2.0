import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe } from '@angular/common';
import { EoiStateService, EoiApplication, UserProfile } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Observable, of, switchMap, map } from 'rxjs';

@Component({
  selector: 'app-status-tracker',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    DecimalPipe,
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

        <main class="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto space-y-6">

          <!-- Page Heading -->
          <div class="border-b border-slate-200 pb-4">
            <h1 class="text-2xl sm:text-3xl font-bold text-[#002244] tracking-tight">
              Application &amp; Tender Status Tracker
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Official real-time evaluation timeline, technical scrutiny progress, and verification logs for your Expression of Interest.
            </p>
          </div>

          <!-- Main Content Loaded from Application State -->
          <div *ngIf="application$ | async as app" class="space-y-6">

            <!-- 1. Master Application Hero Card -->
            <div class="bg-white border border-slate-200 shadow-2xs rounded-xs overflow-hidden">
              
              <!-- Card Header Accent -->
              <div class="h-1.5 bg-gradient-to-r from-[#002244] via-[#f59e0b] to-[#002244]"></div>
              
              <div class="p-5 sm:p-6">
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  
                  <!-- Left: Application Details -->
                  <div class="space-y-1.5 max-w-2xl">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        Application Ref:
                      </span>
                      <span class="font-mono font-bold text-base sm:text-lg text-[#002244] bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-200">
                        {{ app.id }}
                      </span>
                      <button 
                        (click)="copyRef(app.id)"
                        class="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                        [title]="copied ? 'Copied!' : 'Copy Reference'">
                        <span *ngIf="!copied" class="text-xs">📋</span>
                        <span *ngIf="copied" class="text-xs text-emerald-600 font-bold">✓ Copied</span>
                      </button>
                    </div>

                    <h2 class="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                      {{ app.schemeName }}
                    </h2>

                    <div class="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                      <span class="px-2 py-0.5 rounded-2xs bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[11px]">
                        Scheme ID: {{ app.schemeId }}
                      </span>
                      <span>•</span>
                      <span>{{ app.department }}</span>
                    </div>

                    <div class="text-xs text-slate-500 flex items-center gap-3 pt-1">
                      <span>Submitted on: <strong class="text-slate-700 font-mono">{{ app.appliedDate }} 11:15 IST</strong></span>
                      <span>•</span>
                      <span>Districts: <strong class="text-slate-700">{{ app.proposalDetails.proposedDistricts.join(', ') }}</strong></span>
                    </div>
                  </div>

                  <!-- Right: Status Banner & Actions -->
                  <div class="flex flex-col items-start lg:items-end gap-3 self-stretch lg:self-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                    <div>
                      <div class="text-[11px] text-slate-500 mb-1 lg:text-right font-medium">Scrutiny Lifecycle State</div>
                      <app-status-badge [status]="app.status"></app-status-badge>
                    </div>

                    <div class="text-[11.5px] text-slate-600 lg:text-right font-mono flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full" [ngClass]="isAccepted(app) ? 'bg-emerald-500' : isRejected(app) ? 'bg-rose-500' : 'bg-amber-500 animate-ping'"></span>
                      <span>{{ isAccepted(app) ? 'Decision Sealed: Empanelled' : isRejected(app) ? 'Decision Sealed: Disqualified' : 'SLA Window: 7–10 Working Days' }}</span>
                    </div>

                    <!-- Receipt Download Link -->
                    <a 
                      [routerLink]="['/eoi/acknowledgement', app.id]"
                      class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#002244] border border-slate-300 rounded-xs text-xs font-bold transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer">
                      <span class="material-symbols-outlined text-[16px]">receipt_long</span>
                      <span>Treasury EMD Receipt</span>
                    </a>
                  </div>

                </div>

                <!-- Quick Metrics Strip -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-slate-100">
                  <div class="p-2.5 rounded-xs bg-slate-50 border border-slate-200/80">
                    <div class="text-[10.5px] font-bold text-slate-500 uppercase">Treasury EMD Deposit</div>
                    <div class="text-sm font-bold text-slate-900 mt-0.5">₹{{ app.emdPayment.totalPaid | number:'1.0-0' }}</div>
                    <div class="text-[10px] text-emerald-700 font-semibold mt-0.5">✓ Verified &amp; Cleared</div>
                  </div>

                  <div class="p-2.5 rounded-xs bg-slate-50 border border-slate-200/80">
                    <div class="text-[10.5px] font-bold text-slate-500 uppercase">Challan / Txn Ref</div>
                    <div class="text-xs font-mono font-bold text-[#002244] mt-0.5 truncate" [title]="app.emdPayment.txnReference">
                      {{ app.emdPayment.txnReference }}
                    </div>
                    <div class="text-[10px] text-slate-500 mt-0.5">{{ app.emdPayment.paymentMethod }}</div>
                  </div>

                  <div class="p-2.5 rounded-xs bg-slate-50 border border-slate-200/80">
                    <div class="text-[10.5px] font-bold text-slate-500 uppercase">Proposed Capacity</div>
                    <div class="text-sm font-bold text-slate-900 mt-0.5">{{ app.proposalDetails.targetCapacity }} Trainees</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">{{ app.proposalDetails.proposedCentersCount }} Training Centers</div>
                  </div>

                  <div class="p-2.5 rounded-xs bg-slate-50 border border-slate-200/80">
                    <div class="text-[10.5px] font-bold text-slate-500 uppercase">Assigned Scrutiny Desk</div>
                    <div class="text-xs font-bold text-slate-800 mt-0.5 truncate">
                      {{ app.scrutinyDetails?.assignedOfficer || 'Quality Assurance Directorate, Sub-Division 3' }}
                    </div>
                    <div class="text-[10px] text-blue-700 font-medium mt-0.5">RSLDC Directorate</div>
                  </div>
                </div>

              </div>
            </div>

            <!-- ================= CONDITIONAL EVALUATION OUTCOME BANNER (WHITEBOARD REQUIREMENT) ================= -->
            
            <!-- STATE A: IF ACCEPTED -> SHOW AWARDED GRADING, CATEGORY & COMMITTEE SIGNED ATTACHMENT -->
            <div *ngIf="isAccepted(app)" class="bg-emerald-50/70 border-2 border-emerald-300 rounded-xs p-5 sm:p-6 shadow-2xs space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                    ✓
                  </div>
                  <div>
                    <h3 class="text-base font-extrabold text-emerald-950">
                      Application Qualified &amp; Empanelled as Official Training Partner
                    </h3>
                    <p class="text-xs text-emerald-800">
                      Approved by the State Skill Evaluation Committee under RTPP Act 2012 empanelment norms.
                    </p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-2xs text-xs font-extrabold bg-emerald-200 text-emerald-900 border border-emerald-300 shrink-0">
                  ★ Status: EMPANELLED
                </span>
              </div>

              <!-- Key Qualification Badges -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div class="p-3 bg-white rounded-xs border border-emerald-200">
                  <span class="text-[10.5px] uppercase font-bold text-slate-500 block">Awarded Technical Grade</span>
                  <div class="text-sm font-extrabold text-[#002244] mt-0.5">
                    {{ app.scrutinyDetails?.assignedGrade || 'Grade A+ (Exemplary - 92/100)' }}
                  </div>
                  <span class="text-[10px] text-emerald-700 font-semibold">Tier-1 Priority Allotment</span>
                </div>

                <div class="p-3 bg-white rounded-xs border border-emerald-200">
                  <span class="text-[10.5px] uppercase font-bold text-slate-500 block">Assigned Partner Category</span>
                  <div class="text-sm font-extrabold text-[#002244] mt-0.5 truncate" [title]="app.scrutinyDetails?.assignedCategory || 'Category A - Mega Training Partner'">
                    {{ app.scrutinyDetails?.assignedCategory || 'Category A - Mega Training Partner' }}
                  </div>
                  <span class="text-[10px] text-slate-500">State-wide Operational Jurisdiction</span>
                </div>

                <div class="p-3 bg-white rounded-xs border border-emerald-200">
                  <span class="text-[10.5px] uppercase font-bold text-slate-500 block">Empanelment Order Ref</span>
                  <div class="text-xs font-mono font-bold text-[#002244] mt-0.5">
                    {{ app.scrutinyDetails?.committeeAttachment?.certificateRefNo || 'RSLDC/SSEC/2026/APPR-9821' }}
                  </div>
                  <span class="text-[10px] text-emerald-700 font-semibold">Digitally Signed &amp; Sealed</span>
                </div>
              </div>

              <!-- Committee Signed Document Download Box (The Legal Proof requested in Whiteboard) -->
              <div class="p-4 bg-white rounded-xs border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="material-symbols-outlined text-emerald-700 text-[32px] shrink-0">verified</span>
                  <div class="min-w-0">
                    <div class="font-extrabold text-xs text-slate-900 truncate">
                      {{ app.scrutinyDetails?.committeeAttachment?.documentTitle || 'Official Committee Empanelment Resolution Order' }}
                    </div>
                    <div class="text-[11px] text-slate-600 mt-0.5">
                      Includes authenticated digital signatures of Chairman &amp; Committee Members (2.4 MB PDF).
                    </div>
                    <!-- Committee Signatories List -->
                    <div class="text-[10px] text-emerald-800 font-medium mt-1 flex items-center gap-2 flex-wrap">
                      <span>✓ Shri S. K. Sharma, IAS (Chairman)</span>
                      <span>•</span>
                      <span>✓ Dr. K. N. Verma (Scrutiny Officer)</span>
                      <span>•</span>
                      <span>✓ Smt. Sunita Meena (Financial Advisor)</span>
                    </div>
                  </div>
                </div>

                <button 
                  (click)="downloadOrderDoc(app)"
                  class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xs shadow-xs transition inline-flex items-center gap-2 shrink-0 cursor-pointer">
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  <span>Download Signed Resolution (PDF)</span>
                </button>
              </div>
            </div>

            <!-- STATE B: IF REJECTED -> SHOW REJECTION GROUNDS, REMARKS & 100% EMD REFUND -->
            <div *ngIf="isRejected(app)" class="bg-rose-50/70 border-2 border-rose-300 rounded-xs p-5 sm:p-6 shadow-2xs space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 pb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                    ✕
                  </div>
                  <div>
                    <h3 class="text-base font-extrabold text-rose-950">
                      Proposal Disqualified by Scrutiny Committee
                    </h3>
                    <p class="text-xs text-rose-800">
                      The application did not satisfy mandatory technical qualification benchmarks under the Expression of Interest criteria.
                    </p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-2xs text-xs font-extrabold bg-rose-200 text-rose-900 border border-rose-300 shrink-0">
                  Status: DISQUALIFIED
                </span>
              </div>

              <!-- Official Rejection Remarks entered by Admin -->
              <div class="p-4 bg-white rounded-xs border border-rose-300 space-y-1.5">
                <span class="text-[10.5px] uppercase font-bold text-rose-900 block">
                  Official Committee Disqualification Remarks &amp; Statutory Grounds:
                </span>
                <p class="text-xs text-slate-800 font-semibold leading-relaxed">
                  {{ app.scrutinyDetails?.rejectionReason || app.scrutinyDetails?.adminRemarks || 'Disqualified under RTPP RFP Clause 4.2: Insufficient average audited turnover for the qualifying financial years.' }}
                </p>
                <div class="text-[10.5px] text-slate-500 pt-1 border-t border-slate-100">
                  Recorded by: <strong>State Skill Evaluation Committee (Quality Assurance Cell, RSLDC)</strong>
                </div>
              </div>

              <!-- RTPP Act Rule 83 Appellate Appeal Guidance & 100% EMD Refund Box -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <!-- Grievance Appeal Rights -->
                <div class="p-3.5 bg-white rounded-xs border border-slate-200">
                  <span class="text-[10.5px] uppercase font-bold text-slate-700 block">
                    RTPP Act 2012 Rule 83 Appeal Rights
                  </span>
                  <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    You have the statutory right to file a formal representation before the First Appellate Authority (Director, RSLDC) within <strong>10 working days</strong> of this notice.
                  </p>
                </div>

                <!-- 100% Treasury EMD Refund Credit -->
                <div class="p-3.5 bg-white rounded-xs border border-slate-200">
                  <span class="text-[10.5px] uppercase font-bold text-slate-700 block">
                    Treasury EMD Refund Status (100% Refund)
                  </span>
                  <div class="text-xs font-bold text-emerald-800 mt-1">
                    ✓ ₹50,000 Credited to Original Bank Mandate
                  </div>
                  <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                    Refund Ref: REFUND-TREASURY-8829104 (Completed)
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Evaluation Timeline Stages (Multi-Stage Scrutiny Flow) -->
            <div class="bg-white border border-slate-200 shadow-2xs rounded-xs p-5 sm:p-7">
              <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[#002244]">
                    Official Evaluation Timeline Stages
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Stage-by-stage review checkpoints prescribed under Rajasthan Transparency in Public Procurement (RTPP) Rules.
                  </p>
                </div>
                <span 
                  class="text-xs font-bold px-2.5 py-1 rounded-2xs border"
                  [ngClass]="isAccepted(app) ? 'text-emerald-800 bg-emerald-100 border-emerald-300' : isRejected(app) ? 'text-rose-800 bg-rose-100 border-rose-300' : 'text-amber-800 bg-amber-100 border-amber-300'">
                  ● {{ isAccepted(app) ? 'Evaluation Complete (Empanelled)' : isRejected(app) ? 'Evaluation Closed (Disqualified)' : 'Stage 2: Active Technical Scrutiny' }}
                </span>
              </div>

              <div class="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 before:h-full">

                <!-- Stage 1: Application Filed & EMD Received (Completed) -->
                <div class="relative flex items-start gap-4">
                  <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold z-10 shadow-2xs">
                    ✓
                  </div>
                  <div class="flex-grow pt-0.5 bg-slate-50/70 p-4 rounded-xs border border-slate-200">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div class="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>1. Application Filed &amp; Treasury EMD Deposit Received</span>
                        <span class="text-[10.5px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-2xs">
                          Completed
                        </span>
                      </div>
                      <span class="text-xs font-mono text-slate-500">{{ app.appliedDate }} 11:15 IST</span>
                    </div>
                    <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Expression of Interest successfully submitted online. Treasury EMD deposit of <strong>₹50,000</strong> plus processing fee of <strong>₹2,500</strong> verified via Government Cyber Treasury Gateway (Txn: <span class="font-mono text-[#002244]">{{ app.emdPayment.txnReference }}</span>).
                    </p>
                  </div>
                </div>

                <!-- Stage 2: Technical & Financial Scrutiny (Active / Completed) -->
                <div class="relative flex items-start gap-4">
                  <div 
                    class="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold z-10 shadow-2xs"
                    [ngClass]="isAccepted(app) ? 'bg-emerald-600' : isRejected(app) ? 'bg-rose-600' : 'bg-amber-500 ring-4 ring-amber-100 animate-pulse'">
                    {{ isAccepted(app) ? '✓' : isRejected(app) ? '✕' : '2' }}
                  </div>
                  <div 
                    class="flex-grow pt-0.5 p-4 rounded-xs border"
                    [ngClass]="isAccepted(app) ? 'bg-slate-50/70 border-slate-200' : isRejected(app) ? 'bg-rose-50/40 border-rose-200' : 'bg-amber-50/40 border-amber-200'">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div class="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>2. Technical &amp; Statutory Scrutiny in Progress</span>
                        <span 
                          class="text-[10.5px] font-bold px-2 py-0.2 rounded-2xs"
                          [ngClass]="isAccepted(app) ? 'text-emerald-700 bg-emerald-100' : isRejected(app) ? 'text-rose-800 bg-rose-200' : 'text-amber-800 bg-amber-200 animate-pulse'">
                          {{ isAccepted(app) ? 'Qualified ✓' : isRejected(app) ? 'Non-Compliant ✕' : '● Current Active Stage' }}
                        </span>
                      </div>
                      <span class="text-xs font-semibold text-slate-600">Review Window: 7 Working Days</span>
                    </div>
                    
                    <p class="text-xs text-slate-700 mt-1.5 leading-relaxed">
                      The appointed Scrutiny Committee audits statutory incorporation certificates, PAN/GSTIN registration, audited financial turnover for the last 3 financial years, and past experience in executing government skill schemes.
                    </p>

                    <!-- Assigned Desk Officer -->
                    <div class="mt-3 p-3 bg-white border border-slate-200 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <strong class="text-slate-800">Assigned Scrutiny Desk:</strong> 
                        <span class="text-slate-600 ml-1">Quality Assurance Directorate, Sub-Division 3</span>
                      </div>
                      <div class="text-slate-500 font-mono text-[11px]">
                        Desk Officer: <strong>Dr. K. N. Verma (Scrutiny Officer)</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Stage 3: Training Center Infrastructure Inspection -->
                <div class="relative flex items-start gap-4">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10"
                    [ngClass]="isAccepted(app) ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-slate-300 text-slate-500'">
                    {{ isAccepted(app) ? '✓' : '3' }}
                  </div>
                  <div class="flex-grow pt-0.5 bg-white p-4 rounded-xs border border-slate-200">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div class="font-semibold text-slate-700 text-sm flex items-center gap-2">
                        <span>3. Training Center Infrastructure &amp; Faculty Credential Verification</span>
                        <span 
                          class="text-[10.5px] font-medium px-2 py-0.2 rounded-2xs"
                          [ngClass]="isAccepted(app) ? 'text-emerald-700 bg-emerald-100 font-bold' : 'text-slate-500 bg-slate-100'">
                          {{ isAccepted(app) ? 'Verified ✓' : 'Pending Stage 2' }}
                        </span>
                      </div>
                      <span class="text-xs text-slate-400">Desktop &amp; Center Audit</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Verification of dedicated center floor blueprints, biometric attendance systems, CCTV feed integrations, and qualified TOT-certified trainer portfolios across proposed centers.
                    </p>
                  </div>
                </div>

                <!-- Stage 4: Final Empanelment Decision & Grading -->
                <div class="relative flex items-start gap-4">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10"
                    [ngClass]="isAccepted(app) ? 'bg-emerald-600 text-white' : isRejected(app) ? 'bg-rose-600 text-white' : 'bg-white border-2 border-slate-300 text-slate-500'">
                    {{ isAccepted(app) ? '★' : isRejected(app) ? '✕' : '4' }}
                  </div>
                  <div 
                    class="flex-grow pt-0.5 p-4 rounded-xs border"
                    [ngClass]="isAccepted(app) ? 'bg-emerald-50/50 border-emerald-300' : isRejected(app) ? 'bg-rose-50/50 border-rose-300' : 'bg-white border-slate-200'">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div class="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <span>4. Final Empanelment Decision &amp; Technical Partner (TP) Grade Award</span>
                        <span 
                          class="text-[10.5px] font-bold px-2 py-0.2 rounded-2xs"
                          [ngClass]="isAccepted(app) ? 'text-emerald-800 bg-emerald-200' : isRejected(app) ? 'text-rose-800 bg-rose-200' : 'text-slate-500 bg-slate-100'">
                          {{ isAccepted(app) ? 'Awarded Grade A+ ✓' : isRejected(app) ? 'Order Issued: Disqualified' : 'Final Stage' }}
                        </span>
                      </div>
                      <span class="text-xs text-slate-500 font-mono">Authority: RSLDC Board</span>
                    </div>
                    <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Formal award of the <strong>Technical Partner (TP) Empanelment Certificate</strong> with Grade allocation or issuance of reasoned rejection with 100% Treasury EMD credit.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <!-- 3. Submitted Mandatory Documents Verification Grid -->
            <div class="bg-white border border-slate-200 shadow-2xs rounded-xs p-5 sm:p-6">
              <h3 class="text-base font-bold text-[#002244] border-b border-slate-200 pb-2.5 mb-4">
                Submitted Statutory Documents Compliance Grid
              </h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div class="p-3 bg-slate-50 rounded-xs border border-slate-200 flex items-start justify-between gap-2">
                  <div>
                    <div class="text-xs font-bold text-slate-800">Organization Incorporation / MOA</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">Certificate of Incorporation (PDF)</div>
                  </div>
                  <span class="px-2 py-0.5 rounded-2xs bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                    ✓ Verified
                  </span>
                </div>

                <div class="p-3 bg-slate-50 rounded-xs border border-slate-200 flex items-start justify-between gap-2">
                  <div>
                    <div class="text-xs font-bold text-slate-800">PAN &amp; GSTIN Registration</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">NSDL &amp; GSTN API Cross-Checked</div>
                  </div>
                  <span class="px-2 py-0.5 rounded-2xs bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                    ✓ Verified
                  </span>
                </div>

                <div class="p-3 bg-slate-50 rounded-xs border border-slate-200 flex items-start justify-between gap-2">
                  <div>
                    <div class="text-xs font-bold text-slate-800">Treasury EMD Payment Challan</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">TXN-ISMS-884920482 (₹52,500)</div>
                  </div>
                  <span class="px-2 py-0.5 rounded-2xs bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                    ✓ Verified
                  </span>
                </div>
              </div>
            </div>

            <!-- 4. Official Scrutiny Cell & Grievance Contact Card -->
            <div class="bg-white border border-slate-200 shadow-2xs rounded-xs p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white to-slate-50">
              <div class="space-y-1">
                <div class="text-xs font-bold text-[#002244] uppercase tracking-wider">
                  Nodal Scrutiny Cell &amp; Help Desk
                </div>
                <div class="text-sm font-bold text-slate-900">
                  Rajasthan Skill and Livelihoods Development Corporation (RSLDC)
                </div>
                <p class="text-xs text-slate-500">
                  EMI Building, J-8-B, Jhalana Institutional Area, Jaipur, Rajasthan 302004
                </p>
                <div class="text-xs text-slate-600 pt-1 flex items-center gap-4 flex-wrap">
                  <span>Helpline: <strong class="text-slate-800">0141-2710000</strong></span>
                  <span>•</span>
                  <span>Email: <strong class="text-slate-800">scrutiny-eoi&#64;rsldc.rajasthan.gov.in</strong></span>
                </div>
              </div>

              <a 
                routerLink="/eoi/my-applications" 
                class="px-4 py-2 bg-[#002244] hover:bg-[#003366] text-white rounded-xs text-xs font-bold shadow-2xs transition whitespace-nowrap cursor-pointer">
                View All My Applications →
              </a>
            </div>

          </div>

        </main>
      </div>
    </div>
  `
})
export class StatusTrackerComponent implements OnInit {
  application$!: Observable<EoiApplication>;
  copied: boolean = false;

  constructor(
    private eoiService: EoiStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.application$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return this.eoiService.history$.pipe(
          map(history => {
            if (id) {
              const found = history.find(a => a.id === id || a.id.includes(id) || id.includes(a.id));
              if (found) return found;
            }
            if (history.length > 0) return history[0];
            return this.eoiService.getCurrentDraft();
          })
        );
      })
    );
  }

  isAccepted(app: EoiApplication): boolean {
    return app.status === 'APPROVED' || (app.status as any) === 'Accepted';
  }

  isRejected(app: EoiApplication): boolean {
    return app.status === 'REJECTED' || (app.status as any) === 'Rejected';
  }

  copyRef(id: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      });
    }
  }

  downloadOrderDoc(app: EoiApplication): void {
    alert(`Downloading official signed resolution: ${app.scrutinyDetails?.committeeAttachment?.fileName || 'SSEC_Empanelment_Approval_Resolution_Signed.pdf'}`);
  }
}
