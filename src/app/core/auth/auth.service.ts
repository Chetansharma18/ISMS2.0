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

export interface DeptRole {
  id: string;
  name: string;
  designation: string;
  department: string;
  ssoId: string;
  email: string;
  initials: string;
  role: UserRole;
  badge: string;
  avatarBg: string;
}

export const DEPT_ADMIN_ROLES: DeptRole[] = [
  {
    id: 'scheme_officer',
    name: 'Dr. Ashok Sharma',
    designation: 'Scheme Officer In-Charge',
    department: 'Skill Schemes & Sanctions',
    ssoId: 'officer.mmkvy@rajasthan.gov.in',
    email: 'officer.mmkvy@rajasthan.gov.in',
    initials: 'AS',
    role: 'dept_admin',
    badge: 'Scheme OIC',
    avatarBg: 'bg-[#0B3558] text-white'
  },
  {
    id: 'scrutiny_officer',
    name: 'Sh. Mahendra Meena',
    designation: 'Desk Scrutiny Officer',
    department: 'EOI Scrutiny & Verification',
    ssoId: 'scrutiny.officer@rajasthan.gov.in',
    email: 'scrutiny.officer@rajasthan.gov.in',
    initials: 'MM',
    role: 'dept_admin',
    badge: 'Scrutiny Officer',
    avatarBg: 'bg-[#0B3558] text-white'
  },
  {
    id: 'super_admin',
    name: 'Sh. Rajesh Verma (IAS)',
    designation: 'Super Administrator',
    department: 'State Directorate (RSLDC HQ)',
    ssoId: 'super.admin@rajasthan.gov.in',
    email: 'super.admin@rajasthan.gov.in',
    initials: 'RV',
    role: 'super_admin',
    badge: 'Super Admin',
    avatarBg: 'bg-[#0B3558] text-white'
  }
];

export interface SwitchableAccount {
  role: UserRole;
  title: string;
  name: string;
  email: string;
  subtitle: string;
  initials: string;
  badge: string;
  avatarBg: string;
  defaultRoute: string;
}

export const SWITCHABLE_ACCOUNTS: SwitchableAccount[] = [
  {
    role: 'dept_admin',
    title: 'Department Admin',
    name: 'Dr. Ashok Sharma (RSLDC)',
    email: 'dept.admin@rajasthan.gov.in',
    subtitle: 'Officer Portal • Scrutiny & Sanctions',
    initials: 'DA',
    badge: 'Officer Portal',
    avatarBg: 'bg-[#0B3558] text-white',
    defaultRoute: '/admin/eoi-view'
  },
  {
    role: 'existing_user',
    title: 'Training Partner (TP / PIA)',
    name: 'Approved Citizen (TP)',
    email: 'tp.partner@skillcraft.org',
    subtitle: 'Registered Agency • Scheme Bidding',
    initials: 'TP',
    badge: 'Registered TP',
    avatarBg: 'bg-emerald-700 text-white',
    defaultRoute: '/tenders'
  },
  {
    role: 'super_admin',
    title: 'Super Administrator',
    name: 'Sh. Rajesh Verma (IAS)',
    email: 'super.admin@rajasthan.gov.in',
    subtitle: 'State Admin • Full System & Masters',
    initials: 'SA',
    badge: 'System Admin',
    avatarBg: 'bg-indigo-700 text-white',
    defaultRoute: '/admin/eoi-configuration'
  },
  {
    role: 'new_user',
    title: 'New Applicant',
    name: 'New Applicant User',
    email: 'new.applicant@enterprise.in',
    subtitle: 'First Time User • OTR Registration',
    initials: 'NU',
    badge: 'First Time User',
    avatarBg: 'bg-amber-600 text-white',
    defaultRoute: '/registration'
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

  /** Currently selected Department Role ID */
  currentDeptRoleId = signal<string>('scheme_officer');

  /** Active Department Role object */
  readonly currentDeptRole = computed<DeptRole>(() => {
    const id = this.currentDeptRoleId();
    return DEPT_ADMIN_ROLES.find(r => r.id === id) || DEPT_ADMIN_ROLES[0];
  });

  constructor() {
    this.initUser();
  }

  private initUser(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const savedDeptRole = localStorage.getItem('isms_dept_role_id');
        if (savedDeptRole && DEPT_ADMIN_ROLES.some(r => r.id === savedDeptRole)) {
          this.currentDeptRoleId.set(savedDeptRole);
        }

        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed: UserPersona = JSON.parse(saved);
          this.currentUser.set(parsed);

          if (parsed.role === 'dept_admin' || parsed.role === 'super_admin') {
            const matched = DEPT_ADMIN_ROLES.find(r => r.name === parsed.label || r.ssoId === parsed.ssoId);
            if (matched) {
              this.currentDeptRoleId.set(matched.id);
            }
          }
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
    let subLabel = roleConfig.label;

    if (role === 'dept_admin') {
      const activeDept = this.currentDeptRole();
      if (!identifier.trim() || identifier.trim() === 'dept_admin') {
        label = activeDept.name;
        subLabel = activeDept.designation;
      }
    } else if (role === 'super_admin') {
      const superRole = DEPT_ADMIN_ROLES.find(r => r.role === 'super_admin') || DEPT_ADMIN_ROLES[2];
      if (!identifier.trim() || identifier.trim() === 'super_admin') {
        label = superRole.name;
        subLabel = superRole.designation;
      }
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

  getDeptAdminRoles(): DeptRole[] {
    return DEPT_ADMIN_ROLES;
  }

  /**
   * Switches department role instantly for Department Admin
   * Updates display name, designation, and persona across the application
   */
  switchDeptRole(roleId: string): void {
    const target = DEPT_ADMIN_ROLES.find(r => r.id === roleId) || DEPT_ADMIN_ROLES[0];
    this.currentDeptRoleId.set(target.id);
    this.setDeptAdminOtpVerified(true);

    const persona: UserPersona = {
      id: target.name,
      ssoId: target.ssoId,
      label: target.name,
      subLabel: target.designation,
      role: target.role,
      isProfileComplete: true
    };

    this.currentUser.set(persona);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(persona));
        localStorage.setItem('isms_dept_role_id', target.id);
      } catch { }
    }
  }

  getSwitchableAccounts(): SwitchableAccount[] {
    return SWITCHABLE_ACCOUNTS;
  }

  /**
   * Switches user role instantly without logging out
   */
  switchRole(role: UserRole, targetRoute?: string): void {
    if (role === 'dept_admin') {
      this.switchDeptRole(this.currentDeptRoleId());
      if (targetRoute) {
        this.router.navigate([targetRoute]);
      } else {
        this.router.navigate(['/admin/eoi-view']);
      }
      return;
    }

    const account = SWITCHABLE_ACCOUNTS.find(a => a.role === role) || SWITCHABLE_ACCOUNTS[0];

    const persona: UserPersona = {
      id: account.name,
      ssoId: account.name,
      label: account.name,
      subLabel: account.subtitle,
      role: role,
      isProfileComplete: role !== 'new_user'
    };

    const dest = targetRoute || account.defaultRoute;
    this.login(persona, dest);
  }
}
