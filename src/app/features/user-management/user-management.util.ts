import { UserManagementItem } from '../../core/models/user-management.model';

/** Canonical role types from Role Management. */
export const ROLE_TYPE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Department Officer', label: 'Department Officer' },
  { value: 'Scrutiny Officer', label: 'Scrutiny Officer' },
  { value: 'Training Partner', label: 'Training Partner' }
];

/** Role filter buttons shown above the users table. */
export const ROLE_FILTER_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'super admin', label: 'Super Admin' },
  { value: 'department officer', label: 'Department Officer' },
  { value: 'scrutiny officer', label: 'Scrutiny Officer' },
  { value: 'training partner', label: 'Training Partner' }
];

const ROLE_TYPE_LABEL_MAP: Record<string, string> = {
  'super admin': 'Super Admin',
  's.a': 'Super Admin',
  'sa': 'Super Admin',
  'department officer': 'Department Officer',
  'scrutiny officer': 'Scrutiny Officer',
  'training partner': 'Training Partner',
  'tp': 'Training Partner',
  'admin': 'Administrator',
  'scheme oc': 'Department Officer',
  'oic': 'Department Officer',
  'mis manager': 'Department Officer',
  'manager': 'Manager',
  'gm': 'General Manager',
  'zc': 'Zone Coordinator',
  'programmer': 'Department Officer',
  'citizen': 'Citizen'
};

/** Converts a stored role type into a readable label from Role Management. */
export function roleTypeLabel(roleType: string | null | undefined): string {
  if (!roleType) return '-';
  const trimmed = roleType.trim();
  const key = trimmed.toLowerCase();
  return ROLE_TYPE_LABEL_MAP[key]
    ?? trimmed.replace(/\b[a-z]/g, char => char.toUpperCase());
}

/** Blacklisting applies to Training Partners only. */
export function isTrainingPartner(item: UserManagementItem): boolean {
  const rt = (item.roleType || '').trim().toLowerCase();
  return item.userType === 'TP' || rt === 'tp' || rt === 'training partner';
}

/** Applies the role filter ('all' | 'blacklisted' | role keyword) and the free-text search. */
export function filterUsers(
  users: UserManagementItem[],
  roleFilter: string,
  searchQuery: string
): UserManagementItem[] {
  const q = searchQuery.toLowerCase().trim();
  const filter = roleFilter.toLowerCase().trim();

  let filtered = users;

  if (filter === 'blacklisted') {
    filtered = filtered.filter(u => u.schemeStatus === 'Blacklisted');
  } else if (filter !== 'all') {
    filtered = filtered.filter(u => {
      const rt = (u.roleType || '').toLowerCase();
      const ut = (u.userType || '').toLowerCase();
      const sd = (u.schemeDepartment || '').toLowerCase();
      const label = roleTypeLabel(u.roleType).toLowerCase();
      return (
        rt === filter ||
        rt.includes(filter) ||
        label === filter ||
        label.includes(filter) ||
        ut === filter ||
        ut.includes(filter) ||
        sd.includes(filter) ||
        (filter === 'department' && (ut === 'admin' || rt.includes('department') || rt.includes('scrutiny') || label.includes('department')))
      );
    });
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
export function userRowClass(item: { status?: string; schemeStatus?: string }): string {
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
  schemeNames?: string[];
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
    designation: '',
    schemeDepartment: 'All Schemes',
    schemeNames: ['All Schemes'],
    district: 'Jaipur',
    blockName: 'All Blocks',
    aadhaarId: ''
  };
}

/** Pre-fills the form from an existing user (edit mode). */
export function userFormFromItem(item: UserManagementItem): UserFormData {
  const names = item.username ? item.username.split(' ') : [''];
  const schemeVal = item.schemeName || item.schemeDepartment || 'All Schemes';
  let initialSchemes: string[] = [];
  if (schemeVal === 'All Schemes' || schemeVal === 'ALL' || schemeVal === 'all') {
    initialSchemes = ['All Schemes'];
  } else {
    initialSchemes = schemeVal.split(',').map(s => s.trim()).filter(Boolean);
  }

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
    roleType: roleTypeLabel(item.roleType),
    designation: item.designation || '',
    schemeDepartment: schemeVal,
    schemeNames: initialSchemes.length > 0 ? initialSchemes : ['All Schemes'],
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
  const schemeStr = (form.schemeNames && form.schemeNames.length > 0)
    ? (form.schemeNames.includes('All Schemes') || form.schemeNames.includes('ALL') ? 'All Schemes' : form.schemeNames.join(', '))
    : (form.schemeDepartment || 'All Schemes');

  return {
    userId: form.userId.trim(),
    username: userFullName(form),
    ssoId: form.ssoId.trim(),
    userType: form.userType || (form.roleType === 'Super Admin' ? 'Super Admin' : 'Admin'),
    roleType: form.roleType,
    designation: form.designation,
    schemeDepartment: schemeStr,
    schemeName: schemeStr,
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

export const BLACKLIST_DURATION_OPTIONS = [
  '1 Year',
  '2 Years',
  '3 Years',
  '5 Years',
  'Permanent (Indefinite)'
];

/** Content of the generic confirmation dialog. */
export interface ConfirmModalData {
  type: 'edit' | 'status' | 'delete' | 'blacklist';
  user: UserManagementItem;
  title: string;
  message: string;
  confirmLabel: string;
  accentBarClass?: string;
  metadata?: {
    scheme?: string;
    years?: string;
    remarks?: string;
  };
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

export function buildBlacklistConfirm(
  item: UserManagementItem,
  details?: { scheme?: string; years?: string; remarks?: string }
): ConfirmModalData {
  const isBlacklisted = item.schemeStatus === 'Blacklisted';
  return {
    type: 'blacklist',
    user: item,
    title: isBlacklisted ? 'Remove from Blacklist' : 'Mark as Blacklisted',
    message: isBlacklisted
      ? `Are you sure you want to remove Training Partner "${item.username}" (${item.userId}) from the blacklist? The account will be restored to Active status.`
      : `Are you sure you want to mark Training Partner "${item.username}" (${item.userId}) as Blacklisted? The account will be blocked from participating in schemes, tenders and batches.`,
    confirmLabel: isBlacklisted ? 'Yes, Remove Blacklist' : 'Yes, Mark Blacklisted',
    accentBarClass: isBlacklisted ? 'bg-emerald-600' : 'bg-rose-600',
    metadata: details
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
