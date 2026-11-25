import { formatDateTime } from '../../../../shared/utils/date.util';
import type { FilterTab } from '../../../../shared/components/filter-tabs/filter-tabs.component';

/*
 * Applicant Submissions of one EOI, from GET /api/eoi/responses/notices/{eoiId}/applications
 * (EoiReviewApplicationListDto). The backend lets only the EOI's committee read it, after the closing date.
 */

export interface ReviewApplicationRowDto {
  sNo: number;
  id: number;
  applicationNo: string;
  /** "Applicant 01": the committee reviews applications without the organisation's name in front. */
  anonymousLabel: string;
  organisationName: string | null;
  /** UnderReview | Reverted | Approved | Rejected */
  status: string;
  submittedAt: string | null;
  grade: string | null;
  reviewed: boolean;
}

export interface ReviewCounts {
  all: number;
  underReview: number;
  reverted: number;
  approved: number;
  rejected: number;
}

export interface ReviewApplicationList {
  notice: { eoiId: number; refNo: string; schemeName: string; status: string; myRoles: string[] };
  counts: ReviewCounts;
  applications: { items: ReviewApplicationRowDto[]; total: number; page: number; pageSize: number };
}

export interface SubmissionRow {
  id: number;
  applicationNo: string;
  anonymousLabel: string;
  /** The organisation's name (from its OTR); "Applicant 01" only when the backend has no name. */
  applicantName: string;
  submissionDate: string;
  status: string;
  statusLabel: string;
  statusTone: 'pending' | 'approved' | 'rejected' | 'reverted';
  grade: string;
  reviewed: boolean;
}

const STATUS: Record<string, { label: string; tone: SubmissionRow['statusTone'] }> = {
  UnderReview: { label: 'Pending', tone: 'pending' },
  Reverted: { label: 'Clarification Requested', tone: 'reverted' },
  Approved: { label: 'Approved', tone: 'approved' },
  Rejected: { label: 'Rejected', tone: 'rejected' }
};

export function toSubmissionRow(r: ReviewApplicationRowDto): SubmissionRow {
  const s = STATUS[r.status] ?? { label: r.status, tone: 'pending' as const };
  return {
    id: r.id,
    applicationNo: r.applicationNo,
    anonymousLabel: r.anonymousLabel,
    applicantName: r.organisationName?.trim() || r.anonymousLabel,
    submissionDate: r.submittedAt ? formatDateTime(r.submittedAt.endsWith('Z') ? r.submittedAt : `${r.submittedAt}Z`) : '-',
    status: r.status,
    statusLabel: s.label,
    statusTone: s.tone,
    grade: r.grade ?? '',
    reviewed: r.reviewed
  };
}

export const EMPTY_COUNTS: ReviewCounts = { all: 0, underReview: 0, reverted: 0, approved: 0, rejected: 0 };

export type SubmissionTab = 'all' | 'UnderReview' | 'Reverted' | 'Approved' | 'Rejected';

/** Status filter tabs with the backend's counts (the counts ignore the search). */
export function statusTabs(counts: ReviewCounts): FilterTab<SubmissionTab>[] {
  return [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'UnderReview', label: 'Pending', count: counts.underReview },
    { id: 'Approved', label: 'Approved', count: counts.approved },
    { id: 'Rejected', label: 'Rejected', count: counts.rejected }
  ];
}

/** EOI-Decisions-RSLDC-EOI-2026-27-01.xlsx */
export function evaluationFileName(refNo: string): string {
  return `EOI-Decisions-${(refNo || 'EOI').replace(/[^A-Za-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}.xlsx`;
}
