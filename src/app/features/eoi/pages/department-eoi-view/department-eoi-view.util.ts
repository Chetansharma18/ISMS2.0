import { formatDateMedium } from '../../../../shared/utils/date.util';
import { toPaginated } from '../../../../core/http/response-adapter';

/** One EOI the signed-in user can review (EoiReviewNoticeDto from GET /api/eoi/responses). */
export interface EoiReviewNotice {
  sNo: number;
  eoiId: number;
  refNo: string;
  schemeName: string;
  schemeCategory: string;
  eoiCategory: string | null;
  publishedDate: string | null;
  closingDate: string | null;
  /** Scheduled | Open | Closed */
  status: string;
  responseCount: number;
  /** The caller cannot open the submissions: the EOI has not closed, or the caller is not on its committee. */
  isLocked: boolean;
  /** Why the submissions cannot be opened (null when they can). */
  lockReason?: string | null;
  /** Approver / Member / Reviewer */
  myRoles: string[];
}

/** A row of the EOI Responses table. */
export interface EoiResponsesRow {
  id: number;
  refNo: string;
  schemeTitle: string;
  category: string;
  dateOfOpening: string;
  dateOfClosing: string;
  status: string;
  responseCount: number;
  isLocked: boolean;
  lockReason: string;
  myRoles: string;
}

/** yyyy-MM-dd -> 31-Aug-2026 ('-' when missing). */
function day(value: string | null | undefined): string {
  if (!value) return '-';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? formatDateMedium(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])), '-') : value;
}

export function toResponsesRow(n: EoiReviewNotice): EoiResponsesRow {
  return {
    id: n.eoiId,
    refNo: n.refNo,
    schemeTitle: n.schemeName,
    category: n.schemeCategory?.trim() || '-',
    dateOfOpening: day(n.publishedDate),
    dateOfClosing: day(n.closingDate),
    status: n.status,
    responseCount: n.responseCount ?? 0,
    isLocked: !!n.isLocked,
    lockReason: n.isLocked ? n.lockReason || 'Submissions unlock upon Date of closing' : '',
    myRoles: (n.myRoles ?? []).join(', ')
  };
}

/** The rows of a GET /api/eoi/responses answer, whatever its envelope. */
export function responsesRowsFrom(res: unknown): EoiResponsesRow[] {
  return toPaginated<EoiReviewNotice>(res).items.map(toResponsesRow);
}

export function filterResponsesRows(rows: readonly EoiResponsesRow[], query: string): EoiResponsesRow[] {
  const q = query.toLowerCase().trim();
  if (!q) return [...rows];
  return rows.filter(r =>
    [r.schemeTitle, r.refNo, r.category, r.status].some(v => v.toLowerCase().includes(q))
  );
}
