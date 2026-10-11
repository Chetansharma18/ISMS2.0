import {
  CommitteeAdmin,
  EoiAttachment,
  EoiDocumentItem,
  EoiFormData,
  SchemeTender
} from '../tenders.models';

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

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Validates an uploaded file's type and size.
 * Returns an error message, or an empty string when the file is acceptable.
 */
export function validateUploadFile(file: { name: string; size: number }): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext)) {
    return 'Invalid file type. Supported: PDF, TXT, JPEG, PNG, WORD, EXCEL.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'File size exceeds the 25MB limit.';
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
  if (!scheme.createdAt) return false;
  return now - scheme.createdAt > TWENTY_FOUR_HOURS_MS;
}

/**
 * Returns the not-yet-closed schemes that match the search query
 * (name, reference no., description, title), renumbered from 1.
 */
export function filterActiveSchemes(schemes: SchemeTender[], query: string, now: number = Date.now()): SchemeTender[] {
  const q = query.toLowerCase().trim();
  const active = schemes.filter(s => !isSchemeClosed(s, now));
  const list = !q
    ? active
    : active.filter(
        s =>
          s.schemeName.toLowerCase().includes(q) ||
          s.refNo.toLowerCase().includes(q) ||
          s.eoiDescription.toLowerCase().includes(q) ||
          (s.schemeTitle && s.schemeTitle.toLowerCase().includes(q))
      );

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
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dStr;
}

/** Converts a yyyy-mm-dd input value into dd/mm/yyyy. */
export function toDisplayDate(dt: string): string {
  return dt ? dt.split('-').reverse().join('/') : '';
}

/** Blank form model for "Configure New EOI". */
export function createEmptyEoiForm(): EoiFormData {
  return {
    refNo: '',
    scheme: 'MMKVY',
    schemeCategory: 'ALL',
    publishedDate: '',
    submissionDate: '',
    eoiCategory: 'General',
    description: '',
    emdFee: '',
    processFee: '',
    attachments: [],
    documents: []
  };
}

/** Pre-fills the form model from an existing scheme (edit mode). */
export function eoiFormFromScheme(scheme: SchemeTender, now: number = Date.now()): EoiFormData {
  const initialDocs: EoiDocumentItem[] = scheme.attachedDocs || [
    { sNo: 1, name: 'Request for Proposal (RFP)', size: scheme.rfpDocSize || '2.4 MB' },
    { sNo: 2, name: 'Standard Operating Procedure (SOP) for Training Partners', size: scheme.sopDocSize || '1.8 MB' }
  ];

  return {
    refNo: scheme.refNo,
    scheme: scheme.schemeName,
    schemeCategory: normalizeSchemeCategory(scheme.schemeCategory || scheme.category),
    publishedDate: toInputDate(scheme.datePublished),
    submissionDate: toInputDate(scheme.closingDate),
    eoiCategory: scheme.eoiCategory || 'General',
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
    documents: []
  };
}

/**
 * True when all mandatory fields are filled and every added
 * "required document" row has a selection.
 */
export function isEoiFormValid(d: EoiFormData): boolean {
  if (
    !d.refNo ||
    !d.scheme ||
    !d.publishedDate ||
    !d.submissionDate ||
    !d.eoiCategory ||
    !d.emdFee ||
    !d.processFee ||
    d.attachments.length === 0
  ) {
    return false;
  }
  return !d.documents.some(doc => !doc);
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
  const attachedDocsList: EoiDocumentItem[] = d.attachments.map((att, idx) => ({
    sNo: idx + 1,
    name: att.title,
    size: att.size
  }));

  return {
    ...(existingScheme || {}),
    sNo: existingScheme ? existingScheme.sNo : 1,
    refNo: d.refNo,
    schemeName: d.scheme,
    schemeTitle: d.scheme,
    schemeCategory: d.schemeCategory,
    category: d.schemeCategory,
    datePublished: toDisplayDate(d.publishedDate),
    closingDate: toDisplayDate(d.submissionDate),
    eoiCategory: d.eoiCategory,
    eoiDescription: d.description || '',
    status: 'Open',
    emdFee: d.emdFee,
    processFee: d.processFee,
    attachedDocs: attachedDocsList,
    createdAt: existingScheme ? existingScheme.createdAt : now,
    isActive: existingScheme ? existingScheme.isActive : true,
    isFrozen: existingScheme ? existingScheme.isFrozen : false
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
