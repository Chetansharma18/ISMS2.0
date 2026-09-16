import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  HostListener,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';

export interface PartnerLink {
  id: string;
  name: string;
  hindiName?: string;
  tagline?: string;
  url: string;
  type: string;
}

@Component({
  selector: 'app-important-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './important-links.component.html'
})
export class ImportantLinksComponent implements OnInit, OnDestroy {
  protected readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  links: PartnerLink[] = [
    {
      id: 'acb',
      name: 'Anti Corruption Bureau',
      hindiName: 'मांगे कोई रिश्वत तो कॉल करें',
      tagline: 'Toll Free: 1064 | WhatsApp: 9413502834',
      url: 'http://acbrajasthan.gov.in',
      type: 'acb'
    },
    {
      id: 'organ-donation',
      name: 'Organ Donation Pledge',
      hindiName: 'Save lives today',
      tagline: 'One Donor Can Save 8 Lives - Register for Pledge',
      url: 'https://notto.mohfw.gov.in',
      type: 'pledge'
    },
    {
      id: 'jan-soochna',
      name: 'Jan Soochna Portal 2019',
      hindiName: 'जन सूचना पोर्टल-2019',
      tagline: 'Government of Rajasthan',
      url: 'https://jansoochna.rajasthan.gov.in',
      type: 'jansoochna'
    },
    {
      id: 'bis',
      name: 'Bureau of Indian Standards',
      hindiName: 'मानक: पथप्रदर्शक:',
      tagline: 'The National Standards Body of India',
      url: 'https://www.bis.gov.in',
      type: 'bis'
    },
    {
      id: 'skill-india',
      name: 'Skill India',
      hindiName: 'कौशल भारत - कुशल भारत',
      tagline: 'Ministry of Skill Development & Entrepreneurship',
      url: 'https://www.skillindia.gov.in',
      type: 'skillindia'
    },
    {
      id: 'digital-india',
      name: 'Digital India',
      hindiName: 'डिजिटल भारत',
      tagline: 'Power To Empower',
      url: 'https://www.digitalindia.gov.in',
      type: 'digitalindia'
    },
    {
      id: 'rajsso',
      name: 'Rajasthan Single Sign On',
      hindiName: 'राजएसएसओ (RajSSO)',
      tagline: 'One Digital Identity for All Applications',
      url: 'https://sso.rajasthan.gov.in',
      type: 'rajsso'
    },
    {
      id: 'raj-sampark',
      name: 'Rajasthan Sampark',
      hindiName: 'राजस्थान संपर्क - 181',
      tagline: 'Toll-Free 181 | जन समस्या निवारण प्रणाली',
      url: 'https://sampark.rajasthan.gov.in',
      type: 'sampark'
    }
  ];

  currentPage = signal(0);
  itemsPerPage = signal(4);
  private autoSlideInterval: any = null;
  isPaused = signal(false);

  totalPages = computed(() => {
    return Math.ceil(this.links.length / this.itemsPerPage());
  });

  pagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  });

  ngOnInit() {
    this.updateItemsPerPage();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateItemsPerPage();
  }

  private updateItemsPerPage() {
    if (typeof window === 'undefined') return;
    const width = window.innerWidth;
    if (width >= 1024) {
      this.itemsPerPage.set(4);
    } else if (width >= 640) {
      this.itemsPerPage.set(2);
    } else {
      this.itemsPerPage.set(1);
    }

    // Ensure currentPage is within bounds
    if (this.currentPage() >= this.totalPages()) {
      this.currentPage.set(0);
    }
  }

  next() {
    this.currentPage.update(p => (p + 1) % this.totalPages());
  }

  prev() {
    this.currentPage.update(p => (p - 1 + this.totalPages()) % this.totalPages());
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused()) {
        this.next();
      }
    }, 4500);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  onMouseEnter() {
    this.isPaused.set(true);
  }

  onMouseLeave() {
    this.isPaused.set(false);
  }

  getPageLinks(pageIndex: number): PartnerLink[] {
    const start = pageIndex * this.itemsPerPage();
    return this.links.slice(start, start + this.itemsPerPage());
  }
}
