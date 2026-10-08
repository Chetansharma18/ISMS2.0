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
import { AuthService, UserRole } from '../../auth/auth.service';

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
                aria-label="User profile and role switcher"
              >
                <!-- Avatar with role-based background -->
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs uppercase shrink-0 select-none shadow-xs"
                  [ngClass]="activeAccountAvatarClass()">
                  {{ avatarChar() }}
                </div>

                <!-- Username and role badge -->
                <div class="flex flex-col text-left leading-none max-w-28 sm:max-w-44 truncate">
                  <span class="text-xs sm:text-[13px] font-bold text-[#12365A] truncate">
                    {{ displayName() }}
                  </span>
                  <span class="text-[9.5px] sm:text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {{ activeRoleBadge() }}
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

              <!-- Dropdown Menu (Google Account Style Role Switcher) -->
              @if (dropdownOpen()) {
                <div
                  class="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans"
                  role="menu"
                >
                  <!-- Current Active Account Banner (Google Account Style) -->
                  <div class="p-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/80 text-center relative">
                    <!-- Close button in top-right -->
                    <button
                      type="button"
                      (click)="closeDropdown()"
                      class="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer text-xs leading-none"
                      aria-label="Close menu"
                    >
                      &times;
                    </button>

                    <!-- Large Avatar Circle with Active Ring -->
                    <div class="relative w-13 h-13 mx-auto mb-2">
                      <div class="w-13 h-13 rounded-full flex items-center justify-center font-black text-base uppercase shadow-inner ring-4 ring-slate-100"
                        [ngClass]="activeAccountAvatarClass()">
                        {{ activeAccount().initials }}
                      </div>
                      <span class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold" title="Active Account">
                        &check;
                      </span>
                    </div>

                    <!-- User Name & Email -->
                    <h4 class="text-sm font-bold text-slate-900 m-0 truncate">
                      {{ activeAccount().name }}
                    </h4>
                    <p class="text-[11.5px] text-slate-500 m-0 mt-0.5 truncate">
                      {{ activeAccount().email }}
                    </p>

                    <!-- Active Role Pill -->
                    <div class="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0B3558]/10 text-[#0B3558] border border-[#0B3558]/20">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#0B3558] animate-pulse"></span>
                      <span>{{ activeAccount().title }} (Active)</span>
                    </div>
                  </div>

                  <!-- Switch Role / Account Section Header -->
                  <div class="px-4 pt-3 pb-1 flex items-center justify-between">
                    <span class="text-[10.5px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-[#0483AC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Switch Role Without Logout
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium">Click to switch</span>
                  </div>

                  <!-- List of Accounts / Roles to Switch -->
                  <div class="p-2 space-y-1 max-h-64 overflow-y-auto">
                    @for (acc of switchableAccounts; track acc.role) {
                      <button
                        type="button"
                        (click)="onSwitchRole(acc.role)"
                        class="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer group"
                        [ngClass]="currentRole() === acc.role ? 'bg-sky-50/80 border border-sky-200' : 'hover:bg-slate-50 border border-transparent'"
                      >
                        <!-- Role Avatar Circle -->
                        <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                          [ngClass]="acc.avatarBg">
                          {{ acc.initials }}
                        </div>

                        <!-- Role Text Info -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between gap-1">
                            <span class="text-xs font-bold text-slate-800 truncate group-hover:text-[#0B3558]"
                              [class.text-[#0B3558]]="currentRole() === acc.role">
                              {{ acc.title }}
                            </span>
                            @if (currentRole() === acc.role) {
                              <span class="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                Current
                              </span>
                            } @else {
                              <span class="text-[10px] font-semibold text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                Switch &rarr;
                              </span>
                            }
                          </div>
                          <p class="text-[11px] text-slate-500 truncate m-0 mt-0.5">
                            {{ acc.subtitle }}
                          </p>
                        </div>
                      </button>
                    }
                  </div>

                  <!-- Footer Actions: Profile & Logout -->
                  <div class="p-2 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                    <a
                      routerLink="/profile"
                      (click)="closeDropdown()"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-[#0B3558] hover:bg-white rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>View Profile</span>
                    </a>

                    <button
                      type="button"
                      (click)="onLogout()"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <svg class="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  readonly displayName = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    return u.label || u.ssoId || u.id;
  });

  readonly avatarChar = computed(() => {
    const name = this.displayName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  });

  readonly switchableAccounts = this.authService.getSwitchableAccounts();

  readonly currentRole = computed(() => {
    return this.currentUser()?.role || 'existing_user';
  });

  readonly activeAccount = computed(() => {
    const role = this.currentRole();
    return this.switchableAccounts.find(a => a.role === role) || this.switchableAccounts[0];
  });

  readonly activeRoleBadge = computed(() => {
    return this.activeAccount()?.badge || 'User';
  });

  readonly activeAccountAvatarClass = computed(() => {
    return this.activeAccount()?.avatarBg || 'bg-[#12365A] text-white';
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

  onSwitchRole(role: UserRole): void {
    this.dropdownOpen.set(false);
    this.authService.switchRole(role);
  }
}
