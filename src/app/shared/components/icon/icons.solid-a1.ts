import type { SolidIconDef } from './icons.solid';

/** Solid icons added while moving form/dropdown screens onto <app-icon solid>. */
export const SOLID_ICONS_A1 = {
  /** Filled check mark on a 20x20 view box. */
  'check-filled': {
    viewBox: '0 0 20 20',
    d: ['M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'],
    evenOdd: true
  }
} as const satisfies Record<string, SolidIconDef>;
