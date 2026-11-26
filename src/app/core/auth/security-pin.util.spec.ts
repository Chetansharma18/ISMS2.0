import { describe, it, expect } from 'vitest';
import { isPinNotSetMessage, pinError } from './security-pin.util';

describe('security PIN rules', () => {
  it('accepts a 4 digit PIN typed twice', () => {
    expect(pinError('4812', '4812')).toBeNull();
  });

  it('explains what is wrong', () => {
    expect(pinError('', '')).toBe('Enter a PIN.');
    expect(pinError('48a2', '48a2')).toBe('Use digits only.');
    expect(pinError('481', '481')).toBe('The PIN must be 4 digits.');
    expect(pinError('48120', '48120')).toBe('The PIN must be 4 digits.');
    expect(pinError('1111', '1111')).toBe('Do not use the same digit only.');
    expect(pinError('4812', '4813')).toBe('The two PINs do not match.');
  });

  it('recognises the backend message for an account without a PIN', () => {
    expect(isPinNotSetMessage('Security PIN is not set for this account.')).toBe(true);
    expect(isPinNotSetMessage('Invalid security PIN entered.')).toBe(false);
    expect(isPinNotSetMessage(null)).toBe(false);
  });
});
