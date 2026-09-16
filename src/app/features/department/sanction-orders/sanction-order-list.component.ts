import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiTableComponent, TableColumn } from '../../../shared/components/ui/ui-table/ui-table.component';
import { SanctionOrderService, SanctionOrder } from '../../../core/services/sanction-order.service';

@Component({
  selector: 'app-sanction-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, UiTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Sanction Orders</h1>
          <p class="text-slate-500 mt-1">Manage and release approved Sanction Orders to Training Providers.</p>
        </div>
        <button routerLink="/department/sanction-orders/create" class="px-4 py-2 bg-[#131A4D] text-white font-bold rounded shadow-xs hover:bg-[#0a0e29] transition-colors">
          + Create Sanction Order
        </button>
      </div>

      <app-ui-table
        [columns]="columns"
        [data]="(orders$ | async) || []"
        emptyMessage="No Sanction Orders found.">
        
        <ng-template #rowTemplate let-order let-col="column">
          
          <ng-container *ngIf="col.key === 'ref'">
            <div class="font-bold text-[#131A4D]">{{ order.ref }}</div>
            <div *ngIf="order.status === 'DRAFT'" class="text-xs text-slate-500">Draft</div>
            <div *ngIf="order.status !== 'DRAFT'" class="text-xs text-slate-500">Target: {{ order.target }} Aspirants</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'tender'">
            <div class="font-bold text-slate-700">{{ order.tender }}</div>
            <div class="text-xs text-slate-500">{{ order.eoi }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'tp'">
            <div class="font-bold text-slate-800">{{ order.tpName }}</div>
            <div class="text-[10px] text-slate-500 uppercase">{{ order.tpId }} • Approved</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'status'">
            <span *ngIf="order.status === 'DRAFT'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 uppercase inline-block border border-slate-200">
              Draft
            </span>
            <span *ngIf="order.status === 'PENDING_RELEASE'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase inline-block border border-amber-200">
              Pending Release
            </span>
            <span *ngIf="order.status === 'RELEASED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 uppercase inline-block border border-green-200">
              Released
            </span>
          </ng-container>

          <ng-container *ngIf="col.key === 'action'">
            <div class="flex justify-end gap-2">
              <button *ngIf="order.status === 'DRAFT'" class="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded shadow-xs transition-colors">
                Edit
              </button>
              <button *ngIf="order.status === 'PENDING_RELEASE'" (click)="releaseOrder(order)" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-xs transition-colors">
                Release Order
              </button>
            </div>
          </ng-container>

        </ng-template>
      </app-ui-table>
    </div>
  `
})
export class SanctionOrderListComponent {
  private sanctionOrderService = inject(SanctionOrderService);
  
  orders$ = this.sanctionOrderService.orders$;

  columns: TableColumn[] = [
    { key: 'ref', label: 'Order Ref' },
    { key: 'tender', label: 'Tender / EOI' },
    { key: 'tp', label: 'Training Provider' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action', align: 'right' }
  ];

  releaseOrder(order: SanctionOrder) {
    alert('Sanction Order Released! The TP can now create an SDC.');
    this.sanctionOrderService.updateStatus(order.id, 'RELEASED');
  }
}
