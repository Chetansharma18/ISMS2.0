import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { UserRoleMasterItem } from '../../core/models/admin-masters.model';
import { toRoleRequest, toUserRoleItem } from '../../core/models/role.normalizer';

export type { UserRoleMasterItem };

const COLUMNS: TableColumn<UserRoleMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'roleTypeName', label: 'Role Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'description', label: 'Description', cellClass: 'text-slate-600 min-w-[220px]' },
  { key: 'userCount', label: 'Users', type: 'number', align: 'center', width: 'w-20' }
];

/**
 * Roles of the backend (`/api/roles`): list, add, edit (name, description) and switch active / inactive.
 * Table permissions of a role are managed on the Role Permissions screen. The backend refuses renaming or
 * deactivating the system roles (superAdmin, admin) and shows why.
 */
const CONFIG: MasterCrudConfig<UserRoleMasterItem> = {
  dataKey: 'USER_ROLES',
  entityLabel: 'Role',
  title: 'Role Management',
  subtitle: 'Configure user roles, administrative authority, and designation scopes',
  breadcrumbs: [{ label: 'Home', url: '/' }, { label: 'User Management' }, { label: 'Role Management' }],
  searchPlaceholder: 'Search by role name or description...',
  searchFields: ['roleTypeName', 'description'],
  itemUnit: 'roles',
  columns: COLUMNS,
  hasStatus: true,
  hideViewAction: true,
  modalWidthClass: 'max-w-[480px]',
  fields: [
    { key: 'roleTypeName', label: 'Role Name', type: 'text', required: true, maxLength: 100, placeholder: 'Enter role name (e.g. scrutinyOfficer)', colSpan: 3 },
    { key: 'description', label: 'Description', type: 'textarea', maxLength: 500, rows: 3, placeholder: 'What this role is for', colSpan: 3 }
  ],
  createDefaults: () => ({
    roleTypeName: '',
    description: '',
    permissions: [] as string[]
  }),
  buildPayload: (formData) => ({
    roleTypeName: formData.roleTypeName.trim(),
    description: (formData.description ?? '').trim(),
    permissions: formData.permissions || [],
    status: formData.status === 'Inactive' ? 'Inactive' : 'Active'
  }),
  normalizer: (raw, index) => toUserRoleItem(raw, index),
  toApiPayload: (payload, current) => toRoleRequest(payload, current),
  deleteConfirmText: (item) => `Are you sure you want to delete role "${item.roleTypeName}"?`
};

@Component({
  selector: 'app-user-role-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class UserRoleMasterComponent {
  readonly config = CONFIG;
}
