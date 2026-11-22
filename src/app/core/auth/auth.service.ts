import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole, RoleConfig } from '../models/role.model';
import { UserPersona } from '../models/user.model';
import { StorageService } from '../services/storage.service';
import { isMockEnabled } from '../mock/mock.config';
import { environment } from '../../../environments/environment';
import { AuthApiService } from './auth-api.service';
import type { BackendRoleSummary, BackendUser, CurrentUserResponse } from './auth-api.models';

/** The user's roles and the one the backend session is scoped to (real sign-in). */
export interface SessionRoles {
  roles: BackendRoleSummary[];
  activeRoleId: number | null;
}
import { humanizeRoleName, landingRouteFor, toPortalRole } from './sso-session.util';
import { TableAccessService } from '../permissions/table-access.service';
import { TokenService } from './token.service';

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
  },
  {
    role: 'aspirant',
    label: 'Aspirant',
    badge: 'First Time User',
    description: 'First time candidate looking for skill training programs'
  }
];

export const ASPIRANT_ROLE_CONFIG: RoleConfig = USER_ROLES[4];

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
  private tokens = inject(TokenService);
  private authApi = inject(AuthApiService);
  private tableAccess = inject(TableAccessService);
  private readonly STORAGE_KEY = 'isms_user';
  private readonly USER_DETAILS_KEY = 'isms_user_details';
  private readonly SESSION_ROLES_KEY = 'isms_session_roles';
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
    // Real sign-in: the backend session is scoped to the role chosen at sign-in (token `selected_role_id`), so the
    // role can only change by signing in again. The in-browser switch is a mock-only demo.
    if (!this.isMockAuth()) return [];
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
    // Real sign-in: the backend role the session is scoped to (e.g. "Super Admin"), not a portal persona label.
    if (!this.isMockAuth()) return user.subLabel || this.getRoleConfig(user.role).label;
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
        // Mock sign-in only: normalize admin personas saved under an older build that stored a
        // person's name/designation instead of a plain role identifier. Real users keep their SSO name.
        if (this.isMockAuth() && (parsed.role === 'dept_admin' || parsed.role === 'super_admin')) {
          parsed.label = ACCOUNT_LABELS[parsed.role];
          parsed.subLabel = USER_ROLES.find(r => r.role === parsed.role)?.label ?? parsed.subLabel;
          this.storage.setItem(this.STORAGE_KEY, parsed);
        }
        this.currentUser.set(parsed);
        this.userDetails.set(this.storage.getItem<BackendUser>(this.USER_DETAILS_KEY));
        this.sessionRoles.set(this.storage.getItem<SessionRoles>(this.SESSION_ROLES_KEY) ?? { roles: [], activeRoleId: null });
      } else if (!this.isMockAuth()) {
        // Real sign-in: nobody is signed in until RajSSO says so.
        this.currentUser.set(null);
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

  /**
   * Real sign-in (AUTH not mocked): leaves the app for the RajSSO login page. After sign-in, RajSSO posts the user
   * to the backend callback (`/api/auth/verify-sso-token`), which redirects back to the frontend.
   * Mock sign-in: opens the local persona picker.
   */
  proceedToSsoLogin(): void {
    this.isRedirecting.set(false);
    if (!this.isMockAuth() && environment.sso.loginUrl) {
      window.location.assign(environment.sso.loginUrl);
      return;
    }
    this.router.navigate(['/sso-login']);
  }

  /** True while sign-in is the local persona picker (resource AUTH mocked). */
  isMockAuth(): boolean {
    return isMockEnabled('AUTH');
  }

  /**
   * Opens the portal session for a user signed in through RajSSO (called by SsoLoginFlowService once the backend
   * session exists). The backend already ran the second-factor check, so the department OTP is not asked again.
   */
  completeSignIn(persona: UserPersona, details?: BackendUser | null, redirectTo?: string): void {
    // Short user details from the sign-in response, cached so a reload keeps them without calling /auth/me.
    if (details) {
      this.userDetails.set(details);
      this.storage.setItem(this.USER_DETAILS_KEY, details);
    }
    this.storage.removeSessionItem(this.OTR_PROMPT_DISMISSED_KEY);
    this.login(persona, null);
    this.setDeptAdminOtpVerified(persona.role === 'dept_admin' || persona.role === 'super_admin');

    // Load the table permissions (GET /auth/permissions), then open the first screen the user may use.
    const goHome = () => {
      // e.g. "Forgot PIN" opens the profile to set a new PIN.
      if (redirectTo) {
        this.router.navigateByUrl(redirectTo);
        return;
      }
      const permitted = this.tableAccess.firstPermittedRoute();
      if (permitted) {
        this.router.navigateByUrl(permitted);
        return;
      }
      const target = landingRouteFor(persona.role);
      this.router.navigate([target.path], target.queryParams ? { queryParams: target.queryParams } : undefined);
    };
    this.tableAccess.clear();
    this.tableAccess.load().subscribe({ next: goHome, error: goHome });
  }

  /**
   * Real sign-in: all roles of the user (`{ id, name }`, from the sign-in steps or `/me.availableRoles`) and the one the
   * backend session is scoped to. Drives "Switch Role" in the header; kept in localStorage.
   */
  readonly sessionRoles = signal<SessionRoles>({ roles: [], activeRoleId: null });
  /** Roles the user can switch to (more than one role held). */
  readonly switchableSessionRoles = computed(() => {
    const { roles } = this.sessionRoles();
    return roles.length > 1 ? roles : [];
  });

  setSessionRoles(roles: readonly BackendRoleSummary[], activeRoleId: number | null): void {
    const unique = roles.filter((r, i) => roles.findIndex(x => x.id === r.id) === i);
    const value: SessionRoles = { roles: unique, activeRoleId };
    this.sessionRoles.set(value);
    this.storage.setItem(this.SESSION_ROLES_KEY, value);
  }

  /** Short user details returned at sign-in (id, SSOID, name, email, mobile, roles); kept in localStorage. */
  readonly userDetails = signal<BackendUser | null>(null);

  /** Full profile from `/auth/me`; loaded only when the profile page opens (sign-in uses the short details). */
  readonly profile = signal<CurrentUserResponse | null>(null);
  readonly profileLoading = signal(false);

  /** Loads the full profile (`/auth/me`) for the profile page. No-op with mock sign-in or when nobody is signed in. */
  loadProfile(): void {
    if (this.isMockAuth() || !this.currentUser() || this.profileLoading()) return;
    this.profileLoading.set(true);
    this.authApi.session().subscribe({
      next: me => {
        this.profile.set(me);
        this.profileLoading.set(false);
        // Keep the header in step with the server profile: the name, and the role the session is scoped to
        // (`selectedRole`, the role chosen at sign-in).
        const user = this.currentUser();
        if (!user) return;
        const name = me?.name?.trim() || me?.displayName?.trim() || user.label;
        const sessionRoleName = me?.selectedRole?.name ?? (me?.roles?.length === 1 ? me.roles[0] : null);
        const role = sessionRoleName ? toPortalRole(sessionRoleName) : user.role;
        const subLabel = sessionRoleName ? humanizeRoleName(sessionRoleName) : user.subLabel;
        if (name !== user.label || role !== user.role || subLabel !== user.subLabel) {
          this.login({ ...user, label: name, role, subLabel }, null);
        }
        // Role list for "Switch Role": the backend's full list when it sends one, and the session's active role.
        const current = this.sessionRoles();
        const roles = me?.availableRoles?.length ? me.availableRoles : current.roles;
        const activeRoleId = me?.selectedRoleId ?? me?.selectedRole?.id ?? current.activeRoleId;
        this.setSessionRoles(roles, activeRoleId);
      },
      error: () => this.profileLoading.set(false)
    });
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
      isProfileComplete: role !== 'new_user' && role !== 'aspirant'
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
    this.clearLocalSession();

    if (this.isMockAuth()) {
      this.router.navigate(['/sso-login']);
      return;
    }

    // Real sign-in: end the server session, then finish the sign-out at RajSSO through the page the backend returns.
    // Whatever the server answers, the user is already signed out here.
    this.authApi.logout().subscribe({
      next: res => {
        const target = res?.redirectUrl;
        if (target && /^https?:\/\//i.test(target)) {
          window.location.assign(target);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => this.router.navigate(['/'])
    });
  }

  private clearLocalSession(): void {
    this.tokens.clear();
    this.currentUser.set(null);
    this.setDeptAdminOtpVerified(false);
    this.storage.removeItem(this.STORAGE_KEY);
    this.storage.removeSessionItem(this.OTR_PROMPT_DISMISSED_KEY);
    this.storage.removeItem(this.USER_DETAILS_KEY);
    this.userDetails.set(null);
    this.storage.removeItem(this.SESSION_ROLES_KEY);
    this.sessionRoles.set({ roles: [], activeRoleId: null });
    this.tableAccess.clear();
    this.profile.set(null);
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
