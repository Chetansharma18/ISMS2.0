import { Injectable, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../auth/auth.service';

export type AppPermission =
  | 'view_eoi'
  | 'submit_eoi'
  | 'scrutinize_eoi'
  | 'manage_schemes'
  | 'manage_users'
  | 'view_reports'
  | 'manage_system';

const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  new_user: ['view_eoi'],
  existing_user: ['view_eoi', 'submit_eoi'],
  dept_admin: ['view_eoi', 'scrutinize_eoi', 'manage_schemes', 'view_reports'],
  super_admin: [
    'view_eoi',
    'submit_eoi',
    'scrutinize_eoi',
    'manage_schemes',
    'manage_users',
    'view_reports',
    'manage_system'
  ]
};

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private authService = inject(AuthService);

  userRole = computed(() => this.authService.currentUser()?.role);

  userPermissions = computed<AppPermission[]>(() => {
    const role = this.userRole();
    return role ? ROLE_PERMISSIONS[role] || [] : [];
  });

  hasPermission(permission: AppPermission): boolean {
    const role = this.userRole();
    if (!role) return false;
    if (role === 'super_admin') return true;
    return this.userPermissions().includes(permission);
  }

  hasAnyPermission(permissions: AppPermission[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  hasRole(role: UserRole | UserRole[]): boolean {
    const current = this.userRole();
    if (!current) return false;
    if (current === 'super_admin') return true;
    return Array.isArray(role) ? role.includes(current) : current === role;
  }
}
