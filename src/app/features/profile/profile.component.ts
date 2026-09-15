import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EoiStateService, UserProfile, EoiApplication } from '../../core/services/eoi-state.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { GradeBadgeComponent } from '../../shared/components/grade-badge/grade-badge.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
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
    <div class="min-h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-800 antialiased selection:bg-[#002244] selection:text-white">
      <!-- Portal Post-Login Header with Dual Emblems & User Profile Information -->
      <app-header></app-header>

      <div class="flex flex-grow">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block"></app-sidebar>

        <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full overflow-y-auto">
          
          <!-- Top Title & Action Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 mb-6">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-[#002244] tracking-tight">
                Entity &amp; Applicant Profile
              </h1>
              <p class="text-xs sm:text-sm text-slate-500 mt-1">
                Official registered organization, authorized signatory credentials, bank mandate, and statutory documents.
              </p>
            </div>

            <div class="flex items-center gap-2.5">
              <ng-container *ngIf="userProfile$ | async as profile">
                <!-- If Profile is Complete -->
                <ng-container *ngIf="profile.isRegistered && profile.userState === 'existing'">
                  <button 
                    *ngIf="!isEditing"
                    (click)="startEditing(profile)"
                    class="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer">
                    <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Edit Profile Details</span>
                  </button>

                  <button 
                    *ngIf="isEditing"
                    (click)="saveProfile()"
                    class="px-5 py-2 bg-[#002244] text-white text-xs font-bold rounded-md hover:bg-[#003366] transition-colors shadow-2xs cursor-pointer">
                    Save Changes
                  </button>
                </ng-container>

                <!-- If Profile is Incomplete: Direct CTA to OTR -->
                <ng-container *ngIf="!profile.isRegistered || profile.userState === 'new'">
                  <a 
                    routerLink="/auth/register" 
                    class="px-4 py-2 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-md transition-all shadow-xs inline-flex items-center gap-1.5">
                    <span>Complete OTR Registration</span>
                    <span>→</span>
                  </a>
                </ng-container>
              </ng-container>
            </div>
          </div>

          <div *ngIf="userProfile$ | async as profile">

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <!-- Left Column: Official Profile Details (8 Cols) -->
              <div class="lg:col-span-8 space-y-6">

                <!-- ================= STATE 1: INCOMPLETE PROFILE CALLOUT BANNER ================= -->
                <div *ngIf="!profile.isRegistered || profile.userState === 'new'" 
                  class="p-5 bg-gradient-to-r from-amber-50 via-white to-amber-50/80 border-2 border-amber-300 rounded-xl shadow-xs relative overflow-hidden">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div class="flex items-start gap-3.5">
                      <div class="w-10 h-10 rounded-xl bg-amber-500 text-[#002244] font-black flex items-center justify-center text-lg shrink-0 shadow-xs">
                        ⚠️
                      </div>
                      <div>
                        <h3 class="font-extrabold text-sm text-[#002244] tracking-tight">
                          One-Time Registration (OTR) Incomplete
                        </h3>
                        <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                          Your official corporate entity, bank mandate, and statutory documents are not registered yet. All fields below are currently blank. Complete One-Time Registration (OTR) to unlock tender applications, EMD fee payments, and proposal submissions.
                        </p>
                      </div>
                    </div>

                    <a 
                      routerLink="/auth/register" 
                      class="shrink-0 w-full sm:w-auto text-center px-5 py-2.5 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2">
                      <span>Start OTR Registration</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>

                <!-- ================= STATE 2: VERIFIED TP CALLOUT BANNER ================= -->
                <div *ngIf="profile.isRegistered && profile.userState === 'existing'" 
                  class="p-5 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/80 border-2 border-emerald-300 rounded-xl shadow-xs">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div class="flex items-start gap-3.5">
                      <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xl shrink-0 shadow-xs">
                        ✓
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <h3 class="font-extrabold text-sm text-emerald-900 tracking-tight">
                            One-Time Registration (OTR) Completed &amp; Verified
                          </h3>
                          <span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                            Active TP
                          </span>
                        </div>
                        <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                          Entity credentials, authorized signatory, bank account, and statutory documents are verified by Government of Rajasthan. Eligible to participate in all open tenders and schemes.
                        </p>
                      </div>
                    </div>

                    <div class="shrink-0 text-right">
                      <div class="text-[10.5px] font-mono text-slate-500 uppercase">Registration ID</div>
                      <div class="text-xs font-mono font-black text-[#002244] mt-0.5">{{ profile.registrationNumber }}</div>
                    </div>
                  </div>
                </div>

                <!-- Master Official Certificate Card Container -->
                <div class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-7">
                  
                  <!-- Card Header: Identity & Registration Badges -->
                  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200">
                    <div class="flex items-center gap-3.5">
                      <div class="w-12 h-12 rounded-xl bg-[#002244] text-amber-400 border border-[#0a2e5c] flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                        {{ profile.isRegistered ? '🏢' : '👤' }}
                      </div>
                      <div>
                        <div class="text-[10.5px] font-mono uppercase tracking-wider text-slate-500">
                          {{ profile.isRegistered ? 'Government Registered Training Partner' : 'Rajasthan SSO Citizen Identity' }}
                        </div>
                        <div class="text-lg font-bold text-[#002244] tracking-tight">
                          {{ profile.isRegistered ? profile.organization.name : 'Citizen Applicant (Unregistered Entity)' }}
                        </div>
                        <div class="text-xs font-mono text-slate-600 mt-0.5 flex items-center gap-2">
                          <span>Mapped SSO ID: <strong class="text-[#002244]">{{ profile.ssoId || 'new_citizen_rj' }}</strong></span>
                          <span class="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.2 rounded">🔒 SSO Verified</span>
                        </div>
                      </div>
                    </div>

                    <!-- Status Pill -->
                    <div>
                      <app-grade-badge *ngIf="profile.isApprovedTp && profile.tpGrade" [grade]="profile.tpGrade" [showLabel]="true"></app-grade-badge>
                      <div *ngIf="!profile.isApprovedTp && profile.isRegistered" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-md text-xs font-bold shadow-2xs">
                        <span>✓ Verified Entity Profile</span>
                      </div>
                      <div *ngIf="!profile.isRegistered" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-md text-xs font-extrabold shadow-2xs">
                        <span>● OTR Registration Pending</span>
                      </div>
                    </div>
                  </div>

                  <!-- ================= 1. CORPORATE ENTITY & LEGAL REGISTRATION DETAILS ================= -->
                  <div>
                    <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-4">
                      <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#002244] flex items-center gap-2">
                        <span>1. Corporate Entity &amp; Registration Details</span>
                      </h3>
                      <span *ngIf="!profile.isRegistered" class="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                        Requires OTR (Currently Blank)
                      </span>
                      <span *ngIf="profile.isRegistered" class="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                        ✓ MCA &amp; Tax Portal Verified
                      </span>
                    </div>

                    <!-- Non-Editing Display -->
                    <div *ngIf="!isEditing" class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                      <div>
                        <span class="text-slate-500 font-medium block">Company / Entity Legal Name</span>
                        <div class="mt-0.5">
                          <span *ngIf="profile.isRegistered && profile.organization.name" class="font-bold text-sm text-[#002244]">
                            {{ profile.organization.name }}
                          </span>
                          <span *ngIf="!profile.isRegistered || !profile.organization.name" class="text-slate-400 italic text-xs font-mono">
                            — (Not Registered)
                          </span>
                        </div>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">Constitution / Entity Type</span>
                        <div class="mt-0.5">
                          <span *ngIf="profile.isRegistered && profile.organization.entityType" class="font-semibold text-slate-900">
                            {{ profile.organization.entityType }}
                          </span>
                          <span *ngIf="!profile.isRegistered || !profile.organization.entityType" class="text-slate-400 italic text-xs font-mono">
                            —
                          </span>
                        </div>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">Permanent Account Number (PAN)</span>
                        <div class="mt-0.5">
                          <span *ngIf="profile.isRegistered && profile.organization.pan" class="font-mono font-bold text-slate-900 text-xs">
                            {{ profile.organization.pan }}
                            <span class="ml-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded font-sans font-bold">✓ NSDL Validated</span>
                          </span>
                          <span *ngIf="!profile.isRegistered || !profile.organization.pan" class="text-slate-400 italic text-xs font-mono">
                            —
                          </span>
                        </div>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">GSTIN Registration</span>
                        <div class="mt-0.5">
                          <span *ngIf="profile.isRegistered && profile.organization.gstin" class="font-mono font-bold text-slate-900 text-xs">
                            {{ profile.organization.gstin }}
                            <span class="ml-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded font-sans font-bold">✓ Active Regular</span>
                          </span>
                          <span *ngIf="!profile.isRegistered || !profile.organization.gstin" class="text-slate-400 italic text-xs font-mono">
                            —
                          </span>
                        </div>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">Date of Incorporation</span>
                        <div class="mt-0.5">
                          <span *ngIf="profile.isRegistered && profile.organization.incorporationDate" class="font-semibold text-slate-900">
                            {{ profile.organization.incorporationDate }}
                          </span>
                          <span *ngIf="!profile.isRegistered || !profile.organization.incorporationDate" class="text-slate-400 italic text-xs font-mono">
                            —
                          </span>
                        </div>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">Official Website</span>
                        <div class="mt-0.5">
                          <a *ngIf="profile.isRegistered && profile.organization.website" 
                            [href]="'https://' + profile.organization.website" 
                            target="_blank" 
                            class="text-blue-700 hover:underline font-mono text-xs">
                            {{ profile.organization.website }}
                          </a>
                          <span *ngIf="!profile.isRegistered || !profile.organization.website" class="text-slate-400 italic text-xs font-mono">
                            —
                          </span>
                        </div>
                      </div>

                      <div class="sm:col-span-2">
                        <span class="text-slate-500 font-medium block">Registered Office Address</span>
                        <div class="mt-0.5">
                          <span *ngIf="profile.isRegistered && profile.organization.registeredAddress" class="font-medium text-slate-900 leading-relaxed">
                            {{ profile.organization.registeredAddress }}, {{ profile.organization.state }} - {{ profile.organization.pincode }}
                          </span>
                          <span *ngIf="!profile.isRegistered || !profile.organization.registeredAddress" class="text-slate-400 italic text-xs font-mono">
                            — (Address will be captured during One-Time Registration)
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Editable Inputs for Complete Profile -->
                    <div *ngIf="isEditing" class="space-y-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <label class="block text-slate-600 font-bold mb-1">Company Legal Name</label>
                        <input [(ngModel)]="editData.orgName" class="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:border-[#002244]" />
                      </div>
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="block text-slate-600 font-bold mb-1">PAN Number</label>
                          <input [(ngModel)]="editData.pan" class="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 uppercase font-mono focus:outline-none focus:border-[#002244]" />
                        </div>
                        <div>
                          <label class="block text-slate-600 font-bold mb-1">GSTIN Number</label>
                          <input [(ngModel)]="editData.gstin" class="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 uppercase font-mono focus:outline-none focus:border-[#002244]" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-slate-600 font-bold mb-1">Registered Address</label>
                        <textarea [(ngModel)]="editData.address" rows="2" class="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:border-[#002244]"></textarea>
                      </div>
                    </div>
                  </div>

                  <!-- ================= 2. AUTHORIZED SIGNATORY & CONTACT DETAILS ================= -->
                  <div>
                    <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-4">
                      <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#002244]">
                        2. Authorized Signatory &amp; Key Management
                      </h3>
                      <span *ngIf="profile.isRegistered" class="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                        ✓ Aadhaar e-KYC Verified
                      </span>
                      <span *ngIf="!profile.isRegistered" class="text-[11px] font-semibold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">
                        SSO Identity Authenticated
                      </span>
                    </div>

                    <div *ngIf="!isEditing" class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                      <div>
                        <span class="text-slate-500 font-medium block">Authorized Signatory Full Name</span>
                        <div class="mt-0.5">
                          <span class="font-bold text-slate-900 text-sm">
                            {{ profile.personal.fullName || 'Citizen Applicant' }}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">Official Designation</span>
                        <div class="mt-0.5">
                          <span *ngIf="profile.isRegistered && profile.personal.designation" class="font-semibold text-slate-900">
                            {{ profile.personal.designation }}
                          </span>
                          <span *ngIf="!profile.isRegistered || !profile.personal.designation" class="text-slate-400 italic text-xs font-mono">
                            — (Designation pending OTR completion)
                          </span>
                        </div>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">Identity Verification (Aadhaar / UIDAI)</span>
                        <div class="mt-0.5">
                          <span *ngIf="profile.isRegistered && profile.personal.identityNumber" class="font-mono text-slate-900 font-semibold">
                            {{ profile.personal.identityType }} ({{ profile.personal.identityNumber }})
                            <span class="ml-1 text-emerald-700 font-bold">🔒 e-Sign Active</span>
                          </span>
                          <span *ngIf="!profile.isRegistered || !profile.personal.identityNumber" class="text-slate-400 italic text-xs font-mono">
                            —
                          </span>
                        </div>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">Official Email Address</span>
                        <div class="mt-0.5 font-mono text-slate-900 font-medium">
                          {{ profile.personal.email || 'citizen@rajasthan.in' }}
                          <span class="ml-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-sans">✓ Verified</span>
                        </div>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">Registered Mobile Number</span>
                        <div class="mt-0.5 font-mono text-slate-900 font-medium">
                          {{ profile.personal.mobile || '+91 98290 12345' }}
                          <span class="ml-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-sans">✓ OTP Linked</span>
                        </div>
                      </div>
                    </div>

                    <!-- Editable Inputs for Signatory -->
                    <div *ngIf="isEditing" class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <label class="block text-slate-600 font-bold mb-1">Signatory Full Name</label>
                        <input [(ngModel)]="editData.fullName" class="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:border-[#002244]" />
                      </div>
                      <div>
                        <label class="block text-slate-600 font-bold mb-1">Designation</label>
                        <input [(ngModel)]="editData.designation" class="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:border-[#002244]" />
                      </div>
                      <div>
                        <label class="block text-slate-600 font-bold mb-1">Official Email ID</label>
                        <input [(ngModel)]="editData.email" class="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:border-[#002244]" />
                      </div>
                      <div>
                        <label class="block text-slate-600 font-bold mb-1">Mobile Number</label>
                        <input [(ngModel)]="editData.mobile" class="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:border-[#002244]" />
                      </div>
                    </div>
                  </div>

                  <!-- ================= 3. BANK ACCOUNT & FINANCIAL MANDATE ================= -->
                  <div>
                    <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-4">
                      <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#002244]">
                        3. Bank Account &amp; Financial Mandate (OTR Tab 3)
                      </h3>
                      <span *ngIf="profile.isRegistered && profile.bankDetails?.accountNumber" class="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                        ✓ PFMS Mandate Verified
                      </span>
                      <span *ngIf="!profile.isRegistered || !profile.bankDetails?.accountNumber" class="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                        Mandate Pending (Blank)
                      </span>
                    </div>

                    <!-- When Complete: Display Bank Details -->
                    <div *ngIf="profile.isRegistered && profile.bankDetails?.accountNumber" class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <span class="text-slate-500 font-medium block">Bank Name</span>
                        <span class="font-bold text-slate-900 text-sm mt-0.5 block">
                          {{ profile.bankDetails?.bankName }}
                        </span>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">Branch Location</span>
                        <span class="font-semibold text-slate-800 mt-0.5 block">
                          {{ profile.bankDetails?.branchName }}
                        </span>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">Account Number</span>
                        <span class="font-mono font-bold text-slate-900 mt-0.5 block">
                          {{ profile.bankDetails?.accountNumber }}
                        </span>
                      </div>

                      <div>
                        <span class="text-slate-500 font-medium block">IFSC Code</span>
                        <span class="font-mono font-bold text-[#002244] mt-0.5 block">
                          {{ profile.bankDetails?.ifscCode }}
                        </span>
                      </div>

                      <div class="sm:col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                        <span class="text-slate-600 font-medium">Account Type: <strong>{{ profile.bankDetails?.accountType }}</strong></span>
                        <span class="text-emerald-700 font-bold flex items-center gap-1">
                          ✓ PFMS Electronic EMD Refund Mandate Active
                        </span>
                      </div>
                    </div>

                    <!-- When Incomplete: Blank State Message -->
                    <div *ngIf="!profile.isRegistered || !profile.bankDetails?.accountNumber" 
                      class="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs text-center space-y-2">
                      <div class="font-bold text-slate-700">No bank account details linked yet</div>
                      <p class="text-[11px] text-slate-500 max-w-md mx-auto">
                        Your bank account number, branch IFSC code, and cancelled passbook cheque must be registered in OTR for automated electronic EMD refunds and grant disbursements.
                      </p>
                      <a routerLink="/auth/register" class="inline-block mt-1 text-[#002244] hover:underline font-bold text-xs">
                        Link Bank Account via One-Time Registration →
                      </a>
                    </div>
                  </div>

                  <!-- ================= 4. STATUTORY DOCUMENTS & UPLOADS ================= -->
                  <div>
                    <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
                      <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#002244]">
                        4. Uploaded Statutory Documents &amp; Certificates
                      </h3>
                      <span class="text-xs text-slate-500 font-mono">
                        {{ profile.documents.length || 0 }} Files Registered
                      </span>
                    </div>

                    <!-- When Complete: Documents Grid -->
                    <div *ngIf="profile.documents && profile.documents.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div *ngFor="let doc of profile.documents" class="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-[#002244] transition-all flex items-center justify-between gap-2 group">
                        <div class="flex items-center gap-2.5 truncate">
                          <div class="w-8 h-8 rounded bg-red-100 text-red-700 font-bold text-[11px] flex items-center justify-center shrink-0 border border-red-200">
                            PDF
                          </div>
                          <div class="min-w-0">
                            <div class="font-bold text-slate-900 truncate" [title]="doc.name">{{ doc.name }}</div>
                            <div class="text-[10.5px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                              <span>{{ doc.size }}</span>
                              <span>•</span>
                              <span class="text-emerald-700 font-bold">✓ Verified</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          type="button"
                          (click)="downloadDoc(doc.name)"
                          class="p-1.5 rounded text-slate-500 hover:text-[#002244] hover:bg-slate-200 transition-colors shrink-0"
                          title="Download document">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- When Incomplete: Blank State -->
                    <div *ngIf="!profile.documents || profile.documents.length === 0" 
                      class="text-xs text-slate-500 p-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center space-y-2">
                      <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto text-lg">
                        📄
                      </div>
                      <div class="font-bold text-slate-800 text-sm">No statutory documents uploaded yet</div>
                      <p class="text-[11.5px] text-slate-500 max-w-lg mx-auto leading-relaxed">
                        Certificate of Incorporation, Entity PAN card, GST registration certificate, and Audited Balance Sheets will be uploaded and cryptographically stamped during One-Time Registration (OTR).
                      </p>
                      <a routerLink="/auth/register" class="inline-block mt-2 px-4 py-2 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs rounded transition-colors shadow-2xs">
                        Upload Documents via OTR Form →
                      </a>
                    </div>
                  </div>

                </div>

              </div>

              <!-- Right Column: Profile Status, Completion Meter & Quick Action (4 Cols) -->
              <div class="lg:col-span-4 space-y-5">
                
                <!-- Registration Status Summary Card -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <h3 class="font-extrabold text-sm text-[#002244] pb-3 border-b border-slate-200 mb-4 flex items-center justify-between">
                    <span>Profile Status</span>
                    <span class="w-2 h-2 rounded-full" [class.bg-emerald-500]="profile.isRegistered" [class.bg-amber-500]="!profile.isRegistered"></span>
                  </h3>

                  <!-- Progress Meter -->
                  <div class="mb-5">
                    <div class="flex justify-between text-xs font-semibold mb-1.5">
                      <span class="text-slate-600">OTR Completion</span>
                      <span class="font-bold" [class.text-emerald-700]="profile.isRegistered" [class.text-amber-800]="!profile.isRegistered">
                        {{ profile.isRegistered ? '100% (Verified)' : '25% (Incomplete)' }}
                      </span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        class="h-full rounded-full transition-all duration-500"
                        [class.bg-emerald-600]="profile.isRegistered"
                        [class.bg-amber-500]="!profile.isRegistered"
                        [style.width]="profile.isRegistered ? '100%' : '25%'">
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3 text-xs text-slate-700">
                    <div class="flex justify-between py-1.5 border-b border-slate-100 items-center">
                      <span class="text-slate-500 font-medium">Status:</span>
                      <span class="font-extrabold text-xs px-2 py-0.5 rounded"
                        [class.text-emerald-800]="profile.isRegistered"
                        [class.bg-emerald-50]="profile.isRegistered"
                        [class.border]="profile.isRegistered"
                        [class.border-emerald-200]="profile.isRegistered"
                        [class.text-amber-900]="!profile.isRegistered"
                        [class.bg-amber-50]="!profile.isRegistered"
                        [class.border-amber-200]="!profile.isRegistered">
                        {{ profile.isRegistered ? '✓ Verified Profile' : '⚠️ Pending (OTR Required)' }}
                      </span>
                    </div>

                    <div class="flex justify-between py-1.5 border-b border-slate-100 items-center">
                      <span class="text-slate-500 font-medium">Registration No:</span>
                      <span class="font-mono font-bold text-slate-900">
                        {{ profile.isRegistered ? profile.registrationNumber : 'Pending Generation' }}
                      </span>
                    </div>

                    <div class="flex justify-between py-1.5 border-b border-slate-100 items-center">
                      <span class="text-slate-500 font-medium">Mapped SSO ID:</span>
                      <span class="font-mono font-bold text-[#002244]">
                        {{ profile.ssoId || 'new_citizen_rj' }}
                      </span>
                    </div>

                    <div class="flex justify-between py-1.5 border-b border-slate-100 items-center">
                      <span class="text-slate-500 font-medium">Applications Filed:</span>
                      <span class="font-bold text-slate-900 tabular-nums font-mono">
                        {{ (history$ | async)?.length || 0 }} EOIs
                      </span>
                    </div>

                    <div class="flex justify-between py-1.5 border-b border-slate-100 items-center">
                      <span class="text-slate-500 font-medium">Tender Eligibility:</span>
                      <span class="font-bold text-xs" [class.text-emerald-700]="profile.isRegistered" [class.text-amber-800]="!profile.isRegistered">
                        {{ profile.isRegistered ? 'Eligible for all Tenders' : 'Locked (OTR Mandatory)' }}
                      </span>
                    </div>

                    <!-- Empanelled Training Partner Badge if Approved -->
                    <div *ngIf="profile.isApprovedTp" class="p-3 bg-emerald-50 rounded-xs border border-emerald-300 mt-2 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold uppercase text-emerald-900">Partner Empanelment</span>
                        <span class="px-1.5 py-0.2 rounded-2xs bg-emerald-200 text-emerald-950 font-extrabold text-[10px]">
                          ★ Grade {{ profile.tpGrade || 'A' }}
                        </span>
                      </div>
                      <div class="text-xs font-mono font-bold text-[#002244]">{{ profile.tpId }}</div>
                      <div class="pt-1 flex items-center justify-between text-[10.5px]">
                        <span class="text-emerald-700 font-medium">Committee Order Sealed</span>
                        <a routerLink="/eoi/tracker/ISMS-EOI-2026-9871" class="font-bold text-[#002244] hover:underline">
                          View Order →
                        </a>
                      </div>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <div class="mt-5 pt-3 border-t border-slate-200">
                    <ng-container *ngIf="!profile.isRegistered || profile.userState === 'new'">
                      <a routerLink="/auth/register" class="w-full block text-center py-2.5 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs rounded-lg transition-colors shadow-2xs">
                        Complete OTR Registration →
                      </a>
                    </ng-container>
                    <ng-container *ngIf="profile.isRegistered && profile.userState === 'existing'">
                      <a routerLink="/schemes" class="w-full block text-center py-2.5 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs rounded-lg transition-colors shadow-2xs">
                        Apply for Active Scheme →
                      </a>
                    </ng-container>
                  </div>
                </div>

                <!-- Registration Checklist -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <h4 class="font-bold text-xs uppercase tracking-wider text-[#002244] mb-3">
                    OTR Verification Checklist
                  </h4>
                  <ul class="space-y-2.5 text-xs">
                    <li class="flex items-center gap-2">
                      <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">✓</span>
                      <span class="text-slate-700">Rajasthan SSO Authentication</span>
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px]"
                        [class.bg-emerald-100]="profile.isRegistered" [class.text-emerald-800]="profile.isRegistered"
                        [class.bg-slate-100]="!profile.isRegistered" [class.text-slate-400]="!profile.isRegistered">
                        {{ profile.isRegistered ? '✓' : '○' }}
                      </span>
                      <span [class.text-slate-800]="profile.isRegistered" [class.text-slate-400]="!profile.isRegistered">
                        Corporate Legal Registration (PAN/GST)
                      </span>
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px]"
                        [class.bg-emerald-100]="profile.isRegistered" [class.text-emerald-800]="profile.isRegistered"
                        [class.bg-slate-100]="!profile.isRegistered" [class.text-slate-400]="!profile.isRegistered">
                        {{ profile.isRegistered ? '✓' : '○' }}
                      </span>
                      <span [class.text-slate-800]="profile.isRegistered" [class.text-slate-400]="!profile.isRegistered">
                        Bank Mandate &amp; EMD Refund Account
                      </span>
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px]"
                        [class.bg-emerald-100]="profile.isRegistered" [class.text-emerald-800]="profile.isRegistered"
                        [class.bg-slate-100]="!profile.isRegistered" [class.text-slate-400]="!profile.isRegistered">
                        {{ profile.isRegistered ? '✓' : '○' }}
                      </span>
                      <span [class.text-slate-800]="profile.isRegistered" [class.text-slate-400]="!profile.isRegistered">
                        Statutory Document Uploads
                      </span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          </div>

        </main>
      </div>

    </div>
  `
})
export class ProfileComponent implements OnInit {
  userProfile$!: Observable<UserProfile>;
  history$!: Observable<EoiApplication[]>;
  isEditing = false;

  editData = {
    orgName: '',
    pan: '',
    gstin: '',
    address: '',
    fullName: '',
    designation: '',
    email: '',
    mobile: ''
  };

  constructor(private eoiService: EoiStateService) {}

  ngOnInit(): void {
    this.userProfile$ = this.eoiService.userProfile$;
    this.history$ = this.eoiService.history$;

    const p = this.eoiService.getProfile();
    this.populateEditData(p);
  }

  switchToCitizen(): void {
    this.eoiService.resetToNewCitizen('new_citizen_rj');
    this.isEditing = false;
  }

  switchToRegistered(): void {
    this.eoiService.resetToRegisteredApplicant('applicant_rj');
    this.isEditing = false;
  }

  startEditing(p: UserProfile): void {
    this.populateEditData(p);
    this.isEditing = true;
  }

  private populateEditData(p: UserProfile): void {
    this.editData = {
      orgName: p.organization?.name || '',
      pan: p.organization?.pan || '',
      gstin: p.organization?.gstin || '',
      address: p.organization?.registeredAddress || '',
      fullName: p.personal?.fullName || '',
      designation: p.personal?.designation || '',
      email: p.personal?.email || '',
      mobile: p.personal?.mobile || ''
    };
  }

  saveProfile(): void {
    const current = this.eoiService.getProfile();
    this.eoiService.updateProfile({
      personal: {
        ...current.personal,
        fullName: this.editData.fullName,
        designation: this.editData.designation,
        email: this.editData.email,
        mobile: this.editData.mobile
      },
      organization: {
        ...current.organization,
        name: this.editData.orgName,
        pan: this.editData.pan,
        gstin: this.editData.gstin,
        registeredAddress: this.editData.address
      }
    });
    this.isEditing = false;
  }

  downloadDoc(docName: string): void {
    alert(`Downloading verified official document: ${docName}`);
  }
}
