import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { API_ENDPOINTS } from '../../core/config/api.config';
import { HttpService } from '../../core/http/http.service';
import { DepartmentUser, toDepartmentUser, toDepartmentUserPage } from './department-user.util';

/** The backend caps a page at 100 records. */
const PAGE_SIZE = 100;
const MAX_PAGES = 100;

/** Backend calls of the Department Users screen (`/api/department-users`). */
@Injectable({ providedIn: 'root' })
export class DepartmentUsersApiService {
  private readonly http = inject(HttpService);

  /** Every department user, page after page. */
  loadAll(): Observable<DepartmentUser[]> {
    const page = (n: number) =>
      this.http
        .call<unknown>(API_ENDPOINTS.DEPARTMENT_USERS.LIST, { params: { page: n, pageSize: PAGE_SIZE } })
        .pipe(map(res => ({ n, ...toDepartmentUserPage(res) })));
    return page(1).pipe(
      expand(r => (r.n < r.totalPages && r.n < MAX_PAGES ? page(r.n + 1) : EMPTY)),
      reduce((all, r) => [...all, ...r.users], [] as DepartmentUser[])
    );
  }

  get(id: number): Observable<DepartmentUser> {
    return this.http.call<unknown>(API_ENDPOINTS.DEPARTMENT_USERS.GET, { id }).pipe(map(toDepartmentUser));
  }

  create(body: Record<string, unknown>): Observable<DepartmentUser> {
    return this.http.call<unknown>(API_ENDPOINTS.DEPARTMENT_USERS.ADD, { body }).pipe(map(toDepartmentUser));
  }

  update(id: number, body: Record<string, unknown>): Observable<DepartmentUser> {
    return this.http.call<unknown>(API_ENDPOINTS.DEPARTMENT_USERS.UPDATE, { id, body }).pipe(map(toDepartmentUser));
  }

  /** Marks the record inactive (the role stays assigned to the portal user; revoke it on User Roles). */
  deactivate(id: number): Observable<DepartmentUser> {
    return this.update(id, { user_activation_statu: false });
  }

  /**
   * Activates (verifies): the SSO ID must exist as a portal user; the backend then assigns the role.
   * `quiet`: no error toast (the caller explains a failed activation itself).
   */
  activate(id: number, quiet = false): Observable<DepartmentUser> {
    return this.http
      .call<unknown>(API_ENDPOINTS.DEPARTMENT_USERS.ACTIVATE, { id, body: {}, flags: quiet ? { skipErrorToast: true } : undefined })
      .pipe(map(toDepartmentUser));
  }

  delete(id: number): Observable<unknown> {
    return this.http.call(API_ENDPOINTS.DEPARTMENT_USERS.DELETE, { id });
  }
}
