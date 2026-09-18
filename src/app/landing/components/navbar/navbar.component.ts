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
  url?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
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

  readonly officialPortalUrl = 'https://livelihoods.rajasthan.gov.in/rsldc/#/home/dptHome';

  pressReleases: PressRelease[] = [
    {
      id: '249698',
      date: '17 Aug, 2026',
      title: 'राज्य कौशल एवं उद्यमिता समिति की प्रथम बैठक आयोजित— युवाओं को उद्योग की मांग के अनुरूप आधुनिक प्रशिक्षण देने एवं कौशल विकास योजनाओं में तेजी लाने पर विस्तृत चर्चा',
      category: 'Meeting',
      url: 'https://livelihoods.rajasthan.gov.in/rsldc/#/home/press-release/249698'
    },
    {
      id: '246914',
      date: '15 Jul, 2026',
      title: 'विश्व युवा कौशल दिवस पर राज्य स्तरीय कार्यक्रम आयोजित, कौशल विकास के क्षेत्र में उत्कृष्ट प्रतिभाओं का हुआ सम्मान',
      category: 'Event',
      url: 'https://livelihoods.rajasthan.gov.in/rsldc/#/home/press-release/246914'
    },
    {
      id: '243062',
      date: '05 Jun, 2026',
      title: 'बोर्ड का उद्देश्य कौशल विकास के माध्यम से युवाओं को आत्मनिर्भर बनाना तथा उनके लिए बेहतर रोजगार के अवसर सुनिश्चित करना है — अध्यक्ष, श्री विश्वकर्मा कौशल विकास बोर्ड',
      category: 'Statement',
      url: 'https://livelihoods.rajasthan.gov.in/rsldc/#/home/press-release/243062'
    },
    {
      id: '239270',
      date: '23 Apr, 2026',
      title: 'राज्य की 2 हजार युवतियों को डिजिटल सशक्त बनाने के लिए यूनिसेफ एफडीसीआर के माध्यम से करेगा प्रशिक्षित',
      category: 'Skill Initiative',
      url: 'https://livelihoods.rajasthan.gov.in/rsldc/#/home/press-release/239270'
    },
    {
      id: '238023',
      date: '07 Apr, 2026',
      title: 'युवा संबल मेला 2026 का किया आयोजन — 42 आशार्थियों को मेला स्थल पर ही ऑफर लेटर वितरित',
      category: 'Rozgar Mela',
      url: 'https://livelihoods.rajasthan.gov.in/rsldc/#/home/press-release/238023'
    },
    {
      id: '235338',
      date: '23 Feb, 2026',
      title: 'पोकरण में टेराकोटा स्किल सेंटर खुलेगा, सीमावर्ती क्षेत्रों में कौशल प्रशिक्षण को विशेष रूप से बढ़ावा मिलेगा - कौशल नियोजन एवं उद्यमिता मंत्री',
      category: 'Skill Center',
      url: 'https://livelihoods.rajasthan.gov.in/rsldc/#/home/press-release/235338'
    },
    {
      id: '235289',
      date: '23 Feb, 2026',
      title: "इंडिया स्किल्स प्रतियोगिता: चित्तौड़गढ़ के कीर्तन धाकड़ को स्वर्ण और शुभम जयसवाल को 'मेडल ऑफ एक्सीलेंस'",
      category: 'IndiaSkills',
      url: 'https://livelihoods.rajasthan.gov.in/rsldc/#/home/press-release/235289'
    }
  ];

  openPressRelease(item?: PressRelease, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const targetUrl = item?.url || (item?.id ? `https://livelihoods.rajasthan.gov.in/rsldc/#/home/press-release/${item.id}` : this.officialPortalUrl);
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  }

  redirectToPortal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (typeof window !== 'undefined') {
      window.open(this.officialPortalUrl, '_blank', 'noopener,noreferrer');
    }
  }

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

      const zoomValue = size === 'sm' ? '0.9' : size === 'lg' ? '1.12' : '1';
      document.body.style.setProperty('zoom', zoomValue);
      (document.body.style as any).zoom = zoomValue;

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