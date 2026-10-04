import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    PageHeaderComponent,
    TableComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Sanction Order"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Sanction Order' }]"
        >
          <!-- Search input -->
          <div class="relative w-full sm:w-72">
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search Sanction Orders..."
              class="w-full pl-9 pr-7 py-1.5 text-[13px] bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#174A6E] focus:border-[#174A6E] transition-colors font-normal shadow-2xs"
            />
            @if (searchQuery) {
              <button
                type="button"
                (click)="searchQuery = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                ✕
              </button>
            }
          </div>
        </app-page-header>

        <!-- Orders Table via Reusable TableComponent -->
        <app-table
          [columns]="orderColumns"
          [data]="filteredOrders"
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
          <div class="flex flex-col items-center">
            <span class="font-bold text-slate-900">{{ so.schemeName || so.scheme }}</span>
          </div>
        </ng-template>

        <!-- Template: Actions (Add SDC navigates directly to Register SDC form) -->
        <ng-template #actionsTemplate let-so>
          <button
            type="button"
            (click)="navigateToAddSdc(so.schemeName || so.scheme, so.category)"
            class="whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-6 py-1.5 rounded-lg bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
            title="Register SDC for {{ so.schemeName || so.scheme }}"
          >
            <span class="text-sm font-bold leading-none">+</span>
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
  searchQuery = '';
  readonly orders: SanctionOrder[] = MOCK_SANCTION_ORDERS;

  readonly orderColumns: TableColumn<SanctionOrder>[] = [
    { key: '$index',           label: 'S. No.',               align: 'center', width: 'w-14' },
    { key: 'schemeName',       label: 'Scheme Name',          align: 'center', type: 'custom', cellClass: 'whitespace-nowrap font-bold text-slate-900 text-center' },
    { key: 'category',         label: 'Category',             align: 'center',                 cellClass: 'whitespace-nowrap font-medium text-slate-700 text-center' },
    { key: 'mouStartDate',     label: 'MoU Start Date',       align: 'center',                 cellClass: 'whitespace-nowrap text-slate-600 text-center' },
    { key: 'mouExpiryDate',    label: 'MoU Expiry',           align: 'center',                 cellClass: 'whitespace-nowrap text-slate-600 text-center' },
    { key: 'totalSdc',         label: 'Total no. of SDC',     align: 'center',                 cellClass: 'whitespace-nowrap font-medium text-slate-800 text-center' },
    { key: 'approvedSdcCount', label: "No. of Approved SDC's", align: 'center', width: 'w-48', headerClass: 'whitespace-nowrap', cellClass: 'whitespace-nowrap font-medium text-slate-800 text-center' },
    { key: 'actions',          label: 'Action',               align: 'center', type: 'custom', width: 'w-44' }
  ];

  get filteredOrders(): SanctionOrder[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.orders;
    return this.orders.filter(o =>
      o.schemeName.toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q) ||
      (o.tpCode && o.tpCode.toLowerCase().includes(q))
    );
  }

  navigateToAddSdc(scheme: string, category?: string): void {
    this.router.navigate(['/sdc/create'], { queryParams: { scheme, schemeCategory: category } });
  }
}
