import type { EoiApplication, EoiApplyDocument } from '../../eoi/components/scheme-form/eoi-apply.model';

/*
 * The applicant's view of an application on EOI Status (GET /api/eoi/apply/applications[/{id}], EoiApplicationDto).
 * The committee's decision stays hidden ("UnderReview") until the result orders are e-signed and released.
 */

export interface EoiClarification {
  /** Names of the documents the committee asked for. */
  documents: string[];
  comment: string | null;
  requestedAt: string | null;
  dueAt: string | null;
  respondedAt: string | null;
  isOpen: boolean;
  uploads: EoiApplyDocument[];
}

/** Present only after the results are published. */
export interface EoiDecision {
  /** Approved | Rejected */
  status: string;
  grade: string | null;
  remarks: string | null;
  decidedAt: string | null;
}

export interface EoiPublishedOrder {
  id: number;
  orderNo: string;
  publishedAt: string;
  url: string;
}

export interface EoiAppealDocument {
  id: number;
  /** Appeal | Response */
  stage: string;
  title: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  url: string;
}

export interface EoiAppeal {
  id: number;
  round: number;
  /** Submitted | Rejected | Accepted | AwaitingResponse | Lapsed | ResponseSubmitted | Redecided | Closed */
  status: string;
  resultAtAppeal: string;
  gradeAtAppeal: string | null;
  reason: string;
  submittedAt: string;
  authorityRemark: string | null;
  authorityAt: string | null;
  windowStart: string | null;
  windowEnd: string | null;
  requestedDocuments: string[];
  windowComment: string | null;
  canRespond: boolean;
  responseText: string | null;
  responseSubmittedAt: string | null;
  redecidedStatus: string | null;
  redecidedGrade: string | null;
  redecidedRemark: string | null;
  redecidedAt: string | null;
  /** Upheld | Changed */
  outcome: string | null;
  closedAt: string | null;
  documents: EoiAppealDocument[];
}

export interface EoiAppealInfo {
  canAppeal: boolean;
  appealDeadline: string | null;
  cannotAppealReason: string | null;
  appeal: EoiAppeal | null;
}

export interface EoiStatusApplication extends EoiApplication {
  clarification: EoiClarification | null;
  decision: EoiDecision | null;
  resultOrder: EoiPublishedOrder | null;
  appeal: EoiAppealInfo | null;
}

export interface EoiStatusPage {
  items: EoiStatusApplication[];
  page: number;
  pageSize: number;
  totalCount: number;
}
