import type { jsPDF } from 'jspdf';

/** Page layout shared by the e-signed sanction order and IPA PDFs (A4, millimetres). */
export const PAGE_WIDTH = 210;
export const PAGE_HEIGHT = 297;
export const MARGIN = 15;
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

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
