import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { HttpService } from '../http/http.service';
import { MockDatabaseService, QueryOptions } from '../mock/mock-database.service';
import { isMockEnabled, MOCK_CONFIG } from '../mock/mock.config';
import {
  getEndpointForDataKey,
  resolveEndpointUrl,
  buildApiUrl
} from '../config/api.config';
import { ApiResponse, PaginatedResponse } from '../models/common.model';

export interface ResourceRepositoryOptions<T> {
  idKey?: string;
  normalizer?: (item: any) => T;
}

export interface ResourceRepository<T> {
  list(options?: QueryOptions): Observable<PaginatedResponse<T>>;
  getAll(filter?: Record<string, any>): Observable<T[]>;
  getById(id: string | number): Observable<T>;
  create(payload: Partial<T>): Observable<T>;
  update(id: string | number, patch: Partial<T>): Observable<T>;
  delete(id: string | number): Observable<boolean>;
}

/**
 * Universal Data Engine Service (Inspired by GeoTree Admin Architecture)
 * 
 * Provides an identical, unified CRUD interface for every resource in the application.
 * - When in Mock mode: reads and mutates data via the Centralized MockDatabaseService.
 * - When real API URLs are plugged in: transparently switches to HttpService calls 
 *   resolved from API_ENDPOINTS without changing any component logic!
 */
@Injectable({
  providedIn: 'root'
})
export class DataEngineService {
  private http = inject(HttpService);
  private mockDb = inject(MockDatabaseService);

  /**
   * Creates a dedicated repository instance for any domain dataKey.
   * Example: const schemeRepo = this.dataEngine.for<SchemeTender>('SCHEMES', { idKey: 'refNo' });
   */
  for<T = any>(dataKey: string, options: ResourceRepositoryOptions<T> = {}): ResourceRepository<T> {
    const idKey = options.idKey || 'id';
    const normalizer = options.normalizer || ((item: any) => item as T);

    return {
      list: (queryOpts?: QueryOptions) => this.list<T>(dataKey, queryOpts, { idKey, normalizer }),
      getAll: (filter?: Record<string, any>) => this.getAll<T>(dataKey, filter, { idKey, normalizer }),
      getById: (id: string | number) => this.getById<T>(dataKey, id, { idKey, normalizer }),
      create: (payload: Partial<T>) => this.create<T>(dataKey, payload, { idKey, normalizer }),
      update: (id: string | number, patch: Partial<T>) => this.update<T>(dataKey, id, patch, { idKey, normalizer }),
      delete: (id: string | number) => this.delete(dataKey, id, { idKey })
    };
  }

  // =========================================================================
  // CORE ENGINE OPERATIONS
  // =========================================================================

  /**
   * LIST / QUERY: Returns paginated response with search, filter, and sorting
   */
  list<T = any>(
    dataKey: string,
    queryOpts: QueryOptions = {},
    options: ResourceRepositoryOptions<T> = {}
  ): Observable<PaginatedResponse<T>> {
    const normalizer = options.normalizer || ((item: any) => item as T);

    // Path A: Centralized Mock
    if (isMockEnabled(dataKey)) {
      const mockResult = this.mockDb.query<T>(dataKey, queryOpts);
      const paginated: PaginatedResponse<T> = {
        items: mockResult.items.map(normalizer),
        total: mockResult.total,
        page: mockResult.page,
        pageSize: mockResult.pageSize,
        totalPages: mockResult.totalPages
      };

      return of(paginated).pipe(
        delay(MOCK_CONFIG.simulatedDelayMs)
      );
    }

    // Path B: Real Backend API
    const endpoint = getEndpointForDataKey(dataKey, 'LIST');
    if (!endpoint) {
      return throwError(() => new Error(`No LIST endpoint configured for resource: ${dataKey}`));
    }

    const fullUrl = buildApiUrl(resolveEndpointUrl(endpoint.url));
    const isPost = endpoint.method === 'POST';

    const req$ = isPost
      ? this.http.post<any>(fullUrl, queryOpts)
      : this.http.get<any>(fullUrl, { params: queryOpts as any });

    return req$.pipe(
      map(res => this.extractPaginatedResponse<T>(res, normalizer)),
      catchError(err => {
        console.warn(`[DataEngine] Backend API unavailable for ${dataKey} (${fullUrl}):`, err?.message || err);
        return of({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
      })
    );
  }

  /**
   * GET ALL: Returns all items for a resource
   */
  getAll<T = any>(
    dataKey: string,
    filter?: Record<string, any>,
    options: ResourceRepositoryOptions<T> = {}
  ): Observable<T[]> {
    const normalizer = options.normalizer || ((item: any) => item as T);

    if (isMockEnabled(dataKey)) {
      let raw = this.mockDb.getAll<T>(dataKey);
      if (filter && Object.keys(filter).length > 0) {
        raw = raw.filter(item => {
          return Object.entries(filter).every(([k, v]) => (item as any)[k] === v);
        });
      }
      return of(raw.map(normalizer)).pipe(
        delay(MOCK_CONFIG.simulatedDelayMs)
      );
    }

    const endpoint = getEndpointForDataKey(dataKey, 'LIST');
    if (!endpoint) {
      return of([]);
    }

    const fullUrl = buildApiUrl(resolveEndpointUrl(endpoint.url));
    return this.http.get<any>(fullUrl, { params: filter as any }).pipe(
      map(res => {
        const items = Array.isArray(res) ? res : res?.data?.items || res?.data || [];
        return items.map(normalizer);
      }),
      catchError(err => {
        console.warn(`[DataEngine] Backend API unavailable for ${dataKey} (${fullUrl}):`, err?.message || err);
        return of([]);
      })
    );
  }

  /**
   * GET BY ID: Returns single item
   */
  getById<T = any>(
    dataKey: string,
    id: string | number,
    options: ResourceRepositoryOptions<T> = {}
  ): Observable<T> {
    const idKey = options.idKey || 'id';
    const normalizer = options.normalizer || ((item: any) => item as T);

    if (isMockEnabled(dataKey)) {
      const item = this.mockDb.getById<T>(dataKey, id, idKey);
      if (!item) {
        return throwError(() => new Error(`Item ${id} not found in ${dataKey}`));
      }
      return of(normalizer(item)).pipe(
        delay(MOCK_CONFIG.simulatedDelayMs)
      );
    }

    const endpoint = getEndpointForDataKey(dataKey, 'GET', id);
    if (!endpoint) {
      return throwError(() => new Error(`No GET endpoint configured for resource: ${dataKey}`));
    }

    const fullUrl = buildApiUrl(resolveEndpointUrl(endpoint.url, id));
    return this.http.get<any>(fullUrl).pipe(
      map(res => {
        const item = res?.data !== undefined ? res.data : res;
        return normalizer(item);
      })
    );
  }

  /**
   * CREATE: Adds a new record
   */
  create<T = any>(
    dataKey: string,
    payload: Partial<T>,
    options: ResourceRepositoryOptions<T> = {}
  ): Observable<T> {
    const idKey = options.idKey || 'id';
    const normalizer = options.normalizer || ((item: any) => item as T);

    if (isMockEnabled(dataKey)) {
      const created = this.mockDb.create<T>(dataKey, payload, idKey);
      return of(normalizer(created)).pipe(
        delay(MOCK_CONFIG.simulatedDelayMs)
      );
    }

    const endpoint = getEndpointForDataKey(dataKey, 'ADD');
    if (!endpoint) {
      return throwError(() => new Error(`No ADD endpoint configured for resource: ${dataKey}`));
    }

    const fullUrl = buildApiUrl(resolveEndpointUrl(endpoint.url));
    return this.http.post<any>(fullUrl, payload).pipe(
      map(res => {
        const item = res?.data !== undefined ? res.data : res;
        return normalizer(item);
      })
    );
  }

  /**
   * UPDATE: Updates existing record
   */
  update<T = any>(
    dataKey: string,
    id: string | number,
    patch: Partial<T>,
    options: ResourceRepositoryOptions<T> = {}
  ): Observable<T> {
    const idKey = options.idKey || 'id';
    const normalizer = options.normalizer || ((item: any) => item as T);

    if (isMockEnabled(dataKey)) {
      const updated = this.mockDb.update<T>(dataKey, id, patch, idKey);
      return of(normalizer(updated)).pipe(
        delay(MOCK_CONFIG.simulatedDelayMs)
      );
    }

    const endpoint = getEndpointForDataKey(dataKey, 'UPDATE', id);
    if (!endpoint) {
      return throwError(() => new Error(`No UPDATE endpoint configured for resource: ${dataKey}`));
    }

    const fullUrl = buildApiUrl(resolveEndpointUrl(endpoint.url, id));
    return this.http.put<any>(fullUrl, patch).pipe(
      map(res => {
        const item = res?.data !== undefined ? res.data : res;
        return normalizer(item);
      })
    );
  }

  /**
   * DELETE: Removes record
   */
  delete(
    dataKey: string,
    id: string | number,
    options: { idKey?: string } = {}
  ): Observable<boolean> {
    const idKey = options.idKey || 'id';

    if (isMockEnabled(dataKey)) {
      const success = this.mockDb.delete(dataKey, id, idKey);
      return of(success).pipe(
        delay(MOCK_CONFIG.simulatedDelayMs)
      );
    }

    const endpoint = getEndpointForDataKey(dataKey, 'DELETE', id);
    if (!endpoint) {
      return throwError(() => new Error(`No DELETE endpoint configured for resource: ${dataKey}`));
    }

    const fullUrl = buildApiUrl(resolveEndpointUrl(endpoint.url, id));
    return this.http.delete<any>(fullUrl).pipe(
      map(res => res?.success ?? true)
    );
  }

  // --- Normalization & Response Adapter ---

  private extractPaginatedResponse<T>(
    res: any,
    normalizer: (item: any) => T
  ): PaginatedResponse<T> {
    if (!res) {
      return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    }

    let itemsRaw: any[] = [];
    let total = 0;
    let page = 1;
    let pageSize = 10;

    // Defense-in-depth extraction matching GeoTree architecture
    if (Array.isArray(res)) {
      itemsRaw = res;
      total = res.length;
    } else if (res.data && Array.isArray(res.data)) {
      itemsRaw = res.data;
      total = res.total ?? res.pagination?.total ?? res.data.length;
      page = res.page ?? res.pagination?.page ?? 1;
      pageSize = res.pageSize ?? res.pagination?.pageSize ?? itemsRaw.length;
    } else if (res.data?.items && Array.isArray(res.data.items)) {
      itemsRaw = res.data.items;
      total = res.data.total ?? res.data.pagination?.total ?? itemsRaw.length;
      page = res.data.page ?? 1;
      pageSize = res.data.pageSize ?? itemsRaw.length;
    } else if (res.items && Array.isArray(res.items)) {
      itemsRaw = res.items;
      total = res.total ?? itemsRaw.length;
      page = res.page ?? 1;
      pageSize = res.pageSize ?? itemsRaw.length;
    }

    const totalPages = Math.ceil(total / (pageSize || 1)) || 1;

    return {
      items: itemsRaw.map(normalizer),
      total,
      page,
      pageSize,
      totalPages
    };
  }
}
