import { Injectable } from '@angular/core';
import { SubmittedTender } from '../../../core/models/tender.model';
import { documentCategoryLabel } from './tender-status.util';

const RECEIPT_STYLES = `
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
    .label { width: 25%; font-weight: bold; background: #f8fafc; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
`;

const PAYEE = 'Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)';

/** Builds and downloads the HTML receipts of a submitted application. */
@Injectable({ providedIn: 'root' })
export class TenderReceiptsService {
  downloadAcknowledgment(app: SubmittedTender): void {
    const docRows = app.documents.map(d => `
      <tr>
        <td style="text-align: center; font-weight: bold; color: #64748b;">${d.id}</td>
        <td style="font-weight: 600; color: #0f172a;">${d.name}</td>
        <td style="color: #475569;">${documentCategoryLabel(d.category)}</td>
        <td style="font-family: monospace; color: #1e293b;">${d.fileName ? `${d.fileName} (${d.fileSize})` : 'Attached'}</td>
      </tr>
    `).join('');

    const body = `
  <div class="header-box">
    <div>
      <div class="gov-title">Government of Rajasthan</div>
      <div class="main-title">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</div>
      <div class="sub-title">EOI Submission Acknowledgment</div>
    </div>
    <div style="text-align: right;">
      <div class="badge">EOI Submission Ref: ${app.appRef}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Submitted: ${app.appliedDate}</div>
    </div>
  </div>

  <div class="section-title">1. Applicant &amp; Scheme Details</div>
  <table>
    <tr><td class="label">Organisation</td><td>${app.orgDetails.fullName}</td><td class="label">CIN / Reg No</td><td style="font-family: monospace;">${app.orgDetails.registrationNumber}</td></tr>
    <tr><td class="label">Scheme</td><td>${app.schemeTitle}</td><td class="label">Category</td><td>${app.schemeCategory}</td></tr>
    <tr><td class="label">PAN / GSTIN</td><td style="font-family: monospace;">${app.orgDetails.companyPan} / ${app.orgDetails.gstin || 'NA'}</td><td class="label">Status</td><td style="font-weight: bold;">${app.submittedStatus}</td></tr>
    <tr><td class="label">Authorized Person</td><td>${app.signatoryDetails.name} (${app.signatoryDetails.designation})</td><td class="label">Contact</td><td>${app.signatoryDetails.mobileNo} | ${app.signatoryDetails.emailId}</td></tr>
  </table>

  <div class="section-title">2. Proposal Documents</div>
  <table>
    <thead><tr><th style="width: 35px; text-align: center;">#</th><th>Document</th><th>Category</th><th>Attached File</th></tr></thead>
    <tbody>${docRows}</tbody>
  </table>

  <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
    <div>Generated from ISMS 2.0</div>
    <div>Date: ${app.appliedDate}</div>
  </div>`;

    this.download(
      this.page(`EOI Submission Acknowledgment - ${app.appRef}`, body),
      `EOI_Submission_Acknowledgment_${app.appRef}.html`
    );
  }

  downloadProcessingFeeReceipt(app: SubmittedTender): void {
    this.download(
      this.page(
        'Processing Fee Receipt',
        this.paymentReceiptBody(app, 'Processing Fee Receipt', app.transactionRef, 'Processing Fee', app.processingFee)
      ),
      `Processing_Fee_Receipt_${app.transactionRef || app.appRef}.html`
    );
  }

  downloadEmdReceipt(app: SubmittedTender): void {
    this.download(
      this.page(
        'EMD Receipt',
        this.paymentReceiptBody(app, 'EMD Receipt', app.emdTransactionRef, 'Earnest Money Deposit (EMD)', app.emdAmount)
      ),
      `EMD_Receipt_${app.emdTransactionRef || app.appRef}.html`
    );
  }

  private paymentReceiptBody(app: SubmittedTender, title: string, reference: string, particulars: string, amount: string): string {
    return `
  <div class="header-box">
    <div>
      <div class="gov-title">Government of Rajasthan</div>
      <div class="main-title">${title}</div>
    </div>
    <div style="text-align: right;">
      <div class="badge">Payment Reference No.: ${reference || '-'}</div>
    </div>
  </div>

  <table>
    <tr><td class="label">Payment Reference No.</td><td style="font-family: monospace; font-weight: bold; color: #0B3558;">${reference || '-'}</td><td class="label">Paid On</td><td>${app.appliedDate}</td></tr>
    <tr><td class="label">Paid By</td><td>${app.orgDetails.fullName}</td><td class="label">CIN / PAN</td><td style="font-family: monospace;">${app.orgDetails.registrationNumber} / ${app.orgDetails.companyPan}</td></tr>
    <tr><td class="label">Payable To</td><td>${PAYEE}</td><td class="label">EOI Reference</td><td style="font-family: monospace;">${app.appRef}</td></tr>
  </table>

  <table>
    <thead><tr><th>Particulars</th><th style="text-align: right;">Amount</th></tr></thead>
    <tbody>
      <tr><td>${particulars}</td><td style="text-align: right; font-weight: bold;">${amount}</td></tr>
    </tbody>
  </table>

  <div style="margin-top: 25px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #64748b; text-align: center;">
    This is a computer-generated receipt.
  </div>`;
  }

  private page(title: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>${RECEIPT_STYLES}</style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
${body}
</body>
</html>`;
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
