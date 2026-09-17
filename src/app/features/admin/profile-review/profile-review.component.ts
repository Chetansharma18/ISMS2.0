import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe } from '@angular/common';
import { EoiStateService, ApplicantResponse, UserProfile, EoiApplication } from '../../../core/services/eoi-state.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-review',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe, SidebarComponent],
  template: `
    <div class="h-screen flex flex-col bg-[#F4F7F9] font-sans text-slate-800 antialiased overflow-hidden">
      <div class="flex flex-1 min-h-0 w-full overflow-hidden">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block shrink-0 h-full"></app-sidebar>

        <!-- Main Content Area -->
        <main class="flex-1 min-h-0 min-w-0 w-full p-6 overflow-y-auto overflow-x-hidden bg-[#F6F8FA]">
          
          <!-- Top Breadcrumb & Title Bar -->
          <div *ngIf="!showActionPanel" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#D9E1E8] mb-6 animate-in fade-in duration-300">
            <div>
              <div class="flex items-center gap-2 text-xs text-[#5F6F7E] mb-1">
                <a routerLink="/admin/eoi" class="text-[#0B3558] font-medium hover:underline">← Back to EOI View</a>
                <span>/</span>
                <a routerLink="/admin/responses" class="text-[#0B3558] font-medium hover:underline">Applicant Responses</a>
                <span>/</span>
                <span class="font-semibold text-[#172B3A]">{{ selectedApplicant?.applicationId }}</span>
              </div>
              <h1 class="text-[28px] font-bold text-[#0B3558] tracking-tight leading-[36px]">
                EOI Detailed Scrutiny & Evaluation Desk
              </h1>
            </div>
          </div>

          <!-- Step 1: Full Read-Only Recap of Applicant's EOI Form + Profile -->
          <div *ngIf="!showActionPanel" class="w-full space-y-6 animate-in fade-in duration-300">
                            <!-- 1. Scheme & EOI Submission Details Box -->
              <div class="bg-white border border-[#D9E1E8] rounded-[6px] shadow-none overflow-hidden">
                <div class="bg-[#0B3558] text-white px-5 sm:px-6 py-3 flex items-center justify-between">
                  <div class="flex items-center">
                    <h2 class="text-xs sm:text-sm font-bold uppercase tracking-wider">
                      Tender Details
                    </h2>
                  </div>
                  <span class="text-xs sm:text-[12.5px] text-[#EEF3F7] font-medium">
                    Submission Date: {{ selectedApplicant?.submissionDate }}
                  </span>
                </div>

                <div class="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 text-sm text-slate-700">
                  <div>
                    <span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Scheme Name:</span>
                    <span class="font-bold text-[#172B3A] text-sm sm:text-base">{{ selectedApplicant?.schemeName }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Application Reference ID:</span>
                    <span class="font-mono font-bold text-[#0B3558] text-sm sm:text-base">{{ selectedApplicant?.applicationId }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Target Training Capacity:</span>
                    <span class="font-mono font-bold text-[#172B3A] text-sm sm:text-base">{{ selectedApplicant?.proposalCapacity }} Candidates / Year</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Proposed Rajasthan District Centers:</span>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <span *ngFor="let dist of selectedApplicant?.proposedDistricts" class="px-2.5 py-1 bg-[#F6F8FA] border border-[#D9E1E8] text-[#172B3A] font-semibold text-xs sm:text-[12.5px] rounded-[4px]">
                        {{ dist }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 1: Organisation / Company Basic Details -->
              <div class="bg-white border border-[#D9E1E8] rounded-[6px] shadow-none overflow-hidden">
                <div class="bg-[#EEF3F7] border-b border-[#D9E1E8] px-5 sm:px-6 py-3 flex items-center justify-between">
                  <span class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wider">
                    Step 1: Organisation / Company Basic Details
                  </span>
                </div>
                <div class="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-sm text-[#172B3A]">
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Application No.</span><span class="font-mono font-bold text-[#0B3558] text-sm sm:text-[14.5px]">{{ selectedApplicant?.applicationId || 'ISMS-TP-892134' }}</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">TP/PIA Full Name</span><span class="font-bold text-[#172B3A] text-sm sm:text-[14.5px]">{{ selectedApplicant?.organizationName || 'N/A' }}</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">TP/PIA Short Name</span><span class="font-bold text-[#172B3A] text-sm sm:text-[14.5px]">APEX-TECH</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Registration Number</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">{{ selectedApplicant?.registrationNumber || 'N/A' }}</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Organisation Contact No.</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">{{ selectedApplicant?.contactMobile || '+91 98201 44520' }}</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Company Email-ID</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">{{ selectedApplicant?.contactEmail || 'contact@example.com' }}</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Organisation PAN No.</span><span class="font-mono font-bold text-[#0B3558] text-sm sm:text-[14.5px]">{{ selectedApplicant?.pan || 'AABCA1294F' }}</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Website</span><span class="text-[#0B3558] font-semibold text-sm sm:text-[14.5px] hover:underline cursor-pointer">https://apextechnical.in</span></div>
                  <div class="md:col-span-3"><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Registered Address</span><span class="font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">123, RIICO Industrial Area, Phase II</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">State/UT</span><span class="font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">Rajasthan</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">District</span><span class="font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">Jaipur</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Pincode</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">302022</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Turn Over (₹ in Lakhs)</span><span class="font-bold text-[#0B3558] text-sm sm:text-[14.5px]">₹ 850.50 Lakhs</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Date of Registration</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">12/05/2015</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">State Where Registered</span><span class="font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">Rajasthan</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Type of business/activity</span><span class="font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">Skill Training Provider</span></div>
                  <div class="md:col-span-3"><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Postal Address</span><span class="font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">123, RIICO Industrial Area, Phase II (Same as Registered)</span></div>
                </div>
              </div>

              <!-- STEP 2: Authorized Person Details -->
              <div class="bg-white border border-[#D9E1E8] rounded-[6px] shadow-none overflow-hidden">
                <div class="bg-[#EEF3F7] border-b border-[#D9E1E8] px-5 sm:px-6 py-3 flex items-center justify-between">
                  <span class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wider">
                    Step 2: Authorized Person Details (Organisation Level)
                  </span>
                </div>
                <div class="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-sm text-[#172B3A]">
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Name</span><span class="font-bold text-[#172B3A] text-sm sm:text-[14.5px]">{{ selectedApplicant?.applicantName || 'Vikramaditya Sharma' }}</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">S/O, D/O, W/O</span><span class="font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">Shri R.K. Sharma</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Date of Birth</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">14/08/1982</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Age</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">44</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Designation</span><span class="font-bold text-[#0B3558] text-sm sm:text-[14.5px]">Managing Director</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Mobile No.</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">{{ selectedApplicant?.contactMobile || '+91 98201 44520' }}</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Email-Id</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">{{ selectedApplicant?.contactEmail || 'v.sharma@apextechnical.in' }}</span></div>
                  <div class="md:col-span-3"><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Residence Address</span><span class="font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">45-B, Civil Lines, Jaipur</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">State</span><span class="font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">Rajasthan</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">PAN</span><span class="font-mono font-bold text-[#0B3558] text-sm sm:text-[14.5px]">BGPPS4512K</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Aadhaar No.</span><span class="font-mono font-bold text-[#172B3A] text-sm sm:text-[14.5px]">XXXX-XXXX-4512</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Type ID Proof</span><span class="font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">Aadhaar Card</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">ID No.</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">XXXX-XXXX-4512</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Bhamashah No.</span><span class="font-mono text-slate-500 text-sm sm:text-[14.5px]">Not Provided</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Voter Id No.</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">RJP1245789</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Passport No.</span><span class="font-mono font-semibold text-[#172B3A] text-sm sm:text-[14.5px]">Z8945123</span></div>
                  <div><span class="text-slate-500 font-medium block text-xs sm:text-[12.5px] mb-0.5">Service Tax No.</span><span class="font-mono text-slate-500 text-sm sm:text-[14.5px]">Not Provided</span></div>
                </div>
              </div>

              <!-- STEP 4: Document Upload -->
              <div class="bg-white border border-[#D9E1E8] rounded-[6px] shadow-none overflow-hidden">
                <div class="bg-[#EEF3F7] border-b border-[#D9E1E8] px-5 sm:px-6 py-3">
                  <span class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wider">
                    Step 3: Document Upload
                  </span>
                </div>
                <div class="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div class="p-3.5 border border-[#D9E1E8] bg-[#F6F8FA] rounded-[6px] flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-xl">📄</span>
                      <div>
                        <div class="font-bold text-[#172B3A] text-xs sm:text-sm">Organisation Registration Certificate</div>
                        <div class="text-[11px] text-[#5F6F7E] font-mono mt-0.5">1.4 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs sm:text-sm text-[#0B3558] font-bold hover:underline px-2 py-1 bg-white border border-slate-300 rounded shadow-2xs">View</button>
                  </div>
                  <div class="p-3.5 border border-[#D9E1E8] bg-[#F6F8FA] rounded-[6px] flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-xl">📄</span>
                      <div>
                        <div class="font-bold text-[#172B3A] text-xs sm:text-sm">Organisation PAN Card</div>
                        <div class="text-[11px] text-[#5F6F7E] font-mono mt-0.5">850 KB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs sm:text-sm text-[#0B3558] font-bold hover:underline px-2 py-1 bg-white border border-slate-300 rounded shadow-2xs">View</button>
                  </div>
                  <div class="p-3.5 border border-[#D9E1E8] bg-[#F6F8FA] rounded-[6px] flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-xl">📄</span>
                      <div>
                        <div class="font-bold text-[#172B3A] text-xs sm:text-sm">GST Registration Certificate</div>
                        <div class="text-[11px] text-[#5F6F7E] font-mono mt-0.5">1.1 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs sm:text-sm text-[#0B3558] font-bold hover:underline px-2 py-1 bg-white border border-slate-300 rounded shadow-2xs">View</button>
                  </div>
                  <div class="p-3.5 border border-[#D9E1E8] bg-[#F6F8FA] rounded-[6px] flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-xl">📄</span>
                      <div>
                        <div class="font-bold text-[#172B3A] text-xs sm:text-sm">Audited Balance Sheet / Turnover Certificate</div>
                        <div class="text-[11px] text-[#5F6F7E] font-mono mt-0.5">3.8 MB PDF · CA Certified</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs sm:text-sm text-[#0B3558] font-bold hover:underline px-2 py-1 bg-white border border-slate-300 rounded shadow-2xs">View</button>
                  </div>
                  <div class="p-3.5 border border-[#D9E1E8] bg-[#F6F8FA] rounded-[6px] flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-xl">📄</span>
                      <div>
                        <div class="font-bold text-[#172B3A] text-xs sm:text-sm">Board Resolution / Power of Attorney</div>
                        <div class="text-[11px] text-[#5F6F7E] font-mono mt-0.5">2.1 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs sm:text-sm text-[#0B3558] font-bold hover:underline px-2 py-1 bg-white border border-slate-300 rounded shadow-2xs">View</button>
                  </div>
                  <div class="p-3.5 border border-[#D9E1E8] bg-[#F6F8FA] rounded-[6px] flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-xl">📄</span>
                      <div>
                        <div class="font-bold text-[#172B3A] text-xs sm:text-sm">NSDC Partner Certificate</div>
                        <div class="text-[11px] text-[#5F6F7E] font-mono mt-0.5">1.9 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs sm:text-sm text-[#0B3558] font-bold hover:underline px-2 py-1 bg-white border border-slate-300 rounded shadow-2xs">View</button>
                  </div>
                  <div class="p-3.5 border border-[#D9E1E8] bg-[#F6F8FA] rounded-[6px] flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-xl">📄</span>
                      <div>
                        <div class="font-bold text-[#172B3A] text-xs sm:text-sm">Additional Supporting Document</div>
                        <div class="text-[11px] text-[#5F6F7E] font-mono mt-0.5">4.5 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs sm:text-sm text-[#0B3558] font-bold hover:underline px-2 py-1 bg-white border border-slate-300 rounded shadow-2xs">View</button>
                  </div>
                </div>
              </div>

            <!-- Bottom Next Button for Step 1 -->
            <div class="mt-8 flex justify-end">
              <button (click)="showActionPanel = true" class="px-7 py-3 bg-[#0B3558] hover:bg-[#082A46] text-white font-bold text-sm sm:text-base rounded-[6px] transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
                Next <span>→</span>
              </button>
            </div>

          </div> <!-- End Step 1 -->

          <!-- Step 2: Department Admin Scrutiny Action Panel -->
          <div *ngIf="showActionPanel" class="w-full animate-in fade-in duration-300">
            
            <!-- Back Button -->
            <button (click)="showActionPanel = false" class="mb-4 text-[#5F6F7E] hover:text-[#0B3558] font-bold text-sm sm:text-[15px] flex items-center gap-1.5 transition-colors cursor-pointer">
              <span>←</span> Back to Details
            </button>
              
              <div class="mt-2">
                
                <!-- Panel Header -->
                <div class="mb-6 pb-3.5 border-b border-[#D9E1E8]">
                  <h3 class="text-xl sm:text-2xl font-bold text-[#0B3558] tracking-tight">
                    Scrutiny Officer Action Panel
                  </h3>
                  <div class="text-sm font-medium text-[#5F6F7E] mt-1">
                    Evaluation &amp; Empanelment Decision
                  </div>
                </div>

                <!-- Action Form -->
                <form [formGroup]="reviewForm" class="space-y-5 text-sm sm:text-[14.5px]">
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <!-- 1. Proposed Proposal PDF -->
                    <div class="space-y-1.5">
                      <label class="block font-bold text-[#172B3A] text-xs sm:text-[14px]">
                        Proposed Proposal PDF
                      </label>
                      <div class="h-12 px-3.5 border border-[#D9E1E8] bg-[#F6F8FA] flex items-center justify-between rounded-[6px]">
                        <div class="flex items-center gap-2 overflow-hidden">
                          <span class="text-lg leading-none">📄</span>
                          <span class="font-bold text-[#172B3A] truncate text-sm sm:text-[15px]">Bidder Proposal.pdf</span>
                        </div>
                        <button type="button" class="text-sm sm:text-[15px] text-[#0B3558] font-bold hover:underline shrink-0 ml-2 cursor-pointer">View</button>
                      </div>
                    </div>

                    <!-- 2. Grading Dropdown -->
                    <div class="space-y-1.5 relative">
                      <label class="block font-bold text-[#172B3A] text-xs sm:text-[14px]">
                        Grade (A-E) <span class="text-[#C62828]">*</span>
                      </label>
                      <div class="relative">
                        <button type="button" (click)="showGradeDropdown = !showGradeDropdown" class="w-full h-12 px-3.5 border border-[#D9E1E8] bg-white focus:outline-none focus:border-[#0B3558] font-bold text-[#172B3A] rounded-[6px] flex justify-between items-center text-sm sm:text-[15px] cursor-pointer">
                          <span *ngIf="reviewForm.get('grade')?.value">Grade {{ reviewForm.get('grade')?.value }}</span>
                          <span *ngIf="!reviewForm.get('grade')?.value" class="text-[#7A8793] font-normal">Select Grade</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-[#5F6F7E]"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        
                        <!-- Custom Dropdown Menu -->
                        <div *ngIf="showGradeDropdown" class="absolute top-full left-0 w-full mt-1 bg-white border border-[#D9E1E8] rounded-[6px] shadow-lg z-50 py-1">
                          <button type="button" (click)="selectGrade('A')" class="w-full text-left px-4 py-2.5 hover:bg-[#F4F7F9] font-bold text-[#172B3A] text-sm sm:text-[15px] cursor-pointer">Grade A</button>
                          <button type="button" (click)="selectGrade('B')" class="w-full text-left px-4 py-2.5 hover:bg-[#F4F7F9] font-bold text-[#172B3A] text-sm sm:text-[15px] cursor-pointer">Grade B</button>
                          <button type="button" (click)="selectGrade('C')" class="w-full text-left px-4 py-2.5 hover:bg-[#F4F7F9] font-bold text-[#172B3A] text-sm sm:text-[15px] cursor-pointer">Grade C</button>
                          <button type="button" (click)="selectGrade('D')" class="w-full text-left px-4 py-2.5 hover:bg-[#F4F7F9] font-bold text-[#172B3A] text-sm sm:text-[15px] cursor-pointer">Grade D</button>
                          <button type="button" (click)="selectGrade('E')" class="w-full text-left px-4 py-2.5 hover:bg-[#F4F7F9] font-bold text-[#172B3A] text-sm sm:text-[15px] cursor-pointer">Grade E</button>
                        </div>
                      </div>
                    </div>

                    <!-- 3. Technical Score -->
                    <div class="space-y-1.5">
                      <label class="block font-bold text-[#172B3A] text-xs sm:text-[14px]">
                        Technical Score (0-100) <span class="text-[#C62828]">*</span>
                      </label>
                      <input 
                        type="text"
                        formControlName="technicalScore"
                        placeholder="e.g. 85"
                        (input)="enforceNumericInput($event)"
                        class="w-full h-12 px-3.5 border border-[#D9E1E8] bg-white focus:border-[#0B3558] font-bold text-[#172B3A] text-sm sm:text-[15px] rounded-[6px] focus:outline-none">
                    </div>
                  </div>

                  <!-- Success/Decision Alert Notice -->
                  <div *ngIf="decisionTaken" class="p-3.5 bg-[#E8F5E9] border border-[#C8E6C9] text-[#16834B] text-sm font-semibold rounded-[6px]">
                    ✓ Scrutiny decision recorded successfully! Status updated on applicant portal.
                  </div>

                  <!-- 4. Decision Action / Final Status -->
                  <div class="pt-3 space-y-3">
                    
                    <ng-container *ngIf="selectedApplicant?.scrutinyStatus === 'UNDER_SCRUTINY'; else decisionBadge">
                      <div class="flex justify-center gap-4" *ngIf="!pendingAction">
                        <!-- Accept Button -->
                        <button 
                          type="button" 
                          [disabled]="!reviewForm.get('grade')?.value || !reviewForm.get('technicalScore')?.value"
                          (click)="pendingAction = 'APPROVED'"
                          class="w-64 py-3 rounded-[6px] bg-[#16834B] hover:bg-[#11683B] text-white font-bold text-sm sm:text-[15px] tracking-wide transition-colors shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                          <span>✓ Accept Bidder</span>
                        </button>

                        <!-- Reject Button -->
                        <button 
                          type="button" 
                          [disabled]="!reviewForm.get('grade')?.value || !reviewForm.get('technicalScore')?.value"
                          (click)="pendingAction = 'REJECTED'"
                          class="w-64 py-3 rounded-[6px] bg-[#C62828] hover:bg-[#A31F1F] text-white font-bold text-sm sm:text-[15px] tracking-wide transition-colors shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                          <span>✕ Reject Bidder</span>
                        </button>
                      </div>

                      <!-- Inline Confirmation Form -->
                      <div *ngIf="pendingAction" class="space-y-4 border-t border-[#D9E1E8] pt-5 mt-4 animate-in slide-in-from-top-2 duration-300">
                        <div class="flex items-center">
                          <h4 class="text-lg sm:text-xl font-bold text-[#0B3558]">
                            {{ pendingAction === 'APPROVED' ? 'Confirm Acceptance' : 'Confirm Rejection' }}
                          </h4>
                        </div>

                        <div class="text-sm sm:text-[14.5px] text-[#172B3A] leading-relaxed border-b border-[#D9E1E8] pb-3.5">
                          <p *ngIf="pendingAction === 'APPROVED'">
                            You are officially approving <strong>{{ selectedApplicant?.organizationName }}</strong> for the <strong>{{ selectedApplicant?.schemeName }}</strong> tender.
                          </p>
                          <p *ngIf="pendingAction === 'REJECTED'">
                            You are rejecting this application. This will notify the applicant and trigger an EMD refund.
                          </p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <!-- Upload Document -->
                          <div class="space-y-1.5 h-full flex flex-col">
                            <label class="block font-bold text-[#172B3A] text-xs sm:text-[14px]">
                              {{ pendingAction === 'APPROVED' ? 'Mandatory Approval Document' : 'Mandatory Rejection Document' }} <span class="text-[#C62828]">*</span>
                            </label>
                            <input type="file" #fileInput (change)="onFileSelected($event)" accept="application/pdf" class="hidden">
                            
                            <div *ngIf="!isDocumentAttached"
                              (click)="fileInput.click()"
                              class="border border-[#D9E1E8] border-dashed bg-[#F6F8FA] hover:bg-slate-100 text-[#0B3558] p-4 text-center transition-colors cursor-pointer rounded-[6px] flex-1 flex flex-col justify-center min-h-[96px]">
                              <span class="text-sm sm:text-[14.5px] font-bold flex items-center justify-center gap-1.5">
                                <span>📎</span>
                                <span>Attach Document</span>
                              </span>
                            </div>

                            <div *ngIf="isDocumentAttached"
                              class="flex items-center justify-between border border-[#C8E6C9] bg-[#E8F5E9] text-[#16834B] p-4 rounded-[6px] flex-1 min-h-[96px]">
                              <div class="flex items-center gap-2 overflow-hidden">
                                <span class="text-sm sm:text-[14.5px] font-bold truncate">✓ {{ attachedFileName }}</span>
                              </div>
                              <div class="flex gap-4 shrink-0">
                                <button type="button" (click)="viewAttachedDocument()" class="text-sm sm:text-[14.5px] font-bold hover:underline text-[#16834B] focus:outline-none cursor-pointer">
                                  View
                                </button>
                                <button type="button" (click)="removeAttachedDocument()" class="text-sm sm:text-[14.5px] font-bold hover:underline text-[#C62828] focus:outline-none cursor-pointer">
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>

                          <!-- Remarks -->
                          <div class="space-y-1.5">
                            <label class="block font-bold text-[#172B3A] text-xs sm:text-[14px]">
                              Remarks (Max 500 words) <span class="text-[#C62828]">*</span>
                            </label>
                            <textarea 
                              formControlName="remarks"
                              placeholder="Enter your confirmation remarks here..."
                              class="w-full h-[96px] p-3 border border-[#D9E1E8] bg-white focus:border-[#0B3558] text-sm sm:text-[14px] text-[#172B3A] font-medium rounded-[6px] resize-none focus:outline-none leading-relaxed"></textarea>
                          </div>
                        </div>

                        <div class="flex items-center justify-end gap-3 pt-3">
                          <button 
                            type="button" 
                            (click)="pendingAction = null; removeAttachedDocument(); reviewForm.reset()"
                            class="px-6 py-2.5 border border-[#D9E1E8] bg-[#F6F8FA] hover:bg-slate-200 text-[#172B3A] text-sm sm:text-[14.5px] font-bold rounded-[6px] transition-colors cursor-pointer">
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            (click)="executeDecision()"
                            [disabled]="reviewForm.get('remarks')?.invalid || !isDocumentAttached"
                            [ngClass]="pendingAction === 'APPROVED' ? 'bg-[#16834B] hover:bg-[#11683B]' : 'bg-[#C62828] hover:bg-[#A31F1F]'"
                            class="px-7 py-2.5 text-white text-sm sm:text-[14.5px] font-bold transition-colors rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed flex gap-1.5 items-center cursor-pointer shadow-none">
                            {{ pendingAction === 'APPROVED' ? '✓ Submit Approval' : '✕ Submit Rejection' }}
                          </button>
                        </div>
                      </div>
                    </ng-container>

                    <ng-template #decisionBadge>
                      <div 
                        class="w-full py-2.5 rounded-[6px] font-semibold text-xs tracking-wide flex items-center justify-center text-white"
                        [ngClass]="selectedApplicant?.scrutinyStatus === 'APPROVED' ? 'bg-[#16834B]' : 'bg-[#C62828]'">
                        {{ selectedApplicant?.scrutinyStatus === 'APPROVED' ? '✓ Accepted' : '✕ Rejected' }}
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
  selectedApplicant: ApplicantResponse | null = null;
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
  ) { }

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
        this.selectedApplicant = responses.find(r => r.applicationId === id) || null;
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
    if (!this.selectedApplicant || !this.pendingAction) return;

    this.eoiService.updateScrutinyDecision(this.selectedApplicant.applicationId, {
      status: this.pendingAction,
      grade: this.pendingAction === 'APPROVED' ? this.reviewForm.value.grade : undefined,
      remarks: this.reviewForm.value.remarks
    });

    this.selectedApplicant = {
      ...this.selectedApplicant,
      scrutinyStatus: this.pendingAction,
      currentGrade: this.pendingAction === 'APPROVED' ? this.reviewForm.value.grade : null,
      emdStatus: this.pendingAction === 'REJECTED' ? 'REFUNDED' : 'PAID'
    };

    this.showConfirmModal = false;
    this.decisionTaken = true;
  }
}
