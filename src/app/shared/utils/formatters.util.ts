export function formatInr(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
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
