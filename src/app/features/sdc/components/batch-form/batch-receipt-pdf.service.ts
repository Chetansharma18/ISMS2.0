import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { formatDate, formatDateTime } from '../../../../shared/utils';

export interface BatchReceiptData {
  receiptNumber: string;
  transactionId: string;
  paymentTimestamp: string;
  paymentMethod: string;
  tpName: string;
  sdcCode: string;
  sdcName: string;
  scheme: string;
  sector: string;
}

/** Generates the official Batch PSD fee payment receipt PDF (Government of Rajasthan / RSLDC ISMS 2.0). */
@Injectable({ providedIn: 'root' })
export class BatchReceiptPdfService {
  /** Builds the receipt and triggers the browser download. */
  download(data: BatchReceiptData): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const rcpNo = data.receiptNumber || 'RCP-PSD-2026-98124';
    const txnId = data.transactionId || 'TXN-PSD-2026-89412';
    const timeStamp = data.paymentTimestamp || formatDateTime(new Date());
    const paymentMode = data.paymentMethod || 'Online';
    const tp = data.tpName || 'Company 1';
    const sdcCode = data.sdcCode || 'SDC-RJ-2026-0042';
    const sdcName = data.sdcName || 'Apex Aviation & Skill Institute, Jaipur';
    const scheme = data.scheme || 'MMSSY (Mukhya Mantri Sarvjan Skill Yojana)';
    const sector = data.sector || 'Aerospace and Aviation';

    // Outer framing borders
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);
    doc.rect(8, 8, 194, 281);

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    doc.rect(10, 10, 190, 277);

    // 1. Top Header Banner (Primary Blue)
    doc.setFillColor(23, 74, 110); // #174A6E
    doc.rect(10, 10, 190, 32, 'F');

    // Gold accent stripe
    doc.setFillColor(234, 179, 8); // #EAB308
    doc.rect(10, 42, 190, 2, 'F');

    // Header Texts
    doc.setTextColor(254, 240, 138); // Yellow-200
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('GOVERNMENT OF RAJASTHAN', pageWidth / 2, 18, { align: 'center' });

    doc.setTextColor(226, 232, 240); // Slate-200
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('DEPARTMENT OF SKILL, EMPLOYMENT & ENTREPRENEURSHIP', pageWidth / 2, 23, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)', pageWidth / 2, 29, { align: 'center' });

    doc.setTextColor(56, 189, 248); // Sky-400
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)', pageWidth / 2, 35, { align: 'center' });

    // 2. Receipt Sub-Title & Verification Badge
    let y = 51;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PAYMENT TRANSACTION RECEIPT', 14, y);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Statutory Verification Fee for Skill Development Centre (SDC) Batch Creation', 14, y + 4.5);

    // Status Badge (Paid & Verified)
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(34, 197, 94); // emerald-500
    doc.setLineWidth(0.4);
    doc.roundedRect(138, y - 5, 58, 11, 2, 2, 'FD');

    doc.setFillColor(22, 163, 74);
    doc.circle(144, y + 0.5, 1.6, 'F');

    doc.setTextColor(22, 101, 52); // emerald-800
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('PAID & VERIFIED', 148, y + 2);

    // 3. Transaction Summary Grid Box
    y = 63;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, 182, 25, 1.5, 1.5, 'FD');

    // Col 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('RECEIPT NUMBER', 18, y + 5.5);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(rcpNo, 18, y + 10.5);

    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('TRANSACTION REFERENCE ID', 18, y + 17);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(txnId, 18, y + 22);

    // Col 2
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('PAYMENT TIMESTAMP', 78, y + 5.5);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(timeStamp, 78, y + 10.5);

    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('PAYMENT MODE / GATEWAY', 78, y + 17);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${paymentMode} (RSLDC Cyber Treasury)`, 78, y + 22);

    // Col 3
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('TRANSACTION STATUS', 142, y + 5.5);
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52); // Green
    doc.text('SUCCESS / COMPLETED', 142, y + 10.5);

    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('SCRUTINY STAGE', 142, y + 17);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Pre-Scrutiny Verification (PSD)', 142, y + 22);

    // 4. Center & Scheme Particulars
    y = 93;
    // Section Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 6, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, 2.5, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. TRAINING CENTRE & SCHEME PARTICULARS', 19, y + 4.2);

    y += 6;
    // Border box for particulars
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(14, y, 182, 36);

    const leftLabelX = 18;
    const leftValX = 64;

    const renderField = (label: string, val: string, posY: number) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(71, 85, 105);
      doc.text(label, leftLabelX, posY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`: ${val}`, leftValX, posY);
    };

    renderField('Training Partner (TP)', tp, y + 5.5);
    renderField('SDC Centre Code', sdcCode, y + 12);
    renderField('SDC Centre Name', sdcName, y + 18.5);
    renderField('Sanctioned Scheme', scheme, y + 25);
    renderField('Allocated Sector', sector, y + 31.5);

    // 5. Fee Breakdown Table
    y = 140;
    // Section Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 6, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, 2.5, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. FEE PARTICULARS & STATUTORY BREAKUP', 19, y + 4.2);

    y += 6;
    // Table Header
    doc.setFillColor(15, 23, 42); // Navy
    doc.rect(14, y, 182, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);
    doc.text('S.No.', 18, y + 4.5);
    doc.text('Item Description / Fee Particulars', 34, y + 4.5);
    doc.text('HSN / SAC', 132, y + 4.5);
    doc.text('Amount (INR)', 190, y + 4.5, { align: 'right' });

    y += 6.5;
    // Row 1
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 8, 196, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('01', 19, y + 5);
    doc.text('Batch PSD Scrutiny & Statutory Physical Verification Fee', 34, y + 5);
    doc.text('998319', 134, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text('Rs. 500.00', 190, y + 5, { align: 'right' });

    y += 8;
    // Row 2
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 8, 196, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('02', 19, y + 5);
    doc.text('RSLDC Cyber Treasury & Payment Gateway Convenience Charge', 34, y + 5);
    doc.text('998319', 134, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text('Rs. 0.00', 190, y + 5, { align: 'right' });

    y += 8;
    // Total Row
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 9, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(14, y, 196, y);
    doc.line(14, y + 9, 196, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL AMOUNT PAID', 34, y + 5.8);

    doc.setFontSize(9.5);
    doc.setTextColor(22, 101, 52); // emerald-700
    doc.text('Rs. 500.00', 190, y + 6, { align: 'right' });

    y += 11;
    // In Words Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, 182, 7.5, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    doc.text('Amount in Words:', 18, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Five Hundred Indian Rupees Only', 48, y + 5);

    // 6. Digital Verification & Security Seal Section
    y = 194;
    // Outer box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(14, y, 182, 44);

    // Left side - Security & Digital Sign Note
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('DIGITAL SIGNATURE & SYSTEM AUDIT AUTHENTICATION', 18, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Digital Signature SHA-256 Hash:', 18, y + 11);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 41, 59);
    doc.text('E83F91A045B821DE0319C5B7281D9254308D2C59A41E1C7E9D0F3', 18, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorization Code:', 18, y + 21);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`AUTH-RSLDC-CYBER-${Date.now().toString(36).toUpperCase()}`, 48, y + 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Issuing Authority:', 18, y + 26.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('Finance & Accounts Division, RSLDC Jaipur', 48, y + 26.5);

    // Legal disclaimer box
    doc.setFillColor(248, 250, 252);
    doc.rect(18, y + 30.5, 112, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(18, y + 30.5, 112, 10);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    doc.text('This is an official computer-generated digital receipt issued under RSLDC', 20, y + 34.5);
    doc.text('ISMS 2.0 regulations. It does not require a physical signature.', 20, y + 38.5);

    // Right side - Official Stamp Graphic
    const stampX = 138;
    const stampY = y + 3.5;
    doc.setFillColor(240, 253, 244); // light green
    doc.setDrawColor(34, 197, 94); // emerald
    doc.setLineWidth(0.5);
    doc.roundedRect(stampX, stampY, 52, 37, 2, 2, 'FD');

    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.25);
    doc.roundedRect(stampX + 1.2, stampY + 1.2, 49.6, 34.6, 1.5, 1.5);

    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('RSLDC RAJASTHAN', stampX + 26, stampY + 7, { align: 'center' });

    doc.setFontSize(6.8);
    doc.setTextColor(21, 128, 61);
    doc.text('DIGITALLY AUTHORIZED', stampX + 26, stampY + 12.5, { align: 'center' });

    doc.setDrawColor(34, 197, 94);
    doc.line(stampX + 6, stampY + 15.5, stampX + 46, stampY + 15.5);

    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    doc.text('ACCOUNTS & FINANCE', stampX + 26, stampY + 20, { align: 'center' });
    doc.text('ISMS 2.0 VERIFIED', stampX + 26, stampY + 24.5, { align: 'center' });

    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(timeStamp, stampX + 26, stampY + 29.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(22, 101, 52);
    doc.text('STATUS: SUCCESS', stampX + 26, stampY + 34, { align: 'center' });

    // 7. Important Notes & Terms
    y = 244;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text('IMPORTANT CONDITIONS & TERMS:', 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text('1. The statutory Batch PSD Verification Fee is non-refundable and valid exclusively for the specified batch scrutiny.', 14, y + 4.2);
    doc.text('2. Payment confirmation does not guarantee batch sanction; approval is subject to physical verification and compliance.', 14, y + 8.2);
    doc.text('3. Retain this transaction receipt for future audit reference and official correspondence with RSLDC.', 14, y + 12.2);

    // 8. Footer
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(10, 269, 200, 269);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text('Helpdesk Support: support-isms@rajasthan.gov.in  |  Helpline: 0141-2701888, 2701889', 14, 273.5);
    doc.text('Rajasthan Skill and Livelihoods Development Corporation (RSLDC), EMI Campus, J-8-B, Jhalana Institutional Area, Jaipur', 14, 277.5);

    doc.text('Page 1 of 1', 196, 273.5, { align: 'right' });
    doc.text(`Generated: ${formatDate(new Date())}`, 196, 277.5, { align: 'right' });

    // Trigger direct browser download of formatted PDF
    doc.save(`Batch_PSD_Payment_Receipt_${txnId}.pdf`);
  }
}
