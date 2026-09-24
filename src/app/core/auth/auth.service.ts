import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'new_user' | 'existing_user' | 'dept_admin' | 'super_admin';

export interface UserPersona {
  id: string;
  ssoId: string;
  label: string;
  subLabel: string;
  role: UserRole;
  isProfileComplete?: boolean;
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  badge: string;
  description: string;
}

export const USER_ROLES: RoleConfig[] = [
  {
    role: 'new_user',
    label: 'New Applicant',
    badge: 'First Time User',
    description: 'First time applicant with incomplete OTR profile'
  },
  {
    role: 'existing_user',
    label: 'Existing Partner',
    badge: 'Registered TP/PIA',
    description: 'Registered agency with verified  profile'
  },
  {
    role: 'dept_admin',
    label: 'Department Admin',
    badge: 'Officer Portal',
    description: 'Departmental scheme officer and scrutiny incharge'
  },
  {
    role: 'super_admin',
    label: 'Super Admin',
    badge: 'System Admin',
    description: 'State system master manager and portal controller'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private readonly STORAGE_KEY = 'isms_user';

  /** Controls visibility of the theme-based SSO redirecting modal */
  isRedirecting = signal<boolean>(false);

  /** Active logged in user persona */
  currentUser = signal<UserPersona | null>(null);

  constructor() {
    this.initUser();
  }

  private initUser(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          this.currentUser.set(JSON.parse(saved));
        }
      } catch {
        // Fallback gracefully
      }
    }
  }

  triggerSsoRedirect(): void {
    this.isRedirecting.set(true);
  }

  closeSsoRedirect(): void {
    this.isRedirecting.set(false);
  }

  proceedToSsoLogin(): void {
    this.isRedirecting.set(false);
    this.router.navigate(['/sso-login']);
  }

  login(persona: UserPersona, redirectUrl: string | null = '/registration'): void {
    this.currentUser.set(persona);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(persona));
      } catch { }
    }
    if (redirectUrl) {
      this.router.navigate([redirectUrl]);
    }
  }

  loginWithCredentials(
    identifier: string,
    role: UserRole = 'new_user',
    redirectUrl: string | null = '/registration'
  ): void {
    const ssoId = identifier.trim() || 'new_user';
    const roleConfig = USER_ROLES.find(r => r.role === role) || USER_ROLES[0];

    const persona: UserPersona = {
      id: ssoId,
      ssoId: ssoId,
      label: ssoId,
      subLabel: roleConfig.label,
      role: role,
      isProfileComplete: role !== 'new_user'
    };
    this.login(persona, redirectUrl);
  }

  logout(): void {
    this.currentUser.set(null);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch { }
    }
    this.router.navigate(['/']);
  }

  getRoleConfig(role: UserRole): RoleConfig {
    return USER_ROLES.find(r => r.role === role) || USER_ROLES[0];
  }
}
