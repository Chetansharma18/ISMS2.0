import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import type { SanctionOrderDocumentData } from '../../services/eoi-state.models';
import { isSubClause } from './eoi-sanction-editor.util';
import { BODY_SIZE, OfficialPdfPage, PT, SPACING } from './official-pdf';
import { MARGIN, PAGE_WIDTH, loadImage, printable, showPdf } from './pdf-common';

type Align = 'left' | 'center';

/** Table columns: label, width (mm), alignment of the cell text. The widths add up to the content width. */
const TABLE_COLUMNS: { label: string; width: number; align: Align }[] = [
  { label: 'Sr. No', width: 12, align: 'center' },
  { label: 'Application ID', width: 24, align: 'left' },
  { label: 'Name Of the Agency/PIA', width: 47, align: 'left' },
  { label: 'Sanction District', width: 26, align: 'left' },
  { label: 'Sanction Sector (s)', width: 45, align: 'left' },
  { label: 'Grade', width: 12, align: 'center' },
  { label: 'Sanction Target', width: 14, align: 'center' }
];

/** Signer shown in the digital signature box on every page. */
const SIGNED_BY = 'Scheme OIC, RSLDC';

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
    return new SanctionPdfBuilder(pdf, data, leftLogo, rightLogo).build(signedAt);
  }
}

/** The body of the sanction order: file number, title, subject, targets table, terms, dispatch line and copy list. */
class SanctionPdfBuilder extends OfficialPdfPage {
  constructor(pdf: jsPDF, private readonly data: SanctionOrderDocumentData, leftLogo: string | null, rightLogo: string | null) {
    super(pdf, data, leftLogo, rightLogo);
  }

  build(signedAt: Date): jsPDF {
    this.drawHeader();
    this.fileNoAndDate();
    this.titleAndOpening();
    this.targetsTable();
    this.terms();
    this.dispatchAndCopyTo();
    this.drawFooters(signedAt, SIGNED_BY);
    return this.pdf;
  }

  private fileNoAndDate(): void {
    const { pdf, data } = this;
    this.font('normal', BODY_SIZE);
    pdf.text(`File No: ${printable(data.fileNo)}`, MARGIN, this.y + 3);
    pdf.text(`Date: ${printable(data.sanctionDate)}`, PAGE_WIDTH - MARGIN, this.y + 3, { align: 'right' });
    this.y += 9;
  }

  private titleAndOpening(): void {
    const { pdf, data } = this;

    // Title, centred, bold and underlined
    const title = printable(data.documentTitle);
    this.font('bold', 13);
    const baseline = this.y + 4;
    pdf.text(title, PAGE_WIDTH / 2, baseline, { align: 'center' });
    const half = pdf.getTextWidth(title) / 2;
    pdf.setLineWidth(0.3);
    pdf.line(PAGE_WIDTH / 2 - half, baseline + 0.9, PAGE_WIDTH / 2 + half, baseline + 0.9);
    pdf.setLineWidth(0.2);
    this.y += 11;

    this.paragraph(`Subject: ${data.subjectText}`, { style: 'bold', gap: 3 });
    this.paragraph(`Ref: ${data.referenceText}`, { style: 'bolditalic', gap: 3, justify: false });
    this.paragraph(data.preambleText, { gap: 3 });
  }

  private targetsTable(): void {
    const { pdf, data } = this;
    const size = 10;
    const lineHeight = size * PT * SPACING;
    const padding = 1.8;

    const drawRow = (cells: string[], header: boolean): void => {
      this.font(header ? 'bold' : 'normal', size);
      const wrapped = cells.map((cell, i) => pdf.splitTextToSize(printable(cell), TABLE_COLUMNS[i].width - padding * 2) as string[]);
      const rowHeight = Math.max(...wrapped.map(lines => lines.length)) * lineHeight + padding * 2;
      if (this.ensure(rowHeight)) this.font(header ? 'bold' : 'normal', size);

      let x = MARGIN;
      wrapped.forEach((lines, i) => {
        const column = TABLE_COLUMNS[i];
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(x, this.y, column.width, rowHeight);
        const textTop = this.y + (rowHeight - lines.length * lineHeight) / 2;
        lines.forEach((line, lineIndex) => {
          const baseline = textTop + lineHeight * 0.75 + lineIndex * lineHeight;
          if (header || column.align === 'center') pdf.text(line, x + column.width / 2, baseline, { align: 'center' });
          else pdf.text(line, x + padding, baseline);
        });
        x += column.width;
      });
      this.y += rowHeight;
    };

    drawRow(TABLE_COLUMNS.map(column => column.label), true);
    data.tableRows.forEach((row, index) =>
      drawRow([String(index + 1), row.appId, row.agencyName, row.district, row.sector, row.grade, String(row.target)], false)
    );
    this.y += 5;
  }

  private terms(): void {
    this.paragraph('The above sanction order is issued subject to complying with the following terms and conditions by Project Implementing Agencies (PIAs):', {
      style: 'bold',
      gap: 2.5
    });

    for (const clause of this.data.termsAndConditions) {
      if (!clause.trim()) continue;
      // Each clause carries its own number ("7.", "6.1.", "i."); "Note:" lines have none.
      const match = clause.match(/^(\d+(?:\.\d+)*\.|[ivx]+\.)\s+([\s\S]*)$/);
      if (!match) {
        this.paragraph(clause, { indent: isSubClause(clause) ? 8 : 0, gap: 1.8 });
      } else if (isSubClause(clause)) {
        this.paragraph(match[2], { indent: 8, label: match[1], labelWidth: 10, gap: 1.8 });
      } else {
        this.paragraph(match[2], { label: match[1], labelWidth: 8, gap: 1.8 });
      }
    }
    this.y += 4;
  }

  /** The dispatch reference line, then "Copy to:" and the closing stars. */
  private dispatchAndCopyTo(): void {
    const { pdf, data } = this;

    this.ensure(30);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN, this.y, PAGE_WIDTH - MARGIN, this.y);
    pdf.setLineWidth(0.2);
    this.y += 5;
    this.font('normal', BODY_SIZE);
    pdf.text(`File No: ${printable(data.dispatchRef)}`, MARGIN, this.y);
    pdf.text(`Date: ${printable(data.sanctionDate)}`, PAGE_WIDTH - MARGIN, this.y, { align: 'right' });
    this.y += 8;

    this.paragraph('Copy to:', { gap: 1.5, justify: false });
    data.copyToList
      .filter(item => item.trim())
      .forEach((item, index) => this.paragraph(item, { indent: 4, label: `${index + 1}.`, labelWidth: 8, gap: 1, justify: false }));

    this.y += 4;
    if (this.ensure(8)) this.font('normal', BODY_SIZE);
    pdf.text('*****', PAGE_WIDTH / 2, this.y + 3, { align: 'center' });
    this.y += 8;
  }
}
