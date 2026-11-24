import { FileDoc } from '../../registration/models/otr-form.model';
import { SubmittedTender, SubmittedTenderDoc } from '../../../core/models/tender.model';

/** Registration / signatory / bank documents that can be replaced while editing. */
export type TenderOtrDocType =
  | 'regCert'
  | 'panCard'
  | 'gstCert'
  | 'msmeCert'
  | 'turnoverCert'
  | 'authLetter'
  | 'authIdProof'
  | 'bankDoc';

/** Detail view navigation tabs on application details page. */
export type TenderDetailTab =
  | 'organisation'
  | 'signatory'
  | 'bank'
  | 'documents'
  | 'fees'
  | 'shortfall';

/** Event payload emitted when requesting to open a tender application detail view. */
export interface TenderOpenEvent {
  tender: SubmittedTender;
  tab?: TenderDetailTab;
}

const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * True when `now` is on or before the end of the submission closing date.
 * Accepts `DD-Mon-YYYY`, `DD/MM/YYYY` and 2-digit years; unparseable input is treated as open.
 */
export function isBeforeClosingDate(closingDateStr?: string, now: Date = new Date()): boolean {
  if (!closingDateStr) return true;
  try {
    const parts = closingDateStr.split(/[-/]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      let month = -1;
      let year = parseInt(parts[2], 10);

      const mIdx = MONTH_NAMES.indexOf(parts[1].toLowerCase().slice(0, 3));
      if (mIdx !== -1) {
        month = mIdx;
      } else {
        month = parseInt(parts[1], 10) - 1;
      }
      if (year < 100) year += 2000;
      const closing = new Date(year, month, day, 23, 59, 59);
      return now.getTime() <= closing.getTime();
    }
  } catch {
    return true;
  }
  return true;
}

export function canEditTender(tender: SubmittedTender, now: Date = new Date()): boolean {
  return (
    tender.submittedStatus === 'Submitted' &&
    isBeforeClosingDate(tender.closingDate, now) &&
    (tender.editCount || 0) < (tender.maxEdits || 3)
  );
}

export function remainingEdits(tender: SubmittedTender): number {
  return Math.max(0, (tender.maxEdits || 3) - (tender.editCount || 0));
}

/** Filter criteria for searching and refining the EOI applications table. */
export interface TenderFilterCriteria {
  searchQuery?: string;
  status?: string;
  schemeName?: string;
  schemeCategory?: string;
}

/** Case-insensitive search & filtering across the columns shown in the status table. */
export function filterTenders(
  tenders: SubmittedTender[],
  rawQueryOrCriteria: string | TenderFilterCriteria
): SubmittedTender[] {
  let criteria: TenderFilterCriteria;
  if (typeof rawQueryOrCriteria === 'string') {
    criteria = { searchQuery: rawQueryOrCriteria };
  } else {
    criteria = rawQueryOrCriteria || {};
  }

  const query = (criteria.searchQuery || '').trim().toLowerCase();
  const status = (criteria.status || 'ALL').trim();
  const schemeName = (criteria.schemeName || '').trim();
  const schemeCategory = (criteria.schemeCategory || '').trim();

  let result = tenders;

  // 1. Full-text search
  if (query) {
    result = result.filter(t =>
      t.appRef.toLowerCase().includes(query) ||
      t.schemeTitle.toLowerCase().includes(query) ||
      (t.schemeCategory && t.schemeCategory.toLowerCase().includes(query)) ||
      t.department.toLowerCase().includes(query) ||
      t.submittedStatus.toLowerCase().includes(query) ||
      t.eoiStatus.toLowerCase().includes(query) ||
      (t.rejectionReason && t.rejectionReason.toLowerCase().includes(query)) ||
      t.transactionRef.toLowerCase().includes(query)
    );
  }

  // 2. Status filter
  if (status && status !== 'ALL') {
    result = result.filter(t => t.submittedStatus.toLowerCase() === status.toLowerCase());
  }

  // 3. Scheme Name filter
  if (schemeName && schemeName !== 'ALL') {
    result = result.filter(t =>
      t.schemeTitle === schemeName ||
      t.schemeName === schemeName ||
      t.schemeTitle.toLowerCase() === schemeName.toLowerCase() ||
      (t.schemeName && t.schemeName.toLowerCase() === schemeName.toLowerCase())
    );
  }

  // 4. Scheme Category filter
  if (schemeCategory && schemeCategory !== 'ALL') {
    result = result.filter(t =>
      (t.schemeCategory || '').toLowerCase() === schemeCategory.toLowerCase()
    );
  }

  return result;
}

export function documentCategoryLabel(category: SubmittedTenderDoc['category']): string {
  return category === 'mandatory' ? 'Mandatory Statutory' : (category === 'annexure' ? 'Scheme Annexure' : 'Supporting');
}

/** Human readable size for an uploaded file ("1.2 MB" / "850 KB"). */
export function formatUploadedFileSize(bytes: number): string {
  const sizeMb = bytes / (1024 * 1024);
  return sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Writes the replacement document onto the matching slot of the (editable) tender. */
export function applyOtrDocument(tender: SubmittedTender, docType: TenderOtrDocType, fileDoc: FileDoc): void {
  switch (docType) {
    case 'regCert':
      tender.orgDetails.registrationCertDoc = fileDoc;
      break;
    case 'panCard':
      tender.orgDetails.panCardDoc = fileDoc;
      break;
    case 'gstCert':
      tender.orgDetails.gstCertDoc = fileDoc;
      break;
    case 'msmeCert':
      tender.orgDetails.msmeCertDoc = fileDoc;
      break;
    case 'turnoverCert':
      tender.orgDetails.turnoverCertDoc = fileDoc;
      break;
    case 'authLetter':
      tender.signatoryDetails.authorizationLetterDoc = fileDoc;
      break;
    case 'authIdProof':
      tender.signatoryDetails.idProofDoc = fileDoc;
      break;
    case 'bankDoc':
      tender.bankDetails.cancelledChequeDoc = fileDoc;
      break;
  }
}

/**
 * Computes the total remitted / deposited fee by summing processing fee and EMD fee.
 * Formats the result in Indian Rupee format, e.g. "₹ 52,000.00".
 */
export function calculateTotalFee(processingFee?: string, emdAmount?: string): string {
  const parseNum = (val?: string): number => {
    if (!val) return 0;
    const cleaned = val.replace(/[^\d.]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };
  const total = parseNum(processingFee) + parseNum(emdAmount);
  return `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
