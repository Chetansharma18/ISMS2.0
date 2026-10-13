import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/** Recorded scrutiny decision alert (shown once the application has been evaluated or reverted). */
@Component({
  selector: 'app-scrutiny-decision-record',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (applicant()?.scrutinyDetails) {
      <div class="mt-4 p-3.5 sm:p-4 rounded-lg border text-xs"
        [class.bg-emerald-50/70]="applicant()?.status === 'APPROVED'"
        [class.border-emerald-200]="applicant()?.status === 'APPROVED'"
        [class.bg-rose-50/70]="applicant()?.status === 'REJECTED'"
        [class.border-rose-200]="applicant()?.status === 'REJECTED'"
        [class.bg-amber-50/70]="applicant()?.status === 'REVERTED'"
        [class.border-amber-200]="applicant()?.status === 'REVERTED'"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full"
              [class.bg-emerald-600]="applicant()?.status === 'APPROVED'"
              [class.bg-rose-600]="applicant()?.status === 'REJECTED'"
              [class.bg-amber-600]="applicant()?.status === 'REVERTED'"
            ></span>
            <h3 class="text-xs sm:text-[13px] font-semibold"
              [class.text-emerald-900]="applicant()?.status === 'APPROVED'"
              [class.text-rose-900]="applicant()?.status === 'REJECTED'"
              [class.text-amber-900]="applicant()?.status === 'REVERTED'"
            >
              @if (applicant()?.status === 'REVERTED') {
                Shortfall Notice Issued: Reverted to Applicant
              } @else {
                Official Scrutiny Order Recorded: {{ applicant()?.statusDisplay }}
              }
            </h3>
          </div>

          <span class="text-xs font-mono font-normal text-slate-600">
            {{ applicant()?.scrutinyDetails?.decisionTimestamp }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-2">
          @if (applicant()?.status === 'APPROVED') {
            <div>
              <span class="text-slate-500 block text-[11px]">Technical Score</span>
              <span class="font-semibold text-slate-800">{{ applicant()?.scrutinyDetails?.technicalScore }} / 100</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Assigned Grade</span>
              <span class="font-semibold text-slate-800">{{ applicant()?.scrutinyDetails?.grade }}</span>
            </div>
          } @else if (applicant()?.status === 'REVERTED') {
            <div>
              <span class="text-slate-500 block text-[11px]">Office Order Ref No.</span>
              <span class="font-semibold text-slate-800 font-mono">{{ applicant()?.scrutinyDetails?.shortfall?.officeOrderRef || 'RSLDC/EOI/2026/SF-01' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]">Rectification Window</span>
              <span class="font-semibold text-amber-800">{{ applicant()?.scrutinyDetails?.shortfall?.deadlineDays || 7 }} Days</span>
            </div>
          }
          <div>
            <span class="text-slate-500 block text-[11px]">Scrutiny Officer</span>
            <span class="font-medium text-slate-800">{{ applicant()?.scrutinyDetails?.scrutinyOfficer }}</span>
          </div>
        </div>

        <!-- Shortfall Documents Chips (if Reverted) -->
        @if (applicant()?.status === 'REVERTED' && applicant()?.scrutinyDetails?.shortfall?.documents?.length) {
          <div class="pt-2 border-t border-amber-200/60 text-xs mb-2">
            <span class="text-slate-600 font-medium block mb-1">Documents Required for Resubmission:</span>
            <div class="flex flex-wrap gap-1.5">
              @for (doc of applicant()?.scrutinyDetails?.shortfall?.documents; track doc) {
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 text-[11px] font-medium shadow-2xs">
                  <svg class="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {{ doc }}
                </span>
              }
            </div>
          </div>
        }

        @if (applicant()?.scrutinyDetails?.remarks) {
          <div class="pt-2 border-t border-slate-200/60 text-xs">
            <span class="text-slate-500 font-medium block mb-0.5">Scrutiny Remarks:</span>
            <p class="text-slate-700 italic leading-relaxed font-normal">
              "{{ applicant()?.scrutinyDetails?.remarks }}"
            </p>
          </div>
        }
      </div>
    }
  `
})
export class ScrutinyDecisionRecordComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
}
