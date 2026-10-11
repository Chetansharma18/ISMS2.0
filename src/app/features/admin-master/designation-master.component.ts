import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { DesignationMasterItem } from '../../core/models/admin-masters.model';

export type { DesignationMasterItem };

const DEPARTMENT_OPTIONS = [
  'Administration',
  'Operations & Skill Training',
  'Finance & Accounts',
  'IT & CCTV Monitoring',
  'Scrutiny & Approvals'
];

const COLUMNS: TableColumn<DesignationMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'designationName', label: 'Designation Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'designationCode', label: 'Designation Code', cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700' },
  { key: 'departmentWing', label: 'Department / Wing', cellClass: 'whitespace-nowrap font-medium text-slate-700' }
];

const CONFIG: MasterCrudConfig<DesignationMasterItem> = {
  dataKey: 'DESIGNATIONS',
  entityLabel: 'Designation',
  title: 'Designation Master',
  searchPlaceholder: 'Search by designation name, code, or department...',
  searchFields: ['designationName', 'designationCode', 'departmentWing'],
  itemUnit: 'designations',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[520px]',
  fields: [
    { key: 'designationName', label: 'Designation Name', type: 'text', required: true, maxLength: 100, placeholder: 'Enter designation name (e.g. Joint Director)', colSpan: 3 },
    { key: 'designationCode', label: 'Designation Code', type: 'text', required: true, maxLength: 30, placeholder: 'e.g. JD', uppercase: true, colSpan: 3 },
    { key: 'departmentWing', label: 'Department / Wing', type: 'select', options: DEPARTMENT_OPTIONS, colSpan: 3 }
  ],
  createDefaults: () => ({
    designationName: '',
    designationCode: '',
    departmentWing: 'Administration'
  }),
  buildPayload: (formData) => ({
    designationName: formData.designationName.trim(),
    designationCode: formData.designationCode.trim().toUpperCase(),
    departmentWing: formData.departmentWing,
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete designation "${item.designationName}"?`
};

@Component({
  selector: 'app-designation-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class DesignationMasterComponent {
  readonly config = CONFIG;
}
