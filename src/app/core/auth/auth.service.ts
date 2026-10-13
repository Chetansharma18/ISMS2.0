import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole, RoleConfig } from '../models/role.model';
import { UserPersona } from '../models/user.model';
import { StorageService } from '../services/storage.service';

// Canonical definitions live in core/models. Re-exported here so existing
// `import { UserRole } from '.../auth.service'` call sites keep working.
export type { UserRole, RoleConfig } from '../models/role.model';
export type { UserPersona } from '../models/user.model';

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

export const ASPIRANT_ROLE_CONFIG: RoleConfig = {
  role: 'aspirant',
  label: 'Aspirant',
  badge: 'Aspirant',
  description: 'Aspirant candidate looking for skill training programs'
};

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
  private storage = inject(StorageService);
  private readonly STORAGE_KEY = 'isms_user';
  private readonly OTP_VERIFIED_KEY = 'isms_dept_admin_otp_verified';
  private readonly OTR_PROMPT_DISMISSED_KEY = 'isms_otr_prompt_dismissed';

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
      ?? this.getRoleConfig(user.role).label;
  });

  constructor() {
    this.initUser();
  }

  private initUser(): void {
    try {
      const parsed = this.storage.getItem<UserPersona>(this.STORAGE_KEY);
      if (parsed) {
        // Normalize admin personas saved under an older build that stored a
        // person's name/designation instead of a plain role identifier.
        if (parsed.role === 'dept_admin' || parsed.role === 'super_admin') {
          parsed.label = ACCOUNT_LABELS[parsed.role];
          parsed.subLabel = USER_ROLES.find(r => r.role === parsed.role)?.label ?? parsed.subLabel;
          this.storage.setItem(this.STORAGE_KEY, parsed);
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
    if (this.storage.getSessionString(this.OTP_VERIFIED_KEY) === 'true') {
      this.isDeptAdminOtpVerified.set(true);
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
    this.storage.setItem(this.STORAGE_KEY, persona);
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
    const roleConfig = this.getRoleConfig(role);

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

  markProfileCompleted(): void {
    const user = this.currentUser();
    if (user) {
      const updated: UserPersona = { ...user, isProfileComplete: true };
      this.currentUser.set(updated);
      this.storage.setItem(this.STORAGE_KEY, updated);
    }
  }

  setDeptAdminOtpVerified(verified: boolean): void {
    this.isDeptAdminOtpVerified.set(verified);
    if (verified) {
      this.storage.setSessionString(this.OTP_VERIFIED_KEY, 'true');
    } else {
      this.storage.removeSessionItem(this.OTP_VERIFIED_KEY);
    }
  }

  logout(): void {
    this.currentUser.set(null);
    this.setDeptAdminOtpVerified(false);
    this.storage.removeItem(this.STORAGE_KEY);
    this.storage.removeSessionItem(this.OTR_PROMPT_DISMISSED_KEY);
    this.router.navigate(['/sso-login']);
  }

  getRoleConfig(role: UserRole): RoleConfig {
    if (role === 'aspirant') return ASPIRANT_ROLE_CONFIG;
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
    this.storage.setItem(this.STORAGE_KEY, persona);

    // The session is already authenticated, so returning to the department
    // workspace must not prompt for OTP again.
    this.setDeptAdminOtpVerified(true);

    if (navigate) {
      this.router.navigate([target.defaultRoute]);
    }
  }
}
