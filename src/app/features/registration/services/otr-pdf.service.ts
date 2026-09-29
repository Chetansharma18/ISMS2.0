import { Injectable } from '@angular/core';
import { OtrFormData } from '../models/otr-form.model';

@Injectable({
  providedIn: 'root'
})
export class OtrPdfService {

  generateOtrPdf(data: OtrFormData, regIdOverride?: string | null): void {
    const s1 = data.step1;
    const s2 = data.step2 || [];
    const s3 = data.step3;
    const s4 = data.step4;
    const regId = regIdOverride || data.registrationId || 'OTR-2026';

    const printWindow = window.open('', '_blank', 'width=950,height=850');
    if (!printWindow) {
      window.print();
      return;
    }

    // Format Addresses
    const regAddress = [s1.registeredAddress, s1.registeredDistrict, s1.registeredState]
      .filter(p => !!p && p.trim())
      .join(', ') + (s1.registeredPincode ? ' - ' + s1.registeredPincode.trim() : '') || '-';

    const officeAddress = s1.sameAsRegistered
      ? 'Same as Registered Office Address'
      : ([s1.officeAddress, s1.officeDistrict, s1.officeState]
          .filter(p => !!p && p.trim())
          .join(', ') + (s1.officePincode ? ' - ' + s1.officePincode.trim() : '') || '-');

    // Officer in-charge rows
    const oicRows = s2.length > 0
      ? s2.map((o, idx) => `
        <tr>
          <td style="text-align:center;font-weight:600;">${idx + 1}</td>
          <td style="font-weight:700;">${o.name || '-'}</td>
          <td>${o.designation || '-'}</td>
          <td>${o.mobileNo || '-'}</td>
          <td>${o.emailId || '-'}</td>
          <td style="font-family:monospace;">${o.pan || '-'}</td>
          <td style="font-family:monospace;">${o.aadhaarNo || '-'}</td>
          <td>${idx === 0 ? 'Nodal Officer' : 'Additional Officer'}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="8" style="text-align:center;color:#64748b;padding:8px;">No Officer Details Provided</td></tr>';

    // Document checklist
    const docs = [
      { name: 'Certificate of Registration', doc: s1.registrationCertDoc },
      { name: 'Organization PAN Card', doc: s1.panCardDoc },
      ...(s1.gstRegistered === 'Yes' ? [{ name: 'GST Registration Certificate', doc: s1.gstCertDoc }] : []),
      ...(s1.msmeRegistered === 'Yes' ? [{ name: 'MSME Udyam Certificate', doc: s1.msmeCertDoc }] : []),
      { name: 'Authorization Letter / Board Resolution', doc: s3.authorizationLetterDoc },
      { name: 'Authorized Signatory Identity Proof', doc: s3.idProofDoc },
      ...s2.map((o, i) => ({ name: `Officer #${i + 1} Appointment Letter (${o.name || 'OIC'})`, doc: o.appointmentLetterDoc })),
      ...s2.map((o, i) => ({ name: `Officer #${i + 1} ID Proof (${o.name || 'OIC'})`, doc: o.idProofDoc })),
      { name: 'Bank Cancelled Cheque / Passbook Copy', doc: s4.cancelledChequeDoc }
    ];

    const docRows = docs.map((d, idx) => {
      const isUp = d.doc && d.doc.status === 'uploaded';
      return `
        <tr>
          <td style="text-align:center;font-weight:600;">${idx + 1}</td>
          <td style="font-weight:600;">${d.name}</td>
          <td>${isUp ? d.doc!.fileName : '<span style="color:#94a3b8;">-</span>'}</td>
          <td style="text-align:center;">${isUp ? d.doc!.fileSize : '<span style="color:#94a3b8;">-</span>'}</td>
          <td style="text-align:center;font-weight:600;color:${isUp ? '#15803d' : '#94a3b8'};">
            ${isUp ? 'Attached' : 'Not Attached'}
          </td>
        </tr>
      `;
    }).join('');

    const printDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>ISMS 2.0 - OTR Registration Details - ${regId}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              font-family: Arial, Helvetica, sans-serif;
            }
            body {
              margin: 0;
              padding: 16px;
              background: #ffffff;
              color: #0f172a;
              font-size: 11px;
              line-height: 1.4;
            }
            .pdf-header {
              border-bottom: 2px solid #0B3558;
              padding-bottom: 8px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .gov-subhead {
              font-size: 9.5px;
              font-weight: 700;
              color: #0483AC;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .gov-mainhead {
              font-size: 15px;
              font-weight: 800;
              color: #0B3558;
              margin-top: 2px;
            }
            .gov-docname {
              font-size: 11.5px;
              font-weight: 700;
              color: #334155;
              margin-top: 3px;
            }
            .meta-block {
              text-align: right;
              font-size: 9.5px;
              color: #64748b;
            }
            .sec-header {
              background: #0B3558;
              color: #ffffff;
              font-size: 10.5px;
              font-weight: 700;
              padding: 5px 8px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              margin-top: 12px;
              border-radius: 3px 3px 0 0;
            }
            table.tbl {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              border: 1px solid #cbd5e1;
              margin-bottom: 4px;
            }
            table.tbl th {
              background: #f1f5f9;
              color: #0B3558;
              font-weight: 700;
              padding: 5px 6px;
              text-align: left;
              border: 1px solid #cbd5e1;
            }
            table.tbl td {
              padding: 4.5px 6px;
              border: 1px solid #cbd5e1;
              vertical-align: top;
            }
            table.tbl td.lbl {
              background: #f8fafc;
              color: #475569;
              font-weight: 600;
              width: 22%;
            }
            table.tbl td.val {
              color: #0f172a;
              font-weight: 500;
              width: 28%;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-header">
            <div>
              <div class="gov-subhead">GOVERNMENT OF RAJASTHAN • RSLDC</div>
              <div class="gov-mainhead">INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)</div>
              <div class="gov-docname">ONE TIME REGISTRATION (OTR) - APPLICATION DETAILS PREVIEW</div>
            </div>
            <div class="meta-block">
              <div><strong>Generated Date:</strong> ${printDate}</div>
              <div><strong>Status:</strong> ${data.status === 'Submitted' ? 'Submitted (' + regId + ')' : 'Application Preview / Draft'}</div>
            </div>
          </div>

          <!-- 1. Organization & Legal Particulars Table -->
          <div class="sec-header">1. Organization &amp; Legal Particulars</div>
          <table class="tbl">
            <tr>
              <td class="lbl">Organization Name:</td>
              <td class="val" colspan="3" style="font-weight:700;">${s1.fullName || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Nature of Entity:</td>
              <td class="val">${s1.natureOfEntity || '-'}</td>
              <td class="lbl">Registration Number:</td>
              <td class="val" style="font-family:monospace;">${s1.registrationNumber || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Date of Registration:</td>
              <td class="val">${s1.dateOfRegistration || '-'}</td>
              <td class="lbl">State of Legal Reg.:</td>
              <td class="val">${s1.stateOfLegalReg || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Organization PAN:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s1.companyPan || '-'}</td>
              <td class="lbl">GST Registered:</td>
              <td class="val">${s1.gstRegistered} ${s1.gstRegistered === 'Yes' ? '(' + (s1.gstin || '-') + ')' : ''}</td>
            </tr>
            <tr>
              <td class="lbl">MSME Registered:</td>
              <td class="val">${s1.msmeRegistered} ${s1.msmeRegistered === 'Yes' ? '(' + (s1.udyamNumber || '-') + ')' : ''}</td>
              <td class="lbl">NSDC Partner Status:</td>
              <td class="val">${s1.nsdcPartner || 'Not Applicable'}</td>
            </tr>
            <tr>
              <td class="lbl">Organization Contact No.:</td>
              <td class="val">${s1.contactNo || '-'}</td>
              <td class="lbl">Organization Email-ID:</td>
              <td class="val">${s1.emailId || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Official Website:</td>
              <td class="val" colspan="3">${s1.website || '-'}</td>
            </tr>
          </table>

          <!-- 2. Address Particulars Table -->
          <div class="sec-header">2. Official Address Details</div>
          <table class="tbl">
            <tr>
              <td class="lbl" style="width:25%;">Registered Office Address:</td>
              <td class="val" style="width:75%;">${regAddress}</td>
            </tr>
            <tr>
              <td class="lbl" style="width:25%;">Corporate / Branch Address:</td>
              <td class="val" style="width:75%;">${officeAddress}</td>
            </tr>
          </table>

          <!-- 3. Authorized Person Details Table -->
          <div class="sec-header">3. Authorized Signatory Particulars</div>
          <table class="tbl">
            <tr>
              <td class="lbl">Full Name:</td>
              <td class="val" style="font-weight:700;">${s3.name || '-'}</td>
              <td class="lbl">Designation:</td>
              <td class="val">${s3.designation || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Date of Birth:</td>
              <td class="val">${s3.dob || '-'}</td>
              <td class="lbl">Age:</td>
              <td class="val">${s3.age || '-'} Years</td>
            </tr>
            <tr>
              <td class="lbl">Mobile Number:</td>
              <td class="val">${s3.mobileNo || '-'}</td>
              <td class="lbl">Email Address:</td>
              <td class="val">${s3.emailId || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">PAN:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s3.pan || '-'}</td>
              <td class="lbl">Aadhaar Number:</td>
              <td class="val" style="font-family:monospace;">${s3.aadhaarNo || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Bhamashah Number:</td>
              <td class="val">${s3.bhamashahNo || '-'}</td>
              <td class="lbl">Voter ID Number:</td>
              <td class="val">${s3.voterIdNo || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Passport Number:</td>
              <td class="val">${s3.passportNo || '-'}</td>
              <td class="lbl">Domicile / State:</td>
              <td class="val">${s3.state || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Residence Address:</td>
              <td class="val" colspan="3">${s3.residenceAddress || '-'}</td>
            </tr>
          </table>

          <!-- 4. Officer(s) In-Charge Table -->
          <div class="sec-header">4. Officer(s) In-Charge Details</div>
          <table class="tbl">
            <thead>
              <tr>
                <th style="width:25px;text-align:center;">#</th>
                <th>Officer Name</th>
                <th>Designation</th>
                <th>Mobile No.</th>
                <th>Email ID</th>
                <th>PAN</th>
                <th>Aadhaar No.</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              ${oicRows}
            </tbody>
          </table>

          <!-- 5. Bank Account Details Table -->
          <div class="sec-header">5. Bank Account &amp; Settlement Details</div>
          <table class="tbl">
            <tr>
              <td class="lbl">Name of the Bank:</td>
              <td class="val" style="font-weight:700;">${s4.bankName || '-'}</td>
              <td class="lbl">Branch Name:</td>
              <td class="val">${s4.branchName || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Account Holder Name:</td>
              <td class="val" style="font-weight:600;">${s4.accountHolderName || '-'}</td>
              <td class="lbl">Account Number:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s4.accountNo || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Account Type:</td>
              <td class="val">${s4.accountType || '-'}</td>
              <td class="lbl">Transfer Mode:</td>
              <td class="val">${s4.transferMode || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">IFSC Code:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s4.ifscCode || '-'}</td>
              <td class="lbl">MICR Code:</td>
              <td class="val" style="font-family:monospace;">${s4.micrCode || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Branch Address:</td>
              <td class="val" colspan="3">${s4.branchAddress || '-'}</td>
            </tr>
          </table>

          <!-- 6. Uploaded Documents Verification Checklist Table -->
          <div class="sec-header">6. Attached Verification Documents Checklist</div>
          <table class="tbl">
            <thead>
              <tr>
                <th style="width:25px;text-align:center;">#</th>
                <th>Document Description</th>
                <th>Uploaded File Name</th>
                <th style="width:75px;text-align:center;">File Size</th>
                <th style="width:90px;text-align:center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${docRows}
            </tbody>
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
