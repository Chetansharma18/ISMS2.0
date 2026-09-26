import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
  isExisting?: boolean;
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
  category: 'mandatory' | 'annexure' | 'remaining';
}

@Component({
  selector: 'app-scheme-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="w-full min-h-screen bg-slate-50/60 pb-16 font-sans text-slate-800">
      
      <!-- ====================================================================
           1. Top Navigation Bar: Stepper Progress (Full-width responsive header)
           ==================================================================== -->
      <header class="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs font-sans">
        <div class="w-full max-w-[1420px] mx-auto px-3 sm:px-6 lg:px-8 py-3">
          
          <!-- 5-Step Stepper Progress Bar -->
          <nav class="w-full flex items-center justify-between overflow-x-auto no-scrollbar py-0.5" aria-label="EOI Application Steps">
            
            <!-- Step 1: OTR Profile Verification -->
            <button
              type="button"
              (click)="goToStep(1)"
              class="flex items-center gap-2 sm:gap-2.5 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 1"
              [class.font-semibold]="currentStep() === 1"
              [class.text-slate-400]="currentStep() < 1"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-emerald-600 text-white': currentStep() > 1,
                  'bg-[#0B3558] text-white ring-2 ring-[#0B3558]/30 scale-105': currentStep() === 1,
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 1
                }"
                [style.color]="currentStep() >= 1 ? '#ffffff !important' : ''"
              >
                @if (currentStep() > 1) {
                  &check;
                } @else {
                  1
                }
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 1</span>
                <span class="text-xs font-semibold">OTR Profile</span>
              </div>
            </button>

            <span class="flex-1 mx-2 sm:mx-3 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 1"></span>

            <!-- Step 2: EOI Proposal Details -->
            <button
              type="button"
              (click)="goToStep(2)"
              class="flex items-center gap-2 sm:gap-2.5 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 2"
              [class.font-semibold]="currentStep() === 2"
              [class.text-slate-400]="currentStep() < 2"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-emerald-600 text-white': currentStep() > 2,
                  'bg-[#0B3558] text-white ring-2 ring-[#0B3558]/30 scale-105': currentStep() === 2,
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 2
                }"
                [style.color]="currentStep() >= 2 ? '#ffffff !important' : ''"
              >
                @if (currentStep() > 2) {
                  &check;
                } @else {
                  2
                }
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 2</span>
                <span class="text-xs font-semibold">Proposal Form</span>
              </div>
            </button>

            <span class="flex-1 mx-2 sm:mx-3 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 2"></span>

            <!-- Step 3: Complete Preview -->
            <button
              type="button"
              (click)="goToStep(3)"
              class="flex items-center gap-2 sm:gap-2.5 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 3"
              [class.font-semibold]="currentStep() === 3"
              [class.text-slate-400]="currentStep() < 3"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-emerald-600 text-white': currentStep() > 3,
                  'bg-[#0B3558] text-white ring-2 ring-[#0B3558]/30 scale-105': currentStep() === 3,
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 3
                }"
                [style.color]="currentStep() >= 3 ? '#ffffff !important' : ''"
              >
                @if (currentStep() > 3) {
                  &check;
                } @else {
                  3
                }
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 3</span>
                <span class="text-xs font-semibold">Complete Preview</span>
              </div>
            </button>

            <span class="flex-1 mx-2 sm:mx-3 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 3"></span>

            <!-- Step 4: Fee Payment -->
            <button
              type="button"
              (click)="goToStep(4)"
              class="flex items-center gap-2 sm:gap-2.5 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 4"
              [class.font-semibold]="currentStep() === 4"
              [class.text-slate-400]="currentStep() < 4"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-emerald-600 text-white': currentStep() > 4,
                  'bg-[#0B3558] text-white ring-2 ring-[#0B3558]/30 scale-105': currentStep() === 4,
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 4
                }"
                [style.color]="currentStep() >= 4 ? '#ffffff !important' : ''"
              >
                @if (currentStep() > 4) {
                  &check;
                } @else {
                  4
                }
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 4</span>
                <span class="text-xs font-semibold">Fee Payment</span>
              </div>
            </button>

            <span class="flex-1 mx-2 sm:mx-3 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 4"></span>

            <!-- Step 5: Submission & Receipt -->
            <button
              type="button"
              (click)="goToStep(5)"
              class="flex items-center gap-2 sm:gap-2.5 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() === 5"
              [class.font-semibold]="currentStep() === 5"
              [class.text-slate-400]="currentStep() < 5"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-[#0B3558] text-white ring-2 ring-[#0B3558]/30 scale-105': currentStep() === 5,
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 5
                }"
                [style.color]="currentStep() === 5 ? '#ffffff !important' : ''"
              >
                5
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 5</span>
                <span class="text-xs font-semibold">Submission Receipt</span>
              </div>
            </button>

          </nav>
        </div>
      </header>

      <!-- Main Container: Fully responsive with balanced edge margins -->
      <main class="w-full max-w-[1420px] mx-auto px-3 sm:px-6 lg:px-8 pt-5 space-y-6 font-sans">
        
        <!-- ====================================================================
             2. SCHEME HEADER CARD (8 Parameters Strip)
             ==================================================================== -->
        
        <!-- Back Navigation -->
        <div class="flex items-center -mt-1 mb-2">
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 rounded-md border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#0483AC] active:scale-95 transition-all cursor-pointer font-semibold shadow-2xs"
            title="Back"
          >
            <svg class="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="font-semibold text-sm">Back</span>
          </button>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div class="p-4 sm:p-5 lg:p-6 space-y-3.5">
            <div class="space-y-1">
              <h2 class="text-lg sm:text-xl font-bold text-[#0B3558] tracking-tight">
                {{ schemeTitle() }}
              </h2>
              <p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                {{ schemeDescription() }}
              </p>
            </div>

            <!-- Parameters Strip -->
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-3.5 border-t border-slate-100 text-xs">
              <div>
                <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI REFERENCE NO.</span>
                <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5 break-all">{{ schemeRefNo() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME NAME</span>
                <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ schemeName() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME CATEGORY</span>
                <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ schemeCategory() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI CATEGORY</span>
                <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ schemeEoiCategory() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE PUBLISHED</span>
                <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ schemeDatePublished() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF CLOSING</span>
                <span class="font-bold text-rose-600 text-[11.5px] block mt-0.5">{{ schemeClosingDate() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EMD FEE</span>
                <span class="font-bold text-slate-800 text-[11.5px] block mt-0.5">{{ schemeEmdFee() }} <span class="text-[10px] text-slate-400 font-normal">(Refundable)</span></span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">PROCESSING FEE</span>
                <span class="font-bold text-slate-800 text-[11.5px] block mt-0.5">{{ schemeProcessFee() }} <span class="text-[10px] text-slate-400 font-normal">(Non-Refundable)</span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- ====================================================================
             STEP 1: OTR PROFILE VERIFICATION
             ==================================================================== -->
        @if (currentStep() === 1) {
          <div class="space-y-5">

            <!-- Top Header & Edit Toggle Bar -->
            <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558]">OTR Profile Verification</h3>
                  <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
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

            <!-- MODE A: READ-ONLY VIEW (DEFAULT) -->
            @if (!isEditingOtr()) {
              <!-- 1. Organization Details -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-semibold">1</span>
                    <h3 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide">Step 1 – Organization Details</h3>
                  </div>
                  <span class="text-xs text-slate-500 font-mono">CIN: {{ editableStep1.registrationNumber || '-' }}</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                  <div><span class="text-slate-400 block text-[10.5px]">Short Name</span><span class="font-semibold text-slate-800">{{ editableStep1.shortName || '-' }}</span></div>
                  <div class="sm:col-span-2"><span class="text-slate-400 block text-[10.5px]">Full Name</span><span class="font-semibold text-slate-800">{{ editableStep1.fullName || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Nature of Entity</span><span class="font-semibold text-slate-800">{{ editableStep1.natureOfEntity || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Date of Registration</span><span class="text-slate-800">{{ editableStep1.dateOfRegistration || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">State of Reg.</span><span class="text-slate-800">{{ editableStep1.stateOfLegalReg || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Company PAN</span><span class="font-mono font-bold text-slate-800">{{ editableStep1.companyPan || '-' }}</span></div>
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
                            <td class="py-1.5 px-3 text-slate-700 border-r border-slate-100">{{ fy.year }}</td>
                            <td class="py-1.5 px-3 text-slate-700 border-r border-slate-100">{{ fy.totalTurnover || '-' }}</td>
                            <td class="py-1.5 px-3 text-slate-700">{{ fy.skillTurnover || '-' }}</td>
                          </tr>
                        }
                        <tr class="bg-slate-50 font-semibold border-t border-slate-200">
                          <td class="py-1.5 px-3 text-slate-700 border-r border-slate-100">3-Year Average</td>
                          <td class="py-1.5 px-3 text-[#0483AC] font-bold border-r border-slate-100">{{ avgTotalTurnover() }} Lacs</td>
                          <td class="py-1.5 px-3 text-[#0483AC] font-bold">{{ avgSkillTurnover() }} Lacs</td>
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

              <!-- 2. Authorized Person Details -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-semibold">2</span>
                    <h3 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide">Step 2 – Authorized Person Details</h3>
                  </div>
                  <span class="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">&check; Verified</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                  <div><span class="text-slate-400 block text-[10.5px]">Name</span><span class="font-bold text-slate-800">{{ editableStep3.name || '-' }}</span></div>
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

              <!-- 3. Officer In-Charge (Updated: DROPDOWN ONLY as requested) -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-semibold">3</span>
                    <h3 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide">
                      Step 3 – Details of Officer In-Charge
                    </h3>
                  </div>
                  <span class="text-xs text-sky-800 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Scheme Selection
                  </span>
                </div>

                <!-- Clean Dropdown Selection -->
                <div class="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-[#0B3558] mb-1">
                      Choose Officer In-Charge (Name) *
                    </label>
                    <p class="text-[11.5px] text-slate-500 mb-2.5">
                      Select the Officer In-Charge registered under your OTR profile who will be officially designated to manage this MMKVY proposal.
                    </p>
                    <div class="relative max-w-xl">
                      <select
                        [ngModel]="selectedOicId()"
                        (ngModelChange)="selectedOicId.set($event)"
                        class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent shadow-2xs"
                      >
                        @for (oic of editableStep2; track oic.id) {
                          <option [value]="oic.id">
                            {{ oic.name }} ({{ oic.designation || 'Officer' }})
                          </option>
                        }
                      </select>
                    </div>
                  </div>

                  <!-- Selected Officer Compact Verified Badge/Summary -->
                  @if (selectedOic(); as currentOic) {
                    <div class="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-700">
                      <div class="flex items-center gap-1.5">
                        <span class="text-slate-400 font-medium">Designation:</span>
                        <span class="font-semibold text-slate-900">{{ currentOic.designation || 'Officer In-Charge' }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-slate-400 font-medium">Mobile:</span>
                        <span class="font-mono font-semibold text-slate-900">{{ currentOic.mobileNo || '-' }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-slate-400 font-medium">Email:</span>
                        <span class="text-slate-900">{{ currentOic.emailId || '-' }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-slate-400 font-medium">PAN:</span>
                        <span class="font-mono text-slate-900">{{ currentOic.pan || '-' }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- 4. Bank Account Details -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-semibold">4</span>
                    <h3 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide">Step 4 – Bank Account Details</h3>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">&check; Verified</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                  <div><span class="text-slate-400 block text-[10.5px]">Name of the Bank</span><span class="font-semibold text-slate-800">{{ editableStep4.bankName || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Branch Name</span><span class="text-slate-800">{{ editableStep4.branchName || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Type of Account</span><span class="text-slate-800">{{ editableStep4.accountType || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Account Holder Name</span><span class="font-semibold text-slate-800">{{ editableStep4.accountHolderName || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Account No.</span><span class="font-mono font-semibold text-slate-800">{{ editableStep4.accountNo || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">IFSC Code</span><span class="font-mono font-semibold text-slate-800">{{ editableStep4.ifscCode || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Mode of Transfer</span><span class="text-slate-800">{{ editableStep4.transferMode || '-' }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Cancelled Cheque</span><span class="text-emerald-700 font-semibold">{{ editableStep4.cancelledChequeDoc?.fileName || 'Attached' }}</span></div>
                </div>
              </div>
            }

            <!-- MODE B: EDITABLE FORM INPUTS (WHEN isEditingOtr() IS TRUE) -->
            @if (isEditingOtr()) {
              <!-- Step 1 Org Editable -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-semibold">1</span>
                    <h3 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide">Edit Organization Details</h3>
                  </div>
                  <span class="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">Editing</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">TP/PIA Short Name</label>
                    <input type="text" [(ngModel)]="editableStep1.shortName" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">TP/PIA Full Name</label>
                    <input type="text" [(ngModel)]="editableStep1.fullName" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Nature of Entity</label>
                    <select [(ngModel)]="editableStep1.natureOfEntity" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800">
                      <option value="PUBLIC LIMITED">PUBLIC LIMITED</option>
                      <option value="PRIVATE LIMITED">PRIVATE LIMITED</option>
                      <option value="SOCIETY">SOCIETY</option>
                      <option value="TRUST">TRUST</option>
                      <option value="PROPRIETORSHIP">PROPRIETORSHIP</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Registration Number (CIN)</label>
                    <input type="text" [(ngModel)]="editableStep1.registrationNumber" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Date of Registration</label>
                    <input type="text" [(ngModel)]="editableStep1.dateOfRegistration" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Company PAN</label>
                    <input type="text" [(ngModel)]="editableStep1.companyPan" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">GST Registered</label>
                    <select [(ngModel)]="editableStep1.gstRegistered" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">GSTIN</label>
                    <input type="text" [(ngModel)]="editableStep1.gstin" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">MSME Registered</label>
                    <select [(ngModel)]="editableStep1.msmeRegistered" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Company Contact No.</label>
                    <input type="text" [(ngModel)]="editableStep1.contactNo" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Company Email-ID</label>
                    <input type="text" [(ngModel)]="editableStep1.emailId" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800" />
                  </div>
                  <div class="sm:col-span-2 md:col-span-3">
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Registered Address</label>
                    <textarea rows="2" [(ngModel)]="editableStep1.registeredAddress" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800"></textarea>
                  </div>
                </div>
              </div>

              <!-- Officer In-Charge in Edit Mode (Dropdown Only) -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-semibold">3</span>
                    <h3 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide">Officer In-Charge Selection</h3>
                  </div>
                </div>

                <div class="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5">
                  <label class="block text-xs font-bold text-[#0B3558] mb-1">Choose Officer In-Charge (Name) *</label>
                  <select
                    [ngModel]="selectedOicId()"
                    (ngModelChange)="selectedOicId.set($event)"
                    class="w-full sm:w-auto min-w-[320px] bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3558]"
                  >
                    @for (oic of editableStep2; track oic.id) {
                      <option [value]="oic.id">{{ oic.name }} ({{ oic.designation || 'Officer' }})</option>
                    }
                  </select>
                </div>
              </div>
            }

            <!-- Footer Action Button for Step 1 -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                (click)="saveAndProceedToStep2()"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Save &amp; Proceed to Proposal Form</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 2: EOI PROPOSAL FORM
             ==================================================================== -->
        @if (currentStep() === 2) {
          <div class="space-y-6">
            
            <!-- Notice -->
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start sm:items-center gap-3 text-xs text-amber-900 shadow-2xs">
              <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Proposal Form Parameters:</strong> Review and select from your existing training centres or propose new centres, add past placement track records, annual action plan, and attach mandatory statutory annexures.
              </span>
            </div>

            <!-- ================================================================
                 1. TRAINING CENTRES SECTION (Existing Centres + Optional New Proposal)
                 ================================================================ -->
            <div id="training-centres-section" class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5 shadow-xs">
              <div class="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">1</span>
                    Training Centres (Existing Infrastructure &amp; Proposal Centres)
                  </h3>
                  <p class="text-xs text-slate-500 mt-1">
                    Select existing verified centres to deploy for this scheme, or optionally create/propose new centres for MMKVY.
                  </p>
                </div>
                <span class="px-2.5 py-1 rounded bg-sky-50 text-[#0B3558] text-xs font-bold border border-sky-200">
                  {{ selectedCentresForScheme().length }} Centre(s) Deployed for Scheme
                </span>
              </div>

              <!-- PART A: EXISTING CENTRES -->
              <div class="space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-[#0B3558]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Existing Registered Training Centres ({{ existingCentres.length }})</span>
                  </h4>
                  <button
                    type="button"
                    (click)="showAddExistingForm.set(!showAddExistingForm())"
                    class="text-xs text-[#0483AC] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{{ showAddExistingForm() ? '✕ Close Form' : '+ Add / Register Another Existing Centre' }}</span>
                  </button>
                </div>

                <!-- If NO existing centres filled in past: prompt to enter first centre -->
                @if (existingCentres.length === 0) {
                  <div class="p-5 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/50 text-center space-y-3">
                    <div class="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      !
                    </div>
                    <div>
                      <h5 class="text-xs sm:text-sm font-bold text-slate-800">No Existing Training Centres Found</h5>
                      <p class="text-xs text-slate-600 mt-1 max-w-lg mx-auto">
                        You have not filled any training centre details in the past. Please enter your primary/first centre details below to register it.
                      </p>
                    </div>
                    <button
                      type="button"
                      (click)="showAddExistingForm.set(true)"
                      class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      + Enter First Training Centre Details
                    </button>
                  </div>
                }

                <!-- Inline Form to Add Existing Centre (if user has none or wants to register more) -->
                @if (showAddExistingForm() || existingCentres.length === 0) {
                  <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span class="text-xs font-bold text-[#0B3558]">
                        {{ existingCentres.length === 0 ? 'Enter Primary / First Centre Details' : 'Register New Existing Centre' }}
                      </span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">District / City *</label>
                        <input
                          type="text"
                          [(ngModel)]="newExistingCentre.district"
                          placeholder="e.g. Jaipur / Alwar / Kota"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        />
                      </div>
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">Centre Name *</label>
                        <input
                          type="text"
                          [(ngModel)]="newExistingCentre.centerName"
                          placeholder="e.g. RSLDC Main Skill Centre"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        />
                      </div>
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">Classrooms</label>
                        <input
                          type="number"
                          [(ngModel)]="newExistingCentre.classrooms"
                          min="1"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        />
                      </div>
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">Practical Labs</label>
                        <input
                          type="number"
                          [(ngModel)]="newExistingCentre.practicalRooms"
                          min="1"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        />
                      </div>
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">Separate Washrooms</label>
                        <select
                          [(ngModel)]="newExistingCentre.washrooms"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">Lab Infrastructure</label>
                        <select
                          [(ngModel)]="newExistingCentre.labInfra"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        >
                          <option value="Available">Available</option>
                          <option value="Under Setup">Under Setup</option>
                        </select>
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-slate-600 mb-1 font-medium">Full Postal Address *</label>
                        <input
                          type="text"
                          [(ngModel)]="newExistingCentre.fullAddress"
                          placeholder="Plot number, industrial area, landmark, pincode"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        />
                      </div>
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        (click)="saveNewExistingCentre()"
                        class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Save &amp; Add Existing Centre
                      </button>
                    </div>
                  </div>
                }

                <!-- Existing Centres Listing with Select-for-Scheme Option -->
                @if (existingCentres.length > 0) {
                  <div class="overflow-x-auto border border-slate-200 rounded-xl">
                    <table class="w-full text-left border-collapse text-xs">
                      <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th class="py-2.5 px-3 text-center w-28">Deploy for MMKVY</th>
                          <th class="py-2.5 px-3">District</th>
                          <th class="py-2.5 px-3">Centre Name</th>
                          <th class="py-2.5 px-2 text-center">Classrooms</th>
                          <th class="py-2.5 px-2 text-center">Labs</th>
                          <th class="py-2.5 px-2 text-center">Washrooms</th>
                          <th class="py-2.5 px-2 text-center">Lab Infra</th>
                          <th class="py-2.5 px-3">Full Address</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
                        @for (c of existingCentres; track c.id) {
                          <tr class="hover:bg-slate-50/70" [class.bg-sky-50/30]="isCentreSelectedForScheme(c.id)">
                            <td class="py-2.5 px-3 text-center">
                              <label class="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  [checked]="isCentreSelectedForScheme(c.id)"
                                  (change)="toggleCentreForScheme(c.id)"
                                  class="w-4 h-4 rounded text-[#0B3558] focus:ring-[#0B3558] cursor-pointer"
                                />
                                <span class="text-[11px] font-semibold" [class.text-[#0B3558]]="isCentreSelectedForScheme(c.id)">
                                  {{ isCentreSelectedForScheme(c.id) ? 'Selected' : 'Select' }}
                                </span>
                              </label>
                            </td>
                            <td class="py-2.5 px-3 font-semibold text-slate-900">{{ c.district }}</td>
                            <td class="py-2.5 px-3 font-medium">{{ c.centerName }}</td>
                            <td class="py-2.5 px-2 text-center font-bold text-[#0B3558]">{{ c.classrooms }}</td>
                            <td class="py-2.5 px-2 text-center font-bold text-[#0B3558]">{{ c.practicalRooms }}</td>
                            <td class="py-2.5 px-2 text-center text-emerald-700">{{ c.washrooms }}</td>
                            <td class="py-2.5 px-2 text-center">
                              <span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                                {{ c.labInfra }}
                              </span>
                            </td>
                            <td class="py-2.5 px-3 text-slate-500 max-w-xs truncate">{{ c.fullAddress }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>

              <!-- PART B: OPTIONAL PROPOSAL CENTRES (NEW CENTRES FOR SCHEME) -->
              <div class="pt-4 border-t border-slate-200 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 uppercase">Optional</span>
                      <span>Propose New Training Centre specifically for MMKVY</span>
                    </h4>
                    <p class="text-[11.5px] text-slate-500 mt-0.5">
                      If required under this scheme, you can propose new centres to establish in addition to or instead of existing ones.
                    </p>
                  </div>
                  <button
                    type="button"
                    (click)="showNewCentreForm.set(!showNewCentreForm())"
                    class="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#0B3558] rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{{ showNewCentreForm() ? '✕ Close Form' : '+ Add New Proposed Centre' }}</span>
                  </button>
                </div>

                @if (showNewCentreForm()) {
                  <div class="bg-sky-50/40 border border-sky-200 rounded-xl p-4 sm:p-5 space-y-3">
                    <div class="text-xs font-bold text-[#0B3558] flex items-center gap-1.5 pb-2 border-b border-sky-100">
                      <span>Enter Details of New Proposed Centre</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">District / City *</label>
                        <input
                          type="text"
                          [(ngModel)]="newCentre.district"
                          placeholder="e.g. Udaipur / Bikaner"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        />
                      </div>
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">Centre Name *</label>
                        <input
                          type="text"
                          [(ngModel)]="newCentre.centerName"
                          placeholder="e.g. Proposed MMKVY SDC Hub"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        />
                      </div>
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">Classrooms</label>
                        <input
                          type="number"
                          [(ngModel)]="newCentre.classrooms"
                          min="1"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        />
                      </div>
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">Practical Labs</label>
                        <input
                          type="number"
                          [(ngModel)]="newCentre.practicalRooms"
                          min="1"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        />
                      </div>
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">Separate Washrooms</label>
                        <select
                          [(ngModel)]="newCentre.washrooms"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-slate-600 mb-1 font-medium">Lab Infrastructure</label>
                        <select
                          [(ngModel)]="newCentre.labInfra"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
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
                          placeholder="Complete address of proposed premises"
                          class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                        />
                      </div>
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        (click)="saveNewCentre()"
                        class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Add Proposed Centre to Scheme
                      </button>
                    </div>
                  </div>
                }

                <!-- Combined Summary of Scheme Centres -->
                @if (selectedCentresForScheme().length > 0) {
                  <div class="pt-3">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Centres Included in this MMKVY Proposal ({{ selectedCentresForScheme().length }})
                    </span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      @for (c of selectedCentresForScheme(); track c.id) {
                        <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1.5 relative">
                          <div class="flex items-center justify-between">
                            <span class="font-bold text-slate-900">{{ c.centerName }}</span>
                            <span
                              class="px-2 py-0.5 rounded text-[10px] font-bold"
                              [ngClass]="c.isExisting ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'"
                            >
                              {{ c.isExisting ? 'Existing Centre' : 'New Proposed' }}
                            </span>
                          </div>
                          <div class="text-slate-600 text-[11px]">{{ c.district }} &bull; {{ c.classrooms }} Classrooms &bull; {{ c.practicalRooms }} Labs</div>
                          <div class="text-slate-400 text-[10.5px] truncate">{{ c.fullAddress }}</div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- ================================================================
                 2. PAST SKILL TRAINING & PLACEMENT TRACK RECORD
                 ================================================================ -->
            <div id="placement-section" class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div class="pb-2 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">2</span>
                    Training &amp; Placement Track Record
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Sector-wise candidate training and verified wage placement performance.
                  </p>
                </div>
              </div>

              <!-- Inline Entry Form -->
              <div class="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div class="lg:col-span-2">
                    <label class="block text-slate-600 mb-1 font-medium">Sector Name *</label>
                    <input
                      type="text"
                      [(ngModel)]="newPlacement.sector"
                      placeholder="e.g. Healthcare / IT / Apparel"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Financial Year</label>
                    <select
                      [(ngModel)]="newPlacement.year"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
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
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Placed (Nos) *</label>
                    <input
                      type="number"
                      [(ngModel)]="newPlacement.placed"
                      placeholder="350"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                </div>

                <div class="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <div class="flex-1 min-w-[220px]">
                    <input
                      type="text"
                      [(ngModel)]="newPlacement.proofDoc"
                      placeholder="Proof Document reference: e.g. placement_proof_certified.pdf"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                  <button
                    type="button"
                    (click)="saveNewPlacement()"
                    class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Placement Record</span>
                  </button>
                </div>
              </div>

              @if (placementRecords.length === 0) {
                <div class="p-4 border border-slate-200 rounded-lg text-center bg-slate-50 text-xs text-slate-500">
                  No past placement records added yet. Fill the fields above to add records.
                </div>
              } @else {
                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-3">Sector</th>
                        <th class="py-2.5 px-2">FY</th>
                        <th class="py-2.5 px-2 text-center">Trained</th>
                        <th class="py-2.5 px-2 text-center">Placed</th>
                        <th class="py-2.5 px-2 text-right">Proof</th>
                        <th class="py-2.5 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-normal">
                      @for (p of placementRecords; track p.sector; let idx = $index) {
                        <tr>
                          <td class="py-2.5 px-3 font-semibold text-slate-800">{{ p.sector }}</td>
                          <td class="py-2.5 px-2 text-slate-600 font-mono text-[11px]">{{ p.year }}</td>
                          <td class="py-2.5 px-2 text-center font-bold text-[#0B3558]">{{ p.trained }}</td>
                          <td class="py-2.5 px-2 text-center font-bold text-emerald-700">{{ p.placed }}</td>
                          <td class="py-2.5 px-2 text-right text-[11px] text-slate-500 font-mono">{{ p.proofDoc }}</td>
                          <td class="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              (click)="removePlacement(idx)"
                              class="text-rose-500 hover:text-rose-700 text-sm font-semibold cursor-pointer p-1"
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

            <!-- ================================================================
                 3. ANNUAL ACTION PLAN (TARGET DISTRICTS & BATCHES)
                 ================================================================ -->
            <div id="action-plan-section" class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div class="pb-2 border-b border-slate-100">
                <h3 class="text-sm sm:text-base font-bold text-[#0B3558] flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">3</span>
                  Proposed Annual Action Plan (Target Districts &amp; Batches)
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  Proposed Skill Development Centres (SDCs), sectors, course trades, and committed batches.
                </p>
              </div>

              <!-- Inline Entry Form -->
              <div class="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Target District *</label>
                    <input
                      type="text"
                      [(ngModel)]="newActionPlan.district"
                      placeholder="e.g. Alwar / Jaipur / Udaipur"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Year</label>
                    <input
                      type="text"
                      [(ngModel)]="newActionPlan.year"
                      placeholder="2025-2026"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Proposed SDCs Count</label>
                    <input
                      type="number"
                      [(ngModel)]="newActionPlan.sdcCount"
                      min="1"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">SDC Location / Block</label>
                    <input
                      type="text"
                      [(ngModel)]="newActionPlan.location"
                      placeholder="e.g. Tehsil / Block name"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                  <div class="lg:col-span-2">
                    <label class="block text-slate-600 mb-1 font-medium">Proposed Sectors</label>
                    <input
                      type="text"
                      [(ngModel)]="newActionPlan.sectors"
                      placeholder="e.g. IT, Healthcare, Apparel, Electronics"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1 font-medium">Training Mode</label>
                    <select
                      [(ngModel)]="newActionPlan.mode"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
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
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                </div>

                <div class="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <div class="flex-1 min-w-[220px]">
                    <input
                      type="text"
                      [(ngModel)]="newActionPlan.courses"
                      placeholder="Course / Trade: Assistant Technician Computer Hardware cum DEO"
                      class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                    />
                  </div>
                  <button
                    type="button"
                    (click)="saveNewActionPlan()"
                    class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
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
                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-2 w-10 text-center">S.No</th>
                        <th class="py-2.5 px-3">Year</th>
                        <th class="py-2.5 px-3">Proposed District</th>
                        <th class="py-2.5 px-2 text-center">SDCs</th>
                        <th class="py-2.5 px-3">SDC Location</th>
                        <th class="py-2.5 px-3">Proposed Sectors</th>
                        <th class="py-2.5 px-3">Course / Trade</th>
                        <th class="py-2.5 px-2 text-center">Mode</th>
                        <th class="py-2.5 px-2 text-center">Batches</th>
                        <th class="py-2.5 px-2 text-center">Action</th>
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

            <!-- ================================================================
                 4. EOI DOCUMENTS CHECKLIST (Categorized: Mandatory, Annexures, Remaining)
                 ================================================================ -->
            <div id="documents-section" class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div class="pb-2 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">4</span>
                    Mandatory EOI Proposal Documents Checklist ({{ eoiDocuments.length }} Documents)
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Separated into Mandatory Statutory Documents, Official Scheme Annexures, and Remaining Supporting Documents.
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded bg-blue-50 text-[#0B3558] text-xs font-semibold border border-blue-200">
                    {{ attachedDocsCount() }} / {{ eoiDocuments.length }} Attached
                  </span>
                  <button
                    type="button"
                    (click)="attachAllSampleDocs()"
                    class="px-3 py-1 bg-white hover:bg-slate-50 text-[#0B3558] text-xs font-semibold border border-slate-300 rounded cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span>Attach All Mandated Annexures</span>
                  </button>
                </div>
              </div>

              <!-- 3 Filter Tabs for Separately Showing Documents -->
              <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
                <button
                  type="button"
                  (click)="selectedDocTab.set('all')"
                  class="px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
                  [ngClass]="selectedDocTab() === 'all' ? 'bg-[#0B3558] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  All Documents ({{ eoiDocuments.length }})
                </button>
                <button
                  type="button"
                  (click)="selectedDocTab.set('mandatory')"
                  class="px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                  [ngClass]="selectedDocTab() === 'mandatory' ? 'bg-[#0B3558] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  <span>1. Mandatory Statutory Documents</span>
                  <span class="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">
                    {{ mandatoryAttachedCount() }}/{{ mandatoryDocs().length }}
                  </span>
                </button>
                <button
                  type="button"
                  (click)="selectedDocTab.set('annexure')"
                  class="px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                  [ngClass]="selectedDocTab() === 'annexure' ? 'bg-[#0B3558] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  <span>2. Scheme Annexures</span>
                  <span class="px-1.5 py-0.2 rounded text-[10px] bg-sky-100 text-sky-800 font-bold">
                    {{ annexureAttachedCount() }}/{{ annexureDocs().length }}
                  </span>
                </button>
                <button
                  type="button"
                  (click)="selectedDocTab.set('remaining')"
                  class="px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                  [ngClass]="selectedDocTab() === 'remaining' ? 'bg-[#0B3558] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  <span>3. Remaining Documents</span>
                  <span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-bold">
                    {{ remainingAttachedCount() }}/{{ remainingDocs().length }}
                  </span>
                </button>
              </div>

              <!-- Documents List -->
              <div class="space-y-2.5">
                @for (doc of filteredDocuments(); track doc.id) {
                  <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <input
                      #fileInput
                      type="file"
                      accept=".pdf,application/pdf"
                      class="hidden"
                      (change)="onFileSelected($event, doc)"
                    />
                    <div class="flex items-start gap-3">
                      <span
                        class="w-6 h-6 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5"
                        [ngClass]="{
                          'bg-rose-100 text-rose-700': doc.category === 'mandatory',
                          'bg-sky-100 text-sky-800': doc.category === 'annexure',
                          'bg-slate-200 text-slate-700': doc.category === 'remaining'
                        }"
                      >
                        {{ doc.id }}
                      </span>
                      <div>
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-semibold text-slate-900 text-xs sm:text-[13px]">{{ doc.name }}</span>
                          <span
                            class="px-1.5 py-0.2 rounded text-[10px] font-bold"
                            [ngClass]="{
                              'bg-rose-50 text-rose-700 border border-rose-200': doc.category === 'mandatory',
                              'bg-sky-50 text-sky-700 border border-sky-200': doc.category === 'annexure',
                              'bg-slate-100 text-slate-600 border border-slate-300': doc.category === 'remaining'
                            }"
                          >
                            {{ doc.category === 'mandatory' ? 'Mandatory' : (doc.category === 'annexure' ? 'Annexure' : 'Remaining') }}
                          </span>
                        </div>
                        <p class="text-[11px] text-slate-500 mt-0.5">{{ doc.description }}</p>

                        @if (doc.status === 'uploaded') {
                          <div class="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-mono">
                            <div class="w-4 h-4 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                              <svg class="w-3 h-3 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                              </svg>
                            </div>
                            <span class="text-slate-800 font-medium">{{ doc.fileName }}</span>
                            <span>({{ doc.fileSize }})</span>
                            <span class="text-slate-400">&bull; {{ doc.uploadedDate }}</span>
                          </div>
                        } @else {
                          <div class="mt-1 text-[11px] text-amber-700 font-medium">
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
                          class="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          (click)="removeDoc(doc)"
                          class="px-3 py-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          Remove
                        </button>
                      } @else {
                        <button
                          type="button"
                          (click)="fileInput.click()"
                          class="px-3.5 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5 text-rose-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                          </svg>
                          <span>Upload PDF</span>
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
                class="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                &larr; Back to OTR Profile
              </button>

              <button
                type="button"
                (click)="saveAndProceedToStep3()"
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
             STEP 3: COMPLETE PREVIEW (WITH DEDICATED EDIT BUTTONS FOR EVERY SECTION)
             ==================================================================== -->
        @if (currentStep() === 3) {
          <div class="space-y-6">
            
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between text-xs text-[#0B3558] shadow-2xs">
              <div class="flex items-center gap-2.5">
                <svg class="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-normal text-xs sm:text-[13px]">
                  <strong class="font-bold">Comprehensive Application Preview:</strong> Review all verified OTR institutional particulars and scheme proposal details below. Use the <strong>Edit</strong> buttons beside any section if you wish to adjust particulars before submission.
                </span>
              </div>
            </div>

            <!-- Preview Part A: OTR Institutional Profile -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3.5 shadow-xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">A</span>
                  <h3 class="text-sm font-bold text-[#0B3558]">TP/PIA One Time Registration (OTR) Particulars</h3>
                </div>
                <button
                  type="button"
                  (click)="editSection('otr-step1')"
                  class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit OTR Details</span>
                </button>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span class="text-slate-400 block text-[10.5px]">TP/PIA Short Name</span>
                  <span class="font-bold text-slate-800">{{ editableStep1.shortName || 'RSLDC-PARTNER' }}</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-slate-400 block text-[10.5px]">TP/PIA Full Name</span>
                  <span class="font-bold text-slate-800">{{ editableStep1.fullName || 'Rajasthan Skill & Livelihoods Development Council Partner Ltd.' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Nature of Entity</span>
                  <span class="font-semibold text-slate-800">{{ editableStep1.natureOfEntity || 'PUBLIC LIMITED' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">CIN / Registration No</span>
                  <span class="font-mono text-slate-800">{{ editableStep1.registrationNumber || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Company PAN</span>
                  <span class="font-mono font-bold text-slate-800">{{ editableStep1.companyPan || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">GSTIN</span>
                  <span class="font-mono text-slate-800">{{ editableStep1.gstin || 'N/A' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Bank Account</span>
                  <span class="text-slate-800">{{ editableStep4.bankName || '-' }} ({{ editableStep4.accountNo || '-' }})</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Authorized Person</span>
                  <span class="font-bold text-slate-800">{{ editableStep3.name || '-' }} ({{ editableStep3.designation || '-' }})</span>
                </div>
                <div class="sm:col-span-3">
                  <span class="text-slate-400 block text-[10.5px]">Registered Address</span>
                  <span class="text-slate-800">{{ editableStep1.registeredAddress || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Preview Part B: Designated Officer In-Charge -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3.5 shadow-xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">B</span>
                  <h3 class="text-sm font-bold text-[#0B3558]">Designated Officer In-Charge for MMKVY</h3>
                </div>
                <button
                  type="button"
                  (click)="editSection('oic-dropdown')"
                  class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Change Officer</span>
                </button>
              </div>

              @if (selectedOic(); as oic) {
                <div class="p-3.5 rounded-xl border border-sky-200 bg-sky-50/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span class="text-slate-400 block text-[10.5px]">Officer Name</span><span class="font-bold text-slate-900">{{ oic.name }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Designation</span><span class="font-semibold text-slate-800">{{ oic.designation }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Mobile No.</span><span class="font-mono text-slate-800">{{ oic.mobileNo }}</span></div>
                  <div><span class="text-slate-400 block text-[10.5px]">Email ID</span><span class="text-slate-800">{{ oic.emailId }}</span></div>
                </div>
              }
            </div>

            <!-- Preview Part C: Proposed Training Centres for Scheme -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3.5 shadow-xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">C</span>
                  <h3 class="text-sm font-bold text-[#0B3558]">Proposed Training Centres for Scheme ({{ selectedCentresForScheme().length }} Centres)</h3>
                </div>
                <button
                  type="button"
                  (click)="editSection('training-centres-section')"
                  class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit Centres</span>
                </button>
              </div>

              @if (selectedCentresForScheme().length === 0) {
                <div class="p-3.5 bg-amber-50 rounded-lg text-xs text-amber-800 font-medium">
                  No centres selected or proposed for this scheme yet.
                </div>
              } @else {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  @for (c of selectedCentresForScheme(); track c.id) {
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-800">{{ c.centerName }}</span>
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-bold"
                          [ngClass]="c.isExisting ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'"
                        >
                          {{ c.isExisting ? 'Existing' : 'New Proposed' }}
                        </span>
                      </div>
                      <span class="text-[11px] text-slate-600 block">{{ c.district }}</span>
                      <span class="text-[10.5px] text-emerald-700 block">
                        {{ c.classrooms }} Classrooms &bull; {{ c.practicalRooms }} Practical Labs &bull; Washrooms: {{ c.washrooms }}
                      </span>
                      <span class="text-[10px] text-slate-400 block truncate">{{ c.fullAddress }}</span>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Preview Part D: 3-Year Turnover Summary (Retrieved from OTR Registration) -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3.5 shadow-xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">D</span>
                  <h3 class="text-sm font-bold text-[#0B3558]">Financial Turnover Summary (From OTR Registration)</h3>
                </div>
                <button
                  type="button"
                  (click)="editSection('otr-step1')"
                  class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit in Step 1</span>
                </button>
              </div>

              @if (editableStep1.financialYears && editableStep1.financialYears.length > 0) {
                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-slate-50 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                        <th class="py-2 px-3 border-r border-slate-200">Financial Year</th>
                        <th class="py-2 px-3 border-r border-slate-200">Total Turnover (₹ Lacs)</th>
                        <th class="py-2 px-3">Skill Turnover (₹ Lacs)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (fy of editableStep1.financialYears; track fy.year) {
                        <tr>
                          <td class="py-2 px-3 text-slate-700 border-r border-slate-100">{{ fy.year }}</td>
                          <td class="py-2 px-3 text-slate-700 border-r border-slate-100">{{ fy.totalTurnover || '-' }}</td>
                          <td class="py-2 px-3 text-slate-700">{{ fy.skillTurnover || '-' }}</td>
                        </tr>
                      }
                      <tr class="bg-slate-50 font-semibold border-t border-slate-200">
                        <td class="py-2 px-3 text-slate-700 border-r border-slate-100">3-Year Average</td>
                        <td class="py-2 px-3 text-[#0483AC] font-bold border-r border-slate-100">{{ avgTotalTurnover() }} Lacs</td>
                        <td class="py-2 px-3 text-[#0483AC] font-bold">{{ avgSkillTurnover() }} Lacs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <!-- Preview Part E: Placement & Action Plan -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 class="text-xs font-bold text-[#0B3558] uppercase">Training &amp; Placement Track Record</h4>
                  <button
                    type="button"
                    (click)="editSection('placement-section')"
                    class="text-xs text-[#0483AC] hover:underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div class="space-y-1.5 text-xs">
                  @if (placementRecords.length === 0) {
                    <p class="text-xs text-slate-400 py-1">No placement records committed.</p>
                  } @else {
                    @for (p of placementRecords; track p.sector) {
                      <div class="flex justify-between py-1 border-b border-slate-100">
                        <span class="text-slate-700 font-medium">{{ p.sector }} ({{ p.year }}):</span>
                        <span class="text-emerald-700 font-semibold">{{ p.trained }} Trained / {{ p.placed }} Placed</span>
                      </div>
                    }
                  }
                </div>
              </div>

              <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 class="text-xs font-bold text-[#0B3558] uppercase">Proposed Annual Action Plan</h4>
                  <button
                    type="button"
                    (click)="editSection('action-plan-section')"
                    class="text-xs text-[#0483AC] hover:underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div class="space-y-1.5 text-xs">
                  @if (actionPlan.length === 0) {
                    <p class="text-xs text-slate-400 py-1">No action plans committed.</p>
                  } @else {
                    @for (ap of actionPlan; track ap.id) {
                      <div class="flex justify-between py-1 border-b border-slate-100">
                        <span class="text-slate-700 font-medium">{{ ap.district }} ({{ ap.year }}):</span>
                        <span class="text-slate-900 font-semibold">{{ ap.sdcCount }} SDCs, {{ ap.batches }} Batches ({{ ap.mode }})</span>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>

            <!-- Preview Part F: EOI Documents Checklist -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3.5 shadow-xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">F</span>
                  <h3 class="text-sm font-bold text-[#0B3558]">
                    EOI Proposal Documents Checklist ({{ attachedDocsCount() }} / {{ eoiDocuments.length }} Attached)
                  </h3>
                </div>
                <button
                  type="button"
                  (click)="editSection('documents-section')"
                  class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit Documents</span>
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                @for (d of eoiDocuments; track d.id) {
                  <div class="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between bg-slate-50/60">
                    <div class="flex items-center gap-2 max-w-[72%]">
                      <div class="w-4 h-4 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                        <svg class="w-3 h-3 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                        </svg>
                      </div>
                      <span class="font-medium text-slate-800 truncate">{{ d.name }}</span>
                    </div>
                    @if (d.status === 'uploaded') {
                      <span class="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        &check; Attached
                      </span>
                    } @else {
                      <span class="text-amber-700 font-semibold text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                        Pending
                      </span>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Declaration Checkbox -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
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
                class="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                &larr; Back to Proposal Form
              </button>

              <button
                type="button"
                [disabled]="!declarationAgreed()"
                (click)="openSubmitConfirm()"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Submit EOI Proposal &amp; Pay Fees</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 4: FEE PAYMENT
             ==================================================================== -->
        @if (currentStep() === 4) {
          <div class="space-y-6">
            
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-[#0B3558] tracking-tight">
                Fee Payment
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Mandatory EOI Application Fees &amp; Secure Payment Gateway
              </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              <div class="lg:col-span-2 space-y-6">
                <!-- Applicable EOI Application Fees -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div class="pb-2 border-b border-slate-100">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900">
                      1. Applicable EOI Application Fees (Compulsory)
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Both Processing Fee (₹2,000) and Earnest Money Deposit (₹50,000) are compulsory for proposal submission under MMKVY.
                    </p>
                  </div>

                  <div class="space-y-3">
                    <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          &check;
                        </div>
                        <div>
                          <h4 class="text-xs sm:text-sm font-bold text-slate-900">
                            1. Processing Fee <span class="text-rose-600">*</span>
                          </h4>
                          <p class="text-[11px] text-slate-500 mt-0.5">
                            Non-refundable administrative scrutiny fee under MMKVY guidelines.
                          </p>
                        </div>
                      </div>
                      <span class="text-sm sm:text-base font-bold text-slate-900">₹2,000</span>
                    </div>

                    <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          &check;
                        </div>
                        <div>
                          <h4 class="text-xs sm:text-sm font-bold text-slate-900">
                            2. Earnest Money Deposit (EMD) <span class="text-rose-600">*</span>
                          </h4>
                          <p class="text-[11px] text-slate-500 mt-0.5">
                            Refundable security deposit for Training Provider empanelment proposal under MMKVY.
                          </p>
                        </div>
                      </div>
                      <span class="text-sm sm:text-base font-bold text-slate-900">₹50,000</span>
                    </div>
                  </div>
                </div>

                <!-- Select Payment Mode -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div class="pb-2 border-b border-slate-100">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900">
                      2. Select Payment Mode
                    </h3>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                        <div class="text-xs font-bold text-slate-900">UPI</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</div>
                      </div>
                    </label>

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
                        <div class="text-xs font-bold text-slate-900">Net Banking</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">SBI, HDFC, ICICI, PNB, BoB &amp; 50+ Banks</div>
                      </div>
                    </label>

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
                        <div class="text-xs font-bold text-slate-900">Debit / Credit Card</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">RuPay, Visa, MasterCard</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Payment Summary Card -->
              <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden sticky top-20">
                <div class="bg-[#0B3558] text-white p-4 flex items-center justify-between">
                  <h4 class="text-xs font-bold uppercase tracking-wider">Payment Summary</h4>
                  <span class="text-[10px] font-semibold px-2 py-0.5 bg-white/10 rounded">MMKVY</span>
                </div>

                <div class="p-5 space-y-4 text-xs">
                  <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                    <span>Processing Fee</span>
                    <span class="font-bold text-slate-900">₹2,000</span>
                  </div>
                  <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                    <span>EMD Fee</span>
                    <span class="font-bold text-slate-900">₹50,000</span>
                  </div>

                  <div class="flex justify-between items-baseline pt-1">
                    <span class="text-sm font-bold text-slate-900">Total Payable</span>
                    <span class="text-xl font-bold text-[#0B3558]">₹52,000</span>
                  </div>

                  <div class="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500">
                    Selected Method: <strong class="text-slate-800 font-semibold">{{ paymentMethod() }}</strong>
                  </div>

                  <button
                    type="button"
                    [disabled]="isPaymentProcessing()"
                    (click)="triggerPayment()"
                    class="w-full py-3 px-4 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
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
            <div class="bg-emerald-700 text-white rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
              <div class="flex items-center gap-4 text-center sm:text-left">
                <div class="w-11 h-11 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl text-white shrink-0 mx-auto">
                  &check;
                </div>
                <div>
                  <span class="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10.5px] font-medium uppercase tracking-wider">
                    Application Successfully Submitted &amp; Verified
                  </span>
                  <h2 class="text-lg sm:text-xl font-bold mt-1">
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
                  class="px-4 py-2 bg-white text-[#0B3558] hover:bg-slate-50 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  View in Tender Status &rarr;
                </button>
              </div>
            </div>

            <!-- Application Summary Card -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4 text-xs">
              <h3 class="text-sm font-bold text-[#0B3558] pb-2 border-b border-slate-100">
                Submission Summary &amp; Digital Receipts
              </h3>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Application Ref No</span>
                  <span class="font-mono font-bold text-slate-800 text-sm">ISMS-EOI-2026-9871</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Fee Payment Status</span>
                  <span class="font-bold text-emerald-700">₹52,000 Paid (TXN-ISMS-345678)</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Centres Deployed</span>
                  <span class="font-bold text-slate-800">{{ selectedCentresForScheme().length }} Centres</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Attached Documents</span>
                  <span class="font-bold text-slate-800">{{ attachedDocsCount() }} / {{ eoiDocuments.length }} Documents</span>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    (click)="downloadReceipt('acknowledgment')"
                    class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Download Official Acknowledgment Receipt</span>
                  </button>
                  <button
                    type="button"
                    (click)="downloadReceipt('payment')"
                    class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Download Payment Receipt</span>
                  </button>
                </div>

                <button
                  type="button"
                  (click)="printReceipt()"
                  class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        }

      </main>

      <!-- ====================================================================
           CONFIRMATION MODAL BEFORE PAYMENT
           ==================================================================== -->
      @if (showSubmitConfirmModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div class="relative max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-6 space-y-4">
            <div class="w-12 h-12 mx-auto rounded-full bg-blue-100 text-[#0B3558] flex items-center justify-center font-bold text-xl">
              ?
            </div>
            <div class="space-y-1">
              <h3 class="text-base font-bold text-slate-900">Confirm EOI Proposal Submission</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                You have verified your institutional profile, selected <strong>{{ selectedCentresForScheme().length }} training centres</strong>, and attached <strong>{{ attachedDocsCount() }} documents</strong>. Proceed to fee payment of <strong>₹52,000</strong>?
              </p>
            </div>
            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="showSubmitConfirmModal.set(false)"
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel &amp; Review
              </button>
              <button
                type="button"
                (click)="confirmSubmitAndProceedToPayment()"
                class="px-5 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                Yes, Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ====================================================================
           PAYMENT SUCCESS POPUP MODAL
           ==================================================================== -->
      @if (showPaymentSuccessModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden text-center font-sans">
            <div class="bg-[#15803d] text-white py-6 px-6 space-y-2">
              <div class="w-12 h-12 mx-auto rounded-full bg-white text-[#15803d] flex items-center justify-center shadow-md mb-2 font-bold text-xl">
                &check;
              </div>
              <h3 class="text-lg font-bold tracking-tight">Payment Successful</h3>
              <p class="text-xs text-emerald-100 font-normal">
                Payment of ₹52,000 completed successfully via {{ paymentMethod() }}
              </p>
            </div>

            <div class="p-5 space-y-4 text-xs text-left font-sans">
              <div class="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Transaction ID:</span>
                  <span class="font-mono font-bold text-slate-800 text-xs">TXN-ISMS-2026-345678</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Amount Paid:</span>
                  <span class="text-sm font-bold text-slate-900">₹52,000</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Scheme Code:</span>
                  <span class="text-slate-800 font-semibold">{{ schemeCode() }}</span>
                </div>
              </div>

              <button
                type="button"
                (click)="continueFromPaymentSuccess()"
                class="w-full py-2.5 px-4 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Submission Receipt &rarr;</span>
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
  private location = inject(Location);

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

  goBack(): void {
    this.location.back();
  }
  selectedOicId = signal<string>('');

  readonly selectedOic = computed(() => {
    const id = this.selectedOicId();
    if (!id && this.editableStep2?.length > 0) return this.editableStep2[0];
    return this.editableStep2?.find(o => o.id === id) || (this.editableStep2?.[0] ?? null);
  });

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

  // Training Centres Management
  showAddExistingForm = signal<boolean>(false);
  showNewCentreForm = signal<boolean>(false);

  /** Pre-existing verified training centres */
  existingCentres: TrainingCenterItem[] = [
    {
      id: 'tc-exist-1',
      district: 'Jaipur',
      centerName: 'Jaipur Skill Development Centre',
      telephone: '0141-2700891',
      classrooms: 3,
      practicalRooms: 2,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: 'Plot No. 42, Institutional Area, Jhalana Doongri, Jaipur - 302004',
      isExisting: true
    },
    {
      id: 'tc-exist-2',
      district: 'Alwar',
      centerName: 'Alwar Vocational Training Hub',
      telephone: '0144-2891234',
      classrooms: 2,
      practicalRooms: 1,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: 'Plot 18, MIA Industrial Area, Alwar, Rajasthan - 301030',
      isExisting: true
    },
    {
      id: 'tc-exist-3',
      district: 'Jodhpur',
      centerName: 'Jodhpur Technical Skill Centre',
      telephone: '0291-2654321',
      classrooms: 2,
      practicalRooms: 2,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: 'Phase II, Mandore Industrial Area, Jodhpur, Rajasthan - 342007',
      isExisting: true
    }
  ];

  /** IDs of existing centres that are selected for MMKVY */
  selectedExistingCentreIds = signal<string[]>(['tc-exist-1']);

  /** New training centres proposed specifically for MMKVY */
  newProposedCentres: TrainingCenterItem[] = [];

  /** Form model for adding an existing centre */
  newExistingCentre: Partial<TrainingCenterItem> = {
    district: '',
    centerName: '',
    classrooms: 2,
    practicalRooms: 1,
    washrooms: 'Yes',
    labInfra: 'Available',
    fullAddress: ''
  };

  /** Form model for proposing a new centre */
  newCentre: Partial<TrainingCenterItem> = {
    district: '',
    centerName: '',
    classrooms: 2,
    practicalRooms: 2,
    washrooms: 'Yes',
    labInfra: 'Available',
    fullAddress: ''
  };

  /** Total centres deployed for MMKVY (Selected existing + New proposed) */
  readonly selectedCentresForScheme = computed<TrainingCenterItem[]>(() => {
    const selectedExisting = this.existingCentres.filter(c => this.selectedExistingCentreIds().includes(c.id));
    return [...selectedExisting, ...this.newProposedCentres];
  });

  isCentreSelectedForScheme(id: string): boolean {
    return this.selectedExistingCentreIds().includes(id);
  }

  toggleCentreForScheme(id: string): void {
    const current = this.selectedExistingCentreIds();
    if (current.includes(id)) {
      this.selectedExistingCentreIds.set(current.filter(item => item !== id));
    } else {
      this.selectedExistingCentreIds.set([...current, id]);
    }
  }

  saveNewExistingCentre(): void {
    if (!this.newExistingCentre.district || !this.newExistingCentre.centerName) {
      alert('Please enter District and Centre Name');
      return;
    }
    const id = `tc-exist-${Date.now()}`;
    const item: TrainingCenterItem = {
      id,
      district: this.newExistingCentre.district,
      centerName: this.newExistingCentre.centerName,
      telephone: '0',
      classrooms: Number(this.newExistingCentre.classrooms) || 2,
      practicalRooms: Number(this.newExistingCentre.practicalRooms) || 1,
      washrooms: this.newExistingCentre.washrooms || 'Yes',
      labInfra: this.newExistingCentre.labInfra || 'Available',
      fullAddress: this.newExistingCentre.fullAddress || this.newExistingCentre.district,
      isExisting: true
    };
    this.existingCentres.push(item);
    // Auto-select for scheme
    this.selectedExistingCentreIds.set([...this.selectedExistingCentreIds(), id]);
    this.showAddExistingForm.set(false);
    this.newExistingCentre = {
      district: '',
      centerName: '',
      classrooms: 2,
      practicalRooms: 1,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: ''
    };
  }

  saveNewCentre(): void {
    if (!this.newCentre.district || !this.newCentre.centerName) {
      alert('Please enter District and Centre Name for the proposed centre');
      return;
    }

    const item: TrainingCenterItem = {
      id: `tc-prop-${Date.now()}`,
      district: this.newCentre.district,
      centerName: this.newCentre.centerName,
      telephone: '0',
      classrooms: Number(this.newCentre.classrooms) || 2,
      practicalRooms: Number(this.newCentre.practicalRooms) || 2,
      washrooms: this.newCentre.washrooms || 'Yes',
      labInfra: this.newCentre.labInfra || 'Available',
      fullAddress: this.newCentre.fullAddress || this.newCentre.district,
      isExisting: false
    };

    this.newProposedCentres.push(item);
    this.showNewCentreForm.set(false);
    this.newCentre = {
      district: '',
      centerName: '',
      classrooms: 2,
      practicalRooms: 2,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: ''
    };
  }

  removeCentre(index: number): void {
    this.newProposedCentres.splice(index, 1);
  }

  // Training & Placement
  newPlacement = {
    sector: '',
    year: '2023 - 2024',
    trained: null as number | null,
    placed: null as number | null,
    proofDoc: ''
  };
  placementRecords: TrainingPlacementRecord[] = [];

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
    this.newPlacement = {
      sector: '',
      year: '2023 - 2024',
      trained: null,
      placed: null,
      proofDoc: ''
    };
  }

  removePlacement(index: number): void {
    this.placementRecords.splice(index, 1);
  }

  // Annual Action Plan
  newActionPlan = {
    year: '2025-2026',
    district: '',
    sdcCount: 2 as number | null,
    location: '',
    sectors: '',
    courses: '',
    mode: 'Both' as 'Residential' | 'Non-Residential' | 'Both',
    batches: 10 as number | null
  };
  actionPlan: ActionPlanDistrict[] = [];

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
      mode: this.newActionPlan.mode || 'Both',
      batches: Number(this.newActionPlan.batches) || 1
    };
    this.actionPlan.push(item);
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
  }

  removeActionPlan(index: number): void {
    this.actionPlan.splice(index, 1);
  }

  // Documents Tab Filter
  selectedDocTab = signal<'all' | 'mandatory' | 'annexure' | 'remaining'>('all');

  /** 16 Proposal Documents categorized into Mandatory, Annexures, and Remaining */
  eoiDocuments: EoiDocumentItem[] = [
    // 1. Mandatory Statutory Documents
    {
      id: 2,
      name: 'Annexure-1: Covering Letter as per Annexure-1',
      description: 'Official proposal submission covering letter on letterhead',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 3,
      name: 'Annexure-3: Audited Financial Statements for last 3 consecutive financial years',
      description: 'CA certified balance sheet and P&L accounts',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 5,
      name: 'Annexure-6: An affidavit for not being blacklisted',
      description: 'Non-judicial notary stamped anti-blacklisting undertaking',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 6,
      name: 'Annexure-7: Self-certificate / declaration as per Annexure-7',
      description: 'Statutory compliance self-declaration',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 7,
      name: 'Copy of EOI Document with sign and seal on each page',
      description: 'Complete downloaded RFP document signed on all pages',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 16,
      name: 'Not Blacklisted Proof / Anti-Blacklisting Notarized Affidavit',
      description: 'Affidavit affirming entity is not debarred by any Govt agency',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },

    // 2. Official Scheme Annexures
    {
      id: 4,
      name: 'Annexure-5: Training and Placement details as per Annexure-5',
      description: 'Detailed candidate-level wage placement track record',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 8,
      name: 'Details of Active skill development centre as per Annexure-4',
      description: 'Geotagged infrastructure layout and classroom proofs',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 9,
      name: 'Details of Board of directors as per Annexure-8',
      description: 'Board member listing, DIN, and KYC profiles',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 10,
      name: 'Details of Placement partnership/Tie-ups with Industry as per Annexure-9',
      description: 'Active corporate MOUs and employer placement commitments',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 11,
      name: 'Details of working experience in relevant sector as per Annexure-10',
      description: 'Sector specific past training delivery completion certificates',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 12,
      name: 'List of divisions and group of district as per annexure 11',
      description: 'District cluster prioritization and outreach methodology',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 13,
      name: 'Proposed evaluation matrix annexure 12',
      description: 'Technical scoring and qualification criteria response',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 14,
      name: 'Supporting documents as per annexure 13',
      description: 'Additional credentials, awards, and accreditations',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },

    // 3. Remaining Documents
    {
      id: 1,
      name: 'A certificate of NSDC partner, where NSDC has stake',
      description: 'NSDC equity or loan participation certificate',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: false,
      status: 'pending',
      category: 'remaining'
    },
    {
      id: 15,
      name: 'Turnover Proof Document / CA Turnover Certificate with UDIN',
      description: 'CA certified balance sheet and turnover certificate with UDIN',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'remaining'
    }
  ];

  readonly mandatoryDocs = computed(() => this.eoiDocuments.filter(d => d.category === 'mandatory'));
  readonly annexureDocs = computed(() => this.eoiDocuments.filter(d => d.category === 'annexure'));
  readonly remainingDocs = computed(() => this.eoiDocuments.filter(d => d.category === 'remaining'));

  readonly mandatoryAttachedCount = computed(() => this.mandatoryDocs().filter(d => d.status === 'uploaded').length);
  readonly annexureAttachedCount = computed(() => this.annexureDocs().filter(d => d.status === 'uploaded').length);
  readonly remainingAttachedCount = computed(() => this.remainingDocs().filter(d => d.status === 'uploaded').length);

  readonly filteredDocuments = computed(() => {
    const tab = this.selectedDocTab();
    if (tab === 'all') return this.eoiDocuments;
    return this.eoiDocuments.filter(d => d.category === tab);
  });

  readonly attachedDocsCount = computed(() => this.eoiDocuments.filter(d => d.status === 'uploaded').length);

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

    if (!this.selectedOicId() && this.editableStep2?.length > 0) {
      this.selectedOicId.set(this.editableStep2[0].id);
    }
  }

  saveAndProceedToStep2(): void {
    this.otrFormService.updateStep1(this.editableStep1);
    this.otrFormService.updateStep2(this.editableStep2);
    this.otrFormService.updateStep3(this.editableStep3);
    this.otrFormService.updateStep4(this.editableStep4);
    this.goToStep(2);
  }

  saveAndProceedToStep3(): void {
    this.goToStep(3);
  }

  goToStep(step: number): void {
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Edit facility from Step 3: navigates directly to the target step and section */
  editSection(target: 'otr-step1' | 'oic-dropdown' | 'training-centres-section' | 'placement-section' | 'action-plan-section' | 'documents-section'): void {
    if (target === 'otr-step1') {
      this.isEditingOtr.set(true);
      this.goToStep(1);
    } else if (target === 'oic-dropdown') {
      this.goToStep(1);
    } else {
      this.goToStep(2);
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
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

  attachAllSampleDocs(): void {
    this.eoiDocuments.forEach((doc, idx) => {
      doc.status = 'uploaded';
      doc.fileName = `Scan_Annexure_${doc.id}_Signed.pdf`;
      doc.fileSize = `${(1.2 + (idx % 3) * 0.8).toFixed(1)} MB`;
      doc.uploadedDate = '24-Sep-2026';
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
Submission Timestamp         : 24-Sep-2026 13:30:00 IST
Applicant Agency Name        : ${this.editableStep1.fullName || 'Rajasthan Skill & Livelihoods Development Council Partner Ltd.'}
Registration / CIN           : ${this.editableStep1.registrationNumber || 'U80302RJ2022NPL079811'}
Scheme Code & Name           : MMKVY (Mukhya Mantri Kaushalya Vikas Yojana)
Category                     : ALL
Designated Officer In-Charge : ${this.selectedOic()?.name || '-'} (${this.selectedOic()?.designation || '-'})
Fee Payment Reference        : TXN-ISMS-2026-345678 (₹52,000 Paid)
Proposed SDC Training Centres: ${this.selectedCentresForScheme().length} Centres Deployed
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
Transaction Timestamp        : 24-Sep-2026 13:28:42 IST
Applicant Name               : ${this.editableStep1.fullName || 'Rajasthan Skill & Livelihoods Development Council Partner Ltd.'}
PAN Number                   : ${this.editableStep1.companyPan || 'AAACR1234F'}
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
}
