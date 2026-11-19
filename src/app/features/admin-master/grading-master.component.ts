import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn
} from '../../shared';
import { GradingMasterItem, SchemeMasterItem } from '../../core/models/admin-masters.model';
import { DataEngineService } from '../../core/services/data-engine.service';

export type { GradingMasterItem };

export const DEFAULT_GRADING_SCHEMES = [
  'ALL Schemes',
  'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
  'Vishwakarma Yuva Udyami Protsahan Yojana',
  'Mukhyamantri Yuva Swarojgar Yojana (2026)',
  'Mukhyamantri Yuva Sambal Yojana',
  'Mukhya Mantri Yuva Kaushal Yojana'
];

function tryInject<T>(token: any): T | null {
  try {
    return inject(token, { optional: true });
  } catch {
    return null;
  }
}

@Component({
  selector: 'app-grading-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: `<app-master-crud-page [config]="config"></app-master-crud-page>`
})
export class GradingMasterComponent {
  private dataEngine = tryInject<DataEngineService>(DataEngineService);
  private destroyRef = tryInject<DestroyRef>(DestroyRef);
  private schemeNamesSignal = signal<string[]>(DEFAULT_GRADING_SCHEMES);

  readonly config: MasterCrudConfig<GradingMasterItem>;

  constructor() {
    this.config = this.createConfig();
    this.loadSchemes();
  }

  getSchemeOptions(): string[] {
    return this.schemeNamesSignal();
  }

  private loadSchemes(): void {
    if (!this.dataEngine) return;
    this.dataEngine
      .for<SchemeMasterItem>('SCHEME_MASTERS', { idKey: 'id' })
      .getAll()
      .pipe(this.destroyRef ? takeUntilDestroyed(this.destroyRef) : (s) => s)
      .subscribe({
        next: (schemes) => {
          const names = (schemes || [])
            .filter((s) => s.status !== 'Inactive')
            .map((s) => s.schemeName?.trim())
            .filter((name): name is string => !!name);
          const unique = Array.from(new Set(['ALL Schemes', ...names]));
          if (unique.length > 1) {
            this.schemeNamesSignal.set(unique);
          }
        },
        error: () => {}
      });
  }

  private createConfig(): MasterCrudConfig<GradingMasterItem> {
    return {
      dataKey: 'GRADING_MASTERS',
      entityLabel: 'Grade',
      title: 'Grading Master',
      primaryActionLabel: 'Save',
      searchPlaceholder: 'Search by scheme, grade or range...',
      searchFields: ['schemeName', 'grade', 'range'],
      itemUnit: 'grades',
      columns: [
        { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
        { key: 'schemeName', label: 'Scheme Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[220px]' },
        { key: 'grade', label: 'Grade', cellClass: 'whitespace-nowrap font-semibold text-slate-800', width: 'w-36' },
        { key: 'range', label: 'Range', cellClass: 'whitespace-nowrap font-medium text-slate-700' }
      ],
      hasStatus: true,
      modalWidthClass: 'max-w-[520px]',
      fields: [
        {
          key: 'schemeName',
          label: 'Scheme Name',
          type: 'select',
          required: true,
          options: () => this.getSchemeOptions(),
          placeholder: 'Select Scheme',
          colSpan: 3
        },
        {
          key: 'grade',
          label: 'Grade',
          type: 'text',
          required: true,
          maxLength: 20,
          placeholder: 'Enter Grade (e.g. A+, A, B)',
          colSpan: 3
        },
        {
          key: 'minimum',
          label: 'Minimum',
          type: 'number',
          required: true,
          min: 0,
          placeholder: 'Enter minimum value',
          colSpan: 3
        },
        {
          key: 'maximum',
          label: 'Maximum',
          type: 'number',
          required: true,
          min: 0,
          placeholder: 'Enter maximum value',
          colSpan: 3
        }
      ],
      createDefaults: () => ({
        schemeName: '',
        grade: '',
        minimum: null,
        maximum: null
      }),
      buildPayload: (formData) => {
        const min =
          formData.minimum !== null && formData.minimum !== undefined && formData.minimum !== ''
            ? Number(formData.minimum)
            : 0;
        const max =
          formData.maximum !== null && formData.maximum !== undefined && formData.maximum !== ''
            ? Number(formData.maximum)
            : 0;

        return {
          schemeName: String(formData.schemeName || 'ALL Schemes').trim(),
          grade: String(formData.grade || '').trim(),
          minimum: min,
          maximum: max,
          range: `${min} - ${max}`,
          status: 'Active'
        };
      },
      deleteConfirmText: (item) => `Are you sure you want to delete grade "${item.grade}"?`
    };
  }
}

