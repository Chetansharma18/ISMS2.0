import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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
  REMARK_ADDED: 'Remark',
  FORWARDED: 'Remark',
  REVERTED: 'Shortfall',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
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

/** Remarks shared by the different department users on this application: who said what, and when. */
@Component({
  selector: 'app-scrutiny-remarks',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="remarks-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">6</span>
          <h2 id="remarks-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Department Remarks</h2>
        </div>
        <span class="text-[11px] text-slate-500">{{ remarks().length }} remark(s)</span>
      </div>

      @if (remarks().length === 0) {
        <p class="m-0 text-xs text-slate-500">No remarks have been recorded on this application yet.</p>
      } @else {
        <ul class="m-0 p-0 list-none space-y-3">
          @for (remark of remarks(); track remark.id) {
            <li class="border border-slate-200 rounded-lg p-3.5 text-xs">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <span class="font-semibold text-slate-900 text-[12.5px]">{{ remark.author }}</span>
                <div class="text-right shrink-0">
                  <span class="inline-block px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-[10.5px] font-semibold">{{ remark.kind }}</span>
                  <span class="block text-[11px] text-slate-500 mt-1">{{ remark.timestamp }}</span>
                </div>
              </div>
              <p class="m-0 mt-2 text-slate-700 leading-relaxed whitespace-pre-line">{{ remark.text }}</p>
            </li>
          }
        </ul>
      }
    </section>
  `
})
export class ScrutinyRemarksComponent {
  readonly log = input<ApplicationActivityLog[]>([]);

  protected readonly remarks = computed(() => departmentRemarks(this.log()));
}
