import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { AuthService } from './core/auth/auth.service';
import { SsoRedirectModalComponent } from './core/auth/components/sso-redirect-modal/sso-redirect-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SsoRedirectModalComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased relative">
      <!-- Theme-Based Blurred SSO Redirection Popup -->
      @if (authService.isRedirecting()) {
        <app-sso-redirect-modal></app-sso-redirect-modal>
      }

      <!-- Main Portal Header (Always visible across all pages) -->
      <app-header
        [isSticky]="true"
        (loginClicked)="onLoginClick()"
      ></app-header>

      <!-- Main Page Content -->
      <main class="flex-1 flex flex-col">
        <router-outlet></router-outlet>
      </main>

      <!-- Main Portal Footer (Strictly displayed ONLY on the landing page when not logged in) -->
      @if (showFooter()) {
        <app-footer></app-footer>
      }
    </div>
  `
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isLandingRoute = signal<boolean>(true);

  readonly showFooter = () => {
    return this.isLandingRoute() && !this.authService.currentUser();
  };

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const cleanUrl = event.urlAfterRedirects.split('?')[0].split('#')[0];
        const isLanding = cleanUrl === '/' || cleanUrl === '';
        this.isLandingRoute.set(isLanding);
      });
  }

  onLoginClick(): void {
    this.authService.triggerSsoRedirect();
  }
}
