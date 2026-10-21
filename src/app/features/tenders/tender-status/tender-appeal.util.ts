import type { AppealFile, SubmittedTender, TenderAppeal } from '../../../core/models/tender.model';

/** Most files that can be attached to one appeal. */
export const MAX_APPEAL_FILES = 5;

/** A rejected application can be appealed once. */
export function canAppeal(tender: SubmittedTender): boolean {
  return tender.submittedStatus === 'Rejected' && !tender.appeal;
}

/** The appeal can be submitted once the rejection remarks are answered. */
export function isAppealReady(reply: string): boolean {
  return reply.trim().length > 0;
}

/** Builds the appeal to store; `today` is DD-Mon-YYYY. */
export function buildAppeal(reply: string, files: AppealFile[], today: string): TenderAppeal {
  return { submittedOn: today, reply: reply.trim(), files: files.slice(0, MAX_APPEAL_FILES) };
}
