import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SchemeCard {
  id: string;
  name: string;
  code: string;
  department: string;
  eligibility: string;
  targetGroup: string;
  status: 'Open for EOI' | 'Active Batches' | 'Ongoing';
  statusColor: string;
  highlight: string;
}

@Component({
  selector: 'app-schemes-section',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <section id="schemes" class="py-14 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span class="text-xs font-bold text-[#0B3558] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/70">
              State & Central Flagship Programmes
            </span>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B3558] mt-2 tracking-tight font-sans">
              Active Government Schemes
            </h2>
            <p class="text-sm sm:text-base text-slate-500 mt-1 max-w-2xl text-justify hyphens-auto">
              Empanelling Training Partners and offering funded NSQF-aligned courses to Rajasthan youth.
            </p>
          </div>

          <div class="shrink-0 flex items-center gap-2">
            <span class="text-xs text-slate-500 font-medium">Filter:</span>
            <span class="text-xs font-semibold px-2.5 py-1 rounded bg-[#0B3558] text-white">All Schemes (4)</span>
          </div>
        </div>

        <!-- Scheme Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (scheme of schemes; track scheme.id) {
            <div class="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
              <div class="p-6">
                <!-- Status Badge & Code -->
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="font-mono text-[11px] font-bold text-slate-400">
                    {{ scheme.code }}
                  </span>
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded {{ scheme.statusColor }}">
                    {{ scheme.status }}
                  </span>
                </div>

                <h3 class="text-base font-bold text-[#0B3558] leading-snug min-h-[44px]">
                  {{ scheme.name }}
                </h3>

                <p class="text-xs font-medium text-slate-400 mt-1">
                  {{ scheme.department }}
                </p>

                <div class="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div class="flex items-start justify-between">
                    <span class="text-slate-500">Eligibility:</span>
                    <span class="font-semibold text-slate-800 text-right">{{ scheme.eligibility }}</span>
                  </div>
                  <div class="flex items-start justify-between">
                    <span class="text-slate-500">Focus Group:</span>
                    <span class="font-semibold text-slate-800 text-right">{{ scheme.targetGroup }}</span>
                  </div>
                </div>

                <div class="mt-4 p-2.5 rounded-lg bg-orange-50/60 border border-orange-100 text-[11px] text-[#EA580C] font-medium flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ scheme.highlight }}</span>
                </div>
              </div>

              <!-- Footer CTA -->
              <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  class="text-xs font-bold text-[#0B3558] hover:text-[#07233B] hover:underline"
                >
                  Guidelines (PDF)
                </button>

                <button
                  type="button"
                  class="text-xs font-bold bg-[#0B3558] hover:bg-[#07233B] text-white px-3 py-1.5 rounded transition-colors shadow-2xs"
                >
                  Apply EOI
                </button>
              </div>
            </div>
          }
        </div>

      </div>
    </section>
  `
})
export class SchemesSectionComponent {
  schemes: SchemeCard[] = [
    {
      id: 'elstp',
      name: 'Employment Linked Skill Training (ELSTP)',
      code: 'RSLDC-ELSTP-01',
      department: 'RSLDC State Component',
      eligibility: '10th / 12th Pass (Age 18-35)',
      targetGroup: 'Unemployed Youth of Rajasthan',
      status: 'Open for EOI',
      statusColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      highlight: 'Mandatory 70% wage employment placement'
    },
    {
      id: 'pmkvy',
      name: 'PM Kaushal Vikas Yojana (PMKVY 4.0)',
      code: 'MSDE-PMKVY-04',
      department: 'Govt of India & RSLDC',
      eligibility: 'School/College Dropouts',
      targetGroup: 'Industry 4.0 & Green Jobs',
      status: 'Active Batches',
      statusColor: 'bg-blue-50 text-[#0B3558] border border-blue-200',
      highlight: '100% Govt funded NSQF curriculum'
    },
    {
      id: 'samarth',
      name: 'Samarth Scheme for Marginalized',
      code: 'RSLDC-SAMARTH-02',
      department: 'Special Cohorts Cell',
      eligibility: 'Literate / Any Qualification',
      targetGroup: 'SC / ST / Divyang / Nomadic',
      status: 'Open for EOI',
      statusColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      highlight: 'Full boarding & lodging stipend support'
    },
    {
      id: 'saksham',
      name: 'Saksham Scheme for Women',
      code: 'RSLDC-SAKSHAM-03',
      department: 'Women Empowerment Wing',
      eligibility: 'Female Candidates (Age 18-45)',
      targetGroup: 'Self-Help Groups & Rural Women',
      status: 'Ongoing',
      statusColor: 'bg-purple-50 text-purple-800 border border-purple-200',
      highlight: 'Micro-entrepreneurship kit & bank linkage'
    }
  ];
}
