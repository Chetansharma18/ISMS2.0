import type { AttendanceMark, AttendanceSlot, DayStatus } from '../models/attendance.model';

/** An aspirant below this attendance percentage is flagged. */
export const MIN_ATTENDANCE_PERCENT = 75;

/** Days with no session (0 = Sunday). */
export const WEEKLY_OFF_DAYS: readonly number[] = [0];

/** A day that is only half marked (one of the two marks) counts for this much of a day. */
export const PARTIAL_DAY_WEIGHT = 0.5;

/** yyyy-mm-dd of a date, in local time. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseIso(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Every session day of a batch, from its start date to its end date, without the weekly off. */
export function sessionDates(batch: { startDate?: string; endDate?: string }): string[] {
  const start = parseIso(batch.startDate ?? '');
  const end = parseIso(batch.endDate ?? '');
  if (!start || !end || end < start) return [];
  const dates: string[] = [];
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    if (!WEEKLY_OFF_DAYS.includes(day.getDay())) dates.push(toIsoDate(day));
  }
  return dates;
}

/** The session days up to and including `today`. */
export function heldSessionDates(batch: { startDate?: string; endDate?: string }, today: string): string[] {
  return sessionDates(batch).filter(date => date <= today);
}

/** The session day to open first: the latest one up to today, or the first one when the batch has not started. */
export function defaultSessionDate(batch: { startDate?: string; endDate?: string }, today: string): string {
  const dates = sessionDates(batch);
  const held = dates.filter(date => date <= today);
  return held[held.length - 1] ?? dates[0] ?? today;
}

/** A mark counts when it came from the device, or when it is an offline mark the Attender User approved. */
export function countsAsMarked(mark: AttendanceMark): boolean {
  return mark.mode === 'BIOMETRIC' || mark.approval === 'APPROVED';
}

/** Marks by aspirant and day, for quick lookups. */
export type MarkIndex = Map<string, AttendanceMark[]>;

const keyOf = (aspirantId: string, date: string): string => `${aspirantId}|${date}`;

export function buildMarkIndex(marks: readonly AttendanceMark[]): MarkIndex {
  const index: MarkIndex = new Map();
  for (const mark of marks) {
    const key = keyOf(mark.aspirantId, mark.date);
    const list = index.get(key);
    if (list) list.push(mark);
    else index.set(key, [mark]);
  }
  return index;
}

export function marksOfDay(index: MarkIndex, aspirantId: string, date: string): AttendanceMark[] {
  return index.get(keyOf(aspirantId, date)) ?? [];
}

/** The mark of a slot that is still in play (counted or waiting for approval); a rejected one is not. */
export function liveMark(marks: readonly AttendanceMark[], slot: AttendanceSlot): AttendanceMark | undefined {
  return marks.find(mark => mark.slot === slot && mark.approval !== 'REJECTED');
}

/**
 * Both marks of the day: present. One mark: partial. None: absent, or pending when an offline mark waits for approval.
 */
export function dayStatus(marks: readonly AttendanceMark[]): DayStatus {
  const counted = new Set(marks.filter(countsAsMarked).map(mark => mark.slot));
  if (counted.has('START') && counted.has('END')) return 'PRESENT';
  if (counted.size === 1) return 'PARTIAL';
  return marks.some(mark => mark.approval === 'PENDING') ? 'PENDING' : 'ABSENT';
}

/** Attendance percentage with one decimal; a partial day counts for half. */
export function attendancePercent(present: number, partial: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round(((present + PARTIAL_DAY_WEIGHT * partial) / total) * 1000) / 10;
}

export interface DaySummary {
  present: number;
  partial: number;
  absent: number;
  pending: number;
  total: number;
  percent: number;
}

/** How a session day went for the given aspirants. */
export function summariseDay(index: MarkIndex, aspirantIds: readonly string[], date: string): DaySummary {
  const summary: DaySummary = { present: 0, partial: 0, absent: 0, pending: 0, total: aspirantIds.length, percent: 0 };
  for (const id of aspirantIds) {
    const status = dayStatus(marksOfDay(index, id, date));
    if (status === 'PRESENT') summary.present++;
    else if (status === 'PARTIAL') summary.partial++;
    else if (status === 'PENDING') summary.pending++;
    else summary.absent++;
  }
  summary.percent = attendancePercent(summary.present, summary.partial, summary.total);
  return summary;
}

export interface AspirantSummary {
  present: number;
  partial: number;
  absent: number;
  pending: number;
  held: number;
  percent: number;
}

/** How one aspirant did over the given session days. */
export function summariseAspirant(index: MarkIndex, aspirantId: string, dates: readonly string[]): AspirantSummary {
  const summary: AspirantSummary = { present: 0, partial: 0, absent: 0, pending: 0, held: dates.length, percent: 0 };
  for (const date of dates) {
    const status = dayStatus(marksOfDay(index, aspirantId, date));
    if (status === 'PRESENT') summary.present++;
    else if (status === 'PARTIAL') summary.partial++;
    else if (status === 'PENDING') summary.pending++;
    else summary.absent++;
  }
  summary.percent = attendancePercent(summary.present, summary.partial, summary.held);
  return summary;
}

export function isLowAttendance(percent: number): boolean {
  return percent < MIN_ATTENDANCE_PERCENT;
}

/** Day status in words. */
export const DAY_STATUS_LABEL: Record<DayStatus, string> = {
  PRESENT: 'Present',
  PARTIAL: 'Partial',
  ABSENT: 'Absent',
  PENDING: 'Pending approval'
};

/** Colour of the day status text (the same palette as the other statuses). */
export function dayStatusClass(status: DayStatus): string {
  switch (status) {
    case 'PRESENT':
      return 'text-emerald-700';
    case 'PARTIAL':
      return 'text-amber-700';
    case 'PENDING':
      return 'text-sky-700';
    default:
      return 'text-red-600';
  }
}

/** HH:mm of an ISO date-time, in local time. */
export function timeOf(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** The words of the messages sent to aspirants. */
export function reminderText(name: string, batchCode: string, date: string, startTime: string): string {
  return `Dear ${name}, reminder: your training in batch ${batchCode} on ${date} starts at ${startTime}. Please mark your attendance at the start and the end of the day.`;
}

export function confirmationText(name: string, batchCode: string, date: string, slot: AttendanceSlot): string {
  return `Dear ${name}, your ${slot === 'START' ? 'start-of-day' : 'end-of-day'} attendance for batch ${batchCode} on ${date} is recorded.`;
}

export function absentText(name: string, batchCode: string, date: string): string {
  return `Dear ${name}, you were marked absent in batch ${batchCode} on ${date}. If this is a mistake, contact your Attender User.`;
}
