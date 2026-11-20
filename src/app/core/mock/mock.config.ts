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
    AUTH: true,
    ADMIN_GRIEVANCES: true,
    SUBMITTED_TENDERS: true,
    CAMERA_BATCHES: true,
    SECTORS: false,
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
    TWO_STEP_VERIFICATION: true,
    DYNAMIC_FORM_BUILDER: true,
    EOI_SCHEMES: true,
    EOI_RESPONSES: true,
    SANCTION_DOCUMENTS: true,
    IPA_DOCUMENTS: true,
    SANCTION_ORDERS: true,
    TP_SANCTION_ORDERS: true,
    MOU_DOCUMENTS: true,
    TP_IPAS: true,
    IPA_ALLOCATIONS: true,
    SSO_DIRECTORY: true,
    EXPRESSED_INTEREST: true,
    EMPLOYMENT_DEPT_RECORDS: true,
    TRAINING_CALENDAR: true,
    ATTENDANCE_MARKS: true,
    ATTENDANCE_DEVICES: true,
    ATTENDANCE_NOTICES: true,
    DOITC_DEVICES: true,
    PAYMENTS: true,
    NOTIFICATIONS: true
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
 * Marks an array as mock seed data. It no longer empties the data when mock mode is off: every reader
 * (MockDatabaseService, PersistedStore) checks `isMockEnabled(dataKey)` when it reads, so the seed is never shown
 * for a resource served by the API, and a resource can be switched at runtime or in tests.
 */
export function resolveMock<T>(data: T[]): T[] {
  return data;
}
