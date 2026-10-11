import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PermissionService } from './permission.service';
import { AuthService } from '../auth/auth.service';
import { UserPersona } from '../models/user.model';
import { UserRole } from '../models/role.model';

function persona(role: UserRole): UserPersona {
  return { id: 'u1', ssoId: 'u1', label: 'User', subLabel: role, role };
}

describe('PermissionService', () => {
  const currentUser = signal<UserPersona | null>(null);
  let service: PermissionService;

  beforeEach(() => {
    currentUser.set(null);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { currentUser } }]
    });
    service = TestBed.inject(PermissionService);
  });

  it('denies everything when nobody is signed in', () => {
    expect(service.userRole()).toBeUndefined();
    expect(service.hasRole('super_admin')).toBe(false);
    expect(service.hasPermission('view_eoi')).toBe(false);
    expect(service.userPermissions()).toEqual([]);
  });

  it('matches a single role or any of a list', () => {
    currentUser.set(persona('dept_admin'));
    expect(service.hasRole('dept_admin')).toBe(true);
    expect(service.hasRole('super_admin')).toBe(false);
    expect(service.hasRole(['super_admin', 'dept_admin'])).toBe(true);
    expect(service.hasRole(['new_user', 'existing_user'])).toBe(false);
  });

  it('reacts when the active role switches', () => {
    currentUser.set(persona('dept_admin'));
    expect(service.hasPermission('manage_users')).toBe(false);
    currentUser.set(persona('super_admin'));
    expect(service.hasPermission('manage_users')).toBe(true);
  });

  it('gives new users read-only access and existing users the ability to submit', () => {
    currentUser.set(persona('new_user'));
    expect(service.hasPermission('view_eoi')).toBe(true);
    expect(service.hasPermission('submit_eoi')).toBe(false);

    currentUser.set(persona('existing_user'));
    expect(service.hasPermission('submit_eoi')).toBe(true);
  });

  it('hasAnyPermission is true when at least one permission is held', () => {
    currentUser.set(persona('dept_admin'));
    expect(service.hasAnyPermission(['manage_system', 'scrutinize_eoi'])).toBe(true);
    expect(service.hasAnyPermission(['manage_system', 'manage_users'])).toBe(false);
  });
});
