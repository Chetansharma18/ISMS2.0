import { environment } from '../../../environments/environment';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type EndpointUrlResolver = string | ((id: string | number) => string);

export interface EndpointDef {
  url: EndpointUrlResolver;
  method: ApiMethod;
}

export interface CrudEndpoints {
  LIST: EndpointDef;
  GET?: EndpointDef;
  ADD: EndpointDef;
  UPDATE: EndpointDef;
  DELETE: EndpointDef;
}

/**
 * Centralized API Endpoints Registry
 * Describes all backend API resources, their URLs, and HTTP methods across the application.
 */
export const API_ENDPOINTS = {
  // Authentication & Session
  AUTH: {
    SSO_LOGIN: { url: '/auth/sso-login', method: 'POST' as ApiMethod },
    LOGOUT: { url: '/auth/logout', method: 'POST' as ApiMethod },
    SESSION: { url: '/auth/session', method: 'GET' as ApiMethod },
    REFRESH_TOKEN: { url: '/auth/refresh', method: 'POST' as ApiMethod }
  },

  // One Time Registration (OTR)
  REGISTRATION: {
    OTR_SAVE: { url: '/registration/otr/save', method: 'POST' as ApiMethod },
    OTR_SUBMIT: { url: '/registration/otr/submit', method: 'POST' as ApiMethod },
    OTR_DETAILS: { url: '/registration/otr', method: 'GET' as ApiMethod },
    VERIFY_AADHAAR: { url: '/registration/verify-aadhaar', method: 'POST' as ApiMethod },
    VERIFY_PAN: { url: '/registration/verify-pan', method: 'POST' as ApiMethod }
  },

  // Schemes & Tenders Management (DataKey: 'SCHEMES')
  SCHEMES: {
    LIST: { url: '/schemes', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/schemes/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/schemes', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/schemes/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/schemes/${id}`, method: 'DELETE' as ApiMethod },
    ASSIGN_COMMITTEE: { url: (id: string | number) => `/schemes/${id}/committee`, method: 'POST' as ApiMethod }
  },

  // Expression of Interest Submissions & Scrutiny (DataKey: 'EOI')
  EOI: {
    LIST: { url: '/eoi/submissions', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/eoi/submissions/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/eoi/submissions', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/eoi/submissions/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/eoi/submissions/${id}`, method: 'DELETE' as ApiMethod },
    SCRUTINY_DETAIL: { url: (id: string | number) => `/eoi/scrutiny/${id}`, method: 'GET' as ApiMethod },
    UPDATE_SCRUTINY: { url: (id: string | number) => `/eoi/scrutiny/${id}`, method: 'PUT' as ApiMethod }
  },

  // User Management & Roles (DataKey: 'USERS')
  USERS: {
    LIST: { url: '/users', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/users/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/users', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/users/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/users/${id}`, method: 'DELETE' as ApiMethod }
  },

  // Skill Development Centres (DataKey: 'SDC')
  SDC: {
    LIST: { url: '/sdc/centres', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/sdc/centres/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/sdc/centres', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/sdc/centres/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/sdc/centres/${id}`, method: 'DELETE' as ApiMethod }
  },

  // Batches (DataKey: 'BATCHES')
  BATCHES: {
    LIST: { url: '/batches', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/batches/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/batches', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/batches/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/batches/${id}`, method: 'DELETE' as ApiMethod }
  },

  // Aspirants / Candidates (DataKey: 'ASPIRANTS')
  ASPIRANTS: {
    LIST: { url: '/aspirants', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/aspirants/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/aspirants', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/aspirants/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/aspirants/${id}`, method: 'DELETE' as ApiMethod }
  },

  // Initial Project Approvals / Verification (DataKey: 'IPA')
  IPA: {
    LIST: { url: '/ipa/items', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/ipa/items/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/ipa/items', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/ipa/items/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/ipa/items/${id}`, method: 'DELETE' as ApiMethod }
  },

  // Masters (DataKey: 'MASTERS')
  MASTERS: {
    LIST: { url: '/masters', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/masters/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/masters', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/${id}`, method: 'DELETE' as ApiMethod }
  },

  // Admin Master Lookup Tables (DataKeys used by MasterCrudPageComponent)
  SECTORS: {
    LIST: { url: '/masters/sectors', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/sectors', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/sectors/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/sectors/${id}`, method: 'DELETE' as ApiMethod }
  },
  DESIGNATIONS: {
    LIST: { url: '/masters/designations', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/designations', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/designations/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/designations/${id}`, method: 'DELETE' as ApiMethod }
  },
  COURSES: {
    LIST: { url: '/masters/courses', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/courses', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/courses/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/courses/${id}`, method: 'DELETE' as ApiMethod }
  },
  DISTRICTS: {
    LIST: { url: '/masters/district-blocks', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/district-blocks', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/district-blocks/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/district-blocks/${id}`, method: 'DELETE' as ApiMethod }
  },
  EOI_CATEGORIES: {
    LIST: { url: '/masters/eoi-categories', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/eoi-categories', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/eoi-categories/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/eoi-categories/${id}`, method: 'DELETE' as ApiMethod }
  },
  PERMISSIONS: {
    LIST: { url: '/masters/permissions', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/permissions', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/permissions/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/permissions/${id}`, method: 'DELETE' as ApiMethod }
  },
  SCHEME_MASTERS: {
    LIST: { url: '/masters/schemes', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/schemes', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/schemes/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/schemes/${id}`, method: 'DELETE' as ApiMethod }
  },
  SCHEME_CATEGORIES: {
    LIST: { url: '/masters/scheme-categories', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/scheme-categories', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/scheme-categories/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/scheme-categories/${id}`, method: 'DELETE' as ApiMethod }
  },
  USER_ROLES: {
    LIST: { url: '/masters/user-roles', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/user-roles', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/user-roles/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/user-roles/${id}`, method: 'DELETE' as ApiMethod }
  },
  REMARK_MASTERS: {
    LIST: { url: '/masters/remarks', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/remarks', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/remarks/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/remarks/${id}`, method: 'DELETE' as ApiMethod }
  },
  GRADING_MASTERS: {
    LIST: { url: '/masters/gradings', method: 'GET' as ApiMethod },
    ADD: { url: '/masters/gradings', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/masters/gradings/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/masters/gradings/${id}`, method: 'DELETE' as ApiMethod }
  },

  // Grievance Redressal (DataKey: 'GRIEVANCES')
  GRIEVANCES: {
    LIST: { url: '/grievances', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/grievances/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/grievances', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/grievances/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/grievances/${id}`, method: 'DELETE' as ApiMethod }
  },

  // Admin grievance desk (DataKey: 'ADMIN_GRIEVANCES')
  ADMIN_GRIEVANCES: {
    LIST: { url: '/admin/grievances', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/admin/grievances/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/admin/grievances', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/admin/grievances/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/admin/grievances/${id}`, method: 'DELETE' as ApiMethod }
  },

  // Applicant EOI submissions shown on Tender Status (DataKey: 'SUBMITTED_TENDERS')
  SUBMITTED_TENDERS: {
    LIST: { url: '/eoi/submitted-tenders', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/eoi/submitted-tenders/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/eoi/submitted-tenders', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/eoi/submitted-tenders/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/eoi/submitted-tenders/${id}`, method: 'DELETE' as ApiMethod }
  },

  // Camera / CCTV batch list (DataKey: 'CAMERA_BATCHES')
  CAMERA_BATCHES: {
    LIST: { url: '/camera/batches', method: 'GET' as ApiMethod },
    GET: { url: (id: string | number) => `/camera/batches/${id}`, method: 'GET' as ApiMethod },
    ADD: { url: '/camera/batches', method: 'POST' as ApiMethod },
    UPDATE: { url: (id: string | number) => `/camera/batches/${id}`, method: 'PUT' as ApiMethod },
    DELETE: { url: (id: string | number) => `/camera/batches/${id}`, method: 'DELETE' as ApiMethod }
  },

  // File Uploads & Downloads
  FILES: {
    UPLOAD: { url: '/files/upload', method: 'POST' as ApiMethod },
    DOWNLOAD: { url: (id: string | number) => `/files/${id}/download`, method: 'GET' as ApiMethod }
  }
};

/**
 * Resolves full API URL with environment base URL
 */
export function buildApiUrl(path: string): string {
  const base = environment.apiUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Resolves dynamic endpoint URL from string or callback function
 */
export function resolveEndpointUrl(urlOrFn: EndpointUrlResolver, id?: string | number): string {
  if (typeof urlOrFn === 'function') {
    if (id === undefined) {
      throw new Error('ID is required to resolve parameterized endpoint URL');
    }
    return urlOrFn(id);
  }
  return urlOrFn;
}

/**
 * Returns the EndpointDef for a given dataKey and CRUD action.
 * Modeled after the GeoTree Admin architecture getEndpointForDataKey.
 */
export function getEndpointForDataKey(
  dataKey: string,
  action: 'LIST' | 'GET' | 'ADD' | 'UPDATE' | 'DELETE' = 'LIST',
  _id?: string | number
): EndpointDef | null {
  const resource = (API_ENDPOINTS as Record<string, any>)[dataKey];
  if (!resource) return null;
  return resource[action] || null;
}
