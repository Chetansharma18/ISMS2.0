export const API_ENDPOINTS = {
  AUTH: {
    SSO_LOGIN: '/api/auth/sso-login',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
    REFRESH_TOKEN: '/api/auth/refresh'
  },
  REGISTRATION: {
    OTR_SAVE: '/api/registration/otr/save',
    OTR_SUBMIT: '/api/registration/otr/submit',
    OTR_DETAILS: '/api/registration/otr',
    VERIFY_AADHAAR: '/api/registration/verify-aadhaar',
    VERIFY_PAN: '/api/registration/verify-pan'
  },
  EOI: {
    LIST_ACTIVE: '/api/eoi/active',
    DETAIL: (id: string) => `/api/eoi/${id}`,
    SUBMISSIONS: (schemeId?: string) => schemeId ? `/api/eoi/submissions?schemeId=${schemeId}` : '/api/eoi/submissions',
    SUBMIT_PROPOSAL: '/api/eoi/proposals',
    SCRUTINY_DETAIL: (appId: string) => `/api/eoi/scrutiny/${appId}`,
    UPDATE_SCRUTINY: (appId: string) => `/api/eoi/scrutiny/${appId}`
  },
  FILES: {
    UPLOAD: '/api/files/upload',
    DOWNLOAD: (fileId: string) => `/api/files/${fileId}/download`
  }
};
