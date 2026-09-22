import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface SubmittedTender {
  id: string;
  appRef: string;
  appliedDate: string;
  schemeTitle: string;
  department: string;
  emdAmount: string;
  processingFee: string;
  transactionRef: string;
  submittedStatus: 'Submitted' | 'Accepted' | 'Technical Evaluation' | 'Rejected';
  eoiStatus: 'Technical Opening' | 'Technical Evaluation' | 'AOC';
  receiptPdfUrl?: string;
  scrutinyRemarks?: string;
}

@Component({
  selector: 'app-tender-status',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="w-full min-h-full bg-white p-6 sm:p-8 space-y-6 select-none font-sans">
      
      <!-- Top Page Header -->
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-black text-[#0B3558] tracking-tight">
          Tender Status
        </h1>
      </div>

      <!-- Filter Controls & Search Toolbar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        
        <!-- Status Filter Badges / Pills -->
        <div class="flex items-center gap-1.5 flex-wrap">
          
          <!-- All -->
          <button
            type="button"
            (click)="setFilter('All')"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'All'"
            [class.text-white]="activeFilter() === 'All'"
            [class.bg-slate-100]="activeFilter() !== 'All'"
            [class.text-slate-700]="activeFilter() !== 'All'"
            [class.hover:bg-slate-200]="activeFilter() !== 'All'"
          >
            <span>All</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="activeFilter() === 'All'"
              [class.text-white]="activeFilter() === 'All'"
              [class.bg-slate-200]="activeFilter() !== 'All'"
              [class.text-slate-700]="activeFilter() !== 'All'"
            >
              {{ tenders.length }}
            </span>
          </button>

          <!-- Submitted -->
          <button
            type="button"
            (click)="setFilter('Submitted')"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'Submitted'"
            [class.text-white]="activeFilter() === 'Submitted'"
            [class.bg-slate-100]="activeFilter() !== 'Submitted'"
            [class.text-slate-700]="activeFilter() !== 'Submitted'"
            [class.hover:bg-slate-200]="activeFilter() !== 'Submitted'"
          >
            <span>Submitted</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="activeFilter() === 'Submitted'"
              [class.text-white]="activeFilter() === 'Submitted'"
              [class.bg-slate-200]="activeFilter() !== 'Submitted'"
              [class.text-slate-700]="activeFilter() !== 'Submitted'"
            >
              {{ countBySubmitted('Submitted') }}
            </span>
          </button>

          <!-- Accepted -->
          <button
            type="button"
            (click)="setFilter('Accepted')"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'Accepted'"
            [class.text-white]="activeFilter() === 'Accepted'"
            [class.bg-slate-100]="activeFilter() !== 'Accepted'"
            [class.text-slate-700]="activeFilter() !== 'Accepted'"
            [class.hover:bg-slate-200]="activeFilter() !== 'Accepted'"
          >
            <span>Accepted</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="activeFilter() === 'Accepted'"
              [class.text-white]="activeFilter() === 'Accepted'"
              [class.bg-slate-200]="activeFilter() !== 'Accepted'"
              [class.text-slate-700]="activeFilter() !== 'Accepted'"
            >
              {{ countBySubmitted('Accepted') }}
            </span>
          </button>

          <!-- Technical Opening -->
          <button
            type="button"
            (click)="setFilter('Technical Opening')"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'Technical Opening'"
            [class.text-white]="activeFilter() === 'Technical Opening'"
            [class.bg-slate-100]="activeFilter() !== 'Technical Opening'"
            [class.text-slate-700]="activeFilter() !== 'Technical Opening'"
            [class.hover:bg-slate-200]="activeFilter() !== 'Technical Opening'"
          >
            <span>Technical Opening</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="activeFilter() === 'Technical Opening'"
              [class.text-white]="activeFilter() === 'Technical Opening'"
              [class.bg-slate-200]="activeFilter() !== 'Technical Opening'"
              [class.text-slate-700]="activeFilter() !== 'Technical Opening'"
            >
              {{ countByEoi('Technical Opening') }}
            </span>
          </button>

          <!-- Technical Evaluation -->
          <button
            type="button"
            (click)="setFilter('Technical Evaluation')"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'Technical Evaluation'"
            [class.text-white]="activeFilter() === 'Technical Evaluation'"
            [class.bg-slate-100]="activeFilter() !== 'Technical Evaluation'"
            [class.text-slate-700]="activeFilter() !== 'Technical Evaluation'"
            [class.hover:bg-slate-200]="activeFilter() !== 'Technical Evaluation'"
          >
            <span>Technical Evaluation</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="activeFilter() === 'Technical Evaluation'"
              [class.text-white]="activeFilter() === 'Technical Evaluation'"
              [class.bg-slate-200]="activeFilter() !== 'Technical Evaluation'"
              [class.text-slate-700]="activeFilter() !== 'Technical Evaluation'"
            >
              {{ countByEoi('Technical Evaluation') }}
            </span>
          </button>

          <!-- AOC -->
          <button
            type="button"
            (click)="setFilter('AOC')"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'AOC'"
            [class.text-white]="activeFilter() === 'AOC'"
            [class.bg-slate-100]="activeFilter() !== 'AOC'"
            [class.text-slate-700]="activeFilter() !== 'AOC'"
            [class.hover:bg-slate-200]="activeFilter() !== 'AOC'"
          >
            <span>AOC</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="activeFilter() === 'AOC'"
              [class.text-white]="activeFilter() === 'AOC'"
              [class.bg-slate-200]="activeFilter() !== 'AOC'"
              [class.text-slate-700]="activeFilter() !== 'AOC'"
            >
              {{ countByEoi('AOC') }}
            </span>
          </button>

          <!-- Rejected -->
          <button
            type="button"
            (click)="setFilter('Rejected')"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'Rejected'"
            [class.text-white]="activeFilter() === 'Rejected'"
            [class.bg-slate-100]="activeFilter() !== 'Rejected'"
            [class.text-slate-700]="activeFilter() !== 'Rejected'"
            [class.hover:bg-slate-200]="activeFilter() !== 'Rejected'"
          >
            <span>Rejected</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="activeFilter() === 'Rejected'"
              [class.text-white]="activeFilter() === 'Rejected'"
              [class.bg-slate-200]="activeFilter() !== 'Rejected'"
              [class.text-slate-700]="activeFilter() !== 'Rejected'"
            >
              {{ countBySubmitted('Rejected') }}
            </span>
          </button>

        </div>

        <!-- Search Input with Search Icon -->
        <div class="relative w-full sm:w-72">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search Ref, Scheme, Department..."
            class="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B3558] focus:bg-white transition-all shadow-2xs font-normal"
          />
          @if (searchQuery) {
            <button
              type="button"
              (click)="searchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
            >
              &times;
            </button>
          }
        </div>

      </div>

      <!-- Main Status Table -->
      <div class="border border-slate-200 rounded-lg overflow-hidden overflow-x-auto shadow-2xs">
        <table class="w-full text-left border-collapse text-xs font-sans">
          <!-- Dark Navy Table Header with gold accent line -->
          <thead>
            <tr class="bg-[#0B3558] text-white text-[11px] font-semibold uppercase tracking-wider select-none border-b-2 border-amber-500">
              <th class="py-3 px-4 w-52 border-r border-[#1a4a74]">APPLICATION REF &amp; DATE</th>
              <th class="py-3 px-4 border-r border-[#1a4a74]">SCHEME &amp; DEPARTMENT</th>
              <th class="py-3 px-3 w-40 text-center border-r border-[#1a4a74]">SUBMITTED STATUS</th>
              <th class="py-3 px-3 w-48 text-center border-r border-[#1a4a74]">EOI STATUS</th>
              <th class="py-3 px-3 w-32 text-center">ACTIONS</th>
            </tr>
          </thead>

          <!-- Table Body with normal simple text (not bold) and consistent font -->
          <tbody class="divide-y divide-slate-200 bg-white font-normal text-slate-700">
            @for (tender of filteredTenders(); track tender.id) {
              <tr class="hover:bg-slate-50/70 transition-colors">
                
                <!-- Column 1: Application Ref & Date -->
                <td class="py-3.5 px-4 align-top">
                  <div class="flex items-center gap-1.5 group cursor-pointer" (click)="openReceipt(tender)">
                    <span class="font-normal text-xs text-slate-800 group-hover:text-[#0B3558] transition-colors">
                      {{ tender.appRef }}
                    </span>
                    <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0B3558] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-normal">
                    <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Applied: {{ tender.appliedDate }}</span>
                  </div>
                </td>

                <!-- Column 2: Scheme & Department -->
                <td class="py-3.5 px-4 align-top">
                  <div class="text-xs text-slate-800 font-normal leading-snug">
                    {{ tender.schemeTitle }}
                  </div>
                  <div class="text-[11px] text-slate-500 mt-1 font-normal">
                    {{ tender.department }}
                  </div>
                </td>

                <!-- Column 3: SUBMITTED STATUS (Simple clean normal text, not highlighted) -->
                <td class="py-3.5 px-3 align-top text-center font-normal text-xs text-slate-700">
                  <span>{{ tender.submittedStatus }}</span>
                </td>

                <!-- Column 4: EOI STATUS (Simple clean normal text, not highlighted) -->
                <td class="py-3.5 px-3 align-top text-center font-normal text-xs text-slate-700">
                  <span>{{ tender.eoiStatus }}</span>
                </td>

                <!-- Column 5: Actions (Proper PDF icon + View PDF) -->
                <td class="py-3.5 px-3 align-top text-center">
                  <button
                    type="button"
                    (click)="openReceipt(tender)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-normal text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 transition-colors cursor-pointer shadow-2xs"
                    title="View Receipt PDF"
                  >
                    <svg class="w-3.5 h-3.5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3v5h1v-1.5h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 2c0 .28-.22.5-.5.5h-2.5v-5h2.5c.28 0 .5.22.5.5v4zm-1-3.5h-1v3h1v-3zm5-.5h-2v1h1.5c.28 0 .5.22.5.5s-.22.5-.5.5H19v1.5h-1v-5h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                    </svg>
                    <span>View PDF</span>
                  </button>
                </td>

              </tr>
            }

            @if (filteredTenders().length === 0) {
              <tr>
                <td colspan="5" class="py-12 text-center text-slate-500">
                  <div class="max-w-sm mx-auto text-center space-y-2">
                    <svg class="w-10 h-10 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-xs font-semibold text-slate-700">No tenders match your filter criteria.</p>
                    <p class="text-[11px] text-slate-400">Try clearing your search query or selecting a different status tab.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Receipt Preview Modal (Exact design from Screenshot 2) -->
      @if (selectedReceiptTender(); as receipt) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200 font-sans"
          role="dialog"
          aria-modal="true"
        >
          <div class="relative max-w-3xl w-full bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[95vh] flex flex-col">
            
            <!-- Top Controls Bar -->
            <div class="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span class="text-xs font-semibold text-slate-700">Official Submission Receipt &bull; {{ receipt.appRef }}</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="downloadReceipt(receipt)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  (click)="downloadReceipt(receipt)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  (click)="selectedReceiptTender.set(null)"
                  class="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer text-lg leading-none transition-colors ml-1"
                  title="Close Preview"
                >
                  &times;
                </button>
              </div>
            </div>

            <!-- Scrollable Receipt Content (Replicating Screenshot 2 perfectly) -->
            <div class="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-sans bg-white">
              
              <!-- 1. Government Header Banner (Navy Blue with Orange Border) -->
              <div class="bg-[#0d2342] text-white p-5 rounded-t-lg border-b-4 border-amber-500">
                <div class="text-[#f59e0b] font-bold text-xs uppercase tracking-wider">
                  GOVERNMENT OF RAJASTHAN
                </div>
                <div class="text-xs text-slate-300 font-normal mt-0.5">
                  Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)
                </div>
                <h2 class="text-base sm:text-lg font-bold text-white tracking-wide mt-1.5">
                  ISMS 2.0 - INTEGRATED SCHEME MANAGEMENT SYSTEM
                </h2>
                <div class="text-[11px] text-slate-200 uppercase tracking-widest mt-0.5 font-medium">
                  EOI APPLICATION SUBMISSION RECEIPT &amp; ACKNOWLEDGEMENT
                </div>
              </div>

              <!-- 2. Blue Details Box -->
              <div class="bg-[#f0f7ff] border border-[#bfdbfe] rounded-md p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span class="text-[#0B3558] font-bold block text-[11px]">Application Reference No:</span>
                  <span class="text-sm sm:text-base font-bold text-[#0B3558] font-mono">{{ receipt.appRef }}</span>
                </div>
                <div>
                  <span class="text-[#0B3558] font-bold block text-[11px]">Acknowledgement No:</span>
                  <span class="text-xs font-semibold text-slate-800 font-mono">ACK-RSLDC-{{ receipt.appRef.replace('ISMS-EOI-', '') }}</span>
                </div>
                <div>
                  <span class="text-[#0B3558] font-bold block text-[11px]">Submission Timestamp:</span>
                  <span class="text-xs text-slate-800">{{ receipt.appliedDate }}, 03:45 PM IST</span>
                </div>
              </div>

              <!-- 3. Section 1: APPLICANT & TRAINING PROVIDER INFORMATION -->
              <div class="border border-slate-200 rounded overflow-hidden">
                <div class="bg-[#e8f1fd] border-b border-[#bfdbfe] px-3.5 py-1.5 text-xs font-bold text-[#0B3558] uppercase">
                  1. APPLICANT &amp; TRAINING PROVIDER INFORMATION
                </div>
                <div class="p-3.5 space-y-2 text-xs font-normal bg-white">
                  <div class="flex flex-col sm:flex-row">
                    <span class="text-slate-500 font-medium sm:w-48 shrink-0">Organization Full Name:</span>
                    <span class="text-slate-900 font-normal">Apex Skill Development Foundation</span>
                  </div>
                  <div class="flex flex-col sm:flex-row">
                    <span class="text-slate-500 font-medium sm:w-48 shrink-0">Registration / Trust No:</span>
                    <span class="text-slate-900 font-normal flex-1">
                      REG/RAJ/2018/88921 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <span class="text-slate-500 font-medium">Entity PAN:</span>
                      <span class="font-mono text-slate-900 ml-1">AAACA1234C</span>
                    </span>
                  </div>
                  <div class="flex flex-col sm:flex-row">
                    <span class="text-slate-500 font-medium sm:w-48 shrink-0">Authorized Signatory:</span>
                    <span class="text-slate-900 font-normal">Rajesh Kumar Sharma (Managing Director &amp; CEO)</span>
                  </div>
                  <div class="flex flex-col sm:flex-row">
                    <span class="text-slate-500 font-medium sm:w-48 shrink-0">Official Contact:</span>
                    <span class="text-slate-900 font-normal">9829012345 &nbsp;|&nbsp; contact&#64;apexskills.org</span>
                  </div>
                </div>
              </div>

              <!-- 4. Section 2: MANDATORY FEE PAYMENT & TRANSACTION DETAILS -->
              <div class="border border-slate-200 rounded overflow-hidden">
                <div class="bg-[#e8f1fd] border-b border-[#bfdbfe] px-3.5 py-1.5 text-xs font-bold text-[#0B3558] uppercase">
                  2. MANDATORY FEE PAYMENT &amp; TRANSACTION DETAILS
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left">
                    <thead class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700">
                      <tr>
                        <th class="py-2 px-3.5">Fee Description</th>
                        <th class="py-2 px-3">Accounting Head</th>
                        <th class="py-2 px-3">Payment Status</th>
                        <th class="py-2 px-3.5 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
                      <tr>
                        <td class="py-2 px-3.5">EOI Proposal Processing Fee (Non-Refundable)</td>
                        <td class="py-2 px-3 font-mono text-[11px]">RSLDC-FEE-PROC-2026</td>
                        <td class="py-2 px-3 font-semibold text-emerald-600">SUCCESSFUL / PAID</td>
                        <td class="py-2 px-3.5 text-right font-medium">Rs. 2,000</td>
                      </tr>
                      <tr>
                        <td class="py-2 px-3.5">Earnest Money Deposit (EMD)</td>
                        <td class="py-2 px-3 font-mono text-[11px]">RSLDC-EMD-SEC-2026</td>
                        <td class="py-2 px-3 font-semibold text-emerald-600">SUCCESSFUL / PAID</td>
                        <td class="py-2 px-3.5 text-right font-medium">Rs. 50,000</td>
                      </tr>
                      <tr class="bg-blue-50/60 font-bold text-[#0B3558]">
                        <td colspan="3" class="py-2.5 px-3.5">Total Amount Received &amp; Realized in RSLDC Account:</td>
                        <td class="py-2.5 px-3.5 text-right text-sm">Rs. 52,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="p-3 border-t border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                  <div>
                    <span class="text-slate-500">Gateway Transaction ID:</span>
                    <span class="font-bold text-slate-800 font-mono ml-1">{{ receipt.transactionRef || 'TXN-ISMS-884920482' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500">Payment Method:</span>
                    <span class="font-bold text-slate-800 ml-1">Net Banking</span>
                  </div>
                </div>
              </div>

              <!-- 5. Section 3: VERIFIED PROPOSAL DOCUMENTS & SUBMISSION CHECKLIST -->
              <div class="border border-slate-200 rounded overflow-hidden">
                <div class="bg-[#e8f1fd] border-b border-[#bfdbfe] px-3.5 py-1.5 text-xs font-bold text-[#0B3558] uppercase">
                  3. VERIFIED PROPOSAL DOCUMENTS &amp; SUBMISSION CHECKLIST
                </div>
                <div class="p-3.5 space-y-2 text-xs bg-white font-normal">
                  <div class="flex items-center justify-between">
                    <span class="text-emerald-700 font-semibold">[V] 1. Company / Entity Registration Certificate</span>
                    <span class="text-slate-500 font-mono text-[11px]">company_registration_incorporation_proof.pdf</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-emerald-700 font-semibold">[V] 2. Past Skill Training Experience Certificates</span>
                    <span class="text-slate-500 font-mono text-[11px]">previous_training_experience_certificates.pdf</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-emerald-700 font-semibold">[V] 3. CA Certified Annual Turnover (Last 3 FY)</span>
                    <span class="text-slate-500 font-mono text-[11px]">ca_certified_turnover_certificate_last_3_fy.pdf</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-emerald-700 font-semibold">[V] 4. Technical Proposal &amp; Action Plan 2025-26</span>
                    <span class="text-slate-500 font-mono text-[11px]">technical_proposal_methodology_2025_26.pdf</span>
                  </div>
                </div>
              </div>

              <!-- 6. Footer Modification Window & Portal Box -->
              <div class="border border-slate-200 rounded p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs bg-slate-50/50">
                <div class="space-y-1 max-w-md font-normal">
                  <div class="font-bold text-slate-800">Post-Submission Online Modification Window:</div>
                  <p class="text-[11px] text-slate-600 leading-normal">
                    Applicants can modify their submitted EOI online up to 3 times before the official tender deadline: 30 September 2026, 23:59:59 IST.
                  </p>
                  <div class="font-bold text-slate-800 text-[11px]">
                    EOI Reference: EOI-MMKVY-2026-01
                  </div>
                </div>
                <div class="border-2 border-[#0B3558] px-5 py-3 rounded text-center shrink-0">
                  <div class="font-bold text-[#0B3558] text-xs tracking-wider">
                    RSLDC ISMS 2.0 PORTAL
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class TenderStatusComponent {
  searchQuery = '';
  activeFilter = signal<string>('All');
  selectedReceiptTender = signal<SubmittedTender | null>(null);

  /**
   * Updated items matching Screenshot 1 and requirements:
   * - Simple non-bold text
   * - Row 3 has both Submitted Status & EOI Status as 'Technical Evaluation'
   */
  readonly tenders: SubmittedTender[] = [
    {
      id: 't-1',
      appRef: 'ISMS-EOI-2026-9871',
      appliedDate: '08-Sep-2026',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdAmount: '₹50,000',
      processingFee: '₹2,000',
      transactionRef: 'TXN-ISMS-884920482',
      submittedStatus: 'Submitted',
      eoiStatus: 'Technical Opening'
    },
    {
      id: 't-2',
      appRef: 'ISMS-EOI-2026-8819',
      appliedDate: '24-Aug-2026',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (Category I: RAJKVIK)',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdAmount: '₹50,000',
      processingFee: '₹2,000',
      transactionRef: 'TXN-ACC-994182914',
      submittedStatus: 'Accepted',
      eoiStatus: 'AOC'
    },
    {
      id: 't-3',
      appRef: 'ISMS-EOI-2026-6412',
      appliedDate: '14-Jul-2026',
      schemeTitle: 'SAMARTH Skill Development Scheme (Special Trades)',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdAmount: '₹35,000',
      processingFee: '₹2,000',
      transactionRef: 'TXN-UPI-771520031',
      submittedStatus: 'Technical Evaluation',
      eoiStatus: 'Technical Evaluation'
    },
    {
      id: 't-4',
      appRef: 'ISMS-EOI-2025-4109',
      appliedDate: '20-Nov-2025',
      schemeTitle: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
      department: 'Ministry of Rural Development / RSLDC',
      emdAmount: '₹25,000',
      processingFee: '₹2,000',
      transactionRef: 'TXN-ISMS-330102749',
      submittedStatus: 'Rejected',
      eoiStatus: 'AOC'
    },
    {
      id: 't-5',
      appRef: 'ISMS-EOI-2026-5520',
      appliedDate: '12-Sep-2026',
      schemeTitle: 'Rajasthan Yuva Sambal Yojana (RYSY) - Self-Employment Skilling',
      department: 'Directorate of Skill Development',
      emdAmount: '₹40,000',
      processingFee: '₹2,000',
      transactionRef: 'TXN-NET-661520410',
      submittedStatus: 'Submitted',
      eoiStatus: 'Technical Opening'
    }
  ];

  readonly filteredTenders = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery.trim().toLowerCase();

    return this.tenders.filter(t => {
      const matchFilter =
        filter === 'All' ||
        t.submittedStatus === filter ||
        t.eoiStatus === filter;

      const matchQuery = !query ||
        t.appRef.toLowerCase().includes(query) ||
        t.schemeTitle.toLowerCase().includes(query) ||
        t.department.toLowerCase().includes(query) ||
        t.submittedStatus.toLowerCase().includes(query) ||
        t.eoiStatus.toLowerCase().includes(query) ||
        t.transactionRef.toLowerCase().includes(query);

      return matchFilter && matchQuery;
    });
  });

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  countBySubmitted(status: string): number {
    return this.tenders.filter(t => t.submittedStatus === status).length;
  }

  countByEoi(status: string): number {
    return this.tenders.filter(t => t.eoiStatus === status).length;
  }

  openReceipt(tender: SubmittedTender): void {
    this.selectedReceiptTender.set(tender);
  }

  /**
   * Generates downloadable/printable official submission receipt matching Screenshot 2
   */
  downloadReceipt(tender?: SubmittedTender): void {
    const currentTender = tender || this.selectedReceiptTender();
    if (!currentTender) return;

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EOI Submission Receipt - ${currentTender.appRef}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; }
            body { margin: 0; padding: 24px; background: #ffffff; color: #1e293b; font-size: 13px; line-height: 1.5; }
            .receipt-container { max-width: 820px; margin: 0 auto; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { background: #0d2342; color: #ffffff; padding: 20px 24px; border-bottom: 4px solid #f59e0b; }
            .state-title { color: #f59e0b; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
            .dept-title { color: #cbd5e1; font-size: 12px; margin-top: 2px; }
            .system-title { color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 0.02em; margin-top: 6px; }
            .sub-title { color: #e2e8f0; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 4px; }
            .content { padding: 20px 24px; }
            .ref-card { background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
            .ref-label { font-size: 11px; color: #0b3558; font-weight: 600; }
            .ref-value { font-size: 15px; color: #0b3558; font-weight: 800; font-family: monospace; }
            .section { margin-bottom: 20px; }
            .section-header { background: #e8f1fd; border: 1px solid #bfdbfe; padding: 7px 12px; font-size: 12px; font-weight: 700; color: #0b3558; text-transform: uppercase; }
            .section-body { border: 1px solid #e2e8f0; border-top: none; padding: 14px; font-size: 12px; }
            .grid-row { display: flex; margin-bottom: 8px; }
            .grid-label { width: 180px; color: #64748b; font-weight: 500; }
            .grid-value { color: #1e293b; font-weight: 500; flex: 1; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #f8fafc; border-bottom: 1px solid #cbd5e1; text-align: left; padding: 8px 10px; font-size: 11px; color: #475569; font-weight: 600; }
            td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
            .total-row { background: #f0f7ff; font-weight: 700; color: #0b3558; }
            .doc-item { display: flex; justify-content: space-between; padding: 4px 0; }
            .check-green { color: #16a34a; font-weight: 700; }
            .footer-box { border: 1px solid #cbd5e1; background: #f8fafc; padding: 14px; display: flex; justify-content: space-between; align-items: center; border-radius: 4px; }
            .stamp-box { border: 2px solid #0b3558; padding: 10px 16px; text-align: center; color: #0b3558; font-weight: 800; font-size: 12px; }
            @media print {
              body { padding: 0; }
              .receipt-container { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="state-title">GOVERNMENT OF RAJASTHAN</div>
              <div class="dept-title">Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)</div>
              <div class="system-title">ISMS 2.0 - INTEGRATED SCHEME MANAGEMENT SYSTEM</div>
              <div class="sub-title">EOI APPLICATION SUBMISSION RECEIPT &amp; ACKNOWLEDGEMENT</div>
            </div>
            <div class="content">
              <div class="ref-card">
                <div>
                  <div class="ref-label">Application Reference No:</div>
                  <div class="ref-value">${currentTender.appRef}</div>
                </div>
                <div>
                  <div class="ref-label">Acknowledgement No:</div>
                  <div style="font-weight: 600; color: #1e293b; font-size: 13px;">ACK-RSLDC-${currentTender.appRef.replace('ISMS-EOI-', '')}</div>
                </div>
                <div>
                  <div class="ref-label">Submission Timestamp:</div>
                  <div style="font-size: 12px; color: #334155;">${currentTender.appliedDate}, 03:45 PM IST</div>
                </div>
              </div>

              <div class="section">
                <div class="section-header">1. APPLICANT &amp; TRAINING PROVIDER INFORMATION</div>
                <div class="section-body">
                  <div class="grid-row">
                    <div class="grid-label">Organization Full Name:</div>
                    <div class="grid-value">Apex Skill Development Foundation</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">Registration / Trust No:</div>
                    <div class="grid-value">REG/RAJ/2018/88921 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong style="color:#64748b; font-weight:500;">Entity PAN:</strong> AAACA1234C</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">Authorized Signatory:</div>
                    <div class="grid-value">Rajesh Kumar Sharma (Managing Director &amp; CEO)</div>
                  </div>
                  <div class="grid-row" style="margin-bottom: 0;">
                    <div class="grid-label">Official Contact:</div>
                    <div class="grid-value">9829012345 &nbsp;|&nbsp; contact@apexskills.org</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-header">2. MANDATORY FEE PAYMENT &amp; TRANSACTION DETAILS</div>
                <div class="section-body" style="padding: 0;">
                  <table>
                    <thead>
                      <tr>
                        <th>Fee Description</th>
                        <th>Accounting Head</th>
                        <th>Payment Status</th>
                        <th style="text-align: right;">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>EOI Proposal Processing Fee (Non-Refundable)</td>
                        <td style="font-family: monospace; font-size: 11px;">RSLDC-FEE-PROC-2026</td>
                        <td style="color: #16a34a; font-weight: 700;">SUCCESSFUL / PAID</td>
                        <td style="text-align: right; font-weight: 600;">Rs. 2,000</td>
                      </tr>
                      <tr>
                        <td>Earnest Money Deposit (EMD)</td>
                        <td style="font-family: monospace; font-size: 11px;">RSLDC-EMD-SEC-2026</td>
                        <td style="color: #16a34a; font-weight: 700;">SUCCESSFUL / PAID</td>
                        <td style="text-align: right; font-weight: 600;">Rs. 50,000</td>
                      </tr>
                      <tr class="total-row">
                        <td colspan="3">Total Amount Received &amp; Realized in RSLDC Account:</td>
                        <td style="text-align: right; font-size: 14px;">Rs. 52,000</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style="padding: 10px 14px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 12px;">
                    <div><span style="color: #64748b;">Gateway Transaction ID:</span> <strong>${currentTender.transactionRef || 'TXN-ISMS-884920482'}</strong></div>
                    <div><span style="color: #64748b;">Payment Method:</span> <strong>Net Banking</strong></div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-header">3. VERIFIED PROPOSAL DOCUMENTS &amp; SUBMISSION CHECKLIST</div>
                <div class="section-body">
                  <div class="doc-item">
                    <span class="check-green">[V] 1. Company / Entity Registration Certificate</span>
                    <span style="color: #64748b; font-family: monospace; font-size: 11px;">company_registration_incorporation_proof.pdf</span>
                  </div>
                  <div class="doc-item">
                    <span class="check-green">[V] 2. Past Skill Training Experience Certificates</span>
                    <span style="color: #64748b; font-family: monospace; font-size: 11px;">previous_training_experience_certificates.pdf</span>
                  </div>
                  <div class="doc-item">
                    <span class="check-green">[V] 3. CA Certified Annual Turnover (Last 3 FY)</span>
                    <span style="color: #64748b; font-family: monospace; font-size: 11px;">ca_certified_turnover_certificate_last_3_fy.pdf</span>
                  </div>
                  <div class="doc-item" style="padding-bottom: 0;">
                    <span class="check-green">[V] 4. Technical Proposal &amp; Action Plan 2025-26</span>
                    <span style="color: #64748b; font-family: monospace; font-size: 11px;">technical_proposal_methodology_2025_26.pdf</span>
                  </div>
                </div>
              </div>

              <div class="footer-box">
                <div style="max-width: 500px;">
                  <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">Post-Submission Online Modification Window:</div>
                  <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">Applicants can modify their submitted EOI online up to 3 times before the official tender deadline: 30 September 2026, 23:59:59 IST.</div>
                  <div style="font-weight: 700; color: #0b3558; font-size: 11px;">EOI Reference: EOI-MMKVY-2026-01</div>
                </div>
                <div class="stamp-box">
                  RSLDC ISMS 2.0 PORTAL
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

