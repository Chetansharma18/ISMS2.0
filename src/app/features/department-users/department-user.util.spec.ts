import { describe, it, expect } from 'vitest';
import {
  departmentUserFormError,
  namesOf,
  toDepartmentUser,
  toDepartmentUserForm,
  toDepartmentUserPage,
  toDepartmentUserRequest
} from './department-user.util';

const DTO = {
  id: 4,
  sso_id: 'RJ.OFFICER2',
  assign_role_type_id: 2,
  roleName: 'admin',
  asocit_with_user_id: 1000,
  associatedWithUserName: 'Super Administrator',
  associatedWithUserSsoId: 'admin',
  user_created_by_user_id: 1000,
  createdByUserName: 'Super Administrator',
  role_assigned_by_user_id: [{ roleId: 2, roleName: 'admin', assignedByUserId: 1000, assignedBySsoId: 'admin', assignedAt: '2026-11-24T08:00:00', remarks: 'Initial' }],
  designation_id: 3,
  designation_name: 'Joint Director',
  scheme_ids: [5, 6],
  scheme_id: 5,
  schemeName: 'MMKVY',
  district_ids: [],
  district_id: 9,
  block_ids: null,
  user_activation_statu: false,
  created_at: '2026-11-24T08:00:00'
};

describe('department user util', () => {
  it('reads a backend department user', () => {
    const user = toDepartmentUser(DTO);
    expect(user).toMatchObject({
      id: 4,
      ssoId: 'RJ.OFFICER2',
      roleId: 2,
      roleName: 'admin',
      associatedUserId: 1000,
      designationId: 3,
      designationName: 'Joint Director',
      schemeIds: [5, 6],
      // The single primary id fills an empty list.
      districtIds: [9],
      blockIds: [],
      active: false
    });
    expect(user.roleHistory[0]).toMatchObject({ roleName: 'admin', assignedBySsoId: 'admin', remarks: 'Initial' });
    expect(user).toMatchObject({ existsInPortal: null, portalUserId: null });
    expect(toDepartmentUser({ ...DTO, user_id: 1005, user_exists_in_base: true })).toMatchObject({ existsInPortal: true, portalUserId: 1005 });
  });

  it('reads a paged response', () => {
    expect(toDepartmentUserPage({ items: [DTO], totalPages: 3 })).toMatchObject({ totalPages: 3 });
    expect(toDepartmentUserPage([DTO]).users).toHaveLength(1);
    expect(toDepartmentUserPage(null)).toEqual({ users: [], totalPages: 1 });
  });

  it('validates the form like the backend', () => {
    const form = toDepartmentUserForm(null, '1000');
    expect(departmentUserFormError(form)).toBe('Enter the SSO ID.');
    expect(departmentUserFormError({ ...form, ssoId: 'RJ OFFICER' })).toContain('can only contain');
    expect(departmentUserFormError({ ...form, ssoId: 'RJ.OFFICER' })).toBe('Select the role to assign.');
    expect(departmentUserFormError({ ...form, ssoId: 'RJ.OFFICER', roleId: '2', associatedUserId: '' })).toContain('associated');
    expect(departmentUserFormError({ ...form, ssoId: 'RJ.OFFICER', roleId: '2' })).toBeNull();
  });

  it('builds the request body with id lists', () => {
    const form = { ...toDepartmentUserForm(toDepartmentUser(DTO)), schemeIds: ['6', '6', 'x'], remarks: ' Moved to MMKVY ' };
    expect(toDepartmentUserRequest(form)).toEqual({
      sso_id: 'RJ.OFFICER2',
      assign_role_type_id: 2,
      asocit_with_user_id: 1000,
      designation_id: 3,
      scheme_ids: [6],
      district_ids: [9],
      block_ids: [],
      remarks: 'Moved to MMKVY'
    });
    const noDesignation = toDepartmentUserRequest({ ...form, designationId: '' }, '');
    expect(noDesignation['designation_id']).toBeUndefined();
    expect(noDesignation['designation_name']).toBe('');
  });

  it('names ids from a lookup', () => {
    expect(namesOf([1, 2], new Map([[1, 'Jaipur']]))).toEqual(['Jaipur', '#2']);
  });
});
