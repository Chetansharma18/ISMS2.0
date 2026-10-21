import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import type { SanctionTableRow } from '../eoi-sanction-editor/eoi-sanction-editor.model';
import { IpaPdfService } from '../ipa-editor/ipa-pdf.service';
import { ButtonComponent, IconComponent, ListPageComponent, TableColumn } from '../../../../shared';

/** A company of the sanction order, with whether its IPA has been e-signed. */
type ApprovedTpRow = SanctionTableRow & { released: boolean };

/** Second page of IPA: the approved companies of a scheme, each with an Allocate Target button. */
@Component({
  selector: 'app-ipa-approved-tps',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ListPageComponent, ButtonComponent, IconComponent],
  template: `
    <app-list-page
      title="Approved TPs"
      searchPlaceholder="Search Company, Application ID..."
      [(searchQuery)]="searchQuery"
      [columns]="columns"
      [data]="rows()"
      itemUnit="companies"
      emptyMessage="No approved companies found."
      [customTemplates]="{ action: actionTemplate }"
    >
      <div beforeTable class="flex items-center gap-3">
        <button appButton variant="outline" size="sm" (click)="goBack()">
          <app-icon name="back" />
          <span>Back</span>
        </button>
        @if (scheme(); as scheme) {
          <p class="m-0 text-[13px] text-slate-700 min-w-0">
            {{ scheme.schemeTitle }}
            <span class="tabular-nums text-[11px] text-muted ml-2">Ref: {{ scheme.refNo }}</span>
          </p>
        }
      </div>

      @if (rows().length > 0) {
        <div afterTable class="flex items-center justify-end gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs text-[13px]">
          <span class="text-slate-600">Total Sanction Target</span>
          <span class="font-semibold text-slate-900 min-w-16 text-right">{{ total() }}</span>
        </div>
      }
    </app-list-page>

    <ng-template #actionTemplate let-row>
      @if (row.released) {
        <div class="flex items-center justify-center gap-2">
          <button appButton variant="outline" size="sm" (click)="viewIpa(row)" title="Open the e-signed IPA">
            <app-icon name="eye" size="sm" />
            <span>View IPA</span>
          </button>
          <button appButton size="sm" (click)="allocateTarget(row)">Allocate Additional Target</button>
        </div>
      } @else {
        <button appButton size="sm" (click)="allocateTarget(row)">Allocate Target</button>
      }
    </ng-template>
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

  // Whether each IPA is released is read once here, not on every change-detection pass.
  private readonly allRows: ApprovedTpRow[] = (this.eoiStateService.getSchemeSanctionOrder(this.schemeId)?.tableRows ?? []).map(row => ({
    ...row,
    released: this.eoiStateService.isIpaReleased(this.schemeId, row.appId)
  }));

  protected readonly rows = computed<ApprovedTpRow[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.allRows;
    return this.allRows.filter(
      row => row.agencyName.toLowerCase().includes(query) || row.appId.toLowerCase().includes(query)
    );
  });

  protected readonly total = computed(() => this.rows().reduce((sum, row) => sum + (Number(row.target) || 0), 0));

  protected readonly columns: TableColumn<SanctionTableRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'appId', label: 'Application ID', cellClass: 'whitespace-nowrap tabular-nums text-[12px] text-slate-700' },
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
