import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import { PageHeaderComponent } from '../../../../shared';

export interface AcceptedCompanyRow {
  srNo: number;
  appId: string;
  agencyName: string;
  district: string;
  sector: string;
  category: string;
  grade: string;
  target: number;
}

export interface IpaCourseRow {
  sNo: number;
  sector: string;
  courseName: string;
  courseCode: string;
  durationDays: number;
  durationHrs: number;
  ojtProvision: string;
  minEduQualification: string;
  minAge: string;
  rNr: string;
  rCat: string;
  costC: number;
  costH: number;
  costToolkit: string;
  costTotal: number;
  approvedTraineesPerBatch: number;
  costPerBatch: number;
  possibleCycles: number;
  totalBudget: number;
  perDayTrainingHours: number;
}

export interface IpaParticularRow {
  sNo: number;
  particular: string;
  value: string;
}

@Component({
  selector: 'app-sanction-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent],
  template: `
    <div class="w-full min-h-full bg-white text-[#1F2933] font-sans pb-12 print:bg-white print:p-0 print:pb-0">
      <div class="p-4 sm:p-5 max-w-7xl mx-auto space-y-4 font-sans print:hidden">
        
        <!-- Top Action Header -->
        <app-page-header
          title="Sanction Order - Allocated Targets"
          [breadcrumbs]="[
            { label: 'Home', url: '/' },
            { label: 'Sanction Order', url: '/admin/sanction-orders' },
            { label: 'Accepted Companies Table' }
          ]"
          backUrl="/admin/sanction-orders"
          backTitle="Back to Sanction Order List"
        >
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/15 text-white border border-white/20 text-xs font-medium">
            <span>Accepted Companies:</span>
            <span class="font-bold text-white">{{ acceptedRows().length }}</span>
          </div>
        </app-page-header>

        <!-- Scheme Context Banner -->
        @if (currentScheme()) {
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div>
              <span class="font-semibold text-slate-800 text-sm block sm:inline">{{ currentScheme()?.schemeTitle }}</span>
              <span class="text-slate-500 sm:ml-2 font-mono text-[11px]">Ref: {{ currentScheme()?.refNo }}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                &check; Sanction Issued
              </span>
              <span class="text-slate-500 text-[11px]">Category: {{ currentScheme()?.category || 'General' }}</span>
            </div>
          </div>
        }

        <!-- Allocated Physical Targets Table (Non-Editable Format with Get IPA Action) -->
        <div class="bg-white border border-slate-300 rounded-lg shadow-2xs overflow-hidden">
          <div class="px-4 py-3 bg-[#EAF2F6] border-b border-slate-300 flex items-center justify-between">
            <h3 class="font-bold text-[#174A6E] text-sm tracking-tight">
              Allocated Physical Targets Table (Approved PIAs &amp; Agencies)
            </h3>
            <span class="text-xs text-slate-500 font-medium">ReadOnly Official Sanction Format</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr class="bg-slate-100 text-[#1F2933] border-b border-slate-300 font-semibold">
                  <th class="p-3 text-center border-r border-slate-300 w-16">Sr. No</th>
                  <th class="p-3 border-r border-slate-300 min-w-[130px]">Application ID</th>
                  <th class="p-3 border-r border-slate-300 min-w-[220px]">Name Of the Agency/PIA</th>
                  <th class="p-3 border-r border-slate-300 min-w-[140px]">Sanction District</th>
                  <th class="p-3 border-r border-slate-300 min-w-[180px]">Sanction Sector(s)</th>
                  <th class="p-3 border-r border-slate-300 text-center min-w-[130px]">Application Category</th>
                  <th class="p-3 border-r border-slate-300 text-center w-20">Grade</th>
                  <th class="p-3 border-r border-slate-300 text-center min-w-[120px]">Sanction Target</th>
                  <th class="p-3 text-center min-w-[110px]">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (row of acceptedRows(); track row.appId; let i = $index) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                    <td class="p-3 text-center border-r border-slate-200 font-bold text-slate-700">
                      {{ i + 1 }}
                    </td>
                    <td class="p-3 border-r border-slate-200 font-mono font-medium text-slate-900">
                      {{ row.appId }}
                    </td>
                    <td class="p-3 border-r border-slate-200 font-bold text-slate-900 text-[13px]">
                      {{ row.agencyName }}
                    </td>
                    <td class="p-3 border-r border-slate-200 text-slate-700 font-medium">
                      {{ row.district }}
                    </td>
                    <td class="p-3 border-r border-slate-200 text-slate-700">
                      {{ row.sector }}
                    </td>
                    <td class="p-3 border-r border-slate-200 text-center">
                      <span class="inline-block px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-medium text-[11px]">
                        {{ row.category }}
                      </span>
                    </td>
                    <td class="p-3 border-r border-slate-200 text-center">
                      <span class="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                        {{ row.grade }}
                      </span>
                    </td>
                    <td class="p-3 border-r border-slate-200 text-center font-bold text-slate-900 text-sm">
                      {{ row.target }}
                    </td>
                    <td class="p-3 text-center">
                      @if (generatedIpaAppIds().has(row.appId)) {
                        <button
                          type="button"
                          (click)="openIpaModal(row)"
                          class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>IPA Generated</span>
                        </button>
                      } @else {
                        <button
                          type="button"
                          (click)="openIpaModal(row)"
                          class="px-3 py-1 bg-[#174A6E] hover:bg-[#0E324D] text-white rounded text-xs font-medium transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Get IPA</span>
                        </button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="p-8 text-center text-slate-500 font-normal">
                      No accepted companies / approved tenders found for this scheme.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- FULLY EDITABLE IN-PRINCIPLE APPROVAL (IPA) DOCUMENT EDITOR MODAL -->
    @if (selectedIpaCompany()) {
      <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-sans overflow-y-auto print:p-0 print:static print:bg-white print:z-auto">
        <div class="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-6xl overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
          
          <!-- Modal Top Toolbar Header (Hidden during Print) -->
          <div class="px-5 py-3 bg-[#0B3558] text-white flex items-center justify-between shrink-0 print:hidden font-sans">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <div>
                <h3 class="font-bold text-sm leading-tight">In-Principle Approval (IPA) Document Editor</h3>
                <p class="text-[11px] text-slate-300">All fields, table cells, dates, logos, and clauses are fully editable inline below.</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="generateIpa()"
                class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ isCurrentIpaGenerated() ? 'IPA Generated' : 'Generate IPA' }}</span>
              </button>
              <button
                type="button"
                (click)="printIpaLetter()"
                class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print / Export PDF</span>
              </button>
              <button
                type="button"
                (click)="closeIpaModal()"
                class="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Green Background IPA Generated Notification Banner -->
          @if (showIpaGeneratedNotification()) {
            <div class="px-5 py-3 bg-emerald-600 text-white flex items-center justify-between font-sans text-xs font-semibold shadow-md animate-fade-in shrink-0 print:hidden">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ ipaNotificationMessage() }}</span>
              </div>
              <button
                type="button"
                (click)="showIpaGeneratedNotification.set(false)"
                class="text-emerald-100 hover:text-white p-1 rounded hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }

          <!-- EDITABLE OFFICIAL IPA DOCUMENT SHEET -->
          <div id="ipa-document-sheet" class="p-6 sm:p-10 overflow-y-auto space-y-4 text-slate-900 text-xs font-serif leading-normal bg-white print:p-0 print:overflow-visible">
            
            <!-- Header Block matching uploaded image letterhead -->
            <div class="relative border-b-2 border-slate-900 pb-3 font-sans pt-1">
              
              <!-- Left Logo Container (PNG Uploadable) -->
              <div class="absolute left-0 top-0 flex flex-col items-center justify-center">
                <input
                  #leftIpaFileInput
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  (change)="onLeftIpaLogoUpload($event)"
                  class="hidden"
                />
                <div
                  (click)="leftIpaFileInput.click()"
                  class="relative w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center p-1 text-center overflow-hidden cursor-pointer group bg-white shadow-2xs"
                  title="Click to Upload Left PNG Logo"
                >
                  @if (leftIpaLogoUrl()) {
                    <img [src]="leftIpaLogoUrl()" alt="Left Logo" class="w-full h-full object-contain" />
                  } @else {
                    <input
                      type="text"
                      [(ngModel)]="ipaStampText"
                      class="w-full text-center bg-transparent border-none text-[10px] font-bold text-slate-800 focus:outline-none uppercase rotate-[-12deg]"
                    />
                  }
                  <div class="absolute inset-0 bg-slate-900/65 text-white flex items-center justify-center text-[8px] font-sans font-semibold opacity-0 group-hover:opacity-100 transition-opacity print:hidden text-center px-1 rounded-full">
                    Upload PNG
                  </div>
                </div>
              </div>

              <!-- Right Logo Container (PNG Uploadable) -->
              <div class="absolute right-0 top-0 flex flex-col items-center justify-center">
                <input
                  #rightIpaFileInput
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  (change)="onRightIpaLogoUpload($event)"
                  class="hidden"
                />
                <div
                  (click)="rightIpaFileInput.click()"
                  class="relative w-16 h-16 rounded-full border border-slate-300 flex items-center justify-center p-1 text-center overflow-hidden cursor-pointer group bg-white shadow-2xs"
                  title="Click to Upload Right Logo / Emblem"
                >
                  @if (rightIpaLogoUrl()) {
                    <img [src]="rightIpaLogoUrl()" alt="Right Logo" class="w-full h-full object-contain" />
                  } @else {
                    <div class="text-[9px] font-bold text-slate-700 leading-none">GOVT EMBLEM</div>
                  }
                  <div class="absolute inset-0 bg-slate-900/65 text-white flex items-center justify-center text-[8px] font-sans font-semibold opacity-0 group-hover:opacity-100 transition-opacity print:hidden text-center px-1 rounded-full">
                    Upload PNG
                  </div>
                </div>
              </div>

              <!-- Center Official Corporation Name & Address -->
              <div class="text-center px-20 space-y-0.5">
                <input
                  type="text"
                  [(ngModel)]="ipaCorporationTitle"
                  class="w-full text-center font-bold text-slate-900 text-base border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none uppercase"
                />
                <input
                  type="text"
                  [(ngModel)]="ipaCorporationSubtitle"
                  class="w-full text-center text-slate-700 text-xs border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none"
                />
                <input
                  type="text"
                  [(ngModel)]="ipaCorporationAddress"
                  class="w-full text-center text-slate-600 text-[10.5px] border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <!-- Reference Line & Date Row -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-sans pt-1">
              <div class="flex items-center gap-1 w-full sm:w-auto flex-1">
                <input
                  type="text"
                  [(ngModel)]="ipaFileNo"
                  class="w-full font-mono text-xs text-slate-900 font-semibold border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-900 focus:outline-none py-0.5"
                />
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <!-- Top Right Rounded Stamp Reference Badge matching uploaded image -->
                <div class="border-2 border-slate-800 rounded-full px-3 py-0.5 font-mono text-xs font-bold text-slate-900 bg-slate-50 shadow-2xs">
                  <input
                    type="text"
                    [(ngModel)]="ipaRefBadge"
                    class="w-36 text-center bg-transparent border-none focus:outline-none font-bold"
                  />
                </div>

                <div class="flex items-center gap-1 font-medium text-slate-800">
                  <span>Date:</span>
                  <input
                    type="text"
                    [(ngModel)]="ipaDate"
                    class="w-24 font-mono font-bold text-slate-900 border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-900 focus:outline-none py-0.5 text-xs text-center"
                  />
                </div>
              </div>
            </div>

            <!-- Recipient To Address Block matching image -->
            <div class="space-y-1 font-sans text-xs pt-1">
              <p class="font-bold text-slate-900">To,</p>
              <div class="pl-4 space-y-1">
                <input
                  type="text"
                  [(ngModel)]="ipaRecipientName"
                  class="w-full font-bold text-slate-900 text-sm border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-900 focus:outline-none py-0.5"
                />
                <input
                  type="text"
                  [(ngModel)]="ipaRecipientLine1"
                  class="w-full text-slate-700 border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none py-0.5"
                />
                <input
                  type="text"
                  [(ngModel)]="ipaRecipientLine2"
                  class="w-full text-slate-700 border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none py-0.5"
                />
              </div>
            </div>

            <!-- Reference & Subject Lines matching image -->
            <div class="space-y-1.5 font-sans pt-1">
              <div class="flex items-center gap-1">
                <span class="font-bold text-slate-900 shrink-0">Ref: -</span>
                <input
                  type="text"
                  [(ngModel)]="ipaRefLine"
                  class="w-full font-sans text-xs text-slate-800 border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-900 focus:outline-none py-0.5"
                />
              </div>

              <div class="flex items-start gap-1">
                <span class="font-bold text-slate-900 shrink-0">Sub:</span>
                <input
                  type="text"
                  [(ngModel)]="ipaSubjectText"
                  class="w-full font-bold text-slate-900 text-xs border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-900 focus:outline-none py-0.5"
                />
              </div>
            </div>

            <!-- Preamble Paragraph matching image -->
            <div class="font-serif pt-1 text-justify">
              <textarea
                [(ngModel)]="ipaPreambleText"
                rows="2"
                class="w-full font-serif text-[12px] leading-relaxed text-slate-900 bg-transparent border border-dashed border-slate-300 hover:border-slate-400 focus:border-slate-900 focus:outline-none p-1.5 rounded"
              ></textarea>
            </div>

            <!-- TABLE 1: Detailed Course & Target Allocation Table matching uploaded image -->
            <div class="border border-slate-800 font-sans text-[10.5px]">
              
              <!-- Table Subheader Box matching image header: Name of PIA / SDC Address -->
              <div class="bg-slate-100 border-b border-slate-800 p-2 space-y-1 font-semibold text-slate-900">
                <div class="flex items-center gap-1">
                  <span class="font-bold">Name of PIA -</span>
                  <input
                    type="text"
                    [(ngModel)]="ipaPiaName"
                    class="w-full font-bold bg-transparent border-b border-dashed border-slate-400 focus:border-slate-900 focus:outline-none px-1"
                  />
                </div>
                <div class="flex items-center gap-1">
                  <span class="font-bold shrink-0">SDC Address -</span>
                  <input
                    type="text"
                    [(ngModel)]="ipaSdcAddress"
                    class="w-full font-medium bg-transparent border-b border-dashed border-slate-400 focus:border-slate-900 focus:outline-none px-1"
                  />
                </div>
              </div>

              <!-- Table 1 Grid Cells -->
              <div class="overflow-x-auto">
                <table class="w-full border-collapse text-center">
                  <thead>
                    <tr class="bg-slate-200/90 text-slate-900 border-b border-slate-800 font-bold text-[10px]">
                      <th class="border-r border-slate-800 p-1 w-7">S. No.</th>
                      <th class="border-r border-slate-800 p-1 min-w-[90px]">Sector</th>
                      <th class="border-r border-slate-800 p-1 min-w-[70px]">Course Name</th>
                      <th class="border-r border-slate-800 p-1 min-w-[70px]">Course Code</th>
                      <th class="border-r border-slate-800 p-1 min-w-[75px]" colspan="2">
                        Duration
                        <div class="grid grid-cols-2 border-t border-slate-800 mt-1 font-normal text-[9px]">
                          <span class="border-r border-slate-800">Days</span>
                          <span>Hrs</span>
                        </div>
                      </th>
                      <th class="border-r border-slate-800 p-1 min-w-[90px]">Mandatory Provision of OJT in Job Role (Yes/No)</th>
                      <th class="border-r border-slate-800 p-1 min-w-[80px]">Minimum Edu. Qualification of trainee</th>
                      <th class="border-r border-slate-800 p-1 min-w-[80px]">Minimum Job Entry Age of Trainee</th>
                      <th class="border-r border-slate-800 p-1 w-10">R/NR</th>
                      <th class="border-r border-slate-800 p-1 w-10">R. Cat.</th>
                      <th class="border-r border-slate-800 p-1 min-w-[90px]">Cost Per Trainee</th>
                      <th class="border-r border-slate-800 p-1 min-w-[65px]">Approved Trainees/ batch</th>
                      <th class="border-r border-slate-800 p-1 min-w-[70px]">Cost Per Batch</th>
                      <th class="border-r border-slate-800 p-1 min-w-[65px]">Possible Cycles for FY 26-27</th>
                      <th class="border-r border-slate-800 p-1 min-w-[70px]">Total Budget</th>
                      <th class="p-1 min-w-[60px]">Per Day Training Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of ipaCourseRows; track $index; let idx = $index) {
                      <tr class="border-b border-slate-800 text-[10px]">
                        <td class="border-r border-slate-800 p-1 font-bold">{{ idx + 1 }}</td>
                        
                        <td class="border-r border-slate-800 p-1">
                          <input type="text" [(ngModel)]="row.sector" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>
                        
                        <td class="border-r border-slate-800 p-1 font-medium">
                          <input type="text" [(ngModel)]="row.courseName" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>
                        
                        <td class="border-r border-slate-800 p-1 font-mono">
                          <input type="text" [(ngModel)]="row.courseCode" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>
                        
                        <td class="border-r border-slate-800 p-0.5">
                          <input type="number" [(ngModel)]="row.durationDays" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>
                        <td class="border-r border-slate-800 p-0.5">
                          <input type="number" [(ngModel)]="row.durationHrs" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>

                        <td class="border-r border-slate-800 p-1">
                          <input type="text" [(ngModel)]="row.ojtProvision" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>

                        <td class="border-r border-slate-800 p-1">
                          <input type="text" [(ngModel)]="row.minEduQualification" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>

                        <td class="border-r border-slate-800 p-1">
                          <input type="text" [(ngModel)]="row.minAge" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>

                        <td class="border-r border-slate-800 p-1">
                          <input type="text" [(ngModel)]="row.rNr" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>

                        <td class="border-r border-slate-800 p-1">
                          <input type="text" [(ngModel)]="row.rCat" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>

                        <!-- Cost breakdown subtable cell matching image -->
                        <td class="border-r border-slate-800 p-0 text-[9.5px]">
                          <div class="grid grid-cols-2 border-b border-slate-400 p-0.5">
                            <span class="font-bold border-r border-slate-400">C</span>
                            <input type="number" [(ngModel)]="row.costC" (ngModelChange)="calculateTotals()" class="w-full text-center bg-transparent border-none focus:outline-none" />
                          </div>
                          <div class="grid grid-cols-2 border-b border-slate-400 p-0.5">
                            <span class="font-bold border-r border-slate-400">H</span>
                            <input type="number" [(ngModel)]="row.costH" (ngModelChange)="calculateTotals()" class="w-full text-center bg-transparent border-none focus:outline-none" />
                          </div>
                          <div class="grid grid-cols-2 border-b border-slate-400 p-0.5">
                            <span class="font-bold border-r border-slate-400 text-[8.5px]">Toolkit</span>
                            <input type="text" [(ngModel)]="row.costToolkit" class="w-full text-center bg-transparent border-none focus:outline-none" />
                          </div>
                          <div class="grid grid-cols-2 p-0.5 font-bold bg-slate-100">
                            <span class="border-r border-slate-400">Total</span>
                            <span>{{ row.costC + row.costH }}</span>
                          </div>
                        </td>

                        <td class="border-r border-slate-800 p-1 font-bold">
                          <input type="number" [(ngModel)]="row.approvedTraineesPerBatch" (ngModelChange)="calculateTotals()" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>

                        <td class="border-r border-slate-800 p-1 font-bold">
                          <input type="number" [(ngModel)]="row.costPerBatch" (ngModelChange)="calculateTotals()" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>

                        <td class="border-r border-slate-800 p-1 font-bold">
                          <input type="number" [(ngModel)]="row.possibleCycles" (ngModelChange)="calculateTotals()" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>

                        <td class="border-r border-slate-800 p-1 font-bold">
                          <input type="number" [(ngModel)]="row.totalBudget" (ngModelChange)="calculateTotals()" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>

                        <td class="p-1 font-bold">
                          <input type="number" [(ngModel)]="row.perDayTrainingHours" class="w-full text-center bg-transparent border-none focus:outline-none" />
                        </td>
                      </tr>
                    }
                  </tbody>
                  <!-- Total Summary Footer Row matching image -->
                  <tfoot>
                    <tr class="bg-slate-100 font-bold border-t-2 border-slate-800 text-[10.5px]">
                      <td colspan="12" class="border-r border-slate-800 p-1.5 text-right uppercase">Total</td>
                      <td class="border-r border-slate-800 p-1.5 text-center">{{ totalApprovedTrainees }}</td>
                      <td class="border-r border-slate-800 p-1.5 text-center">{{ totalCostPerBatch }}</td>
                      <td class="border-r border-slate-800 p-1.5 text-center">{{ totalCycles }}</td>
                      <td class="border-r border-slate-800 p-1.5 text-center">{{ totalOverallBudget }}</td>
                      <td class="p-1.5"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div class="p-1.5 bg-slate-50 border-t border-slate-800 flex items-center justify-between print:hidden">
                <button
                  type="button"
                  (click)="addCourseRow()"
                  class="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[10.5px] font-sans cursor-pointer flex items-center gap-1 font-medium"
                >
                  <span>+ Add Course Row</span>
                </button>
              </div>
            </div>

            <!-- TABLE 2: Summary / Particulars Table matching uploaded image -->
            <div class="border border-slate-800 font-sans text-xs">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-slate-100 text-slate-900 border-b border-slate-800 font-bold">
                    <th class="border-r border-slate-800 p-1.5 text-center w-16">S.No.</th>
                    <th class="border-r border-slate-800 p-1.5 text-left">Particular</th>
                    <th class="p-1.5 text-center min-w-[140px]">Value</th>
                  </tr>
                </thead>
                <tbody>
                  @for (part of ipaParticularRows; track part.sNo) {
                    <tr class="border-b border-slate-800">
                      <td class="border-r border-slate-800 p-1.5 text-center font-bold">{{ part.sNo }}</td>
                      <td class="border-r border-slate-800 p-1.5">
                        <input
                          type="text"
                          [(ngModel)]="part.particular"
                          class="w-full font-medium bg-transparent border-none focus:outline-none"
                        />
                      </td>
                      <td class="p-1.5 text-center">
                        <input
                          type="text"
                          [(ngModel)]="part.value"
                          class="w-full font-bold text-center bg-transparent border-none focus:outline-none"
                        />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Terms & Conditions Section matching uploaded image -->
            <div class="space-y-1.5 font-sans text-xs pt-1">
              <p class="font-bold text-slate-900">IPA is issued subject to following terms and conditions: -</p>
              
              <div class="space-y-1 pl-1">
                @for (term of ipaTermsList; track $index; let idx = $index) {
                  <div class="flex items-start gap-1.5 group">
                    <span class="font-bold shrink-0 text-slate-900 font-mono">{{ getLetterLabel(idx) }})</span>
                    <input
                      type="text"
                      [(ngModel)]="ipaTermsList[idx]"
                      class="w-full text-slate-800 text-[11.5px] border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none py-0.5"
                    />
                  </div>
                }
              </div>

              <div class="pt-1 print:hidden">
                <button
                  type="button"
                  (click)="addTermPoint()"
                  class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] cursor-pointer"
                >
                  + Add Term &amp; Condition Point
                </button>
              </div>
            </div>

            <!-- Signatory Block & CC Distribution Section -->
            <div class="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-end justify-between gap-4 font-sans text-xs">
              
              <!-- CC List Left side matching image -->
              <div class="space-y-1 flex-1">
                <p class="font-bold text-slate-900">CC:</p>
                <div class="pl-2 space-y-0.5">
                  @for (ccItem of ipaCcList; track $index; let idx = $index) {
                    <div class="flex items-center gap-1">
                      <span class="font-mono text-slate-700 font-semibold">{{ idx + 1 }}-</span>
                      <input
                        type="text"
                        [(ngModel)]="ipaCcList[idx]"
                        class="w-full text-slate-800 text-xs border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none py-0.5"
                      />
                    </div>
                  }
                </div>
              </div>

              <!-- Signatory Block matching image right alignment -->
              <div class="text-right space-y-0.5 shrink-0 min-w-[200px]">
                <div class="h-10"></div> <!-- Signature gap -->
                <input
                  type="text"
                  [(ngModel)]="ipaSignatoryTitle"
                  class="text-right font-bold text-slate-900 border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-900 focus:outline-none block w-48 ml-auto"
                />
                <input
                  type="text"
                  [(ngModel)]="ipaSignatoryDept"
                  class="text-right font-semibold text-slate-800 border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-900 focus:outline-none block w-48 ml-auto"
                />
              </div>

            </div>

          </div>

          <!-- Modal Action Footer (Hidden during Print) -->
          <div class="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between font-sans shrink-0 print:hidden">
            <span class="text-xs text-slate-600 font-medium">IPA Document Mode: Live Inline Editable</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="generateIpa()"
                class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ isCurrentIpaGenerated() ? 'IPA Generated' : 'Generate IPA' }}</span>
              </button>
              <button
                type="button"
                (click)="printIpaLetter()"
                class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print / Export PDF</span>
              </button>
              <button
                type="button"
                (click)="closeIpaModal()"
                class="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    @media print {
      /* 1. Reset all layout wrappers to normal document flow */
      html, body, app-root, main, app-sanction-order {
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
        position: static !important;
        display: block !important;
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* 2. Un-fix the modal overlay container during print */
      .fixed.inset-0 {
        position: static !important;
        inset: auto !important;
        z-index: auto !important;
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        display: block !important;
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
        width: 100% !important;
      }

      /* 3. Un-constrain the modal card box */
      .fixed.inset-0 > div {
        position: static !important;
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
      }

      /* 4. IPA Document sheet container formatting */
      #ipa-document-sheet {
        position: static !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
        display: block !important;
        background: #ffffff !important;
        box-shadow: none !important;
        border: none !important;
      }

      /* 5. Hide buttons, action bars, and elements marked print:hidden */
      .print\:hidden,
      button,
      input[type="file"] {
        display: none !important;
      }

      /* 6. Strip inputs and textareas of dashed lines, outlines, and backgrounds */
      #ipa-document-sheet input,
      #ipa-document-sheet textarea,
      #ipa-document-sheet select {
        border: none !important;
        border-bottom: none !important;
        background: transparent !important;
        outline: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        appearance: none !important;
        -webkit-appearance: none !important;
        font-family: inherit !important;
        color: #000000 !important;
        resize: none !important;
      }

      /* 7. Clean Table Print Layout */
      #ipa-document-sheet table {
        border-collapse: collapse !important;
        width: 100% !important;
      }

      #ipa-document-sheet th,
      #ipa-document-sheet td {
        border-color: #000000 !important;
        color: #000000 !important;
      }

      @page {
        size: A4 portrait;
        margin: 10mm 12mm;
      }
    }
  `]
})
export class SanctionOrderComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);

  acceptedRows = signal<AcceptedCompanyRow[]>([]);
  currentScheme = signal<Scheme | undefined>(undefined);
  selectedIpaCompany = signal<AcceptedCompanyRow | null>(null);

  // Notification Banner Signals
  showIpaGeneratedNotification = signal<boolean>(false);
  ipaNotificationMessage = signal<string>('');

  // Generated IPA Tracking Signal
  generatedIpaAppIds = signal<Set<string>>(new Set<string>());

  readonly isCurrentIpaGenerated = () => {
    const comp = this.selectedIpaCompany();
    return comp ? this.generatedIpaAppIds().has(comp.appId) : false;
  };

  // Uploaded Logo Signals
  leftIpaLogoUrl = signal<string | null>(null);
  rightIpaLogoUrl = signal<string | null>(null);

  // Editable Header Fields matching uploaded image letterhead
  ipaStampText = 'MOU + SDC';
  ipaCorporationTitle = 'Rajasthan Skill and Livelihoods Development Corporation';
  ipaCorporationSubtitle = '(A Government of Rajasthan Enterprise)';
  ipaCorporationAddress = 'EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur- 302004 (Rajasthan)';

  ipaFileNo = 'F () RSLDC/Skills/MMKVY-Cat.II: SAKSHM/2026-27/ 2895-97';
  ipaDate = '15/9/26';
  ipaRefBadge = 'SAK-2200-099-001';

  ipaRecipientName = 'M/s. Company 1';
  ipaRecipientLine1 = 'D-5, Sub Mandi Yard, Sri Ganganagar,';
  ipaRecipientLine2 = 'Sri Ganganagar, Rajasthan, Pin Code-335001';

  ipaRefLine = 'F () RSLDC/SKILL/MMKVY-Cat. -II: SAKSHM/2026-27/535, Dated: 15/07/2026';
  ipaSubjectText = 'In-Principal Approval (IPA-1)- MMKVY-Cat. II/SAKSHM sponsored by RSLDC for F.Y. 2026-27.';

  ipaPreambleText = 'In reference to your request and based on the recommendation from inspection team, in-principal approval is hereby accorded for conducting cycles (as detailed below) for following courses during financial year 2026-27, as per the terms and conditions stipulated in relevant guidelines.';

  ipaPiaName = 'M/s. Company 1';
  ipaSdcAddress = 'Near Panchayati Mandir, Opposite Government Hospital, Kesrisinghpur, Sriganganagar, 335027';

  // Table 1: Course & Allocation Rows matching uploaded image exact data structure
  ipaCourseRows: IpaCourseRow[] = [
    {
      sNo: 1,
      sector: 'Handicraft & Local Resource Based Skills',
      courseName: 'Phad Painting',
      courseCode: 'RSLDC/HRS-001',
      durationDays: 139,
      durationHrs: 1110,
      ojtProvision: 'No',
      minEduQualification: 'Minimum 8th Pass',
      minAge: 'Minimum 15 Year',
      rNr: 'R',
      rCat: 'Z',
      costC: 25530,
      costH: 31600,
      costToolkit: 'NA',
      costTotal: 57130,
      approvedTraineesPerBatch: 30,
      costPerBatch: 1713900,
      possibleCycles: 1,
      totalBudget: 1713900,
      perDayTrainingHours: 8
    },
    {
      sNo: 2,
      sector: 'Handicraft & Local Resource Based Skills',
      courseName: 'Phad Painting',
      courseCode: 'RSLDC/HRS-001',
      durationDays: 185,
      durationHrs: 1110,
      ojtProvision: 'No',
      minEduQualification: 'Minimum 8th Pass',
      minAge: 'Minimum 15 Year',
      rNr: 'NR',
      rCat: 'NA',
      costC: 25530,
      costH: 0,
      costToolkit: 'NA',
      costTotal: 25530,
      approvedTraineesPerBatch: 30,
      costPerBatch: 765900,
      possibleCycles: 1,
      totalBudget: 765900,
      perDayTrainingHours: 6
    },
    {
      sNo: 3,
      sector: 'Handicraft & Local Resource Based Skills',
      courseName: 'Phad Painting',
      courseCode: 'RSLDC/HRS-001',
      durationDays: 185,
      durationHrs: 1110,
      ojtProvision: 'No',
      minEduQualification: 'Minimum 8th Pass',
      minAge: 'Minimum 15 Year',
      rNr: 'NR',
      rCat: 'NA',
      costC: 25530,
      costH: 0,
      costToolkit: 'NA',
      costTotal: 25530,
      approvedTraineesPerBatch: 30,
      costPerBatch: 765900,
      possibleCycles: 1,
      totalBudget: 765900,
      perDayTrainingHours: 6
    }
  ];

  // Table 2: Summary Particulars matching image
  ipaParticularRows: IpaParticularRow[] = [
    { sNo: 1, particular: "Total Training Target/District/SDC's as per SO", value: '90/01/01' },
    { sNo: 2, particular: 'Target allocation in previous IPA', value: 'First IPA' },
    { sNo: 3, particular: 'Target Allocation in this First IPA', value: '90' },
    { sNo: 4, particular: 'Remaining Targets', value: '00' }
  ];

  // Terms and Conditions Points matching uploaded image (a - h)
  ipaTermsList: string[] = [
    'TP shall ensure to initiation of batches within 15 days from the date issuance the IPA.',
    'TP shall ensure to work in accordance with the (MMKVY-Cat-II-SAKSHM) guideline issued on 1st April 2021 and further direction given by RSLDC.',
    'TP shall ensure to functional IP cameras at SDC before the commencement of batches.',
    'TP shall Submit Performance Security Deposit (PSD) to RSLDC A/C on or before batch Commencement (In case of new SDC).',
    'TP will have to maintain video footage of complete skill training in Lab/classroom from IP Camera for each batch until the payment for the batch is settled.',
    'TP shall ensure to Installation of Aadhar linked Biometric for daily attendance of trainees & trainers (In & Out) at the SDC & Hostel (if applicable), which must be compatible with ISMS system of RSLDC.',
    'PIA must ensure compliance of the condition mentioned in the MoU, Sanction Order, Scheme Guideline and other applicable directives.',
    'The IEC & branding should be available as per the scheme guidelines.'
  ];

  ipaSignatoryTitle = 'Scheme OIC';
  ipaSignatoryDept = 'SAKSHM, RSLDC';

  // CC List matching image
  ipaCcList: string[] = [
    'CAO, RSLDC',
    'District Skill Coordinator (RSLDC) (By Mail)',
    'Office Copy'
  ];

  // Calculated Totals for Table 1
  totalApprovedTrainees = 90;
  totalCostPerBatch = 3245700;
  totalCycles = 3;
  totalOverallBudget = 3245700;

  readonly availableDistricts: string[] = [
    'Jodhpur', 'Alwar', 'Jaipur', 'Kota', 'Udaipur', 'Sikar', 'Ajmer', 'Bhilwara', 'Sri Ganganagar'
  ];

  readonly availableSectors: string[] = [
    'Textile & Handloom', 'Apparel, Agriculture', 'Healthcare & Paramedical', 'Handicraft & Local Resource Based Skills'
  ];

  ngOnInit(): void {
    this.calculateTotals();
    this.route.params.subscribe(params => {
      const sId = params['schemeId'] || 'MMKVY-01';
      this.loadSchemeAndAcceptedCompanies(sId);
    });
  }

  private loadSchemeAndAcceptedCompanies(schemeId: string): void {
    this.eoiStateService.getSchemeById(schemeId).subscribe(scheme => {
      this.currentScheme.set(scheme);
    });

    this.eoiStateService.getResponses(schemeId).subscribe(responses => {
      const approved = responses.filter(r => r.status === 'APPROVED');
      
      const rows: AcceptedCompanyRow[] = approved.map((resp, idx) => ({
        srNo: idx + 1,
        appId: resp.id,
        agencyName: resp.actualLegalName || resp.anonymousLabel,
        district: resp.trainingCentres?.[0]?.district || this.availableDistricts[idx % this.availableDistricts.length],
        sector: resp.placementTrackRecord?.[0]?.sector || this.availableSectors[idx % this.availableSectors.length],
        category: 'A-1 (Skill)',
        grade: resp.scrutinyDetails?.grade === 'Grade A' ? 'A' : (resp.scrutinyDetails?.grade === 'Grade B' ? 'B' : 'A'),
        target: 150
      }));

      if (rows.length === 0) {
        this.acceptedRows.set([
          {
            srNo: 1,
            appId: 'APP-004661',
            agencyName: 'Company 1',
            district: 'Sri Ganganagar',
            sector: 'Handicraft & Local Resource Based Skills',
            category: 'A-1 (Skill)',
            grade: 'A',
            target: 90
          },
          {
            srNo: 2,
            appId: 'APP-004662',
            agencyName: 'Company 2',
            district: 'Jodhpur',
            sector: 'Textile & Handloom',
            category: 'A-1 (Skill)',
            grade: 'A',
            target: 150
          },
          {
            srNo: 3,
            appId: 'APP-004664',
            agencyName: 'Company 4',
            district: 'Alwar',
            sector: 'Healthcare & Paramedical',
            category: 'A-1 (Skill)',
            grade: 'A',
            target: 150
          }
        ]);
      } else {
        this.acceptedRows.set(rows);
      }
    });
  }

  onLeftIpaLogoUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.leftIpaLogoUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onRightIpaLogoUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.rightIpaLogoUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  calculateTotals(): void {
    let trainees = 0;
    let costPerBatchSum = 0;
    let cyclesSum = 0;
    let budgetSum = 0;

    this.ipaCourseRows.forEach(r => {
      trainees += Number(r.approvedTraineesPerBatch) || 0;
      costPerBatchSum += Number(r.costPerBatch) || 0;
      cyclesSum += Number(r.possibleCycles) || 0;
      budgetSum += Number(r.totalBudget) || 0;
    });

    this.totalApprovedTrainees = trainees;
    this.totalCostPerBatch = costPerBatchSum;
    this.totalCycles = cyclesSum;
    this.totalOverallBudget = budgetSum;
  }

  openIpaModal(row: AcceptedCompanyRow): void {
    this.selectedIpaCompany.set(row);
    // Populate dummy values customized for selected company
    this.ipaRecipientName = `M/s. ${row.agencyName}`;
    this.ipaPiaName = `M/s. ${row.agencyName}`;
    this.ipaFileNo = `F () RSLDC/Skills/MMKVY-Cat.II: SAKSHM/2026-27/${row.appId.replace('APP-', '')}`;
    this.ipaRefBadge = `SAK-2200-099-${row.appId.slice(-3)}`;
  }

  closeIpaModal(): void {
    this.selectedIpaCompany.set(null);
  }

  addCourseRow(): void {
    this.ipaCourseRows.push({
      sNo: this.ipaCourseRows.length + 1,
      sector: 'Handicraft & Local Resource Based Skills',
      courseName: 'Phad Painting',
      courseCode: 'RSLDC/HRS-001',
      durationDays: 185,
      durationHrs: 1110,
      ojtProvision: 'No',
      minEduQualification: 'Minimum 8th Pass',
      minAge: 'Minimum 15 Year',
      rNr: 'NR',
      rCat: 'NA',
      costC: 25530,
      costH: 0,
      costToolkit: 'NA',
      costTotal: 25530,
      approvedTraineesPerBatch: 30,
      costPerBatch: 765900,
      possibleCycles: 1,
      totalBudget: 765900,
      perDayTrainingHours: 6
    });
    this.calculateTotals();
  }

  addTermPoint(): void {
    this.ipaTermsList.push('PIA shall adhere to all newly issued guidelines and circulars of RSLDC from time to time.');
  }

  getLetterLabel(index: number): string {
    return String.fromCharCode(97 + (index % 26)); // 'a', 'b', 'c', ...
  }

  generateIpa(): void {
    const company = this.selectedIpaCompany();
    if (company) {
      // Record this company/appId as IPA Generated
      this.generatedIpaAppIds.update(set => {
        const next = new Set(set);
        next.add(company.appId);
        return next;
      });

      const companyName = company.agencyName;
      const refNo = this.ipaRefBadge || 'SAK-2200-099-001';

      this.ipaNotificationMessage.set(`In-Principle Approval (IPA) document generated successfully for ${companyName} [Ref: ${refNo}]!`);
      this.showIpaGeneratedNotification.set(true);

      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        this.showIpaGeneratedNotification.set(false);
      }, 5000);
    }
  }

  printIpaLetter(): void {
    const sourceSheet = document.getElementById('ipa-document-sheet');
    if (!sourceSheet) {
      window.print();
      return;
    }

    // Remove any existing print container
    const existing = document.getElementById('ipa-print-section');
    if (existing) {
      existing.remove();
    }

    // Create top-level print wrapper attached directly under document.body
    const printSection = document.createElement('div');
    printSection.id = 'ipa-print-section';

    // Clone source sheet element
    const clone = sourceSheet.cloneNode(true) as HTMLElement;

    // Sync input values from source to clone
    const sourceInputs = sourceSheet.querySelectorAll('input, textarea, select');
    const cloneInputs = clone.querySelectorAll('input, textarea, select');

    sourceInputs.forEach((input, index) => {
      const srcEl = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const targetEl = cloneInputs[index] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (targetEl) {
        targetEl.value = srcEl.value;
        if (srcEl instanceof HTMLInputElement && (srcEl.type === 'checkbox' || srcEl.type === 'radio')) {
          (targetEl as HTMLInputElement).checked = srcEl.checked;
        }
        if (srcEl instanceof HTMLTextAreaElement) {
          targetEl.textContent = srcEl.value;
        }
      }
    });

    printSection.appendChild(clone);
    document.body.appendChild(printSection);
    document.body.classList.add('has-print-section');

    // Small delay to ensure browser DOM attachment prior to opening print preview dialog
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        printSection.remove();
        document.body.classList.remove('has-print-section');
      }, 500);
    }, 100);
  }
}
