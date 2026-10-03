import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SdcService } from '../services/sdc.service';
import { SdcRecord, CenterPhotoItem, SDC_SECTOR_OPTIONS } from '../models/sdc.model';
import { RAJASTHAN_LOCATION_DATA } from '../config/sdc-form.config';
import { AuthService } from '../../../core/auth/auth.service';
import { PageHeaderComponent } from '../../../shared/components';

@Component({
  selector: 'app-sdc-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      
      @if (sdc(); as center) {
        <div class="p-4 sm:p-6 lg:p-7 space-y-5 max-w-7xl mx-auto">
          
          <!-- Top Page Header -->
          <app-page-header
            [title]="center.sdcName + ' (' + center.sdcCode + ')'"
            bgColor="var(--color-primary, #174A6E)"
            [showBack]="true"
            [backUrl]="backUrl()"
            backTitle="Back to SDC List"
          >
            <div class="flex items-center gap-2">
              @if (!isEditing()) {
                <button
                  type="button"
                  (click)="startEditing(center)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-white/20 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Edit SDC Creation Details"
                >
                  <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Details</span>
                </button>
              }
            </div>
          </app-page-header>

          <!-- Success Alert Banner -->
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

          <!-- ========================================================================= -->
          <!-- HERO OVERVIEW STRIP: Training Partner + SDC Identity in ISMS Theme         -->
          <!-- ========================================================================= -->
          <div class="rounded-xl border border-[#D9E1E7] bg-[#EAF2F6]/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            
            <!-- Left: Training Partner & Center Code -->
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-[#174A6E] text-white text-[10.5px] font-bold uppercase tracking-wider">
                  Training Partner
                </span>
                <span class="font-mono text-xs font-semibold text-slate-600">
                  {{ center.mouRefNo || 'MOU Registered' }}
                </span>
              </div>
              <div class="text-base sm:text-lg font-bold text-slate-900">
                {{ center.tpName }}
              </div>
              <div class="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                <span>Center: <strong class="text-slate-800">{{ center.sdcName }}</strong></span>
                <span>•</span>
                <span class="font-mono font-medium text-[#174A6E]">{{ center.sdcCode }}</span>
                <span>•</span>
                <span>Scheme: <strong class="text-slate-800">{{ center.scheme }}</strong> ({{ center.schemeCategory || 'General' }})</span>
              </div>
            </div>

            <!-- Right: Status & Capacity Badges -->
            <div class="flex items-center gap-4 sm:gap-6">
              
              <!-- Target Capacity -->
              <div class="text-right">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Target Capacity</span>
                <span class="font-bold text-slate-900 text-sm">
                  {{ center.approval?.approvedTargetCapacity || center.sdcCapacity }} Trainees
                </span>
              </div>

              <!-- Status (Bold Black Uppercase Text) -->
              <div class="text-right border-l border-[#D9E1E7] pl-4 sm:pl-6">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Current Status</span>
                <span class="font-bold text-sm tracking-wide uppercase text-black" style="color: #000000 !important; font-weight: bold;">
                  {{ formatStatus(center.status).toUpperCase() }}
                </span>
              </div>

            </div>

          </div>

          <!-- ========================================================================= -->
          <!-- ADMIN SCRUTINY & APPROVAL DECISION PANEL (When role is Admin)              -->
          <!-- ========================================================================= -->
          @if (isAdmin() && !isEditing()) {
            
            @if (center.status === 'APPROVED') {
              <!-- Approved Notice Card -->
              <div class="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-emerald-900 text-sm">SDC Approved by Department</h4>
                    <p class="text-emerald-800 text-xs mt-0.5">
                      {{ center.approval?.approvalRemarks || 'Center certified and sanctioned for training batches mobilization.' }}
                    </p>
                    <div class="text-[11px] text-emerald-700 mt-1 flex items-center gap-3">
                      <span>Approved Target Capacity: <strong>{{ center.approval?.approvedTargetCapacity || center.sdcCapacity }} Trainees</strong></span>
                      <span>•</span>
                      <span>Approved Date: <strong>{{ center.approval?.approvedDate || '2026-09-15' }}</strong></span>
                      <span>•</span>
                      <span>Authority: <strong>{{ center.approval?.approvedBy || 'RSLDC Authority' }}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            } @else {
              <!-- Actionable Scrutiny & Approval Box -->
              <div class="rounded-xl border border-[#174A6E]/30 bg-white shadow-xs overflow-hidden">
                
                <!-- Decision Header -->
                <div class="bg-[#174A6E] text-white px-5 py-3 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span class="font-bold text-xs uppercase tracking-wider">Department Scrutiny & Approval Decision</span>
                  </div>
                  <span class="text-[11px] text-white/80 font-mono">Status: {{ center.status }}</span>
                </div>

                <!-- Inspection Findings Summary if available -->
                @if (center.inspection) {
                  <div class="bg-[#F8FAFC] border-b border-slate-200 p-4 text-xs">
                    <div class="font-semibold text-slate-800 mb-2 flex items-center justify-between">
                      <span>Auditor Physical Inspection Summary:</span>
                      <span class="px-2 py-0.5 rounded text-[10.5px] font-bold"
                            [class.bg-emerald-100]="center.inspection.recommendation === 'RECOMMENDED'"
                            [class.text-emerald-800]="center.inspection.recommendation === 'RECOMMENDED'"
                            [class.bg-amber-100]="center.inspection.recommendation !== 'RECOMMENDED'"
                            [class.text-amber-800]="center.inspection.recommendation !== 'RECOMMENDED'">
                        Recommendation: {{ center.inspection.recommendation }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11.5px] text-slate-600">
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">Auditor</span>
                        <strong class="text-slate-800">{{ center.inspection.auditorName }}</strong>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">Inspection Date</span>
                        <strong class="text-slate-800">{{ center.inspection.inspectionDate }}</strong>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">Geo Distance</span>
                        <strong [class.text-emerald-700]="center.inspection.geoMatched" [class.text-rose-700]="!center.inspection.geoMatched">
                          {{ center.inspection.geoDistanceMeters }}m ({{ center.inspection.geoMatched ? 'Within 100m' : 'Exceeded' }})
                        </strong>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">AEBAS Biometric</span>
                        <strong class="text-emerald-700">Functional & Verified</strong>
                      </div>
                    </div>

                    <div class="mt-2 text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                      "{{ center.inspection.auditorRemarks }}"
                    </div>
                  </div>
                }

                <!-- Approval Form Controls -->
                <div class="p-5 space-y-4 text-xs">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label class="block font-semibold text-slate-700 mb-1">
                        Sanctioned Target Capacity (Trainees) <span class="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        [(ngModel)]="adminTargetCapacity"
                        min="1"
                        max="5000"
                        class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A6E]"
                      />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block font-semibold text-slate-700 mb-1">
                        Approval / Department Remarks <span class="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="adminRemarks"
                        class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#174A6E]"
                        placeholder="Enter official remarks..."
                      />
                    </div>
                  </div>

                  <!-- Decision Actions -->
                  <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 flex-wrap">
                    
                    <button
                      type="button"
                      (click)="returnToTp(center)"
                      class="px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Return to TP for Corrections
                    </button>

                    <button
                      type="button"
                      (click)="rejectSdc(center)"
                      class="px-3.5 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Reject SDC
                    </button>

                    <button
                      type="button"
                      (click)="approveSdc(center)"
                      class="px-5 py-2 rounded-lg bg-[#174A6E] hover:bg-[#123B59] active:bg-[#0E2D44] text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <svg class="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Approve SDC</span>
                    </button>

                  </div>

                </div>

              </div>
            }

          }

          <!-- ========================================================================= -->
          <!-- VIEW MODE: Complete SDC Creation Details in exact 7-row form sequence      -->
          <!-- ========================================================================= -->
          @if (!isEditing()) {
            <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-6">
              
              <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-[#174A6E]"></span>
                  <span>Registered Center Details & Infrastructure</span>
                </h3>
                <span class="text-xs text-slate-500 font-mono">{{ center.sdcCode }}</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
                
                <!-- Row 1: Center Name (colSpan 2) + Sector (colSpan 2) -->
                <div class="sm:col-span-2">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Center Name</span>
                  <span class="font-bold text-slate-900 text-[13px] mt-0.5 block">{{ center.sdcName }}</span>
                </div>

                <div class="sm:col-span-2">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Sector</span>
                  <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ center.sector || 'Aerospace and Aviation' }}</span>
                </div>

                <!-- Row 2: State (1) + District (1) + Assembly Constituency (1) + Parliament Constituency (1) -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">State</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.state || 'Rajasthan' }}</span>
                </div>

                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">District</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.district }}</span>
                </div>

                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assembly Constituency</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.assemblyConstituency || 'Sanganer' }}</span>
                </div>

                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Parliament Constituency</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.parliamentConstituency || 'Jaipur Rural' }}</span>
                </div>

                <!-- Row 3: Division (1) + Block (1) + Proposed Start Date (1) + SDC Capacity (1) -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Division</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.division || 'Jaipur' }}</span>
                </div>

                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Block</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.block || 'Sanganer' }}</span>
                </div>

                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Proposed Start Date</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.proposedStartDate }}</span>
                </div>

                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">SDC Capacity</span>
                  <span class="font-bold text-slate-900 text-[13px] mt-0.5 block">{{ center.sdcCapacity }} Aspirants</span>
                </div>

                <!-- Row 4: Center Email (1) + Address (2) + Pin Code (1) -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Center Email</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.centerEmail }}</span>
                </div>

                <div class="sm:col-span-2">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Complete Address</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block leading-relaxed">{{ center.fullAddress }}</span>
                </div>

                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pin Code</span>
                  <span class="font-mono font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.pincode }}</span>
                </div>

                <!-- Row 5: Total TP Trained (1) + Total TP Placed (1) + Hostel Category (2) -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total TP Trained</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.totalTrainedAspirants ?? 500 }} Aspirants</span>
                </div>

                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total TP Placed</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.totalPlacedAspirants ?? 400 }} Candidates</span>
                </div>

                <div class="sm:col-span-2">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Hostel Category</span>
                  <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.hostelCategory || 'Residential (Both Boys & Girls)' }}</span>
                </div>

                <!-- Row 6: Latitude (1) + Longitude (1) + Remarks (2) -->
                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Latitude</span>
                  <span class="font-mono text-slate-800 text-[13px] mt-0.5 block">{{ center.latitude }}</span>
                </div>

                <div>
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Longitude</span>
                  <span class="font-mono text-slate-800 text-[13px] mt-0.5 block">{{ center.longitude }}</span>
                </div>

                <div class="sm:col-span-2">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Remarks</span>
                  <span class="font-medium text-slate-700 text-[13px] mt-0.5 block italic">{{ center.remarks || 'Ready for auditor inspection' }}</span>
                </div>

                <!-- Row 7 (LAST): Center Photos (colSpan 4) -->
                <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">Center Photos (JPG)</span>
                  @if ((center.centerPhotos || []).length > 0) {
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                      @for (photo of center.centerPhotos; track photo.name || photo.id; let idx = $index) {
                        <div
                          (click)="openPhoto(photo)"
                          class="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-md transition-all cursor-pointer flex flex-col"
                        >
                          <div class="w-full h-36 bg-slate-100 overflow-hidden flex items-center justify-center relative">
                            <img
                              [src]="photo.url"
                              [alt]="photo.name"
                              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <span class="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded bg-white/90 text-slate-800 text-[11px] font-semibold shadow-xs">
                                View
                              </span>
                            </div>
                          </div>
                          <div class="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                            <span class="font-semibold text-slate-800 text-[11.5px] truncate">{{ photo.tag || ('Photo ' + (idx + 1)) }}</span>
                            <span class="text-[10px] text-slate-400 font-mono">{{ photo.size || '' }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="p-4 text-center text-slate-400 text-xs rounded-lg border border-dashed border-slate-200">
                      No center photographs uploaded.
                    </div>
                  }
                </div>

              </div>

            </div>
          }

          <!-- ========================================================================= -->
          <!-- EDIT MODE: Edit SDC Creation Details directly on the page                 -->
          <!-- ========================================================================= -->
          @if (isEditing()) {
            <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-4 animate-in fade-in duration-150">
              
              <div class="border-b border-slate-100 pb-2">
                <h3 class="text-sm font-bold text-slate-800">Edit SDC Registration Information</h3>
                <p class="text-xs text-slate-500">Update center information, capacity, infrastructure parameters, and photos.</p>
              </div>

              <!-- 4-Column Form Grid matching SDC creation form -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                <!-- Row 1: Center Name (colSpan 2) + Sector (colSpan 2) -->
                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">
                    Center Name <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="editModel.sdcName"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                    placeholder="Enter Center Name"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">
                    Sector <span class="text-rose-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="editModel.sector"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  >
                    @for (sec of sectors; track sec) {
                      <option [value]="sec">{{ sec }}</option>
                    }
                  </select>
                </div>

                <!-- Row 2: State (1) + District (1) + Assembly Constituency (1) + Parliament Constituency (1) -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    [value]="editModel.state"
                    disabled
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    District <span class="text-rose-500">*</span>
                  </label>
                  <select
                    [ngModel]="editModel.district"
                    (ngModelChange)="onDistrictChange($event)"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  >
                    @for (d of districts; track d) {
                      <option [value]="d">{{ d }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Assembly Constituency <span class="text-rose-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="editModel.assemblyConstituency"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  >
                    @for (a of assemblyConstituencies; track a) {
                      <option [value]="a">{{ a }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Parliament Constituency <span class="text-rose-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="editModel.parliamentConstituency"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  >
                    @for (p of parliamentConstituencies; track p) {
                      <option [value]="p">{{ p }}</option>
                    }
                  </select>
                </div>

                <!-- Row 3: Division (1) + Block (1) + Proposed Start Date (1) + SDC Capacity (1) -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Division</label>
                  <input
                    type="text"
                    [value]="editModel.division"
                    disabled
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Block <span class="text-rose-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="editModel.block"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  >
                    @for (b of blocks; track b) {
                      <option [value]="b">{{ b }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Proposed Start Date <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="editModel.proposedStartDate"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    SDC Capacity <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    [(ngModel)]="editModel.sdcCapacity"
                    min="1"
                    max="1000"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  />
                </div>

                <!-- Row 4: Center Email (1) + Address (2) + Pin Code (1) -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Center Email <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    [(ngModel)]="editModel.centerEmail"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                    placeholder="center@example.com"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">
                    Complete Address <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="editModel.fullAddress"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                    placeholder="Street address, building, landmark"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Pin Code <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="editModel.pincode"
                    maxlength="6"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                    placeholder="302029"
                  />
                </div>

                <!-- Row 5: Total TP Trained (1) + Total TP Placed (1) + Hostel Category (2) -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Total TP Trained</label>
                  <input
                    type="number"
                    [(ngModel)]="editModel.totalTrainedAspirants"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Total TP Placed</label>
                  <input
                    type="number"
                    [(ngModel)]="editModel.totalPlacedAspirants"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">Hostel Category</label>
                  <select
                    [(ngModel)]="editModel.hostelCategory"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  >
                    @for (cat of hostelCategories; track cat) {
                      <option [value]="cat">{{ cat }}</option>
                    }
                  </select>
                </div>

                <!-- Row 6: Latitude (1) + Longitude (1) + Remarks (2) -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    [(ngModel)]="editModel.latitude"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    [(ngModel)]="editModel.longitude"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">Remarks</label>
                  <input
                    type="text"
                    [(ngModel)]="editModel.remarks"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#174A6E] focus:border-transparent"
                    placeholder="Remarks"
                  />
                </div>

                <!-- Row 7 (LAST): Center Photos Manager -->
                <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100">
                  <div class="flex items-center justify-between mb-2">
                    <label class="block font-semibold text-slate-700">
                      Center Photos (JPG) <span class="text-rose-500">*</span>
                    </label>
                    <label class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#174A6E] hover:bg-[#123B59] text-white text-[11px] font-semibold cursor-pointer shadow-2xs">
                      <span>+ Upload Photos</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,image/jpeg"
                        multiple
                        class="hidden"
                        (change)="onAddPhotos($event)"
                      />
                    </label>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    @for (photo of editModel.centerPhotos; track photo.id || photo.name; let idx = $index) {
                      <div class="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group flex flex-col">
                        <div class="w-full h-32 bg-slate-100 overflow-hidden flex items-center justify-center">
                          <img [src]="photo.url" [alt]="photo.name" class="w-full h-full object-cover" />
                        </div>
                        <div class="p-2 bg-white border-t border-slate-100 flex items-center justify-between">
                          <span class="text-[11px] font-semibold text-slate-700 truncate">{{ photo.tag || ('Photo ' + (idx + 1)) }}</span>
                          <button
                            type="button"
                            (click)="removePhoto(idx)"
                            class="text-rose-500 hover:text-rose-700 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-rose-50"
                          >✕</button>
                        </div>
                      </div>
                    }
                  </div>
                </div>

              </div>

              <!-- Form Action Buttons -->
              <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  (click)="cancelEditing()"
                  class="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  (click)="saveEditing(center.id)"
                  class="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  style="color: #ffffff !important;"
                >
                  <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </button>
              </div>

            </div>
          }

        </div>
      } @else {
        <div class="p-12 text-center text-slate-500">
          <p>SDC Center not found.</p>
          <a [routerLink]="backUrl()" class="text-[#174A6E] font-bold hover:underline mt-2 inline-block">
            Return to SDC Directory
          </a>
        </div>
      }

      <!-- Modal: High Resolution Photo Preview -->
      @if (selectedPhoto(); as p) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          (click)="closePhoto()"
        >
          <div
            class="bg-white rounded-xl border border-slate-300 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
            <div class="px-5 py-3 border-b border-slate-200 bg-[#174A6E] text-white flex items-center justify-between gap-3 shrink-0">
              <div class="truncate">
                <h3 class="text-sm font-semibold text-white tracking-tight m-0 truncate" style="color: #ffffff !important;">
                  {{ p.tag || p.name }}
                </h3>
                <span class="text-[11px] text-white/80 font-normal" style="color: rgba(255,255,255,0.85) !important;">
                  {{ p.name }} {{ p.size ? '• ' + p.size : '' }}
                </span>
              </div>
              <button
                type="button"
                (click)="closePhoto()"
                class="w-7 h-7 rounded-full text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            <!-- Image View -->
            <div class="p-4 bg-slate-100 flex items-center justify-center overflow-auto max-h-[72vh]">
              <img
                [src]="p.url"
                [alt]="p.name"
                class="max-w-full max-h-[68vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class SdcDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly sdcService = inject(SdcService);
  readonly authService = inject(AuthService);

  centerId = signal<string>('');
  isEditing = signal<boolean>(false);
  successMessage = signal<string>('');
  selectedPhoto = signal<CenterPhotoItem | null>(null);

  /** Detect Admin vs TP mode */
  readonly isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'dept_admin' || (this.router.url.startsWith('/sdc') && !this.router.url.startsWith('/sdcs'));
  });

  /** Dynamic back URL */
  readonly backUrl = computed(() => this.isAdmin() ? '/sdc' : '/sdcs');

  /** Admin decision form values */
  adminTargetCapacity = 100;
  adminRemarks = 'Approved in accordance with RSLDC guidelines and verified physical infrastructure.';

  sectors = SDC_SECTOR_OPTIONS;
  districts = Object.keys(RAJASTHAN_LOCATION_DATA);
  assemblyConstituencies: string[] = [];
  parliamentConstituencies: string[] = [];
  blocks: string[] = [];

  hostelCategories = [
    'Residential (Both Boys & Girls)',
    'Residential (Boys Only)',
    'Residential (Girls Only)'
  ];

  editModel: any = {};

  readonly sdc = computed(() => {
    const id = this.centerId();
    return this.sdcService.getSdcById(id);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.centerId.set(id);
        const center = this.sdcService.getSdcById(id);
        if (center) {
          this.adminTargetCapacity = center.sdcCapacity || 100;
        }
      }
    });
  }

  formatStatus(status?: string): string {
    switch (status) {
      case 'APPROVED': return 'Approved';
      case 'PENDING_INSPECTION': return 'Pending Inspection';
      case 'INSPECTION_COMPLETED': return 'Inspection Completed';
      case 'PENDING_APPROVAL': return 'Pending Approval';
      case 'REJECTED': return 'Rejected';
      case 'RETURNED_TO_TP': return 'Returned to TP';
      case 'DRAFT': return 'Draft';
      case 'SUBMITTED': return 'Submitted';
      default: return status || '—';
    }
  }

  approveSdc(center: SdcRecord): void {
    this.sdcService.approveSdc(center.id, this.adminTargetCapacity || center.sdcCapacity, this.adminRemarks);
    this.successMessage.set(`SDC "${center.sdcName}" has been successfully approved for ${center.tpName}!`);
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  rejectSdc(center: SdcRecord): void {
    if (!confirm(`Are you sure you want to reject SDC "${center.sdcName}"?`)) return;
    this.sdcService.rejectSdc(center.id, this.adminRemarks || 'Rejected by Department Authority');
    this.successMessage.set(`SDC "${center.sdcName}" has been rejected.`);
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  returnToTp(center: SdcRecord): void {
    const reason = prompt('Please enter correction instructions for the Training Partner:', 'Please upload updated NOC and lab verification photos.');
    if (reason) {
      this.sdcService.returnToTp(center.id, reason);
      this.successMessage.set(`SDC returned to ${center.tpName} for corrections.`);
      setTimeout(() => this.successMessage.set(''), 5000);
    }
  }

  startEditing(center: SdcRecord): void {
    this.editModel = {
      sdcName: center.sdcName,
      sector: center.sector || 'Aerospace and Aviation',
      scheme: center.scheme,
      schemeCategory: center.schemeCategory || 'RAJKVIK',
      state: center.state || 'Rajasthan',
      district: center.district || 'Jaipur',
      assemblyConstituency: center.assemblyConstituency || '',
      parliamentConstituency: center.parliamentConstituency || '',
      division: center.division || 'Jaipur',
      block: center.block || '',
      proposedStartDate: center.proposedStartDate || '',
      sdcCapacity: center.sdcCapacity,
      centerEmail: center.centerEmail || '',
      fullAddress: center.fullAddress || '',
      pincode: center.pincode || '',
      totalTrainedAspirants: center.totalTrainedAspirants ?? 500,
      totalPlacedAspirants: center.totalPlacedAspirants ?? 400,
      hostelCategory: center.hostelCategory || 'Residential (Both Boys & Girls)',
      latitude: center.latitude,
      longitude: center.longitude,
      remarks: center.remarks || '',
      tpName: center.tpName || 'SkillMasters Rajasthan',
      centerPhotos: center.centerPhotos ? JSON.parse(JSON.stringify(center.centerPhotos)) : []
    };
    this.updateLocationDropdowns(this.editModel.district);
    this.isEditing.set(true);
  }

  onDistrictChange(newDistrict: string): void {
    this.editModel.district = newDistrict;
    this.updateLocationDropdowns(newDistrict);
  }

  updateLocationDropdowns(district: string): void {
    const info = RAJASTHAN_LOCATION_DATA[district] || RAJASTHAN_LOCATION_DATA['Jaipur'];
    if (info) {
      this.editModel.division = info.division;
      this.assemblyConstituencies = info.assemblyConstituencies || [];
      this.parliamentConstituencies = info.parliamentConstituencies || [];
      this.blocks = info.blocks || [];
      if (!this.assemblyConstituencies.includes(this.editModel.assemblyConstituency)) {
        this.editModel.assemblyConstituency = this.assemblyConstituencies[0] || '';
      }
      if (!this.parliamentConstituencies.includes(this.editModel.parliamentConstituency)) {
        this.editModel.parliamentConstituency = this.parliamentConstituencies[0] || '';
      }
      if (!this.blocks.includes(this.editModel.block)) {
        this.editModel.block = this.blocks[0] || '';
      }
    }
  }

  onAddPhotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    if (!this.editModel.centerPhotos) {
      this.editModel.centerPhotos = [];
    }

    Array.from(input.files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const url = e.target?.result as string;
        const photoNum = this.editModel.centerPhotos.length + 1;
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        this.editModel.centerPhotos.push({
          id: `photo-${Date.now()}-${index}`,
          name: file.name,
          url,
          size: sizeMb,
          tag: `Photo ${photoNum}`
        });
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removePhoto(index: number): void {
    if (this.editModel.centerPhotos) {
      this.editModel.centerPhotos.splice(index, 1);
    }
  }

  saveEditing(id: string): void {
    this.sdcService.updateSdc(id, this.editModel);
    this.isEditing.set(false);
    this.successMessage.set('SDC registration details updated successfully!');
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  openPhoto(photo: CenterPhotoItem): void {
    this.selectedPhoto.set(photo);
  }

  closePhoto(): void {
    this.selectedPhoto.set(null);
  }
}
