import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth.service';

/**
 * Ensures user is authenticated before accessing the route.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }

  router.navigate(['/sso-login']);
  return false;
};

/**
 * Factory guard for checking specific required roles on a route.
 */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUser();

    if (!user) {
      router.navigate(['/sso-login']);
      return false;
    }

    if (allowedRoles.includes(user.role) || user.role === 'super_admin') {
      return true;
    }

    // Redirect to default home/dashboard if unauthorized
    router.navigate(['/']);
    return false;
  };
};

/**
 * Convenience guard for department admin / super admin routes.
 */
export const adminGuard: CanActivateFn = roleGuard(['dept_admin', 'super_admin']);
