import { Injectable } from '@angular/core';
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

/** Escapes text for the generated HTML (every value comes from user-entered data). */
const esc = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const fileSafe = (value: string) => value.replace(/[^A-Za-z0-9_-]+/g, '-');

const STYLE = `
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; text-align: center; }
    .gov-title { font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    .section-title { font-size: 12px; font-weight: 800; color: #0B3558; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    td.k { width: 25%; font-weight: bold; background: #f8fafc; }
    .mono { font-family: monospace; }
    .ok { font-weight: bold; color: #15803d; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
    .foot { margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center; }`;

/** Builds the HTML receipts of the Apply for EOI wizard and downloads them as files. */
@Injectable({ providedIn: 'root' })
export class SchemeFormReceiptsService {
  downloadProcessingFeeReceipt(d: SchemeReceiptData): void {
    const body = `
  ${this.header('Processing Fee Payment Receipt')}
  <table>
    <tr><td class="k">Payment Reference No. (PRN)</td><td class="mono"><b>${esc(d.procFeePrn)}</b></td><td class="k">Paid On</td><td>${esc(d.procFeeDate)}</td></tr>
    <tr><td class="k">RPP Transaction ID</td><td class="mono">${esc(d.procFeeTxnId)}</td><td class="k">Payment Mode</td><td>${esc(d.procPaymentModeLabel)}</td></tr>
    <tr><td class="k">Paid By</td><td>${esc(d.org.fullName)}</td><td class="k">Registration No. / PAN</td><td class="mono">${esc(d.org.registrationNumber)} / ${esc(d.org.companyPan)}</td></tr>
    <tr><td class="k">Application No.</td><td class="mono">${esc(d.applicationNo)}</td><td class="k">EOI Reference No.</td><td class="mono">${esc(d.schemeRefNo)}</td></tr>
    <tr><td class="k">Payable To</td><td>Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)</td><td class="k">Payment Status</td><td class="ok">PAID</td></tr>
  </table>
  <table>
    <thead><tr><th>S.No</th><th>Description</th><th style="text-align: right;">Amount (&#8377;)</th></tr></thead>
    <tbody>
      <tr><td style="text-align: center;">1</td><td>EOI Processing Fee (Non-Refundable)</td><td style="text-align: right; font-weight: bold;">${d.numericProcessFee.toFixed(2)}</td></tr>
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="2" style="text-align: right;">Total Amount Paid (in words: ${esc(d.processFeeInWords)}):</td><td style="text-align: right; font-size: 13px; color: #0B3558;">${esc(d.formattedProcessFee)}</td></tr>
    </tbody>
  </table>
  ${this.footer()}`;
    this.saveHtml(`Processing_Fee_Receipt_${fileSafe(d.applicationNo)}.html`, this.page('Processing Fee Receipt', body));
  }

  downloadEmdReceipt(d: SchemeReceiptData): void {
    const amount = d.emdExempted ? '0.00' : d.numericEmdFee.toFixed(2);
    const total = d.emdExempted ? '&#8377; 0.00 (MSME / Udyam Exempted)' : esc(d.formattedEmdFee);
    const words = d.emdExempted ? 'Zero (Exempted)' : esc(d.emdFeeInWords);
    const paymentRows = d.emdExempted
      ? `<tr><td class="k">Exemption</td><td colspan="3">MSME / Udyam registered organisation. Udyam No. <span class="mono">${esc(d.udyamNumber || '-')}</span></td></tr>`
      : `<tr><td class="k">Payment Reference No. (PRN)</td><td class="mono"><b>${esc(d.emdPrn)}</b></td><td class="k">Paid On</td><td>${esc(d.emdPaidDate)}</td></tr>
    <tr><td class="k">RPP Transaction ID</td><td class="mono">${esc(d.emdTxnId)}</td><td class="k">Payment Mode</td><td>${esc(d.emdPaymentModeLabel)}</td></tr>`;
    const body = `
  ${this.header('EMD Payment Receipt')}
  <table>
    ${paymentRows}
    <tr><td class="k">Paid By</td><td>${esc(d.org.fullName)}</td><td class="k">Registration No. / PAN</td><td class="mono">${esc(d.org.registrationNumber)} / ${esc(d.org.companyPan)}</td></tr>
    <tr><td class="k">Application No.</td><td class="mono">${esc(d.applicationNo)}</td><td class="k">Scheme</td><td>${esc(d.schemeName)} (${esc(d.schemeRefNo)})</td></tr>
    <tr><td class="k">Payable To</td><td>Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)</td><td class="k">Status</td><td class="ok">${d.emdExempted ? 'EXEMPTED' : 'PAID'}</td></tr>
  </table>
  <table>
    <thead><tr><th>S.No</th><th>Description</th><th style="text-align: right;">Amount (&#8377;)</th></tr></thead>
    <tbody>
      <tr><td style="text-align: center;">1</td><td>Earnest Money Deposit (Refundable)</td><td style="text-align: right; font-weight: bold;">${amount}</td></tr>
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="2" style="text-align: right;">Total EMD (in words: ${words}):</td><td style="text-align: right; font-size: 13px; color: #0B3558;">${total}</td></tr>
    </tbody>
  </table>
  ${this.footer()}`;
    this.saveHtml(`EMD_Receipt_${fileSafe(d.applicationNo)}.html`, this.page('EMD Receipt', body));
  }

  downloadAcknowledgmentReceipt(d: SchemeReceiptData): void {
    const body = `
  ${this.header('EOI Application Submission Acknowledgment')}
  <div class="section-title">1. Applicant Organisation &amp; Scheme</div>
  <table>
    <tr><td class="k">Application No.</td><td class="mono"><b>${esc(d.applicationNo)}</b></td><td class="k">Submitted On</td><td>${esc(d.submissionTimestamp)}</td></tr>
    <tr><td class="k">Applicant Organisation</td><td>${esc(d.org.fullName)}</td><td class="k">Registration No.</td><td class="mono">${esc(d.org.registrationNumber)}</td></tr>
    <tr><td class="k">Scheme</td><td>${esc(d.schemeTitle)}</td><td class="k">EOI Reference No.</td><td class="mono">${esc(d.schemeRefNo)}</td></tr>
    <tr><td class="k">PAN / GSTIN</td><td class="mono">${esc(d.org.companyPan)} / ${esc(d.org.gstin || 'Not Applicable')}</td><td class="k">Status</td><td class="ok">SUBMITTED</td></tr>
    <tr><td class="k">Authorized Signatory</td><td>${esc(d.signatory.name)}${d.signatory.designation ? ` (${esc(d.signatory.designation)})` : ''}</td><td class="k">Signatory Contact</td><td>${esc(d.signatory.mobileNo)} | ${esc(d.signatory.emailId)}</td></tr>
  </table>
  <div class="section-title">2. Documents (${d.documents.filter(x => x.status === 'uploaded').length} of ${d.documents.length} uploaded)</div>
  <table>
    <thead><tr><th style="width: 35px; text-align: center;">#</th><th>Document</th><th>Type</th><th>File</th></tr></thead>
    <tbody>${this.docRows(d.documents)}</tbody>
  </table>
  <div class="section-title">3. Fees</div>
  ${this.feeTable(d)}
  <div class="section-title">4. Declaration</div>
  <p style="font-size: 11px; color: #475569; line-height: 1.5; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
    Submitted on ${esc(d.submissionTimestamp)} on behalf of <strong>${esc(d.org.fullName)}</strong>. The applicant accepted the declaration that all particulars and documents furnished are true and correct.
  </p>
  ${this.footer()}`;
    this.saveHtml(`EOI_Acknowledgment_${fileSafe(d.applicationNo)}.html`, this.page(`EOI Acknowledgment - ${esc(d.applicationNo)}`, body));
  }

  downloadProposalApplication(d: SchemeReceiptData): void {
    const body = `
  ${this.header(`Expression of Interest Application - ${esc(d.schemeTitle)}`)}
  <div class="section-title">1. Organisation</div>
  <table>
    <tr><td class="k">Application No.</td><td class="mono">${esc(d.applicationNo)}</td><td class="k">Submitted On</td><td>${esc(d.submissionTimestamp)}</td></tr>
    <tr><td class="k">Applicant Organisation</td><td>${esc(d.org.fullName)}</td><td class="k">Registration No.</td><td class="mono">${esc(d.org.registrationNumber)}</td></tr>
    <tr><td class="k">PAN</td><td class="mono">${esc(d.org.companyPan)}</td><td class="k">GSTIN</td><td class="mono">${esc(d.org.gstin || 'Not Applicable')}</td></tr>
  </table>
  <div class="section-title">2. Documents</div>
  <table>
    <thead><tr><th style="width: 35px; text-align: center;">#</th><th>Document</th><th>Type</th><th>File</th></tr></thead>
    <tbody>${this.docRows(d.documents)}</tbody>
  </table>
  <div class="section-title">3. Fees</div>
  ${this.feeTable(d)}
  ${this.footer()}`;
    this.saveHtml(`${fileSafe(d.schemeName)}_Application_${fileSafe(d.applicationNo)}.html`, this.page(`${esc(d.schemeName)} Application`, body));
  }

  private feeTable(d: SchemeReceiptData): string {
    const rows: string[] = [];
    if (d.processFeeRequired) {
      rows.push(`<tr><td>Processing Fee</td><td>Non-Refundable</td><td class="mono">${esc(d.procFeePrn)}</td><td style="text-align: right; font-weight: bold;">${esc(d.formattedProcessFee)}</td></tr>`);
    }
    if (d.emdRequired) {
      rows.push(`<tr><td>Earnest Money Deposit (EMD)</td><td>Refundable</td><td class="mono">${d.emdExempted ? 'Exempted (MSME / Udyam)' : esc(d.emdPrn)}</td><td style="text-align: right; font-weight: bold;">${d.emdExempted ? '&#8377; 0.00' : esc(d.formattedEmdFee)}</td></tr>`);
    }
    if (rows.length === 0) return '<p style="font-size: 11px; color: #475569;">No fees are payable for this EOI.</p>';
    return `<table>
    <thead><tr><th>Fee</th><th>Type</th><th>Payment Reference No. (PRN)</th><th style="text-align: right;">Amount</th></tr></thead>
    <tbody>${rows.join('')}
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="3" style="text-align: right;">Total:</td><td style="text-align: right; color: #0B3558;">${esc(d.formattedTotalFee)}</td></tr>
    </tbody>
  </table>`;
  }

  private docRows(docs: EoiDocumentItem[]): string {
    if (docs.length === 0) return '<tr><td colspan="4" style="text-align: center; color: #64748b;">No documents are required for this EOI.</td></tr>';
    return docs
      .map(
        (doc, i) => `
      <tr>
        <td style="text-align: center; font-weight: bold; color: #64748b;">${i + 1}</td>
        <td style="font-weight: 600; color: #0f172a;">${esc(doc.name)}${doc.isMandatory ? ' *' : ''}</td>
        <td style="color: #475569;">${doc.category === 'annexure' ? 'Annexure' : 'Supporting Document'}</td>
        <td class="mono">${doc.fileName ? `${esc(doc.fileName)} (${esc(doc.fileSize)})` : 'Not uploaded'}</td>
      </tr>`
      )
      .join('');
  }

  private header(title: string): string {
    return `<div class="header-box">
    <div class="gov-title">Government of Rajasthan &bull; RSLDC</div>
    <div class="main-title">${title}</div>
    <div style="font-size: 11px; color: #475569; margin-top: 4px;">Integrated Scheme Management System (ISMS 2.0)</div>
  </div>`;
  }

  private footer(): string {
    return `<div class="foot">This is a computer-generated receipt and does not require a physical signature.</div>`;
  }

  private page(title: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>${STYLE}
  </style>
</head>
<body>
  <div class="no-print btn-bar"><button class="btn" onclick="window.print()">Print / Save as PDF</button></div>
  ${body}
</body>
</html>`;
  }

  private saveHtml(filename: string, htmlContent: string): void {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
