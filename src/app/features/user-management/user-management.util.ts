import { UserManagementItem } from '../../core/models/user-management.model';

/** Canonical role types: stored value (DB) -> human readable label shown in the UI. */
export const ROLE_TYPE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'super admin', label: 'Super Admin' },
  { value: 'scheme oc', label: 'Scheme Officer In-Charge' },
  { value: 'mis manager', label: 'MIS Manager' },
  { value: 'gm', label: 'General Manager' },
  { value: 'zc', label: 'Zone Coordinator' },
  { value: 'programmer', label: 'Programmer' },
  { value: 'tp', label: 'Training Partner' }
];

/** Role filter buttons shown above the users table. */
export const ROLE_FILTER_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'citizen', label: 'Citizen' },
  { value: 'super admin', label: 'Super Admin' },
  { value: 'department', label: 'Department' },
  { value: 'tp', label: 'TP' }
];

const ROLE_TYPE_LABEL_MAP: Record<string, string> = {
  'super admin': 'Super Admin',
  's.a': 'Super Admin',
  'sa': 'Super Admin',
  'admin': 'Administrator',
  'scheme oc': 'Scheme Officer In-Charge',
  'oic': 'Officer In-Charge',
  'mis manager': 'MIS Manager',
  'manager': 'Manager',
  'gm': 'General Manager',
  'zc': 'Zone Coordinator',
  'programmer': 'Programmer',
  'tp': 'Training Partner',
  'citizen': 'Citizen'
};

/** Converts a stored role type (e.g. "mis manager", "gm") into a readable label. */
export function roleTypeLabel(roleType: string | null | undefined): string {
  if (!roleType) return '-';
  const key = roleType.trim().toLowerCase();
  return ROLE_TYPE_LABEL_MAP[key]
    ?? key.replace(/\b[a-z]/g, char => char.toUpperCase());
}

/** Blacklisting applies to Training Partners only. */
export function isTrainingPartner(item: UserManagementItem): boolean {
  return item.userType === 'TP' || (item.roleType || '').trim().toLowerCase() === 'tp';
}

/** Applies the role filter ('all' | 'blacklisted' | role keyword) and the free-text search. */
export function filterUsers(
  users: UserManagementItem[],
  roleFilter: string,
  searchQuery: string
): UserManagementItem[] {
  const q = searchQuery.toLowerCase().trim();
  const filter = roleFilter.toLowerCase();

  let filtered = users;

  if (filter === 'blacklisted') {
    filtered = filtered.filter(u => u.schemeStatus === 'Blacklisted');
  } else if (filter !== 'all') {
    filtered = filtered.filter(u =>
      (u.roleType && u.roleType.toLowerCase().includes(filter)) ||
      (u.userType && u.userType.toLowerCase().includes(filter)) ||
      (u.schemeDepartment && u.schemeDepartment.toLowerCase().includes(filter)) ||
      (filter === 'department' && u.userType === 'Admin')
    );
  }

  if (!q) return filtered;
  return filtered.filter(u =>
    (u.userId && u.userId.toLowerCase().includes(q)) ||
    (u.username && u.username.toLowerCase().includes(q)) ||
    (u.ssoId && u.ssoId.toLowerCase().includes(q)) ||
    (u.roleType && u.roleType.toLowerCase().includes(q)) ||
    roleTypeLabel(u.roleType).toLowerCase().includes(q) ||
    (u.districtName && u.districtName.toLowerCase().includes(q)) ||
    (u.schemeDepartment && u.schemeDepartment.toLowerCase().includes(q))
  );
}

/** Row styling for the users table. */
export function userRowClass(item: any): string {
  if (item.status === 'Blacklisted' || item.schemeStatus === 'Blacklisted') {
    return 'bg-rose-50/60 transition-colors';
  }
  const isInactive = item.status === 'Inactive' || item.schemeStatus === 'Inactive';
  return isInactive ? 'opacity-50 bg-slate-50 transition-colors' : 'bg-white transition-colors';
}

/** Editable state of the add / edit user form. */
export interface UserFormData {
  userId: string;
  ssoId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  mobileNo: string;
  alternateMobileNo: string;
  alternateEmail: string;
  userType: 'Admin' | 'Super Admin' | 'TP';
  roleType: string;
  designation: string;
  schemeDepartment: string;
  district: string;
  blockName: string;
  aadhaarId: string;
}

/** Initial (add-mode) form state. */
export function createEmptyUserForm(userId = ''): UserFormData {
  return {
    userId,
    ssoId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    mobileNo: '',
    alternateMobileNo: '',
    alternateEmail: '',
    userType: 'Admin',
    roleType: '',
    designation: 'Joint Director',
    schemeDepartment: 'RSLDC',
    district: 'Jaipur',
    blockName: 'All Blocks',
    aadhaarId: ''
  };
}

/** Pre-fills the form from an existing user (edit mode). */
export function userFormFromItem(item: UserManagementItem): UserFormData {
  const names = item.username ? item.username.split(' ') : [''];
  return {
    userId: item.userId,
    ssoId: item.ssoId || '',
    firstName: names[0] || '',
    lastName: names.slice(1).join(' ') || '',
    dateOfBirth: '1990-01-01',
    email: item.email || `${item.username.replace(/\s+/g, '')}@isms.gov.in`,
    mobileNo: item.mobileNo || '9829012345',
    alternateMobileNo: '',
    alternateEmail: '',
    userType: item.userType,
    roleType: item.roleType,
    designation: item.designation || 'Joint Director',
    schemeDepartment: item.schemeDepartment || 'RSLDC',
    district: item.districtName,
    blockName: item.blockName || 'All Blocks',
    aadhaarId: ''
  };
}

/** Required-field validation for the user form. */
export function isUserFormValid(form: UserFormData): boolean {
  return !!(
    form.ssoId.trim() &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.mobileNo.trim() &&
    form.roleType
  );
}

function userFullName(form: UserFormData): string {
  return `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
}

/** Fields written back when editing an existing user. */
export function buildUserChanges(form: UserFormData): Partial<UserManagementItem> {
  return {
    userId: form.userId.trim(),
    username: userFullName(form),
    ssoId: form.ssoId.trim(),
    userType: form.userType,
    roleType: form.roleType,
    designation: form.designation,
    schemeDepartment: form.schemeDepartment,
    districtName: form.district,
    blockName: form.blockName,
    email: form.email.trim(),
    mobileNo: form.mobileNo.trim()
  };
}

/** Payload used when creating a new user. */
export function buildNewUser(form: UserFormData, id: string): Partial<UserManagementItem> {
  return {
    sNo: 1,
    id,
    ...buildUserChanges(form),
    schemeStatus: 'Active'
  };
}

/** Content of the generic confirmation dialog. */
export interface ConfirmModalData {
  type: 'edit' | 'status' | 'delete' | 'blacklist';
  user: UserManagementItem;
  title: string;
  message: string;
  confirmLabel: string;
  accentBarClass?: string;
}

export function buildEditConfirm(item: UserManagementItem): ConfirmModalData {
  return {
    type: 'edit',
    user: item,
    title: 'Confirm Edit User',
    message: `Are you sure you want to edit details for user "${item.username}" (${item.userId})?`,
    confirmLabel: 'Proceed to Edit',
    accentBarClass: 'bg-primary'
  };
}

export function buildStatusConfirm(item: UserManagementItem): ConfirmModalData {
  const isTp = item.userType === 'TP' || item.roleType === 'tp';
  const isCurrentlyActive = item.schemeStatus === 'Active';

  let actionLabel = '';
  let targetStatusLabel = '';

  if (isTp) {
    actionLabel = isCurrentlyActive ? 'Mark Blacklisted' : 'Mark Active';
    targetStatusLabel = isCurrentlyActive ? 'Blacklisted' : 'Active';
  } else {
    actionLabel = isCurrentlyActive ? 'Mark Inactive' : 'Mark Active';
    targetStatusLabel = isCurrentlyActive ? 'Inactive' : 'Active';
  }

  return {
    type: 'status',
    user: item,
    title: `Confirm Action: ${actionLabel}`,
    message: `Are you sure you want to change the status of user "${item.username}" (${item.userId}) to ${targetStatusLabel}?`,
    confirmLabel: actionLabel,
    accentBarClass: isCurrentlyActive ? 'bg-amber-500' : 'bg-emerald-600'
  };
}

export function buildBlacklistConfirm(item: UserManagementItem): ConfirmModalData {
  const isBlacklisted = item.schemeStatus === 'Blacklisted';
  return {
    type: 'blacklist',
    user: item,
    title: isBlacklisted ? 'Remove from Blacklist' : 'Mark as Blacklisted',
    message: isBlacklisted
      ? `Are you sure you want to remove Training Partner "${item.username}" (${item.userId}) from the blacklist? The account will be restored to Active status.`
      : `Are you sure you want to mark Training Partner "${item.username}" (${item.userId}) as Blacklisted? The account will be blocked from participating in schemes, tenders and batches.`,
    confirmLabel: isBlacklisted ? 'Yes, Remove Blacklist' : 'Yes, Mark Blacklisted',
    accentBarClass: isBlacklisted ? 'bg-emerald-600' : 'bg-rose-600'
  };
}

export function buildDeleteConfirm(item: UserManagementItem): ConfirmModalData {
  return {
    type: 'delete',
    user: item,
    title: 'Confirm Delete User',
    message: `Are you sure you want to permanently delete user "${item.username}" (${item.userId})? This action cannot be undone.`,
    confirmLabel: 'Delete User',
    accentBarClass: 'bg-rose-600'
  };
}
