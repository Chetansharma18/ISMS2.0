import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor, AsyncPipe, DatePipe, DecimalPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EoiStateService, UserProfile, EoiApplication } from '../../core/services/eoi-state.service';
import { EoiService } from '../eoi/application-wizard/services/eoi.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { GradeBadgeComponent } from '../../shared/components/grade-badge/grade-badge.component';
import { Observable, Subscription } from 'rxjs';

export interface OfficialDocItem {
  s_no: number;
  doc_title: string;
  doc_category: string;
  file_name: string;
  file_size: string;
  upload_date: string;
  mandatory: boolean;
  status: 'Verified' | 'Pending';
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIf,
    NgFor,
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    StatusBadgeComponent,
    GradeBadgeComponent
  ],
  template: `
    <div class="h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-800 antialiased selection:bg-[#002244] selection:text-white overflow-hidden">
      <!-- Portal Post-Login Header with Dual Emblems & User Profile Information -->
      <app-header class="shrink-0"></app-header>

      <div class="flex flex-1 min-h-0 w-full overflow-hidden">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block shrink-0 h-full"></app-sidebar>

        <main class="flex-1 min-w-0 min-h-0 w-full px-3 sm:px-5 py-4 overflow-y-auto overflow-x-hidden">
          
          <!-- Top Title & Action Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 mb-6">
            <div class="flex items-center gap-3">
              <h1 class="text-2xl sm:text-3xl font-bold text-[#002244] tracking-tight">
                Entity &amp; Applicant Profile
              </h1>
              <ng-container *ngIf="userProfile$ | async as profile">
                <span *ngIf="!profile.isRegistered || profile.userState === 'new'" 
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Incomplete</span>
                </span>
                <span *ngIf="profile.isRegistered && profile.userState !== 'new'" 
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span>✓ Verified TP</span>
                </span>
              </ng-container>
            </div>

            <div class="flex items-center gap-2.5">
            </div>
          </div>

          <!-- Toast Notification -->
          <div *ngIf="toastMessage" class="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
            <div class="flex items-center gap-2">
              <span class="text-emerald-700 text-base">✓</span>
              <span>{{ toastMessage }}</span>
            </div>
            <button (click)="toastMessage = null" class="text-emerald-700 hover:text-emerald-900 text-sm font-bold">✕</button>
          </div>

          <div *ngIf="userProfile$ | async as profile" class="w-full space-y-6">

            <!-- ================= STATE 1: INCOMPLETE PROFILE (SIMPLE CLEAN MESSAGE) ================= -->
            <div *ngIf="!profile.isRegistered || profile.userState === 'new'" class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-2xl shadow-xs">
                    ⚠️
                  </div>
                  <div class="space-y-1">
                    <h2 class="text-lg sm:text-xl font-bold text-[#002244] tracking-tight">
                      Please Complete Your Profile First
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                      Your profile is currently incomplete. Please complete your profile first to apply for tenders and access all portal services.
                    </p>
                  </div>
                </div>

                <div class="shrink-0 w-full sm:w-auto">
                  <a 
                    routerLink="/auth/register" 
                    class="w-full sm:w-auto px-5 py-2.5 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs sm:text-sm rounded-md transition-all shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>Complete Profile</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- ================= STATE 2: REGISTERED USER PROFILE SECTIONS (ALL 4 SECTIONS) ================= -->
            <ng-container *ngIf="profile.isRegistered && profile.userState !== 'new'">

            <!-- ================= 1. ORGANISATION / COMPANY BASIC DETAILS (17 FIELDS) ================= -->
            <div *ngIf="activeSection === 1" class="bg-white border border-slate-200 rounded-xs p-6 sm:p-7 shadow-sm space-y-5">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[#002244] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-xs bg-[#002244]/10 text-[#002244] flex items-center justify-center font-bold text-xs">1</span>
                    <span>Organisation / Company Basic Details (17 Fields)</span>
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">Corporate entity details, legal incorporation, address, and turnover</p>
                </div>
                
                <div class="flex items-center gap-2">
                  <button 
                    *ngIf="editingSection !== 1"
                    (click)="startEditingSection(1)"
                    class="px-3.5 py-1.5 bg-slate-100 hover:bg-[#002244] hover:text-white text-[#002244] border border-slate-300 text-xs sm:text-[13px] font-bold rounded-xs transition-colors inline-flex items-center gap-1 cursor-pointer">
                    <span>Edit Section</span>
                  </button>
                </div>
              </div>

              <!-- VIEW MODE: SECTION 1 (17 Fields) -->
              <div *ngIf="editingSection !== 1" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-5 text-xs sm:text-[13px]">
                <div>
                  <span class="text-slate-500 font-medium block text-xs">1. Application No.</span>
                  <span class="font-mono font-bold text-[#002244] block mt-0.5 text-xs sm:text-[13px]">{{ orgData.application_no }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">2. TP/PIA Full Name <span class="text-red-500">*</span></span>
                  <span class="font-bold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.tp_full_name }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">3. TP/PIA Short Name <span class="text-red-500">*</span></span>
                  <span class="font-mono font-semibold text-slate-800 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.tp_short_name }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">4. Registration Number</span>
                  <span class="font-mono font-bold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.registration_number }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">5. Organisation Contact No. <span class="text-red-500">*</span></span>
                  <span class="font-bold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.organisation_contact_no }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">6. Company Email-ID <span class="text-red-500">*</span></span>
                  <span class="font-mono text-slate-900 font-semibold block mt-0.5 text-xs sm:text-[13px]">{{ orgData.company_email }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">7. Organisation PAN No.</span>
                  <span class="font-mono font-bold text-[#002244] block mt-0.5 text-xs sm:text-[13px]">
                    {{ orgData.organisation_pan }}
                    <span class="ml-1 text-[11px] text-emerald-700 font-sans font-bold">✓ Validated</span>
                  </span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">8. Website</span>
                  <a *ngIf="orgData.website" [href]="'https://' + orgData.website.replace('https://', '').replace('http://', '')" target="_blank" class="text-blue-700 hover:underline font-mono font-semibold block mt-0.5 truncate text-xs sm:text-[13px]">
                    {{ orgData.website }}
                  </a>
                  <span *ngIf="!orgData.website" class="text-slate-400 italic font-mono block mt-0.5 text-xs sm:text-[13px]">—</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">10. State / UT <span class="text-red-500">*</span></span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.state_ut }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">11. District <span class="text-red-500">*</span></span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.district }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">12. Pincode <span class="text-red-500">*</span></span>
                  <span class="font-mono font-bold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.pincode }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">13. Turn Over (₹ in Lakhs) <span class="text-red-500">*</span></span>
                  <span class="font-bold text-[#002244] block mt-0.5 text-xs sm:text-[13px]">₹ {{ orgData.turnover_lakhs }} Lakhs</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">14. Date of Registration</span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.date_of_registration }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">15. State Where Registered</span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.state_where_registered }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">16. Type of Business / Activity</span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.type_of_business }}</span>
                </div>

                <div class="sm:col-span-2 lg:col-span-3">
                  <span class="text-slate-500 font-medium block text-xs">9. Registered Office Address <span class="text-red-500">*</span></span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.registered_address }}</span>
                </div>

                <div class="sm:col-span-2 lg:col-span-3">
                  <span class="text-slate-500 font-medium block text-xs">17. Postal / Communication Address <span class="text-red-500">*</span></span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ orgData.postal_address }}</span>
                </div>
              </div>

              <!-- EDIT MODE: SECTION 1 -->
              <div *ngIf="editingSection === 1" class="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-xs border border-slate-300">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span class="font-bold text-xs sm:text-[13px] text-[#002244] uppercase tracking-wide">Editing: Organisation Details</span>
                  <span class="text-xs text-slate-500">Fields marked with <span class="text-red-500 font-bold">*</span> are mandatory</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-[13px]">
                  <div class="sm:col-span-2 lg:col-span-2">
                    <label class="block font-bold text-slate-700 mb-1">2. TP/PIA Full Name <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="orgEdit.tp_full_name" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] font-bold text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">3. TP/PIA Short Name <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="orgEdit.tp_short_name" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">4. Registration Number</label>
                    <input [(ngModel)]="orgEdit.registration_number" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] font-mono text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">5. Contact No. <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="orgEdit.organisation_contact_no" maxlength="12" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">6. Company Email-ID <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="orgEdit.company_email" type="email" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">7. Organisation PAN</label>
                    <input [(ngModel)]="orgEdit.organisation_pan" maxlength="10" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 uppercase font-mono focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">8. Website</label>
                    <input [(ngModel)]="orgEdit.website" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">10. State / UT <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="orgEdit.state_ut" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">11. District <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="orgEdit.district" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">12. Pincode <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="orgEdit.pincode" maxlength="6" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 font-mono focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">13. Turn Over (₹ in Lakhs) <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="orgEdit.turnover_lakhs" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 font-bold focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">14. Date of Registration</label>
                    <input [(ngModel)]="orgEdit.date_of_registration" type="date" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">15. State Where Registered</label>
                    <input [(ngModel)]="orgEdit.state_where_registered" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">16. Type of Business / Activity</label>
                    <input [(ngModel)]="orgEdit.type_of_business" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div class="sm:col-span-2 lg:col-span-3">
                    <label class="block font-bold text-slate-700 mb-1">9. Registered Office Address <span class="text-red-500">*</span></label>
                    <textarea [(ngModel)]="orgEdit.registered_address" rows="2" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]"></textarea>
                  </div>

                  <div class="sm:col-span-2 lg:col-span-3">
                    <label class="block font-bold text-slate-700 mb-1">17. Postal / Communication Address <span class="text-red-500">*</span></label>
                    <textarea [(ngModel)]="orgEdit.postal_address" rows="2" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]"></textarea>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                  <button 
                    (click)="cancelEditing()"
                    class="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs sm:text-[13px] rounded-xs hover:bg-slate-100 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button 
                    (click)="saveSection(1)"
                    class="px-5 py-2 bg-[#002244] text-white font-bold text-xs sm:text-[13px] rounded-xs hover:bg-[#003366] transition-colors shadow-2xs cursor-pointer">
                    ✓ Save Section 1 Details
                  </button>
                </div>
              </div>
            </div>

            <!-- ================= 2. AUTHORIZED PERSON DETAILS (17 FIELDS) ================= -->
            <div *ngIf="activeSection === 2" class="bg-white border border-slate-200 rounded-xs p-6 sm:p-7 shadow-sm space-y-5">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[#002244] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-xs bg-[#002244]/10 text-[#002244] flex items-center justify-center font-bold text-xs">2</span>
                    <span>Authorized Person Details (Organisation Level) (17 Fields)</span>
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">Authorized signatory credentials, Aadhaar e-KYC, identity proofs, and contact</p>
                </div>
                
                <div class="flex items-center gap-2">
                  <button 
                    *ngIf="editingSection !== 2"
                    (click)="startEditingSection(2)"
                    class="px-3.5 py-1.5 bg-slate-100 hover:bg-[#002244] hover:text-white text-[#002244] border border-slate-300 text-xs sm:text-[13px] font-bold rounded-xs transition-colors inline-flex items-center gap-1 cursor-pointer">
                    <span>Edit Section</span>
                  </button>
                </div>
              </div>

              <!-- VIEW MODE: SECTION 2 (17 Fields) -->
              <div *ngIf="editingSection !== 2" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-5 text-xs sm:text-[13px]">
                <div>
                  <span class="text-slate-500 font-medium block text-xs">1. Name <span class="text-red-500">*</span></span>
                  <span class="font-bold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_name }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">2. S/O, D/O, W/O</span>
                  <span class="font-semibold text-slate-800 block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_guardian_name }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">3. Date of Birth</span>
                  <span class="font-mono text-slate-800 font-semibold block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_dob }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">4. Age</span>
                  <span class="font-bold text-slate-800 block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_age }} Years</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">5. Designation <span class="text-red-500">*</span></span>
                  <span class="font-bold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_designation }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">6. Mobile No. <span class="text-red-500">*</span></span>
                  <span class="font-mono font-bold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_mobile }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">7. Email-Id <span class="text-red-500">*</span></span>
                  <span class="font-mono text-slate-900 font-semibold block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_email }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">8. State</span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_state }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">10. PAN <span class="text-red-500">*</span></span>
                  <span class="font-mono font-bold text-[#002244] block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_pan }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">11. Aadhaar No.</span>
                  <span class="font-mono font-bold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">
                    {{ authData.auth_aadhaar }}
                    <span class="ml-1 text-[11px] text-emerald-700 font-sans font-bold">🔒 e-Sign Active</span>
                  </span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">12. Type ID Proof</span>
                  <span class="font-semibold text-slate-800 block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_id_proof_type }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">13. ID No.</span>
                  <span class="font-mono font-bold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_id_number }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">14. Bhamashah / Jan Aadhaar</span>
                  <span class="font-mono text-slate-800 font-semibold block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_bhamashah || '—' }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">15. Voter Id No.</span>
                  <span class="font-mono text-slate-800 font-semibold block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_voter_id || '—' }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">16. Passport No.</span>
                  <span class="font-mono text-slate-800 font-semibold block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_passport_no || '—' }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">17. Service Tax No.</span>
                  <span class="font-mono text-slate-800 font-semibold block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_service_tax_no || '—' }}</span>
                </div>

                <div class="sm:col-span-2 lg:col-span-3">
                  <span class="text-slate-500 font-medium block text-xs">9. Residence Address</span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ authData.auth_residence_address }}</span>
                </div>
              </div>

              <!-- EDIT MODE: SECTION 2 -->
              <div *ngIf="editingSection === 2" class="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-xs border border-slate-300">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span class="font-bold text-xs sm:text-[13px] text-[#002244] uppercase tracking-wide">Editing: Authorized Person Details</span>
                  <span class="text-xs text-slate-500">Fields marked with <span class="text-red-500 font-bold">*</span> are mandatory</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-[13px]">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">1. Full Name <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="authEdit.auth_name" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] font-bold text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">2. S/O, D/O, W/O (Guardian)</label>
                    <input [(ngModel)]="authEdit.auth_guardian_name" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">3. Date of Birth</label>
                    <input [(ngModel)]="authEdit.auth_dob" type="date" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">4. Age</label>
                    <input [(ngModel)]="authEdit.auth_age" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">5. Designation <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="authEdit.auth_designation" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">6. Mobile No. <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="authEdit.auth_mobile" maxlength="10" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">7. Email-Id <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="authEdit.auth_email" type="email" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">8. State</label>
                    <input [(ngModel)]="authEdit.auth_state" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">10. PAN <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="authEdit.auth_pan" maxlength="10" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 uppercase font-mono focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">11. Aadhaar No.</label>
                    <input [(ngModel)]="authEdit.auth_aadhaar" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 font-mono focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">12. ID Proof Type</label>
                    <input [(ngModel)]="authEdit.auth_id_proof_type" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">13. ID Number</label>
                    <input [(ngModel)]="authEdit.auth_id_number" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 font-mono focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div class="sm:col-span-2 lg:col-span-3">
                    <label class="block font-bold text-slate-700 mb-1">9. Residence Address</label>
                    <textarea [(ngModel)]="authEdit.auth_residence_address" rows="2" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]"></textarea>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                  <button 
                    (click)="cancelEditing()"
                    class="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs sm:text-[13px] rounded-xs hover:bg-slate-100 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button 
                    (click)="saveSection(2)"
                    class="px-5 py-2 bg-[#002244] text-white font-bold text-xs sm:text-[13px] rounded-xs hover:bg-[#003366] transition-colors shadow-2xs cursor-pointer">
                    ✓ Save Section 2 Details
                  </button>
                </div>
              </div>
            </div>

            <!-- ================= 3. BANK DETAILS (9 FIELDS) ================= -->
            <div *ngIf="activeSection === 3" class="bg-white border border-slate-200 rounded-xs p-6 sm:p-7 shadow-sm space-y-5">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[#002244] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-xs bg-[#002244]/10 text-[#002244] flex items-center justify-center font-bold text-xs">3</span>
                    <span>Bank Details (9 Fields)</span>
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">Government PFMS verified bank mandate for electronic EMD refunds and grant transfers</p>
                </div>
                
                <div class="flex items-center gap-2">
                  <button 
                    *ngIf="editingSection !== 3"
                    (click)="startEditingSection(3)"
                    class="px-3.5 py-1.5 bg-slate-100 hover:bg-[#002244] hover:text-white text-[#002244] border border-slate-300 text-xs sm:text-[13px] font-bold rounded-xs transition-colors inline-flex items-center gap-1 cursor-pointer">
                    <span>Edit Section</span>
                  </button>
                </div>
              </div>

              <!-- VIEW MODE: SECTION 3 (9 Fields) -->
              <div *ngIf="editingSection !== 3" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-5 text-xs sm:text-[13px]">
                <div>
                  <span class="text-slate-500 font-medium block text-xs">1. Name of the Bank <span class="text-red-500">*</span></span>
                  <span class="font-bold text-[#002244] block mt-0.5 text-xs sm:text-[13px]">{{ bankData.bank_name }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">2. Account No. <span class="text-red-500">*</span></span>
                  <span class="font-mono font-bold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ bankData.bank_account_no }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">3. IFSC Code <span class="text-red-500">*</span></span>
                  <span class="font-mono font-bold text-[#002244] block mt-0.5 text-xs sm:text-[13px]">{{ bankData.bank_ifsc }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">4. Type of Account <span class="text-red-500">*</span></span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ bankData.bank_account_type }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">5. Mode of Electronic Transfer</span>
                  <span class="font-medium text-slate-800 block mt-0.5 text-xs sm:text-[13px]">{{ bankData.bank_transfer_mode }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">6. Branch Name <span class="text-red-500">*</span></span>
                  <span class="font-semibold text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ bankData.bank_branch_name }}</span>
                </div>

                <div>
                  <span class="text-slate-500 font-medium block text-xs">7. MICR Code</span>
                  <span class="font-mono font-semibold text-slate-800 block mt-0.5 text-xs sm:text-[13px]">{{ bankData.bank_micr || '—' }}</span>
                </div>

                <div class="sm:col-span-2 lg:col-span-2">
                  <span class="text-slate-500 font-medium block text-xs">8. Branch Address <span class="text-red-500">*</span></span>
                  <span class="font-medium text-slate-900 block mt-0.5 text-xs sm:text-[13px]">{{ bankData.bank_branch_address }}</span>
                </div>

                <div class="sm:col-span-2 lg:col-span-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span class="text-slate-500 font-medium block text-xs">9. Uploaded Cancelled Cheque / Bank Passbook</span>
                    <span class="font-mono text-slate-800 font-bold text-xs sm:text-[13px] mt-0.5 flex items-center gap-1.5">
                      <span>📎</span>
                      <span>{{ bankData.bank_cancelled_cheque_doc }}</span>
                      <span class="text-xs text-emerald-700 font-sans font-bold">✓ Uploaded</span>
                    </span>
                  </div>
                  <button 
                    (click)="downloadDoc(bankData.bank_cancelled_cheque_doc)"
                    class="px-3.5 py-1.5 bg-slate-100 hover:bg-[#002244] hover:text-white text-[#002244] text-xs sm:text-[13px] font-bold rounded-xs border border-slate-300 transition-colors cursor-pointer inline-flex items-center gap-1.5">
                    <span>📥</span>
                    <span>Download Cheque Proof</span>
                  </button>
                </div>
              </div>

              <!-- EDIT MODE: SECTION 3 -->
              <div *ngIf="editingSection === 3" class="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-xs border border-slate-300">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span class="font-bold text-xs sm:text-[13px] text-[#002244] uppercase tracking-wide">Editing: Bank Details &amp; Mandate</span>
                  <span class="text-xs text-slate-500">Fields marked with <span class="text-red-500 font-bold">*</span> are mandatory</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-[13px]">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">1. Bank Name <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="bankEdit.bank_name" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] font-bold text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">2. Account Number <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="bankEdit.bank_account_no" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">3. IFSC Code <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="bankEdit.bank_ifsc" maxlength="11" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">4. Account Type <span class="text-red-500">*</span></label>
                    <select [(ngModel)]="bankEdit.bank_account_type" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]">
                      <option value="Current Account">Current Account</option>
                      <option value="Savings Account">Savings Account</option>
                      <option value="Cash Credit / Overdraft">Cash Credit / Overdraft</option>
                    </select>
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">5. Transfer Mode</label>
                    <input [(ngModel)]="bankEdit.bank_transfer_mode" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">6. Branch Name <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="bankEdit.bank_branch_name" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">7. MICR Code</label>
                    <input [(ngModel)]="bankEdit.bank_micr" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 font-mono focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>

                  <div class="sm:col-span-2 lg:col-span-2">
                    <label class="block font-bold text-slate-700 mb-1">8. Branch Address <span class="text-red-500">*</span></label>
                    <textarea [(ngModel)]="bankEdit.bank_branch_address" rows="2" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]"></textarea>
                  </div>

                  <div class="sm:col-span-2 lg:col-span-3">
                    <label class="block font-bold text-slate-700 mb-1">9. Cancelled Cheque / Bank Passbook Document</label>
                    <input [(ngModel)]="bankEdit.bank_cancelled_cheque_doc" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-slate-900 font-mono focus:outline-none focus:border-[#002244] text-xs sm:text-[13px]" />
                  </div>
                </div>

                <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                  <button 
                    (click)="cancelEditing()"
                    class="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs sm:text-[13px] rounded-xs hover:bg-slate-100 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button 
                    (click)="saveSection(3)"
                    class="px-5 py-2 bg-[#002244] text-white font-bold text-xs sm:text-[13px] rounded-xs hover:bg-[#003366] transition-colors shadow-2xs cursor-pointer">
                    ✓ Save Section 3 Details
                  </button>
                </div>
              </div>
            </div>

            <!-- ================= 4. OFFICIAL UPLOADED DOCUMENTS CHECKLIST (12 DOCS) ================= -->
            <div *ngIf="activeSection === 4" class="bg-white border border-slate-200 rounded-xs p-6 sm:p-7 shadow-sm space-y-5">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[#002244] flex items-center gap-2">
                    <span class="w-6 h-6 rounded-xs bg-[#002244]/10 text-[#002244] flex items-center justify-center font-bold text-xs">4</span>
                    <span>Official Uploaded Documents Checklist (12 Documents per Spec)</span>
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">Statutory certificates, audit balance sheets, pan, GST, and affidavits</p>
                </div>
                
                <div class="flex items-center gap-2">
                  <button 
                    *ngIf="editingSection !== 4"
                    (click)="startEditingSection(4)"
                    class="px-3.5 py-1.5 bg-slate-100 hover:bg-[#002244] hover:text-white text-[#002244] border border-slate-300 text-xs sm:text-[13px] font-bold rounded-xs transition-colors inline-flex items-center gap-1 cursor-pointer">
                    <span>Manage / Replace Docs</span>
                  </button>
                </div>
              </div>

              <!-- Documents Table -->
              <div class="overflow-x-auto border border-slate-200 rounded-xs shadow-sm">
                <table class="w-full min-w-[720px] text-xs sm:text-[13px] text-left border-collapse">
                  <thead>
                    <tr class="bg-[#002244] text-white border-b-2 border-amber-500">
                      <th class="py-3 px-3 font-bold w-12 text-center text-xs tracking-wider uppercase border-r border-[#0e3b6e]">S.No.</th>
                      <th class="py-3 px-3 font-bold text-xs tracking-wider uppercase border-r border-[#0e3b6e]">Document Title &amp; Category</th>
                      <th class="py-3 px-3 font-bold text-xs tracking-wider uppercase border-r border-[#0e3b6e]">Uploaded File</th>
                      <th class="py-3 px-3 font-bold text-center text-xs tracking-wider uppercase border-r border-[#0e3b6e]">Size</th>
                      <th class="py-3 px-3 font-bold text-center text-xs tracking-wider uppercase border-r border-[#0e3b6e]">Status</th>
                      <th class="py-3 px-3 font-bold text-right text-xs tracking-wider uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr *ngFor="let doc of officialDocs" class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-3 px-3 font-mono font-bold text-slate-500 text-center border-r border-slate-200">{{ doc.s_no }}</td>
                      <td class="py-3 px-3 border-r border-slate-200">
                        <div class="font-bold text-slate-900">{{ doc.doc_title }}</div>
                        <div class="text-xs text-slate-500 mt-0.5">{{ doc.doc_category }}</div>
                      </td>
                      <td class="py-3 px-3 border-r border-slate-200">
                        <div class="flex items-center gap-2">
                          <span class="px-1.5 py-0.5 bg-red-100 text-red-700 font-bold text-xs border border-red-200 rounded-xs">PDF</span>
                          <span class="font-mono text-slate-800 font-medium truncate max-w-[200px]" [title]="doc.file_name">{{ doc.file_name }}</span>
                        </div>
                        <div class="text-xs text-slate-400 font-mono mt-0.5">Uploaded: {{ doc.upload_date }}</div>
                      </td>
                      <td class="py-3 px-3 font-mono text-slate-600 text-center border-r border-slate-200">{{ doc.file_size }}</td>
                      <td class="py-3 px-3 text-center border-r border-slate-200">
                        <span class="font-bold text-emerald-700 text-xs">
                          ✓ Verified
                        </span>
                      </td>
                      <td class="py-3 px-3 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button 
                            (click)="downloadDoc(doc.file_name)"
                            class="p-1.5 hover:bg-slate-200 text-slate-600 hover:text-[#002244] transition-colors cursor-pointer rounded-xs"
                            title="Download PDF">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                          </button>
                          <button 
                            *ngIf="editingSection === 4"
                            (click)="replaceDocument(doc)"
                            class="px-2.5 py-1 bg-[#002244] text-white font-bold text-xs rounded-xs hover:bg-[#003366] transition-colors shadow-2xs cursor-pointer">
                            Replace
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div *ngIf="editingSection === 4" class="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span class="text-xs text-slate-500 font-medium">Click "Replace" on any document row to update with a new PDF (Max 5MB).</span>
                <button 
                  (click)="editingSection = null"
                  class="px-4 py-1.5 bg-[#002244] text-white text-xs sm:text-[13px] font-bold rounded-xs hover:bg-[#003366] transition-colors cursor-pointer">
                  Done Managing
                </button>
              </div>
            </div>

            </ng-container>

          </div>

        </main>
      </div>

    </div>
  `
})
export class ProfileComponent implements OnInit, OnDestroy {
  userProfile$!: Observable<UserProfile>;
  history$!: Observable<EoiApplication[]>;

  activeSection: number = 1; // 1 = org, 2 = auth, 3 = bank, 4 = docs
  editingSection: number | null = null;
  toastMessage: string | null = null;

  private routeSub!: Subscription;

  // SECTION 1: Organisation / Company Basic Details (17 Fields)
  orgData = {
    application_no: 'ISMS-EOI-2026-9871',
    tp_full_name: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
    tp_short_name: 'Apex Skills',
    registration_number: 'ISMS-REG-2026-8819',
    organisation_contact_no: '0141-2789456',
    company_email: 'info@apextechnical.in',
    organisation_pan: 'AABCA1294F',
    website: 'www.apextechnical.in',
    registered_address: 'Unit 402, Bharat Technology Hub, Sector 18, MIDC Industrial Area',
    state_ut: 'Rajasthan',
    district: 'Jaipur',
    pincode: '302022',
    turnover_lakhs: '485.50',
    date_of_registration: '2015-11-04',
    state_where_registered: 'Rajasthan',
    type_of_business: 'Skill Training Provider / Private Limited Company',
    postal_address: 'Plot No. 45, Institutional Area, Jhalana Doongri, Jaipur - 302004'
  };
  orgEdit = { ...this.orgData };

  // SECTION 2: Authorized Person Details (17 Fields)
  authData = {
    auth_name: 'Vikramaditya Sharma',
    auth_guardian_name: 'Late Shri Mohan Lal Sharma',
    auth_dob: '1984-06-15',
    auth_age: '42',
    auth_designation: 'Managing Director & Authorized Signatory',
    auth_mobile: '9820144520',
    auth_email: 'v.sharma@apextechnical.in',
    auth_state: 'Rajasthan',
    auth_residence_address: 'B-12, Malviya Nagar, Jaipur, Rajasthan - 302017',
    auth_pan: 'ABCPR5678K',
    auth_aadhaar: '8921-4432-1109',
    auth_id_proof_type: 'Aadhaar Card',
    auth_id_number: '8921-4432-1109',
    auth_bhamashah: 'BHAM-8849-21',
    auth_voter_id: 'RJ/01/045/882190',
    auth_passport_no: 'Z8849201',
    auth_service_tax_no: '08AAACA1234C1ZP'
  };
  authEdit = { ...this.authData };

  // SECTION 3: Bank Details (9 Fields)
  bankData = {
    bank_name: 'State Bank of India',
    bank_account_no: '39480124891',
    bank_ifsc: 'SBIN0004123',
    bank_account_type: 'Current Account',
    bank_transfer_mode: 'RTGS / NEFT / ECS / CBS',
    bank_branch_name: 'Commercial Branch, M.I. Road, Jaipur',
    bank_micr: '302002014',
    bank_branch_address: 'Commercial Complex, Sitapura, Jaipur, Rajasthan - 302022',
    bank_cancelled_cheque_doc: 'cancelled_cheque_sbi_current.pdf'
  };
  bankEdit = { ...this.bankData };

  // SECTION 4: Official Uploaded Documents Checklist (12 Documents)
  officialDocs: OfficialDocItem[] = [
    { s_no: 1, doc_title: 'Certificate of Incorporation / Society Reg / Trust Deed', doc_category: 'Legal Constitution Proof', file_name: 'Certificate_of_Incorporation_Apex.pdf', file_size: '1.4 MB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 2, doc_title: 'Permanent Account Number (PAN) Card of Entity', doc_category: 'Tax & Identification Proof', file_name: 'PAN_Card_Apex_Technical.pdf', file_size: '420 KB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 3, doc_title: 'GSTIN Registration Certificate', doc_category: 'Tax & Compliance Proof', file_name: 'GST_Registration_Certificate.pdf', file_size: '680 KB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 4, doc_title: 'Audited Balance Sheet & P&L (FY 2024-25)', doc_category: 'Financial Capability Proof', file_name: 'Audited_Balance_Sheet_2024_25.pdf', file_size: '2.8 MB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 5, doc_title: 'Audited Balance Sheet & P&L (FY 2023-24)', doc_category: 'Financial Capability Proof', file_name: 'Audited_Balance_Sheet_2023_24.pdf', file_size: '2.5 MB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 6, doc_title: 'Audited Balance Sheet & P&L (FY 2022-23)', doc_category: 'Financial Capability Proof', file_name: 'Audited_Balance_Sheet_2022_23.pdf', file_size: '2.1 MB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 7, doc_title: 'CA Certified Turnover & Net Worth Certificate (UDIN)', doc_category: 'Financial Certification', file_name: 'CA_Turnover_Certificate_UDIN.pdf', file_size: '890 KB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 8, doc_title: 'Authorized Signatory Aadhaar / Official ID Proof', doc_category: 'Signatory Identity Proof', file_name: 'Auth_Signatory_Aadhaar_eKYC.pdf', file_size: '510 KB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 9, doc_title: 'Board Resolution / Power of Attorney for Signatory', doc_category: 'Authorization Mandate', file_name: 'Board_Resolution_Authorization.pdf', file_size: '760 KB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 10, doc_title: 'Bank Cancelled Cheque / Passbook Mandate', doc_category: 'Bank Account Proof', file_name: 'cancelled_cheque_sbi_current.pdf', file_size: '920 KB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 11, doc_title: 'Prior Skill Training Experience Completion Certificates', doc_category: 'Technical Experience Proof', file_name: 'Previous_Experience_Certificates.pdf', file_size: '3.4 MB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' },
    { s_no: 12, doc_title: 'Non-Debarment Affidavit on ₹500 Non-Judicial Stamp', doc_category: 'Statutory Affidavit', file_name: 'Non_Debarment_Affidavit_Stamp.pdf', file_size: '1.1 MB', upload_date: '12-Jan-2026', mandatory: true, status: 'Verified' }
  ];

  constructor(
    private eoiState: EoiStateService,
    private eoiService: EoiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userProfile$ = this.eoiState.userProfile$;
    this.history$ = this.eoiState.history$;

    // Sync from state / localStorage if available
    this.loadStateFromStorage();

    // Listen to query parameters to switch active section
    this.routeSub = this.route.queryParams.subscribe(params => {
      if (params['section']) {
        const sec = parseInt(params['section'], 10);
        if (!isNaN(sec) && sec >= 1 && sec <= 4) {
          this.activeSection = sec;
        } else {
          this.activeSection = 1;
        }
      } else {
        this.activeSection = 1; // Default to section 1
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  private loadStateFromStorage(): void {
    const profile = this.eoiState.getProfile();
    if (profile && profile.organization) {
      this.orgData.tp_full_name = profile.organization.name || this.orgData.tp_full_name;
      this.orgData.organisation_pan = profile.organization.pan || this.orgData.organisation_pan;
      this.orgData.registered_address = profile.organization.registeredAddress || this.orgData.registered_address;
      this.orgData.state_ut = profile.organization.state || this.orgData.state_ut;
      this.orgData.pincode = profile.organization.pincode || this.orgData.pincode;
      this.orgData.website = profile.organization.website || this.orgData.website;
      this.orgData.registration_number = profile.registrationNumber || this.orgData.registration_number;
    }
    if (profile && profile.personal) {
      this.authData.auth_name = profile.personal.fullName || this.authData.auth_name;
      this.authData.auth_designation = profile.personal.designation || this.authData.auth_designation;
      this.authData.auth_email = profile.personal.email || this.authData.auth_email;
      this.authData.auth_mobile = profile.personal.mobile || this.authData.auth_mobile;
    }
    if (profile && profile.bankDetails) {
      this.bankData.bank_name = profile.bankDetails.bankName || this.bankData.bank_name;
      this.bankData.bank_account_no = profile.bankDetails.accountNumber || this.bankData.bank_account_no;
      this.bankData.bank_ifsc = profile.bankDetails.ifscCode || this.bankData.bank_ifsc;
      this.bankData.bank_account_type = profile.bankDetails.accountType || this.bankData.bank_account_type;
      this.bankData.bank_branch_name = profile.bankDetails.branchName || this.bankData.bank_branch_name;
    }

    this.orgEdit = { ...this.orgData };
    this.authEdit = { ...this.authData };
    this.bankEdit = { ...this.bankData };
  }

  selectSection(sec: number): void {
    this.activeSection = sec;
    this.editingSection = null;
    if (sec > 0) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { section: sec },
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { section: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  startEditingSection(sec: number): void {
    this.activeSection = sec;
    this.editingSection = sec;
    if (sec === 1) this.orgEdit = { ...this.orgData };
    if (sec === 2) this.authEdit = { ...this.authData };
    if (sec === 3) this.bankEdit = { ...this.bankData };
  }

  cancelEditing(): void {
    this.editingSection = null;
  }

  saveSection(sec: number): void {
    const current = this.eoiState.getProfile();

    if (sec === 1) {
      this.orgData = { ...this.orgEdit };
      this.eoiState.updateProfile({
        organization: {
          ...current.organization,
          name: this.orgData.tp_full_name,
          pan: this.orgData.organisation_pan,
          registeredAddress: this.orgData.registered_address,
          state: this.orgData.state_ut,
          pincode: this.orgData.pincode,
          website: this.orgData.website
        },
        registrationNumber: this.orgData.registration_number
      });

      // Also update EoiService if available
      try {
        this.eoiService.updateOrgBasicDetails({
          tp_full_name: this.orgData.tp_full_name,
          tp_short_name: this.orgData.tp_short_name,
          registration_number: this.orgData.registration_number,
          organisation_contact_no: this.orgData.organisation_contact_no,
          company_email: this.orgData.company_email,
          organisation_pan: this.orgData.organisation_pan,
          website: this.orgData.website,
          registered_address: this.orgData.registered_address,
          state_ut: this.orgData.state_ut,
          district: this.orgData.district,
          pincode: this.orgData.pincode,
          turnover_lakhs: this.orgData.turnover_lakhs,
          date_of_registration: this.orgData.date_of_registration,
          state_where_registered: this.orgData.state_where_registered,
          type_of_business: this.orgData.type_of_business,
          postal_address: this.orgData.postal_address
        });
      } catch {}

      this.toastMessage = '✓ Organisation / Company Basic Details updated successfully.';
    } else if (sec === 2) {
      this.authData = { ...this.authEdit };
      this.eoiState.updateProfile({
        personal: {
          ...current.personal,
          fullName: this.authData.auth_name,
          designation: this.authData.auth_designation,
          email: this.authData.auth_email,
          mobile: this.authData.auth_mobile
        }
      });

      try {
        this.eoiService.updateAuthPersonDetails({
          auth_name: this.authData.auth_name,
          auth_guardian_name: this.authData.auth_guardian_name,
          auth_dob: this.authData.auth_dob,
          auth_age: this.authData.auth_age,
          auth_designation: this.authData.auth_designation,
          auth_mobile: this.authData.auth_mobile,
          auth_email: this.authData.auth_email,
          auth_state: this.authData.auth_state,
          auth_residence_address: this.authData.auth_residence_address,
          auth_pan: this.authData.auth_pan,
          auth_aadhaar: this.authData.auth_aadhaar,
          auth_id_proof_type: this.authData.auth_id_proof_type,
          auth_id_number: this.authData.auth_id_number,
          auth_bhamashah: this.authData.auth_bhamashah,
          auth_voter_id: this.authData.auth_voter_id,
          auth_passport_no: this.authData.auth_passport_no,
          auth_service_tax_no: this.authData.auth_service_tax_no
        });
      } catch {}

      this.toastMessage = '✓ Authorized Person Details updated successfully.';
    } else if (sec === 3) {
      this.bankData = { ...this.bankEdit };
      this.eoiState.updateProfile({
        bankDetails: {
          accountHolderName: this.orgData.tp_full_name,
          bankName: this.bankData.bank_name,
          branchName: this.bankData.bank_branch_name,
          accountNumber: this.bankData.bank_account_no,
          ifscCode: this.bankData.bank_ifsc,
          accountType: this.bankData.bank_account_type,
          isPfmsVerified: true
        }
      });

      try {
        this.eoiService.updateBankDetails({
          bank_name: this.bankData.bank_name,
          bank_account_no: this.bankData.bank_account_no,
          bank_ifsc: this.bankData.bank_ifsc,
          bank_account_type: this.bankData.bank_account_type,
          bank_transfer_mode: this.bankData.bank_transfer_mode,
          bank_branch_name: this.bankData.bank_branch_name,
          bank_micr: this.bankData.bank_micr,
          bank_branch_address: this.bankData.bank_branch_address,
          bank_cancelled_cheque_doc: this.bankData.bank_cancelled_cheque_doc
        });
      } catch {}

      this.toastMessage = '✓ Bank Mandate & Details updated successfully.';
    }

    this.editingSection = null;
    setTimeout(() => {
      if (this.toastMessage) this.toastMessage = null;
    }, 4000);
  }

  downloadDoc(docName: string): void {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`GOVERNMENT OF RAJASTHAN\nISMS 2.0 Official Document Repository\nVerified Document: ${docName}\nStamped Date: 12-Jan-2026\nStatus: MCA / Tax Portal / PFMS Stamped Validated`));
    element.setAttribute('download', docName.endsWith('.pdf') ? docName : `${docName}.pdf`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  replaceDocument(doc: OfficialDocItem): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,application/pdf';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          alert('Invalid format: Only PDF documents are accepted.');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('File exceeds 5MB limit. Please upload a compressed PDF.');
          return;
        }
        doc.file_name = file.name;
        doc.file_size = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        doc.upload_date = 'Today (Updated)';
        this.toastMessage = `✓ ${doc.doc_title} replaced with ${file.name} successfully.`;
        setTimeout(() => this.toastMessage = null, 4000);
      }
    };
    input.click();
  }
}
