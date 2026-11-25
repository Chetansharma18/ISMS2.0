import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS, buildApiUrl } from '../../config/api.config';
import { TokenService } from '../../auth/token.service';
import { AuthService, UserPersona } from '../../auth/auth.service';
import { SESSION_EXPIRED_MESSAGE } from '../../auth/session-expiry.service';
import { NotificationService } from '../../services/notification.service';
import { ApiError } from '../api-error';
import { provideApiHttp } from '../http.providers';
import { HttpService } from '../http.service';
import { LoadingService } from '../loading.service';

describe('API interceptor chain', () => {
  let http: HttpService;
  let backend: HttpTestingController;
  let notifications: NotificationService;
  const savedApi = { ...environment.api };

  beforeEach(() => {
    localStorage.clear();
    environment.api.apiKey = 'test-key';
    environment.api.clientId = 'web';
    environment.api.withCredentials = true;
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideApiHttp(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpService);
    backend = TestBed.inject(HttpTestingController);
    notifications = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    backend.verify();
    Object.assign(environment.api, savedApi);
  });

  it('adds the client headers and cookies to API calls only', async () => {
    const api = firstValueFrom(http.call(API_ENDPOINTS.SECTORS.LIST, { params: { page: 1, search: '' } }));
    const req = backend.expectOne(r => r.url === buildApiUrl('/master/sectors'));
    expect(req.request.headers.get('x-client')).toBe('web');
    expect(req.request.headers.get('x-api-key')).toBe('test-key');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.has('search')).toBe(false);
    req.flush([]);
    await api;

    const other = firstValueFrom(TestBed.inject(HttpClient).get('https://example.com/file.json'));
    const ext = backend.expectOne('https://example.com/file.json');
    expect(ext.request.headers.has('x-api-key')).toBe(false);
    expect(ext.request.withCredentials).toBe(false);
    ext.flush({});
    await other;
  });

  it('adds x-api-key and x-client to every form of backend URL, also from raw HttpClient calls', async () => {
    const client = TestBed.inject(HttpClient);
    const urls = ['/api/anything', 'api/no-leading-slash', `${window.location.origin}/api/absolute`, '/API/upper-case'];
    for (const url of urls) {
      const call = firstValueFrom(client.get(url));
      const req = backend.expectOne(url);
      expect(req.request.headers.get('x-api-key'), url).toBe('test-key');
      expect(req.request.headers.get('x-client'), url).toBe('web');
      req.flush({});
      await call;
    }
  });

  it('keeps headers a caller set itself', async () => {
    const call = firstValueFrom(TestBed.inject(HttpClient).get('/api/x', { headers: { 'x-client': 'mobile' } }));
    const req = backend.expectOne('/api/x');
    expect(req.request.headers.get('x-client')).toBe('mobile');
    expect(req.request.headers.get('x-api-key')).toBe('test-key');
    req.flush({});
    await call;
  });

  it('sends the bearer token when one is stored', async () => {
    TestBed.inject(TokenService).setAccessToken('abc');
    const done = firstValueFrom(http.call(API_ENDPOINTS.USERS.GET, { id: 7 }));
    const req = backend.expectOne(buildApiUrl('/users/7'));
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush({ id: 7 });
    expect(await done).toEqual({ id: 7 });
  });

  it('turns failures into ApiError and shows one toast for repeated messages', async () => {
    const first = firstValueFrom(http.call(API_ENDPOINTS.SECTORS.ADD, { body: {} }));
    const second = firstValueFrom(http.call(API_ENDPOINTS.SECTORS.ADD, { body: {} }));
    const reqs = backend.match(buildApiUrl('/master/sectors'));
    reqs.forEach(r => r.flush({ message: 'Sector Name is required.' }, { status: 400, statusText: 'Bad Request' }));

    await expect(first).rejects.toBeInstanceOf(ApiError);
    await expect(second).rejects.toMatchObject({ status: 400, message: 'Sector Name is required.' });
    expect(notifications.notifications().filter(n => n.type === 'error')).toHaveLength(1);
  });

  it('does not toast when the caller asks it not to', async () => {
    const call = firstValueFrom(http.call(API_ENDPOINTS.SECTORS.LIST, { flags: { skipErrorToast: true } }));
    backend.expectOne(buildApiUrl('/master/sectors')).flush(null, { status: 500, statusText: 'Error' });
    await expect(call).rejects.toMatchObject({ status: 500 });
    expect(notifications.notifications()).toHaveLength(0);
  });

  it('refreshes once on 401 and replays the request', async () => {
    const call = firstValueFrom(http.call<{ ok: boolean }>(API_ENDPOINTS.USERS.LIST));
    backend.expectOne(buildApiUrl('/users')).flush(null, { status: 401, statusText: 'Unauthorized' });

    const refresh = backend.expectOne(buildApiUrl('/auth/refresh-token'));
    expect(refresh.request.headers.has('Authorization')).toBe(false);
    refresh.flush({ accessToken: 'fresh' });

    const replay = backend.expectOne(buildApiUrl('/users'));
    expect(replay.request.headers.get('Authorization')).toBe('Bearer fresh');
    replay.flush({ ok: true });

    expect(await call).toEqual({ ok: true });
  });

  it('refreshes and replays when an endpoint answers 400 "access token is required" (expired session)', async () => {
    const call = firstValueFrom(http.call<{ success: boolean }>(API_ENDPOINTS.AUTH.SWITCH_ROLE, { body: { roleId: 2 } }));
    backend
      .expectOne(buildApiUrl('/auth/switch-role'))
      .flush(
        { success: false, requires2FA: false, message: 'Valid access token is required to switch roles.' },
        { status: 400, statusText: 'Bad Request' }
      );

    backend.expectOne(buildApiUrl('/auth/refresh-token')).flush({ success: true });

    const replay = backend.expectOne(buildApiUrl('/auth/switch-role'));
    expect(replay.request.body).toEqual({ roleId: 2 });
    replay.flush({ success: true });
    expect(await call).toEqual({ success: true });
  });

  it('does not refresh on an ordinary 400', async () => {
    const call = firstValueFrom(http.call(API_ENDPOINTS.SECTORS.ADD, { body: {}, flags: { skipErrorToast: true } }));
    backend.expectOne(buildApiUrl('/master/sectors')).flush({ message: 'Sector Name is required.' }, { status: 400, statusText: 'Bad Request' });
    await expect(call).rejects.toMatchObject({ status: 400 });
    backend.expectNone(buildApiUrl('/auth/refresh-token'));
  });

  it('signs out once, home, with one message, when the refresh fails for several requests', async () => {
    const router = TestBed.inject(Router);
    const navigated: unknown[] = [];
    router.navigate = ((commands: unknown[]) => {
      navigated.push(commands);
      return Promise.resolve(true);
    }) as Router['navigate'];
    const auth = TestBed.inject(AuthService);
    auth.currentUser.set({ id: 'u1', ssoId: 'committee.member.1', role: 'dept_admin' } as unknown as UserPersona);
    TestBed.inject(TokenService).setAccessToken('stale');

    const first = firstValueFrom(http.call(API_ENDPOINTS.USERS.LIST));
    const second = firstValueFrom(http.call(API_ENDPOINTS.SECTORS.LIST));
    backend.expectOne(buildApiUrl('/users')).flush(null, { status: 401, statusText: 'Unauthorized', headers: { 'X-Correlation-ID': 'a' } });
    backend.expectOne(buildApiUrl('/master/sectors')).flush(null, { status: 401, statusText: 'Unauthorized', headers: { 'X-Correlation-ID': 'b' } });
    backend.expectOne(buildApiUrl('/auth/refresh-token')).flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(first).rejects.toMatchObject({ status: 401 });
    await expect(second).rejects.toMatchObject({ status: 401 });
    expect(TestBed.inject(TokenService).getAccessToken()).toBeNull();
    expect(auth.currentUser()).toBeNull();
    // Home (Login there opens RajSSO), never the mock persona picker; once, not per request.
    expect(navigated).toEqual([['/']]);
    expect(notifications.notifications().filter(n => n.type === 'error')).toHaveLength(0);
    expect(notifications.notifications().filter(n => n.type === 'warning').map(n => n.message)).toEqual([SESSION_EXPIRED_MESSAGE]);
  });

  it('does not stack the same error when only the Ref id differs', async () => {
    const first = firstValueFrom(http.call(API_ENDPOINTS.SECTORS.ADD, { body: {} }));
    const second = firstValueFrom(http.call(API_ENDPOINTS.SECTORS.ADD, { body: {} }));
    const reqs = backend.match(buildApiUrl('/master/sectors'));
    reqs.forEach((r, i) =>
      r.flush({ message: 'Server error.' }, { status: 500, statusText: 'Error', headers: { 'X-Correlation-ID': `ref-${i}` } })
    );
    await expect(first).rejects.toBeInstanceOf(ApiError);
    await expect(second).rejects.toBeInstanceOf(ApiError);
    expect(notifications.notifications().filter(n => n.type === 'error')).toHaveLength(1);
  });

  it('counts requests in flight', async () => {
    const loading = TestBed.inject(LoadingService);
    const call = firstValueFrom(http.call(API_ENDPOINTS.SECTORS.LIST));
    expect(loading.isLoading()).toBe(true);
    backend.expectOne(buildApiUrl('/master/sectors')).flush([]);
    await call;
    expect(loading.isLoading()).toBe(false);
  });
});
