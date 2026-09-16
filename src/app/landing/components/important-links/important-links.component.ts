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
  logo: string;
}

@Component({
  selector: 'app-important-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './important-links.component.html',
  styleUrls: ['./important-links.component.css']
})
export class ImportantLinksComponent implements OnInit, OnDestroy {
  protected readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;

  links: PartnerLink[] = [
    {
      id: 'bis',
      name: 'Bureau of Indian Standards',
      hindiName: 'मानक: पथप्रदर्शक:',
      tagline: 'The National Standards Body of India',
      url: 'https://www.bis.gov.in/',
      logo: 'footer-images/bis.png'
    },
    {
      id: 'bis-care',
      name: 'BIS Care App',
      hindiName: 'बीआईएस केयर ऐप',
      tagline: 'Bureau of Indian Standards Mobile App',
      url: 'https://www.bis.gov.in/bis-apps/',
      logo: 'footer-images/bis-care.png'
    },
    {
      id: 'acb',
      name: 'Anti Corruption Bureau',
      hindiName: 'मांगे कोई रिश्वत तो कॉल करें',
      tagline: 'Toll Free: 1064 | WhatsApp: 9413502834',
      url: 'https://home.rajasthan.gov.in/content/homeportal/en/acbdepartment.html',
      logo: 'footer-images/acb.png'
    },
    {
      id: 'pledge',
      name: 'Organ Donation Pledge',
      hindiName: 'Save lives today',
      tagline: 'One Donor Can Save 8 Lives - Register for Pledge',
      url: 'https://notto.abdm.gov.in/register/',
      logo: 'footer-images/pledge.jpeg'
    },
    {
      id: 'jansoochna',
      name: 'Jan Soochna Portal 2019',
      hindiName: 'जन सूचना पोर्टल-2019',
      tagline: 'Government of Rajasthan',
      url: 'https://jansoochna.rajasthan.gov.in/',
      logo: 'footer-images/jansoochna.png'
    }
  ];

  currentIndex = signal(0);
  itemsPerPage = signal(4);
  private autoSlideInterval: any = null;
  isPaused = signal(false);

  maxIndex = computed(() => {
    return Math.max(0, this.links.length - this.itemsPerPage());
  });

  dotsArray = computed(() => {
    return Array.from({ length: this.maxIndex() + 1 }, (_, i) => i);
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

    if (this.currentIndex() > this.maxIndex()) {
      this.currentIndex.set(this.maxIndex());
    }
  }

  next() {
    if (this.currentIndex() >= this.maxIndex()) {
      this.currentIndex.set(0);
    } else {
      this.currentIndex.update(i => i + 1);
    }
  }

  prev() {
    if (this.currentIndex() <= 0) {
      this.currentIndex.set(this.maxIndex());
    } else {
      this.currentIndex.update(i => i - 1);
    }
  }

  goToSlide(index: number) {
    if (index >= 0 && index <= this.maxIndex()) {
      this.currentIndex.set(index);
    }
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused()) {
        this.next();
      }
    }, 4000);
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

  onImageError(event: Event, fallbackName: string) {
    const target = event.target as HTMLImageElement;
    if (target && fallbackName) {
      if (target.src.includes('footer-images')) {
        target.src = '/' + fallbackName;
      } else {
        target.src = '/footer-images/' + fallbackName;
      }
    }
  }
}
