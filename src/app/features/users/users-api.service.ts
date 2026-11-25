import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, catchError, expand, map, of, reduce, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../core/config/api.config';
import { HttpService } from '../../core/http/http.service';
import { PortalUser, toPortalUser, toUserPage } from '../../core/models/portal-user.normalizer';

/** The backend caps a page at 100 users. */
const PAGE_SIZE = 100;
/** Safety stop: at most this many pages (10,000 users) are read for one list. */
const MAX_PAGES = 100;

/** Backend calls of the Users and User Roles screens. */
@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpService);

  /** Every user with their roles: GET /api/users, page after page until the last one. */
  loadAll(): Observable<PortalUser[]> {
    const page = (n: number) =>
      this.http
        .call<unknown>(API_ENDPOINTS.USERS.LIST, { params: { page: n, pageSize: PAGE_SIZE, sortBy: 'name' } })
        .pipe(map(res => ({ n, ...toUserPage(res) })));

    return page(1).pipe(
      expand(result => (result.n < result.totalPages && result.n < MAX_PAGES ? page(result.n + 1) : EMPTY)),
      reduce((all, result) => [...all, ...result.users], [] as PortalUser[])
    );
  }

  /**
   * The portal user with this SSO ID (GET /api/users/sso/{ssoId}), or null when there is none (404: the SSO ID has
   * never signed in). Other failures error. Not toasted: the caller shows the result inline.
   */
  findBySsoId(ssoId: string): Observable<PortalUser | null> {
    const id = ssoId.trim();
    if (!id) return of(null);
    return this.http
      .call<unknown>(API_ENDPOINTS.USER_BY_SSO.GET, { id, flags: { skipErrorToast: true, skipLoading: true } })
      .pipe(
        map(res => toPortalUser(res)),
        // Only the backend's own answer ("User with SSO ID '...' was not found.") means no such user. A bare 404
        // (e.g. a backend without this endpoint) is an error, so it is not shown as "user does not exist".
        catchError((err: { status?: number; message?: string }) =>
          err?.status === 404 && /sso id/i.test(err.message ?? '') ? of(null) : throwError(() => err)
        )
      );
  }

  /** One user with all details: GET /api/users/{id}. */
  get(id: number): Observable<PortalUser> {
    return this.http.call<unknown>(API_ENDPOINTS.USERS.GET, { id }).pipe(map(toPortalUser));
  }

  /** Gives the user the role: POST /api/roles/{roleId}/users `{ email }`. */
  assignRole(roleId: number, email: string): Observable<unknown> {
    return this.http.call(API_ENDPOINTS.ROLE_USERS.ASSIGN, { id: roleId, body: { email } });
  }

  /** Takes the role away: DELETE /api/roles/{roleId}/users/{email}. */
  revokeRole(roleId: number, email: string): Observable<unknown> {
    return this.http.call(API_ENDPOINTS.ROLE_USERS.REVOKE, { id: `${roleId}/${email}` });
  }
}
