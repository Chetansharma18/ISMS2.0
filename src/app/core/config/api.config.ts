import { environment } from '../../../environments/environment';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type EndpointUrlResolver = string | ((id: string | number) => string);

export interface EndpointDef {
  url: EndpointUrlResolver;
  method: ApiMethod;
}

// A type alias (not an interface) so it fits the `Record<string, EndpointDef>` check on API_ENDPOINTS.
export type CrudEndpoints = {
  LIST: EndpointDef;
  GET: EndpointDef;
  ADD: EndpointDef;
  UPDATE: EndpointDef;
  DELETE: EndpointDef;
};

export type CrudAction = keyof CrudEndpoints;

// ---- Builders: one line per resource instead of five --------------------------------------------

const endpoint = (method: ApiMethod, url: EndpointUrlResolver): EndpointDef => ({ url, method });
const byId = (base: string) => (id: string | number) => `${base}/${encodeURIComponent(String(id))}`;

/** The five standard REST endpoints of a collection: GET/POST `base`, GET/PUT/DELETE `base/{id}`. */
function crud(base: string): CrudEndpoints {
  return {
    LIST: endpoint('GET', base),
    GET: endpoint('GET', byId(base)),
    ADD: endpoint('POST', base),
    UPDATE: endpoint('PUT', byId(base)),
    DELETE: endpoint('DELETE', byId(base))
  };
}

/** A read-only collection: GET `base` and GET `base/{id}`. */
function readOnly(base: string): Pick<CrudEndpoints, 'LIST' | 'GET'> {
  return { LIST: endpoint('GET', base), GET: endpoint('GET', byId(base)) };
}

/**
 * Centralized API Endpoints Registry: every backend URL the frontend calls, and its HTTP method.
 *
 * - Each top-level key is a "dataKey". `DataEngineService.for(dataKey)` and `createPersistedStore({ dataKey })`
 *   look their CRUD endpoints up here, and `mock.config.ts` has a mock on/off flag with the same key.
 * - Non-CRUD actions (e.g. `SCHEMES.ASSIGN_COMMITTEE`) are called with `HttpService.call(API_ENDPOINTS.X.Y, ...)`.
 * - Paths are relative to `environment.apiUrl`. Never hardcode a URL anywhere else.
 */
export const API_ENDPOINTS = {
  // Authentication & Session
  // RajSSO posts to /auth/verify-sso-token itself (not called by the frontend); the backend then redirects to the
  // frontend with ?verifylogin=true and a login_callback_token cookie, which VERIFY_LOGIN_TOKEN exchanges.
  AUTH: {
    VERIFY_LOGIN_TOKEN: endpoint('POST', '/auth/verify-login-token'),
    SELECT_ROLE: endpoint('POST', '/auth/select-role'),
    /**
     * Switch the signed-in session to another of the user's roles (body `{ roleId, client }`). Answers like select-role:
     * a 2FA challenge when the target role needs it, otherwise a session scoped to the new role.
     * Requires the backend endpoint described in documentation/API_INTEGRATION.md (not in the backend yet).
     */
    SWITCH_ROLE: endpoint('POST', '/auth/switch-role'),
    TWO_STEP_SEND_OTP: endpoint('POST', '/auth/two-step/send-otp'),
    TWO_STEP_VERIFY: endpoint('POST', '/auth/two-step/verify'),
    /**
     * Sets up a second factor: `?type=pin` (or mobile / auth-app). Works with a signed-in session (profile), or during
     * sign-in with the `setupToken` the 2FA challenge returns when no allowed method is set up yet.
     */
    TWO_STEP_SET: endpoint('POST', '/auth/two-step/set'),
    REFRESH_TOKEN: endpoint('POST', '/auth/refresh-token'),
    SESSION: endpoint('GET', '/auth/me'),
    CHECK: endpoint('GET', '/auth/check'),
    PERMISSIONS: endpoint('GET', '/auth/permissions'),
    KEEP_ALIVE: endpoint('POST', '/auth/sso/keep-alive'),
    LOGOUT: endpoint('POST', '/auth/logout'),
    /**
     * Back to SSO (RajSSO spec 2.6): opened as a full-page navigation, not called over HTTP. The backend answers with
     * a page that posts the user's SSO token to the RajSSO portal. The ISMS session stays signed in.
     */
    BACK_TO_SSO: endpoint('GET', '/auth/backtosso')
  },

  // One Time Registration (OTR) of the signed-in organisation. FORM returns the steps and their fields (plus any
  // FormManager fields attached to a step); each step is its own record, saved with PUT and checked by the backend
  // (400 with the failing field names). Needs the OtrRegistrations permission.
  OTR: {
    FORM: endpoint('GET', '/otr/form'),
    /** Organisation details (step 1); empty until saved. Its `status` is the registration status. */
    ME: endpoint('GET', '/otr/me'),
    SAVE_ORGANISATION: endpoint('PUT', '/otr/me/organisation'),
    AUTHORIZED_PERSON: endpoint('GET', '/otr/me/authorized-person'),
    SAVE_AUTHORIZED_PERSON: endpoint('PUT', '/otr/me/authorized-person'),
    BANK_DETAILS: endpoint('GET', '/otr/me/bank-details'),
    SAVE_BANK_DETAILS: endpoint('PUT', '/otr/me/bank-details'),
    UPDATE_LOGS: endpoint('GET', '/otr/me/update-logs'),
    /** multipart/form-data with the file in a part named "file"; id = document type (pan-card, cancelled-cheque ...). */
    UPLOAD_DOCUMENT: endpoint('POST', byId('/otr/me/documents')),
    DELETE_DOCUMENT: endpoint('DELETE', byId('/otr/me/documents')),
    DOCUMENT: endpoint('GET', byId('/otr/me/documents')),
    /** Body: `{ declarationAccepted }`. */
    SUBMIT: endpoint('POST', '/otr/me/submit')
  },

  // Schemes & Tenders
  SCHEMES: {
    ...crud('/schemes'),
    ASSIGN_COMMITTEE: endpoint('POST', (id: string | number) => `/schemes/${id}/committee`)
  },

  // Expression of Interest submissions & scrutiny
  EOI: {
    ...crud('/eoi/submissions'),
    SCRUTINY_DETAIL: endpoint('GET', byId('/eoi/scrutiny')),
    UPDATE_SCRUTINY: endpoint('PUT', byId('/eoi/scrutiny'))
  },
  /** Schemes as the EOI scrutiny / sanction workflow sees them */
  EOI_SCHEMES: readOnly('/eoi/schemes'),
  /** Applicant responses under department scrutiny */
  EOI_RESPONSES: crud('/eoi/responses'),
  /** Sanction order document of each scheme (id = schemeId), draft or released */
  SANCTION_DOCUMENTS: crud('/eoi/sanction-documents'),
  /** IPA document of each application (id = `${schemeId}__${appId}`), draft, released and issued copies */
  IPA_DOCUMENTS: crud('/eoi/ipa-documents'),
  /** Applicant EOI submissions shown on Tender Status */
  SUBMITTED_TENDERS: crud('/eoi/submitted-tenders'),
  /** Department sanction orders */
  SANCTION_ORDERS: crud('/sanction-orders'),
  /** Sanction orders that sanction the signed-in training partner */
  TP_SANCTION_ORDERS: readOnly('/tp/sanction-orders'),
  /** Signed MoU documents */
  MOU_DOCUMENTS: crud('/mou/documents'),

  // In-Principle Approvals
  IPA: crud('/ipa/items'),
  /** IPAs issued to the signed-in training partner */
  TP_IPAS: readOnly('/tp/ipas'),
  /** IPA allowance tied to the SDCs registered for it */
  IPA_ALLOCATIONS: crud('/ipa/allocations'),

  // Users
  USERS: crud('/users'),
  /** GET /users/sso/{ssoId}: the portal user with this SSO ID (with roles), 404 when there is none. */
  USER_BY_SSO: { GET: endpoint('GET', (ssoId: string | number) => `/users/sso/${encodeURIComponent(String(ssoId))}`) },
  /** Department users: SSO ID mapped to a role, designation, schemes, districts and blocks (activated separately). */
  DEPARTMENT_USERS: {
    ...crud('/department-users'),
    /** POST: checks the SSO ID exists as a portal user, assigns the role and marks the record active. */
    ACTIVATE: endpoint('POST', (id: string | number) => `/department-users/${encodeURIComponent(String(id))}/activate`)
  },
  /** SSO directory lookup by SSO ID */
  SSO_DIRECTORY: readOnly('/sso/users'),

  // Skill Development Centres, batches, aspirants
  SDC: crud('/sdc/centres'),
  BATCHES: crud('/batches'),
  CAMERA_BATCHES: crud('/camera/batches'),
  ASPIRANTS: crud('/aspirants'),
  /** Aspirants who expressed interest on the aspirant portal */
  EXPRESSED_INTEREST: readOnly('/aspirants/expressed-interest'),
  /** Aspirants registered with the Employment Department (filtered by `sector` / `district` query params) */
  EMPLOYMENT_DEPT_RECORDS: readOnly('/aspirants/employment-dept'),
  /** Training calendar shown on the aspirant portal */
  TRAINING_CALENDAR: readOnly('/aspirants/training-calendar'),

  // Attendance
  ATTENDANCE_MARKS: crud('/attendance/marks'),
  ATTENDANCE_DEVICES: crud('/attendance/devices'),
  ATTENDANCE_NOTICES: crud('/attendance/notices'),
  /** DoITC biometric device registry */
  DOITC_DEVICES: readOnly('/attendance/doitc-devices'),

  // Payments
  PAYMENTS: crud('/payments/transactions'),

  // Portal notifications (bell icon)
  NOTIFICATIONS: {
    LIST: endpoint('GET', '/notifications'),
    MARK_READ: endpoint('PUT', (id: string | number) => `/notifications/${encodeURIComponent(String(id))}/read`),
    MARK_ALL_READ: endpoint('POST', '/notifications/read-all')
  },

  // Grievance redressal
  GRIEVANCES: crud('/grievances'),
  ADMIN_GRIEVANCES: crud('/admin/grievances'),

  // Masters
  MASTERS: crud('/master'),
  SECTORS: crud('/master/sectors'),
  DESIGNATIONS: crud('/master/designations'),
  COURSES: crud('/master/courses'),
  /** District & Block screen rows: blocks (`{ id, districtId, name, code, isActive }`); create/update by district name or code. */
  DISTRICTS: crud('/master/district-blocks'),
  /** Districts on their own (`{ id, name, code, state, isActive }`): names for the block rows, dropdowns. */
  DISTRICT_MASTERS: crud('/master/districts'),
  /** Document Master (`{ id, documentName, applicableSchemes: [{ id, schemeName }], allowedExtensions, ... }`). */
  DOC_MASTERS: crud('/master/doc-masters'),
  /** Annexure Master (`{ id, annexureName, applicableSchemes: [{ id, schemeName }], allowedExtensions, ... }`). */
  ANNEXURE_MASTERS: crud('/master/annexures'),
  /** Distinct departments of the designations (string[]). */
  DESIGNATION_DEPARTMENTS: { LIST: endpoint('GET', '/master/designations/departments') },
  /** Remark types for the dropdown (defaults + any stored ones, string[]). */
  REMARK_TYPES: { LIST: endpoint('GET', '/master/remarks/types') },
  EOI_CATEGORIES: crud('/master/eoi-categories'),
  PERMISSIONS: crud('/permissions'),
  SCHEME_MASTERS: crud('/master/schemes'),
  SCHEME_CATEGORIES: crud('/master/scheme-categories'),
  /** Roles: `{ id, name, description, isActive, userCount, permissions[] }` (see core/models/role.normalizer). */
  USER_ROLES: crud('/roles'),
  /** Table permissions of one role (backend RolePermissions, managed through the role). */
  ROLE_PERMISSIONS: {
    /** GET /roles/{roleId}/permissions */
    LIST: endpoint('GET', (roleId: string | number) => `/roles/${encodeURIComponent(String(roleId))}/permissions`),
    /** POST /roles/{roleId}/permissions `{ permissions: [...] }`: adds or updates by table, keeps the others. */
    ASSIGN: endpoint('POST', (roleId: string | number) => `/roles/${encodeURIComponent(String(roleId))}/permissions`),
    /** DELETE /roles/{roleId}/permissions/{permissionId}; call with the id `${roleId}/${permissionId}`. */
    REMOVE: endpoint('DELETE', (key: string | number) => {
      const [roleId, permissionId] = String(key).split('/');
      return `/roles/${encodeURIComponent(roleId)}/permissions/${encodeURIComponent(permissionId ?? '')}`;
    })
  },
  /** Users holding a role (backend UserRoles, managed through the role; users are identified by email). */
  ROLE_USERS: {
    /** GET /roles/{roleId}/users */
    LIST: endpoint('GET', (roleId: string | number) => `/roles/${encodeURIComponent(String(roleId))}/users`),
    /** POST /roles/{roleId}/users `{ email }` */
    ASSIGN: endpoint('POST', (roleId: string | number) => `/roles/${encodeURIComponent(String(roleId))}/users`),
    /** DELETE /roles/{roleId}/users/{email}; call with the id `${roleId}/${email}`. */
    REVOKE: endpoint('DELETE', (key: string | number) => {
      const value = String(key);
      const slash = value.indexOf('/');
      return `/roles/${encodeURIComponent(value.slice(0, slash))}/users/${encodeURIComponent(value.slice(slash + 1))}`;
    })
  },
  /** Every backend table a permission can be granted on: `{ id, tableName, description, tableCategoryId }`. */
  TABLE_LIST: {
    LIST: endpoint('GET', '/tablelist'),
    CATEGORIES: endpoint('GET', '/tablelist/categories')
  },
  REMARK_MASTERS: crud('/master/remarks'),
  GRADING_MASTERS: crud('/master/gradings'),

  // Administration
  TWO_STEP_VERIFICATION: crud('/admin/two-step-verification'),
  DYNAMIC_FORM_BUILDER: crud('/admin/dynamic-form-builder'),

  // File uploads & downloads
  FILES: {
    UPLOAD: endpoint('POST', '/files/upload'),
    DOWNLOAD: endpoint('GET', (id: string | number) => `/files/${encodeURIComponent(String(id))}/download`)
  }
} satisfies Record<string, Record<string, EndpointDef>>;

export type ApiDataKey = keyof typeof API_ENDPOINTS;

/** Base URL of the API without a trailing slash. */
export function apiBaseUrl(): string {
  return environment.apiUrl.replace(/\/+$/, '');
}

/** Resolves full API URL with environment base URL. */
export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl()}${cleanPath}`;
}

/** Resolves a URL (relative or absolute) against the page origin, or null when it is not a valid URL. */
function resolveUrl(url: string): URL | null {
  const origin =
    typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'http://localhost';
  try {
    return new URL(url, `${origin}/`);
  } catch {
    return null;
  }
}

/**
 * True when the URL points at our backend API, in any form: `/api/x`, `api/x`, `http://<this host>/api/x`, or the
 * absolute `environment.apiUrl`; the path is compared case-insensitively. API-only headers are added to these.
 */
export function isApiUrl(url: string): boolean {
  const target = resolveUrl(url);
  const base = resolveUrl(apiBaseUrl());
  if (!target || !base) return false;
  if (target.origin.toLowerCase() !== base.origin.toLowerCase()) return false;
  const basePath = base.pathname.replace(/\/+$/, '').toLowerCase();
  const path = target.pathname.toLowerCase();
  return basePath === '' || path === basePath || path.startsWith(`${basePath}/`);
}

/**
 * The headers the backend requires on every API request (`x-client`, `x-api-key`). The HTTP interceptor adds them to
 * every HttpClient call; code that cannot use HttpClient (a `fetch` for a file) must pass these itself.
 */
export function apiClientHeaders(): Record<string, string> {
  const { clientId, apiKey } = environment.api;
  const headers: Record<string, string> = {};
  if (clientId) headers['x-client'] = clientId;
  if (apiKey) headers['x-api-key'] = apiKey;
  return headers;
}

/** Resolves dynamic endpoint URL from string or callback function. */
export function resolveEndpointUrl(urlOrFn: EndpointUrlResolver, id?: string | number): string {
  if (typeof urlOrFn === 'function') {
    if (id === undefined) {
      throw new Error('ID is required to resolve parameterized endpoint URL');
    }
    return urlOrFn(id);
  }
  return urlOrFn;
}

/** The EndpointDef for a dataKey and CRUD action, or null when the resource has no such endpoint. */
export function getEndpointForDataKey(
  dataKey: string,
  action: CrudAction = 'LIST',
  _id?: string | number
): EndpointDef | null {
  const resource = (API_ENDPOINTS as Record<string, Record<string, EndpointDef> | undefined>)[dataKey];
  if (!resource) return null;
  return resource[action] || null;
}
