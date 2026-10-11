import { describe, it, expect } from 'vitest';
import {
  DEFAULT_AADHAAR_CARD_DATA_URL,
  DEFAULT_CANDIDATE_PHOTO_DATA_URL,
  generateDocumentPreviewSvg
} from './aspirant-document-preview.util';

const PREFIX = 'data:image/svg+xml;charset=UTF-8,';
const decode = (url: string): string => decodeURIComponent(url.slice(PREFIX.length));

describe('aspirant-document-preview.util', () => {
  it('exposes SVG data URLs for the placeholder artwork', () => {
    expect(DEFAULT_AADHAAR_CARD_DATA_URL.startsWith(PREFIX)).toBe(true);
    expect(DEFAULT_CANDIDATE_PHOTO_DATA_URL.startsWith(PREFIX)).toBe(true);
    expect(decode(DEFAULT_AADHAAR_CARD_DATA_URL)).toContain('Government of India');
    expect(decode(DEFAULT_CANDIDATE_PHOTO_DATA_URL)).toContain('CANDIDATE PASSPORT PHOTO');
  });

  it('keeps the Devanagari text of the Aadhaar placeholder intact', () => {
    expect(decode(DEFAULT_AADHAAR_CARD_DATA_URL)).toContain('भारत सरकार');
  });

  it('embeds the title (upper-cased), subtitle and candidate details', () => {
    const svg = decode(generateDocumentPreviewSvg('Caste Certificate', 'Issued by SDM', 'Asha Verma', '123456789012'));
    expect(svg).toContain('CASTE CERTIFICATE');
    expect(svg).toContain('Issued by SDM');
    expect(svg).toContain('Asha Verma');
    expect(svg).toContain('XXXX-XXXX-9012');
  });

  it('falls back to sample candidate details when none are given', () => {
    const svg = decode(generateDocumentPreviewSvg('Income Certificate', '', '', ''));
    expect(svg).toContain('Rahul Sharma');
    expect(svg).toContain('XXXX-XXXX-3012');
  });
});
