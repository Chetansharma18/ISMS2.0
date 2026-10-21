import type { jsPDF } from 'jspdf';
import { formatDateTime } from '../../../../shared/utils';
import { CONTENT_WIDTH, MARGIN, PAGE_HEIGHT, PAGE_WIDTH, placeImage, printable } from './pdf-common';
import type { PdfLetterhead } from './pdf-common';

/**
 * The page layout of the e-signed RSLDC letters (sanction order and IPA): the letterhead on top of every page, the
 * footer with the contact lines and the digital signature at the bottom of every page, and the body in between.
 * A letter extends this class and draws its own body with `paragraph`, `ensure` and `font`.
 */

/** The printed letters are set in a serif face (Times); the footer is in a sans face, as on the printed order. */
export const SERIF = 'times';
export const SANS = 'helvetica';
export const BODY_SIZE = 10.5;
/** Millimetres per point, and the line spacing of the body text. */
export const PT = 0.3528;
export const SPACING = 1.3;

/** Top of the footer of every page (the rule above the contact lines and the signature). */
export const FOOTER_TOP = PAGE_HEIGHT - 27;
/** Body text stops here, above the footer. */
export const BODY_BOTTOM = FOOTER_TOP - 4;

export type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';

export interface ParagraphOptions {
  style?: FontStyle;
  size?: number;
  /** Left edge, in from the page margin (mm). */
  indent?: number;
  /** Number or letter printed before the first line, such as "6.1." or "a)". */
  label?: string;
  labelWidth?: number;
  /** Space after the paragraph (mm). */
  gap?: number;
  /** Stretch the lines to the full width (default). */
  justify?: boolean;
}

export class OfficialPdfPage {
  protected y = MARGIN;

  constructor(
    protected readonly pdf: jsPDF,
    private readonly head: PdfLetterhead,
    private readonly leftLogo: string | null,
    private readonly rightLogo: string | null
  ) {}

  // ---- Page furniture --------------------------------------------------------------------------

  /** Logos, organisation name, sub-title, address and the heavy rule. Printed at the top of every page. */
  protected drawHeader(): void {
    const { pdf, head } = this;
    const logo = 20;
    const top = 10;
    if (this.leftLogo) placeImage(pdf, this.leftLogo, MARGIN, top, logo);
    if (this.rightLogo) placeImage(pdf, this.rightLogo, PAGE_WIDTH - MARGIN - logo, top, logo);

    const centre = PAGE_WIDTH / 2;
    const textWidth = CONTENT_WIDTH - logo * 2 - 6;
    let y = top + 6;
    pdf.setFont(SERIF, 'bold');
    pdf.setFontSize(15);
    for (const line of pdf.splitTextToSize(printable(head.headerTitle), textWidth) as string[]) {
      pdf.text(line, centre, y, { align: 'center' });
      y += 6;
    }
    pdf.setFontSize(10.5);
    for (const line of pdf.splitTextToSize(printable(head.headerSubtitle), textWidth) as string[]) {
      pdf.text(line, centre, y, { align: 'center' });
      y += 4.6;
    }

    y = Math.max(y, top + logo) + 3;
    pdf.setFont(SERIF, 'normal');
    pdf.setFontSize(10.5);
    for (const line of pdf.splitTextToSize(printable(head.headerAddress), CONTENT_WIDTH) as string[]) {
      pdf.text(line, centre, y, { align: 'center' });
      y += 4.6;
    }

    y += 0.5;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.7);
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    pdf.setLineWidth(0.2);
    this.y = y + 6;
  }

  protected newPage(): void {
    this.pdf.addPage();
    this.drawHeader();
  }

  /** Starts a new page when `height` does not fit. Returns true when it did, so the caller can set its font again. */
  protected ensure(height: number): boolean {
    if (this.y + height <= BODY_BOTTOM) return false;
    this.newPage();
    return true;
  }

  /** Rule, page number, contact lines and the digital signature, on every page. */
  protected drawFooters(signedAt: Date, signedBy: string): void {
    const { pdf } = this;
    const total = pdf.getNumberOfPages();
    const signatureId = `ESIGN-${signedAt.getTime().toString().slice(-10)}`;
    const signedOn = printable(formatDateTime(signedAt));

    for (let page = 1; page <= total; page++) {
      pdf.setPage(page);
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(MARGIN, FOOTER_TOP, PAGE_WIDTH - MARGIN, FOOTER_TOP);
      pdf.setLineWidth(0.2);

      pdf.setTextColor(0, 0, 0);
      pdf.setFont(SANS, 'bold');
      pdf.setFontSize(8);
      pdf.text(`${page} Pg.`, MARGIN + 4, FOOTER_TOP + 6);
      pdf.text('Website: https://livelihoods.rajasthan.gov.in/rsldc', MARGIN + 20, FOOTER_TOP + 6);
      pdf.text('E-mail: md.rsldc-rj@gov.in', MARGIN + 20, FOOTER_TOP + 10.5);
      pdf.text('Telephone: 0141-2701174', MARGIN + 20, FOOTER_TOP + 15);

      // Digital signature, the same on each page
      const width = 60;
      const height = 19;
      const x = PAGE_WIDTH - MARGIN - width;
      const top = FOOTER_TOP + 3;
      pdf.setDrawColor(23, 74, 110);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(x, top, width, height, 1.2, 1.2, 'FD');
      pdf.setTextColor(23, 74, 110);
      pdf.setFont(SANS, 'bold');
      pdf.setFontSize(7.5);
      pdf.text('Digitally Signed (Aadhaar e-Sign)', x + 2.5, top + 4.5);
      pdf.setTextColor(30, 41, 59);
      pdf.setFont(SANS, 'normal');
      pdf.setFontSize(6.8);
      pdf.text(pdf.splitTextToSize(`Signed by: ${printable(signedBy)}`, width - 5)[0] as string, x + 2.5, top + 8.8);
      pdf.text(`Date & Time: ${signedOn}`, x + 2.5, top + 12.6);
      pdf.text(`Signature ID: ${signatureId}`, x + 2.5, top + 16.4);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(0, 0, 0);
  }

  // ---- Text helpers ----------------------------------------------------------------------------

  protected font(style: FontStyle, size: number): void {
    this.pdf.setFont(SERIF, style);
    this.pdf.setFontSize(size);
  }

  /** Prints one line; a line that is not the last of its paragraph is stretched to the full width. */
  private textLine(text: string, x: number, baseline: number, width: number, justify: boolean): void {
    const { pdf } = this;
    const words = text.split(' ').filter(word => word.length > 0);
    if (!justify || words.length < 2) {
      pdf.text(text, x, baseline);
      return;
    }
    const wordsWidth = words.reduce((sum, word) => sum + pdf.getTextWidth(word), 0);
    const gap = (width - wordsWidth) / (words.length - 1);
    // A very loose line would look worse stretched than ragged.
    if (gap > pdf.getTextWidth(' ') * 4) {
      pdf.text(text, x, baseline);
      return;
    }
    let cursor = x;
    for (const word of words) {
      pdf.text(word, cursor, baseline);
      cursor += pdf.getTextWidth(word) + gap;
    }
  }

  /** A justified paragraph that moves on to a new page when it runs out of room. */
  protected paragraph(text: string, opts: ParagraphOptions = {}): void {
    const { pdf } = this;
    const style = opts.style ?? 'normal';
    const size = opts.size ?? BODY_SIZE;
    const indent = opts.indent ?? 0;
    const labelWidth = opts.label ? (opts.labelWidth ?? 8) : 0;
    const x = MARGIN + indent + labelWidth;
    const width = CONTENT_WIDTH - indent - labelWidth;
    const lineHeight = size * PT * SPACING;

    this.font(style, size);
    const lines = pdf.splitTextToSize(printable(text), width) as string[];
    lines.forEach((line, index) => {
      if (this.ensure(lineHeight)) this.font(style, size);
      const baseline = this.y + lineHeight * 0.75;
      if (index === 0 && opts.label) pdf.text(opts.label, MARGIN + indent, baseline);
      this.textLine(line, x, baseline, width, (opts.justify ?? true) && index < lines.length - 1);
      this.y += lineHeight;
    });
    this.y += opts.gap ?? 1.6;
  }
}
