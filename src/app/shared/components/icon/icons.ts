import { LUCIDE_ICONS } from './icons.lucide';

/**
 * Every outline icon of the portal, as SVG path data on a 24x24 grid (drawn with a stroke).
 * The data is Lucide (https://lucide.dev), generated into icons.lucide.ts from tools/icons.map.json.
 *
 * To add an icon:  npm run icons:find -- <word>, add  "my-name": "lucide-name"  to tools/icons.map.json,
 * run  npm run icons:build, then use <app-icon name="my-name" />.
 * Never paste <svg> markup or path data into a template.
 * Filled icons and brand marks are a separate set: icons.solid.ts.
 */
export const ICONS = LUCIDE_ICONS;

export type IconName = keyof typeof ICONS;
