import { describe, it, expect } from 'vitest';
import { formatInr, formatFileSize, maskAadhaar, maskPan } from './formatters.util';

describe('formatters.util', () => {
  describe('formatInr', () => {
    it('uses Indian digit grouping with a rupee symbol', () => {
      expect(formatInr(5000000)).toBe('\u20B950,00,000');
      expect(formatInr(1234)).toBe('\u20B91,234');
    });

    it('can drop the symbol', () => {
      expect(formatInr(1500, { symbol: false })).toBe('1,500');
    });

    it('keeps requested fraction digits only when present', () => {
      expect(formatInr(1500.5, { fractionDigits: 2 })).toBe('\u20B91,500.5');
      expect(formatInr(1500.567, { fractionDigits: 2 })).toBe('\u20B91,500.57');
    });

    it('compacts to Lakh and Cr', () => {
      expect(formatInr(250000, { compact: true })).toBe('\u20B92.50 Lakh');
      expect(formatInr(25000000, { compact: true })).toBe('\u20B92.50 Cr');
    });

    it('parses numeric strings with commas', () => {
      expect(formatInr('1,00,000')).toBe('\u20B91,00,000');
    });

    it('returns a dash for empty values and echoes garbage', () => {
      expect(formatInr(null)).toBe('-');
      expect(formatInr(undefined)).toBe('-');
      expect(formatInr('')).toBe('-');
      expect(formatInr('abc')).toBe('abc');
    });

    it('formats zero rather than treating it as empty', () => {
      expect(formatInr(0)).toBe('\u20B90');
    });
  });

  it('formatFileSize scales units', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('maskAadhaar keeps only the last four digits', () => {
    expect(maskAadhaar('1234 5678 9012')).toBe('XXXX-XXXX-9012');
    expect(maskAadhaar('123')).toBe('123');
  });

  it('maskPan keeps first two and last three characters', () => {
    expect(maskPan('ABCDE1234F')).toBe('ABXXXXX34F');
    expect(maskPan('ABC')).toBe('ABC');
  });
});
