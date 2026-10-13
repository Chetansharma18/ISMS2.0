import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { GradingMasterItem } from '../../core/models/admin-masters.model';

export type { GradingMasterItem };

const COLUMNS: TableColumn<GradingMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'grade', label: 'Grade', cellClass: 'whitespace-nowrap font-semibold text-slate-800', width: 'w-48' },
  { key: 'range', label: 'Range', cellClass: 'whitespace-nowrap font-medium text-slate-700' }
];

const CONFIG: MasterCrudConfig<GradingMasterItem> = {
  dataKey: 'GRADING_MASTERS',
  entityLabel: 'Grade',
  title: 'Grading Master',
  primaryActionLabel: 'Save',
  searchPlaceholder: 'Search by grade or range...',
  searchFields: ['grade', 'range'],
  itemUnit: 'grades',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[480px]',
  fields: [
    {
      key: 'grade',
      label: 'Grade',
      type: 'text',
      required: true,
      maxLength: 20,
      placeholder: 'Enter Grade (e.g. A+, A, B)',
      colSpan: 3
    },
    {
      key: 'minimum',
      label: 'Minimum',
      type: 'number',
      required: true,
      min: 0,
      placeholder: 'Enter minimum value',
      colSpan: 3
    },
    {
      key: 'maximum',
      label: 'Maximum',
      type: 'number',
      required: true,
      min: 0,
      placeholder: 'Enter maximum value',
      colSpan: 3
    }
  ],
  createDefaults: () => ({
    grade: '',
    minimum: null,
    maximum: null
  }),
  buildPayload: (formData) => {
    const min =
      formData.minimum !== null && formData.minimum !== undefined && formData.minimum !== ''
        ? Number(formData.minimum)
        : 0;
    const max =
      formData.maximum !== null && formData.maximum !== undefined && formData.maximum !== ''
        ? Number(formData.maximum)
        : 0;

    return {
      grade: String(formData.grade || '').trim(),
      minimum: min,
      maximum: max,
      range: `${min} - ${max}`,
      status: 'Active'
    };
  },
  deleteConfirmText: (item) => `Are you sure you want to delete grade "${item.grade}"?`
};

@Component({
  selector: 'app-grading-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class GradingMasterComponent {
  readonly config = CONFIG;
}
