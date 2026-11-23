import { describe, it, expect } from 'vitest';
import { needsSessionRefresh } from './session-expiry.util';

describe('needsSessionRefresh', () => {
  it('always refreshes on 401', () => {
    expect(needsSessionRefresh(401, null)).toBe(true);
  });

  it('refreshes when an endpoint reports a missing or expired access token with 400 / 403', () => {
    const switchRole = { success: false, requires2FA: false, message: 'Valid access token is required to switch roles.' };
    expect(needsSessionRefresh(400, switchRole)).toBe(true);
    expect(needsSessionRefresh(400, JSON.stringify(switchRole))).toBe(true);
    expect(needsSessionRefresh(403, { message: 'Your session has expired. Please log in again.' })).toBe(true);
  });

  it('leaves ordinary validation and permission errors alone', () => {
    expect(needsSessionRefresh(400, { message: 'Sector Name is required.' })).toBe(false);
    expect(needsSessionRefresh(400, { message: 'The requested role (ID 2) is not assigned or active for this user.' })).toBe(false);
    expect(needsSessionRefresh(403, { message: 'You do not have permission.' })).toBe(false);
    expect(needsSessionRefresh(500, { message: 'Access token is required' })).toBe(false);
  });
});
