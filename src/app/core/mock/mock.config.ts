import { environment } from '../../../environments/environment';

export interface MockConfigSettings {
  /** Master switch: if false, all requests route to real API */
  globalUseMock: boolean;
  /** Artificial latency in milliseconds to mimic network calls */
  simulatedDelayMs: number;
  /** Whether to persist mock updates in localStorage/sessionStorage */
  persistInStorage: boolean;
  /** Storage key prefix */
  storagePrefix: string;
  /**
   * Per-resource mock toggles.
   * Allows incrementally pointing individual modules to real backend APIs
   * while keeping others on mock data!
   */
  resources: Record<string, boolean>;
}

export const MOCK_CONFIG: MockConfigSettings = {
  get globalUseMock(): boolean {
    return environment.useMockData ?? true;
  },
  set globalUseMock(val: boolean) {
    // Allows runtime override
    environment.useMockData = val;
  },
  simulatedDelayMs: environment.simulatedDelayMs ?? 150,
  persistInStorage: environment.enableMockPersistence ?? true,
  storagePrefix: 'isms_mock_db_',
  resources: {
    SCHEMES: true,
    EOI: true,
    USERS: true,
    SDC: true,
    BATCHES: true,
    ASPIRANTS: true,
    IPA: true,
    MASTERS: true,
    GRIEVANCES: true,
    REGISTRATION: true,
    AUTH: true
  }
};

/**
 * Checks whether mock data is active for a given dataKey/resource.
 */
export function isMockEnabled(dataKey?: string): boolean {
  if (!environment.useMockData) return false;
  if (dataKey && dataKey in MOCK_CONFIG.resources) {
    return MOCK_CONFIG.resources[dataKey];
  }
  return true;
}

/**
 * Dynamically toggle mock mode for a specific resource at runtime.
 */
export function setResourceMock(dataKey: string, enabled: boolean): void {
  MOCK_CONFIG.resources[dataKey] = enabled;
}

/**
 * Dynamically toggle mock mode globally at runtime.
 */
export function setGlobalMock(enabled: boolean): void {
  MOCK_CONFIG.globalUseMock = enabled;
}

/**
 * Universal Mock Data Resolver:
 * Wraps mock data arrays so they automatically return empty arrays when
 * environment.useMockData is set to false.
 */
export function resolveMock<T>(data: T[]): T[] {
  return (environment.useMockData ?? true) ? data : [];
}
