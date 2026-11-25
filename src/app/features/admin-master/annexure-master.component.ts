import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { MasterCrudPageComponent } from '../../shared';
import { AnnexureMasterItem } from '../../core/models/admin-masters.model';
import { DataEngineService } from '../../core/services/data-engine.service';
import { ApplicableSchemesCellComponent } from './applicable-schemes-cell.component';
import { loadApplicableSchemeOptions } from './doc-master.component';
import { schemeLinkedMasterConfig } from './scheme-linked-master.config';

export type { AnnexureMasterItem };

/**
 * Annexure Master (backend `/api/master/annexures`, table AnnexureMasters): a prescribed format applicants fill in
 * and upload, e.g. "Annexure-1: Covering Letter", for one or more schemes. EOIs of those schemes can list it.
 */
export const ANNEXURE_MASTER_CONFIG = schemeLinkedMasterConfig<AnnexureMasterItem>({
  dataKey: 'ANNEXURE_MASTERS',
  title: 'Annexure Master',
  entityLabel: 'Annexure',
  itemUnit: 'annexures',
  nameKey: 'annexureName',
  nameLabel: 'Annexure Name',
  namePlaceholder: 'e.g. Annexure-1: Covering Letter',
  defaultExtensions: '.pdf',
  defaultMandatory: true
});

@Component({
  selector: 'app-annexure-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent, ApplicableSchemesCellComponent],
  template: `
    <app-master-crud-page [config]="config" [extraTemplates]="extraTemplates"></app-master-crud-page>

    <ng-template #schemesTpl let-item>
      <app-applicable-schemes-cell [schemes]="item.schemes" [itemName]="item.annexureName" />
    </ng-template>
  `
})
export class AnnexureMasterComponent {
  @ViewChild('schemesTpl', { static: true }) schemesTpl!: TemplateRef<unknown>;

  readonly config = ANNEXURE_MASTER_CONFIG;

  get extraTemplates(): Record<string, TemplateRef<unknown>> {
    return { schemes: this.schemesTpl };
  }

  constructor() {
    loadApplicableSchemeOptions(inject(DataEngineService));
  }
}
