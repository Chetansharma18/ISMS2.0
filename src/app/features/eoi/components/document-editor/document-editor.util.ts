/** Default Government of Rajasthan emblem shown in the letterhead of the official letters. */
export const DEFAULT_LEFT_LOGO_URL =
  'https://upload.wikimedia.org/wikipedia/commons/8/84/Government_of_Rajasthan_Logo.svg';

/** Inline SVG emblem used when the left logo image fails to load. */
export const DEFAULT_EMBLEM_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 16 L54 28 L67 28 L56 36 L60 48 L50 40 L40 48 L44 36 L33 28 L46 28 Z" fill="%230b3558"/><path d="M25 65 Q50 55 75 65 Q50 72 25 65 Z" fill="%23b91c1c"/><text x="50" y="83" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="%230b3558">GOVT OF RAJASTHAN</text></svg>`;

export type ClauseLabelFormat = 'alpha' | 'decimal';

/**
 * Label shown before a numbered clause.
 * - alpha:   a), b), c) ...
 * - decimal: 1., 2., 3. ...
 */
export function clauseLabel(index: number, format: ClauseLabelFormat): string {
  return format === 'alpha' ? `${String.fromCharCode(97 + index)})` : `${index + 1}.`;
}
