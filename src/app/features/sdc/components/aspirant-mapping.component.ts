import { Component, inject, signal, computed, OnInit, ViewChild, TemplateRef } from '@angular/core';
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
  calculateAgeFromDob,
  getDefaultAspirantDocuments
} from '../config/aspirant-form.config';

@Component({
  selector: 'app-aspirant-mapping',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FormSdcComponent, DocumentViewerModalComponent],
  template: `
    <div class="min-h-full bg-white py-4 sm:py-6 px-4 sm:px-8 font-sans selection:bg-[#174A6E] selection:text-white" style="font-family: 'Inter', sans-serif;">
      
      <!-- Direct-on-Page Container (matching SDC & Batch forms) -->
      <div class="w-full space-y-4">
        
        <!-- Aadhaar Card Upload Control Template for Identity Details in Step 1 -->
        <ng-template #aadhaarUploadTemplate>
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-1">
              <label class="block text-xs font-medium text-slate-700 leading-tight select-none truncate">
                Aadhaar Card Document Proof <span class="text-rose-500 font-bold">*</span>
              </label>
              <span class="text-[10px] text-slate-400 font-mono shrink-0">PDF/JPG • Max 5MB</span>
            </div>

            @if (formData.aadhaarDocName) {
              <div class="h-9.5 flex items-center justify-between px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs gap-2 shadow-2xs hover:border-slate-400 transition-colors">
                <div class="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                  <!-- PDF Badge or Image icon based on file type -->
                  @if (formData.aadhaarDocName.toLowerCase().endsWith('.pdf')) {
                    <span class="w-5 h-5 rounded bg-rose-600 text-white text-[7.5px] font-extrabold flex items-center justify-center tracking-tight shrink-0">PDF</span>
                  } @else {
                    <svg class="w-4 h-4 shrink-0 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  <span class="font-semibold text-slate-800 truncate text-xs" [title]="formData.aadhaarDocName">
                    {{ formData.aadhaarDocName }}
                  </span>
                  <span class="text-[10px] text-slate-400 shrink-0">({{ formData.aadhaarDocSize || '1.4 MB' }})</span>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <!-- View Option -->
                  <button
                    type="button"
                    (click)="viewAadhaarDoc()"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#174A6E] hover:text-[#0B3558] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                    title="View Aadhaar Card"
                  >
                    <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View</span>
                  </button>

                  <!-- Change Option -->
                  <label class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer shadow-2xs">
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Change</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onAadhaarUploaded($event)" class="hidden" />
                  </label>
                </div>
              </div>
            } @else {
              <label class="h-9.5 flex items-center justify-between px-3 border border-dashed border-slate-300 rounded-lg cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-100/70 hover:border-rose-400 shadow-2xs group">
                <div class="flex items-center gap-2 text-slate-600 truncate">
                  <!-- Red PDF icon in empty state -->
                  <span class="w-5 h-5 rounded bg-rose-600 text-white text-[7.5px] font-extrabold flex items-center justify-center tracking-tight shrink-0 group-hover:bg-rose-700 transition-colors">PDF</span>
                  <span class="text-xs truncate text-slate-500">Upload Aadhaar Card (PDF / JPG)</span>
                </div>
                <span class="px-2.5 py-1 bg-white text-slate-700 text-[11px] font-semibold rounded border border-slate-200 shadow-2xs shrink-0">
                  Browse
                </span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onAadhaarUploaded($event)" class="hidden" />
              </label>
            }
          </div>
        </ng-template>

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
                <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug m-0">
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
                [style.background-color]="currentStep() > 1 ? '#16a34a' : currentStep() === 1 ? '#174A6E' : '#cbd5e1'"
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
                [style.background-color]="currentStep() > 2 ? '#16a34a' : currentStep() === 2 ? '#174A6E' : '#cbd5e1'"
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
                [style.background-color]="currentStep() > 3 ? '#16a34a' : currentStep() === 3 ? '#174A6E' : '#cbd5e1'"
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
                <span class="block leading-tight font-bold text-slate-900 truncate">3. Bank</span>
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
                [style.background-color]="currentStep() === 4 ? '#174A6E' : '#cbd5e1'"
                style="color: #ffffff !important;"
              >
                <span style="color: #ffffff !important; font-weight: 700; font-size: 11px;">4</span>
              </span>
              <div class="truncate">
                <span class="block leading-tight font-bold text-slate-900 truncate">4. Photo &amp; Documents</span>
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
        <!-- STEP 1: MAIN / IDENTITY DETAILS                                -->
        <!-- ========================================================================= -->
        @if (currentStep() === 1) {
          <div class="space-y-4 animate-in fade-in duration-150">
            
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
                class="px-6 py-2.5 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
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
                <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
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
                class="px-6 py-2.5 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Bank Details</span>
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
                class="px-6 py-2.5 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
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
                  <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
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
                    @if (formData.candidatePhotoUrl) {
                      <div class="text-[11px] font-semibold text-emerald-700 pt-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
                        <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Uploaded • {{ formData.candidatePhotoName || 'Candidate_Photo.jpg' }}</span>
                      </div>
                    }
                  </div>

                  <div class="flex items-center gap-2 justify-center sm:justify-start">
                    @if (formData.candidatePhotoUrl) {
                      <!-- View Option (only when photo is uploaded) -->
                      <button
                        type="button"
                        (click)="viewCandidatePhoto()"
                        class="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#174A6E] border border-slate-300 rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                        title="View candidate photograph"
                      >
                        <svg class="w-3.5 h-3.5 text-[#174A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View</span>
                      </button>
                    }

                    <button
                      type="button"
                      (click)="photoInput.click()"
                      class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-800 rounded-lg font-semibold text-xs transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>{{ formData.candidatePhotoUrl ? 'Change Image' : 'Choose Image' }}</span>
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

            <!-- Section 10: Attachment / Documents (Matching screenshot card style) -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                    Attachment / Documents
                  </h3>
                  <span class="text-[11px] text-slate-500 font-medium">({{ formData.documents.length }} Documents Configured)</span>
                </div>
              </div>

              <!-- Documents Card List (Items 3 through 15) -->
              <div class="space-y-2.5">
                @for (doc of formData.documents; track doc.id; let idx = $index) {
                  <div class="border border-slate-200 rounded-xl bg-white p-3 sm:p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <!-- Left: Circle Number + Title, Badges, Subtitle & Status -->
                    <div class="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <!-- Circle Number Badge (Red / Rose outlined circle) -->
                      <div class="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold flex items-center justify-center shrink-0 text-xs sm:text-sm shadow-2xs">
                        {{ doc.itemNumber || (idx + 1) }}
                      </div>

                      <!-- Document Information -->
                      <div class="min-w-0 flex-1 space-y-0.5">
                        <!-- Line 1: Title & Mandatory Asterisk / Condition Note -->
                        <div class="flex flex-wrap items-center gap-1.5">
                          <h4 class="font-bold text-xs sm:text-sm text-slate-900 tracking-tight leading-snug m-0">
                            {{ doc.docName }}
                          </h4>
                          @if (doc.badgeType === 'mandatory') {
                            <span class="text-rose-500 font-bold text-base leading-none" title="Mandatory">*</span>
                          } @else if (doc.conditionNote) {
                            <span class="text-xs text-slate-500 font-normal">
                              ({{ doc.conditionNote }})
                            </span>
                          }
                        </div>

                        <!-- Line 2: Subtitle Description -->
                        <p class="text-[11.5px] text-slate-500 m-0 leading-normal">
                          {{ doc.description || 'Statutory proof document for applicant eligibility verification' }}
                        </p>

                        @if (doc.status === 'UPLOADED') {
                          <div class="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Uploaded • {{ doc.fileName }} ({{ doc.fileSize }})</span>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Right: Action Button(s) -->
                    <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                      @if (doc.status === 'UPLOADED') {
                        <!-- View Option -->
                        <button
                          type="button"
                          (click)="viewAspirantDoc(doc)"
                          class="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-[#174A6E] border border-slate-300 rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                          title="View uploaded document"
                        >
                          <svg class="w-3.5 h-3.5 text-[#174A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View</span>
                        </button>

                        <!-- Change Option -->
                        <label class="px-3.5 py-1.5 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95">
                          <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Change</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onAspirantDocSelected(doc, $event)" class="hidden" />
                        </label>
                      } @else {
                        <!-- Upload PDF Button (Matching Screenshot) -->
                        <label class="px-4 py-2 bg-[#174A6E] hover:bg-[#123B59] active:scale-95 text-white rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-2">
                          <span class="w-4 h-4 rounded bg-rose-500 text-white text-[8px] font-extrabold flex items-center justify-center tracking-tighter">PDF</span>
                          <span>Upload PDF</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onAspirantDocSelected(doc, $event)" class="hidden" />
                        </label>
                      }
                    </div>

                  </div>
                }
              </div>

            </div>

            <!-- Batch Mapping Confirmation Bar -->
            <div class="p-4 bg-linear-to-r from-[#0B3558] to-[#174A6E] text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
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
            <div class="bg-linear-to-r from-emerald-600 to-teal-700 p-5 text-white text-center">
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
                  class="w-full sm:w-auto flex-1 py-2.5 px-3 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg font-bold text-xs shadow-xs transition-colors text-center cursor-pointer"
                >
                  Aspirants Roster &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Universal Document Viewer Modal (Supports Aadhaar and all Attachments) -->
      <app-document-viewer-modal
        [isOpen]="isDocViewerOpen()"
        [doc]="activeViewerDoc()"
        [title]="activeViewerTitle()"
        (close)="isDocViewerOpen.set(false)"
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

  @ViewChild('aadhaarUploadTemplate', { static: true }) aadhaarUploadTemplate!: TemplateRef<any>;

  isDocViewerOpen = signal<boolean>(false);
  activeViewerTitle = signal<string>('Aadhaar Card Document Proof');
  activeViewerDoc = signal<{
    fileName: string;
    fileSize: string;
    uploadDate: string;
    status: 'uploaded' | 'empty' | 'uploading';
    fileUrl: string;
  }>({
    fileName: 'Aadhaar_Candidate_Card.pdf',
    fileSize: '1.4 MB',
    uploadDate: 'Today',
    status: 'uploaded',
    fileUrl: ''
  });

  isAadhaarViewerOpen = computed(() => this.isDocViewerOpen());
  aadhaarViewerDoc = computed(() => this.activeViewerDoc());

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

  viewAadhaarDoc(): void {
    this.activeViewerTitle.set('Aadhaar Card Document Proof');
    this.activeViewerDoc.set({
      fileName: this.formData.aadhaarDocName || 'Aadhaar_Candidate_Card.pdf',
      fileSize: this.formData.aadhaarDocSize || '1.4 MB',
      uploadDate: 'Today',
      status: 'uploaded',
      fileUrl: this.formData.aadhaarDocUrl || this.defaultAadhaarCardDataUrl
    });
    this.isDocViewerOpen.set(true);
  }

  readonly defaultCandidatePhotoUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
      <defs>
        <linearGradient id="photoBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#photoBg)" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="15" y="15" width="370" height="470" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="200" cy="180" r="75" fill="#1e293b"/>
      <path d="M70 420 C 70 280, 330 280, 330 420 Z" fill="#334155"/>
      <rect x="50" y="430" width="300" height="40" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
      <text x="200" y="455" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a" letter-spacing="1">CANDIDATE PASSPORT PHOTO</text>
    </svg>
  `);

  viewCandidatePhoto(): void {
    this.activeViewerTitle.set('Candidate Photograph');
    this.activeViewerDoc.set({
      fileName: this.formData.candidatePhotoName || 'Candidate_Photograph.jpg',
      fileSize: '350 KB',
      uploadDate: 'Today',
      status: 'uploaded',
      fileUrl: this.formData.candidatePhotoUrl || this.defaultCandidatePhotoUrl
    });
    this.isDocViewerOpen.set(true);
  }

  viewAspirantDoc(doc: AspirantDocumentItem): void {
    this.activeViewerTitle.set(`${doc.itemNumber ? doc.itemNumber + '. ' : ''}${doc.docName}`);
    this.activeViewerDoc.set({
      fileName: doc.fileName || `${doc.docName}.pdf`,
      fileSize: doc.fileSize || '1.2 MB',
      uploadDate: doc.uploadedAt || 'Today',
      status: 'uploaded',
      fileUrl: doc.fileUrl || this.generateDocumentPreviewSvg(doc.docName, doc.description || '')
    });
    this.isDocViewerOpen.set(true);
  }

  generateDocumentPreviewSvg(title: string, sub: string): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
        <rect width="600" height="750" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="0" y="0" width="600" height="12" fill="#174a6e"/>
        <circle cx="300" cy="70" r="28" fill="#f1f5f9" stroke="#cbd5e1"/>
        <text x="300" y="75" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#174a6e">GOVT OF RAJASTHAN</text>
        <text x="300" y="130" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a">${title.toUpperCase()}</text>
        <text x="300" y="155" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b">${sub}</text>
        <line x1="60" y1="175" x2="540" y2="175" stroke="#e2e8f0" stroke-width="1.5"/>
        <rect x="60" y="200" width="480" height="360" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
        <text x="90" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#334155">CANDIDATE INFORMATION</text>
        <text x="90" y="280" font-family="sans-serif" font-size="12" fill="#64748b">Candidate Name: <tspan font-weight="bold" fill="#0f172a">${this.formData.aspirantName || 'Rahul Sharma'}</tspan></text>
        <text x="90" y="310" font-family="sans-serif" font-size="12" fill="#64748b">Aadhaar (Masked): <tspan font-weight="bold" fill="#0f172a">XXXX-XXXX-${this.formData.aadhaarNo ? this.formData.aadhaarNo.slice(-4) : '3012'}</tspan></text>
        <text x="90" y="340" font-family="sans-serif" font-size="12" fill="#64748b">Application ID: <tspan font-weight="bold" fill="#0f172a">ASP-RJ-2026-9812</tspan></text>
        <text x="90" y="370" font-family="sans-serif" font-size="12" fill="#64748b">Verification Status: <tspan font-weight="bold" fill="#16a34a">VERIFIED &amp; ATTESTED</tspan></text>
        <rect x="90" y="410" width="420" height="100" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
        <text x="110" y="445" font-family="sans-serif" font-size="11" fill="#475569">Certified that this document has been scanned and verified against</text>
        <text x="110" y="465" font-family="sans-serif" font-size="11" fill="#475569">official records for ISMS Skill Development Registration.</text>
        <rect x="380" y="590" width="160" height="70" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="4 2"/>
        <text x="460" y="630" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b">OFFICIAL SEAL</text>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
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
    // Step 1: Identity & Personal Details — starts empty
    aadhaarNo: '',
    confirmAadhaarNo: '',
    janaadhaarId: '',
    otherIdType: 'None',
    otherIdNo: '',
    aadhaarDocName: '',
    aadhaarDocSize: '',
    aadhaarDocUrl: '',

    aspirantName: '',
    gender: '',
    relationType: '',
    relationName: '',
    motherName: '',
    dob: '',
    age: '',
    educationalQualification: '',
    religion: '',
    category: '',
    minority: 'No',
    specialAbility: 'No',
    disabilityType: '',
    areaType: '',

    // Step 2: Address Details — starts empty
    permHouseNo: '',
    permStreet: '',
    permWard: '',
    permCity: '',
    permDistrict: '',
    permBlock: '',
    permTehsil: '',
    permMunicipality: '',
    permPincode: '',
    permAssembly: '',
    permParliament: '',

    isAddressSame: false,

    commHouseNo: '',
    commStreet: '',
    commWard: '',
    commCity: '',
    commDistrict: '',
    commBlock: '',
    commTehsil: '',
    commMunicipality: '',
    commPincode: '',

    mobileNo: '',
    altMobileNo: '',
    landlineNo: '',
    email: '',

    // Step 3: Bank & Worker Details — starts empty
    bankAccountNo: '',
    bankAccountName: '',
    bankAccountType: 'Savings',
    bankName: '',
    bankBranch: '',
    ifscCode: '',
    micrCode: '',

    annualFamilyIncome: '',
    incomeSlab: '',
    economicStatus: '',
    economicCardNo: '',

    bocwWorker: 'No',
    bocwNo: '',
    mgnregaWorker: 'No',
    mgnregaNo: '',
    isRsby: 'No',
    rsbyNo: '',
    gramsabhaPip: 'No',
    nrlmMember: 'No',
    nrlmNo: '',

    epicNo: '',

    // Step 4: Sector Preference, Photo & Documents — starts empty
    preferredSectors: [],
    candidatePhotoUrl: '',
    candidatePhotoName: '',
    documents: getDefaultAspirantDocuments()
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
    }, this.aadhaarUploadTemplate);
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
      if (!/^[0-9]{12}$/.test(this.formData.aadhaarNo)) {
        this.errorMessage.set('Aadhaar number must be exactly 12 digits (numbers only, no spaces).');
        return;
      }
      if (this.formData.janaadhaarId && !/^[0-9]{10}$/.test(this.formData.janaadhaarId)) {
        this.errorMessage.set('Jan Aadhaar ID must be exactly 10 digits.');
        return;
      }
      // Validate Other ID number based on selected type
      if (this.formData.otherIdNo && this.formData.otherIdType && this.formData.otherIdType !== 'None') {
        const idVal = this.formData.otherIdNo.trim().toUpperCase();
        const idType = this.formData.otherIdType;
        if (idType === 'PAN Card') {
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idVal)) {
            this.errorMessage.set('PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).');
            return;
          }
        } else if (idType === 'Voter ID') {
          if (!/^[A-Z]{3}[0-9]{7}$/.test(idVal)) {
            this.errorMessage.set('Voter ID (EPIC) must be 10 characters: 3 letters followed by 7 digits (e.g. ABC1234567).');
            return;
          }
        } else if (idType === 'Passport') {
          if (!/^[A-Z]{1}[0-9]{7}$/.test(idVal)) {
            this.errorMessage.set('Passport No. must be 8 characters: 1 letter followed by 7 digits (e.g. A1234567).');
            return;
          }
        } else if (idType === 'Driving License') {
          if (idVal.length < 10 || idVal.length > 16 || !/^[A-Z]{2}[0-9]{2}[0-9A-Z]{0,12}$/.test(idVal)) {
            this.errorMessage.set('Driving License must be 10–16 alphanumeric characters (e.g. RJ0120110012345).');
            return;
          }
        }
      }
    } else if (this.currentStep() === 2) {
      if (!this.formData.mobileNo) {
        this.errorMessage.set('Mobile number is mandatory.');
        return;
      }
      if (!/^[6-9][0-9]{9}$/.test(this.formData.mobileNo)) {
        this.errorMessage.set('Mobile number must be 10 digits starting with 6, 7, 8, or 9.');
        return;
      }
      if (this.formData.altMobileNo && !/^[6-9][0-9]{9}$/.test(this.formData.altMobileNo)) {
        this.errorMessage.set('Alternate mobile number must be 10 digits starting with 6, 7, 8, or 9.');
        return;
      }
      if (!this.formData.permCity || !this.formData.permPincode) {
        this.errorMessage.set('Please provide complete permanent address (Village/City and Pincode).');
        return;
      }
      if (!/^[1-9][0-9]{5}$/.test(this.formData.permPincode)) {
        this.errorMessage.set('Permanent address Pincode must be a valid 6-digit code.');
        return;
      }
      if (this.formData.commPincode && !/^[1-9][0-9]{5}$/.test(this.formData.commPincode)) {
        this.errorMessage.set('Communication address Pincode must be a valid 6-digit code.');
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
    const nextNumber = this.formData.documents.length > 0 
      ? Math.max(...this.formData.documents.map(d => d.itemNumber || 0)) + 1 
      : 14;
    this.formData.documents.push({
      id: `doc-${Date.now()}`,
      itemNumber: nextNumber,
      docType: 'Other Document',
      docName: 'Additional Supporting Document',
      badgeLabel: 'Optional',
      badgeType: 'optional',
      description: 'Additional statutory, academic, or vocational certificate',
      conditionNote: 'Optional',
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

  onAspirantDocSelected(doc: AspirantDocumentItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      doc.fileName = file.name;
      doc.fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      doc.status = 'UPLOADED';
      doc.uploadedAt = 'Just now';
      
      const reader = new FileReader();
      reader.onload = (e) => {
        doc.fileUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onDocumentFileSelected(doc: AspirantDocumentItem, event: Event): void {
    this.onAspirantDocSelected(doc, event);
  }

  submitAndMapAspirant(): void {
    this.errorMessage.set('');
    if (!this.formData.aspirantName) {
      this.errorMessage.set('Aspirant name is mandatory.');
      this.currentStep.set(1);
      return;
    }
    if (!this.formData.aadhaarNo || !/^[0-9]{12}$/.test(this.formData.aadhaarNo)) {
      this.errorMessage.set('Aadhaar number must be exactly 12 digits.');
      this.currentStep.set(1);
      return;
    }
    if (!this.formData.mobileNo || !/^[6-9][0-9]{9}$/.test(this.formData.mobileNo)) {
      this.errorMessage.set('Mobile number must be 10 digits starting with 6, 7, 8, or 9.');
      this.currentStep.set(2);
      return;
    }
    if (this.formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(this.formData.ifscCode.toUpperCase())) {
      this.errorMessage.set('IFSC Code must be 11 characters: 4 letters, 0, then 6 alphanumerics (e.g. SBIN0001234).');
      this.currentStep.set(3);
      return;
    }
    if (this.formData.bankAccountNo && !/^[0-9]{9,18}$/.test(this.formData.bankAccountNo)) {
      this.errorMessage.set('Bank account number must be 9 to 18 digits.');
      this.currentStep.set(3);
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
