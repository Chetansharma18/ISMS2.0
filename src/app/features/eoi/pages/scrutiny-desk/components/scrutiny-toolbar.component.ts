import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/**
 * Top of the applicant review page: back button, applicant title with status,
 * the four review actions (Revert, Remarks, Reject, Approve) and the application summary.
 */
@Component({
  selector: 'app-scrutiny-toolbar',
  standalone: true,
  imports: [RouterLink, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-3">
      <div>
        <a
          [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          title="Back to Applicant Submissions"
        >
          <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </a>
      </div>

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">
            {{ applicant()?.anonymousLabel }}
          </h1>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
            [ngClass]="{
              'bg-amber-50 text-amber-800 border-amber-200': applicant()?.status === 'UNDER_SCRUTINY' || applicant()?.status === 'REVERTED',
              'bg-sky-50 text-navy border-sky-200': applicant()?.status === 'APPROVED',
              'bg-rose-50 text-rose-800 border-rose-200': applicant()?.status === 'REJECTED'
            }"
          >
            {{ statusLabel() }}
          </span>
        </div>

        <!-- Review actions -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            (click)="revert.emit()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors cursor-pointer shadow-2xs active:scale-95"
            title="Raise a shortfall and return the application to the applicant"
          >
            Revert
          </button>
          <button
            type="button"
            (click)="remarks.emit()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs active:scale-95"
            title="Add a remark"
          >
            Remarks
          </button>
          <button
            type="button"
            (click)="reject.emit()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs active:scale-95"
            title="Reject application"
          >
            Reject
          </button>
          <button
            type="button"
            (click)="approve.emit()"
            class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-navy hover:bg-[#07243c] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs active:scale-95"
            style="color: #ffffff !important;"
            title="Approve application"
          >
            <span style="color: #ffffff !important;">Approve</span>
          </button>
        </div>
      </div>

      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
        Proposal under {{ applicant()?.schemeName }}
      </p>
    </div>

    <!-- Application summary -->
    <div class="mt-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">EOI Reference No.</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1 font-mono break-all">{{ applicant()?.eoiRefNo }}</span>
        </div>
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">Scheme</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ applicant()?.schemeName }}</span>
        </div>
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">Registration No.</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1 font-mono">{{ applicant()?.regNumber }}</span>
        </div>
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">Submitted On</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ applicant()?.submissionDate }}</span>
        </div>
      </div>
    </div>
  `
})
export class ScrutinyToolbarComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
  readonly revert = output<void>();
  readonly remarks = output<void>();
  readonly reject = output<void>();
  readonly approve = output<void>();

  protected statusLabel(): string {
    switch (this.applicant()?.status) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'REVERTED': return 'Shortfall Raised';
      default: return 'Under Review';
    }
  }
}
