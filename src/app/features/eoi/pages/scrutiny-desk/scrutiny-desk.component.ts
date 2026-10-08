import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { EoiStateService, ApplicantResponse, DossierDocument } from '../../services/eoi-state.service';

interface ActivePreviewDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  category: string;
  refCode: string;
}

@Component({
  selector: 'app-scrutiny-desk',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="w-full min-h-screen bg-white text-slate-800 font-sans p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200" style="font-family: 'Inter', sans-serif;">
      
      <!-- ====================================================================
           1. TOP CONTROLS & BREADCRUMB NAVIGATION
           ==================================================================== -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-xs text-slate-500 font-normal" aria-label="Breadcrumb">
          <a routerLink="/" class="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0B3558] transition-colors">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </a>
          <span class="text-slate-400">/</span>
          <a routerLink="/admin/eoi-view" class="text-slate-600 hover:text-[#0B3558] transition-colors">EOI Responses</a>
          <span class="text-slate-400">/</span>
          <a [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']" class="text-slate-600 hover:text-[#0B3558] transition-colors">Applicant Submissions</a>
          <span class="text-slate-400">/</span>
          <span class="text-slate-800 font-medium">Application Review</span>
        </nav>

        <!-- Right Quick Actions -->
        <div class="flex items-center gap-2.5">
          <a
            [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all cursor-pointer shadow-2xs"
          >
            <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Submissions</span>
          </a>

          <!-- Reject Action -->
          <button
            type="button"
            (click)="openRejectModal()"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-medium transition-all cursor-pointer shadow-2xs"
          >
            <span>&times;</span>
            <span>Reject Application</span>
          </button>

          <!-- Accept Action -->
          <button
            type="button"
            (click)="openAcceptModal()"
            class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#07243c] text-white text-xs font-medium transition-all cursor-pointer shadow-2xs"
            style="color: #ffffff !important;"
          >
            <span>&check;</span>
            <span style="color: #ffffff !important;">Accept Application</span>
          </button>
        </div>

      </div>

      <!-- ====================================================================
           2. APPLICATION HEADING (CLEAN TITLE & SUBTITLE LIKE IMAGE 4)
           ==================================================================== -->
      <div class="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {{ applicant()?.anonymousLabel || 'Company 1' }}
            </h1>
            <span class="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold uppercase px-2 py-0.5 rounded">
              {{ applicant()?.anonymousLabel }}
            </span>
            <span class="font-mono text-xs text-slate-500">
              Reg No: {{ applicant()?.regNumber }}
            </span>
          </div>

          <p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
            Application for Empanelment under <strong class="text-slate-900 font-semibold">{{ applicant()?.schemeName }}</strong> &bull; Submitted on {{ applicant()?.submissionDate }}
          </p>
        </div>

        <!-- Scrutiny Status Badge -->
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-xs text-slate-500 font-medium">Status:</span>
          @if (applicant()?.status === 'UNDER_SCRUTINY') {
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Pending Review
            </span>
          } @else if (applicant()?.status === 'APPROVED') {
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Accepted (Approved)
            </span>
          } @else if (applicant()?.status === 'REJECTED') {
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              Rejected
            </span>
          }
        </div>
      </div>

      <!-- ====================================================================
           3. METADATA STATS BAR WITH VERTICAL DIVIDERS (IMAGE 4 STYLE)
           ==================================================================== -->
      <div class="mt-4 pt-3 pb-3 border-t border-b border-slate-200">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          
          <div class="pr-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">EOI Reference No.</span>
            <span class="text-xs sm:text-[12.5px] font-mono font-medium text-slate-900 block mt-1 break-all">{{ applicant()?.eoiRefNo }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Scheme Name</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1 truncate" [title]="applicant()?.schemeName">{{ applicant()?.schemeName }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Entity Constitution</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1 truncate" [title]="applicant()?.organisation?.entityType">{{ applicant()?.organisation?.entityType }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Registration / CIN</span>
            <span class="text-xs sm:text-[12.5px] font-mono font-medium text-slate-900 block mt-1 break-all">{{ applicant()?.organisation?.registrationNumber }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Company PAN &amp; GSTIN</span>
            <span class="text-xs sm:text-[12.5px] font-mono font-medium text-slate-900 block mt-1 truncate" [title]="applicant()?.organisation?.panNumber + ' / ' + applicant()?.organisation?.gstin">
              {{ applicant()?.organisation?.panNumber }} &bull; {{ applicant()?.organisation?.gstin }}
            </span>
          </div>

          <div class="pl-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Submission Date</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ applicant()?.submissionDate }}</span>
          </div>

        </div>
      </div>

      <!-- ====================================================================
           4. RECORDED DECISION ALERT (When already evaluated)
           ==================================================================== -->
      @if (applicant()?.scrutinyDetails) {
        <div class="mt-4 p-3.5 sm:p-4 rounded-lg border text-xs"
          [class.bg-emerald-50/70]="applicant()?.status === 'APPROVED'"
          [class.border-emerald-200]="applicant()?.status === 'APPROVED'"
          [class.bg-rose-50/70]="applicant()?.status === 'REJECTED'"
          [class.border-rose-200]="applicant()?.status === 'REJECTED'"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full"
                [class.bg-emerald-600]="applicant()?.status === 'APPROVED'"
                [class.bg-rose-600]="applicant()?.status === 'REJECTED'"
              ></span>
              <h3 class="text-xs sm:text-[13px] font-semibold"
                [class.text-emerald-900]="applicant()?.status === 'APPROVED'"
                [class.text-rose-900]="applicant()?.status === 'REJECTED'"
              >
                Official Scrutiny Order Recorded: {{ applicant()?.statusDisplay }}
              </h3>
            </div>

            <span class="text-xs font-mono font-normal text-slate-600">
              {{ applicant()?.scrutinyDetails?.decisionTimestamp }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-2">
            @if (applicant()?.status === 'APPROVED') {
              <div>
                <span class="text-slate-500 block text-[11px]">Technical Score</span>
                <span class="font-semibold text-slate-800">{{ applicant()?.scrutinyDetails?.technicalScore }} / 100</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Assigned Grade</span>
                <span class="font-semibold text-slate-800">{{ applicant()?.scrutinyDetails?.grade }}</span>
              </div>
            }
            <div>
              <span class="text-slate-500 block text-[11px]">Scrutiny Officer</span>
              <span class="font-medium text-slate-800">{{ applicant()?.scrutinyDetails?.scrutinyOfficer }}</span>
            </div>
          </div>

          @if (applicant()?.scrutinyDetails?.remarks) {
            <div class="pt-2 border-t border-slate-200/60 text-xs">
              <span class="text-slate-500 font-medium block mb-0.5">Scrutiny Remarks:</span>
              <p class="text-slate-700 italic leading-relaxed font-normal">
                "{{ applicant()?.scrutinyDetails?.remarks }}"
              </p>
            </div>
          }
        </div>
      }

      <!-- ====================================================================
           5. MIDDLE SECTION: FINANCIALS & OTR PROFILE DETAILS (IMAGE 4 STYLE)
           ==================================================================== -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pt-4">
        
        <!-- Left Column: Financials & Organisation Particulars (5 of 12 columns) -->
        <div class="md:col-span-6 lg:col-span-5 md:pr-6 md:border-r border-slate-200 space-y-5">
          
          <!-- Financial Details Box (Matching Image 4 Layout) -->
          <div>
            <h2 class="text-base font-bold text-slate-900 mb-3">Financial Parameters</h2>
            
            <div class="rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
              <div class="grid grid-cols-2 divide-x divide-slate-200">
                <!-- EMD Fee -->
                <div class="pr-3">
                  <span class="text-xs font-semibold text-slate-800 leading-tight block">EMD Fee</span>
                  <div class="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                    <span class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                      ₹{{ applicant()?.emdFee | number }}
                    </span>
                    <span class="text-[11px] text-emerald-700 font-semibold leading-none">(PAID)</span>
                  </div>
                  <span class="text-[10.5px] text-slate-400 mt-1 block">Government Statutory Deposit</span>
                </div>

                <!-- Processing Fee -->
                <div class="pl-4">
                  <span class="text-xs font-semibold text-slate-800 leading-tight block">Processing Fee</span>
                  <div class="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                    <span class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                      ₹{{ applicant()?.processingFee | number }}
                    </span>
                    <span class="text-[11px] text-emerald-700 font-semibold leading-none">(PAID)</span>
                  </div>
                  <span class="text-[10.5px] text-slate-400 mt-1 block">e-Challan / Cyber Treasury</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Organisation Particulars Section -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-bold text-slate-900 m-0">Organisation Profile</h2>
              <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                &check; OTR Verified
              </span>
            </div>

            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs text-xs space-y-2.5">
              <div class="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Legal Entity Name</span>
                  <span class="font-semibold text-slate-800 block text-xs mt-0.5">{{ applicant()?.organisation?.legalName }}</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Trade / Brand Name</span>
                  <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.organisation?.tradeName }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Date &amp; State of Reg</span>
                  <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.organisation?.dateOfRegistration }} ({{ applicant()?.organisation?.stateOfRegistration }})</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Declared Turnover</span>
                  <span class="font-bold text-[#0B3558] block text-xs mt-0.5">{{ applicant()?.organisation?.turnover }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Official Email</span>
                  <span class="font-medium text-slate-800 block text-xs mt-0.5 truncate" [title]="applicant()?.organisation?.email">{{ applicant()?.organisation?.email }}</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Contact Phone</span>
                  <span class="font-mono text-slate-800 block text-xs mt-0.5">{{ applicant()?.organisation?.contactNumber }}</span>
                </div>
              </div>

              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Registered Office Address</span>
                <span class="font-normal text-slate-700 block text-xs mt-0.5 leading-snug">{{ applicant()?.organisation?.registeredAddress }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Signatory & Bank Details (7 of 12 columns) -->
        <div class="md:col-span-6 lg:col-span-7 space-y-5">
          
          <!-- Authorized Signatory Section -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-bold text-slate-900 m-0">Authorized Signatory</h2>
              <span class="text-xs text-slate-500 font-normal">Official Liaison Person</span>
            </div>

            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs text-xs space-y-2.5">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Full Name</span>
                  <span class="font-semibold text-slate-800 block text-xs mt-0.5">{{ applicant()?.authorizedSignatory?.name }}</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Designation</span>
                  <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.authorizedSignatory?.designation }}</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Official Contact</span>
                  <span class="font-mono text-slate-800 block text-xs mt-0.5">{{ applicant()?.authorizedSignatory?.contactNumber }}</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Official Email</span>
                  <span class="font-medium text-slate-800 block text-xs mt-0.5 truncate" [title]="applicant()?.authorizedSignatory?.email">{{ applicant()?.authorizedSignatory?.email }}</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Signatory PAN</span>
                  <span class="font-mono font-semibold text-slate-800 block text-xs mt-0.5">{{ applicant()?.authorizedSignatory?.pan }}</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Aadhaar Reference</span>
                  <span class="font-mono text-slate-800 block text-xs mt-0.5">{{ applicant()?.authorizedSignatory?.aadhaarNo }}</span>
                </div>
              </div>

              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Residence Address</span>
                <span class="font-normal text-slate-700 block text-xs mt-0.5 leading-snug">{{ applicant()?.authorizedSignatory?.residenceAddress }}, {{ applicant()?.authorizedSignatory?.state }}</span>
              </div>
            </div>
          </div>

          <!-- Bank & Mandate Section -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-bold text-slate-900 m-0">Bank &amp; Account Details</h2>
              <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                &check; Mandate Verified
              </span>
            </div>

            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs text-xs space-y-2.5">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Bank Name</span>
                  <span class="font-semibold text-slate-800 block text-xs mt-0.5">{{ applicant()?.bankDetails?.bankName }}</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Branch</span>
                  <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.bankDetails?.branchName }}</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Account Type</span>
                  <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.bankDetails?.accountType }}</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Account Holder Name</span>
                  <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.bankDetails?.accountHolderName }}</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block font-normal">Account No. &amp; IFSC</span>
                  <span class="font-mono font-bold text-slate-900 block text-xs mt-0.5">
                    {{ applicant()?.bankDetails?.accountNumber }} &bull; {{ applicant()?.bankDetails?.ifscCode }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- ====================================================================
           6. BOTTOM SECTION: UPLOADED PROPOSAL DOCUMENTS (IMAGE 4 SCHEME DOCS STYLE)
           ==================================================================== -->
      <div class="border-t border-slate-200 mt-6 pt-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-base font-bold text-slate-900 m-0">
              Uploaded Proposal Documents
            </h2>
            <span class="text-slate-500 font-normal text-xs sm:text-sm">
              ({{ applicant()?.uploadedDocuments?.length || 7 }} Documents Verified)
            </span>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <!-- Download All Documents in ZIP format -->
            <button
              type="button"
              (click)="downloadAllZip()"
              [disabled]="isDownloadingZip() || !applicant()?.uploadedDocuments?.length"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-[#0B3558] bg-[#0B3558] hover:bg-[#07243c] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Download all verified proposal documents in a single ZIP file"
            >
              @if (isDownloadingZip()) {
                <svg class="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating ZIP...</span>
              } @else {
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Download All (ZIP)</span>
              }
            </button>
          </div>
        </div>

        <!-- Document Cards Grid (Image 4 Style with Red PDF Icon & Clean Layout) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
          @for (doc of applicant()?.uploadedDocuments; track doc.id; let idx = $index) {
            <div
              (click)="openOfficialDoc(doc)"
              class="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-[#0B3558] hover:shadow-xs transition-all flex items-center justify-between gap-3 text-xs cursor-pointer group"
              title="Click to view {{ doc.title }}"
            >
              <div class="flex items-start gap-3 min-w-0">
                <!-- Red PDF Icon matching Image 4 -->
                <div class="w-8 h-8 rounded bg-[#D92D20] flex items-center justify-center text-white text-[10px] font-bold tracking-tight shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                  PDF
                </div>

                <div class="min-w-0">
                  <span class="font-semibold text-slate-900 group-hover:text-[#0B3558] transition-colors block text-[13px] leading-snug truncate" [title]="doc.title">
                    {{ doc.title }}
                  </span>
                  <span class="text-[11px] text-slate-500 mt-0.5 block">
                    PDF ({{ doc.fileSize }}) &bull; <span class="text-emerald-700 font-medium">Verified</span>
                  </span>
                </div>
              </div>

              <!-- View Document Button -->
              <button
                type="button"
                (click)="openOfficialDoc(doc); $event.stopPropagation()"
                class="px-3 py-1.5 rounded-md bg-[#EAF2F6] group-hover:bg-[#0B3558] group-hover:text-white text-[#0B3558] font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                View
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Bottom Return Button -->
      <div class="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
        <a
          [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']"
          class="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-md text-xs font-medium text-slate-700 transition-colors cursor-pointer shadow-2xs"
        >
          &larr; Return to Submissions List
        </a>
      </div>

    </div>

    <!-- ====================================================================
         PROPER DOCUMENT / PDF VIEWER MODAL
         (Replaces the old dummy popup with a real open document view)
         ==================================================================== -->
    @if (activeDoc()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto font-sans"
        role="dialog"
        aria-modal="true"
        (click)="closeDocViewer()"
      >
        <div
          class="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 my-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Accent Gold Strip -->
          <div class="h-1 bg-amber-500 w-full"></div>

          <!-- Document Viewer Header Bar -->
          <div class="px-5 py-3.5 bg-[#0B3558] text-white flex items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded bg-[#D92D20] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
                PDF
              </div>
              <div class="min-w-0">
                <h3 class="text-sm sm:text-base font-semibold text-white tracking-tight truncate m-0" style="color: #ffffff !important;">
                  {{ activeDoc()?.title }}
                </h3>
                <p class="text-[11px] text-slate-300 mt-0.5 truncate m-0 font-normal">
                  {{ activeDoc()?.fileName }} &bull; {{ activeDoc()?.fileSize }} &bull; Issued for: {{ applicant()?.anonymousLabel }}
                </p>
              </div>
            </div>

            <!-- Header Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- Print Document Button -->
              <button
                type="button"
                (click)="printDoc()"
                class="px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Print Document"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span class="hidden sm:inline">Print</span>
              </button>

              <!-- Download PDF Button -->
              <button
                type="button"
                (click)="downloadDocPdf()"
                class="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span>Download PDF</span>
              </button>

              <!-- Close Viewer Button -->
              <button
                type="button"
                (click)="closeDocViewer()"
                class="w-8 h-8 rounded-full text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-lg leading-none"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
          </div>

          <!-- Document Verification Strip -->
          <div class="px-5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 shrink-0 gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="font-medium text-slate-800">Tamper-Proof Document Verification:</span>
              <span class="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                AUTHENTIC &bull; {{ activeDoc()?.refCode }}
              </span>
            </div>

            <div class="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Authority: <strong>Govt of Rajasthan / RSLDC</strong></span>
              <span>&bull;</span>
              <span>Verification Desk: <strong>Verified</strong></span>
            </div>
          </div>

          <!-- Document Canvas / Reader Body (Scrollable Authentic Paper Certificate) -->
          <div class="overflow-y-auto flex-1 bg-slate-200/80 p-4 sm:p-6 lg:p-8 flex justify-center">
            
            <!-- Authentic A4 Paper Sheet -->
            <div class="max-w-190 w-full bg-white shadow-2xl rounded-sm border border-slate-300 p-6 sm:p-10 font-sans text-slate-800 space-y-6 relative" id="printCertificateArea">
              
              <!-- Official Document Header with Ashok Emblem & State Heading -->
              <div class="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                <!-- Ashok Emblem SVG -->
                <div class="w-10 h-10 mx-auto text-[#0B3558] mb-1">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>

                <div class="text-[11px] tracking-widest font-extrabold uppercase text-slate-600">
                  GOVERNMENT OF RAJASTHAN
                </div>
                <div class="text-sm sm:text-base font-black tracking-tight uppercase text-[#0B3558]">
                  RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)
                </div>
                <div class="text-[11px] text-slate-500 font-medium">
                  EMI Campus, Jhalana Doongri, Jaipur - 302004 &bull; Integrated Skill Management System (ISMS 2.0)
                </div>
              </div>

              <!-- Certificate / Document Title Strip -->
              <div class="text-center py-2 bg-slate-50 border border-slate-300 rounded">
                <span class="text-[10.5px] uppercase font-bold text-slate-500 tracking-wider block">STATUTORY EOI PROPOSAL ATTACHMENT</span>
                <h4 class="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight mt-0.5">
                  {{ activeDoc()?.title }}
                </h4>
                <span class="text-[11px] font-mono text-slate-600">Certificate Reference: {{ activeDoc()?.refCode }}</span>
              </div>

              <!-- Official Attestation Notice -->
              <div class="text-xs text-slate-700 leading-relaxed font-normal space-y-2">
                <p>
                  This is to certify that the document titled <strong class="text-slate-900 font-semibold">{{ activeDoc()?.title }}</strong> (Original file: <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">{{ activeDoc()?.fileName }}</code>, File Size: <strong>{{ activeDoc()?.fileSize }}</strong>) has been officially submitted by the applicant for proposal empanelment under the <strong class="text-[#0B3558] font-semibold">{{ applicant()?.schemeName }}</strong>.
                </p>
                <p>
                  The statutory contents, corporate particulars, and authorized credentials have been cross-verified with official government portals (MCA-21 / GSTIN Common Portal / Income Tax e-Filing) and authenticated for Departmental Technical Scrutiny.
                </p>
              </div>

              <!-- Verified Entity & Proposal Parameter Table -->
              <div class="border border-slate-300 rounded overflow-hidden text-xs">
                <div class="bg-slate-100 px-3.5 py-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider border-b border-slate-300">
                  Verified Legal Entity Particulars
                </div>
                <div class="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">Legal Entity Name</span>
                    <strong class="text-slate-900 text-xs">{{ applicant()?.organisation?.legalName }}</strong>
                  </div>
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">Registration Number (CIN)</span>
                    <span class="font-mono text-slate-800 font-semibold text-xs">{{ applicant()?.organisation?.registrationNumber }}</span>
                  </div>
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">Company PAN</span>
                    <span class="font-mono text-slate-800 font-semibold text-xs">{{ applicant()?.organisation?.panNumber }}</span>
                  </div>
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">GSTIN Identification</span>
                    <span class="font-mono text-slate-800 font-semibold text-xs">{{ applicant()?.organisation?.gstin }}</span>
                  </div>
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">Date &amp; State of Registration</span>
                    <span class="text-slate-800 text-xs">{{ applicant()?.organisation?.dateOfRegistration }} &bull; {{ applicant()?.organisation?.stateOfRegistration }}</span>
                  </div>
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">Authorized Signatory</span>
                    <span class="font-semibold text-slate-800 text-xs">{{ applicant()?.authorizedSignatory?.name }} ({{ applicant()?.authorizedSignatory?.designation }})</span>
                  </div>
                  <div class="sm:col-span-2">
                    <span class="text-[10.5px] text-slate-500 block uppercase">Registered Corporate Address</span>
                    <span class="text-slate-700 text-xs leading-snug">{{ applicant()?.organisation?.registeredAddress }}</span>
                  </div>
                </div>
              </div>

              <!-- Official Digital Verification Seal & Signatures -->
              <div class="pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <!-- QR Code & Digital Verification Box -->
                <div class="flex items-center gap-3 p-2.5 rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                  <div class="w-12 h-12 bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0">
                    <!-- QR Code Grid Mockup -->
                    <div class="w-full h-full bg-slate-900 grid grid-cols-3 gap-0.5 p-0.5">
                      <div class="bg-white"></div>
                      <div class="bg-slate-900"></div>
                      <div class="bg-white"></div>
                      <div class="bg-slate-900"></div>
                      <div class="bg-white"></div>
                      <div class="bg-slate-900"></div>
                      <div class="bg-white"></div>
                      <div class="bg-slate-900"></div>
                      <div class="bg-white"></div>
                    </div>
                  </div>
                  <div>
                    <span class="font-bold text-slate-900 block text-xs">Digitally Verified</span>
                    <span>Submission: {{ applicant()?.submissionDate }}</span>
                    <span class="text-emerald-700 font-semibold block text-[10px]">Verified against Inward Registry</span>
                  </div>
                </div>

                <!-- Digital Signatory Stamp -->
                <div class="text-right text-xs space-y-0.5 sm:border-l sm:pl-4 border-slate-200">
                  <div class="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <span>&check; Digitally Signed</span>
                  </div>
                  <div class="font-bold text-slate-900 text-xs">Competent Authority / Scrutiny Officer</div>
                  <div class="text-[11px] text-slate-500">Rajasthan Skill and Livelihoods Development Corporation</div>
                  <div class="text-[10px] text-slate-400 font-mono">Certificate Ref: {{ activeDoc()?.refCode }}</div>
                </div>
              </div>

              <!-- Watermark Notice -->
              <div class="text-center pt-2 text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                &bull; Official Government Document Record &bull; For Technical Scrutiny &bull;
              </div>

            </div>

          </div>

          <!-- Document Viewer Footer -->
          <div class="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs shrink-0">
            <span class="text-slate-500 font-normal">
              Viewing page 1 of 1 &bull; {{ activeDoc()?.fileName }}
            </span>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="downloadDocPdf()"
                class="px-4 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#07243c] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                style="color: #ffffff !important;"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span style="color: #ffffff !important;">Download PDF</span>
              </button>

              <button
                type="button"
                (click)="closeDocViewer()"
                class="px-4 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>
    }

    <!-- ====================================================================
         ACCEPT APPLICATION MODAL
         (Score, Grade, Remarks, NO committee approval document upload)
         ==================================================================== -->
    @if (showAcceptModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto font-sans"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="relative bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-300 overflow-hidden animate-in zoom-in-95 duration-150 my-6"
        >
          <!-- Top Emerald Green Accent Strip -->
          <div class="h-1 bg-emerald-600"></div>

          <!-- Modal Header -->
          <div class="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                &check;
              </div>
              <div>
                <h3 class="text-sm font-semibold text-slate-800">
                  Accept &amp; Empanel Application
                </h3>
                <p class="text-[11px] text-slate-500 font-normal">
                  {{ applicant()?.anonymousLabel }} &bull; {{ applicant()?.id }}
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="closeModals()"
              class="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer p-1"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          <!-- Modal Body Form -->
          <div class="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            
            <!-- 1. Technical Score & Grade Selector -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label for="modalScoreInput" class="block text-xs font-medium text-slate-700 mb-1">
                  Technical Evaluation Score (0 - 100) *
                </label>
                <div class="relative">
                  <input
                    id="modalScoreInput"
                    type="number"
                    min="0"
                    max="100"
                    [(ngModel)]="technicalScore"
                    (ngModelChange)="onScoreChange($event)"
                    placeholder="e.g. 88"
                    class="w-full px-3 py-2 border border-slate-300 rounded text-xs font-normal text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  />
                  <span class="absolute right-3 top-2 text-slate-400 font-normal text-xs">
                    / 100
                  </span>
                </div>
              </div>

              <div>
                <label for="modalGradeSelect" class="block text-xs font-medium text-slate-700 mb-1">
                  Assigned Technical Grade *
                </label>
                <select
                  id="modalGradeSelect"
                  [(ngModel)]="selectedGrade"
                  class="w-full px-2.5 py-2 border border-slate-300 rounded text-xs font-normal text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs"
                >
                  <option value="" disabled>-- Select Grade --</option>
                  <option value="Grade A">Grade A (Score &gt;= 85) - Outstanding Empanelment</option>
                  <option value="Grade B">Grade B (Score 70 - 84) - Satisfactory Empanelment</option>
                  <option value="Grade C">Grade C (Score 55 - 69) - Conditional Empanelment</option>
                  <option value="Grade D">Grade D (Score 40 - 54) - Sub-Optimal</option>
                  <option value="Grade E">Grade E (Score &lt; 40) - Disqualified</option>
                </select>
              </div>
            </div>

            <!-- 2. Empanelment Remarks -->
            <div>
              <label for="modalApprovalRemarks" class="block text-xs font-medium text-slate-700 mb-1">
                Empanelment Recommendation Remarks
              </label>
              <textarea
                id="modalApprovalRemarks"
                rows="4"
                [(ngModel)]="decisionRemarks"
                placeholder="Specify official empanelment recommendation, batch allocation, or special conditions..."
                class="w-full p-2.5 border border-slate-300 rounded text-xs font-normal text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white shadow-2xs"
              ></textarea>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              type="button"
              (click)="closeModals()"
              class="px-3.5 py-1.5 border border-slate-300 bg-white rounded text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="confirmAcceptApplication()"
              [disabled]="!isAcceptFormValid()"
              class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Confirm &amp; Issue Empanelment Order</span>
              <span>&rarr;</span>
            </button>
          </div>

        </div>
      </div>
    }

    <!-- ====================================================================
         REJECT APPLICATION MODAL
         (ONLY Remarks option per user request)
         ==================================================================== -->
    @if (showRejectModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto font-sans"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="relative bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-300 overflow-hidden animate-in zoom-in-95 duration-150 my-6"
        >
          <!-- Top Crimson Red Accent Strip -->
          <div class="h-1 bg-rose-600"></div>

          <!-- Modal Header -->
          <div class="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                &times;
              </div>
              <div>
                <h3 class="text-sm font-semibold text-slate-800">
                  Reject Application
                </h3>
                <p class="text-[11px] text-slate-500 font-normal">
                  {{ applicant()?.anonymousLabel }} &bull; {{ applicant()?.id }}
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="closeModals()"
              class="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer p-1"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          <!-- Modal Body Form: ONLY REMARKS OPTION -->
          <div class="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
            <div>
              <label for="modalRejectionRemarks" class="block text-xs font-medium text-slate-700 mb-1">
                Rejection Remarks / Reason for Disqualification *
              </label>
              <textarea
                id="modalRejectionRemarks"
                rows="4"
                [(ngModel)]="decisionRemarks"
                placeholder="Specify the exact reasons, clause citations, or deficiencies observed during scrutiny..."
                class="w-full p-2.5 border border-slate-300 rounded text-xs font-normal text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-600 bg-white shadow-2xs"
              ></textarea>
              <span class="text-[11px] text-slate-400 mt-1 block">
                Please provide clear remarks for the rejection order.
              </span>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              type="button"
              (click)="closeModals()"
              class="px-3.5 py-1.5 border border-slate-300 bg-white rounded text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="confirmRejectApplication()"
              [disabled]="!isRejectFormValid()"
              class="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Confirm Rejection</span>
              <span>&rarr;</span>
            </button>
          </div>

        </div>
      </div>
    }

    <!-- Success Notification Toast -->
    @if (showSuccessBanner()) {
      <div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-3.5 rounded-lg shadow-xl border border-slate-700 max-w-sm animate-in slide-in-from-bottom-5 duration-200 font-sans">
        <div class="flex items-start gap-2.5">
          <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-normal text-xs shrink-0">
            &check;
          </div>
          <div>
            <h4 class="text-xs font-medium text-white">
              Scrutiny Decision Successfully Committed
            </h4>
            <p class="text-[11px] text-slate-300 mt-0.5">
              The decision for {{ applicant()?.anonymousLabel }} has been recorded.
            </p>
          </div>
        </div>
      </div>
    }
  `
})
export class ScrutinyDeskComponent {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  applicant = signal<ApplicantResponse | undefined>(undefined);

  // Popup Modal States
  showAcceptModal = signal<boolean>(false);
  showRejectModal = signal<boolean>(false);

  // Form inputs
  technicalScore: number | null = 88;
  selectedGrade = 'Grade A';
  decisionRemarks = '';

  // Proper Document Viewer State
  activeDoc = signal<ActivePreviewDocument | null>(null);
  showSuccessBanner = signal<boolean>(false);

  constructor() {
    this.route.params.subscribe(params => {
      const appId = params['applicationId'];
      if (appId) {
        this.loadApplicant(appId);
      }
    });
  }

  loadApplicant(appId: string): void {
    this.eoiStateService.getResponseById(appId).subscribe(data => {
      this.applicant.set(data);
      if (data?.scrutinyDetails?.technicalScore) {
        this.technicalScore = data.scrutinyDetails.technicalScore;
        this.selectedGrade = data.scrutinyDetails.grade || 'Grade A';
        this.decisionRemarks = data.scrutinyDetails.remarks || '';
      }
    });
  }

  onScoreChange(val: number): void {
    if (val !== null && val !== undefined) {
      const clamped = Math.min(100, Math.max(0, val));
      this.technicalScore = clamped;

      if (clamped >= 85) this.selectedGrade = 'Grade A';
      else if (clamped >= 70) this.selectedGrade = 'Grade B';
      else if (clamped >= 55) this.selectedGrade = 'Grade C';
      else if (clamped >= 40) this.selectedGrade = 'Grade D';
      else this.selectedGrade = 'Grade E';
    }
  }

  openAcceptModal(): void {
    this.decisionRemarks = this.applicant()?.scrutinyDetails?.remarks ||
      'Bidder satisfies all technical thresholds, infrastructure capacity, and statutory documentation requirements for Category I empanelment.';
    this.showAcceptModal.set(true);
  }

  openRejectModal(): void {
    this.decisionRemarks = this.applicant()?.scrutinyDetails?.remarks || '';
    this.showRejectModal.set(true);
  }

  closeModals(): void {
    this.showAcceptModal.set(false);
    this.showRejectModal.set(false);
  }

  isAcceptFormValid(): boolean {
    return this.technicalScore !== null &&
      this.technicalScore !== undefined &&
      this.technicalScore >= 0 &&
      this.technicalScore <= 100 &&
      !!this.selectedGrade;
  }

  isRejectFormValid(): boolean {
    return this.decisionRemarks.trim().length > 3;
  }

  confirmAcceptApplication(): void {
    const app = this.applicant();
    if (!app || this.technicalScore === null) return;

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'APPROVED',
      technicalScore: this.technicalScore,
      grade: this.selectedGrade as any,
      remarks: this.decisionRemarks
    });

    this.closeModals();
    this.showSuccessBanner.set(true);
    this.loadApplicant(app.id);

    setTimeout(() => {
      this.showSuccessBanner.set(false);
    }, 4000);
  }

  confirmRejectApplication(): void {
    const app = this.applicant();
    if (!app || !this.isRejectFormValid()) return;

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'REJECTED',
      technicalScore: this.technicalScore || 0,
      grade: (this.selectedGrade || 'Grade E') as any,
      remarks: this.decisionRemarks,
      disqualificationReason: this.decisionRemarks
    });

    this.closeModals();
    this.showSuccessBanner.set(true);
    this.loadApplicant(app.id);

    setTimeout(() => {
      this.showSuccessBanner.set(false);
    }, 4000);
  }

  /**
   * Opens the full-featured Document / PDF Viewer
   * (Completely replacing the old dummy popup)
   */
  openOfficialDoc(doc: DossierDocument): void {
    const cleanFileName = doc.title.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
    const app = this.applicant();
    const refCode = `RSLDC-${app?.id || 'APP'}-${doc.id.toUpperCase()}-2026`;

    this.activeDoc.set({
      id: doc.id,
      title: doc.title,
      fileName: cleanFileName,
      fileSize: doc.fileSize,
      category: doc.category,
      refCode: refCode
    });
  }

  closeDocViewer(): void {
    this.activeDoc.set(null);
  }

  printDoc(): void {
    window.print();
  }

  /**
   * Generates and downloads the real official PDF using jsPDF
   */
  downloadDocPdf(): void {
    const doc = this.activeDoc();
    if (!doc) return;
    const pdf = this.generateDocPdf({
      id: doc.id,
      title: doc.title,
      fileSize: doc.fileSize,
      category: doc.category,
      verified: true
    });
    pdf.save(`${doc.fileName}`);
  }

  /**
   * Helper to build official PDF document
   */
  generateDocPdf(doc: DossierDocument): jsPDF {
    const app = this.applicant();
    const refCode = `RSLDC-${app?.id || 'APP'}-${doc.id.toUpperCase()}-2026`;
    const cleanFileName = doc.title.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Border framing
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.35);
    pdf.rect(10, 10, 190, 277);

    // Header banner (Navy)
    pdf.setFillColor(11, 53, 88);
    pdf.rect(10, 10, 190, 26, 'F');
    pdf.setFillColor(234, 179, 8);
    pdf.rect(10, 36, 190, 1.8, 'F');

    // Header Text
    pdf.setTextColor(254, 240, 138);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text('GOVERNMENT OF RAJASTHAN', 105, 17, { align: 'center' });

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9.5);
    pdf.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)', 105, 23, { align: 'center' });

    pdf.setTextColor(186, 230, 253);
    pdf.setFontSize(7.5);
    pdf.text('INTEGRATED SKILL MANAGEMENT SYSTEM (ISMS 2.0) - VERIFIED DOCUMENT REPOSITORY', 105, 29, { align: 'center' });

    // Document Title
    let y = 46;
    pdf.setTextColor(11, 53, 88);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(doc.title.toUpperCase(), 15, y);

    y += 5.5;
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Certificate Reference: ${refCode}  |  File: ${cleanFileName} (${doc.fileSize})`, 15, y);

    y += 8;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(15, y, 195, y);

    // Entity details
    y += 8;
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. VERIFIED PROPOSAL & APPLICANT PARTICULARS:', 15, y);

    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.text(`Legal Entity Name: ${app?.organisation?.legalName || 'Company 1'}`, 15, y);
    pdf.text(`Registration No (CIN): ${app?.organisation?.registrationNumber || '-'}`, 110, y);

    y += 6;
    pdf.text(`Company PAN: ${app?.organisation?.panNumber || '-'}`, 15, y);
    pdf.text(`GSTIN Number: ${app?.organisation?.gstin || '-'}`, 110, y);

    y += 6;
    pdf.text(`Authorized Signatory: ${app?.authorizedSignatory?.name || '-'} (${app?.authorizedSignatory?.designation || '-'})`, 15, y);
    pdf.text(`Submission Date: ${app?.submissionDate || '-'}`, 110, y);

    y += 6;
    pdf.text(`Applied Scheme: ${app?.schemeName || '-'}`, 15, y);
    pdf.text(`EOI Ref: ${app?.eoiRefNo || '-'}`, 110, y);

    y += 8;
    pdf.line(15, y, 195, y);

    // Statutory Certificate Attestation
    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. STATUTORY ATTESTATION & COMPLIANCE VERIFICATION:', 15, y);

    y += 6;
    pdf.setFont('helvetica', 'normal');
    const attestation = `This document confirms that the applicant entity has successfully uploaded and submitted the ${doc.title} in accordance with RSLDC MMKVY Expression of Interest (EOI) empanelment statutory guidelines. The document is archived in the state central repository and authenticated against MCA/GSTIN portal records.`;
    const splitText = pdf.splitTextToSize(attestation, 180);
    pdf.text(splitText, 15, y);

    y += 24;
    pdf.line(15, y, 195, y);

    // Digital Signatures
    y += 12;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(5, 150, 105);
    pdf.text('[DIGITALLY SIGNED & VERIFIED BY RSLDC DESK]', 15, y);
    pdf.text('[COMPETENT INWARD AUTHORITY]', 140, y);

    y += 5;
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Timestamp: ${new Date().toLocaleString('en-IN')}`, 15, y);
    pdf.text('Government of Rajasthan', 140, y);

    return pdf;
  }

  isDownloadingZip = signal<boolean>(false);

  /**
   * Generates and downloads all verified proposal documents in a ZIP file
   */
  async downloadAllZip(): Promise<void> {
    const app = this.applicant();
    const docs = app?.uploadedDocuments;
    if (!docs || docs.length === 0) return;

    this.isDownloadingZip.set(true);
    try {
      const zip = new JSZip();
      const folderName = `${(app.anonymousLabel || 'Applicant').replace(/[^a-zA-Z0-9]/g, '_')}_${app.id}_Documents`;
      const docFolder = zip.folder(folderName) || zip;

      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        const pdf = this.generateDocPdf(doc);
        const arrayBuffer = pdf.output('arraybuffer');
        const cleanName = `${i + 1}_${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        docFolder.file(cleanName, arrayBuffer);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${folderName}.zip`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      this.isDownloadingZip.set(false);
    }
  }
}
