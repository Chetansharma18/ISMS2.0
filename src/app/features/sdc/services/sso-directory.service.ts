import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { SSO_USERS, SsoProfile } from '../../../core/mock/data/sso-users.mock';

/**
 * Looks up a person in the SSO by SSO ID. It reads a dummy directory for now and answers after a short delay,
 * like a real call would; swap the body for the SSO request when it is available.
 */
@Injectable({ providedIn: 'root' })
export class SsoDirectoryService {
  /** The same lookup without the delay, for lists that show details of many people at once. */
  find(ssoId: string): SsoProfile | undefined {
    const wanted = ssoId.trim().toLowerCase();
    return SSO_USERS.find(user => user.ssoId.toLowerCase() === wanted);
  }

  /** The person with this SSO ID, or null when the SSO has no such user. */
  lookup(ssoId: string): Observable<SsoProfile | null> {
    const wanted = ssoId.trim().toLowerCase();
    return of(SSO_USERS.find(user => user.ssoId.toLowerCase() === wanted) ?? null).pipe(delay(400));
  }
}
