import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../../../shared';
import type { ApplicantAppeal, ApplicantResponse } from '../../../services/eoi-state.service';

/**
 * Appeal request card displayed on the scrutiny desk when an applicant has appealed a rejection.
 * Shows the applicant's justification, attached documents, and gives options to Accept Appeal
 * (which triggers the Raise Shortfall modal) or Reject Appeal.
 */
@Component({
  selector: 'app-scrutiny-appeal-card',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (appeal(); as appAppeal) {
      <div class="bg-white rounded-xl border border-amber-300 shadow-2xs overflow-hidden">
        <!-- Top banner / header -->
        <div class="bg-linear-to-r from-amber-50/90 via-orange-50/50 to-white px-5 py-4 border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
              <app-icon name="document" size="md" />
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-slate-900 m-0">Appeal Request</h2>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                  [class.bg-amber-100]="appAppeal.status === 'Pending'"
                  [class.text-amber-900]="appAppeal.status === 'Pending'"
                  [class.border-amber-300]="appAppeal.status === 'Pending'"
                  [class.bg-sky-50]="appAppeal.status === 'Accepted' && !!appAppeal.response"
                  [class.text-sky-800]="appAppeal.status === 'Accepted' && !!appAppeal.response"
                  [class.border-sky-200]="appAppeal.status === 'Accepted' && !!appAppeal.response"
                  [class.bg-emerald-50]="appAppeal.status === 'Accepted' && !appAppeal.response"
                  [class.text-emerald-800]="appAppeal.status === 'Accepted' && !appAppeal.response"
                  [class.border-emerald-200]="appAppeal.status === 'Accepted' && !appAppeal.response"
                  [class.bg-rose-50]="appAppeal.status === 'Rejected'"
                  [class.text-rose-800]="appAppeal.status === 'Rejected'"
                  [class.border-rose-200]="appAppeal.status === 'Rejected'"
                >
                  @if (appAppeal.status === 'Pending') {
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Appeal Pending Review
                  } @else if (appAppeal.status === 'Accepted') {
                    @if (appAppeal.response) {
                      <app-icon name="check" size="xs" />
                      Appeal Response Submitted
                    } @else {
                      <app-icon name="check" size="xs" />
                      Appeal Accepted
                    }
                  } @else {
                    <app-icon name="close" size="xs" />
                    Appeal Rejected
                  }
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5 m-0">
                Submitted on {{ appAppeal.submittedOn }} by {{ applicant()?.anonymousLabel || 'Applicant' }}
              </p>
            </div>
          </div>

          <!-- Quick Action Buttons when pending -->
          @if (appAppeal.status === 'Pending') {
            <div class="flex items-center gap-2 shrink-0">
              <button
                appButton
                variant="outline"
                size="sm"
                (click)="reject.emit()"
                class="text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-300 font-semibold"
                title="Reject applicant's appeal"
              >
                <app-icon name="close" size="xs" />
                <span>Reject Appeal</span>
              </button>
              <button
                appButton
                size="sm"
                (click)="accept.emit()"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs"
                title="Accept appeal and raise shortfall notice"
              >
                <app-icon name="check" size="xs" />
                <span>Accept Appeal</span>
              </button>
            </div>
          }
        </div>

        <!-- Body content -->
        <div class="p-5 sm:p-6 space-y-4 text-xs">
          <!-- Rejection grounds if available -->
          @if (rejectionReason()) {
            <div class="bg-rose-50/70 border border-rose-200/80 rounded-lg p-3.5 space-y-1">
              <span class="text-[11px] font-bold text-rose-800 uppercase tracking-wide flex items-center gap-1.5">
                <app-icon name="alert-triangle" size="xs" />
                Original Disqualification / Rejection Reason
              </span>
              <p class="m-0 text-slate-800 leading-relaxed font-medium">
                {{ rejectionReason() }}
              </p>
            </div>
          }

          <!-- Applicant's remarks -->
          <div class="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 space-y-1">
            <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
              Applicant's Appeal Remarks
            </span>
            <p class="m-0 text-slate-800 leading-relaxed whitespace-pre-line text-[12.5px] font-medium">
              {{ appAppeal.reply }}
            </p>
          </div>

          <!-- Outcome Notice & Resubmitted Documents -->
          @if (appAppeal.status === 'Accepted') {
            @if (appAppeal.response; as res) {
              <div class="bg-sky-50/70 border border-sky-300 rounded-xl p-4 space-y-3">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs">✓</span>
                    <span class="font-bold text-xs text-navy">Applicant's Appeal Response Documents Submitted</span>
                  </div>
                  <span class="text-[11px] text-slate-500 font-medium">Submitted on {{ res.respondedOn }}</span>
                </div>

                @if (res.remarks) {
                  <div class="bg-white border border-sky-200 rounded-lg p-3 text-xs">
                    <span class="text-[11px] font-semibold text-slate-600 block mb-1">Applicant Remarks:</span>
                    <p class="m-0 text-slate-800 leading-relaxed font-medium">{{ res.remarks }}</p>
                  </div>
                }

                @if (res.uploads && res.uploads.length > 0) {
                  <div class="space-y-2">
                    <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                      Uploaded Documents ({{ res.uploads.length }})
                    </span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      @for (up of res.uploads; track up.fileName) {
                        <div class="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-sky-300 transition-colors shadow-2xs">
                          <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-7 h-7 rounded bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0 font-bold text-[10px]">
                              PDF
                            </div>
                            <div class="min-w-0">
                              <span class="text-xs font-semibold text-slate-900 block truncate" [title]="up.requiredDoc">
                                {{ up.requiredDoc }}
                              </span>
                              <span class="text-[11px] text-slate-500 block truncate">{{ up.fileName }} &bull; {{ up.fileSize }}</span>
                            </div>
                          </div>
                          <button
                            appButton
                            variant="ghost"
                            size="sm"
                            type="button"
                            (click)="viewFile.emit({ title: up.requiredDoc, fileName: up.fileName, fileSize: up.fileSize })"
                            class="text-navy hover:text-sky-700 hover:bg-sky-50 shrink-0"
                          >
                            <span>View</span>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }

                <div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <app-icon name="check" size="xs" class="text-emerald-700 shrink-0" />
                  <span>Applicant has submitted the requested documents. Review them above and take final action using the <strong>Approve</strong> or <strong>Reject</strong> buttons above.</span>
                </div>
              </div>
            } @else {
              <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-2.5 text-emerald-900">
                <app-icon name="check" size="sm" class="text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <span class="font-bold text-xs block">Appeal Accepted</span>
                  <p class="text-xs text-emerald-800 mt-0.5 m-0 leading-relaxed">
                    The department accepted this appeal. The applicant has been notified on their EOI Status portal under "Appeal Response" to submit the requested documents.
                  </p>
                </div>
              </div>
            }
          } @else if (appAppeal.status === 'Rejected') {
            <div class="bg-rose-50 border border-rose-200 rounded-lg p-3.5 flex items-start gap-2.5 text-rose-900">
              <app-icon name="close" size="sm" class="text-rose-700 mt-0.5 shrink-0" />
              <div>
                <span class="font-bold text-xs block">Appeal Rejected</span>
                <p class="text-xs text-rose-800 mt-0.5 m-0 leading-relaxed">
                  {{ appAppeal.decisionRemarks || 'The appeal was reviewed by the scrutiny committee and rejected.' }}
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class ScrutinyAppealCardComponent {
  readonly appeal = input<ApplicantAppeal | undefined>();
  readonly applicant = input<ApplicantResponse | undefined>();
  readonly rejectionReason = input<string | undefined>();

  readonly accept = output<void>();
  readonly reject = output<void>();
  readonly viewFile = output<{ title: string; fileName: string; fileSize?: string }>();
}
