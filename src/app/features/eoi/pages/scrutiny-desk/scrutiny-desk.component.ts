import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/config/api.config';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  ButtonComponent,
  IconComponent,
  StatusBadgeComponent,
  StepperComponent,
  StepperStep,
  TableColumn,
  TableComponent
} from '../../../../shared';
import { OtrReviewComponent } from '../../../registration/parts/otr-review.component';
import { OtrFormDef, OtrRecords } from '../../../registration/models/otr-api.model';
import { documentsFrom, formSteps, initialStepValues, stepFields } from '../../../registration/otr-form.util';
import { OtrRegistrationService } from '../../../registration/services/otr-registration.service';
import { EoiApplyDocument } from '../../components/scheme-form/eoi-apply.model';
import { errorText, formatBytes } from '../../components/scheme-form/eoi-apply.util';
import { DecisionSubmission, ScrutinyDecisionModalComponent } from './components/scrutiny-decision-modal.component';
import { ScrutinyReviewService } from './scrutiny-review.service';
import {
  ReviewDetail,
  activityEntries,
  answerRows,
  PROFILE_SECTIONS,
  PastApplicationRow,
  documentsZipName,
  feeSummary,
  pastApplicationRows,
  remarkPresets,
  reviewStatus,
  reviewTime,
  toGradeOptions
} from './scrutiny-desk.util';

type StepKey = 'overview' | (typeof PROFILE_SECTIONS)[number]['key'] | 'documents' | 'past-performance' | 'activity';
type DecisionModal = 'remark' | 'reject' | 'approve' | null;

/**
 * Scrutiny Desk: one submitted application, for the EOI's committee (GET /api/eoi/responses/applications/{id}).
 * Members add remarks; the approver approves (with a grade) or rejects. The backend decides who may do what
 * (`permissions`) and refuses a decision when someone else changed it meanwhile (`decisionVersion`).
 */
@Component({
  selector: 'app-scrutiny-desk',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    ButtonComponent,
    IconComponent,
    StatusBadgeComponent,
    StepperComponent,
    TableComponent,
    OtrReviewComponent,
    ScrutinyDecisionModalComponent
  ],
  template: `
    <div class="w-full min-h-screen bg-slate-50/50 text-slate-800 px-4 sm:px-6 lg:px-8 py-5 space-y-5">

      <div class="flex items-center justify-between gap-3 flex-wrap">
        <a appButton variant="outline" size="sm" [routerLink]="backLink()" title="Back to Applicant Submissions">
          <app-icon name="back" />
          <span>Back</span>
        </a>

        @if (detail(); as app) {
          <div class="flex items-center gap-2 flex-wrap">
            @if (app.permissions.canRemark) {
              <button appButton variant="outline" size="sm" type="button" [disabled]="busy()" (click)="modal.set('remark')">Remark</button>
            }
            @if (app.permissions.canDecide) {
              <button appButton variant="danger" size="sm" type="button" [disabled]="busy()" (click)="modal.set('reject')">Reject</button>
              <button appButton size="sm" type="button" [disabled]="busy()" (click)="modal.set('approve')">Approve</button>
            }
          </div>
        }
      </div>

      @if (loading()) {
        <div class="bg-white rounded-xl border border-slate-200/90 p-8 text-center text-xs text-slate-500">Loading the application...</div>
      } @else if (loadError()) {
        <div class="bg-white rounded-xl border border-rose-200 p-6 space-y-3 text-center" role="alert">
          <p class="m-0 text-sm text-rose-700">{{ loadError() }}</p>
          <button appButton variant="outline" size="sm" type="button" (click)="reload()">Try again</button>
        </div>
      } @else if (detail(); as app) {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <div class="lg:col-span-4 xl:col-span-3">
            <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 sticky top-5">
              <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 m-0">Review Sections</h2>
                <span class="text-[11px] font-semibold text-slate-400 tabular-nums">{{ activeStep() }} / {{ steps().length }}</span>
              </div>
              <app-stepper variant="vertical" [steps]="steps()" [currentStep]="activeStep()" (stepClick)="selectStep($event)" />
            </div>
          </div>

          <div class="lg:col-span-8 xl:col-span-9">
            <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 min-h-[560px]">

              <div class="mb-6">
                <div class="flex items-center gap-3 flex-wrap">
                  <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
                    {{ stepKey() === 'overview' ? applicantName() : currentStep()?.label }}
                  </h2>
                  @if (stepKey() === 'overview') {
                    <app-status-badge [variant]="status().variant">{{ status().label }}</app-status-badge>
                  }
                </div>
                <p class="text-xs sm:text-sm text-slate-500 mt-1 m-0">
                  {{ stepKey() === 'overview' ? 'Proposal under ' + app.notice.schemeName : currentStep()?.description }}
                </p>
              </div>

              @switch (stepKey()) {
                @case ('overview') {
                  <div class="space-y-5">
                    <section class="rounded-xl border border-slate-200/90 overflow-hidden" aria-labelledby="summary-heading">
                      <h3 id="summary-heading" class="m-0 px-4 sm:px-5 py-3 bg-slate-50/80 border-b border-slate-200/90 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Application Details
                      </h3>
                      <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 p-4 sm:p-5 text-xs">
                        @for (item of summary(); track item.label) {
                          <div class="min-w-0">
                            <dt class="text-[11.5px] text-slate-500 leading-tight">{{ item.label }}</dt>
                            <dd class="m-0 mt-1 text-[13px] font-semibold text-slate-900 break-words" [class.tabular-nums]="item.numeric">{{ item.value }}</dd>
                          </div>
                        }
                      </dl>
                    </section>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      @for (fee of fees(); track fee.label) {
                        <section class="rounded-xl border border-slate-200/90 p-4 sm:p-5 space-y-2">
                          <div class="flex items-center justify-between gap-3">
                            <h3 class="m-0 text-xs font-semibold text-slate-700 uppercase tracking-wider">{{ fee.label }}</h3>
                            <app-status-badge [variant]="fee.summary.variant">{{ fee.summary.status }}</app-status-badge>
                          </div>
                          <p class="m-0 text-xl font-bold text-slate-900 tabular-nums">{{ fee.summary.amount }}</p>
                          @if (fee.summary.detail) {
                            <p class="m-0 text-xs text-slate-600">{{ fee.summary.detail }}</p>
                          }
                          @if (fee.summary.reference) {
                            <p class="m-0 text-[11px] text-slate-500 tabular-nums break-all">{{ fee.summary.reference }}</p>
                          }
                        </section>
                      }
                    </div>

                    @if (app.decision; as d) {
                      <section class="rounded-xl border border-slate-200/90 p-4 sm:p-5 space-y-2" aria-labelledby="decision-heading">
                        <div class="flex items-center justify-between gap-3 flex-wrap">
                          <h3 id="decision-heading" class="text-sm font-bold text-slate-900 m-0">Committee Decision: {{ statusOf(d.status).label }}</h3>
                          <span class="text-xs text-slate-500">{{ time(d.decidedAt) }}</span>
                        </div>
                        @if (d.grade) {
                          <p class="m-0 text-xs text-slate-700">Grade: <span class="font-semibold">{{ d.grade }}</span></p>
                        }
                        @if (d.remarks) {
                          <p class="m-0 text-xs text-slate-700 leading-relaxed whitespace-pre-line">{{ d.remarks }}</p>
                        }
                      </section>
                    }

                    @if (app.clarification; as c) {
                      <section class="rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5 space-y-2" aria-labelledby="clarification-heading">
                        <div class="flex items-center justify-between gap-3 flex-wrap">
                          <h3 id="clarification-heading" class="text-sm font-bold text-amber-900 m-0">
                            Clarification {{ c.isOpen ? 'requested' : 'received' }}
                          </h3>
                          <span class="text-xs text-amber-800">
                            Requested {{ time(c.requestedAt) }}{{ c.isOpen ? ', due ' + time(c.dueAt) : ', answered ' + time(c.respondedAt) }}
                          </span>
                        </div>
                        @if (c.documents.length) {
                          <div class="flex flex-wrap items-center gap-1.5 text-xs">
                            <span class="text-[11.5px] text-amber-800">Documents asked for:</span>
                            @for (doc of c.documents; track doc) {
                              <span class="px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 text-[11px] font-medium">{{ doc }}</span>
                            }
                          </div>
                        }
                        @if (c.comment) {
                          <p class="m-0 text-xs text-amber-900 whitespace-pre-line">{{ c.comment }}</p>
                        }
                        @for (up of c.uploads; track up.documentId ?? up.name) {
                          @if (up.documentId) {
                            <button appButton variant="ghost" size="sm" type="button" (click)="viewDocument(up)">
                              <app-icon name="eye" size="sm" />
                              <span>{{ up.name }}</span>
                            </button>
                          }
                        }
                      </section>
                    }

                  </div>
                }

                @case ('organisation') {
                  <ng-container *ngTemplateOutlet="profileSection; context: { $implicit: 'organisation' }" />

                  <!-- The answers to the EOI's own questions belong to the organisation's proposal. -->
                  @if (answers().length) {
                    <section class="mt-5 rounded-lg border border-slate-200/90 overflow-hidden" aria-labelledby="answers-heading">
                      <h3 id="answers-heading" class="m-0 px-4 py-2.5 bg-slate-50 border-b border-slate-200/90 text-[13px] font-semibold text-slate-700">
                        Scheme Proposal Details
                      </h3>
                      <dl class="m-0 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 p-4">
                        @for (row of answers(); track row.key) {
                          <div class="min-w-0">
                            <dt class="text-[11.5px] font-medium text-slate-500">{{ row.label }}</dt>
                            <dd class="m-0 text-[13px] text-slate-900 whitespace-pre-line break-words">{{ row.value }}</dd>
                          </div>
                        }
                      </dl>
                    </section>
                  }
                }

                @case ('authorized-person') {
                  <ng-container *ngTemplateOutlet="profileSection; context: { $implicit: 'authorized-person' }" />
                }

                @case ('bank-details') {
                  <ng-container *ngTemplateOutlet="profileSection; context: { $implicit: 'bank-details' }" />
                }

                @case ('past-performance') {
                  @if (pastApplications().length === 0) {
                    <p class="m-0 text-xs text-slate-500">This organisation has no earlier EOI applications.</p>
                  } @else {
                    <app-table [columns]="pastColumns" [data]="pastApplications()" [customTemplates]="{ application: pastAppTemplate, status: pastStatusTemplate }" />

                    <ng-template #pastAppTemplate let-row>
                      <span class="block text-xs text-slate-800">{{ row.schemeName }}</span>
                      <span class="block text-[11px] text-slate-500 tabular-nums">{{ row.eoiRefNo }} &middot; {{ row.applicationNo }}</span>
                    </ng-template>

                    <ng-template #pastStatusTemplate let-row>
                      <app-status-badge [variant]="row.statusVariant">{{ row.statusLabel }}</app-status-badge>
                    </ng-template>
                  }
                }

                @case ('documents') {
                  <div class="flex items-center justify-end mb-3">
                    <button
                      appButton
                      variant="outline"
                      size="sm"
                      type="button"
                      [disabled]="downloadingZip() || uploadedCount() === 0"
                      (click)="downloadAll()"
                      title="Download all uploaded documents as a ZIP file"
                    >
                      <app-icon name="download" size="sm" />
                      <span>{{ downloadingZip() ? 'Preparing ZIP...' : 'Download All (ZIP)' }}</span>
                    </button>
                  </div>
                  <app-table [columns]="documentColumns" [data]="app.documents" [customTemplates]="{ file: fileTemplate, comment: commentTemplate, view: viewTemplate }" />

                  <ng-template #fileTemplate let-doc>
                    @if (doc.file) {
                      <span class="text-xs text-slate-800 break-all">{{ doc.file.fileName }}</span>
                      <span class="block text-[11px] text-slate-500">{{ size(doc.file.sizeBytes) }}</span>
                    } @else {
                      <span class="text-xs text-slate-400">Not uploaded</span>
                    }
                  </ng-template>

                  <ng-template #commentTemplate let-doc>
                    @if (doc.comment) {
                      <span class="text-xs text-slate-800 whitespace-pre-wrap break-words block max-w-[320px]">{{ doc.comment }}</span>
                    } @else {
                      <span class="text-slate-400 text-xs">-</span>
                    }
                  </ng-template>

                  <ng-template #viewTemplate let-doc>
                    @if (doc.documentId) {
                      <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="viewDocument(doc)" title="View document" aria-label="View document">
                        <app-icon name="eye" size="sm" />
                      </button>
                    }
                  </ng-template>
                }

                @case ('activity') {
                  @if (activity().length === 0) {
                    <p class="m-0 text-xs text-slate-500">Nothing has been recorded on this application yet.</p>
                  } @else {
                    <ul class="m-0 p-0 list-none space-y-3">
                      @for (entry of activity(); track entry.id) {
                        <li class="border border-slate-200 rounded-lg p-3.5 text-xs">
                          <div class="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <span class="font-semibold text-slate-900 text-[12.5px]">{{ entry.title }}</span>
                              <span class="block text-[11px] text-slate-500 mt-0.5">{{ entry.actor }}</span>
                            </div>
                            <span class="text-[11px] text-slate-500 shrink-0">{{ entry.when }}</span>
                          </div>
                          @if (entry.grade) {
                            <p class="m-0 mt-2 text-slate-700">Grade: <span class="font-semibold">{{ entry.grade }}</span></p>
                          }
                          @if (entry.documents.length) {
                            <p class="m-0 mt-2 text-slate-700">
                              Documents: {{ entry.documents.join(', ') }}@if (entry.dueDays) {<span> (respond within {{ entry.dueDays }} days)</span>}
                            </p>
                          }
                          @if (entry.remark) {
                            <p class="m-0 mt-2 text-slate-700 leading-relaxed whitespace-pre-line">{{ entry.remark }}</p>
                          }
                        </li>
                      }
                    </ul>
                  }
                }
              }
            </div>
          </div>
        </div>
      }
    </div>

    <ng-template #profileSection let-stepKey>
      @if (otrForm(); as form) {
        <app-otr-review
          [form]="form"
          [values]="profileValues()"
          [documents]="profileDocuments()"
          [stepKeys]="[stepKey]"
          [showStepTitle]="false"
          [readOnly]="true"
          (viewDocument)="viewOtrDocument($event)"
        />
      } @else if (otrFormLoading()) {
        <p class="text-xs text-slate-500 m-0">Loading the registration details...</p>
      } @else {
        <div class="space-y-3" role="alert">
          <p class="text-xs text-slate-500 m-0">The registration form could not be loaded, so these details cannot be shown.</p>
          <button appButton variant="outline" size="sm" type="button" (click)="retryOtrForm()">Try again</button>
        </div>
      }
    </ng-template>

    @if (modal(); as mode) {
      <app-scrutiny-decision-modal
        [mode]="mode"
        [applicantLabel]="applicantName()"
        [grades]="grades()"
        [presets]="presets()"
        (confirmed)="confirm(mode, $event)"
        (close)="modal.set(null)"
      />
    }
  `
})
export class ScrutinyDeskComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ScrutinyReviewService);
  private readonly otrApi = inject(OtrRegistrationService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly detail = signal<ReviewDetail | null>(null);
  readonly otrForm = signal<OtrFormDef | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly busy = signal(false);
  readonly modal = signal<DecisionModal>(null);
  readonly activeStep = signal(1);

  readonly otrFormLoading = signal(false);
  readonly downloadingZip = signal(false);

  private applicationId = 0;

  readonly backLink = computed(() => {
    const eoiId = this.detail()?.notice.eoiId;
    return eoiId ? ['/admin/responses', eoiId] : ['/admin/eoi-view'];
  });

  readonly status = computed(() => reviewStatus(this.detail()?.status ?? ''));
  readonly answers = computed(() => answerRows(this.detail()?.customFields ?? null, this.detail()?.dynamicAnswers ?? null));
  readonly activity = computed(() => activityEntries(this.detail()?.activity ?? []));
  /** The organisation's name; the anonymous label only when the backend has no name. */
  readonly applicantName = computed(() => {
    const app = this.detail();
    return app?.organisationName?.trim() || app?.anonymousLabel || '';
  });
  readonly uploadedCount = computed(() => (this.detail()?.documents ?? []).filter(d => !!d.file).length);
  readonly grades = computed(() => toGradeOptions(this.detail()?.grades ?? []));
  readonly presets = computed(() => remarkPresets(this.detail()?.remarkOptions ?? []));

  readonly pastApplications = computed(() => pastApplicationRows(this.detail()?.pastApplications));

  private readonly stepDefs = computed<{ key: StepKey; step: StepperStep }[]>(() => {
    const files = this.uploadedCount();
    const past = this.pastApplications().length;
    return [
      { key: 'overview', step: { label: 'Overview', description: 'Application summary & fees' } },
      ...PROFILE_SECTIONS.map(s => ({ key: s.key as StepKey, step: { label: s.label, description: s.description } })),
      { key: 'documents', step: { label: 'Uploaded Documents', description: `${files} proposal ${files === 1 ? 'file' : 'files'}` } },
      { key: 'past-performance', step: { label: 'Past Performance', description: `${past} scheme ${past === 1 ? 'engagement' : 'engagements'}` } },
      { key: 'activity', step: { label: 'Department Remarks', description: 'Officer notes & audit timeline' } }
    ];
  });

  readonly steps = computed(() => this.stepDefs().map(d => d.step));
  readonly stepKey = computed<StepKey>(() => this.stepDefs()[this.activeStep() - 1]?.key ?? 'overview');
  readonly currentStep = computed<StepperStep | undefined>(() => this.stepDefs()[this.activeStep() - 1]?.step);

  readonly summary = computed(() => {
    const app = this.detail();
    if (!app) return [];
    return [
      { label: 'Application No.', value: app.applicationNo, numeric: true },
      { label: 'Submitted On', value: reviewTime(app.submittedAt), numeric: true },
      { label: 'OTR Reference No.', value: app.otrReferenceNo || '-', numeric: true },
      { label: 'EOI Reference No.', value: app.notice.refNo, numeric: true },
      { label: 'Scheme', value: app.notice.schemeName, numeric: false },
      { label: 'Documents Uploaded', value: `${this.uploadedCount()} of ${app.documents.length}`, numeric: true }
    ];
  });

  readonly fees = computed(() => {
    const app = this.detail();
    if (!app) return [];
    return [
      { label: 'Processing Fee', summary: feeSummary(app.processFee) },
      { label: 'EMD', summary: feeSummary(app.emd) }
    ];
  });

  readonly profileValues = computed(() => {
    const form = this.otrForm();
    const records = (this.detail()?.profile ?? {}) as OtrRecords;
    if (!form) return {};
    return Object.fromEntries(formSteps(form).map(step => [step.key, initialStepValues(step, records[step.key])]));
  });

  readonly profileDocuments = computed(() => {
    const form = this.otrForm();
    return form ? documentsFrom(form, (this.detail()?.profile ?? {}) as OtrRecords) : {};
  });

  protected readonly documentColumns: TableColumn<EoiApplyDocument>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-10' },
    { key: 'name', label: 'Document' },
    { key: 'file', label: 'File', type: 'custom' },
    { key: 'comment', label: 'Applicant Comment', type: 'custom' },
    { key: 'view', label: 'Action', type: 'custom', align: 'center', width: 'w-24' }
  ];

  protected readonly pastColumns: TableColumn<PastApplicationRow>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-10' },
    { key: 'application', label: 'Scheme / EOI', type: 'custom' },
    { key: 'submittedOn', label: 'Submitted On', cellClass: 'whitespace-nowrap tabular-nums' },
    { key: 'status', label: 'Outcome', type: 'custom', align: 'center' },
    { key: 'grade', label: 'Grade', align: 'center' },
    { key: 'decidedOn', label: 'Decided On', cellClass: 'whitespace-nowrap tabular-nums' }
  ];

  constructor() {
    this.route.params.pipe(takeUntilDestroyed()).subscribe(params => {
      const id = Number(params['applicationId']);
      if (Number.isInteger(id) && id > 0) {
        this.applicationId = id;
        this.reload();
      } else {
        this.loading.set(false);
        this.loadError.set('This application link is not valid. Open the application from Applicant Submissions.');
      }
    });
  }

  reload(): void {
    if (!this.applicationId) return;
    this.loading.set(true);
    this.loadError.set('');
    this.activeStep.set(1);
    this.loadOtrForm();
    this.api
      .get(this.applicationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: app => {
          this.detail.set(app);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.detail.set(null);
          this.loading.set(false);
          this.loadError.set(errorText(error, 'The application could not be opened. Please try again.'));
        }
      });
  }

  selectStep(step: number): void {
    this.activeStep.set(step);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected statusOf(status: string) {
    return reviewStatus(status);
  }

  protected time(value: string | null | undefined): string {
    return reviewTime(value);
  }

  protected size(bytes: number): string {
    return formatBytes(bytes);
  }

  confirm(mode: Exclude<DecisionModal, null>, submission: DecisionSubmission): void {
    const app = this.detail();
    if (!app || this.busy()) return;
    const remark = submission.remark.trim();
    let call: Observable<ReviewDetail>;
    let done: string;
    if (mode === 'remark') {
      call = this.api.addRemark(app.id, remark);
      done = 'Your remark has been recorded.';
    } else if (mode === 'reject') {
      call = this.api.reject(app.id, remark, app.decisionVersion);
      done = `${this.applicantName()} has been rejected.`;
    } else {
      call = this.api.approve(app.id, submission.grade ?? '', remark, app.decisionVersion);
      done = `${this.applicantName()} has been approved${submission.grade ? ` (${submission.grade})` : ''}.`;
    }
    this.busy.set(true);
    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => {
        this.detail.set(updated);
        this.busy.set(false);
        this.modal.set(null);
        this.notifications.success(done);
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.notifications.error(errorText(error, 'The action could not be saved. Please try again.'));
      }
    });
  }

  viewDocument(doc: EoiApplyDocument): void {
    const app = this.detail();
    if (!app || !doc.documentId) return;
    this.openBlob(this.api.documentBlob(app.id, doc.documentId));
  }

  /** "Download All": the backend zips every uploaded file of the application. */
  downloadAll(): void {
    const app = this.detail();
    if (!app || this.downloadingZip()) return;
    this.downloadingZip.set(true);
    this.api
      .documentsZip(app.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.downloadingZip.set(false);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = documentsZipName(app.applicationNo);
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: (error: unknown) => {
          this.downloadingZip.set(false);
          this.notifications.error(errorText(error, 'The documents could not be downloaded. Please try again.'));
        }
      });
  }

  /** An OTR document from the profile step: the field's documentType names it on the backend. */
  viewOtrDocument(fieldKey: string): void {
    const app = this.detail();
    const form = this.otrForm();
    const field = form ? formSteps(form).flatMap(stepFields).find(f => f.key === fieldKey) : undefined;
    if (!app || !field?.documentType) return;
    this.openBlob(this.api.otrDocumentBlob(app.id, field.documentType));
  }

  retryOtrForm(): void {
    this.loadOtrForm();
  }

  private loadOtrForm(): void {
    if (this.otrForm() || this.otrFormLoading()) return;
    this.otrFormLoading.set(true);
    // The committee's copy of the form definition; the OTR one is the fallback (it needs the OtrRegistrations permission).
    this.otrApi
      .loadForm(API_ENDPOINTS.EOI_RESPONSES.OTR_FORM)
      .pipe(
        catchError(() => this.otrApi.loadForm()),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(form => {
        this.otrForm.set(form);
        this.otrFormLoading.set(false);
      });
  }

  private openBlob(blob$: Observable<Blob>): void {
    blob$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (error: unknown) => this.notifications.error(errorText(error, 'The document could not be opened.'))
    });
  }
}
