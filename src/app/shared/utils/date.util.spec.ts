import { describe, it, expect } from 'vitest';
import { formatDate, formatDateMedium, formatDateTime, formatTime, daysBetween, isDateInPast } from './date.util';

describe('date.util', () => {
  // Local-time constructor so the tests do not depend on the machine's time zone.
  const d = new Date(2026, 2, 5, 14, 7); // 5 Mar 2026, 14:07

  it('formatDate returns zero-padded dd/mm/yyyy', () => {
    expect(formatDate(d)).toBe('05/03/2026');
  });

  it('formatDate honours a custom separator', () => {
    expect(formatDate(d, '-')).toBe('05-03-2026');
  });

  it('formatDateMedium returns dd Mon yyyy', () => {
    expect(formatDateMedium(d)).toBe('05 Mar 2026');
    expect(formatDateMedium(d, '-')).toBe('05-Mar-2026');
  });

  it('formatTime returns a 12-hour clock with AM/PM', () => {
    expect(formatTime(d)).toBe('02:07 PM');
    expect(formatTime(new Date(2026, 0, 1, 0, 5))).toBe('12:05 AM');
    expect(formatTime(new Date(2026, 0, 1, 12, 0))).toBe('12:00 PM');
  });

  it('formatDateTime joins date and time', () => {
    expect(formatDateTime(d)).toBe('05 Mar 2026, 02:07 PM');
  });

  it('returns a dash for empty values and echoes unparseable input', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
    expect(formatDateTime('')).toBe('-');
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  it('daysBetween is order independent and rounds up', () => {
    expect(daysBetween(new Date(2026, 0, 1), new Date(2026, 0, 11))).toBe(10);
    expect(daysBetween(new Date(2026, 0, 11), new Date(2026, 0, 1))).toBe(10);
  });

  it('isDateInPast compares against now', () => {
    expect(isDateInPast(new Date(2000, 0, 1))).toBe(true);
    expect(isDateInPast(new Date(2999, 0, 1))).toBe(false);
  });
});
