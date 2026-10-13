import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import {
  EoiStateService,
  ApplicantResponse,
  DossierDocument,
  ApplicationActivityLog
} from '../../services/eoi-state.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ScrutinyToolbarComponent } from './components/scrutiny-toolbar.component';
import { ScrutinyDocViewerComponent } from './components/scrutiny-doc-viewer.component';
import { ScrutinyPdfService } from './scrutiny-pdf.service';
import {
  ActivePreviewDocument,
  GRADE_OPTIONS,
  GradeLabel,
  clampScore,
  gradeFromScore,
  isAcceptFormValid,
  isRejectFormValid
} from './scrutiny-desk.util';

@Component({
  selector: 'app-scrutiny-desk',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DecimalPipe,
    ScrutinyToolbarComponent,
    ScrutinyDocViewerComponent
  ],
  template: `
    <div class="w-full min-h-screen bg-white text-slate-800 font-sans p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200" style="font-family: 'Inter', sans-serif;">

      <!-- Top Scrutiny Toolbar: Clean Single Back Button on Left + 4 Actions (Revert, Remarks, Reject, Approve) on Right -->
      <app-scrutiny-toolbar
        [applicant]="applicant()"
        (revert)="openRevertModal()"
        (remarks)="openRemarksModal()"
        (reject)="openRejectModal()"
        (approve)="openApproveModal()"
      />

      <!-- ====================================================================
           1. HEADER: ONLY "COMPANY 1" TITLE & REG NO + METADATA ROW
           ==================================================================== -->
      <div class="mt-4 pb-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <!-- Company Title: Displays ONLY Company 1 / Anonymous label -->
              <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
                {{ applicant()?.anonymousLabel || 'Company 1' }}
              </h1>
              <span class="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                Reg No: {{ applicant()?.regNumber }}
              </span>
            </div>

            <p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mt-1 m-0">
              Proposal for Empanelment under <strong class="text-slate-900 font-semibold">{{ applicant()?.schemeName }}</strong> &bull; EOI Ref: <span class="font-mono text-slate-700">{{ applicant()?.eoiRefNo }}</span> &bull; Submitted on {{ applicant()?.submissionDate }}
            </p>
          </div>

          <!-- Sanction Order Button (Green) & Scrutiny Status Badge -->
          <div class="flex items-center gap-3 shrink-0 flex-wrap">
            <a
              [routerLink]="['/admin/eoi-sanction-editor', applicant()?.schemeId || 'MMKVY-01']"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-2xs cursor-pointer"
              title="Open Sanction Order"
            >
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Sanction Order</span>
            </a>

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-slate-500 font-medium">Scrutiny Status:</span>
            @if (applicant()?.status === 'UNDER_SCRUTINY') {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Pending Review
              </span>
            } @else if (applicant()?.status === 'APPROVED') {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Accepted (Approved)
              </span>
            } @else if (applicant()?.status === 'REJECTED') {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                Rejected
              </span>
            } @else if (applicant()?.status === 'REVERTED') {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-400">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Reverted (Shortfall Notice Issued)
              </span>
            }
          </div>
        </div>

        <!-- Metadata Stats Row with Vertical Dividers (Clean, No Step 3/4/5 Proposed Centres) -->
        <div class="mt-4 pt-3 pb-3 border-t border-b border-slate-200">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
            <div class="pr-3 py-1 sm:py-0">
              <span class="text-[11px] text-slate-500 block leading-tight">EOI Reference No.</span>
              <span class="font-mono font-medium text-slate-900 block mt-0.5 truncate" [title]="applicant()?.eoiRefNo">{{ applicant()?.eoiRefNo }}</span>
            </div>
            <div class="px-3 py-1 sm:py-0">
              <span class="text-[11px] text-slate-500 block leading-tight">Scheme Name</span>
              <span class="font-medium text-slate-900 block mt-0.5 truncate" [title]="applicant()?.schemeName">{{ applicant()?.schemeName }}</span>
            </div>
            <div class="px-3 py-1 sm:py-0">
              <span class="text-[11px] text-slate-500 block leading-tight">Entity Constitution</span>
              <span class="font-medium text-slate-900 block mt-0.5 truncate" [title]="applicant()?.organisation?.entityType">{{ applicant()?.organisation?.entityType }}</span>
            </div>
            <div class="px-3 py-1 sm:py-0">
              <span class="text-[11px] text-slate-500 block leading-tight">Registration / CIN</span>
              <span class="font-mono font-medium text-slate-900 block mt-0.5">{{ applicant()?.organisation?.registrationNumber }}</span>
            </div>
            <div class="px-3 py-1 sm:py-0">
              <span class="text-[11px] text-slate-500 block leading-tight">Company PAN &amp; GSTIN</span>
              <span class="font-mono font-semibold text-slate-900 block mt-0.5">{{ applicant()?.organisation?.panNumber }} &bull; {{ applicant()?.organisation?.gstin }}</span>
            </div>
            <div class="pl-3 py-1 sm:py-0">
              <span class="text-[11px] text-slate-500 block leading-tight">Submission Date</span>
              <span class="font-medium text-slate-900 block mt-0.5">{{ applicant()?.submissionDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ====================================================================
           2. UNIFIED SINGLE SCREEN (NO DIVIDED BLOCKS / NO EXTRA STEPS)
              Section 1: Organization Information
              Section 2: Authorized Person
              Section 3: Documents (3-4 horizontally together, View only)
           ==================================================================== -->
      <div class="mt-2 space-y-7">

        <!-- SECTION 1: ORGANIZATION INFORMATION -->
        <section class="pb-6 border-b border-slate-200">
          <div class="flex items-center justify-between pb-2 mb-3.5 border-b border-slate-100">
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide m-0">
              Organization Information
            </h2>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Short Name</span>
              <span class="font-medium text-slate-900">{{ applicant()?.anonymousLabel || 'Company 1' }}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="text-slate-500 block text-[11px] mb-0.5">Full Name of Organisation</span>
              <span class="font-medium text-slate-900">{{ applicant()?.anonymousLabel || 'Company 1' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Nature of Entity</span>
              <span class="font-medium text-slate-900">{{ applicant()?.organisation?.entityType || 'Private Limited Company' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Registration Number (CIN)</span>
              <span class="font-mono text-slate-900 font-medium">{{ applicant()?.organisation?.registrationNumber }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Date of Registration</span>
              <span class="font-medium text-slate-900">{{ applicant()?.organisation?.dateOfRegistration }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">State / UT of Registration</span>
              <span class="font-medium text-slate-900">{{ applicant()?.organisation?.stateOfRegistration }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Company PAN</span>
              <span class="font-mono text-slate-900 font-medium">{{ applicant()?.organisation?.panNumber }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">GSTIN</span>
              <span class="font-mono text-slate-900 font-medium">{{ applicant()?.organisation?.gstin }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Declared Turnover (3 Yrs)</span>
              <span class="font-medium text-slate-900">{{ applicant()?.organisation?.turnover }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Company Contact No.</span>
              <span class="font-mono text-slate-900">{{ applicant()?.organisation?.contactNumber }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Company Email-ID</span>
              <span class="font-medium text-slate-900">{{ applicant()?.organisation?.email }}</span>
            </div>
            <div class="col-span-2 sm:col-span-3 lg:col-span-4">
              <span class="text-slate-500 block text-[11px] mb-0.5">Registered Address</span>
              <span class="text-slate-900 leading-relaxed">{{ applicant()?.organisation?.registeredAddress }}</span>
            </div>
          </div>
        </section>

        <!-- SECTION 2: AUTHORIZED PERSON -->
        <section class="pb-6 border-b border-slate-200">
          <div class="flex items-center justify-between pb-2 mb-3.5 border-b border-slate-100">
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide m-0">
              Authorized Person
            </h2>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Full Name</span>
              <span class="font-medium text-slate-900">{{ applicant()?.authorizedSignatory?.name }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Designation</span>
              <span class="font-medium text-slate-900">{{ applicant()?.authorizedSignatory?.designation }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Date of Birth / Age</span>
              <span class="font-medium text-slate-900">12/08/1982 (44 Yrs)</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">PAN</span>
              <span class="font-mono text-slate-900 font-medium">{{ applicant()?.authorizedSignatory?.pan }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Mobile No.</span>
              <span class="font-mono text-slate-900">{{ applicant()?.authorizedSignatory?.contactNumber }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Email Address</span>
              <span class="font-medium text-slate-900">{{ applicant()?.authorizedSignatory?.email }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Aadhaar No.</span>
              <span class="font-mono text-slate-900">{{ applicant()?.authorizedSignatory?.aadhaarNo }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">State</span>
              <span class="font-medium text-slate-900">{{ applicant()?.authorizedSignatory?.state || 'Rajasthan' }}</span>
            </div>
            <div class="col-span-2 sm:col-span-3 lg:col-span-4">
              <span class="text-slate-500 block text-[11px] mb-0.5">Residential Address</span>
              <span class="text-slate-900 leading-relaxed">{{ applicant()?.authorizedSignatory?.residenceAddress }}</span>
            </div>
          </div>
        </section>

        <!-- SECTION 3: DOCUMENTS (3-4 HORIZONTALLY TOGETHER WITH VIEW ONLY) -->
        <section class="pb-6 border-b border-slate-200">
          <div class="flex items-center justify-between pb-2 mb-3.5 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide m-0">
                Documents
              </h2>
              <span class="text-xs text-slate-500 font-normal">
                ({{ applicant()?.uploadedDocuments?.length || 7 }})
              </span>
            </div>

            <!-- Download All ZIP Button -->
            <button
              type="button"
              (click)="downloadAllZip()"
              [disabled]="isDownloadingZip() || !applicant()?.uploadedDocuments?.length"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50 shrink-0"
            >
              @if (isDownloadingZip()) {
                <svg class="w-3.5 h-3.5 animate-spin text-slate-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating ZIP...</span>
              } @else {
                <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Download All (ZIP)</span>
              }
            </button>
          </div>

          <!-- 3 to 4 documents horizontally together, document name + view button only (no category, no file details) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            @for (doc of applicant()?.uploadedDocuments; track doc.id) {
              <div
                class="p-2.5 sm:p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-2.5 shadow-2xs hover:border-slate-300 transition-all group"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-7 h-7 rounded bg-[#D92D20] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                    PDF
                  </div>
                  <span class="text-xs font-semibold text-slate-800 truncate" [title]="doc.title">
                    {{ doc.title }}
                  </span>
                </div>

                <!-- View Button -->
                <button
                  type="button"
                  (click)="openOfficialDoc(doc)"
                  class="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="View document"
                >
                  View
                </button>
              </div>
            }
          </div>
        </section>

      </div>

      <!-- ====================================================================
           4. LIFECYCLE ACTIVITY & TRANSACTION HISTORY (AT THE BOTTOM)
           ==================================================================== -->
      <div class="border-t border-slate-200 mt-8 pt-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 m-0">
              Lifecycle Activity &amp; Transaction History
            </h2>
            <p class="text-xs text-slate-500 m-0 mt-0.5">
              Chronological tracking of application submissions, shortfall notices, officer remarks, and applicant re-uploads.
            </p>
          </div>

          <!-- Simulator button for presentation: Applicant Re-upload Response -->
          @if (applicant()?.status === 'REVERTED') {
            <button
              type="button"
              (click)="simulateApplicantResubmission()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Simulate applicant re-uploading shortfall documents"
            >
              <svg class="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Simulate: Applicant Re-uploads Documents</span>
            </button>
          }
        </div>

        <!-- Activity Timeline Cards -->
        <div class="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          @for (act of getActivityLog(); track act.id) {
            <div class="relative group">
              <!-- Node Dot -->
              <div
                class="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center text-[10px] shadow-2xs"
                [class.border-navy]="act.action === 'APPROVED' || act.action === 'FORWARDED'"
                [class.border-amber-500]="act.action === 'REVERTED' || act.action === 'UNDER_REVIEW'"
                [class.border-rose-500]="act.action === 'REJECTED'"
                [class.border-emerald-500]="act.action === 'SUBMITTED' || act.action === 'RESUBMITTED'"
              >
                @if (act.action === 'APPROVED') {
                  <span class="text-emerald-700 font-bold">&check;</span>
                } @else if (act.action === 'REVERTED') {
                  <span class="text-amber-700 font-bold">&larr;</span>
                } @else if (act.action === 'REJECTED') {
                  <span class="text-rose-700 font-bold">&times;</span>
                } @else if (act.action === 'RESUBMITTED') {
                  <span class="text-emerald-700 font-bold">&uarr;</span>
                } @else {
                  <span class="text-navy font-bold">&bull;</span>
                }
              </div>

              <!-- Event Card -->
              <div class="bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3 sm:p-3.5 transition-all shadow-2xs">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs sm:text-[13px] font-bold text-slate-900">{{ act.title }}</span>
                    <span
                      class="px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider border"
                      [class.bg-blue-50]="act.actorRole === 'Applicant / TP'"
                      [class.text-blue-800]="act.actorRole === 'Applicant / TP'"
                      [class.border-blue-200]="act.actorRole === 'Applicant / TP'"
                      [class.bg-purple-50]="act.actorRole === 'Department Scrutiny Officer'"
                      [class.text-purple-800]="act.actorRole === 'Department Scrutiny Officer'"
                      [class.border-purple-200]="act.actorRole === 'Department Scrutiny Officer'"
                      [class.bg-emerald-50]="act.actorRole === 'Empanelment Committee'"
                      [class.text-emerald-800]="act.actorRole === 'Empanelment Committee'"
                      [class.border-emerald-200]="act.actorRole === 'Empanelment Committee'"
                    >
                      {{ act.actorRole }}
                    </span>
                  </div>

                  <span class="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                    {{ act.timestamp }}
                  </span>
                </div>

                <div class="text-xs text-slate-600 mb-1">
                  <span>Actor: </span><strong class="text-slate-800">{{ act.actor }}</strong>
                </div>

                <p class="text-xs text-slate-700 leading-relaxed m-0 font-normal">
                  {{ act.description }}
                </p>

                @if (act.meta?.documents?.length) {
                  <div class="mt-2 pt-1.5 border-t border-slate-200/60 flex flex-wrap gap-1.5 items-center">
                    <span class="text-[11px] font-semibold text-slate-600">Flagged Documents:</span>
                    @for (doc of act.meta?.documents; track doc) {
                      <span class="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-medium">
                        {{ doc }}
                      </span>
                    }
                  </div>
                }

                @if (act.meta?.forwardedTo) {
                  <div class="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[11px] font-semibold text-navy">
                    &rarr; Forwarded to: {{ act.meta?.forwardedTo }}
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>

    

    </div>

    <!-- Document / PDF viewer modal -->
    <app-scrutiny-doc-viewer
      [doc]="activeDoc()"
      [applicant]="applicant()"
      (close)="closeDocViewer()"
      (downloadPdf)="downloadDocPdf()"
    />

    <!-- ====================================================================
         REVERT APPLICATION MODAL (Shortfall Notice & Office Order)
         ==================================================================== -->
    @if (showRevertModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="background: rgba(10,20,40,0.5); backdrop-filter: blur(4px);"
        (click)="closeModals()"
      >
        <div
          class="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-2xl relative font-sans overflow-hidden my-auto max-h-[92vh] flex flex-col"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
        >
          <div class="h-1.5 w-full bg-amber-500 shrink-0"></div>

          <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 mb-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                DEFICIENCY / SHORTFALL DESK
              </div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                Revert Application with Shortfall Notice
              </h2>
              <p class="text-xs text-slate-500 m-0 mt-0.5">
                {{ applicant()?.anonymousLabel || 'Company 1' }} &bull; {{ applicant()?.id }}
              </p>
            </div>

            <button
              type="button"
              (click)="closeModals()"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-5 sm:px-6 py-5 overflow-y-auto flex-1 space-y-4 text-xs">
            <div class="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2.5">
              <svg class="w-4 h-4 text-amber-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div class="leading-relaxed">
                Reverting returns the proposal to the Training Partner for document re-upload within the stipulated timeline. Select the deficient documents and attach the official Office Order memo below.
              </div>
            </div>

            <!-- Field 1: Shortfall Documents (Dropdown with Multi-Select) -->
            <div class="relative">
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-slate-800">
                  Shortfall Document(s) <span class="text-rose-600">*</span>
                </label>
                <span class="text-[11px] text-slate-500 font-medium">
                  {{ selectedShortfallDocs().length }} selected
                </span>
              </div>

              <!-- Dropdown Trigger Button -->
              <div
                (click)="toggleDocDropdown()"
                class="w-full min-h-[42px] px-3 py-2 border rounded-lg bg-white cursor-pointer transition-all flex items-center justify-between gap-2 shadow-2xs hover:border-slate-400"
                [class.border-navy]="isDocDropdownOpen()"
                [class.border-slate-300]="!isDocDropdownOpen()"
                [class.ring-2]="isDocDropdownOpen()"
                [class.ring-navy/10]="isDocDropdownOpen()"
              >
                <div class="flex-1 flex flex-wrap gap-1.5 items-center">
                  @if (selectedShortfallDocs().length === 0) {
                    <span class="text-slate-400 text-xs">
                      Click to choose shortfall documents (multi-select)...
                    </span>
                  } @else {
                    <span class="text-xs font-semibold text-navy">
                      {{ selectedShortfallDocs().length }} Document(s) Flagged for Shortfall
                    </span>
                  }
                </div>

                <div class="flex items-center gap-1.5 shrink-0 text-slate-400">
                  <svg
                    class="w-4 h-4 transition-transform duration-200"
                    [class.rotate-180]="isDocDropdownOpen()"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              @if (selectedShortfallDocs().length > 0) {
                <div class="flex flex-wrap gap-1.5 mt-2">
                  @for (doc of selectedShortfallDocs(); track doc) {
                    <span class="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium shadow-2xs">
                      <span>{{ doc }}</span>
                      <button
                        type="button"
                        (click)="removeShortfallDoc(doc)"
                        class="w-4 h-4 rounded hover:bg-amber-200/80 text-amber-700 hover:text-amber-900 flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </span>
                  }
                  <button
                    type="button"
                    (click)="clearAllShortfallDocs()"
                    class="text-[11px] text-rose-600 hover:text-rose-800 underline font-medium self-center ml-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              }

              <!-- Dropdown Panel -->
              @if (isDocDropdownOpen()) {
                <div
                  class="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                >
                  <div class="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                    <div class="relative flex-1">
                      <input
                        type="text"
                        [(ngModel)]="docSearchTerm"
                        placeholder="Search document name..."
                        class="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-navy shadow-2xs"
                      />
                      <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    <button
                      type="button"
                      (click)="selectAllShortfallDocs()"
                      class="px-2 py-1 text-[11px] font-semibold text-navy bg-white hover:bg-slate-100 border border-slate-200 rounded cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      (click)="clearAllShortfallDocs()"
                      class="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      Clear
                    </button>
                  </div>

                  <div class="max-h-56 overflow-y-auto divide-y divide-slate-100 p-1">
                    @for (doc of filteredShortfallDocs(); track doc.id) {
                      <label
                        class="flex items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                      >
                        <div class="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            [checked]="isDocSelected(doc.title)"
                            (change)="toggleShortfallDoc(doc.title)"
                            class="w-4 h-4 rounded text-navy border-slate-300 focus:ring-navy cursor-pointer shrink-0"
                          />
                          <span class="text-xs text-slate-800 font-medium truncate">
                            {{ doc.title }}
                          </span>
                        </div>
                      </label>
                    }
                  </div>

                  <div class="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px]">
                    <span class="text-slate-500">
                      {{ selectedShortfallDocs().length }} selected of {{ availableShortfallDocs().length }}
                    </span>
                    <button
                      type="button"
                      (click)="isDocDropdownOpen.set(false)"
                      class="px-2.5 py-1 bg-navy text-white font-semibold rounded text-xs hover:bg-[#07243c] cursor-pointer shadow-2xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Field 2: Upload Office Order -->
            <div class="pt-2 border-t border-slate-200">
              <label class="block text-xs font-semibold text-slate-800 mb-1">
                Upload Office Order &amp; Reference No. <span class="text-rose-600">*</span>
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div class="sm:col-span-2">
                  <label class="block text-[11px] font-medium text-slate-600 mb-1">
                    Office Order / Dispatch Ref No.
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="officeOrderRefNo"
                    placeholder="e.g. RSLDC/EOI/2026/SF-0819"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-navy shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-medium text-slate-600 mb-1">
                    Rectification Window
                  </label>
                  <select
                    [(ngModel)]="rectificationDays"
                    class="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-navy cursor-pointer shadow-2xs"
                  >
                    <option [value]="7">7 Days (Standard)</option>
                    <option [value]="10">10 Days</option>
                    <option [value]="15">15 Days</option>
                  </select>
                </div>
              </div>

              <input
                type="file"
                #officeFileInput
                (change)="onOfficeOrderFileSelected($event)"
                accept=".pdf,.doc,.docx"
                class="hidden"
              />

              @if (!officeOrderFileName()) {
                <div
                  (click)="officeFileInput.click()"
                  class="p-4 border-2 border-dashed border-slate-300 hover:border-navy rounded-xl bg-slate-50/70 hover:bg-slate-50 transition-all text-center cursor-pointer group"
                >
                  <div class="w-9 h-9 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                    <svg class="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div class="text-xs font-semibold text-slate-800 group-hover:text-navy">
                    Click to browse and attach official Office Order file
                  </div>
                  <div class="text-[11px] text-slate-500 mt-0.5">
                    Supports official signed PDF or DOCX up to 10MB
                  </div>
                  <div class="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-300 text-xs font-medium text-slate-700 shadow-2xs">
                    Browse Local File
                  </div>
                </div>

                <div class="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Need an immediate template?</span>
                  <button
                    type="button"
                    (click)="attachDefaultOfficeOrder()"
                    class="text-navy hover:underline font-semibold cursor-pointer"
                  >
                    + Attach System Shortfall Memo (OO-RSLDC-2026.pdf)
                  </button>
                </div>
              } @else {
                <div class="p-3 bg-white border border-slate-300 rounded-lg flex items-center justify-between gap-3 shadow-2xs">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded bg-[#D92D20] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                      PDF
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs font-semibold text-slate-900 truncate">
                        {{ officeOrderFileName() }}
                      </div>
                      <div class="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{{ officeOrderFileSize() || '380 KB' }}</span>
                        <span>&bull;</span>
                        <span class="text-emerald-700 font-semibold inline-flex items-center gap-1">
                          &check; Attached
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      (click)="officeFileInput.click()"
                      class="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      (click)="removeOfficeOrderFile()"
                      class="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Remove file"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Field 3: Shortfall Remarks -->
            <div class="pt-2 border-t border-slate-200">
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-slate-800">
                  Shortfall Deficiency Details / Instructions for TP <span class="text-rose-600">*</span>
                </label>
                <span class="text-[11px] text-slate-400">Click suggestions to insert</span>
              </div>

              <div class="flex flex-wrap gap-1.5 mb-2">
                @for (tpl of shortfallTemplates; track tpl) {
                  <button
                    type="button"
                    (click)="insertShortfallTemplate(tpl)"
                    class="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer text-left"
                  >
                    + {{ tpl.slice(0, 42) }}...
                  </button>
                }
              </div>

              <textarea
                rows="4"
                [(ngModel)]="revertRemarks"
                placeholder="Specify the clear deficiency findings, clause references, and rectification instructions for the applicant..."
                class="w-full p-3 border border-slate-300 rounded-lg text-xs font-normal text-slate-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-white shadow-2xs leading-relaxed"
              ></textarea>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              (click)="closeModals()"
              class="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="confirmRevertApplication()"
              [disabled]="!isRevertFormValid()"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v2m0 0l-3-3m3 3l3-3M3 10l3 3m-3-3l3-3" />
              </svg>
              <span>Confirm &amp; Issue Revert Notice</span>
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ====================================================================
         REMARKS & FORWARDING MODAL
         ==================================================================== -->
    @if (showRemarksModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="background: rgba(10,20,40,0.5); backdrop-filter: blur(4px);"
        (click)="closeModals()"
      >
        <div
          class="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-2xl relative font-sans overflow-hidden my-auto max-h-[92vh] flex flex-col"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
        >
          <div class="h-1.5 w-full bg-navy shrink-0"></div>

          <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-300 mb-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-navy"></span>
                SCRUTINY DESK NOTES &amp; FORWARDING
              </div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                Scrutiny Remarks &amp; Committee Forwarding
              </h2>
              <p class="text-xs text-slate-500 m-0 mt-0.5">
                {{ applicant()?.anonymousLabel || 'Company 1' }} &bull; {{ applicant()?.id }}
              </p>
            </div>

            <button
              type="button"
              (click)="closeModals()"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-5 sm:px-6 py-5 overflow-y-auto flex-1 space-y-4 text-xs">
            <div>
              <label class="block text-xs font-semibold text-slate-800 mb-1.5">
                Common Standard Remarks (Click to insert):
              </label>
              <div class="flex flex-wrap gap-1.5">
                @for (rem of commonRemarksList; track rem) {
                  <button
                    type="button"
                    (click)="insertCommonRemark(rem)"
                    class="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-navy border border-slate-200 hover:border-blue-300 transition-all cursor-pointer text-left active:scale-95 shadow-2xs"
                  >
                    + {{ rem }}
                  </button>
                }
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-slate-800">
                  New Scrutiny Remark / Officer Observation <span class="text-rose-600">*</span>
                </label>
                @if (newRemarkText()) {
                  <button
                    type="button"
                    (click)="newRemarkText.set('')"
                    class="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear text
                  </button>
                }
              </div>
              <textarea
                rows="4"
                [(ngModel)]="newRemarkText"
                placeholder="Enter detailed scrutiny observation, compliance review notes, or committee recommendation..."
                class="w-full p-3 border border-slate-300 rounded-lg text-xs font-normal text-slate-900 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy bg-white shadow-2xs leading-relaxed"
              ></textarea>
            </div>

            <div class="pt-3 border-t border-slate-200">
              <label class="block text-xs font-semibold text-slate-800 mb-2">
                Forward Application &amp; File Routing
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="sm:col-span-2">
                  <label class="block text-[11px] font-medium text-slate-600 mb-1">
                    Forward To Designated Officer / Authority
                  </label>
                  <select
                    [(ngModel)]="forwardToOfficer"
                    class="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-navy cursor-pointer shadow-2xs"
                  >
                    @for (officer of forwardOfficerOptions; track officer) {
                      <option [value]="officer">{{ officer }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-[11px] font-medium text-slate-600 mb-1">
                    Priority / Urgency
                  </label>
                  <select
                    [(ngModel)]="remarkPriority"
                    class="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-navy cursor-pointer shadow-2xs"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent (Immediate Review)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              (click)="closeModals()"
              class="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="confirmAddAndForwardRemarks()"
              [disabled]="!newRemarkText().trim()"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-navy hover:bg-[#07243c] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              style="color: #ffffff !important;"
            >
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span style="color: #ffffff !important;">Add &amp; Forward</span>
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ====================================================================
         REJECT APPLICATION MODAL (Professional Disqualification Form)
         ==================================================================== -->
    @if (showRejectModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="background: rgba(10,20,40,0.5); backdrop-filter: blur(4px);"
        (click)="closeModals()"
      >
        <div
          class="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-2xl relative font-sans overflow-hidden my-auto max-h-[92vh] flex flex-col"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
        >
          <div class="h-1.5 w-full bg-rose-600 shrink-0"></div>

          <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-900 border border-rose-300 mb-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                DISQUALIFICATION DESK
              </div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                Reject / Disqualify Application
              </h2>
              <p class="text-xs text-slate-500 m-0 mt-0.5">
                {{ applicant()?.anonymousLabel || 'Company 1' }} &bull; {{ applicant()?.id }}
              </p>
            </div>

            <button
              type="button"
              (click)="closeModals()"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-5 sm:px-6 py-5 overflow-y-auto flex-1 space-y-4 text-xs">
            <div class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs flex items-start gap-2.5">
              <svg class="w-4 h-4 text-rose-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div class="leading-relaxed">
                Rejecting this application will disqualify the bidder from empanelment. Statutory EMD amount of ₹{{ applicant()?.emdFee | number }} will be queued for automatic refund to the registered corporate bank account.
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-800 mb-1">
                Primary Reason / Ground for Disqualification <span class="text-rose-600">*</span>
              </label>
              <select
                [(ngModel)]="rejectionCategory"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-rose-600 cursor-pointer shadow-2xs"
              >
                @for (ground of rejectionGroundsList; track ground) {
                  <option [value]="ground">{{ ground }}</option>
                }
              </select>
            </div>

            <div>
              <span class="text-[11px] font-medium text-slate-500 block mb-1">Click suggestions to insert clause text:</span>
              <div class="flex flex-wrap gap-1.5">
                @for (tpl of rejectionTemplateChips; track tpl) {
                  <button
                    type="button"
                    (click)="insertRejectionTemplate(tpl)"
                    class="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-900 border border-slate-200 hover:border-rose-300 transition-colors cursor-pointer text-left"
                  >
                    + {{ tpl.slice(0, 40) }}...
                  </button>
                }
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-800 mb-1">
                Rejection Remarks / Official Order Justification <span class="text-rose-600">*</span>
              </label>
              <textarea
                rows="4"
                [(ngModel)]="rejectionRemarks"
                placeholder="Specify the exact RFP non-compliance grounds, clause citations, or disqualified parameters..."
                class="w-full p-3 border border-slate-300 rounded-lg text-xs font-normal text-slate-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 bg-white shadow-2xs leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-600 mb-1">
                Disqualification Order / Dispatch Ref No.
              </label>
              <input
                type="text"
                [(ngModel)]="rejectionOrderRefNo"
                placeholder="e.g. RSLDC/EOI/2026/REJ-0812"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-rose-600 shadow-2xs"
              />
            </div>
          </div>

          <div class="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              (click)="closeModals()"
              class="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="confirmRejectApplication()"
              [disabled]="!rejectionRemarks.trim()"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Confirm &amp; Disqualify Application</span>
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ====================================================================
         APPROVE APPLICATION MODAL (Grading & Score Input Empanelment Order)
         ==================================================================== -->
    @if (showApproveModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="background: rgba(10,20,40,0.5); backdrop-filter: blur(4px);"
        (click)="closeModals()"
      >
        <div
          class="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-2xl relative font-sans overflow-hidden my-auto max-h-[92vh] flex flex-col"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
        >
          <div class="h-1.5 w-full bg-emerald-600 shrink-0"></div>

          <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300 mb-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                EMPANELMENT APPROVAL DESK
              </div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                Approve &amp; Issue Empanelment Order
              </h2>
              <p class="text-xs text-slate-500 m-0 mt-0.5">
                {{ applicant()?.anonymousLabel || 'Company 1' }} &bull; {{ applicant()?.id }}
              </p>
            </div>

            <button
              type="button"
              (click)="closeModals()"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-5 sm:px-6 py-5 overflow-y-auto flex-1 space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <label for="approveScoreInput" class="block text-xs font-semibold text-slate-800 mb-1">
                  Technical Evaluation Score (0 - 100) <span class="text-emerald-700">*</span>
                </label>
                <div class="relative">
                  <input
                    id="approveScoreInput"
                    type="number"
                    min="0"
                    max="100"
                    [ngModel]="technicalScore"
                    (ngModelChange)="onScoreChange($event)"
                    placeholder="e.g. 88"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 bg-white shadow-2xs"
                  />
                  <span class="absolute right-3 top-2 text-slate-400 font-normal text-xs">/ 100</span>
                </div>
              </div>

              <div>
                <label for="approveGradeSelect" class="block text-xs font-semibold text-slate-800 mb-1">
                  Assigned Technical Grade <span class="text-emerald-700">*</span>
                </label>
                <select
                  id="approveGradeSelect"
                  [(ngModel)]="selectedGrade"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                >
                  @for (g of gradeOptions; track g.value) {
                    <option [value]="g.value">{{ g.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-800 mb-1">
                Empanelment Category / Tier Allocation
              </label>
              <select
                [(ngModel)]="approvalCategory"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
              >
                <option value="Category I (Tier-1 Training Partner - Full Batch Allocation)">Category I (Tier-1 Training Partner - Full Batch Allocation)</option>
                <option value="Category II (Tier-2 Training Partner - Phased Batches)">Category II (Tier-2 Training Partner - Phased Batches)</option>
                <option value="Category III (Special Sector / High Priority Empanelment)">Category III (Special Sector / High Priority Empanelment)</option>
              </select>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-slate-800">
                  Empanelment Recommendation Remarks &amp; Batch Allocation <span class="text-emerald-700">*</span>
                </label>
              </div>
              <textarea
                rows="4"
                [(ngModel)]="approvalRemarks"
                placeholder="Specify official empanelment recommendation, batch allocation across districts, or special execution conditions..."
                class="w-full p-3 border border-slate-300 rounded-lg text-xs font-normal text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white shadow-2xs leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-600 mb-1">
                Official Empanelment Order Ref No.
              </label>
              <input
                type="text"
                [(ngModel)]="approvalOrderRefNo"
                placeholder="e.g. RSLDC/EOI/2026/EMP-0819"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          <div class="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              (click)="closeModals()"
              class="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="confirmApproveApplication()"
              [disabled]="!isApproveFormValid()"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              style="color: #ffffff !important;"
            >
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span style="color: #ffffff !important;">Confirm &amp; Approve Application</span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ScrutinyDeskComponent {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private notifications = inject(NotificationService);
  private pdfService = inject(ScrutinyPdfService);
  private destroyRef = inject(DestroyRef);

  Math = Math;

  applicant = signal<ApplicantResponse | undefined>(undefined);

  readonly gradeOptions = GRADE_OPTIONS;

  // Modal Dialog States
  showApproveModal = signal<boolean>(false);
  showRejectModal = signal<boolean>(false);
  showRevertModal = signal<boolean>(false);
  showRemarksModal = signal<boolean>(false);

  // Approve Form State
  technicalScore: number = 88;
  selectedGrade: string = 'Grade A';
  approvalCategory: string = 'Category I (Tier-1 Training Partner - Full Batch Allocation)';
  approvalRemarks: string = 'Bidder satisfies all technical thresholds, infrastructure capacity, and statutory documentation requirements for Category I empanelment.';
  approvalOrderRefNo: string = '';

  // Reject Form State
  rejectionCategory: string = 'Non-fulfilment of minimum turnover criteria (RFP Clause 4.2)';
  rejectionRemarks: string = '';
  rejectionOrderRefNo: string = '';
  readonly rejectionGroundsList = [
    'Non-fulfilment of minimum turnover criteria (RFP Clause 4.2)',
    'Inadequate training centre infrastructure / carpet area capacity',
    'Debarred or blacklisted entity disqualification',
    'Statutory documentation discrepancy / MCA filing defect',
    'Failure to submit CA Turnover certificate with UDIN',
    'Other Technical Scrutiny Non-Compliance'
  ];
  readonly rejectionTemplateChips = [
    'Turnover does not meet RFP Clause 4.2 minimum threshold of ₹5 Crores.',
    'Training centre carpet area is below 1500 sq ft standard norm.',
    'Entity is disqualified as per Central/State debarment records.',
    'CA turnover certificate does not have valid ICAI UDIN number.'
  ];

  // Revert Form State
  isDocDropdownOpen = signal<boolean>(false);
  docSearchTerm = signal<string>('');
  selectedShortfallDocs = signal<string[]>([]);
  officeOrderRefNo = signal<string>('');
  officeOrderFileName = signal<string>('');
  officeOrderFileSize = signal<string>('');
  revertRemarks = signal<string>('');
  rectificationDays = signal<number>(7);

  readonly shortfallTemplates = [
    'CA turnover certificate must be for FY 2023-24 with UDIN & CA membership seal.',
    'Board resolution is missing the signature of authorized directors / official company seal.',
    'GST registration certificate active status requires re-validation on GSTN portal.',
    'Training centre carpet area proof does not meet minimum 1500 sq ft norm.',
    'Bank mandate form does not match the registered corporate legal name.'
  ];

  // Remarks Form State
  newRemarkText = signal<string>('');
  forwardToOfficer = signal<string>('Joint Director (Skill Development)');
  remarkPriority = signal<'Normal' | 'Urgent'>('Normal');

  readonly commonRemarksList = [
    'All statutory documents validated with original OTR credentials.',
    'Technical turnover criteria satisfied as per RFP Section 4.2.',
    'NSDC Partner affiliation certificate is active and authenticated.',
    'Clarification requested regarding training centre practical lab infrastructure.',
    'Recommended for State Empanelment Committee approval & target allocation.',
    'Bank mandate & cancelled cheque matched with PFMS records.',
    'GST active status checked successfully on GSTN portal.'
  ];

  readonly forwardOfficerOptions = [
    'Joint Director (Skill Development)',
    'Managing Director (RSLDC)',
    'State Empanelment Committee',
    'Technical Scrutiny Committee',
    'Accounts & Audit Officer',
    'Self / Keep at Scrutiny Desk'
  ];

  // Document Viewer State
  activeDoc = signal<ActivePreviewDocument | null>(null);
  isDownloadingZip = signal<boolean>(false);

  // Available TP / OTR documents for the shortfall dropdown
  readonly availableShortfallDocs = computed(() => {
    const app = this.applicant();
    const defaultDocs = [
      { id: 'DOC_REG', title: 'Organisation Registration Certificate', category: 'OTR' },
      { id: 'DOC_PAN', title: 'Organisation PAN Card', category: 'OTR' },
      { id: 'DOC_GST', title: 'GST Registration Certificate', category: 'OTR' },
      { id: 'DOC_BALANCE', title: 'Audited Balance Sheet / Turnover Certificate', category: 'Proposal' },
      { id: 'DOC_BOARD', title: 'Board Resolution / Power of Attorney', category: 'Proposal' },
      { id: 'DOC_NSDC', title: 'NSDC Partner Certificate', category: 'Proposal' },
      { id: 'DOC_ADDITIONAL', title: 'Additional Supporting Document', category: 'Proposal' },
      { id: 'DOC_SIGNATORY', title: 'Authorized Signatory Identity Proof (Aadhaar / Voter ID)', category: 'OTR' },
      { id: 'DOC_BANK', title: 'Bank Account Mandate / Cancelled Cheque', category: 'OTR' },
      { id: 'DOC_CENTRE', title: 'Training Centre Infrastructure & Equipment Proof', category: 'Proposal' },
      { id: 'DOC_AFFIDAVIT', title: 'Non-Blacklisting Declaration & Affidavit (Rs. 100 Stamp)', category: 'Statutory' },
      { id: 'DOC_EMD', title: 'EMD Statutory Deposit Receipt / Challan', category: 'Statutory' }
    ];

    if (!app?.uploadedDocuments?.length) {
      return defaultDocs;
    }

    const uploaded = app.uploadedDocuments.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category || 'Uploaded'
    }));

    const seen = new Set<string>();
    const list: { id: string; title: string; category: string }[] = [];
    for (const doc of [...uploaded, ...defaultDocs]) {
      const key = doc.title.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(doc);
      }
    }
    return list;
  });

  readonly filteredShortfallDocs = computed(() => {
    const term = this.docSearchTerm().trim().toLowerCase();
    const all = this.availableShortfallDocs();
    if (!term) return all;
    return all.filter(d => d.title.toLowerCase().includes(term) || d.category.toLowerCase().includes(term));
  });

  constructor() {
    this.route.params.pipe(takeUntilDestroyed()).subscribe(params => {
      const appId = params['applicationId'];
      if (appId) {
        this.loadApplicant(appId);
      }
    });
  }

  loadApplicant(appId: string): void {
    this.eoiStateService.getResponseById(appId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.applicant.set(data);
      if (data?.scrutinyDetails?.technicalScore) {
        this.technicalScore = data.scrutinyDetails.technicalScore;
        this.selectedGrade = data.scrutinyDetails.grade || 'Grade A';
        this.approvalRemarks = data.scrutinyDetails.remarks || this.approvalRemarks;
      }
    });
  }

  // --- Activity History Timeline Stream ---
  getActivityLog(): ApplicationActivityLog[] {
    const app = this.applicant();
    if (app?.activityLog && app.activityLog.length > 0) {
      return app.activityLog;
    }

    const subDate = app?.submissionDate || '08/09/2026 14:30 PM';
    const initial: ApplicationActivityLog[] = [
      {
        id: 'ACT-1',
        timestamp: subDate,
        action: 'SUBMITTED',
        title: 'EOI Proposal Submitted & Statutory Fee Paid',
        actor: `${app?.authorizedSignatory?.name || 'Applicant'} (${app?.authorizedSignatory?.designation || 'Authorized Signatory'})`,
        actorRole: 'Applicant / TP',
        description: `Complete proposal submitted under ${app?.schemeName || 'MMKVY'}. EMD Fee (₹${app?.emdFee?.toLocaleString() || '50,000'}) and Processing Fee (₹${app?.processingFee?.toLocaleString() || '2,000'}) successfully deposited via e-Challan. 7 Proposal documents uploaded.`,
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200'
      },
      {
        id: 'ACT-2',
        timestamp: '09/09/2026 10:15 AM',
        action: 'UNDER_REVIEW',
        title: 'Application Assigned to Scrutiny Desk',
        actor: 'Department Scrutiny Desk (RSLDC)',
        actorRole: 'Department Scrutiny Officer',
        description: 'Proposal dossier marked for Stage-1 technical eligibility scrutiny, statutory OTR document validation, and training infrastructure review.',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
      }
    ];

    if (app?.status === 'REVERTED' && app.scrutinyDetails?.shortfall) {
      initial.push({
        id: 'ACT-3',
        timestamp: app.scrutinyDetails.decisionTimestamp || '10/09/2026 11:30 AM',
        action: 'REVERTED',
        title: 'Shortfall Notice Issued (Reverted to Applicant)',
        actor: app.scrutinyDetails.scrutinyOfficer || 'Department Scrutiny Officer (RSLDC)',
        actorRole: 'Department Scrutiny Officer',
        description: `Shortfall notice issued for ${app.scrutinyDetails.shortfall.documents.length} document(s). Office Order Ref: ${app.scrutinyDetails.shortfall.officeOrderRef}. Rectification window: ${app.scrutinyDetails.shortfall.deadlineDays} Days. Remarks: "${app.scrutinyDetails.remarks}"`,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        meta: {
          documents: app.scrutinyDetails.shortfall.documents,
          officeOrderRef: app.scrutinyDetails.shortfall.officeOrderRef,
          remarks: app.scrutinyDetails.remarks
        }
      });
    } else if (app?.status === 'APPROVED' && app.scrutinyDetails) {
      initial.push({
        id: 'ACT-3',
        timestamp: app.scrutinyDetails.decisionTimestamp || '11/09/2026 16:45 PM',
        action: 'APPROVED',
        title: 'Application Approved & Empanelled',
        actor: 'State Empanelment Committee (RSLDC)',
        actorRole: 'Empanelment Committee',
        description: `Technical Evaluation Score awarded: ${app.scrutinyDetails.technicalScore}/100 (${app.scrutinyDetails.grade}). Empanelment recommendation: "${app.scrutinyDetails.remarks}"`,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        meta: {
          score: app.scrutinyDetails.technicalScore,
          grade: app.scrutinyDetails.grade,
          remarks: app.scrutinyDetails.remarks
        }
      });
    } else if (app?.status === 'REJECTED' && app.scrutinyDetails) {
      initial.push({
        id: 'ACT-3',
        timestamp: app.scrutinyDetails.decisionTimestamp || '11/09/2026 15:20 PM',
        action: 'REJECTED',
        title: 'Application Disqualified & Rejected',
        actor: app.scrutinyDetails.scrutinyOfficer || 'Department Scrutiny Desk (RSLDC)',
        actorRole: 'Department Scrutiny Officer',
        description: `Application disqualified. Reason: "${app.scrutinyDetails.remarks}". Statutory EMD refund initiated.`,
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        meta: {
          remarks: app.scrutinyDetails.remarks
        }
      });
    }

    return initial;
  }

  // --- Score Change Handler ---
  onScoreChange(val: number): void {
    if (val !== null && val !== undefined) {
      const clamped = clampScore(val);
      this.technicalScore = clamped;
      this.selectedGrade = gradeFromScore(clamped);
    }
  }

  // --- Modal Openers ---
  openApproveModal(): void {
    const app = this.applicant();
    this.approvalOrderRefNo = `RSLDC/EOI/2026/EMP-${app?.regNumber?.slice(-4) || '0819'}`;
    this.showApproveModal.set(true);
  }

  openRejectModal(): void {
    const app = this.applicant();
    this.rejectionRemarks = app?.scrutinyDetails?.remarks || '';
    this.rejectionOrderRefNo = `RSLDC/EOI/2026/REJ-${app?.regNumber?.slice(-4) || '0812'}`;
    this.showRejectModal.set(true);
  }

  openRevertModal(): void {
    const app = this.applicant();
    this.isDocDropdownOpen.set(false);
    this.docSearchTerm.set('');
    const prevDocs = app?.scrutinyDetails?.shortfall?.documents;
    this.selectedShortfallDocs.set(prevDocs ? [...prevDocs] : []);
    this.officeOrderRefNo.set(
      app?.scrutinyDetails?.shortfall?.officeOrderRef ||
      `RSLDC/EOI/2026/SF-${app?.regNumber?.slice(-4) || '0819'}`
    );
    this.officeOrderFileName.set(app?.scrutinyDetails?.shortfall?.officeOrderFileName || '');
    this.officeOrderFileSize.set(app?.scrutinyDetails?.shortfall?.officeOrderFileName ? '420 KB' : '');
    this.rectificationDays.set(app?.scrutinyDetails?.shortfall?.deadlineDays || 7);
    this.revertRemarks.set(app?.scrutinyDetails?.remarks || '');
    this.showRevertModal.set(true);
  }

  openRemarksModal(): void {
    this.newRemarkText.set('');
    this.forwardToOfficer.set('Joint Director (Skill Development)');
    this.remarkPriority.set('Normal');
    this.showRemarksModal.set(true);
  }

  closeModals(): void {
    this.showApproveModal.set(false);
    this.showRejectModal.set(false);
    this.showRevertModal.set(false);
    this.showRemarksModal.set(false);
    this.isDocDropdownOpen.set(false);
  }

  // --- Dropdown multi-select helpers ---
  toggleDocDropdown(): void {
    this.isDocDropdownOpen.update(v => !v);
  }

  toggleShortfallDoc(docTitle: string): void {
    const current = this.selectedShortfallDocs();
    if (current.includes(docTitle)) {
      this.selectedShortfallDocs.set(current.filter(d => d !== docTitle));
    } else {
      this.selectedShortfallDocs.set([...current, docTitle]);
    }
  }

  removeShortfallDoc(docTitle: string): void {
    this.selectedShortfallDocs.set(this.selectedShortfallDocs().filter(d => d !== docTitle));
  }

  selectAllShortfallDocs(): void {
    const all = this.filteredShortfallDocs().map(d => d.title);
    const combined = Array.from(new Set([...this.selectedShortfallDocs(), ...all]));
    this.selectedShortfallDocs.set(combined);
  }

  clearAllShortfallDocs(): void {
    this.selectedShortfallDocs.set([]);
  }

  isDocSelected(docTitle: string): boolean {
    return this.selectedShortfallDocs().includes(docTitle);
  }

  insertShortfallTemplate(text: string): void {
    const current = this.revertRemarks();
    if (!current.trim()) {
      this.revertRemarks.set(text);
    } else {
      this.revertRemarks.set(`${current.trim()}\n• ${text}`);
    }
  }

  insertRejectionTemplate(text: string): void {
    const current = this.rejectionRemarks;
    if (!current.trim()) {
      this.rejectionRemarks = text;
    } else {
      this.rejectionRemarks = `${current.trim()}\n• ${text}`;
    }
  }

  insertCommonRemark(remark: string): void {
    const current = this.newRemarkText();
    if (!current.trim()) {
      this.newRemarkText.set(remark);
    } else {
      this.newRemarkText.set(`${current.trim()} ${remark}`);
    }
  }

  // --- Office order file attachment ---
  onOfficeOrderFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.officeOrderFileName.set(file.name);
      const sizeKb = Math.round(file.size / 1024);
      this.officeOrderFileSize.set(`${sizeKb} KB`);
    }
  }

  attachDefaultOfficeOrder(): void {
    const app = this.applicant();
    const id = app?.regNumber || '2026-8819';
    this.officeOrderFileName.set(`Office_Order_Shortfall_${id}.pdf`);
    this.officeOrderFileSize.set('420 KB');
  }

  removeOfficeOrderFile(): void {
    this.officeOrderFileName.set('');
    this.officeOrderFileSize.set('');
  }

  // --- Form Validation ---
  isApproveFormValid(): boolean {
    return isAcceptFormValid(this.technicalScore, this.selectedGrade) && this.approvalRemarks.trim().length > 0;
  }

  isRevertFormValid(): boolean {
    return this.selectedShortfallDocs().length > 0 && this.revertRemarks().trim().length > 0;
  }

  // --- Actions ---
  confirmApproveApplication(): void {
    const app = this.applicant();
    if (!app || !this.isApproveFormValid()) return;

    const now = new Date();
    const nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity: ApplicationActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: nowStr,
      action: 'APPROVED',
      title: 'Application Approved & Empanelled',
      actor: 'State Empanelment Committee (RSLDC)',
      actorRole: 'Empanelment Committee',
      description: `Technical Evaluation Score awarded: ${this.technicalScore}/100 (${this.selectedGrade}). Empanelment Order Ref: ${this.approvalOrderRefNo || 'RSLDC/EOI/2026/EMP'}. Recommendation: "${this.approvalRemarks}"`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      meta: {
        score: this.technicalScore,
        grade: this.selectedGrade,
        remarks: this.approvalRemarks
      }
    };

    const updatedLog = [...this.getActivityLog(), newActivity];

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'APPROVED',
      technicalScore: this.technicalScore,
      grade: this.selectedGrade as GradeLabel,
      remarks: this.approvalRemarks,
      activityLog: updatedLog
    });

    this.closeModals();
    this.notifications.success(
      `Application for ${app.anonymousLabel || 'Company 1'} officially Approved & Empanelled (${this.selectedGrade}).`,
      'Empanelment Order Issued'
    );
    this.loadApplicant(app.id);
  }

  confirmRejectApplication(): void {
    const app = this.applicant();
    if (!app || !this.rejectionRemarks.trim()) return;

    const now = new Date();
    const nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity: ApplicationActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: nowStr,
      action: 'REJECTED',
      title: 'Application Disqualified & Rejected',
      actor: 'Department Scrutiny Desk (RSLDC)',
      actorRole: 'Department Scrutiny Officer',
      description: `Disqualification order issued. Primary ground: "${this.rejectionCategory}". Reason: "${this.rejectionRemarks}". Statutory EMD refund initiated.`,
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      meta: {
        remarks: this.rejectionRemarks
      }
    };

    const updatedLog = [...this.getActivityLog(), newActivity];

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'REJECTED',
      technicalScore: this.technicalScore || 0,
      grade: (this.selectedGrade || 'Grade E') as GradeLabel,
      remarks: this.rejectionRemarks,
      disqualificationReason: `${this.rejectionCategory}: ${this.rejectionRemarks}`,
      activityLog: updatedLog
    });

    this.closeModals();
    this.notifications.success(
      `Application for ${app.anonymousLabel || 'Company 1'} has been Disqualified and Rejected.`,
      'Rejection Recorded'
    );
    this.loadApplicant(app.id);
  }

  confirmRevertApplication(): void {
    const app = this.applicant();
    if (!app || !this.isRevertFormValid()) return;

    const officeRef = this.officeOrderRefNo() || `RSLDC/EOI/2026/SF-${app.regNumber.slice(-4) || '0819'}`;
    const fileName = this.officeOrderFileName() || `Office_Order_Shortfall_${app.id}.pdf`;
    const now = new Date();
    const nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity: ApplicationActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: nowStr,
      action: 'REVERTED',
      title: 'Shortfall Notice Issued (Reverted to Applicant)',
      actor: 'Department Scrutiny Officer (RSLDC)',
      actorRole: 'Department Scrutiny Officer',
      description: `Application returned to Training Partner with ${this.selectedShortfallDocs().length} flagged shortfall document(s). Office Order Ref: ${officeRef}. Rectification window: ${this.rectificationDays()} Days. Remarks: "${this.revertRemarks()}"`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      meta: {
        documents: this.selectedShortfallDocs(),
        officeOrderRef: officeRef,
        officeOrderFileName: fileName,
        remarks: this.revertRemarks()
      }
    };

    const updatedLog = [...this.getActivityLog(), newActivity];

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'REVERTED',
      technicalScore: 0,
      grade: 'Grade E',
      remarks: this.revertRemarks(),
      shortfall: {
        documents: this.selectedShortfallDocs(),
        officeOrderRef: officeRef,
        officeOrderFileName: fileName,
        deadlineDays: this.rectificationDays(),
        revertedAt: now.toLocaleDateString('en-GB')
      },
      activityLog: updatedLog
    });

    this.closeModals();
    this.notifications.success(
      `Application reverted to applicant with Shortfall Notice & Office Order (${officeRef}).`,
      'Shortfall Notice Issued'
    );
    this.loadApplicant(app.id);
  }

  confirmAddAndForwardRemarks(): void {
    const app = this.applicant();
    const remark = this.newRemarkText().trim();
    if (!app || !remark) return;

    const officer = this.forwardToOfficer();
    const now = new Date();
    const nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity: ApplicationActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: nowStr,
      action: 'FORWARDED',
      title: 'Scrutiny Remarks Added & Dossier Forwarded',
      actor: 'Department Scrutiny Officer (RSLDC)',
      actorRole: 'Department Scrutiny Officer',
      description: `Observation recorded: "${remark}". Proposal dossier forwarded to ${officer} (Priority: ${this.remarkPriority()}).`,
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      meta: {
        forwardedTo: officer,
        remarks: remark
      }
    };

    const updatedLog = [...this.getActivityLog(), newActivity];

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: app.status === 'UNDER_SCRUTINY' ? 'UNDER_SCRUTINY' as any : app.status,
      technicalScore: app.scrutinyDetails?.technicalScore || 0,
      grade: app.scrutinyDetails?.grade || 'Grade A',
      remarks: remark,
      activityLog: updatedLog,
      scrutinyOfficer: 'Department Scrutiny Officer (RSLDC)'
    });

    this.newRemarkText.set('');
    this.closeModals();
    this.notifications.success(
      `Remark recorded & application successfully forwarded to ${officer}.`,
      'Remarks Forwarded'
    );
    this.loadApplicant(app.id);
  }

  /**
   * Presentation Simulator: Demonstrates applicant responding to shortfall notice
   * and re-uploading the missing documents in the transaction history stream!
   */
  simulateApplicantResubmission(): void {
    const app = this.applicant();
    if (!app) return;

    const now = new Date();
    const nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity: ApplicationActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: nowStr,
      action: 'RESUBMITTED',
      title: 'Applicant Resubmitted Deficient Documents',
      actor: `${app.authorizedSignatory?.name || 'Applicant'} (Authorized Signatory)`,
      actorRole: 'Applicant / TP',
      description: `Training Partner re-uploaded rectified CA Balance Sheet and active GSTIN verification credentials in response to Shortfall Notice. Proposal returned to Scrutiny Desk for re-evaluation.`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };

    const updatedLog = [...this.getActivityLog(), newActivity];

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'UNDER_SCRUTINY' as any,
      technicalScore: 0,
      grade: 'Grade A',
      remarks: 'Rectified documents re-submitted by Training Partner.',
      activityLog: updatedLog
    });

    this.notifications.success(
      'Applicant has re-uploaded shortfall documents. Proposal returned to Under Review status.',
      'Documents Resubmitted'
    );
    this.loadApplicant(app.id);
  }

  /** Opens the Document / PDF Viewer for a dossier document directly in another tab in Chrome. */
  openOfficialDoc(doc: DossierDocument): void {
    window.open(encodeURI('/document/ISMS RFP.pdf'), '_blank');
  }

  closeDocViewer(): void {
    this.activeDoc.set(null);
  }

  /** Generates and downloads the official PDF for the document in the viewer. */
  downloadDocPdf(): void {
    const doc = this.activeDoc();
    if (!doc) return;
    this.pdfService.downloadDocPdf(doc, this.applicant());
  }

  /** Generates and downloads all verified proposal documents in a ZIP file. */
  async downloadAllZip(): Promise<void> {
    const app = this.applicant();
    const docs = app?.uploadedDocuments;
    if (!app || !docs || docs.length === 0) return;

    this.isDownloadingZip.set(true);
    try {
      await this.pdfService.downloadAllZip(app, docs);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      this.isDownloadingZip.set(false);
    }
  }
}
