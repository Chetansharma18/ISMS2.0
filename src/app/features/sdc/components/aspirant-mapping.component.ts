import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormSdcComponent, FormFieldConfig } from '../../../shared/components/form-sdc';
import { DocumentViewerModalComponent } from '../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import { BatchService } from '../services/batch.service';
import { SdcService } from '../services/sdc.service';
import { AspirantService } from '../services/aspirant.service';
import { BatchRecord } from '../models/batch.model';
import {
  AspirantFormData,
  AspirantDocumentItem,
  getStep1PersonalFields,
  getStep2PermanentAddressFields,
  getStep2CommAddressFields,
  getStep2ContactFields,
  getStep2AddressFields,
  getStep3EconomicWorkerFields,
  calculateAgeFromDob
} from '../config/aspirant-form.config';

@Component({
  selector: 'app-aspirant-mapping',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FormSdcComponent, DocumentViewerModalComponent],
  template: `
    <div class="min-h-full bg-white py-4 sm:py-6 px-4 sm:px-8 font-sans selection:bg-slate-900 selection:text-white" style="font-family: 'Inter', sans-serif;">
      
      <!-- Direct-on-Page Container (matching SDC & Batch forms) -->
      <div class="max-w-7xl mx-auto space-y-4">
        
        <!-- Header: Back Button + Title + Batch Context -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="goBack()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Back to Batches"
            >
              <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight leading-snug m-0">
                  Register Aspirant
                </h1>
               
              </div>
             
            </div>
          </div>

          <!-- Batch Context Header Pill -->
          @if (batch(); as b) {
            <div class="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs self-start sm:self-auto shadow-2xs">
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400 font-medium">Batch:</span>
                <span class="font-bold text-slate-900 font-mono">{{ b.batchCode }}</span>
              </div>
              <span class="w-1 h-1 rounded-full bg-slate-300"></span>
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400 font-medium">Course:</span>
                <span class="font-semibold text-slate-800">{{ b.courseName }}</span>
              </div>
              <span class="w-1 h-1 rounded-full bg-slate-300"></span>
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400 font-medium">Capacity:</span>
                <span class="font-bold text-emerald-700 font-mono">{{ b.mappedAspirantsCount }}/{{ b.maxStrength }} Mapped</span>
              </div>
            </div>
          }
        </div>

        <!-- 4-Step Modern Stepper -->
        <div class="bg-slate-50/80 border border-slate-200 rounded-xl p-3 sm:px-6 shadow-2xs">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            
            <!-- Step 1 Tab -->
            <button
              type="button"
              (click)="goToStep(1)"
              class="flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer p-1.5 rounded-lg text-left"
              [class.bg-white]="currentStep() === 1"
              [class.shadow-2xs]="currentStep() === 1"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                [style.background-color]="currentStep() > 1 ? '#16a34a' : currentStep() === 1 ? '#0F172A' : '#cbd5e1'"
                style="color: #ffffff !important;"
              >
                @if (currentStep() > 1) {
                  <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <span style="color: #ffffff !important; font-weight: 700; font-size: 11px;">1</span>
                }
              </span>
              <div class="truncate">
                <span class="block leading-tight font-bold text-slate-900 truncate">1. Personal &amp; Identity</span>
                <span class="text-[10px] text-slate-500 font-normal truncate">Aadhaar &amp; Bio Data</span>
              </div>
            </button>

            <!-- Step 2 Tab -->
            <button
              type="button"
              (click)="goToStep(2)"
              class="flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer p-1.5 rounded-lg text-left"
              [class.bg-white]="currentStep() === 2"
              [class.shadow-2xs]="currentStep() === 2"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                [style.background-color]="currentStep() > 2 ? '#16a34a' : currentStep() === 2 ? '#0F172A' : '#cbd5e1'"
                style="color: #ffffff !important;"
              >
                @if (currentStep() > 2) {
                  <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <span style="color: #ffffff !important; font-weight: 700; font-size: 11px;">2</span>
                }
              </span>
              <div class="truncate">
                <span class="block leading-tight font-bold text-slate-900 truncate">2. Address &amp; Contact</span>
                <span class="text-[10px] text-slate-500 font-normal truncate">Permanent &amp; Comm.</span>
              </div>
            </button>

            <!-- Step 3 Tab -->
            <button
              type="button"
              (click)="goToStep(3)"
              class="flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer p-1.5 rounded-lg text-left"
              [class.bg-white]="currentStep() === 3"
              [class.shadow-2xs]="currentStep() === 3"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                [style.background-color]="currentStep() > 3 ? '#16a34a' : currentStep() === 3 ? '#0F172A' : '#cbd5e1'"
                style="color: #ffffff !important;"
              >
                @if (currentStep() > 3) {
                  <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <span style="color: #ffffff !important; font-weight: 700; font-size: 11px;">3</span>
                }
              </span>
              <div class="truncate">
                <span class="block leading-tight font-bold text-slate-900 truncate">3. Bank &amp; Worker</span>
                <span class="text-[10px] text-slate-500 font-normal truncate">DBT, BoCW, MGNREGA</span>
              </div>
            </button>

            <!-- Step 4 Tab -->
            <button
              type="button"
              (click)="goToStep(4)"
              class="flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer p-1.5 rounded-lg text-left"
              [class.bg-white]="currentStep() === 4"
              [class.shadow-2xs]="currentStep() === 4"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                [style.background-color]="currentStep() === 4 ? '#0F172A' : '#cbd5e1'"
                style="color: #ffffff !important;"
              >
                <span style="color: #ffffff !important; font-weight: 700; font-size: 11px;">4</span>
              </span>
              <div class="truncate">
                <span class="block leading-tight font-bold text-slate-900 truncate">4. Photo &amp; Documents</span>
                <span class="text-[10px] text-slate-500 font-normal truncate">Uploads &amp; Map Batch</span>
              </div>
            </button>

          </div>
        </div>

        <!-- Notification Banner -->
        @if (errorMessage()) {
          <div class="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
            <button (click)="errorMessage.set('')" class="text-rose-500 hover:text-rose-800 cursor-pointer font-bold">✕</button>
          </div>
        }

        <!-- ========================================================================= -->
        <!-- STEP 1: MAIN / PERSONAL & IDENTITY DETAILS                                -->
        <!-- ========================================================================= -->
        @if (currentStep() === 1) {
          <div class="space-y-4 animate-in fade-in duration-150">
            
            <!-- Dedicated Prominent Aadhaar Card Upload (As explicitly requested by user) -->
            <div class="p-4 bg-gradient-to-r from-blue-50/70 via-slate-50 to-emerald-50/50 border border-blue-200 rounded-xl shadow-2xs space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-1.5">
                      <span>Aadhaar Card Document</span>
                      <span class="text-rose-500">*</span>
                    </h3>
                    <p class="text-[11px] text-slate-600 m-0">
                      Upload your official Aadhaar card for statutory identity and biometric verification.
                    </p>
                  </div>
                </div>

                <span class="text-[10px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                  PDF / JPG / PNG • Max 5 MB
                </span>
              </div>

              <!-- Upload Drag/Drop Box -->
              <div class="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-slate-200 rounded-lg">
                <div class="flex-1 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-800 block">
                      {{ formData.aadhaarDocName || 'Aadhaar_Document_Proof.pdf' }}
                    </span>
                    <span class="text-[10.5px] text-slate-400">
                      {{ formData.aadhaarDocSize || '1.8 MB • Ready for biometric verification' }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                  <label class="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>{{ formData.aadhaarDocName ? 'Change Aadhaar' : 'Upload Aadhaar' }}</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onAadhaarUploaded($event)" class="hidden" />
                  </label>
                  
                  @if (formData.aadhaarDocName) {
                    <button
                      type="button"
                      (click)="viewAadhaarDoc()"
                      class="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#174A6E] border border-slate-300 rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                      title="View uploaded Aadhaar card"
                    >
                      <svg class="w-3.5 h-3.5 text-[#174A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View</span>
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Main Personal & Demographic Fields via FormSdcComponent -->
            <app-form-sdc
              [fields]="step1Fields"
              [(model)]="formData"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <!-- Bottom Navigation Bar for Step 1 -->
            <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="proceedToStep(2)"
                class="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Address Details</span>
                <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- ========================================================================= -->
        <!-- STEP 2: ADDRESS & CONTACT DETAILS                                         -->
        <!-- ========================================================================= -->
        @if (currentStep() === 2) {
          <div class="space-y-4 animate-in fade-in duration-150">
            
            <!-- Permanent Address Fields via FormSdcComponent -->
            <app-form-sdc
              [fields]="step2PermanentFields"
              [(model)]="formData"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <!-- Communication Address Header with Small Checkbox on Top Right -->
            <div class="pt-3 pb-1 border-b border-slate-200 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-4 bg-[#0F172A] rounded-full"></span>
                <h4 class="text-xs font-bold text-slate-900 tracking-wider uppercase m-0">
                  COMMUNICATION ADDRESS
                </h4>
              </div>
              <label class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="sameAddressCheck"
                  [(ngModel)]="formData.isAddressSame"
                  (change)="toggleSameAddress()"
                  class="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Same as Permanent Address</span>
              </label>
            </div>

            <!-- Communication Address Fields via FormSdcComponent -->
            <app-form-sdc
              [fields]="step2CommFields"
              [(model)]="formData"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <!-- Contact Details Fields via FormSdcComponent -->
            <app-form-sdc
              [fields]="step2ContactFields"
              [(model)]="formData"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <!-- Bottom Navigation Bar for Step 2 -->
            <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="proceedToStep(3)"
                class="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Bank &amp; Worker Details</span>
                <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- ========================================================================= -->
        <!-- STEP 3: BANK, ECONOMIC & WORKER DETAILS                                    -->
        <!-- ========================================================================= -->
        @if (currentStep() === 3) {
          <div class="space-y-4 animate-in fade-in duration-150">
            
            <!-- Bank & Worker Fields via FormSdcComponent -->
            <app-form-sdc
              [fields]="step3Fields"
              [(model)]="formData"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <!-- Bottom Navigation Bar for Step 3 -->
            <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="proceedToStep(4)"
                class="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
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
        <!-- ========================================================================= -->
        <!-- STEP 4: PHOTO & DOCUMENT ATTACHMENTS                                      -->
        <!-- ========================================================================= -->
        @if (currentStep() === 4) {
          <div class="space-y-5 animate-in fade-in duration-150">

            <!-- Candidate Photograph Upload (Double-Click Component) -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-4 bg-[#0F172A] rounded-full"></span>
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-1.5">
                    <span>Candidate Photograph</span>
                    <span class="text-rose-500">*</span>
                  </h3>
                </div>
                <span class="text-[10px] text-slate-500">JPG/PNG • Max 2 MB • Passport Format</span>
              </div>

              <div class="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl">
                <!-- Avatar Preview with Double Click Trigger -->
                <div
                  (dblclick)="photoInput.click()"
                  class="w-24 h-28 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0 group relative shadow-2xs"
                  title="Double click to Upload Image"
                >
                  @if (formData.candidatePhotoUrl) {
                    <img [src]="formData.candidatePhotoUrl" alt="Candidate Photo" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                      Double Click
                    </div>
                  } @else {
                    <svg class="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="text-[9px] text-slate-400 text-center font-semibold mt-1 px-1">
                      Double click to upload
                    </span>
                  }
                </div>

                <div class="flex-1 space-y-2 text-center sm:text-left">
                  <div class="space-y-0.5">
                    <span class="text-xs font-bold text-slate-800 block">
                      {{ formData.candidatePhotoName || 'Upload Candidate Photograph' }}
                    </span>
                    <p class="text-[11px] text-slate-500 m-0">
                      Standard passport size photograph with plain background. Double-click the photo frame or click the button below.
                    </p>
                  </div>

                  <div class="flex items-center gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      (click)="photoInput.click()"
                      class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-800 rounded-lg font-semibold text-xs transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Choose Image</span>
                    </button>
                    <input
                      #photoInput
                      type="file"
                      accept="image/jpeg,image/png"
                      (change)="onPhotoUploaded($event)"
                      class="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 10: Attachment / Documents Table -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-4 bg-[#0F172A] rounded-full"></span>
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                    Attachment / Documents
                  </h3>
                  <span class="text-[11px] text-slate-500">({{ formData.documents.length }} documents configured)</span>
                </div>

                <button
                  type="button"
                  (click)="addDocumentRow()"
                  class="px-3 py-1.5 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  <span class="text-sm leading-none font-bold">+</span>
                  <span>Add Document</span>
                </button>
              </div>

              <!-- Documents Table -->
              <div class="overflow-x-auto bg-white border border-slate-200 rounded-lg">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10.5px]">
                    <tr>
                      <th class="py-2.5 px-3 w-10 text-center">#</th>
                      <th class="py-2.5 px-3 w-48">Document Type</th>
                      <th class="py-2.5 px-3 min-w-[200px]">Document Name *</th>
                      <th class="py-2.5 px-3 min-w-[220px]">Upload / Attach</th>
                      <th class="py-2.5 px-3 w-28 text-center">Status</th>
                      <th class="py-2.5 px-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (doc of formData.documents; track doc.id; let idx = $index) {
                      <tr class="hover:bg-slate-50/50">
                        <td class="py-2 px-3 text-center text-slate-400 font-mono">{{ idx + 1 }}</td>
                        
                        <!-- Document Type Dropdown -->
                        <td class="py-2 px-3">
                          <select
                            [(ngModel)]="doc.docType"
                            class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-blue-600"
                          >
                            @for (type of documentTypeOptions; track type) {
                              <option [value]="type">{{ type }}</option>
                            }
                          </select>
                        </td>

                        <!-- Document Name Input -->
                        <td class="py-2 px-3">
                          <input
                            type="text"
                            [(ngModel)]="doc.docName"
                            placeholder="Enter document title"
                            class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                        </td>

                        <!-- Upload File Input -->
                        <td class="py-2 px-3">
                          <div class="flex items-center gap-2">
                            <label class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer shrink-0">
                              <span>Choose File</span>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                (change)="onDocumentFileSelected(doc, $event)"
                                class="hidden"
                              />
                            </label>
                            <span class="text-[11px] text-slate-600 truncate max-w-[150px]" [title]="doc.fileName || 'No file chosen'">
                              {{ doc.fileName || 'No file chosen' }}
                            </span>
                          </div>
                        </td>

                        <!-- Status Badge -->
                        <td class="py-2 px-3 text-center">
                          @if (doc.status === 'UPLOADED') {
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ Uploaded
                            </span>
                          } @else {
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Pending
                            </span>
                          }
                        </td>

                        <!-- Delete Row Action -->
                        <td class="py-2 px-3 text-center">
                          <button
                            type="button"
                            (click)="removeDocumentRow(idx)"
                            class="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Remove Document Row"
                            [disabled]="formData.documents.length <= 1"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Batch Mapping Confirmation Bar -->
            <div class="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div class="space-y-1 text-center sm:text-left">
                <span class="text-[11px] text-blue-300 font-bold uppercase tracking-wider block">
                  Mapping Target Batch: {{ batch().batchCode }}
                </span>
                <span class="text-sm font-semibold text-slate-100 block">
                  Candidate: {{ formData.aspirantName || 'New Aspirant' }} (Aadhaar: {{ formData.aadhaarNo || 'XXXX-XXXX-XXXX' }})
                </span>
                <span class="text-[11px] text-slate-400 block">
                  SDC: {{ batch().sdcName }} • Course: {{ batch().courseName }}
                </span>
              </div>

              <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  (click)="submitAndMapAspirant()"
                  [disabled]="isSubmitting()"
                  class="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  @if (isSubmitting()) {
                    <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Mapping to Batch...</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Register Aspirant</span>
                  }
                </button>
              </div>
            </div>

          </div>
        }

      </div>

      <!-- SUCCESS MODAL AFTER MAPPING ASPIRANT -->
      @if (showSuccessModal()) {
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div class="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div class="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white text-center">
              <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2.5">
                <svg class="w-6 h-6 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 class="text-base font-bold m-0 tracking-tight">Aspirant Mapped Successfully!</h2>
              <p class="text-xs text-emerald-100 m-0 mt-0.5">Enrolled into Batch {{ batch().batchCode }}</p>
            </div>

            <div class="p-5 space-y-4">
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Aspirant ID:</span>
                  <span class="font-mono font-bold text-slate-900">{{ createdAspirantId() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Candidate Name:</span>
                  <span class="font-semibold text-slate-800">{{ formData.aspirantName }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Aadhaar (Masked):</span>
                  <span class="font-mono text-slate-700">XXXX-XXXX-{{ formData.aadhaarNo.slice(-4) || '9812' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Batch Code:</span>
                  <span class="font-bold text-blue-700">{{ batch().batchCode }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Batch Status:</span>
                  <span class="font-bold text-emerald-700">ENROLLED (Biometric Ready)</span>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  type="button"
                  (click)="mapAnotherAspirant()"
                  class="w-full sm:w-auto flex-1 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs text-center"
                >
                  Map Another
                </button>

                <button
                  type="button"
                  (click)="goToBatchList()"
                  class="w-full sm:w-auto flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors text-center cursor-pointer border border-slate-300"
                >
                  Batch List
                </button>

                <button
                  type="button"
                  (click)="goToAspirantsList()"
                  class="w-full sm:w-auto flex-1 py-2.5 px-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors text-center cursor-pointer"
                >
                  Aspirants Roster &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Aadhaar Document Viewer Modal -->
      <app-document-viewer-modal
        [isOpen]="isAadhaarViewerOpen()"
        [doc]="aadhaarViewerDoc()"
        title="Aadhaar Card Document Proof"
        (close)="isAadhaarViewerOpen.set(false)"
      ></app-document-viewer-modal>

    </div>
  `
})
export class AspirantMappingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  readonly batchService = inject(BatchService);
  readonly sdcService = inject(SdcService);
  readonly aspirantService = inject(AspirantService);

  currentStep = signal<number>(1);
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);
  showSuccessModal = signal<boolean>(false);
  createdAspirantId = signal<string>('ASP-RJ-2026-98412');

  isAadhaarViewerOpen = signal<boolean>(false);

  readonly defaultAadhaarCardDataUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
      <rect width="600" height="380" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="0" y="0" width="600" height="60" fill="#f8fafc" rx="12"/>
      <rect x="0" y="48" width="600" height="12" fill="#ffffff"/>
      <line x1="0" y1="60" x2="600" y2="60" stroke="#e2e8f0" stroke-width="1.5"/>
      <rect x="0" y="0" width="600" height="5" fill="#f97316"/>
      <text x="30" y="32" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">भारत सरकार</text>
      <text x="30" y="48" font-family="sans-serif" font-size="10" fill="#64748b">Government of India</text>
      <text x="570" y="32" text-anchor="end" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">भारतीय विशिष्ट पहचान प्राधिकरण</text>
      <text x="570" y="48" text-anchor="end" font-family="sans-serif" font-size="10" fill="#64748b">Unique Identification Authority of India</text>
      <rect x="35" y="85" width="105" height="135" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
      <circle cx="87" cy="135" r="28" fill="#1e293b"/>
      <path d="M50 205 C 50 170, 125 170, 125 205 Z" fill="#334155"/>
      <text x="87" y="215" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#94a3b8">PHOTO</text>
      <text x="165" y="105" font-family="sans-serif" font-size="11" fill="#64748b">नाम / Name:</text>
      <text x="165" y="125" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a">राहुल शर्मा / Rahul Sharma</text>
      <text x="165" y="152" font-family="sans-serif" font-size="11" fill="#64748b">जन्म तिथि / DOB:</text>
      <text x="280" y="152" font-family="sans-serif" font-size="13" font-weight="600" fill="#1e293b">15/05/2002</text>
      <text x="165" y="175" font-family="sans-serif" font-size="11" fill="#64748b">लिंग / Gender:</text>
      <text x="280" y="175" font-family="sans-serif" font-size="13" font-weight="600" fill="#1e293b">पुरुष / Male</text>
      <text x="165" y="198" font-family="sans-serif" font-size="11" fill="#64748b">पिता / Father:</text>
      <text x="280" y="198" font-family="sans-serif" font-size="13" font-weight="600" fill="#1e293b">मनोज शर्मा / Manoj Sharma</text>
      <rect x="470" y="85" width="95" height="95" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
      <path d="M480 95 h25 v25 h-25 z M530 95 h25 v25 h-25 z M480 145 h25 v25 h-25 z M515 125 h15 v15 h-15 z M535 135 h15 v15 h-15 z M510 150 h15 v15 h-15 z" fill="#1e293b"/>
      <text x="517" y="193" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#64748b">SECURE QR</text>
      <rect x="0" y="240" width="600" height="70" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="300" y="284" text-anchor="middle" font-family="monospace" font-size="24" font-weight="bold" fill="#dc2626" letter-spacing="4">
        XXXX XXXX 3012
      </text>
      <rect x="0" y="340" width="600" height="40" fill="#ffffff" rx="12"/>
      <line x1="0" y1="340" x2="600" y2="340" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="0" y="375" width="600" height="5" fill="#16a34a"/>
      <text x="300" y="362" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#047857">
        मेरा आधार, मेरी पहचान
      </text>
    </svg>
  `);

  readonly aadhaarViewerDoc = computed(() => ({
    fileName: this.formData.aadhaarDocName || 'Aadhaar_Candidate_Card.pdf',
    fileSize: this.formData.aadhaarDocSize || '1.4 MB',
    uploadDate: 'Today',
    status: 'uploaded' as const,
    fileUrl: this.formData.aadhaarDocUrl || this.defaultAadhaarCardDataUrl
  }));

  viewAadhaarDoc(): void {
    this.isAadhaarViewerOpen.set(true);
  }

  batchId = signal<string>('');
  batch = computed(() => {
    return this.batchService.getBatchById(this.batchId()) || this.batchService.batches()[0];
  });

  documentTypeOptions: string[] = [
    'Aadhaar Card',
    'Jan Aadhaar',
    'Educational Certificate',
    'Caste Certificate',
    'Domicile Certificate',
    'Disability Certificate',
    'Income Certificate',
    'Other'
  ];

  step1Fields: FormFieldConfig[] = [];
  step2PermanentFields: FormFieldConfig[] = [];
  step2CommFields: FormFieldConfig[] = [];
  step2ContactFields: FormFieldConfig[] = [];
  step2Fields: FormFieldConfig[] = [];
  step3Fields: FormFieldConfig[] = [];

  formData: AspirantFormData = {
    // Step 1: Main / Personal Details
    aadhaarNo: '789456123012',
    confirmAadhaarNo: '789456123012',
    janaadhaarId: '2026894123',
    otherIdType: 'PAN Card',
    otherIdNo: 'ABCDE1234F',
    aadhaarDocName: 'Aadhaar_Candidate_Card.pdf',
    aadhaarDocSize: '1.4 MB',
    aadhaarDocUrl: '',

    aspirantName: 'Rahul Sharma',
    gender: 'Male',
    relationType: 'Father',
    relationName: 'Manoj Sharma',
    motherName: 'Sunita Sharma',
    dob: '2002-05-15',
    age: 24,
    educationalQualification: '12th Pass',
    religion: 'Hindu',
    category: 'OBC',
    minority: 'No',
    specialAbility: 'No',
    disabilityType: '',
    areaType: 'Rural',

    // Step 2: Address Details
    permHouseNo: '45-B',
    permStreet: 'Kisan Colony, Sanganer',
    permWard: 'Ward 12',
    permCity: 'Jaipur',
    permDistrict: 'Jaipur',
    permBlock: 'Sanganer',
    permTehsil: 'Sanganer',
    permMunicipality: 'Sanganer Panchayat Samiti',
    permPincode: '302029',
    permAssembly: 'Sanganer',
    permParliament: 'Jaipur Rural',

    isAddressSame: true,

    commHouseNo: '45-B',
    commStreet: 'Kisan Colony, Sanganer',
    commWard: 'Ward 12',
    commCity: 'Jaipur',
    commDistrict: 'Jaipur',
    commBlock: 'Sanganer',
    commTehsil: 'Sanganer',
    commMunicipality: 'Sanganer Panchayat Samiti',
    commPincode: '302029',

    mobileNo: '9876543210',
    altMobileNo: '9829012345',
    landlineNo: '',
    email: 'rahul.sharma@example.com',

    // Step 3: Bank & Worker Details
    bankAccountNo: '312456789012',
    bankAccountName: 'Rahul Sharma',
    bankAccountType: 'Savings',
    bankName: 'State Bank of India',
    bankBranch: 'Sanganer Branch, Jaipur',
    ifscCode: 'SBIN0001234',
    micrCode: '302002015',

    annualFamilyIncome: 120000,
    incomeSlab: '1L-2.5L',
    economicStatus: 'APL',
    economicCardNo: 'RAT-JP-2026-9812',

    bocwWorker: 'No',
    bocwNo: '',
    mgnregaWorker: 'No',
    mgnregaNo: '',
    isRsby: 'No',
    rsbyNo: '',
    gramsabhaPip: 'No',
    nrlmMember: 'No',
    nrlmNo: '',

    epicNo: 'RJ/01/042/981234',

    // Step 4: Sector Preference, Photo & Documents
    preferredSectors: ['Aerospace and Aviation', 'Electronics'],
    candidatePhotoUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect width="120" height="150" fill="%23f1f5f9"/%3E%3Ccircle cx="60" cy="50" r="28" fill="%230b3558"/%3E%3Cpath d="M20 135 C 20 95, 100 95, 100 135 Z" fill="%23174a6e"/%3E%3Ctext x="60" y="145" text-anchor="middle" font-family="sans-serif" font-size="9" fill="%2364748b"%3EPASSPORT PHOTO%3C/text%3E%3C/svg%3E',
    candidatePhotoName: 'Rahul_Sharma_Passport_Photo.jpg',
    documents: [
      {
        id: 'doc-1',
        docType: 'Aadhaar Card',
        docName: 'Aadhaar Card Copy',
        fileName: 'Aadhaar_Rahul_Sharma.pdf',
        fileSize: '1.4 MB',
        uploadedAt: 'Today',
        status: 'UPLOADED'
      },
      {
        id: 'doc-2',
        docType: 'Educational Certificate',
        docName: '12th Senior Secondary Marksheet',
        fileName: 'Class_12_Marksheet.pdf',
        fileSize: '2.1 MB',
        uploadedAt: 'Today',
        status: 'UPLOADED'
      },
      {
        id: 'doc-3',
        docType: 'Domicile Certificate',
        docName: 'Rajasthan Bonafide Certificate',
        fileName: 'Bonafide_Certificate.pdf',
        fileSize: '950 KB',
        uploadedAt: 'Today',
        status: 'UPLOADED'
      },
      {
        id: 'doc-4',
        docType: 'Caste Certificate',
        docName: 'OBC Category Certificate',
        fileName: '',
        fileSize: '',
        status: 'PENDING'
      }
    ]
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['batchId']) {
        this.batchId.set(params['batchId']);
      }
    });

    this.route.queryParams.subscribe(q => {
      if (q['batchId']) {
        this.batchId.set(q['batchId']);
      }
    });

    // Fallback batchId if none in url
    if (!this.batchId() && this.batchService.batches().length > 0) {
      this.batchId.set(this.batchService.batches()[0].id);
    }

    // Set initial preferred sector from batch
    const currentBatch = this.batch();
    if (currentBatch && currentBatch.sector) {
      if (!this.formData.preferredSectors.includes(currentBatch.sector)) {
        this.formData.preferredSectors.unshift(currentBatch.sector);
      }
    }

    // Initialize Form Fields for Steps 1, 2, and 3
    this.step1Fields = getStep1PersonalFields((dob, model) => {
      model.age = calculateAgeFromDob(dob);
    });
    this.step2PermanentFields = getStep2PermanentAddressFields();
    this.step2CommFields = getStep2CommAddressFields();
    this.step2ContactFields = getStep2ContactFields();
    this.step2Fields = getStep2AddressFields();
    this.step3Fields = getStep3EconomicWorkerFields();
  }

  goBack(): void {
    this.router.navigate(['/batches']);
  }

  goToStep(step: number): void {
    if (step < 1 || step > 4) return;
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  proceedToStep(step: number): void {
    this.errorMessage.set('');
    
    // Quick validation before advancing
    if (this.currentStep() === 1) {
      if (!this.formData.aspirantName) {
        this.errorMessage.set('Please provide the Aspirant Name.');
        return;
      }
      if (!this.formData.aadhaarNo) {
        this.errorMessage.set('Aadhaar number is mandatory.');
        return;
      }
      if (this.formData.aadhaarNo !== this.formData.confirmAadhaarNo) {
        this.errorMessage.set('Aadhaar number and Confirm Aadhaar number do not match.');
        return;
      }
    } else if (this.currentStep() === 2) {
      if (!this.formData.mobileNo) {
        this.errorMessage.set('Mobile number is mandatory.');
        return;
      }
      if (!this.formData.permCity || !this.formData.permPincode) {
        this.errorMessage.set('Please provide complete permanent address (Village/City and Pincode).');
        return;
      }
    }

    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAadhaarUploaded(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.formData.aadhaarDocName = file.name;
      this.formData.aadhaarDocSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.aadhaarDocUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Also update the Aadhaar Card item in the Step 4 documents table
      const aadhaarDoc = this.formData.documents.find(d => d.docType === 'Aadhaar Card');
      if (aadhaarDoc) {
        aadhaarDoc.fileName = file.name;
        aadhaarDoc.fileSize = this.formData.aadhaarDocSize;
        aadhaarDoc.status = 'UPLOADED';
      }
    }
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

  onPhotoUploaded(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.formData.candidatePhotoName = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.candidatePhotoUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addDocumentRow(): void {
    this.formData.documents.push({
      id: `doc-${Date.now()}`,
      docType: 'Other',
      docName: '',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    });
  }

  removeDocumentRow(index: number): void {
    if (this.formData.documents.length > 1) {
      this.formData.documents.splice(index, 1);
    }
  }

  onDocumentFileSelected(doc: AspirantDocumentItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      doc.fileName = file.name;
      doc.fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      doc.status = 'UPLOADED';
      if (!doc.docName) {
        doc.docName = doc.docType;
      }
    }
  }

  submitAndMapAspirant(): void {
    this.errorMessage.set('');
    if (!this.formData.aspirantName) {
      this.errorMessage.set('Aspirant name is mandatory.');
      this.currentStep.set(1);
      return;
    }
    if (!this.formData.mobileNo) {
      this.errorMessage.set('Mobile number is mandatory.');
      this.currentStep.set(2);
      return;
    }

    const currentBatch = this.batch();
    if (!currentBatch) {
      this.errorMessage.set('Target batch not found.');
      return;
    }

    if (currentBatch.mappedAspirantsCount >= currentBatch.maxStrength) {
      this.errorMessage.set('This batch has reached maximum approved candidate capacity.');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);

      // Mask Aadhaar e.g. XXXX-XXXX-1234
      const aadhaarLast4 = this.formData.aadhaarNo.slice(-4) || '9812';
      const masked = `XXXX-XXXX-${aadhaarLast4}`;

      // Map to batch service
      this.batchService.mapCandidateToBatch(currentBatch.id, {
        name: this.formData.aspirantName,
        aadhaarMasked: masked,
        mobile: this.formData.mobileNo
      });

      // Also register full aspirant in AspirantService across SDC & Scheme
      const sdc = this.sdcService.getSdcById(currentBatch.sdcId);
      const newAspirant = this.aspirantService.addAspirant(this.formData, currentBatch, sdc);

      this.createdAspirantId.set(newAspirant.id);
      this.showSuccessModal.set(true);
    }, 900);
  }

  mapAnotherAspirant(): void {
    this.showSuccessModal.set(false);
    // Reset demographic values for the next candidate
    this.formData.aspirantName = '';
    this.formData.aadhaarNo = '';
    this.formData.confirmAadhaarNo = '';
    this.formData.mobileNo = '';
    this.formData.email = '';
    this.formData.dob = '';
    this.formData.age = '';
    this.currentStep.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToBatchList(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/batches']);
  }

  goToAspirantsList(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/aspirants']);
  }
}
