import { Component, Input, Output, EventEmitter, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SdcFormData,
  SDC_SCHEME_OPTIONS,
  RAJASTHAN_DISTRICTS,
  SCHEME_COURSE_CATALOG,
  SdcCourseCatalogItem,
  AllocatedCourse
} from '../models/sdc.model';

@Component({
  selector: 'app-sdc-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 font-sans" style="font-family: 'Inter', sans-serif;">

      <!-- ====================================================================
           STEP 1: ORGANIZATION DETAILS (Matching Screenshot 2)
           ==================================================================== -->
      @if (activeStep === 1) {
        <div class="border border-slate-200/90 rounded-xl p-5 sm:p-7 bg-white space-y-6 shadow-2xs animate-in fade-in duration-150">
          
          <!-- Card Header with Home/Building Icon -->
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Organization Details
            </h2>
          </div>

          <!-- Two-Column Form Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs">
            
            <!-- Scheme -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Scheme <span class="text-rose-500">*</span>
              </label>
              <select
                [(ngModel)]="data.step1.scheme"
                (ngModelChange)="onSchemeChange()"
                class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
              >
                <option value="" disabled>Select Scheme</option>
                @for (opt of schemeOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>

            <!-- SDC Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                SDC Name <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="data.step1.sdcName"
                placeholder="Jaipur Excellence Center"
                class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
              />
            </div>

            <!-- MoU Reference No. -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                MoU Reference No. <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="data.step1.mouRefNo"
                placeholder="MOU/2026/001"
                class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
              />
            </div>

            <!-- TP Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                TP Name <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="data.step1.tpName"
                placeholder="SkillMasters Rajasthan"
                class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
              />
            </div>

            <!-- SDC Code -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                SDC Code <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="data.step1.sdcCode"
                placeholder="SDC-001"
                class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
              />
            </div>

            <!-- Proposed Start Date -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Proposed Start Date <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  type="date"
                  [(ngModel)]="data.step1.proposedStartDate"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
                />
              </div>
            </div>

            <!-- Total Trained Aspirants -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Trained Aspirants
              </label>
              <input
                type="number"
                [(ngModel)]="data.step1.totalTrainedAspirants"
                placeholder="500"
                class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
              />
            </div>

            <!-- Total TP Placed Aspirants -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Total TP Placed Aspirants
              </label>
              <input
                type="number"
                [(ngModel)]="data.step1.totalPlacedAspirants"
                placeholder="400"
                class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
              />
            </div>

          </div>
        </div>
      }

      <!-- ====================================================================
           STEP 2: LOCATION & DETAILS (Matching Screenshot 3)
           ==================================================================== -->
      @if (activeStep === 2) {
        <div class="space-y-6 animate-in fade-in duration-150">
          
          <!-- Card 1: Location and Centre Details -->
          <div class="border border-slate-200/90 rounded-xl p-5 sm:p-7 bg-white space-y-5 shadow-2xs">
            <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Location and Centre Details
              </h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              <!-- State (Disabled, Rajasthan) -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">State <span class="text-rose-500">*</span></label>
                <select disabled class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed">
                  <option selected>Rajasthan</option>
                </select>
              </div>

              <!-- District -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">District <span class="text-rose-500">*</span></label>
                <select
                  [(ngModel)]="data.step2.district"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                >
                  @for (d of districts; track d) {
                    <option [value]="d">{{ d }}</option>
                  }
                </select>
              </div>

              <!-- Assembly Constituency -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Assembly Constituency</label>
                <input
                  type="text"
                  [(ngModel)]="data.step2.assemblyConstituency"
                  placeholder="Sanganer"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <!-- Parliament Constituency -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Parliament Constituency</label>
                <input
                  type="text"
                  [(ngModel)]="data.step2.parliamentConstituency"
                  placeholder="Jaipur Rural"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <!-- Division -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Division</label>
                <input
                  type="text"
                  [(ngModel)]="data.step2.division"
                  placeholder="Jaipur"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <!-- Block -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Block</label>
                <input
                  type="text"
                  [(ngModel)]="data.step2.block"
                  placeholder="Jaipur"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <!-- SDC Capacity -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">SDC Capacity <span class="text-rose-500">*</span></label>
                <input
                  type="number"
                  [(ngModel)]="data.step2.sdcCapacity"
                  placeholder="100"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Email <span class="text-rose-500">*</span></label>
                <input
                  type="email"
                  [(ngModel)]="data.step2.centerEmail"
                  placeholder="center@example.com"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <!-- Pincode -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Pincode <span class="text-rose-500">*</span></label>
                <input
                  type="text"
                  maxlength="6"
                  [(ngModel)]="data.step2.pincode"
                  placeholder="302029"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <!-- Full Address (Span 3) -->
              <div class="sm:col-span-3">
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Full Address <span class="text-rose-500">*</span></label>
                <textarea
                  rows="2"
                  [(ngModel)]="data.step2.fullAddress"
                  placeholder="Plot 42, Skill Industrial Area, Sanganer, Jaipur"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                ></textarea>
              </div>

              <!-- Remarks (Span 3) -->
              <div class="sm:col-span-3">
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Remarks</label>
                <textarea
                  rows="2"
                  [(ngModel)]="data.step2.remarks"
                  placeholder="Ready for auditor inspection"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                ></textarea>
              </div>

            </div>
          </div>

          <!-- Card 2: Center Geo-Location -->
          <div class="border border-slate-200/90 rounded-xl p-5 sm:p-7 bg-white space-y-4 shadow-2xs">
            <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  Center Geo-Location <span class="text-rose-500">*</span>
                </h2>
                <p class="text-[11px] text-slate-500 m-0">
                  Mandatory for Auditor Verification.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Latitude <span class="text-rose-500">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="data.step2.latitude"
                  placeholder="26.9124"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Longitude <span class="text-rose-500">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="data.step2.longitude"
                  placeholder="75.7873"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
            </div>
          </div>

        </div>
      }

      <!-- ====================================================================
           STEP 3: COURSES & DOCS (Matching Screenshot 4)
           ==================================================================== -->
      @if (activeStep === 3) {
        <div class="space-y-6 animate-in fade-in duration-150">
          
          <!-- Card 1: Section D: Courses Available -->
          <div class="border border-slate-200/90 rounded-xl p-5 sm:p-7 bg-white space-y-5 shadow-2xs">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    Section D: Courses Available
                  </h2>
                  <p class="text-[11px] text-slate-500 m-0">
                    Approved courses for scheme: <strong class="text-slate-800">{{ data.step1.scheme || 'SAMARTH' }}</strong>
                  </p>
                </div>
              </div>

              <!-- Available Count Badge -->
              <span class="px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                {{ availableCoursesCount() }} Course(s) Available
              </span>
            </div>

            <!-- Two-Column Sector & Course Selectors -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <!-- Sector Select -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Sector for {{ data.step1.scheme || 'SAMARTH' }} <span class="text-rose-500">*</span>
                </label>
                <select
                  [(ngModel)]="selectedSector"
                  (ngModelChange)="onSectorSelect()"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                >
                  <option value="" disabled>-- Choose Sector --</option>
                  @for (sec of availableSectors(); track sec) {
                    <option [value]="sec">{{ sec }}</option>
                  }
                </select>
                <p class="text-[11px] text-slate-400 mt-1">Select a sector under {{ data.step1.scheme || 'SAMARTH' }} scheme.</p>
              </div>

              <!-- Course Select -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Course for Sector <span class="text-rose-500">*</span>
                </label>
                <select
                  [(ngModel)]="selectedCourseQp"
                  (ngModelChange)="onCourseSelectAutoAdd()"
                  [disabled]="!selectedSector"
                  class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="" disabled>{{ selectedSector ? '-- Select Course --' : '-- Select Sector First --' }}</option>
                  @for (c of availableCoursesForSector(); track c.qpCode) {
                    <option [value]="c.qpCode">{{ c.courseName }}</option>
                  }
                </select>
                <p class="text-[11px] text-slate-400 mt-1">Select sector first to enable course selection.</p>
              </div>

            </div>

            <!-- Selected Approved Course List -->
            @if (data.step3.allocatedCourses.length > 0) {
              <div class="pt-2 space-y-2.5">
                <span class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Selected Approved Course(s) ({{ data.step3.allocatedCourses.length }}):
                </span>

                @for (c of data.step3.allocatedCourses; track c.qpCode; let idx = $index) {
                  <div class="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <!-- Checked Box Icon -->
                      <div class="w-6 h-6 rounded bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 text-slate-700 font-bold text-xs">
                        ✓
                      </div>

                      <div class="space-y-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <h4 class="text-sm font-bold text-slate-900 truncate">
                            {{ c.courseName }}
                          </h4>
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            NSQF {{ c.nsqfLevel }}
                          </span>
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {{ c.sector.toUpperCase() }}
                          </span>
                        </div>
                        <p class="text-xs text-slate-500 font-mono">
                          QP Code: <span class="font-bold text-slate-700">{{ c.qpCode }}</span> &bull; Duration: {{ c.durationHours }} Hrs
                        </p>
                      </div>
                    </div>

                    <!-- Remove Button -->
                    <button
                      type="button"
                      (click)="removeCourse(idx)"
                      class="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                    >
                      ✕ Remove
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Card 2: Section E: Documents -->
          <div class="border border-slate-200/90 rounded-xl p-5 sm:p-7 bg-white space-y-4 shadow-2xs">
            <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Section E: Documents
              </h2>
            </div>

            <!-- Dashed Dropzone -->
            <div class="border-2 border-dashed border-slate-200 rounded-2xl p-8 sm:p-10 text-center bg-white hover:bg-slate-50/50 transition-colors flex flex-col items-center justify-center space-y-3">
              <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>

              <div>
                <span class="text-sm font-bold text-slate-800 block">
                  Click to upload or drag &amp; drop
                </span>
                <span class="text-xs text-slate-500">
                  Rental Agreement, Fire NOC, Front Photo (PDF, JPG up to 10MB)
                </span>
              </div>

              <div>
                <input
                  type="file"
                  #fileInput
                  multiple
                  class="hidden"
                  (change)="onFilesSelected($event)"
                />
                <button
                  type="button"
                  (click)="fileInput.click()"
                  class="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
                >
                  Select Files
                </button>
              </div>

              <!-- Uploaded files status -->
              @if (uploadedFileList.length > 0) {
                <div class="w-full max-w-md pt-3 space-y-2 text-left">
                  @for (f of uploadedFileList; track f.name; let idx = $index) {
                    <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2 truncate">
                        <span class="text-emerald-600 font-bold">✓</span>
                        <span class="font-medium text-slate-800 truncate">{{ f.name }}</span>
                        <span class="text-[10px] text-slate-400">({{ f.size }})</span>
                      </div>
                      <button type="button" (click)="removeFile(idx)" class="text-slate-400 hover:text-rose-600 text-xs">✕</button>
                    </div>
                  }
                </div>
              }
            </div>

          </div>

        </div>
      }

      <!-- ====================================================================
           STEP 4: REVIEW & SUBMIT (Matching Screen      <!-- ====================================================================
           STEP 4: REVIEW & SUBMIT (All Details from Previous Steps)
           ==================================================================== -->
      @if (activeStep === 4) {
        <div class="space-y-6 animate-in fade-in duration-150">
          
          <!-- Card Header -->
          <div class="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                Review &amp; Submit
              </h2>
              <p class="text-[11px] text-slate-500 m-0">
                Verify all information from previous steps before submitting to the department.
              </p>
            </div>
          </div>

          <!-- Section 1 Review: Organization Details -->
          <div class="border border-slate-200/90 rounded-xl p-5 sm:p-6 bg-white space-y-4 shadow-2xs">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">
                  1. Organization Details
                </h3>
              </div>
              <button
                type="button"
                (click)="onEditStep(1)"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              >
                <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit Step 1</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Scheme</span>
                <span class="font-bold text-slate-900">{{ data.step1.scheme || 'SAMARTH' }} (State Fund)</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SDC Name</span>
                <span class="font-bold text-slate-900">{{ data.step1.sdcName || 'Jaipur Excellence Center' }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">MoU Reference No.</span>
                <span class="font-mono font-medium text-slate-800">{{ data.step1.mouRefNo || 'MOU/2026/001' }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">TP Name</span>
                <span class="font-bold text-slate-900">{{ data.step1.tpName || 'SkillMasters Rajasthan' }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SDC Code</span>
                <span class="font-mono font-bold text-[#0B3558]">{{ data.step1.sdcCode || 'SDC-001' }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Proposed Start Date</span>
                <span class="text-slate-800 font-medium">{{ data.step1.proposedStartDate || '10/01/2026' }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Trained Aspirants</span>
                <span class="text-slate-800 font-medium">{{ data.step1.totalTrainedAspirants ?? 500 }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total TP Placed</span>
                <span class="text-slate-800 font-medium">{{ data.step1.totalPlacedAspirants ?? 400 }}</span>
              </div>
            </div>
          </div>

          <!-- Section 2 Review: Location & Centre Details -->
          <div class="border border-slate-200/90 rounded-xl p-5 sm:p-6 bg-white space-y-4 shadow-2xs">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">
                  2. Location and Centre Details
                </h3>
              </div>
              <button
                type="button"
                (click)="onEditStep(2)"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              >
                <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit Step 2</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">State &amp; District</span>
                <span class="font-bold text-slate-900">{{ data.step2.state || 'Rajasthan' }} &bull; {{ data.step2.district || 'Jaipur' }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assembly Constituency</span>
                <span class="text-slate-800 font-medium">{{ data.step2.assemblyConstituency || 'Sanganer' }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Parliament Constituency</span>
                <span class="text-slate-800 font-medium">{{ data.step2.parliamentConstituency || 'Jaipur Rural' }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Division &amp; Block</span>
                <span class="text-slate-800 font-medium">{{ data.step2.division || 'Jaipur' }} / {{ data.step2.block || 'Jaipur' }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SDC Capacity</span>
                <span class="font-bold text-[#0B3558]">{{ data.step2.sdcCapacity || 100 }} Aspirants</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Center Email &amp; Pincode</span>
                <span class="text-slate-800 font-medium">{{ data.step2.centerEmail || 'center@example.com' }} ({{ data.step2.pincode || '302029' }})</span>
              </div>
              <div class="sm:col-span-2 lg:col-span-3 space-y-0.5 pt-1">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Full Physical Address</span>
                <span class="text-slate-800 font-medium leading-relaxed">{{ data.step2.fullAddress || 'Plot 42, Skill Industrial Area, Sanganer, Jaipur' }}</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">GPS Geo-Location</span>
                <span class="font-mono text-xs font-semibold text-slate-800">
                  Lat: {{ data.step2.latitude || '26.9124' }} &bull; Lng: {{ data.step2.longitude || '75.7873' }}
                </span>
              </div>
              <div class="sm:col-span-2 space-y-0.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Remarks</span>
                <span class="text-slate-600 italic">{{ data.step2.remarks || 'Ready for auditor inspection' }}</span>
              </div>
            </div>
          </div>

          <!-- Section 3 Review: Courses & Documents -->
          <div class="border border-slate-200/90 rounded-xl p-5 sm:p-6 bg-white space-y-4 shadow-2xs">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">
                  3. Courses &amp; Documents
                </h3>
              </div>
              <button
                type="button"
                (click)="onEditStep(3)"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              >
                <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit Step 3</span>
              </button>
            </div>

            <!-- Courses Allocated -->
            <div class="space-y-2">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Allocated Course(s) ({{ data.step3.allocatedCourses.length }}):
              </span>
              @if (data.step3.allocatedCourses.length > 0) {
                <div class="space-y-2">
                  @for (c of data.step3.allocatedCourses; track c.qpCode) {
                    <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2.5">
                        <span class="text-emerald-600 font-bold">✓</span>
                        <div>
                          <span class="font-bold text-slate-900">{{ c.courseName }}</span>
                          <span class="text-slate-400 ml-2 font-mono">({{ c.qpCode }})</span>
                          <div class="text-[11px] text-slate-500 mt-0.5">
                            Sector: <strong class="text-slate-700">{{ c.sector }}</strong> &bull; NSQF Level {{ c.nsqfLevel }} &bull; Duration: {{ c.durationHours }} Hrs
                          </div>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Approved
                      </span>
                    </div>
                  }
                </div>
              } @else {
                <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs italic">
                  No courses allocated yet. Click "Edit Step 3" to add courses.
                </div>
              }
            </div>

            <!-- Documents Uploaded -->
            <div class="pt-2 space-y-2 border-t border-slate-100">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Uploaded Supporting Documents ({{ uploadedFileList.length }}):
              </span>
              @if (uploadedFileList.length > 0) {
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  @for (doc of uploadedFileList; track doc.name) {
                    <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div class="flex items-center gap-2 truncate">
                        <svg class="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span class="font-medium text-slate-800 truncate">{{ doc.name }}</span>
                      </div>
                      <span class="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{{ doc.size }}</span>
                    </div>
                  }
                </div>
              } @else {
                <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs italic">
                  No documents uploaded yet.
                </div>
              }
            </div>

          </div>

          <!-- Yellow Declaration Box (Matching Screenshot 5) -->
          <div class="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div class="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Declaration</span>
            </div>
            <p class="text-xs text-amber-800 leading-relaxed">
              I certify that all information provided is accurate and verifiable. Submitting this form will send the application to the department for inspection.
            </p>
          </div>

        </div>
      }

    </div>
  `
})
export class SdcFormComponent implements OnInit {
  @Input({ required: true }) activeStep: number = 1;
  @Input({ required: true }) data!: SdcFormData;
  @Output() stepChange = new EventEmitter<number>();

  onEditStep(step: number): void {
    this.stepChange.emit(step);
  }

  readonly schemeOptions = SDC_SCHEME_OPTIONS;
  readonly districts = RAJASTHAN_DISTRICTS;

  selectedSector: string = '';
  selectedCourseQp: string = '';

  uploadedFileList: { name: string; size: string }[] = [
    { name: 'Rental_Agreement_Center.pdf', size: '2.8 MB' },
    { name: 'Fire_Safety_NOC_Certificate.pdf', size: '1.1 MB' },
    { name: 'Center_Front_Signboard.jpg', size: '3.6 MB' }
  ];

  ngOnInit(): void {
    // If allocatedCourses is empty, populate the default course from Screenshot 4
    if (this.data && this.data.step3 && this.data.step3.allocatedCourses.length === 0) {
      this.data.step3.allocatedCourses.push({
        sector: 'Green Energy',
        courseName: 'Solar Panel Installation Technician',
        qpCode: 'ELE/Q5901',
        nsqfLevel: 4,
        durationHours: 300
      });
    }
  }

  readonly availableSectors = computed(() => {
    const scheme = this.data?.step1?.scheme || 'SAMARTH';
    const courses = SCHEME_COURSE_CATALOG.filter(c => c.scheme === scheme);
    const sectors = Array.from(new Set(courses.map(c => c.sector)));
    return sectors.length > 0 ? sectors : ['Green Energy', 'IT & ITeS', 'Automotive', 'Apparel'];
  });

  readonly availableCoursesForSector = computed(() => {
    const scheme = this.data?.step1?.scheme || 'SAMARTH';
    const sector = this.selectedSector;
    return SCHEME_COURSE_CATALOG.filter(c => c.scheme === scheme && c.sector === sector);
  });

  readonly availableCoursesCount = computed(() => {
    const scheme = this.data?.step1?.scheme || 'SAMARTH';
    return SCHEME_COURSE_CATALOG.filter(c => c.scheme === scheme).length || 6;
  });

  onSchemeChange(): void {
    this.selectedSector = '';
    this.selectedCourseQp = '';
  }

  onSectorSelect(): void {
    this.selectedCourseQp = '';
  }

  onCourseSelectAutoAdd(): void {
    if (!this.selectedCourseQp) return;
    const course = this.availableCoursesForSector().find(c => c.qpCode === this.selectedCourseQp);
    if (!course) return;

    if (!this.data.step3.allocatedCourses.some(c => c.qpCode === course.qpCode)) {
      this.data.step3.allocatedCourses.push({
        sector: course.sector,
        courseName: course.courseName,
        qpCode: course.qpCode,
        nsqfLevel: course.nsqfLevel,
        durationHours: course.durationHours
      });
    }
  }

  removeCourse(index: number): void {
    this.data.step3.allocatedCourses.splice(index, 1);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.uploadedFileList.push({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        });
      }
    }
  }

  removeFile(index: number): void {
    this.uploadedFileList.splice(index, 1);
  }
}
