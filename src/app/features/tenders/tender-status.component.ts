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
  submittedStatus: 'Submitted' | 'Accepted' | 'Rejected';
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
        <p class="text-xs sm:text-[13px] text-slate-500 font-medium">
          Real-time technical scrutiny progress, EOI submission stages, and empanelment outcomes for your submitted EOI tenders.
        </p>
      </div>

      <!-- Filter Controls & Search Toolbar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        
        <!-- Status Filter Badges / Pills -->
        <div class="flex items-center gap-1.5 flex-wrap">
          
          <!-- All -->
          <button
            type="button"
            (click)="setFilter('All')"
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'All'"
            [class.text-white]="activeFilter() === 'All'"
            [class.bg-slate-100]="activeFilter() !== 'All'"
            [class.text-slate-700]="activeFilter() !== 'All'"
            [class.hover:bg-slate-200]="activeFilter() !== 'All'"
          >
            <span>All</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [ngClass]="{'bg-white/20 text-white': activeFilter() === 'All', 'bg-slate-200 text-slate-700': activeFilter() !== 'All'}"
            >
              {{ tenders.length }}
            </span>
          </button>

          <!-- Submitted -->
          <button
            type="button"
            (click)="setFilter('Submitted')"
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'Submitted'"
            [class.text-white]="activeFilter() === 'Submitted'"
            [class.bg-slate-100]="activeFilter() !== 'Submitted'"
            [class.text-slate-700]="activeFilter() !== 'Submitted'"
            [class.hover:bg-slate-200]="activeFilter() !== 'Submitted'"
          >
            <span>Submitted</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [ngClass]="{'bg-white/20 text-white': activeFilter() === 'Submitted', 'bg-slate-200 text-slate-700': activeFilter() !== 'Submitted'}"
            >
              {{ countBySubmitted('Submitted') }}
            </span>
          </button>

          <!-- Accepted -->
          <button
            type="button"
            (click)="setFilter('Accepted')"
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'Accepted'"
            [class.text-white]="activeFilter() === 'Accepted'"
            [class.bg-slate-100]="activeFilter() !== 'Accepted'"
            [class.text-slate-700]="activeFilter() !== 'Accepted'"
            [class.hover:bg-slate-200]="activeFilter() !== 'Accepted'"
          >
            <span>Accepted</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [ngClass]="{'bg-white/20 text-white': activeFilter() === 'Accepted', 'bg-slate-200 text-slate-700': activeFilter() !== 'Accepted'}"
            >
              {{ countBySubmitted('Accepted') }}
            </span>
          </button>

          <!-- Technical Opening -->
          <button
            type="button"
            (click)="setFilter('Technical Opening')"
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'Technical Opening'"
            [class.text-white]="activeFilter() === 'Technical Opening'"
            [class.bg-slate-100]="activeFilter() !== 'Technical Opening'"
            [class.text-slate-700]="activeFilter() !== 'Technical Opening'"
            [class.hover:bg-slate-200]="activeFilter() !== 'Technical Opening'"
          >
            <span>Technical Opening</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [ngClass]="{'bg-white/20 text-white': activeFilter() === 'Technical Opening', 'bg-slate-200 text-slate-700': activeFilter() !== 'Technical Opening'}"
            >
              {{ countByEoi('Technical Opening') }}
            </span>
          </button>

          <!-- Technical Evaluation -->
          <button
            type="button"
            (click)="setFilter('Technical Evaluation')"
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'Technical Evaluation'"
            [class.text-white]="activeFilter() === 'Technical Evaluation'"
            [class.bg-slate-100]="activeFilter() !== 'Technical Evaluation'"
            [class.text-slate-700]="activeFilter() !== 'Technical Evaluation'"
            [class.hover:bg-slate-200]="activeFilter() !== 'Technical Evaluation'"
          >
            <span>Technical Evaluation</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [ngClass]="{'bg-white/20 text-white': activeFilter() === 'Technical Evaluation', 'bg-slate-200 text-slate-700': activeFilter() !== 'Technical Evaluation'}"
            >
              {{ countByEoi('Technical Evaluation') }}
            </span>
          </button>

          <!-- AOC -->
          <button
            type="button"
            (click)="setFilter('AOC')"
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'AOC'"
            [class.text-white]="activeFilter() === 'AOC'"
            [class.bg-slate-100]="activeFilter() !== 'AOC'"
            [class.text-slate-700]="activeFilter() !== 'AOC'"
            [class.hover:bg-slate-200]="activeFilter() !== 'AOC'"
          >
            <span>AOC</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [ngClass]="{'bg-white/20 text-white': activeFilter() === 'AOC', 'bg-slate-200 text-slate-700': activeFilter() !== 'AOC'}"
            >
              {{ countByEoi('AOC') }}
            </span>
          </button>

          <!-- Rejected -->
          <button
            type="button"
            (click)="setFilter('Rejected')"
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            [class.bg-[#0B3558]]="activeFilter() === 'Rejected'"
            [class.text-white]="activeFilter() === 'Rejected'"
            [class.bg-slate-100]="activeFilter() !== 'Rejected'"
            [class.text-slate-700]="activeFilter() !== 'Rejected'"
            [class.hover:bg-slate-200]="activeFilter() !== 'Rejected'"
          >
            <span>Rejected</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [ngClass]="{'bg-white/20 text-white': activeFilter() === 'Rejected', 'bg-slate-200 text-slate-700': activeFilter() !== 'Rejected'}"
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
            class="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B3558] focus:bg-white transition-all shadow-2xs font-medium"
          />
          @if (searchQuery) {
            <button
              type="button"
              (click)="searchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              &times;
            </button>
          }
        </div>

      </div>

      <!-- Main Status Table (EMD Column Removed, SUBMITTED STATUS & EOI STATUS Columns Added) -->
      <div class="border border-slate-200 rounded-lg overflow-hidden overflow-x-auto shadow-2xs">
        <table class="w-full text-left border-collapse text-xs">
          <!-- Dark Navy Table Header with gold accent line -->
          <thead>
            <tr class="bg-[#0B3558] text-white text-[11px] font-bold uppercase tracking-wider select-none border-b-2 border-amber-500">
              <th class="py-3 px-4 w-52 border-r border-[#1a4a74]">APPLICATION REF &amp; DATE</th>
              <th class="py-3 px-4 border-r border-[#1a4a74]">SCHEME &amp; DEPARTMENT</th>
              <th class="py-3 px-3 w-40 text-center border-r border-[#1a4a74]">SUBMITTED STATUS</th>
              <th class="py-3 px-3 w-48 text-center border-r border-[#1a4a74]">EOI STATUS</th>
              <th class="py-3 px-3 w-32 text-center">ACTIONS</th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-slate-200 bg-white font-medium">
            @for (tender of filteredTenders(); track tender.id) {
              <tr class="hover:bg-blue-50/20 transition-colors">
                
                <!-- Column 1: Application Ref & Date -->
                <td class="py-4 px-4 align-top">
                  <div class="flex items-center gap-1.5 group cursor-pointer" (click)="viewTenderDetails(tender)">
                    <span class="font-mono font-bold text-slate-900 group-hover:text-[#0B3558] transition-colors">
                      {{ tender.appRef }}
                    </span>
                    <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0B3558] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Applied: {{ tender.appliedDate }}</span>
                  </div>
                </td>

                <!-- Column 2: Scheme & Department -->
                <td class="py-4 px-4 align-top">
                  <h3 class="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                    {{ tender.schemeTitle }}
                  </h3>
                  <p class="text-[11px] text-slate-500 mt-1 font-medium">
                    {{ tender.department }}
                  </p>
                </td>

                <!-- Column 3: SUBMITTED STATUS -->
                <td class="py-4 px-3 align-top text-center">
                  @switch (tender.submittedStatus) {
                    @case ('Submitted') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Submitted
                      </span>
                    }
                    @case ('Accepted') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <svg class="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Accepted
                      </span>
                    }
                    @case ('Rejected') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                        <svg class="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rejected
                      </span>
                    }
                  }
                </td>

                <!-- Column 4: EOI STATUS -->
                <td class="py-4 px-3 align-top text-center">
                  @switch (tender.eoiStatus) {
                    @case ('Technical Opening') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
                        <svg class="w-3 h-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Technical Opening
                      </span>
                    }
                    @case ('Technical Evaluation') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-300">
                        <svg class="w-3 h-3 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Technical Evaluation
                      </span>
                    }
                    @case ('AOC') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300">
                        <svg class="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        AOC
                      </span>
                    }
                  }
                </td>

                <!-- Column 5: Actions -->
                <td class="py-4 px-3 align-top text-center">
                  <button
                    type="button"
                    (click)="openReceipt(tender)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    <svg class="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Receipt PDF</span>
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
                    <p class="text-xs font-bold text-slate-700">No tenders match your filter criteria.</p>
                    <p class="text-[11px] text-slate-400">Try clearing your search query or selecting a different status tab.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Receipt Preview Modal -->
      @if (selectedReceiptTender(); as receipt) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div class="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 overflow-hidden">
            <!-- Top Header Accent -->
            <div class="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#0B3558] via-amber-500 to-[#0B3558]"></div>

            <div class="flex items-start justify-between">
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider text-[#0B3558] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Official E-Treasury Receipt (e-GRAS)
                </span>
                <h2 class="text-base font-black text-slate-900 mt-1">
                  Government of Rajasthan &bull; Finance Department
                </h2>
              </div>
              <button
                type="button"
                (click)="selectedReceiptTender.set(null)"
                class="text-slate-400 hover:text-slate-700 p-1 cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <!-- Receipt Card Details -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div class="flex justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 font-medium">Application Ref:</span>
                <span class="font-mono font-bold text-slate-900">{{ receipt.appRef }}</span>
              </div>
              <div class="flex justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 font-medium">Scheme:</span>
                <span class="font-bold text-slate-900 text-right max-w-[240px]">{{ receipt.schemeTitle }}</span>
              </div>
              <div class="flex justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 font-medium">Submitted Status:</span>
                <span class="font-bold text-slate-800">{{ receipt.submittedStatus }}</span>
              </div>
              <div class="flex justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 font-medium">EOI Status:</span>
                <span class="font-bold text-[#0B3558]">{{ receipt.eoiStatus }}</span>
              </div>
              <div class="flex justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 font-medium">Bank Transaction Ref:</span>
                <span class="font-mono text-slate-700">{{ receipt.transactionRef }}</span>
              </div>
              <div class="flex justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 font-medium">Date &amp; Time:</span>
                <span class="text-slate-700">{{ receipt.appliedDate }} 14:22 IST</span>
              </div>
              <div class="flex justify-between pt-1 font-bold text-sm">
                <span class="text-slate-800">Total Paid (EMD + Fee):</span>
                <span class="text-[#0B3558]">{{ receipt.emdAmount }} + {{ receipt.processingFee }}</span>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="printReceipt()"
                class="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 cursor-pointer transition-colors"
              >
                Print Receipt
              </button>
              <button
                type="button"
                (click)="downloadReceipt()"
                class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download PDF</span>
              </button>
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

  /** Exact updated items: EMD column removed, Submitted Status & EOI Status mapped as requested */
  readonly tenders: SubmittedTender[] = [
    {
      id: 't-1',
      appRef: 'ISMS-EOI-2026-9871',
      appliedDate: '08-Sep-2026',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdAmount: '₹50,000',
      processingFee: '₹2,000',
      transactionRef: 'TXN-ISMS-004520402',
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
      submittedStatus: 'Accepted',
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

  viewTenderDetails(tender: SubmittedTender): void {
    this.openReceipt(tender);
  }

  openReceipt(tender: SubmittedTender): void {
    this.selectedReceiptTender.set(tender);
  }

  printReceipt(): void {
    window.print();
  }

  downloadReceipt(): void {
    alert(`Downloading E-Treasury Receipt for ${this.selectedReceiptTender()?.appRef}`);
  }
}

