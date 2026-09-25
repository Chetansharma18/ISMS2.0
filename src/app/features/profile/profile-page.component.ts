import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { OtrFormService } from '../registration/services/otr-form.service';
import { OtrValidationService } from '../registration/services/otr-validation.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 select-none font-sans">
      
      <!-- ====================================================================
           CASE 1: INCOMPLETE PROFILE (Integrated Full-Page Dashboard)
           ==================================================================== -->
      @if (isProfileIncomplete()) {
        <div class="p-5 sm:p-6 lg:p-7 space-y-4 max-w-6xl mx-auto font-sans" style="font-family: 'Inter', sans-serif;">
          
          <!-- Top Page Header (Matching Portal Structure) -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2.5">
                <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Profile
                </h1>
      
            
              
              </div>
              <p class="text-xs text-slate-500 font-normal">
                Finish your One Time Registration (OTR) profile to register your organization and unlock EOI proposal submissions.
              </p>
            </div>

            <!-- Right Side: Progress Indicator -->
            <div class="shrink-0">
              <div class="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.04)] border border-slate-100/60 z-10">
                <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" [attr.r]="circleRadius" stroke="#f1f5f9" stroke-width="4.5" fill="transparent"/>
                  <circle cx="32" cy="32" [attr.r]="circleRadius" [attr.stroke]="progressStrokeColor()" stroke-width="4.5" stroke-linecap="round" fill="transparent" [attr.stroke-dasharray]="circleCircumference" [attr.stroke-dashoffset]="circleDashOffset()" class="transition-all duration-700 ease-out"/>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span class="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">{{ completionPercentage() }}%</span>
                  <span class="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">DONE</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Main Progress and Sections Layout -->
          <div class="flex gap-6 sm:gap-10 mt-6 items-stretch">
            


            <!-- RIGHT COLUMN: Details & Cards -->
            <div class="flex-1 min-w-0">
              
              <!-- Section Cards Vertical List -->
              <div class="space-y-4 pt-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 font-semibold px-0.5 mb-3 gap-3 sm:gap-1">
                  <span class="uppercase tracking-wider text-[#0B3558] font-bold">Mandatory Registration Sections</span>
                  
                  <!-- Action Button -->
                  <a
                    [routerLink]="['/registration']"
                    [queryParams]="ctaQueryParams()"
                    class="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-[#0B3558] hover:bg-[#123B59] active:bg-[#07233B] text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer shrink-0 group"
                    style="color: #ffffff !important;"
                  >
                    <span>{{ ctaText() }}</span>
                    <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>

                <div class="flex flex-col gap-3">
                  @for (section of sections(); track section.id; let i = $index) {
                    <a
                      [routerLink]="['/registration']"
                      [queryParams]="{ step: section.stepNumber }"
                      class="relative group p-4 sm:p-5 rounded-xl border bg-gradient-to-br backdrop-blur-md shadow-[0_4px_20px_rgba(11,53,88,0.03)] transition-all duration-500 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
                      [class.from-[#0B3558]/10]="!section.isCompleted"
                      [class.to-[#0B3558]/[0.02]]="!section.isCompleted"
                      [class.border-[#0B3558]/20]="!section.isCompleted"
                      [class.hover:border-[#0B3558]/40]="!section.isCompleted"
                      [class.hover:shadow-[0_8px_30px_rgba(11,53,88,0.08)]]="!section.isCompleted"
                      [class.hover:-translate-y-0.5]="!section.isCompleted"
                      [class.from-emerald-50/90]="section.isCompleted"
                      [class.to-emerald-50/40]="section.isCompleted"
                      [class.border-emerald-200/60]="section.isCompleted"
                      [class.hover:border-emerald-300]="section.isCompleted"
                    >
                      <!-- Subtle Wave Background -->
                      @if (!section.isCompleted) {
                        <div class="absolute inset-0 opacity-20 pointer-events-none z-0 overflow-hidden mix-blend-multiply">
                          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" class="absolute bottom-0 w-full h-full transform translate-y-10 group-hover:translate-y-6 transition-transform duration-700">
                            <path fill="#0B3558" d="M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100 L1000,200 L0,200 Z" opacity="0.1"></path>
                            <path fill="#0B3558" d="M0,150 C200,50 400,250 600,150 C800,50 900,200 1000,150 L1000,200 L0,200 Z" opacity="0.15"></path>
                          </svg>
                        </div>
                      }

                      <!-- Mirror/Reflection Shine Effect -->
                      <div class="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out -translate-x-full group-hover:translate-x-1/2 pointer-events-none transform-gpu z-0"></div>

                      <div class="flex items-center gap-5 min-w-0 relative z-10">
                        <!-- Section Icon -->
                        <div
                          class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 relative z-10"
                          [class.bg-emerald-50]="section.isCompleted"
                          [class.text-emerald-600]="section.isCompleted"
                          [class.bg-blue-50]="!section.isCompleted && i === completedSectionsCount()"
                          [class.text-[#0B3558]]="!section.isCompleted && i === completedSectionsCount()"
                          [class.bg-slate-50]="!section.isCompleted && i > completedSectionsCount()"
                          [class.text-slate-500]="!section.isCompleted && i > completedSectionsCount()"
                        >
                          @if (section.icon === 'building') {
                            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          } @else if (section.icon === 'user-check') {
                            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          } @else if (section.icon === 'users') {
                            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          } @else {
                            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          }
                        </div>
    
                        <!-- Title and Subtitle -->
                        <div class="min-w-0">
                          <div class="flex items-center gap-1.5 mb-1">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 0{{ section.stepNumber }}</span>
                          </div>
                          <h3 class="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-[#0B3558] transition-colors truncate">
                            {{ section.title }}
                          </h3>
                          <p class="text-xs text-slate-500 truncate mt-0.5">
                            {{ section.subtitle }}
                          </p>
                        </div>
                      </div>
    
                      <!-- Right: Status Badge & Chevron -->
                      <div class="flex items-center gap-4 shrink-0 self-end sm:self-auto relative z-10">
                        <span
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide"
                          [class.bg-emerald-50]="section.isCompleted"
                          [class.text-emerald-700]="section.isCompleted"
                          [class.bg-blue-50]="!section.isCompleted && i === completedSectionsCount()"
                          [class.text-[#0B3558]]="!section.isCompleted && i === completedSectionsCount()"
                          [class.bg-slate-50]="!section.isCompleted && i > completedSectionsCount()"
                          [class.text-slate-500]="!section.isCompleted && i > completedSectionsCount()"
                        >
                          @if (section.isCompleted) {
                            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Completed</span>
                          } @else if (!section.isCompleted && i === completedSectionsCount()) {
                            <span class="w-1.5 h-1.5 rounded-full bg-[#0B3558]"></span>
                            <span>In Progress</span>
                          } @else {
                            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>Pending</span>
                          }
                        </span>
    
                        <svg class="w-4 h-4 text-slate-400 group-hover:text-[#0B3558] group-hover:translate-x-0.5 transition-all hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Notice -->
          <div class="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Government of Rajasthan Statutory Requirement: Completed OTR profile is required for submitting technical proposals under state skill schemes.</span>
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
              Profile
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
  private validationService = inject(OtrValidationService);
  private route = inject(ActivatedRoute);

  readonly currentUser = this.authService.currentUser;
  readonly formData = this.otrFormService.formData;

  activeTab = signal<'all' | 'org' | 'officers' | 'auth' | 'bank' | 'docs'>('all');

  // Math for SVG Circular Progress Ring (r = 26, viewBox 0 0 64 64)
  readonly circleRadius = 26;
  readonly circleCircumference = 2 * Math.PI * 26; // 163.363

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

  /**
   * Evaluates the 4 registration sections based on actual OTR form data & validation rules.
   */
  readonly sections = computed(() => {
    const data = this.formData();
    const isStep1Complete = this.validationService.validateStep1(data.step1).length === 0;
    const isStep3Complete = this.validationService.validateStep3(data.step3).length === 0;
    const isStep2Complete = this.validationService.validateStep2(data.step2).length === 0;
    const isStep4Complete = this.validationService.validateStep4(data.step4).length === 0;

    return [
      {
        id: 'org',
        stepNumber: 1,
        title: 'Organization & Legal Constitution',
        subtitle: 'Entity type, registration number, PAN & verified incorporation documents',
        isCompleted: isStep1Complete,
        icon: 'building'
      },
      {
        id: 'auth',
        stepNumber: 2,
        title: 'Authorized Representative Documents',
        subtitle: 'Signatory identity, PAN, Aadhaar & board resolution authorization',
        isCompleted: isStep3Complete,
        icon: 'user-check'
      },
      {
        id: 'officers',
        stepNumber: 3,
        title: 'Officer In-Charge Directory',
        subtitle: 'Key managerial personnel, designations & appointment letters',
        isCompleted: isStep2Complete,
        icon: 'users'
      },
      {
        id: 'bank',
        stepNumber: 4,
        title: 'Verified Bank Account for Disbursements',
        subtitle: 'Institutional bank account, IFSC code & uploaded cancelled cheque',
        isCompleted: isStep4Complete,
        icon: 'bank'
      }
    ];
  });

  /** Total count of fully completed sections (0 to 4) */
  readonly completedSectionsCount = computed(() => {
    return this.sections().filter(s => s.isCompleted).length;
  });

  /**
   * Dynamic profile completion percentage (0 - 100).
   * Computed from actual section validity and field completion in draft.
   */
  readonly completionPercentage = computed(() => {
    const data = this.formData();
    if (data.status === 'Submitted') return 100;

    const s1Complete = this.validationService.validateStep1(data.step1).length === 0;
    const s3Complete = this.validationService.validateStep3(data.step3).length === 0;
    const s2Complete = this.validationService.validateStep2(data.step2).length === 0;
    const s4Complete = this.validationService.validateStep4(data.step4).length === 0;

    if (s1Complete && s3Complete && s2Complete && s4Complete) {
      return 100;
    }

    // Step 1: Organization Details (Max 25%)
    const s1 = data.step1;
    const s1Fields = [s1.shortName, s1.fullName, s1.natureOfEntity, s1.registrationNumber, s1.companyPan, s1.contactNo, s1.emailId, s1.registeredAddress];
    const s1Filled = s1Fields.filter(f => !!f && f.trim().length > 0).length;
    const r1 = s1Complete ? 1 : (s1Filled / s1Fields.length);

    // Step 2 in UI (Authorized Person, step3 in data) (Max 25%)
    const s3 = data.step3;
    const s3Fields = [s3.name, s3.dob, s3.pan, s3.mobileNo];
    const s3Filled = s3Fields.filter(f => !!f && f.trim().length > 0).length;
    const r2 = s3Complete ? 1 : (s3Filled / s3Fields.length);

    // Step 3 in UI (Officer In-Charge, step2 in data) (Max 25%)
    const s2 = data.step2;
    let r3 = 0;
    if (s2Complete) {
      r3 = 1;
    } else if (s2 && s2.length > 0) {
      const o1 = s2[0];
      const s2Fields = [o1?.name, o1?.designation, o1?.mobileNo, o1?.emailId, o1?.pan];
      const s2Filled = s2Fields.filter(f => !!f && f.trim().length > 0).length;
      r3 = s2Filled / s2Fields.length;
    }

    // Step 4: Bank Details (Max 25%)
    const s4 = data.step4;
    const s4Fields = [s4.bankName, s4.branchName, s4.accountNo, s4.ifscCode];
    const s4Filled = s4Fields.filter(f => !!f && f.trim().length > 0).length;
    const r4 = s4Complete ? 1 : (s4Filled / s4Fields.length);

    const totalAverage = (r1 + r2 + r3 + r4) / 4;
    return Math.min(100, Math.max(0, Math.round(totalAverage * 100)));
  });

  /** SVG stroke dashoffset for circular progress ring */
  readonly circleDashOffset = computed(() => {
    const pct = this.completionPercentage();
    return this.circleCircumference - (pct / 100) * this.circleCircumference;
  });

  /** Dynamic color for circular SVG progress stroke */
  readonly progressStrokeColor = computed(() => {
    const pct = this.completionPercentage();
    if (pct === 100) return '#059669'; // Emerald
    if (pct >= 50) return '#0B3558';   // Navy Blue
    return '#d97706';                  // Saffron / Amber
  });

  /** Gradient for the horizontal progress bar */
  readonly progressBarGradient = computed(() => {
    const pct = this.completionPercentage();
    if (pct === 100) return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    return 'linear-gradient(90deg, #0B3558 0%, #800020 55%, #ea580c 100%)';
  });

  /** Primary CTA button text */
  readonly ctaText = computed(() => {
    const pct = this.completionPercentage();
    const count = this.completedSectionsCount();
    if (pct === 0) return 'Start Registration';
    if (count === 4 || pct === 100) return 'Profile Complete';
    return 'Continue Registration';
  });

  /** First incomplete step for dynamic routing */
  readonly nextIncompleteStep = computed(() => {
    const list = this.sections();
    const firstIncomplete = list.find(s => !s.isCompleted);
    return firstIncomplete ? firstIncomplete.stepNumber : 1;
  });

  /** Dynamic query parameters for CTA button navigation */
  readonly ctaQueryParams = computed(() => {
    if (this.completedSectionsCount() === 4) {
      return { step: 5 };
    }
    return { step: this.nextIncompleteStep() };
  });

  /** Contextual status and encouragement message */
  readonly contextualMessage = computed(() => {
    const count = this.completedSectionsCount();
    const remaining = 4 - count;
    if (count === 4) {
      return 'Great job! All 4 sections are completed and ready for submission.';
    }
    if (count > 0) {
      return `You're almost there! Complete the remaining ${remaining} section${remaining > 1 ? 's' : ''} to finish your organization profile.`;
    }
    return 'Get started with your registration to access EOI proposals and state skill schemes.';
  });
}
