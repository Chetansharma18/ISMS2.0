import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DataEngineService } from './data-engine.service';
import { HttpService } from '../http/http.service';

interface Sector {
  id: string;
  sectorName: string;
  sectorCode: string;
  status: string;
}

/**
 * Exercises the mock path of DataEngineService end to end (MockDatabaseService is real).
 * The HTTP layer is stubbed and must never be touched while mock mode is on.
 */
describe('DataEngineService reference data cache', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  it('drops a Sector Master copy cached from an older seed and serves the current official list', async () => {
    // What a browser session holds after running a build that only had 8 sectors.
    sessionStorage.setItem(
      'isms_mock_db_SECTORS',
      JSON.stringify([{ sNo: 1, id: 'sec-1', sectorName: 'Aerospace and Aviation', sectorCode: 'SEC-AERO-01', status: 'Active' }])
    );
    const forbidden = () => { throw new Error('HttpService must not be used in mock mode'); };
    TestBed.configureTestingModule({
      providers: [{ provide: HttpService, useValue: { get: forbidden, post: forbidden, put: forbidden, delete: forbidden } }]
    });

    const sectors = await firstValueFrom(TestBed.inject(DataEngineService).for<Sector>('SECTORS').getAll());
    expect(sectors.length).toBe(35);
    expect(sectors.find(s => s.sectorName === 'Tourism & Hospitality')?.sectorCode).toBe('THC');
  });

  it('keeps a Sector Master edited in this session while the seed is unchanged', async () => {
    const forbidden = () => { throw new Error('HttpService must not be used in mock mode'); };
    TestBed.configureTestingModule({
      providers: [{ provide: HttpService, useValue: { get: forbidden, post: forbidden, put: forbidden, delete: forbidden } }]
    });
    const first = TestBed.inject(DataEngineService);
    await firstValueFrom(first.for<Sector>('SECTORS').create({ sectorName: 'Added Sector', sectorCode: 'ADD', status: 'Active' }));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: HttpService, useValue: { get: forbidden, post: forbidden, put: forbidden, delete: forbidden } }]
    });
    const reloaded = await firstValueFrom(TestBed.inject(DataEngineService).for<Sector>('SECTORS').getAll());
    expect(reloaded.length).toBe(36);
    expect(reloaded.some(s => s.sectorName === 'Added Sector')).toBe(true);
  });
});

describe('DataEngineService (mock mode)', () => {
  let engine: DataEngineService;

  beforeEach(() => {
    sessionStorage.clear();
    const forbidden = () => { throw new Error('HttpService must not be used in mock mode'); };
    TestBed.configureTestingModule({
      providers: [{ provide: HttpService, useValue: { get: forbidden, post: forbidden, put: forbidden, delete: forbidden } }]
    });
    engine = TestBed.inject(DataEngineService);
  });

  it('lists seeded records for a resource', async () => {
    const repo = engine.for<Sector>('SECTORS');
    const all = await firstValueFrom(repo.getAll());
    expect(all.length).toBeGreaterThan(0);
    expect(all[0].sectorName).toBeTruthy();
  });

  it('creates, updates and deletes a record', async () => {
    const repo = engine.for<Sector>('SECTORS');
    const before = (await firstValueFrom(repo.getAll())).length;

    const created = await firstValueFrom(repo.create({ sectorName: 'Test Sector', sectorCode: 'TST', status: 'Active' }));
    expect(created.id).toBeTruthy();
    expect((await firstValueFrom(repo.getAll())).length).toBe(before + 1);

    const updated = await firstValueFrom(repo.update(created.id, { status: 'Inactive' }));
    expect(updated.status).toBe('Inactive');
    expect(updated.sectorName).toBe('Test Sector');

    expect(await firstValueFrom(repo.delete(created.id))).toBe(true);
    expect((await firstValueFrom(repo.getAll())).length).toBe(before);
  });

  it('getById returns the record and errors for a missing id', async () => {
    const repo = engine.for<Sector>('SECTORS');
    const [first] = await firstValueFrom(repo.getAll());
    expect((await firstValueFrom(repo.getById(first.id))).id).toBe(first.id);
    await expect(firstValueFrom(repo.getById('does-not-exist'))).rejects.toThrow();
  });

  it('list supports search and pagination metadata', async () => {
    const repo = engine.for<Sector>('SECTORS');
    const page = await firstValueFrom(repo.list({ page: 1, pageSize: 2 }));
    expect(page.items.length).toBeLessThanOrEqual(2);
    expect(page.total).toBeGreaterThanOrEqual(page.items.length);
    expect(page.totalPages).toBeGreaterThanOrEqual(1);

    const searched = await firstValueFrom(repo.list({ search: 'agri', searchFields: ['sectorName'] }));
    expect(searched.items.every(i => i.sectorName.toLowerCase().includes('agri'))).toBe(true);
  });

  it('delete reports false when nothing matched', async () => {
    const repo = engine.for<Sector>('SECTORS');
    expect(await firstValueFrom(repo.delete('missing'))).toBe(false);
  });
});
