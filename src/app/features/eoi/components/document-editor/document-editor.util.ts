/** Default RSLDC logo (left) and Rajasthan Sarkar emblem (right) shown in official letterheads. */
export const DEFAULT_LEFT_LOGO_URL = '/rsldc-logo.png';
export const DEFAULT_RIGHT_LOGO_URL = '/Rajasthan-Sarkar.png';

/** Inline SVG emblem or image fallback when left logo fails to load. */
export const DEFAULT_EMBLEM_SVG = '/rsldc-logo.png';

export type ClauseLabelFormat = 'alpha' | 'decimal';

/**
 * Label shown before a numbered clause.
 * - alpha:   a), b), c) ...
 * - decimal: 1., 2., 3. ...
 */
export function clauseLabel(index: number, format: ClauseLabelFormat): string {
  return format === 'alpha' ? `${String.fromCharCode(97 + index)})` : `${index + 1}.`;
}
