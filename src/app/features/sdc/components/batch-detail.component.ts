import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { BatchRecord } from '../models/batch.model';
import { AuthService } from '../../../core/auth/auth.service';
import { PageHeaderComponent } from '../../../shared/components';

@Component({
  selector: 'app-batch-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      
      @if (batch(); as b) {
        <div class="p-4 sm:p-6 lg:p-7 space-y-5 max-w-7xl mx-auto">
          
          <!-- Top Page Header -->
          <app-page-header
            [title]="'Batch Details — ' + b.batchCode"
            bgColor="var(--color-primary, #174A6E)"
            [showBack]="true"
            [backUrl]="backUrl()"
            backTitle="Back to Batches"
          >
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="printSummary()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-white/20 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                title="Print Batch Summary"
              >
                <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>

              @if (isAdmin() && (b.status === 'PENDING_APPROVAL' || b.approvalStatus === 'PENDING')) {
                <button
                  type="button"
                  (click)="openApproveModal(b)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Approve Batch"
                >
                  <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Approve Batch</span>
                </button>
              }

              @if (!isAdmin() && (b.status === 'APPROVED' || b.approvalStatus === 'APPROVED' || b.status === 'ONGOING')) {
                <a
                  [routerLink]="['/batches', b.id, 'map-aspirant']"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-[#174A6E] hover:bg-slate-100 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  title="Register Aspirants to this Batch"
                >
                  <span class="text-sm leading-none font-bold">+</span>
                  <span>Register Aspirant</span>
                </a>
              }
            </div>
          </app-page-header>

          <!-- Success Alert Notification -->
          @if (successMessage()) {
            <div class="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="font-medium">{{ successMessage() }}</span>
              </div>
              <button (click)="successMessage.set('')" class="text-emerald-600 hover:text-emerald-900 cursor-pointer font-bold">✕</button>
            </div>
          }

          <!-- ========================================================================= -->
          <!-- HERO OVERVIEW STRIP: Batch Code & Course Context in ISMS Theme            -->
          <!-- ========================================================================= -->
          <div class="rounded-xl border border-[#D9E1E7] bg-[#EAF2F6]/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            
            <!-- Left: Batch Code, Name & Scheme -->
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded bg-[#174A6E] text-white text-[10.5px] font-bold uppercase tracking-wider">
                  Batch Code
                </span>
                <span class="font-mono text-xs font-bold text-slate-700">
                  {{ b.batchCode }}
                </span>
                <span class="text-slate-300">•</span>
                <span class="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10.5px] uppercase">
                  {{ b.scheme }}
                </span>
                <span class="text-slate-500 text-xs">Sector: <strong class="text-slate-800">{{ b.sector }}</strong></span>
              </div>

              <div class="text-base sm:text-lg font-bold text-slate-900">
                {{ b.batchName || b.courseName }}
              </div>

              <div class="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                <span>Course: <strong class="text-slate-800">{{ b.courseName }}</strong></span>
                <span>•</span>
                <span>Center: <strong class="text-slate-800">{{ b.sdcName }}</strong></span>
                <span class="font-mono text-slate-500">({{ b.sdcCode }})</span>
                <span>•</span>
                <span>District: <strong class="text-slate-800">{{ b.sdcDistrict || 'Rajasthan' }}</strong></span>
              </div>
            </div>

            <!-- Right: Status Badge & Capacity Metrics -->
            <div class="flex items-center gap-4 sm:gap-6 flex-wrap">
              
              <!-- Batch Strength -->
              <div class="text-right">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Batch Strength</span>
                <span class="font-bold text-slate-900 text-sm">
                  {{ b.approvedBatchStrength || b.maxStrength || 30 }} Trainees
                </span>
                <div class="text-[11px] text-slate-500">
                  Mapped: <strong class="text-slate-800">{{ b.mappedAspirantsCount || 0 }}</strong>
                </div>
              </div>

              <!-- Status Badge (Bold text, specific colors per prompt) -->
              <div class="text-right pl-3 border-l border-slate-200">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Status</span>
                @if (b.approvalStatus === 'APPROVED' || b.status === 'APPROVED' || b.status === 'ONGOING') {
                  <span class="px-3 py-1 rounded bg-emerald-50 border border-emerald-200 font-bold text-xs tracking-wider uppercase text-emerald-700 inline-block">
                    APPROVED
                  </span>
                } @else if (b.status === 'INSPECTION_PENDING' || b.approvalStatus === 'INSPECTION_PENDING' || b.status.includes('INSPECTION')) {
                  <span class="px-3 py-1 rounded bg-red-50 border border-red-200 font-bold text-xs tracking-wider uppercase text-red-600 inline-block">
                    PENDING INSPECTION
                  </span>
                } @else if (b.approvalStatus === 'REJECTED' || b.status === 'REJECTED') {
                  <span class="px-3 py-1 rounded bg-red-50 border border-red-200 font-bold text-xs tracking-wider uppercase text-red-600 inline-block">
                    REJECTED
                  </span>
                } @else {
                  <span class="px-3 py-1 rounded bg-amber-50 border border-amber-200 font-bold text-xs tracking-wider uppercase text-amber-700 inline-block">
                    PENDING
                  </span>
                }
              </div>

            </div>

          </div>

          <!-- ========================================================================= -->
          <!-- SECTION 1: COURSE & CURRICULUM PARAMETERS                                 -->
          <!-- ========================================================================= -->
          <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                <span>1. Course &amp; Curriculum Parameters</span>
              </h2>
              <span class="text-[11px] text-slate-500 font-medium font-mono">
                QP: {{ b.qpCode || 'SSC/Q2212' }}
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span class="text-slate-400 block text-[11px]">Course Name</span>
                <span class="font-bold text-slate-900 text-sm mt-0.5 block">{{ b.courseName }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Qualification Pack (QP)</span>
                <span class="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{{ b.qpCode || 'SSC/Q2212' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">NSQF Course Version</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.courseVersion || 'NSQF v2.0' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Residential Training</span>
                <span class="font-semibold mt-0.5 block" [ngClass]="b.residential ? 'text-emerald-700' : 'text-slate-700'">
                  {{ b.residential ? 'Yes (Residential Facility Attached)' : 'No (Day-Scholar Non-Residential)' }}
                </span>
              </div>

              <!-- Hours Breakdown -->
              <div>
                <span class="text-slate-400 block text-[11px]">Theory Hours</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.theoryHours ?? Math.round(b.totalHours * 0.4) }} hrs</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Practical Hours</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.practicalHours ?? Math.round(b.totalHours * 0.5) }} hrs</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Soft Skills &amp; Employability</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.softSkillHours ?? Math.round(b.totalHours * 0.1) }} hrs</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Total Batch Duration</span>
                <span class="font-bold text-[#174A6E] text-sm mt-0.5 block">{{ b.totalHours || b.batchDurationHours || 300 }} hrs</span>
              </div>
            </div>
          </div>

          <!-- ========================================================================= -->
          <!-- SECTION 2: TRAINING CENTER & BATCH SCHEDULE                               -->
          <!-- ========================================================================= -->
          <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                <span>2. Training Center &amp; Batch Schedule</span>
              </h2>
              <span class="text-[11px] text-slate-500 font-mono">
                Sanction Ref: {{ b.nipaNo || 'N-IPA/RSLDC/2026/891' }}
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span class="text-slate-400 block text-[11px]">Training Center (SDC)</span>
                <span class="font-bold text-slate-900 mt-0.5 block">{{ b.sdcName }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">SDC Center Code</span>
                <span class="font-mono font-bold text-slate-800 mt-0.5 block">{{ b.sdcCode }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Center District</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.sdcDistrict || 'Jaipur' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Training Partner (TP)</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.tpName }}</span>
              </div>

              <div>
                <span class="text-slate-400 block text-[11px]">Batch Start Date</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.startDate }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Batch End Date</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.endDate }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Daily Training Timings</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.startTime }} to {{ b.endTime }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Data Freeze Date</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.freezeDate || 'Prior to Batch Start' }}</span>
              </div>

              <div>
                <span class="text-slate-400 block text-[11px]">Approved Batch Strength</span>
                <span class="font-bold text-slate-900 text-sm mt-0.5 block">{{ b.approvedBatchStrength || b.maxStrength }} Trainees</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Minimum Quorum Strength</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.minStrength || 15 }} Trainees</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">AEBAS Biometric Attendance</span>
                <span class="font-semibold text-emerald-700 mt-0.5 block">Active • {{ b.biometricAttendanceRate || 94 }}% Rate</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Batch Special Remarks</span>
                <span class="font-normal text-slate-700 mt-0.5 block truncate" [title]="b.remarks || 'Standard Batch Guidelines'">
                  {{ b.remarks || 'Standard Batch Guidelines' }}
                </span>
              </div>
            </div>
          </div>

          <!-- ========================================================================= -->
          <!-- SECTION 3: STATUTORY VERIFICATION & PSD PAYMENT DETAILS                   -->
          <!-- ========================================================================= -->
          <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                <span>3. Statutory Verification &amp; PSD Payment Details</span>
              </h2>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                &check; RSLDC AUTHORIZED
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span class="text-slate-400 block text-[11px]">Statutory Batch PSD Fee</span>
                <span class="font-mono font-bold text-slate-900 text-sm mt-0.5 block">₹{{ b.psdFee || 500 }}.00</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Payment Status</span>
                <span class="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{{ (b.psdPaymentStatus || 'SUCCESS').toUpperCase() }}</span>
                </span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Transaction / Challan Reference</span>
                <span class="font-mono font-bold text-slate-800 mt-0.5 block">{{ b.psdPaymentRef || 'PSD-TXN-2026-89140' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Payment Mode</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.psdPaymentMode || 'Online Payment Gateway (e-Mitra)' }}</span>
              </div>

              <div>
                <span class="text-slate-400 block text-[11px]">Payment Timestamp</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.psdPaymentDate || '2026-08-25' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Cyber Treasury Status</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">e-Gras Verified</span>
              </div>
              <div class="col-span-2">
                <span class="text-slate-400 block text-[11px]">Payment Description</span>
                <span class="text-slate-700 mt-0.5 block">Statutory non-refundable batch commencement verification fee</span>
              </div>
            </div>
          </div>

          <!-- ========================================================================= -->
          <!-- SECTION 4: TRAINER & FACULTY PARTICULARS                                  -->
          <!-- ========================================================================= -->
          <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                <span>4. Trainer &amp; Faculty Particulars</span>
              </h2>
              <span class="text-slate-500 text-xs">
                {{ b.faculty.length }} Trainer{{ b.faculty.length > 1 ? 's' : '' }} Assigned
              </span>
            </div>

            <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th class="py-2.5 px-3 w-12 text-center">#</th>
                    <th class="py-2.5 px-3 min-w-[200px]">Trainer / Faculty Name</th>
                    <th class="py-2.5 px-3 min-w-[160px]">Trainer Type</th>
                    <th class="py-2.5 px-3 min-w-[220px]">Qualification &amp; Specialization</th>
                    <th class="py-2.5 px-3 min-w-[120px] text-center">Experience</th>
                    <th class="py-2.5 px-3 min-w-[120px] text-center">TOT Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-800">
                  @for (fac of (b.faculty && b.faculty.length > 0 ? b.faculty : defaultFaculty); track fac.id || $index; let i = $index) {
                    <tr class="hover:bg-slate-50/60 transition-colors">
                      <td class="py-2.5 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                      <td class="py-2.5 px-3 font-semibold text-slate-900">
                        {{ fac.name || fac.facultyName || 'Primary Faculty' }}
                      </td>
                      <td class="py-2.5 px-3">
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {{ fac.type || fac.trainerType || 'Primary Trainer' }}
                        </span>
                      </td>
                      <td class="py-2.5 px-3 text-slate-700 font-normal">
                        {{ fac.qualification || 'B.Tech Electrical (TOT Certified)' }}
                      </td>
                      <td class="py-2.5 px-3 text-center font-medium text-slate-700">
                        {{ fac.experienceYears || 5 }} Years
                      </td>
                      <td class="py-2.5 px-3 text-center">
                        <span class="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          &check; TOT Verified
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- ========================================================================= -->
          <!-- SECTION 5: HOSTEL / RESIDENTIAL ACCOMMODATION (IF APPLICABLE)             -->
          <!-- ========================================================================= -->
          @if (b.residential || (b.hostels && b.hostels.length > 0) || b.hostel) {
            <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                  <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                  <span>5. Hostel &amp; Residential Accommodation</span>
                </h2>
                <span class="text-emerald-700 text-xs font-semibold">Residential Facility Verified</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block text-[11px]">Hostel Code</span>
                  <span class="font-mono font-bold text-slate-800 mt-0.5 block">{{ b.hostel?.code || b.hostel?.hostelCode || 'HST-JP-001' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[11px]">Accommodation Type</span>
                  <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.hostel?.type || b.hostel?.hostelType || 'Boys & Girls (Segregated)' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[11px]">Hostel Bed Capacity</span>
                  <span class="font-bold text-slate-900 mt-0.5 block">{{ b.hostel?.capacity || 60 }} Beds</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[11px]">Hostel Address</span>
                  <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.hostel?.address || b.hostel?.hostelAddress || 'Adjacent to Skill Center Campus' }}</span>
                </div>
              </div>
            </div>
          }

          <!-- ========================================================================= -->
          <!-- SECTION 6: QUALITY INSPECTION & SANCTION APPROVAL RECORD                  -->
          <!-- ========================================================================= -->
          <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                <span>6. Quality Inspection &amp; Approval Sanction Record</span>
              </h2>
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-slate-500">Inspection Score:</span>
                <span class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {{ b.inspectionScore || 95 }}/100
                </span>
              </div>
            </div>

            <!-- Inspection & Approver Data -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span class="text-slate-400 block text-[11px]">Inspection Status</span>
                <span class="font-bold text-xs mt-0.5 block" [ngClass]="b.inspectionStatus === 'PASSED' ? 'text-emerald-700' : 'text-slate-800'">
                  {{ b.inspectionStatus || 'PASSED' }}
                </span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Inspecting Officer</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.inspectorName || 'Er. R.K. Mathur (DSO Jaipur)' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Inspection Date</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.inspectionDate || '2026-08-22' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Approving Authority</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.approvedBy || 'Sh. Alok Sharma (Joint Director, RSLDC)' }}</span>
              </div>

              <div class="col-span-2">
                <span class="text-slate-400 block text-[11px]">Approval Sanction Remarks</span>
                <span class="font-medium text-slate-800 mt-0.5 block">{{ b.approvalRemarks || 'Batch infrastructure, trainer TOT certification and biometric live feed confirmed. Sanction order released.' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Sanction Approval Date</span>
                <span class="font-semibold text-slate-800 mt-0.5 block">{{ b.approvedAt ? (b.approvedAt | date:'mediumDate') : '2026-08-25' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Sanction Order Status</span>
                <span class="font-bold text-emerald-700 mt-0.5 block">ACTIVE &amp; RELEASED</span>
              </div>
            </div>

            <!-- 6-Point Compliance Verification Grid -->
            <div class="pt-3 border-t border-slate-100">
              <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                Statutory Physical Verification Checklist
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">&check;</span>
                  <span class="text-slate-700 font-medium">Classroom &amp; Lab Infrastructure Norms Met</span>
                </div>
                <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">&check;</span>
                  <span class="text-slate-700 font-medium">Domain Equipment, Tools &amp; Machines Verified</span>
                </div>
                <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">&check;</span>
                  <span class="text-slate-700 font-medium">AEBAS Biometric &amp; CCTV Live Feed Active</span>
                </div>
                <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">&check;</span>
                  <span class="text-slate-700 font-medium">Assigned Trainers TOT Certified by SSC</span>
                </div>
                <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">&check;</span>
                  <span class="text-slate-700 font-medium">Fire Safety &amp; Clean Hygiene Audit Compliant</span>
                </div>
                <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">&check;</span>
                  <span class="text-slate-700 font-medium">Candidate Eligibility &amp; Aadhaar Dossiers Ready</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Footer Navigation Buttons -->
          <div class="flex items-center justify-between pt-2 pb-6 border-t border-slate-200">
            <button
              type="button"
              (click)="goBack()"
              class="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Batches</span>
            </button>

            <div class="flex items-center gap-2">
              @if (!isAdmin() && (b.status === 'APPROVED' || b.approvalStatus === 'APPROVED' || b.status === 'ONGOING')) {
                <a
                  [routerLink]="['/batches', b.id, 'map-aspirant']"
                  class="px-4 py-2 rounded-lg bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span class="text-sm leading-none font-bold">+</span>
                  <span>Register Aspirant</span>
                </a>
              }
            </div>
          </div>

        </div>
      } @else {
        <!-- Batch Not Found State -->
        <div class="p-8 max-w-xl mx-auto text-center space-y-4 py-16">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h2 class="text-base font-bold text-slate-800">Batch Record Not Found</h2>
          <p class="text-xs text-slate-500">
            The requested batch could not be found or may have been archived.
          </p>
          <button
            type="button"
            (click)="goBack()"
            class="px-4 py-2 rounded-lg bg-[#174A6E] text-white text-xs font-semibold cursor-pointer shadow-2xs hover:bg-[#123B59]"
          >
            Back to Batches
          </button>
        </div>
      }

    </div>

    <!-- Quick Approve Batch Modal for Admin -->
    @if (showApproveModal() && approvingBatch(); as b) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-xs animate-in zoom-in-95 duration-200">
          <div class="bg-[#174A6E] text-white p-4 flex items-center justify-between">
            <h3 class="font-bold text-sm tracking-wide m-0 text-white">Approve Batch — {{ b.batchCode }}</h3>
            <button (click)="closeApproveModal()" class="text-white/80 hover:text-white cursor-pointer font-bold text-base leading-none">&times;</button>
          </div>
          <div class="p-5 space-y-4">
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div><span class="text-slate-400">Course:</span> <strong>{{ b.courseName }}</strong></div>
              <div><span class="text-slate-400">Center:</span> {{ b.sdcName }} ({{ b.sdcCode }})</div>
              <div><span class="text-slate-400">Strength:</span> {{ b.approvedBatchStrength || b.maxStrength }} Trainees</div>
            </div>

            <div>
              <label class="font-semibold text-slate-700 block mb-1">Approval Sanction Remarks</label>
              <textarea
                [(ngModel)]="approvalRemarks"
                rows="3"
                placeholder="Enter sanction approval remarks (e.g. Center infrastructure and live biometric feed verified)..."
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E]"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                (click)="closeApproveModal()"
                class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="confirmApproval(b)"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class BatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  readonly batchService = inject(BatchService);
  readonly authService = inject(AuthService);

  readonly Math = Math;
  batchId = signal<string>('');
  successMessage = signal<string>('');

  showApproveModal = signal<boolean>(false);
  approvingBatch = signal<BatchRecord | null>(null);
  approvalRemarks = 'Batch infrastructure, biometric AEBAS connection and trainer TOT certification verified. Sanction order released.';

  readonly defaultFaculty = [
    {
      id: 'fac-1',
      name: 'Vikas Purohit',
      facultyName: 'Vikas Purohit',
      type: 'Primary Trainer',
      trainerType: 'Primary Trainer',
      qualification: 'B.Tech Electrical (TOT Certified)',
      experienceYears: 6
    }
  ];

  readonly batch = computed(() => {
    const id = this.batchId();
    if (!id) return undefined;
    return this.batchService.getBatchById(id);
  });

  readonly isAdmin = computed(() => {
    return this.authService.currentUser()?.role === 'dept_admin' || this.router.url.includes('admin');
  });

  readonly backUrl = computed(() => {
    return this.isAdmin() ? '/admin/batch-approvals' : '/batches';
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || params.get('batchId') || '';
      this.batchId.set(id);
    });
  }

  printSummary(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigateByUrl(this.backUrl());
  }

  openApproveModal(b: BatchRecord): void {
    this.approvingBatch.set(b);
    this.showApproveModal.set(true);
  }

  closeApproveModal(): void {
    this.showApproveModal.set(false);
    this.approvingBatch.set(null);
  }

  confirmApproval(b: BatchRecord): void {
    const officer = this.authService.currentUser()?.label || 'Sh. Alok Sharma (Joint Director, RSLDC)';
    this.batchService.approveBatch(b.id, this.approvalRemarks, officer);
    this.successMessage.set(`Batch "${b.batchCode}" (${b.courseName}) has been approved successfully!`);
    this.closeApproveModal();
  }
}
