import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { CourseService } from '../../../../core/services/course.service';
import { CourseMaster } from '../../../../core/models/course.model';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, FormSelectComponent],
  template: `
    <div class="bg-white rounded-xl shadow-2xs border border-slate-200 p-6 font-sans">
      
      <!-- Pre-selected SDC Banner -->
      <div *ngIf="preselectedSdcCode" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-blue-600 block">Creating Batch for SDC Center</span>
          <span class="font-bold text-[#131A4D] text-sm">{{ preselectedSdcName || preselectedSdcCode }}</span>
          <span class="text-xs text-slate-500 font-mono ml-2">({{ preselectedSdcCode }})</span>
        </div>
        <span class="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded border border-blue-300 uppercase">
          {{ preselectedScheme || 'SAMARTH' }}
        </span>
      </div>

      <form [formGroup]="batchForm" (ngSubmit)="onSubmit()">
        
        <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Course & Scheme Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-slate-50 p-5 rounded-lg border border-slate-200">
          
          <app-form-select 
            formControlName="schemeId" 
            label="Scheme" 
            [options]="schemeOptions" 
            [required]="true">
          </app-form-select>
          
          <app-form-select 
            formControlName="sector" 
            label="Sector" 
            [options]="sectorOptions" 
            [required]="true"
            [disabled]="!batchForm.get('schemeId')?.value">
          </app-form-select>
          
          <app-form-select 
            formControlName="qpCode" 
            label="Course / Job Role" 
            [options]="jobRoleOptions" 
            [required]="true"
            [disabled]="!batchForm.get('sector')?.value">
          </app-form-select>

          <app-form-select 
            formControlName="courseVersionId" 
            label="Course Version" 
            [options]="versionOptions" 
            [required]="true"
            [disabled]="!batchForm.get('qpCode')?.value">
          </app-form-select>
          
        </div>

        <!-- Selected Course Details Auto-fill Card -->
        <div *ngIf="selectedCourse" class="mb-8 p-5 bg-white border border-slate-200 rounded-lg shadow-xs ring-1 ring-slate-100 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-[#EA580C]"></div>
          <div class="flex justify-between items-center mb-4">
             <h3 class="font-bold text-slate-800 text-sm tracking-wide uppercase">Course Specifications</h3>
             <span class="px-2 py-0.5 rounded text-[10px] font-bold" 
               [ngClass]="selectedCourse.source_status === 'Active' || selectedCourse.source_status === 'New Course' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
               {{ selectedCourse.source_status || 'Active' }}
             </span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div class="text-slate-400 font-medium mb-0.5 text-[10px] uppercase tracking-wider">NSQF Level</div>
              <div class="font-bold text-slate-800">{{ selectedCourse.nsqf_level || 'N/A' }}</div>
            </div>
            <div>
              <div class="text-slate-400 font-medium mb-0.5 text-[10px] uppercase tracking-wider">Category</div>
              <div class="font-bold text-slate-800">{{ selectedCourse.common_norms_category || 'N/A' }}</div>
            </div>
            <div>
              <div class="text-slate-400 font-medium mb-0.5 text-[10px] uppercase tracking-wider">Theory Hours</div>
              <div class="font-bold text-slate-800">{{ selectedCourse.theory_duration_hours }} Hrs</div>
            </div>
            <div>
              <div class="text-slate-400 font-medium mb-0.5 text-[10px] uppercase tracking-wider">Practical + OJT</div>
              <div class="font-bold text-slate-800">{{ selectedCourse.practical_mandatory_ojt_duration }} Hrs</div>
            </div>
            <div>
              <div class="text-slate-400 font-medium mb-0.5 text-[10px] uppercase tracking-wider">IT & Soft Skills</div>
              <div class="font-bold text-slate-800">{{ selectedCourse.it_soft_skill_training_hours }} Hrs</div>
            </div>
            <div>
              <div class="text-slate-400 font-medium mb-0.5 text-[10px] uppercase tracking-wider">Total Duration</div>
              <div class="font-bold text-[#0B3558] text-sm">{{ selectedCourse.total_qp_hours }} Hrs</div>
            </div>
            <div class="md:col-span-2">
              <div class="text-slate-400 font-medium mb-0.5 text-[10px] uppercase tracking-wider">Valid Up To</div>
              <div class="font-bold" [ngClass]="isValidCourse ? 'text-emerald-600' : 'text-rose-600'">
                {{ selectedCourse.course_valid_up_to || 'N/A' }}
              </div>
            </div>
          </div>
          
          <div *ngIf="!isValidCourse" class="mt-4 p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-medium flex items-start gap-2">
            <svg class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            This course version is expired or invalid for new batch creation. Please select a valid version.
          </div>
        </div>

        <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Batch Identity</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <app-form-input formControlName="tpName" label="TP Name" [required]="true"></app-form-input>
          <app-form-input formControlName="sdcCode" label="SDC Code" [required]="true"></app-form-input>
          <app-form-input formControlName="batchCode" label="Batch Code (Auto-generated)" [disabled]="true"></app-form-input>
          
          <div class="md:col-span-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" formControlName="isResidential" class="w-4 h-4 text-rsldc-navy rounded border-slate-300">
              <span class="text-sm font-semibold text-slate-700">Residential Course</span>
            </label>
          </div>
        </div>

        <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Batch Strength & Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <app-form-input formControlName="minStrength" type="number" label="Batch Minimum Strength" [required]="true"></app-form-input>
          <app-form-input formControlName="maxStrength" type="number" label="Batch Maximum Strength" [required]="true"></app-form-input>
          <app-form-input formControlName="nipaNo" label="N IPA No"></app-form-input>
          <app-form-input formControlName="psdStatus" label="PSD Status"></app-form-input>
          <app-form-input formControlName="paymentStatus" label="Payment Status"></app-form-input>
          <app-form-input formControlName="totalTrained" type="number" label="Total No of Youth Trained"></app-form-input>
          <app-form-input formControlName="totalPlaced" type="number" label="Total No of Youth Placed"></app-form-input>
        </div>

        <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Dates & Timings</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <app-form-input formControlName="durationHrs" type="number" label="Batch Duration (Hrs)"></app-form-input>
          <app-form-input formControlName="startDate" type="date" label="Batch Start Date" [required]="true"></app-form-input>
          <app-form-input formControlName="freezeDate" type="date" label="Batch Freeze Date"></app-form-input>
          <app-form-input formControlName="endDate" type="date" label="Batch End Date" [required]="true"></app-form-input>
          <app-form-input formControlName="startTime" type="time" label="Batch Start Time" [required]="true"></app-form-input>
          <app-form-input formControlName="endTime" type="time" label="Batch End Time" [required]="true"></app-form-input>
        </div>

        <!-- Faculty Details -->
        <div class="mb-8">
          <div class="flex justify-between items-center border-b pb-2 mb-4">
            <h2 class="text-lg font-bold text-rsldc-navy">Faculty Details</h2>
            <button type="button" (click)="addFaculty()" class="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-200">+ Add Faculty</button>
          </div>
          <div formArrayName="facultyDetails" class="space-y-4">
            <div *ngFor="let faculty of facultyFormArray.controls; let i=index" [formGroupName]="i" class="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <app-form-input formControlName="name" label="Name of Faculty" class="flex-1"></app-form-input>
              <app-form-input formControlName="type" label="Type" class="flex-1"></app-form-input>
              <app-form-input formControlName="qualification" label="Qualification" class="flex-1"></app-form-input>
              <app-form-input formControlName="experience" label="Experience (Yrs)" type="number" class="w-24"></app-form-input>
              <button type="button" (click)="removeFaculty(i)" class="mt-6 text-red-500 hover:text-red-700"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg></button>
            </div>
            <p *ngIf="facultyFormArray.length === 0" class="text-sm text-slate-500 text-center py-4">No faculty added.</p>
          </div>
        </div>

        <!-- Hostel Details -->
        <div class="mb-8" *ngIf="batchForm.get('isResidential')?.value">
          <div class="flex justify-between items-center border-b pb-2 mb-4">
            <h2 class="text-lg font-bold text-rsldc-navy">Hostel Details</h2>
            <button type="button" (click)="addHostel()" class="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-200">+ Add Hostel</button>
          </div>
          <div formArrayName="hostelDetails" class="space-y-4">
            <div *ngFor="let hostel of hostelFormArray.controls; let i=index" [formGroupName]="i" class="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <app-form-input formControlName="hostelCode" label="Hostel Code" class="w-32"></app-form-input>
              <app-form-input formControlName="type" label="Type" class="w-32"></app-form-input>
              <app-form-input formControlName="capacity" type="number" label="Capacity" class="w-24"></app-form-input>
              <app-form-input formControlName="address" label="Hostel Address" class="flex-1"></app-form-input>
              <button type="button" (click)="removeHostel(i)" class="mt-6 text-red-500 hover:text-red-700"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg></button>
            </div>
            <p *ngIf="hostelFormArray.length === 0" class="text-sm text-slate-500 text-center py-4">No hostels added.</p>
          </div>
        </div>

        <!-- Comments & Docs -->
        <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Additional Information</h2>
        <div class="mb-6">
          <label class="block text-sm font-semibold text-slate-700 mb-1">Comments</label>
          <textarea formControlName="comments" rows="3" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy"></textarea>
        </div>

        <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition cursor-pointer mb-8">
          <svg class="w-10 h-10 text-slate-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <p class="text-sm font-bold text-rsldc-navy">Click to upload Supporting Documents</p>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-200">
          <button type="submit" [disabled]="batchForm.invalid || !isValidCourse" class="px-6 py-2 bg-[#EA580C] hover:bg-[#c2410a] text-white rounded-lg font-bold text-sm transition shadow-md disabled:opacity-50 disabled:bg-slate-400">
            Submit Batch Details
          </button>
        </div>
      </form>
    </div>
  `
})
export class BatchFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);
  
  @Output() formSubmit = new EventEmitter<any>();

  preselectedSdcCode = '';
  preselectedSdcName = '';
  preselectedScheme = '';

  batchForm: FormGroup = this.fb.group({
    schemeId: ['', Validators.required],
    sector: ['', Validators.required],
    qpCode: ['', Validators.required],
    courseVersionId: ['', Validators.required],
    
    tpName: ['Apex Skill Solutions Pvt Ltd', Validators.required],
    sdcCode: ['', Validators.required],
    batchCode: [{value: 'B-26-000' + Math.floor(4 + Math.random() * 9), disabled: true}],
    isResidential: [false],
    minStrength: [15, Validators.required],
    maxStrength: [30, Validators.required],
    nipaNo: [''],
    psdStatus: ['Active'],
    paymentStatus: ['Approved'],
    totalTrained: [0],
    totalPlaced: [0],
    durationHrs: [300],
    startDate: ['2026-10-01', Validators.required],
    freezeDate: [''],
    endDate: ['2026-12-31', Validators.required],
    startTime: ['09:00', Validators.required],
    endTime: ['17:00', Validators.required],
    comments: [''],
    facultyDetails: this.fb.array([]),
    hostelDetails: this.fb.array([])
  });

  // Select Options Data
  schemeOptions: {label: string, value: string}[] = [];
  sectorOptions: {label: string, value: string}[] = [];
  jobRoleOptions: {label: string, value: string}[] = [];
  versionOptions: {label: string, value: string}[] = [];

  // Currently Selected Course Data
  selectedCourse?: CourseMaster;
  isValidCourse = false;

  ngOnInit() {
    this.addFaculty();
    this.loadSchemes();
    this.setupCascadingDropdowns();
    this.readQueryParams();
  }

  private readQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['sdcCode']) {
        this.preselectedSdcCode = params['sdcCode'];
        this.preselectedSdcName = params['sdcName'] || '';
        this.preselectedScheme = params['scheme'] || '';

        this.batchForm.patchValue({
          sdcCode: this.preselectedSdcCode,
          tpName: 'Apex Skill Solutions Pvt Ltd'
        });
      }
    });
  }

  private loadSchemes() {
    this.courseService.getSchemes().subscribe(schemes => {
      this.schemeOptions = schemes.map(s => ({ label: s.name, value: s.id }));
    });
  }

  private setupCascadingDropdowns() {
    // Scheme -> Sector
    this.batchForm.get('schemeId')?.valueChanges.subscribe(schemeId => {
      this.batchForm.patchValue({ sector: '', qpCode: '', courseVersionId: '' }, { emitEvent: false });
      this.sectorOptions = [];
      this.jobRoleOptions = [];
      this.versionOptions = [];
      this.selectedCourse = undefined;
      
      if (schemeId) {
        this.courseService.getSectorsByScheme(schemeId).subscribe(sectors => {
          this.sectorOptions = sectors.map(s => ({ label: s, value: s }));
        });
      }
    });

    // Sector -> Job Role (Course)
    this.batchForm.get('sector')?.valueChanges.subscribe(sector => {
      this.batchForm.patchValue({ qpCode: '', courseVersionId: '' }, { emitEvent: false });
      this.jobRoleOptions = [];
      this.versionOptions = [];
      this.selectedCourse = undefined;
      
      const schemeId = this.batchForm.get('schemeId')?.value;
      if (sector && schemeId) {
        this.courseService.getJobRoles(schemeId, sector).subscribe(roles => {
          this.jobRoleOptions = roles.map(r => ({ label: r.name, value: r.code }));
        });
      }
    });

    // Job Role -> Version
    this.batchForm.get('qpCode')?.valueChanges.subscribe(qpCode => {
      this.batchForm.patchValue({ courseVersionId: '' }, { emitEvent: false });
      this.versionOptions = [];
      this.selectedCourse = undefined;
      
      if (qpCode) {
        this.courseService.getCourseVersions(qpCode).subscribe(versions => {
          this.versionOptions = versions.map(v => ({ 
            label: `v${v.version} - ${this.courseService.isValidForNewBatch(v) ? 'Active' : 'Expired'}`, 
            value: v.course_version_id 
          }));
        });
      }
    });

    // Version -> Update Details
    this.batchForm.get('courseVersionId')?.valueChanges.subscribe(versionId => {
      if (versionId) {
        this.courseService.getCourseDetails(versionId).subscribe(course => {
          this.selectedCourse = course;
          if (course) {
            this.isValidCourse = this.courseService.isValidForNewBatch(course);
            // Autofill duration
            this.batchForm.patchValue({ durationHrs: course.total_qp_hours }, { emitEvent: false });
          } else {
            this.isValidCourse = false;
          }
        });
      } else {
        this.selectedCourse = undefined;
        this.isValidCourse = false;
      }
    });
  }

  get facultyFormArray() {
    return this.batchForm.get('facultyDetails') as FormArray;
  }

  get hostelFormArray() {
    return this.batchForm.get('hostelDetails') as FormArray;
  }

  addFaculty() {
    this.facultyFormArray.push(this.fb.group({
      name: ['', Validators.required],
      type: [''],
      qualification: [''],
      experience: ['']
    }));
  }

  removeFaculty(index: number) {
    this.facultyFormArray.removeAt(index);
  }

  addHostel() {
    this.hostelFormArray.push(this.fb.group({
      address: ['', Validators.required],
      hostelCode: [''],
      type: [''],
      capacity: ['']
    }));
  }

  removeHostel(index: number) {
    this.hostelFormArray.removeAt(index);
  }

  onSubmit() {
    if (this.batchForm.valid && this.isValidCourse) {
      this.formSubmit.emit(this.batchForm.getRawValue());
    }
  }
}
