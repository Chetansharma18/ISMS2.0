import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TableColumn, TableComponent } from '../../../../shared';

interface FeeRow {
  id: string;
  description: string;
  note?: string;
  mode: string;
  /** Rendered as a plain badge when true (the paid fee), as muted text otherwise. */
  isBadge: boolean;
  amount: string;
}

@Component({
  selector: 'app-psd-fee-breakdown-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableComponent],
  host: { class: 'block' },
  template: `
    <app-table
      [columns]="columns"
      [data]="rows()"
      [customTemplates]="{ description: descriptionTpl, mode: modeTpl, amount: amountTpl }"
    />

    <!-- Total row: app-table has no footer, so it sits right below the grid -->
    <div class="flex items-center justify-between gap-4 mt-2 px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-900">
      <span class="text-sm">TOTAL AMOUNT PAID</span>
      <span class="text-base font-mono text-emerald-700">₹500.00</span>
    </div>

    <ng-template #descriptionTpl let-row>
      @if (row.note) {
        <div class="font-semibold text-slate-900">{{ row.description }}</div>
        <div class="text-[11px] text-slate-500">{{ row.note }}</div>
      } @else {
        <span class="text-slate-500">{{ row.description }}</span>
      }
    </ng-template>

    <ng-template #modeTpl let-row>
      @if (row.isBadge) {
        <span class="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
          {{ row.mode }}
        </span>
      } @else {
        <span class="text-slate-500">{{ row.mode }}</span>
      }
    </ng-template>

    <ng-template #amountTpl let-row>
      @if (row.isBadge) {
        <span class="font-mono font-bold">{{ row.amount }}</span>
      } @else {
        <span class="font-mono font-semibold text-slate-600">{{ row.amount }}</span>
      }
    </ng-template>
  `
})
export class PsdFeeBreakdownTableComponent {
  readonly selectedPaymentMethod = input.required<string>();

  protected readonly columns: TableColumn<FeeRow>[] = [
    { key: 'description', label: 'Fee Description' },
    { key: 'mode', label: 'Payment Mode', align: 'center' },
    { key: 'amount', label: 'Amount (INR)', align: 'right' }
  ];

  protected readonly rows = computed<FeeRow[]>(() => [
    {
      id: 'psd-fee',
      description: 'Batch PSD Verification Fee',
      note: 'Non-refundable statutory verification fee for batch scheduling',
      mode: this.selectedPaymentMethod(),
      isBadge: true,
      amount: '₹500.00'
    },
    {
      id: 'gateway-fee',
      description: 'Cyber Treasury / Gateway Convenience Fee',
      mode: 'Exempt',
      isBadge: false,
      amount: '₹0.00'
    }
  ]);
}
