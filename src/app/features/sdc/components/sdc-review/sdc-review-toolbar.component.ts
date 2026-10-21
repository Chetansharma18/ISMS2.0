import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent, IconComponent } from '../../../../shared';
import { formatDateTime } from '../../../../shared/utils';
import type { SdcRecord } from '../../models/sdc.model';
import { formatSdcStatus } from '../sdc-detail/sdc-detail.util';
import { canApproveSdc, canDecideSdc, canInspectSdc } from './sdc-review.util';

/**
 * Top of the SDC review page, laid out like the applicant review page: back button, centre name with its status,
 * the four review actions (Return, Remarks, Reject, Approve) and the summary of the centre.
 */
@Component({
  selector: 'app-sdc-review-toolbar',
  standalone: true,
  imports: [RouterLink, NgClass, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let center = sdc();
    <div class="space-y-3">
      <div>
        <a appButton variant="outline" size="sm" [routerLink]="backUrl()" title="Back to SDC Approvals">
          <app-icon name="back" />
          <span>Back</span>
        </a>
      </div>

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">{{ center.sdcName }}</h1>
          <span class="tabular-nums text-xs font-semibold text-slate-500">{{ center.sdcCode }}</span>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
            [ngClass]="{
              'bg-sky-50 text-navy border-sky-200': center.status === 'APPROVED',
              'bg-rose-50 text-rose-800 border-rose-200': center.status === 'REJECTED',
              'bg-amber-50 text-amber-800 border-amber-200': center.status !== 'APPROVED' && center.status !== 'REJECTED'
            }"
          >
            {{ statusLabel() }}
          </span>
        </div>

        <!-- Review actions -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            appButton
            variant="outline"
            size="sm"
            [disabled]="!inspectable()"
            (click)="inspection.emit()"
            [title]="inspectable() ? 'Fill the inspection form of this SDC' : inspectionLockedTitle()"
          >
            <app-icon name="clipboard-check" size="sm" />
            <span>Inspection Form</span>
          </button>
          <button
            appButton
            variant="secondary"
            size="sm"
            [disabled]="!decidable()"
            (click)="revert.emit()"
            [title]="decidable() ? 'Return the SDC to the training partner for corrections' : lockedTitle()"
          >
            Revert
          </button>
          <button appButton variant="outline" size="sm" (click)="remarks.emit()" title="Add a remark">Remarks</button>
          <button
            appButton
            variant="danger"
            size="sm"
            [disabled]="!decidable()"
            (click)="reject.emit()"
            [title]="decidable() ? 'Reject SDC' : lockedTitle()"
          >
            Reject
          </button>
          <button
            appButton
            size="sm"
            [disabled]="!approvable()"
            (click)="approve.emit()"
            [title]="approvable() ? 'Approve SDC' : approveLockedTitle()"
          >
            Approve
          </button>
        </div>
      </div>

      <!-- Everything else about the centre is in the cards below; only the submission date is said here. -->
      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
        Submitted on {{ submittedOn() }}
      </p>
    </div>
  `
})
export class SdcReviewToolbarComponent {
  readonly sdc = input.required<SdcRecord>();
  readonly backUrl = input('/sdc');

  readonly inspection = output<void>();
  readonly revert = output<void>();
  readonly remarks = output<void>();
  readonly reject = output<void>();
  readonly approve = output<void>();

  protected readonly decidable = computed(() => canDecideSdc(this.sdc().status));
  protected readonly inspectable = computed(() => canInspectSdc(this.sdc().status));
  protected readonly approvable = computed(() => canApproveSdc(this.sdc().status));
  protected readonly statusLabel = computed(() => formatSdcStatus(this.sdc().status));
  protected readonly submittedOn = computed(() => {
    const at = this.sdc().submittedAt || this.sdc().createdAt;
    return at ? formatDateTime(at) : '—';
  });

  protected inspectionLockedTitle(): string {
    return this.sdc().inspection
      ? 'The inspection form of this SDC has already been submitted.'
      : `This SDC is ${this.statusLabel().toLowerCase()}, so the inspection form can no longer be filled.`;
  }

  protected approveLockedTitle(): string {
    return this.decidable() ? 'Fill the inspection form before approving this SDC.' : this.lockedTitle();
  }

  protected lockedTitle(): string {
    return `This SDC is ${this.statusLabel().toLowerCase()}, so it can no longer be decided here.`;
  }
}
