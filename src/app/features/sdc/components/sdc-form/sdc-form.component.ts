import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-sdc-form',
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
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Scheme <span class="text-red-500">*</span></label>
              <select formControlName="schemeId" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy bg-slate-50">
                <option value="">Select Scheme</option>
                <option value="SCH-001">SAMARTH (State Fund)</option>
                <option value="SCH-002">PMKVY (Central Fund)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">SDC Name <span class="text-red-500">*</span></label>
              <input formControlName="name" type="text" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy bg-slate-50" placeholder="e.g. Jaipur Excellence Center">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">MoU Reference No. <span class="text-red-500">*</span></label>
              <input formControlName="mouNo" type="text" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy bg-slate-50" placeholder="MOU/2026/001">
            </div>
          </div>
        </div>

        <!-- STEP 2: LOCATION & DETAILS -->
        <div *ngIf="currentStep === 2" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Section B & C: Location and Centre Details</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">State <span class="text-red-500">*</span></label>
              <select class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-100" disabled>
                <option>Rajasthan</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">District <span class="text-red-500">*</span></label>
              <select formControlName="district" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy">
                <option value="">Select District</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Ajmer">Ajmer</option>
                <option value="Jodhpur">Jodhpur</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">SDC Capacity <span class="text-red-500">*</span></label>
              <input formControlName="capacity" type="number" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy" placeholder="Max students">
            </div>
            <div class="md:col-span-3">
              <label class="block text-sm font-semibold text-slate-700 mb-1">Full Address <span class="text-red-500">*</span></label>
              <textarea formControlName="address" rows="2" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy"></textarea>
            </div>
          </div>
        </div>

        <!-- STEP 3: COURSES & DOCS -->
        <div *ngIf="currentStep === 3" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-rsldc-navy border-b pb-2 mb-4">Section D: Courses & Documents</h2>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 class="font-bold text-rsldc-navy text-sm mb-2">Selected Course</h3>
            <div class="flex gap-4">
              <select formControlName="courseId" class="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">Select Course...</option>
                <option value="C-01">Data Entry Operator (IT-ITeS)</option>
                <option value="C-02">Web Developer (IT-ITeS)</option>
              </select>
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
        <div *ngIf="currentStep === 1"></div> <!-- Spacer -->

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
export class SdcFormComponent {
  private fb = inject(FormBuilder);
  @Output() formSubmit = new EventEmitter<any>();

  currentStep = 1;

  sdcForm: FormGroup = this.fb.group({
    schemeId: ['', Validators.required],
    name: ['', Validators.required],
    mouNo: ['', Validators.required],
    district: ['', Validators.required],
    capacity: ['', Validators.required],
    address: ['', Validators.required],
    courseId: ['', Validators.required]
  });

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
