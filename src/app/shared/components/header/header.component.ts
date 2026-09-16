import { Component, OnInit, signal, inject, Input } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { CommonModule, NgIf, AsyncPipe } from '@angular/common';
import { EoiStateService, UserProfile } from '../../../core/services/eoi-state.service';
import { LanguageService, Language } from '../../../core/services/language.service';
import { Observable } from 'rxjs';

export type FontSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, NgIf, AsyncPipe],
  template: `
    <!-- Top Government Authenticated Portal Header (Dual Logos, Bilingual, User Name & Profile) -->
    <header class="w-full bg-[#f0f6fc] border-b border-slate-200/90 shadow-2xs font-['Poppins',sans-serif] sticky top-0 z-40 select-none">
      <div class="w-full px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 flex items-center justify-between gap-2 sm:gap-4">
        
        <!-- Left Branding: Two Emblems (Ashoka + RSLDC) + Government Titles + ISMS 2.0 -->
        <div class="flex items-center gap-1.5 sm:gap-3.5 lg:gap-4 min-w-0 cursor-pointer" routerLink="/">
          
          <!-- Official Ashoka Lion Capital Emblem of India -->
          <div class="flex-shrink-0 flex items-center justify-center">
            <img 
              src="emblem.png" 
              alt="Government of Rajasthan - State Emblem of India"
              class="h-9 sm:h-[52px] lg:h-[60px] w-auto object-contain select-none" 
            />
          </div>

          <!-- Official RSLDC Circular Emblem -->
          <div class="flex-shrink-0 flex items-center justify-center">
            <img 
              src="rsldc-logo.png" 
              alt="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)"
              class="h-9 w-9 sm:h-[52px] sm:w-[52px] lg:h-[60px] lg:w-[60px] object-contain select-none drop-shadow-2xs" 
            />
          </div>

          <!-- Thin Vertical Divider Line -->
          <div class="h-7 sm:h-10 lg:h-11 w-[1.5px] bg-slate-300 mx-0.5 sm:mx-2 lg:mx-2.5 shrink-0"></div>

          <!-- System Branding: ISMS in Navy, 2.0 in Orange/Amber -->
          <div class="flex text-left flex-col justify-center shrink-0">
            <div class="flex items-baseline leading-none">
              <span class="text-lg sm:text-2xl lg:text-[27px] font-extrabold text-[#092244] tracking-tight">ISMS</span>
              <span class="text-lg sm:text-2xl lg:text-[27px] font-extrabold text-[#f59e0b] ml-1">2.0</span>
            </div>
            <div class="hidden sm:block text-[10.5px] sm:text-[11.5px] lg:text-[12px] text-slate-600 font-medium tracking-tight mt-0.5 sm:mt-1">
              {{ t().navbar.ismsSubtitle }}
            </div>
          </div>

        </div>

        <!-- Right Utilities: Language & Logged-In User Profile with Logout Menu -->
        <div class="flex items-center justify-end gap-1.5 sm:gap-4 shrink-0">
          
          <!-- English | हिंदी (Matches Landing Page) -->
          <div class="flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-[12.5px] font-medium text-slate-700 bg-white/80 border border-slate-200/90 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 shadow-2xs">
            <button (click)="setLanguage('en')" [class.text-[#002244]]="currentLanguage() === 'en'"
              [class.font-bold]="currentLanguage() === 'en'" class="hover:text-blue-700 transition cursor-pointer">
              English
            </button>
            <span class="text-slate-300">|</span>
            <button (click)="setLanguage('hi')" [class.text-[#002244]]="currentLanguage() === 'hi'"
              [class.font-bold]="currentLanguage() === 'hi'" class="hover:text-blue-700 transition cursor-pointer">
              हिंदी
            </button>
          </div>

          <span class="text-slate-300 hidden sm:inline">|</span>

          <!-- User's Personal Name & Profile Dropdown Trigger -->
          <div *ngIf="userProfile$ | async as profile" class="relative">
            
            <!-- Profile Button Trigger -->
            <button 
              type="button"
              (click)="toggleUserMenu($event)"
              class="flex items-center gap-1.5 sm:gap-2.5 pl-0.5 sm:pl-1 text-left cursor-pointer hover:opacity-90 transition rounded-lg p-0.5 sm:p-1"
              title="User Account Menu">
              
              <!-- Avatar Circle with Initial -->
              <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#002244] text-amber-300 border border-[#002244]/20 flex items-center justify-center font-bold text-[11px] sm:text-xs shadow-xs shrink-0">
                {{ (profile.personal.fullName || 'U').charAt(0).toUpperCase() }}
              </div>

              <!-- User Name & Designation Block -->
              <div class="text-left hidden sm:flex sm:flex-col justify-center leading-tight py-0.5">
                <div class="text-xs sm:text-[13px] font-extrabold text-[#002244] truncate max-w-[150px] md:max-w-[200px]" [title]="profile.personal.fullName">
                  {{ profile.personal.fullName || 'Authorized Signatory' }}
                </div>
                <div class="mt-0.5 flex items-center justify-start gap-1 text-[11px] leading-normal">
                  <span *ngIf="profile.isRegistered" class="text-emerald-700 font-semibold truncate flex items-center gap-1">
                    <svg class="w-3 h-3 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span class="truncate max-w-[120px]">{{ profile.personal.designation || 'Signatory Authority' }}</span>
                  </span>
                  <span *ngIf="!profile.isRegistered" class="text-amber-700 font-bold">
                    ⚠️ OTR Pending
                  </span>
                </div>
              </div>

              <!-- Dropdown Caret Icon -->
              <svg class="w-3.5 h-3.5 text-slate-500 ml-0.5 transition-transform" [class.rotate-180]="userMenuOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>

            </button>

            <!-- Backdrop to close dropdown on outside click -->
            <div *ngIf="userMenuOpen()" (click)="closeUserMenu()" class="fixed inset-0 z-40"></div>

            <!-- Profile Dropdown Menu with Logout Option -->
            <div 
              *ngIf="userMenuOpen()" 
              class="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-['Poppins',sans-serif]">
              
              <button 
                type="button"
                (click)="logout()"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition text-left cursor-pointer">
                <svg class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>

            </div>

          </div>

          <!-- Mobile Menu Toggle Button (Visible only on screens < md) -->
          <button 
            type="button" 
            (click)="toggleMobileMenu()"
            class="md:hidden p-1.5 rounded-md text-[#002244] hover:bg-slate-200/70 transition cursor-pointer shrink-0 border border-slate-300"
            aria-label="Toggle Portal Navigation Menu">
            <svg *ngIf="!mobileMenuOpen()" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <svg *ngIf="mobileMenuOpen()" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

        </div>

      </div>

      <!-- Mobile Drawer Navigation (Slide down on screens < md) -->
      <div *ngIf="mobileMenuOpen()" class="md:hidden bg-white border-b border-slate-200 shadow-lg px-4 py-3 space-y-2.5 max-h-[80vh] overflow-y-auto">
        <!-- User Organization Info (If logged in) -->
        <div *ngIf="userProfile$ | async as profile" class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div class="font-bold text-xs text-[#002244] truncate">
            {{ profile.organization.name || 'Applicant Organization' }}
          </div>
          <div class="text-[10.5px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span *ngIf="profile.isRegistered" class="text-emerald-700 font-semibold">✓ Verified Partner</span>
            <span *ngIf="!profile.isRegistered" class="text-amber-700 font-semibold">⚠️ OTR Pending</span>
            <span>•</span>
            <span class="font-mono">SSO: {{ profile.ssoId }}</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1">
          <a 
            routerLink="/schemes" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-bold border-l-2 border-[#002244]"
            class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition">
            <span>📋</span>
            <span>Active Schemes &amp; Tenders</span>
          </a>
          <a 
            routerLink="/eoi/tender-status" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-bold border-l-2 border-[#002244]"
            class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition">
            <span>⏱</span>
            <span>Tender Status</span>
          </a>
          
          <!-- Profile Group in Mobile Drawer with Direct Links to all 4 Sub-Sections -->
          <div class="pt-1">
            <div class="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Profile Sections
            </div>
            <div class="space-y-0.5 pl-2 border-l-2 border-slate-200 ml-2">
              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 1 }"
                (click)="closeMobileMenu()"
                class="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-[#002244]"></span>
                <span>1. Organisation Details</span>
              </a>
              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 2 }"
                (click)="closeMobileMenu()"
                class="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-[#002244]"></span>
                <span>2. Authorized Person Details</span>
              </a>
              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 3 }"
                (click)="closeMobileMenu()"
                class="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-[#002244]"></span>
                <span>3. Bank Details</span>
              </a>
              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 4 }"
                (click)="closeMobileMenu()"
                class="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-[#002244]"></span>
                <span>4. Uploaded Documents</span>
              </a>
            </div>
          </div>
        </nav>
      </div>

      <!-- Subtle Accent Line at bottom (Thin Saffron / Gold Highlight) -->
      <div class="h-[2.5px] w-full bg-gradient-to-r from-[#002244] via-[#f59e0b] to-[#002244]"></div>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  @Input() isAuthenticated = true;

  protected readonly languageService = inject(LanguageService);
  private readonly eoiStateService = inject(EoiStateService);
  private readonly router = inject(Router);

  readonly userProfile$: Observable<UserProfile> = this.eoiStateService.userProfile$;
  readonly currentLanguage = this.languageService.currentLanguage;
  readonly t = this.languageService.t;
  readonly fontSize = signal<FontSize>('md');
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly userMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleUserMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.userMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  logout(): void {
    this.closeUserMenu();
    this.eoiStateService.setPersona('citizen', 'new');
    this.router.navigate(['/auth/login']);
  }

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      let initialSize = this.fontSize();
      try {
        const saved = localStorage.getItem('isms_font_size') as FontSize;
        if (saved && (saved === 'sm' || saved === 'md' || saved === 'lg')) {
          initialSize = saved;
        }
      } catch (e) {}
      this.setFontSize(initialSize);
    }
  }

  setLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
  }

  setFontSize(size: FontSize): void {
    this.fontSize.set(size);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg');
      document.documentElement.classList.add(`font-scale-${size}`);
      document.body.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg');
      document.body.classList.add(`font-scale-${size}`);

      if (size === 'sm') {
        (document.body.style as any).zoom = '0.9';
      } else if (size === 'lg') {
        (document.body.style as any).zoom = '1.12';
      } else {
        (document.body.style as any).zoom = '1';
      }

      try {
        localStorage.setItem('isms_font_size', size);
      } catch (e) {}
    }
  }
}
