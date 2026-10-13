import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/**
 * Scrutiny Toolbar:
 * - Left side: Single themed "< Back" button (no breadcrumbs / slashes).
 * - Right side: 4 primary actions (Revert, Remarks, Reject, Accept).
 */
@Component({
  selector: 'app-scrutiny-toolbar',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">

      <!-- Left: Single Clean Back Button (No Slashes / Breadcrumb Nav) -->
      <a
        [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']"
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-[13px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
        title="Back to Applicant Submissions"
      >
        <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </a>

      <!-- Right: 4 Dedicated Review Actions (Revert, Remarks, Reject, Accept) -->
      <div class="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">

        <!-- 1. Revert Action -->
        <button
          type="button"
          (click)="revert.emit()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
          title="Revert application with shortfall notice"
        >
          <svg class="w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v2m0 0l-3-3m3 3l3-3M3 10l3 3m-3-3l3-3" />
          </svg>
          <span>Revert</span>
        </button>

        <!-- 2. Remarks Action -->
        <button
          type="button"
          (click)="remarks.emit()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
          title="Add Scrutiny Remarks & Forward"
        >
          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Remarks</span>
        </button>

        <!-- 3. Reject Action -->
        <button
          type="button"
          (click)="reject.emit()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
          title="Reject Application"
        >
          <svg class="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Reject</span>
        </button>

        <!-- 4. Approve Action (renamed from Accept) -->
        <button
          type="button"
          (click)="approve.emit()"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
          style="color: #ffffff !important;"
          title="Approve & Empanel Application"
        >
          <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span style="color: #ffffff !important;">Approve</span>
        </button>

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
  readonly accept = output<void>();
}
