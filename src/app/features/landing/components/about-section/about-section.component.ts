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
import { ButtonComponent, IconComponent, type IconName } from '../../../../shared';


export interface AboutStatCard {
  readonly label: string;
  readonly count: string;
  readonly icon: IconName;
  readonly bgImage: string;
  readonly waveSrc: string;
  readonly cardClass: string;
  readonly iconBoxClass: string;
  readonly iconColorClass: string;
  readonly dividerClass: string;
  readonly textColorClass: string;
}

@Component({
  selector: 'app-about-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonComponent, IconComponent],
  host: {
    class: 'block w-full bg-white'
  },
  template: `
    <!-- Section Wrapper: Plain white background framed with traditional Rajasthani decorative border strips -->
    <section #sectionRef class="w-full bg-white border-b border-[#DCE4ED] flex flex-col justify-between" aria-labelledby="about-isms-heading">
      
      <!-- Top Traditional Rajasthani Decorative Border Pattern Strip (Edge-to-Edge) -->
      <div 
        class="w-full h-3 sm:h-3.5 bg-repeat-x pointer-events-none select-none shrink-0" 
        style="background-image: url('/rajasthan-border-pattern.png'); background-size: auto 100%;" 
        aria-hidden="true">
      </div>

      <!-- Centered Container: Max width 1440px with responsive padding (20px mobile) -->
      <div class="w-full max-w-360 mx-auto px-5 sm:px-8 xl:px-12 py-8 sm:py-12 md:py-16 xl:py-20 box-border grow flex flex-col justify-center">
        
        <!-- Two-Column Layout: Stacks on mobile, ~55% left & ~45% right on desktop with 40–48px gap, vertically centered -->
        <div class="flex flex-col lg:grid lg:grid-cols-[55fr_45fr] items-center gap-6 md:gap-8 lg:gap-12 w-full">

          <!-- Left Column: About Content (~55% width) -->
          <div class="w-full flex flex-col justify-center text-left">
            
            <!-- Section Heading: Inter 700, 36px Desktop / 32px Tablet / 28px Mobile, #D73389 -->
            <h2 id="about-isms-heading" class="font-sans text-[28px] sm:text-[32px] xl:text-[36px] font-bold leading-[1.2] text-[#D73389] m-0 tracking-tight">
              About ISMS <span class="text-[#EA580C]">2.0</span>
            </h2>

            <!-- Small Orange Underline: 42px width, 4px height, #EA580C, 2px radius, 14–16px bottom spacing -->
            <div class="w-10.5 h-1 bg-[#EA580C] rounded-xs mt-2.5 mb-4 sm:mb-4" aria-hidden="true"></div>

            <!-- Existing Description Paragraph 1: 100% original text, natural wrapping, left-aligned -->
            <p class="font-sans text-[15px] xl:text-[16px] font-normal leading-[1.65] text-[#344256] text-left max-w-175 m-0 mb-4">
              Integrated Scheme Management System (ISMS 2.0) is a comprehensive e-Governance and Management Information System (MIS) designed to digitally transform, integrate, and streamline the processes involved in the planning, implementation, monitoring, and management of skill development schemes across Rajasthan. The platform provides a centralized and secure digital ecosystem that unites youth, training providers, government departments, empaneled agencies, and certification bodies on a single, high-transparency platform — ensuring accountability, real-time visibility, and data-driven decision making at every stage.
            </p>

            <!-- Existing Description Paragraph 2: Divided at natural sentence boundary, 100% original text -->
            <p class="font-sans text-[15px] xl:text-[16px] font-normal leading-[1.65] text-[#344256] text-left max-w-175 m-0">
              ISMS 2.0 enables end-to-end scheme management — from scheme launching and candidate enrollment through bio-metric attendance, quality inspections, assessment, certification, and direct benefit and fund disbursements — all within one unified, auditable platform.
            </p>
          </div>

          <!-- Right Column: Video Panel (~45% width, 16:9 Aspect Ratio) -->
          <div class="w-full flex items-center justify-center">
            
            <!-- Video Container Card: 16:9, rounded 12px, border 1px solid #EADCE2, subtle shadow -->
            <div class="w-full rounded-xl overflow-hidden bg-[#B82470] border border-[#EADCE2] shadow-[0_4px_16px_rgba(215,51,137,0.08)] relative transform-[translateZ(0)] will-change-transform">
              
              <div class="relative w-full aspect-video bg-[#B82470] overflow-hidden flex items-center justify-center">
                
                <!-- Actual Video Element -->
                <video 
                  #videoRef
                  src="/video.mp4"
                  class="w-full h-full object-cover object-center"
                  autoplay
                  loop
                  muted
                  playsinline
                  preload="auto"
                  (play)="isPlaying.set(true)"
                  (pause)="isPlaying.set(false)"
                  aria-label="ISMS 2.0 Skill Development Overview Video">
                </video>

                <!-- Play / Pause Overlay Control (Top Left) -->
                <div class="absolute top-3 left-3 z-20">
                  <button 
                    appButton
                    variant="secondary"
                    size="sm"
                    iconOnly
                    type="button"
                    (click)="togglePlayPause()"
                    [attr.aria-label]="isPlaying() ? 'Pause video' : 'Play video'"
                    title="{{ isPlaying() ? 'Pause video' : 'Play video' }}">
                    @if (isPlaying()) {
                      <app-icon name="pause" solid size="sm" />
                    } @else {
                      <app-icon name="play" solid size="sm" class="translate-x-0.5" />
                    }
                  </button>
                </div>

                <!-- Sound Off / Sound On Toggle Control (Top Right) -->
                <div class="absolute top-3 right-3 z-20">
                  <button 
                    appButton
                    variant="secondary"
                    size="sm"
                    type="button"
                    (click)="toggleSound()"
                    [attr.aria-label]="isMuted() ? 'Unmute video audio' : 'Mute video audio'"
                    title="{{ isMuted() ? 'Unmute video audio' : 'Mute video audio' }}">
                    @if (isMuted()) {
                      <app-icon name="volume-off" size="sm" [stroke]="2" class="text-[#F28C28]" />
                      <span>Sound Off</span>
                    } @else {
                      <app-icon name="volume-on" size="sm" [stroke]="2" class="text-emerald-400" />
                      <span>Sound On</span>
                    }
                  </button>
                </div>

                <!-- Video Caption Overlay (Positioned in lower portion, subtle dark navy gradient, 14–18px padding) -->
                <div class="absolute bottom-0 inset-x-0 z-10 pointer-events-none bg-linear-to-t from-[#0B2440]/95 via-[#0B2440]/65 to-transparent pt-7 pb-3.5 px-4 sm:pt-8 sm:pb-4 sm:px-4.5 box-border">
                  <p class="font-sans text-[13px] sm:text-[14px] lg:text-[14.5px] text-white leading-normal sm:leading-relaxed font-normal m-0 drop-shadow-sm">
                    “{{ fullQuote }}”
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>

        <!-- Four Key Metrics Governance Cards Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-8 sm:mt-10 lg:mt-12 w-full">
          @for (card of statCards; track card.label) {
            <div 
              class="relative overflow-hidden rounded-2xl flex items-center px-4 py-3.5 sm:px-5 sm:py-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 select-none"
              [ngClass]="card.cardClass"
            >
              <!-- Background Thematic Watermark Artwork -->
              <img 
                [src]="card.bgImage" 
                alt="" 
                class="absolute inset-0 w-full h-full object-cover object-right pointer-events-none select-none opacity-85 z-0" 
                aria-hidden="true"
              />

              <!-- Circular Icon Container -->
              <div 
                class="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center shrink-0 z-10"
                [ngClass]="card.iconBoxClass"
              >
                <app-icon [name]="card.icon" size="lg" [ngClass]="card.iconColorClass" />
              </div>

              <!-- Vertical Divider -->
              <div class="w-px h-9 sm:h-10 mx-3.5 sm:mx-4 shrink-0 z-10" [ngClass]="card.dividerClass"></div>

              <!-- Label & Count Stack -->
              <div class="flex flex-col min-w-0 z-10">
                <span class="text-[13px] sm:text-[13.5px] font-bold leading-none tracking-tight mb-1" [ngClass]="card.textColorClass">
                  {{ card.label }}
                </span>
                <span class="text-[26px] sm:text-[28px] lg:text-[30px] font-black leading-tight tracking-tight tabular-nums" [ngClass]="card.textColorClass">
                  {{ card.count }}
                </span>
              </div>

              <!-- Bottom Organic Wave Artwork -->
              <img 
                [src]="card.waveSrc" 
                alt="" 
                class="absolute bottom-0 inset-x-0 w-full h-4 sm:h-5 object-cover object-bottom pointer-events-none select-none opacity-60 z-0" 
                aria-hidden="true"
              />
            </div>
          }
        </div>

      </div>

      <!-- Bottom Traditional Rajasthani Decorative Border Pattern Strip (Edge-to-Edge) -->
      <div 
        class="w-full h-3 sm:h-3.5 bg-repeat-x pointer-events-none select-none shrink-0" 
        style="background-image: url('/rajasthan-border-pattern.png'); background-size: auto 100%;" 
        aria-hidden="true">
      </div>

    </section>
  `
})
export class AboutSectionComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @ViewChild('sectionRef') sectionRef?: ElementRef<HTMLElement>;
  @ViewChild('videoRef') videoRef?: ElementRef<HTMLVideoElement>;

  readonly statCards: readonly AboutStatCard[] = [
    {
      label: 'Schemes',
      count: '18',
      icon: 'layers',
      bgImage: '/card-bg-schemes.png',
      waveSrc: '/stat-wave-pink.png',
      cardClass: 'bg-white hover:bg-[#FFFDFE] border border-[#F5E1EB] hover:border-[#D73389]/40 shadow-xs hover:shadow-md',
      iconBoxClass: 'bg-[#FFF5F8] border border-[#F8D5E3]',
      iconColorClass: 'text-[#9F1239]',
      dividerClass: 'bg-[#F3D5E2]',
      textColorClass: 'text-[#9F1239]'
    },
    {
      label: 'Courses',
      count: '425',
      icon: 'graduation-cap',
      bgImage: '/card-bg-courses.png',
      waveSrc: '/stat-wave-blue.png',
      cardClass: 'bg-white hover:bg-[#FBFDFF] border border-[#E0E7FF] hover:border-[#224599]/40 shadow-xs hover:shadow-md',
      iconBoxClass: 'bg-[#F0F7FF] border border-[#BFDBFE]',
      iconColorClass: 'text-[#224599]',
      dividerClass: 'bg-[#BFDBFE]',
      textColorClass: 'text-[#224599]'
    },
    {
      label: 'Training Partners',
      count: '1,280',
      icon: 'school',
      bgImage: '/card-bg-training-partners.png',
      waveSrc: '/stat-wave-green.png',
      cardClass: 'bg-white hover:bg-[#FBFFFD] border border-[#DCFCE7] hover:border-[#05831F]/40 shadow-xs hover:shadow-md',
      iconBoxClass: 'bg-[#F0FDF4] border border-[#BBF7D0]',
      iconColorClass: 'text-[#05831F]',
      dividerClass: 'bg-[#BBF7D0]',
      textColorClass: 'text-[#05831F]'
    },
    {
      label: 'Users',
      count: '25,640',
      icon: 'users',
      bgImage: '/card-bg-users.png',
      waveSrc: '/stat-wave-purple.png',
      cardClass: 'bg-white hover:bg-[#FDFBFF] border border-[#EDE9FE] hover:border-[#6B21A8]/40 shadow-xs hover:shadow-md',
      iconBoxClass: 'bg-[#FAF5FF] border border-[#DDD6FE]',
      iconColorClass: 'text-[#6B21A8]',
      dividerClass: 'bg-[#DDD6FE]',
      textColorClass: 'text-[#6B21A8]'
    }
  ];

  readonly isPlaying = signal<boolean>(true);
  readonly isMuted = signal<boolean>(true); // Strictly sound off by default

  readonly fullQuote = 'ISMS 2.0 is an integrated MIS system of RSLDC to provide a single platform to Youths, Training providers, Govt. Departments, Convergence Departments, and Certification agencies for Skill Development Schemes.';

  private visibilityHandler?: () => void;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const video = this.videoRef?.nativeElement;
    if (!video) return;

    // Ensure audio starts muted
    video.muted = true;
    video.volume = 0;
    this.isMuted.set(true);

    // Auto-play muted video directly
    video.play().then(() => {
      this.isPlaying.set(true);
    }).catch(() => {
      this.isPlaying.set(false);
    });

    // Page visibility listener: pause when browser tab is inactive
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.pauseVideo();
      } else {
        this.playVideo();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
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
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
    }
  }
}
