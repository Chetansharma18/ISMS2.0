/** Shortest PIN the backend accepts (`two-step/pin/set` rejects anything shorter). */
export const PIN_MIN_LENGTH = 4;
/** Longest PIN the form allows; the backend has no limit, this only keeps it a short numeric code. */
export const PIN_MAX_LENGTH = 8;

/** Why the PIN cannot be saved, or null when it can. */
export function pinError(pin: string, confirm: string): string | null {
  if (!pin) return 'Enter a PIN.';
  if (!/^\d+$/.test(pin)) return 'Use digits only.';
  if (pin.length < PIN_MIN_LENGTH || pin.length > PIN_MAX_LENGTH) {
    return `The PIN must be ${PIN_MIN_LENGTH} to ${PIN_MAX_LENGTH} digits.`;
  }
  if (/^(\d)\1+$/.test(pin)) return 'Do not use the same digit only.';
  if (confirm !== pin) return 'The two PINs do not match.';
  return null;
}

/** True when the backend refused a PIN sign-in because the account has no PIN yet. */
export function isPinNotSetMessage(message: string | null | undefined): boolean {
  return !!message && /pin is not set/i.test(message);
}
