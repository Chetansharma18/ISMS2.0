import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EoiStateService, Scheme } from '../eoi/services/eoi-state.service';
import type { IpaDocumentData } from '../eoi/services/eoi-state.models';
import { IpaPdfService } from '../eoi/pages/ipa-editor/ipa-pdf.service';
import { PageHeaderComponent, TableComponent, TableColumn } from '../../shared';

/** One e-signed IPA of an approved company. */
interface IpaRow {
  key: string;
  ipaNo: string;
  appId: string;
  schemeTitle: string;
  refNo: string;
  district: string;
  sector: string;
  target: number;
  grade: string;
  /** The Scheme code split into the scheme and its category, for the SDC form ("MMKVY-RAJKVIK"). */
  scheme: string;
  schemeCategory: string;
  agencyName: string;
  document: IpaDocumentData;
}

/**
 * IPA page of the training partner: the IPAs that have been e-signed and released. The partner can
 * view each one and register an SDC against it.
 */
@Component({
  selector: 'app-ipa-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="w-full min-h-full bg-background text-primary font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">

        <app-page-header
          title="IPA"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'IPA' }]"
          [searchable]="true"
          searchPlaceholder="Search IPA, Application ID, Scheme, District..."
          [(searchQuery)]="searchQuery"
        >
        </app-page-header>

        <app-table
          [columns]="columns"
          [data]="rows()"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="IPAs"
          emptyMessage="No IPA has been released yet."
          [customTemplates]="{ schemeTitle: schemeTemplate, action: actionTemplate }"
        >
        </app-table>

        <ng-template #schemeTemplate let-row>
          <div class="font-normal text-slate-800 text-[13px] leading-snug">{{ row.schemeTitle }}</div>
          <div class="text-[11px] font-mono text-muted mt-0.5">Ref: {{ row.refNo }}</div>
        </ng-template>

        <ng-template #actionTemplate let-row>
          <div class="flex items-center justify-center gap-2">
            <button
              type="button"
              (click)="viewIpa(row)"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all whitespace-nowrap cursor-pointer"
              title="Open the e-signed IPA"
            >
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View</span>
            </button>
            <button
              type="button"
              (click)="registerSdc(row)"
              class="btn btn-primary btn-sm whitespace-nowrap cursor-pointer"
              title="Register an SDC for this IPA"
            >
              <span>Register SDC</span>
            </button>
          </div>
        </ng-template>

      </div>
    </div>
  `
})
export class IpaListComponent {
  private eoiStateService = inject(EoiStateService);
  private pdfService = inject(IpaPdfService);
  private router = inject(Router);

  private schemes = signal<Scheme[]>([]);
  searchQuery = signal('');

  readonly rows = computed<IpaRow[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.schemes()
      .flatMap(scheme => this.toRows(scheme))
      .filter(
        row =>
          !query ||
          row.ipaNo.toLowerCase().includes(query) ||
          row.appId.toLowerCase().includes(query) ||
          row.schemeTitle.toLowerCase().includes(query) ||
          row.refNo.toLowerCase().includes(query) ||
          row.district.toLowerCase().includes(query) ||
          row.sector.toLowerCase().includes(query)
      );
  });

  readonly columns: TableColumn<IpaRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'ipaNo', label: 'IPA No.', width: 'min-w-[200px]', cellClass: 'font-mono text-[12px] font-normal text-slate-700' },
    { key: 'appId', label: 'Application ID', cellClass: 'whitespace-nowrap font-mono text-[12px] text-slate-700' },
    { key: 'schemeTitle', label: 'EOI Ref No. & Scheme Name', width: 'min-w-[240px]', type: 'custom' },
    { key: 'district', label: 'Sanction District', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'sector', label: 'Sanction Sector(s)', width: 'min-w-[150px]', cellClass: 'font-normal text-slate-700' },
    { key: 'target', label: 'Sanction Target', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'grade', label: 'Grade', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'action', label: 'Action', align: 'center', width: 'min-w-[220px]', type: 'custom' }
  ];

  constructor() {
    this.eoiStateService.getSchemes().pipe(takeUntilDestroyed()).subscribe(data => {
      // Only closed schemes can have a sanction order.
      this.schemes.set(data.filter(s => s.status === 'Closed'));
    });
  }

  /** Opens the e-signed IPA, the same document that was signed. */
  protected viewIpa(row: IpaRow): void {
    // The tab is opened while the click is being handled so the browser allows it.
    const tab = window.open('', '_blank');
    void this.pdfService.openSignedPdf(row.document, tab);
  }

  protected registerSdc(row: IpaRow): void {
    void this.router.navigate(['/sdc/create'], {
      queryParams: {
        ipaNumber: row.ipaNo,
        appId: row.appId,
        scheme: row.scheme,
        schemeCategory: row.schemeCategory,
        sector: row.sector.split(',')[0].trim(),
        district: row.district,
        sanctionTarget: row.target,
        tpName: row.agencyName
      }
    });
  }

  /** One row for every IPA that was e-signed for the approved companies of the scheme. */
  private toRows(scheme: Scheme): IpaRow[] {
    const order = this.eoiStateService.getSchemeSanctionOrder(scheme.id);
    if (!order || !this.eoiStateService.isSchemeSanctionReleased(scheme.id)) return [];

    const [schemeName, category = ''] = scheme.code.split('-');
    return order.tableRows.flatMap(company =>
      this.eoiStateService.getIssuedIpas(scheme.id, company.appId).map((document, index) => ({
        key: `${scheme.id}:${company.appId}:${index}`,
        ipaNo: document.fileNo,
        appId: company.appId,
        schemeTitle: scheme.schemeTitle,
        refNo: scheme.refNo,
        district: company.district,
        sector: company.sector,
        target: company.target,
        grade: company.grade,
        scheme: schemeName,
        schemeCategory: category,
        agencyName: company.agencyName,
        document
      }))
    );
  }
}
