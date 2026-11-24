/**
 * Department users (backend `/api/department-users`, DepartmentUserDto) as the screen uses them, and the request
 * bodies it sends. Backend JSON keys keep their snake_case names (`sso_id`, `assign_role_type_id`, ...).
 */

export interface RoleHistoryEntry {
  roleId: number;
  roleName: string;
  assignedByUserId: number;
  assignedBySsoId: string;
  assignedAt: string | null;
  remarks: string;
}

export interface DepartmentUser {
  id: number;
  ssoId: string;
  roleId: number;
  roleName: string;
  /** The portal user this department user is mapped under (User_base id). */
  associatedUserId: number;
  associatedUserName: string;
  associatedUserSsoId: string;
  createdByUserId: number;
  createdByName: string;
  createdBySsoId: string;
  roleHistory: RoleHistoryEntry[];
  designationId: number | null;
  designationName: string;
  schemeIds: number[];
  districtIds: number[];
  blockIds: number[];
  /** Names the backend sends for the primary scheme / district / block (the others are looked up from the masters). */
  primarySchemeName: string;
  primaryDistrictName: string;
  primaryBlockName: string;
  /** true once activated: the role is then assigned to the portal user with this SSO ID. */
  active: boolean;
  /** A portal user with this SSO ID exists (backend `user_exists_in_base`); null when the backend did not say. */
  existsInPortal: boolean | null;
  /** That portal user's id (backend `user_id`). */
  portalUserId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** What the add / edit dialog collects. */
export interface DepartmentUserForm {
  ssoId: string;
  roleId: string;
  associatedUserId: string;
  designationId: string;
  schemeIds: string[];
  districtIds: string[];
  blockIds: string[];
  remarks: string;
}

type Raw = Record<string, unknown>;
const asRaw = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});
const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : value == null ? '' : String(value));
const int = (value: unknown): number => {
  const n = Number(value);
  return Number.isInteger(n) ? n : 0;
};
const intOrNull = (value: unknown): number | null => (value == null || value === '' ? null : int(value) || null);
/** A backend id list, falling back to the single primary id. */
const ids = (list: unknown, single: unknown): number[] => {
  const values = Array.isArray(list) ? list.map(int).filter(n => n > 0) : [];
  if (values.length === 0 && int(single) > 0) values.push(int(single));
  return [...new Set(values)];
};

export function toDepartmentUser(item: unknown): DepartmentUser {
  const raw = asRaw(item);
  const history = (Array.isArray(raw['role_assigned_by_user_id']) ? raw['role_assigned_by_user_id'] : []).map(asRaw).map(h => ({
    roleId: int(h['roleId']),
    roleName: text(h['roleName']),
    assignedByUserId: int(h['assignedByUserId']),
    assignedBySsoId: text(h['assignedBySsoId']),
    assignedAt: text(h['assignedAt']) || null,
    remarks: text(h['remarks'])
  }));
  return {
    id: int(raw['id']),
    ssoId: text(raw['sso_id']),
    roleId: int(raw['assign_role_type_id']),
    roleName: text(raw['roleName']),
    associatedUserId: int(raw['asocit_with_user_id']),
    associatedUserName: text(raw['associatedWithUserName']),
    associatedUserSsoId: text(raw['associatedWithUserSsoId']),
    createdByUserId: int(raw['user_created_by_user_id']),
    createdByName: text(raw['createdByUserName']),
    createdBySsoId: text(raw['createdByUserSsoId']),
    roleHistory: history,
    designationId: intOrNull(raw['designation_id']),
    designationName: text(raw['designation_name']),
    schemeIds: ids(raw['scheme_ids'], raw['scheme_id']),
    districtIds: ids(raw['district_ids'], raw['district_id']),
    blockIds: ids(raw['block_ids'], raw['block_id']),
    primarySchemeName: text(raw['schemeName']),
    primaryDistrictName: text(raw['districtName']),
    primaryBlockName: text(raw['blockName']),
    active: raw['user_activation_statu'] === true,
    existsInPortal: typeof raw['user_exists_in_base'] === 'boolean' ? (raw['user_exists_in_base'] as boolean) : null,
    portalUserId: intOrNull(raw['user_id']),
    createdAt: text(raw['created_at']) || null,
    updatedAt: text(raw['updated_at']) || null
  };
}

/** One page of GET /api/department-users (`{ items, totalPages }`), or a plain array. */
export function toDepartmentUserPage(response: unknown): { users: DepartmentUser[]; totalPages: number } {
  if (Array.isArray(response)) return { users: response.map(toDepartmentUser), totalPages: 1 };
  const root = asRaw(response);
  const items = root['items'] ?? root['Items'];
  return {
    users: Array.isArray(items) ? items.map(toDepartmentUser) : [],
    totalPages: Math.max(1, int(root['totalPages'] ?? root['TotalPages']) || 1)
  };
}

/** SSO IDs the backend accepts: letters, digits, dots, underscores and hyphens, at most 100 characters. */
export const SSO_ID_PATTERN = /^[a-zA-Z0-9._-]{1,100}$/;

/** The first problem with the form, or null when it can be sent. */
export function departmentUserFormError(form: DepartmentUserForm): string | null {
  const sso = form.ssoId.trim();
  if (!sso) return 'Enter the SSO ID.';
  if (!SSO_ID_PATTERN.test(sso)) return 'The SSO ID can only contain letters, numbers, dots, underscores and hyphens.';
  if (!(int(form.roleId) > 0)) return 'Select the role to assign.';
  if (!(int(form.associatedUserId) > 0)) return 'Select the user this department user is associated with.';
  if (form.remarks.trim().length > 500) return 'Remarks can be at most 500 characters.';
  return null;
}

/**
 * Body of POST (create) / PUT (update) /api/department-users. Lists are always sent, so clearing a list on edit
 * clears it on the server; designation_id is left out when none is chosen.
 */
export function toDepartmentUserRequest(form: DepartmentUserForm, designationName?: string): Record<string, unknown> {
  const toIds = (values: string[]) => [...new Set(values.map(int).filter(n => n > 0))];
  const designationId = int(form.designationId);
  const body: Record<string, unknown> = {
    sso_id: form.ssoId.trim(),
    assign_role_type_id: int(form.roleId),
    asocit_with_user_id: int(form.associatedUserId),
    scheme_ids: toIds(form.schemeIds),
    district_ids: toIds(form.districtIds),
    block_ids: toIds(form.blockIds)
  };
  if (designationId > 0) body['designation_id'] = designationId;
  else if (designationName !== undefined) body['designation_name'] = designationName;
  const remarks = form.remarks.trim();
  if (remarks) body['remarks'] = remarks;
  return body;
}

/** The dialog's starting values for a row (edit) or a blank form (add). */
export function toDepartmentUserForm(user: DepartmentUser | null, defaultAssociatedUserId = ''): DepartmentUserForm {
  return {
    ssoId: user?.ssoId ?? '',
    roleId: user ? String(user.roleId) : '',
    associatedUserId: user ? String(user.associatedUserId) : defaultAssociatedUserId,
    designationId: user?.designationId ? String(user.designationId) : '',
    schemeIds: (user?.schemeIds ?? []).map(String),
    districtIds: (user?.districtIds ?? []).map(String),
    blockIds: (user?.blockIds ?? []).map(String),
    remarks: ''
  };
}

/** Names for a list of ids from a lookup, falling back to "#id" for unknown ids. */
export function namesOf(idList: readonly number[], lookup: ReadonlyMap<number, string>): string[] {
  return idList.map(id => lookup.get(id) ?? `#${id}`);
}
