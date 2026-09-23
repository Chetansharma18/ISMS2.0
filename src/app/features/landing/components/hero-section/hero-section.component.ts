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
import { RouterModule } from '@angular/router';
import { TendersModalComponent } from '../tenders-modal/tenders-modal.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule, TendersModalComponent],
  host: {
    class: 'block w-full'
  },
  template: `
    <section #heroSection class="relative w-full min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] flex items-center bg-slate-900 overflow-hidden">
      
      <!-- Full-bleed Background Image with Performance Optimization -->
      <img 
        src="/raj.png" 
        alt="Skill Development Building" 
        class="absolute inset-0 w-full h-full object-cover object-center transform scale-105 select-none pointer-events-none"
        fetchpriority="high"
        onerror="this.src='https://images.unsplash.com/photo-1541888081622-1c25143a3721?q=80&w=2000&auto=format&fit=crop'"
      />
      
      <!-- High-Readability Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-[#07233B]/95 via-[#0B3558]/90 to-[#0B3558]/50 sm:to-[#0B3558]/30"></div>
      <div class="absolute inset-0 bg-radial-at-t from-transparent via-transparent to-black/30 pointer-events-none"></div>

      <div class="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
        
        <!-- Hero Content (Left) -->
        <div class="lg:col-span-7 text-left">
          
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-400 text-xs font-bold tracking-wide mb-3 sm:mb-4">
            <span class="w-1.5 h-1.5 rounded-full bg-[#F6A820] animate-ping"></span>
            <span>Skills for Today &bull; Opportunities for Tomorrow</span>
          </div>

          <h1 class="text-white text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[50px] font-black leading-[1.12] mb-4 tracking-tight drop-shadow-md font-sans">
            Integrated Scheme <br class="hidden sm:inline" />
            <span class="text-[#F6A820]">Management System</span>
          </h1>

          <p class="text-slate-100 text-xs sm:text-sm md:text-base mb-6 sm:mb-8 max-w-xl leading-relaxed drop-shadow font-normal">
            A unified, transparent digital ecosystem empowering skill development schemes, 
            training operations, biometric verification, assessments, certifications, and 
            sustainable placements across Rajasthan.
          </p>

          <!-- Quick Actions & Highlights -->
          <div class="flex flex-wrap items-center gap-3 sm:gap-4">
            <div class="flex items-center gap-2 bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg px-3.5 py-2 text-white text-xs sm:text-sm">
              <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Single Sign-On (SSO) Ready</span>
            </div>
            <div class="flex items-center gap-2 bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg px-3.5 py-2 text-white text-xs sm:text-sm">
              <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
              <span>RSLDC Governed</span>
            </div>
          </div>

        </div>

        <!-- Tenders Sidebar (Right) - Perfectly balanced column -->
        <div class="lg:col-span-5 w-full max-w-[460px] mx-auto lg:ml-auto">
          <div class="w-full h-[360px] sm:h-[400px] bg-white rounded-2xl shadow-2xl border border-white/60 flex flex-col overflow-hidden relative z-20">
            
            <!-- Header -->
            <div class="bg-[#0B3558] px-5 sm:px-6 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm border-b border-[#07233B]">
              <div class="flex items-center gap-2.5 text-white font-bold tracking-wide text-sm sm:text-base">
                <span class="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-pulse"></span>
                <span>Active Tenders & Notices</span>
              </div>
              <button 
                type="button"
                (click)="isTendersModalOpen.set(true)" 
                class="bg-[#F6A820] hover:bg-[#d89218] text-slate-950 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer focus:outline-none shadow-xs"
                aria-label="View all tenders in modal">
                View All &gt;
              </button>
            </div>

            <!-- Tenders List (Hardware-Accelerated Infinite Vertical Marquee) -->
            <div 
              class="flex-1 overflow-hidden relative cursor-pointer" 
              (mouseenter)="isHoveringTenders.set(true)" 
              (mouseleave)="isHoveringTenders.set(false)"
              (touchstart)="isHoveringTenders.set(true)"
              (touchend)="isHoveringTenders.set(false)">
              
              <div 
                class="absolute w-full animate-marquee-vertical" 
                [style.animation-play-state]="shouldAnimate() ? 'running' : 'paused'">
                
                <!-- Loop 1 -->
                <div class="flex flex-col divide-y divide-slate-100">
                  @for (item of tenders; track item.id) {
                    <div 
                      (click)="downloadSamplePdf()" 
                      class="p-3 sm:p-3.5 hover:bg-blue-50/60 transition-colors group">
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] sm:text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                        <div class="flex items-center gap-1.5">
                          @if (item.isNew) {
                            <span class="text-[9px] font-bold text-[#EA580C] bg-orange-50 px-1.5 py-0.5 rounded">NEW</span>
                          }
                          <span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{{ item.status }}</span>
                        </div>
                      </div>
                      <h4 class="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug mb-1 group-hover:text-[#0B3558] transition-colors line-clamp-2">
                        {{ item.title }}
                      </h4>
                      <p class="text-[10px] text-slate-400 font-mono">{{ item.id }}</p>
                    </div>
                  }
                </div>
                
                <!-- Loop 2 (Duplicate for Seamless Scroll) -->
                <div class="flex flex-col divide-y divide-slate-100" aria-hidden="true">
                  @for (item of tenders; track item.id + '-dup') {
                    <div 
                      (click)="downloadSamplePdf()" 
                      class="p-3 sm:p-3.5 hover:bg-blue-50/60 transition-colors group">
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] sm:text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                        <div class="flex items-center gap-1.5">
                          @if (item.isNew) {
                            <span class="text-[9px] font-bold text-[#EA580C] bg-orange-50 px-1.5 py-0.5 rounded">NEW</span>
                          }
                          <span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{{ item.status }}</span>
                        </div>
                      </div>
                      <h4 class="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug mb-1 group-hover:text-[#0B3558] transition-colors line-clamp-2">
                        {{ item.title }}
                      </h4>
                      <p class="text-[10px] text-slate-400 font-mono">{{ item.id }}</p>
                    </div>
                  }
                </div>

              </div>

            </div>

            <!-- Footer Hint -->
            <div class="bg-slate-50 px-4 py-2 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between shrink-0 select-none">
              <span>Click any tender to download notice</span>
              <span class="text-slate-500 font-medium">Auto-scrolls (Hover to pause)</span>
            </div>

          </div>
        </div>

      </div>
    </section>

    <!-- Modals -->
    @if (isTendersModalOpen()) {
      <app-tenders-modal (close)="isTendersModalOpen.set(false)"></app-tenders-modal>
    }
  `,
  styles: [`
    @keyframes marquee-vertical {
      0% {
        transform: translate3d(0, 0, 0);
      }
      100% {
        transform: translate3d(0, -50%, 0);
      }
    }
    .animate-marquee-vertical {
      animation: marquee-vertical 28s linear infinite;
      will-change: transform;
      backface-visibility: hidden;
      transform: translate3d(0, 0, 0);
    }
  `]
})
export class HeroSectionComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @ViewChild('heroSection') heroSectionRef?: ElementRef<HTMLElement>;

  readonly isTendersModalOpen = signal(false);
  readonly isHoveringTenders = signal(false);
  readonly isSectionVisible = signal(true);
  readonly isTabActive = signal(true);

  private observer?: IntersectionObserver;
  private visibilityHandler?: () => void;

  readonly shouldAnimate = () => {
    return this.isSectionVisible() && this.isTabActive() && !this.isHoveringTenders();
  };

  tenders = [
    {
      date: '28 Sep, 2026',
      id: 'NIB 28 2026-27',
      category: 'Procurement',
      isNew: true,
      status: 'Open',
      title: 'Procurement of various sizes C.I. Detachable Joints for HDPE Pipe at Divisional Store of Distt Rural Div I Bikaner'
    },
    {
      date: '21 Sep, 2026',
      id: 'NIT 03/2026-27 ACE PWD Zone Tonk',
      category: 'Construction',
      isNew: true,
      status: 'Open',
      title: 'CONSTRUCTION OF ROAD FROM SH-122 TO KARIRI UPTO DISTRICT BOARDER'
    },
    {
      date: '11 Jun, 2026',
      id: 'RCVET/2026/01',
      category: 'Services',
      isNew: false,
      status: 'Open',
      title: 'Tender for Computer Operator for RCVET Jodhpur'
    },
    {
      date: '07 Feb, 2026',
      id: 'CORR/2026/09',
      category: 'Corrigendum',
      isNew: false,
      status: 'Open',
      title: 'Corrigendum - 9 (Old RO Number is 4424)'
    },
    {
      date: '07 Feb, 2026',
      id: 'CORR/2026/04',
      category: 'Corrigendum',
      isNew: false,
      status: 'Open',
      title: 'CORRIGENDUM-4'
    },
    {
      date: '07 Feb, 2026',
      id: 'CORR/2026/05',
      category: 'Corrigendum',
      isNew: false,
      status: 'Open',
      title: 'Corrigendum-5 API for PM-SETU'
    },
    {
      date: '07 Feb, 2026',
      id: 'CORR/2026/06',
      category: 'Corrigendum',
      isNew: false,
      status: 'Open',
      title: 'Corrigendum-6 API for PM-SETU'
    }
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.heroSectionRef?.nativeElement;
    if (el) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.isSectionVisible.set(entry.isIntersecting);
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

  downloadSamplePdf() {
    const pdfContent = 'This is a sample PDF document for the selected tender.\n\nRSLDC Official Notice.';
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Tender_Document_Sample.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
