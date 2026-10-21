import type { SolidIconDef } from './icons.solid';

/** "PDF" lettering of the red file-type badge, copied from the original artwork. Cut out of the badge (even-odd). */
const PDF_LETTERS =
  'M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z';

/** Solid icons added while moving feature screens onto <app-icon solid>. */
export const SOLID_ICONS_FEATURES = {
  /** Map pin (location marker). */
  'map-pin': {
    viewBox: '0 0 24 24',
    d: [
      'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
    ]
  },
  /** Video camera. */
  'video-camera': {
    viewBox: '0 0 24 24',
    d: ['M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4zM5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z']
  },
  /** Circle with an exclamation mark (form error). */
  'error-circle': {
    viewBox: '0 0 20 20',
    d: ['M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'],
    evenOdd: true
  },
  /** Red "PDF" file badge with 3.5 corner radius. Colour it with a text-* class (brand red is #E5252A). */
  'pdf-badge': {
    viewBox: '0 0 24 24',
    d: [`M3.5 0h17A3.5 3.5 0 0124 3.5v17a3.5 3.5 0 01-3.5 3.5h-17A3.5 3.5 0 010 20.5v-17A3.5 3.5 0 013.5 0z${PDF_LETTERS}`],
    evenOdd: true
  },
  /** Same "PDF" file badge with 3 corner radius. */
  'pdf-badge-r3': {
    viewBox: '0 0 24 24',
    d: [`M3 0h18a3 3 0 013 3v18a3 3 0 01-3 3H3a3 3 0 01-3-3V3a3 3 0 013-3z${PDF_LETTERS}`],
    evenOdd: true
  },
  /** Five-point star (Ashok emblem placeholder). */
  'emblem-star': {
    viewBox: '0 0 24 24',
    d: ['M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z']
  },
  /** Drag grip: six dots (circles r=1.5 at x 8.5/15.5, y 6/12/18, written as arcs). */
  'grip-dots': {
    viewBox: '0 0 24 24',
    d: [
      'M7 6a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM14 6a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM7 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM14 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM7 18a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM14 18a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0z'
    ]
  }
} as const satisfies Record<string, SolidIconDef>;
