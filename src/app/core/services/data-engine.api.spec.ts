import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { buildApiUrl } from '../config/api.config';
import { provideApiHttp } from '../http/http.providers';
import { isMockEnabled, setResourceMock } from '../mock/mock.config';
import { DataEngineService } from './data-engine.service';

interface Sector {
  id: number | string;
  sectorName: string;
  status?: string;
}

const URL = buildApiUrl('/master/sectors');

describe('DataEngineService (API mode)', () => {
  let backend: HttpTestingController;
  let engine: DataEngineService;
  const wasMock = isMockEnabled('SECTORS');

  beforeEach(() => {
    setResourceMock('SECTORS', false);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideApiHttp(), provideHttpClientTesting()]
    });
    backend = TestBed.inject(HttpTestingController);
    engine = TestBed.inject(DataEngineService);
  });

  afterEach(() => {
    backend.verify();
    setResourceMock('SECTORS', wasMock);
  });

  it('sends list queries as flat params and reads totalCount', async () => {
    const page = firstValueFrom(
      engine.for<Sector>('SECTORS').list({
        page: 2,
        pageSize: 10,
        search: 'agri',
        filter: { isActiveOnly: true },
        sort: { key: 'sectorName', direction: 'asc' }
      })
    );
    const req = backend.expectOne(r => r.url === URL);
    expect(req.request.params.toString()).toBe('isActiveOnly=true&page=2&pageSize=10&search=agri&sortBy=sectorName&sortDescending=false');
    req.flush({ items: [{ id: 1, sectorName: 'Agriculture' }], totalCount: 25, page: 2, pageSize: 10 });

    // The SECTORS adapter turns the backend record into the screen row.
    expect(await page).toEqual({
      items: [{ sNo: 1, id: '1', sectorName: 'Agriculture', sectorCode: '', status: 'Active' }],
      total: 25,
      page: 2,
      pageSize: 10,
      totalPages: 3
    });
  });

  it('surfaces failures instead of returning an empty list', async () => {
    const all = firstValueFrom(engine.for<Sector>('SECTORS').getAll());
    backend.expectOne(URL).flush(null, { status: 403, statusText: 'Forbidden' });
    await expect(all).rejects.toMatchObject({ status: 403 });
  });

  it('runs create, update and delete against the registered endpoints', async () => {
    const repo = engine.for<Sector>('SECTORS');

    const created = firstValueFrom(repo.create({ sectorName: 'New', status: 'Active' } as Partial<Sector>));
    const post = backend.expectOne(r => r.method === 'POST' && r.url === URL);
    // The screen's `status` goes out as the backend's `isActive`.
    expect(post.request.body).toEqual({ sectorName: 'New', isActive: true });
    post.flush({ data: { id: 9, sectorName: 'New', sectorCode: 'NEW', isActive: true } });
    expect(await created).toMatchObject({ id: '9', sectorName: 'New', sectorCode: 'NEW', status: 'Active' });

    const updated = firstValueFrom(repo.update(9, { status: 'Inactive' } as Partial<Sector>));
    const put = backend.expectOne(r => r.method === 'PUT' && r.url === `${URL}/9`);
    expect(put.request.body).toEqual({ isActive: false });
    put.flush({ id: 9, sectorName: 'Renamed', isActive: false });
    expect(await updated).toMatchObject({ sectorName: 'Renamed', status: 'Inactive' });

    const removed = firstValueFrom(repo.delete(9));
    backend.expectOne(r => r.method === 'DELETE' && r.url === `${URL}/9`).flush({ message: 'Sector deleted successfully.' });
    expect(await removed).toBe(true);
  });
});
