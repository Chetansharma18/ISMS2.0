import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseProposalService, CourseProposal } from '../../../../core/services/course-proposal.service';
import { Observable } from 'rxjs';
import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';

export interface SchemeCourse {
  code: string;
  name: string;
  sector?: string;
  nsqfLevel: string;
  duration: string;
  scheme: string;
}

@Component({
  selector: 'app-sdc-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, FormSelectComponent],
  template: `
    <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 font-sans relative overflow-hidden">
      <!-- Decorative background accent -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-rsldc-navy/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <!-- Stepper Header (Clickable Steps 1, 2, 3, 4) -->
      <div class="flex items-center justify-between mb-10 relative z-10">
        <div (click)="goToStep(1)" class="flex-1 group cursor-pointer hover:opacity-80 transition-all" title="Go to Step 1: Organization">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300"
                 [ngClass]="currentStep >= 1 ? 'bg-rsldc-navy text-white shadow-rsldc-navy/30' : 'bg-slate-100 text-slate-400 border border-slate-200'">1</div>
            <div class="flex-1 h-1.5 mx-3 rounded-full transition-all duration-300" 
                 [ngClass]="currentStep >= 2 ? 'bg-rsldc-navy' : 'bg-slate-100'"></div>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider mt-3 transition-colors duration-300"
             [ngClass]="currentStep >= 1 ? 'text-rsldc-navy' : 'text-slate-400'">1. Organization</p>
        </div>

        <div (click)="goToStep(2)" class="flex-1 group cursor-pointer hover:opacity-80 transition-all" title="Go to Step 2: Location & Details">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300"
                 [ngClass]="currentStep >= 2 ? 'bg-rsldc-navy text-white shadow-rsldc-navy/30' : 'bg-slate-100 text-slate-400 border border-slate-200'">2</div>
            <div class="flex-1 h-1.5 mx-3 rounded-full transition-all duration-300" 
                 [ngClass]="currentStep >= 3 ? 'bg-rsldc-navy' : 'bg-slate-100'"></div>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider mt-3 transition-colors duration-300"
             [ngClass]="currentStep >= 2 ? 'text-rsldc-navy' : 'text-slate-400'">2. Location & Details</p>
        </div>

        <div (click)="goToStep(3)" class="flex-1 group cursor-pointer hover:opacity-80 transition-all" title="Go to Step 3: Courses & Docs">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300"
                 [ngClass]="currentStep >= 3 ? 'bg-rsldc-navy text-white shadow-rsldc-navy/30' : 'bg-slate-100 text-slate-400 border border-slate-200'">3</div>
            <div class="flex-1 h-1.5 mx-3 rounded-full transition-all duration-300" 
                 [ngClass]="currentStep >= 4 ? 'bg-rsldc-navy' : 'bg-slate-100'"></div>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider mt-3 transition-colors duration-300"
             [ngClass]="currentStep >= 3 ? 'text-rsldc-navy' : 'text-slate-400'">3. Courses & Docs</p>
        </div>

        <div (click)="goToStep(4)" class="group cursor-pointer hover:opacity-80 transition-all" title="Go to Step 4: Review">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300"
                 [ngClass]="currentStep >= 4 ? 'bg-rsldc-navy text-white shadow-rsldc-navy/30' : 'bg-slate-100 text-slate-400 border border-slate-200'">4</div>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider mt-3 transition-colors duration-300"
             [ngClass]="currentStep >= 4 ? 'text-rsldc-navy' : 'text-slate-400'">4. Review</p>
        </div>
      </div>

      <form [formGroup]="sdcForm" class="relative z-10">
        
        <!-- STEP 1: ORGANIZATION -->
        <div *ngIf="currentStep === 1" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <h2 class="text-xl font-bold text-slate-800">Organization Details</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <app-form-select
              formControlName="schemeId"
              label="Scheme"
              [required]="true"
              placeholder="Select Scheme"
              [options]="schemeOptions">
            </app-form-select>

            <app-form-input
              formControlName="name"
              label="SDC Name"
              [required]="true"
              placeholder="e.g. Jaipur Excellence Center">
            </app-form-input>

            <app-form-input
              formControlName="mouNo"
              label="MoU Reference No."
              [required]="true"
              placeholder="MOU/2026/001">
            </app-form-input>
            <app-form-input
              formControlName="tpName"
              label="TP Name"
              [required]="true"
              placeholder="e.g. SkillMasters Rajasthan">
            </app-form-input>

            <app-form-input
              formControlName="sdcCode"
              label="SDC Code"
              [required]="true"
              placeholder="e.g. SDC-001">
            </app-form-input>

            <app-form-input
              formControlName="proposedStartDate"
              type="date"
              label="Proposed Start Date"
              [required]="true">
            </app-form-input>

            <app-form-input
              formControlName="totalTrained"
              type="number"
              label="Total Trained Aspirants"
              placeholder="e.g. 500">
            </app-form-input>

            <app-form-input
              formControlName="totalPlaced"
              type="number"
              label="Total TP Placed Aspirants"
              placeholder="e.g. 400">
            </app-form-input>
            </div>
          </div>
        </div>

        <!-- STEP 2: LOCATION & DETAILS -->
        <div *ngIf="currentStep === 2" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8 mb-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <h2 class="text-xl font-bold text-slate-800">Location and Centre Details</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            <app-form-select
              label="State"
              [required]="true"
              [options]="['Rajasthan']"
              placeholder="Rajasthan"
              [disabled]="true"
              class="w-full">
            </app-form-select>

            <app-form-select
              formControlName="district"
              label="District"
              [required]="true"
              placeholder="Select District"
              [options]="districtOptions">
            </app-form-select>

            <app-form-input
              formControlName="assemblyConstituency"
              label="Assembly Constituency"
              placeholder="Select Assembly Constituency">
            </app-form-input>

            <app-form-input
              formControlName="parliamentConstituency"
              label="Parliament Constituency"
              placeholder="Select Parliament Constituency">
            </app-form-input>

            <app-form-input
              formControlName="division"
              label="Division"
              placeholder="Select Division">
            </app-form-input>

            <app-form-input
              formControlName="block"
              label="Block"
              placeholder="Select Block">
            </app-form-input>

            <app-form-input
              formControlName="capacity"
              type="number"
              label="SDC Capacity"
              [required]="true"
              placeholder="Max students">
            </app-form-input>

            <app-form-input
              formControlName="centerEmail"
              type="email"
              label="Center Email"
              [required]="true"
              placeholder="center@example.com">
            </app-form-input>
            
            <app-form-input
              formControlName="pincode"
              type="text"
              label="Pincode"
              [required]="true"
              placeholder="e.g. 302001">
            </app-form-input>

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
              <app-form-input
                formControlName="latitude"
                label="Latitude"
                [required]="true"
                placeholder="e.g. 26.9124">
              </app-form-input>
              <app-form-input
                formControlName="longitude"
                label="Longitude"
                [required]="true"
                placeholder="e.g. 75.7873">
              </app-form-input>
            </div>
          </div>
        </div>

        <!-- STEP 3: SCHEME-FILTERED COURSES & DOCS -->
        <div *ngIf="currentStep === 3" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8 mb-6">
            <div class="flex items-center justify-between gap-3 mb-6 border-b border-slate-200 pb-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-slate-800">Section D: Courses Available</h2>
                  <p class="text-xs text-slate-500 font-medium mt-0.5">Approved courses for scheme: <strong class="text-[#131A4D] font-bold">{{ selectedSchemeName }}</strong></p>
                </div>
              </div>
              <span class="px-3 py-1 bg-blue-50 text-[#131A4D] border border-blue-200 font-bold rounded text-xs">
                {{ availableSchemeCourses.length }} Course(s) Available
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Step 1: Select Sector -->
              <div>
                <label class="block font-semibold text-slate-700 text-xs tracking-wide mb-2">
                  Select Sector for {{ selectedSchemeName }} <span class="text-red-500">*</span>
                </label>
                
                <select 
                  [value]="selectedSector"
                  (change)="onSectorChange($event)" 
                  class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#131A4D] focus:border-[#131A4D] shadow-xs cursor-pointer transition">
                  <option value="">-- Choose Sector --</option>
                  <option *ngFor="let sec of availableSectors" [value]="sec">
                    {{ sec }}
                  </option>
                </select>
                <p class="text-[11px] text-slate-400 mt-1.5">Select a sector under {{ selectedSchemeName }} scheme.</p>
              </div>

              <!-- Step 2: Select Course for Sector -->
              <div>
                <label class="block font-semibold text-slate-700 text-xs tracking-wide mb-2">
                  Select Course for Sector <span class="text-red-500">*</span>
                </label>
                
                <select 
                  [disabled]="!selectedSector"
                  (change)="onCourseDropdownSelect($event)" 
                  class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#131A4D] focus:border-[#131A4D] shadow-xs cursor-pointer transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                  <option value="" disabled selected>
                    {{ selectedSector ? '-- Select Course for ' + selectedSector + ' --' : '-- Select Sector First --' }}
                  </option>
                  <option *ngFor="let course of availableCoursesForSector" [value]="course.code">
                    {{ course.name }} (QP Code: {{ course.code }}) • {{ course.nsqfLevel }} • {{ course.duration }}
                  </option>
                </select>
                <p class="text-[11px] text-slate-400 mt-1.5">
                  {{ selectedSector ? 'Pick course to allocate to SDC center.' : 'Select sector first to enable course selection.' }}
                </p>
              </div>
            </div>

            <!-- Selected Courses List -->
            <div *ngIf="selectedCourseObjects.length > 0" class="mt-4 pt-4 border-t border-slate-200">
              <h4 class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Selected Approved Course(s) ({{ selectedCourseObjects.length }}):</h4>
              <div class="space-y-3">
                <div *ngFor="let course of selectedCourseObjects" 
                     class="flex items-center justify-between p-3.5 bg-white border border-[#131A4D]/30 rounded-xl shadow-xs">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-[#131A4D]/10 text-[#131A4D] flex items-center justify-center font-bold text-xs shrink-0">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-800 text-sm">{{ course.name }}</span>
                        <span class="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-[#131A4D] rounded border border-blue-200">{{ course.nsqfLevel }}</span>
                        <span *ngIf="course.sector" class="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 rounded border border-slate-200 uppercase">{{ course.sector }}</span>
                      </div>
                      <p class="text-xs text-slate-500 font-mono mt-0.5">QP Code: <strong class="text-slate-800">{{ course.code }}</strong> • Duration: {{ course.duration }}</p>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    (click)="removeSelectedCourse(course.code)"
                    class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition flex items-center gap-1 cursor-pointer shrink-0"
                    title="Remove course">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    Remove
                  </button>
                </div>
              </div>
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
        <div *ngIf="currentStep === 4" class="animate-in fade-in slide-in-from-right-4 duration-300">
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
          class="px-6 py-2.5 border border-slate-300 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm outline-none">
          Back
        </button>
        <div *ngIf="currentStep === 1"></div>

        <button 
          *ngIf="currentStep < 4" 
          (click)="nextStep()"
          class="px-8 py-2.5 bg-rsldc-navy text-white rounded-xl font-bold text-sm hover:bg-[#0f1540] transition-all shadow-md hover:shadow-lg outline-none flex items-center gap-2 cursor-pointer">
          Continue to Step {{ currentStep + 1 }}
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
        
        <button 
          *ngIf="currentStep === 4" 
          (click)="onSubmit()"
          class="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 outline-none cursor-pointer">
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

  schemeOptions: string[] = [
    'SAMARTH (State Fund)',
    'MMKVY (State Fund)',
    'PMKVY (Central Fund)',
    'RAJKViK (Category I)',
    'MNSKSY',
    'ELSTP'
  ];

  districtOptions: string[] = [
    'Jaipur',
    'Ajmer',
    'Jodhpur',
    'Kota',
    'Udaipur'
  ];

  coursesByScheme: Record<string, SchemeCourse[]> = {
    'MMKVY': [
      { code: 'SSC/Q2212', name: 'Domestic Data Entry Operator', sector: 'IT & ITeS', nsqfLevel: 'NSQF 4', duration: '400 Hrs', scheme: 'MMKVY' },
      { code: 'AAS/Q6301', name: 'Drone Operator - Multi Rotor', sector: 'Aerospace & Aviation', nsqfLevel: 'NSQF 4', duration: '430 Hrs', scheme: 'MMKVY' },
      { code: 'ASC/Q1401', name: 'Automotive Service Technician', sector: 'Automotive', nsqfLevel: 'NSQF 4', duration: '450 Hrs', scheme: 'MMKVY' },
      { code: 'AGR/N0856', name: 'Design and Construct Vertical Garden', sector: 'Agriculture', nsqfLevel: 'NSQF 4', duration: '137 Hrs', scheme: 'MMKVY' },
      { code: 'CSC/Q0115', name: 'CNC Operator Turning', sector: 'Capital Goods', nsqfLevel: 'NSQF 4', duration: '610 Hrs', scheme: 'MMKVY' },
      { code: 'SSC/Q8113', name: 'AI - Machine Learning Engineer', sector: 'IT & ITeS', nsqfLevel: 'NSQF 5', duration: '580 Hrs', scheme: 'MMKVY' },
      { code: 'ELE/Q4605', name: 'CCTV Installation Technician', sector: 'Electronics', nsqfLevel: 'NSQF 4', duration: '700 Hrs', scheme: 'MMKVY' }
    ],
    'RAJKVIK': [
      { code: 'AAS/Q6301', name: 'Drone Operator - Multi Rotor', sector: 'Aerospace & Aviation', nsqfLevel: 'NSQF 4', duration: '430 Hrs', scheme: 'RAJKViK' },
      { code: 'SSC/Q2212', name: 'Domestic Data Entry Operator', sector: 'IT & ITeS', nsqfLevel: 'NSQF 4', duration: '400 Hrs', scheme: 'RAJKViK' },
      { code: 'ASC/Q1401', name: 'Automotive Service Technician', sector: 'Automotive', nsqfLevel: 'NSQF 4', duration: '450 Hrs', scheme: 'RAJKViK' },
      { code: 'ELE/Q5901', name: 'Solar Panel Installation Technician', sector: 'Green Energy', nsqfLevel: 'NSQF 4', duration: '300 Hrs', scheme: 'RAJKViK' },
      { code: 'CON/Q0602', name: 'Assistant Electrician', sector: 'Construction', nsqfLevel: 'NSQF 3', duration: '460 Hrs', scheme: 'RAJKViK' },
      { code: 'CSC/Q0417', name: 'CNC Milling', sector: 'Capital Goods', nsqfLevel: 'NSQF 4.5', duration: '670 Hrs', scheme: 'RAJKViK' }
    ],
    'MNSKSY': [
      { code: 'CSC/Q0115', name: 'CNC Operator Turning', sector: 'Capital Goods', nsqfLevel: 'NSQF 4', duration: '610 Hrs', scheme: 'MNSKSY' },
      { code: 'AMH/Q1947', name: 'Sewing Machine Operator', sector: 'Apparel', nsqfLevel: 'NSQF 3', duration: '240 Hrs', scheme: 'MNSKSY' },
      { code: 'IND/Q0102', name: 'Quality Control Inspector', sector: 'Capital Goods', nsqfLevel: 'NSQF 4', duration: '320 Hrs', scheme: 'MNSKSY' },
      { code: 'BSC/Q8103', name: 'Accounts Assistant', sector: 'BFSI', nsqfLevel: 'NSQF 4', duration: '580 Hrs', scheme: 'MNSKSY' },
      { code: 'LSC/Q6301', name: 'Air Cargo Booking Executive', sector: 'Logistics', nsqfLevel: 'NSQF 4', duration: '550 Hrs', scheme: 'MNSKSY' }
    ],
    'SAMARTH': [
      { code: 'ELE/Q5901', name: 'Solar Panel Installation Technician', sector: 'Green Energy', nsqfLevel: 'NSQF 4', duration: '300 Hrs', scheme: 'SAMARTH' },
      { code: 'AMH/Q1947', name: 'Sewing Machine Operator', sector: 'Apparel', nsqfLevel: 'NSQF 3', duration: '240 Hrs', scheme: 'SAMARTH' },
      { code: 'TEX/Q1002', name: 'Handicrafts & Embroidery Worker', sector: 'Textiles', nsqfLevel: 'NSQF 3', duration: '200 Hrs', scheme: 'SAMARTH' },
      { code: 'BWW/Q0101', name: 'Beauty Therapist & Wellness Specialist', sector: 'Beauty & Wellness', nsqfLevel: 'NSQF 4', duration: '350 Hrs', scheme: 'SAMARTH' },
      { code: 'PSC/Q0101', name: 'Plumber General & Sanitation', sector: 'Plumbing', nsqfLevel: 'NSQF 4', duration: '300 Hrs', scheme: 'SAMARTH' },
      { code: 'ELE/Q6001', name: 'Electrician Domestic Solutions', sector: 'Electronics', nsqfLevel: 'NSQF 4', duration: '350 Hrs', scheme: 'SAMARTH' }
    ],
    'PMKVY': [
      { code: 'HSS/Q5101', name: 'General Duty Assistant (Healthcare)', sector: 'Healthcare', nsqfLevel: 'NSQF 4', duration: '400 Hrs', scheme: 'PMKVY' },
      { code: 'ELE/Q4601', name: 'Field Technician - Computing and Peripherals', sector: 'Electronics', nsqfLevel: 'NSQF 4', duration: '350 Hrs', scheme: 'PMKVY' },
      { code: 'SSC/Q0701', name: 'Customer Care Executive (BPO)', sector: 'IT & ITeS', nsqfLevel: 'NSQF 4', duration: '300 Hrs', scheme: 'PMKVY' },
      { code: 'RAS/Q0104', name: 'Retail Sales Associate', sector: 'Retail', nsqfLevel: 'NSQF 3', duration: '280 Hrs', scheme: 'PMKVY' },
      { code: 'CON/Q0203', name: 'Bar Bender and Steel Fixer', sector: 'Construction', nsqfLevel: 'NSQF 3.5', duration: '550 Hrs', scheme: 'PMKVY' }
    ],
    'ELSTP': [
      { code: 'TEL/Q0102', name: 'Broadband Technician', sector: 'Telecom', nsqfLevel: 'NSQF 4', duration: '610 Hrs', scheme: 'ELSTP' },
      { code: 'ELE/Q3122', name: 'Assistant Technician - CCTV', sector: 'Electronics', nsqfLevel: 'NSQF 3', duration: '310 Hrs', scheme: 'ELSTP' },
      { code: 'CSC/Q0401', name: 'CNC Programmer', sector: 'Capital Goods', nsqfLevel: 'NSQF 5', duration: '640 Hrs', scheme: 'ELSTP' },
      { code: 'SSC/Q2202', name: 'Associate Customer Care', sector: 'IT & ITeS', nsqfLevel: 'NSQF 4', duration: '490 Hrs', scheme: 'ELSTP' }
    ]
  };

  sdcForm: FormGroup = this.fb.group({
    schemeId: ['SAMARTH (State Fund)'],
    name: ['Jaipur Excellence Center'],
    mouNo: ['MOU/2026/001'],
    tpName: ['SkillMasters Rajasthan'],
    sdcCode: ['SDC-001'],
    proposedStartDate: ['2026-10-01'],
    totalTrained: [500],
    totalPlaced: [400],
    district: ['Jaipur'],
    assemblyConstituency: ['Sanganer'],
    parliamentConstituency: ['Jaipur Rural'],
    division: ['Jaipur'],
    block: ['Jaipur'],
    capacity: [100],
    centerEmail: ['center@jaipur.org'],
    address: ['Plot 42, Skill Industrial Area, Sanganer, Jaipur'],
    pincode: ['302029'],
    remarks: ['Ready for auditor inspection'],
    latitude: [26.9124],
    longitude: [75.7873],
    courses: [['ELE/Q5901']],
    tpRecommendation: ['']
  });

  get sdcFormControls() {
    return this.sdcForm.controls;
  }

  get selectedSchemeName(): string {
    const raw = this.sdcForm.get('schemeId')?.value || 'SAMARTH';
    if (raw.includes('MMKVY')) return 'MMKVY';
    if (raw.includes('SAMARTH')) return 'SAMARTH';
    if (raw.includes('PMKVY')) return 'PMKVY';
    if (raw.includes('RAJKViK') || raw.includes('RAJKVIK')) return 'RAJKVIK';
    if (raw.includes('MNSKSY')) return 'MNSKSY';
    if (raw.includes('ELSTP')) return 'ELSTP';
    return 'SAMARTH';
  }

  selectedSector: string = '';

  get availableSchemeCourses(): SchemeCourse[] {
    const key = this.selectedSchemeName;
    return this.coursesByScheme[key] || this.coursesByScheme['SAMARTH'];
  }

  get availableSectors(): string[] {
    const courses = this.availableSchemeCourses;
    const sectors = new Set<string>();
    courses.forEach(c => {
      if (c.sector) sectors.add(c.sector);
    });
    return Array.from(sectors).sort();
  }

  get availableCoursesForSector(): SchemeCourse[] {
    const courses = this.availableSchemeCourses;
    if (!this.selectedSector) return courses; // If no sector selected, show all scheme courses
    return courses.filter(c => c.sector === this.selectedSector);
  }

  onSectorChange(event: Event) {
    const selectElem = event.target as HTMLSelectElement;
    this.selectedSector = selectElem.value;
  }

  get selectedCourseObjects(): SchemeCourse[] {
    const selectedCodes: string[] = this.sdcForm.get('courses')?.value || [];
    const available = this.availableSchemeCourses;
    return available.filter(c => selectedCodes.includes(c.code));
  }

  onCourseDropdownSelect(event: Event) {
    const selectElem = event.target as HTMLSelectElement;
    const selectedCode = selectElem.value;
    if (selectedCode) {
      const current = this.sdcForm.get('courses')?.value || [];
      const currentCourses: string[] = Array.isArray(current) ? [...current] : [];
      if (!currentCourses.includes(selectedCode)) {
        currentCourses.push(selectedCode);
        this.sdcForm.get('courses')?.setValue(currentCourses);
        this.sdcForm.get('courses')?.markAsDirty();
      }
      selectElem.value = ''; // Reset dropdown to placeholder after selection
    }
  }

  removeSelectedCourse(courseCode: string) {
    const current = this.sdcForm.get('courses')?.value || [];
    const currentCourses: string[] = Array.isArray(current) ? [...current] : [];
    const updated = currentCourses.filter(c => c !== courseCode);
    this.sdcForm.get('courses')?.setValue(updated);
    this.sdcForm.get('courses')?.markAsDirty();
  }

  ngOnInit() {
    // Watch scheme changes to ensure selected courses align with new scheme
    this.sdcForm.get('schemeId')?.valueChanges.subscribe(() => {
      this.selectedSector = ''; // Reset sector selection on scheme change
      const available = this.availableSchemeCourses;
      if (available && available.length > 0) {
        const currentSelected = this.sdcForm.get('courses')?.value || [];
        const validForScheme = Array.isArray(currentSelected) 
          ? currentSelected.filter((code: string) => available.some(c => c.code === code))
          : [];
        if (validForScheme.length > 0) {
          this.sdcForm.get('courses')?.setValue(validForScheme);
        } else {
          // Pre-select first course of the selected scheme
          this.sdcForm.get('courses')?.setValue([available[0].code]);
        }
      }
    });
  }

  goToStep(step: number) {
    if (step >= 1 && step <= 4) {
      this.currentStep = step;
    }
  }

  isCourseSelected(courseCode: string): boolean {
    const courses = this.sdcForm.get('courses')?.value;
    return Array.isArray(courses) ? courses.includes(courseCode) : false;
  }

  toggleCourse(courseCode: string) {
    const coursesControl = this.sdcForm.get('courses');
    const current = coursesControl?.value;
    let currentCourses: string[] = Array.isArray(current) ? [...current] : [];
    
    if (currentCourses.includes(courseCode)) {
      currentCourses = currentCourses.filter(c => c !== courseCode);
    } else {
      currentCourses.push(courseCode);
    }
    coursesControl?.setValue(currentCourses);
    coursesControl?.markAsDirty();
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
