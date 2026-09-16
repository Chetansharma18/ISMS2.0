import { Component, OnInit } from '@angular/core';
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
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#F4F7F9] font-sans text-slate-800 antialiased">
      <app-header></app-header>

      <div class="flex flex-grow">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block"></app-sidebar>

        <!-- Main Content Area -->
        <main class="flex-grow px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto">
          
          <!-- Top Breadcrumb & Title Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 mb-6">
            <div>
              <div class="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                <a routerLink="/admin/eoi-view" class="text-[#131A4D] hover:underline">EOI View</a>
                <span>/</span>
                <a routerLink="/admin/responses/all" class="text-[#131A4D] hover:underline">Responses</a>
                <span>/</span>
                <span class="font-bold text-slate-700">{{ selectedApplicant?.applicationId }}</span>
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
                    Submission Date: {{ selectedApplicant?.submissionDate }}
                  </span>
                </div>

                <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div>
                    <span class="text-slate-400 block text-[11px]">Scheme Name:</span>
                    <span class="font-bold text-slate-900 text-sm">{{ selectedApplicant?.schemeName }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Application Reference ID:</span>
                    <span class="font-mono font-bold text-[#131A4D]">{{ selectedApplicant?.applicationId }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Target Training Capacity:</span>
                    <span class="font-mono font-bold text-slate-900">{{ selectedApplicant?.proposalCapacity }} Candidates / Year</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Proposed Rajasthan District Centers:</span>
                    <div class="flex flex-wrap gap-1.5 mt-1">
                      <span *ngFor="let dist of selectedApplicant?.proposedDistricts" class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] rounded-full">
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
                  <div><span class="text-slate-400 block text-[11px]">Application No.</span><span class="font-mono font-bold text-[#131A4D]">{{ selectedApplicant?.applicationId || 'ISMS-TP-892134' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">TP/PIA Full Name</span><span class="font-bold text-slate-900">{{ selectedApplicant?.organizationName || 'N/A' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">TP/PIA Short Name</span><span class="font-bold text-slate-900">APEX-TECH</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Registration Number</span><span class="font-mono text-slate-900">{{ selectedApplicant?.registrationNumber || 'N/A' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Organisation Contact No.</span><span class="font-mono text-slate-800">{{ selectedApplicant?.contactMobile || '+91 98201 44520' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Company Email-ID</span><span class="font-mono text-slate-800">{{ selectedApplicant?.contactEmail || 'contact@example.com' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Organisation PAN No.</span><span class="font-mono font-bold text-slate-900">{{ selectedApplicant?.pan || 'AABCA1294F' }}</span></div>
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
                  <div><span class="text-slate-400 block text-[11px]">Name</span><span class="font-bold text-slate-900">{{ selectedApplicant?.applicantName || 'Vikramaditya Sharma' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">S/O, D/O, W/O</span><span class="text-slate-900">Shri R.K. Sharma</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Date of Birth</span><span class="font-mono text-slate-900">14/08/1982</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Age</span><span class="font-mono text-slate-900">44</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Designation</span><span class="text-slate-900">Managing Director</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Mobile No.</span><span class="font-mono text-slate-800">{{ selectedApplicant?.contactMobile || '+91 98201 44520' }}</span></div>
                  <div><span class="text-slate-400 block text-[11px]">Email-Id</span><span class="font-mono text-slate-800">{{ selectedApplicant?.contactEmail || 'v.sharma@apextechnical.in' }}</span></div>
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
          <div *ngIf="showActionPanel" class="max-w-2xl mx-auto animate-in fade-in duration-300">
            
            <!-- Back Button -->
            <button (click)="showActionPanel = false" class="mb-4 text-slate-500 hover:text-[#131A4D] font-bold text-sm flex items-center gap-1.5 transition-colors">
              <span>←</span> Back to Details
            </button>
              
              <div class="bg-white border-2 border-[#131A4D] shadow-md">
                
                <!-- Panel Header -->
                <div class="bg-[#131A4D] text-white px-5 py-3">
                  <h3 class="text-sm font-bold tracking-wide">
                    Scrutiny Officer Action Panel
                  </h3>
                  <div class="text-[10px] text-blue-200 font-mono">
                    Evaluation & Empanelment Decision
                  </div>
                </div>

                <!-- Action Form -->
                <form [formGroup]="reviewForm" class="p-5 space-y-4 text-xs">
                  
                  <!-- 1. Proposed Proposal PDF -->
                  <div class="space-y-1">
                    <label class="block font-bold text-[#131A4D]">
                      Proposed Proposal PDF
                    </label>
                    <div class="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-base">📄</span>
                        <div>
                          <div class="font-bold text-slate-900">Bidder Proposal</div>
                          <div class="text-[10px] text-slate-500 font-mono">3.2 MB PDF</div>
                        </div>
                      </div>
                      <button type="button" class="text-xs text-[#131A4D] font-bold hover:underline">View</button>
                    </div>
                  </div>

                  <!-- 2. Grading Dropdown -->
                  <div class="space-y-1 pt-1">
                    <label class="block font-bold text-[#131A4D]">
                      Grade (A-E) <span class="text-red-600">*</span>
                    </label>
                    <select 
                      formControlName="grade"
                      class="w-full px-3 py-2 border border-slate-300 bg-white focus:border-[#131A4D] font-bold text-slate-800">
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                      <option value="D">Grade D</option>
                      <option value="E">Grade E</option>
                    </select>
                  </div>

                  <!-- 3. Technical Score -->
                  <div class="space-y-1 pt-1">
                    <label class="block font-bold text-[#131A4D]">
                      Technical Score (0-100) <span class="text-red-600">*</span>
                    </label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 85"
                      class="w-full px-3 py-2 border border-slate-300 bg-white focus:border-[#131A4D] font-bold text-slate-800">
                  </div>

                  <!-- Success/Decision Alert Notice -->
                  <div *ngIf="decisionTaken" class="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded">
                    ✓ Scrutiny decision recorded successfully! Status updated on applicant portal.
                  </div>

                  <!-- 4. Decision Action / Final Status -->
                  <div class="pt-3 space-y-2">
                    
                    <ng-container *ngIf="selectedApplicant?.scrutinyStatus === 'UNDER_SCRUTINY'; else decisionBadge">
                      <!-- Accept Button -->
                      <button 
                        type="button" 
                        (click)="confirmDecision('APPROVED')"
                        class="w-full py-2.5 rounded-full bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs tracking-wide transition-colors shadow-xs flex items-center justify-center gap-1.5">
                        <span>✓ Accept Bidder</span>
                      </button>

                      <!-- Reject Button -->
                      <button 
                        type="button" 
                        (click)="confirmDecision('REJECTED')"
                        class="w-full py-2.5 rounded-full bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-bold text-xs tracking-wide transition-colors shadow-xs flex items-center justify-center gap-1.5">
                        <span>✕ Reject Bidder</span>
                      </button>
                    </ng-container>

                    <ng-template #decisionBadge>
                      <div 
                        class="w-full py-2.5 rounded-full font-bold text-xs tracking-wide flex items-center justify-center text-white"
                        [ngClass]="selectedApplicant?.scrutinyStatus === 'APPROVED' ? 'bg-[#166534]' : 'bg-[#991b1b]'">
                        {{ selectedApplicant?.scrutinyStatus === 'APPROVED' ? '✓ Accepted' : '✕ Rejected' }}
                      </div>
                    </ng-template>

                  </div>

                </form>

              </div>

            </div>
        </main>
      </div>

      <!-- Confirmation Modal Dialog -->
      <div *ngIf="showConfirmModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white border-2 border-slate-400 max-w-md w-full shadow-2xl p-6 space-y-4">
          
          <div class="flex items-center">
            <h4 class="text-base font-bold text-slate-900">
              {{ pendingAction === 'APPROVED' ? 'Confirm Acceptance' : 'Confirm Rejection' }}
            </h4>
          </div>

          <div class="text-xs text-slate-700 leading-relaxed border-t border-slate-200 pt-3">
            <p *ngIf="pendingAction === 'APPROVED'">
              You are officially approving <strong>{{ selectedApplicant?.organizationName }}</strong> for the <strong>{{ selectedApplicant?.schemeName }}</strong> tender.
            </p>
            <p *ngIf="pendingAction === 'REJECTED'">
              You are rejecting this application. This will notify the applicant and trigger an EMD refund.
            </p>
          </div>

          <!-- Upload Document -->
          <div class="space-y-1">
            <label class="block font-bold text-[#131A4D] text-xs">
              {{ pendingAction === 'APPROVED' ? 'Mandatory Approval Document' : 'Mandatory Rejection Document' }} <span class="text-red-600">*</span>
            </label>
            <div 
              (click)="isDocumentAttached = true"
              [ngClass]="isDocumentAttached ? 'border-emerald-500 bg-emerald-50 text-emerald-700 border-solid' : 'border-slate-300 border-dashed bg-slate-50 hover:bg-slate-100 text-[#131A4D]'"
              class="border p-3 text-center transition-colors cursor-pointer rounded">
              <span class="text-xs font-semibold">
                {{ isDocumentAttached ? '✓ Document Attached' : '📎 Attach Document' }}
              </span>
            </div>
          </div>

          <!-- Remarks -->
          <form [formGroup]="reviewForm" class="space-y-1">
            <label class="block font-bold text-[#131A4D] text-xs">
              Remarks (Max 500 words) <span class="text-red-600">*</span>
            </label>
            <textarea 
              formControlName="remarks"
              rows="4" 
              placeholder="Enter your confirmation remarks here..."
              class="w-full px-3 py-2 border border-slate-300 bg-white focus:border-[#131A4D] text-xs text-slate-900"></textarea>
          </form>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              (click)="showConfirmModal = false"
              class="px-4 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full">
              Cancel
            </button>
            <button 
              type="button" 
              (click)="executeDecision()"
              [disabled]="reviewForm.get('remarks')?.invalid || !isDocumentAttached"
              [ngClass]="pendingAction === 'APPROVED' ? 'bg-[#166534] hover:bg-[#14532d]' : 'bg-[#991b1b] hover:bg-[#7f1d1d]'"
              class="px-5 py-2 text-white text-xs font-bold transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
              Confirm Decision
            </button>
          </div>

        </div>
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
  showActionPanel = false;

  constructor(
    private fb: FormBuilder,
    private eoiService: EoiStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      grade: ['A', Validators.required],
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
