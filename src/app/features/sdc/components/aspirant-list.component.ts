import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AspirantService } from '../services/aspirant.service';
import { BatchService } from '../services/batch.service';
import { SdcService } from '../services/sdc.service';
import { AspirantRecord, AspirantTrainingStatus } from '../models/aspirant.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { TableColumn } from '../../../shared/components/table/table.types';

@Component({
  selector: 'app-aspirant-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans selection:bg-[#174A6E] selection:text-white" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-6 space-y-4 font-sans">

        <!-- Page Header -->
        <app-page-header
          title="Aspirants Management"
        >
          <div class="flex items-center gap-2">
            <!-- Export CSV Button -->
            <button
              type="button"
              (click)="exportToCsv()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer select-none"
              title="Export roster to CSV"
            >
              <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </app-page-header>

        <!-- Success Toast Notification -->
        @if (successMessage()) {
          <div class="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <span class="font-bold text-emerald-700">Success:</span>
              <span>{{ successMessage() }}</span>
            </div>
            <button (click)="successMessage.set('')" class="text-emerald-600 hover:text-emerald-900 cursor-pointer font-bold">✕</button>
          </div>
        }

        <!-- Top Statistics Cards (No icon emojis, clean labels and figures) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          <!-- Card 1: Total Aspirants -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Aspirants</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold text-slate-900 font-mono">{{ stats().total }}</span>
              <span class="text-[11px] text-slate-500">Enrolled</span>
            </div>
            <div class="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>{{ stats().maleCount }} Male</span>
              <span>•</span>
              <span>{{ stats().femaleCount }} Female</span>
            </div>
          </div>

          <!-- Card 2: SDC Centers Covered -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">SDC Centers</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold text-slate-900 font-mono">{{ stats().sdcCount }}</span>
              <span class="text-[11px] text-slate-500">Centers</span>
            </div>
            <div class="mt-1 text-[11px] text-slate-500 truncate">
              Jaipur, Ajmer, Kota, Jodhpur
            </div>
          </div>

          <!-- Card 3: Batches Active -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Batches Active</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold text-slate-900 font-mono">{{ stats().batchCount }}</span>
              <span class="text-[11px] text-slate-500">Active Batches</span>
            </div>
            <div class="mt-1 text-[11px] text-emerald-700 font-semibold">
              {{ stats().inTraining }} In Training • {{ stats().enrolled }} Enrolled
            </div>
          </div>

          <!-- Card 4: Schemes -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Govt Schemes</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold text-slate-900 font-mono">{{ stats().schemeCount }}</span>
              <span class="text-[11px] text-slate-500">Schemes</span>
            </div>
            <div class="mt-1 text-[11px] text-slate-500 truncate">
              SAMARTH, MMKVY, RAJKViK
            </div>
          </div>

          <!-- Card 5: Biometric Verification -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs col-span-2 sm:col-span-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Biometric AEBAS</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold text-emerald-700 font-mono">{{ stats().verifiedPercent }}%</span>
              <span class="text-[11px] text-slate-500">Verified</span>
            </div>
            <div class="mt-1 text-[11px] text-slate-500">
              {{ stats().verifiedCount }}/{{ stats().total }} Aadhaar AEBAS synced
            </div>
          </div>

        </div>

        <!-- Filter & Search Controls (Matching ISMS 2.0 Toolbar) -->
        <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
          
          <!-- Row 1: SDC Center Dropdown + Scheme Dropdown + Batch Dropdown + Status Filter -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            
            <!-- SDC Center Filter (Prompt: "and also all the sdc can be seen") -->
            <div>
              <label class="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filter by SDC Center:
              </label>
              <select
                [ngModel]="selectedSdc()"
                (ngModelChange)="selectedSdc.set($event)"
                class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded-[4px] text-slate-800 focus:outline-none focus:border-[#174A6E]"
              >
                <option value="All">All SDC Centers ({{ allSdcOptions.length - 1 }})</option>
                @for (opt of allSdcOptions.slice(1); track opt.code) {
                  <option [value]="opt.code">{{ opt.name }} ({{ opt.code }}) - {{ opt.district }}</option>
                }
              </select>
            </div>

            <!-- Scheme Filter -->
            <div>
              <label class="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filter by Scheme:
              </label>
              <select
                [ngModel]="selectedScheme()"
                (ngModelChange)="selectedScheme.set($event)"
                class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded-[4px] text-slate-800 focus:outline-none focus:border-[#174A6E]"
              >
                <option value="All">All Schemes ({{ allSchemeOptions.length - 1 }})</option>
                @for (sc of allSchemeOptions.slice(1); track sc) {
                  <option [value]="sc">{{ sc }}</option>
                }
              </select>
            </div>

            <!-- Batch Filter -->
            <div>
              <label class="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filter by Batch:
              </label>
              <select
                [ngModel]="selectedBatch()"
                (ngModelChange)="selectedBatch.set($event)"
                class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded-[4px] text-slate-800 focus:outline-none focus:border-[#174A6E]"
              >
                <option value="All">All Batches ({{ allBatchOptions.length - 1 }})</option>
                @for (b of allBatchOptions.slice(1); track b.code) {
                  <option [value]="b.code">{{ b.code }} - {{ b.course }}</option>
                }
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Training Status:
              </label>
              <select
                [ngModel]="selectedStatus()"
                (ngModelChange)="selectedStatus.set($event)"
                class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded-[4px] text-slate-800 focus:outline-none focus:border-[#174A6E]"
              >
                <option value="All">All Statuses</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="IN_TRAINING">In Training</option>
                <option value="COMPLETED">Completed</option>
                <option value="CERTIFIED">Certified</option>
              </select>
            </div>

          </div>

          <!-- Row 2: Status Quick Filter Pills + Search Input -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
            
            <!-- Quick Category/Filter Pills -->
            <div class="flex items-center gap-1.5 flex-wrap">
              @for (f of quickFilterTabs(); track f.id) {
                <button
                  type="button"
                  (click)="setQuickTab(f.id)"
                  class="px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
                  [class.bg-[#174A6E]]="activeQuickTab() === f.id"
                  [class.text-white]="activeQuickTab() === f.id"
                  [class.border-[#174A6E]]="activeQuickTab() === f.id"
                  [class.bg-white]="activeQuickTab() !== f.id"
                  [class.text-[#5F6B76]]="activeQuickTab() !== f.id"
                  [class.border-[#D9E1E7]]="activeQuickTab() !== f.id"
                  [class.hover:bg-[#EAF2F6]]="activeQuickTab() !== f.id"
                  [class.hover:text-[#174A6E]]="activeQuickTab() !== f.id"
                >
                  <span>{{ f.label }}</span>
                  <span
                    class="px-1.5 py-0.2 rounded-full text-[10px]"
                    [class.bg-white/20]="activeQuickTab() === f.id"
                    [class.text-white]="activeQuickTab() === f.id"
                    [class.bg-[#F5F7F9]]="activeQuickTab() !== f.id"
                    [class.text-[#5F6B76]]="activeQuickTab() !== f.id"
                  >
                    {{ f.count }}
                  </span>
                </button>
              }
            </div>

            <!-- Search Input & Working Search Button -->
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <div class="relative w-full sm:w-72">
                <svg class="w-3.5 h-3.5 text-[#7A8792] absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearchInput($event)"
                  (keyup.enter)="applySearch()"
                  placeholder="Search Aspirant ID, Name, Aadhaar, SDC, Batch..."
                  class="w-full pl-8 pr-7 py-1.5 text-[13px] bg-white border border-[#D9E1E7] rounded-[4px] text-[#1F2933] placeholder:text-[#7A8792] focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E] transition-colors font-normal"
                />
                @if (searchQuery()) {
                  <button
                    type="button"
                    (click)="clearSearch()"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                  >
                    &times;
                  </button>
                }
              </div>
              <button
                type="button"
                (click)="applySearch()"
                class="px-3.5 py-1.5 rounded-[4px] bg-[#174A6E] hover:bg-[#123B59] active:scale-95 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Search Aspirants"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>
            </div>

          </div>

        </div>

        <!-- Aspirants Data Table via Reusable TableComponent -->
        <app-table
          [columns]="aspirantColumns"
          [data]="filteredAspirants()"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="aspirants"
          emptyMessage="No aspirants match the selected filters or search query."
          [customTemplates]="{
            aspirantInfo: aspirantInfoTemplate,
            candidate: candidateTemplate,
            identity: identityTemplate,
            sdcCenter: sdcCenterTemplate,
            batchCourse: batchCourseTemplate,
            scheme: schemeTemplate,
            status: statusTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Aspirant ID & Reg Date -->
        <ng-template #aspirantInfoTemplate let-a>
          <div class="font-mono text-xs">
            <span class="font-bold text-[#174A6E] block">{{ a.id }}</span>
            <span class="text-[11px] text-slate-500 font-normal block mt-0.5">Enrolled: {{ a.enrollmentDate }}</span>
          </div>
        </ng-template>

        <!-- Template: Candidate Details (Avatar, Name, Father Name, Age/Gender, Category) -->
        <ng-template #candidateTemplate let-a>
          <div class="flex items-center gap-3 py-1">
            <div class="w-9 h-11 rounded border border-slate-200 bg-slate-100 overflow-hidden shrink-0 shadow-2xs">
              <img [src]="a.candidatePhotoUrl || defaultAvatar" alt="Photo" class="w-full h-full object-cover" />
            </div>
            <div>
              <div class="font-bold text-slate-900 text-xs leading-snug">
                {{ a.aspirantName }}
              </div>
              <div class="text-[11px] text-slate-500 leading-tight">
                {{ a.relationType }}: {{ a.relationName }}
              </div>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-[10px] text-slate-600 font-medium">{{ a.gender }}, {{ a.age }} yrs</span>
                <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                <span class="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {{ a.category }}
                </span>
              </div>
            </div>
          </div>
        </ng-template>

        <!-- Template: Identity & Contact (Aadhaar Masked, Mobile, Email) -->
        <ng-template #identityTemplate let-a>
          <div class="text-xs space-y-0.5">
            <div class="flex items-center gap-1 font-mono text-slate-900 font-semibold">
              <svg class="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span>{{ a.aadhaarMasked }}</span>
            </div>
            <div class="text-slate-600 text-[11px] flex items-center gap-1">
              <span>{{ a.mobileNo }}</span>
            </div>
            @if (a.email) {
              <div class="text-slate-400 text-[10.5px] truncate max-w-[140px]" [title]="a.email">
                {{ a.email }}
              </div>
            }
          </div>
        </ng-template>

        <!-- Template: SDC Center (Prompt: "and also all the sdc can be seen") -->
        <ng-template #sdcCenterTemplate let-a>
          <div class="min-w-[150px]">
            <div class="font-semibold text-slate-900 text-xs leading-snug">
              {{ a.sdcName }}
            </div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[10.5px] font-mono text-slate-900 font-bold">{{ a.sdcCode }}</span>
              <span class="w-1 h-1 rounded-full bg-slate-300"></span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {{ a.sdcDistrict }}
              </span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Batch & Course -->
        <ng-template #batchCourseTemplate let-a>
          <div class="min-w-[150px]">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-bold text-xs text-slate-900">
                {{ a.batchCode }}
              </span>
              <span class="text-[11px] text-slate-500 truncate">{{ a.sector }}</span>
            </div>
            <div class="font-medium text-slate-800 text-xs mt-1 leading-snug">
              {{ a.courseName }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Scheme (All schemes black same) -->
        <ng-template #schemeTemplate let-a>
          <div class="text-center">
            <span class="font-bold text-xs tracking-wider uppercase text-slate-900">
              {{ a.scheme }}
            </span>
          </div>
        </ng-template>

        <!-- Template: Status -->
        <ng-template #statusTemplate let-a>
          <div class="text-center">
            @if (a.trainingStatus === 'IN_TRAINING') {
              <span class="font-bold text-xs text-sky-700 tracking-wider uppercase">
                IN TRAINING
              </span>
            } @else if (a.trainingStatus === 'CERTIFIED') {
              <span class="font-bold text-xs text-emerald-700 tracking-wider uppercase">
                CERTIFIED
              </span>
            } @else {
              <span class="font-bold text-xs text-slate-600 tracking-wider uppercase">
                ENROLLED
              </span>
            }
          </div>
        </ng-template>

        <!-- Template: Actions -->
        <ng-template #actionsTemplate let-a>
          <div class="flex items-center justify-end gap-1.5">
            <button
              type="button"
              (click)="viewDetails(a)"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="View & Edit Aspirant Details"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View Details</span>
            </button>
          </div>
        </ng-template>

      </div>

      <!-- ===================================================================== -->
      <!-- FULL CANDIDATE DETAILS MODAL (View & Edit Support)                    -->
      <!-- ===================================================================== -->
      @if (selectedAspirant(); as cand) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            
            <!-- Dossier Modal Header -->
            <div class="bg-gradient-to-r from-[#0B3558] to-[#174A6E] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-3.5">
                <div class="w-12 h-14 rounded-lg bg-white/10 border border-white/20 overflow-hidden shrink-0 shadow-md">
                  <img [src]="cand.candidatePhotoUrl || defaultAvatar" alt="Candidate" class="w-full h-full object-cover" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-base sm:text-lg font-bold m-0 tracking-tight leading-snug">
                      {{ isEditMode() ? (editForm.aspirantName || cand.aspirantName) : cand.aspirantName }}
                    </h2>
                    <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {{ isEditMode() ? (editForm.trainingStatus || cand.trainingStatus) : cand.trainingStatus }}
                    </span>
                    @if (isEditMode()) {
                      <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-400 text-slate-900 border border-amber-300">
                        EDITING
                      </span>
                    }
                  </div>
                  <div class="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                    <span class="font-mono">{{ cand.id }}</span>
                    <span>•</span>
                    <span>Aadhaar: {{ cand.aadhaarMasked }}</span>
                    <span>•</span>
                    <span class="text-emerald-300 font-semibold">Biometric AEBAS Verified</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="toggleEditMode()"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors border shadow-2xs"
                  [class.bg-white]="isEditMode()"
                  [class.text-[#174A6E]]="isEditMode()"
                  [class.border-white]="isEditMode()"
                  [class.bg-white/15]="!isEditMode()"
                  [class.text-white]="!isEditMode()"
                  [class.hover:bg-white/25]="!isEditMode()"
                  [class.border-white/30]="!isEditMode()"
                >
                  @if (!isEditMode()) {
                    <span class="flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Details
                    </span>
                  } @else {
                    <span class="flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Edit
                    </span>
                  }
                </button>

                <button
                  type="button"
                  (click)="closeModal()"
                  class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Context Banner: SDC Center & Batch Details -->
            <div class="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-slate-500 font-medium">Training Center (SDC):</span>
                <span class="font-bold text-slate-900">{{ cand.sdcName }}</span>
                <span class="font-mono text-slate-900 font-bold">({{ cand.sdcCode }})</span>
                <span class="px-1.5 py-0.2 rounded text-[10.5px] bg-white border border-slate-300 text-slate-700">{{ cand.sdcDistrict }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 font-medium">Batch:</span>
                <span class="font-bold font-mono text-slate-900">{{ cand.batchCode }}</span>
                <span class="px-2 py-0.5 rounded text-[10.5px] font-bold text-slate-900">{{ cand.scheme }}</span>
                <span class="text-slate-600 font-medium truncate max-w-[200px]" [title]="cand.courseName">{{ cand.courseName }}</span>
              </div>
            </div>

            <!-- Modal Body (Scrollable Dossier Sections) -->
            <div class="p-5 overflow-y-auto space-y-5 text-xs">
              
              @if (!isEditMode()) {
                <!-- VIEW MODE -->

                <!-- Section 1: Main / Personal Details -->
                <div class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                      <span class="w-1.5 h-3.5 bg-[#174A6E] rounded-full"></span>
                      <span>1. Main / Personal Details &amp; Identity</span>
                    </h3>
                    <button
                      type="button"
                      (click)="toggleEditMode()"
                      class="text-[11px] text-[#174A6E] hover:underline font-semibold cursor-pointer"
                    >
                      ✎ Edit Section
                    </button>
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Full Name</span>
                      <span class="font-bold text-slate-800">{{ cand.aspirantName }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Aadhaar No. (Masked)</span>
                      <span class="font-mono font-bold text-slate-800">{{ cand.aadhaarMasked }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Jan Aadhaar ID</span>
                      <span class="font-mono font-semibold text-slate-800">{{ cand.janaadhaarId || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Other ID ({{ cand.otherIdType || 'ID' }})</span>
                      <span class="font-mono font-semibold text-slate-800">{{ cand.otherIdNo || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Date of Birth (Age)</span>
                      <span class="font-semibold text-slate-800">{{ cand.dob }} ({{ cand.age }} yrs)</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Gender / Relation</span>
                      <span class="font-semibold text-slate-800">{{ cand.gender }} • {{ cand.relationType }}: {{ cand.relationName }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Mother's Name</span>
                      <span class="font-semibold text-slate-800">{{ cand.motherName || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Education Qualification</span>
                      <span class="font-semibold text-slate-800">{{ cand.educationalQualification }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Religion / Category</span>
                      <span class="font-semibold text-slate-800">{{ cand.religion }} • {{ cand.category }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Minority / Special Ability</span>
                      <span class="font-semibold text-slate-800">{{ cand.minority }} • Disability: {{ cand.specialAbility }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Area Type</span>
                      <span class="font-semibold text-slate-800">{{ cand.areaType }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Aadhaar Document Proof</span>
                      <span class="font-semibold text-blue-700">{{ cand.aadhaarDocName || 'Aadhaar_Proof.pdf' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Section 2: Address & Contact Details -->
                <div class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                      <span class="w-1.5 h-3.5 bg-[#174A6E] rounded-full"></span>
                      <span>2. Address &amp; Contact Details</span>
                    </h3>
                    <button
                      type="button"
                      (click)="toggleEditMode()"
                      class="text-[11px] text-[#174A6E] hover:underline font-semibold cursor-pointer"
                    >
                      Edit Section
                    </button>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <!-- Permanent Address -->
                    <div class="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Permanent Address</span>
                      <p class="text-slate-800 m-0 leading-relaxed">
                        {{ cand.permHouseNo }}, {{ cand.permStreet }}<br />
                        {{ cand.permWard }}, {{ cand.permCity }} - {{ cand.permPincode }}<br />
                        District: <span class="font-semibold">{{ cand.permDistrict }}</span>, Block: {{ cand.permBlock }}<br />
                        Tehsil: {{ cand.permTehsil }}, Assembly: {{ cand.permAssembly }}
                      </p>
                    </div>
                    <!-- Communication Address -->
                    <div class="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Communication Address</span>
                      <p class="text-slate-800 m-0 leading-relaxed">
                        {{ cand.commHouseNo }}, {{ cand.commStreet }}<br />
                        {{ cand.commWard }}, {{ cand.commCity }} - {{ cand.commPincode }}<br />
                        District: <span class="font-semibold">{{ cand.commDistrict }}</span>, Block: {{ cand.commBlock }}<br />
                        Tehsil: {{ cand.commTehsil }}, Municipality: {{ cand.commMunicipality }}
                      </p>
                    </div>
                  </div>
                  <!-- Contact Row -->
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Mobile No.</span>
                      <span class="font-semibold text-slate-800">{{ cand.mobileNo }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Alt Mobile No.</span>
                      <span class="font-semibold text-slate-800">{{ cand.altMobileNo || 'None' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Email Address</span>
                      <span class="font-semibold text-slate-800">{{ cand.email || 'None' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Section 3: Bank & Socio-Economic Details -->
                <div class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                      <span class="w-1.5 h-3.5 bg-[#174A6E] rounded-full"></span>
                      <span>3. Bank DBT &amp; Socio-Economic Registrations</span>
                    </h3>
                    <button
                      type="button"
                      (click)="toggleEditMode()"
                      class="text-[11px] text-[#174A6E] hover:underline font-semibold cursor-pointer"
                    >
                      Edit Section
                    </button>
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Bank Name</span>
                      <span class="font-semibold text-slate-800">{{ cand.bankName }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Account No. (Masked)</span>
                      <span class="font-mono font-bold text-slate-800">XXXX-{{ cand.bankAccountNo ? cand.bankAccountNo.slice(-4) : '4812' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">IFSC Code</span>
                      <span class="font-mono font-semibold text-slate-800">{{ cand.ifscCode }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Branch</span>
                      <span class="font-semibold text-slate-800">{{ cand.bankBranch }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Annual Income</span>
                      <span class="font-semibold text-slate-800">₹{{ cand.annualFamilyIncome }} ({{ cand.incomeSlab }})</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">Economic Status</span>
                      <span class="font-semibold text-slate-800">{{ cand.economicStatus }} (Card: {{ cand.economicCardNo }})</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">BoCW Registered</span>
                      <span class="font-semibold text-slate-800">{{ cand.bocwWorker }} {{ cand.bocwNo ? '(' + cand.bocwNo + ')' : '' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10.5px]">MGNREGA / RSBY / NRLM</span>
                      <span class="font-semibold text-slate-800">{{ cand.mgnregaWorker === 'Yes' ? 'MGNREGA' : 'None' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Section 4: Attached Documents Table -->
                <div class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-3.5 bg-[#174A6E] rounded-full"></span>
                    <span>4. Attached Documents ({{ cand.documents.length }})</span>
                  </h3>
                  <div class="overflow-x-auto bg-white border border-slate-200 rounded-lg">
                    <table class="w-full text-xs text-left">
                      <thead class="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                        <tr>
                          <th class="py-2 px-3 w-10 text-center">#</th>
                          <th class="py-2 px-3">Document Type</th>
                          <th class="py-2 px-3">Document Name</th>
                          <th class="py-2 px-3">File Name</th>
                          <th class="py-2 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (doc of cand.documents; track doc.id; let idx = $index) {
                          <tr>
                            <td class="py-2 px-3 text-center text-slate-400">{{ idx + 1 }}</td>
                            <td class="py-2 px-3 font-semibold text-slate-800">{{ doc.docType }}</td>
                            <td class="py-2 px-3 text-slate-700">{{ doc.docName }}</td>
                            <td class="py-2 px-3 font-mono text-slate-600">{{ doc.fileName || 'Pending upload' }}</td>
                            <td class="py-2 px-3 text-center">
                              @if (doc.status === 'UPLOADED') {
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Uploaded</span>
                              } @else {
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

              } @else {
                <!-- EDIT MODE -->
                
                <!-- Notice Banner -->
                <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                  <div class="flex items-center gap-2">
                    <span><strong>Edit Mode Active:</strong> You can edit personal information, address, contact, and bank details. Click <strong>Save Changes</strong> below when finished.</span>
                  </div>
                  <button
                    type="button"
                    (click)="toggleEditMode()"
                    class="text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <!-- Editable Section 1: Main / Personal Details -->
                <div class="border border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3">
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-3.5 bg-[#174A6E] rounded-full"></span>
                    <span>1. Edit Personal Details &amp; Identity</span>
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Aspirant Name *</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.aspirantName"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Relation Type</label>
                      <select
                        [(ngModel)]="editForm.relationType"
                        class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      >
                        <option value="Father">Father</option>
                        <option value="Husband">Husband</option>
                        <option value="Guardian">Guardian</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Father / Relation Name *</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.relationName"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Mother's Name</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.motherName"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Date of Birth</label>
                      <input
                        type="date"
                        [(ngModel)]="editForm.dob"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Age (Years)</label>
                      <input
                        type="number"
                        [(ngModel)]="editForm.age"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
                      <select
                        [(ngModel)]="editForm.gender"
                        class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                      <select
                        [(ngModel)]="editForm.category"
                        class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
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
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Qualification</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.educationalQualification"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Area Type</label>
                      <select
                        [(ngModel)]="editForm.areaType"
                        class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      >
                        <option value="Rural">Rural</option>
                        <option value="Urban">Urban</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Minority</label>
                      <select
                        [(ngModel)]="editForm.minority"
                        class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Editable Section 2: Address & Contact Details -->
                <div class="border border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3">
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-3.5 bg-[#174A6E] rounded-full"></span>
                    <span>2. Edit Address &amp; Contact Details</span>
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile No. *</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.mobileNo"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Alt Mobile No.</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.altMobileNo"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        type="email"
                        [(ngModel)]="editForm.email"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">House / Flat No.</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permHouseNo"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Street / Locality</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permStreet"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">City / Town</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permCity"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">District</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permDistrict"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pincode</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permPincode"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Tehsil</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.permTehsil"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                  </div>
                </div>

                <!-- Editable Section 3: Bank DBT Details -->
                <div class="border border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3">
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                    <span class="w-1.5 h-3.5 bg-[#174A6E] rounded-full"></span>
                    <span>3. Edit Bank DBT &amp; Socio-Economic Details</span>
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Bank Name</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.bankName"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Account Number</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.bankAccountNo"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-mono font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">IFSC Code</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.ifscCode"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-mono font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Branch</label>
                      <input
                        type="text"
                        [(ngModel)]="editForm.bankBranch"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Annual Income (₹)</label>
                      <input
                        type="number"
                        [(ngModel)]="editForm.annualFamilyIncome"
                        class="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Economic Status</label>
                      <select
                        [(ngModel)]="editForm.economicStatus"
                        class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      >
                        <option value="APL">APL</option>
                        <option value="BPL">BPL</option>
                        <option value="Antyodaya">Antyodaya</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Training Status</label>
                      <select
                        [(ngModel)]="editForm.trainingStatus"
                        class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded font-medium text-slate-900 focus:outline-none focus:border-[#174A6E]"
                      >
                        <option value="ENROLLED">ENROLLED</option>
                        <option value="IN_TRAINING">IN TRAINING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CERTIFIED">CERTIFIED</option>
                      </select>
                    </div>
                  </div>
                </div>

              }

            </div>

            <!-- Modal Footer Actions -->
            <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              
              @if (!isEditMode()) {
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 font-medium">Status:</span>
                  <select
                    [ngModel]="cand.trainingStatus"
                    (ngModelChange)="updateStatus(cand, $event)"
                    class="h-8 px-2 text-xs bg-white border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none focus:border-[#174A6E]"
                  >
                    <option value="ENROLLED">ENROLLED</option>
                    <option value="IN_TRAINING">IN TRAINING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CERTIFIED">CERTIFIED</option>
                  </select>

                  <button
                    type="button"
                    (click)="toggleBiometric(cand)"
                    class="h-8 px-2.5 rounded text-xs font-semibold border transition-colors cursor-pointer"
                    [class.bg-emerald-50]="cand.biometricVerified"
                    [class.text-emerald-700]="cand.biometricVerified"
                    [class.border-emerald-300]="cand.biometricVerified"
                    [class.bg-amber-50]="!cand.biometricVerified"
                    [class.text-amber-800]="!cand.biometricVerified"
                    [class.border-amber-300]="!cand.biometricVerified"
                  >
                    {{ cand.biometricVerified ? 'AEBAS Verified' : 'Mark AEBAS Verified' }}
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="toggleEditMode()"
                    class="px-3.5 py-1.5 bg-white border border-[#174A6E] text-[#174A6E] hover:bg-[#EAF2F6] rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit Aspirant</span>
                  </button>

                  <button
                    type="button"
                    (click)="printDossier(cand)"
                    class="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print Dossier</span>
                  </button>

                  <button
                    type="button"
                    (click)="closeModal()"
                    class="px-4 py-1.5 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              } @else {
                <div class="text-xs text-slate-500">
                  Clicking <strong>Save Changes</strong> updates the candidate profile immediately.
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="toggleEditMode()"
                    class="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    (click)="saveAspirantChanges()"
                    class="px-4 py-1.5 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Changes</span>
                  </button>
                </div>
              }

            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class AspirantListComponent {
  readonly aspirantService = inject(AspirantService);
  readonly batchService = inject(BatchService);
  readonly sdcService = inject(SdcService);
  readonly router = inject(Router);

  // Search & Filter Reactive Signals
  readonly searchQuery = signal<string>('');
  readonly appliedSearch = signal<string>('');
  readonly selectedSdc = signal<string>('All');
  readonly selectedScheme = signal<string>('All');
  readonly selectedBatch = signal<string>('All');
  readonly selectedStatus = signal<string>('All');
  readonly activeQuickTab = signal<string>('ALL');

  // Selected Aspirant & Edit State
  readonly selectedAspirant = signal<AspirantRecord | null>(null);
  readonly isEditMode = signal<boolean>(false);
  readonly successMessage = signal<string>('');
  editForm: Partial<AspirantRecord> = {};

  readonly pageSize = 10;

  // Demo avatar SVG matching candidate profile photo demo
  readonly defaultAvatar = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect width="120" height="150" fill="%23e2e8f0"/%3E%3Ccircle cx="60" cy="50" r="28" fill="%230f172a"/%3E%3Cpath d="M20 135 C 20 95, 100 95, 100 135 Z" fill="%231e293b"/%3E%3C/svg%3E';

  readonly stats = this.aspirantService.stats;

  readonly aspirantColumns: TableColumn<AspirantRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'aspirantInfo', label: 'Aspirant ID', type: 'custom', width: 'w-36' },
    { key: 'candidate', label: 'Candidate Profile', type: 'custom', width: 'min-w-[200px]' },
    { key: 'identity', label: 'Aadhaar & Contact', type: 'custom', width: 'min-w-[150px]' },
    { key: 'sdcCenter', label: 'Center (SDC)', type: 'custom', width: 'min-w-[170px]' },
    { key: 'batchCourse', label: 'Batch & Course', type: 'custom', width: 'min-w-[170px]' },
    { key: 'scheme', label: 'Scheme', align: 'center', type: 'custom', width: 'w-28' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'w-28' },
    { key: 'actions', label: 'Actions', align: 'right', type: 'custom', width: 'w-32' }
  ];

  // Dynamic filter options derived from current services
  get allSdcOptions() {
    const sdcs = this.sdcService.sdcs();
    return [
      { code: 'All', name: 'All Centers', district: 'Rajasthan' },
      ...sdcs.map(s => ({ code: s.sdcCode, name: s.sdcName, district: s.district }))
    ];
  }

  get allSchemeOptions() {
    return ['All', 'SAMARTH', 'MMKVY', 'RAJKVIK', 'MNSKSY', 'PMKVY'];
  }

  get allBatchOptions() {
    const batches = this.batchService.batches();
    return [
      { code: 'All', course: 'All Batches' },
      ...batches.map(b => ({ code: b.batchCode, course: b.courseName }))
    ];
  }

  // Quick filter tabs: AEBAS Verified removed per user request
  readonly quickFilterTabs = computed(() => {
    const list = this.aspirantService.aspirants();
    return [
      { id: 'ALL', label: 'All Aspirants', count: list.length },
      { id: 'IN_TRAINING', label: 'In Training', count: list.filter(a => a.trainingStatus === 'IN_TRAINING').length },
      { id: 'ENROLLED', label: 'Enrolled', count: list.filter(a => a.trainingStatus === 'ENROLLED').length }
    ];
  });

  readonly filteredAspirants = computed(() => {
    let list = this.aspirantService.aspirants();

    // 1. SDC filter
    const sdc = this.selectedSdc();
    if (sdc !== 'All') {
      list = list.filter(a => a.sdcCode === sdc || a.sdcName.toLowerCase().includes(sdc.toLowerCase()));
    }

    // 2. Scheme filter
    const scheme = this.selectedScheme();
    if (scheme !== 'All') {
      list = list.filter(a => a.scheme.toLowerCase() === scheme.toLowerCase());
    }

    // 3. Batch filter
    const batch = this.selectedBatch();
    if (batch !== 'All') {
      list = list.filter(a => a.batchCode === batch);
    }

    // 4. Status filter
    const status = this.selectedStatus();
    if (status !== 'All') {
      list = list.filter(a => a.trainingStatus === status);
    }

    // 5. Quick tab filter
    const quick = this.activeQuickTab();
    if (quick === 'IN_TRAINING') {
      list = list.filter(a => a.trainingStatus === 'IN_TRAINING');
    } else if (quick === 'ENROLLED') {
      list = list.filter(a => a.trainingStatus === 'ENROLLED');
    }

    // 6. Free text search query
    const query = this.appliedSearch().toLowerCase().trim();
    if (query) {
      list = list.filter(a =>
        a.id.toLowerCase().includes(query) ||
        a.aspirantName.toLowerCase().includes(query) ||
        a.aadhaarMasked.toLowerCase().includes(query) ||
        (a.aadhaarNo && a.aadhaarNo.includes(query)) ||
        a.mobileNo.includes(query) ||
        a.sdcName.toLowerCase().includes(query) ||
        a.sdcCode.toLowerCase().includes(query) ||
        a.sdcDistrict.toLowerCase().includes(query) ||
        a.batchCode.toLowerCase().includes(query) ||
        a.courseName.toLowerCase().includes(query) ||
        a.scheme.toLowerCase().includes(query) ||
        (a.relationName && a.relationName.toLowerCase().includes(query)) ||
        (a.permCity && a.permCity.toLowerCase().includes(query)) ||
        (a.permDistrict && a.permDistrict.toLowerCase().includes(query)) ||
        (a.janaadhaarId && a.janaadhaarId.toLowerCase().includes(query))
      );
    }

    return list;
  });

  setQuickTab(tabId: string): void {
    this.activeQuickTab.set(tabId);
  }

  onSearchInput(val: string): void {
    this.searchQuery.set(val);
    this.appliedSearch.set(val);
  }

  applySearch(): void {
    this.appliedSearch.set(this.searchQuery());
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.appliedSearch.set('');
  }

  viewDetails(aspirant: AspirantRecord): void {
    this.selectedAspirant.set(aspirant);
    this.initEditForm(aspirant);
    this.isEditMode.set(false);
  }

  viewDossier(aspirant: AspirantRecord): void {
    this.viewDetails(aspirant);
  }

  toggleEditMode(): void {
    const cur = this.selectedAspirant();
    if (!cur) return;
    if (!this.isEditMode()) {
      this.initEditForm(cur);
      this.isEditMode.set(true);
    } else {
      this.isEditMode.set(false);
    }
  }

  private initEditForm(aspirant: AspirantRecord): void {
    this.editForm = {
      aspirantName: aspirant.aspirantName,
      relationType: aspirant.relationType,
      relationName: aspirant.relationName,
      motherName: aspirant.motherName,
      dob: aspirant.dob,
      age: aspirant.age,
      gender: aspirant.gender,
      category: aspirant.category,
      religion: aspirant.religion,
      educationalQualification: aspirant.educationalQualification,
      areaType: aspirant.areaType,
      minority: aspirant.minority,
      specialAbility: aspirant.specialAbility,
      mobileNo: aspirant.mobileNo,
      altMobileNo: aspirant.altMobileNo,
      email: aspirant.email,
      permHouseNo: aspirant.permHouseNo,
      permStreet: aspirant.permStreet,
      permWard: aspirant.permWard,
      permCity: aspirant.permCity,
      permDistrict: aspirant.permDistrict,
      permTehsil: aspirant.permTehsil,
      permPincode: aspirant.permPincode,
      bankName: aspirant.bankName,
      bankAccountNo: aspirant.bankAccountNo,
      ifscCode: aspirant.ifscCode,
      bankBranch: aspirant.bankBranch,
      annualFamilyIncome: aspirant.annualFamilyIncome,
      economicStatus: aspirant.economicStatus,
      trainingStatus: aspirant.trainingStatus
    };
  }

  saveAspirantChanges(): void {
    const cur = this.selectedAspirant();
    if (!cur) return;

    const updated = this.aspirantService.updateAspirant(cur.id, this.editForm);
    if (updated) {
      this.selectedAspirant.set(updated);
      this.isEditMode.set(false);
      this.successMessage.set(`Aspirant "${updated.aspirantName}" details updated successfully!`);
      setTimeout(() => this.successMessage.set(''), 4500);
    }
  }

  closeModal(): void {
    this.selectedAspirant.set(null);
    this.isEditMode.set(false);
  }

  updateStatus(aspirant: AspirantRecord, newStatus: AspirantTrainingStatus): void {
    this.aspirantService.updateTrainingStatus(aspirant.id, newStatus);
    if (this.selectedAspirant()?.id === aspirant.id) {
      this.selectedAspirant.update(cur => cur ? { ...cur, trainingStatus: newStatus } : null);
    }
  }

  toggleBiometric(aspirant: AspirantRecord): void {
    this.aspirantService.toggleBiometric(aspirant.id);
    if (this.selectedAspirant()?.id === aspirant.id) {
      this.selectedAspirant.update(cur => cur ? { ...cur, biometricVerified: !cur.biometricVerified } : null);
    }
  }

  openMapAspirant(): void {
    const batches = this.batchService.batches();
    if (batches.length > 0) {
      this.router.navigate(['/batches', batches[0].id, 'map-aspirant']);
    } else {
      this.router.navigate(['/batches']);
    }
  }

  exportToCsv(): void {
    const data = this.filteredAspirants();
    if (!data.length) return;

    const headers = ['Aspirant ID', 'Name', 'Gender', 'Age', 'Aadhaar (Masked)', 'Mobile', 'SDC Code', 'SDC Name', 'District', 'Batch Code', 'Course', 'Scheme', 'Status', 'Biometric Verified'];
    const rows = data.map(a => [
      a.id,
      `"${a.aspirantName}"`,
      a.gender,
      a.age,
      a.aadhaarMasked,
      a.mobileNo,
      a.sdcCode,
      `"${a.sdcName}"`,
      a.sdcDistrict,
      a.batchCode,
      `"${a.courseName}"`,
      a.scheme,
      a.trainingStatus,
      a.biometricVerified ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aspirants_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printDossier(aspirant: AspirantRecord): void {
    window.print();
  }
}
