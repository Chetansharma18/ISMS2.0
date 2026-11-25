import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, UrlTree, provideRouter, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, isObservable, of, type Observable } from 'rxjs';
import { provideApiHttp } from '../http/http.providers';
import { isMockEnabled, setResourceMock } from '../mock/mock.config';
import type { UserPersona } from '../models/user.model';
import { AuthService } from '../auth/auth.service';
import { tableAccessGuard } from './table-access.guard';
import { TableAccessService } from './table-access.service';
import { toPermittedTablesState } from './permitted-tables.util';

const PERMISSIONS = {
  categories: [{ id: 3, category: 'Master Data' }],
  tables: [{ tableName: 'SectorMasters', tableCategoryId: 3, allowedMethods: ['GET'], enableInMenu: true }]
};

describe('tableAccessGuard (real sign-in)', () => {
  const authWasMocked = isMockEnabled('AUTH');

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setResourceMock('AUTH', false);
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideApiHttp(), provideHttpClientTesting()] });
    const access = TestBed.inject(TableAccessService);
    access.ensureLoaded = () => of(true);
    (access as unknown as { state: { set(v: unknown): void } }).state.set(toPermittedTablesState(PERMISSIONS));
  });

  afterEach(() => setResourceMock('AUTH', authWasMocked));

  const signIn = () =>
    TestBed.inject(AuthService).currentUser.set({ id: 'u1', ssoId: 'RJ.ADMIN', role: 'super_admin', label: 'Admin' } as UserPersona);

  async function visit(url: string): Promise<true | string> {
    const result = TestBed.runInInjectionContext(() =>
      tableAccessGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
    ) as boolean | UrlTree | Observable<boolean | UrlTree>;
    const value = isObservable(result) ? await firstValueFrom(result) : result;
    return value === true ? true : TestBed.inject(Router).serializeUrl(value as UrlTree);
  }

  it('sends a signed-out visitor of any inner URL to the landing page', async () => {
    expect(await visit('/')).toBe(true);
    expect(await visit('/sso-login')).toBe(true);
    expect(await visit('/admin/master/sector')).toBe('/');
    expect(await visit('/profile')).toBe('/');
  });

  it('opens only permitted screens and the profile to a signed-in user', async () => {
    signIn();
    expect(await visit('/profile')).toBe(true);
    expect(await visit('/admin/master/sector')).toBe(true);
    // Permission missing, or a screen without a backend table: back to the first menu screen.
    expect(await visit('/admin/master/course')).toBe('/admin/master/sector');
    expect(await visit('/admin/eoi-configuration')).toBe('/admin/master/sector');
    expect(await visit('/module/AuditLogs')).toBe('/admin/master/sector');
  });
});
