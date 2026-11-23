import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { isApiUrl } from '../config/api.config';
import { SKIP_AUTH } from '../http/http-context';
import { AuthApiService } from './auth-api.service';
import { needsSessionRefresh } from './session-expiry.util';
import { TokenService } from './token.service';

/**
 * Authentication for API requests:
 * - attaches `Authorization: Bearer <token>` when TokenService holds one (cookie sessions need nothing extra);
 * - on a 401 (or a 400/403 saying the access token is missing or expired, see session-expiry.util), refreshes the
 *   session once (parallel failures share one refresh) and replays the request;
 * - when the refresh fails, clears the token and sends the user to the sign-in page.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiUrl(req.url) || req.context.get(SKIP_AUTH)) return next(req);

  const tokens = inject(TokenService);
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  const withToken = (request: HttpRequest<unknown>): HttpRequest<unknown> => {
    const token = tokens.getAccessToken();
    return token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  };

  return next(withToken(req)).pipe(
    catchError((error: unknown) => {
      // 401, or an endpoint that checks the session itself and answers 400/403 "access token is required".
      if (!(error instanceof HttpErrorResponse) || !needsSessionRefresh(error.status, error.error)) {
        return throwError(() => error);
      }
      // Mid role switch the old session is gone on purpose and the new one is being opened: no refresh, no redirect.
      if (authApi.sessionPaused) {
        return throwError(() => error);
      }
      return authApi.refreshOnce().pipe(
        catchError(() => {
          tokens.clear();
          void router.navigate(['/sso-login']);
          return throwError(() => error);
        }),
        switchMap(() => next(withToken(req)))
      );
    })
  );
};
