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
import { isPlatformBrowser } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-about-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    class: 'block w-full bg-white'
  },
  template: `
    <section #sectionRef class="w-full bg-white py-9 sm:py-12 md:py-16 xl:py-20 border-b border-[#EADCE2]" aria-labelledby="about-isms-heading">
      <div class="w-full max-w-360 mx-auto px-5 sm:px-8 xl:px-12 box-border">
        <div class="flex flex-col lg:grid lg:grid-cols-[55fr_45fr] items-center gap-6 md:gap-8 lg:gap-12 w-full">
          <!-- Left Column: About Content (~55% width) -->
          <div class="w-full flex flex-col justify-center text-left">
            <h2 id="about-isms-heading" class="font-sans text-[28px] sm:text-[32px] xl:text-[36px] font-bold leading-[1.2] text-[#7C0E44] m-0 tracking-tight">
              About ISMS <span class="text-[#EA580C]">2.0</span>
            </h2>

            <div class="w-10.5 h-1 bg-[#EA580C] rounded-xs mt-2.5 mb-4 sm:mb-4" aria-hidden="true"></div>

            <p class="font-sans text-[15px] xl:text-[16px] font-normal leading-[1.65] text-[#344256] text-left max-w-175 m-0 mb-4">
              Integrated Scheme Management System (ISMS 2.0) is a comprehensive e-Governance and Management Information System (MIS) designed to digitally transform, integrate, and streamline the processes involved in the planning, implementation, monitoring, and management of skill development schemes across Rajasthan. The platform provides a centralized and secure digital ecosystem that unites youth, training providers, government departments, empaneled agencies, and certification bodies on a single, high-transparency platform — ensuring accountability, real-time visibility, and data-driven decision making at every stage.
            </p>

            <p class="font-sans text-[15px] xl:text-[16px] font-normal leading-[1.65] text-[#344256] text-left max-w-175 m-0">
              ISMS 2.0 enables end-to-end scheme management — from scheme launching and candidate enrollment through bio-metric attendance, quality inspections, assessment, certification, and direct benefit and fund disbursements — all within one unified, auditable platform.
            </p>
          </div>

          <!-- Right Column: Auto-Playing Video Panel (~45% width, 16:9 Aspect Ratio, no overlay buttons) -->
          <div class="w-full flex items-center justify-center">
            <div class="w-full rounded-xl overflow-hidden bg-[#5E0832] border border-[#EADCE2] shadow-[0_4px_16px_rgba(124,14,68,0.08)] relative transform-[translateZ(0)] will-change-transform">
              <div class="relative w-full aspect-video bg-[#5E0832] overflow-hidden flex items-center justify-center">
                <video
                  #videoRef
                  src="/video.mp4"
                  class="w-full h-full object-cover object-center transition-opacity duration-300 transform-[translateZ(0)]"
                  [class.opacity-0]="!isVideoLoaded()"
                  [class.opacity-100]="isVideoLoaded()"
                  [muted]="true"
                  playsinline
                  loop
                  muted
                  autoplay
                  preload="auto"
                  (loadeddata)="onVideoReady()"
                  (canplay)="onVideoReady()"
                  aria-label="ISMS 2.0 Skill Development Overview Video"
                ></video>

                @if (!isVideoLoaded()) {
                  <div class="absolute inset-0 bg-linear-to-br from-[#5E0832] to-[#7C0E44] flex flex-col items-center justify-center p-5 text-center z-5">
                    <div class="w-11 h-11 rounded-full bg-white/12 flex items-center justify-center mb-2.5 text-white">
                      <app-icon name="play-circle" size="lg" [stroke]="2" class="animate-pulse" />
                    </div>
                    <p class="text-[12px] font-semibold text-slate-100 uppercase tracking-wider m-0">RSLDC Skill Training in Action</p>
                  </div>
                }

                <div class="absolute bottom-0 inset-x-0 z-10 pointer-events-none bg-linear-to-t from-[#3D0521]/95 via-[#3D0521]/65 to-transparent pt-7 pb-3.5 px-4 sm:pt-8 sm:pb-4 sm:px-4.5 box-border">
                  <p class="font-sans text-[13px] sm:text-[14px] lg:text-[14.5px] text-white leading-normal sm:leading-relaxed font-normal m-0 drop-shadow-sm">
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
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('sectionRef') sectionRef?: ElementRef<HTMLElement>;
  @ViewChild('videoRef') videoRef?: ElementRef<HTMLVideoElement>;

  readonly isVideoLoaded = signal(false);

  readonly fullQuote =
    'ISMS 2.0 is an integrated MIS system of RSLDC to provide a single platform to Youths, Training providers, Govt. Departments, Convergence Departments, and Certification agencies for Skill Development Schemes.';

  private observer?: IntersectionObserver;
  private isVisible = true;
  private visibilityHandler?: () => void;

  protected onVideoReady(): void {
    this.isVideoLoaded.set(true);
    if (this.isVisible) {
      this.playVideo();
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.sectionRef?.nativeElement;
    const video = this.videoRef?.nativeElement;
    if (!el || !video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;

    if (video.readyState >= 2) {
      this.isVideoLoaded.set(true);
    }
    this.playVideo();

    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            this.isVisible = entry.isIntersecting;
            if (entry.isIntersecting) {
              this.playVideo();
            } else {
              video.pause();
            }
          });
        },
        { rootMargin: '160px 0px', threshold: 0.05 }
      );
      this.observer.observe(el);
    }

    this.visibilityHandler = () => {
      if (document.hidden) {
        video.pause();
      } else if (this.isVisible) {
        this.playVideo();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private playVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.muted = true;
    video.play().then(() => this.isVideoLoaded.set(true)).catch(() => {});
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  }
}
