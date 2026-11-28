import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../services/notification.service';
import { toApiError } from '../api-error';
import { SKIP_ERROR_TOAST } from '../http-context';
import { needsSessionRefresh } from '../../auth/session-expiry.util';

/**
 * Turns every failed request into an `ApiError` and shows one toast for it (the same message is not stacked when
 * several requests fail together); 404 and 403 show none. Callers that show their own message pass
 * `flags: { skipErrorToast: true }`.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const apiError = toApiError(error, { method: req.method, url: req.urlWithParams });

      // An expired session is announced once by SessionExpiryService, not once per failed request.
      const sessionExpired = error instanceof HttpErrorResponse && needsSessionRefresh(error.status, error.error);
      // Same message already on screen (the Ref id differs per request): not stacked.
      const shown = notifications.notifications().some(n => n.type === 'error' && n.message.startsWith(apiError.message));
      // "Not found" (404) and "not permitted" (403) are not announced: the screen shows an empty state or hides
      // what the user may not use (a 403 also reloads the permissions, see permissionsSyncInterceptor).
      const silent = apiError.status === 404 || apiError.status === 403;
      if (!req.context.get(SKIP_ERROR_TOAST) && !sessionExpired && !shown && !silent) {
        const reference = apiError.correlationId ? ` (Ref: ${apiError.correlationId})` : '';
        notifications.show({ type: 'error', message: `${apiError.message}${reference}`, unique: true });
      }
      if (!environment.production) {
        console.warn(`[HTTP ${apiError.status}] ${req.method} ${req.urlWithParams}: ${apiError.message}`, apiError);
      }
      return throwError(() => apiError);
    })
  );
};
