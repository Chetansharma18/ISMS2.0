import type { UserRole } from '../models/role.model';
import type { UserPersona } from '../models/user.model';
import type { BackendRoleSummary, BackendUser, TwoStepMethod } from './auth-api.models';

/** Backend role name (Roles table) to portal role. Compared case-insensitively, spaces and underscores ignored. */
const ROLE_BY_BACKEND_NAME: Record<string, UserRole> = {
  superadmin: 'super_admin',
  admin: 'dept_admin',
  departmentuser: 'dept_admin',
  deptadmin: 'dept_admin',
  tp: 'existing_user',
  trainingpartner: 'existing_user',
  user: 'new_user',
  aspirant: 'aspirant'
};

/** When the backend reports several roles and none is marked as chosen, the most privileged one is used. */
const ROLE_PRIORITY: UserRole[] = ['super_admin', 'dept_admin', 'existing_user', 'new_user', 'aspirant'];

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  dept_admin: 'Department User',
  existing_user: 'Registered TP/PIA',
  new_user: 'New User',
  aspirant: 'Aspirant'
};

const normalize = (name: string): string => name.trim().toLowerCase().replace(/[\s_-]+/g, '');

/** The portal role of a backend role name; unknown names get the least privileged role. */
export function toPortalRole(backendRoleName: string | null | undefined): UserRole {
  return ROLE_BY_BACKEND_NAME[normalize(backendRoleName ?? '')] ?? 'new_user';
}

/** Role names of a backend user, whatever shape its `roles` list has. */
export function roleNamesOf(user: BackendUser | null | undefined): string[] {
  return (user?.roles ?? [])
    .map(role => (typeof role === 'string' ? role : role?.name))
    .filter((name): name is string => !!name);
}

/** The `{ id, name }` roles of a backend user (role selection needs the ids). */
export function selectableRolesOf(user: BackendUser | null | undefined): BackendRoleSummary[] {
  return (user?.roles ?? []).filter((role): role is BackendRoleSummary => typeof role === 'object' && role !== null);
}

/**
 * The portal role for the session: the role chosen at sign-in when there is one, otherwise the most privileged of the
 * user's roles.
 */
export function resolveSessionRole(roleNames: readonly string[], chosenRoleName?: string | null): UserRole {
  if (chosenRoleName) return toPortalRole(chosenRoleName);
  const roles = roleNames.map(toPortalRole);
  return ROLE_PRIORITY.find(role => roles.includes(role)) ?? 'new_user';
}

/** "superAdmin" -> "Super Admin", "Tp" -> "TP", "dept_user" -> "Dept User": the backend role name, readable. */
export function humanizeRoleName(name: string): string {
  const words = name
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.map(w => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
}

/**
 * The persona the rest of the portal works with, built from the signed-in backend user. `backendRoleName` (the role the
 * session is scoped to) becomes the label under the name; without it the portal role's label is used.
 */
export function toPersona(user: BackendUser, role: UserRole, backendRoleName?: string | null): UserPersona {
  const ssoId = user.SSOID || String(user.id);
  return {
    id: String(user.id ?? ssoId),
    ssoId,
    label: user.name?.trim() || user.displayName?.trim() || ssoId,
    subLabel: backendRoleName ? humanizeRoleName(backendRoleName) : ROLE_LABELS[role],
    role,
    isProfileComplete: role !== 'new_user' && role !== 'aspirant'
  };
}

/** Where each role lands after signing in (same routes as the mock sign-in page). */
export function landingRouteFor(role: UserRole): { path: string; queryParams?: Record<string, string> } {
  switch (role) {
    case 'super_admin':
      return { path: '/admin/eoi-configuration' };
    case 'dept_admin':
      return { path: '/admin/eoi-view' };
    case 'aspirant':
      return { path: '/training-calendar', queryParams: { fromLogin: 'true' } };
    default:
      return { path: '/tenders', queryParams: { fromLogin: 'true' } };
  }
}

/** The second-factor methods the backend allows, OTP first; unknown values are dropped. */
export function toTwoStepMethods(allowed: readonly string[] | null | undefined): TwoStepMethod[] {
  const upper = new Set((allowed ?? []).map(m => m.trim().toUpperCase()));
  return (['OTP', 'PIN'] as const).filter(m => upper.has(m));
}
