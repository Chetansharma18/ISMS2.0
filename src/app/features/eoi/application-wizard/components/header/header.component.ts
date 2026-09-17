import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf } from '@angular/common';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { EoiService } from '../../services/eoi.service';
import { EoiStateService, UserProfile } from '../../../../../core/services/eoi-state.service';
import { LanguageService, Language } from '../../../../../core/services/language.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-arpit-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, NgIf, AsyncPipe],
  template: `
    <!-- Top Government Authenticated Portal Header (Dual Logos, Bilingual, User Profile, EOI Badge & Auto-save) -->
    <header class="w-full bg-[#f0f6fc] border-b border-slate-200/90 shadow-2xs font-['Poppins',sans-serif] sticky top-0 z-50 select-none">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 flex items-center justify-between gap-4">
        
        <!-- Left Branding: Two Emblems (Ashoka + RSLDC) + Government Titles + ISMS 2.0 -->
        <div class="flex items-center gap-2.5 sm:gap-3.5 lg:gap-4 min-w-0 cursor-pointer" routerLink="/">
          
          <!-- Official Ashoka Lion Capital Emblem of India -->
          <div class="flex-shrink-0 flex items-center justify-center">
            <img 
              src="emblem-new.png" 
              alt="Government of Rajasthan - State Emblem of India"
              class="h-11 sm:h-[52px] lg:h-[58px] w-auto object-contain select-none" 
            />
          </div>

          <!-- Official RSLDC Circular Emblem -->
          <div class="flex-shrink-0 flex items-center justify-center">
            <img 
              src="rsldc-logo.png" 
              alt="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)"
              class="h-11 w-11 sm:h-[52px] sm:w-[52px] lg:h-[58px] lg:w-[58px] object-contain select-none drop-shadow-2xs" 
            />
          </div>

          <!-- Thin Vertical Divider Line -->
          <div class="h-8 sm:h-10 lg:h-11 w-[1.5px] bg-slate-300 mx-1 sm:mx-2 shrink-0"></div>

          <!-- System Branding: ISMS in Navy, 2.0 in Orange/Amber -->
          <div class="flex text-left flex-col justify-center shrink-0">
            <div class="flex items-baseline leading-none">
              <span class="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#092244] tracking-tight">ISMS</span>
              <span class="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#f59e0b] ml-1">2.0</span>
            </div>
            <div class="hidden sm:block text-[10.5px] sm:text-[11.5px] lg:text-[12px] text-slate-600 font-medium tracking-tight mt-0.5 sm:mt-1">
              {{ t().navbar.ismsSubtitle }}
            </div>
          </div>

        </div>

        <!-- Right Utilities: EOI Application Portal Badge, Auto-Saved Indicator, Language & User Profile -->
        <div class="flex items-center justify-end gap-2.5 sm:gap-3.5 lg:gap-4 shrink-0">
          
          <!-- EOI Application Portal Badge -->
          <div class="hidden md:flex items-center px-3 py-1 bg-[#002244] text-white text-[11px] font-bold rounded-xs tracking-wider uppercase shadow-2xs border border-[#002244]/40">
            EOI APPLICATION PORTAL
          </div>

          <!-- Auto-saved Indicator -->
          <div class="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 border border-slate-200/90 rounded-xs shadow-2xs text-[11.5px] font-semibold text-slate-700">
            <span 
              class="w-2 h-2 rounded-full transition-colors"
              [ngClass]="eoiService.autoSaveStatus() === 'saving' ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'">
            </span>
            <span class="text-slate-600 font-medium">
              {{ eoiService.autoSaveStatus() === 'saving' ? 'Saving...' : 'Auto-saved' }}
            </span>
          </div>

          <!-- English | हिंदी -->
          <div class="hidden sm:flex items-center space-x-1.5 text-[12px] font-medium text-slate-700 bg-white/70 border border-slate-200/90 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <button 
              type="button"
              (click)="setLanguage('en')" 
              [class.text-[#002244]]="currentLanguage() === 'en'"
              [class.font-bold]="currentLanguage() === 'en'" 
              class="hover:text-blue-700 transition cursor-pointer">
              English
            </button>
            <span class="text-slate-300">|</span>
            <button 
              type="button"
              (click)="setLanguage('hi')" 
              [class.text-[#002244]]="currentLanguage() === 'hi'"
              [class.font-bold]="currentLanguage() === 'hi'" 
              class="hover:text-blue-700 transition cursor-pointer">
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
              class="flex items-center gap-2 sm:gap-2.5 pl-0.5 sm:pl-1 text-left cursor-pointer hover:opacity-90 transition rounded-lg p-1"
              title="User Account Menu">
              
              <!-- Avatar Circle with Initial -->
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#002244] text-amber-300 border border-[#002244]/20 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {{ (profile.personal.fullName || 'V').charAt(0).toUpperCase() }}
              </div>

              <!-- User Name & Designation Block -->
              <div class="text-left hidden lg:flex lg:flex-col justify-center leading-tight py-0.5">
                <div class="text-xs sm:text-[13px] font-extrabold text-[#002244] truncate max-w-[190px]" [title]="profile.personal.fullName">
                  {{ profile.personal.fullName || 'Vikramaditya Sharma' }}
                </div>
                <div class="mt-0.5 flex items-center justify-start gap-1 text-[11px] leading-normal">
                  <span *ngIf="profile.isRegistered" class="text-emerald-700 font-semibold truncate flex items-center gap-1">
                    <svg class="w-3 h-3 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{{ profile.personal.designation || 'Managing Director & Authorized Signatory' }}</span>
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

            <!-- Profile Dropdown Menu with ONLY Logout Option -->
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

        </div>

      </div>

      <!-- Subtle Accent Line at bottom (Thin Saffron / Gold Highlight) -->
      <div class="h-[2.5px] w-full bg-gradient-to-r from-[#002244] via-[#f59e0b] to-[#002244]"></div>
    </header>
  `
})
export class HeaderComponent {
  eoiService = inject(EoiService);
  protected readonly languageService = inject(LanguageService);
  private readonly eoiStateService = inject(EoiStateService);
  private readonly router = inject(Router);

  readonly userProfile$: Observable<UserProfile> = this.eoiStateService.userProfile$;
  readonly currentLanguage = this.languageService.currentLanguage;
  readonly t = this.languageService.t;
  readonly userMenuOpen = signal<boolean>(false);

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

  setLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
  }
}
