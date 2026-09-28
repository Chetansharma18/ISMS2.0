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
    class: 'block w-full'
  },
  template: `
    <section #sectionRef class="py-8 sm:py-12 bg-white border-b border-slate-100">
      <div class="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
        
        <h2 class="landing-section-title text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#0B3558] mb-6 sm:mb-8 tracking-tight font-sans" style="color: var(--color-primary, #174A6E); font-family: var(--font-family-base, 'Inter', sans-serif);">
          About ISMS 2.0
        </h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          <!-- Left Column: About Text (Aligned parallel with right side video) -->
          <div class="lg:col-span-7 flex flex-col justify-start pt-1">

            <!-- Core Content -->
            <div class="landing-body-text space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed sm:leading-[1.7] text-left">
              <p>
                Integrated Scheme Management System (ISMS 2.0) is a comprehensive
                e-Governance and Management Information System (MIS) designed to digitally transform, 
                integrate, and streamline the processes involved in the planning, implementation, monitoring, and management of skill development 
                schemes across Rajasthan.
              </p>
              <p>
                The platform provides a centralized and secure digital ecosystem that unites
                youth, training providers, government departments, empaneled agencies, and certification bodies
                on a single, high-transparency platform.
              </p>
              <p>
                ISMS 2.0 enables end-to-end scheme management, from scheme launching and candidate enrollment 
                through bio-metric attendance, quality inspections, assessment, certification, and direct benefit/fund disbursements.
              </p>
            </div>
          </div>

          <!-- Right Column: Video Showcase & Quote -->
          <div class="lg:col-span-5 order-1 lg:order-2 w-full mt-2.5">
            <div class="rounded-2xl overflow-hidden bg-slate-900 border border-[#0B3558]/30 shadow-[0_0_25px_rgba(11,53,88,0.25)] relative group transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(11,53,88,0.4)]">
              
              <!-- Video Player with Lazy-Load & Controls -->
              <div class="relative w-full aspect-video sm:h-80 lg:h-90 bg-slate-950 overflow-hidden flex items-center justify-center">
                
                <!-- Video Element (Sound Off by Default, Playsinline, Lazy loaded) -->
                <video 
                  #videoRef
                  class="w-full h-full object-cover object-center transition-opacity duration-500"
                  [class.opacity-0]="!isVideoLoaded()"
                  [class.opacity-100]="isVideoLoaded()"
                  playsinline
                  loop
                  muted
                  preload="none"
                  aria-label="ISMS 2.0 Skill Development Overview Video">
                </video>

                <!-- Poster / Loading Placeholder Before Video Plays -->
                @if (!isVideoLoaded()) {
                  <div class="absolute inset-0 bg-linear-to-br from-slate-900 via-[#0B3558] to-slate-900 flex flex-col items-center justify-center p-6 text-center">
                    <div class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 text-white">
                      <svg class="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p class="text-xs font-semibold text-slate-300 tracking-wide uppercase">RSLDC Skill Training in Action</p>
                    <p class="text-[11px] text-slate-400 mt-1">Scroll into view to play video</p>
                  </div>
                }

                <!-- Sound Off / Sound Toggle Badge (Top Right) -->
                <div class="absolute top-3 right-3 z-20 flex items-center gap-2">
                  <button 
                    type="button"
                    (click)="toggleSound()"
                    class="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow cursor-pointer border border-white/20"
                    [attr.aria-label]="isMuted() ? 'Unmute video audio' : 'Mute video audio'">
                    @if (isMuted()) {
                      <svg class="w-3.5 h-3.5 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                      <span class="text-[11px] font-medium">Sound Off</span>
                    } @else {
                      <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      <span class="text-[11px] font-medium">Sound On</span>
                    }
                  </button>
                </div>

                <!-- Play / Pause Overlay Control (Top Left) -->
                <div class="absolute top-3 left-3 z-20">
                  <button 
                    type="button"
                    (click)="togglePlayPause()"
                    class="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white w-8 h-8 rounded-full flex items-center justify-center transition-all shadow cursor-pointer border border-white/20"
                    [attr.aria-label]="isPlaying() ? 'Pause video' : 'Play video'">
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

              </div>
              
              <!-- Quote Block Overlayed on Video -->
              <div class="absolute bottom-0 inset-x-0 z-10 pointer-events-none bg-linear-to-t from-[#0B3558]/95 via-[#0B3558]/60 to-transparent pt-20 pb-5 sm:pb-6 px-4 sm:px-6">
                <p class="text-[12px] sm:text-[13px] text-white leading-relaxed px-2 font-medium drop-shadow-md min-h-13.75 sm:min-h-15 text-justify">
                  <span class="text-2xl text-orange-400 font-serif leading-none relative top-1.5 opacity-90">“</span>
                  <span class="px-1">{{ displayedQuote() }}</span><span class="animate-pulse text-orange-400 font-bold" [class.hidden]="hasFinishedTyping()">|</span>
                  <span class="text-2xl text-orange-400 font-serif leading-none relative top-1.5 opacity-90" [class.hidden]="!hasFinishedTyping()">”</span>
                </p>
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
  readonly displayedQuote = signal<string>('');
  readonly hasFinishedTyping = signal<boolean>(false);
  private typewriterInterval: any;
  private hasTyped = false;

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
        rootMargin: '100px 0px', // Preload just slightly before user reaches it
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

    // Start typewriter effect when video enters viewport
    this.startTypewriter();

    if (!this.isVideoLoaded()) {
      // Lazy attach the MP4 source only when needed
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

  private startTypewriter(): void {
    if (this.hasTyped) return;
    this.hasTyped = true;
    let i = 0;
    this.displayedQuote.set('');

    this.typewriterInterval = setInterval(() => {
      if (i < this.fullQuote.length) {
        this.displayedQuote.update(q => q + this.fullQuote.charAt(i));
        i++;
      } else {
        this.hasFinishedTyping.set(true);
        if (this.typewriterInterval) {
          clearInterval(this.typewriterInterval);
        }
      }
    }, 25);
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
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
    }
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
      video.src = '';
      video.load();
    }
  }
}
