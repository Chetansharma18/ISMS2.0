import { describe, it, expect } from 'vitest';
import { HttpParams } from '@angular/common/http';
import { queryOptionsToParams, toHttpParams } from './query-params';

describe('toHttpParams', () => {
  it('drops empty values and keeps falsy-but-meaningful ones', () => {
    const params = toHttpParams({ a: undefined, b: null, c: '', d: 0, e: false, f: 'x' });
    expect(params.keys().sort()).toEqual(['d', 'e', 'f']);
    expect(params.get('d')).toBe('0');
    expect(params.get('e')).toBe('false');
  });

  it('repeats the key for arrays and serializes dates and objects safely', () => {
    const params = toHttpParams({ id: [1, 2], at: new Date('2026-01-02T03:04:05.000Z'), meta: { a: 1 } });
    expect(params.getAll('id')).toEqual(['1', '2']);
    expect(params.get('at')).toBe('2026-01-02T03:04:05.000Z');
    expect(params.get('meta')).toBe('{"a":1}');
    expect(params.toString()).not.toContain('object');
  });

  it('passes HttpParams through untouched', () => {
    const given = new HttpParams().set('q', '1');
    expect(toHttpParams(given)).toBe(given);
  });
});

describe('queryOptionsToParams', () => {
  it('flattens filter, search fields and sort into plain params', () => {
    expect(
      queryOptionsToParams({
        page: 2,
        pageSize: 20,
        search: '  agri ',
        searchFields: ['name', 'code'],
        filter: { status: 'Active' },
        sort: { key: 'name', direction: 'desc' }
      })
    ).toEqual({
      status: 'Active',
      page: 2,
      pageSize: 20,
      search: 'agri',
      searchFields: 'name,code',
      sortBy: 'name',
      sortDescending: true
    });
  });

  it('produces no params for an empty query', () => {
    expect(toHttpParams(queryOptionsToParams({})).keys()).toEqual([]);
    expect(queryOptionsToParams(undefined)).toEqual({});
  });
});
