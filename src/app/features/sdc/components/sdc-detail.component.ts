import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SdcService } from '../services/sdc.service';
import { SdcRecord, CenterPhotoItem, SDC_SECTOR_OPTIONS } from '../models/sdc.model';
import { RAJASTHAN_LOCATION_DATA } from '../config/sdc-form.config';
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
        <div class="p-4 sm:p-6 lg:p-7 space-y-4 max-w-7xl mx-auto">
          
          <!-- Top Page Header (No sub-points, no breadcrumbs, no badges, and NO Save/Cancel buttons during edit) -->
          <app-page-header
            [title]="center.sdcName + ' (' + center.sdcCode + ')'"
            bgColor="#0B3558"
            [showBack]="true"
            backUrl="/sdcs"
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
          <!-- VIEW MODE: Complete SDC Creation Details in exact 7-row form sequence      -->
          <!-- ========================================================================= -->
          @if (!isEditing()) {
            <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-5">
              
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
                  <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">Center Photos</span>
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
          <!-- Includes full option to edit / add / remove uploaded center photos        -->
          <!-- ========================================================================= -->
          @if (isEditing()) {
            <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-4 animate-in fade-in duration-150">
              
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
                    placeholder="Enter Center Name"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">
                    Sector <span class="text-rose-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="editModel.sector"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
                    placeholder="302029"
                  />
                </div>

                <!-- Row 5: Total TP Trained (1) + Total TP Placed (1) + Hostel Category (2) -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Total TP Trained</label>
                  <input
                    type="number"
                    [(ngModel)]="editModel.totalTrainedAspirants"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Total TP Placed</label>
                  <input
                    type="number"
                    [(ngModel)]="editModel.totalPlacedAspirants"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">Hostel Category</label>
                  <select
                    [(ngModel)]="editModel.hostelCategory"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
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
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    [(ngModel)]="editModel.longitude"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">Remarks</label>
                  <input
                    type="text"
                    [(ngModel)]="editModel.remarks"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-transparent"
                    placeholder="Remarks"
                  />
                </div>

                <!-- Row 7: Center Photos Edit (Add & Remove JPG photos) -->
                <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-200">
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <label class="block font-semibold text-slate-700 text-xs">Center Photos (JPG only)</label>
                      <span class="text-[11px] text-slate-500">Upload or remove center photographs</span>
                    </div>
                    <span class="text-[11px] text-slate-400 font-mono">{{ (editModel.centerPhotos || []).length }} photos</span>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    @for (photo of editModel.centerPhotos; track photo.name || photo.id; let idx = $index) {
                      <div class="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col">
                        <!-- Red Delete Photo Button -->
                        <button
                          type="button"
                          (click)="removePhoto(idx)"
                          class="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center text-xs shadow-md transition-all cursor-pointer font-bold"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                        
                        <div class="w-full h-32 bg-slate-100 overflow-hidden flex items-center justify-center">
                          <img [src]="photo.url" [alt]="photo.name" class="w-full h-full object-cover" />
                        </div>
                        <div class="p-2 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                          <span class="font-semibold text-slate-800 text-[11px] truncate">{{ photo.tag || ('Photo ' + (idx + 1)) }}</span>
                          <span class="text-[10px] text-slate-400 font-mono">{{ photo.size || '' }}</span>
                        </div>
                      </div>
                    }

                    <!-- + Add JPG Photo Button (FileInput) -->
                    <div
                      (click)="photoFileInput.click()"
                      class="h-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0B3558] bg-slate-50/70 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col items-center justify-center p-3 text-center group"
                    >
                      <input
                        #photoFileInput
                        type="file"
                        accept=".jpg,.jpeg,image/jpeg"
                        multiple
                        (change)="onAddPhotos($event)"
                        class="hidden"
                      />
                      <div class="w-9 h-9 rounded-full bg-slate-200 group-hover:bg-[#0B3558] group-hover:text-white text-slate-600 flex items-center justify-center transition-all mb-1.5 shadow-2xs">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span class="text-xs font-semibold text-slate-700 group-hover:text-[#0B3558]">+ Add JPG Photo</span>
                      <span class="text-[10.5px] text-slate-400 mt-0.5">JPG / JPEG</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Form Action Buttons (Inside the form at the bottom) -->
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
                  class="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0B3558] hover:bg-[#123B59] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
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
          <a routerLink="/sdcs" class="text-[#0B3558] font-bold hover:underline mt-2 inline-block">
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
            <div class="px-5 py-3 border-b border-slate-200 bg-[#0B3558] text-white flex items-center justify-between gap-3 shrink-0">
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

  centerId = signal<string>('');
  isEditing = signal<boolean>(false);
  successMessage = signal<string>('');
  selectedPhoto = signal<CenterPhotoItem | null>(null);

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
      }
    });
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
    this.successMessage.set('SDC creation details updated successfully!');
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
