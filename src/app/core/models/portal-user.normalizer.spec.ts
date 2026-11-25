import { describe, it, expect } from 'vitest';
import { formatUserDate, toPortalUser, toUserPage, toUserRoleRows, userMatches } from './portal-user.normalizer';

const DTO = {
  id: 1001,
  User_id: 1001,
  SSOID: 'RJ.OFFICER1',
  name: 'Scheme OIC',
  email: 'oic@example.gov.in',
  mobile_no: '9000000001',
  designation: 'Officer',
  department: 'Skill Department',
  l: 'Jaipur',
  st: 'Rajasthan',
  created_at: '2026-11-20T04:30:00',
  last_login: null,
  roles: [{ id: 2, name: 'admin' }, { id: 1, name: 'superAdmin' }]
};

describe('portal user normalizer', () => {
  it('reads a backend user', () => {
    const user = toPortalUser(DTO);
    expect(user).toMatchObject({
      id: 1001,
      ssoId: 'RJ.OFFICER1',
      name: 'Scheme OIC',
      email: 'oic@example.gov.in',
      mobile: '9000000001',
      city: 'Jaipur',
      state: 'Rajasthan',
      lastLogin: null,
      roles: [{ id: 2, name: 'admin' }, { id: 1, name: 'superAdmin' }]
    });
    expect(toPortalUser({ id: 5, displayName: '', firstName: 'Company', lastName: '1', mobile: '9' })).toMatchObject({ name: 'Company 1', mobile: '9' });
  });

  it('reads a paged response or a plain array', () => {
    expect(toUserPage({ items: [DTO], page: 1, pageSize: 100, totalCount: 1, totalPages: 3 })).toMatchObject({ totalPages: 3 });
    expect(toUserPage({ Items: [DTO], TotalPages: 1 }).users).toHaveLength(1);
    expect(toUserPage([DTO]).users[0].id).toBe(1001);
    expect(toUserPage(null)).toEqual({ users: [], totalPages: 1 });
  });

  it('formats backend UTC dates in Indian time', () => {
    expect(formatUserDate('2026-11-20T04:30:00')).toContain('10:00');
    expect(formatUserDate('2026-11-20T04:30:00Z', false)).toBe(formatUserDate('2026-11-20T04:30:00', false));
    expect(formatUserDate(null)).toBe('-');
    expect(formatUserDate('not a date')).toBe('-');
  });

  it('matches search text against details and roles', () => {
    const user = toPortalUser(DTO);
    expect(userMatches(user, 'officer1')).toBe(true);
    expect(userMatches(user, 'SUPERADMIN')).toBe(true);
    expect(userMatches(user, 'nobody')).toBe(false);
  });

  it('groups each user into one row holding all of their roles', () => {
    const rows = toUserRoleRows([toPortalUser(DTO), toPortalUser({ id: 7, SSOID: 'RJ.NEW', name: 'Aspirant 1', roles: [] })]);
    expect(rows.map(r => [r.sNo, r.user.name, r.roles.map(x => x.name)])).toEqual([
      [1, 'Aspirant 1', []],
      [2, 'Scheme OIC', ['admin', 'superAdmin']]
    ]);
  });
});
