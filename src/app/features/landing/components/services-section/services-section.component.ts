import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { IconName } from '../../../../shared/components/icon/icons';

interface MobileAppFeature {
  label: string;
  icon?: IconName;
  badgeText?: string;
}

interface MobileAppStat {
  value: string;
  label: string;
  star?: boolean;
}

@Component({
  selector: 'app-services-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="relative w-full py-12 sm:py-16 md:py-20 xl:py-24 border-b border-[#EADCE2] bg-white overflow-hidden" aria-labelledby="mobile-app-heading">
      <!-- Panoramic Rajasthan Landscape Heritage Background Layer -->
      <div class="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/service-background.png"
          alt="Rajasthan Heritage Landscape & Lake Palace"
          aria-hidden="true"
          class="w-full h-full object-cover object-bottom"
          loading="lazy"
          onerror="this.src='/Service%20background.png'"
        />
        <div class="absolute inset-0 bg-white/80 sm:bg-transparent sm:bg-linear-to-r sm:from-white/35 sm:via-white/72 sm:to-white/35"></div>
        <div class="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent via-white/80 to-white"></div>
      </div>

      <div class="relative z-10 w-full max-w-350 xl:max-w-360 mx-auto px-5 sm:px-8 xl:px-12 box-border">
        <div class="flex flex-col lg:grid lg:grid-cols-[38fr_62fr] items-center gap-10 sm:gap-12 lg:gap-14 xl:gap-16 w-full">
          <!-- Column 1: Phone Mockup -->
          <div class="w-full flex items-center justify-center order-1 lg:justify-end">
            <img
              src="/mobile-app-phone.png"
              alt="ISMS 2.0 Mobile Application Mockup"
              class="w-full max-w-52.5 sm:max-w-60 md:max-w-65 lg:max-w-70 xl:max-w-72.5 h-auto object-contain drop-shadow-[0_16px_36px_rgba(11,36,64,0.18)] select-none pointer-events-none transition-transform duration-300 hover:scale-[1.01]"
              loading="lazy"
              onerror="this.src='/hero-bg.png'"
            />
          </div>

          <!-- Column 2: Content Area -->
          <div class="w-full flex flex-col justify-center text-left order-2">
            <div class="mb-4 sm:mb-5">
              <h2 id="mobile-app-heading" class="font-sans text-[28px] sm:text-[32px] lg:text-[36px] font-bold leading-[1.2] text-[#7C0E44] tracking-tight m-0">
                ISMS <span class="text-[#EA580C]">2.0</span> Mobile Application
              </h2>
              <div class="w-10.5 h-0.75 bg-[#EA580C] rounded-xs mt-2.5 mb-4" aria-hidden="true"></div>
            </div>

            <p class="font-sans text-[15px] sm:text-[16px] font-normal leading-[1.6] text-[#344256] max-w-155 m-0 mb-6 sm:mb-7 text-left">
              An integrated, multilingual mobile application providing instantaneous access to scheme notifications, biometric attendance, training center verifications, and grievances.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 mb-6 sm:mb-8 max-w-155">
              @for (feature of features; track feature.label) {
                <div class="flex items-center gap-3 bg-white/95 border border-[#EADCE2] rounded-[10px] px-3.5 py-2.5 shadow-[0_2px_8px_rgba(124,14,68,0.04)]">
                  <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#F8EDF1] flex items-center justify-center text-[#7C0E44] shrink-0 font-bold text-[13px] font-sans">
                    @if (feature.icon) {
                      <app-icon [name]="feature.icon" size="lg" [stroke]="1.8" class="text-[#7C0E44]" />
                    } @else {
                      {{ feature.badgeText }}
                    }
                  </div>
                  <span class="font-sans text-[14px] sm:text-[14.5px] font-semibold text-[#25212A] leading-snug">
                    {{ feature.label }}
                  </span>
                </div>
              }
            </div>

            <div class="w-full max-w-155 bg-white/96 border border-[#EADCE2] rounded-xl shadow-[0_8px_24px_rgba(124,14,68,0.06)] p-4 sm:p-5 lg:p-6 box-border">
              <div class="grid grid-cols-3 divide-x divide-[#EADCE2] text-center">
                @for (stat of stats; track stat.label) {
                  <div class="px-1.5 sm:px-4 flex flex-col items-center justify-center">
                    <div class="font-sans text-[22px] sm:text-[32px] lg:text-[40px] font-bold text-[#7C0E44] leading-none tabular-nums tracking-tight flex items-center justify-center gap-0.5 sm:gap-1">
                      <span>{{ stat.value }}</span>
                      @if (stat.star) {
                        <span class="text-[#EA580C] text-[16px] sm:text-[22px] lg:text-[26px] leading-none -mt-0.5" aria-hidden="true">★</span>
                      }
                    </div>
                    <div class="font-sans text-[11px] sm:text-[14px] lg:text-[15px] font-normal text-[#5F5268] mt-1.5 sm:mt-2">
                      {{ stat.label }}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ServicesSectionComponent {
  protected readonly features: readonly MobileAppFeature[] = [
    { label: 'For Multiple Stakeholders', icon: 'stakeholders' },
    { label: 'In English & Hindi', badgeText: 'A / अ' },
    { label: 'Secure & Role Based Access', icon: 'shield-tick' }
  ];

  protected readonly stats: readonly MobileAppStat[] = [
    { value: '1K+', label: 'Downloads' },
    { value: '4.8', label: 'User Rating', star: true },
    { value: '200+', label: 'Active Users' }
  ];
}
