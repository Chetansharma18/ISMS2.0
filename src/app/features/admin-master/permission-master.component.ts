import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { PermissionMasterItem } from '../../core/models/admin-masters.model';

export type { PermissionMasterItem };

const MODULE_OPTIONS = [
  'EOI Management',
  'Batch Approval',
  'User Management',
  'Master Data',
  'Grievance Redressal',
  'Camera Monitoring'
];

const COLUMNS: TableColumn<PermissionMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'permissionName', label: 'Permission Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'permissionCode', label: 'Permission Code', cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700' },
  { key: 'moduleName', label: 'Module / Feature', cellClass: 'whitespace-nowrap font-medium text-slate-700' },
  { key: 'description', label: 'Description', cellClass: 'text-slate-600 text-xs' }
];

const CONFIG: MasterCrudConfig<PermissionMasterItem> = {
  dataKey: 'PERMISSIONS',
  entityLabel: 'Permission',
  title: 'Permission Master',
  searchPlaceholder: 'Search by permission name, code, or module...',
  searchFields: ['permissionName', 'permissionCode', 'moduleName', 'description'],
  itemUnit: 'permissions',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[540px]',
  fields: [
    { key: 'permissionName', label: 'Permission Name', type: 'text', required: true, maxLength: 100, placeholder: 'Enter permission name (e.g. View EOI Configuration)', colSpan: 3 },
    { key: 'permissionCode', label: 'Permission Code', type: 'text', required: true, maxLength: 50, placeholder: 'e.g. PERM_EOI_VIEW', uppercase: true, colSpan: 2 },
    { key: 'moduleName', label: 'Module / Feature', type: 'select', required: true, options: MODULE_OPTIONS, colSpan: 1 },
    { key: 'description', label: 'Description', type: 'textarea', maxLength: 250, placeholder: 'Enter permission description', colSpan: 3 }
  ],
  createDefaults: () => ({
    permissionName: '',
    permissionCode: '',
    moduleName: '',
    description: ''
  }),
  buildPayload: (formData) => ({
    permissionName: formData.permissionName.trim(),
    permissionCode: formData.permissionCode.trim().toUpperCase(),
    moduleName: formData.moduleName.trim(),
    description: (formData.description || '').trim() || 'No description provided.',
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete permission "${item.permissionName}"?`
};

@Component({
  selector: 'app-permission-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class PermissionMasterComponent {
  readonly config = CONFIG;
}
