import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { SubmittedTender } from '../../../core/models/tender.model';
import { ButtonComponent, IconComponent } from '../../../shared';
import { TenderDocViewRequest } from './tender-doc-card.component';
import { canAppeal, remainingDaysText } from './tender-appeal.util';

/**
 * Appeal Request & Department Response section:
 * 1. Remarks why the application was rejected.
 * 2. 7-day window for the applicant to appeal and respond with proper documents.
 * 3. Department approval / review decision.
 */
@Component({
  selector: 'app-tender-appeal-section',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5" aria-labelledby="appeal-heading">

      <!-- Section Header -->
      <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">6</span>
          <div>
            <h2 id="appeal-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Appeal Request & Department Response</h2>
            <p class="text-[11.5px] text-slate-500 m-0">Review rejection grounds, submit appeal with proper documents, and track department approval</p>
          </div>
        </div>

        <div>
          @if (isRejected()) {
            @if (app().submittedStatus === 'Approved' || app().appeal?.status === 'Accepted') {
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <app-icon name="check" size="xs" class="mr-1 text-emerald-700" />
                Appeal Approved
              </span>
            } @else if (app().appeal?.status === 'Rejected') {
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                Appeal Rejected
              </span>
            } @else if (app().appeal?.status === 'Pending') {
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" aria-hidden="true"></span>
                Appeal Under Review
              </span>
            } @else if (canAppeal(app())) {
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                7 Days to Appeal & Respond
              </span>
            }
          } @else {
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Status: {{ app().submittedStatus }}
            </span>
          }
        </div>
      </div>

      @if (isRejected()) {
        <div class="space-y-4">

          <!-- 1. FIRST: REJECTION REMARKS & 7-DAY APPEAL WINDOW -->
          <div class="rounded-xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 space-y-3 shadow-2xs">
            <div class="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-rose-200/80">
              <div class="flex items-center gap-2">
                <app-icon name="alert-triangle" size="sm" class="text-rose-600" />
                <h3 class="m-0 text-xs font-bold text-rose-950 uppercase tracking-wider">Rejection Remarks</h3>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                Application Rejected
              </span>
            </div>

            <div class="space-y-1.5">
              <span class="text-[11px] font-bold text-rose-900 uppercase tracking-wide block">Reason for Rejection:</span>
              <p class="m-0 text-xs text-rose-950 leading-relaxed whitespace-pre-line bg-white/95 p-3.5 rounded-lg border border-rose-200 font-medium">
                {{ app().rejectionReason || 'Technical qualification criteria not met.' }}
              </p>
            </div>

            <!-- 7-Day Window Info -->
            <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white/90 border border-rose-200">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <app-icon name="clock" size="xs" />
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>Appeal Window: <strong class="text-rose-700">7 Days</strong></span>
                    <span class="text-slate-400">&bull;</span>
                    <span>Deadline: <strong class="text-slate-900">{{ appealDueDate() }}</strong></span>
                  </div>
                  <span class="text-[11px] text-slate-500 block">
                    You have 7 days from the date of rejection to submit an appeal and respond with proper supporting documents.
                  </span>
                </div>
              </div>

              @if (canAppeal(app())) {
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {{ remainingDays(appealDueDate()) }}
                </span>
              }
            </div>
          </div>

          <!-- 2. APPEAL AND RESPOND WITH PROPER DOCUMENTS -->
          @if (canAppeal(app())) {
            <!-- APPLICANT HAS NOT YET APPEALED -->
            <div class="rounded-xl border border-amber-300 bg-linear-to-r from-amber-50/90 via-orange-50/40 to-amber-50/60 p-4 sm:p-5 space-y-3.5 shadow-2xs">
              <div class="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-amber-200/80">
                <div class="flex items-center gap-2">
                  <app-icon name="document" size="sm" class="text-amber-700" />
                  <h3 class="m-0 text-xs font-bold text-amber-950 uppercase tracking-wider">Appeal & Respond with Documents</h3>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  Action Required
                </span>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 p-4 rounded-lg border border-amber-200">
                <div class="space-y-1 max-w-xl">
                  <h4 class="m-0 text-xs font-bold text-slate-900">Submit Your Appeal & Upload Supporting Documents</h4>
                  <p class="m-0 text-xs text-slate-600 leading-relaxed">
                    Provide your justification remarks and attach the proper supporting documents (e.g. valid CA certificate, UDIN proof, registration papers) for department reconsideration.
                  </p>
                  <p class="m-0 text-[11px] text-amber-800 font-semibold pt-0.5">
                    &bull; Note: Exactly one appeal is permitted per application. The department will review and approve or reject your appeal.
                  </p>
                </div>
                <button appButton size="sm" type="button" (click)="requestAppeal.emit(app())" class="shrink-0 font-semibold" title="Appeal Request">
                  <span>Appeal Request</span>
                </button>
              </div>
            </div>
          } @else if (app().appeal; as appeal) {
            <!-- APPLICANT HAS SUBMITTED APPEAL AND DOCUMENTS -->
            <div class="rounded-xl border border-sky-200 bg-sky-50/30 p-4 sm:p-5 space-y-3.5 shadow-2xs">
              <div class="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-sky-100">
                <div class="flex items-center gap-2">
                  <app-icon name="check" size="sm" class="text-sky-700" />
                  <div>
                    <h3 class="m-0 text-xs font-bold text-slate-900 uppercase tracking-wider">Your Submitted Appeal & Documents</h3>
                    <span class="text-[11px] text-slate-500">Submitted on {{ appeal.submittedOn }}</span>
                  </div>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                  Appeal Submitted
                </span>
              </div>

              <!-- Remarks -->
              <div class="space-y-1.5 text-xs">
                <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">Your Remarks / Justification:</span>
                <p class="m-0 text-slate-900 text-xs leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-lg border border-slate-200 font-medium">
                  {{ appeal.reply }}
                </p>
              </div>

              <!-- Uploaded Supporting Documents -->
              @if (appeal.files && appeal.files.length > 0) {
                <div class="space-y-1.5 text-xs pt-1">
                  <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                    Uploaded Supporting Documents ({{ appeal.files.length }}):
                  </span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    @for (file of appeal.files; track file.fileName) {
                      <div class="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-sky-300 transition-colors shadow-2xs">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <app-icon name="pdf-badge" solid size="auto" class="w-5 h-5 text-[#E5252A] select-none shrink-0" />
                          <div class="min-w-0">
                            <span class="text-xs font-medium text-slate-900 block truncate" [title]="file.fileName">
                              {{ file.fileName }}
                            </span>
                            <span class="text-[10.5px] text-slate-500 block">{{ file.fileSize }}</span>
                          </div>
                        </div>
                        <button
                          appButton
                          variant="ghost"
                          size="sm"
                          type="button"
                          (click)="viewDoc.emit({ fileName: file.fileName, title: 'Appeal Document', fileSize: file.fileSize })"
                          class="shrink-0"
                          title="View Document"
                          aria-label="View Document"
                        >
                          View
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- 3. DEPARTMENT APPROVAL / DECISION STATUS -->
            @if (app().submittedStatus === 'Approved' || appeal.status === 'Accepted') {
              <div class="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 space-y-2 shadow-2xs">
                <div class="flex items-center gap-2 pb-2 border-b border-emerald-200">
                  <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                  <h3 class="m-0 text-xs font-bold text-emerald-950 uppercase tracking-wider">Appeal Approved by Department</h3>
                </div>
                <p class="m-0 text-xs text-emerald-900 leading-relaxed font-medium">
                  The Department Scrutiny Committee has reviewed your appeal justification and uploaded supporting documents and approved your application.
                </p>
                @if (appeal.deptRemarks) {
                  <p class="m-0 text-xs text-emerald-950 bg-white/90 p-3 rounded-lg border border-emerald-200 font-medium">
                    {{ appeal.deptRemarks }}
                  </p>
                }
              </div>
            } @else if (appeal.status === 'Rejected') {
              <div class="rounded-xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 space-y-2 shadow-2xs">
                <div class="flex items-center gap-2 pb-2 border-b border-rose-200">
                  <app-icon name="close" size="sm" class="text-rose-600" />
                  <h3 class="m-0 text-xs font-bold text-rose-950 uppercase tracking-wider">Appeal Rejected by Department</h3>
                </div>
                <p class="m-0 text-xs text-rose-900 leading-relaxed font-medium">
                  {{ appeal.rejectionReason || appeal.deptRemarks || 'Appeal reviewed and rejected by the scrutiny committee.' }}
                </p>
                <p class="m-0 text-[11px] text-slate-500 pt-1">
                  Only one appeal is permitted per application. The decision of the scrutiny committee is final.
                </p>
              </div>
            } @else {
              <!-- Pending Review -->
              <div class="rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5 space-y-2 shadow-2xs">
                <div class="flex items-center gap-2 pb-2 border-b border-amber-200/80">
                  <app-icon name="clock" size="sm" class="text-amber-600" />
                  <h3 class="m-0 text-xs font-bold text-amber-950 uppercase tracking-wider">Under Department Scrutiny Review</h3>
                </div>
                <p class="m-0 text-xs text-amber-900 leading-relaxed">
                  Your appeal and supporting documents have been submitted to the Department Scrutiny Committee. Once reviewed, the final approval or rejection decision will appear here.
                </p>
              </div>
            }
          }

        </div>
      } @else {
        <!-- APPLICATION IS NOT REJECTED -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <app-icon name="info-circle" size="md" class="text-slate-600" />
          </div>
          <div class="space-y-1 max-w-lg mx-auto">
            <h3 class="text-sm font-bold text-slate-900 m-0">No Appeal Required</h3>
            <p class="text-xs text-slate-600 leading-relaxed m-0">
              This application is currently in 
              <strong class="font-semibold text-slate-800">{{ app().submittedStatus }}</strong> status. 
              Appeals are only applicable if an application is rejected during departmental scrutiny.
            </p>
          </div>
        </div>
      }

    </section>
  `
})
export class TenderAppealSectionComponent {
  readonly app = input.required<SubmittedTender>();
  readonly requestAppeal = output<SubmittedTender>();
  readonly viewDoc = output<TenderDocViewRequest>();

  protected readonly canAppeal = canAppeal;

  protected readonly isRejected = computed(() => this.app().submittedStatus === 'Rejected' || !!this.app().appeal);

  protected readonly appealDueDate = computed(() => {
    const appeal = this.app().appeal;
    if (appeal?.responseDeadline) return appeal.responseDeadline;
    const shortfalls = this.app().shortfalls;
    if (shortfalls && shortfalls.length > 0 && shortfalls[0].dueDate) {
      return shortfalls[0].dueDate;
    }
    // Default 7 days from applied or current date
    return '19-Oct-2026';
  });

  remainingDays(dueDate: string): string {
    return remainingDaysText(dueDate);
  }
}
