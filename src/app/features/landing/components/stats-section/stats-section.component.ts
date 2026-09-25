import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatMetric {
  count: string;
  label: string;
  description: string;
  badge: string;
  iconBg: string;
  iconColor: string;
}

@Component({
  selector: 'app-stats-section',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="py-12 bg-white border-b border-slate-200">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Section Header -->
        <div class="text-center max-w-3xl mx-auto mb-10">
          <span class="text-xs font-bold text-[#EA580C] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200/60">
            Real-Time Governance Metrics
          </span>
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B3558] mt-2.5 tracking-tight font-sans">
            Impact Across Rajasthan
          </h2>
          <p class="text-sm sm:text-base text-slate-500 mt-1.5 mx-auto max-w-2xl text-justify hyphens-auto">
            Transparent reporting of candidate mobilization, training infrastructure, and scheme disbursements.
          </p>
        </div>

        <!-- 4 Column Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          @for (stat of stats; track stat.label) {
            <div class="p-6 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-[#0B3558]/30 transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold px-2 py-0.5 rounded {{ stat.badge }}">
                    Live Record
                  </span>
                  <div class="w-8 h-8 rounded-lg {{ stat.iconBg }} {{ stat.iconColor }} flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>

                <div class="text-3xl sm:text-4xl font-extrabold text-[#0B3558] tracking-tight">
                  {{ stat.count }}
                </div>
                <h3 class="text-sm font-bold text-slate-800 mt-1">
                  {{ stat.label }}
                </h3>
              </div>

              <p class="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200/60">
                {{ stat.description }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class StatsSectionComponent {
  stats: StatMetric[] = [
    {
      count: '50',
      label: 'Districts Covered',
      description: 'Comprehensive skill delivery spanning all districts of Rajasthan.',
      badge: 'bg-blue-50 text-[#0B3558]',
      iconBg: 'bg-blue-100',
      iconColor: 'text-[#0B3558]'
    },
    {
      count: '1,280+',
      label: 'Accredited Training Centers',
      description: 'Standardized infrastructure empanelled through biometric verification.',
      badge: 'bg-orange-50 text-[#EA580C]',
      iconBg: 'bg-orange-100',
      iconColor: 'text-[#EA580C]'
    },
    {
      count: '5,42,000+',
      label: 'Youth Trained & Certified',
      description: 'Industry-recognized NSQF certifications completed successfully.',
      badge: 'bg-emerald-50 text-emerald-800',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700'
    },
    {
      count: '₹248.5 Cr',
      label: 'Direct Scheme Benefits Disbursed',
      description: 'Aadhaar-linked DBT payouts to training partners and youth stipends.',
      badge: 'bg-indigo-50 text-indigo-800',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-700'
    }
  ];
}
