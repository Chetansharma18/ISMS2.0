import { describe, it, expect } from 'vitest';
import { isPublicPath, isSignedInPath, pathOf } from './open-routes.util';

describe('open routes', () => {
  it('normalises the path of a URL', () => {
    expect(pathOf('')).toBe('/');
    expect(pathOf('/?verifylogin=true')).toBe('/');
    expect(pathOf('/Profile/#x')).toBe('/profile');
  });

  it('opens the landing and sign-in pages to everyone, and nothing else', () => {
    expect(isPublicPath('/')).toBe(true);
    expect(isPublicPath('/?verifylogin=true&token=x')).toBe(true);
    expect(isPublicPath('/sso-login')).toBe(true);
    expect(isPublicPath('/admin/eoi-configuration')).toBe(false);
    expect(isPublicPath('/tenders')).toBe(false);
  });

  it('opens the profile to every signed-in user', () => {
    expect(isSignedInPath('/profile')).toBe(true);
    expect(isSignedInPath('/profile?tab=security')).toBe(true);
    expect(isSignedInPath('/profiles')).toBe(false);
    expect(isSignedInPath('/admin/user-management')).toBe(false);
  });
});
