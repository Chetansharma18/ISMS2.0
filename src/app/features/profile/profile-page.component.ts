import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { OtrFormService } from '../registration/services/otr-form.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 select-none font-sans">
      
      <!-- ====================================================================
           CASE 1: INCOMPLETE PROFILE (Centered Perfectly on Page)
           ==================================================================== -->
      @if (isProfileIncomplete()) {
        <div class="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6">
          <div class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-2xl w-full shadow-sm animate-in fade-in duration-200">
            <div class="space-y-4 font-sans" style="font-family: 'Inter', sans-serif;">
              
              <!-- Heading -->
              <div>
                <h2 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Please complete your profile first
                </h2>
                <p class="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Your entity profile is currently incomplete. Please complete your One Time Registration (OTR) profile to register your organization as a Training Partner (TP) / Project Implementing Agency (PIA) and submit EOI proposals for state skill schemes.
                </p>
              </div>

              <!-- Features requiring profile -->
              <div class="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-normal">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>Organization &amp; Legal Constitution</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>Officer In-Charge Directory</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>Authorized Representative Documents</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>Verified Bank Account for Disbursals</span>
                </div>
              </div>

              <!-- Action Button to open Registration Form (Complete Registration) -->
              <div class="pt-3">
                <a
                  routerLink="/registration"
                  class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <span>Complete Registration</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>

            </div>
          </div>
        </div>
      } @else {
        <!-- ====================================================================
             CASE 2: VERIFIED PROFILE WITH ALL 5 OTR STEPS FILLED
             ==================================================================== -->
        <div class="p-6 sm:p-8 space-y-6 max-w-6xl font-sans" style="font-family: 'Inter', sans-serif;">
          
          <!-- Top Heading -->
          <div class="space-y-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Entity Profile
            </h1>
            <p class="text-xs text-slate-500 font-normal">
              One Time Registration (OTR) details and verified institutional profile
            </p>
          </div>

          <!-- Quick Tab Filter Bar -->
          <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar font-sans text-xs">
            <button
              type="button"
              (click)="activeTab.set('all')"
              class="px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0"
              [class.bg-slate-900]="activeTab() === 'all'"
              [class.text-white]="activeTab() === 'all'"
              [class.text-slate-600]="activeTab() !== 'all'"
              [class.hover:bg-slate-100]="activeTab() !== 'all'"
            >
              All Steps
            </button>
            <button
              type="button"
              (click)="activeTab.set('org')"
              class="px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0"
              [class.bg-slate-900]="activeTab() === 'org'"
              [class.text-white]="activeTab() === 'org'"
              [class.text-slate-600]="activeTab() !== 'org'"
              [class.hover:bg-slate-100]="activeTab() !== 'org'"
            >
              Step 1 - Organization Details
            </button>
            <button
              type="button"
              (click)="activeTab.set('officers')"
              class="px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0"
              [class.bg-slate-900]="activeTab() === 'officers'"
              [class.text-white]="activeTab() === 'officers'"
              [class.text-slate-600]="activeTab() !== 'officers'"
              [class.hover:bg-slate-100]="activeTab() !== 'officers'"
            >
              Step 2 – Details of Officer In-Charge
            </button>
            <button
              type="button"
              (click)="activeTab.set('auth')"
              class="px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0"
              [class.bg-slate-900]="activeTab() === 'auth'"
              [class.text-white]="activeTab() === 'auth'"
              [class.text-slate-600]="activeTab() !== 'auth'"
              [class.hover:bg-slate-100]="activeTab() !== 'auth'"
            >
              Step 3 – Authorized Person Details
            </button>
            <button
              type="button"
              (click)="activeTab.set('bank')"
              class="px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0"
              [class.bg-slate-900]="activeTab() === 'bank'"
              [class.text-white]="activeTab() === 'bank'"
              [class.text-slate-600]="activeTab() !== 'bank'"
              [class.hover:bg-slate-100]="activeTab() !== 'bank'"
            >
              Step 4 – Bank Details
            </button>
            <button
              type="button"
              (click)="activeTab.set('docs')"
              class="px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0"
              [class.bg-slate-900]="activeTab() === 'docs'"
              [class.text-white]="activeTab() === 'docs'"
              [class.text-slate-600]="activeTab() !== 'docs'"
              [class.hover:bg-slate-100]="activeTab() !== 'docs'"
            >
              Step 5: Documents &amp; Declaration
            </button>
          </div>

          <!-- ====================================================================
               STEP 1: ORGANIZATION DETAILS (All Fields)
               ==================================================================== -->
          @if (activeTab() === 'all' || activeTab() === 'org') {
            <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 font-sans">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">1</span>
                  <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">Step 1 - Organization Details</h3>
                </div>
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="{ step: 1 }"
                  class="text-xs font-normal text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Step 1</span>
                </a>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs font-normal">
                <div>
                  <span class="text-slate-500 block">TP/PIA Short Name</span>
                  <span class="text-slate-800">{{ formData().step1.shortName || 'RSLDC' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">TP/PIA Full Name</span>
                  <span class="text-slate-800">{{ formData().step1.fullName || 'Apex Skill Development Foundation' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Nature of Entity</span>
                  <span class="text-slate-800">{{ formData().step1.natureOfEntity || 'PUBLIC LIMITED' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Registration Number of Entity (CIN / Registration No. / Other)</span>
                  <span class="text-slate-800 font-mono">{{ formData().step1.registrationNumber || 'U80302RJ2022NPL079811' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Date of Registration as Legal Entity</span>
                  <span class="text-slate-800">{{ formData().step1.dateOfRegistration || '15-Apr-2022' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">State/UT of Legal Registration</span>
                  <span class="text-slate-800">{{ formData().step1.stateOfLegalReg || 'Rajasthan' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Company PAN</span>
                  <span class="text-slate-800 font-mono">{{ formData().step1.companyPan || 'AAACR1234F' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">GST Registered</span>
                  <span class="text-slate-800">{{ formData().step1.gstRegistered || 'Yes' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">GSTIN</span>
                  <span class="text-slate-800 font-mono">{{ formData().step1.gstin || '08AAACR1234F1Z5' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">MSME Registered</span>
                  <span class="text-slate-800">{{ formData().step1.msmeRegistered || 'Yes' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Udyam Number</span>
                  <span class="text-slate-800 font-mono">{{ formData().step1.udyamNumber || 'UDYAM-RJ-14-0019284' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">NSDC Partner</span>
                  <span class="text-slate-800">{{ formData().step1.nsdcPartner || 'Funded Partner' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Company Contact No.</span>
                  <span class="text-slate-800">{{ formData().step1.contactNo || '0141-2700891' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Company Email-ID</span>
                  <span class="text-slate-800">{{ formData().step1.emailId || 'partner@rsldc-skill.org' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Website</span>
                  <span class="text-slate-800">{{ formData().step1.website || 'https://rsldc-skill.org' }}</span>
                </div>
                
                <div class="sm:col-span-2 md:col-span-3 pt-2 border-t border-slate-100">
                  <span class="text-slate-500 block">Registered Address</span>
                  <span class="text-slate-800">
                    {{ formData().step1.registeredAddress || 'Plot No. 42, Institutional Area, Jhalana Doongri' }},
                    {{ formData().step1.registeredDistrict || 'Jaipur' }},
                    {{ formData().step1.registeredState || 'Rajasthan' }} - {{ formData().step1.registeredPincode || '302004' }}
                  </span>
                </div>
                <div class="sm:col-span-2 md:col-span-3">
                  <span class="text-slate-500 block">Office Address</span>
                  <span class="text-slate-800">
                    {{ formData().step1.officeAddress || 'Plot No. 42, Institutional Area, Jhalana Doongri' }},
                    {{ formData().step1.officeDistrict || 'Jaipur' }},
                    {{ formData().step1.officeState || 'Rajasthan' }} - {{ formData().step1.officePincode || '302004' }}
                  </span>
                </div>
              </div>
            </div>
          }

          <!-- ====================================================================
               STEP 2: OFFICER IN-CHARGE DIRECTORY (All Fields & Members)
               ==================================================================== -->
          @if (activeTab() === 'all' || activeTab() === 'officers') {
            <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 font-sans">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">2</span>
                  <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">Step 2 – Details of Officer In-Charge</h3>
                </div>
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="{ step: 2 }"
                  class="text-xs font-normal text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Step 2</span>
                </a>
              </div>

              @let oic = formData().step2[0] || {};
              <div class="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold">1</span>
                    <span class="text-xs text-slate-800 font-semibold">{{ oic.name || 'Dr. Rajesh Sharma' }}</span>
                    @if (oic.designation) {
                      <span class="text-[11px] text-slate-500">({{ oic.designation }})</span>
                    }
                  </div>
                  <span class="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Verified</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-normal">
                  <div>
                    <span class="text-slate-500 block">Name</span>
                    <span class="text-slate-800">{{ oic.name || 'Dr. Rajesh Sharma' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">Designation</span>
                    <span class="text-slate-800">{{ oic.designation || 'Managing Director' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">Mobile No.</span>
                    <span class="text-slate-800">{{ oic.mobileNo || '9829012345' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">Email-ID</span>
                    <span class="text-slate-800">{{ oic.emailId || 'rajesh.sharma@rsldc-skill.org' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">PAN</span>
                    <span class="text-slate-800 font-mono">{{ oic.pan || 'ABCPS1234K' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">Aadhaar No.</span>
                    <span class="text-slate-800 font-mono">{{ oic.aadhaarNo || 'XXXXXXXX1098' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">Bhamashah No.</span>
                    <span class="text-slate-800 font-mono">{{ oic.bhamashahNo || 'BHM889210' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">Voter ID No.</span>
                    <span class="text-slate-800 font-mono">{{ oic.voterIdNo || 'RJ/14/098/123456' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">Passport No.</span>
                    <span class="text-slate-800 font-mono">{{ oic.passportNo || 'Z9876543' }}</span>
                  </div>
                  <div class="sm:col-span-2">
                    <span class="text-slate-500 block">OIC Appointment / Authorization Letter</span>
                    <span class="text-slate-800">{{ oic.appointmentLetterDoc?.fileName || 'MD_Appointment_Letter.pdf' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">OIC Identity Proof</span>
                    <span class="text-slate-800">{{ oic.idProofDoc?.fileName || 'OIC_Identity_Proof.pdf' }}</span>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- ====================================================================
               STEP 3: AUTHORIZED PERSON DETAILS (All Fields)
               ==================================================================== -->
          @if (activeTab() === 'all' || activeTab() === 'auth') {
            <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 font-sans">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">3</span>
                  <div>
                    <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">Step 3 – Authorized Person Details</h3>
                    <p class="text-[11px] text-slate-500 font-normal">The Authorized Person is the person officially authorized to represent the TP/PIA.</p>
                  </div>
                </div>
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="{ step: 3 }"
                  class="text-xs font-normal text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Step 3</span>
                </a>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-xs font-normal">
                <div>
                  <span class="text-slate-500 block">Name</span>
                  <span class="text-slate-800">{{ formData().step3.name || 'Vikram Singh Mehta' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Date of Birth</span>
                  <span class="text-slate-800">{{ formData().step3.dob || '14-Aug-1982' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Age</span>
                  <span class="text-slate-800">{{ formData().step3.age || '44' }} Years</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Designation</span>
                  <span class="text-slate-800">{{ formData().step3.designation || 'Authorized Representative' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">PAN</span>
                  <span class="text-slate-800 font-mono">{{ formData().step3.pan || 'BNYPM9876Q' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Email-ID</span>
                  <span class="text-slate-800">{{ formData().step3.emailId || 'vikram.mehta@rsldc-skill.org' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Mobile No.</span>
                  <span class="text-slate-800">{{ formData().step3.mobileNo || '9829154321' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Aadhaar No.</span>
                  <span class="text-slate-800 font-mono">{{ formData().step3.aadhaarNo || 'XXXXXXXX4321' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Bhamashah No.</span>
                  <span class="text-slate-800 font-mono">{{ formData().step3.bhamashahNo || 'BHM551982' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Voter ID No.</span>
                  <span class="text-slate-800 font-mono">{{ formData().step3.voterIdNo || 'RJ/14/098/987654' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Passport No.</span>
                  <span class="text-slate-800 font-mono">{{ formData().step3.passportNo || 'A1234567' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">State</span>
                  <span class="text-slate-800">{{ formData().step3.state || 'Rajasthan' }}</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-slate-500 block">Authorization Letter / Board Resolution / Authority Document</span>
                  <span class="text-slate-800">{{ formData().step3.authorizationLetterDoc?.fileName || 'Board_Resolution_Auth.pdf' }}</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-slate-500 block">Authorized Person Identity Proof</span>
                  <span class="text-slate-800">{{ formData().step3.idProofDoc?.fileName || 'Auth_Person_ID_Proof.pdf' }}</span>
                </div>
                <div class="sm:col-span-2 md:col-span-4 pt-2 border-t border-slate-100">
                  <span class="text-slate-500 block">Residence Address</span>
                  <span class="text-slate-800">{{ formData().step3.residenceAddress || 'B-12, Malviya Nagar, Jaipur, Rajasthan - 302017' }}</span>
                </div>
              </div>
            </div>
          }

          <!-- ====================================================================
               STEP 4: BANK DETAILS (All Fields)
               ==================================================================== -->
          @if (activeTab() === 'all' || activeTab() === 'bank') {
            <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 font-sans">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">4</span>
                  <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">Step 4 – Bank Details</h3>
                </div>
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="{ step: 4 }"
                  class="text-xs font-normal text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Step 4</span>
                </a>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs font-normal">
                <div>
                  <span class="text-slate-500 block">Name of the Bank</span>
                  <span class="text-slate-800">{{ formData().step4.bankName || 'State Bank of India' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Branch Name</span>
                  <span class="text-slate-800">{{ formData().step4.branchName || 'Secretariat Branch, Jaipur' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Mode of Transfer</span>
                  <span class="text-slate-800">{{ formData().step4.transferMode || 'RTGS / NEFT / PFMS' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Type of Account</span>
                  <span class="text-slate-800">{{ formData().step4.accountType || 'Current Account' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Account Holder Name</span>
                  <span class="text-slate-800">{{ formData().step4.accountHolderName || 'Apex Skill Development Foundation' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Account No.</span>
                  <span class="text-slate-800 font-mono">{{ formData().step4.accountNo || '3948201948201' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">IFSC Code</span>
                  <span class="text-slate-800 font-mono">{{ formData().step4.ifscCode || 'SBIN0001234' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">MICR Code</span>
                  <span class="text-slate-800 font-mono">{{ formData().step4.micrCode || '302002005' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block">Upload Cancelled Cheque</span>
                  <span class="text-slate-800">{{ formData().step4.cancelledChequeDoc?.fileName || 'Cancelled_Cheque_SBI.pdf' }}</span>
                </div>
                <div class="sm:col-span-2 md:col-span-3 pt-2 border-t border-slate-100">
                  <span class="text-slate-500 block">Branch Address</span>
                  <span class="text-slate-800">{{ formData().step4.branchAddress || 'Secretariat Building, Bhagwan Das Road, C-Scheme, Jaipur - 302005' }}</span>
                </div>
              </div>
            </div>
          }

          <!-- ====================================================================
               STEP 5: UPLOADED DOCUMENTS & DECLARATION
               ==================================================================== -->
          @if (activeTab() === 'all' || activeTab() === 'docs') {
            <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 font-sans">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">5</span>
                  <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">Step 5: Uploaded Documents &amp; Declaration</h3>
                </div>
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="{ step: 5 }"
                  class="text-xs font-normal text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Step 5</span>
                </a>
              </div>

              <!-- Uploaded Documents Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-normal">
                
                <div class="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50/50">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                    </svg>
                    <div>
                      <span class="text-slate-800 block">Certificate of Incorporation</span>
                      <span class="text-[10px] text-slate-500">{{ formData().step1.registrationCertDoc?.fileName || 'CIN_Incorporation_Cert_2022.pdf' }}</span>
                    </div>
                  </div>
                  <span class="text-emerald-700 text-[11px]">&check; Verified</span>
                </div>

                <div class="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50/50">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                    </svg>
                    <div>
                      <span class="text-slate-800 block">Company PAN Card</span>
                      <span class="text-[10px] text-slate-500">{{ formData().step1.panCardDoc?.fileName || 'Company_PAN_Verified.pdf' }}</span>
                    </div>
                  </div>
                  <span class="text-emerald-700 text-[11px]">&check; Verified</span>
                </div>

                <div class="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50/50">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                    </svg>
                    <div>
                      <span class="text-slate-800 block">GSTIN Certificate</span>
                      <span class="text-[10px] text-slate-500">{{ formData().step1.gstCertDoc?.fileName || 'GST_Registration_Certificate.pdf' }}</span>
                    </div>
                  </div>
                  <span class="text-emerald-700 text-[11px]">&check; Verified</span>
                </div>

                <div class="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50/50">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                    </svg>
                    <div>
                      <span class="text-slate-800 block">MSME Udyam Certificate</span>
                      <span class="text-[10px] text-slate-500">{{ formData().step1.msmeCertDoc?.fileName || 'Udyam_Certificate.pdf' }}</span>
                    </div>
                  </div>
                  <span class="text-emerald-700 text-[11px]">&check; Verified</span>
                </div>

                <div class="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50/50">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                    </svg>
                    <div>
                      <span class="text-slate-800 block">Board Resolution / Auth</span>
                      <span class="text-[10px] text-slate-500">{{ formData().step3.authorizationLetterDoc?.fileName || 'Board_Resolution_Auth.pdf' }}</span>
                    </div>
                  </div>
                  <span class="text-emerald-700 text-[11px]">&check; Verified</span>
                </div>

                <div class="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50/50">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                    </svg>
                    <div>
                      <span class="text-slate-800 block">Cancelled Bank Cheque</span>
                      <span class="text-[10px] text-slate-500">{{ formData().step4.cancelledChequeDoc?.fileName || 'Cancelled_Cheque_SBI.pdf' }}</span>
                    </div>
                  </div>
                  <span class="text-emerald-700 text-[11px]">&check; Verified</span>
                </div>

              </div>

              <!-- Declaration Box -->
              <div class="p-4 bg-blue-50/40 border border-blue-100 rounded-lg text-xs space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-600 font-bold">&check;</span>
                  <span class="font-semibold text-slate-800">OTR Statutory Declaration &amp; Undertaking</span>
                </div>
                <p class="text-[11px] text-slate-600 leading-relaxed font-normal">
                  The applicant organization confirms that all particulars, officer listings, signatory records, and uploaded documents in this One Time Registration (OTR) profile are authentic, legally accurate, and compliant with the Government of Rajasthan and RSLDC operational guidelines.
                </p>
                <div class="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                  <span>Profile Status: <strong class="text-emerald-700 font-semibold">Active &amp; Verified</strong></span>
                  <span>Registration ID: <strong class="text-[#0B3558] font-mono">REG/RAJ/2018/88921</strong></span>
                </div>
              </div>

            </div>
          }

        </div>
      }

    </div>
  `
})
export class ProfilePageComponent {
  private authService = inject(AuthService);
  private otrFormService = inject(OtrFormService);
  private route = inject(ActivatedRoute);

  readonly currentUser = this.authService.currentUser;
  readonly formData = this.otrFormService.formData;

  activeTab = signal<'all' | 'org' | 'officers' | 'auth' | 'bank' | 'docs'>('all');

  constructor() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && ['all', 'org', 'officers', 'auth', 'bank', 'docs'].includes(tab)) {
        this.activeTab.set(tab as any);
      } else {
        this.activeTab.set('all');
      }
    });
  }

  readonly isProfileIncomplete = computed(() => {
    const user = this.currentUser();
    if (!user) return true;
    if (user.role === 'new_user') return true;
    return user.isProfileComplete === false;
  });

  readonly userDisplayName = computed(() => {
    return this.currentUser()?.label || 'User';
  });

  readonly userChar = computed(() => {
    const name = this.userDisplayName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  });
}
