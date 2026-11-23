import { inject } from '@angular/core';
import { CanActivateFn, Route, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { isPublicPath, isSignedInPath } from './open-routes.util';
import { TableAccessService } from './table-access.service';

/**
 * With real sign-in, a screen opens only when the backend permissions allow it, also when the URL is typed in the
 * address bar:
 * - the landing and sign-in pages are open to everyone;
 * - signed out, every other URL goes to the landing page;
 * - signed in, the profile is always open, and any other screen needs GET permission on its backend table
 *   (GET /auth/permissions). Screens without a backend table are closed. A closed URL goes to the user's first
 *   menu screen, or to the profile.
 * Mock sign-in passes everything (the persona menus apply).
 */
export const tableAccessGuard: CanActivateFn = (_route, state) => {
  const access = inject(TableAccessService);
  const auth = inject(AuthService);
  const router = inject(Router);
  const url = state.url;

  if (access.isMock() || isPublicPath(url)) return true;
  if (!auth.currentUser()) return router.parseUrl('/');
  if (isSignedInPath(url)) return true;

  return access.ensureLoaded().pipe(
    map(ok => {
      if (ok && access.canOpenUrl(url)) return true;
      const fallback = access.firstPermittedRoute() ?? '/profile';
      return router.parseUrl(fallback);
    })
  );
};

/** Adds `tableAccessGuard` to every top-level route (guards of a parent also cover its children). */
export function withTableAccessGuard(routes: Route[]): Route[] {
  return routes.map(route =>
    route.redirectTo !== undefined ? route : { ...route, canActivate: [...(route.canActivate ?? []), tableAccessGuard] }
  );
}
