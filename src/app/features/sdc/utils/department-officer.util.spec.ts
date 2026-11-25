import { describe, it, expect } from 'vitest';
import { departmentOfficer, officerName, SCRUTINY_OFFICER_DESIGNATION } from './department-officer.util';

describe('department-officer.util', () => {
  it('names an officer after the office, with a number from 1 to 5', () => {
    expect(officerName('Department Scrutiny Officer', '')).toBe('Scrutiny Officer 1');
    expect(officerName('Joint Director', '')).toBe('Joint Director 1');
    expect(officerName('Joint Director', 'dept_user')).toMatch(/^Joint Director [1-5]$/);
  });

  it('gives the same officer to the same user every time', () => {
    expect(departmentOfficer('dept_user')).toEqual(departmentOfficer('dept_user'));
  });

  it('holds the scrutiny officer designation by default', () => {
    expect(departmentOfficer('dept_user').designation).toBe(SCRUTINY_OFFICER_DESIGNATION);
    expect(departmentOfficer('dept_user', 'Joint Director').designation).toBe('Joint Director');
  });
});
