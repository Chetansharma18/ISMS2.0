import { Component, OnInit, signal, inject, Input } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
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
    <header class="w-full bg-white border-b border-slate-200/90 shadow-2xs font-sans sticky top-0 z-40 select-none">
      <div class="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-4 min-h-[68px]">
        
        <!-- Left Branding: Two Emblems (Ashoka + RSLDC) + Government Titles + ISMS 2.0 -->
        <div class="flex items-center gap-2 sm:gap-3.5 min-w-0 cursor-pointer" routerLink="/">
          
          <!-- Official Ashoka Lion Capital Emblem of India -->
          <div class="flex-shrink-0 w-8 h-11 sm:w-11 sm:h-14 flex items-center justify-center">
            <img 
              src="emblem.png" 
              alt="Government of Rajasthan - State Emblem of India"
              class="h-full w-auto object-contain select-none" 
            />
          </div>

          <!-- Official RSLDC Circular Emblem -->
          <div class="flex-shrink-0 w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center">
            <img 
              src="rsldc-logo.png" 
              alt="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)"
              class="h-full w-full object-contain select-none drop-shadow-2xs" 
            />
          </div>

          <!-- Department Text Block -->
          <div class="text-left flex flex-col justify-center min-w-0">
            <div class="text-[10px] sm:text-[12.5px] font-bold text-[#092244] leading-[1.2] whitespace-nowrap">
              {{ t().navbar.govtRajasthan }}
            </div>
            <div class="text-[9.5px] sm:text-[12px] font-bold text-[#092244] leading-[1.2] whitespace-nowrap">
              {{ t().navbar.rsldcLine1 }}
            </div>
            <div class="text-[9.5px] sm:text-[12px] font-bold text-[#092244] leading-[1.2] whitespace-nowrap hidden xs:block">
              {{ t().navbar.rsldcLine2 }}
            </div>
          </div>

          <!-- Thin Vertical Divider Line -->
          <div class="hidden sm:block h-9 w-[1.5px] bg-slate-300 mx-1 sm:mx-2 shrink-0"></div>

          <!-- System Branding: ISMS in Navy, 2.0 in Orange/Amber -->
          <div class="hidden sm:flex text-left flex-col justify-center shrink-0">
            <div class="flex items-baseline leading-none">
              <span class="text-xl sm:text-2xl font-extrabold text-[#092244] tracking-tight">ISMS</span>
              <span class="text-xl sm:text-2xl font-extrabold text-[#f59e0b] ml-1">2.0</span>
            </div>
            <div class="text-[10.5px] sm:text-[11.5px] text-slate-500 font-medium tracking-tight mt-0.5">
              {{ t().navbar.ismsSubtitle }}
            </div>
          </div>

        </div>

        <!-- Right Utilities: Accessibility, Language & Logged-In User Name -->
        <div class="flex items-center justify-end gap-2.5 sm:gap-4 shrink-0">
          
          <!-- Font Sizing: A- A A+ -->
          <div class="hidden md:flex items-center space-x-1.5 text-slate-700">
            <button 
              type="button" 
              (click)="setFontSize('sm')"
              [class.font-extrabold]="fontSize() === 'sm'"
              [class.text-[#002244]]="fontSize() === 'sm'"
              [class.underline]="fontSize() === 'sm'"
              class="hover:text-blue-700 text-[11px] px-1 transition cursor-pointer"
              title="Decrease text size (A-)">
              A-
            </button>
            <button 
              type="button" 
              (click)="setFontSize('md')"
              [class.font-extrabold]="fontSize() === 'md'"
              [class.text-[#002244]]="fontSize() === 'md'"
              [class.underline]="fontSize() === 'md'"
              class="hover:text-blue-700 text-xs px-1 transition cursor-pointer"
              title="Standard text size (A)">
              A
            </button>
            <button 
              type="button" 
              (click)="setFontSize('lg')"
              [class.font-extrabold]="fontSize() === 'lg'"
              [class.text-[#002244]]="fontSize() === 'lg'"
              [class.underline]="fontSize() === 'lg'"
              class="hover:text-blue-700 text-xs font-semibold px-1 transition cursor-pointer"
              title="Increase text size (A+)">
              A+
            </button>
          </div>

          <span class="hidden md:block text-slate-300">|</span>



          <!-- User's Personal Name & Profile (As input during profile creation) -->
          <div *ngIf="userProfile$ | async as profile" class="flex items-center gap-2 sm:gap-2.5 pl-0.5 sm:pl-1 cursor-pointer" routerLink="/profile" title="View & Edit Profile">
            
            <!-- Avatar Circle with Initial (Before name) -->
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#002244] text-amber-300 border border-[#002244]/20 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {{ (profile.personal.fullName || 'U').charAt(0).toUpperCase() }}
            </div>

            <!-- User Name & Role Text Block -->
            <div class="text-left hidden sm:block leading-none">
              <div class="text-xs sm:text-[13px] font-extrabold text-[#002244] truncate max-w-[180px]" [title]="profile.personal.fullName">
                {{ profile.personal.fullName || 'Authorized Signatory' }}
              </div>
              <div class="mt-1 flex items-center justify-start gap-1 text-[10.5px]">
                <span *ngIf="profile.isRegistered" class="text-emerald-700 font-semibold truncate">
                  ✓ {{ profile.personal.designation || 'Signatory Authority' }}
                </span>
                <span *ngIf="!profile.isRegistered" class="text-amber-700 font-bold">
                  ⚠️ OTR Pending
                </span>
              </div>
            </div>

          </div>

          <!-- Mobile Menu Toggle Button (Visible only on screens < md) -->
          <button 
            type="button" 
            (click)="toggleMobileMenu()"
            class="md:hidden p-1.5 rounded-xs text-[#002244] hover:bg-slate-100 transition cursor-pointer shrink-0 border border-slate-200"
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
      <div *ngIf="mobileMenuOpen()" class="md:hidden bg-white border-b border-slate-200 shadow-lg px-4 py-3 space-y-2.5">
        <!-- User Organization Info (If logged in) -->
        <div *ngIf="userProfile$ | async as profile" class="p-2.5 rounded-xs bg-slate-50 border border-slate-200">
          <div class="font-bold text-xs text-[#002244] truncate">
            {{ profile.organization.name || 'Applicant Organization' }}
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
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
            class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xs transition">
            <span>📋</span>
            <span>Active Schemes &amp; Tenders</span>
          </a>
          <a 
            routerLink="/eoi/my-applications" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-bold border-l-2 border-[#002244]"
            class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xs transition">
            <span>📁</span>
            <span>My EOI Applications</span>
          </a>
          <a 
            routerLink="/eoi/tracker/ISMS-EOI-2026-9871" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-bold border-l-2 border-[#002244]"
            class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xs transition">
            <span>⏱</span>
            <span>Tender Status</span>
          </a>
          <a 
            routerLink="/profile" 
            (click)="closeMobileMenu()"
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-bold border-l-2 border-[#002244]"
            class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xs transition">
            <span>👤</span>
            <span>Entity &amp; Applicant Profile</span>
          </a>
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

  readonly userProfile$: Observable<UserProfile> = this.eoiStateService.userProfile$;
  readonly currentLanguage = this.languageService.currentLanguage;
  readonly t = this.languageService.t;
  readonly fontSize = signal<FontSize>('md');
  readonly mobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
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
