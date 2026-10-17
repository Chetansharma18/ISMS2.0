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
import { PermissionService } from '../../permissions/permission.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { HeaderNotificationComponent } from './header-notification.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ClickOutsideDirective, HeaderNotificationComponent, ButtonComponent, IconComponent],
  host: {
    class: 'block w-full relative z-50'
  },
  template: `
    <header
      class="w-full bg-white border-b border-[#DCE4ED] box-border relative z-50 select-none"
      [class.sticky]="isSticky"
      [class.top-0]="isSticky"
      role="banner"
    >
      <div class="w-full h-[64px] sm:h-[76px] lg:h-[80px] px-3 sm:px-8 lg:px-12 flex items-center justify-between gap-2 sm:gap-6 font-['Inter',sans-serif]">

        <!-- LEFT SIDE: Mobile Menu Toggle + Emblem + ISMS Logo + Separator + Identity -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
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

          <a routerLink="/" class="flex items-center gap-2 sm:gap-3.5 md:gap-4 shrink-0 no-underline cursor-pointer group" aria-label="ISMS 2.0 Home">
          
          <!-- Logos Group -->
          <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <!-- Government of Rajasthan Emblem -->
            <img
              src="/Rajasthan-Sarkar.png"
              alt="Government of Rajasthan"
              class="h-7 sm:h-9 lg:h-[38px] w-auto object-contain shrink-0"
            />
            <!-- ISMS Logo -->
            <img
              src="/rsldc-logo.png"
              alt="ISMS"
              class="h-7 sm:h-9 lg:h-[38px] w-auto object-contain shrink-0"
              onerror="this.src='/Rajasthan-Sarkar.png'"
            />
          </div>

          <!-- Thin Vertical Separator -->
          <div class="w-px h-6 sm:h-8 bg-[#DCE4ED] shrink-0"></div>

          <!-- System Identity: Name above Subtitle -->
          <div class="flex flex-col justify-center leading-none">
            <div class="text-[17px] sm:text-[21px] lg:text-[24px] font-bold text-[#12365A] tracking-tight leading-none">
              ISMS <span class="text-[#F28C28]">2.0</span>
            </div>
            <div class="hidden md:block text-[11px] sm:text-[12px] lg:text-[14px] font-normal text-[#344256] tracking-normal leading-tight mt-1 whitespace-nowrap">
              Integrated Scheme Management System
            </div>
          </div>
        </a>
        </div>

        <!-- RIGHT SIDE: Language Controls + Divider + Notification + Divider + Login / User Pill -->
        <div class="flex items-center gap-2 sm:gap-3.5 lg:gap-4 shrink-0">

          <!-- Language Controls -->
          <div class="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-[14px]" aria-label="Language selection">
            <!-- English -->
            <button
              appButton
              size="sm"
              [variant]="selectedLanguage() === 'en' ? 'secondary' : 'ghost'"
              type="button"
              (click)="onLanguageChange('en')"
            >
              English
            </button>

            <!-- Thin Vertical Divider -->
            <div class="w-px h-3 sm:h-4 bg-[#DCE4ED] shrink-0"></div>

            <!-- हिंदी -->
            <button
              appButton
              size="sm"
              [variant]="selectedLanguage() === 'hi' ? 'secondary' : 'ghost'"
              type="button"
              (click)="onLanguageChange('hi')"
            >
              हिंदी
            </button>
          </div>

          <!-- When Logged In (and on internal portal page): Notification Bell + User Profile Menu & Role Switcher -->
          @if (currentUser() && !isLandingPage()) {
            <!-- Thin Vertical Divider between Language & Notifications -->
            <div class="w-px h-5 sm:h-6 bg-[#DCE4ED] shrink-0"></div>

            <!-- Notification Option (Role-Specific Portal Notifications) -->
            <app-header-notification></app-header-notification>

            <!-- Thin Vertical Divider between Notifications & Username -->
            <div class="w-px h-5 sm:h-6 bg-[#DCE4ED] shrink-0"></div>

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
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs uppercase shrink-0 select-none shadow-xs text-white"
                  [ngClass]="avatarBgClass()">
                  {{ avatarChar() }}
                </div>

                <!-- Username and role badge -->
                <div class="flex flex-col text-left leading-none max-w-28 sm:max-w-48 truncate">
                  <span class="text-xs sm:text-[13px] font-bold text-[#12365A] truncate">
                    {{ displayName() }}
                  </span>
                  <span class="text-[9.5px] sm:text-[10px] text-slate-500 font-medium truncate mt-0.5">
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
                  class="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150 font-sans"
                  role="menu"
                >
                  <!-- 1. User Info Header -->
                  <div class="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs text-white"
                        [ngClass]="avatarBgClass()">
                        {{ avatarChar() }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-slate-800 truncate m-0">{{ displayName() }}</p>
                        <p class="text-[11px] text-slate-500 truncate m-0 mt-0.5 font-medium">{{ userSubLabel() }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 2. Menu Actions -->
                  <div class="p-1.5 space-y-0.5">
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
                      <div class="my-1 border-t border-slate-100"></div>

                      <div class="px-3 pt-1 pb-0.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <app-icon name="switch-horizontal" size="sm" [stroke]="2" class="text-navy" />
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

                    <div class="my-1 border-t border-slate-100"></div>

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

              <span>Login</span>

              <!-- Right Arrow Icon -->
              <app-icon name="forward" />
            </button>
          }

        </div>

      </div>
    </header>
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

  onLogout(): void {
    this.dropdownOpen.set(false);
    this.authService.logout();
  }

  onSelectRole(roleId: AssignedRole['id']): void {
    this.dropdownOpen.set(false);
    this.authService.switchActiveRole(roleId);
  }
}
