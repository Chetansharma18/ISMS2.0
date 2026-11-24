import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EoiStateService } from '../eoi/services/eoi-state.service';
import { IpaPdfService } from '../eoi/pages/ipa-editor/ipa-pdf.service';
import { IpaAllocationService } from '../sdc/services/ipa-allocation.service';
import { TP_IPAS, type TpIpa } from '../../core/mock/data/tp-ipas.mock';
import {
  ButtonComponent,
  IconComponent,
  ListPageComponent,
  MasterFilterBarComponent,
  MasterFilterConfig,
  TableColumn
} from '../../shared';

/** One In-Principal Approval of the training partner. */
interface IpaRow {
  key: string;
  ipaId: string;
  ipaNo: string;
  schemeTitle: string;
  refNo: string;
  /** Scheme category as shown in the table ("Rajvik", "Samarth"). */
  category: string;
  /** Districts the IPA allows, as text. */
  district: string;
  /** Sectors the IPA allows, as text. */
  sector: string;
  /** Training target of this IPA: what its course rows add up to (every IPA has its own target). */
  target: number;
  /** New SDCs registered for this IPA out of the SDCs it allows (one per district and sector). */
  sdcs: string;
  /** Every SDC the IPA allows has been registered. */
  full: boolean;
  source: TpIpa;
}

/**
 * IPA page of the training partner: the In-Principal Approvals given to the partner, shown as dummy data for now.
 * The partner can view each one and register the new SDCs it needs, one for each district and sector of the IPA.
 */
@Component({
  selector: 'app-ipa-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ListPageComponent, ButtonComponent, IconComponent, MasterFilterBarComponent],
  template: `
    <app-list-page
      title="In-Principal Approval (IPA)"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'In-Principal Approval (IPA)' }]"
      [searchable]="false"
      [columns]="columns"
      [data]="rows()"
      itemUnit="IPAs"
      emptyMessage="No IPA has been released yet."
      [customTemplates]="{ schemeTitle: schemeTemplate, action: actionTemplate }"
    >
      <!-- Filter Bar with Search & Dropdowns -->
      <app-master-filter-bar
        beforeTable
        [(searchQuery)]="searchQuery"
        searchPlaceholder="Search IPA, Scheme, District, Sector..."
        [showStatusFilter]="false"
        [filters]="ipaFilters()"
        [(filterValues)]="filterValues"
        (resetFilters)="resetFilters()"
      />
    </app-list-page>

    <ng-template #schemeTemplate let-row>
      <div class="font-normal text-slate-800 text-[13px] leading-snug">{{ row.schemeTitle }}</div>
      <div class="text-[11px] tabular-nums text-muted mt-0.5">Ref: {{ row.refNo }}</div>
    </ng-template>

    <ng-template #actionTemplate let-row>
      <div class="flex items-center justify-center gap-1 sm:gap-1.5">
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          (click)="viewIpa(row)"
          title="Open the IPA"
          aria-label="View IPA"
        >
          <app-icon name="eye" size="sm" />
        </button>
        <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>
        <button
          appButton
          size="sm"
          [disabled]="row.full"
          (click)="newSdc(row)"
          [title]="row.full ? 'Every SDC of this IPA is registered' : 'Register the new SDC for this IPA'"
        >
          New SDC
        </button>
      </div>
    </ng-template>
  `
})
export class IpaListComponent {
  private eoiStateService = inject(EoiStateService);
  private allocationService = inject(IpaAllocationService);
  private pdfService = inject(IpaPdfService);
  private router = inject(Router);

  searchQuery = signal('');
  readonly filterValues = signal<Record<string, string>>({});

  readonly allIpaRows = computed<IpaRow[]>(() => {
    return TP_IPAS.flatMap(source => this.toRow(source));
  });

  readonly schemeTitleOptions = computed<string[]>(() => {
    const set = new Set<string>();
    for (const r of this.allIpaRows()) {
      if (r.schemeTitle) set.add(r.schemeTitle);
    }
    return Array.from(set).sort();
  });

  readonly categoryOptions = computed<string[]>(() => {
    const set = new Set<string>();
    for (const r of this.allIpaRows()) {
      if (r.category && r.category !== '-') set.add(r.category);
    }
    return Array.from(set).sort();
  });

  readonly districtOptions = computed<string[]>(() => {
    const set = new Set<string>();
    for (const r of this.allIpaRows()) {
      if (r.district) {
        r.district.split(',').map(d => d.trim()).filter(Boolean).forEach(d => set.add(d));
      }
    }
    return Array.from(set).sort();
  });

  readonly sectorOptions = computed<string[]>(() => {
    const set = new Set<string>();
    for (const r of this.allIpaRows()) {
      if (r.sector) {
        r.sector.split(',').map(s => s.trim()).filter(Boolean).forEach(s => set.add(s));
      }
    }
    return Array.from(set).sort();
  });

  readonly ipaFilters = computed<MasterFilterConfig[]>(() => [
    {
      key: 'schemeTitle',
      label: 'Scheme Name',
      options: () => this.schemeTitleOptions(),
      placeholder: 'All Scheme Names'
    },
    {
      key: 'category',
      label: 'Scheme Category',
      options: () => this.categoryOptions(),
      placeholder: 'All Scheme Categories'
    },
    {
      key: 'district',
      label: 'IPA District(s)',
      options: () => this.districtOptions(),
      placeholder: 'All Districts'
    },
    {
      key: 'sector',
      label: 'IPA Sector(s)',
      options: () => this.sectorOptions(),
      placeholder: 'All Sectors'
    }
  ]);

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterValues.set({});
  }

  readonly rows = computed<IpaRow[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const fv = this.filterValues();
    const selectedScheme = (fv['schemeTitle'] || '').trim();
    const selectedCategory = (fv['category'] || '').trim();
    const selectedDistrict = (fv['district'] || '').trim();
    const selectedSector = (fv['sector'] || '').trim();

    return this.allIpaRows().filter(row => {
      // 1. Full-text search
      if (query) {
        const matchesQuery =
          row.ipaNo.toLowerCase().includes(query) ||
          row.schemeTitle.toLowerCase().includes(query) ||
          row.refNo.toLowerCase().includes(query) ||
          row.category.toLowerCase().includes(query) ||
          row.district.toLowerCase().includes(query) ||
          row.sector.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Scheme Name filter
      if (selectedScheme && selectedScheme !== 'ALL') {
        if (row.schemeTitle !== selectedScheme && !row.schemeTitle.toLowerCase().includes(selectedScheme.toLowerCase())) {
          return false;
        }
      }

      // 3. Scheme Category filter
      if (selectedCategory && selectedCategory !== 'ALL') {
        if (row.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 4. District filter
      if (selectedDistrict && selectedDistrict !== 'ALL') {
        if (!row.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
          return false;
        }
      }

      // 5. Sector filter
      if (selectedSector && selectedSector !== 'ALL') {
        if (!row.sector.toLowerCase().includes(selectedSector.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  });

  readonly columns: TableColumn<IpaRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'ipaNo', label: 'IPA No.', width: 'min-w-[170px]', cellClass: 'tabular-nums text-[12px] font-normal text-slate-700' },
    { key: 'schemeTitle', label: 'EOI Ref No. & Scheme Name', width: 'min-w-[240px]', type: 'custom' },
    { key: 'category', label: 'Scheme Category', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'district', label: 'IPA District(s)', width: 'min-w-[120px]', cellClass: 'font-normal text-slate-700' },
    { key: 'sector', label: 'IPA Sector(s)', width: 'min-w-[170px]', cellClass: 'font-normal text-slate-700' },
    { key: 'target', label: 'IPA Target', align: 'center', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-700' },
    { key: 'sdcs', label: 'SDCs Registered', align: 'center', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-700' },
    { key: 'action', label: 'Action', align: 'center', width: 'min-w-[200px]', type: 'custom' }
  ];

  /** Opens the IPA letter. The dummy IPAs are shown on the standard IPA letter with their own number and courses. */
  protected viewIpa(row: IpaRow): void {
    const { source } = row;
    const base = this.eoiStateService.getDefaultIpaData(source.schemeId, 'APP-DUMMY');
    // The tab is opened while the click is being handled so the browser allows it.
    const tab = window.open('', '_blank');
    void this.pdfService.openSignedPdf(
      {
        ...base,
        fileNo: source.ipaNumber,
        recipientName: source.tpName,
        piaName: source.tpName,
        courseRows: source.courses,
        signedAt: new Date().toISOString()
      },
      tab
    );
  }

  protected newSdc(row: IpaRow): void {
    void this.router.navigate(['/sdc/create'], {
      queryParams: {
        ipaId: row.ipaId,
        scheme: row.source.scheme,
        schemeCategory: row.source.schemeCategory,
        tpName: row.source.tpName
      }
    });
  }

  private toRow(source: TpIpa): IpaRow[] {
    const ipa = this.allocationService.resolveIpa(source.ipaId);
    if (!ipa) return [];
    const { registered, allowed } = this.allocationService.sdcCount(ipa);
    return [
      {
        key: source.ipaId,
        ipaId: source.ipaId,
        ipaNo: source.ipaNumber,
        schemeTitle: source.schemeTitle,
        refNo: source.refNo,
        category: source.category,
        district: ipa.districts.join(', '),
        sector: ipa.sectors.join(', '),
        target: this.allocationService.ipaTarget(ipa),
        sdcs: `${registered} / ${allowed}`,
        full: registered >= allowed,
        source
      }
    ];
  }
}
