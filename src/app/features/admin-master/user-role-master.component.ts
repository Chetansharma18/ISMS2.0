import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { UserRoleMasterItem } from '../../core/models/admin-masters.model';

export type { UserRoleMasterItem };

const AVAILABLE_PERMISSIONS = [
  'View EOI Configuration',
  'Create & Edit EOI',
  'Delete EOI Proposal',
  'Batch Approval & Scrutiny',
  'Manage Master Records',
  'Camera CCTV Live Monitoring',
  'Grievance Redressal Access',
  'View Financial Reports'
];

const COLUMNS: TableColumn<UserRoleMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'roleTypeName', label: 'Role Type Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[150px]' },
  { key: 'permissions', label: 'Assigned Permissions', type: 'custom', cellClass: 'min-w-[280px]' }
];

const CONFIG: MasterCrudConfig<UserRoleMasterItem> = {
  dataKey: 'USER_ROLES',
  entityLabel: 'Role Type',
  title: 'User Role Type Master',
  searchPlaceholder: 'Search by role type name or permission...',
  searchFields: ['roleTypeName'],
  itemUnit: 'roles',
  columns: COLUMNS,
  tagsColumns: ['permissions'],
  hasStatus: true,
  modalWidthClass: 'max-w-[560px]',
  fields: [
    { key: 'roleTypeName', label: 'Role Type Name', type: 'text', required: true, maxLength: 100, placeholder: 'Enter role type name (e.g. Scrutiny Officer)', colSpan: 3 },
    { key: 'permissions', label: 'Add Permission for Role Type', type: 'permissions', required: true, options: AVAILABLE_PERMISSIONS, colSpan: 3 }
  ],
  createDefaults: () => ({
    roleTypeName: '',
    permissions: [] as string[]
  }),
  buildPayload: (formData) => ({
    roleTypeName: formData.roleTypeName.trim(),
    permissions: [...formData.permissions],
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete role type "${item.roleTypeName}"?`
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
