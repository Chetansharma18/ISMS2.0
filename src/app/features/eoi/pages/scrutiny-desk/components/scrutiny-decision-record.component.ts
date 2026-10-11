import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/** Recorded scrutiny decision alert (shown once the application has been evaluated). */
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
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full"
              [class.bg-emerald-600]="applicant()?.status === 'APPROVED'"
              [class.bg-rose-600]="applicant()?.status === 'REJECTED'"
            ></span>
            <h3 class="text-xs sm:text-[13px] font-semibold"
              [class.text-emerald-900]="applicant()?.status === 'APPROVED'"
              [class.text-rose-900]="applicant()?.status === 'REJECTED'"
            >
              Official Scrutiny Order Recorded: {{ applicant()?.statusDisplay }}
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
          }
          <div>
            <span class="text-slate-500 block text-[11px]">Scrutiny Officer</span>
            <span class="font-medium text-slate-800">{{ applicant()?.scrutinyDetails?.scrutinyOfficer }}</span>
          </div>
        </div>

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
