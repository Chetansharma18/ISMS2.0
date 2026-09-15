import { Injectable, signal, computed } from '@angular/core';
import { LANDING_TRANSLATIONS, LandingTranslations } from '../translations/landing.translations';

export type Language = 'en' | 'hi';

export interface BilingualText {
  en: string;
  hi: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'isms_lang';

  readonly currentLanguage = signal<Language>('en');
  readonly isHindi = computed(() => this.currentLanguage() === 'hi');
  readonly isEnglish = computed(() => this.currentLanguage() === 'en');
  readonly t = computed<LandingTranslations>(() => LANDING_TRANSLATIONS[this.currentLanguage()]);

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang') as Language;
        if (urlLang === 'en' || urlLang === 'hi') {
          this.currentLanguage.set(urlLang);
          this.syncDocumentLang(urlLang);
          return;
        }
      } catch {
        // Fallback gracefully
      }

      if (typeof localStorage !== 'undefined') {
        try {
          const savedLang = localStorage.getItem(this.STORAGE_KEY) as Language;
          if (savedLang === 'en' || savedLang === 'hi') {
            this.currentLanguage.set(savedLang);
          }
        } catch {
          // Fallback gracefully if storage is unavailable
        }
      }
    }
    this.syncDocumentLang(this.currentLanguage());
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, lang);
      } catch {
        // Fallback gracefully if storage is unavailable
      }
    }
    this.syncDocumentLang(lang);
  }

  toggleLanguage(): void {
    const nextLang: Language = this.currentLanguage() === 'en' ? 'hi' : 'en';
    this.setLanguage(nextLang);
  }

  /**
   * Helper utility to resolve text based on the active language with English fallback
   */
  getText(text: BilingualText): string {
    return text[this.currentLanguage()] || text.en;
  }

  private syncDocumentLang(lang: Language): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }
}
