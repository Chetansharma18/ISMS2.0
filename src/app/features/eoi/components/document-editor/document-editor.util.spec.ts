import { describe, it, expect } from 'vitest';
import { DEFAULT_EMBLEM_SVG, DEFAULT_LEFT_LOGO_URL, clauseLabel } from './document-editor.util';

describe('document-editor.util', () => {
  it('clauseLabel returns alphabetic labels', () => {
    expect(clauseLabel(0, 'alpha')).toBe('a)');
    expect(clauseLabel(1, 'alpha')).toBe('b)');
    expect(clauseLabel(7, 'alpha')).toBe('h)');
  });

  it('clauseLabel returns one-based decimal labels', () => {
    expect(clauseLabel(0, 'decimal')).toBe('1.');
    expect(clauseLabel(9, 'decimal')).toBe('10.');
  });

  it('exposes the default letterhead logo constants', () => {
    expect(DEFAULT_LEFT_LOGO_URL.startsWith('https://')).toBe(true);
    expect(DEFAULT_EMBLEM_SVG.startsWith('data:image/svg+xml')).toBe(true);
  });
});
