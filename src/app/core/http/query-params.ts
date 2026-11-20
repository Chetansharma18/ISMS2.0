import { HttpParams } from '@angular/common/http';
import type { QueryOptions } from '../models/common.model';

export type QueryParamValue = string | number | boolean | Date | null | undefined | readonly (string | number | boolean)[];
export type QueryParamInput = Record<string, unknown>;

/**
 * Builds HttpParams from a flat object. Empty values (undefined, null, '') are dropped, arrays become repeated
 * keys (`?id=1&id=2`), dates become ISO strings and nested objects are sent as JSON, so nothing is ever
 * serialized as `[object Object]`.
 */
export function toHttpParams(input: QueryParamInput | HttpParams | null | undefined): HttpParams {
  if (input instanceof HttpParams) return input;
  let params = new HttpParams();
  if (!input) return params;

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') params = params.append(key, String(item));
      }
    } else if (value instanceof Date) {
      params = params.set(key, value.toISOString());
    } else if (typeof value === 'object') {
      params = params.set(key, JSON.stringify(value));
    } else {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/**
 * Maps the list query used by screens to flat API query params:
 * `page`, `pageSize`, `search`, `searchFields` (comma separated), each `filter` entry as its own param,
 * and `sort` as `sortBy` + `sortDescending`.
 */
export function queryOptionsToParams(options: QueryOptions | undefined): QueryParamInput {
  if (!options) return {};
  const { page, pageSize, search, searchFields, filter, sort } = options;
  return {
    ...(filter ?? {}),
    page,
    pageSize,
    search: search?.trim() || undefined,
    searchFields: searchFields?.length ? searchFields.join(',') : undefined,
    sortBy: sort?.key,
    sortDescending: sort ? sort.direction === 'desc' : undefined
  };
}
