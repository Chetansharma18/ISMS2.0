import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { formatDateTime } from '../../../../shared/utils';
import type { BatchRecord } from '../../models/batch.model';
import { batchDecisionRecordOf } from './batch-review.util';

/** Recorded decision of the department, shown once the batch is approved, rejected or returned to the training partner. */
@Component({
  selector: 'app-batch-decision-record',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (record(); as r) {
      <section
        class="bg-white rounded-xl border shadow-2xs p-5 sm:p-6 space-y-3"
        [ngClass]="{
          'border-amber-300': r.kind === 'RETURNED',
          'border-rose-300': r.kind === 'REJECTED',
          'border-slate-300': r.kind === 'WITHDRAWN',
          'border-slate-200/90': r.kind === 'APPROVED'
        }"
        aria-labelledby="batch-decision-heading"
      >
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 id="batch-decision-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">
            @switch (r.kind) {
              @case ('RETURNED') { Returned to Training Partner }
              @case ('REJECTED') { Rejected }
              @case ('WITHDRAWN') { Batch Withdrawn }
              @default { Approved }
            }
          </h2>
          @if (decidedOn()) {
            <span class="text-xs text-slate-500">{{ decidedOn() }}</span>
          }
        </div>

        @if (r.kind === 'APPROVED' && r.capacity) {
          <div class="text-xs">
            <span class="text-[11.5px] text-slate-500 block">Sanctioned Capacity</span>
            <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ r.capacity }} Trainees</span>
          </div>
        }

        @if (r.text) {
          <p class="m-0 text-xs text-slate-700 leading-relaxed whitespace-pre-line">{{ r.text }}</p>
        }

        @if (r.kind === 'RETURNED') {
          <p class="m-0 text-xs text-slate-500">The batch comes back for approval when the training partner saves the corrections.</p>
        }
      </section>
    }
  `
})
export class BatchDecisionRecordComponent {
  readonly batch = input.required<BatchRecord>();

  protected readonly record = computed(() => batchDecisionRecordOf(this.batch()));

  protected readonly decidedOn = computed(() => {
    const at = this.record()?.at;
    return at ? formatDateTime(at) : '';
  });
}
