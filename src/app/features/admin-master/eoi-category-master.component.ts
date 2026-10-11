import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { EoiCategoryItem } from '../../core/models/admin-masters.model';

export type { EoiCategoryItem };

const COLUMNS: TableColumn<EoiCategoryItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'categoryTitle', label: 'EOI Category Title', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'description', label: 'Description', cellClass: 'text-slate-600 text-xs' }
];

const CONFIG: MasterCrudConfig<EoiCategoryItem> = {
  dataKey: 'EOI_CATEGORIES',
  entityLabel: 'EOI Category',
  title: 'EOI Category Master',
  searchPlaceholder: 'Search by category title or description...',
  searchFields: ['categoryTitle', 'description'],
  itemUnit: 'categories',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[500px]',
  fields: [
    { key: 'categoryTitle', label: 'EOI Category Title', type: 'text', required: true, maxLength: 100, placeholder: 'Enter category title', colSpan: 3 },
    { key: 'description', label: 'Description', type: 'textarea', maxLength: 250, placeholder: 'Enter category description', colSpan: 3 }
  ],
  createDefaults: () => ({
    categoryTitle: '',
    description: ''
  }),
  buildPayload: (formData) => ({
    categoryTitle: formData.categoryTitle.trim(),
    description: (formData.description || '').trim(),
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete EOI Category "${item.categoryTitle}"?`
};

@Component({
  selector: 'app-eoi-category-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class EoiCategoryMasterComponent {
  readonly config = CONFIG;
}
