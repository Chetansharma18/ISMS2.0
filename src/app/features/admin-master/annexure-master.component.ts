import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { AnnexureMasterItem } from '../../core/models/admin-masters.model';
import { MOCK_ANNEXURE_MASTER_ITEMS } from '../../core/mock/data/admin-masters.mock';

export type { AnnexureMasterItem };

export const ANNEXURE_MASTER_STORAGE_KEY = 'ANNEXURE_MASTER_ITEMS';
export const INITIAL_ANNEXURE_ITEMS: AnnexureMasterItem[] = MOCK_ANNEXURE_MASTER_ITEMS;

const SCHEME_OPTIONS: string[] = [
  'Vishwakarma Yuva Udyami Protsahan Yojana',
  'Mukhyamantri Yuva Swarojgar Yojana (2026)',
  'Mukhyamantri Yuva Sambal Yojana',
  'Mukhya Mantri Yuva Kaushal Yojana',
  'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)'
];

const COLUMNS: TableColumn<AnnexureMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'annexureName', label: 'Annexure Name', cellClass: 'font-semibold text-slate-800 min-w-[260px]' },
  { key: 'schemes', label: 'Applicable Schemes', cellClass: 'text-slate-700' }
];

const CONFIG: MasterCrudConfig<AnnexureMasterItem> = {
  dataKey: 'ANNEXURE_MASTERS',
  entityLabel: 'Annexure',
  title: 'Annexure Master',
  searchPlaceholder: 'Search by annexure name or scheme...',
  searchFields: ['annexureName', 'schemes'],
  itemUnit: 'annexures',
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
      key: 'annexureName',
      label: 'Annexure Name',
      type: 'text',
      required: true,
      maxLength: 200,
      placeholder: 'Enter annexure name (e.g. Annexure-1: Covering Letter)',
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
    annexureName: '',
    schemes: []
  }),
  buildPayload: (formData) => ({
    annexureName: (formData.annexureName || '').trim(),
    schemes: Array.isArray(formData.schemes) ? formData.schemes : [],
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete "${item.annexureName}"?`
};

@Component({
  selector: 'app-annexure-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class AnnexureMasterComponent {
  readonly config = CONFIG;
}
