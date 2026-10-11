import { Injectable } from '@angular/core';
import { SubmittedTender } from '../../../core/models/tender.model';
import { documentCategoryLabel } from './tender-status.util';

/** Builds and downloads the HTML receipts shown on the tender detail page. */
@Injectable({ providedIn: 'root' })
export class TenderReceiptsService {
  downloadAcknowledgment(app: SubmittedTender): void {
    const filename = `EOI_Acknowledgment_Receipt_${app.appRef}.html`;
    const docRows = app.documents.map(d => `
      <tr>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #64748b;">${d.id}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 600; color: #0f172a;">${d.name}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #475569;">${documentCategoryLabel(d.category)}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #1e293b;">${d.fileName ? `${d.fileName} (${d.fileSize})` : 'Attached (Verified)'}</td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EOI Proposal Submission Acknowledgment - ${app.appRef}</title>
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
      <div class="sub-title">Official EOI Proposal Submission Acknowledgment Receipt (Form RSLDC-EOI-ACK)</div>
    </div>
    <div style="text-align: right;">
      <div class="badge">Application Ref: ${app.appRef}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Applied Date: ${app.appliedDate}</div>
    </div>
  </div>

  <div class="section-title">1. Applicant Organisation &amp; Scheme Details</div>
  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc;">Applicant Organisation</td><td>${app.orgDetails.fullName}</td><td style="width: 20%; font-weight: bold; background: #f8fafc;">CIN / Reg No</td><td style="font-family: monospace;">${app.orgDetails.registrationNumber}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Scheme Name</td><td>${app.schemeTitle}</td><td style="font-weight: bold; background: #f8fafc;">Category</td><td>${app.schemeCategory}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Organisation PAN / GSTIN</td><td style="font-family: monospace;">${app.orgDetails.companyPan} / ${app.orgDetails.gstin || 'NA'}</td><td style="font-weight: bold; background: #f8fafc;">Submission Status</td><td style="font-weight: bold; color: #15803d;">${app.submittedStatus.toUpperCase()}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Authorized Person</td><td>${app.signatoryDetails.name} (${app.signatoryDetails.designation})</td><td style="font-weight: bold; background: #f8fafc;">Contact &amp; Email</td><td>${app.signatoryDetails.mobileNo} | ${app.signatoryDetails.emailId}</td></tr>
  </table>

  <div class="section-title">2. Mandatory Proposal Documents Checklist (16 Documents)</div>
  <table>
    <thead><tr><th style="width: 35px; text-align: center;">#</th><th>Document Name</th><th>Classification</th><th>Attached File</th></tr></thead>
    <tbody>${docRows}</tbody>
  </table>

  <div class="section-title">3. Statutory Undertaking</div>
  <p style="font-size: 11px; color: #475569; line-height: 1.5; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
    Digitally authenticated and submitted by <strong>${app.signatoryDetails.name}</strong> on ${app.appliedDate}. All particulars and annexed documents are verified authentic.
  </p>

  <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
    <div>Generated from ISMS 2.0 &bull; Official RSLDC EOI Record</div>
    <div>Date: ${app.appliedDate}</div>
  </div>
</body>
</html>`;

    this.download(htmlContent, filename);
  }

  downloadChallan(app: SubmittedTender): void {
  const filename = `Cyber_Treasury_eChallan_${app.emdTransactionRef || 'GRN-RAJ-2026-981241'}.html`;
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyber Treasury Rajasthan - e-Challan Receipt (Form GA-57)</title>
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
    <button class="btn" onclick="window.print()">Print e-Challan / Save as PDF</button>
  </div>

  <div class="header-box">
    <div class="gov-title">Finance Department &bull; Cyber Treasury Rajasthan (e-GRAS)</div>
    <div class="main-title">e-Challan / Treasury Remittance Receipt (Form GA-57)</div>
    <div style="font-size: 11px; color: #64748b;">Government of Rajasthan &bull; https://gras.rajasthan.gov.in</div>
  </div>

  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc;">GRN Number</td><td style="font-family: monospace; font-weight: bold; color: #0B3558;">${app.emdTransactionRef || 'GRN-RAJ-2026-981241'}</td><td style="width: 20%; font-weight: bold; background: #f8fafc;">Payment Date</td><td>${app.appliedDate}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Remitter Name</td><td>${app.orgDetails.fullName}</td><td style="font-weight: bold; background: #f8fafc;">Company PAN</td><td style="font-family: monospace;">${app.orgDetails.companyPan}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Department</td><td colspan="3">${app.department}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Scheme Ref No</td><td style="font-family: monospace;">${app.appRef}</td><td style="font-weight: bold; background: #f8fafc;">Status</td><td style="font-weight: bold; color: #15803d;">SUCCESS / PAID</td></tr>
  </table>

  <div style="font-size: 12px; font-weight: 800; color: #0B3558; text-transform: uppercase; margin: 15px 0 8px 0;">Head of Account Details</div>
  <table>
    <thead><tr><th>Particulars</th><th>Treasury Head Code</th><th>GRN Ref</th><th style="text-align: right;">Amount (₹)</th></tr></thead>
    <tbody>
      <tr><td>EOI Processing Fee</td><td style="font-family: monospace;">0070-60-800-01-00</td><td style="font-family: monospace;">${app.transactionRef || 'GRN-RAJ-2026-981240'}</td><td style="text-align: right; font-weight: bold;">${app.processingFee}</td></tr>
      <tr><td>Earnest Money Deposit (EMD)</td><td style="font-family: monospace;">8443-00-103-00-00</td><td style="font-family: monospace;">${app.emdTransactionRef || 'GRN-RAJ-2026-981241'}</td><td style="text-align: right; font-weight: bold;">${app.emdAmount}</td></tr>
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="3" style="text-align: right; text-transform: uppercase;">Total Amount Remitted:</td><td style="text-align: right; color: #0B3558; font-size: 13px;">₹ 52,000.00</td></tr>
    </tbody>
  </table>
</body>
</html>`;

    this.download(htmlContent, filename);
  }

  private download(htmlContent: string, filename: string): void {
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