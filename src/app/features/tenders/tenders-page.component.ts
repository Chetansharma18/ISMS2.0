import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

export interface SchemeTender {
  sNo: number;
  refNo: string;
  schemeTitle: string;
  code: string;
  category: string;
  datePublished: string;
  closingDate: string;
  status: 'Open' | 'Closed';
  rfpDocSize?: string;
  sopDocSize?: string;
  preBidDate?: string;
  techBidDate?: string;
  emdFee?: string;
  processFee?: string;
}

@Component({
  selector: 'app-tenders-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800">
      
      <!-- ====================================================================
           VIEW 1: ACTIVE SCHEMES & TENDERS TABLE (Matching Screenshot 1)
           ==================================================================== -->
      @if (!selectedScheme()) {
        <div class="p-6 sm:p-8 space-y-5">
          
          <!-- Top Page Header -->
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-[#0B3558] tracking-tight">
              Active Schemes &amp; Tenders
            </h1>
          </div>

          <!-- Incomplete Profile Notice Banner (Matching Screenshot 1) -->
          @if (isProfileIncomplete()) {
            <div class="bg-amber-50/90 border border-amber-300/80 rounded-md p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 class="text-xs sm:text-[13px] font-bold text-amber-900">
                  Please complete your profile first
                </h4>
                <p class="text-[11px] sm:text-xs text-amber-800 mt-0.5">
                  Your entity profile is currently incomplete. Please complete your profile to submit EOI.
                </p>
              </div>

              <a
                routerLink="/registration"
                class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white text-xs font-bold rounded shadow-xs whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Complete Profile Now</span>
                <span>&rarr;</span>
              </a>
            </div>
          }

          <!-- Schemes Table (Exact Match to Screenshot 1) -->
          <div class="border border-slate-200 rounded-md overflow-hidden overflow-x-auto shadow-2xs">
            <table class="w-full text-left border-collapse text-xs">
              <!-- Dark Navy Table Header -->
              <thead>
                <tr class="bg-[#0B3558] text-white text-[11px] font-bold uppercase tracking-wider select-none">
                  <th class="py-3 px-3 w-12 text-center border-r border-[#1a4a74]">S.NO</th>
                  <th class="py-3 px-4 border-r border-[#1a4a74]">EOI REFERENCE NO.</th>
                  <th class="py-3 px-4 border-r border-[#1a4a74]">SCHEME &amp; DEPARTMENT CHAIN</th>
                  <th class="py-3 px-3 text-center border-r border-[#1a4a74]">CATEGORY</th>
                  <th class="py-3 px-4 border-r border-[#1a4a74]">DATE PUBLISHED</th>
                  <th class="py-3 px-4 border-r border-[#1a4a74]">CLOSING DATE</th>
                  <th class="py-3 px-3 text-center w-24">ACTIONS</th>
                </tr>
              </thead>

              <!-- Table Rows -->
              <tbody class="divide-y divide-slate-200 bg-white font-medium">
                @for (item of schemes; track item.sNo) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <!-- S.No -->
                    <td class="py-3.5 px-3 text-center font-bold text-slate-700">
                      {{ item.sNo }}
                    </td>

                    <!-- EOI Reference No -->
                    <td class="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {{ item.refNo }}
                    </td>

                    <!-- Scheme & Department Chain -->
                    <td class="py-3.5 px-4 font-bold text-slate-900">
                      {{ item.schemeTitle }}
                    </td>

                    <!-- Category -->
                    <td class="py-3.5 px-3 text-center font-semibold text-slate-600">
                      {{ item.category }}
                    </td>

                    <!-- Date Published -->
                    <td class="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div class="flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{{ item.datePublished }}</span>
                      </div>
                    </td>

                    <!-- Closing Date -->
                    <td class="py-3.5 px-4 text-slate-700 font-semibold whitespace-nowrap">
                      <div class="flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{{ item.closingDate }}</span>
                      </div>
                    </td>

                    <!-- Actions: View Button -->
                    <td class="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        (click)="viewSchemeDetails(item)"
                        class="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-100 hover:bg-[#0B3558] text-[#0B3558] hover:text-white font-bold text-[11px] transition-colors border border-slate-300 hover:border-[#0B3558] cursor-pointer"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

        </div>
      }

      <!-- ====================================================================
           VIEW 2: SCHEME DETAILS VIEW (Matching Screenshot 2)
           ==================================================================== -->
      @if (selectedScheme(); as s) {
        <div class="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          
          <!-- Breadcrumb Link -->
          <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <button
              type="button"
              (click)="backToList()"
              class="text-[#0B3558] hover:underline font-bold cursor-pointer"
            >
              &larr; All Tenders List
            </button>
            <span>/</span>
            <span>EOI Schemes</span>
            <span>/</span>
            <span class="text-slate-800 font-bold">{{ s.code }}</span>
          </div>

          <!-- Scheme Title & Apply Button Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <h1 class="text-xl sm:text-2xl font-black text-[#0B3558] tracking-tight">
              {{ s.schemeTitle }}
            </h1>

            <button
              type="button"
              (click)="handleApplyForScheme()"
              class="px-5 py-2.5 rounded-lg bg-[#0B3558] hover:bg-[#07233B] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Apply for this Scheme</span>
              <span>&rarr;</span>
            </button>
          </div>

          <!-- Section 1: Scheme Related Official Documents & RFP -->
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 class="text-sm font-bold text-slate-900 tracking-tight">
                Scheme Related Official Documents &amp; RFP
              </h2>
            </div>
            <p class="text-xs text-slate-500 -mt-1">
              Download standard tender terms, technical specifications, and financial bid schedules for {{ s.code }}.
            </p>

            <div class="space-y-2.5 pt-1">
              <!-- Document 1 -->
              <div class="flex items-center justify-between p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3">
                  <span class="px-2 py-1 rounded bg-rose-100 text-rose-700 font-bold text-[10px] tracking-wider uppercase">PDF</span>
                  <div>
                    <h4 class="text-xs font-bold text-slate-800">
                      Official Request for Proposal (RFP) &amp; Tender Terms
                    </h4>
                    <p class="text-[11px] text-slate-500 mt-0.5">
                      Size: {{ s.rfpDocSize || '2.4 MB' }} &bull; Published: {{ s.datePublished }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="downloadDoc('RFP Document')"
                  class="px-3.5 py-1.5 rounded bg-[#0B3558] hover:bg-[#07233B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
              </div>

              <!-- Document 2 -->
              <div class="flex items-center justify-between p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3">
                  <span class="px-2 py-1 rounded bg-rose-100 text-rose-700 font-bold text-[10px] tracking-wider uppercase">PDF</span>
                  <div>
                    <h4 class="text-xs font-bold text-slate-800">
                      Standard Operating Procedure (SOP) for Training Partners
                    </h4>
                    <p class="text-[11px] text-slate-500 mt-0.5">
                      Size: {{ s.sopDocSize || '1.8 MB' }} &bull; Published: {{ s.datePublished }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="downloadDoc('SOP Document')"
                  class="px-3.5 py-1.5 rounded bg-[#0B3558] hover:bg-[#07233B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Section 2: Critical EOI Milestones & Schedule Matrix -->
          <div class="space-y-3 pt-2">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-[#0B3558]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-sm font-bold text-slate-900 tracking-tight">
                Critical EOI Milestones &amp; Schedule Matrix
              </h2>
            </div>

            <div class="border border-slate-200 rounded-md overflow-hidden overflow-x-auto shadow-2xs">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-[#0B3558] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th class="py-2.5 px-3 w-12 text-center border-r border-[#1a4a74]">S.No</th>
                    <th class="py-2.5 px-4 border-r border-[#1a4a74]">Milestone / Event Stage</th>
                    <th class="py-2.5 px-4 border-r border-[#1a4a74]">Date &amp; Time</th>
                    <th class="py-2.5 px-4">Details &amp; Remarks</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 bg-white font-medium text-slate-700">
                  <tr>
                    <td class="py-2.5 px-3 text-center font-bold">1</td>
                    <td class="py-2.5 px-4 font-bold text-slate-800">Date of EOI Published</td>
                    <td class="py-2.5 px-4 font-mono">{{ s.datePublished }} 01:00 PM</td>
                    <td class="py-2.5 px-4 text-slate-500">Published on official state tender bulletin</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-3 text-center font-bold">2</td>
                    <td class="py-2.5 px-4 font-bold text-slate-800">Pre-Bid Meeting</td>
                    <td class="py-2.5 px-4 font-mono">{{ s.preBidDate || '10-Sep-2026 11:30 AM' }}</td>
                    <td class="py-2.5 px-4 text-slate-500">Held at RSLDC Head Office, Jhalana Doongri, Jaipur</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-3 text-center font-bold">3</td>
                    <td class="py-2.5 px-4 font-bold text-slate-800">Closing Date of EOI Submission</td>
                    <td class="py-2.5 px-4 font-mono text-rose-700 font-bold">{{ s.closingDate }}</td>
                    <td class="py-2.5 px-4 text-rose-600 font-semibold">Strict deadline: No proposals accepted after portal closing time.</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-3 text-center font-bold">4</td>
                    <td class="py-2.5 px-4 font-bold text-slate-800">Technical Bid Opening Date</td>
                    <td class="py-2.5 px-4 font-mono">{{ s.techBidDate || '18-Sep-2026 02:30 PM' }}</td>
                    <td class="py-2.5 px-4 text-slate-500">Online scrutiny &amp; empanelment desk opening</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section 3: Submission & Financial Parameters -->
          <div class="space-y-3 pt-2">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-[#0B3558]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h2 class="text-sm font-bold text-slate-900 tracking-tight">
                Submission &amp; Financial Parameters
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Deadline card -->
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SUBMISSION DEADLINE (CLOSING DATE)</span>
                <p class="text-sm font-black text-slate-900 mt-1 font-mono">{{ s.closingDate }}</p>
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                  Status: Open for Proposal Submission (20 Days Left)
                </span>
              </div>

              <!-- EMD Fee card -->
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">EMD FEE</span>
                <p class="text-lg font-black text-[#0B3558] mt-1">{{ s.emdFee || '₹50,000' }}</p>
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                  &check; 100% Refundable
                </span>
              </div>

              <!-- Process Fee card -->
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">PROCESS FEE</span>
                <p class="text-lg font-black text-slate-900 mt-1">{{ s.processFee || '₹2,000' }}</p>
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1">
                  Non-Refundable
                </span>
              </div>
            </div>
          </div>

        </div>
      }

      <!-- ====================================================================
           MODAL: PROFILE INCOMPLETE WARNING ON APPLY CLICK
           ==================================================================== -->
      @if (showApplyBlockedModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 text-center animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
            <!-- Top Amber Line -->
            <div class="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>

            <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 class="text-lg font-black text-slate-900 tracking-tight">
              Please complete your profile first
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Your entity profile is currently incomplete. You cannot apply for <strong>{{ selectedScheme()?.schemeTitle }}</strong> without completing your One Time Registration (OTR) profile first.
            </p>

            <div class="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                (click)="showApplyBlockedModal.set(false)"
                class="w-full sm:flex-1 py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel / Browse
              </button>
              <button
                type="button"
                (click)="goToRegistration()"
                class="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#0B3558] hover:bg-[#07233B] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Fill OTR Form Now</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class TendersPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  readonly isProfileIncomplete = computed(() => {
    const user = this.currentUser();
    if (!user) return true;
    if (user.role === 'new_user') return true;
    return user.isProfileComplete === false;
  });

  selectedScheme = signal<SchemeTender | null>(null);
  showApplyBlockedModal = signal<boolean>(false);

  // Exact 6 schemes from Screenshot 1
  schemes: SchemeTender[] = [
    {
      sNo: 1,
      refNo: 'RSLDC/EOI/2026/MMKVY-01',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      code: 'MMKVY-RAJKVIK',
      category: 'RAJKVIK',
      datePublished: '31-Aug-2026',
      closingDate: '15-Sep-2026 02:00 PM',
      status: 'Open',
      rfpDocSize: '2.4 MB',
      sopDocSize: '1.8 MB',
      preBidDate: '10-Sep-2026 11:30 AM',
      techBidDate: '18-Sep-2026 02:30 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 2,
      refNo: 'RSLDC/EOI/2026/SAMARTH-02',
      schemeTitle: 'SAMARTH Skill Development Scheme',
      code: 'SAMARTH-RSLDC',
      category: 'NA',
      datePublished: '01-Sep-2026',
      closingDate: '15-Oct-2026 03:00 PM',
      status: 'Open',
      rfpDocSize: '3.1 MB',
      sopDocSize: '2.0 MB',
      preBidDate: '18-Sep-2026 11:00 AM',
      techBidDate: '20-Oct-2026 03:30 PM',
      emdFee: '₹75,000',
      processFee: '₹2,500'
    },
    {
      sNo: 3,
      refNo: 'RSLDC/EOI/2026/MMKVY-03',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      code: 'MMKVY-SAMARTH',
      category: 'SAMARTH',
      datePublished: '03-Sep-2026',
      closingDate: '20-Oct-2026 05:00 PM',
      status: 'Open',
      rfpDocSize: '2.8 MB',
      sopDocSize: '1.5 MB',
      preBidDate: '22-Sep-2026 02:00 PM',
      techBidDate: '25-Oct-2026 04:00 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 4,
      refNo: 'RSLDC/EOI/2026/ELSTP-01',
      schemeTitle: 'Employment Linked Skill Training Programme (ELSTP)',
      code: 'ELSTP-PHASE4',
      category: 'NA',
      datePublished: '25-Aug-2026',
      closingDate: '17-Sep-2026 11:00 AM',
      status: 'Open',
      rfpDocSize: '4.2 MB',
      sopDocSize: '2.2 MB',
      preBidDate: '05-Sep-2026 11:00 AM',
      techBidDate: '20-Sep-2026 02:00 PM',
      emdFee: '₹1,00,000',
      processFee: '₹3,000'
    },
    {
      sNo: 5,
      refNo: 'DSEE/EOI/2026/RYSY-02',
      schemeTitle: 'Rajasthan Yuva Sambal Yojana (RYSY)',
      code: 'RYSY-SAKSHM',
      category: 'SAKSHM',
      datePublished: '08-Sep-2026',
      closingDate: '28-Oct-2026 03:00 PM',
      status: 'Open',
      rfpDocSize: '2.1 MB',
      sopDocSize: '1.4 MB',
      preBidDate: '25-Sep-2026 03:00 PM',
      techBidDate: '02-Nov-2026 03:00 PM',
      emdFee: '₹40,000',
      processFee: '₹1,500'
    },
    {
      sNo: 6,
      refNo: 'NORD/EOI/2026/DDUGKY-03',
      schemeTitle: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
      code: 'DDU-GKY-RAJ',
      category: 'NA',
      datePublished: '25-Aug-2026',
      closingDate: '17-Sep-2026 11:00 AM',
      status: 'Open',
      rfpDocSize: '3.6 MB',
      sopDocSize: '2.5 MB',
      preBidDate: '04-Sep-2026 11:00 AM',
      techBidDate: '20-Sep-2026 03:00 PM',
      emdFee: '₹60,000',
      processFee: '₹2,000'
    }
  ];

  viewSchemeDetails(scheme: SchemeTender): void {
    this.selectedScheme.set(scheme);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToList(): void {
    this.selectedScheme.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleApplyForScheme(): void {
    // Check if profile is incomplete
    if (this.isProfileIncomplete()) {
      this.showApplyBlockedModal.set(true);
      return;
    }

    // If profile is complete, navigate to scheme proposal form with scheme info
    const scheme = this.selectedScheme();
    this.router.navigate(['/scheme-form'], {
      queryParams: {
        refNo: scheme?.refNo || 'RSLDC/EOI/2026/MMKVY-01',
        title: scheme?.schemeTitle || 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
        category: scheme?.category || 'Category I: RAJKVIK',
        emdFee: scheme?.emdFee || '₹50,000',
        processFee: scheme?.processFee || '₹2,000'
      }
    });
  }

  goToRegistration(): void {
    this.showApplyBlockedModal.set(false);
    this.router.navigate(['/registration']);
  }

  downloadDoc(docType: string): void {
    const s = this.selectedScheme();
    alert(`Downloading ${docType} for ${s?.schemeTitle} (${s?.refNo})...`);
  }
}
