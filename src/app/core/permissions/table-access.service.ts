import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { HttpService } from '../http/http.service';
import { isMockEnabled } from '../mock/mock.config';
import { StorageService } from '../services/storage.service';
import type { PermittedNavGroup, PermittedTablesState, TableMethod } from './permitted-tables.model';
import {
  MODULE_ROUTE_PREFIX,
  buildNavGroups,
  governingRoute,
  tableAllows,
  tableNameFromModuleUrl,
  tablesByRoute,
  toPermittedTablesState
} from './permitted-tables.util';
import { TABLE_SCREENS } from './table-screens';

const STORAGE_KEY = 'isms_permitted_tables';

/**
 * Table permissions of the signed-in user, from GET /auth/permissions (backend RolePermissions).
 *
 * - Loaded right after sign-in, refreshed when the app starts, cached in localStorage for reloads, cleared on logout.
 * - `navGroups()` drives the sidebar: only permitted tables that have a screen, grouped by the API's categories.
 * - `can(table, method)` / `canDataKey(dataKey, method)` drive buttons; `tableAccessGuard` drives routes.
 *
 * With mock sign-in (AUTH mocked) there is no backend session, so everything is allowed and the old role menus apply.
 */
@Injectable({ providedIn: 'root' })
export class TableAccessService {
  private readonly http = inject(HttpService);
  private readonly storage = inject(StorageService);

  private readonly state = signal<PermittedTablesState | null>(this.storage.getItem<PermittedTablesState>(STORAGE_KEY));
  private inFlight$: Observable<void> | null = null;

  /** True once permissions are known (from the API or the cache). */
  readonly loaded = computed(() => this.state() !== null);
  readonly loading = signal(false);
  readonly tables = computed(() => this.state()?.tables ?? []);
  readonly categories = computed(() => this.state()?.categories ?? []);
  /** Sidebar groups built from the API response. */
  readonly navGroups = computed<PermittedNavGroup[]>(() => buildNavGroups(this.state(), TABLE_SCREENS));

  private readonly routeTables = tablesByRoute(TABLE_SCREENS);

  /** True while sign-in is the mock persona picker; permissions then do not apply. */
  isMock(): boolean {
    return isMockEnabled('AUTH');
  }

  /** Loads the permissions from the API (parallel callers share one request). */
  load(): Observable<void> {
    if (this.isMock()) return of(undefined);
    this.inFlight$ ??= this.http
      .call<unknown>(API_ENDPOINTS.AUTH.PERMISSIONS, { flags: { skipErrorToast: true } })
      .pipe(
        map(res => toPermittedTablesState(res)),
        tap(state => {
          this.state.set(state);
          this.storage.setItem(STORAGE_KEY, state);
        }),
        map(() => undefined),
        finalize(() => {
          this.inFlight$ = null;
          this.loading.set(false);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    this.loading.set(true);
    return this.inFlight$;
  }

  /** Reloads in the background (app start). Keeps the cached permissions if the call fails. */
  refresh(): void {
    this.load().subscribe({ error: () => {} });
  }

  /** Resolves once permissions are known: true when they are, false when they could not be loaded. */
  ensureLoaded(): Observable<boolean> {
    if (this.isMock() || this.loaded()) return of(true);
    return this.load().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** True when the user may use the method on the backend table. */
  can(tableName: string, method: TableMethod = 'GET'): boolean {
    if (this.isMock()) return true;
    return tableAllows(this.state(), tableName, method);
  }

  /** The same check for a screen's DataEngine key (true when no table is mapped to the key). */
  canDataKey(dataKey: string | undefined, method: TableMethod): boolean {
    if (this.isMock() || !dataKey) return true;
    const tables = Object.entries(TABLE_SCREENS)
      .filter(([, screen]) => screen.dataKey === dataKey)
      .map(([tableName]) => tableName);
    return tables.length === 0 || tables.some(t => this.can(t, method));
  }

  /** The screen route that governs a URL, or null when the URL is not tied to a backend table. */
  governingRoute(url: string): string | null {
    if (tableNameFromModuleUrl(url) !== null) return MODULE_ROUTE_PREFIX;
    return governingRoute(url, this.routeTables.keys());
  }

  /** True when the user may open the screen at the URL (URLs not tied to a table are always allowed). */
  canOpenUrl(url: string): boolean {
    if (this.isMock()) return true;
    const moduleTable = tableNameFromModuleUrl(url);
    if (moduleTable !== null) return this.can(moduleTable, 'GET');
    const route = this.governingRoute(url);
    if (!route) return true;
    return (this.routeTables.get(route) ?? []).some(t => this.can(t, 'GET'));
  }

  /** The permitted table with this name (for the generic module page), or undefined. */
  table(tableName: string) {
    const wanted = tableName.toLowerCase();
    return this.tables().find(t => t.tableName.toLowerCase() === wanted);
  }

  /** The first link of the permission-driven sidebar, or null when the user has none. */
  firstPermittedRoute(): string | null {
    return this.navGroups()[0]?.items[0]?.route ?? null;
  }

  clear(): void {
    this.state.set(null);
    this.storage.removeItem(STORAGE_KEY);
  }
}
