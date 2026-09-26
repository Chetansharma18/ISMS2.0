import { Component, inject, signal, computed } from '@angular/core';
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
        
        <!-- Page Header via Reusable PageHeaderComponent (Matching Screenshot 2) -->
        <app-page-header
          title="Create SDC"
          [showBack]="true"
          backUrl="/sdcs"
          backTitle="Back to Centers"
          [breadcrumbs]="[
            { label: 'Registration', url: '/registration' },
            { label: 'Centers' }
          ]"
        ></app-page-header>

        <!-- Search & Info Toolbar (Matching Active EOI & Tender Status) -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div class="text-xs text-slate-500 font-normal">
            View your approved sanction orders and create Skill Development Centers (SDC).
          </div>

          <!-- Search Input with Search Icon & Clear Button -->
          <div class="relative w-full sm:w-72">
            <svg class="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search TP-Code, Scheme..."
              class="w-full pl-8 pr-7 py-1.5 text-[13px] bg-white border border-border rounded-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-normal"
            />
            @if (searchQuery) {
              <button
                type="button"
                (click)="searchQuery = ''"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                &times;
              </button>
            }
          </div>
        </div>

        <!-- Orders Table via Reusable TableComponent -->
        <app-table
          [columns]="orderColumns"
          [data]="filteredOrders()"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="orders"
          emptyMessage="No sanction orders match your search criteria."
          [customTemplates]="{
            scheme: schemeTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Scheme Tag -->
        <ng-template #schemeTemplate let-so>
          <span class="font-bold text-slate-900">{{ so.scheme }}</span>
        </ng-template>

        <!-- Template: Actions (Add SDC Link matching Screenshot 2) -->
        <ng-template #actionsTemplate let-so>
          <button
            type="button"
            (click)="createSdc(so.scheme)"
            class="text-sky-600 hover:text-sky-700 hover:underline font-semibold text-[13px] cursor-pointer inline-flex items-center gap-1 select-none transition-colors"
            title="Add SDC for {{ so.scheme }}"
          >
            Add SDC
          </button>
        </ng-template>

      </div>
    </div>
  `
})
export class SanctionOrdersComponent {
  private router = inject(Router);

  searchQuery = '';
  readonly pageSize = 10;
  readonly orders: SanctionOrder[] = MOCK_SANCTION_ORDERS;

  readonly orderColumns: TableColumn<SanctionOrder>[] = [
    { key: 'tpCode', label: 'TP-Code', width: 'w-36', cellClass: 'whitespace-nowrap font-mono font-medium text-slate-700' },
    { key: 'scheme', label: 'Scheme', type: 'custom', cellClass: 'whitespace-nowrap font-bold text-slate-900' },
    { key: 'mouStartDate', label: 'MoU Start Date', align: 'center', cellClass: 'whitespace-nowrap text-slate-600' },
    { key: 'mouExpiryDate', label: 'MoU Expiry', align: 'center', cellClass: 'whitespace-nowrap text-slate-600' },
    { key: 'totalSdc', label: 'Total no. of SDC', align: 'center', cellClass: 'whitespace-nowrap font-medium text-slate-800' },
    { key: 'approvedSdcCount', label: "No. of Approved SDC's", align: 'center', cellClass: 'whitespace-nowrap font-medium text-slate-800' },
    { key: 'actions', label: '', align: 'center', type: 'custom', width: 'w-28' }
  ];

  readonly filteredOrders = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.orders;
    return this.orders.filter(
      so =>
        so.tpCode.toLowerCase().includes(q) ||
        so.scheme.toLowerCase().includes(q)
    );
  });

  createSdc(scheme: string): void {
    this.router.navigate(['/sdc/create'], { queryParams: { scheme } });
  }
}
