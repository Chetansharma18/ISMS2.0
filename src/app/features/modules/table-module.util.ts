import type { TableColumn } from '../../shared/components/table/table.types';
import { humanizeTableName } from '../../core/permissions/permitted-tables.util';
import { formatDateTime } from '../../shared/utils/date.util';

/*
 * Helpers for the generic page of a permitted table without a dedicated screen. The page reads the table's
 * `apiEndpoint` (from GET /auth/permissions) and shows whatever list or record it returns, read-only.
 */

export type ModuleRow = Record<string, unknown>;

export interface ModuleData {
  /** The records, when the endpoint returned a list. */
  rows: ModuleRow[] | null;
  /** The fields of a single object, when it returned no list (e.g. a diagnostics summary). */
  record: ModuleRow | null;
}

type Raw = Record<string, unknown>;
const isObject = (value: unknown): value is Raw => !!value && typeof value === 'object' && !Array.isArray(value);

/** Envelope keys that hold the list, in the order they are tried (`{ data: { items } }` included). */
const LIST_KEYS = ['data', 'items', 'records', 'results', 'rows', 'value', 'list'];
/** Envelope fields that describe the response, not the record. */
const ENVELOPE_KEYS = new Set(['success', 'message', 'statusCode', 'errors', 'traceId']);
/** Fields never shown on a generic page. */
const HIDDEN_FIELD = /password|secret|token|hash|salt|otp|apikey/i;

function findList(value: unknown, depth = 0): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (!isObject(value) || depth > 2) return null;
  for (const key of LIST_KEYS) {
    const found = Object.keys(value).find(k => k.toLowerCase() === key);
    if (found === undefined) continue;
    const list = findList(value[found], depth + 1);
    if (list) return list;
  }
  return null;
}

/** The list (or the single record) in an API response, whatever envelope it uses. */
export function toModuleData(response: unknown): ModuleData {
  const list = findList(response);
  if (list) return { rows: list.filter(isObject), record: null };
  const body = isObject(response) && isObject(response['data']) ? response['data'] : response;
  if (!isObject(body)) return { rows: [], record: null };
  const record: ModuleRow = {};
  for (const [key, value] of Object.entries(body)) {
    if (!ENVELOPE_KEYS.has(key) && !HIDDEN_FIELD.test(key)) record[key] = value;
  }
  return { rows: null, record };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/;

/** A cell value as text: Yes / No for flags, readable dates, lists joined, objects left out. */
export function moduleCellText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && ISO_DATE.test(value) && value.includes('T')) return formatDateTime(value);
  if (Array.isArray(value)) return value.filter(v => !isObject(v)).map(String).join(', ');
  if (isObject(value)) return '';
  return String(value);
}

/**
 * Columns from the records: every field that holds plain values (text, number, flag, date, list of values) in the
 * first records, in the backend's order with `id` first, at most `max`. Secrets and nested objects are left out.
 */
export function moduleColumns(rows: readonly ModuleRow[], max = 8): TableColumn<ModuleRow>[] {
  const keys: string[] = [];
  const nested = new Set<string>();
  for (const row of rows.slice(0, 25)) {
    for (const [key, value] of Object.entries(row)) {
      if (isObject(value) || (Array.isArray(value) && value.some(isObject))) nested.add(key);
      if (!keys.includes(key)) keys.push(key);
    }
  }
  const shown = keys.filter(k => !nested.has(k) && !HIDDEN_FIELD.test(k));
  const id = shown.findIndex(k => k.toLowerCase() === 'id');
  if (id > 0) shown.unshift(...shown.splice(id, 1));
  return shown.slice(0, max).map(key => ({
    key,
    label: fieldLabel(key),
    format: (value: unknown) => moduleCellText(value)
  }));
}

/** "createdAt" -> "Created At", "id" -> "ID". */
export function fieldLabel(key: string): string {
  return key.toLowerCase() === 'id' ? 'ID' : humanizeTableName(key);
}

/** The fields of a single record as label / value pairs (plain values only). */
export function moduleRecordFields(record: ModuleRow): { label: string; value: string }[] {
  return Object.entries(record)
    .filter(([key, value]) => !HIDDEN_FIELD.test(key) && !isObject(value))
    .map(([key, value]) => ({ label: fieldLabel(key), value: moduleCellText(value) }));
}
