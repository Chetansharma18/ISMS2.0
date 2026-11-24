/**
 * Users of the backend (`/api/users`, UserDto) as the screens use them.
 *
 * UserDto: `{ id, SSOID, name, displayName, firstName, lastName, email, mobile_no, mobile, designation, department,
 * userType, gender, dateOfBirth, l (city), st (state), postalAddress, postalCode, employeeNumber, mailOfficial,
 * mailPersonal, jpegPhoto, created_at, last_login, updated_at, roles: [{ id, name }] }`.
 */

export interface PortalUserRole {
  id: number;
  name: string;
}

export interface PortalUser {
  id: number;
  ssoId: string;
  name: string;
  email: string;
  mobile: string;
  designation: string;
  department: string;
  userType: string;
  gender: string;
  dateOfBirth: string;
  city: string;
  state: string;
  postalAddress: string;
  postalCode: string;
  employeeNumber: string;
  mailOfficial: string;
  mailPersonal: string;
  photo: string;
  createdAt: string | null;
  lastLogin: string | null;
  updatedAt: string | null;
  roles: PortalUserRole[];
}

type Raw = Record<string, unknown>;
const asRaw = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});
const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim());
const first = (raw: Raw, ...keys: string[]): string => {
  for (const key of keys) {
    const value = text(raw[key]);
    if (value) return value;
  }
  return '';
};

export function toPortalUser(item: unknown): PortalUser {
  const raw = asRaw(item);
  const fullName = `${text(raw['firstName'])} ${text(raw['lastName'])}`.trim();
  const roles = (Array.isArray(raw['roles']) ? raw['roles'] : [])
    .map(r => (typeof r === 'string' ? { id: 0, name: r } : { id: Number(asRaw(r)['id']) || 0, name: text(asRaw(r)['name']) }))
    .filter(r => r.name !== '');

  return {
    id: Number(raw['id'] ?? raw['User_id']) || 0,
    ssoId: first(raw, 'SSOID', 'ssoid', 'sso_id'),
    name: first(raw, 'name', 'displayName') || fullName,
    email: first(raw, 'email', 'Email_id'),
    mobile: first(raw, 'mobile_no', 'mobileNo', 'mobile'),
    designation: first(raw, 'designation'),
    department: first(raw, 'department'),
    userType: first(raw, 'userType'),
    gender: first(raw, 'gender'),
    dateOfBirth: first(raw, 'dateOfBirth'),
    city: first(raw, 'l'),
    state: first(raw, 'st'),
    postalAddress: first(raw, 'postalAddress'),
    postalCode: first(raw, 'postalCode'),
    employeeNumber: first(raw, 'employeeNumber'),
    mailOfficial: first(raw, 'mailOfficial'),
    mailPersonal: first(raw, 'mailPersonal'),
    photo: first(raw, 'jpegPhoto'),
    createdAt: first(raw, 'created_at', 'createdAt') || null,
    lastLogin: first(raw, 'last_login', 'lastLogin') || null,
    updatedAt: first(raw, 'updated_at', 'updatedAt') || null,
    roles
  };
}

/** One page of GET /api/users (`{ items, page, pageSize, totalCount, totalPages }`, any casing), or a plain array. */
export function toUserPage(response: unknown): { users: PortalUser[]; totalPages: number } {
  if (Array.isArray(response)) return { users: response.map(toPortalUser), totalPages: 1 };
  const root = asRaw(response);
  const body = root['items'] === undefined && root['Items'] === undefined && root['data'] !== undefined ? asRaw(root['data']) : root;
  const items = (body['items'] ?? body['Items']) as unknown;
  const totalPages = Number(body['totalPages'] ?? body['TotalPages'] ?? 1) || 1;
  return { users: Array.isArray(items) ? items.map(toPortalUser) : [], totalPages };
}

/**
 * A backend date (`2026-11-23T10:15:00`, UTC; the offset is often left out) as "23 Nov 2026, 3:45 PM" in Indian time,
 * or "-" when empty or unreadable.
 */
export function formatUserDate(value: string | null, withTime = true): string {
  if (!value) return '-';
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone || !value.includes('T') ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit', hour12: true } : {}),
    timeZone: 'Asia/Kolkata'
  });
}

/** True when the user matches the search text (name, SSO ID, email, mobile, designation, department or a role). */
export function userMatches(user: PortalUser, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [user.name, user.ssoId, user.email, user.mobile, user.designation, user.department, ...user.roles.map(r => r.name)].some(v =>
    v.toLowerCase().includes(q)
  );
}

/** One row of the User Roles screen: a user with all of their roles (empty when the user has none). */
export interface UserRoleRow {
  key: string;
  sNo: number;
  user: PortalUser;
  roles: PortalUserRole[];
}

/** One row per user, ordered by name, with the user's roles sorted by name; numbered from 1. */
export function toUserRoleRows(users: readonly PortalUser[]): UserRoleRow[] {
  return [...users]
    .sort((a, b) => (a.name || a.ssoId).localeCompare(b.name || b.ssoId))
    .map((user, i) => ({
      key: String(user.id || user.ssoId),
      sNo: i + 1,
      user,
      roles: [...user.roles].sort((a, b) => a.name.localeCompare(b.name))
    }));
}
