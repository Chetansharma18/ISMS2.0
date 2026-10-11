/**
 * Single source of truth for statutory / identity validation patterns.
 * Use `.test()` in TS, `.source` where a string pattern is required
 * (e.g. FormFieldConfig.pattern), or the isValidX helpers below.
 */
export const REGEX_PATTERNS = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  AADHAAR: /^[2-9]{1}[0-9]{11}$/,
  MOBILE: /^[6-9]\d{9}$/,
  PINCODE: /^[1-9][0-9]{5}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  VOTER_ID: /^[A-Z]{3}[0-9]{7}$/,
  PASSPORT: /^[A-Z][0-9]{7}$/,
  DRIVING_LICENSE: /^[A-Z]{2}[0-9]{2}[0-9A-Z]{0,12}$/,
  BANK_ACCOUNT: /^[0-9]{9,18}$/
};

export function isValidPan(pan: string): boolean {
  return REGEX_PATTERNS.PAN.test((pan || '').trim().toUpperCase());
}

export function isValidGstin(gstin: string): boolean {
  return REGEX_PATTERNS.GSTIN.test((gstin || '').trim().toUpperCase());
}

export function isValidMobile(mobile: string): boolean {
  return REGEX_PATTERNS.MOBILE.test((mobile || '').trim());
}

export function isValidPincode(pincode: string): boolean {
  return REGEX_PATTERNS.PINCODE.test((pincode || '').trim());
}

export function isValidIfsc(ifsc: string): boolean {
  return REGEX_PATTERNS.IFSC.test((ifsc || '').trim().toUpperCase());
}

export function isValidBankAccount(accountNo: string): boolean {
  return REGEX_PATTERNS.BANK_ACCOUNT.test((accountNo || '').trim());
}
