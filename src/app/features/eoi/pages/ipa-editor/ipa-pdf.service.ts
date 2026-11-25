import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import type { IpaDocumentData } from '../../services/eoi-state.models';
import { BODY_SIZE, OfficialPdfPage, PT, SPACING } from '../eoi-sanction-editor/official-pdf';
import { CONTENT_WIDTH, MARGIN, PAGE_WIDTH, loadImage, printable, showPdf } from '../eoi-sanction-editor/pdf-common';

/** Approved-course table columns: label, width (mm). The widths add up to the content width. */
const COURSE_COLUMNS: { label: string; width: number }[] = [
  { label: 'S. No.', width: 7 },
  { label: 'District', width: 12 },
  { label: 'Sector', width: 13 },
  { label: 'Course Name', width: 14 },
  { label: 'Course Code', width: 12 },
  { label: 'Duration (Days / Hrs)', width: 14 },
  { label: 'OJT (Yes/No)', width: 8 },
  { label: 'Min. Edu. Qualification', width: 12 },
  { label: 'Min. Job Entry Age', width: 9 },
  { label: 'R/NR', width: 7 },
  { label: 'R. Cat.', width: 7 },
  { label: 'Cost Per Trainee', width: 15 },
  { label: 'Approved Trainees / batch', width: 9 },
  { label: 'Cost Per Batch', width: 13 },
  { label: 'Cycles FY 26-27', width: 8 },
  { label: 'Total Budget', width: 12 },
  { label: 'Per Day Hrs', width: 8 }
];

/** Summary table columns (mm): serial number, particular, value. */
const SUMMARY_COLUMNS = [14, 116, 50];

/** Builds the e-signed In-Principal Approval PDF with the same content as the draft. */
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
    pdf.setProperties({ title: `In-Principal Approval - ${data.fileNo}` });

    const [leftLogo, rightLogo] = await Promise.all([loadImage(data.leftLogoUrl ?? ''), loadImage(data.rightLogoUrl ?? '')]);
    return new IpaPdfBuilder(pdf, data, leftLogo, rightLogo).build(signedAt);
  }
}

/** The body of the IPA: file number, recipient, subject, course table, summary, qualification, terms and CC list. */
class IpaPdfBuilder extends OfficialPdfPage {
  constructor(pdf: jsPDF, private readonly data: IpaDocumentData, leftLogo: string | null, rightLogo: string | null) {
    super(pdf, data, leftLogo, rightLogo);
  }

  build(signedAt: Date): jsPDF {
    const signedBy = [this.data.signatoryTitle, this.data.signatorySub].filter(part => part?.trim()).join(', ');
    this.drawHeader();
    this.fileNoAndDate();
    this.recipient();
    this.opening();
    this.courseTable();
    this.summaryTable();
    this.qualification();
    this.terms();
    this.copies();
    this.drawFooters(signedAt, signedBy);
    return this.pdf;
  }

  private fileNoAndDate(): void {
    const { pdf, data } = this;
    this.font('normal', BODY_SIZE);
    pdf.text(printable(data.fileNo), MARGIN, this.y + 3);
    pdf.text(`Date: ${printable(data.ipaDate)}`, PAGE_WIDTH - MARGIN, this.y + 3, { align: 'right' });
    this.y += 10;
  }

  private recipient(): void {
    const { data } = this;
    this.paragraph('To,', { style: 'bold', gap: 0.6, justify: false });
    [data.recipientName, data.recipientAddress1, data.recipientAddress2, data.sarNumber]
      .filter(line => line?.trim())
      .forEach(line => this.paragraph(line, { style: 'bold', gap: 0.4, justify: false }));
    this.y += 4;
  }

  private opening(): void {
    const { data } = this;
    this.paragraph(`Ref: ${data.referenceNo}`, { style: 'bold', gap: 1.2, justify: false });
    this.paragraph(`Sub: ${data.subjectText}`, { style: 'bold', gap: 3 });
    this.paragraph(data.preambleText, { gap: 3 });
  }

  /** The course table: the agency and its SDC address across the top, then the heading and one row per course. */
  private courseTable(): void {
    const { pdf, data } = this;
    const size = 6.5;
    const lineHeight = size * PT * SPACING;
    const padding = 0.9;
    const fullWidth = COURSE_COLUMNS.reduce((total, column) => total + column.width, 0);

    // Name of the agency and the address of its SDC
    const band = [data.piaName?.trim(), data.sdcAddress?.trim() ? `Add.- ${data.sdcAddress.trim()}` : ''].filter(Boolean) as string[];
    if (band.length > 0) {
      this.font('bold', 8);
      const bandLines = band.flatMap(text => pdf.splitTextToSize(printable(text), fullWidth - padding * 2) as string[]);
      const bandHeight = bandLines.length * (8 * PT * SPACING) + padding * 2;
      if (this.ensure(bandHeight)) this.font('bold', 8);
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(MARGIN, this.y, fullWidth, bandHeight);
      bandLines.forEach((line, index) =>
        pdf.text(line, PAGE_WIDTH / 2, this.y + padding + (index + 0.75) * (8 * PT * SPACING), { align: 'center' })
      );
      this.y += bandHeight;
    }

    /** Draws one row; each cell is its own text, wrapped to its column and centred. */
    const drawRow = (cells: string[], bold: boolean): void => {
      this.font(bold ? 'bold' : 'normal', size);
      const wrapped = cells.map((cell, i) => pdf.splitTextToSize(printable(cell), COURSE_COLUMNS[i].width - padding * 2) as string[]);
      const rowHeight = Math.max(...wrapped.map(lines => lines.length)) * lineHeight + padding * 2;
      if (this.ensure(rowHeight)) this.font(bold ? 'bold' : 'normal', size);
      let x = MARGIN;
      wrapped.forEach((lines, i) => {
        const width = COURSE_COLUMNS[i].width;
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(x, this.y, width, rowHeight);
        const textTop = this.y + (rowHeight - lines.length * lineHeight) / 2;
        lines.forEach((line, lineIndex) => pdf.text(line, x + width / 2, textTop + lineHeight * 0.75 + lineIndex * lineHeight, { align: 'center' }));
        x += width;
      });
      this.y += rowHeight;
    };

    drawRow(COURSE_COLUMNS.map(column => column.label), true);
    data.courseRows.forEach((row, index) =>
      drawRow(
        [
          String(index + 1),
          row.district ?? '',
          row.sector,
          row.courseName,
          row.courseCode,
          `${row.durationDays} / ${row.durationHours}`,
          row.mandatoryOjt,
          row.minEdu,
          row.minAge,
          row.rnr,
          row.rCat,
          `C: ${row.costC}\nH: ${row.costH}\nToolkit: ${row.costToolkit}\nT: ${row.totalCostPerTrainee}`,
          String(row.approvedTrainees),
          String(row.costPerBatch),
          String(row.cycles),
          String(row.totalBudget),
          String(row.perDayHours)
        ],
        false
      )
    );

    // Total row: the label spans the columns before "Approved Trainees / batch".
    const sum = (pick: (row: IpaDocumentData['courseRows'][number]) => number): number =>
      data.courseRows.reduce((total, row) => total + (Number(pick(row)) || 0), 0);
    const labelWidth = COURSE_COLUMNS.slice(0, 12).reduce((total, column) => total + column.width, 0);
    const totals = [sum(r => r.approvedTrainees), sum(r => r.costPerBatch), sum(r => r.cycles), sum(r => r.totalBudget)];
    const totalRowHeight = lineHeight + padding * 2;
    this.font('bold', size);
    if (this.ensure(totalRowHeight)) this.font('bold', size);
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(MARGIN, this.y, labelWidth, totalRowHeight);
    pdf.text('Total', MARGIN + padding, this.y + padding + lineHeight * 0.75);
    let x = MARGIN + labelWidth;
    COURSE_COLUMNS.slice(12).forEach((column, i) => {
      pdf.rect(x, this.y, column.width, totalRowHeight);
      // The last column (Per Day Hrs) has no total.
      if (i < totals.length) pdf.text(String(totals[i]), x + column.width / 2, this.y + padding + lineHeight * 0.75, { align: 'center' });
      x += column.width;
    });
    this.y += totalRowHeight + 5;
  }

  private summaryTable(): void {
    const { pdf, data } = this;
    const size = 10;
    const lineHeight = size * PT * SPACING;
    const padding = 1.5;

    const drawRow = (cells: string[], bold: boolean): void => {
      this.font(bold ? 'bold' : 'normal', size);
      const wrapped = cells.map((cell, i) => pdf.splitTextToSize(printable(cell), SUMMARY_COLUMNS[i] - padding * 2) as string[]);
      const rowHeight = Math.max(...wrapped.map(lines => lines.length), 1) * lineHeight + padding * 2;
      if (this.ensure(rowHeight)) this.font(bold ? 'bold' : 'normal', size);
      let x = MARGIN;
      wrapped.forEach((lines, i) => {
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(x, this.y, SUMMARY_COLUMNS[i], rowHeight);
        const textTop = this.y + (rowHeight - lines.length * lineHeight) / 2;
        lines.forEach((line, lineIndex) => {
          const baseline = textTop + lineHeight * 0.75 + lineIndex * lineHeight;
          if (i === 2) pdf.text(line, x + SUMMARY_COLUMNS[i] - padding, baseline, { align: 'right' });
          else pdf.text(line, x + padding, baseline);
        });
        x += SUMMARY_COLUMNS[i];
      });
      this.y += rowHeight;
    };

    drawRow(['S.no.', 'Particular', ''], true);
    data.targetSummary.forEach((row, index) => drawRow([String(index + 1), row.particular, row.value], false));
    this.y += 5;
  }

  /** The note on the minimum qualification of the trainees and the box that lists it. */
  private qualification(): void {
    const { pdf, data } = this;
    if (data.qualificationNote?.trim()) this.paragraph(data.qualificationNote, { style: 'bold', gap: 2.5 });

    const title = data.qualificationTitle?.trim();
    const body = (data.qualificationText ?? '').split('\n').map(line => line.trim()).filter(Boolean);
    if (!title && body.length === 0) return;

    const size = BODY_SIZE;
    const lineHeight = size * PT * SPACING;
    const padding = 1.5;
    const textWidth = CONTENT_WIDTH - padding * 2;

    this.font('bold', size);
    const titleLines = title ? (pdf.splitTextToSize(printable(title), textWidth) as string[]) : [];
    this.font('normal', size);
    const bodyLines = body.flatMap(line => pdf.splitTextToSize(printable(line), textWidth) as string[]);
    const titleHeight = titleLines.length > 0 ? titleLines.length * lineHeight + padding * 2 : 0;
    const bodyHeight = bodyLines.length > 0 ? bodyLines.length * lineHeight + padding * 2 : 0;
    const height = titleHeight + bodyHeight;

    this.ensure(height);
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(MARGIN, this.y, CONTENT_WIDTH, height);
    if (titleHeight > 0) {
      this.font('bold', size);
      titleLines.forEach((line, i) => pdf.text(line, MARGIN + padding, this.y + padding + lineHeight * 0.75 + i * lineHeight));
      if (bodyHeight > 0) pdf.line(MARGIN, this.y + titleHeight, MARGIN + CONTENT_WIDTH, this.y + titleHeight);
    }
    if (bodyHeight > 0) {
      this.font('normal', size);
      bodyLines.forEach((line, i) => pdf.text(line, MARGIN + padding, this.y + titleHeight + padding + lineHeight * 0.75 + i * lineHeight));
    }
    this.y += height + 6;
  }

  private terms(): void {
    this.paragraph('IPA is issued subject to following terms and conditions: -', { style: 'bold', gap: 2.5 });
    this.data.termsAndConditions
      .filter(clause => clause.trim())
      .forEach((clause, index) => this.paragraph(clause, { label: `${String.fromCharCode(97 + (index % 26))})`, labelWidth: 8, gap: 1.8 }));
    this.y += 4;
  }

  private copies(): void {
    const items = this.data.ccList.filter(item => item.trim());
    if (items.length === 0) return;
    this.paragraph('CC:', { gap: 1.5, justify: false });
    items.forEach((item, index) => this.paragraph(item, { indent: 4, label: `${index + 1}-`, labelWidth: 8, gap: 1, justify: false }));
  }
}
