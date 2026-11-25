import type { DossierDocument } from '../../services/eoi-state.service';
import type { BadgeVariant } from '../../../../shared/components/table/table.types';
import { formatDateTime } from '../../../../shared/utils/date.util';
import { formatInr } from '../../../../shared/utils/formatters.util';
import { answerText } from '../../components/scheme-form/eoi-apply.util';
import type { EoiAnswerValue, EoiApplyDocument, EoiApplyFee, EoiCustomField } from '../../components/scheme-form/eoi-apply.model';
import type { GradeOption } from './components/scrutiny-decision-modal.component';

// ------------------------------------------------------------------------------------------------
// Scrutiny Desk on the backend: GET /api/eoi/responses/applications/{id} (EoiReviewApplicationDetailDto).
// ------------------------------------------------------------------------------------------------

export interface ReviewActivityDto {
  id: number;
  /** Submitted | RemarkAdded | ClarificationRequested | ClarificationSubmitted | Approved | Rejected | Appeal... */
  action: string;
  actorName: string;
  /** Applicant | Approver | Member | Reviewer */
  actorRole: string;
  remark: string | null;
  grade: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface ReviewPermissions {
  canRemark: boolean;
  canDecide: boolean;
  myRoles: string[];
  canBulkDecide: boolean;
  decisionsOpen: boolean;
}

export interface ReviewGradeDto {
  id: number;
  grade: string;
  minScore: number | null;
  maxScore: number | null;
  description: string | null;
}

export interface ReviewRemarkOptionDto {
  id: number;
  title: string;
  category: string | null;
  description: string | null;
}

export interface ReviewClarification {
  documents: string[];
  comment: string | null;
  requestedAt: string | null;
  dueAt: string | null;
  respondedAt: string | null;
  isOpen: boolean;
  uploads: EoiApplyDocument[];
}

export interface ReviewDetail {
  id: number;
  applicationNo: string;
  anonymousLabel: string;
  /** UnderReview | Reverted | Approved | Rejected */
  status: string;
  submittedAt: string | null;
  notice: { eoiId: number; refNo: string; schemeName: string; schemeCategory: string; eoiCategory: string | null; closingDate: string | null };
  organisationName: string | null;
  otrReferenceNo: string | null;
  /** The OTR copied into the application: { organisation, authorized-person, bank-details }. */
  profile: Record<string, Record<string, unknown> | undefined>;
  otrDocuments: { fieldKey: string; fileName: string; url: string }[];
  documents: EoiApplyDocument[];
  processFee: EoiApplyFee;
  emd: EoiApplyFee & { mode: string; udyamNumber: string | null };
  clarification: ReviewClarification | null;
  decision: { status: string; grade: string | null; remarks: string | null; decidedAt: string | null } | null;
  activity: ReviewActivityDto[];
  permissions: ReviewPermissions;
  grades: ReviewGradeDto[];
  remarkOptions: ReviewRemarkOptionDto[];
  dynamicAnswers: Record<string, EoiAnswerValue> | null;
  customFields: EoiCustomField[] | null;
  decisionVersion: string | null;
  /** The organisation's other submitted EOI applications, newest first. */
  pastApplications: PastApplicationDto[] | null;
}

export interface PastApplicationDto {
  id: number;
  applicationNo: string;
  eoiRefNo: string;
  schemeName: string;
  status: string;
  grade: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
}

export interface PastApplicationRow {
  id: number;
  applicationNo: string;
  eoiRefNo: string;
  schemeName: string;
  statusLabel: string;
  statusVariant: BadgeVariant;
  grade: string;
  submittedOn: string;
  decidedOn: string;
}

/** Past Performance rows: earlier EOI applications of the same organisation with their outcome. */
export function pastApplicationRows(list: readonly PastApplicationDto[] | null | undefined): PastApplicationRow[] {
  return (list ?? []).map(p => {
    const s = reviewStatus(p.status);
    return {
      id: p.id,
      applicationNo: p.applicationNo,
      eoiRefNo: p.eoiRefNo,
      schemeName: p.schemeName,
      statusLabel: s.label,
      statusVariant: s.variant,
      grade: p.grade || '-',
      submittedOn: reviewTime(p.submittedAt),
      decidedOn: reviewTime(p.decidedAt)
    };
  });
}

/** "APP-2026-000002-Documents.zip", the same name the backend gives the ZIP. */
export function documentsZipName(applicationNo: string): string {
  const clean = (applicationNo || '').replace(/[^A-Za-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${clean || 'Application'}-Documents.zip`;
}

/** OTR step keys in the order the Scrutiny Desk shows them, with the stepper text. */
export const PROFILE_SECTIONS = [
  { key: 'organisation', label: 'Organisation Details', description: 'Entity & statutory credentials' },
  { key: 'authorized-person', label: 'Authorized Person Details', description: 'Signatory identity & contact' },
  { key: 'bank-details', label: 'Bank Details', description: 'Disbursement account details' }
] as const;

/** The backend sends UTC times without a zone; shown in the browser's time. */
export function reviewTime(value: string | null | undefined): string {
  if (!value) return '-';
  return formatDateTime(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);
}

const STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  UnderReview: { label: 'Under Review', variant: 'submitted' },
  Reverted: { label: 'Clarification Requested', variant: 'returned' },
  Approved: { label: 'Approved', variant: 'success' },
  Rejected: { label: 'Rejected', variant: 'danger' }
};

export function reviewStatus(status: string): { label: string; variant: BadgeVariant } {
  return STATUS[status] ?? { label: status || '-', variant: 'neutral' };
}

const ROLE_LABEL: Record<string, string> = {
  Applicant: 'Applicant',
  Approver: 'Committee Approver',
  Member: 'Committee Member',
  Reviewer: 'Reviewer'
};

/** Who did it: "Priya Mathur (Committee Member)"; just the role when the backend has no name. */
export function actorLabels(activity: readonly ReviewActivityDto[]): Map<number, string> {
  const labels = new Map<number, string>();
  for (const a of activity) {
    const role = ROLE_LABEL[a.actorRole] ?? a.actorRole ?? '';
    const name = a.actorName?.trim();
    labels.set(a.id, name && role ? `${name} (${role})` : name || role || '-');
  }
  return labels;
}

const ACTION_TITLE: Record<string, string> = {
  Submitted: 'Application submitted',
  RemarkAdded: 'Remark added',
  ClarificationRequested: 'Clarification requested',
  ClarificationSubmitted: 'Clarification submitted',
  Approved: 'Approved',
  Rejected: 'Rejected',
  AppealSubmitted: 'Appeal submitted',
  AppealAccepted: 'Appeal approved',
  AppealRejected: 'Appeal rejected',
  AppealWindowSet: 'Appeal window set',
  AppealResponseSubmitted: 'Appeal response submitted',
  AppealRedecided: 'Decision revised after appeal',
  AppealResultPublished: 'Appeal result published'
};

export interface ActivityEntry {
  id: number;
  title: string;
  actor: string;
  when: string;
  remark: string;
  grade: string;
  /** Documents asked for (clarification requests). */
  documents: string[];
  dueDays: number | null;
}

/** The application's activity log, oldest first, with committee members shown by number. */
export function activityEntries(activity: readonly ReviewActivityDto[]): ActivityEntry[] {
  const labels = actorLabels(activity);
  return activity.map(a => {
    const docs = a.details?.['documents'];
    const days = a.details?.['dueDays'];
    return {
      id: a.id,
      title: ACTION_TITLE[a.action] ?? a.action,
      actor: labels.get(a.id) ?? '-',
      when: reviewTime(a.createdAt),
      remark: a.remark ?? '',
      grade: a.grade ?? '',
      documents: Array.isArray(docs) ? docs.filter((d): d is string => typeof d === 'string') : [],
      dueDays: typeof days === 'number' ? days : null
    };
  });
}

/** Grades of the scheme (Grading Master) for the Approve dialog, highest first. */
export function toGradeOptions(grades: readonly ReviewGradeDto[]): GradeOption[] {
  return [...grades]
    .sort((a, b) => (b.maxScore ?? 0) - (a.maxScore ?? 0))
    .map(g => ({
      grade: g.grade,
      minimum: g.minScore ?? 0,
      maximum: g.maxScore ?? 0,
      range: g.minScore !== null && g.maxScore !== null ? `${g.minScore} - ${g.maxScore}` : ''
    }));
}

/** Remark Master entries offered as ready remarks (their description, or the title when there is none). */
export function remarkPresets(options: readonly ReviewRemarkOptionDto[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const o of options) {
    const text = (o.description?.trim() || o.title?.trim() || '');
    if (text && !seen.has(text.toLowerCase())) {
      seen.add(text.toLowerCase());
      out.push(text);
    }
  }
  return out;
}

export interface AnswerRow {
  key: string;
  label: string;
  value: string;
  section: string;
}

/** The applicant's answers to the EOI's questions, in the configured order. */
export function answerRows(fields: readonly EoiCustomField[] | null, answers: Record<string, EoiAnswerValue> | null): AnswerRow[] {
  return (fields ?? []).map(f => ({ key: f.key, label: f.label, section: f.section, value: answerText(f, answers?.[f.key]) }));
}

export interface FeeSummary {
  amount: string;
  status: 'Paid' | 'Not Paid' | 'Exempted' | 'Not Payable';
  variant: BadgeVariant;
  /** "Paid on 21 Nov 2026, 02:05 PM", "Udyam UDYAM-1" ... */
  detail: string;
  /** PRN and RPP transaction id, when paid. */
  reference: string;
}

/** A fee as the Overview shows it: amount, status badge and when / how it was paid. */
export function feeSummary(fee: (EoiApplyFee & { mode?: string; udyamNumber?: string | null }) | null | undefined): FeeSummary {
  const amount = fee?.amount ? formatInr(fee.amount) : '-';
  if (!fee) return { amount, status: 'Not Payable', variant: 'neutral', detail: '', reference: '' };
  if (fee.mode === 'Exempted') {
    return { amount, status: 'Exempted', variant: 'info', detail: fee.udyamNumber ? `Udyam ${fee.udyamNumber}` : 'MSME exemption', reference: '' };
  }
  if (!fee.required || !fee.amount) return { amount, status: 'Not Payable', variant: 'neutral', detail: '', reference: '' };
  if (!fee.done) return { amount, status: 'Not Paid', variant: 'warning', detail: '', reference: '' };
  const reference = [fee.prn ? `PRN ${fee.prn}` : '', fee.rppTxnId ? `Txn ${fee.rppTxnId}` : ''].filter(Boolean).join(' · ');
  return { amount, status: 'Paid', variant: 'success', detail: fee.paidAt ? `Paid on ${reviewTime(fee.paidAt)}` : '', reference };
}

/** Document currently shown in the scrutiny document viewer. */
export interface ActivePreviewDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  category: string;
  refCode: string;
  comment?: string;
}

export type GradeLabel = 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D' | 'Grade E';

export const GRADE_OPTIONS: { value: GradeLabel; label: string }[] = [
  { value: 'Grade A', label: 'Grade A (Score >= 85) - Outstanding Empanelment' },
  { value: 'Grade B', label: 'Grade B (Score 70 - 84) - Satisfactory Empanelment' },
  { value: 'Grade C', label: 'Grade C (Score 55 - 69) - Conditional Empanelment' },
  { value: 'Grade D', label: 'Grade D (Score 40 - 54) - Sub-Optimal' },
  { value: 'Grade E', label: 'Grade E (Score < 40) - Disqualified' }
];

/** Clamps a technical score into the 0 - 100 range. */
export function clampScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}

/** Maps a technical score to its grade (>=85 A, >=70 B, >=55 C, >=40 D, else E). */
export function gradeFromScore(score: number): GradeLabel {
  if (score >= 85) return 'Grade A';
  if (score >= 70) return 'Grade B';
  if (score >= 55) return 'Grade C';
  if (score >= 40) return 'Grade D';
  return 'Grade E';
}

/** Accept form is valid when the score is within 0 - 100 and a grade is selected. */
export function isAcceptFormValid(score: number | null | undefined, grade: string): boolean {
  return score !== null &&
    score !== undefined &&
    score >= 0 &&
    score <= 100 &&
    !!grade;
}

/** Reject form requires meaningful remarks (more than 3 characters after trimming). */
export function isRejectFormValid(remarks: string): boolean {
  return remarks.trim().length > 3;
}

/** Replaces every non alphanumeric character with an underscore. */
export function sanitizeFileToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '_');
}

/** Builds the certificate reference code for a dossier document. */
export function buildRefCode(applicantId: string | undefined, docId: string): string {
  return `RSLDC-${applicantId || 'APP'}-${docId.toUpperCase()}-2026`;
}

/** Builds the PDF file name for a dossier document title. */
export function buildDocFileName(title: string): string {
  return sanitizeFileToken(title) + '.pdf';
}

/** Builds the viewer model for a dossier document. */
export function toActivePreviewDocument(doc: DossierDocument, applicantId: string | undefined): ActivePreviewDocument {
  return {
    id: doc.id,
    title: doc.title,
    fileName: buildDocFileName(doc.title),
    fileSize: doc.fileSize,
    category: doc.category,
    refCode: buildRefCode(applicantId, doc.id),
    comment: doc.comment
  };
}

/** Folder / archive base name used for the "Download All (ZIP)" export. */
export function buildZipFolderName(anonymousLabel: string | undefined, applicantId: string): string {
  return `${sanitizeFileToken(anonymousLabel || 'Applicant')}_${applicantId}_Documents`;
}

/** File name of a single document inside the ZIP archive (1-based position prefix). */
export function buildZipEntryName(index: number, title: string): string {
  return `${index + 1}_${sanitizeFileToken(title)}.pdf`;
}
