import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../shared';
import type { SubmittedTender } from '../../../core/models/tender.model';
import { TenderDocViewRequest } from './tender-doc-card.component';

/** The appeal the applicant sent against the rejection of this application: the answer and the files attached. */
@Component({
  selector: 'app-tender-appeal-section',
  standalone: true,
  imports: [ButtonComponent],
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
          <span class="text-slate-500 block text-[11px]">Your answer</span>
          <p class="m-0 text-slate-900 leading-relaxed whitespace-pre-line">{{ appeal.reply }}</p>
        </div>

        @if (appeal.files.length > 0) {
          <ul class="m-0 p-0 list-none border border-slate-200 rounded-lg divide-y divide-slate-200 text-xs">
            @for (file of appeal.files; track file.fileName) {
              <li class="flex items-center justify-between gap-3 px-3 py-2">
                <span class="min-w-0 truncate">
                  <span class="font-medium text-slate-800">{{ file.fileName }}</span>
                  <span class="text-[11px] text-slate-500"> &bull; {{ file.fileSize }}</span>
                </span>
                <button
                  appButton
                  variant="ghost"
                  size="sm"
                  type="button"
                  class="shrink-0"
                  (click)="viewDoc.emit({ fileName: file.fileName, title: file.fileName, fileSize: file.fileSize })"
                >
                  View
                </button>
              </li>
            }
          </ul>
        }
      </section>
    }
  `
})
export class TenderAppealSectionComponent {
  readonly app = input.required<SubmittedTender>();
  readonly viewDoc = output<TenderDocViewRequest>();
}
