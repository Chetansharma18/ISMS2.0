import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import type { SanctionTableRow } from '../eoi-sanction-editor/eoi-sanction-editor.model';
import { IpaPdfService } from '../ipa-editor/ipa-pdf.service';
import { PageHeaderComponent, TableComponent, TableColumn } from '../../../../shared';

/** Second page of IPA: the approved companies of a scheme, each with an Allocate Target button. */
@Component({
  selector: 'app-ipa-approved-tps',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="w-full min-h-full bg-background text-primary font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">

        <app-page-header
          title="Approved TPs"
          [searchable]="true"
          searchPlaceholder="Search Company, Application ID..."
          [(searchQuery)]="searchQuery"
        >
        </app-page-header>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
          @if (scheme(); as scheme) {
            <p class="m-0 text-[13px] text-slate-700 min-w-0">
              {{ scheme.schemeTitle }}
              <span class="font-mono text-[11px] text-muted ml-2">Ref: {{ scheme.refNo }}</span>
            </p>
          }
        </div>

        <app-table
          [columns]="columns"
          [data]="rows()"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="companies"
          emptyMessage="No approved companies found."
          [customTemplates]="{ action: actionTemplate }"
        >
        </app-table>

        @if (rows().length > 0) {
          <div class="flex items-center justify-end gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs text-[13px]">
            <span class="text-slate-600">Total Sanction Target</span>
            <span class="font-semibold text-slate-900 min-w-16 text-right">{{ total() }}</span>
          </div>
        }

        <ng-template #actionTemplate let-row>
          @if (isReleased(row)) {
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
                <span>View IPA</span>
              </button>
              <button
                type="button"
                (click)="allocateTarget(row)"
                class="btn btn-primary btn-sm whitespace-nowrap cursor-pointer"
              >
                <span>Allocate New Target</span>
              </button>
            </div>
          } @else {
            <button
              type="button"
              (click)="allocateTarget(row)"
              class="btn btn-primary btn-sm whitespace-nowrap cursor-pointer"
            >
              <span>Allocate Target</span>
            </button>
          }
        </ng-template>

      </div>
    </div>
  `
})
export class IpaApprovedTpsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eoiStateService = inject(EoiStateService);
  private pdfService = inject(IpaPdfService);

  private readonly schemeId = this.route.snapshot.paramMap.get('schemeId') ?? '';
  protected readonly scheme = signal<Scheme | undefined>(undefined);
  protected readonly searchQuery = signal('');

  private readonly allRows: SanctionTableRow[] = this.eoiStateService.getSchemeSanctionOrder(this.schemeId)?.tableRows ?? [];

  protected readonly rows = computed<SanctionTableRow[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.allRows;
    return this.allRows.filter(
      row => row.agencyName.toLowerCase().includes(query) || row.appId.toLowerCase().includes(query)
    );
  });

  protected readonly total = computed(() => this.rows().reduce((sum, row) => sum + (Number(row.target) || 0), 0));

  protected readonly columns: TableColumn<SanctionTableRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'appId', label: 'Application ID', cellClass: 'whitespace-nowrap font-mono text-[12px] text-slate-700' },
    { key: 'agencyName', label: 'Name of the Agency / PIA', width: 'min-w-[180px]', cellClass: 'font-normal text-slate-800' },
    { key: 'district', label: 'Sanction District', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'sector', label: 'Sanction Sector(s)', width: 'min-w-[160px]', cellClass: 'font-normal text-slate-700' },
    { key: 'grade', label: 'Grade', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'target', label: 'Sanction Target', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'action', label: 'Action', align: 'center', width: 'min-w-[300px]', type: 'custom' }
  ];

  constructor() {
    this.eoiStateService
      .getSchemeById(this.schemeId)
      .pipe(takeUntilDestroyed())
      .subscribe(scheme => this.scheme.set(scheme));
  }

  protected goBack(): void {
    void this.router.navigate(['/admin/ipa']);
  }

  /** True once this company's IPA has been e-signed and released. */
  protected isReleased(row: SanctionTableRow): boolean {
    return this.eoiStateService.isIpaReleased(this.schemeId, row.appId);
  }

  /** Opens the e-signed IPA (the latest one, when more than one was issued), the same document that was signed. */
  protected viewIpa(row: SanctionTableRow): void {
    const data = this.eoiStateService.getLatestIssuedIpa(this.schemeId, row.appId);
    if (!data) return;
    // The tab is opened while the click is being handled so the browser allows it.
    const tab = window.open('', '_blank');
    void this.pdfService.openSignedPdf(data, tab);
  }

  protected allocateTarget(row: SanctionTableRow): void {
    void this.router.navigate(['/admin/ipa-editor', this.schemeId, row.appId]);
  }
}
