import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, AssignedRole, UserRole } from '../../auth/auth.service';
import { SsoLoginFlowService } from '../../auth/sso-login-flow.service';
import { humanizeRoleName, landingRouteFor } from '../../auth/sso-session.util';
import { PermissionService } from '../../permissions/permission.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { HeaderNotificationComponent } from './header-notification.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ActionModalComponent } from '../../../shared/components/action-modal/action-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ClickOutsideDirective,
    HeaderNotificationComponent,
    ButtonComponent,
    IconComponent,
    ActionModalComponent
  ],
  host: {
    class: 'block w-full sticky top-0 z-40'
  },
  template: `
    <header
      class="app-header w-full box-border sticky top-0 z-40 select-none font-sans"
      role="banner"
    >
      <!-- LEFT SIDE: Mobile Menu Toggle + Emblem + Bilingual Gov Text + RSLDC Logo + ISMS 2.0 -->
      <div class="header-brand-group">
        @if (currentUser() && !isLandingPage() && !isSsoPage()) {
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            (click)="toggleMobileMenu.emit()"
            class="md:hidden -ml-1 shrink-0"
            aria-label="Toggle navigation menu"
            title="Open Navigation Menu"
          >
            <app-icon name="menu" size="lg" [stroke]="2" />
          </button>
        }

        <a [routerLink]="homeRoute()" class="header-brand-group no-underline cursor-pointer group" aria-label="ISMS 2.0 Home">
          <!-- Government of Rajasthan Emblem + Bilingual Title -->
          <div class="government-brand">
            <img
              src="/Rajasthan-Sarkar.png"
              alt="Government of Rajasthan"
              class="government-logo"
            />
            <div class="government-text hidden sm:flex">
              <span class="government-title-hindi">राजस्थान सरकार</span>
              <span class="government-title-english">Government of Rajasthan</span>
            </div>
          </div>

          <!-- Thin Vertical Separator -->
          <span class="header-divider" aria-hidden="true"></span>

          <!-- RSLDC Logo -->
          <img
            src="/rsldc-logo.png"
            alt="RSLDC"
            class="rsldc-logo"
            onerror="this.src='/Rajasthan-Sarkar.png'"
          />

          <!-- Thin Vertical Separator -->
          <span class="header-divider hidden sm:block" aria-hidden="true"></span>

          <!-- System Identity: Name above Subtitle -->
          <div class="application-brand">
            <div class="brand-title">
              ISMS <span class="brand-version">2.0</span>
            </div>
            <div class="brand-subtitle hidden md:block">
              Integrated Scheme Management System
            </div>
          </div>
        </a>
      </div>

      <!-- RIGHT SIDE: Notification + Divider + Login / User Pill -->
      <div class="header-actions">

        <!-- When Logged In: User Profile Menu & Role Switcher (on the landing page too, with "Back to Portal");
             the notification bell only inside the portal -->
        @if (currentUser() && !isSsoPage()) {
          @if (!isLandingPage()) {
            <!-- Notification Option (Role-Specific Portal Notifications) -->
            <app-header-notification></app-header-notification>

            <!-- Thin Vertical Divider between Notifications & Username -->
            <span class="header-divider" aria-hidden="true"></span>
          }

          <div class="relative z-[100]" id="user-menu-container" (appClickOutside)="closeDropdown()">
            <button
              appButton
              variant="outline"
              type="button"
              id="user-menu-btn"
              (click)="toggleDropdown()"
              [attr.aria-expanded]="dropdownOpen()"
              aria-haspopup="true"
              aria-label="User profile and role menu"
            >
              <!-- Avatar with role-based background -->
              <div class="profile-avatar rounded-full flex items-center justify-center font-semibold uppercase shrink-0 select-none text-white"
                [ngClass]="avatarBgClass()">
                {{ avatarChar() }}
              </div>

              <!-- Username and role badge -->
              <div class="flex flex-col text-left leading-none max-w-28 sm:max-w-48 truncate">
                <span class="text-[13px] sm:text-[14px] font-semibold text-[#25212A] truncate">
                  {{ displayName() }}
                </span>
                <span class="text-[11px] sm:text-[12px] text-[#625663] font-normal truncate mt-0.5">
                  {{ userSubLabel() }}
                </span>
              </div>

              <!-- Chevron -->
              <app-icon
                name="chevron-down"
                size="sm"
                class="transition-transform duration-200"
                [class.rotate-180]="dropdownOpen()"
              />
            </button>

              <!-- Dropdown Menu -->
              @if (dropdownOpen()) {
                <div
                  class="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white border border-[#EADCE2] rounded-xl shadow-xl z-[100] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150 font-sans"
                  role="menu"
                >
                  <!-- 1. User Info Header -->
                  <div class="px-3.5 py-2.5 border-b border-[#EADCE2] bg-[#FCF8FA]">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs text-white"
                        [ngClass]="avatarBgClass()">
                        {{ avatarChar() }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-[#25212A] truncate m-0">{{ displayName() }}</p>
                        <p class="text-[11px] text-[#625663] truncate m-0 mt-0.5 font-medium">{{ userSubLabel() }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 2. Menu Actions -->
                  <div class="p-1.5 space-y-0.5">
                    <!-- Back to Portal: on the landing page, returns a signed-in user to their portal home -->
                    @if (isLandingPage()) {
                      <a
                        appButton
                        variant="primary"
                        size="sm"
                        block
                        [routerLink]="homeRoute()"
                        (click)="closeDropdown()"
                        class="justify-start"
                        role="menuitem"
                      >
                        <app-icon name="forward" />
                        <span>Back to Portal</span>
                      </a>
                    }

                    <!-- Profile Link -->
                    <a
                      appButton
                      variant="ghost"
                      size="sm"
                      block
                      routerLink="/profile"
                      (click)="closeDropdown()"
                      class="justify-start"
                      role="menuitem"
                    >
                      <app-icon name="user" />
                      <span>View Profile</span>
                    </a>

                    <!-- SWITCH ROLE: shown only when the user holds more than one role -->
                    @if (canSwitchRole()) {
                      <div class="my-1 border-t border-[#EADCE2]"></div>

                      <div class="px-3 pt-1 pb-0.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <app-icon name="switch-horizontal" size="sm" [stroke]="2" class="text-[#7C0E44]" />
                        <span>Switch Role</span>
                      </div>

                      @for (role of assignedRoles(); track role.id) {
                        <button
                          appButton
                          size="sm"
                          block
                          [variant]="isActiveRole(role.id) ? 'secondary' : 'ghost'"
                          type="button"
                          (click)="onSelectRole(role.id)"
                          class="justify-between"
                          [attr.aria-current]="isActiveRole(role.id) ? 'true' : null"
                        >
                          <span class="truncate">{{ role.label }}</span>

                          @if (isActiveRole(role.id)) {
                            <app-icon name="check" />
                          }
                        </button>
                      }
                    }

                    <!-- SWITCH ROLE (real sign-in): the user's backend roles; switching may ask for 2FA again -->
                    @if (sessionSwitchRoles().length > 1) {
                      <div class="my-1 border-t border-[#EADCE2]"></div>

                      <div class="px-3 pt-1 pb-0.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <app-icon name="switch-horizontal" size="sm" [stroke]="2" class="text-[#7C0E44]" />
                        <span>Switch Role</span>
                      </div>

                      @for (role of sessionSwitchRoles(); track role.id) {
                        <button
                          appButton
                          size="sm"
                          block
                          [variant]="role.id === activeSessionRoleId() ? 'secondary' : 'ghost'"
                          type="button"
                          (click)="onSwitchSessionRole(role.id)"
                          class="justify-between"
                          [attr.aria-current]="role.id === activeSessionRoleId() ? 'true' : null"
                        >
                          <span class="truncate">{{ roleLabel(role.name) }}</span>
                          @if (role.id === activeSessionRoleId()) {
                            <app-icon name="check" />
                          }
                        </button>
                      }
                    }

                    <div class="my-1 border-t border-[#EADCE2]"></div>

                    <!-- Back to SSO (real sign-in): return to the RajSSO portal, staying signed in to ISMS -->
                    @if (canGoBackToSso()) {
                      <button
                        appButton
                        variant="ghost"
                        size="sm"
                        block
                        type="button"
                        (click)="onBackToSso()"
                        class="justify-start"
                        role="menuitem"
                      >
                        <app-icon name="external-link" />
                        <span>Back to SSO</span>
                      </button>
                    }

                    <!-- Sign Out -->
                    <button
                      appButton
                      variant="danger"
                      size="sm"
                      block
                      type="button"
                      (click)="onLogout()"
                      class="justify-start"
                      role="menuitem"
                    >
                      <app-icon name="logout" [stroke]="2" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else if (!isSsoPage()) {
            <!-- Login Button with user icon and right-arrow icon -->
            <button
              appButton
              type="button"
              (click)="onLoginClick()"
              aria-label="Sign in to ISMS 2.0 Portal"
            >
              <!-- User Icon -->
              <app-icon name="user" />

              <span>Login with SSO</span>

              <!-- Right Arrow Icon -->
              <app-icon name="forward" />
            </button>
          }

        </div>

    </header>

    <!-- Sign Out Confirmation Modal (outside <header> stacking context) -->
    <app-action-modal
      [isOpen]="showLogoutConfirmModal()"
      [showCloseButton]="false"
      [closeOnBackdrop]="true"
      [showAccentBar]="true"
      accentBarClass="bg-[#7C0E44]"
      primaryLabel="Sign Out"
      primaryVariant="primary"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-[420px]"
      (primaryAction)="confirmLogout()"
      (secondaryAction)="cancelLogout()"
      (close)="cancelLogout()"
    >
      <div class="flex flex-col items-center text-center pt-1 pb-2 space-y-3 font-sans">
        <div class="w-12 h-12 rounded-full bg-[#F8EDF1] border border-[#EADCE2] flex items-center justify-center text-[#7C0E44]">
          <app-icon name="logout" size="lg" [stroke]="2" />
        </div>
        <div class="space-y-1.5">
          <h2 class="m-0 text-lg font-extrabold text-[#7C0E44] tracking-tight">
            Sign Out Confirmation
          </h2>
          <p class="m-0 text-[13px] text-slate-600 leading-relaxed max-w-xs mx-auto">
            Are you sure you want to sign out of the ISMS 2.0 portal? You will need to sign in again to continue.
          </p>
        </div>
      </div>
    </app-action-modal>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class HeaderComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private permissions = inject(PermissionService);
  private destroyRef = inject(DestroyRef);

  @Input() isSticky = true;
  @Input() currentLang: 'en' | 'hi' = 'en';

  @Output() languageChanged = new EventEmitter<'en' | 'hi'>();
  @Output() loginClicked = new EventEmitter<void>();
  @Output() toggleMobileMenu = new EventEmitter<void>();

  readonly selectedLanguage = signal<'en' | 'hi'>('en');
  readonly isLandingPage = signal<boolean>(true);
  readonly isSsoPage = signal<boolean>(false);
  readonly dropdownOpen = signal<boolean>(false);

  readonly currentUser = this.authService.currentUser;

  /** Roles granted to the signed-in user, and the one currently active */
  readonly assignedRoles = this.authService.assignedRoles;
  readonly canSwitchRole = this.authService.canSwitchRole;
  readonly activeRoleLabel = this.authService.activeRoleLabel;

  /** Emblem logo link: the signed-in role's landing page (same as after sign-in), the portal home otherwise. */
  readonly homeRoute = computed(() => {
    const user = this.currentUser();
    return user ? landingRouteFor(user.role).path : '/';
  });

  readonly displayName = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    return u.label || u.ssoId || u.id;
  });

  /** Always the active role - never a designation or a person name */
  readonly userSubLabel = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    return this.activeRoleLabel() || u.subLabel || 'SSOID User';
  });

  isActiveRole(roleId: string): boolean {
    return this.permissions.hasRole(roleId as UserRole);
  }

  readonly avatarChar = computed(() => {
    const name = this.displayName();
    if (!name) return 'U';
    const clean = name.replace(/^(Dr\.|Sh\.|Smt\.|Er\.)\s*/i, '').trim();
    return clean ? clean.charAt(0).toUpperCase() : name.charAt(0).toUpperCase();
  });

  readonly avatarBgClass = computed(() => {
    if (this.permissions.hasRole(['dept_admin', 'super_admin'])) {
      return 'bg-navy text-white';
    }
    if (this.permissions.hasRole('new_user')) {
      return 'bg-amber-600 text-white';
    }
    return 'bg-primary text-white';
  });

  constructor() {
    const checkUrl = (url: string) => {
      const cleanUrl = url.split('?')[0].split('#')[0];
      this.isLandingPage.set(cleanUrl === '/' || cleanUrl === '');
      this.isSsoPage.set(cleanUrl.includes('/sso-login'));
    };

    checkUrl(this.router.url);

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        checkUrl(event.urlAfterRedirects);
        // Close dropdown on navigation
        this.dropdownOpen.set(false);
      });
  }


  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  onLanguageChange(lang: 'en' | 'hi'): void {
    this.selectedLanguage.set(lang);
    this.languageChanged.emit(lang);
  }

  onLoginClick(): void {
    this.loginClicked.emit();
  }

  readonly showLogoutConfirmModal = signal<boolean>(false);

  onLogout(): void {
    this.dropdownOpen.set(false);
    this.showLogoutConfirmModal.set(true);
  }

  confirmLogout(): void {
    this.showLogoutConfirmModal.set(false);
    this.authService.logout();
  }

  cancelLogout(): void {
    this.showLogoutConfirmModal.set(false);
  }

  canGoBackToSso(): boolean {
    return this.authService.canGoBackToSso();
  }

  onBackToSso(): void {
    this.dropdownOpen.set(false);
    this.authService.backToSso();
  }

  onSelectRole(roleId: AssignedRole['id']): void {
    this.dropdownOpen.set(false);
    this.authService.switchActiveRole(roleId);
  }

  // ---- Real sign-in: switch the backend session to another role (may ask for 2FA) ----
  private readonly loginFlow = inject(SsoLoginFlowService);
  readonly sessionSwitchRoles = this.authService.switchableSessionRoles;
  readonly activeSessionRoleId = computed(() => this.authService.sessionRoles().activeRoleId);

  protected roleLabel(name: string): string {
    return humanizeRoleName(name);
  }

  onSwitchSessionRole(roleId: number): void {
    this.dropdownOpen.set(false);
    if (roleId === this.activeSessionRoleId()) return;
    this.loginFlow.switchRole(roleId);
  }
}
