import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { CourseMasterItem } from '../../core/models/admin-masters.model';
import { SKILL_SECTOR_NAMES } from '../../core/config/sector.config';

export type { CourseMasterItem };

const SECTOR_OPTIONS = [...SKILL_SECTOR_NAMES];

const COMMON_NORMS_OPTIONS = ['I', 'II', 'III'];

const COLUMNS: TableColumn<CourseMasterItem>[] = [
  { key: 'sNo', label: 'Sr.No.', type: 'number', align: 'center', width: 'w-14 min-w-[55px]' },
  { key: 'sector', label: 'Sector', cellClass: 'whitespace-nowrap font-medium text-slate-800 min-w-[140px]' },
  { key: 'jobRoleName', label: 'QP/Job Role Name', cellClass: 'font-semibold text-slate-800 min-w-[180px]' },
  { key: 'jobRoleCode', label: 'QP/Job Role Code', cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700 min-w-[120px]' },
  { key: 'version', label: 'Version', align: 'center', cellClass: 'whitespace-nowrap text-slate-700 min-w-[70px]' },
  { key: 'nsqfLevel', label: 'NSQF Level', align: 'center', cellClass: 'whitespace-nowrap text-slate-700 min-w-[85px]' },
  { key: 'commonNormsCategory', label: 'Common Norms Category', align: 'center', cellClass: 'whitespace-nowrap text-slate-700 min-w-[120px]' },
  { key: 'theoryDurationHours', label: 'Theory Duration (In hours)', align: 'center', type: 'number', cellClass: 'whitespace-nowrap min-w-[110px]' },
  { key: 'practicalOjtDurationHours', label: 'Practical + Mandatory OJT Duration (In hours)', align: 'center', cellClass: 'whitespace-nowrap text-slate-700 min-w-[160px]' },
  { key: 'itSoftSkillTrainingHours', label: 'IT & Soft Skill Training', align: 'center', type: 'number', cellClass: 'whitespace-nowrap min-w-[110px]' },
  { key: 'totalQpHours', label: 'Total QP Hours', align: 'center', type: 'number', cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[100px]' },
  { key: 'courseValidUpToDate', label: 'Course Valid Up to Date', align: 'center', cellClass: 'whitespace-nowrap text-slate-700 min-w-[130px]' },
  {
    key: 'remark',
    label: 'Remark',
    cellClass: (value: string) => {
      const base = 'min-w-[140px] text-xs font-medium whitespace-nowrap';
      if (value === 'Expired') return `${base} text-rose-600`;
      if (value === 'New Version' || value === 'New Course') return `${base} text-emerald-600`;
      if (value === 'Not Valid') return `${base} text-slate-600`;
      return `${base} text-amber-800`;
    }
  }
];

const CONFIG: MasterCrudConfig<CourseMasterItem> = {
  dataKey: 'COURSES',
  entityLabel: 'Course',
  title: 'Course Master',
  searchPlaceholder: 'Search by sector, job role name, or QP code...',
  searchFields: ['sector', 'jobRoleName', 'jobRoleCode'],
  itemUnit: 'courses',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[720px]',
  fields: [
    { key: 'sector', label: 'Sector', type: 'select', required: true, options: SECTOR_OPTIONS, colSpan: 2 },
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
}
