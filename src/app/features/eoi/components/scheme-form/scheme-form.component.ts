import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { OtrFormService } from '../../../registration/services/otr-form.service';
import {
    Step1OrgDetails,
    OfficerInCharge,
    Step3AuthorizedPerson,
    Step4BankDetails
} from '../../../registration/models/otr-form.model';

export interface TrainingCenterItem {
    id: string;
    district: string;
    centerName: string;
    telephone: string;
    classrooms: number;
    practicalRooms: number;
    washrooms: string;
    labInfra: string;
    fullAddress: string;
}

export interface TurnoverYear {
    year: string;
    totalTurnover: string;
    skillTurnover: string;
}

export interface TrainingPlacementRecord {
    sector: string;
    year: string;
    trained: number;
    placed: number;
    proofDoc: string;
}

export interface ActionPlanDistrict {
    id: string;
    year: string;
    district: string;
    sdcCount: number;
    location: string;
    sectors: string;
    courses: string;
    mode: 'Residential' | 'Non-Residential' | 'Both';
    batches: number;
}

export interface EoiDocumentItem {
    id: number;
    name: string;
    description: string;
    fileName: string;
    fileSize: string;
    uploadedDate: string;
    isMandatory: boolean;
    status: 'uploaded' | 'pending';
}

@Component({
    selector: 'app-scheme-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="w-full min-h-full bg-slate-50/50 pb-16 font-sans text-slate-800 select-none">
      
      <!-- ====================================================================
           1. Top Navigation Bar: Stepper Progress (Expands across header width)
           ==================================================================== -->
      <header class="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs font-sans">
        <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          
          <!-- 5-Step Stepper Progress Bar (Distributed across width) -->
          <nav class="w-full flex items-center justify-between overflow-x-auto no-scrollbar py-0.5" aria-label="EOI Application Steps">
            
            <!-- Step 1: OTR Profile Verification -->
            <button
              type="button"
              (click)="goToStep(1)"
              class="flex items-center gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 1"
              [class.font-medium]="currentStep() === 1"
              [class.text-slate-400]="currentStep() < 1"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
                [class.bg-[#0B3558]]="currentStep() === 1"
                [class.text-white]="currentStep() === 1"
                [class.bg-emerald-600]="currentStep() > 1"
                [class.text-white]="currentStep() > 1"
                [class.bg-slate-200]="currentStep() < 1"
              >
                @if (currentStep() > 1) {
                  &check;
                } @else {
                  1
                }
              </span>
              <div class="text-left leading-tight hidden sm:block">
                <span class="text-[10px] uppercase text-slate-400 block font-normal">STEP 1</span>
                <span class="text-xs">OTR Profile</span>
              </div>
            </button>

            <span class="flex-1 mx-2 sm:mx-4 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 1"></span>

            <!-- Step 2: EOI Proposal Details -->
            <button
              type="button"
              (click)="goToStep(2)"
              class="flex items-center gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 2"
              [class.font-medium]="currentStep() === 2"
              [class.text-slate-400]="currentStep() < 2"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
                [class.bg-[#0B3558]]="currentStep() === 2"
                [class.text-white]="currentStep() === 2"
                [class.bg-emerald-600]="currentStep() > 2"
                [class.text-white]="currentStep() > 2"
                [class.bg-slate-200]="currentStep() < 2"
              >
                @if (currentStep() > 2) {
                  &check;
                } @else {
                  2
                }
              </span>
              <div class="text-left leading-tight hidden sm:block">
                <span class="text-[10px] uppercase text-slate-400 block font-normal">STEP 2</span>
                <span class="text-xs">Proposal Form</span>
              </div>
            </button>

            <span class="flex-1 mx-2 sm:mx-4 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 2"></span>

            <!-- Step 3: Complete Preview -->
            <button
              type="button"
              (click)="goToStep(3)"
              class="flex items-center gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 3"
              [class.font-medium]="currentStep() === 3"
              [class.text-slate-400]="currentStep() < 3"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
                [class.bg-[#0B3558]]="currentStep() === 3"
                [class.text-white]="currentStep() === 3"
                [class.bg-emerald-600]="currentStep() > 3"
                [class.text-white]="currentStep() > 3"
                [class.bg-slate-200]="currentStep() < 3"
              >
                @if (currentStep() > 3) {
                  &check;
                } @else {
                  3
                }
              </span>
              <div class="text-left leading-tight hidden sm:block">
                <span class="text-[10px] uppercase text-slate-400 block font-normal">STEP 3</span>
                <span class="text-xs">Complete Preview</span>
              </div>
            </button>

            <span class="flex-1 mx-2 sm:mx-4 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 3"></span>

            <!-- Step 4: Fee Payment -->
            <button
              type="button"
              (click)="goToStep(4)"
              class="flex items-center gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 4"
              [class.font-medium]="currentStep() === 4"
              [class.text-slate-400]="currentStep() < 4"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
                [class.bg-[#0B3558]]="currentStep() === 4"
                [class.text-white]="currentStep() === 4"
                [class.bg-emerald-600]="currentStep() > 4"
                [class.text-white]="currentStep() > 4"
                [class.bg-slate-200]="currentStep() < 4"
              >
                @if (currentStep() > 4) {
                  &check;
                } @else {
                  4
                }
              </span>
              <div class="text-left leading-tight hidden sm:block">
                <span class="text-[10px] uppercase text-slate-400 block font-normal">STEP 4</span>
                <span class="text-xs">Fee Payment</span>
              </div>
            </button>

            <span class="flex-1 mx-2 sm:mx-4 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 4"></span>

            <!-- Step 5: Submission & Receipt -->
            <button
              type="button"
              (click)="goToStep(5)"
              class="flex items-center gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() === 5"
              [class.font-medium]="currentStep() === 5"
              [class.text-slate-400]="currentStep() < 5"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
                [class.bg-[#0B3558]]="currentStep() === 5"
                [class.text-white]="currentStep() === 5"
                [class.bg-slate-200]="currentStep() < 5"
              >
                5
              </span>
              <div class="text-left leading-tight hidden sm:block">
                <span class="text-[10px] uppercase text-slate-400 block font-normal">STEP 5</span>
                <span class="text-xs">Submission Receipt</span>
              </div>
            </button>

          </nav>
        </div>
      </header>

      <!-- Main Container -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 font-sans">
        
        <!-- ====================================================================
             2. SCHEME HEADER CARD (Exact replica of Screenshot 1 - only 8 fields)
             ==================================================================== -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div class="p-5 sm:p-6 space-y-3.5">
            <div class="space-y-1">
              <!-- Scheme Title (Fixed heading size, clean font) -->
              <h2 class="text-lg sm:text-xl font-medium text-[#0B3558] tracking-tight">
                {{ schemeTitle() }}
              </h2>
              <!-- Subtitle Description -->
              <p class="text-xs sm:text-[12.5px] text-slate-600 leading-relaxed font-normal">
                {{ schemeDescription() }}
              </p>
            </div>

            <!-- The Exact 8 Parameters Strip from Screenshot 1 -->
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-3.5 border-t border-slate-100 text-xs">
              <div>
                <span class="text-[10px] text-slate-500 font-normal uppercase block tracking-wider">EOI REFERENCE NO.</span>
                <span class="font-normal text-slate-700 text-[11.5px] block mt-1 break-all">{{ schemeRefNo() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 font-normal uppercase block tracking-wider">SCHEME NAME</span>
                <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ schemeName() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 font-normal uppercase block tracking-wider">SCHEME CATEGORY</span>
                <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ schemeCategory() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 font-normal uppercase block tracking-wider">EOI CATEGORY</span>
                <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ schemeEoiCategory() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 font-normal uppercase block tracking-wider">DATE OF EOI PUBLISHED</span>
                <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ schemeDatePublished() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 font-normal uppercase block tracking-wider">DATE OF CLOSING</span>
                <span class="font-medium text-rose-600 text-[11.5px] block mt-1">{{ schemeClosingDate() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 font-normal uppercase block tracking-wider">EMD FEE</span>
                <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ schemeEmdFee() }} <span class="text-[10px] text-slate-500 font-normal">(Refundable)</span></span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 font-normal uppercase block tracking-wider">PROCESSING FEE</span>
                <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ schemeProcessFee() }} <span class="text-[10px] text-slate-500 font-normal">(Non-Refundable)</span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- ====================================================================
             STEP 1: OTR PROFILE VERIFICATION (Editable Pre-Filled Form Inputs)
             ==================================================================== -->
        @if (currentStep() === 1) {
          <div class="space-y-6">

            <!-- Top Header & Edit Toggle Bar -->
            <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between flex-wrap gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558]">OTR Profile Verification</h3>
                  <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                    &check; Pre-filled from Registration
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1">
                  @if (!isEditingOtr()) {
                    All registration details below are currently in <strong>read-only preview</strong>. Click <strong>Edit Information</strong> to modify particulars before proceeding.
                  } @else {
                    You are in <strong>edit mode</strong>. Update particulars below and click <strong>Lock &amp; Review</strong> or <strong>Save &amp; Next</strong>.
                  }
                </p>
              </div>

              <div>
                @if (!isEditingOtr()) {
                  <button
                    type="button"
                    (click)="isEditingOtr.set(true)"
                    class="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit Information</span>
                  </button>
                } @else {
                  <button
                    type="button"
                    (click)="isEditingOtr.set(false)"
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Lock &amp; Review</span>
                  </button>
                }
              </div>
            </div>

            <!-- ================================================================
                 MODE A: READ-ONLY VIEW (DEFAULT)
                 ================================================================ -->
            @if (!isEditingOtr()) {
              <!-- 1. Organization Details -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-medium">1</span>
                    <h3 class="text-sm font-semibold text-[#0B3558] uppercase tracking-wide">Step 1 – Organization Details</h3>
                  </div>
                  <span class="text-xs text-slate-500 font-mono">CIN: {{ editableStep1.registrationNumber || '-' }}</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span class="text-slate-400 block text-[10.5px]">Short Name</span><span class="font-medium text-slate-800">{{ editableStep1.shortName || '-' }}</span></div>
                  <div class="sm:col-span-2"><span class="text-slate-400 block text-[10.5px]">Full Name</span><span class="font-medium text-slate-800">{{ editableStep1.fullName || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Nature of Entity</span><span class="font-medium text-slate-800">{{ editableStep1.natureOfEntity || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Date of Registration</span><span class="text-slate-800">{{ editableStep1.dateOfRegistration || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">State of Reg.</span><span class="text-slate-800">{{ editableStep1.stateOfLegalReg || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Company PAN</span><span class="font-mono font-semibold text-slate-800">{{ editableStep1.companyPan || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">GST Registered</span><span class="text-slate-800">{{ editableStep1.gstRegistered }} ({{ editableStep1.gstin || 'N/A' }})</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">MSME / Udyam</span><span class="text-slate-800">{{ editableStep1.msmeRegistered }} @if(editableStep1.udyamNumber){ - {{ editableStep1.udyamNumber }} }</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">NSDC Partner</span><span class="text-slate-800">{{ editableStep1.nsdcPartner || 'None' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Blacklisted</span><span class="font-semibold" [class.text-rose-600]="editableStep1.blackListed === 'Yes'">{{ editableStep1.blackListed }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Contact / Email</span><span class="text-slate-800">{{ editableStep1.contactNo }} | {{ editableStep1.emailId }}</span></div>
                </div>

                <!-- 3-Year Turnover Table -->
                @if (editableStep1.financialYears && editableStep1.financialYears.length > 0) {
                  <div class="pt-3 border-t border-slate-100">
                    <span class="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Financial Turnover (₹ in Lacs)</span>
                    <table class="w-full text-left border-collapse border border-slate-200 rounded text-xs">
                      <thead>
                        <tr class="bg-slate-50 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                          <th class="py-1.5 px-3 border-r border-slate-200">Financial Year</th>
                          <th class="py-1.5 px-3 border-r border-slate-200">Total Turnover (₹ Lacs)</th>
                          <th class="py-1.5 px-3">Skill Turnover (₹ Lacs)</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (fy of editableStep1.financialYears; track fy.year) {
                          <tr>
                            <td class="py-1 px-3 text-slate-700 border-r border-slate-100">{{ fy.year }}</td>
                            <td class="py-1 px-3 text-slate-700 border-r border-slate-100">{{ fy.totalTurnover || '-' }}</td>
                            <td class="py-1 px-3 text-slate-700">{{ fy.skillTurnover || '-' }}</td>
                          </tr>
                        }
                        <tr class="bg-slate-50 font-semibold border-t border-slate-200">
                          <td class="py-1 px-3 text-slate-700 border-r border-slate-100">3-Year Average</td>
                          <td class="py-1 px-3 text-[#0483AC] border-r border-slate-100">{{ avgTotalTurnover() }} Lacs</td>
                          <td class="py-1 px-3 text-[#0483AC]">{{ avgSkillTurnover() }} Lacs</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                }

                <div class="pt-2 border-t border-slate-100 text-xs">
                  <span class="text-slate-400 block text-[10.5px]">Registered Address</span>
                  <span class="text-slate-800">{{ editableStep1.registeredAddress || '-' }}</span>
                </div>
              </div>

              <!-- 2. Authorized Person Details (Swapped to Step 2) -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-medium">2</span>
                    <h3 class="text-sm font-semibold text-[#0B3558] uppercase tracking-wide">Step 2 – Authorized Person Details</h3>
                  </div>
                  <span class="text-[11px] text-emerald-700 font-normal bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">&check; Verified</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span class="text-slate-400 block text-[10.5px]">Name</span><span class="font-semibold text-slate-800">{{ editableStep3.name || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Designation</span><span class="text-slate-800">{{ editableStep3.designation || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">DOB / Age</span><span class="text-slate-800">{{ editableStep3.dob || '-' }} @if(editableStep3.age){ ({{ editableStep3.age }} yrs) }</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Mobile No.</span><span class="font-mono text-slate-800">{{ editableStep3.mobileNo || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Email ID</span><span class="text-slate-800">{{ editableStep3.emailId || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">PAN</span><span class="font-mono text-slate-800">{{ editableStep3.pan || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Aadhaar No.</span><span class="font-mono text-slate-800">{{ editableStep3.aadhaarNo || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">State</span><span class="text-slate-800">{{ editableStep3.state || '-' }}</span></div>
                  <div class="sm:col-span-4"><span class="text-slate-400 block text-[10.5px]">Residence Address</span><span class="text-slate-800">{{ editableStep3.residenceAddress || '-' }}</span></div>
                </div>
              </div>

              <!-- 3. Details of Officer In-Charge (Swapped to Step 3) + PROPOSAL SELECTION -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-medium">3</span>
                    <h3 class="text-sm font-semibold text-[#0B3558] uppercase tracking-wide">
                      Step 3 – Details of Officer(s) In-Charge ({{ editableStep2.length }})
                    </h3>
                  </div>
                </div>

                <!-- Scheme Designated OIC Selector -->
                <div class="bg-sky-50/70 border border-sky-200 rounded-lg p-3 text-xs">
                  <label class="block font-bold text-[#0B3558] mb-1">
                    Designated Officer In-Charge for this Proposal:
                  </label>
                  <p class="text-[11px] text-slate-600 mb-2">
                    Select the registered Officer In-Charge who will manage and sign operations for this specific scheme application.
                  </p>
                  <select
                    [ngModel]="selectedOicId()"
                    (ngModelChange)="selectedOicId.set($event)"
                    class="w-full sm:w-auto min-w-[280px] bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-1 focus:ring-[#0483AC]"
                  >
                    @for (oic of editableStep2; track oic.id) {
                      <option [value]="oic.id">
                        {{ oic.name }} ({{ oic.designation || 'OIC' }}) - {{ oic.mobileNo }}
                      </option>
                    }
                  </select>
                </div>

                <!-- OIC Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  @for (oic of editableStep2; track oic.id; let idx = $index) {
                    <div
                      class="p-3 rounded-lg border transition-colors"
                      [class.border-[#0483AC]]="selectedOicId() === oic.id"
                      [class.bg-sky-50/30]="selectedOicId() === oic.id"
                      [class.border-slate-200]="selectedOicId() !== oic.id"
                    >
                      <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                        <span class="font-bold text-slate-800">{{ oic.name || 'Officer #' + (idx + 1) }}</span>
                        @if (selectedOicId() === oic.id) {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0483AC] text-white">Designated for Scheme</span>
                        }
                      </div>
                      <div class="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div><span class="text-slate-400">Designation:</span> <span class="font-medium text-slate-700">{{ oic.designation || '-' }}</span></div>
                        <div><span class="text-slate-400">Mobile:</span> <span class="font-mono text-slate-700">{{ oic.mobileNo || '-' }}</span></div>
                        <div><span class="text-slate-400">Email:</span> <span class="text-slate-700">{{ oic.emailId || '-' }}</span></div>
                        <div><span class="text-slate-400">PAN:</span> <span class="font-mono text-slate-700">{{ oic.pan || '-' }}</span></div>
                        <div><span class="text-slate-400">Aadhaar:</span> <span class="font-mono text-slate-700">{{ oic.aadhaarNo || '-' }}</span></div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- 4. Bank Account Details -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-medium">4</span>
                    <h3 class="text-sm font-semibold text-[#0B3558] uppercase tracking-wide">Step 4 – Bank Account Details</h3>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-normal border border-emerald-200">&check; Verified</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span class="text-slate-400 block text-[10.5px]">Name of the Bank</span><span class="font-medium text-slate-800">{{ editableStep4.bankName || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Branch Name</span><span class="text-slate-800">{{ editableStep4.branchName || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Type of Account</span><span class="text-slate-800">{{ editableStep4.accountType || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Account Holder Name</span><span class="font-medium text-slate-800">{{ editableStep4.accountHolderName || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Account No.</span><span class="font-mono text-slate-800">{{ editableStep4.accountNo || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">IFSC Code</span><span class="font-mono text-slate-800">{{ editableStep4.ifscCode || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Mode of Transfer</span><span class="text-slate-800">{{ editableStep4.transferMode || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Cancelled Cheque</span><span class="text-emerald-700 font-medium">{{ editableStep4.cancelledChequeDoc?.fileName || 'Attached' }}</span></div>
                </div>
              </div>
            }

            <!-- ================================================================
                 MODE B: EDITABLE FORM INPUTS (WHEN isEditingOtr() IS TRUE)
                 ================================================================ -->
            @if (isEditingOtr()) {
              <!-- Section 1: Step 1 - Organization Details (Editable) -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-normal">1</span>
                    <h3 class="text-sm font-medium text-[#0B3558] uppercase tracking-wide">Step 1 - Organization Details</h3>
                  </div>
                  <span class="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Editing</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">TP/PIA Short Name</label>
                    <input type="text" [(ngModel)]="editableStep1.shortName" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 font-normal focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">TP/PIA Full Name</label>
                    <input type="text" [(ngModel)]="editableStep1.fullName" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 font-normal focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Nature of Entity</label>
                    <select [(ngModel)]="editableStep1.natureOfEntity" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 font-normal">
                      <option value="PUBLIC LIMITED">PUBLIC LIMITED</option>
                      <option value="PRIVATE LIMITED">PRIVATE LIMITED</option>
                      <option value="SOCIETY">SOCIETY</option>
                      <option value="TRUST">TRUST</option>
                      <option value="PROPRIETORSHIP">PROPRIETORSHIP</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Registration Number (CIN)</label>
                    <input type="text" [(ngModel)]="editableStep1.registrationNumber" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Date of Registration</label>
                    <input type="text" [(ngModel)]="editableStep1.dateOfRegistration" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Company PAN</label>
                    <input type="text" [(ngModel)]="editableStep1.companyPan" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">GST Registered</label>
                    <select [(ngModel)]="editableStep1.gstRegistered" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">GSTIN</label>
                    <input type="text" [(ngModel)]="editableStep1.gstin" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">MSME Registered</label>
                    <select [(ngModel)]="editableStep1.msmeRegistered" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Company Contact No.</label>
                    <input type="text" [(ngModel)]="editableStep1.contactNo" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Company Email-ID</label>
                    <input type="text" [(ngModel)]="editableStep1.emailId" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800" />
                  </div>
                  <div class="sm:col-span-2 md:col-span-3">
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Registered Address</label>
                    <textarea rows="2" [(ngModel)]="editableStep1.registeredAddress" class="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800"></textarea>
                  </div>
                </div>
              </div>

              <!-- Section 2: Step 2 - Authorized Person Details (Editable) -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-normal">2</span>
                    <h3 class="text-sm font-medium text-[#0B3558]">Step 2 – Authorized Person Details</h3>
                  </div>
                  <span class="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Editing</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Name</label>
                    <input type="text" [(ngModel)]="editableStep3.name" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-normal" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Designation</label>
                    <input type="text" [(ngModel)]="editableStep3.designation" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-normal" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Mobile No.</label>
                    <input type="text" [(ngModel)]="editableStep3.mobileNo" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Email-ID</label>
                    <input type="text" [(ngModel)]="editableStep3.emailId" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-normal" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">PAN</label>
                    <input type="text" [(ngModel)]="editableStep3.pan" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Aadhaar No.</label>
                    <input type="text" [(ngModel)]="editableStep3.aadhaarNo" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-mono" />
                  </div>
                </div>
              </div>

              <!-- Section 3: Step 3 - Officer(s) In-Charge (Editable) -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-normal">3</span>
                    <h3 class="text-sm font-medium text-[#0B3558]">Step 3 – Details of Officer(s) In-Charge</h3>
                  </div>
                  <span class="text-[11px] text-slate-500">{{ editableStep2.length }} Officers</span>
                </div>

                <div class="space-y-3 pt-1">
                  @for (oic of editableStep2; track oic.id; let idx = $index) {
                    <div class="p-3 bg-slate-50/70 rounded-lg border border-slate-200 text-xs space-y-2">
                      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        <div>
                          <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Name</label>
                          <input type="text" [(ngModel)]="oic.name" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-normal" />
                        </div>
                        <div>
                          <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Designation</label>
                          <input type="text" [(ngModel)]="oic.designation" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-normal" />
                        </div>
                        <div>
                          <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Mobile No.</label>
                          <input type="text" [(ngModel)]="oic.mobileNo" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-mono" />
                        </div>
                        <div>
                          <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Email-ID</label>
                          <input type="text" [(ngModel)]="oic.emailId" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-normal" />
                        </div>
                        <div>
                          <label class="block text-[10px] text-slate-500 font-normal mb-0.5">PAN</label>
                          <input type="text" [(ngModel)]="oic.pan" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-mono" />
                        </div>
                        <div>
                          <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Aadhaar No.</label>
                          <input type="text" [(ngModel)]="oic.aadhaarNo" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-mono" />
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Section 4: Bank Details (Editable) -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-normal">4</span>
                    <h3 class="text-sm font-medium text-[#0B3558] uppercase tracking-wide">Step 4 – Bank Account Details</h3>
                  </div>
                  <span class="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Editing</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Name of the Bank</label>
                    <input type="text" [(ngModel)]="editableStep4.bankName" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-normal" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Branch Name</label>
                    <input type="text" [(ngModel)]="editableStep4.branchName" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-normal" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Type of Account</label>
                    <input type="text" [(ngModel)]="editableStep4.accountType" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-normal" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Account Holder Name</label>
                    <input type="text" [(ngModel)]="editableStep4.accountHolderName" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-normal" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">Account No.</label>
                    <input type="text" [(ngModel)]="editableStep4.accountNo" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500 font-normal mb-0.5">IFSC Code</label>
                    <input type="text" [(ngModel)]="editableStep4.ifscCode" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-mono" />
                  </div>
                </div>
              </div>
            }

            <!-- Footer Action Button for Step 1 -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                (click)="saveAndProceedToStep2()"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs sm:text-sm font-medium shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Save &amp; Next</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 2: EOI PROPOSAL FORM (The fields missing in OTR from PDF!)
             ==================================================================== -->
        @if (currentStep() === 2) {
          <div class="space-y-6">
            
            <!-- Notice -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-center gap-3 text-xs text-amber-900">
              <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Proposal Form Parameters:</strong> Please fill in the scheme-specific operational details below as mandated in the RSLDC RFP: proposed training centres, past placement experience, annual action plan, and 14 proposal checklist documents.
              </span>
            </div>

            <!-- 1. Proposed Training Centre Details & Infrastructure -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
              <div class="pb-3 border-b border-slate-100">
                <h3 class="text-sm sm:text-base font-bold text-[#0B3558]">
                  1. Proposed Training Centre Details &amp; Infrastructure
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  Operational centres equipped with IT labs, practical labs, classrooms, and washrooms in Rajasthan.
                </p>
              </div>

              <!-- Inline Form to Add Training Centre -->
              <div class="bg-slate-50/70 border border-slate-200 rounded-lg p-4 space-y-3">
                <div class="text-xs font-bold text-[#0B3558] flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-[#0B3558]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Add Proposed Training Centre</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">District / City *</label>
                    <input
                      type="text"
                      [(ngModel)]="newCentre.district"
                      placeholder="e.g. Alwar / Jaipur"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Centre Name *</label>
                    <input
                      type="text"
                      [(ngModel)]="newCentre.centerName"
                      placeholder="e.g. DMR Skill Centre"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Classrooms</label>
                    <input
                      type="number"
                      [(ngModel)]="newCentre.classrooms"
                      min="1"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Practical Labs</label>
                    <input
                      type="number"
                      [(ngModel)]="newCentre.practicalRooms"
                      min="1"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Separate Washrooms</label>
                    <select
                      [(ngModel)]="newCentre.washrooms"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Lab Infrastructure</label>
                    <select
                      [(ngModel)]="newCentre.labInfra"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    >
                      <option value="Available">Available</option>
                      <option value="Under Setup">Under Setup</option>
                    </select>
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-slate-600 mb-1 font-medium">Full Postal Address *</label>
                    <input
                      type="text"
                      [(ngModel)]="newCentre.fullAddress"
                      placeholder="Complete street address, landmark, pincode"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                </div>

                <div class="flex justify-end pt-1">
                  <button
                    type="button"
                    (click)="saveNewCentre()"
                    class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Training Centre</span>
                  </button>
                </div>
              </div>

              <!-- Centres Table or Empty State -->
              @if (trainingCentres.length === 0) {
                <div class="p-4 border border-slate-200 rounded-lg text-center bg-slate-50 text-xs text-slate-500">
                  No training centres added yet. Please fill the details in the form above and click "Add Training Centre".
                </div>
              } @else {
                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-3">District / City</th>
                        <th class="py-2.5 px-3">Name of Training Centre</th>
                        <th class="py-2.5 px-2 text-center">Classrooms</th>
                        <th class="py-2.5 px-2 text-center">Practical Rooms</th>
                        <th class="py-2.5 px-2 text-center">Washrooms</th>
                        <th class="py-2.5 px-2 text-center">Lab Infra</th>
                        <th class="py-2.5 px-3">Full Address</th>
                        <th class="py-2.5 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
                      @for (c of trainingCentres; track c.id; let idx = $index) {
                        <tr class="hover:bg-slate-50/60">
                          <td class="py-2.5 px-3 font-semibold text-slate-900">{{ c.district }}</td>
                          <td class="py-2.5 px-3">{{ c.centerName }}</td>
                          <td class="py-2.5 px-2 text-center text-[#0B3558] font-bold">{{ c.classrooms }}</td>
                          <td class="py-2.5 px-2 text-center text-[#0B3558] font-bold">{{ c.practicalRooms }}</td>
                          <td class="py-2.5 px-2 text-center text-emerald-700">{{ c.washrooms }}</td>
                          <td class="py-2.5 px-2 text-center">
                            <span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                              {{ c.labInfra }}
                            </span>
                          </td>
                          <td class="py-2.5 px-3 text-slate-500 max-w-xs truncate">{{ c.fullAddress }}</td>
                          <td class="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              (click)="removeCentre(idx)"
                              class="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer p-1"
                              title="Remove Centre"
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <!-- 2. Financial Details & Past Placement Track Record (From PDF Page 4) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <!-- Financial Turnover from Skill Development -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
                <div class="pb-2 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 class="text-sm sm:text-base font-medium text-[#0B3558]">
                      2. Financial Details (Last 3 FYs)
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5 font-normal">
                      Turnover realized from skill training and overall operations (INR).
                    </p>
                  </div>
                  <button
                    type="button"
                    (click)="addFinancialYear()"
                    class="px-2.5 py-1 bg-white hover:bg-slate-50 text-[#0B3558] border border-slate-300 rounded text-xs font-medium cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <svg class="w-3.5 h-3.5 text-[#0B3558]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Financial Year</span>
                  </button>
                </div>

                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="bg-slate-50 text-slate-600 font-medium uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2 px-2.5 w-12 text-center">S.No</th>
                        <th class="py-2 px-3 min-w-[130px]">Financial Year</th>
                        <th class="py-2 px-3">Total Turnover (INR)</th>
                        <th class="py-2 px-3">Skill Turnover (INR)</th>
                        <th class="py-2 px-2 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-normal">
                      @for (t of turnoverYears; track $index; let idx = $index) {
                        <tr>
                          <td class="py-2 px-2.5 text-center text-slate-400 font-normal">{{ idx + 1 }}</td>
                          <td class="py-2 px-3">
                            <input
                              type="text"
                              [(ngModel)]="t.year"
                              placeholder="e.g. 2023 - 2024"
                              class="w-full p-1.5 border border-slate-300 rounded font-normal text-xs text-slate-800 focus:outline-none focus:border-[#0B3558]"
                            />
                          </td>
                          <td class="py-2 px-3 font-mono text-slate-700">
                            <input
                              type="text"
                              [(ngModel)]="t.totalTurnover"
                              placeholder="e.g. 50,00,000"
                              class="w-full p-1.5 border border-slate-300 rounded font-mono font-normal text-xs text-slate-800 focus:outline-none focus:border-[#0B3558]"
                            />
                          </td>
                          <td class="py-2 px-3 font-mono text-slate-700">
                            <input
                              type="text"
                              [(ngModel)]="t.skillTurnover"
                              placeholder="e.g. 35,00,000"
                              class="w-full p-1.5 border border-slate-300 rounded font-mono font-normal text-xs text-slate-800 focus:outline-none focus:border-[#0B3558]"
                            />
                          </td>
                          <td class="py-2 px-2 text-center">
                            @if (turnoverYears.length > 1) {
                              <button
                                type="button"
                                (click)="removeFinancialYear(idx)"
                                class="text-rose-500 hover:text-rose-700 text-sm font-normal cursor-pointer p-1"
                                title="Remove FY"
                              >
                                &times;
                              </button>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Past Skill Training & Placement Details -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
                <div class="pb-2 border-b border-slate-100">
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558]">
                    3. Training &amp; Placement Track Record
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Sector-wise candidate training and verified wage placement numbers.
                  </p>
                </div>

                <!-- Inline Entry Form for Placement Record -->
                <div class="bg-slate-50/70 border border-slate-200 rounded-lg p-3 space-y-2.5 text-xs">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    <div class="lg:col-span-2">
                      <label class="block text-slate-600 mb-1 font-medium">Sector Name *</label>
                      <input
                        type="text"
                        [(ngModel)]="newPlacement.sector"
                        placeholder="e.g. Healthcare / IT / Apparel"
                        class="w-full p-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                      />
                    </div>
                    <div>
                      <label class="block text-slate-600 mb-1 font-medium">Financial Year</label>
                      <select
                        [(ngModel)]="newPlacement.year"
                        class="w-full p-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                      >
                        <option value="2023 - 2024">2023 - 2024</option>
                        <option value="2022 - 2023">2022 - 2023</option>
                        <option value="2021 - 2022">2021 - 2022</option>
                        <option value="2020 - 2021">2020 - 2021</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-slate-600 mb-1 font-medium">Trained (Nos) *</label>
                      <input
                        type="number"
                        [(ngModel)]="newPlacement.trained"
                        placeholder="500"
                        class="w-full p-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                      />
                    </div>
                    <div>
                      <label class="block text-slate-600 mb-1 font-medium">Placed (Nos) *</label>
                      <input
                        type="number"
                        [(ngModel)]="newPlacement.placed"
                        placeholder="350"
                        class="w-full p-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                      />
                    </div>
                  </div>
                  <div class="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    <div class="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        [(ngModel)]="newPlacement.proofDoc"
                        placeholder="Proof Doc: placement_proof_certified.pdf"
                        class="w-full p-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                      />
                    </div>
                    <button
                      type="button"
                      (click)="saveNewPlacement()"
                      class="px-3 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Record</span>
                    </button>
                  </div>
                </div>

                @if (placementRecords.length === 0) {
                  <div class="p-4 border border-slate-200 rounded-lg text-center bg-slate-50 text-xs text-slate-500">
                    No past placement track records added yet. Fill the fields above to add records.
                  </div>
                } @else {
                  <div class="overflow-x-auto border border-slate-200 rounded-lg">
                    <table class="w-full text-left border-collapse text-xs">
                      <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th class="py-2 px-3">Sector</th>
                          <th class="py-2 px-2">FY</th>
                          <th class="py-2 px-2 text-center">Trained</th>
                          <th class="py-2 px-2 text-center">Placed</th>
                          <th class="py-2 px-2 text-right">Proof</th>
                          <th class="py-2 px-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 font-normal">
                        @for (p of placementRecords; track p.sector; let idx = $index) {
                          <tr>
                            <td class="py-2 px-3 font-semibold text-slate-800 max-w-[120px] truncate">{{ p.sector }}</td>
                            <td class="py-2 px-2 text-slate-600 font-mono text-[11px]">{{ p.year }}</td>
                            <td class="py-2 px-2 text-center font-bold text-[#0B3558]">{{ p.trained }}</td>
                            <td class="py-2 px-2 text-center font-bold text-emerald-700">{{ p.placed }}</td>
                            <td class="py-2 px-2 text-right text-[11px] text-slate-500 font-mono">{{ p.proofDoc }}</td>
                            <td class="py-2 px-2 text-center">
                              <button
                                type="button"
                                (click)="removePlacement(idx)"
                                class="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer p-1"
                                title="Remove Record"
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>

            </div>

            <!-- 4. Annual Action Plan (From PDF Page 4 & 5) -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
              <div class="pb-2 border-b border-slate-100">
                <h3 class="text-sm sm:text-base font-bold text-[#0B3558]">
                  4. Proposed Annual Action Plan (Target Districts &amp; Batches)
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  Proposed Skill Development Centres (SDCs), sectors, course trades, and batch commitments.
                </p>
              </div>

              <!-- Inline Entry Form for Action Plan -->
              <div class="bg-slate-50/70 border border-slate-200 rounded-lg p-3 space-y-3 text-xs">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Target District *</label>
                    <input
                      type="text"
                      [(ngModel)]="newActionPlan.district"
                      placeholder="e.g. Alwar / Jaipur / Udaipur"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Year</label>
                    <input
                      type="text"
                      [(ngModel)]="newActionPlan.year"
                      placeholder="2025-2026"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Proposed SDCs Count</label>
                    <input
                      type="number"
                      [(ngModel)]="newActionPlan.sdcCount"
                      min="1"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">SDC Location / Block</label>
                    <input
                      type="text"
                      [(ngModel)]="newActionPlan.location"
                      placeholder="e.g. Tehsil / Block name"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                  <div class="lg:col-span-2">
                    <label class="block text-slate-600 mb-1 font-medium">Proposed Sectors</label>
                    <input
                      type="text"
                      [(ngModel)]="newActionPlan.sectors"
                      placeholder="e.g. IT, Healthcare, Apparel, Electronics"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Training Mode</label>
                    <select
                      [(ngModel)]="newActionPlan.mode"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    >
                      <option value="Both">Both (Residential &amp; Non-Res)</option>
                      <option value="Residential">Residential</option>
                      <option value="Non-Residential">Non-Residential</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Committed Batches</label>
                    <input
                      type="number"
                      [(ngModel)]="newActionPlan.batches"
                      min="1"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                </div>

                <div class="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <div class="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      [(ngModel)]="newActionPlan.courses"
                      placeholder="Course / Trade: Assistant Technician Computer Hardware cum DEO"
                      class="w-full p-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-[#0B3558]"
                    />
                  </div>
                  <button
                    type="button"
                    (click)="saveNewActionPlan()"
                    class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add District Action Plan</span>
                  </button>
                </div>
              </div>

              @if (actionPlan.length === 0) {
                <div class="p-4 border border-slate-200 rounded-lg text-center bg-slate-50 text-xs text-slate-500">
                  No annual district action plan added yet. Fill the fields above to commit target districts.
                </div>
              } @else {
                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2 px-2 w-10 text-center">S.No</th>
                        <th class="py-2 px-3">Year</th>
                        <th class="py-2 px-3">Proposed District</th>
                        <th class="py-2 px-2 text-center">SDCs</th>
                        <th class="py-2 px-3">SDC Location</th>
                        <th class="py-2 px-3">Proposed Sectors</th>
                        <th class="py-2 px-3">Course / Trade</th>
                        <th class="py-2 px-2 text-center">Mode</th>
                        <th class="py-2 px-2 text-center">Batches</th>
                        <th class="py-2 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-normal">
                      @for (ap of actionPlan; track ap.id; let idx = $index) {
                        <tr>
                          <td class="py-2.5 px-2 text-center text-slate-400 font-bold">{{ idx + 1 }}</td>
                          <td class="py-2.5 px-3 font-mono text-[11px]">{{ ap.year }}</td>
                          <td class="py-2.5 px-3 font-semibold text-slate-800">{{ ap.district }}</td>
                          <td class="py-2.5 px-2 text-center font-bold text-[#0B3558]">{{ ap.sdcCount }}</td>
                          <td class="py-2.5 px-3 text-slate-600">{{ ap.location }}</td>
                          <td class="py-2.5 px-3 text-slate-700">{{ ap.sectors }}</td>
                          <td class="py-2.5 px-3 text-slate-700 max-w-xs truncate">{{ ap.courses }}</td>
                          <td class="py-2.5 px-2 text-center text-emerald-700 font-medium">{{ ap.mode }}</td>
                          <td class="py-2.5 px-2 text-center font-bold text-slate-900">{{ ap.batches }}</td>
                          <td class="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              (click)="removeActionPlan(idx)"
                              class="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer p-1"
                              title="Remove Plan"
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <!-- 5. EOI Documents Checklist (16 Documents) -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
              <div class="pb-2 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-sm sm:text-base font-medium text-[#0B3558]">
                    5. Mandatory EOI Proposal Documents Checklist ({{ eoiDocuments.length }} Documents)
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5 font-normal">
                    Upload scanned signed &amp; sealed copies of the statutory annexures mandated in the RSLDC RFP.
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded bg-blue-50 text-[#0B3558] text-xs font-medium border border-blue-200">
                    {{ attachedDocsCount() }} / {{ eoiDocuments.length }} Attached
                  </span>
                  <button
                    type="button"
                    (click)="attachAllSampleDocs()"
                    class="px-3 py-1 bg-white hover:bg-slate-50 text-[#0B3558] text-xs font-medium border border-slate-300 rounded cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span>Attach All Mandated Annexures</span>
                  </button>
                </div>
              </div>

              <div class="space-y-2.5">
                @for (doc of eoiDocuments; track doc.id) {
                  <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <input
                      #fileInput
                      type="file"
                      accept=".pdf,application/pdf"
                      class="hidden"
                      (change)="onFileSelected($event, doc)"
                    />
                    <div class="flex items-start gap-3">
                      <span class="w-6 h-6 rounded-full bg-blue-100 text-[#0B3558] font-medium text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {{ doc.id }}
                      </span>
                      <div>
                        <span class="font-normal text-slate-800 block text-xs sm:text-[13px]">{{ doc.name }}</span>
                        @if (doc.status === 'uploaded') {
                          <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                            <div class="w-4 h-4 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                              <svg class="w-3 h-3 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                              </svg>
                            </div>
                            <span class="text-slate-800 font-normal">{{ doc.fileName }}</span>
                            <span>({{ doc.fileSize }})</span>
                            <span class="text-slate-400">&bull; {{ doc.uploadedDate }}</span>
                          </div>
                        } @else {
                          <div class="mt-1 text-[11px] text-amber-700 font-normal">
                            Status: Pending upload (Required for scrutiny)
                          </div>
                        }
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      @if (doc.status === 'uploaded') {
                        <button
                          type="button"
                          (click)="previewDoc(doc)"
                          class="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-normal cursor-pointer shadow-2xs"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          (click)="removeDoc(doc)"
                          class="px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded text-xs font-normal cursor-pointer shadow-2xs"
                        >
                          Remove
                        </button>
                      } @else {
                        <button
                          type="button"
                          (click)="fileInput.click()"
                          class="px-3 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-medium cursor-pointer shadow-2xs flex items-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5 text-rose-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                          </svg>
                          <span>Upload Annexure (PDF)</span>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Footer Action Buttons for Step 2 -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                (click)="goToStep(1)"
                class="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                &larr; Back to OTR Profile
              </button>

              <button
                type="button"
                (click)="goToStep(3)"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Save &amp; Proceed to Complete Preview</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 3: COMPLETE PREVIEW (Both OTR + Proposal Details)
             ==================================================================== -->
        @if (currentStep() === 3) {
          <div class="space-y-6">
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-center justify-between text-xs text-[#0B3558]">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-normal">
                  <strong class="font-medium">Comprehensive Application Preview:</strong> Review all verified OTR entity particulars and scheme proposal details below before formal submission.
                </span>
              </div>
              <button
                type="button"
                (click)="goToStep(2)"
                class="text-xs font-normal text-[#0B3558] hover:underline cursor-pointer"
              >
                &larr; Edit Proposal
              </button>
            </div>

            <!-- Preview Part A: OTR Institutional Profile -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-normal">A</span>
                  <h3 class="text-sm font-medium text-[#0B3558]">TP/PIA One Time Registration (OTR) Particulars</h3>
                </div>
                <button
                  type="button"
                  (click)="goToStep(1)"
                  class="text-xs font-normal text-[#0B3558] hover:text-[#EA580C] flex items-center gap-1 cursor-pointer"
                >
                  Edit in Step 1
                </button>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-normal">
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">TP/PIA Short Name</span>
                  <span class="text-slate-800 font-normal">{{ otrData().step1.shortName || 'DMR SAKSHAM' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">TP/PIA Full Name</span>
                  <span class="text-slate-800 font-normal">{{ otrData().step1.fullName || 'DMR ENTERPRISES PRIVATE LIMITED' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">Nature of Entity</span>
                  <span class="text-slate-800 font-normal">{{ otrData().step1.natureOfEntity || 'PUBLIC LIMITED' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">Registration Number of Entity</span>
                  <span class="font-mono text-slate-800 font-normal">{{ otrData().step1.registrationNumber || '07AAECD8566H1ZC' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">Company PAN</span>
                  <span class="font-mono text-slate-800 font-normal">{{ otrData().step1.companyPan || 'AAECD8566H' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">GSTIN</span>
                  <span class="font-mono text-slate-800 font-normal">{{ otrData().step1.gstin || '08AAACR1234F1Z5' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">Udyam Number</span>
                  <span class="font-mono text-slate-800 font-normal">{{ otrData().step1.udyamNumber || 'UDYAM-RJ-14-0019284' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">Turn Over</span>
                  <span class="text-slate-800 font-normal">₹ {{ otrData().step1.turnOver || '1203.35' }} Lakhs</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">Name of the Bank</span>
                  <span class="text-slate-800 font-normal">{{ otrData().step4.bankName || 'HDFC Bank' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">Account No.</span>
                  <span class="font-mono text-slate-800 font-normal">{{ otrData().step4.accountNo || '50200047885422' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">IFSC Code</span>
                  <span class="font-mono text-slate-800 font-normal">{{ otrData().step4.ifscCode || 'HDFC0001441' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block font-normal text-[11px]">Authorized Person (Name)</span>
                  <span class="text-slate-800 font-normal">{{ otrData().step3.name || 'SUMAN GUPTA' }} ({{ otrData().step3.designation || 'Director' }})</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-slate-500 block font-normal text-[11px]">Registered Address</span>
                  <span class="text-slate-800 font-normal">{{ otrData().step1.registeredAddress || 'GROUND FLOOR, KHASRA NO-5/24, GALI NO-7, SOUTH PART-II, SWAROOP NAGAR EXTN, North Delhi, Delhi - 110042' }}</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-slate-500 block font-normal text-[11px]">Office Address</span>
                  <span class="text-slate-800 font-normal">{{ otrData().step1.officeAddress || 'GROUND FLOOR, KHASRA NO-5/24, GALI NO-7, SOUTH PART-II, SWAROOP NAGAR EXTN, North Delhi, Delhi - 110042' }}</span>
                </div>
              </div>
            </div>

            <!-- Preview Part B: Proposed Training Centres -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-normal">B</span>
                  <h3 class="text-sm font-medium text-[#0B3558]">Proposed Training Centres ({{ trainingCentres.length }} Centres)</h3>
                </div>
                <button
                  type="button"
                  (click)="goToStep(2)"
                  class="text-xs font-normal text-[#0B3558] hover:text-[#EA580C] flex items-center gap-1 cursor-pointer"
                >
                  Edit in Step 2
                </button>
              </div>
              @if (trainingCentres.length === 0) {
                <div class="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between flex-wrap gap-2 font-normal">
                  <span>No training centres added yet.</span>
                  <button type="button" (click)="goToStep(2)" class="font-medium underline text-[#0B3558] hover:text-[#EA580C] cursor-pointer">
                    + Add Training Centres in Step 2
                  </button>
                </div>
              } @else {
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-normal">
                  @for (c of trainingCentres; track c.id) {
                    <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span class="font-medium text-slate-800 block">{{ c.district }}</span>
                      <span class="text-[11px] text-slate-500 block truncate font-normal">{{ c.centerName }}</span>
                      <span class="text-[10px] text-emerald-700 font-normal mt-1 inline-block">
                        {{ c.classrooms }} Classrooms &bull; {{ c.practicalRooms }} Labs &bull; Washrooms: {{ c.washrooms }}
                      </span>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Preview Part C: Financials & Placement Track Record -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-2xs">
                <h4 class="text-xs font-medium text-[#0B3558] uppercase">3-Year Turnover Summary (INR)</h4>
                <div class="space-y-1 text-xs font-normal">
                  @for (t of turnoverYears; track $index) {
                    <div class="flex justify-between py-1 border-b border-slate-100 font-mono">
                      <span class="text-slate-500">{{ t.year }}:</span>
                      <span class="text-slate-800 font-normal">₹ {{ t.totalTurnover || '0' }} (Skill: ₹ {{ t.skillTurnover || '0' }})</span>
                    </div>
                  }
                </div>
              </div>

              <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-2xs">
                <h4 class="text-xs font-medium text-[#0B3558] uppercase">Placement Track Record</h4>
                <div class="space-y-1 text-xs font-normal">
                  @if (placementRecords.length === 0) {
                    <p class="text-xs text-slate-400 py-2 font-normal">No placement track record added yet.</p>
                  } @else {
                    @for (p of placementRecords; track p.sector) {
                      <div class="flex justify-between py-1 border-b border-slate-100">
                        <span class="text-slate-600 truncate max-w-[150px] font-normal">{{ p.sector }}:</span>
                        <span class="text-emerald-700 font-normal">{{ p.trained }} Trained / {{ p.placed }} Placed</span>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>

            <!-- Preview Part D: Proposed Annual Action Plan -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-normal">D</span>
                  <h3 class="text-sm font-medium text-[#0B3558]">Proposed Annual Action Plan ({{ actionPlan.length }} Districts)</h3>
                </div>
                <button
                  type="button"
                  (click)="goToStep(2)"
                  class="text-xs font-normal text-[#0B3558] hover:text-[#EA580C] flex items-center gap-1 cursor-pointer"
                >
                  Edit in Step 2
                </button>
              </div>
              @if (actionPlan.length === 0) {
                <p class="text-xs text-slate-400 py-2 font-normal">No annual district action plan added yet.</p>
              } @else {
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-normal">
                  @for (ap of actionPlan; track ap.id) {
                    <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span class="font-medium text-slate-800 block">{{ ap.district }} ({{ ap.year }})</span>
                      <span class="text-[11px] text-slate-600 block truncate font-normal">{{ ap.courses }}</span>
                      <span class="text-[10px] text-emerald-700 font-normal mt-1 inline-block">
                        {{ ap.sdcCount }} SDCs &bull; {{ ap.batches }} Batches &bull; Mode: {{ ap.mode }}
                      </span>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Preview Part E: Statutory Proposal Documents -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-normal">E</span>
                  <h3 class="text-sm font-medium text-[#0B3558]">EOI Statutory Proposal Documents Checklist ({{ attachedDocsCount() }} / {{ eoiDocuments.length }} Attached)</h3>
                </div>
                <button
                  type="button"
                  (click)="goToStep(2)"
                  class="text-xs font-normal text-[#0B3558] hover:text-[#EA580C] flex items-center gap-1 cursor-pointer"
                >
                  Edit Documents in Step 2
                </button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                @for (d of eoiDocuments; track d.id) {
                  <div class="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div class="flex items-center gap-2 max-w-[70%]">
                      <div class="w-4 h-4 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                        <svg class="w-3 h-3 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                        </svg>
                      </div>
                      <span class="font-normal text-slate-800 truncate">{{ d.name }}</span>
                    </div>
                    @if (d.status === 'uploaded') {
                      <span class="text-emerald-700 font-normal text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        &check; Attached
                      </span>
                    } @else {
                      <span class="text-amber-700 font-normal text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                        Pending
                      </span>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Declaration Checkbox -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="previewDeclaration"
                [(ngModel)]="declarationAgreed"
                class="mt-1 w-4 h-4 rounded border-slate-300 text-[#0B3558] focus:ring-[#0B3558] cursor-pointer"
              />
              <label for="previewDeclaration" class="text-xs text-slate-700 leading-relaxed cursor-pointer font-normal">
                I hereby solemnly declare that all particulars and documents submitted in this Expression of Interest (EOI) are true, authentic, and in accordance with RSLDC guidelines. I understand that any false statement will result in immediate disqualification and forfeiture of EMD under Rajasthan Transparency in Public Procurement (RTPP) Act.
              </label>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                (click)="goToStep(2)"
                class="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-normal text-slate-700 cursor-pointer transition-colors"
              >
                &larr; Back to Proposal Form
              </button>

              <!-- Submit Button that opens the clean Confirmation Modal -->
              <button
                type="button"
                [disabled]="!declarationAgreed()"
                (click)="openSubmitConfirm()"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-medium shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Submit EOI Application</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 4: FEE PAYMENT (Matching Screenshot 3)
             ==================================================================== -->
        @if (currentStep() === 4) {
          <div class="space-y-6">
            
            <!-- Step Title -->
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-[#0B3558] tracking-tight">
                Fee Payment
              </h2>
              <p class="text-xs text-slate-500 mt-0.5 font-normal">
                Mandatory EOI Application Fees &amp; Secure Payment Gateway
              </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              <!-- Left 2 Columns: Compulsory Fees & Payment Modes -->
              <div class="lg:col-span-2 space-y-6">
                
                <!-- 1. Applicable EOI Application Fees (Compulsory) -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div class="pb-2 border-b border-slate-100">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900">
                      1. Applicable EOI Application Fees (Compulsory)
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5 font-normal">
                      Both Processing Fee (₹2,000) and Earnest Money Deposit (₹50,000) are compulsory for EOI proposal submission under MMKVY-RAJKVIK.
                    </p>
                  </div>

                  <div class="space-y-3">
                    <!-- Fee 1: Processing Fee -->
                    <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          &check;
                        </div>
                        <div>
                          <h4 class="text-xs sm:text-sm font-semibold text-slate-900">
                            1. Processing Fee <span class="text-rose-600">*</span>
                          </h4>
                          <p class="text-[11px] text-slate-500 mt-0.5 font-normal">
                            Non-refundable administrative scrutiny fee under MMKVY-RAJKVIK guidelines.
                          </p>
                        </div>
                      </div>
                      <span class="text-sm sm:text-base font-bold text-slate-900">₹2,000</span>
                    </div>

                    <!-- Fee 2: Earnest Money Deposit (EMD) -->
                    <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          &check;
                        </div>
                        <div>
                          <h4 class="text-xs sm:text-sm font-semibold text-slate-900">
                            2. Earnest Money Deposit (EMD) <span class="text-rose-600">*</span>
                          </h4>
                          <p class="text-[11px] text-slate-500 mt-0.5 font-normal">
                            Refundable security deposit for Training Provider / PIA empanelment proposal under MMKVY-RAJKVIK.
                          </p>
                        </div>
                      </div>
                      <span class="text-sm sm:text-base font-bold text-slate-900">₹50,000</span>
                    </div>
                  </div>
                </div>

                <!-- 2. Select Payment Mode -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div class="pb-2 border-b border-slate-100">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900">
                      2. Select Payment Mode
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5 font-normal">
                      Choose your preferred payment method to complete the application fee payment.
                    </p>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <!-- UPI -->
                    <label
                      class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
                      [class.border-[#0B3558]]="paymentMethod() === 'UPI'"
                      [class.bg-blue-50/40]="paymentMethod() === 'UPI'"
                      [class.border-slate-200]="paymentMethod() !== 'UPI'"
                    >
                      <div class="flex items-center justify-between mb-3">
                        <input
                          type="radio"
                          name="payMode"
                          value="UPI"
                          [(ngModel)]="paymentMethod"
                          class="w-4 h-4 text-[#0B3558] focus:ring-[#0B3558]"
                        />
                        <span class="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-[#0B3558] rounded">Instant</span>
                      </div>
                      <div>
                        <div class="text-xs font-semibold text-slate-900">UPI</div>
                        <div class="text-[11px] text-slate-500 mt-0.5 font-normal">Google Pay, PhonePe, Paytm, BHIM</div>
                      </div>
                    </label>

                    <!-- Net Banking -->
                    <label
                      class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
                      [class.border-[#0B3558]]="paymentMethod() === 'NetBanking'"
                      [class.bg-blue-50/40]="paymentMethod() === 'NetBanking'"
                      [class.border-slate-200]="paymentMethod() !== 'NetBanking'"
                    >
                      <div class="flex items-center justify-between mb-3">
                        <input
                          type="radio"
                          name="payMode"
                          value="NetBanking"
                          [(ngModel)]="paymentMethod"
                          class="w-4 h-4 text-[#0B3558] focus:ring-[#0B3558]"
                        />
                        <span class="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Bank</span>
                      </div>
                      <div>
                        <div class="text-xs font-semibold text-slate-900">Net Banking</div>
                        <div class="text-[11px] text-slate-500 mt-0.5 font-normal">SBI, HDFC, ICICI, PNB, BoB &amp; 50+ Banks</div>
                      </div>
                    </label>

                    <!-- Debit / Credit Card -->
                    <label
                      class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
                      [class.border-[#0B3558]]="paymentMethod() === 'Card'"
                      [class.bg-blue-50/40]="paymentMethod() === 'Card'"
                      [class.border-slate-200]="paymentMethod() !== 'Card'"
                    >
                      <div class="flex items-center justify-between mb-3">
                        <input
                          type="radio"
                          name="payMode"
                          value="Card"
                          [(ngModel)]="paymentMethod"
                          class="w-4 h-4 text-[#0B3558] focus:ring-[#0B3558]"
                        />
                        <span class="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Cards</span>
                      </div>
                      <div>
                        <div class="text-xs font-semibold text-slate-900">Debit / Credit Card</div>
                        <div class="text-[11px] text-slate-500 mt-0.5 font-normal">RuPay, Visa, MasterCard, Maestro</div>
                      </div>
                    </label>

                  </div>
                </div>

              </div>

              <!-- Right Column: Payment Summary Card (Matching Screenshot 3) -->
              <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden sticky top-24">
                <div class="bg-[#0B3558] text-white p-4 flex items-center justify-between">
                  <h4 class="text-xs font-bold uppercase tracking-wider">Payment Summary</h4>
                  <span class="text-[10px] font-semibold px-2 py-0.5 bg-white/10 rounded">MMKVY-RAJKVIK</span>
                </div>

                <div class="p-5 space-y-4 text-xs">
                  <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100 font-normal">
                    <span>Processing Fee</span>
                    <span class="font-semibold text-slate-900">₹2,000</span>
                  </div>
                  <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100 font-normal">
                    <span>EMD Fee</span>
                    <span class="font-semibold text-slate-900">₹50,000</span>
                  </div>

                  <div class="flex justify-between items-baseline pt-1">
                    <span class="text-sm font-semibold text-slate-900">Total Payable Amount</span>
                    <span class="text-xl font-bold text-[#0B3558]">₹52,000</span>
                  </div>

                  <div class="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 font-normal">
                    Selected Method: <strong class="text-slate-800 font-semibold">{{ paymentMethod() }}</strong>
                  </div>

                  <!-- Proceed to Pay Action Button -->
                  <button
                    type="button"
                    [disabled]="isPaymentProcessing()"
                    (click)="triggerPayment()"
                    class="w-full py-3 px-4 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    @if (isPaymentProcessing()) {
                      <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing Payment...</span>
                    } @else {
                      <span>Proceed to Payment (₹52,000) &rarr;</span>
                    }
                  </button>
                </div>
              </div>

            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 5: SUBMISSION RECEIPTS & ACKNOWLEDGEMENT
             ==================================================================== -->
        @if (currentStep() === 5) {
          <div class="space-y-5">
            
            <!-- Success Title Banner -->
            <div class="bg-emerald-700 text-white rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
              <div class="flex items-center gap-4 text-center sm:text-left">
                <div class="w-11 h-11 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-normal text-xl text-white shrink-0 mx-auto">
                  &check;
                </div>
                <div>
                  <span class="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10.5px] font-normal uppercase tracking-wider">
                    Application Successfully Submitted &amp; Verified
                  </span>
                  <h2 class="text-lg sm:text-xl font-medium mt-1">
                    EOI Proposal Submitted for {{ schemeCode() }}
                  </h2>
                  <p class="text-xs text-emerald-100 mt-0.5 max-w-xl font-normal">
                    Your Expression of Interest application has been recorded in the ISMS 2.0 repository and routed to the RSLDC scrutiny committee.
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  (click)="goToTenderStatus()"
                  class="px-4 py-2 bg-white text-[#0B3558] hover:bg-slate-50 rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  View in Tender Status &rarr;
                </button>
              </div>
            </div>

            <!-- Compact Application Summary Card -->
            <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <div class="text-xs font-medium text-[#0B3558] uppercase tracking-wide">
                  Application Summary &amp; Reference Details
                </div>
                <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-normal border border-emerald-200">
                  Technical Opening Initiated
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-normal">
                <div class="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200">
                  <span class="text-blue-600 block font-normal text-[10px] uppercase">Application Ref No.</span>
                  <span class="font-mono font-medium text-[#0B3558] text-xs sm:text-sm">ISMS-EOI-2026-9871</span>
                </div>
                <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span class="text-slate-500 block font-normal text-[10px] uppercase">Submission Timestamp</span>
                  <span class="font-mono text-slate-800 text-xs font-normal">22-Sep-2026 09:10:00 IST</span>
                </div>
                <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span class="text-slate-500 block font-normal text-[10px] uppercase">Applicant Agency</span>
                  <span class="font-normal text-slate-800 text-xs truncate block">{{ otrData().step1.fullName || 'DMR ENTERPRISES PRIVATE LIMITED' }}</span>
                </div>
                <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span class="text-slate-500 block font-normal text-[10px] uppercase">Payment Ref &amp; Fee</span>
                  <span class="font-mono text-slate-800 font-normal text-xs truncate block">TXN-ISMS-2026-345678 (₹52,000)</span>
                </div>
              </div>
            </div>

            <!-- Both Downloadable Receipt Cards (Side by Side) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Card 1: Official EOI Submission Acknowledgment Receipt -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 hover:border-blue-200 transition-colors">
                <div class="flex items-start gap-3.5">
                  <div class="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                    <svg class="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="text-[10px] uppercase font-normal text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      PDF Document &bull; Verified Receipt
                    </span>
                    <h3 class="text-sm font-medium text-[#0B3558] mt-1.5">
                      EOI Submission Acknowledgment Receipt
                    </h3>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                      Official digitally sealed submission receipt containing verified OTR profile, SDC training centers, batch commitments, and statutory annexures.
                    </p>
                  </div>
                </div>

                <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600 font-normal">
                  <span>Ref: ISMS-EOI-2026-9871</span>
                  <span>Size: 184 KB</span>
                </div>

                <div class="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    (click)="downloadReceipt('acknowledgment')"
                    class="flex-1 py-2 px-3 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Receipt (PDF)</span>
                  </button>
                  <button
                    type="button"
                    (click)="printReceipt()"
                    class="py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print</span>
                  </button>
                </div>
              </div>

              <!-- Card 2: Fee Payment & EMD Challan Receipt -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 hover:border-blue-200 transition-colors">
                <div class="flex items-start gap-3.5">
                  <div class="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                    <svg class="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="text-[10px] uppercase font-normal text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      PDF Document &bull; Treasury E-Challan
                    </span>
                    <h3 class="text-sm font-medium text-[#0B3558] mt-1.5">
                      Fee Payment &amp; EMD Challan Receipt
                    </h3>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                      Government of Rajasthan Cyber Treasury transaction receipt for ₹50,000 EMD (Refundable) and ₹2,000 RFP Processing Fee (Non-Refundable).
                    </p>
                  </div>
                </div>

                <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600 font-normal">
                  <span>TXN: TXN-ISMS-2026-345678</span>
                  <span class="font-medium text-slate-800">₹ 52,000.00</span>
                </div>

                <div class="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    (click)="downloadReceipt('payment')"
                    class="flex-1 py-2 px-3 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Receipt (PDF)</span>
                  </button>
                  <button
                    type="button"
                    (click)="printReceipt()"
                    class="py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print</span>
                  </button>
                </div>
              </div>

            </div>

            <!-- Bottom Navigation -->
            <div class="pt-2 flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                (click)="goBackToSchemes()"
                class="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
              >
                &larr; Back to Schemes &amp; Tenders
              </button>

              <button
                type="button"
                (click)="goToTenderStatus()"
                class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Track Application in Tender Status</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        }

      </main>

      <!-- ====================================================================
           MODAL 1: SUBMIT CONFIRMATION MODAL (Clean, No Emoji, Cancel & Confirm)
           ==================================================================== -->
      @if (showSubmitConfirmModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div class="relative max-w-md w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-left">
            
            <h3 class="text-base font-bold text-slate-900 tracking-tight">
              Submit EOI Application?
            </h3>
            
            <p class="text-xs text-slate-600 leading-relaxed font-normal">
              Please confirm that all information and documents provided in the application are correct. After submission, the application will be submitted for official scrutiny.
            </p>

            <!-- Buttons: Cancel & Confirm (No Emojis!) -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="showSubmitConfirmModal.set(false)"
                class="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="confirmSubmitAndProceedToPayment()"
                class="px-5 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ====================================================================
           MODAL 2: PAYMENT SUCCESSFUL POPUP (Exact Replica of Screenshot 4)
           ==================================================================== -->
      @if (showPaymentSuccessModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center font-sans">
            
            <!-- Solid Green Top Header with White Checkmark Circle -->
            <div class="bg-[#15803d] text-white py-7 px-6 space-y-2">
              <div class="w-14 h-14 mx-auto rounded-full bg-white text-[#15803d] flex items-center justify-center shadow-md mb-2">
                <svg class="w-7 h-7 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-xl font-bold tracking-tight">
                Payment Successful
              </h3>
              <p class="text-xs text-emerald-100 font-normal">
                Payment has been completed successfully via UPI
              </p>
            </div>

            <!-- Inner White Details Box -->
            <div class="p-6 space-y-4 text-xs font-sans text-left">
              
              <div class="border border-slate-200 rounded-xl p-4 bg-white space-y-3 font-normal">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Transaction ID:</span>
                  <span class="font-mono font-bold text-slate-800 text-xs">TXN-ISMS-2026-345678</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Amount Paid:</span>
                  <span class="text-base font-bold text-slate-900">₹52,000</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Payment Date &amp; Time:</span>
                  <span class="text-slate-700">22 Sept 2026, 9:10 am</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Payment Method:</span>
                  <span class="text-slate-800 font-semibold">UPI</span>
                </div>
              </div>

              <p class="text-center text-[11px] text-slate-500 leading-normal px-2 font-normal">
                Your transaction receipt has been recorded. Click Continue to preview the complete EOI application details.
              </p>

              <!-- Button: Continue to Application Preview -> -->
              <button
                type="button"
                (click)="continueFromPaymentSuccess()"
                class="w-full py-3 px-4 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Application Preview &rarr;</span>
              </button>

            </div>

          </div>
        </div>
      }



    </div>
  `
})
export class SchemeFormComponent {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private otrFormService = inject(OtrFormService);

    readonly otrData = this.otrFormService.formData;

    currentStep = signal<number>(1);

    schemeTitle = signal<string>('Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)');
    schemeRefNo = signal<string>('RSLDC/EOI/MMKVY Cat I II III/2026-27/01');
    schemeName = signal<string>('MMKVY');
    schemeCode = signal<string>('MMKVY');
    schemeCategory = signal<string>('ALL');
    schemeEoiCategory = signal<string>('General');
    schemeDatePublished = signal<string>('23/01/2026');
    schemeClosingDate = signal<string>('10/03/2026');
    schemeEmdFee = signal<string>('₹50,000');
    schemeProcessFee = signal<string>('₹2,000');
    schemeDescription = signal<string>(
        'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
    );

    // Local editable copies of OTR data that can be changed by the user in Step 1
    editableStep1: Step1OrgDetails = JSON.parse(JSON.stringify(this.otrFormService.formData().step1));
    editableStep2: OfficerInCharge[] = JSON.parse(JSON.stringify(this.otrFormService.formData().step2));
    editableStep3: Step3AuthorizedPerson = JSON.parse(JSON.stringify(this.otrFormService.formData().step3));
    editableStep4: Step4BankDetails = JSON.parse(JSON.stringify(this.otrFormService.formData().step4));

    isEditingOtr = signal<boolean>(false);
    selectedOicId = signal<string>('');

    readonly avgTotalTurnover = computed(() => {
        const rows = this.editableStep1?.financialYears;
        if (!rows || !rows.length) return '0.00';
        const sum = rows.reduce((acc, r) => acc + (parseFloat(r.totalTurnover) || 0), 0);
        return (sum / rows.length).toFixed(2);
    });

    readonly avgSkillTurnover = computed(() => {
        const rows = this.editableStep1?.financialYears;
        if (!rows || !rows.length) return '0.00';
        const sum = rows.reduce((acc, r) => acc + (parseFloat(r.skillTurnover) || 0), 0);
        return (sum / rows.length).toFixed(2);
    });

    declarationAgreed = signal<boolean>(true);
    paymentMethod = signal<string>('UPI');
    isPaymentProcessing = signal<boolean>(false);

    showSubmitConfirmModal = signal<boolean>(false);
    showPaymentSuccessModal = signal<boolean>(false);
    showAddCentreModal = signal<boolean>(false);
    showAddPlacementModal = signal<boolean>(false);
    showAddActionPlanModal = signal<boolean>(false);

    newCentre: Partial<TrainingCenterItem> = {
        district: '',
        centerName: '',
        classrooms: 2,
        practicalRooms: 2,
        washrooms: 'Yes',
        labInfra: 'Available',
        fullAddress: ''
    };

    newPlacement: {
        sector: string;
        year: string;
        trained: number | null;
        placed: number | null;
        proofDoc: string;
    } = {
            sector: '',
            year: '2023 - 2024',
            trained: null,
            placed: null,
            proofDoc: ''
        };

    newActionPlan: {
        year: string;
        district: string;
        sdcCount: number | null;
        location: string;
        sectors: string;
        courses: string;
        mode: 'Residential' | 'Non-Residential' | 'Both';
        batches: number | null;
    } = {
            year: '2025-2026',
            district: '',
            sdcCount: 2,
            location: '',
            sectors: '',
            courses: '',
            mode: 'Both',
            batches: 10
        };

    /** Proposed Training Centres - blank by default so applicant fills them */
    trainingCentres: TrainingCenterItem[] = [];

    /** 3-Year Turnover - blank by default so applicant fills them */
    turnoverYears: TurnoverYear[] = [
        { year: '2021 - 2022', totalTurnover: '', skillTurnover: '' },
        { year: '2022 - 2023', totalTurnover: '', skillTurnover: '' },
        { year: '2023 - 2024', totalTurnover: '', skillTurnover: '' }
    ];

    /** Training & Placement Experience - blank by default so applicant fills them */
    placementRecords: TrainingPlacementRecord[] = [];

    /** Proposed Annual Action Plan - blank by default so applicant fills them */
    actionPlan: ActionPlanDistrict[] = [];

    /** 14 EOI Checklist Documents - all start pending so applicant uploads/attaches them */
    eoiDocuments: EoiDocumentItem[] = [
        {
            id: 1,
            name: 'A certificate of NSDC partner, where NSDC has stake',
            description: 'NSDC equity or loan participation certificate',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: false,
            status: 'pending'
        },
        {
            id: 2,
            name: 'Annexure-1: Covering Letter as per Annexure-1',
            description: 'Official proposal submission covering letter on letterhead',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 3,
            name: 'Annexure-3: Audited Financial Statements for last three consecutive financial years',
            description: 'CA certified balance sheet and P&L accounts',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 4,
            name: 'Annexure-5: Training and Placement details as per Annexure-5',
            description: 'Detailed candidate-level wage placement track record',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 5,
            name: 'Annexure-6: An affidavit for not being blacklisted',
            description: 'Non-judicial notary stamped anti-blacklisting undertaking',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 6,
            name: 'Annexure-7: Self-certificate / declaration as per Annexure-7',
            description: 'Statutory compliance self-declaration',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 7,
            name: 'Copy of EOI Document with sign and seal on each page',
            description: 'Complete downloaded RFP document signed on all pages',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 8,
            name: 'Details of Active skill development centre as per Annexure-4',
            description: 'Geotagged infrastructure layout and classroom proofs',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 9,
            name: 'Details of Board of directors as per Annexure-8',
            description: 'Board member listing, DIN, and KYC profiles',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 10,
            name: 'Details of Placement partnership/Tie-ups with Industry as per Annexure-9',
            description: 'Active corporate MOUs and employer placement commitments',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 11,
            name: 'Details of working experience in relevant sector as per Annexure-10',
            description: 'Sector specific past training delivery completion certificates',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 12,
            name: 'List of divisions and group of district as per annexure 11',
            description: 'District cluster prioritization and outreach methodology',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 13,
            name: 'Proposed evaluation matrix annexure 12',
            description: 'Technical scoring and qualification criteria response',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 14,
            name: 'Supporting documents as per annexure 13',
            description: 'Additional credentials, awards, and accreditations',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 15,
            name: 'Turnover Proof Document / CA Turnover Certificate with UDIN',
            description: 'Chartered Accountant certified balance sheet and turnover certificate for last 3 financial years',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        },
        {
            id: 16,
            name: 'Not Blacklisted Proof / Anti-Blacklisting Notarized Affidavit',
            description: 'Non-judicial notary stamped anti-blacklisting undertaking affirming entity is not blacklisted by any Govt agency',
            fileName: '',
            fileSize: '',
            uploadedDate: '',
            isMandatory: true,
            status: 'pending'
        }
    ];

    constructor() {
        this.route.queryParams.subscribe(params => {
            if (params['refNo']) this.schemeRefNo.set(params['refNo']);
            if (params['title']) this.schemeTitle.set(params['title']);
            if (params['schemeName']) this.schemeName.set(params['schemeName']);
            if (params['code']) this.schemeCode.set(params['code']);
            if (params['category']) this.schemeCategory.set(params['category']);
            if (params['schemeCategory']) this.schemeCategory.set(params['schemeCategory']);
            if (params['eoiCategory']) this.schemeEoiCategory.set(params['eoiCategory']);
            if (params['datePublished']) this.schemeDatePublished.set(params['datePublished']);
            if (params['closingDate']) this.schemeClosingDate.set(params['closingDate']);
            if (params['emdFee']) this.schemeEmdFee.set(params['emdFee']);
            if (params['processFee']) this.schemeProcessFee.set(params['processFee']);
            if (params['eoiDescription']) this.schemeDescription.set(params['eoiDescription']);
            if (params['selectedOicId']) {
                this.selectedOicId.set(params['selectedOicId']);
            } else if (this.editableStep2 && this.editableStep2.length > 0) {
                this.selectedOicId.set(this.editableStep2[0].id);
            }
        });
    }

    saveAndProceedToStep2(): void {
        this.otrFormService.updateStep1(this.editableStep1);
        this.otrFormService.updateStep2(this.editableStep2);
        this.otrFormService.updateStep3(this.editableStep3);
        this.otrFormService.updateStep4(this.editableStep4);
        this.goToStep(2);
    }

    goToStep(step: number): void {
        this.currentStep.set(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    goBackToSchemes(): void {
        this.router.navigate(['/tenders']);
    }

    openSubmitConfirm(): void {
        this.showSubmitConfirmModal.set(true);
    }

    confirmSubmitAndProceedToPayment(): void {
        this.showSubmitConfirmModal.set(false);
        this.goToStep(4);
    }

    triggerPayment(): void {
        this.isPaymentProcessing.set(true);
        setTimeout(() => {
            this.isPaymentProcessing.set(false);
            this.showPaymentSuccessModal.set(true);
        }, 1200);
    }

    continueFromPaymentSuccess(): void {
        this.showPaymentSuccessModal.set(false);
        this.goToStep(5);
    }

    goToTenderStatus(): void {
        this.router.navigate(['/tender-status']);
    }

    openAddCentreModal(): void {
        this.newCentre = {
            district: '',
            centerName: '',
            classrooms: 2,
            practicalRooms: 2,
            washrooms: 'Yes',
            labInfra: 'Available',
            fullAddress: ''
        };
        this.showAddCentreModal.set(true);
    }

    saveNewCentre(): void {
        if (!this.newCentre.district || !this.newCentre.centerName) {
            alert('Please enter District and Centre Name');
            return;
        }

        const item: TrainingCenterItem = {
            id: `tc-${Date.now()}`,
            district: this.newCentre.district || 'Rajasthan',
            centerName: this.newCentre.centerName || 'Skill Centre',
            telephone: '0',
            classrooms: this.newCentre.classrooms || 2,
            practicalRooms: this.newCentre.practicalRooms || 2,
            washrooms: this.newCentre.washrooms || 'Yes',
            labInfra: this.newCentre.labInfra || 'Available',
            fullAddress: this.newCentre.fullAddress || 'Rajasthan'
        };

        this.trainingCentres.push(item);
        this.showAddCentreModal.set(false);
    }

    removeCentre(index: number): void {
        this.trainingCentres.splice(index, 1);
    }

    openAddPlacementModal(): void {
        this.newPlacement = {
            sector: '',
            year: '2023 - 2024',
            trained: null,
            placed: null,
            proofDoc: ''
        };
        this.showAddPlacementModal.set(true);
    }

    saveNewPlacement(): void {
        if (!this.newPlacement.sector) {
            alert('Please enter Sector Name');
            return;
        }

        const item: TrainingPlacementRecord = {
            sector: this.newPlacement.sector,
            year: this.newPlacement.year || '2023 - 2024',
            trained: Number(this.newPlacement.trained) || 0,
            placed: Number(this.newPlacement.placed) || 0,
            proofDoc: this.newPlacement.proofDoc || 'placement_proof.pdf'
        };

        this.placementRecords.push(item);
        this.showAddPlacementModal.set(false);
    }

    removePlacement(index: number): void {
        this.placementRecords.splice(index, 1);
    }

    openAddActionPlanModal(): void {
        this.newActionPlan = {
            year: '2025-2026',
            district: '',
            sdcCount: 2,
            location: '',
            sectors: '',
            courses: '',
            mode: 'Both',
            batches: 10
        };
        this.showAddActionPlanModal.set(true);
    }

    saveNewActionPlan(): void {
        if (!this.newActionPlan.district) {
            alert('Please enter Proposed District');
            return;
        }

        const item: ActionPlanDistrict = {
            id: `ap-${Date.now()}`,
            year: this.newActionPlan.year || '2025-2026',
            district: this.newActionPlan.district,
            sdcCount: Number(this.newActionPlan.sdcCount) || 1,
            location: this.newActionPlan.location || this.newActionPlan.district,
            sectors: this.newActionPlan.sectors || 'Multi-Skills',
            courses: this.newActionPlan.courses || 'Skill Development Trade',
            mode: (this.newActionPlan.mode as any) || 'Both',
            batches: Number(this.newActionPlan.batches) || 1
        };

        this.actionPlan.push(item);
        this.showAddActionPlanModal.set(false);
    }

    removeActionPlan(index: number): void {
        this.actionPlan.splice(index, 1);
    }

    addFinancialYear(): void {
        this.turnoverYears.push({ year: '', totalTurnover: '', skillTurnover: '' });
    }

    removeFinancialYear(index: number): void {
        if (this.turnoverYears.length > 1) {
            this.turnoverYears.splice(index, 1);
        }
    }

    onFileSelected(event: Event, doc: EoiDocumentItem): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            doc.fileName = file.name;
            const sizeMb = file.size / (1024 * 1024);
            doc.fileSize = sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
            const now = new Date();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            doc.uploadedDate = `${now.getDate()}-${months[now.getMonth()]}-${now.getFullYear()}`;
            doc.status = 'uploaded';
            input.value = '';
        }
    }

    attachedDocsCount = computed(() => this.eoiDocuments.filter(d => d.status === 'uploaded').length);

    uploadDoc(doc: EoiDocumentItem): void {
        doc.status = 'uploaded';
        doc.fileName = `Annexure_${doc.id}_Mandated_Signed.pdf`;
        doc.fileSize = '1.4 MB';
        doc.uploadedDate = '23-Sep-2026';
    }

    attachAllSampleDocs(): void {
        this.eoiDocuments.forEach((doc, idx) => {
            doc.status = 'uploaded';
            doc.fileName = `Scan_Annexure_${doc.id}_Signed.pdf`;
            doc.fileSize = `${(1.2 + (idx % 3) * 0.8).toFixed(1)} MB`;
            doc.uploadedDate = '23-Sep-2026';
        });
    }

    removeDoc(doc: EoiDocumentItem): void {
        doc.status = 'pending';
        doc.fileName = '';
        doc.fileSize = '';
        doc.uploadedDate = '';
    }

    previewDoc(doc: EoiDocumentItem): void {
        alert(`Viewing document: ${doc.fileName || doc.name}\nSize: ${doc.fileSize || '1.4 MB'}\nStatus: Attached and Verified.`);
    }

    downloadReceipt(type: 'acknowledgment' | 'payment'): void {
        const isAck = type === 'acknowledgment';
        const filename = isAck ? 'EOI_Submission_Acknowledgment_Receipt.txt' : 'EOI_Fee_Payment_Receipt.txt';
        const textContent = isAck
            ? `================================================================================
RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)
INTEGRATED SCHEME MANAGEMENT SYSTEM 2.0 (ISMS)
OFFICIAL EOI PROPOSAL SUBMISSION ACKNOWLEDGMENT RECEIPT
================================================================================
Application Reference Number : ISMS-EOI-2026-9871
Submission Timestamp         : 23-Sep-2026 09:10:00 IST
Applicant Agency Name        : ${this.otrData().step1.fullName || 'DMR ENTERPRISES PRIVATE LIMITED'}
Registration / CIN           : ${this.otrData().step1.registrationNumber || '07AAECD8566H1ZC'}
Scheme Code & Name           : MMKVY-RAJKVIK (Mukhya Mantri Kaushalya Vikas Yojana)
Category                     : Category I: RAJKVIK
Initial Scrutiny Status      : Technical Opening Initiated
Fee Payment Reference        : TXN-ISMS-2026-345678 (₹52,000 Paid)
Proposed SDC Training Centres: ${this.trainingCentres.length} Centres
Attached Statutory Documents : ${this.attachedDocsCount()} / ${this.eoiDocuments.length} Mandatory Documents Verified
================================================================================
Digitally Verified & Sealed by Government of Rajasthan (RSLDC ISMS 2.0)
================================================================================`
            : `================================================================================
GOVERNMENT OF RAJASTHAN - RAJASTHAN CYBER TREASURY
DEPARTMENT OF SKILL, EMPLOYMENT & ENTREPRENEURSHIP (RSLDC)
EOI FEE & EMD PAYMENT TRANSACTION RECEIPT
================================================================================
Transaction Reference Number : TXN-ISMS-2026-345678
Treasury Reference CIN       : CYB-RAJ-2026-99182348
Transaction Timestamp        : 22-Sep-2026 09:08:42 IST
Applicant Name               : ${this.otrData().step1.fullName || 'DMR ENTERPRISES PRIVATE LIMITED'}
PAN Number                   : ${this.otrData().step1.companyPan || 'AAECD8566H'}
Scheme Ref No                : ${this.schemeRefNo()}
Payment Mode                 : ${this.paymentMethod()}
--------------------------------------------------------------------------------
Breakup:
1. Earnest Money Deposit (EMD Fee) (Refundable)     : ₹ 50,000.00
2. RFP Tender Processing Fee (Non-Refundable)       : ₹  2,000.00
--------------------------------------------------------------------------------
TOTAL AMOUNT PAID                                   : ₹ 52,000.00
Payment Status                                      : SUCCESSFUL
================================================================================
Government of Rajasthan Cyber Treasury Portal Integration
================================================================================`;

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    printReceipt(): void {
        window.print();
    }

    printPage(): void {
        window.print();
    }
}
