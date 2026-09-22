import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SdcTimelineComponent } from '../../components/sdc-timeline/sdc-timeline.component';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-sdc-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SdcTimelineComponent],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <a routerLink="/sdcs" class="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-500">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-rsldc-navy">SDC Details: {{ sdc.sdcCode }}</h1>
            <p class="text-sm text-slate-500">{{ sdc.name }} | TP: {{ sdc.tpName }}</p>
          </div>
        </div>
        
        <div class="flex gap-2" *ngIf="sdc.status === 'PENDING_APPROVAL' && authService.hasRole(['DEPARTMENT_ADMIN', 'APPROVAL_AUTHORITY'])">
          <button (click)="takeAction('REJECT')" class="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition">Reject</button>
          <button (click)="takeAction('RETURN')" class="px-4 py-2 bg-white border border-amber-200 text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-50 transition">Return to TP</button>
          <button (click)="takeAction('APPROVE')" class="px-4 py-2 bg-approve-700 text-white rounded-lg text-sm font-bold hover:bg-green-800 transition shadow-sm">Approve SDC</button>
        </div>
      </div>

      <!-- Timeline -->
      <div class="bg-white rounded-xl shadow-2xs border border-slate-200 p-6">
        <app-sdc-timeline [currentStatus]="sdc.status"></app-sdc-timeline>
      </div>

      <!-- Tab Layout -->
      <div class="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
        
        <!-- Tabs -->
        <div class="flex border-b border-slate-200 overflow-x-auto bg-slate-50">
          <button class="px-6 py-3 text-sm font-bold border-b-2 transition" 
                  [ngClass]="activeTab === 'overview' ? 'border-rsldc-navy text-rsldc-navy bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'"
                  (click)="activeTab = 'overview'">Overview</button>
          <button class="px-6 py-3 text-sm font-bold border-b-2 transition"
                  [ngClass]="activeTab === 'courses' ? 'border-rsldc-navy text-rsldc-navy bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'"
                  (click)="activeTab = 'courses'">Courses</button>
          <button class="px-6 py-3 text-sm font-bold border-b-2 transition"
                  [ngClass]="activeTab === 'docs' ? 'border-rsldc-navy text-rsldc-navy bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'"
                  (click)="activeTab = 'docs'">Documents</button>
          <button class="px-6 py-3 text-sm font-bold border-b-2 transition"
                  [ngClass]="activeTab === 'inspection' ? 'border-rsldc-navy text-rsldc-navy bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'"
                  (click)="activeTab = 'inspection'">Inspection Report</button>
        </div>

        <div class="p-6">
          <!-- Overview Tab -->
          <div *ngIf="activeTab === 'overview'" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Scheme</p>
              <p class="font-semibold text-slate-800">{{ sdc.scheme }}</p>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Capacity</p>
              <p class="font-semibold text-slate-800">{{ sdc.capacity }} Aspirants</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Address</p>
              <p class="font-semibold text-slate-800">{{ sdc.address }}</p>
            </div>
          </div>

          <!-- Inspection Tab -->
          <div *ngIf="activeTab === 'inspection'">
            <div *ngIf="sdc.status === 'PENDING_INSPECTION' && authService.hasRole('INSPECTOR')" class="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 class="font-bold text-rsldc-navy mb-2">Pending Inspection</h3>
              <p class="text-sm text-slate-600 mb-4">Please submit your inspection report with findings and recommendations.</p>
              <button (click)="completeInspection()" class="bg-rsldc-navy text-white px-4 py-2 rounded-lg text-sm font-bold">Complete Inspection</button>
            </div>
            <div *ngIf="sdc.status !== 'PENDING_INSPECTION'" class="space-y-4">
              <div class="p-4 border border-slate-200 rounded-lg">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="font-bold text-slate-800">Inspection #1 (Physical)</h4>
                  <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">Passed</span>
                </div>
                <p class="text-sm text-slate-600 mb-2"><strong>Inspector:</strong> Rajiv Kumar</p>
                <p class="text-sm text-slate-600"><strong>Remarks:</strong> Center meets all scheme requirements. Infrastructure is adequate.</p>
              </div>
            </div>
          </div>
          
          <!-- Docs Placeholder -->
          <div *ngIf="activeTab === 'docs'">
             <ul class="space-y-2">
               <li class="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                 <div class="flex items-center gap-3">
                   <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                   <span class="text-sm font-bold text-slate-700">Rent Agreement.pdf</span>
                 </div>
                 <span class="text-xs text-slate-500">Uploaded 16 Sep 2026</span>
               </li>
             </ul>
          </div>
          
          <!-- Courses Detailed View -->
          <div *ngIf="activeTab === 'courses'" class="space-y-4">
             <div class="p-5 border border-slate-200 rounded-lg bg-white shadow-xs">
                <div class="flex justify-between items-start">
                   <div>
                     <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded uppercase tracking-wider">Approved Course</span>
                     <h4 class="font-bold text-rsldc-navy text-lg mt-1">Domestic Data Entry Operator (SSC/Q2212)</h4>
                     <p class="text-sm text-slate-600 mt-1">IT-ITeS Sector &bull; 400 Hours Duration</p>
                   </div>
                   <div class="text-right">
                     <p class="text-xs text-slate-500 font-bold uppercase">Target Allocation</p>
                     <p class="text-2xl font-black text-[#131A4D]">120</p>
                   </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                   <div>
                     <p class="text-[10px] text-slate-500 font-bold uppercase">NSQF Level</p>
                     <p class="font-bold text-slate-800">Level 4</p>
                   </div>
                   <div>
                     <p class="text-[10px] text-slate-500 font-bold uppercase">Minimum Education</p>
                     <p class="font-bold text-slate-800">10th Pass</p>
                   </div>
                   <div>
                     <p class="text-[10px] text-slate-500 font-bold uppercase">Required Labs</p>
                     <p class="font-bold text-slate-800">Computer Lab (1)</p>
                   </div>
                   <div>
                     <p class="text-[10px] text-slate-500 font-bold uppercase">Trainers Req.</p>
                     <p class="font-bold text-slate-800">1 per 30 students</p>
                   </div>
                </div>
                
                <!-- Course Admin Actions -->
                <div class="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2" *ngIf="sdc.status === 'PENDING_APPROVAL' && authService.hasRole(['DEPARTMENT_ADMIN', 'APPROVAL_AUTHORITY'])">
                   <button class="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50 transition">
                     Reject Course
                   </button>
                   <button class="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs font-bold hover:bg-blue-100 transition">
                     Modify Target
                   </button>
                   <button class="px-3 py-1.5 bg-approve-700 text-white rounded text-xs font-bold hover:bg-green-800 transition shadow-sm">
                     Approve Course
                   </button>
                </div>
             </div>
          </div>

          <!-- Inspection Report Tab -->
          <div *ngIf="activeTab === 'inspection'" class="space-y-6">
             <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <div class="mt-0.5 text-amber-600">
                   <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <div>
                   <h4 class="font-bold text-amber-800 text-sm">Inspection Pending</h4>
                   <p class="text-xs text-amber-700 mt-0.5">The auditor has not yet submitted the final physical verification report.</p>
                </div>
             </div>

             <!-- Auditor Geo-Match Data (Read Only) -->
             <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 class="font-bold text-rsldc-navy border-b pb-2">Auditor Geo-Match Verification</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-slate-500 font-bold uppercase">TP Submitted Location</p>
                    <p class="font-mono text-sm">26.912400, 75.787300</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 font-bold uppercase">Auditor Captured Location</p>
                    <p class="font-mono text-sm text-slate-400 italic">Awaiting Capture</p>
                  </div>
                </div>
             </div>

             <!-- Inspection Checklist (Read Only) -->
             <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
               <h3 class="font-bold text-rsldc-navy border-b pb-2">Physical Infrastructure Checklist</h3>
               <div class="space-y-3 opacity-60">
                 <label class="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                   <input type="checkbox" disabled class="w-5 h-5 rounded text-blue-600">
                   <span class="font-bold text-sm text-slate-700">Center exists at the physical address</span>
                 </label>
                 <label class="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                   <input type="checkbox" disabled class="w-5 h-5 rounded text-blue-600">
                   <span class="font-bold text-sm text-slate-700">Signboard is available and clearly visible</span>
                 </label>
               </div>
             </div>
          </div>

        </div>
      </div>
      
    </div>
  `
})
export class SdcDetailComponent {
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab = 'overview';
  
  // Mock Data
  sdc = {
    id: '2',
    sdcCode: 'SDC-0002',
    name: 'Ajmer Training Inst.',
    tpName: 'ARNOLD SAMARTH',
    scheme: 'SAMARTH',
    capacity: 120,
    address: 'Plot 42, Knowledge Park, Ajmer, Rajasthan',
    status: 'PENDING_INSPECTION'
  };

  constructor() {
    // Determine initial state based on ID for demo
    const id = this.route.snapshot.paramMap.get('id');
    if (id === '1') {
      this.sdc.status = 'PENDING_APPROVAL';
    }
  }

  takeAction(action: 'APPROVE' | 'REJECT' | 'RETURN') {
    if (action === 'APPROVE') {
      this.sdc.status = 'APPROVED';
      alert('SDC Approved Successfully!');
    } else {
      this.sdc.status = 'REJECTED';
    }
  }

  completeInspection() {
    this.sdc.status = 'PENDING_APPROVAL';
    alert('Inspection Report Submitted. SDC is now Pending Approval.');
  }
}
