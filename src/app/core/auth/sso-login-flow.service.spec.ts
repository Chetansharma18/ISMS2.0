import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { buildApiUrl } from '../config/api.config';
import { provideApiHttp } from '../http/http.providers';
import { isMockEnabled, setResourceMock } from '../mock/mock.config';
import type { UserPersona } from '../models/user.model';
import type { BackendUser } from './auth-api.models';
import { NotificationService } from '../services/notification.service';
import { AuthService } from './auth.service';
import { SsoLoginFlowService } from './sso-login-flow.service';

const RETURN = 'http://localhost/?verifylogin=true';

describe('SsoLoginFlowService', () => {
  let backend: HttpTestingController;
  let flow: SsoLoginFlowService;
  let completeSignIn: ReturnType<typeof vi.fn<(persona: UserPersona, details?: BackendUser | null, redirectTo?: string) => void>>;
  const authWasMocked = isMockEnabled('AUTH');

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setResourceMock('AUTH', false);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideApiHttp(), provideHttpClientTesting()]
    });
    backend = TestBed.inject(HttpTestingController);
    completeSignIn = vi.fn<(persona: UserPersona, details?: BackendUser | null, redirectTo?: string) => void>();
    TestBed.inject(AuthService).completeSignIn = completeSignIn;
    flow = TestBed.inject(SsoLoginFlowService);
  });

  afterEach(() => {
    backend.verify();
    setResourceMock('AUTH', authWasMocked);
  });

  const expectPost = (path: string) => backend.expectOne(r => r.method === 'POST' && r.url === buildApiUrl(path));

  it('ignores addresses that are not an SSO return', () => {
    expect(flow.handleReturn('http://localhost/tenders')).toBe(false);
    expect(flow.step()).toBe('idle');
  });

  it('signs in straight away when no extra step is needed', () => {
    expect(flow.handleReturn(RETURN)).toBe(true);
    expect(flow.step()).toBe('verifying');

    const verify = expectPost('/auth/verify-login-token');
    expect(verify.request.body).toEqual({ client: 'web' });
    expect(verify.request.withCredentials).toBe(true);
    verify.flush({ verified: true, user: { id: 5, SSOID: 'RJ.TP', name: 'Company 1', roles: [{ id: 3, name: 'Tp' }] } });

    backend.expectNone(buildApiUrl('/auth/me'));

    expect(completeSignIn).toHaveBeenCalledWith(
      expect.objectContaining({ ssoId: 'RJ.TP', label: 'Company 1', role: 'existing_user', isProfileComplete: true }),
      expect.objectContaining({ SSOID: 'RJ.TP', name: 'Company 1' })
    );
    expect(flow.step()).toBe('idle');
  });

  it('sends a token given in the return URL and removes it from the address bar', () => {
    const replace = vi.spyOn(history, 'replaceState');
    flow.handleReturn('http://localhost/?verifylogin=true&token=abc.def.ghi');

    const verify = expectPost('/auth/verify-login-token');
    expect(verify.request.body).toEqual({ token: 'abc.def.ghi', client: 'web' });
    expect(String(replace.mock.calls.at(-1)?.[2])).toBe('/');
    verify.flush({ verified: true, user: { id: 5, SSOID: 'RJ.TP', roles: [{ id: 3, name: 'Tp' }] } });
    backend.expectNone(buildApiUrl('/auth/me'));
    expect(completeSignIn).toHaveBeenCalled();
    replace.mockRestore();
  });

  it('walks through role choice and OTP before opening the session', () => {
    flow.handleReturn(RETURN);
    expectPost('/auth/verify-login-token').flush({
      verified: true,
      requiresRoleSelection: true,
      user: { id: 9, SSOID: 'RJ.OFFICER', name: 'Scheme OIC', roles: [{ id: 1, name: 'superAdmin' }, { id: 2, name: 'admin' }] }
    });
    expect(flow.step()).toBe('select-role');
    expect(flow.roles().map(r => r.name)).toEqual(['superAdmin', 'admin']);

    flow.chooseRole(2);
    const select = expectPost('/auth/select-role');
    expect(select.request.body).toEqual({ roleId: 2, client: 'web' });
    select.flush({ success: true, requires2FA: true, allowedMethods: ['OTP'], selectedRoleId: 2 });
    expect(flow.step()).toBe('two-step');
    expect(flow.methods()).toEqual(['OTP']);

    flow.sendOtp();
    expectPost('/auth/two-step/send-otp').flush({ success: true });
    expect(flow.otpSent()).toBe(true);

    flow.verify('OTP', '000000');
    expectPost('/auth/two-step/verify').flush({ success: false, message: 'Invalid OTP.' }, { status: 401, statusText: 'Unauthorized' });
    expect(flow.step()).toBe('two-step');
    expect(flow.error()).toBe('Invalid OTP.');

    flow.verify('OTP', '123456');
    const twoStep = expectPost('/auth/two-step/verify');
    expect(twoStep.request.body).toEqual({ method: 'OTP', code: '123456', client: 'web' });
    // two-step/verify sends the full user with roles as plain names; the chosen role (admin) must still win.
    twoStep.flush({ success: true, user: { id: 9, SSOID: 'RJ.OFFICER', name: 'Scheme OIC', roles: ['superAdmin', 'admin'] } });

    backend.expectNone(buildApiUrl('/auth/me'));
    expect(completeSignIn).toHaveBeenCalledWith(expect.objectContaining({ role: 'dept_admin', label: 'Scheme OIC' }), expect.objectContaining({ SSOID: 'RJ.OFFICER' }));
  });

  it('keeps the chosen role with the role-scoped responses of the updated backend', () => {
    flow.handleReturn(RETURN);
    expectPost('/auth/verify-login-token').flush({
      verified: true,
      requiresRoleSelection: true,
      user: { id: 9, SSOID: 'RJ.OFFICER', name: 'Scheme OIC', roles: [{ id: 1, name: 'superAdmin' }, { id: 2, name: 'admin' }] }
    });

    flow.chooseRole(2);
    // select-role and two-step/verify now return only the chosen role, plus selectedRoleId.
    expectPost('/auth/select-role').flush({
      success: true,
      requires2FA: true,
      allowedMethods: ['OTP'],
      selectedRoleId: 2,
      user: { id: 9, SSOID: 'RJ.OFFICER', name: 'Scheme OIC', roles: [{ id: 2, name: 'admin' }] }
    });
    flow.verify('OTP', '123456');
    expectPost('/auth/two-step/verify').flush({
      success: true,
      selectedRoleId: 2,
      user: { id: 9, SSOID: 'RJ.OFFICER', name: 'Scheme OIC', roles: [{ id: 2, name: 'admin' }] }
    });

    expect(completeSignIn).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'dept_admin' }),
      expect.objectContaining({ roles: [{ id: 2, name: 'admin' }] })
    );
  });

  it('switches the session to another role, asking for 2FA when that role needs it', () => {
    const auth = TestBed.inject(AuthService);
    auth.setSessionRoles([{ id: 1, name: 'superAdmin' }, { id: 2, name: 'admin' }], 1);
    auth.userDetails.set({ id: 9, SSOID: 'RJ.OFFICER', name: 'Scheme OIC', roles: [{ id: 1, name: 'superAdmin' }] });

    flow.switchRole(1); // already active -> nothing happens
    backend.expectNone(buildApiUrl('/auth/switch-role'));

    flow.switchRole(2);
    expect(flow.step()).toBe('switching');
    expect(flow.switchTargetName()).toBe('admin');
    const sw = expectPost('/auth/switch-role');
    expect(sw.request.body).toEqual({ roleId: 2, client: 'web' });
    // The backend ends the old session and hands back a fresh login token scoped to the new role.
    sw.flush({ success: true, requires2FA: false, selectedRoleId: 2, loginCallbackToken: 'switch.token' });

    // The sign-in steps after RajSSO run again with that token (no RajSSO round trip).
    const verify = expectPost('/auth/verify-login-token');
    expect(verify.request.body).toEqual({ token: 'switch.token', client: 'web' });
    verify.flush({
      verified: true,
      requires2FA: true,
      allowedMethods: ['OTP'],
      selectedRoleId: 2,
      user: { id: 9, SSOID: 'RJ.OFFICER', name: 'Scheme OIC', roles: [{ id: 1, name: 'superAdmin' }, { id: 2, name: 'admin' }] }
    });
    expect(flow.step()).toBe('two-step');

    flow.verify('OTP', '123456');
    expectPost('/auth/two-step/verify').flush({
      success: true,
      selectedRoleId: 2,
      user: { id: 9, SSOID: 'RJ.OFFICER', name: 'Scheme OIC', roles: [{ id: 2, name: 'admin' }] }
    });

    expect(completeSignIn).toHaveBeenCalledWith(expect.objectContaining({ role: 'dept_admin', subLabel: 'Admin' }), expect.anything());
    expect(auth.sessionRoles()).toEqual({ roles: [{ id: 1, name: 'superAdmin' }, { id: 2, name: 'admin' }], activeRoleId: 2 });
  });

  it('opens the new role at once when it needs no 2FA', () => {
    const auth = TestBed.inject(AuthService);
    auth.setSessionRoles([{ id: 1, name: 'superAdmin' }, { id: 2, name: 'admin' }], 1);
    flow.switchRole(2);
    expectPost('/auth/switch-role').flush({ success: true, selectedRoleId: 2, loginCallbackToken: 'switch.token' });
    expectPost('/auth/verify-login-token').flush({
      verified: true,
      selectedRoleId: 2,
      user: { id: 9, SSOID: 'RJ.OFFICER', name: 'Scheme OIC', roles: [{ id: 2, name: 'admin' }] }
    });
    expect(completeSignIn).toHaveBeenCalledWith(expect.objectContaining({ role: 'dept_admin' }), expect.anything());
    expect(auth.sessionRoles().activeRoleId).toBe(2);
    expect(flow.step()).toBe('idle');
  });

  it('keeps the current session when switch-role is refused', () => {
    const auth = TestBed.inject(AuthService);
    const endSession = vi.spyOn(auth, 'endSessionLocally').mockImplementation(() => {});
    auth.setSessionRoles([{ id: 1, name: 'superAdmin' }, { id: 2, name: 'admin' }], 1);
    flow.switchRole(2);
    expectPost('/auth/switch-role').flush(
      { success: false, message: 'The requested role (ID 2) is not assigned or active for this user.' },
      { status: 400, statusText: 'Bad Request' }
    );
    backend.expectNone(buildApiUrl('/auth/verify-login-token'));
    expect(endSession).not.toHaveBeenCalled();
    expect(flow.step()).toBe('idle');
    expect(TestBed.inject(NotificationService).notifications().some(n => n.message.includes('not assigned'))).toBe(true);
  });

  it('signs out of the portal when the 2FA of the new role is cancelled (the old session has ended)', () => {
    const auth = TestBed.inject(AuthService);
    const endSession = vi.spyOn(auth, 'endSessionLocally').mockImplementation(() => {});
    auth.setSessionRoles([{ id: 1, name: 'superAdmin' }, { id: 2, name: 'admin' }], 1);
    flow.switchRole(2);
    expectPost('/auth/switch-role').flush({ success: true, selectedRoleId: 2, loginCallbackToken: 'switch.token' });
    expectPost('/auth/verify-login-token').flush({ verified: true, requires2FA: true, allowedMethods: ['OTP'], selectedRoleId: 2 });
    expect(flow.step()).toBe('two-step');

    flow.cancel();
    expect(endSession).toHaveBeenCalledTimes(1);
    expect(flow.step()).toBe('idle');
    expect(flow.switchTargetName()).toBeNull();
    expect(completeSignIn).not.toHaveBeenCalled();
  });

  it('signs out of the portal when the new login token is rejected', () => {
    const auth = TestBed.inject(AuthService);
    const endSession = vi.spyOn(auth, 'endSessionLocally').mockImplementation(() => {});
    auth.setSessionRoles([{ id: 1, name: 'superAdmin' }, { id: 2, name: 'admin' }], 1);
    flow.switchRole(2);
    expectPost('/auth/switch-role').flush({ success: true, selectedRoleId: 2, loginCallbackToken: 'switch.token' });
    expectPost('/auth/verify-login-token').flush(
      { verified: false, message: 'Invalid or expired login token. Please sign in again.' },
      { status: 400, statusText: 'Bad Request' }
    );
    expect(endSession).toHaveBeenCalledTimes(1);
    expect(flow.step()).toBe('idle');
  });

  it('explains when the backend has no switch-role endpoint yet', () => {
    const auth = TestBed.inject(AuthService);
    auth.setSessionRoles([{ id: 1, name: 'superAdmin' }, { id: 2, name: 'admin' }], 1);
    flow.switchRole(2);
    expectPost('/auth/switch-role').flush(null, { status: 404, statusText: 'Not Found' });
    expect(flow.step()).toBe('idle');
    expect(TestBed.inject(NotificationService).notifications().some(n => n.message.startsWith('Role switching is not available'))).toBe(true);
    expect(completeSignIn).not.toHaveBeenCalled();
  });

  it('lets a user with nothing set up set a PIN with the setup token, then signs in with it', () => {
    flow.handleReturn(RETURN);
    expectPost('/auth/verify-login-token').flush({
      verified: true,
      requires2FA: true,
      allowedMethods: ['PIN'],
      selectedRoleId: 3,
      twoStepStatus: { pin: { allowed: true, isSet: false, details: 'Not configured' } },
      setupToken: 'setup.jwt',
      user: { id: 5, SSOID: 'RJ.TP', name: 'Company 1', roles: [{ id: 3, name: 'Tp' }] }
    });
    expect(flow.pinSet()).toBe(false);
    expect(flow.canSetPinNow()).toBe(true);

    flow.setupPinAndSignIn('4812');
    const set = backend.expectOne(r => r.method === 'POST' && r.url === buildApiUrl('/auth/two-step/set'));
    expect(set.request.params.get('type')).toBe('pin');
    expect(set.request.body).toEqual({ pin: '4812', setupToken: 'setup.jwt' });
    set.flush({ success: true, type: 'pin', message: 'Security PIN configured successfully.' });

    const verify = expectPost('/auth/two-step/verify');
    expect(verify.request.body).toEqual({ method: 'PIN', code: '4812', client: 'web' });
    verify.flush({ success: true });
    expect(completeSignIn).toHaveBeenCalledWith(expect.objectContaining({ role: 'existing_user' }), expect.anything());
  });

  it('Forgot PIN signs in with OTP and opens the profile', () => {
    flow.handleReturn(RETURN);
    expectPost('/auth/verify-login-token').flush({
      verified: true,
      requires2FA: true,
      allowedMethods: ['OTP', 'PIN'],
      twoStepStatus: { pin: { allowed: true, isSet: true }, mobile: { allowed: true, isSet: true, details: '******3210' } },
      user: { id: 5, SSOID: 'RJ.TP', roles: [{ id: 3, name: 'Tp' }] }
    });
    expect(flow.canSetPinNow()).toBe(false);
    expect(flow.otpDestination()).toBe('******3210');

    expect(flow.forgotPin()).toBe(true);
    flow.verify('OTP', '123456');
    expectPost('/auth/two-step/verify').flush({ success: true });
    expect(completeSignIn).toHaveBeenCalledWith(expect.anything(), expect.anything(), '/profile');
  });

  it('reports a failed SSO return and a rejected login token', () => {
    const notifications = TestBed.inject(NotificationService);

    flow.handleReturn('http://localhost/?verifylogin=false&message=Token%20not%20valid');
    expect(notifications.notifications().some(n => n.message === 'Token not valid')).toBe(true);
    expect(flow.step()).toBe('idle');

    flow.handleReturn(RETURN);
    expectPost('/auth/verify-login-token').flush(
      { verified: false, message: 'Login token cookie is missing or expired. Please sign in again.' },
      { status: 400, statusText: 'Bad Request' }
    );
    expect(flow.step()).toBe('idle');
    expect(notifications.notifications().some(n => n.message.startsWith('Login token cookie is missing'))).toBe(true);
    expect(completeSignIn).not.toHaveBeenCalled();
  });
});
