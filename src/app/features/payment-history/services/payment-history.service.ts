import { Injectable, inject, signal, computed } from '@angular/core';
import { PaymentTransaction } from '../../../core/models/payment-transaction.model';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';

const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'pay-001',
    paymentRef: 'GRN-RAJ-2026-981240',
    description: 'Tender Processing Fee - Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    category: 'Processing Fee',
    amount: 2000,
    amountFormatted: '₹ 2,000.00',
    paymentMode: 'Cyber Treasury e-GRAS',
    date: '08-Sep-2026, 11:30 AM',
    status: 'Success',
    receiptName: 'Receipt_Processing_Fee_MMKVY.pdf',
    appRef: 'APP-2024-001'
  },
  {
    id: 'pay-002',
    paymentRef: 'GRN-RAJ-2026-981241',
    description: 'Earnest Money Deposit (EMD) - Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    category: 'EMD Guarantee',
    amount: 50000,
    amountFormatted: '₹ 50,000.00',
    paymentMode: 'Cyber Treasury e-GRAS',
    date: '08-Sep-2026, 11:45 AM',
    status: 'Success',
    receiptName: 'Receipt_EMD_MMKVY.pdf',
    appRef: 'APP-2024-001'
  },
  {
    id: 'pay-003',
    paymentRef: 'PSD-TXN-2026-44109',
    description: 'Performance Security Deposit (PSD) - BAT-2026-001 (Vidhyadhar Nagar)',
    category: 'PSD Security',
    amount: 15000,
    amountFormatted: '₹ 15,000.00',
    paymentMode: 'Online Gateway (e-Mitra)',
    date: '14-Sep-2026, 03:15 PM',
    status: 'Success',
    receiptName: 'Receipt_PSD_BAT-2026-001.pdf',
    appRef: 'BAT-2026-001'
  },
  {
    id: 'pay-004',
    paymentRef: 'GRN-RAJ-2026-981250',
    description: 'Tender Processing Fee - Seekho aur Kamao Yojana',
    category: 'Processing Fee',
    amount: 2000,
    amountFormatted: '₹ 2,000.00',
    paymentMode: 'Cyber Treasury e-GRAS',
    date: '18-Sep-2026, 01:20 PM',
    status: 'Success',
    receiptName: 'Receipt_Processing_Fee_Seekho.pdf',
    appRef: 'APP-2024-002'
  },
  {
    id: 'pay-005',
    paymentRef: 'GRN-RAJ-2026-981251',
    description: 'Earnest Money Deposit (EMD) - Seekho aur Kamao Yojana',
    category: 'EMD Guarantee',
    amount: 25000,
    amountFormatted: '₹ 25,000.00',
    paymentMode: 'Cyber Treasury e-GRAS',
    date: '18-Sep-2026, 01:35 PM',
    status: 'Success',
    receiptName: 'Receipt_EMD_Seekho.pdf',
    appRef: 'APP-2024-002'
  },
  {
    id: 'pay-006',
    paymentRef: 'GRN-RAJ-2026-981260',
    description: 'Tender Processing Fee - PMKVY 4.0 Special Projects',
    category: 'Processing Fee',
    amount: 5000,
    amountFormatted: '₹ 5,000.00',
    paymentMode: 'Cyber Treasury e-GRAS',
    date: '25-Sep-2026, 10:10 AM',
    status: 'Success',
    receiptName: 'Receipt_Processing_Fee_PMKVY.pdf',
    appRef: 'APP-2024-003'
  },
  {
    id: 'pay-007',
    paymentRef: 'GRN-RAJ-2026-981261',
    description: 'Earnest Money Deposit (EMD) - PMKVY 4.0 Special Projects',
    category: 'EMD Guarantee',
    amount: 50000,
    amountFormatted: '₹ 50,000.00',
    paymentMode: 'Cyber Treasury e-GRAS',
    date: '25-Sep-2026, 10:25 AM',
    status: 'Success',
    receiptName: 'Receipt_EMD_PMKVY.pdf',
    appRef: 'APP-2024-003'
  },
  {
    id: 'pay-008',
    paymentRef: 'GRN-RAJ-2026-981270',
    description: 'Tender Processing Fee - Skill Development for Divyangjan (Hunarmand)',
    category: 'Processing Fee',
    amount: 2000,
    amountFormatted: '₹ 2,000.00',
    paymentMode: 'Cyber Treasury e-GRAS',
    date: '02-Oct-2026, 04:40 PM',
    status: 'Success',
    receiptName: 'Receipt_Processing_Fee_Hunarmand.pdf',
    appRef: 'APP-2024-004'
  },
  {
    id: 'pay-009',
    paymentRef: 'GRN-RAJ-2026-981271',
    description: 'Earnest Money Deposit (EMD) - Skill Development for Divyangjan (Hunarmand)',
    category: 'EMD Guarantee',
    amount: 25000,
    amountFormatted: '₹ 25,000.00',
    paymentMode: 'Cyber Treasury e-GRAS',
    date: '02-Oct-2026, 04:55 PM',
    status: 'Success',
    receiptName: 'Receipt_EMD_Hunarmand.pdf',
    appRef: 'APP-2024-004'
  }
];

@Injectable({
  providedIn: 'root'
})
export class PaymentHistoryService {
  private readonly docViewer = inject(DocumentViewerService);

  readonly transactions = signal<PaymentTransaction[]>(INITIAL_TRANSACTIONS);

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
    this.transactions.update(items => [newTx, ...items]);
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
