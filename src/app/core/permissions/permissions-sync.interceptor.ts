import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { isApiUrl } from '../config/api.config';
import { PERMISSIONS_VERSION_HEADER, isPermissionsRequestUrl } from './permissions-cache.util';
import { TableAccessService } from './table-access.service';

/**
 * Keeps the cached table permissions in step with the backend without calling GET /auth/permissions on every reload:
 * - a response whose `X-Permissions-Version` header differs from the cached version reloads them;
 * - a 403 from the API reloads them (the role may have lost access).
 * Registered last, so it sees the raw responses before errorInterceptor converts failures.
 */
export const permissionsSyncInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiUrl(req.url)) return next(req);

  const access = inject(TableAccessService);
  const fromPermissions = isPermissionsRequestUrl(req.url);

  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse) {
          access.noteVersion(event.headers.get(PERMISSIONS_VERSION_HEADER), fromPermissions);
        }
      },
      error: (error: unknown) => {
        if (!(error instanceof HttpErrorResponse)) return;
        const version = error.headers?.get(PERMISSIONS_VERSION_HEADER) ?? null;
        if (version) access.noteVersion(version, fromPermissions);
        if (error.status === 403 && !fromPermissions) access.noteForbidden();
      }
    })
  );
};
