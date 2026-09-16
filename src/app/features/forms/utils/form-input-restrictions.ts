/**
 * Hoisted regex patterns to prevent repeated instantiation on every keystroke
 */
export const INPUT_PATTERNS = {
  DIGIT: /^\d$/,
  LETTER_SPACE_DOT: /^[a-zA-Z\s.]$/,
  LETTER_SYMBOLS: /^[a-zA-Z\s/&.-]$/,
  ALPHANUMERIC_SYMBOLS: /^[a-zA-Z0-9\s/&.-]$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]$/,
  NON_DIGITS: /\D/g,
  NON_LETTERS_SPACES_DOTS: /[^a-zA-Z\s.]/g,
  NON_ALPHANUMERIC: /[^A-Z0-9]/g,
  NON_ALPHANUMERIC_SYMBOLS: /[^a-zA-Z0-9\s/&.-]/g,
  NON_ALPHANUMERIC_SYMBOLS_UPPER: /[^A-Z0-9\s/&.-]/g,
  NON_LETTERS_SYMBOLS_UPPER: /[^A-Z\s/&.-]/g,
  NON_DECIMALS: /[^0-9.]/g,
} as const;

/** Allows only numeric keys 0-9 */
export function onlyNumbers(event: KeyboardEvent): boolean {
  if (event.key.length > 1) return true; // allow Backspace, Tab, Arrows, Enter, Delete
  if (!INPUT_PATTERNS.DIGIT.test(event.key)) {
    event.preventDefault();
    return false;
  }
  return true;
}

/** Allows only alphabetic letters, spaces and dots */
export function onlyLetters(event: KeyboardEvent): boolean {
  if (event.key.length > 1) return true;
  if (!INPUT_PATTERNS.LETTER_SPACE_DOT.test(event.key)) {
    event.preventDefault();
    return false;
  }
  return true;
}

/** Allows letters, spaces, and standard name symbols: & / - . (No numbers) */
export function onlyLettersSymbols(event: KeyboardEvent): boolean {
  if (event.key.length > 1) return true;
  if (!INPUT_PATTERNS.LETTER_SYMBOLS.test(event.key)) {
    event.preventDefault();
    return false;
  }
  return true;
}

/** Allows letters, numbers, spaces, and common symbols: & / - . */
export function onlyAlphanumericSymbols(event: KeyboardEvent): boolean {
  if (event.key.length > 1) return true;
  if (!INPUT_PATTERNS.ALPHANUMERIC_SYMBOLS.test(event.key)) {
    event.preventDefault();
    return false;
  }
  return true;
}

/** Allows only strict alphanumeric (letters & numbers) */
export function onlyAlphanumeric(event: KeyboardEvent): boolean {
  if (event.key.length > 1) return true;
  if (!INPUT_PATTERNS.ALPHANUMERIC.test(event.key)) {
    event.preventDefault();
    return false;
  }
  return true;
}

/** Allows only numbers and at most 1 decimal point for currency/turnover */
export function onlyDecimals(event: KeyboardEvent, currentVal?: any): boolean {
  if (event.key.length > 1) return true;
  if (event.key === '.') {
    if (String(currentVal || '').includes('.')) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  if (!INPUT_PATTERNS.DIGIT.test(event.key)) {
    event.preventDefault();
    return false;
  }
  return true;
}

/** Sanitizes input to digits only */
export function sanitizeNumbers(val: any, maxLen?: number): string {
  const digits = String(val ?? '').replace(INPUT_PATTERNS.NON_DIGITS, '');
  return maxLen ? digits.slice(0, maxLen) : digits;
}

/** Sanitizes input to letters, spaces and dots only */
export function sanitizeLetters(val?: string | null, maxLen?: number): string {
  const letters = String(val ?? '').replace(INPUT_PATTERNS.NON_LETTERS_SPACES_DOTS, '');
  return maxLen ? letters.slice(0, maxLen) : letters;
}

/** Sanitizes input to uppercase alphanumeric */
export function sanitizeAlphanumericUpper(val?: string | null, maxLen?: number): string {
  const clean = String(val ?? '').toUpperCase().replace(INPUT_PATTERNS.NON_ALPHANUMERIC, '');
  return maxLen ? clean.slice(0, maxLen) : clean;
}

/** Sanitizes input to alphanumeric with common symbols: & / - . */
export function sanitizeAlphanumericSymbols(val?: string | null, maxLen?: number): string {
  const clean = String(val ?? '').replace(INPUT_PATTERNS.NON_ALPHANUMERIC_SYMBOLS, '');
  return maxLen ? clean.slice(0, maxLen) : clean;
}

/** Sanitizes input to uppercase alphanumeric with common symbols: & / - . */
export function sanitizeAlphanumericSymbolsUpper(val?: string | null, maxLen?: number): string {
  const clean = String(val ?? '').toUpperCase().replace(INPUT_PATTERNS.NON_ALPHANUMERIC_SYMBOLS_UPPER, '');
  return maxLen ? clean.slice(0, maxLen) : clean;
}

/** Sanitizes input to uppercase letters, spaces, and symbols: & / - . (No numbers) */
export function sanitizeLettersSymbolsUpper(val?: string | null, maxLen?: number): string {
  const clean = String(val ?? '').toUpperCase().replace(INPUT_PATTERNS.NON_LETTERS_SYMBOLS_UPPER, '');
  return maxLen ? clean.slice(0, maxLen) : clean;
}

/** Sanitizes decimal numbers (e.g. 150.00) */
export function sanitizeDecimals(val: any, maxLen?: number): string {
  let str = String(val ?? '').replace(INPUT_PATTERNS.NON_DECIMALS, '');
  const firstDot = str.indexOf('.');
  if (firstDot !== -1) {
    str = str.slice(0, firstDot + 1) + str.slice(firstDot + 1).replace(/\./g, '');
  }
  return maxLen ? str.slice(0, maxLen) : str;
}

/** Formats ISO YYYY-MM-DD or raw date string to DD/MM/YYYY */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
  }
  return trimmed;
}

/** Converts DD/MM/YYYY date string to ISO YYYY-MM-DD for native date picker */
export function getIsoDate(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return trimmed;
    }
  }
  return '';
}

/** Computes stable date bounds once to avoid repeatedly instantiating new Date() in getters */
export function getDateBounds() {
  const today = new Date();
  const formatIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayIso = formatIso(today);
  const maxDobIso = formatIso(new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()));
  const minDobIso = formatIso(new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()));

  return { todayIso, maxDobIso, minDobIso };
}
