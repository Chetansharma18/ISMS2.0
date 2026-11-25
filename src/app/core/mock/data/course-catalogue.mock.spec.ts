import { describe, it, expect } from 'vitest';
import { buildCourseCatalogue } from './course-catalogue.mock';
import { SKILL_SECTORS, SKILL_SECTOR_NAMES } from '../../config/sector.config';

/** Sums the "180+60" style practical + OJT duration; unknown shapes (e.g. "NA") count as 0. */
function practicalHours(value: string): number {
  return value
    .replace(/\(OJT\)/g, '')
    .split(/[+_]/)
    .map(part => Number(part.trim()))
    .filter(n => !Number.isNaN(n))
    .reduce((sum, n) => sum + n, 0);
}

describe('Course catalogue (official Course List, effective 18-Aug-2026)', () => {
  const courses = buildCourseCatalogue();

  it('contains all 568 numbered rows with unique ids', () => {
    expect(courses.length).toBe(568);
    expect(courses.map(c => c.sNo)).toEqual(Array.from({ length: 568 }, (_, i) => i + 1));
    expect(new Set(courses.map(c => c.id)).size).toBe(568);
  });

  it('starts and ends on the documented rows', () => {
    expect(courses[0].jobRoleCode).toBe('AAS/Q6301');
    expect(courses[0].sector).toBe('Aerospace and Aviation');
    expect(courses[567].jobRoleCode).toBe('THC/Q4407');
    expect(courses[567].jobRoleName).toBe('Tour Guide');
    expect(courses[567].remark).toBe('Modify version – course hours changed (previously 760)');
  });

  it('uses only sectors that exist in the sector list, and every sector has courses', () => {
    const used = new Set(courses.map(c => c.sector));
    for (const name of used) expect(SKILL_SECTOR_NAMES).toContain(name);
    for (const name of SKILL_SECTOR_NAMES) expect(used.has(name)).toBe(true);
    expect(SKILL_SECTORS.length).toBe(35);
  });

  it('fills every field, carrying the course name and code onto newer versions', () => {
    for (const c of courses) {
      expect(c.jobRoleName, `row ${c.sNo} name`).not.toBe('');
      expect(c.jobRoleCode, `row ${c.sNo} code`).not.toBe('');
      expect(c.remark, `row ${c.sNo} remark`).not.toBe('');
      expect(c.itSoftSkillTrainingHours).toBe(100);
    }
    expect(courses[1].jobRoleName).toBe('Drone Operator - Multi Rotor');
    expect(courses[1].jobRoleCode).toBe('AAS/Q6301');
  });

  it('expands the remark shorthand', () => {
    expect(courses[0].remark).toBe('Expired');
    expect(courses[1].remark).toBe('New Version');
    expect(courses[2].remark).toBe('Not Valid');
    expect(courses[8].remark).toBe('Modify version – course hours changed (previously 550)');
    expect(courses.filter(c => c.remark === 'New Course').length).toBe(22);
  });

  it('keeps total QP hours = theory + practical/OJT + IT & soft skills, except rows where the source PDF itself does not add up', () => {
    // These nine rows are printed in the official PDF with totals that differ from the sum of
    // their own components. They are kept exactly as published; every other row is consistent.
    const SOURCE_PDF_INCONSISTENT = [55, 79, 119, 214, 226, 274, 283, 300, 450];

    const mismatches = courses
      .filter(c => c.theoryDurationHours !== 'NA' && c.practicalOjtDurationHours !== 'NA')
      .filter(c => Number(c.theoryDurationHours) + practicalHours(c.practicalOjtDurationHours) + c.itSoftSkillTrainingHours !== c.totalQpHours)
      .map(c => c.sNo);
    expect(mismatches).toEqual(SOURCE_PDF_INCONSISTENT);
  });
});
