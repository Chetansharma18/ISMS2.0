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
    <div class="w-full min-h-full bg-white text-slate-800 p-6 sm:p-8 font-sans">
      
      <!-- Top Breadcrumb & Nav -->
      <div class="mb-4 flex items-center justify-between">
        <a
          [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B3558] transition-colors cursor-pointer"
        >
          <span>&larr; Back to Applicant Submissions</span>
          <span class="text-slate-300">/</span>
          <span class="text-slate-700">Application Review</span>
        </a>

        <div class="flex items-center gap-2 text-xs font-bold">
          <span class="text-slate-500">Application ID:</span>
          <span class="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
            {{ applicant()?.id }}
          </span>
        </div>
      </div>

      <!-- Applicant Overview Banner -->
      <div class="bg-linear-to-r from-[#0B3558] to-[#124d7d] text-white rounded-xl p-5 sm:p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="bg-[#EA580C] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
              {{ applicant()?.anonymousLabel }}
            </span>
            <span class="text-xs font-mono text-slate-200">
              Reg No: {{ applicant()?.regNumber }}
            </span>
          </div>

          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white">
            {{ applicant()?.actualLegalName }}
          </h1>
          <p class="text-xs text-slate-200 mt-1">
            Applying under: <strong>{{ applicant()?.schemeName }}</strong> (Ref: {{ applicant()?.eoiRefNo }})
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <!-- Scrutiny Status Badge -->
          <div class="text-right">
            <span class="block text-[10px] uppercase font-bold text-slate-300 mb-0.5">Scrutiny Status</span>
            @if (applicant()?.status === 'UNDER_SCRUTINY') {
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Pending Review
              </span>
            } @else if (applicant()?.status === 'APPROVED') {
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Accepted (Approved)
              </span>
            } @else if (applicant()?.status === 'REJECTED') {
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                Rejected
              </span>
            }
          </div>

          <!-- EMD Status Badge -->
          <div class="text-right pl-3 border-l border-white/20">
            <span class="block text-[10px] uppercase font-bold text-slate-300 mb-0.5">EMD Status</span>
            @if (applicant()?.emdStatus === 'PAID') {
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-400">
                ₹50,000 (PAID)
              </span>
            } @else {
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-900/80 text-amber-200 border border-amber-400">
                REFUNDED
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Recorded Decision Banner (When already evaluated) -->
      @if (applicant()?.scrutinyDetails) {
        <div class="mb-6 p-5 rounded-xl border"
          [class.bg-emerald-50]="applicant()?.status === 'APPROVED'"
          [class.border-emerald-300]="applicant()?.status === 'APPROVED'"
          [class.bg-red-50]="applicant()?.status === 'REJECTED'"
          [class.border-red-300]="applicant()?.status === 'REJECTED'"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full"
                [class.bg-emerald-600]="applicant()?.status === 'APPROVED'"
                [class.bg-red-600]="applicant()?.status === 'REJECTED'"
              ></span>
              <h3 class="text-sm font-black"
                [class.text-emerald-900]="applicant()?.status === 'APPROVED'"
                [class.text-red-900]="applicant()?.status === 'REJECTED'"
              >
                Official Scrutiny Order Recorded: {{ applicant()?.statusDisplay }}
              </h3>
            </div>

            <span class="text-xs font-mono font-bold"
              [class.text-emerald-800]="applicant()?.status === 'APPROVED'"
              [class.text-red-800]="applicant()?.status === 'REJECTED'"
            >
              {{ applicant()?.scrutinyDetails?.decisionTimestamp }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs mb-3">
            <div>
              <span class="text-slate-500 block text-[11px]">Technical Score</span>
              <span class="font-extrabold text-sm text-slate-800">{{ applicant()?.scrutinyDetails?.technicalScore }} / 100</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Assigned Grade</span>
              <span class="font-bold text-slate-800">{{ applicant()?.scrutinyDetails?.grade }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Scrutiny Officer</span>
              <span class="font-medium text-slate-800">{{ applicant()?.scrutinyDetails?.scrutinyOfficer }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Committee Resolution</span>
              @if (applicant()?.scrutinyDetails?.approvalDocument) {
                <span class="font-bold text-emerald-800 flex items-center gap-1">
                  &check; {{ applicant()?.scrutinyDetails?.approvalDocument?.documentName }}
                </span>
              } @else {
                <span class="text-slate-400">NA</span>
              }
            </div>
          </div>

          @if (applicant()?.scrutinyDetails?.remarks) {
            <div class="pt-2 border-t border-slate-200/60 text-xs">
              <span class="text-slate-500 font-bold block mb-0.5">Scrutiny Remarks:</span>
              <p class="text-slate-700 italic leading-relaxed">
                "{{ applicant()?.scrutinyDetails?.remarks }}"
              </p>
            </div>
          }

          @if (applicant()?.scrutinyDetails?.disqualificationReason) {
            <div class="mt-2 text-xs text-red-800 font-bold">
              Disqualification Ground: {{ applicant()?.scrutinyDetails?.disqualificationReason }}
            </div>
          }
        </div>
      }

      <!-- ====================================================================
           COMPLETE INFORMATION DOSSIER (Single seamless page view)
           ==================================================================== -->
      <div class="space-y-6">
        
        <!-- Card 1: Tender Summary & Scope -->
        <div class="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div class="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tender Scope &amp; Application Parameters
            </h2>
            <span class="text-[11px] font-semibold text-slate-500">
              Submission Date: {{ applicant()?.submissionDate }}
            </span>
          </div>
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span class="text-slate-500 block text-[11px]">Scheme Title</span>
              <span class="font-bold text-slate-800">{{ applicant()?.schemeName }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">EOI Reference No.</span>
              <span class="font-mono font-bold text-slate-800">{{ applicant()?.eoiRefNo }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Earnest Money Deposit (EMD)</span>
              <span class="font-bold text-[#16834B]">₹{{ applicant()?.emdFee | number }} (PAID)</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Processing Fee</span>
              <span class="font-bold text-slate-800">₹{{ applicant()?.processingFee | number }} (PAID)</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Organisation Profile (OTR Verified) -->
        <div class="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div class="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Organisation Details (Verified from OTR Profile)
            </h2>
            <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              &check; OTR Verified
            </span>
          </div>
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3.5 gap-x-6 text-xs">
            <div>
              <span class="text-slate-500 block text-[11px]">Legal Entity Name</span>
              <span class="font-bold text-slate-900">{{ applicant()?.organisation?.legalName }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Trade / Brand Name</span>
              <span class="font-semibold text-slate-800">{{ applicant()?.organisation?.tradeName }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Entity Constitution</span>
              <span class="font-medium text-slate-700">{{ applicant()?.organisation?.entityType }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Registration / CIN No.</span>
              <span class="font-mono font-bold text-slate-800">{{ applicant()?.organisation?.registrationNumber }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Date &amp; State of Reg</span>
              <span class="font-medium text-slate-700">{{ applicant()?.organisation?.dateOfRegistration }} ({{ applicant()?.organisation?.stateOfRegistration }})</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">PAN &amp; GSTIN</span>
              <span class="font-mono font-bold text-slate-800">{{ applicant()?.organisation?.panNumber }} · {{ applicant()?.organisation?.gstin }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Declared Annual Turnover</span>
              <span class="font-bold text-[#0B3558]">{{ applicant()?.organisation?.turnover }}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="text-slate-500 block text-[11px]">Registered Office Address</span>
              <span class="font-medium text-slate-700">{{ applicant()?.organisation?.registeredAddress }}</span>
            </div>
          </div>
        </div>

        <!-- Card 3: Authorized Signatory Details (Matching Screenshot 3) -->
        <div class="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div class="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Authorized Signatory Details
            </h2>
            <span class="text-[11px] font-semibold text-slate-500">
              Official Liaison Person
            </span>
          </div>
          
          <div class="p-4 sm:p-5 text-xs space-y-4">
            <!-- Name & Contact -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-3 border-b border-slate-100">
              <div>
                <span class="text-slate-500 block text-[11px]">Full Name</span>
                <span class="font-bold text-slate-900">{{ applicant()?.authorizedSignatory?.name }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Designation</span>
                <span class="font-semibold text-slate-800">{{ applicant()?.authorizedSignatory?.designation }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px]">Official Email &amp; Contact</span>
                <span class="font-medium text-slate-700">{{ applicant()?.authorizedSignatory?.email }} · {{ applicant()?.authorizedSignatory?.contactNumber }}</span>
              </div>
            </div>

            <!-- Matching Screenshot 3 Exact Rows -->
            <div class="space-y-3 pt-1">
              <div>
                <span class="text-slate-500 block text-[11px]">Residence Address</span>
                <span class="font-bold text-slate-800">{{ applicant()?.authorizedSignatory?.residenceAddress }}</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4">
                <div>
                  <span class="text-slate-500 block text-[11px]">State</span>
                  <span class="font-bold text-slate-800">{{ applicant()?.authorizedSignatory?.state }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">PAN</span>
                  <span class="font-bold text-slate-800">{{ applicant()?.authorizedSignatory?.pan }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">Aadhaar No.</span>
                  <span class="font-bold text-slate-800">{{ applicant()?.authorizedSignatory?.aadhaarNo }}</span>
                </div>

                <div>
                  <span class="text-slate-500 block text-[11px]">Type ID Proof</span>
                  <span class="font-bold text-slate-800">{{ applicant()?.authorizedSignatory?.typeIdProof }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">ID No.</span>
                  <span class="font-bold text-slate-800">{{ applicant()?.authorizedSignatory?.idNo }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">Bhamashah No.</span>
                  <span class="text-slate-400 font-medium">{{ applicant()?.authorizedSignatory?.bhamashahNo }}</span>
                </div>

                <div>
                  <span class="text-slate-500 block text-[11px]">Voter Id No.</span>
                  <span class="font-bold text-slate-800">{{ applicant()?.authorizedSignatory?.voterIdNo }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">Passport No.</span>
                  <span class="font-bold text-slate-800">{{ applicant()?.authorizedSignatory?.passportNo }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[11px]">Service Tax No.</span>
                  <span class="text-slate-400 font-medium">{{ applicant()?.authorizedSignatory?.serviceTaxNo }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 4: Proposed Training Centres & SDC Infrastructure in Rajasthan -->
        <div class="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div class="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Proposed Training Centre Details (SDCs in Rajasthan)
            </h2>
            <span class="text-[11px] font-bold text-[#0B3558]">
              Total Centres: {{ applicant()?.trainingCentres?.length }}
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th class="py-2.5 px-3">District / City</th>
                  <th class="py-2.5 px-3">Name of Centre</th>
                  <th class="py-2.5 px-3 text-center">Classrooms</th>
                  <th class="py-2.5 px-3 text-center">Practical Rooms</th>
                  <th class="py-2.5 px-3 text-center">Separate Washrooms</th>
                  <th class="py-2.5 px-3 text-center">Lab Infrastructure</th>
                  <th class="py-2.5 px-3">Address</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                @for (c of applicant()?.trainingCentres; track c.centreName) {
                  <tr class="hover:bg-slate-50">
                    <td class="py-2.5 px-3 font-bold text-slate-800">{{ c.district }}</td>
                    <td class="py-2.5 px-3 font-semibold text-slate-900">{{ c.centreName }}</td>
                    <td class="py-2.5 px-3 text-center font-bold">{{ c.classrooms }}</td>
                    <td class="py-2.5 px-3 text-center font-bold">{{ c.practicalRooms }}</td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="px-2 py-0.5 rounded text-[11px] font-bold" [class.bg-emerald-50]="c.separateWashrooms" [class.text-emerald-700]="c.separateWashrooms" [class.bg-red-50]="!c.separateWashrooms" [class.text-red-700]="!c.separateWashrooms">
                        {{ c.separateWashrooms ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="px-2 py-0.5 rounded text-[11px] font-bold" [class.bg-emerald-50]="c.labInfrastructure" [class.text-emerald-700]="c.labInfrastructure" [class.bg-red-50]="!c.labInfrastructure" [class.text-red-700]="!c.labInfrastructure">
                        {{ c.labInfrastructure ? 'Available' : 'Missing' }}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-slate-600 text-[11px] max-w-[200px] truncate" [title]="c.fullAddress">
                      {{ c.fullAddress }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Card 5: Financials, Past Placement & Annual Action Plan -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 3-Year Financial Turnover -->
          <div class="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div class="bg-slate-50 border-b border-slate-200 px-4 py-2.5">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3-Year Audited Turnover (INR)
              </h3>
            </div>
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th class="py-2 px-3">Year</th>
                  <th class="py-2 px-3 text-right">Total Turnover</th>
                  <th class="py-2 px-3 text-right">Skill Turnover</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (f of applicant()?.financialYears; track f.year) {
                  <tr>
                    <td class="py-2 px-3 font-semibold text-slate-800">{{ f.year }}</td>
                    <td class="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{{ f.totalTurnover }}</td>
                    <td class="py-2 px-3 text-right font-mono text-[#0B3558]">₹{{ f.skillTurnover }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Past Training & Placement Track Record -->
          <div class="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div class="bg-slate-50 border-b border-slate-200 px-4 py-2.5">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Training &amp; Placement Track Record
              </h3>
            </div>
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th class="py-2 px-3">Sector</th>
                  <th class="py-2 px-3 text-center">Trained</th>
                  <th class="py-2 px-3 text-center">Placed</th>
                  <th class="py-2 px-3 text-center">% Placed</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (p of applicant()?.placementTrackRecord; track p.sector) {
                  <tr>
                    <td class="py-2 px-3 font-medium text-slate-800">{{ p.sector }}</td>
                    <td class="py-2 px-3 text-center font-bold">{{ p.trained }}</td>
                    <td class="py-2 px-3 text-center font-bold text-[#16834B]">{{ p.placed }}</td>
                    <td class="py-2 px-3 text-center font-bold text-[#0B3558]">
                      {{ (p.placed / p.trained * 100).toFixed(1) }}%
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Card 6: STEP 3: DOCUMENT UPLOAD Checklist (Matching Screenshot 3) -->
        <div class="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div class="bg-slate-50 border-b border-slate-200 px-4 py-3">
            <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
              STEP 3: DOCUMENT UPLOAD
            </h2>
          </div>

          <!-- Grid matching Screenshot 3 -->
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            @for (doc of applicant()?.uploadedDocuments; track doc.id) {
              <div class="border border-slate-200 rounded-lg p-3.5 bg-white flex items-center justify-between hover:border-slate-300 transition-all">
                <div class="flex items-center gap-3 min-w-0 pr-2">
                  <!-- PDF Icon -->
                  <div class="w-7 h-7 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                    </svg>
                  </div>

                  <div class="min-w-0">
                    <p class="font-bold text-slate-800 text-xs truncate leading-snug" [title]="doc.title">
                      {{ doc.title }}
                    </p>
                    <p class="text-[10.5px] text-slate-400 mt-0.5">
                      {{ doc.fileSize }}
                    </p>
                  </div>
                </div>

                <!-- View Button -->
                <button
                  type="button"
                  (click)="openDocPreview(doc)"
                  class="px-3 py-1 text-xs font-bold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shrink-0 cursor-pointer"
                >
                  View
                </button>
              </div>
            }
          </div>
        </div>

        <!-- ====================================================================
             BOTTOM ACTION BAR: Clear Accept & Reject Decision Buttons
             ==================================================================== -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 bg-white">
          <a
            [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']"
            class="px-4 py-2.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer w-full sm:w-auto text-center"
          >
            &larr; Return to Submissions List
          </a>

          <!-- Decision Action Triggers -->
          <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
            <!-- Reject Button -->
            <button
              type="button"
              (click)="openRejectModal()"
              class="px-5 py-2.5 rounded-lg border-2 border-[#C62828] text-[#C62828] hover:bg-red-50 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span class="text-base leading-none">&times;</span>
              <span>Reject Application</span>
            </button>

            <!-- Accept Button -->
            <button
              type="button"
              (click)="openAcceptModal()"
              class="px-6 py-2.5 rounded-lg bg-[#16834B] hover:bg-emerald-800 text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span class="text-sm leading-none">&check;</span>
              <span>Accept Application</span>
            </button>
          </div>
        </div>

      </div>

      <!-- ====================================================================
           POPUP 1: ACCEPT & EMPANEL APPLICATION MODAL (Best UI, No Accept/Reject toggles)
           ==================================================================== -->
      @if (showAcceptModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 my-8"
          >
            <!-- Top Forest Green Strip -->
            <div class="h-2 bg-[#16834B]"></div>

            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-emerald-100 text-[#16834B] flex items-center justify-center font-bold text-base">
                  &check;
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-black text-slate-900">
                    Accept &amp; Empanel Application
                  </h3>
                  <p class="text-[11px] text-slate-500">
                    {{ applicant()?.anonymousLabel }} ({{ applicant()?.actualLegalName }}) · {{ applicant()?.id }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="closeModals()"
                class="text-slate-400 hover:text-slate-700 text-xl font-bold leading-none cursor-pointer p-1"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <!-- Modal Body Form -->
            <div class="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              
              <!-- 1. Technical Score & Grade Selector -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Numeric Score Input -->
                <div>
                  <label for="modalScoreInput" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-[#16834B]"
                    />
                    <span class="absolute right-3.5 top-2.5 text-slate-400 font-semibold text-xs">
                      / 100
                    </span>
                  </div>
                </div>

                <!-- Grade Selector -->
                <div>
                  <label for="modalGradeSelect" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Technical Grade *
                  </label>
                  <select
                    id="modalGradeSelect"
                    [(ngModel)]="selectedGrade"
                    class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#16834B] cursor-pointer"
                  >
                    <option value="" disabled>-- Select Grade --</option>
                    <option value="Grade A">Grade A (Score >= 85) - Outstanding Empanelment</option>
                    <option value="Grade B">Grade B (Score 70 - 84) - Satisfactory Empanelment</option>
                    <option value="Grade C">Grade C (Score 55 - 69) - Conditional Empanelment</option>
                    <option value="Grade D">Grade D (Score 40 - 54) - Sub-Optimal</option>
                    <option value="Grade E">Grade E (Score < 40) - Disqualified</option>
                  </select>
                </div>
              </div>

              <!-- 2. Mandatory Committee Approval Document Attachment -->
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Committee Approval Document Attachment (PDF) *
                  </label>
                  <span class="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Max 10MB
                  </span>
                </div>

                <div class="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf"
                    (change)="onResolutionFileSelected($event)"
                    class="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#0B3558] file:text-white hover:file:bg-[#07233B] file:cursor-pointer cursor-pointer"
                  />
                </div>

                @if (resolutionFileName()) {
                  <div class="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold">
                    <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ resolutionFileName() }} ({{ resolutionFileSize() }})</span>
                  </div>
                }

                <!-- Committee e-Sign Badges -->
                <div class="pt-2">
                  <span class="block text-[11px] font-bold text-slate-600 mb-1.5">
                    Statutory Committee Digital Signatures:
                  </span>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div class="bg-white border border-slate-200 rounded p-2 text-[11px]">
                      <span class="text-emerald-700 font-bold block">&check; Digitally Signed</span>
                      <strong class="text-slate-800 block mt-0.5">Dr. Alok Verma, IAS</strong>
                      <span class="text-slate-400 text-[10px]">MD, RSLDC (Chair)</span>
                    </div>

                    <div class="bg-white border border-slate-200 rounded p-2 text-[11px]">
                      <span class="text-emerald-700 font-bold block">&check; Digitally Signed</span>
                      <strong class="text-slate-800 block mt-0.5">Shri R. K. Sharma</strong>
                      <span class="text-slate-400 text-[10px]">Joint Director Scrutiny</span>
                    </div>

                    <div class="bg-white border border-slate-200 rounded p-2 text-[11px]">
                      <span class="text-emerald-700 font-bold block">&check; Digitally Signed</span>
                      <strong class="text-slate-800 block mt-0.5">Smt. Neeta Mathur</strong>
                      <span class="text-slate-400 text-[10px]">Senior Accounts Officer</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. Empanelment Remarks -->
              <div>
                <label for="modalApprovalRemarks" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Empanelment Recommendation Remarks
                </label>
                <textarea
                  id="modalApprovalRemarks"
                  rows="3"
                  [(ngModel)]="decisionRemarks"
                  placeholder="Specify official empanelment recommendation, batch allocation, or special conditions..."
                  class="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#16834B] bg-white"
                ></textarea>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                (click)="closeModals()"
                class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                (click)="confirmAcceptApplication()"
                [disabled]="!isAcceptFormValid()"
                class="px-6 py-2.5 bg-[#16834B] hover:bg-emerald-800 text-white rounded-lg text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
           ==================================================================== -->
      @if (showRejectModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 my-8"
          >
            <!-- Top Crimson Red Strip -->
            <div class="h-2 bg-[#C62828]"></div>

            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-red-100 text-[#C62828] flex items-center justify-center font-bold text-base">
                  &times;
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-black text-slate-900">
                    Reject &amp; Disqualify Application
                  </h3>
                  <p class="text-[11px] text-slate-500">
                    {{ applicant()?.anonymousLabel }} · {{ applicant()?.id }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="closeModals()"
                class="text-slate-400 hover:text-slate-700 text-xl font-bold leading-none cursor-pointer p-1"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <!-- Modal Body Form -->
            <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              <!-- Disqualification Grounds Dropdown -->
              <div>
                <label for="modalDisqualificationReason" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Statutory Ground for Rejection *
                </label>
                <select
                  id="modalDisqualificationReason"
                  [(ngModel)]="disqualificationReason"
                  class="w-full px-3.5 py-2.5 border border-red-300 rounded-lg text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-red-600 cursor-pointer"
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

              <!-- Mandatory Detailed Remarks Textarea -->
              <div>
                <label for="modalRejectionRemarks" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Scrutiny Remarks &amp; Clause Citations *
                </label>
                <textarea
                  id="modalRejectionRemarks"
                  rows="3"
                  [(ngModel)]="decisionRemarks"
                  placeholder="Specify the exact clauses, deficiency details, and committee finding..."
                  class="w-full p-2.5 border border-red-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-red-600 bg-white"
                ></textarea>
              </div>



            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                (click)="closeModals()"
                class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                (click)="confirmRejectApplication()"
                [disabled]="!isRejectFormValid()"
                class="px-6 py-2.5 bg-[#C62828] hover:bg-red-800 text-white rounded-lg text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div class="bg-[#0B3558] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 class="text-xs font-bold truncate">
                {{ activePreviewDoc()?.title }}
              </h3>
              <button
                type="button"
                (click)="activePreviewDoc.set(null)"
                class="text-slate-300 hover:text-white cursor-pointer font-bold text-base leading-none"
              >
                &times;
              </button>
            </div>

            <div class="p-6 text-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-blue-50 text-[#0B3558] mx-auto flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <div>
                <h4 class="font-bold text-slate-800 text-sm">
                  {{ activePreviewDoc()?.title }}
                </h4>
                <p class="text-xs text-slate-500 mt-1">
                  File Size: {{ activePreviewDoc()?.fileSize }} · Format: PDF Document
                </p>
                <p class="text-xs text-emerald-700 font-semibold mt-1">
                  &check; Digitally Verified by RSLDC EOI Inward Desk
                </p>
              </div>

              <div class="bg-slate-50 border border-slate-200 rounded p-3 text-left text-xs text-slate-600 space-y-1">
                <p><strong>Issuing Entity:</strong> {{ applicant()?.actualLegalName }}</p>
                <p><strong>Registration Ref:</strong> {{ applicant()?.regNumber }}</p>
                <p><strong>Verification Status:</strong> Valid &amp; Authentic</p>
              </div>

              <button
                type="button"
                (click)="activePreviewDoc.set(null)"
                class="w-full py-2 bg-[#0B3558] text-white rounded text-xs font-bold hover:bg-[#07233B] transition-colors cursor-pointer"
              >
                Close Document Preview
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Success Notification Toast / Banner -->
      @if (showSuccessBanner()) {
        <div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 max-w-md animate-in slide-in-from-bottom-5 duration-200">
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              &check;
            </div>
            <div>
              <h4 class="text-xs font-bold text-white">
                Scrutiny Decision Successfully Committed
              </h4>
              <p class="text-[11px] text-slate-300 mt-0.5">
                The decision for {{ applicant()?.anonymousLabel }} has been recorded. State has propagated to all portal modules.
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

  isAcceptFormValid(): boolean {
    return this.technicalScore !== null &&
      this.technicalScore !== undefined &&
      !!this.selectedGrade &&
      !!this.resolutionFileName();
  }

  isRejectFormValid(): boolean {
    return !!this.disqualificationReason && this.decisionRemarks.trim().length > 5;
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
        fileSize: this.resolutionFileSize(),
        signatories: [
          { name: 'Dr. Alok Verma, IAS', designation: 'Managing Director, RSLDC', signedAt: 'Current Session', verified: true },
          { name: 'Shri R. K. Sharma', designation: 'Joint Director (Scrutiny In-Charge)', signedAt: 'Current Session', verified: true },
          { name: 'Smt. Neeta Mathur', designation: 'Senior Accounts Officer (Finance)', signedAt: 'Current Session', verified: true }
        ]
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
    if (!app || !this.disqualificationReason) return;

    this.eoiStateService.updateScrutinyDecision(app.id, {
      status: 'REJECTED',
      technicalScore: this.technicalScore || 35,
      grade: (this.selectedGrade || 'Grade E') as any,
      remarks: this.decisionRemarks,
      disqualificationReason: this.disqualificationReason
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
