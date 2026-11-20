import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { isApiUrl } from '../config/api.config';
import { SKIP_AUTH } from '../http/http-context';
import { AuthApiService } from './auth-api.service';
import { TokenService } from './token.service';

/**
 * Authentication for API requests:
 * - attaches `Authorization: Bearer <token>` when TokenService holds one (cookie sessions need nothing extra);
 * - on a 401, refreshes the session once (parallel 401s share one refresh) and replays the request;
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
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
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
