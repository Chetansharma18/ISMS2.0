import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SanctionTargetsModalComponent } from './sanction-targets-modal.component';
import { ApplicantResponse, EoiStateService, Scheme } from '../../services/eoi-state.service';
import { SanctionPdfService } from '../eoi-sanction-editor/sanction-pdf.service';
import { formatDateTime } from '../../../../shared/utils';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../../../shared';

/** One scheme with a released sanction order. */
interface SanctionOrderRow {
  id: string;
  schemeTitle: string;
  refNo: string;
  category: string;
  approvedCompanies: number;
  totalTarget: string;
  releasedOn: string;
}

/** Category as shown in the table (the master stores it with a "Category I:" style prefix). */
export function categoryLabel(value: string | undefined): string {
  if (!value || value === 'NA' || value === '-') return '-';
  const cleaned = value.replace(/^Category\s+[I|V|X|0-9]+:\s*/i, '').trim();
  const upper = cleaned.toUpperCase();
  if (upper === 'RAJKVIK') return 'Rajvik';
  if (upper === 'SAMARTH') return 'Samarth';
  if (upper === 'SAKSHM' || upper === 'SAKSHAM') return 'Saksham';
  return cleaned || '-';
}

@Component({
  selector: 'app-sanction-order-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PageHeaderComponent, TableComponent, SanctionTargetsModalComponent],
  template: `
    <div class="w-full min-h-full bg-background text-primary font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">

        <app-page-header
          title="Sanction Order"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Sanction Order' }]"
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
          [customTemplates]="{
            schemeTitle: schemeTitleTemplate,
            viewSanctionOrder: viewSanctionOrderTemplate,
            mou: mouTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        @if (selected(); as row) {
          <app-sanction-targets-modal
            [schemeTitle]="row.schemeTitle"
            [rows]="selectedRows()"
            (close)="selected.set(null)"
          />
        }

        <ng-template #schemeTitleTemplate let-row>
          <div class="font-normal text-slate-800 text-[13px] leading-snug">
            {{ row.schemeTitle }}
          </div>
          <div class="text-[11px] font-mono text-muted mt-0.5">
            Ref: {{ row.refNo }}
          </div>
        </ng-template>

        <ng-template #viewSanctionOrderTemplate let-row>
          <button
            type="button"
            (click)="viewSanctionOrder(row)"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all whitespace-nowrap cursor-pointer"
            title="Open the e-signed sanction order"
          >
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{{ viewOnly ? 'View' : 'View Sanction Order' }}</span>
          </button>
        </ng-template>

        <ng-template #mouTemplate let-row>
          <button
            type="button"
            (click)="openMouDraft(row)"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all whitespace-nowrap cursor-pointer"
            title="Open the MoU draft for this scheme"
          >
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>MoU Draft</span>
          </button>
        </ng-template>

        <ng-template #actionTemplate let-row>
          <button
            type="button"
            (click)="openCompanies(row)"
            class="btn btn-primary btn-sm whitespace-nowrap cursor-pointer"
          >
            <span>Approved Companies</span>
          </button>
        </ng-template>

      </div>
    </div>
  `
})
export class SanctionOrderListComponent {
  private eoiStateService = inject(EoiStateService);
  private pdfService = inject(SanctionPdfService);
  private router = inject(Router);

  private schemes = signal<Scheme[]>([]);
  private responses = signal<ApplicantResponse[]>([]);
  searchQuery = signal('');

  readonly rows = computed<SanctionOrderRow[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const responses = this.responses();

    // Only schemes whose sanction order has been released are listed.
    return this.schemes()
      .map(scheme => this.toRow(scheme, responses))
      .filter((row): row is SanctionOrderRow => row !== null)
      .filter(
        row =>
          !query ||
          row.schemeTitle.toLowerCase().includes(query) ||
          row.refNo.toLowerCase().includes(query) ||
          row.category.toLowerCase().includes(query)
      );
  });

  /** The training partner only views released orders: one View button, no MoU draft or company list. */
  protected readonly viewOnly = inject(ActivatedRoute).snapshot.data['viewOnly'] === true;

  readonly schemeColumns: TableColumn<SanctionOrderRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'schemeTitle', label: 'EOI Ref No. & Scheme Name', width: 'min-w-[260px]', type: 'custom' },
    { key: 'category', label: 'Category', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'approvedCompanies', label: 'Approved Companies', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'totalTarget', label: 'Total Target', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'releasedOn', label: 'Released On', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    ...(this.viewOnly
      ? ([{ key: 'viewSanctionOrder', label: 'Action', align: 'center', width: 'w-32', type: 'custom' }] as TableColumn<SanctionOrderRow>[])
      : ([
          { key: 'viewSanctionOrder', label: 'Sanction Order', align: 'center', width: 'w-44', type: 'custom' },
          { key: 'mou', label: 'MoU', align: 'center', width: 'w-36', type: 'custom' },
          { key: 'action', label: 'Action', align: 'center', width: 'w-36', type: 'custom' }
        ] as TableColumn<SanctionOrderRow>[]))
  ];

  constructor() {
    this.eoiStateService.getSchemes().pipe(takeUntilDestroyed()).subscribe(data => {
      // Only closed schemes can have a sanction order.
      this.schemes.set(data.filter(s => s.status === 'Closed'));
    });
    this.eoiStateService.getResponses().pipe(takeUntilDestroyed()).subscribe(data => this.responses.set(data));
  }

  /** Scheme whose approved companies are shown in the dialog. */
  protected readonly selected = signal<SanctionOrderRow | null>(null);
  protected readonly selectedRows = computed(() => {
    const row = this.selected();
    return row ? (this.eoiStateService.getSchemeSanctionOrder(row.id)?.tableRows ?? []) : [];
  });

  protected openCompanies(row: SanctionOrderRow): void {
    this.selected.set(row);
  }

  /** Opens the MoU draft of the scheme; it is the same for every company under it. */
  protected openMouDraft(row: SanctionOrderRow): void {
    void this.router.navigate(['/admin/mou-draft', row.id]);
  }

  /** Opens the e-signed PDF, the same document that was signed. */
  viewSanctionOrder(row: SanctionOrderRow): void {
    const order = this.eoiStateService.getSchemeSanctionOrder(row.id);
    if (!order) return;
    // The tab is opened while the click is being handled so the browser allows it.
    const tab = window.open('', '_blank');
    void this.pdfService.openSignedPdf(order, tab);
  }

  /** The table row of a scheme, or null when its sanction order has not been released. */
  private toRow(scheme: Scheme, responses: ApplicantResponse[]): SanctionOrderRow | null {
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
