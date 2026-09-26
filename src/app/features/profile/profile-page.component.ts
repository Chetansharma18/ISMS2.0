import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { OtrFormService } from '../registration/services/otr-form.service';
import { OtrValidationService } from '../registration/services/otr-validation.service';
import { FileDoc } from '../registration/models/otr-form.model';
import { DocumentViewerModalComponent } from '../../shared/components/document-viewer-modal/document-viewer-modal.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DocumentViewerModalComponent],
  template: `
    <div class="w-full min-h-full bg-white text-text-primary font-sans pb-10">
      
      <!-- ====================================================================
           CASE 1: INCOMPLETE PROFILE
           ==================================================================== -->
      @if (isProfileIncomplete()) {
        <div class="p-4 sm:p-5 space-y-4 font-sans">
          
          <!-- Single Page Heading -->
          <div class="pb-1 border-b border-slate-200/80">
            <h1 class="font-bold tracking-tight m-0" style="color: #0B3558 !important; font-size: 18px !important; font-weight: 700 !important;">Profile Summary</h1>
          </div>

          <!-- Overview & Action Card -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              <!-- Context & Progress -->
              <div class="flex-1 space-y-3">
                <div>
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight m-0">
                    One Time Registration (OTR)
                  </h2>
                  <p class="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed max-w-2xl m-0 font-normal">
                    Complete all 4 mandatory registration steps to become eligible for scheme proposals.
                  </p>
                </div>

                <!-- Progress Bar -->
                <div class="pt-1 max-w-md">
                  <div class="flex items-center justify-between text-xs font-medium mb-1.5">
                    <span class="text-slate-700 font-semibold">{{ completedSectionsCount() }} of 4 Steps Completed</span>
                    <span class="text-primary font-bold">{{ completionPercentage() }}%</span>
                  </div>
                  <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                      [style.width.%]="completionPercentage()"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Direct CTA Button -->
              <div class="shrink-0 flex items-center">
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="ctaQueryParams()"
                  class="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:brightness-90"
                  style="color: #ffffff !important;"
                >
                  <span class="text-white font-semibold" style="color: #ffffff !important;">{{ ctaText() }}</span>
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>

            </div>
          </div>

          <!-- Registration Steps Cards -->
          <div class="space-y-3">
            <div class="flex items-center justify-between px-0.5">
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider m-0">
                Registration Steps
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              @for (section of sections(); track section.id; let i = $index) {
                <div
                  class="bg-white border rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all hover:border-slate-300 hover:shadow-xs"
                  [class.border-emerald-300]="section.isCompleted"
                  [class.bg-emerald-50/15]="section.isCompleted"
                  [class.border-slate-200]="!section.isCompleted"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3.5">
                      <!-- Step Badge -->
                      <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        [class.bg-emerald-100]="section.isCompleted"
                        [class.text-emerald-700]="section.isCompleted"
                        [class.bg-[#0B3558]/10]="!section.isCompleted && i === completedSectionsCount()"
                        [class.text-[#0B3558]]="!section.isCompleted && i === completedSectionsCount()"
                        [class.bg-slate-100]="!section.isCompleted && i !== completedSectionsCount()"
                        [class.text-slate-600]="!section.isCompleted && i !== completedSectionsCount()"
                      >
                        @if (section.isCompleted) {
                          <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" d="M5 13l4 4L19 7" />
                          </svg>
                        } @else {
                          <span>0{{ section.stepNumber }}</span>
                        }
                      </div>

                      <div>
                        <h4 class="text-sm font-bold text-slate-900 m-0">
                          Step {{ section.stepNumber }}: {{ section.title }}
                        </h4>
                      </div>
                    </div>

                    <!-- Status Pill -->
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold shrink-0"
                      [class.bg-emerald-100]="section.isCompleted"
                      [class.text-emerald-800]="section.isCompleted"
                      [class.bg-slate-100]="!section.isCompleted"
                      [class.text-slate-600]="!section.isCompleted"
                    >
                      {{ section.isCompleted ? 'Completed' : 'Pending' }}
                    </span>
                  </div>

                  <!-- Card Footer Action -->
                  <div class="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <a
                      [routerLink]="['/registration']"
                      [queryParams]="{ step: section.stepNumber }"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
                      [class.text-emerald-700]="section.isCompleted"
                      [class.bg-emerald-50]="section.isCompleted"
                      [class.hover:bg-emerald-100]="section.isCompleted"
                      [class.bg-[#0B3558]]="!section.isCompleted && i === completedSectionsCount()"
                      [class.text-white]="!section.isCompleted && i === completedSectionsCount()"
                      [class.hover:bg-[#123B59]]="!section.isCompleted && i === completedSectionsCount()"
                      [class.text-[#0B3558]]="!section.isCompleted && i !== completedSectionsCount()"
                      [class.hover:bg-slate-100]="!section.isCompleted && i !== completedSectionsCount()"
                      [style.color]="(!section.isCompleted && i === completedSectionsCount()) ? '#ffffff !important' : ''"
                    >
                      <span [style.color]="(!section.isCompleted && i === completedSectionsCount()) ? '#ffffff !important' : ''">
                        {{ section.isCompleted ? 'Review / Edit' : (i === completedSectionsCount() ? 'Continue Step' : 'Start Step') }}
                      </span>
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      } @else {
        <!-- ====================================================================
             CASE 2: COMPLETED PROFILE ACCORDION (Only 1 Step Open at a Time)
             ==================================================================== -->
        <div class="p-4 sm:p-5 space-y-4 font-sans">
          
          <!-- Single Page Heading -->
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
            <h1 class="font-bold tracking-tight m-0" style="color: #0B3558 !important; font-size: 18px !important; font-weight: 700 !important;">Profile Summary</h1>
            <a
              [routerLink]="['/registration']"
              [queryParams]="{ step: 1 }"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs"
            >
              <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Profile</span>
            </a>
          </div>

          <!-- ==================================================================
               ACCORDION CONTAINER: ONLY 1 STEP OPEN AT A TIME
               ================================================================== -->
          <div class="space-y-3 font-sans">
            
            <!-- ACCORDION ITEM 1: Organization Details -->
            <div class="bg-white border rounded-xl overflow-hidden transition-all shadow-2xs" [class.border-[#0B3558]/40]="activeStep() === 1" [class.border-slate-200]="activeStep() !== 1">
              <!-- Accordion Header -->
              <button
                type="button"
                (click)="toggleStep(1)"
                class="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none bg-white hover:bg-slate-50/80"
                [class.bg-slate-50]="activeStep() === 1"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span class="w-7 h-7 rounded-full bg-[#0B3558] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <h3 class="text-xs sm:text-sm font-bold text-[#0B3558] m-0 truncate">
                    Step 1: Organization Details
                  </h3>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <!-- Edit Step Link -->
                  <a
                    [routerLink]="['/registration']"
                    [queryParams]="{ step: 1 }"
                    (click)="$event.stopPropagation()"
                    class="text-xs text-[#0B3558] hover:underline font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-[#0B3558]/5"
                    title="Edit Step 1"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span class="hidden md:inline">Edit</span>
                  </a>
                  <!-- Accordion Chevron Arrow -->
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200/60 transition-transform duration-200" [class.rotate-180]="activeStep() === 1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              <!-- Accordion Body 1 -->
              @if (activeStep() === 1) {
                <div class="p-5 border-t border-slate-100 space-y-4 text-xs font-sans animate-in fade-in duration-150">
                  <!-- Info Fields Grid -->
                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3">
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">TP/PIA Short Name</span>
                      <span class="font-semibold text-slate-800">{{ formData().step1.shortName || '-' }}</span>
                    </div>
                    <div class="sm:col-span-2">
                      <span class="text-slate-400 block text-[11px] font-medium">TP/PIA Full Name</span>
                      <span class="font-semibold text-slate-800">{{ formData().step1.fullName || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Nature of Entity</span>
                      <span class="font-semibold text-slate-800">{{ formData().step1.natureOfEntity || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Registration No. (CIN / Reg No.)</span>
                      <span class="font-mono font-medium text-slate-800">{{ formData().step1.registrationNumber || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Date of Registration</span>
                      <span class="font-medium text-slate-800">{{ formData().step1.dateOfRegistration || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">State/UT of Registration</span>
                      <span class="font-medium text-slate-800">{{ formData().step1.stateOfLegalReg || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Company PAN</span>
                      <span class="font-mono font-semibold text-slate-800">{{ formData().step1.companyPan || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">GST Registered</span>
                      <span class="font-medium text-slate-800">{{ formData().step1.gstRegistered }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">GSTIN</span>
                      <span class="font-mono font-medium text-slate-800">{{ formData().step1.gstRegistered === 'Yes' ? (formData().step1.gstin || '-') : 'Not Applicable' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">MSME Registered</span>
                      <span class="font-medium text-slate-800">{{ formData().step1.msmeRegistered }}</span>
                    </div>
                    @if (formData().step1.msmeRegistered === 'Yes') {
                      <div>
                        <span class="text-slate-400 block text-[11px] font-medium">Udyam Number</span>
                        <span class="font-mono font-medium text-slate-800">{{ formData().step1.udyamNumber || '-' }}</span>
                      </div>
                    }
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">NSDC Partner</span>
                      <span class="font-medium text-slate-800">{{ formData().step1.nsdcPartner || 'Not Applicable' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Company Contact No.</span>
                      <span class="font-medium text-slate-800">{{ formData().step1.contactNo || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Company Email-ID</span>
                      <span class="font-medium text-slate-800">{{ formData().step1.emailId || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Website</span>
                      <span class="font-medium text-slate-800">{{ formData().step1.website || '-' }}</span>
                    </div>
                    <div class="sm:col-span-3">
                      <span class="text-slate-400 block text-[11px] font-medium">Registered Address</span>
                      <span class="font-medium text-slate-800">{{ registeredAddressDisplay() }}</span>
                    </div>
                    <div class="sm:col-span-3">
                      <span class="text-slate-400 block text-[11px] font-medium">Office Address</span>
                      <span class="font-medium text-slate-800">{{ officeAddressDisplay() }}</span>
                    </div>
                  </div>

                  <!-- Documents Preview Bar -->
                  <div class="pt-3 border-t border-slate-100">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Documents</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <ng-container *ngTemplateOutlet="docCard; context: { title: 'Certificate of Registration / Incorporation', doc: formData().step1.registrationCertDoc, defaultName: 'Certificate_of_Incorporation.pdf' }"></ng-container>
                      <ng-container *ngTemplateOutlet="docCard; context: { title: 'Organization PAN Card', doc: formData().step1.panCardDoc, defaultName: 'Company_PAN_Card.pdf' }"></ng-container>
                      @if (formData().step1.gstRegistered === 'Yes') {
                        <ng-container *ngTemplateOutlet="docCard; context: { title: 'GST Registration Certificate', doc: formData().step1.gstCertDoc, defaultName: 'GST_Certificate.pdf' }"></ng-container>
                      }
                      @if (formData().step1.msmeRegistered === 'Yes') {
                        <ng-container *ngTemplateOutlet="docCard; context: { title: 'MSME / Udyam Registration Certificate', doc: formData().step1.msmeCertDoc, defaultName: 'Udyam_Certificate.pdf' }"></ng-container>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- ACCORDION ITEM 2: Authorized Person -->
            <div class="bg-white border rounded-xl overflow-hidden transition-all shadow-2xs" [class.border-[#0B3558]/40]="activeStep() === 2" [class.border-slate-200]="activeStep() !== 2">
              <!-- Accordion Header -->
              <button
                type="button"
                (click)="toggleStep(2)"
                class="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none bg-white hover:bg-slate-50/80"
                [class.bg-slate-50]="activeStep() === 2"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span class="w-7 h-7 rounded-full bg-[#0B3558] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <h3 class="text-xs sm:text-sm font-bold text-[#0B3558] m-0 truncate">
                    Step 2: Authorized Person
                  </h3>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <!-- Edit Step Link -->
                  <a
                    [routerLink]="['/registration']"
                    [queryParams]="{ step: 2 }"
                    (click)="$event.stopPropagation()"
                    class="text-xs text-[#0B3558] hover:underline font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-[#0B3558]/5"
                    title="Edit Step 2"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span class="hidden md:inline">Edit</span>
                  </a>
                  <!-- Accordion Chevron Arrow -->
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200/60 transition-transform duration-200" [class.rotate-180]="activeStep() === 2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              <!-- Accordion Body 2 -->
              @if (activeStep() === 2) {
                <div class="p-5 border-t border-slate-100 space-y-4 text-xs font-sans animate-in fade-in duration-150">
                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Name</span>
                      <span class="font-semibold text-slate-800">{{ formData().step3.name || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Designation</span>
                      <span class="font-medium text-slate-800">{{ formData().step3.designation || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Date of Birth</span>
                      <span class="font-medium text-slate-800">{{ formData().step3.dob || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Age</span>
                      <span class="font-medium text-slate-800">{{ formData().step3.age || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Official Mobile No.</span>
                      <span class="font-medium text-slate-800">{{ formData().step3.mobileNo || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Official Email-ID</span>
                      <span class="font-medium text-slate-800">{{ formData().step3.emailId || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">PAN</span>
                      <span class="font-mono font-semibold text-slate-800">{{ formData().step3.pan || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Aadhaar Number</span>
                      <span class="font-mono font-medium text-slate-800">{{ formData().step3.aadhaarNo || '-' }}</span>
                    </div>
                    <div class="col-span-2 sm:col-span-3 lg:col-span-4">
                      <span class="text-slate-400 block text-[11px] font-medium">Residence Address</span>
                      <span class="font-medium text-slate-800">{{ formData().step3.residenceAddress || '-' }}</span>
                    </div>
                  </div>

                  <!-- Documents Preview Bar -->
                  <div class="pt-3 border-t border-slate-100">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Documents</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <ng-container *ngTemplateOutlet="docCard; context: { title: 'Authorization Letter / Board Resolution', doc: formData().step3.authorizationLetterDoc, defaultName: 'Board_Resolution_Auth.pdf' }"></ng-container>
                      <ng-container *ngTemplateOutlet="docCard; context: { title: 'Identity Proof', doc: formData().step3.idProofDoc, defaultName: 'Signatory_Identity_Proof.pdf' }"></ng-container>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- ACCORDION ITEM 3: Officer In-Charge -->
            <div class="bg-white border rounded-xl overflow-hidden transition-all shadow-2xs" [class.border-[#0B3558]/40]="activeStep() === 3" [class.border-slate-200]="activeStep() !== 3">
              <!-- Accordion Header -->
              <button
                type="button"
                (click)="toggleStep(3)"
                class="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none bg-white hover:bg-slate-50/80"
                [class.bg-slate-50]="activeStep() === 3"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span class="w-7 h-7 rounded-full bg-[#0B3558] text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                  <h3 class="text-xs sm:text-sm font-bold text-[#0B3558] m-0 truncate">
                    Step 3: Officer In-Charge
                  </h3>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <!-- Edit Step Link -->
                  <a
                    [routerLink]="['/registration']"
                    [queryParams]="{ step: 3 }"
                    (click)="$event.stopPropagation()"
                    class="text-xs text-[#0B3558] hover:underline font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-[#0B3558]/5"
                    title="Edit Step 3"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span class="hidden md:inline">Edit</span>
                  </a>
                  <!-- Accordion Chevron Arrow -->
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200/60 transition-transform duration-200" [class.rotate-180]="activeStep() === 3">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              <!-- Accordion Body 3 -->
              @if (activeStep() === 3) {
                <div class="p-5 border-t border-slate-100 space-y-4 text-xs font-sans animate-in fade-in duration-150">
                  <div class="space-y-3">
                    @for (oic of formData().step2; track $index; let idx = $index) {
                      <div class="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-200/60">
                          <div class="flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-[#174A6E] text-white text-[10.5px] font-bold flex items-center justify-center">{{ idx + 1 }}</span>
                            <span class="font-bold text-slate-900 text-sm">{{ oic.name || ('Officer #' + (idx + 1)) }}</span>
                            <span class="text-slate-500 text-xs">({{ oic.designation || 'Designation Not Specified' }})</span>
                          </div>
                          @if (oic.appointmentLetterDoc) {
                            <button
                              type="button"
                              (click)="openDoc(oic.appointmentLetterDoc, 'Appointment Letter - ' + oic.name)"
                              class="text-xs text-[#0483AC] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View Appointment Letter</span>
                            </button>
                          }
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span class="text-slate-400 block text-[11px] font-medium">Mobile Number</span>
                            <span class="font-medium text-slate-800">{{ oic.mobileNo || '-' }}</span>
                          </div>
                          <div>
                            <span class="text-slate-400 block text-[11px] font-medium">Email Address</span>
                            <span class="font-medium text-slate-800">{{ oic.emailId || '-' }}</span>
                          </div>
                          <div>
                            <span class="text-slate-400 block text-[11px] font-medium">PAN</span>
                            <span class="font-mono font-medium text-slate-800">{{ oic.pan || '-' }}</span>
                          </div>
                          <div>
                            <span class="text-slate-400 block text-[11px] font-medium">Aadhaar Number</span>
                            <span class="font-mono font-medium text-slate-800">{{ oic.aadhaarNo || '-' }}</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- ACCORDION ITEM 4: Bank Details -->
            <div class="bg-white border rounded-xl overflow-hidden transition-all shadow-2xs" [class.border-[#0B3558]/40]="activeStep() === 4" [class.border-slate-200]="activeStep() !== 4">
              <!-- Accordion Header -->
              <button
                type="button"
                (click)="toggleStep(4)"
                class="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none bg-white hover:bg-slate-50/80"
                [class.bg-slate-50]="activeStep() === 4"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span class="w-7 h-7 rounded-full bg-[#0B3558] text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
                  <h3 class="text-xs sm:text-sm font-bold text-[#0B3558] m-0 truncate">
                    Step 4: Bank Details
                  </h3>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <!-- Edit Step Link -->
                  <a
                    [routerLink]="['/registration']"
                    [queryParams]="{ step: 4 }"
                    (click)="$event.stopPropagation()"
                    class="text-xs text-[#0B3558] hover:underline font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-[#0B3558]/5"
                    title="Edit Step 4"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span class="hidden md:inline">Edit</span>
                  </a>
                  <!-- Accordion Chevron Arrow -->
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200/60 transition-transform duration-200" [class.rotate-180]="activeStep() === 4">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              <!-- Accordion Body 4 -->
              @if (activeStep() === 4) {
                <div class="p-5 border-t border-slate-100 space-y-4 text-xs font-sans animate-in fade-in duration-150">
                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Bank Name</span>
                      <span class="font-semibold text-slate-800">{{ formData().step4.bankName || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Branch Name</span>
                      <span class="font-medium text-slate-800">{{ formData().step4.branchName || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Account Number</span>
                      <span class="font-mono font-semibold text-slate-800">{{ formData().step4.accountNo || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">IFSC Code</span>
                      <span class="font-mono font-medium text-slate-800">{{ formData().step4.ifscCode || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Account Holder Name</span>
                      <span class="font-medium text-slate-800">{{ formData().step4.accountHolderName || formData().step1.fullName || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Account Type</span>
                      <span class="font-medium text-slate-800">{{ formData().step4.accountType || 'Current Account' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">MICR Code</span>
                      <span class="font-mono font-medium text-slate-800">{{ formData().step4.micrCode || 'Not Applicable' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[11px] font-medium">Branch Address</span>
                      <span class="font-medium text-slate-800">{{ formData().step4.branchAddress || '-' }}</span>
                    </div>
                  </div>

                  <!-- Documents Preview Bar -->
                  <div class="pt-3 border-t border-slate-100">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Documents</span>
                    <div class="max-w-md">
                      <ng-container *ngTemplateOutlet="docCard; context: { title: 'Cancelled Cheque / Bank Passbook', doc: formData().step4.cancelledChequeDoc, defaultName: 'Bank_Cancelled_Cheque.pdf' }"></ng-container>
                    </div>
                  </div>
                </div>
              }
            </div>

          </div>

        </div>
      }

      <!-- Reusable Document Badge Template -->
      <ng-template #docCard let-title="title" let-doc="doc" let-defaultName="defaultName">
        <div class="p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-lg flex items-center justify-between gap-2.5 text-xs">
          <div class="flex items-center gap-2 min-w-0">
            <!-- Authentic Adobe PDF Icon -->
            <svg class="w-4.5 h-4.5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
              <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
              <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
            </svg>
            <div class="min-w-0">
              <span class="font-medium text-slate-800 block truncate" [title]="title">{{ title }}</span>
              <span class="text-[10px] text-slate-400 block truncate">{{ doc?.fileName || defaultName }}</span>
            </div>
          </div>
          <button
            type="button"
            (click)="openDoc(doc, title, defaultName)"
            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer shrink-0"
            title="Preview {{ title }}"
          >
            <svg class="w-3 h-3 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </button>
        </div>
      </ng-template>

      <!-- Reusable Document Preview Modal Component -->
      <app-document-viewer-modal
        [isOpen]="isDocViewerOpen"
        [doc]="selectedDoc"
        [title]="selectedDocTitle"
        (close)="isDocViewerOpen = false"
      ></app-document-viewer-modal>

    </div>
  `
})
export class ProfilePageComponent {
  private authService = inject(AuthService);
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly currentUser = this.authService.currentUser;
  readonly formData = this.otrFormService.formData;

  /** Active Accordion Step (1 to 4). Only 1 step is open at a time. Defaults to Step 1. */
  activeStep = signal<number>(1);

  /** Document preview modal state */
  isDocViewerOpen = false;
  selectedDoc: FileDoc | null = null;
  selectedDocTitle: string = '';

  /** Checks if profile is incomplete */
  readonly isProfileIncomplete = computed(() => {
    const user = this.currentUser();
    const data = this.formData();
    if (data.status === 'Submitted') return false;
    if (!user) return true;
    if (user.role === 'new_user') return true;
    return user.isProfileComplete === false;
  });

  /**
   * Toggles an accordion step. If user clicks another step, that step expands and the previous one collapses.
   */
  toggleStep(stepNum: number): void {
    if (this.activeStep() === stepNum) {
      this.activeStep.set(0); // Allow collapsing
    } else {
      this.activeStep.set(stepNum);
    }
  }

  openDoc(doc: FileDoc | null, title: string, defaultName: string = 'document.pdf'): void {
    this.selectedDoc = doc || {
      fileName: defaultName,
      fileSize: '1.45 MB',
      uploadDate: new Date().toLocaleDateString('en-GB'),
      status: 'uploaded'
    };
    this.selectedDocTitle = title;
    this.isDocViewerOpen = true;
  }

  readonly registeredAddressDisplay = computed(() => {
    const s = this.formData().step1;
    const parts = [s.registeredAddress, s.registeredDistrict, s.registeredState];
    let str = parts.filter(p => !!p && p.trim().length > 0).join(', ');
    if (s.registeredPincode?.trim()) str += (str ? ' - ' : '') + s.registeredPincode.trim();
    return str || '-';
  });

  readonly officeAddressDisplay = computed(() => {
    const s = this.formData().step1;
    if (s.sameAsRegistered) return 'Same as Registered Address';
    const parts = [s.officeAddress, s.officeDistrict, s.officeState];
    let str = parts.filter(p => !!p && p.trim().length > 0).join(', ');
    if (s.officePincode?.trim()) str += (str ? ' - ' : '') + s.officePincode.trim();
    return str || '-';
  });

  readonly sections = computed(() => {
    const data = this.formData();
    const isStep1Complete = this.validationService.validateStep1(data.step1).length === 0;
    const isStep3Complete = this.validationService.validateStep3(data.step3).length === 0;
    const isStep2Complete = this.validationService.validateStep2(data.step2).length === 0;
    const isStep4Complete = this.validationService.validateStep4(data.step4).length === 0;

    return [
      {
        id: 'org',
        stepNumber: 1,
        title: 'Organization Details',
        isCompleted: isStep1Complete
      },
      {
        id: 'auth',
        stepNumber: 2,
        title: 'Authorized Person',
        isCompleted: isStep3Complete
      },
      {
        id: 'officers',
        stepNumber: 3,
        title: 'Officer In-Charge',
        isCompleted: isStep2Complete
      },
      {
        id: 'bank',
        stepNumber: 4,
        title: 'Bank Details',
        isCompleted: isStep4Complete
      }
    ];
  });

  readonly completedSectionsCount = computed(() => {
    return this.sections().filter(s => s.isCompleted).length;
  });

  readonly completionPercentage = computed(() => {
    const data = this.formData();
    if (data.status === 'Submitted') return 100;

    const s1Complete = this.validationService.validateStep1(data.step1).length === 0;
    const s3Complete = this.validationService.validateStep3(data.step3).length === 0;
    const s2Complete = this.validationService.validateStep2(data.step2).length === 0;
    const s4Complete = this.validationService.validateStep4(data.step4).length === 0;

    if (s1Complete && s3Complete && s2Complete && s4Complete) return 100;

    const count = this.completedSectionsCount();
    return Math.round((count / 4) * 100);
  });

  readonly ctaText = computed(() => {
    const pct = this.completionPercentage();
    const count = this.completedSectionsCount();
    if (pct === 0) return 'Start Registration';
    if (count === 4 || pct === 100) return 'Review Registration';
    return 'Continue Registration';
  });

  readonly ctaQueryParams = computed(() => {
    const list = this.sections();
    const firstIncomplete = list.find(s => !s.isCompleted);
    return { step: firstIncomplete ? firstIncomplete.stepNumber : 1 };
  });
}
