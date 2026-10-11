import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { createPersistedStore, PersistedStore } from './persisted-store';

interface Row {
  id: string;
  label: string;
}

const KEY = 'test_rows';
const seed: Row[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' }
];

function make(options: Partial<{ reconcile: (s: Row[], seed: readonly Row[]) => Row[] }> = {}): PersistedStore<Row> {
  return TestBed.runInInjectionContext(() => createPersistedStore<Row>({ key: KEY, seed, ...options }));
}

describe('PersistedStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts from the seed and saves it when nothing is stored', () => {
    const store = make();
    expect(store.items()).toEqual(seed);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(seed);
  });

  it('never mutates the seed array it was given', () => {
    const store = make();
    store.items.update(list => [{ id: 'c', label: 'Gamma' }, ...list]);
    expect(seed.length).toBe(2);
  });

  it('restores previously stored records instead of the seed', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 'z', label: 'Saved' }]));
    const store = make();
    expect(store.items()).toEqual([{ id: 'z', label: 'Saved' }]);
  });

  it('treats an empty stored list as missing and falls back to the seed', () => {
    localStorage.setItem(KEY, '[]');
    expect(make().items()).toEqual(seed);
  });

  it('runs reconcile on restored records and saves the result', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 'a', label: 'Stale' }]));
    const store = make({
      reconcile: (stored, s) => {
        const have = new Set(stored.map(r => r.id));
        const fixed = stored.map(r => ({ ...r, label: s.find(x => x.id === r.id)?.label ?? r.label }));
        return [...fixed, ...s.filter(r => !have.has(r.id))];
      }
    });
    expect(store.items()).toEqual(seed);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(seed);
  });

  it('falls back to the seed when reconcile throws', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 'x', label: 'X' }]));
    const store = make({ reconcile: () => { throw new Error('boom'); } });
    expect(store.items()).toEqual(seed);
  });

  it('ignores corrupt stored JSON', () => {
    localStorage.setItem(KEY, '{not json');
    expect(make().items()).toEqual(seed);
  });

  it('persist() writes the current list, or an explicit one', () => {
    const store = make();
    store.items.set([{ id: 'n', label: 'New' }]);
    store.persist();
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([{ id: 'n', label: 'New' }]);

    store.persist([{ id: 'o', label: 'Other' }]);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([{ id: 'o', label: 'Other' }]);
  });

  it('picks up changes made in another tab via the storage event', () => {
    const store = make();
    const next: Row[] = [{ id: 'remote', label: 'From another tab' }];
    window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: JSON.stringify(next) }));
    expect(store.items()).toEqual(next);
  });

  it('ignores storage events for other keys and malformed payloads', () => {
    const store = make();
    window.dispatchEvent(new StorageEvent('storage', { key: 'something_else', newValue: JSON.stringify([{ id: 'q', label: 'Q' }]) }));
    window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: '{oops' }));
    expect(store.items()).toEqual(seed);
  });
});
