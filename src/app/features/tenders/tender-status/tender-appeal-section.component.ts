import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { ShortfallRequest, SubmittedTender } from '../../../core/models/tender.model';
import { ButtonComponent, IconComponent } from '../../../shared';
import { TenderDocViewRequest } from './tender-doc-card.component';
import { remainingDaysText } from './tender-appeal.util';

/** The appeal the applicant sent against the rejection of this application: the rejection remarks, applicant's remarks, and department's response. */
@Component({
  selector: 'app-tender-appeal-section',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (app().appeal; as appeal) {
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="appeal-heading">
        <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">6</span>
            <h2 id="appeal-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Appeal Request & Department Response</h2>
          </div>
          <span class="text-[11px] text-slate-500">Appeal Submitted on {{ appeal.submittedOn }}</span>
        </div>

        <!-- 1. Original Rejection Remarks -->
        <div class="space-y-1 text-xs">
          <span class="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">Original Rejection Grounds</span>
          <p class="m-0 text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-2.5 rounded border border-slate-200/80">{{ app().rejectionReason || 'Technical qualification criteria not met.' }}</p>
        </div>

        <!-- 2. Applicant's Appeal Remarks -->
        <div class="space-y-1 text-xs">
          <span class="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">Your Appeal Remarks</span>
          <p class="m-0 text-slate-900 leading-relaxed whitespace-pre-line bg-sky-50/50 p-2.5 rounded border border-sky-100">{{ appeal.reply }}</p>
        </div>

        <!-- 3. Files Attached to Appeal -->
        @if (appeal.files.length > 0) {
          <div class="space-y-1.5 text-xs">
            <span class="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">Appeal Attachments</span>
            <div class="flex flex-wrap gap-2">
              @for (file of appeal.files; track file.fileName) {
                <button
                  appButton
                  variant="outline"
                  size="sm"
                  type="button"
                  (click)="viewDoc.emit({ fileName: file.fileName, title: 'Appeal Attachment', fileSize: file.fileSize })"
                >
                  <app-icon name="document" size="xs" />
                  <span>{{ file.fileName }}</span>
                  <span class="text-slate-400 text-[10.5px]">({{ file.fileSize }})</span>
                </button>
              }
            </div>
          </div>
        }

        <!-- 4. Department Response Section -->
        @if (appealResponseNotice(); as deptNotice) {
          <div class="mt-4 p-4 sm:p-5 rounded-xl border border-amber-300 bg-linear-to-r from-amber-50/90 via-orange-50/40 to-amber-50/60 shadow-2xs space-y-3.5">
            <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/80">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Department Appeal Response
                </span>
                <span class="text-xs font-semibold text-slate-800">
                  {{ deptNotice.status === 'Open' ? 'Clarification & Documents Requested' : 'Response Submitted' }}
                </span>
              </div>
              <div class="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <app-icon name="calendar" size="xs" class="text-slate-400" />
                <span>Response Date & Time: <strong>{{ deptNotice.raisedOn }}</strong></span>
              </div>
            </div>

            <!-- Department Remarks -->
            <div class="space-y-1.5 text-xs">
              <span class="text-slate-700 block text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <app-icon name="chat-bubble" size="xs" class="text-amber-600" />
                <span>Department Remarks:</span>
              </span>
              <p class="m-0 text-slate-800 text-xs leading-relaxed whitespace-pre-line bg-white/90 p-3 rounded-lg border border-amber-200/90 font-medium">
                {{ deptNotice.remarks || appeal.deptRemarks || 'Appeal reviewed. Please submit the requested documents within the allotted response window.' }}
              </p>
            </div>

            <!-- 7-Day Window & Deadline Notification -->
            <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white/95 border border-amber-200/90">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <app-icon name="clock" size="sm" />
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>Response Window: <strong class="text-rose-700">7 Days</strong></span>
                    <span class="text-slate-400">&bull;</span>
                    <span>Deadline: <strong class="text-slate-900">{{ deptNotice.dueDate }}</strong></span>
                  </div>
                  <span class="text-[11px] text-slate-500 block">Existing user must submit clarification/documents within 7 days of department response.</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                @if (deptNotice.status === 'Open') {
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {{ remainingDays(deptNotice.dueDate) }}
                  </span>
                  <button appButton size="sm" type="button" (click)="respond.emit(deptNotice)" class="shrink-0">
                    <span>Respond to Department</span>
                  </button>
                } @else {
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
                    <app-icon name="check" size="xs" />
                    <span>Response Submitted</span>
                  </span>
                }
              </div>
            </div>

            <!-- Required Documents if any -->
            @if (deptNotice.requiredDocs.length > 0) {
              <div class="space-y-1.5 text-xs">
                <span class="text-slate-600 block text-[11px] font-semibold">Documents Requested by Department:</span>
                <div class="flex flex-wrap gap-1.5">
                  @for (doc of deptNotice.requiredDocs; track doc) {
                    <span class="px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 text-xs font-medium">{{ doc }}</span>
                  }
                </div>
              </div>
            }

            <!-- Supporting Documents from Department if any -->
            @if (deptNotice.sharedDocs && deptNotice.sharedDocs.length > 0) {
              <div class="space-y-1.5 text-xs">
                <span class="text-slate-600 block text-[11px] font-semibold">Supporting Documents:</span>
                <ul class="m-0 p-0 list-none border border-slate-200 rounded-md divide-y divide-slate-200 bg-white">
                  @for (doc of deptNotice.sharedDocs; track doc.fileName) {
                    <li class="flex items-center justify-between gap-3 px-3 py-1.5">
                      <span class="min-w-0 truncate">
                        <span class="font-medium text-slate-800">{{ doc.title }}</span>
                        <span class="text-[11px] text-slate-500"> &bull; {{ doc.fileName }} ({{ doc.fileSize }})</span>
                      </span>
                      <button
                        appButton
                        variant="ghost"
                        size="sm"
                        type="button"
                        (click)="viewDoc.emit({ fileName: doc.fileName, title: doc.title, fileSize: doc.fileSize })"
                        class="shrink-0"
                      >
                        View
                      </button>
                    </li>
                  }
                </ul>
              </div>
            }

            <!-- If applicant already submitted a reply to this appeal response -->
            @if (deptNotice.response; as reply) {
              <div class="mt-3 p-3 bg-white rounded-lg border border-sky-200 space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-slate-900">Your Response</span>
                  <span class="text-[11px] text-slate-500">Submitted on {{ reply.respondedOn }}</span>
                </div>
                @if (reply.remarks) {
                  <p class="m-0 text-slate-700 leading-relaxed whitespace-pre-line">{{ reply.remarks }}</p>
                }
                @if (reply.uploads && reply.uploads.length > 0) {
                  <div class="space-y-1">
                    <span class="text-[11px] font-semibold text-slate-500">Uploaded Documents:</span>
                    <div class="flex flex-wrap gap-2">
                      @for (up of reply.uploads; track up.fileName) {
                        <button
                          appButton
                          variant="outline"
                          size="sm"
                          type="button"
                          (click)="viewDoc.emit({ fileName: up.fileName, title: up.requiredDoc, fileSize: up.fileSize })"
                        >
                          <app-icon name="document" size="xs" />
                          <span>{{ up.fileName }}</span>
                          <span class="text-slate-400 text-[10.5px]">({{ up.fileSize }})</span>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        } @else if (appeal.status === 'Pending') {
          <div class="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 text-xs text-amber-900 flex items-center gap-2.5">
            <app-icon name="clock" size="sm" class="text-amber-600 shrink-0" />
            <span>Your appeal request is under review by the department scrutiny committee. Department response will appear here with remarks, date & time, and 7-day response window.</span>
          </div>
        } @else if (appeal.status === 'Rejected') {
          <div class="p-3.5 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-900 flex items-start gap-2.5">
            <app-icon name="close" size="sm" class="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong class="font-semibold block mb-0.5">Appeal Rejected:</strong>
              <span>{{ appeal.rejectionReason || 'Appeal rejected after review by the scrutiny committee.' }}</span>
            </div>
          </div>
        }
      </section>
    }
  `
})
export class TenderAppealSectionComponent {
  readonly app = input.required<SubmittedTender>();
  readonly respond = output<ShortfallRequest>();
  readonly viewDoc = output<TenderDocViewRequest>();

  readonly appealResponseNotice = computed<ShortfallRequest | null>(() => {
    const list = this.app().shortfalls || [];
    // If the application has an appeal and shortfalls, find the latest notice
    if (this.app().appeal && list.length > 0) {
      return list[list.length - 1];
    }
    // Or if appeal has deptRemarks/responseDeadline, synthesize request
    const appeal = this.app().appeal;
    if (appeal?.deptRemarks) {
      return {
        id: `SF-${this.app().appRef}-APPEAL`,
        raisedOn: appeal.decidedAt || '12-Oct-2026, 03:45 PM',
        raisedBy: 'Department Scrutiny Committee',
        dueDate: appeal.responseDeadline || '19-Oct-2026',
        remarks: appeal.deptRemarks,
        requiredDocs: [],
        sharedDocs: [],
        status: appeal.response ? 'Responded' : 'Open',
        response: appeal.response
      };
    }
    return null;
  });

  remainingDays(dueDate: string): string {
    return remainingDaysText(dueDate);
  }
}
