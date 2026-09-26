import {
  Component,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PressReleasesModalComponent } from '../press-releases-modal/press-releases-modal.component';

@Component({
  selector: 'app-news-ticker',
  standalone: true,
  imports: [CommonModule, PressReleasesModalComponent],
  host: {
    class: 'block w-full'
  },
  template: `
    <div #tickerSection class="bg-[#0B3558] text-white border-b border-[#07233B] py-2 sm:py-2.5 px-3 sm:px-6 shadow-inner relative z-40 overflow-hidden select-none">
      <div class="max-w-[1440px] mx-auto flex items-center gap-2 sm:gap-4 text-xs sm:text-[13px] relative h-6">
        
        <!-- Left: Static Badge (Fixed Position with subtle gradient separator) -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0 z-20 bg-[#0B3558] pr-2 sm:pr-3 relative h-full shadow-[5px_0_10px_#0B3558]">
          <!-- NEWS Badge -->
          <button 
            type="button"
            (click)="isModalOpen.set(true)"
            class="inline-flex items-center gap-1.5 bg-[#EA580C] text-white font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded text-[11px] sm:text-xs tracking-wide shadow-xs cursor-pointer hover:bg-orange-600 transition-colors focus:outline-none"
            aria-label="View press releases">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>NEWS</span>
          </button>

          <span class="text-slate-400 mx-0.5 hidden sm:inline" aria-hidden="true">|</span>
        </div>

        <!-- Ticker Text (Hardware-Accelerated Seamless Auto Scrolling Loop) -->
        <div 
          class="flex-1 overflow-hidden relative h-full flex items-center group cursor-pointer"
          (mouseenter)="isHovering.set(true)"
          (mouseleave)="isHovering.set(false)"
          (touchstart)="isHovering.set(true)"
          (touchend)="isHovering.set(false)">
          
          <div 
            class="flex whitespace-nowrap animate-marquee"
            [style.animation-play-state]="shouldAnimate() ? 'running' : 'paused'">
            
            <!-- Loop 1 -->
            <div class="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6">
              <a href="/dummy.pdf" download="news-17-aug.pdf" class="flex items-center gap-2 group/item cursor-pointer">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[10px] sm:text-[11px] whitespace-nowrap">17 Aug, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors text-xs sm:text-[13px]">राज्य कौशल एवं उद्यमिता समिति की प्रथम बैठक आयोजित</span>
              </a>
              <span class="text-slate-500">|</span>
              
              <a href="/dummy.pdf" download="news-15-jul.pdf" class="flex items-center gap-2 group/item cursor-pointer">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[10px] sm:text-[11px] whitespace-nowrap">15 Jul, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors text-xs sm:text-[13px]">विश्व युवा कौशल दिवस पर राज्य स्तरीय कार्यक्रम आयोजित</span>
              </a>
              <span class="text-slate-500">|</span>
              
              <a href="/dummy.pdf" download="news-23-apr.pdf" class="flex items-center gap-2 group/item cursor-pointer">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[10px] sm:text-[11px] whitespace-nowrap">23 Apr, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors text-xs sm:text-[13px]">राज्य की 2 हजार युवतियों को डिजिटल सशक्त बनाने के लिए यूनिसेफ एफडीसीआर के माध्यम से करेगा प्रशिक्षित</span>
              </a>
            </div>

            <!-- Loop 2 (Duplicate for seamless continuous scroll) -->
            <div class="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6" aria-hidden="true">
              <a href="/dummy.pdf" download="news-17-aug.pdf" class="flex items-center gap-2 group/item cursor-pointer">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[10px] sm:text-[11px] whitespace-nowrap">17 Aug, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors text-xs sm:text-[13px]">राज्य कौशल एवं उद्यमिता समिति की प्रथम बैठक आयोजित</span>
              </a>
              <span class="text-slate-500">|</span>
              
              <a href="/dummy.pdf" download="news-15-jul.pdf" class="flex items-center gap-2 group/item cursor-pointer">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[10px] sm:text-[11px] whitespace-nowrap">15 Jul, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors text-xs sm:text-[13px]">विश्व युवा कौशल दिवस पर राज्य स्तरीय कार्यक्रम आयोजित</span>
              </a>
              <span class="text-slate-500">|</span>
              
              <a href="/dummy.pdf" download="news-23-apr.pdf" class="flex items-center gap-2 group/item cursor-pointer">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[10px] sm:text-[11px] whitespace-nowrap">23 Apr, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors text-xs sm:text-[13px]">राज्य की 2 हजार युवतियों को डिजिटल सशक्त बनाने के लिए यूनिसेफ एफडीसीआर के माध्यम से करेगा प्रशिक्षित</span>
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- Modal -->
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
    .animate-marquee {
      width: max-content;
      animation: marquee 32s linear infinite;
      will-change: transform;
      backface-visibility: hidden;
    }
  `]
})
export class NewsTickerComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @ViewChild('tickerSection') tickerSectionRef?: ElementRef<HTMLElement>;

  readonly isModalOpen = signal(false);
  readonly isHovering = signal(false);
  readonly isVisible = signal(true);
  readonly isTabActive = signal(true);

  private observer?: IntersectionObserver;
  private visibilityHandler?: () => void;

  readonly shouldAnimate = () => {
    return this.isVisible() && this.isTabActive() && !this.isHovering();
  };

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
        { threshold: 0.1 }
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
