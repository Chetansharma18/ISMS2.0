import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeTender, EoiDocumentItem } from './tenders-page.component';

@Component({
  selector: 'app-scheme-detail-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full min-h-screen bg-white text-slate-800 font-sans p-4 sm:p-6 lg:p-8 space-y-5 animate-in fade-in duration-200">
      
      <!-- ====================================================================
           TOP CONTROLS & NAVIGATION BAR
           ==================================================================== -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 bg-white">
        
        <!-- Back Button -->
        <button
          type="button"
          (click)="onBack()"
          class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-[#0483AC] active:scale-95 transition-all cursor-pointer font-semibold shadow-2xs text-xs sm:text-[13px] w-fit"
          title="Back to Active Schemes"
        >
          <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <!-- Top Action Buttons (View Details [Direct PDF Download] + Apply) -->
        <div class="flex items-center flex-wrap gap-2.5">
          <!-- "View Details" button: Text only (no icon), directly generates/downloads PDF -->
          <button
            type="button"
            (click)="handleViewDetailsClick()"
            class="inline-flex items-center justify-center px-4 py-1.5 h-8.5 rounded-md bg-white hover:bg-slate-50 text-[#0B3558] border border-slate-300 hover:border-[#0B3558] text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Download Scheme Details PDF"
          >
            <span>Download Scheme Details</span>
          </button>

          <!-- Apply for this Scheme Button (hidden when scheme is closed) -->
          @if (!isClosed) {
            <button
              type="button"
              (click)="onApply()"
              class="inline-flex items-center gap-1.5 px-4 py-1.5 h-8.5 rounded-md bg-[#0B3558] hover:bg-[#082842] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Apply for EOI</span>
              <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          } @else {
            <!-- Closed badge shown when scheme is not accepting applications -->
            <span class="inline-flex items-center gap-1.5 px-4 py-1.5 h-8.5 rounded-md bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold select-none">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Submission Closed
            </span>
          }
        </div>

      </div>

      <!-- ====================================================================
           SCHEME OVERVIEW (flat, no card border)
           ==================================================================== -->
      <div class="pb-4 border-b border-slate-200">
        <div class="space-y-1 mb-4">
          <!-- Scheme Heading -->
          <h2 class="text-base sm:text-lg font-bold text-[#0B3558] tracking-tight leading-snug">
            {{ scheme.schemeTitle || scheme.schemeName }}
          </h2>
          <!-- Scheme Description -->
          <p class="text-xs sm:text-[12.5px] text-slate-600 leading-relaxed font-normal">
            {{ scheme.eoiDescription }}
          </p>
        </div>

        <!-- Metadata Fields -->
        <div class="flex flex-wrap gap-x-6 gap-y-3 text-xs pt-3 border-t border-slate-100">
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI REFERENCE NO.</span>
            <span class="font-medium text-slate-700 text-[11.5px] block mt-0.5 break-all">{{ scheme.refNo }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME NAME</span>
            <span class="font-medium text-slate-700 text-[11.5px] block mt-0.5">{{ scheme.schemeName }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME CATEGORY</span>
            <span class="font-medium text-slate-700 text-[11.5px] block mt-0.5">{{ scheme.schemeCategory || 'ALL' }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI CATEGORY</span>
            <span class="font-medium text-slate-700 text-[11.5px] block mt-0.5">{{ scheme.eoiCategory || 'General' }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF EOI PUBLISHED</span>
            <span class="font-medium text-slate-700 text-[11.5px] block mt-0.5">{{ scheme.datePublished }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF CLOSING</span>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span [class]="isClosed ? 'font-semibold text-rose-600 text-[11.5px]' : 'font-medium text-rose-600 text-[11.5px]'">{{ scheme.closingDate }}</span>
              @if (isClosed) {
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-600 text-white leading-none">Closed</span>
              }
            </div>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EMD FEE</span>
            <span class="font-medium text-slate-700 text-[11.5px] block mt-0.5">
              {{ scheme.emdFee || '₹50,000' }} <span class="text-[10px] text-slate-400 font-normal">(Refundable)</span>
            </span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">PROCESSING FEE</span>
            <span class="font-medium text-slate-700 text-[11.5px] block mt-0.5">
              {{ scheme.processFee || '₹2,000' }} <span class="text-[10px] text-slate-400 font-normal">(Non-Refundable)</span>
            </span>
          </div>
        </div>
      </div>

      <!-- ====================================================================
           SECTION A: REQUEST FOR PROPOSAL (RFP) & SOP DOCUMENTS
           ==================================================================== -->
      <div>
        <h3 class="text-xs sm:text-sm font-semibold text-[#0B3558] mb-3">
          Section A: Request for Proposal (RFP) &amp; SOP Documents
        </h3>
        <div class="space-y-2">
          @for (doc of rfpDocs; track doc.sNo) {
            <div class="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
              <div class="flex items-center gap-2.5 min-w-0">
                <!-- PDF icon -->
                <svg class="w-7 h-7 shrink-0" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="4" fill="#E5252A"/>
                  <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                </svg>
                <div class="min-w-0">
                  <span class="text-xs sm:text-[12.5px] font-semibold text-slate-800 leading-snug block truncate" [title]="doc.name">{{ doc.name }}</span>
                  <span class="text-[11px] text-slate-400">PDF Format &bull; {{ doc.size }}</span>
                </div>
              </div>
              <button
                type="button"
                (click)="downloadRfpOrSop(doc)"
                class="ml-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#082842] text-white text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
                title="Download {{ doc.name }}"
              >
                <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
            </div>
          }
        </div>
      </div>

      <!-- ====================================================================
           SECTION B: PRESCRIBED ANNEXURES (Download Annexures)
           ==================================================================== -->
      <div>
        <!-- Section Header with "Download All Annexures" Button -->
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <h3 class="text-xs sm:text-sm font-semibold text-[#0B3558]">Section B: Prescribed Annexures</h3>
            <span class="text-[11px] text-slate-500 font-normal">({{ annexures.length }} formats)</span>
          </div>
          <!-- Download All Annexures as ZIP -->
          <button
            type="button"
            (click)="downloadAllAnnexures()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#082842] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Download all prescribed annexures"
          >
            <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download All Annexures</span>
          </button>
        </div>

        <!-- Annexure List: simple rows, no S.No column -->
        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <div class="divide-y divide-slate-100">
            @for (ann of annexures; track ann.sNo) {
              <div class="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors">
                <span class="text-xs sm:text-[12.5px] text-slate-800 font-medium leading-snug flex-1 pr-4">{{ ann.name }}</span>
                <button
                  type="button"
                  (click)="downloadSingleAnnexure(ann)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-[#0B3558] hover:bg-[#0B3558]/10 border border-slate-200 hover:border-[#0B3558]/30 cursor-pointer transition-colors shrink-0"
                  title="Download {{ ann.name }}"
                >
                  <svg class="w-3 h-3 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ====================================================================
           SECTION C: INFORMATION REQUIRED TO FILL EOI
           ==================================================================== -->
      <div>
        <h3 class="text-xs sm:text-sm font-semibold text-[#0B3558] mb-1">Section C: Information Required to Fill EOI</h3>
        <p class="text-[11px] text-slate-400 mb-3">
          The following documents &amp; information must be prepared before filling the online EOI application form.
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          @for (req of requiredInfo; track req.sNo) {
            <div class="px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-colors">
              <p class="text-[11.5px] font-semibold text-slate-800 leading-snug">{{ req.name }}</p>
              @if (req.note) {
                <p class="text-[10.5px] text-slate-400 mt-0.5">{{ req.note }}</p>
              }
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class SchemeDetailViewComponent {
  @Input({ required: true }) scheme!: SchemeTender;
  @Input() rfpDocs: EoiDocumentItem[] = [];
  @Input() annexures: EoiDocumentItem[] = [];
  @Input() requiredInfo: Array<{ sNo: number; name: string; note?: string }> = [];

  @Output() back = new EventEmitter<void>();
  @Output() apply = new EventEmitter<SchemeTender>();
  @Output() download = new EventEmitter<string>();

  get isClosed(): boolean {
    if (!this.scheme) return false;
    if (this.scheme.status === 'Closed') return true;
    if (!this.scheme.closingDate) return false;
    const parts = this.scheme.closingDate.includes('/')
      ? this.scheme.closingDate.split('/')
      : this.scheme.closingDate.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const closeDate = new Date(year, month, day, 23, 59, 59);
      if (!isNaN(closeDate.getTime())) return closeDate.getTime() < Date.now();
    }
    return false;
  }

  onBack(): void {
    this.back.emit();
  }

  onApply(): void {
    this.apply.emit(this.scheme);
  }

  // Top "View Details" button: directly generates/downloads PDF without any popup modal
  handleViewDetailsClick(): void {
    this.generateOfficialPdf();
  }

  // Direct download for RFP or SOP documents
  downloadRfpOrSop(doc: EoiDocumentItem): void {
    const s = this.scheme;
    const content = `================================================================================
OFFICIAL DOCUMENT: ${doc.name}
Scheme: ${s.schemeTitle || s.schemeName}
EOI Reference No.: ${s.refNo}
Format: PDF Document (${doc.size})
Date: ${new Date().toLocaleDateString('en-GB')}
================================================================================

This is the official ${doc.name} guideline document for training partners and applicants under ${s.schemeTitle || s.schemeName}.
For submission of proposal, ensure all requirements specified in this document are adhered to.

================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(s.schemeName || 'Scheme')}_${doc.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.download.emit(doc.name);
  }

  // Direct download for single annexure
  downloadSingleAnnexure(ann: EoiDocumentItem): void {
    const s = this.scheme;
    const content = `================================================================================
PRESCRIBED FORMAT: ${ann.name}
Scheme: ${s.schemeTitle || s.schemeName}
EOI Reference: ${s.refNo}
================================================================================

Format Details:
- Serial No.: ${ann.sNo}
- Title: ${ann.name}
- Expected File Size: ${ann.size}

Instructions:
1. Please print this annexure format on official letterhead where applicable.
2. Ensure signatures of the Authorized Signatory with organizational seal.
3. Upload as part of your online proposal submission on the ISMS portal.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(s.schemeName || 'Scheme')}_${ann.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.download.emit(ann.name);
  }

  // Download all annexures — triggers individual file downloads with staggered delay
  downloadAllAnnexures(): void {
    const s = this.scheme;
    this.annexures.forEach((ann, idx) => {
      setTimeout(() => {
        const content = `================================================================================
PRESCRIBED FORMAT: ${ann.name}
Scheme: ${s.schemeTitle || s.schemeName}
EOI Reference: ${s.refNo}
Package: All Annexures Download (${idx + 1} of ${this.annexures.length})
================================================================================

Format Details:
- Serial No.: ${ann.sNo}
- Title: ${ann.name}
- Expected File Size: ${ann.size}

Instructions:
1. Please print this annexure format on official letterhead where applicable.
2. Ensure signatures of the Authorized Signatory with organizational seal.
3. Upload as part of your online proposal submission on the ISMS portal.
================================================================================`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Annexure_${String(ann.sNo).padStart(2, '0')}_${ann.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, idx * 400); // 400ms stagger between each download
    });
    this.download.emit('All Annexures');
  }

  // Generate clean, simple PDF download/print:
  // - Top header removed (starts directly with scheme header & description)
  // - No address at the bottom
  // - Contains only required informational content & documents checklist
  generateOfficialPdf(): void {
    const s = this.scheme;
    const printWindow = window.open('', '_blank', 'width=950,height=900,top=50,left=100');

    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${s.schemeTitle || s.schemeName} - Scheme Details</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Inter', Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            padding: 24px;
            line-height: 1.45;
            font-size: 11.5px;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          .scheme-heading {
            font-size: 16px;
            font-weight: 700;
            color: #0b3558;
            margin-bottom: 4px;
            border-bottom: 2px solid #0b3558;
            padding-bottom: 6px;
          }
          .scheme-desc {
            font-size: 11.5px;
            color: #334155;
            margin-top: 8px;
            margin-bottom: 14px;
            line-height: 1.45;
          }
          .meta-table, .doc-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            font-size: 11px;
          }
          .meta-table td, .meta-table th, .doc-table td, .doc-table th {
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
            text-align: left;
          }
          .meta-table th, .doc-table th {
            background-color: #f8fafc;
            color: #0b3558;
            font-weight: 600;
          }
          .label-cell {
            background-color: #f8fafc;
            font-weight: 600;
            color: #475569;
            width: 25%;
          }
          .value-cell {
            color: #0f172a;
            width: 25%;
          }
          .section-title {
            font-size: 11.5px;
            font-weight: 700;
            color: #0b3558;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-bottom: none;
            padding: 5px 8px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-top: 10px;
          }
          .checklist-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-bottom: 14px;
          }
          .check-item {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            font-size: 10.5px;
            border-radius: 4px;
            background: #ffffff;
          }
          .check-num {
            font-weight: 700;
            color: #0b3558;
            margin-right: 4px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 14px; display: flex; justify-content: flex-end; gap: 8px;">
          <button onclick="window.print()" style="background: #0b3558; color: white; border: none; padding: 7px 14px; border-radius: 4px; font-weight: 600; font-size: 12px; cursor: pointer;">
            Save as PDF / Print
          </button>
        </div>

        <!-- Scheme Header & Description (Directly at top without extra agency header) -->
        <div class="scheme-heading">${s.schemeTitle || s.schemeName}</div>
        <div class="scheme-desc">${s.eoiDescription}</div>

        <div class="section-title">Scheme &amp; EOI Particulars</div>
        <table class="meta-table">
          <tr>
            <td class="label-cell">EOI Reference No.</td>
            <td class="value-cell"><strong>${s.refNo}</strong></td>
            <td class="label-cell">Scheme Name</td>
            <td class="value-cell">${s.schemeName}</td>
          </tr>
          <tr>
            <td class="label-cell">Scheme Category</td>
            <td class="value-cell">${s.schemeCategory || 'ALL'}</td>
            <td class="label-cell">EOI Category</td>
            <td class="value-cell">${s.eoiCategory || 'General'}</td>
          </tr>
          <tr>
            <td class="label-cell">Date of EOI Published</td>
            <td class="value-cell">${s.datePublished}</td>
            <td class="label-cell">Date of Closing</td>
            <td class="value-cell" style="color: #dc2626; font-weight: 600;">${s.closingDate}</td>
          </tr>
          <tr>
            <td class="label-cell">EMD Fee</td>
            <td class="value-cell">${s.emdFee || '₹50,000'} (Refundable)</td>
            <td class="label-cell">Processing Fee</td>
            <td class="value-cell">${s.processFee || '₹2,000'} (Non-Refundable)</td>
          </tr>
        </table>

        <!-- Required Documents Checklist (Information Purpose) -->
        <div class="section-title">Required Documents &amp; Information Checklist (Information Purpose)</div>
        <div class="checklist-grid" style="margin-top: 6px;">
          ${this.requiredInfo.map(r => `
            <div class="check-item">
              <span class="check-num">${r.sNo}.</span>
              <strong>${r.name}</strong>
              ${r.note ? `<div style="color: #64748b; font-size: 9.5px; margin-top: 2px;">Note: ${r.note}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Prescribed Annexures (Information Purpose) -->
        <div class="section-title">Prescribed Annexures (${this.annexures.length} Formats)</div>
        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">S.No.</th>
              <th>Annexure Name</th>
            </tr>
          </thead>
          <tbody>
            ${this.annexures.map(a => `
              <tr>
                <td style="text-align: center;">${a.sNo}</td>
                <td>${a.name}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
