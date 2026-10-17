import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ButtonComponent, IconComponent, TableColumn, TableComponent } from '../../../shared';
import { SubmittedTender } from '../../../core/models/tender.model';
import { TenderReceiptsService } from './tender-receipts.service';

/** One receipt row of the "Payments & Receipts" table. */
interface ReceiptRow {
  id: number;
  receipt: string;
  reference: string;
  amount: string;
  date: string;
  kind: 'acknowledgment' | 'emd' | 'processingFee';
}

/** Payments and receipts of a submitted application, with a download for each receipt. */
@Component({
  selector: 'app-tender-step5-emd',
  standalone: true,
  imports: [TableComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="receipts-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">5</span>
          <h2 id="receipts-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Payments &amp; Receipts</h2>
        </div>
        <button appButton variant="outline" size="sm" type="button" (click)="downloadAll()">
          <app-icon name="download" size="sm" />
          <span>Download All</span>
        </button>
      </div>

      <app-table
        [columns]="columns"
        [data]="rows()"
        [customTemplates]="{ action: actionTemplate }"
      />

      <ng-template #actionTemplate let-row>
        <button appButton size="sm" type="button" (click)="download(row)">
          <app-icon name="download" size="sm" />
          <span>Download</span>
        </button>
      </ng-template>
    </section>
  `
})
export class TenderStep5EmdComponent {
  protected readonly receipts = inject(TenderReceiptsService);

  readonly app = input.required<SubmittedTender>();

  protected readonly columns: TableColumn<ReceiptRow>[] = [
    { key: 'id', label: '#', align: 'center', width: 'w-10', cellClass: 'font-semibold text-slate-400' },
    { key: 'receipt', label: 'Receipt', cellClass: 'font-medium text-slate-900' },
    { key: 'reference', label: 'Reference No.', cellClass: 'font-mono text-slate-900' },
    { key: 'amount', label: 'Amount', align: 'right', cellClass: 'whitespace-nowrap' },
    { key: 'date', label: 'Date', cellClass: 'whitespace-nowrap' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-32', type: 'custom' }
  ];

  protected readonly rows = computed<ReceiptRow[]>(() => {
    const app = this.app();
    return [
      { id: 1, receipt: 'Submission Acknowledgment', reference: app.appRef, amount: '-', date: app.appliedDate, kind: 'acknowledgment' },
      { id: 2, receipt: 'EMD Receipt', reference: app.emdTransactionRef || '-', amount: app.emdAmount, date: app.appliedDate, kind: 'emd' },
      { id: 3, receipt: 'Processing Fee Receipt', reference: app.transactionRef || '-', amount: app.processingFee, date: app.appliedDate, kind: 'processingFee' }
    ];
  });

  protected download(row: ReceiptRow): void {
    const app = this.app();
    switch (row.kind) {
      case 'acknowledgment':
        this.receipts.downloadAcknowledgment(app);
        break;
      case 'emd':
        this.receipts.downloadEmdReceipt(app);
        break;
      case 'processingFee':
        this.receipts.downloadProcessingFeeReceipt(app);
        break;
    }
  }

  protected downloadAll(): void {
    this.receipts.downloadAcknowledgment(this.app());
    setTimeout(() => this.receipts.downloadEmdReceipt(this.app()), 300);
    setTimeout(() => this.receipts.downloadProcessingFeeReceipt(this.app()), 600);
  }
}
