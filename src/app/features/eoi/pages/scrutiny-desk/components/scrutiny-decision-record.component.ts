import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { IconComponent } from '../../../../../shared';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/** Recorded scrutiny decision (shown once the application has been decided or reverted). */
@Component({
  selector: 'app-scrutiny-decision-record',
  standalone: true,
  imports: [NgClass, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (applicant()?.scrutinyDetails; as details) {
      <div
        class="rounded-xl border p-4 sm:p-5 space-y-3"
        [ngClass]="{
          'bg-emerald-50/70 border-emerald-200 text-emerald-950': applicant()?.appeal?.status === 'Accepted' || (applicant()?.status === 'REVERTED' && !!applicant()?.appeal),
          'bg-amber-50/70 border-amber-200 text-amber-950': applicant()?.status === 'REVERTED' && !applicant()?.appeal,
          'bg-rose-50/70 border-rose-200 text-rose-950': applicant()?.status === 'REJECTED',
          'bg-slate-50/80 border-slate-200 text-slate-900': applicant()?.status === 'APPROVED' && !applicant()?.appeal
        }"
        aria-labelledby="decision-heading"
      >
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <app-icon
              [name]="applicant()?.appeal?.status === 'Accepted' || applicant()?.status === 'APPROVED' ? 'check' : (applicant()?.status === 'REJECTED' ? 'close' : 'info')"
              size="sm"
              [class.text-emerald-700]="applicant()?.appeal?.status === 'Accepted' || applicant()?.status === 'APPROVED'"
              [class.text-rose-700]="applicant()?.status === 'REJECTED'"
              [class.text-amber-700]="applicant()?.status === 'REVERTED'"
            />
            <h3 id="decision-heading" class="text-sm sm:text-base font-bold m-0">
              @if (applicant()?.appeal) {
                @if (applicant()?.appeal?.status === 'Accepted') {
                  Appeal Approved &amp; Technical Qualification Restored
                } @else if (applicant()?.appeal?.status === 'Rejected') {
                  Appeal Rejected &amp; Disqualification Upheld
                } @else {
                  Appeal Petition Pending Committee Review
                }
              } @else {
                @switch (applicant()?.status) {
                  @case ('REVERTED') { Scrutiny Clarification / Reversion Notice Issued }
                  @case ('REJECTED') { Technical Disqualification Recorded }
                  @default { Application Approved &amp; Empaneled }
                }
              }
            </h3>
          </div>
          <span class="text-xs font-semibold tabular-nums opacity-80">{{ details.decisionTimestamp }}</span>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-xs pt-1">
          @if (applicant()?.status === 'APPROVED' || applicant()?.appeal?.status === 'Accepted') {
            <div>
              <span class="text-[11px] uppercase tracking-wider font-semibold opacity-70 block">Evaluated Grade</span>
              <span class="text-sm font-bold block mt-0.5">{{ details.grade?.replace('Grade ', '') || 'A+' }}</span>
            </div>
          } @else if (applicant()?.status === 'REVERTED') {
            @if (details.shortfall?.officeOrderRef) {
              <div>
                <span class="text-[11px] uppercase tracking-wider font-semibold opacity-70 block">Office Order Ref</span>
                <span class="text-sm font-bold block mt-0.5 tabular-nums">{{ details.shortfall?.officeOrderRef }}</span>
              </div>
            }
            <div>
              <span class="text-[11px] uppercase tracking-wider font-semibold opacity-70 block">Response Window</span>
              <span class="text-sm font-bold block mt-0.5">{{ details.shortfall?.deadlineDays || 7 }} Days</span>
            </div>
          }
          <div>
            <span class="text-[11px] uppercase tracking-wider font-semibold opacity-70 block">Decided By</span>
            <span class="text-sm font-semibold block mt-0.5">{{ details.scrutinyOfficer || 'State Empanelment Committee' }}</span>
          </div>
        </div>

        @if (applicant()?.status === 'REVERTED' && details.shortfall?.documents?.length) {
          <div class="flex flex-wrap items-center gap-1.5 text-xs pt-1">
            <span class="text-[11px] font-semibold opacity-80">Documents required:</span>
            @for (doc of details.shortfall?.documents; track doc) {
              <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-bold">{{ doc }}</span>
            }
          </div>
        }

        @if (details.remarks) {
          <p class="m-0 text-xs sm:text-[12.5px] leading-relaxed pt-1 opacity-90 font-normal">
            {{ details.remarks }}
          </p>
        }
      </div>
    }
  `
})
export class ScrutinyDecisionRecordComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
}
