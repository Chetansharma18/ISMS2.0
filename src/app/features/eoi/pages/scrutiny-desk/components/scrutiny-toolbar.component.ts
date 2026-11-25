import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, IconComponent } from '../../../../../shared';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/**
 * Top of the applicant review page: back button, the review actions (Remark, Reject, Approve)
 * and, when `showSummary` is set, the application summary.
 */
@Component({
  selector: 'app-scrutiny-toolbar',
  standalone: true,
  imports: [RouterLink, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex items-center justify-between gap-3">
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

      <!-- Review actions -->
      <div class="flex items-center gap-2 flex-wrap">
        @if (isRemarked()) {
          <button
            appButton
            variant="outline"
            size="sm"
            type="button"
            (click)="remark.emit()"
            title="Remark recorded. Click to view or update remark."
          >
            <app-icon name="check" size="sm" />
            <span>Remarked</span>
          </button>
        } @else {
          <button
            appButton
            variant="outline"
            size="sm"
            type="button"
            (click)="remark.emit()"
            title="Add Remark"
          >
            <span>Remark</span>
          </button>
        }
        <button appButton variant="danger" size="sm" type="button" (click)="reject.emit()" title="Reject application">Reject</button>
        <button appButton size="sm" type="button" (click)="approve.emit()" title="Approve application">Approve</button>
      </div>
    </div>

    @if (showSummary()) {
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
    }
  `
})
export class ScrutinyToolbarComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
  readonly isRemarked = input<boolean>(false);
  readonly showSummary = input<boolean>(false);
  readonly remark = output<void>();
  readonly reject = output<void>();
  readonly approve = output<void>();
}
