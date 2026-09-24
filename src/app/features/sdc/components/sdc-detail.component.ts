import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SdcService } from '../services/sdc.service';
import { BatchService } from '../services/batch.service';
import { SdcRecord, SdcStatus, SdcInspectionData } from '../models/sdc.model';
import {
  PageHeaderComponent,
  ButtonComponent,
  StatusBadgeComponent
} from '../../../shared/components';
import { BadgeVariant } from '../../../shared/components/table/table.types';

@Component({
  selector: 'app-sdc-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    ButtonComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      
      @if (sdc(); as center) {
        <div class="p-5 sm:p-6 lg:p-7 space-y-6 max-w-7xl mx-auto">
          
          <!-- Top Page Header via Reusable PageHeaderComponent -->
          <app-page-header
            [title]="center.sdcName + ' (' + center.sdcCode + ')'"
            badge="SDC Registration Dossier"
            bgColor="#0B3558"
            [showBack]="true"
            backUrl="/sdcs"
            backTitle="Back to SDC List"
            [breadcrumbs]="[
              { label: 'SDC Centers', url: '/sdcs' },
              { label: center.sdcName }
            ]"
          >
            <div class="flex items-center gap-2">
              <app-status-badge [variant]="getBadgeVariant(center.status)">
                {{ formatStatus(center.status) }}
              </app-status-badge>

              @if (center.status === 'APPROVED') {
                <app-button
                  variant="primary"
                  size="sm"
                  (btnClick)="createBatch(center)"
                >
                  <svg class="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Batch</span>
                </app-button>
              }
            </div>
          </app-page-header>

          <!-- Center Profile Header Card (Matches Registration Dossier) -->
          <div class="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-lg bg-[#0B3558] text-white font-bold flex items-center justify-center text-xs tracking-wider shadow-2xs shrink-0 select-none">
                SDC
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {{ center.sdcName }}
                  </h1>
                  <span class="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    {{ center.sdcCode }}
                  </span>
                </div>
                <div class="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span class="font-semibold text-slate-800">{{ center.tpName }}</span>
                  <span class="text-slate-300">&bull;</span>
                  <span class="text-[#0B3558] font-medium">{{ center.scheme }} (State Fund)</span>
                  <span class="text-slate-300">&bull;</span>
                  <span class="inline-flex items-center gap-1 font-semibold" [class.text-emerald-700]="center.status === 'APPROVED'" [class.text-amber-700]="center.status !== 'APPROVED'">
                    <span class="w-1.5 h-1.5 rounded-full" [class.bg-emerald-500]="center.status === 'APPROVED'" [class.bg-amber-500]="center.status !== 'APPROVED'"></span>
                    {{ formatStatus(center.status) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
              @if (center.status === 'APPROVED') {
                <button
                  type="button"
                  (click)="createBatch(center)"
                  class="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-md bg-[#0B3558] hover:bg-[#123B59] active:bg-[#07233B] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer select-none"
                  style="color: #ffffff !important;"
                >
                  <span class="text-sm font-bold leading-none">+</span>
                  <span>Create Batch</span>
                </button>
              }
              <button
                type="button"
                (click)="router.navigate(['/sdcs'])"
                class="px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer select-none"
              >
                &larr; Back to SDC List
              </button>
            </div>
          </div>

          <!-- View Toggle Tabs (Matching Modal Steps) -->
          <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2.5 text-xs font-semibold">
            <button
              type="button"
              (click)="activeTab.set('all')"
              class="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none"
              [class.bg-[#0F172A]]="activeTab() === 'all'"
              [class.text-white]="activeTab() === 'all'"
              [class.bg-slate-100]="activeTab() !== 'all'"
              [class.text-slate-600]="activeTab() !== 'all'"
            >
              All Details (Steps 1 – 3)
            </button>
            <button
              type="button"
              (click)="activeTab.set('step1')"
              class="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none"
              [class.bg-[#0F172A]]="activeTab() === 'step1'"
              [class.text-white]="activeTab() === 'step1'"
              [class.bg-slate-100]="activeTab() !== 'step1'"
              [class.text-slate-600]="activeTab() !== 'step1'"
            >
              1. Organization (Step 1)
            </button>
            <button
              type="button"
              (click)="activeTab.set('step2')"
              class="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none"
              [class.bg-[#0F172A]]="activeTab() === 'step2'"
              [class.text-white]="activeTab() === 'step2'"
              [class.bg-slate-100]="activeTab() !== 'step2'"
              [class.text-slate-600]="activeTab() !== 'step2'"
            >
              2. Location &amp; Details (Step 2)
            </button>
            <button
              type="button"
              (click)="activeTab.set('step3')"
              class="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none"
              [class.bg-[#0F172A]]="activeTab() === 'step3'"
              [class.text-white]="activeTab() === 'step3'"
              [class.bg-slate-100]="activeTab() !== 'step3'"
              [class.text-slate-600]="activeTab() !== 'step3'"
            >
              3. Courses &amp; Docs (Step 3)
            </button>
            <button
              type="button"
              (click)="activeTab.set('lifecycle')"
              class="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none sm:ml-auto"
              [class.bg-[#0B3558]]="activeTab() === 'lifecycle'"
              [class.text-white]="activeTab() === 'lifecycle'"
              [class.bg-blue-50]="activeTab() !== 'lifecycle'"
              [class.text-[#0B3558]]="activeTab() !== 'lifecycle'"
            >
              Full Lifecycle Tracker (Stages 1 – 6) &rarr;
            </button>
          </div>

          <!-- SDC REGISTRATION DOSSIER (Steps 1 – 3) -->
          @if (activeTab() !== 'lifecycle') {
            <div class="space-y-5">

              <!-- Step 1: Organization Details -->
              @if (activeTab() === 'all' || activeTab() === 'step1') {
                <div class="border border-slate-200 rounded-xl p-5 bg-white space-y-3 shadow-2xs">
                  <div class="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-700">
                    <span class="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-800 text-[11px] font-bold">1</span>
                    <span>Step 1: Organization Details</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Scheme</span>
                      <span class="font-bold text-slate-900">{{ center.scheme }} (State Fund)</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SDC Name</span>
                      <span class="font-bold text-slate-900">{{ center.sdcName }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">MoU Reference No.</span>
                      <span class="font-mono font-medium text-slate-800">{{ center.mouRefNo }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">TP / PIA Name</span>
                      <span class="font-bold text-slate-900">{{ center.tpName }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SDC Code</span>
                      <span class="font-mono font-bold text-[#0B3558]">{{ center.sdcCode }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Proposed Start Date</span>
                      <span class="text-slate-800 font-medium">{{ center.proposedStartDate }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Trained Aspirants</span>
                      <span class="text-slate-800 font-medium">{{ center.totalTrainedAspirants ?? '500' }} Aspirants</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total TP Placed</span>
                      <span class="text-slate-800 font-medium">{{ center.totalPlacedAspirants ?? '400' }} Candidates</span>
                    </div>
                  </div>
                </div>
              }

              <!-- Step 2: Location and Centre Details -->
              @if (activeTab() === 'all' || activeTab() === 'step2') {
                <div class="border border-slate-200 rounded-xl p-5 bg-white space-y-3 shadow-2xs">
                  <div class="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-700">
                    <span class="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-800 text-[11px] font-bold">2</span>
                    <span>Step 2: Location and Centre Details</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">State &amp; District</span>
                      <span class="font-bold text-slate-900">{{ center.state }} &bull; {{ center.district }} District</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assembly Constituency</span>
                      <span class="text-slate-800 font-medium">{{ center.assemblyConstituency || 'Sanganer' }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Parliament Constituency</span>
                      <span class="text-slate-800 font-medium">{{ center.parliamentConstituency || 'Jaipur Rural' }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Division &amp; Block</span>
                      <span class="text-slate-800 font-medium">{{ center.division || 'Jaipur Division' }} / {{ center.block || 'Jaipur' }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SDC Center Capacity</span>
                      <span class="font-bold text-[#0B3558]">{{ center.sdcCapacity }} Aspirants</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Center Email &amp; PIN</span>
                      <span class="text-slate-800 font-medium">{{ center.centerEmail }} ({{ center.pincode }})</span>
                    </div>
                    <div class="sm:col-span-2 lg:col-span-3 space-y-0.5">
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Complete Physical Street Address</span>
                      <span class="text-slate-800 font-medium leading-relaxed">{{ center.fullAddress }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">GPS Geo-Location</span>
                      <span class="font-mono text-xs font-semibold text-slate-800">
                        Lat: {{ center.latitude }} &bull; Lng: {{ center.longitude }}
                      </span>
                    </div>
                    <div class="sm:col-span-2 space-y-0.5">
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Remarks</span>
                      <span class="text-slate-600 italic">{{ center.remarks || 'Equipped with dedicated smart labs and biometrics' }}</span>
                    </div>
                  </div>
                </div>
              }

              <!-- Step 3: Courses & Documents -->
              @if (activeTab() === 'all' || activeTab() === 'step3') {
                <div class="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-2xs">
                  <div class="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-700">
                    <span class="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-800 text-[11px] font-bold">3</span>
                    <span>Step 3: Courses &amp; Supporting Documents</span>
                  </div>
                  <div class="space-y-2">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Allocated Courses ({{ center.allocatedCourses.length }}):
                    </span>
                    <div class="space-y-2 text-xs">
                      @for (c of center.allocatedCourses; track c.qpCode) {
                        <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                          <div class="flex items-center gap-2.5">
                            <span class="text-emerald-600 font-bold">✓</span>
                            <div>
                              <span class="font-bold text-slate-900">{{ c.courseName }}</span>
                              <span class="text-slate-400 ml-2 font-mono">({{ c.qpCode }})</span>
                              <div class="text-[11px] text-slate-500 mt-0.5">
                                Sector: <strong class="text-slate-700">{{ c.sector }}</strong> &bull; NSQF Level {{ c.nsqfLevel }} &bull; Duration: {{ c.durationHours }} Hours
                              </div>
                            </div>
                          </div>
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Approved
                          </span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Uploaded Documents -->
                  <div class="pt-3 space-y-2 border-t border-slate-100">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Uploaded Compliance Documents:
                    </span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      @for (doc of getDocumentsList(center.documents); track doc.fileName) {
                        <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                          <div class="flex items-center gap-2 truncate">
                            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold" [class.bg-rose-100]="doc.type === 'PDF'" [class.text-rose-700]="doc.type === 'PDF'" [class.bg-sky-100]="doc.type === 'IMG'" [class.text-sky-700]="doc.type === 'IMG'">
                              {{ doc.type }}
                            </span>
                            <div class="truncate">
                              <span class="font-medium text-slate-800 block truncate">{{ doc.title }}</span>
                              <span class="text-[10px] text-slate-400 font-mono truncate">{{ doc.fileName }} ({{ doc.fileSize }})</span>
                            </div>
                          </div>
                          <span class="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 ml-2">
                            Verified
                          </span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Declaration Accepted -->
                  <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-900 text-xs">
                    <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Training Provider Declaration Accepted &amp; Certified on Submission.</span>
                  </div>

                </div>
              }

              <!-- Bottom Action Bar -->
              <div class="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  (click)="router.navigate(['/sdcs'])"
                  class="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                >
                  &larr; Back to SDC List
                </button>

                <div class="flex items-center gap-2">
                  @if (center.status === 'APPROVED') {
                    <button
                      type="button"
                      (click)="createBatch(center)"
                      class="px-4 py-2 rounded-lg bg-[#0B3558] hover:bg-[#123B59] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      style="color: #ffffff !important;"
                    >
                      + Create Batch
                    </button>
                  }
                  <button
                    type="button"
                    (click)="activeTab.set('lifecycle')"
                    class="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-all cursor-pointer shadow-2xs"
                  >
                    Full Lifecycle Tracker &rarr;
                  </button>
                </div>
              </div>

            </div>
          }

          <!-- Lifecycle & Inspection Stages (Stages 1 to 6) -->
          @if (activeTab() === 'lifecycle') {
            <div class="space-y-6">
              
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <button
                  type="button"
                  (click)="activeTab.set('all')"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3558] hover:underline cursor-pointer"
                >
                  &larr; Back to Registration Details (Steps 1 – 3)
                </button>
                <span class="text-xs text-slate-500 font-medium">Official Accreditation &amp; Batches Tracker</span>
              </div>

              <!-- Stages Horizontal Timeline -->
              <div class="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold uppercase tracking-wider text-[#0B3558]">
                    SDC End-to-End Lifecycle Stages
                  </span>
                  <span class="text-[11px] text-slate-500">
                    Official Government of Rajasthan RSLDC Accreditation Workflow
                  </span>
                </div>

                <!-- Stages Horizontal Timeline -->
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                  
                  <!-- Stage 1 -->
                  <div class="p-2.5 rounded-lg border bg-white border-emerald-200 shadow-2xs space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-400">STAGE 1</span>
                      <span class="text-emerald-700 text-xs font-bold">✓</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 leading-tight">EOI &amp; TP Empanelment</div>
                    <span class="text-[10.5px] text-slate-500 block">Fee &amp; AAP verified</span>
                  </div>

                  <!-- Stage 2 -->
                  <div class="p-2.5 rounded-lg border bg-white border-emerald-200 shadow-2xs space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-400">STAGE 2</span>
                      <span class="text-emerald-700 text-xs font-bold">✓</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 leading-tight">SDC Registration</div>
                    <span class="text-[10.5px] text-slate-500 block">4-step wizard submitted</span>
                  </div>

                  <!-- Stage 3 -->
                  <div
                    class="p-2.5 rounded-lg border shadow-2xs space-y-1"
                    [class.bg-white]="center.status !== 'DRAFT' && center.status !== 'SUBMITTED'"
                    [class.border-emerald-200]="center.inspection?.geoMatched"
                    [class.border-amber-300]="center.status === 'PENDING_INSPECTION'"
                    [class.bg-amber-50/50]="center.status === 'PENDING_INSPECTION'"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-400">STAGE 3</span>
                      @if (center.inspection?.geoMatched) {
                        <span class="text-emerald-700 text-xs font-bold">✓</span>
                      } @else {
                        <span class="text-amber-600 text-xs font-bold">⏳</span>
                      }
                    </div>
                    <div class="text-xs font-bold text-slate-800 leading-tight">Physical Inspection</div>
                    <span class="text-[10.5px] text-slate-500 block">
                      {{ center.inspection ? 'Audit & GPS matched' : 'Auditor visit scheduled' }}
                    </span>
                  </div>

                  <!-- Stage 4 -->
                  <div
                    class="p-2.5 rounded-lg border shadow-2xs space-y-1"
                    [class.bg-white]="center.status === 'APPROVED'"
                    [class.border-emerald-200]="center.status === 'APPROVED'"
                    [class.border-blue-300]="center.status === 'PENDING_APPROVAL'"
                    [class.bg-blue-50/40]="center.status === 'PENDING_APPROVAL'"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-400">STAGE 4</span>
                      @if (center.status === 'APPROVED') {
                        <span class="text-emerald-700 text-xs font-bold">✓</span>
                      } @else if (center.status === 'PENDING_APPROVAL') {
                        <span class="text-blue-600 text-xs font-bold">⏳</span>
                      } @else {
                        <span class="text-slate-300 text-xs">○</span>
                      }
                    </div>
                    <div class="text-xs font-bold text-slate-800 leading-tight">Dept Approval</div>
                    <span class="text-[10.5px] text-slate-500 block">
                      {{ center.approval ? center.approval.approvedTargetCapacity + ' target capacity' : 'Under authority review' }}
                    </span>
                  </div>

                  <!-- Stage 5 -->
                  <div
                    class="p-2.5 rounded-lg border shadow-2xs space-y-1"
                    [class.bg-white]="batches().length > 0"
                    [class.border-emerald-200]="batches().length > 0"
                    [class.border-slate-200]="batches().length === 0"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-400">STAGE 5</span>
                      @if (batches().length > 0) {
                        <span class="text-emerald-700 text-xs font-bold">✓</span>
                      } @else {
                        <span class="text-slate-300 text-xs">○</span>
                      }
                    </div>
                    <div class="text-xs font-bold text-slate-800 leading-tight">Batch Creation</div>
                    <span class="text-[10.5px] text-slate-500 block">
                      {{ batches().length }} active batch{{ batches().length === 1 ? '' : 'es' }}
                    </span>
                  </div>

                  <!-- Stage 6 -->
                  <div class="p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-400">STAGE 6</span>
                      <span class="text-slate-300 text-xs">○</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 leading-tight">Trainee &amp; AEBAS</div>
                    <span class="text-[10.5px] text-slate-500 block">Biometric attendance</span>
                  </div>

                </div>
              </div>

              <!-- Two-Column Main Content (Stages 3 to 6) -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Center Specs, Stage 3 Inspection, Stage 4 Approval -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- STAGE 3: Physical Inspection & Auditor Verification Box -->
              <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">3</span>
                    <h2 class="text-sm sm:text-base font-bold text-slate-900">
                      Stage 3: Physical Inspection &amp; Auditor Verification
                    </h2>
                  </div>
                  @if (center.inspection) {
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Audit Submitted
                    </span>
                  } @else {
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      Pending Inspection Visit
                    </span>
                  }
                </div>

                @if (center.inspection; as ins) {
                  <!-- Completed Inspection Details -->
                  <div class="space-y-4 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div><span class="text-slate-400 block text-[10.5px]">Auditor Name</span><strong class="text-slate-800">{{ ins.auditorName }}</strong></div>
                      <div><span class="text-slate-400 block text-[10.5px]">Contact</span><span class="text-slate-800">{{ ins.auditorPhone }}</span></div>
                      <div><span class="text-slate-400 block text-[10.5px]">Inspection Date</span><span class="text-slate-800">{{ ins.inspectionDate }}</span></div>
                    </div>

                    <!-- Checklist -->
                    <div class="space-y-2">
                      <span class="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">Physical Audit Checklist</span>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div class="flex items-center gap-2 p-2 rounded border border-slate-200 bg-white">
                          <span class="text-emerald-600 font-bold">✓</span>
                          <span>Physical existence at declared street address</span>
                        </div>
                        <div class="flex items-center gap-2 p-2 rounded border border-slate-200 bg-white">
                          <span class="text-emerald-600 font-bold">✓</span>
                          <span>Prominent front signboard with RSLDC logo</span>
                        </div>
                        <div class="flex items-center gap-2 p-2 rounded border border-slate-200 bg-white">
                          <span class="text-emerald-600 font-bold">✓</span>
                          <span>Sanctioned classrooms &amp; practical equipment</span>
                        </div>
                        <div class="flex items-center gap-2 p-2 rounded border border-slate-200 bg-white">
                          <span class="text-emerald-600 font-bold">✓</span>
                          <span>Biometric AEBAS attendance machines live</span>
                        </div>
                      </div>
                    </div>

                    <!-- Geo-Location Match Indicator -->
                    <div class="p-3.5 rounded-lg border flex items-center justify-between"
                      [class.bg-emerald-50]="ins.geoMatched"
                      [class.border-emerald-200]="ins.geoMatched"
                      [class.bg-rose-50]="!ins.geoMatched"
                      [class.border-rose-200]="!ins.geoMatched"
                    >
                      <div class="space-y-0.5">
                        <span class="font-bold text-xs" [class.text-emerald-900]="ins.geoMatched" [class.text-rose-900]="!ins.geoMatched">
                          Geo-Location Verification (100m Threshold)
                        </span>
                        <p class="text-[11px] text-slate-600">
                          TP Declared: <code class="font-mono">{{ center.latitude }}, {{ center.longitude }}</code> &bull;
                          Auditor Live GPS: <code class="font-mono">{{ ins.auditorLatitude }}, {{ ins.auditorLongitude }}</code>
                        </p>
                      </div>
                      <div class="text-right">
                        <span class="px-2.5 py-1 rounded text-xs font-bold" [class.bg-emerald-200]="ins.geoMatched" [class.text-emerald-900]="ins.geoMatched">
                          {{ ins.geoDistanceMeters }}m Distance &bull; {{ ins.geoMatched ? 'VERIFIED MATCH' : 'MISMATCH' }}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Auditor Remarks &amp; Recommendation</span>
                      <p class="text-slate-700 italic bg-slate-50 p-2.5 rounded border border-slate-200 mt-1">
                        "{{ ins.auditorRemarks }}"
                      </p>
                    </div>
                  </div>
                } @else {
                  <!-- Interactive Simulator: Inspector fills inspection form -->
                  <div class="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-slate-800">
                        Auditor Inspection Portal (On-Site Verification)
                      </span>
                      <span class="text-slate-500 text-[11px]">RSLDC Inspector App</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-[11px] font-semibold text-slate-700 mb-1">Auditor Name</label>
                        <input type="text" [(ngModel)]="inspectData.auditorName" class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs" />
                      </div>
                      <div>
                        <label class="block text-[11px] font-semibold text-slate-700 mb-1">Auditor Phone</label>
                        <input type="text" [(ngModel)]="inspectData.auditorPhone" class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs" />
                      </div>
                    </div>

                    <!-- Checklist checks -->
                    <div class="space-y-1.5">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="inspectData.physicalExistenceVerified" class="rounded text-[#0B3558]" />
                        <span>Center physically present at declared address</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="inspectData.signboardVerified" class="rounded text-[#0B3558]" />
                        <span>Visible RSLDC signboard and branding installed</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="inspectData.classroomsLabsVerified" class="rounded text-[#0B3558]" />
                        <span>Classrooms, theory benches &amp; practical IT labs verified</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="inspectData.biometricAebasVerified" class="rounded text-[#0B3558]" />
                        <span>Biometric AEBAS machine operational</span>
                      </label>
                    </div>

                    <!-- Live GPS Simulator (Auto-matches within 100m) -->
                    <div class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span class="font-bold text-slate-800 block text-xs">Simulate Auditor GPS</span>
                        <span class="text-[11px] text-slate-500">Matches TP coords: ({{ center.latitude }}, {{ center.longitude }})</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Δ 34 meters
                        </span>
                      </div>
                    </div>

                    <div>
                      <label class="block text-[11px] font-semibold text-slate-700 mb-1">Inspector Recommendation Remarks</label>
                      <textarea [(ngModel)]="inspectData.auditorRemarks" rows="2" class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"></textarea>
                    </div>

                    <app-button
                      variant="primary"
                      size="sm"
                      (btnClick)="submitInspection(center.id)"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Submit Physical Inspection Report</span>
                    </app-button>
                  </div>
                }
              </div>

              <!-- STAGE 4: Department Approval & Target Capacity Allocation -->
              <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">4</span>
                    <h2 class="text-sm sm:text-base font-bold text-slate-900">
                      Stage 4: Department Approval &amp; Target Capacity Allocation
                    </h2>
                  </div>
                  @if (center.status === 'APPROVED') {
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Sanctioned &amp; Approved
                    </span>
                  }
                </div>

                @if (center.approval; as app) {
                  <div class="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-emerald-950 text-sm">Center Official Sanction</span>
                      <span class="text-emerald-800 font-semibold">{{ app.approvedDate }}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span class="text-slate-500 block text-[11px]">Approved Target Capacity</span>
                        <strong class="text-emerald-800 text-base font-black">{{ app.approvedTargetCapacity }} Aspirants</strong>
                      </div>
                      <div>
                        <span class="text-slate-500 block text-[11px]">Sanctioning Authority</span>
                        <span class="text-slate-800 font-semibold">{{ app.approvedBy }}</span>
                      </div>
                      <div class="col-span-2">
                        <span class="text-slate-500 block text-[11px]">Authority Remarks</span>
                        <span class="text-slate-700 italic">"{{ app.approvalRemarks }}"</span>
                      </div>
                    </div>
                  </div>
                } @else if (center.status === 'PENDING_APPROVAL') {
                  <div class="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-slate-900">Review &amp; Target Allocation Authority Desk</span>
                      <span class="text-xs text-blue-800 font-semibold">Action Required</span>
                    </div>
                    <p class="text-slate-600">
                      Auditor report has been verified. Allocate official target aspirant capacity to approve this center.
                    </p>

                    <div class="flex items-center gap-3">
                      <div>
                        <label class="block text-[11px] font-semibold text-slate-700 mb-1">Target Aspirants Capacity</label>
                        <input type="number" [(ngModel)]="approvalCapacity" class="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs w-44" />
                      </div>
                      <div class="flex-1">
                        <label class="block text-[11px] font-semibold text-slate-700 mb-1">Approval Remarks</label>
                        <input type="text" [(ngModel)]="approvalRemarks" class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs" />
                      </div>
                    </div>

                    <div class="flex items-center gap-2 pt-1">
                      <app-button
                        variant="primary"
                        size="sm"
                        (btnClick)="approveCenter(center.id)"
                      >
                        Approve &amp; Sanction Center
                      </app-button>
                      <app-button
                        variant="secondary"
                        size="sm"
                        (btnClick)="returnCenter(center.id)"
                      >
                        Return to TP
                      </app-button>
                      <app-button
                        variant="danger"
                        size="sm"
                        (btnClick)="rejectCenter(center.id)"
                      >
                        Reject SDC
                      </app-button>
                    </div>
                  </div>
                } @else {
                  <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                    Department approval and target capacity allocation will unlock once physical inspection (Stage 3) is submitted by the assigned auditor.
                  </div>
                }
              </div>

              <!-- Batches Running Under this SDC (Stages 5 & 6) -->
              <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">5</span>
                    <h2 class="text-sm sm:text-base font-bold text-slate-900">
                      Batches Created Under this SDC ({{ batches().length }})
                    </h2>
                  </div>
                  @if (center.status === 'APPROVED') {
                    <a
                      [routerLink]="['/sdc', center.id, 'batch', 'create']"
                      class="px-3 py-1.5 bg-[#0B3558] hover:bg-[#123B59] text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5"
                      style="color: #ffffff !important;"
                    >
                      <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>New Batch</span>
                    </a>
                  }
                </div>

                @if (batches().length > 0) {
                  <div class="space-y-3">
                    @for (b of batches(); track b.id) {
                      <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-[#0B3558]">{{ b.batchCode }}</span>
                            <span class="font-bold text-slate-900">{{ b.courseName }}</span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {{ b.status }}
                            </span>
                          </div>
                          <div class="text-slate-500 text-[11.5px] flex items-center gap-3">
                            <span>Duration: <strong>{{ b.totalHours }} hrs</strong></span>
                            <span>Enrolled: <strong>{{ b.mappedAspirantsCount }} / {{ b.maxStrength }}</strong></span>
                            <span>Biometric Attendance: <strong>{{ b.biometricAttendanceRate }}%</strong></span>
                            <span>{{ b.residential ? 'Residential (Hostel)' : 'Non-Residential' }}</span>
                          </div>
                        </div>

                        <a
                          routerLink="/sdc/batches"
                          class="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:text-[#0B3558] text-xs font-semibold cursor-pointer shrink-0"
                        >
                          View Batch Trainees
                        </a>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg text-xs text-slate-500">
                    No training batches created yet for this center.
                    @if (center.status === 'APPROVED') {
                      <div class="pt-2">
                        <a [routerLink]="['/sdc', center.id, 'batch', 'create']" class="text-[#0B3558] font-bold hover:underline">
                          + Create first batch now
                        </a>
                      </div>
                    }
                  </div>
                }
              </div>

            </div>

            <!-- Right Column: Center Profile, Allocated Courses, Compliance Documents -->
            <div class="space-y-6">
              
              <!-- Center Details Summary -->
              <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 text-xs">
                <span class="font-bold text-[#0B3558] block uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
                  Center Physical Profile
                </span>
                
                <div class="space-y-2">
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Official Address</span>
                    <span class="text-slate-800 leading-snug block">{{ center.fullAddress }}</span>
                    <span class="text-slate-500 font-mono text-[11px]">PIN: {{ center.pincode }} &bull; {{ center.district }}</span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Latitude</span>
                      <code class="font-mono text-slate-800">{{ center.latitude }}</code>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Longitude</span>
                      <code class="font-mono text-slate-800">{{ center.longitude }}</code>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Center Capacity</span>
                      <strong class="text-slate-800">{{ center.sdcCapacity }} Aspirants</strong>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">MoU Reference</span>
                      <span class="text-slate-800">{{ center.mouRefNo }}</span>
                    </div>
                  </div>

                  <div class="pt-1">
                    <span class="text-slate-400 block text-[10.5px]">Center Email</span>
                    <span class="text-[#0B3558] font-medium">{{ center.centerEmail }}</span>
                  </div>

                  @if (center.remarks) {
                    <div class="pt-1">
                      <span class="text-slate-400 block text-[10.5px]">Center Remarks</span>
                      <span class="text-slate-600 italic">{{ center.remarks }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Allocated Courses -->
              <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 text-xs">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span class="font-bold text-[#0B3558] uppercase tracking-wider text-[11px]">
                    Allocated Courses ({{ center.allocatedCourses.length }})
                  </span>
                  <span class="text-[10px] text-slate-400">{{ center.scheme }}</span>
                </div>

                <div class="space-y-2">
                  @for (c of center.allocatedCourses; track c.qpCode) {
                    <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                      <strong class="text-slate-900 block leading-tight">{{ c.courseName }}</strong>
                      <div class="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{{ c.sector }} &bull; Level {{ c.nsqfLevel }}</span>
                        <span class="font-mono text-[#0B3558] font-bold">{{ c.durationHours }}h</span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Uploaded Documents -->
              <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 text-xs">
                <span class="font-bold text-[#0B3558] block uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
                  Verified Compliance Documents
                </span>

                <div class="space-y-2">
                  <div class="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-rose-500 font-bold text-xs">PDF</span>
                      <span class="text-slate-800 font-medium">Rental / Ownership Deed</span>
                    </div>
                    <span class="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Verified</span>
                  </div>

                  <div class="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-rose-500 font-bold text-xs">PDF</span>
                      <span class="text-slate-800 font-medium">Fire Safety NOC</span>
                    </div>
                    <span class="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Verified</span>
                  </div>

                  <div class="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-sky-500 font-bold text-xs">IMG</span>
                      <span class="text-slate-800 font-medium">Front Signboard Photo</span>
                    </div>
                    <span class="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Verified</span>
                  </div>

                  <div class="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-rose-500 font-bold text-xs">PDF</span>
                      <span class="text-slate-800 font-medium">Classrooms Layout Diagram</span>
                    </div>
                    <span class="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Verified</span>
                  </div>
                </div>
              </div>

            </div>

            </div>

            <!-- Lifecycle Bottom Actions -->
            <div class="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                (click)="activeTab.set('all')"
                class="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              >
                &larr; Back to Registration Details
              </button>
              <button
                type="button"
                (click)="router.navigate(['/sdcs'])"
                class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
              >
                Back to SDC Directory
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

    </div>
  `
})
export class SdcDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly sdcService = inject(SdcService);
  readonly batchService = inject(BatchService);

  centerId = signal<string>('');
  activeTab = signal<'all' | 'step1' | 'step2' | 'step3' | 'lifecycle'>('all');
  
  readonly sdc = computed(() => {
    const id = this.centerId();
    return this.sdcService.getSdcById(id);
  });

  readonly batches = computed(() => {
    const id = this.centerId();
    return this.batchService.getBatchesBySdc(id);
  });

  createBatch(center: SdcRecord): void {
    this.router.navigate(['/batches/create'], {
      queryParams: {
        sdcId: center.id,
        sdcCode: center.sdcCode,
        sdcName: center.sdcName,
        scheme: center.scheme
      }
    });
  }

  getDocumentsList(docObj?: any) {
    if (!docObj) return [];
    const list = [];
    if (docObj.rentalAgreementDoc) {
      list.push({ title: 'Rental / Ownership Deed', ...docObj.rentalAgreementDoc, type: 'PDF' });
    }
    if (docObj.fireNocDoc) {
      list.push({ title: 'Fire Safety NOC', ...docObj.fireNocDoc, type: 'PDF' });
    }
    if (docObj.signboardPhotoDoc) {
      list.push({ title: 'Front Signboard Photo', ...docObj.signboardPhotoDoc, type: 'IMG' });
    }
    if (docObj.layoutDiagramDoc) {
      list.push({ title: 'Classroom & Lab Blueprint', ...docObj.layoutDiagramDoc, type: 'PDF' });
    }
    return list;
  }

  // Inspection simulator form state
  inspectData = {
    auditorName: 'Er. Rajesh Verma (Lead Inspector)',
    auditorPhone: '+91 98290 11223',
    physicalExistenceVerified: true,
    signboardVerified: true,
    classroomsLabsVerified: true,
    biometricAebasVerified: true,
    auditorRemarks: 'Physical labs and biometric AEBAS machine verified. Infrastructure complies with RSLDC guidelines.'
  };

  approvalCapacity = 100;
  approvalRemarks = 'Sanction approved with full aspirant capacity.';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.centerId.set(id);
        const center = this.sdc();
        if (center) {
          this.approvalCapacity = center.sdcCapacity;
        }
      }
    });
  }

  submitInspection(id: string): void {
    const center = this.sdc();
    if (!center) return;

    this.sdcService.submitInspection(id, {
      auditorName: this.inspectData.auditorName,
      auditorPhone: this.inspectData.auditorPhone,
      physicalExistenceVerified: this.inspectData.physicalExistenceVerified,
      signboardVerified: this.inspectData.signboardVerified,
      classroomsLabsVerified: this.inspectData.classroomsLabsVerified,
      biometricAebasVerified: this.inspectData.biometricAebasVerified,
      auditorLatitude: center.latitude + 0.0002,
      auditorLongitude: center.longitude + 0.0002,
      auditorRemarks: this.inspectData.auditorRemarks,
      recommendation: 'RECOMMENDED'
    });
  }

  approveCenter(id: string): void {
    this.sdcService.approveSdc(id, this.approvalCapacity, this.approvalRemarks);
  }

  rejectCenter(id: string): void {
    this.sdcService.rejectSdc(id, 'Infrastructure requirements not met.');
  }

  returnCenter(id: string): void {
    this.sdcService.returnToTp(id, 'Please re-upload clearer building signboard photograph.');
  }

  formatStatus(status: SdcStatus): string {
    switch (status) {
      case 'APPROVED':
        return 'Approved & Sanctioned';
      case 'PENDING_INSPECTION':
        return 'Pending Inspection';
      case 'INSPECTION_COMPLETED':
        return 'Inspection Completed';
      case 'PENDING_APPROVAL':
        return 'Pending Approval';
      case 'SUBMITTED':
        return 'Submitted';
      case 'REJECTED':
        return 'Rejected';
      case 'RETURNED_TO_TP':
        return 'Returned to TP';
      default:
        return status;
    }
  }

  getBadgeVariant(status: SdcStatus): BadgeVariant {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING_INSPECTION':
      case 'RETURNED_TO_TP':
        return 'warning';
      case 'PENDING_APPROVAL':
      case 'SUBMITTED':
        return 'info';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
