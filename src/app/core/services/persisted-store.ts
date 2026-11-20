import { WritableSignal, signal, inject } from '@angular/core';
import { Observable, merge, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isMockEnabled } from '../mock/mock.config';
import { DataEngineService, ResourceRepository } from './data-engine.service';
import { StorageService } from './storage.service';

export interface PersistedStoreOptions<T> {
  /**
   * Storage key the list is saved under in mock mode. Omit it to keep the mock list in memory only
   * (it then starts from the seed on every reload).
   */
  key?: string;
  /** Records used in mock mode when nothing has been saved yet. */
  seed: readonly T[];
  /**
   * Optional hook run on records restored from storage, e.g. to refresh canonical fields
   * or append seed records that were added after the user's data was saved.
   */
  reconcile?: (stored: T[], seed: readonly T[]) => T[];
  /**
   * The resource key in API_ENDPOINTS and mock.config.ts. When the resource is not mocked, the list is loaded from
   * its LIST endpoint and every `persist()` sends the changed records to its ADD / UPDATE / DELETE endpoints.
   * Without it the store is mock-only (empty when `environment.useMockData` is off).
   */
  dataKey?: string;
  /** Field that identifies a record, used to work out what changed. Default `id`. */
  idKey?: Extract<keyof T, string>;
  /** False for a read-only reference list: `persist()` never writes it anywhere. Default true. */
  writable?: boolean;
}

/**
 * A signal-backed list that is the single data source of a feature service (SDC, batch, aspirant, attendance ...).
 *
 * - Mock mode: starts from the seed, survives reloads through StorageService and stays in sync across tabs.
 * - API mode (`dataKey` set and its mock flag off): loads the list from the API and syncs every `persist()` to the API,
 *   sending only the records that were added, changed or removed. When a write fails the list is reloaded from the
 *   server, so the screen never shows a change the backend did not accept.
 *
 * Services keep working synchronously against `items()`, so switching a resource to the API is a flag change in
 * mock.config.ts. Must be created in an injection context (a field initializer is fine).
 */
export class PersistedStore<T> {
  private readonly storage = inject(StorageService);
  private readonly remote: boolean;
  private readonly repo: ResourceRepository<T> | null = null;
  private readonly idKey: string;
  /** API mode: JSON of each record as the server last saw it, by id. */
  private synced = new Map<string, string>();

  /** The live list. Update it immutably, then call `persist()`. */
  readonly items: WritableSignal<T[]>;
  /** API mode: true while the list is being (re)loaded from the server. */
  readonly loading = signal(false);
  /** API mode: the last load failed. */
  readonly loadFailed = signal(false);

  constructor(private readonly options: PersistedStoreOptions<T>) {
    this.idKey = options.idKey ?? 'id';
    this.remote = !!options.dataKey && !isMockEnabled(options.dataKey);

    if (this.remote) {
      this.repo = inject(DataEngineService).for<T>(options.dataKey!, { idKey: this.idKey });
      this.items = signal<T[]>([]);
      this.reload();
    } else {
      this.items = signal<T[]>(this.load());
      this.listenForOtherTabs();
    }
  }

  /** Saves the given list (or the current one): to storage in mock mode, to the API in API mode. */
  persist(list: T[] = this.items()): void {
    if (this.options.writable === false) return;
    if (this.remote) {
      this.syncToApi(list);
      return;
    }
    if (!this.mockActive() || !this.options.key) return;
    this.storage.setItem(this.options.key, list);
  }

  /** API mode: replaces the list with the server's. No-op in mock mode. */
  reload(): void {
    if (!this.repo) return;
    this.loading.set(true);
    this.repo.getAll().subscribe({
      next: list => {
        this.synced = new Map(list.map(item => [this.idOf(item), JSON.stringify(item)]));
        this.items.set(list);
        this.loadFailed.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.loadFailed.set(true);
        this.loading.set(false);
      }
    });
  }

  // ---- API mode ------------------------------------------------------------------------------

  private syncToApi(list: T[]): void {
    const repo = this.repo!;
    const next = new Map<string, string>();
    const writes: Observable<unknown>[] = [];

    for (const item of list) {
      const id = this.idOf(item);
      const json = JSON.stringify(item);
      next.set(id, json);
      const before = this.synced.get(id);
      if (before === undefined) {
        writes.push(repo.create(item).pipe(tap(saved => this.adoptSaved(id, saved))));
      } else if (before !== json) {
        writes.push(repo.update(id, item));
      }
    }
    for (const id of this.synced.keys()) {
      if (!next.has(id)) writes.push(repo.delete(id));
    }

    this.synced = next;
    if (writes.length === 0) return;
    merge(...writes).subscribe({ error: () => this.reload() });
  }

  /** Puts the record the server saved (it may carry a server id or computed fields) in place of the local one. */
  private adoptSaved(localId: string, saved: T): void {
    if (!saved || typeof saved !== 'object') return;
    const savedId = this.idOf(saved) || localId;
    this.synced.delete(localId);
    this.synced.set(savedId, JSON.stringify(saved));
    this.items.update(list => list.map(item => (this.idOf(item) === localId ? saved : item)));
  }

  private idOf(item: T): string {
    const id = (item as Record<string, unknown> | null)?.[this.idKey];
    return id === undefined || id === null ? '' : String(id);
  }

  // ---- Mock mode -----------------------------------------------------------------------------

  private mockActive(): boolean {
    return this.options.dataKey ? isMockEnabled(this.options.dataKey) : environment.useMockData;
  }

  private load(): T[] {
    if (!this.mockActive()) return [];

    const { key, seed, reconcile } = this.options;
    const stored = key ? this.storage.getItem<T[]>(key) : null;

    if (Array.isArray(stored) && stored.length > 0) {
      try {
        const restored = reconcile ? reconcile(stored, seed) : stored;
        this.persist(restored);
        return restored;
      } catch (e) {
        console.error(`Failed to restore "${key}" from storage, falling back to seed data`, e);
      }
    }

    const initial = [...seed];
    this.persist(initial);
    return initial;
  }

  private listenForOtherTabs(): void {
    if (typeof window === 'undefined' || !this.options.key) return;

    window.addEventListener('storage', (event: StorageEvent) => {
      if (!this.mockActive()) return;
      if (event.key !== this.options.key || !event.newValue) return;
      try {
        const records: T[] = JSON.parse(event.newValue);
        if (Array.isArray(records) && records.length > 0) {
          this.items.set(records);
        }
      } catch {
        // Ignore malformed payloads from other tabs.
      }
    });
  }
}

/** Convenience factory; call from a field initializer so `inject()` works. */
export function createPersistedStore<T>(options: PersistedStoreOptions<T>): PersistedStore<T> {
  return new PersistedStore<T>(options);
}
