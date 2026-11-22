import { inject } from '@angular/core';
import { CanActivateFn, Route, Router } from '@angular/router';
import { map } from 'rxjs';
import { TableAccessService } from './table-access.service';

/**
 * Blocks screens of backend tables the user has no GET permission on (from GET /auth/permissions) and sends the
 * user to their first permitted screen, or to the profile. URLs not tied to a table pass; mock sign-in passes.
 */
export const tableAccessGuard: CanActivateFn = (_route, state) => {
  const access = inject(TableAccessService);
  const router = inject(Router);
  if (access.isMock() || !access.governingRoute(state.url)) return true;

  return access.ensureLoaded().pipe(
    map(ok => {
      if (ok && access.canOpenUrl(state.url)) return true;
      return router.parseUrl(access.firstPermittedRoute() ?? '/profile');
    })
  );
};

/** Adds `tableAccessGuard` to every top-level route (guards of a parent also cover its children). */
export function withTableAccessGuard(routes: Route[]): Route[] {
  return routes.map(route =>
    route.redirectTo !== undefined ? route : { ...route, canActivate: [...(route.canActivate ?? []), tableAccessGuard] }
  );
}
