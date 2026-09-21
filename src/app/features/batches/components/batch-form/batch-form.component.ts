import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiInputComponent } from '../../../../shared/components/ui/ui-input/ui-input.component';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent],
  template: `
    <div class="bg-white rounded-xl shadow-2xs border border-slate-200 p-6 font-sans">
      <form [formGroup]="batchForm" (ngSubmit)="onSubmit()">
        
        <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Basic Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <app-ui-input formControlName="tpName" label="TP Name" [required]="true"></app-ui-input>
          <app-ui-input formControlName="schemeName" label="Scheme Name" [required]="true"></app-ui-input>
          <app-ui-input formControlName="sdcCode" label="SDC Code" [required]="true"></app-ui-input>
          <app-ui-input formControlName="sector" label="Sector" [required]="true"></app-ui-input>
          <app-ui-input formControlName="batchCode" label="Batch Code (Auto-generated)" [disabled]="true"></app-ui-input>
          <app-ui-input formControlName="course" label="Course" [required]="true"></app-ui-input>
          
          <div class="md:col-span-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" formControlName="isResidential" class="w-4 h-4 text-rsldc-navy rounded border-slate-300">
              <span class="text-sm font-semibold text-slate-700">Residential Course</span>
            </label>
          </div>
        </div>

        <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Batch Strength & Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <app-ui-input formControlName="minStrength" type="number" label="Batch Minimum Strength" [required]="true"></app-ui-input>
          <app-ui-input formControlName="maxStrength" type="number" label="Batch Maximum Strength" [required]="true"></app-ui-input>
          <app-ui-input formControlName="nipaNo" label="N IPA No"></app-ui-input>
          <app-ui-input formControlName="psdStatus" label="PSD Status"></app-ui-input>
          <app-ui-input formControlName="paymentStatus" label="Payment Status"></app-ui-input>
          <app-ui-input formControlName="totalTrained" type="number" label="Total No of Youth Trained"></app-ui-input>
          <app-ui-input formControlName="totalPlaced" type="number" label="Total No of Youth Placed"></app-ui-input>
        </div>

        <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Dates & Timings</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <app-ui-input formControlName="durationHrs" type="number" label="Batch Duration (Hrs)"></app-ui-input>
          <app-ui-input formControlName="startDate" type="date" label="Batch Start Date" [required]="true"></app-ui-input>
          <app-ui-input formControlName="freezeDate" type="date" label="Batch Freeze Date"></app-ui-input>
          <app-ui-input formControlName="endDate" type="date" label="Batch End Date" [required]="true"></app-ui-input>
          <app-ui-input formControlName="startTime" type="time" label="Batch Start Time" [required]="true"></app-ui-input>
          <app-ui-input formControlName="endTime" type="time" label="Batch End Time" [required]="true"></app-ui-input>
        </div>

        <!-- Faculty Details -->
        <div class="mb-8">
          <div class="flex justify-between items-center border-b pb-2 mb-4">
            <h2 class="text-lg font-bold text-rsldc-navy">Faculty Details</h2>
            <button type="button" (click)="addFaculty()" class="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-200">+ Add Faculty</button>
          </div>
          <div formArrayName="facultyDetails" class="space-y-4">
            <div *ngFor="let faculty of facultyFormArray.controls; let i=index" [formGroupName]="i" class="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <app-ui-input formControlName="name" label="Name of Faculty" class="flex-1"></app-ui-input>
              <app-ui-input formControlName="type" label="Type" class="flex-1"></app-ui-input>
              <app-ui-input formControlName="qualification" label="Qualification" class="flex-1"></app-ui-input>
              <app-ui-input formControlName="experience" label="Experience (Yrs)" type="number" class="w-24"></app-ui-input>
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
              <app-ui-input formControlName="hostelCode" label="Hostel Code" class="w-32"></app-ui-input>
              <app-ui-input formControlName="type" label="Type" class="w-32"></app-ui-input>
              <app-ui-input formControlName="capacity" type="number" label="Capacity" class="w-24"></app-ui-input>
              <app-ui-input formControlName="address" label="Hostel Address" class="flex-1"></app-ui-input>
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
          <button type="submit" [disabled]="batchForm.invalid" class="px-6 py-2 bg-rsldc-navy text-white rounded-lg font-bold text-sm hover:bg-rsldc-navyLight transition shadow-md disabled:opacity-50">
            Submit Batch Details
          </button>
        </div>
      </form>
    </div>
  `
})
export class BatchFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  @Output() formSubmit = new EventEmitter<any>();

  batchForm: FormGroup = this.fb.group({
    tpName: ['', Validators.required],
    schemeName: ['', Validators.required],
    sdcCode: ['', Validators.required],
    sector: ['', Validators.required],
    batchCode: [{value: 'BTH-' + Math.floor(Math.random() * 10000), disabled: true}],
    course: ['', Validators.required],
    isResidential: [false],
    minStrength: ['', Validators.required],
    maxStrength: ['', Validators.required],
    nipaNo: [''],
    psdStatus: [''],
    paymentStatus: [''],
    totalTrained: [''],
    totalPlaced: [''],
    durationHrs: [''],
    startDate: ['', Validators.required],
    freezeDate: [''],
    endDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    comments: [''],
    facultyDetails: this.fb.array([]),
    hostelDetails: this.fb.array([])
  });

  ngOnInit() {
    this.addFaculty();
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
    if (this.batchForm.valid) {
      this.formSubmit.emit(this.batchForm.getRawValue());
    }
  }
}
