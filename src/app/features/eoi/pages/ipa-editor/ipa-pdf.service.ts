import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import type { IpaDocumentData } from '../../services/eoi-state.models';
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
} from '../eoi-sanction-editor/pdf-common';

/** Approved-course table columns: label, width (mm). The widths add up to the content width. */
const COURSE_COLUMNS: { label: string; width: number }[] = [
  { label: 'S. No.', width: 7 },
  { label: 'Sector', width: 18 },
  { label: 'Course Name', width: 16 },
  { label: 'Course Code', width: 14 },
  { label: 'Duration (Days / Hrs)', width: 14 },
  { label: 'OJT (Yes/No)', width: 8 },
  { label: 'Min. Edu. Qualification', width: 12 },
  { label: 'Min. Job Entry Age', width: 9 },
  { label: 'R/NR', width: 7 },
  { label: 'R. Cat.', width: 7 },
  { label: 'Cost Per Trainee', width: 16 },
  { label: 'Approved Trainees / batch', width: 9 },
  { label: 'Cost Per Batch', width: 13 },
  { label: 'Cycles FY 26-27', width: 8 },
  { label: 'Total Budget', width: 14 },
  { label: 'Per Day Hrs', width: 8 }
];

/** Builds the e-signed In-Principle Approval PDF with the same content as the draft. */
@Injectable({ providedIn: 'root' })
export class IpaPdfService {
  /** Creates the signed PDF and shows it in the given browser tab (a new tab is opened if none is given). */
  async openSignedPdf(data: IpaDocumentData, tab: Window | null): Promise<void> {
    showPdf(await this.buildSignedPdf(data), tab);
  }

  async buildSignedPdf(
    data: IpaDocumentData,
    signedAt: Date = data.signedAt ? new Date(data.signedAt) : new Date()
  ): Promise<jsPDF> {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.setProperties({ title: `In-Principle Approval - ${data.fileNo}` });

    const [leftLogo, rightLogo] = await Promise.all([loadImage(data.leftLogoUrl ?? ''), loadImage(data.rightLogoUrl ?? '')]);
    let y = drawLetterhead(pdf, data, leftLogo, rightLogo);

    const ensure = (height: number): void => {
      if (y + height > BOTTOM_LIMIT) {
        pdf.addPage();
        y = MARGIN;
      }
    };
    const paragraph = (text: string, opts: { size?: number; bold?: boolean; gap?: number } = {}): void => {
      const size = opts.size ?? 9;
      pdf.setFont('helvetica', opts.bold ? 'bold' : 'normal');
      pdf.setFontSize(size);
      const lines: string[] = pdf.splitTextToSize(printable(text), CONTENT_WIDTH);
      const lineHeight = size * 0.45;
      for (const line of lines) {
        ensure(lineHeight);
        pdf.text(line, MARGIN, y + size * 0.3);
        y += lineHeight;
      }
      y += opts.gap ?? 2;
    };

    // File number and date
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(printable(data.fileNo), MARGIN, y + 3);
    pdf.text(`Date: ${printable(data.ipaDate)}`, PAGE_WIDTH - MARGIN, y + 3, { align: 'right' });
    y += 8;

    // Recipient
    paragraph('To,', { bold: true, gap: 1 });
    paragraph(data.recipientName, { bold: true, gap: 0.5 });
    [data.recipientAddress1, data.recipientAddress2, data.sarNumber]
      .filter(line => line?.trim())
      .forEach(line => paragraph(line, { bold: true, gap: 0.5 }));
    y += 3;

    // Reference, subject and preamble
    paragraph(`Ref: ${data.referenceNo}`, { gap: 1.5 });
    paragraph(`Sub: ${data.subjectText}`, { bold: true, gap: 2.5 });
    paragraph(data.preambleText, { gap: 2 });
    if (data.piaName?.trim() || data.sdcAddress?.trim()) {
      paragraph(`${data.piaName}${data.sdcAddress?.trim() ? ` - ${data.sdcAddress}` : ''}`, { bold: true, gap: 3 });
    }

    y = this.drawCourseTable(pdf, data, y) + 5;
    y = this.drawSummaryTable(pdf, data, y) + 5;

    // Terms and conditions
    paragraph('IPA is issued subject to following terms and conditions: -', { bold: true, gap: 2 });
    data.termsAndConditions.forEach((clause, index) => {
      const lines: string[] = pdf.splitTextToSize(printable(clause), CONTENT_WIDTH - 8);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      lines.forEach((line, lineIndex) => {
        ensure(4);
        if (lineIndex === 0) pdf.text(`${String.fromCharCode(97 + (index % 26))})`, MARGIN, y + 3);
        pdf.text(line, MARGIN + 8, y + 3);
        y += 3.9;
      });
      y += 1.5;
    });
    y += 4;

    // Signatory and the digital signature
    ensure(34);
    pdf.setDrawColor(148, 163, 184);
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text(printable(data.signatoryTitle), MARGIN, y + 2);
    pdf.setFont('helvetica', 'normal');
    pdf.text(printable(data.signatorySub), MARGIN, y + 6.5);
    const signedBy = [data.signatoryTitle, data.signatorySub].filter(part => part?.trim()).join(', ');
    drawSignatureBox(pdf, y - 3, signedAt, signedBy);
    y += 32;

    // CC
    const copies = data.ccList.filter(item => item.trim());
    if (copies.length > 0) {
      ensure(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('CC:', MARGIN, y);
      y += 4.5;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      copies.forEach((item, index) => {
        const lines: string[] = pdf.splitTextToSize(printable(item), CONTENT_WIDTH - 8);
        lines.forEach((line, lineIndex) => {
          ensure(4);
          if (lineIndex === 0) pdf.text(`${index + 1}-`, MARGIN + 2, y + 2.5);
          pdf.text(line, MARGIN + 8, y + 2.5);
          y += 3.8;
        });
      });
    }

    addPageNumbers(pdf);
    return pdf;
  }

  private drawCourseTable(pdf: jsPDF, data: IpaDocumentData, startY: number): number {
    let y = startY;
    const fontSize = 6;
    const lineHeight = 2.6;
    const padding = 0.9;

    /** Draws one row; each cell is its own text, wrapped to its column. */
    const drawRow = (cells: string[], style: 'header' | 'body' | 'total'): void => {
      pdf.setFont('helvetica', style === 'body' ? 'normal' : 'bold');
      pdf.setFontSize(fontSize);
      const wrapped = cells.map((cell, i) => pdf.splitTextToSize(printable(cell), COURSE_COLUMNS[i].width - padding * 2) as string[]);
      const rowHeight = Math.max(...wrapped.map(lines => lines.length)) * lineHeight + padding * 2;
      if (y + rowHeight > BOTTOM_LIMIT) {
        pdf.addPage();
        y = MARGIN;
      }
      let x = MARGIN;
      wrapped.forEach((lines, i) => {
        const width = COURSE_COLUMNS[i].width;
        if (style === 'body') {
          pdf.rect(x, y, width, rowHeight);
        } else {
          pdf.setFillColor(241, 245, 249);
          pdf.rect(x, y, width, rowHeight, 'FD');
        }
        lines.forEach((line, lineIndex) => pdf.text(line, x + padding, y + padding + 2 + lineIndex * lineHeight));
        x += width;
      });
      y += rowHeight;
    };

    pdf.setDrawColor(15, 23, 42);
    drawRow(COURSE_COLUMNS.map(c => c.label), 'header');

    data.courseRows.forEach((row, index) =>
      drawRow(
        [
          String(index + 1),
          row.sector,
          row.courseName,
          row.courseCode,
          `${row.durationDays} / ${row.durationHours}`,
          row.mandatoryOjt,
          row.minEdu,
          row.minAge,
          row.rnr,
          row.rCat,
          `C: ${row.costC}\nH: ${row.costH}\nToolkit: ${row.costToolkit}\nTotal: ${row.totalCostPerTrainee}`,
          String(row.approvedTrainees),
          String(row.costPerBatch),
          String(row.cycles),
          String(row.totalBudget),
          String(row.perDayHours)
        ],
        'body'
      )
    );

    // Total row: the label spans the columns before "Approved Trainees / batch".
    const sum = (pick: (row: IpaDocumentData['courseRows'][number]) => number): number =>
      data.courseRows.reduce((total, row) => total + (Number(pick(row)) || 0), 0);
    const labelWidth = COURSE_COLUMNS.slice(0, 11).reduce((total, c) => total + c.width, 0);
    const totals = [sum(r => r.approvedTrainees), sum(r => r.costPerBatch), sum(r => r.cycles), sum(r => r.totalBudget)];
    const totalRowHeight = lineHeight + padding * 2;
    if (y + totalRowHeight > BOTTOM_LIMIT) {
      pdf.addPage();
      y = MARGIN;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(fontSize);
    pdf.setFillColor(241, 245, 249);
    pdf.rect(MARGIN, y, labelWidth, totalRowHeight, 'FD');
    pdf.text('TOTAL', MARGIN + labelWidth - padding, y + padding + 2, { align: 'right' });
    let x = MARGIN + labelWidth;
    COURSE_COLUMNS.slice(11).forEach((column, i) => {
      pdf.setFillColor(241, 245, 249);
      pdf.rect(x, y, column.width, totalRowHeight, 'FD');
      // The last column (Per Day Hrs) has no total.
      if (i < totals.length) pdf.text(String(totals[i]), x + padding, y + padding + 2);
      x += column.width;
    });
    return y + totalRowHeight;
  }

  private drawSummaryTable(pdf: jsPDF, data: IpaDocumentData, startY: number): number {
    const columns = [14, 116, 50];
    const fontSize = 8;
    const lineHeight = 3.6;
    const padding = 1.6;
    let y = startY;

    const drawRow = (cells: string[], header: boolean): void => {
      pdf.setFont('helvetica', header ? 'bold' : 'normal');
      pdf.setFontSize(fontSize);
      const wrapped = cells.map((cell, i) => pdf.splitTextToSize(printable(cell), columns[i] - padding * 2) as string[]);
      const rowHeight = Math.max(...wrapped.map(lines => lines.length)) * lineHeight + padding * 2;
      if (y + rowHeight > BOTTOM_LIMIT) {
        pdf.addPage();
        y = MARGIN;
      }
      let x = MARGIN;
      wrapped.forEach((lines, i) => {
        if (header) {
          pdf.setFillColor(241, 245, 249);
          pdf.rect(x, y, columns[i], rowHeight, 'FD');
        } else {
          pdf.rect(x, y, columns[i], rowHeight);
        }
        lines.forEach((line, lineIndex) => pdf.text(line, x + padding, y + padding + 2.6 + lineIndex * lineHeight));
        x += columns[i];
      });
      y += rowHeight;
    };

    pdf.setDrawColor(100, 116, 139);
    drawRow(['S.no.', 'Particular', 'Value'], true);
    data.targetSummary.forEach(row => drawRow([String(row.sNo), row.particular, row.value], false));
    return y;
  }
}
