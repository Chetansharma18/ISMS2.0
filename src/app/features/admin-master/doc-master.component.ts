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
import { SchemeRequirementsService } from '../../core/services/scheme-requirements.service';

export type { DocMasterItem };

export const DOC_MASTER_STORAGE_KEY = 'DOC_MASTER_ITEMS';
export const INITIAL_DOC_ITEMS: DocMasterItem[] = MOCK_DOC_MASTER_ITEMS;

export const DOC_TYPE_OPTIONS: string[] = [
  'Statutory & Legal',
  'Financial Documents',
  'Technical & Infrastructure',
  'Past Experience & Track Record',
  'Affidavit & Undertaking',
  'Organization & Signatory',
  'Accreditation & Affiliation',
  'Other / General Document'
];

export const FORMAT_OPTIONS: string[] = [
  'PDF',
  'JPG',
  'JPEG',
  'PNG',
  'DOC',
  'DOCX',
  'XLS',
  'XLSX'
];

export const SIZE_OPTIONS: string[] = [
  '1 MB',
  '2 MB',
  '5 MB',
  '10 MB',
  '15 MB',
  '20 MB',
  '25 MB',
  '50 MB'
];

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
  { key: 'docName', label: 'Document Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[200px]' },
  { key: 'docType', label: 'Document Type', type: 'custom', cellClass: 'text-slate-700 min-w-[140px]' },
  { key: 'allowedFormats', label: 'Allowed Formats', type: 'custom', cellClass: 'min-w-[150px]' },
  { key: 'maxSizeMb', label: 'Size Limit', type: 'custom', align: 'center', cellClass: 'text-center whitespace-nowrap min-w-[95px]' },
  { key: 'schemes', label: 'Applicable Schemes', type: 'custom', cellClass: 'text-slate-700 min-w-[130px]' }
];

const CONFIG: MasterCrudConfig<DocMasterItem> = {
  dataKey: 'DOC_MASTERS',
  entityLabel: 'Document',
  title: 'Doc Master',
  searchPlaceholder: 'Search by document name, type, format or scheme...',
  searchFields: ['docName', 'docType', 'schemes', 'allowedFormats'],
  itemUnit: 'documents',
  columns: COLUMNS,
  hasStatus: true,
  hideViewAction: true,
  tagsColumns: ['schemes', 'allowedFormats'],
  modalWidthClass: 'max-w-[640px]',
  filters: [
    {
      key: 'docType',
      label: 'Document Type',
      placeholder: 'All Document Types',
      options: DOC_TYPE_OPTIONS
    },
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
      key: 'docType',
      label: 'Document Type / Category',
      type: 'select',
      required: true,
      options: DOC_TYPE_OPTIONS,
      placeholder: 'Select Document Type',
      colSpan: 1
    },
    {
      key: 'allowedFormats',
      label: 'Allowed Formats',
      type: 'multiselect',
      required: true,
      options: FORMAT_OPTIONS,
      placeholder: 'Select Formats',
      colSpan: 1
    },
    {
      key: 'maxSizeMb',
      label: 'Max File Size Limit',
      type: 'select',
      required: true,
      options: SIZE_OPTIONS,
      placeholder: 'Select Size Limit',
      colSpan: 1
    },
    {
      key: 'schemes',
      label: 'Applicable Schemes',
      type: 'multiselect',
      required: true,
      options: SCHEME_OPTIONS,
      placeholder: 'Select Applicable Schemes',
      colSpan: 3
    },
    {
      key: 'description',
      label: 'Upload Guidelines / Description',
      type: 'textarea',
      rows: 2,
      maxLength: 300,
      placeholder: 'Optional upload instructions or specifications for applicants...',
      colSpan: 3
    }
  ],
  createDefaults: () => ({
    docName: '',
    docType: 'Statutory & Legal',
    allowedFormats: ['PDF', 'JPG', 'PNG'],
    maxSizeMb: '5 MB',
    schemes: [],
    description: ''
  }),
  buildPayload: (formData) => ({
    docName: (formData.docName || '').trim(),
    docType: formData.docType || 'Statutory & Legal',
    allowedFormats: Array.isArray(formData.allowedFormats) && formData.allowedFormats.length > 0
      ? formData.allowedFormats
      : ['PDF'],
    maxSizeMb: formData.maxSizeMb || '5 MB',
    schemes: Array.isArray(formData.schemes) ? formData.schemes : [],
    description: (formData.description || '').trim(),
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

    <!-- Document Type Pill Template -->
    <ng-template #docTypeTemplate let-item>
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
        {{ item.docType || 'Statutory & Legal' }}
      </span>
    </ng-template>

    <!-- Allowed Formats Badges Template -->
    <ng-template #formatsTemplate let-item>
      <div class="flex flex-wrap items-center gap-1">
        @for (fmt of item.allowedFormats || ['PDF']; track fmt) {
          <span
            class="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-semibold border select-none"
            [ngClass]="getFormatBadgeClass(fmt)"
          >
            {{ fmt }}
          </span>
        }
      </div>
    </ng-template>

    <!-- File Size Limit Badge Template -->
    <ng-template #sizeTemplate let-item>
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap">
        {{ formatSize(item.maxSizeMb) }}
      </span>
    </ng-template>

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
  @ViewChild('docTypeTemplate', { static: true }) docTypeTemplate!: TemplateRef<unknown>;
  @ViewChild('formatsTemplate', { static: true }) formatsTemplate!: TemplateRef<unknown>;
  @ViewChild('sizeTemplate', { static: true }) sizeTemplate!: TemplateRef<unknown>;
  @ViewChild(MasterCrudPageComponent) masterCrud?: MasterCrudPageComponent<DocMasterItem>;

  private dataEngine?: DataEngineService;
  private cdr?: ChangeDetectorRef;
  private docRepo?: ResourceRepository<DocMasterItem>;
  private schemeReqService?: SchemeRequirementsService;

  constructor() {
    try {
      this.dataEngine = inject(DataEngineService);
      this.cdr = inject(ChangeDetectorRef);
      this.docRepo = this.dataEngine.for<DocMasterItem>('DOC_MASTERS', { idKey: 'id' });
      this.schemeReqService = inject(SchemeRequirementsService);
    } catch {
      // Allowed in isolated unit tests
    }
  }

  readonly config = CONFIG;
  readonly isSchemesModalOpen = signal<boolean>(false);
  readonly selectedTargetItem = signal<MasterItemTarget | null>(null);

  get extraTemplates(): Record<string, TemplateRef<unknown>> {
    return {
      schemes: this.schemesTemplate,
      docType: this.docTypeTemplate,
      allowedFormats: this.formatsTemplate,
      maxSizeMb: this.sizeTemplate
    };
  }

  getFormatBadgeClass(fmt: string): string {
    const upper = (fmt || '').toUpperCase().trim();
    if (upper === 'PDF') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (upper.includes('JPG') || upper.includes('JPEG') || upper.includes('PNG')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (upper.includes('DOC')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (upper.includes('XLS')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  }

  formatSize(size: string | number | undefined): string {
    if (!size) return '5 MB';
    if (typeof size === 'number') return `${size} MB`;
    return String(size).includes('MB') ? String(size) : `${size} MB`;
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
        this.schemeReqService?.syncWithMasters();
        this.cdr?.markForCheck();
      }
    });
  }
}
