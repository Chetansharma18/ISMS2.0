import { describe, it, expect } from 'vitest';
import {
  landingRouteFor,
  resolveSessionRole,
  roleNamesOf,
  selectableRolesOf,
  toPersona,
  toPortalRole,
  toTwoStepMethods
} from './sso-session.util';

describe('sso-session util', () => {
  it('maps the backend role names to portal roles', () => {
    expect(toPortalRole('superAdmin')).toBe('super_admin');
    expect(toPortalRole('Super Admin')).toBe('super_admin');
    expect(toPortalRole('admin')).toBe('dept_admin');
    expect(toPortalRole('Tp')).toBe('existing_user');
    expect(toPortalRole('User')).toBe('new_user');
    expect(toPortalRole('something-new')).toBe('new_user');
    expect(toPortalRole(undefined)).toBe('new_user');
  });

  it('reads roles given as names or as { id, name }', () => {
    expect(roleNamesOf({ id: 1, SSOID: 'a', roles: ['admin', { id: 3, name: 'Tp' }] })).toEqual(['admin', 'Tp']);
    expect(selectableRolesOf({ id: 1, SSOID: 'a', roles: ['admin', { id: 3, name: 'Tp' }] })).toEqual([{ id: 3, name: 'Tp' }]);
    expect(roleNamesOf(null)).toEqual([]);
  });

  it('uses the chosen role, else the most privileged one', () => {
    expect(resolveSessionRole(['Tp', 'admin'], 'Tp')).toBe('existing_user');
    expect(resolveSessionRole(['Tp', 'admin'])).toBe('dept_admin');
    expect(resolveSessionRole([])).toBe('new_user');
  });

  it('builds a persona with the role label and profile state', () => {
    expect(toPersona({ id: 7, SSOID: 'RJ.USER', name: 'Company 1' }, 'existing_user')).toEqual({
      id: '7',
      ssoId: 'RJ.USER',
      label: 'Company 1',
      subLabel: 'Registered TP/PIA',
      role: 'existing_user',
      isProfileComplete: true
    });
    expect(toPersona({ id: 8, SSOID: 'RJ.NEW' }, 'new_user')).toMatchObject({ label: 'RJ.NEW', isProfileComplete: false });
  });

  it('lands each role on its home screen', () => {
    expect(landingRouteFor('super_admin').path).toBe('/admin/eoi-configuration');
    expect(landingRouteFor('dept_admin').path).toBe('/admin/eoi-view');
    expect(landingRouteFor('existing_user')).toEqual({ path: '/tenders', queryParams: { fromLogin: 'true' } });
  });

  it('keeps only the second-factor methods the portal supports', () => {
    expect(toTwoStepMethods(['pin', 'OTP', 'TOTP'])).toEqual(['OTP', 'PIN']);
    expect(toTwoStepMethods(undefined)).toEqual([]);
  });
});
