/** A department officer as shown in remarks and trails: a neutral name and the designation of the office held. */
export interface DepartmentOfficer {
  name: string;
  designation: string;
}

/** Designation of the officers who scrutinise an SDC. */
export const SCRUTINY_OFFICER_DESIGNATION = 'Department Scrutiny Officer';

/**
 * A neutral name for an officer holding `designation` ("Scrutiny Officer 3", "Joint Director 1"). The number comes from
 * the SSO ID of the signed-in user, so the same user is always the same officer. No real name is ever shown.
 */
export function officerName(designation: string, ssoId = ''): string {
  let sum = 0;
  for (const ch of ssoId) sum += ch.charCodeAt(0);
  const title = designation.replace(/^Department\s+/i, '').trim() || 'Officer';
  return `${title} ${(sum % 5) + 1}`;
}

/** The officer who acts for the signed-in user at the given office. */
export function departmentOfficer(ssoId = '', designation: string = SCRUTINY_OFFICER_DESIGNATION): DepartmentOfficer {
  return { name: officerName(designation, ssoId), designation };
}
