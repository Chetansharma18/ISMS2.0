import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { OtrFormData } from '../models/otr-form.model';

@Injectable({
  providedIn: 'root'
})
export class OtrPdfService {

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
      const existing = document.querySelector<HTMLImageElement>(`img[src="${src}"]`);
      if (existing && existing.complete && existing.naturalWidth > 0) {
        const dataUrl = this.getBase64FromImage(existing);
        if (dataUrl) return dataUrl;
      }

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
   * Generates and downloads the official OTR Profile PDF using jsPDF.
   * Completely excludes Officer In-Charge as per requirement.
   */
  async generateOtrPdf(data: OtrFormData, regIdOverride?: string | null): Promise<void> {
    const s1 = data.step1;
    const s3 = data.step3;
    const s4 = data.step4;
    const regId = regIdOverride || data.registrationId || 'ISMS-OTR-2026-DRAFT';
    const safeRegId = regId.replace(/[^a-zA-Z0-9_-]/g, '_');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const [emblemBase64, rsldcBase64] = await Promise.all([
      this.loadLogoImage('/Rajasthan-Sarkar.png'),
      this.loadLogoImage('/rsldc-logo.png')
    ]);

    let currentPage = 1;

    const renderHeader = (isFirstPage: boolean) => {
      // Outer framing border
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.35);
      doc.rect(8, 8, 194, 281);

      if (isFirstPage) {
        // Top banner background
        doc.setFillColor(255, 255, 255);
        doc.rect(8.4, 8.4, 193.2, 31, 'F');

        // Logos
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

        // Header Titles (Centered)
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
        doc.setTextColor(2, 132, 199);
        doc.text('ONE TIME REGISTRATION (OTR) - COMPANY PROFILE APPLICATION', 105, 34, { align: 'center' });

        // Accent Separators
        doc.setFillColor(234, 179, 8); // Gold accent stripe
        doc.rect(8, 38.5, 194, 1.2, 'F');
        doc.setFillColor(11, 53, 88); // Navy accent stripe
        doc.rect(8, 39.7, 194, 0.4, 'F');
      } else {
        // Minimal header for continuation pages
        doc.setFillColor(248, 250, 252);
        doc.rect(8.4, 8.4, 193.2, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(11, 53, 88);
        doc.text(`ISMS 2.0 • ONE TIME REGISTRATION (OTR) — Ref: ${regId}`, 12, 15);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Page ${currentPage}`, 196, 15, { align: 'right' });
        doc.setFillColor(11, 53, 88);
        doc.rect(8, 18.5, 194, 0.4, 'F');
      }

      // Page footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | ISMS 2.0 Secure Registration Record | Page ${currentPage}`,
        105,
        286,
        { align: 'center' }
      );
    };

    renderHeader(true);

    let y = 43;

    // Registration Meta Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, y, 190, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(11, 53, 88);
    doc.text('REGISTRATION REFERENCE:', 14, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text(regId, 62, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(11, 53, 88);
    doc.text('STATUS:', 14, y + 9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61); // Green
    doc.text(data.status === 'Submitted' ? 'SUBMITTED / PENDING VERIFICATION' : 'DRAFT / PREVIEW', 62, y + 9.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Submission Date: ${data.submittedAt ? new Date(data.submittedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}`, 145, y + 7);

    y += 16;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > 275) {
        doc.addPage();
        currentPage++;
        renderHeader(false);
        y = 22;
      }
    };

    const drawSectionHeader = (title: string, badgeNum: string) => {
      checkPageBreak(12);
      doc.setFillColor(11, 53, 88);
      doc.roundedRect(10, y, 190, 6.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(255, 255, 255);
      doc.text(`[ ${badgeNum} ]  ${title.toUpperCase()}`, 14, y + 4.6);
      y += 8.5;
    };

    const drawTableRow = (label1: string, val1: string, label2?: string, val2?: string) => {
      checkPageBreak(6);
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);

      if (label2 !== undefined) {
        // Two-column pair row
        doc.rect(10, y, 40, 5.5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.text(label1, 12, y + 3.8);

        doc.rect(50, y, 55, 5.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const cleanVal1 = doc.splitTextToSize(val1 || '-', 52)[0] || '-';
        doc.text(cleanVal1, 52, y + 3.8);

        doc.setFillColor(250, 250, 250);
        doc.rect(105, y, 40, 5.5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text(label2, 107, y + 3.8);

        doc.rect(145, y, 55, 5.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const cleanVal2 = doc.splitTextToSize(val2 || '-', 52)[0] || '-';
        doc.text(cleanVal2, 147, y + 3.8);

        y += 5.5;
      } else {
        // Full width row
        doc.rect(10, y, 40, 5.5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.text(label1, 12, y + 3.8);

        doc.rect(50, y, 150, 5.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const cleanVal = doc.splitTextToSize(val1 || '-', 145)[0] || '-';
        doc.text(cleanVal, 52, y + 3.8);

        y += 5.5;
      }
    };

    // SECTION 1: ORGANIZATION DETAILS
    drawSectionHeader('Organization & Legal Particulars', '1');
    drawTableRow('Organization Name', s1.fullName || '-', 'Nature of Entity', s1.natureOfEntity || '-');
    drawTableRow('Registration No. (CIN)', s1.registrationNumber || '-', 'Date of Registration', s1.dateOfRegistration || '-');
    drawTableRow('State/UT of Registration', s1.stateOfLegalReg || '-', 'Organization PAN', s1.companyPan || '-');
    drawTableRow('GST Registered', `${s1.gstRegistered} ${s1.gstRegistered === 'Yes' && s1.gstin ? '(' + s1.gstin + ')' : ''}`, 'MSME Registered', `${s1.msmeRegistered} ${s1.msmeRegistered === 'Yes' && s1.udyamNumber ? '(' + s1.udyamNumber + ')' : ''}`);
    drawTableRow('NSDC Partner', s1.nsdcPartner || 'Not Applicable', 'Contact Number', s1.contactNo || '-');
    drawTableRow('Official Email ID', s1.emailId || '-', 'Website', s1.website || '-');

    const regAddressStr = [s1.registeredAddress, s1.registeredDistrict, s1.registeredState]
      .filter(p => !!p && p.trim())
      .join(', ') + (s1.registeredPincode ? ' - ' + s1.registeredPincode.trim() : '') || '-';
    drawTableRow('Registered Address', regAddressStr);

    const officeAddressStr = s1.sameAsRegistered
      ? 'Same as Registered Office Address'
      : ([s1.officeAddress, s1.officeDistrict, s1.officeState]
          .filter(p => !!p && p.trim())
          .join(', ') + (s1.officePincode ? ' - ' + s1.officePincode.trim() : '') || '-');
    drawTableRow('Operational Address', officeAddressStr);

    y += 4;

    // SECTION 2: AUTHORIZED PERSON DETAILS
    drawSectionHeader('Authorized Person Details', '2');
    drawTableRow('Full Name', s3.name || '-', 'Designation', s3.designation || '-');
    drawTableRow('Date of Birth', s3.dob || '-', 'Age', s3.age ? `${s3.age} Years` : '-');
    drawTableRow('Personal PAN', s3.pan || '-', 'Aadhaar Number', s3.aadhaarNo || '-');
    drawTableRow('Mobile Number', s3.mobileNo || '-', 'Email Address', s3.emailId || '-');
    drawTableRow('Bhamashah No.', s3.bhamashahNo || 'Not Provided', 'Voter ID No.', s3.voterIdNo || 'Not Provided');
    drawTableRow('Passport No.', s3.passportNo || 'Not Provided', 'Domicile / State', s3.state || '-');
    drawTableRow('Residential Address', s3.residenceAddress || '-');

    y += 4;

    // SECTION 3: BANK DETAILS
    drawSectionHeader('Bank Details & Payment Settlement', '3');
    drawTableRow('Name of the Bank', s4.bankName || '-', 'Branch Name', s4.branchName || '-');
    drawTableRow('Account Holder Name', s4.accountHolderName || '-', 'Account Number', s4.accountNo || '-');
    drawTableRow('Account Type', s4.accountType || '-', 'Transfer Mode', s4.transferMode || 'NEFT');
    drawTableRow('IFSC Code', s4.ifscCode || '-', 'MICR Code', s4.micrCode || 'Optional / -');
    drawTableRow('Branch Address', s4.branchAddress || '-');

    y += 4;

    // SECTION 4: SUBMITTED DOCUMENTS CHECKLIST
    drawSectionHeader('Attached Verification Documents Checklist', '4');

    const docs = [
      { label: 'Certificate of Registration / Incorporation', doc: s1.registrationCertDoc },
      { label: 'Organization PAN Card', doc: s1.panCardDoc },
      ...(s1.gstRegistered === 'Yes' ? [{ label: 'GST Registration Certificate', doc: s1.gstCertDoc }] : []),
      ...(s1.msmeRegistered === 'Yes' ? [{ label: 'MSME / Udyam Certificate', doc: s1.msmeCertDoc }] : []),
      { label: 'Authorization Letter / Board Resolution', doc: s3.authorizationLetterDoc },
      { label: 'Authorized Person Identity Proof', doc: s3.idProofDoc },
      { label: 'Cancelled Cheque / Bank Passbook Copy', doc: s4.cancelledChequeDoc }
    ];

    docs.forEach((item, idx) => {
      const isUp = item.doc && item.doc.status === 'uploaded';
      const fileName = isUp ? item.doc!.fileName : 'Not Attached';
      const statusText = isUp ? 'Attached' : 'Pending';
      drawTableRow(`${idx + 1}. ${item.label}`, fileName, 'Status', statusText);
    });

    // Save PDF directly to user's device
    doc.save(`OTR_Registration_${safeRegId}.pdf`);
  }

  /**
   * Print Acknowledgement window if the user chooses to print directly.
   */
  printOtrProfile(data: OtrFormData, regIdOverride?: string | null): void {
    const s1 = data.step1;
    const s3 = data.step3;
    const s4 = data.step4;
    const regId = regIdOverride || data.registrationId || 'OTR-2026';

    const printWindow = window.open('', '_blank', 'width=950,height=850');
    if (!printWindow) {
      window.print();
      return;
    }

    const regAddress = [s1.registeredAddress, s1.registeredDistrict, s1.registeredState]
      .filter(p => !!p && p.trim())
      .join(', ') + (s1.registeredPincode ? ' - ' + s1.registeredPincode.trim() : '') || '-';

    const officeAddress = s1.sameAsRegistered
      ? 'Same as Registered Office Address'
      : ([s1.officeAddress, s1.officeDistrict, s1.officeState]
          .filter(p => !!p && p.trim())
          .join(', ') + (s1.officePincode ? ' - ' + s1.officePincode.trim() : '') || '-');

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>ISMS 2.0 - OTR Registration Details - ${regId}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm 12mm; }
            * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; }
            body { margin: 0; padding: 16px; background: #fff; color: #0f172a; font-size: 11px; line-height: 1.4; }
            .pdf-header { border-bottom: 2px solid #0B3558; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; }
            .gov-subhead { font-size: 9.5px; font-weight: 700; color: #0483AC; text-transform: uppercase; }
            .gov-mainhead { font-size: 15px; font-weight: 800; color: #0B3558; margin-top: 2px; }
            .gov-docname { font-size: 11.5px; font-weight: 700; color: #334155; margin-top: 3px; }
            .meta-block { text-align: right; font-size: 9.5px; color: #64748b; }
            .sec-header { background: #0B3558; color: #fff; font-size: 10.5px; font-weight: 700; padding: 5px 8px; text-transform: uppercase; margin-top: 12px; border-radius: 3px 3px 0 0; }
            table.tbl { width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1; margin-bottom: 4px; }
            table.tbl td { padding: 4.5px 6px; border: 1px solid #cbd5e1; vertical-align: top; }
            table.tbl td.lbl { background: #f8fafc; color: #475569; font-weight: 600; width: 22%; }
            table.tbl td.val { color: #0f172a; font-weight: 500; width: 28%; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="pdf-header">
            <div>
              <div class="gov-subhead">GOVERNMENT OF RAJASTHAN • RSLDC</div>
              <div class="gov-mainhead">INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)</div>
              <div class="gov-docname">ONE TIME REGISTRATION (OTR) - APPLICATION DETAILS</div>
            </div>
            <div class="meta-block">
              <div><strong>Registration Ref:</strong> ${regId}</div>
              <div><strong>Status:</strong> ${data.status === 'Submitted' ? 'Submitted' : 'Draft / Preview'}</div>
            </div>
          </div>

          <div class="sec-header">1. Organization Details</div>
          <table class="tbl">
            <tr><td class="lbl">Organization Name:</td><td class="val" colspan="3" style="font-weight:700;">${s1.fullName || '-'}</td></tr>
            <tr><td class="lbl">Nature of Entity:</td><td class="val">${s1.natureOfEntity || '-'}</td><td class="lbl">Registration No.:</td><td class="val">${s1.registrationNumber || '-'}</td></tr>
            <tr><td class="lbl">Date of Registration:</td><td class="val">${s1.dateOfRegistration || '-'}</td><td class="lbl">State of Reg.:</td><td class="val">${s1.stateOfLegalReg || '-'}</td></tr>
            <tr><td class="lbl">Organization PAN:</td><td class="val" style="font-weight:700;">${s1.companyPan || '-'}</td><td class="lbl">GST Registered:</td><td class="val">${s1.gstRegistered} ${s1.gstin ? '(' + s1.gstin + ')' : ''}</td></tr>
            <tr><td class="lbl">MSME Registered:</td><td class="val">${s1.msmeRegistered} ${s1.udyamNumber ? '(' + s1.udyamNumber + ')' : ''}</td><td class="lbl">NSDC Partner:</td><td class="val">${s1.nsdcPartner || 'Not Applicable'}</td></tr>
            <tr><td class="lbl">Contact No.:</td><td class="val">${s1.contactNo || '-'}</td><td class="lbl">Email ID:</td><td class="val">${s1.emailId || '-'}</td></tr>
            <tr><td class="lbl">Registered Address:</td><td class="val" colspan="3">${regAddress}</td></tr>
            <tr><td class="lbl">Office Address:</td><td class="val" colspan="3">${officeAddress}</td></tr>
          </table>

          <div class="sec-header">2. Authorized Person Details</div>
          <table class="tbl">
            <tr><td class="lbl">Full Name:</td><td class="val" style="font-weight:700;">${s3.name || '-'}</td><td class="lbl">Designation:</td><td class="val">${s3.designation || '-'}</td></tr>
            <tr><td class="lbl">Date of Birth:</td><td class="val">${s3.dob || '-'}</td><td class="lbl">Age:</td><td class="val">${s3.age ? s3.age + ' Years' : '-'}</td></tr>
            <tr><td class="lbl">PAN:</td><td class="val" style="font-weight:700;">${s3.pan || '-'}</td><td class="lbl">Aadhaar No.:</td><td class="val">${s3.aadhaarNo || '-'}</td></tr>
            <tr><td class="lbl">Mobile No.:</td><td class="val">${s3.mobileNo || '-'}</td><td class="lbl">Email ID:</td><td class="val">${s3.emailId || '-'}</td></tr>
            <tr><td class="lbl">Residence Address:</td><td class="val" colspan="3">${s3.residenceAddress || '-'}</td></tr>
          </table>

          <div class="sec-header">3. Bank Details</div>
          <table class="tbl">
            <tr><td class="lbl">Bank Name:</td><td class="val" style="font-weight:700;">${s4.bankName || '-'}</td><td class="lbl">Branch Name:</td><td class="val">${s4.branchName || '-'}</td></tr>
            <tr><td class="lbl">Account Holder:</td><td class="val">${s4.accountHolderName || '-'}</td><td class="lbl">Account Number:</td><td class="val" style="font-weight:700;">${s4.accountNo || '-'}</td></tr>
            <tr><td class="lbl">Account Type:</td><td class="val">${s4.accountType || '-'}</td><td class="lbl">Transfer Mode:</td><td class="val">${s4.transferMode || '-'}</td></tr>
            <tr><td class="lbl">IFSC Code:</td><td class="val" style="font-weight:700;">${s4.ifscCode || '-'}</td><td class="lbl">MICR Code:</td><td class="val">${s4.micrCode || '-'}</td></tr>
            <tr><td class="lbl">Branch Address:</td><td class="val" colspan="3">${s4.branchAddress || '-'}</td></tr>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}

