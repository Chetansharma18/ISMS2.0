import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../../../core/services/language.service';

export type { Language };
export type FontSize = 'sm' | 'md' | 'lg';

export interface PressRelease {
  id: string;
  date: string;
  title: string;
  category?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  protected readonly languageService = inject(LanguageService);
  readonly currentLanguage = this.languageService.currentLanguage;
  readonly t = this.languageService.t;
  readonly fontSize = signal<FontSize>('md');
  readonly searchQuery = signal<string>('');
  readonly isNewsModalOpen = signal<boolean>(false);
  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly isMobileSearchOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
    if (this.isMobileMenuOpen()) {
      this.isMobileSearchOpen.set(false);
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen.update(v => !v);
    if (this.isMobileSearchOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  closeMobileSearch(): void {
    this.isMobileSearchOpen.set(false);
  }

  pressReleases: PressRelease[] = [
    {
      id: '1',
      date: '17 Aug, 2026',
      title: 'राज्य कौशल एवं उद्यमिता समिति की प्रथम बैठक आयोजित— युवाओं को उद्योग की मांग के अनुरूप आधुनिक प्रशिक्षण देने एवं कौशल विकास योजनाओं में तेजी लाने पर विस्तृत चर्चा',
      category: 'Meeting'
    },
    {
      id: '2',
      date: '15 Jul, 2026',
      title: 'विश्व युवा कौशल दिवस पर राज्य स्तरीय कार्यक्रम आयोजित, कौशल विकास के क्षेत्र में उत्कृष्ट प्रतिभाओं का हुआ सम्मान',
      category: 'Event'
    },
    {
      id: '3',
      date: '05 Jun, 2026',
      title: 'बोर्ड का उद्देश्य कौशल विकास के माध्यम से युवाओं को आत्मनिर्भर बनाना तथा उनके लिए बेहतर रोजगार के अवसर सुनिश्चित करना है — अध्यक्ष, श्री विश्वकर्मा कौशल विकास बोर्ड',
      category: 'Statement'
    },
    {
      id: '4',
      date: '23 Apr, 2026',
      title: 'राज्य की 2 हजार युवतियों को डिजिटल सशक्त बनाने के लिए यूनिसेफ एफडीसीआर के माध्यम से करेगा प्रशिक्षित',
      category: 'Skill Initiative'
    },
    {
      id: '5',
      date: '07 Apr, 2026',
      title: 'युवा संबल मेला 2026 का किया आयोजन — 42 आशार्थियों को मेला स्थल पर ही ऑफर लेटर वितरित',
      category: 'Rozgar Mela'
    }
  ];

  openNewsModal(): void {
    this.isNewsModalOpen.set(true);
  }

  closeNewsModal(): void {
    this.isNewsModalOpen.set(false);
  }

  setLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
  }

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      let initialSize = this.fontSize();
      try {
        const saved = localStorage.getItem('isms_font_size') as FontSize;
        if (saved && (saved === 'sm' || saved === 'md' || saved === 'lg')) {
          initialSize = saved;
        }
      } catch (e) { }
      this.setFontSize(initialSize);
    }
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
      } catch (e) { }
    }
  }

  onSearch(event: Event): void {
    event.preventDefault();
    const query = this.searchQuery().trim();
    if (query) {
      console.log('Searching for:', query);
    }
  }
}
