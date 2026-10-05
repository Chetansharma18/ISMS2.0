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
    label: 'New User',
    badge: 'First Time User',
    description: 'First time applicant with incomplete OTR profile'
  },
  {
    role: 'existing_user',
    label: 'Existing User',
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
    description: 'System administrator with full access'
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

  /** Flag indicating whether the current department admin session has verified OTP */
  isDeptAdminOtpVerified = signal<boolean>(false);

  constructor() {
    this.initUser();
  }

  private initUser(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          this.currentUser.set(JSON.parse(saved));
        } else {
          this.currentUser.set({
            id: 'Approved Citizen (TP)',
            ssoId: 'Approved Citizen (TP)',
            label: 'Approved Citizen (TP)',
            subLabel: 'Registered TP/PIA',
            role: 'existing_user',
            isProfileComplete: true
          });
        }
      } catch {
        // Fallback gracefully
      }
    }
    if (typeof sessionStorage !== 'undefined') {
      const isVerified = sessionStorage.getItem('isms_dept_admin_otp_verified');
      if (isVerified === 'true') {
        this.isDeptAdminOtpVerified.set(true);
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

  setDeptAdminOtpVerified(verified: boolean): void {
    this.isDeptAdminOtpVerified.set(verified);
    if (typeof sessionStorage !== 'undefined') {
      if (verified) {
        sessionStorage.setItem('isms_dept_admin_otp_verified', 'true');
      } else {
        sessionStorage.removeItem('isms_dept_admin_otp_verified');
      }
    }
  }

  logout(): void {
    this.currentUser.set(null);
    this.setDeptAdminOtpVerified(false);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch { }
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('isms_otr_prompt_dismissed');
    }
    this.router.navigate(['/sso-login']);
  }

  getRoleConfig(role: UserRole): RoleConfig {
    return USER_ROLES.find(r => r.role === role) || USER_ROLES[0];
  }
}
