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
    class: 'block w-full'
  },
  template: `
    <header
      class="w-full bg-white border-b border-slate-200 box-border"
      [class.sticky]="isSticky"
      [class.top-0]="isSticky"
      [class.z-50]="isSticky"
      [class.shadow-sm]="isSticky"
      role="banner"
    >
      <div class="max-w-[1440px] mx-auto px-4 md:px-6 h-[68px] md:h-[76px] flex items-center justify-between gap-4">

        <!-- Left: Logos + Title -->
        <a routerLink="/" class="flex items-center gap-3 sm:gap-4 shrink-0 group" aria-label="ISMS 2.0 Home">
          <div class="flex items-center gap-2.5">
            <img
              src="/Rajasthan-Sarkar.png"
              alt="Government of Rajasthan"
              class="h-9 sm:h-11 md:h-[46px] w-auto object-contain select-none"
            />
            <img
              src="/rsldc-logo.png"
              alt="RSLDC"
              class="h-9 sm:h-11 md:h-[46px] w-auto object-contain select-none"
              onerror="this.src='/Rajasthan-Sarkar.png'"
            />
          </div>
          <div class="w-px h-7 sm:h-9 bg-slate-300 shrink-0"></div>
          <div class="flex flex-col justify-center leading-tight">
            <span class="text-[20px] sm:text-[24px] md:text-[26px] font-black text-[#0B3558] tracking-tight">
              ISMS<span class="text-[#EA580C]">2.0</span>
            </span>
            <p class="hidden sm:block text-[11px] font-medium text-slate-500 tracking-wide whitespace-nowrap m-0">
              Integrated Scheme Management System
            </p>
          </div>
        </a>

        <!-- Right: Language + Auth -->
        <div class="flex items-center gap-2 sm:gap-4 shrink-0">

          <!-- Language Switcher (always visible) -->
          <nav class="flex items-center gap-0.5 text-sm font-semibold" aria-label="Language selection">
            <button
              type="button"
              class="px-2.5 py-1.5 rounded transition-colors cursor-pointer border-0 bg-transparent text-sm"
              [class]="selectedLanguage() === 'en' ? 'text-[#0B3558] font-bold' : 'text-slate-400 hover:text-[#0B3558]'"
              (click)="onLanguageChange('en')"
            >English</button>
            <span class="text-slate-300 select-none text-base leading-none">|</span>
            <button
              type="button"
              class="px-2.5 py-1.5 rounded transition-colors cursor-pointer border-0 bg-transparent text-sm"
              [class]="selectedLanguage() === 'hi' ? 'text-[#0B3558] font-bold' : 'text-slate-400 hover:text-[#0B3558]'"
              (click)="onLanguageChange('hi')"
            >हिंदी</button>
          </nav>

          <!-- Divider -->
          <span class="text-slate-300 text-base select-none hidden sm:inline">|</span>

          <!-- === LOGGED IN: Clean Username Pill with Dropdown (No Progress Bar) === -->
          @if (currentUser()) {
            <div class="relative" id="user-menu-container">
              <!-- Trigger Button (Clean avatar icon + name + chevron) -->
              <button
                type="button"
                id="user-menu-btn"
                (click)="toggleDropdown()"
                class="inline-flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full py-1.5 pl-2 pr-3.5 transition-all shadow-xs cursor-pointer group"
                [attr.aria-expanded]="dropdownOpen()"
                aria-haspopup="true"
                aria-label="User menu"
              >
                <!-- Avatar Icon -->
                <div class="w-7 h-7 rounded-full bg-[#0B3558] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs shrink-0 select-none">
                  {{ avatarChar() }}
                </div>

                <!-- Username -->
                <span class="text-xs sm:text-sm font-semibold text-slate-800 max-w-[120px] sm:max-w-[150px] truncate group-hover:text-[#0B3558] transition-colors">
                  {{ displayName() }}
                </span>

                <!-- Chevron -->
                <svg
                  class="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200"
                  [class.rotate-180]="dropdownOpen()"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              @if (dropdownOpen()) {
                <div
                  class="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-[60] overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150"
                  role="menu"
                >
                  <!-- User Info Header (Clean name & SSOID, no progress bar) -->
                  <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50/75">
                    <p class="text-xs font-bold text-slate-800 truncate">{{ displayName() }}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">SSOID Applicant</p>
                  </div>

                  <!-- Menu Items -->
                  <div class="py-1" role="none">
                    <!-- Profile (writes Profile only) -->
                    <a
                      routerLink="/profile"
                      (click)="closeDropdown()"
                      class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0B3558] transition-colors cursor-pointer"
                      role="menuitem"
                    >
                      <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span class="font-medium">Profile</span>
                    </a>

                    <div class="h-px bg-slate-100 mx-3 my-1"></div>

                    <!-- Logout -->
                    <button
                      type="button"
                      (click)="onLogout()"
                      class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent text-left font-medium"
                      role="menuitem"
                    >
                      <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else if (isSsoPage()) {
            <!-- === ON SSO PAGE (not logged in): Back link === -->
            <a
              routerLink="/"
              class="inline-flex items-center gap-1.5 text-[#0B3558] hover:text-[#EA580C] border border-slate-300 hover:border-orange-300 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to ISMS</span>
            </a>
          } @else {
            <!-- === NOT LOGGED IN: Login button === -->
            <button
              type="button"
              class="inline-flex items-center gap-2 bg-[#0B3558] text-white rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold cursor-pointer shadow-sm hover:bg-[#07233B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              (click)="onLoginClick()"
              aria-label="Sign in to ISMS 2.0 Portal"
            >
              <span>Login</span>
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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

  readonly selectedLanguage = signal<'en' | 'hi'>('en');
  readonly isSsoPage = signal<boolean>(false);
  readonly dropdownOpen = signal<boolean>(false);

  readonly currentUser = this.authService.currentUser;

  readonly displayName = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    return u.name || u.username || u.id;
  });

  readonly avatarChar = computed(() => {
    const name = this.displayName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  });

  constructor() {
    this.isSsoPage.set(this.router.url.includes('/auth/login'));
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isSsoPage.set(event.urlAfterRedirects.includes('/auth/login'));
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
}
