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

@Component({
  selector: 'app-empanelment-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ListPageComponent,
    ButtonComponent,
    IconComponent
  ],
  template: `
    <app-list-page
      title="Empanelment Order"
      [breadcrumbs]="[
        { label: 'Home', url: '/' },
        { label: 'Department Admin' },
        { label: 'Empanelment Order' }
      ]"
      searchPlaceholder="Search by Scheme Name, EOI Reference Number, File No., or Committee Member..."
      [(searchQuery)]="searchQuery"
      [columns]="orderColumns"
      [data]="filteredOrders()"
      [pagination]="true"
      [pageSize]="10"
      emptyMessage="No empanelment orders found."
      [customTemplates]="{
        schemeName: schemeNameTemplate,
        committeeMembers: committeeTemplate,
        eligibleEmpanelment: eligibleTemplate,
        rejectedEmpanelment: rejectedTemplate
      }"
    >
      <!-- Scheme Name Template -->
      <ng-template #schemeNameTemplate let-item>
        <div class="py-1">
          <span class="font-bold text-slate-900 text-[13px] block leading-snug">
            {{ item.schemeName }}
          </span>
          <div class="flex items-center gap-2 mt-1">
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Ref: {{ item.eoiRefNo }}
            </span>
            @if (item.fileNo) {
              <span class="text-[10px] text-slate-400 truncate max-w-[200px]" [title]="item.fileNo">
                File: {{ item.fileNo }}
              </span>
            }
          </div>
        </div>
      </ng-template>

      <!-- Assigned Committee Template -->
      <ng-template #committeeTemplate let-item>
        <div class="space-y-1 py-1">
          @for (member of item.committeeMembers; track member.id) {
            <div class="flex items-center gap-1.5 text-[11.5px]">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                [class]="member.otpVerified ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-slate-300'"
                [title]="member.otpVerified ? 'OTP Verified & E-Signed' : 'Pending Verification'"
              ></span>
              <span class="font-medium text-slate-800">{{ member.name }}</span>
              <span class="text-[10.5px] text-slate-500">({{ member.role || member.designation }})</span>
            </div>
          }
        </div>
      </ng-template>

      <!-- Eligible EOI Empanelment Template -->
      <ng-template #eligibleTemplate let-item>
        <div class="flex items-center justify-center py-1">
          <button
            appButton
            variant="outline"
            size="sm"
            (click)="viewOrder(item, 'EMPANELMENT')"
            title="View Official Empanelment Order"
          >
            <app-icon name="eye" size="xs" />
            <span>View Order</span>
          </button>
        </div>
      </ng-template>

      <!-- Rejected Empanelment Order Template -->
      <ng-template #rejectedTemplate let-item>
        <div class="flex items-center justify-center py-1">
          <button
            appButton
            variant="outline"
            size="sm"
            (click)="viewOrder(item, 'REJECTION')"
            title="View Official Rejection Order"
          >
            <app-icon name="eye" size="xs" />
            <span>View Order</span>
          </button>
        </div>
      </ng-template>
    </app-list-page>
  `
})
export class EmpanelmentOrdersPageComponent {
  private empanelmentOrderService = inject(EmpanelmentOrderService);
  private destroyRef = inject(DestroyRef);

  orders = signal<EmpanelmentOrder[]>([]);
  searchQuery = signal<string>('');

  readonly orderColumns: TableColumn<EmpanelmentOrder>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
    { key: 'schemeName', label: 'Scheme Name', width: 'min-w-[300px]', type: 'custom' },
    { key: 'committeeMembers', label: 'Assigned Committee', width: 'min-w-[280px]', type: 'custom' },
    { key: 'eligibleEmpanelment', label: 'Eligible EOI Empanelment', align: 'center', width: 'w-52', type: 'custom' },
    { key: 'rejectedEmpanelment', label: 'Rejected Empanelment Order', align: 'center', width: 'w-52', type: 'custom' }
  ];

  constructor() {
    this.empanelmentOrderService.getOrders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => {
      this.orders.set(list);
    });
  }

  readonly filteredOrders = computed(() => {
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
    const tab = window.open('', '_blank');
    void this.empanelmentOrderService.openOrderPdf(order, type, tab);
  }
}
