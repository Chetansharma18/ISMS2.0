import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { API_ENDPOINTS } from '../../core/config/api.config';
import { HttpService } from '../../core/http/http.service';
import { DesignationMasterItem } from '../../core/models/admin-masters.model';
import { DataEngineService } from '../../core/services/data-engine.service';

export type { DesignationMasterItem };

const DEFAULT_DEPARTMENTS = [
  'Administration',
  'Operations & Skill Training',
  'Finance & Accounts',
  'IT & CCTV Monitoring',
  'Scrutiny & Approvals'
];

/** The default departments plus every department already used (GET /api/master/designations/departments). */
const departmentOptions = signal<string[]>(DEFAULT_DEPARTMENTS);

const COLUMNS: TableColumn<DesignationMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'designationName', label: 'Designation Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'designationCode', label: 'Designation Code', cellClass: 'whitespace-nowrap tabular-nums text-xs text-slate-700' },
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
  hideViewAction: true,
  modalWidthClass: 'max-w-[520px]',
  filters: [
    {
      key: 'departmentWing',
      label: 'Department',
      placeholder: 'All Departments',
      options: () => departmentOptions()
    }
  ],
  fields: [
    { key: 'designationName', label: 'Designation Name', type: 'text', required: true, maxLength: 100, placeholder: 'Enter designation name (e.g. Joint Director)', colSpan: 3 },
    { key: 'designationCode', label: 'Designation Code', type: 'text', required: true, maxLength: 30, placeholder: 'e.g. JD', uppercase: true, colSpan: 3 },
    { key: 'departmentWing', label: 'Department / Wing', type: 'select', options: () => departmentOptions(), colSpan: 3 }
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

  constructor() {
    if (inject(DataEngineService).isMock('DESIGNATIONS')) return;
    inject(HttpService)
      .call<unknown>(API_ENDPOINTS.DESIGNATION_DEPARTMENTS.LIST, { flags: { skipErrorToast: true } })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: res => {
          const stored = Array.isArray(res) ? res.filter((d): d is string => typeof d === 'string' && d.trim() !== '') : [];
          departmentOptions.set([...new Set([...DEFAULT_DEPARTMENTS, ...stored.map(d => d.trim())])]);
        },
        error: () => {}
      });
  }
}
