import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/** Recorded scrutiny decision (shown once the application has been decided or reverted). */
@Component({
  selector: 'app-scrutiny-decision-record',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (applicant()?.scrutinyDetails; as details) {
      <section
        class="bg-white rounded-xl border shadow-2xs p-5 sm:p-6 space-y-3"
        [ngClass]="{
          'border-amber-300': applicant()?.status === 'REVERTED',
          'border-rose-300': applicant()?.status === 'REJECTED',
          'border-slate-200/90': applicant()?.status === 'APPROVED'
        }"
        aria-labelledby="decision-heading"
      >
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 id="decision-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">
            @switch (applicant()?.status) {
              @case ('REVERTED') { Shortfall Raised }
              @case ('REJECTED') { Rejected }
              @default { Approved }
            }
          </h2>
          <span class="text-xs text-slate-500">{{ details.decisionTimestamp }}</span>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-xs">
          @if (applicant()?.status === 'APPROVED') {
            <div>
              <span class="text-[11.5px] text-slate-500 block">Grade</span>
              <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ details.grade?.replace('Grade ', '') }}</span>
            </div>
          } @else if (applicant()?.status === 'REVERTED') {
            @if (details.shortfall?.officeOrderRef) {
              <div>
                <span class="text-[11.5px] text-slate-500 block">Office Order Ref No.</span>
                <span class="text-[12.5px] font-medium text-slate-900 block mt-1 tabular-nums">{{ details.shortfall?.officeOrderRef }}</span>
              </div>
            }
            <div>
              <span class="text-[11.5px] text-slate-500 block">Respond Within</span>
              <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ details.shortfall?.deadlineDays || 7 }} days</span>
            </div>
          }
          <div>
            <span class="text-[11.5px] text-slate-500 block">Decided By</span>
            <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ details.scrutinyOfficer }}</span>
          </div>
        </div>

        @if (applicant()?.status === 'REVERTED' && details.shortfall?.documents?.length) {
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <span class="text-[11.5px] text-slate-500">Documents required:</span>
            @for (doc of details.shortfall?.documents; track doc) {
              <span class="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-medium">{{ doc }}</span>
            }
          </div>
        }

        @if (details.remarks) {
          <p class="m-0 text-xs text-slate-700 leading-relaxed whitespace-pre-line">{{ details.remarks }}</p>
        }
      </section>
    }
  `
})
export class ScrutinyDecisionRecordComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
}
