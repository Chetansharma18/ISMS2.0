import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PageHeaderComponent,
  TableComponent,
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
  submittedStatus: 'Under Review' | 'Reviewed';
  eoiStatus: string;
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
    TableComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-text-primary font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Tender Status"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Tender Status' }]"
        >
          <!-- Search Input inside Header or Toolbar -->
          <div class="relative w-full sm:w-80">
            <svg class="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search Ref, Scheme, Department..."
              class="w-full pl-9 pr-7 py-2 text-[13px] bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-normal shadow-2xs"
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

        <!-- Main Status Table via Reusable TableComponent -->
        <app-table
          [columns]="tenderColumns"
          [data]="filteredTenders()"
          [pagination]="true"
          [pageSize]="pageSize"
          emptyMessage="No tender applications match your search query."
          [customTemplates]="{
            appRef: appRefTemplate,
            schemeTitle: schemeTitleTemplate,
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

        <ng-template #schemeTitleTemplate let-tender>
          <span
            (click)="openReceipt(tender)"
            class="font-medium text-slate-800 hover:text-[#0B3558] hover:underline cursor-pointer transition-colors"
            title="View {{ tender.schemeTitle }}"
          >
            {{ tender.schemeTitle }}
          </span>
        </ng-template>

        <ng-template #deptTemplate let-tender>
          <span class="line-clamp-2 text-slate-600 text-[11px] leading-relaxed">{{ tender.department }}</span>
        </ng-template>

        <ng-template #viewTemplate let-tender>
          <button
            type="button"
            (click)="downloadReceipt(tender)"
            title="Download / Print Receipt PDF"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-md text-xs font-semibold cursor-pointer shadow-sm transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </button>
        </ng-template>

      </div>
    </div>
  `
})
export class TenderStatusComponent {
  readonly Math = Math;
  searchQuery = '';
  readonly pageSize = 6;
  selectedReceiptTender = signal<SubmittedTender | null>(null);

  readonly tenderColumns: TableColumn<SubmittedTender>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'appRef', label: 'Application Ref. No.', cellClass: 'whitespace-nowrap font-normal text-slate-800', type: 'custom' },
    { key: 'schemeTitle', label: 'Scheme Name', cellClass: 'whitespace-nowrap font-medium text-slate-800', type: 'custom' },
    { key: 'department', label: 'Department', width: 'min-w-[200px] max-w-sm', type: 'custom' },
    { key: 'appliedDate', label: 'Applied Date', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    {
      key: 'submittedStatus',
      label: 'Submitted Status',
      align: 'center',
      type: 'status',
      badgeVariantMap: {
        'Under Review': 'warning',
        'Reviewed': 'success'
      }
    },
    { key: 'eoiStatus', label: 'EOI Stage', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'view', label: 'View', align: 'center', width: 'w-20', type: 'custom' }
  ];

  /**
   * Sample submitted applications:
   * - Under Review => EOI Stage is '-'
   * - Reviewed (Accepted / Evaluated) => Respective EOI Stage
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
      submittedStatus: 'Under Review',
      eoiStatus: '-'
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
      submittedStatus: 'Reviewed',
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
      submittedStatus: 'Under Review',
      eoiStatus: '-'
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
      submittedStatus: 'Reviewed',
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
      submittedStatus: 'Under Review',
      eoiStatus: '-'
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
      submittedStatus: 'Reviewed',
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
      submittedStatus: 'Under Review',
      eoiStatus: '-'
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
      submittedStatus: 'Reviewed',
      eoiStatus: 'AOC'
    }
  ];

  readonly filteredTenders = computed(() => {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return this.tenders;

    return this.tenders.filter(t =>
      t.appRef.toLowerCase().includes(query) ||
      t.schemeTitle.toLowerCase().includes(query) ||
      t.department.toLowerCase().includes(query) ||
      t.submittedStatus.toLowerCase().includes(query) ||
      t.eoiStatus.toLowerCase().includes(query) ||
      t.transactionRef.toLowerCase().includes(query)
    );
  });

  openReceipt(tender: SubmittedTender): void {
    this.downloadReceipt(tender);
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
                    <div class="grid-value">Dr. Rajeshwar Sharma (Director)</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">Registered Office:</div>
                    <div class="grid-value">Plot No. 42, Malviya Nagar Industrial Area, Jaipur, Rajasthan - 302017</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-header">2. SCHEME &amp; EOI APPLICATION PARTICULARS</div>
                <div class="section-body">
                  <div class="grid-row">
                    <div class="grid-label">Scheme Name:</div>
                    <div class="grid-value font-bold" style="color: #0b3558;">${currentTender.schemeTitle}</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">Nodal Department:</div>
                    <div class="grid-value">${currentTender.department}</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">Submitted Status:</div>
                    <div class="grid-value"><strong style="color: #0b3558;">${currentTender.submittedStatus}</strong></div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">EOI Stage:</div>
                    <div class="grid-value">${currentTender.eoiStatus}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-header">3. PAYMENT &amp; TRANSACTION ACKNOWLEDGEMENT</div>
                <div class="section-body">
                  <table>
                    <thead>
                      <tr>
                        <th>Fee Head</th>
                        <th>Transaction / Reference ID</th>
                        <th>Payment Mode</th>
                        <th style="text-align: right;">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Processing / Tender Document Fee</td>
                        <td>${currentTender.transactionRef}</td>
                        <td>Razorpay / Online NetBanking</td>
                        <td style="text-align: right;">${currentTender.processingFee}</td>
                      </tr>
                      <tr>
                        <td>Earnest Money Deposit (EMD) / Exemption</td>
                        <td>EMD-${currentTender.transactionRef.replace('TXN-', '')}</td>
                        <td>Online EMD Transfer</td>
                        <td style="text-align: right;">${currentTender.emdAmount}</td>
                      </tr>
                      <tr class="total-row">
                        <td colspan="3">Total Fees Paid</td>
                        <td style="text-align: right;">₹52,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="footer-box">
                <div>
                  <div style="font-weight: 700; color: #0b3558; font-size: 12px;">SYSTEM GENERATED ACKNOWLEDGEMENT</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">This is an authentic system-generated receipt. No physical signature required.</div>
                </div>
                <div class="stamp-box">
                  RSLDC eProcurement<br>VERIFIED RECEIPT
                </div>
              </div>

            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
