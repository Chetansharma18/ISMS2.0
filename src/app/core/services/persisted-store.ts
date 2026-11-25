import { WritableSignal, signal, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface PersistedStoreOptions<T> {
  /** Storage key the list is saved under. */
  key: string;
  /** Records used when nothing has been saved yet. */
  seed: readonly T[];
  /**
   * Optional hook run on records restored from storage, e.g. to refresh canonical fields
   * or append seed records that were added after the user's data was saved.
   */
  reconcile?: (stored: T[], seed: readonly T[]) => T[];
}

/**
 * A signal-backed list that survives reloads and stays in sync across browser tabs.
 *
 * Replaces the identical load / persist / `storage`-event boilerplate that each
 * SDC, batch and aspirant service used to carry, and routes all access through
 * StorageService. Must be created in an injection context (a field initializer is fine).
 *
 * When `environment.useMockData` is off the store is empty and never touches storage,
 * because the real backend owns the data.
 */
export class PersistedStore<T> {
  private readonly storage = inject(StorageService);

  /** The live list. Update it immutably, then call `persist()`. */
  readonly items: WritableSignal<T[]>;

  constructor(private readonly options: PersistedStoreOptions<T>) {
    this.items = signal<T[]>(this.load());
    this.listenForOtherTabs();
  }

  /** Saves the given list (or the current one) to storage. No-op outside mock mode. */
  persist(list: T[] = this.items()): void {
    if (!environment.useMockData) return;
    this.storage.setItem(this.options.key, list);
  }

  private load(): T[] {
    if (!environment.useMockData) return [];

    const { key, seed, reconcile } = this.options;
    const stored = this.storage.getItem<T[]>(key);

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
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event: StorageEvent) => {
      if (!environment.useMockData) return;
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
