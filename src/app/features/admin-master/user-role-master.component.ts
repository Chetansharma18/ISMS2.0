import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { UserRoleMasterItem } from '../../core/models/admin-masters.model';

export type { UserRoleMasterItem };

const COLUMNS: TableColumn<UserRoleMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'roleTypeName', label: 'Role Type', cellClass: 'whitespace-nowrap font-semibold text-slate-800' }
];

const CONFIG: MasterCrudConfig<UserRoleMasterItem> = {
  dataKey: 'USER_ROLES',
  entityLabel: 'Role Type',
  title: 'Role Management',
  searchPlaceholder: 'Search by role type...',
  searchFields: ['roleTypeName'],
  itemUnit: 'roles',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[480px]',
  fields: [
    { key: 'roleTypeName', label: 'Role Type', type: 'text', required: true, maxLength: 100, placeholder: 'Enter role type (e.g. Scrutiny Officer)', colSpan: 3 }
  ],
  createDefaults: () => ({
    roleTypeName: '',
    permissions: [] as string[]
  }),
  buildPayload: (formData) => ({
    roleTypeName: formData.roleTypeName.trim(),
    permissions: formData.permissions || [],
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
