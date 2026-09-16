import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SdcService, Sdc } from '../../../../core/services/sdc.service';
import { CourseProposalService, CourseProposal } from '../../../../core/services/course-proposal.service';
import { Observable, of } from 'rxjs';
import { startWith, switchMap, map } from 'rxjs/operators';
import { UiInputComponent } from '../../../../shared/components/ui/ui-input/ui-input.component';
import { UiSelectComponent, SelectOption } from '../../../../shared/components/ui/ui-select/ui-select.component';

@Component({
  selector: 'app-batch-form',
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
          <p class="text-xs font-semibold text-slate-600 mt-2">Basic Details</p>
        </div>
        <div class="flex-1">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                 [ngClass]="currentStep >= 2 ? 'bg-rsldc-navy text-white' : 'bg-slate-200 text-slate-500'">2</div>
            <div class="flex-1 h-1 mx-2" [ngClass]="currentStep >= 3 ? 'bg-rsldc-navy' : 'bg-slate-200'"></div>
          </div>
          <p class="text-xs font-semibold text-slate-600 mt-2">Dates & Strength</p>
        </div>
        <div class="flex-1">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                 [ngClass]="currentStep >= 3 ? 'bg-rsldc-navy text-white' : 'bg-slate-200 text-slate-500'">3</div>
            <div class="flex-1 h-1 mx-2" [ngClass]="currentStep >= 4 ? 'bg-rsldc-navy' : 'bg-slate-200'"></div>
          </div>
          <p class="text-xs font-semibold text-slate-600 mt-2">Faculty & Docs</p>
        </div>
        <div>
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                 [ngClass]="currentStep >= 4 ? 'bg-rsldc-navy text-white' : 'bg-slate-200 text-slate-500'">4</div>
          </div>
          <p class="text-xs font-semibold text-slate-600 mt-2">Review</p>
        </div>
      </div>

      <form [formGroup]="batchForm">
        
        <!-- STEP 1: BASIC DETAILS -->
        <div *ngIf="currentStep === 1" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Section A: Basic Details</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <app-ui-select
              formControlName="sdcId"
              label="Select Skill Development Center (SDC)"
              [required]="true"
              [options]="(sdcOptions$ | async) || []">
            </app-ui-select>

            <div>
              <app-ui-select
                formControlName="courseId"
                label="Course"
                [required]="true"
                [options]="(courseOptions$ | async) || []">
              </app-ui-select>
              <p *ngIf="batchForm.get('sdcId')?.value && (courseOptions$ | async)?.length === 0" class="text-xs text-amber-600 mt-1">
                No approved courses available for this SDC.
              </p>
            </div>

            <div class="md:col-span-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" formControlName="isResidential" class="w-4 h-4 text-rsldc-navy rounded border-slate-300 focus:ring-rsldc-navy">
                <span class="text-sm font-semibold text-slate-700">Residential Course (Requires Hostel Details)</span>
              </label>
            </div>
          </div>
        </div>

        <!-- STEP 2: DATES & STRENGTH -->
        <div *ngIf="currentStep === 2" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Section B & C: Dates & Batch Strength</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <app-ui-input
              formControlName="startDate"
              type="date"
              label="Batch Start Date"
              [required]="true">
            </app-ui-input>
            
            <app-ui-input
              formControlName="endDate"
              type="date"
              label="Batch End Date"
              [required]="true">
            </app-ui-input>
            
            <app-ui-input
              formControlName="strength"
              type="number"
              label="Target Strength"
              [required]="true"
              placeholder="Max 30">
            </app-ui-input>
          </div>
        </div>

        <!-- STEP 3: FACULTY & DOCS -->
        <div *ngIf="currentStep === 3" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Section D: Faculty Details</h2>
          
          <div class="border border-slate-200 rounded-lg p-6 bg-slate-50 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-ui-input
                formControlName="facultyName"
                label="Primary Faculty Name"
                [required]="true"
                placeholder="e.g. Rahul Sharma">
              </app-ui-input>
              
              <app-ui-input
                formControlName="qualification"
                label="Qualification"
                [required]="true"
                placeholder="e.g. BCA, MCA">
              </app-ui-input>
            </div>
          </div>

          <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition cursor-pointer">
            <svg class="w-10 h-10 text-slate-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <p class="text-sm font-bold text-rsldc-navy">Click to upload Batch Schedule / Trainer Docs</p>
          </div>
        </div>

        <!-- STEP 4: REVIEW -->
        <div *ngIf="currentStep === 4" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Review & Submit</h2>
          
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
            <div class="flex justify-between border-b border-slate-200 pb-2">
              <span class="text-sm font-semibold text-slate-600">Selected SDC</span>
              <span class="text-sm font-bold text-rsldc-navy">{{ batchForm.value.sdcId || 'N/A' }}</span>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-2">
              <span class="text-sm font-semibold text-slate-600">Course</span>
              <span class="text-sm font-bold text-rsldc-navy">{{ batchForm.value.courseId || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-semibold text-slate-600">Target Strength</span>
              <span class="text-sm font-bold text-rsldc-navy">{{ batchForm.value.strength || 0 }} Aspirants</span>
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800 text-sm">
            <svg class="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <div>
              <strong>Declaration:</strong> I certify that all information provided is accurate. Submitting will send this to the department for verification and approval.
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
          [disabled]="isCurrentStepInvalid()"
          class="px-6 py-2 bg-rsldc-navy text-white rounded-lg font-bold text-sm hover:bg-rsldc-navyLight transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
          Continue
        </button>
        
        <button 
          *ngIf="currentStep === 4" 
          (click)="onSubmit()"
          class="px-6 py-2 bg-approve-700 text-white rounded-lg font-bold text-sm hover:bg-green-800 transition shadow-md flex items-center gap-2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          Submit Batch
        </button>
      </div>

    </div>
  `
})
export class BatchFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sdcService = inject(SdcService);
  private courseService = inject(CourseProposalService);
  @Output() formSubmit = new EventEmitter<any>();

  currentStep = 1;

  batchForm: FormGroup = this.fb.group({
    sdcId: ['', Validators.required],
    courseId: ['', Validators.required],
    isResidential: [false],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    strength: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
    facultyName: ['', Validators.required],
    qualification: ['', Validators.required]
  });

  sdcOptions$!: Observable<SelectOption[]>;
  courseOptions$!: Observable<SelectOption[]>;

  ngOnInit() {
    this.sdcOptions$ = this.sdcService.sdcs$.pipe(
      map(sdcs => (sdcs || [])
        .filter(sdc => sdc.status === 'APPROVED')
        .map(sdc => ({ label: `${sdc.name} (${sdc.sdcCode})`, value: sdc.id }))
      )
    );

    this.courseOptions$ = this.batchForm.get('sdcId')!.valueChanges.pipe(
      startWith(this.batchForm.get('sdcId')!.value),
      switchMap(sdcId => {
        if (!sdcId) return of([]);
        return this.courseService.getProposalsBySdc(sdcId).pipe(
          map(courses => courses
            .filter(c => c.status === 'APPROVED')
            .map(c => ({ label: `${c.courseName} (${c.courseCode})`, value: c.id }))
          )
        );
      })
    );
    
    // Reset course when SDC changes
    this.batchForm.get('sdcId')!.valueChanges.subscribe(() => {
      this.batchForm.get('courseId')!.setValue('');
    });
  }

  isCurrentStepInvalid(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.batchForm.get('sdcId')!.invalid || this.batchForm.get('courseId')!.invalid;
      case 2:
        return this.batchForm.get('startDate')!.invalid || this.batchForm.get('endDate')!.invalid || this.batchForm.get('strength')!.invalid;
      case 3:
        return this.batchForm.get('facultyName')!.invalid || this.batchForm.get('qualification')!.invalid;
      default:
        return false;
    }
  }

  nextStep() {
    if (this.currentStep < 4 && !this.isCurrentStepInvalid()) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  onSubmit() {
    this.formSubmit.emit(this.batchForm.value);
  }
}
