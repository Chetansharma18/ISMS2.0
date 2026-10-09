import { Injectable, signal, computed, inject } from '@angular/core';
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
    label: 'Department User',
    badge: 'Department User',
    description: 'Departmental scheme officer and scrutiny incharge'
  },
  {
    role: 'super_admin',
    label: 'Super Admin',
    badge: 'Super Admin',
    description: 'System administrator with full access'
  }
];

/**
 * A role granted to the signed-in user. One user can hold more than one role
 * and switch the active one without signing out. Only the role changes on a
 * switch - the user identity (name / SSO ID) stays the same.
 */
export interface AssignedRole {
  /** Matches the UserRole it activates */
  id: Extract<UserRole, 'dept_admin' | 'super_admin'>;
  /** Label shown in the switcher - role only, no person or designation */
  label: string;
  /** Landing route for the role */
  defaultRoute: string;
}

/**
 * Display identity for each admin role. Used as both the name shown in the
 * header and the SSO ID placeholder - plain role identifiers, no person name.
 */
export const ACCOUNT_LABELS: Record<Extract<UserRole, 'dept_admin' | 'super_admin'>, string> = {
  dept_admin: 'dept_user',
  super_admin: 'super_admin'
};

/** The two roles a dual-role departmental account can switch between. */
export const SWITCHABLE_ROLES: AssignedRole[] = [
  {
    id: 'dept_admin',
    label: 'Department User',
    defaultRoute: '/admin/eoi-view'
  },
  {
    id: 'super_admin',
    label: 'Super Admin',
    defaultRoute: '/admin/eoi-configuration'
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

  /** Roles granted to the signed-in user. Empty when the user holds a single role. */
  readonly assignedRoles = computed<AssignedRole[]>(() => {
    const role = this.currentUser()?.role;
    const holdsBothRoles = role === 'dept_admin' || role === 'super_admin';
    return holdsBothRoles ? SWITCHABLE_ROLES : [];
  });

  /** True when the signed-in user can switch between roles. */
  readonly canSwitchRole = computed<boolean>(() => this.assignedRoles().length > 1);

  /** The currently active role of the signed-in user. */
  readonly activeRole = computed<AssignedRole | null>(() => {
    const role = this.currentUser()?.role;
    return SWITCHABLE_ROLES.find(r => r.id === role) ?? null;
  });

  /** Label of the active role - used wherever the role has to be displayed. */
  readonly activeRoleLabel = computed<string>(() => {
    const user = this.currentUser();
    if (!user) return '';
    return this.activeRole()?.label
      ?? USER_ROLES.find(r => r.role === user.role)?.label
      ?? '';
  });

  constructor() {
    this.initUser();
  }

  private initUser(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed: UserPersona = JSON.parse(saved);
          // Normalize admin personas saved under an older build that stored a
          // person's name/designation instead of a plain role identifier.
          if (parsed.role === 'dept_admin' || parsed.role === 'super_admin') {
            parsed.label = ACCOUNT_LABELS[parsed.role];
            parsed.subLabel = USER_ROLES.find(r => r.role === parsed.role)?.label ?? parsed.subLabel;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed));
          }
          this.currentUser.set(parsed);
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

    let label = ssoId;
    // The sub label always carries the active role, never a designation or name.
    const subLabel = roleConfig.label;

    // Admin roles display a plain role identifier instead of a person name.
    const isPlaceholderId = !identifier.trim() || identifier.trim() === role;
    if ((role === 'dept_admin' || role === 'super_admin') && isPlaceholderId) {
      label = ACCOUNT_LABELS[role];
    }

    const persona: UserPersona = {
      id: ssoId,
      ssoId: ssoId,
      label: label,
      subLabel: subLabel,
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

  /** All roles the signed-in user may switch between. */
  getAssignedRoles(): AssignedRole[] {
    return this.assignedRoles();
  }

  /**
   * Switches the active role of the signed-in user without signing out.
   * The identity is preserved - only the role changes, and with it the
   * permissions, navigation and landing page.
   */
  switchActiveRole(roleId: AssignedRole['id'], navigate = true): void {
    const target = SWITCHABLE_ROLES.find(r => r.id === roleId);
    const user = this.currentUser();
    if (!target || !user || user.role === target.id) return;

    const persona: UserPersona = {
      ...user,
      label: ACCOUNT_LABELS[target.id],
      subLabel: target.label,
      role: target.id,
      isProfileComplete: true
    };

    this.currentUser.set(persona);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(persona));
      } catch { }
    }

    // The session is already authenticated, so returning to the department
    // workspace must not prompt for OTP again.
    this.setDeptAdminOtpVerified(true);

    if (navigate) {
      this.router.navigate([target.defaultRoute]);
    }
  }
}
