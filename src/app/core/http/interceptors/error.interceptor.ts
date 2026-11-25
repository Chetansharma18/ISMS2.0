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
 * several requests fail together). Callers that show their own message pass `flags: { skipErrorToast: true }`.
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
      if (!req.context.get(SKIP_ERROR_TOAST) && !sessionExpired && !shown) {
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
