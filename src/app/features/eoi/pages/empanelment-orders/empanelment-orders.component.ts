import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  computed
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ButtonComponent,
  IconComponent,
  ListPageComponent,
  TableColumn
} from '../../../../shared';
import type { EmpanelmentOrder } from '../../models/empanelment-order.model';
import { EmpanelmentOrderService } from '../../services/empanelment-order.service';
import { OrderViewerModalComponent } from '../../components/order-viewer-modal/order-viewer-modal.component';

@Component({
  selector: 'app-empanelment-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ListPageComponent,
    ButtonComponent,
    IconComponent,
    OrderViewerModalComponent
  ],
  template: `
    <app-list-page
      title="Empanelment & Rejection Orders"
      [breadcrumbs]="[
        { label: 'Home', url: '/' },
        { label: 'Department Admin' },
        { label: 'Empanelment Orders' }
      ]"
      searchPlaceholder="Search by Scheme Name, EOI Ref, or File No..."
      [(searchQuery)]="searchQuery"
      [columns]="orderColumns"
      [data]="filteredOrders()"
      [pagination]="true"
      [pageSize]="10"
      emptyMessage="No empanelment orders found."
      [customTemplates]="{
        schemeDetails: schemeDetailsTemplate,
        committeeMembers: committeeTemplate,
        agenciesSummary: summaryTemplate,
        status: statusTemplate,
        action: actionTemplate
      }"
    >
      <!-- Top banner context -->
      <div beforeTable class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <app-icon name="clipboard-check" size="sm" />
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800">Scheme-Wise Empanelment & Rejection Orders</h4>
            <p class="text-[11px] text-slate-500">
              Official statutory orders released after multi-party committee e-Sign verification.
            </p>
          </div>
        </div>

        <div class="text-xs font-semibold text-slate-700 flex items-center gap-3">
          <span>Total Schemes with Orders: <strong class="text-slate-900">{{ orders().length }}</strong></span>
          <span class="text-slate-300">|</span>
          <a
            appButton
            variant="outline"
            size="sm"
            routerLink="/admin/eoi-view"
            title="Go to EOI Submissions"
          >
            <app-icon name="chevron-left" size="xs" />
            <span>EOI Responses</span>
          </a>
        </div>
      </div>

      <!-- Scheme Details Template -->
      <ng-template #schemeDetailsTemplate let-item>
        <div>
          <span class="font-bold text-slate-900 text-xs block hover:text-primary">
            {{ item.schemeName }}
          </span>
          <span class="text-[11px] tabular-nums text-slate-500 block mt-0.5">
            EOI: {{ item.eoiRefNo }}
          </span>
          <span class="text-[10px] text-slate-400 block mt-0.5">
            File: {{ item.fileNo }}
          </span>
        </div>
      </ng-template>

      <!-- Assigned Committee Members Template -->
      <ng-template #committeeTemplate let-item>
        <div class="space-y-1 max-w-xs">
          @for (member of item.committeeMembers; track member.id) {
            <div class="flex items-center gap-1.5 text-[11px]">
              <span class="w-1.5 h-1.5 rounded-full" [class]="member.otpVerified ? 'bg-emerald-500' : 'bg-slate-300'"></span>
              <span class="font-medium text-slate-800 truncate" [title]="member.name">{{ member.name }}</span>
              <span class="text-[10px] text-slate-500">({{ member.role || member.designation }})</span>
            </div>
          }
        </div>
      </ng-template>

      <!-- Agencies Summary Template -->
      <ng-template #summaryTemplate let-item>
        <div class="flex items-center gap-2">
          <!-- Empanelled Count Badge -->
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
            <app-icon name="check" size="xs" />
            <span>{{ item.empanelledAgencies?.length || 0 }} Empaneled</span>
          </span>

          <!-- Rejected Count Badge -->
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200">
            <span>{{ item.rejectedAgencies?.length || 0 }} Rejected</span>
          </span>
        </div>
      </ng-template>

      <!-- Status Template -->
      <ng-template #statusTemplate let-item>
        <div>
          @if (item.status === 'E_SIGNED') {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300">
              <app-icon name="check-circle" size="xs" />
              <span>E-Signed (RajKaj)</span>
            </span>
            <span class="block text-[10px] tabular-nums text-slate-500 mt-0.5">
              Ref: {{ item.rajKajRefNo || '23898348' }}
            </span>
          } @else {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
              <span>Draft Order</span>
            </span>
          }
        </div>
      </ng-template>

      <!-- Actions Template: View Empanelment Order & View Rejection Order -->
      <ng-template #actionTemplate let-item>
        <div class="flex items-center gap-1.5 justify-center">
          <button
            appButton
            variant="outline"
            size="sm"
            (click)="viewOrder(item, 'EMPANELMENT')"
            title="View Final Empanelment Order (Accepted Agencies)"
          >
            <app-icon name="eye" size="xs" />
            <span>Empanelment</span>
          </button>

          <button
            appButton
            variant="outline"
            size="sm"
            (click)="viewOrder(item, 'REJECTION')"
            title="View Final Rejection Order (Disqualified Agencies)"
          >
            <app-icon name="eye" size="xs" />
            <span>Rejection</span>
          </button>
        </div>
      </ng-template>
    </app-list-page>

    <!-- Modal for Viewing Official Order -->
    @if (showOrderModal()) {
      <app-order-viewer-modal
        [order]="selectedOrder()"
        [orderType]="selectedOrderType()"
        (close)="showOrderModal.set(false)"
      />
    }
  `
})
export class EmpanelmentOrdersPageComponent {
  private empanelmentOrderService = inject(EmpanelmentOrderService);
  private destroyRef = inject(DestroyRef);

  orders = signal<EmpanelmentOrder[]>([]);
  searchQuery = signal<string>('');

  showOrderModal = signal<boolean>(false);
  selectedOrder = signal<EmpanelmentOrder | null>(null);
  selectedOrderType = signal<'EMPANELMENT' | 'REJECTION'>('EMPANELMENT');

  readonly orderColumns: TableColumn<EmpanelmentOrder>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'schemeName', label: 'Scheme & EOI Details', width: 'min-w-[260px]', type: 'custom' },
    { key: 'committeeMembers', label: 'Assigned Committee Members', width: 'min-w-[240px]', type: 'custom' },
    { key: 'empanelledAgencies', label: 'Empaneled vs Rejected', align: 'center', width: 'w-48', type: 'custom' },
    { key: 'status', label: 'Digital E-Sign Status', align: 'center', width: 'w-44', type: 'custom' },
    { key: 'action', label: 'Official Orders', align: 'center', width: 'w-60', type: 'custom' }
  ];

  constructor() {
    this.empanelmentOrderService.getOrders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => {
      this.orders.set(list);
    });
  }

  filteredOrders = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.orders();
    if (!query) return list;
    return list.filter(o =>
      o.schemeName.toLowerCase().includes(query) ||
      o.eoiRefNo.toLowerCase().includes(query) ||
      o.fileNo.toLowerCase().includes(query) ||
      o.committeeMembers.some(m => m.name.toLowerCase().includes(query))
    );
  });

  viewOrder(order: EmpanelmentOrder, type: 'EMPANELMENT' | 'REJECTION'): void {
    this.selectedOrder.set(order);
    this.selectedOrderType.set(type);
    this.showOrderModal.set(true);
  }
}
