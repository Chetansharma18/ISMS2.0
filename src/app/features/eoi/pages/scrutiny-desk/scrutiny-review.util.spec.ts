import { describe, it, expect } from 'vitest';
import {
  ReviewActivityDto,
  activityEntries,
  actorLabels,
  answerRows,
  documentsZipName,
  feeSummary,
  pastApplicationRows,
  remarkPresets,
  reviewStatus,
  reviewTime,
  toGradeOptions
} from './scrutiny-desk.util';

const act = (id: number, action: string, actorRole: string, actorName: string, extra: Partial<ReviewActivityDto> = {}): ReviewActivityDto => ({
  id,
  action,
  actorName,
  actorRole,
  remark: null,
  grade: null,
  details: null,
  createdAt: '2026-11-21T05:00:00',
  ...extra
});

describe('Scrutiny Desk (backend) helpers', () => {
  it('maps the backend status to the label and badge', () => {
    expect(reviewStatus('UnderReview')).toEqual({ label: 'Under Review', variant: 'submitted' });
    expect(reviewStatus('Approved').label).toBe('Approved');
    expect(reviewStatus('Reverted').label).toBe('Clarification Requested');
    expect(reviewStatus('Something')).toEqual({ label: 'Something', variant: 'neutral' });
  });

  it('reads backend times as UTC', () => {
    expect(reviewTime(null)).toBe('-');
    expect(reviewTime('2026-11-21T05:00:00')).toBe(reviewTime('2026-11-21T05:00:00Z'));
  });

  it('shows the actor by name with their role', () => {
    const labels = actorLabels([
      act(1, 'Submitted', 'Applicant', 'Company 1'),
      act(2, 'RemarkAdded', 'Member', 'Committee Member 1'),
      act(3, 'Approved', 'Approver', ' Committee Member 2 '),
      act(4, 'RemarkAdded', 'Member', '')
    ]);
    expect([...labels.values()]).toEqual([
      'Company 1 (Applicant)',
      'Committee Member 1 (Committee Member)',
      'Committee Member 2 (Committee Approver)',
      'Committee Member'
    ]);
  });

  it('builds the activity entries with titles, grade and requested documents', () => {
    const [submitted, revert, approved] = activityEntries([
      act(1, 'Submitted', 'Applicant', 'Company 1'),
      act(2, 'ClarificationRequested', 'Approver', 'X', { remark: 'Upload PAN', details: { documents: ['PAN Card', 3], dueDays: 5 } }),
      act(3, 'Approved', 'Approver', 'X', { grade: 'A' })
    ]);
    expect(submitted.title).toBe('Application submitted');
    expect(revert).toMatchObject({ title: 'Clarification requested', remark: 'Upload PAN', documents: ['PAN Card'], dueDays: 5 });
    expect(approved).toMatchObject({ title: 'Approved', grade: 'A', actor: 'X (Committee Approver)', documents: [], dueDays: null });
  });

  it('orders grades highest first with their range', () => {
    const grades = toGradeOptions([
      { id: 1, grade: 'B', minScore: 50, maxScore: 74, description: null },
      { id: 2, grade: 'A', minScore: 75, maxScore: 100, description: null },
      { id: 3, grade: 'C', minScore: null, maxScore: null, description: null }
    ]);
    expect(grades.map(g => g.grade)).toEqual(['A', 'B', 'C']);
    expect(grades[0]).toMatchObject({ minimum: 75, maximum: 100, range: '75 - 100' });
    expect(grades[2].range).toBe('');
  });

  it('offers Remark Master entries once each, description first', () => {
    expect(
      remarkPresets([
        { id: 1, title: 'Docs ok', category: null, description: 'All documents verified.' },
        { id: 2, title: 'Short', category: null, description: null },
        { id: 3, title: 'Dup', category: null, description: 'all documents verified.' },
        { id: 4, title: ' ', category: null, description: ' ' }
      ])
    ).toEqual(['All documents verified.', 'Short']);
  });

  it('lists the answers in the configured order', () => {
    const rows = answerRows(
      [
        { key: 'centres', label: 'Centres', type: 'number', mandatory: true, placeholder: null, helpText: null, options: [], section: 'Publish Details' },
        { key: 'sectors', label: 'Sectors', type: 'multiselect', mandatory: false, placeholder: null, helpText: null, options: [], section: 'Publish Details' },
        { key: 'note', label: 'Note', type: 'text', mandatory: false, placeholder: null, helpText: null, options: [], section: 'Uploading Details' }
      ],
      { centres: 4, sectors: ['IT', 'Retail'] }
    );
    expect(rows.map(r => r.value)).toEqual(['4', 'IT, Retail', '-']);
    expect(answerRows(null, null)).toEqual([]);
  });

  it('lists the earlier applications for Past Performance', () => {
    expect(pastApplicationRows(null)).toEqual([]);
    const [row] = pastApplicationRows([
      { id: 9, applicationNo: 'APP-2025-000009', eoiRefNo: 'EOI/1', schemeName: 'Scheme 1', status: 'Approved', grade: 'A', submittedAt: '2025-05-01T04:00:00', decidedAt: null }
    ]);
    expect(row).toMatchObject({ applicationNo: 'APP-2025-000009', statusLabel: 'Approved', statusVariant: 'success', grade: 'A', decidedOn: '-' });
  });

  it('names the documents ZIP after the application', () => {
    expect(documentsZipName('APP-2026-000002')).toBe('APP-2026-000002-Documents.zip');
    expect(documentsZipName('')).toBe('Application-Documents.zip');
  });

  it('summarises the fees', () => {
    const base = { amount: 2000, required: true, done: true, prn: 'P1', paidAt: null, rppTxnId: 'T9' };
    expect(feeSummary(null).status).toBe('Not Payable');
    expect(feeSummary({ ...base, required: false }).status).toBe('Not Payable');
    expect(feeSummary({ ...base, done: false })).toMatchObject({ status: 'Not Paid', variant: 'warning', reference: '' });
    expect(feeSummary(base)).toMatchObject({ status: 'Paid', variant: 'success', reference: 'PRN P1 · Txn T9', detail: '' });
    expect(feeSummary({ ...base, paidAt: '2026-11-21T08:35:00' }).detail).toContain('Paid on');
    expect(feeSummary({ ...base, mode: 'Exempted', udyamNumber: 'UDYAM-1' })).toMatchObject({ status: 'Exempted', detail: 'Udyam UDYAM-1' });
  });
});
