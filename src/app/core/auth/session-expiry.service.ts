import { Injectable, Injector, inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { AuthService } from './auth.service';

export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

/**
 * Ends the portal session once when the backend session can no longer be refreshed. Several requests usually fail
 * together, so only the first one signs the user out and shows the message; the rest are ignored for a few seconds.
 *
 * The user lands on the home page, whose Login button opens RajSSO (real sign-in) or the persona picker (mock sign-in).
 * AuthService is looked up only when needed: it makes HTTP calls itself, so injecting it into the interceptor chain
 * eagerly would be circular.
 */
@Injectable({ providedIn: 'root' })
export class SessionExpiryService {
  private readonly injector = inject(Injector);
  private readonly notifications = inject(NotificationService);
  private handling = false;

  expire(): void {
    if (this.handling) return;
    this.handling = true;
    setTimeout(() => (this.handling = false), 5000);
    const auth = this.injector.get(AuthService);
    // Signed out already (e.g. a public page probing the session): nothing to end, no message.
    if (!auth.currentUser()) return;
    auth.endSessionLocally();
    this.notifications.show({ type: 'warning', message: SESSION_EXPIRED_MESSAGE, unique: true });
  }
}
