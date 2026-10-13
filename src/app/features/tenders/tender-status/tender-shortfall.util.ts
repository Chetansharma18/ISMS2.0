import { ShortfallRequest, ShortfallResponse, SubmittedTender } from '../../../core/models/tender.model';
import { isBeforeClosingDate } from './tender-status.util';

/** Notices on a tender, oldest first. */
export function shortfallsOf(tender: SubmittedTender): ShortfallRequest[] {
  return tender.shortfalls ?? [];
}

/** Notices still waiting for the applicant's reply. */
export function openShortfalls(tender: SubmittedTender): ShortfallRequest[] {
  return shortfallsOf(tender).filter(s => s.status === 'Open');
}

/** True when the response date of a notice has passed. */
export function isShortfallOverdue(request: ShortfallRequest, now: Date = new Date()): boolean {
  return request.status === 'Open' && !isBeforeClosingDate(request.dueDate, now);
}

/** Short summary for the status table: "Response required", "Responded" or an empty string. */
export function shortfallSummary(tender: SubmittedTender): 'open' | 'responded' | 'none' {
  if (openShortfalls(tender).length > 0) return 'open';
  return shortfallsOf(tender).length > 0 ? 'responded' : 'none';
}

/** Returns the tender's notices with one notice marked as answered. */
export function withShortfallResponse(
  tender: SubmittedTender,
  shortfallId: string,
  response: ShortfallResponse
): ShortfallRequest[] {
  return shortfallsOf(tender).map(s =>
    s.id === shortfallId ? { ...s, status: 'Responded' as const, response } : s
  );
}

/** Every document asked for in the notice has a file chosen. */
export function isShortfallResponseComplete(request: ShortfallRequest, chosen: Record<string, unknown>): boolean {
  return request.requiredDocs.every(doc => !!chosen[doc]);
}
