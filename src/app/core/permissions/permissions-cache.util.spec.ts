import { describe, it, expect } from 'vitest';
import {
  PERMISSIONS_MAX_AGE_MS,
  isPermissionsCacheStale,
  isPermissionsRequestUrl,
  permissionsVersionChanged
} from './permissions-cache.util';
import type { PermittedTablesState } from './permitted-tables.model';

const NOW = Date.parse('2026-01-10T10:00:00Z');

function state(loadedAt: string, version?: string | null): PermittedTablesState {
  return { tables: [], categories: [], roles: [], loadedAt, version };
}

describe('isPermissionsCacheStale', () => {
  it('treats a missing or unreadable cache as stale', () => {
    expect(isPermissionsCacheStale(null, NOW)).toBe(true);
    expect(isPermissionsCacheStale(state('not a date'), NOW)).toBe(true);
  });

  it('keeps a recent cache and reloads an old one', () => {
    expect(isPermissionsCacheStale(state('2026-01-10T09:55:00Z'), NOW)).toBe(false);
    expect(isPermissionsCacheStale(state(new Date(NOW - PERMISSIONS_MAX_AGE_MS - 1).toISOString()), NOW)).toBe(true);
  });
});

describe('permissionsVersionChanged', () => {
  it('reloads when the backend sends a different version', () => {
    expect(permissionsVersionChanged(state('2026-01-10T09:55:00Z', 'v1'), 'v2')).toBe(true);
    expect(permissionsVersionChanged(state('2026-01-10T09:55:00Z', null), 'v2')).toBe(true);
  });

  it('does nothing for the same version, no version, or no cache', () => {
    expect(permissionsVersionChanged(state('2026-01-10T09:55:00Z', 'v1'), 'v1')).toBe(false);
    expect(permissionsVersionChanged(state('2026-01-10T09:55:00Z', 'v1'), null)).toBe(false);
    expect(permissionsVersionChanged(state('2026-01-10T09:55:00Z', 'v1'), '  ')).toBe(false);
    expect(permissionsVersionChanged(null, 'v2')).toBe(false);
  });
});

describe('isPermissionsRequestUrl', () => {
  it('recognises the permissions endpoints', () => {
    expect(isPermissionsRequestUrl('/api/auth/permissions')).toBe(true);
    expect(isPermissionsRequestUrl('https://host/api/auth/permitted-tables/?x=1')).toBe(true);
    expect(isPermissionsRequestUrl('/api/master/sectors')).toBe(false);
  });
});
