import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { EoiStateService, UserProfile } from '../../core/services/eoi-state.service';
import { LanguageService, Language } from '../../core/services/language.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, AsyncPipe],
  template: `
    <header class="w-full bg-[#f0f6fc] border-b border-slate-200/80 font-sans shadow-2xs select-none sticky top-0 z-40">
      <div class="max-w-[1440px] mx-auto py-2 sm:py-2.5 lg:py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2.5 lg:gap-6">
        
        <!-- Left Branding Group: Emblems + Divider + ISMS 2.0 -->
        <div class="flex items-center gap-2 sm:gap-3.5 lg:gap-4 min-w-0 cursor-pointer" routerLink="/">
          <!-- Official Ashoka Lion Capital (State Emblem of India) -->
          <div class="flex-shrink-0 flex items-center justify-center">
            <img 
              src="Rajasthan-Sarkar.png" 
              alt="Government of Rajasthan" 
              class="h-9 sm:h-[48px] lg:h-[56px] w-auto object-contain select-none" 
            />
          </div>

          <!-- Official RSLDC Circular Emblem -->
          <div class="flex-shrink-0 flex items-center justify-center">
            <img 
              src="rsldc-logo.png" 
              alt="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)" 
              class="h-9 w-9 sm:h-[48px] sm:w-[48px] lg:h-[56px] lg:w-[56px] object-contain select-none drop-shadow-2xs" 
            />
          </div>

          <!-- Thin Vertical Divider Line -->
          <div class="h-8 sm:h-10 lg:h-11 w-[1.5px] bg-slate-300 mx-0.5 sm:mx-2 lg:mx-2.5 shrink-0"></div>

          <!-- System Branding: ISMS in Navy, 2.0 in Orange/Amber -->
          <div class="flex text-left flex-col justify-center shrink-0">
            <div class="flex items-baseline leading-none">
              <span class="text-xl sm:text-2xl lg:text-[27px] font-extrabold text-[#092244] tracking-tight">ISMS</span>
              <span class="text-xl sm:text-2xl lg:text-[27px] font-extrabold text-[#f59e0b] ml-1">2.0</span>
            </div>
            <div class="hidden sm:block text-[10.5px] sm:text-[11.5px] lg:text-[12px] text-slate-600 font-medium tracking-tight mt-0.5 sm:mt-1">
              {{ t().navbar.ismsSubtitle }}
            </div>
          </div>
        </div>

        <!-- Right Utilities: Language Switcher & (Login Button OR Username) -->
        <div class="flex items-center justify-end gap-2.5 sm:gap-4 shrink-0 select-none">
          
          <!-- Language Switcher (English | हिंदी) -->
          <div class="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-[13px] font-medium text-slate-700">
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

          <!-- Unauthenticated: Login Button (Landing Page Style) -->
          @if (!showAuthenticated) {
            <a 
              routerLink="/auth/login"
              class="inline-flex px-4 sm:px-5 py-2 rounded-lg bg-[#002752] hover:bg-[#003873] active:scale-95 text-white text-xs sm:text-[13px] font-semibold tracking-wide shadow-xs transition-all items-center gap-1.5 sm:gap-2 cursor-pointer"
              [title]="t().navbar.loginTitle">
              <svg class="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span>{{ t().navbar.loginText }}</span>
            </a>
          } @else {
            <!-- Authenticated: User Name & Clean Profile Menu -->
            @if (userProfile$ | async; as profile) {
              <div class="relative">
                <button 
                  type="button"
                  (click)="toggleUserMenu($event)"
                  class="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer hover:bg-white/80 transition rounded-lg p-1 sm:p-1.5 border border-transparent hover:border-slate-200 shadow-2xs"
                  title="User Account Menu">
                  
                  <!-- Avatar Circle with Initial -->
                  <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#002752] text-[#f59e0b] flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-2xs">
                    {{ (profile.personal.fullName || profile.ssoId || 'U').charAt(0).toUpperCase() }}
                  </div>

                  <!-- User Name & Designation Block -->
                  <div class="text-left hidden sm:flex sm:flex-col justify-center leading-tight py-0.5">
                    <div class="text-xs sm:text-[13px] font-bold text-[#092244] truncate max-w-[150px] md:max-w-[200px]" [title]="profile.personal.fullName">
                      {{ profile.personal.fullName || profile.ssoId || 'Authorized User' }}
                    </div>
                    <div class="text-[11px] text-slate-500 truncate max-w-[150px] md:max-w-[180px]">
                      {{ profile.personal.designation || 'Signatory Authority' }}
                    </div>
                  </div>

                  <!-- Dropdown Caret Icon -->
                  <svg class="w-3.5 h-3.5 text-slate-500 ml-0.5 transition-transform" [class.rotate-180]="userMenuOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                <!-- Backdrop to close dropdown on outside click -->
                @if (userMenuOpen()) {
                  <div (click)="closeUserMenu()" class="fixed inset-0 z-40"></div>
                }

                <!-- Profile Dropdown Menu with Profile & Logout -->
                @if (userMenuOpen()) {
                  <div 
                    class="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans overflow-hidden">
                    
                    <div class="px-3.5 py-2 border-b border-slate-100 sm:hidden">
                      <div class="text-xs font-bold text-[#092244] truncate">{{ profile.personal.fullName || profile.ssoId }}</div>
                      <div class="text-[10px] text-slate-500 truncate">{{ profile.personal.designation || 'Signatory Authority' }}</div>
                    </div>

                    <a 
                      routerLink="/profile" 
                      (click)="closeUserMenu()" 
                      class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-colors text-left border-b border-slate-100">
                      <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Profile</span>
                    </a>

                    <button 
                      type="button"
                      (click)="logout()"
                      class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left cursor-pointer">
                      <svg class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                }
              </div>
            }
          }

        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  @Input() isAuthenticated?: boolean;

  protected readonly languageService = inject(LanguageService);
  private readonly eoiStateService = inject(EoiStateService);
  private readonly router = inject(Router);

  readonly userProfile$: Observable<UserProfile> = this.eoiStateService.userProfile$;
  readonly currentLanguage = this.languageService.currentLanguage;
  readonly t = this.languageService.t;
  readonly userMenuOpen = signal<boolean>(false);

  get showAuthenticated(): boolean {
    if (this.isAuthenticated !== undefined) {
      return this.isAuthenticated;
    }
    const url = this.router.url;
    if (url === '/' || url === '' || url.startsWith('/auth/login') || url.startsWith('/?')) {
      return false;
    }
    return true;
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

  setLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
  }
}
