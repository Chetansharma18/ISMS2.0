import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OtrFormService } from './services/otr-form.service';
import { OtrValidationService } from './services/otr-validation.service';
import { OtrPdfService } from './services/otr-pdf.service';

import { Step1OrgDetailsComponent } from './steps/step1-org-details/step1-org-details.component';
import { Step3AuthPersonComponent } from './steps/step3-auth-person/step3-auth-person.component';
import { Step4BankDetailsComponent } from './steps/step4-bank-details/step4-bank-details.component';
import { Step5PreviewComponent } from './steps/step5-preview/step5-preview.component';

export interface StepMeta {
  number: number;
  label: string;
}

@Component({
  selector: 'app-registration-shell',
  standalone: true,
  imports: [
    CommonModule,
    Step1OrgDetailsComponent,
    Step3AuthPersonComponent,
    Step4BankDetailsComponent,
    Step5PreviewComponent
  ],
  template: `
    <div class="min-h-screen bg-[#FEFEFD] flex flex-col justify-between selection:bg-[#0B3558] selection:text-white font-sans" style="font-family: 'Inter', sans-serif;">

      <!-- ====================================================================
           Main Content Area
           ==================================================================== -->
      <main class="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        <!-- 1. Top Header Row (Back Button, Page Title, Mandatory Indicator, Subtitle) -->
        <div class="mb-5 space-y-3">
          <!-- Back button -->
          <div>
            <button
              type="button"
              (click)="goBack()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
          </div>

          <!-- Title and Subtitle Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">
              Company Registration Form
            </h1>
            <span class="text-xs text-slate-500 font-medium select-none">
              Fields marked with <span class="text-rose-500 font-bold">*</span> are mandatory
            </span>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
            @if (activeStep() === 1) {
              Please provide your organisation details to complete the registration process.
            } @else if (activeStep() === 2) {
              Please provide the required details to complete the registration process.
            } @else if (activeStep() === 3) {
              Please provide the required details to complete the registration process.
            } @else {
              Review all the details before submitting your registration.
            }
          </p>
        </div>

        <!-- 2. Step Progress Indicator (Card with 4 Evenly Distributed Steps) -->
        <nav aria-label="Registration Steps" class="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-4 sm:px-8 py-3.5 sm:py-4.5 mb-5">
          <div class="flex items-center justify-between w-full">
            @for (step of steps; track step.number; let last = $last) {
              <!-- Step Item Button -->
              <button
                type="button"
                (click)="goToStep(step.number)"
                class="flex items-center gap-2 sm:gap-2.5 transition-all cursor-pointer group bg-transparent border-0 p-0 text-left shrink-0"
              >
                <!-- Number Badge / Checkmark -->
                <span
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors shadow-2xs"
                  [style.background-color]="(activeStep() === step.number || isStepCompleted(step.number)) ? '#0B3558' : '#ffffff'"
                  [style.color]="(activeStep() === step.number || isStepCompleted(step.number)) ? '#ffffff' : '#64748b'"
                  [style.border]="(activeStep() === step.number || isStepCompleted(step.number)) ? '2px solid #0B3558' : '2px solid #cbd5e1'"
                >
                  @if (isStepCompleted(step.number) && activeStep() !== step.number) {
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="stroke: #ffffff;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else if (isStepError(step.number) && activeStep() !== step.number) {
                    <span style="color: #ffffff !important; font-weight: bold;">!</span>
                  } @else {
                    <span [style.color]="(activeStep() === step.number || isStepCompleted(step.number)) ? '#ffffff' : '#64748b'" style="font-weight: 700; font-size: 13px;">
                      {{ step.number }}
                    </span>
                  }
                </span>

                <!-- Step Label -->
                <span
                  class="text-xs sm:text-[13.5px] tracking-tight whitespace-nowrap"
                  [class.font-extrabold]="activeStep() === step.number"
                  [class.text-[#0B3558]]="activeStep() === step.number"
                  [class.text-slate-800]="isStepCompleted(step.number) && activeStep() !== step.number"
                  [class.font-semibold]="activeStep() !== step.number"
                  [class.text-slate-600]="!isStepCompleted(step.number) && activeStep() !== step.number"
                >
                  {{ step.label }}
                </span>
              </button>

              <!-- Connector Line -->
              @if (!last) {
                <div
                  class="flex-1 h-[2px] mx-2.5 sm:mx-6 transition-colors duration-200"
                  [class.bg-[#0B3558]]="isStepCompleted(step.number)"
                  [class.bg-slate-200]="!isStepCompleted(step.number)"
                ></div>
              }
            }
          </div>
        </nav>

        <!-- 3. Main Form Card Container -->
        <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6">

          <!-- Step 1 Container: Organization Details -->
          <div [class.hidden]="activeStep() !== 1" class="space-y-4">
            <!-- Step 1 Card Header -->
            <div class="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <span class="w-7 h-7 rounded-full bg-[#0B3558] text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                1
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                Organisation Details
              </h2>
            </div>
            <app-step1-org-details></app-step1-org-details>
          </div>

          <!-- Step 2 Container: Authorized Person Details -->
          <div [class.hidden]="activeStep() !== 2" class="space-y-4">
            <!-- Step 2 Card Header -->
            <div class="pb-3.5 border-b border-slate-100 space-y-1">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-full bg-[#0B3558] text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                  2
                </span>
                <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                  Authorized Person Details
                </h2>
              </div>
              <p class="text-xs sm:text-sm text-slate-500 pl-10 m-0">
                Provide details of the person authorized to sign and represent the organization.
              </p>
            </div>
            <app-step3-auth-person></app-step3-auth-person>
          </div>

          <!-- Step 3 Container: Bank Details (Now Step 3!) -->
          <div [class.hidden]="activeStep() !== 3" class="space-y-4">
            <!-- Step 3 Card Header -->
            <div class="pb-3.5 border-b border-slate-100 space-y-1">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-full bg-[#0B3558] text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                  3
                </span>
                <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                  Bank Details
                </h2>
              </div>
              <p class="text-xs sm:text-sm text-slate-500 pl-10 m-0">
                Provide bank account details for receiving payments under the scheme.
              </p>
            </div>
            <app-step4-bank-details></app-step4-bank-details>
          </div>

          <!-- Step 4 Container: Preview & Submit (Now Step 4!) -->
          <div [class.hidden]="activeStep() !== 4" class="space-y-4">
            <!-- Step 4 Card Header -->
            <div class="pb-3.5 border-b border-slate-100 space-y-1">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-full bg-[#0B3558] text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                  4
                </span>
                <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                  Review &amp; Submit
                </h2>
              </div>
              <p class="text-xs sm:text-sm text-slate-500 pl-10 m-0">
                Please verify the information provided below. You can edit any section if required.
              </p>
            </div>
            <app-step5-preview (editStep)="goToStep($event)"></app-step5-preview>
          </div>

          <!-- Inline Error Message Banner (if submission attempted with errors) -->
          @if (submitErrorMessage()) {
            <div class="text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-300 px-4 py-2.5 rounded-lg flex items-center gap-2.5 font-medium shadow-2xs animate-in fade-in duration-200">
              <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ submitErrorMessage() }}</span>
            </div>
          }

          <!-- 4. Form Action Buttons (Per Step Navigation) -->
          <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <!-- Left Side: Previous Button (Steps 2, 3, 4) -->
            <div>
              @if (activeStep() > 1) {
                <button
                  type="button"
                  (click)="previousStep()"
                  class="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
              }
            </div>

            <!-- Right Side: Action Buttons -->
            <div class="flex items-center gap-2.5 sm:gap-3 ml-auto justify-end">
              <!-- STEP 1 NAVIGATION: [Save as Draft] [Next Step ->] -->
              @if (activeStep() === 1) {
                <button
                  type="button"
                  (click)="saveDraft()"
                  class="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  (click)="nextStep()"
                  class="px-6 sm:px-7 py-2.5 rounded-lg bg-[#0B3558] hover:bg-[#07243c] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Step</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              }

              <!-- STEP 2 NAVIGATION: [Previous (left)] [Save as Draft] [Next Step ->] -->
              @if (activeStep() === 2) {
                <button
                  type="button"
                  (click)="saveDraft()"
                  class="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  (click)="nextStep()"
                  class="px-6 sm:px-7 py-2.5 rounded-lg bg-[#0B3558] hover:bg-[#07243c] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Step</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              }

              <!-- STEP 3 NAVIGATION: [Previous (left)] [Save as Draft] [Next Step ->] -->
              @if (activeStep() === 3) {
                <button
                  type="button"
                  (click)="saveDraft()"
                  class="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  (click)="nextStep()"
                  class="px-6 sm:px-7 py-2.5 rounded-lg bg-[#0B3558] hover:bg-[#07243c] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Step</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              }

              <!-- STEP 4 NAVIGATION: [Previous (left)] [Download PDF] [Save as Draft] [Submit Application] -->
              @if (activeStep() === 4) {
                <button
                  type="button"
                  (click)="downloadOtrPdf()"
                  class="px-4 sm:px-5 py-2.5 rounded-lg border border-[#0483AC] text-[#0483AC] bg-white hover:bg-sky-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                  title="Download complete details in PDF"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  (click)="saveDraft()"
                  class="px-4 sm:px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  (click)="submitApplication()"
                  class="px-6 sm:px-8 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit Application</span>
                </button>
              }
            </div>
          </div>

        </div>

      </main>

      <!-- ====================================================================
           Floating Feedback Toast
           ==================================================================== -->
      @if (validationService.toast(); as toast) {
        <div class="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto">
          <div
            class="p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md"
            [class.bg-emerald-900/95]="toast.type === 'success'"
            [class.border-emerald-500/50]="toast.type === 'success'"
            [class.text-emerald-50]="toast.type === 'success'"
            [class.bg-rose-600]="toast.type === 'error'"
            [class.border-rose-700]="toast.type === 'error'"
            [class.text-white]="toast.type === 'error'"
            [class.bg-[#0B3558]]="toast.type === 'info'"
            [class.border-[#1b4b73]]="toast.type === 'info'"
            [class.text-white]="toast.type === 'info'"
            [class.bg-amber-900/95]="toast.type === 'warning'"
            [class.border-amber-500/50]="toast.type === 'warning'"
            [class.text-amber-50]="toast.type === 'warning'"
          >
            <div class="shrink-0 mt-0.5">
              @if (toast.type === 'success') {
                <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              } @else if (toast.type === 'error') {
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              } @else {
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            </div>

            <div class="flex-1 text-xs sm:text-sm font-medium leading-snug text-white">
              {{ toast.message }}
            </div>

            <button
              type="button"
              (click)="validationService.clearToast()"
              class="text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      }

      <!-- ====================================================================
           5. Submission Success Modal Popup with Instant PDF Download
           ==================================================================== -->
      @if (submittedRegId()) {
        <div class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div class="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-200">
            
            <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div class="space-y-2">
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 m-0">
                Profile Successfully Submitted!
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                Your One Time Registration (OTR) profile has been successfully submitted and recorded in the ISMS 2.0 portal for Department verification.
              </p>
            </div>

            <!-- Reference Number Highlight Box -->
            <div class="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl space-y-1.5">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Permanent Registration Reference Number
              </span>
              <div class="flex items-center justify-center gap-2">
                <span class="text-lg sm:text-xl font-mono font-extrabold text-[#0B3558] tracking-wider">
                  {{ submittedRegId() }}
                </span>
                <button
                  type="button"
                  (click)="copyRegId()"
                  title="Copy Registration ID"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Profile Summary Badges -->
            <div class="grid grid-cols-2 gap-2 text-left bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span class="text-slate-400 block text-[11px]">Organization:</span>
                <span class="font-bold text-slate-800 truncate block">{{ otrFormService.step1().fullName || '-' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Authorized Person:</span>
                <span class="font-bold text-slate-800 truncate block">{{ otrFormService.step3().name || '-' }}</span>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                (click)="downloadOtrPdf()"
                class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0483AC] hover:bg-[#036c8f] text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Profile PDF</span>
              </button>

              <button
                type="button"
                (click)="printAcknowledgement()"
                class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>

              <button
                type="button"
                (click)="navigateToHome()"
                class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Return to Home
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class RegistrationShellComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  otrFormService = inject(OtrFormService);
  validationService = inject(OtrValidationService);
  private pdfService = inject(OtrPdfService);

  readonly activeStep = signal<number>(1);
  readonly submittedRegId = signal<string | null>(null);
  readonly submitErrorMessage = signal<string | null>(null);

  constructor() {
    this.route.queryParams.subscribe(params => {
      const step = parseInt(params['step'], 10);
      if (step >= 1 && step <= 4) {
        this.activeStep.set(step);
      }
    });
  }

  readonly steps: StepMeta[] = [
    { number: 1, label: 'Organisation Details' },
    { number: 2, label: 'Authorized Person' },
    { number: 3, label: 'Bank Details' },
    { number: 4, label: 'Preview & Submit' }
  ];

  isStepCompleted(stepNumber: number): boolean {
    if (stepNumber === 4) {
      return this.submittedRegId() !== null;
    }
    const data = this.otrFormService.formData();
    return this.validationService.isStepValid(stepNumber, data);
  }

  isStepError(stepNumber: number): boolean {
    if (stepNumber === 4) {
      return false;
    }
    const isSubmitted = this.validationService.submittedSteps().has(stepNumber);
    if (!isSubmitted) return false;
    return !this.isStepCompleted(stepNumber);
  }

  canSubmit(): boolean {
    const data = this.otrFormService.formData();
    return [1, 2, 3].every(s => this.validationService.isStepValid(s, data));
  }

  goToStep(stepNumber: number): void {
    if (stepNumber < 1 || stepNumber > 4) return;
    this.submitErrorMessage.set(null);
    this.activeStep.set(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep(): void {
    this.submitErrorMessage.set(null);
    const current = this.activeStep();
    this.validationService.markStepSubmitted(current);

    const data = this.otrFormService.formData();
    const errors = this.validationService.getStepErrors(current, data);

    if (errors.length > 0) {
      this.submitErrorMessage.set(`Please fill all required mandatory fields highlighted in red (${errors[0]}).`);
      this.validationService.showToast(errors[0], 'error', current);
      return;
    }

    if (current < 4) {
      this.activeStep.set(current + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    this.submitErrorMessage.set(null);
    const current = this.activeStep();
    if (current > 1) {
      this.activeStep.set(current - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  saveDraft(): void {
    this.otrFormService.saveDraft();
    this.validationService.showToast('Registration progress saved as draft successfully!', 'info');
  }

  submitApplication(): void {
    this.submitErrorMessage.set(null);
    const data = this.otrFormService.formData();

    for (let s = 1; s <= 3; s++) {
      this.validationService.markStepSubmitted(s);
      const errors = this.validationService.getStepErrors(s, data);
      if (errors.length > 0) {
        const stepLabels: Record<number, string> = {
          1: 'Step 1 (Organization Details)',
          2: 'Step 2 (Authorized Person Details)',
          3: 'Step 3 (Bank Details)'
        };
        this.submitErrorMessage.set(`Form is not completely filled, entries are missing in ${stepLabels[s]}. Please fill all mandatory fields (${errors[0]}).`);
        this.validationService.showToast(errors[0], 'error', s);
        this.goToStep(s);
        return;
      }
    }

    this.submitErrorMessage.set(null);
    const regId = this.otrFormService.submitForm();
    this.submittedRegId.set(regId);
    this.validationService.showToast(`Application successfully submitted! Ref: ${regId}`, 'success');

    // Automatically download filled profile PDF
    try {
      this.downloadOtrPdf();
    } catch (e) {
      console.warn('Auto download error:', e);
    }
  }

  copyRegId(): void {
    const regId = this.submittedRegId();
    if (regId && navigator.clipboard) {
      navigator.clipboard.writeText(regId).then(() => {
        this.validationService.showToast('Registration ID copied to clipboard!', 'info');
      });
    }
  }

  printAcknowledgement(): void {
    this.pdfService.printOtrProfile(this.otrFormService.formData(), this.submittedRegId());
  }

  downloadOtrPdf(): void {
    this.pdfService.generateOtrPdf(this.otrFormService.formData(), this.submittedRegId());
  }

  goBack(): void {
    if (this.activeStep() > 1) {
      this.previousStep();
    } else {
      this.router.navigate(['/tenders']);
    }
  }

  navigateToHome(): void {
    this.submittedRegId.set(null);
    this.router.navigate(['/']);
  }
}
