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
    <section #sectionRef class="pt-8 sm:pt-12 pb-8 sm:pb-12 bg-white border-b border-slate-100">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          <!-- Left Column: About Text & Highlights -->
          <div class="lg:col-span-7 order-2 lg:order-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-3">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              e-Governance & MIS Portal
            </div>

            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B3558] mb-5 tracking-tight font-sans">
              About ISMS 2.0
            </h2>

            <!-- Core Content -->
            <div class="space-y-4 text-[13px] sm:text-[14px] text-slate-600 leading-relaxed sm:leading-[1.8] text-justify sm:text-left">
              <p>
                <strong class="text-slate-800 font-bold">Integrated Scheme Management System (ISMS 2.0)</strong> is a comprehensive
                <strong class="text-slate-800">e-Governance and Management Information System (MIS)</strong> designed to digitally transform, 
                integrate, and streamline the processes involved in the planning, implementation, monitoring, and management of skill development 
                schemes across Rajasthan.
              </p>
              <p>
                The platform provides a centralized and secure digital ecosystem that unites
                <strong class="text-slate-800 font-semibold">youth, training providers, government departments, empaneled agencies, and certification bodies</strong>
                on a single, high-transparency platform.
              </p>
              <p>
                ISMS 2.0 enables <strong class="text-slate-800 font-semibold">end-to-end scheme management</strong>, from scheme launching and candidate enrollment 
                through bio-metric attendance, quality inspections, assessment, certification, and direct benefit/fund disbursements.
              </p>

              <!-- Expandable In-Depth Overview -->
              @if (isExpanded()) {
                <div class="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
                  <p>
                    ISMS 2.0 serves as a centralized <strong class="text-slate-800">decision-support platform</strong>, enabling stakeholders 
                    to generate structured MIS reports, monitor target vs. achievement KPIs, detect bottlenecks, and track the progress of flagship skilling initiatives in real time.
                  </p>
                  <p>
                    The system is built on a <strong class="text-slate-800">modular, scalable, and secure cloud architecture</strong>. 
                    It integrates seamlessly with Rajasthan single sign-on (SSO), Jan Aadhaar, and national portals (PM-SETU, Skill India Digital) 
                    via standardized APIs to eliminate redundant data entry.
                  </p>
                  <p>
                    By establishing a <strong class="text-slate-800">single source of truth</strong> with rigorous audit trails and role-based permissions, 
                    ISMS 2.0 ensures accountable, transparent, and citizen-centric governance for the youth of Rajasthan.
                  </p>
                </div>
              }
            </div>

            <!-- Read More / Less Toggle Button -->
            <div class="mt-6 flex items-center gap-4">
              <button 
                type="button"
                (click)="toggleExpand()" 
                class="inline-flex items-center gap-2 bg-[#0B3558] hover:bg-[#07233B] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:ring-offset-2"
                [attr.aria-expanded]="isExpanded()">
                <span>{{ isExpanded() ? 'Read Less' : 'Read Full Overview' }}</span>
                <svg 
                  class="w-4 h-4 transition-transform duration-300" 
                  [class.rotate-180]="isExpanded()" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Quick Feature Pills -->
              <div class="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span class="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  Role-Based Access
                </span>
                <span class="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  Real-time Tracking
                </span>
              </div>
            </div>

          </div>

          <!-- Right Column: Video Showcase & Quote -->
          <div class="lg:col-span-5 order-1 lg:order-2 w-full">
            <div class="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xl relative group">
              
              <!-- Video Player with Lazy-Load & Controls -->
              <div class="relative w-full aspect-video sm:h-[320px] lg:h-[360px] bg-slate-950 overflow-hidden flex items-center justify-center">
                
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
                  <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0B3558] to-slate-900 flex flex-col items-center justify-center p-6 text-center">
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

                <!-- Play / Pause Overlay Control (Bottom Left) -->
                <div class="absolute bottom-3 left-3 z-20">
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
              
              <!-- Quote Block Docked Below Video -->
              <div class="bg-gradient-to-r from-[#0B3558] to-[#122b46] text-white p-4 sm:p-5 relative border-t border-slate-700/50">
                <span class="text-3xl text-orange-400 font-serif leading-none select-none absolute top-3 left-3 opacity-60">“</span>
                <p class="text-[12px] sm:text-[13px] text-slate-200 leading-relaxed pl-5 pr-2 font-medium">
                  ISMS 2.0 is an integrated MIS system of RSLDC to provide a single platform to 
                  Youths, Training providers, Govt. Departments, Convergence Departments, and 
                  Certification agencies for Skill Development Schemes.
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

  readonly isExpanded = signal<boolean>(false);
  readonly isVideoLoaded = signal<boolean>(false);
  readonly isPlaying = signal<boolean>(false);
  readonly isMuted = signal<boolean>(true); // Strictly sound off by default

  private observer?: IntersectionObserver;
  private isVisible = false;
  private visibilityHandler?: () => void;

  toggleExpand(): void {
    this.isExpanded.update(v => !v);
  }

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
