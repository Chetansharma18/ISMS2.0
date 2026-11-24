import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent, IconComponent } from '../../../../../shared';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/**
 * Top of the applicant review page: back button, applicant title with status,
 * the four review actions (Revert, Remarks, Reject, Approve) and the application summary.
 */
@Component({
  selector: 'app-scrutiny-toolbar',
  standalone: true,
  imports: [RouterLink, NgClass, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-3">
      <div>
        <a
          appButton
          variant="outline"
          size="sm"
          [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']"
          title="Back to Applicant Submissions"
        >
          <app-icon name="back" />
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
              'bg-emerald-50 text-emerald-800 border-emerald-200': applicant()?.appeal?.status === 'Accepted' || applicant()?.status === 'APPROVED',
              'bg-amber-50 text-amber-800 border-amber-200': applicant()?.appeal?.status === 'Pending' || ((applicant()?.status === 'UNDER_SCRUTINY' || applicant()?.status === 'REVERTED') && applicant()?.appeal?.status !== 'Accepted'),
              'bg-rose-50 text-rose-800 border-rose-200': applicant()?.status === 'REJECTED' || applicant()?.appeal?.status === 'Rejected'
            }"
          >
            {{ statusLabel() }}
          </span>
        </div>

        <!-- Review actions -->
        <div class="flex items-center gap-2 flex-wrap">
          @if (isRemarked()) {
            <span
              (click)="remark.emit()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
              title="Remark recorded. Click to view or update remark."
            >
              <app-icon name="check" size="sm" />
              <span>Remarked</span>
            </span>
          } @else {
            <button
              appButton
              variant="primary"
              size="sm"
              (click)="remark.emit()"
              title="Add Remark"
            >
              Remark
            </button>
          }
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
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1 tabular-nums break-all">{{ applicant()?.eoiRefNo }}</span>
        </div>
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">Scheme</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ applicant()?.schemeName }}</span>
        </div>
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">Registration No.</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1 tabular-nums">{{ applicant()?.regNumber }}</span>
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
  readonly isRemarked = input<boolean>(false);
  readonly remark = output<void>();

  protected statusLabel(): string {
    const app = this.applicant();
    if (app?.appeal) {
      if (app.appeal.status === 'Pending') return 'Appeal Pending Review';
      if (app.appeal.status === 'Accepted') return 'Appeal Approved';
      if (app.appeal.status === 'Rejected') return 'Appeal Rejected';
    }
    switch (app?.status) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'REVERTED': return 'Appeal Request';
      default: return 'Under Review';
    }
  }
}
