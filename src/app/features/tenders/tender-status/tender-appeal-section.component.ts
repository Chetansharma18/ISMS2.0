import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { SubmittedTender } from '../../../core/models/tender.model';

/** The appeal the applicant sent against the rejection of this application: the rejection remarks and the applicant's remarks. */
@Component({
  selector: 'app-tender-appeal-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (app().appeal; as appeal) {
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="appeal-heading">
        <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">7</span>
            <h2 id="appeal-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Appeal Request</h2>
          </div>
          <span class="text-[11px] text-slate-500">Submitted on {{ appeal.submittedOn }}</span>
        </div>

        <div class="space-y-1 text-xs">
          <span class="text-slate-500 block text-[11px]">Rejection remarks</span>
          <p class="m-0 text-slate-700 leading-relaxed whitespace-pre-line">{{ app().rejectionReason || 'Technical qualification criteria not met.' }}</p>
        </div>

        <div class="space-y-1 text-xs">
          <span class="text-slate-500 block text-[11px]">Your Remarks</span>
          <p class="m-0 text-slate-900 leading-relaxed whitespace-pre-line">{{ appeal.reply }}</p>
        </div>
      </section>
    }
  `
})
export class TenderAppealSectionComponent {
  readonly app = input.required<SubmittedTender>();
}
