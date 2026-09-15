import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgIf, NgFor, DatePipe, CurrencyPipe } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-application-details',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe, CurrencyPipe, CardComponent, StatusBadgeComponent],
  template: `
    <div class="max-w-5xl mx-auto space-y-6">
      
      <div class="flex items-center gap-3 text-textMuted mb-2">
        <a routerLink="/eoi/my-applications" class="hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Applications
        </a>
      </div>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 class="text-2xl font-bold text-text">{{ applicationId }}</h1>
            <p class="text-textMuted text-sm mt-1">Application Reference: REF-883921</p>
         </div>
         <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-text hover:bg-gray-50 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
               Download Receipt
            </button>
            <app-status-badge status="UNDER REVIEW"></app-status-badge>
         </div>
      </div>

      <app-card customClass="mt-6">
         <h2 class="text-lg font-bold text-text mb-4 border-b border-border pb-2">Scheme Details</h2>
         <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
            <div>
               <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-1">Scheme Name</p>
               <p class="text-sm font-medium text-text">National Skill Development Infrastructure Setup Phase II</p>
            </div>
            <div>
               <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-1">Nodal Agency</p>
               <p class="text-sm font-medium text-text">Ministry of Electronics and IT</p>
            </div>
            <div>
               <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-1">Sector</p>
               <p class="text-sm font-medium text-text">Education & Skill</p>
            </div>
            <div>
               <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-1">Submission Date</p>
               <p class="text-sm font-medium text-text">Sept 1, 2026, 10:30 AM</p>
            </div>
         </div>
      </app-card>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         <div class="lg:col-span-2 space-y-6">
            <app-card>
               <h2 class="text-lg font-bold text-text mb-4 border-b border-border pb-2">Technical Proposal</h2>
               <div class="space-y-6">
                  <div>
                     <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-1">Approach & Methodology</p>
                     <p class="text-sm text-text bg-gray-50 p-3 rounded border border-gray-100">
                        We plan to implement the infrastructure setup by utilizing modular, pre-fabricated IT blocks. Phase 1 will target 50 districts...
                     </p>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                     <div>
                        <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-1">Estimated Timeline</p>
                        <p class="text-sm font-medium text-text">18 Months</p>
                     </div>
                  </div>
                  
                  <div>
                     <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-2">Attached Documents</p>
                     <ul class="space-y-2">
                        <li class="flex items-center gap-3 p-2 border border-gray-200 rounded text-sm">
                           <div class="p-2 bg-red-50 text-red-600 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                           </div>
                           <span class="flex-grow font-medium text-text">technical_proposal_v1.pdf</span>
                           <span class="text-xs text-textMuted">4.2 MB</span>
                           <button class="text-primary hover:underline">View</button>
                        </li>
                        <li class="flex items-center gap-3 p-2 border border-gray-200 rounded text-sm">
                           <div class="p-2 bg-blue-50 text-blue-600 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                           </div>
                           <span class="flex-grow font-medium text-text">project_gantt_chart.pdf</span>
                           <span class="text-xs text-textMuted">1.1 MB</span>
                           <button class="text-primary hover:underline">View</button>
                        </li>
                     </ul>
                  </div>
               </div>
            </app-card>

            <app-card>
               <h2 class="text-lg font-bold text-text mb-4 border-b border-border pb-2">Financials & Payment</h2>
               <div class="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                  <div>
                     <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-1">Turnover FY 25-26</p>
                     <p class="text-sm font-medium text-text">₹ 45,50,00,000</p>
                  </div>
                  <div>
                     <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-1">Turnover FY 24-25</p>
                     <p class="text-sm font-medium text-text">₹ 41,20,00,000</p>
                  </div>
               </div>
               
               <h3 class="text-sm font-bold text-text mb-2">Payment Details</h3>
               <div class="bg-gray-50 border border-gray-200 rounded p-4">
                  <div class="flex justify-between items-center mb-2">
                     <span class="text-sm text-textMuted">Processing Fee</span>
                     <span class="text-sm font-medium">₹ 5,000</span>
                  </div>
                  <div class="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
                     <span class="text-sm text-textMuted">EMD Amount</span>
                     <span class="text-sm font-medium">₹ 1,50,000</span>
                  </div>
                  <div class="flex justify-between items-center mb-4">
                     <span class="text-sm font-bold text-text">Total Paid</span>
                     <span class="text-sm font-bold text-success">₹ 1,55,000</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                     <span class="text-textMuted">Transaction ID:</span>
                     <span class="font-mono">TXN9928318281</span>
                  </div>
                  <div class="flex justify-between items-center text-xs mt-1">
                     <span class="text-textMuted">Date:</span>
                     <span>Sept 1, 2026, 10:28 AM</span>
                  </div>
               </div>
            </app-card>
         </div>

         <!-- Right Sidebar -->
         <div class="space-y-6">
            <app-card>
               <h2 class="text-md font-bold text-text mb-4 border-b border-border pb-2">Application Timeline</h2>
               <div class="relative pl-6 space-y-6 border-l-2 border-gray-200 ml-3">
                  <!-- Event -->
                  <div class="relative">
                     <div class="absolute -left-[31px] bg-primary w-4 h-4 rounded-full border-4 border-white"></div>
                     <p class="text-sm font-bold text-text">Under Review</p>
                     <p class="text-xs text-textMuted">Application is being evaluated by the committee.</p>
                     <p class="text-xs font-medium text-primary mt-1">Sept 5, 2026</p>
                  </div>
                  <!-- Event -->
                  <div class="relative">
                     <div class="absolute -left-[31px] bg-success w-4 h-4 rounded-full border-4 border-white"></div>
                     <p class="text-sm font-bold text-text">Payment Verified</p>
                     <p class="text-xs text-textMuted">EMD and processing fee successfully received.</p>
                     <p class="text-xs font-medium text-textMuted mt-1">Sept 1, 2026, 10:45 AM</p>
                  </div>
                  <!-- Event -->
                  <div class="relative">
                     <div class="absolute -left-[31px] bg-success w-4 h-4 rounded-full border-4 border-white"></div>
                     <p class="text-sm font-bold text-text">Application Submitted</p>
                     <p class="text-xs text-textMuted">EOI application finalized and submitted.</p>
                     <p class="text-xs font-medium text-textMuted mt-1">Sept 1, 2026, 10:30 AM</p>
                  </div>
               </div>
            </app-card>

            <app-card>
               <h2 class="text-md font-bold text-text mb-4 border-b border-border pb-2">Contact Agency</h2>
               <p class="text-sm text-textMuted mb-4">If you have questions regarding this specific application, use the details below.</p>
               <div class="space-y-3 text-sm">
                  <div class="flex items-start gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary mt-0.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                     <span class="font-medium">eoi-support&#64;meity.gov.in</span>
                  </div>
                  <div class="flex items-start gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary mt-0.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                     <span class="font-medium">+91 11 2345 6789</span>
                  </div>
               </div>
            </app-card>
         </div>

      </div>

    </div>
  `
})
export class ApplicationDetailsComponent implements OnInit {
  applicationId = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.applicationId = this.route.snapshot.paramMap.get('id') || 'Unknown ID';
  }
}
