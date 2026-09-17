import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedRoles = route.data?.['roles'] as Array<string>;
  
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  
  if (!expectedRoles || expectedRoles.length === 0 || authService.hasRole(expectedRoles)) {
    return true;
  }
  
  return router.createUrlTree(['/unauthorized']); // Or redirect to dashboard
};
