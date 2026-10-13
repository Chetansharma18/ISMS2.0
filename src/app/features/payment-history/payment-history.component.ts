import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent, TableComponent, TableColumn } from '../../shared';
import { PaymentHistoryService } from './services/payment-history.service';
import { PaymentTransaction } from '../../core/models/payment-transaction.model';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, PageHeaderComponent, TableComponent],
  host: { class: 'block' },
  template: `
    <div class="p-4 sm:p-5 space-y-4 font-sans text-slate-800">

      <!-- Reusable Page Header with Search -->
      <app-page-header
        title="Payment History"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Payment History' }]"
        [searchable]="true"
        [(searchQuery)]="searchQuery"
        searchPlaceholder="Search Reference No, Description, Mode..."
      />

      <!-- Main Payment History Table via Reusable TableComponent -->
      <app-table
        [columns]="columns"
        [data]="filteredTransactions()"
        [pagination]="true"
        [pageSize]="pageSize"
        emptyMessage="No payment records match your search query."
        [customTemplates]="{
          paymentRef: paymentRefTemplate,
          description: descriptionTemplate,
          date: dateTemplate,
          paymentMode: paymentModeTemplate,
          amount: amountTemplate,
          status: statusTemplate,
          receipt: receiptTemplate
        }"
      >
      </app-table>

      <!-- Custom Payment Reference No Template -->
      <ng-template #paymentRefTemplate let-tx>
        <span class="font-mono text-slate-800 font-normal text-[13px] tracking-tight select-all">
          {{ tx.paymentRef }}
        </span>
      </ng-template>

      <!-- Custom Description Template -->
      <ng-template #descriptionTemplate let-tx>
        <div class="py-1">
          <span class="font-normal text-slate-800 text-[13px] block leading-tight">
            {{ tx.description }}
          </span>
          @if (tx.appRef) {
            <span class="text-[11.5px] text-slate-500 font-normal mt-0.5 block">
              Ref: {{ tx.appRef }}
            </span>
          }
        </div>
      </ng-template>

      <!-- Custom Date & Time Template -->
      <ng-template #dateTemplate let-tx>
        <span class="text-slate-800 font-normal text-[13px] whitespace-nowrap">
          {{ tx.date }}
        </span>
      </ng-template>

      <!-- Custom Payment Mode Template -->
      <ng-template #paymentModeTemplate let-tx>
        <span class="text-slate-800 font-normal text-[13px]">
          {{ tx.paymentMode }}
        </span>
      </ng-template>

      <!-- Custom Amount Template -->
      <ng-template #amountTemplate let-tx>
        <span class="text-slate-900 font-normal text-[13px] tabular-nums whitespace-nowrap">
          {{ tx.amountFormatted }}
        </span>
      </ng-template>

      <!-- Custom Status Template (Plain normal font text matching portal style) -->
      <ng-template #statusTemplate let-tx>
        <span class="text-slate-800 font-normal text-[13px]">
          {{ tx.status }}
        </span>
      </ng-template>

      <!-- Custom Receipt Action Template -->
      <ng-template #receiptTemplate let-tx>
        <button
          type="button"
          (click)="onViewReceipt(tx)"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-normal text-brand hover:text-navy hover:bg-slate-50 border border-slate-200 rounded transition-colors cursor-pointer"
          title="Open Receipt in Chrome tab"
        >
          <svg class="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Receipt</span>
        </button>
      </ng-template>

    </div>
  `
})
export class PaymentHistoryComponent {
  readonly paymentService = inject(PaymentHistoryService);

  readonly searchQuery = signal('');
  readonly pageSize = 10;

  readonly columns: TableColumn[] = [
    {
      key: '$index',
      label: 'S.No.',
      width: 'w-14',
      align: 'center',
      headerAlign: 'center',
      type: 'number'
    },
    {
      key: 'paymentRef',
      label: 'Payment Reference No',
      width: 'w-48',
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true
    },
    {
      key: 'date',
      label: 'Date & Time',
      width: 'w-44',
      sortable: true
    },
    {
      key: 'paymentMode',
      label: 'Payment Mode',
      width: 'w-44'
    },
    {
      key: 'amount',
      label: 'Amount',
      width: 'w-32',
      align: 'right',
      headerAlign: 'right',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-24',
      align: 'center',
      headerAlign: 'center'
    },
    {
      key: 'receipt',
      label: 'Receipt',
      width: 'w-28',
      align: 'center',
      headerAlign: 'center'
    }
  ];

  readonly filteredTransactions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.paymentService.transactions();
    if (!q) return list;

    return list.filter(item =>
      (item.paymentRef && item.paymentRef.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.paymentMode && item.paymentMode.toLowerCase().includes(q)) ||
      (item.date && item.date.toLowerCase().includes(q)) ||
      (item.amountFormatted && item.amountFormatted.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q)) ||
      (item.appRef && item.appRef.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  onViewReceipt(tx: PaymentTransaction): void {
    this.paymentService.viewReceipt(tx);
  }
}
