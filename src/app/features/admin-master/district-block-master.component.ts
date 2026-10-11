import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { DistrictBlockMasterItem } from '../../core/models/admin-masters.model';

export type { DistrictBlockMasterItem };

const COLUMNS: TableColumn<DistrictBlockMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'districtName', label: 'District Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'districtCode', label: 'District Code', cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700' },
  { key: 'blockName', label: 'Block Name', cellClass: 'whitespace-nowrap font-medium text-slate-700' },
  { key: 'blockCode', label: 'Block Code', cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700' }
];

const CONFIG: MasterCrudConfig<DistrictBlockMasterItem> = {
  dataKey: 'DISTRICTS',
  entityLabel: 'District & Block',
  title: 'District & Block Master',
  searchPlaceholder: 'Search by district name, block name, or code...',
  searchFields: ['districtName', 'districtCode', 'blockName', 'blockCode'],
  itemUnit: 'entries',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[540px]',
  fields: [
    { key: 'districtName', label: 'District Name', type: 'text', required: true, maxLength: 80, placeholder: 'Enter district name (e.g. Jaipur)', colSpan: 2 },
    { key: 'districtCode', label: 'District Code', type: 'text', required: true, maxLength: 20, placeholder: 'e.g. JPR', uppercase: true, colSpan: 1 },
    { key: 'blockName', label: 'Block Name', type: 'text', required: true, maxLength: 80, placeholder: 'Enter block name (e.g. Amber)', colSpan: 2 },
    { key: 'blockCode', label: 'Block Code', type: 'text', maxLength: 30, placeholder: 'e.g. JPR-AMB', uppercase: true, colSpan: 1 }
  ],
  createDefaults: () => ({
    districtName: '',
    districtCode: '',
    blockName: '',
    blockCode: ''
  }),
  buildPayload: (formData) => {
    const districtCode = formData.districtCode.trim().toUpperCase();
    const blockCode = (formData.blockCode || '').trim() || `${districtCode}-${formData.blockName.trim().slice(0, 3).toUpperCase()}`;
    return {
      districtName: formData.districtName.trim(),
      districtCode,
      blockName: formData.blockName.trim(),
      blockCode,
      status: 'Active'
    };
  },
  deleteConfirmText: (item) => `Are you sure you want to delete "${item.blockName}" block in "${item.districtName}"?`
};

@Component({
  selector: 'app-district-block-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class DistrictBlockMasterComponent {
  readonly config = CONFIG;
}
