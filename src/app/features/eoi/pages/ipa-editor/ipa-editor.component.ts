import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import { PageHeaderComponent } from '../../../../shared';

export interface IpaCourseRow {
  id: string;
  sector: string;
  courseName: string;
  courseCode: string;
  durationDays: number;
  durationHours: number;
  mandatoryOjt: string;
  minEdu: string;
  minAge: string;
  rnr: string;
  rCat: string;
  costC: number;
  costH: number;
  costToolkit: string;
  totalCostPerTrainee: number;
  approvedTrainees: number;
  costPerBatch: number;
  cycles: number;
  totalBudget: number;
  perDayHours: number;
}

export interface TargetSummaryRow {
  sNo: number;
  particular: string;
  value: string;
}

@Component({
  selector: 'app-ipa-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent],
  template: `
    <div class="w-full min-h-full bg-slate-100 text-[#1F2933] font-sans pb-12 print:bg-white print:p-0 print:pb-0">
      
      <!-- Top Action Bar (Hidden in Print) -->
      <div class="p-4 sm:p-5 print:hidden space-y-4 max-w-6xl mx-auto font-sans">
        <app-page-header
          title="In-Principle Approval (IPA) Document Editor"
          [breadcrumbs]="[
            { label: 'Home', url: '/' },
            { label: 'Sanction Order', url: '/admin/sanction-orders' },
            { label: 'IPA Document Editor' }
          ]"
          [backUrl]="'/admin/sanction-order/' + schemeId()"
          backTitle="Back to Allocated Targets"
        >
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="saveIpaAndNotify()"
              class="px-3.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ isSaved() ? '✓ Saved &amp; Issued' : 'Save &amp; Finalize IPA' }}</span>
            </button>

            <button
              type="button"
              (click)="printPdf()"
              class="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Export IPA</span>
            </button>
          </div>
        </app-page-header>

        @if (savedNotification()) {
          <div class="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 flex items-center justify-between animate-fade-in shadow-xs">
            <span class="font-semibold flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              In-Principle Approval (IPA) Saved &amp; Updated Successfully! Redirecting...
            </span>
            <span class="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Saved</span>
          </div>
        } @else {
          <div class="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center justify-between">
            <span>&check; <strong>Live IPA Editor Mode (IPA.pdf format):</strong> Click any text, date, reference number, course table row, or clause below to edit directly before saving or exporting.</span>
            <span class="text-[11px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">RSLDC Official IPA Format</span>
          </div>
        }
      </div>

      <!-- EDITABLE IPA DOCUMENT CONTAINER (Matches IPA.pdf layout exactly) -->
      <div class="ipa-pdf-container max-w-6xl mx-auto bg-white p-4 sm:p-6 print:p-0 print:max-w-none text-[#111827] font-serif leading-relaxed text-xs sm:text-sm border border-slate-300 shadow-md rounded-sm print:border-none print:shadow-none">
        
        <!-- Header with Official Logos & Government Title -->
        <div class="border-b-2 border-slate-800 pb-3 mb-4 text-center font-sans">
          <div class="flex items-center justify-between gap-4 mb-2">
            <!-- Left Emblem Logo (Editable & Uploadable, No Border) -->
            <div class="relative group w-20 h-20 shrink-0 flex items-center justify-center p-1 bg-transparent">
              <img [src]="leftLogoUrl()" alt="Emblem Logo" class="max-w-full max-h-full object-contain" (error)="onLeftLogoError()" />
              <label class="absolute inset-0 bg-slate-900/75 text-white text-[10px] font-sans font-semibold flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded print:hidden">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Change Logo</span>
                <input type="file" accept="image/*" class="hidden" (change)="onLeftLogoUpload($event)" />
              </label>
            </div>

            <!-- Header Titles (Editable) -->
            <div class="flex-1 space-y-1">
              <input
                type="text"
                [(ngModel)]="headerTitle"
                class="w-full text-center font-bold text-slate-900 text-base sm:text-lg uppercase bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none px-1"
              />
              <input
                type="text"
                [(ngModel)]="headerSubtitle"
                class="w-full text-center font-medium text-slate-700 text-xs bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none px-1"
              />
              <input
                type="text"
                [(ngModel)]="headerAddress"
                class="w-full text-center text-[11px] text-slate-600 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none px-1"
              />
            </div>

            <!-- Right Organization Logo (Editable & Uploadable, No Border) -->
            <div class="relative group w-20 h-20 shrink-0 flex items-center justify-center p-1 bg-transparent">
              @if (rightLogoUrl()) {
                <img [src]="rightLogoUrl()" alt="Right Logo" class="max-w-full max-h-full object-contain" />
              } @else {
                <div class="text-center font-bold text-[#0B3558] leading-tight text-[11px] font-sans px-1">
                  RSLDC<br>JAIPUR
                </div>
              }
              <label class="absolute inset-0 bg-slate-900/75 text-white text-[10px] font-sans font-semibold flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded print:hidden">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Change Logo</span>
                <input type="file" accept="image/*" class="hidden" (change)="onRightLogoUpload($event)" />
              </label>
            </div>
          </div>
        </div>

        <!-- File No & Date (Editable) -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-sans text-xs font-semibold mb-3 border-b border-slate-200 pb-2">
          <div class="flex items-center gap-1.5 w-full sm:w-auto">
            <span class="text-slate-600 shrink-0">File No:</span>
            <input
              type="text"
              [(ngModel)]="fileNo"
              class="w-full sm:w-96 font-mono text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-800 focus:outline-none px-1 text-xs"
            />
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-slate-600">Date:</span>
            <input
              type="text"
              [(ngModel)]="ipaDate"
              class="w-32 text-right font-mono text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-800 focus:outline-none px-1 text-xs"
            />
          </div>
        </div>

        <!-- Recipient Details Block (To, PIA Name, Address, SAR) -->
        <div class="space-y-1 mb-4 font-sans text-xs">
          <p class="font-bold text-slate-900">To,</p>
          <input
            type="text"
            [(ngModel)]="recipientName"
            class="font-bold text-slate-900 text-sm bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none w-full block"
          />
          <input
            type="text"
            [(ngModel)]="recipientAddress1"
            class="text-slate-700 bg-transparent border-b border-dashed border-slate-200 focus:border-slate-800 focus:outline-none w-full block"
          />
          <input
            type="text"
            [(ngModel)]="recipientAddress2"
            class="text-slate-700 bg-transparent border-b border-dashed border-slate-200 focus:border-slate-800 focus:outline-none w-full block"
          />
          <input
            type="text"
            [(ngModel)]="recipientSar"
            class="font-mono text-slate-800 text-[11px] bg-transparent border-b border-dashed border-slate-200 focus:border-slate-800 focus:outline-none w-64 block mt-1"
          />
        </div>

        <!-- Reference & Subject Section (Editable) -->
        <div class="space-y-2 mb-4 font-sans text-xs bg-slate-50/60 p-2.5 border border-slate-200 rounded">
          <div class="flex items-start gap-2">
            <span class="font-bold text-slate-900 shrink-0">Ref:</span>
            <textarea
              [(ngModel)]="referenceNo"
              rows="1"
              class="w-full text-slate-700 bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs rounded"
            ></textarea>
          </div>

          <div class="flex items-start gap-2">
            <span class="font-bold text-slate-900 shrink-0">Sub:</span>
            <textarea
              [(ngModel)]="subjectText"
              rows="2"
              class="w-full font-bold text-slate-900 bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs rounded resize-y"
            ></textarea>
          </div>
        </div>

        <!-- Preamble Paragraph (Editable) -->
        <div class="mb-4 text-justify font-serif text-xs sm:text-sm leading-relaxed">
          <textarea
            [(ngModel)]="preambleText"
            rows="3"
            class="w-full text-slate-800 bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs sm:text-sm leading-relaxed rounded resize-y font-serif"
          ></textarea>
        </div>

        <!-- Name of PIA & SDC Address Block -->
        <div class="mb-4 font-sans text-xs bg-slate-100 p-2.5 border border-slate-300 rounded space-y-1.5">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span class="font-bold text-slate-900 shrink-0 w-36">Name of PIA -</span>
            <input
              type="text"
              [(ngModel)]="piaName"
              class="w-full font-bold text-slate-900 bg-white border border-slate-300 focus:border-slate-800 focus:outline-none px-2 py-0.5 rounded text-xs"
            />
          </div>
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span class="font-bold text-slate-900 shrink-0 w-36">SDC Address -</span>
            <input
              type="text"
              [(ngModel)]="sdcAddress"
              class="w-full text-slate-800 bg-white border border-slate-300 focus:border-slate-800 focus:outline-none px-2 py-0.5 rounded text-xs"
            />
          </div>
        </div>

        <!-- MAIN COURSE APPROVAL TABLE (Matching IPA.pdf layout exactly) -->
        <div class="my-5">
          <div class="flex items-center justify-between mb-2 font-sans">
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-tight">
              APPROVED COURSE &amp; CYCLES DETAILS:
            </h4>
            <button
              type="button"
              (click)="addCourseRow()"
              class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-sans font-medium cursor-pointer flex items-center gap-1 print:hidden"
            >
              <span>+ Add Course Row</span>
            </button>
          </div>

          <div class="w-full overflow-hidden">
            <table class="w-full table-fixed text-center border-collapse font-sans text-[8.5px] border border-slate-900 leading-tight">
              <thead>
                <tr class="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold">
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[2.5%]">S. No.</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[11.5%]">Sector</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[8.5%]">Course Name</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[7.5%]">Course Code</th>
                  <th colspan="2" class="p-0.5 border-r border-b border-slate-900">Duration</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6%]">Mandatory Provision of OJT in Job Role (Yes/No)</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[7%]">Minimum Edu. Qualification of trainee</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6%]">Minimum Job Entry Age of Trainee</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[3%]">R/NR</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[3%]">R. Cat.</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[9.5%]">Cost Per Trainee</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[5.5%]">Approved Trainees/ batch</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6.5%]">Cost Per Batch</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[4%]">Possible Cycles for FY 26-27</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[6.5%]">Total Budget</th>
                  <th rowspan="2" class="p-0.5 border-r border-b border-slate-900 w-[4%]">Per Day Training Hours</th>
                  <th rowspan="2" class="p-0.5 border-b border-slate-900 w-[2%] print:hidden">Del</th>
                </tr>
                <tr class="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold">
                  <th class="p-0.5 border-r border-b border-slate-900 w-[3.5%]">Days</th>
                  <th class="p-0.5 border-r border-b border-slate-900 w-[3.5%]">Hrs</th>
                </tr>
              </thead>
              <tbody>
                @for (row of courseRows; track row.id; let i = $index) {
                  <tr class="border-b border-slate-900 hover:bg-slate-50 transition-colors">
                    <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                      {{ i + 1 }}
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-left">
                      <textarea
                        [(ngModel)]="row.sector"
                        rows="2"
                        class="w-full bg-transparent border-none focus:outline-none p-0 text-[8.5px] leading-tight resize-none"
                      ></textarea>
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-left font-bold">
                      <textarea
                        [(ngModel)]="row.courseName"
                        rows="2"
                        class="w-full font-bold bg-transparent border-none focus:outline-none p-0 text-[8.5px] leading-tight resize-none"
                      ></textarea>
                    </td>
                    <td class="p-0.5 border-r border-slate-900 font-mono text-center">
                      <input
                        type="text"
                        [(ngModel)]="row.courseCode"
                        class="w-full text-center bg-transparent border-none focus:outline-none p-0 text-[8.5px]"
                      />
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center">
                      <input
                        type="number"
                        [(ngModel)]="row.durationDays"
                        class="w-full text-center bg-transparent border-none focus:outline-none p-0 text-[8.5px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center">
                      <input
                        type="number"
                        [(ngModel)]="row.durationHours"
                        class="w-full text-center bg-transparent border-none focus:outline-none p-0 text-[8.5px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center">
                      <input
                        type="text"
                        [(ngModel)]="row.mandatoryOjt"
                        class="w-full text-center bg-transparent border-none focus:outline-none p-0 text-[8.5px]"
                      />
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center">
                      <textarea
                        [(ngModel)]="row.minEdu"
                        rows="2"
                        class="w-full text-center bg-transparent border-none focus:outline-none p-0 text-[8.5px] leading-tight resize-none"
                      ></textarea>
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center">
                      <textarea
                        [(ngModel)]="row.minAge"
                        rows="2"
                        class="w-full text-center bg-transparent border-none focus:outline-none p-0 text-[8.5px] leading-tight resize-none"
                      ></textarea>
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                      <input
                        type="text"
                        [(ngModel)]="row.rnr"
                        class="w-full text-center font-bold bg-transparent border-none focus:outline-none p-0 text-[8.5px]"
                      />
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                      <input
                        type="text"
                        [(ngModel)]="row.rCat"
                        class="w-full text-center font-bold bg-transparent border-none focus:outline-none p-0 text-[8.5px]"
                      />
                    </td>
                    <!-- Cost Per Trainee Stacked Cell -->
                    <td class="p-0 border-r border-slate-900 align-top">
                      <table class="w-full text-[8px] border-collapse">
                        <tr class="border-b border-slate-300">
                          <td class="p-0.2 border-r border-slate-300 font-semibold w-5 text-center">C</td>
                          <td class="p-0.2 text-right font-medium pr-0.5">
                            <input
                              type="number"
                              [(ngModel)]="row.costC"
                              (ngModelChange)="recalculateRowTotal(row)"
                              class="w-full text-right bg-transparent border-none focus:outline-none p-0 text-[8px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                        </tr>
                        <tr class="border-b border-slate-300">
                          <td class="p-0.2 border-r border-slate-300 font-semibold text-center">H</td>
                          <td class="p-0.2 text-right font-medium pr-0.5">
                            <input
                              type="number"
                              [(ngModel)]="row.costH"
                              (ngModelChange)="recalculateRowTotal(row)"
                              class="w-full text-right bg-transparent border-none focus:outline-none p-0 text-[8px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                        </tr>
                        <tr class="border-b border-slate-300">
                          <td class="p-0.2 border-r border-slate-300 font-semibold text-center">Toolkit</td>
                          <td class="p-0.2 text-right font-medium pr-0.5">
                            <input
                              type="text"
                              [(ngModel)]="row.costToolkit"
                              class="w-full text-right bg-transparent border-none focus:outline-none p-0 text-[8px]"
                            />
                          </td>
                        </tr>
                        <tr class="bg-slate-50 font-bold">
                          <td class="p-0.2 border-r border-slate-300 text-center">Total</td>
                          <td class="p-0.2 text-right font-bold pr-0.5">{{ row.totalCostPerTrainee }}</td>
                        </tr>
                      </table>
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                      <input
                        type="number"
                        [(ngModel)]="row.approvedTrainees"
                        (ngModelChange)="recalculateRowTotal(row)"
                        class="w-full text-center font-bold bg-transparent border-none focus:outline-none p-0 text-[8.5px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center font-bold text-slate-900">
                      {{ row.costPerBatch }}
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                      <input
                        type="number"
                        [(ngModel)]="row.cycles"
                        (ngModelChange)="recalculateRowTotal(row)"
                        class="w-full text-center font-bold bg-transparent border-none focus:outline-none p-0 text-[8.5px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center font-bold text-slate-900">
                      {{ row.totalBudget }}
                    </td>
                    <td class="p-0.5 border-r border-slate-900 text-center font-bold">
                      <input
                        type="number"
                        [(ngModel)]="row.perDayHours"
                        class="w-full text-center font-bold bg-transparent border-none focus:outline-none p-0 text-[8.5px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td class="p-0.5 text-center print:hidden">
                      <button
                        type="button"
                        (click)="removeCourseRow(i)"
                        class="text-rose-600 hover:text-rose-800 text-xs font-bold px-0.5"
                        title="Delete Row"
                      >
                        &times;
                      </button>
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
                  <td class="p-1 border-r border-slate-900"></td>
                  <td class="p-1 print:hidden"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TARGET ALLOCATION SUMMARY TABLE (Matching IPA.pdf) -->
        <div class="my-5">
          <h4 class="font-bold text-slate-900 text-xs uppercase tracking-tight mb-1.5 font-sans">
            Target Allocation Summary Table:
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
              @for (sumRow of targetSummary; track sumRow.sNo; let i = $index) {
                <tr class="border-b border-slate-900">
                  <td class="p-1.5 border-r border-slate-900 text-center font-bold">{{ i + 1 }}</td>
                  <td class="p-1.5 border-r border-slate-900 font-medium text-slate-800">
                    <input
                      type="text"
                      [(ngModel)]="sumRow.particular"
                      class="w-full bg-transparent border-none focus:outline-none text-xs"
                    />
                  </td>
                  <td class="p-1.5 text-center font-bold">
                    <input
                      type="text"
                      [(ngModel)]="sumRow.value"
                      class="w-full text-center bg-transparent border-none focus:outline-none font-bold text-xs"
                    />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- TERMS AND CONDITIONS CLAUSES (Editable a to h from IPA.pdf) -->
        <div class="mt-6 mb-4 font-sans text-xs">
          <p class="font-bold text-slate-900 mb-2">
            IPA is issued subject to following terms and conditions: -
          </p>
          <ol class="list-alpha pl-5 space-y-2 text-slate-800 leading-relaxed text-[11px] sm:text-xs">
            @for (clause of termsAndConditions; track i; let i = $index) {
              <li class="group flex items-start gap-2">
                <span class="font-bold shrink-0 text-slate-800">{{ getClauseLabel(i) }})</span>
                <textarea
                  [(ngModel)]="termsAndConditions[i]"
                  rows="2"
                  class="w-full bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs rounded leading-relaxed resize-y font-serif"
                ></textarea>
                <button
                  type="button"
                  (click)="removeClause(i)"
                  class="opacity-0 group-hover:opacity-100 text-rose-600 hover:text-rose-800 text-xs font-bold px-1 print:hidden shrink-0 mt-1"
                  title="Remove Clause"
                >
                  &times;
                </button>
              </li>
            }
          </ol>

          <div class="mt-3 print:hidden">
            <button
              type="button"
              (click)="addClause()"
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-sans cursor-pointer flex items-center gap-1"
            >
              <span>+ Add Terms &amp; Conditions Clause</span>
            </button>
          </div>
        </div>

        <!-- SIGNATORY & DISTRIBUTION BLOCK (Editable) -->
        <div class="mt-8 pt-4 flex items-end justify-between font-sans text-xs border-t border-slate-300">
          <div class="space-y-1">
            <p class="font-bold text-slate-800">CC:</p>
            <ol class="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
              @for (item of copyToList; track i; let i = $index) {
                <li class="group flex items-center gap-2">
                  <span class="font-semibold shrink-0">{{ i + 1 }}-</span>
                  <input
                    type="text"
                    [(ngModel)]="copyToList[i]"
                    class="w-full bg-transparent border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none px-1 text-[11px]"
                  />
                </li>
              }
            </ol>
          </div>

          <div class="text-right space-y-1">
            <div class="flex flex-col items-end">
              <input
                type="text"
                [(ngModel)]="signatoryTitle"
                class="text-right font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48 text-xs"
              />
              <input
                type="text"
                [(ngModel)]="signatorySub"
                class="text-right font-medium text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48 text-xs"
              />
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Action Bar -->
      <div class="mt-8 max-w-6xl mx-auto flex items-center justify-between gap-4 font-sans print:hidden">
        <button
          type="button"
          (click)="saveIpaAndNotify()"
          class="px-5 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow transition-colors cursor-pointer flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ isSaved() ? '✓ Saved &amp; Issued' : 'Save &amp; Finalize IPA Letter' }}</span>
        </button>

        <button
          type="button"
          (click)="printPdf()"
          class="px-4 py-2 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium shadow transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print Document</span>
        </button>
      </div>

    </div>
  `
})
export class IpaEditorComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  schemeId = signal<string>('');
  appId = signal<string>('');
  savedNotification = signal<boolean>(false);
  isSaved = signal<boolean>(false);

  // Logo state and SVG fallbacks (Border-free emblem logo)
  defaultEmblemSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 16 L54 28 L67 28 L56 36 L60 48 L50 40 L40 48 L44 36 L33 28 L46 28 Z" fill="%230b3558"/><path d="M25 65 Q50 55 75 65 Q50 72 25 65 Z" fill="%23b91c1c"/><text x="50" y="83" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="%230b3558">GOVT OF RAJASTHAN</text></svg>`;
  leftLogoUrl = signal<string>('https://upload.wikimedia.org/wikipedia/commons/8/84/Government_of_Rajasthan_Logo.svg');
  rightLogoUrl = signal<string>('');
  rightLogoText = 'RSLDC\nJAIPUR';

  // Header & Ref Fields matching IPA.pdf
  headerTitle = 'Rajasthan Skill and Livelihoods Development Corporation';
  headerSubtitle = '(A Government of Rajasthan Enterprise)';
  headerAddress = 'EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur- 302004 (Rajasthan)';

  fileNo = 'FORSLDC/Skills/MMKVY-Cat.II: SAKSHM/2026-27/2895-97';
  ipaDate = '15/9/26';

  recipientName = 'M/s. Gupta Brothers';
  recipientAddress1 = 'D-5, Subzi Mandi Yard, Sri Ganganagar';
  recipientAddress2 = 'Sri Ganganagar, Rajasthan, Pin Code-335001';
  recipientSar = 'SAR: 2200-099-001';

  referenceNo = 'F () RSLDC/SKILL/MMKVY-Cat.-II: SAKSHM/2026-27/535, Dated: 15/07/2026';
  subjectText = 'In-Principal Approval (IPA-1)- MMKVY-Cat. II / SAKSHM sponsored by RSLDC for F.Y. 2026-27.';
  preambleText = 'In reference to your request and based on the recommendation from inspection team, in-principal approval is hereby accorded for conducting cycles (as detailed below) for following courses during financial year 2026-27, as per the terms and conditions stipulated in relevant guidelines.';

  piaName = 'M/s. Gupta Brothers';
  sdcAddress = 'Near Panchayati Mandir, Opposite Government Hospital, Kesisinghpur, Sriganganagar, 335027';

  // Course Approval Table matching IPA.pdf exactly
  courseRows: IpaCourseRow[] = [
    {
      id: '1',
      sector: 'Handicraft & Local Resource Based Skills',
      courseName: 'Phad Painting',
      courseCode: 'RSLDC/HRS-001',
      durationDays: 139,
      durationHours: 1110,
      mandatoryOjt: 'No',
      minEdu: 'Minimum 8th Pass',
      minAge: 'Minimum 15 Year',
      rnr: 'R',
      rCat: 'Z',
      costC: 25530,
      costH: 31600,
      costToolkit: 'NA',
      totalCostPerTrainee: 57130,
      approvedTrainees: 30,
      costPerBatch: 1713900,
      cycles: 1,
      totalBudget: 1713900,
      perDayHours: 8
    },
    {
      id: '2',
      sector: 'Handicraft & Local Resource Based Skills',
      courseName: 'Phad Painting',
      courseCode: 'RSLDC/HRS-001',
      durationDays: 185,
      durationHours: 1110,
      mandatoryOjt: 'No',
      minEdu: 'Minimum 8th Pass',
      minAge: 'Minimum 15 Year',
      rnr: 'NR',
      rCat: 'NA',
      costC: 25530,
      costH: 0,
      costToolkit: 'NA',
      totalCostPerTrainee: 25530,
      approvedTrainees: 30,
      costPerBatch: 765900,
      cycles: 1,
      totalBudget: 765900,
      perDayHours: 6
    },
    {
      id: '3',
      sector: 'Handicraft & Local Resource Based Skills',
      courseName: 'Phad Painting',
      courseCode: 'RSLDC/HRS-001',
      durationDays: 185,
      durationHours: 1110,
      mandatoryOjt: 'No',
      minEdu: 'Minimum 8th Pass',
      minAge: 'Minimum 15 Year',
      rnr: 'NR',
      rCat: 'NA',
      costC: 25530,
      costH: 0,
      costToolkit: 'NA',
      totalCostPerTrainee: 25530,
      approvedTrainees: 30,
      costPerBatch: 765900,
      cycles: 1,
      totalBudget: 765900,
      perDayHours: 6
    }
  ];

  // Target Summary Table matching IPA.pdf exactly
  targetSummary: TargetSummaryRow[] = [
    { sNo: 1, particular: "Total Training Target/District/SDC's as per SO", value: '90/01/01' },
    { sNo: 2, particular: 'Target allocation in previous IPA', value: 'First IPA' },
    { sNo: 3, particular: 'Target Allocation in this First IPA', value: '90' },
    { sNo: 4, particular: 'Remaining Targets', value: '00' }
  ];

  // Terms and Conditions Clauses (a to h) matching IPA.pdf exactly
  termsAndConditions: string[] = [
    'TP shall ensure to initiation of batches within 15 days from the date issuance the IPA.',
    'TP shall ensure to work in accordance with the (MMKVY-Cat-II-SAKSHM) guideline issued on 1st April 2021 and further direction given by RSLDC.',
    'TP shall ensure to functional IP cameras at SDC before the commencement of batches.',
    'TP shall Submit Performance Security Deposit (PSD) to RSLDC A/C on or before batch Commencement (In case of new SDC).',
    'TP will have to maintain video footage of complete skill training in Lab/classroom from IP Camera for each batch until the payment for the batch.',
    'TP shall ensure installation of Aadhaar linked Biometric for daily attendance of trainees & trainers (In & Out) at the SDC & Hostel (if applicable), which must be compatible with ISMS system of RSLDC.',
    'PIA must ensure compliance of the condition mentioned in the MoU, Sanction Order, Scheme Guideline and other applicable directives.',
    'The IEC & branding should be available as per the scheme guidelines.'
  ];

  signatoryTitle = 'Scheme OIC';
  signatorySub = 'SAKSHM, RSLDC';

  copyToList: string[] = [
    'CAO, RSLDC',
    'District Skill Coordinator (RSLDC) (By Mail)',
    'Office Copy'
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const sId = params['schemeId'] || 'MMKVY-01';
      const aId = params['appId'] || 'APP-004661';
      this.schemeId.set(sId);
      this.appId.set(aId);
      this.loadCompanyDetails(aId);
    });
  }

  private loadCompanyDetails(aId: string): void {
    this.eoiStateService.getResponseById(aId).subscribe(resp => {
      if (resp) {
        this.recipientName = resp.actualLegalName || resp.anonymousLabel;
        this.piaName = resp.actualLegalName || resp.anonymousLabel;
        if (resp.organisation?.registeredAddress) {
          this.recipientAddress1 = resp.organisation.registeredAddress;
        }
      }
    });
  }

  totalTraineesCount = computed(() => {
    return this.courseRows.reduce((sum, r) => sum + r.approvedTrainees, 0);
  });

  totalCostPerBatchSum = computed(() => {
    return this.courseRows.reduce((sum, r) => sum + r.costPerBatch, 0);
  });

  totalCyclesCount = computed(() => {
    return this.courseRows.reduce((sum, r) => sum + r.cycles, 0);
  });

  totalBudgetSum = computed(() => {
    return this.courseRows.reduce((sum, r) => sum + r.totalBudget, 0);
  });

  recalculateRowTotal(row: IpaCourseRow): void {
    row.totalCostPerTrainee = (row.costC || 0) + (row.costH || 0);
    row.costPerBatch = row.totalCostPerTrainee * row.approvedTrainees;
    row.totalBudget = row.costPerBatch * row.cycles;
  }

  addCourseRow(): void {
    const nextNo = (this.courseRows.length + 1).toString();
    const newRow: IpaCourseRow = {
      id: nextNo,
      sector: 'Handicraft & Local Resource Based Skills',
      courseName: 'Phad Painting',
      courseCode: 'RSLDC/HRS-001',
      durationDays: 185,
      durationHours: 1110,
      mandatoryOjt: 'No',
      minEdu: 'Minimum 8th Pass',
      minAge: 'Minimum 15 Year',
      rnr: 'NR',
      rCat: 'NA',
      costC: 25530,
      costH: 0,
      costToolkit: 'NA',
      totalCostPerTrainee: 25530,
      approvedTrainees: 30,
      costPerBatch: 765900,
      cycles: 1,
      totalBudget: 765900,
      perDayHours: 6
    };
    this.courseRows.push(newRow);
  }

  removeCourseRow(index: number): void {
    if (this.courseRows.length > 1) {
      this.courseRows.splice(index, 1);
    }
  }

  getClauseLabel(index: number): string {
    return String.fromCharCode(97 + index); // a, b, c, d...
  }

  addClause(): void {
    this.termsAndConditions.push('TP shall comply with all updated operational guidelines and office orders issued by RSLDC.');
  }

  removeClause(index: number): void {
    if (this.termsAndConditions.length > 1) {
      this.termsAndConditions.splice(index, 1);
    }
  }

  onLeftLogoUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.leftLogoUrl.set(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onRightLogoUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.rightLogoUrl.set(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onLeftLogoError(): void {
    this.leftLogoUrl.set(this.defaultEmblemSvg);
  }

  saveIpaAndNotify(): void {
    this.savedNotification.set(true);
    this.isSaved.set(true);
    setTimeout(() => {
      this.savedNotification.set(false);
      this.router.navigate(['/admin/sanction-order', this.schemeId()]);
    }, 1200);
  }

  printPdf(): void {
    window.print();
  }
}
