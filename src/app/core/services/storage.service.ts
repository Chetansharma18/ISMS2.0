import { Injectable } from '@angular/core';

/**
 * The single gateway to browser storage. Feature code must not touch
 * `localStorage` / `sessionStorage` directly.
 *
 * - `getItem` / `setItem` / `removeItem` store JSON values in localStorage.
 * - `getString` / `setString` store raw (non-JSON) strings in localStorage,
 *   for keys that other code reads as plain text (tokens, flags, ids).
 * - The `session*` variants do the same against sessionStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // ---------- localStorage: JSON ----------
  getItem<T>(key: string): T | null {
    return this.readJson<T>(this.local(), key);
  }

  setItem<T>(key: string, value: T): void {
    this.writeJson(this.local(), key, value, 'localStorage');
  }

  removeItem(key: string): void {
    this.remove(this.local(), key, 'localStorage');
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  }

  // ---------- localStorage: raw strings ----------
  getString(key: string): string | null {
    return this.readString(this.local(), key);
  }

  setString(key: string, value: string): void {
    this.writeString(this.local(), key, value, 'localStorage');
  }

  // ---------- sessionStorage ----------
  getSessionItem<T>(key: string): T | null {
    return this.readJson<T>(this.session(), key);
  }

  setSessionItem<T>(key: string, value: T): void {
    this.writeJson(this.session(), key, value, 'sessionStorage');
  }

  getSessionString(key: string): string | null {
    return this.readString(this.session(), key);
  }

  setSessionString(key: string, value: string): void {
    this.writeString(this.session(), key, value, 'sessionStorage');
  }

  removeSessionItem(key: string): void {
    this.remove(this.session(), key, 'sessionStorage');
  }

  // ---------- internals ----------
  private local(): Storage | null {
    try { return localStorage; } catch { return null; }
  }

  private session(): Storage | null {
    try { return sessionStorage; } catch { return null; }
  }

  private readJson<T>(store: Storage | null, key: string): T | null {
    try {
      const item = store?.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  }

  private readString(store: Storage | null, key: string): string | null {
    try {
      return store?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private writeJson<T>(store: Storage | null, key: string, value: T, label: string): void {
    try {
      store?.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to ${label} [${key}]:`, e);
    }
  }

  private writeString(store: Storage | null, key: string, value: string, label: string): void {
    try {
      store?.setItem(key, value);
    } catch (e) {
      console.error(`Error saving to ${label} [${key}]:`, e);
    }
  }

  private remove(store: Storage | null, key: string, label: string): void {
    try {
      store?.removeItem(key);
    } catch (e) {
      console.error(`Error removing from ${label} [${key}]:`, e);
    }
  }
}
