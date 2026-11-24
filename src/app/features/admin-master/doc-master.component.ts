import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn,
  IconComponent
} from '../../shared';
import { DocMasterItem } from '../../core/models/admin-masters.model';
import { MOCK_DOC_MASTER_ITEMS } from '../../core/mock/data/admin-masters.mock';
import {
  AssociatedSchemesModalComponent,
  MasterItemTarget
} from './associated-schemes-modal.component';
import { DataEngineService, ResourceRepository } from '../../core/services/data-engine.service';

export type { DocMasterItem };

export const DOC_MASTER_STORAGE_KEY = 'DOC_MASTER_ITEMS';
export const INITIAL_DOC_ITEMS: DocMasterItem[] = MOCK_DOC_MASTER_ITEMS;

const SCHEME_OPTIONS: string[] = [
  'Vishwakarma Yuva Udyami Protsahan Yojana',
  'Mukhyamantri Yuva Swarojgar Yojana (2026)',
  'Mukhyamantri Yuva Sambal Yojana',
  'Mukhya Mantri Yuva Kaushal Yojana',
  'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
  'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
  'Rooftop Solar Skill Development Scheme (Surya Ghar Yojana)'
];

const COLUMNS: TableColumn<DocMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'docName', label: 'Document Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[220px]' },
  { key: 'schemes', label: 'Applicable Schemes', type: 'custom', cellClass: 'text-slate-700 min-w-[150px]' }
];

const CONFIG: MasterCrudConfig<DocMasterItem> = {
  dataKey: 'DOC_MASTERS',
  entityLabel: 'Document',
  title: 'Doc Master',
  searchPlaceholder: 'Search by document name or scheme...',
  searchFields: ['docName', 'schemes'],
  itemUnit: 'documents',
  columns: COLUMNS,
  hasStatus: true,
  hideViewAction: true,
  tagsColumns: ['schemes'],
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
  imports: [CommonModule, MasterCrudPageComponent, IconComponent, AssociatedSchemesModalComponent],
  template: `
    <app-master-crud-page [config]="config" [extraTemplates]="extraTemplates">
    </app-master-crud-page>

    <!-- Compact Interactive Schemes Count Pill Template -->
    <ng-template #schemesTemplate let-item>
      <div class="py-1">
        <button
          appButton
          variant="outline"
          size="xs"
          type="button"
          (click)="openAssociatedSchemes(item, $event)"
          [title]="'View and manage ' + (item.schemes?.length || 0) + ' associated schemes'"
        >
          <app-icon name="clipboard-check" size="xs" />
          <span>{{ item.schemes?.length || 0 }} Schemes</span>
        </button>
      </div>
    </ng-template>

    <!-- Slide-over Drawer / Modal for Associated Schemes -->
    <app-associated-schemes-modal
      [isOpen]="isSchemesModalOpen()"
      [targetItem]="selectedTargetItem()"
      (close)="closeSchemesModal()"
      (schemesUpdated)="onSchemesUpdated($event)"
    />
  `
})
export class DocMasterComponent {
  @ViewChild('schemesTemplate', { static: true }) schemesTemplate!: TemplateRef<unknown>;
  @ViewChild(MasterCrudPageComponent) masterCrud?: MasterCrudPageComponent<DocMasterItem>;

  private dataEngine?: DataEngineService;
  private cdr?: ChangeDetectorRef;
  private docRepo?: ResourceRepository<DocMasterItem>;

  constructor() {
    try {
      this.dataEngine = inject(DataEngineService);
      this.cdr = inject(ChangeDetectorRef);
      this.docRepo = this.dataEngine.for<DocMasterItem>('DOC_MASTERS', { idKey: 'id' });
    } catch {
      // Allowed in isolated unit tests
    }
  }

  readonly config = CONFIG;
  readonly isSchemesModalOpen = signal<boolean>(false);
  readonly selectedTargetItem = signal<MasterItemTarget | null>(null);

  get extraTemplates(): Record<string, TemplateRef<unknown>> {
    return { schemes: this.schemesTemplate };
  }

  openAssociatedSchemes(item: DocMasterItem, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedTargetItem.set({
      id: item.id,
      name: item.docName,
      type: 'DOCUMENT',
      schemes: item.schemes
    });
    this.isSchemesModalOpen.set(true);
    this.cdr?.markForCheck();
  }

  closeSchemesModal(): void {
    this.isSchemesModalOpen.set(false);
    this.selectedTargetItem.set(null);
    this.cdr?.markForCheck();
  }

  onSchemesUpdated(event: { itemId: string; schemes: string[] }): void {
    this.docRepo?.update(event.itemId, { schemes: event.schemes }).subscribe({
      next: () => {
        this.masterCrud?.items.update(list =>
          list.map(it => (it.id === event.itemId ? { ...it, schemes: event.schemes } : it))
        );
        this.cdr?.markForCheck();
      }
    });
  }
}
