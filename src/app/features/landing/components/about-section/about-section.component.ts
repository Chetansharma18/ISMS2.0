import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  signal,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full bg-[#FFFFFF]'
  },
  template: `
    <!-- Section Wrapper: 64–80px desktop, 36–44px mobile, plain white background, official government feel -->
    <section #sectionRef class="w-full bg-[#FFFFFF] py-9 sm:py-12 md:py-16 xl:py-20 border-b border-[#DCE4ED]" aria-labelledby="about-isms-heading">
      
      <!-- Centered Container: Max width 1440px with responsive padding (20px mobile) -->
      <div class="w-full max-w-[1440px] mx-auto px-5 sm:px-8 xl:px-12 box-border">
        
        <!-- Two-Column Layout: Stacks on mobile, ~55% left & ~45% right on desktop with 40–48px gap, vertically centered -->
        <div class="flex flex-col lg:grid lg:grid-cols-[55fr_45fr] items-center gap-6 md:gap-8 lg:gap-12 w-full">

          <!-- Left Column: About Content (~55% width) -->
          <div class="w-full flex flex-col justify-center text-left">
            
            <!-- Section Heading: Inter 700, 36px Desktop / 32px Tablet / 28px Mobile, #12365A -->
            <h2 id="about-isms-heading" class="font-['Inter',sans-serif] text-[28px] sm:text-[32px] xl:text-[36px] font-bold leading-[1.2] text-[#12365A] m-0 tracking-tight">
              About ISMS 2.0
            </h2>

            <!-- Small Orange Underline: 42px width, 4px height, #F28C28, 2px radius, 14–16px bottom spacing -->
            <div class="w-[42px] h-[4px] bg-[#F28C28] rounded-[2px] mt-2.5 mb-4 sm:mb-[16px]" aria-hidden="true"></div>

            <!-- Existing Description Paragraph 1: 100% original text, natural wrapping, left-aligned -->
            <p class="font-['Inter',sans-serif] text-[15px] xl:text-[16px] font-normal leading-[1.65] text-[#344256] text-left max-w-[700px] m-0 mb-4">
              Integrated Scheme Management System (ISMS 2.0) is a comprehensive e-Governance and Management Information System (MIS) designed to digitally transform, integrate, and streamline the processes involved in the planning, implementation, monitoring, and management of skill development schemes across Rajasthan. The platform provides a centralized and secure digital ecosystem that unites youth, training providers, government departments, empaneled agencies, and certification bodies on a single, high-transparency platform — ensuring accountability, real-time visibility, and data-driven decision making at every stage.
            </p>

            <!-- Existing Description Paragraph 2: Divided at natural sentence boundary, 100% original text -->
            <p class="font-['Inter',sans-serif] text-[15px] xl:text-[16px] font-normal leading-[1.65] text-[#344256] text-left max-w-[700px] m-0">
              ISMS 2.0 enables end-to-end scheme management — from scheme launching and candidate enrollment through bio-metric attendance, quality inspections, assessment, certification, and direct benefit and fund disbursements — all within one unified, auditable platform.
            </p>
          </div>

          <!-- Right Column: Video Panel (~45% width, 16:9 Aspect Ratio) -->
          <div class="w-full flex items-center justify-center">
            
            <!-- Video Container Card: 16:9, rounded 12px, border 1px solid #DCE4ED, subtle shadow -->
            <div class="w-full rounded-[12px] overflow-hidden bg-[#0B2440] border border-[#DCE4ED] shadow-[0_4px_16px_rgba(18,54,90,0.08)] relative">
              
              <div class="relative w-full aspect-video bg-[#0B2440] overflow-hidden flex items-center justify-center">
                
                <!-- Actual Video Element -->
                <video 
                  #videoRef
                  class="w-full h-full object-cover object-center transition-opacity duration-300"
                  [class.opacity-0]="!isVideoLoaded()"
                  [class.opacity-100]="isVideoLoaded()"
                  playsinline
                  loop
                  muted
                  preload="none"
                  aria-label="ISMS 2.0 Skill Development Overview Video">
                </video>

                <!-- Poster / Loading Placeholder Before Video Loads -->
                @if (!isVideoLoaded()) {
                  <div class="absolute inset-0 bg-gradient-to-br from-[#0B2440] to-[#12365A] flex flex-col items-center justify-center p-5 text-center z-5">
                    <div class="w-11 h-11 rounded-full bg-white/12 flex items-center justify-center mb-2.5 text-white">
                      <svg class="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p class="text-[12px] font-semibold text-slate-100 uppercase tracking-wider m-0">RSLDC Skill Training in Action</p>
                    <p class="text-[11px] text-slate-300 mt-1 mb-0">Scroll into view to play video</p>
                  </div>
                }

                <!-- Play / Pause Overlay Control (Top Left) -->
                <div class="absolute top-3 left-3 z-20">
                  <button 
                    type="button"
                    (click)="togglePlayPause()"
                    class="w-8 h-8 rounded-full bg-[#0B2440]/80 hover:bg-[#0B2440] text-white flex items-center justify-center border border-[#DCE4ED]/35 shadow-sm cursor-pointer transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                    [attr.aria-label]="isPlaying() ? 'Pause video' : 'Play video'"
                    title="{{ isPlaying() ? 'Pause video' : 'Play video' }}">
                    @if (isPlaying()) {
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    } @else {
                      <svg class="w-3.5 h-3.5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    }
                  </button>
                </div>

                <!-- Sound Off / Sound On Toggle Control (Top Right) -->
                <div class="absolute top-3 right-3 z-20">
                  <button 
                    type="button"
                    (click)="toggleSound()"
                    class="px-2.5 py-1 rounded-full bg-[#0B2440]/80 hover:bg-[#0B2440] text-white text-[11px] sm:text-[11.5px] font-semibold flex items-center gap-1.5 border border-[#DCE4ED]/35 shadow-sm cursor-pointer transition-all hover:scale-103 focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                    [attr.aria-label]="isMuted() ? 'Unmute video audio' : 'Mute video audio'"
                    title="{{ isMuted() ? 'Unmute video audio' : 'Mute video audio' }}">
                    @if (isMuted()) {
                      <svg class="w-3.5 h-3.5 text-[#F28C28]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                      <span>Sound Off</span>
                    } @else {
                      <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      <span>Sound On</span>
                    }
                  </button>
                </div>

                <!-- Video Caption Overlay (Positioned in lower portion, subtle dark navy gradient, 14–18px padding) -->
                <div class="absolute bottom-0 inset-x-0 z-10 pointer-events-none bg-gradient-to-t from-[#0B2440]/95 via-[#0B2440]/65 to-transparent pt-7 pb-3.5 px-4 sm:pt-8 sm:pb-4 sm:px-4.5 box-border">
                  <p class="font-['Inter',sans-serif] text-[13px] sm:text-[14px] lg:text-[14.5px] text-white leading-normal sm:leading-relaxed font-normal m-0 drop-shadow-sm">
                    “{{ fullQuote }}”
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  `
})
export class AboutSectionComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @ViewChild('sectionRef') sectionRef?: ElementRef<HTMLElement>;
  @ViewChild('videoRef') videoRef?: ElementRef<HTMLVideoElement>;

  readonly isVideoLoaded = signal<boolean>(false);
  readonly isPlaying = signal<boolean>(false);
  readonly isMuted = signal<boolean>(true); // Strictly sound off by default

  readonly fullQuote = 'ISMS 2.0 is an integrated MIS system of RSLDC to provide a single platform to Youths, Training providers, Govt. Departments, Convergence Departments, and Certification agencies for Skill Development Schemes.';

  private observer?: IntersectionObserver;
  private isVisible = false;
  private visibilityHandler?: () => void;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.sectionRef?.nativeElement;
    const video = this.videoRef?.nativeElement;
    if (!el || !video) return;

    // Ensure audio starts muted
    video.muted = true;
    video.volume = 0;
    this.isMuted.set(true);

    // Setup IntersectionObserver to lazy load & play only when visible
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (entry.isIntersecting) {
            this.handleEnterViewport();
          } else {
            this.handleExitViewport();
          }
        });
      },
      {
        root: null,
        rootMargin: '120px 0px', // Preload just slightly before reaching it
        threshold: 0.15
      }
    );

    this.observer.observe(el);

    // Page visibility listener: pause when browser tab is inactive
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.pauseVideo();
      } else if (this.isVisible && this.isVideoLoaded()) {
        this.playVideo();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private handleEnterViewport(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    if (!this.isVideoLoaded()) {
      video.src = '/video.mp4';
      video.load();
      video.onloadeddata = () => {
        this.isVideoLoaded.set(true);
        this.playVideo();
      };
      // Fallback in case onloadeddata was already ready
      setTimeout(() => {
        if (!this.isVideoLoaded()) {
          this.isVideoLoaded.set(true);
          this.playVideo();
        }
      }, 500);
    } else {
      this.playVideo();
    }
  }

  private handleExitViewport(): void {
    this.pauseVideo();
  }

  private playVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.play().then(() => {
      this.isPlaying.set(true);
    }).catch(() => {
      this.isPlaying.set(false);
    });
  }

  private pauseVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.pause();
    this.isPlaying.set(false);
  }

  togglePlayPause(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    if (this.isPlaying()) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  toggleSound(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    const nextMuted = !this.isMuted();
    video.muted = nextMuted;
    video.volume = nextMuted ? 0 : 0.8;
    this.isMuted.set(nextMuted);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
      video.src = '';
      video.load();
    }
  }
}
