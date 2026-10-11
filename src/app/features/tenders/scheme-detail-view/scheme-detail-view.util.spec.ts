import { describe, it, expect } from 'vitest';
import { formatFeeDisplay, isSubmissionClosed, splitInHalf } from './scheme-detail-view.util';
import { SchemeTender } from '../tenders.models';

const scheme = (over: Partial<SchemeTender> = {}): SchemeTender => ({
  sNo: 1,
  refNo: 'RSLDC/EOI/001',
  schemeName: 'MMKVY',
  schemeCategory: 'ALL',
  datePublished: '01/01/2026',
  closingDate: '31/12/2999',
  eoiCategory: 'General',
  eoiDescription: 'Skill training scheme',
  ...over
});

describe('scheme-detail-view.util', () => {
  // Local-time constructor so the tests do not depend on the machine's time zone.
  const now = new Date(2026, 0, 10, 12, 0).getTime(); // 10 Jan 2026, 12:00
  const rupee = '\u20B9';

  describe('isSubmissionClosed', () => {
    it('returns false for null / undefined', () => {
      expect(isSubmissionClosed(null)).toBe(false);
      expect(isSubmissionClosed(undefined)).toBe(false);
    });

    it('treats status Closed as closed', () => {
      expect(isSubmissionClosed(scheme({ status: 'Closed' }), now)).toBe(true);
    });

    it('compares dd/mm/yyyy closing dates with the current time', () => {
      expect(isSubmissionClosed(scheme({ closingDate: '09/01/2026' }), now)).toBe(true);
      expect(isSubmissionClosed(scheme({ closingDate: '10/01/2026' }), now)).toBe(false);
      expect(isSubmissionClosed(scheme({ closingDate: '11/01/2026' }), now)).toBe(false);
    });

    it('accepts dd-mm-yyyy closing dates', () => {
      expect(isSubmissionClosed(scheme({ closingDate: '09-01-2026' }), now)).toBe(true);
    });

    it('returns false for empty or malformed dates', () => {
      expect(isSubmissionClosed(scheme({ closingDate: '' }), now)).toBe(false);
      expect(isSubmissionClosed(scheme({ closingDate: 'soon' }), now)).toBe(false);
    });
  });

  describe('formatFeeDisplay', () => {
    it('inserts a space after a leading rupee sign', () => {
      expect(formatFeeDisplay(`${rupee}50,000`, `${rupee} 1`)).toBe(`${rupee} 50,000`);
    });

    it('leaves an already spaced value untouched', () => {
      expect(formatFeeDisplay(`${rupee} 2,000`, `${rupee} 1`)).toBe(`${rupee} 2,000`);
    });

    it('leaves values without a rupee sign untouched', () => {
      expect(formatFeeDisplay('Rs. 500', `${rupee} 1`)).toBe('Rs. 500');
    });

    it('falls back to the default when the fee is missing', () => {
      expect(formatFeeDisplay(undefined, `${rupee} 50,000`)).toBe(`${rupee} 50,000`);
      expect(formatFeeDisplay('', `${rupee}2,000`)).toBe(`${rupee} 2,000`);
    });
  });

  describe('splitInHalf', () => {
    it('puts the extra item of an odd list in the left half', () => {
      expect(splitInHalf([1, 2, 3, 4, 5])).toEqual({ left: [1, 2, 3], right: [4, 5] });
    });

    it('splits an even list evenly', () => {
      expect(splitInHalf([1, 2, 3, 4])).toEqual({ left: [1, 2], right: [3, 4] });
    });

    it('handles empty and single-item lists', () => {
      expect(splitInHalf([])).toEqual({ left: [], right: [] });
      expect(splitInHalf(['a'])).toEqual({ left: ['a'], right: [] });
    });
  });
});
