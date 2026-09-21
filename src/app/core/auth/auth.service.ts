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

  /** Controls visibility of the theme-based SSO redirecting modal */
  isRedirecting = signal<boolean>(false);

  /** Active logged in user persona */
  currentUser = signal<UserPersona | null>(null);

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
    this.router.navigate(['/dashboard']);
  }
}
