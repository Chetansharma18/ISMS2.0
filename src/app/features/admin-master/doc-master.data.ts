import type { DocMasterItem } from '../../core/models/admin-masters.model';

/** Where older builds kept Doc Master rows in the browser (read only as a fallback by the EOI form). */
export const DOC_MASTER_STORAGE_KEY = 'DOC_MASTER_ITEMS';

/** Sample rows the EOI form falls back to when the Doc Master cannot be loaded. */
export const INITIAL_DOC_ITEMS: DocMasterItem[] = [
  { id: 'doc-1', schemeName: 'Vishwakarma Yuva Udyami Protsahan Yojana', documents: 'PAN Card, Registration Certificate, Bank Passbook', status: 'Active' },
  { id: 'doc-2', schemeName: 'Mukhyamantri Yuva Swarojgar Yojana (2026)', documents: 'Audited Balance Sheet, Income Proof, Caste Certificate', status: 'Active' },
  { id: 'doc-3', schemeName: 'Mukhyamantri Yuva Sambal Yojana', documents: 'Accreditation Certificate, Past Work Experience, GSTIN', status: 'Active' },
  { id: 'doc-4', schemeName: 'Mukhya Mantri Yuva Kaushal Yojana', documents: 'Tie-up Agreement, Center Infrastructure Proof', status: 'Active' }
];
