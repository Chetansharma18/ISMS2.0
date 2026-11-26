import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { HeroTendersComponent } from '../hero-tenders/hero-tenders.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroTendersComponent, ButtonComponent, IconComponent],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="relative w-full overflow-hidden flex items-center min-h-120 sm:min-h-125 lg:min-h-130">
      <!-- Authentic Panoramic Rajasthan Heritage Architecture Background -->
      <img
        src="/raj.png"
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        decoding="async"
        class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
      />

      <!-- Centered Inner Container (Max-Width ~1440px) -->
      <div class="max-w-360 mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14 relative">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12 xl:gap-14 w-full">
          <!-- LEFT COLUMN (~55% width on desktop) -->
          <div class="w-full lg:w-[55%] text-left flex flex-col justify-center">
            <h1 class="hero-title font-bold text-white tracking-tight leading-[1.14] drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              Integrated Scheme Management System
            </h1>

            <div class="w-10.5 h-[3.5px] bg-[#EA580C] rounded-full my-4 shadow-sm" aria-hidden="true"></div>

            <p class="hero-desc font-normal text-white leading-[1.6] drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              A unified, transparent digital ecosystem empowering skill development schemes, training operations, biometric verification, assessments, certifications, and sustainable placements across Rajasthan.
            </p>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 mt-6 sm:mt-8">
              <button appButton size="lg" type="button" (click)="onLoginClick()" aria-label="Login to Portal">
                <span>Login to Portal</span>
                <app-icon name="forward" />
              </button>

              <button
                appButton
                variant="outline"
                size="lg"
                type="button"
                (click)="onViewTendersClick()"
                aria-label="View Tenders"
              >
                <span>View Tenders</span>
                <app-icon name="forward" />
              </button>
            </div>
          </div>

          <!-- RIGHT COLUMN (~45% width on desktop) -->
          <div class="w-full lg:w-[45%] flex justify-center lg:justify-end">
            <app-hero-tenders class="w-full"></app-hero-tenders>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-title {
      font-family: var(--font-sans, 'Inter', sans-serif);
      font-size: 24px;
      max-width: 650px;
    }
    @media (min-width: 480px) {
      .hero-title {
        font-size: 30px;
      }
    }
    @media (min-width: 640px) {
      .hero-title {
        font-size: 38px;
      }
    }
    @media (min-width: 1024px) {
      .hero-title {
        font-size: 46px;
      }
    }
    @media (min-width: 1280px) {
      .hero-title {
        font-size: 48px;
      }
    }

    .hero-desc {
      font-family: var(--font-sans, 'Inter', sans-serif);
      font-size: 15px;
      max-width: 620px;
    }
    @media (min-width: 640px) {
      .hero-desc {
        font-size: 16px;
      }
    }
    @media (min-width: 1024px) {
      .hero-desc {
        font-size: 17px;
      }
    }
  `]
})
export class HeroSectionComponent {
  private readonly authService = inject(AuthService);

  @ViewChild(HeroTendersComponent) heroTendersComponent?: HeroTendersComponent;

  onLoginClick(): void {
    this.authService.triggerSsoRedirect();
  }

  onViewTendersClick(): void {
    this.heroTendersComponent?.openModal();
  }
}
