import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ReportFilter {
  reportType: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  scheme?: string;
  eoi?: string;
  category?: string;
  status?: string;
}

export interface ReportSummaryData {
  title: string;
  totalRecords: number;
  totalFinancialVolumeINR: number;
  generatedAt: string;
  generatedBy: string;
  headers: string[];
  rows: any[][];
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  getReportTypes(): { id: string; name: string; description: string; icon: string }[] {
    return [
      { id: 'EOI_SUMMARY', name: 'EOI Master & Lifecycle Report', description: 'Comprehensive status, publication dates, and application metrics per EOI', icon: 'assignment' },
      { id: 'SCHEME_ANALYTICS', name: 'Scheme Performance Report', description: 'Scheme budget allocations, operational PIAs, and EOI distributions', icon: 'account_balance' },
      { id: 'APP_SUBMISSIONS', name: 'Application Submissions Report', description: 'Detailed applicant organizations, registration dates, fees, and scrutiny status', icon: 'description' },
      { id: 'FEE_COLLECTION', name: 'Fee Collection & e-Treasury Reconciliation', description: 'Application fee, EMD, and processing fee collection ledger', icon: 'payments' },
      { id: 'CORRIGENDUM_LOG', name: 'Corrigendum & Amendment Audit Report', description: 'Chronology of published deadline extensions and tender clarifications', icon: 'history_edu' },
      { id: 'COMMITTEE_REVIEW', name: 'Committee Evaluation & Scoring Report', description: 'Technical committee assignments, review turnarounds, and recommendations', icon: 'groups' },
      { id: 'USER_AUDIT', name: 'Administrative User & SSO Mapping Report', description: 'Directory of system operators, roles, access levels, and SSO binding', icon: 'badge' },
      { id: 'CATEGORY_DIST', name: 'Category-wise Participation Analysis', description: 'Demographic breakdown of applications across General, NGO, PSU, and MSME', icon: 'pie_chart' }
    ];
  }

  generateReport(filter: ReportFilter): Observable<ReportSummaryData> {
    const now = new Date().toLocaleString('en-IN');
    
    if (filter.reportType === 'FEE_COLLECTION') {
      return of({
        title: 'State EOI Fee Collection & e-Treasury Reconciliation Report',
        totalRecords: 4,
        totalFinancialVolumeINR: 125660,
        generatedAt: now,
        generatedBy: 'Shri Rajeshwar Sharma, IAS (Super Admin)',
        headers: ['Transaction Ref', 'EOI Ref No', 'Applicant Entity', 'Fee Head', 'Base Amount', 'GST (18%)', 'Total Paid (INR)', 'Payment Mode', 'Status'],
        rows: [
          ['TXN-RAJBANK-91102830', 'RSLDC/EOI/2025-26/001', 'Rajasthan Skills Infra Pvt Ltd', 'Application + EMD + RISL', '56,000', '1,080', '57,080', 'e-Treasury Cyber Receipt', 'Verified'],
          ['TXN-RAJBANK-90218847', 'RSLDC/EOI/2024-25/089', 'Marwar SkillTech Foundation', 'Application + EMD + RISL', '28,000', '540', '28,540', 'Net Banking (SBI)', 'Verified'],
          ['TXN-RAJBANK-90219901', 'RSLDC/EOI/2024-25/089', 'Apex Vocational Evaluators Pvt Ltd', 'Application + EMD + RISL', '28,000', '540', '28,540', 'NEFT / RTGS', 'Verified'],
          ['TXN-RAJBANK-90220110', 'RSLDC/EOI/2024-25/089', 'Global Human Capital Development Trust', 'Application Fee', '11,250', '225', '11,475', 'e-Treasury Gateway', 'Verified']
        ]
      });
    }

    if (filter.reportType === 'CORRIGENDUM_LOG') {
      return of({
        title: 'EOI Corrigendum & Amendments State Archive Report',
        totalRecords: 2,
        totalFinancialVolumeINR: 0,
        generatedAt: now,
        generatedBy: 'Shri Rajeshwar Sharma, IAS (Super Admin)',
        headers: ['Doc Number', 'EOI Ref No', 'Type', 'Version', 'Title / Subject', 'Original Closing', 'Revised Closing', 'Published Date', 'Authorized Signatory'],
        rows: [
          ['RSLDC/EOI/CORR/2025/01', 'RSLDC/EOI/2025-26/001', 'Corrigendum', 'v1.1', 'Extension of Submission Last Date & Criteria Clarification', '15-05-2025', '30-06-2025', '01-02-2025', 'Shri Rajeshwar Sharma, IAS'],
          ['RSLDC/EOI/AMEND/2024/04', 'RSLDC/EOI/2024-25/089', 'Amendment', 'v1.1', 'Clarification on NCVET Dual Accreditation Requirement', '30-11-2024', '15-12-2024', '12-11-2024', 'Dr. Alok Verma, IAS']
        ]
      });
    }

    // Default EOI Master Report
    return of({
      title: 'State EOI Master Lifecycle & Response Consolidated Report',
      totalRecords: 5,
      totalFinancialVolumeINR: 228279,
      generatedAt: now,
      generatedBy: 'Shri Rajeshwar Sharma, IAS (Super Admin)',
      headers: ['EOI Ref No', 'Scheme', 'Category', 'Published Date', 'Closing Date', 'Status', 'Version', 'Applications', 'Assigned Committee'],
      rows: [
        ['RSLDC/EOI/2025-26/001', 'MMKVY', 'General', '15-01-2025', '30-06-2025', 'OPEN', 'v1.1', '42', 'State Skill Evaluation Committee (SSEC-01)'],
        ['RSLDC/EOI/2024-25/089', 'RAJKVIK RPL', 'Govt/PSU', '01-11-2024', '15-12-2024', 'CLOSED', 'v1.0', '18', 'Centrally Sponsored Schemes Scrutiny Committee'],
        ['RSLDC/EOI/2025-26/003', 'SAKSHM', 'NGO/Trust', '01-02-2025', '15-04-2025', 'OPEN', 'v1.0', '29', 'Women & Affirmative Skilling Screening Board'],
        ['RSLDC/EOI/2025-26/004', 'SAMARTH', 'NGO/Trust', '15-02-2025', '30-05-2025', 'PUBLISHED', 'v1.0', '8', 'Women & Affirmative Skilling Screening Board'],
        ['RSLDC/EOI/2025-26/005', 'RAJKVIK', 'General', '01-03-2025', '15-07-2025', 'DRAFT', 'v0.1', '0', 'Unassigned']
      ]
    });
  }

  exportToCsv(report: ReportSummaryData): void {
    const csvContent = [
      `"${report.title}"`,
      `"Generated At: ${report.generatedAt}"`,
      `"Generated By: ${report.generatedBy}"`,
      '',
      report.headers.map(h => `"${h}"`).join(','),
      ...report.rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
