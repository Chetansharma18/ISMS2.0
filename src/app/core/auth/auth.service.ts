import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface UserPersona {
  id: string;
  ssoId: string;
  label: string;
  subLabel: string;
  role: string;
}

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

  login(persona: UserPersona): void {
    this.currentUser.set(persona);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(persona));
      } catch {}
    }
    this.router.navigate(['/registration']);
  }

  loginWithCredentials(identifier: string, role: string = 'APPLICANT'): void {
    const ssoId = identifier.trim() || 'applicant_rj';
    const persona: UserPersona = {
      id: ssoId,
      ssoId: ssoId,
      label: ssoId.includes('@') ? ssoId.split('@')[0] : ssoId,
      subLabel: ssoId,
      role: role
    };
    this.login(persona);
  }

  logout(): void {
    this.currentUser.set(null);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {}
    }
    this.router.navigate(['/']);
  }
}
