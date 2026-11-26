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

/** Optional runtime override so toggling mock mode never mutates the imported environment object. */
let globalMockOverride: boolean | null = null;

export const MOCK_CONFIG: MockConfigSettings = {
  get globalUseMock(): boolean {
    return globalMockOverride ?? environment.useMockData ?? true;
  },
  set globalUseMock(val: boolean) {
    globalMockOverride = val;
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
    SANCTION_ORDERS: true,
    GRIEVANCES: true,
    REGISTRATION: true,
    AUTH: true,
    ADMIN_GRIEVANCES: true,
    SUBMITTED_TENDERS: true,
    CAMERA_BATCHES: true,
    SECTORS: true,
    DESIGNATIONS: true,
    COURSES: true,
    DISTRICTS: true,
    EOI_CATEGORIES: true,
    PERMISSIONS: true,
    SCHEME_MASTERS: true,
    SCHEME_CATEGORIES: true,
    USER_ROLES: true,
    REMARK_MASTERS: true,
    GRADING_MASTERS: true,
    DOC_MASTERS: true,
    ANNEXURE_MASTERS: true,
    TWO_STEP_VERIFICATION: true,
    DYNAMIC_FORM_BUILDER: true
  }
};

/**
 * Checks whether mock data is active for a given dataKey/resource.
 */
export function isMockEnabled(dataKey?: string): boolean {
  if (!MOCK_CONFIG.globalUseMock) return false;
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
 * mock mode is disabled.
 */
export function resolveMock<T>(data: T[]): T[] {
  return MOCK_CONFIG.globalUseMock ? data : [];
}
