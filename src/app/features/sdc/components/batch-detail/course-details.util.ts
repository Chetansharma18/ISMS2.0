import type { CourseMasterItem } from '../../../../core/models/admin-masters.model';
import type { BatchRecord } from '../../models/batch.model';

/** The course details the Create Batch form shows, as read-only text ("—" when a value is not known). */
export interface CourseDetails {
  qpCode: string;
  version: string;
  nsqfLevel: string;
  totalHours: string;
  theoryHours: string;
  practicalHours: string;
  softSkillHours: string;
}

const NONE = '—';

/** A course version that has lapsed (expired or no longer valid) in the Course Master. */
function isLapsed(course: CourseMasterItem): boolean {
  return course.remark === 'Expired' || course.remark === 'Not Valid';
}

/** "180+60" gives 240; a plain "15" gives 15. */
export function sumHours(text: string): number {
  return text.split('+').reduce((total, part) => total + (Number(part.trim()) || 0), 0);
}

function same(a?: string, b?: string): boolean {
  return (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();
}

/** Course Master record of the batch's course: by QP code first, then by name; a valid version is preferred over a lapsed one. */
export function masterFor(b: BatchRecord, masters: readonly CourseMasterItem[]): CourseMasterItem | undefined {
  const name = b.courseName || b.course;
  const matches = masters.filter(c => (!!b.qpCode && same(c.jobRoleCode, b.qpCode)) || same(c.jobRoleName, name));
  const current = matches.filter(c => !isLapsed(c));
  const pool = current.length > 0 ? current : matches;
  return pool[pool.length - 1];
}

function text(value: string | number | null | undefined): string {
  return value == null || value === '' || value === 0 ? NONE : String(value);
}

/**
 * Same values as the Create Batch form: from the Course Master when it has the course, else from what was saved on
 * the batch (the Course Master has the NSQF level; the batch does not keep it).
 */
export function courseDetailsOf(b: BatchRecord, masters: readonly CourseMasterItem[]): CourseDetails {
  const master = masterFor(b, masters);
  if (master) {
    const practical = String(master.practicalOjtDurationHours ?? '');
    return {
      qpCode: text(master.jobRoleCode),
      version: text(master.version),
      nsqfLevel: text(master.nsqfLevel),
      totalHours: text(Number(master.totalQpHours) || 0),
      theoryHours: text(typeof master.theoryDurationHours === 'number' ? master.theoryDurationHours : null),
      practicalHours: text(practical.includes('+') ? `${practical} = ${sumHours(practical)}` : practical),
      softSkillHours: text(master.itSoftSkillTrainingHours)
    };
  }
  return {
    qpCode: text(b.qpCode),
    version: text(b.courseVersion),
    nsqfLevel: NONE,
    totalHours: text(b.totalHours || b.batchDurationHours),
    theoryHours: text(b.theoryHours),
    practicalHours: text(b.practicalHours),
    softSkillHours: text(b.softSkillHours)
  };
}
