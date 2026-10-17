import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { AuthService } from './core/auth/auth.service';
import { SsoRedirectModalComponent } from './core/auth/components/sso-redirect-modal/sso-redirect-modal.component';
import { ToastOutletComponent } from './shared/components/toast-outlet/toast-outlet.component';
import { ButtonComponent } from './shared/components/button/button.component';
import { IconComponent } from './shared/components/icon/icon.component';
import { BackdropComponent } from './shared/components/backdrop/backdrop.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    SsoRedirectModalComponent,
    ToastOutletComponent,
    ButtonComponent,
    IconComponent,
    BackdropComponent
  ],
  template: `
    <div class="h-screen overflow-hidden flex flex-col text-slate-900 antialiased relative" style="background-color: #FEFEFD;">
      <!-- Global toast notifications (NotificationService) -->
      <app-toast-outlet></app-toast-outlet>

      <!-- Theme-Based Blurred SSO Redirection Popup -->
      @if (authService.isRedirecting()) {
        <app-sso-redirect-modal></app-sso-redirect-modal>
      }

      <!-- Main Portal Header (Always visible across all pages) -->
      <app-header
        [isSticky]="false"
        class="shrink-0 relative z-50"
        (loginClicked)="onLoginClick()"
        (toggleMobileMenu)="toggleMobileSidebar()"
      ></app-header>

      <!-- Main Content Area: Flex layout with Fixed Sidebar when logged in -->
      @if (showSidebar()) {
        <div class="flex-1 flex w-full overflow-hidden relative">
          <!-- Desktop Sidebar: Visible on md screens and larger -->
          <app-sidebar class="hidden md:block h-full shrink-0"></app-sidebar>

          <!-- Mobile Sidebar Overlay Drawer: Visible on small screens when open -->
          @if (isMobileSidebarOpen()) {
            <!-- Backdrop -->
            <app-backdrop z="z-50" class="md:hidden" (click)="closeMobileSidebar()" />

            <!-- Drawer Slider Panel -->
            <div
              class="fixed top-0 bottom-0 left-0 z-50 md:hidden flex flex-col bg-white shadow-2xl transition-transform duration-300 w-65 max-w-[85vw]"
              role="dialog"
              aria-label="Mobile Navigation Menu"
            >
              <!-- Drawer Header -->
              <div class="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-slate-50">
                <span class="text-xs font-bold text-navy uppercase tracking-wider">Navigation Menu</span>
                <button
                  appButton
                  variant="ghost"
                  size="sm"
                  iconOnly
                  type="button"
                  (click)="closeMobileSidebar()"
                  aria-label="Close menu"
                >
                  <app-icon name="close" size="lg" />
                </button>
              </div>

              <!-- Drawer Navigation Content -->
              <div class="flex-1 overflow-y-auto">
                <app-sidebar class="w-full h-full block" (linkClicked)="closeMobileSidebar()"></app-sidebar>
              </div>
            </div>
          }

          <main class="flex-1 min-w-0 overflow-y-auto flex flex-col" style="background-color: #FEFEFD;">
            <router-outlet></router-outlet>
          </main>
        </div>
      } @else {
        <main 
          class="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col relative" 
          [style.background-color]="isLandingRoute() ? '#070e18' : '#FEFEFD'"
        >
          <div class="w-full flex-1 flex flex-col bg-[#FEFEFD]">
            <router-outlet></router-outlet>
          </div>
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
  private destroyRef = inject(DestroyRef);

  isLandingRoute = signal<boolean>(true);
  isSsoRoute = signal<boolean>(false);
  isMobileSidebarOpen = signal<boolean>(false);

  readonly showFooter = () => {
    return this.isLandingRoute();
  };

  readonly showSidebar = () => {
    return !!this.authService.currentUser() && !this.isLandingRoute() && !this.isSsoRoute();
  };

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        const cleanUrl = event.urlAfterRedirects.split('?')[0].split('#')[0];
        const isLanding = cleanUrl === '/' || cleanUrl === '';
        const isSso = cleanUrl.includes('/sso-login');

        this.isLandingRoute.set(isLanding);
        this.isSsoRoute.set(isSso);
        this.isMobileSidebarOpen.set(false);
      });
  }

  onLoginClick(): void {
    this.authService.triggerSsoRedirect();
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }
}
