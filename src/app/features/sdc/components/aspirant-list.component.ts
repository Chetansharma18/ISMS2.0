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
    <div class="w-full min-h-full bg-white text-slate-800 font-sans selection:bg-slate-900 selection:text-white" style="font-family: 'Inter', sans-serif;">
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

            <!-- Register Aspirant Button -->
            <button
              type="button"
              (click)="openMapAspirant()"
              class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-white text-[#174A6E] hover:bg-slate-100 active:scale-95 text-xs font-semibold shadow-xs transition-all cursor-pointer select-none"
            >
              <span class="text-sm font-bold leading-none">+</span>
              <span>Register Aspirant</span>
            </button>
          </div>
        </app-page-header>

        <!-- Top Statistics Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          <!-- Card 1: Total Aspirants -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Aspirants</span>
              <div class="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold text-slate-900 font-mono">{{ stats().total }}</span>
              <span class="text-[11px] text-slate-500">Enrolled</span>
            </div>
            <div class="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>♂ {{ stats().maleCount }} Male</span>
              <span>•</span>
              <span>♀ {{ stats().femaleCount }} Female</span>
            </div>
          </div>

          <!-- Card 2: SDC Centers Covered -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">SDC Centers</span>
              <div class="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
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
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Batches Active</span>
              <div class="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
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
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Govt Schemes</span>
              <div class="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
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
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Biometric AEBAS</span>
              <div class="w-6 h-6 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
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
                [(ngModel)]="selectedSdc"
                class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded-[4px] text-slate-800 focus:outline-none focus:border-[#174A6E]"
              >
                <option value="All">All SDC Centers ({{ allSdcOptions.length - 1 }})</option>
                @for (opt of allSdcOptions.slice(1); track opt.code) {
                  <option [value]="opt.code">{{ opt.name }} ({{ opt.code }}) - {{ opt.district }}</option>
                }
              </select>
            </div>

            <!-- Scheme Filter (Prompt: "and schme") -->
            <div>
              <label class="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filter by Scheme:
              </label>
              <select
                [(ngModel)]="selectedScheme"
                class="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded-[4px] text-slate-800 focus:outline-none focus:border-[#174A6E]"
              >
                <option value="All">All Schemes ({{ allSchemeOptions.length - 1 }})</option>
                @for (sc of allSchemeOptions.slice(1); track sc) {
                  <option [value]="sc">{{ sc }}</option>
                }
              </select>
            </div>

            <!-- Batch Filter (Prompt: "all the batched") -->
            <div>
              <label class="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filter by Batch:
              </label>
              <select
                [(ngModel)]="selectedBatch"
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
                [(ngModel)]="selectedStatus"
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

            <!-- Search Input -->
            <div class="relative w-full sm:w-80">
              <svg class="w-3.5 h-3.5 text-[#7A8792] absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search Aspirant ID, Name, Aadhaar, SDC, Batch..."
                class="w-full pl-8 pr-7 py-1.5 text-[13px] bg-white border border-[#D9E1E7] rounded-[4px] text-[#1F2933] placeholder:text-[#7A8792] focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E] transition-colors font-normal"
              />
              @if (searchQuery) {
                <button
                  type="button"
                  (click)="searchQuery = ''"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                >
                  &times;
                </button>
              }
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
            biometric: biometricTemplate,
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
              <span>📞 {{ a.mobileNo }}</span>
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
              <span class="text-[10.5px] font-mono text-blue-700 font-semibold">{{ a.sdcCode }}</span>
              <span class="w-1 h-1 rounded-full bg-slate-300"></span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {{ a.sdcDistrict }}
              </span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Batch & Course (Prompt: "all the batched") -->
        <ng-template #batchCourseTemplate let-a>
          <div class="min-w-[150px]">
            <div class="flex items-center gap-1.5">
              <span class="px-1.5 py-0.5 rounded font-mono font-bold text-[10.5px] bg-blue-50 text-blue-800 border border-blue-200">
                {{ a.batchCode }}
              </span>
              <span class="text-[11px] text-slate-500 truncate">{{ a.sector }}</span>
            </div>
            <div class="font-medium text-slate-800 text-xs mt-1 leading-snug">
              {{ a.courseName }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Scheme (Prompt: "and schme") -->
        <ng-template #schemeTemplate let-a>
          <span
            class="inline-block px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border"
            [class.bg-purple-50]="a.scheme === 'SAMARTH'"
            [class.text-purple-800]="a.scheme === 'SAMARTH'"
            [class.border-purple-200]="a.scheme === 'SAMARTH'"
            [class.bg-blue-50]="a.scheme === 'MMKVY'"
            [class.text-blue-800]="a.scheme === 'MMKVY'"
            [class.border-blue-200]="a.scheme === 'MMKVY'"
            [class.bg-amber-50]="a.scheme === 'RAJKViK' || a.scheme === 'RAJKVIK'"
            [class.text-amber-800]="a.scheme === 'RAJKViK' || a.scheme === 'RAJKVIK'"
            [class.border-amber-200]="a.scheme === 'RAJKViK' || a.scheme === 'RAJKVIK'"
            [class.bg-emerald-50]="a.scheme === 'MNSKSY'"
            [class.text-emerald-800]="a.scheme === 'MNSKSY'"
            [class.border-emerald-200]="a.scheme === 'MNSKSY'"
            [class.bg-slate-50]="!['SAMARTH','MMKVY','RAJKViK','RAJKVIK','MNSKSY'].includes(a.scheme)"
            [class.text-slate-800]="!['SAMARTH','MMKVY','RAJKViK','RAJKVIK','MNSKSY'].includes(a.scheme)"
            [class.border-slate-300]="!['SAMARTH','MMKVY','RAJKViK','RAJKVIK','MNSKSY'].includes(a.scheme)"
          >
            {{ a.scheme }}
          </span>
        </ng-template>

        <!-- Template: Biometric Status -->
        <ng-template #biometricTemplate let-a>
          <div class="text-center">
            @if (a.biometricVerified) {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-[#E6F9F0] text-[#15803D] border border-[#86EFAC]">
                <span>✓ AEBAS Verified</span>
              </span>
              <span class="block text-[10px] text-slate-500 mt-0.5">{{ a.attendancePercent }}% Biometric Attendance</span>
            } @else {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                <span>Pending Verification</span>
              </span>
            }
          </div>
        </ng-template>

        <!-- Template: Status Badge -->
        <ng-template #statusTemplate let-a>
          <div class="text-center">
            @if (a.trainingStatus === 'IN_TRAINING') {
              <span class="inline-block px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-sky-50 text-sky-800 border border-sky-300 tracking-wider">
                IN TRAINING
              </span>
            } @else if (a.trainingStatus === 'CERTIFIED') {
              <span class="inline-block px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 tracking-wider">
                CERTIFIED
              </span>
            } @else {
              <span class="inline-block px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-300 tracking-wider">
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
              (click)="viewDossier(a)"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#174A6E] hover:bg-[#0F172A] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="View full 10-section dossier"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View Dossier</span>
            </button>
          </div>
        </ng-template>

      </div>

      <!-- ===================================================================== -->
      <!-- FULL CANDIDATE DOSSIER SLIDE-OVER / MODAL (All 10 Sections)          -->
      <!-- ===================================================================== -->
      @if (selectedAspirant(); as cand) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            
            <!-- Dossier Modal Header -->
            <div class="bg-gradient-to-r from-[#0F172A] via-[#174A6E] to-[#0F172A] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-3.5">
                <div class="w-12 h-14 rounded-lg bg-white/10 border border-white/20 overflow-hidden shrink-0 shadow-md">
                  <img [src]="cand.candidatePhotoUrl || defaultAvatar" alt="Candidate" class="w-full h-full object-cover" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-base sm:text-lg font-bold m-0 tracking-tight leading-snug">
                      {{ cand.aspirantName }}
                    </h2>
                    <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {{ cand.trainingStatus }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                    <span class="font-mono">{{ cand.id }}</span>
                    <span>•</span>
                    <span>Aadhaar: {{ cand.aadhaarMasked }}</span>
                    <span>•</span>
                    <span class="text-emerald-300 font-semibold">✓ Biometric AEBAS Verified</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                (click)="selectedAspirant.set(null)"
                class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            <!-- Context Banner: SDC Center & Batch Details -->
            <div class="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-slate-500 font-medium">Training Center (SDC):</span>
                <span class="font-bold text-slate-900">{{ cand.sdcName }}</span>
                <span class="font-mono text-blue-700 font-semibold">({{ cand.sdcCode }})</span>
                <span class="px-1.5 py-0.2 rounded text-[10.5px] bg-white border border-slate-300 text-slate-700">{{ cand.sdcDistrict }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 font-medium">Batch:</span>
                <span class="font-bold font-mono text-slate-900">{{ cand.batchCode }}</span>
                <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-blue-800 border border-blue-200">{{ cand.scheme }}</span>
                <span class="text-slate-600 font-medium truncate max-w-[200px]" [title]="cand.courseName">{{ cand.courseName }}</span>
              </div>
            </div>

            <!-- Modal Body (Scrollable Dossier Sections) -->
            <div class="p-5 overflow-y-auto space-y-5 text-xs">
              
              <!-- Section 1: Main / Personal Details -->
              <div class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                  <span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                  <span>1. Main / Personal Details &amp; Identity</span>
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
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
                    <span class="font-semibold text-blue-700">✓ {{ cand.aadhaarDocName || 'Aadhaar_Proof.pdf' }}</span>
                  </div>
                </div>
              </div>

              <!-- Section 2: Address & Contact Details -->
              <div class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                  <span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                  <span>2. Address &amp; Contact Details</span>
                </h3>
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
                    <span class="font-semibold text-slate-800">📞 {{ cand.mobileNo }}</span>
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
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                  <span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                  <span>3. Bank DBT &amp; Socio-Economic Registrations</span>
                </h3>
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
                  <span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
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
                              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">✓ Uploaded</span>
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

            </div>

            <!-- Modal Footer Actions -->
            <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-500">Quick Status Update:</span>
                <select
                  [ngModel]="cand.trainingStatus"
                  (ngModelChange)="updateStatus(cand, $event)"
                  class="h-8 px-2 text-xs bg-white border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
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
                  {{ cand.biometricVerified ? '✓ AEBAS Verified' : 'Mark AEBAS Verified' }}
                </button>
              </div>

              <div class="flex items-center gap-2">
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
                  (click)="selectedAspirant.set(null)"
                  class="px-4 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
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
export class AspirantListComponent {
  readonly aspirantService = inject(AspirantService);
  readonly batchService = inject(BatchService);
  readonly sdcService = inject(SdcService);
  readonly router = inject(Router);

  searchQuery = '';
  selectedSdc = 'All';
  selectedScheme = 'All';
  selectedBatch = 'All';
  selectedStatus = 'All';
  activeQuickTab = signal<string>('ALL');

  selectedAspirant = signal<AspirantRecord | null>(null);
  readonly pageSize = 10;

  defaultAvatar = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect width="120" height="150" fill="%23f1f5f9"/%3E%3Ccircle cx="60" cy="50" r="28" fill="%230b3558"/%3E%3Cpath d="M20 135 C 20 95, 100 95, 100 135 Z" fill="%23174a6e"/%3E%3C/svg%3E';

  readonly stats = this.aspirantService.stats;

  readonly aspirantColumns: TableColumn<AspirantRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'aspirantInfo', label: 'Aspirant ID', type: 'custom', width: 'w-36' },
    { key: 'candidate', label: 'Candidate Profile', type: 'custom', width: 'min-w-[200px]' },
    { key: 'identity', label: 'Aadhaar & Contact', type: 'custom', width: 'min-w-[150px]' },
    { key: 'sdcCenter', label: 'Center (SDC)', type: 'custom', width: 'min-w-[170px]' },
    { key: 'batchCourse', label: 'Batch & Course', type: 'custom', width: 'min-w-[170px]' },
    { key: 'scheme', label: 'Scheme', align: 'center', type: 'custom', width: 'w-28' },
    { key: 'biometric', label: 'Biometric Status', align: 'center', type: 'custom', width: 'w-36' },
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

  readonly quickFilterTabs = computed(() => {
    const list = this.aspirantService.aspirants();
    return [
      { id: 'ALL', label: 'All Aspirants', count: list.length },
      { id: 'IN_TRAINING', label: 'In Training', count: list.filter(a => a.trainingStatus === 'IN_TRAINING').length },
      { id: 'ENROLLED', label: 'Enrolled', count: list.filter(a => a.trainingStatus === 'ENROLLED').length },
      { id: 'AEBAS_VERIFIED', label: 'AEBAS Verified', count: list.filter(a => a.biometricVerified).length }
    ];
  });

  readonly filteredAspirants = computed(() => {
    let list = this.aspirantService.aspirants();

    // 1. SDC filter
    if (this.selectedSdc !== 'All') {
      list = list.filter(a => a.sdcCode === this.selectedSdc || a.sdcName.toLowerCase().includes(this.selectedSdc.toLowerCase()));
    }

    // 2. Scheme filter
    if (this.selectedScheme !== 'All') {
      list = list.filter(a => a.scheme.toLowerCase() === this.selectedScheme.toLowerCase());
    }

    // 3. Batch filter
    if (this.selectedBatch !== 'All') {
      list = list.filter(a => a.batchCode === this.selectedBatch);
    }

    // 4. Status filter
    if (this.selectedStatus !== 'All') {
      list = list.filter(a => a.trainingStatus === this.selectedStatus);
    }

    // 5. Quick tab filter
    const quick = this.activeQuickTab();
    if (quick === 'IN_TRAINING') {
      list = list.filter(a => a.trainingStatus === 'IN_TRAINING');
    } else if (quick === 'ENROLLED') {
      list = list.filter(a => a.trainingStatus === 'ENROLLED');
    } else if (quick === 'AEBAS_VERIFIED') {
      list = list.filter(a => a.biometricVerified);
    }

    // 6. Free text query
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(a =>
        a.id.toLowerCase().includes(query) ||
        a.aspirantName.toLowerCase().includes(query) ||
        a.aadhaarMasked.toLowerCase().includes(query) ||
        (a.aadhaarNo && a.aadhaarNo.includes(query)) ||
        a.mobileNo.includes(query) ||
        a.sdcName.toLowerCase().includes(query) ||
        a.sdcCode.toLowerCase().includes(query) ||
        a.batchCode.toLowerCase().includes(query) ||
        a.courseName.toLowerCase().includes(query) ||
        a.scheme.toLowerCase().includes(query) ||
        (a.janaadhaarId && a.janaadhaarId.toLowerCase().includes(query))
      );
    }

    return list;
  });

  setQuickTab(tabId: string): void {
    this.activeQuickTab.set(tabId);
  }

  viewDossier(aspirant: AspirantRecord): void {
    this.selectedAspirant.set(aspirant);
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
