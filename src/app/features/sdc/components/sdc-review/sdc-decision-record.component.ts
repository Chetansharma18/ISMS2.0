import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { formatDateTime } from '../../../../shared/utils';
import type { SdcRecord } from '../../models/sdc.model';
import { decisionRecordOf } from './sdc-review.util';

/** Recorded decision of the department (shown once the SDC is approved, rejected or returned to the training partner). */
@Component({
  selector: 'app-sdc-decision-record',
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
          'border-slate-200/90': r.kind === 'APPROVED'
        }"
        aria-labelledby="sdc-decision-heading"
      >
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 id="sdc-decision-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">
            @switch (r.kind) {
              @case ('RETURNED') { Returned to Training Partner }
              @case ('REJECTED') { Rejected }
              @default { Approved }
            }
          </h2>
          @if (decidedOn()) {
            <span class="text-xs text-slate-500">{{ decidedOn() }}</span>
          }
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-xs">
          @if (r.kind === 'APPROVED' && r.capacity) {
            <div>
              <span class="text-[11.5px] text-slate-500 block">Sanctioned Capacity</span>
              <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ r.capacity }} Trainees</span>
            </div>
          }
        </div>

        @if (r.text) {
          <p class="m-0 text-xs text-slate-700 leading-relaxed whitespace-pre-line">{{ r.text }}</p>
        }
      </section>
    }
  `
})
export class SdcDecisionRecordComponent {
  readonly sdc = input.required<SdcRecord>();

  protected readonly record = computed(() => decisionRecordOf(this.sdc()));

  protected readonly decidedOn = computed(() => {
    const at = this.record()?.at;
    return at ? formatDateTime(at) : '';
  });
}
