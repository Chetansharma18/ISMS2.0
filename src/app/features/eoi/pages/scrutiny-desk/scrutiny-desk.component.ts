import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, ApplicantResponse, DossierDocument } from '../../services/eoi-state.service';

@Component({
  selector: 'app-scrutiny-desk',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Top Breadcrumb & Nav -->
        <nav class="flex items-center justify-between text-xs text-slate-500 font-normal" aria-label="Breadcrumb">
          <div class="flex items-center gap-2">
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
            <span class="text-slate-700 font-normal">Application Review</span>
          </div>

          <div class="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span>Application ID:</span>
            <span class="font-mono text-slate-800 font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
              {{ applicant()?.id }}
            </span>
          </div>
        </nav>

        <!-- Applicant Overview Card -->
        <div class="bg-[#0B3558] text-white rounded-lg p-4 sm:p-5 border-b-2 border-amber-500 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="bg-amber-500 text-slate-900 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                {{ applicant()?.anonymousLabel }}
              </span>
              <span class="text-xs font-mono text-slate-200">
                Reg No: {{ applicant()?.regNumber }}
              </span>
            </div>

            <h1 class="text-base sm:text-lg font-semibold tracking-tight text-white">
              {{ applicant()?.actualLegalName }}
            </h1>
            <p class="text-xs text-slate-200 mt-0.5 font-normal">
              Applying under: <span class="text-white font-medium">{{ applicant()?.schemeName }}</span> (Ref: {{ applicant()?.eoiRefNo }})
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3 shrink-0">
            <!-- Scrutiny Status Badge -->
            <div class="text-right">
              <span class="block text-[10px] uppercase font-medium text-slate-300 mb-0.5">Scrutiny Status</span>
              @if (applicant()?.status === 'UNDER_SCRUTINY') {
                <span class="inline-block px-2.5 py-0.5 rounded text-xs font-normal bg-amber-50 text-amber-800 border border-amber-300">
                  Pending Review
                </span>
              } @else if (applicant()?.status === 'APPROVED') {
                <span class="inline-block px-2.5 py-0.5 rounded text-xs font-normal bg-emerald-50 text-emerald-800 border border-emerald-300">
                  Accepted (Approved)
                </span>
              } @else if (applicant()?.status === 'REJECTED') {
                <span class="inline-block px-2.5 py-0.5 rounded text-xs font-normal bg-rose-50 text-rose-800 border border-rose-300">
                  Rejected
                </span>
              }
            </div>

            <!-- EMD Status Badge -->
            <div class="text-right pl-3 border-l border-white/20">
              <span class="block text-[10px] uppercase font-medium text-slate-300 mb-0.5">EMD Status</span>
              @if (applicant()?.emdStatus === 'PAID') {
                <span class="inline-block px-2.5 py-0.5 rounded text-xs font-normal bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                  ₹50,000 (PAID)
                </span>
              } @else {
                <span class="inline-block px-2.5 py-0.5 rounded text-xs font-normal bg-amber-950/80 text-amber-300 border border-amber-500/50">
                  REFUNDED
                </span>
              }
            </div>
          </div>
        </div>

        <!-- Recorded Decision Banner (When already evaluated) -->
        @if (applicant()?.scrutinyDetails) {
          <div class="p-3.5 sm:p-4 rounded-lg border text-xs"
            [class.bg-emerald-50/70]="applicant()?.status === 'APPROVED'"
            [class.border-emerald-200]="applicant()?.status === 'APPROVED'"
            [class.bg-rose-50/70]="applicant()?.status === 'REJECTED'"
            [class.border-rose-200]="applicant()?.status === 'REJECTED'"
          >
            <div class="flex items-center justify-between mb-2.5">
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

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs mb-2.5">
              <div>
                <span class="text-slate-500 block text-[11px]">Technical Score</span>
                <span class="font-medium text-slate-800">{{ applicant()?.scrutinyDetails?.technicalScore }} / 100</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Assigned Grade</span>
                <span class="font-medium text-slate-800">{{ applicant()?.scrutinyDetails?.grade }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Scrutiny Officer</span>
                <span class="font-normal text-slate-800">{{ applicant()?.scrutinyDetails?.scrutinyOfficer }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Committee Resolution</span>
                @if (applicant()?.scrutinyDetails?.approvalDocument) {
                  <span class="font-medium text-slate-800 flex items-center gap-1">
                    <span class="text-emerald-600">&check;</span> {{ applicant()?.scrutinyDetails?.approvalDocument?.documentName }}
                  </span>
                } @else {
                  <span class="text-slate-400">NA</span>
                }
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

            @if (applicant()?.scrutinyDetails?.disqualificationReason) {
              <div class="mt-2 text-xs text-rose-800 font-medium">
                Disqualification Ground: {{ applicant()?.scrutinyDetails?.disqualificationReason }}
              </div>
            }
          </div>
        }

        <!-- Dossier Information Container -->
        <div class="space-y-3 font-sans">
          
          <!-- Card 1: Tender Scope & Parameters -->
          <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <div class="bg-[#F4F7FB] border-b border-slate-200 px-3.5 py-2 flex items-center justify-between">
              <h2 class="text-xs font-medium text-slate-700 uppercase tracking-normal">
                Tender Scope &amp; Application Parameters
              </h2>
              <span class="text-[11px] text-slate-500 font-normal">
                Submission Date: {{ applicant()?.submissionDate }}
              </span>
            </div>
            <div class="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span class="text-slate-500 block text-[11px]">Scheme Title</span>
                <span class="font-medium text-slate-800">{{ applicant()?.schemeName }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">EOI Reference No.</span>
                <span class="font-mono text-slate-800">{{ applicant()?.eoiRefNo }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Earnest Money Deposit (EMD)</span>
                <span class="font-normal text-emerald-700">₹{{ applicant()?.emdFee | number }} (PAID)</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Processing Fee</span>
                <span class="font-normal text-slate-800">₹{{ applicant()?.processingFee | number }} (PAID)</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Organisation Details -->
          <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <div class="bg-[#F4F7FB] border-b border-slate-200 px-3.5 py-2 flex items-center justify-between">
              <h2 class="text-xs font-medium text-slate-700 uppercase tracking-normal">
                Organisation Details (Verified from OTR Profile)
              </h2>
              <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-normal">
                &check; OTR Verified
              </span>
            </div>
            <div class="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2.5 gap-x-4 text-xs">
              <div>
                <span class="text-slate-500 block text-[11px]">Legal Entity Name</span>
                <span class="font-medium text-slate-800">{{ applicant()?.organisation?.legalName }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Trade / Brand Name</span>
                <span class="font-normal text-slate-800">{{ applicant()?.organisation?.tradeName }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Entity Constitution</span>
                <span class="font-normal text-slate-700">{{ applicant()?.organisation?.entityType }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Registration / CIN No.</span>
                <span class="font-mono text-slate-800">{{ applicant()?.organisation?.registrationNumber }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Date &amp; State of Reg</span>
                <span class="font-normal text-slate-700">{{ applicant()?.organisation?.dateOfRegistration }} ({{ applicant()?.organisation?.stateOfRegistration }})</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">PAN &amp; GSTIN</span>
                <span class="font-mono text-slate-800">{{ applicant()?.organisation?.panNumber }} &bull; {{ applicant()?.organisation?.gstin }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Declared Annual Turnover</span>
                <span class="font-medium text-[#0B3558]">{{ applicant()?.organisation?.turnover }}</span>
              </div>
              <div class="sm:col-span-2">
                <span class="text-slate-500 block text-[11px]">Registered Office Address</span>
                <span class="font-normal text-slate-700">{{ applicant()?.organisation?.registeredAddress }}</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Authorized Signatory Details -->
          <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <div class="bg-[#F4F7FB] border-b border-slate-200 px-3.5 py-2 flex items-center justify-between">
              <h2 class="text-xs font-medium text-slate-700 uppercase tracking-normal">
                Authorized Signatory Details
              </h2>
              <span class="text-[11px] text-slate-500 font-normal">
                Official Liaison Person
              </span>
            </div>
            
            <div class="p-3 sm:p-4 text-xs space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2.5 border-b border-slate-100">
                <div>
                  <span class="text-slate-500 block text-[11px]">Full Name</span>
                  <span class="font-medium text-slate-800">{{ applicant()?.authorizedSignatory?.name }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">Designation</span>
                  <span class="font-normal text-slate-800">{{ applicant()?.authorizedSignatory?.designation }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">Official Email &amp; Contact</span>
                  <span class="font-normal text-slate-700">{{ applicant()?.authorizedSignatory?.email }} &bull; {{ applicant()?.authorizedSignatory?.contactNumber }}</span>
                </div>
              </div>

              <div class="space-y-2">
                <div>
                  <span class="text-slate-500 block text-[11px]">Residence Address</span>
                  <span class="font-normal text-slate-800">{{ applicant()?.authorizedSignatory?.residenceAddress }}</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-y-2.5 gap-x-4">
                  <div>
                    <span class="text-slate-500 block text-[11px]">State</span>
                    <span class="font-normal text-slate-800">{{ applicant()?.authorizedSignatory?.state }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11px]">PAN</span>
                    <span class="font-mono text-slate-800">{{ applicant()?.authorizedSignatory?.pan }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11px]">Aadhaar No.</span>
                    <span class="font-mono text-slate-800">{{ applicant()?.authorizedSignatory?.aadhaarNo }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11px]">Type ID Proof</span>
                    <span class="font-normal text-slate-800">{{ applicant()?.authorizedSignatory?.typeIdProof }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11px]">ID No.</span>
                    <span class="font-mono text-slate-800">{{ applicant()?.authorizedSignatory?.idNo }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11px]">Voter Id No.</span>
                    <span class="font-mono text-slate-800">{{ applicant()?.authorizedSignatory?.voterIdNo }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4: Proposed Training Centres in Rajasthan -->
          <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <div class="bg-[#F4F7FB] border-b border-slate-200 px-3.5 py-2 flex items-center justify-between">
              <h2 class="text-xs font-medium text-slate-700 uppercase tracking-normal">
                Proposed Training Centre Details (SDCs in Rajasthan)
              </h2>
              <span class="text-[11px] text-[#0B3558] font-medium">
                Total Centres: {{ applicant()?.trainingCentres?.length }}
              </span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-[#F4F7FB] text-slate-700 text-[11px] font-medium border-b border-slate-200">
                    <th class="py-2 px-3 border-r border-slate-200">District / City</th>
                    <th class="py-2 px-3 border-r border-slate-200">Name of Centre</th>
                    <th class="py-2 px-3 text-center border-r border-slate-200">Classrooms</th>
                    <th class="py-2 px-3 text-center border-r border-slate-200">Practical Rooms</th>
                    <th class="py-2 px-3 text-center border-r border-slate-200">Separate Washrooms</th>
                    <th class="py-2 px-3 text-center border-r border-slate-200">Lab Infrastructure</th>
                    <th class="py-2 px-3">Address</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white font-normal text-slate-700">
                  @for (c of applicant()?.trainingCentres; track c.centreName) {
                    <tr class="hover:bg-slate-50/70 transition-colors">
                      <td class="py-2 px-3 font-medium text-slate-800 border-r border-slate-100">{{ c.district }}</td>
                      <td class="py-2 px-3 font-normal text-slate-800 border-r border-slate-100">{{ c.centreName }}</td>
                      <td class="py-2 px-3 text-center font-normal border-r border-slate-100">{{ c.classrooms }}</td>
                      <td class="py-2 px-3 text-center font-normal border-r border-slate-100">{{ c.practicalRooms }}</td>
                      <td class="py-2 px-3 text-center border-r border-slate-100">
                        <span class="px-2 py-0.5 rounded text-[11px] font-normal" [class.text-emerald-700]="c.separateWashrooms" [class.text-rose-600]="!c.separateWashrooms">
                          {{ c.separateWashrooms ? 'Yes' : 'No' }}
                        </span>
                      </td>
                      <td class="py-2 px-3 text-center border-r border-slate-100">
                        <span class="px-2 py-0.5 rounded text-[11px] font-normal" [class.text-emerald-700]="c.labInfrastructure" [class.text-rose-600]="!c.labInfrastructure">
                          {{ c.labInfrastructure ? 'Available' : 'Missing' }}
                        </span>
                      </td>
                      <td class="py-2 px-3 text-slate-600 text-[11px] max-w-[200px] truncate" [title]="c.fullAddress">
                        {{ c.fullAddress }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Card 5: Financials & Placement Track Record -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- 3-Year Financial Turnover -->
            <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              <div class="bg-[#F4F7FB] border-b border-slate-200 px-3.5 py-2">
                <h3 class="text-xs font-medium text-slate-700 uppercase tracking-normal">
                  3-Year Audited Turnover (INR)
                </h3>
              </div>
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="bg-[#F4F7FB] text-slate-700 text-[11px] font-medium border-b border-slate-200">
                    <th class="py-2 px-3 border-r border-slate-200">Year</th>
                    <th class="py-2 px-3 text-right border-r border-slate-200">Total Turnover</th>
                    <th class="py-2 px-3 text-right">Skill Turnover</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white font-normal text-slate-700">
                  @for (f of applicant()?.financialYears; track f.year) {
                    <tr>
                      <td class="py-2 px-3 font-normal text-slate-800 border-r border-slate-100">{{ f.year }}</td>
                      <td class="py-2 px-3 text-right font-mono font-normal text-slate-800 border-r border-slate-100">₹{{ f.totalTurnover }}</td>
                      <td class="py-2 px-3 text-right font-mono font-normal text-[#0B3558]">₹{{ f.skillTurnover }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Past Training & Placement Track Record -->
            <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              <div class="bg-[#F4F7FB] border-b border-slate-200 px-3.5 py-2">
                <h3 class="text-xs font-medium text-slate-700 uppercase tracking-normal">
                  Training &amp; Placement Track Record
                </h3>
              </div>
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="bg-[#F4F7FB] text-slate-700 text-[11px] font-medium border-b border-slate-200">
                    <th class="py-2 px-3 border-r border-slate-200">Sector</th>
                    <th class="py-2 px-3 text-center border-r border-slate-200">Trained</th>
                    <th class="py-2 px-3 text-center border-r border-slate-200">Placed</th>
                    <th class="py-2 px-3 text-center">% Placed</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white font-normal text-slate-700">
                  @for (p of applicant()?.placementTrackRecord; track p.sector) {
                    <tr>
                      <td class="py-2 px-3 font-normal text-slate-800 border-r border-slate-100">{{ p.sector }}</td>
                      <td class="py-2 px-3 text-center font-normal border-r border-slate-100">{{ p.trained }}</td>
                      <td class="py-2 px-3 text-center font-normal text-emerald-700 border-r border-slate-100">{{ p.placed }}</td>
                      <td class="py-2 px-3 text-center font-normal text-[#0B3558]">
                        {{ (p.placed / p.trained * 100).toFixed(1) }}%
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Card 6: Uploaded Documents Checklist -->
          <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <div class="bg-[#F4F7FB] border-b border-slate-200 px-3.5 py-2">
              <h2 class="text-xs font-medium text-slate-700 uppercase tracking-normal">
                Uploaded Proposal Documents (Statutory Checklist)
              </h2>
            </div>

            <div class="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              @for (doc of applicant()?.uploadedDocuments; track doc.id) {
                <div class="border border-slate-200 rounded p-2.5 bg-white flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div class="flex items-center gap-2.5 min-w-0 pr-2">
                    <!-- Adobe PDF Icon -->
                    <svg class="w-5 h-5 shrink-0 select-none shadow-2xs" viewBox="0 0 24 24">
                      <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                      <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                    </svg>

                    <div class="min-w-0">
                      <p class="font-normal text-slate-800 text-xs truncate leading-snug" [title]="doc.title">
                        {{ doc.title }}
                      </p>
                      <p class="text-[10px] text-slate-400 mt-0.5">
                        {{ doc.fileSize }} &bull; PDF
                      </p>
                    </div>
                  </div>

                  <!-- View Button -->
                  <button
                    type="button"
                    (click)="openDocPreview(doc)"
                    class="px-2 py-0.5 text-xs font-normal rounded bg-sky-50 hover:bg-sky-100 text-[#0B3558] border border-sky-200 transition-colors shrink-0 cursor-pointer shadow-2xs"
                  >
                    View
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Bottom Action Bar: Accept & Reject Decision Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 bg-white">
            <a
              [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']"
              class="px-3 py-1.5 border border-slate-200 rounded text-xs font-normal text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer w-full sm:w-auto text-center shadow-2xs"
            >
              &larr; Return to Submissions List
            </a>

            <!-- Decision Action Triggers -->
            <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
              <!-- Reject Button -->
              <button
                type="button"
                (click)="openRejectModal()"
                class="px-3.5 py-1.5 rounded border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>&times;</span>
                <span>Reject Application</span>
              </button>

              <!-- Accept Button -->
              <button
                type="button"
                (click)="openAcceptModal()"
                class="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>&check;</span>
                <span>Accept Application</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      <!-- ====================================================================
           POPUP 1: ACCEPT & EMPANEL APPLICATION MODAL
           (Statutory Committee Digital Signatures REMOVED per user request)
           ==================================================================== -->
      @if (showAcceptModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto font-sans"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="relative bg-white rounded-lg shadow-xl max-w-xl w-full border border-slate-300 overflow-hidden animate-in zoom-in-95 duration-150 my-6"
          >
            <!-- Top Accent Strip -->
            <div class="h-1 bg-emerald-600"></div>

            <!-- Modal Header -->
            <div class="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-medium text-xs">
                  &check;
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-slate-800">
                    Accept &amp; Empanel Application
                  </h3>
                  <p class="text-[11px] text-slate-500 font-normal">
                    {{ applicant()?.anonymousLabel }} ({{ applicant()?.actualLegalName }}) &bull; {{ applicant()?.id }}
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
            <div class="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              
              <!-- 1. Technical Score & Grade Selector -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Numeric Score Input -->
                <div>
                  <label for="modalScoreInput" class="block text-xs font-normal text-slate-700 mb-1">
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
                      class="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-normal text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                    />
                    <span class="absolute right-3 top-1.5 text-slate-400 font-normal text-xs">
                      / 100
                    </span>
                  </div>
                </div>

                <!-- Grade Selector -->
                <div>
                  <label for="modalGradeSelect" class="block text-xs font-normal text-slate-700 mb-1">
                    Assigned Technical Grade *
                  </label>
                  <select
                    id="modalGradeSelect"
                    [(ngModel)]="selectedGrade"
                    class="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-normal text-slate-800 bg-white focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
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

              <!-- 2. Committee Approval Document Attachment -->
              <div class="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-normal text-slate-800">
                    Committee Approval Document Attachment (PDF) *
                  </label>
                  <span class="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Max 10MB
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    (change)="onResolutionFileSelected($event)"
                    class="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-normal file:bg-[#0B3558] file:text-white hover:file:bg-[#07233B] file:cursor-pointer cursor-pointer"
                  />
                </div>

                @if (resolutionFileName()) {
                  <div class="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 font-normal">
                    <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ resolutionFileName() }} ({{ resolutionFileSize() }})</span>
                  </div>
                }
              </div>

              <!-- 3. Empanelment Remarks -->
              <div>
                <label for="modalApprovalRemarks" class="block text-xs font-normal text-slate-700 mb-1">
                  Empanelment Recommendation Remarks
                </label>
                <textarea
                  id="modalApprovalRemarks"
                  rows="3"
                  [(ngModel)]="decisionRemarks"
                  placeholder="Specify official empanelment recommendation, batch allocation, or special conditions..."
                  class="w-full p-2.5 border border-slate-200 rounded text-xs font-normal text-slate-800 focus:outline-none focus:border-emerald-600 bg-white shadow-2xs"
                ></textarea>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                (click)="closeModals()"
                class="px-3 py-1.5 border border-slate-200 rounded text-slate-700 hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                (click)="confirmAcceptApplication()"
                [disabled]="!isAcceptFormValid()"
                class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-normal transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Confirm &amp; Issue Empanelment Order</span>
                <span>&rarr;</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ====================================================================
           POPUP 2: REJECT & DISQUALIFY APPLICATION MODAL
           (With REQUIRED Committee_Empanelment_Resolution per user request)
           ==================================================================== -->
      @if (showRejectModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto font-sans"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="relative bg-white rounded-lg shadow-xl max-w-xl w-full border border-slate-300 overflow-hidden animate-in zoom-in-95 duration-150 my-6"
          >
            <!-- Top Crimson Red Strip -->
            <div class="h-1 bg-rose-600"></div>

            <!-- Modal Header -->
            <div class="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-medium text-xs">
                  &times;
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-slate-800">
                    Reject &amp; Disqualify Application
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
            <div class="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              
              <!-- 1. Disqualification Grounds Dropdown -->
              <div>
                <label for="modalDisqualificationReason" class="block text-xs font-normal text-slate-700 mb-1">
                  Primary Statutory Ground for Rejection *
                </label>
                <select
                  id="modalDisqualificationReason"
                  [(ngModel)]="disqualificationReason"
                  class="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-normal text-slate-800 bg-white focus:outline-none focus:border-rose-600 cursor-pointer shadow-2xs"
                >
                  <option value="" disabled>-- Select Disqualification Ground --</option>
                  <option value="Deficiency in Audited Turnover (< ₹10 Cr)">Deficiency in Audited Turnover (&lt; ₹10 Cr mandatory)</option>
                  <option value="Non-compliant Training Infrastructure">Non-compliant Training Centre Infrastructure (Classrooms / Labs deficit)</option>
                  <option value="Incomplete Annexures / Statutory Documentation">Incomplete Annexures / Statutory Documentation Missing</option>
                  <option value="Blacklisted / Disqualified Entity">Blacklisted / Disqualified Entity or Adverse Vigilance Report</option>
                  <option value="Negative Placement Track Record (< 70%)">Negative Placement Track Record (&lt; 70% threshold)</option>
                  <option value="Other Statutory Non-Compliance">Other Statutory Non-Compliance under EOI Guidelines</option>
                </select>
              </div>

              <!-- 2. Mandatory Committee Empanelment / Disqualification Resolution Attachment -->
              <div class="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-normal text-slate-800">
                    Committee Empanelment Resolution (PDF) *
                  </label>
                  <span class="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    Mandatory Attachment
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    (change)="onRejectResolutionFileSelected($event)"
                    class="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-normal file:bg-[#0B3558] file:text-white hover:file:bg-[#07233B] file:cursor-pointer cursor-pointer"
                  />
                </div>

                @if (rejectResolutionFileName()) {
                  <div class="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 font-normal">
                    <svg class="w-3.5 h-3.5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ rejectResolutionFileName() }} ({{ rejectResolutionFileSize() }})</span>
                  </div>
                }
              </div>

              <!-- 3. Mandatory Detailed Remarks Textarea -->
              <div>
                <label for="modalRejectionRemarks" class="block text-xs font-normal text-slate-700 mb-1">
                  Detailed Scrutiny Remarks &amp; Clause Citations *
                </label>
                <textarea
                  id="modalRejectionRemarks"
                  rows="3"
                  [(ngModel)]="decisionRemarks"
                  placeholder="Specify the exact clauses, deficiency details, and committee finding..."
                  class="w-full p-2.5 border border-slate-200 rounded text-xs font-normal text-slate-800 focus:outline-none focus:border-rose-600 bg-white shadow-2xs"
                ></textarea>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                (click)="closeModals()"
                class="px-3 py-1.5 border border-slate-200 rounded text-slate-700 hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                (click)="confirmRejectApplication()"
                [disabled]="!isRejectFormValid()"
                class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-normal transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Confirm &amp; Issue Rejection Order</span>
                <span>&rarr;</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- Document Preview Modal (Interactive View) -->
      @if (activePreviewDoc()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div class="bg-[#0B3558] text-white px-4 py-2.5 flex items-center justify-between">
              <h3 class="text-xs font-medium truncate">
                {{ activePreviewDoc()?.title }}
              </h3>
              <button
                type="button"
                (click)="activePreviewDoc.set(null)"
                class="text-slate-300 hover:text-white cursor-pointer text-base leading-none"
              >
                &times;
              </button>
            </div>

            <div class="p-4 text-center space-y-3 text-xs">
              <div class="w-12 h-12 rounded-full bg-blue-50 text-[#0B3558] mx-auto flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <div>
                <h4 class="font-medium text-slate-800 text-xs">
                  {{ activePreviewDoc()?.title }}
                </h4>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  File Size: {{ activePreviewDoc()?.fileSize }} &bull; Format: PDF Document
                </p>
                <p class="text-[11px] text-emerald-700 font-normal mt-0.5">
                  &check; Digitally Verified by RSLDC EOI Inward Desk
                </p>
              </div>

              <div class="bg-slate-50 border border-slate-200 rounded p-2.5 text-left text-xs text-slate-600 space-y-1">
                <p><span class="text-slate-500">Issuing Entity:</span> <span class="text-slate-800">{{ applicant()?.actualLegalName }}</span></p>
                <p><span class="text-slate-500">Registration Ref:</span> <span class="font-mono text-slate-800">{{ applicant()?.regNumber }}</span></p>
                <p><span class="text-slate-500">Verification Status:</span> <span class="text-emerald-700">Valid &amp; Authentic</span></p>
              </div>

              <button
                type="button"
                (click)="activePreviewDoc.set(null)"
                class="w-full py-1.5 bg-[#0B3558] text-white rounded text-xs font-normal hover:bg-[#07233B] transition-colors cursor-pointer shadow-2xs"
              >
                Close Document Preview
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

    </div>
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
  disqualificationReason = '';

  // File upload state for accept
  resolutionFileName = signal<string>('Committee_Empanelment_Resolution_042.pdf');
  resolutionFileSize = signal<string>('3.1 MB');

  // File upload state for reject (Required attachment per user request)
  rejectResolutionFileName = signal<string>('Committee_Empanelment_Resolution_042.pdf');
  rejectResolutionFileSize = signal<string>('2.8 MB');

  activePreviewDoc = signal<DossierDocument | null>(null);
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
      if (data?.scrutinyDetails?.disqualificationReason) {
        this.disqualificationReason = data.scrutinyDetails.disqualificationReason;
      }
      if (data?.scrutinyDetails?.approvalDocument?.documentName) {
        this.resolutionFileName.set(data.scrutinyDetails.approvalDocument.documentName);
        this.rejectResolutionFileName.set(data.scrutinyDetails.approvalDocument.documentName);
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
    this.disqualificationReason = this.applicant()?.scrutinyDetails?.disqualificationReason || '';
    this.decisionRemarks = this.applicant()?.scrutinyDetails?.remarks || '';
    this.showRejectModal.set(true);
  }

  closeModals(): void {
    this.showAcceptModal.set(false);
    this.showRejectModal.set(false);
  }

  onResolutionFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.resolutionFileName.set(file.name);
      this.resolutionFileSize.set(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  }

  onRejectResolutionFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.rejectResolutionFileName.set(file.name);
      this.rejectResolutionFileSize.set(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  }

  isAcceptFormValid(): boolean {
    return this.technicalScore !== null &&
      this.technicalScore !== undefined &&
      !!this.selectedGrade &&
      !!this.resolutionFileName();
  }

  isRejectFormValid(): boolean {
    return !!this.disqualificationReason &&
      this.decisionRemarks.trim().length > 5 &&
      !!this.rejectResolutionFileName();
  }

  confirmAcceptApplication(): void {
    const app = this.applicant();
    if (!app || this.technicalScore === null) return;

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'APPROVED',
      technicalScore: this.technicalScore,
      grade: this.selectedGrade as any,
      remarks: this.decisionRemarks,
      approvalDocument: {
        id: `RES-${app.id}-2026`,
        documentName: this.resolutionFileName(),
        uploadDate: new Date().toLocaleDateString('en-GB'),
        fileSize: this.resolutionFileSize()
      }
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
    if (!app || !this.disqualificationReason || !this.rejectResolutionFileName()) return;

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'REJECTED',
      technicalScore: this.technicalScore || 35,
      grade: (this.selectedGrade || 'Grade E') as any,
      remarks: this.decisionRemarks,
      disqualificationReason: this.disqualificationReason,
      approvalDocument: {
        id: `RES-REJ-${app.id}-2026`,
        documentName: this.rejectResolutionFileName(),
        uploadDate: new Date().toLocaleDateString('en-GB'),
        fileSize: this.rejectResolutionFileSize()
      }
    });

    this.closeModals();
    this.showSuccessBanner.set(true);
    this.loadApplicant(app.id);

    setTimeout(() => {
      this.showSuccessBanner.set(false);
    }, 4000);
  }

  openDocPreview(doc: DossierDocument): void {
    this.activePreviewDoc.set(doc);
  }
}
