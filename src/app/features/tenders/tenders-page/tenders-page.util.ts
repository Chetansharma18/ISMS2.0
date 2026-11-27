import {
  CommitteeAdmin,
  EoiAttachment,
  EoiDocumentItem,
  EoiDurationUnit,
  EoiFormData,
  SchemeTender
} from '../tenders.models';
import { publishValueErrors } from './publish-fields.util';

/** File extensions accepted for EOI attachments and corrigenda. */
export const ALLOWED_UPLOAD_EXTENSIONS: readonly string[] = [
  'pdf',
  'txt',
  'jpeg',
  'jpg',
  'png',
  'doc',
  'docx',
  'xls',
  'xlsx'
];

/** Maximum upload size (25 MB). */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Approved EOI reference pattern, e.g. RSLDC/EOI/2026-27/01 or EOI/2026/01 */
export const EOI_REF_NO_REGEX = /^[A-Za-z0-9]+([/_\-][A-Za-z0-9]+)+$/;

export const MAX_EOI_DURATION_YEARS = 15;
export const MAX_SUBMISSION_DAYS = 365;

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Returns today's date formatted as YYYY-MM-DD in the Asia/Kolkata timezone.
 */
export function getTodayKolkataDate(now: number = Date.now()): string {
  const d = new Date(now);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(d);
}

/**
 * Validates whether a date string is a real calendar date (checks day, month, leap year, no 31-Feb, year 2000-2099).
 */
export function isValidCalendarDate(dStr?: string | null): boolean {
  if (!dStr) return false;
  const parts = dStr.includes('/') ? dStr.split('/') : dStr.split('-');
  if (parts.length !== 3) return false;
  let year: number;
  let month: number;
  let day: number;

  if (parts[0].length === 4) {
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 1990 || year > 2099 || month < 1 || month > 12 || day < 1 || day > 31) return false;

  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

/** Parses numeric currency value from formatted string (e.g. "₹50,000" -> 50000). */
export function parseFeeNumber(val: string | number | null | undefined): number {
  if (val == null) return NaN;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[₹,\s]/g, '').trim();
  if (!cleaned) return NaN;
  return Number(cleaned);
}

/** Strips HTML tags and trims whitespace to prevent script injection. */
export function sanitizeInput(str?: string | null): string {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Validates an uploaded file's type, size, and non-emptiness.
 * Returns an error message, or an empty string when the file is acceptable.
 */
export function validateUploadFile(file: { name: string; size: number } | null | undefined): string {
  if (!file) {
    return 'The uploaded file is invalid or corrupted.';
  }
  if (file.size === 0) {
    return 'File cannot be empty.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'File size exceeds the 25MB limit.';
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext)) {
    return 'Invalid file type. Supported: PDF, TXT, JPEG, PNG, WORD, EXCEL.';
  }
  return '';
}

/** Human readable file size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/** True when the scheme is marked closed or its closing date is in the past. */
export function isSchemeClosed(scheme: SchemeTender | null | undefined, now: number = Date.now()): boolean {
  if (!scheme) return false;
  if (scheme.status === 'Closed') return true;
  if (!scheme.closingDate) return false;

  const separator = scheme.closingDate.includes('/') ? '/' : scheme.closingDate.includes('-') ? '-' : null;
  if (!separator) return false;

  const parts = scheme.closingDate.split(separator);
  if (parts.length === 3) {
    let year: number;
    let month: number;
    let day: number;

    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }

    const closeDate = new Date(year, month, day, 23, 59, 59);
    if (!isNaN(closeDate.getTime())) {
      return closeDate.getTime() < now;
    }
  }
  return false;
}

/** Edits are only allowed within 24 hours of scheme creation. */
export function isEditDisabled(scheme: SchemeTender, now: number = Date.now()): boolean {
  // The backend decides when it sends the flag (drafts stay editable; frozen EOIs never are).
  if (scheme.isEditable !== undefined) return !scheme.isEditable;
  if (!scheme.createdAt) return false;
  return now - scheme.createdAt > TWENTY_FOUR_HOURS_MS;
}

/**
 * Returns the not-yet-closed schemes that match the search query
 * (name, reference no., description, title, category, code), renumbered from 1.
 */
export function filterActiveSchemes(schemes: SchemeTender[], query: string, now: number = Date.now()): SchemeTender[] {
  const q = query.toLowerCase().trim();
  const active = schemes.filter(s => !isSchemeClosed(s, now));
  if (!q) {
    return active.map((item, idx) => ({ ...item, sNo: idx + 1 }));
  }

  const list = active.filter(s => {
    const name = (s.schemeName || '').toLowerCase();
    const title = (s.schemeTitle || '').toLowerCase();
    const ref = (s.refNo || '').toLowerCase();
    const desc = (s.eoiDescription || '').toLowerCase();
    const cat = (s.schemeCategory || (s as any).category || '').toLowerCase();
    const code = ((s as any).code || '').toLowerCase();
    return (
      name.includes(q) ||
      title.includes(q) ||
      ref.includes(q) ||
      desc.includes(q) ||
      cat.includes(q) ||
      code.includes(q)
    );
  });

  return list.map((item, idx) => ({
    ...item,
    sNo: idx + 1
  }));
}

/** Filters committee admins by name, role or SSO id. */
export function filterAdmins<T extends CommitteeAdmin>(admins: T[], query: string): T[] {
  const q = query.toLowerCase().trim();
  if (!q) return admins;
  return admins.filter(
    a => a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q) || a.ssoId.toLowerCase().includes(q)
  );
}

/** Maps a scheme's stored category value onto one of the fixed dropdown options. */
export function normalizeSchemeCategory(value?: string): string {
  const v = (value || '').trim().toUpperCase();
  if (v.includes('RAJKVIK') || v.includes('RAJVIK')) return 'RAJVIK';
  if (v.includes('SAKSH')) return 'SAKSHAM';
  if (v.includes('SAMARTH')) return 'SAMARTH';
  if (v === 'NA' || v === '') return 'NA';
  return 'ALL';
}

/** Converts a dd/mm/yyyy (or dd-mm-yyyy) display date into a yyyy-mm-dd value for date inputs. */
export function toInputDate(dStr?: string): string {
  if (!dStr) return '';
  const parts = dStr.includes('/') ? dStr.split('/') : dStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // Already YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    // DD/MM/YYYY -> YYYY-MM-DD
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dStr;
}

/** Converts a yyyy-mm-dd input value into dd/mm/yyyy. */
export function toDisplayDate(dt: string): string {
  if (!dt) return '';
  const parts = dt.includes('/') ? dt.split('/') : dt.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
  }
  return dt;
}

/** Formats an EOI duration value in years for display (e.g. "1 Year", "3 Years"). */
export function formatEoiDuration(
  value: string | number | null | undefined,
  unit: EoiDurationUnit = 'Years'
): string {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) return '';
  const singular = unit.endsWith('s') ? unit.slice(0, -1) : unit;
  return `${num} ${num === 1 ? singular : unit}`;
}

/** Parses a persisted EOI duration string (e.g. "3 Years", "1 Year") into value + unit. */
export function parseEoiDuration(duration?: string): { value: string; unit: EoiDurationUnit } {
  if (!duration) return { value: '', unit: 'Years' };
  const match = duration.trim().match(/^(\d+(?:\.\d+)?)\s*(year|years)?$/i);
  if (!match) return { value: '', unit: 'Years' };
  return { value: match[1], unit: 'Years' };
}

/**
 * Filters master records (Doc Master or Annexure Master) by scheme and extracts their names.
 * Supports both multi-scheme array (`item.schemes`) and legacy single-scheme string (`item.schemeName`).
 */
export function parseMasterEntriesByScheme<T extends { schemeName?: string; schemes?: string[]; status?: string }>(
  items: T[],
  schemeName: string,
  fieldExtractor: (item: T) => string | undefined
): string[] {
  if (!schemeName) return [];
  const target = schemeName.trim().toLowerCase();
  const results: string[] = [];

  for (const item of items) {
    if (item.status === 'Inactive') continue;

    if (Array.isArray(item.schemes) && item.schemes.length > 0) {
      const matches = item.schemes.some(s => {
        const lower = s.trim().toLowerCase();
        return (
          lower === 'all' ||
          lower === 'all schemes' ||
          lower === target ||
          lower.includes(target) ||
          target.includes(lower)
        );
      });
      if (matches) {
        const name = fieldExtractor(item);
        if (name) {
          name.split(',').map(s => s.trim()).filter(Boolean).forEach(entry => results.push(entry));
        }
      }
    } else {
      const s = (item.schemeName || '').trim().toLowerCase();
      if (s === 'all' || s === 'all schemes' || s === target || s.includes(target) || target.includes(s)) {
        const raw = fieldExtractor(item);
        if (raw) {
          raw.split(',').map(x => x.trim()).filter(Boolean).forEach(entry => results.push(entry));
        }
      }
    }
  }

  return Array.from(new Set(results));
}

/** Blank form model for "Configure New EOI". */
export function createEmptyEoiForm(): EoiFormData {
  return {
    refNo: '',
    scheme: '',
    schemeCategory: '',
    publishedDate: '',
    submissionDate: '',
    eoiDurationValue: '',
    eoiDurationUnit: 'Years',
    eoiCategory: '',
    description: '',
    emdFee: '',
    processFee: '',
    attachments: [],
    documents: [],
    annexures: [],
    publishFields: [],
    uploadFields: [],
    documentFiles: {}
  };
}

/** Pre-fills the form model from an existing scheme (edit mode). */
export function eoiFormFromScheme(scheme: SchemeTender, now: number = Date.now()): EoiFormData {
  const initialDocs: EoiDocumentItem[] = scheme.attachedDocs || [
    { sNo: 1, name: 'Request for Proposal (RFP)', size: scheme.rfpDocSize || '2.4 MB' },
    { sNo: 2, name: 'Standard Operating Procedure (SOP) for Training Partners', size: scheme.sopDocSize || '1.8 MB' }
  ];
  const parsedDuration = parseEoiDuration(scheme.eoiDuration);

  return {
    refNo: scheme.refNo,
    scheme: scheme.schemeName,
    schemeCategory: scheme.schemeCategory || scheme.category || '',
    publishedDate: toInputDate(scheme.datePublished),
    submissionDate: toInputDate(scheme.closingDate),
    eoiDurationValue: parsedDuration.value,
    eoiDurationUnit: parsedDuration.unit,
    eoiCategory: scheme.eoiCategory || '',
    description: scheme.eoiDescription || '',
    emdFee: scheme.emdFee || '',
    processFee: scheme.processFee || '',
    attachments: initialDocs.map((doc, i) => ({
      id: 'att_' + i + '_' + now,
      title: doc.name,
      fileName: doc.name.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.pdf',
      size: doc.size,
      file: new File([], doc.name)
    })),
    documents: scheme.requiredDocs ? [...scheme.requiredDocs] : [],
    annexures: scheme.annexures ? [...scheme.annexures] : [],
    publishFields: scheme.publishFields ? JSON.parse(JSON.stringify(scheme.publishFields)) : [],
    uploadFields: scheme.uploadFields ? JSON.parse(JSON.stringify(scheme.uploadFields)) : [],
    documentFiles: {}
  };
}

export function validateEoiRefNo(
  refNo: string | undefined | null,
  existingRefNos: string[] = [],
  currentRefNo?: string | null
): string {
  const trimmed = (refNo ?? '').trim();
  if (!trimmed) {
    return 'EOI Reference Number is required.';
  }
  if (trimmed.length > 100) {
    return 'EOI Reference Number cannot exceed 100 characters.';
  }
  if (!EOI_REF_NO_REGEX.test(trimmed)) {
    return 'Invalid EOI Reference Number format (e.g. RSLDC/EOI/2026-27/01).';
  }
  const norm = trimmed.toLowerCase();
  const currentNorm = (currentRefNo ?? '').trim().toLowerCase();
  const isDuplicate = existingRefNos.some(
    r => r.trim().toLowerCase() === norm && r.trim().toLowerCase() !== currentNorm
  );
  if (isDuplicate) {
    return 'This EOI Reference Number already exists.';
  }
  return '';
}

export function validatePublishedDate(
  publishedDate: string | undefined | null,
  isScheduled: boolean = false,
  todayStr: string = getTodayKolkataDate()
): string {
  const pub = (publishedDate ?? '').trim();
  if (!pub) {
    return 'Please select the EOI Publication Date.';
  }
  if (!isValidCalendarDate(pub)) {
    return 'Please enter a valid publication date.';
  }
  const pubIso = toInputDate(pub);
  if (!isScheduled && pubIso > todayStr) {
    return 'EOI Publication Date cannot be a future date.';
  }
  const currentYear = parseInt(todayStr.split('-')[0], 10);
  const pubYear = parseInt(pubIso.split('-')[0], 10);
  if (pubYear < currentYear) {
    return 'EOI Publication Date cannot be from a past year.';
  }
  return '';
}

export function validateSubmissionDate(
  submissionDate: string | undefined | null,
  publishedDate: string | undefined | null,
  todayStr: string = getTodayKolkataDate(),
  minDays: number = 1,
  maxDays: number = MAX_SUBMISSION_DAYS
): string {
  const sub = (submissionDate ?? '').trim();
  if (!sub) {
    return 'Please select the Last Date of EOI Submission.';
  }
  const subIso = toInputDate(sub);
  const subYear = parseInt(subIso.split('-')[0], 10);
  if (subYear > 2099 || subYear < 2000) {
    return 'Submission period exceeds the permitted duration.';
  }
  if (!isValidCalendarDate(sub)) {
    return 'Please enter a valid submission date.';
  }
  const pubIso = toInputDate(publishedDate || '');

  if (pubIso) {
    if (!isValidCalendarDate(pubIso)) {
      return 'Please enter a valid publication date.';
    }
    if (subIso <= pubIso) {
      return 'Submission deadline must be after the publication date.';
    }
  }

  if (subIso <= todayStr) {
    return 'Submission deadline must be in the future.';
  }

  const baseIso = pubIso || todayStr;
  const subTime = new Date(subIso).getTime();
  const baseTime = new Date(baseIso).getTime();
  const diffDays = Math.round((subTime - baseTime) / (24 * 60 * 60 * 1000));

  if (diffDays > maxDays) {
    return 'Submission period exceeds the permitted duration.';
  }
  if (diffDays < minDays) {
    return 'Submission deadline must be after the publication date.';
  }

  return '';
}

export function validateEoiDuration(
  durationValue: string | number | undefined | null,
  maxYears: number = MAX_EOI_DURATION_YEARS
): string {
  const trimmed = String(durationValue ?? '').trim();
  if (!trimmed) {
    return 'EOI Duration is required.';
  }
  if (!/^\d+$/.test(trimmed)) {
    return 'Please enter a valid duration.';
  }
  const num = parseInt(trimmed, 10);
  if (num <= 0) {
    return 'Please enter a valid duration.';
  }
  if (num > maxYears) {
    return 'Duration exceeds the permitted limit for this scheme.';
  }
  return '';
}

export function validateEoiDescription(desc: string | undefined | null): string {
  if (desc == null || desc === '') return '';
  if (desc.trim().length === 0) {
    return 'EOI Description cannot contain only whitespace.';
  }
  if (desc.length > 250) {
    return 'EOI Description cannot exceed 250 characters.';
  }
  return '';
}

export function validateFee(
  amount: string | number | undefined | null,
  feeName: string,
  expectedAmount?: number | null,
  isExempted: boolean = false
): string {
  const trimmed = String(amount ?? '').trim();
  if (!trimmed) {
    return `${feeName} is required.`;
  }
  const num = parseFeeNumber(trimmed);
  if (isNaN(num) || !Number.isFinite(num) || num < 0) {
    return `Please enter a valid ${feeName}.`;
  }
  if (num === 0 && !isExempted) {
    return `Please enter a valid ${feeName}.`;
  }
  if (expectedAmount != null && !isExempted && Math.round(num) !== Math.round(expectedAmount)) {
    return `${feeName} does not match the selected scheme.`;
  }
  return '';
}

function validateDistinctList(
  items: string[] = [],
  emptyError: string,
  duplicateError: string
): { isValid: boolean; errors: Record<number, string> } {
  const errors: Record<number, string> = {};
  const seen = new Set<string>();

  items.forEach((item, idx) => {
    const trimmed = (item ?? '').trim();
    if (!trimmed) {
      errors[idx] = emptyError;
      return;
    }
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) {
      errors[idx] = duplicateError;
    } else {
      seen.add(lower);
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateDocuments(
  documents: string[] = []
): { isValid: boolean; errors: Record<number, string> } {
  return validateDistinctList(
    documents,
    'Please select a document type.',
    'This document type has already been added.'
  );
}

export function validateAnnexures(
  annexures: string[] = []
): { isValid: boolean; errors: Record<number, string> } {
  return validateDistinctList(
    annexures,
    'Please select an annexure format.',
    'This annexure has already been added.'
  );
}

export interface EoiValidationOptions {
  existingRefNos?: string[];
  currentRefNo?: string | null;
  activeSchemeNames?: string[];
  activeEoiCategories?: string[];
  schemeMasterItems?: { schemeName?: string; schemeCategory?: string; amount?: number; processFees?: number; status?: string }[];
  todayStr?: string;
  isScheduled?: boolean;
  isDraft?: boolean;
  maxDurationYears?: number;
  maxSubmissionDays?: number;
}

export interface EoiValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  docErrors: Record<number, string>;
  annexureErrors: Record<number, string>;
}

export function validateEoiFormComplete(
  d: EoiFormData,
  options?: EoiValidationOptions
): EoiValidationResult {
  const errors: Record<string, string> = {};
  const todayStr = options?.todayStr ?? getTodayKolkataDate();

  if (options?.isDraft) {
    if (d.refNo?.trim()) {
      const refErr = validateEoiRefNo(d.refNo, options.existingRefNos, options.currentRefNo);
      if (refErr) errors['refNo'] = refErr;
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      docErrors: {},
      annexureErrors: {}
    };
  }

  // 1. EOI Reference No.
  const refErr = validateEoiRefNo(d.refNo, options?.existingRefNos, options?.currentRefNo);
  if (refErr) errors['refNo'] = refErr;

  // 2. Scheme
  const schemeName = (d.scheme ?? '').trim();
  if (!schemeName) {
    errors['scheme'] = 'Please select a valid scheme.';
  } else if (options?.activeSchemeNames && options.activeSchemeNames.length > 0) {
    if (!options.activeSchemeNames.some(s => s.toLowerCase() === schemeName.toLowerCase())) {
      errors['scheme'] = 'Please select a valid scheme.';
    }
  }

  // Find SchemeMasterItem if available
  const schemeItem = options?.schemeMasterItems?.find(
    s => s.schemeName?.trim().toLowerCase() === schemeName.toLowerCase()
  );

  // 3. Scheme Category: chosen on the EOI (one or more Scheme Category Master entries), not tied to the scheme.

  // 4. EOI Category
  const eoiCat = (d.eoiCategory ?? '').trim();
  if (!eoiCat) {
    errors['eoiCategory'] = 'Please select an EOI Category.';
  } else if (options?.activeEoiCategories && options.activeEoiCategories.length > 0) {
    if (!options.activeEoiCategories.some(c => c.toLowerCase() === eoiCat.toLowerCase())) {
      errors['eoiCategory'] = 'Please select an EOI Category.';
    }
  }

  // 5. Date of EOI Published
  const pubErr = validatePublishedDate(d.publishedDate, options?.isScheduled, todayStr);
  if (pubErr) {
    errors['publishedDate'] = pubErr;
  }

  // 6. Last Date of EOI Submission
  const subErr = validateSubmissionDate(
    d.submissionDate,
    d.publishedDate,
    todayStr,
    1,
    options?.maxSubmissionDays ?? MAX_SUBMISSION_DAYS
  );
  if (subErr) {
    errors['submissionDate'] = subErr;
  }

  // 7. EOI Duration
  const durErr = validateEoiDuration(d.eoiDurationValue, options?.maxDurationYears ?? MAX_EOI_DURATION_YEARS);
  if (durErr) {
    errors['eoiDurationValue'] = durErr;
  }

  // 8. EOI Description
  const descErr = validateEoiDescription(d.description);
  if (descErr) {
    errors['description'] = descErr;
  }

  // 9. EMD Fee
  const emdErr = validateFee(
    d.emdFee,
    'EMD Fee',
    schemeItem ? schemeItem.amount : null,
    d.isFeeExempted
  );
  if (emdErr) {
    errors['emdFee'] = emdErr;
  }

  // 10. Process Fee
  const procErr = validateFee(
    d.processFee,
    'Process Fee',
    schemeItem ? schemeItem.processFees : null,
    d.isFeeExempted
  );
  if (procErr) {
    errors['processFee'] = procErr;
  }

  // 11. Documents
  const docResult = validateDocuments(d.documents || []);

  // 12. Annexures
  const annexureResult = validateAnnexures(d.annexures || []);

  const isValid = Object.keys(errors).length === 0 && docResult.isValid && annexureResult.isValid;

  return {
    isValid,
    errors,
    docErrors: docResult.errors,
    annexureErrors: annexureResult.errors
  };
}

/**
 * True when all mandatory fields are valid and comply with government portal standards.
 */
export function isEoiFormValid(
  d: EoiFormData,
  options?: EoiValidationOptions
): boolean {
  return validateEoiFormComplete(d, options).isValid;
}

/**
 * Validates Form 1: Publish Details (Expression of Interest Details).
 * Validates the 10 core scheme parameters and EOI details.
 */
export function validatePublishDetailsStep(
  d: EoiFormData,
  options?: EoiValidationOptions
): { isValid: boolean; errors: Record<string, string> } {
  const complete = validateEoiFormComplete(d, options);
  // Publish Details custom fields carry the value applicants are shown (checked like the backend does).
  const errors: Record<string, string> = { ...complete.errors };
  for (const { index, message } of publishValueErrors(d.publishFields)) errors[`publishFields.${index}`] = message;
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates Form 2: Uploading Details (Supporting Documents & Annexures).
 */
export function validateUploadingDetailsStep(
  d: EoiFormData
): { isValid: boolean; docErrors: Record<number, string>; annexureErrors: Record<number, string> } {
  const docResult = validateDocuments(d.documents || []);
  const annexureResult = validateAnnexures(d.annexures || []);
  return {
    isValid: docResult.isValid && annexureResult.isValid,
    docErrors: docResult.errors,
    annexureErrors: annexureResult.errors
  };
}

/** Builds a new attachment entry from the upload form. */
export function createAttachment(title: string, file: File): EoiAttachment {
  return {
    id: Date.now().toString() + Math.random().toString().slice(2, 6),
    title,
    fileName: file.name,
    size: formatBytes(file.size),
    file
  };
}

/** Builds the scheme object to persist from the form model (new or edit mode). */
export function buildSchemeFromForm(
  d: EoiFormData,
  existingScheme: SchemeTender | null | undefined,
  now: number = Date.now()
): SchemeTender {
  const attachedDocsList: EoiDocumentItem[] = (d.attachments || []).map((att, idx) => ({
    sNo: idx + 1,
    name: att.title,
    size: att.size
  }));

  if (d.documentFiles) {
    let nextSNo = attachedDocsList.length + 1;
    for (const [idxStr, up] of Object.entries(d.documentFiles)) {
      if (up && up.fileName) {
        const docName = d.documents[Number(idxStr)] || up.name || 'Document';
        attachedDocsList.push({
          sNo: nextSNo++,
          name: `${docName} (${up.fileName})`,
          size: up.size
        });
      }
    }
  }

  const trimmedRefNo = (d.refNo || '').trim();
  const sanitizedDesc = sanitizeInput(d.description);
  const status = d.status || (existingScheme?.status ?? 'Open');

  return {
    ...(existingScheme || {}),
    sNo: existingScheme ? existingScheme.sNo : 1,
    refNo: trimmedRefNo,
    schemeName: d.scheme,
    schemeTitle: d.scheme,
    schemeCategory: d.schemeCategory,
    category: d.schemeCategory,
    datePublished: toDisplayDate(d.publishedDate),
    closingDate: toDisplayDate(d.submissionDate),
    eoiDuration: formatEoiDuration(d.eoiDurationValue, d.eoiDurationUnit),
    eoiCategory: d.eoiCategory,
    eoiDescription: sanitizedDesc,
    status: status as any,
    emdFee: d.emdFee,
    processFee: d.processFee,
    emdAmount: parseFeeNumber(d.emdFee),
    processFeeAmount: parseFeeNumber(d.processFee),
    isFeeExempted: d.isFeeExempted,
    attachedDocs: attachedDocsList,
    requiredDocs: d.documents ? d.documents.filter(Boolean) : existingScheme?.requiredDocs || [],
    annexures: d.annexures ? d.annexures.filter(Boolean) : existingScheme?.annexures || [],
    publishFields: d.publishFields || existingScheme?.publishFields || [],
    uploadFields: d.uploadFields || existingScheme?.uploadFields || [],
    customFields: [
      ...(d.publishFields || existingScheme?.publishFields || []),
      ...(d.uploadFields || existingScheme?.uploadFields || [])
    ],
    createdAt: existingScheme ? (existingScheme.createdAt ?? now) : now,
    updatedAt: now,
    publishedAt: status === 'Open' ? (existingScheme?.publishedAt || now) : undefined,
    isActive: existingScheme ? existingScheme.isActive : true,
    isFrozen: existingScheme ? existingScheme.isFrozen : false,
    isNew: existingScheme ? (existingScheme.isNew ?? false) : true
  };
}

/** Builds the corrigendum document entry appended to a scheme's attached docs. */
export function buildCorrigendumDoc(title: string, fileSizeBytes: number, existingDocCount: number): EoiDocumentItem {
  const rawTitle = title.trim() || 'Corrigendum Document';
  const docTitle = rawTitle.toLowerCase().startsWith('corrigendum') ? rawTitle : `Corrigendum: ${rawTitle}`;
  return {
    sNo: existingDocCount + 1,
    name: docTitle,
    size: formatBytes(fileSizeBytes)
  };
}
