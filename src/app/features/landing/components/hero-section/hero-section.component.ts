import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
  ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeroTendersComponent } from '../hero-tenders/hero-tenders.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent, IconComponent } from '../../../../shared';

export interface HeroSlide {
  image: string;
  badge: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-hero-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeroTendersComponent, ButtonComponent, IconComponent],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="relative w-full bg-[#F8F9FA] py-4 sm:py-5 lg:py-6 border-b border-[#E2E8F0]">
      
      <!-- Inner Container: Full Width up to 1920px (Left Half: Image, Right Half: Tender) -->
      <div class="w-full max-w-[1920px] mx-auto px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-6 xl:gap-8 items-stretch w-full">
          
          <!-- LEFT HALF (50%): Premium Dynamic Auto-Sliding Image Showcase -->
          <div 
            class="w-full h-full flex flex-col justify-center"
            (mouseenter)="pauseAutoplay()"
            (mouseleave)="resumeAutoplay()"
            (touchstart)="pauseAutoplay()"
            (touchend)="resumeAutoplay()"
          >
            <div class="hero-slider-card">
              
              <!-- SLIDES -->
              @for (slide of slides; track slide.image; let i = $index) {
                <div 
                  class="slide-item"
                  [class.active]="currentSlideIndex() === i"
                  [attr.aria-hidden]="currentSlideIndex() !== i"
                >
                  <!-- Background Image -->
                  <img
                    [src]="slide.image"
                    [alt]="slide.title"
                    class="slide-img"
                    loading="eager"
                  />

                  <!-- Deep Dual Gradient Overlays (Ensures high contrast & readability) -->
                  <div class="slide-overlay-top" aria-hidden="true"></div>
                  <div class="slide-overlay-bottom" aria-hidden="true"></div>

                  <!-- TOP BAR: Badge & Slide Counter -->
                  <div class="slide-top-bar">
                    <div class="slide-badge">
                      <span class="slide-badge-dot"></span>
                      <span>{{ slide.badge }}</span>
                    </div>

                    <div class="slide-counter">
                      <span>0{{ i + 1 }}</span>
                      <span class="opacity-50">/</span>
                      <span class="opacity-75">0{{ slides.length }}</span>
                    </div>
                  </div>

                  <!-- BOTTOM CONTENT: Title & Subtitle -->
                  <div class="slide-bottom-content">
                    <h2 class="slide-title">
                      {{ slide.title }}
                    </h2>
                    <p class="slide-subtitle">
                      {{ slide.subtitle }}
                    </p>
                  </div>
                </div>
              }

              <!-- NAVIGATION ARROWS (Prev & Next) -->
              <!-- ui-guard-allow: hero slider navigation controls -->
              <button
                appButton
                variant="ghost"
                size="sm"
                iconOnly
                type="button"
                (click)="prevSlide($event)"
                class="slider-nav-btn prev"
                aria-label="Previous slide"
                title="Previous slide"
              >
                <app-icon name="chevron-left" />
              </button>

              <!-- ui-guard-allow: hero slider navigation controls -->
              <button
                appButton
                variant="ghost"
                size="sm"
                iconOnly
                type="button"
                (click)="nextSlide($event)"
                class="slider-nav-btn next"
                aria-label="Next slide"
                title="Next slide"
              >
                <app-icon name="chevron-right" />
              </button>

              <!-- BOTTOM SLIDE INDICATORS (Expanding Pill Dots) -->
              <div class="slider-indicators" aria-label="Slide navigation">
                @for (slide of slides; track slide.image; let i = $index) {
                  <!-- ui-guard-allow: hero slider dot indicator -->
                  <button
                    appButton
                    variant="ghost"
                    size="xs"
                    iconOnly
                    type="button"
                    (click)="goToSlide(i, $event)"
                    class="slider-dot-btn"
                    [class.active]="currentSlideIndex() === i"
                    [attr.aria-label]="'Go to slide ' + (i + 1)"
                    [attr.aria-current]="currentSlideIndex() === i ? 'true' : null"
                  >
                  </button>
                }
              </div>

            </div>
          </div>

          <!-- RIGHT HALF (50%): Official Government Tenders -->
          <div class="w-full h-full flex flex-col justify-center">
            <app-hero-tenders class="w-full h-full"></app-hero-tenders>
          </div>

        </div>
      </div>

    </section>
  `,
  styles: [`
    .hero-slider-card {
      position: relative;
      width: 100%;
      height: 410px;
      border-radius: 12px;
      overflow: hidden;
      background-color: #0f172a;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.04);
      user-select: none;
    }
    @media (min-width: 640px) {
      .hero-slider-card {
        height: 430px;
        border-radius: 14px;
      }
    }
    @media (min-width: 1024px) {
      .hero-slider-card {
        height: 440px;
      }
    }
    @media (min-width: 1280px) {
      .hero-slider-card {
        height: 450px;
      }
    }

    .slide-item {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      visibility: hidden;
      transform: scale(1.04);
      transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                  transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1),
                  visibility 0.8s;
      z-index: 1;
    }
    .slide-item.active {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
      z-index: 2;
    }

    .slide-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }

    .slide-overlay-top {
      position: absolute;
      inset: 0;
      bottom: 50%;
      background: linear-gradient(to bottom, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.15) 60%, transparent 100%);
      pointer-events: none;
    }

    .slide-overlay-bottom {
      position: absolute;
      inset: 0;
      top: 25%;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.68) 45%, rgba(0, 0, 0, 0.1) 85%, transparent 100%);
      pointer-events: none;
    }

    .slide-top-bar {
      position: absolute;
      top: 16px;
      left: 18px;
      right: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      z-index: 3;
    }

    .slide-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #FFFFFF;
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: 0.02em;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .slide-badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 9999px;
      background-color: #EA580C;
      box-shadow: 0 0 8px #EA580C;
      flex-shrink: 0;
    }

    .slide-counter {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.05em;
    }

    .slide-bottom-content {
      position: absolute;
      bottom: 22px;
      left: 20px;
      right: 20px;
      z-index: 3;
      padding-bottom: 20px;
    }
    @media (min-width: 640px) {
      .slide-bottom-content {
        left: 26px;
        right: 26px;
        bottom: 24px;
        padding-bottom: 22px;
      }
    }

    .slide-title {
      color: #FFFFFF;
      font-size: 20px;
      font-weight: 800;
      line-height: 1.25;
      letter-spacing: -0.015em;
      margin: 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    @media (min-width: 640px) {
      .slide-title {
        font-size: 23px;
      }
    }
    @media (min-width: 1024px) {
      .slide-title {
        font-size: 25px;
      }
    }

    .slide-subtitle {
      color: rgba(255, 255, 255, 0.88);
      font-size: 13px;
      font-weight: 400;
      line-height: 1.5;
      margin-top: 6px;
      margin-bottom: 0;
      max-width: 540px;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
    }
    @media (min-width: 640px) {
      .slide-subtitle {
        font-size: 13.5px;
        margin-top: 8px;
      }
    }

    .slider-nav-btn {
      position: absolute !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 38px !important;
      height: 38px !important;
      border-radius: 9999px !important;
      background: rgba(0, 0, 0, 0.45) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      border: 1px solid rgba(255, 255, 255, 0.28) !important;
      color: #FFFFFF !important;
      z-index: 10 !important;
      cursor: pointer !important;
      opacity: 0.7;
      transition: all 0.2s ease !important;
    }
    .hero-slider-card:hover .slider-nav-btn {
      opacity: 1;
    }
    .slider-nav-btn:hover {
      background: rgba(13, 53, 87, 0.9) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
      transform: translateY(-50%) scale(1.08) !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35) !important;
    }
    .slider-nav-btn.prev {
      left: 12px !important;
    }
    .slider-nav-btn.next {
      right: 12px !important;
    }

    .slider-indicators {
      position: absolute;
      bottom: 12px;
      left: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      z-index: 10;
    }
    @media (min-width: 640px) {
      .slider-indicators {
        left: 26px;
        bottom: 14px;
        gap: 7px;
      }
    }

    .slider-dot-btn {
      width: 8px !important;
      height: 6px !important;
      min-width: 8px !important;
      padding: 0 !important;
      border-radius: 4px !important;
      background: rgba(255, 255, 255, 0.45) !important;
      border: none !important;
      cursor: pointer !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .slider-dot-btn.active {
      width: 26px !important;
      background: #EA580C !important;
      box-shadow: 0 0 8px rgba(234, 88, 12, 0.6) !important;
    }
    .slider-dot-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.75) !important;
    }
  `]
})
export class HeroSectionComponent {
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);

  @ViewChild(HeroTendersComponent) heroTendersComponent?: HeroTendersComponent;

  readonly slides: readonly HeroSlide[] = [
    {
      image: '/center-photos/practical-training.jpg',
      badge: 'Kaushal Vikas Mission',
      title: 'Industry-Aligned Practical Training',
      subtitle: 'Hands-on technical workshops and placement-oriented vocational courses across Rajasthan'
    },
    {
      image: '/center-photos/computer-lab.jpg',
      badge: 'Digital Education',
      title: 'Modern Hi-Tech Computer Labs',
      subtitle: 'State-of-the-art computing facilities for advanced digital literacy and software trades'
    },
    {
      image: '/center-photos/center-building.jpg',
      badge: 'RSLDC Campuses',
      title: 'World-Class Skill Development Centers',
      subtitle: 'Certified, standardized skill institutes established across every district of Rajasthan'
    },
    {
      image: '/hero-bg.png',
      badge: 'Integrated Scheme Management',
      title: 'Empowering Youth, Building Futures',
      subtitle: 'Transparent biometric tracking, scheme assessments and sustainable employment opportunities'
    }
  ];

  readonly currentSlideIndex = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly autoplayInterval = 3500; // 3.5 seconds

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoplay();
      this.destroyRef.onDestroy(() => this.stopAutoplay());
    }
  }

  nextSlide(event?: Event): void {
    if (event) event.stopPropagation();
    this.currentSlideIndex.update(i => (i + 1) % this.slides.length);
  }

  prevSlide(event?: Event): void {
    if (event) event.stopPropagation();
    this.currentSlideIndex.update(i => (i - 1 + this.slides.length) % this.slides.length);
  }

  goToSlide(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.currentSlideIndex.set(index);
  }

  pauseAutoplay(): void {
    this.stopAutoplay();
  }

  resumeAutoplay(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoplay();
    }
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.timer = setInterval(() => {
      this.nextSlide();
    }, this.autoplayInterval);
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onLoginClick(): void {
    this.authService.triggerSsoRedirect();
  }

  onViewTendersClick(): void {
    if (this.heroTendersComponent) {
      this.heroTendersComponent.openModal();
    }
  }
}
