import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { SectorMasterItem } from '../../core/models/admin-masters.model';

export type { SectorMasterItem };

const COLUMNS: TableColumn<SectorMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'sectorName', label: 'Sector Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'sectorCode', label: 'Sector Code', cellClass: 'whitespace-nowrap font-medium text-slate-700' }
];

const CONFIG: MasterCrudConfig<SectorMasterItem> = {
  dataKey: 'SECTORS',
  entityLabel: 'Sector',
  title: 'Sector Master',
  searchPlaceholder: 'Search by sector name or code...',
  searchFields: ['sectorName', 'sectorCode'],
  itemUnit: 'sectors',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[500px]',
  fields: [
    { key: 'sectorName', label: 'Sector Name', type: 'text', required: true, maxLength: 100, placeholder: 'Enter sector name (e.g. Aerospace and Aviation)', colSpan: 3 },
    { key: 'sectorCode', label: 'Sector Code', type: 'text', maxLength: 30, placeholder: 'Enter sector code (e.g. SEC-001)', colSpan: 3 }
  ],
  createDefaults: () => ({
    sectorName: '',
    sectorCode: ''
  }),
  buildPayload: (formData) => ({
    sectorName: formData.sectorName.trim(),
    sectorCode: (formData.sectorCode || '').trim() || `SEC-${Date.now().toString().slice(-4)}`,
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete sector "${item.sectorName}"?`
};

@Component({
  selector: 'app-sector-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class SectorMasterComponent {
  readonly config = CONFIG;
}
