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

// ---------------------------------------------------------------- the masters' table for a generic module

/** A record as the master table shows it: `id`, `sNo`, `status` and the backend record in `_raw`. */
export interface ModuleItem extends ModuleRow {
  id: string;
  sNo: number;
  status?: string;
  _raw: ModuleRow;
}

export type ModuleFieldKind = 'text' | 'textarea' | 'number' | 'flag';

/** A field of the add / edit form, guessed from the records the endpoint returned. */
export interface ModuleField {
  key: string;
  label: string;
  kind: ModuleFieldKind;
}

/** What the endpoint's records allow: the id field, the Active flag and the editable fields. */
export interface ModuleShape {
  idKey: string;
  /** `isActive` (or a boolean `status`) when the records have one: drives the Active switch. */
  activeKey: string | null;
  fields: ModuleField[];
  columns: TableColumn<ModuleItem>[];
}

/** Fields the backend fills in itself, never typed in the form. */
const SYSTEM_FIELD = /^(id|createdAt|createdBy|createdOn|updatedAt|updatedBy|updatedOn|modifiedAt|modifiedBy|deletedAt|deletedBy|isDeleted|rowVersion|concurrencyStamp)$/i;
const LONG_TEXT_KEY = /description|content|remarks?|body|message|details|address|notes?/i;
const FLAG_OPTIONS = ['Yes', 'No'];

function idKeyOf(rows: readonly ModuleRow[]): string | null {
  const keys = Object.keys(rows[0] ?? {});
  const unique = (key: string) => {
    const values = rows.map(r => r[key]);
    return values.every(v => v !== null && v !== undefined && v !== '') && new Set(values.map(String)).size === values.length;
  };
  const exact = keys.find(k => k.toLowerCase() === 'id');
  if (exact && unique(exact)) return exact;
  return keys.find(k => /id$/i.test(k) && unique(k)) ?? null;
}

function activeKeyOf(rows: readonly ModuleRow[]): string | null {
  const keys = Object.keys(rows[0] ?? {});
  return keys.find(k => /^(isActive|active|status)$/i.test(k) && rows.every(r => typeof r[k] === 'boolean' || r[k] == null)) ?? null;
}

/**
 * The table and form of a generic module, from its records. Null when the records have no usable id (rows cannot
 * be edited or deleted then) or there are no records to learn the fields from.
 */
export function moduleShape(rows: readonly ModuleRow[], maxColumns = 6): ModuleShape | null {
  if (rows.length === 0) return null;
  const idKey = idKeyOf(rows);
  if (!idKey) return null;
  const activeKey = activeKeyOf(rows);
  const sample = rows.slice(0, 25);
  const kinds = new Map<string, ModuleFieldKind>();
  for (const row of sample) {
    for (const [key, value] of Object.entries(row)) {
      if (key === idKey || key === activeKey || key.startsWith('_') || SYSTEM_FIELD.test(key) || HIDDEN_FIELD.test(key)) continue;
      if (isObject(value) || Array.isArray(value)) continue;
      if (value === null || value === undefined) {
        if (!kinds.has(key)) kinds.set(key, LONG_TEXT_KEY.test(key) ? 'textarea' : 'text');
        continue;
      }
      const kind: ModuleFieldKind = typeof value === 'boolean' ? 'flag'
        : typeof value === 'number' ? 'number'
        : LONG_TEXT_KEY.test(key) || String(value).length > 120 ? 'textarea' : 'text';
      const known = kinds.get(key);
      if (!known || known === 'text') kinds.set(key, kind);
    }
  }
  // A field holding a nested object or list in any record is not editable here.
  for (const row of sample) for (const [key, value] of Object.entries(row)) if (isObject(value) || Array.isArray(value)) kinds.delete(key);

  const fields = [...kinds.entries()].map(([key, kind]) => ({ key, label: fieldLabel(key), kind }));
  const columns: TableColumn<ModuleItem>[] = [
    { key: 'sNo', label: 'S. No.', align: 'center', width: 'w-16 min-w-[65px]' },
    ...fields
      .filter(f => f.kind !== 'textarea')
      .slice(0, maxColumns)
      .map(f => ({ key: f.key, label: f.label, format: (v: unknown) => moduleCellText(v) || '-' })),
    ...(activeKey ? [{ key: 'status', label: 'Status', type: 'custom' as const, align: 'center' as const }] : [])
  ];
  if (columns.length === (activeKey ? 2 : 1) && fields[0]) {
    // Only long texts: show the first of them.
    columns.splice(1, 0, { key: fields[0].key, label: fields[0].label, format: (v: unknown) => moduleCellText(v) || '-' });
  }
  return { idKey, activeKey, fields, columns };
}

/** One backend record as a master table row (flags shown as Yes / No, the Active flag as status). */
export function toModuleItem(raw: unknown, index: number, shape: ModuleShape): ModuleItem {
  const row = isObject(raw) ? raw : {};
  const item: ModuleItem = { ...row, id: String(row[shape.idKey] ?? ''), sNo: index + 1, _raw: row };
  for (const f of shape.fields) if (f.kind === 'flag' && typeof row[f.key] === 'boolean') item[f.key] = row[f.key] ? 'Yes' : 'No';
  if (shape.activeKey) item.status = row[shape.activeKey] === false ? 'Inactive' : 'Active';
  return item;
}

/** Blank form values for "Add". */
export function moduleDefaults(shape: ModuleShape): Record<string, unknown> {
  return Object.fromEntries(shape.fields.map(f => [f.key, f.kind === 'flag' ? 'No' : '']));
}

/**
 * The request body: the record as the backend sent it (PUT replaces it), with the form values typed back (Yes / No
 * to true / false, numbers to numbers, empty to null) and the Active switch as the record's own flag.
 */
export function toModuleBody(shape: ModuleShape, values: Record<string, unknown>, current: ModuleItem | null): ModuleRow {
  const body: ModuleRow = { ...(current?._raw ?? {}) };
  for (const f of shape.fields) {
    if (!(f.key in values)) continue;
    const v = values[f.key];
    const text = typeof v === 'string' ? v.trim() : v;
    if (f.kind === 'flag') body[f.key] = text === 'Yes' || text === true;
    else if (f.kind === 'number') body[f.key] = text === '' || text === null || text === undefined ? null : Number(text);
    else body[f.key] = text === '' ? null : text;
  }
  if (shape.activeKey) {
    const status = values['status'];
    body[shape.activeKey] = status !== undefined ? status !== 'Inactive' : current ? current.status !== 'Inactive' : true;
  }
  return body;
}

/** "News" -> "News", "PaymentRefunds" -> "Payment Refund" (the entity name in "Add ..." / "Edit ..."). */
export function entityName(label: string): string {
  if (/(ss|us|is|ews)$/i.test(label)) return label;
  if (/ies$/i.test(label)) return label.replace(/ies$/i, 'y');
  return label.replace(/s$/i, '');
}

/** The fields of a single record as label / value pairs (plain values only). */
export function moduleRecordFields(record: ModuleRow): { label: string; value: string }[] {
  return Object.entries(record)
    .filter(([key, value]) => !HIDDEN_FIELD.test(key) && !isObject(value))
    .map(([key, value]) => ({ label: fieldLabel(key), value: moduleCellText(value) }));
}
