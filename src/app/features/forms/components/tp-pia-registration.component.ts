import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TpPiaRegistrationService } from '../services/tp-pia-registration.service';
import { FormValidationService } from '../services/form-validation.service';
import { TabOrgDetailsComponent } from './tab-org-details/tab-org-details.component';
import { TabAuthorizedOrgComponent } from './tab-authorized-org/tab-authorized-org.component';
import { TabBankDetailsComponent } from './tab-bank-details/tab-bank-details.component';
import { TabDocumentsComponent } from './tab-documents/tab-documents.component';

export interface TabItem {
  id: number;
  label: string;
  shortLabel: string;
  icon: string;
}

@Component({
  selector: 'app-tp-pia-registration',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TabOrgDetailsComponent,
    TabAuthorizedOrgComponent,
    TabBankDetailsComponent,
    TabDocumentsComponent,
  ],
  template: `
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 font-sans text-sm relative">
      <div>
        <!-- 1. Government of Rajasthan Official Header -->
        <header class="relative bg-[#1a2656] text-white shadow-md">
          <div class="w-full px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center">
            <!-- Left: Ashoka Lion Emblem & State Portal Titles -->
            <div class="flex items-center gap-2.5 sm:gap-3.5">
              <!-- Official State Emblem (Ashoka Lion Capital with Satyameva Jayate) -->
              <div class="shrink-0 flex items-center justify-center">
                <img
                  src="/emblem.png"
                  alt="State Emblem of India - Satyameva Jayate"
                  class="h-11 sm:h-14 w-auto object-contain drop-shadow-sm select-none"
                />
              </div>

              <div class="min-w-0">
                <p class="text-[10px] sm:text-xs text-slate-200/90 font-medium tracking-wide truncate">
                  राजस्थान सरकार &nbsp;•&nbsp; Government of Rajasthan
                </p>
                <h1 class="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-none mt-0.5">
                  ISMS 2.0
                </h1>
                <p class="text-[10px] sm:text-xs text-slate-200/80 font-normal mt-0.5 truncate">
                  Integrated Scheme Management System
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Saffron / Orange Accent Stripe -->
          <div class="h-1 bg-[#ea580c] w-full"></div>
        </header>

        <!-- 2. Connected Stepper Bar (Responsive & Smoothly Scrollable) -->
        <nav class="bg-white border-b border-slate-200 shadow-2xs">
          <div class="w-full px-2.5 sm:px-5 lg:px-8 py-2 sm:py-2.5">
            <div class="flex items-center justify-start md:justify-between overflow-x-auto no-scrollbar scroll-smooth gap-1 sm:gap-2 w-full pb-0.5">
              @for (tab of tabs; track tab.id; let idx = $index; let last = $last) {
                <button 
                  type="button" 
                  [id]="'step-btn-' + tab.id"
                  (click)="switchTab(tab.id)"
                  class="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer text-left group focus:outline-none py-1 px-1.5 sm:px-2 rounded-lg hover:bg-slate-50 transition"
                  [attr.aria-label]="tab.label"
                >
                  <!-- Step Circle -->
                  <div 
                    class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition"
                    [ngClass]="activeTab() === tab.id 
                      ? 'bg-[#1a2656] text-white shadow-xs' 
                      : tabStatuses()[tab.id].isCompleted
                        ? 'bg-emerald-600 text-white'
                        : tabStatuses()[tab.id].isSubmittedInvalid
                          ? 'bg-rose-500 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-500 group-hover:border-slate-400'"
                  >
                    @if (activeTab() === tab.id) {
                      {{ tab.id }}
                    } @else if (tabStatuses()[tab.id].isCompleted) {
                      ✓
                    } @else if (tabStatuses()[tab.id].isSubmittedInvalid) {
                      !
                    } @else {
                      {{ tab.id }}
                    }
                  </div>

                  <!-- Step Label -->
                  <div>
                    <div class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-tight">
                      STEP {{ tab.id }}
                    </div>
                    <div 
                      class="text-[11px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap transition leading-tight"
                      [ngClass]="activeTab() === tab.id ? 'text-[#1a2656] font-bold' : 'text-slate-700 group-hover:text-slate-900'"
                    >
                      <span class="inline md:hidden">{{ tab.shortLabel }}</span>
                      <span class="hidden md:inline">{{ tab.label }}</span>
                    </div>
                  </div>
                </button>

                <!-- Connector Line between steps -->
                @if (!last) {
                  <div class="h-0.5 bg-slate-200 flex-1 min-w-[8px] sm:min-w-[12px] mx-0.5 sm:mx-1 shrink-0"></div>
                }
              }
            </div>
          </div>
        </nav>

        <!-- 3. Main Form Container -->
        <main class="w-full px-3 sm:px-6 lg:px-8 mt-4 sm:mt-5 pb-24 sm:pb-28">
          <!-- Step Title & Subtitle Banner -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-3.5 mb-4 sm:mb-5 border-b border-slate-200 gap-2">
            <div>
              <h2 class="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {{ currentStepInfo.title }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                {{ currentStepInfo.subtitle }}
              </p>
            </div>

            <!-- Step Badge & Quick Preview -->
            <div class="self-start sm:self-center shrink-0 flex items-center gap-2">
              <button 
                type="button" 
                (click)="openPreviewModal()"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition cursor-pointer shadow-2xs"
                title="Preview full application form"
              >
                <svg class="w-3.5 h-3.5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview</span>
              </button>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                Step {{ activeTab() }} of {{ tabs.length }}
              </span>
            </div>
          </div>

          <!-- Active Step Component -->
          <div class="w-full">
            <div [class.hidden]="activeTab() !== 1">
              <app-tab-org-details />
            </div>
            <div [class.hidden]="activeTab() !== 2">
              <app-tab-authorized-org />
            </div>
            <div [class.hidden]="activeTab() !== 3">
              <app-tab-bank-details />
            </div>
            <div [class.hidden]="activeTab() !== 4">
              <app-tab-documents />
            </div>
          </div>
        </main>
      </div>

      <!-- 4. Fixed Bottom Action Bar (100% Responsive on All Screen Sizes) -->
      <footer class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] py-2 sm:py-2.5 will-change-transform">
        <div class="w-full px-2.5 sm:px-6 lg:px-8 pr-12 sm:pr-6 flex items-center justify-between gap-1.5 sm:gap-3">
          <!-- Left: Reset Action & Progress Info -->
          <div class="flex items-center gap-1.5 sm:gap-3">
            <button 
              type="button" 
              (click)="resetFormWithConfirm()"
              class="h-9 px-2.5 sm:px-3.5 rounded-full border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
              title="Reset all form fields"
            >
              <svg class="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="hidden sm:inline">Reset Form</span>
              <span class="sm:hidden">Reset</span>
            </button>

            <div class="h-4 sm:h-5 w-px bg-slate-200"></div>

            <div class="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <span class="font-bold text-slate-800">
                <span class="sm:hidden">Step </span><span class="hidden sm:inline">Tab </span>{{ activeTab() }}/4
              </span>
              <span class="hidden md:inline font-semibold text-blue-900 bg-blue-50/70 border border-blue-200/60 px-2.5 py-0.5 rounded-full truncate max-w-36 lg:max-w-64">
                {{ tabs[activeTab() - 1].label }}
              </span>
            </div>

            <!-- Sleek Progress Bar -->
            <div class="hidden sm:flex items-center gap-2">
              <div class="w-20 lg:w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-linear-to-r from-blue-700 to-indigo-700 transition-all duration-300 rounded-full"
                  [style.width.%]="(activeTab() / 4) * 100"
                ></div>
              </div>
              <span class="text-xs font-bold font-mono text-slate-600">{{ Math.round((activeTab() / 4) * 100) }}%</span>
            </div>
          </div>

          <!-- Right: Action Buttons -->
          <div class="flex items-center gap-1 sm:gap-2">
            <button 
              type="button" 
              (click)="prevTab()"
              [disabled]="activeTab() === 1"
              class="h-9 sm:h-10 px-2.5 sm:px-4 border border-slate-300 bg-white rounded-full text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 sm:gap-1.5 cursor-pointer text-xs sm:text-sm whitespace-nowrap shrink-0"
              title="Previous Step"
            >
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span class="hidden sm:inline">Previous</span>
              <span class="sm:hidden">Prev</span>
            </button>

            <button 
              type="button" 
              (click)="saveDraft()"
              class="h-9 sm:h-10 px-2.5 sm:px-4 border border-blue-900 text-blue-900 bg-blue-50/40 hover:bg-blue-100/60 rounded-full font-semibold transition cursor-pointer text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0"
              title="Save Draft"
            >
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span class="hidden sm:inline">Save Draft</span>
              <span class="sm:hidden">Save</span>
            </button>

            <!-- Preview Button -->
            <button 
              type="button" 
              (click)="openPreviewModal()"
              class="h-9 sm:h-10 px-3 sm:px-4.5 border border-indigo-950/40 bg-indigo-50/80 hover:bg-indigo-100 text-[#0f1738] rounded-full font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 text-xs sm:text-sm whitespace-nowrap shrink-0"
              title="Preview complete application form"
            >
              <svg class="w-4 h-4 text-[#0f1738]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview</span>
            </button>

            @if (activeTab() < 4) {
              <button 
                type="button" 
                (click)="nextTab()"
                class="h-9 sm:h-10 px-3 sm:px-5 bg-[#0f1738] hover:bg-[#19245a] text-white rounded-full font-semibold transition flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer active:scale-98 text-xs sm:text-sm whitespace-nowrap shrink-0"
              >
                <span class="hidden sm:inline">Next Step</span>
                <span class="sm:hidden">Next</span>
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            } @else {
              <button 
                type="button" 
                (click)="openReviewModal()"
                class="h-9 sm:h-10 px-3 sm:px-5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full font-bold tracking-wide transition shadow-sm flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-98 text-xs sm:text-sm whitespace-nowrap shrink-0"
              >
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="hidden sm:inline">Submit Application</span>
                <span class="sm:hidden">Submit</span>
              </button>
            }
          </div>
        </div>
      </footer>

      <!-- Review & Confirmation Modal -->
      @if (showReviewModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div class="bg-[#0f1738] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h4 class="text-sm sm:text-base font-bold uppercase tracking-wider truncate">Application Preview (ISMS 2.0)</h4>
              </div>
              <button type="button" (click)="showReviewModal.set(false)" class="text-slate-300 hover:text-white text-2xl font-bold cursor-pointer leading-none">&times;</button>
            </div>

            <div class="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div><span class="text-slate-500 font-medium">Application No:</span> <b class="font-mono text-slate-800">{{ data.basicInfo.applicationNo }}</b></div>
                <div><span class="text-slate-500 font-medium">TP/PIA Full Name:</span> <b class="text-slate-800">{{ data.basicInfo.fullName || '—' }}</b></div>
                <div><span class="text-slate-500 font-medium">TP/PIA Short Name:</span> <b class="font-mono uppercase text-slate-800">{{ data.basicInfo.shortName || '—' }}</b></div>
                <div><span class="text-slate-500 font-medium">Registration No:</span> <b class="font-mono text-slate-800">{{ data.basicInfo.registrationNumber || '—' }}</b></div>
                <div><span class="text-slate-500 font-medium">Contact:</span> <b class="text-slate-800">{{ data.basicInfo.contactNo || '—' }}</b></div>
                <div><span class="text-slate-500 font-medium">Email:</span> <b class="text-slate-800">{{ data.basicInfo.emailId || '—' }}</b></div>
                <div><span class="text-slate-500 font-medium">PAN:</span> <b class="font-mono uppercase text-slate-800">{{ data.basicInfo.panNo || '—' }}</b></div>
                <div><span class="text-slate-500 font-medium">Turnover:</span> <b class="text-slate-800">₹ {{ data.entityInfo.turnOver || '0' }} Lakhs</b></div>
                <div><span class="text-slate-500 font-medium">Registered Address:</span> <b class="text-slate-800">{{ data.registeredAddress.address || '—' }}, {{ data.registeredAddress.district || '' }}, {{ data.registeredAddress.state || '' }} - {{ data.registeredAddress.pincode || '' }}</b></div>
                <div><span class="text-slate-500 font-medium">Postal Address:</span> <b class="text-slate-800">{{ data.postalAddress.address || '—' }}</b></div>
              </div>

              <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div><span class="text-slate-500 font-medium">Org Signatory:</span> <b class="text-slate-800">{{ data.authorizedOrg.name || '—' }} ({{ data.authorizedOrg.designation || '—' }})</b></div>
                <div><span class="text-slate-500 font-medium">Signatory Mobile:</span> <b class="text-slate-800">{{ data.authorizedOrg.contactNo || '—' }}</b></div>
                <div><span class="text-slate-500 font-medium">Bank & IFSC:</span> <b class="text-slate-800">{{ data.bankDetails.bankName || '—' }} ({{ data.bankDetails.ifscCode || '—' }})</b></div>
                <div><span class="text-slate-500 font-medium">Bank Account:</span> <b class="font-mono text-slate-800">{{ data.bankDetails.accountNo || '—' }}</b></div>
                <div class="sm:col-span-2"><span class="text-slate-500 font-medium">Mandatory Documents:</span> <b class="text-emerald-700 font-bold">{{ uploadedRequiredCount }} / {{ totalRequiredCount }} Uploaded</b></div>
              </div>

              <div class="pt-1 sm:pt-2">
                <label class="flex items-start gap-2.5 sm:gap-3 cursor-pointer p-3 bg-blue-50/60 rounded-lg border border-blue-200/70">
                  <input type="checkbox" [(ngModel)]="declarationAgreed" class="mt-0.5 w-4 h-4 rounded border-slate-300 cursor-pointer shrink-0" style="accent-color: #1e3a8a;" />
                  <span class="text-slate-800 text-xs sm:text-sm leading-relaxed">
                    I confirm that all particulars provided in this registration form are true, valid, and accurate as per official records.
                  </span>
                </label>
              </div>
            </div>

            <div class="bg-slate-50 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
              <button 
                type="button" 
                (click)="printAcknowledgement()"
                class="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg text-slate-700 font-semibold transition cursor-pointer text-xs sm:text-sm text-center flex items-center justify-center gap-1.5"
              >
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print / Download Preview</span>
              </button>

              <div class="flex items-center gap-2 sm:gap-3 justify-end">
                <button 
                  type="button" 
                  (click)="showReviewModal.set(false)"
                  class="px-4 py-2 border border-slate-300 bg-white rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition cursor-pointer text-xs sm:text-sm text-center"
                >
                  Back to Edit
                </button>
                <button 
                  type="button" 
                  (click)="confirmSubmit()"
                  [disabled]="!declarationAgreed"
                  class="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-bold transition cursor-pointer text-xs sm:text-sm shadow-sm text-center"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Submission Success Modal -->
      @if (showSuccessModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-center p-5 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3 sm:mb-4 shadow-inner">
              <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <h3 class="text-lg sm:text-xl font-bold text-slate-900">
              Application Submitted Successfully
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Your application has been logged into ISMS 2.0 Rajasthan.
            </p>

            <div class="my-4 sm:my-5 p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs sm:text-sm space-y-2">
              <div class="flex justify-between gap-2"><span class="text-slate-500 shrink-0">Application No:</span> <b class="font-mono text-slate-900 truncate">{{ data.basicInfo.applicationNo }}</b></div>
              <div class="flex justify-between gap-2"><span class="text-slate-500 shrink-0">Entity Name:</span> <b class="text-slate-900 truncate">{{ data.basicInfo.fullName || data.basicInfo.shortName }}</b></div>
              <div class="flex justify-between gap-2"><span class="text-slate-500 shrink-0">Status:</span> <b class="text-amber-700 font-semibold truncate">Under Nodal Verification</b></div>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button 
                type="button" 
                (click)="printAcknowledgement()"
                class="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition cursor-pointer text-xs sm:text-sm shadow-sm"
              >
                Print Acknowledgement
              </button>
              <button 
                type="button" 
                (click)="showSuccessModal.set(false)"
                class="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition cursor-pointer text-xs sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class TpPiaRegistrationComponent {
  readonly service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);
  readonly Math = Math;

  readonly activeTab = signal<number>(1);
  readonly showReviewModal = signal<boolean>(false);
  readonly showSuccessModal = signal<boolean>(false);
  readonly fontScale = signal<'standard' | 'large' | 'xlarge'>('standard');
  declarationAgreed: boolean = false;

  setFontScale(scale: 'standard' | 'large' | 'xlarge') {
    this.fontScale.set(scale);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('font-scale-standard', 'font-scale-large', 'font-scale-xlarge');
      document.documentElement.classList.add(`font-scale-${scale}`);
    }
  }

  readonly tabs: TabItem[] = [
    { id: 1, label: 'Organisation Details', shortLabel: 'Organisation', icon: '🏢' },
    { id: 2, label: 'Auth Person (Org)', shortLabel: 'Auth (Org)', icon: '✍️' },
    { id: 3, label: 'Bank Details', shortLabel: 'Bank Details', icon: '🏦' },
    { id: 4, label: 'Document Upload', shortLabel: 'Documents', icon: '📁' },
  ];

  get currentStepInfo(): { title: string; subtitle: string } {
    switch (this.activeTab()) {
      case 1:
        return {
          title: 'Step 1: Organisation / Company Basic Details',
          subtitle: 'Primary profile, legal constitution, address records, and workflow authority'
        };
      case 2:
        return {
          title: 'Step 2: Authorized Person Details (Organisation Level)',
          subtitle: 'Statutory corporate signatory, identity proofs, and legal credentials'
        };
      case 3:
        return {
          title: 'Step 3: Bank Details',
          subtitle: 'PFMS / DBT disbursal dedicated bank account, transfer mode, and verification records'
        };
      case 4:
        return {
          title: 'Step 4: Document Upload',
          subtitle: 'Mandatory statutory compliance documents, registration certificate, PAN, GST, and affidavits'
        };
      default:
        return {
          title: `Step ${this.activeTab()}`,
          subtitle: 'Application form details'
        };
    }
  }

  get data() {
    return this.service.formData();
  }

  get totalRequiredCount(): number {
    return this.data.documents.filter(d => d.required).length;
  }

  get uploadedRequiredCount(): number {
    return this.data.documents.filter(d => d.required && d.status === 'uploaded').length;
  }

  readonly tabStatuses = computed(() => {
    const data = this.service.formData();
    const submitted = this.valService.submittedTabs();
    const completed = this.valService.completedTabs();

    const map: Record<number, { isCompleted: boolean; isSubmittedInvalid: boolean }> = {};
    for (let id = 1; id <= 4; id++) {
      const isValid = this.valService.isTabValid(id, data);
      map[id] = {
        isCompleted: completed.has(id) && isValid,
        isSubmittedInvalid: submitted.has(id) && !isValid,
      };
    }
    return map;
  });

  isTabValid(tabId: number): boolean {
    return this.valService.isTabValid(tabId, this.data);
  }

  isTabCompleted(tabId: number): boolean {
    return this.tabStatuses()[tabId]?.isCompleted ?? false;
  }

  isTabSubmittedInvalid(tabId: number): boolean {
    return this.tabStatuses()[tabId]?.isSubmittedInvalid ?? false;
  }

  private scrollStepIntoView(tabId: number) {
    if (typeof document !== 'undefined') {
      requestAnimationFrame(() => {
        const el = document.getElementById(`step-btn-${tabId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    }
  }

  switchTab(tabId: number) {
    const current = this.activeTab();
    if (this.valService.isTabValid(current, this.data)) {
      this.valService.markTabCompleted(current);
    }
    this.activeTab.set(tabId);
    this.valService.clearToast();
    this.scrollStepIntoView(tabId);
  }

  nextTab() {
    const current = this.activeTab();
    this.valService.markTabSubmitted(current);

    if (!this.valService.isTabValid(current, this.data)) {
      const tabName = this.tabs[current - 1]?.label || `Tab ${current}`;
      this.valService.showToast(`Please fill all required fields correctly in "${tabName}" before proceeding.`);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    this.valService.markTabCompleted(current);
    this.valService.clearToast();
    if (current < 4) {
      const nextId = current + 1;
      this.activeTab.set(nextId);
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.scrollStepIntoView(nextId);
    }
  }

  prevTab() {
    if (this.activeTab() > 1) {
      const prevId = this.activeTab() - 1;
      this.activeTab.set(prevId);
      this.valService.clearToast();
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.scrollStepIntoView(prevId);
    }
  }

  saveDraft() {
    this.service.saveDraft();
    const current = this.activeTab();
    if (this.valService.isTabValid(current, this.data)) {
      this.valService.markTabCompleted(current);
    }
    this.valService.showToast('Draft progress saved successfully.', 'success');
  }

  populateDemo() {
    this.service.populateSampleData();
    for (let t = 1; t <= 4; t++) {
      if (this.valService.isTabValid(t, this.data)) {
        this.valService.markTabCompleted(t);
      }
    }
    this.valService.showToast('Sample government demo data loaded.', 'success');
  }

  resetFormWithConfirm() {
    if (confirm('Are you sure you want to reset all fields? All unsaved data will be cleared.')) {
      this.service.resetForm();
      this.valService.resetSubmitted();
      this.valService.clearToast();
      this.activeTab.set(1);
    }
  }

  openPreviewModal() {
    this.valService.clearToast();
    this.showReviewModal.set(true);
  }

  openReviewModal() {
    for (let t = 1; t <= 4; t++) {
      this.valService.markTabSubmitted(t);
    }

    const firstInvalid = this.valService.getFirstInvalidTab(this.data);
    if (firstInvalid !== null) {
      this.activeTab.set(firstInvalid);
      const tabName = this.tabs[firstInvalid - 1]?.label || `Tab ${firstInvalid}`;
      this.valService.showToast(`Cannot review application: Please complete all mandatory fields in "${tabName}".`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.valService.clearToast();
    this.showReviewModal.set(true);
  }

  confirmSubmit() {
    this.service.updateFormData(curr => ({ ...curr, status: 'Submitted' }));
    this.showReviewModal.set(false);
    this.showSuccessModal.set(true);
  }

  printAcknowledgement() {
    window.print();
  }
}
