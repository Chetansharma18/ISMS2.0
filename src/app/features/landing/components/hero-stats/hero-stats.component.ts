import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconName } from '../../../../shared';

interface StatMetric {
  count: string;
  label: string;
  icon: IconName;
}

@Component({
  selector: 'app-hero-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div 
      class="hero-stats-card relative w-full overflow-hidden rounded-xl sm:rounded-[14px] lg:rounded-2xl border border-[#F3D9C9] bg-gradient-to-r from-[#FFF9F6] via-[#FFFFFF] to-[#FFF9F6] shadow-2xs hover:shadow-xs transition-all duration-300"
      aria-label="ISMS 2.0 Key Governance Metrics"
    >
      <!-- Left Authentic Heritage Palace Watermark Artwork -->
      <div class="watermark-left" aria-hidden="true">
        <img 
          src="/rajasthan-heritage-palace.png" 
          alt="" 
          class="w-full h-full object-contain object-bottom-left"
          loading="eager"
        />
      </div>

      <!-- Right Authentic Heritage Palace Watermark Artwork -->
      <div class="watermark-right" aria-hidden="true">
        <img 
          src="/rajasthan-heritage-palace.png" 
          alt="" 
          class="w-full h-full object-contain object-bottom-right"
          loading="eager"
        />
      </div>

      <!-- 4 Stat Metrics Grid -->
      <div class="relative z-10 grid grid-cols-2 lg:grid-cols-4 items-center py-2.5 sm:py-3 lg:py-2.5 px-4 sm:px-6 lg:px-8">
        @for (stat of stats; track stat.label; let i = $index; let last = $last) {
          <div 
            class="stat-metric-col group flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3 lg:gap-3.5 py-2 sm:py-2.5 lg:py-1.5 px-2 sm:px-3 lg:px-4 cursor-default select-none relative"
            [class.border-r]="!last"
            [class.border-[#F0D5C7]]="!last"
          >
            <!-- Outlined Burgundy Icon -->
            <div class="shrink-0 text-[#7C0E44] transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
              <app-icon [name]="stat.icon" size="auto" [stroke]="2" class="w-6 h-6 sm:w-7 sm:h-7 lg:w-7.5 lg:h-7.5 text-[#7C0E44]" />
            </div>

            <!-- Number & Label Stack -->
            <div class="flex flex-col min-w-0">
              <span class="text-[16px] sm:text-[18px] lg:text-[19.5px] xl:text-[21px] font-black text-[#7C0E44] tracking-tight leading-none tabular-nums group-hover:text-[#5E0832] transition-colors">
                {{ stat.count }}
              </span>
              <span class="text-[11px] sm:text-[11.5px] lg:text-[12px] font-medium text-slate-700 leading-tight mt-1 truncate">
                {{ stat.label }}
              </span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .hero-stats-card {
      user-select: none;
    }
    .hero-stats-card:hover {
      border-color: rgba(124, 14, 68, 0.28);
      box-shadow: 0 8px 24px -3px rgba(124, 14, 68, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04);
    }

    .watermark-left {
      position: absolute;
      bottom: -4px;
      left: -6px;
      width: 130px;
      height: 55px;
      pointer-events: none;
      opacity: 0.18;
      overflow: hidden;
      transition: opacity 0.3s ease;
    }
    .watermark-right {
      position: absolute;
      bottom: -4px;
      right: -6px;
      width: 130px;
      height: 55px;
      pointer-events: none;
      opacity: 0.18;
      overflow: hidden;
      transition: opacity 0.3s ease;
    }
    .hero-stats-card:hover .watermark-left,
    .hero-stats-card:hover .watermark-right {
      opacity: 0.26;
    }

    @media (min-width: 640px) {
      .watermark-left,
      .watermark-right {
        width: 160px;
        height: 65px;
      }
    }

    @media (max-width: 1023px) {
      .stat-metric-col:nth-child(2) {
        border-right: none !important;
      }
      .stat-metric-col:nth-child(1),
      .stat-metric-col:nth-child(2) {
        border-bottom: 1px solid rgba(240, 213, 199, 0.7);
        padding-bottom: 6px;
      }
      .stat-metric-col:nth-child(3),
      .stat-metric-col:nth-child(4) {
        padding-top: 6px;
      }
    }
  `]
})
export class HeroStatsComponent {
  readonly stats: readonly StatMetric[] = [
    {
      count: '10.20 Lakh+',
      label: 'Youth Registered',
      icon: 'users'
    },
    {
      count: '6.85 Lakh+',
      label: 'Youth Trained',
      icon: 'graduation-cap'
    },
    {
      count: '4.12 Lakh+',
      label: 'Youth Placed',
      icon: 'briefcase'
    },
    {
      count: '1,280+',
      label: 'Training Partners',
      icon: 'building'
    }
  ];
}

