import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AspirantService } from '../services/aspirant.service';
import { AspirantRecord, AspirantTrainingStatus } from '../models/aspirant.model';
import { AspirantDocumentItem } from '../config/aspirant-form.config';
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
    <div class="w-full min-h-full bg-slate-50 text-slate-800 font-sans pb-16" style="font-family: 'Inter', sans-serif;">
      
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
              <button
                type="button"
                (click)="printDossier(cand)"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                style="color: #ffffff !important;"
                title="Print Official Candidate Dossier"
              >
                <svg class="w-3.5 h-3.5" style="color: #ffffff !important; stroke: #ffffff !important;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span style="color: #ffffff !important;">Print Dossier</span>
              </button>
            </div>
          </app-page-header>

          <!-- Notification / Success Alert Banner -->
          @if (successMessage()) {
            <div class="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in shadow-xs">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="font-medium">{{ successMessage() }}</span>
              </div>
              <button (click)="successMessage.set('')" class="text-emerald-600 hover:text-emerald-900 cursor-pointer font-bold px-1">✕</button>
            </div>
          }

          <!-- Candidate Hero Card (With explicit pure white headings and contrast) -->
          <div class="bg-gradient-to-r from-[#0B3558] to-[#174A6E] rounded-xl text-white p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-20 rounded-xl bg-white/10 border-2 border-white/20 overflow-hidden shrink-0 shadow-md">
                <img [src]="cand.candidatePhotoUrl || defaultAvatar" alt="Candidate" class="w-full h-full object-cover" />
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2.5">
                  <h1
                    class="text-lg sm:text-xl font-bold m-0 tracking-tight leading-snug"
                    style="color: #ffffff !important;"
                  >
                    {{ isEditMode() ? (editForm.aspirantName || cand.aspirantName) : cand.aspirantName }}
                  </h1>
                  <span
                    class="px-2.5 py-0.5 rounded text-[11px] font-bold border"
                    style="background-color: rgba(16, 185, 129, 0.25) !important; color: #a7f3d0 !important; border-color: rgba(52, 211, 153, 0.4) !important;"
                  >
                    {{ isEditMode() ? (editForm.trainingStatus || cand.trainingStatus) : cand.trainingStatus }}
                  </span>
                </div>
                <div class="text-xs flex flex-wrap items-center gap-2.5 mt-1.5" style="color: rgba(255, 255, 255, 0.85) !important;">
                  <span class="font-mono font-bold" style="color: #ffffff !important;">{{ cand.id }}</span>
                  <span style="color: rgba(255, 255, 255, 0.5) !important;">•</span>
                  <span>Aadhaar: {{ cand.aadhaarMasked }}</span>
                </div>
              </div>
            </div>

            <!-- Fast Status / Biometric Toggles -->
            <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              <div class="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 border border-white/15">
                <span class="text-xs" style="color: #ffffff !important;">Status:</span>
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
                  
                  <!-- Aadhaar Document Proof with Direct Preview & Replace Actions -->
                  <div class="col-span-2 sm:col-span-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span class="text-slate-500 block text-[10.5px] font-semibold uppercase">Aadhaar Proof Document</span>
                    <span class="font-medium text-slate-800 text-xs mt-0.5 block truncate" [title]="cand.aadhaarDocName || 'Aadhaar_Document.pdf'">
                      {{ cand.aadhaarDocName || 'Aadhaar_Document.pdf' }}
                    </span>
                    <div class="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        (click)="previewAadhaarProof(cand)"
                        class="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10.5px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        (click)="aadhaarFileInput.click()"
                        class="px-2 py-0.5 bg-[#174A6E] text-white rounded text-[10.5px] font-semibold hover:bg-[#123B59] cursor-pointer shadow-2xs"
                      >
                        Replace
                      </button>
                      <input
                        #aadhaarFileInput
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        (change)="onAadhaarDocReplaced($event)"
                        class="hidden"
                      />
                    </div>
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

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Permanent Address -->
                  <div class="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Permanent Address</span>
                    <p class="text-slate-800 leading-relaxed m-0 text-xs">
                      {{ cand.permHouseNo }}, {{ cand.permStreet }}<br />
                      Ward {{ cand.permWard }}, {{ cand.permCity }} - {{ cand.permPincode }}<br />
                      District: <strong class="text-slate-900">{{ cand.permDistrict }}</strong>, Block: {{ cand.permBlock || 'Sanganer' }}<br />
                      Tehsil: {{ cand.permTehsil }}, Assembly: {{ cand.permAssembly || 'Sanganer' }}
                    </p>
                  </div>

                  <!-- Communication Address -->
                  <div class="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Communication Address</span>
                    <p class="text-slate-800 leading-relaxed m-0 text-xs">
                      {{ cand.commHouseNo || cand.permHouseNo }}, {{ cand.commStreet || cand.permStreet }}<br />
                      Ward {{ cand.commWard || cand.permWard }}, {{ cand.commCity || cand.permCity }} - {{ cand.commPincode || cand.permPincode }}<br />
                      District: <strong class="text-slate-900">{{ cand.commDistrict || cand.permDistrict }}</strong>, Block: {{ cand.commBlock || 'Sanganer' }}<br />
                      Tehsil: {{ cand.commTehsil || cand.permTehsil }}, Municipality: {{ cand.commMunicipality || 'Sanganer Panchayat Samiti' }}
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span class="text-slate-400 block text-[11px]">Mobile Number</span>
                    <span class="font-bold font-mono text-slate-800 text-sm mt-0.5 block">{{ cand.mobileNo }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Alt Mobile Number</span>
                    <span class="font-semibold font-mono text-slate-800 mt-0.5 block">{{ cand.altMobileNo || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Email Address</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block truncate">{{ cand.email || 'N/A' }}</span>
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
                    <span class="font-bold text-slate-800 mt-0.5 block">{{ cand.bankName }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Account No. (Masked)</span>
                    <span class="font-mono font-bold text-slate-800 mt-0.5 block">{{ cand.bankAccountNo }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">IFSC Code</span>
                    <span class="font-mono font-bold text-slate-800 mt-0.5 block">{{ cand.ifscCode }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Branch</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.bankBranch }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Annual Family Income</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">₹ {{ cand.annualFamilyIncome | number }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">Economic Status</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.economicStatus }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">BoCW Registered</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.bocwWorker || 'No' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">MGNREGA Worker</span>
                    <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.mgnregaWorker || 'No' }}</span>
                  </div>
                </div>
              </div>

              <!-- ========================================================================= -->
              <!-- Section 4: Attached Verification Documents with Full Edit & Upload Options -->
              <!-- ========================================================================= -->
              <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                      <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                      <span>4. Attached Documents ({{ cand.documents ? cand.documents.length : 0 }})</span>
                    </h2>
                    <p class="text-[11px] text-slate-500 mt-0.5">Manage, preview, edit, replace or upload new documents for this candidate</p>
                  </div>

                  <!-- Add Document Trigger Button -->
                  <button
                    type="button"
                    (click)="openAddDocModal()"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    style="color: #ffffff !important;"
                  >
                    <span class="text-base font-bold leading-none" style="color: #ffffff !important;">+</span>
                    <span style="color: #ffffff !important;">Upload New Document</span>
                  </button>
                </div>

                <!-- Hidden Master Document Replacement File Input -->
                <input
                  #docReplaceFileInput
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  (change)="onFileSelectedForReplace($event)"
                  class="hidden"
                />

                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                  <table class="w-full text-xs text-left">
                    <thead class="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                      <tr>
                        <th class="py-2.5 px-3 w-10 text-center">#</th>
                        <th class="py-2.5 px-4">Document Type</th>
                        <th class="py-2.5 px-4">Document Title</th>
                        <th class="py-2.5 px-4">Attached File &amp; Size</th>
                        <th class="py-2.5 px-3 text-center">Status</th>
                        <th class="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (doc of cand.documents; track doc.id; let idx = $index) {
                        <tr class="hover:bg-slate-50/70 transition-colors">
                          <td class="py-3 px-3 text-center text-slate-400 font-mono">{{ idx + 1 }}</td>
                          <td class="py-3 px-4">
                            <span class="font-semibold text-slate-900 block">{{ doc.docType }}</span>
                            <span class="text-[10px] text-slate-400">{{ doc.badgeLabel || 'Statutory' }}</span>
                          </td>
                          <td class="py-3 px-4 font-medium text-slate-700">
                            {{ doc.docName }}
                          </td>
                          <td class="py-3 px-4">
                            <div class="flex items-center gap-2">
                              <span class="w-6 h-6 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                                {{ getDocExtension(doc.fileName) }}
                              </span>
                              <div class="min-w-0">
                                <span class="font-mono text-xs text-slate-800 block truncate max-w-[200px]" [title]="doc.fileName">
                                  {{ doc.fileName || 'No file attached' }}
                                </span>
                                <span class="text-[10.5px] text-slate-400 block font-sans">
                                  {{ doc.fileSize || 'Standard' }} • {{ doc.uploadedAt || 'Verified' }}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td class="py-3 px-3 text-center">
                            @if (doc.status === 'UPLOADED') {
                              <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Uploaded ✓
                              </span>
                            } @else {
                              <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending
                              </span>
                            }
                          </td>
                          <td class="py-3 px-4 text-right">
                            <div class="inline-flex items-center gap-1.5">
                              <!-- 1. View / Preview -->
                              <button
                                type="button"
                                (click)="openPreviewDoc(doc)"
                                class="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="View / Preview Document"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>

                              <!-- 2. Replace File -->
                              <button
                                type="button"
                                (click)="triggerReplaceDoc(doc, docReplaceFileInput)"
                                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EAF2F6] hover:bg-[#d8e8f2] text-[#174A6E] font-semibold text-[11px] transition-colors cursor-pointer border border-[#c1d9e7]"
                                title="Upload replacement file"
                              >
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span>Replace</span>
                              </button>

                              <!-- 3. Edit Document Details -->
                              <button
                                type="button"
                                (click)="openEditDocModal(doc)"
                                class="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="Edit Document Details"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>

                              <!-- 4. Delete Document -->
                              <button
                                type="button"
                                (click)="deleteDocument(doc)"
                                class="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Remove Document"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="6" class="py-8 text-center text-slate-500">
                            No documents attached yet. Click "+ Upload New Document" to attach candidate verification files.
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
            <!-- EDIT MODE: Interactive Form Inputs for Candidate Particulars & Documents  -->
            <!-- ========================================================================= -->
            <form (ngSubmit)="saveChanges()" class="space-y-6">
              

              <!-- Editable Section 1: Main / Personal Details -->
              <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>1. Edit Personal Details &amp; Identity</span>
                  </h3>
                  <span class="text-[11px] text-slate-400">All changes update aspirant database</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.aspirantName"
                      name="aspirantName"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      required
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
                      <option value="Mother">Mother</option>
                      <option value="Husband">Husband</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Father / Guardian Name</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.relationName"
                      name="relationName"
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
                    <select
                      [(ngModel)]="editForm.religion"
                      name="religion"
                      class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    >
                      <option value="Hindu">Hindu</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Christian">Christian</option>
                      <option value="Jain">Jain</option>
                      <option value="Buddhist">Buddhist</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Educational Qualification</label>
                    <select
                      [(ngModel)]="editForm.educationalQualification"
                      name="educationalQualification"
                      class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    >
                      <option value="Below 8th">Below 8th</option>
                      <option value="8th Pass">8th Pass</option>
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                      <option value="ITI / Diploma">ITI / Diploma</option>
                    </select>
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

                  <!-- Edit Aadhaar Document Attachment -->
                  <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <label class="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">Aadhaar Proof File</label>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-mono text-slate-700 truncate block flex-1" [title]="editForm.aadhaarDocName || 'Aadhaar_Document.pdf'">
                        {{ editForm.aadhaarDocName || 'Aadhaar_Document.pdf' }}
                      </span>
                      <button
                        type="button"
                        (click)="editAadhaarFileInput.click()"
                        class="px-2 py-1 bg-white border border-slate-300 rounded text-[10.5px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs shrink-0"
                      >
                        Browse
                      </button>
                      <input
                        #editAadhaarFileInput
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        (change)="onEditAadhaarFileSelected($event)"
                        class="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Editable Section 2: Address & Contact Details -->
              <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>2. Edit Address &amp; Contact Details</span>
                  </h3>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.mobileNo"
                      name="mobileNo"
                      maxlength="10"
                      pattern="[6-9][0-9]{9}"
                      title="10 digits starting with 6, 7, 8 or 9"
                      placeholder="10-digit mobile"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Alternate Mobile Number</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.altMobileNo"
                      name="altMobileNo"
                      maxlength="10"
                      pattern="[6-9][0-9]{9}"
                      title="10 digits starting with 6, 7, 8 or 9"
                      placeholder="10-digit alternate mobile"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      [(ngModel)]="editForm.email"
                      name="email"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>
                </div>

                <!-- Permanent Address Inputs -->
                <div class="pt-3 border-t border-slate-100">
                  <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Permanent Address</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label class="block text-[11px] text-slate-600 mb-1">House / Flat No.</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permHouseNo"
                        name="permHouseNo"
                        class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] text-slate-600 mb-1">Street / Colony</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permStreet"
                        name="permStreet"
                        class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] text-slate-600 mb-1">Ward / Locality</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permWard"
                        name="permWard"
                        class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] text-slate-600 mb-1">City / Town</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permCity"
                        name="permCity"
                        class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] text-slate-600 mb-1">District</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permDistrict"
                        name="permDistrict"
                        class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] text-slate-600 mb-1">Tehsil</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permTehsil"
                        name="permTehsil"
                        class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] text-slate-600 mb-1">Pincode</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permPincode"
                        name="permPincode"
                        maxlength="6"
                        pattern="[1-9][0-9]{5}"
                        title="6-digit pincode (not starting with 0)"
                        placeholder="6-digit pincode"
                        class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Editable Section 3: Bank DBT & Socio-Economic -->
              <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>3. Edit Bank DBT &amp; Socio-Economic Registrations</span>
                  </h3>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
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
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Account Number</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.bankAccountNo"
                      name="bankAccountNo"
                      maxlength="18"
                      pattern="[0-9]{9,18}"
                      title="9 to 18 digit bank account number"
                      placeholder="9 to 18 digit account number"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">IFSC Code</label>
                    <input
                      type="text"
                      [(ngModel)]="editForm.ifscCode"
                      name="ifscCode"
                      maxlength="11"
                      pattern="[A-Z]{4}0[A-Z0-9]{6}"
                      title="11-char IFSC: 4 letters, 0, then 6 alphanumerics (e.g. SBIN0001234)"
                      placeholder="e.g. SBIN0001234"
                      style="text-transform: uppercase;"
                      class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
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
                      <option value="EWS">EWS</option>
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

              <!-- Editable Section 4: Edit Documents Roster -->
              <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
                <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-[#174A6E] rounded-full"></span>
                    <span>4. Edit Attached Documents</span>
                  </h3>
                  <button
                    type="button"
                    (click)="addDocumentSlotInEdit()"
                    class="px-2.5 py-1 bg-[#174A6E] text-white rounded text-xs font-semibold hover:bg-[#123B59] cursor-pointer shadow-2xs inline-flex items-center gap-1"
                    style="color: #ffffff !important;"
                  >
                    <span>+ Add Document</span>
                  </button>
                </div>

                <div class="space-y-3">
                  @for (doc of editForm.documents; track doc.id; let idx = $index) {
                    <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                      
                      <div class="flex items-center gap-2.5 w-full md:w-auto">
                        <span class="font-mono text-slate-400 font-bold w-6">{{ idx + 1 }}.</span>
                        <div class="space-y-1 flex-1 md:w-56">
                          <label class="block text-[10.5px] font-bold text-slate-600">Document Type</label>
                          <select
                            [(ngModel)]="doc.docType"
                            [name]="'docType_' + idx"
                            class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                          >
                            <option value="Educational Qualification Certificate">Educational Qualification</option>
                            <option value="Bank Passbook / Cancelled Cheque">Bank Passbook / Cheque</option>
                            <option value="Aadhaar Card">Aadhaar Card</option>
                            <option value="Domicile Certificate">Domicile / Bonafide</option>
                            <option value="Caste Certificate">Caste Certificate</option>
                            <option value="Income Certificate">Income Certificate</option>
                            <option value="BPL Ration Card">BPL Ration Card</option>
                            <option value="Disability Certificate">Disability Certificate</option>
                            <option value="Other Document">Other Document</option>
                          </select>
                        </div>
                      </div>

                      <div class="space-y-1 w-full md:w-64">
                        <label class="block text-[10.5px] font-bold text-slate-600">Document Title</label>
                        <input
                          type="text"
                          [(ngModel)]="doc.docName"
                          [name]="'docName_' + idx"
                          class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                          placeholder="e.g. 10th Passing Certificate"
                        />
                      </div>

                      <div class="space-y-1 w-full md:w-56">
                        <label class="block text-[10.5px] font-bold text-slate-600">Attached File</label>
                        <div class="flex items-center gap-2">
                          <span class="font-mono text-[11px] text-slate-700 truncate block flex-1" [title]="doc.fileName">
                            {{ doc.fileName || 'Pending upload' }}
                          </span>
                          <button
                            type="button"
                            (click)="triggerDocFileInput(idx)"
                            class="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10.5px] font-semibold text-slate-700 cursor-pointer shadow-2xs shrink-0"
                          >
                            Browse
                          </button>
                          <input
                            [id]="'docFileInput_' + idx"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            (change)="onEditDocFileSelected(idx, $event)"
                            class="hidden"
                          />
                        </div>
                      </div>

                      <div class="flex items-center gap-2 self-end md:self-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {{ doc.status }}
                        </span>
                        <button
                          type="button"
                          (click)="removeDocumentFromEdit(idx)"
                          class="p-1 rounded text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                          title="Remove document slot"
                        >
                          ✕
                        </button>
                      </div>

                    </div>
                  }
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
                  style="color: #ffffff !important; background-color: #174A6E !important;"
                >
                  <svg class="w-4 h-4" style="color: #ffffff !important; stroke: #ffffff !important;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style="color: #ffffff !important;">Save All Changes</span>
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
            style="color: #ffffff !important;"
          >
            &larr; Return to Aspirants Roster
          </a>
        </div>
      }

      <!-- ========================================================================= -->
      <!-- MODAL: ADD NEW DOCUMENT DIALOG                                            -->
      <!-- ========================================================================= -->
      @if (showAddDocModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div class="bg-[#174A6E] text-white px-5 py-4 flex items-center justify-between">
              <h3 class="text-sm font-bold m-0" style="color: #ffffff !important;">Upload &amp; Attach Document</h3>
              <button (click)="showAddDocModal.set(false)" class="text-white hover:opacity-80 text-lg cursor-pointer">✕</button>
            </div>

            <div class="p-5 space-y-4 text-xs">
              <div>
                <label class="block text-slate-700 font-semibold mb-1">Document Category / Type *</label>
                <select
                  [(ngModel)]="newDocForm.docType"
                  class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#174A6E]"
                >
                  <option value="Educational Qualification Certificate">Educational Qualification Certificate</option>
                  <option value="Bank Passbook / Cancelled Cheque">Bank Passbook / Cancelled Cheque</option>
                  <option value="Aadhaar Card">Aadhaar Card Copy</option>
                  <option value="Domicile Certificate">Domicile / Bonafide Certificate</option>
                  <option value="Caste Certificate">Caste / Category Certificate (SC/ST/OBC)</option>
                  <option value="Income Certificate">Income Certificate</option>
                  <option value="BPL Ration Card">BPL Ration Card</option>
                  <option value="Disability Certificate">Disability / PwD Certificate</option>
                  <option value="Experience Certificate">Experience Certificate</option>
                  <option value="Other Supporting Document">Other Supporting Document</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-700 font-semibold mb-1">Document Title / Description *</label>
                <input
                  type="text"
                  [(ngModel)]="newDocForm.docName"
                  placeholder="e.g. 12th Senior Secondary Marksheet"
                  class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#174A6E]"
                />
              </div>

              <div>
                <label class="block text-slate-700 font-semibold mb-1">Select File (PDF, JPG, PNG) *</label>
                <div class="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer" (click)="newDocFileInput.click()">
                  <input
                    #newDocFileInput
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    (change)="onNewDocFileSelected($event)"
                    class="hidden"
                  />
                  <div class="space-y-1">
                    <svg class="w-8 h-8 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span class="text-xs font-semibold text-[#174A6E] block">
                      {{ newDocForm.fileName ? newDocForm.fileName : 'Click to browse file' }}
                    </span>
                    <span class="text-[11px] text-slate-400 block">
                      {{ newDocForm.fileSize ? newDocForm.fileSize : 'PDF, JPG, PNG up to 10MB' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                (click)="showAddDocModal.set(false)"
                class="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="saveNewDocument()"
                class="px-4 py-1.5 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg text-xs font-bold cursor-pointer"
                style="color: #ffffff !important;"
              >
                Upload &amp; Attach
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ========================================================================= -->
      <!-- MODAL: EDIT DOCUMENT TITLE & TYPE DIALOG                                  -->
      <!-- ========================================================================= -->
      @if (editingDoc(); as doc) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div class="bg-[#174A6E] text-white px-5 py-4 flex items-center justify-between">
              <h3 class="text-sm font-bold m-0" style="color: #ffffff !important;">Edit Document Details</h3>
              <button (click)="editingDoc.set(null)" class="text-white hover:opacity-80 text-lg cursor-pointer">✕</button>
            </div>

            <div class="p-5 space-y-4 text-xs">
              <div>
                <label class="block text-slate-700 font-semibold mb-1">Document Type</label>
                <select
                  [(ngModel)]="doc.docType"
                  class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#174A6E]"
                >
                  <option value="Educational Qualification Certificate">Educational Qualification Certificate</option>
                  <option value="Bank Passbook / Cancelled Cheque">Bank Passbook / Cancelled Cheque</option>
                  <option value="Aadhaar Card">Aadhaar Card Copy</option>
                  <option value="Domicile Certificate">Domicile / Bonafide Certificate</option>
                  <option value="Caste Certificate">Caste / Category Certificate</option>
                  <option value="Income Certificate">Income Certificate</option>
                  <option value="BPL Ration Card">BPL Ration Card</option>
                  <option value="Disability Certificate">Disability / PwD Certificate</option>
                  <option value="Other Document">Other Document</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-700 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  [(ngModel)]="doc.docName"
                  class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#174A6E]"
                />
              </div>

              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-[11px] text-slate-500 block">Current Attached File:</span>
                <span class="font-mono font-medium text-slate-800 text-xs block mt-0.5 truncate">{{ doc.fileName }}</span>
                <span class="text-[10.5px] text-slate-400 block">{{ doc.fileSize }} • {{ doc.uploadedAt || 'Verified' }}</span>
              </div>
            </div>

            <div class="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                (click)="editingDoc.set(null)"
                class="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="saveDocEdit(doc)"
                class="px-4 py-1.5 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg text-xs font-bold cursor-pointer"
                style="color: #ffffff !important;"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ========================================================================= -->
      <!-- MODAL: DOCUMENT PREVIEW DIALOG                                            -->
      <!-- ========================================================================= -->
      @if (previewDoc(); as doc) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <!-- Modal Header -->
            <div class="bg-[#174A6E] text-white px-5 py-3.5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-sm font-bold m-0" style="color: #ffffff !important;">{{ doc.docName }}</h3>
              </div>
              <button (click)="closePreview()" class="text-white hover:opacity-80 text-lg cursor-pointer">✕</button>
            </div>

            <!-- Metadata Strip -->
            <div class="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-2">
                <span class="text-slate-500">File:</span>
                <span class="font-mono font-bold text-slate-800">{{ doc.fileName }}</span>
                <span class="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px]">{{ doc.fileSize }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AEBAS Verified
                </span>
                <span class="text-[11px] text-slate-400">Uploaded: {{ doc.uploadedAt || '2026-09-02' }}</span>
              </div>
            </div>

            <!-- Document Canvas Visual Preview Mockup -->
            <div class="p-6 bg-slate-50 flex items-center justify-center min-h-[300px]">
              <div class="bg-white border-2 border-slate-300 rounded-lg shadow-md p-6 max-w-md w-full space-y-4 text-center">
                <div class="w-12 h-12 rounded-full bg-slate-100 text-[#174A6E] font-bold flex items-center justify-center mx-auto text-xl border border-slate-200">
                  🏛️
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Government of Rajasthan</h4>
                  <p class="text-[11px] text-slate-500">Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)</p>
                </div>
                
                <div class="border-t border-b border-slate-100 py-3 space-y-1">
                  <span class="text-xs font-bold text-slate-800 block">{{ doc.docType }}</span>
                  <span class="font-mono text-[11px] text-slate-600 block">{{ doc.docName }}</span>
                  <span class="text-[10px] font-mono text-slate-400 block">Doc Ref: REF-{{ doc.id }}-{{ aspirant()?.id }}</span>
                </div>

                <div class="flex items-center justify-center gap-2 pt-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="text-[11px] font-semibold text-emerald-700">Digital Document Authenticated &amp; Validated</span>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between">
              <!-- Direct Replace from inside preview modal -->
              <div>
                <button
                  type="button"
                  (click)="modalReplaceFileInput.click()"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Replace Document File</span>
                </button>
                <input
                  #modalReplaceFileInput
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  (change)="onModalReplaceFile(doc, $event)"
                  class="hidden"
                />
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="downloadSampleDoc(doc)"
                  class="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  Download
                </button>
                <button
                  type="button"
                  (click)="closePreview()"
                  class="px-4 py-1.5 bg-[#174A6E] text-white rounded-lg text-xs font-bold cursor-pointer"
                  style="color: #ffffff !important;"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
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

  // Document management signals
  previewDoc = signal<AspirantDocumentItem | null>(null);
  editingDoc = signal<AspirantDocumentItem | null>(null);
  showAddDocModal = signal<boolean>(false);
  newDocForm: Partial<AspirantDocumentItem> = {
    docType: 'Educational Qualification Certificate',
    docName: '',
    fileName: '',
    fileSize: '',
    status: 'UPLOADED'
  };

  targetDocForReplace: AspirantDocumentItem | null = null;
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
    let cand = this.aspirantService.getAspirantById(id);
    if (cand) {
      // Ensure documents array is safely initialized with fallback documents if empty
      if (!cand.documents || cand.documents.length === 0) {
        cand = {
          ...cand,
          documents: [
            { id: 'doc-1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Copy', fileName: cand.aadhaarDocName || 'Aadhaar_Document.pdf', fileSize: cand.aadhaarDocSize || '1.4 MB', status: 'UPLOADED', uploadedAt: '2026-09-02' },
            { id: 'doc-2', docType: 'Educational Qualification Certificate', docName: 'Educational Qualification Certificate', fileName: '12th_Pass_Certificate.pdf', fileSize: '2.1 MB', status: 'UPLOADED', uploadedAt: '2026-09-02' },
            { id: 'doc-3', docType: 'Bank Passbook / Cancelled Cheque', docName: 'Bank Passbook / Cancelled Cheque', fileName: 'Bank_Passbook.jpg', fileSize: '850 KB', status: 'UPLOADED', uploadedAt: '2026-09-02' }
          ]
        };
      }
      this.aspirant.set(cand);
      this.editForm = JSON.parse(JSON.stringify(cand));
    } else {
      this.aspirant.set(null);
    }
  }

  startEditing(cand: AspirantRecord): void {
    this.editForm = JSON.parse(JSON.stringify(cand));
    if (!this.editForm.documents || this.editForm.documents.length === 0) {
      this.editForm.documents = [
        { id: 'doc-1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Copy', fileName: cand.aadhaarDocName || 'Aadhaar_Document.pdf', fileSize: '1.4 MB', status: 'UPLOADED' },
        { id: 'doc-2', docType: 'Educational Qualification Certificate', docName: 'Educational Qualification Certificate', fileName: '12th_Pass_Certificate.pdf', fileSize: '2.1 MB', status: 'UPLOADED' },
        { id: 'doc-3', docType: 'Bank Passbook / Cancelled Cheque', docName: 'Bank Passbook / Cancelled Cheque', fileName: 'Bank_Passbook.jpg', fileSize: '850 KB', status: 'UPLOADED' }
      ];
    }
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

  saveChanges(): void {
    const current = this.aspirant();
    if (!current) return;

    const updated = this.aspirantService.updateAspirant(current.id, this.editForm);
    if (updated) {
      this.aspirant.set(updated);
      this.isEditMode.set(false);
      this.showSuccess(`Aspirant particulars and documents updated successfully!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateStatus(newStatus: AspirantTrainingStatus): void {
    const current = this.aspirant();
    if (!current) return;

    this.aspirantService.updateTrainingStatus(current.id, newStatus);
    this.aspirant.update(c => c ? { ...c, trainingStatus: newStatus } : null);
    this.editForm.trainingStatus = newStatus;
    this.showSuccess(`Training status changed to "${newStatus}"!`);
  }

  toggleBiometric(): void {
    const current = this.aspirant();
    if (!current) return;

    this.aspirantService.toggleBiometric(current.id);
    this.aspirant.update(c => c ? { ...c, biometricVerified: !c.biometricVerified } : null);
    this.showSuccess(`Biometric verification status updated!`);
  }

  // =========================================================================
  // DOCUMENT MANAGEMENT & REPLACEMENT METHODS
  // =========================================================================

  triggerReplaceDoc(doc: AspirantDocumentItem, fileInput: HTMLInputElement): void {
    this.targetDocForReplace = doc;
    fileInput.click();
  }

  onFileSelectedForReplace(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.targetDocForReplace) {
      const file = input.files[0];
      const fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      this.replaceDocumentFile(this.targetDocForReplace.id, file.name, fileSize);
      input.value = '';
    }
  }

  replaceDocumentFile(docId: string, newFileName: string, newFileSize: string): void {
    const current = this.aspirant();
    if (!current) return;

    const updatedDocs = (current.documents || []).map(d => {
      if (d.id === docId) {
        return {
          ...d,
          fileName: newFileName,
          fileSize: newFileSize,
          status: 'UPLOADED' as const,
          uploadedAt: new Date().toISOString().split('T')[0]
        };
      }
      return d;
    });

    const isAadhaarDoc = docId === 'doc-1' || docId === 'd1';
    const updated = this.aspirantService.updateAspirant(current.id, {
      documents: updatedDocs,
      ...(isAadhaarDoc ? { aadhaarDocName: newFileName, aadhaarDocSize: newFileSize } : {})
    });

    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.showSuccess(`Document file replaced with "${newFileName}" successfully!`);
    }
  }

  // Aadhaar Specific Replace
  previewAadhaarProof(cand: AspirantRecord): void {
    const aadhaarDoc: AspirantDocumentItem = {
      id: 'doc-aadhaar',
      docType: 'Aadhaar Card',
      docName: 'Aadhaar Card Document Proof',
      fileName: cand.aadhaarDocName || 'Aadhaar_Document.pdf',
      fileSize: cand.aadhaarDocSize || '1.4 MB',
      status: 'UPLOADED',
      uploadedAt: cand.enrollmentDate
    };
    this.openPreviewDoc(aadhaarDoc);
  }

  onAadhaarDocReplaced(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const current = this.aspirant();
      if (!current) return;

      const updatedDocs = (current.documents || []).map(d => {
        if (d.docType.toLowerCase().includes('aadhaar')) {
          return { ...d, fileName: file.name, fileSize, status: 'UPLOADED' as const };
        }
        return d;
      });

      const updated = this.aspirantService.updateAspirant(current.id, {
        aadhaarDocName: file.name,
        aadhaarDocSize: fileSize,
        documents: updatedDocs
      });

      if (updated) {
        this.aspirant.set(updated);
        this.editForm = JSON.parse(JSON.stringify(updated));
        this.showSuccess(`Aadhaar proof document replaced with "${file.name}"!`);
      }
      input.value = '';
    }
  }

  onEditAadhaarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.editForm.aadhaarDocName = file.name;
      this.editForm.aadhaarDocSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      this.showSuccess(`New Aadhaar document selected: "${file.name}"`);
      input.value = '';
    }
  }

  openPreviewDoc(doc: AspirantDocumentItem): void {
    this.previewDoc.set(doc);
  }

  closePreview(): void {
    this.previewDoc.set(null);
  }

  onModalReplaceFile(doc: AspirantDocumentItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      this.replaceDocumentFile(doc.id, file.name, fileSize);
      this.previewDoc.update(cur => cur ? { ...cur, fileName: file.name, fileSize } : null);
      input.value = '';
    }
  }

  downloadSampleDoc(doc: AspirantDocumentItem): void {
    this.showSuccess(`Downloading document: ${doc.fileName}...`);
  }

  openEditDocModal(doc: AspirantDocumentItem): void {
    this.editingDoc.set({ ...doc });
  }

  saveDocEdit(doc: AspirantDocumentItem): void {
    const current = this.aspirant();
    if (!current) return;

    const updatedDocs = (current.documents || []).map(d => d.id === doc.id ? doc : d);
    const updated = this.aspirantService.updateAspirant(current.id, { documents: updatedDocs });
    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.editingDoc.set(null);
      this.showSuccess(`Document details updated successfully!`);
    }
  }

  deleteDocument(doc: AspirantDocumentItem): void {
    if (!confirm(`Are you sure you want to remove the document "${doc.docName}"?`)) return;

    const current = this.aspirant();
    if (!current) return;

    const updatedDocs = (current.documents || []).filter(d => d.id !== doc.id);
    const updated = this.aspirantService.updateAspirant(current.id, { documents: updatedDocs });
    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.showSuccess(`Document "${doc.docName}" removed from records.`);
    }
  }

  openAddDocModal(): void {
    this.newDocForm = {
      id: 'doc-' + Date.now(),
      docType: 'Educational Qualification Certificate',
      docName: '',
      fileName: '',
      fileSize: '',
      status: 'UPLOADED',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    this.showAddDocModal.set(true);
  }

  onNewDocFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newDocForm.fileName = file.name;
      this.newDocForm.fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      if (!this.newDocForm.docName) {
        this.newDocForm.docName = file.name.replace(/\.[^/.]+$/, "");
      }
    }
  }

  saveNewDocument(): void {
    if (!this.newDocForm.docType || !this.newDocForm.docName) {
      alert('Please fill in the document type and title.');
      return;
    }

    const current = this.aspirant();
    if (!current) return;

    const newDoc: AspirantDocumentItem = {
      id: 'doc-' + Date.now(),
      docType: this.newDocForm.docType || 'Supporting Document',
      docName: this.newDocForm.docName || 'Document Attachment',
      fileName: this.newDocForm.fileName || `${this.newDocForm.docName?.replace(/\s+/g, '_')}.pdf`,
      fileSize: this.newDocForm.fileSize || '1.2 MB',
      status: 'UPLOADED',
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const updatedDocs = [...(current.documents || []), newDoc];
    const updated = this.aspirantService.updateAspirant(current.id, { documents: updatedDocs });
    if (updated) {
      this.aspirant.set(updated);
      this.editForm = JSON.parse(JSON.stringify(updated));
      this.showAddDocModal.set(false);
      this.showSuccess(`New document "${newDoc.docName}" attached successfully!`);
    }
  }

  // Edit Mode document list helpers
  addDocumentSlotInEdit(): void {
    if (!this.editForm.documents) {
      this.editForm.documents = [];
    }
    this.editForm.documents.push({
      id: 'doc-' + Date.now(),
      docType: 'Other Document',
      docName: 'Supporting Document',
      fileName: 'document.pdf',
      fileSize: '1.0 MB',
      status: 'UPLOADED',
      uploadedAt: new Date().toISOString().split('T')[0]
    });
  }

  removeDocumentFromEdit(idx: number): void {
    if (this.editForm.documents) {
      this.editForm.documents.splice(idx, 1);
    }
  }

  triggerDocFileInput(idx: number): void {
    const el = document.getElementById('docFileInput_' + idx) as HTMLInputElement;
    if (el) el.click();
  }

  onEditDocFileSelected(idx: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.editForm.documents && this.editForm.documents[idx]) {
      const file = input.files[0];
      this.editForm.documents[idx].fileName = file.name;
      this.editForm.documents[idx].fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      this.editForm.documents[idx].status = 'UPLOADED';
      this.showSuccess(`Selected file "${file.name}" for document item ${idx + 1}`);
    }
  }

  getDocExtension(filename?: string): string {
    if (!filename) return 'DOC';
    const ext = filename.split('.').pop()?.toUpperCase();
    return ext && ext.length <= 4 ? ext : 'DOC';
  }

  showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => {
      if (this.successMessage() === msg) {
        this.successMessage.set('');
      }
    }, 4500);
  }

  printDossier(cand: AspirantRecord): void {
    window.print();
  }
}
