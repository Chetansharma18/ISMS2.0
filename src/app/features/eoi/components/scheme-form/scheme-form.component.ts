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
        <div class="w-full max-w-355 mx-auto px-3 sm:px-6 lg:px-8 py-3">
          
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
      <main class="w-full max-w-355 mx-auto px-3 sm:px-6 lg:px-8 pt-5 space-y-6 font-sans">
        
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
             STEP 1: COMPANY PROFILE INFORMATION (Complete, 1 Page, No Icons)
             ==================================================================== -->
        @if (currentStep() === 1) {
          <div class="space-y-5 font-sans">

            <!-- Section Title Strip (Text Only - No Icons) -->
            <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 class="text-base sm:text-lg font-bold text-[#0B3558] tracking-tight m-0">Company Profile Information</h3>
                <p class="text-xs text-slate-500 mt-1 m-0">
                  Complete verified registration, statutory particulars, and banking details retrieved from your company profile.
                </p>
              </div>
              <span class="text-xs font-semibold text-[#0B3558] bg-[#EAF2F6] px-3 py-1 rounded border border-[#D9E1E7]">
                Step 1 of 5
              </span>
            </div>

            <!-- 1. Company Particulars & Registration Details -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide m-0">
                  1. Company Particulars &amp; Registration Details
                </h4>
                <span class="text-xs text-slate-500 font-mono font-semibold">CIN: {{ editableStep1.registrationNumber || '-' }}</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Name (Short Name)</span>
                  <span class="font-bold text-slate-800 text-xs sm:text-[13px] block mt-0.5">{{ editableStep1.shortName || '-' }}</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Full Name of Organization</span>
                  <span class="font-bold text-slate-800 text-xs sm:text-[13px] block mt-0.5">{{ editableStep1.fullName || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Nature of Entity</span>
                  <span class="font-semibold text-slate-800 text-xs sm:text-[13px] block mt-0.5">{{ editableStep1.natureOfEntity || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Registration Number (CIN)</span>
                  <span class="font-mono font-semibold text-slate-800 block mt-0.5">{{ editableStep1.registrationNumber || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Date of Registration</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep1.dateOfRegistration || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">State / UT of Registration</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep1.stateOfLegalReg || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Company PAN</span>
                  <span class="font-mono font-bold text-slate-800 block mt-0.5">{{ editableStep1.companyPan || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">GST Registered</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep1.gstRegistered }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">GSTIN</span>
                  <span class="font-mono font-semibold text-slate-800 block mt-0.5">{{ editableStep1.gstRegistered === 'Yes' ? (editableStep1.gstin || '-') : 'Not Applicable' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">MSME / Udyam Registered</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep1.msmeRegistered }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Udyam Registration No.</span>
                  <span class="font-mono font-semibold text-slate-800 block mt-0.5">{{ editableStep1.msmeRegistered === 'Yes' ? (editableStep1.udyamNumber || '-') : 'Not Applicable' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">NSDC Partner Status</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep1.nsdcPartner || 'Not Applicable' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Blacklisted Status</span>
                  <span class="font-semibold block mt-0.5" [class.text-rose-600]="editableStep1.blackListed === 'Yes'" [class.text-slate-800]="editableStep1.blackListed !== 'Yes'">
                    {{ editableStep1.blackListed || 'No' }}
                  </span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Company Contact No.</span>
                  <span class="font-mono font-semibold text-slate-800 block mt-0.5">{{ editableStep1.contactNo || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Company Email-ID</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep1.emailId || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Website</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep1.website || '-' }}</span>
                </div>
                <div class="sm:col-span-2 lg:col-span-2">
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Registered Address</span>
                  <span class="font-semibold text-slate-800 block mt-0.5 leading-relaxed">{{ registeredAddressText }}</span>
                </div>
                <div class="sm:col-span-2 lg:col-span-2">
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Office Address</span>
                  <span class="font-semibold text-slate-800 block mt-0.5 leading-relaxed">{{ officeAddressText }}</span>
                </div>
              </div>


              <!-- Attached Statutory Documents (Text only, no icons) -->
              <div class="pt-3 border-t border-slate-100">
                <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">Attached Registration Documents</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Certificate of Incorporation</span>
                      <span class="font-medium text-slate-800 block truncate">{{ editableStep1.registrationCertDoc?.fileName || 'Certificate_of_Incorporation.pdf' }}</span>
                    </div>
                    <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Attached</span>
                  </div>
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Organization PAN Card</span>
                      <span class="font-medium text-slate-800 block truncate">{{ editableStep1.panCardDoc?.fileName || 'Company_PAN_Card.pdf' }}</span>
                    </div>
                    <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Attached</span>
                  </div>
                  @if (editableStep1.gstRegistered === 'Yes') {
                    <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">GST Certificate</span>
                        <span class="font-medium text-slate-800 block truncate">{{ editableStep1.gstCertDoc?.fileName || 'GST_Certificate.pdf' }}</span>
                      </div>
                      <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Attached</span>
                    </div>
                  }
                  @if (editableStep1.msmeRegistered === 'Yes') {
                    <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">Udyam Certificate</span>
                        <span class="font-medium text-slate-800 block truncate">{{ editableStep1.msmeCertDoc?.fileName || 'Udyam_Certificate.pdf' }}</span>
                      </div>
                      <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Attached</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- 2. Authorized Signatory / Person Details -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide m-0">
                  2. Authorized Signatory / Person Details
                </h4>
                <span class="text-xs text-slate-500 font-semibold">Designated Signatory</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Full Name</span>
                  <span class="font-bold text-slate-800 text-xs sm:text-[13px] block mt-0.5">{{ editableStep3.name || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Designation</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep3.designation || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Date of Birth / Age</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep3.dob || '-' }} @if(editableStep3.age){ ({{ editableStep3.age }} yrs) }</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Official Mobile No.</span>
                  <span class="font-mono font-semibold text-slate-800 block mt-0.5">{{ editableStep3.mobileNo || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Official Email-ID</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep3.emailId || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">PAN</span>
                  <span class="font-mono font-bold text-slate-800 block mt-0.5">{{ editableStep3.pan || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Aadhaar Number</span>
                  <span class="font-mono font-semibold text-slate-800 block mt-0.5">{{ editableStep3.aadhaarNo || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">State</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep3.state || '-' }}</span>
                </div>
                <div class="sm:col-span-4">
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Residence Address</span>
                  <span class="font-semibold text-slate-800 block mt-0.5 leading-relaxed">{{ residenceAddressText }}</span>
                </div>
              </div>

              <!-- Attached Signatory Documents (Text only, no icons) -->
              <div class="pt-3 border-t border-slate-100">
                <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">Attached Signatory Documents</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Authorization Letter / Board Resolution</span>
                      <span class="font-medium text-slate-800 block truncate">{{ editableStep3.authorizationLetterDoc?.fileName || 'Board_Resolution_Auth.pdf' }}</span>
                    </div>
                    <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Attached</span>
                  </div>
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Identity Proof</span>
                      <span class="font-medium text-slate-800 block truncate">{{ editableStep3.idProofDoc?.fileName || 'Signatory_Identity_Proof.pdf' }}</span>
                    </div>
                    <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Attached</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Officer(s) In-Charge Details -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide m-0">
                  3. Details of Officer(s) In-Charge
                </h4>
                <span class="text-xs text-slate-500 font-semibold">{{ editableStep2.length }} Registered Officer(s)</span>
              </div>

              <div class="space-y-3">
                @for (oic of editableStep2; track oic.id; let idx = $index) {
                  <div class="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3 text-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200/70">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-800 text-xs sm:text-[13px]">{{ idx + 1 }}. {{ oic.name }}</span>
                        <span class="text-slate-500 text-xs">({{ oic.designation || 'Officer In-Charge' }})</span>
                      </div>
                      <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {{ oic.appointmentLetterDoc?.fileName || 'Appointment_Letter.pdf' }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Mobile Number</span>
                        <span class="font-mono font-semibold text-slate-800 block mt-0.5">{{ oic.mobileNo || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Email Address</span>
                        <span class="font-semibold text-slate-800 block mt-0.5">{{ oic.emailId || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px] uppercase font-medium">PAN</span>
                        <span class="font-mono font-bold text-slate-800 block mt-0.5">{{ oic.pan || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Aadhaar Number</span>
                        <span class="font-mono font-semibold text-slate-800 block mt-0.5">{{ oic.aadhaarNo || '-' }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- 4. Bank Account Details -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide m-0">
                  4. Bank Account Details
                </h4>
                <span class="text-xs text-slate-500 font-mono font-semibold">IFSC: {{ editableStep4.ifscCode || '-' }}</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Bank Name</span>
                  <span class="font-bold text-slate-800 text-xs sm:text-[13px] block mt-0.5">{{ editableStep4.bankName || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Branch Name</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep4.branchName || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Account Type</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep4.accountType || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Account Holder Name</span>
                  <span class="font-bold text-slate-800 text-xs sm:text-[13px] block mt-0.5">{{ editableStep4.accountHolderName || editableStep1.fullName || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Account Number</span>
                  <span class="font-mono font-bold text-slate-800 block mt-0.5">{{ editableStep4.accountNo || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">IFSC Code</span>
                  <span class="font-mono font-bold text-slate-800 block mt-0.5">{{ editableStep4.ifscCode || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Transfer Mode</span>
                  <span class="font-semibold text-slate-800 block mt-0.5">{{ editableStep4.transferMode || 'NEFT / RTGS' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px] uppercase font-medium">Cancelled Cheque / Passbook</span>
                  <span class="font-semibold text-emerald-700 block mt-0.5 truncate">{{ editableStep4.cancelledChequeDoc?.fileName || 'Cancelled_Cheque_Passbook.pdf' }}</span>
                </div>
              </div>
            </div>

            <!-- Footer Action: Proceed to Proposal Form (Text Only, No Icons) -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                (click)="saveAndProceedToStep2()"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Proceed to Proposal Form
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 2: EOI PROPOSAL FORM
             ==================================================================== -->
        <!-- ====================================================================
             STEP 2: EOI PROPOSAL FORM
             ==================================================================== -->
        @if (currentStep() === 2) {
          <div class="space-y-5">
            
            <!-- Notice -->
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start sm:items-center gap-3 text-xs text-amber-900 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1 sm:mt-0"></span>
              <span>
                <strong>Proposal Form Parameters:</strong> Review and select training centres, past placement track records, annual action plan, and attach mandatory statutory annexures.
              </span>
            </div>

            <!-- ================================================================
                 1. TRAINING CENTRES SECTION (Existing Infrastructure & Proposal Centres)
                 ================================================================ -->
            <div id="training-centres-section" class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div class="pb-2.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">1</span>
                    Training Centres (Existing Infrastructure &amp; Proposal Centres)
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Select existing verified centres to deploy for this scheme, or optionally propose new centres for MMKVY.
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded bg-sky-50 text-[#0B3558] text-xs font-bold border border-sky-200">
                    {{ selectedCentresForScheme().length }} Centre(s) Deployed
                  </span>
                  <button
                    type="button"
                    (click)="showAddExistingForm.set(!showAddExistingForm())"
                    class="px-3 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{{ showAddExistingForm() ? '✕ Close Form' : '+ Add Training Centre' }}</span>
                  </button>
                </div>
              </div>

              <!-- Inline Form to Add / Register Centre -->
              @if (showAddExistingForm()) {
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="text-xs font-bold text-[#0B3558]">
                      Enter Training Centre Details
                    </span>
                    <button
                      type="button"
                      (click)="showAddExistingForm.set(false)"
                      class="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      ✕ Close
                    </button>
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
                        placeholder="e.g. Jaipur Skill Centre"
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
                      (click)="showAddExistingForm.set(false)"
                      class="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      (click)="saveNewExistingCentre()"
                      class="px-4 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Save &amp; Add Centre
                    </button>
                  </div>
                </div>
              }

              <!-- Unified Centres Listing Table -->
              <div class="overflow-x-auto border border-slate-200 rounded-xl">
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th class="py-2.5 px-3 text-center w-28">Deploy for Scheme</th>
                      <th class="py-2.5 px-3">District</th>
                      <th class="py-2.5 px-3">Centre Name</th>
                      <th class="py-2.5 px-2 text-center">Classrooms</th>
                      <th class="py-2.5 px-2 text-center">Labs</th>
                      <th class="py-2.5 px-2 text-center">Washrooms</th>
                      <th class="py-2.5 px-2 text-center">Lab Infra</th>
                      <th class="py-2.5 px-3">Full Address</th>
                      <th class="py-2.5 px-2 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
                    @for (c of allCentres(); track c.id) {
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
                        <td class="py-2.5 px-2 text-center">
                          <span
                            class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            [ngClass]="c.isExisting ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'"
                          >
                            {{ c.isExisting ? 'Existing' : 'Proposed' }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ================================================================
                 2. PAST 3 FINANCIAL YEARS TURNOVER (FINANCIAL ELIGIBILITY)
                 ================================================================ -->
            <div id="financial-turnover-section" class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div class="pb-2.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">2</span>
                    Past 3 Financial Years Turnover (Financial Eligibility Criteria)
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Enter audited annual turnover figures in ₹ Lacs. Certified as per CA Turnover Certificate (Annexure 3 &amp; 14).
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    &check; Min Eligible Threshold: ₹50.00 Lacs
                  </span>
                </div>
              </div>

              <!-- Editable Turnover Table -->
              <div class="overflow-x-auto border border-slate-200 rounded-xl">
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th class="py-2.5 px-3 w-44">Financial Year</th>
                      <th class="py-2.5 px-3">Total Entity Turnover (₹ in Lacs) *</th>
                      <th class="py-2.5 px-3">Skill Training Turnover (₹ in Lacs) *</th>
                      <th class="py-2.5 px-3 text-center w-36">Scrutiny Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-normal">
                    @for (fy of editableStep1.financialYears; track fy.year) {
                      <tr class="hover:bg-slate-50/70">
                        <td class="py-2.5 px-3 font-semibold text-slate-800 font-mono text-xs">
                          {{ fy.year }}
                        </td>
                        <td class="py-2.5 px-3">
                          <div class="relative max-w-xs">
                            <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs pointer-events-none">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              [(ngModel)]="fy.totalTurnover"
                              (input)="onTurnoverChange()"
                              placeholder="0.00"
                              class="w-full pl-6 pr-12 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white focus:ring-1 focus:ring-[#0B3558]"
                            />
                            <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 text-[11px] pointer-events-none">Lacs</span>
                          </div>
                        </td>
                        <td class="py-2.5 px-3">
                          <div class="relative max-w-xs">
                            <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs pointer-events-none">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              [(ngModel)]="fy.skillTurnover"
                              (input)="onTurnoverChange()"
                              placeholder="0.00"
                              class="w-full pl-6 pr-12 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white focus:ring-1 focus:ring-[#0B3558]"
                            />
                            <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 text-[11px] pointer-events-none">Lacs</span>
                          </div>
                        </td>
                        <td class="py-2.5 px-3 text-center">
                          <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Valid Entry
                          </span>
                        </td>
                      </tr>
                    }
                    <!-- 3-Year Average Row -->
                    <tr class="bg-sky-50/50 font-bold border-t border-slate-200 text-slate-900">
                      <td class="py-3 px-3 uppercase text-[11px] tracking-wider text-[#0B3558]">
                        3-Year Average
                      </td>
                      <td class="py-3 px-3 text-sm text-[#0B3558]">
                        ₹ {{ avgTotalTurnover() }} Lacs
                      </td>
                      <td class="py-3 px-3 text-sm text-emerald-800">
                        ₹ {{ avgSkillTurnover() }} Lacs
                      </td>
                      <td class="py-3 px-3 text-center">
                        <span class="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-900">
                          &check; Meets Criteria
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ================================================================
                 3. PAST SKILL TRAINING & PLACEMENT TRACK RECORD
                 ================================================================ -->
            <div id="placement-section" class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div class="pb-2.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">3</span>
                    Training &amp; Placement Track Record
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Sector-wise candidate training and verified wage placement performance.
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    {{ placementRecords.length }} Records Added
                  </span>
                  <button
                    type="button"
                    (click)="showAddPlacementForm.set(!showAddPlacementForm())"
                    class="px-3 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{{ showAddPlacementForm() ? '✕ Close Form' : '+ Add Placement Record' }}</span>
                  </button>
                </div>
              </div>

              <!-- Inline Entry Form -->
              @if (showAddPlacementForm()) {
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="font-bold text-[#0B3558]">New Placement Record Entry</span>
                    <button
                      type="button"
                      (click)="showAddPlacementForm.set(false)"
                      class="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div class="lg:col-span-2">
                      <label class="block text-slate-600 mb-1 font-medium">Sector Name *</label>
                      <input
                        type="text"
                        [(ngModel)]="newPlacement.sector"
                        placeholder="e.g. Healthcare / IT-ITeS / Apparel"
                        class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                      />
                    </div>
                    <div>
                      <label class="block text-slate-600 mb-1 font-medium">Financial Year</label>
                      <select
                        [(ngModel)]="newPlacement.year"
                        class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                      >
                        <option value="2024 - 2025">2024 - 2025</option>
                        <option value="2023 - 2024">2023 - 2024</option>
                        <option value="2022 - 2023">2022 - 2023</option>
                        <option value="2021 - 2022">2021 - 2022</option>
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
                    <div class="flex-1 min-w-55">
                      <input
                        type="text"
                        [(ngModel)]="newPlacement.proofDoc"
                        placeholder="Proof Document: e.g. Healthcare_Placement_Report_Certified.pdf"
                        class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                      />
                    </div>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        (click)="showAddPlacementForm.set(false)"
                        class="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        (click)="saveNewPlacement()"
                        class="px-4 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
                      >
                        Save Placement Record
                      </button>
                    </div>
                  </div>
                </div>
              }

              <!-- Table -->
              <div class="overflow-x-auto border border-slate-200 rounded-xl">
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th class="py-2.5 px-3">Sector</th>
                      <th class="py-2.5 px-2">FY</th>
                      <th class="py-2.5 px-2 text-center">Trained</th>
                      <th class="py-2.5 px-2 text-center">Placed</th>
                      <th class="py-2.5 px-2 text-center">Placement Rate</th>
                      <th class="py-2.5 px-2 text-right">Proof Document</th>
                      <th class="py-2.5 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-normal">
                    @for (p of placementRecords; track p.sector; let idx = $index) {
                      <tr class="hover:bg-slate-50/70">
                        <td class="py-2.5 px-3 font-semibold text-slate-800">{{ p.sector }}</td>
                        <td class="py-2.5 px-2 text-slate-600 font-mono text-[11px]">{{ p.year }}</td>
                        <td class="py-2.5 px-2 text-center font-bold text-[#0B3558]">{{ p.trained }}</td>
                        <td class="py-2.5 px-2 text-center font-bold text-emerald-700">{{ p.placed }}</td>
                        <td class="py-2.5 px-2 text-center font-bold text-emerald-800">
                          {{ (p.trained && p.trained > 0) ? ((p.placed / p.trained) * 100).toFixed(1) + '%' : '-' }}
                        </td>
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
            </div>

            <!-- ================================================================
                 4. ANNUAL ACTION PLAN (TARGET DISTRICTS & BATCHES)
                 ================================================================ -->
            <div id="action-plan-section" class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div class="pb-2.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">4</span>
                    Proposed Annual Action Plan (Target Districts &amp; Batches)
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Proposed Skill Development Centres (SDCs), sectors, course trades, and committed batches.
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded bg-sky-50 text-[#0B3558] text-xs font-semibold border border-sky-200">
                    {{ actionPlan.length }} District Plan(s)
                  </span>
                  <button
                    type="button"
                    (click)="showAddActionPlanForm.set(!showAddActionPlanForm())"
                    class="px-3 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{{ showAddActionPlanForm() ? '✕ Close Form' : '+ Add District / Centre Plan' }}</span>
                  </button>
                </div>
              </div>

              <!-- Inline Entry Form -->
              @if (showAddActionPlanForm()) {
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="font-bold text-[#0B3558]">New District / Centre Action Plan Entry</span>
                    <button
                      type="button"
                      (click)="showAddActionPlanForm.set(false)"
                      class="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label class="block text-slate-600 mb-1 font-medium">Target District *</label>
                      <input
                        type="text"
                        [(ngModel)]="newActionPlan.district"
                        placeholder="e.g. Alwar / Jaipur / Kota"
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
                      <label class="block text-slate-600 mb-1 font-medium">SDC Locations / Centre Names</label>
                      <input
                        type="text"
                        [(ngModel)]="newActionPlan.location"
                        placeholder="e.g. Main SDC Hub & Rural Centre"
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
                    <div class="flex-1 min-w-55">
                      <input
                        type="text"
                        [(ngModel)]="newActionPlan.courses"
                        placeholder="Course / Trade: e.g. Data Entry Operator, General Duty Assistant"
                        class="w-full p-2 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-[#0B3558]"
                      />
                    </div>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        (click)="showAddActionPlanForm.set(false)"
                        class="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        (click)="saveNewActionPlan()"
                        class="px-4 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
                      >
                        Save Action Plan
                      </button>
                    </div>
                  </div>
                </div>
              }

              <!-- Table -->
              <div class="overflow-x-auto border border-slate-200 rounded-xl">
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th class="py-2.5 px-2 w-10 text-center">S.No</th>
                      <th class="py-2.5 px-3">Year</th>
                      <th class="py-2.5 px-3">Proposed District</th>
                      <th class="py-2.5 px-2 text-center">SDCs</th>
                      <th class="py-2.5 px-3">SDC Location / Centres</th>
                      <th class="py-2.5 px-3">Proposed Sectors</th>
                      <th class="py-2.5 px-3">Course / Trade</th>
                      <th class="py-2.5 px-2 text-center">Mode</th>
                      <th class="py-2.5 px-2 text-center">Batches</th>
                      <th class="py-2.5 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-normal">
                    @for (ap of actionPlan; track ap.id; let idx = $index) {
                      <tr class="hover:bg-slate-50/70">
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
            </div>

            <!-- ================================================================
                 5. EOI DOCUMENTS CHECKLIST (Categorized: Mandatory, Annexures, Remaining)
                 ================================================================ -->
            <div id="documents-section" class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div class="pb-2.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">5</span>
                    Mandatory EOI Proposal Documents Checklist ({{ eoiDocuments().length }} Documents)
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Separated into Mandatory Statutory Documents, Official Scheme Annexures, and Supporting Documents.
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded bg-blue-50 text-[#0B3558] text-xs font-semibold border border-blue-200">
                    {{ attachedDocsCount() }} / {{ eoiDocuments().length }} Attached
                  </span>
                  <button
                    type="button"
                    (click)="attachAllSampleDocs()"
                    class="px-3 py-1 bg-white hover:bg-slate-50 text-[#0B3558] text-xs font-semibold border border-slate-300 rounded cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <span>Attach All Mandated Annexures</span>
                  </button>
                </div>
              </div>

              <!-- Filter Tabs for Documents -->
              <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
                <button
                  type="button"
                  (click)="selectedDocTab.set('all')"
                  class="px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
                  [ngClass]="selectedDocTab() === 'all' ? 'bg-[#0B3558] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  All Documents ({{ eoiDocuments().length }})
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

              <!-- Compact 2-Column Documents Grid for Minimum Scrolling -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                @for (doc of filteredDocuments(); track doc.id) {
                  <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2.5 text-xs">
                    <input
                      #fileInput
                      type="file"
                      accept=".pdf,application/pdf"
                      class="hidden"
                      (change)="onFileSelected($event, doc)"
                    />
                    <div class="flex items-start gap-2.5 min-w-0">
                      <span
                        class="w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5"
                        [ngClass]="{
                          'bg-rose-100 text-rose-700': doc.category === 'mandatory',
                          'bg-sky-100 text-sky-800': doc.category === 'annexure',
                          'bg-slate-200 text-slate-700': doc.category === 'remaining'
                        }"
                      >
                        {{ doc.id }}
                      </span>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="font-semibold text-slate-900 text-xs truncate max-w-xs sm:max-w-md">{{ doc.name }}</span>
                          <span
                            class="px-1.5 py-0.2 rounded text-[9.5px] font-bold shrink-0"
                            [ngClass]="{
                              'bg-rose-50 text-rose-700 border border-rose-200': doc.category === 'mandatory',
                              'bg-sky-50 text-sky-700 border border-sky-200': doc.category === 'annexure',
                              'bg-slate-100 text-slate-600 border border-slate-300': doc.category === 'remaining'
                            }"
                          >
                            {{ doc.category === 'mandatory' ? 'Mandatory' : (doc.category === 'annexure' ? 'Annexure' : 'Supporting') }}
                          </span>
                        </div>

                        @if (doc.status === 'uploaded') {
                          <div class="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700 font-mono truncate">
                            <span class="font-medium truncate">{{ doc.fileName }}</span>
                            <span class="text-slate-400 shrink-0">({{ doc.fileSize }})</span>
                          </div>
                        } @else {
                          <div class="mt-0.5 text-[10.5px] text-amber-700 font-medium">
                            Pending upload
                          </div>
                        }
                      </div>
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0">
                      @if (doc.status === 'uploaded') {
                        <button
                          type="button"
                          (click)="previewDoc(doc)"
                          class="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          (click)="removeDoc(doc)"
                          class="px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          Remove
                        </button>
                      } @else {
                        <button
                          type="button"
                          (click)="fileInput.click()"
                          class="px-3 py-1 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          Upload PDF
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
                &larr; Back to Company Profile
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
        <!-- ====================================================================
             STEP 3: COMPLETE PREVIEW (UNIFIED APPLICATION DOSSIER)
             ==================================================================== -->
        @if (currentStep() === 3) {
          <div class="space-y-6">
            
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between text-xs text-[#0B3558] shadow-2xs">
              <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                <span class="font-normal text-xs sm:text-[13px]">
                  <strong class="font-bold">Comprehensive Proposal Dossier:</strong> Review your verified OTR profile, financial turnover qualification, deployed centres, placement performance, annual action plan, and attached statutory annexures before final submission.
                </span>
              </div>
            </div>

            <!-- Single Unified Application Dossier Card -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 space-y-6 shadow-xs">
              
              <!-- Dossier Header -->
              <div class="flex items-center justify-between pb-4 border-b border-slate-200 flex-wrap gap-2">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[#0B3558]">
                    Expression of Interest (EOI) Proposal Submission Dossier
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    {{ schemeTitle() }} &bull; {{ schemeRefNo() }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded bg-sky-50 text-[#0B3558] text-xs font-bold border border-sky-200">
                    Application Ref: ISMS-EOI-2026-9871
                  </span>
                  <span class="px-2.5 py-1 rounded bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                    Pending Fee Payment &amp; Submission
                  </span>
                </div>
              </div>

              <!-- Section 1: Verified Company Registration & OTR Particulars -->
              <div class="space-y-3 pb-6 border-b border-slate-200">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h4 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wider flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-[10.5px] font-bold">1</span>
                    <span>Company Profile &amp; Statutory Registration Particulars</span>
                  </h4>
                  <button
                    type="button"
                    (click)="editSection('otr-step1')"
                    class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                  >
                    Edit Company Profile &rarr;
                  </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Organization Short Name</span>
                    <span class="font-bold text-slate-800 text-[12.5px]">{{ editableStep1.shortName || 'SkillTech Solutions' }}</span>
                  </div>
                  <div class="sm:col-span-2">
                    <span class="text-slate-400 block text-[10.5px]">Organization Full Legal Name</span>
                    <span class="font-bold text-slate-800 text-[12.5px]">{{ editableStep1.fullName || 'SkillTech Solutions Private Limited' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Nature of Entity</span>
                    <span class="font-semibold text-slate-800">{{ editableStep1.natureOfEntity || 'PUBLIC LIMITED' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">CIN / Registration No</span>
                    <span class="font-mono text-slate-800 font-semibold">{{ editableStep1.registrationNumber || '-' }}</span>
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
                    <span class="text-slate-800 font-medium">{{ editableStep4.bankName || '-' }} ({{ editableStep4.accountNo || '-' }})</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Authorized Person Signatory</span>
                    <span class="font-bold text-slate-800">{{ editableStep3.name || '-' }} ({{ editableStep3.designation || '-' }})</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Designated Officer In-Charge</span>
                    <span class="font-bold text-slate-800">{{ selectedOic()?.name || '-' }} ({{ selectedOic()?.designation || '-' }})</span>
                  </div>
                  <div class="sm:col-span-2">
                    <span class="text-slate-400 block text-[10.5px]">Registered Address</span>
                    <span class="text-slate-800">{{ registeredAddressText }}</span>
                  </div>
                </div>
              </div>

              <!-- Section 2: Financial Eligibility & Turnover Qualification -->
              <div class="space-y-3 pb-6 border-b border-slate-200">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h4 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wider flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-[10.5px] font-bold">2</span>
                    <span>Past 3 Financial Years Turnover &amp; Eligibility Qualification</span>
                  </h4>
                  <button
                    type="button"
                    (click)="editSection('financial-turnover-section')"
                    class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                  >
                    Edit Financials &rarr;
                  </button>
                </div>

                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="bg-slate-50 text-slate-700 font-semibold text-[10.5px] uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-3">Financial Year</th>
                        <th class="py-2.5 px-3">Total Turnover (₹ in Lacs)</th>
                        <th class="py-2.5 px-3">Skill Training Turnover (₹ in Lacs)</th>
                        <th class="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (fy of editableStep1.financialYears; track fy.year) {
                        <tr>
                          <td class="py-2.5 px-3 text-slate-800 font-mono font-semibold">{{ fy.year }}</td>
                          <td class="py-2.5 px-3 text-slate-700 font-mono">₹ {{ fy.totalTurnover || '0.00' }} Lacs</td>
                          <td class="py-2.5 px-3 text-slate-700 font-mono">₹ {{ fy.skillTurnover || '0.00' }} Lacs</td>
                          <td class="py-2.5 px-3 text-center">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Verified Entry
                            </span>
                          </td>
                        </tr>
                      }
                      <tr class="bg-sky-50/60 font-bold border-t border-slate-200">
                        <td class="py-2.5 px-3 uppercase text-[11px] text-[#0B3558]">3-Year Average</td>
                        <td class="py-2.5 px-3 text-[#0B3558] font-mono text-sm">₹ {{ avgTotalTurnover() }} Lacs</td>
                        <td class="py-2.5 px-3 text-emerald-800 font-mono text-sm">₹ {{ avgSkillTurnover() }} Lacs</td>
                        <td class="py-2.5 px-3 text-center">
                          <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-900">
                            &check; Meets Eligibility Criteria
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Section 3: Training Centres Deployed for Scheme -->
              <div class="space-y-3 pb-6 border-b border-slate-200">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h4 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wider flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-[10.5px] font-bold">3</span>
                    <span>Training Centres Deployed for Scheme ({{ selectedCentresForScheme().length }} Centres)</span>
                  </h4>
                  <button
                    type="button"
                    (click)="editSection('training-centres-section')"
                    class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                  >
                    Edit Centres &rarr;
                  </button>
                </div>

                @if (selectedCentresForScheme().length === 0) {
                  <div class="p-3.5 bg-amber-50 rounded-lg text-xs text-amber-800 font-medium">
                    No centres selected or proposed for this scheme yet.
                  </div>
                } @else {
                  <div class="overflow-x-auto border border-slate-200 rounded-xl">
                    <table class="w-full text-left border-collapse text-xs">
                      <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th class="py-2.5 px-3">District</th>
                          <th class="py-2.5 px-3">Centre Name</th>
                          <th class="py-2.5 px-2 text-center">Classrooms</th>
                          <th class="py-2.5 px-2 text-center">Labs</th>
                          <th class="py-2.5 px-2 text-center">Washrooms</th>
                          <th class="py-2.5 px-2 text-center">Lab Infra</th>
                          <th class="py-2.5 px-3">Full Address</th>
                          <th class="py-2.5 px-2 text-center">Type</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 font-normal">
                        @for (c of selectedCentresForScheme(); track c.id) {
                          <tr class="hover:bg-slate-50/70">
                            <td class="py-2.5 px-3 font-semibold text-slate-900">{{ c.district }}</td>
                            <td class="py-2.5 px-3 font-medium text-slate-800">{{ c.centerName }}</td>
                            <td class="py-2.5 px-2 text-center font-bold text-[#0B3558]">{{ c.classrooms }}</td>
                            <td class="py-2.5 px-2 text-center font-bold text-[#0B3558]">{{ c.practicalRooms }}</td>
                            <td class="py-2.5 px-2 text-center text-emerald-700">{{ c.washrooms }}</td>
                            <td class="py-2.5 px-2 text-center">
                              <span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                                {{ c.labInfra }}
                              </span>
                            </td>
                            <td class="py-2.5 px-3 text-slate-500 max-w-xs truncate">{{ c.fullAddress }}</td>
                            <td class="py-2.5 px-2 text-center">
                              <span
                                class="px-2 py-0.5 rounded text-[10px] font-bold"
                                [ngClass]="c.isExisting ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'"
                              >
                                {{ c.isExisting ? 'Existing' : 'Proposed' }}
                              </span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>

              <!-- Section 4: Training & Placement Track Record -->
              <div class="space-y-3 pb-6 border-b border-slate-200">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h4 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wider flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-[10.5px] font-bold">4</span>
                    <span>Past Skill Training &amp; Placement Performance ({{ placementRecords.length }} Sectors)</span>
                  </h4>
                  <button
                    type="button"
                    (click)="editSection('placement-section')"
                    class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                  >
                    Edit Placement &rarr;
                  </button>
                </div>

                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-3">Sector</th>
                        <th class="py-2.5 px-2">Financial Year</th>
                        <th class="py-2.5 px-2 text-center">Trained</th>
                        <th class="py-2.5 px-2 text-center">Placed</th>
                        <th class="py-2.5 px-2 text-center">Placement Rate</th>
                        <th class="py-2.5 px-3 text-right">Proof Document</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-normal">
                      @for (p of placementRecords; track p.sector) {
                        <tr>
                          <td class="py-2.5 px-3 font-semibold text-slate-800">{{ p.sector }}</td>
                          <td class="py-2.5 px-2 text-slate-600 font-mono text-[11px]">{{ p.year }}</td>
                          <td class="py-2.5 px-2 text-center font-bold text-[#0B3558]">{{ p.trained }}</td>
                          <td class="py-2.5 px-2 text-center font-bold text-emerald-700">{{ p.placed }}</td>
                          <td class="py-2.5 px-2 text-center font-bold text-emerald-800">
                            {{ (p.trained && p.trained > 0) ? ((p.placed / p.trained) * 100).toFixed(1) + '%' : '-' }}
                          </td>
                          <td class="py-2.5 px-3 text-right text-[11px] text-slate-500 font-mono">{{ p.proofDoc }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Section 5: Proposed Annual Action Plan -->
              <div class="space-y-3 pb-6 border-b border-slate-200">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h4 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wider flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-[10.5px] font-bold">5</span>
                    <span>State-wide Proposed Annual Action Plan ({{ actionPlan.length }} Districts)</span>
                  </h4>
                  <button
                    type="button"
                    (click)="editSection('action-plan-section')"
                    class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                  >
                    Edit Action Plan &rarr;
                  </button>
                </div>

                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-2 w-10 text-center">S.No</th>
                        <th class="py-2.5 px-3">Year</th>
                        <th class="py-2.5 px-3">Proposed District</th>
                        <th class="py-2.5 px-2 text-center">SDCs</th>
                        <th class="py-2.5 px-3">SDC Location / Centres</th>
                        <th class="py-2.5 px-3">Proposed Sectors</th>
                        <th class="py-2.5 px-3">Course / Trade</th>
                        <th class="py-2.5 px-2 text-center">Mode</th>
                        <th class="py-2.5 px-2 text-center">Batches</th>
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
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Section 6: Mandatory EOI Proposal Documents Checklist -->
              <div class="space-y-3 pb-2">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h4 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wider flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-[10.5px] font-bold">6</span>
                    <span>Mandatory Statutory Documents &amp; Annexures ({{ attachedDocsCount() }} / {{ eoiDocuments().length }} Attached)</span>
                  </h4>
                  <button
                    type="button"
                    (click)="editSection('documents-section')"
                    class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0483AC] border border-sky-200 rounded-md text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                  >
                    Edit Documents &rarr;
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  @for (d of eoiDocuments(); track d.id) {
                    <div class="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between bg-slate-50/70">
                      <div class="flex items-center gap-2 min-w-0 max-w-[75%]">
                        <span class="w-5 h-5 rounded-full font-bold text-[10px] bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                          {{ d.id }}
                        </span>
                        <div class="min-w-0">
                          <span class="font-medium text-slate-800 truncate block">{{ d.name }}</span>
                          @if (d.status === 'uploaded') {
                            <span class="text-[10.5px] text-emerald-700 font-mono truncate block">{{ d.fileName }} ({{ d.fileSize }})</span>
                          }
                        </div>
                      </div>
                      <div class="shrink-0">
                        @if (d.status === 'uploaded') {
                          <span class="text-emerald-700 font-bold text-[10.5px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            &check; Attached
                          </span>
                        } @else {
                          <span class="text-amber-700 font-semibold text-[10.5px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Pending
                          </span>
                        }
                      </div>
                    </div>
                  }
                </div>
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
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
                [class.cursor-pointer]="declarationAgreed()"
                [class.cursor-not-allowed]="!declarationAgreed()"
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
          <div class="space-y-6">

            <!-- Executive Submission Success Banner (Project Theme #0B3558 Navy) -->
            <div class="bg-gradient-to-r from-[#0B3558] via-[#0E436E] to-[#0483AC] text-white rounded-2xl p-6 sm:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#0B3558]">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs flex items-center justify-center text-2xl text-emerald-400 shrink-0 shadow-inner">
                  &check;
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
                      Application Successfully Submitted &amp; Verified
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 text-[10px] font-semibold">
                      Ref: ISMS-EOI-2026-9871
                    </span>
                  </div>
                  <h2 class="text-xl sm:text-2xl font-bold mt-1.5 tracking-tight">
                    EOI Proposal Submitted for {{ schemeCode() }}
                  </h2>
                  <p class="text-xs text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
                    Your Expression of Interest application has been formally recorded in the ISMS 2.0 repository and routed to the RSLDC Technical Scrutiny Committee. A digital confirmation has been dispatched to your registered email and mobile number.
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  (click)="goToTenderStatus()"
                  class="w-full md:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-md"
                >
                  <span>Track in Tender Status &rarr;</span>
                </button>
              </div>
            </div>

            <!-- Formal Digital Submission & Fee Acknowledgment Certificate Card -->
            <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden print:border-none print:shadow-none">

              <!-- Certificate Header / Emblems -->
              <div class="p-6 bg-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-center gap-3.5">
                  <div class="w-11 h-11 rounded-xl bg-[#0B3558] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs tracking-wider">
                    ISMS
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Government of Rajasthan &bull; Department of Skill &amp; Livelihoods
                    </div>
                    <div class="text-sm sm:text-base font-extrabold text-[#0B3558] tracking-tight">
                      Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)
                    </div>
                    <div class="text-[11px] text-slate-500 font-medium">
                      Official EOI Proposal Submission &amp; Cyber Treasury Fee Acknowledgment Receipt
                    </div>
                  </div>
                </div>

                <!-- Digital Verification Badge -->
                <div class="flex items-center gap-2 self-end md:self-auto bg-white border border-emerald-200 rounded-xl px-3.5 py-2 shadow-2xs">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <div class="text-right">
                    <div class="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Digitally Verified &amp; Signed</div>
                    <div class="text-[9.5px] font-mono text-slate-500">28-Sep-2026 14:45 IST</div>
                  </div>
                </div>
              </div>

              <!-- Quick Meta Highlight Strip -->
              <div class="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100 bg-white">
                <div class="p-4">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application Ref No.</span>
                  <span class="font-mono font-extrabold text-sm text-[#0B3558]">ISMS-EOI-2026-9871</span>
                </div>
                <div class="p-4">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cyber Treasury Ref</span>
                  <span class="font-mono font-bold text-xs text-slate-800">TXN-ISMS-2026-345678</span>
                </div>
                <div class="p-4">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Fee Paid</span>
                  <span class="font-extrabold text-sm text-emerald-700">₹52,000 <span class="text-[10.5px] font-normal text-slate-500">(EMD + RFP)</span></span>
                </div>
                <div class="p-4">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Status</span>
                  <span class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Under Technical Scrutiny
                  </span>
                </div>
              </div>

              <!-- Structured Receipt Body Sections -->
              <div class="p-6 sm:p-7 space-y-6 text-xs">

                <!-- 1. Applicant Organization Particulars -->
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <h4 class="text-xs font-bold text-[#0B3558] uppercase tracking-wider flex items-center gap-2">
                      <span class="w-4 h-4 rounded bg-[#0B3558]/10 text-[#0B3558] flex items-center justify-center text-[10px]">1</span>
                      Applicant Training Partner Organization
                    </h4>
                    <span class="text-[10.5px] text-slate-500 font-medium">OTR ID: <strong class="text-slate-800">OTR-2026-RAJ-88421</strong></span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Legal Entity Name</span>
                      <span class="font-bold text-slate-800">{{ editableStep1.fullName || 'Apex Skill Development & Vocational Training Pvt. Ltd.' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Entity Type &bull; Registration / CIN</span>
                      <span class="font-medium text-slate-800">{{ editableStep1.companyType || 'Private Limited' }} &bull; {{ editableStep1.registrationNumber || 'U80302RJ2022NPL079811' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">PAN &bull; GSTIN</span>
                      <span class="font-mono font-medium text-slate-800">{{ editableStep1.companyPan || 'AAACR1234F' }} &bull; {{ editableStep1.gstin || '08AAACR1234F1Z5' }}</span>
                    </div>
                    <div class="md:col-span-2">
                      <span class="text-slate-400 block text-[10.5px]">Registered Office Address</span>
                      <span class="text-slate-700">{{ registeredAddressText }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Designated Officer In-Charge</span>
                      <span class="font-semibold text-slate-800">{{ selectedOic()?.name || editableStep3.name || 'Dr. Rajesh Sharma' }} ({{ selectedOic()?.designation || editableStep3.designation || 'Director' }})</span>
                    </div>
                  </div>
                </div>

                <!-- 2. Scheme & Proposal Details -->
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <h4 class="text-xs font-bold text-[#0B3558] uppercase tracking-wider flex items-center gap-2">
                      <span class="w-4 h-4 rounded bg-[#0B3558]/10 text-[#0B3558] flex items-center justify-center text-[10px]">2</span>
                      Scheme Application &amp; Infrastructure Commitments
                    </h4>
                    <span class="text-[10.5px] text-slate-500 font-medium">Scheme: <strong class="text-slate-800">{{ schemeCode() }}</strong></span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Scheme Title</span>
                      <span class="font-bold text-slate-800">{{ schemeTitle() }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">EOI Reference Number</span>
                      <span class="font-mono text-slate-800 font-medium text-[11px]">{{ schemeRefNo() }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">EOI Category &bull; Submission Window</span>
                      <span class="font-medium text-slate-800">{{ schemeEoiCategory() }} &bull; Open (Closes {{ schemeClosingDate() }})</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Training Centres Deployed</span>
                      <span class="font-bold text-[#0B3558] text-sm">{{ selectedCentresForScheme().length }} Verified Centre(s)</span>
                      <div class="text-[10.5px] text-slate-500 truncate mt-0.5">
                        @for (c of selectedCentresForScheme(); track c.id; let last = $last) {
                          {{ c.name }}{{ !last ? ', ' : '' }}
                        }
                      </div>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Annual Trainee Target Commitment</span>
                      <span class="font-bold text-slate-800 text-sm">{{ totalTraineesTarget() }} Candidates</span>
                      <div class="text-[10.5px] text-slate-500 mt-0.5">
                        Planned across {{ actionPlan().length }} target district(s)
                      </div>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Statutory Annexures &amp; Documents</span>
                      <span class="font-bold text-emerald-700 text-sm">{{ attachedDocsCount() }} of {{ eoiDocuments().length }} Attached</span>
                      <div class="text-[10.5px] text-emerald-600 mt-0.5">All mandatory files digitally verified</div>
                    </div>
                  </div>
                </div>

                <!-- 3. Cyber Treasury Fee Payment & Receipt Breakdown -->
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <h4 class="text-xs font-bold text-[#0B3558] uppercase tracking-wider flex items-center gap-2">
                      <span class="w-4 h-4 rounded bg-[#0B3558]/10 text-[#0B3558] flex items-center justify-center text-[10px]">3</span>
                      Cyber Treasury Fee Payment &amp; e-Challan Particulars
                    </h4>
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      &check; Payment Reconciled &amp; Settled
                    </span>
                  </div>

                  <div class="border border-slate-200 rounded-xl overflow-hidden">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-100/80 text-slate-600 font-bold text-[10.5px] uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th class="p-3">Fee Component</th>
                          <th class="p-3">Classification</th>
                          <th class="p-3">Cyber Treasury Head</th>
                          <th class="p-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td class="p-3 font-semibold text-slate-800">EOI RFP Tender Processing Fee</td>
                          <td class="p-3"><span class="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Non-Refundable</span></td>
                          <td class="p-3 font-mono text-[11px] text-slate-500">0070-60-800-01-00 (Admin Charges)</td>
                          <td class="p-3 text-right font-mono font-bold text-slate-900">₹2,000.00</td>
                        </tr>
                        <tr>
                          <td class="p-3 font-semibold text-slate-800">Earnest Money Deposit (EMD)</td>
                          <td class="p-3"><span class="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded">Refundable / BG Adjustable</span></td>
                          <td class="p-3 font-mono text-[11px] text-slate-500">8443-00-103-00-00 (Security Deposits)</td>
                          <td class="p-3 text-right font-mono font-bold text-slate-900">₹50,000.00</td>
                        </tr>
                        <tr class="bg-slate-50 font-bold">
                          <td colspan="3" class="p-3 text-right text-slate-700 uppercase tracking-wider text-[11px]">
                            Total Amount Transferred (Rupees Fifty-Two Thousand Only):
                          </td>
                          <td class="p-3 text-right text-base text-[#0B3558] font-black">
                            ₹52,000.00
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div class="p-3 bg-slate-50/50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
                      <div>Mode: <strong class="text-slate-800 font-semibold">{{ paymentMethod() }} (Cyber Treasury Gateway)</strong></div>
                      <div>Challan GRN: <strong class="font-mono text-slate-800">GRN-RAJ-2026-99182348</strong></div>
                      <div>Bank Ref / CIN: <strong class="font-mono text-slate-800">CIN-HDFC-9912081</strong></div>
                      <div>Timestamp: <strong class="text-slate-800">28-Sep-2026 14:42:15 IST</strong></div>
                    </div>
                  </div>
                </div>

                <!-- 4. Next Steps & Statutory Advisory -->
                <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-[11.5px] text-slate-700">
                  <div class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    i
                  </div>
                  <div class="space-y-1">
                    <div class="font-bold text-[#0B3558]">Next Steps in Proposal Scrutiny Lifecycle:</div>
                    <p class="leading-relaxed text-slate-600">
                      1. The RSLDC Scrutiny Committee will verify your institutional credentials, turnover eligibility, and training center infrastructure.<br>
                      2. If clarifications are required, a deficiency notice will be raised directly in your ISMS 2.0 dashboard.<br>
                      3. Shortlisted applicant partners will be invited for technical presentation and letter of award (LoA) allocation.
                    </p>
                    <div class="text-[10px] text-slate-400 font-mono pt-1">
                      Security Hash: SHA256: 7B9E-48A1-D992-MMKVY-2026-RSLDC-GOV &bull; Electronically generated under IT Act 2000
                    </div>
                  </div>
                </div>

              </div>

              <!-- Action Toolbar Footer -->
              <div class="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                  <button
                    type="button"
                    (click)="downloadReceipt('acknowledgment')"
                    class="flex-1 sm:flex-none px-4 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Download Official Acknowledgment (PDF)</span>
                  </button>

                  <button
                    type="button"
                    (click)="downloadReceipt('payment')"
                    class="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
                  >
                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Download Payment e-Challan</span>
                  </button>
                </div>

                <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    (click)="printReceipt()"
                    class="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    <span>Print Formal Receipt</span>
                  </button>

                  <button
                    type="button"
                    (click)="goToTenderStatus()"
                    class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>View in Tender Status &rarr;</span>
                  </button>
                </div>
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
              <h3 class="text-lg font-bold tracking-tight text-white" style="color: #ffffff !important;">Payment Successful</h3>
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

  get registeredAddressText(): string {
    const s = this.editableStep1;
    if (!s) return '-';
    const parts = [s.registeredAddress, s.registeredDistrict, s.registeredState];
    let str = parts.filter(p => !!p && p.trim().length > 0).join(', ');
    if (s.registeredPincode?.trim()) str += (str ? ' - ' : '') + s.registeredPincode.trim();
    return str || s.registeredAddress || '-';
  }

  get officeAddressText(): string {
    const s = this.editableStep1;
    if (!s) return '-';
    if (s.sameAsRegistered) return 'Same as Registered Address';
    const parts = [s.officeAddress, s.officeDistrict, s.officeState];
    let str = parts.filter(p => !!p && p.trim().length > 0).join(', ');
    if (s.officePincode?.trim()) str += (str ? ' - ' : '') + s.officePincode.trim();
    return str || s.officeAddress || '-';
  }

  get residenceAddressText(): string {
    const s = this.editableStep3;
    return s?.residenceAddress || '-';
  }

  goBack(): void {
    this.location.back();
  }
  selectedOicId = signal<string>('');

  readonly selectedOic = computed(() => {
    const id = this.selectedOicId();
    if (!id && this.editableStep2?.length > 0) return this.editableStep2[0];
    return this.editableStep2?.find(o => o.id === id) || (this.editableStep2?.[0] ?? null);
  });

  turnoverChanged = signal<number>(0);

  onTurnoverChange(): void {
    this.turnoverChanged.update(v => v + 1);
  }

  readonly avgTotalTurnover = computed(() => {
    this.turnoverChanged();
    const rows = this.editableStep1?.financialYears;
    if (!rows || !rows.length) return '0.00';
    const sum = rows.reduce((acc, r) => acc + (parseFloat(r.totalTurnover) || 0), 0);
    return (sum / rows.length).toFixed(2);
  });

  readonly avgSkillTurnover = computed(() => {
    this.turnoverChanged();
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

  /** All available centres (existing from profile + newly proposed) */
  readonly allCentres = computed<TrainingCenterItem[]>(() => {
    return [...this.existingCentres, ...this.newProposedCentres];
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
    this.selectedExistingCentreIds.set([...this.selectedExistingCentreIds(), item.id]);
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
  showAddPlacementForm = signal<boolean>(false);
  newPlacement = {
    sector: '',
    year: '2024 - 2025',
    trained: null as number | null,
    placed: null as number | null,
    proofDoc: ''
  };
  placementRecords: TrainingPlacementRecord[] = [
    {
      sector: 'Healthcare & Paramedics',
      year: '2024 - 2025',
      trained: 450,
      placed: 340,
      proofDoc: 'Healthcare_Placement_Audit_2024-25.pdf'
    },
    {
      sector: 'IT-ITeS & Digital Services',
      year: '2023 - 2024',
      trained: 600,
      placed: 465,
      proofDoc: 'IT_Placement_Certified_2023-24.pdf'
    },
    {
      sector: 'Apparel & Made-ups',
      year: '2022 - 2023',
      trained: 380,
      placed: 285,
      proofDoc: 'Apparel_Placement_Report_2022-23.pdf'
    }
  ];

  saveNewPlacement(): void {
    if (!this.newPlacement.sector) {
      alert('Please enter Sector Name');
      return;
    }
    const item: TrainingPlacementRecord = {
      sector: this.newPlacement.sector,
      year: this.newPlacement.year || '2024 - 2025',
      trained: Number(this.newPlacement.trained) || 0,
      placed: Number(this.newPlacement.placed) || 0,
      proofDoc: this.newPlacement.proofDoc || 'Placement_Proof_Certified.pdf'
    };
    this.placementRecords.push(item);
    this.showAddPlacementForm.set(false);
    this.newPlacement = {
      sector: '',
      year: '2024 - 2025',
      trained: null,
      placed: null,
      proofDoc: ''
    };
  }

  removePlacement(index: number): void {
    this.placementRecords.splice(index, 1);
  }

  // Annual Action Plan
  showAddActionPlanForm = signal<boolean>(false);
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
  actionPlan: ActionPlanDistrict[] = [
    {
      id: 'ap-1',
      year: '2025-2026',
      district: 'Jaipur',
      sdcCount: 2,
      location: 'Jaipur City SDC & Sanganer SDC Hub',
      sectors: 'IT-ITeS, Healthcare & Apparel',
      courses: 'Data Entry Operator, General Duty Assistant',
      mode: 'Both',
      batches: 15
    },
    {
      id: 'ap-2',
      year: '2025-2026',
      district: 'Alwar',
      sdcCount: 2,
      location: 'Alwar Central SDC & Bhiwadi Technical SDC',
      sectors: 'Automotive & Electronics',
      courses: 'Automotive Assembly Technician, Electrician',
      mode: 'Both',
      batches: 10
    },
    {
      id: 'ap-3',
      year: '2025-2026',
      district: 'Jodhpur',
      sdcCount: 1,
      location: 'Jodhpur Industrial SDC Hub',
      sectors: 'Multi-Skills & Digital Services',
      courses: 'Solar Panel Installation, Digital Office Associate',
      mode: 'Residential',
      batches: 8
    }
  ];

  saveNewActionPlan(): void {
    if (!this.newActionPlan.district) {
      alert('Please enter Target District');
      return;
    }
    const item: ActionPlanDistrict = {
      id: `ap-${Date.now()}`,
      year: this.newActionPlan.year || '2025-2026',
      district: this.newActionPlan.district,
      sdcCount: Number(this.newActionPlan.sdcCount) || 1,
      location: this.newActionPlan.location || (this.newActionPlan.district + ' SDC Centre'),
      sectors: this.newActionPlan.sectors || 'Multi-Skills & Vocational Trades',
      courses: this.newActionPlan.courses || 'Skill Training Course',
      mode: this.newActionPlan.mode || 'Both',
      batches: Number(this.newActionPlan.batches) || 5
    };
    this.actionPlan.push(item);
    this.showAddActionPlanForm.set(false);
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

  /** 16 Proposal Documents with clean wording (no duplicate Annexure mentions) */
  eoiDocuments = signal<EoiDocumentItem[]>([
    // 1. Mandatory Statutory Documents
    {
      id: 1,
      name: 'Covering Letter (Annexure 1)',
      description: 'Official proposal submission covering letter on organization letterhead',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 2,
      name: 'Audited Financial Statements (Annexure 3)',
      description: 'CA certified balance sheet and P&L accounts for last 3 consecutive financial years',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 3,
      name: 'Anti-Blacklisting Notarized Affidavit (Annexure 6)',
      description: 'Non-judicial notary stamped anti-blacklisting undertaking',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 4,
      name: 'Statutory Compliance Self-Declaration (Annexure 7)',
      description: 'Statutory compliance self-declaration on corporate letterhead',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 5,
      name: 'Signed & Sealed EOI Document',
      description: 'Complete downloaded RFP document signed and sealed on all pages',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 6,
      name: 'Debarment Undertaking Document',
      description: 'Affidavit affirming entity is not debarred by any Central or State Govt agency',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },

    // 2. Official Scheme Annexures
    {
      id: 7,
      name: 'Training & Placement Track Record (Annexure 5)',
      description: 'Candidate-level wage placement track record and audit certificates',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 8,
      name: 'Active Skill Development Centres (Annexure 4)',
      description: 'Geotagged infrastructure layout and classroom verification proofs',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 9,
      name: 'Board of Directors Details (Annexure 8)',
      description: 'Board member listing, DIN, and KYC registration profiles',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 10,
      name: 'Industry Placement Tie-ups & MOUs (Annexure 9)',
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
      name: 'Relevant Sector Experience Proof (Annexure 10)',
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
      name: 'District Cluster Mobilization Plan (Annexure 11)',
      description: 'District cluster prioritization and candidate outreach methodology',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 13,
      name: 'Technical Evaluation Matrix (Annexure 12)',
      description: 'Technical scoring self-assessment and qualification criteria response',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 14,
      name: 'Supporting Credentials & Accreditations (Annexure 13)',
      description: 'Additional credentials, excellence awards, and ISO accreditations',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },

    // 3. Remaining Documents
    {
      id: 15,
      name: 'NSDC Stake Partner Certificate',
      description: 'NSDC equity or funded partner participation certificate',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: false,
      status: 'pending',
      category: 'remaining'
    },
    {
      id: 16,
      name: 'CA Turnover Certificate with UDIN (Annexure 14)',
      description: 'Chartered Accountant certified turnover certificate with valid UDIN',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'remaining'
    }
  ]);

  readonly mandatoryDocs = computed(() => this.eoiDocuments().filter(d => d.category === 'mandatory'));
  readonly annexureDocs = computed(() => this.eoiDocuments().filter(d => d.category === 'annexure'));
  readonly remainingDocs = computed(() => this.eoiDocuments().filter(d => d.category === 'remaining'));

  readonly mandatoryAttachedCount = computed(() => this.mandatoryDocs().filter(d => d.status === 'uploaded').length);
  readonly annexureAttachedCount = computed(() => this.annexureDocs().filter(d => d.status === 'uploaded').length);
  readonly remainingAttachedCount = computed(() => this.remainingDocs().filter(d => d.status === 'uploaded').length);

  readonly filteredDocuments = computed(() => {
    const tab = this.selectedDocTab();
    if (tab === 'all') return this.eoiDocuments();
    return this.eoiDocuments().filter(d => d.category === tab);
  });

  readonly attachedDocsCount = computed(() => this.eoiDocuments().filter(d => d.status === 'uploaded').length);

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

    if (!this.editableStep1?.financialYears || this.editableStep1.financialYears.length === 0) {
      this.editableStep1.financialYears = [
        { year: '2025-26', totalTurnover: '180.00', skillTurnover: '72.00' },
        { year: '2024-25', totalTurnover: '150.00', skillTurnover: '60.00' },
        { year: '2023-24', totalTurnover: '120.00', skillTurnover: '48.00' }
      ];
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
  editSection(target: 'otr-step1' | 'oic-dropdown' | 'training-centres-section' | 'financial-turnover-section' | 'placement-section' | 'action-plan-section' | 'documents-section'): void {
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
      const sizeMb = file.size / (1024 * 1024);
      const fileSize = sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const uploadedDate = `${now.getDate()}-${months[now.getMonth()]}-${now.getFullYear()}`;
      this.eoiDocuments.update(docs => docs.map(d => d.id === doc.id ? {
        ...d,
        fileName: file.name,
        fileSize,
        uploadedDate,
        status: 'uploaded'
      } : d));
      input.value = '';
    }
  }

  attachAllSampleDocs(): void {
    this.eoiDocuments.update(docs => docs.map((doc, idx) => ({
      ...doc,
      status: 'uploaded',
      fileName: `Scan_Annexure_${doc.id}_Signed.pdf`,
      fileSize: `${(1.2 + (idx % 3) * 0.8).toFixed(1)} MB`,
      uploadedDate: '24-Sep-2026'
    })));
  }

  removeDoc(doc: EoiDocumentItem): void {
    this.eoiDocuments.update(docs => docs.map(d => d.id === doc.id ? {
      ...d,
      status: 'pending',
      fileName: '',
      fileSize: '',
      uploadedDate: ''
    } : d));
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
Attached Statutory Documents : ${this.attachedDocsCount()} / ${this.eoiDocuments().length} Mandatory Documents Verified
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
