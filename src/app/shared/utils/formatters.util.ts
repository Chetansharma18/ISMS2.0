export interface InrFormatOptions {
  /** Abbreviate large values as Lakh / Cr */
  compact?: boolean;
  /** Prefix with the ₹ symbol (default true) */
  symbol?: boolean;
  /** Max fraction digits (default 0) */
  fractionDigits?: number;
}

/**
 * Single source of truth for Indian Rupee formatting (e.g. ₹50,00,000).
 * Used by TS code directly and by InrCurrencyPipe in templates.
 */
export function formatInr(
  amount: number | string | null | undefined,
  options: InrFormatOptions = {}
): string {
  if (amount === null || amount === undefined || amount === '') return '-';

  const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(num)) return String(amount);

  const { compact = false, symbol = true, fractionDigits = 0 } = options;
  const prefix = symbol ? '\u20B9' : '';

  if (compact) {
    if (Math.abs(num) >= 10000000) return `${prefix}${(num / 10000000).toFixed(2)} Cr`;
    if (Math.abs(num) >= 100000) return `${prefix}${(num / 100000).toFixed(2)} Lakh`;
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0
  }).format(num);

  return `${prefix}${formatted}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length < 12) return aadhaar;
  const cleaned = aadhaar.replace(/\s+/g, '');
  return `XXXX-XXXX-${cleaned.slice(-4)}`;
}

export function maskPan(pan: string): string {
  if (!pan || pan.length < 10) return pan;
  return `${pan.slice(0, 2)}XXXXX${pan.slice(-3)}`;
}
