import { ChangeDetectionStrategy, Component, OnInit, computed, input, signal } from '@angular/core';
import { IconComponent } from '../../../../../shared';
import type { ApplicationActivityLog } from '../../../services/eoi-state.models';

/** A remark recorded by a department user, with who said it and when. */
export interface DepartmentRemark {
  id: string;
  author: string;
  timestamp: string;
  kind: string;
  text: string;
}

const KIND_LABEL: Partial<Record<ApplicationActivityLog['action'], string>> = {
  REMARK_ADDED: 'Review Remark',
  FORWARDED: 'Desk Forwarded',
  REVERTED: 'Clarification / Reverted',
  APPROVED: 'Approved & Qualified',
  REJECTED: 'Disqualification Recorded'
};

/** Picks the remarks written by department users out of the application's activity log. */
export function departmentRemarks(log: ApplicationActivityLog[]): DepartmentRemark[] {
  return log
    .filter(entry => entry.actorRole !== 'Applicant / TP' && !!entry.meta?.remarks)
    .map(entry => ({
      id: entry.id,
      author: entry.actor,
      timestamp: entry.timestamp,
      kind: KIND_LABEL[entry.action] ?? 'Remark',
      text: entry.meta!.remarks!
    }));
}

/** Remarks shared by different department users on this application in a clean professional audit stream. */
@Component({
  selector: 'app-scrutiny-remarks',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-4' },
  template: `
    <div class="space-y-4">
      <div class="pb-3 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 flex items-center gap-2">
          <app-icon name="document" size="xs" class="text-primary" />
          <span>Department Review Notes &amp; Official Observations</span>
        </h3>
        <span class="text-xs font-semibold text-slate-600">
          {{ remarks().length }} Logged Observations
        </span>
      </div>

      @if (remarks().length === 0) {
        <div class="py-10 text-center text-slate-500 text-xs">
          <app-icon name="info" size="md" class="mx-auto mb-2 text-slate-400" />
          <p class="m-0 font-medium">No departmental internal remarks have been recorded on this proposal yet.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (remark of remarks(); track remark.id) {
            <div class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-primary"></span>
                  <span class="font-bold text-slate-900 text-sm">{{ remark.author }}</span>
                  <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-200 text-slate-700">
                    {{ remark.kind }}
                  </span>
                </div>
                <span class="text-xs font-semibold text-slate-500 tabular-nums">
                  {{ remark.timestamp }}
                </span>
              </div>
              <p class="m-0 text-xs sm:text-[13px] text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                {{ remark.text }}
              </p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ScrutinyRemarksComponent implements OnInit {
  readonly log = input<ApplicationActivityLog[]>([]);
  readonly initiallyOpen = input<boolean>(true);

  ngOnInit(): void {}

  readonly remarks = computed(() => departmentRemarks(this.log()));
}
