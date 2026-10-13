import type { jsPDF } from 'jspdf';
import { formatDateTime } from '../../../../shared/utils';

/** Page layout shared by the e-signed sanction order and IPA PDFs (A4, millimetres). */
export const PAGE_WIDTH = 210;
export const PAGE_HEIGHT = 297;
export const MARGIN = 15;
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
export const BOTTOM_LIMIT = PAGE_HEIGHT - 18;

/** The letterhead fields every document carries. */
export interface PdfLetterhead {
  headerTitle: string;
  headerSubtitle: string;
  headerAddress: string;
}

/** Keeps text the built-in PDF font can print (Latin-1), swapping common typographic characters. */
export function printable(text: string | undefined): string {
  return (text ?? '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '');
}

/** Reads an image (URL or data URL) as a data URL so it can be placed in the PDF. */
export async function loadImage(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Shows a generated PDF in the given browser tab (a new tab is opened if none is given). */
export function showPdf(pdf: jsPDF, tab: Window | null): void {
  const url = String(pdf.output('bloburl'));
  if (tab && !tab.closed) {
    tab.location.href = url;
  } else {
    window.open(url, '_blank');
  }
}

/** Draws the logos, title, sub-title and address. Returns the y position below the letterhead. */
export function drawLetterhead(pdf: jsPDF, data: PdfLetterhead, leftLogo: string | null, rightLogo: string | null): number {
  const top = MARGIN;
  const size = 22;
  if (leftLogo) placeImage(pdf, leftLogo, MARGIN, top, size);
  if (rightLogo) placeImage(pdf, rightLogo, PAGE_WIDTH - MARGIN - size, top, size);

  const centre = PAGE_WIDTH / 2;
  const textWidth = CONTENT_WIDTH - size * 2 - 8;
  let y = top + 4;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  for (const line of pdf.splitTextToSize(printable(data.headerTitle), textWidth) as string[]) {
    pdf.text(line, centre, y, { align: 'center' });
    y += 5;
  }
  pdf.setFontSize(9.5);
  for (const line of pdf.splitTextToSize(printable(data.headerSubtitle), textWidth) as string[]) {
    pdf.text(line, centre, y, { align: 'center' });
    y += 4.2;
  }
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  for (const line of pdf.splitTextToSize(printable(data.headerAddress), textWidth) as string[]) {
    pdf.text(line, centre, y, { align: 'center' });
    y += 3.6;
  }

  const bottom = Math.max(y, top + size) + 3;
  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, bottom, PAGE_WIDTH - MARGIN, bottom);
  pdf.setLineWidth(0.2);
  return bottom + 4;
}

/** Places an image inside a square, keeping its proportions. */
export function placeImage(pdf: jsPDF, image: string, x: number, y: number, size: number): void {
  try {
    const props = pdf.getImageProperties(image);
    const ratio = props.width / props.height;
    const width = ratio >= 1 ? size : size * ratio;
    const height = ratio >= 1 ? size / ratio : size;
    pdf.addImage(image, props.fileType, x + (size - width) / 2, y + (size - height) / 2, width, height);
  } catch {
    // A logo that cannot be read is left out; the rest of the letterhead is still printed.
  }
}

/** The digital signature: signed through Aadhaar OTP e-Sign, with no personal name. */
export function drawSignatureBox(pdf: jsPDF, top: number, signedAt: Date, signedBy: string): void {
  const width = 82;
  const x = PAGE_WIDTH - MARGIN - width;
  pdf.setDrawColor(23, 74, 110);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(x, top, width, 28, 1.5, 1.5, 'FD');

  pdf.setTextColor(23, 74, 110);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.text('Digitally Signed', x + 3, top + 5.5);

  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.8);
  pdf.text('Method: Aadhaar e-Sign (OTP on registered mobile)', x + 3, top + 10.5);
  pdf.text(`Signed by: ${printable(signedBy)}`, x + 3, top + 15);
  pdf.text(`Date & Time: ${printable(formatDateTime(signedAt))}`, x + 3, top + 19.5);
  pdf.text(`Signature ID: ESIGN-${signedAt.getTime().toString().slice(-10)}`, x + 3, top + 24);
  pdf.setTextColor(0, 0, 0);
  pdf.setDrawColor(0, 0, 0);
}

export function addPageNumbers(pdf: jsPDF): void {
  const total = pdf.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Page ${page} of ${total}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 8, { align: 'center' });
  }
  pdf.setTextColor(0, 0, 0);
}
