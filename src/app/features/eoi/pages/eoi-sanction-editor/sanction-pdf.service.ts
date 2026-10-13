import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import type { SanctionOrderDocumentData } from '../../services/eoi-state.models';
import {
  BOTTOM_LIMIT,
  CONTENT_WIDTH,
  MARGIN,
  PAGE_WIDTH,
  addPageNumbers,
  drawLetterhead,
  drawSignatureBox,
  loadImage,
  printable,
  showPdf
} from './pdf-common';

/** Table columns: label, width (mm). The widths add up to the content width. */
const TABLE_COLUMNS: { label: string; width: number }[] = [
  { label: 'Sr. No', width: 11 },
  { label: 'Application ID', width: 25 },
  { label: 'Name of the Agency / PIA', width: 38 },
  { label: 'Sanction District', width: 21 },
  { label: 'Sanction Sector(s)', width: 34 },
  { label: 'Category', width: 19 },
  { label: 'Grade', width: 12 },
  { label: 'Sanction Target', width: 20 }
];

/** Builds the e-signed sanction order PDF with the same content as the draft. */
@Injectable({ providedIn: 'root' })
export class SanctionPdfService {
  /** Creates the signed PDF and shows it in the given browser tab (a new tab is opened if none is given). */
  async openSignedPdf(data: SanctionOrderDocumentData, tab: Window | null): Promise<void> {
    showPdf(await this.buildSignedPdf(data), tab);
  }

  async buildSignedPdf(
    data: SanctionOrderDocumentData,
    signedAt: Date = data.signedAt ? new Date(data.signedAt) : new Date()
  ): Promise<jsPDF> {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.setProperties({ title: `${data.documentTitle} - ${data.fileNo}` });

    const [leftLogo, rightLogo] = await Promise.all([loadImage(data.leftLogoUrl ?? ''), loadImage(data.rightLogoUrl ?? '')]);
    let y = drawLetterhead(pdf, data, leftLogo, rightLogo);

    const ensure = (height: number): void => {
      if (y + height > BOTTOM_LIMIT) {
        pdf.addPage();
        y = MARGIN;
      }
    };
    const paragraph = (text: string, opts: { size?: number; bold?: boolean; align?: 'left' | 'center'; gap?: number; indent?: number } = {}): void => {
      const size = opts.size ?? 9;
      const indent = opts.indent ?? 0;
      pdf.setFont('helvetica', opts.bold ? 'bold' : 'normal');
      pdf.setFontSize(size);
      const lines: string[] = pdf.splitTextToSize(printable(text), CONTENT_WIDTH - indent);
      const lineHeight = size * 0.45;
      for (const line of lines) {
        ensure(lineHeight);
        if (opts.align === 'center') pdf.text(line, PAGE_WIDTH / 2, y + size * 0.3, { align: 'center' });
        else pdf.text(line, MARGIN + indent, y + size * 0.3);
        y += lineHeight;
      }
      y += opts.gap ?? 2;
    };

    // File number and date
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(printable(data.fileNo), MARGIN, y + 3);
    pdf.text(`Date: ${printable(data.sanctionDate)}`, PAGE_WIDTH - MARGIN, y + 3, { align: 'right' });
    y += 8;

    // Title, subject, reference and preamble
    paragraph(data.documentTitle.toUpperCase(), { size: 12, bold: true, align: 'center', gap: 3 });
    paragraph(`Subject: ${data.subjectText}`, { bold: true, gap: 2 });
    paragraph(`Reference: ${data.referenceText}`, { gap: 2 });
    paragraph(data.preambleText, { gap: 4 });

    y = this.drawTargetsTable(pdf, data, y);
    y += 5;

    // Terms and conditions
    paragraph('The above sanction order is issued subject to complying with the following terms and conditions by Project Implementing Agencies (PIAs):', { bold: true, gap: 2 });
    data.termsAndConditions.forEach((clause, index) => {
      const lines: string[] = pdf.splitTextToSize(printable(clause), CONTENT_WIDTH - 8);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      lines.forEach((line, lineIndex) => {
        ensure(4);
        if (lineIndex === 0) pdf.text(`${index + 1}.`, MARGIN, y + 3);
        pdf.text(line, MARGIN + 8, y + 3);
        y += 3.9;
      });
      y += 1.5;
    });
    y += 3;

    // Dispatch reference and the digital signature
    ensure(34);
    pdf.setDrawColor(148, 163, 184);
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text('Dispatch Reference:', MARGIN, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(printable(data.dispatchRef), MARGIN, y + 4.5);
    drawSignatureBox(pdf, y - 3, signedAt, 'Scheme OIC, RSLDC');
    y += 32;

    // Copy to
    ensure(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Copy to:', MARGIN, y);
    y += 4.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    data.copyToList.filter(item => item.trim()).forEach((item, index) => {
      const lines: string[] = pdf.splitTextToSize(printable(item), CONTENT_WIDTH - 8);
      lines.forEach((line, lineIndex) => {
        ensure(4);
        if (lineIndex === 0) pdf.text(`${index + 1}.`, MARGIN + 2, y + 2.5);
        pdf.text(line, MARGIN + 8, y + 2.5);
        y += 3.8;
      });
    });

    addPageNumbers(pdf);
    return pdf;
  }

  private drawTargetsTable(pdf: jsPDF, data: SanctionOrderDocumentData, startY: number): number {
    let y = startY;
    const fontSize = 8;
    const lineHeight = 3.6;
    const padding = 1.6;

    const drawRow = (cells: string[], header: boolean): void => {
      pdf.setFont('helvetica', header ? 'bold' : 'normal');
      pdf.setFontSize(fontSize);
      const wrapped = cells.map((cell, i) => pdf.splitTextToSize(printable(cell), TABLE_COLUMNS[i].width - padding * 2) as string[]);
      const rowHeight = Math.max(...wrapped.map(lines => lines.length)) * lineHeight + padding * 2;
      if (y + rowHeight > BOTTOM_LIMIT) {
        pdf.addPage();
        y = MARGIN;
      }
      let x = MARGIN;
      wrapped.forEach((lines, i) => {
        const width = TABLE_COLUMNS[i].width;
        if (header) {
          pdf.setFillColor(241, 245, 249);
          pdf.rect(x, y, width, rowHeight, 'FD');
        } else {
          pdf.rect(x, y, width, rowHeight);
        }
        lines.forEach((line, lineIndex) => pdf.text(line, x + padding, y + padding + 2.6 + lineIndex * lineHeight));
        x += width;
      });
      y += rowHeight;
    };

    pdf.setDrawColor(100, 116, 139);
    drawRow(TABLE_COLUMNS.map(c => c.label), true);
    data.tableRows.forEach((row, index) =>
      drawRow(
        [String(index + 1), row.appId, row.agencyName, row.district, row.sector, row.category, row.grade, String(row.target)],
        false
      )
    );
    return y;
  }
}
