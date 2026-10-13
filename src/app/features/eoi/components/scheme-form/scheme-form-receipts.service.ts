import { Injectable } from '@angular/core';
import { Step1OrgDetails, Step3AuthorizedPerson } from '../../../registration/models/otr-form.model';
import { EoiDocumentItem } from './scheme-form.model';

/** Snapshot of the application values printed on the generated receipts. */
export interface SchemeReceiptData {
  schemeTitle: string;
  schemeName: string;
  schemeRefNo: string;
  submissionTimestamp: string;
  procFeeDate: string;
  procPaymentModeLabel: string;
  numericProcessFee: number;
  formattedProcessFee: string;
  processFeeInWords: string;
  emdExempted: boolean;
  numericEmdFee: number;
  formattedEmdFee: string;
  emdFeeInWords: string;
  formattedTotalFee: string;
  org: Step1OrgDetails;
  signatory: Step3AuthorizedPerson;
  documents: EoiDocumentItem[];
}

/** Builds the HTML receipts of the EOI application wizard and downloads them as files. */
@Injectable({ providedIn: 'root' })
export class SchemeFormReceiptsService {
  downloadProcessingFeeReceipt(data: SchemeReceiptData): void {
    const filename = `Processing_Fee_Receipt.html`;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Processing Fee Receipt</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; text-align: center; }
    .gov-title { font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print Receipt / Save as PDF</button>
  </div>

  <div class="header-box">
    <div class="gov-title">Government of Rajasthan &bull; RSLDC</div>
    <div class="main-title">Processing Fee Payment Receipt</div>
    <div style="font-size: 11px; color: #475569; margin-top: 4px;">Integrated Scheme Management System (ISMS 2.0) &bull; RSLDC Tender Application</div>
  </div>

  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc;">Transaction ID</td><td style="font-family: monospace; font-weight: bold;">CIN-SBI-9912081</td><td style="width: 25%; font-weight: bold; background: #f8fafc;">Paid On</td><td>${data.procFeeDate}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Paid By</td><td>${data.org.fullName}</td><td style="font-weight: bold; background: #f8fafc;">CIN / PAN</td><td style="font-family: monospace;">${data.org.registrationNumber} / ${data.org.companyPan}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Payable To</td><td>Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)</td><td style="font-weight: bold; background: #f8fafc;">Scheme Ref</td><td style="font-family: monospace;">${data.schemeRefNo}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Payment Status</td><td colspan="3" style="font-weight: bold; color: #15803d;">PAID</td></tr>
  </table>

  <table>
    <thead><tr><th>S.No</th><th>Description</th><th style="text-align: right;">Amount (₹)</th></tr></thead>
    <tbody>
      <tr><td style="text-align: center;">1</td><td>EOI Processing Fee (Non-Refundable)</td><td style="text-align: right; font-weight: bold;">${data.numericProcessFee.toFixed(2)}</td></tr>
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="2" style="text-align: right;">Total Amount Paid (in words: ${data.processFeeInWords}):</td><td style="text-align: right; font-size: 13px; color: #0B3558;">${data.formattedProcessFee}</td></tr>
    </tbody>
  </table>

  <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center;">
    This is a computer-generated e-Receipt issued under Information Technology Act 2000 and does not require physical signature.
  </div>
</body>
</html>`;

    this.saveHtml(filename, htmlContent);
  }

  downloadAcknowledgmentReceipt(data: SchemeReceiptData): void {
    const filename = `EOI_Acknowledgment_Receipt_ISMS-EOI-2026-9842.html`;
    const docRows = this.buildDocRows(data.documents);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EOI Proposal Submission Acknowledgment Receipt - ISMS-EOI-2026-9842</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .gov-title { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    .sub-title { font-size: 12px; color: #334155; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #f1f5f9; color: #0B3558; border: 1px solid #cbd5e1; }
    .section-title { font-size: 12px; font-weight: 800; color: #0B3558; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print Receipt / Save as PDF</button>
  </div>

  <div class="header-box">
    <div>
      <div class="gov-title">Government of Rajasthan &bull; Department of Skill, Employment &amp; Entrepreneurship</div>
      <div class="main-title">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</div>
      <div class="sub-title">Official EOI Proposal Submission Acknowledgment Receipt</div>
    </div>
    <div style="text-align: right;">
      <div class="badge">Application Ref: ISMS-EOI-2026-9842</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Submitted: ${data.submissionTimestamp}</div>
    </div>
  </div>

  <div class="section-title">1. Applicant Organization &amp; Scheme Details</div>
  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc;">Applicant Organization</td><td>${data.org.fullName}</td><td style="width: 20%; font-weight: bold; background: #f8fafc;">CIN / Reg No</td><td style="font-family: monospace;">${data.org.registrationNumber}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Scheme Name</td><td>${data.schemeTitle}</td><td style="font-weight: bold; background: #f8fafc;">EOI Ref No</td><td style="font-family: monospace;">${data.schemeRefNo}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Company PAN / GSTIN</td><td style="font-family: monospace;">${data.org.companyPan} / ${data.org.gstin || 'NA'}</td><td style="font-weight: bold; background: #f8fafc;">Submission Status</td><td style="font-weight: bold; color: #15803d;">REGISTERED &amp; SUBMITTED</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Authorized Signatory</td><td>${data.signatory.name} (${data.signatory.designation})</td><td style="font-weight: bold; background: #f8fafc;">Signatory Contact</td><td>${data.signatory.mobileNo} | ${data.signatory.emailId}</td></tr>
  </table>

  <div class="section-title">2. Mandatory Proposal Documents Checklist (16 Documents)</div>
  <table>
    <thead><tr><th style="width: 35px; text-align: center;">#</th><th>Document Name</th><th>Classification</th><th>Attached File</th></tr></thead>
    <tbody>${docRows}</tbody>
  </table>

  <div class="section-title">3. Statutory Verification &amp; Undertaking</div>
  <p style="font-size: 11px; color: #475569; line-height: 1.5; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
    Digitally authenticated and submitted by <strong>${data.signatory.name}</strong> on ${data.submissionTimestamp}. The applicant organization has accepted the statutory undertaking that all particulars and annexed documents are genuine and valid.
  </p>

  <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
    <div>Generated from ISMS 2.0 &bull; Official RSLDC EOI Submission Record</div>
    <div>Date: ${data.submissionTimestamp}</div>
  </div>
</body>
</html>`;

    this.saveHtml(filename, htmlContent);
  }

  downloadEmdReceipt(data: SchemeReceiptData): void {
    const filename = `EMD_Receipt.html`;
    const emdSettledText = data.emdExempted ? '₹ 0.00 (MSME Exempted)' : data.formattedEmdFee;
    const emdNumText = data.emdExempted ? '0.00' : data.numericEmdFee.toFixed(2);
    const emdWords = data.emdExempted ? 'Zero (Exempted)' : data.emdFeeInWords;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EMD Payment Receipt</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; text-align: center; }
    .gov-title { font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print Receipt / Save as PDF</button>
  </div>

  <div class="header-box">
    <div class="gov-title">Government of Rajasthan &bull; RSLDC</div>
    <div class="main-title">EMD Payment Receipt</div>
    <div style="font-size: 11px; color: #475569; margin-top: 4px;">Integrated Scheme Management System (ISMS 2.0) &bull; RSLDC Tender Application</div>
  </div>

  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc;">Payment Reference No.</td><td style="font-family: monospace; font-weight: bold;">${data.emdExempted ? 'Exempted' : 'CIN-SBI-9912082'}</td><td style="width: 25%; font-weight: bold; background: #f8fafc;">Paid On</td><td>${data.submissionTimestamp}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Paid By</td><td>${data.org.fullName}</td><td style="font-weight: bold; background: #f8fafc;">CIN / PAN</td><td style="font-family: monospace;">${data.org.registrationNumber} / ${data.org.companyPan}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Payable To</td><td>Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)</td><td style="font-weight: bold; background: #f8fafc;">Scheme</td><td>${data.schemeName} (${data.schemeRefNo})</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Payment Status</td><td colspan="3" style="font-weight: bold; color: #15803d;">${data.emdExempted ? 'EXEMPTED' : 'PAID'}</td></tr>
  </table>

  <table>
    <thead><tr><th>S.No</th><th>Description</th><th style="text-align: right;">Amount (₹)</th></tr></thead>
    <tbody>
      <tr><td style="text-align: center;">1</td><td>Earnest Money Deposit (Refundable)</td><td style="text-align: right; font-weight: bold;">${emdNumText}</td></tr>
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="2" style="text-align: right;">Total EMD Paid (in words: ${emdWords}):</td><td style="text-align: right; font-size: 13px; color: #0B3558;">${emdSettledText}</td></tr>
    </tbody>
  </table>

  <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center;">
    This is a computer-generated e-Receipt issued under Information Technology Act 2000 and does not require physical signature.
  </div>
</body>
</html>`;

    this.saveHtml(filename, htmlContent);
  }

  downloadProposalApplication(data: SchemeReceiptData): void {
    const filename = `${data.schemeName}_Proposal_Application_ISMS-EOI-2026-9842.html`;
    const docRows = this.buildDocRows(data.documents);

    const emdSettledText = data.emdExempted ? '₹ 0.00 (MSME Exempted)' : data.formattedEmdFee;
    const totalSettledText = data.emdExempted ? data.formattedProcessFee : data.formattedTotalFee;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.schemeName} Proposal Application - ISMS-EOI-2026-9842</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .gov-title { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    .sub-title { font-size: 12px; color: #334155; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #f1f5f9; color: #0B3558; border: 1px solid #cbd5e1; }
    .section-title { font-size: 12px; font-weight: 800; color: #0B3558; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print Application / Save as PDF</button>
  </div>

  <div class="header-box">
    <div>
      <div class="gov-title">Government of Rajasthan &bull; Department of Skill &amp; Livelihoods</div>
      <div class="main-title">Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)</div>
      <div class="sub-title">Expression of Interest (EOI) Application &bull; Scheme: ${data.schemeTitle}</div>
    </div>
    <div style="text-align: right;">
      <div class="badge">Ref: ISMS-EOI-2026-9842</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Submitted: ${data.submissionTimestamp}</div>
    </div>
  </div>

  <div class="section-title">1. Organization &amp; Statutory Particulars</div>
  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">Applicant Organization</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${data.org.fullName}</td><td style="width: 20%; font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">CIN / Reg No</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${data.org.registrationNumber}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">Company PAN</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${data.org.companyPan}</td><td style="font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">GSTIN</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${data.org.gstin || 'Not Applicable'}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">Authorized Signatory</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${data.signatory.name} (${data.signatory.designation})</td><td style="font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">Contact / Email</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${data.signatory.mobileNo} | ${data.signatory.emailId}</td></tr>
  </table>

  <div class="section-title">2. Mandatory Proposal Documents Checklist (16 Documents)</div>
  <table>
    <thead><tr><th style="width: 35px; text-align: center;">#</th><th>Document Name</th><th>Category</th><th>Attached File</th></tr></thead>
    <tbody>${docRows}</tbody>
  </table>

  <div class="section-title">3. Fee Settlement Breakdown</div>
  <table>
    <thead><tr><th>Fee Particulars</th><th>Classification</th><th>Challan Reference</th><th style="text-align: right;">Amount (₹)</th></tr></thead>
    <tbody>
      <tr><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">EOI Tender Processing Fee</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Non-Refundable</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">GRN-RAJ-2026-981240</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${data.formattedProcessFee}</td></tr>
      <tr><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Earnest Money Deposit (EMD)</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Refundable Security</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${data.emdExempted ? 'EXEMPT-UDYAM' : 'GRN-RAJ-2026-981241'}</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${emdSettledText}</td></tr>
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="3" style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right;">Total Amount Settled:</td><td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-size: 13px; color: #0B3558;">${totalSettledText}</td></tr>
    </tbody>
  </table>

  <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10.5px; color: #64748b;">
    <div>Generated from ISMS 2.0 &bull; Secure Digitally Watermarked Document</div>
    <div>Date: ${data.submissionTimestamp} &bull; Page 1 of 1</div>
  </div>
</body>
</html>`;

    this.saveHtml(filename, htmlContent);
  }

  private buildDocRows(docs: EoiDocumentItem[]): string {
    return docs.map(d => `
      <tr>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #64748b;">${d.id}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 600; color: #0f172a;">${d.name}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #475569;">${d.category === 'mandatory' ? 'Mandatory Statutory' : (d.category === 'annexure' ? 'Scheme Annexure' : 'Supporting')}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #1e293b;">${d.fileName ? `${d.fileName} (${d.fileSize})` : 'Attached'}</td>
      </tr>
    `).join('');
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
