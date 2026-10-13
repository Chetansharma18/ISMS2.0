import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { SchemeCategoryMasterItem } from '../../core/models/admin-masters.model';

export type { SchemeCategoryMasterItem };

const COLUMNS: TableColumn<SchemeCategoryMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'categoryName', label: 'Category Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'w-28' }
];

const CONFIG: MasterCrudConfig<SchemeCategoryMasterItem> = {
  dataKey: 'SCHEME_CATEGORIES',
  entityLabel: 'Scheme Category',
  title: 'Scheme Category Master',
  primaryActionLabel: 'Save',
  searchPlaceholder: 'Search by category name...',
  searchFields: ['categoryName', 'schemeName'],
  itemUnit: 'categories',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[480px]',
  fields: [
    {
      key: 'categoryName',
      label: 'Category Name',
      type: 'text',
      required: true,
      maxLength: 100,
      placeholder: 'Enter category name',
      colSpan: 3
    }
  ],
  createDefaults: () => ({
    categoryName: ''
  }),
  buildPayload: (formData) => ({
    categoryName: formData.categoryName.trim(),
    schemeName: formData.categoryName.trim(),
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete Scheme Category "${item.categoryName}"?`
};

@Component({
  selector: 'app-scheme-category-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class SchemeCategoryMasterComponent {
  readonly config = CONFIG;
}
