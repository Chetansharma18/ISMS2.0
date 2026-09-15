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
        <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto">
          
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
              <p class="text-xs text-slate-500 mt-0.5">
                Official Department Scrutiny · Verify statutory corporate records, proposed project capacity & assign TP grade.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs px-3 py-1 bg-white border border-slate-200 font-mono font-bold text-slate-700 shadow-2xs">
                Status: <strong class="text-[#131A4D]">{{ selectedApplicant?.scrutinyStatus }}</strong>
              </span>
            </div>
          </div>

          <!-- Two-Column Layout: Left (8 Cols Applicant Profile Recap) | Right (4 Cols Admin Scrutiny Panel) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Left 8 Cols: Full Read-Only Recap of Applicant's EOI Form + Profile -->
            <div class="lg:col-span-8 space-y-6">
              
              <!-- 1. Scheme & EOI Submission Details Box -->
              <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-[#131A4D] text-white px-5 py-2.5 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">🏛</span>
                    <h2 class="text-xs font-bold uppercase tracking-wider">
                      Applied Tender Specification
                    </h2>
                  </div>
                  <span class="text-[10px] font-mono text-blue-200">
                    Submission Date: {{ selectedApplicant?.submissionDate }}
                  </span>
                </div>

                <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div class="sm:col-span-2">
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
                  <div class="sm:col-span-2">
                    <span class="text-slate-400 block text-[11px]">Proposed Rajasthan District Centers:</span>
                    <div class="flex flex-wrap gap-1.5 mt-1">
                      <span *ngFor="let dist of selectedApplicant?.proposedDistricts" class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px]">
                        📍 {{ dist }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Corporate Entity Master Record -->
              <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
                  <span class="text-xs font-bold text-[#131A4D] uppercase tracking-wider">
                    1. Verified Entity & Signatory Profile
                  </span>
                  <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-xs">
                    ✓ Verified Master Record
                  </span>
                </div>

                <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div>
                    <span class="text-slate-400 block text-[11px]">Legal Entity Name:</span>
                    <span class="font-bold text-slate-900">{{ selectedApplicant?.organizationName }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Authorized Signatory:</span>
                    <span class="font-bold text-slate-900">{{ selectedApplicant?.applicantName }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">PAN Number:</span>
                    <span class="font-mono font-bold text-slate-900">{{ selectedApplicant?.pan }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">GSTIN Registration:</span>
                    <span class="font-mono font-bold text-slate-900">{{ selectedApplicant?.gstin }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Official Communication Email:</span>
                    <span class="font-mono text-slate-800">{{ selectedApplicant?.contactEmail }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Registered Contact Mobile:</span>
                    <span class="font-mono text-slate-800">{{ selectedApplicant?.contactMobile }}</span>
                  </div>
                </div>
              </div>

              <!-- 3. Statutory Uploaded Documents Verification -->
              <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 border-b border-slate-200 px-5 py-2.5">
                  <span class="text-xs font-bold text-[#131A4D] uppercase tracking-wider">
                    2. Uploaded Tender Documents
                  </span>
                </div>

                <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div class="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">📄</span>
                      <div>
                        <div class="font-bold text-slate-900">Certificate of Incorporation</div>
                        <div class="text-[10px] text-slate-500 font-mono">1.4 MB PDF</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs text-[#131A4D] font-bold hover:underline">View</button>
                  </div>

                  <div class="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">📄</span>
                      <div>
                        <div class="font-bold text-slate-900">Audited FY25 Balance Sheet</div>
                        <div class="text-[10px] text-slate-500 font-mono">3.8 MB PDF · CA Certified</div>
                      </div>
                    </div>
                    <button type="button" class="text-xs text-[#131A4D] font-bold hover:underline">View</button>
                  </div>
                </div>
              </div>

              <!-- 4. EMD Fee Verification Box -->
              <div class="bg-white border border-slate-300 p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span class="text-slate-400 block text-[11px]">Earnest Money Deposit (EMD):</span>
                  <div class="text-base font-mono font-bold text-slate-900">
                    ₹{{ selectedApplicant?.emdAmount | number:'1.0-0' }} <span class="text-xs font-normal text-emerald-700">· Transaction Verified (TXN-ISMS-884920482)</span>
                  </div>
                </div>
                <span class="px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded">
                  ✓ PAID
                </span>
              </div>

            </div>

            <!-- Right 4 Cols: Department Admin Scrutiny Action Panel -->
            <div class="lg:col-span-4 sticky top-20 space-y-6">
              
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
                  
                  <!-- 1. Grading / Category Dropdown -->
                  <div class="space-y-1">
                    <label class="block font-bold text-[#131A4D]">
                      Assign Training Partner (TP) Grade <span class="text-red-600">*</span>
                    </label>
                    <select 
                      formControlName="grade"
                      class="w-full px-3 py-2 border border-slate-300 bg-white focus:border-[#131A4D] font-bold text-slate-800">
                      <option value="A">Grade A (Turnover > 5 Cr · Mega Training Partner)</option>
                      <option value="B">Grade B (Turnover 1 - 5 Cr · Standard Partner)</option>
                      <option value="C">Grade C (Startup / District Level Partner)</option>
                    </select>
                    <p class="text-[10px] text-slate-500">
                      Determines batch allocation ceiling and mobilization quota.
                    </p>
                  </div>

                  <!-- 2. Upload Scrutiny Attachments -->
                  <div class="space-y-1 pt-1">
                    <label class="block font-bold text-[#131A4D]">
                      Upload Scrutiny Note / Inspection Audit (Optional)
                    </label>
                    <div class="border border-dashed border-slate-300 p-3 bg-slate-50 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                      <span class="text-xs text-[#131A4D] font-semibold">📎 Attach Department Scrutiny PDF</span>
                      <div class="text-[10px] text-slate-400 mt-0.5">Signed evaluation remarks sheet</div>
                    </div>
                  </div>

                  <!-- 3. Official Remarks / Reason -->
                  <div class="space-y-1 pt-1">
                    <label class="block font-bold text-[#131A4D]">
                      Officer Remarks / Scrutiny Reason <span class="text-red-600">*</span>
                    </label>
                    <textarea 
                      formControlName="remarks"
                      rows="4" 
                      placeholder="Enter scrutiny evaluation remarks. (Required if rejecting to state rejection clause)..."
                      class="w-full px-3 py-2 border border-slate-300 bg-white focus:border-[#131A4D] text-xs text-slate-900"></textarea>
                  </div>

                  <!-- Success/Decision Alert Notice -->
                  <div *ngIf="decisionTaken" class="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded">
                    ✓ Scrutiny decision recorded successfully! Status updated on applicant portal.
                  </div>

                  <!-- 4. Decision Buttons (Accept vs Reject) -->
                  <div class="pt-3 space-y-2">
                    
                    <!-- Accept Button (--approve-700 #166534) -->
                    <button 
                      type="button" 
                      (click)="confirmDecision('APPROVED')"
                      class="w-full py-2.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs tracking-wide transition-colors shadow-xs flex items-center justify-center gap-1.5">
                      <span>✓ Accept & Empanel as Technical Partner</span>
                    </button>

                    <!-- Reject Button (--reject-700 #991b1b) -->
                    <button 
                      type="button" 
                      (click)="confirmDecision('REJECTED')"
                      class="w-full py-2.5 bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-bold text-xs tracking-wide transition-colors shadow-xs flex items-center justify-center gap-1.5">
                      <span>✕ Reject Submission & Refund EMD</span>
                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>

        </main>
      </div>

      <!-- Confirmation Modal Dialog -->
      <div *ngIf="showConfirmModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white border-2 border-slate-400 max-w-md w-full shadow-2xl p-6 space-y-4">
          
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ pendingAction === 'APPROVED' ? '🏛' : '⚠️' }}</span>
            <h4 class="text-base font-bold text-slate-900">
              {{ pendingAction === 'APPROVED' ? 'Confirm Technical Partner Empanelment' : 'Confirm Application Rejection & EMD Refund' }}
            </h4>
          </div>

          <div class="text-xs text-slate-700 leading-relaxed border-y border-slate-200 py-3">
            <p *ngIf="pendingAction === 'APPROVED'">
              You are officially approving <strong>{{ selectedApplicant?.organizationName }}</strong> for the <strong>{{ selectedApplicant?.schemeName }}</strong> tender under <strong>Grade {{ reviewForm.value.grade }}</strong>. This will issue their official Technical Partner certificate.
            </p>
            <p *ngIf="pendingAction === 'REJECTED'">
              You are rejecting this application. This will notify the applicant with your recorded remarks and immediately trigger an <strong>automatic EMD refund of ₹{{ selectedApplicant?.emdAmount | number:'1.0-0' }}</strong> to the original payment source.
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              (click)="showConfirmModal = false"
              class="px-4 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold">
              Cancel
            </button>
            <button 
              type="button" 
              (click)="executeDecision()"
              [ngClass]="pendingAction === 'APPROVED' ? 'bg-[#166534] hover:bg-[#14532d]' : 'bg-[#991b1b] hover:bg-[#7f1d1d]'"
              class="px-5 py-2 text-white text-xs font-bold transition-colors">
              Confirm & Finalize Decision
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

    const responses = this.eoiService.getApplicantResponses();
    this.selectedApplicant = responses[0] || null;
  }

  confirmDecision(action: 'APPROVED' | 'REJECTED'): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    this.pendingAction = action;
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
