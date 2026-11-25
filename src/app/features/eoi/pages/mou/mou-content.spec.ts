import { describe, expect, it } from 'vitest';
import { MOU_ARTICLES, MOU_RECITALS, splitMouText } from './mou-content';

describe('splitMouText', () => {
  it('fills known placeholders with their values', () => {
    const parts = splitMouText('Order {sanctionRef} dated {sanctionDate}.', {
      sanctionRef: 'REF-1',
      sanctionDate: '30/07/2026'
    });
    expect(parts).toEqual([
      { type: 'text', value: 'Order ' },
      { type: 'value', value: 'REF-1' },
      { type: 'text', value: ' dated ' },
      { type: 'value', value: '30/07/2026' },
      { type: 'text', value: '.' }
    ]);
  });

  it('turns an empty value into a blank', () => {
    expect(splitMouText('{eoiRef}', { eoiRef: '' })).toEqual([{ type: 'blank', size: 'normal' }]);
    expect(splitMouText('{scheme}', {})).toEqual([{ type: 'blank', size: 'normal' }]);
  });

  it('gives each blank its size', () => {
    expect(splitMouText('{blankShort}{blank}{blankLong}', {})).toEqual([
      { type: 'blank', size: 'short' },
      { type: 'blank', size: 'normal' },
      { type: 'blank', size: 'long' }
    ]);
  });
});

describe('MoU content', () => {
  it('has the five recitals and fifteen articles of the sample', () => {
    expect(MOU_RECITALS.map(r => r.letter)).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(MOU_ARTICLES).toHaveLength(15);
  });

  it('uses only placeholders that are known', () => {
    const known = new Set(['scheme', 'eoiRef', 'eoiDate', 'sanctionRef', 'sanctionDate', 'blank', 'blankShort', 'blankLong']);
    const texts = [...MOU_RECITALS.map(r => r.text), ...MOU_ARTICLES.flatMap(a => a.items.map(i => i.text))];
    const keys = texts.flatMap(t => Array.from(t.matchAll(/\{(\w+)\}/g), m => m[1]));
    expect(keys.filter(k => !known.has(k))).toEqual([]);
  });
});
