import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AspirantService } from '../services/aspirant.service';
import { AspirantRecord, AspirantTrainingStatus } from '../models/aspirant.model';
import { PageHeaderComponent } from '../../../shared/components';

@Component({
  selector: 'app-aspirant-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent
  ],
  template: `
    <div class="w-full min-h-full bg-slate-50 text-slate-800 font-sans pb-12" style="font-family: 'Inter', sans-serif;">
      
      @if (aspirant(); as cand) {
        <div class="p-4 sm:p-6 lg:p-7 space-y-5 max-w-7xl mx-auto">
          
          <!-- Top Page Header -->
          <app-page-header
            [title]="cand.aspirantName + ' (' + cand.id + ')'"
            bgColor="var(--color-primary, #174A6E)"
            [showBack]="true"
            backUrl="/aspirants"
            backTitle="Back to Aspirants Roster"
          >
            <div class="flex items-center gap-2">
              @if (!isEditMode()) {
                <button
                  type="button"
                  (click)="startEditing(cand)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-white/20 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Edit Aspirant Details"
                >
                  <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Aspirant</span>
                </button>

                <button
                  type="button"
                  (click)="printDossier(cand)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Print Official Candidate Dossier"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Dossier</span>
                </button>
              } @else {
                <button
                  type="button"
                  (click)="cancelEditing()"
                  class="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  (click)="saveChanges()"
                  class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </button>
              }
            </div>
          </app-page-header>

          <!-- Notification / Success Alert Banner -->
          @if (successMessage()) {
            <div class="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="font-medium">{{ successMessage() }}</span>
              </div>
              <button (click)="successMessage.set('')" class="text-emerald-600 hover:text-emerald-900 cursor-pointer font-bold">✕</button>
            </div>
          }

          <!-- Candidate Hero Card (Matching the modal design but in full-page elegance) -->
          <div class="bg-gradient-to-r from-[#0B3558] to-[#174A6E] rounded-xl text-white p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-20 rounded-xl bg-white/10 border-2 border-white/20 overflow-hidden shrink-0 shadow-md">
                <img [src]="cand.candidatePhotoUrl || defaultAvatar" alt="Candidate" class="w-full h-full object-cover" />
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2.5">
                  <h1 class="text-lg sm:text-xl font-bold m-0 tracking-tight leading-snug">
                    {{ isEditMode() ? (editForm.aspirantName || cand.aspirantName) : cand.aspirantName }}
                  </h1>
                  <span class="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {{ isEditMode() ? (editForm.trainingStatus || cand.trainingStatus) : cand.trainingStatus }}
                  </span>
                  @if (isEditMode()) {
                    <span class="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-900 border border-amber-300">
                      EDITING MODE
                    </span>
                  }
                </div>
                <div class="text-xs text-slate-300 flex flex-wrap items-center gap-2.5 mt-1.5">
                  <span class="font-mono font-bold">{{ cand.id }}</span>
                  <span>•</span>
                  <span>Aadhaar: {{ cand.aadhaarMasked }}</span>
                  <span>•</span>
                  <span class="text-emerald-300 font-semibold flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>Biometric AEBAS Verified</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Fast Status / Biometric Toggles -->
            <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              <div class="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 border border-white/15">
                <span class="text-xs text-slate-200">Status:</span>
                <select
                  [ngModel]="cand.trainingStatus"
                  (ngModelChange)="updateStatus($event)"
                  class="h-7 px-2 text-xs bg-white text-slate-900 rounded font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ENROLLED">ENROLLED</option>
                  <option value="IN_TRAINING">IN TRAINING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CERTIFIED">CERTIFIED</option>
                </select>
              </div>

              <button
                type="button"
                (click)="toggleBiometric()"
                class="h-8 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5"
                [class.bg-emerald-500]="cand.biometricVerified"
                [class.text-white]="cand.biometricVerified"
                [class.border-emerald-400]="cand.biometricVerified"
                [class.bg-amber-400]="!cand.biometricVerified"
                [class.text-slate-900]="!cand.biometricVerified"
                [class.border-amber-300]="!cand.biometricVerified"
              >
                <span>{{ cand.biometricVerified ? 'AEBAS Active ✓' : 'Mark AEBAS Verified' }}</span>
              </button>
            </div>
          </div>

          <!-- Training Center & Batch Context Strip -->
          <div class="bg-white border border-slate-200 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-slate-500 font-medium">Training Center (SDC):</span>
              <span class="font-bold text-slate-900">{{ cand.sdcName }}</span>
              <span class="font-mono text-slate-900 font-bold">({{ cand.sdcCode }})</span>
              <span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 border border-slate-300 text-slate-700 font-medium">{{ cand.sdcDistrict }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-slate-500 font-medium">Batch:</span>
              <span class="font-bold font-mono text-slate-900">{{ cand.batchCode }}</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAF2F6] text-[#174A6E]">{{ cand.scheme }}</span>
              <span class="text-slate-600 font-medium">{{ cand.courseName }}</span>
            </div>
          </div>

          <!-- ========================================================================= -->
          <!-- VIEW MODE: All candidate particulars displayed in clean structured cards  -->
          <!-- ========================================================================= -->
          @if (!isEditMode()) {
            
            <div class="space-y-5">
              
              <!-- Section 1: Main / Personal Details & Identity -->
              <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>1. Main / Personal Details &amp; Identity</span>
                  </h2>
                  <button
                    type="button"
                    (click)="startEditing(cand)"
                    class="text-xs text-[#174A6E] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Edit Section</span> &rarr;
                  </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 block text-[11px]">Full Name</span>
                    <span class="font-bold text-slate-900 text-sm mt-0.5 block">{{ cand.aspirantName }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Aadhaar No. (Masked)</span>
                    <span class="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{{ cand.aadhaarMasked }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Jan Aadhaar ID</span>
                    <span class="font-mono font-semibold text-slate-800 text-sm mt-0.5 block">{{ cand.janaadhaarId || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Other ID ({{ cand.otherIdType || 'ID' }})</span>
                    <span class="font-mono font-semibold text-slate-800 text-sm mt-0.5 block">{{ cand.otherIdNo || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Date of Birth (Age)</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.dob }} ({{ cand.age }} yrs)</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Gender / Relation</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.gender }} • {{ cand.relationType }}: {{ cand.relationName }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Mother's Name</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.motherName || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Education Qualification</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.educationalQualification }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Religion / Category</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.religion }} • {{ cand.category }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Minority / Special Ability</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.minority }} • Disability: {{ cand.specialAbility }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Area Type</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.areaType }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Aadhaar Document Proof</span>
                    <span class="font-semibold text-blue-700 mt-0.5 block truncate">{{ cand.aadhaarDocName || 'Aadhaar_Proof.pdf' }}</span>
                  </div>
                </div>
              </div>

              <!-- Section 2: Address & Contact Details -->
              <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>2. Address &amp; Contact Details</span>
                  </h2>
                  <button
                    type="button"
                    (click)="startEditing(cand)"
                    class="text-xs text-[#174A6E] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Edit Section</span> &rarr;
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <!-- Permanent Address -->
                  <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span class="text-xs font-bold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-[#174A6E]"></span>
                      <span>Permanent Address</span>
                    </span>
                    <p class="text-slate-800 m-0 leading-relaxed text-xs">
                      {{ cand.permHouseNo }}, {{ cand.permStreet }}<br />
                      {{ cand.permWard }}, {{ cand.permCity }} - {{ cand.permPincode }}<br />
                      District: <span class="font-semibold text-slate-900">{{ cand.permDistrict }}</span>, Block: {{ cand.permBlock }}<br />
                      Tehsil: {{ cand.permTehsil }}, Assembly: {{ cand.permAssembly }}
                    </p>
                  </div>

                  <!-- Communication Address -->
                  <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span class="text-xs font-bold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span>Communication Address</span>
                    </span>
                    <p class="text-slate-800 m-0 leading-relaxed text-xs">
                      {{ cand.commHouseNo }}, {{ cand.commStreet }}<br />
                      {{ cand.commWard }}, {{ cand.commCity }} - {{ cand.commPincode }}<br />
                      District: <span class="font-semibold text-slate-900">{{ cand.commDistrict }}</span>, Block: {{ cand.commBlock }}<br />
                      Tehsil: {{ cand.commTehsil }}, Municipality: {{ cand.commMunicipality }}
                    </p>
                  </div>
                </div>

                <!-- Contact Details Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span class="text-slate-400 block text-[11px]">Primary Mobile No.</span>
                    <span class="font-bold text-slate-900 mt-0.5 block">{{ cand.mobileNo }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Alternate Mobile No.</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.altMobileNo || 'None' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Email Address</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.email || 'None' }}</span>
                  </div>
                </div>
              </div>

              <!-- Section 3: Bank DBT & Socio-Economic Registrations -->
              <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>3. Bank DBT &amp; Socio-Economic Registrations</span>
                  </h2>
                  <button
                    type="button"
                    (click)="startEditing(cand)"
                    class="text-xs text-[#174A6E] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Edit Section</span> &rarr;
                  </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 block text-[11px]">Bank Name</span>
                    <span class="font-semibold text-slate-900 mt-0.5 block">{{ cand.bankName }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Account No. (Masked)</span>
                    <span class="font-mono font-bold text-slate-900 mt-0.5 block">XXXX-{{ cand.bankAccountNo ? cand.bankAccountNo.slice(-4) : '4812' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">IFSC Code</span>
                    <span class="font-mono font-semibold text-slate-800 mt-0.5 block">{{ cand.ifscCode }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Branch</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.bankBranch }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Annual Family Income</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">₹{{ cand.annualFamilyIncome }} ({{ cand.incomeSlab }})</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Economic Status</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.economicStatus }} (Card: {{ cand.economicCardNo || 'N/A' }})</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">BoCW Registered</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.bocwWorker }} {{ cand.bocwNo ? '(' + cand.bocwNo + ')' : '' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">MGNREGA / RSBY / NRLM</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.mgnregaWorker === 'Yes' ? 'MGNREGA Active' : 'None' }}</span>
                  </div>
                </div>
              </div>

              <!-- Section 4: Attached Documents Table -->
              <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>4. Attached Documents ({{ cand.documents.length || 0 }})</span>
                  </h2>
                </div>

                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                  <table class="w-full text-xs text-left">
                    <thead class="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                      <tr>
                        <th class="py-2.5 px-4 w-12 text-center">#</th>
                        <th class="py-2.5 px-4">Document Type</th>
                        <th class="py-2.5 px-4">Document Title</th>
                        <th class="py-2.5 px-4">File Name</th>
                        <th class="py-2.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (doc of cand.documents; track doc.id; let idx = $index) {
                        <tr class="hover:bg-slate-50/50">
                          <td class="py-3 px-4 text-center text-slate-400 font-mono">{{ idx + 1 }}</td>
                          <td class="py-3 px-4 font-semibold text-slate-900">{{ doc.docType }}</td>
                          <td class="py-3 px-4 text-slate-700">{{ doc.docName }}</td>
                          <td class="py-3 px-4 font-mono text-slate-600">{{ doc.fileName || 'Pending upload' }}</td>
                          <td class="py-3 px-4 text-center">
                            @if (doc.status === 'UPLOADED') {
                              <span class="px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Uploaded</span>
                            } @else {
                              <span class="px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          } @else {
            
            <!-- ========================================================================= -->
            <!-- EDIT MODE: Interactive Form Inputs for all Candidate Particulars          -->
            <!-- ========================================================================= -->
            <form (ngSubmit)="saveChanges()" class="space-y-6">
              
              <!-- Sticky Edit Notification Bar -->
              <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Candidate Edit Mode Active:</strong> Modify personal details, address, contact, and bank records below, then click <strong>Save Changes</strong>.</span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="cancelEditing()"
                    class="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-1.5 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              <!-- Editable Section 1: Main / Personal Details -->
              <div class="border border-blue-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>1. Edit Personal Details &amp; Identity</span>
                  </h3>
                  <span class="text-[11px] text-slate-400">All changes update aspirant database</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Aspirant Name *</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.aspirantName"
                      name="aspirantName"
                      required
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Relation Type</label>
                    <select
                      [(ngModel)]="editForm.relationType"
                      name="relationType"
                      class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    >
                      <option value="Father">Father</option>
                      <option value="Husband">Husband</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Father / Relative Name *</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.relationName"
                      name="relationName"
                      required
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Mother's Name</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.motherName"
                      name="motherName"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Date of Birth</label>
                    <input
                      type="date"
                      [(ngModel)]="editForm.dob"
                      name="dob"
                      (change)="onDobChanged()"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Age (Years)</label>
                    <input
                      type="number"
                      [(ngModel)]="editForm.age"
                      name="age"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
                    <select
                      [(ngModel)]="editForm.gender"
                      name="gender"
                      class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                    <select
                      [(ngModel)]="editForm.category"
                      name="category"
                      class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="MBC">MBC</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Religion</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.religion"
                      name="religion"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Education Qualification</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.educationalQualification"
                      name="educationalQualification"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Area Type</label>
                    <select
                      [(ngModel)]="editForm.areaType"
                      name="areaType"
                      class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    >
                      <option value="Rural">Rural</option>
                      <option value="Urban">Urban</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Minority</label>
                    <select
                      [(ngModel)]="editForm.minority"
                      name="minority"
                      class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Editable Section 2: Address & Contact Details -->
              <div class="border border-blue-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>2. Edit Address &amp; Contact Details</span>
                  </h3>
                  <label class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      [(ngModel)]="editForm.isAddressSame"
                      name="isAddressSame"
                      (change)="syncAddress()"
                      class="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                    />
                    <span>Same as Permanent Address</span>
                  </label>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Primary Mobile No. *</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.mobileNo"
                      name="mobileNo"
                      required
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Alternate Mobile No.</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.altMobileNo"
                      name="altMobileNo"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      [(ngModel)]="editForm.email"
                      name="email"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">House / Flat No.</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.permHouseNo"
                      name="permHouseNo"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Street / Locality</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.permStreet"
                      name="permStreet"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Village / City</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.permCity"
                      name="permCity"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">District</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.permDistrict"
                      name="permDistrict"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Tehsil</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.permTehsil"
                      name="permTehsil"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pincode</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.permPincode"
                      name="permPincode"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>
                </div>
              </div>

              <!-- Editable Section 3: Bank DBT & Socio-Economic Details -->
              <div class="border border-blue-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>3. Edit Bank DBT &amp; Socio-Economic Registrations</span>
                  </h3>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Bank Name</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.bankName"
                      name="bankName"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.bankAccountNo"
                      name="bankAccountNo"
                      class="w-full h-9 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">IFSC Code</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.ifscCode"
                      name="ifscCode"
                      class="w-full h-9 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Branch Name</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.bankBranch"
                      name="bankBranch"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Annual Family Income (₹)</label>
                    <input
                      type="number"
                      [(ngModel)]="editForm.annualFamilyIncome"
                      name="annualFamilyIncome"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Economic Status</label>
                    <select
                      [(ngModel)]="editForm.economicStatus"
                      name="economicStatus"
                      class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    >
                      <option value="APL">APL (Above Poverty Line)</option>
                      <option value="BPL">BPL (Below Poverty Line)</option>
                      <option value="Antyodaya">Antyodaya</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">BoCW Registered</label>
                    <select
                      [(ngModel)]="editForm.bocwWorker"
                      name="bocwWorker"
                      class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Training Status</label>
                    <select
                      [(ngModel)]="editForm.trainingStatus"
                      name="trainingStatus"
                      class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    >
                      <option value="ENROLLED">ENROLLED</option>
                      <option value="IN_TRAINING">IN TRAINING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CERTIFIED">CERTIFIED</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Form Submit Actions Bar -->
              <div class="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  (click)="cancelEditing()"
                  class="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2.5 bg-[#174A6E] hover:bg-[#123B59] active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save All Changes</span>
                </button>
              </div>

            </form>

          }

        </div>
      } @else {
        <!-- Candidate Not Found Empty State -->
        <div class="p-8 max-w-lg mx-auto text-center space-y-4 pt-16">
          <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            👤
          </div>
          <h2 class="text-base font-bold text-slate-800">Aspirant Record Not Found</h2>
          <p class="text-xs text-slate-500">The requested aspirant identifier does not exist or has been removed from the roster.</p>
          <a
            routerLink="/aspirants"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-[#174A6E] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs hover:bg-[#123B59]"
          >
            &larr; Return to Aspirants Roster
          </a>
        </div>
      }

    </div>
  `
})
export class AspirantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private aspirantService = inject(AspirantService);

  aspirant = signal<AspirantRecord | null>(null);
  isEditMode = signal<boolean>(false);
  successMessage = signal<string>('');

  editForm: Partial<AspirantRecord> = {};

  readonly defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' clip-rule='evenodd'/%3E%3C/svg%3E";

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAspirant(id);
      }
    });

    this.route.queryParamMap.subscribe(queryParams => {
      if (queryParams.get('edit') === 'true') {
        this.isEditMode.set(true);
      }
    });
  }

  loadAspirant(id: string): void {
    const cand = this.aspirantService.getAspirantById(id);
    if (cand) {
      this.aspirant.set(cand);
      this.editForm = JSON.parse(JSON.stringify(cand));
    } else {
      this.aspirant.set(null);
    }
  }

  startEditing(cand: AspirantRecord): void {
    this.editForm = JSON.parse(JSON.stringify(cand));
    this.isEditMode.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEditing(): void {
    const current = this.aspirant();
    if (current) {
      this.editForm = JSON.parse(JSON.stringify(current));
    }
    this.isEditMode.set(false);
  }

  onDobChanged(): void {
    if (this.editForm.dob) {
      const birthDate = new Date(this.editForm.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      this.editForm.age = age > 0 ? age : 0;
    }
  }

  syncAddress(): void {
    if (this.editForm.isAddressSame) {
      this.editForm.commHouseNo = this.editForm.permHouseNo;
      this.editForm.commStreet = this.editForm.permStreet;
      this.editForm.commWard = this.editForm.permWard;
      this.editForm.commCity = this.editForm.permCity;
      this.editForm.commDistrict = this.editForm.permDistrict;
      this.editForm.commTehsil = this.editForm.permTehsil;
      this.editForm.commBlock = this.editForm.permBlock;
      this.editForm.commPincode = this.editForm.permPincode;
      this.editForm.commMunicipality = this.editForm.permMunicipality;
    }
  }

  saveChanges(): void {
    const current = this.aspirant();
    if (!current) return;

    if (!this.editForm.aspirantName || !this.editForm.aspirantName.trim()) {
      alert('Aspirant full name is required');
      return;
    }

    const updated = this.aspirantService.updateAspirant(current.id, this.editForm);
    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.isEditMode.set(false);
      this.successMessage.set(`Aspirant details for ${updated.aspirantName} have been successfully updated.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleBiometric(): void {
    const current = this.aspirant();
    if (!current) return;
    this.aspirantService.toggleBiometric(current.id);
    const updated = this.aspirantService.getAspirantById(current.id);
    if (updated) {
      this.aspirant.set(updated);
    }
  }

  updateStatus(newStatus: AspirantTrainingStatus): void {
    const current = this.aspirant();
    if (!current) return;
    this.aspirantService.updateTrainingStatus(current.id, newStatus);
    const updated = this.aspirantService.getAspirantById(current.id);
    if (updated) {
      this.aspirant.set(updated);
      this.successMessage.set(`Training status updated to ${newStatus}.`);
    }
  }

  printDossier(cand: AspirantRecord): void {
    window.print();
  }
}
