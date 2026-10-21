import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent, IconComponent } from '../../../../shared';
import type { BatchRecord } from '../../models/batch.model';
import { batchDisplayStatus, batchStatusLabel } from '../../utils/batch-approval.util';
import { canDecideBatch } from './batch-review.util';

/**
 * Top of the batch review page for the department, laid out like the SDC review page: back button, batch code with
 * its status, and the four review actions (Revert, Remarks, Reject, Approve).
 */
@Component({
  selector: 'app-batch-review-toolbar',
  standalone: true,
  imports: [RouterLink, NgClass, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let b = batch();
    <div class="space-y-3">
      <div>
        <a appButton variant="outline" size="sm" [routerLink]="backUrl()" title="Back to Batch Approvals">
          <app-icon name="back" />
          <span>Back</span>
        </a>
      </div>

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0 tabular-nums">{{ b.batchCode }}</h1>
          <span class="text-xs font-semibold text-slate-500">{{ b.courseName }}</span>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
            [ngClass]="{
              'bg-sky-50 text-navy border-sky-200': display() === 'APPROVED',
              'bg-rose-50 text-rose-800 border-rose-200': display() === 'REJECTED',
              'bg-amber-50 text-amber-800 border-amber-200': display() !== 'APPROVED' && display() !== 'REJECTED'
            }"
          >
            {{ statusLabel() }}
          </span>
        </div>

        <!-- Review actions -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            appButton
            variant="secondary"
            size="sm"
            [disabled]="!decidable()"
            (click)="revert.emit()"
            [title]="decidable() ? 'Return the batch to the training partner for corrections' : lockedTitle()"
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
            [title]="decidable() ? 'Reject batch' : lockedTitle()"
          >
            Reject
          </button>
          <button
            appButton
            size="sm"
            [disabled]="!decidable()"
            (click)="approve.emit()"
            [title]="decidable() ? 'Approve batch' : lockedTitle()"
          >
            Approve
          </button>
        </div>
      </div>

      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
        Batch at {{ b.sdcName }} ({{ b.sdcCode }}) of {{ b.tpName }}.
      </p>
    </div>
  `
})
export class BatchReviewToolbarComponent {
  readonly batch = input.required<BatchRecord>();
  readonly backUrl = input('/admin/batch-approvals');

  readonly revert = output<void>();
  readonly remarks = output<void>();
  readonly reject = output<void>();
  readonly approve = output<void>();

  protected readonly decidable = computed(() => canDecideBatch(this.batch()));
  protected readonly display = computed(() => batchDisplayStatus(this.batch()));
  protected readonly statusLabel = computed(() => batchStatusLabel(this.batch()));

  protected lockedTitle(): string {
    return `This batch is ${this.statusLabel().toLowerCase()}, so it can no longer be decided here.`;
  }
}
