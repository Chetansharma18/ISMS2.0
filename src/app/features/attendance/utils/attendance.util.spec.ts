import { describe, it, expect } from 'vitest';
import type { AttendanceMark } from '../models/attendance.model';
import {
  attendancePercent,
  buildMarkIndex,
  dayStatus,
  defaultSessionDate,
  heldSessionDates,
  isLowAttendance,
  sessionDates,
  summariseAspirant,
  summariseDay
} from './attendance.util';

const mark = (overrides: Partial<AttendanceMark>): AttendanceMark => ({
  id: 'm',
  batchId: 'b',
  aspirantId: 'a1',
  date: '2026-10-05',
  slot: 'START',
  mode: 'BIOMETRIC',
  at: '2026-10-05T09:00:00.000Z',
  markedBy: 'DOITC-FP-0001',
  ...overrides
});

describe('attendance', () => {
  it('lists the session days of a batch without the Sunday off', () => {
    // 2026-10-05 is a Monday, 2026-10-11 a Sunday.
    expect(sessionDates({ startDate: '2026-10-05', endDate: '2026-10-12' })).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-12'
    ]);
    expect(sessionDates({ startDate: '', endDate: '' })).toEqual([]);
  });

  it('counts only the sessions held and opens the latest one', () => {
    const batch = { startDate: '2026-10-05', endDate: '2026-10-12' };
    expect(heldSessionDates(batch, '2026-10-07')).toHaveLength(3);
    expect(defaultSessionDate(batch, '2026-10-11')).toBe('2026-10-10');
    expect(defaultSessionDate(batch, '2026-09-01')).toBe('2026-10-05');
  });

  it('makes a day present with both marks, partial with one and absent with none', () => {
    expect(dayStatus([mark({ slot: 'START' }), mark({ slot: 'END' })])).toBe('PRESENT');
    expect(dayStatus([mark({ slot: 'START' })])).toBe('PARTIAL');
    expect(dayStatus([])).toBe('ABSENT');
  });

  it('counts an offline mark only once it is approved', () => {
    const pending = mark({ mode: 'OFFLINE', approval: 'PENDING' });
    const approved = mark({ mode: 'OFFLINE', approval: 'APPROVED' });
    const rejected = mark({ mode: 'OFFLINE', approval: 'REJECTED' });
    expect(dayStatus([pending])).toBe('PENDING');
    expect(dayStatus([approved])).toBe('PARTIAL');
    expect(dayStatus([rejected])).toBe('ABSENT');
  });

  it('works out percentages with a partial day as half', () => {
    expect(attendancePercent(8, 2, 10)).toBe(90);
    expect(attendancePercent(0, 0, 0)).toBe(0);
    expect(isLowAttendance(74.9)).toBe(true);
    expect(isLowAttendance(75)).toBe(false);
  });

  it('summarises a day and an aspirant', () => {
    const index = buildMarkIndex([
      mark({ aspirantId: 'a1', slot: 'START' }),
      mark({ aspirantId: 'a1', slot: 'END' }),
      mark({ aspirantId: 'a2', slot: 'START' }),
      mark({ aspirantId: 'a1', date: '2026-10-06', slot: 'START' }),
      mark({ aspirantId: 'a1', date: '2026-10-06', slot: 'END' })
    ]);
    const day = summariseDay(index, ['a1', 'a2', 'a3'], '2026-10-05');
    expect(day).toMatchObject({ present: 1, partial: 1, absent: 1, total: 3 });
    expect(summariseAspirant(index, 'a1', ['2026-10-05', '2026-10-06', '2026-10-07'])).toMatchObject({ present: 2, absent: 1, percent: 66.7 });
  });
});
