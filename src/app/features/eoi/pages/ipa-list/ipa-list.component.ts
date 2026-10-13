import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApplicantResponse, EoiStateService, Scheme } from '../../services/eoi-state.service';
import { categoryLabel } from '../sanction-order-list/sanction-order-list.component';
import { formatDateTime } from '../../../../shared/utils';
import { PageHeaderComponent, TableComponent, TableColumn } from '../../../../shared';

/** One scheme with a released sanction order. */
interface IpaSchemeRow {
  id: string;
  schemeTitle: string;
  refNo: string;
  category: string;
  approvedCompanies: number;
  totalTarget: string;
  releasedOn: string;
}

/** First page of IPA: the schemes whose sanction order has been released. */
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
          searchPlaceholder="Search Scheme, Ref No., Category..."
          [(searchQuery)]="searchQuery"
        >
        </app-page-header>

        <app-table
          [columns]="schemeColumns"
          [data]="rows()"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="schemes"
          emptyMessage="No sanction order has been released yet."
          [customTemplates]="{ schemeTitle: schemeTitleTemplate, action: actionTemplate }"
        >
        </app-table>

        <ng-template #schemeTitleTemplate let-row>
          <div class="font-normal text-slate-800 text-[13px] leading-snug">{{ row.schemeTitle }}</div>
          <div class="text-[11px] font-mono text-muted mt-0.5">Ref: {{ row.refNo }}</div>
        </ng-template>

        <ng-template #actionTemplate let-row>
          <button
            type="button"
            (click)="openApprovedTps(row)"
            class="btn btn-primary btn-sm whitespace-nowrap cursor-pointer"
          >
            <span>Approved TPs</span>
          </button>
        </ng-template>

      </div>
    </div>
  `
})
export class IpaListComponent {
  private eoiStateService = inject(EoiStateService);
  private router = inject(Router);

  private schemes = signal<Scheme[]>([]);
  private responses = signal<ApplicantResponse[]>([]);
  searchQuery = signal('');

  readonly rows = computed<IpaSchemeRow[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const responses = this.responses();

    return this.schemes()
      .map(scheme => this.toRow(scheme, responses))
      .filter((row): row is IpaSchemeRow => row !== null)
      .filter(
        row =>
          !query ||
          row.schemeTitle.toLowerCase().includes(query) ||
          row.refNo.toLowerCase().includes(query) ||
          row.category.toLowerCase().includes(query)
      );
  });

  readonly schemeColumns: TableColumn<IpaSchemeRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'schemeTitle', label: 'EOI Ref No. & Scheme Name', width: 'min-w-[260px]', type: 'custom' },
    { key: 'category', label: 'Category', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'approvedCompanies', label: 'Approved Companies', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'totalTarget', label: 'Total Target', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'releasedOn', label: 'Released On', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-40', type: 'custom' }
  ];

  constructor() {
    this.eoiStateService.getSchemes().pipe(takeUntilDestroyed()).subscribe(data => {
      // Only closed schemes can have a sanction order.
      this.schemes.set(data.filter(s => s.status === 'Closed'));
    });
    this.eoiStateService.getResponses().pipe(takeUntilDestroyed()).subscribe(data => this.responses.set(data));
  }

  protected openApprovedTps(row: IpaSchemeRow): void {
    void this.router.navigate(['/admin/ipa', row.id]);
  }

  /** The table row of a scheme, or null when its sanction order has not been released. */
  private toRow(scheme: Scheme, responses: ApplicantResponse[]): IpaSchemeRow | null {
    const order = this.eoiStateService.getSchemeSanctionOrder(scheme.id);
    if (!order || !this.eoiStateService.isSchemeSanctionReleased(scheme.id)) return null;

    return {
      id: scheme.id,
      schemeTitle: scheme.schemeTitle,
      refNo: scheme.refNo,
      category: categoryLabel(scheme.category),
      approvedCompanies: responses.filter(r => r.schemeId === scheme.id && r.status === 'APPROVED').length,
      totalTarget: String(order.tableRows.reduce((sum, row) => sum + (Number(row.target) || 0), 0)),
      releasedOn: order.signedAt ? formatDateTime(new Date(order.signedAt)) : '-'
    };
  }
}
