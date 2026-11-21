import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroTendersComponent } from '../hero-tenders/hero-tenders.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent, IconComponent } from '../../../../shared';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeroTendersComponent, ButtonComponent, IconComponent],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="hero-main-section relative w-full overflow-hidden flex items-center border-b border-[#E2E8F0]">
      
      <!-- High-Definition Authentic Rajasthan Panoramic Desert & Fort Background -->
      <div class="absolute inset-0 w-full h-full pointer-events-none select-none z-0" aria-hidden="true">
        <img
          src="/hero-rajasthan-desert-2k.jpg"
          alt=""
          class="hero-bg-img"
          loading="eager"
        />
        <!-- Ambient Left Gradient: Ensures 100% crisp text readability while preserving full vibrant desert artwork -->
        <div class="hero-bg-overlay" aria-hidden="true"></div>
      </div>

      <!-- Inner Content Container: 100% responsive, centered, max-w-[1920px] -->
      <div class="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-8 sm:py-10 md:py-12 lg:py-14 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center w-full">
          
          <!-- LEFT COLUMN (7 Cols on lg, ~58% width): Official Headline, Subtitle & Action Buttons -->
          <div class="lg:col-span-7 flex flex-col justify-center text-left">
            
            <!-- Small Orange Accent Pill Bar -->
            <div class="w-12 h-1.5 bg-[#EA580C] rounded-full mb-3 sm:mb-3.5" aria-hidden="true"></div>

            <!-- Eyebrow Subtitle -->
            <p class="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-semibold text-slate-800 tracking-wide m-0">
              Integrated Scheme Management System
            </p>

            <!-- Main Hero Heading -->
            <h1 class="hero-main-title font-black tracking-tight leading-[1.12] text-[#0B3558] mt-2 sm:mt-3 mb-0">
              Empowering Youth,<br />
              Building <span class="text-[#7C0E44]">Skilled Rajasthan</span>
            </h1>

            <!-- Supporting Description -->
            <p class="hero-main-desc text-slate-700 font-normal leading-relaxed max-w-xl mt-3.5 sm:mt-4.5 mb-0">
              A unified digital platform for planning, implementation, monitoring and management of skill development schemes across Rajasthan.
            </p>

            <!-- CTA Action Buttons -->
            <div class="flex flex-wrap items-center gap-3.5 sm:gap-4 mt-6 sm:mt-8">
              
              <!-- Primary Action: Login to Portal -->
              <button
                appButton
                size="lg"
                type="button"
                (click)="onLoginClick()"
                
                aria-label="Login to Portal"
              >
                <app-icon name="user" />
                <span>Login to Portal</span>
                <app-icon name="arrow-right" />
              </button>

              <!-- Secondary Action: Explore Schemes -->
              <button
                appButton
                variant="outline"
                size="lg"
                type="button"
                (click)="onExploreSchemesClick()"
                
                aria-label="Explore Schemes"
              >
                <app-icon name="squares-grid" />
                <span>Explore Schemes</span>
              </button>

            </div>

          </div>

          <!-- RIGHT COLUMN (5 Cols on lg, ~42% width): Official Tender Notices Card -->
          <div class="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <app-hero-tenders class="w-full max-w-[560px]"></app-hero-tenders>
          </div>

        </div>
      </div>

    </section>
  `,
  styles: [`
    .hero-main-section {
      min-height: auto;
      background-color: #F8F9FA;
    }
    @media (min-width: 768px) {
      .hero-main-section {
        min-height: calc(100vh - 124px);
        min-height: calc(100dvh - 124px);
      }
    }
    @media (min-width: 1024px) {
      .hero-main-section {
        min-height: calc(100vh - 130px);
        min-height: calc(100dvh - 130px);
      }
    }

    .hero-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center bottom;
    }

    .hero-bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.88) 0%,
        rgba(255, 255, 255, 0.75) 35%,
        rgba(255, 255, 255, 0.35) 60%,
        rgba(255, 255, 255, 0.05) 100%
      );
    }
    @media (max-width: 1023px) {
      .hero-bg-overlay {
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.90) 0%,
          rgba(255, 255, 255, 0.78) 55%,
          rgba(255, 255, 255, 0.55) 100%
        );
      }
    }

    .hero-main-title {
      font-size: 28px;
    }
    @media (min-width: 480px) {
      .hero-main-title {
        font-size: 34px;
      }
    }
    @media (min-width: 640px) {
      .hero-main-title {
        font-size: 40px;
      }
    }
    @media (min-width: 1024px) {
      .hero-main-title {
        font-size: 44px;
      }
    }
    @media (min-width: 1280px) {
      .hero-main-title {
        font-size: 50px;
      }
    }

    .hero-main-desc {
      font-size: 14px;
    }
    @media (min-width: 640px) {
      .hero-main-desc {
        font-size: 15px;
      }
    }
    @media (min-width: 1024px) {
      .hero-main-desc {
        font-size: 16px;
      }
    }
  `]
})
export class HeroSectionComponent {
  private authService = inject(AuthService);

  @ViewChild(HeroTendersComponent) heroTendersComponent?: HeroTendersComponent;

  onLoginClick(): void {
    this.authService.triggerSsoRedirect();
  }

  onExploreSchemesClick(): void {
    if (this.heroTendersComponent) {
      this.heroTendersComponent.openModal();
    }
  }
}
