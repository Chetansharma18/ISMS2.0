import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../../../shared';

@Component({
  selector: 'app-sanction-order-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="w-full min-h-full bg-background text-primary font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Header via Reusable PageHeaderComponent without closed schemes badge -->
        <app-page-header
          title="Sanction Order"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Sanction Order' }]"
          [searchable]="true"
          searchPlaceholder="Search Scheme, Ref No., Category..."
          [(searchQuery)]="searchQuery"
        >
        </app-page-header>

        <!-- Main Sanction Order Schemes Table via Reusable TableComponent -->
        <app-table
          [columns]="schemeColumns"
          [data]="filteredSchemes()"
          [pagination]="true"
          [pageSize]="10"
          [customTemplates]="{
            schemeTitle: schemeTitleTemplate,
            viewSanctionOrder: viewSanctionOrderTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #schemeTitleTemplate let-scheme>
          <div class="font-normal text-slate-800 text-[13px] leading-snug">
            {{ scheme.schemeTitle }}
          </div>
          <div class="text-[11px] font-mono text-muted mt-0.5">
            Ref: {{ scheme.refNo }}
          </div>
        </ng-template>

        <ng-template #viewSanctionOrderTemplate let-scheme>
          <a
            [routerLink]="['/admin/eoi-sanction-editor', scheme.id]"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            title="View Sanction Order"
          >
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View Sanction Order</span>
          </a>
        </ng-template>

        <ng-template #actionTemplate let-scheme>
          <a
            [routerLink]="['/admin/sanction-order', scheme.id]"
            class="btn btn-primary btn-sm whitespace-nowrap"
          >
            <span>Allocate Target</span>
          </a>
        </ng-template>

      </div>
    </div>
  `
})
export class SanctionOrderListComponent {
  private eoiStateService = inject(EoiStateService);
  schemes = signal<Scheme[]>([]);
  searchQuery = signal('');

  filteredSchemes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.schemes();
    if (!query) return list;
    return list.filter(s =>
      (s.schemeTitle && s.schemeTitle.toLowerCase().includes(query)) ||
      (s.refNo && s.refNo.toLowerCase().includes(query)) ||
      (s.category && s.category.toLowerCase().includes(query))
    );
  });

  readonly schemeColumns: TableColumn<Scheme>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'schemeTitle', label: 'EOI Ref No. & Scheme Name', width: 'min-w-[300px]', type: 'custom' },
    {
      key: 'category',
      label: 'Category',
      align: 'center',
      cellClass: 'whitespace-nowrap font-normal text-slate-700',
      format: (val) => {
        if (!val || val === 'NA' || val === '-') return '-';
        const cleaned = val.replace(/^Category\s+[I|V|X|0-9]+:\s*/i, '').trim();
        if (cleaned.toUpperCase() === 'RAJKVIK') return 'Rajvik';
        if (cleaned.toUpperCase() === 'SAMARTH') return 'Samarth';
        if (cleaned.toUpperCase() === 'SAKSHM' || cleaned.toUpperCase() === 'SAKSHAM') return 'Saksham';
        return cleaned || '-';
      }
    },
    { key: 'viewSanctionOrder', label: 'Sanction Order', align: 'center', width: 'w-44', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-36', type: 'custom' }
  ];

  constructor() {
    this.eoiStateService.getSchemes().pipe(takeUntilDestroyed()).subscribe(data => {
      // Filter ONLY schemes whose status is 'Closed'
      const closedSchemes = data.filter(s => s.status === 'Closed');
      this.schemes.set(closedSchemes);
    });
  }
}
