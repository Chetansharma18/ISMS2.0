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

/** Computes user-friendly remaining days relative to today. */
export function remainingDaysText(dueDateStr: string, now: Date = new Date()): string {
  if (!dueDateStr) return '';
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const parts = dueDateStr.split(/[-/]/);
  let due: Date | null = null;
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const year = parseInt(parts[2], 10);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIdx = isNaN(Number(parts[1]))
      ? months.indexOf(parts[1].toLowerCase())
      : parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0) {
      due = new Date(year, monthIdx, day);
    }
  }
  if (!due || isNaN(due.getTime())) {
    due = new Date(dueDateStr);
  }
  if (isNaN(due.getTime())) return `Due by ${dueDateStr}`;

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Deadline passed (Overdue)';
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return '1 day remaining';
  return `${diffDays} days remaining`;
}
