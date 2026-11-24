import { describe, it, expect } from 'vitest';
import { toRoleRequest, toTablePermissionRequest, toUserRoleItem } from './role.normalizer';

const BACKEND_ROLE = {
  id: 2,
  name: 'admin',
  description: 'Department administrator',
  isActive: true,
  userCount: 3,
  permissions: [
    {
      id: 11,
      roleId: 2,
      tableName: 'SectorMasters',
      status: true,
      methodAllowGet: true,
      methodAllowPost: true,
      methodAllowPut: false,
      methodAllowDelete: false,
      enableInMenu: true,
      menuCallingName: ' Sectors '
    }
  ]
};

describe('role normalizer', () => {
  it('reads a backend role with its table permissions', () => {
    const role = toUserRoleItem(BACKEND_ROLE, 0);
    expect(role).toMatchObject({ sNo: 1, id: '2', roleTypeName: 'admin', status: 'Active', description: 'Department administrator', userCount: 3 });
    expect(role.permissions).toEqual([]);
    expect(role.tablePermissions).toEqual([
      { id: 11, roleId: 2, tableName: 'SectorMasters', status: true, get: true, post: true, put: false, delete: false, enableInMenu: true, menuCallingName: 'Sectors' }
    ]);
    expect(toUserRoleItem({ ...BACKEND_ROLE, isActive: false }).status).toBe('Inactive');
  });

  it('still reads the old mock shape', () => {
    const role = toUserRoleItem({ id: 'r1', roleTypeName: 'Scheme OIC', permissions: ['View'], status: 'Inactive' }, 4);
    expect(role).toMatchObject({ sNo: 5, id: 'r1', roleTypeName: 'Scheme OIC', permissions: ['View'], status: 'Inactive', tablePermissions: [] });
  });

  it('builds the create/update body, keeping current values on a status change', () => {
    const current = toUserRoleItem(BACKEND_ROLE);
    expect(toRoleRequest({ roleTypeName: ' auditor ', description: '' })).toEqual({ name: 'auditor', description: null, isActive: true });
    expect(toRoleRequest({ status: 'Inactive' }, current)).toEqual({ name: 'admin', description: 'Department administrator', isActive: false });
  });

  it('builds a table permission request', () => {
    expect(
      toTablePermissionRequest({ tableName: 'News', status: true, get: true, post: false, put: true, delete: false, enableInMenu: false, menuCallingName: '  ' })
    ).toEqual({
      tableName: 'News',
      status: true,
      methodAllowGet: true,
      methodAllowPost: false,
      methodAllowPut: true,
      methodAllowDelete: false,
      enableInMenu: false,
      menuCallingName: null
    });
  });
});
