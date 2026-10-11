import { Step1OrgDetails, Step3AuthorizedPerson } from '../../../registration/models/otr-form.model';
import { EoiDocumentItem } from './scheme-form.model';

export type EoiDocumentTab = 'all' | EoiDocumentItem['category'];

export type ProcPaymentMethod = 'upi' | 'card' | 'netbanking' | 'e-gras';
export type EmdPaymentMethod = ProcPaymentMethod | 'exemption';

/**
 * Parses a display fee such as "₹50,000" into a whole number of rupees.
 * Falls back to `fallback` when the text is empty, non-numeric or not positive.
 */
export function parseFeeAmount(feeText: string | null | undefined, fallback: number): number {
  const feeStr = feeText || String(fallback);
  const num = parseInt(feeStr.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) || num <= 0 ? fallback : num;
}

/** Converts a whole rupee amount to Indian-style words, e.g. "Rupees Two Thousand Only". */
export function numberToIndianWords(num: number): string {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  };

  if (num === 0) return 'Zero';
  return 'Rupees ' + inWords(num) + ' Only';
}

/** Human readable file size: MB with one decimal from 1 MB up, otherwise whole KB (minimum 1 KB). */
export function formatFileSize(bytes: number): string {
  const sizeMb = bytes / (1024 * 1024);
  return sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Filters documents by tab / category; the 'all' tab returns the list unchanged. */
export function filterDocsByCategory(docs: EoiDocumentItem[], tab: EoiDocumentTab): EoiDocumentItem[] {
  if (tab === 'all') return docs;
  return docs.filter(d => d.category === tab);
}

/** Number of documents whose upload is complete. */
export function countUploaded(docs: EoiDocumentItem[]): number {
  return docs.filter(d => d.status === 'uploaded').length;
}

export function procPaymentModeLabel(method: ProcPaymentMethod): string {
  switch (method) {
    case 'upi': return 'UPI (BHIM / Google Pay / PhonePe)';
    case 'card': return 'Debit / Credit Card (RuPay / Visa)';
    case 'netbanking': return 'Net Banking (SBI / HDFC / Corporate)';
    case 'e-gras': return 'Cyber Treasury Rajasthan (e-GRAS)';
    default: return 'Online Payment Gateway';
  }
}

export function emdPaymentModeLabel(method: EmdPaymentMethod): string {
  switch (method) {
    case 'upi': return 'UPI (BHIM / Google Pay / PhonePe)';
    case 'card': return 'Debit / Credit Card (Visa / RuPay)';
    case 'netbanking': return 'Net Banking (Corporate / Retail)';
    case 'e-gras': return 'Cyber Treasury Rajasthan (e-GRAS)';
    case 'exemption': return 'MSME / Udyam 100% Exemption';
    default: return 'Online Payment Gateway';
  }
}

export function formatRegisteredAddress(s: Step1OrgDetails | null | undefined): string {
  if (!s) return '-';
  const parts = [s.registeredAddress, s.registeredDistrict, s.registeredState];
  let str = parts.filter(p => !!p && p.trim().length > 0).join(', ');
  if (s.registeredPincode?.trim()) str += (str ? ' - ' : '') + s.registeredPincode.trim();
  return str || s.registeredAddress || '-';
}

export function formatOfficeAddress(s: Step1OrgDetails | null | undefined): string {
  if (!s) return '-';
  if (s.sameAsRegistered) return 'Same as Registered Address';
  const parts = [s.officeAddress, s.officeDistrict, s.officeState];
  let str = parts.filter(p => !!p && p.trim().length > 0).join(', ');
  if (s.officePincode?.trim()) str += (str ? ' - ' : '') + s.officePincode.trim();
  return str || s.officeAddress || '-';
}

export function formatResidenceAddress(s: Step3AuthorizedPerson | null | undefined): string {
  return s?.residenceAddress || '-';
}
