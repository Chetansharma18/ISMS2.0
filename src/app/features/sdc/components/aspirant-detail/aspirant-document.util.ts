import { AspirantDocumentItem } from '../../config/aspirant-form.config';
import { AspirantRecord } from '../../models/aspirant.model';

/** Formats a byte count as megabytes with one decimal, e.g. `2.1 MB`. */
export function formatFileSize(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/** Returns the upper-cased file extension for the badge, or `DOC` when missing/too long. */
export function getDocExtension(filename?: string): string {
  if (!filename) return 'DOC';
  const ext = filename.split('.').pop()?.toUpperCase();
  return ext && ext.length <= 4 ? ext : 'DOC';
}

/** Strips the trailing extension from a file name. */
export function stripFileExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

/** Today's date as `YYYY-MM-DD` (UTC), used as the upload date of new documents. */
export function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

/** Fallback documents shown in view mode when a record has none attached. */
export function buildFallbackDocuments(cand: AspirantRecord): AspirantDocumentItem[] {
  return [
    { id: 'doc-1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Copy', fileName: cand.aadhaarDocName || 'Aadhaar_Document.pdf', fileSize: cand.aadhaarDocSize || '1.4 MB', status: 'UPLOADED', uploadedAt: '2026-09-02' },
    { id: 'doc-2', docType: 'Educational Qualification Certificate', docName: 'Educational Qualification Certificate', fileName: '12th_Pass_Certificate.pdf', fileSize: '2.1 MB', status: 'UPLOADED', uploadedAt: '2026-09-02' },
    { id: 'doc-3', docType: 'Bank Passbook / Cancelled Cheque', docName: 'Bank Passbook / Cancelled Cheque', fileName: 'Bank_Passbook.jpg', fileSize: '850 KB', status: 'UPLOADED', uploadedAt: '2026-09-02' }
  ];
}

/** Fallback documents seeded into the edit form when a record has none attached. */
export function buildFallbackEditDocuments(cand: AspirantRecord): AspirantDocumentItem[] {
  return [
    { id: 'doc-1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Copy', fileName: cand.aadhaarDocName || 'Aadhaar_Document.pdf', fileSize: '1.4 MB', status: 'UPLOADED' },
    { id: 'doc-2', docType: 'Educational Qualification Certificate', docName: 'Educational Qualification Certificate', fileName: '12th_Pass_Certificate.pdf', fileSize: '2.1 MB', status: 'UPLOADED' },
    { id: 'doc-3', docType: 'Bank Passbook / Cancelled Cheque', docName: 'Bank Passbook / Cancelled Cheque', fileName: 'Bank_Passbook.jpg', fileSize: '850 KB', status: 'UPLOADED' }
  ];
}
