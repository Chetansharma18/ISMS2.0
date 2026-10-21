import type { CourseMasterItem } from '../../../../core/models/admin-masters.model';
import type { BatchRecord } from '../../models/batch.model';
import { courseDetailsOf, masterFor, sumHours } from './course-details.util';

function master(overrides: Partial<CourseMasterItem> = {}): CourseMasterItem {
  return {
    sNo: 1,
    id: 'c1',
    sector: 'Retail',
    jobRoleName: 'Retail Sales Associate',
    jobRoleCode: 'RAS/Q0104',
    version: '2.0',
    nsqfLevel: '4',
    commonNormsCategory: 'A',
    theoryDurationHours: 120,
    practicalOjtDurationHours: '120+40',
    itSoftSkillTrainingHours: 20,
    totalQpHours: 300,
    courseValidUpToDate: '2030-01-01',
    remark: 'Valid',
    ...overrides
  };
}

const batch = {
  courseName: 'Retail Sales Associate',
  qpCode: 'RAS/Q0104',
  courseVersion: 'v1',
  totalHours: 280,
  theoryHours: 100,
  practicalHours: 150,
  softSkillHours: 30
} as BatchRecord;

describe('course details', () => {
  it('adds up hours written as a sum', () => {
    expect(sumHours('180+60')).toBe(240);
    expect(sumHours('15')).toBe(15);
  });

  it('prefers a valid version of the course in the Course Master', () => {
    const lapsed = master({ id: 'old', version: '1.0', remark: 'Expired' });
    const valid = master({ id: 'new' });
    expect(masterFor(batch, [valid, lapsed])?.id).toBe('new');
    expect(masterFor(batch, [lapsed])?.id).toBe('old');
    expect(masterFor(batch, [])).toBeUndefined();
  });

  it('reads the details from the Course Master like the Create Batch form', () => {
    expect(courseDetailsOf(batch, [master()])).toEqual({
      qpCode: 'RAS/Q0104',
      version: '2.0',
      nsqfLevel: '4',
      totalHours: '300',
      theoryHours: '120',
      practicalHours: '120+40 = 160',
      softSkillHours: '20'
    });
  });

  it('falls back to what the batch saved, with no NSQF level', () => {
    expect(courseDetailsOf(batch, [])).toEqual({
      qpCode: 'RAS/Q0104',
      version: 'v1',
      nsqfLevel: '—',
      totalHours: '280',
      theoryHours: '100',
      practicalHours: '150',
      softSkillHours: '30'
    });
  });
});
