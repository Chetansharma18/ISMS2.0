import { describe, it, expect } from 'vitest';
import { toUserRoleItem } from '../../core/models/role.normalizer';
import { filterPermissionRows, toGrantableTables, toPermissionRows } from './role-permissions.util';

const perm = (id: number, roleId: number, tableName: string, extra: Record<string, unknown> = {}) => ({
  id,
  roleId,
  tableName,
  status: true,
  methodAllowGet: true,
  methodAllowPost: false,
  methodAllowPut: false,
  methodAllowDelete: false,
  enableInMenu: false,
  menuCallingName: null,
  ...extra
});

const ROLES = [
  toUserRoleItem({ id: 1, name: 'superAdmin', isActive: true, permissions: [perm(2, 1, 'Users'), perm(1, 1, 'News', { menuCallingName: 'Notices' })] }),
  toUserRoleItem({ id: 2, name: 'admin', isActive: true, permissions: [perm(3, 2, 'SectorMasters')] })
];

describe('role permissions', () => {
  it('flattens each role into one row per table, numbered in order', () => {
    const rows = toPermissionRows(ROLES);
    expect(rows.map(r => [r.sNo, r.roleName, r.tableName])).toEqual([
      [1, 'superAdmin', 'News'],
      [2, 'superAdmin', 'Users'],
      [3, 'admin', 'SectorMasters']
    ]);
    expect(rows[2]).toMatchObject({ key: '2/SectorMasters', tableLabel: 'Sector Masters', roleId: 2 });
  });

  it('filters by role and by role, table or menu name', () => {
    const rows = toPermissionRows(ROLES);
    expect(filterPermissionRows(rows, '2', '').map(r => r.tableName)).toEqual(['SectorMasters']);
    expect(filterPermissionRows(rows, 'all', 'notices').map(r => r.tableName)).toEqual(['News']);
    expect(filterPermissionRows(rows, 'all', 'sector master').map(r => r.tableName)).toEqual(['SectorMasters']);
  });

  it('reads the table list, dropping duplicates and empty names', () => {
    const tables = toGrantableTables([
      { id: 1, table_name: 'Users', tableName: 'Users', description: 'Accounts' },
      { id: 2, tableName: 'AuditLogs' },
      { id: 3, tableName: 'users' },
      { id: 4, tableName: '' }
    ]);
    expect(tables).toEqual([
      { tableName: 'AuditLogs', label: 'Audit Logs', description: '' },
      { tableName: 'Users', label: 'Users', description: 'Accounts' }
    ]);
    expect(toGrantableTables({ data: [{ tableName: 'News' }] }).map(t => t.tableName)).toEqual(['News']);
    expect(toGrantableTables(null)).toEqual([]);
  });
});
