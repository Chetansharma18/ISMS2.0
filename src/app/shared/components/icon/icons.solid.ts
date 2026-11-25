import { SOLID_ICONS_A1 } from './icons.solid-a1';
import { SOLID_ICONS_CORE } from './icons.solid-core';
import { SOLID_ICONS_FEATURES } from './icons.solid-features';

/** A filled (solid) icon: its own view box and one or more filled paths. */
export interface SolidIconDef {
  viewBox: string;
  /** Path data, copied from the original artwork. */
  d: readonly string[];
  /** Fill the path with the even-odd rule (cut-out glyphs such as a circled "i"). */
  evenOdd?: boolean;
}

/**
 * Filled icons and brand marks (play, pause, logos). Draw them with <app-icon name="..." solid />.
 * Outline icons live in icons.ts; this file is only for glyphs that are filled shapes.
 */
const BASE_SOLID = {
  play: { viewBox: '0 0 24 24', d: ['M8 5v14l11-7z'] },
  pause: { viewBox: '0 0 24 24', d: ['M6 4h4v16H6V4zm8 0h4v16h-4V4z'] }
} as const satisfies Record<string, SolidIconDef>;

export const SOLID_ICONS = {
  ...BASE_SOLID,
  ...SOLID_ICONS_A1,
  ...SOLID_ICONS_CORE,
  ...SOLID_ICONS_FEATURES
} as const satisfies Record<string, SolidIconDef>;

export type SolidIconName = keyof typeof SOLID_ICONS;
