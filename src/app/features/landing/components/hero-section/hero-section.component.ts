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
      
      />
      
      <!-- High-Readability Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-[#07233B]/95 via-[#0B3558]/90 to-[#0B3558]/50 sm:to-[#0B3558]/30"></div>
      <div class="absolute inset-0 bg-radial-at-t from-transparent via-transparent to-black/30 pointer-events-none"></div>

      <div class="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
        
        <!-- Hero Content (Left) -->
        <div class="lg:col-span-7 text-left">
          
          <h1 class="landing-hero-title text-white !text-white text-3xl sm:text-4xl lg:text-[44px] font-extrabold leading-[1.18] mb-5 max-w-lg tracking-tight drop-shadow-md font-sans" style="color: #ffffff !important; font-family: var(--font-family-base, 'Inter', sans-serif);">
            <span class="text-white !text-white font-extrabold inline-block" style="color: #ffffff !important;">Integrated Scheme</span> <br class="hidden sm:inline" />
            <span class="text-white !text-white font-extrabold inline-block" style="color: #ffffff !important;">Management System</span>
          </h1>

          <p class="landing-body-text text-slate-100 !text-slate-100 text-sm sm:text-base max-w-md lg:max-w-[480px] xl:max-w-lg leading-relaxed drop-shadow font-normal text-left" style="color: #f1f5f9 !important;">
            A unified, transparent digital ecosystem empowering skill development schemes, training operations, biometric verification, assessments, certifications, and sustainable placements across Rajasthan.
          </p>

        </div>

        <!-- Tenders Sidebar (Right) - Perfectly balanced column -->
        <div class="lg:col-span-5 w-full max-w-[460px] mx-auto lg:ml-auto relative">
          <div class="w-full h-[460px] sm:h-[500px] lg:h-[540px] bg-white rounded-2xl shadow-2xl border border-white/60 flex flex-col overflow-hidden relative z-20">
            
            <!-- Header -->
            <div class="bg-primary px-5 sm:px-6 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm border-b border-[#07233B]" style="background-color: var(--color-primary, #174A6E);">
              <div class="flex items-center gap-2.5 text-white font-bold tracking-wide text-sm sm:text-base">
                <span>TENDER</span>
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
                <div class="flex flex-col gap-2 p-2">
                  @for (item of tenders; track item.id) {
                    <div 
                      (click)="openTenderPreview(item)" 
                      class="relative p-3 sm:p-3.5 bg-white border border-[#0B3558]/20 shadow-[0_0_15px_rgba(11,53,88,0.08)] rounded-lg hover:shadow-[0_0_20px_rgba(11,53,88,0.15)] hover:border-[#0B3558]/40 hover:bg-slate-50 transition-all group">
                      @if (item.isNew) {
                        <img src="/new.png" alt="New Tender" class="absolute -top-1.5 -left-1.5 w-11 h-11 object-cover z-10 pointer-events-none drop-shadow-sm rounded-tl-lg" />
                      }
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] sm:text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                      </div>
                      <h4 class="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug mb-1 group-hover:!text-blue-600 group-hover:underline group-hover:underline-offset-2 transition-all line-clamp-2">
                        {{ item.title }}
                      </h4>
                      <p class="text-[10px] text-slate-400 font-mono">{{ item.id }}</p>
                    </div>
                  }
                </div>
                
                <!-- Loop 2 (Duplicate for Seamless Scroll) -->
                <div class="flex flex-col gap-2 p-2 mt-2" aria-hidden="true">
                  @for (item of tenders; track item.id + '-dup') {
                    <div 
                      (click)="openTenderPreview(item)" 
                      class="relative p-3 sm:p-3.5 bg-white border border-[#0B3558]/20 shadow-[0_0_15px_rgba(11,53,88,0.08)] rounded-lg hover:shadow-[0_0_20px_rgba(11,53,88,0.15)] hover:border-[#0B3558]/40 hover:bg-slate-50 transition-all group">
                      @if (item.isNew) {
                        <img src="/new.png" alt="New Tender" class="absolute -top-1.5 -left-1.5 w-11 h-11 object-cover z-10 pointer-events-none drop-shadow-sm rounded-tl-lg" />
                      }
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] sm:text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                      </div>
                      <h4 class="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug mb-1 group-hover:!text-blue-600 group-hover:underline group-hover:underline-offset-2 transition-all line-clamp-2">
                        {{ item.title }}
                      </h4>
                      <p class="text-[10px] text-slate-400 font-mono">{{ item.id }}</p>
                    </div>
                  }
                </div>

              </div>

            </div>



          </div>
          
          <!-- Slide-out Preview Panel -->
          @if (selectedPreviewTender()) {
            <div class="absolute inset-y-0 right-[calc(100%-24px)] w-[280px] sm:w-[360px] bg-white shadow-[-10px_0_20px_rgba(0,0,0,0.15)] z-10 rounded-l-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-12 duration-300">
              
              <!-- Header -->
              <div class="p-4 pr-10 border-b border-slate-100 bg-slate-50 flex justify-between items-start gap-2">
                <div>
                  <h3 class="text-xs sm:text-sm font-bold text-slate-800 leading-snug line-clamp-2">{{ selectedPreviewTender().title }}</h3>
                  <p class="text-[10px] text-slate-500 font-mono mt-1">{{ selectedPreviewTender().id }}</p>
                </div>
                <button (click)="closeTenderPreview()" class="p-1.5 hover:bg-slate-200 rounded-full transition-colors shrink-0">
                  <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Preview Area -->
              <div class="flex-1 overflow-y-auto p-4 pr-10 bg-slate-200/60 flex flex-col items-center gap-4 custom-scrollbar">
                
                <!-- Page 1 -->
                <div class="w-full aspect-[1/1.414] bg-white shadow-sm border border-slate-300 flex flex-col shrink-0 relative overflow-hidden p-4 sm:p-5">
                  <div class="w-full h-6 border-b border-slate-200 mb-4 flex items-center justify-between pb-2">
                    <div class="w-10 h-2 bg-slate-200 rounded"></div>
                    <div class="w-5 h-5 bg-slate-100 rounded-full"></div>
                  </div>
                  <div class="w-3/4 h-3 bg-slate-200 rounded mb-5"></div>
                  <div class="space-y-2">
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-5/6 h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-4/5 h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-11/12 h-1.5 bg-slate-100 rounded"></div>
                  </div>
                </div>

                <!-- Page 2 -->
                <div class="w-full aspect-[1/1.414] bg-white shadow-sm border border-slate-300 flex flex-col shrink-0 relative overflow-hidden p-4 sm:p-5">
                  <div class="space-y-2 mt-2">
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-11/12 h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-4/5 h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-5/6 h-1.5 bg-slate-100 rounded"></div>
                  </div>
                  <div class="space-y-2 mt-6">
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-3/4 h-1.5 bg-slate-100 rounded"></div>
                  </div>
                </div>

                <!-- Page 3 -->
                <div class="w-full aspect-[1/1.414] bg-white shadow-sm border border-slate-300 flex flex-col shrink-0 relative overflow-hidden p-4 sm:p-5">
                  <div class="space-y-2 mt-2">
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-10/12 h-1.5 bg-slate-100 rounded"></div>
                    <div class="w-full h-1.5 bg-slate-100 rounded"></div>
                  </div>
                  <div class="mt-auto border-t border-slate-100 pt-4 flex justify-between items-end">
                     <div class="w-16 h-1.5 bg-slate-200 rounded"></div>
                     <div class="w-12 h-6 bg-slate-100 rounded"></div>
                  </div>
                </div>

              </div>

              <!-- Footer Action -->
              <div class="p-4 pr-10 border-t border-slate-100 bg-white">
                <button (click)="downloadSamplePdf()" class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md text-xs sm:text-sm" style="background-color: var(--color-primary, #174A6E);">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </div>

            </div>
          }

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
    }
  `]
})
export class HeroSectionComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @ViewChild('heroSection') heroSectionRef?: ElementRef<HTMLElement>;

  readonly isTendersModalOpen = signal(false);
  readonly selectedPreviewTender = signal<any | null>(null);

  openTenderPreview(tender: any) {
    this.selectedPreviewTender.set(tender);
  }

  closeTenderPreview() {
    this.selectedPreviewTender.set(null);
  }
  readonly isHoveringTenders = signal(false);
  readonly isSectionVisible = signal(true);
  readonly isTabActive = signal(true);

  private observer?: IntersectionObserver;
  private visibilityHandler?: () => void;

  readonly shouldAnimate = () => {
    return this.isSectionVisible() && this.isTabActive() && !this.isHoveringTenders() && !this.selectedPreviewTender();
  };

  tenders = [
    {
      date: '23/01/2026',
      id: 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
      category: 'MMKVY',
      isNew: true,
      status: 'Open',
      title: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
    },
    {
      date: '17/02/2026',
      id: 'RSLDC/EOI/MNSKSY/2025-26/01',
      category: 'MNSKSY',
      isNew: true,
      status: 'Open',
      title: 'Expression of Interest (EOI) MNSKSY in RSLDC.'
    },
    {
      date: '26/09/2024',
      id: 'RSLDC/EOI/MMKVY Cat I II III/2024-25/01',
      category: 'MMKVY',
      isNew: false,
      status: 'Closed',
      title: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
    },
    {
      date: '26/09/2024',
      id: 'RSLDC/EOI/IMSHAKTI/2024-25/01',
      category: 'IM_Shakti',
      isNew: false,
      status: 'Closed',
      title: 'Expression of Interest for submission of proposal to undertake the Skill Training under IM Shakti Scheme'
    },
    {
      date: '02/05/2023',
      id: 'RSLDC/EOI2023-24/Cat-III/RAJKVik RTD',
      category: 'RAJKVIKRTD',
      isNew: false,
      status: 'Closed',
      title: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (MMKVY-CAT-III 'RAJKVIK)' scheme of RSLDC"
    },
    {
      date: '05/07/2023',
      id: 'RSLDC/MMYKY2/EoI23-24/01',
      category: 'MMYKY',
      isNew: false,
      status: 'Closed',
      title: 'EoI for MMYKY 2.O for RSLDC'
    },
    {
      date: '18/04/2023',
      id: 'RSLDC/EoI/2023-24/1/MMKVYSAMARTH',
      category: 'SAMARTH',
      isNew: false,
      status: 'Closed',
      title: 'EoI for submission of proposal to undertake the project under MMKVY(Cat-III: SAMARTH) scheme of RSLDC'
    },
    {
      date: '18/04/2023',
      id: 'RSLDC/EoI/2023-24/1-RAJKVIK General',
      category: 'RAJKVIK',
      isNew: false,
      status: 'Closed',
      title: 'Eol for submission of proposal to undertake the project under RAJKVIK scheme of RSLDC.'
    },
    {
      date: '18/04/2023',
      id: 'RSLDC/EoI/2023-24/1/MMKVYSAKSHM',
      category: 'SAKSHM',
      isNew: false,
      status: 'Closed',
      title: 'Eol for submission of proposal to undertake the project under MMKVY(Cat-II: SAKSHM) scheme of RSLDC'
    },
    {
      date: '08/07/2022',
      id: 'RSLDC/EOI/2022-23/1MMKVYRTD',
      category: 'RAJKVIK',
      isNew: false,
      status: 'Closed',
      title: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan"
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
