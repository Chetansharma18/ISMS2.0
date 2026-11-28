import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SectionCardComponent, TableColumn, TableComponent } from '../../../../shared';
import type {
  EoiActionPlanRow,
  EoiFinancialRow,
  EoiProposalDetails,
  EoiTrainingCentreRow,
  EoiTrainingPlacementRow
} from '../scheme-form/eoi-apply.model';
import { amountText, countText, plainText, yesNo } from '../scheme-form/proposal-details.util';

export type ProposalViewSection = 'organisation' | 'person' | 'financials' | 'centres' | 'placements' | 'actionPlan';

export const ALL_PROPOSAL_SECTIONS: readonly ProposalViewSection[] = ['organisation', 'person', 'financials', 'centres', 'placements', 'actionPlan'];

interface Item {
  label: string;
  value: string;
  wide?: boolean;
  numeric?: boolean;
}

/**
 * The EOI Form's built-in sections, read-only: used by the wizard's Preview and the Scrutiny Desk.
 * `sections` picks which parts to show (the Scrutiny Desk spreads them over its tabs).
 */
@Component({
  selector: 'app-proposal-details-view',
  standalone: true,
  imports: [NgTemplateOutlet, SectionCardComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-4' },
  template: `
    @if (!details()) {
      <p class="m-0 text-xs text-slate-500 italic">{{ emptyText() }}</p>
    } @else {
      @if (show('organisation')) {
        <app-section-card title="Organisation Details (EOI Specific)">
          <ng-container *ngTemplateOutlet="grid; context: { $implicit: organisationItems() }" />
        </app-section-card>
      }
      @if (show('person')) {
        <app-section-card title="Authorized Person (Project Level)">
          @if (sameAsOrganisation()) {
            <p class="m-0 text-[13px] text-slate-800">
              Same as organisation-level authorized person@if (otrPersonName()) {: <span class="font-semibold">{{ otrPersonName() }}</span>}
            </p>
          } @else {
            <ng-container *ngTemplateOutlet="grid; context: { $implicit: personItems() }" />
          }
        </app-section-card>
      }
      @if (show('financials')) {
        <app-section-card title="Financial Details" [flush]="true">
          <app-table [columns]="financialColumns" [data]="financials()" emptyMessage="No financial details entered." />
        </app-section-card>
      }
      @if (show('centres')) {
        <app-section-card title="Training Centre Details" [flush]="true">
          <app-table [columns]="centreColumns" [data]="centres()" emptyMessage="No training centres entered." />
        </app-section-card>
      }
      @if (show('placements')) {
        <app-section-card title="Training & Placement Details" [flush]="true">
          <app-table [columns]="placementColumns" [data]="placements()" emptyMessage="No training and placement details entered." />
        </app-section-card>
      }
      @if (show('actionPlan')) {
        <app-section-card title="Annual Action Plan" [flush]="true">
          <app-table [columns]="actionPlanColumns" [data]="actionPlan()" emptyMessage="No action plan entered." />
        </app-section-card>
      }
    }

    <ng-template #grid let-items>
      <dl class="m-0 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        @for (item of items; track item.label) {
          <div class="min-w-0" [class.md:col-span-2]="item.wide">
            <dt class="text-[11.5px] font-medium text-slate-500">{{ item.label }}</dt>
            <dd class="m-0 mt-0.5 text-[13px] font-medium text-slate-900 whitespace-pre-line break-words" [class.tabular-nums]="item.numeric">{{ item.value }}</dd>
          </div>
        }
      </dl>
    </ng-template>
  `
})
export class ProposalDetailsViewComponent {
  readonly details = input<EoiProposalDetails | null | undefined>(null);
  readonly sections = input<readonly ProposalViewSection[]>(ALL_PROPOSAL_SECTIONS);
  /** The OTR authorized person's name, shown when the project person is the same. */
  readonly otrPersonName = input('');
  readonly emptyText = input('The EOI Form has not been filled in yet.');

  protected show(section: ProposalViewSection): boolean {
    return this.sections().includes(section);
  }

  protected readonly sameAsOrganisation = computed(() => this.details()?.projectAuthorizedPerson?.sameAsOrganisation !== false);

  protected readonly organisationItems = computed<Item[]>(() => {
    const o = this.details()?.organisation;
    const items: Item[] = [
      { label: 'Type of Business / Activity', value: plainText(o?.businessActivity) },
      { label: 'Name of Registering Authority', value: plainText(o?.registeringAuthority) },
      { label: 'Place of Registration', value: plainText(o?.placeOfRegistration) },
      { label: 'Blacklisted by any Government Department / Agency', value: yesNo(o?.isBlacklisted) }
    ];
    if (o?.isBlacklisted) items.push({ label: 'Blacklisting Details', value: plainText(o.blacklistDetails), wide: true });
    return items;
  });

  protected readonly personItems = computed<Item[]>(() => {
    const p = this.details()?.projectAuthorizedPerson;
    return [
      { label: 'Name', value: plainText(p?.name) },
      { label: 'Designation', value: plainText(p?.designation) },
      { label: 'Mobile No.', value: plainText(p?.mobile), numeric: true },
      { label: 'Email', value: plainText(p?.email) },
      { label: 'ID Proof Type', value: plainText(p?.idProofType) },
      { label: 'ID Number', value: plainText(p?.idNumber), numeric: true },
      { label: 'Residence Address', value: plainText(p?.residenceAddress), wide: true }
    ];
  });

  protected readonly financials = computed(() => this.details()?.financials ?? []);
  protected readonly centres = computed(() => this.details()?.trainingCentres ?? []);
  protected readonly placements = computed(() => this.details()?.trainingPlacements ?? []);
  protected readonly actionPlan = computed(() => this.details()?.actionPlan ?? []);

  private static readonly NUM = 'whitespace-nowrap tabular-nums';

  protected readonly financialColumns: TableColumn<EoiFinancialRow>[] = [
    { key: 'financialYear', label: 'Financial Year', cellClass: ProposalDetailsViewComponent.NUM, format: v => plainText(v) },
    { key: 'totalTurnover', label: 'Total Turnover', align: 'right', cellClass: ProposalDetailsViewComponent.NUM, format: v => amountText(v) },
    { key: 'skillTurnover', label: 'Turnover from Skill Development', align: 'right', cellClass: ProposalDetailsViewComponent.NUM, format: v => amountText(v) }
  ];

  protected readonly centreColumns: TableColumn<EoiTrainingCentreRow>[] = [
    { key: '$index', label: '#', align: 'center', width: 'w-10' },
    { key: 'district', label: 'District', format: v => plainText(v) },
    { key: 'centreName', label: 'Centre Name', format: v => plainText(v) },
    { key: 'address', label: 'Address', width: 'min-w-[200px]', format: v => plainText(v) },
    { key: 'telephone', label: 'Telephone', cellClass: ProposalDetailsViewComponent.NUM, format: v => plainText(v) },
    { key: 'classrooms', label: 'Classrooms', align: 'center', cellClass: 'tabular-nums', format: v => countText(v) },
    { key: 'practicalRooms', label: 'Practical Rooms', align: 'center', cellClass: 'tabular-nums', format: v => countText(v) },
    { key: 'separateWashrooms', label: 'Separate Washrooms', align: 'center', format: v => yesNo(v) },
    { key: 'labAvailable', label: 'Lab', align: 'center', format: v => yesNo(v) }
  ];

  protected readonly placementColumns: TableColumn<EoiTrainingPlacementRow>[] = [
    { key: '$index', label: '#', align: 'center', width: 'w-10' },
    { key: 'sector', label: 'Sector', format: v => plainText(v) },
    { key: 'financialYear', label: 'Financial Year', cellClass: ProposalDetailsViewComponent.NUM, format: v => plainText(v) },
    { key: 'trained', label: 'Trained', align: 'right', cellClass: 'tabular-nums', format: v => countText(v) },
    { key: 'placed', label: 'Placed', align: 'right', cellClass: 'tabular-nums', format: v => countText(v) },
    { key: 'proofCount', label: 'Placement Proofs', align: 'right', cellClass: 'tabular-nums', format: v => countText(v) }
  ];

  protected readonly actionPlanColumns: TableColumn<EoiActionPlanRow>[] = [
    { key: '$index', label: '#', align: 'center', width: 'w-10' },
    { key: 'year', label: 'Year', cellClass: ProposalDetailsViewComponent.NUM, format: v => plainText(v) },
    { key: 'district', label: 'District', format: v => plainText(v) },
    { key: 'sdcCount', label: 'No. of SDCs', align: 'center', cellClass: 'tabular-nums', format: v => countText(v) },
    { key: 'sdcLocation', label: 'SDC Location', format: v => plainText(v) },
    { key: 'sectors', label: 'Sectors', width: 'min-w-[160px]', format: v => plainText(v) },
    { key: 'courses', label: 'Courses', width: 'min-w-[180px]', format: v => plainText(v) },
    { key: 'residentialType', label: 'Residential / Non-Residential', format: v => plainText(v) },
    { key: 'batches', label: 'Batches', align: 'center', cellClass: 'tabular-nums', format: v => countText(v) }
  ];
}
