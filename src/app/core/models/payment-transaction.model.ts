export interface PaymentTransaction {
  id: string;
  paymentRef: string;          // Payment Reference No (GRN, UTR, Txn Ref)
  description: string;         // Description / Purpose
  category: 'Processing Fee' | 'EMD Guarantee' | 'PSD Security' | 'Portal Fee' | 'Other';
  amount: number;              // Numeric amount
  amountFormatted: string;     // Formatted currency string e.g. "₹ 2,000.00"
  paymentMode: string;         // Mode of payment, e.g. "UPI", "Credit Card", "Debit Card", "Net Banking"
  date: string;                // Formatted timestamp e.g. "08-Sep-2026, 11:30 AM"
  status: 'Success' | 'Completed' | 'Pending' | 'Failed';
  receiptName: string;         // Receipt document name
  appRef?: string;             // Associated Application Ref (if any)
}
