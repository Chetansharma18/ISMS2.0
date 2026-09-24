import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { SCHEME_COURSE_CATALOG, SDC_SCHEME_OPTIONS } from '../models/sdc.model';
import { CreateBatchDto } from '../models/batch.model';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-full bg-[#F8FAFC] py-6 sm:py-10 px-4 font-sans selection:bg-slate-900 selection:text-white" style="font-family: 'Inter', sans-serif;">
      
      <!-- Central Elevated Card (Matching Images 3 & 4) -->
      <div class="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
        
        <!-- Header with Back Button -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="goBack()"
              class="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-700 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Back"
            >
              <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight leading-snug m-0">
                Create New Batch
              </h1>
              <p class="text-xs text-slate-500 m-0">
                Configure training batch details, duration, capacity and trainer assignments.
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="goBack()"
            class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
        </div>

        <!-- Notification / Error Toast -->
        @if (errorMessage()) {
          <div class="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <span class="font-bold">Notice:</span>
              <span>{{ errorMessage() }}</span>
            </div>
            <button (click)="errorMessage.set('')" class="text-rose-500 hover:text-rose-800 cursor-pointer font-bold">✕</button>
          </div>
        }

        <form (ngSubmit)="submitBatch()" class="space-y-8">

          <!-- ================================================================
               SECTION 1: COURSE & SCHEME DETAILS (Image 3)
               ================================================================ -->
          <div class="border border-slate-200/90 rounded-xl p-5 sm:p-6 bg-white space-y-4 shadow-2xs">
            <h2 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight pb-2 border-b border-slate-100">
              Course &amp; Scheme Details
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              <!-- Scheme * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Scheme <span class="text-rose-500">*</span>
                </label>
                <select
                  [(ngModel)]="scheme"
                  name="scheme"
                  (ngModelChange)="onSchemeChange()"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                >
                  <option value="" disabled>Please select</option>
                  @for (s of schemeOptions; track s.value) {
                    <option [value]="s.value">{{ s.label }}</option>
                  }
                </select>
              </div>

              <!-- Sector * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sector <span class="text-rose-500">*</span>
                </label>
                <select
                  [(ngModel)]="sector"
                  name="sector"
                  (ngModelChange)="onSectorChange()"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                >
                  <option value="" disabled>Please select</option>
                  @for (sec of availableSectors(); track sec) {
                    <option [value]="sec">{{ sec }}</option>
                  }
                </select>
              </div>

              <!-- Course / Job Role * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Course / Job Role <span class="text-rose-500">*</span>
                </label>
                <select
                  [(ngModel)]="courseQp"
                  name="courseQp"
                  (ngModelChange)="onCourseChange()"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                >
                  <option value="" disabled>Please select</option>
                  @for (c of availableCourses(); track c.qpCode) {
                    <option [value]="c.qpCode">{{ c.courseName }}</option>
                  }
                </select>
              </div>

              <!-- Course Version * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Course Version <span class="text-rose-500">*</span>
                </label>
                <select
                  [(ngModel)]="courseVersion"
                  name="courseVersion"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                >
                  <option value="" disabled>Please select</option>
                  <option value="NSQF v2.0">NSQF v2.0</option>
                  <option value="NSQF v1.2">NSQF v1.2</option>
                  <option value="NSQF v1.0">NSQF v1.0</option>
                </select>
              </div>

            </div>
          </div>

          <!-- ================================================================
               SECTION 2: BATCH IDENTITY (Image 3)
               ================================================================ -->
          <div class="space-y-4">
            <h2 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Batch Identity
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              <!-- TP Name * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  TP Name <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="tpName"
                  name="tpName"
                  placeholder="Apex Skill Solutions Pvt Ltd"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <!-- SDC Code * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  SDC Code <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="sdcCode"
                  name="sdcCode"
                  placeholder="SDC-001"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <!-- Batch Code (Auto-generated) -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch Code (Auto-generated)
                </label>
                <input
                  type="text"
                  [value]="batchCode"
                  disabled
                  class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono font-medium cursor-not-allowed"
                />
              </div>

            </div>

            <!-- Residential Course Checkbox -->
            <div class="pt-1">
              <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  [(ngModel)]="residential"
                  name="residential"
                  class="w-4 h-4 rounded border-slate-300 text-[#0F172A] focus:ring-0 cursor-pointer"
                />
                <span>Residential Course</span>
              </label>
            </div>
          </div>

          <!-- ================================================================
               SECTION 3: BATCH STRENGTH & DETAILS (Image 3)
               ================================================================ -->
          <div class="space-y-4">
            <h2 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Batch Strength &amp; Details
            </h2>

            <!-- Row 1 -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch Minimum Strength <span class="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  [(ngModel)]="minStrength"
                  name="minStrength"
                  placeholder="15"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch Maximum Strength <span class="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  [(ngModel)]="maxStrength"
                  name="maxStrength"
                  placeholder="30"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  N IPA No
                </label>
                <input
                  type="text"
                  [(ngModel)]="nipaNo"
                  name="nipaNo"
                  placeholder=""
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
            </div>

            <!-- Row 2 -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  PSD Status
                </label>
                <input
                  type="text"
                  [(ngModel)]="psdStatus"
                  name="psdStatus"
                  placeholder="Active"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Status
                </label>
                <input
                  type="text"
                  [(ngModel)]="paymentStatus"
                  name="paymentStatus"
                  placeholder="Approved"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total No of Youth Trained
                </label>
                <input
                  type="number"
                  [(ngModel)]="totalYouthTrained"
                  name="totalYouthTrained"
                  placeholder=""
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
            </div>

            <!-- Row 3 -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total No of Youth Placed
                </label>
                <input
                  type="number"
                  [(ngModel)]="totalYouthPlaced"
                  name="totalYouthPlaced"
                  placeholder=""
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
            </div>
          </div>

          <!-- ================================================================
               SECTION 4: DATES & TIMINGS (Image 3 & 4)
               ================================================================ -->
          <div class="space-y-4">
            <h2 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Dates &amp; Timings
            </h2>

            <!-- Row 1 -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch Duration (Hrs)
                </label>
                <input
                  type="number"
                  [(ngModel)]="durationHours"
                  name="durationHours"
                  placeholder="300"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch Start Date <span class="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="startDate"
                  name="startDate"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch Freeze Date
                </label>
                <input
                  type="date"
                  [(ngModel)]="freezeDate"
                  name="freezeDate"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
            </div>

            <!-- Row 2 -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch End Date <span class="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="endDate"
                  name="endDate"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch Start Time <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="startTime"
                    name="startTime"
                    placeholder="09:00 AM"
                    class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                  />
                  <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch End Time <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="endTime"
                    name="endTime"
                    placeholder="05:00 PM"
                    class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                  />
                  <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- ================================================================
               SECTION 5: FACULTY DETAILS (Image 4)
               ================================================================ -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Faculty Details
              </h2>
              <button
                type="button"
                (click)="addFacultyRow()"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 transition-colors cursor-pointer"
              >
                + Add Faculty
              </button>
            </div>

            <div class="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              @for (f of facultyList; track $index; let idx = $index) {
                <div class="grid grid-cols-12 gap-3 items-center text-xs">
                  <div class="col-span-12 sm:col-span-4">
                    <label class="block text-[11px] font-semibold text-slate-600 mb-1">Name of Faculty</label>
                    <input
                      type="text"
                      [(ngModel)]="f.name"
                      [name]="'fac_name_' + idx"
                      placeholder=""
                      class="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <div class="col-span-12 sm:col-span-3">
                    <label class="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
                    <input
                      type="text"
                      [(ngModel)]="f.type"
                      [name]="'fac_type_' + idx"
                      placeholder=""
                      class="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <div class="col-span-12 sm:col-span-3">
                    <label class="block text-[11px] font-semibold text-slate-600 mb-1">Qualification</label>
                    <input
                      type="text"
                      [(ngModel)]="f.qualification"
                      [name]="'fac_qual_' + idx"
                      placeholder=""
                      class="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <div class="col-span-10 sm:col-span-1">
                    <label class="block text-[11px] font-semibold text-slate-600 mb-1">Experience (Yrs)</label>
                    <input
                      type="number"
                      [(ngModel)]="f.experienceYears"
                      [name]="'fac_exp_' + idx"
                      placeholder=""
                      class="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <div class="col-span-2 sm:col-span-1 flex items-end justify-center pt-5 sm:pt-4">
                    <button
                      type="button"
                      (click)="removeFacultyRow(idx)"
                      class="text-rose-500 hover:text-rose-700 cursor-pointer font-bold text-sm"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- ================================================================
               SECTION 6: ADDITIONAL INFORMATION (Image 4)
               ================================================================ -->
          <div class="space-y-4">
            <h2 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Additional Information
            </h2>

            <!-- Comments -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Comments</label>
              <textarea
                rows="3"
                [(ngModel)]="comments"
                name="comments"
                class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
              ></textarea>
            </div>

            <!-- Upload Dropzone -->
            <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 sm:p-8 text-center bg-white hover:bg-slate-50/50 transition-colors flex flex-col items-center justify-center space-y-2 cursor-pointer">
              <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span class="text-xs font-bold text-slate-800">
                Click to upload Supporting Documents
              </span>
            </div>
          </div>

          <!-- ================================================================
               SUBMIT ACTION
               ================================================================ -->
          <div class="pt-4 flex items-center justify-end">
            <button
              type="submit"
              class="px-6 py-2.5 rounded-lg bg-[#0B3558] hover:bg-[#123B59] active:bg-[#07233B] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
              style="color: #ffffff !important;"
            >
              Submit Batch Details
            </button>
          </div>

        </form>

      </div>

    </div>
  `
})
export class BatchFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private batchService = inject(BatchService);

  readonly schemeOptions = SDC_SCHEME_OPTIONS;

  errorMessage = signal<string>('');

  // Form Model matching Image 3 & 4
  scheme: string = 'SAMARTH';
  sector: string = 'Green Energy';
  courseQp: string = 'ELE/Q5901';
  courseVersion: string = 'NSQF v2.0';

  tpName: string = 'Apex Skill Solutions Pvt Ltd';
  sdcCode: string = 'SDC-001';
  batchCode: string = 'B-26-0007';
  residential: boolean = false;

  minStrength: number = 15;
  maxStrength: number = 30;
  nipaNo: string = '';
  psdStatus: string = 'Active';
  paymentStatus: string = 'Approved';
  totalYouthTrained: number | null = null;
  totalYouthPlaced: number | null = null;

  durationHours: number = 300;
  startDate: string = '2026-10-01';
  freezeDate: string = '';
  endDate: string = '2026-12-31';
  startTime: string = '09:00 AM';
  endTime: string = '05:00 PM';

  facultyList: { name: string; type: string; qualification: string; experienceYears: number }[] = [
    { name: '', type: '', qualification: '', experienceYears: 0 }
  ];

  comments: string = '';

  ngOnInit(): void {
    // Generate next batch code
    const existing = this.batchService.batches();
    const nextNum = existing.length + 1;
    this.batchCode = `B-26-000${nextNum}`;

    this.route.queryParams.subscribe(params => {
      if (params['sdcCode']) {
        this.sdcCode = params['sdcCode'];
      }
      if (params['scheme']) {
        this.scheme = params['scheme'];
      }
      if (params['tpName']) {
        this.tpName = params['tpName'];
      }
    });
  }

  readonly availableSectors = computed(() => {
    const courses = SCHEME_COURSE_CATALOG.filter(c => !this.scheme || c.scheme === this.scheme);
    const set = Array.from(new Set(courses.map(c => c.sector)));
    return set.length > 0 ? set : ['Green Energy', 'IT & ITeS', 'Automotive', 'Apparel & Handicrafts'];
  });

  readonly availableCourses = computed(() => {
    return SCHEME_COURSE_CATALOG.filter(c => (!this.scheme || c.scheme === this.scheme) && (!this.sector || c.sector === this.sector));
  });

  onSchemeChange(): void {
    const sectors = this.availableSectors();
    if (sectors.length > 0) {
      this.sector = sectors[0];
      this.onSectorChange();
    }
  }

  onSectorChange(): void {
    const courses = this.availableCourses();
    if (courses.length > 0) {
      this.courseQp = courses[0].qpCode;
    }
  }

  onCourseChange(): void {
    const course = SCHEME_COURSE_CATALOG.find(c => c.qpCode === this.courseQp);
    if (course) {
      this.durationHours = course.durationHours;
    }
  }

  addFacultyRow(): void {
    this.facultyList.push({ name: '', type: '', qualification: '', experienceYears: 0 });
  }

  removeFacultyRow(index: number): void {
    if (this.facultyList.length > 1) {
      this.facultyList.splice(index, 1);
    }
  }

  goBack(): void {
    this.router.navigate(['/batches']);
  }

  submitBatch(): void {
    if (!this.courseQp) {
      this.errorMessage.set('Please select Course / Job Role.');
      return;
    }
    if (!this.tpName.trim()) {
      this.errorMessage.set('TP Name is required.');
      return;
    }
    if (!this.startDate) {
      this.errorMessage.set('Batch Start Date is required.');
      return;
    }
    if (!this.endDate) {
      this.errorMessage.set('Batch End Date is required.');
      return;
    }

    const course = SCHEME_COURSE_CATALOG.find(c => c.qpCode === this.courseQp);

    const dto: CreateBatchDto = {
      sdcId: 'sdc-101',
      sdcCode: this.sdcCode || 'SDC-001',
      sdcName: 'Apex Skill Development Center',
      tpName: this.tpName,
      batchName: `${this.sector} Batch`,
      scheme: this.scheme || 'SAMARTH',
      sector: this.sector || 'Green Energy',
      courseName: course?.courseName || 'Solar Panel Installation Technician',
      qpCode: this.courseQp || 'ELE/Q5901',
      courseVersion: this.courseVersion || 'NSQF v2.0',
      theoryHours: Math.round(this.durationHours * 0.4),
      practicalHours: Math.round(this.durationHours * 0.5),
      softSkillHours: Math.round(this.durationHours * 0.1),
      totalHours: this.durationHours || 300,
      residential: this.residential,
      minStrength: this.minStrength || 15,
      maxStrength: this.maxStrength || 30,
      nipaNo: this.nipaNo || '',
      psdStatus: (this.psdStatus as any) || 'Active',
      startDate: this.startDate,
      endDate: this.endDate,
      freezeDate: this.freezeDate || '',
      startTime: this.startTime,
      endTime: this.endTime,
      faculty: this.facultyList.map(f => ({
        name: f.name || 'Primary Trainer',
        type: (f.type as any) || 'Primary Trainer',
        qualification: f.qualification || 'Certified Trainer',
        experienceYears: f.experienceYears || 2
      }))
    };

    this.batchService.createBatch(dto);
    this.router.navigate(['/batches']);
  }
}
