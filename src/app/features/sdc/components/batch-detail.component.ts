import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { BatchRecord, BatchFaculty, BatchHostel } from '../models/batch.model';
import { AuthService } from '../../../core/auth/auth.service';
import { PageHeaderComponent } from '../../../shared/components';
import { SECTOR_COURSES_MAP, getCoursesForSector } from '../config/courses-catalog.data';

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
          
          <!-- Top Page Header (Matching SDC Detail Top Bar) -->
          <app-page-header
            [title]="b.sdcName + ' (' + b.sdcCode + ')'"
            bgColor="var(--color-primary, #174A6E)"
            [showBack]="true"
            [backUrl]="backUrl()"
            [backTitle]="isAdmin() ? 'Back to Approvals' : 'Back to Batches'"
          >
            <div class="flex items-center gap-2">
              @if (!isEditing()) {
                <button
                  type="button"
                  (click)="startEditing(b)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-white/20 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Edit Batch Creation Details"
                >
                  <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Details</span>
                </button>
              }

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
          <!-- HERO OVERVIEW STRIP: Training Partner + Batch Identity in ISMS Theme       -->
          <!-- ========================================================================= -->
          <div class="rounded-xl border border-[#D9E1E7] bg-[#EAF2F6]/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            
            <!-- Left: Training Partner & Batch / SDC Context -->
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded bg-[#174A6E] text-white text-[10.5px] font-bold uppercase tracking-wider">
                  TRAINING PARTNER
                </span>
                <span class="font-mono text-xs font-semibold text-slate-600">
                  {{ b.nipaNo || ('BATCH/' + b.batchCode) }}
                </span>
              </div>
              <div class="text-base sm:text-lg font-bold text-slate-900">
                {{ b.tpName || 'ARNOLD SAMARTH' }}
              </div>
              <div class="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                <span>Center: <strong class="text-slate-800">{{ b.sdcName }}</strong></span>
                <span>•</span>
                <span class="font-mono font-medium text-[#174A6E]">{{ b.sdcCode }}</span>
                <span>•</span>
                <span>Scheme: <strong class="text-slate-800">{{ b.scheme }}</strong></span>
                <span>•</span>
                <span>Batch: <strong class="font-mono text-slate-800">{{ b.batchCode }}</strong></span>
              </div>
            </div>

            <!-- Right: Target Capacity & Current Status Badges -->
            <div class="flex items-center gap-4 sm:gap-6">
              
              <!-- Target Capacity -->
              <div class="text-right">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">TARGET CAPACITY</span>
                <span class="font-bold text-slate-900 text-sm">
                  {{ b.approvedBatchStrength || b.maxStrength || 30 }} Trainees
                </span>
              </div>

              <!-- Current Status (Bold Black Uppercase Text matching SDC Detail) -->
              <div class="text-right border-l border-[#D9E1E7] pl-4 sm:pl-6">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">CURRENT STATUS</span>
                <span class="font-bold text-sm tracking-wide uppercase text-black" style="color: #000000 !important; font-weight: bold;">
                  {{ formatStatus(b.approvalStatus || b.status).toUpperCase() }}
                </span>
              </div>

            </div>

          </div>

          <!-- ========================================================================= -->
          <!-- ADMIN SCRUTINY & APPROVAL DECISION PANEL (When role is Admin)              -->
          <!-- ========================================================================= -->
          @if (isAdmin() && !isEditing()) {
            
            @if (b.status === 'APPROVED' || b.approvalStatus === 'APPROVED') {
              <!-- Approved Notice Card -->
              <div class="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-emerald-900 text-sm">Batch Approved by Department</h4>
                    <p class="text-emerald-800 text-xs mt-0.5">
                      {{ b.approvalRemarks || 'Batch infrastructure and parameters verified. Commencement of training and attendance capture permitted.' }}
                    </p>
                    <div class="text-[11px] text-emerald-700 mt-1 flex items-center gap-3 flex-wrap">
                      <span>Approved Target Capacity: <strong>{{ b.approvedBatchStrength || b.maxStrength || 30 }} Trainees</strong></span>
                      <span>•</span>
                      <span>Approved Date: <strong>{{ b.approvedAt ? (b.approvedAt | date:'mediumDate') : '2026-09-20' }}</strong></span>
                      <span>•</span>
                      <span>Authority: <strong>{{ b.approvedBy || 'Department Scrutiny Officer' }}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            } @else {
              <!-- Actionable Scrutiny & Approval Box -->
              <div class="rounded-xl border border-[#174A6E]/30 bg-white shadow-xs overflow-hidden">
                
                <!-- Decision Header -->
                <div class="bg-[#174A6E] text-white px-5 py-3 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span class="font-bold text-xs uppercase tracking-wider">Department Scrutiny & Approval Decision</span>
                  </div>
                  <span class="text-[11px] text-white/80 font-mono">Batch: {{ b.batchCode }}</span>
                </div>

                <!-- Approval Form Controls -->
                <div class="p-5 space-y-4 text-xs">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label class="block font-semibold text-slate-700 mb-1">
                        Sanctioned Target Capacity (Trainees) <span class="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        [(ngModel)]="adminTargetCapacity"
                        min="1"
                        max="5000"
                        class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A6E]"
                      />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block font-semibold text-slate-700 mb-1">
                        Approval / Department Remarks <span class="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="adminRemarks"
                        class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#174A6E]"
                        placeholder="Enter official remarks..."
                      />
                    </div>
                  </div>

                  <!-- Decision Actions -->
                  <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 flex-wrap">
                    <button
                      type="button"
                      (click)="rejectBatch(b)"
                      class="px-3.5 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Reject Batch
                    </button>

                    <button
                      type="button"
                      (click)="approveBatch(b)"
                      class="px-5 py-2 rounded-lg bg-[#174A6E] hover:bg-[#123B59] active:bg-[#0E2D44] text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <svg class="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Approve Batch</span>
                    </button>
                  </div>

                </div>

              </div>
            }

          }

          <!-- ========================================================================= -->
          <!-- VIEW MODE: Complete Batch Creation Details in exact layout of SDC View    -->
          <!-- ========================================================================= -->
          @if (!isEditing()) {
            
            <!-- Card 1: Registered Batch Parameters & Schedule -->
            <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-6">
              
              <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 m-0">
                  <span class="w-2 h-2 rounded-full bg-[#174A6E]"></span>
                  <span>Registered Batch Parameters &amp; Schedule</span>
                </h3>
                <span class="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ PSD Payment: SUCCESS (₹{{ b.psdFee || 500 }})
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
                
                <!-- Sector (colSpan 2) -->
                <div class="sm:col-span-2">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Sector</span>
                  <span class="font-bold text-slate-900 text-[13px] mt-0.5 block">{{ b.sector || 'Aerospace and Aviation' }}</span>
                </div>

                <!-- Course Name (colSpan 2) -->
                <div class="sm:col-span-2">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Course</span>
                  <span class="font-bold text-slate-900 text-[13px] mt-0.5 block">{{ b.courseName || b.course || 'Domestic Data Entry Operator' }}</span>
                </div>

                <!-- Batch Duration -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Batch Duration In HRS.</span>
                  <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ b.batchDurationHours || b.totalHours || 400 }} hrs</span>
                </div>

                <!-- Batch Start Date -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Batch Start Date</span>
                  <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ b.startDate || b.batchStartDate || '2026-10-01' }}</span>
                </div>

                <!-- Batch End Date -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Batch End Date</span>
                  <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ b.endDate || b.batchEndDate || '2026-12-31' }}</span>
                </div>

                <!-- Batch Start Time -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Batch Start Time</span>
                  <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ b.startTime || b.batchStartTime || '09:00 AM' }}</span>
                </div>

                <!-- Batch End Time -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Batch End Time</span>
                  <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ b.endTime || b.batchEndTime || '05:00 PM' }}</span>
                </div>

                <!-- Approved Batch Strength -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Approved Batch Strength</span>
                  <span class="font-bold text-slate-900 text-[13px] mt-0.5 block">{{ b.approvedBatchStrength || b.maxStrength || 30 }} Aspirants</span>
                </div>

                <!-- Remarks (colSpan 2) -->
                <div class="sm:col-span-2">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Remarks</span>
                  <span class="font-medium text-slate-700 text-[13px] mt-0.5 block italic">{{ b.remarks || 'Standard batch guidelines and training prerequisites compliant.' }}</span>
                </div>

              </div>

            </div>

            <!-- Card 2: Faculty Details Table -->
            <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-4">
              <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 m-0">
                  <span class="w-2 h-2 rounded-full bg-[#174A6E]"></span>
                  <span>Faculty Details</span>
                </h3>
                <span class="text-xs text-slate-500 font-medium">
                  {{ getFacultyList(b).length }} Trainer{{ getFacultyList(b).length > 1 ? 's' : '' }} Assigned
                </span>
              </div>

              <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      <th class="py-2.5 px-3 w-12 text-center">#</th>
                      <th class="py-2.5 px-3 min-w-[200px]">Faculty Name</th>
                      <th class="py-2.5 px-3 min-w-[180px]">Trainer Type</th>
                      <th class="py-2.5 px-3 min-w-[240px]">Qualification / Experience</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (fac of getFacultyList(b); track $index; let i = $index) {
                      <tr class="hover:bg-slate-50/60 transition-colors">
                        <td class="py-2.5 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                        <td class="py-2.5 px-3 font-semibold text-slate-900">
                          {{ fac.facultyName || fac.name || 'Vikas Purohit' }}
                        </td>
                        <td class="py-2.5 px-3">
                          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {{ fac.trainerType || fac.type || 'Primary Trainer' }}
                          </span>
                        </td>
                        <td class="py-2.5 px-3 text-slate-700">
                          {{ fac.qualification || 'Graduate (B.A / B.Sc / B.Com / B.Tech)' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Card 3: Hostel Details Table (if residential / hostels configured) -->
            @if (getHostelList(b).length > 0) {
              <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-4">
                <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 m-0">
                    <span class="w-2 h-2 rounded-full bg-[#174A6E]"></span>
                    <span>Hostel Details</span>
                  </h3>
                  <span class="text-xs text-slate-500 font-medium">Residential Facility Configuration</span>
                </div>

                <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                        <th class="py-2.5 px-3 w-12 text-center">#</th>
                        <th class="py-2.5 px-3 min-w-[260px]">Hostel Address</th>
                        <th class="py-2.5 px-3 min-w-[140px]">Hostel Code</th>
                        <th class="py-2.5 px-3 min-w-[140px]">Type</th>
                        <th class="py-2.5 px-3 w-28 text-center">Capacity</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (hostel of getHostelList(b); track $index; let i = $index) {
                        <tr class="hover:bg-slate-50/60 transition-colors">
                          <td class="py-2.5 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                          <td class="py-2.5 px-3 font-medium text-slate-800">
                            {{ hostel.hostelAddress || hostel.address || 'Plot / Campus Address' }}
                          </td>
                          <td class="py-2.5 px-3 font-mono font-bold text-slate-700">
                            {{ hostel.hostelCode || hostel.code || 'HST-JP-001' }}
                          </td>
                          <td class="py-2.5 px-3">
                            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {{ hostel.type || hostel.hostelType || 'Boys' }}
                            </span>
                          </td>
                          <td class="py-2.5 px-3 text-center font-semibold text-slate-900">
                            {{ hostel.capacity || 0 }} Beds
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

          }

          <!-- ========================================================================= -->
          <!-- EDIT MODE: Edit Batch Creation Details directly on the page               -->
          <!-- ========================================================================= -->
          @if (isEditing()) {
            <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-6 animate-in fade-in duration-150">
              
              <div class="border-b border-slate-100 pb-2 flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-bold text-slate-800 m-0">Edit Batch Information</h3>
                  <p class="text-xs text-slate-500 m-0 mt-0.5">Update batch schedule, faculty assignments, hostel configurations, and remarks.</p>
                </div>
                <span class="font-mono text-xs font-bold text-[#174A6E] bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                  {{ editModel.batchCode }}
                </span>
              </div>

              <!-- 4-Column Form Grid matching Batch creation form -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                <!-- Row 1: Sector (colSpan 2) + Course (colSpan 2) -->
                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">
                    Sector <span class="text-rose-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="editModel.sector"
                    (ngModelChange)="onSectorChange($event)"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  >
                    @for (sec of sectorList; track sec) {
                      <option [value]="sec">{{ sec }}</option>
                    }
                  </select>
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">
                    Course <span class="text-rose-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="editModel.courseName"
                    (ngModelChange)="onCourseChange($event)"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  >
                    @for (c of availableCourses; track c.courseName) {
                      <option [value]="c.courseName">{{ c.courseName }}</option>
                    }
                  </select>
                </div>

                <!-- Row 2: Duration, Start Date, End Date, Start Time -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Batch Duration In HRS. <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    [(ngModel)]="editModel.batchDurationHours"
                    min="10"
                    max="2000"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                    placeholder="e.g. 400"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Batch Start Date <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="editModel.startDate"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Batch End Date
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="editModel.endDate"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Batch Start Time <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="editModel.startTime"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                    placeholder="09:00 AM"
                  />
                </div>

                <!-- Row 3: End Time, Approved Batch Strength, Remarks -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Batch End Time <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="editModel.endTime"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                    placeholder="05:00 PM"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Approved Batch Strength <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    [(ngModel)]="editModel.approvedBatchStrength"
                    min="1"
                    max="500"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">Remarks</label>
                  <input
                    type="text"
                    [(ngModel)]="editModel.remarks"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                    placeholder="Enter batch remarks or prerequisites..."
                  />
                </div>

              </div>

              <!-- Faculty Details Editable Table -->
              <div class="space-y-2.5 pt-3 border-t border-slate-200">
                <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <label class="block font-semibold text-slate-800 text-xs uppercase tracking-wider m-0">
                    Faculty Details ({{ editModel.faculty?.length || 0 }} Trainers)
                  </label>
                  <button
                    type="button"
                    (click)="addFacultyRow()"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <span>+ Add Faculty</span>
                  </button>
                </div>

                <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                        <th class="py-2 px-3 w-12 text-center">#</th>
                        <th class="py-2 px-3 min-w-[200px]">Faculty Name <span class="text-rose-500">*</span></th>
                        <th class="py-2 px-3 min-w-[180px]">Trainer Type <span class="text-rose-500">*</span></th>
                        <th class="py-2 px-3 min-w-[220px]">Qualification / Experience <span class="text-rose-500">*</span></th>
                        <th class="py-2 px-3 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (fac of editModel.faculty; track $index; let i = $index) {
                        <tr class="hover:bg-slate-50/60 transition-colors">
                          <td class="py-2 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                          <td class="py-2 px-3">
                            <input
                              type="text"
                              [(ngModel)]="fac.facultyName"
                              placeholder="Faculty Name"
                              class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E]"
                            />
                          </td>
                          <td class="py-2 px-3">
                            <select
                              [(ngModel)]="fac.trainerType"
                              class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E]"
                            >
                              <option value="Primary Trainer">Primary Trainer</option>
                              <option value="Assistant Trainer">Assistant Trainer</option>
                              <option value="Domain Trainer">Domain Trainer</option>
                              <option value="Master Trainer">Master Trainer</option>
                            </select>
                          </td>
                          <td class="py-2 px-3">
                            <select
                              [(ngModel)]="fac.qualification"
                              class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E]"
                            >
                              <option value="Graduate (B.A / B.Sc / B.Com / B.Tech)">Graduate (B.A / B.Sc / B.Com / B.Tech)</option>
                              <option value="Post Graduate (M.A / M.Sc / M.Tech)">Post Graduate (M.A / M.Sc / M.Tech)</option>
                              <option value="PhD">PhD</option>
                            </select>
                          </td>
                          <td class="py-2 px-3 text-center">
                            <button
                              type="button"
                              (click)="removeFacultyRow(i)"
                              [disabled]="editModel.faculty.length <= 1"
                              class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Remove Trainer"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Hostel Details Editable Table -->
              <div class="space-y-2.5 pt-3 border-t border-slate-200">
                <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <label class="block font-semibold text-slate-800 text-xs uppercase tracking-wider m-0">
                    Hostel Details (Residential facility configuration)
                  </label>
                  <button
                    type="button"
                    (click)="addHostelRow()"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <span>+ Add Hostel</span>
                  </button>
                </div>

                <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                        <th class="py-2 px-3 w-12 text-center">#</th>
                        <th class="py-2 px-3 min-w-[260px]">Hostel Address</th>
                        <th class="py-2 px-3 min-w-[140px]">Hostel Code</th>
                        <th class="py-2 px-3 min-w-[140px]">Type</th>
                        <th class="py-2 px-3 w-28">Capacity</th>
                        <th class="py-2 px-3 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (hostel of editModel.hostels; track $index; let i = $index) {
                        <tr class="hover:bg-slate-50/60 transition-colors">
                          <td class="py-2 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                          <td class="py-2 px-3">
                            <input
                              type="text"
                              [(ngModel)]="hostel.hostelAddress"
                              placeholder="Plot / Campus Address"
                              class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E]"
                            />
                          </td>
                          <td class="py-2 px-3">
                            <input
                              type="text"
                              [(ngModel)]="hostel.hostelCode"
                              placeholder="HST-JP-001"
                              class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E]"
                            />
                          </td>
                          <td class="py-2 px-3">
                            <select
                              [(ngModel)]="hostel.type"
                              class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E]"
                            >
                              <option value="Boys">Boys</option>
                              <option value="Girls">Girls</option>
                              <option value="Co-ed">Co-ed</option>
                              <option value="Not Applicable">Not Applicable</option>
                            </select>
                          </td>
                          <td class="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              max="500"
                              [(ngModel)]="hostel.capacity"
                              class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E]"
                            />
                          </td>
                          <td class="py-2 px-3 text-center">
                            <button
                              type="button"
                              (click)="removeHostelRow(i)"
                              class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Remove Hostel"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Form Action Buttons (Save / Cancel) -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  (click)="cancelEditing()"
                  class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="saveChanges()"
                  class="px-5 py-2 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Save Changes
                </button>
              </div>

            </div>
          }

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
  `
})
export class BatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly batchService = inject(BatchService);
  readonly authService = inject(AuthService);

  batchId = signal<string>('');
  successMessage = signal<string>('');
  isEditing = signal<boolean>(false);

  /** Scrutiny / Approval state for Dept Admin */
  adminTargetCapacity = 30;
  adminRemarks = 'Approved in accordance with RSLDC guidelines and verified infrastructure.';

  /** Edit Form Model */
  editModel: any = {};
  availableCourses: { courseName: string; defaultDurationHours: number }[] = [];

  readonly sectorList = Object.keys(SECTOR_COURSES_MAP).sort();

  readonly defaultFaculty = [
    {
      id: 'fac-1',
      name: 'Vikas Purohit',
      facultyName: 'Vikas Purohit',
      type: 'Primary Trainer',
      trainerType: 'Primary Trainer',
      qualification: 'Graduate (B.A / B.Sc / B.Com / B.Tech)'
    }
  ];

  readonly defaultHostels = [
    {
      id: 'hostel-1',
      hostelAddress: 'Plot / Campus Address',
      address: 'Plot / Campus Address',
      hostelCode: 'HST-JP-001',
      code: 'HST-JP-001',
      type: 'Boys',
      hostelType: 'Boys',
      capacity: 0
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
      const b = this.batchService.getBatchById(id);
      if (b) {
        this.adminTargetCapacity = b.approvedBatchStrength || b.maxStrength || 30;
      }
    });
  }

  formatStatus(status?: string): string {
    if (!status) return 'APPROVED';
    if (status === 'ONGOING') return 'APPROVED';
    if (status === 'PENDING_APPROVAL' || status === 'INSPECTION_PENDING') return 'PENDING';
    return status;
  }

  getFacultyList(b: BatchRecord): any[] {
    if (b.faculty && b.faculty.length > 0) {
      return b.faculty;
    }
    return this.defaultFaculty;
  }

  getHostelList(b: BatchRecord): any[] {
    if (b.hostels && b.hostels.length > 0) {
      return b.hostels;
    }
    if (b.hostel) {
      return [b.hostel];
    }
    return this.defaultHostels;
  }

  startEditing(b: BatchRecord): void {
    const faculty = this.getFacultyList(b).map((f, idx) => ({
      id: f.id || `fac-${idx}`,
      facultyName: f.facultyName || f.name || '',
      trainerType: f.trainerType || f.type || 'Primary Trainer',
      qualification: f.qualification || 'Graduate (B.A / B.Sc / B.Com / B.Tech)'
    }));

    const hostels = this.getHostelList(b).map((h, idx) => ({
      id: h.id || `hostel-${idx}`,
      hostelAddress: h.hostelAddress || h.address || '',
      hostelCode: h.hostelCode || h.code || '',
      type: h.type || h.hostelType || 'Boys',
      capacity: h.capacity ?? 0
    }));

    const currentSector = b.sector || 'Aerospace and Aviation';
    this.availableCourses = getCoursesForSector(currentSector);

    this.editModel = {
      id: b.id,
      batchCode: b.batchCode,
      sector: currentSector,
      courseName: b.courseName || b.course || (this.availableCourses[0]?.courseName || ''),
      batchDurationHours: b.batchDurationHours || b.totalHours || 400,
      startDate: b.startDate || b.batchStartDate || '2026-10-01',
      endDate: b.endDate || b.batchEndDate || '2026-12-31',
      startTime: b.startTime || b.batchStartTime || '09:00 AM',
      endTime: b.endTime || b.batchEndTime || '05:00 PM',
      approvedBatchStrength: b.approvedBatchStrength || b.maxStrength || 30,
      remarks: b.remarks || '',
      faculty: faculty.length > 0 ? faculty : [{ ...this.defaultFaculty[0] }],
      hostels: hostels.length > 0 ? hostels : [{ ...this.defaultHostels[0] }]
    };

    this.isEditing.set(true);
  }

  onSectorChange(sector: string): void {
    this.availableCourses = getCoursesForSector(sector);
    if (this.availableCourses.length > 0) {
      this.editModel.courseName = this.availableCourses[0].courseName;
      this.editModel.batchDurationHours = this.availableCourses[0].defaultDurationHours;
    }
  }

  onCourseChange(courseName: string): void {
    const found = this.availableCourses.find(c => c.courseName === courseName);
    if (found) {
      this.editModel.batchDurationHours = found.defaultDurationHours;
    }
  }

  addFacultyRow(): void {
    if (!this.editModel.faculty) this.editModel.faculty = [];
    this.editModel.faculty.push({
      id: `fac-${Date.now()}`,
      facultyName: '',
      trainerType: 'Primary Trainer',
      qualification: 'Graduate (B.A / B.Sc / B.Com / B.Tech)'
    });
  }

  removeFacultyRow(index: number): void {
    if (this.editModel.faculty.length > 1) {
      this.editModel.faculty.splice(index, 1);
    }
  }

  addHostelRow(): void {
    if (!this.editModel.hostels) this.editModel.hostels = [];
    this.editModel.hostels.push({
      id: `hostel-${Date.now()}`,
      hostelAddress: '',
      hostelCode: '',
      type: 'Boys',
      capacity: 0
    });
  }

  removeHostelRow(index: number): void {
    this.editModel.hostels.splice(index, 1);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  saveChanges(): void {
    const id = this.editModel.id || this.batchId();
    if (!id) return;

    const updates: Partial<BatchRecord> = {
      sector: this.editModel.sector,
      courseName: this.editModel.courseName,
      course: this.editModel.courseName,
      batchDurationHours: Number(this.editModel.batchDurationHours) || 400,
      totalHours: Number(this.editModel.batchDurationHours) || 400,
      startDate: this.editModel.startDate,
      batchStartDate: this.editModel.startDate,
      endDate: this.editModel.endDate,
      batchEndDate: this.editModel.endDate,
      startTime: this.editModel.startTime,
      batchStartTime: this.editModel.startTime,
      endTime: this.editModel.endTime,
      batchEndTime: this.editModel.endTime,
      approvedBatchStrength: Number(this.editModel.approvedBatchStrength) || 30,
      maxStrength: Number(this.editModel.approvedBatchStrength) || 30,
      remarks: this.editModel.remarks,
      faculty: this.editModel.faculty.map((f: any) => ({
        id: f.id,
        name: f.facultyName,
        facultyName: f.facultyName,
        type: f.trainerType,
        trainerType: f.trainerType,
        qualification: f.qualification
      })),
      hostels: this.editModel.hostels.map((h: any) => ({
        id: h.id,
        address: h.hostelAddress,
        hostelAddress: h.hostelAddress,
        code: h.hostelCode,
        hostelCode: h.hostelCode,
        type: h.type,
        hostelType: h.type,
        capacity: Number(h.capacity) || 0
      }))
    };

    this.batchService.updateBatch(id, updates);
    this.successMessage.set(`Batch "${this.editModel.batchCode}" details updated successfully.`);
    this.isEditing.set(false);
  }

  approveBatch(b: BatchRecord): void {
    const officer = this.authService.currentUser()?.label || 'Department Scrutiny Officer';
    this.batchService.approveBatch(b.id, this.adminRemarks, officer);
    this.batchService.updateBatch(b.id, {
      approvedBatchStrength: this.adminTargetCapacity,
      maxStrength: this.adminTargetCapacity
    });
    this.successMessage.set(`Batch "${b.batchCode}" has been approved successfully with capacity ${this.adminTargetCapacity} trainees.`);
  }

  rejectBatch(b: BatchRecord): void {
    this.batchService.rejectBatch(b.id, this.adminRemarks || 'Rejected during department scrutiny.');
    this.successMessage.set(`Batch "${b.batchCode}" has been rejected.`);
  }

  printSummary(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigateByUrl(this.backUrl());
  }
}
