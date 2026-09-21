import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <header
      class="w-full bg-[#f8fbff] border-b border-slate-200 box-border transition-shadow duration-150"
      [class.sticky]="isSticky"
      [class.top-0]="isSticky"
      [class.z-50]="isSticky"
      [class.shadow-sm]="isSticky"
      role="banner"
    >
      <div
        class="max-w-[1440px] mx-auto px-4 md:px-6 h-[72px] md:h-[80px] flex items-center justify-between gap-4"
      >
        <!-- Left: Government Emblems & ISMS 2.0 Identity -->
        <div class="flex items-center gap-4 sm:gap-6 min-w-0">
          
          <!-- Logos Container -->
          <div class="flex items-center gap-3">
            <!-- Government of India Emblem (Placeholder) -->
            <img
              src="/emblem-new.png"
              alt="Government of India"
              class="h-10 sm:h-12 md:h-[50px] w-auto object-contain select-none"
            />
            
            <!-- RSLDC Logo -->
            <img
              src="/rsldc-logo.png"
              alt="RSLDC"
              class="h-10 sm:h-12 md:h-[50px] w-auto object-contain select-none"
              onerror="this.src='/Rajasthan-Sarkar.png'"
            />
          </div>

          <!-- Subtle Vertical Divider -->
          <div
            class="w-px h-8 sm:h-10 md:h-[40px] bg-slate-300 shrink-0"
            aria-hidden="true"
          ></div>

          <!-- ISMS 2.0 System Titles -->
          <div class="flex flex-col justify-center leading-tight">
            <div class="flex items-baseline gap-1.5">
              <span
                class="text-xl sm:text-2xl md:text-[28px] font-black text-[#0B3558] tracking-tight font-sans"
                >ISMS<span class="text-[#EA580C]">2.0</span></span
              >
            </div>
            <p
              class="hidden sm:block text-[11px] md:text-[13px] font-medium text-slate-500 tracking-wide whitespace-nowrap m-0 p-0"
            >
              Integrated Scheme Management System
            </p>
          </div>
        </div>

        <!-- Right: Language Selector & Login Button -->
        <div class="flex items-center gap-3 sm:gap-5 shrink-0">
          <!-- Language Switcher -->
          <!--
          <nav
            class="flex items-center gap-2 text-xs sm:text-[15px] font-bold text-slate-700"
            aria-label="Language selection"
          >
            <button
              type="button"
              class="bg-transparent border-0 px-1 py-1 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#0B3558]"
              [class]="selectedLanguage() === 'en' ? 'text-[#0B3558]' : 'text-slate-500 hover:text-[#0B3558]'"
              (click)="onLanguageChange('en')"
            >
              English
            </button>

            <span
              class="text-slate-300 text-sm select-none"
              aria-hidden="true"
              >|</span
            >

            <button
              type="button"
              class="bg-transparent border-0 px-1 py-1 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#0B3558]"
              [class]="selectedLanguage() === 'hi' ? 'text-[#0B3558]' : 'text-slate-500 hover:text-[#0B3558]'"
              (click)="onLanguageChange('hi')"
            >
              हिंदी
            </button>
          </nav>
          -->

          <!-- Login Button -->
          <button
            type="button"
            class="inline-flex items-center gap-2 bg-[#0B3558] text-white rounded-lg px-4 sm:px-6 py-2 text-sm sm:text-[15px] font-semibold tracking-wide cursor-pointer shadow hover:bg-[#07233B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            (click)="onLoginClick()"
            aria-label="Sign in to ISMS 2.0 Portal"
          >
            <svg
              class="w-4 h-4 shrink-0"
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
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  /** Controls whether the header sticks to the top of the viewport */
  @Input() isSticky: boolean = true;

  /** Emits when the Login button is clicked */
  @Output() loginClicked = new EventEmitter<void>();

  /** Emits when the user switches language */
  @Output() languageChanged = new EventEmitter<'en' | 'hi'>();

  /** Active language signal ('en' | 'hi') */
  selectedLanguage = signal<'en' | 'hi'>('en');

  onLanguageChange(lang: 'en' | 'hi'): void {
    this.selectedLanguage.set(lang);
    this.languageChanged.emit(lang);
  }

  onLoginClick(): void {
    this.loginClicked.emit();
  }
}
