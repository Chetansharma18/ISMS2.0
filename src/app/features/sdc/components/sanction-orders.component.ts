import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MOCK_SANCTION_ORDERS, SanctionOrder } from '../models/sdc.model';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../../shared';

@Component({
  selector: 'app-sanction-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    TableComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header title="Sanction Order"></app-page-header>

        <!-- Success Toast Notification -->
        @if (successMessage()) {
          <div class="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <span class="font-bold text-emerald-700">Success:</span>
              <span>{{ successMessage() }}</span>
            </div>
            <button (click)="successMessage.set('')" class="text-emerald-600 hover:text-emerald-900 cursor-pointer font-bold">✕</button>
          </div>
        }

        <!-- Orders Table via Reusable TableComponent -->
        <app-table
          [columns]="orderColumns"
          [data]="orders"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="orders"
          emptyMessage="No sanction orders available."
          [customTemplates]="{
            schemeName: schemeNameTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Scheme Name -->
        <ng-template #schemeNameTemplate let-so>
          <span class="font-bold text-slate-900">{{ so.schemeName || so.scheme }}</span>
        </ng-template>

        <!-- Template: Actions (Add SDC navigates directly to Register SDC form) -->
        <ng-template #actionsTemplate let-so>
          <button
            type="button"
            (click)="navigateToAddSdc(so.schemeName || so.scheme, so.category)"
            class="whitespace-nowrap inline-flex items-center justify-center gap-2 px-8 py-2 rounded-lg bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 w-full"
            title="Register SDC for {{ so.schemeName || so.scheme }}"
          >
            <span class="text-base font-bold leading-none">+</span>
            <span>Add SDC</span>
          </button>
        </ng-template>

      </div>
    </div>
  `
})
export class SanctionOrdersComponent {
  private router = inject(Router);

  readonly pageSize = 10;
  readonly orders: SanctionOrder[] = MOCK_SANCTION_ORDERS;
  successMessage = signal<string>('');

  readonly orderColumns: TableColumn<SanctionOrder>[] = [
    { key: 'ipaNumber',        label: 'IPA Number',           align: 'center', width: 'w-36',  cellClass: 'whitespace-nowrap font-mono font-medium text-slate-700 text-center' },
    { key: 'schemeName',       label: 'Scheme Name',          align: 'center', type: 'custom', cellClass: 'whitespace-nowrap font-bold text-slate-900 text-center' },
    { key: 'category',         label: 'Category',             align: 'center',                 cellClass: 'whitespace-nowrap font-medium text-slate-700 text-center' },
    { key: 'mouStartDate',     label: 'MoU Start Date',       align: 'center',                 cellClass: 'whitespace-nowrap text-slate-600 text-center' },
    { key: 'mouExpiryDate',    label: 'MoU Expiry',           align: 'center',                 cellClass: 'whitespace-nowrap text-slate-600 text-center' },
    { key: 'totalSdc',         label: 'Total no. of SDC',     align: 'center',                 cellClass: 'whitespace-nowrap font-medium text-slate-800 text-center' },
    { key: 'approvedSdcCount', label: "No. of Approved SDC's", align: 'center', width: 'w-48', headerClass: 'whitespace-nowrap', cellClass: 'whitespace-nowrap font-medium text-slate-800 text-center' },
    { key: 'actions',          label: 'Action',               align: 'center', type: 'custom', width: 'w-56' }
  ];

  navigateToAddSdc(scheme: string, category?: string): void {
    this.router.navigate(['/sdc/create'], { queryParams: { scheme, schemeCategory: category } });
  }
}
