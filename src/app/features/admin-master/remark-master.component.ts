import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { RemarkMasterItem } from '../../core/models/admin-masters.model';

export type { RemarkMasterItem };

const COLUMNS: TableColumn<RemarkMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'remarkType', label: 'Remark Type', cellClass: 'whitespace-nowrap font-semibold text-slate-800', width: 'w-52' },
  { key: 'description', label: 'Description', cellClass: 'text-slate-700' },
  { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'w-28' }
];

const CONFIG: MasterCrudConfig<RemarkMasterItem> = {
  dataKey: 'REMARK_MASTERS',
  entityLabel: 'Remarks',
  title: 'Remark Master',
  primaryActionLabel: 'Save',
  searchPlaceholder: 'Search by remark type or description...',
  searchFields: ['remarkType', 'description'],
  itemUnit: 'remarks',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[480px]',
  fields: [
    {
      key: 'remarkType',
      label: 'Remark Type',
      type: 'select',
      required: true,
      options: ['Positive remark', 'Negative remark'],
      placeholder: 'Select Remark Type',
      colSpan: 3
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      maxLength: 500,
      rows: 3,
      placeholder: 'Enter description',
      colSpan: 3
    }
  ],
  createDefaults: () => ({
    remarkType: '',
    description: ''
  }),
  buildPayload: (formData) => ({
    remarkType: formData.remarkType?.trim() || '',
    description: formData.description?.trim() || '',
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete this remark (${item.remarkType})?`
};

@Component({
  selector: 'app-remark-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class RemarkMasterComponent {
  readonly config = CONFIG;
}
