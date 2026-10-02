import {
  Component,
  signal,
  computed,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PressReleasesModalComponent } from '../press-releases-modal/press-releases-modal.component';

export interface AnnouncementItem {
  id: string;
  date: string;
  text: string;
  pdfUrl: string;
  fileName: string;
}

@Component({
  selector: 'app-news-ticker',
  standalone: true,
  imports: [CommonModule, PressReleasesModalComponent],
  host: {
    class: 'block w-full'
  },
  template: `
    <div
      #tickerSection
      class="w-full bg-[#0D3557] text-white border-b border-black/15 shadow-inner relative z-10 select-none overflow-hidden"
      role="region"
      aria-label="Government News Announcements Ticker"
    >
      <div class="w-full h-[42px] sm:h-[46px] lg:h-[50px] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        
        <!-- ============================================================
             1. FIXED LEFT: ORANGE NEWS LABEL + SEPARATOR
             ============================================================ -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0 z-20 bg-[#0D3557] pr-2 sm:pr-3">
          <button
            type="button"
            (click)="isModalOpen.set(true)"
            class="inline-flex items-center gap-1.5 sm:gap-2 bg-[#F28C28] hover:bg-[#d9771e] text-white font-bold px-2.5 py-1 sm:px-3 sm:py-1 rounded-[4px] text-[12px] sm:text-[13px] tracking-wider uppercase transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 shadow-xs shrink-0"
            aria-label="View press releases and announcements"
            title="Click to view all press releases"
          >
            <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white shrink-0"></span>
            <span>NEWS</span>
          </button>

          <!-- Subtle Vertical Separator -->
          <div class="w-px h-4 sm:h-5 bg-white/25 shrink-0"></div>
        </div>

        <!-- ============================================================
             2. CENTER: SCROLLING ANNOUNCEMENT TRACK (SMOOTH & SEAMLESS)
             ============================================================ -->
        <div
          class="ticker-viewport flex-1 min-w-0 overflow-hidden relative h-full flex items-center"
          tabindex="0"
          (mouseenter)="isHovered.set(true)"
          (mouseleave)="isHovered.set(false)"
          (focusin)="isFocused.set(true)"
          (focusout)="isFocused.set(false)"
          aria-label="Latest News Announcements"
        >
          <div
            class="ticker-track flex whitespace-nowrap items-center"
            [style.animation-play-state]="shouldAnimate() ? 'running' : 'paused'"
          >
            <!-- Primary Announcements Set (Accessible to Screen Readers) -->
            <div class="flex items-center">
              @for (item of announcements; track item.id) {
                <a
                  [href]="item.pdfUrl"
                  [download]="item.fileName"
                  class="ticker-link inline-flex items-center gap-2 sm:gap-2.5 text-[#FFFFFF] hover:text-[#F28C28] transition-colors cursor-pointer group no-underline shrink-0 focus:outline-none focus:text-[#F28C28]"
                >
                  <!-- Date Badge -->
                  <span class="bg-[#194A70] text-[#F6C453] font-semibold text-[11px] sm:text-[12px] px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-[3px] whitespace-nowrap shrink-0">
                    {{ item.date }}
                  </span>
                  <!-- Announcement Text (Hindi / English - explicitly pure white) -->
                  <span class="ticker-text font-normal text-[12.5px] sm:text-[13.5px] lg:text-[14.5px] text-[#FFFFFF] font-['Noto_Sans_Devanagari','Inter',sans-serif] whitespace-nowrap group-hover:text-[#F28C28] group-hover:underline">
                    {{ item.text }}
                  </span>
                </a>
                <!-- Separator Between Announcements -->
                <span class="text-white/30 mx-3 sm:mx-4 select-none shrink-0" aria-hidden="true">|</span>
              }
            </div>

            <!-- Duplicate Announcements Set (for Seamless Continuous Loop, Hidden from Screen Readers) -->
            <div class="flex items-center" aria-hidden="true">
              @for (item of announcements; track 'dup-' + item.id) {
                <a
                  [href]="item.pdfUrl"
                  [download]="item.fileName"
                  tabindex="-1"
                  class="ticker-link inline-flex items-center gap-2 sm:gap-2.5 text-[#FFFFFF] hover:text-[#F28C28] transition-colors cursor-pointer group no-underline shrink-0"
                >
                  <!-- Date Badge -->
                  <span class="bg-[#194A70] text-[#F6C453] font-semibold text-[11px] sm:text-[12px] px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-[3px] whitespace-nowrap shrink-0">
                    {{ item.date }}
                  </span>
                  <!-- Announcement Text -->
                  <span class="ticker-text font-normal text-[12.5px] sm:text-[13.5px] lg:text-[14.5px] text-[#FFFFFF] font-['Noto_Sans_Devanagari','Inter',sans-serif] whitespace-nowrap group-hover:text-[#F28C28] group-hover:underline">
                    {{ item.text }}
                  </span>
                </a>
                <!-- Separator Between Announcements -->
                <span class="text-white/30 mx-3 sm:mx-4 select-none shrink-0" aria-hidden="true">|</span>
              }
            </div>

          </div>
        </div>

        <!-- ============================================================
             3. FIXED RIGHT: PAUSE / RESUME CONTROL
             ============================================================ -->
        <div class="flex items-center gap-2 shrink-0 z-20 bg-[#0D3557] pl-2 sm:pl-3">
          <div class="w-px h-4 sm:h-5 bg-white/25 shrink-0 hidden sm:block"></div>
          <button
            type="button"
            (click)="togglePauseResume()"
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] bg-[#194A70] hover:bg-[#F28C28] text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 shadow-2xs border border-white/10 shrink-0"
            [attr.aria-label]="isPaused() ? 'Resume news announcements' : 'Pause news announcements'"
            [attr.title]="isPaused() ? 'Resume news announcements' : 'Pause news announcements'"
          >
            @if (isPaused()) {
              <!-- Play / Resume Icon -->
              <svg class="w-3.5 h-3.5 fill-current translate-x-0.5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
            } @else {
              <!-- Pause Icon -->
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            }
          </button>
        </div>

      </div>
    </div>

    <!-- Press Releases Full Modal (Kept fully intact) -->
    @if (isModalOpen()) {
      <app-press-releases-modal (close)="isModalOpen.set(false)"></app-press-releases-modal>
    }
  `,
  styles: [`
    @keyframes marquee {
      0% {
        transform: translate3d(0, 0, 0);
      }
      100% {
        transform: translate3d(-50%, 0, 0);
      }
    }

    .ticker-track {
      display: inline-flex;
      width: max-content;
      animation: marquee 34s linear infinite;
      will-change: transform;
      backface-visibility: hidden;
    }

    .ticker-text {
      color: #FFFFFF !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .ticker-link:hover .ticker-text {
      color: #F28C28 !important;
    }

    /* Pause animation on hover */
    .ticker-viewport:hover .ticker-track {
      animation-play-state: paused;
    }

    /* Pause animation on keyboard focus */
    .ticker-viewport:focus-within .ticker-track {
      animation-play-state: paused;
    }

    /* Respect reduced-motion preferences */
    @media (prefers-reduced-motion: reduce) {
      .ticker-track {
        animation: none !important;
        transform: none !important;
      }
      .ticker-viewport {
        overflow-x: auto;
      }
    }
  `]
})
export class NewsTickerComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @ViewChild('tickerSection') tickerSectionRef?: ElementRef<HTMLElement>;

  readonly isModalOpen = signal(false);
  readonly isPaused = signal(false);
  readonly isHovered = signal(false);
  readonly isFocused = signal(false);
  readonly isVisible = signal(true);
  readonly isTabActive = signal(true);

  /** Preserved Announcement Data with existing dates, text, and PDF download links */
  readonly announcements: AnnouncementItem[] = [
    {
      id: 'item-1',
      date: '17 Aug, 2026',
      text: 'राज्य कौशल एवं उद्यमिता समिति की प्रथम बैठक आयोजित',
      pdfUrl: '/dummy.pdf',
      fileName: 'news-17-aug.pdf'
    },
    {
      id: 'item-2',
      date: '15 Jul, 2026',
      text: 'विश्व युवा कौशल दिवस पर राज्य स्तरीय कार्यक्रम आयोजित',
      pdfUrl: '/dummy.pdf',
      fileName: 'news-15-jul.pdf'
    },
    {
      id: 'item-3',
      date: '23 Apr, 2026',
      text: 'राज्य की 2 हजार युवतियों को डिजिटल सशक्त बनाने के लिए यूनिसेफ एफडीसीआर के माध्यम से करेगा प्रशिक्षित',
      pdfUrl: '/dummy.pdf',
      fileName: 'news-23-apr.pdf'
    }
  ];

  /** Determine if the ticker animation should run */
  readonly shouldAnimate = computed(() => {
    return (
      this.isVisible() &&
      this.isTabActive() &&
      !this.isPaused() &&
      !this.isHovered() &&
      !this.isFocused()
    );
  });

  private observer?: IntersectionObserver;
  private visibilityHandler?: () => void;

  togglePauseResume(): void {
    this.isPaused.update(p => !p);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.tickerSectionRef?.nativeElement;
    if (el) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.isVisible.set(entry.isIntersecting);
          });
        },
        { threshold: 0.05 }
      );
      this.observer.observe(el);
    }

    this.visibilityHandler = () => {
      this.isTabActive.set(!document.hidden);
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }
}
