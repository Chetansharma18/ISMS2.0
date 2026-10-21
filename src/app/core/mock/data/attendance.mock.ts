import { INITIAL_ASPIRANTS } from './aspirants.mock';
import type { AttendanceMark, AttendanceSlot, BiometricDevice } from '../../../features/attendance/models/attendance.model';
import { sessionDates, toIsoDate } from '../../../features/attendance/utils/attendance.util';

/** The approved sample batch B-26-0001 has attendance from the start of the batch up to the day before today. */
const DEMO_BATCH = { id: 'batch-201', startDate: '2026-09-01', endDate: '2026-11-30' };
const DEVICE_SERIAL = 'DOITC-FP-0001';

/** A repeatable number between 0 and 1 for a pair of numbers, so the sample data is the same on every run. */
function chance(a: number, b: number): number {
  let x = Math.imul(a + 1, 374761393) ^ Math.imul(b + 7, 668265263);
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

function mark(aspirantId: string, date: string, slot: AttendanceSlot, offline: boolean, minute: number): AttendanceMark {
  const time = slot === 'START' ? `09:${String(minute).padStart(2, '0')}:00` : `16:${String(50 + (minute % 10)).padStart(2, '0')}:00`;
  return {
    id: `${DEMO_BATCH.id}|${aspirantId}|${date}|${slot}`,
    batchId: DEMO_BATCH.id,
    aspirantId,
    date,
    slot,
    mode: offline ? 'OFFLINE' : 'BIOMETRIC',
    at: `${date}T${time}`,
    markedBy: offline ? 'Faculty 1' : DEVICE_SERIAL,
    ...(offline
      ? {
          reason: 'Biometric device was not working',
          approval: 'APPROVED' as const,
          decidedBy: 'Attender 1',
          decidedAt: `${date}T17:30:00`
        }
      : {})
  };
}

function buildMarks(): AttendanceMark[] {
  const today = toIsoDate(new Date());
  const roster = INITIAL_ASPIRANTS.filter(a => a.batchId === DEMO_BATCH.id).map(a => a.id);
  const dates = sessionDates(DEMO_BATCH).filter(date => date < today);
  const marks: AttendanceMark[] = [];

  roster.forEach((aspirantId, i) => {
    // Each aspirant has an own attendance habit between about 72% and 98%.
    const rate = 0.72 + 0.26 * chance(i, 999);
    dates.forEach((date, d) => {
      const roll = chance(i, d);
      const offline = chance(i, d + 500) < 0.03;
      const minute = Math.floor(chance(i + 3, d) * 25);
      if (roll < rate) {
        marks.push(mark(aspirantId, date, 'START', offline, minute), mark(aspirantId, date, 'END', false, minute));
      } else if (roll < rate + 0.06) {
        marks.push(mark(aspirantId, date, chance(i, d + 9) < 0.5 ? 'START' : 'END', false, minute));
      }
    });
  });

  // The latest session has three aspirants whose offline marks wait for the Attender User's approval.
  const latest = dates[dates.length - 1];
  if (latest) {
    const waiting = new Set(roster.slice(0, 3));
    const kept = marks.filter(m => !(m.date === latest && waiting.has(m.aspirantId)));
    for (const aspirantId of waiting) {
      for (const slot of ['START', 'END'] as const) {
        kept.push({
          ...mark(aspirantId, latest, slot, true, 10),
          approval: 'PENDING',
          decidedBy: undefined,
          decidedAt: undefined
        });
      }
    }
    return kept;
  }
  return marks;
}

export const INITIAL_ATTENDANCE_MARKS: AttendanceMark[] = buildMarks();

export const INITIAL_ATTENDANCE_DEVICES: BiometricDevice[] = [
  {
    batchId: DEMO_BATCH.id,
    serialNo: DEVICE_SERIAL,
    type: 'Fingerprint',
    model: 'DoITC Fingerprint Terminal',
    linkedBy: 'Attender 1',
    linkedAt: '2026-09-01T08:30:00.000Z'
  }
];
