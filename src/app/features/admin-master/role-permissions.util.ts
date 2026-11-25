import type { RoleTablePermission, UserRoleMasterItem } from '../../core/models/admin-masters.model';
import { humanizeTableName } from '../../core/permissions/permitted-tables.util';

/** One row of the Role Permissions table: a role's grant on one backend table. */
export interface PermissionRow extends RoleTablePermission {
  /** Unique row key: `${roleId}/${tableName}`. */
  key: string;
  sNo: number;
  roleName: string;
  tableLabel: string;
}

/** A backend table a permission can be granted on (GET /api/tablelist). */
export interface GrantableTable {
  tableName: string;
  label: string;
  description: string;
}

/** Every role's table permissions as table rows, ordered by role then table, numbered from 1. */
export function toPermissionRows(roles: readonly UserRoleMasterItem[]): PermissionRow[] {
  const rows: PermissionRow[] = [];
  for (const role of roles) {
    const roleId = Number(role.id);
    const perms = [...(role.tablePermissions ?? [])].sort((a, b) => a.tableName.localeCompare(b.tableName));
    for (const perm of perms) {
      rows.push({
        ...perm,
        roleId: perm.roleId || roleId,
        key: `${perm.roleId || roleId}/${perm.tableName}`,
        sNo: 0,
        roleName: role.roleTypeName,
        tableLabel: humanizeTableName(perm.tableName)
      });
    }
  }
  return rows.map((row, i) => ({ ...row, sNo: i + 1 }));
}

/** The GET /api/tablelist response as grantable tables (array, or wrapped in `{ data }`), sorted by label. */
export function toGrantableTables(response: unknown): GrantableTable[] {
  const root = response && typeof response === 'object' ? (response as Record<string, unknown>) : {};
  const list = Array.isArray(response) ? response : Array.isArray(root['data']) ? (root['data'] as unknown[]) : [];
  const seen = new Set<string>();
  const tables: GrantableTable[] = [];
  for (const item of list) {
    const raw = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const name = String(raw['tableName'] ?? raw['table_name'] ?? '').trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    tables.push({ tableName: name, label: humanizeTableName(name), description: String(raw['description'] ?? '').trim() });
  }
  return tables.sort((a, b) => a.label.localeCompare(b.label));
}

/** Rows matching the role filter ('all' or a role id) and the search text (role, table or menu name). */
export function filterPermissionRows(rows: readonly PermissionRow[], roleFilter: string, query: string): PermissionRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter(row => {
    if (roleFilter !== 'all' && String(row.roleId) !== roleFilter) return false;
    if (!q) return true;
    return [row.roleName, row.tableName, row.tableLabel, row.menuCallingName ?? ''].some(v => v.toLowerCase().includes(q));
  });
}
