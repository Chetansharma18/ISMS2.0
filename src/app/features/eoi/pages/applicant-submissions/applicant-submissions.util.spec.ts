import { describe, expect, it } from 'vitest';
import { evaluationFileName, statusTabs, toSubmissionRow } from './applicant-submissions.util';

const row = (status: string, submittedAt: string | null = '2026-11-21T03:45:00') => ({
  sNo: 1, id: 2, applicationNo: 'APP-2026-000002', anonymousLabel: 'Applicant 01', organisationName: null,
  status, submittedAt, grade: status === 'Approved' ? 'A' : null, reviewed: status !== 'UnderReview'
});

describe('applicant-submissions.util', () => {
  it('maps a backend row, treating the submission time as UTC', () => {
    expect(toSubmissionRow(row('UnderReview'))).toEqual({
      id: 2, applicationNo: 'APP-2026-000002', anonymousLabel: 'Applicant 01', applicantName: 'Applicant 01',
      submissionDate: '21 Nov 2026, 09:15 AM', status: 'UnderReview', statusLabel: 'Pending', statusTone: 'pending',
      grade: '', reviewed: false
    });
  });

  it('shows the organisation name when the backend has it', () => {
    expect(toSubmissionRow({ ...row('UnderReview'), organisationName: ' Company 1 ' }).applicantName).toBe('Company 1');
    expect(toSubmissionRow({ ...row('UnderReview'), organisationName: '  ' }).applicantName).toBe('Applicant 01');
  });

  it('labels every decision status', () => {
    expect(toSubmissionRow(row('Approved'))).toMatchObject({ statusLabel: 'Approved', statusTone: 'approved', grade: 'A' });
    expect(toSubmissionRow(row('Rejected'))).toMatchObject({ statusLabel: 'Rejected', statusTone: 'rejected' });
    expect(toSubmissionRow(row('Reverted'))).toMatchObject({ statusLabel: 'Clarification Requested', statusTone: 'reverted' });
    expect(toSubmissionRow(row('UnderReview', null)).submissionDate).toBe('-');
  });

  it('builds the status tabs from the counts', () => {
    expect(statusTabs({ all: 4, underReview: 3, reverted: 0, approved: 1, rejected: 0 }).map(t => `${t.id}:${t.count}`))
      .toEqual(['all:4', 'UnderReview:3', 'Approved:1', 'Rejected:0']);
  });

  it('names the evaluation Excel after the EOI', () => {
    expect(evaluationFileName('RSLDC/EOI/2026-27/01')).toBe('EOI-Decisions-RSLDC-EOI-2026-27-01.xlsx');
    expect(evaluationFileName('')).toBe('EOI-Decisions-EOI.xlsx');
  });
});
