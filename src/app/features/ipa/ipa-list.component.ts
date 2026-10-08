import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MOCK_SANCTION_ORDERS, SanctionOrder } from '../sdc/models/sdc.model';
import { EoiStateService, IpaDocumentData, IpaCourseRow } from '../eoi/services/eoi-state.service';
import { environment } from '../../../environments/environment';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../shared';

@Component({
  selector: 'app-ipa-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="IPA"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'IPA' }]"
        >
          <!-- Search input -->
          <div class="relative w-full sm:w-80">
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search IPA, Scheme, District..."
              class="w-full pl-9 pr-7 py-1.5 text-[13px] bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#174A6E] focus:border-[#174A6E] transition-colors font-normal shadow-2xs"
            />
            @if (searchQuery) {
              <button
                type="button"
                (click)="searchQuery = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                ✕
              </button>
            }
          </div>
        </app-page-header>

        <!-- IPA Details Table via Reusable TableComponent -->
        <app-table
          [columns]="ipaColumns"
          [data]="filteredIpaList"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="IPA records"
          emptyMessage="No IPA records match your search query."
          [customTemplates]="{
            ipaNumber: ipaNumberTemplate,
            schemeName: schemeNameTemplate,
            sectors: sectorsTemplate,
            grade: gradeTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: IPA Number (Clickable plain blue text to view IPA form) -->
        <ng-template #ipaNumberTemplate let-ipa>
          <button
            type="button"
            (click)="viewIpaForm(ipa)"
            class="font-mono text-xs font-bold text-[#174A6E] hover:text-[#0B3558] hover:underline cursor-pointer bg-transparent border-0 p-0 transition-colors"
            title="Click to view In-Principle Approval (IPA) document"
          >
            {{ ipa.ipaNumber }}
          </button>
        </ng-template>

        <!-- Template: Scheme Name -->
        <ng-template #schemeNameTemplate let-ipa>
          <div class="flex flex-col items-start gap-0.5">
            <span
              (click)="viewIpaForm(ipa)"
              class="font-bold text-slate-900 hover:text-[#174A6E] hover:underline cursor-pointer transition-colors"
            >
              {{ ipa.schemeName || ipa.scheme }}
            </span>
            <span class="text-[11px] text-slate-500 font-normal">
              Category: {{ ipa.category }}
            </span>
          </div>
        </ng-template>

        <!-- Template: Sectors -->
        <ng-template #sectorsTemplate let-ipa>
          <div class="text-xs text-slate-700 font-medium">
            {{ (ipa.sectors || ['Skill Training']).join(', ') }}
          </div>
        </ng-template>

        <!-- Template: Grade -->
        <ng-template #gradeTemplate let-ipa>
          <span class="font-bold text-xs text-emerald-700">
            {{ ipa.grade || 'A' }}
          </span>
        </ng-template>

        <!-- Template: Actions (View IPA Form) -->
        <ng-template #actionsTemplate let-ipa>
          <button
            type="button"
            (click)="viewIpaForm(ipa)"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="View Official IPA Form"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </button>
        </ng-template>

      </div>

      <!-- ====================================================================
           OFFICIAL IN-PRINCIPLE APPROVAL (IPA) FORM DOCUMENT MODAL (PDF 2 FORMAT, NON-EDITABLE)
           ==================================================================== -->
      @if (selectedIpa(); as ipa) {
        @if (activeIpaDoc(); as doc) {
          <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-sans overflow-y-auto print:p-0 print:static print:bg-white print:z-auto">
            <div class="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-6xl overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
              
              <!-- Modal Top Toolbar Header (Hidden during Print) -->
              <div class="px-5 py-3 bg-[#0B3558] text-white flex items-center justify-between shrink-0 print:hidden font-sans">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <h3 class="font-bold text-sm leading-tight">In-Principle Approval (IPA) Form</h3>
                    <p class="text-[11px] text-slate-300">Official Sanction Letter &amp; Target Allocation Document</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="printIpaDocument()"
                    class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print / Download PDF</span>
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

              <!-- OFFICIAL IPA DOCUMENT CONTENT (Matches PDF 2 Exactly, Read-Only) -->
              <div id="ipa-document-sheet" class="p-6 sm:p-10 overflow-y-auto space-y-4 text-[#111827] font-serif leading-relaxed text-xs sm:text-sm bg-white print:p-0 print:overflow-visible">
                
                <!-- Letterhead Header with Logos -->
                <div class="border-b-2 border-slate-800 pb-3 mb-4 text-center font-sans">
                  <div class="flex items-center justify-between gap-4 mb-2">
                    <!-- Left Emblem Logo -->
                    <div class="w-20 h-20 shrink-0 flex items-center justify-center p-1 bg-transparent">
                      <img [src]="doc.leftLogoUrl || defaultEmblemSvg" alt="Emblem Logo" class="max-w-full max-h-full object-contain" />
                    </div>

                    <!-- Header Titles -->
                    <div class="flex-1 space-y-1">
                      <div class="font-bold text-slate-900 text-base sm:text-lg uppercase">
                        {{ doc.headerTitle }}
                      </div>
                      <div class="font-medium text-slate-700 text-xs">
                        {{ doc.headerSubtitle }}
                      </div>
                      <div class="text-[11px] text-slate-600">
                        {{ doc.headerAddress }}
                      </div>
                    </div>

                    <!-- Right Organization Logo -->
                    <div class="w-20 h-20 shrink-0 flex items-center justify-center p-1 bg-transparent">
                      @if (doc.rightLogoUrl) {
                        <img [src]="doc.rightLogoUrl" alt="Right Logo" class="max-w-full max-h-full object-contain" />
                      } @else {
                        <div class="text-center font-bold text-[#0B3558] leading-tight text-[11px] font-sans px-1">
                          RSLDC<br>JAIPUR
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- File No & Date Row -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-sans text-xs font-semibold mb-3 border-b border-slate-200 pb-2">
                  <div class="flex items-center gap-1.5">
                    <span class="text-slate-600">File No:</span>
                    <span class="font-mono text-slate-900">{{ doc.fileNo }}</span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <span class="text-slate-600">Date:</span>
                    <span class="font-mono text-slate-900">{{ doc.ipaDate }}</span>
                  </div>
                </div>

                <!-- Recipient Details Block (To, PIA Name, Address, SAR) -->
                <div class="space-y-0.5 mb-3 font-sans text-xs">
                  <p class="font-bold text-slate-900 m-0">To,</p>
                  <div class="pl-2 space-y-0.5">
                    <p class="font-bold text-slate-900 m-0">{{ doc.recipientName }}</p>
                    <p class="text-slate-700 m-0">{{ doc.recipientAddress1 }}</p>
                    <p class="text-slate-700 m-0">{{ doc.recipientAddress2 }}</p>
                    <p class="font-mono text-slate-800 text-[11px] font-semibold m-0 mt-0.5">{{ doc.sarNumber }}</p>
                  </div>
                </div>

                <!-- Reference & Subject Section -->
                <div class="space-y-1.5 mb-3 font-sans text-xs bg-slate-50/70 p-2.5 border border-slate-200 rounded">
                  <div class="flex items-start gap-2">
                    <span class="font-bold text-slate-900 shrink-0">Ref:</span>
                    <p class="text-slate-700 m-0 leading-relaxed">{{ doc.referenceNo }}</p>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="font-bold text-slate-900 shrink-0">Sub:</span>
                    <p class="font-bold text-slate-900 m-0 leading-relaxed">{{ doc.subjectText }}</p>
                  </div>
                </div>

                <!-- Preamble Paragraph -->
                <div class="mb-3 text-justify font-serif text-xs sm:text-sm leading-relaxed text-slate-800">
                  <p class="m-0">{{ doc.preambleText }}</p>
                </div>

                <!-- Name of PIA & SDC Address Block -->
                <div class="mb-4 font-sans text-xs bg-slate-50 p-2.5 border border-slate-300 rounded space-y-1">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span class="font-bold text-slate-900 shrink-0 w-32">Name of PIA -</span>
                    <span class="font-bold text-slate-900">{{ doc.piaName }}</span>
                  </div>
                  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span class="font-bold text-slate-900 shrink-0 w-32">SDC Address -</span>
                    <span class="text-slate-800">{{ doc.sdcAddress }}</span>
                  </div>
                </div>

                <!-- MAIN COURSE APPROVAL TABLE (Matching PDF 2 Exactly) -->
                <div class="my-5">
                  <h4 class="font-bold text-slate-900 text-xs uppercase tracking-tight mb-1.5 font-sans">
                    APPROVED COURSE &amp; CYCLES DETAILS:
                  </h4>

                  <div class="w-full overflow-hidden">
                    <table class="w-full table-fixed text-center border-collapse font-sans text-[8.5px] border border-slate-900 leading-tight">
                      <thead>
                        <tr class="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold">
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[2.5%]">S. No.</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[12%]">Sector</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[9%]">Course Name</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[8%]">Course Code</th>
                          <th colspan="2" class="p-0.5 border-r border-b border-slate-900">Duration</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6%]">Mandatory Provision of OJT in Job Role (Yes/No)</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[7%]">Minimum Edu. Qualification of trainee</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6%]">Minimum Job Entry Age of Trainee</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[3%]">R/NR</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[3%]">R. Cat.</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[9.5%]">Cost Per Trainee</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[5.5%]">Approved Trainees/ batch</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6.5%]">Cost Per Batch</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[4.5%]">Possible Cycles for FY 26-27</th>
                          <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6.5%]">Total Budget</th>
                          <th rowspan="2" class="p-0.5 border-b border-slate-900 w-[4%]">Per Day Training Hours</th>
                        </tr>
                        <tr class="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold">
                          <th class="p-0.5 border-r border-b border-slate-900 w-[3.5%]">Days</th>
                          <th class="p-0.5 border-r border-b border-slate-900 w-[3.5%]">Hrs</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (row of doc.courseRows; track row.id; let i = $index) {
                          <tr class="border-b border-slate-900 hover:bg-slate-50 transition-colors">
                            <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                              {{ i + 1 }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-left">
                              {{ row.sector }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-left font-bold">
                              {{ row.courseName }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 font-mono text-center">
                              {{ row.courseCode }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center">
                              {{ row.durationDays }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center">
                              {{ row.durationHours }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center">
                              {{ row.mandatoryOjt }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center">
                              {{ row.minEdu }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center">
                              {{ row.minAge }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                              {{ row.rnr }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                              {{ row.rCat }}
                            </td>
                            <!-- Cost Per Trainee Stacked Cell -->
                            <td class="p-0 border-r border-slate-900 align-top">
                              <table class="w-full text-[8px] border-collapse">
                                <tr class="border-b border-slate-300">
                                  <td class="p-0.2 border-r border-slate-300 font-semibold w-5 text-center">C</td>
                                  <td class="p-0.2 text-right font-medium pr-0.5">{{ row.costC }}</td>
                                </tr>
                                <tr class="border-b border-slate-300">
                                  <td class="p-0.2 border-r border-slate-300 font-semibold text-center">H</td>
                                  <td class="p-0.2 text-right font-medium pr-0.5">{{ row.costH }}</td>
                                </tr>
                                <tr class="border-b border-slate-300">
                                  <td class="p-0.2 border-r border-slate-300 font-semibold text-center">Toolkit</td>
                                  <td class="p-0.2 text-right font-medium pr-0.5">{{ row.costToolkit }}</td>
                                </tr>
                                <tr class="bg-slate-50 font-bold">
                                  <td class="p-0.2 border-r border-slate-300 text-center">Total</td>
                                  <td class="p-0.2 text-right font-bold pr-0.5">{{ row.totalCostPerTrainee }}</td>
                                </tr>
                              </table>
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                              {{ row.approvedTrainees }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center font-bold text-slate-900">
                              {{ row.costPerBatch }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                              {{ row.cycles }}
                            </td>
                            <td class="p-0.5 border-r border-slate-900 text-center font-bold text-slate-900">
                              {{ row.totalBudget }}
                            </td>
                            <td class="p-0.5 text-center font-bold">
                              {{ row.perDayHours }}
                            </td>
                          </tr>
                        }
                        <!-- TOTAL SUMMARY FOOTER ROW -->
                        <tr class="bg-slate-100 font-bold border-b border-slate-900 text-center">
                          <td colspan="12" class="p-1 border-r border-slate-900 text-right pr-2 font-bold uppercase tracking-wider text-[8.5px]">
                            TOTAL
                          </td>
                          <td class="p-1 border-r border-slate-900 text-center font-bold text-slate-950 text-[8.5px]">
                            {{ totalTraineesCount() }}
                          </td>
                          <td class="p-1 border-r border-slate-900 text-center font-bold text-slate-950 text-[8.5px]">
                            {{ totalCostPerBatchSum() }}
                          </td>
                          <td class="p-1 border-r border-slate-900 text-center font-bold text-slate-950 text-[8.5px]">
                            {{ totalCyclesCount() }}
                          </td>
                          <td class="p-1 border-r border-slate-900 text-center font-bold text-slate-950 text-[8.5px]">
                            {{ totalBudgetSum() }}
                          </td>
                          <td class="p-1 border-slate-900"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- TARGET ALLOCATION SUMMARY TABLE -->
                <div class="my-5">
                  <h4 class="font-bold text-slate-900 text-xs uppercase tracking-tight mb-1.5 font-sans">
                    TARGET ALLOCATION SUMMARY TABLE:
                  </h4>
                  <table class="w-full sm:w-8/12 text-left border-collapse font-sans text-xs border border-slate-900">
                    <thead>
                      <tr class="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold">
                        <th class="p-1.5 border-r border-slate-900 w-14 text-center">S.No.</th>
                        <th class="p-1.5 border-r border-slate-900">Particular</th>
                        <th class="p-1.5 text-center w-48">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (sumRow of doc.targetSummary; track sumRow.sNo; let i = $index) {
                        <tr class="border-b border-slate-900">
                          <td class="p-1.5 border-r border-slate-900 text-center font-bold">{{ i + 1 }}</td>
                          <td class="p-1.5 border-r border-slate-900 font-medium text-slate-800">{{ sumRow.particular }}</td>
                          <td class="p-1.5 text-center font-bold">{{ sumRow.value }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- TERMS AND CONDITIONS CLAUSES (a to h) -->
                <div class="mt-6 mb-4 font-sans text-xs">
                  <p class="font-bold text-slate-900 mb-2">
                    IPA is issued subject to following terms and conditions: -
                  </p>
                  <ol class="list-alpha pl-5 space-y-2 text-slate-800 leading-relaxed text-[11px] sm:text-xs">
                    @for (clause of doc.termsAndConditions; track i; let i = $index) {
                      <li class="flex items-start gap-2">
                        <span class="font-bold shrink-0 text-slate-800">{{ getClauseLabel(i) }})</span>
                        <span class="font-serif leading-relaxed text-slate-800">{{ clause }}</span>
                      </li>
                    }
                  </ol>
                </div>

                <!-- SIGNATORY & DISTRIBUTION BLOCK -->
                <div class="mt-8 pt-4 flex items-end justify-between font-sans text-xs border-t border-slate-300">
                  <div class="space-y-1">
                    <p class="font-bold text-slate-800 m-0">CC:</p>
                    <ol class="list-decimal pl-5 space-y-1 text-slate-700 text-[11px] m-0">
                      @for (item of doc.ccList; track i; let i = $index) {
                        <li>
                          <span class="font-semibold">{{ i + 1 }}-</span> {{ item }}
                        </li>
                      }
                    </ol>
                  </div>

                  <div class="text-right space-y-0.5">
                    <div class="font-bold text-slate-900 text-xs">{{ doc.signatoryTitle }}</div>
                    <div class="font-medium text-slate-700 text-xs">{{ doc.signatorySub }}</div>
                  </div>
                </div>

              </div>

              <!-- Modal Footer -->
              <div class="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 print:hidden font-sans">
                <button
                  type="button"
                  (click)="closeIpaModal()"
                  class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  (click)="printIpaDocument()"
                  class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print / Download PDF</span>
                </button>
              </div>

            </div>
          </div>
        }
      }

    </div>
  `
})
export class IpaListComponent {
  private eoiStateService = inject(EoiStateService);

  readonly pageSize = 10;
  searchQuery = '';
  readonly ipaList: SanctionOrder[] = environment.useMockData ? MOCK_SANCTION_ORDERS : [];
  selectedIpa = signal<SanctionOrder | null>(null);

  defaultEmblemSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 16 L54 28 L67 28 L56 36 L60 48 L50 40 L40 48 L44 36 L33 28 L46 28 Z" fill="%230b3558"/><path d="M25 65 Q50 55 75 65 Q50 72 25 65 Z" fill="%23b91c1c"/><text x="50" y="83" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="%230b3558">GOVT OF RAJASTHAN</text></svg>`;

  activeIpaDoc = computed<IpaDocumentData>(() => {
    const item = this.selectedIpa();
    const schemeId = item?.scheme || 'MMKVY-01';
    const appId = item?.appId || 'APP-004661';
    return this.eoiStateService.getIpaData(schemeId, appId);
  });

  totalTraineesCount = computed(() => {
    const doc = this.activeIpaDoc();
    return (doc?.courseRows || []).reduce((sum, r) => sum + (Number(r.approvedTrainees) || 0), 0);
  });

  totalCostPerBatchSum = computed(() => {
    const doc = this.activeIpaDoc();
    return (doc?.courseRows || []).reduce((sum, r) => sum + (Number(r.costPerBatch) || 0), 0);
  });

  totalCyclesCount = computed(() => {
    const doc = this.activeIpaDoc();
    return (doc?.courseRows || []).reduce((sum, r) => sum + (Number(r.cycles) || 0), 0);
  });

  totalBudgetSum = computed(() => {
    const doc = this.activeIpaDoc();
    return (doc?.courseRows || []).reduce((sum, r) => sum + (Number(r.totalBudget) || 0), 0);
  });

  readonly ipaColumns: TableColumn<SanctionOrder>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
    { key: 'ipaNumber', label: 'IPA Number', align: 'center', width: 'w-44', type: 'custom' },
    { key: 'appId', label: 'Application ID', align: 'center', width: 'w-32', cellClass: 'whitespace-nowrap font-mono font-bold text-slate-700 text-center' },
    { key: 'schemeName', label: 'Scheme Name', type: 'custom', cellClass: 'whitespace-nowrap font-bold text-slate-900' },
    { key: 'district', label: 'Sanction District', align: 'center', cellClass: 'whitespace-nowrap font-medium text-slate-800 text-center' },
    { key: 'sectors', label: 'Sanction Sector(s)', type: 'custom' },
    { key: 'sanctionTarget', label: 'Sanction Target', align: 'center', width: 'w-32', cellClass: 'whitespace-nowrap font-bold text-[#174A6E] text-center' },
    { key: 'grade', label: 'Grade', align: 'center', type: 'custom', width: 'w-20' },
    { key: 'actions', label: 'Action', align: 'center', type: 'custom', width: 'w-24' }
  ];

  get filteredIpaList(): SanctionOrder[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.ipaList;
    return this.ipaList.filter(o =>
      o.ipaNumber.toLowerCase().includes(q) ||
      (o.appId && o.appId.toLowerCase().includes(q)) ||
      o.schemeName.toLowerCase().includes(q) ||
      (o.district && o.district.toLowerCase().includes(q)) ||
      o.category.toLowerCase().includes(q) ||
      (o.sectors && o.sectors.some(s => s.toLowerCase().includes(q)))
    );
  }

  getClauseLabel(index: number): string {
    return String.fromCharCode(97 + index); // a, b, c, d...
  }

  viewIpaForm(ipa: SanctionOrder): void {
    this.selectedIpa.set(ipa);
  }

  closeIpaModal(): void {
    this.selectedIpa.set(null);
  }

  printIpaDocument(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
