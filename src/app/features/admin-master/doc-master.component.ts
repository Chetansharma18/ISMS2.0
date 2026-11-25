import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MasterCrudPageComponent } from '../../shared';
import { DocMasterItem, SchemeMasterItem } from '../../core/models/admin-masters.model';
import { DataEngineService } from '../../core/services/data-engine.service';
import { ApplicableSchemesCellComponent } from './applicable-schemes-cell.component';
import { applicableSchemeOptions, schemeLinkedMasterConfig } from './scheme-linked-master.config';

export type { DocMasterItem };

/**
 * Document Master (backend `/api/master/doc-masters`, table DocMasters): a document applicants upload, e.g.
 * "Company PAN Card", for one or more schemes. EOIs of those schemes can list it as a required document.
 */
export const DOC_MASTER_CONFIG = schemeLinkedMasterConfig<DocMasterItem>({
  dataKey: 'DOC_MASTERS',
  title: 'Document Master',
  entityLabel: 'Document',
  itemUnit: 'documents',
  nameKey: 'docName',
  nameLabel: 'Document Name',
  namePlaceholder: 'e.g. Company PAN Card',
  defaultExtensions: '.pdf,.jpg,.jpeg,.png',
  defaultMandatory: false,
  extraFields: [
    { key: 'category', label: 'Category', type: 'text', maxLength: 100, placeholder: 'e.g. Statutory, Supporting (optional)', colSpan: 3 }
  ]
});

@Component({
  selector: 'app-doc-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent, ApplicableSchemesCellComponent],
  template: `
    <app-master-crud-page [config]="config" [extraTemplates]="extraTemplates"></app-master-crud-page>

    <ng-template #schemesTpl let-item>
      <app-applicable-schemes-cell [schemes]="item.schemes" [itemName]="item.docName" />
    </ng-template>
  `
})
export class DocMasterComponent {
  @ViewChild('schemesTpl', { static: true }) schemesTpl!: TemplateRef<unknown>;

  readonly config = DOC_MASTER_CONFIG;

  get extraTemplates(): Record<string, TemplateRef<unknown>> {
    return { schemes: this.schemesTpl };
  }

  constructor() {
    loadApplicableSchemeOptions(inject(DataEngineService));
  }
}

/** Fills the scheme choices from the active Scheme Master records (the backend links by scheme name or id). */
export function loadApplicableSchemeOptions(dataEngine: DataEngineService): void {
  dataEngine
    .for<SchemeMasterItem>('SCHEME_MASTERS')
    .getAll()
    .pipe(takeUntilDestroyed())
    .subscribe({
      next: schemes =>
        applicableSchemeOptions.set(
          [...new Set(schemes.filter(s => s.status !== 'Inactive').map(s => s.schemeName).filter(Boolean))].sort((a, b) =>
            a.localeCompare(b)
          )
        ),
      error: () => {}
    });
}
