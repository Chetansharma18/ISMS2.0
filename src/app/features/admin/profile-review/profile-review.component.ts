import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe } from '@angular/common';
import { EoiStateService, ApplicantResponse, UserProfile, EoiApplication } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgFor, NgClass, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#F4F7F9] font-sans text-slate-800 antialiased">
      <app-header></app-header>

      <div class="flex flex-grow">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block"></app-sidebar>

        <!-- Main Content Area -->
        <main class="flex-grow px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto">
          
          <!-- Top Breadcrumb & Title Bar -->
          <div *ngIf="!showActionPanel" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 mb-6 animate-in fade-in duration-300">
            <div>
              <div class="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                <a routerLink="/admin/eoi" class="text-[#131A4D] hover:underline">← Back to EOI View</a>
                <span>/</span>
                <a routerLink="/admin/responses" class="text-[#131A4D] hover:underline">Applicant Responses</a>
                <span>/</span>
                <span class="font-bold text-slate-700">{{ selectedApplicant()?.applicationId }}</span>
              </div>
              <h1 class="text-2xl font-bold text-[#131A4D] tracking-tight">
                EOI Detailed Scrutiny & Evaluation Desk
              </h1>

            </div>


          </div>

          <!-- Step 1: Full Read-Only Recap of Applicant's EOI Form + Profile -->
          <div *ngIf="!showActionPanel" class="w-full space-y-6 animate-in fade-in duration-300">
              
              <!-- 1. Scheme & EOI Submission Details Box -->
              <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-[#131A4D] text-white px-5 py-2.5 flex items-center justify-between">
                  <div class="flex items-center">
                    <h2 class="text-xs font-bold uppercase tracking-wider">
                      Tender Details
                    </h2>
                  </div>
                  <span class="text-[10px] font-mono text-blue-200">
                    Submission Date: {{ selectedApplicant()?.submissionDate }}
                  </span>
                </div>

                <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div>
                    <span class="text-slate-400 block text-[11px]">Scheme Name:</span>
                    <span class="font-bold text-slate-900 text-sm">{{ selectedApplicant()?.schemeName }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Application Reference ID:</span>
                    <span class="font-mono font-bold text-[#131A4D]">{{ selectedApplicant()?.applicationId }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Target Training Capacity:</span>
                    <span class="font-mono font-bold text-slate-900">{{ selectedApplicant()?.proposalCapacity }} Candidates / Year</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Proposed Rajasthan District Centers:</span>
                    <div class="flex flex-wrap gap-1.5 mt-1">
                      <span *ngFor="let dist of selectedApplicant()?.proposedDistricts" class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] rounded-full">
                        {{ dist }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 1: Organisation / Company Basic Details -->
              <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
                  <span class="text-xs font-bold text-[#131A4D] uppercase tracking-wider">
                    Step 1: Organisation / Company Basic Details
                  </span>
                </div>
                <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                  <div><span class="text-slate-400 block text-[11px]">Application No.</span><span class="font-mono font-bold text-[#131A4D]">{{ selectedApplicant()?.applicationId || 'ISMS-TP-892134' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">TP/PIA Full Name</span><span class="font-bold text-slate-900">{{ selectedApplicant()?.organizationName || 'N/A' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">TP/PIA Short Name</span><span class="font-bold text-slate-900">APEX-TECH</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Registration Number</span><span class="font-mono text-slate-900">{{ selectedApplicant()?.registrationNumber || 'N/A' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Organisation Contact No.</span><span class="font-mono text-slate-800">{{ selectedApplicant()?.contactMobile || '+91 98201 44520' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Company Email-ID</span><span class="font-mono text-slate-800">{{ selectedApplicant()?.contactEmail || 'contact@example.com' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Organisation PAN No.</span><span class="font-mono font-bold text-slate-900">{{ selectedApplicant()?.pan || 'AABCA1294F' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Website</span><span class="text-blue-600 hover:underline cursor-pointer">https://apextechnical.in</span></div>
                  <div class="md:col-span-3"><span class="text-slate-400 block text-[11px]">Registered Address</span><span class="text-slate-900">123, RIICO Industrial Area, Phase II</span></div>
                  <div><span class="text-slate-400 block text-[11px]">State/UT</span><span class="text-slate-900">Rajasthan</span></div>
                  <div><span class="text-slate-400 block text-[11px]">District</span><span class="text-slate-900">Jaipur</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Pincode</span><span class="font-mono text-slate-900">302022</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Turn Over (₹ in Lakhs)</span><span class="font-mono font-bold text-slate-900">₹ 850.50</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Date of Registration</span><span class="font-mono text-slate-900">12/05/2015</span></div>
                  <div><span class="text-slate-400 block text-[11px]">State Where Registered</span><span class="text-slate-900">Rajasthan</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Type of business/activity</span><span class="text-slate-900">Skill Training Provider</span></div>
                  <div class="md:col-span-3"><span class="text-slate-400 block text-[11px]">Postal Address</span><span class="text-slate-900">123, RIICO Industrial Area, Phase II (Same as Registered)</span></div>
                </div>
              </div>

              <!-- STEP 2: Authorized Person Details -->
              <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
                  <span class="text-xs font-bold text-[#131A4D] uppercase tracking-wider">
                    Step 2: Authorized Person Details (Organisation Level)
                  </span>
                </div>
                <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                  <div><span class="text-slate-400 block text-[11px]">Name</span><span class="font-bold text-slate-900">{{ selectedApplicant()?.applicantName || 'Vikramaditya Sharma' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">S/O, D/O, W/O</span><span class="text-slate-900">Shri R.K. Sharma</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Date of Birth</span><span class="font-mono text-slate-900">14/08/1982</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Age</span><span class="font-mono text-slate-900">44</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Designation</span><span class="text-slate-900">Managing Director</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Mobile No.</span><span class="font-mono text-slate-800">{{ selectedApplicant()?.contactMobile || '+91 98201 44520' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Email-Id</span><span class="font-mono text-slate-800">{{ selectedApplicant()?.contactEmail || 'v.sharma@apextechnical.in' }}</span></div>
                  <div class="md:col-span-3"><span class="text-slate-400 block text-[11px]">Residence Address</span><span class="text-slate-900">45-B, Civil Lines, Jaipur</span></div>
                  <div><span class="text-slate-400 block text-[11px]">State</span><span class="text-slate-900">Rajasthan</span></div>
                  <div><span class="text-slate-400 block text-[11px]">PAN</span><span class="font-mono font-bold text-slate-900">BGPPS4512K</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Aadhaar No.</span><span class="font-mono font-bold text-slate-900">XXXX-XXXX-4512</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Type ID Proof</span><span class="text-slate-900">Aadhaar Card</span></div>
                  <div><span class="text-slate-400 block text-[11px]">ID No.</span><span class="font-mono text-slate-900">XXXX-XXXX-4512</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Bhamashah No.</span><span class="font-mono text-slate-900">Not Provided</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Voter Id No.</span><span class="font-mono text-slate-900">RJP1245789</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Passport No.</span><span class="font-mono text-slate-900">Z8945123</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Service Tax No.</span><span class="font-mono text-slate-900">Not Provided</span></div>
                </div>
              </div>

              <!-- STEP 4: Document Upload -->
              <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 border-b border-slate-200 px-5 py-2.5">
                  <span class="text-xs font-bold text-[#131A4D] uppercase tracking-wider">
                    Step 3: Document Upload
                  </span>
                </div>
                <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div class="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">📄</span>
                      <div>
                        <div class="font-bold text-slate-900">Organisation Registration Certificate</div>
                        <div class="text-[10px] text-slate-500 font-mono">1.4 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs text-[#131A4D] font-bold hover:underline">View</button>
                  </div>
                  <div class="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">📄</span>
                      <div>
                        <div class="font-bold text-slate-900">Organisation PAN Card</div>
                        <div class="text-[10px] text-slate-500 font-mono">850 KB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs text-[#131A4D] font-bold hover:underline">View</button>
                  </div>
                  <div class="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">📄</span>
                      <div>
                        <div class="font-bold text-slate-900">GST Registration Certificate</div>
                        <div class="text-[10px] text-slate-500 font-mono">1.1 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs text-[#131A4D] font-bold hover:underline">View</button>
                  </div>
                  <div class="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">📄</span>
                      <div>
                        <div class="font-bold text-slate-900">Audited Balance Sheet / Turnover Certificate</div>
                        <div class="text-[10px] text-slate-500 font-mono">3.8 MB PDF · CA Certified</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs text-[#131A4D] font-bold hover:underline">View</button>
                  </div>
                  <div class="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">📄</span>
                      <div>
                        <div class="font-bold text-slate-900">Board Resolution / Power of Attorney</div>
                        <div class="text-[10px] text-slate-500 font-mono">2.1 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs text-[#131A4D] font-bold hover:underline">View</button>
                  </div>
                  <div class="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">📄</span>
                      <div>
                        <div class="font-bold text-slate-900">NSDC Partner Certificate</div>
                        <div class="text-[10px] text-slate-500 font-mono">1.9 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs text-[#131A4D] font-bold hover:underline">View</button>
                  </div>
                  <div class="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">📄</span>
                      <div>
                        <div class="font-bold text-slate-900">Additional Supporting Document</div>
                        <div class="text-[10px] text-slate-500 font-mono">4.5 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs text-[#131A4D] font-bold hover:underline">View</button>
                  </div>
                </div>
              </div>




            <!-- Bottom Next Button for Step 1 -->
            <div class="mt-8 flex justify-end">
              <button (click)="showActionPanel = true" class="px-5 py-2.5 bg-[#131A4D] hover:bg-[#004d73] text-white font-bold text-sm rounded shadow-sm transition-colors flex items-center gap-2">
                Next <span>→</span>
              </button>
            </div>

          </div> <!-- End Step 1 -->

          <!-- Step 2: Department Admin Scrutiny Action Panel -->
          <div *ngIf="showActionPanel" class="w-full animate-in fade-in duration-300">
            
            <!-- Back Button -->
            <button (click)="showActionPanel = false" class="mb-4 text-slate-500 hover:text-[#131A4D] font-bold text-sm flex items-center gap-1.5 transition-colors">
              <span>←</span> Back to Details
            </button>
              
              <div class="mt-2">
                
                <!-- Panel Header -->
                <div class="mb-5 pb-3 border-b border-slate-200">
                  <h3 class="text-lg font-bold text-[#131A4D] tracking-tight">
                    Scrutiny Officer Action Panel
                  </h3>
                  <div class="text-xs text-slate-500 mt-1">
                    Evaluation & Empanelment Decision
                  </div>
                </div>

                <!-- Action Form -->
                <form [formGroup]="reviewForm" class="space-y-4 text-sm">
                  
                  <div class="grid grid-cols-3 gap-4">
                    <!-- 1. Proposed Proposal PDF -->
                    <div class="space-y-1">
                      <label class="block font-bold text-[#131A4D]">
                        Proposed Proposal PDF
                      </label>
                      <div class="h-11 px-3 border border-slate-200 bg-slate-50 flex items-center justify-between rounded">
                        <div class="flex items-center gap-2 overflow-hidden">
                          <span class="text-base leading-none">📄</span>
                          <span class="font-bold text-slate-900 truncate">Bidder Proposal.pdf</span>
                        </div>
                        <button type="button" class="text-sm text-[#131A4D] font-bold hover:underline shrink-0 ml-2">View</button>
                      </div>
                    </div>

                    <!-- 2. Grading Dropdown -->
                    <div class="space-y-1 relative">
                      <label class="block font-bold text-[#131A4D]">
                        Grade (A-E) <span class="text-red-600">*</span>
                      </label>
                      <div class="relative">
                        <button type="button" (click)="showGradeDropdown = !showGradeDropdown" class="w-full h-11 px-3 border border-slate-300 bg-white focus:outline-none focus:border-[#131A4D] font-bold text-slate-800 rounded flex justify-between items-center text-sm">
                          <span *ngIf="reviewForm.get('grade')?.value">Grade {{ reviewForm.get('grade')?.value }}</span>
                          <span *ngIf="!reviewForm.get('grade')?.value" class="text-slate-400 font-normal">Select Grade</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        
                        <!-- Custom Dropdown Menu -->
                        <div *ngIf="showGradeDropdown" class="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg z-50 py-1">
                          <button type="button" (click)="selectGrade('A')" class="w-full text-left px-3 py-2 hover:bg-slate-50 font-bold text-slate-800 text-sm">Grade A</button>
                          <button type="button" (click)="selectGrade('B')" class="w-full text-left px-3 py-2 hover:bg-slate-50 font-bold text-slate-800 text-sm">Grade B</button>
                          <button type="button" (click)="selectGrade('C')" class="w-full text-left px-3 py-2 hover:bg-slate-50 font-bold text-slate-800 text-sm">Grade C</button>
                          <button type="button" (click)="selectGrade('D')" class="w-full text-left px-3 py-2 hover:bg-slate-50 font-bold text-slate-800 text-sm">Grade D</button>
                          <button type="button" (click)="selectGrade('E')" class="w-full text-left px-3 py-2 hover:bg-slate-50 font-bold text-slate-800 text-sm">Grade E</button>
                        </div>
                      </div>
                    </div>

                    <!-- 3. Technical Score -->
                    <div class="space-y-1">
                      <label class="block font-bold text-[#131A4D]">
                        Technical Score (0-100) <span class="text-red-600">*</span>
                      </label>
                      <input 
                        type="text"
                        formControlName="technicalScore"
                        placeholder="e.g. 85"
                        (input)="enforceNumericInput($event)"
                        class="w-full h-11 px-3 border border-slate-300 bg-white focus:border-[#131A4D] font-bold text-slate-800 rounded">
                    </div>
                  </div>

                  <!-- Success/Decision Alert Notice -->
                  <div *ngIf="decisionTaken" class="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded">
                    ✓ Scrutiny decision recorded successfully! Status updated on applicant portal.
                  </div>

                  <!-- 4. Decision Action / Final Status -->
                  <div class="pt-3 space-y-2">
                    
                    <ng-container *ngIf="selectedApplicant()?.scrutinyStatus === 'UNDER_SCRUTINY'; else decisionBadge">
                      <div class="flex justify-center gap-4" *ngIf="!pendingAction">
                        <!-- Accept Button -->
                        <button 
                          type="button" 
                          [disabled]="!reviewForm.get('grade')?.value || !reviewForm.get('technicalScore')?.value"
                          (click)="pendingAction = 'APPROVED'"
                          class="w-64 py-3 rounded-full bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm tracking-wide transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                          <span>✓ Accept Bidder</span>
                        </button>

                        <!-- Reject Button -->
                        <button 
                          type="button" 
                          [disabled]="!reviewForm.get('grade')?.value || !reviewForm.get('technicalScore')?.value"
                          (click)="pendingAction = 'REJECTED'"
                          class="w-64 py-3 rounded-full bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-bold text-sm tracking-wide transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                          <span>✕ Reject Bidder</span>
                        </button>
                      </div>

                      <!-- Inline Confirmation Form -->
                      <div *ngIf="pendingAction" class="space-y-4 border-t border-slate-200 pt-4 mt-4 animate-in slide-in-from-top-2 duration-300">
                        <div class="flex items-center">
                          <h4 class="text-base font-bold text-[#131A4D]">
                            {{ pendingAction === 'APPROVED' ? 'Confirm Acceptance' : 'Confirm Rejection' }}
                          </h4>
                        </div>

                        <div class="text-xs text-slate-700 leading-relaxed border-b border-slate-200 pb-3">
                          <p *ngIf="pendingAction === 'APPROVED'">
                            You are officially approving <strong>{{ selectedApplicant()?.organizationName }}</strong> for the <strong>{{ selectedApplicant()?.schemeName }}</strong> tender.
                          </p>
                          <p *ngIf="pendingAction === 'REJECTED'">
                            You are rejecting this application. This will notify the applicant and trigger an EMD refund.
                          </p>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                          <!-- Upload Document -->
                          <div class="space-y-1 h-full flex flex-col">
                            <label class="block font-bold text-[#131A4D] text-xs">
                              {{ pendingAction === 'APPROVED' ? 'Mandatory Approval Document' : 'Mandatory Rejection Document' }} <span class="text-red-600">*</span>
                            </label>
                            <input type="file" #fileInput (change)="onFileSelected($event)" accept="application/pdf" class="hidden">
                            
                            <div *ngIf="!isDocumentAttached"
                              (click)="fileInput.click()"
                              class="border border-slate-300 border-dashed bg-slate-50 hover:bg-slate-100 text-[#131A4D] p-3 text-center transition-colors cursor-pointer rounded flex-1 flex flex-col justify-center min-h-[82px]">
                              <span class="text-xs font-semibold">
                                📎 Attach Document
                              </span>
                            </div>

                            <div *ngIf="isDocumentAttached"
                              class="flex items-center justify-between border border-emerald-500 bg-emerald-50 text-emerald-700 p-3 rounded flex-1 min-h-[82px]">
                              <div class="flex items-center gap-2 overflow-hidden">
                                <span class="text-xs font-semibold truncate">✓ {{ attachedFileName }}</span>
                              </div>
                              <div class="flex gap-4 shrink-0">
                                <button type="button" (click)="viewAttachedDocument()" class="text-xs font-bold hover:underline text-emerald-800 focus:outline-none">
                                  View
                                </button>
                                <button type="button" (click)="removeAttachedDocument()" class="text-xs font-bold hover:underline text-red-600 focus:outline-none">
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>

                          <!-- Remarks -->
                          <div class="space-y-1">
                            <label class="block font-bold text-[#131A4D] text-xs">
                              Remarks (Max 500 words) <span class="text-red-600">*</span>
                            </label>
                            <textarea 
                              formControlName="remarks"
                              placeholder="Enter your confirmation remarks here..."
                              class="w-full h-[82px] px-3 py-2 border border-slate-300 bg-white focus:border-[#131A4D] text-xs text-slate-900 rounded resize-none"></textarea>
                          </div>
                        </div>

                        <div class="flex items-center justify-end gap-3 pt-2">
                          <button 
                            type="button" 
                            (click)="pendingAction = null; removeAttachedDocument(); reviewForm.reset()"
                            class="px-5 py-2.5 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-colors">
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            (click)="executeDecision()"
                            [disabled]="reviewForm.get('remarks')?.invalid || !isDocumentAttached"
                            [ngClass]="pendingAction === 'APPROVED' ? 'bg-[#166534] hover:bg-[#14532d]' : 'bg-[#991b1b] hover:bg-[#7f1d1d]'"
                            class="px-5 py-2.5 text-white text-xs font-bold transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex gap-1.5 items-center">
                            {{ pendingAction === 'APPROVED' ? '✓ Submit Approval' : '✕ Submit Rejection' }}
                          </button>
                        </div>
                      </div>
                    </ng-container>

                    <ng-template #decisionBadge>
                      <div 
                        class="w-full py-2.5 rounded-full font-bold text-xs tracking-wide flex items-center justify-center text-white"
                        [ngClass]="selectedApplicant()?.scrutinyStatus === 'APPROVED' ? 'bg-[#166534]' : 'bg-[#991b1b]'">
                        {{ selectedApplicant()?.scrutinyStatus === 'APPROVED' ? '✓ Accepted' : '✕ Rejected' }}
                      </div>
                    </ng-template>

                  </div>

                </form>

              </div>

            </div>
        </main>
      </div>



    </div>
  `
})
export class ProfileReviewComponent implements OnInit {
  selectedApplicant = signal<ApplicantResponse | null>(null);
  reviewForm!: FormGroup;
  showConfirmModal = false;
  pendingAction: 'APPROVED' | 'REJECTED' | null = null;
  decisionTaken = false;
  isDocumentAttached = false;
  attachedFile: File | null = null;
  attachedFileName: string = '';
  showActionPanel = false;
  showGradeDropdown = false;

  constructor(
    private fb: FormBuilder,
    private eoiService: EoiStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      grade: ['', Validators.required],
      technicalScore: ['', Validators.required],
      remarks: ['Verified compliance with all technical eligibility criteria and statutory incorporation credentials.', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('applicationId');
      if (id) {
        const responses = this.eoiService.getApplicantResponses();
        this.selectedApplicant.set(responses.find(r => r.applicationId === id) || null);
      }
    });
  }

  confirmDecision(action: 'APPROVED' | 'REJECTED'): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    this.pendingAction = action;
    this.isDocumentAttached = false; // Reset on modal open
    this.showConfirmModal = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a valid PDF document.');
        event.target.value = '';
        this.removeAttachedDocument();
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds the 10 MB limit.');
        event.target.value = '';
        this.removeAttachedDocument();
        return;
      }
      this.attachedFile = file;
      this.attachedFileName = file.name;
      this.isDocumentAttached = true;
    }
  }

  enforceNumericInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');
    
    if (value !== '' && parseInt(value, 10) > 100) {
      value = '100';
    }
    
    input.value = value;
    this.reviewForm.get('technicalScore')?.setValue(value, { emitEvent: false });
  }

  selectGrade(grade: string): void {
    this.reviewForm.get('grade')?.setValue(grade);
    this.showGradeDropdown = false;
  }

  viewAttachedDocument(): void {
    if (this.attachedFile) {
      const fileUrl = URL.createObjectURL(this.attachedFile);
      window.open(fileUrl, '_blank');
    }
  }

  removeAttachedDocument(): void {
    this.attachedFile = null;
    this.attachedFileName = '';
    this.isDocumentAttached = false;
  }

  executeDecision(): void {
    const applicant = this.selectedApplicant();
    if (!applicant || !this.pendingAction) return;

    this.eoiService.updateScrutinyDecision(applicant.applicationId, {
      status: this.pendingAction,
      grade: this.pendingAction === 'APPROVED' ? this.reviewForm.value.grade : undefined,
      remarks: this.reviewForm.value.remarks
    });

    this.selectedApplicant.set({
      ...applicant,
      scrutinyStatus: this.pendingAction,
      currentGrade: this.pendingAction === 'APPROVED' ? this.reviewForm.value.grade : null,
      emdStatus: this.pendingAction === 'REJECTED' ? 'REFUNDED' : 'PAID'
    });

    this.showConfirmModal = false;
    this.decisionTaken = true;
  }
}
