import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { DocMasterItem } from '../../core/models/admin-masters.model';
import { MOCK_DOC_MASTER_ITEMS } from '../../core/mock/data/admin-masters.mock';

export type { DocMasterItem };

export const DOC_MASTER_STORAGE_KEY = 'DOC_MASTER_ITEMS';
export const INITIAL_DOC_ITEMS: DocMasterItem[] = MOCK_DOC_MASTER_ITEMS;

const SCHEME_OPTIONS: string[] = [
  'Vishwakarma Yuva Udyami Protsahan Yojana',
  'Mukhyamantri Yuva Swarojgar Yojana (2026)',
  'Mukhyamantri Yuva Sambal Yojana',
  'Mukhya Mantri Yuva Kaushal Yojana',
  'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)'
];

const COLUMNS: TableColumn<DocMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'docName', label: 'Document Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[220px]' },
  { key: 'schemes', label: 'Applicable Schemes', cellClass: 'text-slate-700' }
];

const CONFIG: MasterCrudConfig<DocMasterItem> = {
  dataKey: 'DOC_MASTERS',
  entityLabel: 'Document',
  title: 'Doc Master',
  searchPlaceholder: 'Search by document name or scheme...',
  searchFields: ['docName', 'schemes'],
  itemUnit: 'documents',
  columns: COLUMNS,
  tagsColumns: ['schemes'],
  hasStatus: true,
  hideViewAction: true,
  modalWidthClass: 'max-w-[560px]',
  filters: [
    {
      key: 'schemes',
      label: 'Scheme',
      placeholder: 'All Schemes',
      options: SCHEME_OPTIONS
    }
  ],
  fields: [
    {
      key: 'docName',
      label: 'Document Name',
      type: 'text',
      required: true,
      maxLength: 150,
      placeholder: 'Enter document name (e.g. Company PAN Card)',
      colSpan: 3
    },
    {
      key: 'schemes',
      label: 'Applicable Schemes',
      type: 'multiselect',
      required: true,
      options: SCHEME_OPTIONS,
      placeholder: 'Select Applicable Schemes',
      colSpan: 3
    }
  ],
  createDefaults: () => ({
    docName: '',
    schemes: []
  }),
  buildPayload: (formData) => ({
    docName: (formData.docName || '').trim(),
    schemes: Array.isArray(formData.schemes) ? formData.schemes : [],
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete document "${item.docName}"?`
};

@Component({
  selector: 'app-doc-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class DocMasterComponent {
  readonly config = CONFIG;
}
