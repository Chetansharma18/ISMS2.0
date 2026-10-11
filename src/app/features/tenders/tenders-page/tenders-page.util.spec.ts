import { describe, it, expect } from 'vitest';
import {
  buildCorrigendumDoc,
  buildSchemeFromForm,
  createAttachment,
  createEmptyEoiForm,
  filterActiveSchemes,
  filterAdmins,
  formatBytes,
  isEditDisabled,
  isEoiFormValid,
  isSchemeClosed,
  normalizeSchemeCategory,
  toDisplayDate,
  toInputDate,
  validateUploadFile
} from './tenders-page.util';
import { EoiFormData, SchemeTender } from '../tenders.models';

const scheme = (over: Partial<SchemeTender> = {}): SchemeTender => ({
  sNo: 1,
  refNo: 'RSLDC/EOI/001',
  schemeName: 'MMKVY',
  schemeCategory: 'ALL',
  datePublished: '01/01/2026',
  closingDate: '31/12/2999',
  eoiCategory: 'General',
  eoiDescription: 'Skill training scheme',
  ...over
});

describe('tenders-page.util', () => {
  // Local-time constructor so the tests do not depend on the machine's time zone.
  const now = new Date(2026, 0, 10, 12, 0).getTime(); // 10 Jan 2026, 12:00

  describe('isSchemeClosed', () => {
    it('returns false for null / undefined', () => {
      expect(isSchemeClosed(null)).toBe(false);
      expect(isSchemeClosed(undefined)).toBe(false);
    });

    it('treats status Closed as closed', () => {
      expect(isSchemeClosed(scheme({ status: 'Closed' }), now)).toBe(true);
    });

    it('parses dd/mm/yyyy closing dates', () => {
      expect(isSchemeClosed(scheme({ closingDate: '09/01/2026' }), now)).toBe(true);
      expect(isSchemeClosed(scheme({ closingDate: '10/01/2026' }), now)).toBe(false);
      expect(isSchemeClosed(scheme({ closingDate: '11/01/2026' }), now)).toBe(false);
    });

    it('parses yyyy-mm-dd closing dates', () => {
      expect(isSchemeClosed(scheme({ closingDate: '2026-01-09' }), now)).toBe(true);
      expect(isSchemeClosed(scheme({ closingDate: '2026-01-10' }), now)).toBe(false);
    });

    it('returns false for empty or unparseable dates', () => {
      expect(isSchemeClosed(scheme({ closingDate: '' }), now)).toBe(false);
      expect(isSchemeClosed(scheme({ closingDate: 'soon' }), now)).toBe(false);
    });
  });

  describe('isEditDisabled', () => {
    it('allows edits when createdAt is missing', () => {
      expect(isEditDisabled(scheme(), now)).toBe(false);
    });

    it('allows edits within 24 hours and blocks them afterwards', () => {
      const day = 24 * 60 * 60 * 1000;
      expect(isEditDisabled(scheme({ createdAt: now - day }), now)).toBe(false);
      expect(isEditDisabled(scheme({ createdAt: now - day - 1 }), now)).toBe(true);
    });
  });

  describe('filterActiveSchemes', () => {
    const list = [
      scheme({ sNo: 7, refNo: 'A-1', schemeName: 'Alpha', eoiDescription: 'first' }),
      scheme({ sNo: 8, refNo: 'B-2', schemeName: 'Beta', eoiDescription: 'second', closingDate: '01/01/2000' }),
      scheme({ sNo: 9, refNo: 'C-3', schemeName: 'Gamma', eoiDescription: 'third', schemeTitle: 'Gamma Title' })
    ];

    it('drops closed schemes and renumbers from 1', () => {
      const result = filterActiveSchemes(list, '', now);
      expect(result.map(s => s.refNo)).toEqual(['A-1', 'C-3']);
      expect(result.map(s => s.sNo)).toEqual([1, 2]);
    });

    it('matches name, ref no, description and title case-insensitively', () => {
      expect(filterActiveSchemes(list, '  ALPHA ', now).map(s => s.refNo)).toEqual(['A-1']);
      expect(filterActiveSchemes(list, 'c-3', now).map(s => s.refNo)).toEqual(['C-3']);
      expect(filterActiveSchemes(list, 'THIRD', now).map(s => s.refNo)).toEqual(['C-3']);
      expect(filterActiveSchemes(list, 'gamma title', now).map(s => s.refNo)).toEqual(['C-3']);
    });

    it('does not match closed schemes even when the query fits', () => {
      expect(filterActiveSchemes(list, 'beta', now)).toEqual([]);
    });

    it('does not mutate the input', () => {
      filterActiveSchemes(list, '', now);
      expect(list.map(s => s.sNo)).toEqual([7, 8, 9]);
    });
  });

  describe('filterAdmins', () => {
    const admins = [
      { id: '1', name: 'Ramesh Suresh', ssoId: 'SSO_SUPER_01', role: 'Super Admin' },
      { id: '2', name: 'Priya Singh', ssoId: 'SSO_ADM_04', role: 'GM' }
    ];

    it('returns all admins for a blank query', () => {
      expect(filterAdmins(admins, '   ')).toBe(admins);
    });

    it('matches name, role and sso id', () => {
      expect(filterAdmins(admins, 'priya').map(a => a.id)).toEqual(['2']);
      expect(filterAdmins(admins, 'super admin').map(a => a.id)).toEqual(['1']);
      expect(filterAdmins(admins, 'sso_adm').map(a => a.id)).toEqual(['2']);
    });
  });

  describe('normalizeSchemeCategory', () => {
    it('maps known variants onto dropdown options', () => {
      expect(normalizeSchemeCategory('Rajkvik Yojana')).toBe('RAJVIK');
      expect(normalizeSchemeCategory('rajvik')).toBe('RAJVIK');
      expect(normalizeSchemeCategory('Saksham')).toBe('SAKSHAM');
      expect(normalizeSchemeCategory('samarth')).toBe('SAMARTH');
      expect(normalizeSchemeCategory('na')).toBe('NA');
      expect(normalizeSchemeCategory('')).toBe('NA');
      expect(normalizeSchemeCategory(undefined)).toBe('NA');
      expect(normalizeSchemeCategory('something else')).toBe('ALL');
    });
  });

  describe('date helpers', () => {
    it('toInputDate converts dd/mm/yyyy and dd-mm-yyyy to yyyy-mm-dd', () => {
      expect(toInputDate('5/3/2026')).toBe('2026-03-05');
      expect(toInputDate('15-09-2026')).toBe('2026-09-15');
      expect(toInputDate(undefined)).toBe('');
      expect(toInputDate('abc')).toBe('abc');
    });

    it('toDisplayDate converts yyyy-mm-dd to dd/mm/yyyy', () => {
      expect(toDisplayDate('2026-03-05')).toBe('05/03/2026');
      expect(toDisplayDate('')).toBe('');
    });
  });

  describe('formatBytes', () => {
    it('formats byte counts', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(500)).toBe('500 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(25 * 1024 * 1024)).toBe('25 MB');
    });
  });

  describe('validateUploadFile', () => {
    it('accepts supported extensions regardless of case', () => {
      expect(validateUploadFile({ name: 'report.PDF', size: 10 })).toBe('');
      expect(validateUploadFile({ name: 'sheet.xlsx', size: 10 })).toBe('');
    });

    it('rejects unsupported extensions', () => {
      expect(validateUploadFile({ name: 'run.exe', size: 10 })).toBe(
        'Invalid file type. Supported: PDF, TXT, JPEG, PNG, WORD, EXCEL.'
      );
      expect(validateUploadFile({ name: 'noextension', size: 10 })).toContain('Invalid file type');
    });

    it('rejects files larger than 25 MB', () => {
      expect(validateUploadFile({ name: 'big.pdf', size: 25 * 1024 * 1024 })).toBe('');
      expect(validateUploadFile({ name: 'big.pdf', size: 25 * 1024 * 1024 + 1 })).toBe(
        'File size exceeds the 25MB limit.'
      );
    });
  });

  describe('isEoiFormValid', () => {
    const validForm = (): EoiFormData => ({
      ...createEmptyEoiForm(),
      refNo: 'REF-1',
      publishedDate: '2026-01-01',
      submissionDate: '2026-02-01',
      emdFee: '50000',
      processFee: '2000',
      attachments: [{ id: '1', title: 'RFP', fileName: 'rfp.pdf', size: '1 KB', file: {} as File }]
    });

    it('rejects the empty form', () => {
      expect(isEoiFormValid(createEmptyEoiForm())).toBe(false);
    });

    it('accepts a fully populated form', () => {
      expect(isEoiFormValid(validForm())).toBe(true);
    });

    it('requires at least one attachment', () => {
      expect(isEoiFormValid({ ...validForm(), attachments: [] })).toBe(false);
    });

    it('requires every added document row to have a selection', () => {
      expect(isEoiFormValid({ ...validForm(), documents: ['Company PAN Card', ''] })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), documents: ['Company PAN Card'] })).toBe(true);
    });

    it('requires each mandatory field', () => {
      expect(isEoiFormValid({ ...validForm(), refNo: '' })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), publishedDate: '' })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), submissionDate: '' })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), emdFee: '' })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), processFee: '' })).toBe(false);
    });
  });

  describe('createAttachment', () => {
    it('builds an attachment from the title and file', () => {
      const file = { name: 'rfp.pdf', size: 1024 } as File;
      const att = createAttachment('RFP', file);
      expect(att.title).toBe('RFP');
      expect(att.fileName).toBe('rfp.pdf');
      expect(att.size).toBe('1 KB');
      expect(att.file).toBe(file);
      expect(att.id.length).toBeGreaterThan(0);
    });
  });

  describe('buildSchemeFromForm', () => {
    const form: EoiFormData = {
      ...createEmptyEoiForm(),
      refNo: 'REF-1',
      scheme: 'SAMARTH',
      schemeCategory: 'SAMARTH',
      publishedDate: '2026-03-05',
      submissionDate: '2026-04-15',
      description: 'Desc',
      emdFee: '50000',
      processFee: '2000',
      attachments: [{ id: '1', title: 'RFP', fileName: 'rfp.pdf', size: '1 KB', file: {} as File }]
    };

    it('creates a new open, active, unfrozen scheme', () => {
      const result = buildSchemeFromForm(form, null, 123);
      expect(result.sNo).toBe(1);
      expect(result.refNo).toBe('REF-1');
      expect(result.schemeName).toBe('SAMARTH');
      expect(result.schemeTitle).toBe('SAMARTH');
      expect(result.datePublished).toBe('05/03/2026');
      expect(result.closingDate).toBe('15/04/2026');
      expect(result.status).toBe('Open');
      expect(result.createdAt).toBe(123);
      expect(result.isActive).toBe(true);
      expect(result.isFrozen).toBe(false);
      expect(result.attachedDocs).toEqual([{ sNo: 1, name: 'RFP', size: '1 KB' }]);
    });

    it('preserves identity fields of an existing scheme', () => {
      const existing = scheme({ sNo: 4, createdAt: 99, isActive: false, isFrozen: true, committeeMembers: ['A'] });
      const result = buildSchemeFromForm(form, existing, 123);
      expect(result.sNo).toBe(4);
      expect(result.createdAt).toBe(99);
      expect(result.isActive).toBe(false);
      expect(result.isFrozen).toBe(true);
      expect(result.committeeMembers).toEqual(['A']);
    });
  });

  describe('buildCorrigendumDoc', () => {
    it('prefixes titles that do not start with "corrigendum"', () => {
      expect(buildCorrigendumDoc('Extension of date', 2048, 2)).toEqual({
        sNo: 3,
        name: 'Corrigendum: Extension of date',
        size: '2 KB'
      });
    });

    it('keeps titles that already start with "corrigendum" and defaults blank titles', () => {
      expect(buildCorrigendumDoc('  Corrigendum-1: Dates ', 0, 0).name).toBe('Corrigendum-1: Dates');
      expect(buildCorrigendumDoc('   ', 0, 0).name).toBe('Corrigendum Document');
    });
  });
});
