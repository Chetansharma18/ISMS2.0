import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { CourseMasterItem, SectorMasterItem } from '../../core/models/admin-masters.model';
import { DataEngineService } from '../../core/services/data-engine.service';
import { SKILL_SECTOR_NAMES } from '../../core/config/sector.config';

export type { CourseMasterItem };

/** Sector names for the dropdown: active sectors of the Sector Master once loaded, the built-in list until then. */
const sectorOptions = signal<string[]>([...SKILL_SECTOR_NAMES]);

const COMMON_NORMS_OPTIONS = ['I', 'II', 'III'];

const COLUMNS: TableColumn<CourseMasterItem>[] = [
  { key: 'sNo', label: 'Sr.No.', type: 'number', align: 'center', width: 'w-14' },
  { key: 'jobRoleName', label: 'Course / Job Role Name', cellClass: 'font-semibold text-slate-800' },
  { key: 'jobRoleCode', label: 'QP Code', cellClass: 'whitespace-nowrap tabular-nums text-xs text-slate-600', width: 'w-32' },
  { key: 'sector', label: 'Sector', cellClass: 'whitespace-nowrap font-medium text-slate-700' },
  { key: 'nsqfLevel', label: 'NSQF Level', align: 'center', cellClass: 'whitespace-nowrap text-slate-700', width: 'w-24' },
  {
    key: 'totalQpHours',
    label: 'Total Hours',
    align: 'center',
    type: 'number',
    cellClass: 'whitespace-nowrap font-semibold text-slate-800',
    width: 'w-28',
    format: (val: number) => (val ? `${val} hrs` : '-')
  }
];

const VIEW_COLUMNS: TableColumn<CourseMasterItem>[] = [
  { key: 'sector', label: 'Sector' },
  { key: 'jobRoleName', label: 'QP/Job Role Name' },
  { key: 'jobRoleCode', label: 'QP/Job Role Code' },
  { key: 'version', label: 'Version' },
  { key: 'nsqfLevel', label: 'NSQF Level' },
  { key: 'commonNormsCategory', label: 'Common Norms Category' },
  { key: 'theoryDurationHours', label: 'Theory Duration (In hours)' },
  { key: 'practicalOjtDurationHours', label: 'Practical + Mandatory OJT Duration (In hours)' },
  { key: 'itSoftSkillTrainingHours', label: 'IT & Soft Skill Training' },
  { key: 'totalQpHours', label: 'Total QP Hours' },
  { key: 'courseValidUpToDate', label: 'Course Valid Up to Date' },
  { key: 'remark', label: 'Remark' }
];

const CONFIG: MasterCrudConfig<CourseMasterItem> = {
  dataKey: 'COURSES',
  entityLabel: 'Course',
  title: 'Course Master',
  searchPlaceholder: 'Search by sector, job role name, or QP code...',
  searchFields: ['sector', 'jobRoleName', 'jobRoleCode'],
  itemUnit: 'courses',
  columns: COLUMNS,
  viewColumns: VIEW_COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[720px]',
  viewModalWidthClass: 'max-w-[640px]',
  filters: [
    {
      key: 'sector',
      label: 'Sector',
      placeholder: 'All Sectors',
      options: () => sectorOptions()
    }
  ],
  fields: [
    { key: 'sector', label: 'Sector', type: 'select', required: true, options: () => sectorOptions(), colSpan: 2 },
    { key: 'jobRoleName', label: 'QP/Job Role Name', type: 'text', required: true, maxLength: 120, placeholder: 'Enter job role name', colSpan: 1 },
    { key: 'jobRoleCode', label: 'QP/Job Role Code', type: 'text', required: true, placeholder: 'e.g. AAS/Q6301', colSpan: 1 },
    { key: 'version', label: 'Version', type: 'text', placeholder: 'e.g. 1.0, 2.0', colSpan: 1 },
    { key: 'nsqfLevel', label: 'NSQF Level', type: 'text', placeholder: 'e.g. 4, 2.5', colSpan: 1 },
    { key: 'commonNormsCategory', label: 'Common Norms Category', type: 'select', options: COMMON_NORMS_OPTIONS, colSpan: 1 },
    { key: 'theoryDurationHours', label: 'Theory Duration (Hours)', type: 'number', min: 0, placeholder: 'e.g. 150', colSpan: 1 },
    { key: 'practicalOjtDurationHours', label: 'Practical + OJT Duration', type: 'text', placeholder: 'e.g. 180+60', colSpan: 1 },
    { key: 'itSoftSkillTrainingHours', label: 'IT & Soft Skill Training (Hours)', type: 'number', min: 0, placeholder: 'e.g. 100', colSpan: 1 },
    { key: 'totalQpHours', label: 'Total QP Hours', type: 'number', min: 0, placeholder: 'e.g. 490', colSpan: 1 },
    { key: 'courseValidUpToDate', label: 'Course Valid Up to Date', type: 'text', placeholder: 'e.g. 28-Apr-25', colSpan: 1 },
    { key: 'remark', label: 'Remark', type: 'text', placeholder: 'e.g. Expired, New Version, Not Valid...', colSpan: 3 }
  ],
  createDefaults: () => ({
    sector: '',
    jobRoleName: '',
    jobRoleCode: '',
    version: '1.0',
    nsqfLevel: '4',
    commonNormsCategory: 'I',
    theoryDurationHours: 120,
    practicalOjtDurationHours: '150+60',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 430,
    courseValidUpToDate: '',
    remark: ''
  }),
  buildPayload: (formData) => ({
    sector: formData.sector.trim(),
    jobRoleName: formData.jobRoleName.trim(),
    jobRoleCode: formData.jobRoleCode.trim(),
    version: (formData.version || '').trim() || '1.0',
    nsqfLevel: (formData.nsqfLevel || '').trim() || '4',
    commonNormsCategory: formData.commonNormsCategory || 'I',
    theoryDurationHours: Number(formData.theoryDurationHours) || 0,
    practicalOjtDurationHours: (formData.practicalOjtDurationHours || '').trim() || '0',
    itSoftSkillTrainingHours: Number(formData.itSoftSkillTrainingHours) || 0,
    totalQpHours: Number(formData.totalQpHours) || 0,
    courseValidUpToDate: (formData.courseValidUpToDate || '').trim() || '-',
    remark: (formData.remark || '').trim() || 'New Version',
    status: formData.status || 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete course "${item.jobRoleName}" (${item.jobRoleCode})?`
};

@Component({
  selector: 'app-course-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class CourseMasterComponent {
  readonly config = CONFIG;

  constructor() {
    // The backend links a course to the sector by name, so the dropdown offers the Sector Master's names.
    inject(DataEngineService)
      .for<SectorMasterItem>('SECTORS')
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: sectors => {
          const names = [...new Set(sectors.filter(s => s.status !== 'Inactive').map(s => s.sectorName).filter(Boolean))];
          if (names.length > 0) sectorOptions.set(names.sort((a, b) => a.localeCompare(b)));
        },
        error: () => {}
      });
  }
}
