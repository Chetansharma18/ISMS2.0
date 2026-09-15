import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageService } from './language.service';
import { LANDING_TRANSLATIONS } from '../translations/landing.translations';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    localStorage.clear();
    service = new LanguageService();
  });

  it('should default to English ("en")', () => {
    expect(service.currentLanguage()).toBe('en');
    expect(service.isEnglish()).toBe(true);
    expect(service.isHindi()).toBe(false);
    expect(service.t().navbar.govtRajasthan).toBe('Government of Rajasthan');
  });

  it('should switch to Hindi ("hi") with header logo-side text in Hindi and important links in original language', () => {
    service.setLanguage('hi');

    expect(service.currentLanguage()).toBe('hi');
    expect(service.isHindi()).toBe(true);
    expect(service.isEnglish()).toBe(false);

    // Header logo side text switched to Hindi
    expect(service.t().navbar.govtRajasthan).toBe('राजस्थान सरकार');
    expect(service.t().navbar.rsldcLine1).toBe('राजस्थान कौशल एवं आजीविका');
    expect(service.t().navbar.rsldcLine2).toBe('विकास निगम (RSLDC)');

    // Scheme title kept in English
    expect(service.t().navbar.ismsSubtitle).toBe('Integrated Scheme Management System');
    expect(service.t().hero.headingPart1).toBe('Integrated Scheme');
    expect(service.t().hero.headingPart2).toBe('Management System');
    expect(service.t().footer.ismsSubtitle).toBe('Integrated Scheme Management System');

    // Other Important Links logos kept in original language
    expect(service.t().importantLinks.heading).toBe('अन्य महत्वपूर्ण लिंक');
    expect(service.t().importantLinks.acbTitle).toBe('Anti Corruption Bureau');
    expect(service.t().importantLinks.bisTitle).toBe('Bureau of Indian Standards');
    expect(service.t().importantLinks.saveLivesToday).toBe('Save lives today');
    expect(service.t().importantLinks.digitalIndiaTitle).toBe('Digital India');
    expect(service.t().importantLinks.ssoTitle).toBe('Rajasthan SSO');
    expect(service.t().importantLinks.janSoochnaTitle).toBe('जन सूचना पोर्टल-2019');
    expect(service.t().importantLinks.samparkTitle).toBe('राजस्थान संपर्क');

    // Other sections switched to Hindi
    expect(service.t().hero.eyebrowSkills).toBe('कौशल');
    expect(service.t().hero.getStarted).toBe('प्रारंभ करें');
    expect(service.t().about.heading).toBe('ISMS 2.0 के बारे में');
    expect(service.t().newsTicker.badge).toBe('प्रेस विज्ञप्ति');
    expect(service.t().tenderBox.title).toBe('टेंडर (Tender)');
    expect(service.t().tenderBox.viewAll).toBe('सभी देखें');
    expect(service.t().mobileApp.heading).toBe('ISMS 2.0 मोबाइल ऐप');
    expect(service.t().footer.quickLinks).toBe('त्वरित लिंक');
    expect(service.t().helpdesk.title).toBe('ISMS 2.0 हेल्पडेस्क');
    expect(localStorage.getItem('isms_lang')).toBe('hi');
  });

  it('should switch back to English ("en") instantly', () => {
    service.setLanguage('hi');
    service.setLanguage('en');

    expect(service.currentLanguage()).toBe('en');
    expect(service.isEnglish()).toBe(true);
    expect(service.t().navbar.govtRajasthan).toBe('Government of Rajasthan');
    expect(service.t().tenderBox.title).toBe('Tender');
    expect(localStorage.getItem('isms_lang')).toBe('en');
  });

  it('should toggle language between en and hi', () => {
    expect(service.currentLanguage()).toBe('en');
    service.toggleLanguage();
    expect(service.currentLanguage()).toBe('hi');
    service.toggleLanguage();
    expect(service.currentLanguage()).toBe('en');
  });

  it('should have all translation keys present in both en and hi dictionaries', () => {
    const en = LANDING_TRANSLATIONS.en;
    const hi = LANDING_TRANSLATIONS.hi;

    const sections = [
      'navbar',
      'hero',
      'tenderBox',
      'newsTicker',
      'about',
      'mobileApp',
      'importantLinks',
      'footer',
      'helpdesk'
    ] as const;

    for (const section of sections) {
      expect(en[section]).toBeDefined();
      expect(hi[section]).toBeDefined();

      const enKeys = Object.keys(en[section]);
      const hiKeys = Object.keys(hi[section]);

      expect(enKeys).toEqual(hiKeys);

      for (const key of enKeys) {
        const enVal = (en[section] as any)[key];
        const hiVal = (hi[section] as any)[key];
        expect(enVal).toBeTruthy();
        expect(hiVal).toBeTruthy();
        expect(typeof enVal).toBe('string');
        expect(typeof hiVal).toBe('string');
      }
    }
  });
});
