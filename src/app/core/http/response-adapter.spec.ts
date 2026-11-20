import { describe, it, expect } from 'vitest';
import { toItems, toPaginated, unwrapData } from './response-adapter';

describe('response adapter', () => {
  it('reads items from every supported list envelope', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    expect(toItems(rows)).toEqual(rows);
    expect(toItems({ items: rows })).toEqual(rows);
    expect(toItems({ data: rows })).toEqual(rows);
    expect(toItems({ data: { items: rows } })).toEqual(rows);
    expect(toItems({ message: 'not a list' })).toEqual([]);
    expect(toItems(null)).toEqual([]);
  });

  it('takes totals from total, totalCount or pagination', () => {
    expect(toPaginated({ items: [{}], totalCount: 41, page: 3, pageSize: 20 })).toEqual({
      items: [{}],
      total: 41,
      page: 3,
      pageSize: 20,
      totalPages: 3
    });
    expect(toPaginated({ data: [{}, {}], pagination: { total: 5, page: 1, pageSize: 2 } }).totalPages).toBe(3);
    expect(toPaginated({ data: { items: [{}], total: 9, pageSize: 3 } }).total).toBe(9);
  });

  it('applies the normalizer and falls back to the item count', () => {
    const page = toPaginated([{ n: 1 }, { n: 2 }], item => (item as { n: number }).n * 10);
    expect(page.items).toEqual([10, 20]);
    expect(page.total).toBe(2);
    expect(page.totalPages).toBe(1);
  });

  it('unwraps a { data } envelope only when there is one', () => {
    expect(unwrapData({ data: { id: 1 } })).toEqual({ id: 1 });
    expect(unwrapData({ id: 1 })).toEqual({ id: 1 });
    expect(unwrapData([1])).toEqual([1]);
  });
});
