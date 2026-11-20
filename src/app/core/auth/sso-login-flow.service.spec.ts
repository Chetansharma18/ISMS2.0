import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { buildApiUrl } from '../config/api.config';
import { provideApiHttp } from '../http/http.providers';
import { isMockEnabled, setResourceMock } from '../mock/mock.config';
import type { UserPersona } from '../models/user.model';
import { NotificationService } from '../services/notification.service';
import { AuthService } from './auth.service';
import { SsoLoginFlowService } from './sso-login-flow.service';

const RETURN = 'http://localhost/?verifylogin=true';

describe('SsoLoginFlowService', () => {
  let backend: HttpTestingController;
  let flow: SsoLoginFlowService;
  let completeSignIn: ReturnType<typeof vi.fn<(persona: UserPersona) => void>>;
  const authWasMocked = isMockEnabled('AUTH');

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setResourceMock('AUTH', false);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideApiHttp(), provideHttpClientTesting()]
    });
    backend = TestBed.inject(HttpTestingController);
    completeSignIn = vi.fn<(persona: UserPersona) => void>();
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

    backend.expectOne(buildApiUrl('/auth/me')).flush({ id: 5, SSOID: 'RJ.TP', name: 'Company 1', roles: ['Tp'] });

    expect(completeSignIn).toHaveBeenCalledWith(
      expect.objectContaining({ ssoId: 'RJ.TP', label: 'Company 1', role: 'existing_user', isProfileComplete: true })
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
    backend.expectOne(buildApiUrl('/auth/me')).flush({ id: 5, SSOID: 'RJ.TP', roles: ['Tp'] });
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
    twoStep.flush({ success: true });

    backend.expectOne(buildApiUrl('/auth/me')).flush({ id: 9, SSOID: 'RJ.OFFICER', roles: ['superAdmin', 'admin'] });
    expect(completeSignIn).toHaveBeenCalledWith(expect.objectContaining({ role: 'dept_admin', label: 'Scheme OIC' }));
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
