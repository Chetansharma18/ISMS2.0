import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, delay, map, of, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/config/api.config';
import { SSO_USERS } from '../../../core/mock/data/sso-users.mock';
import { isMockEnabled } from '../../../core/mock/mock.config';
import { ApiError } from '../../../core/http/api-error';
import { HttpService } from '../../../core/http/http.service';
import { unwrapData } from '../../../core/http/response-adapter';
import { NotificationService } from '../../../core/services/notification.service';
import type { SsoProfile } from '../models/sso-profile.model';

const normalize = (ssoId: string): string => ssoId.trim().toLowerCase();

/**
 * Looks up a person in the SSO by SSO ID (resource `SSO_DIRECTORY`). Mock mode reads the dummy directory;
 * API mode calls `SSO_DIRECTORY.GET`. Every profile found is cached, so lists can show the details of many people
 * at once with `find()`.
 */
@Injectable({ providedIn: 'root' })
export class SsoDirectoryService {
  private readonly http = inject(HttpService);
  private readonly notifications = inject(NotificationService);
  private readonly cache = signal<ReadonlyMap<string, SsoProfile>>(
    new Map(isMockEnabled('SSO_DIRECTORY') ? SSO_USERS.map(user => [normalize(user.ssoId), user]) : [])
  );

  /** A profile already known (looked up before, or in the mock directory). Reads a signal, so it works in a computed. */
  find(ssoId: string): SsoProfile | undefined {
    return this.cache().get(normalize(ssoId));
  }

  /** The person with this SSO ID, or null when the SSO has no such user. */
  lookup(ssoId: string): Observable<SsoProfile | null> {
    const wanted = normalize(ssoId);
    if (isMockEnabled('SSO_DIRECTORY')) {
      return of(this.find(wanted) ?? null).pipe(delay(400));
    }
    return this.http
      .call<unknown>(API_ENDPOINTS.SSO_DIRECTORY.GET, { id: ssoId.trim(), flags: { skipErrorToast: true } })
      .pipe(
        map(res => (unwrapData(res) as SsoProfile | null) ?? null),
        tap(profile => {
          if (profile) this.cache.update(cache => new Map(cache).set(normalize(profile.ssoId || wanted), profile));
        }),
        // "No such user" is an answer, not a failure; anything else is reported like any failed request.
        catchError(err => {
          if (err instanceof ApiError && err.status === 404) return of(null);
          this.notifications.show({ type: 'error', message: err?.message ?? 'SSO lookup failed.', unique: true });
          return throwError(() => err);
        })
      );
  }
}
