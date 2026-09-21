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

      <!-- Main Portal Header (Hidden on dedicated SSO login page) -->
      @if (!isSsoRoute()) {
        <app-header
          [isSticky]="true"
          (loginClicked)="onLoginClick()"
        ></app-header>
      }

      <!-- Main Page Content -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Main Portal Footer (Hidden on dedicated SSO login page) -->
      @if (!isSsoRoute()) {
        <app-footer></app-footer>
      }
    </div>
  `
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isSsoRoute = signal<boolean>(false);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const isSso = event.urlAfterRedirects.includes('/sso-login');
        this.isSsoRoute.set(isSso);
      });
  }

  onLoginClick(): void {
    this.authService.triggerSsoRedirect();
  }
}
