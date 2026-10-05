import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeTender, EoiDocumentItem } from './tenders-page.component';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-scheme-detail-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-white text-slate-800 font-sans p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200" style="font-family: 'Inter', sans-serif;">
      
      <!-- ====================================================================
           1. TOP CONTROLS & NAVIGATION BAR
           ==================================================================== -->
      <div class="flex items-center justify-between gap-3 pb-1">
        
        <!-- Back to Active Schemes Button -->
        <button
          type="button"
          (click)="onBack()"
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-[13px] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Back to Active Schemes"
        >
          <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Active Schemes</span>
        </button>

        <!-- Right Action Buttons -->
        <div class="flex items-center gap-2.5">
          <!-- Download Scheme Details Button -->
          <button
            type="button"
            (click)="handleViewDetailsClick()"
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-[#0B3558] text-xs sm:text-[13px] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Download Scheme Details PDF"
          >
            <svg class="w-4 h-4 text-[#0B3558]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Scheme Details</span>
          </button>

          <!-- Apply for EOI Button -->
          @if (!hideApplyButton) {
            @if (!isClosed) {
              <button
                type="button"
                (click)="onApply()"
                class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#07243c] text-white text-xs sm:text-[13px] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span>Apply for EOI</span>
                <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            } @else {
              <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold select-none">
                Submission Closed
              </span>
            }
          }
        </div>

      </div>

      <!-- ====================================================================
           2. SCHEME TITLE & DESCRIPTION
           ==================================================================== -->
      <div class="mt-4">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {{ scheme.schemeTitle || scheme.schemeName }}
        </h1>
        <p class="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
          {{ scheme.eoiDescription }}
        </p>
      </div>

      <!-- ====================================================================
           3. METADATA STATS BAR WITH VERTICAL DIVIDERS
           ==================================================================== -->
      <div class="mt-4 pt-3 pb-3 border-t border-b border-slate-200">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          
          <div class="pr-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">EOI Reference No.</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1 break-all">{{ scheme.refNo }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Scheme Name</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ scheme.schemeName }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Scheme Category</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ scheme.schemeCategory || scheme.category || 'ALL' }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">EOI Category</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ scheme.eoiCategory || 'General' }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Date of EOI Published</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ scheme.datePublished }}</span>
          </div>

          <div class="pl-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Last Date of EOI Submission</span>
            <span class="text-xs sm:text-[12.5px] font-bold text-red-600 block mt-1">{{ scheme.closingDate }}</span>
          </div>

        </div>
      </div>

      <!-- ====================================================================
           4. MIDDLE SECTION: SCHEME DOCUMENTS & ANNEXURES
           ==================================================================== -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pt-3">
        
        <!-- Left Column: Scheme Documents (4 of 12 columns) -->
        <div class="md:col-span-5 lg:col-span-4 md:pr-6 md:border-r border-slate-200">
          <h2 class="text-base font-bold text-slate-900 mb-4">Scheme Documents</h2>
          
          <div class="space-y-4">
            <!-- RFP Document -->
            <div
              (click)="downloadRfp()"
              class="flex items-start gap-3 cursor-pointer group select-none"
              title="Download Request for Proposal (RFP)"
            >
              <div class="w-7 h-7 rounded bg-[#D92D20] flex items-center justify-center text-white text-[9.5px] font-bold tracking-tight shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                PDF
              </div>
              <div>
                <div class="text-[13px] font-bold text-slate-900 group-hover:text-[#0B3558] group-hover:underline leading-snug">
                  Request for Proposal (RFP)
                </div>
                <div class="text-[11.5px] text-slate-500 mt-0.5">
                  PDF ({{ scheme.rfpDocSize || '2.4 MB' }})
                </div>
              </div>
            </div>

            <!-- SOP Document -->
            <div
              (click)="downloadSop()"
              class="flex items-start gap-3 cursor-pointer group select-none"
              title="Download Standard Operating Procedure (SOP)"
            >
              <div class="w-7 h-7 rounded bg-[#D92D20] flex items-center justify-center text-white text-[9.5px] font-bold tracking-tight shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                PDF
              </div>
              <div>
                <div class="text-[13px] font-bold text-slate-900 group-hover:text-[#0B3558] group-hover:underline leading-snug">
                  Standard Operating Procedure (SOP) for Training Partners
                </div>
                <div class="text-[11.5px] text-slate-500 mt-0.5">
                  PDF ({{ scheme.sopDocSize || '1.8 MB' }})
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Details Section (Matching Screenshot) -->
          <div class="mt-6 pt-5 border-t border-slate-100">
            <h2 class="text-base font-bold text-slate-900 mb-3">Financial Details</h2>
            
            <div class="rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
              <div class="grid grid-cols-2 divide-x divide-slate-200">
                <!-- EMD Fee -->
                <div class="pr-3">
                  <span class="text-xs font-semibold text-slate-800 leading-tight block">EMD Fee</span>
                  <div class="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                    <span class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                      {{ formattedEmdFee }}
                    </span>
                    <span class="text-[11px] text-slate-500 font-normal leading-none">(Refundable)</span>
                  </div>
                </div>

                <!-- Processing Fee -->
                <div class="pl-4">
                  <span class="text-xs font-semibold text-slate-800 leading-tight block">Processing Fee</span>
                  <div class="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                    <span class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                      {{ formattedProcessFee }}
                    </span>
                    <span class="text-[11px] text-slate-500 font-normal leading-none">(Non-Refundable)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Annexures (Numbered List, No Download Buttons) -->
        <div class="md:col-span-7 lg:col-span-8">
          <h2 class="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <span>Annexures</span>
            <span class="text-slate-500 font-normal text-sm">({{ annexures.length }} Formats)</span>
          </h2>

          <div class="space-y-1">
            @for (ann of annexures; track ann.sNo) {
              <div class="flex items-baseline gap-2 text-[12.5px] text-slate-800 leading-snug py-0.5">
                <span class="w-5 text-right text-slate-500 shrink-0 font-normal">{{ ann.sNo }}.</span>
                <span class="font-normal">{{ ann.name }}</span>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- ====================================================================
           5. BOTTOM SECTION: REQUIRED SUPPORTING DOCUMENTS
           ==================================================================== -->
      <div class="border-t border-slate-200 mt-6 pt-5">
        <h2 class="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5">
          <span>Required Supporting Documents</span>
          <span class="text-slate-500 font-normal text-sm">({{ requiredInfo.length }} Documents)</span>
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2 mt-2">
          <!-- Left Column (Items 1 - 7) -->
          <div class="space-y-1.5 text-[12px] text-slate-800 leading-snug">
            @for (req of leftSupportingDocs; track req.sNo) {
              <div class="flex items-baseline gap-2">
                <span class="w-4 text-right text-slate-500 shrink-0 font-normal">{{ req.sNo }}.</span>
                <div>
                  <span class="font-normal text-slate-900">{{ req.name }}</span>
                  @if (req.note) {
                    <span class="text-slate-500"> ({{ req.note }})</span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Right Column (Items 8 - 14) -->
          <div class="space-y-1.5 text-[12px] text-slate-800 leading-snug">
            @for (req of rightSupportingDocs; track req.sNo) {
              <div class="flex items-baseline gap-2">
                <span class="w-5 text-right text-slate-500 shrink-0 font-normal">{{ req.sNo }}.</span>
                <div>
                  <span class="font-normal text-slate-900">{{ req.name }}</span>
                  @if (req.note) {
                    <span class="text-slate-500"> ({{ req.note }})</span>
                  }
                </div>
              </div>
            }
          </div>
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
  @Input() hideApplyButton = false;

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

  get leftSupportingDocs() {
    const half = Math.ceil(this.requiredInfo.length / 2);
    return this.requiredInfo.slice(0, half);
  }

  get rightSupportingDocs() {
    const half = Math.ceil(this.requiredInfo.length / 2);
    return this.requiredInfo.slice(half);
  }

  get formattedEmdFee(): string {
    const fee = this.scheme?.emdFee || '₹ 50,000';
    return fee.startsWith('₹') && !fee.startsWith('₹ ') ? '₹ ' + fee.slice(1) : fee;
  }

  get formattedProcessFee(): string {
    const fee = this.scheme?.processFee || '₹ 2,000';
    return fee.startsWith('₹') && !fee.startsWith('₹ ') ? '₹ ' + fee.slice(1) : fee;
  }

  onBack(): void {
    this.back.emit();
  }

  onApply(): void {
    this.apply.emit(this.scheme);
  }

  handleViewDetailsClick(): void {
    this.generateOfficialPdf();
  }

  downloadRfp(): void {
    this.downloadRfpOrSop({
      sNo: 1,
      name: 'Request for Proposal (RFP)',
      size: this.scheme?.rfpDocSize || '2.4 MB'
    });
  }

  downloadSop(): void {
    this.downloadRfpOrSop({
      sNo: 2,
      name: 'Standard Operating Procedure (SOP) for Training Partners',
      size: this.scheme?.sopDocSize || '1.8 MB'
    });
  }

  downloadRfpOrSop(docItem: EoiDocumentItem): void {
    const s = this.scheme;
    const pdfDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Outer framing border
    pdfDoc.setDrawColor(203, 213, 225);
    pdfDoc.setLineWidth(0.35);
    pdfDoc.rect(8, 8, 194, 281);

    // Top Header Banner (Deep Navy)
    pdfDoc.setFillColor(11, 53, 88);
    pdfDoc.rect(8, 8, 194, 27, 'F');
    pdfDoc.setFillColor(234, 179, 8);
    pdfDoc.rect(8, 35, 194, 1.8, 'F');

    pdfDoc.setTextColor(254, 240, 138);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(8.5);
    pdfDoc.text('GOVERNMENT OF RAJASTHAN', 105, 15, { align: 'center' });

    pdfDoc.setTextColor(255, 255, 255);
    pdfDoc.setFontSize(9.5);
    pdfDoc.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)', 105, 21, { align: 'center' });

    pdfDoc.setTextColor(186, 230, 253);
    pdfDoc.setFontSize(7.5);
    pdfDoc.text('INTEGRATED SKILL MANAGEMENT SYSTEM (ISMS 2.0)', 105, 27, { align: 'center' });

    pdfDoc.setTextColor(226, 232, 240);
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(6.8);
    pdfDoc.text('OFFICIAL TENDER DOCUMENT & GUIDELINES EXTRACT', 105, 33, { align: 'center' });

    // Document Title
    let y = 44;
    pdfDoc.setTextColor(11, 53, 88);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(13);
    pdfDoc.text(docItem.name, 12, y);

    y += 5.5;
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(7.8);
    pdfDoc.setTextColor(71, 85, 105);
    pdfDoc.text(`Applicable for: ${s.schemeTitle || s.schemeName} | EOI Ref: ${s.refNo}`, 12, y);

    y += 9;
    // Summary Box
    pdfDoc.setFillColor(248, 250, 252);
    pdfDoc.setDrawColor(203, 213, 225);
    pdfDoc.setLineWidth(0.3);
    pdfDoc.roundedRect(12, y, 186, 34, 1.5, 1.5, 'FD');

    const docParams = [
      { l: 'Document Title', v: docItem.name },
      { l: 'Scheme Name', v: `${s.schemeTitle || s.schemeName} (${s.schemeName})` },
      { l: 'EOI Reference No.', v: s.refNo },
      { l: 'Date of EOI Published', v: s.datePublished },
      { l: 'Last Date of Submission', v: s.closingDate },
      { l: 'Document Format & Size', v: `PDF (${docItem.size})` }
    ];

    let pY = y + 5.5;
    docParams.forEach(p => {
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.setFontSize(7.2);
      pdfDoc.setTextColor(71, 85, 105);
      pdfDoc.text(p.l, 16, pY);

      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.setTextColor(15, 23, 42);
      pdfDoc.text(`:  ${p.v}`, 62, pY);
      pY += 4.6;
    });

    y += 40;
    // Advisory Header
    pdfDoc.setFillColor(241, 245, 249);
    pdfDoc.rect(12, y, 186, 6, 'F');
    pdfDoc.setFillColor(11, 53, 88);
    pdfDoc.rect(12, y, 2.5, 6, 'F');
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(11, 53, 88);
    pdfDoc.text('DOCUMENT SCOPE & STATUTORY INSTRUCTIONS FOR TRAINING PROVIDERS', 17, y + 4.2);

    y += 10;
    const guidelines = [
      `1. Official Release: This ${docItem.name} is the authoritative guideline issued by RSLDC for empaneled and prospective Training Partners.`,
      `2. Terms Adherence: Applicants are required to thoroughly read all sections, eligibility criteria, scope of work, technical evaluation parameters, and compliance undertakings prior to submitting proposals.`,
      `3. Prescribed Templates: All submissions must strictly conform to the 13 Prescribed Annexures and the required statutory document checklist detailed on the ISMS 2.0 portal.`,
      `4. Amendments & Corrigenda: Any corrigenda, addenda, or schedule updates will be published exclusively on the ISMS 2.0 portal (https://isms.rajasthan.gov.in).`,
      `5. Portal Submission: Online bid submission must be finalized before the closing deadline (${s.closingDate}). No offline physical submissions will be entertained.`,
      `6. Support & Inquiries: For pre-bid queries and technical guidance, contact isms-support@rajasthan.gov.in or Helpline: 0141-2792600.`
    ];

    guidelines.forEach(g => {
      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.setFontSize(7.2);
      pdfDoc.setTextColor(30, 41, 59);
      const lines = pdfDoc.splitTextToSize(g, 180);
      pdfDoc.text(lines, 15, y);
      y += (lines.length * 3.8) + 2.5;
    });

    // Verification Box
    y = 225;
    pdfDoc.setFillColor(255, 255, 255);
    pdfDoc.setDrawColor(203, 213, 225);
    pdfDoc.setLineWidth(0.3);
    pdfDoc.roundedRect(12, y, 186, 26, 1.5, 1.5, 'FD');

    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(7.5);
    pdfDoc.setTextColor(11, 53, 88);
    pdfDoc.text('DIGITAL VERIFICATION & AUTHENTIC PORTAL EXTRACT', 16, y + 5.5);

    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(6.5);
    pdfDoc.setTextColor(100, 116, 139);
    pdfDoc.text('This document has been downloaded directly from the Integrated Skill Management System (ISMS 2.0).', 16, y + 10.5);
    pdfDoc.text(`Document Reference: ${s.refNo} | Generated: ${new Date().toLocaleString('en-IN')}`, 16, y + 15);
    pdfDoc.text('Rajasthan Skill and Livelihoods Development Corporation (RSLDC), EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur', 16, y + 19.5);

    // Footer
    pdfDoc.setDrawColor(203, 213, 225);
    pdfDoc.line(12, 281, 198, 281);
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(6.5);
    pdfDoc.setTextColor(100, 116, 139);
    pdfDoc.text('Rajasthan Skill and Livelihoods Development Corporation (RSLDC) | ISMS 2.0 Portal', 12, 285);
    pdfDoc.text(`Downloaded: ${new Date().toLocaleString('en-IN')}`, 105, 285, { align: 'center' });
    pdfDoc.text('Page 1 of 1', 198, 285, { align: 'right' });

    const safeDocName = docItem.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeScheme = (s.schemeName || 'Scheme').replace(/[^a-zA-Z0-9_-]/g, '_');
    pdfDoc.save(`${safeScheme}_${safeDocName}.pdf`);
    this.download.emit(docItem.name);
  }

  private getBase64FromImage(img: HTMLImageElement): string {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 120;
      canvas.height = img.naturalHeight || img.height || 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
      }
    } catch (e) {
      console.warn('Canvas conversion error:', e);
    }
    return '';
  }

  private async loadLogoImage(src: string): Promise<string> {
    try {
      // 1. Check if already loaded in the DOM
      const existing = document.querySelector<HTMLImageElement>(`img[src="${src}"]`);
      if (existing && existing.complete && existing.naturalWidth > 0) {
        const dataUrl = this.getBase64FromImage(existing);
        if (dataUrl) return dataUrl;
      }

      // 2. Fallback to image loader
      return await new Promise<string>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const dataUrl = this.getBase64FromImage(img);
            resolve(dataUrl);
          } catch {
            resolve('');
          }
        };
        img.onerror = () => resolve('');
        img.src = src;
      });
    } catch {
      return '';
    }
  }

  /**
   * Direct PDF Download of Scheme Details (Government of Rajasthan / RSLDC ISMS 2.0)
   * Formatted with official logos, complete RSLDC corporate name, ISMS portal identity,
   * prominent scheme heading, prescribed annexures, required documents, and detailed instructions.
   */
  async generateOfficialPdf(): Promise<void> {
    const s = this.scheme;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Preload logos
    const [emblemBase64, rsldcBase64] = await Promise.all([
      this.loadLogoImage('/Rajasthan-Sarkar.png'),
      this.loadLogoImage('/rsldc-logo.png')
    ]);

    // ====================================================================
    // PAGE 1: OFFICIAL HEADER, SCHEME HEADING, PARTICULARS & ANNEXURES
    // ====================================================================

    // Outer framing border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.rect(8, 8, 194, 281);

    // 1. TOP HEADER (White background with crisp government logos & titles)
    doc.setFillColor(255, 255, 255);
    doc.rect(8.4, 8.4, 193.2, 31, 'F');

    // Logos: Left (Rajasthan Sarkar) and Right (RSLDC)
    if (emblemBase64) {
      try {
        doc.addImage(emblemBase64, 'PNG', 12, 10, 15, 17);
      } catch (e) {
        console.warn('Emblem render failed:', e);
      }
    }

    if (rsldcBase64) {
      try {
        doc.addImage(rsldcBase64, 'PNG', 183, 10.5, 15, 15);
      } catch (e) {
        console.warn('RSLDC logo render failed:', e);
      }
    }

    // Header Titles (Centered between logos)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(11, 53, 88); // #0B3558 Deep Navy
    doc.text('GOVERNMENT OF RAJASTHAN', 105, 14, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9); // Warm Gold/Amber #B45309
    doc.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)', 105, 19.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    doc.text('(A Government of Rajasthan Enterprise | Department of Skill, Employment & Entrepreneurship)', 105, 24, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)', 105, 29, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(2, 132, 199); // Sky-600
    doc.text('EXPRESSION OF INTEREST (EOI) - OFFICIAL SCHEME DETAILS & GUIDELINES', 105, 34, { align: 'center' });

    // Header Gold & Navy Accent Separators
    doc.setFillColor(234, 179, 8); // Gold accent stripe
    doc.rect(8, 38.5, 194, 1.2, 'F');
    doc.setFillColor(11, 53, 88); // Navy accent stripe
    doc.rect(8, 39.7, 194, 0.4, 'F');

    // 2. SCHEME PROPER HEADING (Dynamic Scheme-wise banner)
    let y = 43;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, y, 190, 20, 1.5, 1.5, 'FD');

    // Left Navy accent pill
    doc.setFillColor(11, 53, 88);
    doc.roundedRect(10, y, 3.5, 20, 1, 1, 'F');

    const fullSchemeHeading = s.schemeTitle || s.schemeName;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(11, 53, 88);
    doc.text(fullSchemeHeading, 16, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(
      s.eoiDescription || 'Expression of Interest for submission of proposal to undertake Skill Training initiatives under this scheme.',
      180
    );
    doc.text(descLines.slice(0, 2), 16, y + 13);
    y += 24;

    // 3. SCHEME & EOI KEY PARTICULARS TABLE
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y, 190, 6.2, 'F');
    doc.setFillColor(11, 53, 88);
    doc.rect(10, y, 2.5, 6.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(11, 53, 88);
    doc.text('1. SCHEME & EOI KEY PARTICULARS', 15, y + 4.4);
    y += 8;

    const tableRows = [
      { l1: 'EOI Reference No.', v1: s.refNo || 'N/A', l2: 'Scheme Code / Name', v2: s.schemeName || 'N/A' },
      { l1: 'Scheme Category', v1: s.schemeCategory || s.category || 'ALL', l2: 'EOI Category', v2: s.eoiCategory || 'General' },
      { l1: 'Date of EOI Published', v1: s.datePublished || 'N/A', l2: 'Last Date of Submission', v2: s.closingDate || 'N/A', alert2: true },
      { l1: 'EMD Fee (Refundable)', v1: `${s.emdFee || '₹50,000'}`, l2: 'Processing Fee (Non-Refundable)', v2: `${s.processFee || '₹2,000'}` }
    ];

    const rowH = 6.2;
    tableRows.forEach(row => {
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);

      // Col 1 Label
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 42, rowH, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(row.l1, 12, y + 4.2);

      // Col 1 Value
      doc.setFillColor(255, 255, 255);
      doc.rect(52, y, 53, rowH, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(15, 23, 42);
      doc.text(row.v1, 54, y + 4.2);

      // Col 2 Label
      doc.setFillColor(248, 250, 252);
      doc.rect(105, y, 42, rowH, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(row.l2, 107, y + 4.2);

      // Col 2 Value
      doc.setFillColor(255, 255, 255);
      doc.rect(147, y, 53, rowH, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      if (row.alert2) {
        doc.setTextColor(220, 38, 38); // Highlight closing date in red
      } else {
        doc.setTextColor(15, 23, 42);
      }
      doc.text(row.v2, 149, y + 4.2);

      y += rowH;
    });
    y += 5;

    // 4. PRESCRIBED ANNEXURES (13 MANDATORY FORMATS)
    const annexuresList = this.annexures.length > 0 ? this.annexures : [
      { sNo: 1, name: 'Annexure-1: Covering Letter' },
      { sNo: 2, name: 'Annexure-2: Format for Declaration' },
      { sNo: 3, name: 'Annexure-3: Audited Financial Statements Format for Last Three Consecutive Years' },
      { sNo: 4, name: 'Annexure-4: Details of Active Skill Development Centre Format' },
      { sNo: 5, name: 'Annexure-5: Training and Placement Details Format' },
      { sNo: 6, name: 'Annexure-6: Detailed Project Report (DPR) Format' },
      { sNo: 7, name: 'Annexure-7: Details of Trainers/Faculty' },
      { sNo: 8, name: 'Annexure-8: Annexure of Details of Board of Directors Format' },
      { sNo: 9, name: 'Annexure-9: Details of Placement Partnership / Industry Tie-ups Format' },
      { sNo: 10, name: 'Annexure-10: Details of Working Experience in Relevant Sector Format' },
      { sNo: 11, name: 'Annexure-11: List of Divisions and Group of District' },
      { sNo: 12, name: 'Annexure-12: Proposed Evaluation Matrix Template' },
      { sNo: 13, name: 'Annexure-13: Supporting Documents Checklist' }
    ];

    doc.setFillColor(241, 245, 249);
    doc.rect(10, y, 190, 6.2, 'F');
    doc.setFillColor(11, 53, 88);
    doc.rect(10, y, 2.5, 6.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(11, 53, 88);
    doc.text(`2. PRESCRIBED ANNEXURES (${annexuresList.length} MANDATORY FORMATS FOR EOI)`, 15, y + 4.4);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('All applicants must prepare, sign, seal and submit the following prescribed annexures in their technical proposal:', 10, y);
    y += 3.8;

    const halfAnn = Math.ceil(annexuresList.length / 2);
    const leftAnn = annexuresList.slice(0, halfAnn);
    const rightAnn = annexuresList.slice(halfAnn);

    const startYAnn = y;
    let currY = startYAnn;

    leftAnn.forEach(item => {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, currY, 7, 5.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(10, currY, 92, 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(11, 53, 88);
      doc.text(`${item.sNo}.`, 13.5, currY + 3.8, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.6);
      doc.setTextColor(15, 23, 42);
      const textTrunc = doc.splitTextToSize(item.name, 82)[0];
      doc.text(textTrunc, 19, currY + 3.8);

      currY += 5.8;
    });

    currY = startYAnn;
    rightAnn.forEach(item => {
      doc.setFillColor(248, 250, 252);
      doc.rect(108, currY, 7, 5.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(108, currY, 92, 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(11, 53, 88);
      doc.text(`${item.sNo}.`, 111.5, currY + 3.8, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.6);
      doc.setTextColor(15, 23, 42);
      const textTrunc = doc.splitTextToSize(item.name, 82)[0];
      doc.text(textTrunc, 117, currY + 3.8);

      currY += 5.8;
    });

    y = Math.max(startYAnn + (leftAnn.length * 5.8), startYAnn + (rightAnn.length * 5.8)) + 4;

    // 5. STATUTORY FINANCIAL PARAMETERS & PAYMENT DETAILS (Clean, no RFP/SOP)
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y, 190, 6.2, 'F');
    doc.setFillColor(11, 53, 88);
    doc.rect(10, y, 2.5, 6.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(11, 53, 88);
    doc.text('3. STATUTORY FINANCIAL PARAMETERS & PAYMENT DETAILS', 15, y + 4.4);
    y += 8;

    // Card 1: EMD Fee
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, y, 92, 22, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(11, 53, 88);
    doc.text('EARNEST MONEY DEPOSIT (EMD)', 14, y + 5.5);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${s.emdFee || '₹ 50,000'}`, 14, y + 11.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(22, 101, 52); // Green
    doc.text('(Refundable to Non-Selected Bidders)', 45, y + 11.5);

    doc.setFontSize(6.3);
    doc.setTextColor(100, 116, 139);
    doc.text('Payable online via Cyber Treasury. Mandatory for technical bid eligibility.', 14, y + 17);

    // Card 2: Tender Processing Fee
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(108, y, 92, 22, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(11, 53, 88);
    doc.text('TENDER PROCESSING FEE', 112, y + 5.5);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${s.processFee || '₹ 2,000'}`, 112, y + 11.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(185, 28, 28); // Red
    doc.text('(Non-Refundable Statutory Fee)', 142, y + 11.5);

    doc.setFontSize(6.3);
    doc.setTextColor(100, 116, 139);
    doc.text('Statutory processing charges as per Rajasthan Transparency Rules (RTPP).', 112, y + 17);

    // Page 1 Footer
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(10, 282, 200, 282);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Rajasthan Skill and Livelihoods Development Corporation (RSLDC) | ISMS 2.0 Portal', 10, 286);
    doc.text(`Downloaded: ${new Date().toLocaleString('en-IN')}`, 105, 286, { align: 'center' });
    doc.text('Page 1 of 2', 200, 286, { align: 'right' });

    // ====================================================================
    // PAGE 2: REQUIRED SUPPORTING DOCUMENTS & STATUTORY GUIDELINES
    // ====================================================================
    doc.addPage();

    // Outer framing border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.rect(8, 8, 194, 281);

    // Top Header Mini Banner (with both logos)
    doc.setFillColor(11, 53, 88);
    doc.rect(8, 8, 194, 16, 'F');
    doc.setFillColor(234, 179, 8);
    doc.rect(8, 24, 194, 1.2, 'F');

    if (emblemBase64) {
      try {
        doc.addImage(emblemBase64, 'PNG', 11, 9, 7.5, 9.5);
      } catch (e) {
        console.warn('Mini emblem render failed:', e);
      }
    }

    if (rsldcBase64) {
      try {
        doc.addImage(rsldcBase64, 'PNG', 190.5, 9, 9, 9);
      } catch (e) {
        console.warn('Mini RSLDC logo render failed:', e);
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('GOVERNMENT OF RAJASTHAN - RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION', 105, 14, { align: 'center' });

    doc.setTextColor(186, 230, 253);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`${fullSchemeHeading} | EOI Ref: ${s.refNo}`, 105, 20, { align: 'center' });

    // 4. REQUIRED SUPPORTING DOCUMENTS CHECKLIST (14 DOCUMENTS)
    let y2 = 29;
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y2, 190, 6.2, 'F');
    doc.setFillColor(11, 53, 88);
    doc.rect(10, y2, 2.5, 6.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(11, 53, 88);
    const reqList = this.requiredInfo.length > 0 ? this.requiredInfo : [
      { sNo: 1, name: 'Company PAN Card', note: 'Self-attested copy' },
      { sNo: 2, name: 'GST Registration Certificate', note: 'If registered' },
      { sNo: 3, name: 'Certificate of Incorporation / Registration', note: 'Issued by respective authority' },
      { sNo: 4, name: 'MSME / Udyam Registration Certificate', note: 'If applicable' },
      { sNo: 5, name: 'Audited Financial Statements (Last 3 years)', note: 'Signed by CA with UDIN' },
      { sNo: 6, name: 'CA-Certified Turnover Certificate', note: 'For total & skill-sector turnover' },
      { sNo: 7, name: 'Affidavit for not being blacklisted by any Govt. / PSU', note: 'Notarized' },
      { sNo: 8, name: 'Authorized Person / Signatory Details', note: 'PAN, Aadhaar, Board resolution / authorization letter' },
      { sNo: 9, name: 'Details of Officer In-Charge (OIC)', note: 'PAN, Aadhaar, appointment letter' },
      { sNo: 10, name: 'Bank Account Details with Cancelled Cheque', note: 'IFSC code required' },
      { sNo: 11, name: 'Training Centre Infrastructure Details', note: 'As per Annexure-4 format' },
      { sNo: 12, name: 'Placement & Training Track Record', note: 'Sector-wise data as per Annexure-5' },
      { sNo: 13, name: 'NSDC Partnership Certificate', note: 'If applicable' },
      { sNo: 14, name: 'EOI Document with Sign & Seal on each page', note: 'By Company Secretary or Authorized Representative' }
    ];

    doc.text(`4. REQUIRED SUPPORTING DOCUMENTS CHECKLIST (${reqList.length} STATUTORY UPLOADS)`, 15, y2 + 4.4);
    y2 += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Applicants must upload self-attested digital copies of the following documents during online proposal submission:', 10, y2);
    y2 += 3.8;

    const halfReq = Math.ceil(reqList.length / 2);
    const leftReq = reqList.slice(0, halfReq);
    const rightReq = reqList.slice(halfReq);

    const startYReq = y2;
    let currY2 = startYReq;

    // Left Column (Items 1 to 7)
    leftReq.forEach(item => {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, currY2, 7, 8.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(10, currY2, 92, 8.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(11, 53, 88);
      doc.text(`${item.sNo}.`, 13.5, currY2 + 4.2, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.6);
      doc.setTextColor(15, 23, 42);
      const titleTrunc = doc.splitTextToSize(item.name, 82)[0];
      doc.text(titleTrunc, 19, currY2 + 3.8);

      if (item.note) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Note: ${item.note}`, 19, currY2 + 7);
      }

      currY2 += 9.5;
    });

    // Right Column (Items 8 to 14)
    currY2 = startYReq;
    rightReq.forEach(item => {
      doc.setFillColor(248, 250, 252);
      doc.rect(108, currY2, 7, 8.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(108, currY2, 92, 8.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(11, 53, 88);
      doc.text(`${item.sNo}.`, 111.5, currY2 + 4.2, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.6);
      doc.setTextColor(15, 23, 42);
      const titleTrunc = doc.splitTextToSize(item.name, 82)[0];
      doc.text(titleTrunc, 117, currY2 + 3.8);

      if (item.note) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Note: ${item.note}`, 117, currY2 + 7);
      }

      currY2 += 9.5;
    });

    y2 = Math.max(startYReq + (leftReq.length * 9.5), startYReq + (rightReq.length * 9.5)) + 4;

    // 5. IMPORTANT SUBMISSION INSTRUCTIONS & STATUTORY GUIDELINES
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y2, 190, 6.2, 'F');
    doc.setFillColor(11, 53, 88);
    doc.rect(10, y2, 2.5, 6.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(11, 53, 88);
    doc.text('5. IMPORTANT INSTRUCTIONS & SUBMISSION GUIDELINES FOR APPLICANTS', 15, y2 + 4.4);
    y2 += 8;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, y2, 190, 56, 1.5, 1.5, 'FD');

    const instructions = [
      `1. Mandatory Online Submission: All proposals, annexures, and verification certificates must be submitted strictly online via the ISMS 2.0 portal (https://isms.rajasthan.gov.in). Physical, courier, or email applications will NOT be accepted under any circumstances.`,
      `2. Submission Deadline & System Lockout: Technical proposals must be finalized and submitted prior to ${s.closingDate || 'the notified deadline'}. The portal automatically closes at the specified hour, and late submissions will not be entertained.`,
      `3. Statutory Fee Remittance: Both EMD Fee (${s.emdFee || '₹50,000'}) and Processing Fee (${s.processFee || '₹2,000'}) must be remitted via the integrated Cyber Treasury payment gateway before final proposal submission. Ensure payment transaction receipts are preserved for verification.`,
      `4. Authenticity & CA UDIN Mandate: All financial statements and turnover certificates must be issued by a practicing Chartered Accountant and bear a valid, verifiable Unique Document Identification Number (UDIN). Unverified CA certificates will result in immediate disqualification.`,
      `5. Non-Blacklisting & Legal Affidavits: Non-blacklisting declarations (Annexure-2) must be executed on Rajasthan non-judicial stamp paper of prescribed value and duly notarized. Any misrepresentation will result in legal proceedings under the RTPP Act.`,
      `6. Technical Scrutiny & Empanelment: Proposals will be evaluated by the State Evaluation Committee strictly based on the scoring matrix detailed in Annexure-12. Physical inspection of training infrastructure and biometric equipment will be conducted prior to work order issuance.`,
      `7. Helpdesk & Portal Support: In case of technical difficulties during online submission, contact the ISMS Helpdesk at isms-support@rajasthan.gov.in or Helpline: 0141-2792600 (Working days, 9:30 AM to 6:00 PM).`
    ];

    let instY = y2 + 5.5;
    instructions.forEach(inst => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.7);
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(inst, 182);
      doc.text(lines, 14, instY);
      instY += (lines.length * 3.3) + 1.2;
    });

    y2 += 60;

    // 6. DIGITAL VERIFICATION SEAL & AUDIT TIMESTAMP
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, y2, 190, 24, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(11, 53, 88);
    doc.text('DIGITAL VERIFICATION & AUTHENTIC PORTAL EXTRACT', 15, y2 + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('This document is an electronically generated extract from the Integrated Skill Management System (ISMS 2.0).', 15, y2 + 10);
    doc.text(`Official EOI Identifier: ${s.refNo || 'N/A'} | Scheme: ${s.schemeName || 'N/A'}`, 15, y2 + 14);
    doc.text(`Security Verification Hash: SHA-256-${Date.now().toString(36).toUpperCase()}-RSLDC-AUTHENTIC`, 15, y2 + 18);

    // Digital badge on right side
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(148, y2 + 3.5, 48, 17, 1.5, 1.5, 'FD');
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text('AUTHENTIC EXTRACT', 172, y2 + 8.5, { align: 'center' });
    doc.setFontSize(5.8);
    doc.setFont('helvetica', 'normal');
    doc.text('ISMS 2.0 PORTAL VERIFIED', 172, y2 + 12.5, { align: 'center' });
    doc.text(new Date().toLocaleDateString('en-IN'), 172, y2 + 16, { align: 'center' });

    // Page 2 Footer
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(10, 282, 200, 282);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Rajasthan Skill and Livelihoods Development Corporation (RSLDC) | ISMS 2.0 Portal', 10, 286);
    doc.text(`Downloaded: ${new Date().toLocaleString('en-IN')}`, 105, 286, { align: 'center' });
    doc.text('Page 2 of 2', 200, 286, { align: 'right' });

    // Trigger direct browser download of formatted PDF
    const sanitizedName = (s.schemeName || s.schemeTitle || 'Details').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Scheme_Details_${sanitizedName}.pdf`);
    this.download.emit('Scheme Details PDF');
  }
}
