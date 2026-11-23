import type { PermittedTablesState } from './permitted-tables.model';

/** Response header the backend can send with every API answer: changes whenever the role's permissions change. */
export const PERMISSIONS_VERSION_HEADER = 'X-Permissions-Version';

/** Cached permissions older than this are reloaded when the user comes back to the tab or reloads the page. */
export const PERMISSIONS_MAX_AGE_MS = 15 * 60 * 1000;

/** After a 403, permissions are reloaded at most once in this window (several failing calls share one reload). */
export const FORBIDDEN_RELOAD_GAP_MS = 30 * 1000;

/** True when the cached permissions are missing, unreadable or older than `maxAgeMs`. */
export function isPermissionsCacheStale(
  state: PermittedTablesState | null,
  now: number,
  maxAgeMs: number = PERMISSIONS_MAX_AGE_MS
): boolean {
  if (!state) return true;
  const loadedAt = Date.parse(state.loadedAt);
  if (Number.isNaN(loadedAt)) return true;
  return now - loadedAt > maxAgeMs;
}

/**
 * True when a version the backend just sent shows the cached permissions are out of date.
 * No version in the response (backend does not send one) never triggers a reload.
 */
export function permissionsVersionChanged(state: PermittedTablesState | null, incoming: string | null): boolean {
  const version = incoming?.trim();
  if (!state || !version) return false;
  return (state.version ?? null) !== version;
}

/** True when the request is the permissions call itself (its answer is the reload, so it must not trigger one). */
export function isPermissionsRequestUrl(url: string): boolean {
  const path = url.split('?')[0].replace(/\/+$/, '').toLowerCase();
  return path.endsWith('/auth/permissions') || path.endsWith('/auth/permitted-tables');
}
