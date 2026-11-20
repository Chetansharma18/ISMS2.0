import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { buildApiUrl } from '../config/api.config';
import { provideApiHttp } from '../http/http.providers';
import { setResourceMock } from '../mock/mock.config';
import { createPersistedStore, PersistedStore } from './persisted-store';

interface Mark {
  id: string;
  label: string;
}

const DATA_KEY = 'ATTENDANCE_MARKS';
const URL = buildApiUrl('/attendance/marks');

describe('PersistedStore (API mode)', () => {
  let backend: HttpTestingController;
  let store: PersistedStore<Mark>;

  beforeEach(() => {
    localStorage.clear();
    setResourceMock(DATA_KEY, false);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideApiHttp(), provideHttpClientTesting()]
    });
    backend = TestBed.inject(HttpTestingController);
    store = TestBed.runInInjectionContext(() =>
      createPersistedStore<Mark>({ key: 'test_marks', dataKey: DATA_KEY, seed: [{ id: 'seed', label: 'Seed' }] })
    );
  });

  afterEach(() => {
    backend.verify();
    setResourceMock(DATA_KEY, true);
  });

  function loadWith(list: Mark[]): void {
    backend.expectOne(r => r.method === 'GET' && r.url === URL).flush(list);
  }

  it('loads from the API instead of the seed and never touches storage', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(true);
    loadWith([{ id: 'a', label: 'A' }]);
    expect(store.items()).toEqual([{ id: 'a', label: 'A' }]);
    expect(store.loading()).toBe(false);
    expect(localStorage.getItem('test_marks')).toBeNull();
  });

  it('sends only the records that were added, changed or removed', () => {
    loadWith([
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' }
    ]);

    store.items.set([
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B changed' },
      { id: 'd', label: 'D' }
    ]);
    store.persist();

    const create = backend.expectOne(r => r.method === 'POST' && r.url === URL);
    expect(create.request.body).toEqual({ id: 'd', label: 'D' });
    const update = backend.expectOne(r => r.method === 'PUT' && r.url === `${URL}/b`);
    expect(update.request.body).toEqual({ id: 'b', label: 'B changed' });
    backend.expectOne(r => r.method === 'DELETE' && r.url === `${URL}/c`).flush({});
    update.flush({ id: 'b', label: 'B changed' });

    // The server gives the new record its own id; later updates must use it.
    create.flush({ id: 'srv-1', label: 'D' });
    expect(store.items().map(m => m.id)).toEqual(['a', 'b', 'srv-1']);

    store.persist();
    backend.expectNone(URL);
  });

  it('reloads from the server when a write fails', () => {
    loadWith([{ id: 'a', label: 'A' }]);
    store.items.set([{ id: 'a', label: 'Rejected' }]);
    store.persist();
    backend.expectOne(r => r.method === 'PUT').flush({ message: 'No' }, { status: 400, statusText: 'Bad Request' });

    loadWith([{ id: 'a', label: 'A' }]);
    expect(store.items()).toEqual([{ id: 'a', label: 'A' }]);
  });

  it('marks a failed load', () => {
    backend.expectOne(URL).flush(null, { status: 500, statusText: 'Error' });
    expect(store.loadFailed()).toBe(true);
    expect(store.items()).toEqual([]);
  });

  it('never writes a read-only store', () => {
    const readOnly = TestBed.runInInjectionContext(() =>
      createPersistedStore<Mark>({ dataKey: DATA_KEY, seed: [], writable: false })
    );
    backend.match(URL).forEach(r => r.flush([{ id: 'a', label: 'A' }]));
    readOnly.items.set([]);
    readOnly.persist();
    backend.expectNone(URL);
  });
});
