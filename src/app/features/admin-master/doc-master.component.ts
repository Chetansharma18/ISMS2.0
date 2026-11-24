import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MasterCrudConfig, MasterCrudPageComponent, TableColumn } from '../../shared';
import { DocMasterItem, SchemeMasterItem } from '../../core/models/admin-masters.model';
import { ALL_SCHEMES } from '../../core/models/master-adapters';
import { DataEngineService } from '../../core/services/data-engine.service';

export type { DocMasterItem };
export { DOC_MASTER_STORAGE_KEY, INITIAL_DOC_ITEMS } from './doc-master.data';

/** Scheme choices: "ALL Schemes" (a document every scheme asks for) and the active schemes of the Scheme Master. */
const schemeOptions = signal<string[]>([ALL_SCHEMES]);

const COLUMNS: TableColumn<DocMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'schemeName', label: 'Scheme Name', cellClass: 'font-semibold text-slate-800 min-w-[220px]' },
  { key: 'documents', label: 'Document', cellClass: 'font-medium text-slate-700 min-w-[200px]' },
  { key: 'allowedExtensions', label: 'Allowed Types', cellClass: 'whitespace-nowrap text-xs text-slate-600', format: v => (v as string) || '-' },
  { key: 'maxFileSizeMb', label: 'Max Size', align: 'center', cellClass: 'whitespace-nowrap text-slate-700', format: v => (v ? `${v} MB` : '-') },
  { key: 'isMandatory', label: 'Mandatory', align: 'center', cellClass: 'whitespace-nowrap text-slate-700', format: v => (v ? 'Yes' : 'No') }
];

const CONFIG: MasterCrudConfig<DocMasterItem> = {
  dataKey: 'DOC_MASTERS',
  entityLabel: 'Document',
  title: 'Doc Master',
  primaryActionLabel: 'Save',
  searchPlaceholder: 'Search by scheme or document...',
  searchFields: ['schemeName', 'documents'],
  itemUnit: 'documents',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[560px]',
  fields: [
    { key: 'schemeName', label: 'Scheme Name', type: 'select', required: true, options: () => schemeOptions(), colSpan: 3 },
    { key: 'documents', label: 'Document Name', type: 'text', required: true, maxLength: 200, placeholder: 'e.g. PAN Card', colSpan: 3 },
    { key: 'allowedExtensions', label: 'Allowed File Types', type: 'text', maxLength: 100, placeholder: '.pdf,.jpg,.jpeg,.png', colSpan: 2 },
    { key: 'maxFileSizeMb', label: 'Max Size (MB)', type: 'number', min: 1, placeholder: 'e.g. 5', colSpan: 1 },
    { key: 'mandatory', label: 'Mandatory', type: 'select', required: true, options: ['Yes', 'No'], colSpan: 3 }
  ],
  createDefaults: () => ({
    schemeName: ALL_SCHEMES,
    documents: '',
    allowedExtensions: '.pdf,.jpg,.jpeg,.png',
    maxFileSizeMb: 5,
    mandatory: 'No'
  }),
  buildPayload: formData => ({
    schemeName: String(formData.schemeName || ALL_SCHEMES).trim(),
    documents: String(formData.documents || '').trim(),
    allowedExtensions: String(formData.allowedExtensions || '').trim() || '.pdf,.jpg,.jpeg,.png',
    maxFileSizeMb: Number(formData.maxFileSizeMb) > 0 ? Number(formData.maxFileSizeMb) : 5,
    isMandatory: formData.mandatory === 'Yes',
    status: formData.status === 'Inactive' ? 'Inactive' : 'Active'
  }),
  deleteConfirmText: item => `Are you sure you want to delete "${item.documents}" for ${item.schemeName}?`
};

/** Doc Master (`/api/master/doc-masters`): documents each scheme asks applicants to upload. */
@Component({
  selector: 'app-doc-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class DocMasterComponent {
  readonly config = CONFIG;

  constructor() {
    inject(DataEngineService)
      .for<SchemeMasterItem>('SCHEME_MASTERS')
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: schemes => {
          const names = [...new Set(schemes.filter(s => s.status !== 'Inactive').map(s => s.schemeName).filter(Boolean))];
          schemeOptions.set([ALL_SCHEMES, ...names]);
        },
        error: () => {}
      });
  }
}
