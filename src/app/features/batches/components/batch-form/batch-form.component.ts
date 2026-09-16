import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Select SDC <span class="text-red-500">*</span></label>
              <select formControlName="sdcId" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy bg-slate-50">
                <option value="">Select Approved SDC</option>
                <option value="SDC-0001">Jaipur Excellence Center (SDC-0001)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Course <span class="text-red-500">*</span></label>
              <select formControlName="courseId" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy bg-slate-50">
                <option value="">Select Course</option>
                <option value="C-01">Data Entry Operator</option>
              </select>
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
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Batch Start Date <span class="text-red-500">*</span></label>
              <input formControlName="startDate" type="date" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Batch End Date <span class="text-red-500">*</span></label>
              <input formControlName="endDate" type="date" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Target Strength <span class="text-red-500">*</span></label>
              <input formControlName="strength" type="number" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy" placeholder="Max 30 per batch">
            </div>
          </div>
        </div>

        <!-- STEP 3: FACULTY & DOCS -->
        <div *ngIf="currentStep === 3" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Section D: Faculty Details</h2>
          
          <div class="border border-slate-200 rounded-lg p-4 bg-slate-50 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Faculty Name</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-rsldc-navy" placeholder="Enter name">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-rsldc-navy" placeholder="e.g. BCA, MCA">
              </div>
              <div class="flex items-end">
                <button class="px-4 py-2 bg-rsldc-navy text-white text-sm font-bold rounded-lg w-full hover:bg-rsldc-navyLight transition">Add Faculty</button>
              </div>
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
          class="px-6 py-2 bg-rsldc-navy text-white rounded-lg font-bold text-sm hover:bg-rsldc-navyLight transition shadow-md">
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
export class BatchFormComponent {
  private fb = inject(FormBuilder);
  @Output() formSubmit = new EventEmitter<any>();

  currentStep = 1;

  batchForm: FormGroup = this.fb.group({
    sdcId: ['', Validators.required],
    courseId: ['', Validators.required],
    isResidential: [false],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    strength: ['', [Validators.required, Validators.min(1), Validators.max(30)]]
  });

  nextStep() {
    if (this.currentStep < 4) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  onSubmit() {
    this.formSubmit.emit(this.batchForm.value);
  }
}
