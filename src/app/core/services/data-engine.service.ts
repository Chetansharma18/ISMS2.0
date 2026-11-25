import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpService } from '../http/http.service';
import { queryOptionsToParams, QueryParamInput } from '../http/query-params';
import { toItems, toPaginated, unwrapData } from '../http/response-adapter';
import { MockDatabaseService, asRecord } from '../mock/mock-database.service';
import { isMockEnabled, MOCK_CONFIG } from '../mock/mock.config';
import { CrudAction, EndpointDef, getEndpointForDataKey } from '../config/api.config';
import { PaginatedResponse, QueryOptions } from '../models/common.model';
import { MASTER_ADAPTERS } from '../models/master-adapters';

export interface ResourceRepositoryOptions<T> {
  idKey?: string;
  /** Called with each record (and its position in a list). */
  normalizer?: (item: unknown, index?: number) => T;
}

export interface ResourceRepository<T> {
  list(options?: QueryOptions): Observable<PaginatedResponse<T>>;
  getAll(filter?: Record<string, unknown>): Observable<T[]>;
  getById(id: string | number): Observable<T>;
  create(payload: Partial<T>): Observable<T>;
  update(id: string | number, patch: Partial<T>): Observable<T>;
  delete(id: string | number): Observable<boolean>;
}

/**
 * Universal Data Engine Service
 *
 * One CRUD interface for every resource (`dataKey`) of the application:
 * - mock mode (`isMockEnabled(dataKey)`): reads and writes the centralized MockDatabaseService;
 * - API mode: calls the endpoints registered for the dataKey in API_ENDPOINTS through HttpService.
 *
 * Components never see the difference. Failed API calls error with an `ApiError` (the error interceptor has
 * already shown a toast), so callers can react instead of silently receiving an empty list.
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
    const custom = options.normalizer || ((item: unknown) => item as T);
    // API mode: the resource's adapter (core/models/master-adapters) turns backend records into screen rows and
    // screen payloads into request bodies, so every caller of the resource sees the same shape.
    const adapter = isMockEnabled(dataKey) ? undefined : MASTER_ADAPTERS[dataKey];
    const normalizer = adapter
      ? (item: unknown, index?: number) => custom(adapter.fromApi(item, typeof index === 'number' ? index : 0))
      : custom;
    const body = (payload: Partial<T>): Partial<T> => (adapter ? (adapter.toApi(payload) as Partial<T>) : payload);

    return {
      list: (queryOpts?: QueryOptions) => this.list<T>(dataKey, queryOpts, { idKey, normalizer }),
      getAll: (filter?: Record<string, unknown>) => this.getAll<T>(dataKey, filter, { idKey, normalizer }),
      getById: (id: string | number) => this.getById<T>(dataKey, id, { idKey, normalizer }),
      create: (payload: Partial<T>) => this.create<T>(dataKey, body(payload), { idKey, normalizer }),
      update: (id: string | number, patch: Partial<T>) => this.update<T>(dataKey, id, body(patch), { idKey, normalizer }),
      delete: (id: string | number) => this.delete(dataKey, id, { idKey })
    };
  }

  /** True when the resource is served from the mock store rather than the API. */
  isMock(dataKey: string): boolean {
    return isMockEnabled(dataKey);
  }

  /** Resets mock store and storage for a resource (or all resources). */
  reset(dataKey?: string): void {
    this.mockDb.reset(dataKey);
  }

  // =========================================================================
  // CORE ENGINE OPERATIONS
  // =========================================================================

  /** LIST / QUERY: paginated response with search, filter and sorting. */
  list<T = any>(
    dataKey: string,
    queryOpts: QueryOptions = {},
    options: ResourceRepositoryOptions<T> = {}
  ): Observable<PaginatedResponse<T>> {
    const normalizer = options.normalizer || ((item: unknown) => item as T);

    if (isMockEnabled(dataKey)) {
      const mockResult = this.mockDb.query<T>(dataKey, queryOpts);
      return this.mockReply({ ...mockResult, items: mockResult.items.map(normalizer) });
    }

    const endpoint = this.endpoint(dataKey, 'LIST');
    if (!endpoint) return this.missingEndpoint(dataKey, 'LIST');

    // A POST list endpoint takes the query as its body; a GET one as flat query params.
    const req$ = endpoint.method === 'POST'
      ? this.http.call<unknown>(endpoint, { body: queryOpts })
      : this.http.call<unknown>(endpoint, { params: queryOptionsToParams(queryOpts) });

    return req$.pipe(map(res => toPaginated<T>(res, normalizer)));
  }

  /** GET ALL: every record of a resource, optionally filtered by exact field values. */
  getAll<T = any>(
    dataKey: string,
    filter?: Record<string, unknown>,
    options: ResourceRepositoryOptions<T> = {}
  ): Observable<T[]> {
    const normalizer = options.normalizer || ((item: unknown) => item as T);

    if (isMockEnabled(dataKey)) {
      let raw = this.mockDb.getAll<T>(dataKey);
      if (filter && Object.keys(filter).length > 0) {
        raw = raw.filter(item => Object.entries(filter).every(([k, v]) => asRecord(item)[k] === v));
      }
      return this.mockReply(raw.map(normalizer));
    }

    const endpoint = this.endpoint(dataKey, 'LIST');
    if (!endpoint) return this.missingEndpoint(dataKey, 'LIST');

    return this.http
      .call<unknown>(endpoint, { params: filter as QueryParamInput | undefined })
      .pipe(map(res => toItems<T>(res, normalizer)));
  }

  /** GET BY ID: a single record. */
  getById<T = any>(
    dataKey: string,
    id: string | number,
    options: ResourceRepositoryOptions<T> = {}
  ): Observable<T> {
    const idKey = options.idKey || 'id';
    const normalizer = options.normalizer || ((item: unknown) => item as T);

    if (isMockEnabled(dataKey)) {
      const item = this.mockDb.getById<T>(dataKey, id, idKey);
      if (!item) {
        return throwError(() => new Error(`Item ${id} not found in ${dataKey}`));
      }
      return this.mockReply(normalizer(item));
    }

    const endpoint = this.endpoint(dataKey, 'GET');
    if (!endpoint) return this.missingEndpoint(dataKey, 'GET');

    return this.http.call<unknown>(endpoint, { id }).pipe(map(res => normalizer(unwrapData(res))));
  }

  /** CREATE: adds a new record and returns it as saved. */
  create<T = any>(
    dataKey: string,
    payload: Partial<T>,
    options: ResourceRepositoryOptions<T> = {}
  ): Observable<T> {
    const idKey = options.idKey || 'id';
    const normalizer = options.normalizer || ((item: unknown) => item as T);

    if (isMockEnabled(dataKey)) {
      return this.mockReply(normalizer(this.mockDb.create<T>(dataKey, payload, idKey)));
    }

    const endpoint = this.endpoint(dataKey, 'ADD');
    if (!endpoint) return this.missingEndpoint(dataKey, 'ADD');

    return this.http.call<unknown>(endpoint, { body: payload }).pipe(map(res => normalizer(unwrapData(res))));
  }

  /** UPDATE: saves changes to an existing record and returns it as saved. */
  update<T = any>(
    dataKey: string,
    id: string | number,
    patch: Partial<T>,
    options: ResourceRepositoryOptions<T> = {}
  ): Observable<T> {
    const idKey = options.idKey || 'id';
    const normalizer = options.normalizer || ((item: unknown) => item as T);

    if (isMockEnabled(dataKey)) {
      return this.mockReply(normalizer(this.mockDb.update<T>(dataKey, id, patch, idKey)));
    }

    const endpoint = this.endpoint(dataKey, 'UPDATE');
    if (!endpoint) return this.missingEndpoint(dataKey, 'UPDATE');

    return this.http.call<unknown>(endpoint, { id, body: patch }).pipe(map(res => normalizer(unwrapData(res))));
  }

  /** DELETE: removes a record. True when it was removed. */
  delete(
    dataKey: string,
    id: string | number,
    options: { idKey?: string } = {}
  ): Observable<boolean> {
    const idKey = options.idKey || 'id';

    if (isMockEnabled(dataKey)) {
      return this.mockReply(this.mockDb.delete(dataKey, id, idKey));
    }

    const endpoint = this.endpoint(dataKey, 'DELETE');
    if (!endpoint) return this.missingEndpoint(dataKey, 'DELETE');

    return this.http
      .call<{ success?: boolean } | null>(endpoint, { id })
      .pipe(map(res => res?.success ?? true));
  }

  // --- helpers ---

  private endpoint(dataKey: string, action: CrudAction): EndpointDef | null {
    return getEndpointForDataKey(dataKey, action);
  }

  private missingEndpoint(dataKey: string, action: CrudAction): Observable<never> {
    return throwError(() => new Error(`No ${action} endpoint configured for resource: ${dataKey}`));
  }

  private mockReply<R>(value: R): Observable<R> {
    return of(value).pipe(delay(MOCK_CONFIG.simulatedDelayMs));
  }
}
