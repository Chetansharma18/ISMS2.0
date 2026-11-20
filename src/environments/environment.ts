import type { AppEnvironment } from './environment.model';

/**
 * Development settings, used by `ng serve` and every non-production build.
 * `apiUrl` is relative so requests go through the dev proxy (proxy.conf.json) and stay same-origin.
 */
export const environment: AppEnvironment = {
  production: false,
  apiUrl: '/api',
  api: {
    clientId: 'web',
    // Value of the `x-api-key` header. Leave empty to not send it. Identifies the client only: anything in the
    // browser bundle is public, so it must never be treated as a secret.
    apiKey: 'isms-secret-api-key-2026',
    withCredentials: true,
    timeoutMs: 30000
  },
  sso: {
    loginUrl: 'https://ssotest.rajasthan.gov.in/signin'
  },
  useMockData: false, // Master toggle: true = use centralized mock store, false = call real backend APIs
  simulatedDelayMs: 150, // Simulated network latency for mock calls
  enableMockPersistence: true // Persist mock modifications in session/local storage
};
