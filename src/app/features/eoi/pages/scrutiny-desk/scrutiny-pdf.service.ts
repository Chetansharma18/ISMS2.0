import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import type { ApplicantResponse, DossierDocument } from '../../services/eoi-state.service';
import { formatDateTime } from '../../../../shared/utils';
import {
  ActivePreviewDocument,
  buildDocFileName,
  buildRefCode,
  buildZipEntryName,
  buildZipFolderName
} from './scrutiny-desk.util';

/** jsPDF / ZIP generation for the scrutiny desk dossier documents. */
@Injectable({ providedIn: 'root' })
export class ScrutinyPdfService {
  /**
   * Generates and downloads the official PDF for the document shown in the viewer.
   */
  downloadDocPdf(active: ActivePreviewDocument, app: ApplicantResponse | undefined): void {
    const pdf = this.generateDocPdf({
      id: active.id,
      title: active.title,
      fileSize: active.fileSize,
      category: active.category,
      verified: true
    }, app);
    pdf.save(`${active.fileName}`);
  }

  /**
   * Generates all verified proposal documents and downloads them in a single ZIP file.
   * Errors are propagated to the caller.
   */
  async downloadAllZip(app: ApplicantResponse, docs: DossierDocument[]): Promise<void> {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    const folderName = buildZipFolderName(app.anonymousLabel, app.id);
    const docFolder = zip.folder(folderName) || zip;

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const pdf = this.generateDocPdf(doc, app);
      const arrayBuffer = pdf.output('arraybuffer');
      docFolder.file(buildZipEntryName(i, doc.title), arrayBuffer);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${folderName}.zip`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Helper to build official PDF document
   */
  generateDocPdf(doc: DossierDocument, app: ApplicantResponse | undefined): jsPDF {
    const refCode = buildRefCode(app?.id, doc.id);
    const cleanFileName = buildDocFileName(doc.title);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Border framing
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.35);
    pdf.rect(10, 10, 190, 277);

    // Header banner (Navy)
    pdf.setFillColor(11, 53, 88);
    pdf.rect(10, 10, 190, 26, 'F');
    pdf.setFillColor(234, 179, 8);
    pdf.rect(10, 36, 190, 1.8, 'F');

    // Header Text
    pdf.setTextColor(254, 240, 138);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text('GOVERNMENT OF RAJASTHAN', 105, 17, { align: 'center' });

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9.5);
    pdf.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)', 105, 23, { align: 'center' });

    pdf.setTextColor(186, 230, 253);
    pdf.setFontSize(7.5);
    pdf.text('INTEGRATED SKILL MANAGEMENT SYSTEM (ISMS 2.0) - VERIFIED DOCUMENT REPOSITORY', 105, 29, { align: 'center' });

    // Document Title
    let y = 46;
    pdf.setTextColor(11, 53, 88);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(doc.title.toUpperCase(), 15, y);

    y += 5.5;
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Certificate Reference: ${refCode}  |  File: ${cleanFileName} (${doc.fileSize})`, 15, y);

    y += 8;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(15, y, 195, y);

    // Entity details
    y += 8;
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. VERIFIED PROPOSAL & APPLICANT PARTICULARS:', 15, y);

    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.text(`Legal Entity Name: ${app?.organisation?.legalName || 'Company 1'}`, 15, y);
    pdf.text(`Registration No (CIN): ${app?.organisation?.registrationNumber || '-'}`, 110, y);

    y += 6;
    pdf.text(`Company PAN: ${app?.organisation?.panNumber || '-'}`, 15, y);
    pdf.text(`GSTIN Number: ${app?.organisation?.gstin || '-'}`, 110, y);

    y += 6;
    pdf.text(`Authorized Signatory: ${app?.authorizedSignatory?.name || '-'} (${app?.authorizedSignatory?.designation || '-'})`, 15, y);
    pdf.text(`Submission Date: ${app?.submissionDate || '-'}`, 110, y);

    y += 6;
    pdf.text(`Applied Scheme: ${app?.schemeName || '-'}`, 15, y);
    pdf.text(`EOI Ref: ${app?.eoiRefNo || '-'}`, 110, y);

    y += 8;
    pdf.line(15, y, 195, y);

    // Statutory Certificate Attestation
    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. STATUTORY ATTESTATION & COMPLIANCE VERIFICATION:', 15, y);

    y += 6;
    pdf.setFont('helvetica', 'normal');
    const attestation = `This document confirms that the applicant entity has successfully uploaded and submitted the ${doc.title} in accordance with RSLDC MMKVY Expression of Interest (EOI) empanelment statutory guidelines. The document is archived in the state central repository and authenticated against MCA/GSTIN portal records.`;
    const splitText = pdf.splitTextToSize(attestation, 180);
    pdf.text(splitText, 15, y);

    y += 24;
    pdf.line(15, y, 195, y);

    // Digital Signatures
    y += 12;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(5, 150, 105);
    pdf.text('[DIGITALLY SIGNED & VERIFIED BY RSLDC DESK]', 15, y);
    pdf.text('[COMPETENT INWARD AUTHORITY]', 140, y);

    y += 5;
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Timestamp: ${formatDateTime(new Date())}`, 15, y);
    pdf.text('Government of Rajasthan', 140, y);

    return pdf;
  }
}
