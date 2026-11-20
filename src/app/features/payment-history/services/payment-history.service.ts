import { Injectable, inject, computed } from '@angular/core';
import { INITIAL_PAYMENT_TRANSACTIONS } from '../../../core/mock/data/payments.mock';
import { PaymentTransaction } from '../../../core/models/payment-transaction.model';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';
import { createPersistedStore } from '../../../core/services/persisted-store';

@Injectable({
  providedIn: 'root'
})
export class PaymentHistoryService {
  private readonly docViewer = inject(DocumentViewerService);

  /** Resource `PAYMENTS`. In mock mode it lives in memory only and starts from the seed on every reload. */
  private readonly store = createPersistedStore<PaymentTransaction>({
    dataKey: 'PAYMENTS',
    seed: INITIAL_PAYMENT_TRANSACTIONS
  });

  readonly transactions = this.store.items.asReadonly();

  readonly totalAmount = computed(() =>
    this.transactions().reduce((sum, item) => sum + item.amount, 0)
  );

  readonly totalCount = computed(() => this.transactions().length);

  /**
   * Adds a newly executed transaction to the history table (e.g., when a user pays in form)
   */
  recordTransaction(tx: Omit<PaymentTransaction, 'id'>): void {
    const newTx: PaymentTransaction = {
      ...tx,
      id: `pay-${Date.now()}`
    };
    this.store.items.update(items => [newTx, ...items]);
    this.store.persist();
  }

  /**
   * Opens the transaction receipt directly in another tab via DocumentViewerService
   */
  viewReceipt(tx: PaymentTransaction): void {
    this.docViewer.openDocument(
      {
        fileName: tx.receiptName,
        title: `Receipt - ${tx.paymentRef}`
      },
      tx.description
    );
  }
}
