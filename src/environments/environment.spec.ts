import { describe, it, expect } from 'vitest';
import { environment as dev } from './environment';
import { environment as prod } from './environment.prod';

/** The backend rejects any API request without x-api-key / x-client, so no build may ship without them. */
describe('environment files', () => {
  for (const [name, env] of [['environment.ts', dev], ['environment.prod.ts', prod]] as const) {
    it(`${name} sets the mandatory API client headers`, () => {
      expect(env.api.apiKey.trim()).not.toBe('');
      expect(env.api.clientId.trim()).not.toBe('');
    });
  }
});
