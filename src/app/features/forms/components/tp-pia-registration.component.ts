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
          <div class="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center">
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
          <div class="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
            <div class="flex items-center justify-start md:justify-between overflow-x-auto no-scrollbar scroll-smooth gap-1 sm:gap-2 w-full pb-0.5">
              @for (tab of tabs; track tab.id; let idx = $index; let last = $last) {
                <button 
                  type="button" 
                  [id]="'step-btn-' + tab.id"
                  (click)="switchTab(tab.id)"
                  class="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer text-left group focus:outline-none py-1 px-1.5 sm:px-2 rounded-lg hover:bg-slate-50 transition-all duration-200 active:scale-97"
                  [attr.aria-label]="tab.label"
                >
                  <!-- Step Circle -->
                  <div 
                    class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200"
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
        <main class="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 pb-12 sm:pb-16">
          <!-- Step Title & Subtitle Banner -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-3.5 mb-4 sm:mb-5 border-b border-slate-200 gap-2">
            <div>
              <h2 class="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {{ currentStepInfo.title }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>{{ currentStepInfo.subtitle }}</span>
                <span class="text-slate-300 hidden sm:inline">•</span>
                <span class="text-slate-500 font-medium">Fields with <span class="text-rose-500 font-bold">*</span> are mandatory</span>
              </p>
            </div>

            <!-- Auto-Save Status Indicator -->
            <div class="self-start sm:self-center shrink-0 flex items-center gap-2">
              @if (service.autoSaveStatus() === 'saving') {
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80 transition-all duration-200 shadow-2xs">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>Auto-saving...</span>
                </div>
              } @else if (service.autoSaveStatus() === 'saved') {
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 transition-all duration-200 shadow-2xs">
                  <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Auto-saved <span class="font-normal text-emerald-700">({{ service.lastSavedTime() }})</span></span>
                </div>
              }
            </div>
          </div>

          <!-- Active Step Component with Smooth Transitions -->
          <div class="w-full">
            <div [class.hidden]="activeTab() !== 1" [class.step-content-smooth]="activeTab() === 1">
              <app-tab-org-details />
            </div>
            <div [class.hidden]="activeTab() !== 2" [class.step-content-smooth]="activeTab() === 2">
              <app-tab-authorized-org />
            </div>
            <div [class.hidden]="activeTab() !== 3" [class.step-content-smooth]="activeTab() === 3">
              <app-tab-bank-details />
            </div>
            <div [class.hidden]="activeTab() !== 4" [class.step-content-smooth]="activeTab() === 4">
              <app-tab-documents />
            </div>

            <!-- Step 5: Application Review & Final Submission (3 Editable Blocks + Documents & Declaration) -->
            <div [class.hidden]="activeTab() !== 5" [class.step-content-smooth]="activeTab() === 5">
              <div class="space-y-6">

                <!-- Block 1: Organisation Details (Step 1) -->
                <section class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                  <div class="px-4 sm:px-6 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
                      <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                        1. Organisation & Basic Details
                      </h3>
                    </div>
                    <button 
                      type="button" 
                      (click)="switchTab(1)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 hover:border-blue-300 rounded-md text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                      <svg class="w-3.5 h-3.5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Edit Step 1</span>
                    </button>
                  </div>
                  <div class="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Application No:</span>
                      <b class="font-mono text-slate-800">{{ data.basicInfo.applicationNo }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Date of Registration:</span>
                      <b class="text-slate-800">{{ data.basicInfo.dateOfRegistration || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">TP/PIA Full Name:</span>
                      <b class="text-slate-800">{{ data.basicInfo.fullName || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">TP/PIA Short Name:</span>
                      <b class="font-mono uppercase text-slate-800">{{ data.basicInfo.shortName || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Registration Number:</span>
                      <b class="font-mono text-slate-800">{{ data.basicInfo.registrationNumber || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Organisation PAN:</span>
                      <b class="font-mono uppercase text-slate-800">{{ data.basicInfo.panNo || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Business / Activity:</span>
                      <b class="text-slate-800">{{ data.entityInfo.businessActivity || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">State Where Registered:</span>
                      <b class="text-slate-800">{{ data.entityInfo.stateWhereRegistered || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Annual Turnover:</span>
                      <b class="text-slate-800">₹ {{ data.entityInfo.turnOver || '0' }} Lakhs</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Contact No:</span>
                      <b class="font-mono text-slate-800">+91 {{ data.basicInfo.contactNo || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Company Email-ID:</span>
                      <b class="text-slate-800">{{ data.basicInfo.emailId || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Official Website:</span>
                      <b class="text-slate-800">{{ data.basicInfo.website || '—' }}</b>
                    </div>
                    <div class="sm:col-span-2 lg:col-span-3 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span class="text-slate-500 font-medium block text-xs">Registered Office Address:</span>
                        <b class="text-slate-800">{{ data.registeredAddress.address || '—' }}, {{ data.registeredAddress.district || '' }}, {{ data.registeredAddress.state || '' }} - {{ data.registeredAddress.pincode || '' }}</b>
                      </div>
                      <div>
                        <span class="text-slate-500 font-medium block text-xs">Postal / Mailing Address:</span>
                        <b class="text-slate-800">{{ data.postalAddress.address || '—' }}</b>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Block 2: Authorized Person Details (Step 2) -->
                <section class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                  <div class="px-4 sm:px-6 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                        2. Authorized Person & Signatory Profile
                      </h3>
                    </div>
                    <button 
                      type="button" 
                      (click)="switchTab(2)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 hover:border-blue-300 rounded-md text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                      <svg class="w-3.5 h-3.5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Edit Step 2</span>
                    </button>
                  </div>
                  <div class="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Authorized Person Name:</span>
                      <b class="text-slate-800">{{ data.authorizedOrg.name || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Father's / Husband's Name:</span>
                      <b class="text-slate-800">{{ data.authorizedOrg.guardianName || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Date of Birth & Age:</span>
                      <b class="text-slate-800">{{ data.authorizedOrg.dob || '—' }} {{ data.authorizedOrg.age ? '(' + data.authorizedOrg.age + ' Years)' : '' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Designation:</span>
                      <b class="text-slate-800">{{ data.authorizedOrg.designation || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Mobile No:</span>
                      <b class="font-mono text-slate-800">+91 {{ data.authorizedOrg.contactNo || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Email-ID:</span>
                      <b class="text-slate-800">{{ data.authorizedOrg.emailId || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">PAN:</span>
                      <b class="font-mono uppercase text-slate-800">{{ data.authorizedOrg.pan || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Aadhaar No:</span>
                      <b class="font-mono text-slate-800">{{ data.authorizedOrg.aadhaarNo || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">ID Proof:</span>
                      <b class="text-slate-800">{{ data.authorizedOrg.typeIdProof || '—' }} {{ data.authorizedOrg.idNo ? '(' + data.authorizedOrg.idNo + ')' : '' }}</b>
                    </div>
                    @if (data.authorizedOrg.bhamashahNo) {
                      <div>
                        <span class="text-slate-500 font-medium block text-xs">Bhamashah No:</span>
                        <b class="font-mono text-slate-800">{{ data.authorizedOrg.bhamashahNo }}</b>
                      </div>
                    }
                    @if (data.authorizedOrg.voterIdNo) {
                      <div>
                        <span class="text-slate-500 font-medium block text-xs">Voter ID No:</span>
                        <b class="font-mono text-slate-800">{{ data.authorizedOrg.voterIdNo }}</b>
                      </div>
                    }
                    @if (data.authorizedOrg.passportNo) {
                      <div>
                        <span class="text-slate-500 font-medium block text-xs">Passport No:</span>
                        <b class="font-mono text-slate-800">{{ data.authorizedOrg.passportNo }}</b>
                      </div>
                    }
                    <div class="sm:col-span-2 lg:col-span-3 pt-2 border-t border-slate-100">
                      <span class="text-slate-500 font-medium block text-xs">Residential Address:</span>
                      <b class="text-slate-800">{{ data.authorizedOrg.residenceAddress || '—' }} {{ data.authorizedOrg.state ? ', ' + data.authorizedOrg.state : '' }}</b>
                    </div>
                  </div>
                </section>

                <!-- Block 3: Bank Details (Step 3) -->
                <section class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                  <div class="px-4 sm:px-6 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                      <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                        3. Bank Account & Verification Details
                      </h3>
                    </div>
                    <button 
                      type="button" 
                      (click)="switchTab(3)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 hover:border-blue-300 rounded-md text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                      <svg class="w-3.5 h-3.5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Edit Step 3</span>
                    </button>
                  </div>
                  <div class="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Bank Name:</span>
                      <b class="text-slate-800">{{ data.bankDetails.bankName || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Account Number:</span>
                      <b class="font-mono text-slate-800">{{ data.bankDetails.accountNo || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">IFSC Code:</span>
                      <b class="font-mono uppercase text-slate-800">{{ data.bankDetails.ifscCode || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Type of Account:</span>
                      <b class="text-slate-800">{{ data.bankDetails.accountType || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Transfer Mode:</span>
                      <b class="text-slate-800">{{ data.bankDetails.electronicTransferMode || '—' }}</b>
                    </div>
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Branch Name:</span>
                      <b class="text-slate-800">{{ data.bankDetails.branchName || '—' }}</b>
                    </div>
                    @if (data.bankDetails.micrCode) {
                      <div>
                        <span class="text-slate-500 font-medium block text-xs">MICR Code:</span>
                        <b class="font-mono text-slate-800">{{ data.bankDetails.micrCode }}</b>
                      </div>
                    }
                    <div>
                      <span class="text-slate-500 font-medium block text-xs">Cancelled Cheque:</span>
                      <span class="font-semibold text-emerald-700">{{ data.bankDetails.cancelledChequeFileName || 'Attached' }}</span>
                    </div>
                    <div class="sm:col-span-2 lg:col-span-3 pt-2 border-t border-slate-100">
                      <span class="text-slate-500 font-medium block text-xs">Branch Address:</span>
                      <b class="text-slate-800">{{ data.bankDetails.branchAddress || '—' }}</b>
                    </div>
                  </div>
                </section>

                <!-- Block 4: Uploaded Documents Summary (Step 4) -->
                <section class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                  <div class="px-4 sm:px-6 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                      <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                        4. Uploaded Compliance Documents
                      </h3>
                    </div>
                    <button 
                      type="button" 
                      (click)="switchTab(4)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 hover:border-blue-300 rounded-md text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                      <svg class="w-3.5 h-3.5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Edit Step 4</span>
                    </button>
                  </div>
                  <div class="p-4 sm:p-6">
                    <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <span class="text-xs font-semibold text-slate-700">Document Upload Summary:</span>
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 font-bold text-xs rounded-full"
                        [ngClass]="uploadedRequiredCount === totalRequiredCount ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                        ✓ {{ uploadedRequiredCount }} / {{ totalRequiredCount }} Mandatory Uploaded
                      </span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      @for (doc of data.documents; track doc.id) {
                        <div class="flex items-center justify-between p-2.5 rounded-lg border text-xs"
                          [ngClass]="doc.status === 'uploaded' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'">
                          <div class="flex items-center gap-2 min-w-0">
                            @if (doc.status === 'uploaded') {
                              <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            } @else {
                              <span class="w-4 h-4 rounded-full border border-slate-300 shrink-0"></span>
                            }
                            <span class="font-medium text-slate-800 truncate" [title]="doc.label">{{ doc.label }}</span>
                          </div>
                          <span class="text-[11px] shrink-0 font-medium ml-2"
                            [ngClass]="doc.status === 'uploaded' ? 'text-emerald-700' : 'text-slate-400'">
                            {{ doc.status === 'uploaded' ? (doc.fileName || 'Uploaded') : (doc.required ? 'Pending *' : 'Optional') }}
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                </section>

                <!-- Final Declaration Checkbox -->
                <div class="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                  <label class="flex items-start gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="declarationAgreed" 
                      class="mt-1 w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer shrink-0" 
                    />
                    <span class="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      <b>Declaration:</b> I hereby declare and confirm that all particulars, documents, and credentials furnished in this application are authentic, complete, and correct to the best of my knowledge as per official records.
                    </span>
                  </label>
                </div>

              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons (Inside Form) -->
          <div class="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-200 flex items-center justify-between gap-3">
            <button 
              type="button" 
              (click)="prevTab()"
              [disabled]="activeTab() === 1"
              class="h-9 sm:h-10 px-3.5 sm:px-5 border border-slate-300 bg-white rounded-full text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm shadow-2xs shrink-0 active:scale-95"
              title="Back"
            >
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>

            <!-- Status Indicator in Bottom Bar -->
            <div class="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              @if (service.autoSaveStatus() === 'saving') {
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span class="text-amber-700">Auto-saving draft...</span>
              } @else if (service.autoSaveStatus() === 'saved') {
                <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-slate-600">Draft saved automatically <span class="text-slate-400 font-normal">({{ service.lastSavedTime() }})</span></span>
              }
            </div>

            <div class="flex items-center gap-2">
              @if (activeTab() < 5) {
                <button 
                  type="button" 
                  (click)="nextTab()"
                  class="h-9 sm:h-10 px-4 sm:px-6 bg-[#0f1738] hover:bg-[#19245a] text-white rounded-full font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 text-xs sm:text-sm shrink-0"
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
                  (click)="submitFinalApplication()"
                  [disabled]="!declarationAgreed"
                  class="h-9 sm:h-10 px-4 sm:px-6 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full font-bold tracking-wide transition-all duration-200 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs sm:text-sm shrink-0"
                >
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit Application</span>
                </button>
              }
            </div>
          </div>
        </main>
      </div>



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
    { id: 5, label: 'Review & Submit', shortLabel: 'Review', icon: '📋' },
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
      case 5:
        return {
          title: 'Step 5: Review & Final Submission',
          subtitle: 'Review all application details, edit any section if needed, and submit the application'
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
    for (let id = 1; id <= 5; id++) {
      const isValid = id === 5
        ? (this.valService.isTabValid(1, data) && this.valService.isTabValid(2, data) && this.valService.isTabValid(3, data) && this.valService.isTabValid(4, data))
        : this.valService.isTabValid(id, data);
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
    this.service.saveDraftSync();
    this.activeTab.set(tabId);
    this.valService.clearToast();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.scrollStepIntoView(tabId);
  }

  nextTab() {
    const current = this.activeTab();
    this.valService.markTabSubmitted(current);

    if (current <= 4 && !this.valService.isTabValid(current, this.data)) {
      const tabName = this.tabs[current - 1]?.label || `Tab ${current}`;
      this.valService.showToast(`Please fill all required fields correctly in "${tabName}" before proceeding.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.valService.markTabCompleted(current);
    this.valService.clearToast();
    this.service.saveDraftSync();
    if (current < 5) {
      const nextId = current + 1;
      this.activeTab.set(nextId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.scrollStepIntoView(nextId);
    }
  }

  prevTab() {
    if (this.activeTab() > 1) {
      this.service.saveDraftSync();
      const prevId = this.activeTab() - 1;
      this.activeTab.set(prevId);
      this.valService.clearToast();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.scrollStepIntoView(prevId);
    }
  }

  populateDemo() {
    this.service.populateSampleData();
    for (let t = 1; t <= 5; t++) {
      if (this.valService.isTabValid(t, this.data)) {
        this.valService.markTabCompleted(t);
      }
    }
    this.valService.showToast('Sample government demo data loaded.', 'success');
  }

  openPreviewModal() {
    this.switchTab(5);
  }

  openReviewModal() {
    this.switchTab(5);
  }

  submitFinalApplication() {
    if (!this.declarationAgreed) {
      this.valService.showToast('Please check the declaration checkbox before submitting.');
      return;
    }

    for (let t = 1; t <= 4; t++) {
      this.valService.markTabSubmitted(t);
    }

    const firstInvalid = this.valService.getFirstInvalidTab(this.data);
    if (firstInvalid !== null) {
      this.activeTab.set(firstInvalid);
      const tabName = this.tabs[firstInvalid - 1]?.label || `Step ${firstInvalid}`;
      this.valService.showToast(`Cannot submit application: Please complete mandatory fields in "${tabName}".`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.valService.markTabCompleted(5);
    this.valService.clearToast();
    this.service.updateFormData(curr => ({ ...curr, status: 'Submitted' }));
    this.showSuccessModal.set(true);
  }

  confirmSubmit() {
    this.submitFinalApplication();
  }

  printAcknowledgement() {
    window.print();
  }
}
