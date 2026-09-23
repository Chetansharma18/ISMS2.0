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
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <header
      class="w-full bg-white border-b border-slate-200 box-border sticky top-0 z-50 shadow-sm"
      role="banner"
    >
      <div class="max-w-[1440px] mx-auto px-4 md:px-6 h-[68px] md:h-[76px] flex items-center justify-between gap-4">

        <!-- Left: Logos + Title -->
        <a routerLink="/" class="flex items-center gap-3 sm:gap-4 shrink-0 group" aria-label="ISMS 2.0 Home">
          <div class="flex items-center gap-2.5">
            <img
              src="/Rajasthan-Sarkar.png"
              alt="Government of Rajasthan"
              class="w-auto object-contain select-none"
              style="height:44px;max-height:44px;"
              onerror="this.src='/emblem-new.png'"
            />
            <img
              src="/rsldc-logo.png"
              alt="RSLDC"
              class="w-auto object-contain select-none"
              style="height:44px;max-height:44px;"
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

          <!-- Language Switcher -->
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

          <span class="text-slate-300 text-base select-none hidden sm:inline">|</span>

          <!-- LOGGED IN: Username pill with dropdown -->
          @if (currentUser()) {
            <div class="relative" id="user-menu-container">
              <button
                type="button"
                id="user-menu-btn"
                (click)="toggleDropdown()"
                class="inline-flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full py-1.5 pl-2 pr-3.5 transition-all shadow-xs cursor-pointer group"
                [attr.aria-expanded]="dropdownOpen()"
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div class="w-7 h-7 rounded-full bg-[#0B3558] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs shrink-0 select-none">
                  {{ avatarChar() }}
                </div>
                <span class="text-xs sm:text-sm font-semibold text-slate-800 max-w-[120px] sm:max-w-[150px] truncate group-hover:text-[#0B3558] transition-colors">
                  {{ displayName() }}
                </span>
                <svg
                  class="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200"
                  [class.rotate-180]="dropdownOpen()"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (dropdownOpen()) {
                <div
                  class="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150 font-['Inter',sans-serif]"
                  role="menu"
                >
                  <!-- User Header -->
                  <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between">
                    <div class="min-w-0 pr-2">
                      <p class="text-xs font-black text-slate-900 truncate">{{ displayName() }}</p>
                      <p class="text-[11px] font-semibold text-[#0B3558] truncate mt-0.5">{{ userRoleLabel() }}</p>
                    </div>
                    <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 shrink-0 select-none">
                      Active
                    </span>
                  </div>

                  <!-- Navigation Options Header -->
                  <div class="px-4 pt-2.5 pb-1 flex items-center justify-between">
                    <span class="text-[10px] font-black tracking-wider uppercase text-slate-400">All Portal Options</span>
                    <span class="text-[10px] font-semibold text-slate-400">Quick Access</span>
                  </div>

                  <!-- Menu Links List -->
                  <div class="py-1 max-h-[380px] overflow-y-auto" role="none">
                    
                    <!-- 1. Active Schemes & Tenders -->
                    <a
                      routerLink="/schemes"
                      (click)="closeDropdown()"
                      class="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer group"
                      role="menuitem"
                    >
                      <div class="w-7 h-7 rounded-lg bg-blue-50 text-[#0B3558] flex items-center justify-center shrink-0 group-hover:bg-[#0B3558] group-hover:text-white transition-colors">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <span class="block text-xs font-bold text-slate-800 group-hover:text-[#0B3558] transition-colors">Active Schemes &amp; Tenders</span>
                        <span class="block text-[10.5px] text-slate-400 truncate">EOI Tenders &amp; Proposals</span>
                      </div>
                    </a>

                    <!-- 2. SDC Management -->
                    <a
                      routerLink="/sdcs"
                      (click)="closeDropdown()"
                      class="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer group"
                      role="menuitem"
                    >
                      <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <span class="block text-xs font-bold text-slate-800 group-hover:text-[#0B3558] transition-colors">SDC Management</span>
                        <span class="block text-[10.5px] text-slate-400 truncate">Skill Centers &amp; Infrastructure</span>
                      </div>
                    </a>

                    <!-- 3. Batch Management -->
                    <a
                      routerLink="/batches"
                      (click)="closeDropdown()"
                      class="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer group"
                      role="menuitem"
                    >
                      <div class="w-7 h-7 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center shrink-0 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <span class="block text-xs font-bold text-slate-800 group-hover:text-[#0B3558] transition-colors">Batch Management</span>
                        <span class="block text-[10.5px] text-slate-400 truncate">Create &amp; Manage Training Batches</span>
                      </div>
                    </a>

                    <!-- 4. Sanction Orders -->
                    <a
                      routerLink="/tp/sanction-orders"
                      (click)="closeDropdown()"
                      class="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer group"
                      role="menuitem"
                    >
                      <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <span class="block text-xs font-bold text-slate-800 group-hover:text-[#0B3558] transition-colors">Sanction Orders</span>
                        <span class="block text-[10.5px] text-slate-400 truncate">Target Allocations &amp; Letters</span>
                      </div>
                    </a>

                    <!-- 5. Aspirant List -->
                    <a
                      routerLink="/trainees"
                      (click)="closeDropdown()"
                      class="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer group"
                      role="menuitem"
                    >
                      <div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                          <line x1="8" y1="6" x2="21" y2="6"></line>
                          <line x1="8" y1="12" x2="21" y2="12"></line>
                          <line x1="8" y1="18" x2="21" y2="18"></line>
                          <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <span class="block text-xs font-bold text-slate-800 group-hover:text-[#0B3558] transition-colors">Aspirants List</span>
                        <span class="block text-[10.5px] text-slate-400 truncate">Candidate Enrolments &amp; Forms</span>
                      </div>
                    </a>

                    <!-- 6. Attendance Setup -->
                    <a
                      routerLink="/attendance/users"
                      (click)="closeDropdown()"
                      class="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer group"
                      role="menuitem"
                    >
                      <div class="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <span class="block text-xs font-bold text-slate-800 group-hover:text-[#0B3558] transition-colors">Attendance Setup</span>
                        <span class="block text-[10.5px] text-slate-400 truncate">AEBAS Devices &amp; Biometric Logs</span>
                      </div>
                    </a>

                    <!-- 7. My Profile -->
                    <a
                      routerLink="/profile"
                      (click)="closeDropdown()"
                      class="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer group"
                      role="menuitem"
                    >
                      <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <span class="block text-xs font-bold text-slate-800 group-hover:text-[#0B3558] transition-colors">My Profile (OTR)</span>
                        <span class="block text-[10.5px] text-slate-400 truncate">Entity &amp; Bank Details</span>
                      </div>
                    </a>

                  </div>

                  <div class="h-px bg-slate-100 mx-3 my-1"></div>

                  <!-- Logout Button -->
                  <button
                    type="button"
                    (click)="onLogout()"
                    class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-bold transition-colors cursor-pointer border-0 bg-transparent text-left"
                    role="menuitem"
                  >
                    <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout from Portal</span>
                  </button>
                </div>
              }
            </div>
          } @else {
          <!-- NOT LOGGED IN: Login button -->
            <button
              type="button"
              class="inline-flex items-center gap-2 bg-[#0B3558] text-white rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold cursor-pointer shadow-sm hover:bg-[#07233B] transition-colors"
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
  public authService = inject(AuthService);

  @Input() isAuthenticated = false;
  @Input() isSticky = true;
  @Input() currentLang: 'en' | 'hi' = 'en';

  @Output() languageChanged = new EventEmitter<'en' | 'hi'>();
  @Output() loginClicked = new EventEmitter<void>();

  readonly selectedLanguage = signal<'en' | 'hi'>('en');
  readonly dropdownOpen = signal<boolean>(false);

  readonly currentUser = this.authService.currentUser;

  readonly displayName = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    return (u as any).label || (u as any).name || (u as any).ssoId || (u as any).username || (u as any).id || 'User';
  });

  readonly userRoleLabel = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    if (u.role === 'TP_PIA') return 'Training Partner (TP / PIA)';
    if (u.role === 'SUPER_ADMIN') return 'Super Administrator';
    if (u.role === 'DEPARTMENT_ADMIN') return 'Department Admin (RSLDC)';
    if (u.role === 'AUDITOR') return 'Auditor';
    return 'SSOID Applicant';
  });

  readonly avatarChar = computed(() => {
    const name = this.displayName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  });

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.dropdownOpen.set(false);
      });
  }

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
    this.router.navigate(['/auth/login']);
  }

  onLogout(): void {
    this.closeDropdown();
    this.authService.logout();
  }
}
