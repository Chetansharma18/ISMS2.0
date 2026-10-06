import { Component, inject, signal } from '@angular/core';
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
  imports: [CommonModule, RouterModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="w-full min-h-full bg-background text-primary font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Sanction Order"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Sanction Order' }]"
        >
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-[#0c2d4e] border border-slate-300 text-xs font-medium shadow-xs">
            <span class="text-slate-600">Closed Schemes (Sanction Ready):</span>
            <span class="font-bold text-[#0c2d4e]">{{ schemes().length }}</span>
          </div>
        </app-page-header>

        <!-- Main Sanction Order Schemes Table via Reusable TableComponent -->
        <app-table
          [columns]="schemeColumns"
          [data]="schemes()"
          [pagination]="true"
          [pageSize]="10"
          [customTemplates]="{
            schemeTitle: schemeTitleTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #schemeTitleTemplate let-scheme>
          <div class="font-medium text-primary text-[13px] leading-snug">
            {{ scheme.schemeTitle }}
          </div>
          <div class="text-[11px] font-mono text-muted mt-0.5">
            Ref: {{ scheme.refNo }}
          </div>
        </ng-template>

        <ng-template #actionTemplate let-scheme>
          <a
            [routerLink]="['/admin/sanction-order', scheme.id]"
            class="btn btn-primary btn-sm"
          >
            <span>View</span>
          </a>
        </ng-template>

      </div>
    </div>
  `
})
export class SanctionOrderListComponent {
  private eoiStateService = inject(EoiStateService);
  schemes = signal<Scheme[]>([]);

  readonly schemeColumns: TableColumn<Scheme>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'schemeTitle', label: 'EOI Ref No. & Scheme Name', width: 'min-w-[320px]', type: 'custom' },
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
    { key: 'action', label: 'Action', align: 'center', width: 'w-24', type: 'custom' }
  ];

  constructor() {
    this.eoiStateService.getSchemes().subscribe(data => {
      // Filter ONLY schemes whose status is 'Closed'
      const closedSchemes = data.filter(s => s.status === 'Closed');
      this.schemes.set(closedSchemes);
    });
  }
}
