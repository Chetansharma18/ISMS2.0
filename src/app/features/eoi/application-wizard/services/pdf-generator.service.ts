import { Injectable } from '@angular/core';

export interface ReceiptPdfData {
  applicationNumber: string;
  acknowledgementReceiptNumber: string;
  eoiRefNumber: string;
  submissionDate: string;
  submissionTimestamp: string;
  tpName: string;
  regNumber: string;
  tpPan: string;
  tpEmail: string;
  tpMobile: string;
  authPerson: string;
  authDesignation: string;
  processingFee: number;
  emdFee: number;
  totalFee: number;
  transactionId: string;
  paymentMethod: string;
  paymentDate: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  generateReceiptPdfBlob(data: ReceiptPdfData): Blob {
    const sanitize = (text: string | null | undefined): string => {
      if (!text) return '';
      return String(text)
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/[^\x20-\x7E]/g, ' '); // ASCII only for Type 1 Helvetica
    };

    const appNo = sanitize(data.applicationNumber || 'ISMS-TP-2026-884921');
    const ackNo = sanitize(data.acknowledgementReceiptNumber || 'ACK-RSLDC-2026-9921');
    const eoiRef = sanitize(data.eoiRefNumber || 'EOI/RSLDC/ISMS/2026/04');
    const subDate = sanitize(data.submissionTimestamp || data.submissionDate || '08-Sep-2026');
    const tpName = sanitize(data.tpName || 'Apex Skill Development Foundation');
    const regNo = sanitize(data.regNumber || 'REG/RAJ/2018/88921');
    const pan = sanitize(data.tpPan || 'AAACA1234C');
    const email = sanitize(data.tpEmail || 'contact@apexskills.org');
    const mobile = sanitize(data.tpMobile || '9829012345');
    const authName = sanitize(data.authPerson || 'Rajesh Kumar Sharma');
    const authDesig = sanitize(data.authDesignation || 'Managing Director & CEO');
    const txnId = sanitize(data.transactionId || 'TXN-ISMS-2026-884921');
    const payMethod = sanitize(data.paymentMethod || 'UPI / Internet Banking');
    const payDate = sanitize(data.paymentDate || '08-Sep-2026');
    const procFee = data.processingFee || 500;
    const emdFee = data.emdFee || 100000;
    const totalFee = data.totalFee || 100500;

    const streamCommands = [
      // Outer Page Border
      '0.85 0.88 0.92 RG 1 w',
      '20 20 555 802 re S',
      
      // Top Navy Header Banner
      '0.075 0.102 0.302 rg', // Deep Navy #131A4D
      '20 730 555 92 re f',
      
      // Saffron/Gold Accent Strip
      '0.902 0.494 0.133 rg', // Saffron #E67E22
      '20 725 555 5 re f',
      
      // Header Typography
      'BT',
      '/F2 10 Tf 0.973 0.706 0.443 rg', // Gold font
      '36 798 Td (GOVERNMENT OF RAJASTHAN) Tj',
      '/F1 9 Tf 0.90 0.93 0.98 rg',
      '0 -13 Td (Rajasthan Skill & Livelihoods Development Corporation \\(RSLDC\\)) Tj',
      '/F2 15 Tf 1 1 1 rg',
      '0 -18 Td (ISMS 2.0 - INTEGRATED SCHEME MANAGEMENT SYSTEM) Tj',
      '/F2 10.5 Tf 0.85 0.92 1 rg',
      '0 -15 Td (EOI APPLICATION SUBMISSION RECEIPT & ACKNOWLEDGEMENT) Tj',
      'ET',
      
      // Reference Details Card (Light blue background)
      '0.941 0.965 0.992 rg 0.733 0.855 0.969 RG 1 w',
      '35 650 525 60 re B',
      'BT',
      '/F2 9.5 Tf 0.075 0.247 0.541 rg',
      '48 694 Td (Application Reference No:) Tj',
      '/F2 12 Tf 0.075 0.102 0.302 rg',
      '0 -14 Td (' + appNo + ') Tj',
      '/F2 9.5 Tf 0.075 0.247 0.541 rg',
      '220 14 Td (Acknowledgement No:) Tj',
      '/F1 10.5 Tf 0.12 0.16 0.23 rg',
      '0 -14 Td (' + ackNo + ') Tj',
      '/F2 9.5 Tf 0.075 0.247 0.541 rg',
      '140 14 Td (Submission Timestamp:) Tj',
      '/F1 9.5 Tf 0.12 0.16 0.23 rg',
      '0 -14 Td (' + subDate + ') Tj',
      'ET',

      // Section 1: Applicant Organization Details Header
      '0.945 0.961 0.976 rg 35 620 525 20 re f',
      '0.886 0.910 0.941 RG 1 w 35 620 525 20 re S',
      'BT',
      '/F2 9.5 Tf 0.075 0.102 0.302 rg',
      '45 626 Td (1. APPLICANT & TRAINING PROVIDER INFORMATION) Tj',
      'ET',

      // Section 1: Field values
      'BT',
      '/F2 8.5 Tf 0.40 0.45 0.55 rg',
      '45 602 Td (Organization Full Name:) Tj',
      '/F1 9 Tf 0.12 0.16 0.23 rg',
      '150 0 Td (' + tpName + ') Tj',
      '/F2 8.5 Tf 0.40 0.45 0.55 rg',
      '-150 -16 Td (Registration / Trust No:) Tj',
      '/F1 9 Tf 0.12 0.16 0.23 rg',
      '150 0 Td (' + regNo + ') Tj',
      '/F2 8.5 Tf 0.40 0.45 0.55 rg',
      '150 0 Td (Entity PAN:) Tj',
      '/F1 9 Tf 0.12 0.16 0.23 rg',
      '60 0 Td (' + pan + ') Tj',
      '/F2 8.5 Tf 0.40 0.45 0.55 rg',
      '-360 -16 Td (Authorized Signatory:) Tj',
      '/F1 9 Tf 0.12 0.16 0.23 rg',
      '150 0 Td (' + authName + ' \\(' + authDesig + '\\)) Tj',
      '/F2 8.5 Tf 0.40 0.45 0.55 rg',
      '-150 -16 Td (Official Contact:) Tj',
      '/F1 9 Tf 0.12 0.16 0.23 rg',
      '150 0 Td (' + mobile + '  |  ' + email + ') Tj',
      'ET',

      // Section 2: Fee Payment & Transaction Details Header
      '0.945 0.961 0.976 rg 35 515 525 20 re f',
      '0.886 0.910 0.941 RG 1 w 35 515 525 20 re S',
      'BT',
      '/F2 9.5 Tf 0.075 0.102 0.302 rg',
      '45 521 Td (2. MANDATORY FEE PAYMENT & TRANSACTION DETAILS) Tj',
      'ET',

      // Payment Table Header
      '0.973 0.980 0.988 rg 35 488 525 18 re f',
      '0.886 0.910 0.941 RG 1 w 35 488 525 18 re S',
      'BT',
      '/F2 8.5 Tf 0.20 0.25 0.35 rg',
      '45 493 Td (Fee Description) Tj',
      '220 0 Td (Accounting Head) Tj',
      '130 0 Td (Payment Status) Tj',
      '80 0 Td (Amount \\(INR\\)) Tj',
      'ET',

      // Table Row 1 (Processing Fee)
      '0.886 0.910 0.941 RG 1 w 35 466 525 22 re S',
      'BT',
      '/F1 8.5 Tf 0.12 0.16 0.23 rg',
      '45 473 Td (EOI Proposal Processing Fee \\(Non-Refundable\\)) Tj',
      '/F1 8 Tf 0.40 0.45 0.55 rg',
      '220 0 Td (RSLDC-FEE-PROC-2026) Tj',
      '/F2 8.5 Tf 0.086 0.639 0.290 rg', // Green
      '130 0 Td (SUCCESSFUL / PAID) Tj',
      '/F2 9 Tf 0.12 0.16 0.23 rg',
      '80 0 Td (Rs. ' + procFee.toLocaleString('en-IN') + ') Tj',
      'ET',

      // Table Row 2 (EMD Fee)
      '0.886 0.910 0.941 RG 1 w 35 444 525 22 re S',
      'BT',
      '/F1 8.5 Tf 0.12 0.16 0.23 rg',
      '45 451 Td (Earnest Money Deposit \\(EMD\\)) Tj',
      '/F1 8 Tf 0.40 0.45 0.55 rg',
      '220 0 Td (RSLDC-EMD-SEC-2026) Tj',
      '/F2 8.5 Tf 0.086 0.639 0.290 rg',
      '130 0 Td (SUCCESSFUL / PAID) Tj',
      '/F2 9 Tf 0.12 0.16 0.23 rg',
      '80 0 Td (Rs. ' + emdFee.toLocaleString('en-IN') + ') Tj',
      'ET',

      // Table Total Row
      '0.961 0.976 0.992 rg 35 420 525 24 re f',
      '0.80 0.86 0.94 RG 1.5 w 35 420 525 24 re S',
      'BT',
      '/F2 9.5 Tf 0.075 0.102 0.302 rg',
      '45 428 Td (Total Amount Received & Realized in RSLDC Account:) Tj',
      '/F2 11 Tf 0.118 0.302 0.561 rg',
      '370 0 Td (Rs. ' + totalFee.toLocaleString('en-IN') + ') Tj',
      'ET',

      // Payment meta details
      'BT',
      '/F2 8.5 Tf 0.40 0.45 0.55 rg',
      '45 398 Td (Gateway Transaction ID:) Tj',
      '/F2 8.5 Tf 0.075 0.102 0.302 rg',
      '130 0 Td (' + txnId + ') Tj',
      '/F2 8.5 Tf 0.40 0.45 0.55 rg',
      '140 0 Td (Payment Method:) Tj',
      '/F1 8.5 Tf 0.12 0.16 0.23 rg',
      '80 0 Td (' + payMethod + ') Tj',
      'ET',

      // Section 3: Verified Uploaded Documents
      '0.945 0.961 0.976 rg 35 365 525 20 re f',
      '0.886 0.910 0.941 RG 1 w 35 365 525 20 re S',
      'BT',
      '/F2 9.5 Tf 0.075 0.102 0.302 rg',
      '45 371 Td (3. VERIFIED PROPOSAL DOCUMENTS & SUBMISSION CHECKLIST) Tj',
      'ET',

      'BT',
      '/F2 8.5 Tf 0.086 0.639 0.290 rg',
      '45 345 Td ([V] 1. Company / Entity Registration Certificate) Tj',
      '/F1 8 Tf 0.40 0.45 0.55 rg',
      '260 0 Td (company_registration_incorporation_proof.pdf) Tj',
      '/F2 8.5 Tf 0.086 0.639 0.290 rg',
      '-260 -15 Td ([V] 2. Past Skill Training Experience Certificates) Tj',
      '/F1 8 Tf 0.40 0.45 0.55 rg',
      '260 0 Td (previous_training_experience_certificates.pdf) Tj',
      '/F2 8.5 Tf 0.086 0.639 0.290 rg',
      '-260 -15 Td ([V] 3. CA Certified Annual Turnover \\(Last 3 FY\\)) Tj',
      '/F1 8 Tf 0.40 0.45 0.55 rg',
      '260 0 Td (ca_certified_turnover_certificate_last_3_fy.pdf) Tj',
      '/F2 8.5 Tf 0.086 0.639 0.290 rg',
      '-260 -15 Td ([V] 4. Technical Proposal & Action Plan 2025-26) Tj',
      '/F1 8 Tf 0.40 0.45 0.55 rg',
      '260 0 Td (technical_proposal_methodology_2025_26.pdf) Tj',
      'ET',

      // Section 4: Official Digital Seal & Modification Rules Box
      '0.980 0.984 0.988 rg 0.85 0.88 0.92 RG 1 w',
      '35 185 525 80 re B',
      
      // Verified Stamp in Box
      '0.075 0.302 0.561 RG 1.5 w',
      '400 196 145 58 re S',
      'BT',
      '/F2 8 Tf 0.075 0.302 0.561 rg',
      '412 238 Td (RSLDC ISMS 2.0 PORTAL) Tj',
      '/F2 9.5 Tf 0.086 0.639 0.290 rg',
      '412 222 Td (OFFICIALLY VERIFIED) Tj',
      '/F1 7.5 Tf 0.40 0.45 0.55 rg',
      '412 208 Td (Digitally Authenticated) Tj',
      'ET',

      // Modification Window note inside Box
      'BT',
      '/F2 8.5 Tf 0.12 0.16 0.23 rg',
      '48 245 Td (Post-Submission Online Modification Window:) Tj',
      '/F1 8 Tf 0.30 0.35 0.45 rg',
      '0 -13 Td (Applicants can modify their submitted EOI online up to 3 times) Tj',
      '0 -11 Td (before the official tender deadline: 30 September 2026, 23:59:59 IST.) Tj',
      '/F2 8 Tf 0.075 0.102 0.302 rg',
      '0 -13 Td (EOI Reference: ' + eoiRef + ') Tj',
      'ET',

      // Footer Legal Disclaimer
      'BT',
      '/F1 7.5 Tf 0.50 0.55 0.65 rg',
      '36 50 Td (This is an electronically generated official receipt issued by the Government of Rajasthan under the IT Act 2000.) Tj',
      '0 -10 Td (Rajasthan Skill and Livelihoods Development Corporation \\(RSLDC\\), Kaushal Bhawan, J-8-B, Jhalana Institutional Area, Jaipur - 302004) Tj',
      '0 -10 Td (Portal URL: https://rsldc.rajasthan.gov.in  |  Helpdesk Toll Free: 1800-180-6127) Tj',
      'ET'
    ];

    const streamContent = streamCommands.join('\n');
    const streamLength = new TextEncoder().encode(streamContent).length;

    const objects: string[] = [];

    // Object 1: Catalog
    objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);

    // Object 2: Pages
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`);

    // Object 3: Page
    objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`);

    // Object 4: Font Regular (Helvetica)
    objects.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj`);

    // Object 5: Font Bold (Helvetica-Bold)
    objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj`);

    // Object 6: Content Stream
    objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`);

    // Calculate xref offsets
    let pdfHeader = `%PDF-1.4\n%âãÏÓ\n`;
    let byteOffset = new TextEncoder().encode(pdfHeader).length;
    const xrefOffsets: number[] = [0];

    let fullBody = pdfHeader;

    for (let i = 0; i < objects.length; i++) {
      xrefOffsets.push(byteOffset);
      const objStr = objects[i] + '\n';
      fullBody += objStr;
      byteOffset += new TextEncoder().encode(objStr).length;
    }

    const startXref = byteOffset;
    let xrefTable = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      const offsetStr = String(xrefOffsets[i]).padStart(10, '0');
      xrefTable += `${offsetStr} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
    const fullPdfText = fullBody + xrefTable + trailer;

    return new Blob([new TextEncoder().encode(fullPdfText)], { type: 'application/pdf' });
  }

  downloadReceiptPdf(data: ReceiptPdfData, filename?: string): void {
    const blob = this.generateReceiptPdfBlob(data);
    const pdfFilename = filename || `Receipt_${data.applicationNumber || 'ISMS_2026'}.pdf`;
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdfFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
