import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
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
    SidebarComponent,
    SsoRedirectModalComponent
  ],
  template: `
    <div class="h-screen overflow-hidden flex flex-col bg-slate-50 text-slate-900 antialiased relative">
      <!-- Theme-Based Blurred SSO Redirection Popup -->
      @if (authService.isRedirecting()) {
        <app-sso-redirect-modal></app-sso-redirect-modal>
      }

      <!-- Main Portal Header (Always visible across all pages) -->
      <app-header
        [isSticky]="false"
        class="shrink-0 z-40"
        (loginClicked)="onLoginClick()"
      ></app-header>

      <!-- Main Content Area: Flex layout with Fixed Sidebar when logged in -->
      @if (showSidebar()) {
        <div class="flex-1 flex w-full overflow-hidden">
          <app-sidebar class="h-full shrink-0"></app-sidebar>
          <main class="flex-1 min-w-0 h-full overflow-y-auto bg-slate-50 flex flex-col">
            <router-outlet></router-outlet>
          </main>
        </div>
      } @else {
        <main class="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden flex flex-col">
          <router-outlet></router-outlet>
          <!-- Main Portal Footer (Displayed on landing page) -->
          @if (showFooter()) {
            <app-footer class="shrink-0"></app-footer>
          }
        </main>
      }
    </div>
  `
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isLandingRoute = signal<boolean>(true);
  isSsoRoute = signal<boolean>(false);

  readonly showFooter = () => {
    return this.isLandingRoute();
  };

  readonly showSidebar = () => {
    return !!this.authService.currentUser() && !this.isLandingRoute() && !this.isSsoRoute();
  };

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const cleanUrl = event.urlAfterRedirects.split('?')[0].split('#')[0];
        const isLanding = cleanUrl === '/' || cleanUrl === '';
        const isSso = cleanUrl.includes('/sso-login');

        this.isLandingRoute.set(isLanding);
        this.isSsoRoute.set(isSso);
      });
  }

  onLoginClick(): void {
    this.authService.triggerSsoRedirect();
  }
}
