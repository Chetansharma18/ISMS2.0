import { describe, expect, it } from 'vitest';
import type { EoiStatusApplication } from './eoi-status.model';
import {
  appealStatusLabel,
  applicationStatus,
  feeLine,
  pendingClarificationDocs,
  resultOrderFileName,
  statusTimeline,
  toStatusRow
} from './eoi-status.util';

const fee = { amount: 25000, required: true, done: true, prn: 'P1', paidAt: '2026-11-21T08:35:00' };

const app = (extra: Partial<EoiStatusApplication> = {}): EoiStatusApplication =>
  ({
    id: 2,
    applicationNo: 'APP-2026-000002',
    status: 'UnderReview',
    isEditable: false,
    notice: { id: 1, refNo: 'RSLDC/EOI/2026-27/01', schemeName: 'Scheme 1', schemeCategory: 'Category 1', closingDate: '2026-11-22' },
    otrReferenceNo: 'OTR-1',
    profile: {},
    steps: [],
    processFee: fee,
    emd: { ...fee, amount: 100000, mode: 'Paid', exemptionEligible: false, udyamNumber: null },
    documents: [],
    missingForSubmit: [],
    declarationAccepted: true,
    createdAt: '2026-11-20T05:00:00',
    updatedAt: null,
    submittedAt: '2026-11-21T09:15:00',
    clarification: null,
    decision: null,
    resultOrder: null,
    appeal: null,
    ...extra
  }) as unknown as EoiStatusApplication;

const approved = {
  decision: { status: 'Approved', grade: 'A', remarks: null, decidedAt: '2026-11-25T05:00:00' },
  resultOrder: { id: 9, orderNo: 'EMP/RSLDC/EOI/2026-27/01/R1/V1', publishedAt: '2026-11-26T05:00:00', url: '/x' }
};

describe('EOI Status helpers', () => {
  it('shows the decision only once the result is released', () => {
    expect(applicationStatus(app())).toEqual({ label: 'Under Review', variant: 'submitted' });
    expect(applicationStatus(app({ status: 'Reverted' })).label).toBe('Clarification Requested');
    expect(applicationStatus(app({ status: 'Draft' })).label).toBe('Draft (not submitted)');
    expect(applicationStatus(app(approved))).toEqual({ label: 'Approved', variant: 'success' });
  });

  it('builds the list row with the grade or what needs doing', () => {
    expect(toStatusRow(app(approved))).toMatchObject({ applicationNo: 'APP-2026-000002', schemeName: 'Scheme 1', note: 'Grade A', isDraft: false, eoiId: 1 });
    const reverted = toStatusRow(app({ status: 'Reverted', clarification: { documents: ['PAN'], comment: null, requestedAt: null, dueAt: '2026-11-28T18:29:59', respondedAt: null, isOpen: true, uploads: [] } }));
    expect(reverted.note).toContain('Reply by');
    expect(toStatusRow(app({ status: 'Draft', submittedAt: null })).submittedOn).toBe('-');
  });

  it('tracks the progress of an application in review', () => {
    const steps = statusTimeline(app());
    expect(steps.map(s => [s.key, s.state])).toEqual([
      ['submitted', 'done'],
      ['review', 'current'],
      ['result', 'todo']
    ]);
  });

  it('shows the released result and the appeal window', () => {
    const steps = statusTimeline(app({ ...approved, appeal: { canAppeal: true, appealDeadline: '2026-12-03T18:29:59', cannotAppealReason: null, appeal: null } }));
    const result = steps.find(s => s.key === 'result')!;
    expect(result.title).toBe('Result released: Approved');
    expect(result.detail).toContain('grade A');
    expect(result.state).toBe('done');
    expect(steps.find(s => s.key === 'appeal')!.title).toBe('Appeal (optional)');
  });

  it('flags an open clarification and lists what is still to upload', () => {
    const clarification = {
      documents: ['PAN Card', 'GST Certificate'],
      comment: 'Upload clear copies',
      requestedAt: '2026-11-22T05:00:00',
      dueAt: '2026-11-28T18:29:59',
      respondedAt: null,
      isOpen: true,
      uploads: [{ name: 'pan card', file: { fileName: 'pan.pdf' } }]
    } as unknown as EoiStatusApplication['clarification'];
    const a = app({ status: 'Reverted', clarification });
    expect(statusTimeline(a).find(s => s.key === 'clarification')!.state).toBe('alert');
    expect(pendingClarificationDocs(a)).toEqual(['GST Certificate']);
    expect(pendingClarificationDocs(app())).toEqual([]);
  });

  it('labels appeals, fees and the order file', () => {
    expect(appealStatusLabel({ status: 'Closed', outcome: 'Changed' })).toBe('Appeal closed: result revised');
    expect(appealStatusLabel({ status: 'AwaitingResponse', outcome: null })).toBe('Appeal: response requested');
    expect(feeLine(null)).toBe('-');
    expect(feeLine({ ...fee, mode: 'Exempted' })).toBe('Exempted (MSME / Udyam)');
    expect(feeLine({ ...fee, done: false })).toContain('(not paid)');
    expect(feeLine({ ...fee, required: false })).toBe('Not payable');
    expect(resultOrderFileName('EMP/RSLDC/EOI/2026-27/01/R1/V1')).toBe('EMP-RSLDC-EOI-2026-27-01-R1-V1.pdf');
  });
});
