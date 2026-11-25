import type { BadgeVariant } from '../../../shared/components/table/table.types';
import { formatDateTime } from '../../../shared/utils/date.util';
import { formatInr } from '../../../shared/utils/formatters.util';
import { toDisplayDay } from '../services/eoi-config.util';
import type { EoiAppeal, EoiStatusApplication } from './eoi-status.model';

/** The backend sends UTC times without a zone. */
export function statusTime(value: string | null | undefined): string {
  if (!value) return '-';
  return formatDateTime(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);
}

export interface StatusBadge {
  label: string;
  variant: BadgeVariant;
}

const APPEAL_STATUS: Record<string, string> = {
  Submitted: 'Appeal submitted',
  Rejected: 'Appeal rejected',
  Accepted: 'Appeal accepted',
  AwaitingResponse: 'Appeal: response requested',
  Lapsed: 'Appeal lapsed',
  ResponseSubmitted: 'Appeal under review',
  Redecided: 'Appeal under review',
  Closed: 'Appeal closed'
};

export function appealStatusLabel(appeal: Pick<EoiAppeal, 'status' | 'outcome'>): string {
  if (appeal.status === 'Closed' && appeal.outcome === 'Changed') return 'Appeal closed: result revised';
  if (appeal.status === 'Closed' && appeal.outcome === 'Upheld') return 'Appeal closed: result upheld';
  return APPEAL_STATUS[appeal.status] ?? appeal.status;
}

/** The status the applicant sees. Approved / Rejected appear only once the results are released. */
export function applicationStatus(app: Pick<EoiStatusApplication, 'status' | 'decision'>): StatusBadge {
  const status = app.decision?.status ?? app.status;
  switch (status) {
    case 'Draft': return { label: 'Draft (not submitted)', variant: 'neutral' };
    case 'UnderReview': return { label: 'Under Review', variant: 'submitted' };
    case 'Reverted': return { label: 'Clarification Requested', variant: 'returned' };
    case 'Approved': return { label: 'Approved', variant: 'success' };
    case 'Rejected': return { label: 'Rejected', variant: 'danger' };
    default: return { label: status || '-', variant: 'neutral' };
  }
}

export interface StatusRow {
  id: number;
  applicationNo: string;
  refNo: string;
  schemeName: string;
  schemeCategory: string;
  submittedOn: string;
  status: StatusBadge;
  /** e.g. "Grade A", "Appeal under review" */
  note: string;
  isDraft: boolean;
  eoiId: number;
}

export function toStatusRow(app: EoiStatusApplication): StatusRow {
  const appeal = app.appeal?.appeal;
  const note = appeal
    ? appealStatusLabel(appeal)
    : app.clarification?.isOpen
      ? `Reply by ${statusTime(app.clarification.dueAt)}`
      : app.decision?.status === 'Approved' && app.decision.grade
        ? `Grade ${app.decision.grade}`
        : '';
  return {
    id: app.id,
    applicationNo: app.applicationNo,
    refNo: app.notice?.refNo ?? '',
    schemeName: app.notice?.schemeName ?? '',
    schemeCategory: app.notice?.schemeCategory ?? '',
    submittedOn: app.submittedAt ? statusTime(app.submittedAt) : '-',
    status: applicationStatus(app),
    note,
    isDraft: app.status === 'Draft',
    eoiId: app.notice?.id ?? 0
  };
}

export type TimelineState = 'done' | 'current' | 'todo' | 'alert';

export interface TimelineStep {
  key: string;
  title: string;
  detail: string;
  when: string;
  state: TimelineState;
}

/**
 * The application's progress, in real time: submitted, under review by the committee, any clarification
 * round, the released result and any appeal.
 */
export function statusTimeline(app: EoiStatusApplication): TimelineStep[] {
  const steps: TimelineStep[] = [];
  const submitted = !!app.submittedAt;
  steps.push({
    key: 'submitted',
    title: 'Application submitted',
    detail: submitted ? `Application No. ${app.applicationNo}` : 'Complete and submit the application to send it to the committee.',
    when: submitted ? statusTime(app.submittedAt) : '',
    state: submitted ? 'done' : 'current'
  });

  const c = app.clarification;
  if (c) {
    steps.push({
      key: 'clarification',
      title: c.isOpen ? 'Clarification requested by the committee' : 'Clarification sent to the committee',
      detail: c.isOpen
        ? `Upload ${c.documents.join(', ') || 'the requested documents'} and send them by ${statusTime(c.dueAt)}.`
        : `Replied on ${statusTime(c.respondedAt)}.`,
      when: statusTime(c.requestedAt),
      state: c.isOpen ? 'alert' : 'done'
    });
  }

  const published = !!app.decision;
  steps.push({
    key: 'review',
    title: 'Committee review',
    detail: published
      ? 'The committee has completed its review.'
      : submitted
        ? 'The committee is reviewing the application. The result is shown here once the orders are released.'
        : '',
    when: '',
    state: published ? 'done' : submitted && !c?.isOpen ? 'current' : 'todo'
  });

  const d = app.decision;
  steps.push({
    key: 'result',
    title: d ? `Result released: ${d.status === 'Approved' ? 'Approved' : 'Rejected'}` : 'Result',
    detail: d
      ? d.status === 'Approved'
        ? `Empanelled${d.grade ? ` with grade ${d.grade}` : ''}.${app.resultOrder ? ` See ${app.resultOrder.orderNo}.` : ''}`
        : `${d.remarks ? `Reason: ${d.remarks}. ` : ''}${app.resultOrder ? `See ${app.resultOrder.orderNo}.` : ''}`.trim()
      : 'Not released yet.',
    when: app.resultOrder ? statusTime(app.resultOrder.publishedAt) : '',
    state: d ? (d.status === 'Approved' ? 'done' : 'alert') : 'todo'
  });

  const appeal = app.appeal?.appeal;
  if (appeal) {
    const closed = appeal.status === 'Closed' || appeal.status === 'Rejected' || appeal.status === 'Lapsed';
    steps.push({
      key: 'appeal',
      title: appealStatusLabel(appeal),
      detail: appeal.status === 'AwaitingResponse'
        ? `Respond by ${toDisplayDay(appeal.windowEnd ?? '') || appeal.windowEnd || '-'}.`
        : appeal.authorityRemark ?? appeal.redecidedRemark ?? '',
      when: statusTime(appeal.submittedAt),
      state: appeal.status === 'AwaitingResponse' ? 'alert' : closed ? 'done' : 'current'
    });
  } else if (app.appeal?.canAppeal) {
    steps.push({
      key: 'appeal',
      title: 'Appeal (optional)',
      detail: `You may appeal against the result until ${statusTime(app.appeal.appealDeadline)}.`,
      when: '',
      state: 'todo'
    });
  }
  return steps;
}

/** "Rs 25,000 paid on 21 Nov 2026, 02:05 PM", "Exempted (MSME)", "Not payable", "Not paid". */
export function feeLine(fee: { amount: number; required: boolean; done: boolean; paidAt: string | null; mode?: string } | null | undefined): string {
  if (!fee) return '-';
  if (fee.mode === 'Exempted') return 'Exempted (MSME / Udyam)';
  if (!fee.required || !fee.amount) return 'Not payable';
  return fee.done ? `${formatInr(fee.amount)} paid${fee.paidAt ? ` on ${statusTime(fee.paidAt)}` : ''}` : `${formatInr(fee.amount)} (not paid)`;
}

/** "Result-EMP-RSLDC-EOI-2026-27-01.pdf" */
export function resultOrderFileName(orderNo: string): string {
  return `${(orderNo || 'Result-Order').replace(/[^A-Za-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}.pdf`;
}

/** Documents still to upload for an open clarification (requested names without an upload yet). */
export function pendingClarificationDocs(app: Pick<EoiStatusApplication, 'clarification'>): string[] {
  const c = app.clarification;
  if (!c?.isOpen) return [];
  const uploaded = new Set(c.uploads.filter(u => !!u.file).map(u => u.name.trim().toLowerCase()));
  return c.documents.filter(d => !uploaded.has(d.trim().toLowerCase()));
}
