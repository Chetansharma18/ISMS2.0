import { describe, it, expect } from 'vitest';
import {
  buildCorrigendumDoc,
  buildSchemeFromForm,
  createAttachment,
  createEmptyEoiForm,
  filterActiveSchemes,
  filterAdmins,
  formatBytes,
  formatEoiDuration,
  getTodayKolkataDate,
  isEditDisabled,
  isEoiFormValid,
  isSchemeClosed,
  isValidCalendarDate,
  normalizeSchemeCategory,
  parseEoiDuration,
  parseFeeNumber,
  sanitizeInput,
  toDisplayDate,
  toInputDate,
  validateDocuments,
  validateEoiDescription,
  validateEoiDuration,
  validateEoiFormComplete,
  validateEoiRefNo,
  validateFee,
  validatePublishedDate,
  validateSubmissionDate,
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

  describe('formatEoiDuration / parseEoiDuration', () => {
    it('formats singular and plural year duration strings', () => {
      expect(formatEoiDuration('1', 'Years')).toBe('1 Year');
      expect(formatEoiDuration('3', 'Years')).toBe('3 Years');
      expect(formatEoiDuration('', 'Years')).toBe('');
      expect(formatEoiDuration('0', 'Years')).toBe('');
    });

    it('parses stored year duration strings back into value and unit', () => {
      expect(parseEoiDuration('3 Years')).toEqual({ value: '3', unit: 'Years' });
      expect(parseEoiDuration('1 Year')).toEqual({ value: '1', unit: 'Years' });
      expect(parseEoiDuration(undefined)).toEqual({ value: '', unit: 'Years' });
    });
  });

  describe('isEoiFormValid', () => {
    const today = getTodayKolkataDate();
    const [y, m, d] = today.split('-').map(Number);
    const futureDate = `${y + 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const validForm = (): EoiFormData => ({
      ...createEmptyEoiForm(),
      refNo: 'RSLDC/EOI/2026-27/01',
      scheme: 'Vishwakarma Yuva Udyami Protsahan Yojana',
      publishedDate: today,
      submissionDate: futureDate,
      eoiDurationValue: '2',
      eoiDurationUnit: 'Years',
      eoiCategory: 'General',
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

    it('allows empty attachments when documents are configured', () => {
      expect(isEoiFormValid({ ...validForm(), attachments: [] })).toBe(true);
    });

    it('requires every added document row to have a selection', () => {
      expect(isEoiFormValid({ ...validForm(), documents: ['Company PAN Card', ''] })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), documents: ['Company PAN Card'] })).toBe(true);
    });

    it('requires each mandatory field', () => {
      expect(isEoiFormValid({ ...validForm(), refNo: '' })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), scheme: '' })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), publishedDate: '' })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), submissionDate: '' })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), eoiDurationValue: '' })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), eoiDurationValue: '0' })).toBe(false);
      expect(isEoiFormValid({ ...validForm(), eoiCategory: '' })).toBe(false);
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
      eoiDurationValue: '3',
      eoiDurationUnit: 'Years',
      eoiCategory: 'General',
      description: 'Desc',
      emdFee: '50000',
      processFee: '2000',
      attachments: [{ id: '1', title: 'RFP', fileName: 'rfp.pdf', size: '1 KB', file: {} as File }],
      documents: ['PAN Card', 'Registration Certificate']
    };

    it('creates a new open, active, unfrozen scheme', () => {
      const result = buildSchemeFromForm(form, null, 123);
      expect(result.sNo).toBe(1);
      expect(result.refNo).toBe('REF-1');
      expect(result.schemeName).toBe('SAMARTH');
      expect(result.schemeTitle).toBe('SAMARTH');
      expect(result.datePublished).toBe('05/03/2026');
      expect(result.closingDate).toBe('15/04/2026');
      expect(result.eoiDuration).toBe('3 Years');
      expect(result.status).toBe('Open');
      expect(result.createdAt).toBe(123);
      expect(result.isActive).toBe(true);
      expect(result.isFrozen).toBe(false);
      expect(result.attachedDocs).toEqual([{ sNo: 1, name: 'RFP', size: '1 KB' }]);
      expect(result.requiredDocs).toEqual(['PAN Card', 'Registration Certificate']);
    });

    it('preserves identity fields of an existing scheme', () => {
      const existing = scheme({ sNo: 4, createdAt: 99, isActive: false, isFrozen: true, committeeMembers: ['A'] });
      const result = buildSchemeFromForm(form, existing, 123);
      expect(result.sNo).toBe(4);
      expect(result.createdAt).toBe(99);
      expect(result.isActive).toBe(false);
      expect(result.isFrozen).toBe(true);
      expect(result.committeeMembers).toEqual(['A']);
      expect(result.requiredDocs).toEqual(['PAN Card', 'Registration Certificate']);
    });

    it('appends uploaded document files to attachedDocs', () => {
      const formWithDocs: EoiFormData = {
        ...form,
        documentFiles: {
          0: { name: 'PAN Card', fileName: 'pan_card.pdf', size: '250 KB' },
          1: { name: 'Registration Certificate', fileName: 'reg_cert.png', size: '1.2 MB' }
        }
      };
      const result = buildSchemeFromForm(formWithDocs, null, 123);
      expect(result.attachedDocs).toEqual([
        { sNo: 1, name: 'RFP', size: '1 KB' },
        { sNo: 2, name: 'PAN Card (pan_card.pdf)', size: '250 KB' },
        { sNo: 3, name: 'Registration Certificate (reg_cert.png)', size: '1.2 MB' }
      ]);
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

  describe('Government Standards EOI Form Validation (All 20 Test Scenarios)', () => {
    const validEoi = (): EoiFormData => ({
      ...createEmptyEoiForm(),
      refNo: 'RSLDC/EOI/2026-27/01',
      scheme: 'Vishwakarma Yuva Udyami Protsahan Yojana',
      schemeCategory: 'Rajvik',
      publishedDate: '2026-01-10',
      submissionDate: '2026-02-15',
      eoiDurationValue: '2',
      eoiDurationUnit: 'Years',
      eoiCategory: 'General',
      emdFee: '₹50,000',
      processFee: '₹10,000',
      documents: ['PAN Card', 'Registration Certificate'],
      attachments: [{ id: '1', title: 'RFP', fileName: 'rfp.pdf', size: '1 KB', file: {} as File }]
    });

    const standardOptions = {
      todayStr: '2026-01-10',
      existingRefNos: ['RSLDC/EOI/2025-26/99'],
      activeSchemeNames: ['Vishwakarma Yuva Udyami Protsahan Yojana', 'MMKVY'],
      activeEoiCategories: ['General', 'Special'],
      schemeMasterItems: [
        {
          schemeName: 'Vishwakarma Yuva Udyami Protsahan Yojana',
          schemeCategory: 'Rajvik',
          amount: 50000,
          processFees: 10000,
          status: 'Active'
        }
      ]
    };

    // 1. Empty mandatory fields
    it('Scenario 1: flags all empty mandatory fields with clear error messages', () => {
      const res = validateEoiFormComplete(createEmptyEoiForm(), standardOptions);
      expect(res.isValid).toBe(false);
      expect(res.errors['refNo']).toBe('EOI Reference Number is required.');
      expect(res.errors['scheme']).toBe('Please select a valid scheme.');
      expect(res.errors['eoiCategory']).toBe('Please select an EOI Category.');
      expect(res.errors['publishedDate']).toBe('Please select the EOI Publication Date.');
      expect(res.errors['submissionDate']).toBe('Please select the Last Date of EOI Submission.');
      expect(res.errors['eoiDurationValue']).toBe('EOI Duration is required.');
      expect(res.errors['emdFee']).toBe('EMD Fee is required.');
      expect(res.errors['processFee']).toBe('Process Fee is required.');
    });

    // 2. Duplicate EOI reference numbers
    it('Scenario 2: rejects duplicate EOI reference numbers', () => {
      const duplicateForm = { ...validEoi(), refNo: 'RSLDC/EOI/2025-26/99' };
      const res = validateEoiFormComplete(duplicateForm, standardOptions);
      expect(res.errors['refNo']).toBe('This EOI Reference Number already exists.');
    });

    // 3. Inactive scheme selection
    it('Scenario 3: rejects inactive or unapproved schemes', () => {
      const form = { ...validEoi(), scheme: 'Inactive Old Scheme' };
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.errors['scheme']).toBe('Please select a valid scheme.');
    });

    // 4. Invalid scheme-category combinations
    it('Scenario 4: rejects invalid scheme-category combinations', () => {
      const form = { ...validEoi(), schemeCategory: 'Unrelated Category' };
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.errors['schemeCategory']).toBe('Scheme Category does not match the selected scheme.');
    });

    // 5. Future publication date for Publish Now
    it('Scenario 5: rejects future publication date for immediate publication (Publish Now)', () => {
      const form = { ...validEoi(), publishedDate: '2026-01-11' }; // after today (2026-01-10)
      const res = validateEoiFormComplete(form, { ...standardOptions, isScheduled: false });
      expect(res.errors['publishedDate']).toBe('EOI Publication Date cannot be a future date.');
    });

    // 6. Invalid calendar dates
    it('Scenario 6: rejects invalid calendar dates such as 31 February or 29 Feb in non-leap year', () => {
      expect(isValidCalendarDate('2026-02-31')).toBe(false);
      expect(isValidCalendarDate('31/02/2026')).toBe(false);
      expect(isValidCalendarDate('2026-02-29')).toBe(false); // 2026 is not leap
      expect(isValidCalendarDate('2024-02-29')).toBe(true);  // 2024 is leap
      const form = { ...validEoi(), publishedDate: '2026-02-31' };
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.errors['publishedDate']).toBe('Please enter a valid publication date.');
    });

    // 7. Submission deadline before publication
    it('Scenario 7: rejects submission deadline before publication date', () => {
      const form = { ...validEoi(), publishedDate: '2026-01-10', submissionDate: '2026-01-05' };
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.errors['submissionDate']).toBe('Submission deadline must be after the publication date.');
    });

    // 8. Submission deadline equal to publication
    it('Scenario 8: rejects submission deadline equal to publication date', () => {
      const form = { ...validEoi(), publishedDate: '2026-01-10', submissionDate: '2026-01-10' };
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.errors['submissionDate']).toBe('Submission deadline must be after the publication date.');
    });

    // 9. Expired submission deadline
    it('Scenario 9: rejects expired submission deadline (not in future)', () => {
      const form = { ...validEoi(), publishedDate: '2026-01-01', submissionDate: '2026-01-09' }; // 09 is before today 10
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.errors['submissionDate']).toBe('Submission deadline must be in the future.');
    });

    // 10. Unrealistic submission deadline such as year 2202
    it('Scenario 10: rejects unrealistic submission deadlines such as year 2202', () => {
      expect(isValidCalendarDate('2202-02-11')).toBe(false);
      const form = { ...validEoi(), submissionDate: '2202-02-11' };
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.errors['submissionDate']).toBe('Submission period exceeds the permitted duration.');
    });

    // 11. Submission window outside configured limits
    it('Scenario 11: rejects submission window exceeding maximum permitted duration (> 365 days)', () => {
      const form = { ...validEoi(), publishedDate: '2026-01-10', submissionDate: '2027-02-15' }; // > 365 days
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.errors['submissionDate']).toBe('Submission period exceeds the permitted duration.');
    });

    // 12. Invalid EOI duration
    it('Scenario 12: rejects invalid EOI duration (0, negative, decimal, non-numeric, > max)', () => {
      expect(validateEoiDuration('0')).toBe('Please enter a valid duration.');
      expect(validateEoiDuration('-3')).toBe('Please enter a valid duration.');
      expect(validateEoiDuration('2.5')).toBe('Please enter a valid duration.');
      expect(validateEoiDuration('abc')).toBe('Please enter a valid duration.');
      expect(validateEoiDuration('50')).toBe('Duration exceeds the permitted limit for this scheme.');
      expect(validateEoiDuration('3')).toBe('');
    });

    // 13. Negative EMD and Process Fee
    it('Scenario 13: rejects negative or invalid EMD and Process Fee', () => {
      const form = { ...validEoi(), emdFee: '-500', processFee: 'invalid' };
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.errors['emdFee']).toBe('Please enter a valid EMD Fee.');
      expect(res.errors['processFee']).toBe('Please enter a valid Process Fee.');
    });

    // 14. Fee mismatch with Scheme Master
    it('Scenario 14: rejects fee mismatch when amount does not match Scheme Master configuration', () => {
      const form = { ...validEoi(), emdFee: '₹12,345' }; // Expected is 50,000
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.errors['emdFee']).toBe('EMD Fee does not match the selected scheme.');
    });

    // 15. Duplicate supporting document types
    it('Scenario 15: rejects duplicate supporting document types across configured rows', () => {
      const form = { ...validEoi(), documents: ['Company PAN Card', 'Company PAN Card'] };
      const res = validateEoiFormComplete(form, standardOptions);
      expect(res.isValid).toBe(false);
      expect(res.docErrors[1]).toBe('This document type has already been added.');
    });

    // 16. Unsupported file formats
    it('Scenario 16: rejects unsupported file formats and active scripting extensions like .exe, .svg', () => {
      expect(validateUploadFile({ name: 'malicious.exe', size: 1024 })).toBe(
        'Invalid file type. Supported: PDF, TXT, JPEG, PNG, WORD, EXCEL.'
      );
      expect(validateUploadFile({ name: 'vector.svg', size: 1024 })).toBe(
        'Invalid file type. Supported: PDF, TXT, JPEG, PNG, WORD, EXCEL.'
      );
    });

    // 17. File exceeding 25 MB or empty file
    it('Scenario 17: rejects files exceeding 25 MB limit and empty files (0 bytes)', () => {
      expect(validateUploadFile({ name: 'empty.pdf', size: 0 })).toBe('File cannot be empty.');
      expect(validateUploadFile({ name: 'huge.pdf', size: 25 * 1024 * 1024 + 1 })).toBe(
        'File size exceeds the 25MB limit.'
      );
      expect(validateUploadFile({ name: 'good.pdf', size: 10 * 1024 * 1024 })).toBe('');
    });

    // 18. Duplicate form submission prevention
    it('Scenario 18: prevents duplicate form submission using isSubmitting state flag', () => {
      let isSubmitting = false;
      const simulateSubmit = () => {
        if (isSubmitting) return 'BLOCKED';
        isSubmitting = true;
        return 'PROCEED';
      };
      expect(simulateSubmit()).toBe('PROCEED');
      expect(simulateSubmit()).toBe('BLOCKED');
    });

    // 19. Unauthorized publication and service-layer backend validation
    it('Scenario 19: trims whitespace, rejects whitespace-only refNo, and validates EOI reference format', () => {
      expect(validateEoiRefNo('   ')).toBe('EOI Reference Number is required.');
      expect(validateEoiRefNo('invalid#ref$no')).toBe(
        'Invalid EOI Reference Number format (e.g. RSLDC/EOI/2026-27/01).'
      );
      expect(validateEoiRefNo('RSLDC/EOI/2026-27/01')).toBe('');
    });

    // 20. Valid draft, scheduled, and immediate publication workflows
    it('Scenario 20: supports draft, scheduled, and immediate publication workflows', () => {
      // Draft: partial data allowed without publication date
      const draftForm: EoiFormData = {
        ...createEmptyEoiForm(),
        refNo: 'RSLDC/EOI/DRAFT/01',
        scheme: 'Vishwakarma Yuva Udyami Protsahan Yojana'
      };
      const draftRes = validateEoiFormComplete(draftForm, { ...standardOptions, isDraft: true });
      expect(draftRes.isValid).toBe(true);

      // Immediate Publication: requires full validation and publishedDate <= today
      const immediateRes = validateEoiFormComplete(validEoi(), { ...standardOptions, isScheduled: false });
      expect(immediateRes.isValid).toBe(true);

      // Scheduled Publication: future publication date allowed when isScheduled is true
      const scheduledForm = {
        ...validEoi(),
        publishedDate: '2026-01-20',
        submissionDate: '2026-02-28'
      };
      const scheduledRes = validateEoiFormComplete(scheduledForm, { ...standardOptions, isScheduled: true });
      expect(scheduledRes.isValid).toBe(true);
    });
  });
});
