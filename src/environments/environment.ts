export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api',
  useMockData: true, // Master toggle: true = use centralized mock store, false = call real backend APIs
  simulatedDelayMs: 150, // Simulated network latency for mock calls
  enableMockPersistence: true // Persist mock modifications in session/local storage
};
