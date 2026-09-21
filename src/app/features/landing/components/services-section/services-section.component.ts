import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ServiceStep {
  step: string;
  title: string;
  description: string;
  badge: string;
}

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <section id="services" class="py-14 bg-white border-b border-slate-200 scroll-mt-20">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Heading -->
        <div class="text-center max-w-3xl mx-auto mb-12">
          <span class="text-xs font-bold text-[#EA580C] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200/70">
            End-to-End Governance Pipeline
          </span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0B3558] mt-2.5 tracking-tight">
            How ISMS 2.0 Works
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5">
            A transparent four-stage digital workflow from training partner empanelment to candidate employment certification.
          </p>
        </div>

        <!-- 4 Step Flow -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          @for (step of steps; track step.step) {
            <div class="relative bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-[#0B3558]/40 hover:bg-white transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between">
              
              <div>
                <div class="flex items-center justify-between mb-4">
                  <span class="w-10 h-10 rounded-full bg-[#0B3558] text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                    {{ step.step }}
                  </span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0B3558] border border-blue-100">
                    {{ step.badge }}
                  </span>
                </div>

                <h3 class="text-base font-bold text-slate-800 leading-snug">
                  {{ step.title }}
                </h3>

                <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                  {{ step.description }}
                </p>
              </div>

              <div class="mt-6 pt-3 border-t border-slate-200/60 flex items-center text-xs font-semibold text-[#0B3558]">
                <span>Stage Details</span>
                <svg class="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          }
        </div>

        <!-- Single Window Clearance Box -->
        <div class="mt-10 p-6 rounded-xl bg-gradient-to-r from-blue-900 to-[#0B3558] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div class="space-y-1 text-center md:text-left">
            <h4 class="text-lg font-bold">Are you an accredited Training Partner or Industry Employer?</h4>
            <p class="text-xs text-blue-100 max-w-2xl">
              Register your organization on ISMS 2.0 to submit proposals for State Skill Programmes, track batch inspection schedules, and access automated DBT invoicing.
            </p>
          </div>
          <a
            href="#schemes"
            class="shrink-0 bg-[#EA580C] hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2.5 rounded-md shadow-xs transition-colors"
          >
            Register as Training Partner
          </a>
        </div>

      </div>
    </section>
  `
})
export class ServicesSectionComponent {
  steps: ServiceStep[] = [
    {
      step: '01',
      title: 'Online EOI Submission',
      description: 'Training organizations submit technical and financial proposals digitally with paperless document verification.',
      badge: 'Portal Phase'
    },
    {
      step: '02',
      title: 'Geotagged Inspection',
      description: 'Official department teams verify center infrastructure, CCTV feeds, and lab machinery with GPS-tagged inspection.',
      badge: 'Audit Phase'
    },
    {
      step: '03',
      title: 'Aadhaar Biometric Batches',
      description: 'Candidate enrollment verified via AEBAS biometric attendance with daily SMS logs to parents & candidates.',
      badge: 'Training Phase'
    },
    {
      step: '04',
      title: 'Assessment & Direct DBT',
      description: 'Independent third-party assessment leads to DigiLocker-verified certificates and automated DBT milestone funding.',
      badge: 'Certification'
    }
  ];
}
