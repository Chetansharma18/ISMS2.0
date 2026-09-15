import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }
  return router.parseUrl('/auth/login');
};

export const adminPermissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AdminAuthService);
  const requiredModule = route.data?.['module'] as string;
  const requiredAction = (route.data?.['action'] as string) || 'view';

  if (!requiredModule) return true;
  return authService.hasPermission(requiredModule, requiredAction);
};
