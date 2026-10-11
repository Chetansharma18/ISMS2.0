import { describe, it, expect } from 'vitest';
import {
  REGEX_PATTERNS,
  isValidPan,
  isValidGstin,
  isValidMobile,
  isValidPincode,
  isValidIfsc,
  isValidBankAccount
} from './validators.util';

describe('validators.util', () => {
  it('validates PAN case-insensitively and trims', () => {
    expect(isValidPan('ABCDE1234F')).toBe(true);
    expect(isValidPan(' abcde1234f ')).toBe(true);
    expect(isValidPan('ABCDE12345')).toBe(false);
    expect(isValidPan('')).toBe(false);
  });

  it('validates GSTIN', () => {
    expect(isValidGstin('08ABCDE1234F1Z5')).toBe(true);
    expect(isValidGstin('08ABCDE1234F1X5')).toBe(false);
  });

  it('validates Indian mobile numbers (start with 6-9, 10 digits)', () => {
    expect(isValidMobile('9876543210')).toBe(true);
    expect(isValidMobile('5876543210')).toBe(false);
    expect(isValidMobile('987654321')).toBe(false);
  });

  it('validates pincodes (6 digits, not starting with 0)', () => {
    expect(isValidPincode('302029')).toBe(true);
    expect(isValidPincode('012345')).toBe(false);
    expect(isValidPincode('30202')).toBe(false);
  });

  it('validates IFSC codes', () => {
    expect(isValidIfsc('SBIN0001234')).toBe(true);
    expect(isValidIfsc('sbin0001234')).toBe(true);
    expect(isValidIfsc('SBIN1001234')).toBe(false);
  });

  it('validates bank account numbers (9-18 digits)', () => {
    expect(isValidBankAccount('123456789')).toBe(true);
    expect(isValidBankAccount('12345678')).toBe(false);
    expect(isValidBankAccount('1234567890123456789')).toBe(false);
  });

  it('exposes stateless patterns that are safe to reuse (no global flag)', () => {
    for (const re of Object.values(REGEX_PATTERNS)) {
      expect(re.global).toBe(false);
      expect(re.sticky).toBe(false);
    }
  });

  it('ID document patterns match the formats the forms describe', () => {
    expect(REGEX_PATTERNS.VOTER_ID.test('ABC1234567')).toBe(true);
    expect(REGEX_PATTERNS.PASSPORT.test('A1234567')).toBe(true);
    expect(REGEX_PATTERNS.DRIVING_LICENSE.test('RJ0120110012345')).toBe(true);
  });
});
