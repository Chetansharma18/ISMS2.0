import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LanguageService, Language } from '../../services/language.service';
import { AuthService } from '../../auth/auth.service';
import { OtrFormService } from '../../../features/registration/services/otr-form.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <header
      class="w-full bg-white border-b border-slate-200 box-border transition-shadow duration-150"
      [class.sticky]="isSticky"
      [class.top-0]="isSticky"
      [class.z-50]="isSticky"
      [class.shadow-xs]="isSticky"
      role="banner"
    >
      <div
        class="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 h-[60px] md:h-[68px] flex items-center justify-between gap-2 sm:gap-4"
      >
        <!-- Left: Government of Rajasthan Logo & ISMS 2.0 Identity -->
        <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <!-- Rajasthan Government Emblem / Logo -->
          <a
            routerLink="/"
            class="inline-flex items-center shrink-0 rounded focus-visible:outline-2 focus-visible:outline-[#0B3558] focus-visible:outline-offset-2"
            aria-label="Government of Rajasthan - Integrated Scheme Management System Home"
          >
            <img
              src="/Rajasthan-Sarkar.png"
              alt="Government of Rajasthan"
              class="h-8 sm:h-9 md:h-[46px] w-auto max-w-[140px] object-contain block select-none"
              onerror="this.src='/emblem-new.png'"
            />
          </a>

          <!-- Subtle Vertical Divider -->
          <div
            class="w-px h-6 sm:h-7 md:h-[34px] bg-slate-300 shrink-0"
            aria-hidden="true"
          ></div>

          <!-- ISMS 2.0 System Titles -->
          <div class="flex flex-col justify-center leading-tight">
            <div class="flex items-baseline gap-1">
              <span
                class="text-lg sm:text-xl md:text-[22px] font-extrabold text-[#0B3558] tracking-tight"
                >ISMS</span
              >
              <span
                class="text-lg sm:text-xl md:text-[22px] font-extrabold text-[#EA580C] tracking-tight"
                >2.0</span
              >
            </div>
            <p
              class="hidden sm:block text-[10px] md:text-[11px] font-medium text-slate-500 tracking-tight whitespace-nowrap m-0 p-0"
            >
              Integrated Scheme Management System
            </p>
          </div>
        </div>

        <!-- Right: Language Selector & Login / User Action Area -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Language Switcher -->
          <nav
            class="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-slate-600"
            aria-label="Language selection"
          >
            <button
              type="button"
              class="bg-transparent border-0 px-1.5 py-1 text-xs sm:text-sm cursor-pointer rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#0B3558] focus-visible:outline-offset-1"
              [class]="selectedLanguage() === 'en' ? 'text-[#0B3558] font-bold' : 'text-slate-500 hover:text-[#0B3558]'"
              [attr.aria-pressed]="selectedLanguage() === 'en'"
              (click)="onLanguageChange('en')"
            >
              English
            </button>

            <span
              class="text-slate-300 text-xs select-none"
              aria-hidden="true"
              >|</span
            >

            <button
              type="button"
              class="bg-transparent border-0 px-1.5 py-1 text-xs sm:text-sm cursor-pointer rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#0B3558] focus-visible:outline-offset-1"
              [class]="selectedLanguage() === 'hi' ? 'text-[#0B3558] font-bold' : 'text-slate-500 hover:text-[#0B3558]'"
              [attr.aria-pressed]="selectedLanguage() === 'hi'"
              (click)="onLanguageChange('hi')"
            >
              हिंदी
            </button>
          </nav>

          <!-- Control Separator -->
          <span
            class="hidden sm:inline text-slate-300 text-sm select-none"
            aria-hidden="true"
            >|</span
          >

          <!-- 1. Logged In: Show Username Pill & Profile Completion Progress & Logout Button -->
          @if (effectiveUser()) {
            <div class="flex items-center gap-2 sm:gap-3">
              <a
                routerLink="/registration"
                class="inline-flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-full py-1 pl-1.5 pr-3 transition-all duration-200 shadow-2xs group cursor-pointer"
                title="Profile Completion: {{ otrProgress() }}% (Click to complete registration)"
              >
                <!-- Avatar with Circular Progress SVG Ring -->
                <div class="relative w-7 h-7 flex items-center justify-center shrink-0">
                  <svg class="w-7 h-7 -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      class="text-slate-200"
                      stroke-width="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      class="text-emerald-500 transition-all duration-700 ease-out"
                      [attr.stroke-dasharray]="otrProgress() + ', 100'"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span class="absolute inset-0 flex items-center justify-center font-bold text-[11px] text-[#0B3558] uppercase">
                    {{ effectiveUser()?.charAt(0) || 'U' }}
                  </span>
                </div>

                <!-- Username & Mini Progress Bar -->
                <div class="flex flex-col items-start leading-none min-w-0">
                  <span class="text-xs font-semibold text-slate-800 max-w-[130px] truncate group-hover:text-[#0B3558]">
                    {{ effectiveUser() }}
                  </span>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <div class="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        class="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        [style.width.%]="otrProgress()"
                      ></div>
                    </div>
                    <span class="text-[10px] font-bold text-emerald-600">
                      {{ otrProgress() }}%
                    </span>
                  </div>
                </div>
              </a>

              <!-- Compact Logout Button -->
              <button
                type="button"
                (click)="onLogout()"
                class="inline-flex items-center gap-1 text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-300 hover:border-red-300 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                title="Logout"
                aria-label="Logout"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
          }
          <!-- 2. On SSO Login Route and Not Logged In: Show Back to ISMS 2.0 Link -->
          @else if (isSsoPage()) {
            <a
              routerLink="/"
              class="inline-flex items-center gap-1.5 text-[#0B3558] hover:text-[#EA580C] hover:bg-orange-50/60 border border-slate-300 hover:border-orange-300 rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to ISMS</span>
            </a>
          }
          <!-- 3. Normal State: Compact Government Login Button -->
          @else {
            <button
              type="button"
              class="inline-flex items-center gap-1.5 bg-[#0B3558] text-white border border-[#0B3558] rounded px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold leading-none cursor-pointer shadow-xs hover:bg-[#07233B] hover:border-[#07233B] transition-colors focus-visible:outline-2 focus-visible:outline-[#0B3558] focus-visible:outline-offset-2"
              (click)="onLoginClick()"
              aria-label="Sign in to ISMS 2.0 Portal"
            >
              <svg
                class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span>Login</span>
            </button>
          }

        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private readonly languageService = inject(LanguageService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly otrFormService = inject(OtrFormService);

  readonly otrProgress = this.otrFormService.completionPercentage;

  /** Controls whether the header sticks to the top of the viewport */
  @Input() isSticky: boolean = true;

  /** Optional username override passed from parent */
  @Input() username: string | null = null;

  /** Emits when the Login button is clicked */
  @Output() loginClicked = new EventEmitter<void>();

  /** Emits when the user switches language */
  @Output() languageChanged = new EventEmitter<Language>();

  /** Active language signal ('en' | 'hi') */
  readonly selectedLanguage = this.languageService.currentLanguage;

  /** Route detector: checks if current route is SSO login */
  readonly isSsoPage = signal<boolean>(false);

  /** Effective username: uses passed username or logged in currentUser */
  readonly effectiveUser = computed(() => {
    if (this.username) {
      return this.username;
    }
    const current = this.authService.currentUser();
    return current ? (current.ssoId || current.label) : null;
  });

  constructor() {
    // Initial check
    this.isSsoPage.set(this.router.url.includes('/sso-login'));

    // Reactive route listener
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isSsoPage.set(event.urlAfterRedirects.includes('/sso-login'));
      });
  }

  onLanguageChange(lang: Language): void {
    this.languageService.setLanguage(lang);
    this.languageChanged.emit(lang);
  }

  onLoginClick(): void {
    this.loginClicked.emit();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
