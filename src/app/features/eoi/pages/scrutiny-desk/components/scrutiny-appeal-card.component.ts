import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../../../shared';
import type { AppealHistoryItem, ApplicantAppeal, ApplicantResponse } from '../../../services/eoi-state.models';

const DEFAULT_COMPANY_1_APPEAL_HISTORY: AppealHistoryItem[] = [
  {
    id: 'app-hist-1',
    timestamp: '08/09/2026 05:30 PM',
    actor: 'Sh. Manoj Verma',
    actorRole: 'Department Scrutiny Officer, RSLDC',
    action: 'DISQUALIFIED',
    title: 'Initial Scrutiny & Technical Disqualification',
    remarks: 'Disqualification recorded during technical scrutiny: CA turnover certificate for FY 2023-24 & FY 2022-23 did not carry valid Unique Document Identification Number (UDIN) verification as required under EOI Clause 4.2.',
    badgeLabel: 'Disqualified',
    badgeVariant: 'danger'
  },
  {
    id: 'app-hist-2',
    timestamp: '10/10/2026 11:15 AM',
    actor: 'Mr. Rajesh Kumar',
    actorRole: 'Authorized Signatory, Company 1',
    action: 'APPEAL_FILED',
    title: 'Statutory Appeal Filed by Applicant',
    remarks: 'We have re-verified with our chartered accountant and obtained a newly generated CA turnover certificate with valid UDIN (UDIN: 26048192AAAAA1234). The statutory minimum turnover of Rs. 5.00 Cr is fully satisfied. We respectfully request the committee to reconsider our qualification and empanelment.',
    badgeLabel: 'Appeal Filed with Proofs',
    badgeVariant: 'warning',
    files: [
      { fileName: 'CA_Turnover_Certificate_UDIN_Verified.pdf', fileSize: '1.8 MB PDF' },
      { fileName: 'Chartered_Accountant_Affidavit_Form_IV.pdf', fileSize: '640 KB PDF' }
    ],
    meta: {
      udin: '26048192AAAAA1234'
    }
  },
  {
    id: 'app-hist-3',
    timestamp: '18/10/2026 03:20 PM',
    actor: 'Smt. Neha Sharma',
    actorRole: 'Deputy Director (Operations), RSLDC',
    action: 'DESK_VERIFIED',
    title: 'Scrutiny Desk Re-appraisal & Verification',
    remarks: 'Fresh CA certificate UDIN 26048192AAAAA1234 cross-verified on ICAI portal and found authentic. Statutory net worth & turnover of Rs. 12.03 Cr confirmed compliant with EOI guidelines. Admitted for State Empanelment Committee final determination.',
    badgeLabel: 'Desk Verified & Admitted',
    badgeVariant: 'info'
  },
  {
    id: 'app-hist-4',
    timestamp: '24/11/2026 02:10 PM',
    actor: 'State Empanelment Committee',
    actorRole: 'Empanelment Committee (Chairperson: MD, RSLDC)',
    action: 'DECISION_APPROVED',
    title: 'Committee Hearing & Appeal Approval',
    remarks: 'The State Empanelment Committee reviewed the applicant appeal remarks along with the verified UDIN certificate and de-novo assessment report. The initial disqualification is set aside. The applicant Company 1 is officially approved and empaneled under MMKVY Category III SAMARTH scheme for FY 2026-2027.',
    badgeLabel: 'Appeal Approved & Qualified',
    badgeVariant: 'success',
    meta: {
      grade: 'Grade A+',
      marks: '88 / 100',
      refNo: 'RSLDC/EOI/2026/MMKVY-01/EMP-01'
    }
  }
];

@Component({
  selector: 'app-scrutiny-appeal-card',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-6' },
  template: `
    @if (appeal(); as appAppeal) {
      <!-- Top Section: Clean Header (No Box Border) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
              [class.bg-amber-50]="appAppeal.status === 'Pending'"
              [class.text-amber-800]="appAppeal.status === 'Pending'"
              [class.border-amber-300]="appAppeal.status === 'Pending'"
              [class.bg-emerald-50]="appAppeal.status === 'Accepted'"
              [class.text-emerald-800]="appAppeal.status === 'Accepted'"
              [class.border-emerald-200]="appAppeal.status === 'Accepted'"
              [class.bg-rose-50]="appAppeal.status === 'Rejected'"
              [class.text-rose-800]="appAppeal.status === 'Rejected'"
              [class.border-rose-200]="appAppeal.status === 'Rejected'"
            >
              @if (appAppeal.status === 'Pending') {
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Appeal Pending Committee Review</span>
              } @else if (appAppeal.status === 'Accepted') {
                <app-icon name="check" size="xs" class="text-emerald-700" />
                <span>Appeal Approved &amp; Qualified</span>
              } @else {
                <app-icon name="close" size="xs" class="text-rose-700" />
                <span>Appeal Rejected</span>
              }
            </span>

            @if (appAppeal.status === 'Accepted') {
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Grade A+ &bull; Technical Qualification Restored
              </span>
            }
          </div>
          <p class="text-xs text-slate-500 mt-1.5 m-0 font-medium">
            Submitted by <strong class="text-slate-800">{{ applicant()?.anonymousLabel || 'Applicant' }}</strong> &bull; EOI Ref: {{ applicant()?.eoiRefNo }}
          </p>
        </div>

        <!-- Quick Action Buttons when pending review -->
        @if (appAppeal.status === 'Pending') {
          <div class="flex items-center gap-2.5 shrink-0">
            <button
              appButton
              variant="outline"
              size="sm"
              (click)="reject.emit()"
              title="Reject applicant appeal"
            >
              <app-icon name="close" size="xs" />
              <span>Reject Appeal</span>
            </button>
            <button
              appButton
              variant="primary"
              size="sm"
              (click)="accept.emit()"
              title="Approve applicant appeal and application"
            >
              <app-icon name="check" size="xs" />
              <span>Approve Appeal</span>
            </button>
          </div>
        }
      </div>

      <!-- Appeal Summary Grid (Clean Key-Value, No Nested Background Boxes) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 text-xs pb-5 border-b border-slate-100">
        <div>
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Appeal Status</span>
          <span class="text-sm font-bold block" [class.text-emerald-700]="appAppeal.status === 'Accepted'" [class.text-amber-700]="appAppeal.status === 'Pending'" [class.text-rose-700]="appAppeal.status === 'Rejected'">
            {{ appAppeal.status === 'Accepted' ? 'Approved & Empaneled' : (appAppeal.status === 'Rejected' ? 'Rejected' : 'Under Review') }}
          </span>
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Petition Date</span>
          <span class="text-sm font-semibold text-slate-900 block tabular-nums">{{ appAppeal.submittedOn || '10/10/2026' }}</span>
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Appraised Grade</span>
          <span class="text-sm font-bold text-slate-900 block">{{ appAppeal.status === 'Accepted' ? 'Grade A+ (88/100)' : 'Under Evaluation' }}</span>
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Competent Authority</span>
          <span class="text-sm font-semibold text-slate-900 block">State Empanelment Committee</span>
        </div>
      </div>

      <!-- Comprehensive Audit History & Action Log Timeline -->
      <div class="space-y-4 pt-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
            <app-icon name="clock" size="sm" class="text-primary" />
            <span>Complete Appeal Lifecycle &amp; Audit Trail</span>
          </h3>
          <span class="text-xs font-medium text-slate-500">
            {{ appealHistory().length }} Recorded Actions
          </span>
        </div>

        <div class="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          @for (log of appealHistory(); track log.id; let idx = $index; let isLast = $last) {
            <div class="relative group">
              <!-- Timeline Icon Dot -->
              <div
                class="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center text-[10px] font-bold shadow-xs transition-colors"
                [class.border-rose-500]="log.badgeVariant === 'danger'"
                [class.text-rose-600]="log.badgeVariant === 'danger'"
                [class.border-amber-500]="log.badgeVariant === 'warning'"
                [class.text-amber-600]="log.badgeVariant === 'warning'"
                [class.border-blue-500]="log.badgeVariant === 'info'"
                [class.text-blue-600]="log.badgeVariant === 'info'"
                [class.border-emerald-500]="log.badgeVariant === 'success'"
                [class.text-emerald-600]="log.badgeVariant === 'success'"
              >
                @if (log.badgeVariant === 'success') {
                  <app-icon name="check" size="xs" />
                } @else if (log.badgeVariant === 'danger') {
                  <app-icon name="close" size="xs" />
                } @else if (log.badgeVariant === 'info') {
                  <app-icon name="info" size="xs" />
                } @else {
                  <app-icon name="document" size="xs" />
                }
              </div>

              <!-- Log Item Body (Clean Presentation) -->
              <div class="space-y-2">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="text-sm font-bold text-slate-900 m-0">{{ log.title }}</h4>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border"
                      [class.bg-rose-50]="log.badgeVariant === 'danger'"
                      [class.text-rose-700]="log.badgeVariant === 'danger'"
                      [class.border-rose-200]="log.badgeVariant === 'danger'"
                      [class.bg-amber-50]="log.badgeVariant === 'warning'"
                      [class.text-amber-800]="log.badgeVariant === 'warning'"
                      [class.border-amber-200]="log.badgeVariant === 'warning'"
                      [class.bg-blue-50]="log.badgeVariant === 'info'"
                      [class.text-blue-700]="log.badgeVariant === 'info'"
                      [class.border-blue-200]="log.badgeVariant === 'info'"
                      [class.bg-emerald-50]="log.badgeVariant === 'success'"
                      [class.text-emerald-800]="log.badgeVariant === 'success'"
                      [class.border-emerald-200]="log.badgeVariant === 'success'"
                    >
                      {{ log.badgeLabel }}
                    </span>
                  </div>

                  <span class="text-xs font-semibold text-slate-500 tabular-nums shrink-0">
                    {{ log.timestamp }}
                  </span>
                </div>

                <!-- Actor Info -->
                <div class="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <span class="font-bold text-slate-900">{{ log.actor }}</span>
                  <span class="text-slate-400">&bull;</span>
                  <span>{{ log.actorRole }}</span>
                </div>

                <!-- Remarks Text -->
                <p class="text-xs sm:text-[13px] text-slate-800 leading-relaxed m-0 font-normal">
                  {{ log.remarks }}
                </p>

                <!-- Attached Files if any -->
                @if (log.files && log.files.length > 0) {
                  <div class="pt-1.5 space-y-1.5">
                    <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Attached Evidentiary Documents:</span>
                    <div class="flex flex-wrap gap-2">
                      @for (f of log.files; track f.fileName) {
                        <button
                          appButton
                          variant="outline"
                          size="xs"
                          type="button"
                          (click)="viewFile.emit({ title: f.fileName, fileName: f.fileName, fileSize: f.fileSize })"
                        >
                          <app-icon name="document" size="xs" />
                          <span>{{ f.fileName }}</span>
                          <span class="text-slate-400 font-normal">({{ f.fileSize || 'PDF' }})</span>
                          <app-icon name="eye" size="xs" />
                        </button>
                      }
                    </div>
                  </div>
                }

                <!-- Metadata pills if any -->
                @if (log.meta) {
                  <div class="flex items-center gap-2 pt-1 flex-wrap text-xs">
                    @if (log.meta.grade) {
                      <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                        Assigned: {{ log.meta.grade }}
                      </span>
                    }
                    @if (log.meta.marks) {
                      <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">
                        Score: {{ log.meta.marks }}
                      </span>
                    }
                    @if (log.meta.udin) {
                      <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-semibold text-[11px]">
                        UDIN: {{ log.meta.udin }}
                      </span>
                    }
                  </div>
                }
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

  protected readonly appealHistory = computed<AppealHistoryItem[]>(() => {
    const app = this.applicant();
    const ap = this.appeal();
    if (!ap) return [];

    if (ap.history && ap.history.length > 0) {
      return ap.history;
    }

    // Default rich audit log for presentation
    return DEFAULT_COMPANY_1_APPEAL_HISTORY.map(item => {
      if (item.action === 'DISQUALIFIED' && this.rejectionReason()) {
        return { ...item, remarks: this.rejectionReason()! };
      }
      if (item.action === 'APPEAL_FILED') {
        return {
          ...item,
          timestamp: ap.submittedOn || item.timestamp,
          remarks: ap.reply || item.remarks,
          files: ap.files && ap.files.length > 0 ? ap.files : item.files
        };
      }
      if (item.action === 'DECISION_APPROVED' || item.action === 'DECISION_REJECTED') {
        const isAccepted = ap.status === 'Accepted';
        return {
          ...item,
          action: isAccepted ? 'DECISION_APPROVED' : 'DECISION_REJECTED',
          title: isAccepted ? 'Committee Hearing & Appeal Approval' : 'Committee Hearing & Appeal Rejection',
          badgeLabel: isAccepted ? 'Appeal Approved & Qualified' : 'Appeal Rejected',
          badgeVariant: isAccepted ? 'success' : 'danger',
          timestamp: ap.decidedAt || item.timestamp,
          remarks: ap.decisionRemarks || item.remarks
        };
      }
      return item;
    });
  });
}
