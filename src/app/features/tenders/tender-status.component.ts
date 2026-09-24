import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PageHeaderComponent,
  TableComponent,
  ButtonComponent,
  TableColumn
} from '../../shared';

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
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent
  ],
  template: `
    <div class="w-full min-h-full bg-[#F5F7F9] text-[#1F2933] font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Tender Status"
        ></app-page-header>

        <!-- Filter Controls & Search Toolbar -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          
          <!-- Status Filter Badges / Pills -->
          <div class="flex items-center gap-1.5 flex-wrap">
            @for (f of filterOptions(); track f.id) {
              <button
                type="button"
                (click)="setFilter(f.id)"
                class="px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
                [class.bg-[#174A6E]]="activeFilter() === f.id"
                [class.text-white]="activeFilter() === f.id"
                [class.border-[#174A6E]]="activeFilter() === f.id"
                [class.bg-white]="activeFilter() !== f.id"
                [class.text-[#5F6B76]]="activeFilter() !== f.id"
                [class.border-[#D9E1E7]]="activeFilter() !== f.id"
                [class.hover:bg-[#EAF2F6]]="activeFilter() !== f.id"
                [class.hover:text-[#174A6E]]="activeFilter() !== f.id"
              >
                <span>{{ f.label }}</span>
                <span
                  class="px-1.5 py-0.2 rounded-full text-[10px]"
                  [class.bg-white/20]="activeFilter() === f.id"
                  [class.text-white]="activeFilter() === f.id"
                  [class.bg-[#F5F7F9]]="activeFilter() !== f.id"
                  [class.text-[#5F6B76]]="activeFilter() !== f.id"
                >
                  {{ f.count }}
                </span>
              </button>
            }
          </div>

          <!-- Search Input with Search Icon -->
          <div class="relative w-full sm:w-64">
            <svg class="w-3.5 h-3.5 text-[#7A8792] absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Search Ref, Scheme, Department..."
              class="w-full pl-8 pr-7 py-1.5 text-[13px] bg-white border border-[#D9E1E7] rounded-[4px] text-[#1F2933] placeholder:text-[#7A8792] focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E] transition-colors font-normal"
            />
            @if (searchQuery) {
              <button
                type="button"
                (click)="searchQuery = ''; onSearchChange()"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                &times;
              </button>
            }
          </div>

        </div>

        <!-- Main Status Table via Reusable TableComponent -->
        <app-table
          [columns]="tenderColumns"
          [data]="filteredTenders()"
          [pagination]="true"
          [pageSize]="pageSize"
          emptyMessage="No applications match your filter criteria."
          [customTemplates]="{
            appRef: appRefTemplate,
            department: deptTemplate,
            view: viewTemplate
          }"
        >
        </app-table>

        <ng-template #appRefTemplate let-tender>
          <button
            type="button"
            (click)="openReceipt(tender)"
            class="hover:text-[#0B3558] hover:underline cursor-pointer text-left inline-flex items-center gap-1 font-normal text-slate-800 transition-colors"
            title="View Submission Details"
          >
            <span>{{ tender.appRef }}</span>
            <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </ng-template>

        <ng-template #deptTemplate let-tender>
          <span class="line-clamp-2 text-slate-600 text-[11px] leading-relaxed">{{ tender.department }}</span>
        </ng-template>

        <ng-template #viewTemplate let-tender>
          <app-button
            variant="pdf-view"
            size="sm"
            (btnClick)="openReceipt(tender)"
            title="View Receipt PDF"
          >
            View
          </app-button>
        </ng-template>

      </div>

      <!-- Receipt Preview Modal -->
      @if (selectedReceiptTender(); as receipt) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 font-sans"
          role="dialog"
          aria-modal="true"
        >
          <div class="relative max-w-3xl w-full bg-white rounded-lg shadow-xl border border-slate-300 overflow-hidden my-auto max-h-[95vh] flex flex-col">
            
            <!-- Top Controls Bar -->
            <div class="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span class="text-xs font-medium text-slate-700">Official Submission Receipt &bull; {{ receipt.appRef }}</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="downloadReceipt(receipt)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-xs font-normal cursor-pointer shadow-2xs transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  (click)="downloadReceipt(receipt)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-xs font-normal cursor-pointer shadow-2xs transition-colors"
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

            <!-- Scrollable Receipt Content -->
            <div class="overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs font-sans bg-white">
              
              <!-- 1. Government Header Banner (Navy Blue with Orange Border) -->
              <div class="bg-[#0d2342] text-white p-4 sm:p-5 rounded-t-lg border-b-4 border-amber-500">
                <div class="text-[#f59e0b] font-medium text-xs uppercase tracking-wider">
                  GOVERNMENT OF RAJASTHAN
                </div>
                <div class="text-xs text-slate-300 font-normal mt-0.5">
                  Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)
                </div>
                <h2 class="text-base sm:text-lg font-semibold text-white tracking-wide mt-1">
                  ISMS 2.0 - INTEGRATED SCHEME MANAGEMENT SYSTEM
                </h2>
                <div class="text-[11px] text-slate-200 uppercase tracking-widest mt-0.5 font-normal">
                  EOI APPLICATION SUBMISSION RECEIPT &amp; ACKNOWLEDGEMENT
                </div>
              </div>

              <!-- 2. Blue Details Box -->
              <div class="bg-[#f0f7ff] border border-[#bfdbfe] rounded-md p-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <span class="text-[#0B3558] font-medium block text-[11px]">Application Reference No:</span>
                  <span class="text-xs sm:text-sm font-semibold text-[#0B3558] font-mono">{{ receipt.appRef }}</span>
                </div>
                <div>
                  <span class="text-[#0B3558] font-medium block text-[11px]">Acknowledgement No:</span>
                  <span class="text-xs font-normal text-slate-800 font-mono">ACK-RSLDC-{{ receipt.appRef.replace('ISMS-EOI-', '') }}</span>
                </div>
                <div>
                  <span class="text-[#0B3558] font-medium block text-[11px]">Submission Timestamp:</span>
                  <span class="text-xs text-slate-800">{{ receipt.appliedDate }}, 03:45 PM IST</span>
                </div>
              </div>

              <!-- 3. Section 1: APPLICANT & TRAINING PROVIDER INFORMATION -->
              <div class="border border-slate-200 rounded overflow-hidden">
                <div class="bg-[#e8f1fd] border-b border-[#bfdbfe] px-3 py-1.5 text-xs font-medium text-[#0B3558] uppercase">
                  1. APPLICANT &amp; TRAINING PROVIDER INFORMATION
                </div>
                <div class="p-3 space-y-1.5 text-xs font-normal bg-white">
                  <div class="flex flex-col sm:flex-row">
                    <span class="text-slate-500 font-normal sm:w-48 shrink-0">Organization Full Name:</span>
                    <span class="text-slate-900 font-normal">Apex Skill Development Foundation</span>
                  </div>
                  <div class="flex flex-col sm:flex-row">
                    <span class="text-slate-500 font-normal sm:w-48 shrink-0">Registration / Trust No:</span>
                    <span class="text-slate-900 font-normal flex-1">
                      REG/RAJ/2018/88921 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <span class="text-slate-500 font-normal">Entity PAN:</span>
                      <span class="font-mono text-slate-900 ml-1">AAACA1234C</span>
                    </span>
                  </div>
                  <div class="flex flex-col sm:flex-row">
                    <span class="text-slate-500 font-normal sm:w-48 shrink-0">Authorized Signatory:</span>
                    <span class="text-slate-900 font-normal">Rajesh Kumar Sharma (Managing Director &amp; CEO)</span>
                  </div>
                  <div class="flex flex-col sm:flex-row">
                    <span class="text-slate-500 font-normal sm:w-48 shrink-0">Official Contact:</span>
                    <span class="text-slate-900 font-normal">9829012345 &nbsp;|&nbsp; contact&#64;apexskills.org</span>
                  </div>
                </div>
              </div>

              <!-- 4. Section 2: MANDATORY FEE PAYMENT & TRANSACTION DETAILS -->
              <div class="border border-slate-200 rounded overflow-hidden">
                <div class="bg-[#e8f1fd] border-b border-[#bfdbfe] px-3 py-1.5 text-xs font-medium text-[#0B3558] uppercase">
                  2. MANDATORY FEE PAYMENT &amp; TRANSACTION DETAILS
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left">
                    <thead class="bg-slate-50 border-b border-slate-200 text-[11px] font-medium text-slate-700">
                      <tr>
                        <th class="py-1.5 px-3">Fee Description</th>
                        <th class="py-1.5 px-2.5">Accounting Head</th>
                        <th class="py-1.5 px-2.5">Payment Status</th>
                        <th class="py-1.5 px-3 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
                      <tr>
                        <td class="py-1.5 px-3">EOI Proposal Processing Fee (Non-Refundable)</td>
                        <td class="py-1.5 px-2.5 font-mono text-[11px]">RSLDC-FEE-PROC-2026</td>
                        <td class="py-1.5 px-2.5 text-emerald-600 font-normal">SUCCESSFUL / PAID</td>
                        <td class="py-1.5 px-3 text-right">Rs. 2,000</td>
                      </tr>
                      <tr>
                        <td class="py-1.5 px-3">Earnest Money Deposit (EMD)</td>
                        <td class="py-1.5 px-2.5 font-mono text-[11px]">RSLDC-EMD-SEC-2026</td>
                        <td class="py-1.5 px-2.5 text-emerald-600 font-normal">SUCCESSFUL / PAID</td>
                        <td class="py-1.5 px-3 text-right">Rs. 50,000</td>
                      </tr>
                      <tr class="bg-blue-50/60 font-medium text-[#0B3558]">
                        <td colspan="3" class="py-2 px-3">Total Amount Received &amp; Realized in RSLDC Account:</td>
                        <td class="py-2 px-3 text-right text-xs font-semibold">Rs. 52,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="p-2.5 border-t border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                  <div>
                    <span class="text-slate-500">Gateway Transaction ID:</span>
                    <span class="font-normal text-slate-800 font-mono ml-1">{{ receipt.transactionRef || 'TXN-ISMS-884920482' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500">Payment Method:</span>
                    <span class="font-normal text-slate-800 ml-1">Net Banking</span>
                  </div>
                </div>
              </div>

              <!-- 5. Section 3: VERIFIED PROPOSAL DOCUMENTS & SUBMISSION CHECKLIST -->
              <div class="border border-slate-200 rounded overflow-hidden">
                <div class="bg-[#e8f1fd] border-b border-[#bfdbfe] px-3 py-1.5 text-xs font-medium text-[#0B3558] uppercase">
                  3. VERIFIED PROPOSAL DOCUMENTS &amp; SUBMISSION CHECKLIST
                </div>
                <div class="p-3 space-y-1.5 text-xs bg-white font-normal">
                  <div class="flex items-center justify-between">
                    <span class="text-emerald-700 font-normal">[✓] 1. Company / Entity Registration Certificate</span>
                    <span class="text-slate-500 font-mono text-[11px]">company_registration_incorporation_proof.pdf</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-emerald-700 font-normal">[✓] 2. Past Skill Training Experience Certificates</span>
                    <span class="text-slate-500 font-mono text-[11px]">previous_training_experience_certificates.pdf</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-emerald-700 font-normal">[✓] 3. CA Certified Annual Turnover (Last 3 FY)</span>
                    <span class="text-slate-500 font-mono text-[11px]">ca_certified_turnover_certificate_last_3_fy.pdf</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-emerald-700 font-normal">[✓] 4. Technical Proposal &amp; Action Plan 2025-26</span>
                    <span class="text-slate-500 font-mono text-[11px]">technical_proposal_methodology_2025_26.pdf</span>
                  </div>
                </div>
              </div>

              <!-- 6. Footer Modification Window & Portal Box -->
              <div class="border border-slate-200 rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-50/50">
                <div class="space-y-0.5 max-w-md font-normal">
                  <div class="font-medium text-slate-800">Post-Submission Online Modification Window:</div>
                  <p class="text-[11px] text-slate-600 leading-normal">
                    Applicants can modify their submitted EOI online up to 3 times before the official tender deadline: 30 September 2026, 23:59:59 IST.
                  </p>
                  <div class="font-medium text-slate-800 text-[11px]">
                    EOI Reference: EOI-MMKVY-2026-01
                  </div>
                </div>
                <div class="border border-[#0B3558] px-4 py-2 rounded text-center shrink-0">
                  <div class="font-medium text-[#0B3558] text-xs tracking-wider">
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
  readonly Math = Math;
  searchQuery = '';
  activeFilter = signal<string>('All');
  currentPage = signal<number>(1);
  readonly pageSize = 6;
  selectedReceiptTender = signal<SubmittedTender | null>(null);

  readonly tenderColumns: TableColumn<SubmittedTender>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'appRef', label: 'Application Ref. No.', cellClass: 'whitespace-nowrap font-normal text-slate-800', type: 'custom' },
    { key: 'schemeTitle', label: 'Scheme Name', cellClass: 'whitespace-nowrap font-medium text-slate-800' },
    { key: 'department', label: 'Department', width: 'min-w-[200px] max-w-sm', type: 'custom' },
    { key: 'appliedDate', label: 'Applied Date', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'submittedStatus', label: 'Submitted Status', align: 'center', type: 'status' },
    { key: 'eoiStatus', label: 'EOI Status', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'view', label: 'View', align: 'center', width: 'w-20', type: 'custom' }
  ];

  /**
   * Sample submitted applications
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
    },
    {
      id: 't-6',
      appRef: 'ISMS-EOI-2026-3391',
      appliedDate: '28-Jun-2026',
      schemeTitle: 'PMKVY 4.0 Special Projects - Tribal Youth Empowerment',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdAmount: '₹50,000',
      processingFee: '₹2,000',
      transactionRef: 'TXN-UPI-992144510',
      submittedStatus: 'Accepted',
      eoiStatus: 'Technical Evaluation'
    },
    {
      id: 't-7',
      appRef: 'ISMS-EOI-2026-2184',
      appliedDate: '15-May-2026',
      schemeTitle: 'Indira Gandhi Urban Credit & Skilling Mission',
      department: 'Department of Local Self Government (LSG)',
      emdAmount: '₹30,000',
      processingFee: '₹2,000',
      transactionRef: 'TXN-NET-441029381',
      submittedStatus: 'Technical Evaluation',
      eoiStatus: 'Technical Opening'
    },
    {
      id: 't-8',
      appRef: 'ISMS-EOI-2026-1092',
      appliedDate: '02-Apr-2026',
      schemeTitle: 'Mukhyamantri Hunar Vikas Yojana for Differently Abled',
      department: 'Social Justice and Empowerment Department',
      emdAmount: '₹20,000',
      processingFee: '₹2,000',
      transactionRef: 'TXN-ISMS-110293847',
      submittedStatus: 'Accepted',
      eoiStatus: 'AOC'
    }
  ];

  readonly filterOptions = computed(() => [
    { id: 'All', label: 'All', count: this.tenders.length },
    { id: 'Submitted', label: 'Submitted', count: this.countBySubmitted('Submitted') },
    { id: 'Accepted', label: 'Accepted', count: this.countBySubmitted('Accepted') },
    { id: 'Technical Opening', label: 'Technical Opening', count: this.countByEoi('Technical Opening') },
    { id: 'Technical Evaluation', label: 'Technical Evaluation', count: this.countByEoi('Technical Evaluation') },
    { id: 'AOC', label: 'AOC', count: this.countByEoi('AOC') },
    { id: 'Rejected', label: 'Rejected', count: this.countBySubmitted('Rejected') }
  ]);

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

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredTenders().length / this.pageSize));
  });

  readonly totalPagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  readonly paginatedTenders = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTenders().slice(startIndex, startIndex + this.pageSize);
  });

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  onSearchChange(): void {
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  countBySubmitted(status: string): number {
    return this.tenders.filter(t => t.submittedStatus === status).length;
  }

  countByEoi(status: string): number {
    return this.tenders.filter(t => t.eoiStatus === status).length;
  }

  getSubmittedStatusClass(status: string): string {
    if (status === 'Accepted') return 'text-emerald-700 font-normal';
    if (status === 'Rejected') return 'text-rose-600 font-normal';
    return 'text-slate-700 font-normal';
  }

  openReceipt(tender: SubmittedTender): void {
    this.selectedReceiptTender.set(tender);
  }

  /**
   * Generates downloadable/printable official submission receipt
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
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; }
            body { margin: 0; padding: 24px; background: #ffffff; color: #1e293b; font-size: 13px; line-height: 1.5; }
            .receipt-container { max-width: 820px; margin: 0 auto; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { background: #0d2342; color: #ffffff; padding: 18px 24px; border-bottom: 4px solid #f59e0b; }
            .state-title { color: #f59e0b; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
            .dept-title { color: #cbd5e1; font-size: 12px; margin-top: 2px; }
            .system-title { color: #ffffff; font-size: 17px; font-weight: 700; letter-spacing: 0.02em; margin-top: 5px; }
            .sub-title { color: #e2e8f0; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 3px; }
            .content { padding: 18px 24px; }
            .ref-card { background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
            .ref-label { font-size: 11px; color: #0b3558; font-weight: 500; }
            .ref-value { font-size: 14px; color: #0b3558; font-weight: 700; font-family: monospace; }
            .section { margin-bottom: 18px; }
            .section-header { background: #e8f1fd; border: 1px solid #bfdbfe; padding: 6px 12px; font-size: 11.5px; font-weight: 600; color: #0b3558; text-transform: uppercase; }
            .section-body { border: 1px solid #e2e8f0; border-top: none; padding: 12px 14px; font-size: 12px; }
            .grid-row { display: flex; margin-bottom: 6px; }
            .grid-label { width: 180px; color: #64748b; font-weight: 400; }
            .grid-value { color: #1e293b; font-weight: 400; flex: 1; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #f8fafc; border-bottom: 1px solid #cbd5e1; text-align: left; padding: 7px 10px; font-size: 11px; color: #475569; font-weight: 500; }
            td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
            .total-row { background: #f0f7ff; font-weight: 600; color: #0b3558; }
            .doc-item { display: flex; justify-content: space-between; padding: 4px 0; }
            .check-green { color: #16a34a; font-weight: 500; }
            .footer-box { border: 1px solid #cbd5e1; background: #f8fafc; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; border-radius: 4px; }
            .stamp-box { border: 2px solid #0b3558; padding: 8px 14px; text-align: center; color: #0b3558; font-weight: 600; font-size: 11px; }
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
                  <div style="font-weight: 500; color: #1e293b; font-size: 12.5px;">ACK-RSLDC-${currentTender.appRef.replace('ISMS-EOI-', '')}</div>
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
                    <div class="grid-value">REG/RAJ/2018/88921 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong style="color:#64748b; font-weight:400;">Entity PAN:</strong> AAACA1234C</div>
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
                        <td style="color: #16a34a; font-weight: 500;">SUCCESSFUL / PAID</td>
                        <td style="text-align: right; font-weight: 500;">Rs. 2,000</td>
                      </tr>
                      <tr>
                        <td>Earnest Money Deposit (EMD)</td>
                        <td style="font-family: monospace; font-size: 11px;">RSLDC-EMD-SEC-2026</td>
                        <td style="color: #16a34a; font-weight: 500;">SUCCESSFUL / PAID</td>
                        <td style="text-align: right; font-weight: 500;">Rs. 50,000</td>
                      </tr>
                      <tr class="total-row">
                        <td colspan="3">Total Amount Received &amp; Realized in RSLDC Account:</td>
                        <td style="text-align: right; font-size: 13px;">Rs. 52,000</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style="padding: 8px 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11.5px;">
                    <div><span style="color: #64748b;">Gateway Transaction ID:</span> <span style="font-family: monospace; font-weight: 500;">${currentTender.transactionRef || 'TXN-ISMS-884920482'}</span></div>
                    <div><span style="color: #64748b;">Payment Method:</span> <span style="font-weight: 500;">Net Banking</span></div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-header">3. VERIFIED PROPOSAL DOCUMENTS &amp; SUBMISSION CHECKLIST</div>
                <div class="section-body">
                  <div class="doc-item">
                    <span class="check-green">[✓] 1. Company / Entity Registration Certificate</span>
                    <span style="color: #64748b; font-family: monospace; font-size: 11px;">company_registration_incorporation_proof.pdf</span>
                  </div>
                  <div class="doc-item">
                    <span class="check-green">[✓] 2. Past Skill Training Experience Certificates</span>
                    <span style="color: #64748b; font-family: monospace; font-size: 11px;">previous_training_experience_certificates.pdf</span>
                  </div>
                  <div class="doc-item">
                    <span class="check-green">[✓] 3. CA Certified Annual Turnover (Last 3 FY)</span>
                    <span style="color: #64748b; font-family: monospace; font-size: 11px;">ca_certified_turnover_certificate_last_3_fy.pdf</span>
                  </div>
                  <div class="doc-item" style="padding-bottom: 0;">
                    <span class="check-green">[✓] 4. Technical Proposal &amp; Action Plan 2025-26</span>
                    <span style="color: #64748b; font-family: monospace; font-size: 11px;">technical_proposal_methodology_2025_26.pdf</span>
                  </div>
                </div>
              </div>

              <div class="footer-box">
                <div style="max-width: 500px;">
                  <div style="font-weight: 600; color: #1e293b; margin-bottom: 2px;">Post-Submission Online Modification Window:</div>
                  <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">Applicants can modify their submitted EOI online up to 3 times before the official tender deadline: 30 September 2026, 23:59:59 IST.</div>
                  <div style="font-weight: 600; color: #0b3558; font-size: 11px;">EOI Reference: EOI-MMKVY-2026-01</div>
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
