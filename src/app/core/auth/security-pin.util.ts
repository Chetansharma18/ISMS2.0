/** A security PIN is exactly 4 digits, entered in 4 boxes (the backend's minimum is 4). */
export const PIN_LENGTH = 4;
/** Kept for callers that show a range; both are the fixed length. */
export const PIN_MIN_LENGTH = PIN_LENGTH;
export const PIN_MAX_LENGTH = PIN_LENGTH;

/** Why the PIN cannot be saved, or null when it can. */
export function pinError(pin: string, confirm: string): string | null {
  if (!pin) return 'Enter a PIN.';
  if (!/^\d+$/.test(pin)) return 'Use digits only.';
  if (pin.length !== PIN_LENGTH) return `The PIN must be ${PIN_LENGTH} digits.`;
  if (/^(\d)\1+$/.test(pin)) return 'Do not use the same digit only.';
  if (confirm !== pin) return 'The two PINs do not match.';
  return null;
}

/** True when the backend refused a PIN sign-in because the account has no PIN yet. */
export function isPinNotSetMessage(message: string | null | undefined): boolean {
  return !!message && /pin is not set/i.test(message);
}
