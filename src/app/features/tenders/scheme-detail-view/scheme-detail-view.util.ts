import { SchemeTender } from '../tenders.models';

/**
 * True when the scheme is marked closed or its closing date (dd/mm/yyyy or dd-mm-yyyy)
 * is in the past. Mirrors the detail screen's "Submission Closed" check.
 */
export function isSubmissionClosed(scheme: SchemeTender | null | undefined, now: number = Date.now()): boolean {
  if (!scheme) return false;
  if (scheme.status === 'Closed') return true;
  if (!scheme.closingDate) return false;
  const parts = scheme.closingDate.includes('/')
    ? scheme.closingDate.split('/')
    : scheme.closingDate.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const closeDate = new Date(year, month, day, 23, 59, 59);
    if (!isNaN(closeDate.getTime())) return closeDate.getTime() < now;
  }
  return false;
}

/**
 * Formats a fee for display: falls back to the given default and
 * inserts a space after a leading rupee sign ("₹50,000" -> "₹ 50,000").
 */
export function formatFeeDisplay(fee: string | undefined, fallback: string): string {
  const value = fee || fallback;
  return value.startsWith('₹') && !value.startsWith('₹ ') ? '₹ ' + value.slice(1) : value;
}

/** Splits a list into a first half (rounded up) and a second half. */
export function splitInHalf<T>(items: readonly T[]): { left: T[]; right: T[] } {
  const half = Math.ceil(items.length / 2);
  return { left: items.slice(0, half), right: items.slice(half) };
}
