import type { RoleTablePermission, UserRoleMasterItem } from './admin-masters.model';

/**
 * Converters between the backend roles API (`/api/roles`) and the screens.
 *
 * Backend role:        `{ id, name, description, isActive, userCount, permissions: RolePermissionDto[] }`
 * Backend permission:  `{ id, roleId, tableName, status, methodAllowGet/Post/Put/Delete, enableInMenu, menuCallingName }`
 * Mock role (old):     `{ id, roleTypeName, permissions: string[], status }`
 */

type Raw = Record<string, unknown>;

const asRaw = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});
const text = (value: unknown): string => (typeof value === 'string' ? value : value == null ? '' : String(value));
const num = (value: unknown): number => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};
const flag = (value: unknown): boolean => value === true || value === 'true' || value === 1;

/** One backend RolePermissionDto as the screens use it. */
export function toRoleTablePermission(item: unknown, roleId = 0): RoleTablePermission {
  const raw = asRaw(item);
  const menuName = text(raw['menuCallingName']).trim();
  return {
    id: num(raw['id']),
    roleId: num(raw['roleId'] ?? roleId),
    tableName: text(raw['tableName'] ?? raw['table_name']),
    status: raw['status'] === undefined ? true : flag(raw['status']),
    get: flag(raw['methodAllowGet']),
    post: flag(raw['methodAllowPost']),
    put: flag(raw['methodAllowPut']),
    delete: flag(raw['methodAllowDelete']),
    enableInMenu: flag(raw['enableInMenu']),
    menuCallingName: menuName || null
  };
}

/** One role row, from the backend or the mock store. Missing fields become '' / [] so screens stay safe. */
export function toUserRoleItem(item: unknown, index = 0): UserRoleMasterItem {
  const raw = asRaw(item);
  const id = text(raw['id']);
  const inactive = raw['status'] === 'Inactive' || raw['isActive'] === false;
  const rawPermissions = Array.isArray(raw['permissions']) ? (raw['permissions'] as unknown[]) : [];
  const tablePermissions = rawPermissions
    .filter(p => p && typeof p === 'object')
    .map(p => toRoleTablePermission(p, num(id)));

  return {
    sNo: typeof raw['sNo'] === 'number' ? (raw['sNo'] as number) : index + 1,
    id,
    roleTypeName: text(raw['roleTypeName'] ?? raw['name']),
    // Mock roles list permission names; backend roles list objects (kept in tablePermissions).
    permissions: rawPermissions.filter((p): p is string => typeof p === 'string'),
    status: inactive ? 'Inactive' : 'Active',
    description: text(raw['description']),
    userCount: num(raw['userCount']),
    tablePermissions
  };
}

/**
 * Body of POST /api/roles and PUT /api/roles/{id} (CreateRoleRequest / UpdateRoleRequest).
 * `permissions` is left out, so an update keeps the role's permissions (they are managed on the permissions screen).
 */
export function toRoleRequest(
  changes: Partial<UserRoleMasterItem>,
  current: UserRoleMasterItem | null = null
): { name: string; description: string | null; isActive: boolean } {
  const merged = { ...(current ?? {}), ...changes };
  const description = text(merged.description).trim();
  return {
    name: text(merged.roleTypeName).trim(),
    description: description || null,
    isActive: merged.status !== 'Inactive'
  };
}

/** One entry of AssignPermissionsRequest.permissions (POST /api/roles/{id}/permissions adds or updates by table). */
export function toTablePermissionRequest(permission: Omit<RoleTablePermission, 'id' | 'roleId'>): Record<string, unknown> {
  const menuName = permission.menuCallingName?.trim();
  return {
    tableName: permission.tableName,
    status: permission.status,
    methodAllowGet: permission.get,
    methodAllowPost: permission.post,
    methodAllowPut: permission.put,
    methodAllowDelete: permission.delete,
    enableInMenu: permission.enableInMenu,
    menuCallingName: menuName || null
  };
}
