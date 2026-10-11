import { describe, it, expect } from 'vitest';
import { UserManagementItem } from '../../core/models/user-management.model';
import {
  roleTypeLabel,
  isTrainingPartner,
  filterUsers,
  userRowClass,
  createEmptyUserForm,
  userFormFromItem,
  isUserFormValid,
  buildUserChanges,
  buildNewUser,
  buildBlacklistConfirm,
  buildStatusConfirm
} from './user-management.util';

function makeUser(overrides: Partial<UserManagementItem> = {}): UserManagementItem {
  return {
    sNo: 1,
    id: 'u1',
    userId: 'USR-1001',
    username: 'Asha Verma',
    ssoId: 'SSO_1001',
    userType: 'Admin',
    roleType: 'mis manager',
    districtName: 'Jaipur',
    schemeStatus: 'Active',
    ...overrides
  };
}

describe('user-management.util', () => {
  it('roleTypeLabel maps known values and title-cases unknown ones', () => {
    expect(roleTypeLabel('gm')).toBe('General Manager');
    expect(roleTypeLabel('  TP ')).toBe('Training Partner');
    expect(roleTypeLabel('field agent')).toBe('Field Agent');
    expect(roleTypeLabel('')).toBe('-');
    expect(roleTypeLabel(null)).toBe('-');
  });

  it('isTrainingPartner checks userType and roleType', () => {
    expect(isTrainingPartner(makeUser({ userType: 'TP' }))).toBe(true);
    expect(isTrainingPartner(makeUser({ roleType: ' TP ' }))).toBe(true);
    expect(isTrainingPartner(makeUser())).toBe(false);
  });

  it('filterUsers applies blacklist filter, role filter and search', () => {
    const a = makeUser();
    const b = makeUser({ id: 'u2', userId: 'USR-1002', username: 'Ravi Kumar', ssoId: 'SSO_1002', roleType: 'tp', userType: 'TP', schemeStatus: 'Blacklisted' });
    const list = [a, b];

    expect(filterUsers(list, 'all', '')).toEqual(list);
    expect(filterUsers(list, 'blacklisted', '')).toEqual([b]);
    expect(filterUsers(list, 'tp', '')).toEqual([b]);
    expect(filterUsers(list, 'department', '')).toEqual([a]);
    expect(filterUsers(list, 'all', 'ravi')).toEqual([b]);
    expect(filterUsers(list, 'all', 'general')).toEqual([]);
    expect(filterUsers(list, 'all', 'training partner')).toEqual([b]);
  });

  it('userRowClass styles blacklisted, inactive and active rows', () => {
    expect(userRowClass({ schemeStatus: 'Blacklisted' })).toBe('bg-rose-50/60 transition-colors');
    expect(userRowClass({ schemeStatus: 'Inactive' })).toBe('opacity-50 bg-slate-50 transition-colors');
    expect(userRowClass({ schemeStatus: 'Active' })).toBe('bg-white transition-colors');
  });

  it('createEmptyUserForm and userFormFromItem build form state', () => {
    const empty = createEmptyUserForm('USR-1005');
    expect(empty.userId).toBe('USR-1005');
    expect(empty.roleType).toBe('');
    expect(empty.district).toBe('Jaipur');

    const form = userFormFromItem(makeUser({ username: 'Asha Devi Verma' }));
    expect(form.firstName).toBe('Asha');
    expect(form.lastName).toBe('Devi Verma');
    expect(form.email).toBe('AshaDeviVerma@isms.gov.in');
    expect(form.mobileNo).toBe('9829012345');
    expect(form.blockName).toBe('All Blocks');
  });

  it('isUserFormValid requires the mandatory fields', () => {
    const form = userFormFromItem(makeUser());
    expect(isUserFormValid(form)).toBe(true);
    expect(isUserFormValid({ ...form, ssoId: '   ' })).toBe(false);
    expect(isUserFormValid({ ...form, roleType: '' })).toBe(false);
    expect(isUserFormValid(createEmptyUserForm())).toBe(false);
  });

  it('buildUserChanges and buildNewUser trim and compose the payload', () => {
    const form = { ...userFormFromItem(makeUser()), firstName: ' Asha ', lastName: ' Verma ', ssoId: ' SSO_9 ' };
    const changes = buildUserChanges(form);
    expect(changes.username).toBe('Asha Verma');
    expect(changes.ssoId).toBe('SSO_9');
    expect(changes.districtName).toBe('Jaipur');

    const created = buildNewUser(form, 'usr-1');
    expect(created.id).toBe('usr-1');
    expect(created.sNo).toBe(1);
    expect(created.schemeStatus).toBe('Active');
    expect(created.username).toBe('Asha Verma');
  });

  it('confirm builders describe the requested action', () => {
    const tp = makeUser({ userType: 'TP', roleType: 'tp' });
    const block = buildBlacklistConfirm(tp);
    expect(block.title).toBe('Mark as Blacklisted');
    expect(block.accentBarClass).toBe('bg-rose-600');

    const restore = buildBlacklistConfirm({ ...tp, schemeStatus: 'Blacklisted' });
    expect(restore.title).toBe('Remove from Blacklist');
    expect(restore.confirmLabel).toBe('Yes, Remove Blacklist');

    expect(buildStatusConfirm(makeUser()).confirmLabel).toBe('Mark Inactive');
    expect(buildStatusConfirm(tp).confirmLabel).toBe('Mark Blacklisted');
  });
});
