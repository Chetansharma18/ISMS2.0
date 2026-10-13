import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/** Application heading, scrutiny status badge and metadata stats bar. */
@Component({
  selector: 'app-scrutiny-applicant-summary',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            {{ applicant()?.anonymousLabel || 'Company 1' }}
          </h1>
          <span class="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold uppercase px-2 py-0.5 rounded">
            {{ applicant()?.anonymousLabel }}
          </span>
          <span class="font-mono text-xs text-slate-500">
            Reg No: {{ applicant()?.regNumber }}
          </span>
        </div>

        <p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
          Application for Empanelment under <strong class="text-slate-900 font-semibold">{{ applicant()?.schemeName }}</strong> &bull; Submitted on {{ applicant()?.submissionDate }}
        </p>
      </div>

      <!-- Scrutiny Status Badge -->
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-xs text-slate-500 font-medium">Status:</span>
        @if (applicant()?.status === 'UNDER_SCRUTINY') {
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending Review
          </span>
        } @else if (applicant()?.status === 'APPROVED') {
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Accepted (Approved)
          </span>
        } @else if (applicant()?.status === 'REJECTED') {
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Rejected
          </span>
        } @else if (applicant()?.status === 'REVERTED') {
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Reverted (Shortfall Notice)
          </span>
        }
      </div>
    </div>

    <!-- ====================================================================
         3. METADATA STATS BAR WITH VERTICAL DIVIDERS (IMAGE 4 STYLE)
         ==================================================================== -->
    <div class="mt-4 pt-3 pb-3 border-t border-b border-slate-200">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">

        <div class="pr-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">EOI Reference No.</span>
          <span class="text-xs sm:text-[12.5px] font-mono font-medium text-slate-900 block mt-1 break-all">{{ applicant()?.eoiRefNo }}</span>
        </div>

        <div class="px-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">Scheme Name</span>
          <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1 truncate" [title]="applicant()?.schemeName">{{ applicant()?.schemeName }}</span>
        </div>

        <div class="px-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">Entity Constitution</span>
          <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1 truncate" [title]="applicant()?.organisation?.entityType">{{ applicant()?.organisation?.entityType }}</span>
        </div>

        <div class="px-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">Registration / CIN</span>
          <span class="text-xs sm:text-[12.5px] font-mono font-medium text-slate-900 block mt-1 break-all">{{ applicant()?.organisation?.registrationNumber }}</span>
        </div>

        <div class="px-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">Company PAN &amp; GSTIN</span>
          <span class="text-xs sm:text-[12.5px] font-mono font-medium text-slate-900 block mt-1 truncate" [title]="applicant()?.organisation?.panNumber + ' / ' + applicant()?.organisation?.gstin">
            {{ applicant()?.organisation?.panNumber }} &bull; {{ applicant()?.organisation?.gstin }}
          </span>
        </div>

        <div class="pl-3 py-1 sm:py-0">
          <span class="text-[11px] text-slate-500 block leading-tight">Submission Date</span>
          <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ applicant()?.submissionDate }}</span>
        </div>

      </div>
    </div>
  `
})
export class ScrutinyApplicantSummaryComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
}
