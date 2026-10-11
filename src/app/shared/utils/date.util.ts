const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return isNaN(d.getTime()) ? null : d;
}

/** dd/mm/yyyy (e.g. 05/03/2026). Matches toLocaleDateString('en-GB'). */
export function formatDate(date: string | Date | null | undefined, separator: string = '/'): string {
  if (!date) return '-';
  const d = toDate(date);
  if (!d) return String(date);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}${separator}${month}${separator}${year}`;
}

/** dd Mon yyyy (e.g. 05 Mar 2026). Matches toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }). */
export function formatDateMedium(date: string | Date | null | undefined, separator: string = ' '): string {
  if (!date) return '-';
  const d = toDate(date);
  if (!d) return String(date);

  const day = String(d.getDate()).padStart(2, '0');
  return `${day}${separator}${MONTHS_SHORT[d.getMonth()]}${separator}${d.getFullYear()}`;
}

/** hh:mm AM/PM (12h, e.g. 02:07 PM). */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = toDate(date);
  if (!d) return String(date);

  const h24 = d.getHours();
  const hours = String(h24 % 12 || 12).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${h24 < 12 ? 'AM' : 'PM'}`;
}

/** dd Mon yyyy, hh:mm AM/PM (e.g. 05 Mar 2026, 02:07 PM). */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = toDate(date);
  if (!d) return String(date);
  return `${formatDateMedium(d)}, ${formatTime(d)}`;
}

export function isDateInPast(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
