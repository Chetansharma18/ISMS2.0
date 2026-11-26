import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Step1OrgDetails, Step3AuthorizedPerson } from '../../../registration/models/otr-form.model';
import { EoiDocumentItem } from './scheme-form.model';

/** The values printed on the receipts: all from the applicant's application on the backend. */
export interface SchemeReceiptData {
  applicationNo: string;
  schemeTitle: string;
  schemeName: string;
  schemeRefNo: string;
  submissionTimestamp: string;
  processFeeRequired: boolean;
  procFeeDate: string;
  procFeePrn: string;
  procFeeTxnId: string;
  procPaymentModeLabel: string;
  numericProcessFee: number;
  formattedProcessFee: string;
  processFeeInWords: string;
  emdRequired: boolean;
  emdExempted: boolean;
  udyamNumber: string;
  emdPrn: string;
  emdTxnId: string;
  emdPaidDate: string;
  emdPaymentModeLabel: string;
  numericEmdFee: number;
  formattedEmdFee: string;
  emdFeeInWords: string;
  formattedTotalFee: string;
  org: Step1OrgDetails;
  signatory: Step3AuthorizedPerson;
  documents: EoiDocumentItem[];
}

const fileSafe = (value: string) => (value || 'RECEIPT').replace(/[^A-Za-z0-9_-]+/g, '-');
const pdfText = (value: unknown): string => String(value ?? '-').replace(/\u20B9/g, 'Rs. ').trim() || '-';
const pdfCurrency = (value: string): string => pdfText(value);

const MARGIN = 14;
const CONTENT_W = 210 - MARGIN * 2;
const MAROON: [number, number, number] = [124, 14, 68];
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_600: [number, number, number] = [71, 85, 105];
const BORDER: [number, number, number] = [203, 213, 225];
const FILL_LIGHT: [number, number, number] = [248, 250, 252];
const GREEN_700: [number, number, number] = [21, 128, 61];

/** Builds downloadable A4 PDF receipts of the Apply for EOI wizard using jsPDF. */
@Injectable({ providedIn: 'root' })
export class SchemeFormReceiptsService {
  downloadProcessingFeeReceipt(d: SchemeReceiptData): void {
    const doc = this.createPdf('PROCESSING FEE PAYMENT RECEIPT');
    let y = this.drawKeyValueTable(doc, 46, [
      ['Payment Reference No. (PRN)', pdfText(d.procFeePrn), 'Paid On', pdfText(d.procFeeDate)],
      ['RPP Transaction ID', pdfText(d.procFeeTxnId), 'Payment Mode', pdfText(d.procPaymentModeLabel)],
      ['Application No.', pdfText(d.applicationNo), 'EOI Reference No.', pdfText(d.schemeRefNo)],
      ['Scheme Name', pdfText(d.schemeName), 'Payment Status', 'PAID'],
      ['Paid By', pdfText(d.org.fullName), 'Registration / PAN', `${pdfText(d.org.registrationNumber)} / ${pdfText(d.org.companyPan)}`],
      ['Payable To', 'Rajasthan Skill & Livelihoods Development Corporation (RSLDC)', 'Refundability', 'Non-Refundable']
    ]);

    y += 6;
    y = this.drawSectionTitle(doc, y, 'Fee Particulars');
    y = this.drawFeeTable(
      doc,
      y,
      [['1', 'EOI Processing Fee (Non-Refundable)', d.numericProcessFee.toFixed(2)]],
      `Total Amount Paid (${pdfText(d.processFeeInWords)})`,
      pdfCurrency(d.formattedProcessFee)
    );

    this.drawFooter(doc);
    doc.save(`Processing_Fee_Receipt_${fileSafe(d.applicationNo)}.pdf`);
  }

  downloadEmdReceipt(d: SchemeReceiptData): void {
    const doc = this.createPdf('EMD PAYMENT RECEIPT');
    const amount = d.emdExempted ? '0.00' : d.numericEmdFee.toFixed(2);
    const total = d.emdExempted ? 'Rs. 0.00 (MSME / Udyam Exempted)' : pdfCurrency(d.formattedEmdFee);
    const words = d.emdExempted ? 'Zero (Exempted)' : pdfText(d.emdFeeInWords);

    const rows: [string, string, string, string][] = d.emdExempted
      ? [
          ['Exemption Type', 'MSME / Udyam Registered Organisation', 'Udyam No.', pdfText(d.udyamNumber)],
          ['Application No.', pdfText(d.applicationNo), 'EOI Reference No.', pdfText(d.schemeRefNo)]
        ]
      : [
          ['Payment Reference No. (PRN)', pdfText(d.emdPrn), 'Paid On', pdfText(d.emdPaidDate)],
          ['RPP Transaction ID', pdfText(d.emdTxnId), 'Payment Mode', pdfText(d.emdPaymentModeLabel)],
          ['Application No.', pdfText(d.applicationNo), 'EOI Reference No.', pdfText(d.schemeRefNo)]
        ];

    rows.push(
      ['Scheme Name', pdfText(d.schemeName), 'Status', d.emdExempted ? 'EXEMPTED' : 'PAID'],
      ['Paid By', pdfText(d.org.fullName), 'Registration / PAN', `${pdfText(d.org.registrationNumber)} / ${pdfText(d.org.companyPan)}`],
      ['Payable To', 'Rajasthan Skill & Livelihoods Development Corporation (RSLDC)', 'Refundability', 'Refundable']
    );

    let y = this.drawKeyValueTable(doc, 46, rows);
    y += 6;
    y = this.drawSectionTitle(doc, y, 'EMD Particulars');
    this.drawFeeTable(
      doc,
      y,
      [['1', 'Earnest Money Deposit (Refundable)', amount]],
      `Total EMD (${words})`,
      total
    );

    this.drawFooter(doc);
    doc.save(`EMD_Receipt_${fileSafe(d.applicationNo)}.pdf`);
  }

  downloadAcknowledgmentReceipt(d: SchemeReceiptData): void {
    const doc = this.createPdf('EOI APPLICATION SUBMISSION ACKNOWLEDGMENT');
    let y = this.drawSectionTitle(doc, 45, '1. Applicant Organisation & Scheme');
    y = this.drawKeyValueTable(doc, y, [
      ['Application No.', pdfText(d.applicationNo), 'Submitted On', pdfText(d.submissionTimestamp)],
      ['Applicant Organisation', pdfText(d.org.fullName), 'Registration No.', pdfText(d.org.registrationNumber)],
      ['Scheme', pdfText(d.schemeTitle || d.schemeName), 'EOI Reference No.', pdfText(d.schemeRefNo)],
      ['PAN / GSTIN', `${pdfText(d.org.companyPan)} / ${pdfText(d.org.gstin || 'Not Applicable')}`, 'Status', 'SUBMITTED'],
      [
        'Authorized Signatory',
        `${pdfText(d.signatory.name)}${d.signatory.designation ? ` (${d.signatory.designation})` : ''}`,
        'Signatory Contact',
        `${pdfText(d.signatory.mobileNo)} | ${pdfText(d.signatory.emailId)}`
      ]
    ]);

    y += 6;
    y = this.ensureSpace(doc, y, 28);
    y = this.drawSectionTitle(doc, y, `2. Documents (${d.documents.filter(x => x.status === 'uploaded').length} of ${d.documents.length} uploaded)`);
    y = this.drawDocumentsTable(doc, y, d.documents);

    y += 6;
    y = this.ensureSpace(doc, y, 36);
    y = this.drawSectionTitle(doc, y, '3. Fees Summary');
    y = this.drawApplicationFees(doc, y, d);

    y += 6;
    y = this.ensureSpace(doc, y, 26);
    y = this.drawSectionTitle(doc, y, '4. Statutory Declaration');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE_600);
    const decl = `Submitted on ${pdfText(d.submissionTimestamp)} on behalf of ${pdfText(d.org.fullName)}. The applicant accepted the declaration that all particulars and documents furnished are true and correct.`;
    const lines = doc.splitTextToSize(decl, CONTENT_W - 6) as string[];
    const boxH = lines.length * 4.2 + 6;
    doc.setFillColor(...FILL_LIGHT);
    doc.setDrawColor(...BORDER);
    doc.rect(MARGIN, y, CONTENT_W, boxH, 'FD');
    doc.text(lines, MARGIN + 3, y + 5);

    this.drawFooter(doc);
    doc.save(`EOI_Acknowledgment_${fileSafe(d.applicationNo)}.pdf`);
  }

  downloadProposalApplication(d: SchemeReceiptData): void {
    const doc = this.createPdf(`EXPRESSION OF INTEREST APPLICATION - ${pdfText(d.schemeTitle || d.schemeName)}`);
    let y = this.drawSectionTitle(doc, 45, '1. Organisation & Application');
    y = this.drawKeyValueTable(doc, y, [
      ['Application No.', pdfText(d.applicationNo), 'Submitted On', pdfText(d.submissionTimestamp)],
      ['Applicant Organisation', pdfText(d.org.fullName), 'Registration No.', pdfText(d.org.registrationNumber)],
      ['PAN', pdfText(d.org.companyPan), 'GSTIN', pdfText(d.org.gstin || 'Not Applicable')]
    ]);

    y += 6;
    y = this.ensureSpace(doc, y, 28);
    y = this.drawSectionTitle(doc, y, '2. Documents');
    y = this.drawDocumentsTable(doc, y, d.documents);

    y += 6;
    y = this.ensureSpace(doc, y, 34);
    y = this.drawSectionTitle(doc, y, '3. Fees');
    this.drawApplicationFees(doc, y, d);

    this.drawFooter(doc);
    doc.save(`${fileSafe(d.schemeName)}_Application_${fileSafe(d.applicationNo)}.pdf`);
  }

  private createPdf(title: string): jsPDF {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.drawPageFrame(doc);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE_600);
    doc.text('GOVERNMENT OF RAJASTHAN  •  RSLDC', 105, 17, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...MAROON);
    const titleLines = doc.splitTextToSize(title, CONTENT_W - 8) as string[];
    doc.text(titleLines, 105, 24, { align: 'center' });

    const subY = 24 + titleLines.length * 5.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE_600);
    doc.text('Integrated Scheme Management System (ISMS 2.0)', 105, subY, { align: 'center' });

    doc.setDrawColor(...MAROON);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, 39, MARGIN + CONTENT_W, 39);
    return doc;
  }

  private drawPageFrame(doc: jsPDF): void {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.35);
    doc.rect(9, 9, 192, 279);
  }

  private ensureSpace(doc: jsPDF, y: number, needed: number): number {
    if (y + needed <= 274) return y;
    this.drawFooter(doc);
    doc.addPage();
    this.drawPageFrame(doc);
    return 18;
  }

  private drawSectionTitle(doc: jsPDF, y: number, title: string): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...MAROON);
    doc.text(title.toUpperCase(), MARGIN, y);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y + 1.8, MARGIN + CONTENT_W, y + 1.8);
    return y + 5;
  }

  private drawKeyValueTable(doc: jsPDF, startY: number, rows: [string, string, string, string][]): number {
    let y = startY;
    const labelW = 38;
    const valW = CONTENT_W / 2 - labelW;

    for (const [k1, v1, k2, v2] of rows) {
      doc.setFontSize(8);
      const v1Lines = doc.splitTextToSize(v1, valW - 4) as string[];
      const v2Lines = doc.splitTextToSize(v2, valW - 4) as string[];
      const k1Lines = doc.splitTextToSize(k1, labelW - 4) as string[];
      const k2Lines = doc.splitTextToSize(k2, labelW - 4) as string[];
      const maxLines = Math.max(v1Lines.length, v2Lines.length, k1Lines.length, k2Lines.length, 1);
      const rowH = maxLines * 4 + 4;
      y = this.ensureSpace(doc, y, rowH);

      doc.setDrawColor(...BORDER);
      doc.setFillColor(...FILL_LIGHT);
      doc.rect(MARGIN, y, labelW, rowH, 'FD');
      doc.rect(MARGIN + labelW + valW, y, labelW, rowH, 'FD');
      doc.rect(MARGIN + labelW, y, valW, rowH, 'D');
      doc.rect(MARGIN + labelW * 2 + valW, y, valW, rowH, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...SLATE_600);
      doc.text(k1Lines, MARGIN + 2, y + 4.8);
      doc.text(k2Lines, MARGIN + labelW + valW + 2, y + 4.8);

      const isStatus = v2 === 'PAID' || v2 === 'EXEMPTED' || v2 === 'SUBMITTED';
      doc.setFont('helvetica', isStatus ? 'bold' : 'normal');
      doc.setTextColor(...SLATE_900);
      doc.text(v1Lines, MARGIN + labelW + 2, y + 4.8);
      if (isStatus) doc.setTextColor(...GREEN_700);
      doc.text(v2Lines, MARGIN + labelW * 2 + valW + 2, y + 4.8);

      y += rowH;
    }
    return y;
  }

  private drawFeeTable(
    doc: jsPDF,
    startY: number,
    rows: [string, string, string][],
    totalLabel: string,
    totalValue: string
  ): number {
    let y = startY;
    const c1 = 14;
    const c2 = CONTENT_W - 48;
    const c3 = 34;

    doc.setFillColor(...FILL_LIGHT);
    doc.setDrawColor(...BORDER);
    doc.rect(MARGIN, y, c1, 7.5, 'FD');
    doc.rect(MARGIN + c1, y, c2, 7.5, 'FD');
    doc.rect(MARGIN + c1 + c2, y, c3, 7.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_600);
    doc.text('S.No', MARGIN + c1 / 2, y + 5, { align: 'center' });
    doc.text('Description', MARGIN + c1 + 2.5, y + 5);
    doc.text('Amount (Rs.)', MARGIN + CONTENT_W - 2.5, y + 5, { align: 'right' });
    y += 7.5;

    for (const [sno, desc, amt] of rows) {
      const descLines = doc.splitTextToSize(desc, c2 - 5) as string[];
      const rowH = Math.max(descLines.length, 1) * 4 + 4;
      doc.setDrawColor(...BORDER);
      doc.rect(MARGIN, y, c1, rowH, 'D');
      doc.rect(MARGIN + c1, y, c2, rowH, 'D');
      doc.rect(MARGIN + c1 + c2, y, c3, rowH, 'D');

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE_900);
      doc.text(sno, MARGIN + c1 / 2, y + 5, { align: 'center' });
      doc.text(descLines, MARGIN + c1 + 2.5, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(amt, MARGIN + CONTENT_W - 2.5, y + 5, { align: 'right' });
      y += rowH;
    }

    const totalLines = doc.splitTextToSize(`${totalLabel}:`, c1 + c2 - 5) as string[];
    const totalH = Math.max(totalLines.length, 1) * 4 + 4.5;
    doc.setFillColor(...FILL_LIGHT);
    doc.setDrawColor(...BORDER);
    doc.rect(MARGIN, y, c1 + c2, totalH, 'FD');
    doc.rect(MARGIN + c1 + c2, y, c3, totalH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE_900);
    doc.text(totalLines, MARGIN + c1 + c2 - 2.5, y + 5, { align: 'right' });
    doc.setTextColor(...MAROON);
    doc.text(totalValue, MARGIN + CONTENT_W - 2.5, y + 5, { align: 'right' });
    return y + totalH;
  }

  private drawDocumentsTable(doc: jsPDF, startY: number, docs: EoiDocumentItem[]): number {
    let y = startY;
    const c1 = 12;
    const c2 = 76;
    const c3 = 32;
    const c4 = CONTENT_W - c1 - c2 - c3;

    const drawHeader = (top: number) => {
      doc.setFillColor(...FILL_LIGHT);
      doc.setDrawColor(...BORDER);
      doc.rect(MARGIN, top, c1, 7.5, 'FD');
      doc.rect(MARGIN + c1, top, c2, 7.5, 'FD');
      doc.rect(MARGIN + c1 + c2, top, c3, 7.5, 'FD');
      doc.rect(MARGIN + c1 + c2 + c3, top, c4, 7.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...SLATE_600);
      doc.text('#', MARGIN + c1 / 2, top + 5, { align: 'center' });
      doc.text('Document', MARGIN + c1 + 2, top + 5);
      doc.text('Type', MARGIN + c1 + c2 + 2, top + 5);
      doc.text('File', MARGIN + c1 + c2 + c3 + 2, top + 5);
      return top + 7.5;
    };

    y = drawHeader(y);
    if (docs.length === 0) {
      doc.setDrawColor(...BORDER);
      doc.rect(MARGIN, y, CONTENT_W, 8, 'D');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE_600);
      doc.text('No documents are required for this EOI.', 105, y + 5.2, { align: 'center' });
      return y + 8;
    }

    for (let i = 0; i < docs.length; i++) {
      const item = docs[i];
      const nameText = `${item.name}${item.isMandatory ? ' *' : ''}`;
      const typeText = item.category === 'annexure' ? 'Annexure' : 'Supporting';
      const fileText = item.fileName ? `${item.fileName}${item.fileSize ? ` (${item.fileSize})` : ''}` : 'Not uploaded';

      doc.setFontSize(7.8);
      const nameLines = doc.splitTextToSize(nameText, c2 - 4) as string[];
      const fileLines = doc.splitTextToSize(fileText, c4 - 4) as string[];
      const rowH = Math.max(nameLines.length, fileLines.length, 1) * 3.8 + 4;

      if (y + rowH > 274) {
        this.drawFooter(doc);
        doc.addPage();
        this.drawPageFrame(doc);
        y = drawHeader(18);
      }

      doc.setDrawColor(...BORDER);
      doc.rect(MARGIN, y, c1, rowH, 'D');
      doc.rect(MARGIN + c1, y, c2, rowH, 'D');
      doc.rect(MARGIN + c1 + c2, y, c3, rowH, 'D');
      doc.rect(MARGIN + c1 + c2 + c3, y, c4, rowH, 'D');

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE_600);
      doc.text(String(i + 1), MARGIN + c1 / 2, y + 4.6, { align: 'center' });
      doc.setTextColor(...SLATE_900);
      doc.text(nameLines, MARGIN + c1 + 2, y + 4.6);
      doc.setTextColor(...SLATE_600);
      doc.text(typeText, MARGIN + c1 + c2 + 2, y + 4.6);
      doc.text(fileLines, MARGIN + c1 + c2 + c3 + 2, y + 4.6);
      y += rowH;
    }
    return y;
  }

  private drawApplicationFees(doc: jsPDF, startY: number, d: SchemeReceiptData): number {
    const rows: [string, string, string, string][] = [];
    if (d.processFeeRequired) {
      rows.push(['Processing Fee', 'Non-Refundable', pdfText(d.procFeePrn), pdfCurrency(d.formattedProcessFee)]);
    }
    if (d.emdRequired) {
      rows.push([
        'Earnest Money Deposit (EMD)',
        'Refundable',
        d.emdExempted ? 'Exempted (MSME / Udyam)' : pdfText(d.emdPrn),
        d.emdExempted ? 'Rs. 0.00' : pdfCurrency(d.formattedEmdFee)
      ]);
    }
    if (rows.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...SLATE_600);
      doc.text('No fees are payable for this EOI.', MARGIN, startY + 4);
      return startY + 8;
    }

    let y = startY;
    const c1 = 54;
    const c2 = 34;
    const c3 = 58;
    const c4 = CONTENT_W - c1 - c2 - c3;

    doc.setFillColor(...FILL_LIGHT);
    doc.setDrawColor(...BORDER);
    doc.rect(MARGIN, y, c1, 7.5, 'FD');
    doc.rect(MARGIN + c1, y, c2, 7.5, 'FD');
    doc.rect(MARGIN + c1 + c2, y, c3, 7.5, 'FD');
    doc.rect(MARGIN + c1 + c2 + c3, y, c4, 7.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_600);
    doc.text('Fee', MARGIN + 2, y + 5);
    doc.text('Type', MARGIN + c1 + 2, y + 5);
    doc.text('Payment Ref No. (PRN)', MARGIN + c1 + c2 + 2, y + 5);
    doc.text('Amount', MARGIN + CONTENT_W - 2, y + 5, { align: 'right' });
    y += 7.5;

    for (const [fee, type, prn, amt] of rows) {
      doc.setDrawColor(...BORDER);
      doc.rect(MARGIN, y, c1, 7.5, 'D');
      doc.rect(MARGIN + c1, y, c2, 7.5, 'D');
      doc.rect(MARGIN + c1 + c2, y, c3, 7.5, 'D');
      doc.rect(MARGIN + c1 + c2 + c3, y, c4, 7.5, 'D');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE_900);
      doc.text(fee, MARGIN + 2, y + 5);
      doc.text(type, MARGIN + c1 + 2, y + 5);
      doc.text(prn, MARGIN + c1 + c2 + 2, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(amt, MARGIN + CONTENT_W - 2, y + 5, { align: 'right' });
      y += 7.5;
    }

    doc.setFillColor(...FILL_LIGHT);
    doc.setDrawColor(...BORDER);
    doc.rect(MARGIN, y, c1 + c2 + c3, 7.5, 'FD');
    doc.rect(MARGIN + c1 + c2 + c3, y, c4, 7.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE_900);
    doc.text('Total:', MARGIN + c1 + c2 + c3 - 2, y + 5, { align: 'right' });
    doc.setTextColor(...MAROON);
    doc.text(pdfCurrency(d.formattedTotalFee), MARGIN + CONTENT_W - 2, y + 5, { align: 'right' });
    return y + 7.5;
  }

  private drawFooter(doc: jsPDF): void {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, 278, MARGIN + CONTENT_W, 278);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_600);
    doc.text('This is a computer-generated receipt from ISMS 2.0 (RSLDC) and does not require a physical signature.', 105, 283, { align: 'center' });
  }
}
