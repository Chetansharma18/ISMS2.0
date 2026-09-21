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
          <div class="bg-amber-50/90 border border-amber-300/90 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div class="flex items-start gap-4 sm:gap-5">
              
              <!-- Warning Badge Icon -->
              <div class="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <!-- Content & Actions -->
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="text-lg sm:text-xl font-black text-amber-900 tracking-tight">
                    Please complete your profile first
                  </h2>
                  <span class="px-2.5 py-0.5 rounded-full bg-amber-200/90 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                    Profile Incomplete
                  </span>
                </div>

                <p class="text-xs sm:text-sm text-amber-800 mt-2.5 leading-relaxed">
                  Your entity profile is currently incomplete. Please complete your One Time Registration (OTR) profile to register your organization as a Training Partner (TP) / Project Implementing Agency (PIA) and submit EOI proposals for state skill schemes.
                </p>

                <!-- Features requiring profile -->
                <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900 font-medium">
                  <div class="flex items-center gap-2">
                    <span class="text-amber-600 font-bold">&bull;</span>
                    <span>Organization &amp; Legal Constitution</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-amber-600 font-bold">&bull;</span>
                    <span>Officer In-Charge Directory</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-amber-600 font-bold">&bull;</span>
                    <span>Authorized Representative Documents</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-amber-600 font-bold">&bull;</span>
                    <span>Verified Bank Account for Disbursals</span>
                  </div>
                </div>

                <!-- Action Button to open Registration Form -->
                <div class="mt-6">
                  <a
                    routerLink="/registration"
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B3558] hover:bg-[#07233B] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Complete Registration / Fill OTR Form</span>
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>

              </div>

            </div>
          </div>
        </div>
      } @else {
        <!-- ====================================================================
             CASE 2: VERIFIED EXISTING USER PROFILE WITH ALL 4 SECTIONS FILLED
             ==================================================================== -->
        <div class="p-6 sm:p-8 space-y-6 max-w-6xl">
          
          <!-- Quick Tab Filter Bar (Header banner removed as requested) -->
          <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              (click)="activeTab.set('all')"
              class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
              [class.bg-[#0B3558]]="activeTab() === 'all'"
              [class.text-white]="activeTab() === 'all'"
              [class.text-slate-600]="activeTab() !== 'all'"
              [class.hover:bg-slate-100]="activeTab() !== 'all'"
            >
              All Details
            </button>
            <button
              type="button"
              (click)="activeTab.set('org')"
              class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
              [class.bg-[#0B3558]]="activeTab() === 'org'"
              [class.text-white]="activeTab() === 'org'"
              [class.text-slate-600]="activeTab() !== 'org'"
              [class.hover:bg-slate-100]="activeTab() !== 'org'"
            >
              1. Organisation Details
            </button>
            <button
              type="button"
              (click)="activeTab.set('auth')"
              class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
              [class.bg-[#0B3558]]="activeTab() === 'auth'"
              [class.text-white]="activeTab() === 'auth'"
              [class.text-slate-600]="activeTab() !== 'auth'"
              [class.hover:bg-slate-100]="activeTab() !== 'auth'"
            >
              2. Authorized Person Details
            </button>
            <button
              type="button"
              (click)="activeTab.set('bank')"
              class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
              [class.bg-[#0B3558]]="activeTab() === 'bank'"
              [class.text-white]="activeTab() === 'bank'"
              [class.text-slate-600]="activeTab() !== 'bank'"
              [class.hover:bg-slate-100]="activeTab() !== 'bank'"
            >
              3. Bank Details
            </button>
            <button
              type="button"
              (click)="activeTab.set('docs')"
              class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
              [class.bg-[#0B3558]]="activeTab() === 'docs'"
              [class.text-white]="activeTab() === 'docs'"
              [class.text-slate-600]="activeTab() !== 'docs'"
              [class.hover:bg-slate-100]="activeTab() !== 'docs'"
            >
              4. Uploaded Documents
            </button>
          </div>

          <!-- Section 1: Organisation Details -->
          @if (activeTab() === 'all' || activeTab() === 'org') {
            <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <h3 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide">Organisation Profile &amp; Constitution</h3>
                </div>
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="{ step: 1 }"
                  class="text-xs font-bold text-[#0B3558] hover:text-[#EA580C] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Section</span>
                </a>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block font-medium">TP / PIA Short Name</span>
                  <span class="font-bold text-slate-800">{{ formData().step1.shortName || 'RSLDC' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Full Legal Name</span>
                  <span class="font-bold text-slate-800">{{ formData().step1.fullName || 'Rajasthan Skill & Livelihoods Development Council Partner Ltd.' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Nature of Entity</span>
                  <span class="font-bold text-slate-800">{{ formData().step1.natureOfEntity || 'PUBLIC LIMITED' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Registration / CIN No.</span>
                  <span class="font-mono font-bold text-slate-800">{{ formData().step1.registrationNumber || 'U80302RJ2022NPL079811' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Company PAN</span>
                  <span class="font-mono font-bold text-slate-800">{{ formData().step1.companyPan || 'AAACR1234F' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">GST Registered / GSTIN</span>
                  <span class="font-bold text-slate-800">{{ formData().step1.gstin || '08AAACR1234F1Z5' }} ({{ formData().step1.gstRegistered }})</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Turnover (₹ in Lakhs)</span>
                  <span class="font-bold text-slate-800">₹ {{ formData().step1.turnOver || '450.00' }} Lakhs</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Contact Number &amp; Email</span>
                  <span class="font-bold text-slate-800">{{ formData().step1.contactNo || '0141-2700891' }} &bull; {{ formData().step1.emailId || 'partner@rsldc-skill.org' }}</span>
                </div>
                <div class="sm:col-span-2 md:col-span-3">
                  <span class="text-slate-400 block font-medium">Registered Office Address</span>
                  <span class="font-bold text-slate-800">{{ formData().step1.registeredAddress || 'Plot No. 42, Institutional Area, Jhalana Doongri, Jaipur - 302004' }}</span>
                </div>
              </div>
            </div>
          }

          <!-- Section 2: Authorized Person & Officers -->
          @if (activeTab() === 'all' || activeTab() === 'auth') {
            <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">2</span>
                  <h3 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide">Authorized Representative &amp; Officers</h3>
                </div>
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="{ step: 2 }"
                  class="text-xs font-bold text-[#0B3558] hover:text-[#EA580C] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Section</span>
                </a>
              </div>

              <!-- Authorized Person Summary -->
              <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Authorized Representative:</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span class="text-slate-400 block">Name</span>
                    <span class="font-bold text-slate-800">{{ formData().step3.name || 'Vikram Singh Mehta' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">Designation</span>
                    <span class="font-bold text-slate-800">{{ formData().step3.designation || 'Authorized Representative' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">PAN</span>
                    <span class="font-mono font-bold text-slate-800">{{ formData().step3.pan || 'BNYPM9876Q' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">Mobile &amp; Email</span>
                    <span class="font-bold text-slate-800">{{ formData().step3.mobileNo || '9829154321' }}</span>
                  </div>
                </div>
              </div>

              <!-- Officers In-Charge Directory -->
              <div class="space-y-2">
                <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Officers In-Charge Directory ({{ formData().step2.length }} Verified):</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  @for (oic of formData().step2; track oic.id) {
                    <div class="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <div class="font-bold text-slate-900">{{ oic.name || 'Dr. Rajesh Sharma' }}</div>
                        <div class="text-slate-500 text-[11px]">{{ oic.designation || 'Managing Director' }} &bull; {{ oic.mobileNo || '9829012345' }}</div>
                      </div>
                      <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        Active
                      </span>
                    </div>
                  }
                </div>
              </div>

            </div>
          }

          <!-- Section 3: Bank Details -->
          @if (activeTab() === 'all' || activeTab() === 'bank') {
            <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">3</span>
                  <h3 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide">Bank &amp; Disbursal Account Details</h3>
                </div>
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="{ step: 4 }"
                  class="text-xs font-bold text-[#0B3558] hover:text-[#EA580C] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Section</span>
                </a>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block font-medium">Bank Name</span>
                  <span class="font-bold text-slate-800">{{ formData().step4.bankName || 'State Bank of India' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Branch Name</span>
                  <span class="font-bold text-slate-800">{{ formData().step4.branchName || 'Secretariat Branch, Jaipur' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Account Number</span>
                  <span class="font-mono font-bold text-slate-800">{{ formData().step4.accountNo || '3948201948201' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">IFSC Code</span>
                  <span class="font-mono font-bold text-slate-800">{{ formData().step4.ifscCode || 'SBIN0001234' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Account Type</span>
                  <span class="font-bold text-slate-800">{{ formData().step4.accountType || 'Current Account' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Payment Transfer Mode</span>
                  <span class="font-bold text-slate-800">{{ formData().step4.transferMode || 'RTGS / NEFT' }}</span>
                </div>
              </div>
            </div>
          }

          <!-- Section 4: Uploaded Documents -->
          @if (activeTab() === 'all' || activeTab() === 'docs') {
            <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">4</span>
                  <h3 class="text-sm font-bold text-[#0B3558] uppercase tracking-wide">Uploaded &amp; Verified Documents</h3>
                </div>
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="{ step: 5 }"
                  class="text-xs font-bold text-[#0B3558] hover:text-[#EA580C] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Section</span>
                </a>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div class="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span class="font-bold text-slate-800 block">Certificate of Incorporation</span>
                      <span class="text-[10px] text-slate-400">PDF &bull; 1.8 MB</span>
                    </div>
                  </div>
                  <span class="text-emerald-600 font-bold text-[11px]">&check; Verified</span>
                </div>

                <div class="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span class="font-bold text-slate-800 block">Company PAN Card</span>
                      <span class="text-[10px] text-slate-400">PDF &bull; 850 KB</span>
                    </div>
                  </div>
                  <span class="text-emerald-600 font-bold text-[11px]">&check; Verified</span>
                </div>

                <div class="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span class="font-bold text-slate-800 block">Cancelled Cheque</span>
                      <span class="text-[10px] text-slate-400">PDF &bull; 850 KB</span>
                    </div>
                  </div>
                  <span class="text-emerald-600 font-bold text-[11px]">&check; Verified</span>
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

  activeTab = signal<'all' | 'org' | 'auth' | 'bank' | 'docs'>('all');

  constructor() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && ['all', 'org', 'auth', 'bank', 'docs'].includes(tab)) {
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
