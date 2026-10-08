import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block w-full relative z-50'
  },
  template: `
    <header
      class="w-full bg-[#FFFFFF] border-b border-[#DCE4ED] box-border relative z-50 select-none"
      [class.sticky]="isSticky"
      [class.top-0]="isSticky"
      role="banner"
    >
      <div class="w-full h-[64px] sm:h-[76px] lg:h-[80px] px-3 sm:px-8 lg:px-12 flex items-center justify-between gap-2 sm:gap-6 font-['Inter',sans-serif]">

        <!-- LEFT SIDE: Mobile Menu Toggle + Emblem + ISMS Logo + Separator + Identity -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          @if (currentUser() && !isLandingPage() && !isSsoPage()) {
            <button
              type="button"
              (click)="toggleMobileMenu.emit()"
              class="md:hidden p-1.5 -ml-1 text-slate-700 hover:text-[#0B3558] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
              title="Open Navigation Menu"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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

        <!-- RIGHT SIDE: Language Controls + Divider + Login / User Pill -->
        <div class="flex items-center gap-2 sm:gap-4 lg:gap-5 shrink-0">

          <!-- Language Controls -->
          <div class="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-[14px]" aria-label="Language selection">
            <!-- English -->
            <button
              type="button"
              (click)="onLanguageChange('en')"
              class="border-0 bg-transparent cursor-pointer p-0 text-xs sm:text-[14px] transition-colors leading-none font-['Inter',sans-serif]"
              [class.text-[#12365A]]="selectedLanguage() === 'en'"
              [class.font-bold]="selectedLanguage() === 'en'"
              [class.text-[#344256]]="selectedLanguage() !== 'en'"
              [class.font-medium]="selectedLanguage() !== 'en'"
              [class.hover:text-[#12365A]]="selectedLanguage() !== 'en'"
            >
              English
            </button>

            <!-- Thin Vertical Divider -->
            <div class="w-px h-3 sm:h-4 bg-[#DCE4ED] shrink-0"></div>

            <!-- हिंदी -->
            <button
              type="button"
              (click)="onLanguageChange('hi')"
              class="border-0 bg-transparent cursor-pointer p-0 text-xs sm:text-[14px] transition-colors leading-none font-['Noto_Sans_Devanagari','Inter',sans-serif]"
              [class.text-[#12365A]]="selectedLanguage() === 'hi'"
              [class.font-bold]="selectedLanguage() === 'hi'"
              [class.text-[#344256]]="selectedLanguage() !== 'hi'"
              [class.font-medium]="selectedLanguage() !== 'hi'"
              [class.hover:text-[#12365A]]="selectedLanguage() !== 'hi'"
            >
              हिंदी
            </button>
          </div>

          <!-- When Logged In (and on internal portal page): User Profile Menu & Role Switcher -->
          @if (currentUser() && !isLandingPage()) {
            <div class="relative z-[100]" id="user-menu-container">
              <button
                type="button"
                id="user-menu-btn"
                (click)="toggleDropdown()"
                class="inline-flex items-center gap-2 sm:gap-2.5 bg-white hover:bg-[#F5F8FA] border border-[#DCE4ED] hover:border-slate-300 rounded-full py-1 pl-1.5 pr-2.5 sm:py-1.5 sm:pl-2 sm:pr-3.5 transition-all cursor-pointer h-[36px] sm:h-[42px] shadow-2xs"
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
                <svg
                  class="w-3.5 h-3.5 text-[#344256] shrink-0 transition-transform duration-200"
                  [class.rotate-180]="dropdownOpen()"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              @if (dropdownOpen()) {
                <div
                  class="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150 font-sans"
                  [ngClass]="isDeptAdmin() ? 'w-68 sm:w-76' : 'w-56 sm:w-60'"
                  role="menu"
                >
                  <!-- 1. User Info Header -->
                  <div class="px-3.5 py-2.5 border-b border-slate-100 bg-[#F8FAFC]">
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
                      routerLink="/profile"
                      (click)="closeDropdown()"
                      class="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-[#F0F5FA] hover:text-[#0B3558] rounded-lg transition-colors cursor-pointer no-underline font-medium"
                      role="menuitem"
                    >
                      <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>View Profile</span>
                    </a>

                    <!-- DEPARTMENT ROLES: Only for dept_admin -->
                    @if (isDeptAdmin()) {
                      <div class="my-1 border-t border-slate-100"></div>

                      <div class="px-3 pt-1 pb-0.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-[#0B3558]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>Department Roles</span>
                      </div>

                      @for (deptRole of deptRoles; track deptRole.id) {
                        <button
                          type="button"
                          (click)="onSelectDeptRole(deptRole.id)"
                          class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer border-0 group"
                          [ngClass]="activeDeptRoleId() === deptRole.id ? 'bg-[#0B3558]/10 text-[#0B3558] font-semibold' : 'text-slate-700 hover:bg-[#F0F5FA] hover:text-[#0B3558]'"
                        >
                          <div class="flex items-center gap-2.5 min-w-0">
                            <!-- Initials Circle -->
                            <div
                              class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0 transition-colors"
                              [ngClass]="activeDeptRoleId() === deptRole.id ? 'bg-[#0B3558] text-white shadow-2xs' : 'bg-slate-200 text-slate-700 group-hover:bg-[#0B3558]/20 group-hover:text-[#0B3558]'"
                            >
                              {{ deptRole.initials }}
                            </div>
                            <div class="min-w-0">
                              <div class="truncate text-xs leading-tight font-medium" [class.text-[#0B3558]]="activeDeptRoleId() === deptRole.id" [class.font-bold]="activeDeptRoleId() === deptRole.id">
                                {{ deptRole.name }}
                              </div>
                              <div class="truncate text-[10.5px] leading-tight text-slate-500 mt-0.5">
                                {{ deptRole.designation }}
                              </div>
                            </div>
                          </div>

                          @if (activeDeptRoleId() === deptRole.id) {
                            <svg class="w-4 h-4 text-[#0B3558] shrink-0 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          }
                        </button>
                      }
                    }

                    <div class="my-1 border-t border-slate-100"></div>

                    <!-- Sign Out -->
                    <button
                      type="button"
                      (click)="onLogout()"
                      class="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer border-0 bg-transparent text-left font-medium"
                      role="menuitem"
                    >
                      <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else if (!isSsoPage()) {
            <!-- Login Button with user icon and right-arrow icon -->
            <button
              type="button"
              (click)="onLoginClick()"
              class="inline-flex items-center justify-center gap-1.5 sm:gap-2.5 bg-[#12365A] hover:bg-[#0B2440] text-white text-xs sm:text-[14px] font-semibold h-[36px] sm:h-[42px] px-3 sm:px-5 rounded-[6px] transition-colors cursor-pointer shadow-xs border-0 select-none"
              aria-label="Sign in to ISMS 2.0 Portal"
            >
              <!-- User Icon -->
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>

              <span>Login</span>

              <!-- Right Arrow Icon -->
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
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

  readonly isDeptAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'dept_admin' || role === 'super_admin';
  });

  readonly deptRoles = this.authService.getDeptAdminRoles();
  readonly activeDeptRoleId = this.authService.currentDeptRoleId;
  readonly activeDeptRole = this.authService.currentDeptRole;

  readonly displayName = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    return u.label || u.ssoId || u.id;
  });

  readonly userSubLabel = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    if (this.isDeptAdmin()) {
      return this.activeDeptRole()?.badge || u.subLabel || 'Officer';
    }
    return u.subLabel || 'SSOID User';
  });

  readonly avatarChar = computed(() => {
    const name = this.displayName();
    if (!name) return 'U';
    const clean = name.replace(/^(Dr\.|Sh\.|Smt\.|Er\.)\s*/i, '').trim();
    return clean ? clean.charAt(0).toUpperCase() : name.charAt(0).toUpperCase();
  });

  readonly avatarBgClass = computed(() => {
    const role = this.currentUser()?.role;
    if (role === 'dept_admin' || role === 'super_admin') {
      return this.activeDeptRole()?.avatarBg || 'bg-[#0B3558] text-white';
    }
    if (role === 'new_user') {
      return 'bg-amber-600 text-white';
    }
    return 'bg-[#174A6E] text-white';
  });

  constructor() {
    const checkUrl = (url: string) => {
      const cleanUrl = url.split('?')[0].split('#')[0];
      this.isLandingPage.set(cleanUrl === '/' || cleanUrl === '');
      this.isSsoPage.set(cleanUrl.includes('/sso-login'));
    };

    checkUrl(this.router.url);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        checkUrl(event.urlAfterRedirects);
        // Close dropdown on navigation
        this.dropdownOpen.set(false);
      });
  }

  /** Close dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#user-menu-container')) {
      this.dropdownOpen.set(false);
    }
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

  onSelectDeptRole(roleId: string): void {
    this.dropdownOpen.set(false);
    this.authService.switchDeptRole(roleId);
  }
}
