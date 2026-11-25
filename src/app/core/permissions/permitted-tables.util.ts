import type {
  PermittedNavGroup,
  PermittedNavItem,
  PermittedTable,
  PermittedTablesState,
  TableCategory,
  TableMethod,
  TableScreen
} from './permitted-tables.model';

const METHODS: readonly TableMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
const FLAG_BY_METHOD: Record<TableMethod, string> = {
  GET: 'methodAllowGet',
  POST: 'methodAllowPost',
  PUT: 'methodAllowPut',
  DELETE: 'methodAllowDelete'
};

/** Label of the group for tables whose category the API did not list. */
export const UNGROUPED_LABEL = 'Other';

/** Backend category names whose tables have no parent group (shown as top-level links). */
const STANDALONE_CATEGORY_NAMES = new Set(['own']);

/** True for the backend "Own" category: its tables are top-level links, not a group. */
export function isStandaloneCategory(name: string): boolean {
  return STANDALONE_CATEGORY_NAMES.has(name.trim().toLowerCase());
}

type Raw = Record<string, unknown>;
const asRaw = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});
const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const numberOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : typeof value === 'string' && value.trim() !== '' && !isNaN(+value) ? +value : null;

const isTrue = (value: unknown): boolean => value === true || value === 1 || text(value).toLowerCase() === 'true';

/** Sidebar label of a table: the backend `menuCallingName`, else the table name made readable. */
export function menuLabel(table: Pick<PermittedTable, 'tableName' | 'menuName'>): string {
  return table.menuName || humanizeTableName(table.tableName);
}

/** The allowed methods of a table row: from `allowedMethods`, else from the `methodAllow*` flags. */
function methodsOf(row: Raw): TableMethod[] {
  const listed = asList(row['allowedMethods'] ?? row['allowed_methods'])
    .map(m => text(m).toUpperCase())
    .filter((m): m is TableMethod => (METHODS as readonly string[]).includes(m));
  if (listed.length > 0) return METHODS.filter(m => listed.includes(m));
  return METHODS.filter(m => row[FLAG_BY_METHOD[m]] === true);
}

/** Normalizes the GET /auth/permissions response (also accepts it wrapped in `{ data }`). */
export function toPermittedTablesState(response: unknown, now: Date = new Date()): PermittedTablesState {
  const root = asRaw(response);
  const body = root['tables'] === undefined && root['data'] !== undefined ? asRaw(root['data']) : root;

  const tables: PermittedTable[] = asList(body['tables'])
    .map(asRaw)
    .map(row => ({
      tableName: text(row['tableName'] ?? row['table_name']),
      description: text(row['description']),
      categoryId: numberOrNull(row['tableCategoryId'] ?? row['tableCategory_Id']),
      methods: methodsOf(row),
      inMenu: isTrue(row['enableInMenu'] ?? row['enable_in_menu']),
      menuName: text(row['menuCallingName'] ?? row['menu_calling_name']) || null
    }))
    .filter(t => t.tableName !== '' && t.methods.length > 0);

  const categories: TableCategory[] = asList(body['categories'])
    .map(asRaw)
    .map(row => ({ id: numberOrNull(row['id']), name: text(row['category'] ?? row['name']) }))
    .filter((c): c is TableCategory => c.id !== null && c.name !== '');

  const roles = asList(body['roles']).map(text).filter(Boolean);
  return { tables, categories, roles, loadedAt: now.toISOString() };
}

/** "EoiCategoryMasters" -> "EOI Category Masters", "RolePermissions" -> "Role Permissions". */
export function humanizeTableName(tableName: string): string {
  const words = tableName
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.map(w => (w.toLowerCase() === 'eoi' ? 'EOI' : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
}

/** True when the table allows the method. */
export function tableAllows(state: PermittedTablesState | null, tableName: string, method: TableMethod): boolean {
  const wanted = tableName.toLowerCase();
  return !!state?.tables.some(t => t.tableName.toLowerCase() === wanted && t.methods.includes(method));
}

/**
 * The sidebar groups: one per API category, in the API's order, holding the permitted tables marked
 * `enableInMenu`, labelled with their `menuCallingName`. Tables sharing a screen become one link; tables of an
 * unknown category go to a trailing "Other" group. Empty groups are left out.
 */
export function buildNavGroups(
  state: PermittedTablesState | null,
  screens: Readonly<Record<string, TableScreen>>
): PermittedNavGroup[] {
  if (!state) return [];
  const screenOf = (name: string) =>
    screens[name] ?? Object.entries(screens).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];

  const knownIds = new Set(state.categories.map(c => c.id));
  const groups: PermittedNavGroup[] = [
    ...state.categories.map(c => ({
      id: c.id as number | null,
      label: c.name,
      standalone: isStandaloneCategory(c.name),
      items: [] as PermittedNavItem[]
    })),
    { id: null, label: UNGROUPED_LABEL, standalone: false, items: [] }
  ];

  for (const table of state.tables) {
    if (!table.inMenu) continue; // The backend decides which tables get a sidebar link.
    if (!table.methods.includes('GET')) continue; // A screen needs read access.
    // Tables without a dedicated screen open the generic module page, so every permitted table is listed.
    const screen = screenOf(table.tableName) ?? { route: moduleRoute(table.tableName) };

    const groupId = table.categoryId !== null && knownIds.has(table.categoryId) ? table.categoryId : null;
    const group = groups.find(g => g.id === groupId)!;
    const existing = group.items.find(i => i.route === screen.route && sameQuery(i.query, screen.query));
    if (existing) {
      // Tables sharing one screen (Block + District) become one link named after all of them.
      existing.tableNames.push(table.tableName);
      const members = existing.tableNames.map(name => state.tables.find(t => t.tableName === name)!);
      existing.label = sharedScreenLabel(members);
      existing.title = [...new Set(members.map(menuLabel))].join(', ');
      continue;
    }
    group.items.push({
      key: `table:${table.tableName}`,
      label: menuLabel(table),
      title: table.description || menuLabel(table),
      route: screen.route,
      icon: screen.icon ?? 'list',
      query: screen.query,
      tableNames: [table.tableName]
    });
    for (const extra of screen.extraLinks ?? []) {
      if (group.items.some(i => i.route === extra.route)) continue;
      group.items.push({
        key: `table:${table.tableName}:${extra.key}`,
        label: extra.label,
        title: extra.label,
        route: extra.route,
        icon: extra.icon ?? screen.icon ?? 'list',
        tableNames: [table.tableName]
      });
    }
  }
  return groups.filter(g => g.items.length > 0);
}

/** Base path of the generic page for a permitted table that has no dedicated screen. */
export const MODULE_ROUTE_PREFIX = '/module';

export function moduleRoute(tableName: string): string {
  return `${MODULE_ROUTE_PREFIX}/${encodeURIComponent(tableName)}`;
}

/** The table name in a generic module URL (`/module/News`), or null for other URLs. */
export function tableNameFromModuleUrl(url: string): string | null {
  const path = url.split('?')[0].split('#')[0];
  const match = path.match(/^\/module\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Label of one link for several tables: their distinct menu names joined with " & " (one name when they share it);
 * when none has a menu name, the combined table names ("Block & District Masters").
 */
function sharedScreenLabel(tables: readonly PermittedTable[]): string {
  if (tables.every(t => !t.menuName)) return combinedLabel(tables.map(t => t.tableName));
  return [...new Set(tables.map(menuLabel))].join(' & ');
}

/** "BlockMasters" + "DistrictMasters" -> "Block & District Masters"; otherwise the names joined with " & ". */
export function combinedLabel(tableNames: readonly string[]): string {
  const names = tableNames.map(humanizeTableName);
  const lastWords = names.map(n => n.split(' ').pop() ?? '');
  const shared = lastWords.every(w => w === lastWords[0]) && names.every(n => n.includes(' ')) ? lastWords[0] : '';
  if (!shared) return names.join(' & ');
  return `${names.map(n => n.slice(0, -shared.length).trim()).join(' & ')} ${shared}`;
}

/** Screens (by route) and the tables each one shows. */
export function tablesByRoute(screens: Readonly<Record<string, TableScreen>>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [tableName, screen] of Object.entries(screens)) {
    for (const route of [screen.route, ...(screen.alsoGoverns ?? [])]) {
      map.set(route, [...(map.get(route) ?? []), tableName]);
    }
  }
  return map;
}

/** The registered screen route a URL belongs to (exact or as a parent path), or null when no screen governs it. */
export function governingRoute(url: string, routes: Iterable<string>): string | null {
  const path = url.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  let best: string | null = null;
  for (const route of routes) {
    if ((path === route || path.startsWith(`${route}/`)) && (!best || route.length > best.length)) best = route;
  }
  return best;
}

function sameQuery(a?: Record<string, string>, b?: Record<string, string>): boolean {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
}
