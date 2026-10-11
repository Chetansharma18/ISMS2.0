import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn,
  formatInr
} from '../../shared';
import { SchemeMasterItem } from '../../core/models/admin-masters.model';

export type { SchemeMasterItem };

const SCHEME_CATEGORY_OPTIONS = ['SAMARTH', 'SAKSHM', 'RAJVIK', 'ESTP', 'DDU-GKY'];
const CATEGORY_NAME_OPTIONS = [
  'GENERAL',
  'GOVERNMENT INSTITUTION/PSU',
  'GOVERNMENT INSTITUTION/INSTITUTION',
  'SPECIAL TARGET GROUP'
];

const COLUMNS: TableColumn<SchemeMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'schemeName', label: 'Scheme Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'schemeCategory', label: 'Scheme Category', cellClass: 'whitespace-nowrap font-medium text-slate-700' },
  { key: 'categoryName', label: 'Category Name', cellClass: 'whitespace-nowrap font-medium text-slate-700' },
  {
    key: 'amount',
    label: 'EMD amount',
    align: 'right',
    cellClass: 'whitespace-nowrap font-medium text-slate-800',
    format: (value: number) => formatInr(value ?? 0, { fractionDigits: 2 })
  },
  {
    key: 'processFees',
    label: 'Process Fees',
    align: 'right',
    cellClass: 'whitespace-nowrap font-medium text-slate-800',
    format: (value: number) => formatInr(value ?? 0, { fractionDigits: 2 })
  }
];

const CONFIG: MasterCrudConfig<SchemeMasterItem> = {
  dataKey: 'SCHEME_MASTERS',
  entityLabel: 'Scheme',
  title: 'Scheme Master',
  searchPlaceholder: 'Search by scheme name, category, or category name...',
  searchFields: ['schemeName', 'schemeCategory', 'categoryName'],
  itemUnit: 'schemes',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[560px]',
  fields: [
    { key: 'schemeName', label: 'Scheme Name', type: 'text', required: true, maxLength: 120, placeholder: 'Enter scheme name', colSpan: 3 },
    { key: 'schemeCategory', label: 'Scheme Category', type: 'select', required: true, options: SCHEME_CATEGORY_OPTIONS, colSpan: 2 },
    { key: 'categoryName', label: 'Category Name', type: 'select', required: true, options: CATEGORY_NAME_OPTIONS, colSpan: 1 },
    { key: 'amount', label: 'EMD amount (\u20B9)', type: 'number', required: true, min: 0, placeholder: 'Enter amount', colSpan: 2 },
    { key: 'processFees', label: 'Process Fees (\u20B9)', type: 'number', required: true, min: 0, placeholder: 'Enter process fees', colSpan: 1 }
  ],
  createDefaults: () => ({
    schemeName: '',
    schemeCategory: '',
    categoryName: '',
    amount: null,
    processFees: null
  }),
  buildPayload: (formData) => ({
    schemeName: formData.schemeName.trim(),
    schemeCategory: formData.schemeCategory.trim(),
    categoryName: formData.categoryName.trim(),
    amount: Number(formData.amount),
    processFees: Number(formData.processFees),
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete scheme "${item.schemeName}"?`
};

@Component({
  selector: 'app-scheme-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class SchemeMasterComponent {
  readonly config = CONFIG;
}
