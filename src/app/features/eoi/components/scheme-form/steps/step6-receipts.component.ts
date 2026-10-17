import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ButtonComponent, IconComponent, TableColumn, TableComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';

/** One line of the receipts table. */
interface ReceiptRow {
  id: number;
  name: string;
  reference: string;
  amount: string;
  date: string;
  download: () => void;
}

/** Step 6: submission acknowledgement and payment receipts. */
@Component({
  selector: 'app-step6-receipts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, TableComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-4 font-sans">

      <!-- Submission summary -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Submission Details</h2>
        </div>

        <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">EOI Submission Reference No.</span>
            <span class="font-medium text-navy text-[12.5px] block mt-1 font-mono">{{ state.eoiApplicationId() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Scheme</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.schemeName() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">EOI Reference No.</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono break-all">{{ state.schemeRefNo() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Submitted On</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.submissionTimestamp() }}</span>
          </div>
        </div>
      </section>

      <!-- Receipts table -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Receipts</h2>
          </div>
          <button appButton variant="outline" size="sm" (click)="state.downloadAllReceipts()">
            <app-icon name="download" size="sm" />
            <span>Download All</span>
          </button>
        </div>

        <div class="p-4 sm:p-5">
          <app-table [columns]="receiptColumns" [data]="receipts()" [customTemplates]="{ action: actionTemplate }">
          </app-table>
        </div>

        <ng-template #actionTemplate let-row>
          <button appButton size="sm" (click)="row.download()">
            <app-icon name="download" size="sm" />
            <span>Download</span>
          </button>
        </ng-template>
      </section>

      <!-- Footer Navigation Bar -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button appButton size="lg" (click)="state.goToTenderStatus()">
          <span>Track Tender Status</span>
        </button>
      </div>

    </div>
  `
})
export class Step6ReceiptsComponent {
  protected readonly state = inject(SchemeFormState);

  protected readonly receiptColumns: TableColumn<ReceiptRow>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-10' },
    { key: 'name', label: 'Receipt' },
    { key: 'reference', label: 'Reference No.', cellClass: 'font-mono' },
    { key: 'amount', label: 'Amount', align: 'right', cellClass: 'whitespace-nowrap' },
    { key: 'date', label: 'Date', cellClass: 'whitespace-nowrap' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'w-32' }
  ];

  protected readonly receipts = computed<ReceiptRow[]>(() => [
    {
      id: 1,
      name: 'Submission Acknowledgment',
      reference: this.state.eoiApplicationId(),
      amount: '-',
      date: this.state.submissionTimestamp(),
      download: () => this.state.downloadAcknowledgmentReceipt()
    },
    {
      id: 2,
      name: 'EMD Receipt',
      reference: this.state.emdPaymentRef(),
      amount: this.state.paymentMethod() === 'exemption' ? 'Exempted' : this.state.formattedEmdFee(),
      date: this.state.submissionTimestamp(),
      download: () => this.state.downloadEmdReceipt()
    },
    {
      id: 3,
      name: 'Processing Fee Receipt',
      reference: this.state.procPaymentRef,
      amount: this.state.formattedProcessFee(),
      date: this.state.procFeeDate(),
      download: () => this.state.downloadProcessingFeeReceipt()
    }
  ]);
}
