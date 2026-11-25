import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { SubmittedTender } from '../../../core/models/tender.model';
import { ButtonComponent, IconComponent } from '../../../shared';
import { TenderDocViewRequest } from './tender-doc-card.component';
import { canAppeal, getAppealDeadline, remainingDaysText } from './tender-appeal.util';

/**
 * Appeal Request & Department Response section:
 * 1. Remarks why the application was rejected or approved.
 * 2. 7-day window for the applicant to submit appeal justification (text-only, no upload documents).
 *    Apply appeal button is available for 7 days only.
 * 3. Department decision / approval tracking.
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
            <p class="text-[11.5px] text-slate-500 m-0">Review decision grounds, submit appeal within the 7-day window, and track department decision</p>
          </div>
        </div>

        <div>
          @if (isRejected()) {
            @if (app().appeal?.status === 'Accepted') {
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
              @if (app().submittedStatus === 'Rejected') {
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  7 Days to Appeal ({{ remainingDays(appealDueDate()) }})
                </span>
              } @else {
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <app-icon name="check" size="xs" class="mr-1 text-emerald-700" />
                  Appeal Option Available ({{ remainingDays(appealDueDate()) }})
                </span>
              }
            } @else if (!app().appeal) {
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Appeal Window Closed
              </span>
            } @else if (app().submittedStatus === 'Approved' || app().submittedStatus === 'Accepted') {
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <app-icon name="check" size="xs" class="mr-1 text-emerald-700" />
                Application Approved
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

          <!-- 1. DECISION GROUNDS & 7-DAY APPEAL WINDOW INFO -->
          @if (app().submittedStatus === 'Rejected') {
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
                      <span>Appeal Window: <strong class="text-rose-700">7 Days from Decision</strong></span>
                      <span class="text-slate-400">&bull;</span>
                      <span>Deadline: <strong class="text-slate-900">{{ appealDueDate() }}</strong></span>
                    </div>
                    <span class="text-[11px] text-slate-500 block">
                      The apply appeal button stays active for 7 days only from decision. No document upload is required.
                    </span>
                  </div>
                </div>

                <span
                  class="px-2.5 py-1 rounded-full text-xs font-bold border"
                  [class.bg-amber-100]="canAppeal(app())"
                  [class.text-amber-900]="canAppeal(app())"
                  [class.border-amber-300]="canAppeal(app())"
                  [class.bg-slate-100]="!canAppeal(app())"
                  [class.text-slate-600]="!canAppeal(app())"
                  [class.border-slate-300]="!canAppeal(app())"
                >
                  {{ remainingDays(appealDueDate()) }}
                </span>
              </div>
            </div>
          } @else {
            <div class="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 space-y-3 shadow-2xs">
              <div class="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-emerald-200/80">
                <div class="flex items-center gap-2">
                  <app-icon name="check" size="sm" class="text-emerald-700" />
                  <h3 class="m-0 text-xs font-bold text-emerald-950 uppercase tracking-wider">Application Approved</h3>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Proposal Approved
                </span>
              </div>

              <div class="space-y-1.5">
                <span class="text-[11px] font-bold text-emerald-900 uppercase tracking-wide block">Approval Remarks & Status:</span>
                <p class="m-0 text-xs text-emerald-950 leading-relaxed whitespace-pre-line bg-white/95 p-3.5 rounded-lg border border-emerald-200 font-medium">
                  {{ app().scrutinyRemarks || 'Application proposal meets technical qualification and eligibility criteria.' }}
                </p>
              </div>

              <!-- 7-Day Window Info -->
              <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white/90 border border-emerald-200">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <app-icon name="clock" size="xs" />
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span>Appeal Option: <strong class="text-emerald-700">7 Days from Approval</strong></span>
                      <span class="text-slate-400">&bull;</span>
                      <span>Deadline: <strong class="text-slate-900">{{ appealDueDate() }}</strong></span>
                    </div>
                    <span class="text-[11px] text-slate-500 block">
                      Appeals on approved proposals can be submitted within 7 days for targets, terms, or committee remarks.
                    </span>
                  </div>
                </div>

                <span
                  class="px-2.5 py-1 rounded-full text-xs font-bold border"
                  [class.bg-emerald-100]="canAppeal(app())"
                  [class.text-emerald-900]="canAppeal(app())"
                  [class.border-emerald-300]="canAppeal(app())"
                  [class.bg-slate-100]="!canAppeal(app())"
                  [class.text-slate-600]="!canAppeal(app())"
                  [class.border-slate-300]="!canAppeal(app())"
                >
                  {{ remainingDays(appealDueDate()) }}
                </span>
              </div>
            </div>
          }

          <!-- 2. APPEAL ACTION / SUBMISSION / EXPIRED STATUS -->
          @if (canAppeal(app())) {
            <!-- APPLICANT WITHIN 7-DAY WINDOW (BUTTON ACTIVE) -->
            <div class="rounded-xl border border-amber-300 bg-linear-to-r from-amber-50/90 via-orange-50/40 to-amber-50/60 p-4 sm:p-5 space-y-3.5 shadow-2xs">
              <div class="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-amber-200/80">
                <div class="flex items-center gap-2">
                  <app-icon name="document" size="sm" class="text-amber-700" />
                  <h3 class="m-0 text-xs font-bold text-amber-950 uppercase tracking-wider">
                    {{ app().submittedStatus === 'Rejected' ? 'Submit Appeal Justification' : 'Appeal Approved Terms & Remarks' }}
                  </h3>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  {{ remainingDays(appealDueDate()) }}
                </span>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 p-4 rounded-lg border border-amber-200">
                <div class="space-y-1 max-w-xl">
                  <h4 class="m-0 text-xs font-bold text-slate-900">
                    {{ app().submittedStatus === 'Rejected' ? 'Submit Your Appeal Remarks' : 'Submit Appeal on Approved Proposal & Terms' }}
                  </h4>
                  <p class="m-0 text-xs text-slate-600 leading-relaxed">
                    {{ app().submittedStatus === 'Rejected'
                      ? 'Enter your justification remarks in the appeal form. No document upload is required; the department scrutiny committee will review your justification directly.'
                      : 'Provide your appeal explanation or requested adjustments regarding approved terms, allocated targets, sectors, or conditional remarks.' }}
                  </p>
                  <p class="m-0 text-[11px] text-amber-800 font-semibold pt-0.5">
                    &bull; Note: The apply appeal button stays for 7 days only from decision date. Exactly one appeal is permitted per application.
                  </p>
                </div>
                <button appButton size="sm" type="button" (click)="requestAppeal.emit(app())" class="shrink-0 font-semibold" title="Appeal Request">
                  <span>Appeal Request</span>
                </button>
              </div>
            </div>
          } @else if (!app().appeal) {
            <!-- 7-DAY APPEAL WINDOW EXPIRED (BUTTON GONE) -->
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-2 shadow-2xs">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
                <app-icon name="clock" size="sm" class="text-slate-500" />
                <h3 class="m-0 text-xs font-bold text-slate-800 uppercase tracking-wider">Appeal Window Closed</h3>
              </div>
              <p class="m-0 text-xs text-slate-600 leading-relaxed">
                The 7-day period to submit an appeal expired on <strong class="text-slate-800">{{ appealDueDate() }}</strong>. The appeal request button is no longer available.
              </p>
            </div>
          } @else if (app().appeal; as appeal) {
            <!-- APPLICANT HAS SUBMITTED APPEAL -->
            <div class="rounded-xl border border-sky-200 bg-sky-50/30 p-4 sm:p-5 space-y-3.5 shadow-2xs">
              <div class="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-sky-100">
                <div class="flex items-center gap-2">
                  <app-icon name="check" size="sm" class="text-sky-700" />
                  <div>
                    <h3 class="m-0 text-xs font-bold text-slate-900 uppercase tracking-wider">Your Submitted Appeal Remarks</h3>
                    <span class="text-[11px] text-slate-500">Submitted on {{ appeal.submittedOn }}</span>
                  </div>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                  Appeal Submitted
                </span>
              </div>

              <!-- Remarks (Text only) -->
              <div class="space-y-1.5 text-xs">
                <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">Your Remarks / Justification:</span>
                <p class="m-0 text-slate-900 text-xs leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-lg border border-slate-200 font-medium">
                  {{ appeal.reply }}
                </p>
              </div>
            </div>

            <!-- 3. DEPARTMENT APPROVAL / DECISION STATUS -->
            @if (app().submittedStatus === 'Approved' || appeal.status === 'Accepted') {
              <div class="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 space-y-2 shadow-2xs">
                <div class="flex items-center gap-2 pb-2 border-b border-emerald-200">
                  <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                  <h3 class="m-0 text-xs font-bold text-emerald-950 uppercase tracking-wider">Appeal Approved by Department</h3>
                </div>
                <p class="m-0 text-xs text-emerald-900 leading-relaxed font-medium">
                  The Department Scrutiny Committee has reviewed your appeal justification and approved your request.
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
                  Your appeal remarks have been submitted to the Department Scrutiny Committee. Once reviewed, the final approval or rejection decision will appear here.
                </p>
              </div>
            }
          }

        </div>
      } @else {
        <!-- APPLICATION NOT ELIGIBLE FOR APPEAL -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <app-icon name="info-circle" size="md" class="text-slate-600" />
          </div>
          <div class="space-y-1 max-w-lg mx-auto">
            <h3 class="text-sm font-bold text-slate-900 m-0">No Appeal Available</h3>
            <p class="text-xs text-slate-600 leading-relaxed m-0">
              This application is currently in 
              <strong class="font-semibold text-slate-800">{{ app().submittedStatus }}</strong> status. 
              Appeals can be submitted for applications with Rejected or Approved status within 7 days of decision.
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

  protected readonly isEligibleForAppeal = computed(() =>
    this.app().submittedStatus === 'Rejected' ||
    this.app().submittedStatus === 'Approved' ||
    this.app().submittedStatus === 'Accepted' ||
    !!this.app().appeal
  );
  protected readonly isRejected = this.isEligibleForAppeal;

  protected readonly appealDueDate = computed(() => getAppealDeadline(this.app()));

  remainingDays(dueDate: string): string {
    return remainingDaysText(dueDate);
  }
}
