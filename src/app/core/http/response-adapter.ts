import type { PaginatedResponse } from '../models/common.model';

/**
 * Normalizes the response envelopes a backend may use into the shapes screens work with.
 * Accepted list shapes: `T[]`, `{ items }`, `{ data: T[] }`, `{ data: { items } }`, with the total in
 * `total` / `totalCount` / `pagination.total` and page info in `page` / `pageSize` (or under `pagination`).
 */

type Envelope = {
  data?: unknown;
  items?: unknown;
  total?: number;
  totalCount?: number;
  page?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  pagination?: { total?: number; totalCount?: number; page?: number; pageSize?: number; totalPages?: number };
};

const isObject = (value: unknown): value is Envelope => !!value && typeof value === 'object' && !Array.isArray(value);

/** `res.data` when the response is wrapped in a `{ data }` envelope, otherwise the response itself. */
export function unwrapData(res: unknown): unknown {
  return isObject(res) && res.data !== undefined ? res.data : res;
}

/** The list envelope that holds the items (top level or under `data`), or null when the shape is not a list. */
function findListEnvelope(res: unknown): { items: unknown[]; meta: Envelope } | null {
  if (Array.isArray(res)) return { items: res, meta: {} };
  if (!isObject(res)) return null;
  if (Array.isArray(res.items)) return { items: res.items, meta: res };
  if (Array.isArray(res.data)) return { items: res.data, meta: res };
  if (isObject(res.data) && Array.isArray(res.data.items)) return { items: res.data.items, meta: res.data };
  return null;
}

/** The records of a list response, whatever its envelope. */
export function toItems<T>(res: unknown, normalizer: (item: unknown) => T = item => item as T): T[] {
  return (findListEnvelope(res)?.items ?? []).map(normalizer);
}

/** A paginated response with totals, whatever the envelope. */
export function toPaginated<T>(res: unknown, normalizer: (item: unknown) => T = item => item as T): PaginatedResponse<T> {
  const found = findListEnvelope(res);
  if (!found) return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };

  const { items, meta } = found;
  const p = meta.pagination ?? {};
  const total = meta.total ?? meta.totalCount ?? p.total ?? p.totalCount ?? items.length;
  const page = meta.page ?? meta.pageNumber ?? p.page ?? 1;
  const pageSize = meta.pageSize ?? p.pageSize ?? (items.length || 10);
  const totalPages = meta.totalPages ?? p.totalPages ?? (Math.ceil(total / (pageSize || 1)) || 1);

  return { items: items.map(normalizer), total, page, pageSize, totalPages };
}
