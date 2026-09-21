import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SanctionOrderService, SanctionOrder } from '../../../core/services/sanction-order.service';
import { UiTableComponent, TableColumn } from '../../../shared/components/ui/ui-table/ui-table.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tp-sanction-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiTableComponent],
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Sanction Orders</h1>
          <p class="text-sm text-slate-500 mt-1">View your approved sanction orders and create Skill Development Centers (SDC).</p>
        </div>
      </div>

      <app-ui-table
        [columns]="columns"
        [data]="(orders$ | async) || []"
        emptyMessage="No sanction orders found.">
        
        <ng-template #rowTemplate let-order let-col="column">
          
          <ng-container *ngIf="col.key === 'tpCode'">
            <div class="font-mono font-semibold text-rsldc-navy">{{ order.tpCode || 'N/A' }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'scheme'">
            <div class="font-semibold text-slate-800">{{ order.scheme || 'N/A' }}</div>
          </ng-container>
          
          <ng-container *ngIf="col.key === 'mouStartDate'">
            <div class="text-slate-600">{{ order.mouStartDate ? (order.mouStartDate | date:'dd-MM-yyyy') : 'N/A' }}</div>
          </ng-container>
          
          <ng-container *ngIf="col.key === 'mouExpiryDate'">
            <div class="text-slate-600">{{ order.mouExpiryDate ? (order.mouExpiryDate | date:'dd-MM-yyyy') : 'N/A' }}</div>
          </ng-container>
          
          <ng-container *ngIf="col.key === 'totalSdc'">
            <div class="text-slate-600">{{ order.totalSdc || 0 }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'action'">
            <div class="flex justify-end gap-2">
              <a [routerLink]="['/sdcs/create']" [queryParams]="{ sanctionOrderRef: order.ref, tpCode: order.tpCode }" class="inline-flex items-center gap-2 bg-rsldc-navy text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-rsldc-navyLight transition shadow-md">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Create SDC
              </a>
            </div>
          </ng-container>

        </ng-template>
      </app-ui-table>
    </div>
  `
})
export class TpSanctionOrderListComponent {
  private sanctionOrderService = inject(SanctionOrderService);
  
  orders$ = this.sanctionOrderService.orders$.pipe(
    map((orders: SanctionOrder[]) => orders.filter((o: SanctionOrder) => o.status === 'RELEASED'))
  );

  columns: TableColumn[] = [
    { key: 'tpCode', label: 'TP Code' },
    { key: 'scheme', label: 'Scheme' },
    { key: 'mouStartDate', label: 'MOU Start Date' },
    { key: 'mouExpiryDate', label: 'MOU Expiry Date' },
    { key: 'totalSdc', label: 'Total SDC' },
    { key: 'action', label: 'Actions', align: 'right' }
  ];
}
