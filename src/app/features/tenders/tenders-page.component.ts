import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

export interface SchemeTender {
  sNo: number;
  refNo: string;
  schemeName: string;
  schemeTitle?: string;
  schemeCategory: string;
  datePublished: string;
  closingDate: string;
  eoiCategory: string;
  eoiDescription: string;
  category?: string;
  code?: string;
  status?: 'Open' | 'Closed';
  rfpDocSize?: string;
  sopDocSize?: string;
  preBidDate?: string;
  techBidDate?: string;
  emdFee?: string;
  processFee?: string;
}

export interface EoiDocumentItem {
  sNo: number;
  name: string;
  size: string;
}

@Component({
  selector: 'app-tenders-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      
      <!-- ====================================================================
           VIEW 1: ACTIVE EOI TABLE (Matching Screenshot 2 layout & typography)
           ==================================================================== -->
      @if (!selectedScheme()) {
        <div class="p-6 sm:p-8 space-y-4">
          
          <!-- Path / Breadcrumbs with Home Icon -->
          <nav class="flex items-center gap-2 text-xs text-slate-500 font-normal" aria-label="Breadcrumb">
            <a routerLink="/" class="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0B3558] transition-colors">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </a>
            <span class="text-slate-400">/</span>
            <span class="text-slate-800 font-normal">Active EOI</span>
          </nav>

          <!-- Top Page Header -->
          <div class="pt-0.5">
            <h1 class="text-xl sm:text-2xl font-bold text-[#0B3558] tracking-tight">
              Active EOI
            </h1>
          </div>

          <!-- Incomplete Profile Notice Banner -->
          @if (isProfileIncomplete()) {
            <div class="bg-amber-50/90 border border-amber-300/80 rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 class="text-xs sm:text-[13px] font-semibold text-amber-900">
                  Please complete your profile first
                </h4>
                <p class="text-[11px] sm:text-xs text-amber-800 mt-0.5 font-normal">
                  Your entity profile is currently incomplete. Please complete your profile to submit EOI.
                </p>
              </div>

              <a
                routerLink="/registration"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs sm:text-[12.5px] font-medium shadow-xs hover:shadow transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Complete Registration</span>
                <span class="material-icons text-white text-[16px] leading-none shrink-0 select-none">arrow_forward</span>
              </a>
            </div>
          }

          <!-- Schemes Table (Matching Screenshot 2: Clean header, non-bold text, Inter font, View button) -->
          <div class="border border-slate-200 rounded-md overflow-hidden overflow-x-auto shadow-2xs">
            <table class="w-full text-left border-collapse text-xs">
              <!-- Soft Light Themed Table Header matching Screenshot 2 -->
              <thead>
                <tr class="bg-[#F4F7FB] text-slate-700 text-[11px] sm:text-[11.5px] font-semibold select-none border-b border-slate-200">
                  <th class="py-3 px-3 w-12 text-center border-r border-slate-200 whitespace-nowrap">S. No.</th>
                  <th class="py-3 px-3 border-r border-slate-200 whitespace-nowrap">EOI Reference No.</th>
                  <th class="py-3 px-3 border-r border-slate-200 whitespace-nowrap">Scheme Name</th>
                  <th class="py-3 px-3 border-r border-slate-200 whitespace-nowrap">Scheme Category</th>
                  <th class="py-3 px-3 border-r border-slate-200 whitespace-nowrap">Date of EOI Published</th>
                  <th class="py-3 px-3 border-r border-slate-200 whitespace-nowrap">Date of Closing</th>
                  <th class="py-3 px-3 border-r border-slate-200 whitespace-nowrap">EOI Category</th>
                  <th class="py-3 px-3 border-r border-slate-200">EOI Description</th>
                  <th class="py-3 px-3 text-center border-r border-slate-200 whitespace-nowrap w-24">View</th>
                </tr>
              </thead>

              <!-- Table Rows: Regular non-bold typography -->
              <tbody class="divide-y divide-slate-200 bg-white font-normal text-slate-700">
                @for (item of schemes; track item.sNo) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <!-- S. No. -->
                    <td class="py-3.5 px-3 text-center font-normal text-slate-700 border-r border-slate-100">
                      {{ item.sNo }}
                    </td>

                    <!-- EOI Reference No. -->
                    <td class="py-3.5 px-3 font-normal text-slate-800 whitespace-nowrap border-r border-slate-100">
                      {{ item.refNo }}
                    </td>

                    <!-- Scheme Name -->
                    <td class="py-3.5 px-3 font-normal text-slate-800 whitespace-nowrap border-r border-slate-100">
                      {{ item.schemeName }}
                    </td>

                    <!-- Scheme Category -->
                    <td class="py-3.5 px-3 font-normal text-slate-700 whitespace-nowrap border-r border-slate-100">
                      {{ item.schemeCategory }}
                    </td>

                    <!-- Date of EOI Published -->
                    <td class="py-3.5 px-3 font-normal text-slate-700 whitespace-nowrap border-r border-slate-100">
                      {{ item.datePublished }}
                    </td>

                    <!-- Last Date of EOI Submission -->
                    <td class="py-3.5 px-3 font-normal text-slate-700 whitespace-nowrap border-r border-slate-100">
                      {{ item.closingDate }}
                    </td>

                    <!-- EOI Category -->
                    <td class="py-3.5 px-3 font-normal text-slate-700 whitespace-nowrap border-r border-slate-100">
                      {{ item.eoiCategory }}
                    </td>

                    <!-- EOI Description -->
                    <td class="py-3.5 px-3 font-normal text-slate-600 text-[11.5px] leading-relaxed border-r border-slate-100 min-w-[260px] max-w-md">
                      {{ item.eoiDescription }}
                    </td>

                    <!-- View Action (Light Theme button with authentic Adobe PDF icon) -->
                    <td class="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        (click)="viewSchemeDetails(item)"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-[#0B3558] border border-sky-200 hover:border-sky-300 transition-colors font-normal text-xs cursor-pointer shadow-2xs"
                        title="View EOI Details"
                      >
                        <!-- Authentic Adobe PDF Icon -->
                        <svg class="w-3.5 h-3.5 shrink-0 select-none shadow-2xs" viewBox="0 0 24 24">
                          <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                          <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
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
           VIEW 2: SCHEME DETAILS VIEW (Matching Screenshot 1 & 2)
           ==================================================================== -->
      <!-- ====================================================================
           VIEW 2: SCHEME DETAILS & EOI DOCUMENTS VIEW (Matching Screenshot 1 & 2)
           ==================================================================== -->
      @if (selectedScheme(); as s) {
        <div class="p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
          
          <!-- Back Navigation Bar & Breadcrumb Path with Back Icon -->
          <div class="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200">
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="backToList()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-slate-700 hover:text-[#0B3558] bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer border border-slate-300/80"
                title="Back to Active EOI"
              >
                <!-- Material Arrow Back Icon -->
                <span class="material-icons text-slate-600 text-[16px] leading-none shrink-0 select-none">arrow_back</span>
                <span>Back to Active EOI</span>
              </button>

              <!-- Path with Material Home Icon -->
              <nav class="flex items-center gap-1.5 text-xs text-slate-500 font-normal" aria-label="Breadcrumb">
                <a routerLink="/" class="hover:text-[#0B3558] flex items-center gap-1 text-slate-600">
                  <span class="material-icons text-slate-400 text-[16px] leading-none shrink-0 select-none">home</span>
                  <span>Home</span>
                </a>
                <span class="text-slate-400">/</span>
                <button type="button" (click)="backToList()" class="hover:text-[#0B3558] hover:underline cursor-pointer bg-transparent border-0 p-0 text-xs text-slate-600 font-normal">
                  Active EOI
                </button>
                <span class="text-slate-400">/</span>
                <span class="text-slate-800 font-normal truncate max-w-xs sm:max-w-md">{{ s.schemeTitle || s.schemeName }}</span>
              </nav>
            </div>
          </div>

          <!-- SCHEME HEADER & DETAILS (Clean Background Presentation) -->
          <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <!-- Header Row: Title, Description & Light Theme Apply Button -->
            <div class="p-5 sm:p-6 space-y-4">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div class="space-y-1.5 max-w-4xl">
                  <!-- Scheme Heading -->
                  <h2 class="text-lg sm:text-xl font-bold text-[#0B3558] tracking-tight">
                    {{ s.schemeTitle || s.schemeName }}
                  </h2>
                  <!-- Scheme Description at bottom of heading -->
                  <p class="text-xs sm:text-[12.5px] text-slate-600 leading-relaxed font-normal">
                    {{ s.eoiDescription }}
                  </p>
                </div>

                <!-- Apply for this Scheme Button (Light Theme) -->
                <button
                  type="button"
                  (click)="handleApplyForScheme()"
                  class="px-4 py-2 rounded-md bg-sky-50 hover:bg-sky-100 text-[#0B3558] border border-sky-200 hover:border-sky-300 text-xs sm:text-[13px] font-semibold shadow-2xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Apply for this Scheme</span>
                  <span class="material-icons text-[#0B3558] text-[16px] leading-none shrink-0 select-none">arrow_forward</span>
                </button>
              </div>

              <!-- Table Fields Clean Presentation (Clean non-bold Inter font, Date of Closing, EMD Fee, Process Fee) -->
              <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-3.5 border-t border-slate-100 text-xs">
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI REFERENCE NO.</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1 break-all">{{ s.refNo }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME NAME</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.schemeName }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME CATEGORY</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.schemeCategory }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI CATEGORY</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.eoiCategory }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF EOI PUBLISHED</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.datePublished }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF CLOSING</span>
                  <span class="font-medium text-rose-600 text-[11.5px] block mt-1">{{ s.closingDate }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EMD FEE</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.emdFee || '₹50,000' }} <span class="text-[10px] text-slate-400 font-normal">(Refundable)</span></span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">PROCESSING FEE</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.processFee || '₹2,000' }} <span class="text-[10px] text-slate-400 font-normal">(Non-Refundable)</span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- ================================================================
               EOI DOCUMENTS TABLE (Matching Screenshot 1 & 2)
               ================================================================ -->
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <!-- Header Bar matching Screenshot 1 & 2 -->
            <div class="bg-[#F4F7FB] border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="material-icons text-slate-600 text-[18px] leading-none shrink-0 select-none">description</span>
                <h3 class="text-sm font-semibold tracking-tight text-[#0B3558]">
                  EOI Documents
                </h3>
              </div>
              <span class="text-[11px] sm:text-xs text-slate-500 font-normal">
                All official documents & formats required for EOI submission
              </span>
            </div>

            <!-- Documents Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-[#F4F7FB] text-slate-700 text-[11px] sm:text-[11.5px] font-semibold border-b border-slate-200">
                    <th class="py-2.5 px-3 w-12 text-center border-r border-slate-200 whitespace-nowrap">S. No.</th>
                    <th class="py-2.5 px-4 border-r border-slate-200">
                      <span>Documents</span> <span class="text-rose-500">*</span>
                    </th>
                    <th class="py-2.5 px-3 w-28 text-center border-r border-slate-200 whitespace-nowrap">Format</th>
                    <th class="py-2.5 px-3 w-28 text-center border-r border-slate-200 whitespace-nowrap">File Size</th>
                    <th class="py-2.5 px-4 w-32 text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
                  @for (doc of eoiDocuments; track doc.sNo) {
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <!-- S. No. -->
                      <td class="py-3 px-3 text-center text-slate-600 font-normal border-r border-slate-100">
                        {{ doc.sNo }}
                      </td>

                      <!-- Document Title with Authentic Adobe PDF Icon -->
                      <td class="py-3 px-4 text-slate-800 font-normal border-r border-slate-100">
                        <div class="flex items-center gap-2.5">
                          <!-- Actual PDF Icon -->
                          <svg class="w-4 h-4 shrink-0 select-none shadow-2xs" viewBox="0 0 24 24">
                            <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                            <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                          </svg>
                          <span class="text-xs sm:text-[12.5px] text-slate-800 font-normal leading-relaxed">{{ doc.name }}</span>
                        </div>
                      </td>

                      <!-- Format Badge -->
                      <td class="py-3 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                          PDF Format
                        </span>
                      </td>

                      <!-- File Size -->
                      <td class="py-3 px-3 text-center text-slate-500 font-normal text-[11.5px] whitespace-nowrap border-r border-slate-100">
                        {{ doc.size }}
                      </td>

                      <!-- Download Facility Button (Light Theme Button matching our theme) -->
                      <td class="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          (click)="downloadDoc(doc.name)"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-50 hover:bg-sky-100 text-[#0B3558] border border-sky-200 hover:border-sky-300 text-xs font-normal transition-colors cursor-pointer shadow-2xs"
                          title="Download {{ doc.name }}"
                        >
                          <span class="material-icons text-[#0B3558] text-[15px] leading-none shrink-0 select-none">download</span>
                          <span>Download</span>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }

      <!-- ====================================================================
           MODAL: PROFILE INCOMPLETE WARNING ON APPLY CLICK (Blue & White Theme)
           ==================================================================== -->
      @if (showApplyBlockedModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div class="max-w-md w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden text-center">
            
            <!-- Top Right Close Icon Button (Cancel button removed) -->
            <button
              type="button"
              (click)="showApplyBlockedModal.set(false)"
              class="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Proper Heading & Short, Perfect Message -->
            <h3 class="text-base sm:text-lg font-bold text-[#0B3558] tracking-tight">
              Complete Your Profile
            </h3>
            <p class="text-xs sm:text-[13px] text-slate-600 mt-2 leading-relaxed px-2 font-normal">
              Please complete your One Time Registration (OTR) profile before applying for this scheme.
            </p>

            <!-- Single Clean Action Button: Complete Profile (Light Theme Style) -->
            <div class="mt-5">
              <button
                type="button"
                (click)="goToRegistration()"
                class="w-full py-2.5 px-4 rounded-lg bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-[#0B3558] border border-sky-200 hover:border-sky-300 text-xs sm:text-sm font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Complete Profile</span>
                <span class="material-icons text-[#0B3558] text-[16px] leading-none shrink-0 select-none">arrow_forward</span>
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

  // All official EOI documents & annexures matching Screenshot with download facility (1 to 14)
  readonly eoiDocuments: EoiDocumentItem[] = [
    { sNo: 1, name: 'Official Request for Proposal (RFP) & Tender Terms', size: '2.4 MB' },
    { sNo: 2, name: 'Standard Operating Procedure (SOP) for Training Partners', size: '1.8 MB' },
    { sNo: 3, name: 'Annexure-1: Covering Letter as per Annexure-1', size: '245 KB' },
    { sNo: 4, name: 'Annexure-3: Audited Financial Statements for last three consecutive financial years.', size: '1.2 MB' },
    { sNo: 5, name: 'Details of Active skill development centre as per Annexure-4', size: '380 KB' },
    { sNo: 6, name: 'Annexure-5: Training and Placement details as per Annexure-5.', size: '520 KB' },
    { sNo: 7, name: 'Annexure-6: An affidavit for not being blacklisted', size: '180 KB' },
    { sNo: 8, name: 'Annexure-7: Self-certificate /declaration as per Annexure-7', size: '195 KB' },
    { sNo: 9, name: 'Details of Board of directors as per Annexure-8', size: '290 KB' },
    { sNo: 10, name: 'Details of Placement partnership/Tie-ups with Company/Industry as per Annexure-9', size: '440 KB' },
    { sNo: 11, name: 'Details of working experience in relevant sector as per Annexure-10', size: '610 KB' },
    { sNo: 12, name: 'List of divisions and group of district as per annexure 11', size: '310 KB' },
    { sNo: 13, name: 'Proposed evaluation matrix annexure 12', size: '420 KB' },
    { sNo: 14, name: 'Supporting documents as per annexure 13', size: '850 KB' }
  ];

  // Exact 10 schemes from Screenshot 2
  schemes: SchemeTender[] = [
    {
      sNo: 1,
      refNo: 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
      schemeName: 'MMKVY',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      code: 'MMKVY-2026',
      schemeCategory: 'ALL',
      category: 'ALL',
      datePublished: '23/01/2026',
      closingDate: '10/03/2026',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme',
      status: 'Open',
      rfpDocSize: '2.4 MB',
      sopDocSize: '1.8 MB',
      preBidDate: '10-Feb-2026 11:30 AM',
      techBidDate: '18-Mar-2026 02:30 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 2,
      refNo: 'RSLDC/EOI/MNSKSY/2025-26/01',
      schemeName: 'MNSKSY',
      schemeTitle: 'Mukhyamantri Nishulk Solar Krishi Sinchayee Yojana (MNSKSY)',
      code: 'MNSKSY-2025',
      schemeCategory: 'NA',
      category: 'NA',
      datePublished: '17/02/2026',
      closingDate: '09/03/2026',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest (EOI) MNSKSY in RSLDC.',
      status: 'Open',
      rfpDocSize: '3.1 MB',
      sopDocSize: '2.0 MB',
      preBidDate: '25-Feb-2026 11:00 AM',
      techBidDate: '15-Mar-2026 03:30 PM',
      emdFee: '₹75,000',
      processFee: '₹2,500'
    },
    {
      sNo: 3,
      refNo: 'RSLDC/EOI/MMKVY Cat I II III/2024-25/01',
      schemeName: 'MMKVY',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      code: 'MMKVY-2024',
      schemeCategory: 'ALL',
      category: 'ALL',
      datePublished: '26/09/2024',
      closingDate: '07/12/2024',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme',
      status: 'Closed',
      rfpDocSize: '2.8 MB',
      sopDocSize: '1.5 MB',
      preBidDate: '10-Oct-2024 02:00 PM',
      techBidDate: '15-Dec-2024 04:00 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 4,
      refNo: 'RSLDC/EOI/IMSHAKTI/2024-25/01',
      schemeName: 'IM_Shakti',
      schemeTitle: 'Indira Mahila Shakti Prashikshan Va Kaushal Samvardhan Yojana (IM_Shakti)',
      code: 'IM_SHAKTI',
      schemeCategory: 'General',
      category: 'General',
      datePublished: '26/09/2024',
      closingDate: '23/10/2024',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest for submission of proposal to undertake the Skill Training under IM Shakti Scheme',
      status: 'Closed',
      rfpDocSize: '4.2 MB',
      sopDocSize: '2.2 MB',
      preBidDate: '05-Oct-2024 11:00 AM',
      techBidDate: '28-Oct-2024 02:00 PM',
      emdFee: '₹1,00,000',
      processFee: '₹3,000'
    },
    {
      sNo: 5,
      refNo: 'RSLDC/EOI/2023-24/Cat-III/RAJKVIK RTD',
      schemeName: 'RAJKVIKRTD',
      schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram RTD (RAJKVIK RTD)',
      code: 'RAJKVIK-RTD',
      schemeCategory: 'RAJKVIK',
      category: 'RAJKVIK',
      datePublished: '02/05/2023',
      closingDate: '31/03/2024',
      eoiCategory: 'General',
      eoiDescription: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (MMKVY-CAT-III 'RAJKVIK')' scheme of RSLDC",
      status: 'Closed',
      rfpDocSize: '2.1 MB',
      sopDocSize: '1.4 MB',
      preBidDate: '15-May-2023 03:00 PM',
      techBidDate: '05-Apr-2024 03:00 PM',
      emdFee: '₹40,000',
      processFee: '₹1,500'
    },
    {
      sNo: 6,
      refNo: 'RSLDC/MMYKY2/Eol23-24/01',
      schemeName: 'MMYKY',
      schemeTitle: 'Mukhya Mantri Yuva Kaushal Yojana (MMYKY 2.0)',
      code: 'MMYKY-2.0',
      schemeCategory: 'General',
      category: 'General',
      datePublished: '05/07/2023',
      closingDate: '25/07/2023',
      eoiCategory: 'General',
      eoiDescription: 'Eol for MMYKY 2.0 for RSLDC',
      status: 'Closed',
      rfpDocSize: '3.6 MB',
      sopDocSize: '2.5 MB',
      preBidDate: '12-Jul-2023 11:00 AM',
      techBidDate: '28-Jul-2023 03:00 PM',
      emdFee: '₹60,000',
      processFee: '₹2,000'
    },
    {
      sNo: 7,
      refNo: 'RSLDC/Eol/2023-24/1/MMKVYSAMARTH',
      schemeName: 'SAMARTH',
      schemeTitle: 'SAMARTH Skill Development Scheme (MMKVY Cat-II)',
      code: 'MMKVY-SAMARTH',
      schemeCategory: 'SAMARTH',
      category: 'SAMARTH',
      datePublished: '18/04/2023',
      closingDate: '15/05/2023',
      eoiCategory: 'General',
      eoiDescription: 'Eol for submission of proposal to undertake the project under MMKVY (Cat-II: SAMARTH) scheme of RSLDC',
      status: 'Closed',
      rfpDocSize: '2.5 MB',
      sopDocSize: '1.6 MB',
      preBidDate: '25-Apr-2023 11:30 AM',
      techBidDate: '20-May-2023 02:30 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 8,
      refNo: 'RSLDC/Eol/2023-24/1-RAJKVIK General',
      schemeName: 'RAJKVIK',
      schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (RAJKVIK General)',
      code: 'RAJKVIK-GEN',
      schemeCategory: 'RAJKVIK',
      category: 'RAJKVIK',
      datePublished: '18/04/2023',
      closingDate: '15/05/2023',
      eoiCategory: 'General',
      eoiDescription: 'Eol for submission of proposal to undertake the project under RAJKVIK scheme of RSLDC.',
      status: 'Closed',
      rfpDocSize: '3.0 MB',
      sopDocSize: '1.9 MB',
      preBidDate: '26-Apr-2023 02:00 PM',
      techBidDate: '20-May-2023 03:30 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 9,
      refNo: 'RSLDC/Eol/2023-24/1/MMKVYSAKSHM',
      schemeName: 'SAKSHM',
      schemeTitle: 'SAKSHAM Skill Training Scheme (MMKVY Cat-II)',
      code: 'MMKVY-SAKSHM',
      schemeCategory: 'SAKSHM',
      category: 'SAKSHM',
      datePublished: '18/04/2023',
      closingDate: '15/05/2023',
      eoiCategory: 'General',
      eoiDescription: 'Eol for submission of proposal to undertake the project under MMKVY (Cat-II: SAKSHM) scheme of RSLDC',
      status: 'Closed',
      rfpDocSize: '2.2 MB',
      sopDocSize: '1.5 MB',
      preBidDate: '25-Apr-2023 03:00 PM',
      techBidDate: '20-May-2023 04:00 PM',
      emdFee: '₹40,000',
      processFee: '₹1,500'
    },
    {
      sNo: 10,
      refNo: 'RSLDC/EOI/2022-23/1MMKVYRTD',
      schemeName: 'RAJKVIK',
      schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (RAJKVIK RTD 2022-23)',
      code: 'RAJKVIK-RTD-22',
      schemeCategory: 'RAJKVIK',
      category: 'RAJKVIK',
      datePublished: '08/07/2022',
      closingDate: '31/03/2023',
      eoiCategory: 'General',
      eoiDescription: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (MMKVY-CAT-III 'RAJKVIK')' scheme of RSLDC",
      status: 'Closed',
      rfpDocSize: '2.9 MB',
      sopDocSize: '1.7 MB',
      preBidDate: '18-Jul-2022 11:00 AM',
      techBidDate: '05-Apr-2023 03:00 PM',
      emdFee: '₹50,000',
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
        refNo: scheme?.refNo || 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
        title: scheme?.schemeTitle || scheme?.schemeName || 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
        category: scheme?.schemeCategory || scheme?.category || 'Category I: RAJKVIK',
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
    alert(`Downloading ${docType} for ${s?.schemeTitle || s?.schemeName} (${s?.refNo})...`);
  }

  getSchemeDescription(scheme: SchemeTender | null): string {
    if (!scheme) return '';
    if (scheme.eoiDescription) return scheme.eoiDescription;
    return `Expression of Interest for Empanelment of Training Providers / PIAs to implement state skill development initiatives under ${scheme.schemeTitle || scheme.schemeName}.`;
  }
}

