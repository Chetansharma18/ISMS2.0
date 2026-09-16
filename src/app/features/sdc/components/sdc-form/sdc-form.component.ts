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
    <div class="bg-white rounded-xl shadow-2xs border border-slate-200 p-6 font-sans">
      
      <!-- Stepper Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex-1">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                 [ngClass]="currentStep >= 1 ? 'bg-rsldc-navy text-white' : 'bg-slate-200 text-slate-500'">1</div>
            <div class="flex-1 h-1 mx-2" [ngClass]="currentStep >= 2 ? 'bg-rsldc-navy' : 'bg-slate-200'"></div>
          </div>
          <p class="text-xs font-semibold text-slate-600 mt-2">Organization</p>
        </div>
        <div class="flex-1">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                 [ngClass]="currentStep >= 2 ? 'bg-rsldc-navy text-white' : 'bg-slate-200 text-slate-500'">2</div>
            <div class="flex-1 h-1 mx-2" [ngClass]="currentStep >= 3 ? 'bg-rsldc-navy' : 'bg-slate-200'"></div>
          </div>
          <p class="text-xs font-semibold text-slate-600 mt-2">Location & Details</p>
        </div>
        <div class="flex-1">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                 [ngClass]="currentStep >= 3 ? 'bg-rsldc-navy text-white' : 'bg-slate-200 text-slate-500'">3</div>
            <div class="flex-1 h-1 mx-2" [ngClass]="currentStep >= 4 ? 'bg-rsldc-navy' : 'bg-slate-200'"></div>
          </div>
          <p class="text-xs font-semibold text-slate-600 mt-2">Courses & Docs</p>
        </div>
        <div>
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                 [ngClass]="currentStep >= 4 ? 'bg-rsldc-navy text-white' : 'bg-slate-200 text-slate-500'">4</div>
          </div>
          <p class="text-xs font-semibold text-slate-600 mt-2">Review</p>
        </div>
      </div>

      <form [formGroup]="sdcForm">
        
        <!-- STEP 1: ORGANIZATION -->
        <div *ngIf="currentStep === 1" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Section A: Organization Details</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>

        <!-- STEP 2: LOCATION & DETAILS -->
        <div *ngIf="currentStep === 2" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Section B & C: Location and Centre Details</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
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
              formControlName="capacity"
              type="number"
              label="SDC Capacity"
              [required]="true"
              placeholder="Max students">
            </app-ui-input>

            <div class="md:col-span-3 -mt-2">
              <label class="block text-sm font-semibold text-slate-700 mb-1">Full Address <span class="text-red-500">*</span></label>
              <textarea formControlName="address" rows="2" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy"></textarea>
            </div>

            <!-- GEOLOCATION SECTION -->
            <div class="md:col-span-3 mt-4 pt-4 border-t border-slate-200">
              <h3 class="font-bold text-rsldc-navy mb-3">Center Geo-Location <span class="text-red-500">*</span></h3>
              <p class="text-xs text-slate-500 mb-4">Mandatory for Auditor Verification. Drag the map marker or enter coordinates manually.</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Inputs -->
                <div class="space-y-1">
                  <app-ui-input
                    formControlName="latitude"
                    type="number"
                    label="Latitude (-90 to +90)"
                    placeholder="e.g. 26.9124">
                  </app-ui-input>
                  
                  <app-ui-input
                    formControlName="longitude"
                    type="number"
                    label="Longitude (-180 to +180)"
                    placeholder="e.g. 75.7873">
                  </app-ui-input>

                  <div class="flex gap-2">
                    <button type="button" (click)="useCurrentLocation()" class="w-full py-2 bg-blue-100 text-blue-800 font-bold text-xs rounded shadow-xs hover:bg-blue-200 transition-colors flex items-center justify-center gap-1">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                      Use My Location
                    </button>
                  </div>
                </div>

                <!-- Map Mock -->
                <div class="bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative min-h-[200px] flex items-center justify-center">
                  <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(#94a3b8 1px, transparent 1px); background-size: 20px 20px;"></div>
                  <div class="relative flex flex-col items-center">
                    <svg class="w-8 h-8 text-red-600 drop-shadow-md -mt-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                    <span class="bg-white px-2 py-1 rounded shadow-md text-[10px] font-bold mt-2">
                      Lat: {{ sdcForm.value.latitude || 'Not set' }}<br>
                      Lng: {{ sdcForm.value.longitude || 'Not set' }}
                    </span>
                  </div>
                  <div class="absolute bottom-2 right-2 bg-white/80 px-2 py-1 text-[9px] font-bold text-slate-600 rounded">Map Preview</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 3: COURSES & DOCS -->
        <div *ngIf="currentStep === 3" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Section D: Courses & Documents</h2>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-rsldc-navy text-sm">Select Target Course</h3>
              <span class="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">From Approved Proposals</span>
            </div>
            <p class="text-xs text-slate-500 mb-3">You can only select courses that have been explicitly approved for your TP by the Department.</p>
            
            <app-ui-select
              formControlName="courseId"
              [options]="(courseOptions$ | async) || []"
              placeholder="Select an Approved Course..."
              class="block w-full">
            </app-ui-select>
            
            <div class="mt-2 text-right">
               <a routerLink="/tp/courses" class="text-xs font-bold text-blue-600 hover:underline">Manage My Proposed Courses &rarr;</a>
            </div>
          </div>

          <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition cursor-pointer">
            <svg class="w-10 h-10 text-slate-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <p class="text-sm font-bold text-rsldc-navy">Click to upload supporting documents</p>
            <p class="text-xs text-slate-500 mt-1">PDF, JPG up to 5MB (Building Photos, Rent Agreement)</p>
          </div>
        </div>

        <!-- STEP 4: REVIEW -->
        <div *ngIf="currentStep === 4" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Review & Submit</h2>
          
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
            <div class="flex justify-between border-b border-slate-200 pb-2">
              <span class="text-sm font-semibold text-slate-600">SDC Name</span>
              <span class="text-sm font-bold text-rsldc-navy">{{ sdcForm.value.name || 'N/A' }}</span>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-2">
              <span class="text-sm font-semibold text-slate-600">Scheme</span>
              <span class="text-sm font-bold text-rsldc-navy">{{ sdcForm.value.schemeId || 'N/A' }}</span>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-2">
              <span class="text-sm font-semibold text-slate-600">District</span>
              <span class="text-sm font-bold text-rsldc-navy">{{ sdcForm.value.district || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-semibold text-slate-600">Capacity</span>
              <span class="text-sm font-bold text-rsldc-navy">{{ sdcForm.value.capacity || 'N/A' }} Aspirants</span>
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800 text-sm">
            <svg class="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <div>
              <strong>Declaration:</strong> I certify that all information provided is accurate and the SDC meets the scheme guidelines. Submitting will send this to the department for inspection.
            </div>
          </div>
        </div>

      </form>

      <!-- Navigation Footer -->
      <div class="mt-8 pt-4 border-t border-slate-200 flex justify-between">
        <button 
          *ngIf="currentStep > 1" 
          (click)="prevStep()"
          class="px-5 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition">
          Back
        </button>
        <div *ngIf="currentStep === 1"></div>

        <button 
          *ngIf="currentStep < 4" 
          (click)="nextStep()"
          class="px-6 py-2 bg-rsldc-navy text-white rounded-lg font-bold text-sm hover:bg-rsldc-navyLight transition shadow-md">
          Continue
        </button>
        
        <button 
          *ngIf="currentStep === 4" 
          (click)="onSubmit()"
          class="px-6 py-2 bg-approve-700 text-white rounded-lg font-bold text-sm hover:bg-green-800 transition shadow-md flex items-center gap-2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          Final Submit
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
    district: ['', Validators.required],
    capacity: ['', Validators.required],
    address: ['', Validators.required],
    latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
    courseId: ['', Validators.required]
  });

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
