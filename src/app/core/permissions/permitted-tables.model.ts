import type { IconName } from '../../shared/components/icon/icons';

/** HTTP methods a role permission can allow on a table. */
export type TableMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** One category of tables (`categories[]` of GET /auth/permissions). */
export interface TableCategory {
  id: number;
  name: string;
}

/** One table the signed-in user may use (`tables[]` of GET /auth/permissions), normalized. */
export interface PermittedTable {
  tableName: string;
  description: string;
  categoryId: number | null;
  methods: TableMethod[];
}

/** What the frontend keeps from GET /auth/permissions. */
export interface PermittedTablesState {
  tables: PermittedTable[];
  categories: TableCategory[];
  /** Backend role names the permissions were computed for. */
  roles: string[];
  loadedAt: string;
}

/**
 * The frontend screen that shows a backend table. This is the only thing the backend cannot tell the frontend:
 * which route renders which table. Labels, grouping, order and access all come from the API.
 */
export interface TableScreen {
  route: string;
  icon?: IconName;
  /** The DataEngine / API_ENDPOINTS key the screen loads, so its buttons can follow the table's methods. */
  dataKey?: string;
  /** Extra query params of the link (e.g. Users / Blacklisted users share one screen). */
  query?: Record<string, string>;
}

/** One link of the permission-driven sidebar. */
export interface PermittedNavItem {
  key: string;
  label: string;
  title: string;
  route: string;
  icon: IconName;
  query?: Record<string, string>;
  tableNames: string[];
}

/** One sidebar group: a backend table category with the permitted tables that have a screen. */
export interface PermittedNavGroup {
  id: number | null;
  label: string;
  /** The backend "Own" category: its tables are top-level links, without a group header. */
  standalone: boolean;
  items: PermittedNavItem[];
}
