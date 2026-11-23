import type { AppEnvironment } from './environment.model';

/** Production settings. Swapped in for environment.ts by the `production` build (angular.json fileReplacements). */
export const environment: AppEnvironment = {
  production: true,
  apiUrl: '/api',
  api: {
    clientId: 'web',
    // Mandatory: the backend rejects API requests without x-api-key (MISSING_API_KEY). Must match the server's key.
    apiKey: 'isms-secret-api-key-2026',
    withCredentials: true,
    timeoutMs: 30000
  },
  sso: {
    // Staging SSO until the production RajSSO URL is confirmed.
    loginUrl: 'https://ssotest.rajasthan.gov.in/signin'
  },
  useMockData: false,
  simulatedDelayMs: 0,
  enableMockPersistence: false
};
