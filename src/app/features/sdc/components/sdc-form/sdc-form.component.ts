import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseProposalService, CourseProposal } from '../../../../core/services/course-proposal.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UiInputComponent } from '../../../../shared/components/ui/ui-input/ui-input.component';
import { UiSelectComponent, SelectOption } from '../../../../shared/components/ui/ui-select/ui-select.component';

@Component({
  selector: 'app-sdc-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiSelectComponent],
  template: `
    <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 font-sans relative overflow-hidden">
      <!-- Decorative background accent -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-rsldc-navy/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <!-- Stepper Header -->
      <div class="flex items-center justify-between mb-10 relative z-10">
        <div class="flex-1 group">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300"
                 [ngClass]="currentStep >= 1 ? 'bg-rsldc-navy text-white shadow-rsldc-navy/30' : 'bg-slate-100 text-slate-400 border border-slate-200'">1</div>
            <div class="flex-1 h-1.5 mx-3 rounded-full transition-all duration-300" 
                 [ngClass]="currentStep >= 2 ? 'bg-rsldc-navy' : 'bg-slate-100'"></div>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider mt-3 transition-colors duration-300"
             [ngClass]="currentStep >= 1 ? 'text-rsldc-navy' : 'text-slate-400'">Organization</p>
        </div>
        <div class="flex-1 group">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300"
                 [ngClass]="currentStep >= 2 ? 'bg-rsldc-navy text-white shadow-rsldc-navy/30' : 'bg-slate-100 text-slate-400 border border-slate-200'">2</div>
            <div class="flex-1 h-1.5 mx-3 rounded-full transition-all duration-300" 
                 [ngClass]="currentStep >= 3 ? 'bg-rsldc-navy' : 'bg-slate-100'"></div>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider mt-3 transition-colors duration-300"
             [ngClass]="currentStep >= 2 ? 'text-rsldc-navy' : 'text-slate-400'">Location & Details</p>
        </div>
        <div class="flex-1 group">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300"
                 [ngClass]="currentStep >= 3 ? 'bg-rsldc-navy text-white shadow-rsldc-navy/30' : 'bg-slate-100 text-slate-400 border border-slate-200'">3</div>
            <div class="flex-1 h-1.5 mx-3 rounded-full transition-all duration-300" 
                 [ngClass]="currentStep >= 4 ? 'bg-rsldc-navy' : 'bg-slate-100'"></div>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider mt-3 transition-colors duration-300"
             [ngClass]="currentStep >= 3 ? 'text-rsldc-navy' : 'text-slate-400'">Courses & Docs</p>
        </div>
        <div class="group">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300"
                 [ngClass]="currentStep >= 4 ? 'bg-rsldc-navy text-white shadow-rsldc-navy/30' : 'bg-slate-100 text-slate-400 border border-slate-200'">4</div>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider mt-3 transition-colors duration-300"
             [ngClass]="currentStep >= 4 ? 'text-rsldc-navy' : 'text-slate-400'">Review</p>
        </div>
      </div>

      <form [formGroup]="sdcForm" class="relative z-10">
        
        <!-- STEP 1: ORGANIZATION -->
        <div *ngIf="currentStep === 1" class="animate-in fade-in slide-in-from-right-4 duration-500">
          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <h2 class="text-xl font-bold text-slate-800">Organization Details</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <app-ui-select
              formControlName="schemeId"
              label="Scheme"
              [required]="true"
              placeholder="Select Scheme"
              [options]="schemeOptions">
            </app-ui-select>

            <app-ui-input
              formControlName="name"
              label="SDC Name"
              [required]="true"
              placeholder="e.g. Jaipur Excellence Center">
            </app-ui-input>

            <app-ui-input
              formControlName="mouNo"
              label="MoU Reference No."
              [required]="true"
              placeholder="MOU/2026/001">
            </app-ui-input>
            <app-ui-input
              formControlName="tpName"
              label="TP Name"
              [required]="true"
              placeholder="e.g. SkillMasters Rajasthan">
            </app-ui-input>

            <app-ui-input
              formControlName="sdcCode"
              label="SDC Code"
              [required]="true"
              placeholder="e.g. SDC-001">
            </app-ui-input>

            <app-ui-input
              formControlName="proposedStartDate"
              type="date"
              label="Proposed Start Date"
              [required]="true">
            </app-ui-input>

            <app-ui-input
              formControlName="totalTrained"
              type="number"
              label="Total Trained Aspirants"
              placeholder="e.g. 500">
            </app-ui-input>

            <app-ui-input
              formControlName="totalPlaced"
              type="number"
              label="Total TP Placed Aspirants"
              placeholder="e.g. 400">
            </app-ui-input>
            </div>
          </div>
        </div>

        <!-- STEP 2: LOCATION & DETAILS -->
        <div *ngIf="currentStep === 2" class="animate-in fade-in slide-in-from-right-4 duration-500">
          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8 mb-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <h2 class="text-xl font-bold text-slate-800">Location and Centre Details</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            <app-ui-select
              label="State"
              [required]="true"
              [options]="[{label: 'Rajasthan', value: 'Rajasthan'}]"
              placeholder="Rajasthan"
              [isDisabled]="true"
              class="w-full">
            </app-ui-select>

            <app-ui-select
              formControlName="district"
              label="District"
              [required]="true"
              placeholder="Select District"
              [options]="districtOptions">
            </app-ui-select>

            <app-ui-input
              formControlName="assemblyConstituency"
              label="Assembly Constituency"
              placeholder="Select Assembly Constituency">
            </app-ui-input>

            <app-ui-input
              formControlName="parliamentConstituency"
              label="Parliament Constituency"
              placeholder="Select Parliament Constituency">
            </app-ui-input>

            <app-ui-input
              formControlName="division"
              label="Division"
              placeholder="Select Division">
            </app-ui-input>

            <app-ui-input
              formControlName="block"
              label="Block"
              placeholder="Select Block">
            </app-ui-input>

            <app-ui-input
              formControlName="capacity"
              type="number"
              label="SDC Capacity"
              [required]="true"
              placeholder="Max students">
            </app-ui-input>

            <app-ui-input
              formControlName="centerEmail"
              type="email"
              label="Center Email"
              [required]="true"
              placeholder="center@example.com">
            </app-ui-input>
            
            <app-ui-input
              formControlName="pincode"
              type="text"
              label="Pincode"
              [required]="true"
              placeholder="e.g. 302001">
            </app-ui-input>

            <div class="md:col-span-3">
              <label class="block font-semibold text-slate-700 text-xs tracking-wide mb-1.5">Full Address <span class="text-red-500">*</span></label>
              <textarea formControlName="address" rows="2" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none hover:border-slate-300 focus:ring-4 focus:ring-rsldc-navy/10 shadow-sm focus:bg-slate-50/50"></textarea>
            </div>
            
            <div class="md:col-span-3">
              <label class="block font-semibold text-slate-700 text-xs tracking-wide mb-1.5">Remarks</label>
              <textarea formControlName="remarks" rows="2" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none hover:border-slate-300 focus:ring-4 focus:ring-rsldc-navy/10 shadow-sm focus:bg-slate-50/50"></textarea>
            </div>
            </div>
          </div>

          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-slate-800">Center Geo-Location <span class="text-red-500">*</span></h3>
                <p class="text-xs text-slate-500 font-medium mt-1">Mandatory for Auditor Verification.</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <app-ui-input
                formControlName="latitude"
                label="Latitude"
                [required]="true"
                placeholder="e.g. 26.9124">
              </app-ui-input>
              <app-ui-input
                formControlName="longitude"
                label="Longitude"
                [required]="true"
                placeholder="e.g. 75.7873">
              </app-ui-input>
            </div>
          </div>
        </div>

        <!-- STEP 3: COURSES & DOCS -->
        <div *ngIf="currentStep === 3" class="animate-in fade-in slide-in-from-right-4 duration-500">
          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8 mb-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <h2 class="text-xl font-bold text-slate-800">Section D: Courses Available</h2>
            </div>
            
            <div class="mb-4">
              <label class="block font-semibold text-slate-700 text-xs tracking-wide mb-1.5">Select Approved Course(s) <span class="text-red-500">*</span></label>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngFor="let course of (courseOptions$ | async)" 
                     class="border border-slate-200 rounded-xl p-4 flex items-start gap-4 hover:border-rsldc-navy/50 transition bg-white shadow-sm hover:shadow group cursor-pointer"
                     (click)="toggleCourse(course.value)">
                  <div class="mt-0.5">
                    <input type="checkbox" 
                           [checked]="isCourseSelected(course.value)"
                           class="w-5 h-5 text-rsldc-navy border-slate-300 rounded focus:ring-rsldc-navy focus:ring-2 pointer-events-none">
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-800 group-hover:text-rsldc-navy transition-colors">{{ course.label.split(' (')[0] }}</h4>
                    <p class="text-xs font-semibold text-slate-500 mt-1">Course Code: {{ course.value }}</p>
                  </div>
                </div>
              </div>
              <p *ngIf="sdcFormControls['courses'].invalid && (sdcFormControls['courses'].dirty || sdcFormControls['courses'].touched)" class="text-xs text-red-500 mt-2 font-semibold">
                Please select at least one course.
              </p>
            </div>
          </div>

          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h2 class="text-xl font-bold text-slate-800">Section E: Center Documents</h2>
            </div>
            
            <div class="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-white transition cursor-pointer hover:border-rsldc-navy/50 group">
              <div class="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-rsldc-navy/10 transition-colors">
                <svg class="w-7 h-7 text-slate-400 group-hover:text-rsldc-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <p class="text-sm font-bold text-slate-800 mb-1">Click to upload or drag & drop</p>
              <p class="text-xs text-slate-500 font-medium mb-4">Rental Agreement, Fire NOC, Front Photo (PDF, JPG up to 10MB)</p>
              <button type="button" class="px-5 py-2 bg-white border border-slate-200 shadow-sm text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50">Select Files</button>
            </div>
          </div>
        </div>

        <!-- STEP 4: REVIEW -->
        <div *ngIf="currentStep === 4" class="animate-in fade-in slide-in-from-right-4 duration-500">
          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <h2 class="text-xl font-bold text-slate-800">Review & Submit</h2>
            </div>
            
            <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4 mb-6">
              <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                <span class="text-sm font-semibold text-slate-500 uppercase tracking-wide">SDC Name</span>
                <span class="text-sm font-bold text-slate-800">{{ sdcForm.value.name || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                <span class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Scheme</span>
                <span class="text-sm font-bold text-slate-800">{{ sdcForm.value.schemeId || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Location</span>
                <span class="text-sm font-bold text-slate-800">{{ sdcForm.value.district || 'N/A' }}</span>
              </div>
            </div>
            
            <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-4 text-amber-800 shadow-sm">
              <svg class="w-6 h-6 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <div>
                <strong class="block mb-1 font-bold">Declaration</strong> 
                <span class="text-sm font-medium">I certify that all information provided is accurate and verifiable. Submitting this form will send the application to the department for inspection.</span>
              </div>
            </div>
          </div>
        </div>

      </form>

      <!-- Navigation Footer -->
      <div class="mt-8 pt-6 border-t border-slate-100 flex justify-between relative z-10">
        <button 
          *ngIf="currentStep > 1" 
          (click)="prevStep()"
          class="px-6 py-2.5 border border-slate-300 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm focus:ring-4 focus:ring-slate-100 outline-none">
          Back
        </button>
        <div *ngIf="currentStep === 1"></div>

        <button 
          *ngIf="currentStep < 4" 
          (click)="nextStep()"
          [disabled]="isCurrentStepInvalid()"
          class="px-8 py-2.5 bg-rsldc-navy text-white rounded-xl font-bold text-sm hover:bg-[#0f1540] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-rsldc-navy/30 outline-none flex items-center gap-2">
          Continue
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
        
        <button 
          *ngIf="currentStep === 4" 
          (click)="onSubmit()"
          class="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:shadow-emerald-600/20 flex items-center gap-2 focus:ring-4 focus:ring-emerald-600/30 outline-none">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          Submit Application
        </button>
      </div>

    </div>
  `
})
export class SdcFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseProposalService);
  @Output() formSubmit = new EventEmitter<any>();

  currentStep = 1;
  allCourses$!: Observable<CourseProposal[]>;
  courseOptions$!: Observable<SelectOption[]>;

  schemeOptions: SelectOption[] = [
    { label: 'SAMARTH (State Fund)', value: 'SCH-001' },
    { label: 'PMKVY (Central Fund)', value: 'SCH-002' }
  ];

  districtOptions: SelectOption[] = [
    { label: 'Jaipur', value: 'Jaipur' },
    { label: 'Ajmer', value: 'Ajmer' },
    { label: 'Jodhpur', value: 'Jodhpur' }
  ];

  sdcForm: FormGroup = this.fb.group({
    schemeId: ['', Validators.required],
    name: ['', Validators.required],
    mouNo: ['', Validators.required],
    tpName: ['', Validators.required],
    sdcCode: ['', Validators.required],
    proposedStartDate: ['', Validators.required],
    totalTrained: [''],
    totalPlaced: [''],
    district: ['', Validators.required],
    assemblyConstituency: [''],
    parliamentConstituency: [''],
    division: [''],
    block: [''],
    capacity: ['', Validators.required],
    centerEmail: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
    pincode: ['', Validators.required],
    remarks: [''],
    latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
    courses: this.fb.array([], Validators.required),
    tpRecommendation: ['']
  });

  get sdcFormControls() {
    return this.sdcForm.controls;
  }

  isCourseSelected(courseCode: string | number): boolean {
    const codeStr = String(courseCode);
    const courses = this.sdcForm.get('courses')?.value as string[];
    return courses ? courses.includes(codeStr) : false;
  }

  toggleCourse(courseCode: string | number) {
    const codeStr = String(courseCode);
    const coursesControl = this.sdcForm.get('courses');
    const currentCourses = coursesControl?.value as string[] || [];
    
    if (currentCourses.includes(codeStr)) {
      coursesControl?.setValue(currentCourses.filter(c => c !== codeStr));
    } else {
      coursesControl?.setValue([...currentCourses, codeStr]);
    }
    coursesControl?.markAsDirty();
  }

  isCurrentStepInvalid(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.sdcForm.get('schemeId')!.invalid || 
               this.sdcForm.get('name')!.invalid || 
               this.sdcForm.get('mouNo')!.invalid || 
               this.sdcForm.get('tpName')!.invalid || 
               this.sdcForm.get('sdcCode')!.invalid || 
               this.sdcForm.get('proposedStartDate')!.invalid;
      case 2:
        return this.sdcForm.get('district')!.invalid || 
               this.sdcForm.get('capacity')!.invalid || 
               this.sdcForm.get('centerEmail')!.invalid || 
               this.sdcForm.get('address')!.invalid || 
               this.sdcForm.get('pincode')!.invalid || 
               this.sdcForm.get('latitude')!.invalid || 
               this.sdcForm.get('longitude')!.invalid;
      case 3:
        return this.sdcForm.get('courses')!.invalid;
      default:
        return false;
    }
  }

  ngOnInit() {
    this.allCourses$ = this.courseService.getProposalsByTp('TP042');
    this.courseOptions$ = this.allCourses$.pipe(
      map(courses => courses.map(c => ({
        label: `${c.courseName} (${c.courseCode}) - ${c.status === 'APPROVED' ? c.nsqfLevel : c.status.replace('_', ' ')}`,
        value: c.courseCode,
        disabled: c.status !== 'APPROVED'
      })))
    );
  }

  useCurrentLocation() {
    this.sdcForm.patchValue({
      latitude: 26.9124,
      longitude: 75.7873
    });
  }

  nextStep() {
    if (this.currentStep < 4) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  onSubmit() {
    this.formSubmit.emit(this.sdcForm.value);
  }
}
