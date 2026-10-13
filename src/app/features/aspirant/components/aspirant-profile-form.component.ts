import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  output,
  OnInit,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormSdcComponent, FormFieldConfig } from '../../../shared/components/form-sdc';
import { validateFields } from '../../../shared/components/form-sdc/form-sdc.util';
import { DocumentViewerModalComponent } from '../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import { ActionModalComponent } from '../../../shared/components/action-modal/action-modal.component';
import { AspirantAadhaarUploadComponent } from '../../sdc/components/aspirant-mapping/aspirant-aadhaar-upload.component';
import { AspirantStepNavBarComponent } from '../../sdc/components/aspirant-mapping/aspirant-step-nav-bar.component';
import {
  AspirantPhotoDocumentsStepComponent,
  AspirantDocumentSelection
} from '../../sdc/components/aspirant-mapping/aspirant-photo-documents-step.component';
import { formatFileSizeMb, readFileAsDataUrl } from '../../sdc/components/aspirant-mapping/aspirant-file.util';
import { AspirantDocumentViewerState } from '../../sdc/components/aspirant-mapping/aspirant-document-viewer.state';
import { createEmptyAspirantFormData } from '../../sdc/components/aspirant-mapping/aspirant-form-data.factory';
import { validateForSubmit } from '../../sdc/components/aspirant-mapping/aspirant-mapping.validation';
import {
  isValidMobile,
  isValidIfsc,
  isValidBankAccount
} from '../../../shared/utils/validators.util';
import {
  AspirantFormData,
  AspirantDocumentItem,
  getStep1PersonalFields,
  getStep2PermanentAddressFields,
  getStep2CommAddressFields,
  getStep2ContactFields,
  getStep3EconomicWorkerFields,
  calculateAgeFromDob
} from '../../sdc/config/aspirant-form.config';
import { AspirantPortalService } from '../services/aspirant-portal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';

export interface AspirantStepItem {
  number: number;
  label: string;
}

@Component({
  selector: 'app-aspirant-profile-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    FormSdcComponent,
    ActionModalComponent,
    DocumentViewerModalComponent,
    AspirantAadhaarUploadComponent,
    AspirantPhotoDocumentsStepComponent
  ],
  template: `
    <div class="space-y-4 font-sans">
      
      <!-- Top Aadhaar Upload Control Template for Step 1 -->
      <ng-template #aadhaarUploadTemplate>
        <app-aspirant-aadhaar-upload
          [fileName]="formData.aadhaarDocName || ''"
          [fileSize]="formData.aadhaarDocSize || ''"
          [errorMessage]="stepErrors()['aadhaarDocProof'] || ''"
          (viewDocument)="viewer.viewAadhaar()"
          (fileSelected)="onAadhaarUploaded($event)"
          (removeDocument)="onAadhaarRemoved()"
        ></app-aspirant-aadhaar-upload>
      </ng-template>

      <!-- ========================================================================= -->
      <!-- OTR-STYLE STEP PROGRESS INDICATOR (Evenly Distributed Connected Circles) -->
      <!-- ========================================================================= -->
      <nav aria-label="Registration Steps" class="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-4 sm:px-8 py-3.5 sm:py-4.5 overflow-x-auto no-scrollbar">
        <div class="flex items-center justify-between w-full min-w-135 sm:min-w-0">
          @for (step of wizardSteps; track step.number; let last = $last) {
            <!-- Step Item Button (Always Clickable for Demos) -->
            <button
              type="button"
              (click)="goToStep(step.number)"
              class="flex items-center gap-2 sm:gap-2.5 transition-all cursor-pointer group bg-transparent border-0 p-0 text-left shrink-0"
            >
              <!-- Number Badge / Checkmark -->
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors shadow-2xs"
                [style.background-color]="(currentStep() === step.number || isStepCompleted(step.number)) ? '#0B3558' : '#ffffff'"
                [style.color]="(currentStep() === step.number || isStepCompleted(step.number)) ? '#ffffff' : '#64748b'"
                [style.border]="(currentStep() === step.number || isStepCompleted(step.number)) ? '2px solid #0B3558' : '2px solid #cbd5e1'"
              >
                @if (isStepCompleted(step.number) && currentStep() !== step.number) {
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="stroke: #ffffff;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <span [style.color]="(currentStep() === step.number || isStepCompleted(step.number)) ? '#ffffff' : '#64748b'" style="font-weight: 700; font-size: 13px;">
                    {{ step.number }}
                  </span>
                }
              </span>

              <!-- Step Label -->
              <span
                class="text-xs sm:text-[13.5px] tracking-tight whitespace-nowrap"
                [class.font-extrabold]="currentStep() === step.number"
                [class.text-navy]="currentStep() === step.number"
                [class.text-slate-800]="isStepCompleted(step.number) && currentStep() !== step.number"
                [class.font-semibold]="currentStep() !== step.number"
                [class.text-slate-600]="!isStepCompleted(step.number) && currentStep() !== step.number"
              >
                {{ step.label }}
              </span>
            </button>

            <!-- Connector Line -->
            @if (!last) {
              <div
                class="flex-1 h-0.5 mx-2.5 sm:mx-6 transition-colors duration-200"
                [class.bg-navy]="isStepCompleted(step.number)"
                [class.bg-slate-200]="!isStepCompleted(step.number)"
              ></div>
            }
          }
        </div>
      </nav>

      <!-- ========================================================================= -->
      <!-- MAIN STEP FORM CARD CONTAINER                                            -->
      <!-- ========================================================================= -->
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6">

        <!-- ========================================================================= -->
        <!-- STEP 1: PERSONAL & IDENTITY DETAILS                                      -->
        <!-- ========================================================================= -->
        @if (currentStep() === 1) {
          <div class="space-y-4 animate-in fade-in duration-150">
            <!-- Step 1 Card Header -->
            <div class="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                1
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                Identity Particulars
              </h2>
            </div>

            <app-form-sdc
              [fields]="step1Fields"
              [(model)]="formData"
              [errors]="stepErrors()"
              (fieldChange)="onFieldChange($event)"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <div class="pt-3 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                (click)="proceedToStep(2)"
                class="px-6 py-2.5 bg-navy hover:bg-[#07243c] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Address &amp; Contact</span>
                <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        }

        <!-- ========================================================================= -->
        <!-- STEP 2: ADDRESS & CONTACT DETAILS                                        -->
        <!-- ========================================================================= -->
        @if (currentStep() === 2) {
          <div class="space-y-6 animate-in fade-in duration-150">
            <!-- Step 2 Card Header -->
            <div class="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                2
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                Address &amp; Contact Details
              </h2>
            </div>

            <!-- Permanent Address Sub-Section -->
            <div class="space-y-3">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span class="w-1.5 h-4 bg-primary rounded-full"></span>
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">Permanent Address</h3>
              </div>
              <app-form-sdc
                [fields]="step2PermanentFields"
                [(model)]="formData"
                [errors]="stepErrors()"
                (fieldChange)="onFieldChange($event)"
                density="compact"
                layout="plain"
                [card]="false"
                [gridCols]="4"
                [showSubmit]="false"
                [showCancel]="false"
              ></app-form-sdc>
            </div>

            <!-- Same-As-Permanent Checkbox Toggle -->
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <label for="sameAddressProfileCheckbox" class="text-xs font-medium text-slate-700 cursor-pointer select-none flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="sameAddressProfileCheckbox"
                  [(ngModel)]="formData.isAddressSame"
                  (change)="toggleSameAddress()"
                  class="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                />
                <span>Communication address is the same as Permanent address</span>
              </label>
            </div>

            <!-- Communication Address Sub-Section -->
            <div class="space-y-3">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span class="w-1.5 h-4 bg-primary rounded-full"></span>
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">Communication Address</h3>
              </div>
              <app-form-sdc
                [fields]="step2CommFields"
                [(model)]="formData"
                [errors]="stepErrors()"
                (fieldChange)="onFieldChange($event)"
                density="compact"
                layout="plain"
                [card]="false"
                [gridCols]="4"
                [showSubmit]="false"
                [showCancel]="false"
              ></app-form-sdc>
            </div>

            <!-- Contact Details Sub-Section -->
            <div class="space-y-3">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span class="w-1.5 h-4 bg-primary rounded-full"></span>
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">Contact Details</h3>
              </div>
              <app-form-sdc
                [fields]="step2ContactFields"
                [(model)]="formData"
                [errors]="stepErrors()"
                (fieldChange)="onFieldChange($event)"
                density="compact"
                layout="plain"
                [card]="false"
                [gridCols]="4"
                [showSubmit]="false"
                [showCancel]="false"
              ></app-form-sdc>
            </div>

            <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                (click)="goToStep(1)"
                class="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold cursor-pointer transition-colors"
              >
                &larr; Previous
              </button>
              <button
                type="button"
                (click)="proceedToStep(3)"
                class="px-6 py-2.5 bg-navy hover:bg-[#07243c] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Category &amp; Education</span>
                <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        }

        <!-- ========================================================================= -->
        <!-- STEP 3: SOCIO-ECONOMIC & CATEGORY DETAILS                                -->
        <!-- ========================================================================= -->
        @if (currentStep() === 3) {
          <div class="space-y-4 animate-in fade-in duration-150">
            <!-- Step 3 Card Header -->
            <div class="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                3
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                Category &amp; Education Details
              </h2>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span class="w-1.5 h-4 bg-primary rounded-full"></span>
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">Economic &amp; Worker Classification</h3>
              </div>
              <app-form-sdc
                [fields]="step3Fields"
                [(model)]="formData"
                [errors]="stepErrors()"
                (fieldChange)="onFieldChange($event)"
                density="compact"
                layout="plain"
                [card]="false"
                [gridCols]="4"
                [showSubmit]="false"
                [showCancel]="false"
              ></app-form-sdc>
            </div>

            <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                (click)="goToStep(2)"
                class="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold cursor-pointer transition-colors"
              >
                &larr; Previous
              </button>
              <button
                type="button"
                (click)="proceedToStep(4)"
                class="px-6 py-2.5 bg-navy hover:bg-[#07243c] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Photo &amp; Documents</span>
                <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        }

        <!-- ========================================================================= -->
        <!-- STEP 4: PHOTO & SUPPORTING DOCUMENTS                                      -->
        <!-- ========================================================================= -->
        @if (currentStep() === 4) {
          <div class="space-y-5 animate-in fade-in duration-150">
            <!-- Step 4 Card Header -->
            <div class="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                4
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                Photo &amp; Document Uploads
              </h2>
            </div>

            <app-aspirant-photo-documents-step
              [formData]="formData"
              [photoError]="stepErrors()['candidatePhoto'] || ''"
              (viewPhoto)="viewer.viewPhoto()"
              (photoSelected)="onPhotoUploaded($event)"
              (viewDocument)="viewer.viewDocument($event)"
              (documentSelected)="onAspirantDocSelected($event)"
              (documentRemoved)="onAspirantDocRemoved($event)"
            >
              <!-- Step 4 Bottom Navigation Bar -->
              <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  (click)="goToStep(3)"
                  class="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold cursor-pointer transition-colors"
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  (click)="proceedToStep(5)"
                  class="px-6 py-2.5 bg-navy hover:bg-[#07243c] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Preview &amp; Submit</span>
                  <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </app-aspirant-photo-documents-step>
          </div>
        }

        <!-- ========================================================================= -->
        <!-- STEP 5: PREVIEW & SUBMIT (OTR-STYLE COMPREHENSIVE REVIEW)                 -->
        <!-- ========================================================================= -->
        @if (currentStep() === 5) {
          <div class="space-y-5 animate-in fade-in duration-150">
            <!-- Step 5 Card Header -->
            <div class="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                5
              </span>
              <div>
                <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                  Review &amp; Submit Profile
                </h2>
                <p class="text-xs text-slate-500 mt-0.5 m-0">
                  Please review all candidate details before final submission. Click "Edit Details" on any section to modify.
                </p>
              </div>
            </div>

            <!-- SECTION 1 PREVIEW: IDENTITY DETAILS -->
            <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 cursor-pointer select-none" (click)="togglePreviewSection(1)">
                  <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 m-0">Identity Particulars</h3>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="goToStep(1)"
                    class="inline-flex items-center px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Edit Details</span>
                  </button>
                  <button
                    type="button"
                    (click)="togglePreviewSection(1)"
                    class="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="!isPreviewSectionOpen(1)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              @if (isPreviewSectionOpen(1)) {
                <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Name of Aspirant</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.aspirantName || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Aadhaar No.</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ formData.aadhaarNo || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Jan Aadhaar ID</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ formData.janaadhaarId || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Gender</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.gender || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Relation &amp; Name</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.relationType ? formData.relationType + ': ' + formData.relationName : (formData.relationName || '-') }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Mother's Name</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.motherName || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Date of Birth &amp; Age</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.dob ? formData.dob + ' (' + (formData.age || calculateAge(formData.dob)) + ' Yrs)' : '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Educational Qualification</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.educationalQualification || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Religion / Category</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.religion || '-' }} / {{ formData.category || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Area Type</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.areaType || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Special Ability (PwD)</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.specialAbility || 'No' }} {{ formData.specialAbility === 'Yes' && formData.disabilityType ? '(' + formData.disabilityType + ')' : '' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Aadhaar Card Proof</span>
                    @if (formData.aadhaarDocName) {
                      <div class="flex items-center gap-2 mt-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
                        <svg class="w-4.5 h-4.5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                          <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                          <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                        </svg>
                        <div class="flex flex-col min-w-0 flex-1">
                          <span class="font-medium text-slate-800 text-xs truncate" [title]="formData.aadhaarDocName">{{ formData.aadhaarDocName }}</span>
                          <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 w-fit mt-0.5">{{ formData.aadhaarDocSize || '0.04 MB' }}</span>
                        </div>
                        <button type="button" (click)="viewer.viewAadhaar()" class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-ocean bg-sky-50 border border-sky-200 rounded hover:bg-sky-100 cursor-pointer">View</button>
                      </div>
                    } @else {
                      <span class="font-medium text-slate-400 text-[12.5px] block mt-1">Not Uploaded</span>
                    }
                  </div>
                </div>
              }
            </section>

            <!-- SECTION 2 PREVIEW: ADDRESS & CONTACT -->
            <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 cursor-pointer select-none" (click)="togglePreviewSection(2)">
                  <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 m-0">Address &amp; Contact Details</h3>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="goToStep(2)"
                    class="inline-flex items-center px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Edit Details</span>
                  </button>
                  <button
                    type="button"
                    (click)="togglePreviewSection(2)"
                    class="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="!isPreviewSectionOpen(2)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              @if (isPreviewSectionOpen(2)) {
                <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
                  <div class="sm:col-span-2">
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Permanent Address</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ getPermanentAddressDisplay() }}</span>
                  </div>
                  <div class="sm:col-span-2">
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Communication Address</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ getCommAddressDisplay() }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Mobile Number</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ formData.mobileNo ? '+91 ' + formData.mobileNo : '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Alternate Mobile</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ formData.altMobileNo ? '+91 ' + formData.altMobileNo : '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Email ID</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.email || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Assembly / Parliament</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.permAssembly || '-' }} / {{ formData.permParliament || '-' }}</span>
                  </div>
                </div>
              }
            </section>

            <!-- SECTION 3 PREVIEW: CATEGORY & ECONOMIC -->
            <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 cursor-pointer select-none" (click)="togglePreviewSection(3)">
                  <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 m-0">Category &amp; Education Details</h3>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="goToStep(3)"
                    class="inline-flex items-center px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Edit Details</span>
                  </button>
                  <button
                    type="button"
                    (click)="togglePreviewSection(3)"
                    class="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="!isPreviewSectionOpen(3)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              @if (isPreviewSectionOpen(3)) {
                <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Bank Account No.</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ formData.bankAccountNo || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account Name</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.bankAccountName || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Bank Name &amp; Branch</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.bankName || '-' }} {{ formData.bankBranch ? '(' + formData.bankBranch + ')' : '' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">IFSC Code</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ formData.ifscCode || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account Type</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.bankAccountType || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Annual Family Income</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.annualFamilyIncome || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Economic Status</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.economicStatus || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">BOCW / MGNREGA Worker</span>
                    <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ formData.bocwWorker === 'Yes' ? 'BOCW Registered' : (formData.mgnregaWorker === 'Yes' ? 'MGNREGA Worker' : 'No') }}</span>
                  </div>
                </div>
              }
            </section>

            <!-- SECTION 4 PREVIEW: PHOTO & DOCUMENTS -->
            <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 cursor-pointer select-none" (click)="togglePreviewSection(4)">
                  <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 m-0">Photo &amp; Document Uploads</h3>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="goToStep(4)"
                    class="inline-flex items-center px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Edit Details</span>
                  </button>
                  <button
                    type="button"
                    (click)="togglePreviewSection(4)"
                    class="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="!isPreviewSectionOpen(4)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              @if (isPreviewSectionOpen(4)) {
                <div class="p-4 sm:p-5 space-y-4 text-xs">
                  <!-- Photo row -->
                  <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div class="w-14 h-16 rounded border border-slate-300 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                      @if (formData.candidatePhotoUrl) {
                        <img [src]="formData.candidatePhotoUrl" alt="Candidate" class="w-full h-full object-cover" />
                      } @else {
                        <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                    </div>
                    <div class="flex-1">
                      <span class="font-bold text-slate-800 text-xs block">Candidate Photograph</span>
                      <span class="text-slate-500 text-[11px] block mt-0.5">{{ formData.candidatePhotoName || 'No photograph uploaded' }}</span>
                    </div>
                    @if (formData.candidatePhotoUrl) {
                      <button type="button" (click)="viewer.viewPhoto()" class="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-brand rounded text-xs font-semibold cursor-pointer">
                        View Photo
                      </button>
                    }
                  </div>

                  <!-- Uploaded Documents List -->
                  <div class="space-y-2">
                    <span class="font-bold text-slate-700 text-xs block">Supporting Documents ({{ getUploadedDocsCount() }}/{{ formData.documents.length }} Uploaded)</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      @for (doc of formData.documents; track doc.id) {
                        <div class="flex items-center justify-between p-2.5 rounded-lg border bg-white text-xs" [class.border-emerald-200]="doc.status === 'UPLOADED'" [class.border-slate-200]="doc.status !== 'UPLOADED'">
                          <div class="flex items-center gap-2 min-w-0 flex-1 pr-2">
                            @if (doc.status === 'UPLOADED') {
                              <svg class="w-4.5 h-4.5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                                <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                                <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                              </svg>
                            }
                            <div class="flex flex-col min-w-0 flex-1">
                              <span class="font-semibold text-slate-800 truncate text-xs">{{ doc.docName }}</span>
                              @if (doc.status === 'UPLOADED') {
                                <div class="flex items-center gap-1.5 mt-0.5">
                                  <span class="text-[11px] text-slate-500 truncate max-w-[140px]">{{ doc.fileName }}</span>
                                  <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-600">{{ doc.fileSize || '0.04 MB' }}</span>
                                </div>
                              } @else {
                                <span class="text-[11px] text-slate-400 block truncate">Not uploaded</span>
                              }
                            </div>
                          </div>
                          @if (doc.status === 'UPLOADED' && (doc.fileUrl || doc.fileName)) {
                            <button type="button" (click)="viewer.viewDocument(doc)" class="px-2.5 py-1 bg-sky-50 text-ocean border border-sky-200 rounded text-xs font-semibold hover:bg-sky-100 cursor-pointer shrink-0">
                              View
                            </button>
                          } @else {
                            <span class="text-[10px] text-slate-400 italic shrink-0">Optional</span>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </section>

            <!-- SECTION 5: DECLARATION & SUBMISSION BAR -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <label for="declarationConsent" class="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                <input
                  type="checkbox"
                  id="declarationConsent"
                  [(ngModel)]="declarationAccepted"
                  class="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer mt-0.5"
                />
                <span>
                  I solemnly affirm and declare that the information provided in this registration form is true, correct, and complete to the best of my knowledge and belief.
                </span>
              </label>

              <div class="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  (click)="goToStep(4)"
                  class="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold cursor-pointer transition-colors"
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  (click)="submitProfile()"
                  [disabled]="isSubmitting() || !declarationAccepted"
                  class="px-6 py-2.5 bg-navy hover:bg-[#07243c] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  @if (isSubmitting()) {
                    <span>Saving Profile...</span>
                  } @else {
                    <span>Save &amp; Submit Profile &rarr;</span>
                  }
                </button>
              </div>
            </div>

          </div>
        }

      </div>

      <!-- Universal Document Viewer Modal -->
      <app-document-viewer-modal
        [isOpen]="viewer.isOpen()"
        [doc]="viewer.doc()"
        [title]="viewer.title()"
        (close)="viewer.close()"
      ></app-document-viewer-modal>

      <!-- Profile Success Action Modal -->
      <app-action-modal
        [isOpen]="showSuccessModal()"
        [showCloseButton]="true"
        [showAccentBar]="false"
        title="Profile Created Successfully"
        description="Your Aspirant candidate profile registration has been successfully completed and verified. You are now eligible to express interest in all training batches."
        primaryLabel="Explore Training Calendar"
        secondaryLabel="View Profile"
        (primaryAction)="navigateToCalendar()"
        (secondaryAction)="showSuccessModal.set(false)"
        (close)="showSuccessModal.set(false)"
      ></app-action-modal>

      <!-- Floating Feedback Toast (Top Right Side, matching OTR Registration pattern) -->
      @if (validationToast(); as toast) {
        <div class="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto font-sans">
          <div
            class="p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md bg-rose-600 border-rose-700 text-white"
          >
            <div class="shrink-0 mt-0.5">
              <div class="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <svg class="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            <div class="flex-1 text-xs sm:text-sm font-medium leading-snug text-white">
              {{ toast.message }}
            </div>

            <button
              type="button"
              (click)="clearValidationToast()"
              class="text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss error notification"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      }

    </div>
  `
})
export class AspirantProfileFormComponent implements OnInit {
  private readonly portalService = inject(AspirantPortalService);
  private readonly notify = inject(NotificationService);
  private readonly authService = inject(AuthService, { optional: true });
  private readonly router = inject(Router);

  readonly profileSaved = output<void>();

  readonly validationToast = signal<{ message: string; type?: 'error' | 'success' | 'warning' } | null>(null);
  private toastTimeout?: ReturnType<typeof setTimeout>;

  showErrorToast(message: string): void {
    this.validationToast.set({ message, type: 'error' });
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.validationToast.set(null);
    }, 4500);
  }

  clearValidationToast(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.validationToast.set(null);
  }

  @ViewChild('aadhaarUploadTemplate', { static: true })
  aadhaarUploadTemplate!: TemplateRef<any>;

  readonly currentStep = signal<number>(1);
  readonly errorMessage = signal<string>('');
  readonly stepErrors = signal<Record<string, string>>({});
  readonly isSubmitting = signal<boolean>(false);
  readonly showSuccessModal = signal<boolean>(false);
  readonly completedSteps = signal<Set<number>>(new Set());

  declarationAccepted = true;

  readonly previewSections = signal<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true
  });

  formData: AspirantFormData = createEmptyAspirantFormData();
  readonly viewer = new AspirantDocumentViewerState(() => this.formData);

  readonly wizardSteps: AspirantStepItem[] = [
    { number: 1, label: 'Identity Particulars' },
    { number: 2, label: 'Address & Contact' },
    { number: 3, label: 'Category & Education' },
    { number: 4, label: 'Photo & Documents' },
    { number: 5, label: 'Preview & Submit' }
  ];

  step1Fields: FormFieldConfig[] = [];
  step2PermanentFields: FormFieldConfig[] = [];
  step2CommFields: FormFieldConfig[] = [];
  step2ContactFields: FormFieldConfig[] = [];
  step3Fields: FormFieldConfig[] = [];

  ngOnInit(): void {
    // Populate form fields using existing config
    this.step1Fields = getStep1PersonalFields((dob, model) => {
      model.age = calculateAgeFromDob(dob);
    }, this.aadhaarUploadTemplate);

    this.step2PermanentFields = getStep2PermanentAddressFields();
    this.step2CommFields = getStep2CommAddressFields();
    this.step2ContactFields = getStep2ContactFields();
    this.step3Fields = getStep3EconomicWorkerFields();

    // Load existing profile data if saved
    const saved = this.portalService.profileData();
    if (saved && (saved.aspirantName || saved.aadhaarNo)) {
      this.formData = JSON.parse(JSON.stringify(saved));
    }
  }

  isStepCompleted(stepNumber: number): boolean {
    if (this.portalService.isProfileComplete()) return true;
    return this.completedSteps().has(stepNumber);
  }

  /**
   * Top numbers navigation: allows moving unconditionally to any step without filling all details (for demo walkthroughs).
   */
  goToStep(stepNumber: number): void {
    if (stepNumber < 1 || stepNumber > 5) return;
    this.currentStep.set(stepNumber);
    this.errorMessage.set('');
    this.clearValidationToast();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Bottom button navigation: validates mandatory fields of the current step,
   * showing red borders and red error messages below the input boxes if invalid.
   */
  proceedToStep(nextStep: number): void {
    const errors = this.getStepErrors(this.currentStep());
    this.stepErrors.set(errors);

    if (Object.keys(errors).length > 0) {
      this.errorMessage.set('Please fill all mandatory fields marked with *');
      this.showErrorToast('Please fill all mandatory fields marked with *');
      return;
    }

    this.errorMessage.set('');
    this.clearValidationToast();
    this.completedSteps.update(s => new Set(s).add(this.currentStep()));
    this.currentStep.set(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onFieldChange(event: { key: string; value: any }): void {
    const current = { ...this.stepErrors() };
    if (current[event.key]) {
      delete current[event.key];
      this.stepErrors.set(current);
    }
  }

  getStepErrors(step: number): Record<string, string> {
    const errors: Record<string, string> = {};

    if (step === 1) {
      const res = validateFields(this.step1Fields, this.formData);
      Object.assign(errors, res.errors);

      if (!this.formData.aadhaarDocName) {
        errors['aadhaarDocProof'] = 'Aadhaar Card document proof is required';
      }

      if (
        this.formData.aadhaarNo &&
        this.formData.confirmAadhaarNo &&
        this.formData.aadhaarNo !== this.formData.confirmAadhaarNo
      ) {
        errors['confirmAadhaarNo'] = 'Aadhaar numbers do not match';
      }
    } else if (step === 2) {
      const permRes = validateFields(this.step2PermanentFields, this.formData);
      Object.assign(errors, permRes.errors);

      if (!this.formData.isAddressSame) {
        const commRes = validateFields(this.step2CommFields, this.formData);
        Object.assign(errors, commRes.errors);
      }

      const contactRes = validateFields(this.step2ContactFields, this.formData);
      Object.assign(errors, contactRes.errors);

      if (!this.formData.mobileNo) {
        errors['mobileNo'] = 'Mobile number is mandatory';
      } else if (!isValidMobile(this.formData.mobileNo)) {
        errors['mobileNo'] = 'Mobile must be 10 digits starting with 6, 7, 8 or 9';
      }

      if (this.formData.altMobileNo && !isValidMobile(this.formData.altMobileNo)) {
        errors['altMobileNo'] = 'Alternate mobile must be 10 digits starting with 6, 7, 8 or 9';
      }
    } else if (step === 3) {
      const ecoRes = validateFields(this.step3Fields, this.formData);
      Object.assign(errors, ecoRes.errors);

      if (this.formData.ifscCode && !isValidIfsc(this.formData.ifscCode)) {
        errors['ifscCode'] = 'IFSC must be 11 characters (e.g. SBIN0001234)';
      }
      if (this.formData.bankAccountNo && !isValidBankAccount(this.formData.bankAccountNo)) {
        errors['bankAccountNo'] = 'Bank account number must be 9 to 18 digits';
      }
    } else if (step === 4) {
      if (!this.formData.candidatePhotoUrl && !this.formData.candidatePhotoName) {
        errors['candidatePhoto'] = 'Candidate photograph is mandatory';
      }
    }

    return errors;
  }

  toggleSameAddress(): void {
    if (this.formData.isAddressSame) {
      this.copyPermanentToComm();
    }
  }

  copyPermanentToComm(): void {
    this.formData.isAddressSame = true;
    this.formData.commHouseNo = this.formData.permHouseNo;
    this.formData.commStreet = this.formData.permStreet;
    this.formData.commWard = this.formData.permWard;
    this.formData.commCity = this.formData.permCity;
    this.formData.commDistrict = this.formData.permDistrict;
    this.formData.commBlock = this.formData.permBlock;
    this.formData.commTehsil = this.formData.permTehsil;
    this.formData.commMunicipality = this.formData.permMunicipality;
    this.formData.commPincode = this.formData.permPincode;
  }

  onAadhaarUploaded(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.formData.aadhaarDocName = file.name;
      this.formData.aadhaarDocSize = formatFileSizeMb(file.size);

      readFileAsDataUrl(file, url => {
        this.formData.aadhaarDocUrl = url;
        const current = { ...this.stepErrors() };
        delete current['aadhaarDocProof'];
        this.stepErrors.set(current);
      });
    }
  }

  onAadhaarRemoved(): void {
    this.formData.aadhaarDocName = '';
    this.formData.aadhaarDocSize = '';
    this.formData.aadhaarDocUrl = '';
  }

  onPhotoUploaded(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.formData.candidatePhotoName = file.name;
      readFileAsDataUrl(file, url => {
        this.formData.candidatePhotoUrl = url;
        const current = { ...this.stepErrors() };
        delete current['candidatePhoto'];
        this.stepErrors.set(current);
      });
    }
  }

  onAspirantDocSelected(selection: AspirantDocumentSelection): void {
    const input = selection.event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      selection.doc.fileName = file.name;
      selection.doc.fileSize = formatFileSizeMb(file.size);
      selection.doc.status = 'UPLOADED';
      selection.doc.uploadedAt = 'Just now';

      readFileAsDataUrl(file, url => {
        selection.doc.fileUrl = url;
      });
    }
  }

  onAspirantDocRemoved(doc: AspirantDocumentItem): void {
    doc.fileName = '';
    doc.fileSize = '';
    doc.fileUrl = '';
    doc.status = 'PENDING';
    doc.uploadedAt = undefined;
  }

  // --- PREVIEW SECTION HELPERS ---

  togglePreviewSection(sectionNum: number): void {
    const current = this.previewSections();
    this.previewSections.set({
      ...current,
      [sectionNum]: !current[sectionNum]
    });
  }

  isPreviewSectionOpen(sectionNum: number): boolean {
    return this.previewSections()[sectionNum] ?? true;
  }

  calculateAge(dob: string): number {
    return calculateAgeFromDob(dob);
  }

  getPermanentAddressDisplay(): string {
    const parts = [
      this.formData.permHouseNo ? `House ${this.formData.permHouseNo}` : '',
      this.formData.permStreet,
      this.formData.permCity,
      this.formData.permTehsil ? `Tehsil ${this.formData.permTehsil}` : '',
      this.formData.permBlock ? `Block ${this.formData.permBlock}` : '',
      this.formData.permDistrict,
      this.formData.permPincode ? `PIN: ${this.formData.permPincode}` : ''
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  }

  getCommAddressDisplay(): string {
    if (this.formData.isAddressSame) {
      return this.getPermanentAddressDisplay() + ' (Same as Permanent)';
    }
    const parts = [
      this.formData.commHouseNo ? `House ${this.formData.commHouseNo}` : '',
      this.formData.commStreet,
      this.formData.commCity,
      this.formData.commTehsil ? `Tehsil ${this.formData.commTehsil}` : '',
      this.formData.commBlock ? `Block ${this.formData.commBlock}` : '',
      this.formData.commDistrict,
      this.formData.commPincode ? `PIN: ${this.formData.commPincode}` : ''
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  }

  getUploadedDocsCount(): number {
    return this.formData.documents.filter(d => d.status === 'UPLOADED').length;
  }

  navigateToCalendar(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/training-calendar']);
  }

  submitProfile(): void {
    this.errorMessage.set('');
    this.clearValidationToast();
    const submitError = validateForSubmit(this.formData);
    if (submitError) {
      this.errorMessage.set(submitError.message);
      this.showErrorToast(submitError.message);
      this.currentStep.set(submitError.step);
      return;
    }

    this.isSubmitting.set(true);
    setTimeout(() => {
      this.completedSteps.update(s => new Set(s).add(1).add(2).add(3).add(4).add(5));
      this.portalService.saveProfile(this.formData);
      this.authService?.markProfileCompleted();
      this.isSubmitting.set(false);
      this.showSuccessModal.set(true);
      this.notify.success('Aspirant profile completed successfully! You can now express interest for any training program.');
      this.profileSaved.emit();
    }, 400);
  }
}
