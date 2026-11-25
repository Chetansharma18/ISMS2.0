import { describe, expect, it } from 'vitest';
import { ApiError } from '../../../core/http/api-error';
import { EoiDetail, EoiFormOptions, EoiListItem } from './eoi-config.model';
import {
  attachmentChanges,
  committeeErrorText,
  mergeCommitteePeople,
  noticeDetailToScheme,
  toCommitteeAdmin,
  detailToForm,
  detailToScheme,
  docItemsFrom,
  formToRequest,
  listItemToScheme,
  mapSaveErrors,
  toDisplayDay,
  toIsoDay
} from './eoi-config.util';

const OPTIONS: EoiFormOptions = {
  schemes: [{ id: 4, schemeName: 'Scheme 1', schemeCategory: 'Rajvik', eoiCategoryId: 2, eoiCategory: 'General', emdFee: 50000, processFee: 10000 }],
  eoiCategories: [{ id: 2, name: 'General' }],
  documents: [
    { id: 11, name: 'PAN Card', category: 'Statutory', isMandatory: true, schemeIds: [4], allowedExtensions: ['.pdf'], maxFileSizeMb: 5 },
    { id: 12, name: 'Audited Balance Sheet', category: null, isMandatory: false, schemeIds: [], allowedExtensions: ['.pdf'], maxFileSizeMb: 5 }
  ],
  annexures: [{ id: 21, name: 'Annexure A', category: 'Annexure', isMandatory: true, schemeIds: [4], allowedExtensions: ['.pdf'], maxFileSizeMb: 5 }],
  limits: { refNoMaxLength: 100, refNoPattern: '', descriptionMaxLength: 250, maxDurationYears: 15, maxSubmissionWindowDays: 365, maxFileBytes: 1, attachmentExtensions: [] }
};

const DETAIL: EoiDetail = {
  id: 9, refNo: 'RSLDC/EOI/S1/01', schemeId: 4, schemeName: 'Scheme 1', schemeCategory: 'Rajvik', eoiCategoryId: 2, eoiCategory: 'General',
  description: 'Proposal', publishedDate: '2026-12-01', closingDate: '2026-12-31', durationYears: 3, emdFee: 50000, processFee: 10000,
  isFeeExempted: false, status: 'Scheduled', isActive: true, isFrozen: false, isEditable: true, editDisabledReason: null, responseCount: 0,
  requiredDocuments: [
    { id: 101, name: 'PAN Card', category: 'Statutory', isMandatory: true, docMasterId: 11, sortOrder: 1, allowedExtensions: [], maxFileSizeMb: 5 },
    { id: 102, name: 'Annexure A', category: 'Annexure', isMandatory: true, docMasterId: null, sortOrder: 2, allowedExtensions: [], maxFileSizeMb: 5, annexureMasterId: 21 }
  ],
  attachments: [
    { id: 301, kind: 'Document', title: 'RFP', fileName: 'rfp.pdf', contentType: 'application/pdf', sizeBytes: 2048, uploadedAt: '', url: '' },
    { id: 302, kind: 'Corrigendum', title: 'Corrigendum: Date', fileName: 'c.pdf', contentType: 'application/pdf', sizeBytes: 1024, uploadedAt: '', url: '' }
  ],
  approver: { ssoid: 'APPROVER.1', name: 'Committee Member 1', designation: null, roles: [] },
  members: [{ ssoid: 'MEMBER.2', name: 'Committee Member 2', designation: null, roles: [] }],
  createdBy: 'admin', createdAt: '2026-11-30T10:00:00Z', updatedAt: null, publishedAt: null, concurrencyStamp: 'abc',
  publishFields: [{ id: 'f1', label: 'Budget', type: 'number', mandatory: true }],
  uploadFields: []
};

describe('eoi-config.util', () => {
  it('converts dates between the backend and the screen', () => {
    expect(toDisplayDay('2026-12-01')).toBe('01/12/2026');
    expect(toIsoDay('2026-12-01')).toBe('2026-12-01');
    expect(toIsoDay('01/12/2026')).toBe('2026-12-01');
    expect(toIsoDay('')).toBeNull();
  });

  it('maps a list row with the backend edit and committee state', () => {
    const item: EoiListItem = {
      sNo: 1, id: 9, refNo: 'R/1', schemeName: 'Scheme 1', schemeCategory: 'Rajvik', eoiCategory: null, publishedDate: '2026-12-01',
      closingDate: '2026-12-31', status: 'Open', isActive: false, isFrozen: true, isEditable: false,
      editDisabledReason: 'Scheme is frozen', committeeCount: 3, hasApprover: true, responseCount: 2, createdAt: '2026-11-30T10:00:00Z'
    };
    const row = listItemToScheme(item);
    expect(row).toMatchObject({ id: '9', datePublished: '01/12/2026', isActive: false, isFrozen: true, isEditable: false, committeeCount: 3 });
  });

  it('splits documents and annexures and keeps the custom fields', () => {
    const scheme = detailToScheme(DETAIL);
    expect(scheme.requiredDocs).toEqual(['PAN Card']);
    expect(scheme.annexures).toEqual(['Annexure A']);
    expect(scheme.eoiDuration).toBe('3 Years');
    expect(scheme.committeeApprover).toBe('Committee Member 1');
    expect(scheme.publishFields?.[0].label).toBe('Budget');
  });

  it('opens the edit form with saved attachments (not corrigenda) marked as saved', () => {
    const form = detailToForm(DETAIL);
    expect(form.publishedDate).toBe('2026-12-01');
    expect(form.eoiDurationValue).toBe('3');
    expect(form.attachments.map(a => a.id)).toEqual(['srv-301']);
  });

  it('builds the save request: ids, ISO dates, numeric fees, master links, custom fields', () => {
    const form = detailToForm(DETAIL);
    form.documents = ['PAN Card', 'Audited Balance Sheet'];
    form.emdFee = '₹75,000';
    const body = formToRequest(form, OPTIONS, false, DETAIL);
    expect(body.schemeCategories).toEqual(['Rajvik']);
    expect(body).toMatchObject({
      refNo: 'RSLDC/EOI/S1/01', schemeId: 4, eoiCategoryId: 2, publishedDate: '2026-12-01', closingDate: '2026-12-31',
      durationYears: 3, emdFee: 75000, processFee: 10000, saveAsDraft: false
    });
    expect(body.requiredDocuments).toEqual([
      { id: 101, docMasterId: 11 },
      { id: null, docMasterId: 12 },
      { id: 102, annexureMasterId: 21 }
    ]);
    expect(body.publishFields).toEqual(DETAIL.publishFields);
  });

  it('sends zero fees when exempted and a free-text document when it is not in the master', () => {
    const form = detailToForm(DETAIL);
    form.isFeeExempted = true;
    form.documents = ['Custom Proof'];
    const body = formToRequest(form, OPTIONS, true);
    expect(body.emdFee).toBe(0);
    expect(body.processFee).toBe(0);
    expect(body.saveAsDraft).toBe(true);
    expect(body.requiredDocuments[0]).toEqual({ id: null, name: 'Custom Proof', category: null });
  });

  it('works out which attachments to delete and which files to upload', () => {
    const form = detailToForm(DETAIL);
    form.attachments = [{ id: 'att-new', title: 'SOP', fileName: 'sop.pdf', size: '1 KB', file: new File(['x'], 'sop.pdf') }];
    const { removed, added } = attachmentChanges(form, DETAIL);
    expect(removed).toEqual([301]);
    expect(added.map(a => a.title)).toEqual(['SOP']);
  });

  it('maps backend field names onto the form fields', () => {
    expect(mapSaveErrors([
      { field: 'refNo', message: 'This EOI Reference Number already exists.' },
      { field: 'requiredDocuments[1].docMasterId', message: 'Inactive.' },
      { field: 'closingDate', message: 'Too late.' }
    ])).toEqual({ refNo: 'This EOI Reference Number already exists.', documents: 'Inactive.', submissionDate: 'Too late.' });
  });

  it('lists Doc Master entries with their scheme names (no link = all schemes)', () => {
    const items = docItemsFrom(OPTIONS);
    expect(items.map(i => i.schemes)).toEqual([['Scheme 1'], ['All Schemes']]);
  });
});

describe('noticeDetailToScheme (applicant view)', () => {
  it('lists the open EOI with its documents, annexures and files in configured order', () => {
    const doc = (id: number, name: string, sortOrder: number, annexureMasterId: number | null = null) => ({
      id, name, category: annexureMasterId ? 'Annexure' : null, isMandatory: true, docMasterId: null, sortOrder,
      allowedExtensions: ['.pdf'], maxFileSizeMb: 5, annexureMasterId
    });
    const scheme = noticeDetailToScheme({
      notice: {
        id: 1, refNo: 'RSLDC/EOI/2026-27/01', schemeName: 'Scheme 1', schemeCategory: 'Rajvik, Samarth', eoiCategory: 'GENERAL',
        description: 'Proposal', publishedDate: '2026-11-24', closingDate: '2026-11-25', durationYears: 1,
        emdFee: 100000, processFee: 25000, isFeeExempted: false, myApplication: null
      },
      requiredDocuments: [doc(2, 'Income Proof', 2), doc(6, 'Annexure-1: Covering Letter', 6, 1), doc(1, 'Audited Balance Sheet', 1)],
      attachments: [{ id: 1, kind: 'Document', title: 'EOI Flow Chart', fileName: 'EOI Flow Chart.pdf', contentType: 'application/pdf', sizeBytes: 138849, uploadedAt: '', url: '' }],
      otrCompleted: true,
      acceptsApplications: true
    });
    expect(scheme).toMatchObject({ id: '1', refNo: 'RSLDC/EOI/2026-27/01', datePublished: '24/11/2026', eoiDuration: '1 Years' });
    expect(scheme.requiredDocs).toEqual(['Audited Balance Sheet', 'Income Proof']);
    expect(scheme.annexures).toEqual(['Annexure-1: Covering Letter']);
    expect(scheme.attachedDocs).toEqual([{ sNo: 1, name: 'EOI Flow Chart', size: '136 KB' }]);
  });
});

describe('committee helpers', () => {
  const member = (ssoId: string) => ({ id: ssoId, ssoId, name: ssoId, role: '' });

  it('lists a candidate by SSO ID with designation, or roles when there is none', () => {
    expect(toCommitteeAdmin({ ssoid: 'SSO.1', name: 'Committee Member 1', designation: null, roles: ['admin'] }))
      .toEqual({ id: 'SSO.1', ssoId: 'SSO.1', name: 'Committee Member 1', role: 'admin' });
  });

  it('adds current committee people missing from the candidates once', () => {
    const merged = mergeCommitteePeople([member('A'), member('B')], [member('b'), member('C')]);
    expect(merged.map(m => m.ssoId)).toEqual(['A', 'B', 'C']);
  });

  it('shows the backend field messages, then the general message', () => {
    const fields = new ApiError(400, 'Validation failed', undefined, [], undefined, undefined, [
      { field: 'approverSsoId', message: 'Please select the approver.' },
      { field: 'memberSsoIds', message: 'Please select at least one committee member.' }
    ]);
    expect(committeeErrorText(fields)).toBe('Please select the approver. Please select at least one committee member.');
    expect(committeeErrorText(new ApiError(409, 'Discard the signed order first.'))).toBe('Discard the signed order first.');
    expect(committeeErrorText(new Error('x'))).toContain('could not be saved');
  });
});
