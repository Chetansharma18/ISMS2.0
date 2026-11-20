import {
  ChangeDetectionStrategy,
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
import { ButtonComponent, IconComponent } from '../../../../shared';

@Component({
  selector: 'app-about-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonComponent, IconComponent],
  host: {
    class: 'block w-full bg-white'
  },
  template: `
    <!-- Section Wrapper: Official Rajasthan Government Presentation with Subtle Background Architecture & Lighting -->
    <section #sectionRef class="relative w-full bg-linear-to-b from-[#FDFCFB] via-[#FFFFFF] to-[#F8F9FA] py-10 sm:py-14 md:py-18 xl:py-22 border-b border-[#DCE4ED] overflow-hidden" aria-labelledby="about-isms-heading">
      
      <!-- Subtle Decorative Background Elements (Official Gov Geometry & Micro-Motif) -->
      <div class="absolute inset-0 opacity-[0.022] pointer-events-none select-none bg-[radial-gradient(#7C0E44_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true"></div>
      <div class="absolute -top-32 -left-32 w-96 h-96 bg-[#7C0E44]/4 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-[#EA580C]/4 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

      <!-- Centered Container: Max width 1440px with responsive padding -->
      <div class="relative z-10 w-full max-w-360 mx-auto px-5 sm:px-8 xl:px-12 box-border">
        
        <!-- Two-Column Layout: Stacks on mobile, ~54% left & ~46% right on desktop with 40–56px gap -->
        <div class="flex flex-col lg:grid lg:grid-cols-[54fr_46fr] items-center gap-8 md:gap-10 lg:gap-12 xl:gap-16 w-full">

          <!-- Left Column: Official System Identity & Key Capabilities (~54% width) -->
          <div class="w-full flex flex-col justify-center text-left">
            
            <!-- Government Authority Tag / Status Pill -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8EDF1] border border-[#EADCE2] w-fit mb-3.5 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" aria-hidden="true"></span>
              <span class="text-[11px] sm:text-[11.5px] font-bold text-[#7C0E44] tracking-wider uppercase">RSLDC • Government of Rajasthan</span>
            </div>

            <!-- Section Heading & Identity -->
            <h2 id="about-isms-heading" class="font-sans text-[26px] sm:text-[32px] xl:text-[38px] font-extrabold leading-[1.18] text-[#7C0E44] m-0 tracking-tight">
              About ISMS <span class="text-[#EA580C]">2.0</span>
            </h2>
            <p class="text-xs sm:text-[12.5px] font-semibold text-[#625663] tracking-wide uppercase mt-1 mb-2.5">
              Integrated Scheme Management System
            </p>

            <!-- Rajasthan Multi-Color Thin Line Accent Ribbon -->
            <div class="flex items-center gap-1 mb-4 sm:mb-5" aria-hidden="true">
              <div class="w-12 h-1 bg-[#EA580C] rounded-full"></div>
              <div class="w-4 h-1 bg-[#7C0E44] rounded-full"></div>
              <div class="w-2.5 h-1 bg-[#276CA1] rounded-full"></div>
              <div class="w-2 h-1 bg-[#47CA6E] rounded-full"></div>
            </div>

            <!-- Authentic Description Paragraph -->
            <p class="font-sans text-[14px] sm:text-[15px] font-normal leading-[1.7] text-[#334155] text-left m-0 mb-5">
              <strong class="font-semibold text-[#0F172A]">ISMS 2.0</strong> is Rajasthan's next-generation e-Governance & Management Information System (MIS) engineered to digitally transform, unify, and monitor all state skill development initiatives. Operating as a centralized, high-transparency digital ecosystem, it seamlessly connects youth, training partners, and government departments for accountable, real-time, data-driven governance.
            </p>

            <!-- 4 Structured Pillar Cards (2x2 Grid) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-5">
              
              <!-- Pillar 1: Single Window MIS -->
              <div class="about-pillar-card group/pillar">
                <div class="pillar-icon-wrap icon-primary">
                  <app-icon name="building" size="sm" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="pillar-title">Single-Window Portal</h3>
                  <p class="pillar-desc">Unifying youth, training partners & stakeholders on one platform.</p>
                </div>
              </div>

              <!-- Pillar 2: Biometric & Inspection Tracking -->
              <div class="about-pillar-card group/pillar">
                <div class="pillar-icon-wrap icon-orange">
                  <app-icon name="identification" size="sm" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="pillar-title">Biometric Attendance</h3>
                  <p class="pillar-desc">Aadhaar-verified attendance and geo-tagged inspection desks.</p>
                </div>
              </div>

              <!-- Pillar 3: End-to-End Governance -->
              <div class="about-pillar-card group/pillar">
                <div class="pillar-icon-wrap icon-blue">
                  <app-icon name="clipboard-check" size="sm" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="pillar-title">End-to-End Lifecycle</h3>
                  <p class="pillar-desc">From candidate enrollment to assessment and certification.</p>
                </div>
              </div>

              <!-- Pillar 4: Direct Benefit & Auditing -->
              <div class="about-pillar-card group/pillar">
                <div class="pillar-icon-wrap icon-green">
                  <app-icon name="bank" size="sm" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="pillar-title">Direct Disbursements</h3>
                  <p class="pillar-desc">Milestone-linked payment releases with complete audit trail.</p>
                </div>
              </div>

            </div>

            <!-- Official Government Trust Tags -->
            <div class="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-3 border-t border-slate-200/80 text-[11px] sm:text-[11.5px] text-slate-600 font-semibold">
              <span class="inline-flex items-center gap-1.5"><app-icon name="shield-check" size="xs" class="text-[#7C0E44]" /> 100% Auditable Platform</span>
              <span class="text-slate-300">•</span>
              <span class="inline-flex items-center gap-1.5"><app-icon name="check-circle" size="xs" class="text-[#16A34A]" /> Real-Time Scheme Visibility</span>
              <span class="text-slate-300">•</span>
              <span class="inline-flex items-center gap-1.5"><app-icon name="lock" size="xs" class="text-[#EA580C]" /> Aadhaar-Linked Security</span>
            </div>

          </div>

          <!-- Right Column: Video Showcase with Mst Sa Hover (~46% width) -->
          <div class="w-full flex items-center justify-center">
            
            <div class="video-showcase-wrapper group w-full relative">
              
              <!-- Multi-color Ambient Backlight Glow on Hover -->
              <div class="video-ambient-glow" aria-hidden="true"></div>

              <!-- Main Video Card Container -->
              <div class="video-interactive-card">
                
                <div class="relative w-full aspect-video bg-[#0B1528] overflow-hidden flex items-center justify-center">
                  
                  <!-- Actual Video Element (with subtle smooth zoom on hover) -->
                  <video 
                    #videoRef
                    class="video-media"
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
                    <div class="absolute inset-0 bg-linear-to-br from-[#5E0832] to-[#7C0E44] flex flex-col items-center justify-center p-5 text-center z-5">
                      <div class="w-12 h-12 rounded-full bg-white/12 flex items-center justify-center mb-2.5 text-white shadow-inner">
                        <app-icon name="play-circle" size="lg" [stroke]="2" class="animate-pulse" />
                      </div>
                      <p class="text-[12px] font-semibold text-slate-100 uppercase tracking-wider m-0">RSLDC Skill Training in Action</p>
                      <p class="text-[11px] text-slate-300 mt-1 mb-0">Scroll into view to play video</p>
                    </div>
                  }

                  <!-- Live / Official Top Floating Badge -->
                  <div class="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div class="video-top-pill">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>RSLDC Skill In Action</span>
                    </div>
                  </div>

                  <!-- Play / Pause Overlay Control (Top Left) -->
                  <div class="absolute top-3.5 left-3.5 z-20">
                    <button 
                      appButton
                      variant="ghost"
                      size="sm"
                      iconOnly
                      type="button"
                      class="video-ctrl-btn"
                      (click)="togglePlayPause()"
                      [attr.aria-label]="isPlaying() ? 'Pause video' : 'Play video'"
                      title="{{ isPlaying() ? 'Pause video' : 'Play video' }}">
                      @if (isPlaying()) {
                        <app-icon name="pause" size="sm" />
                      } @else {
                        <app-icon name="play" size="sm" class="translate-x-0.5" />
                      }
                    </button>
                  </div>

                  <!-- Sound Off / Sound On Toggle Control (Top Right) -->
                  <div class="absolute top-3.5 right-3.5 z-20">
                    <button 
                      appButton
                      variant="ghost"
                      size="sm"
                      type="button"
                      class="video-ctrl-btn sound-btn"
                      (click)="toggleSound()"
                      [attr.aria-label]="isMuted() ? 'Unmute video audio' : 'Mute video audio'"
                      title="{{ isMuted() ? 'Unmute video audio' : 'Mute video audio' }}">
                      @if (isMuted()) {
                        <app-icon name="volume-off" size="sm" class="text-[#F28C28]" />
                        <span>Sound Off</span>
                      } @else {
                        <app-icon name="volume-on" size="sm" class="text-emerald-400" />
                        <span>Sound On</span>
                      }
                    </button>
                  </div>

                  <!-- Video Caption Overlay with Top Shimmer Accent Line on Hover -->
                  <div class="video-caption-bar">
                    <div class="video-shimmer-line" aria-hidden="true"></div>
                    <p class="font-sans text-[12.5px] sm:text-[13.5px] text-white/95 leading-normal sm:leading-relaxed font-normal m-0 drop-shadow-xs">
                      “{{ fullQuote }}”
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  `,
  styles: [`
    .about-pillar-card {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 11px 13px;
      border-radius: 11px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .about-pillar-card:hover {
      transform: translateY(-2px);
      border-color: rgba(124, 14, 68, 0.3);
      background: #FFFDFE;
      box-shadow: 0 4px 14px rgba(124, 14, 68, 0.08);
    }
    .pillar-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.25s ease;
    }
    .pillar-icon-wrap.icon-primary { background: #F8EDF1; color: #7C0E44; }
    .about-pillar-card:hover .pillar-icon-wrap.icon-primary { background: #7C0E44; color: #FFFFFF; }
    .pillar-icon-wrap.icon-orange { background: #FFF7ED; color: #EA580C; }
    .about-pillar-card:hover .pillar-icon-wrap.icon-orange { background: #EA580C; color: #FFFFFF; }
    .pillar-icon-wrap.icon-blue { background: #F0F9FF; color: #0284C7; }
    .about-pillar-card:hover .pillar-icon-wrap.icon-blue { background: #0284C7; color: #FFFFFF; }
    .pillar-icon-wrap.icon-green { background: #F0FDF4; color: #16A34A; }
    .about-pillar-card:hover .pillar-icon-wrap.icon-green { background: #16A34A; color: #FFFFFF; }

    .pillar-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
      line-height: 1.3;
      transition: color 0.2s ease;
    }
    .about-pillar-card:hover .pillar-title {
      color: #7C0E44;
    }
    .pillar-desc {
      font-size: 11px;
      color: #64748B;
      line-height: 1.4;
      margin: 2px 0 0 0;
    }

    /* Video Card & Spectacular Hover Showcase */
    .video-showcase-wrapper {
      position: relative;
    }
    .video-ambient-glow {
      position: absolute;
      inset: -6px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(124, 14, 68, 0.28) 0%, rgba(234, 88, 12, 0.24) 50%, rgba(39, 108, 161, 0.2) 100%);
      filter: blur(18px);
      opacity: 0;
      transform: scale(0.97);
      transition: opacity 0.5s ease, transform 0.5s ease;
      pointer-events: none;
      z-index: 0;
    }
    .video-showcase-wrapper:hover .video-ambient-glow {
      opacity: 1;
      transform: scale(1.02);
    }
    .video-interactive-card {
      position: relative;
      z-index: 10;
      width: 100%;
      border-radius: 14px;
      overflow: hidden;
      background: #0B1528;
      border: 1.5px solid #EADCE2;
      box-shadow: 0 4px 20px -2px rgba(124, 14, 68, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04);
      transform: translateY(0);
      transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .video-showcase-wrapper:hover .video-interactive-card {
      transform: translateY(-5px);
      border-color: rgba(124, 14, 68, 0.45);
      box-shadow: 0 20px 40px -10px rgba(124, 14, 68, 0.22), 0 8px 16px -4px rgba(234, 88, 12, 0.12);
    }
    .video-media {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    }
    .video-showcase-wrapper:hover .video-media {
      transform: scale(1.03);
    }

    .video-top-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 11px;
      border-radius: 9999px;
      background: rgba(11, 21, 40, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #FFFFFF;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.03em;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }

    .video-ctrl-btn {
      background: rgba(11, 21, 40, 0.65) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      border: 1px solid rgba(255, 255, 255, 0.25) !important;
      color: #FFFFFF !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
      cursor: pointer !important;
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .video-ctrl-btn:hover {
      background: #7C0E44 !important;
      border-color: #EA580C !important;
      transform: scale(1.08) !important;
      box-shadow: 0 4px 12px rgba(124, 14, 68, 0.4) !important;
    }
    .video-ctrl-btn.sound-btn {
      padding: 0 10px !important;
      gap: 5px !important;
      font-size: 11px !important;
      font-weight: 600 !important;
    }

    .video-caption-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10;
      pointer-events: none;
      background: linear-gradient(180deg, transparent 0%, rgba(11, 21, 40, 0.72) 35%, rgba(11, 21, 40, 0.95) 100%);
      padding: 32px 18px 14px 18px;
    }
    .video-shimmer-line {
      position: absolute;
      top: 0;
      left: 0;
      height: 2px;
      width: 0%;
      background: linear-gradient(90deg, #EA580C 0%, #FE992B 50%, #7C0E44 100%);
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .video-showcase-wrapper:hover .video-shimmer-line {
      width: 100%;
    }
  `]
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
