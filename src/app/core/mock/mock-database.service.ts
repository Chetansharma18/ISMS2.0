import { Injectable } from '@angular/core';
import { MOCK_CONFIG, isMockEnabled } from './mock.config';
import {
  MOCK_SCHEMES,
  MOCK_USERS,
  MOCK_MANAGEMENT_USERS,
  MOCK_SDC_CENTRES,
  MOCK_BATCHES,
  MOCK_ASPIRANTS,
  MOCK_IPA_LIST,
  MOCK_EOI_APPLICANTS,
  MOCK_SECTORS,
  MOCK_COURSES,
  MOCK_DISTRICTS,
  MOCK_SANCTION_ORDERS,
  MOCK_GRIEVANCES,
  MOCK_ADMIN_GRIEVANCES,
  MOCK_SUBMITTED_TENDERS,
  MOCK_COURSE_MASTER_ITEMS,
  MOCK_SECTOR_MASTER_ITEMS,
  MOCK_DESIGNATION_MASTER_ITEMS,
  MOCK_DISTRICT_BLOCK_MASTER_ITEMS,
  MOCK_EOI_CATEGORY_ITEMS,
  MOCK_PERMISSION_MASTER_ITEMS,
  MOCK_SCHEME_MASTER_ITEMS,
  MOCK_USER_ROLE_MASTER_ITEMS
} from './data';

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  searchFields?: string[];
  filter?: Record<string, any>;
  sort?: { key: string; direction: 'asc' | 'desc' };
}

export interface QueryResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Centralized Mock Database Service
 * Provides in-memory data store with search, pagination, filtering, persistence,
 * and standard CRUD semantics for all resources.
 */
@Injectable({
  providedIn: 'root'
})
export class MockDatabaseService {
  private readonly store = new Map<string, any[]>();

  // Initial seed definitions
  private readonly seeds: Record<string, any[]> = {
    SCHEMES: MOCK_SCHEMES,
    USERS: MOCK_MANAGEMENT_USERS,
    SDC: MOCK_SDC_CENTRES,
    BATCHES: MOCK_BATCHES,
    ASPIRANTS: MOCK_ASPIRANTS,
    IPA: MOCK_IPA_LIST,
    EOI: MOCK_EOI_APPLICANTS,
    SECTORS: MOCK_SECTOR_MASTER_ITEMS,
    COURSES: MOCK_COURSE_MASTER_ITEMS,
    DISTRICTS: MOCK_DISTRICT_BLOCK_MASTER_ITEMS,
    SANCTION_ORDERS: MOCK_SANCTION_ORDERS,
    GRIEVANCES: MOCK_GRIEVANCES,
    ADMIN_GRIEVANCES: MOCK_ADMIN_GRIEVANCES,
    SUBMITTED_TENDERS: MOCK_SUBMITTED_TENDERS,
    DESIGNATIONS: MOCK_DESIGNATION_MASTER_ITEMS,
    EOI_CATEGORIES: MOCK_EOI_CATEGORY_ITEMS,
    PERMISSIONS: MOCK_PERMISSION_MASTER_ITEMS,
    SCHEME_MASTERS: MOCK_SCHEME_MASTER_ITEMS,
    USER_ROLES: MOCK_USER_ROLE_MASTER_ITEMS
  };

  constructor() {
    this.initializeStore();
  }

  /**
   * Helper to check if mock data is active for a given resource or globally
   */
  isMockActive(resourceKey?: string): boolean {
    return isMockEnabled(resourceKey);
  }

  /**
   * Initializes or reloads data into memory, attempting storage recovery if enabled.
   */
  private initializeStore(): void {
    Object.keys(this.seeds).forEach(key => {
      const stored = this.loadFromStorage(key);
      if (stored && Array.isArray(stored)) {
        this.store.set(key, stored);
      } else {
        this.store.set(key, this.deepClone(this.seeds[key]));
      }
    });
  }

  /**
   * Retrieves all items in a collection.
   * If mock mode is turned off, immediately returns empty list [].
   */
  getAll<T = any>(resourceKey: string): T[] {
    if (!this.isMockActive(resourceKey)) {
      return [];
    }
    const data = this.store.get(resourceKey) || [];
    return this.deepClone(data);
  }

  /**
   * Performs querying with search, filtering, sorting, and pagination.
   * If mock mode is turned off, immediately returns empty result.
   */
  query<T = any>(resourceKey: string, options: QueryOptions = {}): QueryResult<T> {
    if (!this.isMockActive(resourceKey)) {
      return {
        items: [],
        total: 0,
        page: options.page || 1,
        pageSize: options.pageSize || 10,
        totalPages: 0
      };
    }
    const raw = this.getAll<T>(resourceKey);
    let filtered = [...raw];

    // 1. Filtering
    if (options.filter && Object.keys(options.filter).length > 0) {
      filtered = filtered.filter(item => {
        return Object.entries(options.filter!).every(([k, v]) => {
          if (v === undefined || v === null || v === '') return true;
          return (item as any)[k] === v;
        });
      });
    }

    // 2. Full-text / Keyword Searching
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(item => {
        if (options.searchFields && options.searchFields.length > 0) {
          return options.searchFields.some(f => {
            const val = (item as any)[f];
            return val != null && String(val).toLowerCase().includes(q);
          });
        }
        return Object.values(item as any).some(val => {
          return val != null && String(val).toLowerCase().includes(q);
        });
      });
    }

    // 3. Sorting
    if (options.sort?.key) {
      const { key, direction } = options.sort;
      filtered.sort((a, b) => {
        const valA = (a as any)[key];
        const valB = (b as any)[key];
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (valA < valB) return direction === 'desc' ? 1 : -1;
        if (valA > valB) return direction === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // 4. Pagination
    const total = filtered.length;
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.max(1, options.pageSize || 10);
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Finds a single item by identifier.
   */
  getById<T = any>(resourceKey: string, id: string | number, idKey = 'id'): T | null {
    const list = this.getAll<T>(resourceKey);
    const found = list.find(item => String((item as any)[idKey]) === String(id));
    return found ? this.deepClone(found) : null;
  }

  /**
   * Adds a new item to the collection.
   */
  create<T = any>(resourceKey: string, item: Partial<T>, idKey = 'id'): T {
    const list = this.getAll<T>(resourceKey);
    const newItem: any = { ...item };

    if (!newItem[idKey]) {
      newItem[idKey] = `${resourceKey.toLowerCase()}-${Date.now()}`;
    }
    if (!newItem.createdAt) {
      newItem.createdAt = new Date().toISOString();
    }
    if (newItem.sNo === undefined) {
      newItem.sNo = list.length + 1;
    }

    list.unshift(newItem);
    this.store.set(resourceKey, list);
    this.saveToStorage(resourceKey, list);

    return this.deepClone(newItem);
  }

  /**
   * Updates an existing item in the collection.
   */
  update<T = any>(resourceKey: string, id: string | number, patch: Partial<T>, idKey = 'id'): T {
    const list = this.getAll<T>(resourceKey);
    const idx = list.findIndex(item => String((item as any)[idKey]) === String(id));

    if (idx === -1) {
      throw new Error(`Item with ${idKey}='${id}' not found in mock store for '${resourceKey}'`);
    }

    const updated = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    this.store.set(resourceKey, list);
    this.saveToStorage(resourceKey, list);

    return this.deepClone(updated);
  }

  /**
   * Deletes an item by identifier.
   */
  delete(resourceKey: string, id: string | number, idKey = 'id'): boolean {
    const list = this.getAll(resourceKey);
    const initialLen = list.length;
    const filtered = list.filter(item => String(item[idKey]) !== String(id));

    if (filtered.length === initialLen) {
      return false;
    }

    // Re-index sNo if applicable
    const reindexed = filtered.map((item, idx) => {
      if (item.sNo !== undefined) {
        return { ...item, sNo: idx + 1 };
      }
      return item;
    });

    this.store.set(resourceKey, reindexed);
    this.saveToStorage(resourceKey, reindexed);
    return true;
  }

  /**
   * Restores a resource or all resources back to seed data.
   */
  reset(resourceKey?: string): void {
    if (resourceKey) {
      if (this.seeds[resourceKey]) {
        const seed = this.deepClone(this.seeds[resourceKey]);
        this.store.set(resourceKey, seed);
        this.removeFromStorage(resourceKey);
      }
    } else {
      Object.keys(this.seeds).forEach(key => {
        this.store.set(key, this.deepClone(this.seeds[key]));
        this.removeFromStorage(key);
      });
    }
  }

  // --- Storage Helper Utilities ---

  private saveToStorage(resourceKey: string, data: any[]): void {
    if (!MOCK_CONFIG.persistInStorage || typeof sessionStorage === 'undefined') return;
    try {
      sessionStorage.setItem(`${MOCK_CONFIG.storagePrefix}${resourceKey}`, JSON.stringify(data));
    } catch {
      // Ignore quota or private-mode errors
    }
  }

  private loadFromStorage(resourceKey: string): any[] | null {
    if (!MOCK_CONFIG.persistInStorage || typeof sessionStorage === 'undefined') return null;
    try {
      const val = sessionStorage.getItem(`${MOCK_CONFIG.storagePrefix}${resourceKey}`);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }

  private removeFromStorage(resourceKey: string): void {
    if (typeof sessionStorage === 'undefined') return;
    try {
      sessionStorage.removeItem(`${MOCK_CONFIG.storagePrefix}${resourceKey}`);
    } catch {
      // Ignore
    }
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
