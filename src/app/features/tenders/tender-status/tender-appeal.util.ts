import type { AppealFile, SubmittedTender, TenderAppeal } from '../../../core/models/tender.model';
import { formatDateMedium } from '../../../shared/utils/date.util';

/** Most files that can be attached to one appeal (legacy support). */
export const MAX_APPEAL_FILES = 5;

/** Parses date string in DD-Mon-YYYY, DD/MM/YYYY, or YYYY-MM-DD format into Date object. */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    // Format: YYYY-MM-DD
    if (parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && month >= 0 && month <= 11 && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    // Format: DD-Mon-YYYY or DD-MM-YYYY
    const day = parseInt(parts[0], 10);
    const year = parseInt(parts[2], 10);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIdx = isNaN(Number(parts[1]))
      ? months.indexOf(parts[1].toLowerCase())
      : parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx <= 11 && !isNaN(day) && !isNaN(year)) {
      return new Date(year, monthIdx, day);
    }
  }
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/** Computes the 7-day appeal deadline string for a submitted tender. */
export function getAppealDeadline(tender: SubmittedTender, now: Date = new Date()): string {
  if (tender.appealDeadline) return tender.appealDeadline;

  if (tender.decisionDate) {
    const dec = parseDate(tender.decisionDate);
    if (dec) {
      const due = new Date(dec);
      due.setDate(due.getDate() + 7);
      return formatDateMedium(due, '-');
    }
  }

  if (tender.appeal?.responseDeadline) return tender.appeal.responseDeadline;
  if (tender.shortfalls && tender.shortfalls.length > 0 && tender.shortfalls[0].dueDate) {
    return tender.shortfalls[0].dueDate;
  }

  // Default fallback: 7 days from now
  const due = new Date(now);
  due.setDate(due.getDate() + 7);
  return formatDateMedium(due, '-');
}

/** Checks whether the 7-day appeal window is currently open. */
export function isAppealWindowOpen(tender: SubmittedTender, now: Date = new Date()): boolean {
  // Only Approved or Rejected applications can be appealed
  const isEligible =
    tender.submittedStatus === 'Rejected' ||
    tender.submittedStatus === 'Approved' ||
    tender.submittedStatus === 'Accepted';
  if (!isEligible) return false;

  // Single appeal constraint: cannot appeal if already appealed
  if (tender.appeal) return false;

  // Check 7-day window
  const deadlineStr = getAppealDeadline(tender, now);
  const deadline = parseDate(deadlineStr);
  if (!deadline) return true;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  deadline.setHours(23, 59, 59, 999);

  return today.getTime() <= deadline.getTime();
}

/**
 * An application can be appealed when:
 * 1. Status is Rejected or Approved
 * 2. It has not been appealed yet
 * 3. The 7-day window from the decision date is still active
 */
export function canAppeal(tender: SubmittedTender, now: Date = new Date()): boolean {
  return isAppealWindowOpen(tender, now);
}

/** The appeal can be submitted once remarks / explanation text is entered. */
export function isAppealReady(reply: string): boolean {
  return reply.trim().length > 0;
}

/** Builds the appeal record with text-only reply (and optional files for backwards compatibility). */
export function buildAppeal(reply: string, today: string, files: AppealFile[] = []): TenderAppeal {
  return { submittedOn: today, reply: reply.trim(), files: files.slice(0, MAX_APPEAL_FILES) };
}

/** Computes user-friendly remaining days relative to today. */
export function remainingDaysText(dueDateStr: string, now: Date = new Date()): string {
  if (!dueDateStr) return '';
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const due = parseDate(dueDateStr);
  if (!due || isNaN(due.getTime())) return `Due by ${dueDateStr}`;

  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Appeal window closed (Expired)';
  if (diffDays === 0) return 'Due today (Last day)';
  if (diffDays === 1) return '1 day remaining';
  return `${diffDays} days remaining`;
}

/** Computes friendly remaining appeal window text for alert banners. */
export function remainingAppealDaysText(tender: SubmittedTender, now: Date = new Date()): string {
  const deadline = getAppealDeadline(tender, now);
  const diffText = remainingDaysText(deadline, now);
  if (diffText.includes('closed') || diffText.includes('Expired')) {
    return 'Appeal window closed: 7-day period ended';
  }
  return `7 days to appeal • ${diffText}`;
}
