/** Shape every environment file must follow, so a missing setting is a compile error. */
export interface AppEnvironment {
  production: boolean;
  /** Base URL of the backend API. Relative ('/api') when served behind a proxy or the same host. */
  apiUrl: string;
  api: {
    /** Sent as the `x-client` header on every API request. */
    clientId: string;
    /** Sent as the `x-api-key` header when not empty. Public: it identifies the client, it is not a secret. */
    apiKey: string;
    /** Send cookies (HttpOnly session cookies) with API requests. */
    withCredentials: boolean;
    /** Requests taking longer than this fail with a timeout error. 0 disables the timeout. */
    timeoutMs: number;
  };
  sso: {
    /** RajSSO login page the Login button sends the user to when AUTH is not mocked. */
    loginUrl: string;
  };
  /** Master switch: true = centralized mock store, false = real backend APIs. Per-resource flags live in mock.config.ts. */
  useMockData: boolean;
  /** Simulated network latency for mock calls. */
  simulatedDelayMs: number;
  /** Persist mock modifications in session/local storage. */
  enableMockPersistence: boolean;
}
